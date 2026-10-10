# TARDIS Interior — Verified Research Bible and Model Evidence Specification

**Edition:** 2.0 — documentary verification closure (7 October 2026)  
**Canonical baseline:** The Doctor's TARDIS, Michael Pickwoad console-room configuration (2012–17), with explicitly labeled cross-era room variants.  
**Research boundary:** Publicly accessible television descriptions and transcripts, production-designer testimony, public set images, licensing metadata, location reporting, BBC/Doctor Who releases, published historical blueprints, and contemporary reference books **only where their actual content was inspectable**.  
**Deliverable status:** **Ready for research-labeled architectural reconstruction; not ready for claims of exact 2013 dimensions or one definitive canon floor plan.**

> **Authoritative reading rule:** Sections **A–K** below are the verified current specification. The full earlier v1.1 research/audit follows in **Appendix L**, preserved for detailed room descriptions and research history. When there is a conflict, this v2.0 section supersedes an older claim. A phrase in a transcript's *stage directions* is not the same as an actor's spoken line or a published construction drawing.

## A. What can legitimately be considered complete

The program's observable interior is not finite, static, or consistently positioned. Official Doctor Who descriptions explicitly characterize the ship as containing a seemingly infinite number of rooms and changing its spatial routing [S01, S02]. There is therefore **no discoverable, unique, complete map** of its interior. Nor can an internet-only survey establish what is contained in unpublished production drawings or unaudited frames of every episode.

This document closes the **public documentary** portion of the research as far as substantiated material in this audit allows. It provides:

- A cross-era inventory distinguishing **directly seen rooms**, **spoken/officially stated rooms**, and **inferred designs**.
- Independent evidence classifications for **existence**, **appearance**, **dimensions**, **thresholds**, **routes**, **topology**, and **era-specific state**.
- Verified features for a 2012–17 console-room reconstruction, but **no fabricated metres**.
- A first-build physical route graph in which **all visible Tier-1 rooms can be connected using authored architecture**, including a physically ordinary bypass of the special engine portal.
- Modeling constraints, source URLs, rejected extrapolations, and clearly identified conditions that would justify a future revision.

**No open-ended public-source research phase is mandatory before prototyping.** High-fidelity scene reconstruction requires access to full legally obtained footage, measured production plans, or calibrated multi-angle images; those are **asset/access-dependent improvements**, not hidden tasks for the implementation agent to resolve by guessing.

## B. Formal evidence grades — do not collapse these

Use separate evidence axes for every room and connection:

| Axis | Allowed values | How to interpret |
|---|---|---|
| `presence` | `seen_on_tv`, `spoken_on_tv`, `official_stated`, `licensed_expanded`, `design_only`, `uncertain` | TV appearance is stronger than a derived fandom index, but `official_stated` **does not** guarantee the room was filmed. |
| `appearance` | `frame_reviewed`, `production_still`, `reconstructed_reference`, `verbal_only`, `unknown` | This audit directly examined multiple reference photos of the **2012–17 console set**, but not a complete frame survey of each episode. |
| `scale` | `original_plan`, `photogrammetrically_calibrated`, `historical_reconstruction`, `normalized_authored`, `unknown` | Claim physical dimensions **only** for the correctly matched era and a cited source. |
| `connection` | `continuous_visible_traversal`, `shown_threshold`, `spoken_route`, `edited_sequence`, `general_reachability`, `inferred`, `portal` | Ordered scenes are not proof that rooms share an immediate wall. |
| `state` | `stable`, `reconfiguring`, `damaged`, `jettisoned`, `deleted`, `archived`, `echo`, `restored`, `historical_variant` | A historical disappearance is not an assertion the room never returns. |

**Geometry-grade rule:** a room may be **A-rated for existence** and **unmeasured for geometry** simultaneously. Never use one blended confidence score for both.

**Source independence rule:** two web pages reproducing the same transcript are one textual witness, not two independent measurements. Secondary captions describing something “six stories tall” can disagree; don't resolve a count by polling summaries. See [S05, S06].

## C. Definitively usable facts for the 2012–17 console-room shell

The 2012 control room was designed by Michael Pickwoad for *The Snowmen* [S03, S04]. Designer testimony and later independent reporting support:

1. **Eighteen main perimeter ribs.** The number was deliberately chosen. These sweep from lower structure to the upper vault and create the room's architectural skeleton [S03, S04].
2. **Multiple accessible height zones** including a central/main console deck, an upper perimeter gallery, and a lower technical area; physical stairs and landings connect these areas [S03–S06].
3. **Central hexagonal console, time-rotor column, and a contra-rotating overhead assembly** whose divisions echo the ribs [S03, S05].
4. **Actual walkability.** A firsthand visitor to the filming set reports using the staircases and departing through one of its lower doorways used to represent access toward further TARDIS corridors [S07].
5. **Control-room panorama reference:** BBC Studios' official 2013 article points to an interactive Google Street View interior, independently described as navigable down into the lower control-room area. The **historical tour existed**; these sources do not prove that its original Street View interface continues to work in 2026 [S08–S10].
6. **Openly licensed detailed photographs:** multiple images of the 2013–14 set provide repeatable views, including [S11, S12]. The Lewis Clarke image has original 4,288×2,848 resolution, Nikon D5000 EXIF, 18-mm focal length / 27-mm 35-mm equivalent, and an explicit CC BY-SA 2.0 license [S11]. These are **scale-free images**, not construction drawings.
7. **Capaldi dressing changes** (e.g. shelves and chalkboard) should be modular overlays, not a second building shell [S04, S06].

**Still unverified:** overall diameter, absolute floor-to-floor heights, exact rotor-ring radius, complete door count, door angular bearings, and actual stair-rise measurements. A secondary catalog describes **four internal doors, two upper and two lower**, but the full arrangement has **not** been independently counted against a complete set survey; store `reported=4`, `verified=null` [S13]. The 18 ribs **do not prove** that each gap has an identical angle or doorway.

**Prohibited scale substitutions:** the 1963 Brachacki console's documented/reconstructed 84-inch overall width, 42-inch height, 140-inch floor plate, or 13 ft 5 in × 10 ft 6 in entrance wall [S14] and references to large 2023–25 sets [S25] **must not be used as Pickwoad-era dimensions**. A 2012 TARDIS Builders administrator reported that they were asked not to publish dimensioned plans of modern props [S15]; this is a *publication restriction*, not evidence that no authentic plan exists.

### C.1 Measurement register — authoritative build inputs

| Feature | Defensible value | Measurement state | Build instruction |
|---|---|---|---|
| Main structural ribs | **18** | Verified count | Repeat around shell; placement still survey-dependent. |
| Full console room | **At least three elevation zones** | Verified qualitatively | Main deck, upper gallery, lower technical area. |
| External entrance | **One primary exterior threshold in this configuration** | Seen / standard | Use room-local azimuth `0°` as an **authored convention**, not filming datum. |
| Main console | **Hexagonal** | Screen/design supported | Centered on rotor axis; unknown size. |
| Upper rotor | **Counter-rotating elements, 18-fold decorative division** | Designer described | Ring geometry/operation separate from supports. |
| Inner doors | **Multiple; reported four** | Provisional count | Do not lock exact positions in schema. |
| Under-console compartment | **Exists** | Screen/reference supported | Treat separately from wall-panel access. |
| Lower wall opening to deeper passages | **Exists in *Journey* reconstruction sources** | Strong scene, bearing unresolved | Distinct room-local aperture. |
| Room width / height | **No verified metric length** | Unknown | Use normalized units / parametric factors, not labelled metres. |
| Gallery / lower height offset | **Nonzero, sign known** | Partial order | `galleryY > mainY > lowerY`; values authored. |
| Radius/angle/steps | **Unmeasured** | Unknown | Save as parametric design choices with `evidence: inferred`. |

### C.2 Legitimate quantitative historical measurements (another era ONLY)

A meticulously documented reconstruction of the **1963 Peter Brachacki** studio interior draws on published BBC/Radiotimes sketches: one console plan specifies 84 in overall width and 42 in console height (not including its central column); a later analysis states a 140 in hexagonal floor plate and a documented entrance-wall section 13 ft 5 in wide by 10 ft 6 in tall [S14]. These are historically useful **reconstructed/set-plan figures**, not 2013 dimensions. Distinguish intended drafting from what actors actually worked with, since the source documents construction changes.

## D. Cross-era inventory — coverage and geometry truth table

The list is **a closed inventory of the specifically identified major spaces in these sources**, not a claim to know every room ever alluded to across the franchise. TV **seen** (`S`) and TV **mentioned** (`M`) are separate. A “TV scene” reference without direct full-film review means **transcript/still corroboration**, not independent frame calibration.

| Site / room | Best witness | Status | Geometry basis | Modeling disposition |
|---|---|---|---|---|
| Central/main console rooms, multiple designs | Series, official profile [S01] | S | Extensive on-screen/set imagery, era-specific | 2012–17 control shell first; other eras distinct assets. |
| 1963–64 lounge, food machine, fold-out sleeping bays | *The Edge of Destruction*, early room gallery [S16] | S | TV reference + historical set reconstruction | Separate historical domestic cluster. |
| Early science annex / side room | *The Web Planet*, early room gallery [S16] | S (secondary still verification) | Partial photos; exact footprint unknown | **Added** to inventory; not a generic console part. |
| Early wardrobe / costume room | *The Web Planet* [S16, S17] | S | Historical stills | Distinct era variant. |
| Space-time visualiser | *The Chase* [S16] | S (device); standalone room uncertain | Device visible, door adjacency unsettled | Avoid invented room. |
| Second Doctor power room/corridors | *The Mind Robber* [S17] | S | Briefly depicted | Ship power area valid; **Land of Fiction** library excluded. |
| Boot cupboard / sitting room | *The Masque of Mandragora* [S17] | S | Brief filmed appearance | Historical branch. |
| Second wooden control room | *The Masque of Mandragora* [S17] | S | Distinct wooden control room | Separate archive-era model. |
| Workshop | *The Invasion of Time* [S18] | S | Technical area on screen; dimensions absent | Physical tech zone. |
| Sickbay / curtained ward | *The Invasion of Time* [S18] | S | Seen, corridor connection | Medical branch. |
| Swimming pool / “bathroom” | *The Invasion of Time*; 2013 glimpse [S18, S05] | S | Two era-specific appearances | Pool location/shape separate by era. |
| Art gallery disguising ancillary power unit | *The Invasion of Time* [S18] | S | Hidden functional space | One room with art & power roles; not two adjacent rooms. |
| Multiple numbered storerooms (23A, 14D, etc.) | *The Invasion of Time* [S18] | S, M numbers | Repeated filming locations | Don't interpret identifiers as floor counts. |
| Service tunnels, Blue Section 25, stairs / failed lift | *The Invasion of Time* [S18] | S tunnels/stairs; M lift | Named navigational features | Modular corridor kit and reserved shaft. |
| Cloister Room (ivy/roundels variant) | *Logopolis* [S17] | S | Historical scene | Independent from 1996 Gothic room variant. |
| Zero Room | *Castrovalva* [S17] | S; later jettisoned | Historical appearance | Track deleted/jettisoned configuration. |
| Companion bedrooms (Romana, Adric, Tegan, Nyssa, Turlough) | Classic stories [S17] | S | Multiple scene/still records | Era-specific private rooms; don't overcount reused set. |
| 1996 Gothic Cloister / Eye interface | 1996 TV movie [S17] | S | Cloister and Eye in a spatial complex | **Do not** reproduce 2013 Eye simultaneously as second fixed canonical power source. |
| 2005 multilevel wardrobe | *The Christmas Invasion* [S17] | S | Filmed stair/multi-level set | Cross-era architectural asset, separate doors inferred. |
| Kitchen and multiple bathrooms | *The Curse of the Black Spot* [S19] | M | Dialogue-only | Existence supported, physical shells entirely authored. |
| Pool/scullery/squash court 7 jettisoned | *The Doctor's Wife* [S20] | M | Dialogue-only events | Track historical `jettisoned`, not necessarily permanently absent. |
| Archived 2005-era control room | *The Doctor's Wife* [S20] | S | On-screen old console room | Historical archive; other old rooms mentioned. |
| Amy/Rory bedroom | *The Doctor's Wife* [S20] | M (room), related corridors S | Dialogue, not a reliable complete room plan | Do not claim detailed screen replica. |
| Doctor's attic | *The Shakespeare Code* [S17] | M | Dialogue-only | Optional named space. |
| Cot/mementos storeroom | *Journey to the Centre of the TARDIS* [S05, S06] | S | Strong still/scene records | Hero-room candidate. |
| Observatory (Victorian telescope glimpse) | *Journey* [S05, S06] | S glimpse; official stated [S02] | Partial opening/image | Model limited verified features; rest inferred. |
| 2013 pool glimpse | *Journey* [S05, S06] | S glimpse | Partial | Keep 1978 and 2013 visual variants distinct. |
| Grand library / Gallifreyan encyclopedia | *Journey* [S05, S06] | S | Cardiff Castle photography + VFX; level count conflicts | Tall hero room; **no definitive 5/6 storey assertion**. |
| Architectural Reconfiguration System (ARS) | *Journey* [S05, S06] | S | Large tree-like machine room | Required hero room; disappearing door is a changing state. |
| Primary fuel-cell underpass | *Journey* [S05, S06] | S | Dialogue locates route beneath cells | Assert vertical order, not a height. |
| 2013 Eye antechamber, catwalk and chamber | *Journey* [S05, S06] | S | Catwalk/doorway scenes, visual FX | Hazard chamber; bounds not verified. |
| Special engine portal & temporally frozen engine explosion | *Journey* [S05, S06] | S | Dialogue and scene | Keep portal and **explicitly authored ordinary service bypass** separate. |
| Toilet / macaroon-dispenser navigation | *The Pilot* [S21] | M | Spoken turn instructions | Valid internal route landmark, no measurements. |
| Lower substrata, wardrobe hall, karaoke buses landmark | *Spyfall, Part One* [S22] | M | Dialogue-only | Other era, not geometrically known. |
| Deck 7 | *The Husbands of River Song* [S17] | M | Spoken deck reference | **Not** proof seven contiguous modeled floors. |
| Aquarium, zoo, garage, junk room | Official ship profile [S01] | Official stated | No directly corroborated geometry from current survey | Reserve as functions, not default visible floating shells. |
| Doctor's own bedroom | Official text [S02] | **Unconfirmed possibility** | No depiction | Must remain optional/unknown. |

**Avoid false positive locations:** *The Mind Robber* Land of Fiction's library, *Silence in the Library* planetary library, and **other TARDISes** (Master/Missy/River variants) are not rooms on the Doctor's ship. Architectural inspirations are not evidence of internal spatial coordinates.

## E. In-fiction routing evidence: the maximum defensible edges

### E1 — Early era

- **Original domestic cluster:** main control space → visible internal doorway → lounge/food machine → sleeping areas. Useful direct local grouping, but studio panels shifted among stories [S14, S16].
- **1965 science annex:** connected visually to the then-main console room in *The Web Planet* reference stills; door geometry is era-dependent and not an attachment to Pickwoad's 2013 shell [S16].
- **1976 wooden console sequence:** in *The Masque of Mandragora*, corridor travel passes the boot cupboard and reaches the second control room. Order is supported; dimensions are not [S17].

### E2 — *The Invasion of Time* (1978)

Transcript-supported narrative path network [S18]:

- Main control room → storeroom 23A → further near-repeated storerooms → named service tunnel, Blue Section 25 → workshop region. **Repeated visible sets are not proof of physically identical rooms.**
- Workshop → staircase descent → swimming pool/bathroom; the Doctor says the **lift is out of order**. This verifies a route and existence of a lift concept, **not** a measured lift shaft.
- Swimming pool complex → service passage with separate door choices → sickbay entrance, whose curtained ward is shown. That branching passage should be reflected in any historical layout.
- From pool area, the Doctor gives navigational instructions to the workshop indicating a **second left and two changes in elevation**; the dialogue gives turns/elevation sequence but no distances.
- Artworks conceal an ancillary power unit. A tracer subsequently reports humans three levels below **its then-current point of observation**; record this as an event observation, *not* a fixed “all human rooms are below the gallery” rule.
- Multiple room identifiers (23A, 23B, 14D) are uttered, but their numbering convention is not demonstrated to be metric or even conventional deck order.

### E3 — *The Doctor's Wife* (2011)

- Corridors are physically navigated; the TARDIS archives old console rooms, and the damaged ship routes Amy and Rory through changing internal space.
- The Doctor expends rooms including the pool, scullery and squash court seven to escape. These names refer to **prior contents** and a one-time state; they do not establish that such rooms must still be present unchanged in a 2013 stable snapshot [S20].

### E4 — *Journey to the Centre of the TARDIS* (2013)

**Clara's thread:** storeroom → running corridors → **passes** observatory and pool features → library. This is a good **narrative ordering**, but the scene may include cuts and is not a validated series of contiguous door-to-door adjacencies [S05, S06].

**Doctor/salvagers' thread:** main control room → corridors → ARS (door can vanish) → repeated/echoing/shifted corridors → recovery/meeting → lower access toward the core → route **beneath primary fuel cells** → Eye chamber/catwalk → protective/portal approach → frozen engine region. Exact spans, relative directions, and time-varying transitions remain unknown.

**Bram's thread:** console component access → underside/lower compartment. This is not evidence that the lower compartment and the separate wall route are one passage.

**Consequence:** never derive a single permanent master corridor map by stitching all shots together. The TARDIS was explicitly **malfunctioning and reconfiguring** in this episode. Likewise, the so-called second console appearance in the episode may represent a temporal echo, not a permanent extra console hall.

### E5 — Other explicit directions

- Ninth Doctor gives Rose multi-turn directions toward the wardrobe in *The Unquiet Dead*; this proves traversable unseen corridors, **not** a precise compass bearing [S17].
- Twelfth Doctor gives direction to a toilet by a macaroon dispenser in *The Pilot*; a useful waypoint but no directly supplied dimensions [S21].

## F. Physical build topology: one continuous connected structure

**This is the *authored reconstruction graph*, not a claimed found historical blueprint.** It starts with the full v1.1 node/edge register in legacy §17 and makes one necessary physical-world correction.

### F1 — A mandatory additional ordinary edge, B37

The old graph had `B28: E-V ↔ ENG-01` as a **portal**, and therefore the engine was **not provably accessible by a wholly ordinary, physically continuous path**. Add the distinct inferred service connection:

| ID | From | To | Mechanism | Provenance | Purpose |
|---|---|---|---|---|---|
| **B37** | `M-02` fuel-cell service junction | `ENG-01` engine-region service threshold | Modeled enclosed maintenance corridor + stairs/shaft/catwalk as necessary | **INF-E: project-authored, not filmed** | Provides a physically continuous route to the engine while retaining `B28` as the special on-screen portal. |

**Never conceal the speculative status of B37.** The bypass is the minimum deliberate addition required by the user's strict connected-megastructure constraint. Every segment must have floor, enclosure, landings, apertures, and collision/clearance geometry. The original B28 may operate as an in-world TARDIS effect, but **the model must not depend on it to be connected**.

### F2 — Architectural regions

1. **Control nexus (TV-backed shell):** 18 ribs, main deck, gallery, lower technical deck, access anchors.
2. **Cultural spine (INF-D placement):** corridor loop toward library, observed glimpses to pool/observatory; connect residential wing by a real branch.
3. **Maintenance spine (INF-D placement):** storeroom, workshop/sickbay crossed historical variants, ARS, fuel cell access. Use stairs / service junctions.
4. **Core (TV-backed components, INF-D separations):** fuel tunnels, antechamber, Eye catwalk, portal area, engine; add B37 physically ordinary bypass.
5. **Quiet/medical wing (cross-era recreation):** Cloister and Zero Room as historically labeled spaces only if the chosen configuration includes them.
6. **Archive wing:** separate older console room(s), accessible through real modeled corridors if included; not a scatter of floating dioramas.

### F3 — Non-negotiable geometry invariants

1. Single connected **mesh-walkable** map from console room to every visible selected-room volume, **with all portal edges disabled**.
2. No room meshes intersect without a deliberately built opening/coupling. Show foundations, stairs, floors and walls at every junction; use clipping/fading only for visualization.
3. Main console room defines local origin `Y=0`, rotor axis `(0,*,0)`; gallery positive relative Y and lower level negative relative Y. These are **project units**, not verified metres.
4. Every doorway has a `doorAnchorId`, level, observed status, and optional unknown azimuth. Unknown reference direction must be authored later as `placementBasis='design'`.
5. Disconnected official-only spaces (aquarium, zoo, garage) stay **inventory-only** until built and physically attached. Do not show placeholder floating volumes.
6. When historical jettisoned rooms are switched on, mark them as **reconstructed/restored state**. Avoid impossible coexisting-era claims.
7. Scene transitions explicitly involving shifting/portal effects are separate from the stable-state walkable graph.

### F4 — Operational acceptance tests

These are practical validation requirements, not claims that a greybox has been built. An agent implementing the model must verify:

```text
Data: every B edge has valid endpoints; every displayed Tier-1 room has a source-linked existence record.
Topology: BFS/DFS from C-M reaches all displayed nodes after disabling every portal edge (B28).
Mesh: a floor-clearance search through real openings reaches the engine via B37.
Spatial: no unintended room-volume overlaps, disconnected corridor ends, or floor-to-wall collisions.
Visual: every physical connection is visible or retrievable through cutaway; no floating rooms.
Provenance: no metric scale asserted for the Pickwoad set without new measured evidence.
Era: restoring an archived/jettisoned room requires an explicit configuration state, not silent coexistence.
```

### F5 — Executed topology-only consistency check (7 October 2026)

A programmatic audit of legacy §17's 37 node IDs, B01–B36, and newly authored B37 verified all 37 edge IDs have existing endpoints. With **portal edge B28 disabled**, the resulting graph has **34 reachable placed nodes**, including every listed **Tier-1** location and `ENG-01`; the only three nonreachable nodes are intentionally **unplaced inventory reservations** `X-01`/`X-02`/`X-03` (aquarium/zoo/garage). Engine access uses 5 graph edges from the main console deck via B37. This **proves graph connectivity only**; it is **not** evidence that 3D corridors have been meshed, fit without collisions, or cleared for physical passage.

## G. Image and source asset inventory for further calibration

| ID | Reference | Verified properties / value | Limit |
|---|---|---|---|
| `PIC-2014-01` | Lewis Clarke, *TARDIS 2013 set.jpg*, Wikimedia Commons [S11] | Taken 29 Oct 2014; original 4288×2848; Nikon D5000, 18 mm lens; **CC BY-SA 2.0**; gallery shelves, ribs, railing, multiple level surfaces visible | Single oblique view; cannot by itself give radius/height. |
| `PIC-2013-02` | Rob Clarke, *The TARDIS Console Room (9437298228)* [S12] | 4 Aug 2013; 4320×3240 original; **CC BY 2.0**; alternative console/rib/ceiling angle | Lens/position alignment must be solved before measurements. |
| `PIC-CATALOG` | Wikimedia category *TARDIS set (2012)* [S11–S12] | Additional candidate viewpoints, each separately licensed | Confirm dates/actual set; license does not grant blanket rights to BBC trademark designs. |
| `PAN-2013` | BBC Studios official Google Street View announcement [S08] | Historical multi-position control-room panorama; contemporary reporters traversed to lower level [S09, S10] | Current panorama accessibility not verified; does **not** enter unseen passages. |
| `LIB-2013` | Cardiff Castle library film location [S23] | Filming location and real library structure documented | Castle footprint is **not** the fictional room's full VFX-extended volume. |
| `BOOK-2018` | *TARDIS Type 40 Instruction Manual*, Atkinson/Tucker/Rymill [S24] | 160 pages, published 2018; Google Books TOC locates **“Corridors of Eternity” at p. 92**, and publisher confirms floor plans | Licensed/in-universe reference; actual relevant diagrams were **not available for complete independent inspection**; never mislabel as BBC filming set plan. |
| `PLAN-1963` | Tony Farrell, documented Brachacki interior plans [S14] | Specific historic scale reconstruction | 1963 studio set only. |

**Important photographic finding:** a photograph's *camera GPS* locates the real Cardiff studio **building**, not a point in the fictional vessel. Exif focal length permits estimating camera intrinsics, but **physical reconstruction in metres also needs a known-length feature**. Multiple views without a scale reference yield shape only up to scale.

### G1 — If a licensed frame asset is made available later

Use the following exact evidence capture IDs; mark missing input `blocked_access` rather than pretending to have inspected it:

