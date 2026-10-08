import { Box3, InstancedMesh, Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  buildPrimitive,
  MaterialCache,
  partColor,
  PART_COLORS,
  plateGeometry,
  sweepGeometry,
  TONE_COLORS,
} from '../../src/world/kit';
import {
  boxShell,
  catwalk,
  corridorRun,
  decorElements,
  faceWall,
  galleryRing,
  junction,
  ladderShaft,
  nodeChamber,
  type Owner,
  profileSections,
  PROFILES,
  stairHall,
} from '../../src/world/kit/modules';
import type { BoxPrimitive, MeshTag, StructureElement, Vec2 } from '../../src/world/structure';
import { onSurface } from '../../src/world/validate/geometry';

const ROOM: Owner = { kind: 'room', id: 'M-01', tone: 'maintenance', evidenceClass: 'inferred' };
const EDGE: Owner = {
  kind: 'connection',
  id: 'B22',
  tone: 'maintenance',
  evidenceClass: 'inferred',
};
const TAG: MeshTag = { kind: 'room', id: 'M-01', part: 'wall', evidenceClass: 'inferred' };

function area(boxes: readonly BoxPrimitive[], along: 0 | 2): number {
  return boxes.reduce((sum, b) => sum + (b.max[along] - b.min[along]) * (b.max[1] - b.min[1]), 0);
}

function primitivesOf(elements: readonly StructureElement[], part: string) {
  return elements.filter((e) => e.tag.part === part).map((e) => e.primitive);
}

describe('hex corridor profile', () => {
  it.each(Object.values(PROFILES))('$id: stays inside its envelope and rings its walls', (p) => {
    const s = profileSections(p);
    const points = [...s.walls, ...s.ceiling, ...s.deck, ...s.frame].flatMap((x) => [
      ...x.outline,
      ...(x.holes ?? []).flat(),
    ]);
    for (const [u, v] of points) {
      expect(Math.abs(u)).toBeLessThanOrEqual(p.width / 2 + 1e-9);
      expect(v).toBeLessThanOrEqual(p.height + 1e-9);
      expect(v).toBeGreaterThanOrEqual(-0.3 - 1e-9);
    }
    // The walls lean out to mid-height and back: a hexagon with flat floor and ceiling.
    const right = s.walls[0]?.outline as readonly Vec2[];
    expect(right[0]).toEqual([p.floorWidth / 2, 0]);
    expect((right[1] as Vec2)[0]).toBeGreaterThan(p.floorWidth / 2);
    // The rib frame's hole is the walls' inner face, so frames hug the corridor.
    const hole = s.frame[0]?.holes?.[0] as readonly Vec2[];
    expect(hole.map(([u]) => Math.abs(u)).sort()).toContain(s.bulge);
    expect(s.wallTop).toBeLessThan(p.height);
  });
});

