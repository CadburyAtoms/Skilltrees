# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 7 (two deity trees: **Civilization, then Power**): join as Bench, health-check, then
re-run `scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines
expected; runs 5 and 6 were pure sync). The 23 bench tokens should still be placed at ORIGIN
(2100, 9000) — if `scene.tokens` has no `Bench*` tokens, re-run the placement leg at that ORIGIN
(the setup script's SPOTS map; grid is 300 px = 5 ft). Read `docs/EDHA_BENCH_RUNBOOK.md` — the
run-1 through run-5 operating lessons — before driving anything. **Load-bearing lessons, newest
first (they OVERRIDE older advice):**

* **`items.getName("<tree name>")` returns the PATH item when a capstone shares the tree's name**
  (run 6: "Sovereignty" — `use()` resolves false silently). Always
  `items.find(i => i.type === "talent" && i.name === X)`.
* **`displace` does NOT bypass snare/zone trigger Regions** — any token entry mode springs them
  (run 6). Stage victims BEFORE placing zones, or accept the spring.
* **ApplicationV2 sheet actions ignore synthetic `.click()`** — dispatch the full pointer
  sequence (pointerdown/mousedown/pointerup/mouseup/click) on `[data-action=use-item]` (run 6).
* **Consume-vs-roll dialog order varies per use** — walk BOTH kinds in a loop
  (`[data-action=continue]` then `[data-action=submit]`, whichever is present).
* **Cloned fixtures keep `prototypeToken.name`** — set BOTH `name` and `prototypeToken.name`
  (run 5).
* **`combat.update({turn})` DOES fire the system turn-change** when moving off an already-set
  turn — only add the manual `Hooks.callAll` when no watch fired (run 5).
* **Expect roster cross-talk cards mid-row** — the 15 always-on bench PCs' watches fire
  scene-wide, and run 6 adds: Ben's campaign **Corvaine adversaries' "Break" reaction cards fire
  on bench victim drops**. Check every stray card's named owner before attributing it.
* **`tokDoc.update({x, y})` is DEAD for movement** — `tokDoc.move({x, y, action: "displace"},
  {animate: false})` + `reset()`; `action: "walk"` for wall/Region rows.
* **Right-click cancel is a `contextmenu` event** on `#board`; click-to-place rows drive with the
  run-2 `canvas.mousePosition` descriptor trick.
* **`item.system.events` is a `RecordCollection`** — edit rules ONLY via the dot path.
* **Marker-ledger entries snapshot formulas at placement** — edit the document FIRST, then place.
* **`edha.skipBudget(true)`** around talent re-adds; **resource writes clamp to max**;
  **`actor.applyDamage([{amount, type}])` is the only honest console damage** — and note the
  bench adversary fixtures deflect 1–2, so tiny keen probes read as 0; use vital.