- `C01–C09`: control room perimeter, full rib index, gallery, stairs, upper/lower doors, rotor, main entry, under-console ladder vs side lower panel (legacy §12.2).
- `J01`: *Journey* cot-room threshold; `J02`: observatory glimpse; `J03`: pool glimpse; `J04`: library entrance and genuine number of visible decks; `J05`: ARS door disappearance; `J06`: fuel-cell below/above shot; `J07`: Eye doorway/catwalk; `J08`: portal to engine; `J09`: engine chamber bounded structure.
- `H01`: 1978 actual pool-to-workshop waypoints; `H02`: sickbay branching service passage; `H03`: hidden power-unit gallery; `H04`: classical-era corridor/stairs.
- `X01`: 1963 lounge/sleeping plan vs observed room; `X02`: 1976 wooden room / boot-cupboard sequence; `X03`: 1996 Eye-in-Cloister.

Every capture must list episode, version, rough or exact timecode **explicitly typed as rough/exact**, rightsholder, permitted analysis use, visible doorway identifiers, and whether the apparent architecture is physical set, redressed location, or compositing. If a library appears as 5 or 6 stories in editorial prose, **leave `floorCount=null`** until counted from actual imagery.

## H. Claim corrections / disallowed inference — final register

| Earlier potential overclaim | Final verdict |
|---|---|
| “All rooms in the TARDIS have been researched.” | **False as literally phrased**; infinite/reconfigurable fiction and unmentioned spaces prohibit exhaustive inventory. This is a comprehensive identified-evidence survey, not ontology of all rooms. |
| “Every room in the inventory was visibly filmed.” | **False**; official-only, TV-mentioned, cross-media and TV-seen classes are separate. |
| “The 2013 console room has a documented physical diameter.” | **Not verified**; no correctly dated, calibrated plan found in accessible material. |
| “Four 2013 internal doorways at confirmed bearings.” | **Four is secondary-reported; bearings and independent enumeration unverified.** |
| “The 2013 library is definitely 5 / 6 full stories tall.” | **Unresolved editorial discrepancy**; no trustworthy direct count without frames. |
| “2013 pool occupies the historic 1978 Greco-Roman shell.” | **Not established.** Same room *function*, not proof of preserved architectural geometry. |
| “1996 Eye/Cloister and 2013 Eye occupy separate permanent simultaneous rooms.” | **Not established**; they are historical depictions/configurations of a related system. |
| “The 2013 Eye chamber borders the engine directly.” | **Not established**; special portal narrative intervenes. |
| “Non-Euclidean portal counts as physically continuous default 3D corridor.” | **No**; special effect stays, add explicitly inferred regular service bypass B37. |
| “The Doctor's bedroom must be present.” | **Not confirmed**; official material cautiously says it may exist. |
| “Scullery and kitchen are definitely the same room.” | **Not established**; separate names, possibly distinct functions. |
| “Because squash court seven is named, courts 1–6 are all filmed.” | **False.** A label is not evidence of all predecessor rooms. |
| “A distinct botanical garden was filmed in 1978.” | **Not established by poolside plants**; treat as a possible interpretation, not automatic separate room. |
| “The library in *The Mind Robber* belongs to the TARDIS.” | **False**; shown library is in the Land of Fiction. |
| “Licensed reference floorplans equal actual studio layout.” | **False by default**; establish drawing provenance and whether fictional or production. |
| “The 2023 control-room scale applies to 2013.” | **False**; do not mix eras. |

## I. Verified source register, direct links and what each actually verifies

- **[S01]** Doctor Who/BBC Studios, TARDIS official character profile — names pool, library, art gallery, junk room, walk-in wardrobe, aquarium, zoo, garage; functions **only**: https://www.doctorwho.tv/characters/the-tardis
- **[S02]** Doctor Who/BBC Studios, *What is the TARDIS?* — variable routing, observatory, multiple stores, bedroom uncertainty: https://www.doctorwho.tv/news-and-features/what-is-the-tardis
- **[S03]** Michael Pickwoad 2013 designer interview republished at FilmSketchr (original BBC site not accessible to this client) — 18 ribs, gallery/access intent, rotating features: https://filmsketchr.blogspot.com/2013/02/how-michael-pickwoad-designed-doctor.html
- **[S04]** *The Guardian*, Michael Pickwoad obituary, 3 Sep 2018 — independent confirmation of Pickwoad, 18 ribs and multilevel interior: https://www.theguardian.com/tv-and-radio/2018/sep/03/michael-pickwoad-obituary
- **[S05]** *Journey to the Centre of the TARDIS*, scene-described transcription — seen destinations and route ordering, **not measured frames**: https://www.chakoteya.net/DoctorWho/33-11.htm
- **[S06]** Radio Times review / production report — pool/observatory glimpse, Cardiff Castle/VFX library, ARS and Eye; **not a dimensioned survey**: https://tollbit.radiotimes.com/tv/sci-fi/doctor-who-guide/journey-to-the-centre-of-the-tardis/
- **[S07]** Firsthand filming-set tour, Plucky Kelly, Sep 2013 — physical use of stairs, lower exit, 360° set: https://pluckykelly.blogspot.com/2013/09/journey-to-official-tardis-studio-tour.html
- **[S08]** Doctor Who/BBC Studios, official Google Street View tour announcement, 14 Aug 2013: https://www.doctorwho.tv/news-and-features/go-inside-the-tardis-with-google-street-view
- **[S09]** TechCrunch, 13 Aug 2013, firsthand report of multi-position 2013 tour, including lower deck and inaccessible corridors: https://techcrunch.com/2013/08/13/google-maps-doctor-who-tardis-easter-egg/
- **[S10]** Independent / Independent archive, 14 Aug 2013, confirms lower-level tour: https://cuttingsarchive.org/index.php/Google_Street_View_takes_a_peek_inside_the_Tardis
- **[S11]** Wikimedia Commons, Lewis Clarke licensed source photo + original EXIF: https://commons.wikimedia.org/wiki/File:TARDIS_2013_set.jpg
- **[S12]** Wikimedia Commons, Rob Clarke licensed 2013 console set photo: https://commons.wikimedia.org/wiki/File:The_TARDIS_Console_Room_%289437298228%29.jpg
- **[S13]** Doctor Who World control-room catalog — secondary claimed four inner doors / compartment descriptions: https://doctorwhoworld.org.uk/tardis-control-room
- **[S14]** TARDIS Builders, Tony Farrell, original Brachacki interior plans with 1963 plan-based measures and cautions: https://tardisbuilders.com/index.php?threads%2Fthe-original-tardis-interior-blue-prints.4825%2Fpost-55109=
- **[S15]** TARDIS Builders, administrator Sep 2012 note on modern-dimension publishing restrictions: https://tardisbuilders.com/index.php?threads%2Fmeasurements.3765%2F=
- **[S16]** The Doctor Who Site, Season 1–6 historical interiors; science annex and wardrobe in *The Web Planet*: https://thedoctorwhosite.co.uk/tardis/interior/season-1-interior/
- **[S17]** The Doctor Who Site, cross-era room gallery (fan primary-image index; not independent production plan): https://thedoctorwhosite.co.uk/tardis/rooms/
- **[S18]** *The Invasion of Time*, dialogue/scene transcript — storeroom labels, service tunnel, stair/lift, workshop, pool, sickbay, ancillary power disguise, relative three-level reading: https://tardis.guide/story/the-invasion-of-time/transcript/
- **[S19]** *The Curse of the Black Spot* transcript — kitchen and choice of bathrooms: https://tardis.guide/story/the-curse-of-the-black-spot/transcript/
- **[S20]** *The Doctor's Wife* transcript — scullery, pool, squash court 7, archived rooms, changing internal topology: https://www.chakoteya.net/DoctorWho/32-4.htm
- **[S21]** *The Pilot* subtitle transcript — toilet / macaroon-dispenser directions: https://subsaga.com/bbc/drama/doctor-who/series-10/1-the-pilot.html
- **[S22]** *Spyfall, Part One* scene transcript — lower substrata/wardrobe hall navigation: https://tardis.guide/story/spyfall-part-1/transcript/
- **[S23]** *Journey* filming history / Cardiff Castle location: https://www.shannonsullivan.com/drwho/serials/2013e.html ; independent visit: https://anadventurethroughtimeandspace.com/2014/07/28/cardiff-castle-library-february-2014/
- **[S24]** BBC Books/Penguin publishing and Google Books *TARDIS Type 40 Instruction Manual*, Atkinson, Tucker and Rymill, 2018; 160 pages and TOC: https://books.google.com/books?id=kiRtDwAAQBAJ ; publisher: https://www.penguin.co.uk/books/438778/doctor-who-tardis-type-40-instruction-manual-by-richard-atkinson/9781785943775
- **[S25]** Doctor Who Magazine #599, later-era (2023) 50-foot-high stage/rafters description; **not a 2013 length**: https://pocketmags.com/us/doctor-who-magazine/599/articles/even-bigger-on-the-inside
- **[S26]** 2018 BBC America retrospective on *Journey*: story motivation, 1978 rushed locations versus dedicated modern design: https://www.bbcamerica.com/blogs/doctor-who-10-things-you-may-not-know-about-journey-to-the-centre-of-the-tardis--1013330
- **[S27]** *The Guardian* Peter Capaldi set visit, 16 Aug 2014: books/blackboard and lower level decoration: https://www.theguardian.com/tv-and-radio/2014/aug/16/doctor-who-peter-capaldi

**Source limitation:** references involving scene-transcript bracket descriptions remain **screen-correlated summaries** rather than a fresh independent episode viewing in this research pass. Some fan sites may mirror each other's wording. The explicit program's narrative claims are stronger when supported by spoken lines; visual dimensions remain unmeasured.

## J. End-state of research and triggers for further revision

| Question | Closed outcome | Reason |
|---|---|---|
| Do a useful connected isometric TARDIS map and meaningful room dossiers exist? | **Yes — ready to implement** | Source-indexed areas, connected graph plan, 2013 structural shell constraints, evidence and optional variant systems are defined. |
| Do we know exact 2013 console diameters, stair heights and portal bearings? | **No — cannot presently verify** | No accessible original Pickwoad dimensioned plan or completed calibrated survey; photographs/panoramas alone cannot fix physical scale. |
| Do we know the real permanently fixed locations of library, pool, ARS, Eye, and engine? | **No — not authoritatively determinable** | Source changes the TARDIS layout and does not state stable coordinates. |
| Can a physical, fully connected version be authored without falsifying canon? | **Yes, as documented inference** | B37 and INF-D connectors are visible authored architecture, clearly labeled as noncanonical. |
| Has every frame from every serial been inspected? | **No** | Some materials are licensed, not online, unavailable, or never filmed; claim documentary-source closure, not universal evidentiary exhaustion. |
| Can the 2018 manual contribute if the user supplies a lawful scan/book? | **Yes** | Relevant content not fully accessible here; any added floor plan must be classified as licensed interpretive canon, not automatically a BBC studio plan. |

**Public-source research closure decision:** A further ordinary web-search sweep is unlikely to provide a defensible numerical 2013 floor plan or a canonical whole-ship fixed topology. Those unresolved claims require **new evidence of a different type**: authenticated set-design drawings, legal footage for frame surveys, a scale-calibrated photograph set, or a provided licensed manual. Mark them `blocked_by_new_evidence`, not “research still to do forever.” Future TV releases or newly published production documents can reopen this closure.

**Acceptance for the implementation agent:** Build immediately with normalized dimensions, fully real 3D connected corridors, transparent provenance, and rigorous model validation. Do not use the remaining blanks as license to invent and label them canonical. The agent should not spend its implementation budget merely reproducing this documentary survey.

## K. Final verification checklist and change ledger

- [x] Reconfirmed 18 Pickwoad ribs and qualitative multi-level geometry from production / independent secondary evidence.
- [x] Confirmed primary historical interactive panorama (2013 BBC + contemporaneous reporter) and lower-room walkability; current live playback **not confirmed**.
- [x] Verified CC license, resolution and EXIF for one high-value 2014 photograph; verified independent 2013 alternate-angle photograph.
- [x] Distinguished actual 1963 plan-based measurements from inappropriate 2013 scale substitution.
- [x] Cross-checked 1978 named locations, spoken route turns, multiple levels and art-gallery power disguise.
- [x] Confirmed that 2013 route order is not permanent adjacency.
- [x] Confirmed 2013 library level count remains unresolved in unreviewed footage because secondary descriptions conflict.
- [x] Confirmed kitchen and bathrooms are spoken TV locations, not filmed rooms with surveyed footprints.
- [x] Added early *The Web Planet* science annex and early wardrobe visual references to the inventory.
- [x] Separated 1996 Eye/Cloister from 2013 Eye variant and rejected off-ship literary libraries.
- [x] Fixed graph to offer ordinary model continuity to the engine, without reclassifying the filmed portal.
- [x] Registered 2018 book chapter *Corridors of Eternity* starting at p. 92, but did not pretend to have seen its complete plans.
- [x] Documented all nonrecoverable 2013 metric and stable-room-location unknowns and what new evidence would resolve them.

---

# Appendix L — Preserved detailed room dossiers, original research survey and audits (v0.1–v1.1)

The text below is kept intact as the detailed research and audit history from the previous Library document. Its early status markers and “next revision” notes are **historical**, not the current readiness state. **Authoritative conclusions are A–K above.** The detailed §5 dossiers, §12 scene index, §17 baseline graph, §19 data model, and §24 verification table remain useful supporting records; the new ordinary engine bypass is **B37** above.

# TARDIS Interior Research Bible

**Status:** Living research document — v1.0 (comprehensive documentary catalog; exact geometry audit open)  
**Research cut:** 2026-10-07; verification audit: 2026-10-07 (v1.0 online-source consolidation)  
**Primary reconstruction target:** The Doctor's TARDIS, with the Series 7–10 Michael Pickwoad console room as the architectural anchor  
**Purpose:** Supply evidence, room data, topology constraints, and uncertainty labels for a cohesive isometric 3D reconstruction of the TARDIS interior.

### Reader's guide

- **Research doctrine and sources:** §§1–2, 10, 12.10, 21.
- **Primary on-screen room inventory:** §§3–5; **expanded cross-era inventory:** §14.
- **Documented reachability and actual geometry evidence:** §§6, 12.2–12.6, 16.
- **Proposed physically connected stable layout (authored inference):** §§7, 12.7, 16.3, 17.
- **Detailed build-ready topology/data contracts:** §§17–19.
- **Specific measurements/frame capture tasks:** §§9, 12.8, 18.
- **Completeness boundaries, corrections, unresolved claims:** §§13, 20, 23.

**Critical caution:** This is a sourced reconstruction specification, **not an officially dimensioned, complete canonical plan**. Any corridor or permanent adjacency not clearly confirmed is marked inference; the renderer must keep all included rooms physically attached by modeled solid architecture.

> **VERIFICATION NOTE (v1.1):** The document began as a working research synthesis. §24 below audits and corrects source-dependent claims. When an original section conflicts with §24, the verified finding in §24 is authoritative. TV dialogue, episode transcription, production commentary, published-still evidence, and independently measured geometry are **different kinds of proof**. As of this audit, no frame-calibrated 2012–17 dimensional survey or published authentic master floor plan has been obtained.

---

## 1. Scope and research doctrine

This document separates **what the TARDIS is known to contain** from **what is known about the physical appearance and placement of those spaces**. Those are not the same thing.

The reconstruction should represent a plausible **stable configuration** of the Doctor's TARDIS rather than claiming to be the unique, permanent floor plan. Television establishes that the ship can reconfigure itself, shift corridors, archive control rooms, delete or jettison rooms, reroute access, and create new spaces. A cohesive 3D map is therefore an interpretation of one configuration built from the strongest available evidence.

### Evidence classes

| Code | Meaning | Modeling implication |
|---|---|---|
| **TV-S** | Space is physically seen in televised Doctor Who | Reconstruct visual geometry from frames/set research where possible |
| **TV-M** | Space is explicitly mentioned or described on television, but not clearly seen | May be included, but appearance must be designed/inferred |
| **OFF** | Affirmed by official Doctor Who/BBC material | Strong existence evidence, but not necessarily visual/topological evidence |
| **PROD** | Production drawing, production interview, set photography, filming record, or designer commentary | Strong for visual/material/set construction decisions |
| **REC** | Careful secondary reconstruction based on footage/measurements | Useful for dimensions after primary/production evidence is exhausted |
| **EXP** | Licensed prose, audio, comic, game, or other expanded-universe source | Keep separate from TV-first reconstruction unless intentionally enabled |
| **INF** | Architectural inference made specifically for this reconstruction | Must be visibly tagged as inferred in the app/research UI |

### Confidence grades

- **A — Direct:** clearly visible on screen or documented by production plans/measurements.
- **B — Strong:** official description, production commentary, or unambiguous televised dialogue.
- **C — Reconstructed:** high-quality secondary reconstruction derived from primary material.
- **D — Inferred:** required to connect known architecture coherently.
- **E — Speculative:** original design added for completeness or visual cohesion.

### Source priority

1. Televised episode footage / scripts / transcripts used to locate direct evidence.
2. Production drawings, art-department material, set photographs, and production-designer commentary.
3. Official Doctor Who/BBC descriptions.
4. Contemporary production reporting and Doctor Who Magazine/Radio Times research.
5. Dedicated reconstruction communities such as TARDIS Builders.
6. Specialist reference sites.
7. Fan wikis as discovery indexes, followed by verification against the underlying episode/source.
8. Expanded media, always labeled separately.

---

## 2. High-confidence global facts that affect the map

### 2.1 The interior is not a fixed conventional building

Official Doctor Who material describes the TARDIS as containing a seemingly infinite number of rooms and identifies it as a labyrinth of corridors and rooms. The official site also states that the front door can be rerouted to lead elsewhere within the ship. In *The Doctor's Wife*, the TARDIS says it archives old control rooms and has approximately thirty stored configurations, including rooms from its own future. In *Journey to the Centre of the TARDIS*, the ship actively changes its internal layout to impede intruders.

**Modeling consequence:** the 3D map should be labeled as a **stable reconstruction state**, not as the immutable internal geometry of the ship.

### 2.2 Physical connectedness is still a valid reconstruction goal

Although the TARDIS can alter its topology, television repeatedly depicts people walking continuously through corridors, doors, stairs, service passages, and rooms. A physically connected snapshot is therefore consistent with the fiction.

**Modeling consequence:** use ordinary continuous architecture for the default map. Reserve non-Euclidean transitions or topology changes for explicit optional features, not as a shortcut around difficult layout work.

### 2.3 Verticality is directly supported

*The Invasion of Time* depicts staircases, a nonfunctioning lift, service passages, and dialogue explicitly referring to other levels. *Journey to the Centre of the TARDIS* depicts under-console access, deep tunnels, the Eye of Harmony, and the engine-room region. The Pickwoad console room itself is a multi-level set.

**Modeling consequence:** the map should be a vertical megastructure, not mostly one floor.

### 2.4 Rooms can be deleted, jettisoned, archived, or reconfigured

*Logopolis* establishes room jettisoning; *Castrovalva* uses further jettisoning to reduce TARDIS mass; *The Doctor's Wife* depicts House deleting rooms; the same episode establishes archived console rooms; *Journey to the Centre of the TARDIS* establishes architectural reconfiguration.

**Modeling consequence:** room metadata should include `configurationStatus`, `era`, and `sourceState`, so the app can eventually represent alternate layouts without rebuilding its entire data model.

---

## 3. Verified television interior-space inventory

This table is intentionally TV-first. It distinguishes spaces that are **seen** from spaces merely **mentioned**.

| Space | Status | Key TV evidence | Visual evidence | Topology usefulness | Initial model priority |
|---|---|---|---|---|---|
| Primary control / console room | TV-S | Throughout the series | Extensive | Central anchor | **Core** |
| Secondary / wooden control room | TV-S | *The Masque of Mandragora* and subsequent Season 14 stories | Strong | Archived/control-region branch | Medium |
| Archived control rooms | TV-S/TV-M | *The Doctor's Wife* | One archived room physically entered; ~30 stated | Excellent optional archive wing | Medium |
| Generic corridors | TV-S | *The Masque of Mandragora*, *Castrovalva*, *The Doctor's Wife*, *Journey to the Centre of the TARDIS*, etc. | Extensive across eras | Essential connective tissue | **Core** |
| Service passages / tunnels | TV-S | *The Invasion of Time*; *Journey to the Centre of the TARDIS* | Strong | Industrial/deep-ship connection | **Core** |
| Staircases | TV-S | *The Invasion of Time*, *Castrovalva*, others | Strong | Vertical circulation | **Core** |
| Lift | TV-M | *The Invasion of Time* — Doctor apologizes that the lift is out of order | No clear canonical car/cab design established in this pass | Vertical circulation | Medium |
| Living/lounge area | TV-S | *The Edge of Destruction* | Strong | Habitation hub | Medium |
| Early sleeping quarters | TV-S | *The Edge of Destruction* | Strong | Residential precedent | Medium |
| Companion bedrooms | TV-S | *Earthshock*, *Terminus*, *Snakedance*, others | Strong | Residential wing | High |
| Wardrobe / costume room | TV-S | *The Christmas Invasion*; earlier wardrobe forms in classic series | Very strong for 2005 version | Cultural/residential wing | High |
| Boot cupboard | TV-S | *The Masque of Mandragora* | Brief but clear | Whimsical residential/storage branch | Low |
| Food/drink machine area | TV-S | *The Edge of Destruction* / early First Doctor stories | Clear early layout | Habitation support | Low |
| Workshop | TV-S | *The Invasion of Time* | Strong | Technical wing | High |
| Sickbay | TV-S | *The Invasion of Time* | Strong | Technical/medical wing | High |
| Swimming pool / “bathroom” | TV-S | *The Invasion of Time*; glimpsed again in *Journey to the Centre of the TARDIS* | Very strong for classic version; glimpse for 2013 version | Major destination | High |
| Art gallery / disguised ancillary power station | TV-S | *The Invasion of Time* | Strong | Power/support wing | High |
| Ancillary power station | TV-S | *The Invasion of Time* | Strong; disguised by art | Deep systems branch | High |
| Storerooms | TV-S | *The Invasion of Time*; *Journey to the Centre of the TARDIS* | Strong | Excellent connective/utility spaces | **Core** |
| Zero Room | TV-S | *Castrovalva* | Strong | Medical/sanctuary destination | High |
| Cloister Room | TV-S | *Logopolis* | Strong | Quiet/power/ritual destination | High |
| Library | TV-S | *Journey to the Centre of the TARDIS*; books also integrated into other console-room eras | Extremely strong for 2013 | Hero room | **Core** |
| Observatory | TV-S | Glimpsed in *Journey to the Centre of the TARDIS* | Limited | Hero/curiosity room | Medium |
| Architectural Reconfiguration System (ARS) | TV-S | *Journey to the Centre of the TARDIS* | Very strong | Deep technical hero room | **Core** |
| Eye of Harmony access/chamber | TV-S | 1996 TV movie; *Journey to the Centre of the TARDIS* | Strong, but radically different by era | Deep power core | **Core** |
| Engine room / central engine region | TV-S | *Journey to the Centre of the TARDIS* | Strong | Deepest Tier-1 destination | **Core** |
| Fuel-cell / fuel-rod tunnels | TV-S | *Journey to the Centre of the TARDIS* | Strong | Industrial approach to core | **Core** |
| Storage room containing the Doctor's cot | TV-S | *Journey to the Centre of the TARDIS* | Strong | Character/archive storage | High |
| Deck 7 | TV-M | *The Husbands of River Song* | Not visually established as a unique deck in this pass | Suggests formal deck numbering | Low |
| Doctor's bedroom | TV-M | *The Doctor's Wife* raises the question; official site says it may exist but has not been seen | None | Optional | Defer |

---

## 4. Officially affirmed spaces whose television geometry is not yet established in this research pass

The official Doctor Who TARDIS character page names the following as spaces in the Doctor's TARDIS: **pool, library, art gallery, junk room, walk-in wardrobe, aquarium, zoo, and garage**. The official “What is the TARDIS?” article additionally describes an **observatory, multiple storage rooms, and bedrooms for companions**.

For the build, existence and geometry should be tracked separately:

| Space | Existence evidence | TV visual geometry verified? | Recommendation |
|---|---|---|---|
| Aquarium | OFF | Not yet | Add to research queue before modeling |
| Zoo | OFF | Not yet | Add to research queue; likely large environmental region |
| Garage | OFF | Not yet | Add to research queue; potentially useful large-volume space |
| Junk room | OFF | Not yet distinguished from generic storage | Research before separate modeling |
| Observatory | OFF + TV-S glimpse | Partial | Model only after frame study |

Expanded-universe lists contain many additional rooms — gardens, botanical houses, parks, laboratories, kitchens, laundries, armouries, cinemas, galleries, various named storerooms, and more. Those should **not** be silently folded into the TV-first map. They can later form an optional “expanded canon” layer.

---

# 5. Detailed room and region dossiers

## 5.1 Pickwoad-era main console room (Series 7–10 anchor)

**Evidence:** TV-S / PROD  
**Confidence:** A  
**First appearance of this design:** *The Snowmen* (2012)  
**Production designer:** Michael Pickwoad

### Established visual/structural facts

