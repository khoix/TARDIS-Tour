// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { LEGEND } from '../../src/systems/research/overlay';
import { DEFAULT_RESEARCH, renderResearchPanel } from '../../src/ui/researchPanel';

function setup() {
  const container = document.createElement('section');
  document.body.replaceChildren(container);
  const onChange = vi.fn();
  const panel = renderResearchPanel(container, { onChange });
  panel.sync(DEFAULT_RESEARCH);
  return { container, onChange, panel };
}

describe('research panel', () => {
  it('reports the overlay toggle and shows the legend only while it is on', () => {
    const { container, onChange, panel } = setup();
    const legend = container.querySelector<HTMLElement>('.legend');
    expect(legend?.hidden).toBe(true);
    const overlay = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(overlay?.parentElement?.textContent).toBe('Evidence overlay');
    overlay?.click();
    expect(onChange).toHaveBeenLastCalledWith({ overlay: true });
    panel.sync({ ...DEFAULT_RESEARCH, overlay: true });
    expect(legend?.hidden).toBe(false);
    expect(overlay?.checked).toBe(true);
  });

  it('labels every legend entry in text, with its swatch', () => {
    const { container } = setup();
    const items = [...container.querySelectorAll<HTMLElement>('.legend li')];
    expect(items.map((i) => i.dataset.key)).toEqual(LEGEND.map((e) => e.key));
    items.forEach((item, i) => {
      expect(item.textContent).toContain(LEGEND[i]?.label);
      expect(item.querySelector('.swatch')).not.toBeNull();
    });
  });

  it('offers the three label modes as radios and mirrors the current one', () => {
    const { container, onChange, panel } = setup();
    const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.map((r) => r.value)).toEqual(['default', 'research', 'structure']);
    expect(radios[0]?.checked).toBe(true);
    radios[2]?.click();
    expect(onChange).toHaveBeenLastCalledWith({ labelMode: 'structure' });
    panel.sync({ ...DEFAULT_RESEARCH, labelMode: 'research' });
    expect(radios.map((r) => r.checked)).toEqual([false, true, false]);
  });
});
