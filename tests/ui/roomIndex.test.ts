// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { ROOMS } from '../../src/data/rooms';
import {
  groupPlacedRooms,
  renderRoomIndex,
  setIndexSelection,
  strongestGrade,
} from '../../src/ui/roomIndex';

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

  it('makes each room a button that selects it', () => {
    const container = document.createElement('div');
    const onSelect = vi.fn();
    renderRoomIndex(container, ROOMS, onSelect);
    const button = container.querySelector<HTMLButtonElement>('button[data-room-id="L-01"]');
    expect(button?.type).toBe('button');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    button?.click();
    expect(onSelect).toHaveBeenCalledWith('L-01');
  });

  it('marks only the selected room as pressed', () => {
    const container = document.createElement('div');
    const nav = renderRoomIndex(container, ROOMS);
    setIndexSelection(nav, 'ENG-01');
    const pressed = [...nav.querySelectorAll('button[aria-pressed="true"]')];
    expect(pressed.map((b) => b.getAttribute('data-room-id'))).toEqual(['ENG-01']);
    setIndexSelection(nav, null);
    expect(nav.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(0);
  });
});