- Real three-dimensional, multi-level space rather than a flat console-room set.
- Central hexagonal console and vertical time-rotor assembly.
- Circular/hexagonal structural vocabulary.
- Multiple levels connected by stairs and perimeter walkways.
- Upper gallery/balcony and lower technical level.
- Multiple internal doors/portals around the perimeter.
- Dark metallic machine aesthetic in Series 7; later softened by bookshelves, chalkboards, work surfaces, and warmer detail under the Twelfth Doctor.
- Production commentary says the new set was designed to provide easier access to the ship's gallery and that accessibility of the different areas was a design objective.
- Pickwoad cited the Large Hadron Collider and a cross-section of a Wellington bomber among visual/engineering inspirations. He described the TARDIS's workings as a mixture of steam, electronics, and atomic power.
- Pickwoad described the contra-rotating time rotor as a functional visual idea; the rotor rings are divided into eighteen parts, echoing eighteen structural ribs.

### Topology evidence

- Main exterior doors connect directly to the control room in this configuration.
- The room has multiple internal routes deeper into the TARDIS.
- Secondary material documents access beneath the console/through lower regions during *Journey to the Centre of the TARDIS*.
- The room is the strongest fixed anchor for the project because it has clear, measurable architecture and direct visual continuity with the episode that explores the deeper ship.

### Modeling instruction

Reconstruct this room first and treat its door positions, floor heights, stairs, central axis, and lower access as the coordinate origin for the entire map.

**Do not invent the deeper ship until the control-room shell and exits are dimensionally stable.**

---

## 5.2 Corridors — Pickwoad/Journey-era network

**Evidence:** TV-S / PROD  
**Confidence:** A for appearance; D for master layout

### Established facts

- *Journey to the Centre of the TARDIS* uses labyrinthine corridors/hexagonal tunnels as the main connective architecture.
- The TARDIS deliberately rearranges or loops corridors during the story, so the episode cannot be treated as a simple continuous tracking shot of a fixed floor plan.
- Earlier eras use different corridor languages, including roundel-lined corridors; *The Doctor's Wife* uses repeating octagonal/roundel corridor modules.

### Modeling instruction

For the Pickwoad stable-state reconstruction, derive a modular corridor kit from the *Journey* visual language but **do not copy the episode's looping topology literally**. The build requires one coherent snapshot.

Create at minimum:

- straight segment,
- 30°/45°/60° turn variants as visually appropriate,
- T-junction,
- cross-junction,
- vertical stair segment,
- service-tunnel transition,
- doorway/threshold module,
- wider “node” chamber for route branching.

---

## 5.3 Storage room / cot room

**Evidence:** TV-S  
**Confidence:** A appearance; C/D placement

### Established facts

- Seen in *Journey to the Centre of the TARDIS*.
- Contains the Doctor's cot and assorted objects/mementos, including TARDIS-related models/objects.
- Production records identify dedicated storeroom filming.

### Modeling interpretation

Use this as one of several storage spaces rather than “the” only storeroom. Earlier television already establishes multiple numbered/identified storerooms and repeated storage-like spaces.

### Placement proposal

Place near the inhabited/cultural side of the internal network, not in the deepest power-core region. Connection to the main corridor system: **INF-D**.

---

## 5.4 Library

**Evidence:** TV-S / PROD / OFF  
**Confidence:** A appearance; D placement

### Established facts

- Fully seen in *Journey to the Centre of the TARDIS*.
- Filmed partly at Cardiff Castle and augmented with visual effects to imply much greater scale.
- Cathedral-like, tall, visually distinct from the mechanical corridors.
- Contains *The History of the Time War* and liquid/voice-like Gallifreyan encyclopedic material.
- Official Doctor Who material independently affirms the library as a persistent TARDIS space.
- *The Eleventh Hour* states that after the damaged TARDIS crash, the swimming pool had ended up in the library — direct evidence that these spaces can shift/reconfigure relative to each other.

### Modeling instruction

Treat the library as a large-volume hero room connected through a threshold/anteroom from the mechanical corridor network. Do **not** force its real Cardiff Castle exterior footprint into the ship; reconstruct the fictional interior volume visible on screen.

### Placement proposal

Habitation/cultural region, moderately deep from the console room. Avoid placing it directly adjacent to the engine region unless required by future evidence.

---

## 5.5 Observatory

**Evidence:** TV-S glimpse / OFF  
**Confidence:** B existence; C/D geometry

### Established facts

- Glimpsed as Clara moves through the TARDIS in *Journey to the Centre of the TARDIS*.
- Official Doctor Who material names an observatory as one of the ship's spaces.

### Research need

A dedicated frame-by-frame visual pass is still required before detailed modeling. Current evidence is sufficient to reserve topology and volume, not to claim a faithful interior reconstruction.

### Placement proposal

Cultural/scientific branch near library or upper levels: **INF-D**.

---

## 5.6 Swimming pool / bathroom

**Evidence:** TV-S / OFF  
**Confidence:** A for 1978 appearance; B/C for 2013-era appearance

### Classic appearance — *The Invasion of Time*

- Large indoor pool.
- Decorative/classical environment with plants and statuary.
- The Doctor and Leela refer to this as a bathroom.
- Connected through the broader service-passage/stair network.
- A staircase is explicitly used while the lift is out of order.

### Later evidence

- *The Eleventh Hour* says the swimming pool fell into the library after a crash, proving movable topology.
- A pool is glimpsed in *Journey to the Centre of the TARDIS*.
- Official Doctor Who material repeatedly lists the pool as a TARDIS feature.

### Modeling instruction

For the Pickwoad-era map, do not simply transplant the 1978 Greco-Roman set. Use the 2013 glimpse as the primary era reference and the 1978 pool as historical evidence for function/scale. If visual evidence from 2013 remains insufficient, mark the room as **TV existence + inferred Pickwoad-era design**.

---

## 5.7 Architectural Reconfiguration System (ARS)

**Evidence:** TV-S / PROD  
**Confidence:** A

### Established facts

- Seen in *Journey to the Centre of the TARDIS*.
- The Doctor identifies it as the Architectural Reconfiguration System.
- It reconstructs particles according to need — effectively a machine that makes machines.
- Visually represented as a large organic/technological tree-like system bearing glowing Gallifreyan “egg”/orb components.
- Michael Pickwoad described the visual concept as resembling a banyan tree growing eggs with Gallifreyan symbols.

### Topology evidence

The episode establishes it as a discrete chamber accessible from the corridor network. Its exact permanent relationship to other rooms is unreliable because the TARDIS is actively rearranging itself during the story.

### Modeling instruction

Use as a major structural node between ordinary inhabited regions and deeper machine/power regions. That placement is **INF-D**, but thematically and functionally justified.

---

## 5.8 Eye of Harmony chamber / access region

**Evidence:** TV-S  
**Confidence:** A appearance for 2013; D permanent placement

### Established facts — 2013 interpretation

- Seen in *Journey to the Centre of the TARDIS*.
- The Doctor describes the Eye as an exploding star in the act of becoming a black hole, held in permanent decay by Time Lord engineering.
- Production records distinguish the Eye of Harmony set/effect work and an antechamber to it.
- The 2013 visual interpretation differs strongly from the 1996 TV movie version.

### Canon conflict / variation

The Eye's relationship to Gallifrey and the individual TARDIS has been portrayed differently over time. The reconstruction should not try to reconcile every depiction into one literal object.

### Modeling instruction

For the Pickwoad map, use the *Journey* version exclusively. Treat 1996 as an alternate-era representation in metadata.

### Placement proposal

Deep power-core region, reached via dedicated antechamber and hardened corridors/service tunnels. This is consistent with production evidence but exact geometry is **INF-D**.

---

## 5.9 Fuel-cell / fuel-rod tunnels

**Evidence:** TV-S / PROD  
**Confidence:** A appearance; C/D layout

### Established facts

- Production records for *Journey to the Centre of the TARDIS* identify filming in the tunnel beneath the fuel cells.
- The episode establishes dangerous fuel rods/components and deep technical passageways.

### Modeling instruction

These tunnels are valuable connective architecture between the Eye/ARS region and engine-room region. Use them to transition from normal corridors into heavier industrial geometry.

---

## 5.10 Engine room / centre of the TARDIS

**Evidence:** TV-S / PROD  
**Confidence:** A appearance; B function; D master placement

### Established facts

- *Journey to the Centre of the TARDIS* reaches the engine room at the centre of the ship.
- The damaged engine is held in a time-stasis-like state at the moment of catastrophic failure.
- Production records identify dedicated engine-room filming.

### Modeling instruction

This is the deepest required destination for v1. Build the rest of the power-core route so that reaching it feels like descending through increasingly hazardous and fundamental systems.

---

## 5.11 Zero Room

**Evidence:** TV-S  
**Confidence:** A

### Established facts

- Introduced and physically seen in *Castrovalva*.
- Large, mostly empty, polygonal space with pinkish-grey tone.
- Described as isolated from outside/random electrical and radiological influences and useful for neurological/regenerative healing.
- Reached by navigating TARDIS corridors; the Doctor explains that ordinary spaces appear on architectural configuration indicators while a proper Zero Room is balanced to zero relative to the outside universe.

### Important continuity point

The original Zero Room is later lost/jettisoned during *Castrovalva*'s events; its presence in a later-era Pickwoad map would therefore require the TARDIS to have recreated another Zero Room.

### Modeling recommendation

Include only if the project deliberately reconstructs “known recurring functions across eras,” not if v1 is restricted strictly to rooms demonstrably extant in 2013. If included, mark as **recreated/inferred continuity**.

---

## 5.12 Cloister Room

**Evidence:** TV-S  
**Confidence:** A appearance; D placement

### Established facts

- Seen in *Logopolis*.
- Ancient, contemplative-looking interior with ivy/plant growth, pillars, and seating.
- Associated in dialogue with the Cloister Bell, an emergency warning system.
- Visually unlike the main console room and provides strong evidence that TARDIS rooms need not share one design language.

### Modeling recommendation

Excellent Tier-2 hero room. Place in a quiet, isolated region with a deliberate transition from machine corridors. Exact location is **INF-D**.

---

## 5.13 Wardrobe / costume room

**Evidence:** TV-S  
**Confidence:** A for 2005 appearance

### Established facts

- Wardrobe storage is established across classic television.
- A large walk-in wardrobe is clearly seen in *The Christmas Invasion* when the newly regenerated Tenth Doctor selects clothing.
- Official Doctor Who material calls the wardrobe cavernous / walk-in and emphasizes its large collection.

### Modeling recommendation

Use the 2005 room as the clearest modern TV visual reference, but integrate it through a Pickwoad-compatible threshold/corridor. Label the direct room geometry as cross-era reuse unless a Pickwoad-era wardrobe reference is found.

---

## 5.14 Workshop

**Evidence:** TV-S  
**Confidence:** A

### Established facts

- Explicitly named and physically seen in *The Invasion of Time*.
- K9 is worked on there using equipment and components.
- The Doctor's navigation dialogue distinguishes it from storerooms and service tunnels.

### Modeling recommendation

Include as a technical/maker space in the mid-depth ship. Visual design can either reconstruct the 1978 version or create a Pickwoad-era workshop clearly labeled as **function canon / design inferred**.

---

## 5.15 Sickbay

**Evidence:** TV-S  
**Confidence:** A

### Established facts

- Physically seen and named in *The Invasion of Time*.
- Appears as a hospital-ward-like room with curtained cubicles.
- Accessed from the service-passage network during the pursuit through the TARDIS.

### Modeling recommendation

Include in a medical/habitation branch. If visually updated into Pickwoad style, retain metadata linking the known function to the classic visual source.

---

## 5.16 Ancillary power station / art gallery disguise

**Evidence:** TV-S  
**Confidence:** A

### Established facts

- Seen in *The Invasion of Time*.
- Appears as an art-lined corridor/gallery with sculpture, including the Venus de Milo and paintings.
- A concealed control reveals/disables the ancillary power system; dialogue identifies the space as the ancillary power station.
- This is direct television evidence that TARDIS utility infrastructure may be hidden behind an apparently decorative room.

### Modeling significance

This is extremely useful for a cohesive map because it justifies transitions where cultural/decorative spaces conceal deep infrastructure.

### Placement proposal

Near the power/support branch but not necessarily next to the main Eye/engine core. **INF-D**.

---

## 5.17 Storerooms and numbered levels

**Evidence:** TV-S  
**Confidence:** A existence; D complete topology

### Established facts from *The Invasion of Time*

- “Storeroom 23A” is explicitly named.
- A near-identical area is encountered again and treated as a different storeroom/level, reinforcing repetition and scale.
- The Doctor later identifies “rear area, storeroom 14D.”
- “Service tunnel, Blue Section 25” is named.
- Dialogue and navigation establish multiple levels and section naming.

### Modeling instruction

Use repeated modular storerooms as spatial buffers and routing nodes. Numbering can make the ship feel systematic without requiring us to invent hundreds of unique hero rooms.

Do not assume the numerical labels imply ordinary consecutive floors; treat them as internal TARDIS address designations.

---

## 5.18 Companion bedrooms / residential corridors

**Evidence:** TV-S  
**Confidence:** A

### Established facts

- *The Edge of Destruction* shows early sleeping quarters adjacent to a lounge/food-machine area.
- *Earthshock* shows Adric's room.
- *Terminus* shows Turlough inheriting Adric's room and separately shows the room shared by Nyssa and Tegan.
- The bedroom interiors include ordinary personal furnishings and objects, demonstrating that residential rooms can be human-scale and mundane even within the enormous ship.
- *The Doctor's Wife* establishes that Amy and Rory had a bedroom and that House could delete bedrooms while dismantling the ship.

### Modeling instruction

Create a residential branch rather than giving every companion room a unique deep-ship placement. Use a small set of physically connected corridors with room doors and model only a few historically significant rooms in detail.

---

## 5.19 Secondary / wooden control room

**Evidence:** TV-S / PROD  
**Confidence:** A

### Established facts

- Introduced in *The Masque of Mandragora*.
- Reached while the Doctor and Sarah are walking through internal TARDIS corridors.
- The Doctor explicitly calls it the second control room and says he can operate the TARDIS from it.
- Wood-paneled, compact, Victorian/Edwardian character; console lacks the usual visible time rotor and uses a desk-like form with controls concealed behind panels.
- Contains artifacts associated with prior Doctors, including a recorder and older clothing.
- Was used as the primary shooting console room for part of the Fourth Doctor era.

### Modeling recommendation

Place in an **Archive / Historical Control Rooms** region rather than as part of v1's critical route. *The Doctor's Wife* provides a later explicit mechanism for archived control rooms.

---

## 5.20 Boot cupboard

**Evidence:** TV-S  
**Confidence:** A appearance; D placement

### Established facts

- Briefly seen from the corridor in *The Masque of Mandragora*.
- Despite the Doctor's description as a boot cupboard, it resembles a large furnished drawing room and is comically oversized for its stated purpose.

### Modeling significance

Useful proof that room labels do not predict ordinary scale. Good optional environmental storytelling space.

---

## 5.21 First Doctor lounge / food-machine / sleeping-quarter cluster

**Evidence:** TV-S  
**Confidence:** A

### Established facts

Research reconstructions of *The Edge of Destruction* indicate a small connected domestic cluster immediately beyond internal doors from the control room:

- food/drink machine and lounge area,
- seating/table,
- sleeping spaces with fold-down contoured beds,
- transparent/open visual relationships between parts of the domestic area.

### Modeling significance

This is one of the rare places in television where a **direct small-scale adjacency relationship** between multiple non-control-room spaces is visible. It should be preserved as an era-specific mini-topology even if not placed directly beside the Pickwoad control room in the default configuration.

---

# 6. Known and defensible topology relationships

These are more important than mere room existence for the connected 3D reconstruction.

## Direct / strong relationships

### First Doctor domestic cluster

`Control room -> internal doors -> food/lounge area -> sleeping quarters`

**Confidence:** A/C depending on exact set-plan measurements.

### Fourth Doctor corridor / secondary control sequence

`Internal corridor -> boot cupboard doorway -> secondary/wooden control room`

The sequence is shown continuously in *The Masque of Mandragora*.

**Confidence:** A for sequence, not exact distance.

### *The Invasion of Time* internal network

Directly established components include:

`Console region -> storerooms -> service tunnels/passages -> workshop`

and routes involving:

`staircase / failed lift -> swimming pool area`

`service passage -> sickbay`

`service passage -> ancillary power station disguised as art gallery`

The episode intentionally depicts characters getting lost and revisiting similar spaces, so a precise floor plan cannot be reliably recovered from scene order alone.

**Confidence:** A for connectivity classes; C/D for exact adjacency and distance.

### *Castrovalva*

`Console region -> corridor network / junctions -> Zero Room`

Exact route is deliberately confusing due to the Doctor's condition and the scale of the ship.

**Confidence:** A for reachability; D for spatial placement.

### *The Doctor's Wife*

`Main TARDIS corridor network -> archived control room`

The TARDIS/Idris supplies directions to the room. Corridors can be altered and sealed by House.

**Confidence:** A for reachability; D for persistent placement.

### *Journey to the Centre of the TARDIS*

The episode establishes reachability among:

- main console room,
- storage/cot room,
- library,
- observatory,
- swimming pool glimpse,
- Architectural Reconfiguration System,
- Eye of Harmony and antechamber,
- fuel-cell/fuel-rod tunnel systems,
- engine room.

However, the ship is actively changing the route network during the story, and false/duplicated console-room states appear. Scene order therefore cannot be treated as a permanent floor plan.

**Confidence:** A for inclusion/reachability; D for stable master placement.

---

# 7. Proposed stable topology for the 3D project — research-informed but inferred

Everything in this section is **INF-D unless otherwise noted**. This is not canon; it is the current best architectural proposal for turning the evidence into one cohesive model.

## Region A — Control nexus

- Pickwoad main console room (**TV-S A**)
- upper gallery / perimeter circulation (**TV-S A**)
- lower technical deck (**TV-S A**)
- immediate radial corridor ring (**INF-D**)
- under-console/deep-system access (**TV-S/REC B-C**)

## Region B — Habitation and culture

Branch from an upper/mid control-nexus exit:

1. residential corridor
2. companion bedrooms
3. wardrobe
4. library
5. observatory
6. pool complex
7. optional boot cupboard / historical domestic oddities

Use generous room volumes and human-scale connective corridors.

## Region C — Technical / maintenance spine

Branch from lower console region:

1. general storerooms
2. workshop
3. sickbay crossover
4. service passages
5. ARS chamber
6. ancillary power/gallery branch

This region should be the main bridge between inhabited space and deep power systems.

## Region D — Deep power core

Descend from Region C through increasingly industrial architecture:

1. fuel-cell service tunnels
2. Eye antechamber
3. Eye of Harmony chamber
4. protected engine approach
5. engine room / centre

This route should provide the strongest sense of vertical depth.

## Region E — Quiet / isolated systems

A side branch from the technical spine:

- Cloister Room
- Zero Room or later recreated equivalent
- medical/sanctuary spaces

This prevents the contemplative rooms from feeling casually adjacent to the loud engine core.

## Region F — Archive

A controlled branch reachable from the main network:

- secondary wooden control room
- one or more archived control-room shells
- historical internal-room vignettes

This region can later support an era selector without forcing mutually incompatible console rooms into the same “current” configuration.

---

# 8. Geometry and design rules derived from the evidence

1. **Rooms may be dramatically larger than their corridor thresholds imply.** The boot cupboard joke and the overall dimensional-transcendence premise support this.
2. **Rooms do not need a uniform visual style.** Cloister Room, Zero Room, library, pool, workshop, and control rooms visibly differ.
3. **Connective architecture should provide continuity.** Use Pickwoad/Journey-era mechanical motifs as the dominant transition language for the default 2013–2017 configuration.
4. **Deep systems should become more industrial and hazardous.** This is supported by *Journey*'s fuel/engine regions.
5. **Residential areas may be ordinary and human-scale.** Classic companion rooms demonstrate this.
6. **Decorative rooms can conceal infrastructure.** The ancillary power station disguised as an art gallery is direct precedent.
7. **Repeated corridors/storerooms are canon-friendly.** Repetition and getting lost are recurring on-screen features.
8. **Vertical circulation is mandatory.** Include stairs, shafts, ramps, catwalks, and at least a reserved lift route.
9. **No “floating rooms.”** Even inferred placement should use physically visible connecting architecture.
10. **Do not use impossible geometry unless explicitly activated as a TARDIS behavior.** The baseline model should remain architecturally traceable.

---

# 9. Research gaps that must be resolved before detailed modeling

## Priority A — before v1 hero-room modeling

- Obtain/derive reliable dimensions for the Pickwoad console room, including floor heights, overall diameter, door positions, stair geometry, and lower-deck dimensions.
- Frame-study *Journey to the Centre of the TARDIS* for:
  - corridor module proportions,
  - library thresholds,
  - storage-room entrances,
  - ARS entrance/exit geometry,
  - Eye antechamber geometry,
  - fuel-tunnel dimensions,
  - engine-room approach,
  - observatory glimpse,
  - swimming-pool glimpse.
- Locate any published *Journey to the Centre of the TARDIS* map, production plan, storyboard, or Doctor Who Magazine diagram and assess whether it represents production blocking or intended fictional topology.
- Search TARDIS Builders for dimensioned Pickwoad plans and identify which measurements are direct vs reconstructed.

## Priority B — before Tier-2 expansion

- Frame-study *The Invasion of Time* for pool, workshop, sickbay, service passages, ancillary power/art gallery, stair/lift references, storerooms, and level relationships.
- Frame-study *Castrovalva* for Zero Room dimensions, corridor junctions, and transitional architecture.
- Frame-study *Logopolis* for Cloister Room dimensions and entrances.
- Frame-study *The Christmas Invasion* for wardrobe dimensions and access geometry.
- Frame-study *Earthshock*, *Terminus*, and *Snakedance* for bedroom layout and residential-corridor details.
- Frame-study *The Masque of Mandragora* for boot cupboard, corridor, and secondary-control-room adjacency.

## Priority C — official spaces without established TV geometry

Investigate the provenance of official references to:

- aquarium,
- zoo,
- garage,
- junk room.

Determine whether these originate in television dialogue, licensed media, production-era reference books, or official-site aggregation.

---

# 10. Source catalog — current pass

## Official Doctor Who sources

- Doctor Who — The TARDIS character page: https://www.doctorwho.tv/characters/the-tardis
- Doctor Who — What is the TARDIS?: https://www.doctorwho.tv/news-and-features/what-is-the-tardis
- Doctor Who — A Brief History of the Doctor's TARDIS: https://www.doctorwho.tv/news-and-features/a-brief-history-of-the-doctors-tardis
- Doctor Who — Journey to the Centre of the TARDIS episode page: https://www.doctorwho.tv/stories/journey-to-the-centre-of-the-tardis
- Doctor Who — A tour of the TARDIS with Mark Gatiss: https://www.doctorwho.tv/news-and-features/a-tour-of-the-tardis-with-mark-gatiss

## Production / design / reconstruction sources

- The Doctor Who Site — Series Seven TARDIS Interior: https://thedoctorwhosite.co.uk/tardis/interior/series-7-interior/
- The Doctor Who Site — Series One TARDIS Interior: https://thedoctorwhosite.co.uk/tardis/interior/series-1-interior/
- The Doctor Who Site — Season Fifteen–Nineteen TARDIS Interior: https://thedoctorwhosite.co.uk/tardis/interior/season-15-interior/
- The Doctor Who Site — Season Twenty TARDIS Interior: https://thedoctorwhosite.co.uk/tardis/interior/season-20-interior/
- The Mind Robber — Doctor Who TARDIS Set History: https://www.themindrobber.co.uk/tardis-set-history-console-room-design.html
- TARDIS Builders: https://tardisbuilders.com/
- FilmSketchr — Michael Pickwoad interview/design discussion: https://filmsketchr.blogspot.com/2013/02/how-michael-pickwoad-designed-doctor.html
- The Doctor Who Cuttings Archive — “Trashing the Tardis” (Radio Times archive): https://cuttingsarchive.org/index.php/Trashing_the_Tardis
- A Brief History of Time (Travel) — Journey to the Centre of the TARDIS production history: https://www.shannonsullivan.com/drwho/serials/2013e.html
- Radio Times — Journey to the Centre of the Tardis review/production notes: https://tollbit.radiotimes.com/tv/sci-fi/doctor-who-guide/journey-to-the-centre-of-the-tardis/

## Episode transcript/reference sources used to locate televised evidence

- TARDIS Guide — The Invasion of Time transcript: https://tardis.guide/story/the-invasion-of-time/transcript/
- TARDIS Guide — Castrovalva transcript: https://tardis.guide/story/castrovalva/transcript/
- TARDIS Guide — Logopolis transcript: https://tardis.guide/story/logopolis/transcript/
- TARDIS Guide — The Christmas Invasion transcript: https://tardis.guide/story/the-christmas-invasion/transcript/
- TARDIS Guide — Earthshock transcript: https://tardis.guide/story/earthshock/transcript/
- TARDIS Guide — Terminus transcript: https://tardis.guide/story/terminus/transcript/
- Chakoteya — The Doctor's Wife transcript: https://www.chakoteya.net/DoctorWho/32-4.htm
- Chakoteya — Journey to the Centre of the TARDIS transcript: https://www.chakoteya.net/DoctorWho/33-11.htm
- Chakoteya — The Masque of Mandragora transcript: https://www.chakoteya.net/DoctorWho/14-1.htm

