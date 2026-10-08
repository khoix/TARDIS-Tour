import { expect, test } from '@playwright/test';
import { getTransform } from '../src/data/layout';
import { boundsCenter } from '../src/scene/camera/isometric';
import { roomBounds } from '../src/scene/topology';
import {
  camera,
  doubleTap,
  emptyPoint,
  openApp,
  pointOf,
  selection,
  tap,
  waitIdle,
} from './helpers';

function centreOf(id: string): readonly [number, number, number] {
  const t = getTransform(id);
  if (!t) throw new Error(`no transform for ${id}`);
  return boundsCenter(roomBounds(t));
}

test('J3: select a room on the canvas and see its metadata', async ({ page, hasTouch }) => {
  await openApp(page);
  await tap(page, await pointOf(page, 'L-01'), hasTouch);

  await expect.poll(() => selection(page)).toBe('L-01');
  const panel = page.locator('#info-panel');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('heading', { level: 2 })).toHaveText('Library');
  await expect(panel.locator('dt')).toHaveText(['Presence', 'Appearance', 'Scale', 'State']);
  await expect(panel.locator('.evidence-records li').first()).toContainText('Grade');
  await expect(panel.locator('.sources a').first()).toHaveAttribute('href', /^https?:\/\//);
  await expect(page.locator('#room-index button[data-room-id="L-01"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await panel.getByRole('button', { name: 'Close room details' }).click();
  await expect(panel).toBeHidden();
  await expect.poll(() => selection(page)).toBeNull();
});

test('J3: the room index selects on the canvas too', async ({ page }) => {
  await openApp(page);
  const toggle = page.getByRole('button', { name: 'Rooms' });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await page.locator('#room-index button[data-room-id="ENG-01"]').click();
  await expect.poll(() => selection(page)).toBe('ENG-01');
  await expect(page.locator('#info-panel h2')).toHaveText('Engine core');
});

test('J3: clicking empty space clears the selection', async ({ page, hasTouch }) => {
  await openApp(page);
  await tap(page, await pointOf(page, 'E-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('E-01');
  await tap(page, await emptyPoint(page), hasTouch);
  await expect.poll(() => selection(page)).toBeNull();
  await expect(page.locator('#info-panel')).toBeHidden();
});

test('J4: double-click/tap focuses a room', async ({ page, hasTouch }) => {
  await openApp(page);
  const before = await camera(page);
  await doubleTap(page, await pointOf(page, 'E-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('E-01');
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(before.zoom * 1.5);
  await waitIdle(page);
  const after = await camera(page);
  const centre = centreOf('E-01');
  for (let i = 0; i < 3; i++) expect(after.target[i]).toBeCloseTo(centre[i] as number, 3);
  // Focus keeps the current orbit angles.
  expect(after.yawDeg).toBeCloseTo(before.yawDeg, 3);
  expect(after.pitchDeg).toBeCloseTo(before.pitchDeg, 3);
});

test('J4: the panel Focus button focuses the selected room', async ({ page, hasTouch }) => {
  await openApp(page);
  const before = await camera(page);
  await tap(page, await pointOf(page, 'L-01'), hasTouch);
  await page.locator('#info-panel').getByRole('button', { name: 'Focus' }).click();
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(before.zoom * 1.5);
  await waitIdle(page);
  const after = await camera(page);
  const centre = centreOf('L-01');
  for (let i = 0; i < 3; i++) expect(after.target[i]).toBeCloseTo(centre[i] as number, 3);
});
