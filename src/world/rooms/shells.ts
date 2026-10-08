/**
 * Greybox descriptions of the placed rooms outside the console (Execution 4), built from each
 * room's layout box and shell spec (src/data/layout.ts) with the structural kit:
 * - corridor nodes (H-01, H-02, M-01, F-01) as hex runs, with junctions where side doors sit
 *   (reserved Tier-2 doors are closed); F-01 runs beneath a deck of primary fuel cells;
 * - M-02 as an octagonal node chamber;
 * - L-01, S-01, ARS-01, E-A, E-01, E-V and ENG-01 as shells with their doors cut in the walls,
 *   E-01 walked on a catwalk joining its doors and ENG-01 on a gallery ringing its walls.
 * Every topology anchor of these rooms is placed; an anchor no v1 edge uses is closed.
 * Hero detail (stacks, the ARS tree, the Eye, the frozen explosion) is Execution 5.
 */

import { V1_CONNECTIONS } from '../../data/connections';
import {
  type DoorPlacement,
  getTransform,
  ROOM_SHELLS,
  type RoomShell,
  type Side,
  type Vec3,
} from '../../data/layout';
import { getPath } from '../../data/paths';
import { getRoom } from '../../data/rooms';
import type { RegionId } from '../../data/types';
import type { Bounds } from '../../scene/camera/isometric';
import { roomBounds } from '../../scene/topology';
import {
  boxShell,
  catwalk,
  type CorridorProfile,
  corridorRun,
  DECK_NU,
  galleryRing,
  junction,
  mergePieces,
  nodeChamber,
  type Owner,
  type Piece,
  PROFILES,
  SHELL_WALL_NU,
  type SideUse,
  sideBearing,
  sideNormal,
} from '../kit/modules';
import {
  type AnchorPlacement,
  type EvidenceClass,
  evidenceClassOfPresence,
  type StructureElement,
  type StructureLabel,
} from '../structure';
import { onSurface } from '../validate/geometry';

export interface RoomsDescription {
  readonly piece: Piece;
  readonly anchors: readonly AnchorPlacement[];
  readonly labels: readonly StructureLabel[];
}

/** Door opening per passage profile: wide enough for the corridor deck, under its ceiling. */
export const DOOR_SIZE: Readonly<Record<CorridorProfile['id'], { width: number; height: number }>> =
  {
    standard: { width: 3, height: 3.4 },
    narrow: { width: 2.5, height: 3 },
  };

/** Spacing of support-rib frames: sparse in inhabited corridors, dense toward the core. */
const RIB_SPACING: Readonly<Partial<Record<RegionId, number>>> = {
  cultural: 4,
  maintenance: 3,
  'power-core': 2.5,
};

export function ribSpacing(tone: RegionId): number {
  return RIB_SPACING[tone] ?? 3;
}

/**
 * Rooms whose enclosing geometry is itself authored though the space is attested: the portal
 * vestibule ("Enclosing vestibule geometry is inferred", rooms.ts E-V).
 */
const AUTHORED_ENCLOSURE: ReadonlySet<string> = new Set(['E-V']);

const USED_ANCHORS: ReadonlySet<string> = new Set(
  V1_CONNECTIONS.flatMap((c) => [`${c.from.room}.${c.from.anchor}`, `${c.to.room}.${c.to.anchor}`]),
);

function anchorUsed(roomId: string, anchorId: string): boolean {
  return USED_ANCHORS.has(`${roomId}.${anchorId}`);
}

function room(roomId: string) {
  const r = getRoom(roomId);
  if (!r) throw new Error(`Unknown room ${roomId}`);
  return r;
}

/** A room as a piece owner: its region's tone and, by default, its presence evidence. */
export function roomOwner(roomId: string, evidenceClass?: EvidenceClass): Owner {
  const r = room(roomId);
  return {
    kind: 'room',
    id: roomId,
    tone: r.region,
    evidenceClass:
      evidenceClass ??
      (AUTHORED_ENCLOSURE.has(roomId) ? 'inferred' : evidenceClassOfPresence(r.axes.presence)),
  };
}

