import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import {
  camera,
  openApp,
  pointOf,
  press,
  selection,
  setCutawayOpen,
  tap,
  visibility,
  waitHero,
  waitIdle,
} from './helpers';

/**
 * Placed rooms with no exposed canvas pixel in the default overview, why, and the section
 * height of the cutaway's elevation clip (Execution 6) that exposes each on the canvas.
 */
const HIDDEN_IN_OVERVIEW: Readonly<Record<string, { reason: string; sectionY: number }>> = {
  'C-LAD': {
    reason: 'ladder compartment under the lower deck, beneath the console',
    sectionY: -8,
  },
};

test('every placed Tier-1 room is selectable on the canvas from the overview', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  const home = await camera(page);
  const shown = PLACED_ROOMS.filter((r) => !(r.id in HIDDEN_IN_OVERVIEW));
  expect(shown.length).toBe(PLACED_ROOMS.length - Object.keys(HIDDEN_IN_OVERVIEW).length);
  for (const room of shown) {
    // Close the previous room's panel so it never covers the next room's pixels.
    await page.evaluate(() => window.__tardis?.select(null));
    await tap(page, await pointOf(page, room.id), hasTouch);
    await expect.poll(() => selection(page), room.id).toBe(room.id);
  }
  // Selecting never moves the camera: this was the overview throughout.
  const after = await camera(page);
  expect(after.zoom).toBeCloseTo(home.zoom, 6);
  for (let i = 0; i < 3; i++) expect(after.target[i]).toBeCloseTo(home.target[i] as number, 6);
});

test('J7: rooms hidden in the overview are selectable on the canvas under the section clip', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  for (const [id, { sectionY }] of Object.entries(HIDDEN_IN_OVERVIEW)) {
    const point = await page.evaluate((r) => window.__tardis?.screenPointOf(r) ?? null, id);
    expect(point, `${id} became visible: move it to the canvas test`).toBeNull();
    // Step the section down level by level until it exposes the room.
    await setCutawayOpen(page, true, hasTouch);
    const lower = page.getByRole('button', { name: 'Lower section' });
    while (((await visibility(page)).sectionY ?? Infinity) > sectionY) {
      await expect(lower).toBeEnabled();
      await press(lower, hasTouch);
    }
    expect((await visibility(page)).sectionY).toBe(sectionY);
    await setCutawayOpen(page, false, hasTouch);
    await tap(page, await pointOf(page, id), hasTouch);
    await expect.poll(() => selection(page)).toBe(id);
    // Back to the default view: the room is occluded again.
    await page.evaluate(() => window.__tardis?.select(null));
    await setCutawayOpen(page, true, hasTouch);
    await press(page.getByRole('button', { name: 'Reset cutaway' }), hasTouch);
    await setCutawayOpen(page, false, hasTouch);
    await expect
      .poll(() => page.evaluate((r) => window.__tardis?.screenPointOf(r) ?? null, id))
      .toBeNull();
  }
});

test('the authored engine bypass B37 is labelled INF-E', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('.edge-label')).toHaveText([/^B37 · INF-E/]);
});

test('visual baseline: overview', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'baselines are desktop-only');
  // Reduced motion freezes the rotor rings at rest.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  await waitHero(page);
  await waitIdle(page);
  await expect(page.locator('#viewport canvas')).toHaveScreenshot('overview.png', {
    stylePath: fileURLToPath(new URL('./baseline.css', import.meta.url)),
    maxDiffPixelRatio: 0.01,
  });
});
