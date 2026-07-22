# Edha adversary art wishlist (hand-drawn briefs)

Companion to the W23 adversary pipeline. Every adversary ships with **core-icon placeholders**
until real art exists. The build auto-detects finished files — **the filenames below are the
contract**: drop a file in, deploy, and the Actor picks it up. No data edit, ever.

**Where files go:** `source-materials/art/adversaries/` in the repo (OneDrive-synced, so saving
straight from the iPad works). `scripts/deploy-to-foundry.bat` installs them into
`<Foundry Data>/modules/edha-content/art/adversaries/` — which is where the builder actually looks,
so dropping a file there by hand still works for a one-off. The repo folder is the source of
truth: it's backed up, it survives a module reinstall, and it's what a fresh clone deploys.
**Formats:** `.jpg`/`.jpeg`, `.webp`, or `.png` (checked in that order — if two files share a
slug, the `.jpg` wins). Prefer `.jpg`: it's Procreate's native export (Share → JPEG), and these
are committed, so keep them lean — a few hundred KB, not a 4 MB full-res export.
**Two files per creature:**
- `<slug>-portrait.*` — the sheet/chat portrait. Roughly square; bust or three-quarter figure
  reads best at sheet size.
- `<slug>-token.*` — the token. Round-crop-friendly (the figure centered, nothing important in
  the corners); top-down or clean silhouette both work. If you only draw one image, drop it as
  `-portrait` — the token falls back to the portrait automatically.

After dropping files, run `scripts/deploy-to-foundry.bat` (or, by hand:
`node scripts/sync-art.js && node scripts/foundry-build.js adversaries`, + relaunch). A filename
that matches no adversary is **reported and skipped**, never silently ignored — read the deploy
window if art doesn't appear. Already-imported world actors keep their old art until re-imported —
drag a fresh copy from the pack.

---

## Batch 1 — session 1 (statted, in the pack now)

