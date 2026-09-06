# Next bench session

> **Weekend marathon, run 13 (bench run 36, 2026-09-06) is done.** **Item 12's two-GM row PASSED on
> all three migrated sites** — an Awareness change wrote the sight range **once**, a Region delete
> swept **exactly** its two paired Drawings in one batch with no race, and a **player-relayed
> `burst-apply` landed once** (HP 20 → 17, not 14) with both GMs connected. **Item 13's heal clamp**
> and **item 14's `edhaSovTargets` ally/enemy split** both closed. **3 rows off the checklist, 2 new
> defects found, 1 new ruling (R-77), final id / effect / flag diffs all EMPTY.** No `⛔ STOP`, **no
> pack rebuild owed**. Open queue **27 🤖 → 26 🤖** (three retired, two new defect rows added); the
> file now reads **27** because **item 10 batch 1 merged behind this run** and added its own row (see
> step 0). ⚑ unchanged at **21**.

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 36` delta** (top of the file) — the
three-site evidence table for item 12, the two new defects, and §5's statement of the world state.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 36"** — **four of these change what you
do in your first ten minutes**: a **`userId`-recording hook observer** is how you test a two-GM row
(and its **delete hooks take three arguments**, which silently loses the user); **`activeGM` = `Bench`
is structural**, not luck (Foundry sorts primary GM by user id and `Bench`'s id sorts first — stop
treating it as a coin flip); **joining `PlayerBench` by CLICKING the button does not work at this pane
scale** — set the `select` and `.click()` the button from JS, and expect the next call to fail with
*"Inspected target navigated or closed"*, which is the join succeeding; and **`tabs_create` gives a
BLANK tab that `resize_window` refuses** — navigate, resize, navigate. Also:
`CONFIG.Canvas.polygonBackends.sight.testCollision` is how you find a wall-free cell instead of
guessing, and **`edha.drawMana()` takes the ITEM, not the actor** (bare, it is a silent no-op).
**Run 35's and 34's lessons still apply in full** — above all **a silence proves nothing without a
positive control in the same budget window**, `applyDamage` rather than an HP `update()`, the
three-line inactive-combat fixture, and the Token HUD bar.

**→ `EDHA_RULINGS.md`** — **one new ruling, R-77**: `edhaDeriveInvestiture`'s persist branch writes
`system.resources.inv.max.override` **outside** the item-12 primary-GM gate (it gates on
`actor.isOwner` + a per-client Set), and run 36 measured it firing from Ben's **non-primary**
`Gamemaster` client on one actor and from the **primary** `Bench` client on another. Recommended
default is a hybrid gate; the re-test is a 🤖 row. **R-4 and R-69 are both ready to move to §K**
(the PM does that). R-70, R-71, R-74, R-75, R-76 carry their recommended defaults; **R-43 is still
applied and still changes live dice math**; **R-56 still blocks** the "adversary tokens see like PCs"
row.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ 0. THE RE-TEST BLOCK — what run 36 left, and it is SMALL for once

**Ten runs running, this block has been the densest thing available. It is thin now — do not spend
the whole run looking for more of it.**

1. **Item 10 batch 1's row — `A SIDELESS creature is caught by NOTHING`** (63 disposition defaults
   flipped to fail CLOSED; ENGINE-ONLY, F5). It merged as **PR #200** *behind* run 36 and was **not**
   in the engine run 36 drove (`95c98d65…`), so it is the newest thing on the engine and the first
   thing to hash-verify. **If the served hash still starts `95c98d65`, item 10 is NOT live** and its
   row is **NOT-DEPLOYED**, not failing — never fail a fix's row against an engine that predates it.
   The row carries its own probe recipe (a Secret-disposition token, or an actor with no token on the
   scene) and names three sites to drive with a matched normal-hostile control.
2. **The two defect rows run 36 filed**, both under `# BENCH — Engine-wide & cross-tree`. Neither is
   drivable as a *pass* yet — they are open defects waiting on a fix — but **re-read them before
   queueing anything**, because the first has a one-paragraph re-test recipe ready for the moment
   R-77 is answered and the fix lands.

