# TARDIS Isometric Interior — Agent Build Plan

## Purpose

Build a browser-based, interactive 3D reconstruction of the Doctor's TARDIS interior as one **cohesive, physically connected architectural structure**, presented primarily through an **isometric/orthographic camera**.

The result should feel like an architectural cutaway of an enormous, labyrinthine spacecraft — not a collection of floating rooms and not an FPS level with a decorative map layered on top.

The project should be driven by research. Reproduce documented spaces as faithfully as available evidence allows, infer missing connective architecture conservatively, and clearly distinguish sourced geometry from interpretation.

---

## Core Product Vision

The application should let a user:

1. View the TARDIS as a large, continuous 3D interior from an isometric perspective.
2. Rotate, pan, and zoom around the structure.
3. Click rooms, corridors, stairs, shafts, and major systems to inspect them.
4. Trace physical routes through the ship from the console room to deeper spaces.
5. Hide or fade walls/floors to expose internal spaces without breaking the sense that everything is physically connected.
6. Toggle evidence overlays showing which elements are:
   - directly supported by television/production evidence,
   - strongly reconstructed from secondary evidence,
   - inferred for continuity,
   - speculative.
7. Eventually switch between TARDIS eras or configurations without throwing away the underlying spatial/data model.

The **Series 7–10 Michael Pickwoad console room** should be the initial architectural anchor because it is comparatively well documented, contains multiple physical levels and exits, and is directly associated with deeper TARDIS spaces shown in *Journey to the Centre of the TARDIS*.

---

# Non-Negotiable Requirements

## 1. The interior must be physically connected

Do **not** implement the ship as floating room modules connected by abstract lines.

Every included room must connect through visible architecture such as:

- corridors,
- landings,
- stairs,
- ramps,
- ladders,
- catwalks,
- shafts,
- vestibules,
- doors,
- maintenance tunnels,
- service spaces.

The user should be able to visually follow a continuous route through the model.

No room may exist as an isolated island unless the source explicitly requires that behavior.

## 2. Isometric presentation, real 3D geometry

The primary camera should be an **orthographic camera positioned at an isometric-style angle**.

The model itself must be actual 3D geometry with real depth and vertical layering.

Do not fake the project as a flat 2D isometric illustration.

## 3. Research before invention

Before building any major room or connection:

1. Find the strongest available visual and textual references.
2. Record what is known.
3. Record what is uncertain.
4. Infer only what is necessary to create a continuous structure.
5. Never present inferred adjacency or dimensions as established canon.

## 4. Cohesion beats literal set geography

Television sets were frequently rearranged, reused, partially built, or represented inconsistently.

The project should therefore reconstruct the **fictional architecture**, not simply reproduce studio floor layouts.

When screen evidence conflicts:

- preserve recognizable room geometry,
- preserve known entrances/exits when possible,
- favor a coherent in-universe interpretation,
- document the compromise.

## 5. No arbitrary “complete TARDIS” claim

The TARDIS is effectively unbounded and reconfigurable in canon.

The project should describe itself as a **research-driven reconstruction of known and inferred regions**, not a definitive complete floor plan.

---

# Canon / Evidence Model

Every modeled object of significance should support provenance metadata.

Use the following evidence grades:

### Grade A — Direct primary evidence

Examples:

- geometry visible clearly on screen,
- production blueprint,
- measured surviving prop/set,
- official production drawing,
- production photography showing dimensions or adjacency.

### Grade B — Strong official evidence

Examples:

- official Doctor Who site description,
- behind-the-scenes feature,
- production designer interview,
- licensed production material.

### Grade C — High-quality reconstruction

Examples:

- photogrammetric reconstruction,
- carefully researched TARDIS Builders plans,
- dimensioned fan reconstruction explicitly derived from screen or production evidence.

### Grade D — Structural inference

Necessary extrapolation from known architecture.

Examples:

- corridor length required to connect two known entrances,
- intermediate stairwell,
- service hallway behind a documented door.

### Grade E — Speculative design

Original architecture added because the ship needs connective tissue or visual completeness.

Grade E should be used sparingly.

Each room/connection record should include:

```ts
interface EvidenceRecord {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  source: string;
  note: string;
}
```

---

# Initial Canonical Scope

## Phase-1 anchor: Pickwoad-era TARDIS

Use the Series 7–10 console room as the primary visual/structural anchor.

Important known characteristics include:

- three major vertical levels,
- central hexagonal console,
- upper balcony,
- lower deck,
- multiple doorways leading deeper into the ship,
- under-console access,
- lower-wall access toward deeper systems,
- substantial vertical structure suitable for stairs, shafts, and service routes.