## Discovery/index sources — verify underlying citations before treating as canonical evidence

- TARDIS Wiki/Fandom — The Doctor's TARDIS: https://tardis.fandom.com/wiki/The_Doctor%27s_TARDIS
- TARDIS Wiki/Fandom — TARDIS corridors: https://tardis.fandom.com/wiki/TARDIS_corridors
- TARDIS Wiki/Fandom — TARDIS swimming pool: https://tardis.fandom.com/wiki/TARDIS_swimming_pool
- TARDIS Wiki/Fandom — Zero Room: https://tardis.fandom.com/wiki/Zero_Room
- TARDIS Wiki/Fandom — Cloister Room: https://tardis.fandom.com/wiki/Cloister_Room
- TARDIS Wiki/Fandom — Architectural reconfiguration system: https://tardis.fandom.com/wiki/Architectural_reconfiguration_system
- TARDIS Wiki/Fandom — Eye of Harmony: https://tardis.fandom.com/wiki/Eye_of_Harmony

---

# 11. Current conclusions for the build agent

1. **The Pickwoad room remains the best primary anchor.** It is well documented, multi-level, machine-like, and directly tied to the most extensive modern exploration of the TARDIS interior.
2. **A cohesive connected map is supportable.** Television repeatedly shows continuous internal travel even though the topology can change.
3. **The most defensible v1 route is:** control nexus -> storage/service network -> ARS -> fuel/power approach -> Eye -> engine room, with library/observatory/pool branching from a cultural/habitation side of the same structure.
4. **Classic rooms should not simply be pasted into the Pickwoad era.** Their *functions/existence* may be carried forward, but any era-updated visual design must be labeled inferred unless contemporary evidence exists.
5. **Exact adjacency is the largest evidence gap.** We know many rooms are reachable; we usually do not know their permanent coordinates. The project should therefore be explicit that its connected topology is a research-driven architectural synthesis.
6. **The research document should continue to evolve independently from the build plan.** Once room dossiers stabilize, structured runtime data should be generated from this document rather than hard-coded ad hoc.

---

## Completed milestone — v0.2 goals (see §12)

These were the target outputs for the next research pass, now partly addressed through the documented spatial-evidence audit; unmeasured tasks remain open:

- Pickwoad console-room dimension sheet,
- *Journey* corridor-kit dimension sheet,
- *Journey* scene-by-scene route graph,
- frame-backed dossiers for library, ARS, Eye, fuel tunnels, engine room, storage room, observatory, and pool,
- explicit list of every connection that remains inferred after that pass.

---

# 12. v0.2 — Spatial/geometry evidence pass (7 October 2026)

> **Research stage:** Source-grounded geometry and travel observations; **not** a completed metric survey. This pass consulted production-design commentary, the contemporary set/reference gallery, timed dialogue/subtitle records, scene-described transcripts, production-history records, and a relevant reconstruction-community policy. No episode footage was directly frame-measured in this pass. Consequently, no numerical 2012–17 set dimensions are asserted as verified.
>
> **Most consequential finding:** Available sources support a three-level control chamber, 18 major structural ribs, specific lower-level accesses, multiple routes to other areas, and a partially traceable *Journey* scene sequence. They do **not** establish a unique permanent layout or publish the measurements required for a metrically faithful floor plan.

## 12.1 Evidence key extended for geometry

A *room's existence grade* must not automatically become the grade of its dimensions, connection, or position. From now on, each geometrical claim has separate fields:

| Field | Interpretation | Example |
|---|---|---|
| `geometryBasis` | What kind of geometry proof exists | `production_plan`, `measured_photo`, `screen_visible`, `text_description`, `inferred` |
| `dimensionStatus` | `verified`, `reconstructed`, `provisional`, `unmeasured` | Pickwoad main-room diameter: `unmeasured` |
| `accessStatus` | `seen_traversed`, `seen_opening`, `dialogue_asserted`, `route_reachable`, `invented` | ARS door: `seen_opening` / `dialogue_asserted` |
| `adjacencyStatus` | `continuous_shot`, `scene_sequence`, `reachable_only`, `inferred` | Pool → library: `scene_sequence`, **not** continuous-shot adjacency |
| `state` | `stable`, `damaged`, `reconfiguring`, `echo`, `time_rift`, `archived` | Duplicate console room: `echo` |
| `cameraProof` | `episode_frame`, `published_still`, `drawing`, `described_only` | Silent observatory glimpse: described, still/frame study pending |

`source` must include the actual URL and, where feasible, episode title, elapsed timestamp or frame identifier, and what precisely the source establishes. **Never convert a dimensionless photo, a quote about visual scale, or a different-era plan into a verified measurement.**

## 12.2 Pickwoad control room — new documented structural facts

**Source cluster:** [G1], [G2], [G3], [G4], [G5].

1. **Eighteen major ribs** are supported by a production-designer interview, later independent reporting, and detailed contemporary reference imagery. Pickwoad explained that sixteen made the spacing feel too broad and twenty too busy; the selected count was eighteen.
2. **Structural function matters:** ribs originate at lower structure, curve upward, and support a circulating gallery; the geometry should be a load-bearing skeleton rather than decoration glued to a cylinder.
3. **A gallery encircling the interior** was an intentional improvement over the previous difficult-to-access gallery. An ordinary physical route along the gallery is strongly supported. Pickwoad also described the arrival route as carrying visitors **into** the interior rather than leaving them perched at the room edge; the entrance-to-console bridge should appear suspended/lightweight rather than as a large opaque ramp.
4. **Several staircases and at least three usable elevation zones** are depicted/described: upper gallery, console/main entry deck, and lower technical area. Pickwoad deliberately oriented different stairways in different directions for an Escher-like impression. Do not assume equal floor-to-floor heights or invent one continuous spiral as a shortcut.
5. **Contra-rotating upper rotor rings** have 18 divisions corresponding to the ribs, with Gallifreyan markings. Make them separate transformable parts, not a static ceiling texture. The design also incorporated blue/amber gallery lights and dynamic color/chase sequences as part of the architecture, not only incidental stage lighting.
6. **Original overall set size was reportedly comparable to the preceding control-room set**, with perceived spaciousness from access to more of the volume. This is not a numerical measurement; avoid treating the visual impression as measured diameter.
7. **Hexagonal control console and lower compartments:** the six-sided console, external Police Box entrance, multiple internal doorways, and lower-level panels/compartments are clear in published reference descriptions. The lower wall includes a panel that opens toward a deeper passage associated with *Journey*.
8. **An independent secondary inventory reports four internal doorways:** two upper and two lower (in addition to the main outside doors). This is **a provisional identification**, not a verified cardinal-door survey. It needs independent image/frame confirmation before positions or exact count are locked.
9. **Sub-console panel access is distinct from perimeter exits.** A secondary reference describes an under-console ladder and lower-wall roundel/panel access. These must have separate IDs until footage demonstrates a shared passage.
10. **The room visibly changes dressing during the Capaldi years.** Treat bookshelves, chalkboards, and furniture as `eraVariant` overlays over the same basic shell; verify individual additions from their relevant episodes.

### Proposed normalized coordinate origin — implementation convention, not canon

- World up: `+Y`; central vertical time rotor: `(0, Y, 0)`.
- Main-console standing deck: `Y = 0` in an **arbitrary normalized geometry system**, *not* at physical sea level or a claimed studio height.
- Gallery: `Y = +H_gallery` where `H_gallery > 0` is **unknown**.
- Lower technical ring: `Y = -H_lower`, with `H_lower > 0` **unknown**.
- Main chamber shell: nominal centre at `(0,0,0)` and variable `R_shell`; do not fix to metres until calibrated.
- The 18 *rib index* locations are 20° apart **if they are uniformly spaced**, which remains a reconstruction assumption (18 × 20° = 360°). Do not assume identical rib profiles if reference images show asymmetry.
- Define main exterior doorway azimuth as `theta = 0°` **solely for bookkeeping**; other portal angles remain `null` until surveyed.
- Doorways, lower access and gallery apertures receive **anchored local transforms** rather than an invented world position.

### Control room elevation / footprint ledger

| Element | Confirmed / defensible | Unknown | Source / next test | Geometry state |
|---|---|---|---|---|
| Overall shell | Large ringed vault with 18 ribs | Outside radius, interior radius, roof height | [G1–G4], multi-angle photograph survey | `unmeasured` |
| Main deck | Includes main console and exterior entrance | Deck shape/width/radius and entrance elevation offset | [G2], frame survey of *The Snowmen* | `unmeasured` |
| Upper gallery | Walkable balcony/ring supported by ribs | Gallery radius, width, height, extent of continuous closure | [G1–G3] | `unmeasured` |
| Lower technical deck | Usable lower level with compartments | Floor depth, radial offset, perimeter | [G2], *The Bells of Saint John*, *Journey* | `unmeasured` |
| Stairs | More than one staircase links levels | Exact count, rise/run, endpoints, handedness | [G2], multiple episode views | `unmeasured` |
| Rotor assembly | Hexagonal central console, counter-rotating upper elements | Rotor column and console dimensions, ring radii | [G1–G3] | `unmeasured` |
| Exterior doors | One main outer-world access in this control-room layout | Door jamb placement within radial sectors and arch dimensions | [G2], *The Snowmen* | `unmeasured` |
| Internal upper portals | Multiple doors; **two** claimed by secondary index | Actual number, bearing, whether doors identical | [G6] pending TV/stills | `provisional` |
| Internal lower portals | Multiple doors; **two** claimed by secondary index | Actual number, bearing, passage endpoints | [G6] pending TV/stills | `provisional` |
| Sub-console access | Panel/compartment access and lower route described | Specific panel face, ladder depth, destination | [G2], *Journey* | `provisional` |
| Lower wall panel | Opening/hexagonal panel toward deeper passages | Bearing, elevation, measured opening | [G2], [J1] | `provisional` |

### Required control-room image captures

Capture and annotate, using legitimately accessed material, at minimum:

- `C01`: wide room from the main entry, showing console, ribs and stair placement.
- `C02`: reverse angle showing entrance architecture and upper-level doors.
- `C03`: side angle where stairs connect console deck to gallery.
- `C04`: side/low angle identifying lower-level accesses and floor drop.
- `C05`: high angle showing full gallery arc and apparent shell shape.
- `C06`: underside of console showing compartment vs lower access distinction.
- `C07`: lower wall/roundel/panel opened in *Journey*.
- `C08`: upper rotor rings, including separation and rotational planes.
- `C09`: repeated view from the Capaldi era to determine persistent shell vs redecorations.

For each: include timecode/URL, approximate camera direction, visible rib indices, door count, recognizable constant dimensions, and whether the shot was photographed on the physical set or is a composite. No numeric dimension may be marked `verified` without independently grounded scale.

## 12.3 Measurements: what is and is not available

A particularly important caution from a September 2012 TARDIS Builders exchange: a forum administrator explicitly said they had been asked **not to supply dimensioned plans of the 2005-and-later props**. This concerns public forum access, not an assertion that production drawings do not exist. It explains why classic-era console schematics are accessible but a dimensioned Pickwoad plan was not located in this pass. See [G7].

A 2022 community reply loosely estimates the Capaldi control-room set at **approximately 50 ft** across; the poster supplies no drawing or measurement chain. See [G8]. **Do not use this as a measured dimension or E0 acceptance criterion.** Store it as an external low-confidence candidate for later checking only.

Likewise, a 1963 console blueprint dimension of **84 in wide / 42 in high**, documented for *Peter Brachaki's original console*, is **not applicable** to Pickwoad geometry. See [G9].

### Dimension-recovery protocol (required before final greybox scale)

1. Find a genuine art-department plan or model turntable; if found, transcribe drawing dimensions and drawing dates first.
2. If no plan exists publicly, establish **one or more** calibrated on-set reference lengths (visible repeated platform tread, documented door/frame size, a reliably measured prop). Avoid assuming every TV door is the same standard width.
3. Collect 3–5 **different physical-set camera angles** showing the same landmarks. Identify changed focal length/perspective; do not measure from a single oblique still without correction.
4. Fit the shell/rib centres and major deck planes using a simple 3D camera calibration. Maintain the assumptions, photo URLs and residual error.
5. Cross-check scale against stairs: visible step count and plausible ergonomics can reject impossible values but do not themselves prove exact dimensions.
6. Derive minimum/maximum confidence intervals; publish `R_shell ≈ value ± error` *only once a calibration actually exists*.
7. Mark all other values `provisional` and make geometry parametric so they can be corrected without breaking connections.

**Measured values in this research revision:** **none** for the 2012–17 room. Documenting absence is preferable to counterfeit precision.

## 12.4 *Journey to the Centre of the TARDIS* — scene-by-scene spatial evidence

**Method:** Episode chronology assembled from timestamped subtitle dialogue [J1] combined with scene-labeled transcripts [J2], contemporary scene/still guides [J3] and production history [J4]. Times below are **navigational anchors**, **not** frame-verified entrance/exit cut points. Silent scenes are assigned approximate windows; their boundaries are pending direct footage review. Separate simultaneous plotlines, as the show cuts between them.

| Approx episode time | Viewpoint | Seen / described location(s) | What the evidence establishes | Adjacency strength |
|---|---|---|---|---|
| 00:01–00:03 | Doctor and Clara | Control room | The accessible initial control area before the salvage accident | `TV-S`; no deeper route |
| 00:07–00:11 | Clara / salvage group | Clara within interior passages; group through outside doors to main console | Main entrance reaches main console; Clara is elsewhere during damage | Direct entry, no forced room adjacency |
| 00:11–00:13 | Clara | Storeroom with cot/objects; corridor hazard | Cot-storage room accessible from corridor network | `route_reachable`; exact corridor unmeasured |
| 00:12–00:13 | Clara fleeing | Passes observatory and pool, then enters library | **Observed narrative route order:** corridor → observatory glimpse → pool glimpse → library | `scene_sequence`; not proven consecutive door-to-door adjacency |
| 00:12–00:13 | Salvagers | Parties split in corridor; Bram sent to console | Corridor network can route to main control room | `route_reachable` |
| 00:13–00:14 | Bram | Main console and detachable console panel | Removal of panel, distinctive console access points | On-screen action; panel not necessarily a tunnel |
| 00:14–00:16 | Gregor, Doctor, Tricky | Corridor → ARS room | ARS has accessible door, major open internal volume | `seen_opening`/`scene_sequence` |
| 00:15:50–00:16:20 | ARS group | ARS exit | Door temporarily disappears after circuit theft, then returns | **Explicit topological reconfiguration**; not a stable blocked wall |
| 00:16–00:20 | Clara; search group | Library/connecting corridors; repeatedly recognizable passages | Route looping; TARDIS deliberately makes a labyrinth | **Do not read repetition as physical loop dimensions** |
| 00:19–00:20 | Bram | Lower part of console/control room | Access/shaft-like drop associated with stripped console | Level transition; frame verify ladder/hole |
| 00:21–00:23 | Search party and Clara | Console-room echo(es) and a nearby route to Clara | Duplicate/echo rooms can appear, and characters alternate between spatial states | `echo`/`reconfiguring`; **not extra permanent console rooms** |
| 00:23–00:25 | Group reunited | Clara recovered; corridor/echo-related area | Path can reconnect by TARDIS action rather than ordinary adjacency | `time_alternation` |
| 00:25:30–00:26:10 | Doctor/group | Heading to centre; stairs and opened lower hexagonal panel | An interior stair route and hexagonal panel provide access toward deeper systems | `seen_opening`; bearing still unmeasured |
| 00:26–00:29 | Doctor, Clara, salvagers | Deep passages beneath primary fuel cells | **Explicit vertical relation**: occupied passage is below primary fuel cells | `dialogue_asserted`, strong vertical constraint |
| 00:28:30–00:29:10 | Same | Fuel rod hazard / service-tunnel network | Exposed/warping rod system affects narrow service route | `scene_sequence`; exact tunnel length unknown |
| 00:30–00:33 | Same | Engine-ward passages → Eye of Harmony chamber | Doctor identifies the Eye; group enters room with **catwalk and multiple doors/thresholds** | Eye accessible; no proof of permanent global coordinate |
| 00:33–00:36 | Same | Eye platform / temporary entrapment | Catwalk and opposing threats/doorways constrain chamber geometry | `screen_visible`; plan needs frame survey |
| 00:37:30–00:38:15 | Doctor, Clara | Apparent chasm/ravine/engine defensive region | Doctor explicitly anticipates crossing a **portal to the engine** | **Nonordinary transition**; not evidence of contiguous walk-through corridor |
| 00:38:15–00:40 | Doctor, Clara | Engine/heart of TARDIS | The engine has already exploded and is held in temporal stasis | Room/region visible; exact approach topology discontinuous |
| 00:40–end | Control room | Restored scenario | The events are reset; stable-state architecture cannot be inferred from damaged sequence | `reset` |

### Three parallel route threads — do not merge them into a single path

**Clara (approx first half):**

`console region (before impact) → damaged/unknown internal corridor → storeroom → corridor escape → [observatory glimpse, pool glimpse] → library → corridors / shifting doors → transient echo state → reunion`

**Doctor / Gregor / Tricky:**

`outside → genuine control room → search corridors → ARS → repeatedly reconfigured/looping corridors → echo console rooms → reunion → stair/hexagonal lower access → under-fuel-cell tunnels → Eye chamber → defensive/portal approach → engine`

**Bram:**

`control room → opens console casing → lower/sub-console region → attacked`; **not** an independent proof of a complete open route from the console to any specific distant room.

### What this chronology does **not** prove

- The observatory directly shares a wall/door with the pool, or the pool with the library.
- The library is below, above, or at the same level as ARS.
- All corridors visible in independent edits are segments of one fixed set.
- The Eye chamber is directly adjacent to the engine: the later portal means direct physical adjacency is specifically **not** established.
- The echo console room(s) are permanent real additional control rooms.
- A stable ship would have the same layout after the episode's damage/reconfiguration.

## 12.5 Confirmed / conditional geometry by *Journey* space

| Space | Distinctive model features anchored in sources | Access evidence | Not yet measurable |
|---|---|---|---|
| **Storeroom/cot room** | Props from Doctor's past incl. cot and toy TARDIS; shelving/storage | Clara gets into it from interior corridor; pursuit continues | Bounds, ceiling height, door position |
| **Observatory** | Large old-fashioned telescope visible in glimpse | Clara passes it while escaping | Whether fully enclosed, window positions, clear volume |
| **Pool** | Open-air/open-roof pool glimpse described by episode transcript; not evidence of an ordinary roofed shell | Clara passes it before library | Whether a literal sky, projection or open atrium; pool depth/width and number of doors |
| **Library** | Very tall ornate multi-level stacks, shelves with books and bottled encyclopedia | Clara enters after fleeing via corridors | Fictitious infinite depth; exact bays and floors. **Conflict:** secondary accounts differ on five vs six levels; count frame-by-frame |
| **ARS** | Branching tree-like mechanical mass and hanging glowing bulb/circuit elements; accessible room | Specific threshold, door vanishes when system damaged | Number of real exits, chamber plan, height |
| **Hexagonal main-network corridors** | Repeated polygonal metal ribs/panels and threshold structures | Characters run and encounter multiple branches | Segment length, cross-sectional dimensions, corner geometries |
| **Primary-fuel-cell service tunnel** | Narrow deep-ship route beneath cells and exposed hazardous rods | Group navigates after using lower console-region panel | Tunnel width and length, exact first junction |
| **Eye of Harmony antechamber** | Separate production setup is recorded | Traversed/associated with Eye sequence | Distinct shell geometry; any relationship to the main room |
| **Eye of Harmony chamber** | Bright orange star/black-hole representation; traversable catwalk; multiple thresholds | Entered during escape; group trapped with threats at doorways | Catwalk span, enclosure radius, portal location |
| **Engine region** | Chasm/portal-like defensive zone and temporally frozen explosion | Portal explicitly described before reaching engine | Literal 3D structural containment, true entrance, scale |

**Production-location warning:** the library footage used **Cardiff Castle**; the ravine/portal material used **Argoed Isha Quarry**; most other interiors were shot at **Roath Lock**. This does not mean the production sites' real-world geography, neighboring rooms or walls correspond to in-fiction TARDIS adjacency. Filming days provide an asset-identity clue, **not** a floor plan. [J4]

## 12.6 Transition and adjacency ledger — only edges with clear evidence

Each edge below is typed **before** any stable-world layout decision. `A` denotes reachability or transit strength, *not* physical distance.

| Edge ID | From → to | Evidence type | Strength | Stable 3D interpretation |
|---|---|---|---|---|
| `E-C-01` | Main exterior doors → console deck | Direct initial entry in *Journey* | A | Model actual doorway on main deck |
| `E-C-02` | Console deck ↔ upper gallery | Visible stairs/circulation, design statements | A/B | Continuous walkable staircase(s) |
| `E-C-03` | Console deck ↔ lower console ring | Multi-level access | A/B | Continuous stairs/landings |
| `E-C-04` | Console lower ring → deeper passage | Hexagonal lower panel / secondary access descriptions | B/C | Preserve separate lower exit anchor; destination TBD |
| `E-C-05` | Console casing → lower compartment | Bram's underside/console actions; secondary catalog | B/C | Model sub-console access independently; do not merge with `E-C-04` without proof |
| `E-J-01` | Corridor network → storeroom | Clara enters/leaves storeroom | B | Room doorway connected to corridor, exact junction inferred |
| `E-J-02` | Corridor network → observatory glimpse | Clara passes its opening | B | Reserve a corridor-facing observation threshold |
| `E-J-03` | Corridor network → pool glimpse | Clara passes pool space | B | Reserve a corridor-facing threshold |
| `E-J-04` | Corridor network → library | Clara arrives in library after flight | B | Hero-room access through doorway/vestibule |
| `E-J-05` | Corridor network → ARS | Gregor finds door, Doctor enters | A/B | Real opening at chamber boundary |
| `E-J-06` | ARS → temporarily impassable exit | TARDIS removes/recreates doorway | A | `reconfiguring` event, **not** fixed absent doorway |
| `E-J-07` | Lower deep access → fuel-cell service network | Group walks down toward engine and reaches under-cell tunnel | B/C | Actual descending industrial network; exact paths **inferred** |
| `E-J-08` | Service/deep network → Eye/anteroom | Characters reach Eye | B | Real antechamber + catwalk threshold; distance **inferred** |
| `E-J-09` | Engine defensive region → engine | Doctor describes portal crossing | A (non-Euclidean) | Keep portal as explicit special transition; do **not** silently draw direct regular corridor |
| `E-J-10` | Corridors → console echo(es) | Repeated alternate/echo console instances | A in damaged state | No permanent duplicated rooms in default stable structure |

### Critical correction to the original v0.1 schematic

The v0.1 shorthand `Eye → engine room` may look like a demonstrated immediate physical adjacency. **It is not.** In a defensible stable reconstruction, define:

`Eye exit → industrial transition region [INF-D] → portal/defensive approach [TV-S] → engine core [TV-S]`

This arrangement retains the source's unusual portal while providing visually connected architecture around the transition. For users requesting an entirely ordinary continuous walkable path, the app may *also* provide a physically connected **inferred service-route bypass**, clearly marked `INF-D/E`, rather than treating the on-screen portal as an ordinary door. Such a bypass is a modeling choice, not an asserted original feature.

## 12.7 Connected 3D layout that preserves the evidence hierarchy

### Construction order and constraint logic

1. Make **one real control chamber** with three connected decks, central console, 18 ribs, and gallery; retain still-unmeasured values as variables.
2. Create **named doorway anchors** for each screen-supported portal. Unknown azimuths remain unresolved; don't assign a cardinal location in research data just because the renderer needs one.
3. Connect **corridor-runway segments to the real door apertures**, not to the middle of the room bounding boxes. Build visible arch/doorway/corner geometry.
4. Embed three outlying regions **after** a scale survey: `cultural` (storage, observatory, pool, library), `maintenance` (ARS, under-fuel cells), and `core` (Eye, engine). Their topology beyond the actual door observations is `INF-D`.
5. Use **landings, stairs, shafts and service tunnels** to join elevations; don't jump directly from one box volume to another with abstract lines.
6. Use **cutaway ceiling/wall visibility** for the map view. The hidden shell/roof must still exist in the underlying mesh and construction graph, even if invisible to the viewer.
7. Treat **portal transitions and echo rooms as separate modes**. A `stable 3D` mode must be connected without depending on the damaged episode's arbitrary room-switching effects, unless an explicitly marked portal is implemented with a visually contiguous enclosed threshold.
8. Any newly inferred edge needs `reason`, `alternate`, `reviewer`, `status`, `source_refs` and an uncertainty flag, so no one mistakes it for canonical adjacency.