/** Door opening of an anchor, sized for the passage of the edge that uses it. */
export function doorSize(roomId: string, anchorId: string): { width: number; height: number } {
  const edge = V1_CONNECTIONS.find(
    (c) =>
      (c.from.room === roomId && c.from.anchor === anchorId) ||
      (c.to.room === roomId && c.to.anchor === anchorId),
  );
  return DOOR_SIZE[(edge && getPath(edge.id)?.profile) ?? 'standard'];
}

function boundsOf(roomId: string): Bounds {
  const t = getTransform(roomId);
  if (!t) throw new Error(`No layout for ${roomId}`);
  return roomBounds(t);
}

/** Centre of a door's sill on the plane of its face, at height `y`. */
function doorCentre(b: Bounds, door: DoorPlacement, y: number): Vec3 {
  const cx = (b.min[0] + b.max[0]) / 2;
  const cz = (b.min[2] + b.max[2]) / 2;
  switch (door.side) {
    case '+x':
      return [b.max[0], y, cz + door.offset];
    case '-x':
      return [b.min[0], y, cz + door.offset];
    case '+z':
      return [cx + door.offset, y, b.max[2]];
    case '-z':
      return [cx + door.offset, y, b.min[2]];
  }
}

/** Point `d` from `p` along a side's outward normal (negative `d` moves inward). */
function toward(p: Vec3, side: Side, d: number): Vec3 {
  const [nx, nz] = sideNormal(side);
  return [p[0] + nx * d, p[1], p[2] + nz * d];
}

/** Places an anchor on whichever floor of the room's piece holds its position. */
function placeAnchor(
  roomId: string,
  door: DoorPlacement,
  position: Vec3,
  piece: Piece,
): AnchorPlacement {
  const surface = piece.surfaces.find((s) => s.ownerId === roomId && onSurface(s, position));
  if (!surface) throw new Error(`${roomId}.${door.anchorId} is not on a floor of ${roomId}`);
  return {
    roomId,
    anchorId: door.anchorId,
    surfaceId: surface.id,
    position,
    azimuthDeg: sideBearing(door.side),
    state: anchorUsed(roomId, door.anchorId) ? 'open' : 'closed',
  };
}

/**
 * One walkable surface per level of a room: the decks of its runs and junctions touch, so
 * together they are the room's floor at that height (a single surface, per the contract).
 */
function unifyFloors(roomId: string, piece: Piece): Piece {
  const own = piece.surfaces.filter((s) => s.ownerId === roomId);
  const levels = [...new Set(own.map((s) => s.y))];
  const floors = levels.map((y, k) => {
    const level = own.filter((s) => s.y === y);
    const id =
      level.length === 1
        ? (level[0] as (typeof level)[number]).id
        : `${roomId}.floor${levels.length > 1 ? k : ''}`;
    return { id, ownerId: roomId, y, shapes: level.flatMap((s) => s.shapes) };
  });
  return { ...piece, surfaces: [...piece.surfaces.filter((s) => s.ownerId !== roomId), ...floors] };
}

/** The shell must place exactly the room's topology anchors. */
function checkDoors(roomId: string, shell: RoomShell): void {
  const expected = room(roomId)
    .anchors.map((a) => a.id)
    .sort();
  const placed = shell.doors.map((d) => d.anchorId).sort();
  if (expected.join() !== placed.join()) {
    throw new Error(
      `${roomId} places anchors [${placed.join()}], topology has [${expected.join()}]`,
    );
  }
}

interface Described {
  readonly piece: Piece;
  readonly anchors: readonly AnchorPlacement[];
  readonly label: Vec3;
}

