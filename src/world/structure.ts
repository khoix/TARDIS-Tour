/**
 * Shared world contracts (EXECUTION-PLAN decision 7). Every built space follows them.
 *
 * describe → build: a room's `describe` step returns a pure {@link StructureDescription}
 * (plain data in NU, no Three.js objects), so its invariants are unit-testable and the
 * spatial validator (src/world/validate/) can check it. A separate `build` step turns the
 * description's `elements` into meshes with the kit (src/world/kit/). Builders never invent
 * geometry the description does not list.
 *
 * Mesh tagging: every mesh a builder creates carries `userData: MeshTag`. Selection,
 * cutaway, the evidence overlay and routes read only this tag, never mesh names.
 */

import type { Side, Vec3 } from '../data/layout';
import type { EdgeKind, Presence, ProvenanceCode, RegionId } from '../data/types';

// ── Mesh tagging contract ────────────────────────────────────────────────────

/** UI evidence class (EXECUTION-PLAN decision 2), derived from one evidence axis or grade. */
export const EVIDENCE_CLASSES = ['sourced', 'reconstructed', 'inferred', 'speculative'] as const;
export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

/**
 * What a mesh depicts. Kit builders use these; `volume`/`connector` are topology stand-ins.
 * `ceiling` parts are built but hidden in the default map view (src/world/build.ts). The
 * hero-room parts (Execution 5) are `stack` (library and storeroom shelving), `machine`
 * (fixed apparatus), `prop` (movable contents), `debris` (the frozen explosion) and the
 * self-lit `glow` and `rod` (bulbs, the Eye, exposed fuel rods; {@link GLOW_PARTS}).
 */
export const MESH_PARTS = [
  'volume',
  'connector',
  'floor',
  'bridge',
  'wall',
  'rib',
  'crown',
  'railing',
  'stairs',
  'ladder',
  'doorway',
  'door-closed',
  'console',
  'rotor',
  'rotor-ring',
  'ceiling',
  'catwalk',
  'shaft',
  'panel',
  'fuel-cell',
  'portal',
  'stack',
  'machine',
  'prop',
  'debris',
  'glow',
  'rod',
] as const;
export type MeshPart = (typeof MESH_PARTS)[number];

/** Parts drawn self-lit: they keep their glow when not selected. */
export const GLOW_PARTS: ReadonlySet<MeshPart> = new Set<MeshPart>(['glow', 'rod', 'portal']);

/**
 * `userData` of every world mesh.
 * - `kind`/`id`: the topology node (`room`, an id in src/data/rooms.ts) or edge
 *   (`connection`, an id in src/data/connections.ts) the mesh belongs to.
 * - `part`: what the mesh depicts.
 * - `evidenceClass`: how the existence and form of this part is known. Dimensions are
 *   always normalized design values (`scale = normalized_authored`) and are not graded here.
 */
export interface MeshTag {
  readonly kind: 'room' | 'connection';
  readonly id: string;
  readonly part: MeshPart;
  readonly evidenceClass: EvidenceClass;
}

/** Edge provenance → class: screen/official/production = sourced, REC/EXP = reconstructed. */
export function evidenceClassOfProvenance(code: ProvenanceCode): EvidenceClass {
  switch (code) {
    case 'TV-S':
    case 'TV-M':
    case 'OFF':
    case 'PROD':
      return 'sourced';
    case 'REC':
    case 'EXP':
      return 'reconstructed';
    case 'INF-D':
      return 'inferred';
    case 'INF-E':
      return 'speculative';
  }
}

/** Room presence axis → class, for shells drawn without a part-level evidence choice. */
export function evidenceClassOfPresence(presence: Presence): EvidenceClass {
  switch (presence) {
    case 'seen_on_tv':
    case 'spoken_on_tv':
    case 'official_stated':
      return 'sourced';
    case 'licensed_expanded':
      return 'reconstructed';
    case 'design_only':
    case 'uncertain':
      return 'inferred';
  }
}

export function isMeshTag(value: unknown): value is MeshTag {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.kind === 'room' || v.kind === 'connection') &&
    typeof v.id === 'string' &&
    (MESH_PARTS as readonly unknown[]).includes(v.part) &&
    (EVIDENCE_CLASSES as readonly unknown[]).includes(v.evidenceClass)
  );
}

// ── Description data ─────────────────────────────────────────────────────────

/** Horizontal point [x, z] in NU. */
export type Vec2 = readonly [number, number];

/**
 * Room-local azimuth convention: degrees about +Y, 0° = +Z, 90° = +X (the camera yaw
 * convention). Authored design bearings only; canon bearings stay null in rooms.ts.
 */
export function azimuthVector(azimuthDeg: number): Vec2 {
  const a = (azimuthDeg * Math.PI) / 180;
  return [Math.sin(a), Math.cos(a)];
}

