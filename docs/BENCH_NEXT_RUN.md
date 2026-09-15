# Next bench session — run 51: no drivable 🤖 row is waiting; the queue is re-drives behind open fixes

> **Bench run 50 (2026-09-15) retired all twelve rows it was given on evidence** — fix pass 13's CUE-161, CUE-161b,
> THORN-162, PACK-163, PACK-163b, SNAP-164, SYNC-168, LBL-171 and VD-170, FP-1 on R-141 (a), and item 169's 169-PWR
> and 169-DTH — filed **one defect (TODO item 176)** and kept nothing open. **No deploy is owed by this run**
> (DOCS-ONLY). The checklist's one open 🤖 row is blocked (below), plus the ⚑ rows that are Ben's. So run 51 is not a
> queue-burning run: it re-drives whatever fixes have landed AND been deployed by then, and it starts by checking which
> have.

## Read this first

**→ `docs/handoff-changelog/2026-09.md`, the `2026-09-15 — Bench run 50` delta** — every retirement with its evidence,
item 176, the harness findings, the world diff.

**→ `docs/EDHA_BENCH_RUNBOOK.md`, "Operating lessons from run 50"** — three of them change how you stage a row:
(1) step a combat ONE turn at a time for any turn-start or turn-end tick — a `combat.update({round, turn})` jump that
skipped a combatant's turn fired a hazard on it; (2) engine functions are not page globals — compute geometry yourself
and restore a staging write inside the same task; (3) a dealer-less kill in a started combat belongs to the current
combatant, so its on-defeat rules fire. Runs 49a and 49b still apply (map created tokens by `actorId`; hover before a
coordinate click; a scene-scoped watch needs a combat holding the watcher; the chat log is `.chat-log`).

## ⚑ vs 🤖

- **`🤖` = needs a live Foundry table, and an agent drives it. THIS IS YOUR QUEUE.**
- **`⚑` = Ben's judgment only.** Leave it alone.

Never re-file an unrun 🤖 row as ⚑ because you ran out of time — leave it 🤖, or record it BLOCKED with the blocker named.
Judgment calls go to `EDHA_RULINGS.md`, never into the checklist as a new ⚑ row.

## ⛔ 0. Step zero

1. **Verify the deploy by hash, from both sides.** Run 50 measured `80042b86dccdbd7b…` (the agent-run deploy of main @
   eedc939, 2026-09-15T19:20Z). If a fix below has merged since, a newer deploy should have moved it — compute it
   yourself:
   ```bash
   git show HEAD:module-src/scripts/register-skills.js | tr -d '\r' | sha256sum
   curl -s "http://localhost:30000/modules/edha-content/scripts/register-skills.js?cb=$(date +%s)" | tr -d '\r' | sha256sum
   ```
   Then read DEPLOY STATE in `EDHA_FOUNDRY_TEST_CHECKLIST.md` against `git log`. A fix merged but not deployed makes its
   re-drive NOT-DEPLOYED, never FAIL.
2. **THREE players' actors, refresh-only (PM-R17): `Tem parinaem`, `Soggy Bottom`, `Ishee`.** Snapshot all three with
   `toObject()` before any roster step and deep-diff them at the end. Run 50 refreshed all three after the 19:20Z
   rebuild; another refresh is only worth doing after a newer pack rebuild.
3. **Serve the roster script to the page rather than transcribing it** (runbook, run 49b): a throwaway localhost server
   with `Access-Control-Allow-Origin: *`, a `fetch`, a sha256 compare against the file on disk, `new Function(txt)()`,
   then stop the server.

## 1. What is left

**Open 🤖 rows — blocked, do not drive until the blocker clears:**
- **Predator's Due on-defeat** — the heal passes, the whisper fails; waits on **TODO item 88** (`edha-triggered-effect`
  cards are public by construction).

**Re-drives owed once each fix lands** — every item's "Done when" names its 🤖 row. Check `git log` and the TODO
checkboxes at the start of the run and drive only the ones that are both merged and deployed:

