import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONNECTIONS, V1_CONNECTIONS } from '../../src/data/connections';
import { getTransform } from '../../src/data/layout';
import { getRoom } from '../../src/data/rooms';
import { roomBounds } from '../../src/scene/topology';
import {
  CLOSED_DOOR_LABEL,
  CONSOLE_ROOM_IDS,
  CONSOLE_START_SURFACE,
  describeConsoleRoom,
} from '../../src/world/rooms/console/describe';
import {
  CONSOLE_PARAM_NOTES,
  CONSOLE_PARAMS,
  type ConsoleParams,
} from '../../src/world/rooms/console/params';
import {
  EVIDENCE_CLASSES,
  MESH_PARTS,
  type PathSegment,
  type StructureElement,
} from '../../src/world/structure';
import { validateStructure } from '../../src/world/validate';
import { onSurface, volumeBounds } from '../../src/world/validate/geometry';

const d = describeConsoleRoom();
const p = CONSOLE_PARAMS;

function surface(id: string) {
  const s = d.surfaces.find((x) => x.id === id);
  if (!s) throw new Error(`no surface ${id}`);
  return s;
}

function anchor(roomId: string, anchorId: string) {
  const a = d.anchors.find((x) => x.roomId === roomId && x.anchorId === anchorId);
  if (!a) throw new Error(`no anchor ${roomId}.${anchorId}`);
  return a;
}

function pathOf(connectionId: string): PathSegment {
  const path = d.paths.find((x) => x.connectionId === connectionId);
  if (!path) throw new Error(`no path for ${connectionId}`);
  return path;
}

function elementsOf(type: StructureElement['primitive']['type']) {
  return d.elements.filter((e) => e.primitive.type === type);
}

const radius = (v: readonly number[]) => Math.hypot(v[0] as number, v[2] as number);

