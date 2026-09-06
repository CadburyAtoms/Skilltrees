# Next bench session

> **Weekend marathon, run 11 (bench run 34, 2026-09-06) is done.** **Five of R-4's eight rows retired on
> evidence**, each measured in BOTH directions with a positive control in the same round — the per-round
> ledger, the timed-status expiry, the out-of-combat focus watch, the two-combats row, and "a GM focus
> edit is NOT a spend" (typed **and** through the real Token HUD bar). **Both fix-pass-5 veil rows retired
> in full**: the Stalker's `Veil` marker **auto-toggled for the first time ever**, and run 33's
> unexplained second symptom is **closed** as exactly the hypothesis FIX PASS 5 §2 ranked first — a
> succeeded sweep is a no-op. **2bS-11 retires in full.** The **culture row retires in full**, including
> the `init`-ordering claim no headless test can make. **8 rows off the checklist, 0 engine defects,
> 2 new rulings (R-74, R-75).** Open queue **33 🤖 → 28 🤖**; ⚑ unchanged at **21**. No `⛔ STOP`, **no
> pack rebuild owed**, world restored to its start snapshot **exactly** (field-level actor id-diff empty
> across all 74 actors, whole effect objects included; tokens/regions/drawings/templates/walls/lights/
> combats/scenes all zero delta).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 34` delta at the top** — the five-row R-4
evidence table, the veil sequence, and the culture measurement with the correction to how the prereq
dialog actually works.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 34"** — **two of these decide whether
your run is honest**: a **silence result is worth nothing without a positive control in the same budget
window** (three R-4 rows ride `once: round-per-target` and would have "passed" for the wrong reason),
and **the cheapest `oncePerRound` subject in the game is an adversary `hp-below` cue driven with
`actor.applyDamage` — a raw HP `update()` fires nothing.** Also: a bench combat is a three-line fixture
and `ui.combat.initialize` steers `game.combat`; the **Token HUD bar is drivable** and is a genuinely
different surface from the sheet; a light's `dim`/`bright` are in **feet**. **Run 33's lessons still
apply** — the bench-created scene recipe, `actor.effects` vs `allApplicableEffects()`, module-scoped
engine functions, and "fire, return, read" instead of sampling loops.

**→ `EDHA_RULINGS.md`** — **two new rulings, both from run 34**: **R-74** (no adversary ability in the
game pays an engine-driven cost — `data/adversaries.json` has zero `"costs"` keys, so 28b's adversary
row has no subject; a REBUILD decision, not a bench one) and **R-75** (the `edha-test-react` / H26
reaction family is not combat-gated — `Shared Conviction` fired for a watcher in no combat at all; not
a 28a regression, recommended default is to leave it ungated and document it). **R-4 gained its
five-row confirmation but STAYS OPEN** — three rows remain. R-69 is still ready to move to §K; R-70,
R-71 still carry their recommended defaults; **R-43 is still applied and still changes live dice math**;
**R-56 still blocks** the "adversary tokens see like PCs" row.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ RE-TEST FIRST — three narrowed R-4 rows, and they are the last thing standing between R-4 and §K

**Take these first. Eight runs running, the re-test block has measured about twice as dense as scattered
rows.** All three are already narrowed on the checklist under `## Out-of-combat scope — ruling R-4, both
halves`; each says exactly what passed and exactly what is left, so none needs re-deriving.

1. **NEGATIVE CONTROL, part (c) only** — a movement or designate **window** armed with no combat running
   is still open when it is consumed (`edhaRoundWindowValid`: a window armed out of combat carries no
   `combatId`). Parts (a) and (b) passed at run 34. **Silence here is a 28a regression**, not the fix
   working — this is the half the whole gate was pinned against.
2. **A REAL spend still taxes — the `costs:`-RULE half only.** The `activation.consume` half passed
   twice. What is left needs a `costs:`-carrying rule on the **spender**, and all six shipped ones are
   PC talents (`Beacon of Stability`, `Pillar of Order`, `Shared Conviction`, `Voice of Authority`,
   `Puppeteer`, `Pack Sense`), so **grant one to the enemy** and drive it.
3. **The Investiture / Edict face.** A `Law`/`Decree` Edict forbidding "activate Investiture" must still
   prompt on a wired Investiture cost and must **not** prompt when the GM edits the number by hand.
   Stage the ledger by hand and declare it: `flags.edha-content.lists.edicts`, entries
   `{id, uuid, name, proh:{kind:"invest", text}}` on `Bench — Order`. (The adversary-bespoke-ability
   half of this row has **no subject in shipped data** — that is **R-74**, a decision for Ben, not a
   test. Do not burn calls hunting for one.)

**If all three pass, SAY SO EXPLICITLY in your delta: R-4 may then move to §K** (the PM does that).

## Where the 28 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **`BENCH — Engine-wide & cross-tree`** | 3 | ⭐ **THE RE-TEST BLOCK — take it first.** Narrowed by run 34; see above. |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | pass 5.2 / 5.3 rows. Includes the ones that need **zero GM clients** — still blocked on Ben. |
| **Character-creation wizard v2** | 6 | July deploy-state language. **Still never driven, TEN runs running.** Run 33 removed the culture-defect excuse and run 34 confirmed the cultures are clean, so there is nothing left in front of it. **Re-read against DEPLOY STATE first — several likely retire on one read.** |
| **Bestiary sections** (W29 ×3, Goldenport, Vorsk, Adversary ability wiring) | 6 | Untouched all marathon; each needs its own adversary import + staging. Cheaper than it looks now that the fresh-pack-import recipe is proven (run 34 imported two). |
| **Bench-results fixes** | 3 | The vision row is blocked on **R-56**, not on a table. The other two — **single-target picker** (Withering Ray with 2+ targets) and **AoE burst auto-target** — are genuinely drivable and cheap, and have now been deferred THREE times. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — a bulk sync rewrites Ben's campaign actors (outside hard rule 4). Do not re-attempt un-authorised. |
| **Items-dump tranche** | 2 | **CAE burns** (needs a combat — the three-line `active: false` recipe is in run 34's lessons) and **Kindle's token-light half**. |

**Item 29's Fault Line row, R-65, Job 6b, both R-64 halves, the Stalker veil row, 2bS-11 and the culture
row are all CLOSED — do not re-queue any of them.**

## Run 12 — the plan, in order

### 0. The three narrowed R-4 rows (above)
They share one fixture — `Bench — Black` + a granted-talent enemy + one bench combat — which run 34
built in three calls. Copy it from the delta rather than re-deriving it.

### 1. The two genuinely-drivable `# Bench-results fixes` rows — deferred THREE times now
Both single-actor, single-cast, no player client:
- **Single-target picker resolves** — target 2+ tokens, use **Withering Ray** (Black): the picker card
  appears, **nothing is spent**, clicking a name narrows to that one target, the card marks ✓ and the
  talent rolls once. ⚠️ The picker renders in the engine's **AppV1** window (`div.app.window-app`, no
  `<dialog>`) — sample both DOM shapes.
