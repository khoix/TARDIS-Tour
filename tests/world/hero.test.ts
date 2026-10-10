import { describe, expect, it } from 'vitest';
import { getConnection, V1_CONNECTIONS } from '../../src/data/connections';
import { getSource } from '../../src/data/evidence';
import { getShell, getTransform } from '../../src/data/layout';
import { getRoom, PLACED_ROOMS } from '../../src/data/rooms';
import type { Bounds } from '../../src/scene/camera/isometric';
import { roomBounds } from '../../src/scene/topology';
import { buildGraph, reachableFrom } from '../../src/systems/navigation/graph';
import {
  describeHeroRoom,
  describeHeroRooms,
  describeJourneyMap,
  HERO_ROOM_IDS,
  PORTAL_LABEL,
  RECONFIGURING_LABEL,
} from '../../src/world/rooms/hero/describe';
import { HERO_PARAM_NOTES, HERO_PARAMS, type HeroParams } from '../../src/world/rooms/hero/params';
import { describeTier1Map, MAP_START_SURFACE } from '../../src/world/skeleton';
import {
  azimuthVector,
  EVIDENCE_CLASSES,
  evidenceClassOfProvenance,
  type KitPrimitive,
  MESH_PARTS,
  type StructureElement,
  type Vec2,
} from '../../src/world/structure';
import { checkGraphAgreement, reachableRooms, validateStructure } from '../../src/world/validate';

const map = describeJourneyMap();
const tier1 = describeTier1Map();
const hero = describeHeroRooms();
const placed = PLACED_ROOMS.map((r) => r.id);
const EPS = 1e-6;

function boxOf(roomId: string): Bounds {
  const t = getTransform(roomId);
  if (!t) throw new Error(`no layout for ${roomId}`);
  return roomBounds(t);
}

function corners(min: readonly number[], max: readonly number[]): Vec2[] {
  return [
    [min[0] as number, min[2] as number],
    [max[0] as number, min[2] as number],
    [min[0] as number, max[2] as number],
    [max[0] as number, max[2] as number],
  ];
}

/** Axis-aligned bounds of what a primitive draws (conservative for rotated repeats). */
function primitiveBounds(p: KitPrimitive): Bounds {
  switch (p.type) {
    case 'box':
      return { min: p.min, max: p.max };
    case 'plate':
      return {
        min: [p.center[0] - p.outer, p.bottom, p.center[1] - p.outer],
        max: [p.center[0] + p.outer, p.top, p.center[1] + p.outer],
      };
    case 'ladder': {
      const h = p.width / 2;
      return {
        min: [
          Math.min(p.bottom[0], p.top[0]) - h,
          Math.min(p.bottom[1], p.top[1]),
          Math.min(p.bottom[2], p.top[2]) - h,
        ],
        max: [
          Math.max(p.bottom[0], p.top[0]) + h,
          Math.max(p.bottom[1], p.top[1]),
          Math.max(p.bottom[2], p.top[2]) + h,
        ],
      };
    }
    case 'railing':
      if (p.path !== 'line') throw new Error('arc railings are not used by hero rooms');
      return {
        min: [
          Math.min(p.from[0], p.to[0]),
          Math.min(p.from[1], p.to[1]),
          Math.min(p.from[2], p.to[2]),
        ],
        max: [
          Math.max(p.from[0], p.to[0]),
          Math.max(p.from[1], p.to[1]) + p.height,
          Math.max(p.from[2], p.to[2]),
        ],
      };
    case 'sweep': {
      // Sections lie across the run, along (dz, 0, −dx) of its horizontal direction.
      const pts = p.sections.flatMap((x) => x.outline);
      const s = Math.max(...pts.map(([a]) => Math.abs(a)));
      const v0 = Math.min(...pts.map(([, v]) => v));
      const v1 = Math.max(...pts.map(([, v]) => v));
      const dx = p.to[0] - p.from[0];
      const dz = p.to[2] - p.from[2];
      const len = Math.hypot(dx, dz);
      const sx = (Math.abs(dz) / len) * s;
      const sz = (Math.abs(dx) / len) * s;
      return {
        min: [
          Math.min(p.from[0], p.to[0]) - sx,
          Math.min(p.from[1], p.to[1]) + v0,
          Math.min(p.from[2], p.to[2]) - sz,
        ],
        max: [
          Math.max(p.from[0], p.to[0]) + sx,
          Math.max(p.from[1], p.to[1]) + v1,
          Math.max(p.from[2], p.to[2]) + sz,
        ],
      };
    }
    case 'instances': {
      // Union of the base's footprint corners turned by each placement's yaw (about +Y).
      const base = primitiveBounds(p.base);
      const min = [Infinity, Infinity, Infinity];
      const max = [-Infinity, -Infinity, -Infinity];
      for (const q of p.placements) {
        const a = (q.yawDeg * Math.PI) / 180;
        for (const [x, z] of corners(base.min, base.max)) {
          const wx = q.position[0] + x * Math.cos(a) + z * Math.sin(a);
          const wz = q.position[2] - x * Math.sin(a) + z * Math.cos(a);
          min[0] = Math.min(min[0] as number, wx);
          max[0] = Math.max(max[0] as number, wx);
          min[2] = Math.min(min[2] as number, wz);
          max[2] = Math.max(max[2] as number, wz);
        }
        min[1] = Math.min(min[1] as number, q.position[1] + base.min[1]);
        max[1] = Math.max(max[1] as number, q.position[1] + base.max[1]);
      }
      return { min: min as unknown as Bounds['min'], max: max as unknown as Bounds['max'] };
    }
    case 'doorway': {
      const [nx, nz] = azimuthVector(p.azimuthDeg);
      const along = p.width / 2 + 0.5;
      const across = p.depth / 2;
      const hx = Math.abs(nx) > 0.5 ? across : along;
      const hz = Math.abs(nz) > 0.5 ? across : along;
      return {
        min: [p.sill[0] - hx, p.sill[1], p.sill[2] - hz],
        max: [p.sill[0] + hx, p.sill[1] + p.height + 0.5, p.sill[2] + hz],
      };
    }
    default:
      throw new Error(`${p.type} is not used by hero rooms`);
  }
}

