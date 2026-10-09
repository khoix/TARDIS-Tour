# Journey to the Centre of the TARDIS (2013) — interior spaces

Covers the spaces _Journey_ shows beyond the console room. Node IDs are those in `src/data/rooms.ts`; source IDs are those in `research/sources.md`. Authoritative research: `docs/reference/tardis-research.md` §D, §E4, §12.4–12.6, §24.3.

## Canon appearances

_Journey to the Centre of the TARDIS_, first broadcast 27 April 2013 [S53]. The ship is **malfunctioning and reconfiguring** for the whole episode. Its routes therefore show what can be reached, not stable adjacency (§E4).

## Production references

- Scene-described transcripts [S05] and [S28], BBC subtitle timecodes [S41], and a secondary recap [S50].
- Production history [S23]: the library was filmed at Cardiff Castle, the ravine/portal at a quarry, and most other spaces at Roath Lock. There were dedicated sets for the fuel-cell tunnel, the Eye antechamber and the engine. **Filming locations are not floor plans.**
- Review notes [S06], promotional stills [S51] (link only) and the ARS thread [S52].

## Route threads (do not merge into one path)

- **Clara:** storeroom → corridors → observatory glimpse → pool glimpse → library. This is the order of edited scenes, not proof of door-to-door adjacency.
- **Doctor and salvagers:** console room → corridors → ARS (door vanishes, then returns) → looping corridors → echo console rooms → lower hexagonal panel → beneath the primary fuel cells → Eye antechamber and catwalk → portal → engine.
- **Bram:** console → under-console compartment. This does not prove a route to any distant room.

## Per-space record

| Node                | Space                                | Seen features                                           | Access evidence                                                           | Not measurable / inferred                                                                     | Grade                    |
| ------------------- | ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| S-01                | Cot storeroom                        | Cot, toy TARDIS, shelving                               | Entered from interior corridors [S05]                                     | Bounds, height, which corridor                                                                | A existence; D placement |
| O-01 (Tier 2)       | Observatory                          | Large old-fashioned telescope (glimpse)                 | Passed by Clara [S05, S50]                                                | Enclosure, volume                                                                             | B                        |
| P-01 (Tier 2)       | Pool                                 | Open-roof pool glimpse                                  | Passed by Clara [S05, S50]                                                | Sky vs atrium, depth, doors; **not** the 1978 shell                                           | B                        |
| L-01                | Library                              | Very tall ornate stacks, bottled encyclopedia           | Clara arrives after fleeing [S05, S28]                                    | Bays and floors. **Five vs six levels conflict** ([S28] vs [S05]), so `floorCount = null`     | A existence; D placement |
| ARS-01              | Architectural Reconfiguration System | Branching tree-like machine bearing glowing orbs        | A door that vanishes and returns [S05, S41]                               | Number of exits, plan, height                                                                 | A existence; D placement |
| H-01/H-02/M-01/M-02 | Hexagonal corridors                  | Repeated polygonal metal ribs and panels, thresholds    | Running and branching scenes [S05]                                        | Lengths, cross-section, corners. Repetition shows a deliberate labyrinth, not loop dimensions | A style; D layout        |
| F-01                | Under-fuel-cell tunnel               | Narrow route, exposed hazardous rods                    | "Beneath the primary fuel cells" [S41]; dedicated set [S23]               | Width, length, first junction. Only the vertical order is asserted                            | B                        |
| E-A                 | Eye antechamber                      | Separate production setup                               | Sequence before the Eye [S23]                                             | Shell geometry                                                                                | B                        |
| E-01                | Eye of Harmony                       | Exploding star held in decay; catwalk; several doorways | Entered during the escape [S05, S06]                                      | Catwalk span, radius, portal location                                                         | A existence; D bounds    |
| E-V                 | Defensive / portal zone              | Chasm-like region                                       | The Doctor anticipates crossing a **portal** to the engine (~37:48) [S41] | Vestibule geometry is authored                                                                | A portal; D vestibule    |
| ENG-01              | Engine                               | Explosion frozen in time (~38:23)                       | Reached only through the portal on screen [S41]                           | Containment, entrance, scale                                                                  | A existence; D placement |

## Materials / lighting

- Moving deeper into the ship, the surroundings become more industrial and hazardous.
- Corridors use dark metal with blue/teal ambience and warm orange mechanical accents.
- The Eye gives off a bright orange star glow.
- The library is warm and ornate, set apart from the mechanical corridors.

## Repeated architectural motifs

Hexagonal corridor profiles, structural ribs, roundel and hex panels, thresholds between differently styled spaces, and deep vertical shafts.

## Continuity conflicts

- The library's floor count (five vs six) is unresolved.
- The portal intervenes between the Eye and the engine, so an ordinary adjoining hallway is **not** established (§H).
- The echo console rooms are a reconfiguration effect, not permanent rooms.
- The 2013 pool is not the 1978 Greco-Roman shell.
- The 2013 Eye and the 1996 Cloister Eye are different depictions; only the 2013 Eye is modeled.

