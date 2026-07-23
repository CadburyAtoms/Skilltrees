# EDHA Settlement Audit — ten-nation pass (2026-07-22)

> STATUS: findings + PROPOSALS ONLY — nothing here is canon until Ben walks the
> question sections (Q-T/C/M/L/G/N/V/K/A/S) and rules. Section 1 (Thalendor) was
> presented 2026-07-22 and ANSWERED 2026-07-23 (see section); the walk is
> paused at Q-T6's ruling: continental hydrology derives FIRST. Systemic items S1-S9
> are mechanical generator fixes cleared to implement with the refinement run.


Ten parallel subagent audits of the ruling-161 settlement layer. Full transcripts in
tasks/*.output; this file is the working digest for the refinement pass.

## SYSTEMIC (generator-level — fix in code before any re-run)

S1. **Polygon-seam phantom coast.** Nation polygons don't abut; 3-14 px no-nation
    slivers read as "sea" via dist_to_open. Victims: Canticle (39 towns / 117k pop
    rim-qualified onto dry steppe), Thalendor (4 phantom water towns on Lunavar/Ashkar
    borders), Vorsk (2 false coastal towns on a landlocked nation), Goldenport
    (SE-mountain dry "water" cluster). FIX: dilate the nation-union mask ~10 px before
    dist_to_open, or true-sea flood fill from map corner.
S2. **No-polygon ribbon cities.** city-04/11/14/17 (Goldenport's painted carrier coast)
    are inside NO polygon (= the 4 lint warnings) -> ~1,150 km of canon guild coast got
    zero towns. FIX: extend Goldenport polygon as ribbon+islands (Q-G1).
S3. **Water towns never touch water by construction** (3-8 px annulus, reject <2 px).
    49/76 Corvaine water towns >8 km from water; Goldenport 39/120 >15 km. FIX: allow
    1-2 px bank adjacency; every water town must reference a named waterway/coast/lake.
S4. **Fort placement is undirectional** (uniform border_pts sampling). Violations of
    each nation's threat map: Lunavar (17/18 rear-area, raid front bare — violates its
    own dial basis), Vorsk (5 forts on the no-threat Kettavar border, 0 on raid axes),
    Corvaine (31/46 on the paymaster border, 2 SE), Canticle (19/21 on the seam
    artifact), Goldenport (0 harbor forts), Thalendor (0 Vorsk-border, ferry, or pass).
    FIX: per-nation directional weights from doctrine answers (gated questions).
S5. **Junction artifacts**: near-duplicate pairs 11-14 km apart (Thalendor 4 pairs incl
    its two largest), knots/blobs (Corvaine 16-in-87-km, Malcurr 4 knots, Lunavar
    capital triples, Canticle SE knot of 10). FIX: junction min_d = FULL spacing (not
    0.78x), dedupe crossings within a radius; seed road graphs with canon arteries;
    add INTER-NATION trunk edges at ruled crossings (ferry-pair, Malcurr lake crossing,
    the mouth) — cross-border trade currently generates zero settlement demand.
S6. **No resource layer**: specialty towns are canon-blank scatter everywhere (r155
    requires one line of spendable canon each). Each nation's audit proposes anchors.
    Also missing: pastoral/drove subtype (Vorsk), salt subtype (Canticle), maritime
    specialties (Goldenport).
S7. **Shrine max-remoteness semantics fit only Thalendor.** Per-nation meanings needed
    (gated): Malcurr hermitage circuit, Corvaine bell-parishes/Order nexus, Vorsk
    Razkael pass-ruins, Goldenport Luck-waystones, Lunavar moon-pool rises.
S8. **Missing waterway traces**: the Aldercourt river (painted, canon-named, untraced —
    Corvaine F2), SW-lake inflows (Thalendor F7), sea-sail travel mode absent (Sylvaneth
    + all sea trade).
S9. Stale `_basis` arithmetic citing retired r85 figures (all dials) — W32 class.

## PER-NATION HEADLINES + QUESTIONS

### Thalendor (180t; passes: wild corridor clean, barge chain excellent, shrines behave)
F: 4 phantom water towns (mt-1056, mt-1111, mt-1061 Lunavar border; mt-1112 Ashkar border); fort belt leaves Vorsk/ferry/pass/ford unguarded; 4 junction
   dup pairs; 5 towns at Black Altar's feet (mt-1123, mt-1117, mt-1120, mt-1066, mt-1041); city-33 hermit (no hinterland/road);
   city-32 shoreless while Corvaine rings the same lake; SW-lake inflows unpainted (floaters: mt-1049, mt-1103, mt-1102, mt-1073, mt-1062);
   36 specialties canon-blank. Mix 35/25/20/10/10 upheld.
SECTION ANSWERED (Ben, 2026-07-23):
Q-T1 ANSWERED — c33 STAYS at (700,1600): it is Thalendor's hub BETWEEN Heartholt and
     the SW-lake towns (mt-1073/mt-1102 cluster). Refinement: road trunk edges
     Heartholt<->c33<->the SW-lake shore; retag the phantom water towns as its road towns.
Q-T2 ANSWERED — yes, watch-forts; PLUS a general METHOD principle (applies to ALL
     nations): water-adjacency does not imply water-driver — towns on the northern
     border river can be FORT towns; a dot's driver is its purpose, not its terrain.
Q-T3 ANSWERED — Ben's ruling (new canon, his own text): the Black Altar Crossing holds
     an ANCIENT, IMPORTANT BRIDGE — the best way to cross to Canticle. The towns dried
     up and the people left, but the logistical weight keeps drawing people back:
     merchants and traders-turned-BRIDGE-KEEPERS. Not heavily populated, never void.
     Refinement: thin the 5 towns to ~2 small (cap ~2-3k), the bridge becomes a mapped
     feature at the site, one canon line for the keeper-culture.
Q-T4 ANSWERED — yes (default): split shores intended; 2-3 Thalendor shore towns +
     a lake-trade canon line.
Q-T5 ANSWERED — yes (default): the ford is deliberately porous; screen sits behind;
     canon line, no fort.
Q-T6 SUPERSEDED — Ben: local inflow patches are the wrong tool; the CONTINENTAL
     HYDROLOGY must be derived first (watersheds + tributaries for the whole map;
     lakes canon, Palewater canon, everything else derived by logic + geography).
     The question walk is PAUSED here; the hydrology pass comes before the
     settlement refinement (water towns need true rivers). Sections C/M/L/G/N/V/K/A/S
     remain queued.

### Corvaine (301t; passes: dial exact, spacing median 21.4, corridor clean, ford km checks)
F: Aldercourt has no hinterland (1 town/100 km — lattice densest on the raid frontier,
   emptiest at court); the Aldercourt river painted-but-untraced (off-bank: mt-187, mt-254); 49 water towns off
   water (worst: mt-132, mt-219); city-34 (2nd sea port) 56 km inland; 767-km coastal gap still 4 towns; 16-junction
   blob; zero cross-border settlement demand (funding axis 1 town/286 km);
   fort belt faces Malcurr not the raid rear (ford-rear pair mt-394/mt-374; BAC watch mt-383).
Q-C1 trace the Aldercourt river, navigable to the border lake? [yes+yes; head-of-nav ~city-13]
Q-C2 godless shrines = keeper bell-parishes mix + pin W12 Order nexus at an east-bank shrine? [yes]
Q-C3 fort doctrine: weight Palewater bank + ford-rear + BAC; Malcurr keeps customs pair? [yes]
Q-C4 slide city-34 east onto the shore? [yes]
Q-C5 city-35 forge city: move north to the Malcurr border axis (~1360,1170)? [yes — one belt, two sides]
Q-C6 rebalance 25-35 world-fill towns into Aldercourt's E/NE hinterland (seeds untouched)? [yes]

### Malcurr (118t)
F: mt-953 water tag 155 km dry (retag specialty); forge economy absent (only mt-998, mt-981 near Brandmere) (no ore belt —
   anchor: painted fells (1142-1262, 984-1024) + Vorsk-wall fringe); junctions starved
   AND knotted (4 blobs, none on export corridor); 3 Kettavar-border forts unjustified;
   zero internal-control forts (police state!); shrines orphaned (god missing); 7 water
   towns on uncanonical sea coast (mt-961, mt-937 north; mt-922 8.65k, mt-929, mt-966, mt-949, mt-959 east); southern lobe = 10k town 41 km from Aldercourt
   (rulings 30/57 made geometry; mt-982 in both polygons — needs bank-rule border);
   east moor void (~40% of area) needs naming as deliberate.
Q-M1 sea-coast identity: thin plague-era fringe, ~5 towns snapped to coast? [yes]
Q-M2 shrines = Watching-Mind hermitage/lesson circuit; mt-1024 retags fort? [yes]
Q-M3 Aldercourt corridor intended: bank-rule border river + keep mt-916 toll town? [yes]
Q-M4 Sevenbrand ore = the fells + border-lake forge-towns? [yes]
Q-M5 Kettavar forts: keep 1 as toll fort, 2 become lake still-house garrisons? [yes]
Q-M6 junction shortfall: densify k + seed arteries, accept residual? [yes]

### Lunavar (178t; passes: west/Goldenport rice artery well-supported)
F: fort layer inverted vs own dial basis (only mt-914 near Vorsk; 17 on friendly south);
   8 forts on the Goldenport trade border; raid front holds 4 of 6 pop-10k towns
   unfortified (mt-740, mt-744, mt-745, mt-747); 15 junctions imply roads INTO Vorsk (e.g. mt-825, mt-791, mt-766); Fenholt has no settlement under it
   (mt-740 10k is 25 km off); marsh heart ~200-km void (needs ruling); 27 specialties
   blank; shrines in drownlight fen not on rises; capital micro-clusters.
Q-L1 re-seat ~10-12 forts to the north band as causeway watch-forts? [yes]
Q-L2 keep the marsh-heart void (wet heart = larder)? [yes, amend dial note]
Q-L3 retag north junctions (~10 to water/specialty, keep 2-3 causeway gates)? [yes]
Q-L4 specialty menu: bog-iron/peat/reed/stilt-timber/rice mills by geography at naming? [yes]
Q-L5 mt-740 becomes Fenholt (snap to site)? [yes]
Q-L6 NW bay ruled tidal shallows (poled barges only) to keep landlocked premise? [yes]

### Goldenport (300t; passes: ratios canon-sound, lattice spacing healthy, toll-knots exist)
F: carrier-coast ribbon (1,150 km, 4 cities) zero towns — cities in no polygon (S2);
   39 dry water towns incl 5 of the biggest (mt-442, mt-446, mt-458, mt-457, mt-468, mt-491); outer fishery seaboard nearly portless
   (343-360 km gaps); 0 of 30 forts at harbors; shrines identityless; city ledger 3
   glyphs vs 7 tagged; SE mountain knot artifact-or-corridor.
Q-G1 extend polygon as ribbon+islands, seed 15-25 ribbon towns? [yes]
Q-G2 dry water towns: relocate inflated ones to outer seaboard/inlets; retag SE block
     as Ashkar caravan corridor? [yes]
Q-G3 outer SW seaboard = fishery string at 40-60 km (ports only)? [yes]
Q-G4 shrines = Luck-waystones + 2-3 re-sited to nexus garden for W12? [yes]
Q-G5 move 3-5 forts to harbor mouths + C11 ore quay? [yes]
Q-G6 cities: keep 3 ledger cities; C04/11/17 become top-band 10k harbor-towns in the
     ribbon roster (preserves closure)? [yes]

### Canticle (131t; passes: north Palewater strip sound, Vespera shore adequate)
F: 39 towns (117k, incl 10k pair mt-001/mt-005 + 15 forts) on the seam artifact — dry steppe, not rim;
   salt economy zero towns (nearest 223 km from the Hush); 3 towns on non-canon paint
   specks (mt-006 8.6k, mt-047, mt-050 — the last on r99's explicit stray mark); fort doctrine inverted (only mt-130 on the
   Treaty-mouth river frontier; mt-131 vs Thalendor); SE 10-town knot; mt-004 10k duplicate 29 km from
   Portavere. Rim circuit correctly NOT a closed ring (two dry caravan legs).
Q-N1 seam towns: delete/redistribute to true rim; keep 3-4 as sub-market waystations;
     no new west-border river? [yes]
Q-N2 pan rim: potable seeps -> 6-8 permanent 2-3k salt towns? [yes]
Q-N3 speck towns: delete all 3 (empty interior is load-bearing)? [yes]
Q-N4 SE knot: thin to 3, push junctions to rainroad gates? [yes]
Q-N5 fort re-aim (Vespera/Treaty-mouth/south corner/rainroad-gate law posts)? [yes]
Q-N6 mt-004: cap 6-7k as Portavere's caravan staging town? [yes]

### Vorsk (28t; passes: west-river core lattice good, ore-road artery best-supported)
F: 5 forts on no-threat Kettavar border (mt-1228, mt-1229, mt-1232, mt-1234, mt-1238), 0 on Lunavar raid axis / Thalendor watch;
   2 false coastal water towns (landlocked: mt-1216, mt-1218); mt-1213 10k flagship on the wrong
   (Malcurr) border (swap weight to ore-road mt-1214); NE specialty pair orphaned (mt-1225, mt-1226) (730-890 km from ore road); no
   pastoral driver exists in r155 for the herd nation; shrines by remoteness fit
   neither Razkael pass-ruins nor hall-based Tyrith; junction dial wrong for a
   single-artery raid nation (1 of 6 filled).
Q-V1 fort re-lay: 2 to Fenholt staging, 2 to Thalendor passes, merge Kettavar twins? [yes]
Q-V2 re-dial 20w/10sh/30sp/5j/35f? [yes]
Q-V3 swap 10k inflation onto ore-road mt-1214; mt-1213 -> 4-5k? [yes, no east-trade canon]
Q-V4 mt-1216 retag fort (ore-road pass-gate); mt-1218 move to headwaters mine/drove? [yes]
Q-V5 shrines = Razkael pass-shrine ruins re-sited onto routes? [yes — (b) Tyrith rural
     escalation is Ben's alternative]
Q-V6 add drove/shieling specialty subtype; tag 3 towns on transhumance routes? [yes]

### Kettavar (4t; passes: mt-733 roadstead = best dot on the board; 0 fort/0 junction
   verified CORRECT per canon)
F: mt-734 stranded on barren north glacier coast; mt-735 specialty on empty spine (no
   driver); mt-736 shrine inland (sacred geography is tideline); 459-km two-city axis
   has nothing; eastern lobe empty (correct).
Q-K1 mt-734 -> C1<->C2 midpoint harbor (~415,558)? [yes]
Q-K2 mt-735 -> lee-plots town under Vorsk's wall (~830,635): omen-sown grain + iron stair? [yes]
Q-K3 mt-736 -> tideline casting-shore on the west run (~350,545)? [yes]
Q-K4 eastern lobe stays dotless? [yes]
Q-K5 pastoral margin: leave ledger now; W32 decides tents-fraction vs herd re-derivation? [yes]

### Ashkar (deferred — walk agenda ready)
Model: derive-then-decimate (pre-collapse lattice, survivorship rule = water pocket/
coast/road node; one pass yields living + ruin layers). Pop: ~140-150k pre-collapse /
~55-60k current (proportional r161). Classes: living port Kaelmouth ~8k, gate-town
Kaelgate ~3k, 10-14 warlord holds 500-1500, 12-18 road-towns, ruins (2-tier: ~8-12
named sites + statistical), mobile camps 15-20%. Geography: three separated water-pocket
worlds; west outflow river is a BORDER corridor with Goldenport one bank away
(emigration made visible); Kaelmouth isolated by 470 km of desert coast.
Q-A1 pop scale ~140-150k/~55-60k, ratios survive? [yes]
Q-A2 derive-then-decimate mechanics? [yes]
Q-A3 schema: reuse r155 drivers + class + status axes? [yes]
Q-A4 hold count ~10-14, only Ashhold named now? [yes]
Q-A5 ruin tiering: ~8-12 named (Raskeld, Sunderway waystations, cascade towns), rest
     statistical? [yes]
Q-A6 mobile share ~15-20% bespoke dial? [yes]
Q-A7 keep Kaelmouth/Kaelgate glyphs despite sub-10k (collapse is the point)? [yes]
Q-A8 route entries: coastal diaspora run + west-river border crossings? [yes]

### Sylvaneth (deferred — walk agenda ready; NO population figure ever existed)
Forks: A hidden fixed lattice / B no settlements / C unmappable woven places /
D processional seats. Recommend C+D (three moving Triplet seats, graph not px).
Strait ~274 km narrowest; island 441k km2, uniform forest, zero drawn water, one tan
NE cove. Gap: no sea-sail travel mode exists (shared with all sea trade).
Q-S1 model = C flavored with D? [yes]
Q-S2 population: null (fae — not a mortal ledger)? [yes]
Q-S3 Strand = west-coast bay at the waist (~1925,1750), entered as a site? [yes]
Q-S4 mortals sail, fae don't; add sail_coastal mode (shared gap)? [yes]
Q-S5 GM interior = relation-graph, no px? [yes]
Q-S6 hydrology stays undrawn (W20 decides meaning)? [yes]
Q-S7 tan NE cove = the exile-shore? [yes]
Q-S8 carry the White wildlife debt on this agenda? [yes]

## THE HYDROLOGY BRIEF — Ben's H-answers (2026-07-23; input for the hydrology pass)

Fixed points (canon unless marked provisional):
- H1: Vorsk's mountains = the continental roof.
- H2/H3 (Ben's own canon, verbatim intent): the Palewater is the Thalendor/Corvaine
  border, fed by **LAKE MORRAIN** (Ben-named — Elmsworth/city-15 sits on it; closes a
  W30 item). The **Malcurian Lake-Tree** (provisional name) hosts Kenmere at its
  southern confluence and feeds **the Great Lake** (provisional name; Ben cited c07
  Kenmere, c09 + c13 on the Great Lake — VERIFY ids vs gazetteer). The Great Lake
  drains east to the ocean; that river IS the Malcurr/Corvaine northern border. Two
  eastern-ocean outlets total: this river + the Palewater mouth.
- H4: Thalendor's SW lake drains SW toward the Goldenport deep inlet (supersedes the
  r156 "SW off-frame Lunavar-ward" provisional).
- H5: Lunavar drains west, two outlets (Fenholt delta -> NW tidal bay; Moonmere lake ->
  the capital inlet). Vorsk's west river = its own catchment to the sea at c11.
- H6: Ashkar confirmed — west lake chain outflowing SW along the Goldenport border;
  the long NE tributary from Kaelgate east to the Palewater fork.
- H7: Lake Vespera CLOSED; ruled Earth analogue = Lake Issyk-Kul (6,236 km2 vs
  Vespera's 5,169 measured; mildly brackish, never freezes, climate-moderating shore).
- H8: Canticle rim = Australian arid-coast hydrology: ephemeral rivers, permanent
  waterhole chains on the rainroads (towns sit on waterholes), artesian/mound springs
  at the pan rim. Ben paints more given evidence.
- H9: two-source weather model approved (westerlies on the west ranges; east coast has
  its own wet season; double rain-shadow = the arid diagonal). Leylines/deities absorb
  physics strain at scale — sparingly.

FLAGS RESOLVED 2026-07-23 (Ben's layers-off screenshot + re-check of the component
analysis — the original flags 1-2 were an AUDIT ERROR, not a paint problem):
1. RESOLVED — the "one connected network" claim misread overlapping component BOUNDING
   BOXES as connectivity. The drawn systems are separate: comp 1 = Lake-Tree + Great
   Lake + drain; comp 4 = Morrain + Palewater. No repaint needed; the paint is
   hydrologically sound.
2. RESOLVED — the Aldercourt "contradiction" was never one: the Great Lake drain is ONE
   river whose upper reach forms the Malcurr/Corvaine border, then runs south past c13
   to the sea AT Aldercourt (its glyph sits at the mouth). Canon "sea-and-river port"
   reconciles; the two eastern outlets = this river + the Palewater at city-22.

STILL OPEN for the hydrology session:
A. The Lake-Tree's NE coastal arm: does the splatter lake touch the sea? If yes the
   Tree has TWO outlets (forbidden without special pleading) — a land sliver, one
   eraser stroke, or Ben canonizes a true second mouth. Check at full resolution vs
   the extraction; Ben rules.
B. What feeds Lake Morrain (derive: Vorsk south slopes + Thalendor forest — confirm).
C. Names beyond Lake Morrain stay provisional until the r118 naming walk.
D. Verify thyrcross-rivers.png freshness vs Thycross.procreate (meta.source mtime)
   before tracing — the screenshot matches the extract, so likely current.
