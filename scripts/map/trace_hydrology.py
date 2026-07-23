"""Continental hydrology pass — trace Ben's drawn water into queryable gazetteer canon.

Scales the ruling-156 tributary method to the whole continent (the 2026-07-23 hydrology
brief in EDHA_SETTLEMENT_AUDIT.md is the input contract: Ben's H1-H9 fixed points +
resolved flags). What it does, deterministically from CONFIG:

  1. classifies the drawn water (thyrcross-rivers.png alpha) + the open sea
     (border-connected navy flood fill on thyrcross.png);
  2. extracts LAKES as seed-grown wide-water regions (morphological opening per lake —
     a dt threshold alone can't work: the Palewater is drawn over-width, ruling 153);
  3. traces PAINTED waterways as skeleton shortest paths between CONFIG endpoints
     (Zhang-Suen at ds=2, the trace_rivers.py machinery), clips them at lake shores,
     and bridges declared paint gaps (e.g. the dashed Aldercourt-mouth reach);
  4. carries DERIVED waterways (hand-authored courses, `painted: false` — guide-layer
     material for Ben's brush) with mouths snapped to lake shores / parent channels;
  5. partitions the land into BASINS by multi-source geodesic BFS from each system's
     water (sea-adjacent land that reaches the coast first falls to the coastal-fringe
     residual) — divides are SCHEMATIC (nearest-water, no elevation model) and say so;
  6. writes lakes[] / waterways upserts / basins[] / meta.hydrology to the gazetteer.

Conventions it encodes (lint_map.py enforces them):
  * polylines run SOURCE -> MOUTH; `flow` states the compass story.
  * every waterway carries `mouth` {type: sea|lake|waterway|pan, ref} — mouths are
    load-bearing (towns snap there), middles are Ben's to repaint freely.
  * ONE outlet per lake; a lake with an outlet lists >=1 inflow (H-brief law).
  * names stay provisional until the ruling-118 naming walk (gate C) — only
    Ben-named waters (Lake Morrain, Lake Vespera) ship non-provisional.

Usage:
  python scripts/map/trace_hydrology.py            # report only
  python scripts/map/trace_hydrology.py --update   # write the gazetteer
"""
import argparse
import math
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

import maplib

DS = 2          # skeleton downsample (finer than trace_rivers' 3: braided reaches)
BASIN_DS = 4    # geodesic-partition downsample
ALPHA = 60      # rivers-layer paint threshold
EPS = 1.5       # Douglas-Peucker (skeleton px units)
SHORE_EPS = 2.0

# ---------------------------------------------------------------------------
# CONFIG — the continental inventory (full-res px on thyrcross.png).
# Derivation basis: the 2026-07-23 hydrology brief (Ben's H1-H9 + resolved flags
# 1/2/A) + the drawn-water component analysis of this pass. Everything spatial
# below was read off the paint, not invented.
# ---------------------------------------------------------------------------

LAKES = [
    # id, name (None = unnamed, gate C), provisional, seed px, opening radius px,
    # grown (False = take the whole painted component: marsh/narrow lakes), basis
    dict(id="lake-morrain", name="Lake Morrain", provisional=False,
         seed=(1030, 1300), radius=15,
         basis="Ben-named 2026-07-23 (H2, closes a W30 item). Elmsworth (city-15) at "
               "its outflow, city-32 on the NE-arm shore; fed from Vorsk's south "
               "slopes (painted) + the Thalendor forest (derived) — gate B default. "
               "Its outflow IS the Palewater head (ruling 151's 'lake outflow')."),
    dict(id="great-lake", name=None, provisional=True,
         seed=(1290, 1130), radius=15,
         basis="'The Great Lake' (Ben's provisional name, H2/flag-A). Receives the "
               "Malcurian Lake-Tree stem (NE) + the west-lake inflow (W); city-09 "
               "Brandmere on the N shore, city-13 at the S-corner outlet. Single "
               "outlet: the Aldercourt drain (flag-2 resolution)."),
    dict(id="great-west-lake", name=None, provisional=True,
         seed=(1030, 1040), radius=12,
         basis="The small west lake feeding the Great Lake from the west (flag-A "
               "arrow). Own inflow derived from Vorsk's east slopes (paint specks "
               "at (968-975, 1024-1028) anchor it)."),
    dict(id="tree-ne-lake", name=None, provisional=True,
         seed=(1580, 720), radius=12, headwater=True,
         basis="The Lake-Tree's NE splatter lake — a HEADWATER near the coast, not "
               "an outlet (flag-A, Ben's arrows): it does not touch the sea; flow "
               "leaves SW down the stem. city-03 on its shore. Headwater lake: "
               "collects its own coastal hills, inflows sub-scale."),
    dict(id="tree-mid-lake", name=None, provisional=True,
         seed=(1400, 790), radius=10, headwater=True,
         basis="Lake-Tree arm lake by city-05; drains SE into the stem. "
               "Headwater lake, inflows sub-scale."),
    dict(id="tree-east-lake", name=None, provisional=True,
         seed=(1600, 920), radius=10, headwater=True,
         basis="Lake-Tree east-arm lake; drains W to the Kenmere confluence. "
               "Headwater lake, inflows sub-scale."),
    dict(id="tree-west-lake", name=None, provisional=True,
         seed=(1420, 935), radius=10, headwater=True,
         basis="Lake-Tree west-arm lake; drains E to the Kenmere confluence. "
               "Kenmere (city-07) sits at the arms' southern confluence (H2). "
               "Headwater lake, inflows sub-scale."),
    dict(id="thalendor-sw-lake", name=None, provisional=True,
         seed=(850, 1900), radius=15,
         basis="Thalendor's SW lake (H4): drains SW toward the Goldenport deep "
               "inlet; city-21 on the S shore; the audit-F7 floater towns "
               "(mt-1049/1062/1073/1102/1103) mark its unpainted N-shore inflows."),
    dict(id="moonmere-lake", name=None, provisional=True,
         seed=(460, 2065), radius=10,
         basis="Moonmere's lake (H5): drains NW by its painted outlet channel into "
               "the head of the Goldenport deep inlet ('the capital inlet'). "
               "Moonmere (city-23) NE shore; city-24 Goldenport by the SW lobe."),
    dict(id="fenholt-lake", name=None, provisional=True,
         seed=(560, 1360), radius=None,  # whole component: marsh-lake
         basis="Lunavar's fen water (H5) — not an open lake: the drawn body is a "
               "winding marsh-lake chain (the drownlight fen's open water), "
               "draining by the dashed Fenholt delta into the NW tidal bay (Q-L6 "
               "tidal shallows). Inflows derived (the paint speck at (693,1303) "
               "anchors the NE one)."),
    dict(id="raskeld-lake", name=None, provisional=True,
         seed=(470, 2365), radius=8,
         basis="The lowest lake of Ashkar's mountain-locked west chain (H6); "
               "Raskeld (city-28) on its E end; outflows SW along the Goldenport "
               "border to the sea."),
    dict(id="ashkar-chain-upper", name=None, provisional=True,
         seed=(532, 2188), radius=None, headwater=True,
         basis="Upper lake of the west chain (painted; connectors to the mid lake "
               "unpainted — proposed as guides). Headwater lake, inflows "
               "sub-scale."),
    dict(id="ashkar-chain-mid", name=None, provisional=True,
         seed=(550, 2242), radius=None,
         basis="Middle lake of the west chain (painted)."),
    dict(id="ashhold-tarn", name=None, provisional=True,
         seed=(750, 2330), radius=None, closed=True,
         basis="Mountain-interior pocket lake NE of the Ashhold — one of Ashkar's "
               "'three separated water-pocket worlds'. Default: closed pocket, no "
               "surface outflow (flagged for Ben — alt: seasonal sink)."),
    dict(id="lake-vespera", name="Lake Vespera", provisional=False,
         seed=(1010, 2395), radius=None, closed=True,
         basis="CLOSED (H7) — ruled Earth analogue Lake Issyk-Kul (mildly brackish, "
               "never freezes, climate-moderating shore). Canon-named ruling 105; "
               "Ashkar's own name is Kaelmere (ruling 136); site west-border-lake; "
               "Ashkar holds ~95% of the paint, Canticle the E shore (ruling 100). "
               "Short mountain feeders derived per the inflow law."),
]

