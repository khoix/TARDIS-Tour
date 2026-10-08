# Handoff

Branch: `claude/tardis-isometric-v1`. Plan: `docs/EXECUTION-PLAN.md`. Rules: `AGENTS.md`.

## Completed

- **Ex1:** research package, typed topology/evidence data, graph utilities, tooling, and a room inventory page.

## Architecture / decisions

- **Topology is separate from layout.** `src/data/rooms.ts` (37 §17 nodes) and `src/data/connections.ts` (B01–B37) carry **no positions**. World transforms go in `src/data/layout.ts` from Ex2 on.
- **Placed v1 nodes (19):** P-EX, C-M, C-U, C-L, C-XU, C-XL, C-LAD, H-01, H-02, L-01, S-01, M-01, ARS-01, M-02, F-01, E-A, E-01, E-V, ENG-01. `V1_CONNECTIONS` = B01–B09, B16–B18, B22–B28, B37.
- **Portal handling.** B28 is the only portal (`portal: true`), and `buildGraph` excludes portals by default. ENG-01 is reachable in 5 edges via B37 (INF-E).
- **Evidence.** Rooms carry separate axes (`axes.presence/appearance/scale`, plus `state` and `observedStates`). Connections carry `provenance`, `basis`, `state` and `observedStates`. Claims are `EvidenceRecord {grade, sourceIds, note}`. Grades are per claim; the axes are never blended into one score.
- **Grade usage.** Grade E is used only for speculative architecture (currently just B37 and B36). Normalized geometry is expressed through `scale: 'normalized_authored'`, not through E records.
- **Inference metadata.** Any connection that is inferred or carries a D/E record must have `inference {reason, alternate, uncertainty, authoredBy, status}`.
- **Door anchors.** Each room has anchors (`id, label, level, observed, canonAzimuthDeg: null`). Every connection end names an existing anchor, and each anchor is used at most once.
  - Reported but unconnected doors (`C-U.upper-door-2`, `C-L.lower-door-2`) should be built **closed**.
  - Reserved anchors on H-02 and M-01 belong to deferred edges.
- **Sources.** `src/data/evidence.ts` holds 56 sources: S01–S27 keep the bible §I IDs, and S28+ cover the de-duplicated V/G/J/PICK sources (aliases recorded). `research/sources.md` mirrors it, with the same IDs in the same order (enforced by a test).
- **Generated research docs.** `research/sources.md` and `research/connection-decisions.md` were generated from the TS data with one-off node scripts. If the data changes, update the markdown in the same commit.
- **Tooling.** TypeScript is pinned to `~6.0.3`, because typescript-eslint 8.71 doesn't support TS 7. Prettier ignores `docs/reference/**` and `docs/EXECUTION-PLAN.md`.

## Important files

- `src/data/{types,rooms,connections,evidence,eras}.ts`
- `src/systems/navigation/graph.ts` (`buildGraph`, `reachableFrom`, `shortestPath`)
- `src/ui/roomIndex.ts`, the accessible room list to reuse as the room index in Ex2
- `src/main.ts`, `index.html`, `src/style.css`
- `research/`: `sources.md`, `room-dossiers/console-room.md`, `room-dossiers/journey-interior.md`, `connection-decisions.md`, `architecture-proposal.md`, `geometry-tasks.md` (M01–M12 and P01–P20 all `blocked_access`)

## Validation

- **Unit/integration:** `npm test` passes, 56 tests in 4 files covering data integrity, the graph, connectivity, and the room index under happy-dom. `npm run typecheck`, `npm run lint`, `npm run build` and `npx prettier --check .` all pass.
- **E2E:** none yet. `npm run test:e2e` is referenced in AGENTS.md but does not exist until Ex2 adds Playwright.

## Known incomplete work

- No Three.js, layout, geometry, Playwright or CI yet. That is intentional: Ex2 onward.

## Next execution

- **Ex2** (technical prototype and E2E harness). Add `three` and `@playwright/test`. Pin Playwright to the Chromium build in `/opt/pw-browsers`, or set `executablePath`.
- Add the `test:e2e` script and CI.
- Turn the room index list items into selectable controls that are wired to the canvas selection.
