# Handoff

Branch: `claude/tardis-isometric-v1`. Plan: `docs/EXECUTION-PLAN.md`. Rules: `AGENTS.md`.

## Completed

- **Ex1:** research package, typed topology/evidence data, graph utilities, tooling, and a room inventory page.
- **Ex2:** isometric Three.js prototype with orbit/pan/zoom, raycast selection, focus, info panel, region labels, a selectable room index, the `window.__tardis` test hook, Playwright (desktop + mobile), and GitHub Actions CI.
- **Ex3:** the shared world contracts (`StructureDescription`, mesh tagging), the structural kit, the Pickwoad console-room greybox built describe → build, and the spatial validator. The console nodes P-EX, C-M, C-U, C-L, C-XU, C-XL and C-LAD replace their boxes, and each is selectable on its own. The desktop `console-room` visual baseline exists.

## Architecture / decisions

- **Topology is separate from layout.** `src/data/rooms.ts` (37 §17 nodes) and `src/data/connections.ts` (B01–B37) carry **no positions**. World transforms live in `src/data/layout.ts`.
- **Layout (provisional).** `LAYOUT` holds one `RoomTransform {roomId, position (floor centre), size [W,H,D], placementBasis: 'design'}` per placed room, in NU.
  - Deck floors: `DECK_Y = {gallery: 7, main: 0, lower: -7}`. The cultural spine is at or above gallery level, maintenance floors are below the lower deck, and the power core is deepest. Volumes do not overlap.
  - The control-nexus boxes equal the AABBs of the console description's volumes (tested in `tests/world/console.test.ts`). Shell radius 21; P-EX and C-XU sit outside the shell at 0° (C-XU above P-EX), C-XL at 180°, and C-LAD under the lower deck on the axis.
  - Rationale per room: `research/layout-hypothesis.md`. Ex4 replaces the non-console values, not the code. `RoomTransform` has no rotation, so any landing outside a round shell must sit on an axis bearing (0/90/180/270°).
- **Placed v1 nodes (19):** P-EX, C-M, C-U, C-L, C-XU, C-XL, C-LAD, H-01, H-02, L-01, S-01, M-01, ARS-01, M-02, F-01, E-A, E-01, E-V, ENG-01. `V1_CONNECTIONS` = B01–B09, B16–B18, B22–B28, B37.
- **Portal handling.** B28 is the only portal (`portal: true`), and `buildGraph` excludes portals by default. ENG-01 is reachable in 5 edges via B37 (INF-E). B28 is drawn in violet.
- **Evidence.** Rooms carry separate axes (`axes.presence/appearance/scale`, plus `state` and `observedStates`). Connections carry `provenance`, `basis`, `state` and `observedStates`. Claims are `EvidenceRecord {grade, sourceIds, note}`. Grades are per claim; the axes are never blended into one score. The info panel lists each axis on its own row.
- **Grade usage.** Grade E is used only for speculative architecture (currently B37 and B36).
- **Inference metadata.** Any connection that is inferred or carries a D/E record must have `inference {reason, alternate, uncertainty, authoredBy, status}`.
- **Door anchors.** Each room has anchors (`id, label, level, observed, canonAzimuthDeg: null`). Every connection end names an existing anchor, and each anchor is used at most once. The reported but unconnected doors (`C-U.upper-door-2`, `C-L.lower-door-2`) are built **closed** and labeled "Reported, destination unknown". Authored bearings live only in description data (`AnchorPlacement.azimuthDeg`), never in rooms.ts.
- **Contract 1: describe → build (`src/world/structure.ts`).**
  - A room's `describe` step is a pure function that returns a `StructureDescription {id, units: 'normalized', roomIds, volumes, surfaces, anchors, paths, elements, labels}`. It contains no Three.js objects.
    - `Volume`: a room's air space, either `box {min, max}` or vertical `cylinder {center [x,z], radius, y0, y1}`. Volumes of different rooms may touch but never overlap.
    - `WalkableSurface {id, roomId, y, shapes}`: a level floor. Its footprint is the union of `annulus {center, inner, outer}` (inner 0 = disc) and `rect {min, max}` shapes, which must touch.
    - `AnchorPlacement {roomId, anchorId, surfaceId, position, azimuthDeg | null, state: open|closed}`: the world position of a rooms.ts `DoorAnchor`, which must stand on its named surface. Descriptions place exactly the topology anchors of their rooms (tested).
    - `PathSegment {id, connectionId, kind, portal, from, to, points}`: the walkable polyline of one topology edge. The first point is the `from` anchor and the last is the `to` anchor; `from`, `to`, `kind` and `portal` copy the connection data.
    - `StructureElement {tag, primitive, label?}`: what to draw. Primitives are pure kit data: `plate` (disc, annulus, sector or `sides`-gon prism about a vertical axis, used for floors, curved walls, the console and the rotor), `box`, `stairs`, `ladder`, `railing` (line or arc), `doorway` (rect or hex frame, optionally `closed`), `rib` (an (r, y) profile at an azimuth) and `ring` (divisions, spokes and spin).
    - Azimuth convention: degrees about +Y, 0° = +Z (the exterior doors), 90° = +X. The helpers are `azimuthVector` and `polar`.
  - The `build` step draws only what `elements` lists. `src/world/build.ts#buildStructure` returns `BuiltStructure {root, roomIds, connectionIds, roomParts, roomBounds, tick}`; `roomBounds` is the union of each room's volume AABBs. Kit builders are in `src/world/kit/index.ts`. `MaterialCache` gives one material per (tagged node, colour), so highlights never bleed between rooms. Plates and boxes get hard-edge outlines, which are not pickable.
  - `buildPrototypeScene(rooms, connections, layout, structures)` draws a structure's rooms and edges instead of boxes and connector bars; every other placed room is still a box.
