import { describe, expect, it } from 'vitest';
import type { StructureDescription } from '../../src/world/structure';
import {
  checkAnchorsOnSurfaces,
  checkDanglingEnds,
  checkElementLandings,
  checkGraphAgreement,
  checkPathEndpoints,
  checkPathLandings,
  checkPathSupport,
  checkSurfaceContiguity,
  checkVolumeOverlaps,
  checkWalkableReachability,
  reachableRooms,
  STEP_GAP_NU,
  validateStructure,
} from '../../src/world/validate';
import { onSurface, volumesOverlap } from '../../src/world/validate/geometry';

/**
 * Minimal valid fixture: a lower floor and an upper floor joined by one stair, plus a
 * portal-only pod. Each negative fixture breaks exactly one rule.
 */
const VALID: StructureDescription = {
  id: 'fixture',
  units: 'normalized',
  roomIds: ['A', 'B'],
  volumes: [
    { id: 'A.v', ownerId: 'A', shape: 'box', min: [0, 0, 0], max: [10, 4, 10] },
    { id: 'B.v', ownerId: 'B', shape: 'cylinder', center: [5, 5], radius: 5, y0: 4, y1: 8 },
  ],
  surfaces: [
    { id: 'A.floor', ownerId: 'A', y: 0, shapes: [{ kind: 'rect', min: [0, 0], max: [10, 10] }] },
    {
      id: 'B.floor',
      ownerId: 'B',
      y: 4,
      shapes: [{ kind: 'annulus', center: [5, 5], inner: 1, outer: 5 }],
    },
  ],
  anchors: [
    {
      roomId: 'A',
      anchorId: 'foot',
      surfaceId: 'A.floor',
      position: [2, 0, 5],
      azimuthDeg: null,
      state: 'open',
    },
    {
      roomId: 'B',
      anchorId: 'head',
      surfaceId: 'B.floor',
      position: [8, 4, 5],
      azimuthDeg: null,
      state: 'open',
    },
    {
      roomId: 'B',
      anchorId: 'sealed',
      surfaceId: 'B.floor',
      position: [2, 4, 5],
      azimuthDeg: null,
      state: 'closed',
    },
  ],
  paths: [
    {
      id: 'S.path',
      connectionId: 'S',
      kind: 'stairs',
      portal: false,
      from: { roomId: 'A', anchorId: 'foot' },
      to: { roomId: 'B', anchorId: 'head' },
      points: [
        [2, 0, 5],
        [4, 0, 5],
        [8, 4, 5],
      ],
    },
  ],
  elements: [
    {
      tag: { kind: 'connection', id: 'S', part: 'stairs', evidenceClass: 'inferred' },
      primitive: { type: 'stairs', bottom: [4, 0, 5], top: [8, 4, 5], width: 2, steps: 8 },
    },
  ],
  labels: [],
};

function withChanges(change: Partial<StructureDescription>): StructureDescription {
  return { ...VALID, ...change };
}

