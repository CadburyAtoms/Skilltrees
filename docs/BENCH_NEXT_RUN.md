# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 6 (two deity trees: **Fate, then Sovereignty**): join as Bench, health-check, then
re-run `scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines
expected; run 5's re-run was pure sync). The 23 bench tokens should still be placed at ORIGIN
(2100, 9000) — if `scene.tokens` has no `Bench*` tokens, re-run the placement leg at that ORIGIN
(the setup script's SPOTS map; grid is 300 px = 5 ft). Read `docs/EDHA_BENCH_RUNBOOK.md` — the
run-1 through run-5 operating lessons — before driving anything. **Load-bearing lessons, newest
first (they OVERRIDE older advice):**

* **Cloned fixtures keep `prototypeToken.name`** — clone-actor staging must set BOTH `name` and
  `prototypeToken.name`, or `scene.tokens.find(t => t.name === …)` misses the new token (run 5).
* **`combat.update({turn})` DOES fire the system turn-change** when moving off an already-set
  turn — only add the manual `Hooks.callAll("combatTurnChange", …)` when an update produced no
  watch fire, or turn-start rows double-post (run 5 double-ticked a regen this way).
* **Expect roster cross-talk cards mid-row** — the 15 always-on bench PCs' watches fire
  scene-wide out of combat: Breaking Point (Red) disoriented run-5 targets on other actors'
  hits, Devoted Conduit (White) ATE a Lifeline spirit self-hit, Mender's/Shared Burden/Voice of
  Authority offer-cards interleave constantly. Never attribute a stray card to the talent under
  test; check the card's named owner first.
* **`tokDoc.update({x, y})` is DEAD for token movement** — use
  `tokDoc.move({x, y, action: "displace"}, {animate: false})` + `tokDoc.reset()`; `action:
  "walk"` when a row needs wall collision or Region triggers (`move()` returning `false` on a
  wall refusal is itself an assertion).
* **Right-click cancel is a `contextmenu` event** on `#board`, not a `button: 2` pointerdown.
* **`item.system.events` is a `RecordCollection`** — edit rules ONLY via the dot path
  `"system.events.<ruleId>.handler.<field>"`; writing an array back is a silent no-op.
* **Marker-ledger entries snapshot formulas at placement** — edit the document FIRST, then
  place, then spring/detonate.
* **`edha.skipBudget(true)`** around any talent re-add; **resource writes clamp to max**;
  **`actor.applyDamage([{amount, type}])` is the only honest console damage**.
* Plus the standing ones: INACTIVE combats only (`ui.combat.initialize({combat})`, verify
  `game.combat.id`; Ben keeps a live campaign combat open — leave `BerbNeuXp4iKduef` alone);
  chat is `ol.chat-log`; `item.use()` blocks on the ItemConsumeDialog
  (`[data-action=continue]`, then `[data-action=submit]` for a roll); damage cards apply via
  `[data-action=apply-damage][data-multiplier='1']` — the LAST button is HEAL; no screenshots
  while the pane is hidden, so record quoted card text + console asserts. Tem parinaem and
  Soggy Bottom are untouchable.