- **Contract 2: mesh tagging.** Every world mesh has `userData: MeshTag {kind: 'room'|'connection', id, part, evidenceClass}`.
  - `part` is one of `MESH_PARTS` (`volume` and `connector` are the box view's stand-ins).
  - `evidenceClass` is `sourced|reconstructed|inferred|speculative`. It describes how the part's existence and form are known, never its dimensions (all dimensions are `normalized_authored`). Edge parts use `evidenceClassOfProvenance` (TV-S/TV-M/OFF/PROD → sourced, REC/EXP → reconstructed, INF-D → inferred, INF-E → speculative). Box rooms use `evidenceClassOfPresence`. Console parts choose explicitly in `describe.ts` (e.g. ribs, console and decks are sourced; walls, crown and railings inferred; closed doors and C-LAD reconstructed; landings inferred).
  - Picking raycasts only `kind: 'room'` meshes; stairs, doorways and connector bars do not block clicks. Selection, cutaway (Ex6), the overlay (Ex7) and routes must read this tag, never mesh names.
- **Spatial validator (`src/world/validate/`).** Pure functions on a description, each returning `ValidationIssue {rule, subject, message}[]`:
  - `checkAnchorsOnSurfaces` (`anchor-on-surface`);
  - `checkPathLandings` (`path-lands-on-surface`: both ends stand on some surface, which catches a midair stair);
  - `checkPathEndpoints` (`path-endpoint-is-anchor`: the ends equal the named anchors, which must exist and be open);
  - `checkVolumeOverlaps` (`volume-overlap`, exact box/cylinder tests where touching is allowed);
  - `checkWalkableReachability` (`walkable-unreachable`, BFS over surfaces linked by non-portal paths).
  - `validateStructure(d, startSurfaceId)` runs them all. Tolerance is `EPSILON_NU = 1e-3`.
- **Console room (`src/world/rooms/console/`).**
  - `params.ts`: `CONSOLE_PARAMS` (NU), plus a `CONSOLE_PARAM_NOTES` basis (verified/order/design) for every parameter.
  - `describe.ts`: `describeConsoleRoom()`, `CONSOLE_ROOM_IDS` and `CONSOLE_START_SURFACE = 'C-M.main-deck'`.
  - `build.ts`: `buildConsoleRoom()`, which spins the two rings in opposite directions.
  - Shape: 18 ribs at 10° + 20°k. Three decks: main is a radius-10 platform, the gallery an annulus from 17 to 21 at Y 7, and the lower deck a disc at Y −7 with a radius-1 hatch. A solid lower drum, the gallery wall, and a crown at Y 19. A hexagonal console, rotor column and two 18-segment rings.
  - Stairs: B02 at 120° and B03 at 240°. B01 bridge at 0° to P-EX. Open doors: B04 on the gallery at 0° to C-XU, and B05 (hex panel) on the lower deck at 180° to C-XL. B06 ladder from the hatch down to C-LAD. Closed doors on the gallery at 180° and the lower deck at 60°.
  - Proportions with rationale: `research/room-dossiers/console-room.md`.
- **Scene (`src/scene/`).**
  - `camera/isometric.ts`: pure camera math, unit-tested without WebGL. Isometric pitch is `atan(1/√2)` ≈ 35.264° and yaw 45°. `VIEW_HEIGHT_NU = 120` is the frustum height at zoom 1; it stays fixed on resize and the width follows the aspect. `framePose(bounds, aspect, margin, yaw?, pitch?)` serves reset, room focus (which keeps the current angles) and region focus (isometric angles). `lerpPose` drives the focus/reset tween, which is skipped under `prefers-reduced-motion`.
  - `topology.ts`: pure `roomBounds`, `walkPoint` (floor + 1 NU) and `connectorLegs` (X, then Z, then Y, contiguous and axis-aligned).
  - `prototypeScene.ts`: adds the built structures, then one box per remaining placed room (with an outline and a CSS2D room-ID label), connector boxes per remaining v1 edge, and CSS2D region labels. It exposes `roomParts` (room id → pickable meshes), `roomBounds`, `regionBounds`, `overview` and `tick`.
  - `viewer.ts`: the renderer, `OrthographicCamera` and three's `OrbitControls`.
    - Mouse: left-drag orbits, right-drag pans, wheel zooms.
    - Touch: one finger orbits, two fingers pinch and pan.
    - Pitch is clamped to 10°–85° and zoom to 0.4–12.
    - Rendering is on demand (dirty flag plus animation). Ambient motion (`world.tick`, the rotor rings) redraws at most every 66 ms. It is paused while a pointer is down or a camera tween runs, and fully under `prefers-reduced-motion`. Without the pause, SwiftShader gesture tests ran three times slower.
    - Tap vs drag: travel under 6 px and under 500 ms counts as a tap. A second tap on the same room within 400 ms counts as a double-tap and focuses it.
    - Empty space deselects.
- **Test hook (`src/scene/testHook.ts`).** Installed in dev builds, or in any build with `?test`. `window.__tardis` exposes:
  - `ready` (first frame rendered), `camera()` (`{target, position, zoom, yawDeg, pitchDeg}`) and `animating()`.
  - `screenPointOf(id)`: a client-space pixel where a real click hits that room first. It samples the room's projected footprint (its `roomBounds`), skips points covered by UI, and returns null if the room is fully occluded.
  - `roomAt(x, y)`, `selection()`, `visibleRooms()`, and `renderStats()` (`{frames, calls, triangles}` from `renderer.info`).
  - Actions: `select(id)`, `focusRoom(id)`, `focusRegion(region)`, `resetView()`.
  - Ex6 adds visibility layers and Ex7 adds route state. Extend this interface; don't fork it.
- **UI.**
  - `src/ui/roomIndex.ts`: each room is a `button[data-room-id][aria-pressed]` that calls `onSelect`, and `setIndexSelection` mirrors the canvas selection.
  - `src/ui/infoPanel.ts`: name, ID/region/tier, summary, the four axes (state includes observed states), appearances, and graded evidence records with resolved source links. Actions are Focus, Details and Close.
  - At ≤720 px the panel is a bottom sheet that opens collapsed (header only; Details expands it to ≤45% height), the room index starts closed, and the toolbar is one horizontally scrolling row. All buttons are at least 44 px.
  - CSS2D labels sit under the panels (z-index 1 vs 2). `.door-label` marks closed reported doors.
- **Sources.** `src/data/evidence.ts` holds 56 sources, mirrored in `research/sources.md` with the same IDs in the same order (enforced by a test). If the data changes, update the generated markdown in the same commit.
- **Tooling.**
  - TypeScript is pinned to `~6.0.3`, because typescript-eslint 8.71 doesn't support TS 7. `three@^0.186.1` and `@types/three@^0.186.0` are installed.
  - Vite splits three into `three-core` and `three-webgl` vendor chunks (`vite.config.ts`), keeping every chunk under the 500 kB warning.
  - Prettier ignores `docs/reference/**` and `docs/EXECUTION-PLAN.md`.
- **Playwright / Chromium.**
  - `@playwright/test` is pinned **exactly** to `1.56.1`, whose Chromium revision is 1194. That matches the preinstalled `/opt/pw-browsers/chromium-1194`, and `PLAYWRIGHT_BROWSERS_PATH` finds it with no `executablePath`. Bumping Playwright requires a matching browser, so never run `playwright install` in the cloud container.
  - Projects: `desktop` (Desktop Chrome, 1280×800) and `mobile` (iPhone 13 descriptor forced to Chromium: hasTouch, isMobile, 390×844).
  - Launch args: SwiftShader (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`).
  - webServer: `vite build && vite preview --port 4173`, reused locally.
  - Traces are retained on failure, with screenshots on failure.
  - Multi-touch gestures use CDP `Input.dispatchTouchEvent` (`e2e/helpers.ts#touchGesture`); Playwright's touchscreen only taps.
  - Visual baselines: `toHaveScreenshot` on the canvas with `stylePath: e2e/baseline.css` (hides labels and panels so fonts don't matter), `reducedMotion: 'reduce'` (rings at rest, instant focus), and `maxDiffPixelRatio: 0.01`. Snapshots live in `e2e/<spec>-snapshots/`, desktop and Linux only.
- **CI (`.github/workflows/ci.yml`).** On pushes to `main` and `claude/**` and on PRs: `npm ci` → lint → typecheck → unit → build → `npx playwright install --with-deps chromium` → e2e. On failure it uploads `playwright-report/` and `test-results/`.

## Important files

- `src/data/{types,rooms,connections,evidence,eras,layout}.ts`
- `src/systems/navigation/graph.ts` (`buildGraph`, `reachableFrom`, `shortestPath`)
- `src/scene/{viewer,prototypeScene,topology,testHook}.ts`, `src/scene/camera/isometric.ts`
- `src/world/structure.ts` (both contracts), `src/world/build.ts`, `src/world/kit/index.ts`, `src/world/validate/{geometry,index}.ts`, `src/world/rooms/console/{params,describe,build}.ts`
- `src/ui/{roomIndex,infoPanel}.ts`, `src/main.ts`, `index.html`, `src/style.css`
- `e2e/helpers.ts`, `e2e/{scene,selection,mobile,console}.spec.ts`, `e2e/baseline.css`, `e2e/console.spec.ts-snapshots/console-room-desktop-linux.png`, `playwright.config.ts`, `.github/workflows/ci.yml`
- `research/`: `sources.md`, `room-dossiers/*` (the console dossier carries the Ex3 proportions table), `connection-decisions.md`, `architecture-proposal.md`, `geometry-tasks.md` (all `blocked_access`), `layout-hypothesis.md`

## Validation

- **Unit:** `npm test` passes: 132 tests in 12 files.
  - New in Ex3: `tests/world/validate.test.ts` covers the geometry predicates, a valid fixture, and negative fixtures (midair stair, overlapping volumes, dangling/short/closed-anchor path, anchor off its surface, a portal-only surface left unreachable).
  - `tests/world/console.test.ts` covers the description invariants: the validator passes, deck order, 18 ribs, hex console, two contra-rotating 18-division rings, stair landings and differing directions, the bridge at 0°, door anchors on the shell, C-XL ≠ C-LAD, closed labeled doors with reported = 4 and verified = null, exact topology anchors, one path per in-console edge, layout = volume AABBs, valid tags, a note per parameter, and NU only (no metric units in `src/world`).
  - `tests/world/consoleBuild.test.ts` (happy-dom) checks that every mesh carries the full tag, every node has its own meshes, materials are not shared across rooms, the rings counter-rotate, the door labels exist, boxes and bars are replaced in the scene, and only described parts are built.
  - `npm run typecheck`, `npm run lint`, `npm run build` (no warnings) and `npx prettier --check .` pass.
- **E2E:** `npm run test:e2e` passes: 25 passed, 3 skipped (J8 is touch-only so it skips on desktop; the baseline is desktop-only so it skips on mobile).
  - J1–J4 and J8 as in Ex2.
  - New `e2e/console.spec.ts`: C-U, C-L and C-M are selected through real canvas clicks/taps at hook coordinates; two `.door-label`s; frames advance with motion, and frames stop under reduced motion; the `console-room` baseline (desktop, framed by `focusRegion('control-nexus')`).
- **Visual baselines:** `console-room` (desktop) was generated in this session in the cloud container (Chromium 1194 + SwiftShader). The overview, library and power-core baselines come later (Ex4, Ex5).
- **CI:** not observed running from this session (no GitHub Actions access here). If CI's Chromium renders the baseline differently beyond the 1% tolerance, regenerate it on Linux only, with authorization.

## Known incomplete work

- Outside the control nexus the view is still boxes and orthogonal connector bars: no corridor kit, cutaway, overlays, routes or materials (Ex4+). B07 and B16 are still crude bars that start at the C-XU/C-XL landing centres, not at their `corridor-side` anchors (Ex4 builds those corridors to the anchors).
- **C-LAD** sits under the lower deck, so it is occluded in every above-horizon view and `screenPointOf('C-LAD')` returns null. It is selectable from the room index. In the default overview every other console node has a pickable pixel (checked: P-EX, C-M, C-U, C-L, C-XU and C-XL). Cutaway (Ex6) or the Ex4 layout must expose C-LAD, because Ex4's E2E requires every placed room to be selectable from the overview.
- The `console-room` baseline frames the control-nexus region, so neighbouring boxes appear at its edges. If Ex4 moves them, the baseline changes and must be regenerated in that execution (authorize it in Ex4's run).
- The spatial validator runs on the console description only. The rest of the map has no descriptions yet. Cross-description checks (merging descriptions, connecting B07/B16 paths to the landing anchors) belong to Ex4.
- Region labels for the maintenance spine and power core can overlap in the overview (progressive labels are Ex7).
- Draw calls are about 300 in the overview (the console is unmerged kit meshes). Instancing and merging are Ex8 performance work.

## Next execution

- **Ex4** (connected Tier-1 corridor skeleton, Max).
  - Write descriptions for the corridors and remaining rooms with the same contracts. Build B07 from `C-XU.corridor-side` and B16 from `C-XL.corridor-side`.
  - Run `validateStructure` over the whole map with portals disabled. The mesh walk must reach ENG-01 via B37.
  - Replace the non-console `LAYOUT` values, keeping the console boxes equal to the description.
  - Add the overview baseline. Expose C-LAD and C-XL in the overview, or record how cutaway will.
