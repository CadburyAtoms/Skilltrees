# Edha → Foundry VTT Port — Agent / Operator Handoff

Self-contained cold-start doc. Read top to bottom. **§1–§6 = how it works + how YOU operate it solo. §7 = the native Event/Effect system (DONE — 2026-06-09: ALL behavior lives ON the talents; runtime is a thin generic engine; both historic blockers solved + live-verified). §8 = current content state. §9 = open to-dos. §10 = gotchas.**

Backing detail (every session's notes) lives in agent memory `edha-foundry-module-build.md` + `edha-aoe-bursts.md`; this doc is the curated summary. Last update: **2026-06-17** (DESTRUCTION (Razkael) deity tree wired — first deity tree; the **Charge** lifecycle (set / pinpoint / detonate / detonate-all) + dangerous-terrain reuse, all on the Red/hazard machinery; ENGINE-mostly + a small data change (Set Charge / Fault Line events removed) → ⟳ Sync). Prior: **2026-06-16c** (GREEN TREE COMPLETE — Territory + Restoration + Instinct; see the 06-16 / 16b / 16c deltas). Prior: **2026-06-14f** (BLUE / Foresight wired → **BLUE TREE COMPLETE** = Calculation + Foresight + Illusion; mostly manual prediction/initiative, the rest reuses the Calculation `nextTestMod` flag + a new `edha.calculatedPatience()` toggle; ENGINE-ONLY, no rebuild). Prior: **2026-06-14e** (BLUE / Illusion wired — the three summon talents spawn REAL friendly tokens via the shared `edhaSummon` engine (Phantom Barricade / Phantom Double / Holographic Illusion), plus Ghostly Walls immobilize + Absolute Stillness Weakened rider; ENGINE-ONLY/name-based off `useItem`, no pack rebuild; specs/rulings signed off by Ben first). Prior: **2026-06-14d** (BLUE / Calculation wired — cognitive control: a counted `nextTestMod` (dis)advantage-on-next-test flag + Disorient, all driven off `cosmere-rpg.useItem` on the owner's own client; ENGINE-ONLY/name-based, no pack rebuild). Prior: **2026-06-14c** (WHITE / Accord wired — Disoriented/Determined conditions, accords, attack-disadvantage cards; Disoriented auto-expires owner-relative; engine-only EXCEPT Unyielding Accord's drag-AE = pack rebuild). **WHITE TREE COMPLETE (Coordination + Bulwark + Accord).** Prior: **2026-06-14b** (WHITE / Bulwark — applyDamage-wrapper mitigation + Hardy max-HP AE). Prior **2026-06-14** (WHITE / Coordination wired — Plot Die ("raise the stakes") primitive + ally-support, ENGINE-ONLY/name-based, no pack rebuild). Prior: **2026-06-13c** (BLACK tree-by-tree: Isolation + Ritual + Subjugation specialties wired. 06-13c = Subjugation focus-economy engine, ENGINE-ONLY/name-based, no pack rebuild. 06-13b = the reusable tools: `edha-on-hit`, `edha-test-rider`, `edha-ritual-hp-cost`, `edha-heal-cut`, affliction-damage engine, Reserve. See top deltas). Prior: 2026-06-13 (Weakened rework → ends at the creature's next turn + generic timed-status expiry), 2026-06-12 (pack-path schism fixed + workflow hardening), 2026-06-11b (V3 ENGINE PASS), 2026-06-11 (playtest-PC triage), 2026-06-10b (playtest-1 prep — §8b), 2026-06-09 (RE-REFACTOR: behavior on talents). [Superseded deltas collapsed to one-liners below.]

**NEXT SESSION: tree-by-tree review continues — Black done = Isolation + Ritual + Subjugation; WHITE COMPLETE = Coordination (06-14) + Bulwark (06-14b) + Accord (06-14c); BLUE COMPLETE = Calculation (06-14d) + Illusion (06-14e) + Foresight (06-14f). GREEN COMPLETE = Territory (06-16) + Restoration (06-16b) + Instinct (06-16c). NEXT = Red, plus the leyline Keys/Draw Mana riders + any remaining Black specialties.** Per-tree loop in §9. **The White passes rebuilt the leyline pack (Hardy + Unyielding Accord AEs), so relaunch + `⟳ Sync` to load all White work**; all of Blue (Calculation + Illusion + Foresight) is **engine-only (F5)** and rides the same relaunch (no Blue pack rebuild — Composed/Collected AEs were already baked). Carry-over live-verify: the White checklists (06-14 / 06-14b / 06-14c), the Blue checklists (06-14d / 06-14e / 06-14f), the 06-13b Ritual tools, and — if never formally run — the 06-11b v3 checklist + 06-13 Weakened.

> **Branch note (2026-06-14d):** Calculation + Illusion were built ON TOP of the open White PR #36 (`feat/white-leyline-foundry`), because they reuse White's `edhaApplyTimedStatus` / disorient card / `set-flag` relay and the Blue Composed AE that the White Bulwark rebuild baked into the leyline pack. When shipping Blue, branch off whatever `main` contains White (merge #36 first, or stack the PR on it).
> **PROCESS note (06-14e):** the first Illusion attempt was reverted because it shipped without sign-off and shortcut the summon talents (Barricade → a text note, Phantom Double → skipped). REWIRED after an explicit per-talent proposal Ben approved. Lesson reinforced: propose the full per-talent data model BEFORE coding, especially anything summon/placeable.

---

## 2026-06-17 DELTA — DESTRUCTION (Razkael, deity) tree wired — first DEITY tree (Charge lifecycle + dangerous terrain; ENGINE-mostly + small data change → ⟳ Sync)

First deity tree. The spine is a bespoke **Charge** system, built entirely on the existing **Red / hazard** machinery — **no side-engine** (reuses `edhaApplyBurstResults`/socket for damage, the `edha-content.hazard` Region + `edhaHazardVisual` for terrain, `edhaRollOpposedSkill` for the opposed Speed test, the Reserve-style owner flag for state). New section in `register-skills.js` right after the burst intercept.

### Rulings (Ben, 06-16)
- **Charge model:** Set Charge drops a click-to-placed marker template, tracked in `flags.edha-content.charges` (cap = tier; oldest fizzles past cap). Detonation resolves burst damage + drops terrain at each marker's REAL position via the card's **Detonate / Detonate-All** buttons (Free) or via **Cascading Failure / The Unmooring** (their Inv cost + bonuses).
- **Triggers** ("when target moves / takes damage / enters square") are **declared text fired by the Detonate action** — no auto-hook (CONTEST-EXEMPT: Set Charge).
- **Concussive Yield** is engine-rolled per foe (not a reminder card): Speed vs the owner's Red DC → core **Prone** on a fail. Same helper backs **Fault Line**'s inline knockdown.
- **Zone "merge"** (Cascading / Unmooring) = damage-bump + GM-merge note (no polygon union).

