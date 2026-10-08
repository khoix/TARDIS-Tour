import { expect, test } from '@playwright/test';
import { openApp, pointOf, selection } from './helpers';

test.describe('J8: mobile', () => {
  test.skip(({ hasTouch }) => !hasTouch, 'touch-only journey');

  test('tap selects, the panel is compact and inside the viewport', async ({ page }) => {
    await openApp(page);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('no viewport');

    const p = await pointOf(page, 'ARS-01');
    await page.touchscreen.tap(p.x, p.y);
    await expect.poll(() => selection(page)).toBe('ARS-01');

    const panel = page.locator('#info-panel');
    await expect(panel).toBeVisible();
    const within = async (maxHeightFraction: number) => {
      const box = await panel.boundingBox();
      if (!box) throw new Error('panel has no bounding box');
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(box.height).toBeLessThanOrEqual(viewport.height * maxHeightFraction);
    };
    // Collapsed by default: name and actions only, so most of the canvas stays usable.
    await expect(panel.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(panel.locator('dl')).toBeHidden();
    await within(0.25);

    await panel.getByRole('button', { name: 'Details', exact: true }).tap();
    await expect(panel.locator('dl')).toBeVisible();
    await within(0.5);

    await panel.getByRole('button', { name: 'Close room details' }).tap();
    await expect(panel).toBeHidden();
  });

  test('controls are touch-sized and the room index starts collapsed', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('#room-index')).toBeHidden();
    const buttons = page.locator('.toolbar button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) throw new Error(`toolbar button ${i} has no box`);
      expect(box.width, `button ${i} width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `button ${i} height`).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole('button', { name: 'Rooms' }).tap();
    await expect(page.locator('#room-index')).toBeVisible();
    await page.locator('#room-index button[data-room-id="L-01"]').tap();
    await expect.poll(() => selection(page)).toBe('L-01');
    // Picking from the index closes it so the canvas and panel stay visible.
    await expect(page.locator('#room-index')).toBeHidden();
  });
});
