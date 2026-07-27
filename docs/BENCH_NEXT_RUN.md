# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 5 (two deity trees: **Life, then Chaos**): join as Bench, health-check, then re-run
`scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines expected).
Run 4 found the 23 bench tokens still placed at ORIGIN (2100, 9000) — if `scene.tokens` has no
`Bench*` tokens, re-run the placement leg at that ORIGIN (the setup script's SPOTS map; grid is
300 px = 5 ft). Read `docs/EDHA_BENCH_RUNBOOK.md` — the run-1 through run-4 "Operating lessons" —
before driving anything. **The run-4 lessons are the load-bearing ones and they OVERRIDE older
advice:**

* **`tokDoc.update({x, y})` no longer moves a token.** It throws `Cannot read properties of
  undefined (reading 'testPoint')` out of the Region movement segmentiser and silently leaves the
  token put. Use `tokDoc.move({x, y, action: "displace"}, {animate: false})` then `tokDoc.reset()`.
  Use `action: "walk"` when the row needs wall collision or Region enter-triggers to actually run —
  `move()` returns `false` when a wall refuses, which is itself a usable assertion.
* **Right-click cancel is a `contextmenu` event**, not a right-button `pointerdown`. Dispatch
  `new MouseEvent("contextmenu", {bubbles: true, cancelable: true, button: 2})` on `#board`. A
  `pointerdown` with `button: 2` leaves the pick LIVE and the next left click still places.
* **`item.system.events` is a `RecordCollection`.** Writing an array back is a silent no-op that
  reports success — edit with the dot path `"system.events.<ruleId>.handler.<field>"`. This is how
  a document-edit (rule-2b premise) row can look like it failed when it was never applied.
* **Re-adding a talent to a bench PC needs `edha.skipBudget(true)`** or the level-7 budget refuses
  the create while `syncActorTalents` still reports success.
* **Resource writes clamp to max** — a top-up above the effective max reads back as the max; do not
  mistake the clamp for a spend when checking a "nothing spent" row.
* **`actor.applyDamage([{amount, type}])` is the only honest console damage.** A raw
  `system.resources.hea` edit does not fire the damage watches (it DOES still fire defeat watches).
* Plus the standing ones: after `Combat.create` (INACTIVE — never `active: true`, Ben keeps a live
  campaign combat open) call `ui.combat.initialize({combat})` and verify `game.combat.id`; chat is
  `ol.chat-log`; `item.use()` blocks on the ItemConsumeDialog (`[data-action=continue]`, then
  `[data-action=submit]` for the roll); damage cards apply via
  `[data-action=apply-damage][data-multiplier='1']` — **the LAST button in the row is HEAL
  (multiplier −1), never click blind**; there are no screenshots when the pane is hidden, so record
  quoted card text + console asserts; turn boundaries are `combat.update({turn}) +
  Hooks.callAll("combatTurnChange", combat, prior, current)` — each hook call fires the watches
  once, so a "double post" is usually YOUR driving. Tem parinaem and Soggy Bottom are untouchable.

**Deploy state — read before believing any bug.** The 07-26l ENGINE half is CONFIRMED LIVE (run 4
re-tested all six and all six passed). **The 07-26n fixes for run 4's defects are IN THE REPO but
each has a deploy prerequisite — read the checklist's DEPLOY STATE first and do NOT fail their
rows against a stale deploy:** the engine fixes (`edhaIsConstruct` + the H3 owner-list write
queue) need the engine sync + F5; Fault Line's ×3 ALSO needs `foundry-build deity` + ⟳ Sync
Talents + a fresh RE-FORGE; Flame Surge needs `foundry-build adversaries` + ⟳ Sync Adversaries +
re-importing BOTH bosses. Still pending from 07-26l: Mender's Instinct's authored note/range
(`foundry-build leyline` + ⟳ Sync Talents) and Herding Antlers (`foundry-build adversaries` +
re-drag the Fellstag). Do NOT run a pack build yourself. Check the letter above 07-26n before
starting.

**FIRST: carry-forward rows from run 4 — three are FIXED (07-26n), gated on deploys:**
(1) **Remains race** — FIXED engine-only. If the engine sync + F5 has landed, re-test the exact
staging (Necrotic Cascade dropping 2–3 adversary-typed victims in ONE tick → cards read "(1/2)"
then "(2/2)", ledger holds two). Chaos's Omen ledger rides the same queue — if a Chaos row drops
multiple bearers in one tick, that is free corroborating evidence, note it.
(2) **2bY-7 Fault Line `Constructs ×3`** — FIXED, needs BOTH halves (engine F5 + deity rebuild +
⟳ Sync + re-forge). Only re-test with both live and a freshly-forged, hostile-flipped Construct.
(3) **2bAB-1 Flame Surge** — FIXED in data; **BLOCKED-ON-DEPLOY** until the adversaries rebuild +
⟳ Sync + fresh re-imports of both bosses. Skip and say BLOCKED-ON-DEPLOY if the rebuild has not
run; if it has, re-test on FRESH imports (a real 2d8 total + 3 (red), halved on a save).
(4) Raise Dead's raised-creature-keeps-its-Remain stays a RULING for Ben — not yours, skip.
Also still open from run 1: Shockwave Slam's weapon-hit trigger surface (genuinely unfixed).

