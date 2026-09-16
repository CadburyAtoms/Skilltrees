# Talent comparison tooling — Mistborn, Radiant, Edha

The scripts behind [`../talent-comparison-mistborn-radiant.md`](../talent-comparison-mistborn-radiant.md)
(2026-09-16). They read three corpora and print the tables the document quotes. **None of the
licensed text is committed** — the Mistborn Handbook packs are Brotherwise content read from Ben's
own install, and the spreadsheet stays where it is under `source-materials/legacy-uploads/`. What is
committed is the code that regenerates the counts.

## Inputs

| Corpus | Where it comes from |
|---|---|
| Mistborn Handbook packs | `%LOCALAPPDATA%\FoundryVTT\Data\modules\cosmere-rpg-mistborn-handbook\packs\` — copy the pack folders to scratch first (the `LOCK` files refuse to copy while Foundry runs; they are not needed) |
| Radiant + official heroic | `source-materials/legacy-uploads/CosmereRPG Talents.xlsx` (Sheet1: 374 rows — 149 heroic, 225 Radiant) |
| Edha | `docs/analysis/talent-ecosystem/derive-dossiers.js <outdir>` → `<outdir>/all-talents.json` |

## Run it

```
# 1. Mistborn packs → JSON (needs node_modules/classic-level; CI's pack gate installs it, or `npm install --no-save classic-level@2.0.0`)
node docs/analysis/talent-comparison/dump-packs.js <copied-packs-dir> <scratch>/mistborn-json

# 2. Flatten the two talent packs into one table (206 talents, 37 trees, 67 powers)
python docs/analysis/talent-comparison/flatten-mistborn.py <scratch>/mistborn-json <scratch>/mistborn-talents.json

# 3. Spreadsheet → JSON (needs openpyxl)
python docs/analysis/talent-comparison/official-talents.py <scratch>/official-talents.json

# 4. Edha's join
node docs/analysis/talent-ecosystem/derive-dossiers.js <scratch>/eco

# 5. The tables
python docs/analysis/talent-comparison/compare.py <scratch>/mistborn-talents.json <scratch>/official-talents.json <scratch>/eco/all-talents.json
```

`compare.py` prints C.1 (action mix), C.2 (cost), C.3 (damage), C.4 (depth and gating) and the
per-tree appendix. The Radiant rows are a spreadsheet summary, so its damage column is a prose
count, not a formula count — the document says so wherever it quotes one.

## What each row of the Mistborn table carries

`flatten-mistborn.py` reads a 3.x talent the way the system does: activation, cost and consumption
from the **embedded action** (`system.__embedded.items[0]`) when there is one, and from the talent's
own top-level fields otherwise (a passive has neither). `shape` records which it found. `art` and
`metal` come from the pack's folder path; `events` lists `(event, handler)` pairs; `prerequisites`
on a talent are empty in this corpus — the gates live on the `talent_tree` nodes, which the script
keeps under `trees[].nodes` (types: `talent` managed, `skill` with a rank, `power`, `connection`,
`ancestry`).