## Initial room set

Prioritize these spaces:

### Tier 1 — Required for first complete map

1. Main console room
2. Immediate upper/lower access corridors
3. Generic TARDIS corridor network
4. Storage room
5. Library
6. Architectural Reconfiguration System area
7. Eye of Harmony chamber / access zone
8. Engine-room approach
9. Engine room / central systems space

These spaces are strongly associated with *Journey to the Centre of the TARDIS* and provide enough variety to establish the map's architectural language.

### Tier 2 — Expand after the first coherent structure works

10. Wardrobe
11. Companion bedrooms / residential corridor
12. Workshop
13. Observatory
14. Swimming pool
15. Cloister room
16. Medical/sick-bay area
17. Additional storage rooms
18. Mechanical/service spaces

### Tier 3 — Long-term expansion

- archived control rooms,
- zero room,
- greenhouse/garden spaces,
- galleries,
- garages,
- aquarium/zoo references,
- additional companion rooms,
- alternate-era control-room configurations.

Do not add Tier 2 or Tier 3 rooms until Tier 1 forms a convincing continuous structure.

---

# Spatial Architecture Strategy

## Build the ship as a graph embedded in real 3D space

Maintain two simultaneous representations:

1. **Topology graph** — what connects to what.
2. **World transform** — where each room physically sits in the reconstruction.

Example:

```ts
interface RoomNode {
  id: string;
  name: string;
  era: string[];
  position: [number, number, number];
  rotation: [number, number, number];
  bounds: Bounds3D;
  entrances: Entrance[];
  evidence: EvidenceRecord[];
}

interface Connection {
  id: string;
  fromRoom: string;
  fromEntrance: string;
  toRoom: string;
  toEntrance: string;
  type: 'corridor' | 'stairs' | 'ramp' | 'ladder' | 'shaft' | 'catwalk';
  evidence: EvidenceRecord[];
}
```

This separation is important because later versions may rearrange the same topology into alternate TARDIS configurations.

## Architectural hierarchy

Organize the ship into connected regions:

### Region A — Control nexus

- main console chamber,
- upper gallery,
- lower ring,
- immediately adjacent passageways.

### Region B — Habitation / cultural spaces

- library,
- wardrobe,
- bedrooms,
- workshop,
- observatory.

### Region C — Structural / maintenance spaces

- hexagonal corridors,
- storage,
- service shafts,
- maintenance tunnels,
- reconfiguration machinery.

### Region D — Power core

- Eye of Harmony approach,
- containment/observation spaces,
- engine-room approach,
- engine room.

The first complete model should visibly transition from inhabited areas toward increasingly industrial and abstract machinery as the user descends deeper into the ship.

---

# Connectivity Rules

1. Every room must have at least one physically modeled route to the console room.
2. Avoid long dead-end hallways unless supported by source material or useful for atmosphere.
3. Prefer loops and alternate routes once the first-pass structure is established.
4. Verticality should matter. The TARDIS should feel much deeper than a normal building.
5. Use stair towers, ramps, lift-like shafts, ladders, and multi-level corridors to create vertical relationships.
6. Major rooms should have believable transitional spaces. Do not place radically different environments directly against one another without an antechamber, corridor, shaft, or threshold.
7. Doorways seen on screen should retain their visual identity even when the unseen space behind them must be inferred.
8. Any invented connection must be tagged Grade D or E.

### Initial layout principle

Do not start by drawing a huge master floor plan.

Start at the console room and **grow the structure outward**, validating each connection before expanding further.

---

# Visual Language

## Transitional architecture

Use the Pickwoad-era visual vocabulary as the default connective grammar:

- hexagonal geometry,
- dark metallic structural ribs,
- layered circular/hexagonal motifs,
- industrial walkways,
- blue/teal ambient illumination,
- warm orange mechanical accents,
- exposed structural systems,
- deep vertical shafts.

Do not make every room look identical.

Hero rooms should retain their distinctive identity while corridors and transitional spaces provide visual continuity.

## Cutaway behavior

The isometric map should reveal interiors using architectural-visualization techniques:

- wall fade,
- roof hide,
- clipping planes,
- selective floor transparency,
- exploded vertical spacing only as an optional inspection mode.

**Default view must remain structurally connected.**

Do not use exploded/floating layout as the primary presentation.

---

# Recommended Technical Stack

Default recommendation unless an existing project requires otherwise:

