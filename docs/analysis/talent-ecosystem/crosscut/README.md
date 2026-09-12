# Cross-cut analyses — raw agent output, 2026-09-09

**These are agent outputs, not measurements. No script regenerates them.** Everything in this
folder was exported verbatim from Workflow run **`wf_0b59b6ca-5bc`** (33 of 33 agents completed),
the cross-cut of record for the talent ecosystem review. It was seeded from the 21 profiles in
`../profiles/` by `make-crosscut.js`.

| File | What it is |
|---|---|
| `<key>.md` × 13 | One ecosystem analysis each — the analysis as written, then its adversarial verification: every load-bearing claim marked CONFIRMED / CORRECTED / REFUTED with evidence, what the analysis missed, and the findings that survived. Keys: `damage-distribution`, `leyline-vs-heroic`, `deity-parity`, `overlap-matrix`, `blue-vs-scholar`, `synergy-map`, `advantage-economy`, `sovereignty`, `nondamage-viability`, `good-at-something`, `intent-drift`, `cost-curve`, `depth-reachability`. |
| `problem-ledger.json` | The ranked ledger: 20 problems, each with evidence, severity, blast radius, kind (DESIGN / IMPLEMENTATION / DOCUMENTATION), whether it needs a ruling, and the defence's strongest objection. Plus `droppedAsArtefact` — 11 findings the ledger threw out, several of which overturned claims this review had already published. |
| `completeness-critic.json` | What the thirteen analyses missed, where they contradicted each other, and one new structural finding (the multi-enemy damage census). |
| `defence-advocate.json` | The strongest honest case that the design is working as intended — and what it conceded. |
| `options-minimal.json`, `options-identity.json`, `options-systemic.json`, `options-player.json` | Four remediation option sets, each written under a deliberately different framing, each with ranked proposals, a single first change, and an argued position on Blue/White damage and on Sovereignty. |

## How to read this

**Later and better-checked wins.** Within a file, the verification outranks the analysis. Across
files, the problem ledger outranks both, because it re-checked findings against talent text,
`data/authored/`, and engine source after everything else had run. And `../README.md` plus
`EDHA_RULINGS.md` outrank all of it: they carry the corrections made after this run, several of
them to claims this run introduced.

**Known stale ground inside these files.** Most analyses reasoned from dossiers regenerated
mid-run, and eight of them recommend "fix the earliest-level bug in `derive-dossiers.js`" — that
fix had already landed by the time the ledger checked (its `droppedAsArtefact[0]`). A later repair
also corrected the fix's own over-reach on `Shared Burden`, which gates on an attribute, not a
skill. Treat any level-dated claim here as unverified until `../README.md` confirms it.
