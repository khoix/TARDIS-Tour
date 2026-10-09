/**
 * `window.__tardis`: a read-mostly hook for E2E tests (EXECUTION-PLAN decision 8). Installed in
 * development builds, or in any build when the URL carries `?test`. Tests use `screenPointOf`
 * to click real canvas pixels, so selection still goes through real raycasting.
 */

import type { EdgeKind, RegionId } from '../data/types';
import type { Route } from '../systems/navigation/routes';
import type { VisibilitySnapshot } from '../systems/visibility/manager';
import type { ResearchSettings } from '../ui/researchPanel';
import type { CameraState, Viewer } from './viewer';

/** The planned route as plain data (Execution 7). */
export interface RouteSnapshot {
  readonly from: string;
  readonly to: string;
  readonly allowPortal: boolean;
  readonly rooms: readonly string[];
  readonly connections: readonly string[];
  readonly kinds: readonly EdgeKind[];
  /** Walk-line length in NU. */
  readonly length: number;
}

/** App state outside the viewer that the hook reports. */
export interface HookSources {
  route(): Route | null;
  research(): ResearchSettings;
}

export interface TardisTestHook {
  /** True once the first frame with the full topology has rendered. */
  readonly ready: boolean;
  /** True once the lazily loaded hero rooms (Execution 5) are in the scene. */
  readonly heroReady: boolean;
  camera(): CameraState;
  /** True while a focus/reset camera transition runs or the wall cut has yet to follow it. */
  animating(): boolean;
  screenPointOf(id: string): { x: number; y: number } | null;
  /** Room a click at this client-space point would select, or null for empty space. */
  roomAt(x: number, y: number): string | null;
  selection(): string | null;
  visibleRooms(): string[];
  /** Rooms a click can select: not hidden, ghosted or wholly above the section (Execution 6). */
  pickableRooms(): string[];
  /** Cutaway settings, focus-mode room, isolated rooms and the cut's camera direction. */
  visibility(): VisibilitySnapshot;
  renderStats(): { frames: number; calls: number; triangles: number };
  /** The route on show, or null (Execution 7). */
  route(): RouteSnapshot | null;
  /** Connections whose drawn meshes the route layer highlights, sorted (Execution 7). */
  routeHighlight(): string[];
  /** Evidence overlay on/off and the label mode (Execution 7). */
  research(): ResearchSettings;
  select(id: string | null): void;
  focusRoom(id: string): void;
  focusRegion(region: RegionId): void;
  resetView(): void;
}

declare global {
  interface Window {
    __tardis?: TardisTestHook;
  }
}

export function testHookEnabled(search: string, dev: boolean): boolean {
  return dev || new URLSearchParams(search).has('test');
}

export function routeSnapshot(route: Route | null): RouteSnapshot | null {
  if (!route) return null;
  return {
    from: route.from,
    to: route.to,
    allowPortal: route.allowPortal,
    rooms: route.rooms,
    connections: route.connections,
    kinds: route.steps.map((s) => s.kind),
    length: route.length,
  };
}

export function installTestHook(viewer: Viewer, app: HookSources): TardisTestHook {
  const hook: TardisTestHook = {
    get ready() {
      return viewer.renderStats().frames > 0;
    },
    get heroReady() {
      return viewer.dressings() > 0;
    },
    camera: () => viewer.cameraState(),
    animating: () => viewer.isAnimating(),
    screenPointOf: (id) => viewer.screenPointOf(id),
    roomAt: (x, y) => viewer.roomAt(x, y),
    selection: () => viewer.selection(),
    visibleRooms: () => viewer.visibleRooms(),
    pickableRooms: () => viewer.pickableRooms(),
    visibility: () => viewer.visual.snapshot(),
    renderStats: () => viewer.renderStats(),
    route: () => routeSnapshot(app.route()),
    routeHighlight: () =>
      viewer.visual
        .layerTargets('route')
        .filter((key) => key.startsWith('connection:'))
        .map((key) => key.slice('connection:'.length)),
    research: () => app.research(),
    select: (id) => viewer.select(id),
    focusRoom: (id) => viewer.focusRoom(id),
    focusRegion: (region) => viewer.focusRegion(region),
    resetView: () => viewer.resetView(),
  };
  window.__tardis = hook;
  return hook;
}
