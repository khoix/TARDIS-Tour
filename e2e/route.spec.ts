import { expect, test } from '@playwright/test';
import {
  openApp,
  press,
  route,
  routeHighlight,
  selection,
  setPanelOpen,
  waitHero,
} from './helpers';

/** J6: route to the console, and between any two rooms (Execution 7). */

const ENGINE_TO_CONSOLE = ['B37', 'B22', 'B16', 'B05', 'B03'];

test('J6: route to console from ENG-01 highlights the walked edges and lists the steps', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  await setPanelOpen(page, 'Rooms', true, hasTouch);
  await press(page.locator('button[data-room-id="ENG-01"]'), hasTouch);
  await expect.poll(() => selection(page)).toBe('ENG-01');

  await press(page.getByRole('button', { name: 'Route to console' }), hasTouch);
  await expect(page.locator('#route-panel')).toBeVisible();
  await expect.poll(async () => (await route(page))?.connections).toEqual(ENGINE_TO_CONSOLE);
  const planned = await route(page);
  expect(planned).toMatchObject({
    from: 'ENG-01',
    to: 'C-M',
    allowPortal: false,
    rooms: ['ENG-01', 'M-02', 'M-01', 'C-XL', 'C-L', 'C-M'],
    kinds: ['corridor', 'corridor', 'corridor', 'doorway', 'stairs'],
  });
  // The route layer reaches the real meshes of exactly those edges.
  expect(await routeHighlight(page)).toEqual([...ENGINE_TO_CONSOLE].sort());

  const steps = page.locator('.route-steps li');
  await expect(steps).toHaveCount(5);
  expect(
    await steps.evaluateAll((li) => li.map((l) => (l as HTMLElement).dataset.connectionId)),
  ).toEqual(ENGINE_TO_CONSOLE);
  await expect(steps.first()).toHaveText(/^Corridor · B37: .*\(ENG-01\) → .*\(M-02\)$/);
  await expect(steps.last()).toHaveText(/^Stairs · B03: .*\(C-L\) → .*\(C-M\)$/);
  await expect(page.locator('.route-summary')).toHaveText(/^5 steps · [\d.]+ NU walked$/);
  await expect(page.getByLabel('From', { exact: true })).toHaveValue('ENG-01');
  await expect(page.getByLabel('To', { exact: true })).toHaveValue('C-M');

  // Allowing the portal takes the shorter way through B28.
  await press(page.getByLabel('Allow portal (B28)'), hasTouch);
  await expect.poll(async () => (await route(page))?.connections[0]).toBe('B28');
  const viaPortal = await route(page);
  expect(viaPortal?.connections).not.toContain('B37');
  expect(viaPortal?.kinds[0]).toBe('vestibule_portal');
  expect(viaPortal?.length).toBeLessThan(planned?.length ?? 0);
  await expect(steps.first()).toHaveText(/^Portal · B28: /);
  await expect(page.locator('.route-summary')).toHaveText(/through portal B28$/);
  expect(errors).toEqual([]);
});

test('J6: route between any two rooms from the selectors, then clear it', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await setPanelOpen(page, 'Route', true, hasTouch);
  await expect(page.locator('.route-summary')).toHaveText('Choose a start and a destination.');
  await page.getByLabel('From', { exact: true }).selectOption('L-01');
  await page.getByLabel('To', { exact: true }).selectOption('S-01');
  const expected = ['B09', 'B08', 'B07', 'B04', 'B02', 'B03', 'B05', 'B16', 'B17'];
  await expect.poll(async () => (await route(page))?.connections).toEqual(expected);
  expect(await routeHighlight(page)).toEqual([...expected].sort());
  await expect(page.locator('.route-steps li')).toHaveCount(expected.length);
  await expect(page.locator('.route-steps li').nth(4)).toHaveText(/^Stairs · B02: /);
  // The route's rooms and edges are labelled even in the default label mode.
  await expect(page.locator('.room-label.on-route:visible')).toHaveCount(10);

  await press(page.getByRole('button', { name: 'Clear route' }), hasTouch);
  await expect.poll(() => route(page)).toBeNull();
  expect(await routeHighlight(page)).toEqual([]);
  await expect(page.locator('.route-steps li')).toHaveCount(0);
  await expect(page.locator('.on-route')).toHaveCount(0);
  expect(errors).toEqual([]);
});