* Plus the standing ones: INACTIVE combats only (`ui.combat.initialize({combat})`, verify
  `game.combat.id`; Ben's live campaign combat `BerbNeuXp4iKduef` — leave it alone); chat is
  `ol.chat-log`; damage cards apply via `[data-action=apply-damage][data-multiplier='1']`; no
  screenshots while the pane is hidden — record quoted card text + console asserts. Tem parinaem
  and Soggy Bottom are untouchable.

**Deploy state — read before believing any bug.** The **07-27b ENGINE half is CONFIRMED LIVE**
(run 6 byte-checked the served blob: `edhaWatchEntryLevel`, `_edhaLifeClearBusy`, `chainBounded`,
`edhaOwnerListQueue`; the triple-drop harvest, Adaptive Mutation's gate and Apex Form's
one-injury all re-tested PASS at the table). The THREE pack halves are still owed (unchanged
since run 5): `foundry-build leyline` (Mender's note/range), `foundry-build deity` + re-forge
(2bY-7's Constructs ×3 — this matters for RUN 7: the live pack still reads `creatureType: ""`,
and an already-standing Construct keeps its old humanoid type until re-forged; also Surgical's
cosmetic rule text), `foundry-build adversaries` + re-imports (Flame Surge `damage.formula:
null` on both bosses; Herding Antlers 0 events). Do NOT run a pack build yourself; record those
rows BLOCKED-ON-DEPLOY unless a fresh console read proves a rebuild landed. ⚠ Civilization's
Construct rows (2bV-13/14/15, 2bP-8/9) sit closest to the deity-pack gap — read the summoned
Construct's `system.type`/creatureType fresh before judging any Construct row, and if the mint
is still "" treat construct-classification symptoms as BLOCKED-ON-DEPLOY, not new bugs.

**Open defects from run 6 — do NOT re-diagnose, do NOT fix mid-run; they are queued for
test-pass-fixes.** If Civilization or Power rows cross them, record the crossing: (1) **zone
trigger-Regions double-fire card+roll on token-movement entry** (one client, damage applies
once) — Bastion's enter-trigger (2bV-11) is the SAME surface family; if its save/impact posts
twice on one entry, cite the run-6 snare defect rather than opening a new family; (2) **Weave
the Thread's post-cost picker never appears** (Fate) — if any Civ/Power picker dialog (Trade
Routes' arrival click, Siege toggles) goes silent post-cost, note the resemblance; (3)
**Surgical Precision sheet-vs-console disagree + stale `_edhaLastRoll` capture** — any
skill_test talent whose outcome branch reads wrong, check whether the quoted total matches THAT
use's d20 before recording; (4) **Chaos sweep's `lists.omens` + off-canvas halves still dead**;
(5) **`tempHp` flags survive every scene reset** — sweep your own tempHp writes at cleanup.
Also still open: Shockwave Slam's weapon-hit trigger surface (run 1), 2bW-15, 2bW-1's two unrun
halves, and the rulings batch (Ben's): Raise-Dead-keeps-its-Remain, Fault-Line-spares-allies,
Walking-Ruin-indicator, mutation riders on a nat-1 graze, Unweaving's dispellable Omen marker,
roster cross-talk park — plus run 6's: **placement-under-a-creature insta-springs Snares**
(makes Foreknown's rider uncatchable; recommended default: arm, don't spring) and **Edict's THP
rider swept "17 ally(ies)"** (width per-design but worth a look).

Then run the two sections end-to-end:

* **BENCH — Civilization on Bench — Civilization:** priority **2bV-16** (Bonds of Community —
  the drift: manual HP edits no longer prompt; an enemy dropping inside a Foundation whispers
  the Reaction card, the click grants Foundation-standing allies Temp HP = White mod +
  advantage; a SUMMON drop must NOT prompt — clone adversary-typed victims, run-4 lesson). Then
  the Foundation family (2bV-10 lay/cancel/refund + turn-start +1 defenses + oldest-crumbles at
  tier; 2bV-11 Bastion pre-cost refusal, baked enter-save — ⚠ double-fire watch, Construct +2,
  fortified-while-Bastion-holds; 2bV-12 Trade Routes pre-cost refusal, ⇄ links, teleport with
  every cancel path refunding), the Construct family (2bV-13 Siege Form's pre-cost refusals +
  baked toggle + card-button end — ⚑ pre-07-17 Constructs need one reforge; 2bV-14 Arsenal's
  refusals, indicator AE from its own Effects tab, live→0 chase whisper; 2bV-15's OPEN half —
  Siege Cannon adds NEITHER bonus, and all of Magnum Opus; 2bP-8 sustain-one replacement;
  2bP-9 the no-flag name fallback), and ⚑ the Civ enemy-cost GO/NO-GO (report which resolver
  fired). Remember `getName` traps: "Civilization" is a path name here too.
* **BENCH — Power on Bench — Power:** priorities **2bH-2** (Absolute Authority's FAIL branch —
  the first `edha-test-fail` payload ever; a Weakened target + a failed Black test →
  Weakened-until-end-of-ITS-next-turn) and **2bH-5** (Crown of Thorns reacting to ANOTHER
  talent's test — spirit = Presence on a second card from Absolute Authority, Kneel, and
  Sovereignty's Censure/Decree if reachable: cross-tree via Bench — Sovereignty is fine) and
  **2bH-6** (Kneel's announcement path must still ping Crown; Crowned clears on combat delete).
  Then 2bH-1 (three rules on the tab + the not-compelled/frightened/weakened pre-cost refusal),
  2bH-3 (success card, no status), 2bH-4/7/8 (Crowned marker + re-use veto + manual ping
  button), 2bU-7 Kneel (pre-cost refusals, YOU roll Black, Compelled + closing-moves-only veto,
  auto-advantage vs Compelled/Frightened/Weakened in Black range), 2bU-8 Investiture of Command
  (ONE shared roll, keeps-higher Temp HP — mind the run-6 tempHp-survives-reset residual when
  asserting), 2bU-10 Momentum of Victory (arm + next-hit rider + re-use refusal), 2bU-11
  Warlord's Fury (tally whispers; PC/ally/summon drops must NOT count), 2bU-12 Unstoppable
  Advance (Slowed shrug, per-enemy drag impacts — ⚠ drag-through uses walk moves, double-fire
  watch), 2bU-13 Mantle (sceneOnce, +2 AE, ally +1 injector ⚑, redirect card), 2bU-14/2bU-16
  (Crown regression + Compelled cleanup), and 2bU-9's remaining open half (the
re-use-while-armed refusal).

**Standing observations to extend, not re-open:** the out-of-combat scope question (07-26k
characterization; run 6 added "Restrained until-your-next-turn never expires out of combat");
roster cross-talk (park proposal pending). If Civ/Power watches show the same patterns, ADD the
sighting to the rulings batch — don't re-derive it.

**Caveats:** multi-client rows stay ⚑ Ben. Do NOT fix anything mid-run — that is
`test-pass-fixes` work. Record per the skill: passing rows retire with one-line evidence, fails
get dated inline notes, feel/canvas rows stay ⚑, blocked rows say BLOCKED-ON-DEPLOY. **Scope
your end-of-run cleanup to an id-diff against your OWN start snapshot** — runs 4, 5 and 6 all
ended exactly empty; keep the streak. The 23 roster tokens stay placed. The run-1 orphan
`Combat Construct` token may still be on the Playtest Map — **leave it for Ben** (but note
2bP-9 may legitimately REPLACE it if Forge Construct's name-fallback finds it — if so, say so
explicitly in the delta, don't treat the disappearance as your cleanup bug). Bench Ally — One
carries pre-existing stale flags (`accord`, `aggro`, `bpHits`, `coordRound`) — leave them.
**Log out at the end** (`game.logOut()`) and confirm Bench is selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild,
gates (`python`, never `python3`; no `;`-chaining; never pipe a gate through `tail`), ONE pushed
commit titled `Bench run 7 (Civilization+Power): X retired on evidence, Y fails ->
test-pass-fixes`, and rewrite `docs/BENCH_NEXT_RUN.md` with the run-8 prompt (suggested:
**Knowledge + Order + Heroic**, or the test-pass-fixes batch first if Ben has run it — the fail
list is six families deep at this point: Shockwave Slam, Surgical's capture race, the Chaos
sweep halves, the Region double-fire, Weave's picker, the tempHp residual).