### Per-talent wiring
- **Set Charge** — preUseItem takeover (cancel default, pay 1 Inv, refund on cancel): click-to-place a marker, store the Charge, post the Detonate card.
- **Pinpoint Charge** (Free, 1 Inv) — flags the latest Charge ⊕; on detonation adds its [Tier][Die]+Int **keen** to the primary and **ignores that target's deflect** (hit bumped by `system.deflect.value`).
- **Cascading Failure** (2 Inv) — detonate all Charges; a foe caught in 2+ blasts takes an extra [Tier][Die]; merge bump when ≥2.
- **The Unmooring** (3 Inv, once/scene) — detonate all at 15 ft, +Int, **ignores deflect**, merge-bump all zones.
- **Concussive Yield** (passive) — rides every Charge detonation (Speed-vs-Red → Prone).
- **Fault Line** (2 Inv) — preUseItem takeover: a 60×5 ft **line** (rotated-rectangle hazard, replaces the pilot's radius approximation), [Tier][Die]+Str energy, Speed-vs-Red → Prone, **×3 vs Constructs** (`customType === "Construct"`).
- **Combustion Chain** (Reaction) — **auto-fires** off the defeat HP-sync (`updateActor`, hp ≤ 0): a foe that drops in your terrain ignites a fresh 10 ft zone on the body + offers the 5 ft spread.
- **Walking Ruin** — +10 ft Speed stays a transfer AE; "every space you move through becomes dangerous terrain" now drops a patch off `updateToken` while the talent is toggled on (scene-scoped).
- **Pyre** — unchanged (keeps its `edha-place-hazard` event); the turn-end "flammable spread" is backlog.

### Hooks/tools still to build (NOT silently dropped — see the section header in register-skills.js)
- Pinpoint "terrain moves with the target" — per-Region follow on `updateToken` (template: the Walking-Ruin move hook).
- Pyre "spreads to one flammable square each turn" — a `combatTurnChange` Region-grow (mirror Spreading Roots).
- Fault Line "triple damage to structures" — needs object/structure damage targets (Constructs already wired).

### Deploy
Set Charge + Fault Line lost their authored `events` (now name-based) → **data change → `foundry-build deity` + ⟳ Sync.** The rest is engine-only. `node --check` clean; `node scripts/validate.js` passes (`validate-packs.js` needs the Foundry LevelDB — deferred to the machine).

### LIVE-VERIFY (no Foundry session this pass): see the **Destruction** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify: the rectangle-Region rotation/anchor for Fault Line, the marker/Detonate round-trip + cap=tier fizzle, Concussive/Fault-Line prone math, the deflect-bump, Construct ×3 detection, the Combustion auto-fire condition, Walking Ruin per-move terrain volume.

## 2026-06-16c DELTA — GREEN / INSTINCT specialty wired → GREEN TREE COMPLETE (mostly name-based engine + a small pack rebuild → ⟳ Sync)

Green tree-by-tree finishes: **Instinct (8)** — the pack-tactics tree (advantage-granting, focus-fire, forced movement, a strike window). The COMPUTED talents (Pack Hunter, Scent the Weak, Coordinated Hunt, Pack Pressure) are **name-based** engine (live adjacency / lowest-HP / focus-fire / windowed bonuses have no data-rule representation — precedent: White Coordination + Black Subjugation). But **behavior that CAN live on the talent now does**: **Drive the Prey → Slowed** is a data-side `edha-triggered-effect` (event `use`, kind `status`, target `prompt` — a direct mirror of Sovereign of Solitude, editable in Foundry), and the three genuinely-manual talents (Predator's Instinct / Packmate's Warning / Natural Order) carry **toggled indicator AEs** (Flamestance convention) so they show + are editable on the sheet. So this pass DID touch data → `foundry-build leyline` + ⟳ Sync. **The whole Green tree (Territory + Restoration + Instinct) is now wired.**

### System facts (verified)
- **`slowed` is a native cosmere condition** (Drive the Prey applies it via the Territory `edhaApplyConditionToTarget` helper).
- The **applyDamage PRE-pass** already injects bonus instances (Vital Diagnosis pattern) — so Coordinated Hunt / Pack Pressure push their bonus into the SAME apply call (no second applyDamage → no recursion).

### New REUSABLE primitive
- **`advAttackNext`** flag + `edhaGrantAdvAttack(actor, source)` / pre-`{attack,item}`-roll inject + consume — "advantage on your next attack," the attack-roll mirror of `advTest`. Cross-actor grants relay via `set-flag`. **Reach for this on any "gain advantage on your next attack" talent.**
- **Focus-fire tracker** (`_edhaFocusFire`, GM-side `attack/itemRoll` watcher via the Territory `edhaTargetsOfRoller`) — records who attacked whom this round; reset on round change.

### Per-talent wiring
- **Pack Hunter** (active) — on use → you + each ally **adjacent to the targeted enemy** gain advantage on their next attack.
- **Scent the Weak** (active) — on use → names the **lowest-HP creature in Attunement Range** + grants you advantage on your next attack (once/round).
- **Drive the Prey** (active) — **data-side** `edha-triggered-effect` (event `use`, kind `status`, `slowed`, target `prompt`): on use the target is Slowed (owner-judged Green vs Survival; forced move + ally Reactive Strikes GM-narrated). Editable in Foundry.
- **Coordinated Hunt** (passive) — your hit on a victim that you + ≥1 ally attacked this round → **+min(#attackers, Green rank)** bonus damage (pre-pass).
- **Pack Pressure** (active) — on use → opens a **strike window** until the start of your next turn; your strikes deal **+[Tier][Die]** (pre-pass); the no-provoke move is GM-narrated.
- **Predator's Instinct / Packmate's Warning / Natural Order** — **manual** (no track/fear, unseen-attack, or scene-debuff hooks) → each carries a **toggled indicator AE** (sheet presence) + posts a reminder on use.

### Known limits
Coordinated Hunt + Pack Pressure auto-apply to the **owner's** strikes only (ally strikes GM-narrated); Pack Pressure's "+vs an adjacent-flanked target" is applied to all owner strikes in the window (slight over-application). Focus-fire + Pack Hunter ally-detection rely on synced `user.targets` / token adjacency on the GM client (same caveat as Pack Sense).

### LIVE-VERIFY (relaunch + **⟳ Sync** — the pack was rebuilt for Drive the Prey's status rule + the indicator AEs): see the Green / Instinct section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session): the advAttack dialog seeding, the focus-fire count at the table, the Pack Pressure window expiry, Drive the Prey's data-side Slowed firing on use.

---

## 2026-06-16b DELTA — GREEN / RESTORATION specialty wired (engine + a Hardy pack rebuild → ⟳ Sync)

Green tree-by-tree continues: **Restoration (8).** The tree's signature is **healing**, and its spine is a **"green-heal" trigger family** — three talents that fire "when you restore health with a Green talent."

### System facts (verified)
- The **`applyDamage` wrapper is the heal chokepoint** (heal instances pass through it; it already tracks `prevHp`/`healAmt`/dealing item for overflow-THP & heal-cut). Verdant Mend's clickable heal + any heal instance land here. **Mender's Instinct** heals via the trigger path (direct `hea.value` update), so it gets a second integration point.
- **`stunned` is a native condition** (joins afflicted/disoriented/weakened) → Natural Recovery's cleanse set is all real.
- **Injuries are first-class `injury` Items** with `system.type` ∈ {flesh_wound, shallow_injury, vicious_injury, permanent_injury, death} → Reknit Form can ENFORCE removal (delete the item), 2 Inv temporary / 3 Inv permanent.

### Rulings (Ben, 06-16b — carried from the Territory pass)
Auto where possible; resource-spend talents stay opt-in cards; enforce the rules text. Reknit Form → enforce (delete the injury Item) rather than leave manual.

### New REUSABLE engine
- **`edhaGreenHealRiders(healer, target, amount, prevHp)`** — the on-green-heal dispatcher, called from BOTH heal chokepoints (applyDamage post-pass when `edhaTalentColor(dealer.item)==="green"`, and the `edha-triggered-effect` heal branch when the firing talent is green). **Reach for this for any "when you heal" rider.**
- **`edhaGrantTempHpCross` / `edhaDeleteItemCross`** — cross-actor THP grant (reuses the `set-flag` relay; keeps the higher THP, no stacking) + injury-item delete (new `delete-item` socket action). Both do-if-owner-else-relay.

### Per-talent wiring
- **Verdant Mend** — already a clickable [Tier][Die]+Green-mod heal; now the primary green-heal **trigger source**.
- **Mender's Instinct** — already `edha-hp-threshold`; now also fires the green-heal riders.
- **Collected** — already a +2 Cog/Spi AE (passive). Unchanged.
- **Hardy** — **data-side AE** `system.resources.hea.max.bonus += @level` (clone of Black/White; `_id` HardyMaxHPGreen1 — closes the 06-13b carry-over). Pack-rebuilt + inspect-verified.
- **Resurgent Growth** — heal an **ally** → queue regrowth; at the **start of your next turn** (`combatTurnChange` + `combat.combatant`), heal them **tier + Green mod** if still in Attunement Range (then clear).
- **Vital Surge** — green-heal to a target that **was below half HP** → whispered card → spend 1 Inv → THP = **½[Tier][Die]**.
- **Natural Recovery** — green-heal → whispered card listing the target's removable conditions (Afflicted/Disoriented/Stunned/Weakened) → click → cleanse one (Opportunity trusted).
- **Reknit Form** — on use → whispered card listing the target's **injury Items** → click → delete it + spend **2 Inv** (temporary) / **3 Inv** (permanent).

### Deploy
- **Engine:** `module-src-sync.js push`. **Pack rebuild:** `foundry-build.js leyline` (Hardy AE) — Foundry CLOSED; `validate-packs.js` **PASSED ✓** (leyline effects 8→9). **To load:** relaunch + **⟳ Sync Talents** (Hardy changed the pack).

### Known limits / couldn't self-verify (no Foundry session)
Heals that bypass `applyDamage` AND the trigger path won't fire riders (the Restoration heals don't); Verdant Mend's heal carrying `dealer.item` (overflow-THP relies on the same, so it should — `_edhaLastDealer` is the fallback); the `set-flag` THP relay + `delete-item` injury relay for cross-actor targets; Resurgent Growth resolving on the owner's turn start + the range re-check; Hardy current-HP top-up is manual. **See the Green / Restoration section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-16 DELTA — GREEN / TERRITORY specialty wired (engine-mostly + small pack rebuild for Apex Predator / Thorn Field / Sudden Growth)

Green tree-by-tree begins with **Territory (8)**. The tree's spine is **"your difficult terrain,"** which until now had **no mechanical effect** (Green Draw Mana only drew a cosmetic circle; the only "terrain" Region type was the damage-only `edha-content.hazard`). This pass makes difficult terrain a **real, enforced, owner-tagged Region** and builds the membership engine the rest of the tree reads.

### System facts (verified)
- **Foundry v13 ships a native `modifyMovementCost` RegionBehavior** (`client/data/region-behaviors/increase-movement-cost.mjs`): `system.difficulties.{walk,…}` = per-action cost multiplier (1 normal … 5; **2 = difficult terrain**, engine-enforced on the token movement pathing). This is THE difficult-terrain primitive.
- **`restrained` and `immobilized` are native cosmere conditions** (system `index.js`) → toggle the icon; immobilized already rides the `EDHA_TIMED_STATUSES` auto-expiry.
- Region docs are **GM-write-only** → player paths (Green Draw Mana, Spreading Roots click) relay to the GM via new socket actions.

### Rulings (Ben, 06-16)
A = difficult terrain must have a **real Region effect on the map** AND a **player-visible indicator** (model it like the other enforced-movement mechanics, not GM narration). B = **Thorn Field rides on terrain created by players that have Thorn Field** (true passive, not a self-cast). C = **auto whenever possible.** D = conditions apply **automatically on success.** E = enforce the descriptive rules text, rewrite data as needed.

### New REUSABLE engine
- **`edhaCreateGreenTerrain(owner, scene, x, y, sizeFt)`** (GM-side) — the single green-terrain factory: one Region with native `modifyMovementCost` (walk ×2) + `flags.edha-content.terrain = {ownerUuid, color:"green"}` + a paired player-visible **Drawing** (green 🌿, via the existing `edhaHazardVisual`). If the owner has **Thorn Field**, it ALSO bakes an `edha-content.hazard` behavior (`floor([Tier][Die]/2)` keen on enter / turn-start). `edhaDropGreenTerrain` is the player→GM relay (`green-terrain` socket action). The burst-terrain path (`edhaApplyBurstResults`) now routes `color:"green"` here; red/other dangerous terrain stays the damage Region but is now **owner-tagged** too.
- **Membership helpers** — `edhaOwnedTerrainRegions(owner)` / `edhaPointInRegion` / `edhaTokenInOwnedTerrain(tok, owner)` / `edhaEnemiesInOwnedTerrain(owner)` (circle-distance tests). **`edhaGreenMod(actor)`** = native `@skills.green.mod`. **Reach for these on any "in your terrain" effect.**
- **`grow-terrain`** socket action + `edhaGrowTerrain` — expand a Region's circle radius (and its paired drawing) GM-side.

### Per-talent wiring
- **Green Leyline Attunement (Key)** — Draw Mana now drops a **real** enforced difficult-terrain Region (was a cosmetic circle).
- **Grasping Vines** — on use (name-based) → auto-apply native **Restrained** to your target (maintain = chat reminder; Foundry has no upkeep hook).
- **Territorial Instinct** — on use (Reaction) → auto-apply native **Immobilized** (timed, auto-expires) to your target. No Disengage hook → the opposed Green-vs-Survival test is owner-rolled; using the talent = applying on success.
- **Thorn Field** — **reworked to a true passive** (talent now `events:{}`/no damage): the keen hazard is baked onto terrain by `edhaCreateGreenTerrain` whenever a Thorn-Field owner creates it.
- **Spreading Roots** — `combatTurnChange`: the creature whose turn just ended, if standing in your terrain → whispered card → spend 1 Inv → **expand the Region** [Size] (once/owner/round).
- **Pack Sense** — `attackRoll`/`itemRoll` watcher (GM-gated): an **ally** attacks a target standing in your terrain → whispered card → spend 1 Inv → **+Green mod** to their result (target read from synced user targets).
- **Sudden Growth** — data-side `edha-burst {terrain, color:green, affects:none}` event → click-to-place a [Size] difficult-terrain Region (routes through the green factory).
- **Apex Predator** — **data-fix** (authored block was a stray Red attack — `skill:red` + red vital damage; cleared to a passive) + engine pre-roll: while **≥3 enemies stand in your terrain**, advantage on your **Physical (str/spd)** tests (won't stomp an active disadvantage).
- **Primal Awareness** — left manual (no Surprise/outdoors/track hooks to enforce).

### Deploy
- **Engine:** `module-src-sync.js push` → live module. **Pack rebuild:** `foundry-build.js leyline` (Apex Predator data-fix + Sudden Growth event + Thorn Field event-removal) — Foundry was CLOSED; `validate-packs.js` **PASSED ✓** (leyline events 21/19, effects 8/8, 0 bad). Baseline re-armed by the build.
- **To load:** full **relaunch** (engine changed) + **⟳ Sync Talents** (leyline pack rebuilt).

### Known limits / couldn't self-verify (no Foundry session)
Native `modifyMovementCost` actually doubling movement at the table; Drawing visibility to players; `region.shapes` circle membership math; Pack Sense target-detection via `user.targets` cross-client; Spreading Roots `combat.previous.turn` token resolution; Apex Predator advantage seeding through the dialog; immobilized "this turn" lands one turn long under the next-turn expiry convention. **See the Green / Territory section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-15 DELTA — CONTESTED-ROLL RESOLUTION: kill the "soft laziness" (ENGINE-ONLY; F5/relaunch — NO rebuild)

Ben's directive: wherever a contest CAN be computed, the engine must resolve it — no more "compare your Blue test yourself / GM adjudicates" reminder cards. New reusable contest core + per-talent rewires, all engine-only via `module-src-sync.js push`.

### New REUSABLE tool — contest core (`register-skills.js`, right after `edhaKeptD20Nat`)
- **`edhaQueueContest(owner, color, onResolve)`** — a talent's `useItem` queues a contest (capturing `game.user.targets` at use time); a roll-watcher (`edhaContestWatch` on skill/attack/itemRoll) captures the talent's **own d20 test**; `edhaTryResolveContest` ties them and runs `onResolve({ total, nat })`. **Order-independent**: matches whether `useItem` fires before or after the roll, and tolerates a slow roll **dialog** (roll-after window = `EDHA_CONTEST_TTL` 120 s; roll-before window = `EDHA_CONTEST_BACK` 8 s). Cancelling the roll dialog = no roll = no apply.
- **`edhaReadDefense(actor, key)`** — `system.defenses.<cog|spi|phy>.value`. **`edhaRollOpposedSkill(target, skillId, attrId?)`** — auto-rolls a target's own skill (rank + linked attr; `ath`→`str`) for opposed contests. **`edhaPromptDC(title, hint)`** — DialogV2 (Dialog fallback) number prompt for tests with no static DC; returns a number, or `undefined` = "judge it". **`edhaRewriteOrRelay(actor, oldTotal, newTotal, note)`** — rewrites an already-rendered roll card's total (GM-direct, or a new **`rewrite-roll`** socket relay to the GM), falling back to a reported number.

### Per-talent (was → now)
- **False Premise / Counterspell / Read Intent / Ghostly Walls** (Blue, `skill_test`) — auto-compare **Blue vs the target's Cognitive defense**; on ≥ they auto-apply (disadvantage / "talent fails" / GM-reveal prompt / Immobilize + Absolute-Stillness Weakened) and post the verdict; on a miss, "no effect". No target/defense → the old manual card as a fallback.
- **Redirect Momentum** (Blue, opposed) — auto-rolls the **mover's Athletics** (rank + Str) vs your Blue total; posts the decided outcome (reduce/push [Size]; GM positions the token).
- **Counterpoint** (White, `skill_test`) — queues the White test, **prompts for the DC** (the enemy's influence result); on ≥ auto-spends 1 Inv + negates + Disorients. Split off Overwhelming Authority (a flat no-test apply).
- **Shared Conviction / Concordant Presence** (no static DC) — the reaction/grant card click now **prompts for the DC** and resolves: Shared Conviction reports whether the +White-mod boost turns the failure into a success; Concordant grants the Plot Die only if the first ally met the DC. "No DC — judge it" falls back to the old behavior.
- **Voice of Authority / Bound by Word** — now **rewrite the original roll card** to the disadvantaged / swapped total (GM-direct or relayed), instead of "GM applies the lower/higher".

### Notes for Ben
- **DC prompts** appear on the GM's client when resolving Counterpoint / Shared Conviction / Concordant — enter the difficulty (or "No DC — judge it"). This is the agreed cost of Foundry tests carrying no built-in DC.
- **Roll-card rewrite** is best-effort: it works directly when you're the GM (the single-test-actor pass), relays to the GM otherwise, and degrades to a posted number if the original message can't be found.
- Untouched (genuinely no roll to capture): Pattern Recognition / Probability Cascade / Anticipate / Intercept / Subtle Suggestion stay flag-appliers (they cost Inv, they don't roll a contest).

### LIVE-VERIFY: the updated contest items across the White (Coordination/Accord) + Blue (Calculation/Illusion/Foresight) sections of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — engine-only, NO ⟳ Sync / rebuild.** `node --check` clean + validators pass; in-Foundry verification is Ben's single-pass test-actor run this evening.

---

## 2026-06-14f DELTA — BLUE / FORESIGHT specialty wired → BLUE TREE COMPLETE (ENGINE-ONLY off `useItem`; NO rebuild)

Blue tree-by-tree finishes: **Foresight (8) done → the BLUE tree is fully wired (Calculation + Foresight + Illusion).** A prediction/initiative tree, so most of it is genuinely MANUAL (hidden declarations, fast/slow-turn choices, telepathy — no Foundry hooks). The automatable half **REUSES** the Calculation `nextTestMod` flag + the reminder-card pattern — **no new primitives, no data change, no pack rebuild.** Per-talent specs were proposed to Ben and signed off first.

### Per-talent
- **Intercept** (Reaction, 1 Inv) → on use → card → **disadvantage on the designated creature's next test** (`nextTestMod` disadvantage, count 1; "designated via Forewarned" owner-judged). Cost paid by the activation.
- **Reactive Analysis** (Special, 1 Inv) → on use → **advantage on YOUR next test** (`nextTestMod` advantage on self; "against them" owner-judged).
- **Read Intent** (1 Action, 1 Inv, `skill_test`) → rolls Blue + pays cost natively → reminder card (Blue vs the target's **Cognitive defense**; on a success the **GM reveals the creature's intended action**).
- **Collected** (passive) → **already done** (data-side `+2 Cog / +2 Spi` defenses AE; ⟳ Sync a stale owned copy).
- **Forewarned / Telepathic Network / Probable Outcome** → **MANUAL** (hidden "declare a character + action" + untracked "gain 1 Reaction"; scene-long telepathy + "share expertise"; changing your fast/slow choice — none have hooks).
- **Calculated Patience** (passive) → **MANUAL + a toggle**: new console/macro API **`edha.calculatedPatience(tokenOrActorOrName?)`** grants advantage on your next test (call it when you take a slow turn; reuses `nextTestMod`). Added to the `edha.*` API.

### Notes for Ben
- **Telepathic Network** is left as a narrative use-note (per your "default"); **Anticipate** (Calculation) still approximates "your Telepathic Network" as in-range Blue allies rather than a tracked membership — flag me if you want a literal network roster later.
- No GM-online dependency here (everything fires off the owner's own `useItem` / the API).

### LIVE-VERIFY: the **Blue / Foresight** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (Collected's AE is already in the pack from the White rebuild; nothing else is data-side). Couldn't self-verify (no Foundry session): the `nextTestMod` advantage/disadvantage application, the `edha.calculatedPatience` toggle, the Read Intent Cog-defense readout.

---

## 2026-06-14d DELTA — BLUE / CALCULATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Blue tree-by-tree begins: **Calculation (8) done.** The tree's signature is **cognitive control** — imposing or granting (dis)advantage on a creature's **next test**, plus Disorient. Every talent's cost is consumed by its own activation, and each one fires off `cosmere-rpg.useItem` **on the owner's own client** (where they hold their target) → so there's **NO GM-gating** (no "GM must be online" limit like the watcher-based trees) and **NO pack rebuild** (talents stay `events:{}`; deployed via `module-src-sync.js push`, F5/relaunch only). One new reusable primitive; the rest is reuse.

### New REUSABLE tool
- **Counted next-test (dis)advantage flag** — `flags.edha-content.nextTestMod = { mode:"advantage"|"disadvantage", count, skill:<id>|null, source }`. `edhaNextTest{PreRoll,Consume}` mirror the Black `advTest` / `cogDisadv` flags: pre-roll sets `roll.options.advantageMode` + `configureModifiers()` (and wraps `configureDialog`), the post-roll hook **decrements `count`** and clears at 0. `skill:null` = ANY test (skill/attack/item); a non-null skill gates to that skill id. `edhaSetNextTestMod(target, mod)` writes locally or relays via the existing **`set-flag`** action (so a player can debuff a GM-owned enemy). **Reach for this for any "give X (dis)advantage on its next N tests" talent.**
- **`edhaPostCalcTestCard` / `edhaCalcTestClick`** — a whispered card that applies the flag to a chosen creature (button-per-candidate, or a "target then click" fallback). `edhaPostCounterspellCard` — a reminder card showing the target's Cognitive defense (`system.defenses.cog.value`).

### Per-talent wiring (all on `useItem`)
- **Subtle Suggestion** — REUSES the Accord **disorient card** (`edhaPostDisorientCard`): on use, target → Disoriented with owner-relative expiry.
- **Pattern Recognition** — on use (pays 1 Inv), card → disadvantage on the target's **next test** (`nextTestMod` count 1).
- **Probability Cascade** — on use (Opportunity + 1 Inv; Opportunity is GM-trusted), card → disadvantage on the target's **next two tests** (count 2).
- **False Premise** (`skill_test`) — on use it **rolls Blue** + pays 1 Inv; the card shows the target's Cog defense and, on a judged success, applies disadvantage to their next test.
- **Anticipate** — on use (1 Inv), card lists **you + in-range (Blue) allies** → **advantage** on the chosen character's next test ("resistance test").
- **Counterspell** (`skill_test`) — on use it **rolls Blue** + pays 2 Foc + 1 Inv; a reminder card shows the activating creature's Cog defense (on a success the activated talent fails — GM-narrated).
- **Composed** — already done (data-side `+@tier` max-focus AE; the Blue copy already carries it, baked into the leyline pack by the White Bulwark rebuild).
- **Baleful** — **manual** (passive: "resist your influence costs +tier focus" — no Foundry hook for resisting influence).

### System facts used
- `cosmere-rpg.useItem` fires for **`skill_test`** activations too (confirmed in the 06-14c Accord pass), so Counterspell / False Premise post their cards on use AND roll Blue + pay cost natively — the engine only adds the apply/reminder step.
- The standing rulings cover the rest: "influence / success / objective" are owner-judged via a card button (Foundry tests have no DC); Disoriented auto-expires via the timed-status pass.

### Known limits / notes for Ben
- **`nextTestMod` with `skill:null` consumes the literal NEXT test** of any kind the target rolls (it can't tell which test was "meant"); like the Black `advTest`, it has **no round-expiry** (Pattern Recognition's "this round" qualifier isn't enforced — the flag persists until a test consumes it).
- **Subtle Suggestion text says "until the START of your next turn"** but the engine reuses the established Disoriented expiry = **END of your next turn** (the timed-status pass is turn-granular and can't express "start"); a one-turn over-extension. NOT changed — flagged per the no-balance-pass rule.
- A creature could in principle hold both a legacy `advTest`/`cogDisadv` flag and `nextTestMod`; whichever hook runs last wins the `advantageMode` write (negligible overlap — different trees/dispositions).

### LIVE-VERIFY (F5/relaunch — no Sync; nothing on the talents changed): see the **Blue / Calculation** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): `useItem` firing for the skill_test talents, the `nextTestMod` pre/consume + countdown across roll types, the `set-flag` relay onto a GM-owned enemy, the Disorient expiry window.

---

## 2026-06-14e DELTA — BLUE / ILLUSION specialty wired (ENGINE-ONLY off `useItem`; real summoned tokens via `edhaSummon`; NO pack rebuild)

Blue tree-by-tree continues: **Illusion (8) done.** A mostly **narrative** tree; the automatable half spawns **REAL friendly tokens** through the shared `edhaSummon` engine. **Per-talent specs + rulings were proposed to Ben and signed off BEFORE coding** (the first attempt was reverted for shipping without sign-off — see the PROCESS note up top). Engine-only/name-based off `cosmere-rpg.useItem`; **no data/authored change, no pack rebuild.**

### `edhaSummon` extended (reusable)
- **`spec.tokenSizeFt`** → sets the summon's prototype-token width/height (grid squares = `round(sizeFt / scene grid distance)`). Used by Holographic Illusion ([Size]-footprint token).
- **`spec.extraFlags`** → merged into the summon's `flags.edha-content` (Phantom Double sets `phantomDouble:true`).
- `defensePenalty: 99` is the idiom for **"no defenses"** (`max(0, casterDef − 99) = 0`).

### Per-talent (all on `useItem`)
- **Phantom Barricade** (1 Action, 1 Inv) → `edhaSummon` a friendly object: **HP `2d(2·@skills.blue.rank+2)`** (= 2[Die]), **speed 0, no attack, no defenses**, sustain-multiple. Cover + movement-block = the token's physical presence (GM positions); lasts until HP 0 / scene end.
- **Phantom Double** (2 Actions, 2 Inv) → drops the caster's existing illusion (**max 1**, `edhaClearPhantomDoubles`) then `edhaSummon` a copy of **you or the targeted ally** — token art via `edhaTokenArt(dup)`, **HP 1**, speed 0, no defenses, flagged `phantomDouble`. **Any hit drops it to 0 → the updateActor HP-watch deletes the illusion** ("attacks pass through harmlessly, ending it"). The Perception-vs-Blue-defense test + the "advantage vs those who failed" are **MANUAL/GM** (per a use-note), per Ben.
- **Holographic Illusion** (Free, 1 Inv) → `edhaSummon` a no-stats token (HP 1, speed 0, no attack) **sized to [Size]** via `tokenSizeFt`. Static; GM moves/edits it.
- **Living Image** (Special) → a use-note marking illusions mobile/interactive; the **1 Inv/round upkeep is GM-tracked** (narrative).
- **Ghostly Walls** (1 Action, 2 Inv, `skill_test`) → rolls Blue + pays cost natively; card → on a judged success, **Immobilize** the target (movement 0) until the **end of YOUR next turn** (owner-relative via `edhaApplyTimedStatus(expire:"owner")` — unlike Sovereign of Solitude's target-relative immobilize).
- **Absolute Stillness** (passive) → rider on Ghostly Walls: if owned, the target ALSO becomes **Weakened** (= "disadvantage on Physical tests"). "Cannot take Reactions" stays GM-tracked.
- **Redirect Momentum** (Reaction, 1 Inv, `skill_test`) → rolls Blue + pays cost natively; **reminder card** (Blue vs the mover's Athletics; reduce remaining move by **[Size]** or push **[Size] ft** — GM applies; Foundry has no "remaining movement").
- **Phantom Step** (passive, type `none`) → no `useItem` fires → **manual** (an ally may move +[Size] ft without provoking Reactions).

### Known limits / notes for Ben
- Summons need **ACTOR_CREATE** perm (GM, or a player the GM has granted it) — same as every other summon.
- `edhaSummon` drops the token **next to the caster** (no click-to-place), so the GM repositions the barricade/double/illusion. Movement reduction / push / cover / illusion fiction are GM-narrated.
- Phantom Double copies the chosen creature's **token art + name**, not its stats — it's a 1-HP prop; the "treat as real" + conditional advantage are GM-run.

### LIVE-VERIFY: the **Blue / Illusion** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (nothing on the talents changed). Couldn't self-verify (no Foundry session): the summon HP/size/art, the Phantom-Double delete-on-hit, the Ghostly Walls owner-relative immobilize + Absolute Stillness Weakened rider.

---

## 2026-06-14c DELTA — WHITE / ACCORD specialty wired (engine-only EXCEPT Unyielding Accord drag-AE = pack rebuild) → WHITE TREE COMPLETE

White tree-by-tree finishes: **Accord (8) done → the WHITE tree is fully wired (Coordination + Bulwark + Accord).** Accord is the most narrative tree — "influence", verbal accords, and "objective tests" have no Foundry events — so it leans on owner-judged cards + native conditions.

### System facts (verified)
- **`determined` and `disoriented` are native cosmere conditions** (`condition:true`, real icons — index.js ~L348/356) → toggle the icon with `toggleStatusEffect`; the mechanical rules are GM-applied (same as the §8b adversary Slowed/Afflicted templates).
- **`cosmere-rpg.useItem` fires for EVERY activation type** incl. `skill_test` (the hook is pushed to `postRoll` unconditionally — index.js ~L7206), so Counterpoint (skill_test) is caught by the use-hook.

### Rulings (Ben, 06-14c)
A = **build owner-relative auto-expiry** for Disoriented (ends at the end of the OWNER's next turn); B = Bound-by-Word **card**; C = Unyielding Accord **manual** (ships a drag-AE); D = Counterpoint/Overwhelming **cards** apply Disoriented; E = Voice of Authority is a **card** (reactions aren't tracked in combat) that re-rolls the enemy attack as disadvantage.

### Per-talent
- **Collective Resolve** — on use → toggle **Determined** on in-range allies.
- **Counterpoint / Overwhelming Authority** — on use → whispered card → apply **Disoriented** to the target (owner-judged success), with **owner-relative expiry**.
- **Voice of Authority** — `attackRoll`/`itemRoll` watcher: an enemy in range makes a hostile action → whispered card → spend 1 Inv → **re-roll the attack as disadvantage** (roll a 2nd d20, keep the lower, report `origTotal − origNat + keptNat`; GM applies the lower). Once/round/owner.
- **Terms of Accord** — on use → card to forge an accord with an in-range character; stores the owner's **White modifier** (rank + WIL) + whether the owner has Bound by Word, in `flags.edha-content.accord` on the partner (cross-actor via `set-flag` relay). The +1 to objective tests is GM-narrated.
- **Bound by Word** — `skillRoll` watcher on an accord partner with `accord.boundByWord` → whispered card → adopt the accord-maker's White modifier (`d20Nat + ownerWhiteMod`) in place of their own (owner-judged "objective test"; once/round/skill).
- **Disciplined Mind** — manual (no "resist influence" event).
- **Unyielding Accord** — data-side **transfer:false drag-template AE** `+1 Cog/Spi` (drag onto in-range allies adjacent to another ally; remove when they don't qualify). Pack-rebuilt + inspect-verified.

### New engine bits (reusable)
- **`edhaApplyTimedStatus(target, statusId, {owner, expire})`** + relay action **`apply-timed-status`** — toggle a status AND stamp an **owner-relative** `expireAfter` on its effect (the timed-status expiry pass already deletes any effect with `expireAfter`, so no need to add it to `EDHA_TIMED_STATUSES`). Reuse for any "status until the end of YOUR next turn."
- **`edhaWhiteMod(actor)`** = `@skills.white.rank + @attr.wil`.
- Accord cards (disorient / forge / voice-reroll / bound) — all `data-*` payloads, whispered, GM-gated watchers.

### LIVE-VERIFY: the Accord section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (the leyline pack was rebuilt for the Unyielding Accord AE). Couldn't self-verify: Disoriented owner-relative expiry timing, the Voice re-roll math at the table, the `apply-timed-status` relay, accord-flag persistence + the Bound-by-Word swap.

---

## 2026-06-14b DELTA — WHITE / BULWARK specialty wired (engine-only EXCEPT Hardy = pack rebuild + ⟳ Sync)

White tree-by-tree continues: **Bulwark (8) done.** A damage-mitigation / redirection / retaliation tree built almost entirely on the **`applyDamage` wrapper** (`edhaWrapApplyDamage`) — the same pre-pass/post-pass engine as Severance, heal-cut, and Mender's Instinct. NAME-BASED (talents stay `events:{}`) EXCEPT **Hardy**, which is a data-side ActiveEffect (so this pass DID rebuild the leyline pack — relaunch + **⟳ Sync**).

### Model (Ben's rulings, all defaults)
- **A — optional reactions use the Mender's-Instinct model:** the system applies damage synchronously, so an optional (player-choice + cost) reaction can't pre-empt it. Interposing Shield / Shared Burden / Unbreakable Line therefore post a **whispered post-damage card** that heals-back / redirects / revives. Net HP is identical; the hit briefly lands then is restored. **Passives** (Shield Wall, Devoted Conduit) have no choice → they truly **pre-reduce** in the wrapper pre-pass.
- **C1 — Devoted Conduit** ("damage intended for another creature") fires **only on REDIRECTED damage** (Shared Burden's "in their place" hit, tagged `options.edhaRedirected`) — the auto-detectable case.
- **D — tests are owner-judged:** Retributive Guard ("White vs Spiritual") and Unbreakable Line ("White DC = ½ damage") cards ACT on click; the player rolls the test and clicks only on success (mirrors Coordination 1c).
- **E — Guardian Stance stays a manual toggled-OFF +1 Deflect AE** (already baked; the adjacent ally's copy is tracked by hand). No engine.

### Per-talent
- **Hardy** — data-side AE `system.resources.hea.max.bonus += @level` (clone of Black; `_id` WhiteHardyMaxHP1). **Pack-rebuilt + inspect-verified.** (Green Hardy still lacks it — next carry-over.)
- **Shield Wall** (passive) — pre-pass: victim **adjacent** to a Shield Wall owner who has **≥2 adjacent allies** → −floor([Tier][Die]/2). (Chebyshev ≤1 square = adjacency.)
- **Devoted Conduit** (passive) — pre-pass: on REDIRECTED damage to an in-Attunement-Range ally → −floor([Tier][Die]/2).
- **Interposing Shield** (reaction, 1 Inv) — ally within 10 ft takes damage → card heals back **floor([Die]/2)** + "move 10 ft".
- **Shared Burden** (reaction, 2 Inv) — adjacent ally takes D → card heals them **floor(D/2)** and deals that to the owner as `vital` (tagged `edhaRedirected` → Devoted Conduit can reduce it; guarded against cascade).
- **Retributive Guard** (reaction, 1 Inv) — adjacent ally hit by an enemy in your Range → card deals **[Tier][Die] spirit** to the attacker.
- **Unbreakable Line** (special, 3 Inv, 1/round) — adjacent ally drops to 0 → card sets them to **1 HP** (DC = ceil(½ damage) shown).
- **Guardian Stance** — manual (baked toggled-OFF +1 Deflect AE).

### New engine bits (reusable)
- **applyDamage pre-reduce** (`edhaReduceInstances`) + **adjacency helpers** (`edhaAdjacent` Chebyshev, `edhaAdjacentAllies`).
- **Bulwark reaction cards** (`edhaBulwarkReactions` post-pass, GM-gated/whispered; `edhaPostBulwarkCard` + `edhaBulwarkClick`) with actions heal-ally / redirect / retaliate / revive — payload in `data-*` attributes (cross-client safe, per the 06-14 §10 gotcha).
- **`edhaCrossHeal` / `edhaCrossDamage`** — do-if-owner-else-relay (burst-apply) helpers; reuse for any cross-actor heal/damage from a card.
- `options.edhaRedirected` damage tag — "damage taken in another's place" (drives Devoted Conduit + cascade guard).

### LIVE-VERIFY: see the Bulwark section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (Hardy changed the pack). Couldn't self-verify (no Foundry session): adjacency math at the table, the redirect re-entry + Devoted Conduit reduction, evaluateSync dice in the pre-pass, the GM-posted/owner-clicked card relay for cross-actor heals.

---

## 2026-06-14 DELTA — WHITE / COORDINATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

White tree-by-tree begins: **Coordination (8) done.** The tree's signature is the **Plot Die** ("raise the stakes") + ally-support — a mechanic family the Black tree never touched. Like Subjugation, it's a **NAME-BASED** engine block (`register-skills.js`, deployed via `module-src-sync.js push`; talents stay `events:{}`; NO `foundry-build`, NO ⟳ Sync — F5/relaunch only). The one data-side piece (Mending Aura's `edha-burst`) was authored earlier.

**Key system finding (verified in `cosmere-rpg` index.js):** the Plot Die injects EXACTLY like advantage — `D20Roll.hasPlotDie` reads `options.plotDie` (~L3780); `configureModifiers()` pushes the `PlotDie` term when set, idempotently (~L4017); the dialog seeds its checkbox from `data.raiseStakes` (~L3691); and the `skillRoll`/`attackRoll`/`itemRoll` hooks fire with an **already-evaluated** roll (~L5317→5321), so `roll.complicationsCount` / `opportunitiesCount` / `total` are readable post-roll.

### New REUSABLE tools
- **Plot-die grant primitive** — `flags.edha-content.plotDieNext = { skill:<id>|null, source }`. `edhaPlotDie{PreRoll,Consume}` mirror the `advTest` flag: set `roll.options.plotDie=true` + `configureModifiers()` (fast-forward) and wrap `configureDialog` to set `data.raiseStakes=true` (dialog). Skill-gated grants wait for the matching test. **Reach for this on any "raise the stakes / grant a Plot Die" talent.**
- **`edha.raiseStakes(tokenOrActorOrName, skillId?, source?)`** — console/macro API to grant the Plot Die manually (Unity of Purpose, or any GM call). Cross-actor writes relay via a new socket action **`set-flag`** (set any `edha-content` flag on a remote actor; a player rarely owns another PC).
- **Plot-grant card** (`edhaPostPlotGrantCard`) — lists in-range allies as buttons; click → `edhaGrantPlotDie` onto the chosen ally. Drives Guiding Signal + Concordant Presence (ruling 3 = chat-card recipient pick).
- **Coordination watcher** (`edhaCoordWatch`, post-roll `*Roll` hooks, **GM-gated**, cards **whispered to the owner**) — inspects each completed **ally-in-range** test (same-disposition token within the owner's White Attunement Range) and surfaces the matching card. Reuses a `coordRound` once/round store + `edhaWhisperIds`.
- **Coordination reaction card** (`edhaPostCoordReactionCard`) — whispered "you may react" card; click deducts the owner's OWN cost(s) (array of `{resource,value}`) + posts the result. Once/round/owner/talent gate (approximates the 1-reaction economy).
- **In-range ally helpers** — `edhaAttuneFtColor` / `edhaAlliesInAttune` / `edhaAllyInAttune` (color-parametric; the Black `edhaWithinAttune` was black-hardcoded).

### Per-talent wiring
- **Mending Aura** — already done (`edha-burst` heal, `floor([Tier][Die]/2)`).
- **Guiding Signal** (active) — `useItem` → grant card (cost paid by the activation; card is free).
- **Concordant Presence** (passive) — watcher posts a same-skill grant card (once/skill/round), owner clicks the recipient only if the triggering ally **succeeded** (ruling 1c — Foundry has no DC).
- **Beacon of Stability** — extends the White Draw Mana rider (`edhaDrawMana`): a cleanse card removes one condition from an in-range ally for 1 Inv.
- **Shared Conviction** (reaction) — watcher posts on a **plausible failure** (Complication or kept d20 ≤ 10); click spends 2 Foc + 1 Inv, adds the owner's White modifier (**rank + WIL**, ruling 2) to the ally's total.
- **Pillar of Order** (reaction) — watcher posts on an ally **Complication**; click spends 1 Inv → "Complication negated (blank face)" note (ruling 4 = tracked note, not a die re-render).
- **Unity of Purpose** — MANUAL (aid is untracked) → `edha.raiseStakes`.
- **Ordered Advance** — cost wired by activation; `useItem` posts a round note (no-provoke movement is GM-narrated; no opportunity-attack hook exists).

### Rulings applied (Ben, 2026-06-14)
1c = owner-judged "success"; 2 = White mod is rank + attribute (WIL); 3 = chat-card recipient pick; 4 = Pillar negation is a chat note; 5 = a granted Plot Die can roll its own Complication (intended — and Pillar can then negate it).

### Known limits
GM-gated watcher → the Concordant/Shared/Pillar cards only post when a **GM is online** (Guiding Signal / Beacon / `edha.raiseStakes` work from the owner's client regardless). "Would fail" / "succeeded" are owner-judged. Reaction economy is per-talent (global 1/round stays GM-tracked). **Hardy (White copy) still lacks the +level max-HP effect** — carry-over from Black; do in the White/Bulwark pass.

### LIVE-VERIFY (F5/relaunch — no Sync, nothing on the talents changed): see the White section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): Plot-Die dialog pre-check, `complicationsCount` read, the `set-flag` relay, the whisper routing.

---

## 2026-06-13c DELTA — BLACK / SUBJUGATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Black tree-by-tree continues: **Subjugation (8) done.** Mostly focus-economy + control; the automatable half is a **NAME-BASED** engine block (like Blood Price / Sanguine Reservoir — fixed-canon passives, so the engine keys off the talent NAME, no per-talent rule; the talents stay `events:{}`). **Engine-only — pushed via `module-src-sync.js`; NO `foundry-build` (packs untouched).** Name-based engine passives now: Blood Price, Sanguine Reservoir, Whispered Doubt, Coercive Pressure, Predatory Insight, Siphoned Will.

- **Focus watcher** (`preUpdateActor`→`updateActor`, GM-side): a creature whose `foc` DROPS drives **Whispered Doubt** (enemy in your Attunement Range loses 1 more focus, once/round/enemy), **Coercive Pressure** (creature in range → disadvantage on its next Cognitive test, once/round/creature), **Predatory Insight** (you regain 1 focus when any creature hits 0). preUpdate stashes old→new in `options.edhaFoc`; `_edhaInFocusWatch` + `options.edhaFocusWatch` guard the follow-up writes.
- **Cog-disadvantage flag** (`flags.edha-content.cogDisadv`) — mirror of Weakened for int/wil tests; set by Coercive Pressure, consumed on the next cog test (pre/consume on `pre*Roll`/`*Roll`).
- **Next-test advantage flag** (`flags.edha-content.advTest = "<skillId>"`) — Predatory Insight active half (on use → `advTest:"dec"` → advantage on next Deception); consumed on the matching test. Generic (reusable for any "advantage on next <skill>").
- **Siphoned Will** — Hollow Command has NO success hook, so its `cosmere-rpg.useItem` posts a one-click **focus-confirm chat-card** (regain focus = tier) when the owner also has Siphoned Will (reuses `edhaPostTriggerCard`).
- **Composed** already done (ActiveEffect `+@tier` max focus).
- **Manual by nature (no Foundry enforcement):** Hollow Command/Puppeteer action-denial + forced actions, Extract Thought reaction-denial — rolls/costs are wired; the control is GM-narrated.
- **Isolation positioning — stays manual (no "moved adjacent" / willing-movement hook):** Cruel Step (10 ft toward an Isolated target, no Reactive Strike), Unnerving Approach (push an enemy's ally [Size] ft to strand it), Dread Presence (Weakened creatures can't close on allies) — Investiture costs are wired by activation; the displacement + Isolated check are table rulings (same GM-narrated convention as Ordered Advance / Redirect Momentum, pre-Momentum pilot).

**Known limits:** the focus watcher is GM-gated → it fires off GM-initiated focus changes (enemies spending / hitting 0 — the intended case); PLAYER-initiated PC focus changes don't trigger reactions (fine — Whispered Doubt is enemy-only, and it avoids self-debuffing allies via Coercive Pressure). Only bites creatures that actually spend `foc`. "Advantage this round" (Predatory Insight) has no round-expiry — the flag persists until the next Deception test consumes it. Relies on `options.edhaFoc` surviving to the GM's `updateActor` on the same client (true for GM-initiated changes).

**LIVE-VERIFY (F5/relaunch — no Sync needed, nothing changed on the talents):** GM spends an enemy's focus near a Whispered-Doubt PC → enemy loses 1 extra; near a Coercive-Pressure PC → its next int/wil test rolls disadvantage; drop any creature to 0 focus → Predatory-Insight owners gain 1; use Predatory Insight → next Deception rolls advantage; use Hollow Command while owning Siphoned Will → focus-confirm card.

---

## 2026-06-13b DELTA — BLACK TREE: ISOLATION + RITUAL SPECIALTIES COMPLETE + NEW ENGINE TOOLS (built + pack-verified via inspect-pack; relaunch + ⟳ Sync to load)

Tree-by-tree review reached the **Black** tree. **Isolation (8) and Ritual (8) specialties fully wired** in `data/authored/leyline-black.json` + `module-src/scripts/register-skills.js`; deployed via `node scripts/module-src-sync.js push`, rebuilt with `node scripts/foundry-build.js leyline`, spot-checked with `inspect-pack.js`. **The new tools below are reusable — reach for them on later trees.**

### New EVENTS
- **`edha-on-hit`** — fires when YOUR attack actually **APPLIES** damage (a real hit), dispatched by the `applyDamage` wrapper (`edhaDispatchOnHit`, `_edhaInTrigger`-guarded). Pair it with an `edha-triggered-effect`. **Owner-wide** for passive talents; **item-specific** for attack talents that carry `system.damage.formula` (only fires on THAT talent's own hit). **Use this — NOT `edha-deal-damage` — for any "on hit" effect** (deal-damage fires on every attack ROLL incl. misses; see the new §10 gotcha).
- **`edha-pre-test`** — sentinel for `edha-test-rider`, read by the pre-roll injector.

### New HANDLERS
- **`edha-test-rider`** — passively adds a bonus to a skill/attack **TEST**. The system can't buff a test from a passive, so we inject via its native "Temporary Bonus" field: resolve the formula and append the term to the d20 roll in `pre{Skill|Attack|Item}Roll` (works fast-forward AND dialog; no double-count). Fields: `appliesTo` (any/attack/skill/item), `bonusFormula`, `whenTargetStatus`, `whenTargetIsolated`. (Predatory Patience: +[Die] vs Weakened.)
- **`edha-ritual-hp-cost`** (event `use`) — the HP-cost **keystone**: caster loses HP = `formula` (rolled, so dice like half-[Die] work), flags Blood Price advantage, and banks Reserve if they own Sanguine Reservoir. (Withering Ray, Dark Investiture.)
- **`edha-heal-cut`** (sentinel `edha-apply-watch`) — on a matching-`color` attack hit, halve the target's healing until the **end of YOUR (owner's) next turn**. Fields: `color`, `fraction`. (Necrotic Grasp.)
- **`edha-triggered-effect` gained `whenTargetStatus`** — gate a trigger on the victim's status (checked in the executor and in the on-hit dispatch), mirroring the damage-rider's field. (Predatory Patience Inv-regain only vs Weakened.)

### New ENGINES / mechanics
- **Affliction damage engine** — the system has the `afflicted` icon but ZERO per-turn damage. Now `kind:affliction` triggered-effects STORE the rolled amount on the victim (`flags.edha-content.afflictions`) and **auto-deal it at the start of the carrier's turn** (`combatStart`/`combatTurnChange`, GM-gated, re-entrancy-guarded); cleared when the Afflicted condition is removed (`deleteActiveEffect`). (Dark Investiture — **Model A**: the hit deals an immediate [Tier][Die] tick AND sets up the ongoing affliction; one tick more than the strict text, the only way to auto-gate on success.)
- **Timed-status expiry generalized** — `EDHA_TIMED_STATUSES = {weakened, immobilized}` (was weakened-only). Immobilized (Sovereign of Solitude) now auto-expires end of its next turn. The same expiry pass also honors **owner-relative** coordinates (heal-cut stamps the OWNER's next-turn coord) — one engine, no duplicate.
- **Reserve** — flag-based pseudo-resource (`flags.edha-content.reserve`, cap = ranks in Black), mirrors the Temp HP infra; budget-bar readout `Reserve X / cap`. Banking is automatic (keystone). **Spending** Reserve (as Investiture / Double Dip's HP-substitution) is a tracked-manual ruling (Scope A).
- **Blood Price advantage** — ritual-HP-cost sets `flags.edha-content.bloodPriceAdv`; the next **Black** test rolls with advantage then clears it (`pre*Roll` sets, `*Roll` consumes; Black test = `roll.data.skill.id === "black"`). Mirror of the Weakened disadvantage pattern.

### Content deltas
- **Isolation:** Sapping Hex + Predatory Patience (Inv-regain) **retrofitted `edha-deal-damage` → `edha-on-hit`** (they were firing on missed rolls). Predatory Patience also got the test-rider; Sovereign of Solitude got immobilize-on-success. Spoils/Severance unchanged. Sapping Hex text/notes now say "becomes Weakened" (unified duration; stale "REMOVE MANUALLY" note gone — closes the 06-13 PENDING).
- **Ritual:** Hardy (ActiveEffect `+@level` max HP), Dark Investiture (HP cost + auto-affliction), Necrotic Grasp (heal-cut), Withering Ray (HP cost; attack+damage already correct), Blood Price + Sanguine Reservoir (keystone-driven, no per-talent rule), Double Dip (skill-test only; Reserve-spend manual), Predator's Due (already done).
- **NOTE — Hardy appears in White & Green trees too** (same talent/text); only the BLACK copy got the max-HP effect. Sync the others when those trees come up (or ask Ben).

### LIVE-VERIFY (relaunch + ⟳ Sync first)
Predatory Patience +[Die] only vs Weakened + Inv on a real hit; Sapping Hex/Predatory Patience DON'T fire on a miss; Dark Investiture afflicts + auto-ticks at the target's turn start (remove the icon to stop); Necrotic Grasp halves a hit creature's healing; Blood Price → advantage on the next Black test; Reserve readout grows as you pay ritual HP; Sovereign immobilizes on a hit. Couldn't self-verify: the half-[Die] cost formula resolving, affliction tick timing, heal-cut halving, Blood-Price advantage detection.

---

## 2026-06-13 DELTA — WEAKENED REWORKED TO A FIXED DURATION + GENERIC TIMED-STATUS EXPIRY (engine-only; F5 to load)

**Ruling (Ben): Weakened no longer self-consumes on the first physical test — it gives DISADVANTAGE on EVERY physical (str/spd) test while it lasts and ALWAYS falls off at the END of the affected creature's next turn.** The 06-11c consume-on-first-test model was too weak: it could vanish before the Black tree's Weakened payoffs (Spoils of Isolation / Sovereign of Solitude / Predatory Patience) got their turn.

- **Engine (`register-skills.js`, runtime-JS only — F5, packs untouched):** removed `edhaWeakenedPostRoll` + its `cosmere-rpg.{skill|attack|item}Roll` hook (the consume). Kept the pre-roll disadvantage hook — it now fires on every str/spd test, since the status persists.
- **New generic timed-status expiry pass:** an effect carrying `flags.edha-content.expireAfter = {round, turn}` is removed once the combat pointer advances PAST that coordinate (i.e. at the END of that turn), with a chat note. Runs on `combatStart` / `combatTurnChange` + a `ready` restore, GM-gated to one GM (same pattern as the def-buff refresh). **This is the turn-based expiry engine §9 said didn't exist — now it does, scoped to Weakened.** Reusable: any future timed effect (e.g. Pyre/hazard durations) can set the same `expireAfter` flag.
- **Stamping (`createActiveEffect`, GM-side):** Weakened stamps its NEXT-turn coordinate on apply — applied *before* the creature acts this round (turn index > current turn) → end of its turn THIS round; applied on/after its turn (incl. its own turn) → end of its turn NEXT round. Any apply path is covered (Sapping Hex, Black Draw Mana, manual toggle, `edha.toggleStatus`). Out of combat it isn't stamped on apply; the pass lazily stamps it once combat is running, then it expires normally.
- **LIVE-VERIFY (F5, no rebuild):** in combat, apply Weakened → confirm disadvantage on multiple str/spd tests (not just the first) and NO disadvantage on a Lore test → confirm it auto-clears at the END of the creature's next turn (chat note) → confirm Spoils of Isolation / Sovereign of Solitude / Predatory Patience still see it Weakened on the Outlaw's turn.
- ~~PENDING: Sapping Hex's "(REMOVE MANUALLY)" note~~ **DONE 2026-06-13b** (fixed + rebuilt in the Black pass).

---

## 2026-06-12 DELTA — PACK-PATH SCHISM FIXED + WORKFLOW HARDENING (disk-verified; in-Foundry verify = the standing 06-11b checklist)

**The 06-11b `packs/v3/` split had silently broken the whole round-trip** and poisoned a commit; all repaired this session:

- **What was broken:** module.json pointed Foundry at `packs/v3/` but extract/build/guard/validators all still targeted `packs/` → the guard protected nothing, builds wrote where Foundry never looked, "validation passed" validated dead packs, and the 06-12 full extract (commit 8456a97) captured **stale pre-v3 content** into `data/authored/` (zero v3 rules — the "25 un-extracted edits" it reported were the v3 diffs seen backwards). Because the authored overlay wins over generator + side-files, the next rebuild would have stripped the v3 automation from ~25 talents.
- **Fix:** consolidated to **`packs/` as the one true path** (copied v3 content over the stale dirs, reverted module.json; `packs/v3/` is dead — delete on sight). Re-extracted all 365 talents from the real packs (v3 rules confirmed present in `data/authored/`), rebuilt all 4 packs (counts match v3: events:36, effects:14, rollable:89, overlays:365), validators passed, and v3 rules spot-checked in the WRITTEN packs (Life Surge overflow-thp, Vital Diagnosis apply-status, Severance convert, Spoils sweep).
- **Effect projection extended (`edha-pack-io.js`):** ActiveEffect **`duration` / `statuses` / `type` now round-trip** (normalized so Foundry-stamped defaults fingerprint identically to absent fields). Timed/ongoing effects and condition icons survive extract — required for the tree-by-tree effects work.
- **Tools moved into the repo** (`scripts/`): `validate-packs.js` (replaces `C:\tmp\validate2.js`; now also counts events/effects and reads via temp-copy = safe with Foundry open), `validate-adversaries.js` (also checks baked effect keys), `inspect-pack.js` (CLI: `node inspect-pack.js edha-deity "Life Surge"` or `--group Red` — prints a talent's rules/effects as Foundry loads them). `run-playtest-build.bat` updated. The `C:\tmp` copies are obsolete.
- **Module runtime is now in git:** `module-src/` mirrors `register-skills.js` + `module.json` + `styles/edha.css` + `lang/en.json` via **`node scripts/module-src-sync.js [pull|push]`**. AppData has no other backup — **run a pull + commit after every engine edit.**
- **AUTHORING RULE (supersedes §9's "author side-file entries"):** all 21 trees are authored overlays now, and overlays MASK side-file entries for existing talents. Author per-talent behavior **in Foundry → extract**, or **hand-edit `data/authored/<atlas>-<tree>.json` → build**. Side-files = bootstrap history; new mechanic PATTERNS = new handler types in register-skills.js.

**NOTE: the installed system is cosmere-rpg v2.1.0** (older text below may say 2.0.4 — the system updated; v2.1.0's native event dispatch is verified working).

---

## 2026-06-11c DELTA — WEAKENED MECHANIC ⚠ SUPERSEDED by 06-13

Original model: disadvantage on the next str/spd test, then consumed. Replaced by a fixed end-of-next-turn duration (06-13). Still current: the pre-roll disadvantage on str/spd tests (`cosmere-rpg.pre{Skill|Attack|Item}Roll` → seed `advantageMode`, wrap `configureDialog`; actor via `edhaD20RollActor`). The post-roll consume was removed. Full history in agent memory.

---

## 2026-06-11b DELTA — V3 ENGINE PASS (built + pack-validated; ⚠ NOT LIVE-VERIFIED — run the checklist below before playtest)

Goal: clear the deferred backlog — the §9 engine to-dos and the triage doc's B-bucket ("trigger-v2 / engine-needed"). Everything below is authored, built into the packs, and verified at the LevelDB level (rules present, effects keyed correctly, `node --check` clean on both scripts); **nothing has run inside Foundry yet**.

### Engine (register-skills.js, now ~2384 lines, v0.2.0)
- **Custom statuses registered:** `weakened` (condition:true), `diagnosed` (mark), `insight` (STACKABLE, Gnothis counter). Added to BOTH `CONFIG.COSMERE.statuses` and `CONFIG.statusEffects` at module init (the system maps statuses→statusEffects in its OWN init, which runs first). Bonus: **Black Draw Mana now auto-applies Weakened** (its `CONFIG.COSMERE.statuses.weakened` check finally finds one). Icons: downgrade/eye/book.svg (core `icons/svg/` set — verify they render; a 404 = blank status icon).
- **New event types:** `edha-take-damage` (real: hook `cosmere-rpg.applyDamage`, document = VICTIM; `TRIG_EVENT` maps `take-damage` now — Prognosis-style watchers no longer emit nothing), `edha-apply-watch` (sentinel for rules read by the applyDamage engine).
- **New handler types:** `edha-apply-status` (mark a target + record owner in `flags.edha-content.markedBy.<status>`; optional party bonus damage), `edha-status-sweep` (damage all [status] creatures in range, THP = total), `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit` (all sentinels read by engine glue).
- **applyDamage wrapper overhauled** (pre-pass mutates instances BEFORE apply, post-pass reacts after): Severance vital conversion vs Isolated victims; Vital-Diagnosis +Tier vital bonus instance on ANY damage vs the marked creature; heal-overflow→Temp HP; Prognosis 1-Inv-per-round when the Diagnosed creature takes damage; Mender's Instinct chat-card prompt when an ally character crosses to ≤ half HP. **Isolated is computed live** (no ally token within 10 ft) — `edha.isIsolated(actor)` to test.
- **Riders** gained `whenTargetCondition` / `whenTargetStatus` filters (checks YOUR CURRENT TARGET — target before rolling). **Triggered effects** gained `whenTargetIsolated` + kind `status` (apply a status; GM-relayed via new socket actions `toggle-status` / `apply-status-mark`). Trigger heals can now target the VICTIM (`target:"victim"`), with a burst-relay fallback when the healer lacks perms.
- **Summons** can carry baked toggled-off ActiveEffects + extra baked abilities (`bakedEffectsJson`/`extraItemsJson` on the rule): Forge Construct now bakes **Siege Form** (Speed 0 via override, deflect 3) + a **Siege Cannon** ranged attack resolved vs the caster at summon time.
- **Edha derivations** (characters only): HP = system + 1 (skipped while the actor's SOURCE still carries a manual `hea.max.bonus` — the pregens), Speed = 20 + 5×SPD + effect bonuses (skipped while the source carries its own movement override). **Run `edha.migrateDerivations()` once as GM** to strip the pregens' per-actor hacks so the derivations take over. Investiture source-override clamp gotcha now self-heals: the derivation PERSISTS `inv.max.{override,useOverride}` to the actor source once per session.
- **⟳ Sync flake hardened:** retries `pack.getDocuments()` vs `pack.index` up to 5× with backoff, warns if still short.
- **API additions:** `edha.migrateDerivations()`, `edha.isIsolated(actor)`, `edha.toggleStatus(actor, statusId, active)`.

### Generator + tables
- `foundry-build.js`: emits the above from **`data/talent-state.json` (NEW)** — kinds: mark / sweep / convert / marked-watch / hp-threshold / multi-hit / overflow-thp; riders + triggers gained the new filter passthroughs; `talent-effects.json` entries may now set `transfer:false` (apply-to-target template) + `statuses:[...]` (token icon).
- **`data/adversary-effects.json` (NEW):** the 17 §8b hand-built world-actor effects, extracted VERBATIM from the live world (Stitchmother Phase 2 / Vital Diagram, Frost Lance Slowed, Brace ×2, trackers, etc.) and baked into the edha-adversaries pack as `!actors.items.effects!<actor>.<item>.<effect>` sub-keys (same split as talent packs; key shape verified against the system's companions pack). **Pack re-imports now keep the adversary automation.**
- Entries authored (B-bucket cleared): Vital Diagnosis (mark, +Tier vital), Prognosis (marked-watch + conditional heal rider), Severance (convert), **Sapping Hex** (deal-damage trigger, Isolated filter → Weakened), **Spoils of Isolation** (sweep; its old flat-roll entry REMOVED to prevent double-apply — rollable count 90→89), Mender's Instinct (hp-threshold), Flashpoint (multi-hit, red), Life Surge + Overgrowth (overflow-thp; the heroic plant 'Overgrowth' twins get the inert rule too — harmless). Forge Construct summon spec gained Siege Form/Cannon.

### Build & packs — ⚠ the `packs/v3/` split here is SUPERSEDED by 06-12 (consolidated back to `packs/`; v3 dirs are dead). Build counts at the time: talents:365 events:36 effects:14 rollable:89; adversaries 9/30 + 17 baked effects; all pack-level spot-checks OK.

### LIVE-VERIFY CHECKLIST (next session / before playtest)
1. **Full relaunch** (module.json changed — F5 is not enough). Confirm the module loads (console: "native event system registered" with the v3 handler list) and all 4 compendia populate from `packs/v3/`.
2. **⟳ Sync** all characters (rerun if short). 3. **`edha.migrateDerivations()`** once as GM → check HP max and Speed on all 4 PCs match the sheets (HP system+1, Speed 20+5×SPD; Walking Ruin still +10 on the Demolisher).
4. Token HUD shows Weakened/Diagnosed/Insight icons (404 icon = swap `EDHA_STATUSES` icon paths). Black Draw Mana auto-applies Weakened in range.
5. **Outlaw:** hit an Isolated dummy → Weakened auto-applies (Sapping Hex) + damage applies as VITAL (Severance chat note); Spoils of Isolation vs ≥1 Weakened enemy → per-target vital + THP = total.
6. **Vivisectionist:** Vital Diagnosis (target first!) → Diagnosed icon + chat; any damage vs the marked creature gains +2 vital; Prognosis recovers 1 Inv (once/round); Verdant Mend vs a conditioned target heals +[Tier][Die] (rider — target BEFORE rolling); Life Surge past max → overflow Temp HP; ally to half HP → Mender's prompt heals the ALLY.
7. **Demolisher:** Flame Surge capturing 2+ → Flashpoint prompt (regain 1 Inv button). Arc Flash regression.
8. **Forgemaster:** Forge Construct summon carries the toggled-off Siege Form effect + Siege Cannon item.
9. **Adversaries:** import a fresh Stitchmother from the pack → Phase 2 / Vital Diagram effects present (re-import no longer loses them).
- Known manual bits: most status DURATIONS still have no expiry engine — remove by hand (EXCEPTION: Weakened now auto-expires at the end of the creature's next turn via the generic timed-status pass — see the 06-13 delta); Sapping Hex fires on the damage ROLL (not a confirmed hit) vs your current target; Lay Foundation persistent friendly zone still missing (region-buff engine); Crown of Thorns still manual (no "which defense was tested" hook).

### New gotchas (operator)
- **Cowork-sandbox mounts serve STALE copies of host-edited files** (new content truncated to the old byte length!) and **cannot delete** module files (EPERM on unlink). Hence: build to NEW dirs (`packs/v3/`), syntax-check by reconstructing head+tail, never trust `wc`/`node --check` through the mount on a file edited host-side this session.
- Item updates that worked: creating files + overwriting bash-written files through the mount is fine; LevelDB pack WRITES to fresh dirs are fine.

---

## 2026-06-11 DELTA — playtest-PC manual-talent triage pass-1 (built, synced, live-verified; world is playtest-ready)

Full triage + per-talent design notes: `TRIAGE_PLAYTEST_PC_MANUALS.md` (next to this doc). Summary:

- **5 new table entries authored + built (deity, heroic; leyline untouched) + ⟳ Synced + live-verified:**
  - **Warlord's Advance** (talent-triggers, `on:kill` → THP `@tier` self) — the `{resource:"inv", value:0, optional:true}` trick WORKS: a 0-cost confirm chat-card button posts on any presumed kill; click only if the kill came from this attack. Verified end-to-end (Trooper kill → button → THP {value:2, source:"Warlord's Advance"}).
  - **Swift Healer** (talent-riders, `appliesTo:"heal"`, `@skills.med.rank`) — verified: Verdant Mend rolled `(2)d(2*3+2) + 6 + 2`.
  - **Vigilant Stance / Flamestance** (talent-effects) — toggled-off indicator AEs (changes:[]; sheet toggle only, no token icon — `statuses` is hardcoded `[]` in the build). Mechanics manual.
  - **Lay Foundation** (talent-targeting, plain aoe-template, sizeFt:5) — works but the template is TRANSIENT (the aoe handler deletes it after capture/targeting). Net value = cost consumption + use card; the persistent Foundation zone still needs a manual drawing. Pull the entry if it annoys.
- **Triage verdicts:** most §8a "Manual" talents are blocked on Phase-3/engine work, not table entries — Severance + Spoils-THP (conditional-vs-state / damage-fed THP), Sapping Hex (custom Weakened status), Prognosis (`edha-take-damage` event — CONFIRMED a take-damage table entry emits NOTHING today, triggerRule returns null), Life Surge/Overgrowth overflow-THP, Vital Diagnosis marker (needs `transfer:false` passthrough in talentEffects — bundle with the §8b adversary-effects bake). Forgemaster's kit is mostly narrative → stays manual.
- **NEW GOTCHA — Investiture source-override clamp:** the system's own prepare clamps `inv.value` against `max.value` BEFORE the module's Investiture derivation applies its runtime override — an actor whose SOURCE lacks `inv.max.{override, useOverride:true}` gets its current Inv clamped to 0 every prepare (src value survives untouched; the sheet just shows 0). The Demolisher had the source override (why it never showed the bug); Outlaw/Vivisectionist/Forgemaster didn't. FIXED by persisting source overrides (5/5/6 = canon 2+max(AWA,PRE)). If a future PC shows inv 0 after a reload, this is why. Consider doing the same persistence inside `edhaDeriveInvestiture` (actor.update once, instead of per-prepare in-memory override).
- **World prep done (2026-06-11):** player ownership + character assignment set — **Amertron→Outlaw, Laustarr→Demolisher, Spidercam→Forgemaster; Vivisectionist = GM-run spare** (NOT Forgemaster as §8b guessed). Outlaw token placed by the party (was missing — only 3 PCs had tokens). All 4 PCs at full Investiture. combats=0, templates=0, Playtest Map active, game paused. Test artifacts cleaned (Trooper HP restored, test THP cleared, temp tokens deleted); a few test chat cards from this session remain in the log (harmless — delete by hand if wanted).
- Build counts now: deity events 11 / effects 1; heroic events 7 / effects 8. `VALIDATION PASSED ✓`, 0 issues. `scripts/run-playtest-build.bat` exists for one-click deity+heroic+validate (writes `scripts/build-log.txt`).

---

## 1. What this is

Port the **Edha** homebrew talent/skilltree system (Cosmere RPG homebrew) into **Foundry VTT** as a content module **`edha-content`**, built on the community **cosmere-rpg** system. Three talent atlases (leyline / deity / heroic) + a playtest-adversary pack, plus runtime automation (rolls, triggers, Temp HP, summons, targeting, Draw Mana, Investiture derivation).

As of 2026-06-09 talent behaviors are hosted **natively and exclusively** on each talent — `system.events` rules + `effects` ActiveEffects — visible and editable on the talent's Events/Effects tabs (see §7). There is NO parallel runtime behavior store; `register-skills.js` is a thin generic engine that reads the on-talent rules.

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`. User data at `C:\Users\benhe\AppData\Local\FoundryVTT\`.
- **System:** `cosmere-rpg` v2.0.4 at `…\FoundryVTT\Data\systems\cosmere-rpg\index.js` (minified ~28.7k lines; grep it for facts — hooks/handlers use templated strings, so grep the SUFFIX e.g. `damageRoll`, `registerItemEventHandlerType`). Unminified core Foundry API lives in `C:\Program Files\Foundry Virtual Tabletop\resources\app\{client,common}\**\*.mjs` (grep here for Region/ActiveEffect/document APIs).
- **Public icons:** `C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons` — **verify icon existence with a WINDOWS path** (`C:/Program Files/...`); an MSYS `/c/...` path makes node `fs.existsSync` return false for everything. A 404 icon = invisible/unselectable tree node.
- **Our module:** `…\FoundryVTT\Data\modules\edha-content\` — `module.json` (now declares the `RegionBehavior.hazard` documentType), `scripts/register-skills.js` (the runtime; hand-edited here), `styles/edha.css`, `lang/en.json`, `data/*.json` (runtime tables, copied at build), `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries}` (LevelDB).
- **Source (canonical):** `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\` — `data/leyline.json` (125), `data/domain.json` (90 deity), `data/cosmere.json` (375; only 6 heroic paths ×25 = 150 in scope), `data/adversaries.json` (9), + the behaviour tables (see §5). `scripts/foundry-build.js` (generator) + `scripts/talent-icons.js`.
- **Validators/inspectors (in `Skilltrees/scripts/` since 2026-06-12; the old `C:\tmp` copies are obsolete):** `validate-packs.js` (talent packs), `validate-adversaries.js` (adversary pack incl. baked effect keys), `inspect-pack.js <pack> "<Name>"` / `--group <Tree>` (print a talent's emitted events/effects). All read via temp-copy → **safe with Foundry open**.

## 3. Build / validate / when to rebuild vs F5

- **Build:** `cd "…/Skilltrees/scripts" && node foundry-build.js [leyline|deity|heroic|adversaries|all]` (default all). **NOTE: single scope arg only** (`leyline deity` runs leyline ONLY; run twice or use `all`). Deterministic 16-char ids (`fid`). Rewrites the LevelDB packs (effects as `!items.effects!` sub-keys), writes tree-background SVGs, bakes per-talent `system.events` + `effects`, and **deletes any stale runtime-table copies from `modules/edha-content/data/`** (tables are generator inputs only). Portable: `EDHA_DATA`/`EDHA_MODROOT` env overrides + classic-level fallback (`npm i classic-level` + NODE_PATH off-machine).
- **Validate:** `node validate-packs.js` (expect `VALIDATION PASSED ✓`, 0 issues); `node validate-adversaries.js` after adversary builds.
- **FOUNDRY MUST BE CLOSED to rebuild** (LevelDB lock). Check: PowerShell `Get-Process | ? {$_.ProcessName -match 'foundry|electron'}`. From inside a running world, `game.shutDown()` returns to Setup and **releases the pack locks** (no full quit needed) — but re-launching the world hits the GM join-password gate.
- **Rebuild needed** for anything baked into the packs: talent text/roll-data (DETAILS), **native `system.events` rules + `effects` ActiveEffects**, tree layout, icons, path events/grants, adversary stat blocks, the Draw Mana item.
- **F5 (reload) re-runs init/setup/ready** → reloads `register-skills.js` (the registered event/handler types, the `edha-content.hazard` Region behavior, all runtime helpers + JSON-table fallback). `module.json` changes (e.g. documentTypes) need a full world relaunch, not just F5.
- **Embedded-talent SNAPSHOT gotcha:** talents already on an actor are frozen copies. After a pack rebuild, re-sync owned talents: budget-bar **⟳ Sync Talents** button or `edha.syncNow()`. Sync now also carries `system.events` + `effects`.

## 4. The `edha.*` console/macro API (operate it solo)

Exposed at `game.modules.get("edha-content").api` and global `edha`:
- `edha.syncNow(actor?)` / `syncAllCharacters()` — re-pull roll data + native events/effects onto owned talents after a rebuild.
- `edha.grantDrawMana(actor?)` — add Draw Mana to a character who added their leyline path before Draw Mana existed (or just re-add the leyline path).
- `edha.resetTriggers(actor?)` — clear once-per-round trigger locks (testing).
- `edha.fixSettings()` — force `applyButtonsTo` → Prioritise Targeted.
- `edha.showRange(item|name)` — draw the Attunement-Range ring.
- `edha.aoe(item)` / `edha.summon(actor,name)` / `edha.setTempHp(actor,n,src)` / `edha.getTempHp(actor)`.
- `edha.clearKindleLights()` — restore tokens' pre-Kindle lighting (also auto on `deleteCombat`). `edha.refreshDefBuffs()` — re-sync Know-Your-Moment-style defense buffs to the current combat turn (e.g. after a mid-combat reload).
- `edha.raiseStakes(tokenOrActorOrName, skillId?, source?)` — grant a Plot Die (White / Coordination). `edha.calculatedPatience(tokenOrActorOrName?)` — grant advantage on the actor's next test (Blue / Foresight's Calculated Patience; call it when you take a slow turn).

## 5. Behaviour tables (generator INPUTS ONLY; in `Skilltrees/data/`; NEVER read at runtime)

These tables are **generator INPUTS only** (2026-06-09): `foundry-build.js` emits each entry as a native `system.events` rule (or an `effects` ActiveEffect) on its talent. They are **NOT copied to the module and NOT fetched at runtime** — the build deletes any stale `modules/edha-content/data/talent-*.json` copies. The runtime reads behaviour exclusively from each talent's own rules/effects.

**⚠ MASKED SINCE 2026-06-12:** all 21 trees now have authored overlays (`data/authored/`), which **win over these tables** — a new table entry for an existing talent does nothing. Author per-talent behavior in Foundry (→ extract) or by hand-editing `data/authored/<atlas>-<tree>.json` (→ build). The tables below are kept as bootstrap history + schema reference for the rule shapes the engine understands.

- `talent-rolls.json` — per-talent Skill Test + Damage (→ baked into `system.activation`/`system.damage`, the DETAILS tab; native + editable). 90 rollable.
- `talent-riders.json` — passive damage riders (Kindle, Mighty) → `edha-damage-rider` rule (incl. **`lightRadiusFt`** for Kindle's "damaged creatures shed light"); applied by the `rollDamage` wrapper / `applyDamage` wrapper, which READ the native rule.
- `talent-thp.json` — Temp HP grants → `edha-temp-hp` rule on `use`.
- `talent-summons.json` — summon stat blocks → `edha-summon` rule on `use`.
- `talent-triggers.json` — triggered effects → `edha-triggered-effect` rule on `edha-deal-damage` / `edha-on-defeat`, incl. the **`whenDamageType`** filter (e.g. Arc Flash = energy-only). Dispatched NATIVELY by the system's event engine (no take-damage entries currently exist; add an `edha-take-damage` event type when one does).
- `talent-targeting.json` — **point-burst config**: a `burst:{}` block is emitted as an `edha-burst` rule (event `edha-pre-use`) carrying size/range/save/heal/terrain — the preUseItem engine READS that rule (supersedes the `edha-aoe-template` rule for those talents). Range preview (⊙ button) needs NO data (color derived at runtime).
- `talent-hazards.json` **(new)** — dangerous terrain (Set Charge, Pyre, Fault Line) → `edha-place-hazard` rule on `use` → drops a scene-scoped Region with the `edha-content.hazard` behaviour.
- `talent-effects.json` — passive numeric buffs (Walking Ruin +Speed) → native ActiveEffects baked into the pack (key e.g. `system.movement.walk.rate.bonus`, mode ADD). **The old strip-on-load issue is FIXED** (effects are written as separate `!items.effects!` LevelDB keys — see §7).
- `talent-defense-buffs.json` — defense bonus for a combat-timing window (Know Your Moment) → an **`edha-defense-buff` rule ON the talent** (event `edha-combat-timing`; amount/defenses/window/label editable on the Events tab). The engine's core combat hooks read that rule and toggle the matching actor ActiveEffect. Pattern for any "+N defense/stat for a window" talent.
- `talent-state.json` **(v3)** — state mechanics, one entry or ARRAY per talent. Kinds: `mark` (apply status + record owner + party bonus dmg — Vital Diagnosis), `sweep` (damage all [status] in range, THP=total — Spoils of Isolation), `convert` (damage type vs Isolated — Severance), `marked-watch` (resource regen when your marked creature takes damage — Prognosis), `hp-threshold` (ally-at-half prompt — Mender's Instinct), `multi-hit` (2+-capture prompt — Flashpoint), `overflow-thp` (heal overflow → THP — Life Surge/Overgrowth).
- `adversary-effects.json` **(v3)** — adversary item ActiveEffects (advName → itemName → [effects]), baked into the edha-adversaries pack so re-imports keep the §8b automation.
- Draw Mana riders + Investiture formula + HP/Speed sheet derivations are **hardcoded** in register-skills.js (small, fixed canon).

## 6. Settings the user must have

- **`applyButtonsTo` = 4 (Prioritise Targeted).** REQUIRED for the auto-target AoE model — at the default 0 (SelectedOnly) the chat Apply buttons ignore targets and only hit the selected token. The module force-sets it on load (GM); also Configure Settings → cosmere-rpg → "Apply damage/healing to" → Prioritise Targeted, or `edha.fixSettings()`. When clicking Apply, don't re-target between casting and applying.

---

## 7. THE NATIVE EVENT/EFFECT SYSTEM — ✅ 2026-06-09: BEHAVIOR LIVES ON THE TALENTS (re-refactor complete)

### §7.0 — 2026-06-09 RE-REFACTOR (READ FIRST; supersedes the 2026-06-08b corrections below)

**Every automated talent now carries its behavior ON the item**: `system.events` rules (Events tab, fully editable via the auto-rendered rule dialog) + `effects` ActiveEffects (Effects tab) + the roll on DETAILS. `register-skills.js` is a thin generic engine: it registers event/handler types, generic executors, and engine glue (burst targeting UI, GM socket relay, combat-turn timing, rollDamage/applyDamage wrappers) that READ the on-talent rules. **The legacy runtime behavior store is DELETED** — no table loaders, no side-file fetches, no name-keyed dispatch; `modules/edha-content/data/` ships no talent tables.

**Definition-of-done loop VERIFIED LIVE**: unlocked the heroic pack, opened Know Your Moment's Events tab in the UI, edited Bonus amount 2→3 in the rule dialog, ⟳ Sync, started combat → actor showed +3 (phy 14→17); reverted to 2 the same way. No code/side-file edits.

**Blocker 1 RESOLVED — native damage-trigger dispatch WORKS (cosmere-rpg v2.1.0).** The 2026-06-08b "edha-deal-damage / edha-on-defeat never fire" finding was caused by **stale owned snapshots**: the talents on the test actor carried ZERO native rules (never re-synced after the events migration), so there was nothing for the engine to fire. After `⟳ Sync`, Arc Flash's own on-talent rule fires natively off `cosmere-rpg.damageRoll` — watched live. Two engine details discovered:
- the system fires the `damageRoll` hook **TWICE per rollDamage (main roll + graze roll)** → the `edha-deal-damage` event type has a 400 ms per-item **debounce in its `condition`** so one logical hit dispatches once;
- the energy-only filter (formerly `when.damageType` in the side-file) is now a **`whenDamageType` field on the rule** (editable; the executor checks it against the triggering roll's damage type).
The old runtime workaround (legacy dispatcher reading talent-triggers.json, no-op native executor) is **REMOVED**; the native `edha-triggered-effect` executor is the real implementation (optional-cost rules post the chat-card button; unconditional rules fire immediately; `edha-on-defeat` passes the victim via `event.options.victim`).

**Blocker 2 RESOLVED — on-talent ActiveEffects survive the compendium.** Root cause (the `_stats` theory was wrong): **Foundry LevelDB packs store embedded ActiveEffects as SEPARATE `!items.effects!<itemId>.<effectId>` keys, with the parent item's `effects` field holding only ID strings** (verified against the system's own heroic-paths pack). The old build baked full effect objects inline in the item doc, which Foundry silently ignores on load. `writePack()` now does the split (and `edha-pack-io.js#readPack` reassembles them for fingerprints/extract). Verified live: Walking Ruin loads from the pack with `effects.size=1`, shows "Walking Ruin — Speed" on its Effects tab, and applies on a character (Speed 30→40; `CONFIG.ActiveEffect.legacyTransferral=false` means transfer:true item effects apply to the actor directly).

**Point-targeted bursts — now rule-driven.** The burst CONFIG lives in an **`edha-burst` rule on the talent** (event `edha-pre-use`, a sentinel type: never dispatched; the engine reads it). Fields (all editable on the Events tab): sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain. Engine glue unchanged: `cosmere-rpg.preUseItem` takeover (returning `false` cancels the default `use()`) → consume cost → range ring + **click-to-place** template (`edhaPickPoint` reads `canvas.mousePosition`, grid-snapped) → chat **Detonate** button captures everyone inside, auto-rolls saves for half, applies (GM-direct or socket relay), drops terrain. Damage formula+type still read from the talent's own `system.damage`; owned riders (Kindle) still added. Verified live on Flame Surge (cast → ring 60 ft → place 10 ft burst → Detonate resolves). **`preUseItem` takeover remains THE pattern for any talent that doesn't fit the single-target attack card.**

**Player-accessible writes via a GM SOCKET RELAY (unchanged).** applyDamage on GM-owned enemies + Region terrain + token light + actor effects all need GM perms. The burst Detonate resolves rolls on the clicking client then relays the privileged writes to the **primary active GM** (`game.socket.on("module.edha-content")`, gated `game.users.activeGM.isSelf`, applier `edhaApplyBurstResults`). Required **`"socket": true` in module.json → a world RELAUNCH**, not just F5. **LESSON: any mechanic that writes to GM-owned docs must run GM-side; for player actions, relay through this socket.**

**Kindle light & defense buffs — now rule-driven:**
- **Kindle light** — config is the **`lightRadiusFt` field on Kindle's own `edha-damage-rider` rule** (0 = none). The `applyDamage` wrapper reads owned rider rules to decide light; source attribution unchanged (explicit `options.edhaSource` from bursts → `originatingItem` → recent damage-roll breadcrumb → killer-candidate heuristic); clears on `deleteCombat` / `edha.clearKindleLights()`. Verified live (token light dim=5/bright=2.5).
- **Defense buffs / Know Your Moment** — the **`edha-defense-buff` rule on the talent** (event `edha-combat-timing`, a sentinel) holds amount/defenses/window/label/img. Engine: defenses are `DerivedValueField` (`value = base + bonus`) → toggled ActiveEffect on `system.defenses.*.bonus`; the cosmere system has NO turn hooks → Foundry **core** combat hooks (`combatStart`/`combatTurnChange`/`deleteCombat`) call `edhaRefreshDefBuffs`, which recomputes every combatant from initiative order and reads the rule from owned talents. Verified live (14→16 before turn, removed on turn; +3 after the UI edit).

**⟳ Sync rewritten (2026-06-09) — replace-not-merge + identity matching:**
- Item updates MERGE `system.events`, so stale rules lingered forever; sync now emits a **`-=<ruleId>: null` deletion** for every existing rule the pack source no longer carries, and **prunes stale embedded effects** (delete-by-id after update). Owned talents end up EXACTLY mirroring their pack source (rules + effects).
- **28 talent names collide across trees** (365 talents → 337 unique names), so name-only matching is ambiguous; sync matches by **`atlas|group|name`** (from `flags.edha-content`) with plain-name fallback.
- **Caveat:** calling sync within ~seconds of a pack write (editing a pack item, lock/unlock) can update fewer talents than expected (`pack.getDocuments()` returns a partial set mid-reindex; a retry guard exists but isn't bulletproof). Sync is idempotent — **run it again**; verify with the rule-id checker if paranoid.

**Robustness checklist (every one of these bit us — apply everywhere):** gate GM-side writes to ONE GM (`activeGM.isSelf`); make handlers **idempotent** (claim/delete state at the top before any `await`); **existence-check before `.delete()` and `.catch()` the async** (a caught promise does NOT suppress Foundry's red "X does not exist!" toast); bind chat buttons on **`renderChatMessageHTML` ONLY** (the deprecated `renderChatMessage` ALSO fires in v13 → double-bind → double-fire/double-damage); **never assign a `DerivedValueField.value`** (getter-only → TypeError; use `.bonus`/`.override`).

**LESSON — read the schema before building.** Confirming `value=base+bonus` (defenses), `DamageType.Healing="heal"`, `canvas.mousePosition` (a live world-coord PIXI.Point), and that the combat hooks exist — all up front — avoided guesswork each time. Grep the system/core source first.

**Verified live 2026-06-09 (all from on-talent rules/effects, legacy store deleted):** Arc Flash (native dispatch off Searing Bolt, energy filter, one card, graze-debounced), Kindle (+Red-mod rider in the damage formula AND 5 ft token light), Walking Ruin (+10 ft Speed AE survives pack load, visible on Effects tab, applies on add), Know Your Moment (+2 → UI-edited +3 → reverted; round-until-turn toggling), Flame Surge (rule-driven burst: cost, 60 ft ring, click-place, Detonate), Death Ward (use→edha-temp-hp rule present), ⟳ Sync exact-mirror verification across all 4 characters (37/37 talents, 0 mismatches).

**Prior 2026-06-08b playtest (engine glue still identical):** Pyre (attack + terrain), Set Charge, Mending Aura, Thorn Field, socket relay, Temp HP absorption, summons.

---

### Architecture reference (registrations & key findings — current as of 2026-06-09)

Talent behaviors run through the cosmere-rpg event engine, hosted on the talent (`system.events`, Events tab); passive buffs are native ActiveEffects (Effects tab); rolls stay on DETAILS. The generator emits these from the §5 tables; ⟳ Sync mirrors them onto owned talents. 24 talents currently carry rules (coverage grows by adding table entries + rebuild — §9).

### Registered in `register-skills.js` at `setup` (`edhaRegisterNativeEventSystem()`)
- **Custom EVENT types** (`cosmereRPG.api.registerItemEventType`):
  - `edha-deal-damage` — hook `cosmere-rpg.damageRoll`; `condition` = 400 ms per-item debounce (the hook fires twice per roll: main + graze) + src.actor check; `transform:(roll,src)=>({document: src?.actor ?? src, options:{roll, sourceItem:src}})`. Returning the **actor** fans the rule out across ALL the owner's items, so e.g. Arc Flash's rule fires when Searing Bolt rolls. **VERIFIED FIRING on v2.1.0** (the 06-08b "doesn't fire" was unsynced snapshot talents).
  - `edha-on-defeat` — hook `cosmere-rpg.applyDamage`; `condition`: dealt > 0, victim HP ≤ 0, not re-entrant from a trigger; `transform` resolves the presumed **killer** (controlled token / current combatant / `user.character`) → `{document: killer, options:{victim}}`. (Chain Detonation, Necrotic Cascade, Predator's Due.)
  - `edha-pre-deal-damage` — sentinel (never fired); marker for damage riders, applied by the `rollDamage` wrapper reading the `edha-damage-rider` rule.
  - `edha-pre-use` — sentinel; marker for `edha-burst` rules, read by the `preUseItem` takeover.
  - `edha-combat-timing` — sentinel; marker for `edha-defense-buff` rules, read by the core combat hooks.
- **Custom HANDLER types** (`registerItemEventHandlerType`): `edha-triggered-effect` (**whenDamageType**, kind=damage|damage-aoe|heal|thp|affliction, formula, damageType, target, radius, resourceGain, cost+optional, oncePerRound, note — REAL executor: optional-cost → chat-card button, else immediate fire), `edha-damage-rider` (appliesTo, bonusFormula, **lightRadiusFt**), `edha-burst` (sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain — config-only), `edha-defense-buff` (amount, defenses, window, label, img — config-only), `edha-aoe-template` (sizeByRank/sizeFt, affects, color), `edha-place-hazard` (sizeByRank/sizeFt, damageFormula, damageType, color), `edha-temp-hp` (formula, target), `edha-summon` (statblock fields). Executors REUSE the shared helpers (edhaFireTrigger/edhaRunTriggerEffect/edhaPlaceAoe/edhaWriteTempHp/edhaSummon/edhaPlaceHazard). `edha.summon(actor, talentName)` now reads the talent's own edha-summon rule.
- **Region behaviour** `edha-content.hazard` (`foundry.data.regionBehaviors.RegionBehaviorType`), declared in `module.json` `documentTypes.RegionBehavior.hazard` and registered into `CONFIG.RegionBehavior.dataModels`/`typeLabels`. Subscribes to `tokenEnter` + `tokenTurnStart` and auto-applies its baked damage to the entering token's actor (GM-side). This is the "dangerous terrain" ongoing effect.
- **Added since 2026-06-09 (this list is not exhaustive — the live registry is the `console.log` at the end of `edhaRegisterNativeEventSystem()`):** v3 (06-11b) — events `edha-take-damage`, `edha-apply-watch`; handlers `edha-apply-status`, `edha-status-sweep`, `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit`. 06-13b — event `edha-on-hit` (true hit; dispatched by the applyDamage wrapper) + `edha-pre-test`; handlers `edha-test-rider`, `edha-ritual-hp-cost`, `edha-heal-cut`; `whenTargetStatus` on `edha-triggered-effect`; plus the affliction-damage, Reserve, Blood-Price-advantage, and `{weakened,immobilized}` timed-expiry engines. **Full per-tool detail = the 06-13b delta at the top.**

### Key findings (verified in the core/system source — don't re-derive)
- **Handler config UI auto-renders — NO `.hbs` needed.** `configRenderer` is null when no `render`/`template` is given (index.js ~L12507); the rule editor then runs `{{#if shouldAutoPopulateConfigFields}}{{formGroup}}` per schema field (`templates/item/dialog/edit-event-rule.hbs`). So a handler just needs `config.schema` (labelled DataFields) + `executor`.
- **Registration MUST be at `setup`.** The system wires `Hooks.on(hook,…)` for each event type once, at its own `ready` (index.js ~L11975), reading `CONFIG.COSMERE.items.events.types`. Register custom types BEFORE that or their hooks never subscribe.
- **Dispatch fan-out** (index.js ~L11987): the fired hook's `transform` returns a `document`; if it's an **Actor**, the engine evaluates event rules on EVERY item the actor owns; if an Item, just that item. `host` defaults to `"source"` (runs on the triggering client); `"gm"`/`"owner"` also exist.
- **Roll source:** `damageRoll()`/`preDamageRoll` fire `(roll, config.data.source, config)` and `config.data.source` is the rolling **Item** (index.js ~L7484).
- **Talents support events:** `TalentItemDataModel` mixes in `EventsItemMixin()` (index.js ~L26970); `action`/`trait` items too. Rule shape mirrors the proven `pathEvents()` in foundry-build.js: `{ id, description, event, handler:{ type, …flatConfigFields } }`.

### Coexistence — OVER (2026-06-09)
All legacy dispatchers, table loaders, and `edhaIsMigrated` guards are **deleted** from register-skills.js. The shared helpers remain only as implementations the native executors call. All four world characters were re-synced and verified to exactly mirror their pack sources.

### Build (now portable)
`foundry-build.js` + `edha-pack-io.js` resolve classic-level from Foundry's bundle OR plain `require("classic-level")` (NODE_PATH supported), and honor `EDHA_DATA` / `EDHA_MODROOT` env overrides — so the build can run off-machine against mounted folders. `_stats.systemVersion` stamps 2.1.0. The unextracted-edits guard tolerates an unreadable pack (warns + skips instead of crashing). Latest full build: talents:365, events:24, effects:1.

### RESOLVED (2026-06-09) — ActiveEffects formerly stripped on compendium load
Root cause: Foundry LevelDB packs store embedded effects as separate `!items.effects!<itemId>.<effectId>` keys with ID-string references on the parent item; inline effect objects are silently ignored on load. `writePack()` now performs that split and `readPack()` reassembles. Walking Ruin's +Speed is live from the pack (Effects tab + applies on actors).

---

## 8. Current content state

- **4 packs built & validated (0 issues):** edha-leyline (125t/5tree/5path + Draw Mana action), edha-deity (90/10/10), edha-heroic (150/6/6), edha-adversaries (9 actors/30 items). 325 edges.
- **Native Event/Effect system COMPLETE (2026-06-09):** behavior is read exclusively from each talent's `system.events` + `effects`; register-skills.js is engine-only. **Per-talent COVERAGE grows tree-by-tree** (the §9 main task) — counts climb each pass (v3/06-11b: events 36 / effects 14; +Black Isolation & Ritual at 06-13b). Run `node scripts/inspect-pack.js <pack> --group <Tree>` for the current state of any tree.
- **Roll data: 90 rollable.** Deity convention: color-keyed `[Tier][Die] = (@tier)d(2*@skills.<color>.rank+2)`, Option-B `+ @attr.<id>` preserved; heals = `heal` type. Skill ids: …/`lea` (Leadership)/`prc` (Perception)/… (NOT lead/per).
- **Triggers** (talent-triggers.json → native edha-triggered-effect): Arc Flash, Afterburn, Chain Detonation, Necrotic Cascade, Predator's Due. Optional-cost prompts use a **chat-card button** (not a dialog). Once-per-round (combat) via `flags.edha-content.trigRound`.
- **Temp HP, Summons, Targeting (range ring + AoE), Dangerous Terrain (Region), Draw Mana** (one universal `action`, granted via every leyline path), **Investiture derivation = `2 + max(AWA, PRE)`** (canon; character actors), **defeated-skull overlay tied to HP**, **always-on adversary health bars**.
- **Chaos resource renamed Fracture → Omen** (domain.json; flavor line kept; "Spreading Fracture"→"Spreading Omen").

### 8a. Playtest PCs (built 2026-06-10 from the May-17 reference sheets; `scripts/playtest-setup-console.js` is the idempotent rebuilder)

All four are L7/T2, 12/12 talents, stats sheet-matched (HP/inv/movement; focus = sheet + Tier where Composed applies — the sheets don't compute talent effects):
- **The Demolisher** (Scholar/Red/Razkael) — THE MODEL. Roster corrected: −Know Your Moment (not on sheet), +Composed (a CROSS-TREE pick — Composed only exists in heroic/Envoy), +Set Charge. Verified: native Arc Flash trigger, Kindle rider+light, rule-driven bursts, Pyre hazard.
- **The Forgemaster** (Leader/White/Kethane) — Composed (+2 foc) + Customary Garb (+2 PHY/SPI → 16/19) live; Guardian Stance +1 Deflect baked toggled-OFF (conditional); Draw Mana granted (was missing); **Forge Construct** verified: HP [Tier][d8-white]+4, deflect 1 (new summon-rule field), defenses = caster−2 incl. Garb. Manual: Lay Foundation/Siege Form/Trade Routes/Through the Fray/Guiding Signal/Concordant Presence.
- **The Outlaw** (Warrior/Black/Tyrith) — created. Tyrith rolls fixed red→**black** d8 (sheet's die). Black Draw Mana fires (Weakened = manual note). Manual: stances, Isolated-state mechanics (Sapping Hex/Severance), Spoils THP, Warlord's on-kill THP.
- **The Vivisectionist** (Scholar/Green/Anaveth) — created. Collected (+2 COG/SPI → 18/17) live; heal rolls verified (Verdant Mend [Tier][d8-green]+mod); Green Draw Mana terrain. Manual: Diagnosed-state mechanics (Prognosis/Vital Diagnosis), Life Surge overflow-THP, Field Medicine resolution.

### 8b. Playtest-1 prep (2026-06-10b) — adversary automation, balance pass, world setup

**Adversary action automation — lives on the WORLD actors, NOT the pack.** All 18 placed adversaries (Edha Adversaries folder; duplicates are separate actor docs — every copy was updated) got hand-created ActiveEffects on their items via console, following the PC-talent conventions (`Item — Thing` naming, transfer:true, conditional = baked toggled-off):

- **Mechanical:** Stitchmother **Phase 2 — Transformed** (toggled-off; `hea.max.bonus +20`, `attributes.str/spd.bonus +1`; heal-to-90 / +2 Vital / 2d6 regen stay manual per the description, verified 140→160 max while at 140). **Vital Diagram — Marked** apply-template implements the Deflect bypass on the victim (`deflect.useOverride=true` + `deflect.override=0`, OVERRIDE mode; +4 Vital stays manual; verified apply/restore on a PC).
- **Apply-to-target templates** (transfer:false, drag from the item onto the target's sheet): Frost Lance→**Slowed** (`statuses:["slowed"]`, 1 round), Venom Slam→**Afflicted** (`statuses:["afflicted"]`), Suture Cradle→Cradled, Bite→sheds-light, Probability Net (−1d6 next test), Calc Strike (+3 one test).
- **Trackers** (no engine key exists for advantage/disadvantage — token-icon reminders only): Brace (Captain 2-dis / Troopers 1-dis, 1-round duration), Glimpse the Path, Fade/Veil concealment (Stalkers), Bone Spurs / Venom Glands (Thralls, toggled-off), always-on icons for Predictive Ward + Cinder Coat.
- **NOT in source/pack:** `adversaries.json` and the edha-adversaries pack were untouched — re-importing actors from the pack loses all of the above. To make permanent, port these into generator inputs (adversary analogue of talent-effects.json) + rebuild.

**Balance pass (PC damage die = 2d8 — T2, leyline rank 3 across all four PCs):**
- Flame Surge does **NOT** one-shot Troopers (avg 9 − Deflect 1 into 14 HP; ~5% outright kill per failed save; saves are Athletics +0 vs Red +5, so most fail). No minion HP changes made.
- **FIXED: The Outlaw had NO weapon items at all** (Vivisectionist none either) — Warlord's Advance / Momentum of Victory were dead. Added **Longsword** (1d8 keen, equipped, + `weapon:longsword` expertise entry) and **Staff** (1d6 impact, equipped) from `cosmere-rpg.items`.
- Adversary defensive skills were all +0 → set ranks: **Stitchmother dis 5** (Suture Cradle concentration DC 10+dmg now holds ~55% vs a typical hit), **Troopers dis 2** (rout DC 13), **Captain ath 2**.
- **Stitchmother HP 140→120** (`hea.max.override`; Phase-2 below-70 trigger and heal-to-90 unchanged) — keeps the boss in the 4–6-round band vs party net DPS.
- **Playtest-1 watchpoints:** Captain Deflect 4 vs the party's small dice (deliberate — Ben wants him to be "a real test"; if it slogs, drop to 3). Boss net-DPS margin with the Discipline buff.

**World/session setup:** Playtest Map **activated** (was the default splash scene — players would have landed there). PC Investiture topped up. Stale test combat + 2 stray Demolisher tokens removed. **JournalEntry "Playtest Dungeon — Room Guide"** created (6 pages: read-aloud blockquote + adversary visual descriptors + terrain + run notes per room), built from the May Dungeon Reference PDF with deltas: **Living Lock CUT** (Room 1 vault door opens via Crafting/Lore DC 16 or Athletics DC 18 only), **Room 4 rewritten to match the map** (poison lake centerpiece + BOTH Frostbinders sniping from the balcony, Stalkers on the shore; suggested lake ruling: 2d6 Vital/round immersed, Athletics DC 14 out), **Room 6 = 3 Thralls** (map count, not the sheet's 2). Player users **Amertron / Laustarr / Spidercam** created with passwords; internet invite verified working (AT&T BGW NAT/Gaming forward TCP 30000 → gotcha: the gateway bound the rule to a STALE duplicate device entry for the same hostname; re-pointing at the live 192.168.1.247 entry fixed it). Remaining manual step if not yet done: per-PC **Ownership → Owner** + User Configuration character assignment (3 users / 4 PCs — Forgemaster is the natural GM-run spare).

**Console-operator notes (this session):**
- Creating an item-embedded ActiveEffect **with `statuses` in the create call throws** `Cannot read properties of null (reading 'startsWith')` (cosmere-rpg v2.1.0 / Foundry v13.351). Workaround: create without `statuses`, then `effect.update({statuses:[...]})`.
- DevTools `copy()` is **undefined inside async/promise contexts** — stash results on `window._r`, then `copy(window._r)` as a second synchronous command.
- Beware shell→clipboard quoting: escaped `\'` inside single-quoted JS arrived as `\\'` and produced a silent SyntaxError (script no-ops, stale `window._r` masks it). Prefer double-quoted JS strings with plain apostrophes.

## 9. Open to-dos

- **TREE-BY-TREE COVERAGE — the main ongoing work.** Per-tree loop: review each talent → author events/effects by hand-editing `data/authored/<atlas>-<tree>.json` (or in Foundry → `node foundry-extract.js <Tree>`); add new mechanic PATTERNS as handler types in `register-skills.js` then `node scripts/module-src-sync.js push` → `node scripts/foundry-build.js <atlas>` (Foundry CLOSED) → `node scripts/validate-packs.js` → `node scripts/inspect-pack.js <pack> "<Name>"` → commit → relaunch → `⟳ Sync` → live-verify. (NOT the side-file tables — masked since 06-12, §5. 28 names collide across trees → matched by `atlas|group|name`; new hand-added entries need the right `docId`, `byId` wins.)
    - **Done:** Black / Isolation, Black / Ritual (06-13b); Black / Subjugation (06-13c); **WHITE COMPLETE** — Coordination (06-14, Plot-Die primitive + ally support), Bulwark (06-14b, applyDamage-wrapper mitigation + Hardy AE), Accord (06-14c, conditions/accords/disadvantage cards); **BLUE COMPLETE** — Calculation (06-14d, the counted `nextTestMod` (dis)advantage flag + Disorient), Illusion (06-14e, real `edhaSummon` tokens — Barricade/Phantom Double/Holographic — + Ghostly Walls immobilize/Absolute Stillness rider), Foresight (06-14f, Intercept/Reactive Analysis/Read Intent reusing `nextTestMod` + the `edha.calculatedPatience` toggle). All engine-only.
    - **NEXT:** the leyline Keys/Draw Mana riders + any remaining Black specialties, then Red / Green.
    - **Cross-tree carry:** `Hardy`'s +@level max-HP AE is now on Black + White; the **Green** copy still lacks it — replicate in the Green/Restoration pass.
    - **Reusable from 06-14:** the **Plot-Die grant** (`flags.edha-content.plotDieNext` + `edhaPlotDie*` injector + `edha.raiseStakes` + `set-flag` relay) is the tool for ANY "raise the stakes / grant a Plot Die" talent in later trees.
- **AoE/terrain — bursts DONE** (rule-driven `edha-burst`, §7.0). Remaining: add `burst` blocks to other area talents as they come up; Set Charge place→detonate timing still approximated (use = detonate).
- **Phase-3 triggers — mostly DONE.** Remaining: **Crown of Thorns** (needs a "which defense was tested" hook — none exists); **Gnothis / Insight** rules (stackable `insight` status registered, no entries authored yet); extend the timed-status `expireAfter` flag to Diagnosed / other durations as needed (engine exists since 06-13).
- **Lay Foundation persistent friendly zone** — still missing (needs a region-BUFF behaviour, the friendly twin of `edha-content.hazard`; the transient template entry from pass-1 remains).
- **Stays manual:** movement/positioning/ally-count triggers (Momentum's Edge, Coordinated Hunt), narrative-violation triggers (Edict/Snare/Bastion), Fault Line ray template, Crown of Thorns (above); **Reserve SPENDING + Double Dip's HP-substitution** (Scope-A ruling, 06-13b — readout helps, but no auto cost-substitution).
- **Post-playtest-1 balance review:** capture session findings against the §8b watchpoints (Captain Deflect 4; Stitchmother net-DPS margin at 120 HP / dis 5; Flame Surge vs clustered minions).
- **Resolved (history — detail in deltas/§7):** compendium-effect strip; char re-sync + legacy-hook deletion; sync-flake hardening; `edha-take-damage`; adversary-effects→generator; PC pregens ×4 (§8a); Weakened/Diagnosed/Insight statuses; sheet derivations (HP+1 / Speed 20+5×SPD via `edha.migrateDerivations()`); talent-budget formula ruling (`L+3+floor((L-1)/5)`=11 at L7; pregens via `edha.skipBudget`).

## 10. Gotchas

- Custom skills must be `core:true` or they hide behind Powers.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`), or their hooks never subscribe.
- **Handler config forms AUTO-RENDER from the schema** — no `.hbs` template needed (only for fancy widgets).
- **Embedded ActiveEffects in LevelDB packs live as separate `!items.effects!<itemId>.<effectId>` keys** with ID-string refs on the parent — inline effect objects are silently dropped on load. `writePack` handles the split (FIXED 2026-06-09).
- **Dangerous-terrain Region creation is GM-side** — a player using a hazard talent gets a "GM-side" warning (same as summons). For player-initiated bursts, the Detonate relays the writes to the GM via socket (§7.0).
- **Native damage-triggered events DO fire on v2.1.0** — but ONLY on talents whose owned copies carry the rules (⟳ Sync after every rebuild!). The `damageRoll` hook fires TWICE per roll (main + graze) → the `edha-deal-damage` condition debounces 400 ms per item.
- **`edha-deal-damage` fires on the attack ROLL, not a hit** (06-13b) — cosmere rolls damage on EVERY attack, hit or miss (the GM applies on a hit). For "on hit" effects use **`edha-on-hit`**, which the `applyDamage` wrapper dispatches only when `damage.dealt > 0`. Sapping Hex + Predatory Patience were retrofitted off deal-damage for exactly this (they were weakening / refunding Investiture on whiffs).
- **Item updates MERGE `system.events`** — to remove a rule you must send `-=<ruleId>: null`; sync does this automatically. Plain re-pushing the new events object leaves stale rules in place.
- **Foundry still holds pack LevelDB handles at the SETUP screen** (post-shutdown compaction) — `game.shutDown()` is NOT always enough to rebuild; fully quit Foundry if `writePack` hits EPERM/EACCES on a pack file.
- **Bind chat-card buttons on `renderChatMessageHTML` ONLY** — the deprecated `renderChatMessage` also fires in v13, so binding both double-fires the handler (caused double-damage + double-delete). Make button handlers idempotent too.
- **Cross-client chat-card buttons must carry their payload in `data-*` attributes — NOT a client-local map** (06-14). The existing trigger/burst cards stash the spec in a JS object (`EDHA_TRIG_PENDING` etc.) keyed by a per-button id; that only works because they're posted AND clicked on the SAME client. The Coordination watcher posts cards **GM-side** but the **owner's player** clicks them → a client-local map is empty there → the click silently no-ops. Fix: embed everything the click needs in `data-edha-*` attributes (`encodeURIComponent` for names/HTML/JSON), which travel with the chat HTML to every client. Applies to ANY card posted on one client and acted on by another.
- **Existence-check a template/doc before `.delete()`** (`scene.templates.get(id)` / `doc.parent?.templates?.get(doc.id)`) — a caught promise rejection does NOT suppress Foundry's red "X does not exist!" toast.
- **Never assign a `DerivedValueField.value`** (HP/defenses/deflect/movement/inv max) — it's a getter (`value = base + bonus`); a direct set throws "only a getter". Use `.bonus` (ADD, AE-friendly) or `.override`+`.useOverride`.
- Verify every icon path exists (Windows path) — 404 = invisible node.
- Rebuild only with Foundry closed (or `game.shutDown()` to Setup); relaunch to load packs + `module.json` changes; F5 for runtime JS/JSON.
- The `connections` array (not prose prereqs) drives drawn tree edges — and is SEPARATE from a talent's Name/prereqs, so renaming a talent requires rewriting every other talent's `connections` entry that points to it.
- Embedded talents are snapshots → ⟳ Sync after a rebuild (Sync now carries events/effects).
- `applyButtonsTo` must be a targeting mode (4) for AoE Apply to hit all targets.
- For any player-decision prompt that needs canvas targeting, use a CHAT-CARD BUTTON, not a dialog (modal blocks the canvas; non-modal can hide behind sheets).
- Hand-authored `[[damage N Type]]` enrichers need a capitalized DamageType key (Energy/Impact/Keen/Spirit/Vital/Healing).
- `@attr.<id>` (wil/pre/int/str/awa/spd) is the attribute shorthand in roll formulas (value only), NOT `@attributes.x.value`.
- **Item-embedded ActiveEffects cannot be created WITH `statuses`** (`Cannot read properties of null (reading 'startsWith')`, cosmere v2.1.0/Foundry v13.351) — create the effect first, then `update({statuses:[...]})`.
