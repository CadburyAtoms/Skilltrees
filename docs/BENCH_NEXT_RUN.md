# Next bench session

> **Weekend marathon, run 9 (bench run 32, 2026-09-06) is done.** It **verified fix pass 4 GREEN on all four
> talents**, every one driven from `PlayerBench`: `Unravel Everything` fills 2 Omens **and** detonates both in
> **ONE** cast on an empty ledger, `Spreading Omen` reads **(1/2)** then **(2/2)** with both ledger entries
> surviving, and both reveals now list the condition they just relayed. **`edhaAwaitLocal` never timed out** on
> either client. **R-65 CLOSES** on its last half — the ally-clicked burst rolled a real **2d8 = 13** from a
> non-GM client with exact HP arithmetic. The **Starting-kit console API** passes on the Hunter path.
> `bench-setup-console.js` was **re-run** (run 31 had substituted assertions) and is idempotent with **zero ⚠**
> and `orphans: 0/0`. **6 rows left the checklist, 1 new engine/data defect found, 2 six-run-stalled July rows
> re-classified to their real blockers.** Open queue **33 🤖 → 28 🤖** (counted as `^- [ ] 🤖` rows; run 31's "30" used a different count — the net is **−5** = 6 retired minus 1 new). ⚑ unchanged at **22**. No `⛔ STOP`,
> **no pack rebuild owed**, world restored to its start snapshot **exactly** (field-level actor id-diff empty
> across all 74 actors; tokens/regions/drawings/templates/walls/combats/scenes all zero delta).

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-06 — BENCH RUN 32` delta at the top** — the fix-pass-4 evidence
table, R-65's closing evidence, the new culture-item defect with its repo-side root cause, the July
re-classification, and the explanation of run 31's unattributable `Guardian Stance` AE.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 32"** — **two of these will save you a row
each**: `animate: false` is **not** enough to move a token (it can commit a **partial** position — use
`teleport: true` and read the destination back), and the setup script's IIFE can take **over 30 s** on a
re-run, so an empty warn buffer is not a failure — judge idempotency from the counts. Also: load a big console
script over a throwaway CORS server instead of pasting it, and snapshot **whole effect objects**
(`e.toObject()`), because `{id, name}` detects drift but cannot repair it. **Runs 29–31's lessons still
apply** — the stale vision polygon + ticker pump, whole-object `flags` writes merging instead of deleting,
`pre*` hooks being initiator-only, and dotted-path resource restores.

**→ `EDHA_RULINGS.md`** — unchanged this run (no new rulings; nothing in run 32 needed Ben's judgment).
**R-56 is now load-bearing** — a checklist row is explicitly blocked on it (see below). **R-69 is VERIFIED
GREEN and still ready to move to §K.** R-70 and R-71 still carry their recommended defaults. R-43 is still
applied and still changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ RE-TEST FIRST — and this time there IS one queued

**Item 29 (PR #185) merged right after this run and ships an engine change with its own 🤖 re-test row**:
`Fault Line` catches **allies** too now, per ruling **R-5** (Ben: *"no it does not"* spare them). The row is in
`# BENCH — Destruction` and names its own staging — one ally inside the line, a second clearly outside,
then cast. **It is ENGINE-ONLY and the PM deploys it, so the served hash will NOT be `06229ecc…` any more:
hash-verify from both sides before driving, and record the rows NOT-DEPLOYED rather than FAILED if it has
not landed.**

Run 32's own new defect (below) has **not** been fixed — that one goes to `test-pass-fixes` first. The
re-test block has measured roughly twice as dense as scattered rows for **six runs running**, and it is the
one habit every run should keep.

## ❌ The one defect run 32 found — for `test-pass-fixes`, root cause already proven repo-side

**All 10 Edha culture items fail cosmere-system validation on every pack load.** Loading
`edha-content.edha-items` logs ten `CosmereItem [<id>] validation errors: system: id: <slug> is not a valid
choice` — canticle · kettavar · corvaine · sylvaneth · goldenport · thalendor · malcurr · lunavar · ashkar ·
vorsk, every one `type: "culture"`.

**Root cause (proven, not hypothesised):** `scripts/foundry-build.js` ~L816 writes `system: { id: slug, … }`
from `slugify(c.name)` over `data/cultures.json`, and the system restricts that field to its own six cultures
— `CONFIG.COSMERE.cultures` is exactly `["alethi","azish","herdazian","thaylen","unkalaki","veden"]`. The
**ancestry** docs get the same `system.id = slug` treatment and log **no** error, so the restriction is
specific to the culture model.

⚠️ **SEVERITY IS THE OPEN QUESTION AND IT DECIDES THE FIX.** The documents still load and `getDocuments()`
still returns all ten, so this may be log noise only. But if the invalid value is **dropped** rather than
kept, a culture's `system.id` no longer matches the `cultural:<slug>` expertise its own
`grant-expertises` / `remove-expertises` events add and remove — which would break the wizard's culture step
**silently**. **First move: read `item.system.id` back off a loaded pack culture and compare it to the slug.**
Run 32 could not — the finding landed after the world was restored and both clients were out. It is a
one-call read.

## Where the 29 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Character-creation wizard v2** | 6 | July deploy-state language. **Still never driven, eight runs running** — and now the culture defect above may bear on its culture step. Re-read against DEPLOY STATE first. |
| **Items-dump tranche** | 2 | Starting-kit RETIRED at run 32. Left: **CAE burns** (needs a combat — use the `active: false` + `ui.combat.initialize` pattern) and **Kindle's token-light half**. |
| **Adversary pack sync** | 2 | ⛔ **Both are now BLOCKED ON BEN, and the blocker is written on the rows.** All that is left in either is the **bulk button**, and a bulk sync rewrites every world adversary including Ben's campaign actors — outside hard rule 4. **Do not re-attempt un-authorised.** |
| **Bench-results fixes** | 3 | **The vision row is blocked on `EDHA_RULINGS.md` R-56**, not on a bench run — do not re-stage it. The other two — **single-target picker** (Withering Ray with 2+ targets) and **AoE burst auto-target** — are genuinely drivable and cheap. |
| **Culture items** | 1 | The new defect's re-test row (added by run 32). |
| **`BENCH — hygiene campaign 2026-08-10`** | 7 | The pass 5.2 / 5.3 rows below are counted here — this is where they live in the file. |
| **Bestiary sections** (W29 ×3, Goldenport, Vorsk, Adversary ability wiring) | 6 | Untouched all marathon; each needs its own adversary import + staging. |
| **`BENCH — Destruction`** | 1 | ⭐ **NEW and it is a RE-TEST — take it first.** Item 29 (PR #185, merged after this run) made a `kind: line` zone catch **allies** too, per ruling **R-5**. ENGINE-ONLY: the PM deploys it, so **hash-verify before driving** — the served hash will no longer be `06229ecc…`. |
| **`BENCH — Green`** | 1 | The dark-veil half — see step 5. |

**R-65, Job 6b and both R-64 halves are CLOSED — do not re-queue any of them.** ⚑ is now **21**, not 22:
item 27 retired the `GM summon relay` row on ruling R-1 after this run.

## Run 10 — the plan, in order

### 1. **Item 29's `Fault Line` re-test** (see above — hash-verify first, it is a fresh deploy)

### 2. **The two genuinely-drivable `# Bench-results fixes` rows** (cheapest real wins on the board)
Both are single-actor, single-cast, no player client needed:
- **Single-target picker resolves** — target 2+ tokens, use **Withering Ray** (Black): the picker card
  appears, **nothing is spent**, clicking a name narrows you to that one target, the card marks ✓ and the
  talent rolls once. (Verdant Mend is the same shape if you want the control.) ⚠️ **The picker renders in the
  engine's AppV1 window** (`div.app.window-app`, no `<dialog>`) — the known trap that once produced a false
  "silent no-op" report. Sample **both** DOM shapes.
- **AoE burst auto-target** — place any burst (e.g. Flame Surge) and assert the caught tokens end up actually
  **targeted** (`game.user.targets`); this retarget was silently no-opping on v13.

### 3. **The four July sections' remaining 11 rows — the wizard block is now the whole point**
Runs 26–32 have all skipped `# Character-creation wizard v2` (6 🤖). Run 32 cleared the *other* three
sections down to their real blockers, so **the wizard block is what is left and there is no cheaper
alternative to hide behind.** Re-read each row against DEPLOY STATE (2026-07-26 — every wizard row predates
it) and the live pack **before** staging; several are likely already answered by a later deploy and retire at
the cost of one read. The **wizard-as-a-player walkthrough** pairs naturally with a player client if you open
one — it is large, so only start it if you can finish it.

### 4. **R-63's same-side regression — 1–2 more shapes** (drivable today, no player client)
One shape is proven (the `enemies-range` disposition filter skipped three adjacent friendlies).
⚠️ **Run 32 gives you a second one nearly free**: `Unravel Everything`'s `enemies-range` fill correctly took
**only the two hostile bench targets** while four friendly bench PCs sat inside the same 60 ft — worth
recording formally if you re-cast it. Otherwise pick from **Reroll Reaction** against a marked foe, or a
**Fate snare** stepped on by an ally vs. an enemy. **Not the aura shape** unless you have budget —
`Mantle of the Aspirant` is the only `affects`-carrying aura and it sits on `edha-watch-rule`.

### 5. **The `edha-dark-veil` rows — build the scene (still not started, SEVEN runs running)**
Nothing on the Playtest Map can ever be unlit, so Green 2bS-11's veil half and the Stalker veil auto-toggle
are structurally unreachable there. **A bench-CREATED scene with darkness — viewed, never activated — is the
drivable shape**; delete it at the end. `Playtest Map (Copy)` has `globalLight.enabled === false` but it is
**Ben's**. The fixture is identified: the `edha-dark-veil` adversary is the **Stalker**
(`edha-content.edha-adversaries` id `l924euoyx3pYFk2T`, `effectName: "Veil"`) — import fresh, put it on an
unlit square within 60 ft of an armed Green, and the positive/negative pair is one flow.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. The bench joins as a GM and
  Ben's `Gamemaster` has been connected through runs 24–32 (measured again this run:
  `["Bench","Gamemaster","PlayerBench"]`). Record BLOCKED with the blocker named — never re-file as ⚑. **This
  needs Ben to disconnect `Gamemaster` for one window**; worth asking rather than re-attempting.
- **The two `# Adversary pack sync` rows need BEN, not a bench run** (new, run 32) — see the table above.
- **The "Adversary tokens see like PCs" row is waiting on `EDHA_RULINGS.md` R-56**, not on a table (new,
  run 32). Do not re-stage it; it re-measures only after R-56 is answered.
- **Job 6b is CLOSED** (run 31). **Both R-64 halves are SETTLED** (run 29). **R-65 is CLOSED** (run 32).
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a bench
  combat.** (Runs 31 and 32 created none at all.)
- **Observer/rAF-dependent state is stale on this bench** — observers (run 22), `canvas.animatePan` (run 26),
  animated token moves (runs 29/32) and the vision polygon (run 30). Use `canvas.pan()`, `teleport: true`,
  and `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare it.
- **SEVEN tokens on the Playtest Map are ORPHANS, not three**, and only three were ever the bench's.
  Re-measured run 32: **zero bench orphans remain**. Do not repair or delete the other four —
  `The Forgemaster`, `The Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)`.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs included.
- **Two bench PCs carry a STALE `Guardian Stance (+1 Deflect)` aura** (`Bench — Chaos`, `Bench — Life`).
  Explained at run 32: an actor with no token is never swept, so it holds the aura from an earlier run, and
  **giving it a token makes the engine correctly delete the effect**. Expect that, restore it, and do not
  report it as drift. Deleting them for good is Ben's call.

## Harness traps — each has already produced or nearly produced a false result

- **`animate: false` can commit a PARTIAL token position** — no error, promise resolved, token a few pixels
  along the path. Use `{animate: false, teleport: true}` and **read the destination back and compare it to
  what you asked for**. (Run 32 — it cost an Attunement-Range count of 1 where 2 was staged.)
- **The setup script's IIFE is fire-and-forget and a re-run can exceed 30 s.** An empty warn buffer is not a
  failure; judge idempotency from `game.actors.size` / `game.items.size` / `scene.tokens.size`. (Run 32 fired
  it three times for exactly this reason.)
- **`{id, name}` effect snapshots detect drift but cannot repair it.** Snapshot
  `actor.effects.map(e => e.toObject())`. (Run 32.)
- **A dotted flag delete leaves the PARENT object behind as `{}`** — re-diff after restoring and delete any
  parent the snapshot did not have. (Runs 31 and 32.)
- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS and aborts the rest
  of your call.** Delete Regions only, then re-read. Put irreplaceable world-mutating steps *before* any
  delete that might throw. (Run 31.)
- **The VISION POLYGON is stale with the pane hidden and it fakes a sight defect.** Force
  `canvas.perception.update({initializeVision: true, refreshVision: true, refreshLighting: true})` **and pump
  the ticker** before believing any visibility reading. (Run 30.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire the driver in one call, read the result in
  the next.
- **`item.use()` never settles while a dialog is open** — and a `skill_test` talent puts up **two**
  (consume, then roll), neither of them a `<dialog>`. Run 32's `__cast()` helper handles both in one loop;
  copy it.
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent no-op that
  does **not** stop the talent — every talent driven in runs 31 and 32 warned and every one still fired.
- **A skill-test talent will simply MISS sometimes.** Spreading Omen rolled 7 vs COG 14 with everything
  staged right. Top the resource up and re-cast; only call FAIL when the *success* branch misbehaves.
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Pick the driver from the chokepoint:** `edha-deal-damage` / `edha-damage-rider` → `item.rollDamage()`;
  `edha-on-hit` / `edha-gm-cue` / `edha-thorns` / `edha-damage-bonus` / the Colossus splash →
  `applyDamage(list, {edhaSource, originatingItem})`. (Runs 27/28/30.)
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original `<script>`
  entry.

## Standing lessons

- **Take the re-test block FIRST, every run.** Six runs running; re-tests measure roughly twice as dense.
- **Stage each row off the PREVIOUS row's residue.** Run 32's R-65 cost three calls instead of a full setup
  because Studied Mark had already placed the Insight that Death Mark's watch rule needed. Look for the chain
  before building fresh fixtures.
- **Open the player-client window EARLY.** Runs 30, 31 and 32 each got three or more results out of its one
  setup.
- **Drive the PLAYER half of a row whose GM half already passes.** Two engine defects in three runs lived
  exclusively on the path a real player takes.
- **Read the cards you did not come for.** Run 31's only engine defect was two adjacent chat cards
  contradicting each other; run 32's only defect was ten validation errors logged while timing something else.
- **Prove an ordering question with a PRE-LOADED state, not the end state.**
- **Refuse to inherit the previous run's blocker — re-derive it.** Run 32 did this to four July sections and
  three of them turned out not to be bench work at all.
- **Pick the flow by its EVENT, not by its talent**, and read the row's rule config out of
  `data/authored/*.json` before staging — its `event`, and whether the row's named talent is the one that
  actually carries the branch.
- **A row's own break/staging recipe can be wrong.** Verify it against the source before concluding anything.
- **Only claim what your own logs support, and label inferences as inferences.**
