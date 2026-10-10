import { describe, expect, it } from 'vitest';
import type { Connection } from '../../src/data/types';
import { buildGraph, reachableFrom, shortestPath } from '../../src/systems/navigation/graph';

function edge(id: string, from: string, to: string, portal = false): Connection {
  return {
    id,
    from: { room: from, anchor: 'a' },
    to: { room: to, anchor: 'b' },
    kind: portal ? 'vestibule_portal' : 'corridor',
    portal,
    buildStatus: 'v1',
    provenance: 'INF-D',
    basis: portal ? 'portal' : 'inferred',
    state: 'stable',
    observedStates: [],
    summary: '',
    evidence: [],
  };
}

const NODES = ['A', 'B', 'C', 'D', 'E'];
const EDGES = [
  edge('e1', 'A', 'B'),
  edge('e2', 'B', 'C'),
  edge('e3', 'A', 'C'),
  edge('p1', 'C', 'D', true),
];

describe('buildGraph / reachableFrom', () => {
  it('treats edges as undirected', () => {
    const g = buildGraph(NODES, EDGES);
    expect([...reachableFrom(g, 'C')].sort()).toEqual(['A', 'B', 'C']);
  });

  it('excludes portals by default and includes them on request', () => {
    expect(reachableFrom(buildGraph(NODES, EDGES), 'A').has('D')).toBe(false);
    expect(reachableFrom(buildGraph(NODES, EDGES, { includePortals: true }), 'A').has('D')).toBe(
      true,
    );
  });

  it('ignores edges whose endpoints are outside the node set', () => {
    const g = buildGraph(['A', 'B'], EDGES);
    expect(g.adjacency.get('A')?.map((e) => e.connectionId)).toEqual(['e1']);
  });

  it('returns an empty set for an unknown start', () => {
    expect(reachableFrom(buildGraph(NODES, EDGES), 'Z').size).toBe(0);
  });
});

describe('shortestPath', () => {
  const g = buildGraph(NODES, EDGES, { includePortals: true });

  it('finds the fewest-hop path by default', () => {
    expect(shortestPath(g, 'A', 'C')).toEqual({ rooms: ['A', 'C'], connections: ['e3'], cost: 1 });
  });

  it('respects connection weights', () => {
    const weights: Record<string, number> = { e1: 1, e2: 1, e3: 5, p1: 1 };
    const path = shortestPath(g, 'A', 'D', (id) => weights[id] ?? 1);
    expect(path).toEqual({ rooms: ['A', 'B', 'C', 'D'], connections: ['e1', 'e2', 'p1'], cost: 3 });
  });

  it('returns a zero-cost path to itself', () => {
    expect(shortestPath(g, 'B', 'B')).toEqual({ rooms: ['B'], connections: [], cost: 0 });
  });

  it('returns null when unreachable or unknown', () => {
    expect(shortestPath(g, 'A', 'E')).toBeNull();
    expect(shortestPath(g, 'A', 'Z')).toBeNull();
  });

  it('rejects negative weights', () => {
    expect(() => shortestPath(g, 'A', 'C', () => -1)).toThrow(/Invalid weight/);
  });
});
