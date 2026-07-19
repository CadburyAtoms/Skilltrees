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
