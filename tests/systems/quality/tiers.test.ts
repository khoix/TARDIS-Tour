import { describe, expect, it } from 'vitest';
import {
  COMPACT_WIDTH_PX,
  DEFAULT_MONITOR,
  FrameTimeMonitor,
  initialTier,
  isQualityTier,
  lowerTier,
  parseQualityOptions,
  pixelRatioFor,
  QUALITY,
  QUALITY_TIERS,
} from '../../../src/systems/quality/tiers';

const DESKTOP = {
  devicePixelRatio: 1,
  coarsePointer: false,
  viewportWidth: 1280,
  hardwareConcurrency: 8,
};

describe('quality tiers', () => {
  it('orders tiers from most to least expensive', () => {
    expect(QUALITY_TIERS).toEqual(['high', 'medium', 'low']);
    for (const [i, tier] of QUALITY_TIERS.entries()) {
      const s = QUALITY[tier];
      expect(s.tier).toBe(tier);
      const next = QUALITY_TIERS[i + 1];
      if (!next) continue;
      const n = QUALITY[next];
      expect(n.pixelRatioCap).toBeLessThanOrEqual(s.pixelRatioCap);
      expect(n.diegeticLights).toBeLessThanOrEqual(s.diegeticLights);
      expect(n.budget.calls).toBeLessThan(s.budget.calls);
      expect(n.budget.triangles).toBeLessThan(s.budget.triangles);
    }
    expect(QUALITY.high.shadows).toBe(true);
    expect(QUALITY.medium.shadows).toBe(false);
    expect(QUALITY.low).toMatchObject({
      shadows: false,
      diegeticLights: 0,
      ambientMotion: false,
      detail: 'reduced',
      pixelRatioCap: 1,
    });
  });

  it('steps down one tier at a time and stops at low', () => {
    expect(lowerTier('high')).toBe('medium');
    expect(lowerTier('medium')).toBe('low');
    expect(lowerTier('low')).toBeNull();
    expect(isQualityTier('medium')).toBe(true);
    expect(isQualityTier('ultra')).toBe(false);
  });

  it('caps the pixel ratio per tier and never goes below 1', () => {
    expect(pixelRatioFor('high', 3)).toBe(2);
    expect(pixelRatioFor('medium', 3)).toBe(1.5);
    expect(pixelRatioFor('low', 3)).toBe(1);
    expect(pixelRatioFor('high', 1.25)).toBe(1.25);
    expect(pixelRatioFor('high', 0.5)).toBe(1);
  });

  it('starts desktops high, touch and compact screens medium, weak hardware low', () => {
    expect(initialTier(DESKTOP)).toBe('high');
    expect(initialTier({ ...DESKTOP, coarsePointer: true, devicePixelRatio: 3 })).toBe('medium');
    expect(initialTier({ ...DESKTOP, viewportWidth: COMPACT_WIDTH_PX })).toBe('medium');
    expect(initialTier({ ...DESKTOP, viewportWidth: COMPACT_WIDTH_PX + 1 })).toBe('high');
    expect(initialTier({ ...DESKTOP, hardwareConcurrency: 2 })).toBe('low');
    expect(initialTier({ ...DESKTOP, deviceMemory: 2 })).toBe('low');
    expect(initialTier({ ...DESKTOP, hardwareConcurrency: undefined })).toBe('high');
  });

  it('reads ?quality and ?stats; tests and pinned tiers never auto-downgrade', () => {
    expect(parseQualityOptions('', false)).toEqual({ pinned: null, auto: true, stats: false });
    expect(parseQualityOptions('?quality=low', false)).toEqual({
      pinned: 'low',
      auto: false,
      stats: false,
    });
    expect(parseQualityOptions('?test', false).auto).toBe(false);
    expect(parseQualityOptions('?test&quality=auto', false).auto).toBe(true);
    expect(parseQualityOptions('?quality=bogus', false)).toMatchObject({
      pinned: null,
      auto: true,
    });
    expect(parseQualityOptions('?stats', false).stats).toBe(true);
    expect(parseQualityOptions('', true).stats).toBe(true);
  });
});

describe('frame-time monitor', () => {
  const o = DEFAULT_MONITOR;
  const feed = (m: FrameTimeMonitor, ms: number, n: number, start = 0) => {
    let fired = -1;
    for (let i = 0; i < n; i++) if (m.sample(ms, start + i * ms) && fired < 0) fired = i;
    return fired;
  };

  it('never asks for a downgrade while frames meet the target', () => {
    const m = new FrameTimeMonitor();
    expect(feed(m, 16, 500)).toBe(-1);
    expect(m.frameMs).toBeCloseTo(16, 6);
  });

  it('asks once a full window is mostly slow, then waits out the cooldown', () => {
    const m = new FrameTimeMonitor();
    expect(feed(m, 50, o.window)).toBe(o.window - 1);
    // Right after a downgrade: slow frames during the cooldown are not judged.
    const t0 = o.window * 50;
    expect(feed(m, 50, Math.floor(o.cooldownMs / 50) - 1, t0)).toBe(-1);
    // After the cooldown a new full window is needed.
    const t1 = t0 + o.cooldownMs;
    expect(feed(m, 50, o.window, t1)).toBe(o.window - 1);
  });

  it('tolerates occasional slow frames below the slow share', () => {
    const m = new FrameTimeMonitor();
    let fired = false;
    for (let i = 0; i < 400; i++) fired ||= m.sample(i % 2 === 0 ? 50 : 16, i * 33);
    expect(fired).toBe(false);
  });

  it('ignores stalls and background-tab gaps', () => {
    const m = new FrameTimeMonitor();
    expect(feed(m, o.ignoreAboveMs + 1, 200)).toBe(-1);
    expect(m.frameMs).toBeNaN();
    expect(m.sample(0, 0)).toBe(false);
  });

  it('restart clears the window', () => {
    const m = new FrameTimeMonitor();
    feed(m, 50, o.window - 1);
    m.restart(0);
    expect(feed(m, 50, o.window - 1, o.cooldownMs)).toBe(-1);
  });
});
