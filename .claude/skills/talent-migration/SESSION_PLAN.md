# The remaining migration, partitioned into sessions

**State: 128 talents on the ratchet** (221 at the start 2026-07-24; −93 in seventeen passes A–Q).
Split **0 / 18 / 93 / 17** (bucket 1 / 1b / 2 / 3).

Recompute before trusting any number here — talents convert and this file goes stale:

```bash
node scripts/check-2b-classification.js --priority
node scripts/lint-refs.js                      # pass 7 prints the live ratchet count
```

---

## ⛔ READ THIS BEFORE PLANNING ANYTHING FROM THE COLUMNS

**The "reads ready" figure was MEASURED on 2026-07-25 (pass 2bQ, audit §9p). Do not re-derive it.**

It was quoted here as 67. **The live figure was 64** (46 bucket-2 + 18 bucket-1b; the 17 bucket-3
exits also read ready, which is where the extra 3 came from). More importantly, **33 of those 64
cannot hold a rule at all**, for reasons no handler-demand column can ever see:

| blocker | n | why |
|---|--:|---|
| **TAKEOVER cancels `use`** | **15** | the name is in a `preUseItem` Set whose hook ends `return false` |
| **ALWAYS-ACTIVE** | **11** | `activation.type: none` — there is no `use` event to hold a rule |
| **DEALER-SIDE rider** | **7** | rides the `applyDamage` wrapper, not an on-use payload |

**The readiness test is FOUR legs, not three:** executor / schema field / event / **and is that event
reachable at all**. The fourth leg is the one that had never been checked.

**And the 31 that survive all four are still not 31 conversions:** 48 of the 63 remaining ratchet
talents carry more than one name-keyed site, so converting the dispatch case alone ships a talent
whose other mechanics silently stopped. **Apex Form has five mechanics** and reads `needs: [H8]`,
built.

**H8 `edha-watch` is a CONFIG-ONLY handler** (stub executor, swept by `edhaWatchersOfRule`). That is
correct — it is a *gate* — but it means **all 44 talents whose `needs` names H8 still need a separate
real payload handler.** This is the single largest reason the ready column overstates. 41 handler
types exist; **18 have stub executors** (all 18 have real readers — none are dead).

The **applyDamage payload cluster** (pre-damage veto, in-flight reduction, second-hit counter, scene
tally, heal-fraction link) remains the largest unbuilt payload, ~20 talents across ~8 trees, filed
under "H8"/"H6+H8" and therefore reading as ready.

Use `--priority` to **rank builds**, never to forecast a pass's output.

---

## The partition — every talent in exactly one atom

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
| bucket-1b sweep | 14 | ⚠️ **measured 07-25 — see below; not a cheap pool** |
| H2 zones | 7 | **H2** `edha-zone` |
| H7 auras | 7 | **H7** `edha-aura` |
| the payload residual | 48 | mostly **not** handlers — see above |
| declared ENGINE-OWNED exits | 17 | **no build** — cue rule + `ENGINE_OWNED:` header line |

### ⚠️ Corrections to the record
- Death's `remains` is a **sixth** marker ledger of the same shape (legacy-flat at
  `flags.edha-content.remains`), and it is what still holds Risen Servant. §9o's ledger table should
  be corrected.
- **The takeover Sets are a better atom than any handler.** Nine `preUseItem` Sets
  (`EDHA_CHAOS_TALENTS` L9961, `EDHA_FATE_TALENTS` L10395, `EDHA_ORDER_TAKEOVER` L13865,
  `EDHA_DEATH_TAKEOVER` L11314, `EDHA_POWER_TAKEOVER` L12522, `EDHA_SOV_TALENTS` L10842,
  `EDHA_CIV_TAKEOVER` L11903, `EDHA_GNOSIS_TAKEOVER` L13026, `EDHA_DESTRUCTION_TALENTS` L8995) hold
  15 ready talents **plus most of the not-yet-ready ones in the same trees**. Each Set is one
  coherent dismantle that frees a whole tree at once.

---

## The plan