describe('structural kit pieces', () => {
  it('corridor run: an open-ended box, a deck strip, walls, a ceiling and rib frames', () => {
    const run = corridorRun({
      id: 'r',
      owner: ROOM,
      from: [0, -14, -37],
      to: [12, -14, -37],
      profile: PROFILES.standard,
      ribSpacing: 3,
    });
    expect(run.volumes).toEqual([
      {
        id: 'r',
        ownerId: 'M-01',
        shape: 'box',
        min: [0, -14, -39],
        max: [12, -10, -35],
        openings: ['-x', '+x'],
      },
    ]);
    const [deck] = run.surfaces;
    expect(deck?.shapes).toEqual([{ kind: 'rect', min: [0, -38.5], max: [12, -35.5] }]);
    expect(run.elements.map((e) => e.tag.part)).toEqual(['floor', 'wall', 'ceiling']);
    expect(run.elements.every((e) => e.tone === 'maintenance')).toBe(true);
    expect(run.decor).toHaveLength(4);
    for (const d of run.decor) {
      expect(d.kind).toBe('frame-standard');
      expect(d.placement.yawDeg).toBe(90);
    }
    expect(() =>
      corridorRun({
        id: 'x',
        owner: ROOM,
        from: [0, 0, 0],
        to: [3, 0, 3],
        profile: PROFILES.standard,
        ribSpacing: 3,
      }),
    ).toThrow(/not axis-aligned/);
    expect(() =>
      corridorRun({
        id: 'x',
        owner: ROOM,
        from: [0, 0, 0],
        to: [3, 1, 0],
        profile: PROFILES.standard,
        ribSpacing: 3,
      }),
    ).toThrow(/level/);
  });

  it('junctions: open sides continue, closed doors sit in walls, plain walls carry a panel', () => {
    const t = junction({
      id: 'j',
      owner: ROOM,
      center: [10, -14, -37],
      profile: PROFILES.standard,
      sides: { '-x': 'open', '+x': 'open', '+z': 'door', '-z': 'wall' },
    });
    expect(t.volumes[0]).toMatchObject({
      min: [8, -14, -39],
      max: [12, -10, -35],
      openings: ['+x', '-x'],
    });
    expect(onSurface(t.surfaces[0] as never, [10, -14, -37])).toBe(true);
    const doors = primitivesOf(t.elements, 'door-closed');
    expect(doors).toEqual([
      expect.objectContaining({ type: 'doorway', closed: true, azimuthDeg: 0 }),
    ]);
    // The +z wall is split around the door (two jambs and a lintel); the -z wall is whole.
    const walls = primitivesOf(t.elements, 'wall') as BoxPrimitive[];
    const plusZ = walls.filter((b) => b.min[2] > -37);
    const minusZ = walls.filter((b) => b.max[2] < -37);
    expect(plusZ).toHaveLength(3);
    expect(minusZ).toHaveLength(1);
    expect(area(plusZ, 0)).toBeLessThan(area(minusZ, 0));
    expect(t.decor.map((d) => d.kind).sort()).toEqual([
      'frame-standard',
      'frame-standard',
      'hex-panel',
    ]);
    const corner = junction({
      id: 'c',
      owner: { ...ROOM, tone: 'cultural' },
      center: [0, 7, 30],
      profile: PROFILES.standard,
      sides: { '-z': 'open', '-x': 'open', '+z': 'wall', '+x': 'wall' },
    });
    expect(corner.volumes[0]?.shape === 'box' && corner.volumes[0].openings).toEqual(['-z', '-x']);
    expect(corner.decor.filter((d) => d.kind === 'roundel')).toHaveLength(2);
  });

  it('stair hall: an enclosed flight landing on the pieces it joins', () => {
    const hall = stairHall({
      id: 's',
      owner: EDGE,
      bottom: [30, -21, -37],
      top: [23, -14, -37],
      profile: PROFILES.standard,
      ribSpacing: 3,
    });
    expect(hall.surfaces).toEqual([]);
    expect(hall.volumes[0]).toMatchObject({
      min: [23, -21, -39],
      max: [30, -10, -35],
      openings: ['+x', '-x'],
    });
    expect(primitivesOf(hall.elements, 'stairs')).toEqual([
      { type: 'stairs', bottom: [30, -21, -37], top: [23, -14, -37], width: 3, steps: 14 },
    ]);
    expect(primitivesOf(hall.elements, 'wall')[0]).toMatchObject({
      type: 'sweep',
      from: [30, -21, -37],
      to: [23, -14, -37],
    });
    expect(() =>
      stairHall({
        id: 'x',
        owner: EDGE,
        bottom: [0, 0, 0],
        top: [0, 0, 5],
        profile: PROFILES.standard,
        ribSpacing: 3,
      }),
    ).toThrow(/climb/);
  });

  it('ladder shaft: a half landing at the head, a full one at the foot, a ladder between', () => {
    const shaft = ladderShaft({
      id: 'sh',
      owner: EDGE,
      center: [42, -37],
      bottomY: -35,
      topY: -21,
      profile: PROFILES.standard,
      topSide: '-x',
      bottomSide: '+z',
    });
    expect(shaft.volumes[0]).toMatchObject({
      min: [40, -35, -39],
      max: [44, -17, -35],
      openings: ['-x', '+z'],
    });
    const [foot, head] = shaft.surfaces;
    expect(foot?.y).toBe(-35);
    expect(head?.shapes).toEqual([{ kind: 'rect', min: [40, -39], max: [42, -35] }]);
    const [ladder] = primitivesOf(shaft.elements, 'ladder');
    expect(ladder).toMatchObject({ bottom: [42, -35, -37], top: [42, -21, -37], facingDeg: 270 });
    // The ladder's head is on the landing's edge; its foot on the full landing.
    expect(onSurface(head as never, [42, -21, -37])).toBe(true);
    expect(onSurface(foot as never, [42, -35, -37])).toBe(true);
    // Door openings at both levels: no shaft wall covers the walk line through them.
    const walls = primitivesOf(shaft.elements, 'shaft') as BoxPrimitive[];
    const blocks = (p: readonly [number, number, number]) =>
      walls.some((b) =>
        [0, 1, 2].every(
          (k) => (p[k] as number) > (b.min[k] as number) && (p[k] as number) < (b.max[k] as number),
        ),
      );
    expect(blocks([40.05, -19, -37])).toBe(false);
    expect(blocks([42, -33, -35.05])).toBe(false);
    expect(blocks([43.95, -30, -37])).toBe(true);
  });

  it('catwalk: an L of decks with rails along every edge but its two ends', () => {
    const walk = catwalk({
      id: 'cw',
      owner: ROOM,
      points: [
        [35, -28, 0],
        [35, -28, 8],
        [27, -28, 8],
      ],
      width: 2.5,
    });
    const [deck] = walk.surfaces;
    for (const p of [
      [35, -28, 0],
      [35, -28, 8],
      [27, -28, 8],
      [31, -28, 8],
    ] as const) {
      expect(onSurface(deck as never, p), p.join()).toBe(true);
    }
    expect(onSurface(deck as never, [31, -28, 4])).toBe(false);
    expect(primitivesOf(walk.elements, 'railing')).toHaveLength(4);
    expect(() => catwalk({ id: 'x', owner: ROOM, points: [[0, 0, 0]], width: 2 })).toThrow();
  });

  it('gallery ring: four strips around a room, railed on the inside', () => {
    const ring = galleryRing({ id: 'g', owner: ROOM, min: [0, 0], max: [10, 10], y: 3, width: 2 });
    const [deck] = ring.surfaces;
    expect(deck?.shapes).toHaveLength(4);
    expect(onSurface(deck as never, [1, 3, 5])).toBe(true);
    expect(onSurface(deck as never, [5, 3, 5])).toBe(false);
    expect(primitivesOf(ring.elements, 'railing')).toHaveLength(4);
  });

  it('node chamber: octagonal walls broken by its open faces, a disc floor', () => {
    const chamber = nodeChamber({
      id: 'n',
      owner: ROOM,
      center: [35, -21, -37],
      apothem: 5,
      height: 5,
      profile: PROFILES.standard,
      open: ['-x', '+z'],
    });
    expect(chamber.surfaces[0]?.shapes).toEqual([
      { kind: 'annulus', center: [35, -37], inner: 0, outer: 5 },
    ]);
    const walls = primitivesOf(chamber.elements, 'wall').filter(
      (p): p is Extract<typeof p, { type: 'plate' }> => p.type === 'plate' && p.bottom === -21,
    );
    const swept = walls.reduce((sum, p) => sum + (p.sweepDeg ?? 360), 0);
    expect(swept).toBeCloseTo(360 - 2 * 45, 9);
    for (const p of walls) expect(p.sides).toBe(8);
    expect(chamber.volumes[0]).toMatchObject({
      min: [30, -21, -42],
      max: [40, -16, -32],
      openings: ['-x', '+z'],
    });
  });

  it('box shell: walls cut by door openings, a floor only when walked on, panels on blank faces', () => {
    const shell = boxShell({
      id: 'sh',
      owner: { ...ROOM, tone: 'cultural' },
      min: [0, 0, 0],
      max: [10, 6, 8],
      openings: [{ side: '+x', u0: 3, u1: 5, y0: 0, y1: 3 }],
      walkableFloor: true,
      panels: true,
    });
    expect(shell.volumes).toEqual([
      { id: 'sh', ownerId: 'M-01', shape: 'box', min: [0, 0, 0], max: [10, 6, 8] },
    ]);
    expect(shell.surfaces).toHaveLength(1);
    const walls = primitivesOf(shell.elements, 'wall') as BoxPrimitive[];
    const door = walls.filter((b) => b.min[0] >= 9.6);
    expect(door).toHaveLength(3);
    for (const b of door) {
      const inDoor = b.min[2] < 5 && b.max[2] > 3 && b.min[1] < 3;
      expect(inDoor).toBe(false);
    }
    expect(shell.decor.every((d) => d.kind === 'roundel')).toBe(true);
    expect(shell.decor.some((d) => d.placement.yawDeg === 90)).toBe(false);
    const well = boxShell({
      id: 'w',
      owner: ROOM,
      min: [0, 0, 0],
      max: [4, 4, 4],
      openings: [],
      walkableFloor: false,
      panels: false,
    });
    expect(well.surfaces).toEqual([]);
    expect(well.decor).toEqual([]);
  });

  it('faceWall: covers the face minus its openings with merged strips', () => {
    const lintel = faceWall('+x', [9.7, 10], [0, 8], [0, 6], [{ u0: 3, u1: 5, y0: 0, y1: 4 }]);
    expect(lintel).toHaveLength(3);
    expect(area(lintel, 2)).toBeCloseTo(8 * 6 - 2 * 4, 9);
    const sill = faceWall('-z', [0, 0.3], [0, 10], [0, 10], [{ u0: 4, u1: 6, y0: 3, y1: 6 }]);
    expect(sill).toHaveLength(4);
    expect(area(sill, 0)).toBeCloseTo(100 - 6, 9);
    expect(faceWall('+z', [0, 0.3], [0, 4], [0, 4], [])).toEqual([
      { type: 'box', min: [0, 0, 0], max: [4, 4, 0.3] },
    ]);
  });

  it('decor: one instanced element per owner and kind, frames as ribs and panels as panels', () => {
    const els = decorElements([
      { owner: ROOM, kind: 'frame-standard', placement: { position: [0, 0, 0], yawDeg: 0 } },
      { owner: ROOM, kind: 'frame-standard', placement: { position: [3, 0, 0], yawDeg: 0 } },
      { owner: ROOM, kind: 'hex-panel', placement: { position: [0, 2, 0], yawDeg: 90 } },
      { owner: EDGE, kind: 'frame-standard', placement: { position: [9, 0, 0], yawDeg: 0 } },
    ]);
    expect(els.map((e) => [e.tag.id, e.tag.part])).toEqual([
      ['M-01', 'rib'],
      ['M-01', 'panel'],
      ['B22', 'rib'],
    ]);
    const [ribs] = els;
    expect(ribs?.primitive.type === 'instances' && ribs.primitive.placements).toHaveLength(2);
  });
});

