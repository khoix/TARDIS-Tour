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

/**
 * Renders an accessible, region-grouped index of placed rooms into `container`. Each room is a
 * button; activating it calls `onSelect` with the room id.
 */
export function renderRoomIndex(
  container: HTMLElement,
  rooms: readonly RoomNode[],
  onSelect?: (id: string) => void,
): HTMLElement {
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
      const button = doc.createElement('button');
      button.type = 'button';
      button.dataset.roomId = room.id;
      button.setAttribute('aria-pressed', 'false');
      if (onSelect) button.addEventListener('click', () => onSelect(room.id));
      const name = doc.createElement('span');
      name.className = 'room-name';
      name.textContent = room.name;
      const meta = doc.createElement('span');
      meta.className = 'room-meta';
      const grade = strongestGrade(room);
      meta.textContent = `${room.id} · strongest evidence ${grade ?? '—'}`;
      button.append(name, ' ', meta);
      item.append(button);
      list.append(item);
    }
    section.append(list);
    nav.append(section);
  }

  container.replaceChildren(nav);
  return nav;
}

/** Marks the index button for `id` as pressed (and every other as not pressed). */
export function setIndexSelection(nav: HTMLElement, id: string | null): void {
  for (const button of nav.querySelectorAll<HTMLButtonElement>('button[data-room-id]')) {
    button.setAttribute('aria-pressed', String(button.dataset.roomId === id));
  }
}
