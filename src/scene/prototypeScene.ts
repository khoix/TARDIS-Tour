/**
 * Connected topology view: built structures (describe → build) for the rooms they cover,
 * and one labelled box per remaining placed room with orthogonal connector segments per
 * remaining v1 edge. Boxes are replaced room by room as structures arrive.
 */

import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { RoomTransform } from '../data/layout';
import type { Connection, RegionId, RoomNode } from '../data/types';
import { REGION_LABELS } from '../ui/roomIndex';
import type { BuiltStructure } from '../world/build';
import {
  evidenceClassOfPresence,
  evidenceClassOfProvenance,
  type MeshTag,
} from '../world/structure';
import { boundsCenter, unionBounds, type Bounds } from './camera/isometric';
import { connectorLegs, roomBounds, walkPoint } from './topology';

export const REGION_COLORS: Readonly<Record<RegionId, number>> = {
  'control-nexus': 0x3f8fa8,
  cultural: 0xb9895a,
  residential: 0x9a7fb0,
  maintenance: 0x6f7f86,
  'power-core': 0xb4553a,
  quiet: 0x7f9a83,
  archive: 0x8b8b6a,
  reserved: 0x555555,
};

const CONNECTOR_COLOR = 0x9fb7bd;
const PORTAL_COLOR = 0xc04fd8;
const CONNECTOR_THICKNESS_NU = 0.8;
export const SELECTED_EMISSIVE = 0xe8913a;

export interface PrototypeScene {
  readonly root: Group;
  /** Pickable meshes (`userData.kind === 'room'`) of each placed room. */
  readonly roomParts: ReadonlyMap<string, readonly Mesh[]>;
  readonly roomBounds: ReadonlyMap<string, Bounds>;
  readonly regionBounds: ReadonlyMap<RegionId, Bounds>;
  readonly overview: Bounds;
  /** Advances animated structures; returns true when the frame needs re-rendering. */
  tick(nowMs: number): boolean;
}

function label(text: string, className: string): CSS2DObject {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  return new CSS2DObject(el);
}

export function buildPrototypeScene(
  rooms: readonly RoomNode[],
  connections: readonly Connection[],
  layout: readonly RoomTransform[],
  structures: readonly BuiltStructure[] = [],
): PrototypeScene {
  const root = new Group();
  root.name = 'topology';
  const transforms = new Map(layout.map((t) => [t.roomId, t]));
  const roomParts = new Map<string, readonly Mesh[]>();
  const boundsById = new Map<string, Bounds>();
  const byRegion = new Map<RegionId, Bounds[]>();
  const builtEdges = new Set(structures.flatMap((s) => [...s.connectionIds]));

  for (const room of rooms) {
    if (!room.placed) continue;
    const structure = structures.find((s) => s.roomIds.has(room.id));
    if (structure) {
      const parts = structure.roomParts.get(room.id);
      const b = structure.roomBounds.get(room.id);
      if (!parts?.length || !b) throw new Error(`Structure has no meshes for room ${room.id}`);
      roomParts.set(room.id, parts);
      boundsById.set(room.id, b);
      byRegion.set(room.region, [...(byRegion.get(room.region) ?? []), b]);
      continue;
    }
    const t = transforms.get(room.id);
    if (!t) throw new Error(`No layout transform for placed room ${room.id}`);
    const b = roomBounds(t);
    const [w, h, d] = t.size;
    const geometry = new BoxGeometry(w, h, d);
    const mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({
        color: REGION_COLORS[room.region],
        roughness: 0.8,
        metalness: 0.1,
      }),
    );
    mesh.name = room.id;
    mesh.position.set(...boundsCenter(b));
    mesh.userData = {
      kind: 'room',
      id: room.id,
      part: 'volume',
      evidenceClass: evidenceClassOfPresence(room.axes.presence),
    } satisfies MeshTag;
    const outline = new LineSegments(
      new EdgesGeometry(geometry),
      new LineBasicMaterial({ color: 0x0b1418 }),
    );
    outline.raycast = () => undefined;
    mesh.add(outline);
    const tag = label(room.id, 'room-label');
    tag.position.set(0, h / 2 + 0.5, 0);
    mesh.add(tag);
    root.add(mesh);

    roomParts.set(room.id, [mesh]);
    boundsById.set(room.id, b);
    byRegion.set(room.region, [...(byRegion.get(room.region) ?? []), b]);
  }

  for (const c of connections) {
    if (c.buildStatus !== 'v1' || builtEdges.has(c.id)) continue;
    const a = transforms.get(c.from.room);
    const b = transforms.get(c.to.room);
    if (!a || !b) throw new Error(`Connection ${c.id} ends at an unplaced room`);
    const material = new MeshStandardMaterial({
      color: c.portal ? PORTAL_COLOR : CONNECTOR_COLOR,
      roughness: 0.6,
    });
    const group = new Group();
    group.name = c.id;
    for (const leg of connectorLegs(walkPoint(a), walkPoint(b))) {
      const length = Math.abs(
        leg.axis === 'x'
          ? leg.to[0] - leg.from[0]
          : leg.axis === 'y'
            ? leg.to[1] - leg.from[1]
            : leg.to[2] - leg.from[2],
      );
      // Extend each leg by the thickness so consecutive legs meet without a gap at corners.
      const span = length + CONNECTOR_THICKNESS_NU;
      const size: [number, number, number] = [
        leg.axis === 'x' ? span : CONNECTOR_THICKNESS_NU,
        leg.axis === 'y' ? span : CONNECTOR_THICKNESS_NU,
        leg.axis === 'z' ? span : CONNECTOR_THICKNESS_NU,
      ];
      const segment = new Mesh(new BoxGeometry(...size), material);
      segment.position.set(
        (leg.from[0] + leg.to[0]) / 2,
        (leg.from[1] + leg.to[1]) / 2,
        (leg.from[2] + leg.to[2]) / 2,
      );
      segment.userData = {
        kind: 'connection',
        id: c.id,
        part: 'connector',
        evidenceClass: evidenceClassOfProvenance(c.provenance),
      } satisfies MeshTag;
      group.add(segment);
    }
    root.add(group);
  }

  for (const s of structures) root.add(s.root);

  const regionBounds = new Map<RegionId, Bounds>();
  for (const [region, list] of byRegion) {
    const rb = unionBounds(list);
    regionBounds.set(region, rb);
    const tag = label(REGION_LABELS[region], 'region-label');
    const c = boundsCenter(rb);
    tag.position.set(c[0], rb.max[1] + 3, c[2]);
    root.add(tag);
  }

  return {
    root,
    roomParts,
    roomBounds: boundsById,
    regionBounds,
    overview: unionBounds([...boundsById.values()]),
    tick(nowMs) {
      let moved = false;
      for (const s of structures) moved = s.tick(nowMs) || moved;
      return moved;
    },
  };
}
