# TASK — Extract the political map from Thycross_Map_v1.procreate

**For a Claude Code session running on Ben's Windows PC** (the remote/cloud sessions cannot see
his filesystem — that's why this task exists). Written 2026-07-12 by the campaign-opening session
(branch `claude/campaign-opening-hook-178b2m`). Delete this file in the same commit that
completes the task.

**Suggested prompt for Ben to start the PC session with:**
> Read EDHA_MAP_EXTRACTION_TASK.md and do it. The file is at
> `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\Thycross_Map_v1.procreate`

## Context (read these first)

- `EDHA_CAMPAIGN_CANON.md` **§5a** — the provisional (⚑) nation-placement gazetteer, derived by
  *guessing* from canon adjacency constraints against the flat map export. The political layer in
  the Procreate file is the ground truth that replaces those guesses.
- `EDHA_CAMPAIGN_OPENING.md` — session-1 sites keyed to pixel coordinates on
  `source-materials/maps/thyrcross.png` (2865×3399, the flat export Ben uploaded).
- Handoff delta **2026-07-12g** in `EDHA_FOUNDRY_HANDOFF.md`.

## Goal

Get the political layer(s) out of the Procreate file as full-canvas PNGs, commit them, and
correct every placement the layer contradicts.

## Step 1 — extract layers

`.procreate` files are zip archives: `Document.archive` (NSKeyedArchiver plist with layer
names/order/canvas size) + per-layer folders of LZO-compressed 256×256 RGBA tile chunks
(`{col}~{row}.chunk`), plus `QuickLook/Thumbnail.png` (small flat composite — not sufficient).

1. Copy the file into scratch space, unzip, list contents. Parse `Document.archive` for the
   **canvas size** and **layer names** (Python `plistlib` handles NSKeyedArchiver structure;
   third-party `python-lzo` decodes the tiles — known-good approach, see the open-source
   ProcreateViewer projects for the tile format).
2. Reassemble each relevant layer (political borders; any labels/names layer; cities layer if
   one exists) into a full-canvas PNG.
3. **If tile decoding fights back, don't sink the session into it** — fallback: ask Ben to
   export a PSD (or per-layer PNGs) from Procreate on the iPad into the same OneDrive folder,
   then read the PSD with `psd-tools`. The deliverable is the layer PNGs, not the decoder.

## Step 2 — commit the exports

- `source-materials/maps/thyrcross-political.png` — borders layer, full canvas.
- `source-materials/maps/thyrcross-labels.png` / `-cities.png` — if such layers exist.
- The gitignore already has the `!source-materials/maps/*.png` exception.
- Do **NOT** commit the `.procreate` itself (can be huge; OneDrive is its home).
- ⚠ If the Procreate canvas size differs from 2865×3399, the flat export Ben uploaded was
  scaled/cropped — scale the layer exports to match `thyrcross.png` (or re-export the base at
  canvas size and re-anchor ALL pixel coordinates in §5a and the opening doc; say which you did).

## Step 3 — reconcile the docs against ground truth

Compare the real political borders (and label positions, if present) against the ⚑ guesses:

1. **§5a gazetteer** (`EDHA_CAMPAIGN_CANON.md`): correct any nation whose region differs;
   remove the ⚑ from everything the layer settles. Open ⚑ items the layer likely answers:
   which nation owns the **western moorland** (guessed: Thalendor) and the **far-southwest
   peninsula** (guessed: Vorsk); whether **Lunavar** is really the southeastern mass (the
   "Vorsk raids Lunavar to the south" wording reads east on the guessed layout).
2. **Session-1 sites** (`EDHA_CAMPAIGN_OPENING.md` §2): keep the sites *functionally* the same
   (staging town → ford → famine village along the Thalendor/Corvaine border road; Black Altar
   Crossing at a border nexus between them and Corvaine/Goldenport) — move the coordinates to
   wherever that border actually is.
3. **Regenerate `thyrcross-labeled-proposal.png`** from the corrected data (label each nation +
   the four numbered sites; the generator script pattern is in the 2026-07-12g session, simple
   PIL — rewrite it, it's ~40 lines). If Ben confirms everything, rename it
   `thyrcross-labeled.png` and say so in the delta.
4. If a **cities layer** exists: add capital/city placements to §5a and unblock the "city-scale
   battle maps" item in `EDHA_CAMPAIGN_OPENING.md` §4.

## Step 4 — the usual session close

Docs-only work, no engine/data/pack changes, nothing for the bench — but the standard gates
still run before commit (CLAUDE.md rule 4), a dated delta goes at the top of
`EDHA_FOUNDRY_HANDOFF.md`, and this task file gets deleted. Batch any judgment calls (ambiguous
border readings, unlabeled regions) into ONE menu for Ben with recommended defaults.
