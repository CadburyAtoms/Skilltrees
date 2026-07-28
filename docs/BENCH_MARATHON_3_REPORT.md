# Bench marathon 3 — report (2026-07-27/28)

**8 bench runs (16–23) · 6 fix passes · 36 commits · ~159 rows retired on evidence · 20 defects found,
19 fixed · 3 new build gates · engine tests 325 → 408.**
**Bench queue: 210 🤖 → 51. Ben's own list: 227 ⚑ → 22.**
**The pack-rebuild list stayed EMPTY through all six fix passes.**

> **Why this marathon existed.** Marathon 2 finished with 294 open rows, 227 of them flagged ⚑, and Ben
> pushed back: he had asked for the mechanical bench tests to be *done*, and was handed a list full of
> "use talent X on target Y" rows marked as his. He was right, and the cause was structural — §0.
>
> **Predecessors:** [`BENCH_MARATHON_REPORT.md`](BENCH_MARATHON_REPORT.md) (marathon 2); marathon 1 at
> `e490ba1:docs/BENCH_MARATHON_REPORT.md`. **The rulings live in
> [`EDHA_RULINGS.md`](../EDHA_RULINGS.md)** — 59 standing decisions, no longer a section in any report.

---

## 0. The root cause of the complaint, and the fix

`⚑` is documented in the handoff as **"Could not self-verify (no Foundry here)"**. That was
indistinguishable from *"only Ben can do this"* until **2026-07-26**, when the `bench-run` skill gave
agents their own Foundry client. Nobody re-tagged — and **both bench skills instructed subagents that
"⚑ rows stay ⚑ Ben's"**, so marathon 2 walked past ~201 drivable rows by correctly following its own
documentation.

A mechanical amplifier made it worse: in six bestiary sections written 07-20 → 07-22, ⚑ was placed on
the `##` **subsection headers** and inherited by every row beneath. Sections authored row-by-row
flagged **6 of 16**; the blanket sections flagged **105 of 108** and **26 of 26**.

**What was done:**
1. **Three read-only audits** covered all 294 rows: **38 closed on quoted evidence, 17 deleted as
   stale, 13 narrowed** to their unproven half → 294 → 240.
2. **The marker vocabulary was split.** `⚑` = Ben's judgment, full stop. **`🤖` = needs a table, an
   agent drives it.** 182 ⚑ → 22 ⚑ + 210 🤖; all 31 marker-carrying `##` headers cleared.
3. **The definition was fixed** in the handoff and iron rule 5, and **both bench SKILL.md files
   corrected** — *"🤖 = that is your queue. ⚑ = leave it."* Without this the next marathon rebuilds the
   same backlog.
4. **A gate**: the dashboard build now fails if a row carries both markers, or a header carries either.
   It caught a real instance immediately.
5. **The rulings were extracted** into `EDHA_RULINGS.md`. Decisions had been sitting as unchecked test
   boxes — most of why 227 ⚑ read as a testing backlog rather than a dozen pending calls.

---

## 1. Disposition

| | Start | End |
|---|---|---|
| Bench queue 🤖 | 210 | **51** |
| Ben's ⚑ | 227 | **22** |
| Total open rows | 294 | **75** |
| Standing rulings | 33 (buried in a report) | **59** (own doc) |
| Engine tests | 325 | **408** |

**Cleared entirely:** W23 adversary pipeline · Culture items · Currency wiring · Bench 07-18 fixes ·
Lunavar Fens · Malcurr Lakes · Canticle Plains · Kettavar Tundra · Destruction · Chaos · Death ·
Civilization · Knowledge.

### What remains

| Section | 🤖 | Why |
|---|---|---|
| Adversary ability wiring | 12 | Run 20 ran out of runway; clusters on 4 actors |
| Wizard v2 | 6 | Weapon-slot variants + observer-dependent rows |
| Green (leyline) | 4 | Need a turn boundary or an **Opportunity** — the one genuinely awkward trigger |
| Engine-wide · White · Bench-results · Player-client | 3 each | Budget; several are two-client *rendering* |
| W29 · Items-dump | 3 each | Ruling-gated (R-48) or budget |
| Blue · Adversary pack sync · Vorsk | 2 each | Budget |
| Red · Order · Heroic · Goldenport · Ashkar | 1 each | Budget |

**Run 23 reached 7 of 22 and declared 14 NOT REACHED** — none re-filed as ⚑. Its density was ~1 row
per 2 driving calls against 12.5–13.5 for the wizard and re-test runs, because the tails share no
common subject.

### Density, measured (rows retired per subject imported)

