/**
 * Structural kit: turns {@link KitPrimitive} data into meshes. Builders only draw what the
 * primitive says, and every mesh they create carries the element's {@link MeshTag} as
 * `userData` (the mesh-tagging contract in src/world/structure.ts).
 */

import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Shape,
  Vector2,
} from 'three';
import type { Vec3 } from '../../data/layout';
import {
  azimuthVector,
  type DoorwayPrimitive,
  type KitPrimitive,
  type LadderPrimitive,
  type MeshPart,
  type MeshTag,
  type PlatePrimitive,
  polar,
  type RailingPrimitive,
  type RibPrimitive,
  type RingPrimitive,
  type StairsPrimitive,
} from '../structure';

export const PART_COLORS: Readonly<Record<Exclude<MeshPart, 'volume'>, number>> = {
  connector: 0x9fb7bd,
  floor: 0x4f8ea0,
  bridge: 0x7fa9b5,
  wall: 0x26404a,
  rib: 0x22343b,
  crown: 0x22343b,
  railing: 0x9fb7bd,
  stairs: 0x9fb7bd,
  ladder: 0xb0b8bc,
  doorway: 0x6a8a94,
  'door-closed': 0x7a4a3a,
  console: 0xc8873a,
  rotor: 0x8fe0f0,
  'rotor-ring': 0xd9a25a,
};

const OUTLINE_COLOR = 0x0b1418;
const DEG = Math.PI / 180;
/** Segments per full circle for curved plates. */
const CIRCLE_SEGMENTS = 48;
const RAIL_SECTION = 0.1;
const POST_SPACING_DEG = 20;

/**
 * One material per (tagged node, colour), so highlighting a room never tints another
 * room's meshes.
 */
export class MaterialCache {
  private readonly cache = new Map<string, MeshStandardMaterial>();

  get(tag: MeshTag, color: number): MeshStandardMaterial {
    const key = `${tag.kind}:${tag.id}:${color}`;
    let m = this.cache.get(key);
    if (!m) {
      m = new MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.15, flatShading: true });
      this.cache.set(key, m);
    }
    return m;
  }
}

function tagged(geometry: BufferGeometry, tag: MeshTag, material: MeshStandardMaterial): Mesh {
  const mesh = new Mesh(geometry, material);
  mesh.name = `${tag.id}:${tag.part}`;
  mesh.userData = { ...tag } satisfies MeshTag;
  return mesh;
}

/** Hard-edge outline (not pickable) that keeps greybox volumes legible. */
function outline(mesh: Mesh): Mesh {
  const lines = new LineSegments(
    new EdgesGeometry(mesh.geometry, 30),
    new LineBasicMaterial({ color: OUTLINE_COLOR }),
  );
  lines.raycast = () => undefined;
  mesh.add(lines);
  return mesh;
}

/**
 * Box of cross-section `sizeX` × `sizeZ` whose local Y runs from `from` to `to`. For a
 * horizontal member local X is horizontal and local Z is vertical; `yawDeg` orients the
 * cross-section of vertical members (local X then points along that bearing's tangent).
 */