describe('validator geometry', () => {
  it('tests points against rect and annulus footprints at the surface height', () => {
    const [a, b] = VALID.surfaces as [
      StructureDescription['surfaces'][0],
      StructureDescription['surfaces'][0],
    ];
    expect(onSurface(a, [10, 0, 10])).toBe(true);
    expect(onSurface(a, [5, 0.5, 5])).toBe(false);
    expect(onSurface(a, [11, 0, 5])).toBe(false);
    expect(onSurface(b, [5, 4, 5])).toBe(false); // inside the annulus hole
    expect(onSurface(b, [5, 4, 9])).toBe(true);
  });

  it('treats touching volumes as apart and shared interiors as overlapping', () => {
    const box = (min: [number, number, number], max: [number, number, number]) =>
      ({ id: 'x', ownerId: 'x', shape: 'box', min, max }) as const;
    const cyl = (x: number, z: number, r: number, y0 = 0, y1 = 4) =>
      ({ id: 'c', ownerId: 'c', shape: 'cylinder', center: [x, z], radius: r, y0, y1 }) as const;
    expect(volumesOverlap(box([0, 0, 0], [2, 2, 2]), box([2, 0, 0], [4, 2, 2]))).toBe(false);
    expect(volumesOverlap(box([0, 0, 0], [2, 2, 2]), box([1, 0, 1], [3, 2, 3]))).toBe(true);
    expect(volumesOverlap(cyl(0, 0, 2), cyl(4, 0, 2))).toBe(false);
    expect(volumesOverlap(cyl(0, 0, 2), cyl(3, 0, 2))).toBe(true);
    expect(volumesOverlap(cyl(0, 0, 2), cyl(0, 0, 2, 4, 8))).toBe(false);
    // A box outside a cylinder's corner: its AABB overlaps, the shapes do not.
    expect(volumesOverlap(cyl(0, 0, 2), box([1.5, 0, 1.5], [3, 4, 3]))).toBe(false);
    expect(volumesOverlap(cyl(0, 0, 2), box([2, 0, -1], [4, 4, 1]))).toBe(false);
    expect(volumesOverlap(cyl(0, 0, 2), box([1, 0, -1], [4, 4, 1]))).toBe(true);
  });
});

describe('spatial validator', () => {
  it('passes the valid fixture', () => {
    expect(validateStructure(VALID, 'A.floor')).toEqual([]);
  });

  it('flags a midair stair', () => {
    const [stair] = VALID.paths;
    if (!stair) throw new Error('fixture has no path');
    const d = withChanges({
      paths: [
        {
          ...stair,
          points: [
            [2, 0, 5],
            [4, 0, 5],
            [8, 3, 5],
          ],
        },
      ],
    });
    const issues = checkPathLandings(d);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule: 'path-lands-on-surface', subject: 'S.path' });
    expect(issues[0]?.message).toMatch(/end .* midair/);
  });

  it('flags overlapping volumes', () => {
    const d = withChanges({
      volumes: [
        ...VALID.volumes,
        { id: 'C.v', ownerId: 'C', shape: 'box', min: [8, 2, 8], max: [12, 6, 12] },
      ],
    });
    const issues = checkVolumeOverlaps(d);
    expect(issues.map((i) => i.subject).sort()).toEqual(['A.v|C.v', 'B.v|C.v']);
    expect(issues.every((i) => i.rule === 'volume-overlap')).toBe(true);
  });

  it('flags a dangling path whose end is not an anchor', () => {
    const [stair] = VALID.paths;
    if (!stair) throw new Error('fixture has no path');
    const missing = withChanges({
      paths: [{ ...stair, to: { roomId: 'B', anchorId: 'nowhere' } }],
    });
    expect(checkPathEndpoints(missing)).toEqual([
      expect.objectContaining({
        rule: 'path-endpoint-is-anchor',
        message: expect.stringMatching(/B\.nowhere does not exist/),
      }),
    ]);
    // The end lands on a surface but stops short of the anchor it names.
    const short = withChanges({
      paths: [
        {
          ...stair,
          points: [
            [2, 0, 5],
            [4, 0, 5],
            [7, 4, 5],
          ],
        },
      ],
    });
    expect(checkPathLandings(short)).toEqual([]);
    expect(checkPathEndpoints(short)).toEqual([
      expect.objectContaining({
        rule: 'path-endpoint-is-anchor',
        message: expect.stringMatching(/does not meet anchor B\.head/),
      }),
    ]);
    const closed = withChanges({
      paths: [
        {
          ...stair,
          to: { roomId: 'B', anchorId: 'sealed' },
          points: [
            [2, 0, 5],
            [2, 4, 5],
          ],
        },
      ],
    });
    expect(checkPathEndpoints(closed)[0]?.message).toMatch(/B\.sealed is closed/);
  });

  it('flags anchors that are off their surface or on another room’s surface', () => {
    const [foot, head, sealed] = VALID.anchors;
    if (!foot || !head || !sealed) throw new Error('fixture anchors missing');
    const d = withChanges({
      anchors: [{ ...foot, position: [2, 1, 5] }, { ...head, surfaceId: 'A.floor' }, sealed],
    });
    expect(checkAnchorsOnSurfaces(d).map((i) => [i.rule, i.subject])).toEqual([
      ['anchor-on-surface', 'A.foot'],
      ['anchor-on-surface', 'B.head'],
    ]);
  });

  it('flags surfaces unreachable on foot, and portals do not count as a route', () => {
    const pod = {
      id: 'P.floor',
      ownerId: 'P',
      y: 20,
      shapes: [{ kind: 'rect', min: [0, 0], max: [2, 2] }],
    } as const;
    const portal = {
      id: 'X.path',
      connectionId: 'X',
      kind: 'vestibule_portal',
      portal: true,
      from: { roomId: 'A', anchorId: 'foot' },
      to: { roomId: 'P', anchorId: 'pad' },
      points: [
        [2, 0, 5],
        [1, 20, 1],
      ],
    } as const;
    const d = withChanges({ surfaces: [...VALID.surfaces, pod], paths: [...VALID.paths, portal] });
    expect(checkWalkableReachability(d, 'A.floor')).toEqual([
      expect.objectContaining({ rule: 'walkable-unreachable', subject: 'P.floor' }),
    ]);
    expect(checkWalkableReachability(VALID, 'B.floor')).toEqual([]);
    expect(checkWalkableReachability(VALID, 'missing')[0]?.message).toMatch(
      /start surface missing/,
    );
  });
});