- **Vite**
- **TypeScript**
- **Three.js**
- **React Three Fiber** only if React materially improves application/state management; plain Three.js is acceptable and may be simpler.
- **GLTF/GLB** for authored geometry
- **Blender** for complex hero-room modeling
- **KTX2/Basis** for texture compression
- **Meshopt** for geometry compression
- **Playwright** for end-to-end tests
- **Vitest** for unit/data-model tests

Do not require Blender for basic corridors and structural primitives. Reusable corridor geometry can be generated procedurally in code.

---

# Scene Architecture

Use a chunked scene structure.

Suggested organization:

```text
src/
  app/
  scene/
    TardisScene.tsx
    camera/
    controls/
    lighting/
    clipping/
  world/
    rooms/
    corridors/
    structure/
    props/
  data/
    rooms.ts
    connections.ts
    evidence.ts
    eras.ts
  systems/
    selection/
    navigation/
    visibility/
    labels/
    provenance/
  ui/
  tests/
assets/
  models/
  textures/
  references/
research/
  sources.md
  room-dossiers/
  connection-decisions.md
```

Keep research data separate from runtime rendering code.

---

# Camera and Interaction

## Default camera

Use an orthographic camera.

Start near a conventional isometric orientation:

- roughly 35.264° downward pitch,
- roughly 45° yaw.

Exact values may be adjusted for composition.

## Required camera interactions

- drag to orbit around the structure,
- wheel/pinch to zoom,
- drag/pan,
- click/tap object to select,
- double-click/tap selected room to focus,
- home/reset-view control,
- floor/region focus controls.

Do not permit arbitrary perspective distortion in the default mode.

An optional perspective/exploration camera can come later.

## Selection behavior

Selecting a room should:

1. highlight the room,
2. preserve surrounding context,
3. display room name,
4. show known appearances,
5. show evidence grade,
6. show source notes,
7. optionally highlight the shortest physical route back to the console room.

---

# Navigation / Route Visualization

Implement graph-based pathfinding after the initial topology exists.

Use A* or Dijkstra over connection nodes.

Allow the UI to answer questions such as:

- “How do I get from the console room to the library?”
- “What spaces connect to the Eye of Harmony approach?”
- “Which route reaches the engine room?”

Route visualization should illuminate the actual corridors/stairs in the 3D structure rather than drawing an abstract line through walls.

---

# Research Workflow

Create a dossier before modeling each hero room.

Each dossier should contain:

```markdown
# Room Name

## Canon appearances

## Production references

## Dimensions known

## Dimensions inferred

## Entrances/exits visible

## Materials / lighting

## Repeated architectural motifs

## Continuity conflicts

## Proposed reconstruction

## Evidence grades

## Open questions
```

## Evidence priority

Use sources in roughly this order:

1. Episode footage / frame references
2. Production drawings and blueprints
3. Official Doctor Who/BBC material
4. Production-designer/art-department commentary
5. Behind-the-scenes photography
6. Measured surviving sets/props
7. High-quality reconstruction communities such as TARDIS Builders
8. Secondary reference sites
9. Fan speculation

Never silently promote a fan reconstruction to canon.

---

# Initial Research Targets

Start with these sources and expand from them.

## Official / high-authority sources

- Doctor Who — “What is the TARDIS?”  
  https://www.doctorwho.tv/news-and-features/what-is-the-tardis

- Doctor Who — “A Brief History of the Doctor's TARDIS”  
  https://www.doctorwho.tv/news-and-features/a-brief-history-of-the-doctors-tardis

- Doctor Who — TARDIS character page  
  https://www.doctorwho.tv/characters/the-tardis

## Production / reconstruction references

- The Doctor Who Site — Series 7 TARDIS Interior  
  https://thedoctorwhosite.co.uk/tardis/interior/series-7-interior/

- TARDIS Builders — original TARDIS interior blueprints/research  
  https://tardisbuilders.com/index.php?threads/the-original-tardis-interior-blue-prints.4825/

- TARDIS Builders — console/reference sections and measured reconstructions  
  https://tardisbuilders.com/

## Key television references

Prioritize direct visual review of:

- *The Snowmen*
- *The Bells of Saint John*
- *Journey to the Centre of the TARDIS*
- *The Time of the Doctor*
- *The Doctor's Wife*
- *The Christmas Invasion*
- *The Invasion of Time*
- *Logopolis*

Use screenshots/frame study only as reference material; do not redistribute copyrighted episode footage or large image collections inside the project.

---

# Modeling Strategy

## Stage 1 — Greybox everything

Do not begin with detailed props.

Model:

- room volumes,
- platforms,
- major walls,
- door openings,
- staircases,
- corridors,
- major shafts.

