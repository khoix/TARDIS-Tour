import { describe, expect, it } from 'vitest';
import {
  CONSOLE_RADIUS_NU,
  DECK_Y,
  getTransform,
  LAYOUT,
  LAYOUT_UNITS,
} from '../../src/data/layout';
import { PLACED_ROOMS, ROOMS } from '../../src/data/rooms';
import type { RegionId } from '../../src/data/types';
import { roomBounds } from '../../src/scene/topology';

const placedIds = PLACED_ROOMS.map((r) => r.id);

function floorY(id: string): number {
  const t = getTransform(id);
  if (!t) throw new Error(`no transform for ${id}`);
  return t.position[1];
}

function regionRooms(region: RegionId): string[] {
  return PLACED_ROOMS.filter((r) => r.region === region).map((r) => r.id);
}

describe('provisional layout', () => {
  it('covers every placed room exactly once and nothing else', () => {
    const ids = LAYOUT.map((t) => t.roomId);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...placedIds].sort());
    const unplaced = ROOMS.filter((r) => !r.placed).map((r) => r.id);
    for (const id of unplaced) expect(getTransform(id), id).toBeUndefined();
  });

  it('uses normalized units and design placements only', () => {
    expect(LAYOUT_UNITS).toBe('normalized');
    expect(CONSOLE_RADIUS_NU).toBe(10);
    for (const t of LAYOUT) {
      expect(t.placementBasis, t.roomId).toBe('design');
      for (const v of [...t.position, ...t.size]) expect(Number.isFinite(v), t.roomId).toBe(true);
      for (const s of t.size) expect(s, t.roomId).toBeGreaterThan(0);
    }
  });

  it('keeps the console main deck on the rotor axis at Y = 0 and its decks in order', () => {
    expect(getTransform('C-M')?.position).toEqual([0, 0, 0]);
    expect(floorY('C-U')).toBe(DECK_Y.gallery);
    expect(floorY('C-L')).toBe(DECK_Y.lower);
    expect(DECK_Y.gallery).toBeGreaterThan(DECK_Y.main);
    expect(DECK_Y.main).toBeGreaterThan(DECK_Y.lower);
  });

  it('follows the documented vertical order of regions', () => {
    for (const id of regionRooms('cultural')) {
      expect(floorY(id), id).toBeGreaterThanOrEqual(DECK_Y.gallery);
    }
    for (const id of regionRooms('maintenance')) {
      expect(floorY(id), id).toBeLessThan(DECK_Y.lower);
    }
    const maintenanceFloor = Math.min(...regionRooms('maintenance').map(floorY));
    for (const id of regionRooms('power-core')) {
      expect(floorY(id), id).toBeLessThan(maintenanceFloor);
    }
  });

  it('has no overlapping room volumes', () => {
    const boxes = LAYOUT.map((t) => ({ id: t.roomId, b: roomBounds(t) }));
    boxes.forEach((a, i) => {
      for (const c of boxes.slice(i + 1)) {
        const overlaps = ([0, 1, 2] as const).every(
          (k) => a.b.min[k] < c.b.max[k] && c.b.min[k] < a.b.max[k],
        );
        expect(overlaps, `${a.id} overlaps ${c.id}`).toBe(false);
      }
    });
  });
});