# painted waterways: skeleton-traced between endpoints. src -> dst = source -> mouth.
TRACES = [
    dict(id="vorsk-west-river", src=(770, 1050), dst=(455, 1130), clip=(),
         flow="east-to-west: rises in Vorsk's western mountains, reaches the sea at city-11",
         mouth=dict(type="sea"),
         basis="H5: Vorsk's west river is its own catchment to the sea at city-11. "
               "Painted. Headwater ink interleaves with the Morrain feeders' around "
               "the Kragmoot-Tirgard braid — the divide there is schematic."),
    dict(id="morrain-feeder-north", src=(905, 1180), dst=(990, 1260),
         clip=("lake-morrain",),
         flow="northwest-to-southeast: off Vorsk's south slopes into Lake Morrain's north arm",
         mouth=dict(type="lake", ref="lake-morrain"),
         basis="Gate B default (Ben 2026-07-23: 'go with defaults'): Lake Morrain is "
               "fed by Vorsk's south slopes — this painted strand through the "
               "Tirgard reach is that feeder."),
    dict(id="tree-stem", src=(1580, 720), dst=(1290, 1130),
         clip=("tree-ne-lake", "great-lake"),
         flow="southwest down the Malcurian Lake-Tree's stem: NE headwater lake past "
              "Kenmere into the Great Lake",
         mouth=dict(type="lake", ref="great-lake"),
         basis="Flag-A (Ben's arrows): all Tree arms -> stem -> Great Lake. The NE "
               "splatter lake is the headwater; a coast-adjacent headwater draining "
               "inland is sound (elevation, not proximity)."),
    dict(id="tree-east-arm", src=(1600, 920), dst=(1540, 950),
         clip=("tree-east-lake",),
         flow="east-to-west: the east splatter lake into the stem at the Kenmere confluence",
         mouth=dict(type="waterway", ref="tree-stem"),
         basis="Painted Tree arm; Kenmere (city-07) sits at the southern confluence (H2)."),
    dict(id="tree-west-arm", src=(1420, 935), dst=(1510, 975),
         clip=("tree-west-lake",),
         flow="west-to-east: the west splatter lake into the stem below Kenmere",
         mouth=dict(type="waterway", ref="tree-stem"),
         basis="Painted Tree arm (H2 confluence structure)."),
    dict(id="tree-mid-arm", src=(1400, 790), dst=(1480, 840),
         clip=("tree-mid-lake",),
         flow="northwest-to-southeast: the lake by city-05 into the stem",
         mouth=dict(type="waterway", ref="tree-stem"),
         basis="Painted Tree arm."),
    dict(id="great-lake-west-inflow", src=(1030, 1040), dst=(1180, 1110),
         clip=("great-west-lake", "great-lake"),
         flow="west-to-east: the west lake into the Great Lake",
         mouth=dict(type="lake", ref="great-lake"),
         basis="Flag-A: the Great Lake takes a west inflow from the small west lake. Painted."),
    dict(id="great-lake-drain", src=(1290, 1130), dst=(1490, 1435),
         clip=("great-lake",),
         extra_tail=[(1510, 1455), (1518, 1470), (1521, 1480), (1525, 1497)],
         flow="north-to-south: leaves the Great Lake's south corner past city-13 to "
              "the sea AT Aldercourt; the upper reach IS the Malcurr/Corvaine border",
         mouth=dict(type="sea"),
         basis="Flag-2 resolution: ONE river — upper reach the border, then south "
               "past city-13 to the sea at Aldercourt (glyph at the mouth; the "
               "'sea-and-river port' canon reconciles). Lower reach painted as "
               "dashes (comps at (1517,1458)-(1528,1501)) — bridged here. "
               "Navigability is Q-C1's call (defaults yes, head of navigation "
               "~city-13) — GATED to the Corvaine section walk, not ruled here. "
               "Closes audit S8's 'Aldercourt river painted-but-untraced'."),
    dict(id="moonmere-outlet", src=(460, 2065), dst=(360, 1944),
         clip=("moonmere-lake",),
         flow="southeast-to-northwest: Moonmere's lake into the head of the "
              "Goldenport deep inlet (the capital inlet)",
         mouth=dict(type="sea"),
         basis="H5. Painted, complete — the dash marks threading the inlet are its "
               "estuary channel."),
    dict(id="raskeld-outflow", src=(470, 2365), dst=(292, 2512),
         clip=("raskeld-lake",),
         flow="northeast-to-southwest: the west chain's outflow along the Goldenport "
              "border to the sea",
         mouth=dict(type="sea"),
         basis="H6: the mountain-locked west lake chain outflows SW along the "
               "Goldenport border. Painted."),
]

