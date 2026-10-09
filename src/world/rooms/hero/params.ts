/**
 * Feature parameters of the Journey hero rooms (Execution 5), in normalized units (NU). Each
 * room's notes record the basis of every value, as the console's do: `verified` when the
 * value itself is evidenced, `order` when only a sign or ordering is, `design` when it is an
 * authored choice. Features are "recognizable, research-labeled", not canonical
 * reproductions (EXECUTION-PLAN decision 9); the known vs inferred list per room is in
 * research/room-dossiers/journey-interior.md.
 */

import type { ParamNote } from '../console/params';

export interface LibraryParams {
  /** Storeys of stacks, the ground floor included. */
  readonly floorCount: number;
  readonly levelHeight: number;
  readonly stackDepth: number;
  readonly bayWidth: number;
  readonly shelfPitch: number;
  readonly galleryWidth: number;
  readonly ladderWidth: number;
  /** Horizontal gap from a gallery's inner edge to the ladder serving it. */
  readonly ladderGap: number;
  readonly lecternRadius: number;
}

export interface StoreroomParams {
  readonly shelfDepth: number;
  readonly shelfHeight: number;
  readonly shelfPitch: number;
  readonly bayWidth: number;
  /** Cot footprint [along X, along Z] and the height of its rails. */
  readonly cotSize: readonly [number, number];
  readonly cotHeight: number;
  readonly mementoEvery: number;
}

export interface ArsParams {
  readonly plinthRadius: number;
  readonly trunkRadius: number;
  /** Height of the trunk top above the floor. */
  readonly trunkHeight: number;
  /** Heights of the branch tiers above the floor, lowest first. */
  readonly tierHeights: readonly number[];
  readonly branchesPerTier: number;
  /** Horizontal reach of each tier's branches, lowest first (the crown narrows upward). */
  readonly tierReach: readonly number[];
  readonly branchRise: number;
  readonly bulbRadius: number;
  readonly bulbDrop: number;
}

export interface FuelTunnelParams {
  readonly rodRadius: number;
  /** Rods hanging inside the tunnel: offset either side of its axis, and spacing along it. */
  readonly tunnelRodOffset: number;
  readonly tunnelRodSpacing: number;
  /** Clear height under the hanging rods. */
  readonly headroom: number;
  /** Height of the rods standing between the fuel cells, above the cell deck. */
  readonly deckRodHeight: number;
}

export interface AntechamberParams {
  readonly bulkheadWidth: number;
  readonly bulkheadDepth: number;
  readonly wheelRadius: number;
  readonly sealStripDepth: number;
}

export interface EyeParams {
  readonly coreRadius: number;
  /** Depth of the core's centre below the catwalk deck. */
  readonly coreDrop: number;
  readonly coreSlices: number;
  readonly cageGap: number;
  readonly cageStruts: number;
  readonly flareCount: number;
  readonly flareReach: number;
  /** Extra sealed doorways at catwalk level beyond the two the route uses. */
  readonly blindThresholds: number;
}

export interface VestibuleParams {
  readonly frameGap: number;
  readonly frameWidth: number;
  readonly chevronCount: number;
}

export interface EngineParams {
  readonly fireballRadius: number;
  /** Depth of the fireball's centre below the gallery. */
  readonly fireballDrop: number;
  readonly fireballSlices: number;
  readonly fragmentCount: number;
  readonly fragmentReach: readonly [number, number];
  readonly shockRadius: number;
  readonly plinthRadius: number;
}

export interface HeroParams {
  readonly 'L-01': LibraryParams;
  readonly 'S-01': StoreroomParams;
  readonly 'ARS-01': ArsParams;
  readonly 'F-01': FuelTunnelParams;
  readonly 'E-A': AntechamberParams;
  readonly 'E-01': EyeParams;
  readonly 'E-V': VestibuleParams;
  readonly 'ENG-01': EngineParams;
}

export type HeroRoomId = keyof HeroParams;

export const HERO_PARAMS: HeroParams = {
  'L-01': {
    floorCount: 4,
    levelHeight: 5,
    stackDepth: 1.2,
    bayWidth: 2.6,
    shelfPitch: 1,
    galleryWidth: 1.8,
    ladderWidth: 1,
    ladderGap: 0.4,
    lecternRadius: 0.6,
  },
  'S-01': {
    shelfDepth: 1,
    shelfHeight: 4,
    shelfPitch: 1,
    bayWidth: 2.2,
    cotSize: [1.3, 2.4],
    cotHeight: 1.6,
    mementoEvery: 2,
  },
  'ARS-01': {
    plinthRadius: 2,
    trunkRadius: 0.7,
    trunkHeight: 16,
    tierHeights: [6, 10, 14],
    branchesPerTier: 6,
    tierReach: [4.2, 3.6, 3],
    branchRise: 2,
    bulbRadius: 0.35,
    bulbDrop: 1.2,
  },
  'F-01': {
    rodRadius: 0.12,
    tunnelRodOffset: 1,
    tunnelRodSpacing: 1.5,
    headroom: 2,
    deckRodHeight: 5.5,
  },
  'E-A': {
    bulkheadWidth: 0.6,
    bulkheadDepth: 0.5,
    wheelRadius: 0.7,
    sealStripDepth: 0.4,
  },
  'E-01': {
    coreRadius: 3.5,
    coreDrop: 7,
    coreSlices: 7,
    cageGap: 1,
    cageStruts: 6,
    flareCount: 8,
    flareReach: 2.5,
    blindThresholds: 2,
  },
  'E-V': {
    frameGap: 0.2,
    frameWidth: 0.25,
    chevronCount: 3,
  },
  'ENG-01': {
    fireballRadius: 4.5,
    fireballDrop: 11,
    fireballSlices: 7,
    fragmentCount: 72,
    fragmentReach: [5.5, 8],
    shockRadius: 6,
    plinthRadius: 5,
  },
};

