/**
 * Structural kit at the description level (build plan "Stage 2", EXECUTION-PLAN Ex4): pure
 * functions returning the volumes, walkable surfaces and elements of one reusable piece —
 * hex-profile corridor runs, corners and T/4-way junctions, stair halls, ladder shafts with
 * landings, catwalks and gallery rings, octagonal node chambers, box shells with door
 * openings, and thresholds. Ceilings are separate `ceiling` elements (hidden in the map view);
 * support-rib frames and roundel/hex panels are decorative repeats gathered into instanced
 * elements by {@link decorElements}. All values are NU and every piece is axis-aligned.
 */

import type { Side, Vec3 } from '../../data/layout';
import type { RegionId } from '../../data/types';
import type {
  BoxPrimitive,
  EvidenceClass,
  KitPrimitive,
  MeshPart,
  Placement,
  StructureElement,
  SurfaceShape,
  SweepPrimitive,
  SweepSection,
  Vec2,
  Volume,
  WalkableSurface,
} from '../structure';

/** Topology node or edge a piece belongs to, with its greybox tone and evidence class. */
export interface Owner {
  readonly kind: 'room' | 'connection';
  readonly id: string;
  readonly tone: RegionId;
  readonly evidenceClass: EvidenceClass;
}

export const DECOR_KINDS = ['frame-standard', 'frame-narrow', 'roundel', 'hex-panel'] as const;
export type DecorKind = (typeof DECOR_KINDS)[number];

/** One decorative repeat; {@link decorElements} instances all repeats of an owner together. */
export interface Decor {
  readonly owner: Owner;
  readonly kind: DecorKind;
  readonly placement: Placement;
}

export interface Piece {
  readonly volumes: readonly Volume[];
  readonly surfaces: readonly WalkableSurface[];
  readonly elements: readonly StructureElement[];
  readonly decor: readonly Decor[];
}

export const EMPTY_PIECE: Piece = { volumes: [], surfaces: [], elements: [], decor: [] };

export function mergePieces(pieces: readonly Piece[]): Piece {
  return {
    volumes: pieces.flatMap((p) => p.volumes),
    surfaces: pieces.flatMap((p) => p.surfaces),
    elements: pieces.flatMap((p) => p.elements),
    decor: pieces.flatMap((p) => p.decor),
  };
}

// ── Dimensions ───────────────────────────────────────────────────────────────

/** Hexagonal corridor cross-section (Journey's polygonal tunnels; proportions authored). */
export interface CorridorProfile {
  readonly id: 'standard' | 'narrow';
  /** Outer envelope across the run, frames included: the width of the piece's volume. */
  readonly width: number;
  /** Envelope height above the walk line: the height of the piece's volume. */
  readonly height: number;
  /** Width of the walkable deck. */
  readonly floorWidth: number;
}

export const PROFILES = {
  standard: { id: 'standard', width: 4, height: 4, floorWidth: 3 },
  narrow: { id: 'narrow', width: 3.5, height: 3.5, floorWidth: 2.5 },
} as const satisfies Record<CorridorProfile['id'], CorridorProfile>;

/** Corridor wall and ceiling plate thickness. */
export const WALL_NU = 0.15;
/** Depth of a deck below its walk line. */
export const DECK_NU = 0.3;
/** Room shell wall thickness (inside the room's box). */
export const SHELL_WALL_NU = 0.3;
/** Rise of one stair tread (the console's flights use the same). */
export const STEP_RISE_NU = 0.5;
export const RAIL_HEIGHT_NU = 1.1;

export interface ProfileSections {
  readonly walls: readonly SweepSection[];
  readonly ceiling: readonly SweepSection[];
  readonly deck: readonly SweepSection[];
  /** Support-rib frame ringing the profile (decorative repeat). */
  readonly frame: readonly SweepSection[];
  /** Height of the walls and the ceiling's underside above the walk line. */
  readonly wallTop: number;
  /** Half-width of the inner wall faces at their widest (mid-height). */
  readonly bulge: number;
}

function rect2(s0: number, v0: number, s1: number, v1: number): Vec2[] {
  return [
    [s0, v0],
    [s1, v0],
    [s1, v1],
    [s0, v1],
  ];
}

/**
 * Cross-section polygons (s across, v up from the walk line): a flat deck, walls that lean
 * out to mid-height and back in (a hexagon with flat floor and ceiling), a ceiling plate, and
 * the rib frame that rings them. Everything stays inside ±width/2 and below `height`, except
 * the deck and frame foot, which sit under the walk line like every other deck.
 */
