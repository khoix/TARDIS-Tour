import { LABEL_MODE_NAMES, LABEL_MODES, type LabelMode } from '../systems/labels/labels';
import { cssColor, LEGEND } from '../systems/research/overlay';

export interface ResearchSettings {
  /** Evidence overlay: every mesh coloured by how it is known. */
  readonly overlay: boolean;
  readonly labelMode: LabelMode;
}

export const DEFAULT_RESEARCH: ResearchSettings = { overlay: false, labelMode: 'default' };

export interface ResearchActions {
  readonly onChange: (patch: Partial<ResearchSettings>) => void;
}

export interface ResearchPanel {
  sync(settings: ResearchSettings): void;
}

export const LABEL_MODE_HINTS: Readonly<Record<LabelMode, string>> = {
  default: 'Region names; the selected room and a route’s rooms',
  research: 'Evidence grades and source notes',
  structure: 'Room IDs, door anchors and edges',
};

/**
 * Renders the research controls: the evidence overlay with its legend (shown while the overlay
 * is on), and the label mode. Every legend entry and mode carries its meaning as visible text,
 * so nothing depends on hover or on colour alone.
 */
export function renderResearchPanel(
  container: HTMLElement,
  actions: ResearchActions,
): ResearchPanel {
  const doc = container.ownerDocument;
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const heading = el('h2', 'Research');
  heading.id = 'research-title';

  const overlayLabel = el('label');
  overlayLabel.className = 'check';
  const overlay = el('input');
  overlay.type = 'checkbox';
  overlay.addEventListener('change', () => actions.onChange({ overlay: overlay.checked }));
  overlayLabel.append(overlay, 'Evidence overlay');

  const legend = el('ul');
  legend.className = 'legend';
  legend.setAttribute('aria-label', 'Evidence overlay legend');
  for (const entry of LEGEND) {
    const item = el('li');
    item.dataset.key = entry.key;
    const swatch = el('span');
    swatch.className = 'swatch';
    swatch.style.background = cssColor(entry.color);
    const text = el('span');
    text.append(el('strong', entry.label), ` — ${entry.note}`);
    item.append(swatch, text);
    legend.append(item);
  }

  const modes = el('fieldset');
  modes.className = 'label-modes';
  modes.append(el('legend', 'Labels'));
  const radios = new Map<LabelMode, HTMLInputElement>();
  for (const mode of LABEL_MODES) {
    const label = el('label');
    label.className = 'check';
    const input = el('input');
    input.type = 'radio';
    input.name = 'label-mode';
    input.value = mode;
    input.addEventListener('change', () => {
      if (input.checked) actions.onChange({ labelMode: mode });
    });
    const text = el('span');
    text.append(el('strong', LABEL_MODE_NAMES[mode]), ` — ${LABEL_MODE_HINTS[mode]}`);
    label.append(input, text);
    radios.set(mode, input);
    modes.append(label);
  }

  container.setAttribute('aria-labelledby', heading.id);
  container.replaceChildren(heading, overlayLabel, legend, modes);

  return {
    sync(settings) {
      overlay.checked = settings.overlay;
      legend.hidden = !settings.overlay;
      for (const [mode, input] of radios) input.checked = mode === settings.labelMode;
    },
  };
}
