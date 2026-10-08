/**
 * Authored walk lines of the stable (v1) edges outside the console room, in NU (Execution 4).
 * Each lists the waypoints strictly between its connection's `from` and `to` door anchors, on
 * the walk line at deck level. src/world/corridors turns them into kit segments that start and
 * end on those anchors: level legs become hex corridor runs (with a corner where they turn),
 * sloped legs enclosed stair halls, vertical legs ladder shafts, and a leg that only crosses a
 * shared wall a doorway. The console's own edges (B01–B06) come from its parameters
 * (src/world/rooms/console). Layout data, not topology: rationale per path is in
 * research/connection-decisions.md.
 */

import type { Vec3 } from './layout';

export interface AuthoredPath {
  readonly connectionId: string;
  /** Waypoints between the two anchors (empty for doorways and the portal). */
  readonly via: readonly Vec3[];
  /** Cross-section of the corridors, stair halls and shafts the path builds. */
  readonly profile: 'standard' | 'narrow';
}

export const PATHS: readonly AuthoredPath[] = [
  // Cultural spine, gallery level (+7).
  { connectionId: 'B07', via: [[0, 7, 30]], profile: 'standard' },
  { connectionId: 'B08', via: [], profile: 'standard' },
  { connectionId: 'B09', via: [], profile: 'standard' },
  // Maintenance spine: down one level from the lower exit, then along it.
  {
    connectionId: 'B16',
    via: [
      [0, -7, -27],
      [0, -14, -34],
    ],
    profile: 'standard',
  },
  { connectionId: 'B17', via: [], profile: 'standard' },
  { connectionId: 'B18', via: [], profile: 'standard' },
  {
    connectionId: 'B22',
    via: [
      [23, -14, -37],
      [30, -21, -37],
    ],
    profile: 'standard',
  },
  {
    connectionId: 'B23',
    via: [
      [22, -14, -45],
      [29, -21, -45],
      [35, -21, -45],
    ],
    profile: 'standard',
  },
  // Power core.
  {
    connectionId: 'B24',
    via: [
      [35, -21, -31],
      [35, -28, -24],
    ],
    profile: 'narrow',
  },
  { connectionId: 'B25', via: [], profile: 'narrow' },
  { connectionId: 'B26', via: [], profile: 'narrow' },
  {
    connectionId: 'B27',
    via: [
      [25, -28, 8],
      [18, -35, 8],
    ],
    profile: 'standard',
  },
  { connectionId: 'B28', via: [], profile: 'standard' },
  {
    connectionId: 'B37',
    via: [
      [42, -21, -37],
      [42, -35, -37],
      [42, -35, -6],
    ],
    profile: 'standard',
  },
];

const BY_CONNECTION = new Map(PATHS.map((p) => [p.connectionId, p]));

export function getPath(connectionId: string): AuthoredPath | undefined {
  return BY_CONNECTION.get(connectionId);
}
