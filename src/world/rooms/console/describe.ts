/**
 * Pickwoad console room, described as pure data (describe → build). Covers the console
 * nodes P-EX, C-M, C-U, C-L, C-XU, C-XL and C-LAD and the edges between them (B01–B06).
 * Coordinates are world NU: the rotor axis is at the origin and the main deck at Y = 0.
 * Azimuths follow src/world/structure.ts (0° = +Z, the exterior doors; 90° = +X).
 */

import { getConnection } from '../../../data/connections';
import type { Vec3 } from '../../../data/layout';
import {
  type AnchorPlacement,
  type BoxPrimitive,
  type EvidenceClass,
  evidenceClassOfProvenance,
  type KitPrimitive,
  type MeshPart,
  type MeshTag,
  type PathSegment,
  polar,
  type StructureDescription,
  type StructureElement,
  type SurfaceShape,
  type Vec2,
  type Volume,
} from '../../structure';
import { CONSOLE_PARAMS, type ConsoleParams } from './params';

export const CONSOLE_ROOM_IDS = ['P-EX', 'C-M', 'C-U', 'C-L', 'C-XU', 'C-XL', 'C-LAD'] as const;
/** Walkability is measured from the main deck. */
export const CONSOLE_START_SURFACE = 'C-M.main-deck';
export const CLOSED_DOOR_LABEL = 'Reported, destination unknown';

const AXIS: Vec2 = [0, 0];
const DEG = 180 / Math.PI;

function roomTag(id: string, part: MeshPart, evidenceClass: EvidenceClass): MeshTag {
  return { kind: 'room', id, part, evidenceClass };
}

function connectionTag(id: string, part: MeshPart): MeshTag {
  const c = getConnection(id);
  if (!c) throw new Error(`Unknown connection ${id}`);
  return { kind: 'connection', id, part, evidenceClass: evidenceClassOfProvenance(c.provenance) };
}

/** Half the angle a chord of `width` subtends at `radius`, in degrees. */
function halfAngleDeg(width: number, radius: number): number {
  return Math.asin(width / 2 / radius) * DEG;
}

/** Horizontal unit vector of an axis-aligned bearing (0/90/180/270°). */
function axisDirection(azimuthDeg: number): Vec2 {
  const a = ((azimuthDeg % 360) + 360) % 360;
  const dirs: Record<number, Vec2> = { 0: [0, 1], 90: [1, 0], 180: [0, -1], 270: [-1, 0] };
  const d = dirs[a];
  if (!d) {
    throw new Error(`Bearing ${azimuthDeg}° is not axis-aligned; layout boxes cannot rotate`);
  }
  return d;
}

/** Axis-aligned box running radially outward from `r0` to `r1` along an axis bearing. */
function radialBox(
  azimuthDeg: number,
  r0: number,
  r1: number,
  halfWidth: number,
  y0: number,
  y1: number,
): BoxPrimitive {
  const [dx, dz] = axisDirection(azimuthDeg);
  const xs = dx === 0 ? [-halfWidth, halfWidth] : [dx * r0, dx * r1];
  const zs = dz === 0 ? [-halfWidth, halfWidth] : [dz * r0, dz * r1];
  return {
    type: 'box',
    min: [Math.min(...xs), y0, Math.min(...zs)],
    max: [Math.max(...xs), y1, Math.max(...zs)],
  };
}

function footprint(b: BoxPrimitive): SurfaceShape {
  return { kind: 'rect', min: [b.min[0], b.min[2]], max: [b.max[0], b.max[2]] };
}

function boxVolume(id: string, roomId: string, b: BoxPrimitive): Volume {
  return { id, roomId, shape: 'box', min: b.min, max: b.max };
}

/** Floor slab under a box's footprint, `thickness` deep below `top`. */
function slab(b: BoxPrimitive, top: number, thickness: number): BoxPrimitive {
  return {
    type: 'box',
    min: [b.min[0], top - thickness, b.min[2]],
    max: [b.max[0], top, b.max[2]],
  };
}

/**
 * Side and far walls of a box that opens back toward the shell along `azimuthDeg`, from
 * its floor to its top, `thickness` thick and inside the box.
 */
