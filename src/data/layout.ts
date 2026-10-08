/**
 * World layout for placed rooms, in normalized units (NU). Kept separate from topology
 * (rooms.ts / connections.ts) so a later execution can replace these values without touching
 * code. Every transform is a design placement, not a canon measurement.
 *
 * Convention (research/architecture-proposal.md): +Y up, rotor axis at the origin, console
 * main deck at Y = 0, consoleRadiusNU = 10. `position` is the centre of the room's floor;
 * `size` is its bounding volume [width X, height Y, depth Z].
 *
 * Execution 4 (final v1 layout), grown outward from the console in 7-NU levels: the cultural
 * spine at gallery level (+7) off the upper exit, the maintenance spine at −14 and −21 behind
 * the lower exit, the power core at −28 and −35 with the engine deepest, under the front of
 * the console. Boxes equal the bounding boxes of the room descriptions (tested). Rationale and
 * rejected alternatives per room: research/layout-hypothesis.md.
 */

export type Vec3 = readonly [number, number, number];

/** A vertical side of an axis-aligned box, named by its outward normal. */
export type Side = '-x' | '+x' | '-z' | '+z';

export interface RoomTransform {
  readonly roomId: string;
  readonly position: Vec3;
  readonly size: Vec3;
  readonly placementBasis: 'design';
}

export const LAYOUT_UNITS = 'normalized' as const;
export const CONSOLE_RADIUS_NU = 10;

/** Floor levels of the three console decks (only their order is known). */
export const DECK_Y = { gallery: 7, main: 0, lower: -7 } as const;

function place(roomId: string, position: Vec3, size: Vec3): RoomTransform {
  return { roomId, position, size, placementBasis: 'design' };
}

export const LAYOUT: readonly RoomTransform[] = [
  // Control nexus (Execution 3): bounding boxes of the console-room description volumes
  // (src/world/rooms/console/describe.ts; equality is tested). Shell radius 21; the
  // threshold and the upper landing sit outside the shell at 0°, the lower landing at 180°,
  // and the ladder compartment hangs under the lower deck.
  place('P-EX', [0, DECK_Y.main, 23.5], [4, 6, 4]),
  place('C-M', [0, DECK_Y.main, 0], [42, 7, 42]),
  place('C-U', [0, DECK_Y.gallery, 0], [42, 12, 42]),
  place('C-L', [0, DECK_Y.lower, 0], [42, 7, 42]),
  place('C-XU', [0, DECK_Y.gallery, 23.5], [4, 4, 4]),
  place('C-XL', [0, DECK_Y.lower, -23.5], [4, 4, 4]),
  place('C-LAD', [0, -11.5, 0], [4, 4, 4]),
  // Cultural spine: at gallery level, running −X behind the upper exit to the library.
  place('H-01', [-9, DECK_Y.gallery, 30], [10, 4, 4]),
  place('H-02', [-22, DECK_Y.gallery, 30], [12, 4, 4]),
  place('L-01', [-35, DECK_Y.gallery, 30], [14, 22, 14]),
  // Maintenance spine: one level below the lower deck, behind the lower exit.
  place('M-01', [8, -14, -37], [28, 4, 4]),
  place('S-01', [10, -14, -31], [8, 5, 8]),
  place('ARS-01', [10, -14, -45], [12, 20, 12]),
  place('M-02', [35, -21, -37], [10, 5, 10]),
  // Power core: below the maintenance spine, coming forward to the engine under the console.
  place('F-01', [35, -28, -17], [6, 11, 14]),
  place('E-A', [35, -28, -3], [6, 5, 6]),
  place('E-01', [35, -40, 8], [16, 22, 16]),
  place('E-V', [5, -35, 8], [6, 6, 6]),
  place('ENG-01', [-11, -58, 5], [26, 32, 26]),
];

const BY_ROOM = new Map(LAYOUT.map((t) => [t.roomId, t]));

export function getTransform(roomId: string): RoomTransform | undefined {
  return BY_ROOM.get(roomId);
}

/**
 * Authored placement of one topology door anchor on a room box (the anchors of the console
 * nodes are placed by the console description instead). Bearings stay out of rooms.ts.
 */