export function profileSections(p: CorridorProfile): ProfileSections {
  const hw = p.width / 2;
  const hf = p.floorWidth / 2;
  const wallTop = p.height - DECK_NU;
  const mid = wallTop / 2;
  const bulge = hw - DECK_NU;
  const right: Vec2[] = [
    [hf, 0],
    [bulge, mid],
    [hf, wallTop],
    [hf + WALL_NU, wallTop],
    [bulge + WALL_NU, mid],
    [hf + WALL_NU, 0],
  ];
  const left = right.map(([s, v]): Vec2 => [-s, v]).reverse();
  const plate = hf + WALL_NU;
  const rim = hf + DECK_NU;
  return {
    walls: [{ outline: right }, { outline: left }],
    ceiling: [{ outline: rect2(-plate, wallTop, plate, wallTop + WALL_NU) }],
    deck: [{ outline: rect2(-plate, -DECK_NU, plate, 0) }],
    frame: [
      {
        outline: [
          [-rim, -DECK_NU],
          [rim, -DECK_NU],
          [hw, mid],
          [rim, p.height],
          [-rim, p.height],
          [-hw, mid],
        ],
        holes: [
          [
            [-hf, 0],
            [hf, 0],
            [bulge, mid],
            [hf, wallTop],
            [-hf, wallTop],
            [-bulge, mid],
          ],
        ],
      },
    ],
    wallTop,
    bulge,
  };
}

// ── Axis helpers ─────────────────────────────────────────────────────────────

const EPS = 1e-6;
const SIDES: readonly Side[] = ['+z', '+x', '-z', '-x'];
const BEARING: Readonly<Record<Side, number>> = { '+z': 0, '+x': 90, '-z': 180, '-x': 270 };

/** Azimuth of a side's outward normal (0° = +Z, 90° = +X). */
export function sideBearing(side: Side): number {
  return BEARING[side];
}

export function opposite(side: Side): Side {
  const flip: Readonly<Record<Side, Side>> = { '+x': '-x', '-x': '+x', '+z': '-z', '-z': '+z' };
  return flip[side];
}

/** Unit horizontal vector [dx, dz] of a side's outward normal. */
export function sideNormal(side: Side): Vec2 {
  const n: Readonly<Record<Side, Vec2>> = {
    '+x': [1, 0],
    '-x': [-1, 0],
    '+z': [0, 1],
    '-z': [0, -1],
  };
  return n[side];
}

/** A straight horizontal stretch along one axis. */
export interface AxisRun {
  /** Side a walker heading along the run leaves through. */
  readonly ahead: Side;
  readonly length: number;
}

/** The axis-aligned horizontal run from `a` to `b`, ignoring height; throws on diagonals. */
export function axisRun(a: Vec3, b: Vec3): AxisRun {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  if (Math.abs(dx) > EPS && Math.abs(dz) > EPS) {
    throw new Error(`Run [${a.join(', ')}] → [${b.join(', ')}] is not axis-aligned`);
  }
  if (Math.abs(dx) <= EPS && Math.abs(dz) <= EPS) {
    throw new Error(`Run [${a.join(', ')}] → [${b.join(', ')}] has no horizontal length`);
  }
  const ahead: Side = Math.abs(dx) > EPS ? (dx > 0 ? '+x' : '-x') : dz > 0 ? '+z' : '-z';
  return { ahead, length: Math.abs(dx) + Math.abs(dz) };
}

function add(p: Vec3, dx: number, dy: number, dz: number): Vec3 {
  return [p[0] + dx, p[1] + dy, p[2] + dz];
}

/** Point `d` along a side's normal from `p` (horizontal). */
function step(p: Vec3, side: Side, d: number): Vec3 {
  const [nx, nz] = sideNormal(side);
  return add(p, nx * d, 0, nz * d);
}

function boxPrim(min: Vec3, max: Vec3): BoxPrimitive {
  return {
    type: 'box',
    min: [Math.min(min[0], max[0]), Math.min(min[1], max[1]), Math.min(min[2], max[2])],
    max: [Math.max(min[0], max[0]), Math.max(min[1], max[1]), Math.max(min[2], max[2])],
  };
}

function rectShape(x0: number, z0: number, x1: number, z1: number): SurfaceShape {
  return {
    kind: 'rect',
    min: [Math.min(x0, x1), Math.min(z0, z1)],
    max: [Math.max(x0, x1), Math.max(z0, z1)],
  };
}

/** Box spanning a horizontal axis run between two points, `half` to either side of it. */
function runBox(a: Vec3, b: Vec3, half: number, y0: number, y1: number): BoxPrimitive {
  const alongX = Math.abs(b[0] - a[0]) > EPS;
  return alongX
    ? boxPrim([a[0], y0, a[2] - half], [b[0], y1, a[2] + half])
    : boxPrim([a[0] - half, y0, a[2]], [a[0] + half, y1, b[2]]);
}

function volume(id: string, ownerId: string, b: BoxPrimitive, openings: readonly Side[]): Volume {
  return {
    id,
    ownerId,
    shape: 'box',
    min: b.min,
    max: b.max,
    openings: [...new Set(openings)],
  };
}

