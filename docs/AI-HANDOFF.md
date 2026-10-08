# Handoff

Branch: `claude/tardis-isometric-v1`. Plan: `docs/EXECUTION-PLAN.md`. Rules: `AGENTS.md`.

## Completed

- **Ex1:** research package, typed topology/evidence data, graph utilities, tooling, and a room inventory page.
- **Ex2:** isometric Three.js prototype with orbit/pan/zoom, raycast selection, focus, info panel, region labels, a selectable room index, the `window.__tardis` test hook, Playwright (desktop + mobile), and GitHub Actions CI.

## Architecture / decisions

- **Topology is separate from layout.** `src/data/rooms.ts` (37 §17 nodes) and `src/data/connections.ts` (B01–B37) carry **no positions**. World transforms live in `src/data/layout.ts`.
- **Layout (Ex2, provisional).** `LAYOUT` holds one `RoomTransform {roomId, position (floor centre), size [W,H,D], placementBasis: 'design'}` per placed room, in NU.
  - Deck floors: `DECK_Y = {gallery: 7, main: 0, lower: -7}`. The cultural spine is at or above gallery level, maintenance floors are below the lower deck, and the power core is deepest. Volumes do not overlap.
  - Rationale per room: `research/layout-hypothesis.md`. Ex4 replaces the values, not the code.
- **Placed v1 nodes (19):** P-EX, C-M, C-U, C-L, C-XU, C-XL, C-LAD, H-01, H-02, L-01, S-01, M-01, ARS-01, M-02, F-01, E-A, E-01, E-V, ENG-01. `V1_CONNECTIONS` = B01–B09, B16–B18, B22–B28, B37.
- **Portal handling.** B28 is the only portal (`portal: true`), and `buildGraph` excludes portals by default. ENG-01 is reachable in 5 edges via B37 (INF-E). B28 is drawn in violet.
- **Evidence.** Rooms carry separate axes (`axes.presence/appearance/scale`, plus `state` and `observedStates`). Connections carry `provenance`, `basis`, `state` and `observedStates`. Claims are `EvidenceRecord {grade, sourceIds, note}`. Grades are per claim; the axes are never blended into one score. The info panel lists each axis on its own row.
- **Grade usage.** Grade E is used only for speculative architecture (currently B37 and B36).
- **Inference metadata.** Any connection that is inferred or carries a D/E record must have `inference {reason, alternate, uncertainty, authoredBy, status}`.
- **Door anchors.** Each room has anchors (`id, label, level, observed, canonAzimuthDeg: null`). Every connection end names an existing anchor, and each anchor is used at most once. Reported but unconnected doors (`C-U.upper-door-2`, `C-L.lower-door-2`) should be built **closed** in Ex3.
- **Scene (`src/scene/`).**
  - `camera/isometric.ts`: pure camera math, unit-tested without WebGL. Isometric pitch is `atan(1/√2)` ≈ 35.264° and yaw 45°. `VIEW_HEIGHT_NU = 120` is the frustum height at zoom 1; it stays fixed on resize and the width follows the aspect. `framePose(bounds, aspect, margin, yaw?, pitch?)` serves reset, room focus (which keeps the current angles) and region focus (isometric angles). `lerpPose` drives the focus/reset tween, which is skipped under `prefers-reduced-motion`.
  - `topology.ts`: pure `roomBounds`, `walkPoint` (floor + 1 NU) and `connectorLegs` (X, then Z, then Y, contiguous and axis-aligned).
  - `prototypeScene.ts`: builds one box per placed room with an outline and a CSS2D room-ID label, connector boxes per v1 edge, and CSS2D region labels. Mesh `userData` is currently `{kind: 'room' | 'connection', id}`; Ex3 formalizes the full `{kind, id, part, evidenceClass}` tagging contract. Only room meshes are pickable.
  - `viewer.ts`: the renderer, `OrthographicCamera` and three's `OrbitControls`.
    - Mouse: left-drag orbits, right-drag pans, wheel zooms.
    - Touch: one finger orbits, two fingers pinch and pan.
    - Pitch is clamped to 10°–85° and zoom to 0.4–12.
    - Rendering is on demand (dirty flag plus animation).
    - Tap vs drag: travel under 6 px and under 500 ms counts as a tap. A second tap on the same room within 400 ms counts as a double-tap and focuses it.
    - Empty space deselects.
