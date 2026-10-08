import { getSource } from '../data/evidence';
import type { RoomNode } from '../data/types';
import { REGION_LABELS } from './roomIndex';

export interface InfoPanelActions {
  readonly onFocus: (id: string) => void;
  readonly onClose: () => void;
}

/** Human-readable form of a controlled-vocabulary value, e.g. `seen_on_tv` → `seen on tv`. */
function vocab(value: string): string {
  return value.replaceAll('_', ' ');
}

/**
 * Renders the selected room's details into `container`, or hides the panel when `room` is null.
 * Evidence axes are listed separately and never combined into a single score.
 */
export function renderInfoPanel(
  container: HTMLElement,
  room: RoomNode | null,
  actions: InfoPanelActions,
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

  const header = el('header');
  const heading = el('h2', room.name);
  heading.id = 'info-panel-title';
  const meta = el('p', `${room.id} · ${REGION_LABELS[room.region]} · Tier ${room.tier}`);
  meta.className = 'room-meta';
  const focus = el('button', 'Focus');
  focus.type = 'button';
  focus.addEventListener('click', () => actions.onFocus(room.id));
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
  buttons.append(focus, details, close);
  header.append(heading, meta, buttons);

  const summary = el('p', room.summary);

  const axes = el('dl');
  axes.className = 'evidence-axes';
  const axisRows: [string, string][] = [
    ['Presence', vocab(room.axes.presence)],
    ['Appearance', vocab(room.axes.appearance)],
    ['Scale', vocab(room.axes.scale)],
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
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = source.title;
        sources.append(link, ' ');
      } else {
        sources.append(el('span', id), ' ');
      }
    }
    item.append(sources);
    records.append(item);
  }

  container.replaceChildren(
    header,
    summary,
    el('h3', 'Evidence axes'),
    axes,
    el('h3', 'Appearances'),
    appearances,
    el('h3', 'Evidence records'),
    records,
  );
  container.setAttribute('aria-labelledby', heading.id);
  // Compact layouts show only the header until Details is expanded (see style.css).
  container.dataset.collapsed = 'true';
  container.hidden = false;
}