function el(
  owner: Owner,
  part: MeshPart,
  primitive: KitPrimitive,
  evidenceClass: EvidenceClass = owner.evidenceClass,
): StructureElement {
  return {
    tag: { kind: owner.kind, id: owner.id, part, evidenceClass },
    primitive,
    tone: owner.tone,
  };
}

function sweep(from: Vec3, to: Vec3, sections: readonly SweepSection[]): SweepPrimitive {
  return { type: 'sweep', from, to, sections };
}

/** Evenly spaced points strictly inside a run, about `spacing` apart. */
function along(a: Vec3, b: Vec3, spacing: number): Vec3[] {
  const length = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const n = Math.max(1, Math.round(length / spacing));
  return Array.from({ length: n }, (_, k) => {
    const t = (k + 0.5) / n;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  });
}

function frameKind(profile: CorridorProfile): DecorKind {
  return profile.id === 'standard' ? 'frame-standard' : 'frame-narrow';
}

function panelKind(owner: Owner): DecorKind {
  return owner.tone === 'cultural' ? 'roundel' : 'hex-panel';
}

// ── Wall faces with openings ─────────────────────────────────────────────────

/** Rectangular opening in a wall face: `u` along the face (x for ±z walls, z for ±x walls). */
export interface Opening {
  readonly u0: number;
  readonly u1: number;
  readonly y0: number;
  readonly y1: number;
}

function subtract(
  spans: readonly (readonly [number, number])[],
  cut: readonly [number, number],
): [number, number][] {
  return spans.flatMap(([a, b]): [number, number][] => {
    if (cut[1] <= a + EPS || cut[0] >= b - EPS) return [[a, b]];
    const out: [number, number][] = [];
    if (cut[0] > a + EPS) out.push([a, cut[0]]);
    if (cut[1] < b - EPS) out.push([cut[1], b]);
    return out;
  });
}

/**
 * Boxes covering one wall face minus its openings. The wall lies on `side` between `depth`
 * (its span along the side's axis), across `u` and up `y`. Strips with the same solid spans
 * are merged, so a wall with one door is two jambs and a lintel.
 */
export function faceWall(
  side: Side,
  depth: readonly [number, number],
  u: readonly [number, number],
  y: readonly [number, number],
  openings: readonly Opening[],
): BoxPrimitive[] {
  const clamp = (v: number) => Math.min(u[1], Math.max(u[0], v));
  const cuts = [...new Set([u[0], u[1], ...openings.flatMap((o) => [clamp(o.u0), clamp(o.u1)])])];
  cuts.sort((a, b) => a - b);
  const strips: { u0: number; u1: number; solid: [number, number][] }[] = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const u0 = cuts[i] as number;
    const u1 = cuts[i + 1] as number;
    if (u1 - u0 <= EPS) continue;
    const solid = openings
      .filter((o) => o.u0 <= u0 + EPS && o.u1 >= u1 - EPS)
      .reduce((spans, o) => subtract(spans, [o.y0, o.y1]), [[y[0], y[1]]] as [number, number][]);
    const last = strips.at(-1);
    if (
      last &&
      Math.abs(last.u1 - u0) <= EPS &&
      JSON.stringify(last.solid) === JSON.stringify(solid)
    ) {
      last.u1 = u1;
    } else {
      strips.push({ u0, u1, solid });
    }
  }
  const alongX = side === '+z' || side === '-z';
  return strips.flatMap((s) =>
    s.solid.map(([y0, y1]) =>
      alongX
        ? boxPrim([s.u0, y0, depth[0]], [s.u1, y1, depth[1]])
        : boxPrim([depth[0], y0, s.u0], [depth[1], y1, s.u1]),
    ),
  );
}

/** Coordinate of a box's side along that side's axis. */
function sidePlane(min: Vec3, max: Vec3, side: Side): number {
  switch (side) {
    case '+x':
      return max[0];
    case '-x':
      return min[0];
    case '+z':
      return max[2];
    case '-z':
      return min[2];
  }
}

/** Span of a wall `thickness` thick just inside a box's side. */
function insideSpan(min: Vec3, max: Vec3, side: Side, thickness: number): [number, number] {
  const plane = sidePlane(min, max, side);
  return side === '+x' || side === '+z' ? [plane - thickness, plane] : [plane, plane + thickness];
}

// ── Pieces ───────────────────────────────────────────────────────────────────

export interface RunOptions {
  /** Id prefix for the piece's volume and surface. */
  readonly id: string;
  readonly owner: Owner;
  /** Walk-line points at the run's two end faces, at deck level. */
  readonly from: Vec3;
  readonly to: Vec3;
  readonly profile: CorridorProfile;
  /** Spacing of the support-rib frames along the run. */
  readonly ribSpacing: number;
}

