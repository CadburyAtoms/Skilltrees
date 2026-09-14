# Bestiary analysis — the redo's measured ground truth

Started 2026-09-14 as step 2 of the bestiary redo (TODO_REPO_HYGIENE item 121, scoped with Ben
that day): **measure all 52 blocks before redesigning any of them.** The talent ecosystem review
(`../talent-ecosystem/`) is the model — scripts for ground truth, findings, then rulings with
recommended defaults — and R-101 (a) is the licence: adversary HP and damage may be read as a
yardstick, with no findings about adversary design and no adversary changes made by the reading.

| File | What it is |
|---|---|
| `CENSUS.md` | **Generated — never hand-edit.** `node scripts/bestiary-census.js --write`. The roster, the role bands (HP / defenses / Deflect / attack / damage per hit, min–avg–max by role), the colour ledger, every block on one row, the wiring shapes, the handler types no PC talent uses, the status ids the rules name, the damage types. `tests/bestiary-census.test.js` fails while it is stale against `data/adversaries.json` or `data/authored/`. |

**What the census does not measure, on purpose:** anything played. It counts per hit, not per
turn; it does not know hit rates against the party's real defenses, how many Actions a block
spends, or what a graze floors. Those come from the **bestiary yardstick fights** — bench runs
that play a minion pack, a rival pair and a boss against copies of the actual PCs and record
damage in and out per round, the way bench run 44 measured the Palewater ford (18 damage to the
party, 7 to the raiders, two structural causes and neither was a statblock). The recording
template is `.claude/skills/bestiary-forge/TURN_LEDGER.md`; the rows are the checklist section
"Bestiary yardstick fights".

The standard the numbers are read against is `.claude/skills/bestiary-forge/STANDARD.md`; the
decisions the census raised for Ben are rulings **R-128 … R-135** in `EDHA_RULINGS.md` §G.
