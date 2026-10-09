import { expect, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import { getTransform } from '../src/data/layout';
import {
  boundsCenter,
  ISO_PITCH_DEG,
  ISO_YAW_DEG,
  unionBounds,
} from '../src/scene/camera/isometric';
import { roomBounds } from '../src/scene/topology';
import {
  camera,
  canvasCenter,
  openApp,
  renderStats,
  touchGesture,
  visibleRooms,
  waitIdle,
} from './helpers';

test('J1: scene loads with every placed room rendered', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.locator('#viewport canvas')).toBeVisible();
  const stats = await renderStats(page);
  expect(stats.calls).toBeGreaterThan(0);
  expect(stats.triangles).toBeGreaterThan(0);
  const visible = await visibleRooms(page);
  expect(visible.sort()).toEqual(PLACED_ROOMS.map((r) => r.id).sort());
  await expect(page.locator('.region-label')).toHaveCount(4);
  await expect(page.locator('#room-index button[data-room-id]')).toHaveCount(PLACED_ROOMS.length);
  const cam = await camera(page);
  expect(cam.yawDeg).toBeCloseTo(ISO_YAW_DEG, 3);
  expect(cam.pitchDeg).toBeCloseTo(ISO_PITCH_DEG, 3);
  expect(errors).toEqual([]);
});

test('J2: orbit, pan and zoom, then reset view', async ({ page, hasTouch }) => {
  await openApp(page);
  const home = await camera(page);
  const c = await canvasCenter(page);

  if (hasTouch) {
    // One finger orbits.
    await touchGesture(page, [c], [{ x: c.x + 80, y: c.y + 20 }]);
  } else {
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x + 120, c.y + 30, { steps: 8 });
    await page.mouse.up();
  }
  const orbited = await camera(page);
  expect(Math.abs(orbited.yawDeg - home.yawDeg)).toBeGreaterThan(5);
  expect(orbited.zoom).toBeCloseTo(home.zoom, 5);

  if (hasTouch) {
    // Two fingers spreading apart: pinch zoom in, and pan by the midpoint's travel.
    await touchGesture(
      page,
      [
        { x: c.x - 30, y: c.y },
        { x: c.x + 30, y: c.y },
      ],
      [
        { x: c.x - 90, y: c.y + 60 },
        { x: c.x + 90, y: c.y + 60 },
      ],
    );
  } else {
    await page.mouse.move(c.x, c.y);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(c.x - 100, c.y + 60, { steps: 8 });
    await page.mouse.up({ button: 'right' });
    await page.mouse.wheel(0, -400);
  }
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(orbited.zoom * 1.1);
  const moved = await camera(page);
  const panDistance = Math.hypot(
    moved.target[0] - orbited.target[0],
    moved.target[1] - orbited.target[1],
    moved.target[2] - orbited.target[2],
  );
  expect(panDistance).toBeGreaterThan(1);

  await page.getByRole('button', { name: 'Home' }).click();
  await waitIdle(page);
  const reset = await camera(page);
  expect(reset.yawDeg).toBeCloseTo(home.yawDeg, 3);
  expect(reset.pitchDeg).toBeCloseTo(home.pitchDeg, 3);
  expect(reset.zoom).toBeCloseTo(home.zoom, 5);
  for (let i = 0; i < 3; i++) expect(reset.target[i]).toBeCloseTo(home.target[i] as number, 3);
});

test('region focus buttons frame their region', async ({ page }) => {
  await openApp(page);
  const home = await camera(page);
  await page.getByRole('button', { name: 'Power core' }).click();
  await waitIdle(page);
  const focused = await camera(page);
  const core = unionBounds(
    PLACED_ROOMS.filter((r) => r.region === 'power-core').map((r) => {
      const t = getTransform(r.id);
      if (!t) throw new Error(`no transform for ${r.id}`);
      return roomBounds(t);
    }),
  );
  const centre = boundsCenter(core);
  for (let i = 0; i < 3; i++) expect(focused.target[i]).toBeCloseTo(centre[i] as number, 3);
  expect(focused.zoom).not.toBeCloseTo(home.zoom, 3);
});
