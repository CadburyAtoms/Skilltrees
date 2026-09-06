# Next bench session

> **Weekend marathon, run 7 (bench run 30, 2026-09-05) is done.** It **opened the player-client window** —
> the thing runs 24–29 all deferred — and that one setup produced three results in about twelve calls.
> **Item 37** (orphan repair) and **item 26** (20 ft PC sight) both PASS and retire; **Magnum Opus** closes
> R-65's Civilization row on both halves; **Job 6b's** GM-relay is proven from a genuine non-owner. **R-34
> splits**: its indicator renders player-visible exactly as Ben described, but the row's own staging found a
> **real engine defect — a player-driven move drops no Walking Ruin trail at all**, root-caused with a matched
> control and a fix shape that already ships in the same file. **3 rows left the checklist, 1 new row was
> added, 3 more halves closed on rows that stay open, 1 engine defect found.** Open queue **34 🤖 → 32 🤖**
> (⚑ unchanged at **22** — no ⚑ row was touched). No `⛔ STOP`, **no pack rebuild owed**, world restored to its
> start snapshot **exactly** (field-level id-diff empty across all 74 actors) apart from item 37's three
> repaired `actorId`s, which are the run's product.

## Read this first

**→ `EDHA_FOUNDRY_HANDOFF.md`, the `2026-09-05 — BENCH RUN 30` delta at the top** — the R-34 root cause and
its control, both item-26 surprises, the Pack Share subject correction, and the world diff (including one
disclosed restore mis-step).

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 30"** — **four of these will bite you**: the
hidden pane leaves the **vision polygon** stale so `isVisible` reads false for everything (the third member of
the rAF family); a whole-object **`flags`** write MERGES and never deletes a key; **`pre*` document hooks run
only on the initiating client**, which is a whole class of player-vs-GM defect; and the join button needs a
click on its **label** or a programmatic `button[name="join"]`. **Read runs 28 and 29's lessons too** — the
`edha-deal-damage` → `rollDamage()` vs `edha-on-hit`/splash → `applyDamage` split, the rule's `event` field
deciding the driver, animated moves never committing, dotted-path resource restores, and the
timeout-keeps-running trap all still apply.

**→ `EDHA_RULINGS.md`** — unchanged this run (no new rulings; nothing in run 30 needed Ben's judgment).
**R-69 is VERIFIED GREEN and still ready to move to §K.** R-70 and R-71 still carry their recommended
defaults. R-43 is still applied and still changes live dice math.

## ⚑ vs 🤖 — read this before picking rows

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

⚠️ **Never re-file an unrun 🤖 row as ⚑ because you ran out of time.** Leave it 🤖, or record it BLOCKED with the
blocker named. **Design questions go to `EDHA_RULINGS.md`, never to the checklist as a new ⚑ row.**

## ✅ RE-TEST THIS FIRST — run 30's one FAIL is fixed (fix pass 3, 2026-09-05)

**Walking Ruin's trail is fixed and is waiting on you.** `test-pass-fixes` took the row below, confirmed the
diagnosis against Foundry's own `client-backend.mjs`, swept all 15 `pre*` hooks (**no second instance** — every
other one stamps `options` or vetoes inline), and moved the trail onto the shared **`options.edhaPrevPos`**
stamp behind two new helpers (`edhaPrevTokenPos` / `edhaPrevTokenCenter`). **ENGINE-ONLY — F5 or relaunch is
enough, no pack rebuild, no ⟳ Sync.** Confirm the served-engine hash first as usual, then drive the new
checklist row under `# BENCH — Destruction`: **arm Walking Ruin, move three squares from the PLAYER's own
client, expect three ruin patches** (three `Bench — Destruction — Dangerous Terrain` Regions + their 🏚️
Drawings at the vacated centres), then re-run the same three squares as the activeGM as the matched control.
Watch that a second connected GM client does not double-drop. Detail: the `2026-09-05 — FIX PASS 3` handoff
delta.

The original diagnosis is kept below as the record.

## ⛔ (RESOLVED by fix pass 3) The one thing that was NOT a bench row

**Walking Ruin's trail never drops for a player-initiated move.** Root cause is proven, not guessed:
`register-skills.js:11215` stashes the prior centre on **`tokenDoc._edhaPrevCenter`** in a **`preUpdateToken`**
hook — a `pre*` hook runs **only on the initiating client** — while the drop at **:11221** is gated to the
single **activeGM** applier. For a player-driven move the two halves land on different clients and the applier
returns silently on a null stash. Measured as a matched pair: **PlayerBench moves 3 squares → 0 Regions;
the activeGM moves the identical 3 squares → 3 Regions + 3 Drawings.**

**The fix shape already ships 2 800 lines below.** The sibling move-announce pair at **:14046/:14052** stashes
into **`options.edhaPrevPos`**, and `options` IS broadcast with the update — so it survives a player move, and
it is stamped on **every** x/y update already. Move the trail watcher onto it (converting top-left → centre via
width/height × grid size). **Also sweep for the same shape elsewhere:** any
*`preUpdateX` stashes on the document → `updateX` reads it behind an activeGM gate* pair is dead the same way.
The R-34 row stays open until this is fixed and re-driven from a player client.