- **AoE burst auto-target** — place any burst (e.g. Flame Surge) and assert the caught tokens end up
  actually **targeted** (`game.user.targets`); this retarget was silently no-opping on v13.

### 2. The wizard block — 6 🤖, never driven in TEN runs, and every excuse is now gone
Run 32 cleared the other July sections to their real blockers; run 33 removed the culture uncertainty;
run 34 proved the cultures load clean and a culture prereq discriminates. Re-read each row against
**DEPLOY STATE** (2026-07-26 — every wizard row predates it) and the live pack **before** staging;
several are likely already answered by a later deploy and retire at the cost of one read. The
**wizard-as-a-player walkthrough** pairs with a player client — it is large, so only start it if you can
finish it.

### 3. The items-dump pair (CAE burns + Kindle's token-light half)
Both console-runnable. CAE burns needs a combat — use run 34's three-line `active: false` +
`ui.combat.initialize({combat})` recipe. **Never activate a bench combat.**

### 4. R-63's same-side regression — 1–2 more shapes
One shape is proven (the `enemies-range` disposition filter skipped three adjacent friendlies) and run 32
handed over a second nearly free. Pick from **Reroll Reaction** against a marked foe (run 34 staged
exactly this fixture for `Shatter Focus` — `flags.edha-content.markedBy.<status>` + the status, then have
the foe roll), or a **Fate snare** stepped on by an ally vs. an enemy. **Not the aura shape** unless you
have budget.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. Ben's `Gamemaster` has
  been connected through runs 24–34 (measured again this run: `["Bench","Gamemaster"]`). Record BLOCKED
  with the blocker named — never re-file as ⚑. **This needs Ben to disconnect `Gamemaster` for one
  window.**
- **The two `# Adversary pack sync` rows need BEN, not a bench run.**
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table.
- ⚠️ **Ben's world holds an ACTIVE, STARTED, ZERO-COMBATANT combat** (`BerbNeuXp4iKduef`, round 1). It is
  not the bench's — leave it alone — but **`game.combat` is therefore never null**, which silently
  selects the round-tag branch of `edhaOrderPromptGate` / `edhaShatterPromptGate` and makes their
  30-second wall-clock branch unreachable. If a row's premise is "with no combat in the tracker", that
  premise is already false. Check `game.combats` at setup and say what you find.
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row, and steering it is how
  the two-combats row was driven. **Never activate a bench combat.**
