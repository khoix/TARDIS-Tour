import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import { camera, openApp, pointOf, selection, tap, waitHero, waitIdle } from './helpers';

/**
 * Placed rooms with no exposed canvas pixel in the default overview, and why. They are
 * selected from the room index until the cutaway system (Execution 6) exposes them; its
 * elevation clip must make each one clickable on the canvas.
 */
const HIDDEN_IN_OVERVIEW: Readonly<Record<string, string>> = {
  'C-LAD': 'ladder compartment under the lower deck, beneath the console',
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

test('rooms hidden in the overview are occluded on the canvas and selectable from the index', async ({
  page,
}) => {
  await openApp(page);
  for (const id of Object.keys(HIDDEN_IN_OVERVIEW)) {
    const point = await page.evaluate((r) => window.__tardis?.screenPointOf(r) ?? null, id);
    expect(point, `${id} became visible: move it to the canvas test`).toBeNull();
    const toggle = page.getByRole('button', { name: 'Rooms' });
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    await page.locator(`#room-index button[data-room-id="${id}"]`).click();
    await expect.poll(() => selection(page)).toBe(id);
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
