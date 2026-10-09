// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { PLACED_ROOMS, ROOMS } from '../../src/data/rooms';
import { planRoute, type Route } from '../../src/systems/navigation/routes';
import {
  EMPTY_ROUTE_QUERY,
  renderRoutePanel,
  routeSummary,
  stepText,
} from '../../src/ui/routePanel';
import { describeTier1Map } from '../../src/world/skeleton';

const walkLines = new Map(describeTier1Map().paths.map((p) => [p.connectionId, p.points]));
const plan = (from: string, to: string, allowPortal = false) =>
  planRoute(
    from,
    to,
    PLACED_ROOMS.map((r) => r.id),
    V1_CONNECTIONS,
    walkLines,
    {
      allowPortal,
    },
  ) as Route;

function setup() {
  const container = document.createElement('section');
  document.body.replaceChildren(container);
  const actions = { onChange: vi.fn(), onClear: vi.fn() };
  const panel = renderRoutePanel(container, ROOMS, actions);
  panel.sync(EMPTY_ROUTE_QUERY, null);
  return { container, actions, panel };
}

describe('route panel', () => {
  it('lists every placed room, and only those, in both selectors', () => {
    const { container } = setup();
    for (const id of ['route-from', 'route-to']) {
      const select = container.querySelector<HTMLSelectElement>(`#${id}`);
      const values = [...(select?.options ?? [])].map((o) => o.value).filter(Boolean);
      expect(values.sort()).toEqual(PLACED_ROOMS.map((r) => r.id).sort());
      expect(container.querySelector(`label[for="${id}"]`)).not.toBeNull();
    }
  });

  it('reports selector, portal and clear changes', () => {
    const { container, actions } = setup();
    const from = container.querySelector<HTMLSelectElement>('#route-from');
    if (!from) throw new Error('no from');
    from.value = 'L-01';
    from.dispatchEvent(new Event('change'));
    expect(actions.onChange).toHaveBeenLastCalledWith({ from: 'L-01' });
    container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    expect(actions.onChange).toHaveBeenLastCalledWith({ allowPortal: true });
    const clear = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === 'Clear route',
    );
    expect(clear?.disabled).toBe(true);
  });

  it('shows the step list in order, naming each edge kind', () => {
    const { container, panel } = setup();
    const route = plan('ENG-01', 'C-M');
    panel.sync({ from: 'ENG-01', to: 'C-M', allowPortal: false }, route);
    const steps = [...container.querySelectorAll<HTMLElement>('.route-steps li')];
    expect(steps.map((s) => s.dataset.connectionId)).toEqual(route.connections);
    expect(steps[0]?.textContent).toMatch(/^Corridor · B37: .*\(ENG-01\) → .*\(M-02\)$/);
    expect(steps.at(-1)?.textContent).toMatch(/^Stairs · B03: .*\(C-L\) → .*\(C-M\)$/);
    expect(container.querySelector('.route-summary')?.textContent).toMatch(
      /^5 steps · \d+\.\d NU walked$/,
    );
  });

  it('summarises incomplete, impossible, trivial and portal routes', () => {
    expect(routeSummary(EMPTY_ROUTE_QUERY, null)).toBe('Choose a start and a destination.');
    const q = { from: 'C-M', to: 'ENG-01', allowPortal: false };
    expect(routeSummary(q, null)).toBe('No walkable route with portals excluded.');
    expect(routeSummary({ ...q, to: 'C-M' }, plan('C-M', 'C-M'))).toBe(
      'Start and destination are the same room.',
    );
    expect(routeSummary({ ...q, allowPortal: true }, plan('C-M', 'ENG-01', true))).toMatch(
      /through portal B28$/,
    );
    const step = plan('C-M', 'L-01').steps[0];
    if (!step) throw new Error('no step');
    expect(stepText(step, new Map())).toBe('Stairs · B02: C-M (C-M) → C-U (C-U)');
  });
});