# derived waterways: hand-authored source->mouth courses, painted:false (guide
# layer) unless the course rides existing paint (painted=True override).
DERIVED = [
    dict(id="fenholt-delta", painted=True,
         pts=[(495, 1452), (478, 1462), (455, 1466), (424, 1430), (408, 1412),
              (395, 1388)],
         flow="east-to-west: the marsh lake's dashed delta into the NW tidal bay",
         mouth=dict(type="sea"),
         basis="H5: Fenholt delta -> NW tidal bay (Q-L6 tidal shallows keep the "
               "landlocked premise). The delta IS painted — as distributary "
               "dashes (comps at (391-487, 1374-1481)); this course threads "
               "their centroids from the marsh's SW shore."),
    dict(id="morrain-forest-feeder",
         pts=[(898, 1312), (922, 1324), (948, 1334)],
         flow="southwest-to-northeast: out of the Thalendor forest into Lake "
              "Morrain's west shore",
         mouth=dict(type="lake", ref="lake-morrain"),
         basis="Gate B default: Morrain's second feeder is the Thalendor forest. "
               "SHORT by the terrain's own logic — trib-T1 drains the deeper "
               "forest band into the Palewater, so Morrain's forest water rises "
               "in the strip north of T1's line (no channel crossing). DERIVED; "
               "mouth on the W shore, clear of the Elmsworth outflow."),
    dict(id="sw-lake-drain",
         pts=[(792, 1958), (740, 1966), (688, 1974), (636, 1982), (585, 1988),
              (540, 1986), (498, 1972), (455, 1960), (415, 1950), (378, 1942)],
         flow="east-to-west: the SW lake's drain along the Ashkar mountain front, "
              "north of Moonmere's lake, into the head of the Goldenport deep inlet",
         mouth=dict(type="sea"),
         basis="H4 (literal default): 'drains SW toward the Goldenport deep inlet' — "
               "an independent mouth at the inlet head, the course pinched between "
               "the mountain front and the dry belt. FLAGGED fork F1 for Ben: the "
               "alternative (joining Moonmere's lake's east lobe, one shared basin) "
               "flips freely — mouth would move to the lake shore."),
    dict(id="sw-lake-inflow-n1",
         pts=[(800, 1710), (812, 1745), (820, 1780), (826, 1806)],
         flow="north-to-south: Thalendor forest feeder into the SW lake's NW shore",
         mouth=dict(type="lake", ref="thalendor-sw-lake"),
         basis="Audit F7: the SW-lake floater towns (mt-1073/mt-1102 at the NW "
               "shore) need their inflows. DERIVED; mouth load-bearing for them."),
    dict(id="sw-lake-inflow-n2",
         pts=[(942, 1738), (926, 1772), (912, 1802), (898, 1834)],
         flow="north-to-south: Thalendor forest feeder into the SW lake's NE shore",
         mouth=dict(type="lake", ref="thalendor-sw-lake"),
         basis="Audit F7 (mt-1049/mt-1103 at the NE shore). DERIVED."),
    dict(id="fenholt-inflow-northeast",
         pts=[(755, 1240), (722, 1268), (694, 1292), (668, 1302)],
         flow="northeast-to-southwest: off the south face of the Vorsk SW "
              "foothills into the fen's upper east shore",
         mouth=dict(type="lake", ref="fenholt-lake"),
         basis="Lake-with-outflow law: the fen needs inflows. Rises SOUTH of the "
               "west river's valley ridge (a course from further north would "
               "cross the painted river); the paint speck at (693,1303) anchors "
               "it. DERIVED."),
    dict(id="fenholt-inflow-east",
         pts=[(772, 1372), (736, 1384), (702, 1392), (670, 1398)],
         flow="east-to-west: off Thalendor's west edge into the marsh lake",
         mouth=dict(type="lake", ref="fenholt-lake"),
         basis="Lake-with-outflow law; second feeder from the forest side. DERIVED."),
    dict(id="great-west-lake-feeder",
         pts=[(905, 975), (925, 995), (945, 1012), (960, 1026)],
         flow="northwest-to-southeast: off Vorsk's east slopes into the west lake",
         mouth=dict(type="lake", ref="great-west-lake"),
         basis="Lake-with-outflow law; paint specks at (968-975, 1024-1028) anchor "
               "it. DERIVED."),
    dict(id="moonmere-inflow-ne",
         pts=[(628, 1900), (605, 1935), (582, 1970), (562, 2005), (548, 2028)],
         flow="northeast-to-southwest: out of Lunavar's fen into the lake's NE lobe",
         mouth=dict(type="lake", ref="moonmere-lake"),
         basis="Lake-with-outflow law (the painted SE mountain-foot arm below "
               "city-24 is a second, drawn inflow). DERIVED."),
    dict(id="vespera-feeder-north",
         pts=[(958, 2318), (980, 2345), (995, 2368)],
         flow="north-to-south: Ashkar range feeder into Lake Vespera",
         mouth=dict(type="lake", ref="lake-vespera"),
         basis="Closed lake still takes inflows (Issyk-Kul analogue, H7). DERIVED."),
    dict(id="vespera-feeder-west",
         pts=[(902, 2408), (930, 2400), (955, 2396)],
         flow="west-to-east: Ashkar range feeder into Lake Vespera",
         mouth=dict(type="lake", ref="lake-vespera"),
         basis="Closed-lake inflow (H7). DERIVED."),
    dict(id="ashkar-chain-connector-1",
         pts=[(532, 2192), (538, 2214), (544, 2230), (550, 2240)],
         flow="north-to-south: the upper chain lake into the middle lake",
         mouth=dict(type="lake", ref="ashkar-chain-mid"),
         basis="H6 chain structure; the connecting reaches are unpainted. DERIVED — "
               "fork F2 flagged (alt: underground/karst connectors, mountain-locked "
               "flavor)."),
    dict(id="ashkar-chain-connector-2",
         pts=[(548, 2248), (534, 2280), (518, 2310), (502, 2335), (488, 2352)],
         flow="north-to-south: the middle lake into Raskeld's lake",
         mouth=dict(type="lake", ref="raskeld-lake"),
         basis="H6 chain structure (fork F2 as above). DERIVED."),
]

