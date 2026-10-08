// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { ROOMS } from '../../src/data/rooms';
import { groupPlacedRooms, renderRoomIndex, strongestGrade } from '../../src/ui/roomIndex';

describe('room index', () => {
  it('groups only placed rooms by region in register order', () => {
    const groups = groupPlacedRooms(ROOMS);
    expect(groups.map((g) => g.region)).toEqual([
      'control-nexus',
      'cultural',
      'maintenance',
      'power-core',
    ]);
    const listed = groups.flatMap((g) => g.rooms.map((r) => r.id));
    expect(listed).toHaveLength(ROOMS.filter((r) => r.placed).length);
    expect(listed).not.toContain('X-01');
    expect(listed).not.toContain('O-01');
  });

  it('reports the strongest evidence grade', () => {
    const library = ROOMS.find((r) => r.id === 'L-01');
    expect(library && strongestGrade(library)).toBe('A');
  });

  it('renders an accessible navigation landmark with one item per placed room', () => {
    const container = document.createElement('div');
    const nav = renderRoomIndex(container, ROOMS);
    expect(nav.getAttribute('aria-label')).toBe('Rooms');
    const items = container.querySelectorAll('li[data-room-id]');
    expect(items).toHaveLength(ROOMS.filter((r) => r.placed).length);
    const headings = [...container.querySelectorAll('h2')].map((h) => h.textContent);
    expect(headings).toEqual([
      'Control nexus',
      'Cultural spine',
      'Maintenance spine',
      'Power core',
    ]);
    for (const list of container.querySelectorAll('ul')) {
      expect(container.querySelector(`#${list.getAttribute('aria-labelledby')}`)).not.toBeNull();
    }
  });
});
