import { describe, expect, it } from 'vitest';
import { V1_CONNECTIONS } from '../../../src/data/connections';
import { LAYOUT } from '../../../src/data/layout';
import { PLACED_ROOMS, ROOMS } from '../../../src/data/rooms';
import { roomBounds } from '../../../src/scene/topology';
import {
  composeLayers,
  CUT_PARTS,
  cutawayEffect,
  type CutawaySettings,
  deckLevels,
  DEFAULT_CUTAWAY,
  GHOST_KEEP,
  isolationEffect,
  isolationScope,
  isolationSet,
  lowerSection,
  onLevel,
  PICK_MIN_KEEP,
  raiseSection,
  sameSettings,
  sectionStops,
  SELECTED_TINT,
  selectionEffect,
  SOLID,
  VISUAL_LAYERS,
} from '../../../src/systems/visibility/state';
import type { MeshPart, MeshTag } from '../../../src/world/structure';

const bounds = new Map(LAYOUT.map((t) => [t.roomId, roomBounds(t)]));
const room = (id: string, part: MeshPart = 'floor'): MeshTag => ({
  kind: 'room',
  id,
  part,
  evidenceClass: 'sourced',
});
const edge = (id: string, part: MeshPart = 'floor'): MeshTag => ({
  kind: 'connection',
  id,
  part,
  evidenceClass: 'inferred',
});
const settings = (patch: Partial<CutawaySettings>): CutawaySettings => ({
  ...DEFAULT_CUTAWAY,
  ...patch,
});

describe('layer composition', () => {
  it('orders the layers cutaway < isolation < overlay < route < selection', () => {
    expect(VISUAL_LAYERS).toEqual(['cutaway', 'isolation', 'overlay', 'route', 'selection']);
  });

  it('is solid and pickable with no effects', () => {
    expect(composeLayers({})).toEqual(SOLID);
    expect(composeLayers({ cutaway: undefined, selection: {} })).toEqual(SOLID);
  });

  it('unions hidden and cut: no layer can reveal what another hides or cuts', () => {
    const r = composeLayers({
      cutaway: { hidden: true, cut: true },
      selection: { tint: SELECTED_TINT, ghost: 1 },
    });
    expect(r.hidden).toBe(true);
    expect(r.cut).toBe(true);
    expect(r.pickable).toBe(false);
    expect(r.tint).toEqual(SELECTED_TINT);
  });

  it('takes ghost, tint and colour from the highest-precedence layer that sets them', () => {
    const routeTint = { color: 0x00ff00, intensity: 0.4 };
    const r = composeLayers({
      isolation: { ghost: GHOST_KEEP },
      overlay: { color: 0x112233 },
      route: { tint: routeTint, color: 0x445566 },
    });
    expect(r.ghost).toBe(GHOST_KEEP);
    expect(r.tint).toEqual(routeTint);
    expect(r.color).toBe(0x445566);
    // The selection outranks the route's tint and reveals what the isolation ghosts.
    const selected = composeLayers({
      isolation: { ghost: GHOST_KEEP },
      route: { tint: routeTint },
      selection: { tint: SELECTED_TINT, ghost: 1 },
    });
    expect(selected.tint).toEqual(SELECTED_TINT);
    expect(selected.ghost).toBe(1);
    expect(selected.pickable).toBe(true);
    // Order of the record does not matter, only layer precedence.
    expect(composeLayers({ selection: { ghost: 1 }, isolation: { ghost: GHOST_KEEP } }).ghost).toBe(
      1,
    );
  });

  it('makes ghosts thinner than the pick threshold unpickable', () => {
    expect(composeLayers({ isolation: { ghost: PICK_MIN_KEEP } }).pickable).toBe(true);
    expect(composeLayers({ isolation: { ghost: GHOST_KEEP } }).pickable).toBe(false);
    expect(GHOST_KEEP).toBeLessThan(PICK_MIN_KEEP);
  });

  it('rejects ghost values outside (0, 1]', () => {
    expect(() => composeLayers({ overlay: { ghost: 0 } })).toThrow(/outside/);
    expect(() => composeLayers({ overlay: { ghost: 1.5 } })).toThrow(/outside/);
  });
});

