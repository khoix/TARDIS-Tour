// @vitest-environment happy-dom
import { MeshDepthMaterial, MeshStandardMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import {
  createSharedUniforms,
  MaterialStates,
  OVERRIDE_FINISH,
  tardisUniforms,
} from '../../../src/systems/visibility/materials';
import { composeLayers, GHOST_KEEP } from '../../../src/systems/visibility/state';
import { MaterialCache, motifIndex, ROUNDEL_GLOW } from '../../../src/world/kit';
import type { MeshTag } from '../../../src/world/structure';

const TAG: MeshTag = { kind: 'room', id: 'C-M', part: 'wall', evidenceClass: 'sourced' };
const SPINE: [number, number, number][] = [[0, 0, 0]];

function setup(part: MeshTag['part'] = 'wall') {
  const base = new MaterialCache().get({ ...TAG, part }, 0x335566);
  const states = new MaterialStates(createSharedUniforms());
  states.addBase(base, SPINE);
  return { base, states };
}

describe('procedural surfaces in the visibility shader', () => {
  it('carries the motif and its backlight into the shader uniforms', () => {
    const { base } = setup();
    expect(tardisUniforms(base)).toMatchObject({
      motif: motifIndex('roundel'),
      motifGlow: ROUNDEL_GLOW,
    });
    const floor = setup('floor').base;
    expect(tardisUniforms(floor)).toMatchObject({ motif: motifIndex('hex'), motifGlow: 0 });
  });

  it('injects motifs into lit surfaces only, behind one shared program key', () => {
    const { base, states } = setup();
    const shader = {
      uniforms: {},
      vertexShader: '#include <common>\n#include <project_vertex>',
      fragmentShader:
        '#include <common>\n#include <clipping_planes_fragment>\n#include <color_fragment>\n#include <emissivemap_fragment>',
    };
    base.onBeforeCompile(shader as never, undefined as never);
    expect(shader.vertexShader).toContain('#define TARDIS_SURFACE');
    expect(shader.fragmentShader).toContain('tardisMotifShade');
    expect(shader.fragmentShader).toContain('uTardisMotifGlow * tardisMotifGlow');
    expect(shader.uniforms).toHaveProperty('uTardisMotif');
    const other = setup('floor').base;
    expect(other.customProgramCacheKey()).toBe(base.customProgramCacheKey());
    const depth = states.depthVariant(base, composeLayers({}));
    expect(depth.customProgramCacheKey()).not.toBe(base.customProgramCacheKey());
  });

  it('a colour override (the overlay) shows matte, without accent or backlight', () => {
    const { base, states } = setup('panel');
    expect(base.emissive.getHex()).not.toBe(0);
    const v = states.variant(base, composeLayers({ overlay: { color: 0x3fae6a } }));
    if (!(v instanceof MeshStandardMaterial)) throw new Error('not a surface');
    expect(v.color.getHex()).toBe(0x3fae6a);
    expect(v.emissive.getHex()).toBe(0);
    expect(v.roughness).toBe(OVERRIDE_FINISH.roughness);
    expect(v.metalness).toBe(OVERRIDE_FINISH.metalness);
    expect(tardisUniforms(v).motifGlow).toBe(0);
    // The base keeps its finish.
    expect(base.emissive.getHex()).not.toBe(0);
  });

  it('casts shadows only from solid geometry: depth variants carry ghost and cut', () => {
    const { base, states } = setup();
    const solid = states.depthVariant(base, composeLayers({}));
    expect(solid).toBeInstanceOf(MeshDepthMaterial);
    expect(tardisUniforms(solid)).toMatchObject({ ghost: 1, cut: 0 });
    expect(states.depthVariant(base, composeLayers({}))).toBe(solid);
    const cut = states.depthVariant(base, composeLayers({ cutaway: { cut: true } }));
    expect(tardisUniforms(cut)).toMatchObject({ ghost: 1, cut: 1, spineCount: 1 });
    const ghost = states.depthVariant(base, composeLayers({ isolation: { ghost: GHOST_KEEP } }));
    expect(tardisUniforms(ghost).ghost).toBe(GHOST_KEEP);
    expect(new Set([solid, cut, ghost]).size).toBe(3);
    const shader = {
      uniforms: {},
      vertexShader: '#include <common>\n#include <project_vertex>',
      fragmentShader: '#include <common>\n#include <clipping_planes_fragment>',
    };
    cut.onBeforeCompile(shader as never, undefined as never);
    expect(shader.fragmentShader).toContain('#define TARDIS_DEPTH');
    expect(shader.fragmentShader).not.toContain('diffuseColor.rgb *= tardisMotifShade');
  });
});