# Canticle rainroads (H8: Australian arid-coast model) — ephemeral washes running
# INTO the Hush's pan (endorheic); permanent waterhole chains along them.
PAN = dict(center=(1600, 2475), rx=76, ry=51,   # ~240 x 160 km pan-and-flats, r99
           basis="The Hush (ruling 99/105): seasonal salt pan, schematic ellipse — "
                 "Ben's brush is the shape's truth.")
RAINROADS = [
    dict(id="rainroad-north",
         pts=[(1430, 2225), (1458, 2262), (1484, 2300), (1508, 2340), (1532, 2376),
              (1556, 2408)],
         flow="northwest-to-southeast: from the Palewater-strip rim into the pan's north rim",
         basis="H8 + r99: the washes vein the plain and die into the pan. Head at "
               "the north-rim town belt (mt-003/mt-028/mt-035 band)."),
    dict(id="rainroad-northeast",
         pts=[(1700, 2190), (1692, 2240), (1682, 2290), (1670, 2340), (1662, 2395)],
         flow="north-to-south: from the east-rim road belt into the pan's NE rim",
         basis="H8 + r99 (mt-030/mt-046/mt-068 band)."),
    dict(id="rainroad-east",
         pts=[(1880, 2330), (1832, 2360), (1786, 2394), (1740, 2428), (1698, 2458)],
         flow="east-to-west: from the coast rim by Arcanta into the pan's east rim",
         basis="H8 + r99; the Arcanta caravan door to the pan country."),
    dict(id="rainroad-south",
         pts=[(1360, 2790), (1420, 2736), (1472, 2680), (1520, 2624), (1556, 2572),
              (1574, 2540)],
         flow="southwest-to-northeast: from the south-coast rim into the pan's south rim",
         basis="H8 + r99; the southern dry caravan leg (the rim circuit is "
               "deliberately not a closed ring)."),
    dict(id="rainroad-west",
         pts=[(978, 2445), (1050, 2450), (1125, 2455), (1200, 2460), (1275, 2463),
              (1350, 2466), (1425, 2469), (1516, 2472)],
         flow="west-to-east: from Lake Vespera's east-shore rim into the pan's west rim",
         basis="H8 + r99; the long Vespera->Hush rainroad (the classic waterhole "
               "chain leg). No new west-border river (Q-N1 default upheld)."),
]
WATERHOLE_STEP_PX = 55   # permanent waterholes every ~87 km (2-3 caravan days)
RIM_SPRINGS = [(1524, 2436), (1548, 2528), (1608, 2545), (1662, 2508),
               (1676, 2432), (1620, 2408), (1560, 2416)]

