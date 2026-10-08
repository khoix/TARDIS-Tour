/**
 * Build step of describe → build: turns a {@link StructureDescription} into a scene group
 * with the kit. Pure data in, tagged meshes out; nothing here decides geometry.
 */

import { type Object3D, Group, Mesh } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { type Bounds, unionBounds } from '../scene/camera/isometric';
import { buildPrimitive, MaterialCache } from './kit';
import { isMeshTag, type RingPrimitive, type StructureDescription } from './structure';
import { volumeBounds } from './validate/geometry';

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

/** Builds the description; rings are returned as spinners for the caller to animate. */
export function buildStructure(d: StructureDescription): {
  readonly structure: Omit<BuiltStructure, 'tick'>;
  readonly spinners: readonly Spinner[];
} {
  const root = new Group();
  root.name = d.id;
  const materials = new MaterialCache();
  const spinners: Spinner[] = [];
  for (const element of d.elements) {
    const objects = buildPrimitive(element.primitive, element.tag, materials);
    root.add(...objects);
    if (element.primitive.type === 'ring') {
      for (const object of objects) spinners.push({ object, primitive: element.primitive });
    }
    if (element.label !== undefined && element.primitive.type === 'doorway') {
      const { sill, height } = element.primitive;
      const tag = label(element.label, 'door-label');
      tag.position.set(sill[0], sill[1] + height + 0.6, sill[2]);
      root.add(tag);
    }
  }
  for (const l of d.labels) {
    const tag = label(l.roomId, 'room-label');
    tag.position.set(...l.position);
    root.add(tag);
  }

  const roomParts = new Map<string, Mesh[]>(d.roomIds.map((id) => [id, []]));
  root.traverse((o) => {
    if (o instanceof Mesh && isMeshTag(o.userData) && o.userData.kind === 'room') {
      roomParts.get(o.userData.id)?.push(o);
    }
  });
  const roomBounds = new Map<string, Bounds>();
  for (const id of d.roomIds) {
    const list = d.volumes.filter((v) => v.roomId === id).map(volumeBounds);
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
