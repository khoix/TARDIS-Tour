import type { SourceRecord } from './types';

/**
 * Source registry. Mirrors research/sources.md (a test keeps the two in sync).
 * S01–S27 keep the IDs of research bible v2.0 §I; S28+ are the remaining
 * de-duplicated sources from §24.5 (V*), §12.10 (G*, J*) and §24.7 (PICK-*).
 */
export const SOURCES: readonly SourceRecord[] = [
  {
    id: 'S01',
    title: 'Doctor Who / BBC Studios — The TARDIS (character profile)',
    urls: ['https://www.doctorwho.tv/characters/the-tardis'],
    kind: 'official',
    aliases: ['V01'],
    verifies:
      'Names pool, library, art gallery, junk room, walk-in wardrobe, aquarium, zoo, garage. Functions only; no geometry.',
  },
  {
    id: 'S02',
    title: 'Doctor Who / BBC Studios — What is the TARDIS?',
    urls: ['https://www.doctorwho.tv/news-and-features/what-is-the-tardis'],
    kind: 'official',
    aliases: ['V02'],
    verifies:
      'Variable internal routing, front-door rerouting, observatory, multiple stores, companion bedrooms; Doctor’s bedroom uncertain.',
  },
  {
    id: 'S03',
    title: 'Michael Pickwoad designer interview (2013), republished by FilmSketchr',
    urls: ['https://filmsketchr.blogspot.com/2013/02/how-michael-pickwoad-designed-doctor.html'],
    kind: 'production',
    aliases: ['V03', 'G1'],
    verifies:
      'Designer intent: 18 ribs, accessible circulating gallery, stairs facing different directions, contra-rotating 18-division rotor. No numeric blueprint.',
  },
  {
    id: 'S04',
    title: 'The Guardian — Michael Pickwoad obituary (3 Sep 2018)',
    urls: ['https://www.theguardian.com/tv-and-radio/2018/sep/03/michael-pickwoad-obituary'],
    kind: 'press',
    aliases: ['V04', 'G3'],
    verifies: 'Independent corroboration of Pickwoad authorship, 18 ribs and multi-tier interior.',
  },
  {
    id: 'S05',
    title: 'Journey to the Centre of the TARDIS — scene-described transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/DoctorWho/33-11.htm'],
    kind: 'transcript',
    aliases: ['V06', 'J2'],
    verifies:
      'Seen destinations and narrative route order (storeroom, observatory/pool glimpses, library, ARS, fuel-cell tunnels, Eye, engine). Not measured frames; “six stories” library wording is editorial.',
  },
  {
    id: 'S06',
    title: 'Radio Times — Journey to the Centre of the TARDIS review / production notes',
    urls: [
      'https://tollbit.radiotimes.com/tv/sci-fi/doctor-who-guide/journey-to-the-centre-of-the-tardis/',
    ],
    kind: 'press',
    aliases: [],
    verifies:
      'Pool/observatory glimpse, Cardiff Castle + VFX library, ARS and Eye. Not a dimensioned survey.',
  },
  {
    id: 'S07',
    title: 'Plucky Kelly — firsthand TARDIS studio tour (Sep 2013)',
    urls: ['https://pluckykelly.blogspot.com/2013/09/journey-to-official-tardis-studio-tour.html'],
    kind: 'firsthand',
    aliases: ['V21'],
    verifies:
      '360° physical set; staircases walked; exit through a lower doorway used to represent access to further corridors. Visitor account, not a blueprint.',
  },
  {
    id: 'S08',
    title: 'Doctor Who / BBC Studios — Go inside the TARDIS with Google Street View (14 Aug 2013)',
    urls: [
      'https://www.doctorwho.tv/news-and-features/go-inside-the-tardis-with-google-street-view',
    ],
    kind: 'official',
    aliases: [],
    verifies:
      'A historical multi-position control-room panorama existed. Current playback not verified; does not enter unseen passages.',
  },
  {
    id: 'S09',
    title: 'TechCrunch — Google Maps Doctor Who TARDIS easter egg (13 Aug 2013)',
    urls: ['https://techcrunch.com/2013/08/13/google-maps-doctor-who-tardis-easter-egg/'],
    kind: 'press',
    aliases: [],
    verifies: 'Firsthand report of the multi-position tour, including the lower deck.',
  },
  {
    id: 'S10',
    title: 'The Independent (archived) — Google Street View takes a peek inside the Tardis',
    urls: [
      'https://cuttingsarchive.org/index.php/Google_Street_View_takes_a_peek_inside_the_Tardis',
    ],
    kind: 'press',
    aliases: [],
    verifies: 'Independent confirmation of the lower-level tour.',
  },
  {
    id: 'S11',
    title: 'Wikimedia Commons — TARDIS 2013 set.jpg (Lewis Clarke, 29 Oct 2014, CC BY-SA 2.0)',
    urls: ['https://commons.wikimedia.org/wiki/File:TARDIS_2013_set.jpg'],
    kind: 'photo',
    aliases: ['G5', 'PICK-PHOTO-01', 'PIC-2014-01'],
    verifies:
      'Licensed oblique view of the physical set: gallery shelves, ribs, railings, multiple level surfaces. Scale-free; 4288×2848, Nikon D5000, 18 mm.',
  },
  {
    id: 'S12',
    title:
      'Wikimedia Commons — The TARDIS Console Room (9437298228) (Rob Clarke, 4 Aug 2013, CC BY 2.0)',
    urls: ['https://commons.wikimedia.org/wiki/File:The_TARDIS_Console_Room_%289437298228%29.jpg'],
    kind: 'photo',
    aliases: ['G10', 'PICK-PHOTO-02', 'PIC-2013-02'],
    verifies: 'Licensed alternative console/rib/ceiling angle. Scale-free.',
  },
  {
    id: 'S13',
    title: 'Doctor Who World — TARDIS control room catalog',
    urls: [
      'https://doctorwhoworld.org.uk/tardis-control-room',
      'https://doctorwhoworlduk.com/tardis-control-room',
    ],
    kind: 'fan-index',
    aliases: ['G6'],
    verifies:
      'Secondary claim of four internal doors (two upper, two lower) and compartments. Not independently counted: reported=4, verified=null.',
  },
  {
    id: 'S14',
    title: 'TARDIS Builders — Tony Farrell, original Brachacki interior plans (1963)',
    urls: [
      'https://tardisbuilders.com/index.php?threads/the-original-tardis-interior-blue-prints.4825/',
    ],
    kind: 'reconstruction',
    aliases: ['G9', 'PLAN-1963'],
    verifies:
      '1963 studio set figures only (84 in console, 140 in plate). Must never be used as Pickwoad-era dimensions.',
  },
  {
    id: 'S15',
    title: 'TARDIS Builders — administrator note on modern-prop dimensions (11 Sep 2012)',
    urls: ['https://tardisbuilders.com/index.php?threads/measurements.3765/'],
    kind: 'reconstruction',
    aliases: ['V23', 'G7'],
    verifies:
      'Publication restriction on dimensioned 2005+ plans; not evidence that no authentic plan exists.',
  },
  {
    id: 'S16',
    title: 'The Doctor Who Site — Season 1–6 TARDIS interior',
    urls: ['https://thedoctorwhosite.co.uk/tardis/interior/season-1-interior/'],
    kind: 'fan-index',
    aliases: [],
    verifies: 'Early domestic cluster, science annex and wardrobe stills (The Web Planet).',
  },
  {
    id: 'S17',
    title: 'The Doctor Who Site — cross-era TARDIS room gallery',
    urls: ['https://thedoctorwhosite.co.uk/tardis/rooms/'],
    kind: 'fan-index',
    aliases: [],
    verifies:
      'Fan primary-image index for classic rooms (Zero Room, Cloister, bedrooms, wardrobe). Not a production plan.',
  },
  {
    id: 'S18',
    title: 'The Invasion of Time — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/the-invasion-of-time/transcript/'],
    kind: 'transcript',
    aliases: ['V10'],
    verifies:
      '1978 storerooms, service tunnel, stairs and broken lift, workshop, pool, sickbay, art-gallery power disguise.',
  },
  {
    id: 'S19',
    title: 'The Curse of the Black Spot — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/the-curse-of-the-black-spot/transcript/'],
    kind: 'transcript',
    aliases: ['V09'],
    verifies: 'Kitchen and multiple bathrooms are spoken; no room view.',
  },
  {
    id: 'S20',
    title: 'The Doctor’s Wife — transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/DoctorWho/32-4.htm'],
    kind: 'transcript',
    aliases: [],
    verifies:
      'Scullery, pool, squash court 7 jettisoned; archived console rooms; changing internal topology.',
  },
  {
    id: 'S21',
    title: 'The Pilot — BBC subtitle transcript (Subsaga)',
    urls: ['https://subsaga.com/bbc/drama/doctor-who/series-10/1-the-pilot.html'],
    kind: 'transcript',
    aliases: ['V08'],
    verifies: 'Toilet / macaroon-dispenser directions; lower stair use. No dimensions.',
  },
  {
    id: 'S22',
    title: 'Spyfall, Part One — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/spyfall-part-1/transcript/'],
    kind: 'transcript',
    aliases: [],
    verifies: 'Lower substrata / wardrobe hall wording. Other era; no geometry.',
  },
  {
    id: 'S23',
    title:
      'A Brief History of Time (Travel) — Journey production history; Cardiff Castle library visit',
    urls: [
      'https://www.shannonsullivan.com/drwho/serials/2013e.html',
      'https://anadventurethroughtimeandspace.com/2014/07/28/cardiff-castle-library-february-2014/',
    ],
    kind: 'production',
    aliases: ['V24', 'V25', 'J4'],
    verifies:
      'Filming locations (Cardiff Castle library, Roath Lock, quarry ravine), dedicated sets (tunnel beneath fuel cells, Eye antechamber, engine). Not a floor plan.',
  },
  {
    id: 'S24',
    title: 'TARDIS Type 40 Instruction Manual (Atkinson, Tucker, Rymill; BBC Books 2018)',
    urls: [
      'https://books.google.com/books?id=kiRtDwAAQBAJ',
      'https://www.penguin.co.uk/books/438778/doctor-who-tardis-type-40-instruction-manual-by-richard-atkinson/9781785943775',
    ],
    kind: 'licensed',
    aliases: ['V32', 'BOOK-2018'],
    verifies:
      'Licensed book with floor plans (“Corridors of Eternity”, p. 92). Plans not inspected; never a BBC set plan.',
  },
  {
    id: 'S25',
    title: 'Doctor Who Magazine #599 — Even bigger on the inside (2023 set)',
    urls: ['https://pocketmags.com/us/doctor-who-magazine/599/articles/even-bigger-on-the-inside'],
    kind: 'press',
    aliases: [],
    verifies: 'Later-era (2023) 50-ft stage height. Not applicable to 2013.',
  },
  {
    id: 'S26',
    title:
      'BBC America — 10 things you may not know about Journey to the Centre of the TARDIS (2018)',
    urls: [
      'https://www.bbcamerica.com/blogs/doctor-who-10-things-you-may-not-know-about-journey-to-the-centre-of-the-tardis--1013330',
    ],
    kind: 'press',
    aliases: ['J7'],
    verifies: 'Story motivation; distinguishes cut development material from on-screen rooms.',
  },
  {
    id: 'S27',
    title: 'The Guardian — Peter Capaldi set visit (16 Aug 2014)',
    urls: ['https://www.theguardian.com/tv-and-radio/2014/aug/16/doctor-who-peter-capaldi'],
    kind: 'press',
    aliases: [],
    verifies: 'Capaldi-era dressing: books, blackboard, lower-level decoration.',
  },
  {
    id: 'S28',
    title: 'Journey to the Centre of the TARDIS — scene-described transcript (Forever Dreaming)',
    urls: ['https://transcripts.foreverdreaming.org/viewtopic.php?t=7713'],
    kind: 'transcript',
    aliases: ['V05'],
    verifies: 'Clara’s route; “five levels” library wording (editorial, conflicts with S05).',
  },
  {
    id: 'S29',
    title: 'The Doctor’s Wife — BBC subtitle timecodes (Subsaga)',
    urls: ['https://subsaga.com/bbc/drama/doctor-who/series-6/4-the-doctors-wife.html'],
    kind: 'transcript',
    aliases: ['V07'],
    verifies: 'Spoken jettisoned-room list and ~30 archived console rooms.',
  },
  {
    id: 'S30',
    title: 'Castrovalva — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/castrovalva/transcript/'],
    kind: 'transcript',
    aliases: ['V11'],
    verifies: 'Zero Room shape and corridor location; jettisoning.',
  },
  {
    id: 'S31',
    title: 'Logopolis — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/logopolis/transcript/'],
    kind: 'transcript',
    aliases: ['V12'],
    verifies: 'Physical Cloister Room with ivy and bell.',
  },
  {
    id: 'S32',
    title: 'Doctor Who (1996 TV movie) — transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/8Doctor/movie.htm'],
    kind: 'transcript',
    aliases: ['V13'],
    verifies: 'Eye of Harmony inside the Cloister complex (1996 configuration only).',
  },
  {
    id: 'S33',
    title: 'The Mind Robber — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/the-mind-robber/transcript/'],
    kind: 'transcript',
    aliases: ['V14'],
    verifies: 'Genuine TARDIS power room; the Land of Fiction library is excluded.',
  },
  {
    id: 'S34',
    title: 'The Shakespeare Code — transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/DoctorWho/29-2.htm'],
    kind: 'transcript',
    aliases: ['V15'],
    verifies: 'Doctor’s attic named; not seen.',
  },
  {
    id: 'S35',
    title: 'The Unquiet Dead — transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/DoctorWho/27-3.htm'],
    kind: 'transcript',
    aliases: ['V16'],
    verifies: 'Multi-turn directions to the wardrobe; no bearings.',
  },
  {
    id: 'S36',
    title: 'The Husbands of River Song — transcript (Chakoteya)',
    urls: ['https://www.chakoteya.net/DoctorWho/35-13.html'],
    kind: 'transcript',
    aliases: ['V17'],
    verifies: 'Deck seven waste tank; not proof of seven modeled floors.',
  },
  {
    id: 'S37',
    title: 'Spyfall, Part One — dialogue clip (clip.cafe)',
    urls: ['https://clip.cafe/doctor-who-2005/font-color-ffff00-shut-up-font/'],
    kind: 'transcript',
    aliases: ['V18'],
    verifies: 'Lower substrata / karaoke buses / wardrobe hall wording.',
  },
  {
    id: 'S38',
    title: 'Doctor Who — How the TARDIS changed in Series 12 (Dafydd Shurmer, 30 Sep 2020)',
    urls: ['https://www.doctorwho.tv/news-and-features/how-the-tardis-changed-in-series-12'],
    kind: 'official',
    aliases: ['V19'],
    verifies: '2018–20 console changes. Other era.',
  },
  {
    id: 'S39',
    title: 'The Doctor Who Site — Series Seven TARDIS interior gallery',
    urls: ['https://thedoctorwhosite.co.uk/tardis/interior/series-7-interior/'],
    kind: 'fan-index',
    aliases: ['V20', 'G2'],
    verifies:
      'Annotated image catalog of the Pickwoad room and Journey spaces. Secondary; not a metric plan; no reuse rights assumed.',
  },
  {
    id: 'S40',
    title: 'TARDIS Wiki — TARDIS control room',
    urls: ['https://tardis.fandom.com/wiki/TARDIS_control_room'],
    kind: 'fan-index',
    aliases: ['V22'],
    verifies: 'Claimed four inner doorways and compartments. Discovery index only.',
  },
  {
    id: 'S41',
    title: 'Journey to the Centre of the TARDIS — BBC subtitle timecodes (Subsaga)',
    urls: [
      'https://subsaga.com/bbc/drama/doctor-who/series-7-part-2/5-journey-to-the-centre-of-the-tardis.html',
    ],
    kind: 'transcript',
    aliases: ['V26', 'J1'],
    verifies:
      'Timed speech anchors: engine portal ~37:48, frozen explosion ~38:23, “beneath the primary fuel cells”.',
  },
  {
    id: 'S42',
    title: 'TARDIS Wiki — TARDIS art gallery',
    urls: ['https://tardis.fandom.com/wiki/TARDIS_art_gallery'],
    kind: 'fan-index',
    aliases: ['V27'],
    verifies: 'Index for the art/ancillary-power camouflage. Verify with frames.',
  },
  {
    id: 'S43',
    title: 'The Doctor Who Site — 1996 TARDIS interior',
    urls: ['https://thedoctorwhosite.co.uk/tardis/interior/1996-interior/'],
    kind: 'fan-index',
    aliases: ['V28'],
    verifies: 'Gothic Cloister/Eye visual reference (1996 only).',
  },
  {
    id: 'S44',
    title: 'Doctor Who — The Mind Robber (official story page)',
    urls: ['https://www.doctorwho.tv/stories/the-mind-robber'],
    kind: 'official',
    aliases: ['V29'],
    verifies: 'Land of Fiction is separate from the TARDIS.',
  },
  {
    id: 'S45',
    title: 'Doctor Who — directors discuss the new TARDIS (2023)',
    urls: [
      'https://www.doctorwho.tv/news-and-features/doctor-whos-directors-discuss-the-new-tardis',
    ],
    kind: 'official',
    aliases: ['V30'],
    verifies: '2023 interior scale and filming access. Not a 2012 plan.',
  },
  {
    id: 'S46',
    title: 'Doctor Who — official announcement of the 2018 TARDIS manual',
    urls: [
      'https://www.doctorwho.tv/news-and-features/the-perfect-doctor-who-book-for-every-tardis-enthusiast',
    ],
    kind: 'official',
    aliases: ['V31'],
    verifies: 'Existence of officially licensed floor plans and diagrams (not inspected).',
  },
  {
    id: 'S47',
    title: 'Silence in the Library — transcript (TARDIS Guide)',
    urls: ['https://tardis.guide/story/silence-in-the-library/transcript/'],
    kind: 'transcript',
    aliases: ['V33'],
    verifies: 'Planet-wide library is outside the TARDIS; excluded from the ship map.',
  },
  {
    id: 'S48',
    title: 'Radio Times — “Trashing the Tardis” (27 Apr 2013), Doctor Who Cuttings Archive',
    urls: ['https://cuttingsarchive.org/index.php/Trashing_the_Tardis'],
    kind: 'press',
    aliases: ['G4'],
    verifies: 'Pickwoad on construction, dismantling and design inspirations.',
  },
  {
    id: 'S49',
    title: 'Reddit — TARDIS console room build to scale (Mar 2022)',
    urls: ['https://www.reddit.com/r/DoctorWhumour/comments/t2svaa'],
    kind: 'fan-index',
    aliases: ['G8'],
    verifies:
      'Unverified ~50 ft estimate. Lead only; rejected as a dimension (no measurement chain).',
  },
  {
    id: 'S50',
    title:
      'Creative Criticality — Timestamp #245: Journey to the Centre of the TARDIS (6 Apr 2022)',
    urls: [
      'https://creativecriticality.net/2022/04/06/timestamp-245-journey-to-the-centre-of-the-tardis/',
    ],
    kind: 'fan-index',
    aliases: ['J3'],
    verifies: 'Secondary recap confirming the observatory → pool → library sequence.',
  },
  {
    id: 'S51',
    title: 'Doctor Who TV — Journey promotional gallery (23 Apr 2013)',
    urls: ['https://www.doctorwhotv.co.uk/journey-to-the-centre-of-the-tardis-gallery-48101.htm'],
    kind: 'production',
    aliases: ['J5'],
    verifies: 'BBC promotional stills; linked reference only (BBC rights).',
  },
  {
    id: 'S52',
    title: 'TARDIS Builders — TARDIS Architectural Reconfiguration System thread (2013)',
    urls: [
      'https://tardisbuilders.com/index.php?threads/tardis-architectural-reconfiguration-system.4668/',
    ],
    kind: 'reconstruction',
    aliases: ['J6'],
    verifies: 'ARS screen grabs and reported design-sketch trail. Not a dimensional plan.',
  },
  {
    id: 'S53',
    title: 'Doctor Who — Journey to the Centre of the TARDIS (official story page)',
    urls: ['https://www.doctorwho.tv/stories/journey-to-the-centre-of-the-tardis'],
    kind: 'official',
    aliases: ['J8'],
    verifies: 'Official episode identity (first broadcast 27 Apr 2013) and premise.',
  },
  {
    id: 'S54',
    title:
      'Wikimedia Commons — The TARDIS console room (9437299726) (Rob Clarke, 4 Aug 2013, CC BY 2.0)',
    urls: ['https://commons.wikimedia.org/wiki/File:The_TARDIS_console_room_%289437299726%29.jpg'],
    kind: 'photo',
    aliases: ['PICK-PHOTO-03'],
    verifies: 'Additional licensed view for stair direction and elevation comparison. Scale-free.',
  },
  {
    id: 'S55',
    title: 'Wikimedia Commons — Category: TARDIS set (2012)',
    urls: ['https://commons.wikimedia.org/wiki/Category:TARDIS_set_(2012)'],
    kind: 'photo',
    aliases: ['PICK-PHOTO-CATALOG', 'PIC-CATALOG'],
    verifies: 'Candidate viewpoints; each file separately licensed and audited.',
  },
  {
    id: 'S56',
    title: 'Doctor Who — A Brief History of the Doctor’s TARDIS',
    urls: ['https://www.doctorwho.tv/news-and-features/a-brief-history-of-the-doctors-tardis'],
    kind: 'official',
    aliases: [],
    verifies: 'Official cross-era overview of control-room designs. No geometry.',
  },
];

const SOURCE_INDEX = new Map(SOURCES.map((s) => [s.id, s]));

export function getSource(id: string): SourceRecord | undefined {
  return SOURCE_INDEX.get(id);
}