BASINS = [
    dict(id="palewater-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(1623, 1983),
         waterways=["border-river", "western-tributary", "trib-T1", "trib-T2",
                    "trib-T3", "trib-T4", "trib-T5", "trib-C1", "trib-C2",
                    "trib-C3", "morrain-feeder-north", "morrain-forest-feeder"],
         lakes=["lake-morrain"],
         basis="H2: Lake Morrain feeds the Palewater; mouth at city-22 (ruling "
               "101). One of the two eastern-ocean outlets (flag 2)."),
    dict(id="great-lake-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(1525, 1497),
         waterways=["tree-stem", "tree-east-arm", "tree-west-arm", "tree-mid-arm",
                    "great-lake-west-inflow", "great-lake-drain",
                    "great-west-lake-feeder"],
         lakes=["great-lake", "great-west-lake", "tree-ne-lake", "tree-mid-lake",
                "tree-east-lake", "tree-west-lake"],
         basis="H2/H3 + flag A: the Malcurian Lake-Tree drains SW down its stem "
               "into the Great Lake; single outlet from the S corner to the sea at "
               "Aldercourt. The second eastern-ocean outlet."),
    dict(id="vorsk-west-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(455, 1130), waterways=["vorsk-west-river"], lakes=[],
         basis="H5: Vorsk's west river is its own catchment to the sea at city-11."),
    dict(id="fenholt-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(395, 1388),
         waterways=["fenholt-delta", "fenholt-inflow-northeast",
                    "fenholt-inflow-east"],
         lakes=["fenholt-lake"],
         basis="H5: Lunavar's northern outlet — the Fenholt delta into the NW "
               "tidal bay (Q-L6)."),
    dict(id="moonmere-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(360, 1944),
         waterways=["moonmere-outlet", "moonmere-inflow-ne"],
         lakes=["moonmere-lake"],
         basis="H5: Lunavar's southern outlet — Moonmere's lake into the capital "
               "inlet (= the Goldenport deep inlet's head)."),
    dict(id="thalendor-sw-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(378, 1942),
         waterways=["sw-lake-drain", "sw-lake-inflow-n1", "sw-lake-inflow-n2"],
         lakes=["thalendor-sw-lake"],
         basis="H4: the SW lake drains SW to the Goldenport deep inlet (fork F1 "
               "default: independent mouth at the inlet head)."),
    dict(id="raskeld-basin", name=None, provisional=True, kind="marine-outlet",
         outlet=(292, 2512),
         waterways=["raskeld-outflow", "ashkar-chain-connector-1",
                    "ashkar-chain-connector-2"],
         lakes=["raskeld-lake", "ashkar-chain-upper", "ashkar-chain-mid"],
         basis="H6: the mountain-locked west chain outflows SW along the "
               "Goldenport border."),
    dict(id="vespera-basin", name=None, provisional=True, kind="closed",
         outlet=None,
         waterways=["vespera-feeder-north", "vespera-feeder-west"],
         lakes=["lake-vespera"],
         basis="H7: Lake Vespera is CLOSED (Issyk-Kul analogue)."),
    dict(id="ashhold-tarn-basin", name=None, provisional=True, kind="closed",
         outlet=None, waterways=[], lakes=["ashhold-tarn"],
         basis="Closed mountain pocket (fork F3 default: no surface outflow)."),
    dict(id="hush-basin", name=None, provisional=True, kind="endorheic",
         outlet=None,
         waterways=["rainroad-north", "rainroad-northeast", "rainroad-east",
                    "rainroad-south", "rainroad-west"],
         lakes=[],
         basis="Ruling 99 (Option B) + H8: Canticle's interior drains to the "
               "Hush's seasonal pan; ephemeral rainroads with permanent waterhole "
               "chains; artesian/mound springs at the pan rim."),
]
COASTAL_FRINGE_BASIS = (
    "Residual class, no polygon: land that reaches the coast before any traced "
    "system drains locally by short coastal streams. Covers Kettavar, the north "
    "coasts, Goldenport's carrier coast, Corvaine's east coast, Canticle's "
    "coastal rim, Ashkar's desert coast (Kaelmouth's 470-km dry shore), Malcurr's "
    "east coast — and Sylvaneth, whose hydrology stays UNDRAWN by ruling (the "
    "W9/W20 fae gate; audit Q-S6).")


# ---------------------------------------------------------------------------
# machinery
# ---------------------------------------------------------------------------

def zhang_suen(mask):
    """Thin a bool mask to a 1-px skeleton (vectorized Zhang-Suen) — trace_rivers.py."""
    img = mask.copy()

    def neighbors(a):
        p2 = np.roll(a, 1, 0)
        p3 = np.roll(np.roll(a, 1, 0), -1, 1)
        p4 = np.roll(a, -1, 1)
        p5 = np.roll(np.roll(a, -1, 0), -1, 1)
        p6 = np.roll(a, -1, 0)
        p7 = np.roll(np.roll(a, -1, 0), 1, 1)
        p8 = np.roll(a, 1, 1)
        p9 = np.roll(np.roll(a, 1, 0), 1, 1)
        return p2, p3, p4, p5, p6, p7, p8, p9

    while True:
        changed = False
        for phase in (0, 1):
            p2, p3, p4, p5, p6, p7, p8, p9 = neighbors(img)
            b = (p2.astype(np.uint8) + p3 + p4 + p5 + p6 + p7 + p8 + p9)
            seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            a = np.zeros_like(b)
            for i in range(8):
                a += (~seq[i] & seq[i + 1]).astype(np.uint8)
            if phase == 0:
                cond = (~p2 | ~p4 | ~p6) & (~p4 | ~p6 | ~p8)
            else:
                cond = (~p2 | ~p4 | ~p8) & (~p2 | ~p6 | ~p8)
            kill = img & (b >= 2) & (b <= 6) & (a == 1) & cond
            if kill.any():
                img &= ~kill
                changed = True
        if not changed:
            return img


def bfs_path(skel, a, b):
    """Shortest 8-connected path along skeleton px, (x, y) tuples."""
    from collections import deque
    h, w = skel.shape
    prev = {}
    q = deque([a])
    seen = {a}
    while q:
        cur = q.popleft()
        if cur == b:
            path = [cur]
            while cur in prev:
                cur = prev[cur]
                path.append(cur)
            return path[::-1]
        x, y = cur
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == dy == 0:
                    continue
                nxt = (x + dx, y + dy)
                if 0 <= nxt[0] < w and 0 <= nxt[1] < h \
                        and skel[nxt[1], nxt[0]] and nxt not in seen:
                    seen.add(nxt)
                    prev[nxt] = cur
                    q.append(nxt)
    return None


def nearest_true(mask, p):
    """Nearest true px of mask to (x, y) — small local search, then global."""
    x, y = p
    for r in (6, 15, 40, 120):
        y0, y1 = max(0, y - r), min(mask.shape[0], y + r + 1)
        x0, x1 = max(0, x - r), min(mask.shape[1], x + r + 1)
        win = mask[y0:y1, x0:x1]
        if win.any():
            ys, xs = np.where(win)
            i = int(np.hypot(xs + x0 - x, ys + y0 - y).argmin())
            return (int(xs[i] + x0), int(ys[i] + y0))
    ys, xs = np.where(mask)
    i = int(np.hypot(xs - x, ys - y).argmin())
    return (int(xs[i]), int(ys[i]))


