# Console Room — Pickwoad configuration (2012–2017)

Nodes: `P-EX`, `C-M`, `C-U`, `C-L`, `C-XU`, `C-XL`, `C-LAD` (see `src/data/rooms.ts`). Source IDs refer to `research/sources.md`. Authoritative research: `docs/reference/tardis-research.md` §C, §12.2, §16.1, §24.4.

## Canon appearances

- _The Snowmen_ (2012), the first appearance of the design.
- _The Bells of Saint John_, _Journey to the Centre of the TARDIS_, _The Time of the Doctor_ (2013).
- Twelfth Doctor era, Series 8–10 (2014–2017), with changes to the dressing.

## Production references

- Michael Pickwoad designer interview [S03] and _Radio Times_ "Trashing the Tardis" [S48]. Independent corroboration: [S04].
- Firsthand set tour [S07]. The 2013 Street View panorama and contemporary reports [S08–S10].
- Licensed set photos [S11], [S12] and [S54], plus the Commons category [S55]. These are scale-free references and must not be committed to the repo.
- A secondary door inventory [S13] and [S40] reports four inner doors. This has not been verified.

## Dimensions known

None in metres. Verified quantities:

- **18** main structural ribs [S03, S04].
- **At least three** elevation zones: main deck, upper gallery and lower technical deck.
- The gallery is above the main deck, and the main deck is above the lower deck (`galleryY > mainY > lowerY`). Only the order is known, not the values.
- A **hexagonal** console.
- The upper rotor has **18** divisions, matching the ribs.

## Dimensions inferred

Every length, height and bearing is a normalized design value (NU). Execution 3 sets them in `src/world/rooms/console/params.ts`. `CONSOLE_PARAM_NOTES` records each one's basis, and a test requires a note for every parameter. Only counts, shapes and the order of the decks are evidenced. The main exterior door sits at room-local `0°` purely as a bookkeeping convention.

### Proportions (Execution 3 greybox)

Azimuths are measured about +Y, with 0° = +Z (the exterior doors) and 90° = +X.

| Proportion                    | Value (NU)                                                                                 | Basis                                                                           | Rationale                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deck levels                   | gallery 7, main 0, lower −7                                                                | Order verified; values design                                                   | Only `galleryY > mainY > lowerY` is known [S03, S09, S10]. Equal 7-NU gaps keep both stair flights identical.                                                                                          |
| Deck thickness                | 0.5                                                                                        | Design                                                                          | Reads as a structural plate at overview zoom.                                                                                                                                                          |
| Main deck radius              | 10                                                                                         | Design                                                                          | Equals `consoleRadiusNU`, the project scale unit.                                                                                                                                                      |
| Shell radius / gallery width  | 21 / 4 (inner edge 17)                                                                     | Design                                                                          | Gives a stair run of 7 for a 7-NU rise (45° flights), so stairs climb straight out from the platform edge to the gallery.                                                                              |
| Wall thickness                | 0.5                                                                                        | Design                                                                          | Thin shell; doorways are this deep.                                                                                                                                                                    |
| Gallery wall height           | 5                                                                                          | Design                                                                          | A door plus a lintel band below the rib knees. The main level between gallery and lower structure is left open between ribs for legibility.                                                            |
| Lower structure               | Solid drum, −7.5 to 0                                                                      | Design                                                                          | The ribs "sweep from lower structure" [S03, S04]; the drum is that structure in greybox form.                                                                                                          |
| Ribs                          | 18 at 10° + 20°k; 0.8 × 1 section                                                          | Count verified [S03, S04]; spacing design                                       | Uniform spacing is an assumption. The 10° phase centres a 20° bay on the 0° entrance, so no rib blocks a door.                                                                                         |
| Rib profile                   | Vertical at r 21.25 from −7.5 to 13, then in to r 14 at 19                                 | Design                                                                          | Rises from the lower structure past the gallery wall, then sweeps over the room as a vault.                                                                                                            |
| Crown ring                    | r 13.5–14.5 at 19                                                                          | Design (inferred)                                                               | Ties the rib heads; marks the vault top, which is also the top of the gallery volume.                                                                                                                  |
| Console                       | Hexagon, circumradius 3, height 1.2                                                        | Shape verified [S03, S11]; size design                                          | About a third of the platform radius; desk height relative to the 1-NU walking height. A flat side faces the entrance.                                                                                 |
| Rotor column                  | Radius 0.7, from the console top to 16.5                                                   | Design                                                                          | Narrow against the console; rises through the ring assemblies.                                                                                                                                         |
| Ring assemblies               | Two rings, 18 segments each, r 5.5 at 13.5 and r 4 at 15; opposite spin, 90-s period       | Divisions and contra-rotation verified [S03]; sizes, heights and speed design   | Hung overhead inside the crown. Rotation stops under `prefers-reduced-motion`.                                                                                                                         |
| Stair runs                    | Width 3, rise 0.5 per step (14 steps per flight); main→gallery at 120°, main→lower at 240° | Several stairs facing different directions verified [S03, S07]; bearings design | Both flights leave the platform edge radially, 120° apart, so they face different directions. They avoid the bridge and every door.                                                                    |
| Entry bridge                  | Width 3, thickness 0.3, from r 9.5 to the shell at 0°                                      | Described [S03]; size design                                                    | Thinner than the decks so it reads as suspended. It ends at the police-box threshold P-EX (4 × 6 × 4, outside the shell).                                                                              |
| Upper exit (B04 → C-XU)       | Gallery, 0° (above the entrance)                                                           | Design                                                                          | Landing boxes cannot rotate in the layout data, so exits must sit on axis-aligned bays. Only 0° and 180° are rib-free axis bays. The 0° bay sends the gallery route west without crossing other rooms. |
| Lower exit (B05 → C-XL)       | Lower deck, 180°, hexagonal panel 3 × 3                                                    | Panel verified [S05, S07]; bearing and size design                              | The other axis-aligned bay, away from the entrance. The route east to M-01 crosses no other room.                                                                                                      |
| Closed reported doors         | Upper at 180°, lower at 60°; 2.5 × 4                                                       | Reported [S13, S40]                                                             | Modeled **closed** and labeled "Reported, destination unknown". Counts stored as reported = 4, verified = null.                                                                                        |
| Landings C-XU and C-XL        | 4 × 4 × 4, outside the shell                                                               | Design (grade D)                                                                | Short landings so later corridors meet a real threshold.                                                                                                                                               |
| Under-console hatch and C-LAD | Hatch r 1 at the axis; 4 × 4 × 4 compartment below the lower deck, ladder 4 NU long        | Described [S05, S13]; geometry design                                           | Directly under the console and on the rotor axis. It is a separate opening, anchor and edge (B06 ladder) from the lower-wall exit (B05).                                                               |
| Railings                      | Height 1.1                                                                                 | Design (inferred)                                                               | Platform edge, gallery inner edge, bridge and both stairs. Breaks only where a stair or the bridge meets the edge.                                                                                     |

