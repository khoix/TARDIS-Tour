/**
 * Static merging (Execution 8): every group of a group's direct, non-instanced meshes that share
 * a {@link MeshTag}, a material and a visibility becomes one mesh, and their outlines one line
 * set under it. A merged mesh keeps exactly one owner and one part, so selection, the cutaway,
 * the overlay and routes (which resolve per tag, src/systems/visibility) treat it as before.
 * Decorative repeats stay instanced: an instanced mesh already belongs to one owner.
 */

import {
  type BufferGeometry,
  Group,
  InstancedMesh,
  LineSegments,
  type Material,
  Mesh,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isMeshTag, type MeshTag } from './structure';

const ATTRIBUTES = ['position', 'normal'] as const;

/** Geometry in its parent's space, non-indexed, with only the attributes every mesh shares. */
function placed(geometry: BufferGeometry, object: Object3D, parent?: Object3D): BufferGeometry {
  const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  for (const name of Object.keys(g.attributes)) {
    if (!(ATTRIBUTES as readonly string[]).includes(name)) g.deleteAttribute(name);
  }
  g.clearGroups();
  object.updateMatrix();
  if (parent) {
    parent.updateMatrix();
    g.applyMatrix4(parent.matrix.clone().multiply(object.matrix));
  } else g.applyMatrix4(object.matrix);
  return g;
}

function mergeKey(mesh: Mesh): string | null {
  if (mesh instanceof InstancedMesh || Array.isArray(mesh.material)) return null;
  if (!isMeshTag(mesh.userData)) return null;
  if (mesh.children.some((c) => !(c instanceof LineSegments))) return null;
  const t = mesh.userData;
  return `${t.kind}|${t.id}|${t.part}|${t.evidenceClass}|${mesh.material.uuid}|${mesh.visible}`;
}

function mergeRun(meshes: readonly Mesh[]): Mesh {
  const first = meshes[0] as Mesh;
  const geometry = mergeGeometries(meshes.map((m) => placed(m.geometry, m)));
  if (!geometry) throw new Error(`Could not merge ${first.name}`);
  const merged = new Mesh(geometry, first.material as Material);
  merged.name = first.name;
  merged.userData = { ...(first.userData as MeshTag) } satisfies MeshTag;
  merged.visible = first.visible;
  const lines = meshes.flatMap((m) =>
    m.children
      .filter((c): c is LineSegments => c instanceof LineSegments)
      .map((l) => ({ line: l, mesh: m })),
  );
  const firstLine = lines[0]?.line;
  if (firstLine) {
    const lineGeometry = mergeGeometries(
      lines.map(({ line, mesh }) => placed(line.geometry, line, mesh)),
    );
    if (!lineGeometry) throw new Error(`Could not merge outlines of ${first.name}`);
    const outline = new LineSegments(lineGeometry, firstLine.material);
    outline.raycast = () => undefined;
    merged.add(outline);
  }
  for (const m of meshes) {
    m.geometry.dispose();
    for (const { line, mesh } of lines) if (mesh === m) line.geometry.dispose();
  }
  return merged;
}

/**
 * Merges the direct tagged meshes of `group` (and of each direct child group, such as a spinning
 * ring, within that group) per tag, material and visibility. Returns the number of meshes saved.
 */
export function mergeStatic(group: Group): number {
  let saved = 0;
  const runs = new Map<string, Mesh[]>();
  for (const child of group.children) {
    if (child instanceof Group) saved += mergeStatic(child);
    if (!(child instanceof Mesh)) continue;
    const key = mergeKey(child);
    if (key !== null) runs.set(key, [...(runs.get(key) ?? []), child]);
  }
  for (const meshes of runs.values()) {
    if (meshes.length < 2) continue;
    group.remove(...meshes);
    group.add(mergeRun(meshes));
    saved += meshes.length - 1;
  }
  return saved;
}
