/**
 * Connection passages (Execution 4): turns each authored path (src/data/paths.ts) into kit
 * segments that start and end on the edge's door anchors.
 * - A level leg is a hex corridor run, clipped where it leaves its room's box, where it meets
 *   the next segment, and where it enters the next room; a turn between two level legs is a
 *   corner piece centred on the waypoint.
 * - A sloped leg is an enclosed stair hall whose foot and head are the leg's ends.
 * - A vertical leg is a ladder shaft centred on the leg, entered and left by its level legs.
 * - A leg that only crosses a shared wall builds nothing but a threshold frame.
 * - The portal (B28) is drawn as a portal, never as a walkable passage.
 * Every piece is owned by the connection and tagged with its provenance class.
 */

import { getConnection } from '../../data/connections';
import { getShell, type Side, type Vec3 } from '../../data/layout';
import { type AuthoredPath, PATHS } from '../../data/paths';
import { getRoom } from '../../data/rooms';
import type { Connection } from '../../data/types';
import {
  axisRun,
  corridorRun,
  type CorridorProfile,
  junction,
  ladderShaft,
  mergePieces,
  opposite,
  type Owner,
  type Piece,
  PROFILES,
  sideBearing,
  sideNormal,
  stairHall,
  threshold,
} from '../kit/modules';
import { DOOR_SIZE, ribSpacing } from '../rooms/shells';
import {
  type AnchorPlacement,
  evidenceClassOfProvenance,
  type PathSegment,
  type StructureElement,
  type Volume,
} from '../structure';
import { EPSILON_NU, samePoint } from '../validate/geometry';

export interface PassageContext {
  /** Every anchor placement of the rooms the paths join (console and shells). */
  readonly anchors: readonly AnchorPlacement[];
  /** Every room volume of those rooms. */
  readonly volumes: readonly Volume[];
}

export interface PassagesDescription {
  readonly piece: Piece;
  readonly paths: readonly PathSegment[];
}

type Leg =
  | { readonly kind: 'level'; readonly a: Vec3; readonly b: Vec3; readonly ahead: Side }
  | { readonly kind: 'flight'; readonly a: Vec3; readonly b: Vec3; readonly ahead: Side }
  | { readonly kind: 'climb'; readonly a: Vec3; readonly b: Vec3 };

function classify(a: Vec3, b: Vec3): Leg {
  const horizontal = Math.hypot(b[0] - a[0], b[2] - a[2]);
  if (horizontal <= EPSILON_NU) return { kind: 'climb', a, b };
  const { ahead } = axisRun(a, b);
  return Math.abs(b[1] - a[1]) <= EPSILON_NU
    ? { kind: 'level', a, b, ahead }
    : { kind: 'flight', a, b, ahead };
}

/** Coordinate of a point along the axis a side faces. */
function axisValue(p: Vec3, side: Side): number {
  return side === '+x' || side === '-x' ? p[0] : p[2];
}

function withAxis(p: Vec3, side: Side, v: number): Vec3 {
  return side === '+x' || side === '-x' ? [v, p[1], p[2]] : [p[0], p[1], v];
}

function move(p: Vec3, side: Side, d: number): Vec3 {
  const [nx, nz] = sideNormal(side);
  return [p[0] + nx * d, p[1], p[2] + nz * d];
}

function contains(v: Volume, p: Vec3): boolean {
  return (
    v.shape === 'box' &&
    p[0] >= v.min[0] - EPSILON_NU &&
    p[0] <= v.max[0] + EPSILON_NU &&
    p[1] >= v.min[1] - EPSILON_NU &&
    p[1] <= v.max[1] + EPSILON_NU &&
    p[2] >= v.min[2] - EPSILON_NU &&
    p[2] <= v.max[2] + EPSILON_NU
  );
}

/** The box volume of `roomId` that holds an anchor. */
function boxOf(ctx: PassageContext, roomId: string, p: Vec3): Extract<Volume, { shape: 'box' }> {
  const v = ctx.volumes.find((x) => x.ownerId === roomId && contains(x, p));
  if (!v || v.shape !== 'box') throw new Error(`No box of ${roomId} holds [${p.join(', ')}]`);
  return v;
}

/** Plane of a box's side, along that side's axis. */
function plane(v: Extract<Volume, { shape: 'box' }>, side: Side): number {
  return side === '+x' ? v.max[0] : side === '-x' ? v.min[0] : side === '+z' ? v.max[2] : v.min[2];
}