/** Point at radius `r` along `azimuthDeg` from a centre, at height `y`. */
export function polar(center: Vec2, r: number, azimuthDeg: number, y: number): Vec3 {
  const [dx, dz] = azimuthVector(azimuthDeg);
  return [center[0] + dx * r, y, center[1] + dz * r];
}

/**
 * Air space of a room, or of the passage an edge builds between its rooms. Volumes may touch
 * but never overlap. `ownerId` is the topology id the space belongs to: a room in rooms.ts, or
 * a connection in connections.ts for a corridor run, stair hall or shaft built for that edge.
 *
 * `openings` lists the sides of a box through which walkers leave it (corridor ends, branch
 * doors). The spatial validator requires each to meet another space: a matching opening of a
 * kit piece, or a room with an open door anchor there (no dangling corridor ends).
 */
export type Volume =
  | {
      readonly id: string;
      readonly ownerId: string;
      readonly shape: 'box';
      readonly min: Vec3;
      readonly max: Vec3;
      readonly openings?: readonly Side[];
    }
  | {
      readonly id: string;
      readonly ownerId: string;
      readonly shape: 'cylinder';
      readonly center: Vec2;
      readonly radius: number;
      readonly y0: number;
      readonly y1: number;
    };

/** Footprint piece of a walkable surface. An annulus with `inner = 0` is a disc. */
export type SurfaceShape =
  | {
      readonly kind: 'annulus';
      readonly center: Vec2;
      readonly inner: number;
      readonly outer: number;
    }
  | { readonly kind: 'rect'; readonly min: Vec2; readonly max: Vec2 };

/**
 * A level floor people can stand on, at height `y`. Its footprint is the union of `shapes`,
 * which must touch or overlap so the surface is one walkable region. `ownerId` follows
 * {@link Volume}: a room, or the connection whose passage floor (corridor deck, landing) it is.
 */
export interface WalkableSurface {
  readonly id: string;
  readonly ownerId: string;
  readonly y: number;
  readonly shapes: readonly SurfaceShape[];
}

/**
 * World placement of a topology door anchor (rooms.ts `DoorAnchor`). `azimuthDeg` is the
 * authored design bearing of the opening, or null for anchors that are not on a curved shell.
 */
export interface AnchorPlacement {
  readonly roomId: string;
  readonly anchorId: string;
  readonly surfaceId: string;
  readonly position: Vec3;
  readonly azimuthDeg: number | null;
  /** `closed`: reported or reserved opening with no traversal in this snapshot. */
  readonly state: 'open' | 'closed';
}

export interface AnchorRef {
  readonly roomId: string;
  readonly anchorId: string;
}

/**
 * Walkable route of one topology edge, from one anchor to another. `points` is the polyline
 * a walker follows: the first point is the `from` anchor and the last is the `to` anchor.
 */
export interface PathSegment {
  readonly id: string;
  readonly connectionId: string;
  readonly kind: EdgeKind;
  readonly portal: boolean;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly points: readonly Vec3[];
}

// ── Kit primitives (geometry intent, built by src/world/kit/) ────────────────

/**
 * Prism around a vertical axis between `bottom` and `top`: a disc (`inner = 0`), an annulus,
 * or a sector of either (`startDeg`/`sweepDeg`, azimuth convention). `sides` gives a regular
 * polygon instead of a circle (6 = the hexagonal console); a polygon sector spans whole faces,
 * so its `startDeg` is a vertex bearing and its `sweepDeg` a multiple of 360 / `sides`. Floor
 * plates, curved and polygonal wall segments, the console and the rotor column are all plates.
 */
export interface PlatePrimitive {
  readonly type: 'plate';
  readonly center: Vec2;
  readonly inner: number;
  readonly outer: number;
  readonly bottom: number;
  readonly top: number;
  readonly sides?: number;
  readonly startDeg?: number;
  readonly sweepDeg?: number;
}

export interface BoxPrimitive {
  readonly type: 'box';
  readonly min: Vec3;
  readonly max: Vec3;
}

/** Straight flight from the `bottom` nosing line to the `top` one, `steps` treads. */
export interface StairsPrimitive {
  readonly type: 'stairs';
  readonly bottom: Vec3;
  readonly top: Vec3;
  readonly width: number;
  readonly steps: number;
}

export interface LadderPrimitive {
  readonly type: 'ladder';
  readonly bottom: Vec3;
  readonly top: Vec3;
  readonly width: number;
  /** Bearing the climber faces; rails sit across it. */
  readonly facingDeg: number;
}

/** Guard rail `height` above the walking line: straight (`from`→`to`) or an arc. */
export type RailingPrimitive =
  | {
      readonly type: 'railing';
      readonly path: 'line';
      readonly from: Vec3;
      readonly to: Vec3;
      readonly height: number;
    }
  | {
      readonly type: 'railing';
      readonly path: 'arc';
      readonly center: Vec2;
      readonly radius: number;
      readonly y: number;
      readonly startDeg: number;
      readonly sweepDeg: number;
      readonly height: number;
    };

