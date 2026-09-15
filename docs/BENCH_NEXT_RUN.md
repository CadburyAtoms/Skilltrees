# Next bench session — run 49b: the item-156 adversary rows

> **Bench run 49a (2026-09-15) drained the engine-wide queue it was given.** 14 of its 15 open engine and talent 🤖 rows
> retired on evidence; **FP-1** stays open PARTIAL on **R-141**; **4 defects filed (TODO items 168–171)**; the three
> players' actors refreshed (PM-R17). Its end-of-run diff was empty apart from those three refreshes. **No deploy is owed
> by 49a** (DOCS-ONLY). What is left for an agent bench is the bestiary: **22 open 🤖 rows, 156-1 … 156-22**, plus one row
> still blocked on a fix.

## Read this first

**→ `docs/handoff-changelog/2026-09.md`, the `2026-09-15 — Bench run 49a` delta** — every retirement, the four defects,
R-141, the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 49a"** — three of them change how you click and how you map
tokens: (1) `createEmbeddedDocuments("Token", …)` returns documents OUT OF INPUT ORDER — map tokens by `actorId`; (2) a
coordinate `left_click` does not move the canvas pointer — `hover` at the same point first, or a click-to-place pick reads
a stale position; (3) `#chat-notifications` is a full-height column over the canvas (client x ≈ 936–1236 at a 1600-px
viewport) and a card popping into it absorbs a click — 49a's click pressed a Charges card's **Detonate ALL**. Runs 48 and
47's lessons still apply (the real-click recipe, the honest graze total, walking `item.use()` dialogs, duplicate
combatants).

