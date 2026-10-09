import { getSource } from '../data/evidence';
import type { Connection, RoomNode, SourceRecord } from '../data/types';
import { CONSOLE_ROOM_ID } from '../systems/navigation/routes';
import {
  cssColor,
  EVIDENCE_CLASS_LABELS,
  EVIDENCE_CLASS_NOTES,
  EVIDENCE_COLORS,
} from '../systems/research/overlay';
import { evidenceClassOfPresence } from '../world/structure';
import { REGION_LABELS } from './roomIndex';

export interface InfoPanelActions {
  readonly onFocus: (id: string) => void;
  readonly onClose: () => void;
  /** Plans the walk from this room to the console (Execution 7). */
  readonly onRouteToConsole: (id: string) => void;
}

/** Human-readable form of a controlled-vocabulary value, e.g. `seen_on_tv` → `seen on tv`. */
function vocab(value: string): string {
  return value.replaceAll('_', ' ');
}

/** The room's connection axis: how each of its edges is known, one entry per edge. */
export function connectionAxis(room: RoomNode, connections: readonly Connection[]): string {
  const edges = connections.filter((c) => c.from.room === room.id || c.to.room === room.id);
  if (edges.length === 0) return 'none recorded';
  return edges
    .map((c) => {
      const other = c.from.room === room.id ? c.to.room : c.from.room;
      const deferred = c.buildStatus === 'deferred' ? ', not built in v1' : '';
      return `${c.id} to ${other}: ${vocab(c.basis)} (${c.provenance}${deferred})`;
    })
    .join('; ');
}

/** Every source the room's records cite, once each, in citation order. */
export function citedSources(room: RoomNode): (SourceRecord | string)[] {
  const ids = [...new Set(room.evidence.flatMap((r) => r.sourceIds))];
  return ids.map((id) => getSource(id) ?? id);
}

/**
 * Renders the selected room's details into `container`, or hides the panel when `room` is null.
 * Evidence axes are listed separately and never combined into a single score.
 */
export function renderInfoPanel(
  container: HTMLElement,
  room: RoomNode | null,
  actions: InfoPanelActions,
  connections: readonly Connection[],
): void {
  const doc = container.ownerDocument;
  if (room === null) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const external = (link: HTMLAnchorElement, url: string) => {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  };

  const header = el('header');
  const heading = el('h2', room.name);
  heading.id = 'info-panel-title';
  const meta = el('p', `${room.id} · ${REGION_LABELS[room.region]} · Tier ${room.tier}`);
  meta.className = 'room-meta';
  const focus = el('button', 'Focus');
  focus.type = 'button';
  focus.addEventListener('click', () => actions.onFocus(room.id));
  const route = el('button', 'Route to console');
  route.type = 'button';
  route.disabled = room.id === CONSOLE_ROOM_ID;
  route.addEventListener('click', () => actions.onRouteToConsole(room.id));
  const details = el('button', 'Details');
  details.type = 'button';
  details.className = 'details-toggle';
  details.setAttribute('aria-expanded', 'false');
  details.addEventListener('click', () => {
    const expand = details.getAttribute('aria-expanded') !== 'true';
    details.setAttribute('aria-expanded', String(expand));
    container.dataset.collapsed = String(!expand);
  });
  const close = el('button', 'Close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close room details');
  close.addEventListener('click', () => actions.onClose());
  const buttons = el('div');
  buttons.className = 'panel-actions';
  buttons.append(focus, route, details, close);
  header.append(heading, meta, buttons);

  const summary = el('p', room.summary);

  // Known vs inferred: the existence of the space is graded; its placement never is.
  const known = evidenceClassOfPresence(room.axes.presence);
  const indicator = el('p');
  indicator.className = 'known-indicator';
  indicator.dataset.evidenceClass = known;
  const swatch = el('span');
  swatch.className = 'swatch';
  swatch.style.background = cssColor(EVIDENCE_COLORS[known]);
  indicator.append(
    swatch,
    el('strong', `${EVIDENCE_CLASS_LABELS[known]} space`),
    ` — ${EVIDENCE_CLASS_NOTES[known]}. Placement and size are authored (design layout, NU).`,
  );

  const axes = el('dl');
  axes.className = 'evidence-axes';
  const axisRows: [string, string][] = [
    ['Presence', vocab(room.axes.presence)],
    ['Appearance', vocab(room.axes.appearance)],
    ['Scale', vocab(room.axes.scale)],
    ['Connection', connectionAxis(room, connections)],
    [
      'State',
      room.observedStates.length > 0
        ? `${vocab(room.state)} (also observed: ${room.observedStates.map(vocab).join(', ')})`
        : vocab(room.state),
    ],
  ];
  for (const [term, value] of axisRows) axes.append(el('dt', term), el('dd', value));

  const appearances = el('ul');
  for (const a of room.appearances) appearances.append(el('li', a));

  const records = el('ul');
  records.className = 'evidence-records';
  for (const record of room.evidence) {
    const item = el('li');
    item.dataset.grade = record.grade;
    const grade = el('strong', `Grade ${record.grade}`);
    item.append(grade, ` — ${record.note} `);
    const sources = el('span');
    sources.className = 'sources';
    for (const id of record.sourceIds) {
      const source = getSource(id);
      const url = source?.urls[0];
      if (source && url) {
        const link = el('a', id);
        external(link, url);
        link.title = source.title;
        sources.append(link, ' ');
      } else {
        sources.append(el('span', id), ' ');
      }
    }
    item.append(sources);
    records.append(item);
  }

  const sources = el('ul');
  sources.className = 'source-list';
  for (const source of citedSources(room)) {
    const item = el('li');
    if (typeof source === 'string') {
      item.append(el('strong', source), ' — not in the source register');
    } else {
      const [first, ...more] = source.urls;
      const id = first ? el('a', source.id) : el('strong', source.id);
      if (id instanceof HTMLAnchorElement && first) external(id, first);
      item.append(id, ` — ${source.title} (${source.kind}). ${source.verifies}`);
      more.forEach((url, i) => {
        const extra = el('a', `link ${i + 2}`);
        external(extra, url);
        item.append(' ', extra);
      });
    }
    sources.append(item);
  }

  container.replaceChildren(
    header,
    summary,
    indicator,
    el('h3', 'Evidence axes'),
    axes,
    el('h3', 'Appearances'),
    appearances,
    el('h3', 'Evidence records'),
    records,
    el('h3', 'Sources'),
    sources,
  );
  container.setAttribute('aria-labelledby', heading.id);
  // Compact layouts show only the header until Details is expanded (see style.css).
  container.dataset.collapsed = 'true';
  container.hidden = false;
}