describe('kit builders for the Execution 4 primitives', () => {
  it('sweeps sections along a level run, across (dz, 0, -dx)', () => {
    const g = sweepGeometry({
      type: 'sweep',
      from: [0, 0, 0],
      to: [0, 0, 6],
      sections: [
        {
          outline: [
            [-1, 0],
            [1, 0],
            [1, 2],
            [-1, 2],
          ],
        },
      ],
    });
    g.computeBoundingBox();
    const b = g.boundingBox as Box3;
    expect(b.min.toArray().map((v) => +v.toFixed(6))).toEqual([-1, 0, 0]);
    expect(b.max.toArray().map((v) => +v.toFixed(6))).toEqual([1, 2, 6]);
  });

  it('shears sections up a sloped run so they stay vertical', () => {
    const g = sweepGeometry({
      type: 'sweep',
      from: [0, 0, 0],
      to: [4, 4, 0],
      sections: [
        {
          outline: [
            [-1, 0],
            [1, 0],
            [1, 2],
            [-1, 2],
          ],
        },
      ],
    });
    g.computeBoundingBox();
    const b = g.boundingBox as Box3;
    expect(+b.min.y.toFixed(6)).toBe(0);
    expect(+b.max.y.toFixed(6)).toBe(6);
    // Every vertex sits 0..2 above the run line y = x: the section is vertical, not tilted.
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const above = pos.getY(i) - pos.getX(i);
      expect(above).toBeGreaterThanOrEqual(-1e-6);
      expect(above).toBeLessThanOrEqual(2 + 1e-6);
    }
    expect(() =>
      sweepGeometry({ type: 'sweep', from: [0, 0, 0], to: [0, 3, 0], sections: [] }),
    ).toThrow();
  });

  it('builds polygon sectors face by face', () => {
    const full = plateGeometry({
      type: 'plate',
      center: [0, 0],
      inner: 0,
      outer: 5,
      bottom: 0,
      top: 1,
      sides: 8,
    });
    const sector = plateGeometry({
      type: 'plate',
      center: [0, 0],
      inner: 4,
      outer: 5,
      bottom: 0,
      top: 1,
      sides: 8,
      startDeg: 22.5,
      sweepDeg: 90,
    });
    full.computeBoundingBox();
    sector.computeBoundingBox();
    // The octagon puts a flat face on each axis, at its apothem R cos 22.5° (not a vertex at R).
    expect((full.boundingBox as Box3).max.x).toBeCloseTo(5 * Math.cos(Math.PI / 8), 6);
    // A two-face sector from 22.5° to 112.5° covers the 45° face and the +X face.
    expect((sector.boundingBox as Box3).min.z).toBeLessThan(0);
    expect((sector.boundingBox as Box3).max.z).toBeGreaterThan(0);
    expect((sector.boundingBox as Box3).min.x).toBeGreaterThan(0);
  });

  it('draws decorative repeats as one instanced mesh carrying the tag', () => {
    const [mesh] = buildPrimitive(
      {
        type: 'instances',
        base: { type: 'box', min: [-0.5, 0, -0.1], max: [0.5, 1, 0.1] },
        placements: [
          { position: [0, 0, 0], yawDeg: 0 },
          { position: [5, 0, 0], yawDeg: 90 },
        ],
      },
      { ...TAG, part: 'panel' },
      new MaterialCache(),
      'maintenance',
    );
    expect(mesh).toBeInstanceOf(InstancedMesh);
    const inst = mesh as InstancedMesh;
    expect(inst.count).toBe(2);
    expect(inst.userData).toEqual({ ...TAG, part: 'panel' });
    const m = new Matrix4();
    inst.getMatrixAt(1, m);
    // Turned 90°: local +Z now faces +X (the azimuth convention), and moved to x = 5.
    const facing = new Vector3(0, 0, 1).transformDirection(m);
    expect(facing.x).toBeCloseTo(1, 9);
    expect(new Vector3().setFromMatrixPosition(m).x).toBe(5);
  });

  it('shades parts by region tone, falling back to the console palette', () => {
    expect(partColor('wall')).toBe(PART_COLORS.wall);
    expect(partColor('wall', 'power-core')).toBe(TONE_COLORS['power-core']?.wall);
    expect(partColor('console', 'cultural')).toBe(PART_COLORS.console);
    const tones = ['cultural', 'maintenance', 'power-core'] as const;
    expect(new Set(tones.map((t) => partColor('wall', t))).size).toBe(3);
  });
});
