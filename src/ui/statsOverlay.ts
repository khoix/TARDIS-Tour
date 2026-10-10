/**
 * Dev-only stats overlay (Execution 8): the quality tier, the smoothed frame time and the last
 * frame's draw calls and triangles against the tier's budget. Shown in development builds or
 * with `?stats`; never in the default production view.
 */

import type { BudgetReport, QualitySnapshot } from '../scene/viewer';

/** How often the overlay re-reads the renderer (ms). */
export const STATS_INTERVAL_MS = 500;

export function statsText(q: QualitySnapshot, b: BudgetReport): string {
  const frame = q.frameMs === null ? '–' : `${q.frameMs.toFixed(1)} ms`;
  return [
    `tier ${q.tier}${q.auto ? ' (auto)' : ''}${q.downgrades > 0 ? ` ↓${q.downgrades}` : ''}`,
    `frame ${frame}`,
    `calls ${b.calls} / ${b.budget.calls}`,
    `tris ${b.triangles.toLocaleString('en')} / ${b.budget.triangles.toLocaleString('en')}`,
    `dpr ${q.pixelRatio} · shadows ${q.shadows ? 'on' : 'off'} · lights ${q.diegeticLights}`,
  ].join('\n');
}

export function createStatsOverlay(
  host: HTMLElement,
  read: () => { quality: QualitySnapshot; budget: BudgetReport },
): HTMLElement {
  const el = document.createElement('pre');
  el.className = 'stats-overlay';
  el.setAttribute('aria-hidden', 'true');
  host.append(el);
  const update = () => {
    const { quality, budget } = read();
    el.textContent = statsText(quality, budget);
    el.classList.toggle('over-budget', !budget.withinBudget);
  };
  update();
  window.setInterval(update, STATS_INTERVAL_MS);
  return el;
}
