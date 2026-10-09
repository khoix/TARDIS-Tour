import { V1_CONNECTIONS } from './data/connections';
import { LAYOUT } from './data/layout';
import { getRoom, ROOMS } from './data/rooms';
import { buildPrototypeScene } from './scene/prototypeScene';
import { installTestHook, testHookEnabled } from './scene/testHook';
import { createViewer } from './scene/viewer';
import { VisualState } from './systems/visibility/manager';
import { buildConsoleRoom } from './world/rooms/console/build';
import { buildSkeleton } from './world/skeleton';
import { renderCutawayPanel } from './ui/cutawayPanel';
import { renderInfoPanel } from './ui/infoPanel';
import { groupPlacedRooms, renderRoomIndex, setIndexSelection } from './ui/roomIndex';
import './style.css';

function required<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  return el;
}

const viewport = required<HTMLElement>('#viewport');
const indexContainer = required<HTMLElement>('#room-index');
const infoPanel = required<HTMLElement>('#info-panel');
const regionButtons = required<HTMLElement>('#region-buttons');
const toggleIndex = required<HTMLButtonElement>('#toggle-index');
const cutawayContainer = required<HTMLElement>('#cutaway-panel');
const toggleCutaway = required<HTMLButtonElement>('#toggle-cutaway');

const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
  buildConsoleRoom(),
  buildSkeleton(),
]);
const visual = new VisualState(world, ROOMS, V1_CONNECTIONS);
const viewer = createViewer(viewport, world, visual);
const compact = window.matchMedia('(max-width: 720px)');

function setIndexOpen(open: boolean) {
  indexContainer.hidden = !open;
  toggleIndex.setAttribute('aria-expanded', String(open));
  // On narrow screens the two top panels would overlap: one at a time.
  if (open && compact.matches) setCutawayOpen(false);
}
function setCutawayOpen(open: boolean) {
  cutawayContainer.hidden = !open;
  toggleCutaway.setAttribute('aria-expanded', String(open));
  if (open && compact.matches) setIndexOpen(false);
}
setIndexOpen(!compact.matches);
setCutawayOpen(false);
toggleIndex.addEventListener('click', () =>
  setIndexOpen(toggleIndex.getAttribute('aria-expanded') !== 'true'),
);
toggleCutaway.addEventListener('click', () =>
  setCutawayOpen(toggleCutaway.getAttribute('aria-expanded') !== 'true'),
);

const indexNav = renderRoomIndex(indexContainer, ROOMS, (id) => {
  viewer.select(id);
  if (compact.matches) setIndexOpen(false);
});

viewer.onSelectionChange((id) => {
  setIndexSelection(indexNav, id);
  renderInfoPanel(infoPanel, id === null ? null : (getRoom(id) ?? null), {
    onFocus: (roomId) => viewer.focusRoom(roomId),
    onClose: () => viewer.select(null),
  });
});

const cutaway = renderCutawayPanel(
  cutawayContainer,
  {
    regions: groupPlacedRooms(ROOMS).map((g) => g.region),
    levels: visual.levels,
    sectionRange: visual.sectionRange,
    sectionStops: visual.sectionStops,
  },
  {
    onChange: (patch) => {
      visual.update(patch);
      // Entering focus mode also frames the room it cuts open.
      const id = viewer.selection();
      if (patch.focusMode && id !== null) viewer.focusRoom(id);
    },
    onReset: () => visual.reset(),
  },
);
const syncCutaway = () => cutaway.sync(visual.settings(), viewer.selection() !== null);
visual.onChange(syncCutaway);
syncCutaway();

for (const group of groupPlacedRooms(ROOMS)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.region = group.region;
  button.textContent = group.label;
  button.addEventListener('click', () => viewer.focusRegion(group.region));
  regionButtons.append(button);
}

required<HTMLButtonElement>('#home-view').addEventListener('click', () => viewer.resetView());

if (testHookEnabled(window.location.search, import.meta.env.DEV)) installTestHook(viewer);

// Hero detail loads in its own chunk once the greybox shells have given a usable first view.
void viewer
  .firstFrame()
  .then(() => import('./world/rooms/hero/heroRooms'))
  .then(({ buildHeroRooms }) => viewer.addDressing(buildHeroRooms()));
