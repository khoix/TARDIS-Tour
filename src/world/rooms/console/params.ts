/**
 * Pickwoad console-room parameters, in normalized units (NU). Only counts, shapes and the
 * order of the decks are evidenced; every length, height and bearing is a design value.
 * {@link CONSOLE_PARAM_NOTES} records the basis of each one; the rationale per proportion
 * is in research/room-dossiers/console-room.md.
 */

import { CONSOLE_RADIUS_NU, DECK_Y } from '../../../data/layout';

export interface ConsoleParams {
  // Decks
  readonly mainY: number;
  readonly galleryY: number;
  readonly lowerY: number;
  readonly deckThickness: number;
  readonly mainDeckRadius: number;
  readonly galleryInnerRadius: number;
  readonly shellRadius: number;
  readonly wallThickness: number;
  readonly galleryWallHeight: number;
  readonly railingHeight: number;
  // Ribs and vault
  readonly ribCount: number;
  readonly ribPhaseDeg: number;
  readonly ribWidth: number;
  readonly ribDepth: number;
  readonly ribKneeY: number;
  readonly ribCrownY: number;
  readonly ribCrownRadius: number;
  // Console, rotor, rings
  readonly consoleSides: number;
  readonly consoleRadius: number;
  readonly consoleHeight: number;
  readonly rotorRadius: number;
  readonly rotorTopY: number;
  readonly ringDivisions: number;
  readonly ringRadii: readonly [number, number];
  readonly ringY: readonly [number, number];
  readonly ringSpin: readonly [1 | -1, 1 | -1];
  readonly ringPeriodSeconds: number;
  // Stairs
  readonly stairWidth: number;
  readonly stepRise: number;
  readonly galleryStairAzimuthDeg: number;
  readonly lowerStairAzimuthDeg: number;
  // Entry
  readonly exteriorDoorAzimuthDeg: number;
  readonly bridgeWidth: number;
  readonly bridgeThickness: number;
  readonly thresholdDepth: number;
  readonly thresholdHeight: number;
  // Inner doors and the landings behind them
  readonly reportedInnerDoors: number;
  readonly verifiedInnerDoors: number | null;
  readonly upperExitAzimuthDeg: number;
  readonly upperClosedDoorAzimuthDeg: number;
  readonly lowerExitAzimuthDeg: number;
  readonly lowerClosedDoorAzimuthDeg: number;
  readonly doorWidth: number;
  readonly doorHeight: number;
  readonly panelSize: number;
  readonly landingSize: number;
  // Under-console compartment
  readonly hatchRadius: number;
  readonly compartmentSize: number;
  readonly compartmentDrop: number;
}

export const CONSOLE_PARAMS: ConsoleParams = {
  mainY: DECK_Y.main,
  galleryY: DECK_Y.gallery,
  lowerY: DECK_Y.lower,
  deckThickness: 0.5,
  mainDeckRadius: CONSOLE_RADIUS_NU,
  galleryInnerRadius: 17,
  shellRadius: 21,
  wallThickness: 0.5,
  galleryWallHeight: 5,
  railingHeight: 1.1,

  ribCount: 18,
  ribPhaseDeg: 10,
  ribWidth: 0.8,
  ribDepth: 1,
  ribKneeY: 13,
  ribCrownY: 19,
  ribCrownRadius: 14,

  consoleSides: 6,
  consoleRadius: 3,
  consoleHeight: 1.2,
  rotorRadius: 0.7,
  rotorTopY: 16.5,
  ringDivisions: 18,
  ringRadii: [5.5, 4],
  ringY: [13.5, 15],
  ringSpin: [1, -1],
  ringPeriodSeconds: 90,

  stairWidth: 3,
  stepRise: 0.5,
  galleryStairAzimuthDeg: 120,
  lowerStairAzimuthDeg: 240,

  exteriorDoorAzimuthDeg: 0,
  bridgeWidth: 3,
  bridgeThickness: 0.3,
  thresholdDepth: 4,
  thresholdHeight: 6,

  reportedInnerDoors: 4,
  verifiedInnerDoors: null,
  upperExitAzimuthDeg: 0,
  upperClosedDoorAzimuthDeg: 180,
  lowerExitAzimuthDeg: 180,
  lowerClosedDoorAzimuthDeg: 60,
  doorWidth: 2.5,
  doorHeight: 4,
  panelSize: 3,
  landingSize: 4,

  hatchRadius: 1,
  compartmentSize: 4,
  compartmentDrop: 4,
};

/**
 * `verified`: the value itself is evidenced. `order`: only its sign or ordering is.
 * `design`: an authored choice (scale = normalized_authored).
 */
export interface ParamNote {
  readonly basis: 'verified' | 'order' | 'design';
  readonly sourceIds: readonly string[];
  readonly note: string;
}

function design(note: string): ParamNote {
  return { basis: 'design', sourceIds: [], note };
}

