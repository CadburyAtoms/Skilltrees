# Next bench session — run 50: no drivable 🤖 row is waiting; the queue is re-drives behind open fixes

> ⚠️ **Superseded in part at 15:20 ET the same day (the PM):** fix pass 13 (PR #398) and item 169's narrowed fix (PR #396) merged and were DEPLOYED — agent-run deploy 2026-09-15T19:20:26Z from main @ eedc939, engine `80042b86…` = HEAD, all five packs rebuilt, validators PASS. So run 50 **does** have a queue: the "Fix pass 13 — bench runs 48 + 49a's defects" section (CUE-161, CUE-161b, THORN-162, PACK-163, PACK-163b, SNAP-164, SYNC-168, LBL-171, VD-170), FP-1 (R-141 (a): the END of the target's next turn plus the card re-read) and item 169's 169-PWR and 169-DTH. Run the roster script (it refreshes the bench PCs) and, under PM-R17, the three players' actors' own ⟳ Sync Talents before the card rows. Predator's Due still waits on item 88; the ten talents held in item 169 wait on R-142.

> **Bench run 49b (2026-09-15) retired all twenty-two item-156 adversary rows on evidence** (156-1 … 156-22: the
> Corvaine + Riverlands pass and the R-137 rerun with the Thalendor Heartwood blocks), filed **two defects (TODO items
> 172–173)** and kept nothing open. Bench run 49a had drained the engine-wide queue the same day. **No deploy is owed by
> either run** (both DOCS-ONLY). The checklist now holds **two open 🤖 rows, and both are blocked** (below), plus two ⚑
> rows that are Ben's. So run 50 is not a queue-burning run: it re-drives whatever fixes have landed by then, and it
> starts by checking which have.

## Read this first

**→ `docs/handoff-changelog/2026-09.md`, the `2026-09-15 — Bench run 49b` delta** — every retirement with its evidence,
items 172–173, the harness findings, the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 49b"** — three of them change how you stage and read a row:
(1) a `scope: "scene"` watch (Whispered Doubt, Coercive Pressure) never fires out of combat — `edhaWatchCombatGate` needs a
combat holding the watcher, so an out-of-combat take reads like a dead rule; (2) `item.use({configurable: false})` is the
play button without the roll dialog (the consume dialog still opens), and its card carries the `.dice-formula` nodes a
`rollAttack` card lacks; (3) the v13 chat log is `.chat-log`, not `#chat-log`. Run 49a's lessons still apply (map created
tokens by `actorId`; hover before a coordinate click; keep clicks out of `#chat-notifications`; a missed pick stays armed).

## ⚑ vs 🤖

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

Never re-file an unrun 🤖 row as ⚑ because you ran out of time — leave it 🤖, or record it BLOCKED with the blocker named.
Judgment calls go to `EDHA_RULINGS.md`, never into the checklist as a new ⚑ row.

## ⛔ 0. Step zero

1. **Verify the deploy by hash, from both sides.** Both 49 runs measured `5e9833a9c8b7afc8…` (the deploy of main @ 7bd01c4,
   2026-09-15T11:19Z). If a fix below has merged since, a newer deploy should have moved it — compute it yourself:
   ```bash
   git show HEAD:module-src/scripts/register-skills.js | tr -d '\r' | sha256sum
   curl -s "http://localhost:30000/modules/edha-content/scripts/register-skills.js?cb=$(date +%s)" | tr -d '\r' | sha256sum
   ```
   Then read DEPLOY STATE in `EDHA_FOUNDRY_TEST_CHECKLIST.md` against `git log`. A fix merged but not deployed makes its
   re-drive NOT-DEPLOYED, never FAIL. (DEPLOY STATE's PR #390 note says Palewater Ford "holds a started combat" — stale:
   run 49b measured zero combats and zero tokens on that scene at 17:52Z.)