### Starter topology (inference explicitly shown)

```text
OUTSIDE
   |
MAIN EXTERIOR DOOR [TV-S]
   |
CONSOLE MAIN DECK [TV-S] ---stairs [TV-S]--- UPPER GALLERY [TV-S]
   |                                      |
   |                                 exit anchor(s) [TBD]
   |                                      |
   |                        CULTURAL CORRIDOR SPINE [INF-D]
   |                         |         |          |
   |                         |         |          +-- OBSERVATORY [TV-S glimpse]
   |                         |         +------------- POOL [TV-S glimpse]
   |                         +----------------------- LIBRARY [TV-S]
   |
   +---stairs [TV-S]--- LOWER RING [TV-S]--lower panel [TV-S / verify precise opening]
                                  |
                          SERVICE SPINE [INF-D]
                           |             |
                      STOREROOM      ARS CHAMBER [TV-S]
                       [TV-S]           |
                           +------ fuel-cell approach [INF-D]
                                       |
                            UNDER-FUEL-CELL TUNNEL [TV-S]
                                       |
                              EYE ANTECHAMBER [PROD]
                                       |
                             EYE CATWALK / CHAMBER [TV-S]
                                       |
                             transition hall [INF-D]
                                       |
                            DEFENSIVE/PORTAL ZONE [TV-S]
                                       |
                              ENGINE CORE [TV-S]
```

**Important:** This diagram is a **proposed build graph**, not a transcription of a filmed floor plan. Storage-room placement on the service spine and ARS on the same branch are uncertain. The user has explicitly rejected floating modules: all schematic lines in the 3D product must resolve to modeled walkable or inspectable solid architectural transitions, not abstract line segments.

## 12.8 Geometry research tasks, now ready for a second agent

These tasks are not “make plausible measurements”; they are verifiable data collection jobs:

| ID | Task | Output | Done when |
|---|---|---|---|
| `M01` | Obtain authentic dimensioned plans for 2012–17 console shell, or document access failure | Source/copyright/access ledger | A specific plan identified, or search sites logged with dates and negative result |
| `M02` | Survey 18 ribs, shell shape, gallery supports in 3+ angles | Annotated rib index diagram | Every visible rib mapped without forcing uniform placement |
| `M03` | Enumerate **all** actual console-room door openings by deck | Door register with image/timecode evidence | Count, bearings, hinge/portal geometry provisionally constrained |
| `M04` | Measure stairs and landing relationships | Elevation sheet (normalized; physical if calibrated) | All modeled levels have non-clashing circulation |
| `M05` | Capture exact open lower-wall panel and under-console ladder | Access comparison photo sheet | Whether two separate routes identified is explicitly resolved |
| `M06` | Frame-study *Journey*'s silent route shots at 00:10–00:14 | Edited shot-by-shot path spreadsheet | Storeroom/observatory/pool/library entrances and cut boundaries recorded |
| `M07` | Frame-study ARS doorway disappearance/return at 00:15–00:17 | Change-state keyframes | Door position and event state cataloged |
| `M08` | Survey corridor cross sections with repeated physical landmarks | Parametric kit ratios with uncertainty | Profile and turns supported by ≥2 independent frames |
| `M09` | Survey fuel-cell tunnel, Eye and catwalk | Section/catwalk plan | What is seen vs VFX extension distinguished |
| `M10` | Verify exact portal mechanism at engine approach | Portal adjacency memo | Canon transition classification no longer tentative |
| `M11` | Survey library levels and entrance camera angles | Library shell/stack elevations | Five-vs-six-level secondary-source discrepancy resolved |
| `M12` | Register media provenance and rights for reference stills | Asset manifest | Nothing unlicensed silently embedded in distributable app |

### Recommended room dossier extension

```yaml
room_id: console-main-2012
appearance: ["The Snowmen", "Journey to the Centre of the TARDIS"]
canonical_status: TV-S
shape_basis: screen_visible
source_refs: [G1, G2, G3, G4, G5]
metrics:
  shell_radius_m: null
  console_width_m: null
  gallery_height_m: null
  lower_deck_depth_m: null
  accuracy: unmeasured
geometry:
  major_ribs: 18
  vertical_zones: [lower_ring, console_deck, gallery]
entrances:
  - id: exterior-main
    level: console_deck
    angle_deg: 0 # local bookkeeping origin only
    evidence: TV-S
  - id: inner-upper-a
    level: gallery
    angle_deg: null
    evidence: REC # needs screen-verified door enumeration
  - id: lower-deep-panel
    level: lower_ring
    angle_deg: null
    evidence: TV-S
    verification_pending: true
inference_notes:
  - "Physical metre dimensions intentionally unavailable pending calibrated drawings or photogrammetry."
```

Do not turn this sample record into a statement that a named upper doorway has a proven position, or that the lower deep-panel is already assigned to a specific floor sector.

## 12.9 Visual and production reference sheet

The following are **links to sources**, not source images redistributed within this Markdown. Use the original publication context, especially for copyrighted BBC episode stills.

| Asset/reference | What it can establish | Rights/provenance note |
|---|---|---|
| [G2] The Doctor Who Site — full Series 7 gallery | Physical appearance of main/lower/gallery levels, consoles, stairs, varied access, *Journey* spaces | Fan-site image gallery; do not assume reuse rights |
| [G5] *TARDIS 2013 set.jpg* | High-resolution 2014 reference of the actual set | Wikimedia Commons, Lewis Clarke, **CC BY-SA 2.0**; retain attribution and ShareAlike terms |
| [G10] *The TARDIS Console Room (9437298228)* | Additional 2013 room view | Wikimedia Commons, Rob Clarke, **CC BY 2.0**; retain attribution |
| [J5] BBC official promo pictures mirrored by Doctor Who TV | Original episode photographic framing | BBC copyright, use as linked references, not unlicensed bundled assets |
| [J6] TARDIS Builders ARS thread | ARS screen grabs and reportedly BBC design-sketch trail | Attachments/community; verify artist and usage rights |
| [J4] Production history | Filming separation: Cardiff Castle library, Roath Lock studio, quarry ravine | Metadata, not a blueprint |
| [G1] Designer commentary | Qualitative structural design, 18 ribs, accessible gallery | Written account; no numeric blueprint |

**No asset was downloaded or embedded by this revision**; the project needs a separate, license-aware image-acquisition stage.

## 12.10 Source ledger added in v0.2

### Production designer / physical console room

- **[G1]** Michael Pickwoad interview, *How Michael Pickwoad Designed Doctor Who's New TARDIS*, contemporary designer remarks mirrored by FilmSketchr, 11 February 2013: https://filmsketchr.blogspot.com/2013/02/how-michael-pickwoad-designed-doctor.html . This reproduces a designer interview originally published on the BBC blog (the original BBC page is currently restricted to this research client): https://www.bbc.co.uk/blogs/doctorwho/articles/Production-Designer-Michael-Pickwoad-on-the-new-TARDIS-and-more-Part-One . Corroborates 18 ribs, gallery functionality, size comparison, materials.
- **[G2]** *The Doctor Who Site*, *Series Seven TARDIS Interior*, annotated image gallery: https://thedoctorwhosite.co.uk/tardis/interior/series-7-interior/ . Strong visual guide, but **unofficial fan site**.
- **[G3]** *The Guardian*, Michael Pickwoad obituary (3 September 2018): https://www.theguardian.com/tv-and-radio/2018/sep/03/michael-pickwoad-obituary . Independent summary of production features (ribs, tiers, rotor).
- **[G4]** *Radio Times*, “Trashing the Tardis”, 27 April 2013, preserved by Doctor Who Cuttings Archive: https://cuttingsarchive.org/index.php/Trashing_the_Tardis . Pickwoad's statements about construction, dismantling and design inspirations.
- **[G5]** Wikimedia Commons, *TARDIS 2013 set.jpg*, Lewis Clarke, shot 29 October 2014, CC BY-SA 2.0: https://commons.wikimedia.org/wiki/File:TARDIS_2013_set.jpg .
- **[G6]** *Doctor Who World*, *TARDIS control room*, later-era secondary inventory: https://doctorwhoworlduk.com/tardis-control-room . Four interior access points asserted, **not independently verified in this revision**.
- **[G7]** TARDIS Builders, *Measurements*, 11 September 2012 administrator comment about not publishing 2005+ dimensions: https://tardisbuilders.com/index.php?threads/measurements.3765/ . Avoid conflating lack of publicly shared forum measurements with nonexistence of studio drawings.
- **[G8]** Reddit, *TARDIS console room build to scale*, March 2022 unverified ~50-ft estimate: https://www.reddit.com/r/DoctorWhumour/comments/t2svaa . **Lead only. Not a verified dimension.**
- **[G9]** TARDIS Builders, *The original Tardis interior blue-prints*, 1963 Peter Brachaki console: https://tardisbuilders.com/index.php?threads/the-original-tardis-interior-blue-prints.4825/ . **Wrong era for Pickwoad metrics.**
- **[G10]** Wikimedia Commons, *The TARDIS Console Room (9437298228).jpg*, Rob Clarke, 4 August 2013, CC BY 2.0: https://commons.wikimedia.org/wiki/File:The_TARDIS_Console_Room_(9437298228).jpg .

### *Journey* episode, chronology, geometry and filming

- **[J1]** *Subsaga*, subtitle transcript with elapsed timestamps for BBC *Journey to the Centre of the TARDIS*: https://subsaga.com/bbc/drama/doctor-who/series-7-part-2/5-journey-to-the-centre-of-the-tardis.html . Timed speech anchors; silent room transitions need video check.
- **[J2]** Chakoteya, scene-labeled *Journey to the Centre of the TARDIS* transcript: https://www.chakoteya.net/DoctorWho/33-11.htm . Scene descriptions and dialogue; secondary transcription.
- **[J3]** *Creative Criticality*, Episode #245 spatial sequence discussion (6 April 2022): https://creativecriticality.net/2022/04/06/timestamp-245-journey-to-the-centre-of-the-tardis/ . Confirms observatory/pool/library sequence, but **secondary recap**.
- **[J4]** Shannon Sullivan, *A Brief History of Time (Travel): Journey to the Centre of the TARDIS*, detailed production history: https://www.shannonsullivan.com/drwho/serials/2013e.html . Gives filming schedule and identifies specialist sets/locations.
- **[J5]** Doctor Who TV, BBC promotional still gallery, 23 April 2013: https://www.doctorwhotv.co.uk/journey-to-the-centre-of-the-tardis-gallery-48101.htm . Reference photos; assume BBC image rights unless otherwise specified.
- **[J6]** TARDIS Builders, *TARDIS Architectural Reconfiguration System* thread, 28 April 2013 onward: https://tardisbuilders.com/index.php?threads/tardis-architectural-reconfiguration-system.4668/ . Production/still discovery trail, not a dimensional set plan.
- **[J7]** *BBC America / Anglophenia*, 26 March 2018, background on production and omitted companion-possessions concept: https://www.bbcamerica.com/blogs/doctor-who-10-things-you-may-not-know-about-journey-to-the-centre-of-the-tardis--1013330 . Distinguish deleted script material from on-screen rooms.
- **[J8]** Official Doctor Who story page, first broadcast 27 April 2013: https://www.doctorwho.tv/stories/journey-to-the-centre-of-the-tardis . Official episode identity and general premise.
- **[J9]** *A Brief History of Time (Travel)* and episode transcript should be paired with scene stills to resolve whether any sequence uses a constructed room, location, or visual extension.

## 12.11 Corrections / unresolved conflicts

1. **Console dimensions:** No actual Pickwoad diameter, ceiling height, main-console measurements or stair rise numbers were verified. The v0.1 “well documented” claim refers to visual/design evidence and should not be read as “dimensioned set plans located”.
2. **Upper/lower doorway count:** Secondary references assert four inner doorways; it is awaiting image-by-image verification, and the map should not commit to exactly four until completed.
3. **Library floor count:** Scene-labeled secondary transcripts differ on **five vs six ornate levels**. Avoid asserting either number until frame inspection.
4. **Library filming location:** Cardiff Castle served as the set/location; do not model a nearby real Cardiff Castle corridor as if it were definitely next to the TARDIS library.
5. **Pool/observatory/library order:** Verified at narrative sequence level via two independent descriptions, not proven door-to-door adjacency.
6. **Eye → engine:** Ordinary adjoining hallway is **not** verified. A portal is explicitly stated at the deep engine approach; keep it in the model.
7. **Console echo rooms:** Documented repeat appearances are active reconfiguration/echo effects, not evidence that permanent duplicate rooms sit beside one another.
8. **Size of the ship:** In-universe infinity/dimensional transcendence does not license arbitrary geometry disguised as “canon”.
9. **Cut scenes:** The originally proposed more expansive relics/previous-companions room is production-development material, **not** an additional fully seen canonical room.

## Historical v0.2 next-step memo — now superseded by §§13–22

Perform a true **frame-backed geometrical audit** of *The Snowmen*, *The Bells of Saint John*, *Journey to the Centre of the TARDIS*, and selected Twelfth Doctor scenes. Priority is enumerating every console exit and landing and distinguishing staging/sets/VFX. Follow with dimension calibration **only where an independently grounded scale anchor can be found**. If no such scale anchor exists, provide a reproducible normalized model with explicit uncertainty rather than an invented “exact” plan.


---

# 13. v1.0 Consolidation — scope, corrections, and criteria for completeness

**Research pass:** 7 October 2026. **Mode:** public, online documentary sources, official BBC/Doctor Who pages, production interviews, historical plan/reconstruction discussions, and scene-labeled transcripts. This is a comprehensive *documentary survey*, **not** a claim that every surviving episode frame, privately held studio drawing, or copyrighted reference book page has been physically inspected. Research findings are evidence of what a source supports, not an assertion that the source is infallible.

## 13.1 What “complete” can mean

The Doctor's TARDIS is described as possessing infinite or near-infinite room capacity, continually changing its interior configuration. A finite research document cannot enumerate rooms that writers never named, never depicted, or have not yet invented. The meaningful target is an **auditable inventory of identifiable television-established and officially affirmed spaces, with all sampled major screen-depicted spaces assigned modeling dossiers, source leads, and honest uncertainty**.

The target deliverable is therefore:

- **Room/function inventory:** known TV-seen, TV-mentioned, and official-affirmed locations, including explicitly lost/reconfigured rooms.
- **Visual geometry index:** which rooms are adequately documented for recognizable modeling versus which are names only.
- **Connectivity graph:** only grounded traversals as direct edges, additional walkable edges marked `INF` and accompanied by decisions.
- **Era/configuration separation:** historical rooms may be included as reconstructions without claiming that they coexisted unchanged in one 2013 configuration.
- **Measurements:** numbers only when a source supplies dimensions or calibration has been performed; otherwise unknowns and parametric scale.
- **Reproducibility:** sources, evidence strength, capture tasks, and a machine-usable schema for the implementer.

**Not achieved through the public research available here:** true video-frame photogrammetry for all relevant episodes; official 2012–17 dimensioned studio plans; absolute location of every room; documentary proof of a single stable map connecting all eras. No agent should present these as accomplished.

## 13.2 Corrections and important exclusions

1. **The library in *The Mind Robber* is NOT an additional TARDIS library.** That story shows the fictional realm controlled by the Master of the Land of Fiction. Its library and control room must be excluded from a Doctor's-TARDIS room catalog. The same story does briefly show the Second Doctor's **actual TARDIS power room**; that is valid. Source [N06].
2. **1996 Cloister Room and Eye of Harmony are the *same spatial complex* in the TV movie.** The Gothic cloister contains the dome, enclosure, and Eye interface. The 2013 *Journey* Eye chamber is a separate-era representation. Do not model them as two mandatory, simultaneously present power sources or claim they have the same geometry. Sources [N07], [N08].
3. **Production set footprint ≠ in-universe volume.** Published *Edge of Destruction* reconstruction gives a ~43 × 35 ft studio-plan footprint for the full 1964 set, not the ship's true permanent interior or the 2013 control room. [N09].
4. **The wardrobe seen in *The Christmas Invasion* is not the only wardrobe.** Classic versions and later references exist. A wardrobe is a recurring function whose room *design* changes; don't duplicate multiple wardrobes by default just because multiple sets existed.
5. **“Pool fell into the library” and jettisoned swimming pools are historical states.** The Doctor references loss or rearrangement. A particular appearance does not prove the room existed unchanged in all intervening versions; it can be rebuilt or reconfigured. [N01], [N05].
6. **A scullery is not identical by definition to a kitchen** and the 2011 dialogue only directly establishes the former by name. Squash court seven is named and sacrificed, **not visually surveyed**. [N01].
7. **The karaoke buses are not documented as an entire karaoke-bus room.** In *Spyfall, Part One*, the Doctor uses them as a navigational landmark before a wardrobe hall in the lower substrata; shape, purpose, and count are unknown. [N02].
8. **Space-Time Visualiser ≠ required dedicated visualiser room.** The device appears in *The Chase*, but claims of an independent permanent side room must be screened against actual episode blocking. [N10].
9. **The theatrical / movie exterior-to-interior continuity differs by era.** The bright 2023–25 console set and the 2012–17 Pickwoad chamber must be selectable era variants, not merged into one physical simultaneous control room.
10. **Technical fan schematics may be richly detailed yet partly speculative.** The fan "Time Sceptre" spatial system is a fascinating optional interpretive layer, **not proven television architecture**. It must never override camera-backed corridors and on-screen route constraints. [N15].
11. **Shada has special status.** The serial was not completed/broadcast in its originally intended 1979–80 form and exists in later reconstructions; its medical-kit directions are useful but the project must label which version was viewed. [N16].
12. **TV-set visual materials are copyrighted.** Linked screenshots used for analysis are not redistributable environment textures or reference packs by default. Modeling new geometric interpretations is different from bundling BBC stills or proprietary published plans.

---

# 14. Extended complete-as-identifiable room and place index

The following table **supplements, rather than replaces**, the primary table in §3. Entries are not assumed to be concurrently present. Source identifiers refer to §21 and earlier source catalogs. A blank/unknown metric is intentional. `TV-S` means *the specific space* is seen within the Doctor's TARDIS, not merely an object of the same type somewhere else in an episode.

## 14.1 Control, scientific, systems and infrastructure

| ID | Space or feature | Best grounded appearance/source | Classification | Geometry confidence | Stable-Pickwoad-map treatment |
|---|---|---|---|---|---|
| SYS-01 | Second Doctor power room | *The Mind Robber* (1968), scene labeled `[Power room]` [N06] | TV-S | C: brief shots / no measurements | Historical service vignette, do not assert permanent 2013 location |
| SYS-02 | Fault-locator / computer bank | Early First Doctor main control suite, *An Unearthly Child*, *The Daleks*, set reconstruction [N09] | TV-S | B/C: visible modular architecture | Early-era console furniture, not separate hero room by default |
| SYS-03 | Space-Time Visualiser station | *The Chase* (1965) [N10]; precise side-room placement requires episode review | TV-S device; distinct room **unconfirmed** | D room geography | Feature in early-era lounge/control annex only if frame-verified |
| SYS-04 | Ancillary power station behind art/gallery appearance | *The Invasion of Time* [N11] | TV-S | B for function/appearance | Tech/gallery transitional branch, cross-era reused/inferred shell |
| SYS-05 | Service passage / Blue Section 25 | *The Invasion of Time* transcript [N11] | TV-S + named | C dimensions | Include addressable service network; labels not sequential floor numbers |
| SYS-06 | Lift and stair network | *The Invasion of Time* (failed lift; stairs) [N11] | TV-M lift, TV-S stairs | D lift design | Provide reserved lift shaft; actual car design inferred |
| SYS-07 | Workshop / Demat Gun station | *The Invasion of Time* [N11] | TV-S | B appearance | Physical tech wing, with no asserted known metric size |
| SYS-08 | Console control rooms in archive | *The Doctor's Wife* [N01] | TV-S archived coral room; TV-M larger archive | A for shown room; D geography | Archive branch; retain actual one shown as scene-specific variant |
| SYS-09 | Architectural Reconfiguration System | *Journey* [J1–J8] | TV-S | B/A appearance; D placement | Major technical chamber |
| SYS-10 | Primary fuel-cell/service tunnels | *Journey* [J1–J8] | TV-S | B appearance; D distance | Connected deep ring/tunnel modules |
| SYS-11 | 2013 Eye antechamber and catwalk | *Journey* [J1–J8] | TV-S + PROD | B appearance; D placement | Separate thresholds and traverseable surfaces |
| SYS-12 | 2013 engine core and portal approach | *Journey* [J1–J8] | TV-S | B appearance; D geometry | Custom portal threshold plus **explicitly inferred** regular service bypass if needed |
| SYS-13 | Heart of the TARDIS lower compartment | *The Time of the Doctor* (2013) and Pickwoad-era inventory [G6] | TV-S / secondary scene catalog | C access, D bearing | Distinguish from ordinary lower doorway and under-console ladder |
| SYS-14 | TARDIS scanner / outer-door mechanism | Numerous console designs, eras 1963–2025 | TV-S | A design, era-dependent | Furniture/architecture of console, not independent room |
| SYS-15 | Deck 7 | *The Husbands of River Song* (2015), referenced in original pass | TV-M | E physical appearance | **Address only**, not seven invented modeled floors |
| SYS-16 | 2018 licensed manual corridors/systems | *TARDIS Type 40 Instruction Manual* [N03] | EXP/licensed reference | `not-checked` detail | Read as a supplementary interpretation, never pass off its floor plans as filmed |

## 14.2 Residence, food, clothing, health and recreation

| ID | Space or feature | Evidence | Classification | Geometry confidence | Treatment |
|---|---|---|---|---|---|
| HAB-01 | First Doctor lounge/food-machine alcove | *The Edge of Destruction*, researched set geometry [N09] | TV-S | B/C | Historical annex; preserve visible semi-open circulation |
| HAB-02 | First Doctor sleeping bays | *The Edge of Destruction* [N09] | TV-S | B/C | Fold-away beds; transparent dividers; not a modern hotel suite |
| HAB-03 | Romana's private room | *Full Circle*, *Logopolis*, fan image catalogs [N04] | TV-S; later removed | B appearance | Historical state only unless reconstituted |
| HAB-04 | Nyssa / Tegan quarters | *The Visitation*, *Terminus* [N04] | TV-S | B appearance | Period-specific residential modules |
| HAB-05 | Adric's room → Turlough's room | *Earthshock*, *Terminus* [N04] | TV-S | B appearance | Represent room reuse in timeline metadata |
| HAB-06 | Amy and Rory quarters | *The Doctor's Wife* [N01] | TV-M room; TV-S associated corridors | E direct room view | Bedroom volume inferred; **not** an exact filmed replica |
| HAB-07 | 2005 multilevel wardrobe | *The Christmas Invasion*; fan set gallery [N04] | TV-S | B; spiral stairs visually referenced | Historical hero-room shell with spiral vertical circulation |
| HAB-08 | Wardrobe hall of lower substrata | *Spyfall, Part One* [N02] | TV-M | E visually | Functional zone + location clue only; do not merge into Pickwoad layout as direct evidence |
| HAB-09 | Scullery | *The Doctor's Wife* [N01] | TV-M (jettisoned) | E visually | Absent in that historical state; possible future optional kitchen zone |
| HAB-10 | TARDIS kitchen (mentioned) | *The Curse of the Black Spot* (2011): the Eleventh Doctor points Avery toward a kitchen [V09] | **TV-M verified; not TV-S** | E: not shown | Reserve a functional kitchen room; all appearance and 2013 position unverified |
| HAB-11 | Multiple TARDIS bathrooms | *The Curse of the Black Spot* (2011): the Doctor offers Avery several choices of bathroom [V09] | **TV-M verified** | E: rooms not shown | More than one accessible bathroom is strongly supported; locations and interiors unverified |
| HAB-12 | Swimming pool as bathroom | *The Invasion of Time*; *Journey* glimpse [N11,J2] | TV-S | A 1978 visual, limited 2013 | Distinct era geometry; 2013 version TBD |
| HAB-13 | Squash court seven | *The Doctor's Wife* [N01] | TV-M (jettisoned) | E | Name-only floor/wing reservation; not a modeled squash-court set from TV |
| HAB-14 | Additional squash courts 1–6 | Implication of "seven" is **not proof all others present** | INF | E | Do not create six canon room records solely from numeral |
| HAB-15 | Karaoke buses | *Spyfall, Part One* [N02] | TV-M navigational landmark | E | Optional disconnected *historical reference*, not a v1 hero room |
| HAB-16 | Boot cupboard / drawing room | *The Masque of Mandragora* [N04] | TV-S | B | Characterful large enclosed room off heritage corridor |
| HAB-17 | Sickbay / medical ward | *The Invasion of Time* [N11] | TV-S | B | Human-scale ward, curtained bays, corridor entrance |
| HAB-18 | Zero Room | *Castrovalva* [N04] | TV-S; subsequently jettisoned | B | Zero Room historical variant; rebuilt later only if specifically sourced |
| HAB-19 | Doctor's attic | *The Shakespeare Code* [N12] | TV-M | E | Mention-only storage region; no asserted shape |
| HAB-20 | Doctor's own bedroom | Doctor Who official site [N05] expressly notes unseen | OFF possibility | E | **Do not claim existence or design as certain** |
| HAB-21 | Sunroom / garden / sauna / salon | Cross-media / third-party indexes [N13]; TV story-specific basis unresolved | Mixed EXP/uncertain | E | Research queue; never automatically assert TV-seen |
| HAB-22 | Pool dislocated into library | *The Eleventh Hour* [N05]; prior source ledger | TV-M relationship/event | D geometry | Historical rearrangement **event**, not a permanent adjacency |

