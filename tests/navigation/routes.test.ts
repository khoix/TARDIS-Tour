import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import type { Vec3 } from '../../src/data/layout';
import { PLACED_ROOMS } from '../../src/data/rooms';
import {
  CONSOLE_ROOM_ID,
  edgeKindLabel,
  planRoute,
  polylineLength,
  type Route,
  routeLine,
} from '../../src/systems/navigation/routes';
import { describeTier1Map } from '../../src/world/skeleton';

const map = describeTier1Map();
const walkLines = new Map(map.paths.map((p) => [p.connectionId, p.points]));
const placedIds = PLACED_ROOMS.map((r) => r.id);
const anchorsOf = (room: string) =>
  map.anchors.filter((a) => a.roomId === room).map((a) => a.position);
const same = (a: Vec3, b: Vec3) => a.every((v, i) => Math.abs(v - (b[i] as number)) < 1e-9);
const isAnchorOf = (p: Vec3 | undefined, room: string) =>
  p !== undefined && anchorsOf(room).some((a) => same(a, p));

function route(from: string, to: string, allowPortal = false): Route {
  const r = planRoute(from, to, placedIds, V1_CONNECTIONS, walkLines, { allowPortal });
  if (!r) throw new Error(`no route ${from} → ${to}`);
  return r;
}

describe('routes by walk-line length', () => {
  it('every v1 edge has a walk line to weigh it by', () => {
    for (const c of V1_CONNECTIONS) expect(walkLines.has(c.id), c.id).toBe(true);
  });

  it('console → library climbs to the gallery and runs the cultural spine', () => {
    const r = route(CONSOLE_ROOM_ID, 'L-01');
    expect(r.connections).toEqual(['B02', 'B04', 'B07', 'B08', 'B09']);
    expect(r.steps.map((s) => s.kind)).toEqual([
      'stairs',
      'doorway',
      'corridor',
      'corridor',
      'doorway',
    ]);
    const total = r.connections.reduce(
      (sum, id) => sum + polylineLength(walkLines.get(id) ?? []),
      0,
    );
    expect(r.length).toBeCloseTo(total, 9);
  });

  it('console → engine takes the B37 bypass with portals off', () => {
    const r = route(CONSOLE_ROOM_ID, 'ENG-01');
    expect(r.connections).toEqual(['B03', 'B05', 'B16', 'B22', 'B37']);
    expect(r.connections).not.toContain('B28');
    expect(r.allowPortal).toBe(false);
  });

  it('console → engine goes through the B28 portal when allowed, because it is shorter', () => {
    const off = route(CONSOLE_ROOM_ID, 'ENG-01');
    const on = route(CONSOLE_ROOM_ID, 'ENG-01', true);
    expect(on.connections.at(-1)).toBe('B28');
    expect(on.connections).not.toContain('B37');
    expect(on.steps.at(-1)?.portal).toBe(true);
    expect(on.length).toBeLessThan(off.length);
  });

  it('route to console from the engine walks B37 first, each step oriented in travel order', () => {
    const r = route('ENG-01', CONSOLE_ROOM_ID);
    expect(r.connections).toEqual(['B37', 'B22', 'B16', 'B05', 'B03']);
    expect(r.rooms).toEqual(['ENG-01', 'M-02', 'M-01', 'C-XL', 'C-L', 'C-M']);
    const first = r.steps[0];
    expect(isAnchorOf(first?.points[0], 'ENG-01')).toBe(true);
    expect(isAnchorOf(first?.points.at(-1), 'M-02')).toBe(true);
  });

  it('loses the engine without B37 and without the portal', () => {
    const noBypass = V1_CONNECTIONS.filter((c) => c.id !== 'B37');
    const opts = (allowPortal: boolean) => ({ allowPortal });
    expect(planRoute('C-M', 'ENG-01', placedIds, noBypass, walkLines, opts(false))).toBeNull();
    expect(planRoute('C-M', 'ENG-01', placedIds, noBypass, walkLines, opts(true))).not.toBeNull();
  });

  it('a room to itself has no steps; unknown rooms have no route', () => {
    expect(route('L-01', 'L-01').steps).toEqual([]);
    expect(
      planRoute('L-01', 'X-01', placedIds, V1_CONNECTIONS, walkLines, { allowPortal: false }),
    ).toBeNull();
  });

  it('is continuous between every pair of placed rooms: anchor to anchor, room to room', () => {
    for (const from of placedIds) {
      for (const to of placedIds) {
        if (from === to) continue;
        const r = route(from, to);
        expect(r.rooms[0]).toBe(from);
        expect(r.rooms.at(-1)).toBe(to);
        r.steps.forEach((step, i) => {
          expect(step.from).toBe(r.rooms[i]);
          expect(step.to).toBe(r.rooms[i + 1]);
          // Each walk line leaves from an anchor of the room it starts in and arrives at one
          // of the next room, so consecutive steps meet inside the same room.
          expect(isAnchorOf(step.points[0], step.from), `${step.connectionId} start`).toBe(true);
          expect(isAnchorOf(step.points.at(-1), step.to), `${step.connectionId} end`).toBe(true);
        });
        const line = routeLine(r);
        expect(isAnchorOf(line[0], from)).toBe(true);
        expect(isAnchorOf(line.at(-1), to)).toBe(true);
        for (let i = 1; i < line.length; i++) {
          expect(same(line[i - 1] as Vec3, line[i] as Vec3)).toBe(false);
        }
      }
    }
  });

  it('measures polylines and names edge kinds', () => {
    expect(
      polylineLength([
        [0, 0, 0],
        [3, 4, 0],
        [3, 4, 2],
      ]),
    ).toBe(7);
    expect(edgeKindLabel('stairs')).toBe('Stairs');
    expect(edgeKindLabel('vestibule_portal')).toBe('Portal');
  });
});