/** Straight level hex-profile corridor, open at both ends. */
export function corridorRun(o: RunOptions): Piece {
  const { ahead } = axisRun(o.from, o.to);
  if (Math.abs(o.to[1] - o.from[1]) > EPS) throw new Error(`${o.id}: a run must be level`);
  const y = o.from[1];
  const hw = o.profile.width / 2;
  const hf = o.profile.floorWidth / 2;
  const s = profileSections(o.profile);
  const deck = runBox(o.from, o.to, hf, y, y);
  return {
    volumes: [
      volume(o.id, o.owner.id, runBox(o.from, o.to, hw, y, y + o.profile.height), [
        opposite(ahead),
        ahead,
      ]),
    ],
    surfaces: [
      {
        id: `${o.id}.deck`,
        ownerId: o.owner.id,
        y,
        shapes: [rectShape(deck.min[0], deck.min[2], deck.max[0], deck.max[2])],
      },
    ],
    elements: [
      el(o.owner, 'floor', sweep(o.from, o.to, s.deck)),
      el(o.owner, 'wall', sweep(o.from, o.to, s.walls)),
      el(o.owner, 'ceiling', sweep(o.from, o.to, s.ceiling)),
    ],
    decor: along(o.from, o.to, o.ribSpacing).map((position) => ({
      owner: o.owner,
      kind: frameKind(o.profile),
      placement: { position, yawDeg: sideBearing(ahead) },
    })),
  };
}

/** What a side of a square junction does: continue a corridor, stop at a wall, or hold a closed door. */
export type SideUse = 'open' | 'wall' | 'door';

export interface JunctionOptions {
  readonly id: string;
  readonly owner: Owner;
  /** Centre of the junction's deck. */
  readonly center: Vec3;
  readonly profile: CorridorProfile;
  readonly sides: Readonly<Record<Side, SideUse>>;
}

/**
 * Square node where corridors meet: two open sides make a straight or a corner, three a T,
 * four a cross. Closed sides are walls or walls holding a closed door (a reserved anchor).
 */
export function junction(o: JunctionOptions): Piece {
  const [cx, y, cz] = o.center;
  const hw = o.profile.width / 2;
  const { wallTop, bulge } = profileSections(o.profile);
  const outer = bulge + WALL_NU;
  const open = SIDES.filter((side) => o.sides[side] === 'open');
  const elements: StructureElement[] = [
    el(o.owner, 'floor', boxPrim([cx - hw, y - DECK_NU, cz - hw], [cx + hw, y, cz + hw])),
    el(
      o.owner,
      'ceiling',
      boxPrim(
        [cx - outer, y + wallTop, cz - outer],
        [cx + outer, y + wallTop + WALL_NU, cz + outer],
      ),
    ),
  ];
  const decor: Decor[] = [];
  const doorWidth = o.profile.floorWidth - 0.4;
  const doorHeight = wallTop - 0.6;
  for (const side of SIDES) {
    const use = o.sides[side];
    const [nx, nz] = sideNormal(side);
    if (use === 'open') {
      decor.push({
        owner: o.owner,
        kind: frameKind(o.profile),
        placement: { position: step(o.center, side, hw - 0.15), yawDeg: sideBearing(side) },
      });
      continue;
    }
    // ±z walls run the full width and ±x walls fit between them, so corners never overlap.
    const alongX = nx === 0;
    const reach = alongX ? outer : bulge;
    const centreU = alongX ? cx : cz;
    const plane = alongX ? cz + nz * bulge : cx + nx * bulge;
    const depth: [number, number] =
      (alongX ? nz : nx) > 0 ? [plane, plane + WALL_NU] : [plane - WALL_NU, plane];
    const holes: Opening[] =
      use === 'door'
        ? [{ u0: centreU - doorWidth / 2, u1: centreU + doorWidth / 2, y0: y, y1: y + doorHeight }]
        : [];
    for (const b of faceWall(
      side,
      depth,
      [centreU - reach, centreU + reach],
      [y, y + wallTop],
      holes,
    )) {
      elements.push(el(o.owner, 'wall', b));
    }
    if (use === 'door') {
      elements.push(
        el(o.owner, 'door-closed', {
          type: 'doorway',
          sill: step(o.center, side, bulge + WALL_NU / 2),
          azimuthDeg: sideBearing(side),
          width: doorWidth,
          height: doorHeight,
          depth: WALL_NU,
          profile: o.owner.tone === 'cultural' ? 'rect' : 'hex',
          closed: true,
        }),
      );
    } else {
      decor.push({
        owner: o.owner,
        kind: panelKind(o.owner),
        placement: {
          position: add(step(o.center, side, bulge - 0.02), 0, wallTop / 2, 0),
          yawDeg: sideBearing(opposite(side)),
        },
      });
    }
  }
  return {
    volumes: [
      volume(
        o.id,
        o.owner.id,
        boxPrim([cx - hw, y, cz - hw], [cx + hw, y + o.profile.height, cz + hw]),
        open,
      ),
    ],
    surfaces: [
      {
        id: `${o.id}.deck`,
        ownerId: o.owner.id,
        y,
        shapes: [rectShape(cx - hw, cz - hw, cx + hw, cz + hw)],
      },
    ],
    elements,
    decor,
  };
}

