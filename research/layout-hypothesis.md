# Layout hypothesis

This is a **design hypothesis**, not a canon floor plan. Every placement in `src/data/layout.ts` is `placementBasis: 'design'`, in normalized units (NU, `consoleRadiusNU = 10`), with no metric values. Topology and evidence stay in `src/data/rooms.ts` and `src/data/connections.ts`. This file records where each room sits, why, and which alternatives were rejected for conflicts or visibility (bible §18.4 item 5). The built form of each edge is in `research/connection-decisions.md`.

Compass words are shorthand for axes: north = −Z, east = +X. The 0° exterior door therefore faces south.

## Status: final v1 layout (Execution 4)

Execution 2 placed crude boxes. Execution 3 replaced the control-nexus boxes with the console-room description. Execution 4 grows the rest of the map outward from the console's two exits and builds every placed room as greybox structure. `src/world/rooms/shells.ts` builds each room from its box and its `ROOM_SHELLS` entry in `src/data/layout.ts`:

- **Corridor** nodes (H-01, H-02, M-01, F-01) are hex-profile runs along the box's long axis, with a junction at each side door.
- The **chamber** (M-02) is an octagonal node chamber with a door on each axis face.
- **Room** shells (L-01, S-01, ARS-01, E-A, E-01, E-V, ENG-01) are walls with door openings. They are walked on the floor, on a catwalk (E-01), or on a gallery ringing the walls (ENG-01).

Every box equals the bounding box of its room's description volumes, and every topology anchor is placed on one of its faces (tested). Anchors that no v1 edge uses are reserved Tier-2 doors and are built closed. Hero detail comes in Execution 5.

## Constraints applied

- The rotor axis is at the origin and the console main deck is at `Y = 0` (research/architecture-proposal.md).
- Only the order of the console decks is known: gallery (`Y = 7`) > main (`Y = 0`) > lower (`Y = −7`). The gap sizes are authored.
- The cultural spine sits at or above gallery level, the maintenance spine below the lower deck, and the power core deepest. `tests/data/layout.test.ts` enforces this.
- **7-NU levels.** Floors sit on multiples of 7, the console's own deck spacing. Every level change is then one flight rising 7 over a 7-NU run. That is the slope of the console stairs and the steepest flight the validator allows (`MAX_FLIGHT_SLOPE = 1`).
- **Axis-aligned.** `RoomTransform` has no rotation, so every box is axis-aligned and every door sits on an axis face.
- **No overlaps.** Room and passage volumes may touch but never overlap, so every room keeps a pickable surface. The spatial validator (`src/world/validate/`) checks the whole map with exact cylinder and box shapes.
- **Readable from the isometric camera.** The default view looks from +X, +Y, +Z (yaw 45°, pitch ≈ 35.3°). Anything lower, or further east or south, is drawn lower on screen. Anything north-west of the console can hide behind its drum. Rooms are placed so that going deeper into the ship means going down the screen, and so that every placed room shows part of itself in the overview. C-LAD, under the console, is the one exception (see below).
- **Fits one screen.** The overview frames the bounds of the whole map: zoom 0.745 on desktop (1280×800) and 0.441 on a 390×844 phone, above the 0.4 zoom floor. Each candidate layout was checked first in a projection mock.
- The main exterior door is at room-local azimuth 0°, authored as `+Z`. All other bearings are authored, not surveyed. Console-room bearings (exits, closed doors, stairs) and their rationale are in `research/room-dossiers/console-room.md`.

## Levels

| Y (NU) | What stands there                                                                          |
| ------ | ------------------------------------------------------------------------------------------ |
| +7     | Console gallery (C-U) and C-XU; the cultural spine (H-01, H-02) and the library floor L-01 |
| 0      | Console main deck (C-M) and P-EX                                                           |
| −7     | Console lower deck (C-L) and C-XL; C-LAD hangs beneath it (floor −11.5)                    |
| −14    | Maintenance spine: M-01, S-01 and the ARS-01 floor                                         |
| −21    | Junction chamber M-02                                                                      |
| −28    | The F-01 tunnel (fuel-cell deck above it at −24.5), E-A and the Eye catwalk in E-01        |
| −35    | E-V, the ENG-01 gallery, and the B37 bypass run                                            |
| below  | Voids under walkways: the Eye chamber floor (−40) and the engine floor (−58)               |

## Placements