function inside(inner: Bounds, outer: Bounds): boolean {
  return [0, 1, 2].every(
    (i) =>
      (inner.min[i] as number) >= (outer.min[i] as number) - EPS &&
      (inner.max[i] as number) <= (outer.max[i] as number) + EPS,
  );
}

const SOLID = new Set(['box', 'plate', 'instances', 'sweep', 'ladder']);

/** Bounds of each solid an element draws: one per placement for instanced repeats. */
function solids(e: StructureElement): Bounds[] {
  const p = e.primitive;
  if (!SOLID.has(p.type)) return [];
  if (p.type !== 'instances') return [primitiveBounds(p)];
  return p.placements.map((q) => primitiveBounds({ ...p, placements: [q] }));
}

/** True when a hero solid stands in the walker's column at `p` (floor to head height). */
function blocks(e: StructureElement, p: readonly number[]): boolean {
  const [x, y, z] = p as [number, number, number];
  return solids(e).some(
    (b) =>
      b.max[1] - b.min[1] > 0.05 && // flat floor inlays (seal strips, chevrons) are stepped on
      x > b.min[0] + EPS &&
      x < b.max[0] - EPS &&
      z > b.min[2] + EPS &&
      z < b.max[2] - EPS &&
      b.min[1] < y + 1.9 &&
      b.max[1] > y + 0.05,
  );
}

/** Each hero room's dressing; describeHeroRooms lists them in HERO_ROOM_IDS order. */
const dressings = HERO_ROOM_IDS.map((id) => describeHeroRoom(id));