/**
 * A corridor passage owned by edge E between rooms A and B: A [0..4] | E [4..10] | B [10..14]
 * along X, all at floor level. Rooms declare no openings; the passage opens at both ends.
 */
const CORRIDOR: StructureDescription = {
  id: 'corridor',
  units: 'normalized',
  roomIds: ['A', 'B'],
  volumes: [
    { id: 'A.v', ownerId: 'A', shape: 'box', min: [0, 0, 0], max: [4, 4, 4] },
    {
      id: 'E.v',
      ownerId: 'E',
      shape: 'box',
      min: [4, 0, 0],
      max: [10, 4, 4],
      openings: ['-x', '+x'],
    },
    { id: 'B.v', ownerId: 'B', shape: 'box', min: [10, 0, 0], max: [14, 4, 4] },
  ],
  surfaces: [
    { id: 'A.floor', ownerId: 'A', y: 0, shapes: [{ kind: 'rect', min: [0, 0], max: [4, 4] }] },
    { id: 'E.deck', ownerId: 'E', y: 0, shapes: [{ kind: 'rect', min: [4, 0.5], max: [10, 3.5] }] },
    { id: 'B.floor', ownerId: 'B', y: 0, shapes: [{ kind: 'rect', min: [10, 0], max: [14, 4] }] },
  ],
  anchors: [
    {
      roomId: 'A',
      anchorId: 'door',
      surfaceId: 'A.floor',
      position: [3.5, 0, 2],
      azimuthDeg: 90,
      state: 'open',
    },
    {
      roomId: 'B',
      anchorId: 'door',
      surfaceId: 'B.floor',
      position: [10.5, 0, 2],
      azimuthDeg: 270,
      state: 'open',
    },
  ],
  paths: [
    {
      id: 'E.path',
      connectionId: 'E',
      kind: 'corridor',
      portal: false,
      from: { roomId: 'A', anchorId: 'door' },
      to: { roomId: 'B', anchorId: 'door' },
      points: [
        [3.5, 0, 2],
        [10.5, 0, 2],
      ],
    },
  ],
  elements: [],
  labels: [],
};

function corridorWith(change: Partial<StructureDescription>): StructureDescription {
  return { ...CORRIDOR, ...change };
}

