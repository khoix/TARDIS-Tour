/**
 * Spatial validator: pure checks on a {@link StructureDescription} (research §F3/§F4).
 * Each rule returns the issues it finds; an empty list means the description passes.
 */

import type { Side, Vec3 } from '../../data/layout';
import type { PathSegment, StructureDescription, Volume } from '../structure';
import {
  EPSILON_NU,
  onSurface,
  samePoint,
  shapeBounds,
  surfaceGap,
  volumesOverlap,
} from './geometry';

export const VALIDATION_RULES = [
  'anchor-on-surface',
  'path-lands-on-surface',
  'path-endpoint-is-anchor',
  'path-supported',
  'element-lands',
  'volume-overlap',
  'dangling-end',
  'surface-disjoint',
  'walkable-unreachable',
  'graph-mesh-mismatch',
] as const;

/**
 * Widest unsupported span a walker steps across in one stride: a door sill through a wall
 * (0.5 NU thick) or onto a ladder through a hatch rim. Longer gaps are holes in the floor.
 */
export const STEP_GAP_NU = 0.75;
/** Steepest flight, rise per unit run (45°, the console's own stairs). */
export const MAX_FLIGHT_SLOPE = 1;
/** How far inside a room a door anchor may sit from the opening it serves. */
export const DOOR_REACH_NU = 1;
/** Spacing of the floor samples along a level leg. */
const SAMPLE_NU = 0.05;
export type ValidationRule = (typeof VALIDATION_RULES)[number];

export interface ValidationIssue {
  readonly rule: ValidationRule;
  /** Id of the offending anchor (`room.anchor`), path, volume pair or surface. */
  readonly subject: string;
  readonly message: string;
}

function anchorKey(roomId: string, anchorId: string): string {
  return `${roomId}.${anchorId}`;
}

/** Every anchor stands on the surface it names, and that surface belongs to its room. */
export function checkAnchorsOnSurfaces(d: StructureDescription): ValidationIssue[] {
  const surfaces = new Map(d.surfaces.map((s) => [s.id, s]));
  const issues: ValidationIssue[] = [];
  for (const a of d.anchors) {
    const subject = anchorKey(a.roomId, a.anchorId);
    const s = surfaces.get(a.surfaceId);
    if (!s) {
      issues.push({ rule: 'anchor-on-surface', subject, message: `no surface ${a.surfaceId}` });
    } else if (s.ownerId !== a.roomId) {
      issues.push({
        rule: 'anchor-on-surface',
        subject,
        message: `surface ${s.id} belongs to ${s.ownerId}, not ${a.roomId}`,
      });
    } else if (!onSurface(s, a.position)) {
      issues.push({
        rule: 'anchor-on-surface',
        subject,
        message: `position [${a.position.join(', ')}] is not on ${s.id}`,
      });
    }
  }
  return issues;
}

/** Both ends of every path (stair, ladder, bridge, doorway) stand on a walkable surface. */
export function checkPathLandings(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of d.paths) {
    const ends = [
      ['start', p.points[0]],
      ['end', p.points.at(-1)],
    ] as const;
    for (const [which, point] of ends) {
      if (!point || !d.surfaces.some((s) => onSurface(s, point))) {
        issues.push({
          rule: 'path-lands-on-surface',
          subject: p.id,
          message: `${p.kind} ${which} ${point ? `[${point.join(', ')}]` : '(missing)'} is in midair`,
        });
      }
    }
  }
  return issues;
}

/** Every path starts and ends exactly at the door anchors it names. */
export function checkPathEndpoints(d: StructureDescription): ValidationIssue[] {
  const anchors = new Map(d.anchors.map((a) => [anchorKey(a.roomId, a.anchorId), a]));
  const issues: ValidationIssue[] = [];
  for (const p of d.paths) {
    if (p.points.length < 2) {
      issues.push({
        rule: 'path-endpoint-is-anchor',
        subject: p.id,
        message: 'fewer than 2 points',
      });
      continue;
    }
    const ends = [
      ['from', p.from, p.points[0]],
      ['to', p.to, p.points.at(-1)],
    ] as const;
    for (const [which, ref, point] of ends) {
      const key = anchorKey(ref.roomId, ref.anchorId);
      const anchor = anchors.get(key);
      if (!anchor) {
        issues.push({
          rule: 'path-endpoint-is-anchor',
          subject: p.id,
          message: `${which} anchor ${key} does not exist`,
        });
      } else if (anchor.state !== 'open') {
        issues.push({
          rule: 'path-endpoint-is-anchor',
          subject: p.id,
          message: `${which} anchor ${key} is closed`,
        });
      } else if (!point || !samePoint(point, anchor.position)) {
        issues.push({
          rule: 'path-endpoint-is-anchor',
          subject: p.id,
          message: `${which} end does not meet anchor ${key}`,
        });
      }
    }
  }
  return issues;
}

