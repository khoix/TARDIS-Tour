import { Mesh, type MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../src/data/connections';
import { PLACED_ROOMS } from '../../src/data/rooms';
import { createRouteLine, ROUTE_TINT, routeLayer } from '../../src/systems/navigation/routeView';
import { planRoute, type Route } from '../../src/systems/navigation/routes';
import { describeTier1Map } from '../../src/world/skeleton';
import type { MeshTag } from '../../src/world/structure';

const map = describeTier1Map();
const walkLines = new Map(map.paths.map((p) => [p.connectionId, p.points]));
const route = planRoute(
  'ENG-01',
  'C-M',
  PLACED_ROOMS.map((r) => r.id),
  V1_CONNECTIONS,
  walkLines,
  { allowPortal: false },
) as Route;

const tag = (kind: MeshTag['kind'], id: string): MeshTag => ({
  kind,
  id,
  part: 'floor',
  evidenceClass: 'inferred',
});

describe('route view', () => {
  it('tints and solidifies only the walked edges', () => {
    const layer = routeLayer(route);
    for (const id of route.connections) {
      expect(layer(tag('connection', id))).toEqual({ tint: ROUTE_TINT, ghost: 1 });
    }
    expect(layer(tag('connection', 'B28'))).toBeUndefined();
    expect(layer(tag('room', 'M-02'))).toBeUndefined();
  });

  it('draws one unpickable tube along the route, clipped at the section, and clears', () => {
    const view = createRouteLine();
    view.show(route);
    const tube = view.root.children[0];
    expect(view.root.children).toHaveLength(1);
    expect(tube).toBeInstanceOf(Mesh);
    const mesh = tube as Mesh;
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    // From the engine gallery (−35) up to the console's main deck (0).
    expect(box?.min.y).toBeLessThan(-34);
    expect(box?.max.y).toBeGreaterThan(0);
    const hits = new Raycaster(new Vector3(0, 100, 0), new Vector3(0, -1, 0)).intersectObject(
      view.root,
    );
    expect(hits).toEqual([]);
    const plane = (mesh.material as MeshBasicMaterial).clippingPlanes?.[0];
    view.setSection(-8);
    expect(plane?.distanceToPoint(new Vector3(0, -7, 0))).toBeLessThan(0);
    expect(plane?.distanceToPoint(new Vector3(0, -9, 0))).toBeGreaterThan(0);
    view.setSection(null);
    expect(plane?.distanceToPoint(new Vector3(0, 50, 0))).toBeGreaterThan(0);
    view.show(null);
    expect(view.root.children).toHaveLength(0);
  });
});
