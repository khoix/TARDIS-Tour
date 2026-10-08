# Layout hypothesis

This is a **design hypothesis**, not a canon floor plan. Every placement in `src/data/layout.ts` is `placementBasis: 'design'`, in normalized units (NU, `consoleRadiusNU = 10`), with no metric values. Topology and evidence stay in `src/data/rooms.ts` and `src/data/connections.ts`; this file records why each room sits where it does.

## Status: provisional (Execution 2)

The Execution 2 values are crude bounding boxes that make the v1 topology navigable. Execution 4 replaces the values (not the code) with the final layout, grown outward from the console, and records rejected alternatives per room here.

## Constraints applied

- The rotor axis is at the origin and the console main deck is at `Y = 0` (research/architecture-proposal.md).
- Only the order of the console decks is known: gallery (`Y = 7`) > main (`Y = 0`) > lower (`Y = −7`). The gap sizes are authored.
- The cultural spine sits at or above gallery level, the maintenance spine below the lower deck, and the power core deepest. `tests/data/layout.test.ts` enforces this.
- Volumes do not overlap, so every room keeps a pickable surface.
- The main exterior door is at room-local azimuth 0°, authored as `+Z`. All other bearings are authored, not surveyed.

## Placements

| Room   | Floor centre (NU) | Box (W×H×D) | Rationale                                                                                                |
| ------ | ----------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| C-M    | (0, 0, 0)         | 20×6×20     | Main deck on the rotor axis; diameter = 2 × console radius.                                              |
| C-U    | (0, 7, 0)         | 24×5×24     | Gallery above the main deck, wider than it so it reads as a ring around the vault.                       |
| C-L    | (0, −7, 0)        | 20×6×20     | Lower technical deck directly below the main deck.                                                       |
| P-EX   | (0, 0, 14)        | 4×6×4       | Exterior threshold on the authored 0° (`+Z`) bearing, at main-deck level (B01 is a doorway).             |
| C-XU   | (−16, 7, 0)       | 4×4×4       | Gallery exit on the west side, toward the cultural spine (B04).                                          |
| C-XL   | (16, −7, 0)       | 4×4×4       | Lower-wall exit on the east side, toward the maintenance spine (B05); kept apart from C-LAD (§12.2).     |
| C-LAD  | (0, −12, 0)       | 4×4×4       | Ladder compartment directly beneath the console (B06 is vertical). Hidden in the overview until cutaway. |
| H-01   | (−30, 8, 0)       | 14×4×4      | Human-scale corridor running west from the gallery exit, slightly above gallery level.                   |
| H-02   | (−30, 8, −18)     | 4×4×16      | Turns north off H-01 toward the library; Tier-2 thresholds are reserved on it.                           |
| L-01   | (−30, 8, −38)     | 16×20×14    | Tall shell at the end of the cultural spine; the height is a parameter, not a five- or six-storey claim. |
| M-01   | (30, −14, 0)      | 14×4×4      | Industrial corridor east of, and below, the lower-deck exit.                                             |
| S-01   | (30, −14, 12)     | 8×5×8       | Storeroom off M-01 (follows §17 maintenance placement; Appendix L §5.3 cultural-side alternative noted). |
| ARS-01 | (44, −14, −14)    | 10×18×10    | Very tall chamber off M-01; its height rises past the lower deck while its floor stays in maintenance.   |
| M-02   | (30, −24, −14)    | 6×4×6       | Junction one level below M-01, closing the M-01 → ARS-01 → M-02 loop (B22, B23).                         |
| F-01   | (30, −34, −30)    | 4×4×14      | Service tunnel descending north from M-02 (B24 stairs); the fuel-cell level above it arrives in Ex4.     |
| E-A    | (30, −34, −44)    | 6×5×6       | Sealed antechamber at the end of F-01, before the Eye.                                                   |
| E-01   | (30, −38, −62)    | 20×14×20    | Large contained hazard volume beyond the antechamber.                                                    |
| E-V    | (12, −34, −62)    | 6×5×6       | Enclosed portal vestibule off the far side of the Eye catwalk (B27); holds the B28 portal.               |
| ENG-01 | (−8, −46, −62)    | 20×18×20    | Deepest volume, reached by B37 (INF-E) from M-02 with portals disabled, or by the B28 portal from E-V.   |

## Connectors

In the prototype, each v1 edge is drawn as axis-aligned legs between the rooms' walking points (floor + 1 NU): along X, then Z at the source level, then Y at the destination (`src/scene/topology.ts`). These are crude stand-ins. Execution 4 replaces them with authored waypoints in `src/data/paths.ts` that end on door anchors.
