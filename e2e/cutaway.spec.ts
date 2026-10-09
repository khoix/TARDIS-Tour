import { expect, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import {
  camera,
  openApp,
  pickableRooms,
  pointOf,
  press,
  renderStats,
  selection,
  setCutawayOpen,
  tap,
  visibility,
  visibleRooms,
  waitHero,
  waitIdle,
} from './helpers';

/** J7: cutaway, isolation, then selecting a deep room (Execution 6). */

const ALL = PLACED_ROOMS.map((r) => r.id).sort();
const CORE = PLACED_ROOMS.filter((r) => r.region === 'power-core')
  .map((r) => r.id)
  .sort();

test('J7: isolate the power core, select ENG-01 on the canvas, then reset restores defaults', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  const defaults = await visibility(page);
  expect(defaults).toMatchObject({
    wallFade: true,
    ceilingsHidden: true,
    sectionY: null,
    isolation: null,
    focusMode: false,
  });

  await setCutawayOpen(page, true, hasTouch);
  await page.getByLabel('Isolate').selectOption('region:power-core');
  await expect.poll(async () => (await visibility(page)).isolatedRooms).toEqual(CORE);
  // Context is ghosted, not hidden: everything is still drawn, but only the core takes clicks.
  expect((await visibleRooms(page)).sort()).toEqual(ALL);
  expect((await pickableRooms(page)).sort()).toEqual(CORE);
  await expect(page.locator('.region-label.is-ghosted')).toHaveCount(3);
  await setCutawayOpen(page, false, hasTouch);

  expect(await page.evaluate(() => window.__tardis?.screenPointOf('C-M') ?? null)).toBeNull();
  await tap(page, await pointOf(page, 'ENG-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('ENG-01');
  await expect(page.locator('#info-panel h2')).toHaveText('Engine core');

  await setCutawayOpen(page, true, hasTouch);
  await press(page.getByRole('button', { name: 'Reset cutaway' }), hasTouch);
  await expect.poll(() => visibility(page)).toEqual(defaults);
  expect((await pickableRooms(page)).sort()).toEqual(ALL);
  await expect(page.locator('.is-ghosted')).toHaveCount(0);
  await expect(page.getByLabel('Isolate')).toHaveValue('');
  expect(await selection(page)).toBe('ENG-01');
  expect(errors).toEqual([]);
});

test('J7: focus mode cuts the selected room open and ghosts the rest', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  await waitHero(page);
  const before = await camera(page);
  await tap(page, await pointOf(page, 'E-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('E-01');

  await setCutawayOpen(page, true, hasTouch);
  const focus = page.getByRole('button', { name: 'Focus mode' });
  await press(focus, hasTouch);
  await expect(focus).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await visibility(page)).focusRoom).toBe('E-01');
  expect(await pickableRooms(page)).toEqual(['E-01']);
  expect((await visibleRooms(page)).sort()).toEqual(ALL);
  // Entering focus mode frames the room.
  await waitIdle(page);
  expect((await camera(page)).zoom).toBeGreaterThan(before.zoom * 1.5);
  await setCutawayOpen(page, false, hasTouch);

  // Closing the room ends focus mode.
  await press(page.getByRole('button', { name: 'Close room details' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).focusMode).toBe(false);
  expect((await pickableRooms(page)).sort()).toEqual(ALL);
});

test('J7: wall fade and ceilings change what is drawn and what takes clicks', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  await waitHero(page);
  // Rooms under a coarse grid of canvas points (raw picks, whatever UI covers them).
  const sample = () =>
    page.evaluate(() => {
      const canvas = document.querySelector('#viewport canvas');
      const hook = window.__tardis;
      if (!canvas || !hook) throw new Error('no canvas or hook');
      const r = canvas.getBoundingClientRect();
      const out: (string | null)[] = [];
      for (let fy = 0.025; fy < 1; fy += 0.025) {
        for (let fx = 0.025; fx < 1; fx += 0.025) {
          out.push(hook.roomAt(r.left + r.width * fx, r.top + r.height * fy));
        }
      }
      return out;
    });
  const faded = await sample();

  await setCutawayOpen(page, true, hasTouch);
  const walls = page.getByLabel('Fade near walls');
  await press(walls, hasTouch);
  await expect(walls).not.toBeChecked();
  await expect.poll(async () => (await visibility(page)).wallFade).toBe(false);
  const walled = await sample();
  // Near walls now take the clicks that passed through them into the rooms behind.
  expect(walled.filter((id, i) => id !== faded[i]).length).toBeGreaterThan(0);

  const before = (await renderStats(page)).triangles;
  const ceilings = page.getByLabel('Hide ceilings');
  await press(ceilings, hasTouch);
  await expect(ceilings).not.toBeChecked();
  await expect.poll(async () => (await renderStats(page)).triangles).toBeGreaterThan(before);
  await press(ceilings, hasTouch);
  await expect.poll(async () => (await renderStats(page)).triangles).toBe(before);
});

test('J7: cutaway controls are touch-sized and the panel fits the viewport', async ({
  page,
  hasTouch,
}) => {
  await openApp(page);
  await setCutawayOpen(page, true, hasTouch);
  const panel = page.locator('#cutaway-panel');
  const viewport = page.viewportSize();
  const box = await panel.boundingBox();
  if (!viewport || !box) throw new Error('no viewport or panel box');
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

  const targets = panel.locator('label.check, input[type="range"], select, button');
  const count = await targets.count();
  expect(count).toBe(8);
  for (let i = 0; i < count; i++) {
    const t = await targets.nth(i).boundingBox();
    if (!t) throw new Error(`control ${i} has no box`);
    expect(t.width, `control ${i} width`).toBeGreaterThanOrEqual(44);
    expect(t.height, `control ${i} height`).toBeGreaterThanOrEqual(44);
  }

  await press(page.getByRole('button', { name: 'Lower section' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).sectionY).toBe(13);
  await expect(page.locator('#cutaway-panel output')).toHaveText('+13 NU');
  await press(page.getByRole('button', { name: 'Raise section' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).sectionY).toBeNull();
  // Keyboard: the slider steps the section down from its top (no section).
  const slider = page.getByLabel('Section height');
  const top = Number(await slider.getAttribute('max'));
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await visibility(page)).sectionY).toBe(top - 0.5);

  if (hasTouch) {
    // On narrow screens the room index and the cutaway panel take turns.
    await press(page.getByRole('button', { name: 'Rooms' }), hasTouch);
    await expect(page.locator('#room-index')).toBeVisible();
    await expect(panel).toBeHidden();
  }
});