function topCentre(b: Bounds): Vec3 {
  return [(b.min[0] + b.max[0]) / 2, b.max[1] + 0.6, (b.min[2] + b.max[2]) / 2];
}

/**
 * Hex run along the box's long axis. Side doors sit in junctions centred on them (two doors
 * facing each other share one); a closed door at an end sits in a junction against that end.
 */
function describeCorridor(roomId: string, shell: RoomShell): Described {
  const b = boundsOf(roomId);
  const owner = roomOwner(roomId);
  const profile = PROFILES[shell.profile ?? 'standard'];
  const hw = profile.width / 2;
  const alongX = b.max[0] - b.min[0] >= b.max[2] - b.min[2];
  const y = b.min[1];
  const cross = alongX ? (b.min[2] + b.max[2]) / 2 : (b.min[0] + b.max[0]) / 2;
  const [u0, u1] = alongX ? [b.min[0], b.max[0]] : [b.min[2], b.max[2]];
  const point = (u: number): Vec3 => (alongX ? [u, y, cross] : [cross, y, u]);
  const [low, high]: readonly [Side, Side] = alongX ? ['-x', '+x'] : ['-z', '+z'];
  const isEnd = (side: Side) => side === low || side === high;
  const use = (door: DoorPlacement): SideUse =>
    anchorUsed(roomId, door.anchorId) ? 'open' : 'door';

  // Junction centres along the run, each with the use of its four sides.
  const junctions = new Map<number, Record<Side, SideUse>>();
  const junctionAt = (u: number): Record<Side, SideUse> => {
    const key = Math.round(u * 1000) / 1000;
    const existing = junctions.get(key);
    if (existing) return existing;
    const sides: Record<Side, SideUse> = alongX
      ? { '-x': 'open', '+x': 'open', '-z': 'wall', '+z': 'wall' }
      : { '-x': 'wall', '+x': 'wall', '-z': 'open', '+z': 'open' };
    junctions.set(key, sides);
    return sides;
  };
  const endDoor = (side: Side) => {
    const d = shell.doors.find((x) => x.side === side);
    if (!d) throw new Error(`${roomId}: no door at its ${side} end`);
    return d;
  };
  for (const door of shell.doors) {
    if (isEnd(door.side)) {
      if (use(door) === 'door') junctionAt(door.side === low ? u0 + hw : u1 - hw);
    } else {
      const c = doorCentre(b, door, y);
      junctionAt(alongX ? c[0] : c[2])[door.side] = use(door);
    }
  }
  // A junction against an end carries that end's door on its outer side.
  for (const [u, sides] of junctions) {
    if (Math.abs(u - (u0 + hw)) < 1e-3) sides[low] = use(endDoor(low));
    if (Math.abs(u - (u1 - hw)) < 1e-3) sides[high] = use(endDoor(high));
  }

  const spacing = ribSpacing(owner.tone);
  const pieces: Piece[] = [];
  const run = (from: number, to: number) => {
    if (to - from <= 1e-6) return;
    pieces.push(
      corridorRun({
        id: `${roomId}.run${pieces.length}`,
        owner,
        from: point(from),
        to: point(to),
        profile,
        ribSpacing: spacing,
      }),
    );
  };
  let cursor = u0;
  for (const u of [...junctions.keys()].sort((p, q) => p - q)) {
    if (u - hw < cursor - 1e-6 || u + hw > u1 + 1e-6) {
      throw new Error(`${roomId}: junction at ${u} overlaps another or the ends`);
    }
    run(cursor, u - hw);
    pieces.push(
      junction({
        id: `${roomId}.j${pieces.length}`,
        owner,
        center: point(u),
        profile,
        sides: junctionAt(u),
      }),
    );
    cursor = u + hw;
  }
  run(cursor, u1);
  if (shell.overhead === 'fuel-cells') pieces.push(fuelCellLevel(roomId, b, profile, alongX));

  const piece = unifyFloors(roomId, mergePieces(pieces));
  const anchors = shell.doors.map((door) => {
    if (isEnd(door.side)) {
      return placeAnchor(
        roomId,
        door,
        toward(point(door.side === low ? u0 : u1), door.side, -0.5),
        piece,
      );
    }
    const c = doorCentre(b, door, y);
    return placeAnchor(
      roomId,
      door,
      toward(point(alongX ? c[0] : c[2]), door.side, hw - 0.5),
      piece,
    );
  });
  return { piece, anchors, label: topCentre(b) };
}

