/**
 * Material side of the visual state (Execution 6). Every world material is patched once with
 * a small shader extension that applies, per fragment:
 * - the section clip (discard above `uTardisClipY`);
 * - the camera-facing cut (fragments on the camera side of their owner's spine; see cutaway.ts,
 *   whose constants and nearest-point search the GLSL mirrors);
 * - ghosting.
 * Surfaces stay in the opaque pass and thin out with an ordered 4×4 Bayer dither (screen-door
 * transparency: no sorting, depth stays correct, cheap on mobile). Only outlines blend, because
 * a dithered 1-px line breaks into dashes or vanishes depending on its angle.
 *
 * States other than solid are *variants*: clones of the base material, cached per (base, state),
 * so a highlight or a ghost never bleeds into another room's meshes that share a base.
 */

import { LineBasicMaterial, type Material, MeshStandardMaterial, Vector2, Vector3 } from 'three';
import { CUT_MARGIN_NU, MAX_SPINE_POINTS, type Spine, SPINE_VERTICAL_WEIGHT } from './cutaway';
import { CUT_KEEP, CUT_LINE_KEEP, GHOST_LINE_KEEP, type ResolvedVisual } from './state';

/** Section height that clips nothing (a uniform value, so toggling the clip never recompiles). */
export const NO_SECTION_Y = 1e9;
const PROGRAM_KEY = 'tardis-visibility-1';

type Uniform<T> = { value: T };

/** Uniforms every patched material shares. */
export interface SharedUniforms {
  readonly uTardisClipY: Uniform<number>;
  /** Horizontal unit vector towards the camera; zero turns the cut off. */
  readonly uTardisView: Uniform<Vector2>;
}

interface OwnUniforms {
  readonly uTardisGhost: Uniform<number>;
  readonly uTardisCut: Uniform<number>;
  readonly uTardisCutKeep: Uniform<number>;
  readonly uTardisSpine: Uniform<Vector3[]>;
  readonly uTardisSpineCount: Uniform<number>;
}

export function createSharedUniforms(): SharedUniforms {
  return {
    uTardisClipY: { value: NO_SECTION_Y },
    uTardisView: { value: new Vector2(0, 0) },
  };
}

const float = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

const VERTEX_DECL = /* glsl */ `
varying vec3 vTardisWorld;`;

const VERTEX_BODY = /* glsl */ `
	vec4 tardisWorld = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		tardisWorld = batchingMatrix * tardisWorld;
	#endif
	#ifdef USE_INSTANCING
		tardisWorld = instanceMatrix * tardisWorld;
	#endif
	vTardisWorld = ( modelMatrix * tardisWorld ).xyz;`;

const FRAGMENT_DECL = /* glsl */ `
#define TARDIS_MAX_SPINE ${MAX_SPINE_POINTS}
varying vec3 vTardisWorld;
uniform float uTardisClipY;
uniform vec2 uTardisView;
uniform float uTardisGhost;
uniform float uTardisCut;
uniform float uTardisCutKeep;
uniform vec3 uTardisSpine[ TARDIS_MAX_SPINE ];
uniform int uTardisSpineCount;
const float TARDIS_CUT_MARGIN = ${float(CUT_MARGIN_NU)};
const vec3 TARDIS_METRIC = vec3( 1.0, ${float(SPINE_VERTICAL_WEIGHT ** 2)}, 1.0 );

vec3 tardisNearest( vec3 p ) {
	vec3 best = uTardisSpine[ 0 ];
	vec3 d0 = p - best;
	float bestD = dot( d0 * TARDIS_METRIC, d0 );
	for ( int i = 0; i < TARDIS_MAX_SPINE - 1; i ++ ) {
		if ( i + 1 >= uTardisSpineCount ) break;
		vec3 a = uTardisSpine[ i ];
		vec3 ab = uTardisSpine[ i + 1 ] - a;
		float len2 = dot( ab * TARDIS_METRIC, ab );
		float t = len2 > 0.0 ? clamp( dot( ( p - a ) * TARDIS_METRIC, ab ) / len2, 0.0, 1.0 ) : 0.0;
		vec3 q = a + ab * t;
		vec3 d = p - q;
		float dd = dot( d * TARDIS_METRIC, d );
		if ( dd < bestD ) {
			bestD = dd;
			best = q;
		}
	}
	return best;
}

float tardisBayer( vec2 fragCoord ) {
	const float m[ 16 ] = float[ 16 ]( 0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0 );
	ivec2 c = ivec2( mod( floor( fragCoord ), 4.0 ) );
	return ( m[ c.x + 4 * c.y ] + 0.5 ) / 16.0;
}`;

const FRAGMENT_BODY = /* glsl */ `
	if ( vTardisWorld.y > uTardisClipY ) discard;
	float tardisKeep = uTardisGhost;
	if ( uTardisCut > 0.5 ) {
		vec3 tardisQ = tardisNearest( vTardisWorld );
		if ( dot( vTardisWorld.xz - tardisQ.xz, uTardisView ) > TARDIS_CUT_MARGIN ) {
			tardisKeep = min( tardisKeep, uTardisCutKeep );
		}
	}
	#ifdef TARDIS_BLEND
		diffuseColor.a *= tardisKeep;
	#else
		if ( tardisKeep < 1.0 && tardisBayer( gl_FragCoord.xy ) >= tardisKeep ) discard;
	#endif`;