## Where the 32 open 🤖 rows are

| Block | 🤖 | Note |
|---|---|---|
| **Character-creation wizard v2** | 6 | July deploy-state language — re-read against DEPLOY STATE and the live pack first. Still never driven. |
| **pass 5.2** (R-63, Job 6a/6b) | 4 | R-63 same-side is **drivable today**. Job 6b now has 1 of 3 shapes proven; the other 2 need the player client. Job 6a needs zero GM clients. Both R-64 rows are SETTLED — do not re-queue. |
| **Bench-results fixes** · **Items-dump** · **Adversary pack sync** | 3 · 3 · 2 | Same July language; check the live pack before driving. |
| **pass 5.3** | 2 | R-61's legacy `detonateUsed` (informational only) + R-62's audience flips (**BLOCKED** — needs zero GMs). |
| **R-65 ally-click burst** | 1 | Subject corrected to **Death Mark** (Knowledge). The fold itself is already proven. |
| **Walking Ruin trail (R-34)** | 1 | Re-drive after the fix above. |
| **Stale token `sight.range`** | 1 | New this run — `Bench — Green`'s token is at 10 ft. |
| Scattered singles (Green, Cinderbrock, Crownox, Brandram's Reckless Advance, manual re-litigation) | 9 | Each needs its own staging. |

## Run 8 — the plan, in order

### 1. **Re-drive R-34 after `test-pass-fixes` lands the trail fix (re-test block first, every run)**
Four runs of evidence say the re-test block is roughly twice as dense as scattered rows. Arm Walking Ruin,
move a player-owned token three squares **from the player client**, confirm three Regions + three Drawings.
The indicator half is already proven, so this is only about the drop firing.

### 2. **Open the player-client window EARLY and burn the rest of it (the highest-value habit run 30 found)**
The setup is ~6 calls including the ownership snapshot and restore, and everything below shares it:
- **Job 6b's remaining two shapes** — the enemies-in-range fill (`target: enemies-range`) and a plain victim
  mark, both relayed by a non-owner.
- **R-65's Death Mark** — get an ALLY to click their burst button; `burstFormula` is
  `(@tier)d(2 * @skills.red.rank + 2)`, so this one really does carry a die.
- **The `# 🎮 Player-client window` stagings** — 2bR-10 Devoted Conduit (needs a second White PC),
  2bL-7 Covenant's shared icon (two Order PCs), and the wizard-as-a-player walkthrough.
- Recipe: `docs/EDHA_BENCH_RUNBOOK.md` §6 + run 30's join-button lesson. ⚠️ **resize AND reload** the new tab,
  grant OWNER on **bench-folder actors only**, snapshot `ownership` first, restore at the end, **log BOTH
  clients out**. One PC per client is a staging step, not a detail.

### 3. **pass 5.2's R-63 same-side regression (1 🤖, drivable today, no player client needed)**
Pick 2–3 of an aura talent (`edha-buff-aura` with `affects: allies`/`enemies`), Reroll Reaction against a
marked foe, a Fate snare stepped on by an ally vs. an enemy, or Reveal Facts / Investiture-of-Command's
enemies-in-range button. Ordinary tokens, normal dispositions — confirm nothing changed. The *unset*-disposition
sibling row is a repo-side pin (`tests/disposition-failclosed.test.js`) unless you find a token whose
disposition genuinely cannot resolve.

### 4. **The four July sections — 14 🤖, and none should be driven cold**
`# Character-creation wizard v2` (6), `# Bench-results fixes` (3), `# Items-dump tranche` (3), `# Adversary pack
sync` (2) all carry deploy-state language from July. **Check DEPLOY STATE and re-read each row against the live
pack first** — several may already be answered by a later deploy (retire on that evidence), and finding one
blocked-on-deploy is cheaper than a staging attempt. Runs 26–30 have all skipped these; they are now the
largest untouched block.

### 5. **The `edha-dark-veil` rows — build the scene (still not started, five runs running)**
Nothing on the Playtest Map can ever be unlit, so Green 2bS-11's veil half and the Stalker veil auto-toggle are
structurally unreachable there. **A bench-CREATED scene with darkness — viewed, never activated — is the drivable
shape.** `Playtest Map (Copy)` has `globalLight.enabled === false` but it is **Ben's**; create your own and delete
it at the end.

## Known blockers — do not fight these

- **Job 6a (pass 5.2), 2bM-1 and R-62's audience rows** need **zero GM clients**. The bench joins as a GM and
  Ben's `Gamemaster` has been connected through runs 24–30 (measured again: `["Bench","Gamemaster","PlayerBench"]`).
  Record BLOCKED with the blocker named — never re-file as ⚑. **This needs Ben to disconnect `Gamemaster` for one
  window**; it is worth asking rather than re-attempting.
- **Job 6b needs a NON-OWNER**, which a GM can never be. `PlayerBench`, or nothing. (1 of its 3 shapes is now done.)
- **Both R-64 halves are SETTLED, not blocked** (run 29). All 9 victim-mode rules sit on `edha-test-success`,
  behind an H1 def-test that resolves its own target after the roll. **Do not re-queue them.**
- **`game.combat` is the client's VIEWED combat** — an `active: false` bench combat plus `ui.combat.initialize({combat})`
  satisfies every "needs the active combat" row. **Never activate a bench combat.**
- **Observer/rAF-dependent state is stale on this bench** — observers (run 22), `canvas.animatePan` (run 26),
  animated token moves (run 29) and now **the vision polygon** (run 30). Use `canvas.pan()`, `animate: false`,
  and `canvas.perception.update(...)` + a ticker pump before reading `isVisible`.
- **`canvas.mousePosition` is frozen at (0,0)** with the pane hidden — shadow just that getter and declare it.
  The run-23/25 placement recipe (shadow the getter, dispatch `pointerdown` on `#board`, snap to the square
  **centre**) placed a real `edha-zone` terrain square in one call this run.
- **SEVEN tokens on the Playtest Map are ORPHANS, not three.** Item 37's repair fixed the bench's three
  (`Bench — Green`, `Bench — Heroic`, `Bench Target — Floater`) and correctly left the other four alone —
  `The Forgemaster`, `The Demolisher`, `PC Tester`, `Cragdrake Whelp Pack (1)` match no roster name. They are
  pre-existing; do not repair or delete them.
- **Do NOT run `edha.fixPcTokens()`.** It loops every `character` actor in the world, Ben's two PCs included.

## Harness traps — each has already produced or nearly produced a false result

- **The VISION POLYGON is stale with the pane hidden, and it fakes a sight defect.** `isVisible` and
  `vision.los.contains(...)` both read false for tokens 10 ft away while the radius was correctly 1350 px and
  `testCollision` said no wall. Force
  `canvas.perception.update({initializeVision: true, refreshVision: true, refreshLighting: true})` **and pump the
  ticker** before believing any visibility reading. (Run 30.)
- **A whole-object `flags` write MERGES — it never deletes.** Use `{"-=key": null}` for a top-level key and a
  dotted `"flags.edha-content.markedBy.-=quarry"` for a nested one; `markedBy: {}` leaves the sub-key. (Run 30 —
  the flags twin of run 29's resources lesson.)
- **Never derive "statuses already present" from the snapshot's EFFECTS** — some statuses have no ActiveEffect at
  all. Snapshot `[...actor.statuses]` and scope every status write to the bench folders. (Run 30.)
- **An ANIMATED token move is a silent no-op with the pane hidden.** Re-issue with `animate: false`. (Run 29.)
- **Restore `_source` resources with DOTTED PATHS.** (Run 29.)
- **Read the rule's `event` field, not just its handler config.** (Run 28.)
- **Never stage a status with `createEmbeddedDocuments`** — use `toggleStatusEffect`. (Run 28.)
- **Pick the driver from the chokepoint:** `edha-deal-damage` / `edha-damage-rider` → `item.rollDamage()`;
  `edha-on-hit` / `edha-gm-cue` / `edha-thorns` / `edha-damage-bonus` / **the Colossus splash** →
  `applyDamage(list, {edhaSource, originatingItem})`. Wrong driver = a manufactured dead rule. (Runs 27/28/30.)
- **`createEmbeddedDocuments` does not return documents in input order** — Tokens and Combatants both. (Runs 27/28.)
- **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT.** Fire the driver in one call, read the result in the
  next. Read world state before re-driving.
- **Paste `bench-setup-console.js` into `globalThis.__setupSrc` once** and re-run with `(0, eval)(...)` — you need
  it twice for the idempotency check and it is 22 KB. (Run 30.)
- **`item.use()` never settles while `ItemConsumeDialog` is open** — fire it, poll for
  `button[data-action="continue"]`, and **read the dialog before clicking it**.
- **Read the notification log before writing FAIL.** "not enough actions" and friends are silent no-ops that do
  NOT stop the talent — every talent driven this run warned about actions and every one still fired. Wrap
  `ui.notifications.info/warn/error` in a recorder at the start of the run.
- **Verify the deploy by HASH from BOTH sides**, paired with `decodedBodySize` on the original `<script>` entry.

## Standing lessons

- **Drive the PLAYER half of a row whose GM half already passes.** Run 30's only engine defect lived exclusively
  on the path a real player takes; every GM-driven test in the project's history had passed over it.
- **Refuse to inherit the previous run's blocker — re-derive it.** (Run 29's whole yield.)
- **Take the re-test block FIRST, every run.** Four runs running, re-tests measure roughly twice as dense.
- **Pick the flow by its EVENT, not by its talent.**
- **Read the row's rule config out of `data/authored/*.json` before staging** — its `event`, and **whether the
  row's named talent is the one that actually carries the branch**. Run 30 makes three runs in a row where a
  row's stated subject was wrong (Venom Glands, Set Charge, now Pack Share).
- **A row's own break/staging recipe can be wrong.** Verify it against the source before concluding anything.
- **Only claim what your own logs support, and label inferences as inferences.**
