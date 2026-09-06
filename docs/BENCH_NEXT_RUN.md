# Next bench session

> **Weekend marathon, run 14 (bench run 37, 2026-09-06) is done — and it was the LAST run of that PM
> session.** **Fix pass 6's max-HP fix is VERIFIED and its row is retired**, with the doubler
> reproduced as a positive control in the same window, so it is a measurement and not a silence. The
> other two rows did not fail — they were **sharpened**, each in a way that would otherwise have
> burned a future run: the **Investiture gate is correct in code but unverifiable while Ben's
> `Gamemaster` client predates the deploy**, and **item 10's "set the token to Secret" probe does not
> produce a sideless creature on this build at all**. **1 row retired, 2 rows re-specified, 0 new
> defects, 0 new rulings.** Final id and flag diffs **EMPTY**; the effect diff's five entries were
> serialisation artifacts, not residue. No `⛔ STOP`, **no pack rebuild owed.** Open queue **27 🤖 →
> 26 🤖**. ⚑ unchanged at **21**.

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 37` delta** (top of the file) — the
four-actor ADD-mode control table, the three-probe Investiture sequence, and §5's statement of the
world state including the false-positive effect diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 37"** — **three of these change what you
do before you drive anything**: a **two-GM gate row cannot be verified while EITHER GM client predates
the deploy** (hash-verifying the *served* file proves only what a newly-joining client runs); the
**"probe 3" pattern** is the general recipe for testing any per-client-per-session Set-gated write;
and **effects must be compared key-sorted** or you get false positives — which is probably what the
standing "Guardian Stance moves in both directions" hazard has been. Also: **`prepareData()` is the
doubler, `reset()` is the restore**; **`Bench — Green` is NOT an AE-free control** (it carries the same
`Hardy — Max HP` effect as White, spelled with a different dash); **`SECRET` is `-2`, a finite number**;
and **the Chrome-extension tools may be down — the browser-pane tools drive the whole run fine.**
**Runs 36, 35 and 34's lessons still apply in full.**

**→ `EDHA_RULINGS.md`** — **no new rulings this run.** R-77 carries a new note: run 37 could not
confirm its applied default live, for the stale-client reason above; **this does not reopen the design
question**. **R-43 is still applied and still changes live dice math**; **R-56 still blocks** the
"adversary tokens see like PCs" row.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ⛔ 0. STEP ZERO — ASK WHETHER BEN'S CLIENT IS CURRENT, BEFORE ANY TWO-GM ROW

**This is new, it is cheap, and run 37 lost a row to not knowing it.** Hash-verifying the served
`register-skills.js` proves what a **newly joining** client will run — it says **nothing** about a
client that has been connected since before the push. Ben's `Gamemaster` has been connected
continuously through runs 24–37, and **every engine fix since is ENGINE-ONLY, i.e. F5-on-every-client**.

- If the run contains **no** two-GM row, this costs you nothing — note it and move on.
- If it does: **the Investiture re-test is BLOCKED until Ben F5s his client**, and so is any other
  "one applier" row. Record it BLOCKED with that blocker named — **not FAIL, and not ⚑**. Do not
  re-derive run 37's three probes to rediscover the same thing.

## ✅ 0b. THE RE-TEST BLOCK IS NOW GENUINELY EMPTY

Fix pass 6's two rows were run 37's whole budget. One retired; the other is the blocked one above.
**There is nothing left in this block — for the first time in eleven runs, do NOT open on it.**

## ⭐ 1. THE WIZARD BLOCK — 6 🤖, never driven in THIRTEEN runs. **Open here.**

Every blocker in front of it is closed, the re-test block is empty, and it has now been deferred
thirteen times — including twice with "take this first" written at the top of this file. **Start with
a DEPLOY-STATE re-read of all six rows**: every wizard row predates the 2026-07-26 deploy line, so the
cheapest possible outcome is several retiring without a single cast. The
**wizard-as-a-player walkthrough** pairs with a player client (`PlayerBench`) and is large: only start
it if you can finish it, and **open the player window EARLY** — run 36's JS-driven join recipe makes
that cheap (`sel.value = "yF9LHvfhB7otsHYY"`, dispatch `change`, `.click()` the join button; expect the
next call to fail with *"Inspected target navigated or closed"*, which is the join succeeding).

## 2. Item 10's sideless probe — **the recipe is FIXED now; do not use "Secret"**

Measured at run 37: **`CONST.TOKEN_DISPOSITIONS.SECRET === -2`**, a finite number, and
`edhaDisposHostile` (engine ~L4367) fails closed only on `!Number.isFinite(...)`. So a Secret token
**still reads as an enemy** — setting a token's disposition to Secret tests nothing. **Use the row's
own fallback: a creature whose actor has NO token on the scene.** The Playtest Map carries only
dispositions `-1` and `1`, so the probe must be staged. Three sites still to drive, each with a normal
hostile token beside it as the matched control: **(a)** the burst capture, **(b)** the `edha-aura`
adjacency sweep, **(c)** the Fortified Foundation (plus its owner half — an owner whose own side does
not resolve should get a "could not resolve the Foundation owner's side" warning instead of a Region
that damages everyone). Anything that still fires on the probe is a **missed site**, reported by name.

## 3. AoE burst auto-target — deferred SIX times, one cast

Place any burst (Flame Surge): assert the caught tokens end up actually in `game.user.targets`. This
retarget was silently no-opping on v13. Console-runnable, no player client, no combat. **It is still
the single cheapest unclaimed row in the file.**

## 4. The items-dump pair, then a bestiary section

CAE burns needs a combat — run 34's three-line `active:false` + `ui.combat.initialize({combat})`
recipe. **Never activate a bench combat.** Kindle's token-light half: ℹ️ a bestiary Kindle row was
retired at run 18 with a live `dim 20, bright 10, animation flame` reading — check whether that
already answers it before staging. Then a bestiary section if the budget survives (five rows untouched
all marathon; the fresh-import recipe is routine).

## Where the 26 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **`BENCH — Engine-wide & cross-tree`** | 2 | The **Investiture re-test** (BLOCKED on Ben's client being current — see step 0) and **item 10's sideless probe** (recipe corrected at run 37; genuinely drivable). |
| **Character-creation wizard v2** | 6 | ⛔ **Never driven, THIRTEEN runs running. This is the block to take FIRST.** Re-read each row against DEPLOY STATE before staging. |
| **Bestiary sections** (W29 ×3, Goldenport ×1, Vorsk ×1) | 5 | Untouched all marathon; each needs its own fresh pack import + staging. |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | pass 5.2 / 5.3 rows. Includes the ones needing **zero GM clients** — still blocked on Ben. |
| **Bench-results fixes** | 2 | The vision row is blocked on **R-56**, not on a table. **AoE burst auto-target** is drivable and cheap. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — a bulk sync rewrites Ben's campaign actors (outside hard rule 4). Do not re-attempt un-authorised. |
| **Items-dump tranche** | 2 | **CAE burns** (needs a combat) and **Kindle's token-light half**. |

**Item 12's three sites, item 13's spend AND heal halves, item 14's picker AND `edhaSovTargets`
halves, R-4's eight faces, the `# Bench-results fixes` single-target picker row, and fix pass 6's
max-HP row are all CLOSED — do not re-queue any of them.**

