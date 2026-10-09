/**
 * Pure geometry for the crude topology view: room bounds from layout transforms and
 * axis-aligned connector legs between rooms. No Three.js objects, so it is unit-testable.
 */

import type { RoomTransform, Vec3 } from '../data/layout';
import type { Bounds } from './camera/isometric';

export type Axis = 'x' | 'y' | 'z';

export interface ConnectorLeg {
  readonly from: Vec3;
  readonly to: Vec3;
  readonly axis: Axis;
}

/** Height above a room's floor where connectors attach (a walking level, not a measurement). */
export const WALK_HEIGHT_NU = 1;

export function roomBounds(t: RoomTransform): Bounds {
  const [x, y, z] = t.position;
  const [w, h, d] = t.size;
  return { min: [x - w / 2, y, z - d / 2], max: [x + w / 2, y + h, z + d / 2] };
}

export function walkPoint(t: RoomTransform): Vec3 {
  return [t.position[0], t.position[1] + WALK_HEIGHT_NU, t.position[2]];
}

/**
 * Orthogonal path from `a` to `b`: travel along X, then Z at `a`'s level, then rise or
 * descend along Y at `b`. Zero-length legs are dropped, so a purely vertical edge is one leg.
 */
export function connectorLegs(a: Vec3, b: Vec3): ConnectorLeg[] {
  const p1: Vec3 = [b[0], a[1], a[2]];
  const p2: Vec3 = [b[0], a[1], b[2]];
  const candidates: ConnectorLeg[] = [
    { from: a, to: p1, axis: 'x' },
    { from: p1, to: p2, axis: 'z' },
    { from: p2, to: b, axis: 'y' },
  ];
  return candidates.filter((leg) => legLength(leg) > 0);
}

export function legLength(leg: ConnectorLeg): number {
  return Math.hypot(leg.to[0] - leg.from[0], leg.to[1] - leg.from[1], leg.to[2] - leg.from[2]);
}
