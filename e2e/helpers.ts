import { expect, type Page } from '@playwright/test';
import type { CameraState } from '../src/scene/viewer';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Loads the app with the test hook enabled and waits for the first rendered frame. */
export async function openApp(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/?test');
  await page.waitForFunction(() => window.__tardis?.ready === true);
  return errors;
}

/** Waits until the lazily loaded hero rooms (Execution 5) are in the scene. */
export async function waitHero(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__tardis?.heroReady === true);
}

/** Throws inside the page when the hook is missing, so failures name the real cause. */
export async function camera(page: Page): Promise<CameraState> {
  return page.evaluate(() => {
    if (!window.__tardis) throw new Error('window.__tardis missing');
    return window.__tardis.camera();
  });
}

export async function selection(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    if (!window.__tardis) throw new Error('window.__tardis missing');
    return window.__tardis.selection();
  });
}

export async function visibleRooms(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    if (!window.__tardis) throw new Error('window.__tardis missing');
    return window.__tardis.visibleRooms();
  });
}

export async function renderStats(
  page: Page,
): Promise<{ frames: number; calls: number; triangles: number }> {
  return page.evaluate(() => {
    if (!window.__tardis) throw new Error('window.__tardis missing');
    return window.__tardis.renderStats();
  });
}

/** Waits until no focus/reset camera transition is running. */
export async function waitIdle(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__tardis?.animating() === false);
}

export async function pointOf(page: Page, id: string): Promise<Point> {
  const point = await page.evaluate((roomId) => window.__tardis?.screenPointOf(roomId) ?? null, id);
  expect(point, `no exposed canvas pixel for ${id}`).not.toBeNull();
  return point as Point;
}

/** Clicks with the mouse, or taps on touch projects. */
export async function tap(page: Page, p: Point, hasTouch: boolean): Promise<void> {
  if (hasTouch) await page.touchscreen.tap(p.x, p.y);
  else await page.mouse.click(p.x, p.y);
}

/** Double-click, or two quick taps on touch projects. */
export async function doubleTap(page: Page, p: Point, hasTouch: boolean): Promise<void> {
  if (hasTouch) {
    await page.touchscreen.tap(p.x, p.y);
    await page.touchscreen.tap(p.x, p.y);
  } else {
    await page.mouse.dblclick(p.x, p.y);
  }
}

type TouchPoint = { x: number; y: number; id: number };

/**
 * Real multi-touch input through the Chrome DevTools Protocol (Playwright's touchscreen only
 * taps). Each frame lists the active touch points; points move linearly over `steps`.
 */
export async function touchGesture(
  page: Page,
  from: readonly Point[],
  to: readonly Point[],
  steps = 12,
): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const frame = (t: number): TouchPoint[] =>
    from.map((p, i) => {
      const q = to[i] as Point;
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, id: i };
    });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: frame(0) });
  for (let s = 1; s <= steps; s++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: frame(s / steps),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

export async function canvasCenter(page: Page): Promise<Point> {
  const box = await page.locator('#viewport canvas').boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** A canvas point not covered by UI where a click hits no room (scanned on a coarse grid). */
export async function emptyPoint(page: Page): Promise<Point> {
  const point = await page.evaluate(() => {
    const canvas = document.querySelector('#viewport canvas');
    const hook = window.__tardis;
    if (!canvas || !hook) return null;
    const r = canvas.getBoundingClientRect();
    for (let fy = 0.05; fy < 1; fy += 0.1) {
      for (let fx = 0.05; fx < 1; fx += 0.1) {
        const x = r.left + r.width * fx;
        const y = r.top + r.height * fy;
        if (document.elementFromPoint(x, y) !== canvas) continue;
        if (hook.roomAt(x, y) === null) return { x, y };
      }
    }
    return null;
  });
  expect(point, 'no empty canvas point').not.toBeNull();
  return point as Point;
}