describe('spatial validator: supported routes (Execution 4)', () => {
  it('passes a corridor joining two rooms through their doors', () => {
    expect(validateStructure(CORRIDOR, 'A.floor')).toEqual([]);
    // The passage floor is linked by the path that walks over it.
    expect(checkWalkableReachability(CORRIDOR, 'A.floor')).toEqual([]);
  });

  it('flags a level leg over a hole wider than a step, but not a door sill', () => {
    const hole = corridorWith({
      surfaces: CORRIDOR.surfaces.map((x) =>
        x.id === 'E.deck' ? { ...x, shapes: [{ kind: 'rect', min: [5, 0.5], max: [10, 3.5] }] } : x,
      ),
    });
    const [issue] = checkPathSupport(hole);
    expect(issue).toMatchObject({ rule: 'path-supported', subject: 'E.path' });
    expect(issue?.message).toMatch(/leg 0 crosses 1\.\d+ NU with no floor/);
    const sill = corridorWith({
      surfaces: CORRIDOR.surfaces.map((x) =>
        x.id === 'E.deck'
          ? { ...x, shapes: [{ kind: 'rect', min: [4.5, 0.5], max: [10, 3.5] }] }
          : x,
      ),
    });
    expect(STEP_GAP_NU).toBeGreaterThan(0.5);
    expect(checkPathSupport(sill)).toEqual([]);
  });

  it('flags a sloped leg with no stairs and a flight steeper than 45°', () => {
    expect(checkPathSupport({ ...VALID, elements: [] })).toEqual([
      expect.objectContaining({ rule: 'path-supported', message: 'leg 1 slopes with no stairs' }),
    ]);
    const [stair] = VALID.paths;
    if (!stair) throw new Error('fixture has no path');
    const steep = withChanges({
      paths: [
        {
          ...stair,
          points: [
            [2, 0, 5],
            [6, 0, 5],
            [8, 4, 5],
          ],
        },
      ],
      elements: [
        {
          tag: { kind: 'connection', id: 'S', part: 'stairs', evidenceClass: 'inferred' },
          primitive: { type: 'stairs', bottom: [6, 0, 5], top: [8, 4, 5], width: 2, steps: 8 },
        },
      ],
    });
    expect(checkPathSupport(steep).map((i) => i.message)).toEqual([
      'leg 1 is steeper than a flight',
    ]);
  });

  it('flags a vertical leg with no ladder, or one whose head is out of reach', () => {
    const climb = corridorWith({
      surfaces: [
        ...CORRIDOR.surfaces,
        { id: 'E.loft', ownerId: 'E', y: 6, shapes: [{ kind: 'rect', min: [6, 0], max: [8, 4] }] },
      ],
      paths: [
        {
          ...(CORRIDOR.paths[0] as StructureDescription['paths'][number]),
          points: [
            [3.5, 0, 2],
            [7, 0, 2],
            [7, 6, 2],
            [7, 0, 2],
            [10.5, 0, 2],
          ],
        },
      ],
    });
    expect(checkPathSupport(climb).map((i) => i.message)).toEqual([
      'leg 1 climbs with no ladder',
      'leg 2 climbs with no ladder',
    ]);
    const ladder = {
      tag: { kind: 'connection', id: 'E', part: 'ladder', evidenceClass: 'inferred' },
      primitive: { type: 'ladder', bottom: [7, 0, 2], top: [7, 6, 2], width: 0.9, facingDeg: 0 },
    } as const;
    expect(checkPathSupport({ ...climb, elements: [ladder] })).toEqual([]);
    // Move the loft out of reach: the ladder's head is now in midair.
    const midair = {
      ...climb,
      elements: [ladder],
      surfaces: climb.surfaces.map((x) =>
        x.id === 'E.loft' ? { ...x, shapes: [{ kind: 'rect', min: [8, 0], max: [9, 4] }] } : x,
      ),
    } as StructureDescription;
    expect(checkPathSupport(midair).map((i) => i.message)).toContain(
      'ladder leg 1 head is in midair',
    );
    expect(checkElementLandings(midair)).toEqual([
      expect.objectContaining({ rule: 'element-lands', subject: 'E:ladder' }),
    ]);
  });

  it('flags stairs whose top lands in midair', () => {
    const [stairs] = VALID.elements;
    if (stairs?.primitive.type !== 'stairs') throw new Error('fixture has no stairs');
    const d = withChanges({
      elements: [{ ...stairs, primitive: { ...stairs.primitive, top: [8, 5, 5] } }],
    });
    expect(checkElementLandings(d)).toEqual([
      expect.objectContaining({
        rule: 'element-lands',
        subject: 'S:stairs',
        message: expect.stringMatching(/stairs top .* midair/),
      }),
    ]);
  });
});

