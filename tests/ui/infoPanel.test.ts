// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { CONNECTIONS, V1_CONNECTIONS } from '../../src/data/connections';
import { getSource } from '../../src/data/evidence';
import { getRoom } from '../../src/data/rooms';
import { connectionAxis, renderInfoPanel } from '../../src/ui/infoPanel';

function setup(id: string) {
  const room = getRoom(id);
  if (!room) throw new Error(`no room ${id}`);
  const container = document.createElement('section');
  const actions = { onFocus: vi.fn(), onClose: vi.fn(), onRouteToConsole: vi.fn() };
  renderInfoPanel(container, room, actions, V1_CONNECTIONS);
  return { room, container, actions };
}

describe('info panel', () => {
  it('shows name, appearances and each evidence axis separately', () => {
    const { room, container } = setup('L-01');
    expect(container.hidden).toBe(false);
    expect(container.querySelector('h2')?.textContent).toBe(room.name);
    const terms = [...container.querySelectorAll('dt')].map((d) => d.textContent);
    expect(terms).toEqual(['Presence', 'Appearance', 'Scale', 'Connection', 'State']);
    const values = [...container.querySelectorAll('dd')].map((d) => d.textContent);
    expect(values[0]).toBe(room.axes.presence.replaceAll('_', ' '));
    const appearances = container.querySelectorAll('ul:not(.evidence-records, .source-list) li');
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

  it('gives the connection axis per edge, never blended', () => {
    const room = getRoom('ENG-01');
    if (!room) throw new Error('no ENG-01');
    const axis = connectionAxis(room, V1_CONNECTIONS);
    const parts = axis.split('; ');
    expect(parts).toHaveLength(2);
    expect(parts.some((p) => p.startsWith('B28 to E-V: portal (TV-S'))).toBe(true);
    expect(parts.some((p) => p.startsWith('B37 to M-02: inferred (INF-E'))).toBe(true);
    const { container } = setup('ENG-01');
    expect([...container.querySelectorAll('dd')][3]?.textContent).toBe(axis);
  });

  it('marks deferred edges in the connection axis', () => {
    const room = getRoom('H-02');
    if (!room) throw new Error('no H-02');
    const deferred = CONNECTIONS.filter(
      (c) => c.buildStatus === 'deferred' && (c.from.room === 'H-02' || c.to.room === 'H-02'),
    );
    expect(deferred.length).toBeGreaterThan(0);
    const axis = connectionAxis(room, CONNECTIONS);
    for (const c of deferred) expect(axis).toMatch(new RegExp(`${c.id} to [^;]*not built in v1`));
  });

  it('shows a known-vs-inferred indicator for the space, separate from its placement', () => {
    const { container } = setup('L-01');
    const indicator = container.querySelector<HTMLElement>('.known-indicator');
    expect(indicator?.dataset.evidenceClass).toBe('sourced');
    expect(indicator?.textContent).toMatch(/^Sourced space — .*Placement and size are authored/);
  });

  it('resolves every cited source once, with its title and links', () => {
    const { room, container } = setup('E-01');
    const ids = [...new Set(room.evidence.flatMap((r) => r.sourceIds))];
    const items = [...container.querySelectorAll('.source-list li')];
    expect(items).toHaveLength(ids.length);
    items.forEach((li, i) => {
      const source = getSource(ids[i] as string);
      if (!source) throw new Error(`unresolved ${ids[i]}`);
      expect(li.textContent).toContain(source.title);
      const links = [...li.querySelectorAll('a')].map((a) => a.getAttribute('href'));
      expect(links).toEqual(source.urls);
    });
  });

  it('routes to the console, except from the console itself', () => {
    const { container, actions } = setup('ENG-01');
    const route = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === 'Route to console',
    );
    route?.click();
    expect(actions.onRouteToConsole).toHaveBeenCalledWith('ENG-01');
    const consoleRoom = setup('C-M').container;
    const disabled = [...consoleRoom.querySelectorAll('button')].find(
      (b) => b.textContent === 'Route to console',
    );
    expect(disabled?.disabled).toBe(true);
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
    const noop = () => undefined;
    renderInfoPanel(
      container,
      null,
      { onFocus: noop, onClose: noop, onRouteToConsole: noop },
      V1_CONNECTIONS,
    );
    expect(container.hidden).toBe(true);
    expect(container.childElementCount).toBe(0);
  });
});
