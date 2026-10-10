import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONNECTIONS, V1_CONNECTIONS } from '../../src/data/connections';
import { ERAS } from '../../src/data/eras';
import { SOURCES, getSource } from '../../src/data/evidence';
import { ROOMS, getRoom } from '../../src/data/rooms';
import {
  ANCHOR_LEVELS,
  APPEARANCE_VALUES,
  CONNECTION_BASIS_VALUES,
  EDGE_KINDS,
  GRADES,
  PRESENCE_VALUES,
  PROVENANCE_CODES,
  REGIONS,
  SCALE_VALUES,
  STATE_VALUES,
  TIERS,
  type EvidenceRecord,
} from '../../src/data/types';

const allEvidence: EvidenceRecord[] = [
  ...ROOMS.flatMap((r) => r.evidence),
  ...CONNECTIONS.flatMap((c) => c.evidence),
];

function includes<T>(values: readonly T[], value: T): boolean {
  return values.includes(value);
}

describe('room register', () => {
  it('has unique, well-formed IDs', () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Z]+(-[A-Z0-9]+)+$/);
  });

  it('matches the 37-node §17.1 register', () => {
    expect(ROOMS).toHaveLength(37);
  });

  it('uses only controlled vocabulary', () => {
    const eraIds = new Set(ERAS.map((e) => e.id));
    for (const r of ROOMS) {
      expect(includes(TIERS, r.tier), r.id).toBe(true);
      expect(includes(REGIONS, r.region), r.id).toBe(true);
      expect(includes(STATE_VALUES, r.state), r.id).toBe(true);
      for (const s of r.observedStates) expect(includes(STATE_VALUES, s), r.id).toBe(true);
      expect(includes(PRESENCE_VALUES, r.axes.presence), r.id).toBe(true);
      expect(includes(APPEARANCE_VALUES, r.axes.appearance), r.id).toBe(true);
      expect(includes(SCALE_VALUES, r.axes.scale), r.id).toBe(true);
      for (const era of r.eras) expect(eraIds.has(era), `${r.id} era ${era}`).toBe(true);
      for (const a of r.anchors)
        expect(includes(ANCHOR_LEVELS, a.level), `${r.id}.${a.id}`).toBe(true);
    }
  });

  it('has unique anchor IDs within each room and no surveyed bearings', () => {
    for (const r of ROOMS) {
      const ids = r.anchors.map((a) => a.id);
      expect(new Set(ids).size, r.id).toBe(ids.length);
      for (const a of r.anchors) expect(a.canonAzimuthDeg, `${r.id}.${a.id}`).toBeNull();
    }
  });

  it('gives every room at least one evidence record', () => {
    for (const r of ROOMS) expect(r.evidence.length, r.id).toBeGreaterThan(0);
  });

  it('places exactly the v1 Tier-1 nodes', () => {
    const placed = ROOMS.filter((r) => r.placed).map((r) => r.id);
    expect(placed).toEqual([
      'P-EX',
      'C-M',
      'C-U',
      'C-L',
      'C-XU',
      'C-XL',
      'C-LAD',
      'H-01',
      'H-02',
      'L-01',
      'S-01',
      'M-01',
      'ARS-01',
      'M-02',
      'F-01',
      'E-A',
      'E-01',
      'E-V',
      'ENG-01',
    ]);
    for (const r of ROOMS.filter((x) => x.placed)) expect(r.tier, r.id).toBe(1);
  });

  it('keeps reservations and jettisoned/deleted rooms out of the stable snapshot', () => {
    for (const id of ['X-01', 'X-02', 'X-03']) expect(getRoom(id)?.placed).toBe(false);
    for (const r of ROOMS.filter((x) => x.placed)) {
      expect(['jettisoned', 'deleted'].includes(r.state), r.id).toBe(false);
    }
  });

  it('uses normalized or unknown scale only (no metric claims)', () => {
    for (const r of ROOMS) {
      expect(['normalized_authored', 'unknown'].includes(r.axes.scale), r.id).toBe(true);
    }
    for (const r of ROOMS.filter((x) => x.placed)) expect(r.axes.scale).toBe('normalized_authored');
  });
});

