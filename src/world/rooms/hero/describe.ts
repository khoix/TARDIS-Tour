/**
 * Journey hero spaces (Execution 5): the features that make each Journey Tier-1 room
 * recognizable, described inside the room's fixed layout box (src/data/layout.ts) and around
 * its fixed door anchors (src/world/rooms/shells.ts). Dressing adds no volumes and moves no
 * anchor; the only new walkable floors are the library galleries, reached by the library's
 * own ladders. Parameters and their evidence basis: ./params.ts.
 *
 * - S-01: shelving on its blank walls, mementos on the shelves, the cot and the toy TARDIS.
 * - L-01: stacks `floorCount` storeys tall, a railed gallery per upper storey, ladders, and
 *   the bottled encyclopedia on a stand.
 * - ARS-01: a branching tree-like machine with glowing orbs; a door whose edge data records
 *   `reconfiguring` gets a marker frame and label.
 * - F-01: exposed glowing rods hanging in the tunnel and rising between the fuel cells.
 * - E-A: bulkhead frames, locking wheels and seal strips (sealed antechamber).
 * - E-01: the star held in decay under the catwalk, its containment ring and frozen flares,
 *   plus sealed blind thresholds at catwalk level.
 * - E-V: the B28 portal marked as non-ordinary (frame, floor chevrons, label).
 * - ENG-01: the explosion frozen in time in the void below the gallery.
 */

import { getConnection, V1_CONNECTIONS } from '../../../data/connections';
import { getShell, getTransform, type Side, type Vec3 } from '../../../data/layout';
import type { Bounds } from '../../../scene/camera/isometric';
import { roomBounds } from '../../../scene/topology';
import {
  DECK_NU,
  galleryRing,
  type Owner,
  PROFILES,
  SHELL_WALL_NU,
  sideBearing,
  sideNormal,
} from '../../kit/modules';
import { describeTier1Map, mergeDescriptions } from '../../skeleton';
import {
  type BoxPrimitive,
  evidenceClassOfProvenance,
  type KitPrimitive,
  type MeshPart,
  polar,
  type StructureDescription,
  type StructureElement,
  type SweepPrimitive,
  type Vec2,
  type WalkableSurface,
} from '../../structure';
import { doorCentre, doorSize, roomOwner } from '../shells';
import { HERO_PARAMS, type HeroParams, type HeroRoomId } from './params';

/** Journey rooms with hero detail, in the order of the Doctor's and Clara's routes. */
export const HERO_ROOM_IDS: readonly HeroRoomId[] = [
  'S-01',
  'L-01',
  'ARS-01',
  'F-01',
  'E-A',
  'E-01',
  'E-V',
  'ENG-01',
];

/** What one hero room adds to its greybox shell. */
export interface HeroDressing {
  readonly roomId: HeroRoomId;
  readonly surfaces: readonly WalkableSurface[];
  readonly elements: readonly StructureElement[];
}

export const RECONFIGURING_LABEL = 'Door reconfigures: it vanished and returned on screen';
export const PORTAL_LABEL = 'B28 portal · non-Euclidean, never walked';

// ── Helpers ──────────────────────────────────────────────────────────────────

function boundsOf(roomId: string): Bounds {
  const t = getTransform(roomId);
  if (!t) throw new Error(`No layout for ${roomId}`);
  return roomBounds(t);
}