describe('spatial validator: dangling corridor ends (Execution 4)', () => {
  it('flags an opening onto nothing', () => {
    const d = corridorWith({ volumes: CORRIDOR.volumes.filter((v) => v.id !== 'B.v') });
    expect(checkDanglingEnds(d)).toEqual([
      expect.objectContaining({ rule: 'dangling-end', message: 'E.v opens +x onto nothing' }),
    ]);
  });

  it('flags an opening onto a kit piece that is walled there', () => {
    const d = corridorWith({
      volumes: CORRIDOR.volumes.map((v) =>
        v.id === 'B.v' ? { ...v, ownerId: 'F', openings: ['+x'] as const } : v,
      ),
    });
    expect(checkDanglingEnds(d).map((i) => i.message)).toEqual([
      'E.v opens +x onto a wall of B.v',
      'B.v opens +x onto nothing',
    ]);
  });

  it('flags an opening onto a room with no open door there', () => {
    const farDoor = corridorWith({
      anchors: CORRIDOR.anchors.map((a) =>
        a.roomId === 'B' ? { ...a, position: [13.5, 0, 2] as const } : a,
      ),
    });
    expect(checkDanglingEnds(farDoor)).toEqual([
      expect.objectContaining({ message: 'E.v opens +x onto a wall of B.v' }),
    ]);
    const closedDoor = corridorWith({
      anchors: CORRIDOR.anchors.map((a) =>
        a.roomId === 'B' ? { ...a, state: 'closed' as const } : a,
      ),
    });
    expect(checkDanglingEnds(closedDoor)).toHaveLength(1);
  });

  it('flags a surface whose shapes are apart', () => {
    const d = corridorWith({
      surfaces: [
        {
          id: 'split',
          ownerId: 'A',
          y: 0,
          shapes: [
            { kind: 'rect', min: [0, 0], max: [1, 1] },
            { kind: 'rect', min: [3, 3], max: [4, 4] },
          ],
        },
      ],
    });
    expect(checkSurfaceContiguity(d)).toEqual([
      expect.objectContaining({ rule: 'surface-disjoint', subject: 'split' }),
    ]);
    expect(checkSurfaceContiguity(CORRIDOR)).toEqual([]);
  });
});

describe('graph and mesh reachability', () => {
  it('agree when the walk reaches exactly the rooms the graph does', () => {
    expect(reachableRooms(CORRIDOR, 'A.floor')).toEqual(new Set(['A', 'B']));
    expect(checkGraphAgreement(CORRIDOR, 'A.floor', new Set(['A', 'B']))).toEqual([]);
  });

  it('flag a room the graph reaches but the mesh walk does not, and the reverse', () => {
    const cut = { excludeConnections: new Set(['E']) };
    expect(reachableRooms(CORRIDOR, 'A.floor', cut)).toEqual(new Set(['A']));
    expect(checkGraphAgreement(CORRIDOR, 'A.floor', new Set(['A', 'B']), cut)).toEqual([
      expect.objectContaining({
        rule: 'graph-mesh-mismatch',
        subject: 'B',
        message: 'the graph reaches B but the mesh walk does not',
      }),
    ]);
    expect(checkGraphAgreement(CORRIDOR, 'A.floor', new Set(['A']))).toEqual([
      expect.objectContaining({
        subject: 'B',
        message: 'the mesh walk reaches B but the graph does not',
      }),
    ]);
  });
});
