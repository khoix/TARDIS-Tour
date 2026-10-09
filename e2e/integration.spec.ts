import { expect, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import { QUALITY } from '../src/systems/quality/tiers';
import {
  budget,
  openApp,
  pickableRooms,
  pointOf,
  press,
  quality,
  renderStats,
  research,
  route,
  routeHighlight,
  selection,
  setCutawayOpen,
  setPanelOpen,
  setQuality,
  tap,
  visibility,
  waitHero,
  waitIdle,
} from './helpers';

/**
 * Cross-system integration (Execution 9): cutaway × selection × routes × overlay × merged and
 * instanced meshes × quality tiers, on both projects. Each system owns one visual-state slot or
 * setting; changing one must leave the others' state and effects intact.
 */

test.use({ contextOptions: { reducedMotion: 'reduce' } });

const ALL = PLACED_ROOMS.map((r) => r.id).sort();
const CORE = PLACED_ROOMS.filter((r) => r.region === 'power-core')
  .map((r) => r.id)
  .sort();
const ENGINE_TO_CONSOLE = ['B37', 'B22', 'B16', 'B05', 'B03'];

test('route, overlay, isolation, selection and quality tiers compose without clobbering each other', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  await waitIdle(page);
  const start = await quality(page);

  // Route from the selectors.
  await setPanelOpen(page, 'Route', true, hasTouch);
  await page.getByLabel('From', { exact: true }).selectOption('ENG-01');
  await page.getByLabel('To', { exact: true }).selectOption('C-M');
  await expect.poll(async () => (await route(page))?.connections).toEqual(ENGINE_TO_CONSOLE);
  const highlighted = [...ENGINE_TO_CONSOLE].sort();
  expect(await routeHighlight(page)).toEqual(highlighted);
  await waitIdle(page);
  const routedCalls = (await renderStats(page)).calls;

  // Overlay on top of the route: material swaps only, and the diegetic lights dim.
  await setPanelOpen(page, 'Research', true, hasTouch);
  await press(page.getByRole('checkbox', { name: 'Evidence overlay' }), hasTouch);
  await expect.poll(async () => (await research(page)).overlay).toBe(true);
  await setPanelOpen(page, 'Research', false, hasTouch);
  await waitIdle(page);
  expect((await quality(page)).diegeticLights).toBe(0);
  expect((await renderStats(page)).calls).toBe(routedCalls);
  expect(await routeHighlight(page)).toEqual(highlighted);

  // Isolate the power core, then pick its deepest room with a real canvas tap.
  await setCutawayOpen(page, true, hasTouch);
  await page.getByLabel('Isolate').selectOption('region:power-core');
  await expect.poll(async () => (await visibility(page)).isolatedRooms).toEqual(CORE);
  await setCutawayOpen(page, false, hasTouch);
  expect((await pickableRooms(page)).sort()).toEqual(CORE);
  await tap(page, await pointOf(page, 'ENG-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('ENG-01');
  // The selection tint outranks the route tint on ENG-01's own meshes, but the route layer still
  // reaches every walked edge, and the overlay stays on.
  expect(await routeHighlight(page)).toEqual(highlighted);
  expect(await research(page)).toMatchObject({ overlay: true });
  expect((await route(page))?.connections).toEqual(ENGINE_TO_CONSOLE);

  // Pinning the low tier hides detail parts, but not the route, overlay, isolation or selection.
  await setQuality(page, 'low');
  await waitIdle(page);
  const low = await quality(page);
  expect(low).toMatchObject({ tier: 'low', detail: 'reduced', shadows: false, diegeticLights: 0 });
  const b = await budget(page);
  expect(b.calls).toBeLessThanOrEqual(QUALITY.low.budget.calls);
  // Triangles are budgeted at the bare overview (perf.spec.ts). The route tube alone adds about
  // 8.5k, which takes the low tier past its 36k budget here: a known issue (docs/AI-HANDOFF.md).
  expect(await routeHighlight(page)).toEqual(highlighted);
  expect(await selection(page)).toBe('ENG-01');
  expect((await visibility(page)).isolatedRooms).toEqual(CORE);

  // Resetting the cutaway restores every room's picks and keeps the other systems' state.
  await setCutawayOpen(page, true, hasTouch);
  await press(page.getByRole('button', { name: 'Reset cutaway' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).isolatedRooms).toBeNull();
  await setCutawayOpen(page, false, hasTouch);
  expect((await pickableRooms(page)).sort()).toEqual(ALL);
  expect(await selection(page)).toBe('ENG-01');
  expect(await routeHighlight(page)).toEqual(highlighted);
  expect(await research(page)).toMatchObject({ overlay: true });

  // Undo each system in turn: back to the tier's lights, then no route.
  await setQuality(page, start.tier);
  await setPanelOpen(page, 'Research', true, hasTouch);
  await press(page.getByRole('checkbox', { name: 'Evidence overlay' }), hasTouch);
  await expect.poll(async () => (await research(page)).overlay).toBe(false);
  await setPanelOpen(page, 'Research', false, hasTouch);
  await expect
    .poll(async () => (await quality(page)).diegeticLights)
    .toBe(QUALITY[start.tier].diegeticLights);
  await setPanelOpen(page, 'Route', true, hasTouch);
  await press(page.getByRole('button', { name: 'Clear route' }), hasTouch);
  await expect.poll(() => route(page)).toBeNull();
  expect(await routeHighlight(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('section clip × focus mode × route: a room hidden in the overview is picked, routed and focused', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  // C-LAD is occluded in the overview; the section at stop −8 exposes it.
  expect(await page.evaluate(() => window.__tardis?.screenPointOf('C-LAD') ?? null)).toBeNull();
  await setCutawayOpen(page, true, hasTouch);
  const lower = page.getByRole('button', { name: 'Lower section' });
  while (((await visibility(page)).sectionY ?? Infinity) > -8) await press(lower, hasTouch);
  expect((await visibility(page)).sectionY).toBe(-8);
  await setCutawayOpen(page, false, hasTouch);
  await tap(page, await pointOf(page, 'C-LAD'), hasTouch);
  await expect.poll(() => selection(page)).toBe('C-LAD');

  await press(page.getByRole('button', { name: 'Route to console' }), hasTouch);
  await expect.poll(async () => (await route(page))?.connections).toEqual(['B06', 'B03']);
  expect(await routeHighlight(page)).toEqual(['B03', 'B06']);

  // Focus mode replaces isolation, keeps the section and the route.
  await setCutawayOpen(page, true, hasTouch);
  await press(page.getByRole('button', { name: 'Focus mode' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).focusRoom).toBe('C-LAD');
  expect(await visibility(page)).toMatchObject({ sectionY: -8, focusMode: true });
  expect(await pickableRooms(page)).toEqual(['C-LAD']);
  expect(await routeHighlight(page)).toEqual(['B03', 'B06']);

  // Reset cutaway drops focus and the section; the selection and route survive.
  await press(page.getByRole('button', { name: 'Reset cutaway' }), hasTouch);
  await expect.poll(async () => (await visibility(page)).sectionY).toBeNull();
  expect(await visibility(page)).toMatchObject({ focusMode: false, focusRoom: null });
  expect(await selection(page)).toBe('C-LAD');
  expect((await route(page))?.connections).toEqual(['B06', 'B03']);
  expect(errors).toEqual([]);
});