export interface StairHallOptions {
  readonly id: string;
  readonly owner: Owner;
  /** Walk-line points at the foot and head of the flight (the hall's two end faces). */
  readonly bottom: Vec3;
  readonly top: Vec3;
  readonly profile: CorridorProfile;
  readonly ribSpacing: number;
}

/**
 * Enclosed straight flight: a hex corridor sheared up the slope around a stair. It has no
 * floor surface of its own; its foot and head land on the decks of the pieces it joins.
 */
export function stairHall(o: StairHallOptions): Piece {
  const { ahead } = axisRun(o.bottom, o.top);
  const rise = o.top[1] - o.bottom[1];
  if (rise <= EPS) throw new Error(`${o.id}: a stair hall must climb from bottom to top`);
  const hw = o.profile.width / 2;
  const s = profileSections(o.profile);
  return {
    volumes: [
      volume(
        o.id,
        o.owner.id,
        runBox(o.bottom, o.top, hw, o.bottom[1], o.top[1] + o.profile.height),
        [opposite(ahead), ahead],
      ),
    ],
    surfaces: [],
    elements: [
      el(o.owner, 'stairs', {
        type: 'stairs',
        bottom: o.bottom,
        top: o.top,
        width: o.profile.floorWidth,
        steps: Math.max(1, Math.round(rise / STEP_RISE_NU)),
      }),
      el(o.owner, 'wall', sweep(o.bottom, o.top, s.walls)),
      el(o.owner, 'ceiling', sweep(o.bottom, o.top, s.ceiling)),
    ],
    decor: along(o.bottom, o.top, o.ribSpacing).map((position) => ({
      owner: o.owner,
      kind: frameKind(o.profile),
      placement: { position, yawDeg: sideBearing(ahead) },
    })),
  };
}

export interface ShaftOptions {
  readonly id: string;
  readonly owner: Owner;
  /** Plan position [x, z] of the shaft's axis, where its ladder hangs. */
  readonly center: Vec2;
  readonly bottomY: number;
  readonly topY: number;
  readonly profile: CorridorProfile;
  /** Side walkers enter by at the top, and leave by at the bottom. */
  readonly topSide: Side;
  readonly bottomSide: Side;
}

/** Rect [x0, z0, x1, z1] of the half of a square between its axis and one side. */
function halfSquare(
  cx: number,
  cz: number,
  hw: number,
  side: Side,
): [number, number, number, number] {
  switch (side) {
    case '+x':
      return [cx, cz - hw, cx + hw, cz + hw];
    case '-x':
      return [cx - hw, cz - hw, cx, cz + hw];
    case '+z':
      return [cx - hw, cz, cx + hw, cz + hw];
    case '-z':
      return [cx - hw, cz - hw, cx + hw, cz];
  }
}

/**
 * Enclosed vertical shaft: a landing on the entry half at the top, a ladder hanging from its
 * edge on the shaft axis, and a full landing at the foot, with door openings at both levels.
 */
export function ladderShaft(o: ShaftOptions): Piece {
  const [cx, cz] = o.center;
  const hw = o.profile.width / 2;
  const { wallTop } = profileSections(o.profile);
  const min: Vec3 = [cx - hw, o.bottomY, cz - hw];
  const max: Vec3 = [cx + hw, o.topY + o.profile.height, cz + hw];
  const doorWidth = o.profile.floorWidth;
  const doorHeight = wallTop - 0.4;
  const [lx0, lz0, lx1, lz1] = halfSquare(cx, cz, hw, o.topSide);
  const elements: StructureElement[] = [
    el(
      o.owner,
      'floor',
      boxPrim([cx - hw, o.bottomY - DECK_NU, cz - hw], [cx + hw, o.bottomY, cz + hw]),
    ),
    el(o.owner, 'floor', boxPrim([lx0, o.topY - DECK_NU, lz0], [lx1, o.topY, lz1])),
    el(o.owner, 'ladder', {
      type: 'ladder',
      bottom: [cx, o.bottomY, cz],
      top: [cx, o.topY, cz],
      width: 0.9,
      facingDeg: sideBearing(o.topSide),
    }),
    el(
      o.owner,
      'ceiling',
      boxPrim([cx - hw, o.topY + wallTop, cz - hw], [cx + hw, o.topY + wallTop + WALL_NU, cz + hw]),
    ),
  ];
  for (const side of SIDES) {
    const alongX = side === '+z' || side === '-z';
    const centreU = alongX ? cx : cz;
    // ±z walls run the full width and ±x walls fit between them.
    const reach = alongX ? hw : hw - WALL_NU;
    const door = (y: number): Opening => ({
      u0: centreU - doorWidth / 2,
      u1: centreU + doorWidth / 2,
      y0: y,
      y1: y + doorHeight,
    });
    const openings = [
      ...(side === o.topSide ? [door(o.topY)] : []),
      ...(side === o.bottomSide ? [door(o.bottomY)] : []),
    ];
    const walls = faceWall(
      side,
      insideSpan(min, max, side, WALL_NU),
      [centreU - reach, centreU + reach],
      [o.bottomY - DECK_NU, o.topY + wallTop],
      openings,
    );
    for (const b of walls) elements.push(el(o.owner, 'shaft', b));
  }
  return {
    volumes: [volume(o.id, o.owner.id, boxPrim(min, max), [o.topSide, o.bottomSide])],
    surfaces: [
      {
        id: `${o.id}.foot`,
        ownerId: o.owner.id,
        y: o.bottomY,
        shapes: [rectShape(cx - hw, cz - hw, cx + hw, cz + hw)],
      },
      {
        id: `${o.id}.head`,
        ownerId: o.owner.id,
        y: o.topY,
        shapes: [rectShape(lx0, lz0, lx1, lz1)],
      },
    ],
    elements,
    decor: [],
  };
}

