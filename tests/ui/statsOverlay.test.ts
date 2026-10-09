// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import type { BudgetReport, QualitySnapshot } from '../../src/scene/viewer';
import { createStatsOverlay, statsText } from '../../src/ui/statsOverlay';

const Q: QualitySnapshot = {
  tier: 'medium',
  auto: true,
  pixelRatio: 1.5,
  shadows: false,
  diegeticLights: 3,
  detail: 'full',
  ambientMotion: true,
  frameMs: 21.04,
  downgrades: 1,
};
const B: BudgetReport = {
  tier: 'medium',
  calls: 243,
  triangles: 34428,
  budget: { calls: 300, triangles: 45000 },
  withinBudget: true,
};

describe('stats overlay', () => {
  it('reports tier, frame time, calls and triangles against the budget', () => {
    expect(statsText(Q, B).split('\n')).toEqual([
      'tier medium (auto) ↓1',
      'frame 21.0 ms',
      'calls 243 / 300',
      'tris 34,428 / 45,000',
      'dpr 1.5 · shadows off · lights 3',
    ]);
    expect(statsText({ ...Q, frameMs: null, auto: false, downgrades: 0 }, B)).toMatch(
      /^tier medium\nframe –\n/,
    );
  });

  it('marks an over-budget frame and stays out of the accessibility tree', () => {
    const host = document.createElement('div');
    const el = createStatsOverlay(host, () => ({
      quality: Q,
      budget: { ...B, calls: 400, withinBudget: false },
    }));
    expect(host.contains(el)).toBe(true);
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.classList.contains('over-budget')).toBe(true);
    expect(el.textContent).toContain('calls 400 / 300');
  });
});