## 14.3 Archives, cultural spaces, storage, ecology and large-volume rooms

| ID | Space | Evidence | Classification | Visual status / model implication |
|---|---|---|---|---|
| ARC-01 | Library — 2013 cathedral-like chamber | *Journey* [J1–J8] | TV-S | Strong appearance; room footprint/level count unknown |
| ARC-02 | Observatory / telescope view | *Journey* [J1–J8] | TV-S glimpse; OFF | Partial appearance; avoid made-up complete telescope room |
| ARC-03 | Doctor's cot memorabilia storeroom | *Journey* [J1–J8] | TV-S | Door reachability and props known; absolute position unknown |
| ARC-04 | Other storerooms 23A, 14D | *The Invasion of Time* [N11] | TV-S/TV-M named | Distinguish repeated set appearance from actual different numbered room names |
| ARC-05 | Cloister Room — 1981 | *Logopolis* [N04] | TV-S | Organic/vine/stone atmosphere; distinct from 1996 Gothic version |
| ARC-06 | Cloister Room — 1996 + Eye interface | *Doctor Who* TV movie [N07,N08] | TV-S | Eye dome within room; treat as 1996 composite regional configuration |
| ARC-07 | Secondary wooden console room | *The Masque of Mandragora* [N04] | TV-S | Distinct wooden console, not a copy of Pickwoad hero room |
| ARC-08 | Art gallery / power disguise | *The Invasion of Time* [N11] | TV-S | Crosses cultural and technical roles; preserve hidden function |
| ARC-09 | Boot cupboard | *The Masque of Mandragora* [N04] | TV-S | Often much larger than "cupboard" implies |
| ARC-10 | Botanical plants at pool-side | *The Invasion of Time* [N11] | TV-S landscaping | **Not necessarily proof of an independent botanical garden room** |
| ARC-11 | Aquarium | Official TARDIS profile [N14] | OFF | Function affirmed; dimensions, doorway, and TV scene unknown |
| ARC-12 | Zoo | Official TARDIS profile [N14] | OFF | Function affirmed; ecology, scale, and habitat plan unknown |
| ARC-13 | Garage | Official TARDIS profile [N14] | OFF | Function affirmed; contents, access and scale unknown |
| ARC-14 | Junk room | Official TARDIS profile [N14] | OFF | Might overlap ordinary storage; separate identity requires proof |
| ARC-15 | Other art-gallery spaces | Official profile + 1978 disguised station [N14,N11] | OFF/TV-S | Preserve ambiguity: "art gallery" may refer to the 1978 site or another distinct gallery |
| ARC-16 | Archived additional control-room designs | *The Doctor's Wife* [N01] | TV-M archive count; TV-S one | Presence of archives ≠ proof every former control room has fixed coordinate |
| ARC-17 | Storage of companion possessions | *Journey* production discussion of earlier drafts [J7] | PROD **deleted/unused idea** | Do not mark TV-S; possible optional conceptual art only |
| ARC-18 | Historic zoo/gardens/boating lakes/rainforest | Expanded lists / secondary paraphrases [N13] | Mixed reference levels | Each needs an individual TV quote or media identification before status upgrade |

**Functional overlap caution:** a room may serve multiple functions, such as the 1978 art gallery hiding machinery, or a console room incorporating bookshelves and a workbench. To avoid inflating the ship, assign multiple `functions[]` to a single room ID unless separate thresholds are genuinely witnessed.

---

# 15. Era-specific architectural evidence and reuse policy

The project defaults to **2012–17 Pickwoad**, but archival spaces and future eras must be allowed without corrupting the baseline topology.

| Era / visual configuration | Structural basis | Strongest distinguishing features | Recommended relationship to base map |
|---|---|---|---|
| 1963–late 1960s Brachacki / altered original | Original footage and set-layout reconstructions [N09] | Roundel walls, modular screens, fault locator, original console, accessible living annex | Separate historical scene; include archival room only with provenance |
| 1976 wooden secondary console | *The Masque of Mandragora* | Wood, brass, roundels, second console, adjacent boot cupboard and corridors | Separate archival wing; no assumed direct 2013 hallway |
| 1978 large internal corridors | *The Invasion of Time* | Utilitarian location corridors, pool/garden plants, workshop, sickbay, gallery machinery | Historic region kit, optional reinterpretation into Pickwoad style |
| 1981–82 Zero / Cloister / bedrooms | *Logopolis*, *Castrovalva*, Fifth Doctor stories | Sanctuary, older rooms, simple living spaces | Distinguish recreated spaces from surviving historical originals |
| 1996 TV movie | TV movie [N07,N08] | Gothic library-like main hall, ornate Eye-of-Harmony cloister | Distinct *historical configuration* with own Eye and console visual IDs |
| 2005–09 coral | *Rose* onward, *The Christmas Invasion* wardrobe | Organic coral-like console room, major standalone wardrobe | Part of archive/gallery; room shell not fitted directly around Pickwoad |
| 2010–12 copper/fantasy | *The Eleventh Hour*, *The Doctor's Wife* | Multi-tiered console, copper organic mechanisms, visible stair access, roundel corridors | Archived console room explicitly shown; great optional route |
| **2012–17 Pickwoad** | *The Snowmen* through *Twice Upon a Time* [G1–G10] | 18 structural ribs, 3 major elevation zones, controlled gallery and lower entrances | **Default**; fixed primary shell for connected v1 |
| 2018–19 crystal/cave | *The Ghost Monument* onward | Crystal columns, craggy metallic structure | Separate future-era scene; **do not transpose** portals from 2013 |
| 2020–22 revised crystal/cave | Production-designer interview [N17] | Central moving wall elements removed; new staircase **and door at its top**; more depth | Same 13th Doctor era with production-config versioning |
| 2023–25 white/roundel cathedral | *The Star Beast*, production commentary [N18,N19] | Vast white hemispherical space, rings of light/roundels, ramps, shutter doors, multi-level circulation | Separate recent-era scene, with accessible circulation and portal anchors |

## 15.1 Recent-era correction important for longer-term expansion

The 2020 changes to the Thirteenth Doctor's console room were described explicitly by production designer Dafydd Shurmer: removal of three moving internal wall pieces and addition of a **staircase with a door at its top** [N17]. The 2023 white console room is architecturally larger and uses internal **ramps** prominently; a production account describes circular shutter doors and large curved elevated walkways, while a contemporary directors' interview emphasizes the room's scale [N18,N19]. These provide **real later-era branching-portal landmarks** but say nothing about the destinations behind each door.

**Do not retroactively import either set's layout into the Pickwoad model.** Reuse only software/data abstractions: room transforms, doorway anchors, route graph, materials, and era selection.

---

# 16. Canon-aware placement rules — concrete constraints rather than invented coordinates

## 16.1 Constraints backed by source

| Constraint | Evidence basis | What follows | What does NOT follow |
|---|---|---|---|
| Main exterior doorway opens onto Pickwoad console main deck | TV / published stills [G2] | Direct exterior → console room physical threshold | Main door azimuth relative to unseen interior wing |
| Upper gallery and lower technical levels are present | [G1,G2] | At least two actual vertical transitions/stairs in control hub | Evenly spaced elevation; metric height |
| The 2013 room uses 18 major ribs | Designer commentary [G1] | Represent ribs at real structural positions | Exact uniform angular spacing without image check |
| One lower-wall panel leads deeper into the ship | *Journey* scene / catalogs [J1,J2,G6] | Model a door/threshold at lower level | This is the same opening as sub-console ladder |
| Clara can move storeroom → other interiors → library during *Journey* | [J1,J2] | Reachable nodes in damaged configuration | Stable storeroom next door to pool/library |
| The ARS doorway changes during damage | [J1,J2,J6] | Dynamic visibility and topology states | Permanently impassable exit |
| Fuel-service area is below primary fuel cells | *Journey* dialogue [J1,J2] | Vertical structural relationship | Absolute fuel-tunnel elevation vs console origin |
| An Eye chamber and an engine/defensive portal appear | [J1,J2] | Model threshold chain with explicit portal | Simple ordinary Eye-to-engine doorway |
| 1996 Eye lies inside the Cloister Room | TV movie transcript [N07] | One era-specific **composite room** | Same arrangement in 2013 |
| 1978 workshop can be approached from swimming-pool vicinity by directions | *The Invasion of Time* [N11] | Directional route clue for *1978 configuration* | Literal spatial bearing/transplant to 2013 |
| 1964 lounge / sleeping cluster shares an internal passage | Reconstruction & screen material [N09] | Preserve contiguous early-era mini-layout | Global 2013 bedroom position |
| TARDIS can delete/jettison/rearrange rooms | *Logopolis*, *The Doctor's Wife*, *Journey* [N01] | `configurationState` must be modeled | Room can be left floating in the default snapshot |

## 16.2 Three different graphs (do not conflate)

1. **Observed-journey graph:** a directed, time-ordered graph of what characters traversed or mentioned, including events involving shifts, cuts, door disappearance, and portals. This is evidence, not a floor plan.
2. **Canonical reachability graph:** small set of edges where two named spaces are guaranteed linked by some route at some observed time; may be unlabeled as to corridor length.
3. **Chosen 3D build graph:** a stable, actual embedded walkable graph for the app. The majority of long-range edges are **designed inference** and require passage meshes. The app must visibly identify its inferred sections in research mode.

`observed_journey` should preserve `timestamp`, `episode`, `scene_id`, `transitionType`, `state`, and `cutEvidence`. `build_graph` should preserve `fromDoorId`, `toDoorId`, physical polyline path, width/height envelope, stairs, collision/clearance volumes, grade and source. **Never infer a direct door adjacency from an editor's scene cut.**

## 16.3 Default connected stable map — proposed *design*, not discovered canon

Create a 3D nave-like control hub with a ring of branching paths and a descending machinery spine. All graph connections shown as `INF-D` are intentional architecture to bridge underconstrained evidence:

```text
POLICE BOX -> Pickwoad console (main deck)
                       |       |        |
                  gallery   main deck  lower deck
                     |          |          |
               culture ring   transition  service spine
                 / |  \          |         /  |   \
            library pool observatory  storage  ARS   tech service rooms
                 \_____|          |        \     |
                     |       residential    fuel-cell underpass
               culture loop       |                |
                            wardrobe/hab     Eye antechamber
                                |                    |
                         medical/quiet wing       Eye catwalk
                          (Zero/Cloister)             |
                                          defensive portal vestibule
                                                   |
                                              engine core
```

**Engineering constraint:** no “floating” modules. At every connection, either direct shared-door shell geometry, a visible modeled corridor volume, or a fully enclosed accessible portal **vestibule** must physically touch both sides of the connection in the chosen world-space build. In this baseline, the *non-Euclidean engine portal* may use a visibly continuous antechamber with a non-Euclidean effect inside; if an extra walkable service bypass is added, mark that bypass `INF-E` (creative embellishment) rather than claiming it is canon.

## 16.4 Minimum stable-world world-space invariants

- **Envelopes:** no overlapping solid room volumes unless the overlap is explicitly marked portal/dimensional-transcendence geometry.
- **Door anchors:** every route edge must terminate at a modeled portal polygon on each room's shell.
- **Clearances:** full route collision envelope must be navigable; no invisible teleporting between ordinary nodes.
- **Elevation:** stair/ramp/shaft endpoints land on real level surfaces, never midair. For a pure isometric view, non-walkable inspection-only ducts still need a material connection and must be labeled as non-traversable.
- **Path visibility:** selecting any two Tier-1 rooms should illuminate a contiguous path that runs within passage geometry and through identified doorways, not through walls.
- **Lineage:** all new rooms identify their visual era, and all links identify source/observability separately.
- **Uncertainty:** source-only adjacency should be stored independently from `worldTransform` chosen by the map designer.
- **Scalability:** rooms like aquarium/zoo/garage need reserved **large-shell sites** and connective capacity, but can remain hidden placeholders until designs are evidence-graded.

---

# 17. Proposed implementation-grade room graph register

This is an **explicit design hypothesis** supplied so another agent can begin laying out one cohesive architectural reconstruction without inventing unmarked links. All unreferenced connector details are `INF-D` or `INF-E`. Room positions/distances remain `null` until graybox spatial solving. All Tier-1 nodes must be reachable via a visible path.

## 17.1 Node register

| Node ID | Room / physical location | Shell type | Era basis | Tier |
|---|---|---|---|---|
| `P-EX` | Exterior police-box threshold | doorway | Pickwoad TV | 1 |
| `C-M` | Console main deck, rotor, exterior entry | central cylindrical / faceted vault | Pickwoad TV | 1 |
| `C-U` | Console upper gallery | annular walkable arc | Pickwoad TV | 1 |
| `C-L` | Console lower technical ring | annular usable deck | Pickwoad TV | 1 |
| `C-XU` | Upper internal access landing | doorway / short landing | partly screen, final placement unknown | 1 |
| `C-XL` | Lower-wall deep exit landing | doorway / short landing | *Journey* | 1 |
| `C-LAD` | Sub-console ladder/compartment | aperture + ladder | *Journey* secondary; confirm | 1 |
| `H-01` | Cultural connector loop | corridor chain | INF-D | 1 |
| `H-02` | Pool-observatory-library connector | corridor with door branches | INF-D | 1 |
| `L-01` | Library | towering shelves / large enclosed shell | *Journey* | 1 |
| `O-01` | Observatory | telescope volume / threshold | *Journey* glimpse | 2 |
| `P-01` | Pool | large enclosed basin shell | *Journey* glimpse | 2 |
| `S-01` | Cot/memorabilia storeroom | shelving chamber | *Journey* | 1 |
| `M-01` | Maintenance connector loop | industrial corridor | INF-D | 1 |
| `ARS-01` | Architectural Reconfiguration System | very tall chamber | *Journey* | 1 |
| `M-02` | Fuel-cell underpass junction | industrial service | *Journey* / INF-D | 1 |
| `F-01` | Under-primary-fuel-cell tunnel | narrow service tunnel | *Journey* | 1 |
| `E-A` | Eye antechamber | sealed threshold | *Journey* PROD | 1 |
| `E-01` | 2013 Eye chamber and catwalk | large contained hazard volume | *Journey* | 1 |
| `E-V` | Engine portal/defensive vestibule | portal, enclosed approach | *Journey* + INF-D | 1 |
| `ENG-01` | Engine core | massive altered/time-frozen volume | *Journey* | 1 |
| `R-01` | Residential corridor | human-scale corridor | INF-D | 2 |
| `R-02` | Wardrobe suite | multilevel cultural room | classic/2005 TV design basis | 2 |
| `R-03` | Companion bedroom A | modular suite | historic TV | 2 |
| `R-04` | Companion bedroom B | modular suite | historic TV | 2 |
| `T-01` | Workshop | industrial workspace | classic TV | 2 |
| `T-02` | Sickbay | human-scale medical ward | classic TV | 2 |
| `T-03` | Art/ancillary power station | gallery plus control system | classic TV | 2 |
| `Q-01` | Quiet/sanctuary connector | isolated corridor | INF-D | 2 |
| `Q-02` | Zero Room | quiet sanctuary | classic TV | 2 |
| `Q-03` | Cloister Room | enclosed temple-like chamber | classic TV | 2 |
| `A-01` | Archived control-room connector | guarded passage | INF-D | 3 |
| `A-02` | Wooden secondary console room | wood-paneled hall | 1976 TV | 3 |
| `A-03` | Archived coral console room | coral circular hall | *The Doctor's Wife* | 3 |
| `X-01` | Aquarium reservation | unknown large shell | OFF | deferred |
| `X-02` | Zoo reservation | unknown biosphere shell | OFF | deferred |
| `X-03` | Garage reservation | unknown large shell | OFF | deferred |

## 17.2 Edge register and classification

The following are **proposed build connections**. `TV route` supports reachability and perhaps a doorway but **does not guarantee chosen end-to-end adjacency**. `INF-D` is necessary topological synthesis; `INF-E` is new elective architecture.

| Build edge | Ends | Status | Modeling explanation |
|---|---|---|---|
| B01 | P-EX ↔ C-M | TV-S direct | Main exterior doors physically open to main deck |
| B02 | C-M ↔ C-U | TV-S direct circulation | Modeled stairs/landings within console shell |
| B03 | C-M ↔ C-L | TV-S direct circulation | Modeled lower stair routes within console shell |
| B04 | C-U ↔ C-XU | screen-access based, position TBD | Leave door azimuth null until image audit |
| B05 | C-L ↔ C-XL | *Journey* exit; threshold position TBD | Lower-wall panel must be modeled as an aperture |
| B06 | C-L ↔ C-LAD | provisional / separate compartment | Don't conflate with deep passage exit |
| B07 | C-XU ↔ H-01 | INF-D | Visible transitional arch corridor |
| B08 | H-01 ↔ H-02 | INF-D | Cultural loop with branch doors |
| B09 | H-02 ↔ L-01 | TV route + INF-D actual junction | Actual library doorway; uncertain hall length |
| B10 | H-02 ↔ O-01 | TV glimpse + INF-D | Observable threshold; fine geometry pending |
| B11 | H-02 ↔ P-01 | TV glimpse + INF-D | Same as above |
| B12 | H-01 ↔ R-01 | INF-D | Habitation circulation route |
| B13 | R-01 ↔ R-02 | TV room + INF-D position | Wardrobe-era adaptation |
| B14 | R-01 ↔ R-03 | TV room + INF-D position | Companion bedroom door |
| B15 | R-01 ↔ R-04 | TV room + INF-D position | Companion bedroom door |
| B16 | C-XL ↔ M-01 | INF-D | First industrial spine segment |
| B17 | M-01 ↔ S-01 | TV room + INF-D hall distance | Cot storeroom route |
| B18 | M-01 ↔ ARS-01 | TV room + INF-D hall distance | ARS doorway reconfiguration variant |
| B19 | M-01 ↔ T-01 | classic room + INF-D position | Workshop branch |
| B20 | M-01 ↔ T-02 | classic room + INF-D position | Medical branch |
| B21 | M-01 ↔ T-03 | classic room + INF-D position | Art/power cross-over |
| B22 | M-01 ↔ M-02 | INF-D | Deep maintenance bridge |
| B23 | ARS-01 ↔ M-02 | INF-D | Deliberate loop to avoid dead-end ARS |
| B24 | M-02 ↔ F-01 | TV fuel route + INF-D threshold | Actual downward service route |
| B25 | F-01 ↔ E-A | TV route + INF-D intermediate span | Door to antechamber |
| B26 | E-A ↔ E-01 | TV sequence | Walkable Eye chamber catwalk threshold |
| B27 | E-01 ↔ E-V | TV approach + INF-D interval | Don't assert that Eye abuts core |
| B28 | E-V ↔ ENG-01 | TV-S **portal** | Explicitly mark nonordinary transition |
| B29 | M-01 ↔ Q-01 | INF-D | Quiet wing branch |
| B30 | Q-01 ↔ Q-02 | historic TV room + INF-D position | Zero Room historical state caution |
| B31 | Q-01 ↔ Q-03 | historic TV room + INF-D position | Cloister historical state caution |
| B32 | H-01 ↔ A-01 | INF-D | Long-range archive link |
| B33 | A-01 ↔ A-02 | historic TV room + INF-D placement | Wooden control room |
| B34 | A-01 ↔ A-03 | archive canon + INF-D placement | Archived coral room |
| B35 | H-02 ↔ R-01 | INF-D optional cycle | Avoid forced round-trip through one narrow corridor |
| B36 | M-01 ↔ C-LAD | **INF-E optional** | Only create if separate sub-console route proven workable; do not label TV |

**Physical navigation audit:** the graph has a design path from `C-M` to every Tier-1 node. **This does not mean architectural mesh reachability is proven**: actual routes need transform solving, clearance checks, clipping/cutaway tests, door surfaces, and playtesting. Nodes `X-*` are intentionally *unplaced reservations*, not floating rooms in the visible map. Do not draw them in v1 until physically integrated.

---

# 18. Geometry recovery specification — actionable engineering research

## 18.1 Measurements presently unavailable

To reiterate, **no verified metre measurements** were identified for these 2013 elements: chamber radius, gallery rise, lower-deck drop, main console width, door azimuths, stairs/rail dimensions, library volume, corridor cross-sectional dimensions, pool basin, observatory shell, ARS tree height, fuel-cell separation, Eye catwalk dimensions, or engine enclosure. Treat uncalibrated cross-era ruler values as `null`.

## 18.2 What a *valid* calibrated model requires

Create `research/measurements/pickwoad-calibration.md` with the following artifact columns:

`measurementId | target | sourceImage | rights | sourceDate | pixelAnchor | realAnchor | perspectiveCorrection | measuredValue | uncertainty | reviewer | status`

- Calibrate at least one **real-world scale anchor**, ideally a production dimension on an authentic drawing. If no such source exists, the model remains **dimensionless/normalized**.
- Record camera lens/field of view estimates or fitted extrinsics for every still used to derive lengths.
- Prefer multiple images sharing at least four non-coplanar landmarks to avoid single-image scale ambiguity.
- Stair steps and typical human height can be **sanity checks**, not magically verified metre anchors. If used as prior assumptions, expose them as assumptions and include wide uncertainty.
- Reconstruct walls, door bearings, and ribs as a constrained model. Preserve raw point picks / screenshot identifiers so measurements can be repeated.
- Record geometric **uncertainty ranges** and separate camera uncertainty, scale uncertainty and interpretation uncertainty.
- Published fan dimensions need their own measurement lineage and should be cross-checked against source-screen geometry.

## 18.3 Required shot ledger, with specific verification questions

| Shot ID | Episode / target | Capture | Question to resolve | Confirmation threshold |
|---|---|---|---|---|
| P01 | *The Snowmen* arrival | Full entry view toward console | Entry bridge height/length; deck relationship | Two clear camera angles |
| P02 | *The Snowmen* gallery | Upper ring from below | True stair attachment, side-door counts | Visible shared landmarks |
| P03 | *The Bells of Saint John* changing clothes | Lower compartment | Which cabinet is wardrobe/storage vs exit? | Captured door opening + surrounding ribs |
| P04 | *Journey* return to console | Lower wall opened | Door dimensions and unique panel ID | Before/during/after frames |
| P05 | *Journey* Bram actions | Under-console ladder/compartment | Is this physically a second independent passage? | Frame of ladder and distinct route |
| P06 | *Journey* library escape | Library entry/door reverse | Is library door adjacent to corridor in a continuous shot? | Unbroken shot or explicit cut annotation |
| P07 | *Journey* silent glimpse | Observatory telescope | Architectural extent and corridor relation | Sequence of consecutive shots |
| P08 | *Journey* silent glimpse | Pool opening | Pool scale and door orientation | Consecutive shots / visual landmark |
| P09 | *Journey* ARS scene | Chamber door before/after theft | One or multiple exit apertures; reconfiguration | Paired state frames |
| P10 | *Journey* fuel tunnels | Section/side shots | Vertical tunnel, hazard offsets, cell underpass | Two crossing angles |
| P11 | *Journey* Eye | Entry, catwalk and dangerous edges | Catwalk footprint, number of entrances | ≥3 angles with common geometry |
| P12 | *Journey* ravine/engine | Portal/engine transition | Is there normal architecture on either side? | Shot order plus Doctor's dialogue |
| P13 | *The Time of the Doctor* | Lower compartment/time-wind access | Relationship to previously mapped doors | Two repeated fixed landmarks |
| P14 | *Deep Breath* / *Mummy on the Orient Express* | Capaldi dressing of console | Which elements are furniture vs shell | Cross-era compare photos |
| P15 | *The Invasion of Time* | Workshop → pool/arts/service | Scene-cut or actual threshold | Consecutive path log |
| P16 | *Castrovalva* | Zero Room | Number of accessible walls / exits | Multi-angle shots |
| P17 | *Logopolis* | Cloister Room | Pillar/bell/bench footprint | Reference-frame map |
| P18 | TV movie (1996) | Eye inside Cloister | Stage entrance, dome and raised platform | Plan with camera anchors |
| P19 | *The Doctor's Wife* | archived control | Door/route to coral room | Scene order, no invented map coordinates |
| P20 | *The Star Beast* | 2023 controls | Ramp paths and actual shutter door anchors | Two opposite-side views |