The ~50 ft estimate [S49] is rejected because it has no measurement chain. The 1963 figures [S14] and the 2023 figures [S25] belong to other eras and are not used.

## Entrances / exits visible

| Anchor                        | Node        | Status           | Basis                                                                         |
| ----------------------------- | ----------- | ---------------- | ----------------------------------------------------------------------------- |
| `interior` / `exterior-doors` | P-EX ↔ C-M  | Seen             | One primary exterior threshold [S03, S11]                                     |
| `stair-up`, `stair-down`      | C-M         | Seen             | Several staircases, facing different directions [S03, S07]                    |
| `upper-door-1`                | C-U → C-XU  | Reported         | Secondary catalog [S13, S40]; bearing unknown                                 |
| `upper-door-2`                | C-U         | Reported         | Kept closed; destination unknown                                              |
| `lower-wall-panel`            | C-L → C-XL  | Seen (_Journey_) | Opened hexagonal panel toward deeper systems [S05, S07]                       |
| `lower-door-2`                | C-L         | Reported         | Kept closed. It may or may not be the same opening as the wall panel          |
| `console-underside`           | C-L → C-LAD | Described        | Bram's under-console access [S05, S13]; kept **separate** from the wall panel |

Door counts: reported = 4 (two upper, two lower), verified = null.

## Materials / lighting

- Dark metallic machine aesthetic in Series 7. Under Capaldi it was softened with books, chalkboards and warmer detail [S27]. Treat those as dressing overlays on the same shell.
- Blue and amber gallery lights, including chase sequences, are part of the architecture [S03].
- Inspirations Pickwoad named: the Large Hadron Collider, the cross-section of a Wellington bomber, and a mix of "steam, electronics and atomic power" [S03, S48].

## Repeated architectural motifs

- Eighteen-fold radial rhythm (ribs and rotor divisions).
- Hexagonal and circular geometry.
- A suspended, lightweight entry bridge that carries visitors _into_ the room [S03].
- Stairways facing different directions, for an Escher-like effect.

## Continuity conflicts

- Door count and bearings are unverified (bible §C, §20.2 Q1).
- It is unknown whether the _Journey_ lower panel and _The Time of the Doctor_ lower compartment are the same opening (§20.2 Q4).
- The second console room seen in _Journey_ is an echo, not a permanent extra room (§E4).

## Proposed reconstruction

Built in Execution 3 as `src/world/rooms/console/{params,describe,build}.ts`, using the describe → build pattern and checked by the spatial validator (`src/world/validate/`).

- **Origin:** a parametric shell centered on the rotor axis, with the main deck at Y = 0 NU.
- **Ribs:** 18, at 20° spacing. Uniform spacing is an assumption.
- **Gallery and stairs:** a gallery that fully encircles the room, with two stair runs facing different directions.
- **Entry:** a lightweight bridge from P-EX.
- **Exits:** the lower-wall panel and the under-console hatch are separate anchors. The two unconnected reported doors are kept closed.
- **Capaldi dressing:** an optional overlay, not part of v1.
- **Not yet:** final materials and lighting (Ex8); the main level has no outer wall between the ribs, for legibility.

## Evidence grades

- Existence of the room, levels, ribs and console: **A**.
- The four-door report: **C**.
- Every placement and dimension: **D/E**, as design choices.

`scale = normalized_authored` throughout.

## Open questions

- How many exits are there, on which decks, and at what bearings (shot captures C01–C09, P01–P05)?
- How large is the room? A scale anchor would need an authentic plan or calibrated photographs (M01).
- Is the under-console compartment a passage or a closed bay (M05)?