- **Test hook (`src/scene/testHook.ts`).** Installed in dev builds, or in any build with `?test`. `window.__tardis` exposes:
  - `ready` (first frame rendered), `camera()` (`{target, position, zoom, yawDeg, pitchDeg}`) and `animating()`.
  - `screenPointOf(id)`: a client-space pixel where a real click hits that room first. It samples the room's projected footprint, skips points covered by UI, and returns null if the room is fully occluded.
  - `roomAt(x, y)`, `selection()`, `visibleRooms()`, and `renderStats()` (`{frames, calls, triangles}` from `renderer.info`).
  - Actions: `select(id)`, `focusRoom(id)`, `focusRegion(region)`, `resetView()`.
  - Ex6 adds visibility layers and Ex7 adds route state. Extend this interface; don't fork it.
- **UI.**
  - `src/ui/roomIndex.ts`: each room is a `button[data-room-id][aria-pressed]` that calls `onSelect`, and `setIndexSelection` mirrors the canvas selection.
  - `src/ui/infoPanel.ts`: name, ID/region/tier, summary, the four axes (state includes observed states), appearances, and graded evidence records with resolved source links. Actions are Focus, Details and Close.
  - At ≤720 px the panel is a bottom sheet that opens collapsed (header only; Details expands it to ≤45% height), the room index starts closed, and the toolbar is one horizontally scrolling row. All buttons are at least 44 px.
  - CSS2D labels sit under the panels (z-index 1 vs 2).
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
- **CI (`.github/workflows/ci.yml`).** On pushes to `main` and `claude/**` and on PRs: `npm ci` → lint → typecheck → unit → build → `npx playwright install --with-deps chromium` → e2e. On failure it uploads `playwright-report/` and `test-results/`.

## Important files

- `src/data/{types,rooms,connections,evidence,eras,layout}.ts`
- `src/systems/navigation/graph.ts` (`buildGraph`, `reachableFrom`, `shortestPath`)
- `src/scene/{viewer,prototypeScene,topology,testHook}.ts`, `src/scene/camera/isometric.ts`
- `src/ui/{roomIndex,infoPanel}.ts`, `src/main.ts`, `index.html`, `src/style.css`
- `e2e/helpers.ts`, `e2e/{scene,selection,mobile}.spec.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`
- `research/`: `sources.md`, `room-dossiers/*`, `connection-decisions.md`, `architecture-proposal.md`, `geometry-tasks.md` (all `blocked_access`), `layout-hypothesis.md` (new in Ex2)

## Validation

- **Unit:** `npm test` passes: 102 tests in 9 files. They cover data integrity (now including the no-metric check on `layout.ts`), the graph, connectivity, layout coverage and vertical order, camera math, connector legs, hook gating, the room index and the info panel. `npm run typecheck`, `npm run lint`, `npm run build` (no warnings) and `npx prettier --check .` pass.
- **E2E:** `npm run test:e2e` passes: 18 passed, 2 skipped (J8 is touch-only, so it skips on desktop).
  - J1: loads, all 19 rooms visible, no console errors.
  - J2: orbit, pan and zoom, then Home restores the pose exactly; also region focus.
  - J3: canvas select shows the panel and evidence; the index selects; empty space deselects.
  - J4: double-click/tap focus and the panel Focus button.
  - J8: compact panel inside the viewport, touch-sized controls, collapsible index.
- **Visual baselines:** none yet. The console-room baseline arrives in Ex3.
- **CI:** the workflow was added but has not been observed running from this session (no GitHub Actions access here).

## Known incomplete work

- The topology view is boxes and orthogonal connector bars: there is no console-room geometry, corridor kit, cutaway, overlays, routes or materials (Ex3+).
- **C-LAD** sits directly beneath the lower deck, so it is occluded in every above-horizon view and `screenPointOf('C-LAD')` returns null. It is selectable from the room index. Cutaway (Ex6) or the Ex4 layout must expose it, because Ex4's E2E requires every placed room to be selectable from the overview.
- Region labels for the maintenance spine and power core can overlap in the overview (progressive labels are Ex7).
- Connector bars are not pickable and are not checked against room volumes. Ex4's validator covers that.

## Next execution

- **Ex3** (console-room greybox and spatial validator).
  - Introduce the `StructureDescription` types and the full mesh-tagging contract. Migrate `prototypeScene.ts`'s `userData` to `{kind, id, part, evidenceClass}`.
  - Replace the C-M/C-U/C-L boxes with the describe→build console room. Keep the hook API and the `screenPointOf` semantics.
  - Add the desktop "console-room" visual baseline.