function supported(d: StructureDescription, p: Vec3): boolean {
  return d.surfaces.some((s) => onSurface(s, p));
}

function withinStep(d: StructureDescription, p: Vec3): boolean {
  return d.surfaces.some((s) => surfaceGap(s, p) <= STEP_GAP_NU + EPSILON_NU);
}

/** Points along a segment, at most {@link SAMPLE_NU} apart, both ends included. */
function samples(a: Vec3, b: Vec3): Vec3[] {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / SAMPLE_NU));
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  });
}

/** Longest stretch of a level leg with no floor under it, from support to support. */
function longestGap(d: StructureDescription, a: Vec3, b: Vec3): number {
  const points = samples(a, b);
  let longest = 0;
  let lastSupported: Vec3 | null = null;
  let openSince: Vec3 | null = null;
  for (const p of points) {
    if (supported(d, p)) {
      if (openSince) {
        const from = lastSupported ?? openSince;
        longest = Math.max(longest, Math.hypot(p[0] - from[0], p[2] - from[2]));
        openSince = null;
      }
      lastSupported = p;
    } else if (!openSince) {
      openSince = p;
    }
  }
  if (openSince) {
    const from = lastSupported ?? openSince;
    longest = Math.max(longest, Math.hypot(b[0] - from[0], b[2] - from[2]));
  }
  return longest;
}

/** The stairs or ladder element joining exactly these two points, if any. */
function carrier(d: StructureDescription, type: 'stairs' | 'ladder', lower: Vec3, upper: Vec3) {
  return d.elements.find(
    (e) =>
      e.primitive.type === type &&
      samePoint(e.primitive.bottom, lower) &&
      samePoint(e.primitive.top, upper),
  );
}

/**
 * Every leg of every walkable path is carried by real structure (no midair stairs, ladders or
 * shafts): level legs run over floors, crossing gaps no wider than {@link STEP_GAP_NU};
 * sloped legs are stair flights no steeper than {@link MAX_FLIGHT_SLOPE} that land on floors
 * at both ends; vertical legs are ladders whose ends are within a step of a floor.
 */
export function checkPathSupport(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (p: PathSegment, message: string) =>
    issues.push({ rule: 'path-supported', subject: p.id, message });
  for (const p of d.paths) {
    if (p.portal) continue;
    p.points.slice(1).forEach((b, i) => {
      const a = p.points[i] as Vec3;
      const rise = b[1] - a[1];
      const run = Math.hypot(b[0] - a[0], b[2] - a[2]);
      const [lower, upper] = rise < 0 ? [b, a] : [a, b];
      if (Math.abs(rise) <= EPSILON_NU) {
        const gap = longestGap(d, a, b);
        if (gap > STEP_GAP_NU + EPSILON_NU) {
          issue(p, `leg ${i} crosses ${gap.toFixed(2)} NU with no floor`);
        }
      } else if (run <= EPSILON_NU) {
        if (!carrier(d, 'ladder', lower, upper)) issue(p, `leg ${i} climbs with no ladder`);
        for (const [which, end] of [
          ['foot', lower],
          ['head', upper],
        ] as const) {
          if (!withinStep(d, end)) issue(p, `ladder leg ${i} ${which} is in midair`);
        }
      } else {
        if (Math.abs(rise) / run > MAX_FLIGHT_SLOPE + EPSILON_NU) {
          issue(p, `leg ${i} is steeper than a flight`);
        }
        if (!carrier(d, 'stairs', lower, upper)) issue(p, `leg ${i} slopes with no stairs`);
        for (const [which, end] of [
          ['foot', lower],
          ['head', upper],
        ] as const) {
          if (!supported(d, end)) issue(p, `flight leg ${i} ${which} is in midair`);
        }
      }
    });
  }
  return issues;
}

/** Every stair flight lands on floors at both ends; every ladder ends within a step of one. */
export function checkElementLandings(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const e of d.elements) {
    const p = e.primitive;
    if (p.type !== 'stairs' && p.type !== 'ladder') continue;
    const lands = p.type === 'stairs' ? supported : withinStep;
    for (const [which, end] of [
      ['bottom', p.bottom],
      ['top', p.top],
    ] as const) {
      if (!lands(d, end)) {
        issues.push({
          rule: 'element-lands',
          subject: `${e.tag.id}:${e.tag.part}`,
          message: `${p.type} ${which} [${end.join(', ')}] is in midair`,
        });
      }
    }
  }
  return issues;
}

