import type { RoomNode } from '../data/types';
import { edgeKindLabel, type Route } from '../systems/navigation/routes';
import { groupPlacedRooms } from './roomIndex';

export interface RouteQuery {
  readonly from: string | null;
  readonly to: string | null;
  /** Lets the route cross the B28 portal. */
  readonly allowPortal: boolean;
}

export const EMPTY_ROUTE_QUERY: RouteQuery = { from: null, to: null, allowPortal: false };

export interface RouteActions {
  readonly onChange: (patch: Partial<RouteQuery>) => void;
  readonly onClear: () => void;
}

export interface RoutePanel {
  /** Mirrors the query and its result (null: no route, or the query is incomplete). */
  sync(query: RouteQuery, route: Route | null): void;
}

/** One-line description of a step, e.g. `Stairs · B03: Console room (C-M) → Lower deck (C-L)`. */
export function stepText(
  step: Route['steps'][number],
  rooms: ReadonlyMap<string, RoomNode>,
): string {
  const name = (id: string) => `${rooms.get(id)?.name ?? id} (${id})`;
  return `${edgeKindLabel(step.kind)} · ${step.connectionId}: ${name(step.from)} → ${name(step.to)}`;
}

/** Summary line under the selectors. */
export function routeSummary(query: RouteQuery, route: Route | null): string {
  if (query.from === null || query.to === null) return 'Choose a start and a destination.';
  if (route === null) {
    return query.allowPortal
      ? 'No route between these rooms.'
      : 'No walkable route with portals excluded.';
  }
  if (route.steps.length === 0) return 'Start and destination are the same room.';
  const n = route.steps.length;
  const portal = route.steps.find((s) => s.portal);
  const via = portal ? ` · through portal ${portal.connectionId}` : '';
  return `${n} step${n === 1 ? '' : 's'} · ${route.length.toFixed(1)} NU walked${via}`;
}

/**
 * Renders the route planner: start and destination selectors over the placed rooms, the
 * portal toggle, Clear, a summary and the ordered step list naming each edge's kind.
 */
export function renderRoutePanel(
  container: HTMLElement,
  rooms: readonly RoomNode[],
  actions: RouteActions,
): RoutePanel {
  const doc = container.ownerDocument;
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const byId = new Map(rooms.map((r) => [r.id, r]));

  const heading = el('h2', 'Route');
  heading.id = 'route-title';

  const roomSelect = (id: string, text: string, key: 'from' | 'to') => {
    const label = el('label', text);
    label.htmlFor = id;
    label.className = 'field';
    const select = el('select');
    select.id = id;
    const none = el('option', 'Choose a room…');
    none.value = '';
    select.append(none);
    for (const group of groupPlacedRooms(rooms)) {
      const optgroup = el('optgroup');
      optgroup.label = group.label;
      for (const room of group.rooms) {
        const option = el('option', `${room.id} · ${room.name}`);
        option.value = room.id;
        optgroup.append(option);
      }
      select.append(optgroup);
    }
    select.addEventListener('change', () => actions.onChange({ [key]: select.value || null }));
    return { label, select };
  };
  const from = roomSelect('route-from', 'From', 'from');
  const to = roomSelect('route-to', 'To', 'to');

  const portalLabel = el('label');
  portalLabel.className = 'check';
  const portal = el('input');
  portal.type = 'checkbox';
  portal.addEventListener('change', () => actions.onChange({ allowPortal: portal.checked }));
  portalLabel.append(portal, 'Allow portal (B28)');

  const clear = el('button', 'Clear route');
  clear.type = 'button';
  clear.addEventListener('click', () => actions.onClear());
  const buttons = el('div');
  buttons.className = 'panel-actions';
  buttons.append(clear);

  const summary = el('p');
  summary.className = 'route-summary';
  summary.setAttribute('aria-live', 'polite');
  const steps = el('ol');
  steps.className = 'route-steps';
  steps.setAttribute('aria-label', 'Route steps');

  container.setAttribute('aria-labelledby', heading.id);
  container.replaceChildren(
    heading,
    from.label,
    from.select,
    to.label,
    to.select,
    portalLabel,
    buttons,
    summary,
    steps,
  );

  return {
    sync(query, route) {
      from.select.value = query.from ?? '';
      to.select.value = query.to ?? '';
      portal.checked = query.allowPortal;
      clear.disabled = query.from === null && query.to === null;
      summary.textContent = routeSummary(query, route);
      steps.replaceChildren(
        ...(route?.steps ?? []).map((step) => {
          const item = el('li', stepText(step, byId));
          item.dataset.connectionId = step.connectionId;
          item.dataset.kind = step.kind;
          return item;
        }),
      );
    },
  };
}
