/**
 * Cutaway geometry (Execution 6), pure and shared by the shader and the pick filter so that what
 * is cut on screen is exactly what clicks pass through.
 *
 * Camera-facing cut: every owner (room or edge) has a *spine*, its centre line — the medial
 * segment of a room's footprint, or an edge's walk line. A point of a cut part is cut when it
 * lies on the camera side of its nearest spine point, so a box room loses its near walls, a
 * corridor its near wall and the near half of its frames, and the round console room its near
 * half. The section clip removes everything above an elevation.
 */

import type { Vec3 } from '../../data/layout';
import type { Bounds } from '../../scene/camera/isometric';
import type { Vec2 } from '../../world/structure';
import type { ResolvedVisual } from './state';

/** Points one spine may hold; the shader's uniform array has this length. */
export const MAX_SPINE_POINTS = 8;
/**
 * Vertical distances weigh this much in the nearest-spine-point search, so a sloped flight's
 * walls project across the flight (nearly horizontally) while stacked legs stay apart.
 */
export const SPINE_VERTICAL_WEIGHT = 0.25;
/** Points this close to the spine's vertical plane are never cut (no speckle on radial ribs). */
export const CUT_MARGIN_NU = 0.05;
/** Wall cuts follow the camera at most this often while it moves (EXECUTION-PLAN Ex6). */
export const VIEW_THROTTLE_MS = 100;

/** Centre line of an owner, in NU: one point, a segment, or a walk-line polyline. */
export type Spine = readonly Vec3[];

/**
 * Medial segment of a room box's footprint at mid-height: a point for a square room, and a
 * segment along the long axis for an elongated one (so both long walls of a hall are judged
 * against the hall's axis, not its middle).
 */
export function roomSpine(b: Bounds): Spine {
  const cx = (b.min[0] + b.max[0]) / 2;
  const cy = (b.min[1] + b.max[1]) / 2;
  const cz = (b.min[2] + b.max[2]) / 2;
  const half = Math.abs(b.max[0] - b.min[0] - (b.max[2] - b.min[2])) / 2;
  if (half < 1e-6) return [[cx, cy, cz]];
  return b.max[0] - b.min[0] > b.max[2] - b.min[2]
    ? [
        [cx - half, cy, cz],
        [cx + half, cy, cz],
      ]
    : [
        [cx, cy, cz - half],
        [cx, cy, cz + half],
      ];
}

/** An edge's walk line (anchor to anchor) as its spine. */
export function walkLineSpine(id: string, points: readonly Vec3[]): Spine {
  if (points.length === 0 || points.length > MAX_SPINE_POINTS) {
    throw new Error(`Walk line of ${id} has ${points.length} points (1–${MAX_SPINE_POINTS})`);
  }
  return points;
}

/** Nearest spine point to `p`, with vertical distances weighted by {@link SPINE_VERTICAL_WEIGHT}. */
export function nearestOnSpine(p: Vec3, spine: Spine): Vec3 {
  const w2 = SPINE_VERTICAL_WEIGHT * SPINE_VERTICAL_WEIGHT;
  let best = spine[0] as Vec3;
  let bestD = Infinity;
  const consider = (q: Vec3) => {
    const d = (p[0] - q[0]) ** 2 + w2 * (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  };
  if (spine.length === 1) consider(best);
  for (let i = 0; i + 1 < spine.length; i++) {
    const a = spine[i] as Vec3;
    const b = spine[i + 1] as Vec3;
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len2 = ab[0] ** 2 + w2 * ab[1] ** 2 + ab[2] ** 2;
    const t =
      len2 > 0
        ? Math.min(
            1,
            Math.max(
              0,
              ((p[0] - a[0]) * ab[0] + w2 * (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / len2,
            ),
          )
        : 0;
    consider([a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]);
  }
  return best;
}

/** Horizontal unit vector from the target towards the camera, or null when looking straight down. */
export function horizontalView(offset: Vec3): Vec2 | null {
  const len = Math.hypot(offset[0], offset[2]);
  return len < 1e-9 ? null : [offset[0] / len, offset[2] / len];
}

/** Whether the camera-facing cut removes the point `p` of a mesh with this spine. */
export function isCutAt(p: Vec3, spine: Spine, view: Vec2): boolean {
  const q = nearestOnSpine(p, spine);
  return (p[0] - q[0]) * view[0] + (p[2] - q[2]) * view[1] > CUT_MARGIN_NU;
}

/** Whether the section clip removes a point at elevation `y`. */
export function clippedAt(y: number, sectionY: number | null): boolean {
  return sectionY !== null && y > sectionY;
}

// ── Picking ──────────────────────────────────────────────────────────────────

export interface PickHit<T> {
  readonly object: T;
  readonly point: { readonly x: number; readonly y: number; readonly z: number };
}

export interface PickContext<T> {
  readonly sectionY: number | null;
  /** Horizontal camera direction the cut currently uses (null: no cut is applied). */
  readonly view: Vec2 | null;
  /** Resolved state of a hit object; undefined for objects the visual state does not manage. */
  visual(object: T): ResolvedVisual | undefined;
  spine(object: T): Spine | undefined;
}

/**
 * Clip-aware pick filter: a hit counts only on a pickable mesh (not hidden, not ghosted) at a
 * point that is neither above the section nor cut away by the camera-facing cut.
 */
export function acceptsHit<T>(hit: PickHit<T>, ctx: PickContext<T>): boolean {
  const v = ctx.visual(hit.object);
  if (!v?.pickable) return false;
  const p: Vec3 = [hit.point.x, hit.point.y, hit.point.z];
  if (clippedAt(p[1], ctx.sectionY)) return false;
  if (v.cut && ctx.view !== null) {
    const spine = ctx.spine(hit.object);
    if (spine && isCutAt(p, spine, ctx.view)) return false;
  }
  return true;
}

/** First accepted hit of a distance-sorted intersection list. */
export function firstPick<T, H extends PickHit<T>>(
  hits: readonly H[],
  ctx: PickContext<T>,
): H | undefined {
  return hits.find((h) => acceptsHit(h, ctx));
}

/** Rate limiter for the camera-facing cut: `ready` is true at most once per interval. */
export class Throttle {
  private last = -Infinity;
  constructor(private readonly intervalMs: number) {}

  ready(nowMs: number): boolean {
    if (nowMs - this.last < this.intervalMs) return false;
    this.last = nowMs;
    return true;
  }
}