type BoxVolume = Extract<Volume, { shape: 'box' }>;

/** Face of a box side: its plane along the side's axis, and its extent across (u) and up. */
function face(v: BoxVolume, side: Side) {
  const alongX = side === '+z' || side === '-z';
  const planeOf: Readonly<Record<Side, number>> = {
    '+x': v.max[0],
    '-x': v.min[0],
    '+z': v.max[2],
    '-z': v.min[2],
  };
  return {
    plane: planeOf[side],
    u: alongX ? ([v.min[0], v.max[0]] as const) : ([v.min[2], v.max[2]] as const),
    y: [v.min[1], v.max[1]] as const,
  };
}

const OPPOSITE: Readonly<Record<Side, Side>> = { '+x': '-x', '-x': '+x', '+z': '-z', '-z': '+z' };

/**
 * No dangling corridor ends: every opening a box declares meets another box through a face
 * of positive area, and opens into it — a matching opening when the neighbour declares
 * openings (a kit piece), or an open door anchor within {@link DOOR_REACH_NU} of the shared
 * face when it is a room that does not.
 */
export function checkDanglingEnds(d: StructureDescription): ValidationIssue[] {
  const boxes = d.volumes.filter((v): v is BoxVolume => v.shape === 'box');
  const issues: ValidationIssue[] = [];
  for (const v of boxes) {
    for (const side of v.openings ?? []) {
      const mine = face(v, side);
      const back = OPPOSITE[side];
      const touching = boxes.flatMap((w) => {
        if (w === v) return [];
        const theirs = face(w, back);
        if (Math.abs(theirs.plane - mine.plane) > EPSILON_NU) return [];
        const u0 = Math.max(mine.u[0], theirs.u[0]);
        const u1 = Math.min(mine.u[1], theirs.u[1]);
        const y0 = Math.max(mine.y[0], theirs.y[0]);
        const y1 = Math.min(mine.y[1], theirs.y[1]);
        return u1 - u0 > EPSILON_NU && y1 - y0 > EPSILON_NU ? [{ w, u0, u1, y0, y1 }] : [];
      });
      const opensInto = touching.some(({ w, u0, u1, y0, y1 }) => {
        if (w.openings) return w.openings.includes(back);
        const alongX = side === '+z' || side === '-z';
        return d.anchors.some((a) => {
          if (a.roomId !== w.ownerId || a.state !== 'open') return false;
          const [pu, pn] = alongX ? [a.position[0], a.position[2]] : [a.position[2], a.position[0]];
          const du = Math.max(u0 - pu, 0, pu - u1);
          const dy = Math.max(y0 - a.position[1], 0, a.position[1] - y1);
          return Math.hypot(pn - mine.plane, du, dy) <= DOOR_REACH_NU + EPSILON_NU;
        });
      });
      if (!opensInto) {
        issues.push({
          rule: 'dangling-end',
          subject: `${v.id}${side}`,
          message:
            touching.length === 0
              ? `${v.id} opens ${side} onto nothing`
              : `${v.id} opens ${side} onto a wall of ${touching.map((t) => t.w.id).join(', ')}`,
        });
      }
    }
  }
  return issues;
}

/** Each surface's shapes touch, so its footprint is one walkable region. */
export function checkSurfaceContiguity(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const s of d.surfaces) {
    const bounds = s.shapes.map(shapeBounds);
    const touches = (i: number, j: number) => {
      const [a, b] = [bounds[i], bounds[j]] as [readonly number[], readonly number[]];
      return (
        (a[0] as number) <= (b[2] as number) + EPSILON_NU &&
        (b[0] as number) <= (a[2] as number) + EPSILON_NU &&
        (a[1] as number) <= (b[3] as number) + EPSILON_NU &&
        (b[1] as number) <= (a[3] as number) + EPSILON_NU
      );
    };
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      const i = queue.shift() as number;
      bounds.forEach((_, j) => {
        if (!seen.has(j) && touches(i, j)) {
          seen.add(j);
          queue.push(j);
        }
      });
    }
    if (s.shapes.length > 0 && seen.size < s.shapes.length) {
      issues.push({
        rule: 'surface-disjoint',
        subject: s.id,
        message: `${s.id} has ${s.shapes.length - seen.size} shape(s) apart from the rest`,
      });
    }
  }
  return issues;
}