Then run the two sections end-to-end:

* **BENCH — Life on Bench — Life:** the whole section is unrun. Priorities: 2bW-12 Adaptive
  Mutation (the whispered three-option chooser, one pick per creature per scene, and each graft's
  rider actually riding a melee hit), then 2bW-13 Apex Form's five clauses — the fifth (scene end
  clears the buff and adds ONE auto-created injury) is the interesting one: run 4 proved Raise
  Dead's injury tool works and creates a real `injury`-type item, so Apex Form should too. Then
  2bW-14 Primal Regeneration (the Vital/Spirit-damage END condition is the half most likely to be
  wrong), 2bW-15 Surgical Precision (a GRAZE must post NO cleanse), 2bW-16 Lifeline (the amount
  input, "0" declining free, once per round). Note the Life/Death premise row 2bW-17 is RETIRED —
  don't re-prove it; if you want a Life-side document-edit spot-check, edit Lifeline's fraction.
  ⚠️ Life needs a WILLING ALLY: `Bench Ally — One`/`Two` are friendly-disposition and linked.
* **BENCH — Chaos on Bench — Chaos:** priorities per the section preamble — **2bG-4** (the H3
  conditional-payload idiom: a success vs a target with NO Omen must apply Isolated and deal **no
  damage at all**; if damage lands, the short-circuit is broken) and **2bG-6** (the half-migrated
  Omen cap: place Omens with Entropy Strike, clear them with Cascade Collapse, place again — the
  cap must free up through the read-time reconcile). Then the Omen chain in order: 2bG-1/2bG-2
  (three rules; the at-cap REFUSAL must not fizzle an older Omen), 2bG-3/2bG-5, 2bU-1 Spreading
  Omen (nearest-unmarked auto-pick), 2bU-2 Unweaving (the GM-clickable dispel card), 2bU-3 Cascade
  Collapse (per-bearer Cognitive gate; out-of-range bearers untouched), 2bU-4 Unravel Everything
  (the Isolated bearer takes 2[T][D] vital and NO Disorient), 2bU-5 Void Sense's new Blue-range
  gate, 2bY-12 / 2bU-6 Shatter Focus (pre-cost veto; the Chaos Set's only remaining takeover) and
  2bG-7/2bG-8 as the unchanged-regression pair.

**Standing observations to extend, not re-open:** the out-of-combat scope question has a full
characterization in the 07-26k delta (GM focus edits count as spends; campaign tokens' watches fire
scene-wide; per-round ledgers never reset out of combat), and run 4 added three sightings (Fault
Line spares allies; a raised creature keeps its Remain; Walking Ruin has no token indicator). If
Life's or Chaos's watches show the same patterns, ADD the sighting to the ruling batch — don't
re-derive it.

**Caveats:** multi-client rows stay ⚑ Ben. Do NOT fix anything mid-run — that is `test-pass-fixes`
work. Record per the skill: passing rows retire with one-line evidence, fails get dated inline
notes, feel/canvas rows stay ⚑, blocked rows say BLOCKED-ON-DEPLOY. **Scope your end-of-run cleanup
to an id-diff against your OWN start snapshot** — run 4's sweep ended exactly empty (7 actors,
7 tokens, 1 Region, 0 walls, 0 combats, all created by that run, all deleted); keep it that way.
The 23 roster tokens stay placed. The orphan `Combat Construct` token from run 1 may still be on
the Playtest Map — **leave it for Ben** (run 4's "it's gone" claim was RETRACTED: its start
snapshot captured only token ids, its end diff showed `tokensMissing: 0`, so what it deleted was
its own Forge Construct summon, not the orphan). **Log out at the end** (`game.logOut()`) and
confirm Bench is selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild,
gates (`python`, never `python3`; no `;`-chaining; never pipe a gate through `tail`), ONE pushed
commit titled `Bench run 5 (Life+Chaos): X retired on evidence, Y fails -> test-pass-fixes`, and
rewrite `docs/BENCH_NEXT_RUN.md` with the run-6 prompt (suggested: **Fate + Order** — the two
biggest remaining deity sections — or the test-pass-fixes batch first if Ben has run it).
