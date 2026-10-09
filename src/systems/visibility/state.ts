/**
 * Visual-state model of the cutaway and visibility system (Execution 6). Pure data, no Three.js:
 * each feature is a *layer* that asks something of a mesh by its tag (the mesh-tagging contract
 * in src/world/structure.ts), and {@link composeLayers} merges the layers' requests into one
 * {@link ResolvedVisual} per mesh, so features never fight over a material.
 *
 * Built-in layers: `cutaway` (camera-facing wall cut, ceiling hide), `isolation` (region or level
 * isolation, and focus mode) and `selection`. `overlay` and `route` are slots for Execution 7.
 */

import type { Connection, RegionId, RoomNode } from '../../data/types';
import type { Bounds } from '../../scene/camera/isometric';
import type { MeshPart, MeshTag } from '../../world/structure';

/** Layers in ascending precedence: for ghost, tint and colour the last layer that sets one wins. */
export const VISUAL_LAYERS = ['cutaway', 'isolation', 'overlay', 'route', 'selection'] as const;
export type VisualLayerId = (typeof VISUAL_LAYERS)[number];

/** Emissive override (selection highlight, and route highlight in Ex7). */
export interface Tint {
  readonly color: number;
  readonly intensity: number;
}

/**
 * What one layer asks of one mesh; omitted channels leave the decision to other layers.
 * - `hidden`: not drawn and not pickable. Hiding is structural: any layer hiding wins.
 * - `cut`: the camera-facing cutaway applies to this mesh. Any layer cutting wins.
 * - `ghost`: share of pixels kept by the dither (0 < ghost ≤ 1; 1 is solid). Context ghosting.
 * - `tint`: emissive override. `color`: base colour override (the Ex7 evidence overlay).
 */
export interface LayerEffect {
  readonly hidden?: boolean;
  readonly cut?: boolean;
  readonly ghost?: number;
  readonly tint?: Tint;
  readonly color?: number;
}

/** A layer: its effect on a mesh, from the mesh's tag (undefined: no opinion). */
export type LayerFn = (tag: MeshTag) => LayerEffect | undefined;

export interface ResolvedVisual {
  readonly hidden: boolean;
  readonly cut: boolean;
  readonly ghost: number;
  readonly tint: Tint | null;
  readonly color: number | null;
  /** Whether a raycast may stop on this mesh at all; clip and cut are then tested per hit point. */
  readonly pickable: boolean;
}

/** Ghosted geometry thinner than this is see-through to picks as well as to the eye. */
export const PICK_MIN_KEEP = 0.5;
/** Dither share kept for ghosted context (a regular 2-pixel grid of a 4×4 Bayer matrix). */
export const GHOST_KEEP = 0.25;
/** Dither share kept for cut walls: sparser than ghosts, since they stand in front of the view. */
export const CUT_KEEP = 0.125;
/** Outlines blend instead of dithering (a dithered 1-px line breaks up); opacities by state. */
export const GHOST_LINE_KEEP = 0.35;
export const CUT_LINE_KEEP = 0.25;
export const SELECTED_TINT: Tint = { color: 0xe8913a, intensity: 0.55 };

export const SOLID: ResolvedVisual = {
  hidden: false,
  cut: false,
  ghost: 1,
  tint: null,
  color: null,
  pickable: true,
};

/**
 * Merges the layers' effects on one mesh. `hidden` and `cut` are unions; `ghost`, `tint` and
 * `color` come from the highest-precedence layer that sets them, so the selection can reveal a
 * room an isolation ghosts. A mesh is pickable unless hidden or ghosted below {@link PICK_MIN_KEEP}.
 */
