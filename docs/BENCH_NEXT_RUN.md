# Next bench session

> **Weekend marathon, run 12 (bench run 35, 2026-09-06) is done, and it was the last run of that
> session.** **R-4's final three faces PASSED** — the negative control's window half, the
> `costs:`-rule half of the real-spend row, and the Investiture/Edict face — each with a matched
> control in the *same round*, so **all eight R-4 faces are now green and R-4 may move to §K** (the
> PM does that). **Item 13's spend stamp survives the `edhaResourceWrite` migration** (the H10
> Investiture drain still fires the Order Edict watch) and **its bookkeeping declaration holds**
> (Draw Mana's recovery clamped at max and taxed nothing). **The single-target picker was driven end
> to end and retired TWO rows at once** — item 14's half (a) and the `# Bench-results fixes` row
> deferred three times. **5 rows off the checklist, 2 more narrowed, 0 engine defects, 1 new ruling
> (R-76).** Open queue **31 🤖 → 26 🤖**; ⚑ unchanged at **21**. No `⛔ STOP`, **no pack rebuild
> owed**, world restored to its start snapshot with **one stated artifact** (see below).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 35` delta at the top** — the three-row
R-4 evidence table, the two corrections it makes to bench rows whose named subject does not exist,
and §5's exact statement of the one restore artifact.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 35"** — **three of these will change
what you do in your first ten minutes**: the 0×0 canvas bites the FIRST tab too and needs
`resize_window` **plus a full reload** (do it as your opening act); **`game.users.activeGM` is not
reliably Ben** — this run drew `Bench`, which is why every watch ran locally, and drawing the other
straw changes how you read a silence; and **hand-staging an H3 ledger does nothing without the
marker STATUS** (`toggleStatusEffect("edict")`, or `edhaOwnerList` reads the ledger empty and your
row passes for the wrong reason). Also: verify a row's named SUBJECT exists before staging anything —
two runs running have found one that does not. **Run 34's lessons still apply in full** — above all
**a silence proves nothing without a positive control in the same budget window**, `applyDamage`
rather than an HP `update()`, the three-line inactive-combat fixture, and the Token HUD bar.

**→ `EDHA_RULINGS.md`** — **one new ruling, R-76**: the engine's single spend-stamped resource write
(H10's Investiture drain, `register-skills.js` ~18139) has **no consumer in shipped data** — the
game's only `edha-focus` `resource:"inv"` rule is Reaper's Harvest and it is a **gain**. Exactly
R-74's shape one layer up; both are authored-data calls for Ben, not bench work. **R-4 is now fully
measured and is ready for §K.** R-69 is still ready to move to §K; R-70, R-71, R-74, R-75 carry their
recommended defaults; **R-43 is still applied and still changes live dice math**; **R-56 still
blocks** the "adversary tokens see like PCs" row.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED
with the blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ 0. THE RE-TEST BLOCK — item 12 first, then the two rows run 35 narrowed

**Take these first. Nine runs running, and it has been the densest thing available every time.**

1. **Item 12's row — the hand-derived primary-GM gates → `edhaDefBuffGmGate` (ENGINE).** Its PR was
   in flight in a parallel worktree while run 35 drove, so it is the newest thing on the engine and
   the first thing to hash-verify. **⚠️ Read run 35's measurement before staging it:**
   `game.users.activeGM` resolved to **`Bench`**, not to Ben's `Gamemaster`, with both connected — so
   the gate passed on the bench client and every watch ran locally. Whichever way it resolves for
   you, **record which client was the primary GM in the row**, because a one-sided reading of this
   gate proves nothing. The row's own text is under `# BENCH — Engine-wide & cross-tree`.
2. **The heal half of item 13's bookkeeping row.** Narrowed on the checklist to one clause: heal a
   **NAMED, observed** target sitting at `max - 1` and confirm it lands at max rather than
   overshooting. ⚠️ Run 35 lost this to the Playtest Map's own **walls** — White's Draw Mana pulse
   reported *"healed 1 of 5 ally(ies) … skipped 4 behind a wall"* and both instrumented allies were
   among the skipped four. **Check the card's visibility count against the tokens you instrumented**,
   or stage on a wall-free line. The Draw Mana half and the no-tax half already PASSED.
3. **`edhaSovTargets`' ally/enemy split — item 14's remaining half.** With a Sovereignty actor,
   target **one ally and one enemy at once** and use a talent that reads a side (an Edict /
   adv-attack grant): the ally-side effect must land on the ALLY and the enemy-side read must take
   the ENEMY — by token disposition, not click order, and the caster in neither list. Half (a) (the
   single-target picker) is **done and retired**; do not re-drive it.

## Where the 26 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **`BENCH — Engine-wide & cross-tree`** | 2 | ⭐ **THE RE-TEST BLOCK** — item 13's heal clause + item 14's `edhaSovTargets` half (plus item 12's row once its PR lands). |
| **Character-creation wizard v2** | 6 | ⛔ **Still never driven, ELEVEN runs running, and there is no excuse left.** Every blocker in front of it is closed. **Re-read each row against DEPLOY STATE (2026-07-26 — every wizard row predates it) before staging; several likely retire on one read.** This is the block to take after the re-test rows. |
| **Bestiary sections** (W29 ×3, Goldenport, Vorsk, Adversary ability wiring) | 6 | Untouched all marathon; each needs its own fresh pack import + staging. The import recipe is proven (runs 33–34 imported three between them). |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | pass 5.2 / 5.3 rows. Includes the ones needing **zero GM clients** — still blocked on Ben. |
| **Bench-results fixes** | 2 | The vision row is blocked on **R-56**, not on a table. **AoE burst auto-target** is genuinely drivable and cheap and has now been deferred FOUR times. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — a bulk sync rewrites Ben's campaign actors (outside hard rule 4). Do not re-attempt un-authorised. |
| **Items-dump tranche** | 2 | **CAE burns** (needs a combat — the three-line `active:false` recipe) and **Kindle's token-light half**. ℹ️ A bestiary Kindle row was retired at run 18 with a live `dim 20, bright 10, animation flame` reading; check whether that already answers this one before staging. |

**R-4's three rows, item 13's spend row, item 14's picker half, and the `# Bench-results fixes`
single-target picker row are all CLOSED — do not re-queue any of them.**

## Run 13 — the plan, in order

### 0. The re-test block above (item 12, the heal clause, `edhaSovTargets`)
The heal clause and the sov split are both small. Item 12's row is the one that needs care, because
its whole subject is *which client runs the write*.

### 1. The wizard block — 6 🤖, never driven in ELEVEN runs
Run 32 cleared the other July sections to their real blockers; run 33 removed the culture
uncertainty; run 34 proved the cultures load clean and a culture prereq discriminates; run 35 found
nothing new in front of it. **Start with a DEPLOY-STATE re-read of all six rows** — the cheapest
possible outcome is several retiring without a single cast. The **wizard-as-a-player walkthrough**
pairs with a player client (`PlayerBench`, §6 of the runbook) and is large: only start it if you can
finish it, and open the player window EARLY if you are going to.

### 2. AoE burst auto-target — deferred four times, one cast
Place any burst (Flame Surge): assert the caught tokens end up actually in `game.user.targets`. This
retarget was silently no-opping on v13. Console-runnable, no player client.

### 3. The items-dump pair (CAE burns + Kindle's token-light half)
Both console-runnable. CAE burns needs a combat — run 34's three-line `active:false` +
`ui.combat.initialize({combat})` recipe. **Never activate a bench combat.**

### 4. A bestiary section, if the budget survives
Six rows sitting untouched across the whole marathon, and the fresh-import recipe is now routine.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. Ben's `Gamemaster`
  has been connected through runs 24–35 (measured again: `["Bench","Gamemaster"]`). Record BLOCKED
  with the blocker named — never re-file as ⚑. **This needs Ben to disconnect for one window.**
- **The two `# Adversary pack sync` rows need BEN, not a bench run.**
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table.
- ⚠️ **Ben's world holds an ACTIVE, STARTED, ZERO-COMBATANT combat** (`BerbNeuXp4iKduef`, round 1) —
  confirmed again this run. Not the bench's; leave it alone. It means **`game.combat` is never
  null**, which silently selects the round-tag branch of `edhaOrderPromptGate` /
  `edhaShatterPromptGate` and makes their 30-second wall-clock branch unreachable. If a row's premise
  is "with no combat in the tracker", that premise is already false. ℹ️ It has **zero combatants**,
  so `edhaInActiveCombat(actor)` is still null for everyone — which is what let run 35 drive the
  out-of-combat window row honestly.
- **`game.combat` is the client's VIEWED combat** — an `active:false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a
  bench combat.**
- **Observer/rAF-dependent state is stale on this bench** — observers, `canvas.animatePan`, animated
  token moves, the vision polygon. Use `canvas.pan()`, `teleport: true`, and
  `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and
  declare it. Run 33's recipe drives `edhaPickPoint` in three lines.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The
  Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans remain (`orphans: 0
  repaired, 0 replaced` again this run). Leave all four.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs
  included.
- **Creating or deleting a bench token moves `Guardian Stance (+1 Deflect)` in BOTH directions** —
  run 34 saw one PC lose it and another gain it; run 35 saw `Bench — Order` and `Bench — White` both
  affected. Snapshot `actor.effects.map(e => e.toObject())` **before** creating any token and restore
  with `keepId`. ⚠️ A `keepId` re-create still writes a fresh `_stats` block, so a whole-object diff
  will show that one field differing — **say so rather than claiming an empty diff**, which is what
  run 35 did.

## Harness traps — each has already produced or nearly produced a false result

- **A SILENCE result proves nothing without a positive control in the same budget window.** (Run 34.)
- **The 0×0 canvas needs `resize_window` AND A FULL RELOAD, on the first tab too.** `scene.view()`
  does nothing while `canvas.ready` is false. (Run 35.)
- **`game.users.activeGM` may be YOU** — check it, and record which client held it. (Run 35.)
- **An H3 ledger staged by hand needs its MARKER STATUS** or `edhaOwnerList` reads it empty. (Run 35.)
- **A staged talent's own `activation.consume` opens a Consume Resource dialog that never settles**
  and looks exactly like "the talent did nothing". Clear it, or click
  `button[data-action="continue"]` inside `div.app.window-app`. (Run 35.)
- **Walls silently shrink an area heal/pulse** — read the card's "skipped N behind a wall" count
  against the tokens you instrumented. (Run 35.)
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
  late in a run, stop writing polling loops at all. Run 35 lost a call to a 12-iteration button poll
  that had already succeeded. (Runs 26, 28–30, 33, 35.)
- **`item.use()` never settles while a dialog is open** — run 32's `__cast()` loop handles both
  shapes; run 34 added a `__rollSkill()` twin.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent
  no-op that does **not** stop the talent.
- **A skill-test talent will simply MISS sometimes** — check the target's defense first. (Run 34.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original
  `<script>` entry. Run 35's was `4d882ea0…` at `main`'s #195 merge.

## Standing lessons

- **Take the re-test block FIRST, every run.** Nine runs running.
- **Stage each row off the PREVIOUS row's residue.** Run 35 got six rows out of one combat.
- **Verify a row's named SUBJECT exists before staging anything** — two runs running have found a row
  whose subject is not in shipped data (R-74, R-76). A three-line pack sweep settles it.
- **A `costs:` rule that costs TWO resources proves two watch families in one click.**
- **Once a matched control has proven a root cause, WRITE THE RESIDUAL SYMPTOM DOWN AND MOVE ON.**
- **Refuse to inherit the previous run's blocker — re-derive it.**
- **Open the player-client window EARLY** if the run needs one.
- **Read the cards you did not come for.** Runs 31–35 each found something that way.
- **Pick the flow by its EVENT, not by its talent**, and read the row's rule config out of
  `data/authored/*.json` (or the pack) before staging.
- **A row's own break/staging recipe can be wrong.** Run 34's culture row asked for a picker that does
  not exist; run 35's item-13 row named a talent rule that does not exist. Verify against the source.
- **Only claim what your own logs support, and label inferences as inferences.** Run 35 recorded the
  heal clause as PARTIAL rather than inferring which ally the pulse had healed.
