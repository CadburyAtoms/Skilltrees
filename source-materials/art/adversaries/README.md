# Adversary art — drop zone

Save finished creature art here (straight from the iPad is fine). `scripts/deploy-to-foundry.bat`
installs everything in this folder into the live module and the next pack build picks it up — no
data edit, ever.

**Filenames are the contract.** Per creature, up to two files:

- `<slug>-portrait.<ext>` — sheet/chat portrait
- `<slug>-token.<ext>` — the token (falls back to the portrait if absent)

`<slug>` is the adversary's name from `data/adversaries.json`, lowercased with every run of
non-alphanumerics collapsed to a single `-` — e.g. *Corvaine Line-Caller* → `corvaine-line-caller`,
*Sergeant Halden Roek* → `sergeant-halden-roek`. The per-creature briefs and their exact filenames
live in `EDHA_ADVERSARY_ART_WISHLIST.md`.

Extensions: `.webp`, `.png`, `.jpg`/`.jpeg`. Prefer `.webp` — these are committed to git, so
keep them lean (a few hundred KB, not a 12 MB Procreate export).

A file whose name doesn't match a known adversary is **reported and skipped** by the deploy, not
copied — check the deploy window if art doesn't show up.
