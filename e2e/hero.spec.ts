import { fileURLToPath } from 'node:url';
import { expect, type Page, test } from '@playwright/test';
import type { RegionId } from '../src/data/types';
import { getRoom } from '../src/data/rooms';
import { HERO_ROOM_IDS } from '../src/world/rooms/hero/describe';
import { openApp, pointOf, selection, tap, waitHero, waitIdle } from './helpers';

test('hero rooms load lazily without blocking the first, usable greybox view', async ({
  page,
  hasTouch,
}) => {
  // Hold the hero chunk until the greybox view has been used.
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route('**/assets/heroRooms-*.js', async (route) => {
    requested = true;
    await held;
    await route.continue();
  });
  const errors = await openApp(page);
  await expect.poll(() => requested, 'hero chunk requested after the first frame').toBe(true);
  expect(await page.evaluate(() => window.__tardis?.heroReady)).toBe(false);
  await tap(page, await pointOf(page, 'L-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('L-01');

  release();
  await waitHero(page);
  // The selection survives the hero rooms arriving, and still resolves to the same room.
  expect(await selection(page)).toBe('L-01');
  expect(errors).toEqual([]);
});

test('each hero room is selectable on the canvas and its panel shows its evidence', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  await waitHero(page);
  for (const id of HERO_ROOM_IDS) {
    const room = getRoom(id);
    if (!room) throw new Error(`no room ${id}`);
    await page.evaluate(() => window.__tardis?.select(null));
    await tap(page, await pointOf(page, id), hasTouch);
    await expect.poll(() => selection(page), id).toBe(id);
    await expect(page.locator('#info-panel h2')).toHaveText(room.name);
    await expect(page.locator('#info-panel .evidence-records li')).toHaveCount(
      room.evidence.length,
    );
    await expect(page.locator('#info-panel .evidence-records li')).toHaveText(
      room.evidence.map((r) => new RegExp(`^Grade ${r.grade} — `)),
    );
    await expect(page.locator('#info-panel .evidence-axes dt')).toHaveCount(5);
  }
});

test('the reconfiguring ARS door and the portal carry feature labels', async ({ page }) => {
  await openApp(page);
  await waitHero(page);
  await expect(page.locator('.feature-label')).toHaveText([/reconfigures/, /^B28 portal/]);
});

async function regionBaseline(page: Page, region: RegionId, name: string) {
  // Reduced motion freezes the rotor rings at rest and makes the focus jump immediate.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  await waitHero(page);
  await page.evaluate((r) => window.__tardis?.focusRegion(r), region);
  await waitIdle(page);
  await expect(page.locator('#viewport canvas')).toHaveScreenshot(name, {
    stylePath: fileURLToPath(new URL('./baseline.css', import.meta.url)),
    maxDiffPixelRatio: 0.01,
  });
}

test('visual baseline: library region', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'baselines are desktop-only');
  await regionBaseline(page, 'cultural', 'library-region.png');
});

test('visual baseline: power-core region', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'baselines are desktop-only');
  await regionBaseline(page, 'power-core', 'power-core-region.png');
});
