// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { getRoom } from '../../src/data/rooms';
import { renderInfoPanel } from '../../src/ui/infoPanel';

function setup(id: string) {
  const room = getRoom(id);
  if (!room) throw new Error(`no room ${id}`);
  const container = document.createElement('section');
  const actions = { onFocus: vi.fn(), onClose: vi.fn() };
  renderInfoPanel(container, room, actions);
  return { room, container, actions };
}

describe('info panel', () => {
  it('shows name, appearances and each evidence axis separately', () => {
    const { room, container } = setup('L-01');
    expect(container.hidden).toBe(false);
    expect(container.querySelector('h2')?.textContent).toBe(room.name);
    const terms = [...container.querySelectorAll('dt')].map((d) => d.textContent);
    expect(terms).toEqual(['Presence', 'Appearance', 'Scale', 'State']);
    const values = [...container.querySelectorAll('dd')].map((d) => d.textContent);
    expect(values[0]).toBe(room.axes.presence.replaceAll('_', ' '));
    const appearances = container.querySelectorAll('ul:not(.evidence-records) li');
    expect(appearances).toHaveLength(room.appearances.length);
  });

  it('lists every evidence record with its grade and resolved source links', () => {
    const { room, container } = setup('E-01');
    const records = container.querySelectorAll<HTMLElement>('.evidence-records li');
    expect(records).toHaveLength(room.evidence.length);
    records.forEach((li, i) => {
      const record = room.evidence[i];
      if (!record) throw new Error(`no evidence record ${i}`);
      expect(li.dataset.grade).toBe(record.grade);
      expect(li.textContent).toContain(`Grade ${record.grade}`);
      const links = [...li.querySelectorAll('a')].map((a) => a.textContent);
      expect(links).toEqual(record.sourceIds);
    });
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toMatch(/^https?:\/\//);
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('shows observed states alongside the snapshot state', () => {
    const { room, container } = setup('ARS-01');
    const state = [...container.querySelectorAll('dd')].at(-1)?.textContent ?? '';
    expect(state.startsWith(room.state)).toBe(true);
    for (const s of room.observedStates) expect(state).toContain(s);
  });

  it('wires Focus, Details and Close', () => {
    const { container, actions } = setup('S-01');
    const button = (name: string) =>
      [...container.querySelectorAll('button')].find((b) => b.textContent === name);
    button('Focus')?.click();
    expect(actions.onFocus).toHaveBeenCalledWith('S-01');
    expect(container.dataset.collapsed).toBe('true');
    button('Details')?.click();
    expect(container.dataset.collapsed).toBe('false');
    expect(button('Details')?.getAttribute('aria-expanded')).toBe('true');
    button('Close')?.click();
    expect(actions.onClose).toHaveBeenCalled();
  });

  it('hides and empties itself when nothing is selected', () => {
    const { container } = setup('S-01');
    renderInfoPanel(container, null, { onFocus: () => undefined, onClose: () => undefined });
    expect(container.hidden).toBe(true);
    expect(container.childElementCount).toBe(0);
  });
});
