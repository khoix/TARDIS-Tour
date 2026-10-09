/**
 * Lighting (Execution 8), in two layers:
 * - readability: a teal-tinted hemisphere and a warm key light (the only shadow caster), which
 *   keep every space legible at isometric scale whatever the diegetic lights do;
 * - diegetic: a few point lights where the fiction has a light source, which give the hero rooms
 *   their identities (the rotor's teal, the library's lamplight, the Eye's and the engine's fire).
 * {@link describeLights} is pure data placed from the layout; {@link createLighting} builds it.
 */

import { type Bounds, boundsCenter } from './camera/isometric';
import { DirectionalLight, Group, HemisphereLight, PointLight, type Scene } from 'three';
import { getShell, getTransform, type Vec3 } from '../data/layout';
import { HERO_PARAMS } from '../world/rooms/hero/params';

export interface LightSpec {
  readonly id: string;
  /** Room whose fiction the light belongs to; it stands inside that room's box. */
  readonly roomId: string;
  readonly color: number;
  readonly intensity: number;
  /** Reach (NU) beyond which the light adds nothing. */
  readonly distance: number;
  readonly position: Vec3;
  readonly note: string;
}

export const HEMI_SKY = 0x9fd4e2;
export const HEMI_GROUND = 0x1c2226;
export const HEMI_INTENSITY = 1.5;
export const KEY_COLOR = 0xffeedd;
export const KEY_INTENSITY = 1.5;
/** Key light direction (towards the light), from above the camera's default quadrant. */
export const KEY_DIRECTION: Vec3 = [0.45, 0.8, 0.4];
/** Strength of key-light shadows: soft enough that shadowed interiors stay readable. */
export const SHADOW_INTENSITY = 0.55;

function transform(roomId: string) {
  const t = getTransform(roomId);
  if (!t) throw new Error(`No layout for ${roomId}`);
  return t;
}

/** Height of a shell room's walkway (its doors' sill) above its floor. */
function walkwaySill(roomId: string): number {
  const sill = getShell(roomId)?.doors[0]?.sill;
  if (sill === undefined) throw new Error(`${roomId} has no walkway sill`);
  return sill;
}

/** A point at a share of the room box's height above its floor centre. */
function inRoom(roomId: string, heightShare: number): Vec3 {
  const { position, size } = transform(roomId);
  return [position[0], position[1] + size[1] * heightShare, position[2]];
}

function below(roomId: string, sill: number, drop: number): Vec3 {
  const { position } = transform(roomId);
  return [position[0], position[1] + sill - drop, position[2]];
}

/**
 * The diegetic lights in priority order (a tier turns on the first N). Colours follow the
 * connective grammar: teal for the control spaces, warm orange for fire and power.
 */
export function describeLights(): LightSpec[] {
  return [
    {
      id: 'rotor',
      roomId: 'C-M',
      color: 0x58d6ee,
      intensity: 170,
      distance: 34,
      position: [0, 5, 0],
      note: 'The time rotor lights the console room in teal.',
    },
    {
      id: 'eye',
      roomId: 'E-01',
      color: 0xff6a24,
      intensity: 260,
      distance: 26,
      position: below('E-01', walkwaySill('E-01'), HERO_PARAMS['E-01'].coreDrop),
      note: 'The Eye of Harmony burns below the catwalk.',
    },
    {
      id: 'engine-fire',
      roomId: 'ENG-01',
      color: 0xff8a3a,
      intensity: 320,
      distance: 30,
      position: below('ENG-01', walkwaySill('ENG-01'), HERO_PARAMS['ENG-01'].fireballDrop),
      note: 'The frozen explosion lights the engine void.',
    },
    {
      id: 'library-lamps',
      roomId: 'L-01',
      color: 0xffd59a,
      intensity: 90,
      distance: 22,
      position: inRoom('L-01', 0.45),
      note: 'Warm lamplight among the stacks.',
    },
    {
      id: 'architecture-orbs',
      roomId: 'ARS-01',
      color: 0xdff2ff,
      intensity: 120,
      distance: 18,
      position: inRoom('ARS-01', 0.5),
      note: 'The glowing orbs of the architectural reconfiguration system.',
    },
    {
      id: 'fuel-rods',
      roomId: 'F-01',
      color: 0xff7a30,
      intensity: 70,
      distance: 14,
      position: inRoom('F-01', 0.4),
      note: 'Exposed fuel rods along the tunnel.',
    },
  ];
}

export interface Lighting {
  readonly root: Group;
  readonly key: DirectionalLight;
  /** Turns on the first `count` diegetic lights; `dimmed` darkens them (the evidence overlay). */
  setDiegetic(count: number, dimmed: boolean): void;
  /** Key-light shadows on or off, at a map size. */
  setShadows(on: boolean, mapSize: number): void;
  /** Number of diegetic lights shining (on and not dimmed). */
  diegeticOn(): number;
}

/** Builds both layers into the scene; the key light's shadow camera covers `bounds`. */
export function createLighting(
  scene: Scene,
  bounds: Bounds,
  specs: readonly LightSpec[],
): Lighting {
  const root = new Group();
  root.name = 'lighting';
  root.add(new HemisphereLight(HEMI_SKY, HEMI_GROUND, HEMI_INTENSITY));

  const centre = boundsCenter(bounds);
  const radius =
    Math.hypot(
      bounds.max[0] - bounds.min[0],
      bounds.max[1] - bounds.min[1],
      bounds.max[2] - bounds.min[2],
    ) / 2;
  const key = new DirectionalLight(KEY_COLOR, KEY_INTENSITY);
  const [dx, dy, dz] = KEY_DIRECTION;
  const n = Math.hypot(dx, dy, dz);
  key.position.set(
    centre[0] + (dx / n) * radius * 2,
    centre[1] + (dy / n) * radius * 2,
    centre[2] + (dz / n) * radius * 2,
  );
  key.target.position.set(...centre);
  const cam = key.shadow.camera;
  cam.left = -radius;
  cam.right = radius;
  cam.top = radius;
  cam.bottom = -radius;
  cam.near = radius * 0.5;
  cam.far = radius * 3.5;
  cam.updateProjectionMatrix();
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.04;
  key.shadow.intensity = SHADOW_INTENSITY;
  root.add(key, key.target);

  const points = specs.map((s) => {
    const light = new PointLight(s.color, s.intensity, s.distance, 2);
    light.name = s.id;
    light.position.set(...s.position);
    light.visible = false;
    root.add(light);
    return { light, spec: s };
  });
  scene.add(root);

  let on = 0;
  let dim = false;
  return {
    root,
    key,
    setDiegetic(count, dimmed) {
      on = Math.min(count, points.length);
      dim = dimmed;
      points.forEach(({ light, spec }, i) => {
        light.visible = i < on;
        light.intensity = dimmed ? 0 : spec.intensity;
      });
    },
    setShadows(enabled, mapSize) {
      key.castShadow = enabled;
      if (enabled && key.shadow.mapSize.x !== mapSize) {
        key.shadow.mapSize.set(mapSize, mapSize);
        key.shadow.map?.dispose();
        key.shadow.map = null;
      }
    },
    diegeticOn: () => (dim ? 0 : on),
  };
}
