/**
 * Crude, connected topology view: one labelled box per placed room and orthogonal
 * connector segments per v1 edge. Replaced room by room from Execution 3 onwards.
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

export interface RoomUserData {
  readonly kind: 'room';
  readonly id: string;
}

export interface ConnectionUserData {
  readonly kind: 'connection';
  readonly id: string;
}

export interface PrototypeScene {
  readonly root: Group;
  readonly roomMeshes: ReadonlyMap<string, Mesh>;
  readonly roomBounds: ReadonlyMap<string, Bounds>;
  readonly regionBounds: ReadonlyMap<RegionId, Bounds>;
  readonly overview: Bounds;
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
): PrototypeScene {
  const root = new Group();
  root.name = 'topology';
  const transforms = new Map(layout.map((t) => [t.roomId, t]));
  const roomMeshes = new Map<string, Mesh>();
  const boundsById = new Map<string, Bounds>();
  const byRegion = new Map<RegionId, Bounds[]>();

  for (const room of rooms) {
    if (!room.placed) continue;
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
    mesh.userData = { kind: 'room', id: room.id } satisfies RoomUserData;
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

    roomMeshes.set(room.id, mesh);
    boundsById.set(room.id, b);
    byRegion.set(room.region, [...(byRegion.get(room.region) ?? []), b]);
  }

  for (const c of connections) {
    if (c.buildStatus !== 'v1') continue;
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
      segment.userData = { kind: 'connection', id: c.id } satisfies ConnectionUserData;
      group.add(segment);
    }
    root.add(group);
  }

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
    roomMeshes,
    roomBounds: boundsById,
    regionBounds,
    overview: unionBounds([...boundsById.values()]),
  };
}
