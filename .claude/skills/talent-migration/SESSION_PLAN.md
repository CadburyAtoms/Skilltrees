# The remaining migration, partitioned into sessions

**State: 131 talents on the ratchet** (221 at the start 2026-07-24; −90 in sixteen passes A–P).
Split **0 / 19 / 95 / 17** (bucket 1 / 1b / 2 / 3).

Recompute before trusting any number here — talents convert and this file goes stale:

```bash
node scripts/check-2b-classification.js --priority
node scripts/lint-refs.js                      # pass 7 prints the live ratchet count
```

---

## ⛔ READ THIS BEFORE PLANNING ANYTHING FROM THE COLUMNS

**67 of the 131 have no unbuilt handler left in their `needs` column.** That figure has been wrong in
**eight consecutive passes** — it was 11 (delivered 0), 31 (delivered 1), 53 (delivered 10). It counts
talents whose *gate* exists. It never counted the payload, the coupling, the shape, or whether the
talent's data lives somewhere a rule can reach.

**The single largest hidden blocker is a PAYLOAD cluster that appears in no handler's demand column:**
the applyDamage family — a pre-damage veto, in-flight damage reduction, a second-hit-this-round
counter, a scene tally, and a heal-a-fraction-of-what-you-just-dealt link. Roughly **20+ talents
across ~8 trees** sit behind it, filed under "H8" (built) or "H6+H8" (both built) and therefore
reading as ready. §9o has ruled this cluster out of scope three times without ever naming it as a
build. **It is the highest-leverage unbuilt thing left.**

Use `--priority` to **rank builds**, never to forecast a pass's output.

---

## The partition — every talent in exactly one atom

Handler demand counts overlap (most bucket-2 talents name two), so they cannot be summed into a plan.
This assigns each of the 131 to one unit of work.

| atom | n | build needed |
|---|--:|---|
| Knowledge, whole tree | 9 | **H3b** — `edha-owner-counter` as a MODE on H3 (§9m q6) |
| Sovereignty, whole tree | 7 | **H9** `edha-die-step` (§9m q1 — ruled BUILD IT) |
| LEDGER: `edicts` (Order) | 5 | H3ann + accessor repoint |
| LEDGER: `snares` + `ordained` (Fate) | 6 | H3ann + H2 + repoint ×2 — **two ledgers, two sessions** |
| LEDGER: `remains` (Death) | 4 | repoint + key rename + a pop-oldest op |
| LEDGER: `charges` (Destruction) | 2 | H3ann + H2 + canvas cleanup |
| Chaos (ledger already repointed) | 3 | H8 range sweeps |
| Seek Quarry (Hunter) | 1 | the quarry flag, H3-shaped |
| bucket-1b sweep | 15 | ⚠️ **unknown** — all read `needs: []` |
| H2 zones | 7 | **H2** `edha-zone` |
| H7 auras | 7 | **H7** `edha-aura` |
| the payload residual | 48 | mostly **not** handlers — see above |
| declared ENGINE-OWNED exits | 17 | **no build** — cue rule + `ENGINE_OWNED:` header line |

### ⚠️ A correction to the record
The docs track **five** marker ledgers. Death's `remains` is a **sixth** of the same shape —
legacy-flat at `flags.edha-content.remains`, needing the same accessor repoint — and it is what still
holds Risen Servant. §9o's ledger table should be corrected.

---

## The plan

Sessions 1–3 are the cheap, high-certainty run: **33 talents, 131 → ~98**, and two whole trees retire
from bench passes. Take them in order unless Ben's table priorities say otherwise.

