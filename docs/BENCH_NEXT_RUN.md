# Next bench session

> **Weekend marathon, run 10 (bench run 33, 2026-09-06) is done.** Item 29's **`Fault Line` re-test PASSES IN
> FULL** on a hash-verified deploy — the ally in the line is counted on the burst card, loses the HP, gets its
> own save line, and a **failed** save knocks it **Prone** exactly as a foe's does, while the caster and the
> ally outside the line stay untouched on both cards. The **culture-item severity question is SETTLED**: the
> slug is **dropped**, but the wizard is **not** broken and the fix is **engine-only**. And the **seven-run
> dark-veil blocker is GONE** — a bench-created dark scene works — which immediately exposed the real
> blocker: **the Stalker's `Veil` marker is item-transferred and `edhaDarkVeilSweep` only reads
> `actor.effects`**, so it can never be found. **1 row left the checklist, 1 new engine defect was
> root-caused with a matched control, 1 severity question closed, 1 measured caveat added to R-6.** Open queue
> **29 🤖 → 28 🤖** on the checklist this run started from (counted as `grep -c '^- \[ \] 🤖'`); the file now reads
> **33** because **item 28a (PR #188) merged behind this run and added five re-test rows** — see step 1.
> ⚑ unchanged at **21**. No `⛔ STOP`, **no pack
> rebuild owed**, world restored to its start snapshot **exactly** (field-level actor id-diff empty across all
> 74 actors; tokens/regions/drawings/templates/walls/lights/combats/scenes all zero delta).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 33` delta at the top** — the Fault Line evidence
table, the culture-item measurement with its fix shape, and the dark-veil defect with its matched control.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 33"** — **three of these will save you a row
each**: a **bench-created scene is a three-call fixture** (copy the recipe, do not re-derive it);
**`actor.effects` does not contain item-transferred AEs**, which is what killed the veil; and **the engine's
functions are module-scoped, not globals**, so you cannot call or step into them from the console — attach
observing hooks *before* the first trigger. Also: driving `edhaPickPoint` is three lines, and
`javascript_tool` started timing out on 3-second loops late in the run (fire, return, read). **Runs 29–32's
lessons still apply** — `teleport: true` for staging moves, whole-object effect snapshots, dotted flag
deletes leaving `{}` parents behind, and the setup script's slow fire-and-forget IIFE.

**→ `EDHA_RULINGS.md`** — no new rulings, but **R-6 gained measured evidence and got WIDER**: Fault Line's
dangerous-terrain Region catches the **caster themselves** (and the ally), because the rectangle is laid with
one end on the caster's own square. R-5's "only the caster is spared" does not carry over to the Region.
**R-69 is still ready to move to §K**; R-70, R-71 still carry their recommended defaults; **R-43 is still
applied and still changes live dice math**; **R-56 still blocks** the "adversary tokens see like PCs" row.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ RE-TEST FIRST — and there IS one queued, five rows of it

**Item 28a (PR #188) merged behind bench run 33** and ships **ruling R-4's half (a)**: scene/turn-keyed
watches now gate on `edhaInActiveCombat(actor)` — an ACTIVE combat containing the owner — with `scope:
"self"` watches and the wall-clock prompt debounces deliberately **ungated**. It brings **five 🤖 rows** under
`# BENCH — Engine-wide & cross-tree` (`## Out-of-combat scope — R-4's half (a)`): a per-round ledger no
longer stuck on "round 0 for ever", "Restrained until the end of its next turn" actually expiring, an
adversary's own ability cost no longer taxed by enemy watches, a two-combats-at-once row, and **a NEGATIVE
CONTROL — a legitimately out-of-combat rule must still fire**. Run the negative control; it is the half that
can silently break real behaviour.
⚠️ **It is ENGINE-ONLY, so the served hash will NOT be `0051bde1…` any more: hash-verify from both sides
before driving, and record the rows NOT-DEPLOYED rather than FAILED if it has not landed.** Do **not** read a
focus-spend misclassification as a 28a failure — that is **28b**, a separate item still open, and R-4 stays
open in `EDHA_RULINGS.md` until both halves are in and benched.
The re-test block has measured roughly twice as dense as scattered rows for **seven runs running** — take it
first, every run. **And there is now a SECOND re-test block behind it: fix pass 5 landed the veil-lookup fix
and the culture registration, both ENGINE-ONLY — see step 0b.**

## ✅ The defect run 33 found — **FIXED 2026-09-06 by fix pass 5** (diagnosis kept; re-test is step 0b)

**`edhaDarkVeilSweep` could never find the Stalker's `Veil` marker.** The sweep resolves it as
`[...(a.effects ?? [])].find(e => e.name.startsWith(effName))` — **actor-level effects only**. The `Veil` AE
is defined on the `Veil` **trait item** with `transfer: true` (`data/adversary-effects.json`), so it lives in
`actor.allApplicableEffects()` with `parent: "Veil"` and **`actor.effects` is empty**. Measured on Ben's
world `Stalker` (`4OW7zLhJlMRhn1GG`) *and* on a fresh pack import (`l924euoyx3pYFk2T`). Everything else on
the path is fine — the trait carries `adversaryTalent: true` and `enabledEvents` lists the `edha-dark-veil`
handler — and with a hand-made **actor-level** copy of the identical AE the sweep fired correctly and posted
the "marker is ON (auto)" card. `data/adversaries.json` holds the **only** `edha-dark-veil` rule in the repo,
so the blast radius is the Stalker alone.
**FIXED (ENGINE-ONLY, F5):** the lookup now goes through `edhaAllEffects(actor)` →
`allApplicableEffects()`. NOT `appliedEffects` — that getter filters on `effect.active`, and the
marker is stored DISABLED, so it would have been just as blind. The marker was NOT moved to an
actor-level AE (that would have been a REBUILD; `data/adversary-effects.json` is untouched). ⚠️ A **second, unnamed** symptom rode with it; the FIX PASS 5 delta §2 root-causes it from source as a
probe artifact and ranks three hypotheses with the measurement that separates them — see step 0b.

## Where the 33 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **`BENCH — Engine-wide & cross-tree`** | 5 | ⭐ **NEW and it is the RE-TEST BLOCK — take it first.** Item 28a / PR #188 / ruling R-4 half (a). ENGINE-ONLY, so **hash-verify before driving**. |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | pass 5.2 / 5.3 rows. Includes the ones that need **zero GM clients** — still blocked on Ben. |
| **Character-creation wizard v2** | 6 | July deploy-state language. **Still never driven, NINE runs running.** Run 33 removed the excuse that the culture defect might bear on it: it does **not** (the expertise is literal data on the events). **Re-read against DEPLOY STATE first — several likely retire on one read.** |
| **Bestiary sections** (W29 ×3, Goldenport, Vorsk, Adversary ability wiring) | 6 | Untouched all marathon; each needs its own adversary import + staging. |
| **Bench-results fixes** | 3 | The vision row is blocked on **R-56**, not on a table. The other two — **single-target picker** (Withering Ray with 2+ targets) and **AoE burst auto-target** — are genuinely drivable and cheap, and have now been deferred twice. |
| **Adversary pack sync** | 2 | ⛔ **BLOCKED ON BEN** — all that is left is the bulk button, and a bulk sync rewrites Ben's campaign actors (outside hard rule 4). Do not re-attempt un-authorised. |
| **Items-dump tranche** | 2 | **CAE burns** (needs a combat — `active: false` + `ui.combat.initialize`) and **Kindle's token-light half**. |
| **Culture items** | 1 | ⭐ **Fixed (fix pass 5) — this is now a RE-TEST row, in step 0b.** The ten nations register at `init`; no rebuild. |
| **`BENCH — Green`** | 1 | ⭐ **UNBLOCKED (fix pass 5) — 2bS-11's veil half is runnable, in step 0b.** Stage it off the Stalker row as its positive control. |

**Item 29's Fault Line row, R-65, Job 6b and both R-64 halves are CLOSED — do not re-queue any of them.**

## Run 11 — the plan, in order

### 0. **Item 28a's five out-of-combat-scope rows** — the re-test block, first, always
See above. Hash-verify the deploy, then drive all five together — they share one staging idea (no combat, or
two combats) and the **negative control is the row that matters most**.

### 0b. **Fix pass 5's three rows** — the second re-test block, straight after step 0's five

**Landed 2026-09-06, ENGINE-ONLY (F5), no pack rebuild on either half** — so hash-verify the served
`register-skills.js` from both sides before driving, and record NOT-DEPLOYED rather than FAILED if it has not
landed. Read the `2026-09-06 DELTA — FIX PASS 5` block at the top of `EDHA_FOUNDRY_HANDOFF.md` first; it
carries the `actor.effects` verdict table and the ranked hypotheses for run 33's second symptom.

- **`Veil auto-toggle (Stalker)`** — the run-33 defect is fixed: the sweep now resolves its marker through
  `edhaAllEffects(actor)` (`Actor#allApplicableEffects()`), so an item-transferred `Veil` is reachable at
  last. Drive the **SHIPPED trait AE only** — ⚠️ do **not** hand-create an actor-level copy this time; that
  control is the leading explanation of the unexplained second symptom.
- **`2bS-11 — Natural Order`, veil half** — unblocked by the same fix; stage it off the row above as its
  positive control, then bring an armed Green into range.
- **`Culture items load CLEAN`** — the ten nations register at `init`, which makes the already-built pack
  valid with **no rebuild**. Three console checks: no validation errors on `getDocuments()`, every culture's
  `_source.system.id` is its own slug rather than `"none"`, and a culture-type talent-tree prerequisite can
  actually name a nation. **This is the one claim no headless test can make** — the fix turns on our `init`
  callback running before the culture DataModel's schema is built.

⚠️ **Two things that will otherwise cost you the row.** (1) `edha.darkVeilSweep()` and
`edha.allEffects(actor)` are now on the console API — run 33 could not instrument a module-scoped function,
and this is the answer. Log `actor.effects` and `[...actor.allApplicableEffects()]` **side by side, keyed by
`_id`, never by name**, at every trigger. (2) **A succeeded sweep is a NO-OP.** Once the marker is up and the
square is still unlit, both branches decline: no card and no write is the CORRECT result. Run 33's "six
further triggers produced nothing" is very probably exactly that, so do not read silence as a failure —
read the ids.

### 1. **The dark-veil rows, IF the lookup fix has landed** (otherwise skip straight to 2)
The fixture is a known quantity now and costs ~3 calls: create a scene with `environment: {darknessLevel: 1,
globalLight: {enabled: false}}`, **`view()` it, never activate**, import the Stalker fresh into `Edha Bench`,
place it and an armed `Bench — Green` within 60 ft, delete the scene at the end. Then drive the pair
(unlit → marker ON; walk into light → marker releases; manual toggle in light → left alone) and 2bS-11's
suppression half.
⚠️ **Run 33 left a SECOND, unnamed symptom here and it is your first job even if the lookup is fixed.** With
an actor-level marker the sweep fired **once** and then went quiet: six further triggers — three teleport
moves (`"x" in changes` verified true), two `updateScene` environment changes, one fresh `createActiveEffect`
— produced no card and no change, with `activeGM = Bench (isSelf)`, zero console errors, zero AE churn, and
the illumination predicate still evaluating **false** at the sweep's own +300 ms timing. **Hook
`updateActiveEffect` BEFORE the first trigger** — the engine's functions are module-scoped, so that is the
only way to see what re-disables it.

### 2. **The two genuinely-drivable `# Bench-results fixes` rows** (cheapest real wins, deferred twice now)
Both single-actor, single-cast, no player client:
- **Single-target picker resolves** — target 2+ tokens, use **Withering Ray** (Black): the picker card
  appears, **nothing is spent**, clicking a name narrows you to that one target, the card marks ✓ and the
  talent rolls once. ⚠️ The picker renders in the engine's **AppV1** window (`div.app.window-app`, no
  `<dialog>`) — sample both DOM shapes.
