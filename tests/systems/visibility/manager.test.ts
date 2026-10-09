// @vitest-environment happy-dom
import {
  LineSegments,
  type Material,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
  Raycaster,
  Vector3,
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../../src/data/connections';
import { LAYOUT, type Vec3 } from '../../../src/data/layout';
import { ROOMS } from '../../../src/data/rooms';
import { ISO_PITCH_DEG, ISO_YAW_DEG, viewDirection } from '../../../src/scene/camera/isometric';
import { buildPrototypeScene } from '../../../src/scene/prototypeScene';
import { horizontalView } from '../../../src/systems/visibility/cutaway';
import { VisualState } from '../../../src/systems/visibility/manager';
import { tardisUniforms } from '../../../src/systems/visibility/materials';
import { CUT_PARTS, GHOST_KEEP, SELECTED_TINT } from '../../../src/systems/visibility/state';
import type { LabelOwner } from '../../../src/world/build';
import { restEmissive } from '../../../src/world/kit';
import { buildConsoleRoom } from '../../../src/world/rooms/console/build';
import { buildHeroRooms } from '../../../src/world/rooms/hero/heroRooms';
import { buildSkeleton } from '../../../src/world/skeleton';
import { GLOW_PARTS, isMeshTag, type MeshTag } from '../../../src/world/structure';

function setup() {
  const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
    buildConsoleRoom(),
    buildSkeleton(),
  ]);
  const visual = new VisualState(world, ROOMS, V1_CONNECTIONS);
  const hero = buildHeroRooms();
  world.attach(hero);
  visual.register(hero.root);
  const view = viewDirection(ISO_YAW_DEG, ISO_PITCH_DEG);
  visual.setView(horizontalView(view));
  return { world, visual, view };
}

function tagged(root: Object3D): Mesh[] {
  const out: Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh && isMeshTag(o.userData)) out.push(o);
  });
  return out;
}

const tagOf = (m: Mesh) => m.userData as MeshTag;
const material = (m: Mesh) => m.material as MeshStandardMaterial;

function labels(root: Object3D): CSS2DObject[] {
  const out: CSS2DObject[] = [];
  root.traverse((o) => {
    if (o instanceof CSS2DObject) out.push(o);
  });
  return out;
}