| Room   | Floor centre (NU) | Box (W×H×D) | Built as                    | Rationale                                                                                                                                                                                                                                                                     |
| ------ | ----------------- | ----------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-M    | (0, 0, 0)         | 42×7×42     | Console description (Ex3)   | Main-deck band of the console shell (radius 21) from the main deck up to the gallery. The walkable platform is radius 10 (`consoleRadiusNU`).                                                                                                                                 |
| C-U    | (0, 7, 0)         | 42×12×42    | Console description (Ex3)   | Gallery band from the gallery deck up to the rib crown; the gallery walkway runs from radius 17 to 21.                                                                                                                                                                        |
| C-L    | (0, −7, 0)        | 42×7×42     | Console description (Ex3)   | Lower technical band from the lower deck up to the main deck, enclosed by the lower structure the ribs rise from.                                                                                                                                                             |
| P-EX   | (0, 0, 23.5)      | 4×6×4       | Console description (Ex3)   | Police-box threshold just outside the shell on the authored 0° (`+Z`) bearing, at the end of the entry bridge (B01 doorway).                                                                                                                                                  |
| C-XU   | (0, 7, 23.5)      | 4×4×4       | Console description (Ex3)   | Gallery exit landing at 0°, above P-EX. Landings cannot rotate, so exits use the rib-free axis bays (0°, 180°). The 0° bay lets B07 turn west to the cultural spine without crossing another room.                                                                            |
| C-XL   | (0, −7, −23.5)    | 4×4×4       | Console description (Ex3)   | Lower-wall exit landing at 180°, toward the maintenance spine (B05). It is a separate opening and volume from C-LAD (§12.2).                                                                                                                                                  |
| C-LAD  | (0, −11.5, 0)     | 4×4×4       | Console description (Ex3)   | Ladder compartment directly beneath the console, under a hatch in the lower deck (B06 is a ladder).                                                                                                                                                                           |
| H-01   | (−9, 7, 30)       | 10×4×4      | Corridor, standard profile  | B07 leaves the 0° upper landing heading south, clear of the shell, then turns west into H-01 at gallery level, so the cultural spine needs no stairs. A 4-way junction in its middle holds closed thresholds reserved for the residential wing and the archive.               |
| H-02   | (−22, 7, 30)      | 12×4×4      | Corridor, standard profile  | Continues H-01 west through B08, a 2-NU link. From the console side its closed thresholds follow Clara's order: observatory (south) and residential (north) at x −19, then pool (south) at x −25, then the library door at its west end.                                      |
| L-01   | (−35, 7, 30)      | 14×22×14    | Room shell, floor           | End of the cultural spine. B09 is a doorway in the wall it shares with H-02 (x −28). The 22-NU height is a parameter, not a five- or six-storey claim (`floorCount = null`). It is the leftmost and highest box on screen: the inhabited end of the ship.                     |
| M-01   | (8, −14, −37)     | 28×4×4      | Corridor, standard profile  | One level below the lower deck, directly behind the 180° exit, so B16 is one straight flight down. It runs east to M-02. It carries the most closed thresholds, reserved for deferred edges: workshop, sickbay, gallery power, the quiet wing, and the B36 sub-console route. |
| S-01   | (10, −14, −31)    | 8×5×8       | Room shell, floor           | Opens off M-01's south side, toward the console (B17 doorway). Follows the §17 maintenance placement.                                                                                                                                                                         |
| ARS-01 | (10, −14, −45)    | 12×20×12    | Room shell, floor           | Across M-01 from S-01 (B18 doorway). It is very tall (rising to +6) with its floor in maintenance. A service door on its east face starts the B23 loop to M-02, so the ARS is not a dead end.                                                                                 |
| M-02   | (35, −21, −37)    | 10×5×10     | Octagonal node chamber      | One level below M-01, where four routes meet: from M-01 on the west (B22), the ARS loop on the north (B23), the fuel tunnel on the south (B24) and the engine bypass on the east (B37).                                                                                       |
| F-01   | (35, −28, −17)    | 6×11×14     | Corridor, narrow, fuel deck | One more level down, running south from M-02 (B24 stairs) toward the Eye. A deck of primary fuel cells (two rows of hexagonal cells) sits over the tunnel inside the same box, so F-01 visibly runs "beneath the primary fuel cells" (§12.4). The deck is authored.           |
| E-A    | (35, −28, −3)     | 6×5×6       | Room shell, floor           | Sealed antechamber at the tunnel's end. B25 is a 4-NU narrow corridor. E-A shares its south wall with the Eye chamber (B26 doorway).                                                                                                                                          |
| E-01   | (35, −40, 8)      | 16×22×16    | Room shell, catwalk         | Large contained hazard volume. Walkers stay on an L-shaped catwalk at the antechamber's level (−28), joining its two doors 12 NU above the chamber floor. The hazard space below is not walked.                                                                               |
| E-V    | (5, −35, 8)       | 6×6×6       | Room shell, floor           | Enclosed portal vestibule (its enclosure is authored). B27 reaches it from the Eye's far door as a transition hall that drops one level over 19 NU, so the Eye does not border the engine (research §H). Its west wall is shared with ENG-01 and holds portal B28.            |
| ENG-01 | (−11, −58, 5)     | 26×32×26    | Room shell, gallery         | Deepest and largest volume, under the south-west side of the console. Both doors are on its east wall at gallery level (−35): the portal arrival from E-V and the B37 service threshold. The void below the gallery is left for the engine (Ex5).                             |

