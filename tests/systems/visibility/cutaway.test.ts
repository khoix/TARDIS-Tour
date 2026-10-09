import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src/data/layout';
import {
  acceptsHit,
  clippedAt,
  CUT_MARGIN_NU,
  firstPick,
  horizontalView,
  isCutAt,
  MAX_SPINE_POINTS,
  nearestOnSpine,
  type PickContext,
  roomSpine,
  type Spine,
  Throttle,
  walkLineSpine,
} from '../../../src/systems/visibility/cutaway';
import {
  composeLayers,
  GHOST_KEEP,
  type ResolvedVisual,
} from '../../../src/systems/visibility/state';
import type { Vec2 } from '../../../src/world/structure';

const ISO: Vec2 = [Math.SQRT1_2, Math.SQRT1_2];
const NORTH_VIEW: Vec2 = [0, 1];

describe('spines', () => {
  it('is the centre of a square room and the medial segment of an elongated one', () => {
    expect(roomSpine({ min: [-5, 0, -5], max: [5, 4, 5] })).toEqual([[0, 2, 0]]);
    expect(roomSpine({ min: [-14, 0, -2], max: [14, 4, 2] })).toEqual([
      [-12, 2, 0],
      [12, 2, 0],
    ]);
    expect(roomSpine({ min: [0, 0, 0], max: [6, 10, 14] })).toEqual([
      [3, 5, 3],
      [3, 5, 11],
    ]);
  });

  it('takes an edge walk line as is, within the shader limit', () => {
    const line: Vec3[] = [
      [0, 0, 0],
      [1, 0, 0],
    ];
    expect(walkLineSpine('B07', line)).toBe(line);
    expect(() => walkLineSpine('B07', [])).toThrow(/B07/);
    expect(() =>
      walkLineSpine(
        'B07',
        Array.from({ length: MAX_SPINE_POINTS + 1 }, (_, i): Vec3 => [i, 0, 0]),
      ),
    ).toThrow(/B07/);
  });

  it('projects onto the nearest segment, clamped at the ends', () => {
    const spine: Spine = [
      [0, 0, 0],
      [10, 0, 0],
      [10, 0, 10],
    ];
    expect(nearestOnSpine([5, 3, 2], spine)).toEqual([5, 0, 0]);
    expect(nearestOnSpine([13, 0, 6], spine)).toEqual([10, 0, 6]);
    expect(nearestOnSpine([-4, 0, -1], spine)).toEqual([0, 0, 0]);
  });

  it('projects across a sloped flight almost horizontally', () => {
    // A flight rising 7 over 7 along +Z; a wall point 3 NU above its middle, 2 NU aside.
    const flight: Spine = [
      [0, 0, 0],
      [0, 7, 7],
    ];
    const q = nearestOnSpine([2, 6.5, 3.5], flight);
    // An unweighted 3D projection would slide 1.5 NU up the flight.
    expect(Math.abs(q[2] - 3.5)).toBeLessThan(0.25);
  });
});

describe('camera-facing cut', () => {
  const square = roomSpine({ min: [-5, 0, -5], max: [5, 6, 5] });

  it('cuts the near walls of a box room and keeps the far ones (isometric view)', () => {
    expect(isCutAt([5, 3, 0], square, ISO)).toBe(true);
    expect(isCutAt([0, 3, 5], square, ISO)).toBe(true);
    expect(isCutAt([-5, 3, 0], square, ISO)).toBe(false);
    expect(isCutAt([0, 3, -5], square, ISO)).toBe(false);
    // The two corners where near meets far lie on the cut plane and stay.
    expect(isCutAt([5, 3, -5], square, ISO)).toBe(false);
  });

  it('follows the camera: looking north cuts the south wall and the near halves of the sides', () => {
    expect(isCutAt([0, 3, 5], square, NORTH_VIEW)).toBe(true);
    expect(isCutAt([0, 3, -5], square, NORTH_VIEW)).toBe(false);
    expect(isCutAt([5, 3, 2], square, NORTH_VIEW)).toBe(true);
    expect(isCutAt([5, 3, -2], square, NORTH_VIEW)).toBe(false);
  });

  it('judges both long walls of a hall against its axis along their whole length', () => {
    const hall = roomSpine({ min: [-14, 0, -2], max: [14, 4, 2] });
    for (const x of [-13, 0, 13]) {
      expect(isCutAt([x, 2, 2], hall, ISO), `near wall at x ${x}`).toBe(true);
      expect(isCutAt([x, 2, -2], hall, ISO), `far wall at x ${x}`).toBe(false);
    }
  });

  it('cuts the near side of every leg of a walk line', () => {
    const corridor: Spine = [
      [0, 0, 0],
      [20, 0, 0],
      [20, 0, 20],
    ];
    expect(isCutAt([10, 2, 2], corridor, ISO)).toBe(true);
    expect(isCutAt([10, 2, -2], corridor, ISO)).toBe(false);
    expect(isCutAt([22, 2, 10], corridor, ISO)).toBe(true);
    expect(isCutAt([18, 2, 10], corridor, ISO)).toBe(false);
  });

  it('never cuts within the margin of the spine plane', () => {
    const offset = CUT_MARGIN_NU / 2;
    expect(isCutAt([offset, 0, 0], [[0, 0, 0]], [1, 0])).toBe(false);
  });

  it('turns camera offsets into horizontal view directions', () => {
    const v = horizontalView([3, 10, 4]);
    expect(v?.[0]).toBeCloseTo(0.6, 9);
    expect(v?.[1]).toBeCloseTo(0.8, 9);
    expect(horizontalView([0, 5, 0])).toBeNull();
  });
});