- **AoE burst auto-target** — place any burst (e.g. Flame Surge) and assert the caught tokens end up actually
  **targeted** (`game.user.targets`); this retarget was silently no-opping on v13.

### 3. **The wizard block — 6 🤖, never driven in nine runs, and there is nothing left to hide behind**
Run 32 cleared the other July sections to their real blockers and run 33 removed the culture-defect
uncertainty. Re-read each row against **DEPLOY STATE** (2026-07-26 — every wizard row predates it) and the
live pack **before** staging; several are likely already answered by a later deploy and retire at the cost of
one read. The **wizard-as-a-player walkthrough** pairs with a player client — it is large, so only start it if
you can finish it.

### 4. **The items-dump pair** (CAE burns + Kindle's token-light half)
Both console-runnable. CAE burns needs the `active: false` combat + `ui.combat.initialize({combat})` pattern —
**never activate a bench combat**.

### 5. **R-63's same-side regression — 1–2 more shapes**
One shape is proven (the `enemies-range` disposition filter skipped three adjacent friendlies) and run 32
handed over a second nearly free (`Unravel Everything`'s fill took only the two hostiles with four friendlies
inside the same 60 ft). Pick from **Reroll Reaction** against a marked foe, or a **Fate snare** stepped on by
an ally vs. an enemy. **Not the aura shape** unless you have budget.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. Ben's `Gamemaster` has been
  connected through runs 24–33 (measured again this run: `["Bench","Gamemaster"]`). Record BLOCKED with the
  blocker named — never re-file as ⚑. **This needs Ben to disconnect `Gamemaster` for one window.**