function boothWalls(b: BoxPrimitive, azimuthDeg: number, thickness: number): BoxPrimitive[] {
  const [dx, dz] = axisDirection(azimuthDeg);
  const box = (min: Vec3, max: Vec3): BoxPrimitive => ({ type: 'box', min, max });
  const [x0, y0, z0] = b.min;
  const [x1, y1, z1] = b.max;
  if (dx === 0) {
    const far =
      dz > 0
        ? box([x0, y0, z1 - thickness], [x1, y1, z1])
        : box([x0, y0, z0], [x1, y1, z0 + thickness]);
    return [
      box([x0, y0, z0], [x0 + thickness, y1, z1]),
      box([x1 - thickness, y0, z0], [x1, y1, z1]),
      far,
    ];
  }
  const far =
    dx > 0
      ? box([x1 - thickness, y0, z0], [x1, y1, z1])
      : box([x0, y0, z0], [x0 + thickness, y1, z1]);
  return [
    box([x0, y0, z0], [x1, y1, z0 + thickness]),
    box([x0, y0, z1 - thickness], [x1, y1, z1]),
    far,
  ];
}

function offset(p: Vec3, d: Vec3): Vec3 {
  return [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
}

/** Arcs [startDeg, sweepDeg] of a full circle left between gaps (centre, half-angle). */
function arcsBetween(gaps: readonly { readonly az: number; readonly half: number }[]) {
  if (gaps.length === 0) return [[0, 360]] as const;
  const sorted = [...gaps].sort((a, b) => a.az - b.az);
  return sorted.map((g, i) => {
    const next = sorted[(i + 1) % sorted.length] as { az: number; half: number };
    const start = g.az + g.half;
    const end = next.az - next.half + (i === sorted.length - 1 ? 360 : 0);
    return [start, end - start] as const;
  });
}

interface WallOpening {
  readonly az: number;
  readonly width: number;
  /** Height of the opening's top above the wall bottom. */
  readonly top: number;
}

/** Curved shell wall split into full-height arcs and lintels over each opening. */
function wallWithOpenings(
  tag: MeshTag,
  inner: number,
  outer: number,
  bottom: number,
  top: number,
  openings: readonly WallOpening[],
): StructureElement[] {
  const gaps = openings.map((o) => ({ az: o.az, half: halfAngleDeg(o.width, inner) }));
  const plate = (startDeg: number, sweepDeg: number, from: number): StructureElement => ({
    tag,
    primitive: { type: 'plate', center: AXIS, inner, outer, bottom: from, top, startDeg, sweepDeg },
  });
  const arcs = arcsBetween(gaps).map(([start, sweep]) => plate(start, sweep, bottom));
  const lintels = openings.flatMap((o, i) => {
    const half = gaps[i]?.half ?? 0;
    return bottom + o.top < top ? [plate(o.az - half, 2 * half, bottom + o.top)] : [];
  });
  return [...arcs, ...lintels];
}

/** Guard-rail arcs around a circle, leaving gaps where stairs or bridges meet it. */
function railingArcs(
  tag: MeshTag,
  radius: number,
  y: number,
  height: number,
  gaps: readonly { readonly az: number; readonly width: number }[],
): StructureElement[] {
  const g = gaps.map((x) => ({ az: x.az, half: halfAngleDeg(x.width, radius) }));
  return arcsBetween(g).map(([startDeg, sweepDeg]) => ({
    tag,
    primitive: {
      type: 'railing',
      path: 'arc',
      center: AXIS,
      radius,
      y,
      startDeg,
      sweepDeg,
      height,
    },
  }));
}

/** Two railings along the long sides of a straight run from `a` to `b`. */
function sideRailings(tag: MeshTag, a: Vec3, b: Vec3, width: number, height: number) {
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz);
  const across: Vec3 = [(dz / len) * (width / 2), 0, (-dx / len) * (width / 2)];
  const back: Vec3 = [-across[0], 0, -across[2]];
  return [across, back].map((o): StructureElement => ({
    tag,
    primitive: { type: 'railing', path: 'line', from: offset(a, o), to: offset(b, o), height },
  }));
}