describe('section clip', () => {
  it('removes points strictly above the section, and nothing without one', () => {
    expect(clippedAt(-7, -8)).toBe(true);
    expect(clippedAt(-8, -8)).toBe(false);
    expect(clippedAt(-9, -8)).toBe(false);
    expect(clippedAt(1e6, null)).toBe(false);
  });
});

describe('clip-aware pick filter', () => {
  interface Obj {
    readonly name: string;
    readonly visual?: ResolvedVisual;
    readonly spine?: Spine;
  }
  const solid = composeLayers({});
  const cutWall: Obj = {
    name: 'wall',
    visual: composeLayers({ cutaway: { cut: true } }),
    spine: [[0, 0, 0]],
  };
  const floor: Obj = { name: 'floor', visual: solid, spine: [[0, 0, 0]] };
  const ghost: Obj = { name: 'ghost', visual: composeLayers({ isolation: { ghost: GHOST_KEEP } }) };
  const hidden: Obj = { name: 'ceiling', visual: composeLayers({ cutaway: { hidden: true } }) };
  const unmanaged: Obj = { name: 'unmanaged' };
  const ctx = (sectionY: number | null, view: Vec2 | null): PickContext<Obj> => ({
    sectionY,
    view,
    visual: (o) => o.visual,
    spine: (o) => o.spine,
  });
  const hit = (object: Obj, x: number, y: number, z: number) => ({
    object,
    point: { x, y, z },
  });

  it('skips hidden, ghosted and unmanaged meshes', () => {
    for (const o of [hidden, ghost, unmanaged]) {
      expect(acceptsHit(hit(o, 0, 0, 0), ctx(null, ISO)), o.name).toBe(false);
    }
    expect(acceptsHit(hit(floor, 0, 0, 0), ctx(null, ISO))).toBe(true);
  });

  it('skips hit points above the section, even on a pickable mesh', () => {
    expect(acceptsHit(hit(floor, 0, -7, 0), ctx(-8, ISO))).toBe(false);
    expect(acceptsHit(hit(floor, 0, -9, 0), ctx(-8, ISO))).toBe(true);
  });

  it('skips the cut side of a cut mesh only', () => {
    expect(acceptsHit(hit(cutWall, 3, 0, 3), ctx(null, ISO))).toBe(false);
    expect(acceptsHit(hit(cutWall, -3, 0, -3), ctx(null, ISO))).toBe(true);
    expect(acceptsHit(hit(floor, 3, 0, 3), ctx(null, ISO))).toBe(true);
    // No view direction yet: nothing is cut.
    expect(acceptsHit(hit(cutWall, 3, 0, 3), ctx(null, null))).toBe(true);
  });

  it('returns the nearest hit the visible scene would show there', () => {
    const hits = [
      hit(hidden, 3, 10, 3),
      hit(ghost, 3, 8, 3),
      hit(cutWall, 3, 5, 3),
      hit(floor, 0, -9, 0),
      hit(cutWall, -3, -10, -3),
    ];
    expect(firstPick(hits, ctx(null, ISO))?.object).toBe(floor);
    expect(firstPick(hits, ctx(-9.5, ISO))?.object).toBe(cutWall);
    expect(firstPick(hits, ctx(-20, ISO))).toBeUndefined();
  });
});

describe('throttle', () => {
  it('is ready at most once per interval', () => {
    const t = new Throttle(100);
    expect(t.ready(0)).toBe(true);
    expect(t.ready(50)).toBe(false);
    expect(t.ready(99)).toBe(false);
    expect(t.ready(100)).toBe(true);
    expect(t.ready(150)).toBe(false);
    expect(t.ready(260)).toBe(true);
  });
});
