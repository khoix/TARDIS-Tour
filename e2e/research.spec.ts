import { expect, type Page, test } from '@playwright/test';
import { PLACED_ROOMS } from '../src/data/rooms';
import {
  openApp,
  pointOf,
  press,
  renderStats,
  research,
  selection,
  setPanelOpen,
  tap,
  waitHero,
  waitIdle,
} from './helpers';

/** J5: evidence overlay and legend; progressive label modes (Execution 7). */

// Rotor rings at rest, so two renders of the same state are pixel-identical.
test.use({ contextOptions: { reducedMotion: 'reduce' } });

const canvasShot = async (page: Page) => {
  await waitIdle(page);
  return page.locator('#viewport canvas').screenshot();
};

test('J5: the evidence overlay recolours the model, with a legend, and turns off cleanly', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  const before = await canvasShot(page);
  const calls = (await renderStats(page)).calls;

  await setPanelOpen(page, 'Research', true, hasTouch);
  const legend = page.getByRole('list', { name: 'Evidence overlay legend' });
  await expect(legend).toBeHidden();
  await press(page.getByRole('checkbox', { name: 'Evidence overlay' }), hasTouch);
  await expect.poll(async () => (await research(page)).overlay).toBe(true);
  await expect(legend).toBeVisible();
  await expect(legend.locator('li')).toHaveText([
    /^Sourced — /,
    /^Reconstructed — /,
    /^Inferred — /,
    /^Speculative — /,
    /^Portal — /,
  ]);
  for (const swatch of await legend.locator('.swatch').all()) await expect(swatch).toBeVisible();
  await setPanelOpen(page, 'Research', false, hasTouch);

  const overlaid = await canvasShot(page);
  expect(overlaid.equals(before)).toBe(false);
  // Colour variants are material swaps: no extra draw calls.
  expect((await renderStats(page)).calls).toBe(calls);

  await setPanelOpen(page, 'Research', true, hasTouch);
  await press(page.getByRole('checkbox', { name: 'Evidence overlay' }), hasTouch);
  await expect.poll(async () => (await research(page)).overlay).toBe(false);
  await setPanelOpen(page, 'Research', false, hasTouch);
  expect((await canvasShot(page)).equals(before)).toBe(true);
  expect(errors).toEqual([]);
});

test('label modes: regions by default, the selection, research grades, structure IDs', async ({
  page,
  hasTouch,
}) => {
  const errors = await openApp(page);
  await waitHero(page);
  const layer = page.locator('.label-layer');
  await expect(layer).toHaveAttribute('data-label-mode', 'default');
  await expect(page.locator('.region-label:visible')).toHaveCount(4);
  await expect(page.locator('.room-label:visible')).toHaveCount(0);
  await expect(page.locator(':is(.door-label, .edge-label, .anchor-label):visible')).toHaveCount(0);

  // Selecting a room names it.
  await tap(page, await pointOf(page, 'E-01'), hasTouch);
  await expect.poll(() => selection(page)).toBe('E-01');
  const selected = page.locator('.room-label.is-selected');
  await expect(selected).toBeVisible();
  await expect(selected).toHaveText('E-01 · Eye of Harmony chamber and catwalk', {
    useInnerText: true,
  });

  await setPanelOpen(page, 'Research', true, hasTouch);
  await press(page.getByRole('radio', { name: /^Research/ }), hasTouch);
  await expect(layer).toHaveAttribute('data-label-mode', 'research');
  expect((await research(page)).labelMode).toBe('research');
  await expect(page.locator('.room-label:visible')).toHaveCount(PLACED_ROOMS.length);
  await expect(page.locator('.room-label .label-grades:visible')).toHaveCount(PLACED_ROOMS.length);
  await expect(page.locator('.door-label:visible')).toHaveCount(2);
  await expect(page.locator('.edge-label:visible')).toHaveText([/^B37 · INF-E/]);
  await expect(page.locator('.anchor-label:visible')).toHaveCount(0);

  await press(page.getByRole('radio', { name: /^Structure/ }), hasTouch);
  await expect(layer).toHaveAttribute('data-label-mode', 'structure');
  await expect(page.locator('.room-label .label-grades:visible')).toHaveCount(0);
  await expect(page.locator('.feature-label:visible')).toHaveCount(0);
  // Anchors and edge labels wait until zoomed in.
  await expect(layer).toHaveAttribute('data-zoom', 'far');
  await expect(page.locator('.anchor-label:visible')).toHaveCount(0);
  await setPanelOpen(page, 'Research', false, hasTouch);
  await press(page.locator('#info-panel').getByRole('button', { name: 'Focus' }), hasTouch);
  await waitIdle(page);
  await expect(layer).not.toHaveAttribute('data-zoom', 'far');
  await expect(page.locator('.anchor-label:visible').first()).toBeVisible();
  await expect(page.locator('.connection-label:visible').first()).toHaveText(/^B\d\d · \w+/);
  expect(errors).toEqual([]);
});