- **The two `# Adversary pack sync` rows need BEN, not a bench run.**
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table.
- **2bS-11's veil half and the Stalker veil row are blocked on the veil-LOOKUP defect**, not on the map. The
  map problem is solved.
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a bench
  combat.** (Runs 31–33 created none at all.)
- **Observer/rAF-dependent state is stale on this bench** — observers (run 22), `canvas.animatePan` (run 26),
  animated token moves (runs 29/32) and the vision polygon (run 30). Use `canvas.pan()`, `teleport: true`,
  and `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare it.
  Run 33's recipe drives `edhaPickPoint` in three lines.
- **SEVEN tokens on the Playtest Map are ORPHANS, not three**, and only three were ever the bench's.
  Re-measured run 33: **zero bench orphans remain**. Do not repair or delete the other four —
  `The Forgemaster`, `The Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)`.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs included.
- **Two bench PCs carry a STALE `Guardian Stance (+1 Deflect)` aura** (`Bench — Chaos`, `Bench — Life`) — an
  actor with no token is never swept, so giving it a token makes the engine correctly delete the effect.
  Expect it, restore it, do not report it as drift. Deleting them for good is Ben's call.

## Harness traps — each has already produced or nearly produced a false result

- **`actor.effects` omits item-transferred AEs** — every adversary marker in `data/adversary-effects.json` is
  `transfer: true`. Print `actor.effects` and `[...actor.allApplicableEffects()]` side by side before calling
  an adversary marker mechanic unstageable. (Run 33.)
- **The engine's functions are MODULE-SCOPED** — `edhaDarkVeilSweep`, `edhaTokensInLine`,
  `edhaPointIlluminated`, `edhaActorRulesOf` are all `undefined` at the console. Re-implement a helper inline
  to check what it would return, and attach observing hooks before the trigger. (Run 33.)
- **A talent that drops dangerous terrain damages your own caster** and pollutes the HP arithmetic — read the
  per-target *difference* against the card's single burst number, and delete the Region between casts. (Run 33.)
- **`animate: false` can commit a PARTIAL token position** — use `{animate:false, teleport:true}` and **read
  the destination back**. (Run 32.)
- **The setup script's IIFE is fire-and-forget and can exceed 30 s** — judge idempotency from
  `game.actors.size` / `game.items.size` / `scene.tokens.size`, not from the log. (Runs 32, 33.)
- **`{id, name}` effect snapshots detect drift but cannot repair it.** Snapshot
  `actor.effects.map(e => e.toObject())`. (Run 32.)
- **A dotted flag delete leaves the PARENT object behind as `{}`** — re-diff after restoring and delete any
  parent the snapshot did not have. (Runs 31–33; run 33's `bpHits` restore is the worked example.)
- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS and aborts the rest
  of your call.** Delete Regions only, then re-read. (Runs 31, 33.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire the driver in one call, read the result in
  the next — and late in a run, stop writing sampling loops at all. (Runs 26, 28–30, 33.)
- **`item.use()` never settles while a dialog is open** — a `skill_test` talent puts up **two**, neither a
  `<dialog>`. Run 32's `__cast()` polling loop handles both; run 33 folded the `#board` pointerdown into the
  same loop.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent no-op that
  does **not** stop the talent — every talent driven in runs 31–33 warned and every one still fired.
