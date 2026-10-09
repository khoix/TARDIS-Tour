# Architectural proposal — one connected Tier-1 structure

This is a **design hypothesis**, not a canon floor plan. It covers only the research-labeled reconstruction of known and inferred regions. Canon itself establishes that the interior is changeable and unbounded (bible §A, §2.1). The data lives in `src/data/rooms.ts` and `src/data/connections.ts`; the reasoning for each edge is in `research/connection-decisions.md`.

## Coordinate convention (normalized, not canon)

- `+Y` is up. The time-rotor axis is at `(0, Y, 0)`, and the console main deck is at `Y = 0`.
- All lengths are in normalized units (NU), with `consoleRadiusNU = 10`. No value is ever expressed in metres.
- Within the console room, only the order of levels is known: gallery Y > main deck Y (0) > lower deck Y.
- The main exterior door sits at room-local azimuth `0°`, for bookkeeping only. All other bearings stay `null` in the topology data and are authored only in layout data.

## Regions and vertical organization

Reading down the ship:

1. **Control nexus.** The console room, with exits at the gallery and the lower deck.
2. **Cultural spine.** Reached from the gallery exit and at roughly gallery level: the human-scale H-01 loop leads to H-02 and then the library. Reserved thresholds on H-02 (observatory, pool, residential) wait for Tier 2.
3. **Maintenance spine.** Below the lower deck, reached through the lower-wall exit. The industrial M-01 serves the storeroom and the ARS. M-01 continues down to junction M-02, and the ARS loops back to M-02 through a service corridor.
4. **Power core.** Deepest. From M-02 the route descends to F-01, beneath a modeled fuel-cell level, then through antechamber E-A, the Eye chamber E-01 with its catwalk, and a transition hall. It ends at the enclosed portal vestibule E-V and the engine ENG-01.

The structure moves from inhabited spaces to more industrial and abstract machinery as it descends. That matches the build plan's goal and bible §8.4.

Execution 4 builds this as one connected greybox. Floors step down in 7-NU levels, from the cultural spine at +7 to the engine gallery at −35. Region tones (warm, steel, rust) mark the change in the overview. The tones only make the greybox legible: they are not materials and not evidence. Placements and rejected alternatives are in `research/layout-hypothesis.md`.

## Route skeleton (v1 edges)

```text
P-EX ─B01─ C-M ─B02─ C-U ─B04─ C-XU ─B07─ H-01 ─B08─ H-02 ─B09─ L-01
            │
           B03
            │
           C-L ─B06─ C-LAD (closed compartment)
            │
           B05
            │
           C-XL ─B16─ M-01 ─B17─ S-01
                       │  └─B18─ ARS-01
                      B22          │
                       │          B23
                      M-02 ────────┘
                       ├─B24─ F-01 ─B25─ E-A ─B26─ E-01 ─B27─ E-V ═B28═ ENG-01  (═ portal)
                       └─B37──────────────────────────────────────────── ENG-01  (INF-E bypass)
```

The graph has two loops. One is M-01 → ARS-01 → M-02 → M-01. The other is M-02 → … → E-V → ENG-01 → B37 → M-02, but it exists only when the portal is allowed.

With portals disabled, every placed room is reachable from C-M. The engine is five edges away via B37. Tests enforce both facts.

## Connections not directly established by primary evidence

Each connection below is tagged in the data and appears in research mode as interpretive architecture.

| Edge                    | Why it is not primary                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| B04                     | Upper door is only reported by a secondary source (C); the landing is authored.         |
| B05                     | Lower panel observed (B), but its bearing and the landing behind it are authored.       |
| B06                     | Under-console access is only described secondarily (C).                                 |
| B07, B08, B16, B22, B23 | Entirely authored corridors (INF-D).                                                    |
| B09, B17, B18, B25, B27 | Reachability rests on edited scene sequences; the junctions and spans are authored (D). |
| B24                     | A spoken vertical relation ("beneath the fuel cells"); the connector form is authored.  |
| B37                     | Project-authored engine bypass (INF-E), with no evidence at all.                        |

