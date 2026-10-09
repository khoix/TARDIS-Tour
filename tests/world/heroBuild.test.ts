// @vitest-environment happy-dom
import { InstancedMesh, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { LAYOUT } from '../../src/data/layout';
import { ROOMS } from '../../src/data/rooms';
import { buildPrototypeScene } from '../../src/scene/prototypeScene';
import { buildDressing, HIDDEN_BY_DEFAULT } from '../../src/world/build';
import { restEmissive } from '../../src/world/kit';
import { buildConsoleRoom } from '../../src/world/rooms/console/build';
import {
  describeHeroRooms,
  HERO_ROOM_IDS,
  PORTAL_LABEL,
  RECONFIGURING_LABEL,
} from '../../src/world/rooms/hero/describe';
import { buildHeroRooms } from '../../src/world/rooms/hero/heroRooms';
import { buildSkeleton } from '../../src/world/skeleton';
import { GLOW_PARTS, isMeshTag, type MeshTag } from '../../src/world/structure';

function meshes(root: Object3D): Mesh[] {
  const out: Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh) out.push(o);
  });
  return out;
}

function labels(root: Object3D, className: string): string[] {
  const out: string[] = [];
  root.traverse((o) => {
    const el = (o as { element?: HTMLElement }).element;
    if (el?.className === className) out.push(el.textContent ?? '');
  });
  return out;
}

describe('hero rooms build (lazy chunk)', () => {
  const hero = buildHeroRooms();
  const all = meshes(hero.root);
  // E-V's dressing marks the B28 portal, so it is tagged to that edge, not the room.
  const dressedRooms = HERO_ROOM_IDS.filter((id) => id !== 'E-V');

  it('tags every mesh with the full contract and builds only what the description lists', () => {
    expect(all.length).toBeGreaterThan(50);
    const described = new Set(
      describeHeroRooms().elements.map((e) => `${e.tag.kind}:${e.tag.id}:${e.tag.part}`),
    );
    for (const m of all) {
      expect(isMeshTag(m.userData), m.name).toBe(true);
      const t = m.userData as MeshTag;
      expect(described.has(`${t.kind}:${t.id}:${t.part}`), m.name).toBe(true);
    }
  });

  it('adds pickable parts to exactly the hero rooms it dresses, and hides nothing', () => {
    expect([...hero.roomParts.keys()].sort()).toEqual([...dressedRooms].sort());
    expect(
      describeHeroRooms()
        .elements.filter((e) => e.tag.kind === 'connection')
        .map((e) => e.tag.id),
    ).toEqual(expect.arrayContaining(['B18', 'B28']));
    for (const [id, parts] of hero.roomParts) {
      for (const m of parts) expect((m.userData as MeshTag).id).toBe(id);
    }
    for (const m of all) {
      expect(m.visible, m.name).toBe(true);
      expect(HIDDEN_BY_DEFAULT.has((m.userData as MeshTag).part)).toBe(false);
    }
    expect(all.some((m) => m instanceof InstancedMesh)).toBe(true);
  });

  it('self-lights glow parts only', () => {
    for (const m of all) {
      const t = m.userData as MeshTag;
      const rest = restEmissive(m.material as MeshStandardMaterial);
      expect(rest.color !== 0, m.name).toBe(GLOW_PARTS.has(t.part));
    }
  });

  it('labels the reconfiguring ARS door and the portal as feature labels only', () => {
    expect(labels(hero.root, 'feature-label').sort()).toEqual(
      [PORTAL_LABEL, RECONFIGURING_LABEL].sort(),
    );
    expect(labels(hero.root, 'door-label')).toEqual([]);
    expect(labels(hero.root, 'edge-label')).toEqual([]);
  });

  it('refuses a dressing that would replace rooms', () => {
    expect(() => buildDressing({ ...describeHeroRooms(), roomIds: ['L-01'] })).toThrow(
      /replaces rooms/,
    );
  });

  it('joins the greybox scene: parts merge into their rooms and bounds stay put', () => {
    const scene = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
      buildConsoleRoom(),
      buildSkeleton(),
    ]);
    const before = new Map([...scene.roomParts].map(([id, p]) => [id, p.length]));
    const bounds = new Map(scene.roomBounds);
    const added = scene.attach(buildHeroRooms());
    expect(added.length).toBeGreaterThan(0);
    for (const [id, count] of before) {
      const now = scene.roomParts.get(id)?.length ?? 0;
      if ((dressedRooms as readonly string[]).includes(id)) expect(now, id).toBeGreaterThan(count);
      else expect(now, id).toBe(count);
    }
    expect(new Map(scene.roomBounds)).toEqual(bounds);
    expect(meshes(scene.root).length).toBeGreaterThan(added.length);
    const stray = buildDressing({
      ...describeHeroRooms(),
      elements: describeHeroRooms().elements.map((e) => ({ ...e, tag: { ...e.tag, id: 'O-01' } })),
    });
    expect(() => scene.attach(stray)).toThrow(/not in the scene/);
  });
});
