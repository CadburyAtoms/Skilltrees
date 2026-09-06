# Next bench session

> **Weekend marathon, run 8 (bench run 31, 2026-09-05) is done.** It **verified fix pass 3 GREEN** — the
> Walking Ruin trail now drops for a **player-driven** move (**0 → 3 patches** on the identical staging run 30
> measured), the activeGM control still gives 3, and neither leg double-dropped with **two GM clients**
> connected. **Job 6b CLOSES** — its last two shapes (the `enemies-range` fill and a plain victim mark) both
> passed from a genuine non-owner. The **stale `sight.range`** row closes on a one-token fix. **R-63** gets its
> first proven shape for free. And the staging turned up **one new engine defect**: `Unravel Everything` never
> detonates the Omens it places in the same activation. **3 rows left the checklist, 1 new row was added, 1
> half closed on a row that stays open, 1 engine defect found.** Open queue **32 🤖 → 30 🤖** (⚑ unchanged at
> **22** — no ⚑ row was touched). No `⛔ STOP`, **no pack rebuild owed**, world restored to its start snapshot
> **exactly** (field-level actor id-diff empty across all 74 actors) apart from the one `sight.range` write,
> which is the run's product.

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 31` delta at the top** — the fix-pass-3 evidence
table, the `Unravel Everything` matched pair, the two declared deviations (the setup script was asserted rather
than re-run; an unattributable `Guardian Stance` AE was deliberately left alone), and the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 31"** — **three of these will save you a call
each**: resize the pane **before** the join and the second client needs no reload; deleting a hazard **Region**
cascades its Drawing, so a follow-up Drawing delete throws and **aborts the rest of your call**; and snapshot
**ActiveEffects as well as statuses**, because an AE carrying no status is invisible to a statuses-only
snapshot and then cannot be attributed. **Runs 29 and 30's lessons still apply** — the stale vision polygon,
whole-object `flags` writes merging instead of deleting, `pre*` hooks being initiator-only, animated moves
never committing with the pane hidden, and dotted-path resource restores.

**→ `EDHA_RULINGS.md`** — unchanged this run (no new rulings; nothing in run 31 needed Ben's judgment).
**R-69 is VERIFIED GREEN and still ready to move to §K.** R-70 and R-71 still carry their recommended
defaults. R-43 is still applied and still changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ RE-TEST THIS FIRST — run 31's one FAIL is waiting on `test-pass-fixes`, not on you

**Nothing is queued for re-test yet.** Run 31's defect (below) has **not** been fixed — it goes to
`test-pass-fixes` first. If a fix pass lands before your run, **that fix's re-test row is your first job**;
the re-test block has measured roughly twice as dense as scattered rows for **five runs running**, and this is
the one habit every run should keep.

## ❌ The one engine defect run 31 found — for `test-pass-fixes`, with the evidence already gathered

**`Unravel Everything` (Chaos) never detonates the Omens it places in the same activation.** Its card says
*"Place an Omen on every enemy in Attunement Range up to your cap …, **then remove all your Omens
simultaneously**"*, and both rules ride **`event: use`** with explicit `order` — `UnravelFill00000`
(`edha-owner-list`, `target: enemies-range`) at **0**, `UnravelSweep0000` (`edha-def-test`, `vs: none`,
`targetList: omens`) at **1**.

**Matched pair, same actor and targets, both casts from `PlayerBench`:**

| cast | ledger at start | fill | sweep |
|---|---|---|---|
| 1 | empty | placed 2 — *"B, A bear your Omen (2/2)"* | *"**no creatures on the ledger**"* — no damage, no Disorient, both Omens left standing |
| 2 | already holding those 2 | placed 0 | **both "affected"**, *"10 spirit … 2d8 + 2"*, both Disoriented, HP A 20→10 / B 41→31, ledger emptied |

So the `order: 1` sweep reads the ledger **as it stood before the `order: 0` fill committed**, and the talent
costs two casts (6 Investiture, 6 actions) to do what the card says one does.
⚠️ **Hypothesis, NOT proven — confirm at the dispatcher rather than take it on trust:** the fill commits inside
`edhaOwnerListQueue`'s queued async RMW (`register-skills.js` ~17790 — `return await
edhaOwnerListQueue(...)`, so the *handler* does await), which points one level up, at whatever runs the ordered
rule list for `event: use`. **Sweep the blast radius:** any talent that writes an H3 ledger and reads that same
ledger in a later-ordered rule of the same activation.

## Where the 30 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Character-creation wizard v2** | 6 | July deploy-state language — re-read against DEPLOY STATE and the live pack first. **Still never driven, seven runs running.** |
| **Bench-results fixes** · **Items-dump** · **Adversary pack sync** | 3 · 3 · 2 | Same July language; check the live pack before driving. |
| **pass 5.2** (R-63, Job 6a) | 3 | R-63's same-side row now has **1 shape proven** and needs 1–2 more. R-63's unset-disposition row is a repo-side pin. Job 6a needs zero GM clients. **Job 6b and both R-64 halves are CLOSED — do not re-queue any of them.** |
| **pass 5.3** | 2 | R-61's legacy `detonateUsed` (informational only) + R-62's audience flips (**BLOCKED** — needs zero GMs). |
| **R-65 ally-click burst** | 1 | Subject corrected to **Death Mark** (Knowledge). The fold itself is already proven. Needs the player client. |
| **`Unravel Everything` fill-then-sweep** | 1 | New this run — see above. `test-pass-fixes` first. |
| Scattered singles (Green, Cinderbrock, Crownox, Brandram's Reckless Advance, manual re-litigation, the dark-veil pair) | 9 | Each needs its own staging. |

## Run 9 — the plan, in order

### 1. **Any re-test block first** (see above — nothing queued yet; if a fix pass lands, it becomes step 1)

### 2. **THE FOUR JULY SECTIONS — 14 🤖, and they are now the whole point of the next run**
`# Character-creation wizard v2` (6), `# Bench-results fixes` (3), `# Items-dump tranche` (3), `# Adversary
pack sync` (2). **Runs 26–31 have all skipped these — six runs.** They are the largest untouched block by a
wide margin and every run has had a better-looking option. **Do them next, and do the cheap half first:**
re-read each row against **DEPLOY STATE** and the **live pack** before staging anything. Several are likely
already answered by a later deploy — those retire on that evidence at the cost of one read, and finding one
blocked-on-deploy is cheaper than a staging attempt. Only then drive what survives. **Budget the first half of
the run for this and do not let a shinier row displace it again.**

### 3. **The player-client window — one setup, three remaining rows** (open it early if you get to step 3)
The setup is ~5 calls with run 31's shortcut (resize the tab **before** joining — no reload needed), plus the
ownership snapshot and restore. What is left needs it:
- **R-65's Death Mark** — get an ALLY to click their burst button; `burstFormula` is
  `(@tier)d(2 * @skills.red.rank + 2)`, so this one really does carry a die.
- **2bR-10 Devoted Conduit** (needs a second White PC) and **2bL-7 Covenant's shared icon** (two Order PCs).
- **The wizard-as-a-player walkthrough** — large; only start it if you can finish it, and it pairs naturally
  with step 2's wizard rows.
⚠️ Grant OWNER on **bench-folder actors only**, snapshot `ownership` first, restore at the end, **log BOTH
clients out**. One PC per client is a staging step, not a detail.

### 4. **R-63's same-side regression — 1–2 more shapes** (drivable today, no player client needed)
One shape is proven (the `enemies-range` disposition filter correctly skipped three adjacent friendlies).
Pick 1–2 more from: **Reroll Reaction** against a marked foe, a **Fate snare** stepped on by an ally vs. an
enemy, or Reveal Facts / Investiture-of-Command's enemies-in-range button. ⚠️ **Not the aura shape** unless you
have budget — the sweep finds **exactly one** `affects`-carrying aura, `Mantle of the Aspirant` (Power), and it
sits on `edha-watch-rule`, so it needs a watched test to fire rather than a plain `use`.

### 5. **The `edha-dark-veil` rows — build the scene (still not started, six runs running)**
Nothing on the Playtest Map can ever be unlit, so Green 2bS-11's veil half and the Stalker veil auto-toggle are
structurally unreachable there. **A bench-CREATED scene with darkness — viewed, never activated — is the
drivable shape.** `Playtest Map (Copy)` has `globalLight.enabled === false` but it is **Ben's**; create your own
and delete it at the end.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. The bench joins as a GM and
  Ben's `Gamemaster` has been connected through runs 24–31 (measured again this run:
  `["Bench","Gamemaster","PlayerBench"]`). Record BLOCKED with the blocker named — never re-file as ⚑. **This
  needs Ben to disconnect `Gamemaster` for one window**; it is worth asking rather than re-attempting.
- **Job 6b is CLOSED** (run 31 — all three shapes proven from a genuine non-owner). **Both R-64 halves are
  SETTLED** (run 29). **Do not re-queue any of them.**
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus
  `ui.combat.initialize({combat})` satisfies every "needs the active combat" row. **Never activate a bench
  combat.** (Run 31 created none at all.)
- **Observer/rAF-dependent state is stale on this bench** — observers (run 22), `canvas.animatePan` (run 26),
  animated token moves (run 29) and the vision polygon (run 30). Use `canvas.pan()`, `animate: false`, and
  `canvas.perception.update(...)` + a ticker pump before reading `isVisible`. Run 31 used exactly this to read
  the trail Drawings from the player client and it worked first time.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare it.
- **SEVEN tokens on the Playtest Map are ORPHANS, not three.** Item 37's repair fixed the bench's three and
  correctly left the other four alone — `The Forgemaster`, `The Demolisher`, `PC Tester`,
  `Cragdrake Whelp Pack (1)`. Re-measured run 31: **zero bench orphans remain.** Do not repair or delete the
  four.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs included.
  Run 31 fixed the stale sight range with a **one-token write** instead; that is the pattern.

## Harness traps — each has already produced or nearly produced a false result

- **Deleting a hazard REGION cascades its Drawing, and a follow-up Drawing delete THROWS and aborts the rest of
  your call.** Delete Regions only, then re-read. Put irreplaceable world-mutating steps *before* any delete
  that might throw. (Run 31 — it silently swallowed a whole control-leg move loop.)
- **A statuses-only snapshot cannot see an AE that carries no status**, so mid-run drift in such an effect is
  unattributable and (correctly) undeletable. Snapshot `[...actor.statuses]` **and**
  `actor.effects.map(e => ({id, name}))`. (Run 31.)
- **The VISION POLYGON is stale with the pane hidden, and it fakes a sight defect.** Force
  `canvas.perception.update({initializeVision: true, refreshVision: true, refreshLighting: true})` **and pump
  the ticker** before believing any visibility reading. (Run 30.)
- **A whole-object `flags` write MERGES — it never deletes.** Use `{"-=key": null}` for a top-level key and a
  dotted `"flags.edha-content.markedBy.-=quarry"` for a nested one. ⚠️ **A generated dotted restore deletes
  LEAVES, which leaves the parent object behind as `{}`** — run 31's restore had to follow up with an explicit
  `markedBy.-=diagnosed`. Re-diff after restoring, always.
- **An ANIMATED token move is a silent no-op with the pane hidden.** Re-issue with `animate: false`. (Run 29.)
- **Restore `_source` resources with DOTTED PATHS.** (Run 29.)
- **Read the rule's `event` field, not just its handler config.** (Run 28.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Pick the driver from the chokepoint:** `edha-deal-damage` / `edha-damage-rider` → `item.rollDamage()`;
  `edha-on-hit` / `edha-gm-cue` / `edha-thorns` / `edha-damage-bonus` / the Colossus splash →
  `applyDamage(list, {edhaSource, originatingItem})`. (Runs 27/28/30.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire the driver in one call, read the result in
  the next.
- **`item.use()` never settles while `ItemConsumeDialog` is open** — fire it, poll for
  `button[data-action="continue"]`, and **read the dialog before clicking it**. (Run 31 did this three times;
  the button is reachable via `div.app.window-app button[data-action="continue"]` as well as `dialog button`.)
- **Read the notification log before writing FAIL.** *"does not have enough actions"* is a silent no-op that
  does **not** stop the talent — every talent driven in run 31 warned about actions and every one still fired.
  Wrap `ui.notifications.info/warn/error` in a recorder at the start of the run, on **both** clients.
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original `<script>`
  entry.

## Standing lessons

- **Take the re-test block FIRST, every run.** Five runs running; re-tests measure roughly twice as dense.
- **Open the player-client window EARLY.** Runs 30 and 31 both got three results out of its one setup.
- **Drive the PLAYER half of a row whose GM half already passes.** Run 30's engine defect lived exclusively on
  the path a real player takes, and run 31 is what proved the fix.
- **Read the cards you did not come for.** Run 31's only engine defect was two adjacent chat cards contradicting
  each other while both rows being driven passed.
- **Prove an ordering question with a PRE-LOADED state, not the end state.** Cast once on an empty ledger and
  once on a full one; the end state alone cannot tell "broken" from "ran too early".
- **Refuse to inherit the previous run's blocker — re-derive it.** (Run 29's whole yield.)
- **Pick the flow by its EVENT, not by its talent.**
- **Read the row's rule config out of `data/authored/*.json` before staging** — its `event`, and **whether the
  row's named talent is the one that actually carries the branch**. Three runs in a row found a row's stated
  subject wrong; run 31 instead used the sweep to *find* the right subject before staging, which cost one Bash
  call each time.
- **A row's own break/staging recipe can be wrong.** Verify it against the source before concluding anything.
- **Only claim what your own logs support, and label inferences as inferences.** Run 31 could not attribute an
  ActiveEffect and said so rather than deleting it.