function centreOf(b: Bounds): Vec2 {
  return [(b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2];
}

function elem(owner: Owner, part: MeshPart, primitive: KitPrimitive): StructureElement {
  return {
    tag: { kind: owner.kind, id: owner.id, part, evidenceClass: owner.evidenceClass },
    tone: owner.tone,
    primitive,
  };
}

function box(min: Vec3, max: Vec3): BoxPrimitive {
  return { type: 'box', min, max };
}

/** Box centred on the local origin, for instance bases. */
function centredBox(sx: number, sy: number, sz: number, y0 = -sy / 2): BoxPrimitive {
  return box([-sx / 2, y0, -sz / 2], [sx / 2, y0 + sy, sz / 2]);
}

function square(half: number): Vec2[] {
  return [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
}

function polygon(sides: number, r: number): Vec2[] {
  return Array.from({ length: sides }, (_, k): Vec2 => {
    const a = (2 * Math.PI * k) / sides;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
}

/** A strut of square section between two points (level or sloped, never vertical). */
function strut(from: Vec3, to: Vec3, half: number): SweepPrimitive {
  return { type: 'sweep', from, to, sections: [{ outline: square(half) }] };
}

/** A sphere in the greybox: `slices` stacked 16-sided discs. */
function orb(owner: Owner, part: MeshPart, c: Vec3, r: number, slices: number) {
  return Array.from({ length: slices }, (_, i) => {
    const y0 = c[1] - r + (2 * r * i) / slices;
    const y1 = c[1] - r + (2 * r * (i + 1)) / slices;
    const t = ((y0 + y1) / 2 - c[1]) / r;
    return elem(owner, part, {
      type: 'plate',
      center: [c[0], c[2]],
      inner: 0,
      outer: r * Math.sqrt(1 - t * t),
      bottom: y0,
      top: y1,
      sides: 16,
    });
  });
}

/** Coordinate of the inner face of a room's wall on `side`. */
function innerPlane(b: Bounds, side: Side): number {
  const t = SHELL_WALL_NU;
  switch (side) {
    case '+x':
      return b.max[0] - t;
    case '-x':
      return b.min[0] + t;
    case '+z':
      return b.max[2] - t;
    case '-z':
      return b.min[2] + t;
  }
}

/** Box against the inner face of `side`: `d0`..`d1` inward from it, `u0`..`u1` along it. */
function wallBox(
  b: Bounds,
  side: Side,
  d0: number,
  d1: number,
  u0: number,
  u1: number,
  y0: number,
  y1: number,
): BoxPrimitive {
  const [nx, nz] = sideNormal(side);
  const plane = innerPlane(b, side);
  const p0 = plane - (nx + nz) * d0;
  const p1 = plane - (nx + nz) * d1;
  const [a0, a1] = [Math.min(p0, p1), Math.max(p0, p1)];
  return side === '+x' || side === '-x'
    ? box([a0, y0, u0], [a1, y1, u1])
    : box([u0, y0, a0], [u1, y1, a1]);
}

/** World point `d` inward from the inner face of `side`, at `u` along it and height `y`. */
function wallPoint(b: Bounds, side: Side, d: number, u: number, y: number): Vec3 {
  const [nx, nz] = sideNormal(side);
  const p = innerPlane(b, side) - (nx + nz) * d;
  return side === '+x' || side === '-x' ? [p, y, u] : [u, y, p];
}

interface DoorOpening {
  readonly side: Side;
  /** Centre of the opening along its wall. */
  readonly u: number;
  readonly sill: number;
  readonly width: number;
  readonly height: number;
}

function doorOpening(roomId: string, anchorId: string): DoorOpening {
  const door = getShell(roomId)?.doors.find((d) => d.anchorId === anchorId);
  if (!door) throw new Error(`${roomId} has no door ${anchorId}`);
  const b = boundsOf(roomId);
  const c = doorCentre(b, door, b.min[1] + (door.sill ?? 0));
  const size = doorSize(roomId, anchorId);
  return {
    side: door.side,
    u: door.side === '+x' || door.side === '-x' ? c[2] : c[0],
    sill: c[1],
    ...size,
  };
}

/** Jambs and lintel ringing a door opening on the inside of its wall, `gap` clear of it. */
function doorFrame(
  b: Bounds,
  o: DoorOpening,
  gap: number,
  width: number,
  depth: number,
): BoxPrimitive[] {
  const inner = o.width / 2 + gap;
  const outer = inner + width;
  const top = o.sill + o.height + gap;
  return [
    wallBox(b, o.side, 0, depth, o.u - outer, o.u - inner, o.sill, top + width),
    wallBox(b, o.side, 0, depth, o.u + inner, o.u + outer, o.sill, top + width),
    wallBox(b, o.side, 0, depth, o.u - inner, o.u + inner, top, top + width),
  ];
}

/** Edge-owned dressing (markers on a door), tagged by the edge's provenance. */
function edgeOwner(connectionId: string, tone: Owner['tone']): Owner {
  const c = getConnection(connectionId);
  if (!c) throw new Error(`Unknown connection ${connectionId}`);
  return {
    kind: 'connection',
    id: c.id,
    tone,
    evidenceClass: evidenceClassOfProvenance(c.provenance),
  };
}

/**
 * Shelving against one wall, `levels` storeys of bays: boards and uprights (`stack`) and a
 * filled slot on every `fill`-th shelf (`prop`: books, crates, mementos). `skip` leaves a bay
 * of a storey empty (a doorway). Every repeat is instanced.
 */
interface ShelvingOptions {
  readonly b: Bounds;
  readonly owner: Owner;
  readonly fillOwner: Owner;
  readonly side: Side;
  readonly u0: number;
  readonly u1: number;
  readonly y0: number;
  readonly levels: number;
  readonly levelHeight: number;
  readonly pitch: number;
  readonly depth: number;
  readonly bayWidth: number;
  readonly fill: number;
  readonly skip?: (level: number, bayU0: number, bayU1: number) => boolean;
}

function shelving(o: ShelvingOptions): StructureElement[] {
  const bays = Math.max(1, Math.round((o.u1 - o.u0) / o.bayWidth));
  const bw = (o.u1 - o.u0) / bays;
  const yaw = o.side === '+x' || o.side === '-x' ? 90 : 0;
  const shelves = Math.max(1, Math.round(o.levelHeight / o.pitch));
  const at = (u: number, y: number): Vec3 => wallPoint(o.b, o.side, o.depth / 2, u, y);
  const present = (level: number, k: number) =>
    k >= 0 && k < bays && !o.skip?.(level, o.u0 + k * bw, o.u0 + (k + 1) * bw);
  const boards: Vec3[] = [];
  const uprights: Vec3[] = [];
  const fills: Vec3[] = [];
  for (let level = 0; level < o.levels; level++) {
    const base = o.y0 + level * o.levelHeight;
    for (let k = 0; k <= bays; k++) {
      if (present(level, k - 1) || present(level, k)) uprights.push(at(o.u0 + k * bw, base));
    }
    for (let k = 0; k < bays; k++) {
      if (!present(level, k)) continue;
      const u = o.u0 + (k + 0.5) * bw;
      for (let j = 0; j < shelves; j++) {
        const y = base + j * o.pitch;
        boards.push(at(u, y));
        if ((k + j + level) % o.fill === 0) fills.push(at(u, y + 0.1));
      }
      if (level === o.levels - 1) boards.push(at(u, base + o.levelHeight - 0.1));
    }
  }
  const place = (positions: Vec3[]) => positions.map((position) => ({ position, yawDeg: yaw }));
  return [
    elem(o.owner, 'stack', {
      type: 'instances',
      base: centredBox(bw, 0.1, o.depth, 0),
      placements: place(boards),
    }),
    elem(o.owner, 'stack', {
      type: 'instances',
      base: centredBox(0.12, o.levelHeight, o.depth, 0),
      placements: place(uprights),
    }),
    elem(o.fillOwner, 'prop', {
      type: 'instances',
      base: centredBox(bw - 0.4, o.pitch * 0.7, o.depth - 0.3, 0),
      placements: place(fills),
    }),
  ];
}

// ── Rooms ────────────────────────────────────────────────────────────────────

/** Cot storeroom: shelving on the walls without a door, the cot and the toy TARDIS. */
function describeStoreroom(p: HeroParams['S-01']): HeroDressing {
  const id = 'S-01';
  const b = boundsOf(id);
  const seen = roomOwner(id, 'sourced');
  const t = SHELL_WALL_NU;
  const doorSides = new Set(getShell(id)?.doors.map((d) => d.side));
  const shelved = (['-x', '+x', '-z', '+z'] as const).filter((s) => !doorSides.has(s));
  const elements: StructureElement[] = [];
  for (const side of shelved) {
    const alongX = side === '+z' || side === '-z';
    const u0 = alongX ? b.min[0] + t : b.min[2] + t + (shelved.includes('-z') ? p.shelfDepth : 0);
    const u1 = alongX ? b.max[0] - t : b.max[2] - t - (shelved.includes('+z') ? p.shelfDepth : 0);
    elements.push(
      ...shelving({
        b,
        owner: seen,
        fillOwner: seen,
        side,
        u0,
        u1,
        y0: b.min[1],
        levels: 1,
        levelHeight: p.shelfHeight,
        pitch: p.shelfPitch,
        depth: p.shelfDepth,
        bayWidth: p.bayWidth,
        fill: p.mementoEvery,
      }),
    );
  }
  // The cot stands beside the first shelved side wall, clear of the doorway.
  const y0 = b.min[1];
  const [, cz] = centreOf(b);
  const x0 = b.min[0] + t + p.shelfDepth + 0.3;
  const x1 = x0 + p.cotSize[0];
  const z0 = cz - p.cotSize[1] / 2;
  const z1 = cz + p.cotSize[1] / 2;
  const h = p.cotHeight;
  elements.push(
    elem(seen, 'prop', box([x0, y0 + 0.5, z0], [x1, y0 + 0.8, z1])),
    ...[
      [x0, z0],
      [x1 - 0.1, z0],
      [x0, z1 - 0.1],
      [x1 - 0.1, z1 - 0.1],
    ].map(([x, z]) =>
      elem(
        seen,
        'prop',
        box([x as number, y0, z as number], [(x as number) + 0.1, y0 + h, (z as number) + 0.1]),
      ),
    ),
    elem(seen, 'prop', box([x0, y0 + h - 0.1, z0], [x0 + 0.08, y0 + h, z1])),
    elem(seen, 'prop', box([x1 - 0.08, y0 + h - 0.1, z0], [x1, y0 + h, z1])),
    elem(seen, 'prop', {
      type: 'instances',
      base: centredBox(0.06, h - 0.9, 0.06, 0),
      placements: Array.from(
        { length: Math.floor((z1 - z0 - 0.2) / 0.3) },
        (_, k) => z0 + 0.25 + k * 0.3,
      ).flatMap((z) => [
        { position: [x0 + 0.04, y0 + 0.8, z] as Vec3, yawDeg: 0 },
        { position: [x1 - 0.04, y0 + 0.8, z] as Vec3, yawDeg: 0 },
      ]),
    }),
    // The toy TARDIS, standing on the cot.
    elem(
      seen,
      'prop',
      box([(x0 + x1) / 2 - 0.17, y0 + 0.8, cz - 0.17], [(x0 + x1) / 2 + 0.17, y0 + 1.4, cz + 0.17]),
    ),
  );
  return { roomId: id, surfaces: [], elements };
}

/** Library: storeys of stacks, a gallery per upper storey with its ladder, the encyclopedia. */
function describeLibrary(p: HeroParams['L-01']): HeroDressing {
  const id = 'L-01';
  const b = boundsOf(id);
  const t = SHELL_WALL_NU;
  const y0 = b.min[1];
  const top = y0 + p.floorCount * p.levelHeight;
  if (!Number.isInteger(p.floorCount) || p.floorCount < 1)
    throw new Error(`${id}: floorCount must be a positive integer`);
  if (top > b.max[1] - t) {
    throw new Error(`${id}: ${p.floorCount} storeys of ${p.levelHeight} NU exceed the room`);
  }
  const seen = roomOwner(id, 'sourced');
  const authored = roomOwner(id, 'inferred');
  const d = p.stackDepth;
  const ix0 = b.min[0] + t;
  const ix1 = b.max[0] - t;
  const iz0 = b.min[2] + t;
  const iz1 = b.max[2] - t;
  const doors = (getShell(id)?.doors ?? []).map((door) => doorOpening(id, door.anchorId));
  const elements: StructureElement[] = [];
  for (const side of ['-x', '+x', '-z', '+z'] as const) {
    const alongX = side === '+z' || side === '-z';
    const blocked = doors.filter((o) => o.side === side);
    elements.push(
      ...shelving({
        b,
        owner: seen,
        fillOwner: seen,
        side,
        u0: alongX ? ix0 : iz0 + d,
        u1: alongX ? ix1 : iz1 - d,
        y0,
        levels: p.floorCount,
        levelHeight: p.levelHeight,
        pitch: p.shelfPitch,
        depth: d,
        bayWidth: p.bayWidth,
        fill: 1,
        // Leave every bay of the ground storey that a doorway's opening reaches empty.
        skip: (level, a, c) =>
          blocked.some(
            (o) =>
              y0 + level * p.levelHeight < o.sill + o.height &&
              a < o.u + o.width / 2 + 0.2 &&
              c > o.u - o.width / 2 - 0.2,
          ),
      }),
    );
  }
  const surfaces: WalkableSurface[] = [];
  const outer = { min: [ix0 + d, iz0 + d] as Vec2, max: [ix1 - d, iz1 - d] as Vec2 };
  const [cx, cz] = centreOf(b);
  const sides: readonly Side[] = ['-x', '+z', '-z'];
  for (let k = 1; k < p.floorCount; k++) {
    const y = y0 + k * p.levelHeight;
    const gallery = galleryRing({
      id: `${id}.gallery${k}`,
      owner: authored,
      min: outer.min,
      max: outer.max,
      y,
      width: p.galleryWidth,
    });
    surfaces.push(...gallery.surfaces);
    elements.push(...gallery.elements);
    // Each gallery's ladder stands on the ground floor just off its inner edge.
    const side = sides[(k - 1) % sides.length] as Side;
    const shift = [0, 3, -3][Math.floor((k - 1) / sides.length)];
    if (shift === undefined) throw new Error(`${id}: too many storeys for the ladder layout`);
    const reach = p.galleryWidth + p.ladderGap;
    const foot: Vec3 =
      side === '-x'
        ? [outer.min[0] + reach, y0, cz + shift]
        : side === '+z'
          ? [cx + shift, y0, outer.max[1] - reach]
          : [cx + shift, y0, outer.min[1] + reach];
    elements.push(
      elem(authored, 'ladder', {
        type: 'ladder',
        bottom: foot,
        top: [foot[0], y, foot[2]],
        width: p.ladderWidth,
        facingDeg: sideBearing(side),
      }),
    );
  }
  // The bottled encyclopedia on a stand in the middle of the floor.
  elements.push(
    elem(authored, 'prop', {
      type: 'plate',
      center: [cx, cz],
      inner: 0,
      outer: p.lecternRadius,
      bottom: y0,
      top: y0 + 1.1,
      sides: 8,
    }),
    elem(seen, 'prop', {
      type: 'plate',
      center: [cx, cz],
      inner: 0,
      outer: p.lecternRadius * 0.4,
      bottom: y0 + 1.1,
      top: y0 + 1.9,
      sides: 12,
    }),
  );
  return { roomId: id, surfaces, elements };
}

/** Markers on every door of the room whose edge data records `reconfiguring`. */
function reconfiguringMarkers(roomId: string): StructureElement[] {
  const b = boundsOf(roomId);
  const tone = roomOwner(roomId).tone;
  return V1_CONNECTIONS.filter((c) => c.observedStates.includes('reconfiguring')).flatMap((c) =>
    [c.from, c.to]
      .filter((end) => end.room === roomId)
      .flatMap((end) => {
        const o = doorOpening(roomId, end.anchor);
        const frame = doorFrame(b, o, 0.15, 0.2, 0.12).map((f) =>
          elem(edgeOwner(c.id, tone), 'glow', f),
        );
        const [first, ...rest] = frame;
        if (!first) return [];
        return [
          {
            ...first,
            label: RECONFIGURING_LABEL,
            labelKind: 'feature' as const,
            labelAt: wallPoint(b, o.side, 0.5, o.u, o.sill + o.height + 1.2),
          },
          ...rest,
        ];
      }),
  );
}

/** ARS: a branching tree-like machine bearing glowing orbs. */
function describeArs(p: HeroParams['ARS-01']): HeroDressing {
  const id = 'ARS-01';
  const b = boundsOf(id);
  const y0 = b.min[1];
  const c = centreOf(b);
  if (p.tierHeights.length !== p.tierReach.length)
    throw new Error(`${id}: one reach per branch tier`);
  if (y0 + p.trunkHeight > b.max[1] - SHELL_WALL_NU)
    throw new Error(`${id}: trunk exceeds the room`);
  const seen = roomOwner(id, 'sourced');
  const authored = roomOwner(id, 'inferred');
  const elements: StructureElement[] = [
    elem(authored, 'machine', {
      type: 'plate',
      center: c,
      inner: 0,
      outer: p.plinthRadius,
      bottom: y0,
      top: y0 + 0.6,
      sides: 8,
    }),
    elem(seen, 'machine', {
      type: 'plate',
      center: c,
      inner: 0,
      outer: p.trunkRadius,
      bottom: y0 + 0.6,
      top: y0 + p.trunkHeight,
      sides: 8,
    }),
  ];
  const tips: Vec3[] = [];
  p.tierHeights.forEach((h, tier) => {
    const reach = p.tierReach[tier] as number;
    for (let i = 0; i < p.branchesPerTier; i++) {
      const az = (360 * i) / p.branchesPerTier + (tier * 180) / p.branchesPerTier;
      const tip = polar(c, reach, az, y0 + h + p.branchRise);
      tips.push(tip);
      elements.push(
        elem(seen, 'machine', strut(polar(c, p.trunkRadius * 0.8, az, y0 + h), tip, 0.15)),
      );
    }
  });
  const r = p.bulbRadius;
  elements.push(
    elem(seen, 'machine', {
      type: 'instances',
      base: centredBox(0.08, p.bulbDrop - r, 0.08, 0),
      placements: tips.map((tip) => ({
        position: [tip[0], tip[1] - (p.bulbDrop - r), tip[2]] as Vec3,
        yawDeg: 0,
      })),
    }),
    elem(seen, 'glow', {
      type: 'instances',
      base: { type: 'plate', center: [0, 0], inner: 0, outer: r, bottom: -r, top: r, sides: 8 },
      placements: tips.map((tip) => ({
        position: [tip[0], tip[1] - p.bulbDrop, tip[2]] as Vec3,
        yawDeg: 0,
      })),
    }),
    ...reconfiguringMarkers(id),
  );
  return { roomId: id, surfaces: [], elements };
}

/**
 * Fuel-cell tunnel: rods hang either side of the walk line under the tunnel ceiling, and stand
 * in the lane between the two rows of fuel cells on the deck above (shells.ts lays the cells
 * out in `count` slots per row; the rods take the slot boundaries).
 */
function describeFuelTunnel(p: HeroParams['F-01']): HeroDressing {
  const id = 'F-01';
  const b = boundsOf(id);
  const shell = getShell(id);
  const profile = PROFILES[shell?.profile ?? 'standard'];
  const alongX = b.max[0] - b.min[0] >= b.max[2] - b.min[2];
  if (alongX) throw new Error(`${id}: the tunnel runs along Z`);
  const seen = roomOwner(id, 'sourced');
  const y0 = b.min[1];
  const [cx] = centreOf(b);
  const r = p.rodRadius;
  const rodTop = y0 + profile.height - 0.3;
  if (rodTop - (y0 + p.headroom) <= 0) throw new Error(`${id}: no room for rods over the headroom`);
  const hanging: Vec3[] = [];
  for (let z = b.min[2] + 1; z <= b.max[2] - 1 + 1e-6; z += p.tunnelRodSpacing) {
    for (const x of [cx - p.tunnelRodOffset, cx + p.tunnelRodOffset])
      hanging.push([x, y0 + p.headroom, z]);
  }
  const deckTop = y0 + profile.height + DECK_NU;
  const z0 = b.min[2] + 1;
  const run = b.max[2] - 1 - z0;
  const slots = Math.max(1, Math.floor(run / 3.5));
  const standing = Array.from({ length: slots + 1 }, (_, k): Vec3 => [
    cx,
    deckTop,
    z0 + (run * k) / slots,
  ]);
  if (deckTop + p.deckRodHeight > b.max[1]) throw new Error(`${id}: deck rods exceed the room`);
  const rod = (height: number) =>
    ({
      type: 'plate',
      center: [0, 0],
      inner: 0,
      outer: r,
      bottom: 0,
      top: height,
      sides: 6,
    }) as const;
  return {
    roomId: id,
    surfaces: [],
    elements: [
      elem(seen, 'rod', {
        type: 'instances',
        base: rod(rodTop - (y0 + p.headroom)),
        placements: hanging.map((position) => ({ position, yawDeg: 0 })),
      }),
      elem(seen, 'rod', {
        type: 'instances',
        base: { ...rod(p.deckRodHeight), outer: r * 1.5 },
        placements: standing.map((position) => ({ position, yawDeg: 0 })),
      }),
    ],
  };
}

/** Vertical disc facing ±X on the inside of a side wall: a locking wheel. */
function wheel(b: Bounds, side: '+x' | '-x', u: number, y: number, radius: number): SweepPrimitive {
  const from = wallPoint(b, side, 0, u, y);
  const to = wallPoint(b, side, 0.12, u, y);
  return {
    type: 'sweep',
    from,
    to,
    sections: [
      { outline: polygon(12, radius), holes: [polygon(12, radius - 0.15)] },
      { outline: polygon(6, 0.2) },
      {
        outline: [
          [-radius + 0.1, -0.05],
          [radius - 0.1, -0.05],
          [radius - 0.1, 0.05],
          [-radius + 0.1, 0.05],
        ],
      },
    ],
  };
}

/** Antechamber: bulkhead frames on both doors, locking wheels and seal strips. */
function describeAntechamber(p: HeroParams['E-A']): HeroDressing {
  const id = 'E-A';
  const b = boundsOf(id);
  const authored = roomOwner(id, 'inferred');
  const doors = (getShell(id)?.doors ?? []).map((door) => doorOpening(id, door.anchorId));
  const [, cz] = centreOf(b);
  const y = b.min[1] + 2;
  return {
    roomId: id,
    surfaces: [],
    elements: [
      ...doors.flatMap((o) => [
        ...doorFrame(b, o, 0, p.bulkheadWidth, p.bulkheadDepth).map((f) =>
          elem(authored, 'machine', f),
        ),
        elem(
          authored,
          'glow',
          wallBox(
            b,
            o.side,
            0,
            p.sealStripDepth,
            o.u - o.width / 2,
            o.u + o.width / 2,
            o.sill,
            o.sill + 0.03,
          ),
        ),
      ]),
      elem(authored, 'machine', wheel(b, '-x', cz, y, p.wheelRadius)),
      elem(authored, 'machine', wheel(b, '+x', cz, y, p.wheelRadius)),
    ],
  };
}

/** Eye chamber: the star held in decay below the catwalk, its containment and flares. */
function describeEye(p: HeroParams['E-01']): HeroDressing {
  const id = 'E-01';
  const b = boundsOf(id);
  const shell = getShell(id);
  const sill = shell?.doors[0]?.sill ?? 0;
  const walkY = b.min[1] + sill;
  const c = centreOf(b);
  const core: Vec3 = [c[0], walkY - p.coreDrop, c[1]];
  const R = p.coreRadius;
  if (core[1] + R >= walkY - 0.5) throw new Error(`${id}: the core reaches the catwalk`);
  if (core[1] - R <= b.min[1]) throw new Error(`${id}: the core reaches the floor`);
  const seen = roomOwner(id, 'sourced');
  const authored = roomOwner(id, 'inferred');
  const ring = R + p.cageGap;
  const elements: StructureElement[] = [
    ...orb(seen, 'glow', core, R, p.coreSlices),
    elem(authored, 'machine', {
      type: 'plate',
      center: c,
      inner: ring,
      outer: ring + 0.3,
      bottom: core[1] - 0.15,
      top: core[1] + 0.15,
      sides: 24,
    }),
  ];
  for (let k = 0; k < p.cageStruts; k++) {
    const az = (360 * k) / p.cageStruts + 30;
    const [x, , z] = polar(c, ring + 0.15, az, 0);
    elements.push(
      elem(
        authored,
        'machine',
        box([x - 0.15, b.min[1], z - 0.15], [x + 0.15, core[1] - 0.15, z + 0.15]),
      ),
    );
  }
  for (let k = 0; k < p.flareCount; k++) {
    const az = (360 * k) / p.flareCount + 22.5;
    const dy = (k % 2 === 0 ? 1 : -1) * R * 0.4;
    elements.push(
      elem(
        seen,
        'glow',
        strut(
          polar(c, R * 0.8, az, core[1] + dy),
          polar(c, R + p.flareReach, az, core[1] + dy * 2),
          0.15,
        ),
      ),
    );
  }
  // Sealed doorways at catwalk level on the walls the route does not use, each on a bracket.
  const used = new Set(shell?.doors.map((d) => d.side));
  const blind = (['+x', '+z', '-x', '-z'] as const)
    .filter((s) => !used.has(s))
    .slice(0, p.blindThresholds);
  if (blind.length < p.blindThresholds)
    throw new Error(`${id}: no free wall for every blind threshold`);
  for (const side of blind) {
    const u = side === '+x' || side === '-x' ? c[1] : c[0];
    const sillAt = wallPoint(b, side, -SHELL_WALL_NU / 2, u, walkY);
    elements.push(
      elem(authored, 'door-closed', {
        type: 'doorway',
        sill: sillAt,
        azimuthDeg: sideBearing(side),
        width: 3,
        height: 3.4,
        depth: SHELL_WALL_NU,
        profile: 'hex',
        closed: true,
      }),
      elem(authored, 'machine', wallBox(b, side, 0, 1.2, u - 1.5, u + 1.5, walkY - 0.3, walkY)),
    );
  }
  return { roomId: id, surfaces: [], elements };
}

/** Portal vestibule: B28 marked as non-ordinary with a frame, floor chevrons and a label. */
function describeVestibule(p: HeroParams['E-V']): HeroDressing {
  const id = 'E-V';
  const b = boundsOf(id);
  const portal = V1_CONNECTIONS.find((c) => c.portal && (c.from.room === id || c.to.room === id));
  if (!portal) throw new Error(`${id}: no portal edge`);
  const end = portal.from.room === id ? portal.from : portal.to;
  const o = doorOpening(id, end.anchor);
  const owner = edgeOwner(portal.id, roomOwner(id).tone);
  const frame = doorFrame(b, o, p.frameGap, p.frameWidth, 0.12).map((f) =>
    elem(owner, 'portal', f),
  );
  const chevrons = Array.from({ length: p.chevronCount }, (_, k) =>
    elem(
      owner,
      'portal',
      wallBox(
        b,
        o.side,
        0.5 + k * 0.7,
        0.85 + k * 0.7,
        o.u - o.width / 2,
        o.u + o.width / 2,
        o.sill,
        o.sill + 0.04,
      ),
    ),
  );
  const [first, ...rest] = frame;
  if (!first) throw new Error(`${id}: empty portal frame`);
  return {
    roomId: id,
    surfaces: [],
    elements: [
      {
        ...first,
        label: PORTAL_LABEL,
        labelKind: 'feature',
        labelAt: wallPoint(b, o.side, 0.5, o.u, o.sill + o.height + 1),
      },
      ...rest,
      ...chevrons,
    ],
  };
}

/** Engine: the explosion frozen in time, filling the void below the gallery. */
function describeEngine(p: HeroParams['ENG-01']): HeroDressing {
  const id = 'ENG-01';
  const b = boundsOf(id);
  const sill = getShell(id)?.doors[0]?.sill ?? 0;
  const galleryY = b.min[1] + sill;
  const c = centreOf(b);
  const centre: Vec3 = [c[0], galleryY - p.fireballDrop, c[1]];
  const [near, far] = p.fragmentReach;
  if (centre[1] + far >= galleryY - 0.5 || centre[1] - far <= b.min[1] + 1.5) {
    throw new Error(`${id}: fragments leave the void between the engine floor and the gallery`);
  }
  const seen = roomOwner(id, 'sourced');
  const authored = roomOwner(id, 'inferred');
  const golden = Math.PI * (3 - Math.sqrt(5));
  const sizes: readonly Vec3[] = [
    [1.4, 0.9, 1.8],
    [0.9, 0.6, 0.9],
    [0.5, 0.4, 0.5],
  ];
  const groups: Vec3[][] = sizes.map(() => []);
  const yaws: number[][] = sizes.map(() => []);
  for (let i = 0; i < p.fragmentCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / p.fragmentCount;
    const r = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const dist = near + (far - near) * ((i * 0.618034) % 1);
    groups[i % sizes.length]?.push([
      centre[0] + Math.cos(theta) * r * dist,
      centre[1] + y * dist,
      centre[2] + Math.sin(theta) * r * dist,
    ]);
    yaws[i % sizes.length]?.push((i * 137.5) % 360);
  }
  const floorY = b.min[1];
  return {
    roomId: id,
    surfaces: [],
    elements: [
      ...orb(seen, 'glow', centre, p.fireballRadius, p.fireballSlices),
      elem(seen, 'glow', {
        type: 'plate',
        center: c,
        inner: p.shockRadius,
        outer: p.shockRadius + 0.3,
        bottom: centre[1] - 0.1,
        top: centre[1] + 0.1,
        sides: 24,
      }),
      ...sizes.map((s, g) =>
        elem(seen, 'debris', {
          type: 'instances',
          base: centredBox(...s),
          placements: (groups[g] ?? []).map((position, k) => ({
            position,
            yawDeg: yaws[g]?.[k] ?? 0,
          })),
        }),
      ),
      elem(authored, 'machine', {
        type: 'plate',
        center: c,
        inner: 0,
        outer: p.plinthRadius,
        bottom: floorY,
        top: floorY + 1.5,
        sides: 12,
      }),
      ...[45, 135, 225, 315].map((az) => {
        const [x, , z] = polar(c, p.plinthRadius * 0.6, az, 0);
        return elem(
          authored,
          'machine',
          box(
            [x - 0.3, floorY + 1.5, z - 0.3],
            [x + 0.3, centre[1] - p.fireballRadius * 0.6, z + 0.3],
          ),
        );
      }),
    ],
  };
}

// ── Assembly ─────────────────────────────────────────────────────────────────

export function describeHeroRoom(
  roomId: HeroRoomId,
  params: HeroParams = HERO_PARAMS,
): HeroDressing {
  switch (roomId) {
    case 'S-01':
      return describeStoreroom(params['S-01']);
    case 'L-01':
      return describeLibrary(params['L-01']);
    case 'ARS-01':
      return describeArs(params['ARS-01']);
    case 'F-01':
      return describeFuelTunnel(params['F-01']);
    case 'E-A':
      return describeAntechamber(params['E-A']);
    case 'E-01':
      return describeEye(params['E-01']);
    case 'E-V':
      return describeVestibule(params['E-V']);
    case 'ENG-01':
      return describeEngine(params['ENG-01']);
  }
}

/**
 * Hero detail of every Journey room as one description. It replaces no room (`roomIds` is
 * empty): its meshes join the rooms' greybox shells, which stay in the scene.
 */
export function describeHeroRooms(params: HeroParams = HERO_PARAMS): StructureDescription {
  const rooms = HERO_ROOM_IDS.map((id) => describeHeroRoom(id, params));
  return {
    id: 'journey-hero',
    units: 'normalized',
    roomIds: [],
    volumes: [],
    surfaces: rooms.flatMap((r) => r.surfaces),
    anchors: [],
    paths: [],
    elements: rooms.flatMap((r) => r.elements),
    labels: [],
  };
}

/** The full structure the validator checks: the Tier-1 map with the hero detail in it. */
export function describeJourneyMap(params: HeroParams = HERO_PARAMS): StructureDescription {
  return mergeDescriptions('journey-map', [describeTier1Map(), describeHeroRooms(params)]);
}
