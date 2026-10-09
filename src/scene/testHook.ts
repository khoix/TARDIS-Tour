/**
 * `window.__tardis`: a read-mostly hook for E2E tests (EXECUTION-PLAN decision 8). Installed in
 * development builds, or in any build when the URL carries `?test`. Tests use `screenPointOf`
 * to click real canvas pixels, so selection still goes through real raycasting.
 */

import type { RegionId } from '../data/types';
import type { CameraState, Viewer } from './viewer';

export interface TardisTestHook {
  /** True once the first frame with the full topology has rendered. */
  readonly ready: boolean;
  /** True once the lazily loaded hero rooms (Execution 5) are in the scene. */
  readonly heroReady: boolean;
  camera(): CameraState;
  /** True while a focus/reset camera transition is running. */
  animating(): boolean;
  screenPointOf(id: string): { x: number; y: number } | null;
  /** Room a click at this client-space point would select, or null for empty space. */
  roomAt(x: number, y: number): string | null;
  selection(): string | null;
  visibleRooms(): string[];
  renderStats(): { frames: number; calls: number; triangles: number };
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

export function installTestHook(viewer: Viewer): TardisTestHook {
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
    renderStats: () => viewer.renderStats(),
    select: (id) => viewer.select(id),
    focusRoom: (id) => viewer.focusRoom(id),
    focusRegion: (region) => viewer.focusRegion(region),
    resetView: () => viewer.resetView(),
  };
  window.__tardis = hook;
  return hook;
}