| Item | What the re-drive shows | Deploy class of the fix |
|---|---|---|
| **172** | the Reeve-Owl at 3 / 3 Focus and the Grove's Draw Mana at 2 / 2 Investiture make no gain claim; below the cap they still do (run 50 saw Draw Mana print "recover 3 Investiture" at a full pool twice more) | ENGINE-ONLY, F5 |
| **173** | a Reeve-Owl hit on a creature that is not Isolated posts no Sapping Hex card; an Isolated hit still posts "… is Weakened" | ENGINE-ONLY, F5 |
| **176** | a Chain Detonation kill with no creature within 5 ft of the body posts no damage card; one with a creature in radius still damages and names it (Bench — Red must be the killer: controlled, or the current combatant) | ENGINE-ONLY, F5 (lands with 173) |
| **88** | Predator's Due's on-defeat instruction stops leaking to the table (then re-drive the blocked row above) | per the item |
| **178** (closes 169 + 174) | once item 178 lands (R-142 (a): the formulas stay, and a field on the talent's own rule suppresses the system's damage roll): the ten held talents (Volatile Strike, Cascade Collapse, Entropy Strike, Isolating Pressure, Isolating Ruin — attack context; Unravel Everything, Unstoppable Advance, Cascading Failure, The Unmooring, Necrotic Cascade — colour) lose their decoy damage rolls without losing attack context or colour, and Killing Blow's and The Final Study's own tests count as attacks again | ENGINE, F5 + leyline and deity REBUILD + ⟳ Sync Talents |

**Rulings that gate work:** none open. R-142 and R-143 were answered (a) on 2026-09-15, R-143 with four caveats, and
filed in `EDHA_RULINGS.md` §K.19; their builds (items 178 – 181) wait on item 177, the `cosmere-rpg` 3.1.0 upgrade,
and bring their own rows.

**New rows will come from item 167** — the 42 flat-model adversary blocks migrate onto the PC attack model nation by
nation (R-135), and each nation pass files its own 🤖 section. Rows 156-1 … 156-22 are the template: statics off one
`pack.getDocuments()` pass, then every attack through `use({configurable: false})` and every cue by an honest
`applyDamage`.

## 2. Harness traps — each has produced or nearly produced a false result

- ⭐⭐ **Step a combat one turn at a time** (50) — a jump over a combatant's turn fired a turn-start hazard on it twice.
- ⭐⭐ **Engine functions are not page globals** (50) — `edhaAdjacent` is a `ReferenceError`; restore staging writes in
  the same task's `finally`.
- ⭐⭐ **A scene-scoped watch is silent out of combat** (49b) — create a combat holding the watcher and the subject first.
- ⭐⭐ **`createEmbeddedDocuments` returns out of input order** (49a) — map tokens by `actorId`; create one at a time
  when a row needs the ids.
- ⭐⭐ **Hover before a coordinate click**, and **keep click targets out of the `#chat-notifications` column** (49a) —
  measure its rect each run (50: x 1236–1536 at 1600×1000); check `document.elementFromPoint(x, y).closest("#board")`.
- ⭐ **A dealer-less kill in a started combat belongs to the current combatant** (50) — its on-defeat rules fire.
- ⭐ **Run the delete-combat safety check before every bench combat delete** (49a, 49b, 50) — the eleven scene-reset
  families against non-bench actors, unlinked tokens on other scenes, and Fate / Charges world props.
- ⭐ **An unexpected `2d20kh` may be the tester's own rider** (50) — Calculated Patience on a slow turn.
- ⭐ **A missed pick stays armed** — cancel it with an Escape `keydown` on `window`; the engine refunds (49a).
- ⭐ **The Advanced Cosmere Combat Tracker orders combatants by its own rule and starts at `turn: null`** — read
  `combat.turns` after setup and set `turn` forward (45, 49a, 49b, 50); its row renders a `toggleDefeated` skull (50).
- **A `rollAttack` card has no dice DOM** — read `msg.rolls` or roll through `use({configurable: false})` (49b).
- **The v13 chat log is `.chat-log`** — `#chat-log` selects nothing (49b).
- **An unlinked token's writes land on the token's synthetic actor** — read `tokenDoc.actor`; every pack import is
  unlinked (45, 49b).
- **Awaiting a `use()` that opens a dialog deadlocks the tool call** — fire it, poll the dialog, click
  `button[data-action="continue"]` (47, 49b).
- **A `javascript_tool` timeout does not cancel the script** — keep long flows in a page-side async task and poll it.
- **Pass `tabId: "seed"` on every browser call** — another agent can steal the active tab (45).

## 3. Standing lessons

- **Only claim what your own logs support, and label inferences as inferences.** Run 50 measured the skipped-turn
  extra ticks, confirmed a same-round step fires once, and recorded the counts without inventing a mechanism.
- **Read the cards and toasts you did not come for** — run 50's defect (item 176) came from a card no row asked about.
- **Stage each row off the previous row's residue, but restore bench state inside the same task** — a thrown task left
  a bench ally at 0 HP until the rerun.
- **Log out as the last in-world act**, and confirm `Bench` is selectable on `/join`.