- **Observer/rAF-dependent state is stale on this bench** — observers (run 22), `canvas.animatePan`
  (run 26), animated token moves (runs 29/32) and the vision polygon (run 30). Use `canvas.pan()`,
  `teleport: true`, and `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and
  declare it. Run 33's recipe drives `edhaPickPoint` in three lines.
- **Four ORPHAN tokens on the Playtest Map are NOT the bench's** — `The Forgemaster`, `The Demolisher`,
  `PC Tester`, `Cragdrake Whelp Pack (1)`. Zero bench orphans remain (re-measured run 33). Leave all four.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs
  included.
- **Bench PCs with no token can carry a STALE `Guardian Stance (+1 Deflect)`** — and the reverse is also
  true: giving a bench PC a token can make it correctly **gain** one from a neighbour's aura. Run 34 saw
  both in one session (`Bench — Chaos` lost its, `Bench — Black` gained one). Snapshot
  `actor.effects.map(e => e.toObject())` **before** creating any token, expect movement in both
  directions, restore with `keepId`, and report it as engine-correct rather than as drift.

## Harness traps — each has already produced or nearly produced a false result

- **A SILENCE result proves nothing without a positive control in the same budget window.** (Run 34 —
  read the lesson before writing any PASS whose evidence is "nothing happened".)
- **A raw HP `update()` fires no damage-cadence rule** — cue cards, hp-threshold reactions and the
  on-defeat sweep all ride the `applyDamage` wrapper's post-pass. Use `actor.applyDamage([{amount, type}])`.
  (Run 34.)
- **`combat.nextTurn()` can leave `turn === null`**, and cosmere initiative is not the turn order you
  expect (both combatants read 502). Set `turn` explicitly and read `combat.turns`. (Run 34.)
- **A light's `dim`/`bright` are in FEET** — on a small bench scene one light lights the whole map.
  (Run 34.)
- **`actor.effects` omits item-transferred AEs** — every adversary marker in `data/adversary-effects.json`
  is `transfer: true`. Print `actor.effects` and `[...actor.allApplicableEffects()]` side by side, keyed
  by `_id`. (Runs 33, 34.)
- **The engine's functions are MODULE-SCOPED** — re-implement a helper inline to check what it would
  return, and attach observing hooks before the trigger. (Run 33.)
- **A talent that drops dangerous terrain damages your own caster** — read the per-target *difference*
  and delete the Region between casts. (Run 33.)
- **`animate: false` can commit a PARTIAL token position** — use `{animate:false, teleport:true}` and
  **read the destination back**. (Run 32.)
- **The setup script's IIFE is fire-and-forget and can exceed 30 s** — judge idempotency from
  `game.actors.size` / `game.items.size` / `scene.tokens.size`, not from the log. (Runs 32–34.)
- **A dotted flag delete leaves the PARENT object behind as `{}`** — re-diff after restoring. (Runs 31–34.)
- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS.** Delete
  Regions only, then re-read. (Runs 31, 33.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire in one call, read in the next — and
  late in a run, stop writing sampling loops at all. (Runs 26, 28–30, 33.)
- **`item.use()` never settles while a dialog is open** — run 32's `__cast()` polling loop handles both
  shapes; run 34 added a `__rollSkill()` twin for `actor.rollSkill(id)`.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent no-op
  that does **not** stop the talent.
- **A skill-test talent will simply MISS sometimes** — run 34 missed Extract Thought four times against
  Spiritual 14 before switching to a Spiritual-10 target and landing it first try. **Check the target's
  defense before blaming the talent.**
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original
  `<script>` entry.

## Standing lessons

- **Take the re-test block FIRST, every run.** Eight runs running.
- **Stage each row off the PREVIOUS row's residue.** Run 34 got ~6 rows out of two fixtures.
- **Once a matched control has proven a root cause, WRITE THE RESIDUAL SYMPTOM DOWN AND MOVE ON.** Run 33
  chased an unnamed intermittency for ~20 calls; run 34 closed it in three by re-staging cleanly.
- **Refuse to inherit the previous run's blocker — re-derive it.**
- **Open the player-client window EARLY** if the run needs one.
- **Read the cards you did not come for.** Runs 31–34 each found something that way; run 34's was R-75.
- **Pick the flow by its EVENT, not by its talent**, and read the row's rule config out of
  `data/authored/*.json` before staging.
- **A row's own break/staging recipe can be wrong.** Run 34's culture row asked for a picker that does
  not exist. Verify against the source before concluding anything.
- **Only claim what your own logs support, and label inferences as inferences.**