**Do not claim P01–P20 are complete.** They are a precisely enumerated **acquisition queue**, not a fabricated set of observed frames.

## 18.4 A conservative parametric recipe for the implementation agent

Until the scale anchor is known, use **normalized units (NU)**, not claimed metres. Do not publish guessed ratios as canonical facts. Recommended workflow:

1. Pick arbitrary `consoleRadiusNU = 10` exclusively for model composition.
2. Position the main entry and lower/upper shell as parameterized surfaces with unknown door azimuths stored separately from the temporary layout azimuths.
3. Place recognizable hero-room shells at nonoverlapping provisional transforms; attach all through actual constructive solid geometry corridors and stairs.
4. Use generic 2013 corridor-wall profiles only where filmed references support style; vary length as a design decision.
5. Keep a `hypothesis.json` file recording every room's **world-space placement rationale** and whether alternate arrangements were rejected for conflicts/visibility reasons.
6. Export a two-layer evidence view with television-supported geometry on one layer and inferred connection volumes on another.
7. When measured dimensions arrive, rescale hero shells and re-run solver, without resetting the relative adjacency facts.

---

# 19. Source and citation architecture for automated research-to-model handoff

Use a machine-readable catalog. Room facts must point to precise `claim_id` entries, not merely one blanket citation to an entire 45-minute episode.

```yaml
claim_id: J-CLARA-OBS-POOL-LIB
subject_id: CORRIDOR-J-001
predicate: route_sequence
objects: [OBS-01, POOL-01, LIB-01]
relation_strength: edited_scene_sequence
appearance_status: TV-S
source_ids: [J1, J2, J3]
media:
  episode: Journey to the Centre of the TARDIS
  approximate_range: "00:12–00:13"
  inspected_episode_frames: false
certainty:
  ordered_scenes: high
  stable_adjacency: unknown
  metric_distance: unknown
conflicts: []
notes: >-
  Dialogue/scene descriptions establish an approximate ordered passage
  through these spaces; no room-to-room door adjacency is assumed.
```

```yaml
room_id: PICKWOAD-2013-CONSOLE
canonical_function: primary_control_room
era: [2012, 2017]
space_status: tv_seen
state: stable_except_incident_variants
references:
  - source_id: G1
    claim: architectural_design_intent
  - source_id: G2
    claim: visual_geometry
rooms_merged_with: []
known_geometry:
  major_rib_count: 18
  distinct_elevation_zones: 3
measures:
  main_radius_m: null
  gallery_elevation_m: null
  lower_elevation_m: null
  confidence: unmeasured
coordinate_convention:
  root: time_rotor_axis
  deck_y_nu: 0
entry_portal:
  canon_azimuth_degrees: null
  authored_azimuth_degrees: 0
internal_portals:
  - id: lower-panel-j
    observed: true
    bearing_verified: false
physical_edges:
  - B01
  - B02
  - B03
  - B05
```

### Controlled vocabulary

`space_status = tv_seen | tv_mentioned | official_affirmed | production_unfilmed | expanded_media | speculative`

`observation = unbroken_traversal | seen_threshold | scene_sequence | dialogue_only | postproduction_effect | production_drawing | still_only | inference`

`dimension_confidence = measured | calibrated | approximate_in_source | normalized_mockup | unavailable`

`edge_kind = doorway | corridor | stairs | ramp | ladder | catwalk | shaft | vestibule_portal | inaccessible_observation`

`configuration_state = normal | damaged | reconfiguring | alternate_era | jettisoned | archived | echo | deleted | regenerated`

### Coverage test requirements

- Each `tv_seen` hero room must have one scene/episode reference and at least one descriptive geometry claim.
- Each physical-build edge must terminate on door/landing identifiers that exist in the room data.
- Every `INF` edge must include a reason, an uncertainty field, and `authored_by` metadata.
- Every time-based relationship with no film-proven adjacency must use `scene_sequence` or `reachable_only`, never `unbroken_traversal`.
- A room described as `jettisoned` should not appear in a snapshot set after that event without an explicit restoration/reconstruction record.
- Historical variant models must have separate asset IDs, even when sharing a common abstract room function.
- Any runtime coordinate expressed in meters needs a measurement link; otherwise serialize `units: "normalized"`.
- A configured default snapshot must have graph and **mesh-walkability** checks, not only graph connectivity.

---

# 20. Research closure audit and remaining limitations

## 20.1 Status of major research tracks

| Research track | Status at this revision | Evidence now available | Blocker to stronger claim |
|---|---|---|---|
| Major modern 2013 hero spaces | **documented, not metric** | Descriptions, pathways, era-specific room list, production interviews, scene ledger | Access to episode frames and calibrated production diagrams |
| Classic televised spaces | **cataloged by era** | Named rooms and primary story leads, select transcript validation | Dedicated frame surveys of each room |
| Previously omitted named locations | **added** | Scullery/squash court, attic, wardrobe hall/karaoke buses, 1968 power room | Most are only mentioned; no TV geometry to extract |
| Other official room types | **cataloged** | Aquarium, zoo, garage, junk room in official Doctor Who profile | No confirmed TV depiction/dimensions/entrances in this research pass |
| 1996 Eye/Cloister geography | **resolved at functional-room level** | TV-movie transcript explicitly locates Eye within Cloister | Full dimensioned plan still lacking |
| 1963–64 domestic cluster | **strong historical reconstruction leads** | TARDIS Builders 43×35 ft set footprint; Mind Robber set historical survey | Stage plan is not a claim about 2013 geometry |
| Pickwoad metric plans | **not located** | Original designers; visual set galleries; community dimension-access note | Authentic plans or a calibrated physical reference |
| 2013 door bearings/count | **provisional** | Four interior doors reported by secondary catalog | Complete frame-by-frame portal register |
| Eye portal to core continuity | **split canon vs design** | TV dialogue / scene; v1 architecture needs deliberate transition | Visual verification of exact portal mechanics |
| 2018 Type 40 manual | **identified, not completely read** | Publisher confirms floor plans, diagrams, date, contributors | Licensed book text/pages not fully accessible in this pass |
| 2020 and 2023 control-room upgrades | **verified overview** | Designer/director interviews, contemporary reportage | Scene-level geometry/scale survey |
| Cross-era union into one 3D megastructure | **design hypothesis documented** | Full 3D graph blueprint and modeling rules | Canon does not supply one immutable topology |

## 20.2 Specific unresolved questions (no invented answers)

1. Exactly how many independent internal exits does the 2013 set have, on which deck, and at what bearings?
2. Which parts of Pickwoad geometry in the show were physical set, augmented digitally, or modified between 2012 and 2017?
3. Can a genuinely dimensioned 2013 plan be licensed, or can a defensible calibration be performed with provenance?
4. Does the lower compartment access seen in *The Time of the Doctor* coincide with any *Journey* access, or is it a distinct bay?
5. How many actual physical levels does the 2013 library set imply versus VFX multiplication? What does each source independently prove?
6. Are Clara's observatory/pool/library glimpses separated by cuts, turns or fully shown door transitions?
7. How many ARS chamber doors are ever clearly seen, and does its disappearing door change topology or only visuals?
8. Which Eye antechamber/catwalk elements are set vs visual extension?
9. Is the engine portal a spatial short-cut, temporal disruption, or simply a special frame transition in the filmed scene?
10. Are aquarium, zoo, junk room and garage each directly attested by named television dialogue, or only official aggregation/expanded continuity?
11. Which rooms were deleted or restored at each point in history? A complete event-by-event state timeline would require episode-by-episode review.
12. Are later seasons through the **2025 televised run** introducing new rooms beyond those found in the surveyed material? The current online survey did not identify a separately filmed new non-console destination, but **absence of a search result is not proof of absence**.

## 20.3 Evidence strength thresholds for an honest “ready to build” decision

**Ready for parametric, clearly labeled connected prototype:** yes. We know sufficient functions, motifs, relative level structure, and tested room traversal classes to build a coherent **interpretive model**.

**Ready for screen-accurate metric reconstruction of the Pickwoad room:** no. Measurements and frame-by-frame portal survey remain undone.

**Ready for a literal complete canonical TARDIS floor plan:** never, because the source material establishes changing/infinite internal topology and leaves most rooms unmapped. This is a property of the fictional subject, not a fixable research omission.

**Ready for agent handoff:** yes **if the agent understands** that source-backed facts and authored geometry are different layers, accepts normalized dimensions, preserves all uncertainty, and is forbidden from inventing metric precision.

### Freeze gate for entering high-detail hero-room modeling

- [ ] Primary/captioned stills inspected for every first-wave hero room.
- [ ] All first-wave door portals enumerated with room-local anchor IDs.
- [ ] `M01–M12` research jobs in §12 have explicit verified/blocked status.
- [ ] `P01–P12` target shot captures completed or marked inaccessible.
- [ ] Chosen authored room positions are all nonoverlapping, and all B01–B28 edges are physically connected.
- [ ] Source ledger reflects any conflicts and rejected alternatives.
- [ ] Zero source-free numeric "real-world" dimensions in the runtime data.
- [ ] Selection/cutaway/routing system can expose a path from console to deep engine without visual floating rooms.

---

# 21. Added source catalog and provenance notes

All listed URLs are **research leads or consulted online sources**; they are not embedded copyrighted drawings. Reference IDs are stable for this document, independent of web-search result IDs.

| ID | Source and URL | Kind | Supports / limitation |
|---|---|---|---|
| **N01** | *The Doctor's Wife* script/scene transcript: https://www.chakoteya.net/DoctorWho/32-4.htm ; timed BBC captions: https://subsaga.com/bbc/drama/doctor-who/series-6/4-the-doctors-wife.html | Episode transcription | Named scullery/squash court/pool loss, archived console, room deletions. Not precise plan. |
| **N02** | *Spyfall, Part One* transcript: https://tardis.guide/story/spyfall-part-1/transcript/ | Episode transcription | Lower substrata, wardrobe hall, landmark of karaoke buses, **no visible map**. |
| **N03** | Penguin/BBC Books, *TARDIS Type 40 Instruction Manual* by Richard Atkinson and Mike Tucker, illustrated by Gavin Rymill, 18 Oct 2018: https://www.penguin.co.uk/books/438778/doctor-who-tardis-type-40-instruction-manual-by-richard-atkinson/9781785943775 | Licensed reference | Publisher explicitly promises floor plans and technical diagrams; contents of individual maps **not fully audited**. |
| **N04** | The Doctor Who Site historical set galleries: https://thedoctorwhosite.co.uk/tardis/interior/season-15-interior/ ; https://thedoctorwhosite.co.uk/tardis/interior/season-20-interior/ ; https://thedoctorwhosite.co.uk/tardis/interior/1996-interior/ | Fan visual collection | Contemporaneous story-specific room/studio images; strong illustration aid, but not primary measurements. |
| **N05** | Official Doctor Who article, *What is the TARDIS?*: https://www.doctorwho.tv/news-and-features/what-is-the-tardis | Official synopsis | Confirms library/pool/observatory/storage/bedrooms, movable front door, unrevealed Doctor's bedroom. |
| **N06** | *The Mind Robber* transcript: https://tardis.guide/story/the-mind-robber/transcript/ ; history of other rooms: https://thedoctorwhocompanion.com/2024/07/14/get-a-room-a-brief-guide-to-the-tardis-other-rooms-in-doctor-who/ | Episode transcript + editorial | Actual TARDIS power room; later **Land of Fiction** library is not TARDIS architecture. |
| **N07** | *Doctor Who* (1996 TV movie) transcript: https://tardis.guide/story/doctor-who-the-tv-movie/transcript/ | Episode transcript | Master introduces Cloister Room; Eye of Harmony's dome located inside same chamber. |
| **N08** | The Doctor Who Site, 1996 interior photo gallery: https://thedoctorwhosite.co.uk/tardis/interior/1996-interior/ | Visual secondary | Independent illustration of Eye dome within Gothic Cloister Room. |
| **N09** | TARDIS Builders original plan discussion: https://tardisbuilders.com/index.php?threads/the-original-tardis-interior-blue-prints.4825/ ; The Mind Robber historical set study: https://www.themindrobber.co.uk/tardis-set-history-console-room-design.html | Reconstruction community | Reported 43 × 35 ft *Edge of Destruction* set footprint and shown living annex; **not a 2013 metric plan**. |
| **N10** | *The Chase* history: https://en.wikipedia.org/wiki/The_Chase_%28Doctor_Who%29 ; visualiser index: https://tardis.fandom.com/wiki/Time-Space_Visualiser | Secondary discovery | Identifies device/story; dedicated room placement unverified. |
| **N11** | *The Invasion of Time* scene-labeled transcript: https://tardis.guide/story/the-invasion-of-time/transcript/ | Episode transcription | Workshop, pool, sickbay, service tunnel names, storerooms, stairs, ancillary power/gallery and navigation clues. |
| **N12** | *The Shakespeare Code* transcript: https://tardis.guide/story/the-shakespeare-code/transcript/ | Episode transcription | Doctor directly says he has an attic in the TARDIS; **not seen**. |
| **N13** | Fan / cross-media room inventory: https://tardis.fandom.com/wiki/The_Doctor%27s_TARDIS ; wardrobe taxonomy: https://tardis.fandom.com/wiki/TARDIS_wardrobe | Discovery index | Mixes TV, novel, audio, comic, reference, speculative; verify **every line's medium** before treating as television. |
| **N14** | Official Doctor Who TARDIS profile: https://www.doctorwho.tv/characters/the-tardis | Official synopsis | Names aquarium, zoo, garage, junk room, art gallery, wardrobe, pool, library; no geometric evidence. |
| **N15** | Whoniverse Technical Index: https://whoniverse.net/tardis/time_sceptre ; https://whoniverse.net/tardis/wardrobe | Fan / licensed-source synthesis | Alternative macro-spatial lore such as "Time Sceptre"; **not TV canon plan**. Their color key distinguishes source media; independently verify. |
| **N16** | *Shada* transcript/quotes: https://tardis.guide/story/shada/quotes/ | Special media history | Complex directions to kit; source-version caveat for incomplete original production. |
| **N17** | Official Doctor Who production interview, *How the TARDIS changed in Series 12*: https://www.doctorwho.tv/news-and-features/how-the-tardis-changed-in-series-12 | Direct designer commentary | 2020 removed central moving walls, added new staircase and door. |
| **N18** | Official Doctor Who interviews, *Doctor Who's directors discuss the new TARDIS*: https://www.doctorwho.tv/news-and-features/doctor-whos-directors-discuss-the-new-tardis | Production participants | New set's physical scale and functional filming design. |
| **N19** | *Doctor Who Magazine* 599, *Even Bigger on the Inside*: https://pocketmags.com/us/doctor-who-magazine/599/articles/even-bigger-on-the-inside ; concurrent production commentary: https://www.denofgeek.com/tv/russell-t-davies-explains-what-inspired-the-new-tardis/ | Contemporary production reporting | 2023 multi-level ramps, huge studio envelope, circular shutter doors, separately controlled roundel lighting; **published studio height is not TARDIS in-universe room height**. |
| **N20** | BBC America retrospective on *Journey*: https://www.bbcamerica.com/blogs/doctor-who-10-things-you-may-not-know-about-journey-to-the-centre-of-the-tardis--1013330 | BBC-affiliated documentary | Screenwriter brief and production background. Distinguish unfilmed proposals from aired rooms. |
| **N21** | *Doctor Who Magazine* 534 review of official manual: https://pocketmags.com/us/doctor-who-magazine/534/articles/tardis-type-40-instruction-manual | Licensed critical review | Notes manual is framed as an in-universe training document; its diagrams may include creative interpolation. |

**Provenance hygiene:** where a direct episode quote is available in a transcript, include episode title and a short location identifier. Do not cite fan wiki headings as proof of TV appearance. For actual measurements, store physical-plan page references and scale source. For copyright, link production imagery in the research catalog rather than bundling it.

---

# 22. Final handoff statement

The research now supplies **the primary on-screen room catalog, newly identified television-mentioned spaces, key classic-era variants, recent-era design developments, a corrected Eye/Cloister relationship, a documentation-grade constraint register, and an implementable connected-world node/edge specification**. It also identifies **unverified measurements, inaccessible original drawings, and frame-survey work still needed**.

The build agent should **not conduct ad hoc lore invention** while modeling. For each hero room, import source-linked facts, reserve unknown fields, write a minimal explicit inference record for the chosen connections, then implement walkable/cutaway meshes and test physical continuity. If a stronger frame or production plan conflicts with this proposed topology, revise the inference—not the underlying source.

**Research status:** `documentary survey substantially complete for identified major TV/official spaces; exact-geometry research incomplete pending direct frame acquisition and calibrated plans`. This is the strongest status supported by the evidence available, and it preserves a usable, cohesive, non-floating architectural specification.

---

# 23. High-value explicitly narrated TARDIS directions (additional primary dialogue audit)

Two further aired episodes offer **more precise route instructions** than a typical glimpse of an unidentified corridor. These are notable because they constrain a *sequence of turns and landmarks* but still do not establish metric lengths or a universal fixed geometry.

## 23.1 Ninth Doctor to wardrobe — *The Unquiet Dead* (2005)

The Doctor tells Rose how to reach the wardrobe from the TARDIS entrance/control area: first a left, then a right, then another left; straight ahead, beneath a staircase, past bins, and ultimately a fifth door to the left. This is a relatively specific verbal route with a **stair underpass and bin landmark**. Rose's traversal and the actual location of each turn are not presented in an uninterrupted survey. Do not infer door positions in the 2013 control room from these 2005 directions. **Status:** `TV-M navigational instruction`, confidence high for the sequence of spoken wayfinding, unknown for map geometry. [N22]

A faithful historical 2005 layout could contain `coral control → L1 → R2 → L3 → stairs underpass → bins → door-5-left → wardrobe`, with as many intermediate corridors as needed for a physically connected path. This is **an illustrative encoding of dialogue, not a production blueprint**.

## 23.2 Twelfth Doctor to toilet — *The Pilot* (2017)

When Bill requests a toilet, the Doctor points her away from the Pickwoad console toward a descending path, a first right, a second left and a **macaroon dispenser** landmark. Nardole then appears coming up the stairs while Bill heads down. This directly supports **a functional restroom reachable from the 2017 console via a stair/corridor route**, plus an intermediate food-dispenser amenity. It does not show the restroom's actual door or geometry. **Status:** `TV-M toilet + food dispenser; TV-S immediate staircase`, confidence high for dialogue/entry-level descent, inferred deeper corridor positions. [N23]

**Important exclusion:** Bill compares the console room's aesthetic to an expensive kitchen in the same scene. That line is **not evidence of a separate kitchen on board**.

### Add to TV-mentioned inventory

| ID | Feature | Appearance | What to model |
|---|---|---|---|
| `HAB-23` | Toilet/restroom accessible from Pickwoad hub | *The Pilot* (2017) | `TV-M`; reserve a human-scale door/room off a **physically connected**, inferred lower corridor |
| `HAB-24` | Macaroon dispenser | *The Pilot* (2017) | `TV-M`; small wall furnishing/passage landmark, **not** a separate room |
| `HAB-25` | Under-stair corridor, bins and multi-turn path to wardrobe | *The Unquiet Dead* (2005) | `TV-M` navigation; historical-era path, not 2013 source geometry |

### Updated proposed v1.0 graph edges (add only on corroborated design terms)

| Edge | Endpoints | Status |
|---|---|---|
| B37 | `C-L ↔ REST-CORRIDOR-2017` | Stairs from TV setting plus `INF-D` link toward toilet; separate from deep-power spine |
| B38 | `REST-CORRIDOR-2017 ↔ TOILET-2017` | `TV-M reachable`, `INF-D` actual passage geometry |
| B39 | `REST-CORRIDOR-2017 ↔ MACAROON-DISPENSER` | `TV-M` navigational landmark, modeled as **prop attached to corridor**, not graph room |

These nodes/edges are a Tier-2 extension and should not expand required Tier-1 scope. The third item is best stored as `landmark` metadata rather than as a traversable edge in a pathfinder.

- **[N22]** *The Unquiet Dead* original-airdate 2005 scene-labeled transcript: https://www.chakoteya.net/DoctorWho/27-3.htm . Doctor's multi-turn instructions for the TARDIS wardrobe.
- **[N23]** *The Pilot* original-airdate 2017 scene-labeled transcript: https://www.chakoteya.net/DoctorWho/36-1.html . Doctor's route to toilet with macaroon dispenser and Nardole coming up the stairs.

---

# 24. v1.1 — Source-verification audit and corrections (7 October 2026)

## 24.1 What this verification actually establishes

This audit rechecked selected high-impact assertions against (a) BBC/Doctor Who official descriptions or direct production-participant accounts, (b) episode dialogue transcribed independently by multiple collections, (c) published episode scene descriptions, (d) contemporary reporting and named-location production histories, and (e) firsthand public visitor accounts of the physical 2012–17 set. The exact sources appear at the end of this section. **It did not constitute a fresh frame-by-frame viewing of every episode, direct physical survey, access to the copyrighted *TARDIS Type 40 Instruction Manual* interior pages, or recovery of the original confidential art-department plans.**

Use these **verification outcomes**:

- **CONFIRMED — official/production:** independently supported by official character/reference text, designer testimony, or named production participant.
- **CONFIRMED — dialogue:** exact assertion appears in dialogue independently recorded by episode transcript/subtitle; existence/navigation claims only, **not** visual measurements.
- **CORROBORATED — scene:** episode scene descriptions and secondary still/reference sources agree; direct frame survey still pending for precise shape/count/placement.
- **CONFLICT / QUALIFY:** sources disagree or an earlier wording overreached the evidence.
- **UNVERIFIED:** no sufficient independent support found in this pass; remain a placeholder, not a specification.
- **INFERRED / DESIGN:** proposed continuous-world connection or system behavior, **not** a newly discovered canonical edge.

**Important epistemic limit:** scene-labeled transcripts often contain an editor's visual narration; these are useful leads, but must not be presented as official production scripts or independently measured frames. Two sites copying the same transcript do not supply two independent witnesses. A production designer's comments about the *studio set* establish the studio set, not the complete fictional ship.

## 24.2 Claim-by-claim verification ledger — architecture and on-screen spaces