The **directly supported** edges are B01, B02 and B03 (main entry and console stairs), B26 (the antechamber-to-Eye sequence), and B28 (the portal, which is excluded from connectivity).

## Known architectural conflicts and how they are handled

| Conflict                                                                  | Handling                                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The four reported inner doors are unverified (§C, §20.2)                  | Two are connected and two are modeled closed. Counts are stored as reported = 4, verified = null. |
| Lower panel vs under-console compartment (§12.2)                          | Kept as separate anchors (B05, B06).                                                              |
| Library floor count, five vs six (§12.11)                                 | `floorCount = null`; the default is a parameter documented as a design choice.                    |
| Clara's observatory → pool → library order (§E4)                          | H-02 preserves the order; no door-to-door adjacency is claimed.                                   |
| Eye-to-engine portal (§H)                                                 | The portal is kept as B28 in an enclosed vestibule; B37 provides the ordinary route.              |
| Echo console rooms (§E4)                                                  | Not modeled. They are an `echo` state, not permanent rooms.                                       |
| ARS door disappearance (§12.4)                                            | Recorded as `reconfiguring` in `observedStates`; the default snapshot is `stable`.                |
| 2013 pool vs 1978 pool, 2013 Eye vs 1996 Eye                              | Treated as separate era variants. Neither is merged into the 2013 snapshot.                       |
| Storeroom placement: §17 (maintenance) vs Appendix L §5.3 (cultural side) | Follows §17. Both are inference.                                                                  |
| Officially named aquarium, zoo and garage                                 | Inventory reservations only (X-01 to X-03), never drawn floating.                                 |

## Acceptance (bible §F4) mapped to tests

| Bible check                                                                           | How it is tested                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Status                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data: valid endpoints and source-linked existence                                     | `tests/data/integrity.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Active                                                                                                                                                                                                                    |
| Topology: BFS from C-M with B28 disabled reaches all placed nodes                     | `tests/navigation/connectivity.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                        | Active                                                                                                                                                                                                                    |
| Mesh: a walk through real openings reaches the engine via B37                         | Spatial validator over the whole placed map (`tests/world/skeleton.test.ts`). The walk from C-M with portals disabled reaches every placed room, reaches ENG-01 only through B37, and agrees with the graph.                                                                                                                                                                                                                                                                   | Active (Ex4)                                                                                                                                                                                                              |
| Spatial: no room-volume overlaps, disconnected corridor ends or floor-to-wall clashes | Validator rules `volume-overlap` (rooms and passages), `dangling-end`, `path-supported`, `element-lands` and `surface-disjoint`, run over the whole map                                                                                                                                                                                                                                                                                                                        | Active (Ex4)                                                                                                                                                                                                              |
| Visual: every physical connection visible or retrievable through cutaway              | Every v1 edge is built as structure, and no box or connector bar remains (`tests/world/skeleton.test.ts`, `tests/world/skeletonBuild.test.ts`). `e2e/overview.spec.ts`: every placed room is selected by a real click, C-LAD once the section clip (stop −8) exposes it. The default camera-facing wall cut opens the near side of every room and corridor (`tests/systems/visibility/`, `e2e/cutaway.spec.ts`). No floating rooms: every room is reached on foot (validator). | Active (Ex6) for rooms. Edges hidden behind another room (the far leg of B37 behind the Eye chamber) are exposed by focusing an end room (ENG-01 or M-02 for B37), which ghosts the rest; that is not E2E-tested per edge |
| Provenance: no metric scale asserted                                                  | Data tests and `tests/world/console.test.ts` (no metric units in `src/world`); the integrity scan also covers `src/data/paths.ts`                                                                                                                                                                                                                                                                                                                                              | Active                                                                                                                                                                                                                    |