export interface CatwalkOptions {
  readonly id: string;
  readonly owner: Owner;
  /** Two points (straight) or three (an L), level and axis-aligned, on the walk line. */
  readonly points: readonly Vec3[];
  readonly width: number;
}

/** Open walkway: a thin deck with guard rails, straight or turning once (an L). */
export function catwalk(o: CatwalkOptions): Piece {
  if (o.points.length < 2 || o.points.length > 3) {
    throw new Error(`${o.id}: a catwalk runs straight or turns once`);
  }
  const y = (o.points[0] as Vec3)[1];
  if (o.points.some((p) => Math.abs(p[1] - y) > EPS))
    throw new Error(`${o.id}: catwalks are level`);
  const h = o.width / 2;
  const a = o.points[0] as Vec3;
  const b = o.points.at(-1) as Vec3;
  const segments: [Vec3, Vec3][] = [];
  const rails: [Vec3, Vec3][] = [];
  const rail = (p: Vec3, side: Side, d: number) => step(p, side, d);
  if (o.points.length === 2) {
    const { ahead } = axisRun(a, b);
    const across = ahead === '+x' || ahead === '-x' ? '+z' : '+x';
    segments.push([a, b]);
    for (const s of [across, opposite(across)] as const) rails.push([rail(a, s, h), rail(b, s, h)]);
  } else {
    const c = o.points[1] as Vec3;
    const d1 = axisRun(a, c).ahead;
    const d2 = axisRun(c, b).ahead;
    if (d1 === d2 || d1 === opposite(d2)) throw new Error(`${o.id}: an L must turn`);
    // The first leg covers the corner square; the second starts beyond it.
    segments.push([a, step(c, d1, h)], [step(c, d2, h), b]);
    const outer = step(step(c, d1, h), opposite(d2), h);
    const inner = step(step(c, opposite(d1), h), d2, h);
    rails.push(
      [rail(a, opposite(d2), h), outer],
      [rail(a, d2, h), inner],
      [outer, rail(b, d1, h)],
      [inner, rail(b, opposite(d1), h)],
    );
  }
  const decks = segments.map(([p, q]) => runBox(p, q, h, y - 0.25, y));
  return {
    volumes: [],
    surfaces: [
      {
        id: `${o.id}.deck`,
        ownerId: o.owner.id,
        y,
        shapes: decks.map((d) => rectShape(d.min[0], d.min[2], d.max[0], d.max[2])),
      },
    ],
    elements: [
      ...decks.map((d) => el(o.owner, 'catwalk', d)),
      ...rails.map(([from, to]) =>
        el(o.owner, 'railing', { type: 'railing', path: 'line', from, to, height: RAIL_HEIGHT_NU }),
      ),
    ],
    decor: [],
  };
}

export interface GalleryOptions {
  readonly id: string;
  readonly owner: Owner;
  /** Outer edge of the ring in plan, [x, z]: usually a room's inner wall faces. */
  readonly min: Vec2;
  readonly max: Vec2;
  readonly y: number;
  readonly width: number;
}

