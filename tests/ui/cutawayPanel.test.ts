// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import {
  type CutawaySettings,
  DEFAULT_CUTAWAY,
  type IsolationTarget,
} from '../../src/systems/visibility/state';
import {
  isolationValue,
  levelLabel,
  parseIsolation,
  renderCutawayPanel,
  sectionLabel,
} from '../../src/ui/cutawayPanel';

const OPTIONS = {
  regions: ['control-nexus', 'power-core'] as const,
  levels: [7, 0, -7, -14],
  sectionRange: { min: -58, max: 29 },
  sectionStops: [13, 6, -1, -8],
};

function setup() {
  const container = document.createElement('section');
  document.body.replaceChildren(container);
  const onChange = vi.fn<(patch: Partial<CutawaySettings>) => void>();
  const onReset = vi.fn();
  const panel = renderCutawayPanel(container, OPTIONS, { onChange, onReset });
  panel.sync(DEFAULT_CUTAWAY, false);
  const q = <T extends Element>(selector: string) => {
    const el = container.querySelector<T & Element>(selector);
    if (!el) throw new Error(`missing ${selector}`);
    return el as T;
  };
  const byText = (text: string) => {
    const b = [...container.querySelectorAll('button')].find((x) => x.textContent === text);
    if (!b) throw new Error(`missing button ${text}`);
    return b;
  };
  const checkbox = (text: string) => {
    const label = [...container.querySelectorAll('label')].find((l) => l.textContent === text);
    const input = label?.querySelector('input');
    if (!input) throw new Error(`missing checkbox ${text}`);
    return input;
  };
  return { container, panel, onChange, onReset, q, byText, checkbox };
}

describe('cutaway panel', () => {
  it('labels every control', () => {
    const { container, q, byText, checkbox } = setup();
    expect(container.getAttribute('aria-labelledby')).toBe('cutaway-title');
    expect(q<HTMLHeadingElement>('h2').textContent).toBe('Cutaway');
    expect(checkbox('Fade near walls').type).toBe('checkbox');
    expect(checkbox('Hide ceilings').type).toBe('checkbox');
    const range = q<HTMLInputElement>('input[type="range"]');
    expect(q<HTMLLabelElement>(`label[for="${range.id}"]`).textContent).toBe('Section height');
    expect([range.min, range.max]).toEqual(['-58', '29']);
    const select = q<HTMLSelectElement>('select');
    expect(q<HTMLLabelElement>(`label[for="${select.id}"]`).textContent).toBe('Isolate');
    expect([...select.options].map((o) => o.textContent)).toEqual([
      'Nothing',
      'Control nexus',
      'Power core',
      'Level +7',
      'Level 0',
      'Level −7',
      'Level −14',
    ]);
    for (const text of ['Lower section', 'Raise section', 'Focus mode', 'Reset cutaway']) {
      expect(byText(text).type).toBe('button');
    }
  });

  it('mirrors the settings', () => {
    const { panel, q, byText, checkbox } = setup();
    const range = q<HTMLInputElement>('input[type="range"]');
    expect(checkbox('Fade near walls').checked).toBe(true);
    expect(checkbox('Hide ceilings').checked).toBe(true);
    expect(range.value).toBe('29');
    expect(range.getAttribute('aria-valuetext')).toBe('Off');
    expect(q('output').textContent).toBe('Off');
    expect(byText('Raise section').disabled).toBe(true);
    expect(byText('Lower section').disabled).toBe(false);
    expect(byText('Focus mode').disabled).toBe(true);
    expect(byText('Focus mode').getAttribute('aria-pressed')).toBe('false');

    panel.sync(
      {
        wallFade: false,
        ceilingsHidden: false,
        sectionY: -8,
        isolation: { kind: 'level', y: -7 },
        focusMode: false,
      },
      true,
    );
    expect(checkbox('Fade near walls').checked).toBe(false);
    expect(checkbox('Hide ceilings').checked).toBe(false);
    expect(range.value).toBe('-8');
    expect(q('output').textContent).toBe('−8 NU');
    expect(byText('Lower section').disabled).toBe(true);
    expect(byText('Raise section').disabled).toBe(false);
    expect(q<HTMLSelectElement>('select').value).toBe('level:-7');
    expect(byText('Focus mode').disabled).toBe(false);

    panel.sync({ ...DEFAULT_CUTAWAY, focusMode: true }, true);
    expect(byText('Focus mode').getAttribute('aria-pressed')).toBe('true');
  });

  it('reports changes as setting patches', () => {
    const { panel, onChange, onReset, q, byText, checkbox } = setup();
    checkbox('Fade near walls').click();
    expect(onChange).toHaveBeenLastCalledWith({ wallFade: false });
    checkbox('Hide ceilings').click();
    expect(onChange).toHaveBeenLastCalledWith({ ceilingsHidden: false });

    const range = q<HTMLInputElement>('input[type="range"]');
    range.value = '-8';
    range.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenLastCalledWith({ sectionY: -8 });
    range.value = '29';
    range.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenLastCalledWith({ sectionY: null });

    byText('Lower section').click();
    expect(onChange).toHaveBeenLastCalledWith({ sectionY: 13 });
    panel.sync({ ...DEFAULT_CUTAWAY, sectionY: 6 }, true);
    byText('Raise section').click();
    expect(onChange).toHaveBeenLastCalledWith({ sectionY: 13 });

    const select = q<HTMLSelectElement>('select');
    select.value = 'region:power-core';
    select.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith({
      isolation: { kind: 'region', region: 'power-core' },
    });
    select.value = '';
    select.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith({ isolation: null });

    byText('Focus mode').click();
    expect(onChange).toHaveBeenLastCalledWith({ focusMode: true });
    byText('Reset cutaway').click();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('round-trips isolation targets and formats elevations', () => {
    for (const t of [
      null,
      { kind: 'region', region: 'cultural' },
      { kind: 'level', y: -28 },
      { kind: 'level', y: 0 },
    ] as (IsolationTarget | null)[]) {
      expect(parseIsolation(isolationValue(t))).toEqual(t);
    }
    expect(levelLabel(7)).toBe('Level +7');
    expect(sectionLabel(null)).toBe('Off');
    expect(sectionLabel(13)).toBe('+13 NU');
  });
});
