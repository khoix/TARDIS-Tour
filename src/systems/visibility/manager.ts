/**
 * Visual-state manager (Execution 6): the one owner of world materials and mesh visibility.
 * It resolves every tagged mesh through the layers in state.ts (cutaway, isolation, the Ex7
 * overlay and route slots, selection), swaps in the matching material variant, hides labels
 * above the section and dims those of ghosted owners, and filters picks so that hidden,
 * clipped, cut and ghosted geometry never takes a click.
 */

import {
  Box3,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
  type Object3D,
  Vector3,
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Vec3 } from '../../data/layout';
import type { Connection, RoomNode } from '../../data/types';
import type { Bounds } from '../../scene/camera/isometric';
import type { LabelOwner } from '../../world/build';
import { isMeshTag, type MeshTag, type Vec2 } from '../../world/structure';
import {
  clippedAt,
  firstPick,
  type PickHit,
  roomSpine,
  type Spine,
  walkLineSpine,
} from './cutaway';
import {
  createSharedUniforms,
  MaterialStates,
  NO_SECTION_Y,
  type SharedUniforms,
} from './materials';
import {
  composeLayers,
  cutawayEffect,
  type CutawaySettings,
  deckLevels,
  DEFAULT_CUTAWAY,
  type IsolationSet,
  isolationEffect,
  isolationScope,
  isolationSet,
  type LayerFn,
  type ResolvedVisual,
  sameSettings,
  sectionStops,
  selectionEffect,
} from './state';

/** What the manager needs of the scene (a PrototypeScene provides all of it). */
export interface VisualWorld {
  readonly root: Object3D;
  readonly roomBounds: ReadonlyMap<string, Bounds>;
  readonly walkLines: ReadonlyMap<string, readonly Vec3[]>;
  readonly overview: Bounds;
}

/** Layer slots other systems fill (Execution 7: the evidence overlay and route highlighting). */
export type LayerSlot = 'overlay' | 'route';

export interface VisibilitySnapshot extends CutawaySettings {
  /** Room focus mode has cut open (the selection while focus mode is on). */
  readonly focusRoom: string | null;
  /** Rooms the isolation keeps solid, sorted; null when nothing is isolated. */
  readonly isolatedRooms: readonly string[] | null;
  /** Horizontal direction the camera-facing cut currently uses. */
  readonly view: Vec2 | null;
}

interface LineEntry {
  readonly object: LineSegments;
  readonly base: Material;
}

interface MeshEntry {
  readonly object: Mesh;
  readonly tag: MeshTag;
  readonly base: Material;
  readonly lines: readonly LineEntry[];
  /** Lowest world elevation of the mesh: entirely above a section lower than this. */
  readonly minY: number;
  resolved: ResolvedVisual;
}

interface LabelEntry {
  readonly object: CSS2DObject;
  readonly owner: LabelOwner | null;
  readonly y: number;
}

const ownerKey = (kind: string, id: string) => `${kind}:${id}`;
const tagKey = (t: MeshTag) => `${t.kind}|${t.id}|${t.part}|${t.evidenceClass}`;

export class VisualState {
  /** Deck levels (floor heights on the 7-NU grid), highest first. */
  readonly levels: readonly number[];
  /** Section heights of the Raise/Lower steps, highest first. */
  readonly sectionStops: readonly number[];
  /** Slider range of the section clip; a section at `max` or above clips nothing. */
  readonly sectionRange: { readonly min: number; readonly max: number };
  private current: CutawaySettings = DEFAULT_CUTAWAY;
  private selected: string | null = null;
  private view: Vec2 | null = null;
  private iso: IsolationSet | null = null;
  private readonly shared: SharedUniforms = createSharedUniforms();
  private readonly materials = new MaterialStates(this.shared);
  private readonly materialOwner = new Map<Material, string>();
  private readonly outlineBases = new Map<string, Material>();
  private readonly spines = new Map<string, Spine | null>();
  private readonly meshes = new Map<Object3D, MeshEntry>();
  private readonly byRoom = new Map<string, MeshEntry[]>();
  private readonly labels: LabelEntry[] = [];
  private readonly labelled = new Set<Object3D>();
  private readonly slots = new Map<LayerSlot, LayerFn>();
  private readonly listeners: (() => void)[] = [];
  private readonly regionOf: ReadonlyMap<string, string>;

