/**
 * Research overlay (Execution 7): colours every world mesh by how its existence and form are
 * known (`MeshTag.evidenceClass`), with the portal in a colour of its own. It is the visual
 * state's `overlay` layer, so cutaway, isolation, routes and the selection still apply on top.
 */

import type { LayerFn } from '../visibility/state';
import { GLOW_INTENSITY } from '../../world/kit';
import { type EvidenceClass, EVIDENCE_CLASSES, GLOW_PARTS } from '../../world/structure';

export const EVIDENCE_COLORS: Readonly<Record<EvidenceClass, number>> = {
  sourced: 0x3fae6a,
  reconstructed: 0x3f7fd0,
  inferred: 0xd8b13a,
  speculative: 0xd0453f,
};

/** The B28 portal is a non-Euclidean transition, not a grade of evidence: shown apart. */
export const PORTAL_OVERLAY_COLOR = 0xb455e0;

export const EVIDENCE_CLASS_LABELS: Readonly<Record<EvidenceClass, string>> = {
  sourced: 'Sourced',
  reconstructed: 'Reconstructed',
  inferred: 'Inferred',
  speculative: 'Speculative',
};

export const EVIDENCE_CLASS_NOTES: Readonly<Record<EvidenceClass, string>> = {
  sourced: 'Seen or stated on screen, or in official or production material',
  reconstructed: 'Rebuilt from secondary reconstruction or expanded sources',
  inferred: 'Structural inference for continuity',
  speculative: 'Authored design, not evidenced',
};

export interface LegendEntry {
  readonly key: EvidenceClass | 'portal';
  readonly label: string;
  readonly note: string;
  readonly color: number;
}

export const LEGEND: readonly LegendEntry[] = [
  ...EVIDENCE_CLASSES.map((c) => ({
    key: c,
    label: EVIDENCE_CLASS_LABELS[c],
    note: EVIDENCE_CLASS_NOTES[c],
    color: EVIDENCE_COLORS[c],
  })),
  {
    key: 'portal',
    label: 'Portal',
    note: 'Non-Euclidean transition, never walked',
    color: PORTAL_OVERLAY_COLOR,
  },
];

/** `#rrggbb` form of a colour, for the legend swatches. */
export function cssColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/** The overlay layer: base colour by evidence class; self-lit parts glow in it too. */
export const overlayLayer: LayerFn = (tag) => {
  const color = tag.part === 'portal' ? PORTAL_OVERLAY_COLOR : EVIDENCE_COLORS[tag.evidenceClass];
  return GLOW_PARTS.has(tag.part)
    ? { color, tint: { color, intensity: GLOW_INTENSITY } }
    : { color };
};
