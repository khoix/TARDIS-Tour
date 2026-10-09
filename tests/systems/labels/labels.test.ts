// @vitest-environment happy-dom
import type { Object3D } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../../src/data/connections';
import { LAYOUT } from '../../../src/data/layout';
import { getRoom, PLACED_ROOMS, ROOMS } from '../../../src/data/rooms';
import { buildPrototypeScene } from '../../../src/scene/prototypeScene';
import {
  applyLabelZoom,
  gradesText,
  LabelSystem,
  labelZoom,
  midpoint,
} from '../../../src/systems/labels/labels';
import { planRoute, type Route } from '../../../src/systems/navigation/routes';
import type { LabelOwner } from '../../../src/world/build';
import { buildConsoleRoom } from '../../../src/world/rooms/console/build';
import { buildSkeleton } from '../../../src/world/skeleton';

function labels(root: Object3D): CSS2DObject[] {
  const out: CSS2DObject[] = [];
  root.traverse((o) => {
    if (o instanceof CSS2DObject) out.push(o);
  });
  return out;
}

function setup() {
  const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
    buildConsoleRoom(),
    buildSkeleton(),
  ]);
  const layer = document.createElement('div');
  const system = new LabelSystem(layer, ROOMS, V1_CONNECTIONS);
  const extra = system.createLabels(world);
  world.root.add(extra);
  system.register(world.root);
  return { world, layer, system, extra };
}

const ofClass = (root: Object3D, className: string) =>
  labels(root).filter((l) => l.element.classList.contains(className));

describe('label helpers', () => {
  it('scales labels with zoom and bands the dense kinds', () => {
    expect(labelZoom(0.44)).toEqual({ scale: 0.86, band: 'far' });
    expect(labelZoom(1)).toEqual({ scale: 1, band: 'mid' });
    expect(labelZoom(3).band).toBe('near');
    expect(labelZoom(12).scale).toBe(1.35);
    const layer = document.createElement('div');
    applyLabelZoom(layer, 1.4);
    expect(layer.dataset.zoom).toBe('mid');
    expect(layer.style.getPropertyValue('--label-scale')).toBe('1.1');
  });

  it('lists distinct grades best first, never one score', () => {
    const room = getRoom('E-01');
    if (!room) throw new Error('no E-01');
    const grades = [...new Set(room.evidence.map((r) => r.grade))].sort();
    expect(gradesText(room.evidence)).toBe(`grade ${grades.join(' ')}`);
    expect(gradesText([])).toBe('ungraded');
  });

  it('finds the halfway point by length', () => {
    expect(
      midpoint([
        [0, 0, 0],
        [2, 0, 0],
        [2, 0, 6],
      ]),
    ).toEqual([2, 0, 2]);
    expect(midpoint([[1, 2, 3]])).toEqual([1, 2, 3]);
  });
});

describe('label system', () => {
  it('adds one label per built edge and per door anchor', () => {
    const { world, extra } = setup();
    const edges = ofClass(extra, 'connection-label');
    expect(edges.map((l) => (l.userData.labelOf as LabelOwner).id).sort()).toEqual(
      V1_CONNECTIONS.map((c) => c.id).sort(),
    );
    expect(ofClass(extra, 'anchor-label')).toHaveLength(world.anchors.length);
    const b37 = edges.find((l) => (l.userData.labelOf as LabelOwner).id === 'B37');
    expect(b37?.element.textContent).toBe('B37 · Corridor · INF-E · grade E');
  });

  it('gives every placed room one label with its ID, name and grades', () => {
    const { world } = setup();
    const rooms = ofClass(world.root, 'room-label');
    expect(rooms.map((l) => (l.userData.labelOf as LabelOwner).id).sort()).toEqual(
      PLACED_ROOMS.map((r) => r.id).sort(),
    );
    const library = rooms.find((l) => (l.userData.labelOf as LabelOwner).id === 'L-01');
    const room = getRoom('L-01');
    const part = (c: string) => library?.element.querySelector(`.${c}`)?.textContent;
    expect(part('label-id')).toBe('L-01');
    expect(part('label-name')).toBe(` · ${room?.name}`);
    expect(part('label-grades')).toBe(` · ${gradesText(room?.evidence ?? [])}`);
  });

  it('switches modes on the layer and marks the selection and the route', () => {
    const { world, layer, system } = setup();
    expect(layer.dataset.labelMode).toBe('default');
    system.setMode('structure');
    expect(system.mode()).toBe('structure');
    expect(layer.dataset.labelMode).toBe('structure');

    system.setSelection('E-01');
    const selected = labels(world.root).filter((l) => l.element.classList.contains('is-selected'));
    expect(selected.length).toBeGreaterThan(0);
    for (const l of selected)
      expect(l.userData.labelOf).toMatchObject({ kind: 'room', id: 'E-01' });

    const walkLines = world.walkLines;
    const route = planRoute(
      'ENG-01',
      'C-M',
      PLACED_ROOMS.map((r) => r.id),
      V1_CONNECTIONS,
      walkLines,
      {
        allowPortal: false,
      },
    ) as Route;
    system.setRoute(route);
    const onRoute = labels(world.root)
      .filter((l) => l.element.classList.contains('on-route'))
      .filter((l) => /\b(room|connection)-label\b/.test(l.element.className))
      .map((l) => (l.userData.labelOf as LabelOwner).id)
      .sort();
    expect(onRoute).toEqual([...route.rooms, ...route.connections].sort());
    system.setRoute(null);
    expect(labels(world.root).some((l) => l.element.classList.contains('on-route'))).toBe(false);
  });
});