/**
 * The deck of primary fuel cells over F-01's tunnel ("beneath the primary fuel cells" is the
 * only verified relation, research §12.4). The deck is authored; the cells are attested.
 */
function fuelCellLevel(
  roomId: string,
  b: Bounds,
  profile: CorridorProfile,
  alongX: boolean,
): Piece {
  const deckY = b.min[1] + profile.height;
  const inset = 1;
  const min: Vec3 = alongX
    ? [b.min[0] + inset, deckY, b.min[2]]
    : [b.min[0], deckY, b.min[2] + inset];
  const max: Vec3 = alongX
    ? [b.max[0] - inset, b.max[1], b.max[2]]
    : [b.max[0], b.max[1], b.max[2] - inset];
  const deckOwner = roomOwner(roomId, 'inferred');
  const cellOwner = roomOwner(roomId, 'sourced');
  const deckTop = deckY + DECK_NU;
  const radius = 1;
  const runLength = alongX ? max[0] - min[0] : max[2] - min[2];
  const count = Math.max(1, Math.floor(runLength / 3.5));
  const lanes = alongX ? [b.min[2] + 1.5, b.max[2] - 1.5] : [b.min[0] + 1.5, b.max[0] - 1.5];
  const cells: StructureElement[] = [];
  for (let k = 0; k < count; k++) {
    const u = (alongX ? min[0] : min[2]) + (runLength * (k + 0.5)) / count;
    for (const lane of lanes) {
      cells.push({
        tag: {
          kind: 'room',
          id: roomId,
          part: 'fuel-cell',
          evidenceClass: cellOwner.evidenceClass,
        },
        tone: cellOwner.tone,
        primitive: {
          type: 'plate',
          center: alongX ? [u, lane] : [lane, u],
          inner: 0,
          outer: radius,
          bottom: deckTop,
          top: b.max[1] - 0.5,
          sides: 6,
        },
      });
    }
  }
  return {
    volumes: [{ id: `${roomId}.fuel-cells`, ownerId: roomId, shape: 'box', min, max }],
    surfaces: [],
    elements: [
      {
        tag: { kind: 'room', id: roomId, part: 'floor', evidenceClass: deckOwner.evidenceClass },
        tone: deckOwner.tone,
        primitive: { type: 'box', min, max: [max[0], deckTop, max[2]] },
      },
      ...cells,
    ],
    decor: [],
  };
}

/** M-02: an octagonal node chamber whose four axis faces are its doors. */
function describeChamber(roomId: string, shell: RoomShell): Described {
  const b = boundsOf(roomId);
  const owner = roomOwner(roomId);
  const profile = PROFILES[shell.profile ?? 'standard'];
  const apothem = (b.max[0] - b.min[0]) / 2;
  if (Math.abs(b.max[2] - b.min[2] - 2 * apothem) > 1e-6)
    throw new Error(`${roomId}: chambers are square`);
  const center: Vec3 = [(b.min[0] + b.max[0]) / 2, b.min[1], (b.min[2] + b.max[2]) / 2];
  if (shell.doors.some((d) => d.offset !== 0 || !anchorUsed(roomId, d.anchorId))) {
    throw new Error(`${roomId}: chamber doors are open and centred on their faces`);
  }
  const piece = nodeChamber({
    id: `${roomId}.chamber`,
    owner,
    center,
    apothem,
    height: b.max[1] - b.min[1],
    profile,
    open: shell.doors.map((d) => d.side),
  });
  const anchors = shell.doors.map((door) =>
    placeAnchor(roomId, door, toward(center, door.side, apothem - 0.5), piece),
  );
  return { piece, anchors, label: topCentre(b) };
}

