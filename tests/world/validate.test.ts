import { describe, expect, it } from 'vitest';
import type { StructureDescription } from '../../src/world/structure';
import {
  checkAnchorsOnSurfaces,
  checkPathEndpoints,
  checkPathLandings,
  checkVolumeOverlaps,
  checkWalkableReachability,
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
    { id: 'A.v', roomId: 'A', shape: 'box', min: [0, 0, 0], max: [10, 4, 10] },
    { id: 'B.v', roomId: 'B', shape: 'cylinder', center: [5, 5], radius: 5, y0: 4, y1: 8 },
  ],
  surfaces: [
    { id: 'A.floor', roomId: 'A', y: 0, shapes: [{ kind: 'rect', min: [0, 0], max: [10, 10] }] },
    {
      id: 'B.floor',
      roomId: 'B',
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
  elements: [],
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
      ({ id: 'x', roomId: 'x', shape: 'box', min, max }) as const;
    const cyl = (x: number, z: number, r: number, y0 = 0, y1 = 4) =>
      ({ id: 'c', roomId: 'c', shape: 'cylinder', center: [x, z], radius: r, y0, y1 }) as const;
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
        { id: 'C.v', roomId: 'C', shape: 'box', min: [8, 2, 8], max: [12, 6, 12] },
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
      roomId: 'P',
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
