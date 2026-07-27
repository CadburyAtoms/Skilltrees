# Next bench session — paste-ready prompt

Paste the block below into a fresh session (Foundry running, edha world open). Each bench run
rewrites this file for the run after it, so this file always holds THE next prompt.

---

/bench-run — Foundry is running with the edha world open and the Bench user is passwordless. Run
BENCH RUN 8 (the marathon's LAST TWO deity trees: **Knowledge, then Order**): join as Bench,
health-check, then re-run `scripts/bench-setup-console.js` once as the idempotency/repair check
(zero ⚠ lines expected; runs 5, 6 and 7 were all pure sync). The 23 bench tokens should still be
placed — run 7 left them in the corridor around ORIGIN (2100, 9000) and rows 37–40 of the lower-left
room, and the id-diff ended exactly empty. If `scene.tokens` has no `Bench*` tokens, re-run the
placement leg at ORIGIN (2100, 9000) (the setup script's SPOTS map; grid is 300 px = 5 ft). Read
`docs/EDHA_BENCH_RUNBOOK.md` — the run-1 through run-7 operating lessons — before driving anything.
**Load-bearing lessons, newest first (they OVERRIDE older advice):**

* **`tokDoc.move()` THROWS a cosmetic `#panCanvas … clientWidth` error when the moved token is
  CONTROLLED and the pane is hidden — the write already landed** (run 7). Release control, catch,
  verify `td.x/td.y`.
* **Never resolve a token by NAME when duplicates exist** — run 7 moved the run-1 orphan
  `Combat Construct` that way. Use `tokens.find(t => t.actorId === id && !!t.actor)` or the id.
* **With the pane hidden the ChatLog renders NOTHING** (`ol.chat-log` empty;
  `ui.chat.render({force:true})` throws). Hand-render: `await msg.renderHTML()` → append into
  `ol.chat-log`, then `[data-message-id]` button selectors work.
* **The sheet's `use-item` action needs a real `PointerEvent`**, not `MouseEvent("click")` (run 7).
* **System attack/action cards have EMPTY `content`** — no reachable apply-damage button. Apply via
  `target.applyDamage([...])` **within 15 s** of the damage roll: `edhaDealerOf` then attributes the
  dealer + item exactly as the button would (this is how run 7 measured every on-hit rider).
* **Turn-start rows fire on `updateCombatant` → `flags.cosmere-rpg.activated` = true** (the cosmere
  activation model), not `combatTurnChange` (run 7).
* **A two-`edhaPickPoint` flow looks like a silent post-cost no-op** — scrape `ui.notifications` for a
  live "Click inside…" prompt before calling it a bug (run 7).
* **A DialogV2 `cancel` BUTTON can't be driven synthetically** (it falls through to the default) —
  drive the header close (X), same `!picked` branch, and say which you used (run 7).
* **Hook `ui.notifications.warn/info/error` at run start** — pre-cost vetoes live only there and the
  on-screen list rotates out in seconds. **Keep each exec under ~25 s** or a timeout leaves a
  half-driven flow that poisons the next row (run 7).
* **`items.getName("<tree name>")` returns the PATH item when a capstone shares the tree's name** —
  always `items.find(i => i.type === "talent" && i.name === X)` (run 6).
* **`displace` does NOT bypass snare/zone trigger Regions** — any entry mode springs them (run 6).
* **Consume-vs-roll dialog order varies per use** — walk BOTH kinds in a loop.
* **Cloned fixtures keep `prototypeToken.name`** — set BOTH `name` and `prototypeToken.name` (run 5).
* **Expect roster cross-talk cards mid-row** — the 15 always-on bench PCs fire scene-wide, and Ben's
  campaign **Corvaine adversaries' "Break" cards fire on bench victim drops**. Check every stray
  card's named owner before attributing it.
* Plus the standing ones: INACTIVE combats only (`ui.combat.initialize({combat})`, verify
  `game.combat.id`; Ben's live campaign combat `BerbNeuXp4iKduef` — leave it alone); chat is
  `ol.chat-log`; right-click cancel is a `contextmenu` event on `#board`; click-to-place uses the
  run-2 `canvas.mousePosition` descriptor trick; `item.system.events` is a `RecordCollection` (dot
  paths only); marker-ledger entries snapshot formulas at placement; `edha.skipBudget(true)` around
  talent re-adds; **resource writes clamp to max — Investiture max is 4, so top up between uses or a
  3-Inv talent dies on "Cannot consume, not enough of resource"** (run 7 lost two rows to that);
  the bench adversary fixtures deflect 1–2, so measure by NET or use vital; no screenshots while the
  pane is hidden — record quoted card text + console asserts. Tem parinaem and Soggy Bottom are
  untouchable.

**FIRST: there IS a fix batch to re-test — the 07-27f two.** Both of run 7's findings were fixed
(delta **2026-07-27f**), both **ENGINE-ONLY** (⟳ Sync + F5, **no pack rebuild**). **Byte-check the
served blob before anything else:** `edhaSummonSourceTalent` (expect 3 — definition + veto +
executor), `edhaSkillLabel` (~8), `edhaLocalizeLabel`, plus the confirmed-live 07-27d markers
(`edhaSnareSpringGate`, `edhaCleanseArmMode`, `_edhaCleansePending`) and the 07-27b ones
(`edhaWatchEntryLevel`, `_edhaLifeClearBusy`, `chainBounded`, `edhaOwnerListQueue`). If
`edhaSummonSourceTalent` is absent, Ben has not synced: record the two re-tests BLOCKED-ON-DEPLOY
rather than re-reporting run 7's symptoms as live bugs.

**Re-test 1 — the Construct-consuming family (Civilization 2bV-13 · 2bV-14 · the Magnum Opus half of
2bV-15).** The lookup is fixed: `edhaOwnedSummons` now takes a **null** talent name from a CONSUMING
rule (via `edhaSummonSourceTalent`) and matches on `summonName`, instead of comparing the consuming
talent's own name against the summon's `summonTalent` stamp. **Re-open all three rows and drive them
against a Construct forged NORMALLY — do NOT repeat run 7's `summonTalent`-unset workaround.** That
workaround is what made run 7's downstream evidence possible, but re-testing behind it would prove
nothing about the fix, and the downstream halves have still never been driven against a *stamped*
Construct. So: confirm each talent gets past the pre-cost veto (no "needs a live Combat Construct.
Nothing spent."), then re-confirm Siege Form's toggle + its two refusals, Arsenal's granted AE +
re-arm refusal, and all of Magnum Opus (HP roll, +2 defenses, Colossus AE, Foundation upgrade,
`sceneOnce` refusal, the 10 ft splash). **Also re-check the FORGING side did not regress:** Forge
Construct at cap 1 must still dismiss-and-replace (2bP-8/2bP-9's shape — that branch was left
byte-identical, so a failure there is a real regression). New optional Events-tab field to note if
Ben asks: `edha-summon-effect` → "…forged by which talent", blank = any of your summons with that
name (the shipped default, and the rename-proof one).

**Re-test 2 — the raw-i18n-key family (nine sites, cross-tree).** Run 7 filed this as one cosmetic
label; it was a nine-site family, and run 7's explanation of why Bastion's card worked was **wrong**
(that call hardcodes `label: "Agility"` — there was no working path to copy). Now fixed at the
shared helpers, so **read the CARD TEXT** on: the Magnum Opus splash save ("Agility vs your Red"),
the Colossus AE description ("roll Agility … or gain Prone", not "AGI … prone"), Bastion's
fortified-entry save (still "Agility", now via the helper), any `edha-apply-status` card applying a
NATIVE status (run 1's `COSMERE.Status.Disoriented` — Disoriented/Slowed/Prone), Order's
court/accomplice sweep and annotate rider ("Discipline vs your Blue"), and Phantom Double's belief
cards ("Perception <n>"). **Any `COSMERE.*` string in card text is a FAIL.** One negative to check:
Fault Line's rule authors `saveLabel: "Speed"` — it must still read "Speed", proving an authored
override still wins over the helper.

**Deploy state — read before believing any bug.** **07-27f is NOT confirmed — the byte-check above
decides it**, and it is engine-only either way (no pack build is owed for it). ENGINE: 07-27b **and**
07-27d are both CONFIRMED
LIVE. **THREE pack halves are still owed, unchanged since run 5** — do NOT run a pack build yourself,
and record these BLOCKED-ON-DEPLOY unless a fresh console read proves otherwise:
- `foundry-build leyline` + ⟳ Sync (Mender's Instinct's note + green range gate).
- `foundry-build deity` + ⟳ Sync + re-forge (the Construct `creatureType: "Construct"` mint — run 7
  re-confirmed a freshly forged Construct still reads `system.type = {"id":"humanoid"}`; **note that
  this gates nothing in Civilization**, whose predicate is flag-based, and the only reader of the
  `system.type` path is Fault Line's `constructMult`; also Surgical Precision's cosmetic rule text).
- `foundry-build adversaries` + ⟳ Sync + re-drag the Fellstag (Herding Antlers, 0 events) + re-import
  BOTH bosses (Flame Surge `damage.formula: null`).

Then run the two sections end-to-end:

* **BENCH — Knowledge on Bench — Knowledge:** priorities **2bT-3** (Killing Blow — no-bearer pre-cost
  refusal; with a 3-Insight bearer YOU roll the Red test on the card, success = ONE [T][D] roll ×3
  vital auto-applied + ALL Insight cleared, failure = ×1 and exactly 1 removed; do NOT hand-apply the
  card's own damage) and **2bT-5's two open halves** (the re-use-while-armed pre-cost refusal, and the
  `weaponOnly` negative — a talent's OWN damage must NOT trigger Predatory Strike). Then 2bT-1
  (Studied Mark: 2 Insight with `system.count` = 2 as the bench-verify field, the whispered snapshot
  WITHOUT Cognitive defense, three refusals spending nothing, and the cosmetic two-card drift), 2bT-2
  (transfer drops A to 0 and moves the icon), 2bT-4 (The Final Study's once-per-scene refusal + the
  free-Strike roster line), 2bT-6 (own hits +Tier vital; the kill's whispered floor(count/2) transfer
  offer), 2bT-7 (Death Mark's FULL-count transfer + the PUBLIC per-ally burst card rolling the
  OWNER's dice; note R9 last-click-wins when 2bT-6 and 2bT-7 both fire), 2bT-8 (Accumulate in/out of
  Green range, cap 5, plus the unchanged damage→1 Investiture clause), 2bT-9 (Pack Share's arm +
  PUBLIC three-defense snapshot, re-arm refusal, an ALLY's hit +Tier vital and the first such hit each
  round placing 1 Insight, your own hits getting nothing), 2bT-10 (The Pack stacking additively on top
  of Pack Share — R10 — with its OWN once-per-round placement R11, and posting nothing at 0 Insight),
  and 2bU-15 (Predatory Strike regression: still consumes `predprimed`, still ×max(Insight,1) vital,
  still places 1 Insight). ⚠️ **Knowledge is an ALLY-hit tree** — 2bT-9/2bT-10 need a second attacker
  inside YOUR Green range; run 7's `applyDamage`-within-15 s trick attributes the dealer, so an ally
  PC's weapon use + apply is the way to drive it.
* **BENCH — Order on Bench — Order:** priorities **2bL-1 / 2bL-2** (does the pact form at all, and do
  the UNCONVERTED readers still see the ledger — Concord must list your covenanted allies BY NAME and
  Final Decree must name them as Witnesses; **if either says you have no Covenants, STOP and report** —
  that is the one failure that matters) and **2bV-17** (the Covenant AE sweep — the 07-24u
  key-vs-marker reconcile fix's first bench; two PCs covenant, walk in/out of White range, the +1
  all-defenses AE appears/disappears on BOTH, and partner-damages-partner still posts the break
  watch). Then 2bV-18 (the point of the migration — edit a cap formula / note / court radius on a
  converted Order or Civ talent and confirm the behaviour follows), 2bL-3 (all four Covenant pre-cost
  refusals), 2bL-4/2bL-5 (the AE and **the AE edited to +2** — the pass's whole premise), 2bL-6 (the
  cap: the OLDEST pact dissolves and a 2+ drop clears ALL dropped allies' icons), 2bL-7 (⚠️ the SHARED
  icon — needs two Order PCs; bench has one, so expect ⚑ unless you stage a second Order actor),
  2bL-8 (both break buttons), 2bL-10/2bL-11 (Bear Witness EVERY round-start, Temp HP keeps-higher —
  run 7 proved the keeps-higher writer works in Power's 2bU-8, so a drop here is a real bug),
  2bV-1..2bV-9 (Edict's picker + refund drift, the three watcher shapes, ⚖ Violated, Sealed Edict's
  engine-rolled Discipline rider, Verdict's court, Concord's per-ally once-per-round bonus, Shoulder
  the Oath's Reaction, Lawkeeper's wall-blocked advantage, Final Decree's full resolve), and the Order
  quiet-cases row. Remember: **Edict's prohibition picker was the OTHER AppV1 window converted to
  DialogV2 in 07-27d** — an explicit "the V2 dialog appeared" note on 2bV-1 is worth recording, and
  Covenant/Concord/Final Decree all read the same H3 `covenants` ledger, so group their symptoms
  before calling three bugs.

**Standing observations to extend, not re-open:** the out-of-combat scope question (07-26k
characterization; run 6 added Restrained-never-expires, run 7 added Absolute Authority's Weakened
landing with `duration.type: "none"`); roster cross-talk (park proposal still pending). If
Knowledge/Order watches show the same patterns, ADD the sighting — don't re-derive it.

**Caveats:** multi-client rows stay ⚑ Ben (2bL-7's two-Order-PC row and 2bM-1's no-GM row especially).
Do NOT fix anything mid-run — that is `test-pass-fixes` work. Record per the skill: passing rows retire
with one-line evidence, fails get dated inline notes, feel/canvas rows stay ⚑, blocked rows say
BLOCKED-ON-DEPLOY. **Scope your end-of-run cleanup to an id-diff against your OWN start snapshot** —
runs 4, 5, 6 and 7 all ended exactly empty; keep the streak — **and this run also snapshot per-actor
`flags["edha-content"]` at start**, because run 7's clean document diff still could not attribute the
roster's flag litter. The 23 roster tokens stay placed. The run-1 orphan `Combat Construct` token at
(7500, 4800) is a **dangling reference to a deleted actor** — it can never be found by any summon
lookup, so leave it for Ben and do not treat it as testable. Bench Ally — One carries pre-existing
stale flags (`bpHits`, `accord`, `coordRound`) — leave them. **Log out at the end** (`game.logOut()`)
and confirm Bench is selectable on /join.

Finish with the dated handoff delta (next letter after the current top one), dashboard rebuild, gates
(`python`, never `python3`; no `;`-chaining; never pipe a gate through `tail`), ONE pushed commit
titled `Bench run 8 (Knowledge+Order): X retired on evidence, Y fails -> test-pass-fixes`, and
rewrite `docs/BENCH_NEXT_RUN.md` with the run-9 prompt: **THE FINAL SWEEP** — `BENCH — Heroic paths`,
the `BENCH — Engine-wide & cross-tree` remainder, the adversary rows scattered through the leyline
sections (2bR-17 Callthief's Counterpoint, 2bF-17 Surecat, the five restored adversary abilities,
2bZ-10's two unbenched copies, 2bAA-9's two Seeming copies), and every leyline row a landed fix
unblocked. Whatever run 8 fails feeds one more test-pass-fixes pass before that sweep; the only
families carried the whole marathon are **Shockwave Slam's weapon-hit trigger surface** (run 1) and,
if the run-7 fix has not landed, **the `edha-summon-effect` lookup**.
