/**
 * Progressive labels (Execution 7). The label layer carries a mode, and CSS shows each kind of
 * label in the modes it belongs to (src/style.css):
 * - `default`: region labels, plus the selected room (name) and the rooms on a route;
 * - `research`: room and edge evidence grades, and the source notes (reported doors, the INF-E
 *   bypass, the reconfiguring door, the portal);
 * - `structure`: room IDs, door anchors and edges (ID and kind).
 * Labels scale with zoom, and the dense kinds (anchors, edges) appear only once zoomed in. The
 * visual state still owns each label's visibility (section clip) and dimming (isolation); modes
 * only add CSS rules on top, so both must allow a label for it to show.
 */

import { Group, type Object3D } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Vec3 } from '../../data/layout';
import type { Connection, EvidenceRecord, RoomNode } from '../../data/types';
import { type LabelOwner, label } from '../../world/build';
import type { AnchorPlacement } from '../../world/structure';
import { edgeKindLabel, type Route } from '../navigation/routes';

export const LABEL_MODES = ['default', 'research', 'structure'] as const;
export type LabelMode = (typeof LABEL_MODES)[number];

export const LABEL_MODE_NAMES: Readonly<Record<LabelMode, string>> = {
  default: 'Regions',
  research: 'Research',
  structure: 'Structure',
};

/** Zoom bands: anchors and edge labels need `mid` or closer. */
export type ZoomBand = 'far' | 'mid' | 'near';
export const MID_ZOOM = 1;
export const NEAR_ZOOM = 2.5;
const MIN_LABEL_SCALE = 0.85;
const MAX_LABEL_SCALE = 1.35;

/** Label size factor and band for a camera zoom. */
export function labelZoom(zoom: number): { readonly scale: number; readonly band: ZoomBand } {
  const scale = Math.min(MAX_LABEL_SCALE, Math.max(MIN_LABEL_SCALE, 0.75 + 0.25 * zoom));
  const band: ZoomBand = zoom >= NEAR_ZOOM ? 'near' : zoom >= MID_ZOOM ? 'mid' : 'far';
  return { scale: Math.round(scale * 100) / 100, band };
}

/** Applies {@link labelZoom} to the label layer (a CSS variable and a data attribute). */
export function applyLabelZoom(layer: HTMLElement, zoom: number): void {
  const { scale, band } = labelZoom(zoom);
  layer.style.setProperty('--label-scale', String(scale));
  layer.dataset.zoom = band;
}

/** The distinct grades of a set of records, best first, e.g. `grade A C`. Never one score. */
export function gradesText(records: readonly EvidenceRecord[]): string {
  const grades = [...new Set(records.map((r) => r.grade))].sort();
  return grades.length === 0 ? 'ungraded' : `grade ${grades.join(' ')}`;
}

/** Point halfway along a polyline. */
export function midpoint(points: readonly Vec3[]): Vec3 {
  const first = points[0];
  if (!first) throw new Error('Empty polyline');
  const seg = (i: number) => {
    const a = points[i - 1] as Vec3;
    const b = points[i] as Vec3;
    return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  };
  let total = 0;
  for (let i = 1; i < points.length; i++) total += seg(i);
  let left = total / 2;
  for (let i = 1; i < points.length; i++) {
    const len = seg(i);
    if (left <= len && len > 0) {
      const a = points[i - 1] as Vec3;
      const b = points[i] as Vec3;
      const t = left / len;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    left -= len;
  }
  return first;
}

function span(doc: Document, className: string, text: string): HTMLSpanElement {
  const s = doc.createElement('span');
  s.className = className;
  s.textContent = text;
  return s;
}

/** Height of edge and anchor labels above the walk line or floor they name. */
const LABEL_LIFT_NU = 1.2;

export interface LabelWorld {
  readonly walkLines: ReadonlyMap<string, readonly Vec3[]>;
  readonly anchors: readonly AnchorPlacement[];
}

interface Entry {
  readonly element: HTMLElement;
  readonly owner: LabelOwner;
}

export class LabelSystem {
  private current: LabelMode = 'default';
  private selected: string | null = null;
  private route: Route | null = null;
  private readonly entries: Entry[] = [];
  private readonly seen = new Set<Object3D>();
  private readonly rooms: ReadonlyMap<string, RoomNode>;
  private readonly connections: ReadonlyMap<string, Connection>;

  constructor(
    private readonly layer: HTMLElement,
    rooms: readonly RoomNode[],
    connections: readonly Connection[],
  ) {
    this.rooms = new Map(rooms.map((r) => [r.id, r]));
    this.connections = new Map(connections.map((c) => [c.id, c]));
    layer.dataset.labelMode = this.current;
  }

  /**
   * New labels for the structure and research modes: one per built edge at its walk line's
   * midpoint, and one per door anchor. Add the group to the world, then {@link register} it.
   */
  createLabels(world: LabelWorld): Group {
    const group = new Group();
    group.name = 'labels';
    for (const [id, line] of world.walkLines) {
      const c = this.connections.get(id);
      if (!c) continue;
      const object = label('', 'connection-label', { kind: 'connection', id });
      const doc = object.element.ownerDocument;
      object.element.append(
        span(doc, 'label-id', id),
        span(doc, 'label-kind', ` · ${edgeKindLabel(c.kind)}`),
        span(doc, 'label-grades', ` · ${c.provenance} · ${gradesText(c.evidence)}`),
      );
      const [x, y, z] = midpoint(line);
      object.position.set(x, y + LABEL_LIFT_NU, z);
      group.add(object);
    }
    for (const a of world.anchors) {
      const object = label(a.anchorId, 'anchor-label', { kind: 'room', id: a.roomId });
      object.element.classList.toggle('is-closed', a.state === 'closed');
      object.position.set(a.position[0], a.position[1] + LABEL_LIFT_NU, a.position[2]);
      group.add(object);
    }
    return group;
  }

  /** Takes over every label under `root`; room labels gain their name and grades. */
  register(root: Object3D): void {
    root.traverse((o) => {
      if (!(o instanceof CSS2DObject) || this.seen.has(o)) return;
      this.seen.add(o);
      const owner = o.userData.labelOf as LabelOwner | undefined;
      if (!owner) return;
      if (o.element.classList.contains('room-label')) this.decorateRoom(o.element, owner.id);
      this.entries.push({ element: o.element, owner });
    });
    this.apply();
  }

  mode(): LabelMode {
    return this.current;
  }

  setMode(mode: LabelMode): void {
    this.current = mode;
    this.layer.dataset.labelMode = mode;
  }

  setSelection(id: string | null): void {
    this.selected = id;
    this.apply();
  }

  setRoute(route: Route | null): void {
    this.route = route;
    this.apply();
  }

  private decorateRoom(element: HTMLElement, id: string): void {
    const room = this.rooms.get(id);
    if (!room) return;
    const doc = element.ownerDocument;
    element.replaceChildren(
      span(doc, 'label-id', id),
      span(doc, 'label-name', ` · ${room.name}`),
      span(doc, 'label-grades', ` · ${gradesText(room.evidence)}`),
    );
  }

  private apply(): void {
    const routeRooms = new Set(this.route?.rooms ?? []);
    const routeEdges = new Set(this.route?.connections ?? []);
    for (const { element, owner } of this.entries) {
      element.classList.toggle('is-selected', owner.kind === 'room' && owner.id === this.selected);
      element.classList.toggle(
        'on-route',
        (owner.kind === 'room' && routeRooms.has(owner.id)) ||
          (owner.kind === 'connection' && routeEdges.has(owner.id)),
      );
    }
  }
}
