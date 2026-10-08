import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { getPath, PATHS } from '../../src/data/paths';
import { CONSOLE_ROOM_IDS } from '../../src/world/rooms/console/describe';

const consoleRooms = new Set<string>(CONSOLE_ROOM_IDS);
const outside = V1_CONNECTIONS.filter(
  (c) => !(consoleRooms.has(c.from.room) && consoleRooms.has(c.to.room)),
);

describe('authored connection paths', () => {
  it('cover exactly the v1 edges outside the console room, once each', () => {
    const ids = PATHS.map((p) => p.connectionId);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(outside.map((c) => c.id).sort());
    for (const c of outside) expect(getPath(c.id)?.connectionId).toBe(c.id);
    // The console's own edges come from its parameters, not from authored waypoints.
    for (const id of ['B01', 'B02', 'B03', 'B04', 'B05', 'B06'])
      expect(getPath(id)).toBeUndefined();
  });

  it('give doorways and the portal no waypoints, and the passages theirs', () => {
    for (const c of outside) {
      const p = getPath(c.id);
      if (c.kind === 'doorway' || c.portal) expect(p?.via, c.id).toEqual([]);
    }
    expect(getPath('B37')?.via.length).toBeGreaterThanOrEqual(3);
  });

  it('use axis-aligned legs between waypoints: level, sloped along one axis, or vertical', () => {
    for (const p of PATHS) {
      for (const v of p.via)
        for (const n of v) expect(Number.isFinite(n), p.connectionId).toBe(true);
      p.via.slice(1).forEach((b, i) => {
        const a = p.via[i] as readonly number[];
        const moved = [0, 2].filter((k) => Math.abs((b[k] as number) - (a[k] as number)) > 1e-9);
        expect(moved.length, `${p.connectionId} leg ${i}`).toBeLessThanOrEqual(1);
        const rise = Math.abs((b[1] as number) - (a[1] as number));
        const run =
          moved.length === 1
            ? Math.abs((b[moved[0] as number] as number) - (a[moved[0] as number] as number))
            : 0;
        // Flights are no steeper than the console's own 45° stairs.
        if (run > 0) expect(rise / run, `${p.connectionId} leg ${i}`).toBeLessThanOrEqual(1);
      });
    }
  });

  it('build the engine bypass B37 with a vertical shaft leg', () => {
    const via = getPath('B37')?.via ?? [];
    const vertical = via.slice(1).some((b, i) => {
      const a = via[i] as readonly number[];
      return b[0] === a[0] && b[2] === a[2] && b[1] !== a[1];
    });
    expect(vertical).toBe(true);
  });
});
