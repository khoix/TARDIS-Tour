/**
 * What a route looks like in the scene (Execution 7): the visual state's `route` layer tints
 * the meshes of the edges it walks, and a thin tube follows the route line through the
 * corridors. The tube is not a tagged world mesh: it takes no clicks, and it is clipped at
 * the section height like the world.
 */

import {
  CurvePath,
  Group,
  LineCurve3,
  Mesh,
  MeshBasicMaterial,
  Plane,
  TubeGeometry,
  Vector3,
} from 'three';
import type { Vec3 } from '../../data/layout';
import type { LayerFn, Tint } from '../visibility/state';
import { type Route, routeLine } from './routes';

export const ROUTE_TINT: Tint = { color: 0x3fd8e8, intensity: 0.7 };
export const ROUTE_LINE_COLOR = 0xf2fbff;
/** Tube radius, and its lift off the walk line (which runs at deck level). */
export const ROUTE_LINE_RADIUS_NU = 0.22;
export const ROUTE_LINE_LIFT_NU = 0.4;
const ROUTE_LINE_SAMPLE_NU = 0.25;
const NO_SECTION = 1e6;

/** The route layer: the walked edges' meshes, solid and tinted (the selection outranks it). */
export function routeLayer(route: Route): LayerFn {
  const edges = new Set(route.connections);
  return (tag) =>
    tag.kind === 'connection' && edges.has(tag.id) ? { tint: ROUTE_TINT, ghost: 1 } : undefined;
}

export interface RouteLineView {
  readonly root: Group;
  /** Draws the route (null clears it). */
  show(route: Route | null): void;
  /** Clips the tube above the section (null: no section). */
  setSection(sectionY: number | null): void;
}

export function createRouteLine(): RouteLineView {
  const root = new Group();
  root.name = 'route-line';
  const clip = new Plane(new Vector3(0, -1, 0), NO_SECTION);
  const material = new MeshBasicMaterial({ color: ROUTE_LINE_COLOR, clippingPlanes: [clip] });
  let mesh: Mesh | null = null;
  return {
    root,
    show(route) {
      if (mesh) {
        root.remove(mesh);
        mesh.geometry.dispose();
        mesh = null;
      }
      const points = route ? routeLine(route) : [];
      if (points.length < 2) return;
      const lift = (p: Vec3) => new Vector3(p[0], p[1] + ROUTE_LINE_LIFT_NU, p[2]);
      const path = new CurvePath<Vector3>();
      for (let i = 1; i < points.length; i++) {
        path.add(new LineCurve3(lift(points[i - 1] as Vec3), lift(points[i] as Vec3)));
      }
      // Samples are spaced evenly along the length, so a fine spacing keeps the corners sharp.
      const samples = Math.ceil(path.getLength() / ROUTE_LINE_SAMPLE_NU);
      mesh = new Mesh(new TubeGeometry(path, samples, ROUTE_LINE_RADIUS_NU, 6), material);
      mesh.name = 'route';
      mesh.raycast = () => undefined;
      root.add(mesh);
    },
    setSection(sectionY) {
      clip.constant = sectionY ?? NO_SECTION;
    },
  };
}