/** Walkway ringing the inside of a room at one level, railed on its inner edge. */
export function galleryRing(o: GalleryOptions): Piece {
  const [x0, z0] = o.min;
  const [x1, z1] = o.max;
  const w = o.width;
  const strips: [number, number, number, number][] = [
    [x0, z0, x1, z0 + w],
    [x0, z1 - w, x1, z1],
    [x0, z0 + w, x0 + w, z1 - w],
    [x1 - w, z0 + w, x1, z1 - w],
  ];
  const corners: Vec3[] = [
    [x0 + w, o.y, z0 + w],
    [x1 - w, o.y, z0 + w],
    [x1 - w, o.y, z1 - w],
    [x0 + w, o.y, z1 - w],
  ];
  return {
    volumes: [],
    surfaces: [
      {
        id: `${o.id}.deck`,
        ownerId: o.owner.id,
        y: o.y,
        shapes: strips.map(([a, b, c, d]) => rectShape(a, b, c, d)),
      },
    ],
    elements: [
      ...strips.map(([a, b, c, d]) =>
        el(o.owner, 'catwalk', boxPrim([a, o.y - 0.4, b], [c, o.y, d])),
      ),
      ...corners.map((from, i) =>
        el(o.owner, 'railing', {
          type: 'railing',
          path: 'line',
          from,
          to: corners[(i + 1) % corners.length] as Vec3,
          height: RAIL_HEIGHT_NU,
        }),
      ),
    ],
    decor: [],
  };
}

export interface ChamberOptions {
  readonly id: string;
  readonly owner: Owner;
  readonly center: Vec3;
  /** Distance from the centre to each flat face: half the chamber's box. */
  readonly apothem: number;
  readonly height: number;
  /** Profile of the corridors that meet the open faces. */
  readonly profile: CorridorProfile;
  readonly open: readonly Side[];
}

/**
 * Octagonal node chamber for route branching (research §5.2): flat faces on the four axes
 * take corridors, the diagonal faces carry hex panels. Its floor is the inscribed disc.
 */
export function nodeChamber(o: ChamberOptions): Piece {
  const [cx, y, cz] = o.center;
  const a = o.apothem;
  const toCorner = 1 / Math.cos(Math.PI / 8);
  const outer = a * toCorner;
  const inner = (a - SHELL_WALL_NU) * toCorner;
  const wallTop = o.height - DECK_NU;
  const plate = (
    r0: number,
    r1: number,
    bottom: number,
    top: number,
    start?: number,
    sweepDeg?: number,
  ): KitPrimitive => ({
    type: 'plate',
    center: [cx, cz],
    inner: r0,
    outer: r1,
    bottom,
    top,
    sides: 8,
    ...(start === undefined ? {} : { startDeg: start }),
    ...(sweepDeg === undefined ? {} : { sweepDeg }),
  });
  const bearings = o.open.map(sideBearing).sort((p, q) => p - q);
  const arcs: [number, number][] =
    bearings.length === 0
      ? [[22.5, 360]]
      : bearings.map((b, i): [number, number] => {
          const next =
            (bearings[(i + 1) % bearings.length] as number) + (i + 1 === bearings.length ? 360 : 0);
          return [b + 22.5, next - 22.5 - (b + 22.5)];
        });
  const elements: StructureElement[] = [
    el(o.owner, 'floor', plate(0, outer, y - DECK_NU, y)),
    el(o.owner, 'ceiling', plate(0, outer, y + wallTop, y + wallTop + WALL_NU)),
    ...arcs
      .filter(([, sweepDeg]) => sweepDeg > EPS)
      .map(([start, sweepDeg]) =>
        el(o.owner, 'wall', plate(inner, outer, y, y + wallTop, start, sweepDeg)),
      ),
    ...(wallTop > o.profile.height
      ? bearings.map((b) =>
          el(o.owner, 'wall', plate(inner, outer, y + o.profile.height, y + wallTop, b - 22.5, 45)),
        )
      : []),
  ];
  const decor: Decor[] = [
    ...o.open.map((side) => ({
      owner: o.owner,
      kind: frameKind(o.profile),
      placement: { position: step(o.center, side, a - 0.15), yawDeg: sideBearing(side) },
    })),
    ...[45, 135, 225, 315].map((bearing) => {
      const r = a - SHELL_WALL_NU - 0.02;
      const rad = (bearing * Math.PI) / 180;
      return {
        owner: o.owner,
        kind: 'hex-panel' as const,
        placement: {
          position: [cx + Math.sin(rad) * r, y + wallTop / 2, cz + Math.cos(rad) * r] as Vec3,
          yawDeg: (bearing + 180) % 360,
        },
      };
    }),
  ];
  return {
    volumes: [
      volume(
        o.id,
        o.owner.id,
        boxPrim([cx - a, y, cz - a], [cx + a, y + o.height, cz + a]),
        o.open,
      ),
    ],
    surfaces: [
      {
        id: `${o.id}.deck`,
        ownerId: o.owner.id,
        y,
        shapes: [{ kind: 'annulus', center: [cx, cz], inner: 0, outer: a }],
      },
    ],
    elements,
    decor,
  };
}

export interface ShellOptions {
  readonly id: string;
  readonly owner: Owner;
  readonly min: Vec3;
  readonly max: Vec3;
  /** Door openings, each on a side, in that face's (u, y) coordinates. */
  readonly openings: readonly (Opening & { readonly side: Side })[];
  /** False for rooms walked on a catwalk or gallery above an unwalkable well. */
  readonly walkableFloor: boolean;
  /** Decorate door-free outer faces with a row of panels. */
  readonly panels: boolean;
}

