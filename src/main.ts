import { CONNECTIONS, V1_CONNECTIONS } from './data/connections';
import { LAYOUT } from './data/layout';
import { getRoom, PLACED_ROOMS, ROOMS } from './data/rooms';
import { buildPrototypeScene } from './scene/prototypeScene';
import { installTestHook, testHookEnabled } from './scene/testHook';
import { createViewer } from './scene/viewer';
import { LabelSystem } from './systems/labels/labels';
import { createRouteLine, routeLayer } from './systems/navigation/routeView';
import { CONSOLE_ROOM_ID, planRoute, type Route } from './systems/navigation/routes';
import { overlayLayer } from './systems/research/overlay';
import { VisualState } from './systems/visibility/manager';
import { buildConsoleRoom } from './world/rooms/console/build';
import { buildSkeleton } from './world/skeleton';
import { renderCutawayPanel } from './ui/cutawayPanel';
import { renderInfoPanel } from './ui/infoPanel';
import { DEFAULT_RESEARCH, renderResearchPanel, type ResearchSettings } from './ui/researchPanel';
import { groupPlacedRooms, renderRoomIndex, setIndexSelection } from './ui/roomIndex';
import { EMPTY_ROUTE_QUERY, renderRoutePanel, type RouteQuery } from './ui/routePanel';
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
const researchContainer = required<HTMLElement>('#research-panel');
const toggleResearch = required<HTMLButtonElement>('#toggle-research');
const routeContainer = required<HTMLElement>('#route-panel');
const toggleRoute = required<HTMLButtonElement>('#toggle-route');

const world = buildPrototypeScene(ROOMS, V1_CONNECTIONS, LAYOUT, [
  buildConsoleRoom(),
  buildSkeleton(),
]);
const visual = new VisualState(world, ROOMS, V1_CONNECTIONS);
const viewer = createViewer(viewport, world, visual);
const compact = window.matchMedia('(max-width: 720px)');

// Edge and anchor labels (structure and research modes) join the world and the visual state.
const labels = new LabelSystem(viewer.labelLayer, ROOMS, V1_CONNECTIONS);
const extraLabels = labels.createLabels(world);
world.root.add(extraLabels);
visual.register(extraLabels);
labels.register(world.root);
const routeLine = createRouteLine();
world.root.add(routeLine.root);

interface Toggled {
  readonly container: HTMLElement;
  readonly toggle: HTMLButtonElement;
}
// Cutaway, research and route panels share the top-centre slot: one at a time. On narrow
// screens the room index joins them, since every top panel spans the width there.
const cutawaySlot: Toggled = { container: cutawayContainer, toggle: toggleCutaway };
const researchSlot: Toggled = { container: researchContainer, toggle: toggleResearch };
const routeSlot: Toggled = { container: routeContainer, toggle: toggleRoute };
const topPanels: readonly Toggled[] = [cutawaySlot, researchSlot, routeSlot];
const indexPanel: Toggled = { container: indexContainer, toggle: toggleIndex };

function setOpen(panel: Toggled, open: boolean) {
  panel.container.hidden = !open;
  panel.toggle.setAttribute('aria-expanded', String(open));
  if (!open) return;
  const others = panel === indexPanel ? [] : topPanels.filter((p) => p !== panel);
  if (compact.matches) others.push(...(panel === indexPanel ? topPanels : [indexPanel]));
  for (const other of others) {
    if (!other.container.hidden) setOpen(other, false);
  }
}
setOpen(indexPanel, !compact.matches);
for (const panel of topPanels) setOpen(panel, false);
for (const panel of [indexPanel, ...topPanels]) {
  panel.toggle.addEventListener('click', () =>
    setOpen(panel, panel.toggle.getAttribute('aria-expanded') !== 'true'),
  );
}

const indexNav = renderRoomIndex(indexContainer, ROOMS, (id) => {
  viewer.select(id);
  if (compact.matches) setOpen(indexPanel, false);
});

// Routes: walk-line Dijkstra over the stable graph; the route layer tints the walked edges.
let routeQuery: RouteQuery = EMPTY_ROUTE_QUERY;
let route: Route | null = null;
const placedIds = PLACED_ROOMS.map((r) => r.id);
const routePanel = renderRoutePanel(routeContainer, ROOMS, {
  onChange: (patch) => updateRoute(patch),
  onClear: () => updateRoute(EMPTY_ROUTE_QUERY),
});
function updateRoute(patch: Partial<RouteQuery>) {
  routeQuery = { ...routeQuery, ...patch };
  const { from, to, allowPortal } = routeQuery;
  route =
    from !== null && to !== null
      ? planRoute(from, to, placedIds, V1_CONNECTIONS, world.walkLines, { allowPortal })
      : null;
  routeLine.show(route);
  labels.setRoute(route);
  visual.setLayer('route', route && route.steps.length > 0 ? routeLayer(route) : null);
  routePanel.sync(routeQuery, route);
}
updateRoute({});

let research: ResearchSettings = DEFAULT_RESEARCH;
const researchPanel = renderResearchPanel(researchContainer, {
  onChange: (patch) => updateResearch(patch),
});
function updateResearch(patch: Partial<ResearchSettings>) {
  research = { ...research, ...patch };
  if (patch.overlay !== undefined)
    visual.setLayer('overlay', research.overlay ? overlayLayer : null);
  labels.setMode(research.labelMode);
  researchPanel.sync(research);
}
updateResearch({});

viewer.onSelectionChange((id) => {
  setIndexSelection(indexNav, id);
  labels.setSelection(id);
  renderInfoPanel(
    infoPanel,
    id === null ? null : (getRoom(id) ?? null),
    {
      onFocus: (roomId) => viewer.focusRoom(roomId),
      onClose: () => viewer.select(null),
      onRouteToConsole: (roomId) => {
        updateRoute({ from: roomId, to: CONSOLE_ROOM_ID });
        setOpen(routeSlot, true);
      },
    },
    CONNECTIONS,
  );
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
visual.onChange(() => routeLine.setSection(visual.settings().sectionY));
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

if (testHookEnabled(window.location.search, import.meta.env.DEV)) {
  installTestHook(viewer, { route: () => route, research: () => research });
}

// Hero detail loads in its own chunk once the greybox shells have given a usable first view.
void viewer
  .firstFrame()
  .then(() => import('./world/rooms/hero/heroRooms'))
  .then(({ buildHeroRooms }) => {
    const hero = buildHeroRooms();
    viewer.addDressing(hero);
    labels.register(hero.root);
  });