## Where the 27 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **`BENCH — Engine-wide & cross-tree`** | 3 | ⭐ **Item 10 batch 1's row is here — it is your step 0** (`A SIDELESS creature is caught by NOTHING`), plus the two **new defect rows** from run 36 (Investiture-max persist outside the gate; `Bench — White`'s max HP flipping with the prepare path). The two defect rows wait on a fix, not on a table. |
| **Character-creation wizard v2** | 6 | ⛔ **Still never driven, TWELVE runs running.** Every blocker in front of it is closed and the re-test block is finally thin. **This is the block to take FIRST this run.** Re-read each row against DEPLOY STATE (2026-07-26 — every wizard row predates it) before staging; several likely retire on one read. |
| **Bestiary sections** (W29 ×3, Goldenport, Vorsk, Adversary ability wiring) | 6 | Untouched all marathon; each needs its own fresh pack import + staging. The import recipe is proven (runs 33–34 imported three between them). |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | pass 5.2 / 5.3 rows. Includes the ones needing **zero GM clients** — still blocked on Ben. |
| **Bench-results fixes** | 1 | The vision row, blocked on **R-56**, not on a table. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — a bulk sync rewrites Ben's campaign actors (outside hard rule 4). Do not re-attempt un-authorised. |
| **Items-dump tranche** | 2 | **CAE burns** (needs a combat — the three-line `active:false` recipe) and **Kindle's token-light half**. ℹ️ A bestiary Kindle row was retired at run 18 with a live `dim 20, bright 10, animation flame` reading; check whether that already answers this one before staging. |

**Item 12's three sites, item 13's spend AND heal halves, item 14's picker AND `edhaSovTargets`
halves, R-4's eight faces, and the `# Bench-results fixes` single-target picker row are all CLOSED —
do not re-queue any of them.**

## Run 14 — the plan, in order

### 1. The wizard block — 6 🤖, never driven in TWELVE runs
**Take this after step 0's single row; the rest of the re-test block is finally too thin to eat a run.** Start with a DEPLOY-STATE
re-read of all six rows — the cheapest possible outcome is several retiring without a single cast.
The **wizard-as-a-player walkthrough** pairs with a player client (`PlayerBench`) and is large: only
start it if you can finish it, and **open the player window EARLY** — run 36's JS-driven join recipe
makes that cheap now (see the runbook lessons).

### 2. AoE burst auto-target — deferred FIVE times, one cast
Place any burst (Flame Surge): assert the caught tokens end up actually in `game.user.targets`. This
retarget was silently no-opping on v13. Console-runnable, no player client. **Run 36 deferred it
again** — it is now the single cheapest unclaimed row in the file.

### 3. The items-dump pair (CAE burns + Kindle's token-light half)
Both console-runnable. CAE burns needs a combat — run 34's three-line `active:false` +
`ui.combat.initialize({combat})` recipe. **Never activate a bench combat.**

### 4. A bestiary section, if the budget survives
Six rows sitting untouched across the whole marathon, and the fresh-import recipe is now routine.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. Ben's `Gamemaster`
  has been connected through runs 24–36 (measured again: `["Bench","Gamemaster"]`). Record BLOCKED
  with the blocker named — never re-file as ⚑. **This needs Ben to disconnect for one window.**
- **The two `# Adversary pack sync` rows need BEN, not a bench run.**
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table.
- ⚠️ **Ben's world holds an ACTIVE, STARTED, ZERO-COMBATANT combat** (`BerbNeuXp4iKduef`, round 1) —
  confirmed again this run. Not the bench's; leave it alone. It means **`game.combat` is never
  null**, which silently selects the round-tag branch of `edhaOrderPromptGate` /
  `edhaShatterPromptGate` and makes their 30-second wall-clock branch unreachable. If a row's premise
  is "with no combat in the tracker", that premise is already false. ℹ️ It has **zero combatants**,
  so `edhaInActiveCombat(actor)` is still null for everyone.
- **`game.combat` is the client's VIEWED combat** — an `active:false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a
  bench combat.**