| Audit ID | Claim under audit | Finding and corrected scope | Strongest source(s) | Build impact |
|---|---|---|---|---|
| V-A01 | TARDIS contains pool, library, art gallery, junk room, walk-in wardrobe, aquarium, zoo and garage | **CONFIRMED — official description**, not screen-proven geometry or simultaneous adjacency. The official character page lists these spaces. | [V01] | Keep separate existence records; `metrics=null`; no auto-placement. |
| V-A02 | TARDIS contains observatory, storage rooms and companion bedrooms | **CONFIRMED — official description**. Also says front entrance can route elsewhere. | [V02] | Reserve rooms; do not infer front-door junction coordinates. |
| V-A03 | The Doctor's personal bedroom exists | **NOT CONFIRMED**. The official page says it *might* exist and has not been seen. | [V02] | Mark optional/unknown, **not** a guaranteed room. |
| V-A04 | Console shell designed by Michael Pickwoad; first appears in *The Snowmen* | **CONFIRMED — contemporary 2012 release and designer interview**. | [V03], [V04], [V20] | Retain Pickwoad as target era. |
| V-A05 | Eighteen support ribs | **CONFIRMED — production-designer testimony**: 16 and 20 were considered; 18 selected. | [V03], [V04] | Model 18 major ribs; angular *regularity* still unmeasured. |
| V-A06 | Contra-rotating rotor rings divided into eighteen parts | **CONFIRMED — designer testimony**; direct room references corroborate. | [V03], [V20] | Use distinct movable rings; exact ring diameters and axes still unresolved. |
| V-A07 | Walkable gallery and stairs physically connect levels | **CONFIRMED — production design**, **CORROBORATED — firsthand visitor** who used the stairs and saw the lower region. | [V03], [V21] | Essential contiguous geometry, no teleportation. |
| V-A08 | Set is a 360-degree construction, with lower corridor-facing exit | **CORROBORATED — firsthand set-visit account**, not a measured plan. One visitor explicitly describes exit through a lower doorway toward what would be a fictional corridor. | [V21], [V22] | Strong lower door evidence; exact bearing/shape not fixed. |
| V-A09 | Four interior doorways, two upper/two lower | **UNVERIFIED AS PRIMARY**. Detailed secondary control-room catalog states count, but current audit did not enumerate all openings from primary frames or plan. | [V22] | Retain provisional `reportedDoorCount=4`, with unknown bearings and primary validation gate. |
| V-A10 | 2012–17 chamber has a verified diameter or deck heights | **UNVERIFIED**. No authentic dimensioned Pickwoad plan or calibrated multi-angle scale solution found. | [V03], [V23] | Keep physical units `null`; don't equate 2005 set size to numerical dimension. |
| V-A11 | Modern-era dimensioned props available from TARDIS Builders | **QUALIFY**: their administrator publicly stated they had been asked *not to provide* dimensioned plans for 2005-and-later props. This is a publication/access limitation, not proof plans do not exist. | [V23] | Do not claim that no plan exists anywhere. Seek legitimate licensed access if needed. |
| V-A12 | Physical console set's 360-degree, fully visible structure dictates canonical ship topology | **REJECTED inference**: studio architecture does not reveal unseen in-fiction corridor coordinates. | [V03], [V21] | Record set geometry separately from narrative connectivity. |
| V-A13 | *Journey* explicitly shows a cot/memorabilia storage room | **CORROBORATED — scene descriptions** (stone arch, Doctor's cot, toy TARDIS). | [V05], [V20] | Model an identifiable storeroom; bounds and door bearing pending frames. |
| V-A14 | Clara passes observatory and swimming pool before entering library | **CORROBORATED — independent scene descriptions** of the episode. Do not assume she walked through both rooms or that they abut one another. | [V05], [V06] | Sequence constraint only; use inferred corridor junctions. |
| V-A15 | 2013 library is definitely five stories / definitely six stories | **CONFLICT**: one independently posted scene transcript says **five ornate levels**; another says **six stories**. Neither is a measured plan. | [V05], [V06] | `levelCount=null`; block final detailed geometry until frames resolve. |
| V-A16 | 2013 library interior shot at Cardiff Castle | **CORROBORATED — production history and contemporary location documentation.** Castle footprint must not be imported as TARDIS floor plan. | [V24], [V25] | Location evidence supports textures/architecture, not fictional room scale. |
| V-A17 | ARS chamber and door that disappears/reappears when components removed | **CONFIRMED — episode dialogue**; chamber visuals corroborated by scene descriptions. | [V06] | ARS threshold has `reconfiguring` state; do not freeze vanished door as structural wall. |
| V-A18 | ARS described as machine to make machines | **CONFIRMED — episode dialogue**, production-designer's tree/circuit visual comments remain a separate asset reference. | [V06], [V20] | Core room and hanging-component kit justified. |
| V-A19 | Party walks under primary fuel cells | **CONFIRMED — episode dialogue**. It says they are *under* the cells. | [V06] | Valid vertical ordering; no metres or tunnel angle inferred. |
| V-A20 | 2013 Eye of Harmony is a star becoming black hole, suspended by engineering | **CONFIRMED — episode dialogue**; catwalk/doorway views described in scene transcript. | [V06] | Hero hazard chamber valid; its actual 3D dimensions still unverified. |
| V-A21 | The Eye directly touches the engine | **NOT ESTABLISHED**. Narrative progresses through separate deep corridors/defensive space. | [V06], [V26] | **No direct canon edge** `Eye ↔ Engine`; previous illustrative direct edge must remain superseded. |
| V-A22 | Engine reached by crossing a portal after apparent ravine | **CONFIRMED — timecoded episode dialogue** near 37:48; the engine is seen in exploded-but-frozen state. | [V26], [V06] | A portal is *real narrative topology*, not evidence for ordinary shared wall. |
| V-A23 | Episode's changing/repeating corridors yield a unique stable floor plan | **REJECTED inference**. ARS doorway event and the TARDIS's stated active interference undermine this. | [V06] | Room sequence ≠ fixed world coordinates. |
| V-A24 | The 1978 TARDIS swimming pool, workshop and storeroom network is seen | **CORROBORATED — scene-labeled *Invasion of Time* transcript**, including physical named sites and navigational dialogue. | [V10] | Historic rooms valid; their 2013 redecorated form not established. |
| V-A25 | 1978 art display conceals ancillary power station | **CORROBORATED — televised scene descriptions** and detailed specialty references. Specific paintings/hidden switch position should be checked against episode stills before asset lock. | [V10], [V27] | The hidden-functional-room mechanic is justified. |
| V-A26 | 1978 sickbay/workshop exist as separate TARDIS destinations | **CORROBORATED — scene-labeled transcripts**; not sufficient for precise adjacency. | [V10] | Distinct room IDs; connector geometry inferred. |
| V-A27 | The Zero Room exists, is a large plain healing space, then gets jettisoned | **CONFIRMED — dialogue and scene descriptions** in *Castrovalva*. A leftover door and its hinged removal appear after it vanishes. | [V11] | Historical state `jettisoned`; don't assume it still exists in a later unchanged form. |
| V-A28 | Cloister Room physically appears in *Logopolis*, associated with Cloister Bell | **CONFIRMED — episode transcript**; a room with ivy-clad pillars is described and the Bell explained. | [V12] | Use 1981-era room variant. |
| V-A29 | 1996 movie Eye and Gothic Cloister Room coexist in one spatial complex | **CORROBORATED — movie scene text and still galleries**: Eye accessible/visible in Cloister space. Precise enclosure plan still requires footage. | [V13], [V28] | Do not duplicate 1996 Eye as independent room distant from cloister. |
| V-A30 | *The Mind Robber*'s giant library is inside the TARDIS | **FALSE**, as v1.0 already corrected. It belongs to the Land of Fiction. | [V14], [V29] | Exclude from TARDIS room inventory. |
| V-A31 | Second Doctor's TARDIS power room exists and is shown | **CORROBORATED — episode transcript** places the Doctor and Jamie in a scene headed `[Power room]`. | [V14] | Historic power-room vignette allowed, dimensions unknown. |
| V-A32 | The TARDIS archives about thirty control rooms, including future arrangements | **CONFIRMED — timecoded *The Doctor's Wife* dialogue**. Count is approximate and scene-specific. | [V07] | Allow archival/control-room historical layers; don't instantiate thirty arbitrary shells. |
| V-A33 | Pool, scullery and squash court seven are jettisoned | **CONFIRMED — timecoded episode dialogue** in *The Doctor's Wife*. | [V07] | Do not assume those same physical rooms remain after this event. |
| V-A34 | The TARDIS has a kitchen | **NEWLY CONFIRMED — dialogue**, *The Curse of the Black Spot*. The Doctor points Captain Avery toward a kitchen. **Corrects HAB-10** and v1.0's uncertainty. | [V09] | `TV-M` kitchen; visual design and placement unknown. |
| V-A35 | Multiple bathrooms exist | **CONFIRMED — dialogue**, *The Curse of the Black Spot*. Several bathrooms are offered as choices. | [V09] | At least several restroom destinations; dimensions unknown. |
| V-A36 | Doctor has an attic in TARDIS | **CONFIRMED — dialogue**, *The Shakespeare Code*. The Doctor refers to an attic for containing the Carrionites. | [V15] | `TV-M` storage/attic, no geometry. |
| V-A37 | Detailed 2005 wardrobe route from console/door area | **CONFIRMED — episode dialogue**, with three initial turns, stair underpass, bins, fifth door left; exact words in [V16]. | [V16] | Era-specific wayfinding only; not transferable to 2013 door bearings. |
| V-A38 | 2017 toilet directions include macaroon dispenser | **CONFIRMED — timecoded episode dialogue**; Nardole emerges up stairs as Bill heads down. | [V08] | Place only a *provisional* lower-route vestibule/prop. |
| V-A39 | 2015 mentions Deck 7 | **CONFIRMED — episode dialogue**, specifically **waste tank on deck seven**. This is a waste-system/deck reference, not proof of a distinct visitable 'Deck 7 room'. | [V17] | Add `utility:waste_tank`, `deckLabel:7` as mentioned system, no 7 modeled decks required. |
| V-A40 | 2019 Thirteenth Doctor mentions wardrobe hall past karaoke buses in lower substrata | **CORROBORATED — episode clip/transcript**, but the interpretation of what the 'buses' are is unknown. | [V18] | Keep direction clue; do not fabricate a karaoke-bus room. |
| V-A41 | 2020 alterations add stair/door, remove walls | **CONFIRMED — official published interview** with production designer Dafydd Shurmer: three moving walls removed, staircase/upper door added. | [V19] | Separate Thirteenth Doctor era variant, not Pickwoad geometry. |
| V-A42 | 2023 control room giant, multi-directionally filmable | **CONFIRMED — official directors' comments** describing scale and sight lines; no validated internal metric floor plan. | [V30] | Later-era variant only. |
| V-A43 | Licensed 2018 Type 40 manual has floor plans | **CONFIRMED — publisher/official description**; **contents not independently reviewed in this audit**. | [V31], [V32] | Flag `licensed_uninspected`; don't treat its hypothetical layouts as TV production blueprints. |
| V-A44 | Exactly measured Pickwoad door bearings / corridor lengths can now be populated | **UNVERIFIED**. No calibrated photogrammetry performed, no uniquely authoritative measurement ledger found. | [V03], [V21], [V23] | Keep coordinates `null`; parametric greybox only until survey. |
| V-A45 | Library glimpsed in *Silence in the Library* is a TARDIS interior | **FALSE / exclusion:** the immense 'Library' is a **planetary library**, not the Doctor's TARDIS. | [V33] | Do not import another out-of-ship location. |

### Source-specific clarifications

1. **Kitchen correction is a true finding, not speculation.** The prior research had left `HAB-10` TV status unconfirmed even though the 2011 episode explicitly mentions it. `TV-M` is now the proper label; no screen geometry was verified.
2. **The 2013 pool may look 'open air'.** One independent scene description calls it an open-air swimming pool. Do not build a mandatory fully sealed, ordinary ceiling above it just because the cohesive map has enclosed structural regions. A rim/atrium/sky-simulation is a legitimate design possibility; none is screen-verified as the precise technology.
3. **Library floor-count conflict remains real:** 'five ornate levels' and 'six stories' appear in two transcript writers' descriptions. This is not evidence of two different filmed libraries. Finalize the count only from frames or authentic plans.
4. **'About thirty archived control rooms' does not establish thirty concurrent walkable rooms** or map coordinates. In-fiction temporal archival logic is explicit.
5. **The 2018 official manual is highly valuable but as yet unread at page level in this audit.** Its publication and inclusion of floor plans are verified; the actual drawing annotations, scale and design assumptions are not.
6. **'Screen accurate' is an insufficient evidence label for a generated fan build.** Enforce separate `visualBasis=episode_still|production_plan|reconstruction|concept_only`, `sourceID`, `lastFrameChecked`, `metricMethod`, `confidence`, and `rights` on every detailed asset.

## 24.3 Physical connectivity: audited truth table

This table explicitly separates **confirmed traversability** (in a particular episode) from the missing proof of **fixed permanent geometry**.

| Connection or ordering | Observed basis | Canonical minimum | Still inferred for the 3D map |
|---|---|---|---|
| Outside Police Box → 2012–17 main console | Opening/entry scenes, set access | Physical doorway exists | Precise in-world room-shell radius and outer-to-inner spatial transform |
| Console deck ↔ upper gallery ↔ lower deck | Designer's stairs/multi-level intent; actual set walkthrough | Real stairs/landings inside console shell | Landing endpoints, tread dimensions, angular positions |
| Lower console door → generic inner passage | Firsthand set-tour report of corridor-facing lower exit | At least one such lower opening physically existed on the set | Exact next junction or main ship region |
| Clara's corridor → cot room | 2013 scene sequence | Room accessible from internal passages | Door transform, room size, which corridor segment |
| Clara's route → observatory glimpse → pool glimpse → library | 2013 scene narrative | These views/space access belong to one travel episode | Literal wall adjacency, uninterrupted route, elevations, distance |
| Corridor → ARS | Characters enter via door; door vanishes/reactivates | Changeable threshold and access | Its distance from console, fixed neighboring sectors |
| Lower/deep route → *under* fuel cells | Spoken spatial description | Some tunnel part lies beneath primary fuel cells | Exact drop, number of connecting turns |
| Deep corridor → 2013 Eye chamber | Movement into room/catwalk | Eye chamber accessible during damaged state | Permanent bearing, structural shell diameter |
| Eye → engine defensive/portal region → engine | *Journey* episode chronology plus explicit 2013 portal dialogue | Portal leads onward to engine after apparent chasm | Ordinary continuous architectural bypass, portal room dimensions |
| 2005 wardrobe route | Explicit multi-turn dialogue | Directed navigable route to wardrobe in that era | Whether turns correspond to currently modelable intersections |
| 2017 toilet route | Stairs and explicit first-right/second-left/food landmark | Accessible toilet via main hub's internal route | Actual restroom door/shape, building-floor coordinate |
| 1978 storeroom/service/workshop/sickbay/pool | Scene-described travel and navigational cues | A broad route network exists | Deterministic absolute schematic |

**Practical rule for agent:** An 'A' evidence grade for a *door's presence* **must not be copied** to a made-up corridor length or world-space endpoint. Room `reachability`, `adjacency`, and `metricPlacement` must be independent fields.

## 24.4 Updated modeling freeze gates

The following may now be modeled with *canon-supported functional identity* and **source-corroborated qualitative structure**:

- 2012–17 console: 18 ribs, hexagonal console, circulating gallery, multiple elevations and stairs, contra-rotating rotor, a route toward lower exits.
- 2013 hero areas: cot storeroom; telescope observatory glimpse; pool glimpse; tall ornate library; ARS with changing doorway; under-fuel-cell corridor; 2013 Eye chamber/catwalk; defensive portal and frozen engine.
- Separately versioned historical rooms: 1981 Zero Room (jettisoned); 1981 Cloister; 1996 Gothic Eye/Cloister complex; 1978 pool/workshop/sickbay/art-covered ancillary power; multiple companion bedrooms; secondary wooden control room.
- Name-only/functional placeholders: kitchen, multiple bathrooms, attic, aquarium, zoo, garage, junk room, 2015 waste tank/deck seven, squash court seven, scullery and later karaoke-bus landmark.

**Still NOT authorized to 'lock' for canonical metric geometry:**

- numerical Pickwoad shell diameter, height, gallery elevation or stairs,
- Pickwoad door azimuths or definitive inner-door count,
- *Journey* library floor count,
- corridor-module cross-sectional metres,
- distances and permanent level transitions between distant hero rooms,
- 2013 pool's entire wall/roof/entrance layout,
- precise 2013 Eye chamber diameter/catwalk length,
- ordinary direct Eye-to-engine corridor (not supported; a portal is explicit),
- full list or actual plans from the 2018 licensed manual without reading its pages.

**Definition of 'verified enough to greybox':** qualitative shapes, known sources, at least one valid physical path per region, and unknown metric fields left parametric. **Definition of 'verified enough to declare a canonical reproduction':** direct image/plan-backed geometry, known scale calibration, identified doors/levels, and contradiction notes. The latter is **not** yet met.

## 24.5 Direct-source register (URLs and scope)

The URL is part of the data record; references are meant to be followed at the linked source. These sources substantiate only the precise claims listed above. Publication dates here are original publication dates when clearly available; transcript page crawl/edit dates are **not** episode air dates.

| Ref | Source and address | Evidence type and what it supports |
|---|---|---|
| **V01** | Doctor Who, *The TARDIS*: https://www.doctorwho.tv/characters/the-tardis | Official functional space list; **no geometry**. |
| **V02** | Doctor Who, *What is the TARDIS?*: https://www.doctorwho.tv/news-and-features/what-is-the-tardis | Official interior overview, front-door rerouting, room types; Doctor's bedroom uncertainty. |
| **V03** | Michael Pickwoad interview, republished 11 Feb 2013: https://filmsketchr.blogspot.com/2013/02/how-michael-pickwoad-designed-doctor.html | Designer's rib count, gallery access, structural inspiration and rotor design. Republished interview, not the BBC live original. |
| **V04** | *The Guardian*, Pickwoad obituary (3 Sep 2018): https://www.theguardian.com/tv-and-radio/2018/sep/03/michael-pickwoad-obituary | Independent contextual corroboration of multi-tier design and 18 ribs. |
| **V05** | *Journey*, scene-described transcript: https://transcripts.foreverdreaming.org/viewtopic.php?t=7713 | Clara's route and the **five levels** wording, which is an editorial description. |
| **V06** | *Journey*, scene-described transcript: https://www.chakoteya.net/DoctorWho/33-11.htm | Storeroom, observatory/pool/library, ARS, Eye, engine; **six stories** wording (editorial). |
| **V07** | BBC subtitle timecodes, *The Doctor's Wife*: https://subsaga.com/bbc/drama/doctor-who/series-6/4-the-doctors-wife.html | Spoken jettisoned room list and ~30 archived console rooms. |
| **V08** | BBC subtitle timecodes, *The Pilot*: https://subsaga.com/bbc/drama/doctor-who/series-10/1-the-pilot.html | Toilet directions; dispenser; lower stair use. |
| **V09** | *The Curse of the Black Spot* scene-described transcript: https://tardis.guide/story/the-curse-of-the-black-spot/transcript/ | Direct spoken mention of kitchen and multiple bathrooms; no room view. |
| **V10** | *The Invasion of Time* transcript: https://tardis.guide/story/the-invasion-of-time/transcript/ | 1978 storerooms, pool, workshop, sickbay, passages, gallery/power disguise. |
| **V11** | *Castrovalva* transcript: https://tardis.guide/story/castrovalva/transcript/ | Zero Room shape, rose smell, corridor location, jettisoning. |
| **V12** | *Logopolis* transcript: https://tardis.guide/story/logopolis/transcript/ | Physical Cloister Room, ivy, bell. |
| **V13** | 1996 TV movie transcript: https://www.chakoteya.net/8Doctor/movie.htm | Eye/Cloister same complex, narrative access. |
| **V14** | *The Mind Robber* transcript: https://tardis.guide/story/the-mind-robber/transcript/ | Genuine TARDIS power room; *later* fictional realm library (exclude). |
| **V15** | *The Shakespeare Code* transcript: https://www.chakoteya.net/DoctorWho/29-2.htm | Doctor's named attic on board, not seen. |
| **V16** | *The Unquiet Dead* transcript: https://www.chakoteya.net/DoctorWho/27-3.htm | Explicit wardrobe multi-turn directions. |
| **V17** | *The Husbands of River Song* transcript: https://www.chakoteya.net/DoctorWho/35-13.html | Deck seven's waste tank; not a visual deck survey. |
| **V18** | *Spyfall, Part One*, dialogue clip: https://clip.cafe/doctor-who-2005/font-color-ffff00-shut-up-font/ | Lower substrata / karaoke buses / wardrobe hall wording; no room shape. |
| **V19** | Doctor Who, Dafydd Shurmer interview (30 Sep 2020): https://www.doctorwho.tv/news-and-features/how-the-tardis-changed-in-series-12 | Changes to 2018–20 console (removed walls, new stairs/door). |
| **V20** | *The Doctor Who Site*, Series Seven interior: https://thedoctorwhosite.co.uk/tardis/interior/series-7-interior/ | Image/reference and layout catalog (secondary; do not treat as metric plan). |
| **V21** | Firsthand 2013 studio tour: https://pluckykelly.blogspot.com/2013/09/journey-to-official-tardis-studio-tour.html | 360-degree set, stairs walked, lower corridor-associated door exit; visitor account, not a blueprint. |
| **V22** | Secondary control-room summary: https://tardis.fandom.com/wiki/TARDIS_control_room | Claimed four inner doorways, multiple compartments; **not primary-confirmed coordinates**. |
| **V23** | TARDIS Builders admin response dated 11 Sep 2012: https://tardisbuilders.com/index.php?threads%2Fmeasurements.3765%2F= | Community publication restriction on dimensions of modern props, not proof of absence of authentic plans. |
| **V24** | *A Brief History of Time (Travel)*, *Journey* production diary: https://www.shannonsullivan.com/drwho/serials/2013e.html | Specific filming locations (Cardiff Castle, Roath Lock, quarry), dates and production set separation. |
| **V25** | Independent Cardiff Castle location visit: https://anadventurethroughtimeandspace.com/2014/07/28/cardiff-castle-library-february-2014/ | Firsthand library site identification; not fictional geometry. |
| **V26** | BBC subtitle timecodes, *Journey*: https://subsaga.com/bbc/drama/doctor-who/series-7-part-2/5-journey-to-the-centre-of-the-tardis.html | Engine portal at ~37:48 and frozen explosion ~38:23. |
| **V27** | TARDIS art-gallery synopsis: https://tardis.fandom.com/wiki/TARDIS_art_gallery | Index for art/power camouflage; verify specific props with frames. |
| **V28** | 1996 TARDIS photo catalog: https://thedoctorwhosite.co.uk/tardis/interior/1996-interior/ | Gothic Cloister/Eye visual secondary reference. |
| **V29** | Official *The Mind Robber* story: https://www.doctorwho.tv/stories/the-mind-robber | Establishes the Land of Fiction is separate from TARDIS. |
| **V30** | Doctor Who, 2023 directors on new TARDIS: https://www.doctorwho.tv/news-and-features/doctor-whos-directors-discuss-the-new-tardis | New-era interior scale, filming access; not a 2012 plan. |
| **V31** | Doctor Who, official 2018 manual announcement: https://www.doctorwho.tv/news-and-features/the-perfect-doctor-who-book-for-every-tardis-enthusiast | Existence of officially licensed floor plans and diagrams. |
| **V32** | Penguin Books publisher listing: https://www.penguin.com.au/books/doctor-who-tardis-type-40-instruction-manual-9781785943775 | Hardback (2018), identified creators, publisher and publication metadata; **not an inspected plan**. |
| **V33** | *Silence in the Library* transcript: https://tardis.guide/story/silence-in-the-library/transcript/ | Planet-wide library is destination outside TARDIS, excluded from ship map. |

## 24.6 Prioritization of remaining verifiability work

1. **Highest value, currently unverified:** legitimate acquisition or review of Pickwoad studio/production design drawings; calibrated stills from 3+ known camera positions; marked door/height/railing/rotor plans. These are blockers for physically accurate metric geometry, **not** blockers for a clearly labeled parametric 3D prototype.
2. **Next:** direct visual verification of *Journey*'s library height (5 vs 6), main door threshold, lower technical doors, pool/observatory glimpses, every ARS entrance, Eye antechamber and catwalk widths, and the portal's real scene geometry.
3. **Then:** recover classic-specific room drawings from authorized archives or licensed sources; map exact dimensions only within each historical state. A drawn floor plan in a licensed franchise book might be carefully created but is not automatically a television set construction drawing.
4. **Last:** evaluate expanded-media rooms after establishing the TV-first region; use a separate namespace and import only with medium, edition, page and continuity status.

**Audit closure:** All source-backed claims above have direct external source leads or are explicitly labeled unresolved. This represents verified **room identities, dialogue, qualitative architectural constraints and several corrections**, *not* a fully measured or universally canonical TARDIS floor plan. The build agent must preserve that limit.


## 24.7 Licensed multi-angle reference candidates (verified metadata, not measurements)

Unlike unlicensed screenshots, these publicly posted photographs have explicit reuse terms. They are viable candidates for camera calibration and photogrammetry **only after checking that each view really depicts the 2012 Pickwoad set**, mapping camera features, and respecting licensing; they do not supply 3D geometry merely by existing.

| Photo ID | File/source | Author/date/license | How to use it |
|---|---|---|---|
| `PICK-PHOTO-01` | [TARDIS 2013 set.jpg](https://commons.wikimedia.org/wiki/File:TARDIS_2013_set.jpg) | Lewis Clarke, 29 Oct 2014; CC BY-SA 2.0; original 4288 × 2848 | Physical-set overview; visible structure and railings. Preserve author, license link, changes, ShareAlike terms where applicable. |
| `PICK-PHOTO-02` | [The TARDIS Console Room (9437298228)](https://commons.wikimedia.org/wiki/File:The_TARDIS_Console_Room_%289437298228%29.jpg) | Rob Clarke, 4 Aug 2013; CC BY 2.0 | Independent camera angle useful for geometry cross-check; attribution required. |
| `PICK-PHOTO-03` | [The TARDIS console room (9437299726)](https://commons.wikimedia.org/wiki/File:The_TARDIS_console_room_%289437299726%29.jpg) | Rob Clarke, 4 Aug 2013; CC BY 2.0 | Additional distinct view; compare stair direction, repeated wall details, and apparent elevation. |
| `PICK-PHOTO-CATALOG` | [Wikimedia Commons TARDIS set (2012) category](https://commons.wikimedia.org/wiki/Category:TARDIS_set_(2012)) | Separate license/author per file | Gather multiple viewpoints; audit images individually. |

**Image rights caveat:** An image license covers the photograph under its stated terms; it does not imply an unrestricted license to unrelated copyrighted show artwork or franchise branding. Avoid copying proprietary textures/screen captures or distributing traced show art without independent rights review.

**Calibration protocol:** Record per photo `filename`, `URL`, `creator`, `captureDate`, `actualSetEra`, `cameraPoseApprox`, `visibleLandmarkIDs`, `lensOrExif`, `distortionStatus`, `imageRights`, `measurementAssumptions`, and `reprojectionResidual`. Do not report dimensions in metres without an independently measured reference length. Multiple camera views alone can yield **relative shape**, not trustworthy absolute scale without a scale constraint.