describe('cutaway layer', () => {
  it('hides ceilings only while ceilings are hidden (the default)', () => {
    expect(DEFAULT_CUTAWAY.ceilingsHidden).toBe(true);
    expect(cutawayEffect(room('L-01', 'ceiling'), DEFAULT_CUTAWAY)).toEqual({ hidden: true });
    expect(
      cutawayEffect(room('L-01', 'ceiling'), settings({ ceilingsHidden: false })),
    ).toBeUndefined();
  });

  it('cuts wall-class parts only while wall fade is on (the default)', () => {
    expect(DEFAULT_CUTAWAY.wallFade).toBe(true);
    for (const part of CUT_PARTS) {
      expect(cutawayEffect(room('E-01', part), DEFAULT_CUTAWAY)).toEqual({ cut: true });
      expect(cutawayEffect(edge('B27', part), settings({ wallFade: false }))).toBeUndefined();
    }
    for (const part of ['floor', 'catwalk', 'stairs', 'doorway', 'glow', 'machine'] as const) {
      expect(CUT_PARTS.has(part)).toBe(false);
      expect(cutawayEffect(room('E-01', part), DEFAULT_CUTAWAY)).toBeUndefined();
    }
  });
});

describe('levels and sections', () => {
  const levels = deckLevels(LAYOUT.map((t) => t.position[1]));

  it('finds the seven 7-NU deck levels of the layout, highest first', () => {
    expect(levels).toEqual([7, 0, -7, -14, -21, -28, -35]);
  });

  it('puts every placed room on at least one level', () => {
    for (const r of PLACED_ROOMS) {
      const b = bounds.get(r.id);
      if (!b) throw new Error(`no bounds for ${r.id}`);
      expect(
        levels.some((y) => onLevel(b, y)),
        r.id,
      ).toBe(true);
    }
    const level = (y: number) =>
      PLACED_ROOMS.filter((r) => onLevel(bounds.get(r.id) as never, y))
        .map((r) => r.id)
        .sort();
    // The ladder compartment hangs between the lower deck and level −14.
    expect(level(-14)).toEqual(['ARS-01', 'C-LAD', 'M-01', 'S-01']);
    expect(level(-28)).toEqual(['E-01', 'E-A', 'ENG-01', 'F-01']);
  });

  it('steps the section between stops one NU under each next floor', () => {
    const stops = sectionStops(levels);
    expect(stops).toEqual([13, 6, -1, -8, -15, -22, -29]);
    expect(lowerSection(null, stops)).toBe(13);
    expect(lowerSection(13, stops)).toBe(6);
    expect(lowerSection(-3, stops)).toBe(-8);
    expect(lowerSection(-29, stops)).toBe(-29);
    expect(raiseSection(-3, stops)).toBe(-1);
    expect(raiseSection(6, stops)).toBe(13);
    expect(raiseSection(13, stops)).toBeNull();
    expect(raiseSection(null, stops)).toBeNull();
  });
});

