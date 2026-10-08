import { describe, expect, it } from 'vitest';
import {
  anglesOf,
  boundsCenter,
  cameraPosition,
  fitZoom,
  framePose,
  ISO_PITCH_DEG,
  ISO_YAW_DEG,
  lerpPose,
  MAX_ZOOM,
  MIN_ZOOM,
  orthoFrustum,
  unionBounds,
  viewDirection,
  type Bounds,
} from '../../src/scene/camera/isometric';

const cube: Bounds = { min: [-10, -10, -10], max: [10, 10, 10] };

describe('isometric camera math', () => {
  it('uses the conventional isometric angles', () => {
    expect(ISO_PITCH_DEG).toBeCloseTo(35.264, 3);
    expect(ISO_YAW_DEG).toBe(45);
    // At these angles the view direction is the cube diagonal (1, 1, 1) / √3.
    const d = viewDirection(ISO_YAW_DEG, ISO_PITCH_DEG);
    for (const c of d) expect(c).toBeCloseTo(1 / Math.sqrt(3), 6);
  });

  it('round-trips yaw and pitch through a camera offset', () => {
    for (const [yaw, pitch] of [
      [45, ISO_PITCH_DEG],
      [200, 20],
      [0, 80],
      [315, 12],
    ] as const) {
      const angles = anglesOf(viewDirection(yaw, pitch));
      expect(angles.yawDeg).toBeCloseTo(yaw, 6);
      expect(angles.pitchDeg).toBeCloseTo(pitch, 6);
    }
  });

  it('places the camera at the given distance from the target', () => {
    const pose = { target: [3, -4, 5] as const, yawDeg: 45, pitchDeg: ISO_PITCH_DEG, zoom: 1 };
    const p = cameraPosition(pose, 100);
    expect(Math.hypot(p[0] - 3, p[1] + 4, p[2] - 5)).toBeCloseTo(100, 6);
  });

  it('keeps the frustum height fixed and scales width with aspect on resize', () => {
    const wide = orthoFrustum(2, 100);
    const tall = orthoFrustum(0.5, 100);
    expect(wide.top - wide.bottom).toBe(100);
    expect(tall.top - tall.bottom).toBe(100);
    expect(wide.right - wide.left).toBe(200);
    expect(tall.right - tall.left).toBe(50);
  });

  it('frames the reset view on the bounds centre at isometric angles', () => {
    const b: Bounds = { min: [-20, -40, -70], max: [50, 20, 16] };
    const pose = framePose(b, 16 / 10);
    expect(pose.target).toEqual(boundsCenter(b));
    expect(pose.yawDeg).toBe(ISO_YAW_DEG);
    expect(pose.pitchDeg).toBeCloseTo(ISO_PITCH_DEG, 9);
    // Resetting twice gives the same pose (no drift).
    expect(framePose(b, 16 / 10)).toEqual(pose);
  });

  it('zooms out for narrower viewports and in for smaller bounds', () => {
    const wide = fitZoom(cube, ISO_YAW_DEG, ISO_PITCH_DEG, 2);
    const narrow = fitZoom(cube, ISO_YAW_DEG, ISO_PITCH_DEG, 0.5);
    expect(narrow).toBeLessThan(wide);
    const small: Bounds = { min: [-1, -1, -1], max: [1, 1, 1] };
    expect(fitZoom(small, ISO_YAW_DEG, ISO_PITCH_DEG, 2)).toBeGreaterThan(wide);
  });

  it('fits the projected bounds inside the margin', () => {
    // An isometric cube of half-size 10 projects to a hexagon of half-width 10√2 and
    // half-height 20·√(2/3); on a square viewport the height is the binding constraint.
    const aspect = 1;
    const zoom = fitZoom(cube, ISO_YAW_DEG, ISO_PITCH_DEG, aspect, 0.1, 120);
    const halfVisibleH = 60 / zoom;
    const halfVisibleW = halfVisibleH * aspect;
    expect(halfVisibleH * 0.8).toBeCloseTo(20 * Math.sqrt(2 / 3), 6);
    expect(halfVisibleW * 0.8).toBeGreaterThanOrEqual(10 * Math.SQRT2);
  });

  it('clamps zoom', () => {
    const point: Bounds = { min: [0, 0, 0], max: [0, 0, 0] };
    expect(fitZoom(point, 45, 30, 1)).toBe(MAX_ZOOM);
    const huge: Bounds = { min: [-1e5, -1e5, -1e5], max: [1e5, 1e5, 1e5] };
    expect(fitZoom(huge, 45, 30, 1)).toBe(MIN_ZOOM);
  });

  it('interpolates poses and turns yaw the short way round', () => {
    const a = { target: [0, 0, 0] as const, yawDeg: 350, pitchDeg: 30, zoom: 1 };
    const b = { target: [10, 20, 30] as const, yawDeg: 10, pitchDeg: 40, zoom: 3 };
    const mid = lerpPose(a, b, 0.5);
    expect(mid.yawDeg).toBeCloseTo(0, 9);
    expect(mid.pitchDeg).toBe(35);
    expect(mid.zoom).toBe(2);
    expect(mid.target).toEqual([5, 10, 15]);
    expect(lerpPose(a, b, 1).yawDeg).toBeCloseTo(10, 9);
  });

  it('unions bounds', () => {
    expect(
      unionBounds([
        { min: [0, 0, 0], max: [1, 1, 1] },
        { min: [-2, 3, -1], max: [0, 4, 0] },
      ]),
    ).toEqual({ min: [-2, 0, -1], max: [1, 4, 1] });
    expect(() => unionBounds([])).toThrow();
  });
});