export const CONSOLE_PARAM_NOTES: Readonly<Record<keyof ConsoleParams, ParamNote>> = {
  mainY: { basis: 'order', sourceIds: ['S03'], note: 'Main deck defines the origin, Y = 0.' },
  galleryY: {
    basis: 'order',
    sourceIds: ['S03', 'S04'],
    note: 'Gallery is above the main deck; the height is authored.',
  },
  lowerY: {
    basis: 'order',
    sourceIds: ['S03', 'S09', 'S10'],
    note: 'Lower technical deck is below the main deck; the depth is authored.',
  },
  deckThickness: design('Plate depth chosen to read as a structural deck at overview zoom.'),
  mainDeckRadius: design('Equals consoleRadiusNU, the project scale unit.'),
  galleryInnerRadius: design('Leaves a stair run equal to the deck rise (45° flights).'),
  shellRadius: design('Gallery width 4 NU, wide enough to read as walkable.'),
  wallThickness: design('Thin shell; doorways are this deep.'),
  galleryWallHeight: design('Room for a door plus a lintel band below the rib knees.'),
  railingHeight: design('Guard rail at about hip height of a 2-NU-wide stair.'),

  ribCount: {
    basis: 'verified',
    sourceIds: ['S03', 'S04'],
    note: 'Eighteen ribs, chosen by the designer.',
  },
  ribPhaseDeg: design('Ribs at 10° + 20°k so each 20° bay is centred on the 0° entrance.'),
  ribWidth: design('Slender enough to keep the bays open.'),
  ribDepth: design('Straddles the shell line so ribs read inside and out.'),
  ribKneeY: design('Ribs rise above the gallery wall before curving in.'),
  ribCrownY: design('Vault crown; also the top of the gallery volume.'),
  ribCrownRadius: design('Inward sweep of the ribs over the room.'),

  consoleSides: { basis: 'verified', sourceIds: ['S03', 'S11'], note: 'Hexagonal console.' },
  consoleRadius: design('About a third of the main deck radius.'),
  consoleHeight: design('Waist-height desk relative to the 1-NU walking height.'),
  rotorRadius: design('Column narrow against the console.'),
  rotorTopY: design('Column rises through the ring assemblies toward the crown.'),
  ringDivisions: {
    basis: 'verified',
    sourceIds: ['S03'],
    note: 'Rotor rings are divided into eighteen parts, echoing the ribs.',
  },
  ringRadii: design('Two nested rings inside the rib crown.'),
  ringY: design('Hung overhead between the gallery and the crown.'),
  ringSpin: {
    basis: 'verified',
    sourceIds: ['S03'],
    note: 'The overhead assembly is contra-rotating; which ring turns which way is authored.',
  },
  ringPeriodSeconds: design('Slow turn; disabled under prefers-reduced-motion.'),

  stairWidth: design('Wide enough to read at overview zoom.'),
  stepRise: design('Fourteen steps per 7-NU flight.'),
  galleryStairAzimuthDeg: {
    basis: 'design',
    sourceIds: ['S03', 'S07'],
    note: 'Several stairs facing different directions are attested; this bearing is authored.',
  },
  lowerStairAzimuthDeg: {
    basis: 'design',
    sourceIds: ['S03', 'S07'],
    note: 'Faces 120° away from the gallery stair (Escher-like variety); bearing authored.',
  },

  exteriorDoorAzimuthDeg: {
    basis: 'design',
    sourceIds: [],
    note: 'Bookkeeping convention (research §C.1): the exterior doors define room-local 0°.',
  },
  bridgeWidth: design('Lightweight suspended bridge [S03]; width authored.'),
  bridgeThickness: design('Thinner than the decks so it reads as suspended.'),
  thresholdDepth: design('Police-box threshold depth, equal to the landing size.'),
  thresholdHeight: design('Taller than a door, below the gallery deck.'),

  reportedInnerDoors: {
    basis: 'verified',
    sourceIds: ['S13', 'S40'],
    note: 'Secondary catalogs report four inner doors (two upper, two lower); not counted on set.',
  },
  verifiedInnerDoors: {
    basis: 'verified',
    sourceIds: [],
    note: 'No complete survey exists, so the verified count stays null (research §C).',
  },
  upperExitAzimuthDeg: design(
    'Over the entrance: one of the two axis-aligned bays (0°, 180°) that keep landings outside the shell.',
  ),
  upperClosedDoorAzimuthDeg: design('Opposite the upper exit.'),
  lowerExitAzimuthDeg: design(
    'The other axis-aligned bay, so the deep exit leaves away from the entrance.',
  ),
  lowerClosedDoorAzimuthDeg: design('Away from both stairs and the panel.'),
  doorWidth: design('Human-scale relative to the 1-NU walking height.'),
  doorHeight: design('Fits under the gallery wall lintel band.'),
  panelSize: design('Hexagonal lower panel [S05, S07]; size authored.'),
  landingSize: design('Short landing, matches the layout boxes of C-XU and C-XL.'),

  hatchRadius: design('Opening in the lower deck directly under the console.'),
  compartmentSize: design('Small bay, matches the C-LAD layout box.'),
  compartmentDrop: design('Ladder length below the lower deck.'),
};
