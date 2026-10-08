/**
 * Pure geometric predicates for the spatial validator. Tolerances are in NU.
 */

import type { Vec3 } from '../../data/layout';
import type { Bounds } from '../../scene/camera/isometric';
import type { SurfaceShape, Volume, WalkableSurface } from '../structure';

/** Positional tolerance: points closer than this coincide; faces this close only touch. */
export const EPSILON_NU = 1e-3;

export function onShape(shape: SurfaceShape, x: number, z: number): boolean {
  if (shape.kind === 'rect') {
    return (
      x >= shape.min[0] - EPSILON_NU &&
      x <= shape.max[0] + EPSILON_NU &&
      z >= shape.min[1] - EPSILON_NU &&
      z <= shape.max[1] + EPSILON_NU
    );
  }
  const r = Math.hypot(x - shape.center[0], z - shape.center[1]);
  return r >= shape.inner - EPSILON_NU && r <= shape.outer + EPSILON_NU;
}

/** True when `p` stands on `surface`: at its height and inside its footprint. */
export function onSurface(surface: WalkableSurface, p: Vec3): boolean {
  if (Math.abs(p[1] - surface.y) > EPSILON_NU) return false;
  return surface.shapes.some((s) => onShape(s, p[0], p[2]));
}

export function samePoint(a: Vec3, b: Vec3): boolean {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= EPSILON_NU;
}

export function volumeBounds(v: Volume): Bounds {
  if (v.shape === 'box') return { min: v.min, max: v.max };
  const [x, z] = v.center;
  return { min: [x - v.radius, v.y0, z - v.radius], max: [x + v.radius, v.y1, z + v.radius] };
}

function verticalSpan(v: Volume): readonly [number, number] {
  return v.shape === 'box' ? [v.min[1], v.max[1]] : [v.y0, v.y1];
}

/** Penetration depth of the open intervals (a0, a1) and (b0, b1); ≤ 0 means apart or touching. */
function penetration(a0: number, a1: number, b0: number, b1: number): number {
  return Math.min(a1, b1) - Math.max(a0, b0);
}

/**
 * True when two volumes share interior space. Faces that only touch (within
 * {@link EPSILON_NU}) are not an overlap, so rooms may abut through a doorway.
 */
export function volumesOverlap(a: Volume, b: Volume): boolean {
  const [ay0, ay1] = verticalSpan(a);
  const [by0, by1] = verticalSpan(b);
  if (penetration(ay0, ay1, by0, by1) <= EPSILON_NU) return false;

  if (a.shape === 'box' && b.shape === 'box') {
    return (
      penetration(a.min[0], a.max[0], b.min[0], b.max[0]) > EPSILON_NU &&
      penetration(a.min[2], a.max[2], b.min[2], b.max[2]) > EPSILON_NU
    );
  }
  if (a.shape === 'cylinder' && b.shape === 'cylinder') {
    const d = Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]);
    return d < a.radius + b.radius - EPSILON_NU;
  }
  const cyl = a.shape === 'cylinder' ? a : (b as Extract<Volume, { shape: 'cylinder' }>);
  const box = a.shape === 'box' ? a : (b as Extract<Volume, { shape: 'box' }>);
  // Closest footprint point of the box to the cylinder axis.
  const cx = Math.min(Math.max(cyl.center[0], box.min[0]), box.max[0]);
  const cz = Math.min(Math.max(cyl.center[1], box.min[2]), box.max[2]);
  return Math.hypot(cx - cyl.center[0], cz - cyl.center[1]) < cyl.radius - EPSILON_NU;
}