def shore_polygon(mask, eps=SHORE_EPS):
    """Largest outer contour of a bool mask as a simplified [[x,y],...] polygon.
    Closed contour: DP anchors endpoints, so simplify the two halves separately."""
    from skimage import measure
    cs = measure.find_contours(mask.astype(float), 0.5)
    c = max(cs, key=len)
    pts = [(float(p[1]), float(p[0])) for p in c]  # (row,col)->(x,y)
    mid = len(pts) // 2
    simp = maplib.simplify_dp(pts[:mid + 1], eps)[:-1] + \
        maplib.simplify_dp(pts[mid:], eps)[:-1]
    return [[int(round(x)), int(round(y))] for x, y in simp]


def open_sea_mask(base_path, water):
    """Open sea = dark-navy px connected to the canvas border (flood fill).

    The base art paints rivers/lakes in the same navy AND they touch the sea at
    their mouths, so the fill would leak upstream — masking out the Rivers And
    Lakes layer's paint (dilated) cuts the leak at every mouth."""
    img = Image.open(base_path).convert("RGB")
    arr = np.asarray(img, dtype=np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    navy = (b > r) & (b > g) & (arr.sum(axis=2) < 300)
    navy &= ~ndimage.binary_dilation(water, iterations=3)
    lab, _ = ndimage.label(navy)
    border_ids = np.unique(np.concatenate([
        lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border_ids = border_ids[border_ids > 0]
    return np.isin(lab, border_ids)


def polyline(pts):
    return [[int(round(x)), int(round(y))] for x, y in pts]


def clip_at_lakes(path, lake_masks):
    """Drop path vertices inside the given lake masks, keeping the longest
    run — the channel between/outside the lakes."""
    def in_lake(p):
        for m in lake_masks.values():
            if m[p[1], p[0]]:
                return True
        return False
    runs, cur = [], []
    for p in path:
        if in_lake(p):
            if cur:
                runs.append(cur)
                cur = []
        else:
            cur.append(p)
    if cur:
        runs.append(cur)
    if not runs:
        return path
    return max(runs, key=len)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--update", action="store_true", help="write the gazetteer")
    args = ap.parse_args()

    gaz = maplib.load_gazetteer()
    kpp = gaz["meta"]["km_per_px"]
    wh = gaz["meta"]["canvas_px"]
    riv_path = maplib.GAZETTEER.replace("thyrcross.map.json", "thyrcross-rivers.png")
    base_path = maplib.GAZETTEER.replace("thyrcross.map.json", "thyrcross.png")

    water = np.array(Image.open(riv_path).convert("RGBA"))[..., 3] > ALPHA
    comp_lab, _ = ndimage.label(water, structure=np.ones((3, 3)))

    # --- lakes ---------------------------------------------------------------
    print("extracting lakes...")
    lake_masks, lake_entries = {}, []
    for cfg in LAKES:
        seed = nearest_true(water, cfg["seed"])
        if cfg["radius"] is None:
            mask = comp_lab == comp_lab[seed[1], seed[0]]
        else:
            r = cfg["radius"]
            st = np.zeros((2 * r + 1, 2 * r + 1), bool)
            yy, xx = np.ogrid[-r:r + 1, -r:r + 1]
            st[yy * yy + xx * xx <= r * r] = True
            opened = ndimage.binary_opening(water, structure=st)
            olab, _ = ndimage.label(opened, structure=np.ones((3, 3)))
            oseed = nearest_true(opened, seed)
            core = olab == olab[oseed[1], oseed[0]]
            mask = ndimage.binary_dilation(core, structure=st) & water
        lake_masks[cfg["id"]] = mask
        area = float(mask.sum()) * kpp * kpp
        entry = {
            "id": cfg["id"], "name": cfg["name"],
            "name_provisional": bool(cfg.get("provisional", True)),
            "seed_px": list(seed),
            "area_km2": round(area),
            "closed": bool(cfg.get("closed", False)),
            "painted": True,
            "shore": shore_polygon(mask),
            "outlet": None, "inflows": [],
            "_basis": cfg["basis"],
        }
        if cfg.get("headwater"):
            entry["headwater"] = True
        lake_entries.append(entry)
        print(f"  {cfg['id']:22s} {area:8.0f} km2  shore {len(entry['shore'])} pts")

    # --- skeleton ------------------------------------------------------------
    print(f"skeletonizing at 1/{DS}...")
    small = np.array(Image.open(riv_path).convert("RGBA").resize(
        (wh[0] // DS, wh[1] // DS), Image.NEAREST))[..., 3] > ALPHA
    skel = zhang_suen(small)

    # --- painted traces ------------------------------------------------------
    new_ways = []
    for cfg in TRACES:
        src = nearest_true(skel, (cfg["src"][0] // DS, cfg["src"][1] // DS))
        dst = nearest_true(skel, (cfg["dst"][0] // DS, cfg["dst"][1] // DS))
        path = bfs_path(skel, src, dst)
        if path is None:
            sys.exit(f"ERROR {cfg['id']}: endpoints not connected on the skeleton")
        full = [(x * DS, y * DS) for x, y in path]
        # clip vertices inside this trace's OWN source/mouth lakes only — other
        # lakes' grown masks may graze the channel and must not split it
        clip_ids = cfg.get("clip", ())
        if clip_ids:
            full = clip_at_lakes(full, {k: lake_masks[k] for k in clip_ids})
        pts = maplib.simplify_dp(full, EPS * DS)
        pts = pts + [list(p) for p in cfg.get("extra_tail", [])]
        entry = {
            "id": cfg["id"], "name": None, "name_provisional": True,
            "kind": "river", "flow": cfg["flow"],
            "painted": True,
            "polyline": polyline(pts),
            "mouth": cfg["mouth"], "basin": None,
            "_basis": cfg["basis"],
        }
        if "navigable" in cfg:
            entry["navigable"] = cfg["navigable"]
        entry["length_km"] = round(maplib.polyline_length_px(entry["polyline"]) * kpp)
        new_ways.append(entry)
        print(f"  traced {cfg['id']:24s} {entry['length_km']:5d} km  "
              f"{len(entry['polyline'])} pts")

    def snap_to_ring(p, ring):
        """Nearest point ON the ring's segments to p (mouths anchor to shores)."""
        best, bp = 1e18, p
        n = len(ring)
        for i in range(n):
            ax, ay = ring[i]
            bx, by = ring[(i + 1) % n]
            dx, dy = bx - ax, by - ay
            dd = dx * dx + dy * dy or 1e-9
            t = max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - ay) * dy) / dd))
            qx, qy = ax + t * dx, ay + t * dy
            d = (p[0] - qx) ** 2 + (p[1] - qy) ** 2
            if d < best:
                best, bp = d, (qx, qy)
        return [int(round(bp[0])), int(round(bp[1]))]

    # snap traced non-sea mouths onto their target geometry (simplification on
    # both sides can leave a few px of daylight; mouths must anchor)
    traced_by_id = {w["id"]: w for w in new_ways}
    for w in new_ways:
        m = w["mouth"]
        if m["type"] == "lake":
            shore = next(l["shore"] for l in lake_entries if l["id"] == m["ref"])
            w["polyline"][-1] = snap_to_ring(w["polyline"][-1], shore)
        elif m["type"] == "waterway" and m["ref"] in traced_by_id:
            w["polyline"][-1] = snap_to_ring(
                w["polyline"][-1], traced_by_id[m["ref"]]["polyline"])
        w["length_km"] = round(maplib.polyline_length_px(w["polyline"]) * kpp)

    # --- derived courses -----------------------------------------------------
    for cfg in DERIVED:
        pts = polyline(cfg["pts"])
        if cfg["mouth"]["type"] == "lake":
            shore = next(l["shore"] for l in lake_entries
                         if l["id"] == cfg["mouth"]["ref"])
            pts[-1] = snap_to_ring(pts[-1], shore)
        entry = {
            "id": cfg["id"], "name": None, "name_provisional": True,
            "kind": "river", "flow": cfg["flow"],
            "painted": bool(cfg.get("painted", False)),
            "polyline": pts,
            "mouth": cfg["mouth"], "basin": None,
            "_basis": cfg["basis"],
        }
        entry["length_km"] = round(maplib.polyline_length_px(entry["polyline"]) * kpp)
        new_ways.append(entry)
    for cfg in RAINROADS:
        pts = polyline(cfg["pts"])
        # extend the mouth to the pan's schematic rim (washes die INTO the pan)
        cx, cy = PAN["center"]
        x, y = pts[-1]
        for _ in range(200):
            e = ((x - cx) / PAN["rx"]) ** 2 + ((y - cy) / PAN["ry"]) ** 2
            if e <= 1.25:
                break
            d = math.hypot(cx - x, cy - y) or 1e-9
            x += (cx - x) / d * 6
            y += (cy - y) / d * 6
        pts.append([int(round(x)), int(round(y))])
        length = maplib.polyline_length_px(pts)
        n_holes = max(2, int(length // WATERHOLE_STEP_PX))
        holes, acc, target = [], 0.0, length / n_holes
        holes.append(list(pts[0]))
        for i in range(1, len(pts)):
            acc += maplib.dist_px(pts[i - 1], pts[i])
            if acc >= target * (len(holes)):
                holes.append(list(pts[i]))
        entry = {
            "id": cfg["id"], "name": None, "name_provisional": True,
            "kind": "ephemeral", "flow": cfg["flow"],
            "painted": False,
            "polyline": pts,
            "mouth": dict(type="pan", ref="hush-basin"), "basin": "hush-basin",
            "waterholes": holes,
            "length_km": round(length * kpp),
            "_basis": cfg["basis"] + " Permanent waterholes every ~2-3 caravan "
                      "days; towns sit on waterholes (H8).",
        }
        new_ways.append(entry)
        print(f"  rainroad {cfg['id']:22s} {entry['length_km']:5d} km  "
              f"{len(holes)} waterholes")

    # --- wire lake outlets/inflows ------------------------------------------
    by_id = {w["id"]: w for w in new_ways}
    lake_by_id = {l["id"]: l for l in lake_entries}
    outlet_of = {   # lake -> the waterway that leaves it (ONE each, the law)
        "lake-morrain": "border-river", "great-lake": "great-lake-drain",
        "great-west-lake": "great-lake-west-inflow",
        "tree-ne-lake": "tree-stem", "tree-mid-lake": "tree-mid-arm",
        "tree-east-lake": "tree-east-arm", "tree-west-lake": "tree-west-arm",
        "thalendor-sw-lake": "sw-lake-drain", "moonmere-lake": "moonmere-outlet",
        "fenholt-lake": "fenholt-delta", "raskeld-lake": "raskeld-outflow",
        "ashkar-chain-upper": "ashkar-chain-connector-1",
        "ashkar-chain-mid": "ashkar-chain-connector-2",
    }
    for lid, wid in outlet_of.items():
        lake_by_id[lid]["outlet"] = wid
    for w in new_ways:
        if w["mouth"]["type"] == "lake":
            lake_by_id[w["mouth"]["ref"]]["inflows"].append(w["id"])
    lake_by_id["lake-morrain"]["inflows"].insert(0, "morrain-feeder-north")
    lake_by_id["great-lake"]["inflows"] = ["tree-stem", "great-lake-west-inflow"]
    lake_by_id["moonmere-lake"]["inflows"].append(
        "(painted SE mountain-foot arm below city-24)")

    # --- basins --------------------------------------------------------------
    for b in BASINS:
        for wid in b["waterways"]:
            if wid in by_id:
                by_id[wid]["basin"] = b["id"]

    print(f"partitioning basins at 1/{BASIN_DS}...")
    sea = open_sea_mask(base_path, water)
    ds = BASIN_DS
    sea_s = sea[::ds, ::ds]
    water_s = water[::ds, ::ds]
    land_s = ~sea_s
    h, w = land_s.shape
    seedmap = np.zeros((h, w), np.int32)
    existing = {ww["id"]: ww for ww in gaz["waterways"]}
    for i, b in enumerate(BASINS, start=1):
        m = np.zeros((h, w), bool)
        for lid in b["lakes"]:
            m |= lake_masks[lid][::ds, ::ds]
        for wid in b["waterways"]:
            src = by_id.get(wid) or existing.get(wid)
            if not src:
                continue
            for x, y in src["polyline"]:
                m[min(y // ds, h - 1), min(x // ds, w - 1)] = True
        if b["id"] == "hush-basin":
            cx, cy = PAN["center"]
            yy, xx = np.ogrid[:h, :w]
            m |= (((xx * ds - cx) / PAN["rx"]) ** 2
                  + ((yy * ds - cy) / PAN["ry"]) ** 2) <= 1.0
        seedmap[m & land_s] = i
    # sea-adjacent land competes for the coastal-fringe residual
    coast = land_s & ndimage.binary_dilation(sea_s)
    FRINGE = len(BASINS) + 1
    seedmap[coast & (seedmap == 0)] = FRINGE
    # multi-source geodesic growth over land (1 px per iteration)
    lab = seedmap.copy()
    frontier = seedmap > 0
    struct = ndimage.generate_binary_structure(2, 2)
    while True:
        grown = ndimage.grey_dilation(lab, footprint=struct)
        newly = (lab == 0) & land_s & (grown > 0)
        if not newly.any():
            break
        lab[newly] = grown[newly]
    basin_entries = []
    for i, b in enumerate(BASINS, start=1):
        m = lab == i
        area = float(m.sum()) * (kpp * ds) ** 2
        filled = ndimage.binary_fill_holes(
            ndimage.binary_closing(m, structure=np.ones((3, 3))))
        blab, _ = ndimage.label(filled)
        if filled.any():
            keep = np.argmax(np.bincount(blab[blab > 0]))
            poly = shore_polygon(blab == keep, eps=2.0)
            poly = [[x * ds, y * ds] for x, y in poly]
        else:
            poly = []
        entry = {
            "id": b["id"], "name": b["name"],
            "name_provisional": bool(b.get("provisional", True)),
            "kind": b["kind"], "outlet_px": list(b["outlet"]) if b["outlet"] else None,
            "waterways": b["waterways"], "lakes": b["lakes"],
            "area_km2": round(area),
            "polygon": poly,
            "_basis": b["basis"],
        }
        if b["id"] == "hush-basin":
            entry["pan"] = {"center": list(PAN["center"]), "rx_px": PAN["rx"],
                            "ry_px": PAN["ry"], "_basis": PAN["basis"]}
            entry["rim_springs"] = [list(p) for p in RIM_SPRINGS]
        basin_entries.append(entry)
        print(f"  basin {b['id']:20s} {area:9.0f} km2  poly {len(poly)} pts")
    basin_entries.append({
        "id": "coastal-fringe", "name": None, "name_provisional": True,
        "kind": "coastal-fringe", "outlet_px": None,
        "waterways": [], "lakes": [], "area_km2": None,
        "polygon": [], "_basis": COASTAL_FRINGE_BASIS,
    })
    print("  coastal-fringe residual (no polygon, area unreported)")

    # --- write ---------------------------------------------------------------
    # annotate the two big already-traced rivers with the new hydrology fields
    ann = {
        "border-river": dict(kind="river", painted=True, basin="palewater-basin",
                             source=dict(type="lake", ref="lake-morrain"),
                             mouth=dict(type="sea")),
        "western-tributary": dict(kind="river", painted=True,
                                  basin="palewater-basin",
                                  mouth=dict(type="waterway", ref="border-river")),
        **{f"trib-{t}": dict(kind="river", basin="palewater-basin",
                             mouth=dict(type="waterway", ref="border-river"),
                             flow="northwest-to-southeast: descends off the "
                                  "Thalendor forest into the Palewater "
                                  "(ruling-156 hydrology: source uphill of mouth)")
           for t in ("T1", "T2", "T3", "T4", "T5")},
        **{f"trib-{t}": dict(kind="river", basin="palewater-basin",
                             mouth=dict(type="waterway", ref="border-river"),
                             flow="northeast-to-southwest: descends off the "
                                  "Corvaine plains into the Palewater "
                                  "(ruling-156 hydrology: source uphill of mouth)")
           for t in ("C1", "C2", "C3")},
    }
    for wid, extra in ann.items():
        if wid in existing:
            existing[wid].update(extra)
    gaz["waterways"] = [w for w in gaz["waterways"]
                        if w["id"] not in by_id] + new_ways
    gaz["lakes"] = lake_entries
    gaz["basins"] = basin_entries
    gaz["meta"]["hydrology"] = {
        "pass": "2026-07-23 continental hydrology (the H1-H9 brief; "
                "trace_hydrology.py)",
        "convention": "waterway polylines run SOURCE -> MOUTH; mouths are "
                      "load-bearing, middles repaintable; ONE outlet per lake; "
                      "lakes with outlets list inflows; basins are nearest-water "
                      "geodesic partitions - divides SCHEMATIC (no elevation "
                      "model), repaint freely; names provisional until the "
                      "ruling-118 walk except Ben-named waters.",
    }

    if args.update:
        maplib.save_gazetteer(gaz)
        print(f"gazetteer updated: {len(lake_entries)} lakes, "
              f"{len(new_ways)} waterways added/updated, "
              f"{len(basin_entries)} basins")
    else:
        print("report only - re-run with --update to write")


if __name__ == "__main__":
    main()
