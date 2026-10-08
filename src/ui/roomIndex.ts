import type { Grade, RegionId, RoomNode } from '../data/types';

export const REGION_LABELS: Readonly<Record<RegionId, string>> = {
  'control-nexus': 'Control nexus',
  cultural: 'Cultural spine',
  residential: 'Residential wing',
  maintenance: 'Maintenance spine',
  'power-core': 'Power core',
  quiet: 'Quiet wing',
  archive: 'Archive',
  reserved: 'Reserved',
};

export interface RoomIndexGroup {
  readonly region: RegionId;
  readonly label: string;
  readonly rooms: readonly RoomNode[];
}

/** Placed rooms grouped by region, in register order. Unplaced inventory is never listed. */
export function groupPlacedRooms(rooms: readonly RoomNode[]): RoomIndexGroup[] {
  const groups = new Map<RegionId, RoomNode[]>();
  for (const room of rooms) {
    if (!room.placed) continue;
    const list = groups.get(room.region) ?? [];
    list.push(room);
    groups.set(room.region, list);
  }
  return [...groups].map(([region, list]) => ({
    region,
    label: REGION_LABELS[region],
    rooms: list,
  }));
}

/** Strongest grade among a room's evidence records (A strongest). */
export function strongestGrade(room: RoomNode): Grade | null {
  let best: Grade | null = null;
  for (const record of room.evidence) {
    if (best === null || record.grade < best) best = record.grade;
  }
  return best;
}

/** Renders an accessible, region-grouped index of placed rooms into `container`. */
export function renderRoomIndex(container: HTMLElement, rooms: readonly RoomNode[]): HTMLElement {
  const doc = container.ownerDocument;
  const nav = doc.createElement('nav');
  nav.className = 'room-index';
  nav.setAttribute('aria-label', 'Rooms');

  for (const group of groupPlacedRooms(rooms)) {
    const section = doc.createElement('section');
    const heading = doc.createElement('h2');
    heading.id = `region-${group.region}`;
    heading.textContent = group.label;
    section.append(heading);

    const list = doc.createElement('ul');
    list.setAttribute('aria-labelledby', heading.id);
    for (const room of group.rooms) {
      const item = doc.createElement('li');
      item.dataset.roomId = room.id;
      const name = doc.createElement('span');
      name.className = 'room-name';
      name.textContent = room.name;
      const meta = doc.createElement('span');
      meta.className = 'room-meta';
      const grade = strongestGrade(room);
      meta.textContent = `${room.id} · strongest evidence ${grade ?? '—'}`;
      item.append(name, ' ', meta);
      list.append(item);
    }
    section.append(list);
    nav.append(section);
  }

  container.replaceChildren(nav);
  return nav;
}