function design(note: string): ParamNote {
  return { basis: 'design', sourceIds: [], note };
}

export const HERO_PARAM_NOTES: {
  readonly [R in HeroRoomId]: Readonly<Record<keyof HeroParams[R], ParamNote>>;
} = {
  'L-01': {
    floorCount: {
      basis: 'design',
      sourceIds: ['S05', 'S28'],
      note: 'Editorial sources conflict (five vs six levels), so rooms.ts keeps floorCount = null. Four is the most that fit the authored box at this level height: a design choice, not a storey claim.',
    },
    levelHeight: design('Room for five shelves and a gallery rail per storey.'),
    stackDepth: design('Deep enough to read as bookcases at region zoom.'),
    bayWidth: design('Bays between uprights, so the stacks read as repeated cases.'),
    shelfPitch: design('One shelf per NU, about head height over five shelves.'),
    galleryWidth: design('Walkable strip in front of the stacks, narrower than a corridor deck.'),
    ladderWidth: design('Library ladder, narrower than a door.'),
    ladderGap: design('Within a step of the gallery it serves (validator STEP_GAP_NU).'),
    lecternRadius: {
      basis: 'design',
      sourceIds: ['S05'],
      note: 'The bottled encyclopedia is seen; the stand it rests on and its place are authored.',
    },
  },
  'S-01': {
    shelfDepth: {
      basis: 'design',
      sourceIds: ['S05', 'S06'],
      note: 'Shelving is seen; its depth is authored.',
    },
    shelfHeight: design('Below the storeroom ceiling.'),
    shelfPitch: design('Matches the library shelf pitch.'),
    bayWidth: design('Bays between uprights.'),
    cotSize: {
      basis: 'design',
      sourceIds: ['S05', 'S06'],
      note: 'The cot is seen; its footprint is authored.',
    },
    cotHeight: design('Cot rails below waist height of a standing figure.'),
    mementoEvery: design('Mementos (the toy TARDIS among them) on every other shelf bay.'),
  },
  'ARS-01': {
    plinthRadius: design('Base the tree stands on.'),
    trunkRadius: design('Column slender against the chamber.'),
    trunkHeight: {
      basis: 'order',
      sourceIds: ['S05', 'S52'],
      note: 'A very tall chamber with a tree-like machine rising through it; the height is authored.',
    },
    tierHeights: design('Branches start above head height so the floor stays walkable.'),
    branchesPerTier: {
      basis: 'design',
      sourceIds: ['S05', 'S52'],
      note: 'Branching is seen; the count per tier is authored.',
    },
    tierReach: design('The crown narrows upward, like a tree.'),
    branchRise: design('Branches lift toward their tips.'),
    bulbRadius: {
      basis: 'design',
      sourceIds: ['S05', 'S52'],
      note: 'Glowing orbs hang from the machine; their size is authored.',
    },
    bulbDrop: design('Orbs hang just below each branch tip.'),
  },
  'F-01': {
    rodRadius: {
      basis: 'design',
      sourceIds: ['S41', 'S23'],
      note: 'Exposed hazardous rods are described; their size is authored.',
    },
    tunnelRodOffset: design('Rods hang either side of the walk line, clear of it.'),
    tunnelRodSpacing: design('Dense enough to read as a hazard run.'),
    headroom: design('Clear height under the rods, above the 1-NU walking height.'),
    deckRodHeight: design('Rods rise between the fuel cells, visible from above.'),
  },
  'E-A': {
    bulkheadWidth: {
      basis: 'design',
      sourceIds: ['S23'],
      note: 'A separate antechamber set is recorded; how it is sealed is authored.',
    },
    bulkheadDepth: design('Bulkhead frames stand proud of the walls.'),
    wheelRadius: design('Locking wheels on the side walls signal a sealed space.'),
    sealStripDepth: design('Glowing seal strips across each threshold.'),
  },
  'E-01': {
    coreRadius: {
      basis: 'design',
      sourceIds: ['S05', 'S06'],
      note: 'An exploding star held in decay is seen; its size is authored.',
    },
    coreDrop: {
      basis: 'order',
      sourceIds: ['S05'],
      note: 'The catwalk passes above the star; the depth below it is authored.',
    },
    coreSlices: design('Stacked discs approximate the sphere in the greybox.'),
    cageGap: design('Containment ring clear of the core.'),
    cageStruts: design('Struts carrying the containment ring.'),
    flareCount: design('Flares frozen leaving the core.'),
    flareReach: design('Flares reach past the containment ring, well inside the chamber walls.'),
    blindThresholds: {
      basis: 'design',
      sourceIds: ['S05', 'S06'],
      note: 'Several doorways are seen; how many beyond the route’s two, and where, is authored.',
    },
  },
  'E-V': {
    frameGap: design('Marker frame just outside the portal opening.'),
    frameWidth: design('Wide enough to read at region zoom.'),
    chevronCount: design('Warning chevrons on the floor before the portal.'),
  },
  'ENG-01': {
    fireballRadius: {
      basis: 'design',
      sourceIds: ['S05', 'S41'],
      note: 'An explosion frozen in time is seen (~38:23); its size is authored.',
    },
    fireballDrop: design('Centred in the void below the gallery.'),
    fireballSlices: design('Stacked discs approximate the fireball in the greybox.'),
    fragmentCount: design('Enough fragments to read as a burst.'),
    fragmentReach: design('Fragments frozen between the fireball and the gallery edge.'),
    shockRadius: design('A frozen shock ring around the fireball.'),
    plinthRadius: design('Engine housing the explosion bursts from; its form is authored.'),
  },
};