describe('Journey hero rooms (Execution 5)', () => {
  it('passes every rule of the spatial validator over the full structure, portals disabled', () => {
    expect(validateStructure(map, MAP_START_SURFACE)).toEqual([]);
  });

  it('keeps every room volume, anchor and path of the Tier-1 map', () => {
    expect(hero.roomIds).toEqual([]);
    expect(hero.volumes).toEqual([]);
    expect(hero.anchors).toEqual([]);
    expect(hero.paths).toEqual([]);
    expect(map.volumes).toEqual(tier1.volumes);
    expect(map.anchors).toEqual(tier1.anchors);
    expect(map.paths).toEqual(tier1.paths);
    expect(map.roomIds).toEqual(tier1.roomIds);
  });

  it('keeps each hero room’s anchors on its unchanged walk surfaces', () => {
    const surfaces = new Map(map.surfaces.map((s) => [s.id, s]));
    for (const id of HERO_ROOM_IDS) {
      const anchors = map.anchors.filter((a) => a.roomId === id);
      expect(anchors.map((a) => a.anchorId).sort(), id).toEqual(
        getRoom(id)
          ?.anchors.map((a) => a.id)
          .sort(),
      );
      for (const a of anchors) {
        expect(surfaces.get(a.surfaceId), `${id}.${a.anchorId}`).toEqual(
          tier1.surfaces.find((s) => s.id === a.surfaceId),
        );
      }
    }
    const level = (id: string) => tier1.surfaces.find((s) => s.id === id)?.y;
    expect(level(map.anchors.find((a) => a.roomId === 'E-01')?.surfaceId ?? '')).toBe(-28);
    expect(level(map.anchors.find((a) => a.roomId === 'ENG-01')?.surfaceId ?? '')).toBe(-35);
    expect(level(map.anchors.find((a) => a.roomId === 'F-01')?.surfaceId ?? '')).toBe(-28);
    expect(map.volumes.some((v) => v.id === 'F-01.fuel-cells')).toBe(true);
  });

  it('walks from C-M to every placed room, the engine only by B37, and agrees with the graph', () => {
    expect(reachableRooms(map, MAP_START_SURFACE)).toEqual(new Set(placed));
    const cut = { excludeConnections: new Set(['B37']) };
    expect(reachableRooms(map, MAP_START_SURFACE, cut).has('ENG-01')).toBe(false);
    const graph = buildGraph(placed, V1_CONNECTIONS);
    expect(checkGraphAgreement(map, MAP_START_SURFACE, reachableFrom(graph, 'C-M'))).toEqual([]);
    const cutGraph = buildGraph(
      placed,
      V1_CONNECTIONS.filter((c) => c.id !== 'B37'),
    );
    expect(
      checkGraphAgreement(map, MAP_START_SURFACE, reachableFrom(cutGraph, 'C-M'), cut),
    ).toEqual([]);
  });

  it('describes recognizable detail for every hero room, inside its fixed layout box', () => {
    expect([...HERO_ROOM_IDS].sort()).toEqual(Object.keys(HERO_PARAMS).sort());
    for (const id of HERO_ROOM_IDS) {
      const d = describeHeroRoom(id);
      expect(d.elements.length, id).toBeGreaterThanOrEqual(2);
      for (const e of d.elements) {
        expect(inside(primitiveBounds(e.primitive), boxOf(id)), `${id}:${e.tag.part}`).toBe(true);
      }
    }
  });

  it('leaves every walk line and door anchor clear at head height', () => {
    for (const id of HERO_ROOM_IDS) {
      const b = boxOf(id);
      const solids = describeHeroRoom(id).elements;
      const points: (readonly number[])[] = map.paths.flatMap((p) =>
        p.points.flatMap((q, i): (readonly number[])[] => {
          const prev = p.points[i - 1];
          if (!prev || Math.abs(prev[1] - q[1]) > EPS) return [q];
          const n = Math.max(1, Math.ceil(Math.hypot(q[0] - prev[0], q[2] - prev[2]) / 0.25));
          return Array.from({ length: n + 1 }, (_, k) =>
            [0, 1, 2].map(
              (a) => (prev[a] as number) + ((q[a] as number) - (prev[a] as number)) * (k / n),
            ),
          );
        }),
      );
      const own = points.filter((q) =>
        [0, 1, 2].every(
          (a) =>
            (q[a] as number) >= (b.min[a] as number) - EPS &&
            (q[a] as number) <= (b.max[a] as number) + EPS,
        ),
      );
      expect(own.length, id).toBeGreaterThan(0);
      for (const q of own) {
        for (const e of solids)
          expect(blocks(e, q), `${id}:${e.tag.part} at ${q.join()}`).toBe(false);
      }
    }
  });

  it('tags every hero element with a known node, part and evidence class', () => {
    expect(hero.elements).toEqual(dressings.flatMap((d) => d.elements));
    const known = new Set([...placed, ...V1_CONNECTIONS.map((c) => c.id)]);
    for (const { roomId, elements } of dressings) {
      for (const e of elements) {
        expect(known.has(e.tag.id), e.tag.id).toBe(true);
        expect(MESH_PARTS).toContain(e.tag.part);
        expect(EVIDENCE_CLASSES).toContain(e.tag.evidenceClass);
        if (e.tag.kind === 'connection') {
          const c = getConnection(e.tag.id);
          expect(e.tag.evidenceClass).toBe(evidenceClassOfProvenance(c?.provenance ?? 'INF-E'));
        } else {
          expect(e.tag.id).toBe(roomId);
        }
      }
    }
  });

  it('instances only decorative dressing, never anything walked on or enclosing a route', () => {
    for (const e of hero.elements.filter((x) => x.primitive.type === 'instances')) {
      expect(['stack', 'prop', 'glow', 'rod', 'debris', 'machine']).toContain(e.tag.part);
    }
  });
});

