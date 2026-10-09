import { fileURLToPath } from 'node:url';
import { expect, type Page, test } from '@playwright/test';
import { CLOSED_DOOR_LABEL } from '../src/world/rooms/console/describe';
import { openApp, pointOf, renderStats, selection, tap, waitHero, waitIdle } from './helpers';

/** Resolves after `count` animation frames, so frame counters can be compared without sleeps. */
async function animationFrames(page: Page, count: number): Promise<void> {
  await page.evaluate(
    (n) =>
      new Promise<void>((resolve) => {
        let seen = 0;
        const step = () => (++seen >= n ? resolve() : requestAnimationFrame(step));
        requestAnimationFrame(step);
      }),
    count,
  );
}

test('console decks are separately selectable on the canvas', async ({ page, hasTouch }) => {
  await openApp(page);
  for (const [id, name] of [
    ['C-U', 'Console room — upper gallery'],
    ['C-L', 'Console room — lower technical deck'],
    ['C-M', 'Console room — main deck'],
  ] as const) {
    await tap(page, await pointOf(page, id), hasTouch);
    await expect.poll(() => selection(page)).toBe(id);
    await expect(page.locator('#info-panel h2')).toHaveText(name);
  }
});

test('the two unconnected reported doors are labelled', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('.door-label')).toHaveText([CLOSED_DOOR_LABEL, CLOSED_DOOR_LABEL]);
});

test('rotor rings turn, and stop under prefers-reduced-motion', async ({ page }) => {
  await openApp(page);
  const moving = (await renderStats(page)).frames;
  await animationFrames(page, 10);
  expect((await renderStats(page)).frames).toBeGreaterThan(moving);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await animationFrames(page, 2);
  const still = (await renderStats(page)).frames;
  await animationFrames(page, 10);
  expect((await renderStats(page)).frames).toBe(still);
});

test('visual baseline: console room', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'baselines are desktop-only');
  // Reduced motion freezes the rotor rings at rest and makes the focus jump immediate.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  await waitHero(page);
  await page.evaluate(() => window.__tardis?.focusRegion('control-nexus'));
  await waitIdle(page);
  await expect(page.locator('#viewport canvas')).toHaveScreenshot('console-room.png', {
    stylePath: fileURLToPath(new URL('./baseline.css', import.meta.url)),
    maxDiffPixelRatio: 0.01,
  });
});
