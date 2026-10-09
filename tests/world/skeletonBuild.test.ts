// @vitest-environment happy-dom
import { InstancedMesh, Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { getTransform, LAYOUT, ROOM_SHELLS } from '../../src/data/layout';
import { PLACED_ROOMS, ROOMS } from '../../src/data/rooms';
import { buildPrototypeScene } from '../../src/scene/prototypeScene';
import { roomBounds } from '../../src/scene/topology';
import { HIDDEN_BY_DEFAULT } from '../../src/world/build';
import { buildConsoleRoom } from '../../src/world/rooms/console/build';
import { CONSOLE_ROOM_IDS } from '../../src/world/rooms/console/describe';
import { buildSkeleton, describeSkeleton } from '../../src/world/skeleton';
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

describe('skeleton build', () => {
  const built = buildSkeleton();
  const all = meshes(built.root);

  it('tags every mesh with the full {kind, id, part, evidenceClass} contract', () => {
    // Merged per tag (Execution 8): every described element's tag is still drawn.
    expect(tagKeys(all)).toEqual(
      new Set(describeSkeleton().elements.map((e) => `${e.tag.kind}:${e.tag.id}:${e.tag.part}`)),
    );
    for (const m of all) expect(isMeshTag(m.userData), m.name).toBe(true);
  });

  it('exposes every non-console room as its own selectable meshes, and builds every other edge', () => {
    expect([...built.roomParts.keys()].sort()).toEqual(ROOM_SHELLS.map((s) => s.roomId).sort());
    for (const [id, parts] of built.roomParts) {
      expect(parts.length, id).toBeGreaterThan(0);
      for (const m of parts) expect((m.userData as MeshTag).id).toBe(id);
    }
    const consoleIds = new Set<string>(CONSOLE_ROOM_IDS);
    const outside = V1_CONNECTIONS.filter(
      (c) => !(consoleIds.has(c.from.room) && consoleIds.has(c.to.room)),
    );
    expect([...built.connectionIds].sort()).toEqual(outside.map((c) => c.id).sort());
  });

  it('hides ceilings by default and nothing else', () => {
    const hidden = all.filter((m) => !m.visible);
    expect(hidden.length).toBeGreaterThan(20);
    for (const m of hidden)
      expect(HIDDEN_BY_DEFAULT.has((m.userData as MeshTag).part), m.name).toBe(true);
    for (const m of all) {
      if ((m.userData as MeshTag).part === 'ceiling') expect(m.visible, m.name).toBe(false);
    }
  });

  it('instances only decorative repeats, one instanced mesh per owner and kind', () => {
    const instanced = all.filter((m): m is InstancedMesh => m instanceof InstancedMesh);
    expect(instanced.length).toBeGreaterThan(5);
    const keys = instanced.map((m) => {
      const t = m.userData as MeshTag;
      expect(['rib', 'panel']).toContain(t.part);
      expect(m.count).toBeGreaterThan(0);
      return `${t.kind}:${t.id}:${t.part}:${t.evidenceClass}:${m.geometry.uuid}`;
    });
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('never shares a material between rooms or edges', () => {
    const owner = new Map<unknown, string>();
    for (const m of all) {
      const t = m.userData as MeshTag;
      const prev = owner.get(m.material);
      if (prev !== undefined) expect(prev).toBe(`${t.kind}:${t.id}`);
      owner.set(m.material, `${t.kind}:${t.id}`);
    }
  });

  it('labels the INF-E bypass and only that edge', () => {
    const labels: string[] = [];
    built.root.traverse((o) => {
      const el = (o as { element?: HTMLElement }).element;
      if (el?.className === 'edge-label') labels.push(el.textContent ?? '');
    });
    expect(labels).toHaveLength(1);
    expect(labels[0]).toMatch(/^B37 · INF-E/);
  });

  it('builds only what the description lists', () => {
    const d = describeSkeleton();
    const described = new Set(d.elements.map((e) => `${e.tag.kind}:${e.tag.id}:${e.tag.part}`));
    for (const m of all) {
      const t = m.userData as MeshTag;
      expect(described.has(`${t.kind}:${t.id}:${t.part}`), m.name).toBe(true);
    }
  });

  it('replaces every box and connector bar in the scene with built structure', () => {
    const scene = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [buildConsoleRoom(), built]);
    const tags = meshes(scene.root).map((m) => m.userData as MeshTag);
    expect(tags.filter((t) => t.part === 'volume' || t.part === 'connector')).toEqual([]);
    for (const room of PLACED_ROOMS) {
      expect(scene.roomParts.get(room.id)?.length, room.id).toBeGreaterThan(0);
      const t = getTransform(room.id);
      if (!t) throw new Error(`no layout for ${room.id}`);
      expect(scene.roomBounds.get(room.id), room.id).toEqual(roomBounds(t));
    }
    expect([...scene.regionBounds.keys()].sort()).toEqual(
      ['control-nexus', 'cultural', 'maintenance', 'power-core'].sort(),
    );
  });
});