function inject(source: string, anchor: string, code: string): string {
  if (!source.includes(anchor)) throw new Error(`Shader anchor ${anchor} not found`);
  return source.replace(anchor, `${anchor}${code}`);
}

type Patchable = MeshStandardMaterial | LineBasicMaterial;

function patch(material: Patchable, shared: SharedUniforms, own: OwnUniforms): void {
  const blend = material instanceof LineBasicMaterial;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, own);
    shader.vertexShader = inject(
      inject(shader.vertexShader, '#include <common>', VERTEX_DECL),
      '#include <project_vertex>',
      VERTEX_BODY,
    );
    shader.fragmentShader = inject(
      inject(
        `${blend ? '#define TARDIS_BLEND\n' : ''}${shader.fragmentShader}`,
        '#include <common>',
        FRAGMENT_DECL,
      ),
      '#include <clipping_planes_fragment>',
      FRAGMENT_BODY,
    );
  };
  material.customProgramCacheKey = () => (blend ? `${PROGRAM_KEY}-blend` : PROGRAM_KEY);
  material.userData.tardis = own;
}

function spineUniform(spine: Spine | null): Vector3[] {
  return Array.from({ length: MAX_SPINE_POINTS }, (_, i) => {
    const p = spine?.[Math.min(i, spine.length - 1)];
    return p ? new Vector3(...p) : new Vector3();
  });
}

/** Per-material uniform values, for tests and debugging. */
export function tardisUniforms(material: Material): {
  readonly ghost: number;
  readonly cut: number;
  readonly cutKeep: number;
  readonly spineCount: number;
} {
  const own = material.userData.tardis as OwnUniforms | undefined;
  if (!own) throw new Error(`Material ${material.name || material.uuid} is not patched`);
  return {
    ghost: own.uTardisGhost.value,
    cut: own.uTardisCut.value,
    cutKeep: own.uTardisCutKeep.value,
    spineCount: own.uTardisSpineCount.value,
  };
}

interface BaseEntry {
  readonly spine: Spine | null;
  readonly spineValue: Uniform<Vector3[]>;
  readonly variants: Map<string, Patchable>;
}

/**
 * Owner of every world material: patches base materials and hands out cached variants per
 * resolved state. Base materials must each belong to one owner, whose spine they carry.
 */
export class MaterialStates {
  private readonly bases = new Map<Material, BaseEntry>();

  constructor(readonly shared: SharedUniforms) {}

  has(material: Material): boolean {
    return this.bases.has(material);
  }

  /** Patches a base material in place for an owner's spine (null: never cut). */
  addBase(material: Material, spine: Spine | null): void {
    if (this.bases.has(material)) throw new Error('Material already registered');
    if (!(material instanceof MeshStandardMaterial || material instanceof LineBasicMaterial)) {
      throw new Error(`Unsupported world material ${material.type}`);
    }
    const spineValue = { value: spineUniform(spine) };
    patch(material, this.shared, this.own(spineValue, spine, 1, false, CUT_KEEP));
    this.bases.set(material, { spine, spineValue, variants: new Map() });
  }

  /** The material a mesh with this base shows in state `v` (the base itself when solid). */
  variant(base: Material, v: ResolvedVisual): Material {
    const entry = this.bases.get(base);
    if (!entry) throw new Error('Material is not registered');
    const line = base instanceof LineBasicMaterial;
    const cut = v.cut && entry.spine !== null;
    const ghost = v.ghost < 1 ? (line ? GHOST_LINE_KEEP : v.ghost) : 1;
    const tint = line ? null : v.tint;
    const color = line ? null : v.color;
    if (ghost === 1 && !cut && tint === null && color === null) return base;
    const key = `${ghost}|${cut ? 1 : 0}|${tint ? `${tint.color}:${tint.intensity}` : '-'}|${color ?? '-'}`;
    let m = entry.variants.get(key);
    if (!m) {
      m = (base as Patchable).clone();
      if (m instanceof MeshStandardMaterial) {
        if (tint) {
          m.emissive.setHex(tint.color);
          m.emissiveIntensity = tint.intensity;
        }
        if (color !== null) m.color.setHex(color);
      } else {
        m.transparent = true;
        m.depthWrite = false;
      }
      patch(
        m,
        this.shared,
        this.own(entry.spineValue, entry.spine, ghost, cut, line ? CUT_LINE_KEEP : CUT_KEEP),
      );
      entry.variants.set(key, m);
    }
    return m;
  }

  private own(
    spineValue: Uniform<Vector3[]>,
    spine: Spine | null,
    ghost: number,
    cut: boolean,
    cutKeep: number,
  ): OwnUniforms {
    return {
      uTardisGhost: { value: ghost },
      uTardisCut: { value: cut ? 1 : 0 },
      uTardisCutKeep: { value: cutKeep },
      uTardisSpine: spineValue,
      uTardisSpineCount: { value: spine?.length ?? 0 },
    };
  }
}