function anchorOf(ctx: PassageContext, roomId: string, anchorId: string): AnchorPlacement {
  const a = ctx.anchors.find((x) => x.roomId === roomId && x.anchorId === anchorId);
  if (!a) throw new Error(`No anchor ${roomId}.${anchorId}`);
  return a;
}

function edgeOwner(c: Connection): Owner {
  const to = getRoom(c.to.room);
  if (!to) throw new Error(`Unknown room ${c.to.room}`);
  return {
    kind: 'connection',
    id: c.id,
    tone: to.region,
    evidenceClass: evidenceClassOfProvenance(c.provenance),
  };
}

/** True when a room is a greybox shell whose wall openings take a threshold frame. */
function framed(roomId: string): boolean {
  return getShell(roomId)?.kind === 'room';
}

interface Crossing {
  readonly roomId: string;
  readonly side: Side;
  readonly at: Vec3;
}

/** Thresholds where a path leaves or enters a framed room (one frame per opening). */
function thresholds(owner: Owner, profile: CorridorProfile, crossings: readonly Crossing[]) {
  const size = DOOR_SIZE[profile.id];
  const elements: StructureElement[] = [];
  const done: Vec3[] = [];
  for (const c of crossings) {
    if (!framed(c.roomId) || done.some((p) => samePoint(p, c.at))) continue;
    done.push(c.at);
    elements.push(
      threshold({
        owner,
        side: c.side,
        sill: c.at,
        width: size.width,
        height: size.height,
        profile: owner.tone === 'cultural' ? 'rect' : 'hex',
      }),
    );
  }
  return elements;
}

/** The portal: a violet membrane in a hex frame where the walk line crosses the shared wall. */
function describePortal(
  c: Connection,
  from: AnchorPlacement,
  to: AnchorPlacement,
  ctx: PassageContext,
): Piece {
  const leg = classify(from.position, to.position);
  if (leg.kind !== 'level') throw new Error(`${c.id}: a portal is a level crossing`);
  const box = boxOf(ctx, c.from.room, from.position);
  const at = withAxis(from.position, leg.ahead, plane(box, leg.ahead));
  const owner = edgeOwner(c);
  const size = DOOR_SIZE.standard;
  const r = size.height / 2;
  const tag = {
    kind: 'connection',
    id: c.id,
    part: 'portal',
    evidenceClass: owner.evidenceClass,
  } as const;
  const middle: Vec3 = [at[0], at[1] + r, at[2]];
  return {
    volumes: [],
    surfaces: [],
    elements: [
      {
        tag,
        tone: owner.tone,
        primitive: {
          type: 'doorway',
          sill: at,
          azimuthDeg: sideBearing(leg.ahead),
          width: size.width,
          height: size.height,
          depth: 0.6,
          profile: 'hex',
          closed: false,
        },
      },
      {
        tag,
        tone: owner.tone,
        primitive: {
          type: 'sweep',
          from: move(middle, opposite(leg.ahead), 0.05),
          to: move(middle, leg.ahead, 0.05),
          sections: [
            {
              outline: Array.from({ length: 16 }, (_, k): readonly [number, number] => {
                const angle = (k * Math.PI) / 8;
                return [Math.cos(angle) * (r - 0.25), Math.sin(angle) * (r - 0.25)];
              }),
            },
          ],
        },
      },
    ],
    decor: [],
  };
}