/**
 * Doorway frame whose sill centre is `sill`, set in a wall facing `azimuthDeg`. `profile`
 * `hex` draws a hexagonal panel frame. `closed` adds a door leaf.
 */
export interface DoorwayPrimitive {
  readonly type: 'doorway';
  readonly sill: Vec3;
  readonly azimuthDeg: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly profile: 'rect' | 'hex';
  readonly closed: boolean;
}

/**
 * Structural rib in the vertical plane at `azimuthDeg`: a polyline of (radius, y) points
 * swept as a rectangular section `width` (tangential) × `depth` (radial).
 */
export interface RibPrimitive {
  readonly type: 'rib';
  readonly center: Vec2;
  readonly azimuthDeg: number;
  readonly profile: readonly Vec2[];
  readonly width: number;
  readonly depth: number;
}

/**
 * Ring of `divisions` segments around a vertical axis, held by `spokes` arms reaching in to
 * `hubRadius`. `spin` is its rotation sense (+1 counter-clockwise seen from above).
 */
export interface RingPrimitive {
  readonly type: 'ring';
  readonly center: Vec3;
  readonly radius: number;
  readonly hubRadius: number;
  readonly divisions: number;
  readonly spokes: number;
  readonly segmentHeight: number;
  readonly segmentDepth: number;
  readonly spin: 1 | -1;
}

/** Closed polygon in a sweep's cross-section plane, optionally with holes (frames). */
export interface SweepSection {
  readonly outline: readonly Vec2[];
  readonly holes?: readonly (readonly Vec2[])[];
}

/**
 * Vertical cross-sections swept along a straight run from `from` to `to`, which is level or
 * sloped but never vertical. Section points are (s, v): `s` runs across the run along
 * (dz, 0, −dx) of its horizontal direction (dx, dz), and `v` up from the run line. On a sloped
 * run the sections stay vertical (a shear), so stair-hall walls follow the flight. Corridor
 * walls, ceilings, floor decks and support-rib frames are sweeps.
 */
export interface SweepPrimitive {
  readonly type: 'sweep';
  readonly from: Vec3;
  readonly to: Vec3;
  readonly sections: readonly SweepSection[];
}

/** Rigid placement of a repeat: turn `yawDeg` about +Y (azimuth convention), then move. */
export interface Placement {
  readonly position: Vec3;
  readonly yawDeg: number;
}

/**
 * Purely decorative repeats (support-rib frames, roundel and hex panels) drawn as one
 * instanced mesh. `base` is described around the local origin facing +Z (azimuth 0°) and
 * placed at every placement. Structure people walk on or that encloses a route is never
 * instanced.
 */
export interface InstancesPrimitive {
  readonly type: 'instances';
  readonly base: SweepPrimitive | PlatePrimitive | BoxPrimitive;
  readonly placements: readonly Placement[];
}

export type KitPrimitive =
  | PlatePrimitive
  | BoxPrimitive
  | StairsPrimitive
  | LadderPrimitive
  | RailingPrimitive
  | DoorwayPrimitive
  | RibPrimitive
  | RingPrimitive
  | SweepPrimitive
  | InstancesPrimitive;

/** One renderable piece: what to build and the tag every resulting mesh carries. */
export interface StructureElement {
  readonly tag: MeshTag;
  readonly primitive: KitPrimitive;
  /**
   * Greybox tone: the region whose shade the element takes, so the map reads from inhabited
   * to industrial with depth. Omitted for the console's own palette. Not an evidence colour.
   */
  readonly tone?: RegionId;
  /** Text drawn next to the element (closed reported doors, the INF-E bypass). */
  readonly label?: string;
  /**
   * `feature`: the label names the evidence state of a hero feature (the reconfiguring ARS
   * door, the portal). Otherwise it reads as a door or edge label by the tag's kind.
   */
  readonly labelKind?: 'feature';
  /** Where the label sits; doorways default to just above their opening. */
  readonly labelAt?: Vec3;
}

export interface StructureLabel {
  readonly roomId: string;
  readonly position: Vec3;
}

/**
 * Pure description of a connected group of rooms. Volumes, surfaces, anchors and paths are
 * what the validator checks; elements are what the builder draws.
 */
export interface StructureDescription {
  readonly id: string;
  readonly units: 'normalized';
  /** Topology nodes this description fully replaces in the scene. */
  readonly roomIds: readonly string[];
  readonly volumes: readonly Volume[];
  readonly surfaces: readonly WalkableSurface[];
  readonly anchors: readonly AnchorPlacement[];
  readonly paths: readonly PathSegment[];
  readonly elements: readonly StructureElement[];
  readonly labels: readonly StructureLabel[];
}
