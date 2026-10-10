import type { Era } from './types';

/** Era identifiers used by room records. The v1 stable snapshot is `pickwoad-2012-2017`. */
export const ERAS: readonly Era[] = [
  {
    id: 'pickwoad-2012-2017',
    label: 'Pickwoad console room (Series 7–10)',
    years: [2012, 2017],
    note: 'Architectural anchor for v1; Capaldi dressing changes are overlays on the same shell.',
  },
  {
    id: 'classic-1976-1977',
    label: 'Secondary wooden control room (Season 14)',
    years: [1976, 1977],
    note: 'The Masque of Mandragora onward.',
  },
  {
    id: 'classic-1978',
    label: 'The Invasion of Time interiors',
    years: [1978, 1978],
    note: 'Storerooms, workshop, pool, sickbay, art-gallery power unit.',
  },
  {
    id: 'classic-1980-1984',
    label: 'Fifth Doctor era interiors',
    years: [1980, 1984],
    note: 'Cloister Room (Logopolis), Zero Room (Castrovalva), companion bedrooms.',
  },
  {
    id: 'modern-2005-2010',
    label: 'Coral console room era',
    years: [2005, 2010],
    note: 'Wardrobe (The Christmas Invasion); coral room later archived (The Doctor’s Wife).',
  },
];

export const DEFAULT_ERA = 'pickwoad-2012-2017';