| # | session | delivers | confidence | why |
|---|---|--:|---|---|
| **1** | **H3b → Knowledge** | 9, whole tree | **high** | One tree, one mechanic. Insight is a *counted single bearer* (0–5 on one creature, transferring clears the old), not a capped list — H3 cannot express it, which pass G established by reading all six ledgers. Ben ruled it a **mode on H3**, not a second handler, which moots the one-tree objection. All 9 name only H3b + built handlers. |
| **2** | **H9 → Sovereignty** | 7, whole tree | **high** | One tree, one ledger (`edhaSovAddStep`, ±1 damage die step). Ruled BUILD IT. Also on **Expose**'s critical path — Expose gates on "diminished BY YOU with Censure/Decree", a `dieStep` entry, so it cannot convert before H9 no matter what else lands. |
| **3** | **The 17 declared exits** | 17 | **high** | **No build at all.** Bucket 3 is not an exit from the ratchet by itself: each needs a marker/cue rule on the talent (`edha-note`, built pass F) + an `ENGINE_OWNED: <reason>` line in its tree-section header. Cheapest per talent of anything remaining, and it makes 17 empty tabs honest. |
| **4** | **bucket-1b scout + convert** | ?? of 15 | **low** | All 15 read `needs: []` and that column has never survived contact. **Scout first, convert what is real, re-file the rest.** Budget it as a measuring pass; treat conversions as upside. |
| **5** | **The applyDamage payload cluster** | ~20 | **medium** | The biggest win left and invisible to `--priority`. One coherent build: pre-damage veto, in-flight reduction, second-hit counter, scene tally, heal-fraction link. Unblocks talents across White, Life, Power, Death, Order, Green, Red at once. **Scout the applyDamage wrapper as one atom before costing it.** |
| **6–10** | **The ledgers, one per session** | 21 | medium | Ben's q7 ruling. Order: **`edicts` first** (cheapest — `allowDuplicates` and `multiOwner` both shipped with `covenants`), then `remains`, `charges`, `snares`, `ordained`. The deliverable of a ledger pass is the **REPOINT**, not the talent count. |
| **11** | **H2 zones + H7 auras** | 14 | medium | Cross-tree, no ledger entanglement. Several presumed auras are really H8 watchers — verify shape first. |
| **12+** | **White / Green residual** | remainder | low | White is the largest tree left (19). Mostly session 5's cluster; re-plan after it lands. |

### Sequencing notes
- **1, 2 and 3 are independent** — any order, and none blocks the others.
- **5 should come before 12+**, or the White/Green work will be re-planned twice.
- **Never start a second ledger in one session.** Finish early → take the next non-ledger atom.
- A **cleared tree retires a whole bench pass**, which is worth more than a bigger raw count. Blue,
  Black and Warrior are already clear of bucket 2.

---

## Per-session detail for the next three

### Session 1 — H3b, Knowledge (9)
`Studied Mark · Killing Blow · The Final Study · Predatory Strike · Hunter's Discipline · Death Mark ·
Accumulate · Pack Share · The Pack`

Build as a **`mode` on `edha-owner-list`**, not a second handler (§9m q6). H3 places and releases
marks and cannot express a count; Insight is a count on a single bearer. 5 of the 9 also name H8,
which is built. ⚠️ Scout `edhaGnosis*` call sites first — Predatory Strike is one of the five
hand-rolled arm-and-consume implementations and may not be an H3b talent at all.

### Session 2 — H9, Sovereignty (7)
`Censure · Decree of Ruin · Edict of the Fallen · Exalt · Investiture of Authority` (+ Expose via H8,
+ 1 bucket-1b, + 2 bucket-3 which belong to session 3).

⚠️ `edhaSovRollWatch` hosts **Expose + Edict of the Fallen + Balance** in one function — a WATCHER
atom. Converting one leaves the others reading a function whose checks have moved. Scout it whole.

### Session 3 — the 17 declared exits
Chaos `Void Sense` · Civilization `Magnum Opus` · Death `Raise Dead` · Destruction `Combustion Chain` ·
Order `Final Decree` · Power `Mantle of the Aspirant` · Sovereignty `Sovereign's Balance`,
`Sovereignty` · Leader `Resilient Hero` · Warrior `Wary` · Black `Dread Presence` · Blue
`Phantom Double`, `Living Image` · Green `Natural Order` · White `Terms of Accord`, `Bound by Word`,
`Voice of Authority`

Each needs: a rule on the talent that **at minimum posts a card** (`edha-note`), an
`ENGINE_OWNED: <reason>` line in the tree-section header, and its name out of engine *code*. ⚠️ Two
cautions: **Dread Presence** was "manual by nature" until a `preUpdateToken` veto enforced it — so
**re-litigate each one against iron rule 3 before accepting the exit**; some are backlog, not
engine-owned. And per §9m q10 an empty Events tab is acceptable **when the talent's dials are reachable
in Foundry** — check that before declaring.
