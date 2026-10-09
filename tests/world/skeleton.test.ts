import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { DECK_Y, getTransform, ROOM_SHELLS } from '../../src/data/layout';
import { getRoom, PLACED_ROOMS } from '../../src/data/rooms';
import type { RegionId } from '../../src/data/types';
import { unionBounds } from '../../src/scene/camera/isometric';
import { roomBounds } from '../../src/scene/topology';
import { buildGraph, reachableFrom, shortestPath } from '../../src/systems/navigation/graph';
import { CONSOLE_ROOM_IDS } from '../../src/world/rooms/console/describe';
import { describeSkeleton, describeTier1Map, MAP_START_SURFACE } from '../../src/world/skeleton';
import {
  EVIDENCE_CLASSES,
  evidenceClassOfProvenance,
  MESH_PARTS,
  type PathSegment,
  type StructureDescription,
  type Volume,
} from '../../src/world/structure';
import {
  checkDanglingEnds,
  checkGraphAgreement,
  checkPathSupport,
  checkVolumeOverlaps,
  reachableRooms,
  validateStructure,
} from '../../src/world/validate';
import { samePoint, volumeBounds } from '../../src/world/validate/geometry';

const map = describeTier1Map();
const skeleton = describeSkeleton();
const placed = PLACED_ROOMS.map((r) => r.id);
const graph = buildGraph(placed, V1_CONNECTIONS);

type Box = Extract<Volume, { shape: 'box' }>;

function anchor(roomId: string, anchorId: string) {
  const a = map.anchors.find((x) => x.roomId === roomId && x.anchorId === anchorId);
  if (!a) throw new Error(`no anchor ${roomId}.${anchorId}`);
  return a;
}

function pathOf(connectionId: string): PathSegment {
  const p = map.paths.find((x) => x.connectionId === connectionId);
  if (!p) throw new Error(`no path for ${connectionId}`);
  return p;
}

function boxesOf(ownerId: string): Box[] {
  return map.volumes.filter((v): v is Box => v.ownerId === ownerId && v.shape === 'box');
}

function regionOf(id: string): RegionId {
  const r = getRoom(id);
  if (!r) throw new Error(`no room ${id}`);
  return r.region;
}

function floorsOf(region: RegionId): number[] {
  return PLACED_ROOMS.filter((r) => r.region === region).map(
    (r) => getTransform(r.id)?.position[1] as number,
  );
}