  constructor(
    private readonly world: VisualWorld,
    private readonly rooms: readonly RoomNode[],
    private readonly connections: readonly Connection[],
  ) {
    this.regionOf = new Map(rooms.map((r) => [r.id, r.region]));
    this.levels = deckLevels([...world.roomBounds.values()].map((b) => b.min[1]));
    this.sectionStops = sectionStops(this.levels);
    this.sectionRange = {
      min: Math.floor(world.overview.min[1]),
      max: Math.ceil(world.overview.max[1]),
    };
    this.register(world.root);
  }

  /** Takes over every tagged mesh, outline and label under `root` (e.g. a lazily added dressing). */
  register(root: Object3D): void {
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (o instanceof Mesh && isMeshTag(o.userData) && !this.meshes.has(o)) this.addMesh(o);
      else if (o instanceof CSS2DObject && !this.labelled.has(o)) {
        this.labelled.add(o);
        this.labels.push({
          object: o,
          owner: (o.userData.labelOf as LabelOwner | undefined) ?? null,
          y: o.getWorldPosition(new Vector3()).y,
        });
      }
    });
    this.apply();
  }

  settings(): CutawaySettings {
    return this.current;
  }

  /**
   * Changes cutaway settings. Isolating a region or level ends focus mode; focus mode replaces
   * any isolation and needs a selection (without one it stays off).
   */
  update(patch: Partial<CutawaySettings>): void {
    let next: CutawaySettings = { ...this.current, ...patch };
    if (patch.isolation) next = { ...next, focusMode: false };
    if (patch.focusMode) next = { ...next, isolation: null, focusMode: this.selected !== null };
    if (sameSettings(next, this.current)) return;
    this.current = next;
    this.apply();
  }

  /** Restores the default cutaway: near walls cut, ceilings hidden, no section, no isolation. */
  reset(): void {
    this.update(DEFAULT_CUTAWAY);
  }

  /** Selection layer; clearing the selection also ends focus mode. */
  setSelection(id: string | null): void {
    if (id === this.selected) return;
    this.selected = id;
    if (id === null && this.current.focusMode) this.current = { ...this.current, focusMode: false };
    this.apply();
  }

  /** Fills (or clears, with null) an Ex7 layer slot; the layer is re-resolved on every mesh. */
  setLayer(slot: LayerSlot, layer: LayerFn | null): void {
    if (layer) this.slots.set(slot, layer);
    else this.slots.delete(slot);
    this.apply();
  }

  /** Owners (`kind:id`, sorted) of the drawn meshes a slot's layer has an opinion on. */
  layerTargets(slot: LayerSlot): string[] {
    const layer = this.slots.get(slot);
    if (!layer) return [];
    const owners = new Set<string>();
    for (const e of this.meshes.values()) {
      if (!e.resolved.hidden && layer(e.tag)) owners.add(ownerKey(e.tag.kind, e.tag.id));
    }
    return [...owners].sort();
  }

  /** Camera direction the cut uses (horizontal unit vector towards the camera). */
  setView(view: Vec2 | null): void {
    this.view = view;
    this.shared.uTardisView.value.set(view?.[0] ?? 0, view?.[1] ?? 0);
  }

  snapshot(): VisibilitySnapshot {
    return {
      ...this.current,
      focusRoom: this.iso?.focus ?? null,
      isolatedRooms: this.iso ? [...this.iso.rooms].sort() : null,
      view: this.view,
    };
  }

  onChange(listener: () => void): void {
    this.listeners.push(listener);
  }

  /** Resolved state of a managed mesh. */
  resolved(object: Object3D): ResolvedVisual | undefined {
    return this.meshes.get(object)?.resolved;
  }

  /** First hit, of a distance-sorted raycast, that the visible scene would actually show there. */
  pick<H extends PickHit<Object3D>>(hits: readonly H[]): H | undefined {
    return firstPick<Object3D, H>(hits, {
      sectionY: this.current.sectionY,
      view: this.view,
      visual: (o) => this.meshes.get(o)?.resolved,
      spine: (o) => {
        const e = this.meshes.get(o);
        return e ? (this.spineOf(e.tag.kind, e.tag.id) ?? undefined) : undefined;
      },
    });
  }

  /** Whether some mesh of the room is drawn (ghosts count) and not wholly above the section. */
  roomVisible(id: string): boolean {
    return (this.byRoom.get(id) ?? []).some((e) => !e.resolved.hidden && this.belowSection(e));
  }

  /** Whether some mesh of the room may take a click (not hidden, ghosted or wholly clipped). */
  roomPickable(id: string): boolean {
    return (this.byRoom.get(id) ?? []).some((e) => e.resolved.pickable && this.belowSection(e));
  }

  private belowSection(e: MeshEntry): boolean {
    return !clippedAt(e.minY, this.current.sectionY);
  }

  private spineOf(kind: string, id: string): Spine | null {
    const key = ownerKey(kind, id);
    let spine = this.spines.get(key);
    if (spine === undefined) {
      const bounds = this.world.roomBounds.get(id);
      const line = this.world.walkLines.get(id);
      spine =
        kind === 'room'
          ? bounds
            ? roomSpine(bounds)
            : null
          : line
            ? walkLineSpine(id, line)
            : null;
      this.spines.set(key, spine);
    }
    return spine;
  }

  /** The mesh's base material, made specific to its owner (a shared one is cloned) and patched. */
  private ownBase(material: Material, kind: string, id: string): Material {
    const key = ownerKey(kind, id);
    const owner = this.materialOwner.get(material);
    const base = owner === undefined || owner === key ? material : material.clone();
    if (!this.materials.has(base)) {
      this.materials.addBase(base, this.spineOf(kind, id));
      this.materialOwner.set(base, key);
    }
    return base;
  }

  /** Outlines share one material per owner and colour (they are drawn identically). */
  private outlineBase(material: Material, kind: string, id: string): Material {
    if (!(material instanceof LineBasicMaterial)) return this.ownBase(material, kind, id);
    const key = `${ownerKey(kind, id)}|${material.color.getHex()}`;
    let base = this.outlineBases.get(key);
    if (!base) {
      base = this.ownBase(material, kind, id);
      this.outlineBases.set(key, base);
    }
    return base;
  }

  private addMesh(mesh: Mesh): void {
    const tag = mesh.userData as MeshTag;
    if (Array.isArray(mesh.material)) throw new Error(`${mesh.name}: multi-material meshes`);
    const base = this.ownBase(mesh.material, tag.kind, tag.id);
    mesh.material = base;
    const lines = mesh.children
      .filter((c): c is LineSegments => c instanceof LineSegments)
      .map((line) => {
        const lineBase = this.outlineBase(line.material as Material, tag.kind, tag.id);
        line.material = lineBase;
        return { object: line, base: lineBase };
      });
    const entry: MeshEntry = {
      object: mesh,
      tag,
      base,
      lines,
      minY: new Box3().setFromObject(mesh).min.y,
      resolved: composeLayers({}),
    };
    this.meshes.set(mesh, entry);
    if (tag.kind === 'room') this.byRoom.set(tag.id, [...(this.byRoom.get(tag.id) ?? []), entry]);
  }

  /** Re-resolves every mesh and label, then notifies listeners. */
  private apply(): void {
    const scope = isolationScope(this.current, this.selected);
    this.iso = scope
      ? isolationSet(scope, this.rooms, this.connections, this.world.roomBounds)
      : null;
    const memo = new Map<string, ResolvedVisual>();
    for (const e of this.meshes.values()) {
      const key = tagKey(e.tag);
      let r = memo.get(key);
      if (!r) {
        r = composeLayers({
          cutaway: cutawayEffect(e.tag, this.current),
          isolation: isolationEffect(e.tag, this.iso),
          overlay: this.slots.get('overlay')?.(e.tag),
          route: this.slots.get('route')?.(e.tag),
          selection: selectionEffect(e.tag, this.selected, this.iso),
        });
        memo.set(key, r);
      }
      e.resolved = r;
      e.object.visible = !r.hidden;
      e.object.material = this.materials.variant(e.base, r);
      for (const l of e.lines) l.object.material = this.materials.variant(l.base, r);
    }
    this.shared.uTardisClipY.value = this.current.sectionY ?? NO_SECTION_Y;
    for (const l of this.labels) {
      l.object.visible = !clippedAt(l.y, this.current.sectionY);
      l.object.element.classList.toggle('is-ghosted', this.ghostedOwner(l.owner));
    }
    for (const listener of this.listeners) listener();
  }

  private ghostedOwner(owner: LabelOwner | null): boolean {
    const iso = this.iso;
    if (!iso || !owner) return false;
    switch (owner.kind) {
      case 'room':
        return !iso.rooms.has(owner.id) && owner.id !== this.selected;
      case 'connection':
        return !iso.connections.has(owner.id);
      case 'region':
        return ![...iso.rooms].some((id) => this.regionOf.get(id) === owner.id);
    }
  }
}
