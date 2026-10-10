import type { Connection } from '../../data/types';

/** One traversable direction of a connection. Edges are undirected, so each yields two. */
export interface GraphEdge {
  readonly connectionId: string;
  readonly to: string;
}

export interface RoomGraph {
  readonly nodes: ReadonlySet<string>;
  readonly adjacency: ReadonlyMap<string, readonly GraphEdge[]>;
}

export interface GraphOptions {
  /** Portal edges (e.g. B28) are excluded unless explicitly allowed. */
  readonly includePortals?: boolean;
}

export interface RoutePath {
  readonly rooms: readonly string[];
  readonly connections: readonly string[];
  readonly cost: number;
}

/** Builds an undirected adjacency graph over the given rooms and connections. */
export function buildGraph(
  roomIds: Iterable<string>,
  connections: Iterable<Connection>,
  options: GraphOptions = {},
): RoomGraph {
  const nodes = new Set(roomIds);
  const adjacency = new Map<string, GraphEdge[]>();
  for (const id of nodes) adjacency.set(id, []);

  for (const c of connections) {
    if (c.portal && !options.includePortals) continue;
    const a = c.from.room;
    const b = c.to.room;
    const fromEdges = adjacency.get(a);
    const toEdges = adjacency.get(b);
    if (!fromEdges || !toEdges) continue; // endpoint outside this graph's node set
    fromEdges.push({ connectionId: c.id, to: b });
    toEdges.push({ connectionId: c.id, to: a });
  }
  return { nodes, adjacency };
}

/** All nodes reachable from `start` (including `start`); empty if `start` is not in the graph. */
export function reachableFrom(graph: RoomGraph, start: string): Set<string> {
  const seen = new Set<string>();
  if (!graph.nodes.has(start)) return seen;
  const queue = [start];
  seen.add(start);
  while (queue.length > 0) {
    const current = queue.shift() as string;
    for (const edge of graph.adjacency.get(current) ?? []) {
      if (!seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  return seen;
}

/**
 * Dijkstra shortest path. `weight` returns the traversal cost of a connection
 * (default 1 per edge, i.e. fewest hops). Returns null when unreachable.
 */
export function shortestPath(
  graph: RoomGraph,
  from: string,
  to: string,
  weight: (connectionId: string) => number = () => 1,
): RoutePath | null {
  if (!graph.nodes.has(from) || !graph.nodes.has(to)) return null;

  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, { room: string; connectionId: string }>();
  const done = new Set<string>();
  const frontier = new Set<string>([from]);

  while (frontier.size > 0) {
    let current: string | undefined;
    let best = Infinity;
    for (const id of frontier) {
      const d = dist.get(id) ?? Infinity;
      if (d < best || (d === best && current !== undefined && id < current)) {
        best = d;
        current = id;
      }
    }
    if (current === undefined) break;
    frontier.delete(current);
    if (current === to) break;
    done.add(current);

    for (const edge of graph.adjacency.get(current) ?? []) {
      if (done.has(edge.to)) continue;
      const w = weight(edge.connectionId);
      if (!(w >= 0)) throw new Error(`Invalid weight ${w} for connection ${edge.connectionId}`);
      const candidate = best + w;
      if (candidate < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, candidate);
        prev.set(edge.to, { room: current, connectionId: edge.connectionId });
        frontier.add(edge.to);
      }
    }
  }

  const cost = dist.get(to);
  if (cost === undefined) return null;

  const rooms = [to];
  const connections: string[] = [];
  let cursor = to;
  while (cursor !== from) {
    const step = prev.get(cursor);
    if (!step) return null;
    connections.push(step.connectionId);
    rooms.push(step.room);
    cursor = step.room;
  }
  rooms.reverse();
  connections.reverse();
  return { rooms, connections, cost };
}