## Rejected alternatives

Three whole-map candidates were mocked in projection before any code was written. All three fit the phone overview (estimated zoom 0.44, 0.44 and 0.43; the built map frames at 0.441). They differed in where the engine and the B37 bypass go:

- **B** centres the engine under the console axis and runs B37 beneath the console's north side.
- **H** moves the engine south-west, then drops B37 through M-02's footprint and runs it south under F-01 and E-A.
- **I** keeps H's engine, drops B37 just east of M-02, and runs it south along the east edge of the power core. I was chosen.

| Room                | Alternative                                                                       | Rejected because                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-M, C-U, C-L, P-EX | None evaluated in Ex4                                                             | Fixed by the Ex3 console description (console dossier).                                                                                                                                                                                                                                  |
| C-XU, C-XL          | Exits on other bearings, or rotated landings                                      | Conflict: landings cannot rotate in the layout data, and only 0° and 180° are rib-free axis bays (console dossier).                                                                                                                                                                      |
| C-LAD               | Moving it off the rotor axis so the overview shows it                             | Conflict: the compartment is defined by the hatch under the console, on the axis (B06 ladder). Visibility is left to the Ex6 elevation clip. Until then it is selected from the room index.                                                                                              |
| H-01                | The Ex2 placement due west of the console, 1 NU above the gallery                 | Conflict: B07 would wrap a quarter of the shell from the 0° exit, and the 1-NU step needs a stair for nothing. Visibility: the corridor sat partly behind the drum.                                                                                                                      |
| H-02                | The Ex2 turn north off H-01                                                       | Visibility: H-02 would run partly behind the drum. The straight continuation keeps the spine one readable line and leaves both sides free for reserved doors.                                                                                                                            |
| L-01                | The Ex2 placement north-west of the console; a vestibule before the library       | Conflict: the library ends the spine, and the Ex2 corridors leading there are rejected above. The vestibule is an allowed refinement of B09 that no evidence requires (B09 is a doorway).                                                                                                |
| M-01                | The Ex2 placement east of the console; a shaft straight down from C-XL            | Conflict: from the 180° exit, B16 would wrap a quarter of the shell. A 7-NU drop is one flight, like the console stairs. The shaft stays a possible refinement (B16 record).                                                                                                             |
| S-01                | The cultural side near the library (Appendix L §5.3); M-01's north side           | Conflict: §17 places it in maintenance. Visibility: on the north side, the tall ARS would have to stand south of the spine and hide it.                                                                                                                                                  |
| ARS-01              | The cultural wing; M-01's south side; ARS as the only way to M-02                 | Conflict: it is thematically industrial (B18 record). Visibility: on the south side its 20-NU height would hide M-01 and S-01. Without B22 the ARS would be a mandatory pass-through (B22 record).                                                                                       |
| M-02                | The Ex2 placement, 10 NU below M-01                                               | Conflict: off the 7-NU level grid, so B22 could not be one flight at the console's slope.                                                                                                                                                                                                |
| F-01                | A vertical shaft with a ladder from M-02; the fuel cells as a separate room       | Conflict: B24 is a stairs edge (the shaft is a possible refinement in its record), and the fuel cells are not a node in rooms.ts. Keeping them in F-01's box shows "beneath" without inventing a room.                                                                                   |
| E-A                 | An extra junction between the tunnel and the antechamber                          | Not needed: no evidence or route requires it (B25 record).                                                                                                                                                                                                                               |
| E-01                | Walking the chamber floor                                                         | Conflict: it is a contained hazard volume. The catwalk is the attested crossing.                                                                                                                                                                                                         |
| E-V                 | A doorway in the Eye chamber's own wall                                           | Conflict: it implies the Eye borders the engine (B27 record, research §H).                                                                                                                                                                                                               |
| ENG-01 (and B37)    | Candidate B: under the console axis. Candidate H: bypass through M-02's footprint | Visibility: in B the drum hides the top of the engine and part of the bypass. Conflict and visibility: in H the bypass shaft collides with M-02 and their labels overlap. In I the shaft and the long run stay in view; only the last leg into the engine passes behind the Eye chamber. |

## Passages

`src/data/paths.ts` holds the authored waypoints of each stable edge outside the console, at deck level. `src/world/corridors/describe.ts` turns them into kit segments that start and end on the edges' door anchors:

- level legs become hex corridor runs, with corner junctions where they turn;
- sloped legs become enclosed stair halls;
- vertical legs become ladder shafts with landings;
- a leg that only crosses a shared wall becomes a threshold frame.

The console's own edges (B01–B06) come from its parameters. The Ex2 boxes and connector bars remain only as the fallback for rooms and edges that no structure draws. None are left in v1 (tested).