describe('console-room description', () => {
  it('passes the spatial validator with portals disabled', () => {
    expect(validateStructure(d, CONSOLE_START_SURFACE)).toEqual([]);
  });

  it('stacks the decks gallery > main (Y = 0) > lower', () => {
    expect(p.mainY).toBe(0);
    expect(p.galleryY).toBeGreaterThan(p.mainY);
    expect(p.mainY).toBeGreaterThan(p.lowerY);
    expect(surface('C-U.gallery').y).toBe(p.galleryY);
    expect(surface('C-M.main-deck').y).toBe(p.mainY);
    expect(surface('C-L.lower-deck').y).toBe(p.lowerY);
    const ups = d.anchors.filter(
      (a) => getRoom(a.roomId)?.anchors.find((t) => t.id === a.anchorId)?.level === 'gallery',
    );
    for (const a of ups) expect(a.position[1], `${a.roomId}.${a.anchorId}`).toBe(p.galleryY);
  });

  it('has 18 evenly spaced ribs rising from the lower structure past the gallery', () => {
    const ribs = elementsOf('rib');
    expect(p.ribCount).toBe(18);
    expect(ribs).toHaveLength(18);
    const bearings = ribs.map((e) => (e.primitive.type === 'rib' ? e.primitive.azimuthDeg : NaN));
    bearings.forEach((b, i) => expect(b).toBeCloseTo(p.ribPhaseDeg + i * 20, 9));
    for (const e of ribs) {
      if (e.primitive.type !== 'rib') continue;
      const ys = e.primitive.profile.map(([, y]) => y);
      expect(Math.min(...ys)).toBeLessThanOrEqual(p.lowerY);
      expect(Math.max(...ys)).toBeGreaterThan(p.galleryY + p.galleryWallHeight);
      expect(e.tag).toMatchObject({ kind: 'room', id: 'C-M', part: 'rib' });
    }
  });

  it('centres a hexagonal console, rotor column and two contra-rotating 18-division rings', () => {
    const consoleEl = d.elements.find((e) => e.tag.part === 'console');
    expect(consoleEl?.primitive).toMatchObject({
      type: 'plate',
      center: [0, 0],
      sides: 6,
      bottom: 0,
    });
    expect(d.elements.find((e) => e.tag.part === 'rotor')?.primitive).toMatchObject({
      center: [0, 0],
    });
    const rings = elementsOf('ring').map((e) => e.primitive);
    expect(rings).toHaveLength(2);
    const spins = rings.map((r) => (r.type === 'ring' ? r.spin : 0));
    expect(spins.sort()).toEqual([-1, 1]);
    for (const r of rings) {
      expect(r).toMatchObject({ divisions: 18, center: [0, expect.any(Number), 0] });
    }
  });

  it('lands each stair run on walkable decks, facing different directions', () => {
    const stairs = elementsOf('stairs');
    expect(stairs.length).toBeGreaterThanOrEqual(2);
    const toGallery = pathOf('B02');
    const toLower = pathOf('B03');
    for (const path of [toGallery, toLower]) {
      expect(path.kind).toBe('stairs');
      for (const point of [path.points[0], path.points.at(-1)]) {
        expect(
          d.surfaces.some((s) => point && onSurface(s, point)),
          path.id,
        ).toBe(true);
      }
    }
    expect(onSurface(surface('C-M.main-deck'), toGallery.points[0] as never)).toBe(true);
    expect(onSurface(surface('C-U.gallery'), toGallery.points.at(-1) as never)).toBe(true);
    expect(onSurface(surface('C-L.lower-deck'), toLower.points.at(-1) as never)).toBe(true);

    // Horizontal climbing directions of the two flights are not parallel.
    const dirs = stairs.map((e) => {
      if (e.primitive.type !== 'stairs') throw new Error('not stairs');
      const { bottom, top } = e.primitive;
      const len = Math.hypot(top[0] - bottom[0], top[2] - bottom[2]);
      return [(top[0] - bottom[0]) / len, (top[2] - bottom[2]) / len] as const;
    });
    const [a, b] = dirs as [readonly [number, number], readonly [number, number]];
    expect(Math.abs(a[0] * b[0] + a[1] * b[1])).toBeLessThan(0.99);
  });

  it('carries a suspended bridge from P-EX to the main deck at authored azimuth 0°', () => {
    expect(p.exteriorDoorAzimuthDeg).toBe(0);
    const bridge = d.elements.find((e) => e.tag.part === 'bridge');
    if (bridge?.primitive.type !== 'box') throw new Error('no bridge box');
    expect(bridge.primitive.max[1]).toBe(p.mainY);
    expect(bridge.primitive.max[1] - bridge.primitive.min[1]).toBeLessThan(p.deckThickness);
    expect(bridge.primitive.min[2]).toBeLessThan(p.mainDeckRadius);
    expect(bridge.primitive.max[2]).toBeGreaterThanOrEqual(p.shellRadius);
    const b01 = pathOf('B01');
    expect(b01.from).toEqual({ roomId: 'P-EX', anchorId: 'interior' });
    expect(anchor('C-M', 'exterior-doors').azimuthDeg).toBe(0);
    expect(anchor('P-EX', 'interior').position[2]).toBeGreaterThan(p.shellRadius);
  });

  it('puts every inner door and the exterior doors on the shell', () => {
    const shellDoors = [
      ['C-M', 'exterior-doors'],
      ['C-U', 'upper-door-1'],
      ['C-U', 'upper-door-2'],
      ['C-L', 'lower-wall-panel'],
      ['C-L', 'lower-door-2'],
    ] as const;
    for (const [room, id] of shellDoors) {
      const r = radius(anchor(room, id).position);
      expect(r, `${room}.${id}`).toBeGreaterThan(p.shellRadius - 1);
      expect(r, `${room}.${id}`).toBeLessThanOrEqual(p.shellRadius);
    }
    const doorways = elementsOf('doorway');
    for (const e of doorways) {
      if (e.primitive.type !== 'doorway') continue;
      expect(radius(e.primitive.sill)).toBeCloseTo(p.shellRadius + p.wallThickness / 2, 9);
    }
  });

  it('keeps the lower-wall exit C-XL separate from the under-console ladder C-LAD', () => {
    const b05 = pathOf('B05');
    const b06 = pathOf('B06');
    expect(b05.to.roomId).toBe('C-XL');
    expect(b06.to.roomId).toBe('C-LAD');
    expect(b05.kind).toBe('doorway');
    expect(b06.kind).toBe('ladder');
    expect(b05.from.anchorId).not.toBe(b06.from.anchorId);
    const panel = anchor('C-L', 'lower-wall-panel').position;
    const hatch = anchor('C-L', 'console-underside').position;
    expect(radius(panel)).toBeGreaterThan(p.shellRadius - 1);
    expect(radius(hatch)).toBeLessThan(p.consoleRadius);
    const xl = d.volumes.find((v) => v.ownerId === 'C-XL');
    const lad = d.volumes.find((v) => v.ownerId === 'C-LAD');
    if (!xl || !lad) throw new Error('missing volumes');
    // C-XL is outside the shell at lower-deck level; C-LAD is under the deck on the axis.
    const xlb = volumeBounds(xl);
    const ladb = volumeBounds(lad);
    expect(xlb.min[1]).toBe(p.lowerY);
    expect(Math.min(Math.abs(xlb.min[2]), Math.abs(xlb.max[2]))).toBeGreaterThan(p.shellRadius);
    expect(ladb.max[1]).toBeLessThan(p.lowerY);
    expect((ladb.min[0] + ladb.max[0]) / 2).toBe(0);
    expect((ladb.min[2] + ladb.max[2]) / 2).toBe(0);
  });

  it('models the two unconnected reported doors as closed and labelled', () => {
    expect(p.reportedInnerDoors).toBe(4);
    expect(p.verifiedInnerDoors).toBeNull();
    const inner = ['upper-door-1', 'upper-door-2', 'lower-wall-panel', 'lower-door-2'];
    expect(d.anchors.filter((a) => inner.includes(a.anchorId))).toHaveLength(p.reportedInnerDoors);
    for (const [room, id] of [
      ['C-U', 'upper-door-2'],
      ['C-L', 'lower-door-2'],
    ] as const) {
      expect(anchor(room, id).state).toBe('closed');
      expect(
        d.paths.some((x) => [x.from, x.to].some((e) => e.roomId === room && e.anchorId === id)),
      ).toBe(false);
    }
    const closed = d.elements.filter((e) => e.tag.part === 'door-closed');
    expect(closed).toHaveLength(2);
    for (const e of closed) {
      expect(e.label).toBe(CLOSED_DOOR_LABEL);
      expect(e.primitive).toMatchObject({ type: 'doorway', closed: true });
    }
    expect(CLOSED_DOOR_LABEL.toLowerCase()).toContain('reported, destination unknown');
  });

  it('places exactly the topology anchors of the console nodes', () => {
    const expected = CONSOLE_ROOM_IDS.flatMap((id) =>
      (getRoom(id)?.anchors ?? []).map((a) => `${id}.${a.id}`),
    );
    const placed = d.anchors.map((a) => `${a.roomId}.${a.anchorId}`);
    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual([...expected].sort());
  });

  it('builds one path per v1 edge inside the console, matching the edge data', () => {
    const inside = new Set<string>(CONSOLE_ROOM_IDS);
    const edges = V1_CONNECTIONS.filter((c) => inside.has(c.from.room) && inside.has(c.to.room));
    expect(edges.map((c) => c.id).sort()).toEqual(d.paths.map((x) => x.connectionId).sort());
    for (const c of edges) {
      const path = pathOf(c.id);
      expect(path.from).toEqual({ roomId: c.from.room, anchorId: c.from.anchor });
      expect(path.to).toEqual({ roomId: c.to.room, anchorId: c.to.anchor });
      expect(path.kind).toBe(c.kind);
      expect(path.portal).toBe(false);
    }
  });

  it('matches the layout boxes for every console node', () => {
    for (const id of CONSOLE_ROOM_IDS) {
      const t = getTransform(id);
      if (!t) throw new Error(`no layout for ${id}`);
      const vols = d.volumes.filter((v) => v.ownerId === id);
      expect(vols, id).toHaveLength(1);
      expect(volumeBounds(vols[0] as never), id).toEqual(roomBounds(t));
    }
  });

  it('tags every element with a known node, part and evidence class', () => {
    const roomIds = new Set<string>(CONSOLE_ROOM_IDS);
    const connectionIds = new Set(CONNECTIONS.map((c) => c.id));
    for (const e of d.elements) {
      expect(MESH_PARTS).toContain(e.tag.part);
      expect(EVIDENCE_CLASSES).toContain(e.tag.evidenceClass);
      if (e.tag.kind === 'room') expect(roomIds.has(e.tag.id), e.tag.id).toBe(true);
      else expect(connectionIds.has(e.tag.id), e.tag.id).toBe(true);
    }
    for (const id of CONSOLE_ROOM_IDS) {
      expect(
        d.elements.some((e) => e.tag.kind === 'room' && e.tag.id === id),
        id,
      ).toBe(true);
    }
  });

  it('documents the basis of every parameter, with sources for verified ones', () => {
    const keys = Object.keys(CONSOLE_PARAMS) as (keyof ConsoleParams)[];
    expect(Object.keys(CONSOLE_PARAM_NOTES).sort()).toEqual([...keys].sort());
    for (const k of keys) {
      const note = CONSOLE_PARAM_NOTES[k];
      expect(note.note.length, k).toBeGreaterThan(0);
      if (note.basis === 'verified' && k !== 'verifiedInnerDoors') {
        expect(note.sourceIds.length, k).toBeGreaterThan(0);
      }
    }
  });

  it('is expressed in normalized units only', () => {
    expect(d.units).toBe('normalized');
    const root = fileURLToPath(new URL('../../src/world', import.meta.url));
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (full.endsWith('.ts')) files.push(full);
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/\b\d+(\.\d+)?\s?(m|cm|mm|metres?|meters?)\b/);
      expect(text, f).not.toMatch(/_m\b|units:\s*['"]m/);
    }
  });
});