## Proposed reconstruction

- **Maintenance spine M-01**, behind the console room's lower exit: storeroom S-01 and the ARS branch off it.
- **Junction M-02**, reached from M-01 and from a service loop out of the ARS. From M-02 the route descends to F-01, which sits beneath a modeled fuel-cell level.
- **Power core:** F-01 → antechamber E-A → Eye E-01, crossed by a catwalk → transition hall → enclosed portal vestibule E-V containing portal B28 → engine ENG-01.
- **Engine bypass B37:** an authored INF-E service corridor from M-02 to ENG-01. It gives an ordinary route to the engine, because the portal never counts for connectivity.
- **Cultural branch H-01 → H-02 → library**, reached from the gallery exit. H-02 holds reserved thresholds for the observatory and pool in that order, preserving Clara's sequence without asserting adjacency.

Execution 4 builds this reconstruction as a connected greybox, and Execution 5 makes each Journey room recognizable inside it (below). Placements and rejected alternatives: `research/layout-hypothesis.md`; the built form of each edge: `research/connection-decisions.md`.

## Hero features (Execution 5): known vs inferred

`src/world/rooms/hero/` builds each Journey room's recognizable features inside its fixed layout box. `params.ts` gives every feature parameter a basis (`verified`, `order` or `design`) and its sources (`HERO_PARAM_NOTES`). Each mesh's `evidenceClass` says how that part is known: `sourced` when the feature is seen or described on screen, `inferred` when its form is authored. Every size, count and position is a normalized design value. Nothing here is a canonical reproduction.

| Node   | Known (seen or described) → `sourced`                                                                 | Inferred (authored form) → `inferred`, or the edge's provenance                                                                                                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-01   | Shelving, mementos on the shelves, the cot, the toy TARDIS [S05, S06]                                 | Where each stands, shelf count and pitch. The shelving fills the walls without a door, and the cot stands beside the side shelving, clear of the doorway.                                                                                                 |
| L-01   | Very tall ornate stacks of books, the bottled encyclopedia [S05, S06, S23]                            | `floorCount` = 4 storeys of 5 NU: a design default. The sources conflict (five vs six [S28] vs [S05]), and rooms.ts keeps `floorCount = null`. A railed gallery for each upper storey, a ladder per gallery from the floor, and the encyclopedia's stand. |
| ARS-01 | A branching tree-like machine bearing glowing orbs; a door that vanished and returned [S05, S41, S52] | Plinth, branch count per tier (3 tiers × 6), reach and orb size. The door marker (glowing frame and label) is generated from B18's `observedStates: ['reconfiguring']`, and takes B18's provenance (TV-S → sourced).                                      |
| F-01   | Beneath the primary fuel cells; exposed hazardous rods [S41, S23]                                     | Rods hang either side of the walk line (2 NU of headroom) and stand between the cell rows on the deck. The deck itself is authored (Ex4).                                                                                                                 |
| E-A    | A separate antechamber setup before the Eye [S23]                                                     | How it is sealed: bulkhead frames on both doors, locking wheels on the side walls, and glowing seal strips across the thresholds. Its appearance is `unknown`.                                                                                            |
| E-01   | An exploding star held in decay; a catwalk; several doorways [S05, S06]                               | The core sits 7 NU below the catwalk (only "the catwalk passes above it" is ordered). The containment ring and struts, the frozen flares, and two sealed blind doorways at catwalk level on the walls the route does not use.                             |
| E-V    | A portal to the engine, explicit in dialogue (~37:48) [S41, S05]                                      | The vestibule (Ex4). The portal marking (a violet glowing frame, floor chevrons and the label "B28 portal · non-Euclidean, never walked") belongs to edge B28, so it is tagged to B28, not to E-V.                                                        |
| ENG-01 | An explosion frozen in time (~38:23) [S05, S41, S23]                                                  | Fireball size and depth, 72 fragments on a deterministic burst, the shock ring, and the engine housing and struts the burst rises from.                                                                                                                   |

Glowing parts (orbs, the Eye, the fireball, rods and the portal marking) are self-lit greybox shades, not final materials (Ex8). In the default region framing, the Eye core and the frozen explosion lie below the top of their chambers' full-height walls. The Ex6 cutaway exposes them.

## Evidence grades

Room existence is A or B, as in the table. Every room-to-room placement and corridor is D. B37 is E.

## Open questions

These are capture tasks M06–M11 and P06–P12. All are blocked until lawful footage is available; see `research/geometry-tasks.md`.

- Were Clara's glimpses separated by cuts?
- Does the ARS have one exit or several?
- Which parts of the Eye are set and which are VFX?
- How does the portal actually work?
- How many levels does the library really have?