describe('isolation layer', () => {
  it('isolates a region and keeps the edges that leave it solid', () => {
    const iso = isolationSet(
      { kind: 'region', region: 'power-core' },
      ROOMS,
      V1_CONNECTIONS,
      bounds,
    );
    expect([...iso.rooms].sort()).toEqual(['E-01', 'E-A', 'E-V', 'ENG-01', 'F-01']);
    expect(iso.focus).toBeNull();
    for (const c of V1_CONNECTIONS) {
      expect(iso.connections.has(c.id), c.id).toBe(
        iso.rooms.has(c.from.room) || iso.rooms.has(c.to.room),
      );
    }
    // B28 (E-V–ENG-01) is inside; B37 leaves the core for M-02; B07 is elsewhere.
    expect(iso.connections.has('B28')).toBe(true);
    expect(iso.connections.has('B37')).toBe(true);
    expect(iso.connections.has('B07')).toBe(false);

    expect(isolationEffect(room('ENG-01', 'wall'), iso)).toBeUndefined();
    expect(isolationEffect(room('C-M', 'console'), iso)).toEqual({ ghost: GHOST_KEEP });
    expect(isolationEffect(edge('B37', 'wall'), iso)).toBeUndefined();
    expect(isolationEffect(edge('B07', 'wall'), iso)).toEqual({ ghost: GHOST_KEEP });
    expect(isolationEffect(room('C-M'), null)).toBeUndefined();
  });

  it('isolates a level', () => {
    const iso = isolationSet({ kind: 'level', y: 7 }, ROOMS, V1_CONNECTIONS, bounds);
    expect([...iso.rooms].sort()).toEqual(['C-U', 'C-XU', 'H-01', 'H-02', 'L-01']);
  });

  it('focus mode isolates the selection and cuts it open', () => {
    expect(isolationScope(settings({ focusMode: true }), 'ENG-01')).toEqual({
      kind: 'room',
      id: 'ENG-01',
    });
    const region = { kind: 'region', region: 'cultural' } as const;
    expect(isolationScope(settings({ isolation: region }), 'ENG-01')).toEqual(region);
    expect(isolationScope(settings({ focusMode: true }), null)).toBeNull();

    const iso = isolationSet({ kind: 'room', id: 'ENG-01' }, ROOMS, V1_CONNECTIONS, bounds);
    expect([...iso.rooms]).toEqual(['ENG-01']);
    expect(iso.focus).toBe('ENG-01');
    expect(isolationEffect(room('ENG-01', 'ceiling'), iso)).toEqual({ hidden: true });
    expect(isolationEffect(room('ENG-01', 'wall'), iso)).toEqual({ cut: true });
    expect(isolationEffect(room('ENG-01', 'machine'), iso)).toBeUndefined();
    expect(isolationEffect(room('E-V', 'wall'), iso)).toEqual({ ghost: GHOST_KEEP });
    expect(() => isolationSet({ kind: 'room', id: 'O-01' }, ROOMS, V1_CONNECTIONS, bounds)).toThrow(
      /Unknown room/,
    );
  });
});

describe('selection layer', () => {
  it('tints and reveals only the selected room', () => {
    expect(selectionEffect(room('L-01', 'stack'), 'L-01', null)).toEqual({
      tint: SELECTED_TINT,
      ghost: 1,
    });
    expect(selectionEffect(room('H-01'), 'L-01', null)).toBeUndefined();
    expect(selectionEffect(edge('L-01'), 'L-01', null)).toBeUndefined();
    expect(selectionEffect(room('L-01'), null, null)).toBeUndefined();
  });

  it('leaves the focused room in its own colours', () => {
    const iso = isolationSet({ kind: 'room', id: 'L-01' }, ROOMS, V1_CONNECTIONS, bounds);
    expect(selectionEffect(room('L-01', 'stack'), 'L-01', iso)).toBeUndefined();
  });
});

describe('settings', () => {
  it('compares settings by value', () => {
    expect(sameSettings(DEFAULT_CUTAWAY, { ...DEFAULT_CUTAWAY })).toBe(true);
    expect(sameSettings(DEFAULT_CUTAWAY, settings({ sectionY: -8 }))).toBe(false);
    expect(
      sameSettings(
        settings({ isolation: { kind: 'level', y: 7 } }),
        settings({ isolation: { kind: 'level', y: 7 } }),
      ),
    ).toBe(true);
    expect(
      sameSettings(
        settings({ isolation: { kind: 'level', y: 7 } }),
        settings({ isolation: { kind: 'region', region: 'cultural' } }),
      ),
    ).toBe(false);
  });
});
