# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 4 (two deity trees: **Destruction, then Death**): join as Bench, health-check, then
re-run `scripts/bench-setup-console.js` once as the idempotency/repair check (zero ⚠ lines
expected). ⚠️ Run 3 found the bench tokens had been CLEARED from the Playtest Map between runs —
if `scene.tokens` has no `Bench*` tokens, re-run the placement leg at ORIGIN (2100, 9000) exactly
as run 3 did (the setup script's SPOTS map; grid is 300 px = 5 ft). Read
`docs/EDHA_BENCH_RUNBOOK.md` — the run-1 AND run-2 "Operating lessons" — before driving anything.
The load-bearing ones: after `Combat.create` (create it INACTIVE — never `active: true`, Ben keeps
a live campaign combat open) you must `ui.combat.initialize({combat})` and verify `game.combat.id`;
chat is `ol.chat-log`; token moves need `{animate: false, teleport: true}` plus `tokenDoc.reset()`;
`item.use()` blocks on the ItemConsumeDialog (`[data-action=continue]`, then `[data-action=submit]`
for the roll); damage cards apply via `[data-action=apply-damage][data-multiplier='1']` — **the
LAST button in the row is HEAL (multiplier -1), never click blind**; heal cards need their own
multiplier -1 click to apply; there are no screenshots when the pane is hidden, so record quoted
card text + console asserts; turn boundaries are `combat.update({round}) +
Hooks.callAll("combatTurnChange", combat)` — and note each update/hook fires the watches once, so
a "double post" may be YOUR driving (run 3 proved one event → one card). Tem parinaem and Soggy
Bottom are untouchable.

**Deploy state (run 3 confirmed both 07-26j halves LIVE — do not re-prove them):** the dice fix
and the adversary pack rebuild are on the table. No new deploy is pending unless the handoff's top
delta says otherwise — check the letter above 07-26k before starting.

**Known-broken, do NOT re-diagnose mid-run (run 3 root-caused these → test-pass-fixes):**
Whispered Doubt's silent card · Puppeteer's `{name}` offer · Cruel Step's wall-straddle mis-stop ·
Mender's Instinct (no ally gate + WORLD-WIDE owner scope — expect "The Vivisectionist" to spam an
offer on every half-HP crossing; ignore it, it's catalogued) · the "No Healing" block not gating
hp-threshold heals · Herding Antlers dead on the Fellstag · `edhaAttackKind` reading a nonexistent
field (every weapon reads MELEE — any rangedOnly/meleeOnly clause is untestable until fixed) ·
Tempered Edge's ignore-deflect claim vs the calc line. Also still open from run 1: Shockwave
Slam's weapon-hit trigger surface.

Then run the two sections end-to-end:

* **BENCH — Destruction on Bench — Destruction:** priorities per the preamble — the Charge ledger
  rows (place/consume/cap) and Set Charge's TWO rules; walk the detonate flow with the
  click-to-place drive (override `canvas.mousePosition`, dispatch a real `pointerdown` on
  `#board`, restore the descriptor). Fault Line and Flame Surge's stamped detonate/cancel buttons
  ride the same machinery — check button disable survives F5 only if cheap (a reload costs the
  session; prefer the stamped-flag console assert). The 2bAB-1 row (Cragdrake Alpha + Hazewyrm
  Elder Flame Surge) belongs to this run: import each FRESH, burst places/saves/rolls itself.
* **BENCH — Death on Bench — Death:** hostile NPC dummies in Green range to harvest (the fixtures
  are `character`-type — check each harvest row's wording for whether an adversary-typed victim is
  needed; "Bench Target — Undefended" is adversary-typed, and fresh pack imports are cheap).
  Priorities: 2bW-17 (the Death/Life premise row), then the Remains ledger chain in ORDER —
  2bW-3 harvest (in/out of range, PC/summon/warded negatives, the CASCADE nested kill via
  2bI-10/11), 2bW-4 scene-start freebie ([] ≠ unset), 2bW-10/2bP-10/2bP-11 Risen Servant (cap +
  Remains gate + oldest-consumed), 2bW-6 Bone Garden (cancel REFUNDS, terrain hurts allies too),
  2bW-11 Speak with the Fallen, 2bW-9 Raise Dead (sceneOnce + injury + initiative move), 2bW-5
  Consuming Decay (pre-cost refusals + the decaying tick), 2bW-7/8 Death Ward (willing roll-free
  drift + unwilling save + the 1-HP lethal-drop rescue that must NOT harvest). Kills on 0-HP
  tokens: run 3's Withering Touch damage-half is verified — reuse its arm→hit pattern for the
  melee steps. The two graph rows (Speak with the Fallen's parent, Risen Servant's prereq text)
  are compiled-tree console reads, same as run 3's Instinct check.

**Standing observations to extend, not re-open:** the out-of-combat scope question has a full
characterization in the 07-26k delta (GM focus edits count as spends; campaign tokens' watches
fire scene-wide; per-round ledgers never reset out of combat) — if Death's turn-start/defeat
watches show the same pattern, ADD the sighting to the ruling batch, don't re-derive it.

**Caveats:** multi-client rows stay ⚑ Ben. Do NOT fix anything mid-run — that is
`test-pass-fixes` work. Record per the skill: passing rows retire with one-line evidence, fails
get dated inline notes, feel/canvas rows stay ⚑. **Scope your end-of-run cleanup to an id-diff
against your OWN start snapshot** (run 3's sweep ended empty — keep it that way; summons,
imported `Bench Adv — *` actors, terrain Regions, bench walls and your combat all die at
cleanup; the 23 roster tokens stay placed). The run-1 orphan `Combat Construct` token is STILL
on the Playtest Map; leave it for Ben. **Log out at the end** (`game.logOut()`) and confirm
Bench is selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild,
gates (`python`, never `python3`; no `;`-chaining), ONE pushed commit titled
`Bench run 4 (Destruction+Death): X retired on evidence, Y fails -> test-pass-fixes`, and rewrite
`docs/BENCH_NEXT_RUN.md` with the run-5 prompt (suggested: the remaining deity trees with the
biggest open sections — Fate and Order — or the test-pass-fixes batch first if Ben has run it).