Use simple materials and strong labels.

The goal is to validate spatial composition.

## Stage 2 — Structural language

Create reusable kits for:

- corridor wall segment,
- corridor corner,
- T-junction,
- four-way junction,
- doorway,
- support rib,
- railing,
- stairs,
- ladder,
- catwalk,
- shaft,
- floor plate,
- ceiling segment,
- roundel/hexagonal panel.

Use instancing where practical.

## Stage 3 — Hero rooms

Model high-detail rooms separately, then integrate them into the connected structure.

Start with:

1. console room,
2. library,
3. storage room,
4. architectural reconfiguration area,
5. Eye of Harmony zone,
6. engine room.

## Stage 4 — Props and storytelling detail

Only after spatial validation add:

- books,
- console controls,
- furniture,
- crates,
- mechanical props,
- cables,
- screens,
- decorative items.

---

# Lighting Strategy

The map must remain legible at isometric scale.

Use two lighting layers conceptually:

1. **Architectural readability** — soft ambient/key lighting that keeps geometry visible.
2. **Diegetic lighting** — room-specific practical lights and effects.

Do not reproduce television contrast so literally that the map becomes unreadable.

Important rooms may use distinct lighting identities while maintaining overall cohesion.

---

# Labels and Information Overlay

Labels must not overwhelm the model.

Use progressive disclosure:

### Default

Show only major region labels.

### Hover / selection

Show room name and key metadata.

### Research mode

Show evidence grades and source notes.

### Structure mode

Show room IDs, entrances, connections, and route graph.

Labels should scale/fade based on zoom level.

---

# Optional Non-Euclidean Features

Do **not** use impossible geometry to avoid doing the architectural work.

First create a physically coherent connected reconstruction.

Afterward, optional TARDIS-specific effects can include:

- corridors that subtly change length,
- topology changes between configurations,
- doors that reroute after user interaction,
- archived rooms appearing/disappearing,
- reconfiguration animations,
- localized portal-like transitions.

These should be deliberate features, not shortcuts for disconnected modeling.

---

# Performance Requirements

The application should work well on modern desktop browsers and remain usable on recent mobile Safari/Chrome.

Initial targets:

- Desktop target: 60 FPS during normal navigation
- Mobile target: 30+ FPS
- No large blocking asset load before the first usable view
- Lazy-load distant/high-detail room assets
- Use instancing for repeated corridor geometry
- Use compressed GLB assets
- Use compressed textures
- Avoid excessive transparent materials
- Keep selectable collision geometry simple

Implement adaptive quality levels for:

- shadows,
- post-processing,
- texture resolution,
- environment effects,
- distant-room detail.

---

# Mobile Requirements

The experience must not be desktop-only.

Support:

- one-finger selection,
- one-finger orbit where practical,
- two-finger pan/pinch zoom,
- large touch targets,
- compact inspection panel,
- no hover-only functionality.

Ensure the orthographic view remains readable on an iPhone-sized viewport.

---

# Testing Requirements

## Unit tests

Test:

- every room has a valid ID,
- every connection references valid entrances,
- no orphan Tier-1 rooms exist,
- every Tier-1 room has a path to the console room,
- evidence records use valid grades,
- coordinate/bounds data is valid.

## Graph validation

Create a test that fails when a required room becomes disconnected.

Example invariant:

```ts
expect(shortestPath('console-room', room.id)).not.toBeNull();
```

for every required room.

## E2E tests

Use Playwright to verify:

1. scene loads,
2. user can rotate/pan/zoom,
3. room can be selected,
4. room metadata appears,
5. focus-room works,
6. reset view works,
7. evidence overlay works,
8. route-to-console works,
9. mobile viewport remains usable.

## Visual regression

Capture fixed camera views of major milestones.

At minimum:

- full isometric overview,
- console room,
- library region,
- power-core region.

---

# Build Phases

## E0 — Research foundation

Deliverables:

- `research/sources.md`
- evidence grading system
- room inventory
- first-pass topology graph
- console-room dossier
- *Journey to the Centre of the TARDIS* dossier
- list of known architectural conflicts

Do not model beyond crude placeholders until this is complete.

### Exit criteria

- Tier-1 rooms identified
- known/inferred distinction documented
- initial adjacency proposal reviewed for obvious contradictions

---

## E1 — Technical prototype

Build:

- Vite/TypeScript project
- Three.js scene
- orthographic isometric camera
- orbit/pan/zoom controls
- selection/raycasting
- simple labeled boxes representing rooms
- graph data model

### Exit criteria

The user can navigate a crude but connected 3D topology.

---