describe('visual-state manager', () => {
  it('derives levels, section steps and the slider range from the scene', () => {
    const { visual } = setup();
    expect(visual.levels).toEqual([7, 0, -7, -14, -21, -28, -35]);
    expect(visual.sectionStops).toEqual([13, 6, -1, -8, -15, -22, -29]);
    expect(visual.sectionRange.max).toBeGreaterThanOrEqual(29);
    expect(visual.sectionRange.min).toBeLessThanOrEqual(-58);
  });

  it('patches every world material and gives each owner its own materials', () => {
    const { world } = setup();
    const owners = new Map<Material, string>();
    for (const mesh of tagged(world.root)) {
      const t = tagOf(mesh);
      const parts = [mesh, ...mesh.children.filter((c) => c instanceof LineSegments)];
      for (const part of parts) {
        const m = (part as Mesh).material as Material;
        expect(() => tardisUniforms(m), mesh.name).not.toThrow();
        const owner = `${t.kind}:${t.id}`;
        expect(owners.get(m) ?? owner, mesh.name).toBe(owner);
        owners.set(m, owner);
      }
    }
  });

  it('defaults to hidden ceilings and cut wall-class parts, with nothing ghosted', () => {
    const { world, visual } = setup();
    for (const mesh of tagged(world.root)) {
      const t = tagOf(mesh);
      const u = tardisUniforms(mesh.material as Material);
      expect(mesh.visible, mesh.name).toBe(t.part !== 'ceiling');
      expect(u.ghost, mesh.name).toBe(1);
      expect(u.cut, mesh.name).toBe(CUT_PARTS.has(t.part) ? 1 : 0);
      if (CUT_PARTS.has(t.part)) expect(u.spineCount, mesh.name).toBeGreaterThan(0);
    }
    expect(visual.snapshot()).toMatchObject({
      wallFade: true,
      ceilingsHidden: true,
      sectionY: null,
      isolation: null,
      focusMode: false,
      isolatedRooms: null,
    });
  });

  it('highlights only the selected room and restores rest emissive on deselect', () => {
    const { world, visual } = setup();
    const meshes = tagged(world.root);
    const before = new Map(meshes.map((m) => [m, m.material]));
    visual.setSelection('E-01');
    for (const m of meshes) {
      const t = tagOf(m);
      const lit = t.kind === 'room' && t.id === 'E-01';
      expect(material(m).emissive.getHex() === SELECTED_TINT.color, m.name).toBe(lit);
      if (lit) expect(material(m).emissiveIntensity).toBe(SELECTED_TINT.intensity);
      else expect(m.material, m.name).toBe(before.get(m));
    }
    visual.setSelection(null);
    for (const m of meshes) {
      expect(m.material, m.name).toBe(before.get(m));
      const rest = restEmissive(material(m));
      expect(material(m).emissive.getHex(), m.name).toBe(rest.color);
      expect(rest.color !== 0, m.name).toBe(GLOW_PARTS.has(tagOf(m).part));
    }
    // Variants are cached: selecting again reuses the same materials.
    visual.setSelection('E-01');
    const first = meshes.map((m) => m.material);
    visual.setSelection(null);
    visual.setSelection('E-01');
    expect(meshes.map((m) => m.material)).toEqual(first);
  });

  it('ghosts context around an isolated region without hiding it', () => {
    const { world, visual } = setup();
    visual.update({ isolation: { kind: 'region', region: 'power-core' } });
    const core = new Set(['F-01', 'E-A', 'E-01', 'E-V', 'ENG-01']);
    for (const m of tagged(world.root)) {
      const t = tagOf(m);
      if (t.part === 'ceiling') continue;
      if (t.kind === 'room') {
        const inside = core.has(t.id);
        expect(tardisUniforms(m.material as Material).ghost, m.name).toBe(inside ? 1 : GHOST_KEEP);
        expect(visual.resolved(m)?.pickable, m.name).toBe(inside);
      }
      expect(m.visible, m.name).toBe(true);
    }
    const ghostOf = (id: string) =>
      tagged(world.root)
        .filter((m) => tagOf(m).id === id)
        .map((m) => tardisUniforms(m.material as Material).ghost);
    expect(new Set(ghostOf('B28'))).toEqual(new Set([1]));
    expect(new Set(ghostOf('B07'))).toEqual(new Set([GHOST_KEEP]));
    for (const id of world.roomParts.keys()) {
      expect(visual.roomVisible(id), id).toBe(true);
      expect(visual.roomPickable(id), id).toBe(core.has(id));
    }
    // Labels of ghosted owners dim; the isolated region's label does not.
    for (const l of labels(world.root)) {
      const owner = l.userData.labelOf as LabelOwner;
      const ghosted = l.element.classList.contains('is-ghosted');
      if (owner.kind === 'region') expect(ghosted, owner.id).toBe(owner.id !== 'power-core');
      if (owner.kind === 'room') expect(ghosted, owner.id).toBe(!core.has(owner.id));
    }
    // The selection reveals a ghosted room.
    visual.setSelection('C-M');
    expect(visual.roomPickable('C-M')).toBe(true);
    visual.reset();
    expect(visual.snapshot().isolation).toBeNull();
    for (const id of world.roomParts.keys()) expect(visual.roomPickable(id), id).toBe(true);
  });

  it('focus mode cuts the selected room open whatever the global settings, and ends on deselect', () => {
    const { world, visual } = setup();
    visual.update({ focusMode: true });
    expect(visual.settings().focusMode).toBe(false);
    visual.update({ wallFade: false, ceilingsHidden: false });
    visual.setSelection('ENG-01');
    visual.update({ isolation: { kind: 'level', y: 7 } });
    visual.update({ focusMode: true });
    expect(visual.snapshot()).toMatchObject({
      focusMode: true,
      isolation: null,
      focusRoom: 'ENG-01',
      isolatedRooms: ['ENG-01'],
    });
    for (const m of tagged(world.root)) {
      const t = tagOf(m);
      if (t.kind !== 'room') continue;
      const focused = t.id === 'ENG-01';
      const u = tardisUniforms(m.material as Material);
      if (focused) {
        expect(m.visible, m.name).toBe(t.part !== 'ceiling');
        expect(u.cut, m.name).toBe(CUT_PARTS.has(t.part) ? 1 : 0);
        expect(material(m).emissive.getHex(), m.name).toBe(restEmissive(material(m)).color);
      } else {
        expect(m.visible, m.name).toBe(true);
        expect(u.ghost, m.name).toBe(GHOST_KEEP);
      }
    }
    visual.setSelection(null);
    expect(visual.snapshot()).toMatchObject({ focusMode: false, focusRoom: null });
  });

  it('hides labels and whole meshes above the section', () => {
    const { world, visual } = setup();
    visual.update({ sectionY: -8 });
    for (const l of labels(world.root)) {
      expect(l.visible).toBe(l.getWorldPosition(new Vector3()).y <= -8);
    }
    expect(visual.roomVisible('C-U')).toBe(false);
    expect(visual.roomVisible('C-L')).toBe(false);
    expect(visual.roomPickable('C-LAD')).toBe(true);
    expect(visual.roomPickable('ENG-01')).toBe(true);
    visual.update({ sectionY: null });
    expect(visual.roomVisible('C-U')).toBe(true);
  });

  describe('picks through real raycasts', () => {
    const pickables = (world: ReturnType<typeof setup>['world']) =>
      [...world.roomParts.values()].flat();
    const pickAt = (s: ReturnType<typeof setup>, target: Vec3): MeshTag | null => {
      const [vx, vy, vz] = s.view;
      const origin = new Vector3(target[0] + vx * 400, target[1] + vy * 400, target[2] + vz * 400);
      const ray = new Raycaster(origin, new Vector3(-vx, -vy, -vz));
      const hit = s.visual.pick(ray.intersectObjects(pickables(s.world), false));
      return hit ? (hit.object.userData as MeshTag) : null;
    };
    const grid = (min: Vec3, max: Vec3, y: number, n = 6): Vec3[] =>
      Array.from({ length: (n + 1) ** 2 }, (_, k): Vec3 => [
        min[0] + ((max[0] - min[0]) * (k % (n + 1))) / n,
        y,
        min[2] + ((max[2] - min[2]) * Math.floor(k / (n + 1))) / n,
      ]);

    it('lets the section clip expose C-LAD under the lower deck', () => {
      const s = setup();
      const floor = grid([-1.5, 0, -1.5], [1.5, 0, 1.5], -11.4);
      expect(floor.every((p) => pickAt(s, p)?.id !== 'C-LAD')).toBe(true);
      s.visual.update({ sectionY: -8 });
      expect(pickAt(s, [0, -11.4, 0])?.id).toBe('C-LAD');
    });

    it('lets clicks through ghosted context to the isolated region', () => {
      const s = setup();
      const b = s.world.roomBounds.get('ENG-01');
      if (!b) throw new Error('no ENG-01');
      const targets = grid(b.min, b.max, -35, 8);
      const before = targets.map((p) => pickAt(s, p)?.id ?? null);
      s.visual.update({ isolation: { kind: 'region', region: 'power-core' } });
      const after = targets.map((p) => pickAt(s, p)?.id ?? null);
      const core = new Set(['F-01', 'E-A', 'E-01', 'E-V', 'ENG-01']);
      expect(after.every((id) => id === null || core.has(id))).toBe(true);
      // Somewhere the console occluded the engine room by default; isolated, it does not.
      expect(before.some((id, i) => id !== null && !core.has(id) && after[i] === 'ENG-01')).toBe(
        true,
      );
    });

    it('lets clicks through cut near walls, and not when wall fade is off', () => {
      const s = setup();
      // Below the catwalk, off-centre, so the line of sight crosses E-01's +x (near) wall.
      const target: Vec3 = [35, -38, 4];
      const faded = pickAt(s, target);
      s.visual.update({ wallFade: false });
      const walled = pickAt(s, target);
      expect(walled).toMatchObject({ id: 'E-01', part: 'wall' });
      expect(faded?.id).toBe('E-01');
      expect(faded?.part).not.toBe('wall');
    });
  });
});

describe('Execution 7 layer slots', () => {
  it('reports the owners a slot claims, and the route tint reaches only those meshes', () => {
    const { world, visual } = setup();
    expect(visual.layerTargets('route')).toEqual([]);
    const edges = new Set(['B37', 'B22']);
    const tint = { color: 0x3fd8e8, intensity: 0.7 };
    visual.setLayer('route', (t) =>
      t.kind === 'connection' && edges.has(t.id) ? { tint, ghost: 1 } : undefined,
    );
    expect(visual.layerTargets('route')).toEqual(['connection:B22', 'connection:B37']);
    for (const m of tagged(world.root)) {
      const routed = tagOf(m).kind === 'connection' && edges.has(tagOf(m).id);
      expect(visual.resolved(m)?.tint ?? null).toEqual(routed ? tint : null);
    }
    visual.setLayer('route', null);
    expect(visual.layerTargets('route')).toEqual([]);
  });
});
