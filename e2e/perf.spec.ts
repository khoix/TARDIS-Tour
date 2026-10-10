import { expect, test } from '@playwright/test';
import { QUALITY, QUALITY_TIERS } from '../src/systems/quality/tiers';
import { budget, openApp, quality, setQuality, waitHero, waitIdle } from './helpers';

/**
 * Performance budgets (Execution 8): draw calls and triangles from renderer.info at the overview,
 * per quality tier. Never frame rates: headless WebGL is SwiftShader on the CPU.
 */
test.describe('performance budget', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('the overview renders within the starting tier budget', async ({ page, isMobile }) => {
    const errors = await openApp(page);
    await waitHero(page);
    await waitIdle(page);
    const q = await quality(page);
    // Desktops start high; touch devices start medium. Test runs never auto-downgrade.
    expect(q.tier).toBe(isMobile ? 'medium' : 'high');
    expect(q.auto).toBe(false);
    expect(q.downgrades).toBe(0);
    const dpr = await page.evaluate(() => window.devicePixelRatio);
    expect(q.pixelRatio).toBe(Math.min(dpr, QUALITY[q.tier].pixelRatioCap));
    expect(q.shadows).toBe(QUALITY[q.tier].shadows);
    expect(q.diegeticLights).toBe(QUALITY[q.tier].diegeticLights);
    const b = await budget(page);
    expect(b.budget).toEqual(QUALITY[q.tier].budget);
    expect(b.calls, `calls ${b.calls}`).toBeGreaterThan(0);
    expect(b.calls).toBeLessThanOrEqual(b.budget.calls);
    expect(b.triangles).toBeLessThanOrEqual(b.budget.triangles);
    expect(b.withinBudget).toBe(true);
    expect(errors).toEqual([]);
  });

  test('every tier stays within its budget, each cheaper than the one above', async ({ page }) => {
    await openApp(page);
    await waitHero(page);
    await waitIdle(page);
    const calls: number[] = [];
    for (const tier of QUALITY_TIERS) {
      await setQuality(page, tier);
      const q = await quality(page);
      expect(q.tier).toBe(tier);
      expect(q.detail).toBe(QUALITY[tier].detail);
      const b = await budget(page);
      expect(b.tier).toBe(tier);
      expect(b.calls, `${tier}: ${b.calls} calls`).toBeLessThanOrEqual(QUALITY[tier].budget.calls);
      expect(b.triangles, `${tier}: ${b.triangles} triangles`).toBeLessThanOrEqual(
        QUALITY[tier].budget.triangles,
      );
      calls.push(b.calls);
    }
    expect(calls[0]).toBeGreaterThan(calls[1] as number);
    expect(calls[1]).toBeGreaterThan(calls[2] as number);
  });

  test('the stats overlay is dev-only: absent by default, shown with ?stats', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('.stats-overlay')).toHaveCount(0);
    await page.goto('/?test&stats');
    await page.waitForFunction(() => window.__tardis?.ready === true);
    const overlay = page.locator('.stats-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText(/tier (high|medium)/);
    await expect(overlay).toContainText(/calls \d+ \/ \d+/);
  });

  test('?quality pins a tier', async ({ page }) => {
    await page.goto('/?test&quality=low');
    await page.waitForFunction(() => window.__tardis?.ready === true);
    expect(await quality(page)).toMatchObject({
      tier: 'low',
      auto: false,
      shadows: false,
      diegeticLights: 0,
      detail: 'reduced',
      ambientMotion: false,
    });
  });
});