describe('connection register', () => {
  it('has unique IDs B01–B37', () => {
    const ids = CONNECTIONS.map((c) => c.id).sort();
    expect(ids).toEqual(Array.from({ length: 37 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`));
  });

  it('references existing rooms and door anchors on both ends', () => {
    for (const c of CONNECTIONS) {
      for (const end of [c.from, c.to]) {
        const room = getRoom(end.room);
        expect(room, `${c.id} → ${end.room}`).toBeDefined();
        expect(
          room?.anchors.some((a) => a.id === end.anchor),
          `${c.id} → ${end.room}.${end.anchor}`,
        ).toBe(true);
      }
    }
  });

  it('uses each door anchor for at most one connection', () => {
    const used = new Map<string, string>();
    for (const c of CONNECTIONS) {
      for (const end of [c.from, c.to]) {
        const key = `${end.room}.${end.anchor}`;
        expect(used.get(key), `${key} reused by ${c.id}`).toBeUndefined();
        used.set(key, c.id);
      }
    }
  });

  it('uses only controlled vocabulary', () => {
    for (const c of CONNECTIONS) {
      expect(includes(EDGE_KINDS, c.kind), c.id).toBe(true);
      expect(includes(PROVENANCE_CODES, c.provenance), c.id).toBe(true);
      expect(includes(CONNECTION_BASIS_VALUES, c.basis), c.id).toBe(true);
      expect(includes(STATE_VALUES, c.state), c.id).toBe(true);
      for (const s of c.observedStates) expect(includes(STATE_VALUES, s), c.id).toBe(true);
    }
  });

  it('marks portals consistently and only B28 is a portal', () => {
    for (const c of CONNECTIONS) {
      expect(c.portal, c.id).toBe(c.basis === 'portal');
      expect(c.portal, c.id).toBe(c.kind === 'vestibule_portal');
    }
    expect(CONNECTIONS.filter((c) => c.portal).map((c) => c.id)).toEqual(['B28']);
  });

  it('builds exactly the planned v1 edges, all between placed rooms', () => {
    expect(V1_CONNECTIONS.map((c) => c.id).sort()).toEqual([
      'B01',
      'B02',
      'B03',
      'B04',
      'B05',
      'B06',
      'B07',
      'B08',
      'B09',
      'B16',
      'B17',
      'B18',
      'B22',
      'B23',
      'B24',
      'B25',
      'B26',
      'B27',
      'B28',
      'B37',
    ]);
    for (const c of V1_CONNECTIONS) {
      expect(getRoom(c.from.room)?.placed, c.id).toBe(true);
      expect(getRoom(c.to.room)?.placed, c.id).toBe(true);
    }
  });

  it('requires inference metadata for every inferred or D/E-graded edge', () => {
    for (const c of CONNECTIONS) {
      const needs =
        c.provenance === 'INF-D' ||
        c.provenance === 'INF-E' ||
        c.basis === 'inferred' ||
        c.evidence.some((e) => e.grade === 'D' || e.grade === 'E');
      if (!needs) continue;
      expect(c.inference, c.id).toBeDefined();
      expect(c.inference?.reason.length, c.id).toBeGreaterThan(0);
      expect(c.inference?.uncertainty.length, c.id).toBeGreaterThan(0);
      expect(c.inference?.authoredBy.length, c.id).toBeGreaterThan(0);
    }
  });

  it('labels the engine bypass B37 as speculative, never as TV evidence', () => {
    const b37 = CONNECTIONS.find((c) => c.id === 'B37');
    expect(b37?.provenance).toBe('INF-E');
    expect(b37?.evidence.every((e) => e.grade === 'E')).toBe(true);
    expect(b37?.portal).toBe(false);
  });
});

describe('evidence and sources', () => {
  it('uses valid grades', () => {
    for (const e of allEvidence) expect(includes(GRADES, e.grade)).toBe(true);
  });

  it('cites only registered sources, and A–C claims cite at least one', () => {
    for (const e of allEvidence) {
      for (const id of e.sourceIds) expect(getSource(id), `unknown source ${id}`).toBeDefined();
      if (e.grade === 'A' || e.grade === 'B' || e.grade === 'C') {
        expect(e.sourceIds.length, e.note).toBeGreaterThan(0);
      }
    }
  });

  it('has unique source IDs and aliases', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const aliases = SOURCES.flatMap((s) => s.aliases);
    expect(new Set(aliases).size).toBe(aliases.length);
    for (const s of SOURCES) {
      expect(s.urls.length, s.id).toBeGreaterThan(0);
      for (const url of s.urls) expect(url, s.id).toMatch(/^https:\/\//);
    }
  });

  it('keeps research/sources.md in sync with the registry', () => {
    const md = readFileSync(new URL('../../research/sources.md', import.meta.url), 'utf8');
    const mdIds = [...md.matchAll(/^### (S\d{2})\b/gm)].map((m) => m[1]);
    expect(mdIds).toEqual(SOURCES.map((s) => s.id));
  });

  it('contains no metric units in topology data', () => {
    // evidence.ts is excluded: source descriptions legitimately quote lens/other-era figures.
    const files = ['rooms.ts', 'connections.ts', 'eras.ts', 'layout.ts', 'paths.ts'];
    for (const f of files) {
      const text = readFileSync(new URL(`../../src/data/${f}`, import.meta.url), 'utf8');
      expect(text, f).not.toMatch(/\b\d+(\.\d+)?\s?(m|cm|mm|metres?|meters?)\b/);
      expect(text, f).not.toMatch(/_m\b|units:\s*['"]m/);
    }
  });
});