function beam(
  from: Vec3,
  to: Vec3,
  sizeX: number,
  sizeZ: number,
  tag: MeshTag,
  material: MeshStandardMaterial,
  yawDeg = 0,
): Mesh {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const horizontal = Math.hypot(dx, dz);
  const length = Math.hypot(horizontal, dy);
  const mesh = tagged(new BoxGeometry(sizeX, length, sizeZ), tag, material);
  mesh.position.set((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2);
  const yaw = horizontal > 1e-6 ? Math.atan2(dx, dz) : yawDeg * DEG;
  mesh.rotation.set(Math.atan2(horizontal, dy), yaw, 0, 'YXZ');
  return mesh;
}

/** Shape-space point for an azimuth: extruding then rotating −90° about X maps it to (x, z). */
function shapePoint(r: number, azimuthDeg: number, cx: number, cz: number): Vector2 {
  const [sx, sz] = azimuthVector(azimuthDeg);
  return new Vector2(cx + sx * r, -(cz + sz * r));
}

function arcPoints(r: number, start: number, sweep: number, cx: number, cz: number, n: number) {
  return Array.from({ length: n + 1 }, (_, i) => shapePoint(r, start + (sweep * i) / n, cx, cz));
}

export function plateGeometry(p: PlatePrimitive): BufferGeometry {
  const [cx, cz] = p.center;
  const sweep = p.sweepDeg ?? 360;
  const full = sweep >= 360;
  // Regular polygons put a flat side facing 0° (vertices at 30° + 60°k for a hexagon).
  const start = p.startDeg ?? (p.sides ? 180 / p.sides : 0);
  const n = p.sides ?? Math.max(2, Math.ceil((CIRCLE_SEGMENTS * sweep) / 360));
  const outer = arcPoints(p.outer, start, sweep, cx, cz, n);
  let shape: Shape;
  if (full) {
    shape = new Shape(outer.slice(0, -1));
    if (p.inner > 0) {
      shape.holes.push(new Shape(arcPoints(p.inner, start, sweep, cx, cz, n).slice(0, -1)));
    }
  } else {
    const inner =
      p.inner > 0
        ? arcPoints(p.inner, start, sweep, cx, cz, n).reverse()
        : [shapePoint(0, 0, cx, cz)];
    shape = new Shape([...outer, ...inner]);
  }
  const geometry = new ExtrudeGeometry(shape, {
    depth: p.top - p.bottom,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, p.bottom, 0);
  return geometry;
}

function buildStairs(p: StairsPrimitive, tag: MeshTag, m: MeshStandardMaterial): Object3D[] {
  const dx = p.top[0] - p.bottom[0];
  const dz = p.top[2] - p.bottom[2];
  const run = Math.hypot(dx, dz);
  const rise = p.top[1] - p.bottom[1];
  const yaw = Math.atan2(dx, dz);
  const tread = 0.2;
  const treads = Array.from({ length: p.steps }, (_, i) => {
    const t = (i + 0.5) / p.steps;
    const mesh = tagged(new BoxGeometry(p.width, tread, run / p.steps), tag, m);
    mesh.position.set(
      p.bottom[0] + dx * t,
      p.bottom[1] + (rise * (i + 1)) / p.steps - tread / 2,
      p.bottom[2] + dz * t,
    );
    mesh.rotation.y = yaw;
    return mesh;
  });
  const across: Vec3 = [(dz / run) * (p.width / 2), 0, (-dx / run) * (p.width / 2)];
  const stringers = [1, -1].map((side) => {
    const o: Vec3 = [across[0] * side, -0.25, across[2] * side];
    return beam(
      [p.bottom[0] + o[0], p.bottom[1] + o[1], p.bottom[2] + o[2]],
      [p.top[0] + o[0], p.top[1] + o[1], p.top[2] + o[2]],
      0.15,
      0.4,
      tag,
      m,
    );
  });
  return [...treads, ...stringers];
}

function buildLadder(p: LadderPrimitive, tag: MeshTag, m: MeshStandardMaterial): Object3D[] {
  const [fx, fz] = azimuthVector(p.facingDeg + 90);
  const side = (s: number, y: number): Vec3 => [
    p.bottom[0] + fx * s * (p.width / 2),
    y,
    p.bottom[2] + fz * s * (p.width / 2),
  ];
  // Rails continue one unit above the top landing as a handhold.
  const railTop = p.top[1] + 1;
  const rails = [1, -1].map((s) =>
    beam(side(s, p.bottom[1]), side(s, railTop), 0.12, 0.12, tag, m, p.facingDeg),
  );
  const rungCount = Math.floor((p.top[1] - p.bottom[1]) / 0.5);
  const rungs = Array.from({ length: rungCount }, (_, i) => {
    const y = p.bottom[1] + 0.5 * (i + 1);
    return beam(side(1, y), side(-1, y), 0.08, 0.08, tag, m);
  });
  return [...rails, ...rungs];
}

function buildRailing(p: RailingPrimitive, tag: MeshTag, m: MeshStandardMaterial): Object3D[] {
  const up = (v: Vec3, h: number): Vec3 => [v[0], v[1] + h, v[2]];
  if (p.path === 'line') {
    const posts = [p.from, p.to].map((v) =>
      beam(v, up(v, p.height), RAIL_SECTION, RAIL_SECTION, tag, m),
    );
    const rail = beam(up(p.from, p.height), up(p.to, p.height), RAIL_SECTION, RAIL_SECTION, tag, m);
    return [...posts, rail];
  }
  const count = Math.max(1, Math.round(p.sweepDeg / POST_SPACING_DEG));
  const posts = Array.from({ length: count + 1 }, (_, i) => {
    const base = polar(p.center, p.radius, p.startDeg + (p.sweepDeg * i) / count, p.y);
    return beam(base, up(base, p.height), RAIL_SECTION, RAIL_SECTION, tag, m);
  });
  const top = p.y + p.height;
  const rail = tagged(
    plateGeometry({
      type: 'plate',
      center: p.center,
      inner: p.radius - RAIL_SECTION / 2,
      outer: p.radius + RAIL_SECTION / 2,
      bottom: top - RAIL_SECTION / 2,
      top: top + RAIL_SECTION / 2,
      startDeg: p.startDeg,
      sweepDeg: p.sweepDeg,
    }),
    tag,
    m,
  );
  return [...posts, rail];
}

function buildDoorway(p: DoorwayPrimitive, tag: MeshTag, m: MeshStandardMaterial): Object3D[] {
  const [tx, tz] = azimuthVector(p.azimuthDeg + 90);
  const at = (along: number, y: number): Vec3 => [
    p.sill[0] + tx * along,
    p.sill[1] + y,
    p.sill[2] + tz * along,
  ];
  const member = 0.2;
  const frameDepth = p.depth + 0.2;
  const tangentYaw = p.azimuthDeg + 90;
  const parts: Object3D[] = [];
  if (p.profile === 'hex') {
    // Hexagonal panel frame with flat top and bottom, centred on the opening.
    const r = p.height / 2;
    const corners = Array.from({ length: 6 }, (_, k) => {
      const a = (k * 60 * Math.PI) / 180;
      return at(Math.cos(a) * r, r + Math.sin(a) * r);
    });
    corners.forEach((c, k) => {
      const next = corners[(k + 1) % 6] as Vec3;
      parts.push(beam(c, next, frameDepth, member, tag, m, tangentYaw));
    });
  } else {
    const half = p.width / 2 - member / 2;
    for (const s of [-half, half]) {
      parts.push(beam(at(s, 0), at(s, p.height), frameDepth, member, tag, m, tangentYaw));
    }
    parts.push(
      beam(at(-p.width / 2, p.height), at(p.width / 2, p.height), frameDepth, member, tag, m),
    );
  }
  if (p.closed) {
    const leaf = p.profile === 'hex' ? p.height * 0.8 : p.width - 2 * member;
    parts.push(beam(at(0, 0.05), at(0, p.height - 0.05), p.depth * 0.6, leaf, tag, m, tangentYaw));
  }
  return parts;
}

function buildRib(p: RibPrimitive, tag: MeshTag, m: MeshStandardMaterial): Object3D[] {
  const points = p.profile.map(([r, y]) => polar(p.center, r, p.azimuthDeg, y));
  return points
    .slice(1)
    .map((to, i) => beam(points[i] as Vec3, to, p.width, p.depth, tag, m, p.azimuthDeg));
}

function buildRing(p: RingPrimitive, tag: MeshTag, m: MeshStandardMaterial): Group {
  const group = new Group();
  group.name = `${tag.id}:${tag.part}`;
  group.position.set(...p.center);
  const step = 360 / p.divisions;
  const chord = 2 * p.radius * Math.sin(Math.PI / p.divisions) * 0.8;
  for (let i = 0; i < p.divisions; i++) {
    const az = (i + 0.5) * step;
    const seg = tagged(new BoxGeometry(chord, p.segmentHeight, p.segmentDepth), tag, m);
    seg.position.set(...polar([0, 0], p.radius, az, 0));
    seg.rotation.y = az * DEG;
    group.add(seg);
  }
  for (let k = 0; k < p.spokes; k++) {
    const az = (k * 360) / p.spokes;
    group.add(
      beam(
        polar([0, 0], p.hubRadius, az, 0),
        polar([0, 0], p.radius - p.segmentDepth / 2, az, 0),
        0.15,
        0.15,
        tag,
        m,
      ),
    );
  }
  return group;
}

/** Builds one element. Rings come back as a {@link Group} so callers can spin them. */
export function buildPrimitive(
  primitive: KitPrimitive,
  tag: MeshTag,
  materials: MaterialCache,
): Object3D[] {
  const m = materials.get(tag, PART_COLORS[tag.part as Exclude<MeshPart, 'volume'>]);
  switch (primitive.type) {
    case 'plate':
      return [outline(tagged(plateGeometry(primitive), tag, m))];
    case 'box': {
      const [x0, y0, z0] = primitive.min;
      const [x1, y1, z1] = primitive.max;
      const mesh = tagged(new BoxGeometry(x1 - x0, y1 - y0, z1 - z0), tag, m);
      mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      return [outline(mesh)];
    }
    case 'stairs':
      return buildStairs(primitive, tag, m);
    case 'ladder':
      return buildLadder(primitive, tag, m);
    case 'railing':
      return buildRailing(primitive, tag, m);
    case 'doorway':
      return buildDoorway(primitive, tag, m);
    case 'rib':
      return buildRib(primitive, tag, m);
    case 'ring':
      return [buildRing(primitive, tag, m)];
  }
}