- **A skill-test talent will simply MISS sometimes.** Top the resource up and re-cast; only call FAIL when the
  *success* branch misbehaves. (Run 33's Prone half needed a second cast for exactly this reason.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original `<script>` entry.

## Standing lessons

- **Take the re-test block FIRST, every run.** Seven runs running.
- **Stage each row off the PREVIOUS row's residue.** Look for the chain before building fresh fixtures.
- **Once a matched control has proven a root cause, WRITE THE RESIDUAL SYMPTOM DOWN AND MOVE ON.** Run 33 spent
  ~20 calls past the point of proof chasing an intermittency it never named, and two whole plan steps went
  undriven for it. The unnamed half is a fine first row for the next run.
- **Refuse to inherit the previous run's blocker — re-derive it.** Runs 32 and 33 both did, and both times the
  stated blocker was wrong: three July sections were not bench work at all, and the dark-veil rows were not
  blocked on the map.
- **Open the player-client window EARLY** if the run needs one — runs 30–32 each got three or more results out
  of its one setup.
- **Read the cards you did not come for.** Runs 31, 32 and 33 each found their only engine defect that way.
- **Pick the flow by its EVENT, not by its talent**, and read the row's rule config out of
  `data/authored/*.json` before staging.
- **A row's own break/staging recipe can be wrong.** Verify it against the source before concluding anything.
- **Only claim what your own logs support, and label inferences as inferences.**