/** Greybox shell with its doors cut in the walls, walked on its floor, a catwalk or a gallery. */
function describeRoom(roomId: string, shell: RoomShell): Described {
  const b = boundsOf(roomId);
  const owner = roomOwner(roomId);
  const walk = shell.walk ?? 'floor';
  const sills = new Set(shell.doors.map((d) => d.sill ?? 0));
  if (walk !== 'floor' && sills.size !== 1)
    throw new Error(`${roomId}: walkway doors share one sill`);
  const walkY = b.min[1] + ([...sills][0] ?? 0);
  const openings = shell.doors.map((door) => {
    const size = doorSize(roomId, door.anchorId);
    const c = doorCentre(b, door, b.min[1] + (door.sill ?? 0));
    const u = door.side === '+z' || door.side === '-z' ? c[0] : c[2];
    return {
      side: door.side,
      u0: u - size.width / 2,
      u1: u + size.width / 2,
      y0: c[1],
      y1: c[1] + size.height,
    };
  });
  const pieces: Piece[] = [
    boxShell({
      id: `${roomId}.shell`,
      owner,
      min: b.min,
      max: b.max,
      openings,
      walkableFloor: walk === 'floor',
      panels: owner.tone === 'cultural' || owner.tone === 'maintenance',
    }),
  ];
  if (walk === 'catwalk') {
    const [a, c] = shell.doors.map((d) => doorCentre(b, d, walkY));
    const [da] = shell.doors;
    if (!a || !c || !da || shell.doors.length !== 2)
      throw new Error(`${roomId}: a catwalk joins two doors`);
    const aligned = Math.abs(a[0] - c[0]) < 1e-6 || Math.abs(a[2] - c[2]) < 1e-6;
    const corner: Vec3 =
      da.side === '+z' || da.side === '-z' ? [a[0], walkY, c[2]] : [c[0], walkY, a[2]];
    pieces.push(
      catwalk({
        id: `${roomId}.catwalk`,
        owner,
        points: aligned ? [a, c] : [a, corner, c],
        width: 2.5,
      }),
    );
  } else if (walk === 'gallery') {
    const t = SHELL_WALL_NU;
    pieces.push(
      galleryRing({
        id: `${roomId}.gallery`,
        owner: roomOwner(roomId, 'inferred'),
        min: [b.min[0] + t, b.min[2] + t],
        max: [b.max[0] - t, b.max[2] - t],
        y: walkY,
        width: 4,
      }),
    );
  }
  const piece = unifyFloors(roomId, mergePieces(pieces));
  const anchors = shell.doors.map((door) =>
    placeAnchor(
      roomId,
      door,
      toward(doorCentre(b, door, b.min[1] + (door.sill ?? 0)), door.side, -0.5),
      piece,
    ),
  );
  return { piece, anchors, label: topCentre(b) };
}

/** Every placed room outside the console, from its layout box and shell spec. */
export function describeShellRooms(): RoomsDescription {
  const described = ROOM_SHELLS.map((shell) => {
    checkDoors(shell.roomId, shell);
    const d =
      shell.kind === 'corridor'
        ? describeCorridor(shell.roomId, shell)
        : shell.kind === 'chamber'
          ? describeChamber(shell.roomId, shell)
          : describeRoom(shell.roomId, shell);
    return { roomId: shell.roomId, ...d };
  });
  return {
    piece: mergePieces(described.map((d) => d.piece)),
    anchors: described.flatMap((d) => d.anchors),
    labels: described.map((d) => ({ roomId: d.roomId, position: d.label })),
  };
}