describe('Tier-1 map: console room + corridor skeleton', () => {
  it('passes every rule of the spatial validator with portals disabled', () => {
    expect(validateStructure(map, MAP_START_SURFACE)).toEqual([]);
  });

  it('describes every placed Tier-1 room and builds one path per v1 edge', () => {
    expect([...map.roomIds].sort()).toEqual([...placed].sort());
    expect([...skeleton.roomIds].sort()).toEqual(ROOM_SHELLS.map((s) => s.roomId).sort());
    expect(map.paths.map((p) => p.connectionId).sort()).toEqual(
      V1_CONNECTIONS.map((c) => c.id).sort(),
    );
    expect(map.units).toBe('normalized');
  });

  it('ends every edge on both of its open door anchors', () => {
    for (const c of V1_CONNECTIONS) {
      const p = pathOf(c.id);
      expect(p.from, c.id).toEqual({ roomId: c.from.room, anchorId: c.from.anchor });
      expect(p.to, c.id).toEqual({ roomId: c.to.room, anchorId: c.to.anchor });
      expect(p.kind, c.id).toBe(c.kind);
      expect(p.portal, c.id).toBe(c.portal);
      const from = anchor(c.from.room, c.from.anchor);
      const to = anchor(c.to.room, c.to.anchor);
      expect(samePoint(p.points[0] as never, from.position), c.id).toBe(true);
      expect(samePoint(p.points.at(-1) as never, to.position), c.id).toBe(true);
      expect([from.state, to.state], c.id).toEqual(['open', 'open']);
    }
  });

  it('places exactly the topology anchors of every placed room, closing the unused ones', () => {
    const used = new Set(
      V1_CONNECTIONS.flatMap((c) => [
        `${c.from.room}.${c.from.anchor}`,
        `${c.to.room}.${c.to.anchor}`,
      ]),
    );
    const expected = PLACED_ROOMS.flatMap((r) => r.anchors.map((a) => `${r.id}.${a.id}`));
    const placedAnchors = map.anchors.map((a) => `${a.roomId}.${a.anchorId}`);
    expect(new Set(placedAnchors).size).toBe(placedAnchors.length);
    expect([...placedAnchors].sort()).toEqual([...expected].sort());
    for (const a of skeleton.anchors) {
      expect(a.state, `${a.roomId}.${a.anchorId}`).toBe(
        used.has(`${a.roomId}.${a.anchorId}`) ? 'open' : 'closed',
      );
    }
    // Reserved Tier-2 branches on the corridor nodes stay closed doors.
    expect(anchor('H-02', 'observatory').state).toBe('closed');
    expect(anchor('H-02', 'pool').state).toBe('closed');
    expect(anchor('M-01', 'sub-console').state).toBe('closed');
  });

  it('keeps every layout box equal to the bounding box of its room volumes', () => {
    for (const id of placed) {
      const t = getTransform(id);
      if (!t) throw new Error(`no layout for ${id}`);
      const vols = map.volumes.filter((v) => v.ownerId === id);
      expect(vols.length, id).toBeGreaterThan(0);
      expect(unionBounds(vols.map(volumeBounds)), id).toEqual(roomBounds(t));
    }
  });

  it('builds every edge as contiguous, supported segments with no midair stairs, ladders or shafts', () => {
    expect(checkPathSupport(map)).toEqual([]);
    // Each corridor edge's own pieces chain through matching openings from room to room.
    for (const c of V1_CONNECTIONS.filter((x) => x.kind === 'corridor' || x.kind === 'stairs')) {
      const pieces = boxesOf(c.id);
      if (pieces.length === 0) continue;
      for (const v of pieces) expect(v.openings?.length, v.id).toBeGreaterThanOrEqual(2);
    }
    // Ladders and stairs of the passages are exactly those their paths climb.
    const climbs = map.paths.flatMap((p) =>
      p.points.slice(1).flatMap((b, i) => {
        const a = p.points[i] as never as readonly [number, number, number];
        return Math.abs(b[1] - a[1]) > 1e-3 ? [p.connectionId] : [];
      }),
    );
    const carriers = map.elements.filter(
      (e) => e.primitive.type === 'stairs' || e.primitive.type === 'ladder',
    );
    expect(carriers).toHaveLength(climbs.length);
  });

  it('has no unintended overlaps and no dangling corridor ends', () => {
    expect(checkVolumeOverlaps(map)).toEqual([]);
    expect(checkDanglingEnds(map)).toEqual([]);
    // Every corridor piece (room or passage) declares where it opens.
    const corridorOwners = new Set([
      ...ROOM_SHELLS.filter((s) => s.kind !== 'room').map((s) => s.roomId),
      ...V1_CONNECTIONS.map((c) => c.id),
    ]);
    const corridorBoxes = map.volumes.filter(
      (v): v is Box =>
        v.shape === 'box' && corridorOwners.has(v.ownerId) && !v.id.endsWith('fuel-cells'),
    );
    expect(corridorBoxes.length).toBeGreaterThan(20);
    for (const v of corridorBoxes) expect(v.openings, v.id).toBeDefined();
  });

  it('walks from C-M to every placed room with portals disabled, reaching the engine only by B37', () => {
    expect(reachableRooms(map, MAP_START_SURFACE)).toEqual(new Set(placed));
    const withoutBypass = reachableRooms(map, MAP_START_SURFACE, {
      excludeConnections: new Set(['B37']),
    });
    expect(withoutBypass.has('ENG-01')).toBe(false);
    expect([...withoutBypass].sort()).toEqual(placed.filter((id) => id !== 'ENG-01').sort());
    expect(shortestPath(graph, 'C-M', 'ENG-01')?.connections).toContain('B37');
  });

  it('agrees with the topology graph, with and without the B37 bypass', () => {
    expect(checkGraphAgreement(map, MAP_START_SURFACE, reachableFrom(graph, 'C-M'))).toEqual([]);
    const cut = buildGraph(
      placed,
      V1_CONNECTIONS.filter((c) => c.id !== 'B37'),
    );
    expect(
      checkGraphAgreement(map, MAP_START_SURFACE, reachableFrom(cut, 'C-M'), {
        excludeConnections: new Set(['B37']),
      }),
    ).toEqual([]);
  });

  it('links the floors of both rooms of every walkable edge, edge by edge', () => {
    for (const c of V1_CONNECTIONS.filter((x) => !x.portal)) {
      const only: StructureDescription = { ...map, paths: [pathOf(c.id)] };
      const start = anchor(c.from.room, c.from.anchor).surfaceId;
      expect(reachableRooms(only, start).has(c.to.room), c.id).toBe(true);
    }
  });

  it('encloses the INF-E engine bypass B37 and labels it as authored', () => {
    const pieces = boxesOf('B37');
    expect(pieces.length).toBeGreaterThanOrEqual(3);
    const elements = map.elements.filter((e) => e.tag.kind === 'connection' && e.tag.id === 'B37');
    for (const e of elements) expect(e.tag.evidenceClass).toBe('speculative');
    expect(evidenceClassOfProvenance('INF-E')).toBe('speculative');
    const parts = new Set(elements.map((e) => e.tag.part));
    for (const part of ['floor', 'wall', 'shaft', 'ceiling', 'ladder'] as const) {
      expect(parts.has(part), part).toBe(true);
    }
    // Every piece has walls and a ceiling over it: enclosed end to end.
    const enclosing = elements.filter((e) => ['wall', 'shaft', 'ceiling'].includes(e.tag.part));
    for (const v of pieces) {
      const inside = enclosing.filter((e) => {
        const p = e.primitive;
        const pts = p.type === 'sweep' ? [p.from, p.to] : p.type === 'box' ? [p.min, p.max] : [];
        return pts.some(
          (q) =>
            q[0] >= v.min[0] - 0.5 &&
            q[0] <= v.max[0] + 0.5 &&
            q[2] >= v.min[2] - 0.5 &&
            q[2] <= v.max[2] + 0.5,
        );
      });
      expect(
        inside.some((e) => e.tag.part === 'ceiling'),
        v.id,
      ).toBe(true);
      expect(
        inside.some((e) => e.tag.part !== 'ceiling'),
        v.id,
      ).toBe(true);
    }
    const labels = elements.flatMap((e) => (e.label ? [e.label] : []));
    expect(labels).toHaveLength(1);
    expect(labels[0]).toMatch(/INF-E/);
  });

  it('keeps the B28 portal inside the enclosed vestibule E-V and out of the walk', () => {
    const b28 = pathOf('B28');
    expect(b28.portal).toBe(true);
    const [vestibule] = boxesOf('E-V');
    if (!vestibule) throw new Error('E-V has no box');
    const portal = anchor('E-V', 'portal').position;
    expect(portal[0]).toBeGreaterThan(vestibule.min[0]);
    expect(portal[0]).toBeLessThan(vestibule.max[0]);
    const portalParts = map.elements.filter((e) => e.tag.part === 'portal');
    expect(portalParts.length).toBeGreaterThan(0);
    for (const e of portalParts) expect(e.tag).toMatchObject({ kind: 'connection', id: 'B28' });
    // E-V's own walls enclose it on every side (its enclosure is authored, so inferred).
    const walls = map.elements.filter((e) => e.tag.id === 'E-V' && e.tag.part === 'wall');
    expect(walls.length).toBeGreaterThanOrEqual(4);
    for (const e of walls) expect(e.tag.evidenceClass).toBe('inferred');
  });

  it('puts the F-01 tunnel beneath a level of primary fuel cells', () => {
    const cells = map.elements.filter((e) => e.tag.id === 'F-01' && e.tag.part === 'fuel-cell');
    expect(cells.length).toBeGreaterThanOrEqual(2);
    const tunnel = boxesOf('F-01').filter((v) => v.openings?.length);
    expect(tunnel).toHaveLength(1);
    const [t] = tunnel as [Box];
    for (const e of cells) {
      if (e.primitive.type !== 'plate') throw new Error('fuel cells are plates');
      expect(e.primitive.bottom).toBeGreaterThanOrEqual(t.max[1]);
      const [x, z] = e.primitive.center;
      // Over the tunnel's footprint along its run (and within a cell of it across).
      expect(z).toBeGreaterThan(t.min[2]);
      expect(z).toBeLessThan(t.max[2]);
      expect(Math.abs(x - (t.min[0] + t.max[0]) / 2)).toBeLessThan(3);
      expect(e.tag.evidenceClass).toBe('sourced');
    }
  });

  it('descends from inhabited to industrial: culture above the console, the engine deepest', () => {
    expect(Math.min(...floorsOf('cultural'))).toBeGreaterThanOrEqual(DECK_Y.gallery);
    expect(Math.max(...floorsOf('maintenance'))).toBeLessThan(DECK_Y.lower);
    expect(Math.max(...floorsOf('power-core'))).toBeLessThan(Math.min(...floorsOf('maintenance')));
    const bottoms = map.volumes.map((v) => volumeBounds(v).min[1]);
    const engineBottom = Math.min(...boxesOf('ENG-01').map((v) => v.min[1]));
    expect(engineBottom).toBe(Math.min(...bottoms));
    // Corridor pieces take their region's tone: warm culture, steel maintenance, rust core.
    for (const e of skeleton.elements) {
      const room =
        e.tag.kind === 'room' ? e.tag.id : V1_CONNECTIONS.find((c) => c.id === e.tag.id)?.to.room;
      if (!room) throw new Error(`untraceable element ${e.tag.id}`);
      expect(e.tone, `${e.tag.id}:${e.tag.part}`).toBe(regionOf(room));
    }
  });

  it('gives every corridor piece and room shell a ceiling (hidden in the map view)', () => {
    const ceilings = map.elements.filter((e) => e.tag.part === 'ceiling');
    const owners = new Set(ceilings.map((e) => e.tag.id));
    for (const s of ROOM_SHELLS) expect(owners.has(s.roomId), s.roomId).toBe(true);
    for (const c of V1_CONNECTIONS) {
      if (boxesOf(c.id).length > 0) expect(owners.has(c.id), c.id).toBe(true);
    }
    // The console room has no ceilings: its crown and rings stay in view.
    for (const id of CONSOLE_ROOM_IDS) expect(owners.has(id), id).toBe(false);
  });

  it('uses every piece of the structural kit', () => {
    const boxes = map.volumes.filter((v): v is Box => v.shape === 'box' && !!v.openings);
    const openCount = (n: number) => boxes.filter((v) => v.openings?.length === n);
    const perpendicular = (v: Box) => {
      const [a, b] = v.openings ?? [];
      return !!a && !!b && a[1] !== b[1];
    };
    expect(openCount(2).some(perpendicular), 'corner').toBe(true);
    expect(openCount(3).length, 'T-junction').toBeGreaterThan(0);
    expect(openCount(4).length, '4-way junction / node chamber').toBeGreaterThan(1);
    const types = new Set(map.elements.map((e) => e.primitive.type));
    for (const t of ['sweep', 'stairs', 'ladder', 'doorway', 'instances', 'railing'] as const) {
      expect(types.has(t), t).toBe(true);
    }
    const parts = new Set(map.elements.map((e) => e.tag.part));
    for (const part of ['catwalk', 'shaft', 'ceiling', 'rib', 'panel', 'door-closed'] as const) {
      expect(parts.has(part), part).toBe(true);
    }
    // The octagonal node chamber (M-02) and both panel motifs.
    expect(
      map.elements.some(
        (e) => e.tag.id === 'M-02' && e.primitive.type === 'plate' && e.primitive.sides === 8,
      ),
    ).toBe(true);
    const panelSides = map.elements.flatMap((e) =>
      e.primitive.type === 'instances' &&
      e.tag.part === 'panel' &&
      e.primitive.base.type === 'sweep'
        ? [e.primitive.base.sections[0]?.outline.length]
        : [],
    );
    expect(new Set(panelSides)).toEqual(new Set([16, 6]));
  });

  it('instances only decorative repeats', () => {
    for (const e of map.elements) {
      if (e.primitive.type === 'instances') expect(['rib', 'panel']).toContain(e.tag.part);
    }
  });

  it('tags every element with a known node, part and evidence class', () => {
    const rooms = new Set(placed);
    const edges = new Set(V1_CONNECTIONS.map((c) => c.id));
    for (const e of map.elements) {
      expect(MESH_PARTS).toContain(e.tag.part);
      expect(EVIDENCE_CLASSES).toContain(e.tag.evidenceClass);
      expect((e.tag.kind === 'room' ? rooms : edges).has(e.tag.id), e.tag.id).toBe(true);
    }
    for (const v of map.volumes) {
      expect(rooms.has(v.ownerId) || edges.has(v.ownerId), v.id).toBe(true);
    }
    for (const s of map.surfaces) {
      expect(rooms.has(s.ownerId) || edges.has(s.ownerId), s.id).toBe(true);
    }
    for (const id of placed) {
      expect(
        map.labels.filter((l) => l.roomId === id),
        id,
      ).toHaveLength(1);
    }
  });
});