r16 **1.2** · r17 **1.4** · r18 **3.9** · r19 **2.1** · r20 **0.62** · r21 **12.5** · r22 **13.5**

The pre-marathon estimate of ~4.5 was wrong in both directions — **section shape dominates**. Run 20
diagnosed its own 0.62 (9 speculative imports, 4 never driven) rather than shrugging, which became the
runbook rule *import for the rows you'll drive next*.

---

## 2. Defects: found → fixed → re-tested

**20 found, 19 fixed, every one engine-only.** Each fix ships a pinned, mutation-verified test.

### Infrastructure findings — these outrank the game bugs

**`lint-refs.js` was blind over 5.9% of the engine.** Its string/comment blanker desynced on **nested
template literals** — closing a template early, spilling string text into "code", after which a stray
apostrophe in prose opened a runaway span. Measured: **116 runaway spans, 598 lines blanked to
nothing**, with passes 11, 15, 16 and 17 scanning that region and **reporting green**. Fixed:
598 → 23. This is how the third object-as-scalar site survived a hand sweep.

**Two gates were inert on Ben's machine only.** JS `.` does not match `\r`, so the `//` strippers in
two source-reading tests did nothing on a `core.autocrlf=true` checkout — a comment read as live code.
CI (Linux/LF) stayed green, so the false red fired **only** on Ben's pre-commit hook.

**A swallowing `try/catch` cost four runs.** 33 outer click handlers ended in a bare `console.error`,
indistinguishable at the table from a no-op — which is how a hard TypeError was recorded as "the button
silently does nothing" across four bench runs. Now `edhaClickFailed` logs **and** notifies. Deliberately
**not** applied to the ~270 *inner* defensive catches: a toast that fires routinely trains the table to
ignore it (**R-59**).

### The game defects

