import { describe, expect, it } from 'vitest';
import { CONNECTIONS, V1_CONNECTIONS } from '../../src/data/connections';
import { PLACED_ROOMS, ROOMS } from '../../src/data/rooms';
import { buildGraph, reachableFrom, shortestPath } from '../../src/systems/navigation/graph';

const placedIds = PLACED_ROOMS.map((r) => r.id);
const stable = buildGraph(placedIds, V1_CONNECTIONS); // portals excluded by default

describe('v1 stable snapshot connectivity (portals disabled)', () => {
  it.each(placedIds)('%s has a physical route to the console main deck', (id) => {
    expect(shortestPath(stable, 'C-M', id)).not.toBeNull();
  });

  it('reaches the engine through the B37 bypass in 5 edges', () => {
    const path = shortestPath(stable, 'C-M', 'ENG-01');
    expect(path?.connections).toContain('B37');
    expect(path?.connections).not.toContain('B28');
    expect(path?.connections).toHaveLength(5);
  });

  it('loses the engine when B37 is removed (the invariant bites)', () => {
    const withoutBypass = buildGraph(
      placedIds,
      V1_CONNECTIONS.filter((c) => c.id !== 'B37'),
    );
    expect(reachableFrom(withoutBypass, 'C-M').has('ENG-01')).toBe(false);
    const withPortal = buildGraph(
      placedIds,
      V1_CONNECTIONS.filter((c) => c.id !== 'B37'),
      { includePortals: true },
    );
    expect(shortestPath(withPortal, 'C-M', 'ENG-01')?.connections).toContain('B28');
  });

  it('has no isolated placed room', () => {
    for (const id of placedIds) expect(stable.adjacency.get(id)?.length, id).toBeGreaterThan(0);
  });
});

describe('full inventory graph (research §F5 audit)', () => {
  const full = buildGraph(
    ROOMS.map((r) => r.id),
    CONNECTIONS,
  );

  it('reaches 34 nodes from C-M with B28 disabled; only X-* reservations are unreachable', () => {
    const reached = reachableFrom(full, 'C-M');
    expect(reached.size).toBe(34);
    const unreachable = ROOMS.map((r) => r.id).filter((id) => !reached.has(id));
    expect(unreachable).toEqual(['X-01', 'X-02', 'X-03']);
  });
});
