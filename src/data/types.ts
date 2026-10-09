/**
 * Data model for the TARDIS reconstruction.
 *
 * Topology and evidence live here; world-space placement lives in layout data
 * (added in a later execution). Controlled vocabularies follow
 * docs/reference/tardis-research.md §B (evidence axes) and §19 (edge kinds, statuses).
 * Evidence axes are kept separate and are never blended into one score.
 */

/** Per-claim confidence grade (build plan "Canon / Evidence Model"). */
export const GRADES = ['A', 'B', 'C', 'D', 'E'] as const;
export type Grade = (typeof GRADES)[number];

/** Is the space attested at all, and by what kind of witness? (§B `presence`) */
export const PRESENCE_VALUES = [
  'seen_on_tv',
  'spoken_on_tv',
  'official_stated',
  'licensed_expanded',
  'design_only',
  'uncertain',
] as const;
export type Presence = (typeof PRESENCE_VALUES)[number];

/** How its look is known. (§B `appearance`) */
export const APPEARANCE_VALUES = [
  'frame_reviewed',
  'production_still',
  'reconstructed_reference',
  'verbal_only',
  'unknown',
] as const;
export type Appearance = (typeof APPEARANCE_VALUES)[number];

/** Basis for any size information. (§B `scale`) */
export const SCALE_VALUES = [
  'original_plan',
  'photogrammetrically_calibrated',
  'historical_reconstruction',
  'normalized_authored',
  'unknown',
] as const;
export type Scale = (typeof SCALE_VALUES)[number];

/** How a route between two spaces is known. (§B `connection`) */
export const CONNECTION_BASIS_VALUES = [
  'continuous_visible_traversal',
  'shown_threshold',
  'spoken_route',
  'edited_sequence',
  'general_reachability',
  'inferred',
  'portal',
] as const;
export type ConnectionBasis = (typeof CONNECTION_BASIS_VALUES)[number];

/** Configuration state. (§B `state`) */
export const STATE_VALUES = [
  'stable',
  'reconfiguring',
  'damaged',
  'jettisoned',
  'deleted',
  'archived',
  'echo',
  'restored',
  'historical_variant',
] as const;
export type ConfigurationState = (typeof STATE_VALUES)[number];

/** Physical form of a build-graph edge. (§19 `edge_kind`) */
export const EDGE_KINDS = [
  'doorway',
  'corridor',
  'stairs',
  'ramp',
  'ladder',
  'catwalk',
  'shaft',
  'vestibule_portal',
  'inaccessible_observation',
] as const;
export type EdgeKind = (typeof EDGE_KINDS)[number];

/** Evidence class codes from the research bible (Appendix L §1). */
export const PROVENANCE_CODES = [
  'TV-S',
  'TV-M',
  'OFF',
  'PROD',
  'REC',
  'EXP',
  'INF-D',
  'INF-E',
] as const;
export type ProvenanceCode = (typeof PROVENANCE_CODES)[number];

export const REGIONS = [
  'control-nexus',
  'cultural',
  'residential',
  'maintenance',
  'power-core',
  'quiet',
  'archive',
  'reserved',
] as const;
export type RegionId = (typeof REGIONS)[number];

export const TIERS = [1, 2, 3, 'deferred'] as const;
export type Tier = (typeof TIERS)[number];

export const ANCHOR_LEVELS = ['gallery', 'main', 'lower', 'sub-console', 'room'] as const;
export type AnchorLevel = (typeof ANCHOR_LEVELS)[number];

/** One graded claim with its sources. Sources are IDs in src/data/evidence.ts. */
export interface EvidenceRecord {
  readonly grade: Grade;
  readonly sourceIds: readonly string[];
  readonly note: string;
}

export interface RoomEvidenceAxes {
  readonly presence: Presence;
  readonly appearance: Appearance;
  readonly scale: Scale;
}

/** A named doorway/landing point on a room's shell where a connection terminates. */
export interface DoorAnchor {
  readonly id: string;
  readonly label: string;
  readonly level: AnchorLevel;
  /** True when the opening itself is attested (seen/reported), not merely authored. */
  readonly observed: boolean;
  /**
   * Canon bearing in room-local degrees; null until surveyed (research §C.1).
   * Authored bearings belong to layout data, never here.
   */
  readonly canonAzimuthDeg: number | null;
  readonly note?: string;
}

export interface RoomNode {
  readonly id: string;
  readonly name: string;
  readonly tier: Tier;
  readonly region: RegionId;
  readonly shellType: string;
  readonly eras: readonly string[];
  /** Placed rooms are built in the v1 stable snapshot; others are inventory-only. */
  readonly placed: boolean;
  /** State in the default stable snapshot. */
  readonly state: ConfigurationState;
  /** Other states this space is recorded in (e.g. an ARS door that vanished). */
  readonly observedStates: readonly ConfigurationState[];
  readonly axes: RoomEvidenceAxes;
  readonly appearances: readonly string[];
  readonly summary: string;
  readonly anchors: readonly DoorAnchor[];
  readonly evidence: readonly EvidenceRecord[];
}

export interface ConnectionEnd {
  readonly room: string;
  readonly anchor: string;
}

/** Required for any connection that is not directly established by primary evidence. */
export interface InferenceRecord {
  readonly reason: string;
  readonly alternate: string;
  readonly uncertainty: string;
  readonly authoredBy: string;
  readonly status: 'proposed' | 'accepted' | 'rejected';
}

export interface Connection {
  readonly id: string;
  readonly from: ConnectionEnd;
  readonly to: ConnectionEnd;
  readonly kind: EdgeKind;
  /** Non-Euclidean transition; excluded from every stable-connectivity check. */
  readonly portal: boolean;
  /** `v1` edges are built in the first stable snapshot; `deferred` are inventory-only. */
  readonly buildStatus: 'v1' | 'deferred';
  readonly provenance: ProvenanceCode;
  readonly basis: ConnectionBasis;
  readonly state: ConfigurationState;
  readonly observedStates: readonly ConfigurationState[];
  readonly summary: string;
  readonly evidence: readonly EvidenceRecord[];
  readonly inference?: InferenceRecord;
}

export type SourceKind =
  | 'official'
  | 'production'
  | 'press'
  | 'transcript'
  | 'photo'
  | 'reconstruction'
  | 'licensed'
  | 'fan-index'
  | 'firsthand';

export interface SourceRecord {
  readonly id: string;
  readonly title: string;
  readonly urls: readonly string[];
  readonly kind: SourceKind;
  /** IDs used for the same source elsewhere in the research bible (V/G/J/PICK…). */
  readonly aliases: readonly string[];
  /** What this source actually verifies, and its limits. */
  readonly verifies: string;
}

export interface Era {
  readonly id: string;
  readonly label: string;
  readonly years: readonly [number, number];
  readonly note: string;
}