**Deploy state — read before believing any bug.** The **07-26n ENGINE half is CONFIRMED LIVE**
(run 5 verified the served blob: `edhaOwnerListQueue` + the new `edhaIsConstruct` + the
`creatureType` mint; the Remains-race queue fix passed at the table). **The 07-27b ENGINE half
(run 5's five fixes) needs Ben's `module-src-sync` + F5 — byte-check the served
`register-skills.js` for `edhaWatchEntryLevel` AND `_edhaLifeClearBusy` before running any
07-27b re-test; if absent, mark them BLOCKED-ON-DEPLOY and move on.** The THREE pack halves are
still owed (all re-confirmed stale by run-5 fresh compendium reads): `foundry-build leyline`
(Mender's note/range), `foundry-build deity` + re-forge (2bY-7's Constructs ×3 — live pack still
reads `creatureType: ""`; it now also carries Surgical Precision's cosmetic rule-description
truthing), `foundry-build adversaries` + re-imports (2bAB-1 Flame Surge still `damage.formula:
null` on both bosses; Herding Antlers still 0 events). Do NOT run a pack build yourself; record
their rows BLOCKED-ON-DEPLOY unless a fresh console read proves a rebuild landed. Check the
letter above 07-27b before starting.

**OPEN WITH THE 07-27b RE-TESTS (run 5's four defects + the Chaos sweep are FIXED — engine sync
+ F5 first; do NOT re-diagnose, the verified causes are in the 07-27b delta):** (1) the
simultaneous-harvest triple drop — all THREE drops now dispatch (three ✨ cards, counts then
eviction at cap 2; the cascade must not re-detonate off nested kills) — row in BENCH — Death;
(2) **2bW-12** Adaptive Mutation's pre-cost once-per-creature refusal + the stale-card belt; (3)
**2bW-13** Apex Form's scene end mints exactly ONE injury — meaningful only with BOTH GM clients
connected (the cause was two GM clients behind a raw-isGM gate, NOT a double moment); (4)
**2bW-15** Surgical Precision — success posts the cleanse, a GRAZE posts the whispered
no-cleanse note (engine-decided; it was never a bench artifact — try sheet + console, they must
agree); (5) the Chaos residual (c) sweep — combat delete now clears `lists.omens`, off-canvas
bearers' markers, and `trigRound`. Also still open: Shockwave Slam's weapon-hit trigger surface
(run 1), and the rulings batch (Ben's): Raise-Dead-keeps-its-Remain, Fault-Line-spares-allies,
Walking-Ruin-indicator, mutation riders on a nat-1 graze, Unweaving's dispellable Omen marker,
and the roster cross-talk park (triage verdict 07-27b: NO re-post mechanism exists — the
"stale prompt" cards are fresh event-driven offers from the 15 always-armed bench PCs).

Then run the two sections end-to-end:

* **BENCH — Fate on Bench — Fate:** the biggest remaining deity section (17 rows). Priorities
  per the preamble: **2bX-14 / 2bAA-5** (scene reset — a missed key silently leaves a live
  ledger; end a combat with squares, snares, marks, links, buffs all live and confirm BOTH
  ledger keys, templates, Regions, AEs and markedBy keys clear). Then the placement family
  (2bX-1 Ordained Ground's NEW range gate + refund paths, 2bX-2 Snare cap with oldest-fizzle,
  2bAA-1 the ledger repoint), the spring family (2bX-3 both directions + the DOCUMENT formula —
  edit it FIRST then re-place, per the snapshot lesson; 2bX-4/5 Inevitable Snare's pre-cost
  refusal, flag, extra die off its OWN formula + SPD-vs-Green Disorient), the buff/watch family
  (2bX-6 Hexmark, 2bX-7/2bAA-3 Bulwark's turn-start AE + advantage-neutralize, 2bX-9/2bAA-2
  Weave's linked-square Reactive-Strike prompt), the movers (2bX-10/2bAA-4 Read the Threads —
  post a FRESH marker card, old ones say "That marker is gone"), and the capstones (2bX-11
  Foreknown Strike's per-snare buttons, 2bX-12 Thread of Inevitability's resolve-all +
  sceneOnce). 2bX-13 (costs/refunds) rides every row — watch the Investiture bar. Click-to-place
  rows are drivable with the run-2 `canvas.mousePosition` descriptor trick; right-click cancels
  via `contextmenu`.
* **BENCH — Sovereignty on Bench — Sovereignty:** priority **2bT-16** (Sovereign's Balance — an
  ENGINE-OWNED pair talent converted to entry-data couplings: ally+enemy targeted, pair ±1, the
  ally's hit extends BOTH one round, once, cast round only — `onPairHit: extend-once`). Then
  2bT-11 Censure (Black-range gate is NEW card-is-spec; check a damage roll actually steps down),
  2bT-12 Decree of Ruin (scene vs timed −1, per-creature sceneOnce), 2bT-13 Edict of the Fallen
  (−2 steps on ATTACK damage only + the ledger-entry Temp-HP rider on failed attack tests),
  2bT-14 Exalt + Sovereign's Favor (the `die-step` watch must fire on Exalt and NOT on
  Investiture of Authority; Temp HP keeps-higher), 2bT-15 (Exalt entry REPLACED by the scene
  entry, second Investiture refused pre-cost), 2bT-17 Sovereignty capstone (±2 scene, no-reactions
  card per hit, sceneOnce), 2bT-18 Expose (auto +1 Inv on a failed readable attack + Reactive
  Strike in White range; the owner-click "did it fail?" card on non-attack tests; must NOT ride
  Edict's entries — whenKeys censure,decree). A willing ally + enemy pair targeted together:
  `Bench Ally — One` + `Bench Target — Adjacent A`, allies are friendly-disposition and linked.

**Standing observations to extend, not re-open:** the out-of-combat scope question has its full
characterization in the 07-26k delta; run 5 added five sightings, of which TWO are now closed
(Chaos's scene-end sweep was fixed 07-27b; the "stale prompt re-posts" were triaged — no re-post
mechanism exists, they are fresh offers from the always-armed roster). Still live for the
rulings batch: roster cross-talk incl. Devoted Conduit eating a row's own damage (recommended
default: park non-active bench PCs' watches); mutation riders firing on a nat-1 graze;
Unweaving listing the Omen marker as dispellable. If Fate's or Sovereignty's watches show the
same patterns, ADD the sighting to the rulings batch — don't re-derive it.

**Caveats:** multi-client rows stay ⚑ Ben. Do NOT fix anything mid-run — that is
`test-pass-fixes` work. Record per the skill: passing rows retire with one-line evidence, fails
get dated inline notes, feel/canvas rows stay ⚑, blocked rows say BLOCKED-ON-DEPLOY. **Scope
your end-of-run cleanup to an id-diff against your OWN start snapshot** — runs 4 and 5 both
ended exactly empty; keep the streak. The 23 roster tokens stay placed. The run-1 orphan
`Combat Construct` token may still be on the Playtest Map — **leave it for Ben**. Bench Ally —
One carries pre-existing stale flags (`accord`, `aggro`, `bpHits`, `coordRound`) — they predate
run 5, leave them unless a row trips over one (then note it). **Log out at the end**
(`game.logOut()`) and confirm Bench is selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild,
gates (`python`, never `python3`; no `;`-chaining; never pipe a gate through `tail`), ONE pushed
commit titled `Bench run 6 (Fate+Sovereignty): X retired on evidence, Y fails ->
test-pass-fixes`, and rewrite `docs/BENCH_NEXT_RUN.md` with the run-7 prompt (suggested:
**Civilization + Power + Knowledge**, or the test-pass-fixes batch first if Ben has run it —
the fail list is four families deep at this point).