| Defect | Reported as | Actually | Commit |
|---|---|---|---|
| Ambush ledger under a dotted uuid | "`setFlag` expands dotted keys" | the **value** expands via `mergeObject` at any depth; corruption **asymmetric** | `71408c5` |
| `Number()` on an object-typed field | 2 sites | **3** — the third meant the **Phantom Double / Seeming belief loop had never worked** | `382c4a9` |
| Cue key omitted `atFraction` | 2 items | confirmed 2 | `f228643` |
| A 0-ft push | "a regression" | **not a regression** — chain byte-identical; a one-square push is all-or-nothing by construction. The bug was the engine couldn't **say why** | `bf9243e` |
| `edha-pre-use` had no dispatcher | 1 ability | confirmed — **the only such event of 15** | `19ba9c2` |
| `ally-drops` fail-open, tokenless victim | side filter | side **and range** filters; 1 of 8 instances of the idiom | `1d6f6a3` |
| Falsy-zero `\|\| <default>` | 1 site | **4** — the worst gave **every static illusion a 25 ft walk** | `38e0c40` |
| Dedupe by object identity | 1 | 1 + 1 latent; **the obvious `id`-only fix is worse** (collapses three unlinked Raiders into one) | `27a4788` |
| `timed: true` immortal out of combat | "`braced` missing from a list" | the applier never reads that list; the stamp is **guarded on a running combat** — **5 ids / 7 rules** | `d79d225` |
| Wizard preview vs sheet | "one likely cause" | **three drifts, three causes, canon differs for each** — Move: preview wrong; **Senses: sheet wrong, and never written at all**; Health: R-54 | `e72bf74` |
| Health 13/14 | "Finish leaves it low" | **14/14 was unreachable by any route** — the system clamps before the module raises the max | `7662cb6` |
| Path training dead | "`linkedSkills: []` is an authoring gap" | **empty is CORRECT** (it means skills a path *unlocks*); the wizard read the wrong field, and the system already implements the real rule | `c2eaba5` |
| Country page overflow | "CSS" | **CSS was innocent** — a stale `top` measured while the map block was `display:none` | `efe93cd` |
| `ev.currentTarget` after `await` | 1 site | **genuinely 1** of 35 — and two *false positives* cleared (reads inside the await's own operand evaluate before suspension) | `245005e` |
| `deleteCombat` sweeps unscoped | "a sighting" | **20 of 24 registrations defective** — ending one combat wiped ledgers off actors in another | `2fb3f19` |

**One defect deliberately not fixed.** Sovereign of Solitude's `rules=0` was reported as an authoring
gap needing a rebuild. The source **already carries four rules** — it was a stale placed copy.
Authoring it would have duplicated rules *and* re-opened the empty rebuild list.

### Gates: 3 built, 4 declined — each with numbers

**Built:** pass 17 (numeric read of an object-typed system field; leaf list *harvested* from the system
bundle, not hand-maintained) · pass 18 (a sentinel-hooked event must be fired, dispatched, or declared
a shelf) · pass 19 (no `currentTarget` after an `await` — **0 false positives where the naive form gives
2**).

**Declined, with the measurement:** pair-level reachability (**returned the very bug it was built for as
a false negative**) · the `!== undefined` idiom (33% precision; the allowlist would *be* the gate;
regrowth measured flat at 3 for 120+ commits) · falsy-zero (sharp variant scored **0 of 4** real bugs) ·
"the preview must not re-implement a derivation" (fires on 6 of 9 correct cells, still misses Senses).

---

## 3. Rulings → [`EDHA_RULINGS.md`](../EDHA_RULINGS.md)

**Read §I first.** **R-43** — *"a card that says 'tests Speed' means the attribute"* — is **applied and
changes live dice math** on Concussive Yield and Inevitable Snare. Implementation proven; balance
question untouched.

Highest-leverage open items:
- **R-48** — a `bySize` rule ignores its authored `distanceFt`. **One decision settles four blocks
  across two colours.**
- **R-52** — `ally-drops` measures centre-to-centre with no slack while `enemy-turn-start` adds +2.5.
  The engine disagrees with itself.
- **R-54** — is 11 max HP at STR 0 intended? Now a one-line change moving sheet, preview and tests
  together.
- **R-56** — all 52 pack adversaries ship token sight **10** against a Senses Range of **5**, and ⟳ Sync
  pushes the 10: a synced token sees 10 ft and a freshly-dragged one sees 5, same creature.

---

## 4. Ben's queue

1. **⟟ Sync the module + F5.** All 19 fixes are engine-only and already synced by the orchestrator;
   your client needs the refresh. Two rows retire on that alone.
2. **Nothing else. No pack rebuild is owed** — the list has been empty since 07-27u and six fix passes
   kept it that way. The single queued data item (**Unbreakable Line has no `use` rule**) waits on its
   ruling, not on you.

---

## 5. World hygiene

**Zero drift across all eight runs**, verified by start/end id + flag + effect diffs including unlinked
token actors. Ben's campaign combat was read but never modified; no scene was ever activated.

Three items reported rather than silently repaired, each because the run could not **prove** it caused
them — the correct standard:
- Run 19: one additive `trigRound` key on `Stonebound Captain`, from a bench combat's turn sweep
  scanning every token on the scene. **That defect is now fixed** (`2fb3f19`).
- Run 22: two `edha-aura` "Guardian Stance" effects missing from `Bench — Blue` / `Bench — White`;
  cause not attributable from its logs. Re-entering the stance restores them.
- Run 23: a `Determined` effect on `Bench — Order` it could not date, because a page reload destroyed
  its start snapshot.

Runs 17, 18 and 22 each caught a flaw in their own harness mid-run; run 18's first flag revert used
`{recursive: false}` and stripped two sibling keys before it noticed and restored the whole object.

---

## 6. Method — nine wrong claims caught before shipping

**This is the number worth judging the marathon by.** Two were the orchestrator's.

1. Run 16's ambush mechanism (`setFlag` expands dotted **keys**) — it is the **value**.
2. **Orchestrator:** "the 0-ft push is a regression" — a bisect proved the causal chain byte-identical.
3. Run 17's "the destination square was unoccupied" — the overlap box uses the **mover's** width.
4. **Orchestrator:** reading L13294 as fail-closed — its `?? 1` is on the token side; it short-circuits.
5. Run 18's "hook ordering" — a **race**, which is why the symptom was intermittent.
6. Run 20's "Sovereign of Solitude is an authoring gap" — the source carries **four rules**.
7. Run 21's timed-status mechanism — the naive fix would have **auto-expired hand-toggled markers**.
8. Run 19's near-miss: Ben's cue owners were already gate-closed, so their silence would have proven
   the **once-per-round gate**, not the filter under test.
9. Run 20's near-miss: duplicate bench tokens made the engine measure range from a pre-existing token
   **121 ft away**, making a correct filter look dead.

**Two orchestrator prescriptions were correctly refused**: "only touch actors in that combat" would
have broken intended `tempHp` behaviour and an existing pinned test; deleting both Unbreakable Line
rows would have removed all coverage of an ability never benched.

**The standing rules that earned their keep:** verify the root cause in code before touching anything ·
verify a deploy by **hash** · **a re-test without its negative control is not a re-test** · check your
own harness before reporting a defect · a checked-in test that cannot fail proves nothing · and
**provenance, not shape, decides whether a guard is wrong**.