describe('hero feature parameters', () => {
  it('records an evidence basis with resolvable sources for every parameter', () => {
    for (const id of HERO_ROOM_IDS) {
      const params = HERO_PARAMS[id] as unknown as Record<string, unknown>;
      const notes = HERO_PARAM_NOTES[id] as unknown as Record<
        string,
        { basis: string; sourceIds: readonly string[]; note: string }
      >;
      expect(Object.keys(notes).sort(), id).toEqual(Object.keys(params).sort());
      for (const [key, note] of Object.entries(notes)) {
        expect(['verified', 'order', 'design'], `${id}.${key}`).toContain(note.basis);
        expect(note.note.length, `${id}.${key}`).toBeGreaterThan(10);
        for (const s of note.sourceIds) expect(getSource(s), `${id}.${key} → ${s}`).toBeDefined();
      }
    }
  });

  it('keeps the library floor count a documented design choice, not a five or six storey claim', () => {
    const { floorCount } = HERO_PARAMS['L-01'];
    expect([5, 6]).not.toContain(floorCount);
    const note = HERO_PARAM_NOTES['L-01'].floorCount;
    expect(note.basis).toBe('design');
    expect(note.sourceIds).toEqual(['S05', 'S28']);
    expect(note.note).toMatch(/not a storey claim/);
    expect(getRoom('L-01')?.evidence.some((r) => /floorCount = null/.test(r.note))).toBe(true);
  });

  it('builds the library from its floorCount parameter: one railed gallery and ladder per upper storey', () => {
    for (const floorCount of [1, 2, 3, 4]) {
      const params: HeroParams = {
        ...HERO_PARAMS,
        'L-01': { ...HERO_PARAMS['L-01'], floorCount },
      };
      const library = describeHeroRoom('L-01', params);
      expect(library.surfaces.length).toBe(floorCount - 1);
      expect(library.elements.filter((e) => e.tag.part === 'ladder').length).toBe(floorCount - 1);
      expect(
        validateStructure(describeJourneyMap(params), MAP_START_SURFACE),
        `${floorCount}`,
      ).toEqual([]);
    }
    const tooTall: HeroParams = {
      ...HERO_PARAMS,
      'L-01': { ...HERO_PARAMS['L-01'], floorCount: 5 },
    };
    expect(() => describeHeroRoom('L-01', tooTall)).toThrow(/exceed the room/);
  });
});