export function composeLayers(
  effects: Partial<Record<VisualLayerId, LayerEffect | undefined>>,
): ResolvedVisual {
  let hidden = false;
  let cut = false;
  let ghost = 1;
  let tint: Tint | null = null;
  let color: number | null = null;
  for (const id of VISUAL_LAYERS) {
    const e = effects[id];
    if (!e) continue;
    if (e.ghost !== undefined && !(e.ghost > 0 && e.ghost <= 1)) {
      throw new Error(`Layer ${id}: ghost ${e.ghost} is outside (0, 1]`);
    }
    hidden ||= e.hidden === true;
    cut ||= e.cut === true;
    ghost = e.ghost ?? ghost;
    tint = e.tint ?? tint;
    color = e.color ?? color;
  }
  return { hidden, cut, ghost, tint, color, pickable: !hidden && ghost >= PICK_MIN_KEEP };
}

// ── Settings ─────────────────────────────────────────────────────────────────

export type IsolationTarget =
  | { readonly kind: 'region'; readonly region: RegionId }
  | { readonly kind: 'level'; readonly y: number };

/** What the isolation layer isolates: a region, a level, or the focused room (focus mode). */
export type IsolationScope = IsolationTarget | { readonly kind: 'room'; readonly id: string };

export interface CutawaySettings {
  /** Camera-facing wall cut. */
  readonly wallFade: boolean;
  readonly ceilingsHidden: boolean;
  /** Elevation (NU) above which everything is clipped away; null for no section. */
  readonly sectionY: number | null;
  readonly isolation: IsolationTarget | null;
  /** Focus mode: the selected room cut open, everything else ghosted. Needs a selection. */
  readonly focusMode: boolean;
}

export const DEFAULT_CUTAWAY: CutawaySettings = {
  wallFade: true,
  ceilingsHidden: true,
  sectionY: null,
  isolation: null,
  focusMode: false,
};

/** Focus mode wins over a region or level isolation while a room is selected. */
export function isolationScope(
  settings: CutawaySettings,
  selection: string | null,
): IsolationScope | null {
  if (settings.focusMode && selection !== null) return { kind: 'room', id: selection };
  return settings.isolation;
}

export function sameSettings(a: CutawaySettings, b: CutawaySettings): boolean {
  return (
    a.wallFade === b.wallFade &&
    a.ceilingsHidden === b.ceilingsHidden &&
    a.sectionY === b.sectionY &&
    a.focusMode === b.focusMode &&
    sameTarget(a.isolation, b.isolation)
  );
}

function sameTarget(a: IsolationTarget | null, b: IsolationTarget | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind === 'region') return b.kind === 'region' && a.region === b.region;
  return b.kind === 'level' && a.y === b.y;
}

// ── Levels and sections ──────────────────────────────────────────────────────

/** Storey height of the layout grid (src/data/layout.ts grows the map in 7-NU levels). */
export const LEVEL_HEIGHT_NU = 7;
/** A section stop cuts this far below the next level's floor, so that floor's slab is removed. */
export const SECTION_BELOW_NEXT_FLOOR_NU = 1;

/** Deck levels: the room floor heights on the 7-NU grid, highest first. */
export function deckLevels(floors: readonly number[]): number[] {
  // `+ 0` turns −0 (−7 % 7) into 0, so the set holds one zero.
  const levels = new Set(floors.filter((y) => y % LEVEL_HEIGHT_NU === 0).map((y) => y + 0));
  return [...levels].sort((a, b) => b - a);
}

/** Whether a room's box has air in the storey band [y, y + LEVEL_HEIGHT_NU). */
export function onLevel(b: Bounds, y: number): boolean {
  return b.min[1] < y + LEVEL_HEIGHT_NU && b.max[1] > y;
}

/** Section heights that show each level up to just under the next floor, highest first. */
export function sectionStops(levels: readonly number[]): number[] {
  return levels.map((y) => y + LEVEL_HEIGHT_NU - SECTION_BELOW_NEXT_FLOOR_NU);
}