**→ `EDHA_RULINGS.md` §L** — **R-141** is the one open ruling (False Premise's Reaction denial ends at the END of the
target's turn; its card says the start). Do not re-drive FP-1 until it is answered and its fix has landed.

## ⚑ vs 🤖

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

Never re-file an unrun 🤖 row as ⚑ because you ran out of time — leave it 🤖, or record it BLOCKED with the blocker named.
Judgment calls go to `EDHA_RULINGS.md`, never into the checklist as a new ⚑ row.

## ⛔ 0. Step zero

1. **Verify the deploy by hash, from both sides.** 49a measured `5e9833a9c8b7afc8…` (the deploy of main @ 7bd01c4,
   2026-09-15T11:19Z) — compute it yourself:
   ```bash
   git show HEAD:module-src/scripts/register-skills.js | tr -d '\r' | sha256sum
   curl -s "http://localhost:30000/modules/edha-content/scripts/register-skills.js?cb=$(date +%s)" | tr -d '\r' | sha256sum
   ```
   Then read DEPLOY STATE in `EDHA_FOUNDRY_TEST_CHECKLIST.md` against `git log`: the 156 rows ride the adversaries pack of
   that deploy (PRs #388 and #390). If a later adversaries REBUILD is owed and not yet deployed, the rows it touches are
   NOT-DEPLOYED, not FAIL.
2. **THREE players' actors, refresh-only (PM-R17): `Tem parinaem`, `Soggy Bottom`, `Ishee`.** Snapshot all three with
   `toObject()` before any roster step and deep-diff them at the end. 49a refreshed all three at 16:23Z (each toast: 4
   talents, 3 paths, 1 action — and "19 not found in packs", which is TODO item 168's noise, not a failure); a refresh in
   49b is optional.
3. **`scripts/bench-setup-console.js`'s `PROTECTED` list.** TODO item 165 (protect Ishee) was NOT on `origin/main` when 49a
   closed. Check again (`git show origin/main:scripts/bench-setup-console.js`, search for "ishee"); if it is still missing,
   add `"ishee"` to your worktree's copy for the run only and `git checkout -- scripts/bench-setup-console.js` before
   committing anything.

## 1. Ben's combat and the scoped adversary sync

Ben, 2026-09-15: *"The ongoing combat can be removed in Foundry"* — the authorisation to delete his started combat so this
run can do the **scoped adversary sync of the Palewater Ford scene**. **Measure before you act:** at 49a's snapshot
(2026-09-15 16:19Z) the world already held **zero combats**, and Palewater Ford (`8bS0oH6P2jWjebvm`, the ACTIVE scene —
view it, never activate or deactivate it) held **zero tokens** — so there may be nothing left to delete, and nothing on
that scene for a sync to restamp. Re-read `game.combats` and that scene's tokens yourself.

- Palewater Ford is outside the `bench-run` skill's standing licence (the Playtest Map plus bench-created scenes); Ben's
  2026-09-15 message, relayed by the PM, is what licenses naming it in `scenes` for this sync. Confirm the scope in your
  brief before running it.
- The sync is hard rule 9's shape, dry run first: `edha.syncAllAdversaries({ actorIds: [...] /* or folder */, scenes:
  ["8bS0oH6P2jWjebvm"] })`, read the plan (the actor list and per-scene token counts), then the same call with
  `dryRun: false`. Never unscoped; never `allowStartedCombat: true`. At 49a all 41 world adversaries sat directly in the
  `Edha Adversaries` folder, legacy dungeon blocks included — a folder-wide call reaches every one of them, so read the
  dry run's list before running it for real.
- **Snapshot every scene's full token signature (including `sight`) and every actor's hash around the real call** —
  49a's snapshot (described in its delta and the runbook) is the pattern.
- **Most 156 rows do not need Ben's world copies at all.** 49a drove adversary rows on FRESH pack imports into
  `Bench Targets` (`game.actors.importFromCompendium(pack, id, { folder })`) — that reads the rebuilt pack directly and
  leaves Ben's copies alone. Use the scoped sync only for what a row genuinely needs from his copies.

## 2. The queue — 22 rows in two checklist sections

| Rows | Section | What they ask |
|---|---|---|
| **156-1 … 156-9** | "Corvaine + Riverlands bestiary pass — item 156, first nation" | fresh imports read the retune (Corvaine Raider, Line-Caller, Sergeant Halden Roek, Mistheron, Tollbird Flock, Surecat); the Well-Warden imports whole; Phantom Double's card carries the R-136 sentence; the re-derivations as a set in one `pack.getDocuments()` pass |
| **156-10 … 156-14** | "Corvaine + Riverlands rerun and the Thalendor Heartwood pass — R-137" | Rootling Swarm, Briar-Gone Grove, Crownox Ring and Reeve-Owl on the PC model; the twelve-block set from the rebuilt pack |
| **156-15 … 156-22** | the same section | each block ROLLS the model (the d20 and damage formulas the rows print); the Preacher of the Lowered Crown imports whole |

Most are sheet or card reads off a fresh import plus one roll each — batch them by block. **Read a roll's formula off the
card's own `.dice-formula` node or `msg.rolls[i].formula`, and remember the system adds the attribute + rank modifier to
the damage too (R-137)**: the rows print the `1d20 + N` / `1dX + N` to expect. Watch for TODO item 169's shape on
adversary abilities as well (a system damage roll beside an engine rule that deals the damage).

## 3. Still blocked — do not re-drive

- **Predator's Due on-defeat** — the heal passes, the whisper fails; **blocked on TODO item 88**, still open
  (`edha-triggered-effect` cards are public by construction). Re-drive only after item 88 lands.
- **FP-1** — waits on **R-141**.

## 4. Harness traps — each has produced or nearly produced a false result

- ⭐⭐ **`createEmbeddedDocuments` returns out of input order** (49a) — a label → id map built by index silently targets
  the wrong creature. Print each take's resolved target name.
- ⭐⭐ **Hover before a coordinate click**, and **keep click targets out of the `#chat-notifications` column** (49a); check
  `document.elementFromPoint(x, y).closest("#board")` before arming a pick and again right after.
- ⭐ **A missed pick stays armed** — cancel it with an Escape `keydown` on `window`; the engine refunds the cost (49a).
- ⭐ **The Advanced Cosmere Combat Tracker orders combatants by its own rule, not your initiatives** — read `combat.turns`
  after setup (49a). `combat.nextTurn()` does nothing under it; set `turn` directly (45).
- ⭐ **`deleteCombat` runs every scene-reset family over every directory actor, the players' actors included** — check
  the non-bench actors against the families' lists before deleting a bench combat (49a).
- **A skill-test talent with an item `damage.formula` rolls a system DamageRoll with Apply buttons on every use** (TODO
  item 169) — read damage off the engine's ⚡ card, never the system roll.
- **`Combat.create()` + `createEmbeddedDocuments("Combatant", …)` can duplicate a combatant** — dedupe by `tokenId` (46–48).
- **An unlinked token's writes land on the token's synthetic actor** — read `tokenDoc.actor` (45).
- **Awaiting `item.use()` deadlocks the tool call** — fire it with `void`, then click the dialogs by content (47).
- **A `javascript_tool` timeout does not cancel the script** — keep long flows in a page-side async task and poll it.
- **Pass `tabId: "seed"` on every browser call** — another agent can steal the active tab (45).

## 5. Standing lessons

- **Only claim what your own logs support, and label inferences as inferences.** 49a caught its own "Kneel resolved
  against the wrong creature" reading within one call, once it checked the token map — the defect was the harness.
- **Stage each row off the previous row's residue** — 49a's OM-3 left the Omen OM-4 needed, and IMM-1's Compelled Trooper
  was PW-2's clearing case.
- **Read the cards and toasts you did not come for** — all four of 49a's defects were read off text the rows were not
  asking about.
- **Log out as the last in-world act**, and confirm `Bench` is selectable on `/join`.