## Known blockers — do not fight these

- ⭐ **NEW: any two-GM row is blocked while Ben's `Gamemaster` client predates the current engine.**
  See step 0. This is not a code problem and not a ruling.
- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. Ben's `Gamemaster`
  was connected again this run (`["Bench","Gamemaster"]`). Record BLOCKED with the blocker named —
  never re-file as ⚑. **This needs Ben to disconnect for one window.**
- **The two `# Adversary pack sync` rows need BEN, not a bench run.**
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table.
- ⚠️ **Ben's world holds an ACTIVE, STARTED, ZERO-COMBATANT combat** (`BerbNeuXp4iKduef`, round 1) —
  confirmed again this run. Not the bench's; leave it alone. It means **`game.combat` is never
  null**, which silently selects the round-tag branch of `edhaOrderPromptGate` /
  `edhaShatterPromptGate`. If a row's premise is "with no combat in the tracker", that premise is
  already false. ℹ️ Zero combatants, so `edhaInActiveCombat(actor)` is still null for everyone.
- **`game.combat` is the client's VIEWED combat** — an `active:false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a
  bench combat.**
- **Observer/rAF-dependent state is stale on this bench** — use `canvas.pan()`, `teleport: true`, and
  `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The
  Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans (checked again run 37).
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs
  included.
- ℹ️ **The "creating/deleting a bench token moves `Guardian Stance (+1 Deflect)`" hazard is probably a
  MEASUREMENT artifact.** Run 37 reported five such "changes" and every one was JSON key order
  (`{key,mode,value}` vs `{key,value,mode}`). Snapshot as before, but **compare key-sorted** before
  believing it.

## Harness traps — each has already produced or nearly produced a false result

- ⭐ **A `_stats`-only update in a userId observer is a write that got DIFFED TO EMPTY**, not noise —
  `_stats.lastModifiedBy` tells you that user really did issue one. (Run 37.)
- ⭐ **A per-client, per-session Set masks the gate it guards.** Test it with the probe-3 pattern:
  create the actor carrying the CORRECT value so no client's Set is seeded, then make it stale in one
  update. (Run 37.)
- **A SILENCE result proves nothing without a positive control in the same budget window.** (34, 36, 37.)
- **A two-GM row needs a `userId`-recording hook observer** — and the **delete** hooks take three
  arguments. (Run 36.)
- **`resize_window` refuses a blank tab; a scaled pane makes coordinate clicks miss the join button.**
  Navigate → resize → navigate; join from JS. (Run 36.)
- **`edha.drawMana()` takes the ITEM.** Bare = silent no-op. (Run 36.)
- **A die-step leaves a flag AND a status** (`Exalted` / `Diminished`) — clear both. (Run 36.)
- **`prepareData()` DOUBLES every ADD-mode effect; `reset()` is the restore.** (Runs 36, 37.)
- **The 0×0 canvas needs `resize_window` AND A FULL RELOAD, on the first tab too.** (Run 35.)
- **An H3 ledger staged by hand needs its MARKER STATUS** or `edhaOwnerList` reads it empty. (35.)
- **A staged talent's own `activation.consume` opens a Consume Resource dialog that never settles.**
  Clear it, or click `button[data-action="continue"]` inside `div.app.window-app`. (Runs 35, 36.)
- **Walls silently shrink an area heal/pulse** — use `testCollision` to pick the cell. (Runs 35, 36.)
- **A raw HP `update()` fires no damage-cadence rule** — use `actor.applyDamage([{amount, type}])`. (34.)
- **`combat.nextTurn()` can leave `turn === null`.** (Run 34.)
- **A light's `dim`/`bright` are in FEET.** (Run 34.)
- **`actor.effects` omits item-transferred AEs** — print it beside `allApplicableEffects()`. (33, 34.)
- **The engine's functions are MODULE-SCOPED** — re-implement a helper inline. Run 37 did exactly this
  to read `edhaDisposHostile` and `edhaNoOtherActiveGM`, and it is how both findings were reached.
- **A talent that drops dangerous terrain damages your own caster.** (Run 33.)
- **`animate: false` can commit a PARTIAL token position** — use `{animate:false, teleport:true}`. (32.)
- **The setup script's IIFE is fire-and-forget** — judge idempotency from `game.actors.size` /
  `scene.tokens.size`, not the log. ✅ **Run 37's cheap way to load it: copy it into the installed
  module folder and `fetch` + `eval` it from `/modules/edha-content/…`, then delete the temp file** —
  one small call instead of pasting 22 KB.
- **A dotted flag delete leaves the PARENT object behind as `{}`.** (31–34.)
- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS.** (31, 33.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire in one call, read in the next. (26, 28–30, 33, 35.)
- **`item.use()` never settles while a dialog is open** — run 32's `__cast()` loop handles both shapes.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent no-op.
- **A skill-test talent will simply MISS sometimes** — check the target's defense first. (Run 34.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Verify the deploy by HASH from BOTH sides.** Run 37's was `57a8c950…` at `main`'s #203 merge —
  but see step 0 for what a hash does **not** prove.

## Standing lessons

- **The re-test block is EMPTY for the first time in eleven runs — so open on the WIZARD block**,
  which has now been skipped thirteen times and is the largest untouched thing in the file.
- **Stage each row off the PREVIOUS row's residue.** Run 37 got its whole ADD-mode control table out
  of one `prepareData()` / `reset()` pair.
- **Verify a row's named SUBJECT exists before staging anything** — and **verify the row's own PROBE
  actually produces the condition it claims**. Run 37's Secret-disposition finding is the case in
  point: the row would have "passed" on a probe that was never sideless.
- **Once a matched control has proven a root cause, WRITE THE RESIDUAL SYMPTOM DOWN AND MOVE ON.**
- **Refuse to inherit the previous run's blocker — re-derive it.**
- **Read the cards you did not come for.** Runs 31–37 each found something that way.
- **Only claim what your own logs support, and label inferences as inferences.** Run 37's stale-client
  conclusion is explicitly an inference — three observations fit it, and none of them reads Ben's
  client directly.