### Corvaine Raider — `corvaine-raider-portrait.*` / `corvaine-raider-token.*`
Border soldier gone raiding, not a bandit: regular-army bearing, hollow cheeks, wet to the
waist from the wade. The load-bearing detail is the **gear mismatch** — starving man, *brand-new*
matched armor and a fresh-forged blade (Malcurr maker's stamp; the session-1 clue). Crossbow
slung, shortsword drawn. Palette: river-gray, mud, one clean glint of new steel.
*Token:* waist-up or top-down with crossbow; reads "soldier," not "brigand."

### Corvaine Line-Caller — `corvaine-line-caller-portrait.*` / `corvaine-line-caller-token.*`
Same unit and same too-good gear as the Raider, but this one is the **signal**: one arm up
mid-gesture, every line of the body about direction, not violence. White-attuned Corvaine
ground-stock — if you want a magic tell, keep it almost deniable: a pale thread of light along
the raised hand, frost-white eyes, nothing louder. The table lesson is "shoot the signaler,"
so it should be visually pickable from the Raiders at token size.
*Token:* the raised-arm silhouette is the identifier.

### Sergeant Halden Roek — `sergeant-halden-roek-portrait.*` / `sergeant-halden-roek-token.*`
The raid's leader and its conscience: middle-aged Corvaine sergeant, hollow-cheeked under
armor that fits too well to be his, ashamed and doing it anyway. Portrait should carry the
*would rather not kill* read — tired eyes, blade held low and defensive, not brandished. White
attunement runs through him as drilled-in coordination, not spectacle; no visible magic needed.
*Token:* distinct from the Raiders by posture (upright, centered, holding a line) and an
officer's detail — a sash, a crest, the better helm.

### Mistheron — `mistheron-portrait.*` / `mistheron-token.*`
Man-tall wading bird in pre-dawn river fog — heron proportions stretched just past comfortable,
fog-gray plumage that eats light (deflect 1 = dense plumage). **Starving**: ribs ghosting under
feathers, new to boldness, afraid of lanterns. The signature is the **Seeming** — its Blue-woven
double standing a pace from the true body; the portrait may show both, the real bird only
betrayed by the eye catching light. Sad, not monstrous — this is what the broken river made.
*Token:* single bird, long neck folded to strike; keep it ambiguous enough that "which one is
real" stays a table question.

---

## Pending — approved roster, blocks not yet built

*(Filenames reserve now; briefs get written when each block is statted and approved: rootling
swarm · grove-heart · briar-gone grove · tollbird flock (+ pool-maddened) · W22 variant column.
Terrain-scale entries — skein herd, briar-grove standing-gray — are per-session exceptions
(ruling 40) and may not be Actors at all.)*

## Batch 2 — the Lunavar fens (ruling 69; statted 2026-07-19, statblock gate passed)

### Drownlight Colony — `drownlight-colony-portrait.*` / `drownlight-colony-token.*`
You never draw the animal — you draw the **light**: a soft, warm, utterly convincing lantern-glow
hanging over black night-water, reeds parting around nothing, maybe the faintest suggestion of
small cold bodies beneath the surface where the light *isn't*. The horror is that it looks like
help. Palette: one warm gold lie in a blue-black world.
*Token:* the light alone on dark water — round-crops perfectly.

### Reedling — `reedling-portrait.*` / `reedling-token.*`
A dog-sized tangle of woven reed, root, and willow-whip, mid-stride out of a bank it was part of
a second ago — wet, green-brown, no face, purposeful. Kin to Thalendor's rootlings but wetland-made:
dripping, trailing waterweed. Not menacing by itself; menacing in threes.
*Token:* top-down tangle with a clear "front."

### Gone-to-Weir Fen-Heart — `gone-to-weir-fen-heart-portrait.*` / `gone-to-weir-fen-heart-token.*`
A whole stretch of marsh gone wrong: a willow-carr hunched like a shoulder out of flooded fields,
blight-gray streaks through the green, channels dammed with woven walls radiating from it,
drowned paddy all around. The wrongness is hydraulic — water standing where it shouldn't. If a
"face" exists it's an accident of bark and shadow. Play it huge (3x3–4x4 token).
*Token:* top-down — the carr as a mass with weir-lines radiating.

### Stillback — `stillback-portrait.*` / `stillback-token.*`
A crocodilian the length of a barge doing its one trick: lying awash as *terrain*. Portrait reads
as a quiet marsh landscape — mudbank, a log, causeway stones — until the eye finds the nostril,
the ridge of an eye, the too-regular line of scutes. The viewer should find it late. Palette:
mud, slate, dull bronze.
*Token:* top-down "log" silhouette; the giveaway kept subtle.

### Wasting-Eater Stillback — `wasting-eater-stillback-portrait.*` / `wasting-eater-stillback-token.*`
The same animal ruined: ribs under armor plate, murrain-bald patches, running eyes, the stillness
imperfect — a tremor in the pose. It should make the viewer sad before it makes them afraid
(ruling 34: weaker, never tougher; the fight is a mercy). If only one gets drawn, draw the sound
Stillback — this one falls back to that portrait acceptably.
*Token:* as Stillback but gaunt; can fall back to the Stillback token.

### Noonwing — `noonwing-portrait.*` / `noonwing-token.*`
The reason Lunavar sleeps through noon: a soaring raptor with a wingspan like a barge sail,
seen the way a Lunavite sees it — a cruciform silhouette against white glare, impossibly high,
over flat open fen. Scale sells it: paddy lines and stilt-caches tiny below, the shadow crossing
them. If drawn close: slate-and-bone plumage, frost-pale eyes that read *pattern*, not faces.
Terrifying and clean — a healthy predator, not a wrongness.
*Token:* top-down soaring silhouette, wings full-spread — reads instantly at any size.

### Wrongwake — `wrongwake-portrait.*` / `wrongwake-token.*`
A pike the length of a skiff, pale as lakebed stone, hanging in cold clear water under a
lamplit surface — and the composition lies the way the fish does: ripples and a splash off to
one side, the animal itself somewhere else entirely, half-merged with the pale stones. Palette:
bone, slate, black water, one warm lamp-glow from above.
*Token:* top-down pale pike silhouette, slightly translucent at the edges.

### Wasting-Eater Wrongwake — `wasting-eater-wrongwake-portrait.*` / `wasting-eater-wrongwake-token.*`
The same fish ruined: ribs showing under scale, murrain-clouded eyes, fins fraying — still
hunting because it cannot stop. Sad before frightening (ruling 34). If only one gets drawn,
draw the sound Wrongwake — this one falls back to it acceptably.
*Token:* as Wrongwake but gaunt; can fall back to the Wrongwake token.

### Wake-Eel Shoal — `wake-eel-shoal-portrait.*` / `wake-eel-shoal-token.*`
The ring: a still black lake at night, a lamplit still-house island in the middle distance —
and on the water a slow, perfect circle of arm-long eel-backs breaking the surface. The horror
is the geometry and the patience, not the animals. Palette: black water, lamp-gold, wet slate.
*Token:* top-down loose dark mass with a visible ring-current in it.

### Fellstag — `fellstag-portrait.*` / `fellstag-token.*`
A great stag on a moor ridgeline at dusk — antlers and spine carrying living growth, moss and
whip-thorn rooted in the beast, and behind it the ground it has already walked: hedges risen in
lines that were not there this morning. It should read as majestic first and WRONG a beat later
(the maze bends toward the viewer). Blight-gray variant: same beast, growth locked gray, nothing
shed — reads as a walking piece of dead country.
*Token:* top-down antlered silhouette with a thorn-halo; gray variant recolor acceptable.

### Sevenbrand Construct-Smith — `sevenbrand-construct-smith-portrait.*` / `sevenbrand-construct-smith-token.*`
A Malcurri master smith in leathers and mail, forearms laddered with brands, seven-stroke mark
visible on the hammer's cheek — and behind, half in forge-glow, the real subject: the forged
construct standing sentinel. The portrait should quietly say whose devout this is (Builder
iconography worn small, not hidden).
*Token:* smith + hammer; the construct gets the system's summon token.

---

## Batch 3 — the Goldenport coast (ruling 98; statted 2026-07-20, statblock gate passed)

### The Garden Sow — `the-garden-sow-portrait.*` / `the-garden-sow-token.*`
The capital garden country's apex (canon §5c): a boar sow of impossible size and age among
espaliered fruit trees and charter-stones — glossy, unscarred, calm the way something that has
never lost is calm. The nexus shows as health, not glow: too-green growth underfoot, a
knit-clean old wound line where a scar should be. *Token:* the sow head-on, tusks level.

### Keelshadow — `keelshadow-portrait.*` / `keelshadow-token.*`
The Toll-Taker from above: a long pelagic shape pacing a fishing boat's keel, seen through
clean deep water as a shadow with a wake — half the frame is the hull, the lines, and the
first fish going over the side. Dread as bookkeeping, not teeth. *Token:* the shadow-shape
from directly overhead, mid-water.

### Cinderbrock — `cinderbrock-portrait.*` / `cinderbrock-token.*`
The Wrack-Burner at work on a north-coast beach at dawn: badger-built, burnt-grass stripes,
heat-shimmer off its back, foreclaws striking sparks into a piled wrack-fire over the mussel
beds — smoke lines down the tideline behind it, slag-tip hills beyond. *Token:* compact and
low, ember-lit from below.

### Cold-Fire Cinderbrock — `cold-fire-cinderbrock-portrait.*` / `cold-fire-cinderbrock-token.*`
The wasting variant (rulings 34/90): the same beast gone to bone, fur patchy over ribs, the
furnace heat still shimmering off a body that is mostly gone — a fire on a dead hearth. Sad,
not monstrous; the north-beach folk give it distance and, sometimes, a mercy. *Token:* the
same silhouette as the cinderbrock, dimmed and thinned.

### Reeve-Owl — `reeve-owl-portrait.*` / `reeve-owl-token.*`
The Verdict on the wing (canon §5c, ruling 110): a great eagle-owl, shield-broad, facial disc
ringed dark like a circlet, dropping silent through Thalendor canopy toward something below the
frame — and on the mast behind it, a line of small kills laid out uneaten, like writs served.
Office, not appetite. *Token:* the face straight-on, the circlet-disc reading as a crown.

### Crownox Ring — `crownox-ring-portrait.*` / `crownox-ring-token.*`
The Held Crown holding (ruling 110): three great slate-and-bone forest oxen in a horns-out
ring in a glade, calves inside, utterly still, wolves circling beyond — the ring of horns
reading unmistakably as a crown. *Token:* one ox head-on, horns sweeping up and inward.

### Rootling Swarm — `rootling-swarm-portrait.*` / `rootling-swarm-token.*`
The Errant Green's runners (ruling 32): dog-sized tangles of root and whip boiling out of
turned garden soil at dusk, one dragging a seed-sack — famine escalation a villager can watch.
*Token:* a single rootling mid-scramble, all knots and whips.

### Briar-Gone Grove — `briar-gone-grove-portrait.*` / `briar-gone-grove-token.*`
A grove gone to briar (ruling 32): a shrine-grove locked in gray-leafed blight, its ring-wall
of thorn half-grown across a road, root-boughs dragging at a cart — a warden kneeling barefoot
at its edge, craft failing. Not evil; wrong. *Token:* the grove's heart-trunk, thorn-crowned.

### Tollbird Flock — `tollbird-flock-portrait.*` / `tollbird-flock-token.*`
The maddened tolling (ruling 33): a whirl of ash-gray crows with wet-slate eyes mobbing low
over Crossing ground, wrong and shrieking — trees behind them white with the patient thousands
that haven't broken yet. *Token:* the swarm as a smeared ring of wings.

### Surecat — `surecat-portrait.*` / `surecat-token.*`
The Foregone at work (ruling 111): a long-legged dun coursing cat sitting perfectly composed at
a fence-gap in Corvaine hedge-country — not stalking, WAITING — while in the fore a hare runs
flat-out toward exactly that gap. The horror is the certainty. *Token:* the seated silhouette,
tail wrapped, eyes forward.

### Brandram — `brandram-portrait.*` / `brandram-token.*`
The Tempered arriving (ruling 112): a forge-dark hill-ram at full charge down a fell-side
causeway, snow flashing to steam in its wake, heat-shimmer off the fleece, a lamplit ice-road
and a scattering cart in its line. *Token:* head-on, horns like anvils, steam rising.

### Tussock-Sow — `tussock-sow-portrait.*` / `tussock-sow-token.*`
The Mirewright building (ruling 112): a great moss-country sow mid-churn, tusks deep in a
village lane that is visibly becoming a moat — behind her, her finished work: tussock rows,
causeway-humps, an engineered wallow. Construction, not aggression. *Token:* the sow
three-quarter, mud-crowned.

## Non-adversary assets

### Character Creator World Map — `source-materials/maps/creator-map.jpg` (or .png)
Ben's 07-19 bench ask: the creation wizard's country-picker map, as a proper piece — the
Thyrcross continent with **no city labels and no lettered ids in front of country names**
(country names themselves optional: the picker's hover tooltip already names each nation, so a
label-free painting works). Landscape of the whole continent, portrait canvas 2865x3399 or any
same-ratio export; keep coastlines and national borders recognizably where the map JSON has
them, since the click-polygons come from `thyrcross.map.json` and are NOT redrawn to match art.
**Interim in place:** the wizard currently ships a downscale of the raw `thyrcross.png` base
(label-free but plain). When the real piece lands, drop it at the filename above and ask a
session to regenerate `module-src/assets/thyrcross-map.jpg` from it (a one-line downscale; the
polygons and hover data need no change).

### Callthief — `callthief-portrait.*` / `callthief-token.*`
The Borrowed Voice mid-song (canon §5c): a lean, dun plains predator — long-legged cat-dog
build — sat upright in scrub cover with its head thrown back, throat working, while a herd
in the middle distance turns wrong. Its partner is a low shape circling the strays. The
horror is the posture: it sings like a person. *Token:* head and open throat, three-quarter.

### The False Spring — `the-false-spring-portrait.*` / `the-false-spring-token.*`
The shimmer as a place, not a beast (rulings 106/35): a perfect oasis on the blinding white
of the Hush — palms, still water, true reflections — with one wrongness for the careful eye
(a heat-ripple that bends the fronds but not their shadows), and the suggestion of a large
low body inside the image. *Token:* the mirage itself, the animal barely legible within.

### Dirgehound — `dirgehound-portrait.*` / `dirgehound-token.*`
The Ledger read aloud (canon §5c): a gaunt black-gray canid on the pan edge at dusk,
head low, pacing a wandering given herd — locked stock, ribs and patience. Two more hounds
are far-spaced dots along the salt. Sad economy, not menace: they are waiting, and they
have time. *Token:* head-on at a low stalk.


### Cragdrake Whelp Pack — `cragdrake-whelp-portrait.*` / `cragdrake-whelp-token.*`
The Attendant Red, young (ruling 121): four dog-sized scree-colored lizard-kin fanned across
a talus slope above a sheep trail, every head turned the same way — toward the one limping
ewe. *Token:* a single whelp low to the rock, tail flat.

### Cragdrake Adult — `cragdrake-adult-portrait.*` / `cragdrake-adult-token.*`
Wolf-sized, ember-throated, mid-leap between boulders with a lance of spat heat scoring the
snow (ruling 121: Searing Bolt is the trick that earns the folk name "dragon"). *Token:*
head-on, jaws parted, faint glow in the gullet.

### Cragdrake Alpha — `cragdrake-alpha-portrait.*` / `cragdrake-alpha-token.*`
The horse-scale matriarch on a quiet shelf at dusk, wings-of-heat shimmer around her, the
pack arranged below like a court (ruling 121: she holds the routes between the steadings and
the shelves). *Token:* three-quarter, crowned in heat-haze.

### Bellwether — `bellwether-portrait.*` / `bellwether-token.*`
A White-eyed lead-ewe on a one-gate steading's byre-court wall, the whole flock behind her
turned in perfect unison (ruling 121: the continent's first domesticated attuned lineage).
*Token:* the ewe's head with the bell, eyes pale.

## Batch — the Ashkar mesas (ruling 137; statted 2026-07-22, statblock gate passed)

### Hazewyrm Whelp Pack — `hazewyrm-whelp-portrait.*` / `hazewyrm-whelp-token.*`
The Veiled Red, young (ruling 137): three dust-colored dog-sized lizard-kin low in a heat-shimmer
over red mesa rock, half-lost in the boil of air, one already scalding-mouthed. Palette: ochre,
rust, the blue-white waver of desert glare. *Token:* a single whelp flat to the stone, outline
swimming in the haze.

### Hazewyrm Adult — `hazewyrm-adult-portrait.*` / `hazewyrm-adult-token.*`
The Veiled Red (ruling 137): a lean, solitary Red/Blue mesa dragon coiled in ambush, its outline
doubled and displaced by the heat-shimmer it hunts inside — you can't quite fix where it is. A
lance of furnace-heat just leaving its jaws. Palette: sunburnt red over a mirage-blue waver.
*Token:* head-on out of the shimmer, gullet glowing, edges uncertain.

### Hazewyrm Elder — `hazewyrm-elder-portrait.*` / `hazewyrm-elder-token.*`
The oldest Veiled Red (ruling 137), horse-scale, in the dead interior near the god — false selves
thrown off it in the boiling air, the breath gathering. The deeper-you-track-it-the-closer-to-
Razkael monster (the wear-compass in the flesh). *Token:* three-quarter, wreathed in heat-doubles,
one true head.

### The Reckoning — `the-reckoning-portrait.*` / `the-reckoning-token.*`
The Ordered March (ruling 137): a pack of lean desert coursers cutting a caravan's line at dusk —
not a scrum, a *formation*, every head on the same straggler, one lead-beast half a length ahead.
White-attuned, the caravan road's reason for the Water-Peace. Palette: dun, dust, the long blue
shadows of the flat. *Token:* the lead-beast, ears forward, pale-eyed.

### The Slagbull — `the-slagbull-portrait.*` / `the-slagbull-token.*`
The Kiln (ruling 137): a big-bodied Red mesa charger mid-run, dust and heat coming off its hide,
head down for the gore, a cracked mesa wall behind it (the wall is its ally). Territorial,
running hot in the killing noon. Palette: slag-red, iron, noon-white glare. *Token:* head-on,
lowered horns, heat-blur at the shoulders.

### The Doubled — `the-doubled-portrait.*` / `the-doubled-token.*`
The fetch (ruling 147): a long-limbed white tundra stalker half-resolved out of a whiteout —
and the shape it wears is almost a person: a herder's silhouette with one proportion wrong,
seen at the distance where you'd wave. Palette: snow-glare white on white, one smear of
storm-grey, no shadow where a shadow should be. *Token:* the silhouette mid-stride, face-less
in the blowing snow.

### The Doubled Elder — `the-doubled-elder-portrait.*` / `the-doubled-elder-token.*`
The old fetch (ruling 147): two identical figures walking out of the white toward the viewer,
step for step — dogs at the frame's edge backing away from both. The horror is symmetry, not
teeth. Palette: white, bone, the low red of a winter sun that lights neither figure quite the
same. *Token:* one figure — or is it — with a second outline a half-step off-register.

### Cullwolf Pack — `cullwolf-portrait.*` / `cullwolf-token.*`
The Tithe (ruling 147): lean tundra wolves at the edge of a tarvar herd at dusk, all of them
looking at ONE animal — the one standing slightly apart, slightly wrong. Patient, not
ravening. Palette: slate, frost, breath-steam. *Token:* a single wolf seated, watching,
head tilted.

### The Cull-Alpha — `cull-alpha-portrait.*` / `cull-alpha-token.*`
The one that decides (ruling 147): a heavy-ruffed elder wolf on a ridge line above the herds,
downwind, reading. Scars old and healed clean — it has never fought anything that could fight
back, by choice. Palette: iron-grey, white muzzle, long blue evening shadow. *Token:*
three-quarter, one ear turned, unhurried.
