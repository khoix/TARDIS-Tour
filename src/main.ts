import { V1_CONNECTIONS } from './data/connections';
import { LAYOUT } from './data/layout';
import { getRoom, ROOMS } from './data/rooms';
import { buildPrototypeScene } from './scene/prototypeScene';
import { installTestHook, testHookEnabled } from './scene/testHook';
import { createViewer } from './scene/viewer';
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

const viewer = createViewer(viewport, buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT));
const compact = window.matchMedia('(max-width: 720px)');

function setIndexOpen(open: boolean) {
  indexContainer.hidden = !open;
  toggleIndex.setAttribute('aria-expanded', String(open));
}
setIndexOpen(!compact.matches);
toggleIndex.addEventListener('click', () =>
  setIndexOpen(toggleIndex.getAttribute('aria-expanded') !== 'true'),
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
