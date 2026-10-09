// @vitest-environment happy-dom
import { Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../../src/data/connections';
import { LAYOUT } from '../../../src/data/layout';
import { ROOMS } from '../../../src/data/rooms';
import { buildPrototypeScene } from '../../../src/scene/prototypeScene';
import {
  cssColor,
  EVIDENCE_COLORS,
  LEGEND,
  overlayLayer,
  PORTAL_OVERLAY_COLOR,
} from '../../../src/systems/research/overlay';
import { VisualState } from '../../../src/systems/visibility/manager';
import { composeLayers, SELECTED_TINT } from '../../../src/systems/visibility/state';
import { buildConsoleRoom } from '../../../src/world/rooms/console/build';
import { buildSkeleton } from '../../../src/world/skeleton';
import {
  EVIDENCE_CLASSES,
  GLOW_PARTS,
  isMeshTag,
  type MeshTag,
} from '../../../src/world/structure';

const tag = (over: Partial<MeshTag>): MeshTag => ({
  kind: 'room',
  id: 'L-01',
  part: 'wall',
  evidenceClass: 'sourced',
  ...over,
});

function tagged(root: Object3D): Mesh[] {
  const out: Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof Mesh && isMeshTag(o.userData)) out.push(o);
  });
  return out;
}

describe('evidence overlay', () => {
  it('colours by evidence class, with the portal apart; it never hides, cuts or ghosts', () => {
    for (const c of EVIDENCE_CLASSES) {
      const effect = overlayLayer(tag({ evidenceClass: c }));
      expect(effect).toEqual({ color: EVIDENCE_COLORS[c] });
    }
    expect(overlayLayer(tag({ kind: 'connection', id: 'B28', part: 'portal' }))?.color).toBe(
      PORTAL_OVERLAY_COLOR,
    );
  });

  it('makes self-lit parts glow in the class colour', () => {
    for (const part of GLOW_PARTS) {
      const effect = overlayLayer(tag({ part, evidenceClass: 'inferred' }));
      const color = part === 'portal' ? PORTAL_OVERLAY_COLOR : EVIDENCE_COLORS.inferred;
      expect(effect?.tint?.color).toBe(color);
    }
  });

  it('yields to the selection highlight', () => {
    const r = composeLayers({
      overlay: overlayLayer(tag({ part: 'glow' })),
      selection: { tint: SELECTED_TINT, ghost: 1 },
    });
    expect(r.tint).toEqual(SELECTED_TINT);
    expect(r.color).toBe(EVIDENCE_COLORS.sourced);
  });

  it('has a legend entry with a distinct colour for every class and the portal', () => {
    expect(LEGEND.map((e) => e.key)).toEqual([...EVIDENCE_CLASSES, 'portal']);
    expect(new Set(LEGEND.map((e) => e.color)).size).toBe(LEGEND.length);
    for (const e of LEGEND) expect(e.note.length).toBeGreaterThan(0);
    expect(cssColor(0x3f7fd0)).toBe('#3f7fd0');
    expect(cssColor(0x00ff)).toBe('#0000ff');
  });

  it('recolours every world mesh through the visual state, and clears cleanly', () => {
    const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
      buildConsoleRoom(),
      buildSkeleton(),
    ]);
    const visual = new VisualState(world, ROOMS, V1_CONNECTIONS);
    const meshes = tagged(world.root);
    const before = new Map(meshes.map((m) => [m, m.material]));
    visual.setLayer('overlay', overlayLayer);
    for (const m of meshes) {
      const t = m.userData as MeshTag;
      const want = t.part === 'portal' ? PORTAL_OVERLAY_COLOR : EVIDENCE_COLORS[t.evidenceClass];
      expect((m.material as MeshStandardMaterial).color.getHex(), `${t.id}:${t.part}`).toBe(want);
    }
    const classes = new Set(meshes.map((m) => (m.userData as MeshTag).evidenceClass));
    expect(classes).toEqual(new Set(EVIDENCE_CLASSES));
    visual.setLayer('overlay', null);
    for (const m of meshes) expect(m.material).toBe(before.get(m));
  });
});