| # | session | delivers | confidence | why |
|---|---|--:|---|---|
| **1** | **H3b → Knowledge** | 9, whole tree | **high** | One tree, one mechanic. Insight is a *counted single bearer*, which H3 cannot express; Ben ruled it a **mode on H3**. ⚠️ Knowledge is behind `EDHA_GNOSIS_TAKEOVER` — dismantle it in the same pass or the rules will be inert. |
| **2** | **H9 → Sovereignty** | 7, whole tree | **high** | One tree, one ledger (±1 damage die step), ruled BUILD IT. Also on **Expose**'s critical path. ⚠️ Behind `EDHA_SOV_TALENTS`; same caution. |
| **3** | **The 17 declared exits** | 17 | **high** | **No build at all** — an `edha-note` cue rule + an `ENGINE_OWNED:` header line each. Cheapest per talent of anything left. |
| ~~4~~ | ~~bucket-1b scout~~ | **DONE 07-25** | — | **Ran as the measuring pass. Result: 1 conversion, and the three structural blockers above.** The 1b pool was never the constraint. Full working in audit §9p. |
| ~~5~~ | ~~The REVEAL handler~~ **DONE 07-25** | **2** | — | Built as **H24 `edha-reveal`** in the same pass that named it; **Sharp Eye** and **Vital Diagnosis** both converted, and `EDHA_HEROIC_DEFTESTS` is now empty. See ENGINE_INDEX for the field list — reach for it for any scouting/lore-reveal payload rather than hand-rolling another whispered card. |
| **6** | **Dismantle one takeover Set** | ~4–5 + its tree | **medium** | Start with **Order** (`EDHA_ORDER_TAKEOVER`, 5 names, 3 of them ready) — it is the smallest Set whose members are already classified, and Order's `edicts` ledger work wants the same session. |
| **7** | **The applyDamage payload cluster** | ~20 | **medium** | The biggest win left, invisible to `--priority`. Scout the wrapper as ONE atom before costing it. |
| **8–12** | **The ledgers, one per session** | 21 | medium | Ben's q7 ruling. Order: `edicts`, then `remains`, `charges`, `snares`, `ordained`. The deliverable of a ledger pass is the **REPOINT**, not the talent count. |
| **13** | **H2 zones + H7 auras** | 14 | medium | Cross-tree, no ledger entanglement. Several presumed auras are really H8 watchers — verify shape first. |
| **14+** | **White / Green residual** | remainder | low | White is the largest tree left. Mostly session 7's cluster; re-plan after it lands. |

### Sequencing notes
- **1, 2, 3 and 5 are independent** — any order, and none blocks the others.
- **7 should come before 14+**, or the White/Green work will be re-planned twice.
- **Never start a second ledger in one session.** Finish early → take the next non-ledger atom.
- A **cleared tree retires a whole bench pass**, worth more than a bigger raw count. Blue, Black and
  Warrior are already clear of bucket 2.
- ⚠️ **Check the takeover Set before scheduling ANY deity tree.** Chaos, Fate, Order, Death, Power,
  Sovereignty, Civilization, Knowledge and Destruction all have one. Authoring a `use` rule on a
  talent inside one produces a perfect-looking Events tab that does nothing.

---

## Per-session detail for the next three

### Session 1 — H3b, Knowledge (9)
`Studied Mark · Killing Blow · The Final Study · Predatory Strike · Hunter's Discipline · Death Mark ·
Accumulate · Pack Share · The Pack`

Build as a **`mode` on `edha-owner-list`** (§9m q6). ⚠️ Scout `edhaGnosis*` first — Predatory Strike
is one of five hand-rolled arm-and-consume implementations and has a **dealer-side** half in
`edhaGnosisDealerPre`/`Post` (applyDamage wrapper, L1013/L1064), so it is a MECHANIC atom, not an
H3b talent. ⚠️ `EDHA_GNOSIS_TAKEOVER` (L13026) holds Studied Mark, Killing Blow and The Final Study.

### Session 2 — H9, Sovereignty (7)
`Censure · Decree of Ruin · Edict of the Fallen · Exalt · Investiture of Authority` (+ Expose via H8,
+ 1 bucket-1b, + 2 bucket-3 which belong to session 3).

⚠️ `edhaSovRollWatch` hosts **Expose + Edict of the Fallen + Balance** in one function — a WATCHER
atom. ⚠️ `EDHA_SOV_TALENTS` (L10842) takes over all seven. ⚠️ **Expose is `activation.type: none`**,
so it can hold no `use` rule at all — it needs an engine-detected event.

### Session 3 — the 17 declared exits
Chaos `Void Sense` · Civilization `Magnum Opus` · Death `Raise Dead` · Destruction `Combustion Chain` ·
Order `Final Decree` · Power `Mantle of the Aspirant` · Sovereignty `Sovereign's Balance`,
`Sovereignty` · Leader `Resilient Hero` · Warrior `Wary` · Black `Dread Presence` · Blue
`Phantom Double`, `Living Image` · Green `Natural Order` · White `Terms of Accord`, `Bound by Word`,
`Voice of Authority`

Each needs a rule that **at minimum posts a card** (`edha-note`), an `ENGINE_OWNED: <reason>` line in
the tree-section header, and its name out of engine *code*. ⚠️ **Re-litigate each one against iron
rule 3 before accepting the exit** — Dread Presence was "manual by nature" until a `preUpdateToken`
veto enforced it. Per §9m q10 an empty Events tab is acceptable **when the talent's dials are
reachable in Foundry** — check that before declaring.
