/**
 * The connected Tier-1 corridor skeleton (Execution 4): every placed room outside the console
 * (src/world/rooms/shells.ts) and every stable edge outside it (src/world/corridors), described
 * against the console room's anchors and volumes. The validator checks it merged with the
 * console description ({@link describeTier1Map}); the scene builds it as its own structure.
 */

import { ROOM_SHELLS } from '../data/layout';
import { type BuiltStructure, buildStaticStructure } from './build';
import { describePassages } from './corridors/describe';
import { decorElements, mergePieces } from './kit/modules';
import { CONSOLE_START_SURFACE, describeConsoleRoom } from './rooms/console/describe';
import { describeShellRooms } from './rooms/shells';
import type { StructureDescription } from './structure';

/** Walkability over the whole map is measured from the console's main deck. */
export const MAP_START_SURFACE = CONSOLE_START_SURFACE;

/** Rooms and passages outside the console; its paths B07 and B16 start on console anchors. */
export function describeSkeleton(
  consoleRoom: StructureDescription = describeConsoleRoom(),
): StructureDescription {
  const rooms = describeShellRooms();
  const passages = describePassages({
    anchors: [...consoleRoom.anchors, ...rooms.anchors],
    volumes: [...consoleRoom.volumes, ...rooms.piece.volumes],
  });
  const piece = mergePieces([rooms.piece, passages.piece]);
  return {
    id: 'tier1-skeleton',
    units: 'normalized',
    roomIds: ROOM_SHELLS.map((s) => s.roomId),
    volumes: piece.volumes,
    surfaces: piece.surfaces,
    anchors: rooms.anchors,
    paths: passages.paths,
    elements: [...piece.elements, ...decorElements(piece.decor)],
    labels: rooms.labels,
  };
}

/** One description holding everything in `parts` (ids must not collide). */
export function mergeDescriptions(
  id: string,
  parts: readonly StructureDescription[],
): StructureDescription {
  return {
    id,
    units: 'normalized',
    roomIds: parts.flatMap((d) => d.roomIds),
    volumes: parts.flatMap((d) => d.volumes),
    surfaces: parts.flatMap((d) => d.surfaces),
    anchors: parts.flatMap((d) => d.anchors),
    paths: parts.flatMap((d) => d.paths),
    elements: parts.flatMap((d) => d.elements),
    labels: parts.flatMap((d) => d.labels),
  };
}

/** The whole placed Tier-1 map: the console room plus the skeleton. */
export function describeTier1Map(): StructureDescription {
  const consoleRoom = describeConsoleRoom();
  return mergeDescriptions('tier1-map', [consoleRoom, describeSkeleton(consoleRoom)]);
}

export function buildSkeleton(
  description: StructureDescription = describeSkeleton(),
): BuiltStructure {
  return buildStaticStructure(description);
}
