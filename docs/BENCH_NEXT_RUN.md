# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
**BENCH RUN 9 — THE FINAL SWEEP**: every `# BENCH —` row the marathon has not reached, plus the rows a
landed fix unblocked. Runs 1–8 cleared the five leyline colors and all ten deity trees; what is left is
**Heroic (the biggest single section), the Engine-wide & cross-tree remainder, the leyline/deity
leftovers, and the adversary sections**. Join as Bench, health-check, then re-run
`scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines expected; runs 5–8
were all pure sync — run 8's log read `synced 25 | talents 25` for each leyline PC, `9 | 9` for each
deity PC, `62 | 62` for Heroic). The 23 bench tokens should still be placed: run 8 returned every one of
them to its start coordinate, the PC column at ORIGIN (2100, 9000) stepping down by 300 px, allies and
targets in the lower-left room. If `scene.tokens` has no `Bench*` tokens, re-run the placement leg at
ORIGIN (2100, 9000). Read `docs/EDHA_BENCH_RUNBOOK.md` — the run-1 through run-8 operating lessons —
before driving anything. **Load-bearing lessons, newest first (they OVERRIDE older advice):**

* ❌ **Verify the deploy by HASHING the served engine, not by counting markers.** Fetch
  `/modules/edha-content/scripts/register-skills.js?bc=<now>`, `replace(/\r\n/g,"\n")`, SHA-256, and
  compare to the repo file normalised the same way. Run 8's own prompt carried two WRONG expected
  counts. Run 8 measured `9a5b2d4e6a23eeec25241cef3e1236ae8bfa2bf9c91c02ba7111f412014a4bc9`; if the
  live hash differs from the repo's, Ben has not synced — say so instead of failing rows.
* ❌ **Snapshot per-actor ACTIVE EFFECTS at run start, not just document ids and flags.** Run 8's
  cleanup swept statuses by id across every placed token and deleted four effects that pre-dated the run
  off Ben's campaign adversaries; only two could be identified well enough to restore. Diff effects the
  way you already diff ids, and delete only what you added.
* **Turn-start watches do not share a hook.** Accumulate fires on `combat.update({turn})`; Foundation/Civ
  fires on `flags.cosmere-rpg.activated` → true. Try one, then the other; record which worked.
* **`RollConfigurationDialog` / `AttackConfigurationDialog` submit is `data-action="submit"`, label
  "Roll", and the window has NO footer** — a walker keyed on `continue|confirm|ok` leaves attack rolls
  hanging silently. This matters enormously in Heroic, which is almost all attack rows.
* **`edhaDealerOf`'s 15 s window runs from the damage ROLL** — roll and `applyDamage` in the SAME exec or
  every on-hit rider reads as dead.
* **A negative needs a positive control in the same round** (a once-per-round gate and a
  "forced-movement doesn't count" gate produce identical silence — run 8 recorded 2bV-2's forced-slide
  half UNPROVEN rather than claim it).
* **A card that prints a count may be printing INTENT** — assert the document field when a number matters.
* **The `Bench Ally — *` fixtures carry NO weapons**; use another bench PC as the ally attacker and expect
  its own on-hit cards (Bench — Heroic fires five per hit — which for THIS run is the point, not noise).
* Plus the standing ones: `tokDoc.move()` throws a cosmetic `#panCanvas … clientWidth` error when the
  moved token is CONTROLLED and the pane is hidden — **the write already landed** (release, catch, verify
  `td.x/td.y`); never resolve a token by NAME when duplicates exist (use `actorId`/`id`); with the pane
  hidden the ChatLog renders NOTHING — hand-render `await msg.renderHTML()` into `ol.chat-log` before any
  `[data-message-id]` selector; the sheet's `use-item` needs a real `PointerEvent`; system attack cards
  have EMPTY `content`; INACTIVE combats only (`ui.combat.initialize({combat})`, verify `game.combat.id`;
  Ben's live campaign combat `BerbNeuXp4iKduef` — leave it alone); right-click cancel is a `contextmenu`
  on `#board`; click-to-place uses the `canvas.mousePosition` descriptor trick; a DialogV2 `cancel`
  BUTTON cannot be driven synthetically (drive the header X, same `!picked` branch, and say which);
  `item.system.events` is a `RecordCollection` (dot paths only); marker-ledger entries snapshot formulas
  at placement; `edha.skipBudget(true)` around talent re-adds; **resource writes clamp to max — top up
  between uses**; hook `ui.notifications.warn/info/error` at run start (pre-cost vetoes live only there);
  keep each exec under ~25 s. Tem parinaem and Soggy Bottom are untouchable.

**Re-tests: the ONE fix batch owed HAS LANDED — 2026-07-27h, ENGINE-ONLY (F5, no rebuild, no ⟳ Sync).
Run it FIRST, before the worklist.** The counter economy moved off `effect.system.count` (a field the
cosmere `ActiveEffectDataModel` does not have — its schema is exactly `isStackable` + `stacks`, so every
read was 0) onto **`system.stacks`**, and `edha-damage-bonus` no longer gates its `placeCounter` /
`placeList` write on a non-zero bonus. Three things to do before reading any Knowledge row:

1. **Byte-check** as usual (hash the served engine), and confirm the markers: `edhaEffectStacks` ×2,
   `"system.stacks"` ×2, `stacks: 1` in the status registration, and **no `system.count` in code**. The
   07-27g hash `9a5b2d4e…14a4bc9` is now STALE by design — expect a different hash and compare against
   the repo file, never against a remembered number.
2. **Clear every leftover `Insight` marker** on the bench targets first. Effects the old engine wrote
   stored nothing, so the system's own `stacks ?? 1` default makes them read as **1** — honest for that
   document, but not what any old card claimed. Start from no marker.
3. **The re-run of `bench-setup-console.js` is now load-bearing, not just an idempotency check.** The
   script chose the roster's weapons off the same dead `system.range`, so `rangedW` was NEVER assigned
   and **no bench PC has ever had a ranged weapon** — every rangedOnly row of the last eight runs was
   run without one. It now reads `system.attack.type` and warns if no ranged weapon exists in any pack.
   Confirm `weapon.system.attack.type === "ranged"` on Bench — Heroic before **2bX-16** (Tagging Shot)
   and before any melee/ranged stand-down half.

Then the six re-opened Knowledge rows, each with a number to read off the DOCUMENT and not the card:
**2bT-1** (`effect.system.stacks` is 2, the effect is *named* `Insight [2]`, and the card's number
agrees), **2bT-3** (success ×count — compare a 3-Insight bearer against a 1-Insight one, they have never
differed; failure leaves count−1 and prints "(now 2)"), **2bT-6** (kill a 4-Insight bearer → the
whispered `floor(count/2)` offer says **2**; at 1 Insight `floor(1/2)=0` and NO card is correct),
**2bT-7** (kill a 3-Insight bearer → the FULL-count card offers 3 alongside the ally burst; click both
transfer cards in each order for R9's last-click-wins), **2bT-8** (tick 1→2→3→4→5, then the sixth tick
posts NOTHING; then edit `capFormula` on the Events tab and watch the ceiling move), **2bT-10** (R10:
both riders post additively as two cards; R11: each places once per round, independently — and the new
ruling default means The Pack still places when its bonus is 0, so drive the hand-cleared-marker case
once). **The gate row at the top of the Knowledge section is the stop-if-it-fails row** — if the stored
`stacks` is not what the card says, everything below it is meaningless.

**Deploy state — read before believing any bug.** ENGINE: **07-27b, 07-27d and 07-27f are ALL CONFIRMED
LIVE** (run 8 hash-verified the whole file); **07-27h is NEW and needs only Ben's usual engine sync +
F5** — verify it by hash and by the markers above, and if it is missing, say so and skip the counter
re-tests rather than re-reporting run 8's symptoms. **THREE pack halves are still owed, unchanged since
run 5** — do NOT run a pack build yourself, and record these BLOCKED-ON-DEPLOY unless a fresh console
read proves otherwise:
- `foundry-build leyline` + ⟳ Sync (Mender's Instinct's note + green range gate) — gates **2bS-1**.
- `foundry-build deity` + ⟳ Sync + re-forge (the Construct `creatureType` mint; also Surgical
  Precision's cosmetic rule text). Note it gates **nothing** in Civilization, whose predicate is
  flag-based; the only reader is Fault Line's `constructMult`.
- `foundry-build adversaries` + ⟳ Sync + re-drag the Fellstag (Herding Antlers, 0 events) + re-import
  BOTH bosses (Flame Surge `damage.formula: null`) — gates several adversary rows below.

## THE WORKLIST — every `# BENCH —` row still open, by section

Work it in this order. Row ids are the checklist's; ⚑ marks a row the checklist already reserves for
Ben (feel, canvas precision, multi-client) — **read those, do not drive them**, and leave them in place.

**1 — `BENCH — Engine-wide & cross-tree` (run FIRST; if 2bA-7's successor rows show the edit round-trip
broken, STOP and report).** Open: **2bAC-2 · 2bA-6 · 2bB-8 · 2bM-1 · 2bL-13 · 2bT-19 · 2bQ-6 · 2bE-8 ·
2bP-6 · 2bP-7**, plus the un-numbered rows *"GM summon relay (as a PLAYER without actor-create)"*,
*"Withering Ray skill test"*, and *"The 10 recovered talents show behaviour again"*. ⚑ in this section:
2bAC-1, 2bL-14, 2bE-9, the Injury-tool/Raise-Dead row, the formula-bar row, the engine-move-collision
row, the Flame-Surge/burst-cards row, and *"Nothing else lost its rules"*. **2bM-1 is a no-GM row → ⚑.**

**2 — `BENCH — Heroic paths` (the big one; run on `Bench — Heroic`, which already carries exactly these
talents).** Priorities in the section header: **2bE-7** (first H1 payload with real mechanics — if the
payload dispatch is broken this is where it shows), **2bE-4** (the first thing `edha-combat-timing` has
ever run), **2bJ-12** (the on-hit dispatcher), **2bO-7** (the damage-roll half Pack Hunting always
promised), **2bD-3** (the nothing-spent veto), **2bZ-9** (the first authored NATIVE rule). Then, in
checklist order: **2bE-3 · 2bE-5 · 2bD-7 · 2bO-1 · 2bO-5 · 2bN-2 · 2bN-3 · 2bC-7 · 2bQ-4 · 2bQ-5 ·
2bF-13 · 2bF-15 · 2bM-2 · 2bX-15 · 2bX-16 · 2bX-17 · 2bZ-11 · 2bZ-5 · 2bZ-6 · 2bZ-7 · 2bZ-8 · 2bA-8**,
and the five collapsed like-for-like rows **2bB-1/2/5/6/9 · 2bE-1/2/6/10 · 2bD-1/4/5/6 ·
2bM-3/4/5/7/11 · 2bN-1/4/5 + 2bO-2 + 2bN-6**, plus the un-numbered *"On-hit riders"*, *"Orphan-token
combat guard (07-18i)"* and *"Four silently-dead prereqs now bite"* rows. ⚑ in this section: 2bC-1,
2bB-4, 2bF-14/2bF-5, 2bF-16, 2bM-6. **Run-8 sighting to fold in, not re-derive:** `Bench — Order` was a
combatant in a bench combat that was created and deleted, and a pre-existing `Determined` icon on it
survived the deletion — relevant to **2bN-3** (Rousing Presence's Determined must clear when combat
ends). Treat it as a lead, not a result; the icon's provenance is unknown.

**3 — leyline leftovers.** White: **2bR-10 · 2bR-17** (Callthief's Counterpoint) — ⚑ the burst-only row
and the five-restored-adversary-abilities row. Blue: **2bF-17** (Surecat) **· 2bJ-3 · 2bAA-8** — ⚑
2bAA-6, ⚑ 2bAA-9 (its two Seeming copies). Black: **2bI-9 · 2bZ-10** (its two unbenched copies) — ⚑
2bI-4, 2bI-6, 2bJ-10. Red: **2bA-5**, plus *"Red spot-checks (like-for-like)"* and *"Red / Momentum is
takeable"* — ⚑ the Flashpoint row. Green: **2bS-11 · 2bS-3**, plus *"Green spot-checks"* — **2bS-1 is
BLOCKED-ON-DEPLOY** (the leyline pack half).

**4 — deity leftovers.** Destruction: **2bY-7** (⚑ the Walking Ruin indicator row). Chaos: ⚑ 2bU-5/2bU-3
only. Death: **2bW-1** (⚑ the Raise Dead row). Civilization: ⚑ the enemy-cost ruler row (answered GO at
resolver level — Ben's canvas half). Knowledge: the six re-opened rows are the re-test batch at the TOP
of this prompt, no longer gated — run them first, not here.
Order: **2bV-2's forced-slide negative** (needs a FRESH round between the walk and the slide — run 8
could not separate it from the once-per-round gate), **2bV-6's** zero-Covenant refusal + re-use refusal +
the per-ally +Presence rider, **2bV-8's** advantage injection and its wall/hostile-attacker block, the
**Order quiet cases** (2bL-9 crossing scenes, 2bL-12's three silent cases) — and ⚑ **2bL-7**, which needs
a second Order PC.

**5 — the adversary sections** (the long tail after Heroic; almost entirely ⚑ but not entirely).
Non-⚑ and drivable: **2bAB-1 · 2bAB-8**, plus the un-numbered *"The Old Agreement — text-only"*,
*"Pack Doctrine — no automation by design"*, *"Seize and Roll: no cue by design"*, *"Drag Under / Slip
the Sound: no cue by design"*, *"The Tithe Takes the Failing — no automation by design"* (these four are
NO-NAMEABLE-HOOK confirmations: verify the item genuinely has no events and move on), and the
folder/drag/mirror rows that only need a post-deploy look. ⚑ 2bAB-4/5/6/7/9/10 and the ~150 per-adversary
ability rows are Ben's. **Several adversary rows are BLOCKED-ON-DEPLOY** behind the owed
`foundry-build adversaries` — check the pack read before failing any of them (Herding Antlers = 0 events,
Flame Surge `damage.formula: null`).

**Families carried the whole marathon** — mention them in the delta whether or not you touch them:
**Shockwave Slam's weapon-hit trigger surface** (run 1's FAIL, still open) and the **standing
out-of-combat scope characterization** (07-26k; run 6 added Restrained-never-expires, run 7 added
Absolute Authority's Weakened landing with `duration.type: "none"`, run 8 added Final Decree binding
every hostile token on a shared map). If Heroic shows the same patterns, ADD the sighting.

**Caveats.** Multi-client rows stay ⚑ Ben (2bL-7's two-Order-PC row, 2bM-1's no-GM row, the client-veil
rows in the Blue/Seeming block). Do NOT fix anything mid-run — that is `test-pass-fixes` work. Record per
the skill: passing rows retire with one-line evidence, fails get dated inline notes, feel/canvas rows
stay ⚑, blocked rows say BLOCKED-ON-DEPLOY. **Scope end-of-run cleanup to a diff against your OWN start
snapshot — ids, per-actor `flags["edha-content"]`, AND per-actor active effects** (run 8's id-diff was
exactly empty for the fifth run running, but its effect sweep damaged the table's state because it had no
effect snapshot to diff against). The 23 roster tokens stay placed. The run-1 orphan `Combat Construct`
token at (7500, 4800) is a dangling reference to a deleted actor — leave it for Ben, do not treat it as
testable. `Bench Ally — One` carries pre-existing stale flags (`bpHits`, `accord`, `coordRound`) and
`Bench — Order` / `Bench — Red` carry pre-existing `Determined` icons — leave all of them. Ben may want
two effects re-applied that run 8 could not identify: one `Weakened` among Cinderhound
`E0pMS7z6qdt8O15p` / `NLdImS8EUcxb9jJC`, and one `Prone` among Mutated Thrall `BUEIUVatYUfVqYb2` /
`qJ3sfPuqJZqod0xa` / `9opSkrFMBMjaWPVr`. **Log out at the end** (`game.logOut()`) and confirm Bench is
selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild, gates
(`python`, never `python3`; no `;`-chaining; never pipe a gate through `tail`), ONE pushed commit titled
`Bench run 9 (final sweep): X retired on evidence, Y fails -> test-pass-fixes`, and rewrite
`docs/BENCH_NEXT_RUN.md`. **If run 9 genuinely closes the last drivable row, say so and make the next
prompt the playtest-1 / §9f balance-review handoff instead of a run 10** — enumerate what is left as ⚑
Ben-only so he can see the whole remaining surface in one list.
