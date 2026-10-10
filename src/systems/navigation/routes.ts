/**
 * Routes (Execution 7): the shortest walk between two placed rooms, by walk-line length, over
 * the stable graph. Portals (B28) are excluded unless allowed. Each step is one built edge;
 * the route line strings the edges' walk lines (anchor to anchor, following the corridor
 * waypoints) together in travel order, so it runs through the modelled architecture.
 */

import type { Vec3 } from '../../data/layout';
import type { Connection, EdgeKind } from '../../data/types';
import { buildGraph, shortestPath } from './graph';

export interface RouteOptions {
  /** Lets the route cross portal edges (B28); off by default, as in every stability check. */
  readonly allowPortal: boolean;
}

export interface RouteStep {
  readonly connectionId: string;
  readonly kind: EdgeKind;
  readonly portal: boolean;
  /** Rooms in travel order (the edge may be stored the other way round). */
  readonly from: string;
  readonly to: string;
  /** Walk-line length of the edge, in NU. */
  readonly length: number;
  /** The edge's walk line, oriented from `from` to `to`. */
  readonly points: readonly Vec3[];
}

export interface Route {
  readonly from: string;
  readonly to: string;
  readonly allowPortal: boolean;
  readonly rooms: readonly string[];
  readonly connections: readonly string[];
  readonly steps: readonly RouteStep[];
  /** Total walk-line length, in NU. */
  readonly length: number;
}

/** Room the console route ends in: the main deck around the console. */
export const CONSOLE_ROOM_ID = 'C-M';

const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Length of a polyline, in NU. */
export function polylineLength(points: readonly Vec3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1] as Vec3, points[i] as Vec3);
  }
  return total;
}

/**
 * Shortest route from `from` to `to` over `connections` (edges without a walk line are not
 * built and are skipped). Returns null when no route exists; a route from a room to itself
 * has no steps.
 */
export function planRoute(
  from: string,
  to: string,
  roomIds: Iterable<string>,
  connections: readonly Connection[],
  walkLines: ReadonlyMap<string, readonly Vec3[]>,
  options: RouteOptions,
): Route | null {
  const built = connections.filter((c) => walkLines.has(c.id));
  const byId = new Map(built.map((c) => [c.id, c]));
  const lengths = new Map(built.map((c) => [c.id, polylineLength(walkLines.get(c.id) ?? [])]));
  const graph = buildGraph(roomIds, built, { includePortals: options.allowPortal });
  const path = shortestPath(graph, from, to, (id) => lengths.get(id) ?? Infinity);
  if (!path) return null;

  const steps = path.connections.map((id, i): RouteStep => {
    const c = byId.get(id) as Connection;
    const stepFrom = path.rooms[i] as string;
    const forward = c.from.room === stepFrom;
    const line = walkLines.get(id) ?? [];
    return {
      connectionId: id,
      kind: c.kind,
      portal: c.portal,
      from: stepFrom,
      to: path.rooms[i + 1] as string,
      length: lengths.get(id) ?? 0,
      points: forward ? line : [...line].reverse(),
    };
  });
  return {
    from,
    to,
    allowPortal: options.allowPortal,
    rooms: path.rooms,
    connections: path.connections,
    steps,
    length: path.cost,
  };
}

/**
 * The route as one polyline: each step's walk line in travel order. Consecutive steps meet in
 * the room between them, joined straight from the arrival anchor to the departure anchor.
 */
export function routeLine(route: Route): Vec3[] {
  const line: Vec3[] = [];
  for (const step of route.steps) {
    for (const p of step.points) {
      const last = line[line.length - 1];
      if (!last || distance(last, p) > 0) line.push(p);
    }
  }
  return line;
}

/** Plain-language name of an edge kind, for step lists. */
export function edgeKindLabel(kind: EdgeKind): string {
  switch (kind) {
    case 'vestibule_portal':
      return 'Portal';
    case 'inaccessible_observation':
      return 'Observation only';
    default:
      return kind.charAt(0).toUpperCase() + kind.slice(1);
  }
}
