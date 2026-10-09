import type { RegionId } from '../data/types';
import {
  type CutawaySettings,
  type IsolationTarget,
  lowerSection,
  raiseSection,
} from '../systems/visibility/state';
import { REGION_LABELS } from './roomIndex';

export interface CutawayOptions {
  /** Regions with placed rooms, in index order. */
  readonly regions: readonly RegionId[];
  /** Deck levels, highest first. */
  readonly levels: readonly number[];
  /** Slider range of the section clip; the slider at `max` means no section. */
  readonly sectionRange: { readonly min: number; readonly max: number };
  /** Section heights the Lower/Raise buttons step between. */
  readonly sectionStops: readonly number[];
}

export interface CutawayActions {
  readonly onChange: (patch: Partial<CutawaySettings>) => void;
  readonly onReset: () => void;
}

export interface CutawayPanel {
  /** Mirrors the settings, and whether a room is selected (focus mode needs one). */
  sync(settings: CutawaySettings, hasSelection: boolean): void;
}

/** Signed elevation in NU with a true minus sign, e.g. `+7`, `0`, `−28`. */
function signed(y: number): string {
  return y > 0 ? `+${y}` : y < 0 ? `−${-y}` : '0';
}

export function levelLabel(y: number): string {
  return `Level ${signed(y)}`;
}

export function sectionLabel(sectionY: number | null): string {
  return sectionY === null ? 'Off' : `${signed(sectionY)} NU`;
}

/** `<select>` value of an isolation target: empty, `region:<id>` or `level:<y>`. */
export function isolationValue(target: IsolationTarget | null): string {
  if (target === null) return '';
  return target.kind === 'region' ? `region:${target.region}` : `level:${target.y}`;
}

export function parseIsolation(value: string): IsolationTarget | null {
  const [kind, rest] = value.split(':');
  if (kind === 'region' && rest) return { kind: 'region', region: rest as RegionId };
  if (kind === 'level' && rest !== undefined) return { kind: 'level', y: Number(rest) };
  return null;
}

/**
 * Renders the cutaway controls into `container`: near-wall fade, ceiling hide, the section
 * clip (slider plus level steps for touch), region/level isolation, focus mode and reset.
 * All are native controls with visible labels, and every target is at least 44 px tall.
 */
export function renderCutawayPanel(
  container: HTMLElement,
  options: CutawayOptions,
  actions: CutawayActions,
): CutawayPanel {
  const doc = container.ownerDocument;
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text: string, onClick: () => void) => {
    const b = el('button', text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };
  const check = (text: string, onToggle: (on: boolean) => void) => {
    const label = el('label');
    label.className = 'check';
    const input = el('input');
    input.type = 'checkbox';
    input.addEventListener('change', () => onToggle(input.checked));
    label.append(input, text);
    return { label, input };
  };

  let current: CutawaySettings | null = null;
  const heading = el('h2', 'Cutaway');
  heading.id = 'cutaway-title';
  const walls = check('Fade near walls', (on) => actions.onChange({ wallFade: on }));
  const ceilings = check('Hide ceilings', (on) => actions.onChange({ ceilingsHidden: on }));

  const { min, max } = options.sectionRange;
  const section = el('input');
  section.type = 'range';
  section.id = 'cutaway-section';
  section.min = String(min);
  section.max = String(max);
  section.step = '0.5';
  section.addEventListener('input', () => {
    const y = Number(section.value);
    actions.onChange({ sectionY: y >= max ? null : y });
  });
  const sectionName = el('label', 'Section height');
  sectionName.htmlFor = section.id;
  const sectionValue = el('output');
  sectionValue.setAttribute('for', section.id);
  const lower = button('Lower section', () =>
    actions.onChange({ sectionY: lowerSection(current?.sectionY ?? null, options.sectionStops) }),
  );
  const raise = button('Raise section', () =>
    actions.onChange({ sectionY: raiseSection(current?.sectionY ?? null, options.sectionStops) }),
  );
  const sectionHead = el('div');
  sectionHead.className = 'field';
  sectionHead.append(sectionName, sectionValue);
  const steps = el('div');
  steps.className = 'panel-actions';
  steps.append(lower, raise);

  const isolate = el('select');
  isolate.id = 'cutaway-isolate';
  const nothing = el('option', 'Nothing');
  nothing.value = '';
  const regions = el('optgroup');
  regions.label = 'Regions';
  for (const region of options.regions) {
    const option = el('option', REGION_LABELS[region]);
    option.value = isolationValue({ kind: 'region', region });
    regions.append(option);
  }
  const levels = el('optgroup');
  levels.label = 'Levels';
  for (const y of options.levels) {
    const option = el('option', levelLabel(y));
    option.value = isolationValue({ kind: 'level', y });
    levels.append(option);
  }
  isolate.append(nothing, regions, levels);
  isolate.addEventListener('change', () =>
    actions.onChange({ isolation: parseIsolation(isolate.value) }),
  );
  const isolateName = el('label', 'Isolate');
  isolateName.htmlFor = isolate.id;
  isolateName.className = 'field';

  const focus = button('Focus mode', () => actions.onChange({ focusMode: !current?.focusMode }));
  focus.setAttribute('aria-pressed', 'false');
  const reset = button('Reset cutaway', () => actions.onReset());
  const modes = el('div');
  modes.className = 'panel-actions';
  modes.append(focus, reset);

  container.setAttribute('aria-labelledby', heading.id);
  container.replaceChildren(
    heading,
    walls.label,
    ceilings.label,
    sectionHead,
    section,
    steps,
    isolateName,
    isolate,
    modes,
  );

  return {
    sync(settings, hasSelection) {
      current = settings;
      walls.input.checked = settings.wallFade;
      ceilings.input.checked = settings.ceilingsHidden;
      section.value = String(settings.sectionY ?? max);
      const text = sectionLabel(settings.sectionY);
      sectionValue.textContent = text;
      section.setAttribute('aria-valuetext', text);
      lower.disabled = lowerSection(settings.sectionY, options.sectionStops) === settings.sectionY;
      raise.disabled = settings.sectionY === null;
      isolate.value = isolationValue(settings.isolation);
      focus.setAttribute('aria-pressed', String(settings.focusMode));
      focus.disabled = !hasSelection && !settings.focusMode;
    },
  };
}
