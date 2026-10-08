/**
 * World layout for placed rooms, in normalized units (NU). Kept separate from topology
 * (rooms.ts / connections.ts) so a later execution can replace these values without touching
 * code. Every transform is a design placement, not a canon measurement.
 *
 * Convention (research/architecture-proposal.md): +Y up, rotor axis at the origin, console
 * main deck at Y = 0, consoleRadiusNU = 10. `position` is the centre of the room's floor;
 * `size` is the provisional bounding volume [width X, height Y, depth Z].
 *
 * Provisional (Execution 2): crude boxes that respect the documented vertical order —
 * cultural spine at or above gallery level, maintenance below the lower deck, power core
 * deepest. The control-nexus boxes follow the Execution 3 console-room description.
 * Rationale per placement: research/layout-hypothesis.md.
 */

export type Vec3 = readonly [number, number, number];

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
  // Cultural spine: west of the gallery exit, at or above gallery level.
  place('H-01', [-30, 8, 0], [14, 4, 4]),
  place('H-02', [-30, 8, -18], [4, 4, 16]),
  place('L-01', [-30, 8, -38], [16, 20, 14]),
  // Maintenance spine: east of the lower-deck exit, below the lower deck.
  place('M-01', [30, -14, 0], [14, 4, 4]),
  place('S-01', [30, -14, 12], [8, 5, 8]),
  place('ARS-01', [44, -14, -14], [10, 18, 10]),
  place('M-02', [30, -24, -14], [6, 4, 6]),
  // Power core: deepest, descending away from the console.
  place('F-01', [30, -34, -30], [4, 4, 14]),
  place('E-A', [30, -34, -44], [6, 5, 6]),
  place('E-01', [30, -38, -62], [20, 14, 20]),
  place('E-V', [12, -34, -62], [6, 5, 6]),
  place('ENG-01', [-8, -46, -62], [20, 18, 20]),
];

const BY_ROOM = new Map(LAYOUT.map((t) => [t.roomId, t]));

export function getTransform(roomId: string): RoomTransform | undefined {
  return BY_ROOM.get(roomId);
}
