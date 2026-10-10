/**
 * Pure orthographic-isometric camera math (no Three.js objects), so reset, fit and
 * resize behaviour are unit-testable without WebGL.
 */

import type { Vec3 } from '../../data/layout';

/** Conventional isometric pitch: atan(1 / sqrt(2)) ≈ 35.264°. */
export const ISO_PITCH_DEG = (Math.atan(1 / Math.SQRT2) * 180) / Math.PI;
export const ISO_YAW_DEG = 45;
/** World-space height of the frustum at zoom 1. */
export const VIEW_HEIGHT_NU = 120;
/** Distance from target to camera along the view direction (orthographic, so only clipping cares). */
export const CAMERA_DISTANCE_NU = 400;
export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 12;

export interface Bounds {
  readonly min: Vec3;
  readonly max: Vec3;
}

export interface CameraPose {
  readonly target: Vec3;
  readonly yawDeg: number;
  readonly pitchDeg: number;
  readonly zoom: number;
}

export interface Frustum {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

const DEG = Math.PI / 180;

/** Unit vector from target towards the camera for a yaw (about +Y, from +Z) and downward pitch. */
export function viewDirection(yawDeg: number, pitchDeg: number): Vec3 {
  const yaw = yawDeg * DEG;
  const pitch = pitchDeg * DEG;
  return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
}

/** Inverse of {@link viewDirection}: yaw/pitch of a camera offset (position − target). */
export function anglesOf(offset: Vec3): { yawDeg: number; pitchDeg: number } {
  const [x, y, z] = offset;
  const horizontal = Math.hypot(x, z);
  return {
    yawDeg: (Math.atan2(x, z) / DEG + 360) % 360,
    pitchDeg: Math.atan2(y, horizontal) / DEG,
  };
}

export function cameraPosition(pose: CameraPose, distance = CAMERA_DISTANCE_NU): Vec3 {
  const d = viewDirection(pose.yawDeg, pose.pitchDeg);
  const [tx, ty, tz] = pose.target;
  return [tx + d[0] * distance, ty + d[1] * distance, tz + d[2] * distance];
}

/** Frustum at zoom 1 for a viewport aspect (width / height); height stays fixed on resize. */
export function orthoFrustum(aspect: number, viewHeight = VIEW_HEIGHT_NU): Frustum {
  const halfH = viewHeight / 2;
  const halfW = halfH * aspect;
  return { left: -halfW, right: halfW, top: halfH, bottom: -halfH };
}

export function boundsCenter(b: Bounds): Vec3 {
  return [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
}

export function unionBounds(list: readonly Bounds[]): Bounds {
  if (list.length === 0) throw new Error('unionBounds needs at least one bounds');
  return {
    min: [
      Math.min(...list.map((b) => b.min[0])),
      Math.min(...list.map((b) => b.min[1])),
      Math.min(...list.map((b) => b.min[2])),
    ],
    max: [
      Math.max(...list.map((b) => b.max[0])),
      Math.max(...list.map((b) => b.max[1])),
      Math.max(...list.map((b) => b.max[2])),
    ],
  };
}

/** Screen-plane basis (right, up) for a view direction pointing from target to camera. */
function screenBasis(yawDeg: number, pitchDeg: number): { right: Vec3; up: Vec3 } {
  const yaw = yawDeg * DEG;
  const pitch = pitchDeg * DEG;
  const right: Vec3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const up: Vec3 = [
    -Math.sin(yaw) * Math.sin(pitch),
    Math.cos(pitch),
    -Math.cos(yaw) * Math.sin(pitch),
  ];
  return { right, up };
}

/**
 * Zoom at which `bounds` (centred on the target) fits inside the frustum for the given view,
 * leaving `margin` (fraction of the viewport) free on each axis. Clamped to [MIN_ZOOM, MAX_ZOOM].
 */
export function fitZoom(
  bounds: Bounds,
  yawDeg: number,
  pitchDeg: number,
  aspect: number,
  margin = 0.1,
  viewHeight = VIEW_HEIGHT_NU,
): number {
  const { right, up } = screenBasis(yawDeg, pitchDeg);
  const c = boundsCenter(bounds);
  let halfW = 0;
  let halfH = 0;
  for (const x of [bounds.min[0], bounds.max[0]]) {
    for (const y of [bounds.min[1], bounds.max[1]]) {
      for (const z of [bounds.min[2], bounds.max[2]]) {
        const v: Vec3 = [x - c[0], y - c[1], z - c[2]];
        halfW = Math.max(halfW, Math.abs(v[0] * right[0] + v[1] * right[1] + v[2] * right[2]));
        halfH = Math.max(halfH, Math.abs(v[0] * up[0] + v[1] * up[1] + v[2] * up[2]));
      }
    }
  }
  const f = orthoFrustum(aspect, viewHeight);
  const usable = 1 - 2 * margin;
  const zoomW = halfW > 0 ? (f.right * usable) / halfW : MAX_ZOOM;
  const zoomH = halfH > 0 ? (f.top * usable) / halfH : MAX_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(zoomW, zoomH)));
}

/**
 * Pose framing `bounds` from the given view angles (isometric by default): the home/reset
 * view, and the room/region focus view when called with the current angles.
 */
export function framePose(
  bounds: Bounds,
  aspect: number,
  margin = 0.1,
  yawDeg = ISO_YAW_DEG,
  pitchDeg = ISO_PITCH_DEG,
): CameraPose {
  return {
    target: boundsCenter(bounds),
    yawDeg,
    pitchDeg,
    zoom: fitZoom(bounds, yawDeg, pitchDeg, aspect, margin),
  };
}

/** Interpolates two poses at t ∈ [0, 1], turning yaw the short way round. */
export function lerpPose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  const mix = (x: number, y: number) => x + (y - x) * t;
  const dYaw = ((((b.yawDeg - a.yawDeg) % 360) + 540) % 360) - 180;
  return {
    target: [
      mix(a.target[0], b.target[0]),
      mix(a.target[1], b.target[1]),
      mix(a.target[2], b.target[2]),
    ],
    yawDeg: (a.yawDeg + dYaw * t + 360) % 360,
    pitchDeg: mix(a.pitchDeg, b.pitchDeg),
    zoom: mix(a.zoom, b.zoom),
  };
}
