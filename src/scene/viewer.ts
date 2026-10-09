/**
 * Isometric viewer: renderer, orthographic camera, orbit/pan/zoom controls, raycast
 * selection, tap/double-tap focus and on-demand rendering. What meshes look like, and which
 * hits count, is the visual-state manager's (src/systems/visibility).
 */

import {
  Color,
  DirectionalLight,
  HemisphereLight,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Vec3 } from '../data/layout';
import type { RegionId } from '../data/types';
import {
  anglesOf,
  CAMERA_DISTANCE_NU,
  cameraPosition,
  type CameraPose,
  framePose,
  lerpPose,
  MAX_ZOOM,
  MIN_ZOOM,
  orthoFrustum,
} from './camera/isometric';
import { horizontalView, Throttle, VIEW_THROTTLE_MS } from '../systems/visibility/cutaway';
import type { VisualState } from '../systems/visibility/manager';
import type { BuiltDressing } from '../world/build';
import type { MeshTag } from '../world/structure';
import type { PrototypeScene } from './prototypeScene';

/** Pointer travel (CSS px) below which a press counts as a tap rather than a drag. */
const TAP_SLOP_PX = 6;
const TAP_MAX_MS = 500;
const DOUBLE_TAP_MS = 400;
const DOUBLE_TAP_SLOP_PX = 24;
const FOCUS_ANIMATION_MS = 450;
/** Ambient motion (rotor rings) redraws at most this often; interaction renders are immediate. */
const AMBIENT_FRAME_MS = 66;
const FOCUS_MARGIN = 0.25;
const REGION_MARGIN = 0.12;
const OVERVIEW_MARGIN = 0.06;
/** Pitch limits keep the view looking down, never below the horizon or straight down. */
const MIN_PITCH_DEG = 10;
const MAX_PITCH_DEG = 85;

export interface CameraState {
  readonly target: Vec3;
  readonly position: Vec3;
  readonly zoom: number;
  readonly yawDeg: number;
  readonly pitchDeg: number;
}

export interface Viewer {
  readonly canvas: HTMLCanvasElement;
  /** Cutaway, isolation, selection and (Ex7) overlay/route layers of every world mesh. */
  readonly visual: VisualState;
  select(id: string | null): void;
  selection(): string | null;
  focusRoom(id: string): void;
  focusRegion(region: RegionId): void;
  resetView(): void;
  cameraState(): CameraState;
  /** True while a camera transition runs or the wall cut has yet to follow the camera. */
  isAnimating(): boolean;
  /** Room whose mesh a click at this client-space point would hit first, if any. */
  roomAt(clientX: number, clientY: number): string | null;
  /** Client-space point where a canvas click hits `id` first, or null if none is exposed. */
  screenPointOf(id: string): { x: number; y: number } | null;
  /** Rooms with drawn geometry (ghosts count) below the section. */
  visibleRooms(): string[];
  /** Rooms that may take a click: not hidden, ghosted or wholly above the section. */
  pickableRooms(): string[];
  renderStats(): { frames: number; calls: number; triangles: number };
  onSelectionChange(listener: (id: string | null) => void): void;
  /** Resolves once the first frame has rendered. */
  firstFrame(): Promise<void>;
  /** Adds lazily loaded room detail; selection, picking and the highlight include it. */
  addDressing(dressing: BuiltDressing): void;
  /** Number of dressings added so far. */
  dressings(): number;
}