function describePath(
  path: AuthoredPath,
  ctx: PassageContext,
): { piece: Piece; segment: PathSegment } {
  const c = getConnection(path.connectionId);
  if (!c || c.buildStatus !== 'v1') throw new Error(`${path.connectionId} is not a v1 edge`);
  const from = anchorOf(ctx, c.from.room, c.from.anchor);
  const to = anchorOf(ctx, c.to.room, c.to.anchor);
  const points = [from.position, ...path.via, to.position];
  const segment: PathSegment = {
    id: `${c.id}.path`,
    connectionId: c.id,
    kind: c.kind,
    portal: c.portal,
    from: { roomId: c.from.room, anchorId: c.from.anchor },
    to: { roomId: c.to.room, anchorId: c.to.anchor },
    points,
  };
  if (c.portal) return { piece: describePortal(c, from, to, ctx), segment };

  const owner = edgeOwner(c);
  const profile = PROFILES[path.profile];
  const hw = profile.width / 2;
  const spacing = ribSpacing(owner.tone);
  const legs = points.slice(1).map((b, i) => classify(points[i] as Vec3, b));
  const pieces: Piece[] = [];
  const crossings: Crossing[] = [];
  const id = () => `${c.id}.${pieces.length}`;

  legs.forEach((leg, i) => {
    const prev = legs[i - 1];
    const next = legs[i + 1];
    if (leg.kind === 'flight') {
      if (
        prev?.kind !== 'level' ||
        next?.kind !== 'level' ||
        prev.ahead !== leg.ahead ||
        next.ahead !== leg.ahead
      ) {
        throw new Error(`${c.id}: a flight sits between level legs heading its way`);
      }
      const [bottom, top] = leg.a[1] < leg.b[1] ? [leg.a, leg.b] : [leg.b, leg.a];
      pieces.push(stairHall({ id: id(), owner, bottom, top, profile, ribSpacing: spacing }));
      return;
    }
    if (leg.kind === 'climb') {
      if (prev?.kind !== 'level' || next?.kind !== 'level') {
        throw new Error(`${c.id}: a shaft sits between level legs`);
      }
      const down = leg.a[1] > leg.b[1];
      pieces.push(
        ladderShaft({
          id: id(),
          owner,
          center: [leg.a[0], leg.a[2]],
          bottomY: Math.min(leg.a[1], leg.b[1]),
          topY: Math.max(leg.a[1], leg.b[1]),
          profile,
          topSide: down ? opposite(prev.ahead) : next.ahead,
          bottomSide: down ? next.ahead : opposite(prev.ahead),
        }),
      );
      return;
    }
    // Level leg: clip to the rooms, the corner or shaft before it, and what follows.
    let start = axisValue(leg.a, leg.ahead);
    if (i === 0) {
      start = plane(boxOf(ctx, c.from.room, leg.a), leg.ahead);
      crossings.push({
        roomId: c.from.room,
        side: leg.ahead,
        at: withAxis(leg.a, leg.ahead, start),
      });
    } else if (prev?.kind === 'climb' || (prev?.kind === 'level' && prev.ahead !== leg.ahead)) {
      start = axisValue(move(leg.a, leg.ahead, hw), leg.ahead);
    }
    let end = axisValue(leg.b, leg.ahead);
    if (i === legs.length - 1) {
      end = plane(boxOf(ctx, c.to.room, leg.b), opposite(leg.ahead));
      crossings.push({
        roomId: c.to.room,
        side: opposite(leg.ahead),
        at: withAxis(leg.b, leg.ahead, end),
      });
    } else if (next?.kind === 'climb' || (next?.kind === 'level' && next.ahead !== leg.ahead)) {
      end = axisValue(move(leg.b, opposite(leg.ahead), hw), leg.ahead);
    }
    const [nx, nz] = sideNormal(leg.ahead);
    const length = (end - start) * (nx + nz);
    if (length < -EPSILON_NU) throw new Error(`${c.id}: leg ${i} is shorter than its joints`);
    if (length > EPSILON_NU) {
      pieces.push(
        corridorRun({
          id: id(),
          owner,
          from: withAxis(leg.a, leg.ahead, start),
          to: withAxis(leg.a, leg.ahead, end),
          profile,
          ribSpacing: spacing,
        }),
      );
    }
    if (next?.kind === 'level' && next.ahead !== leg.ahead) {
      if (next.ahead === opposite(leg.ahead)) throw new Error(`${c.id}: a path never doubles back`);
      const open = new Set<Side>([opposite(leg.ahead), next.ahead]);
      const sides = Object.fromEntries(
        (['+x', '-x', '+z', '-z'] as const).map((s) => [s, open.has(s) ? 'open' : 'wall']),
      ) as Record<Side, 'open' | 'wall'>;
      pieces.push(junction({ id: id(), owner, center: leg.b, profile, sides }));
    }
  });

  const piece = mergePieces(pieces);
  const frames = thresholds(owner, profile, crossings);
  const labelled =
    c.provenance === 'INF-E' && piece.elements[0] && path.via[0]
      ? [
          {
            ...piece.elements[0],
            label: `${c.id} · INF-E bypass, authored (not filmed)`,
            labelAt: [path.via[0][0], path.via[0][1] + profile.height + 2, path.via[0][2]] as Vec3,
          },
          ...piece.elements.slice(1),
        ]
      : piece.elements;
  return { piece: { ...piece, elements: [...labelled, ...frames] }, segment };
}

/** Passages of every authored path, joined to the given rooms' anchors and volumes. */
export function describePassages(ctx: PassageContext): PassagesDescription {
  const described = PATHS.map((path) => describePath(path, ctx));
  return {
    piece: mergePieces(described.map((d) => d.piece)),
    paths: described.map((d) => d.segment),
  };
}