/** Greybox room: floor slab, walls inside the box with door openings, and a ceiling. */
export function boxShell(o: ShellOptions): Piece {
  const { min, max } = o;
  const t = SHELL_WALL_NU;
  const elements: StructureElement[] = [
    el(o.owner, 'floor', boxPrim([min[0], min[1] - DECK_NU, min[2]], [max[0], min[1], max[2]])),
    el(
      o.owner,
      'ceiling',
      boxPrim([min[0] + t, max[1] - t, min[2] + t], [max[0] - t, max[1], max[2] - t]),
    ),
  ];
  const decor: Decor[] = [];
  for (const side of SIDES) {
    const alongX = side === '+z' || side === '-z';
    // ±z walls run the full width and ±x walls fit between them.
    const u: [number, number] = alongX ? [min[0], max[0]] : [min[2] + t, max[2] - t];
    const openings = o.openings.filter((x) => x.side === side);
    for (const b of faceWall(
      side,
      insideSpan(min, max, side, t),
      u,
      [min[1], max[1] - t],
      openings,
    )) {
      elements.push(el(o.owner, 'wall', b));
    }
    if (o.panels && openings.length === 0) {
      const plane = sidePlane(min, max, side);
      const count = Math.max(1, Math.floor((u[1] - u[0]) / 4));
      const midY = (min[1] + max[1]) / 2;
      for (let k = 0; k < count; k++) {
        const at = u[0] + ((u[1] - u[0]) * (k + 0.5)) / count;
        decor.push({
          owner: o.owner,
          kind: panelKind(o.owner),
          placement: {
            position: alongX ? [at, midY, plane] : [plane, midY, at],
            yawDeg: sideBearing(side),
          },
        });
      }
    }
  }
  return {
    volumes: [{ id: o.id, ownerId: o.owner.id, shape: 'box', min, max }],
    surfaces: o.walkableFloor
      ? [
          {
            id: `${o.id}.floor`,
            ownerId: o.owner.id,
            y: min[1],
            shapes: [rectShape(min[0], min[2], max[0], max[2])],
          },
        ]
      : [],
    elements,
    decor,
  };
}

export interface ThresholdOptions {
  readonly owner: Owner;
  /** Side of the room the doorway is cut in. */
  readonly side: Side;
  /** Centre of the opening's sill on the wall's plane, at walk level. */
  readonly sill: Vec3;
  readonly width: number;
  readonly height: number;
  readonly profile: 'rect' | 'hex';
}

/** Doorway frame dressing an opening a route passes through. */
export function threshold(o: ThresholdOptions): StructureElement {
  return el(o.owner, 'doorway', {
    type: 'doorway',
    sill: o.sill,
    azimuthDeg: sideBearing(o.side),
    width: o.width,
    height: o.height,
    depth: SHELL_WALL_NU,
    profile: o.profile,
    closed: false,
  });
}

// ── Decorative repeats ───────────────────────────────────────────────────────

function polygon(sides: number, r: number, startDeg: number): Vec2[] {
  return Array.from({ length: sides }, (_, k): Vec2 => {
    const a = ((startDeg + (360 * k) / sides) * Math.PI) / 180;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
}

/** Instance base of a decor kind, around the local origin and facing +Z. */
export function decorBase(kind: DecorKind): SweepPrimitive {
  switch (kind) {
    case 'frame-standard':
      return sweep([0, 0, -0.15], [0, 0, 0.15], profileSections(PROFILES.standard).frame);
    case 'frame-narrow':
      return sweep([0, 0, -0.15], [0, 0, 0.15], profileSections(PROFILES.narrow).frame);
    case 'roundel':
      return sweep([0, 0, 0], [0, 0, 0.1], [{ outline: polygon(16, 0.8, 0) }]);
    case 'hex-panel':
      return sweep([0, 0, 0], [0, 0, 0.1], [{ outline: polygon(6, 0.8, 0) }]);
  }
}

/** One instanced element per owner and decor kind: frames are ribs, the rest panels. */
export function decorElements(decor: readonly Decor[]): StructureElement[] {
  const groups = new Map<string, { owner: Owner; kind: DecorKind; placements: Placement[] }>();
  for (const d of decor) {
    const key = [d.owner.kind, d.owner.id, d.owner.evidenceClass, d.owner.tone, d.kind].join('|');
    const group = groups.get(key) ?? { owner: d.owner, kind: d.kind, placements: [] };
    group.placements.push(d.placement);
    groups.set(key, group);
  }
  return [...groups.values()].map((g) =>
    el(g.owner, g.kind.startsWith('frame') ? 'rib' : 'panel', {
      type: 'instances',
      base: decorBase(g.kind),
      placements: g.placements,
    }),
  );
}
