// @vitest-environment happy-dom
import { Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { LAYOUT } from '../../src/data/layout';
import { ROOMS } from '../../src/data/rooms';
import { buildPrototypeScene } from '../../src/scene/prototypeScene';
import { buildConsoleRoom } from '../../src/world/rooms/console/build';
import { CONSOLE_ROOM_IDS, describeConsoleRoom } from '../../src/world/rooms/console/describe';
import { isMeshTag, type MeshTag } from '../../src/world/structure';

function meshes(root: Object3D): Mesh[] {
  const out: Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh) out.push(o);
  });
  return out;
}

const tagKeys = (list: readonly Mesh[]) =>
  new Set(
    list.map((m) => {
      const t = m.userData as MeshTag;
      return `${t.kind}:${t.id}:${t.part}`;
    }),
  );

describe('console-room build', () => {
  const built = buildConsoleRoom();

  it('tags every mesh with the full {kind, id, part, evidenceClass} contract', () => {
    const all = meshes(built.root);
    // Merged per tag (Execution 8): every described element's tag is still drawn.
    expect(tagKeys(all)).toEqual(
      new Set(describeConsoleRoom().elements.map((e) => `${e.tag.kind}:${e.tag.id}:${e.tag.part}`)),
    );
    for (const m of all) expect(isMeshTag(m.userData), m.name).toBe(true);
  });

  it('exposes every console node as its own selectable set of room meshes', () => {
    expect([...built.roomParts.keys()].sort()).toEqual([...CONSOLE_ROOM_IDS].sort());
    for (const [id, parts] of built.roomParts) {
      expect(parts.length, id).toBeGreaterThan(0);
      for (const m of parts) expect((m.userData as MeshTag).id).toBe(id);
    }
    expect([...built.connectionIds].sort()).toEqual(['B01', 'B02', 'B03', 'B04', 'B05', 'B06']);
  });

  it('never shares a material between rooms, so highlights stay per room', () => {
    const owner = new Map<unknown, string>();
    for (const [id, parts] of built.roomParts) {
      for (const m of parts) {
        const prev = owner.get(m.material);
        if (prev !== undefined) expect(prev).toBe(id);
        owner.set(m.material, id);
      }
    }
  });

  it('turns the two rotor rings in opposite directions', () => {
    const rings: Object3D[] = [];
    built.root.traverse((o) => {
      if (o.name === 'C-M:rotor-ring' && !(o instanceof Mesh)) rings.push(o);
    });
    expect(rings).toHaveLength(2);
    expect(built.tick(10_000)).toBe(true);
    const [a, b] = rings.map((r) => r.rotation.y) as [number, number];
    expect(a).not.toBe(0);
    expect(Math.sign(a)).toBe(-Math.sign(b));
  });

  it('adds a "reported, destination unknown" label for each closed door', () => {
    const labels: string[] = [];
    built.root.traverse((o) => {
      const el = (o as { element?: HTMLElement }).element;
      if (el?.className === 'door-label') labels.push(el.textContent ?? '');
    });
    expect(labels).toHaveLength(2);
    for (const t of labels) expect(t.toLowerCase()).toBe('reported, destination unknown');
  });

  it('replaces the console boxes and connector bars in the scene', () => {
    const scene = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [built]);
    for (const id of CONSOLE_ROOM_IDS) {
      expect(scene.roomParts.get(id)).toBe(built.roomParts.get(id));
      expect(scene.roomBounds.get(id)).toEqual(built.roomBounds.get(id));
    }
    const tags = meshes(scene.root).map((m) => m.userData as MeshTag);
    for (const id of CONSOLE_ROOM_IDS) {
      expect(
        tags.some((t) => t.id === id && t.part === 'volume'),
        id,
      ).toBe(false);
    }
    const bars = new Set(tags.filter((t) => t.part === 'connector').map((t) => t.id));
    for (const id of built.connectionIds) expect(bars.has(id), id).toBe(false);
    expect(bars.has('B07')).toBe(true);
    expect(tags.every((t) => isMeshTag(t))).toBe(true);
  });

  it('builds only what the description lists', () => {
    const d = describeConsoleRoom();
    const described = new Set(d.elements.map((e) => `${e.tag.kind}:${e.tag.id}:${e.tag.part}`));
    for (const m of meshes(built.root)) {
      const t = m.userData as MeshTag;
      expect(described.has(`${t.kind}:${t.id}:${t.part}`), m.name).toBe(true);
    }
  });
});