- **Observer/rAF-dependent state is stale on this bench** — observers, `canvas.animatePan`, animated
  token moves, the vision polygon. Use `canvas.pan()`, `teleport: true`, and
  `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and
  declare it. Run 33's recipe drives `edhaPickPoint` in three lines.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The
  Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans (checked again run 36).
  Leave all four.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs
  included.
- **Creating or deleting a bench token moves `Guardian Stance (+1 Deflect)` in BOTH directions** —
  runs 34/35 saw it. ℹ️ **Run 36 created and deleted a token and the effect diff came back EMPTY**, so
  this is a hazard to snapshot against, not a certainty. Snapshot
  `actor.effects.map(e => e.toObject())` **before** creating any token and restore with `keepId`.

## Harness traps — each has already produced or nearly produced a false result

- **A SILENCE result proves nothing without a positive control in the same budget window.** (34, 36.)
- **A two-GM row needs a `userId`-recording hook observer** — and the **delete** hooks take three
  arguments, so an update-shaped callback loses the user. (Run 36.)
- **`resize_window` refuses a blank tab; a scaled pane makes coordinate clicks miss the join button.**
  Navigate → resize → navigate; join from JS. (Run 36.)
- **`edha.drawMana()` takes the ITEM.** Bare = silent no-op. (Run 36.)
- **A die-step leaves a flag AND a status** (`Exalted` / `Diminished`) — clear both. (Run 36.)
- **A derived stat can differ by which prepare ran** — force `prepareData()` before calling a moved
  number a restore failure. (Run 36.)
- **The 0×0 canvas needs `resize_window` AND A FULL RELOAD, on the first tab too.** (Run 35.)
- **An H3 ledger staged by hand needs its MARKER STATUS** or `edhaOwnerList` reads it empty. (35.)
- **A staged talent's own `activation.consume` opens a Consume Resource dialog that never settles**
  and looks exactly like "the talent did nothing". Clear it, or click
  `button[data-action="continue"]` inside `div.app.window-app`. (Runs 35, 36.)
- **Walls silently shrink an area heal/pulse** — and on the Playtest Map `Bench — White` can see
  **none** of its neighbours. Use `testCollision` to pick the cell. (Runs 35, 36.)
- **A raw HP `update()` fires no damage-cadence rule** — use `actor.applyDamage([{amount, type}])`.
  (Run 34.)
- **`combat.nextTurn()` can leave `turn === null`**; set `turn` explicitly and read `combat.turns`.
  (Run 34.)
- **A light's `dim`/`bright` are in FEET.** (Run 34.)
- **`actor.effects` omits item-transferred AEs** — print it beside `allApplicableEffects()`. (33, 34.)
- **The engine's functions are MODULE-SCOPED** — re-implement a helper inline; attach observing hooks
  before the trigger. (Run 33.)
- **A talent that drops dangerous terrain damages your own caster** — read the per-target
  *difference* and delete the Region between casts. (Run 33.)
- **`animate: false` can commit a PARTIAL token position** — use `{animate:false, teleport:true}` and
  **read the destination back**. (Run 32.)
- **The setup script's IIFE is fire-and-forget and can exceed 30 s** — judge idempotency from
  `game.actors.size` / `game.items.size` / `scene.tokens.size`, not from the log. (Runs 32–35.)
- **A dotted flag delete leaves the PARENT object behind as `{}`** — re-diff after restoring. (31–34.)
- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS.** (31, 33.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire in one call, read in the next — and
  late in a run, stop writing polling loops at all. (Runs 26, 28–30, 33, 35.)
- **`item.use()` never settles while a dialog is open** — run 32's `__cast()` loop handles both
  shapes; run 34 added a `__rollSkill()` twin.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent
  no-op that does **not** stop the talent.
- **A skill-test talent will simply MISS sometimes** — check the target's defense first. (Run 34.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original
  `<script>` entry. Run 36's was `95c98d65…` at `main`'s #198 merge.

## Standing lessons

- **Take the re-test block FIRST, every run** — but run 36 emptied it, so **run 14 opens on the
  wizard block**, which has now been skipped twelve times.
- **Stage each row off the PREVIOUS row's residue.** Run 36 got three sites out of one observer.
- **Verify a row's named SUBJECT exists before staging anything.**
- **Once a matched control has proven a root cause, WRITE THE RESIDUAL SYMPTOM DOWN AND MOVE ON.**
- **Refuse to inherit the previous run's blocker — re-derive it.** Run 36 re-derived run 35's wall
  problem into a `testCollision` sweep and the row fell in one cast.
- **Open the player-client window EARLY** if the run needs one — it is cheap now.
- **Read the cards you did not come for.** Runs 31–36 each found something that way; run 36 found
  both of its defects in log lines it was not looking at.
- **Pick the flow by its EVENT, not by its talent**, and read the row's rule config out of
  `data/authored/*.json` (or the pack) before staging.
- **Only claim what your own logs support, and label inferences as inferences.** Run 36 recorded the
  delete-race half as one-sided by construction rather than claiming Ben's console was clean.
