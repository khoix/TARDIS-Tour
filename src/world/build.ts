/**
 * Build step of describe → build: turns a {@link StructureDescription} into a scene group
 * with the kit. Pure data in, tagged meshes out; nothing here decides geometry.
 */

import { type Object3D, Group, Mesh } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { type Bounds, unionBounds } from '../scene/camera/isometric';
import { buildPrimitive, MaterialCache } from './kit';
import {
  isMeshTag,
  type MeshPart,
  type RingPrimitive,
  type StructureDescription,
  type StructureElement,
} from './structure';
import { volumeBounds } from './validate/geometry';

/**
 * Parts built but not shown in the default map view, so interiors read from above
 * (EXECUTION-PLAN Ex4). They stay in the scene graph; the cutaway system (Ex6) toggles them.
 */
export const HIDDEN_BY_DEFAULT: ReadonlySet<MeshPart> = new Set<MeshPart>(['ceiling']);

export interface BuiltStructure {
  readonly root: Group;
  /** Topology nodes this structure draws (the box view skips them). */
  readonly roomIds: ReadonlySet<string>;
  /** Edges this structure draws as real stairs/doorways (no connector bars for them). */
  readonly connectionIds: ReadonlySet<string>;
  /** Every mesh tagged `kind: 'room'`, by room id. */
  readonly roomParts: ReadonlyMap<string, readonly Mesh[]>;
  /** Union of each room's volumes; used for focus and screen-point sampling. */
  readonly roomBounds: ReadonlyMap<string, Bounds>;
  /** Advances animated parts to `nowMs`; returns true when anything moved. */
  tick(nowMs: number): boolean;
}

export interface Spinner {
  readonly object: Object3D;
  readonly primitive: RingPrimitive;
}

function label(text: string, className: string): CSS2DObject {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  return new CSS2DObject(el);
}

/**
 * Element label: feature labels as such; otherwise doors read as door labels and edges (the
 * INF-E bypass) as edge labels.
 */
function elementLabel(element: StructureElement, text: string): CSS2DObject {
  const { primitive, tag } = element;
  const at =
    element.labelAt ??
    (primitive.type === 'doorway'
      ? ([
          primitive.sill[0],
          primitive.sill[1] + primitive.height + 0.6,
          primitive.sill[2],
        ] as const)
      : null);
  if (!at) throw new Error(`Label "${text}" on ${tag.id}:${tag.part} needs labelAt`);
  const object = label(
    text,
    element.labelKind === 'feature'
      ? 'feature-label'
      : tag.kind === 'connection'
        ? 'edge-label'
        : 'door-label',
  );
  object.position.set(...at);
  return object;
}

/** Builds a description's elements and labels into a new group; rings come back as spinners. */
function buildElements(d: StructureDescription): {
  readonly root: Group;
  readonly spinners: readonly Spinner[];
} {
  const root = new Group();
  root.name = d.id;
  const materials = new MaterialCache();
  const spinners: Spinner[] = [];
  for (const element of d.elements) {
    const objects = buildPrimitive(element.primitive, element.tag, materials, element.tone);
    if (HIDDEN_BY_DEFAULT.has(element.tag.part)) {
      for (const object of objects) object.visible = false;
    }
    root.add(...objects);
    if (element.primitive.type === 'ring') {
      for (const object of objects) spinners.push({ object, primitive: element.primitive });
    }
    if (element.label !== undefined) root.add(elementLabel(element, element.label));
  }
  for (const l of d.labels) {
    const tag = label(l.roomId, 'room-label');
    tag.position.set(...l.position);
    root.add(tag);
  }
  return { root, spinners };
}

/** Every mesh under `root` tagged `kind: 'room'`, by room id. */
function partsByRoom(root: Group): Map<string, Mesh[]> {
  const roomParts = new Map<string, Mesh[]>();
  root.traverse((o) => {
    if (o instanceof Mesh && isMeshTag(o.userData) && o.userData.kind === 'room') {
      roomParts.set(o.userData.id, [...(roomParts.get(o.userData.id) ?? []), o]);
    }
  });
  return roomParts;
}

/** Builds the description; rings are returned as spinners for the caller to animate. */
export function buildStructure(d: StructureDescription): {
  readonly structure: Omit<BuiltStructure, 'tick'>;
  readonly spinners: readonly Spinner[];
} {
  const { root, spinners } = buildElements(d);
  const parts = partsByRoom(root);
  const roomParts = new Map<string, Mesh[]>(d.roomIds.map((id) => [id, parts.get(id) ?? []]));
  const roomBounds = new Map<string, Bounds>();
  for (const id of d.roomIds) {
    const list = d.volumes.filter((v) => v.ownerId === id).map(volumeBounds);
    if (list.length === 0) throw new Error(`${d.id}: room ${id} has no volume`);
    roomBounds.set(id, unionBounds(list));
  }

  return {
    structure: {
      root,
      roomIds: new Set(d.roomIds),
      connectionIds: new Set(d.paths.map((p) => p.connectionId)),
      roomParts,
      roomBounds,
    },
    spinners,
  };
}

/** Builds a description with no animated parts. */
export function buildStaticStructure(d: StructureDescription): BuiltStructure {
  const { structure, spinners } = buildStructure(d);
  if (spinners.length > 0) throw new Error(`${d.id} has animated parts; give it a tick`);
  return { ...structure, tick: () => false };
}

/**
 * Detail added to rooms another structure already draws (the lazily loaded hero rooms,
 * Execution 5). It replaces no room: its room-tagged meshes join those rooms' pickable parts.
 */
export interface BuiltDressing {
  readonly root: Group;
  readonly roomParts: ReadonlyMap<string, readonly Mesh[]>;
}

/** Builds a dressing description (no rooms of its own, no animated parts). */
export function buildDressing(d: StructureDescription): BuiltDressing {
  if (d.roomIds.length > 0) throw new Error(`${d.id} replaces rooms; build it as a structure`);
  const { root, spinners } = buildElements(d);
  if (spinners.length > 0) throw new Error(`${d.id} has animated parts`);
  return { root, roomParts: partsByRoom(root) };
}
