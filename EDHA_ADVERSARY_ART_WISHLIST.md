# Edha adversary art wishlist (hand-drawn briefs)

Companion to the W23 adversary pipeline. Every adversary ships with **core-icon placeholders**
until real art exists. The build auto-detects finished files — **the filenames below are the
contract**: drop a file into the live module dir and rebuild, and the Actor picks it up. No data
edit, ever.

**Where files go:** `<Foundry Data>/modules/edha-content/art/adversaries/`
**Formats:** `.webp`, `.png`, or `.jpg` (checked in that order).
**Two files per creature:**
- `<slug>-portrait.*` — the sheet/chat portrait. Roughly square; bust or three-quarter figure
  reads best at sheet size.
- `<slug>-token.*` — the token. Round-crop-friendly (the figure centered, nothing important in
  the corners); top-down or clean silhouette both work. If you only draw one image, drop it as
  `-portrait` — the token falls back to the portrait automatically.

Rebuild after dropping files: `node scripts/foundry-build.js adversaries` (+ relaunch). Already-
imported world actors keep their old art until re-imported — drag a fresh copy from the pack.

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