export function describeConsoleRoom(p: ConsoleParams = CONSOLE_PARAMS): StructureDescription {
  const shellOuter = p.shellRadius + p.wallThickness;
  const shellMid = p.shellRadius + p.wallThickness / 2;
  const doorSillR = shellMid;
  const insideDoorR = p.shellRadius - 0.5;
  const outsideDoorR = shellOuter + 0.5;
  // 45°-equivalent flights: horizontal run per unit rise is the same for both stairs.
  const runPerRise = (p.galleryInnerRadius - p.mainDeckRadius) / (p.galleryY - p.mainY);
  const lowerFootR = p.mainDeckRadius + (p.mainY - p.lowerY) * runPerRise;
  const compartmentTop = p.lowerY - p.deckThickness;
  const compartmentFloor = compartmentTop - p.compartmentDrop;
  const ladderOffset = 0.4;
  const half = p.landingSize / 2;

  // ── Boxes outside the shell (threshold, landings) and the sub-console compartment ──
  const threshold = radialBox(
    p.exteriorDoorAzimuthDeg,
    shellOuter,
    shellOuter + p.thresholdDepth,
    half,
    p.mainY,
    p.mainY + p.thresholdHeight,
  );
  const upperLanding = radialBox(
    p.upperExitAzimuthDeg,
    shellOuter,
    shellOuter + p.landingSize,
    half,
    p.galleryY,
    p.galleryY + p.landingSize,
  );
  const lowerLanding = radialBox(
    p.lowerExitAzimuthDeg,
    shellOuter,
    shellOuter + p.landingSize,
    half,
    p.lowerY,
    p.lowerY + p.landingSize,
  );
  const s = p.compartmentSize / 2;
  const compartment: BoxPrimitive = {
    type: 'box',
    min: [-s, compartmentFloor, -s],
    max: [s, compartmentTop, s],
  };

  const volumes: Volume[] = [
    {
      id: 'C-L.band',
      roomId: 'C-L',
      shape: 'cylinder',
      center: AXIS,
      radius: p.shellRadius,
      y0: p.lowerY,
      y1: p.mainY,
    },
    {
      id: 'C-M.band',
      roomId: 'C-M',
      shape: 'cylinder',
      center: AXIS,
      radius: p.shellRadius,
      y0: p.mainY,
      y1: p.galleryY,
    },
    {
      id: 'C-U.band',
      roomId: 'C-U',
      shape: 'cylinder',
      center: AXIS,
      radius: p.shellRadius,
      y0: p.galleryY,
      y1: p.ribCrownY,
    },
    boxVolume('P-EX.threshold', 'P-EX', threshold),
    boxVolume('C-XU.landing', 'C-XU', upperLanding),
    boxVolume('C-XL.landing', 'C-XL', lowerLanding),
    boxVolume('C-LAD.compartment', 'C-LAD', compartment),
  ];

  // ── Walkable surfaces ──
  const bridgeRect = radialBox(
    p.exteriorDoorAzimuthDeg,
    p.mainDeckRadius - 0.5,
    shellOuter,
    p.bridgeWidth / 2,
    p.mainY - p.bridgeThickness,
    p.mainY,
  );
  const surfaces = [
    {
      id: 'C-M.main-deck',
      roomId: 'C-M',
      y: p.mainY,
      shapes: [
        { kind: 'annulus', center: AXIS, inner: p.consoleRadius + 0.5, outer: p.mainDeckRadius },
        footprint(bridgeRect),
      ],
    },
    {
      id: 'C-U.gallery',
      roomId: 'C-U',
      y: p.galleryY,
      shapes: [
        { kind: 'annulus', center: AXIS, inner: p.galleryInnerRadius, outer: p.shellRadius },
      ],
    },
    {
      id: 'C-L.lower-deck',
      roomId: 'C-L',
      y: p.lowerY,
      shapes: [{ kind: 'annulus', center: AXIS, inner: p.hatchRadius, outer: p.shellRadius }],
    },
    { id: 'P-EX.threshold', roomId: 'P-EX', y: p.mainY, shapes: [footprint(threshold)] },
    { id: 'C-XU.landing', roomId: 'C-XU', y: p.galleryY, shapes: [footprint(upperLanding)] },
    { id: 'C-XL.landing', roomId: 'C-XL', y: p.lowerY, shapes: [footprint(lowerLanding)] },
    { id: 'C-LAD.floor', roomId: 'C-LAD', y: compartmentFloor, shapes: [footprint(compartment)] },
  ] as const satisfies StructureDescription['surfaces'];

  // ── Door anchors (every topology anchor of the console nodes) ──
  const anchor = (
    roomId: string,
    anchorId: string,
    surfaceId: string,
    position: Vec3,
    azimuthDeg: number | null,
    state: AnchorPlacement['state'] = 'open',
  ): AnchorPlacement => ({ roomId, anchorId, surfaceId, position, azimuthDeg, state });
  const ex = p.exteriorDoorAzimuthDeg;
  const up = p.upperExitAzimuthDeg;
  const lo = p.lowerExitAzimuthDeg;
  const anchors: AnchorPlacement[] = [
    anchor('P-EX', 'interior', 'P-EX.threshold', polar(AXIS, outsideDoorR, ex, p.mainY), ex),
    anchor('C-M', 'exterior-doors', 'C-M.main-deck', polar(AXIS, insideDoorR, ex, p.mainY), ex),
    anchor(
      'C-M',
      'stair-up',
      'C-M.main-deck',
      polar(AXIS, p.mainDeckRadius - 0.5, p.galleryStairAzimuthDeg, p.mainY),
      p.galleryStairAzimuthDeg,
    ),
    anchor(
      'C-M',
      'stair-down',
      'C-M.main-deck',
      polar(AXIS, p.mainDeckRadius - 0.5, p.lowerStairAzimuthDeg, p.mainY),
      p.lowerStairAzimuthDeg,
    ),
    anchor(
      'C-U',
      'stair-landing',
      'C-U.gallery',
      polar(AXIS, p.galleryInnerRadius + 0.5, p.galleryStairAzimuthDeg, p.galleryY),
      p.galleryStairAzimuthDeg,
    ),
    anchor('C-U', 'upper-door-1', 'C-U.gallery', polar(AXIS, insideDoorR, up, p.galleryY), up),
    anchor(
      'C-U',
      'upper-door-2',
      'C-U.gallery',
      polar(AXIS, insideDoorR, p.upperClosedDoorAzimuthDeg, p.galleryY),
      p.upperClosedDoorAzimuthDeg,
      'closed',
    ),
    anchor(
      'C-L',
      'stair-landing',
      'C-L.lower-deck',
      polar(AXIS, lowerFootR + 0.5, p.lowerStairAzimuthDeg, p.lowerY),
      p.lowerStairAzimuthDeg,
    ),
    anchor('C-L', 'lower-wall-panel', 'C-L.lower-deck', polar(AXIS, insideDoorR, lo, p.lowerY), lo),
    anchor(
      'C-L',
      'lower-door-2',
      'C-L.lower-deck',
      polar(AXIS, insideDoorR, p.lowerClosedDoorAzimuthDeg, p.lowerY),
      p.lowerClosedDoorAzimuthDeg,
      'closed',
    ),
    anchor(
      'C-L',
      'console-underside',
      'C-L.lower-deck',
      polar(AXIS, p.hatchRadius + 0.6, 0, p.lowerY),
      null,
    ),
    anchor('C-XU', 'gallery-side', 'C-XU.landing', polar(AXIS, outsideDoorR, up, p.galleryY), up),
    anchor(
      'C-XU',
      'corridor-side',
      'C-XU.landing',
      polar(AXIS, shellOuter + p.landingSize - 0.5, up, p.galleryY),
      up,
    ),
    anchor('C-XL', 'console-side', 'C-XL.landing', polar(AXIS, outsideDoorR, lo, p.lowerY), lo),
    anchor(
      'C-XL',
      'corridor-side',
      'C-XL.landing',
      polar(AXIS, shellOuter + p.landingSize - 0.5, lo, p.lowerY),
      lo,
    ),
    anchor('C-LAD', 'hatch', 'C-LAD.floor', polar(AXIS, ladderOffset, 0, compartmentFloor), null),
    anchor(
      'C-LAD',
      'service-side',
      'C-LAD.floor',
      polar(AXIS, s - 0.4, 180, compartmentFloor),
      null,
      'closed',
    ),
  ];
  const at = (roomId: string, anchorId: string): Vec3 => {
    const a = anchors.find((x) => x.roomId === roomId && x.anchorId === anchorId);
    if (!a) throw new Error(`No anchor ${roomId}.${anchorId}`);
    return a.position;
  };

  // ── Paths: one per topology edge, from its `from` anchor to its `to` anchor ──
  const path = (connectionId: string, middle: readonly Vec3[] = []): PathSegment => {
    const c = getConnection(connectionId);
    if (!c) throw new Error(`Unknown connection ${connectionId}`);
    return {
      id: `${connectionId}.path`,
      connectionId,
      kind: c.kind,
      portal: c.portal,
      from: { roomId: c.from.room, anchorId: c.from.anchor },
      to: { roomId: c.to.room, anchorId: c.to.anchor },
      points: [at(c.from.room, c.from.anchor), ...middle, at(c.to.room, c.to.anchor)],
    };
  };
  const galleryStairBottom = polar(AXIS, p.mainDeckRadius, p.galleryStairAzimuthDeg, p.mainY);
  const galleryStairTop = polar(AXIS, p.galleryInnerRadius, p.galleryStairAzimuthDeg, p.galleryY);
  const lowerStairTop = polar(AXIS, p.mainDeckRadius, p.lowerStairAzimuthDeg, p.mainY);
  const lowerStairBottom = polar(AXIS, lowerFootR, p.lowerStairAzimuthDeg, p.lowerY);
  const ladderTop = polar(AXIS, ladderOffset, 0, p.lowerY);
  const paths: PathSegment[] = [
    path('B01'),
    path('B02', [galleryStairBottom, galleryStairTop]),
    path('B03', [lowerStairTop, lowerStairBottom]),
    path('B04'),
    path('B05'),
    path('B06', [ladderTop]),
  ];

  // ── Elements ──
  const el = (tag: MeshTag, primitive: KitPrimitive, label?: string): StructureElement =>
    label === undefined ? { tag, primitive } : { tag, primitive, label };
  const plate = (
    inner: number,
    outer: number,
    bottom: number,
    top: number,
    extra: { sides?: number } = {},
  ): KitPrimitive => ({ type: 'plate', center: AXIS, inner, outer, bottom, top, ...extra });
  const doorway = (
    azimuthDeg: number,
    y: number,
    width: number,
    height: number,
    profile: 'rect' | 'hex',
    closed: boolean,
  ): KitPrimitive => ({
    type: 'doorway',
    sill: polar(AXIS, doorSillR, azimuthDeg, y),
    azimuthDeg,
    width,
    height,
    depth: p.wallThickness,
    profile,
    closed,
  });
  const ribProfile: Vec2[] = [
    [shellMid, p.lowerY - p.deckThickness],
    [shellMid, p.ribKneeY],
    [p.ribCrownRadius, p.ribCrownY],
  ];
  const ribStep = 360 / p.ribCount;
  const boothWall = 0.2;

  const elements: StructureElement[] = [
    // C-M: main deck, bridge, console, rotor, rings, ribs and crown (evidence: S03, S04, S11).
    el(
      roomTag('C-M', 'floor', 'sourced'),
      plate(0, p.mainDeckRadius, p.mainY - p.deckThickness, p.mainY),
    ),
    el(roomTag('C-M', 'bridge', 'sourced'), bridgeRect),
    el(
      roomTag('C-M', 'console', 'sourced'),
      plate(0, p.consoleRadius, p.mainY, p.mainY + p.consoleHeight, { sides: p.consoleSides }),
    ),
    el(
      roomTag('C-M', 'rotor', 'sourced'),
      plate(0, p.rotorRadius, p.mainY + p.consoleHeight, p.rotorTopY),
    ),
    ...p.ringRadii.map((radius, i) =>
      el(roomTag('C-M', 'rotor-ring', 'sourced'), {
        type: 'ring',
        center: [0, p.ringY[i] ?? p.ribKneeY, 0],
        radius,
        hubRadius: p.rotorRadius,
        divisions: p.ringDivisions,
        spokes: 3,
        segmentHeight: 0.6,
        segmentDepth: 0.5,
        spin: p.ringSpin[i] ?? 1,
      }),
    ),
    ...Array.from({ length: p.ribCount }, (_, k) =>
      el(roomTag('C-M', 'rib', 'sourced'), {
        type: 'rib',
        center: AXIS,
        azimuthDeg: p.ribPhaseDeg + k * ribStep,
        profile: ribProfile,
        width: p.ribWidth,
        depth: p.ribDepth,
      }),
    ),
    // Crown ring tying the rib heads: a design choice.
    el(
      roomTag('C-M', 'crown', 'inferred'),
      plate(p.ribCrownRadius - 0.5, p.ribCrownRadius + 0.5, p.ribCrownY - 0.3, p.ribCrownY + 0.3),
    ),
    ...railingArcs(
      roomTag('C-M', 'railing', 'inferred'),
      p.mainDeckRadius - 0.15,
      p.mainY,
      p.railingHeight,
      [
        { az: ex, width: p.bridgeWidth + 0.4 },
        { az: p.galleryStairAzimuthDeg, width: p.stairWidth + 0.4 },
        { az: p.lowerStairAzimuthDeg, width: p.stairWidth + 0.4 },
      ],
    ),
    ...sideRailings(
      roomTag('C-M', 'railing', 'inferred'),
      polar(AXIS, p.mainDeckRadius, ex, p.mainY),
      polar(AXIS, p.shellRadius, ex, p.mainY),
      p.bridgeWidth - 0.2,
      p.railingHeight,
    ),

    // C-U: gallery deck, inner rail, outer wall with the two reported upper doors.
    el(
      roomTag('C-U', 'floor', 'sourced'),
      plate(p.galleryInnerRadius, p.shellRadius, p.galleryY - p.deckThickness, p.galleryY),
    ),
    ...railingArcs(
      roomTag('C-U', 'railing', 'inferred'),
      p.galleryInnerRadius + 0.15,
      p.galleryY,
      p.railingHeight,
      [{ az: p.galleryStairAzimuthDeg, width: p.stairWidth + 0.4 }],
    ),
    ...wallWithOpenings(
      roomTag('C-U', 'wall', 'inferred'),
      p.shellRadius,
      shellOuter,
      p.galleryY,
      p.galleryY + p.galleryWallHeight,
      [
        { az: up, width: p.doorWidth, top: p.doorHeight },
        { az: p.upperClosedDoorAzimuthDeg, width: p.doorWidth, top: p.doorHeight },
      ],
    ),
    el(
      roomTag('C-U', 'door-closed', 'reconstructed'),
      doorway(p.upperClosedDoorAzimuthDeg, p.galleryY, p.doorWidth, p.doorHeight, 'rect', true),
      CLOSED_DOOR_LABEL,
    ),

    // C-L: lower deck with the under-console hatch, the lower structure the ribs rise from.
    el(
      roomTag('C-L', 'floor', 'sourced'),
      plate(p.hatchRadius, p.shellRadius, p.lowerY - p.deckThickness, p.lowerY),
    ),
    ...wallWithOpenings(
      roomTag('C-L', 'wall', 'inferred'),
      p.shellRadius,
      shellOuter,
      p.lowerY - p.deckThickness,
      p.mainY,
      [
        { az: lo, width: p.panelSize, top: p.deckThickness + p.panelSize },
        {
          az: p.lowerClosedDoorAzimuthDeg,
          width: p.doorWidth,
          top: p.deckThickness + p.doorHeight,
        },
      ],
    ),
    el(
      roomTag('C-L', 'door-closed', 'reconstructed'),
      doorway(p.lowerClosedDoorAzimuthDeg, p.lowerY, p.doorWidth, p.doorHeight, 'rect', true),
      CLOSED_DOOR_LABEL,
    ),

    // P-EX: police-box threshold at the end of the bridge (room-local 0°).
    el(roomTag('P-EX', 'floor', 'sourced'), slab(threshold, p.mainY, p.deckThickness)),
    ...boothWalls(threshold, ex, boothWall).map((b) => el(roomTag('P-EX', 'wall', 'sourced'), b)),

    // Landings behind the open inner doors: authored depth (grade D).
    el(roomTag('C-XU', 'floor', 'inferred'), slab(upperLanding, p.galleryY, p.deckThickness)),
    el(roomTag('C-XL', 'floor', 'inferred'), slab(lowerLanding, p.lowerY, p.deckThickness)),

    // C-LAD: compartment under the hatch, separate from the lower-wall exit (grade C).
    el(
      roomTag('C-LAD', 'floor', 'reconstructed'),
      slab(compartment, compartmentFloor, p.deckThickness),
    ),
    ...[
      ...boothWalls(compartment, 0, boothWall),
      { type: 'box', min: compartment.min, max: [s, compartmentTop, -s + boothWall] } as const,
    ].map((b) => el(roomTag('C-LAD', 'wall', 'reconstructed'), b)),

    // Connections B01–B06.
    el(
      connectionTag('B01', 'doorway'),
      doorway(ex, p.mainY, p.doorWidth, p.thresholdHeight - 1, 'rect', false),
    ),
    el(connectionTag('B02', 'stairs'), {
      type: 'stairs',
      bottom: galleryStairBottom,
      top: galleryStairTop,
      width: p.stairWidth,
      steps: Math.round((p.galleryY - p.mainY) / p.stepRise),
    }),
    ...sideRailings(
      connectionTag('B02', 'railing'),
      galleryStairBottom,
      galleryStairTop,
      p.stairWidth - 0.2,
      p.railingHeight,
    ),
    el(connectionTag('B03', 'stairs'), {
      type: 'stairs',
      bottom: lowerStairBottom,
      top: lowerStairTop,
      width: p.stairWidth,
      steps: Math.round((p.mainY - p.lowerY) / p.stepRise),
    }),
    ...sideRailings(
      connectionTag('B03', 'railing'),
      lowerStairBottom,
      lowerStairTop,
      p.stairWidth - 0.2,
      p.railingHeight,
    ),
    el(
      connectionTag('B04', 'doorway'),
      doorway(up, p.galleryY, p.doorWidth, p.doorHeight, 'rect', false),
    ),
    el(
      connectionTag('B05', 'doorway'),
      doorway(lo, p.lowerY, p.panelSize, p.panelSize, 'hex', false),
    ),
    el(connectionTag('B06', 'ladder'), {
      type: 'ladder',
      bottom: at('C-LAD', 'hatch'),
      top: ladderTop,
      width: 0.9,
      facingDeg: 0,
    }),
  ];

  return {
    id: 'console-room',
    units: 'normalized',
    roomIds: CONSOLE_ROOM_IDS,
    volumes,
    surfaces,
    anchors,
    paths,
    elements,
    labels: [
      { roomId: 'C-M', position: polar(AXIS, 7, 90, p.mainY + 0.5) },
      { roomId: 'C-U', position: polar(AXIS, 19, 90, p.galleryY + 0.5) },
      { roomId: 'C-L', position: polar(AXIS, shellOuter + 1, 90, (p.lowerY + p.mainY) / 2) },
      {
        roomId: 'P-EX',
        position: offset(polar(AXIS, shellOuter + p.thresholdDepth, ex, p.mainY), [
          0,
          p.thresholdHeight / 2,
          0,
        ]),
      },
      { roomId: 'C-XU', position: offset(at('C-XU', 'corridor-side'), [0, p.landingSize, 0]) },
      { roomId: 'C-XL', position: offset(at('C-XL', 'corridor-side'), [0, p.landingSize, 0]) },
      { roomId: 'C-LAD', position: offset(at('C-LAD', 'service-side'), [0, 1, 0]) },
    ],
  };
}