## E2 — Console-room greybox

Reconstruct the Pickwoad-era console room.

Include:

- three major levels,
- central console footprint,
- upper balcony,
- lower level,
- known exits,
- under-console access,
- primary stairs.

### Exit criteria

The console room is recognizable from silhouette and spatial proportions without textures or props.

---

## E3 — Connected corridor skeleton

Grow the map outward from the console room.

Build enough corridor/stair/shaft infrastructure to locate all Tier-1 rooms physically.

### Exit criteria

- no floating Tier-1 rooms,
- every Tier-1 room is physically reachable,
- full structure reads coherently in isometric view.

This is the most important architectural milestone.

---

## E4 — Journey hero spaces

Model and integrate:

- storage room,
- library,
- architectural reconfiguration area,
- Eye of Harmony approach/chamber,
- engine-room approach,
- engine room.

### Exit criteria

Each room is recognizable and embedded into the corridor network.

---

## E5 — Cutaway / visibility system

Implement:

- wall fading,
- ceiling hiding,
- clipping or sectional view,
- floor/region isolation,
- focus mode.

### Exit criteria

The user can inspect deep rooms without losing awareness of how they connect to the overall structure.

---

## E6 — Provenance and research UI

Implement:

- room information panel,
- evidence grade,
- source list,
- known vs inferred indicator,
- research overlay.

### Exit criteria

A user can tell which parts of the reconstruction are sourced and which are interpretive.

---

## E7 — Route visualization

Implement topology pathfinding and visual route highlighting.

### Exit criteria

Any Tier-1 room can display a valid physical route to any other Tier-1 room through modeled architecture.

---

## E8 — Art pass

Replace greybox materials with finished architecture.

Add:

- authored models,
- materials,
- lighting,
- props,
- room-specific effects,
- visual polish.

Do not change major geometry casually during this phase. Structural changes must go back through the topology/evidence model.

---

## E9 — Tier-2 expansion

Add additional canonical spaces one at a time using the same dossier → greybox → connection → validation → art workflow.

Never append a new room as an isolated attraction.

---

# Definition of Done for Version 1

Version 1 is complete when:

1. The Pickwoad console room is recognizable and structurally faithful.
2. All Tier-1 spaces exist.
3. Every Tier-1 space is physically connected.
4. The whole structure can be understood from the isometric overview.
5. The user can rotate, pan, zoom, select, and focus rooms.
6. Cutaway behavior exposes deep spaces cleanly.
7. The user can trace routes through real corridors/stairs.
8. Every major room and connection has evidence metadata.
9. Inferred geometry is visibly distinguishable from directly sourced geometry.
10. Desktop performance is smooth and mobile remains usable.
11. Automated graph/connectivity tests pass.
12. Core interactions pass Playwright E2E tests.

---

# Agent Operating Rules

The implementation agent should follow these rules throughout the project:

1. **Do not invent silently.** Record architectural inference in `research/connection-decisions.md`.
2. **Do not prioritize props over structure.** Connectivity and scale come first.
3. **Do not create floating rooms.** New spaces must be integrated physically.
4. **Do not optimize around studio-set limitations.** Reconstruct the fictional architecture.
5. **Do not claim speculation is canon.** Preserve provenance.
6. **Do not remodel large areas without checking graph connectivity.**
7. **Do not overfit to one camera angle.** Geometry must remain valid when rotated.
8. **Do not make the map unreadable for screen accuracy.** Architectural legibility matters.
9. **Run tests before each milestone handoff.**
10. **Update research notes whenever a new source changes a previous assumption.**

---

# First Task for the Agent

Begin with **E0 only**.

Research the Pickwoad-era console room and the internal spaces shown in *Journey to the Centre of the TARDIS*. Build a source catalog and room/connection dossier before writing production geometry.

Produce:

1. `research/sources.md`
2. `research/room-dossiers/console-room.md`
3. `research/room-dossiers/journey-interior.md`
4. `research/connection-decisions.md`
5. `src/data/rooms.ts` containing a preliminary Tier-1 room inventory
6. `src/data/connections.ts` containing a preliminary topology graph
7. a short architectural proposal describing how all Tier-1 spaces could form one cohesive connected structure

The architectural proposal must explicitly identify every connection that is not directly established by primary evidence.

Do **not** begin detailed visual modeling until this research/topology package is coherent.

---

# Guiding Principle

> Build the TARDIS as a place first and a spectacle second.

The success criterion is not simply whether individual rooms look accurate. The project succeeds when the user can look at the complete isometric structure and believe that these spaces form one enormous, strange, continuous machine.