function toVec3(v: Vector3): Vec3 {
  return [v.x, v.y, v.z];
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function createViewer(
  host: HTMLElement,
  world: PrototypeScene,
  visual: VisualState,
): Viewer {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(new Color(0x0b1418));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', 'Isometric 3D view of the reconstructed interior');
  canvas.setAttribute('role', 'img');
  host.append(canvas);

  const labels = new CSS2DRenderer();
  labels.domElement.className = 'label-layer';
  host.append(labels.domElement);

  const scene = new Scene();
  scene.add(new HemisphereLight(0xcfe6ff, 0x1b2226, 1.6));
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(40, 80, 60);
  scene.add(key);
  scene.add(world.root);

  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, CAMERA_DISTANCE_NU * 2.5);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minZoom = MIN_ZOOM;
  controls.maxZoom = MAX_ZOOM;
  controls.minPolarAngle = ((90 - MAX_PITCH_DEG) * Math.PI) / 180;
  controls.maxPolarAngle = ((90 - MIN_PITCH_DEG) * Math.PI) / 180;

  let aspect = 1;
  let needsRender = true;
  let frames = 0;
  let lastAmbient = -Infinity;
  let animation: { from: CameraPose; to: CameraPose; start: number } | null = null;
  let selected: string | null = null;
  const listeners: ((id: string | null) => void)[] = [];
  const pickables = [...world.roomParts.values()].flat();
  let dressings = 0;
  let resolveFirstFrame: () => void = () => undefined;
  const firstFrame = new Promise<void>((resolve) => {
    resolveFirstFrame = resolve;
  });
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const raycaster = new Raycaster();
  // The camera-facing wall cut follows the camera at most every VIEW_THROTTLE_MS.
  const viewThrottle = new Throttle(VIEW_THROTTLE_MS);
  let viewPending = false;

  const requestRender = () => {
    needsRender = true;
  };
  controls.addEventListener('change', () => {
    viewPending = true;
    requestRender();
  });
  visual.onChange(requestRender);

  function updateView() {
    const offset = camera.position.clone().sub(controls.target);
    visual.setView(horizontalView(toVec3(offset)));
    viewPending = false;
    requestRender();
  }

  function currentPose(): CameraPose {
    const offset = camera.position.clone().sub(controls.target);
    const { yawDeg, pitchDeg } = anglesOf(toVec3(offset));
    return { target: toVec3(controls.target), yawDeg, pitchDeg, zoom: camera.zoom };
  }

  function applyPose(pose: CameraPose) {
    controls.target.set(...pose.target);
    camera.position.set(...cameraPosition(pose));
    camera.zoom = pose.zoom;
    camera.updateProjectionMatrix();
    controls.update();
    requestRender();
  }

  function goTo(pose: CameraPose) {
    if (prefersReducedMotion()) {
      animation = null;
      applyPose(pose);
      return;
    }
    animation = { from: currentPose(), to: pose, start: performance.now() };
    requestRender();
  }

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    aspect = width / height;
    const f = orthoFrustum(aspect);
    camera.left = f.left;
    camera.right = f.right;
    camera.top = f.top;
    camera.bottom = f.bottom;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labels.setSize(width, height);
    requestRender();
  }

  function overviewPose(): CameraPose {
    return framePose(world.overview, aspect, OVERVIEW_MARGIN);
  }

  function pickAt(clientX: number, clientY: number): string | null {
    const rect = canvas.getBoundingClientRect();
    const ndc = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = visual.pick(raycaster.intersectObjects(pickables, false));
    return hit ? (hit.object.userData as MeshTag).id : null;
  }

  function select(id: string | null) {
    if (id !== null && !world.roomParts.has(id)) throw new Error(`Unknown room ${id}`);
    if (id === selected) return;
    selected = id;
    visual.setSelection(selected);
    for (const listener of listeners) listener(selected);
  }

  function focusRoom(id: string) {
    const b = world.roomBounds.get(id);
    if (!b) throw new Error(`Unknown room ${id}`);
    select(id);
    const { yawDeg, pitchDeg } = currentPose();
    goTo(framePose(b, aspect, FOCUS_MARGIN, yawDeg, pitchDeg));
  }

  // Tap / double-tap handling shared by mouse and touch. Drags and multi-touch belong to controls.
  const active = new Map<number, { x: number; y: number; t: number }>();
  let gestureHadMultiplePointers = false;
  let lastTap: { x: number; y: number; t: number; id: string | null } | null = null;

  canvas.addEventListener('pointerdown', (e) => {
    animation = null;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    active.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    if (active.size > 1) gestureHadMultiplePointers = true;
  });
  const endPointer = (e: PointerEvent, cancelled: boolean) => {
    const start = active.get(e.pointerId);
    active.delete(e.pointerId);
    const wasMulti = gestureHadMultiplePointers;
    if (active.size === 0) gestureHadMultiplePointers = false;
    if (!start || cancelled || wasMulti) return;
    const now = performance.now();
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_SLOP_PX) return;
    if (now - start.t > TAP_MAX_MS) return;
    const id = pickAt(e.clientX, e.clientY);
    const isDouble =
      lastTap !== null &&
      now - lastTap.t < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < DOUBLE_TAP_SLOP_PX &&
      lastTap.id === id;
    if (isDouble && id !== null) {
      focusRoom(id);
      lastTap = null;
    } else {
      select(id);
      lastTap = { x: e.clientX, y: e.clientY, t: now, id };
    }
  };
  canvas.addEventListener('pointerup', (e) => endPointer(e, false));
  canvas.addEventListener('pointercancel', (e) => endPointer(e, true));

  new ResizeObserver(resize).observe(host);
  resize();
  applyPose(overviewPose());
  updateView();

  function loop(now: number) {
    // Ambient motion (rotor rings) pauses entirely under prefers-reduced-motion, and while
    // a gesture or camera transition is running so interaction renders get the frame budget.
    const interacting = active.size > 0 || animation !== null;
    if (!reducedMotion?.matches && !interacting && now - lastAmbient >= AMBIENT_FRAME_MS) {
      lastAmbient = now;
      if (world.tick(now)) requestRender();
    }
    if (animation) {
      const t = Math.min(1, (now - animation.start) / FOCUS_ANIMATION_MS);
      const eased = 1 - (1 - t) ** 3;
      applyPose(lerpPose(animation.from, animation.to, eased));
      if (t >= 1) animation = null;
    }
    if (viewPending && viewThrottle.ready(now)) updateView();
    if (needsRender) {
      needsRender = false;
      renderer.render(scene, camera);
      labels.render(scene, camera);
      frames++;
      if (frames === 1) resolveFirstFrame();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    canvas,
    visual,
    select,
    selection: () => selected,
    focusRoom,
    focusRegion(region) {
      const b = world.regionBounds.get(region);
      if (!b) throw new Error(`No placed rooms in region ${region}`);
      goTo(framePose(b, aspect, REGION_MARGIN));
    },
    resetView() {
      goTo(overviewPose());
    },
    cameraState() {
      const pose = currentPose();
      return {
        target: pose.target,
        position: toVec3(camera.position),
        zoom: pose.zoom,
        yawDeg: pose.yawDeg,
        pitchDeg: pose.pitchDeg,
      };
    },
    isAnimating: () => animation !== null || viewPending,
    roomAt: pickAt,
    screenPointOf(id) {
      const b = world.roomBounds.get(id);
      if (!b || !visual.roomPickable(id)) return null;
      // Sample only what lies below the section clip.
      const top = Math.min(b.max[1], visual.settings().sectionY ?? Infinity);
      const rect = canvas.getBoundingClientRect();
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const x of [b.min[0], b.max[0]]) {
        for (const y of [b.min[1], top]) {
          for (const z of [b.min[2], b.max[2]]) {
            const p = new Vector3(x, y, z).project(camera);
            const sx = rect.left + ((p.x + 1) / 2) * rect.width;
            const sy = rect.top + ((1 - p.y) / 2) * rect.height;
            minX = Math.min(minX, sx);
            maxX = Math.max(maxX, sx);
            minY = Math.min(minY, sy);
            maxY = Math.max(maxY, sy);
          }
        }
      }
      // Sample the projected footprint from its centre outwards; return the first point
      // that is on-canvas, not covered by UI, and whose ray hits this room first.
      const steps = 9;
      const candidates: { x: number; y: number; r: number }[] = [];
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      for (let i = 0; i <= steps; i++) {
        for (let j = 0; j <= steps; j++) {
          const x = minX + ((maxX - minX) * i) / steps;
          const y = minY + ((maxY - minY) * j) / steps;
          candidates.push({ x, y, r: Math.hypot(x - cx, y - cy) });
        }
      }
      candidates.sort((p, q) => p.r - q.r);
      for (const { x, y } of candidates) {
        if (x < rect.left + 1 || x > rect.right - 1 || y < rect.top + 1 || y > rect.bottom - 1) {
          continue;
        }
        if (document.elementFromPoint(x, y) !== canvas) continue;
        if (pickAt(x, y) === id) return { x, y };
      }
      return null;
    },
    visibleRooms: () => [...world.roomParts.keys()].filter((id) => visual.roomVisible(id)),
    pickableRooms: () => [...world.roomParts.keys()].filter((id) => visual.roomPickable(id)),
    renderStats: () => ({
      frames,
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    }),
    onSelectionChange(listener) {
      listeners.push(listener);
    },
    firstFrame: () => firstFrame,
    addDressing(dressing) {
      pickables.push(...world.attach(dressing));
      visual.register(dressing.root);
      dressings++;
      requestRender();
    },
    dressings: () => dressings,
  };
}
