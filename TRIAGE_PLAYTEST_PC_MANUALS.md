# Triage — Playtest PC "Manual" Talents (2026-06-10c)

> **2026-06-11b UPDATE — §B (trigger-v2 / engine-needed) is CLEARED by the v3 engine pass** (see the 06-11b delta in `EDHA_FOUNDRY_HANDOFF.md`, incl. the live-verify checklist — v3 is built + pack-validated but NOT yet verified in Foundry):
> Spoils of Isolation → `edha-status-sweep` (auto damage + THP; its old manual roll entry removed) · Severance → `edha-damage-convert` (vital vs Isolated at apply time) · Sapping Hex → deal-damage trigger w/ Isolated filter → auto-Weakened (custom status now registered) · Prognosis → `edha-take-damage` exists; runs via `edha-marked-damage-trigger` + a conditional heal rider · Life Surge / Overgrowth → `edha-overflow-thp` · Vital Diagnosis → `edha-apply-status` mark (+Tier vital auto-applied party-wide; `transfer:false` generator support also added) · Mender's Instinct → `edha-hp-threshold` prompt · Flashpoint → `edha-multi-hit` prompt.
> From §C: **Siege Form** is now BAKED on the Forge Construct summon (toggled-off AE + Siege Cannon item). Still manual: Trade Routes, Through the Fray, Guiding Signal/Concordant Presence, Practiced Kata, Cruel Step/Unnerving Approach, Erudition/Emotional Intelligence, Field Medicine resolution, Lay Foundation's persistent zone, and all status DURATIONS.

Scope: the §8a "Manual:" lists on the four playtest PCs, cross-checked against full rosters in `playtest-setup-console.js`. File-side only — table entries authored, **no build/sync run** (see §D for the commands to run).

Buckets: **A = automated this pass** (entry authored), **B = trigger-v2 / engine-needed** (deferred with proposed design), **C = stays manual** (workaround noted).

Already covered before this pass (no action): rolls exist for Spoils of Isolation, Momentum of Victory, Unstoppable Advance, Warlord's Advance, Field Medicine, Verdant Mend, Mender's Instinct, Life Surge, Overgrowth; AEs for Guardian Stance / Composed / Collected / Customary Garb; Forge Construct summon; the three leyline Attunements ride on the hardcoded Draw Mana riders.

---

## A — Automated this pass (4 entries, 4 tables)

### A1. Warlord's Advance (deity|Power) — on-kill THP → `talent-triggers.json`
`on:"kill"` → native `edha-on-defeat`. Effect: THP `@tier`, target self. **Cost authored as `{inv, 0, optional:true}`** purely to get the confirm chat-card button instead of an immediate fire — the kill heuristic can't tell WHICH attack killed, so the button reads "click only if the kill came from this attack." Deducting 0 Inv is a no-op. The free 10 ft move stays manual.
- Caveats: (1) coexists with its talent-rolls entry — the triggers README says listed talents are "deliberately not rollable", but that's about pure triggers; here the roll IS the attack and the trigger is independent. Watch for weirdness on first live test. (2) `oncePerRound:false` — THP overwrites, never stacks, so multiple kills are safe.

### A2. Swift Healer (heroic|Scholar) — heal rider → `talent-riders.json`
Not on the manual list but a textbook rider: "healing abilities restore additional health equal to your ranks in Medicine" = `appliesTo:"heal", bonusFormula:"@skills.med.rank"`. Boosts Verdant Mend, Life Surge, Mender's Instinct, and burst heals (riders apply inside bursts per the targeting README). Field Medicine's recovery die is NOT a heal roll → unaffected (correct).

### A3. Vigilant Stance + Flamestance (heroic|Warrior) — indicator AEs → `talent-effects.json`
Toggled-OFF ActiveEffects with **no changes** — pure sheet indicators, same idea as the §8b adversary trackers. Limitations: talent-effects hardcodes `statuses:[]`, so **no token icon**, sheet-Effects toggle only; both stances' actual mechanics (focus-cost reduction, conditional action, advantage) have no engine keys → manual. If indicator-only AEs feel like noise, just delete the two entries pre-build.

