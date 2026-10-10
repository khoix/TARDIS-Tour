# TARDIS-Tour

An isometric, explorable 3D model of the TARDIS interior from _Doctor Who_, built around the 2012–2017 console room designed by Michael Pickwoad and the spaces seen in _Journey to the Centre of the TARDIS_ (2013).

**This is a research-driven reconstruction, not a complete or canonical floor plan.** On screen the interior is changeable and effectively unbounded, and no measured plan of it has been published. The model connects the known and reported spaces into one walkable structure. Every room and connection records how it is known: whether it was seen on screen, reported, reconstructed or inferred. Placements, sizes and most corridors are authored design choices, and the app labels them that way.

## What it shows

- **19 Tier-1 spaces**, physically connected, from the exterior doors to the engine core:
  - the console room (main deck, gallery, lower deck and the under-console compartment);
  - the cultural spine, ending at the library;
  - the maintenance spine (storeroom, Architectural Reconfiguration System, junctions);
  - the power core (fuel-cell tunnel, antechamber, Eye of Harmony, portal vestibule, engine).
- **Isometric navigation:**
  - orbit, pan and zoom with a mouse or touch;
  - select and focus rooms on the canvas or from an accessible room index;
  - focus a region from the toolbar.
- **Cutaway:**
  - near walls fade toward the camera, and ceilings are hidden;
  - a horizontal section clip with level steps;
  - region or level isolation, and focus mode.
- **Provenance:**
  - the info panel shows five evidence axes (presence, appearance, scale, connection, state), kept separate and never blended into one score, with graded records and linked sources;
  - an evidence overlay colours the model by sourced, reconstructed, inferred or speculative;
  - Research and Structure label modes.
- **Routes:** the shortest walk between any two rooms along the real corridors, stairs and ladders, with an optional portal edge.
- **Quality tiers** (high, medium, low). Mobile and low-end devices start on a lighter tier, and sustained slow frames step the tier down.

## Run it

Requires Node.js 22+.

```sh
npm ci
npm run dev        # http://localhost:5173
npm run build      # typecheck and production build in dist/
npm run preview    # serve dist/
```

URL options:

- `?quality=high|medium|low` pins a quality tier.
- `?stats` shows the draw-call and triangle overlay.
- `?test` exposes the `window.__tardis` test hook in production builds.

## Test it

```sh
npm run lint
npm run typecheck
npm test           # Vitest: data integrity, graph connectivity, spatial validator, systems, UI
npm run test:e2e   # Playwright: desktop and touch-phone projects, visual baselines
```

- The E2E suite renders WebGL headlessly on SwiftShader and clicks real canvas pixels through the test hook.
- Visual baselines are Linux/Chromium images (desktop only).
- `@playwright/test` is pinned to 1.56.1. Install its browser with `npx playwright install chromium` (CI does this).

The connectivity gate runs in every unit run: from the console room, with the portal edge disabled, both the topology graph and a walk over the built floors must reach every placed room.

## Provenance caveats

- **No metric scale.** Every dimension is in normalized units (the console room has radius 10), never metres. No source gives a verified measurement of the 2012–2017 set.
- **Topology is separate from layout.**
  - `src/data/rooms.ts` and `src/data/connections.ts` hold the register of rooms and links, with their evidence.
  - `src/data/layout.ts` and `src/data/paths.ts` hold the authored positions and walk lines.
- **Authored edges are marked as authored.**
  - Corridors not seen on screen are inferred.
  - The engine bypass B37 is speculative: the project authored it so the engine can be reached on foot without the portal.
  - The rationale for each edge is in `research/connection-decisions.md`, and for each placement in `research/layout-hypothesis.md`.
- **Hero rooms are recognizable, not exact.** Their feature parameters carry an evidence basis in `src/world/rooms/hero/params.ts`, and the textures are procedural approximations.
- **Out of scope:**
  - Tier-2 and Tier-3 rooms;
  - officially named but unseen spaces (aquarium, zoo, garage), which are stored as inventory only and never drawn;
  - other eras' console rooms.

The full research package is in `research/`. The project's research bible and build plan are in `docs/reference/`.

## Sources and attributions

_Doctor Who_ and the TARDIS are trademarks of the BBC. This is an unofficial fan research project, not affiliated with or endorsed by the BBC.

The repository contains no episode frames, screenshots of the show or third-party images. Sources are cited by link only, in `research/sources.md` (56 sources, mirrored in `src/data/evidence.ts`). The licensed set photographs used as scale-free references are:

- Lewis Clarke, "TARDIS 2013 set.jpg", 2014, CC BY-SA 2.0: https://commons.wikimedia.org/wiki/File:TARDIS_2013_set.jpg
- Rob Clarke, "The TARDIS Console Room (9437298228)", 2013, CC BY 2.0: https://commons.wikimedia.org/wiki/File:The_TARDIS_Console_Room_%289437298228%29.jpg
- Rob Clarke, "The TARDIS console room (9437299726)", 2013, CC BY 2.0: https://commons.wikimedia.org/wiki/File:The_TARDIS_console_room_%289437299726%29.jpg
- Wikimedia Commons, Category: TARDIS set (2012): https://commons.wikimedia.org/wiki/Category:TARDIS_set_(2012)

The 3D library is three.js (MIT): https://threejs.org

## Project docs

- `docs/AI-HANDOFF.md`: the current state, architecture, validation and the post-v1 backlog.
- `docs/EXECUTION-PLAN.md`: the nine-execution v1 plan.
- `AGENTS.md`: the rules for coding agents.
