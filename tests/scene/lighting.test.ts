import { PointLight, Scene } from 'three';
import { describe, expect, it } from 'vitest';
import { getTransform } from '../../src/data/layout';
import { getRoom } from '../../src/data/rooms';
import { roomBounds } from '../../src/scene/topology';
import { createLighting, describeLights, SHADOW_INTENSITY } from '../../src/scene/lighting';
import { QUALITY } from '../../src/systems/quality/tiers';
import { HERO_ROOM_IDS } from '../../src/world/rooms/hero/describe';

describe('lighting', () => {
  const specs = describeLights();

  it('puts each diegetic light inside the box of a placed room it belongs to', () => {
    expect(new Set(specs.map((s) => s.id)).size).toBe(specs.length);
    expect(specs.length).toBe(QUALITY.high.diegeticLights);
    for (const s of specs) {
      expect(getRoom(s.roomId)?.placed, s.id).toBe(true);
      const t = getTransform(s.roomId);
      if (!t) throw new Error(`no layout for ${s.roomId}`);
      const b = roomBounds(t);
      for (let i = 0; i < 3; i++) {
        expect(s.position[i], `${s.id}[${i}]`).toBeGreaterThan(b.min[i] as number);
        expect(s.position[i], `${s.id}[${i}]`).toBeLessThan(b.max[i] as number);
      }
      expect(s.intensity).toBeGreaterThan(0);
      expect(s.distance).toBeGreaterThan(0);
      expect(s.note.length).toBeGreaterThan(10);
    }
  });

  it('lights the console first, then the power core, then the other hero rooms', () => {
    expect(specs.slice(0, 3).map((s) => s.roomId)).toEqual(['C-M', 'E-01', 'ENG-01']);
    for (const s of specs.slice(1)) expect(HERO_ROOM_IDS).toContain(s.roomId);
  });

  it('turns lights on by tier count, dims them for the overlay, and toggles soft shadows', () => {
    const scene = new Scene();
    const lighting = createLighting(scene, { min: [-50, -60, -50], max: [50, 30, 50] }, specs);
    const points: PointLight[] = [];
    scene.traverse((o) => {
      if (o instanceof PointLight) points.push(o);
    });
    expect(points.map((p) => p.name)).toEqual(specs.map((s) => s.id));
    expect(points.every((p) => !p.visible)).toBe(true);
    lighting.setDiegetic(QUALITY.medium.diegeticLights, false);
    expect(points.map((p) => p.visible)).toEqual([true, true, true, false, false, false]);
    expect(lighting.diegeticOn()).toBe(3);
    lighting.setDiegetic(6, true);
    expect(points.every((p) => p.visible && p.intensity === 0)).toBe(true);
    expect(lighting.diegeticOn()).toBe(0);
    lighting.setDiegetic(6, false);
    expect(points.map((p) => p.intensity)).toEqual(specs.map((s) => s.intensity));

    expect(lighting.key.castShadow).toBe(false);
    lighting.setShadows(true, 2048);
    expect(lighting.key.castShadow).toBe(true);
    expect(lighting.key.shadow.mapSize.x).toBe(2048);
    expect(lighting.key.shadow.intensity).toBe(SHADOW_INTENSITY);
    // The shadow camera covers the whole map.
    const cam = lighting.key.shadow.camera;
    expect(cam.right - cam.left).toBeGreaterThanOrEqual(Math.hypot(100, 90, 100));
    lighting.setShadows(false, 0);
    expect(lighting.key.castShadow).toBe(false);
  });
});