export interface DoorPlacement {
  readonly anchorId: string;
  readonly side: Side;
  /** Offset of the door's centre from the centre of its face, along +X or +Z, NU. */
  readonly offset: number;
  /** Height of the door's sill above the room floor, for catwalks and galleries; 0 if omitted. */
  readonly sill?: number;
}

/**
 * How a non-console placed room is built (src/world/rooms/shells.ts):
 * - `corridor`: a hex-profile run along the box's long axis; doors on its ends continue the
 *   corridor, doors on its sides sit in junctions. `overhead: 'fuel-cells'` stacks the primary
 *   fuel cells on a deck over the run (F-01).
 * - `chamber`: an octagonal node chamber whose four axis faces hold the doors.
 * - `room`: a greybox shell with doors cut in its walls, walked on its floor, on a catwalk
 *   joining its two doors, or on a gallery ringing its walls at the doors' sill.
 */
export interface RoomShell {
  readonly roomId: string;
  readonly kind: 'corridor' | 'chamber' | 'room';
  readonly doors: readonly DoorPlacement[];
  readonly profile?: 'standard' | 'narrow';
  readonly walk?: 'floor' | 'catwalk' | 'gallery';
  readonly overhead?: 'fuel-cells';
}

function door(anchorId: string, side: Side, offset = 0, sill = 0): DoorPlacement {
  return sill === 0 ? { anchorId, side, offset } : { anchorId, side, offset, sill };
}

export const ROOM_SHELLS: readonly RoomShell[] = [
  {
    roomId: 'H-01',
    kind: 'corridor',
    profile: 'standard',
    doors: [
      door('console-end', '+x'),
      door('h02', '-x'),
      door('residential', '+z'),
      door('archive', '-z'),
    ],
  },
  {
    roomId: 'H-02',
    kind: 'corridor',
    profile: 'standard',
    // Clara's order from the console side: observatory, pool, then the library.
    doors: [
      door('h01', '+x'),
      door('observatory', '+z', 3),
      door('residential', '-z', 3),
      door('pool', '+z', -3),
      door('library', '-x'),
    ],
  },
  { roomId: 'L-01', kind: 'room', walk: 'floor', doors: [door('main-door', '+x')] },
  {
    roomId: 'M-01',
    kind: 'corridor',
    profile: 'standard',
    doors: [
      door('console-end', '+z', -8),
      door('storeroom', '+z', 2),
      door('ars', '-z', 2),
      door('m02', '+x'),
      door('workshop', '+z', -4),
      door('sickbay', '-z', -12),
      door('sub-console', '+z', -12),
      door('quiet', '-x'),
      door('gallery-power', '+z', 10),
    ],
  },
  { roomId: 'S-01', kind: 'room', walk: 'floor', doors: [door('door', '-z')] },
  {
    roomId: 'ARS-01',
    kind: 'room',
    walk: 'floor',
    doors: [door('main-door', '+z'), door('service-door', '+x')],
  },
  {
    roomId: 'M-02',
    kind: 'chamber',
    profile: 'standard',
    doors: [
      door('m01', '-x'),
      door('ars', '-z'),
      door('fuel-tunnel', '+z'),
      door('engine-bypass', '+x'),
    ],
  },
  {
    roomId: 'F-01',
    kind: 'corridor',
    profile: 'narrow',
    overhead: 'fuel-cells',
    doors: [door('m02', '-z'), door('antechamber', '+z')],
  },
  {
    roomId: 'E-A',
    kind: 'room',
    walk: 'floor',
    doors: [door('tunnel-side', '-z'), door('eye-side', '+z')],
  },
  {
    roomId: 'E-01',
    kind: 'room',
    walk: 'catwalk',
    doors: [door('antechamber-door', '-z', 0, 12), door('catwalk-far', '-x', 0, 12)],
  },
  {
    roomId: 'E-V',
    kind: 'room',
    walk: 'floor',
    doors: [door('eye-side', '+x'), door('portal', '-x')],
  },
  {
    roomId: 'ENG-01',
    kind: 'room',
    walk: 'gallery',
    doors: [door('portal-arrival', '+x', 3, 23), door('service-threshold', '+x', -11, 23)],
  },
];

const SHELL_BY_ROOM = new Map(ROOM_SHELLS.map((s) => [s.roomId, s]));

export function getShell(roomId: string): RoomShell | undefined {
  return SHELL_BY_ROOM.get(roomId);
}