2. **THREE players' actors, refresh-only (PM-R17): `Tem parinaem`, `Soggy Bottom`, `Ishee`.** Snapshot all three with
   `toObject()` before any roster step and deep-diff them at the end. `scripts/bench-setup-console.js`'s `PROTECTED`
   list names Ishee on main (PR #392). A refresh is only worth doing after a pack rebuild.
3. **Serve the roster script to the page rather than transcribing it** (runbook, run 49b): a throwaway localhost server
   with `Access-Control-Allow-Origin: *`, a `fetch`, a sha256 compare against the file on disk, `new Function(txt)()`,
   then stop the server.

## 1. What is left

**Open 🤖 rows — both blocked, do not drive until the blocker clears:**
- **FP-1** (False Premise denies a Reaction) — waits on **R-141** in `EDHA_RULINGS.md` §L (its Reaction denial ends at the
  END of the target's turn while its card says the start) and on the fix the answer implies.
- **Predator's Due on-defeat** — the heal passes, the whisper fails; waits on **TODO item 88** (`edha-triggered-effect`
  cards are public by construction).

**Re-drives owed once each fix lands** — every item's "Done when" names its 🤖 row. Check `git log` / the TODO checkboxes
at the start of the run and drive only the ones that are both merged and deployed:
| Item | What the re-drive shows | Deploy class of the fix |
|---|---|---|
| **161** | a dead adversary's enemy-turn-start cue no longer posts (stage a dead rootling beside a living one — 49b staged living rootlings only) | ENGINE-ONLY, F5 |
| **162** | a Green creator standing in its own terrain takes no Thorn Field hazard | ENGINE-ONLY, F5 |
| **163** | Pack Hunter's banked advantage respects its target gate | ENGINE-ONLY, F5 |
| **164** | the Green 10 ft square lands on the clicked cell (49b's Grove click at world 850, 1250 made a region at x 800 – 1000, y 1200 – 1400 — read it against the fix's snap rule) | ENGINE-ONLY, F5 |
| **168** | ⟳ Sync Talents on a character carrying the system's basic actions reports no "not found" for them | ENGINE-ONLY, F5 |
| **169** | Entropy Strike / Volatile Strike cards carry no system Apply buttons and their ⚡ damage still lands | DATA, leyline + deity REBUILD + ⟳ Sync Talents |
| **170** | the Vital Diagnosis Diagnosed card's note agrees with its "+N vital" tail | DATA, deity REBUILD + ⟳ Sync Talents |
| **171** | a False Premise success card reads "… is No Reactions." (and `noactions` loses its "(Hollow Command)" suffix, if the fix takes that route) | ENGINE-ONLY, F5 |
| **172** | the Reeve-Owl at 3 / 3 Focus and the Grove's Draw Mana at 2 / 2 Investiture make no gain claim; below the cap they still do | ENGINE-ONLY, F5 |
| **173** | a Reeve-Owl hit on a creature that is not Isolated posts no Sapping Hex card; an Isolated hit still posts "… is Weakened" | ENGINE-ONLY, F5 |

**New rows will come from item 167** — the 42 flat-model adversary blocks migrate onto the PC attack model nation by
nation (R-135), and each nation pass files its own 🤖 section. Rows 156-1 … 156-22 are the template: statics off one
`pack.getDocuments()` pass, then every attack through `use({configurable: false})` and every cue by an honest
`applyDamage`.

## 2. Harness traps — each has produced or nearly produced a false result

- ⭐⭐ **A scene-scoped watch is silent out of combat** (49b) — create a combat holding the watcher and the subject first.
- ⭐⭐ **`createEmbeddedDocuments` returns out of input order** (49a) — map tokens by `actorId`; create one at a time when
  a row needs the ids.
- ⭐⭐ **Hover before a coordinate click**, and **keep click targets out of the `#chat-notifications` column** (49a); check
  `document.elementFromPoint(x, y).closest("#board")` before arming a pick.
- ⭐ **A Dread Presence control move must take the mover away from every ally on the canvas** (49b).
- ⭐ **A missed pick stays armed** — cancel it with an Escape `keydown` on `window`; the engine refunds (49a).
- ⭐ **The Advanced Cosmere Combat Tracker orders combatants by its own rule** — read `combat.turns` after setup and set
  `turn` directly (`combat.update({round, turn})`); it fires `combatTurnChange` (45, 49a, 49b).
- ⭐ **`deleteCombat` runs every scene-reset family over every directory actor** — read the non-bench actors' flags and
  statuses against the eleven families' lists before deleting a bench combat (49a, 49b: no match either time).
- **A `rollAttack` card has no dice DOM** — read `msg.rolls` or roll through `use({configurable: false})` (49b).
- **The v13 chat log is `.chat-log`** — `#chat-log` selects nothing (49b).
- **An unlinked token's writes land on the token's synthetic actor** — read `tokenDoc.actor`; every pack import is
  unlinked (45, 49b).
- **Awaiting a `use()` that opens a dialog deadlocks the tool call** — fire it, poll the dialog by content, click
  `continue` (47, 49b).
- **A `javascript_tool` timeout does not cancel the script** — keep long flows in a page-side async task and poll it.
- **Pass `tabId: "seed"` on every browser call** — another agent can steal the active tab (45).

## 3. Standing lessons

- **Only claim what your own logs support, and label inferences as inferences.** 49b suspected a dead defense field in the
  phantom cast from reading the source, checked it live before writing anything, and it was wrong (`.value` reads 14 / 16).
- **Stage each row off the previous row's residue** — 49b's in-combat Whispered Doubt take shared its combat with the
  Territorial Instinct rows and the Well-Warden's Hollow Command expiry.
- **Read the cards and toasts you did not come for** — both of 49b's defects came from cards the rows were not asking
  about.
- **Log out as the last in-world act**, and confirm `Bench` is selectable on `/join`.