/** The next stop below the section (from no section: the highest), or the section unchanged. */
export function lowerSection(sectionY: number | null, stops: readonly number[]): number | null {
  const below = stops.filter((s) => sectionY === null || s < sectionY - 1e-6);
  return below.length > 0 ? Math.max(...below) : sectionY;
}

/** The next stop above the section, or no section when it is at or above the highest stop. */
export function raiseSection(sectionY: number | null, stops: readonly number[]): number | null {
  if (sectionY === null) return null;
  const above = stops.filter((s) => s > sectionY + 1e-6);
  return above.length > 0 ? Math.min(...above) : null;
}

// ── Isolation ────────────────────────────────────────────────────────────────

export interface IsolationSet {
  readonly rooms: ReadonlySet<string>;
  /** Edges with an end in `rooms`: kept solid, so the way out of the isolated set stays visible. */
  readonly connections: ReadonlySet<string>;
  /** Room cut open by focus mode. */
  readonly focus: string | null;
}

export function isolationSet(
  scope: IsolationScope,
  rooms: readonly RoomNode[],
  connections: readonly Connection[],
  bounds: ReadonlyMap<string, Bounds>,
): IsolationSet {
  if (scope.kind === 'room' && !bounds.has(scope.id)) throw new Error(`Unknown room ${scope.id}`);
  const placed = rooms.filter((r) => bounds.has(r.id));
  const ids = new Set(
    scope.kind === 'room'
      ? [scope.id]
      : scope.kind === 'region'
        ? placed.filter((r) => r.region === scope.region).map((r) => r.id)
        : placed.filter((r) => onLevel(bounds.get(r.id) as Bounds, scope.y)).map((r) => r.id),
  );
  const edges = connections
    .filter((c) => ids.has(c.from.room) || ids.has(c.to.room))
    .map((c) => c.id);
  return {
    rooms: ids,
    connections: new Set(edges),
    focus: scope.kind === 'room' ? scope.id : null,
  };
}

// ── Built-in layers ──────────────────────────────────────────────────────────

/**
 * Parts the camera-facing cutaway cuts: walls and what is mounted on them or stands in for
 * them (shaft walls, support ribs and frames, the console crown, wall panels, library stacks,
 * closed doors). Floors, walkways, stairs, doorway frames and room contents stay solid.
 */
export const CUT_PARTS: ReadonlySet<MeshPart> = new Set<MeshPart>([
  'wall',
  'shaft',
  'rib',
  'crown',
  'panel',
  'stack',
  'door-closed',
]);

export function cutawayEffect(tag: MeshTag, s: CutawaySettings): LayerEffect | undefined {
  if (tag.part === 'ceiling') return s.ceilingsHidden ? { hidden: true } : undefined;
  if (s.wallFade && CUT_PARTS.has(tag.part)) return { cut: true };
  return undefined;
}

/** Ghosts what is outside the set; the focused room loses its ceiling and its near walls. */
export function isolationEffect(tag: MeshTag, iso: IsolationSet | null): LayerEffect | undefined {
  if (iso === null) return undefined;
  const inside = tag.kind === 'room' ? iso.rooms.has(tag.id) : iso.connections.has(tag.id);
  if (!inside) return { ghost: GHOST_KEEP };
  if (tag.kind === 'room' && tag.id === iso.focus) {
    if (tag.part === 'ceiling') return { hidden: true };
    if (CUT_PARTS.has(tag.part)) return { cut: true };
  }
  return undefined;
}

/**
 * Highlights the selected room and reveals it solid even where an isolation ghosts it. In focus
 * mode the selection is the focus and everything else is ghosted already, so the room keeps its
 * own colours and its interior stays legible.
 */
export function selectionEffect(
  tag: MeshTag,
  selected: string | null,
  iso: IsolationSet | null,
): LayerEffect | undefined {
  if (selected === null || tag.kind !== 'room' || tag.id !== selected) return undefined;
  if (iso?.focus === selected) return undefined;
  return { tint: SELECTED_TINT, ghost: 1 };
}