### A4. Lay Foundation (deity|Civilization) — placement marker → `talent-targeting.json`
**EXPERIMENTAL — verify first.** Plain `edha-aoe-template` rule (NO burst block): on use, drops a white template + auto-targets allies inside. `sizeFt:5` because templates are circles and sizeFt reads as radius — a 5 ft radius ≈ the 10 ft square. Unknowns: where the template centers (old model = caster/target, not click-to-place) and whether it persists for the scene. The +1-defenses-while-inside effect has no engine (region-buff doesn't exist) → manual either way. If the template misbehaves, delete the rule on the Events tab or pull the entry.
- Did NOT use a burst rule: burst `terrain:true` drops a DANGEROUS terrain Region (damaging) — wrong for a friendly zone.

## B — Trigger-v2 / engine-needed (deferred; design notes for the next engine pass)

- **Spoils of Isolation THP** (= total vital dealt) — needs damage-dealt-fed THP, i.e. the "conditional-THP riders" Phase-3 item. Roll already automated; THP manual meanwhile.
- **Severance** (vital vs Isolated) — conditional-vs-state, explicitly Phase-3. Positional Isolated check needed.
- **Sapping Hex** (hit Isolated → Weakened) — blocked twice: positional check + `Weakened` isn't a native status (§9 todo: register a custom Edha status). Manual tracking meanwhile (same as Black Draw Mana).
- **Prognosis** (Diagnosed takes damage → regain 1 Inv 1/round; +[Tier][Die] heal vs conditioned) — blocked on the `edha-take-damage` native event (§9 todo). CONFIRMED: `foundry-build.js` `TRIG_EVENT` maps only deal-damage/kill; a `take-damage` table entry emits NOTHING today (triggerRule returns null, line ~153) — do not author one until the event type exists.
- **Life Surge / Overgrowth overflow-THP** — heal-overflow→THP needs applyHealing-side logic; conditional-THP family.
- **Vital Diagnosis "Diagnosed" marker + party +Tier vital** — marker needs apply-to-target effects, but `talentEffects()` hardcodes `transfer:true` (owner-only). Small generator extension (`transfer:false` passthrough) — same need as baking the §8b adversary effects; bundle them.
- **Mender's Instinct auto-prompt** (ally drops ≤ half) — HP-threshold trigger family; clickable roll already works as the fallback.

## C — Stays manual (workarounds)

- **Siege Form** — mutates the Forge Construct (Speed 0, +2 deflect, ranged attack). Workaround: pre-bake a toggled-off "Siege Form" AE on the summoned actor by hand (world-actor pattern from §8b) — but the construct is created fresh each summon, so it'd need the summon statblock to carry it → bundle with the adversary-effects generator work.
- **Trade Routes** — linked-Foundation teleport; pure positioning.
- **Through the Fray** — grants an ally a reaction; action-economy, no key.
- **Guiding Signal / Concordant Presence** — "raise the stakes" = plot-die mechanic, no engine key (same family as the §8b advantage/disadvantage gap). Token-icon reminder if wanted.
- **Practiced Kata** — narrative/scene-start; Decisive Command d4 — manual `/r 1d4`.
- **Cruel Step / Unnerving Approach** — movement/push (Phase-3 "movement/positioning" family).
- **Erudition / Emotional Intelligence** — downtime skill reassignment.
- **Field Medicine resolution** — recovery-die bump isn't automated by design; the Medicine test roll is.

---

## D — Build / sync / verify — ✅ DONE 2026-06-11 (all five rules live-verified)

Results: build clean (`VALIDATION PASSED ✓`), synced 6 characters / 50 talents. **Warlord's Advance**: 0-cost confirm button DOES post; full chain verified (kill → button → THP 2). **Swift Healer**: Verdant Mend = `(2)d8 + 6 + 2` ✓. **Stances**: both AEs present, toggled-off ✓. **Lay Foundation**: cost consumed + card posts, BUT the template is transient (auto-deletes after capture) — the Foundation zone still needs a manual drawing; pull the entry if it annoys. **Arc Flash regression**: prompt posts ✓. Bonus find: Investiture source-override clamp gotcha (see the 2026-06-11 delta in the handoff doc). Original checklist kept below for reruns.

### Original instructions (for reruns)

1. **Foundry fully closed** (`Get-Process | ? {$_.ProcessName -match 'foundry|electron'}` — kill if needed; setup screen still holds pack locks).
2. ```
   cd "…/Skilltrees/scripts"
   node foundry-build.js deity
   node foundry-build.js heroic
   ```
   (Single scope arg only — run twice. Leyline untouched this pass. Expect events count to rise by 2 — Warlord trigger + Lay Foundation aoe — riders also emit rules, so deity+heroic events ≈ +3; effects +2.)
3. `node C:\tmp\validate2.js` → expect `VALIDATION PASSED ✓`.
4. Launch world → **⟳ Sync** (rerun once if talent count looks short — known flake).
5. Live-verify checklist:
   - **Outlaw**: kill a dummy with any attack → confirm chat-card button appears → accept → Temp HP = 2 (tier). UNVERIFIED ASSUMPTION: the executor posts the button for `optional:true` even at `value:0` (couldn't read register-skills.js file-side). If THP instead applies instantly with no button, either accept immediate-fire (GM strips wrong grants) or edit the rule on the Events tab. Vigilant Stance / Flamestance show as toggled-off effects on the sheet.
   - **Vivisectionist**: roll Verdant Mend → heal total includes +2 (Medicine 2). Check the rider does NOT fire on damage rolls.
   - **Forgemaster**: use Lay Foundation → 1 Inv consumed? template drops, white, ~10 ft across, allies targeted. If it lands centered wrong or vanishes instantly, delete the rule (Events tab) and note it for the burst-engine rework.
   - Demolisher: untouched, spot-check Arc Flash still fires (regression).