describe('hero features', () => {
  const partsOf = (id: (typeof HERO_ROOM_IDS)[number], part: string) =>
    describeHeroRoom(id).elements.filter((e) => e.tag.part === part);

  it('S-01: shelving with mementos, and the cot', () => {
    expect(partsOf('S-01', 'stack').length).toBeGreaterThan(0);
    expect(partsOf('S-01', 'prop').length).toBeGreaterThan(5);
    for (const e of describeHeroRoom('S-01').elements) expect(e.tag.evidenceClass).toBe('sourced');
  });

  it('L-01: stacks rise through every storey to the top of the shelving', () => {
    const p = HERO_PARAMS['L-01'];
    const top = Math.max(
      ...partsOf('L-01', 'stack').map((e) => primitiveBounds(e.primitive).max[1]),
    );
    expect(top).toBeCloseTo(boxOf('L-01').min[1] + p.floorCount * p.levelHeight, 6);
  });

  it('ARS-01: a tall branching machine whose orbs glow, and the reconfiguring door marked from data', () => {
    const b = boxOf('ARS-01');
    const machine = partsOf('ARS-01', 'machine').map((e) => primitiveBounds(e.primitive));
    expect(Math.max(...machine.map((m) => m.max[1])) - b.min[1]).toBeGreaterThan(
      (b.max[1] - b.min[1]) * 0.7,
    );
    const glow = partsOf('ARS-01', 'glow');
    const orbs = glow.find((e) => e.primitive.type === 'instances');
    expect(orbs?.primitive.type === 'instances' && orbs.primitive.placements.length).toBe(
      HERO_PARAMS['ARS-01'].tierHeights.length * HERO_PARAMS['ARS-01'].branchesPerTier,
    );
    const reconfiguring = V1_CONNECTIONS.filter((c) => c.observedStates.includes('reconfiguring'));
    expect(reconfiguring.map((c) => c.id)).toEqual(['B18']);
    const markers = (id: string) =>
      dressings
        .filter((d) => d.roomId === id)
        .flatMap((d) => d.elements)
        .filter((e) => e.label === RECONFIGURING_LABEL);
    expect(markers('ARS-01').map((e) => [e.tag.kind, e.tag.id, e.labelKind])).toEqual([
      ['connection', 'B18', 'feature'],
    ]);
    expect(hero.elements.filter((e) => e.label === RECONFIGURING_LABEL).length).toBe(1);
  });

  it('F-01: exposed glowing rods in the tunnel and between the fuel cells', () => {
    const rods = partsOf('F-01', 'rod').map((e) => primitiveBounds(e.primitive));
    const deck = map.volumes.find((v) => v.id === 'F-01.fuel-cells');
    if (deck?.shape !== 'box') throw new Error('no fuel-cell deck');
    expect(rods.some((r) => r.max[1] <= deck.min[1])).toBe(true);
    expect(rods.some((r) => r.min[1] >= deck.min[1])).toBe(true);
  });

  it('E-A: sealed by bulkheads on both doors', () => {
    expect(partsOf('E-A', 'machine').length).toBeGreaterThanOrEqual(2 * 3);
  });

  it('E-01: a glowing core under the catwalk, and more thresholds than the route uses', () => {
    const catwalkY = boxOf('E-01').min[1] + (getShell('E-01')?.doors[0]?.sill ?? 0);
    const core = partsOf('E-01', 'glow').map((e) => primitiveBounds(e.primitive));
    expect(core.length).toBeGreaterThan(0);
    for (const c of core) expect(c.max[1]).toBeLessThan(catwalkY);
    expect(partsOf('E-01', 'door-closed').length).toBe(HERO_PARAMS['E-01'].blindThresholds);
  });

  it('E-V: the portal is marked as non-ordinary and stays out of the walk', () => {
    const marks = describeHeroRoom('E-V').elements;
    for (const e of marks) {
      expect(e.tag).toMatchObject({ kind: 'connection', id: 'B28', part: 'portal' });
    }
    expect(marks.filter((e) => e.label === PORTAL_LABEL).map((e) => e.labelKind)).toEqual([
      'feature',
    ]);
    expect(getConnection('B28')?.portal).toBe(true);
  });

  it('ENG-01: the frozen explosion fills the void below the gallery', () => {
    const galleryY = boxOf('ENG-01').min[1] + (getShell('ENG-01')?.doors[0]?.sill ?? 0);
    const burst = [...partsOf('ENG-01', 'debris'), ...partsOf('ENG-01', 'glow')].map((e) =>
      primitiveBounds(e.primitive),
    );
    expect(burst.length).toBeGreaterThan(3);
    for (const b of burst) expect(b.max[1]).toBeLessThan(galleryY);
  });
});