/** No two volumes share interior space (rooms may only touch, through openings). */
export function checkVolumeOverlaps(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  d.volumes.forEach((a, i) => {
    for (const b of d.volumes.slice(i + 1)) {
      if (volumesOverlap(a, b)) {
        issues.push({
          rule: 'volume-overlap',
          subject: `${a.id}|${b.id}`,
          message: `${a.id} (${a.ownerId}) overlaps ${b.id} (${b.ownerId})`,
        });
      }
    }
  });
  return issues;
}

/** Surfaces a path walks over: under its vertices and under its level legs. */
function surfacesWalked(d: StructureDescription, p: PathSegment): Set<string> {
  const walked = new Set<string>();
  const add = (point: Vec3) => {
    for (const s of d.surfaces) if (onSurface(s, point)) walked.add(s.id);
  };
  p.points.forEach((b, i) => {
    add(b);
    const a = p.points[i - 1];
    if (a && Math.abs(b[1] - a[1]) <= EPSILON_NU) samples(a, b).forEach(add);
  });
  return walked;
}

export interface ReachOptions {
  /** Paths of these connections are left out, as if never built. */
  readonly excludeConnections?: ReadonlySet<string>;
}

/**
 * Breadth-first search over walkable surfaces: a path links every surface it walks over (its
 * ends, its landings and the floors under its level legs). Portal paths are excluded
 * (research §F3.1). Returns the surfaces reached from `startId`.
 */
export function reachableSurfaces(
  d: StructureDescription,
  startId: string,
  options: ReachOptions = {},
): Set<string> {
  const links = new Map<string, Set<string>>(d.surfaces.map((s) => [s.id, new Set()]));
  for (const p of d.paths) {
    if (p.portal || options.excludeConnections?.has(p.connectionId)) continue;
    const walked = [...surfacesWalked(d, p)];
    for (const a of walked) for (const b of walked) if (a !== b) links.get(a)?.add(b);
  }
  const seen = new Set<string>();
  if (!links.has(startId)) return seen;
  const queue = [startId];
  seen.add(startId);
  while (queue.length > 0) {
    const id = queue.shift() as string;
    for (const next of links.get(id) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

/** Rooms of the description whose floors are walkable from `startId` (portals disabled). */
export function reachableRooms(
  d: StructureDescription,
  startId: string,
  options: ReachOptions = {},
): Set<string> {
  const reached = reachableSurfaces(d, startId, options);
  const rooms = new Set(d.roomIds);
  return new Set(
    d.surfaces.filter((s) => reached.has(s.id) && rooms.has(s.ownerId)).map((s) => s.ownerId),
  );
}

/** Every surface is reachable on foot from `startId` with portals disabled. */
export function checkWalkableReachability(
  d: StructureDescription,
  startId: string,
): ValidationIssue[] {
  if (!d.surfaces.some((s) => s.id === startId)) {
    return [{ rule: 'walkable-unreachable', subject: startId, message: 'start surface missing' }];
  }
  const reached = reachableSurfaces(d, startId);
  return d.surfaces
    .filter((s) => !reached.has(s.id))
    .map((s) => ({
      rule: 'walkable-unreachable' as const,
      subject: s.id,
      message: `${s.id} (${s.ownerId}) is not walkable from ${startId} with portals disabled`,
    }));
}

/**
 * Graph and mesh agree: the rooms the topology graph reaches (`graphReached`, portals
 * disabled) are exactly the rooms of the description walkable from `startId`.
 */
export function checkGraphAgreement(
  d: StructureDescription,
  startId: string,
  graphReached: ReadonlySet<string>,
  options: ReachOptions = {},
): ValidationIssue[] {
  const mesh = reachableRooms(d, startId, options);
  const issue = (subject: string, message: string): ValidationIssue => ({
    rule: 'graph-mesh-mismatch',
    subject,
    message,
  });
  return [
    ...d.roomIds
      .filter((id) => graphReached.has(id) && !mesh.has(id))
      .map((id) => issue(id, `the graph reaches ${id} but the mesh walk does not`)),
    ...[...mesh]
      .filter((id) => !graphReached.has(id))
      .map((id) => issue(id, `the mesh walk reaches ${id} but the graph does not`)),
  ];
}

/** All description rules. `startSurfaceId` is the surface walkability is measured from. */
export function validateStructure(
  d: StructureDescription,
  startSurfaceId: string,
): ValidationIssue[] {
  return [
    ...checkAnchorsOnSurfaces(d),
    ...checkPathLandings(d),
    ...checkPathEndpoints(d),
    ...checkPathSupport(d),
    ...checkElementLandings(d),
    ...checkVolumeOverlaps(d),
    ...checkDanglingEnds(d),
    ...checkSurfaceContiguity(d),
    ...checkWalkableReachability(d, startSurfaceId),
  ];
}
