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

All of these are normalized design values, set in later executions:

- shell radius (`consoleRadiusNU = 10`);
- deck heights;
- gallery width;
- stair rise and run;
- console and rotor sizes;
- door bearings, except the main exterior door, which is placed at room-local `0°` purely as a bookkeeping convention.

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

- **Origin:** a parametric shell centered on the rotor axis, with the main deck at Y = 0 NU.
- **Ribs:** 18, at 20° spacing. Uniform spacing is an assumption.
- **Gallery and stairs:** a gallery that fully encircles the room, with at least two stair runs facing different directions.
- **Entry:** a lightweight bridge from P-EX.
- **Exits:** the lower-wall panel and the under-console hatch are separate anchors. The two unconnected reported doors are kept closed.
- **Capaldi dressing:** an optional overlay, not part of v1.

## Evidence grades

- Existence of the room, levels, ribs and console: **A**.
- The four-door report: **C**.
- Every placement and dimension: **D/E**, as design choices.

`scale = normalized_authored` throughout.

## Open questions

- How many exits are there, on which decks, and at what bearings (shot captures C01–C09, P01–P05)?
- How large is the room? A scale anchor would need an authentic plan or calibrated photographs (M01).
- Is the under-console compartment a passage or a closed bay (M05)?
