# EDHA Settlement Audit — ten-nation pass (2026-07-22)

> STATUS: findings + PROPOSALS ONLY — nothing here is canon until Ben walks the
> question sections (Q-T/C/M/L/G/N/V/K/A/S) and rules. Section 1 (Thalendor) was
> presented 2026-07-22; the walk is paused at Ben's request. Systemic items S1-S9
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
F: 4 phantom water towns; fort belt leaves Vorsk/ferry/pass/ford unguarded; 4 junction
   dup pairs; 5 towns at Black Altar's feet; city-33 hermit (no hinterland/road);
   city-32 shoreless while Corvaine rings the same lake; SW-lake inflows unpainted;
   36 specialties canon-blank. Mix 35/25/20/10/10 upheld.
Q-T1 west road: slide city-33 south onto the SW-lake west-shore road (~720,1780)? [default yes]
Q-T2 Vorsk border: 2-3 watch-forts at NW border-water crossings? [yes]
Q-T3 Black Altar: shunned — enforce ~45 km empty radius? [yes, move 3 specialty + retag 1]
Q-T4 great lake: split shores intended; add 2-3 Thalendor shore towns + lake-trade line? [yes]
Q-T5 Palewater Ford: deliberately porous (screen sits behind); one canon line, no fort? [yes]
Q-T6 SW-lake inflows: mint 2 provisional NE feeder polylines, towns snap? [yes]

### Corvaine (301t; passes: dial exact, spacing median 21.4, corridor clean, ford km checks)
F: Aldercourt has no hinterland (1 town/100 km — lattice densest on the raid frontier,
   emptiest at court); the Aldercourt river painted-but-untraced; 49 water towns off
   water; city-34 (2nd sea port) 56 km inland; 767-km coastal gap still 4 towns; 16-junction
   blob; zero cross-border settlement demand (funding axis 1 town/286 km);
   fort belt faces Malcurr not the raid rear.
Q-C1 trace the Aldercourt river, navigable to the border lake? [yes+yes; head-of-nav ~city-13]
Q-C2 godless shrines = keeper bell-parishes mix + pin W12 Order nexus at an east-bank shrine? [yes]
Q-C3 fort doctrine: weight Palewater bank + ford-rear + BAC; Malcurr keeps customs pair? [yes]
Q-C4 slide city-34 east onto the shore? [yes]
Q-C5 city-35 forge city: move north to the Malcurr border axis (~1360,1170)? [yes — one belt, two sides]
Q-C6 rebalance 25-35 world-fill towns into Aldercourt's E/NE hinterland (seeds untouched)? [yes]

### Malcurr (118t)
F: mt-953 water tag 155 km dry (retag specialty); forge economy absent (no ore belt —
   anchor: painted fells (1142-1262, 984-1024) + Vorsk-wall fringe); junctions starved
   AND knotted (4 blobs, none on export corridor); 3 Kettavar-border forts unjustified;
   zero internal-control forts (police state!); shrines orphaned (god missing); 7 water
   towns on uncanonical sea coast; southern lobe = 10k town 41 km from Aldercourt
   (rulings 30/57 made geometry; mt-982 in both polygons — needs bank-rule border);
   east moor void (~40% of area) needs naming as deliberate.
Q-M1 sea-coast identity: thin plague-era fringe, ~5 towns snapped to coast? [yes]
Q-M2 shrines = Watching-Mind hermitage/lesson circuit; mt-1024 retags fort? [yes]
Q-M3 Aldercourt corridor intended: bank-rule border river + keep mt-916 toll town? [yes]
Q-M4 Sevenbrand ore = the fells + border-lake forge-towns? [yes]
Q-M5 Kettavar forts: keep 1 as toll fort, 2 become lake still-house garrisons? [yes]
Q-M6 junction shortfall: densify k + seed arteries, accept residual? [yes]

### Lunavar (178t; passes: west/Goldenport rice artery well-supported)
F: fort layer inverted vs own dial basis (1/18 near Vorsk; 17 on friendly south);
   8 forts on the Goldenport trade border; raid front holds 4 of 6 pop-10k towns
   unfortified; 15 junctions imply roads INTO Vorsk; Fenholt has no settlement under it
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
   39 dry water towns incl 5 of the biggest; outer fishery seaboard nearly portless
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
F: 39 towns (117k, incl 2x10k + 15 forts) on the seam artifact — dry steppe, not rim;
   salt economy zero towns (nearest 223 km from the Hush); 3 towns on non-canon paint
   specks (one is r99's explicit stray mark); fort doctrine inverted (1 fort on the
   Treaty-mouth river frontier); SE 10-town knot; mt-004 10k duplicate 29 km from
   Portavere. Rim circuit correctly NOT a closed ring (two dry caravan legs).
Q-N1 seam towns: delete/redistribute to true rim; keep 3-4 as sub-market waystations;
     no new west-border river? [yes]
Q-N2 pan rim: potable seeps -> 6-8 permanent 2-3k salt towns? [yes]
Q-N3 speck towns: delete all 3 (empty interior is load-bearing)? [yes]
Q-N4 SE knot: thin to 3, push junctions to rainroad gates? [yes]
Q-N5 fort re-aim (Vespera/Treaty-mouth/south corner/rainroad-gate law posts)? [yes]
Q-N6 mt-004: cap 6-7k as Portavere's caravan staging town? [yes]

### Vorsk (28t; passes: west-river core lattice good, ore-road artery best-supported)
F: 5 forts on no-threat Kettavar border, 0 on Lunavar raid axis / Thalendor watch;
   2 false coastal water towns (landlocked); mt-1213 10k flagship on the wrong
   (Malcurr) border; NE specialty pair orphaned (730-890 km from ore road); no
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
