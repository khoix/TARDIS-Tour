/**
 * Spatial validator: pure checks on a {@link StructureDescription} (research §F3/§F4).
 * Each rule returns the issues it finds; an empty list means the description passes.
 */

import type { Vec3 } from '../../data/layout';
import type { StructureDescription, WalkableSurface } from '../structure';
import { onSurface, samePoint, volumesOverlap } from './geometry';

export const VALIDATION_RULES = [
  'anchor-on-surface',
  'path-lands-on-surface',
  'path-endpoint-is-anchor',
  'volume-overlap',
  'walkable-unreachable',
] as const;
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
    } else if (s.roomId !== a.roomId) {
      issues.push({
        rule: 'anchor-on-surface',
        subject,
        message: `surface ${s.id} belongs to ${s.roomId}, not ${a.roomId}`,
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

/** No two volumes share interior space (rooms may only touch, through openings). */
export function checkVolumeOverlaps(d: StructureDescription): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  d.volumes.forEach((a, i) => {
    for (const b of d.volumes.slice(i + 1)) {
      if (volumesOverlap(a, b)) {
        issues.push({
          rule: 'volume-overlap',
          subject: `${a.id}|${b.id}`,
          message: `${a.id} (${a.roomId}) overlaps ${b.id} (${b.roomId})`,
        });
      }
    }
  });
  return issues;
}

/**
 * Breadth-first search over walkable surfaces, linked by paths whose ends stand on them.
 * Portal paths are excluded (research §F3.1). Returns the surfaces reached from `startId`.
 */
export function reachableSurfaces(d: StructureDescription, startId: string): Set<string> {
  const surfaceOf = (point: Vec3): WalkableSurface[] =>
    d.surfaces.filter((s) => onSurface(s, point));
  const links = new Map<string, Set<string>>(d.surfaces.map((s) => [s.id, new Set()]));
  for (const p of d.paths) {
    const first = p.points[0];
    const last = p.points.at(-1);
    if (p.portal || !first || !last) continue;
    for (const a of surfaceOf(first)) {
      for (const b of surfaceOf(last)) {
        links.get(a.id)?.add(b.id);
        links.get(b.id)?.add(a.id);
      }
    }
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
      message: `${s.id} (${s.roomId}) is not walkable from ${startId} with portals disabled`,
    }));
}

/** All rules. `startSurfaceId` is the surface walkability is measured from. */
export function validateStructure(
  d: StructureDescription,
  startSurfaceId: string,
): ValidationIssue[] {
  return [
    ...checkAnchorsOnSurfaces(d),
    ...checkPathLandings(d),
    ...checkPathEndpoints(d),
    ...checkVolumeOverlaps(d),
    ...checkWalkableReachability(d, startSurfaceId),
  ];
}
