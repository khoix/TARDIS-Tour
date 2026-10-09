// @vitest-environment happy-dom
import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Raycaster,
  Vector3,
} from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { LAYOUT } from '../../src/data/layout';
import { ROOMS } from '../../src/data/rooms';
import { buildPrototypeScene } from '../../src/scene/prototypeScene';
import { routeLayer, ROUTE_TINT } from '../../src/systems/navigation/routeView';
import type { Route } from '../../src/systems/navigation/routes';
import { EVIDENCE_COLORS, overlayLayer } from '../../src/systems/research/overlay';
import { VisualState } from '../../src/systems/visibility/manager';
import { SELECTED_TINT } from '../../src/systems/visibility/state';
import { mergeStatic } from '../../src/world/merge';
import { buildConsoleRoom } from '../../src/world/rooms/console/build';
import { buildHeroRooms } from '../../src/world/rooms/hero/heroRooms';
import { buildSkeleton } from '../../src/world/skeleton';
import type { MeshTag } from '../../src/world/structure';

const TAG: MeshTag = { kind: 'room', id: 'R', part: 'wall', evidenceClass: 'sourced' };

function box(tag: MeshTag, material: MeshStandardMaterial, at: number, outline = true): Mesh {
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), material);
  mesh.userData = { ...tag };
  mesh.position.set(at, 0, 0);
  if (outline) {
    const line = new LineSegments(new EdgesGeometry(mesh.geometry), new LineBasicMaterial());
    line.raycast = () => undefined;
    mesh.add(line);
  }
  return mesh;
}

const vertices = (o: Object3D) =>
  (o as Mesh | LineSegments).geometry.getAttribute('position').count;

function triangles(root: Object3D): number {
  let n = 0;
  root.traverse((o) => {
    if (o instanceof Mesh && !(o instanceof InstancedMesh)) {
      const g = o.geometry;
      n += (g.index ? g.index.count : vertices(o)) / 3;
    }
  });
  return n;
}

function tagged(root: Object3D): Mesh[] {
  const out: Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh && 'kind' in o.userData) out.push(o);
  });
  return out;
}

describe('static merging', () => {
  it('merges siblings per tag, material and visibility, keeping geometry, bounds and outlines', () => {
    const wall = new MeshStandardMaterial();
    const other = new MeshStandardMaterial();
    const group = new Group();
    group.add(box(TAG, wall, 0), box(TAG, wall, 3), box(TAG, wall, 6, false));
    group.add(box({ ...TAG, part: 'floor' }, wall, 9));
    group.add(box(TAG, other, 12));
    const hidden = box(TAG, wall, 15);
    hidden.visible = false;
    group.add(hidden);
    const inst = new InstancedMesh(new BoxGeometry(), wall, 2);
    inst.userData = { ...TAG };
    group.add(inst);
    const ring = new Group();
    ring.add(box(TAG, wall, 0), box(TAG, wall, 2));
    group.add(ring);
    const before = new Box3().setFromObject(group);
    const tris = triangles(group);

    expect(mergeStatic(group)).toBe(3);
    const meshes = group.children.filter((c): c is Mesh => c instanceof Mesh);
    expect(meshes).toHaveLength(5);
    expect(group.children).toContain(inst);
    expect(group.children).toContain(ring);
    expect(ring.children).toHaveLength(1);
    expect(triangles(group)).toBe(tris);
    expect(new Box3().setFromObject(group)).toEqual(before);
    const merged = meshes.find((m) => vertices(m) === 36 * 3);
    if (!merged) throw new Error('no merged wall');
    expect(merged.userData).toEqual(TAG);
    expect(merged.material).toBe(wall);
    expect(merged.visible).toBe(true);
    // Two of the three had outlines: one line set holds both (12 edges each).
    const lines = merged.children.filter((c): c is LineSegments => c instanceof LineSegments);
    expect(lines).toHaveLength(1);
    const [line] = lines;
    if (!line) throw new Error('no merged outline');
    expect(vertices(line)).toBe(2 * 24);
    expect(new Box3().setFromObject(line).max.x).toBeCloseTo(3.5, 6);
    expect(meshes.filter((m) => !m.visible)).toEqual([hidden]);
  });

  it('leaves the built scene with one mesh per sibling tag, material and visibility', () => {
    for (const built of [buildConsoleRoom(), buildSkeleton()]) {
      const seen = new Set<string>();
      for (const m of tagged(built.root)) {
        if (m instanceof InstancedMesh) continue;
        const t = m.userData as MeshTag;
        const key = `${m.parent?.uuid}|${t.kind}|${t.id}|${t.part}|${t.evidenceClass}|${(m.material as MeshStandardMaterial).uuid}|${m.visible}`;
        expect(seen.has(key), m.name).toBe(false);
        seen.add(key);
      }
    }
  });
});

describe('merged and instanced meshes keep per-owner state', () => {
  const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
    buildConsoleRoom(),
    buildSkeleton(),
  ]);
  const visual = new VisualState(world, ROOMS, V1_CONNECTIONS);
  const hero = buildHeroRooms();
  world.attach(hero);
  visual.register(hero.root);
  const all = tagged(world.root);
  const of = (kind: string, id: string) =>
    all.filter((m) => (m.userData as MeshTag).kind === kind && (m.userData as MeshTag).id === id);
  const mat = (m: Mesh) => m.material as MeshStandardMaterial;

  it('a raycast on a merged mesh names its owner', () => {
    const [floor] = of('room', 'C-M').filter((m) => (m.userData as MeshTag).part === 'floor');
    if (!floor) throw new Error('no console floor');
    const ray = new Raycaster(new Vector3(3, 50, 3), new Vector3(0, -1, 0));
    const hit = ray.intersectObject(floor, false)[0];
    expect((hit?.object.userData as MeshTag).id).toBe('C-M');
  });

  it('selection tints every merged and instanced mesh of the room, and only those', () => {
    const debris = of('room', 'ENG-01').filter((m) => m instanceof InstancedMesh);
    expect(debris.length).toBeGreaterThan(0);
    visual.setSelection('ENG-01');
    for (const m of all) {
      const mine =
        (m.userData as MeshTag).kind === 'room' && (m.userData as MeshTag).id === 'ENG-01';
      expect(mat(m).emissive.getHex() === SELECTED_TINT.color, m.name).toBe(mine);
    }
    visual.setSelection(null);
  });

  it('the overlay recolours instanced decor and the route tints its edge decor', () => {
    const decor = of('connection', 'B37').filter((m) => m instanceof InstancedMesh);
    expect(decor.length).toBeGreaterThan(0);
    visual.setLayer('overlay', overlayLayer);
    for (const m of decor) expect(mat(m).color.getHex()).toBe(EVIDENCE_COLORS.speculative);
    visual.setLayer('overlay', null);
    visual.setLayer('route', routeLayer({ connections: ['B37'] } as unknown as Route));
    for (const m of all) {
      const t = m.userData as MeshTag;
      const routed = t.kind === 'connection' && t.id === 'B37';
      expect(mat(m).emissive.getHex() === ROUTE_TINT.color, m.name).toBe(routed);
    }
    visual.setLayer('route', null);
  });
});
