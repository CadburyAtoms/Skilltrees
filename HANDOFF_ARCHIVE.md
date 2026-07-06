# EDHA_FOUNDRY_HANDOFF — header delta archive

Verbatim 'Prior:' entries moved out of the handoff's header paragraph on 2026-07-06
(TODO_REPO_HYGIENE item 7). Nothing here is edited or summarized — each section below is
the exact text that used to sit in the header wall. Most dates ALSO have a full
`## <date> DELTA` section in `EDHA_FOUNDRY_HANDOFF.md`; that doc stays canonical.
Newest first.

## 2026-07-04

**2026-07-04** (ENGINE BACKLOG BUILT — all **11** §9a/§9b items wired in one pass, per-item commits, Ben sign-off 07-04: 5 shared primitives (GM summon relay · melee discriminator · injury tool · edhaCanSee LOS · forced-move stamp) + 6 tree-local hooks (Pinpoint follow · Pyre spread · Shatter Focus auto-prompt · target-bound nextTestMod · Vital Diagnosis reveal · the Civ enemy-cost EXPERIMENT); engine + a module.json declaration only → NO extra pack rebuild; §9a/§9b emptied into §9g; see the top delta).

## 2026-07-03c

**2026-07-03c** (ENGINE BACKLOG CONSOLIDATED — §9 is now the single canonical backlog; 11 real / 10 stale-killed / 5 duplicate-families-merged, + the Blue Key rider wired as a sweep-fix; see that delta).

## 2026-07-03b

**2026-07-03b** (ORDER (Tessavain) deity tree wired — **ALL 15 TREES COMPLETE**. Blue Edicts (prohibition → consequence) + White Covenants (pacts → protection): owner-flag lists (cap = tier, oldest fizzles) + registered `edict`/`covenant` statuses; the violation model is watcher-PROMPTED (move / Investiture-spend / attack-the-ally — all three canonical prohibitions ARE detectable) + owner/GM button-FIRED, with the consequence fully engine-resolved; Verdict rolls Blue vs Cognitive (edhaReadDefense); the "tests Discipline vs. your Blue" clauses run through edhaFoeSkillVsColor (EDHA_SKILL_ATTR gained `dis:"wil"`); Shoulder the Oath's pre-standard partial event REDONE as the post-damage Reaction card (Ben R4); Bear Witness got the engine's FIRST start-of-ROUND consumer; Covenant's mutual +1 defenses is a GM-side proximity-watched AE pair. The "Edict"/"Concord" name collisions were AUDITOR-side only (audit.py substring matching — fixed with longer-name masking + word boundaries + the "vs. your Color" opposed-skill blind spot; no renames, unlike Knowledge's Apex Predator). ENGINE + a data change (Shoulder the Oath's authored event removed; talent-thp.json row SUPERSEDED) → pack rebuild deferred to the Foundry machine + ⟳ Sync).

## 2026-07-03

**2026-07-03** (KNOWLEDGE (Gnothis) deity tree wired — the **Insight economy**: study (Green Attunement Range) → stack Insight (max 5, one bearer at a time, an owner-flag pointer + the ALREADY-REGISTERED stackable `insight` status's own count) → strike (Red, most damage scaling ONE [Tier][Die] roll × Insight count). The capstone's name collision with Green/Instinct's already-wired "Apex Predator" was resolved by RENAMING the Knowledge capstone to **"The Final Study"** (Ben R2) rather than gating on color. Killing Blow / The Final Study are preUseItem takeovers rolling Red vs Physical (edhaReadDefense, never trust-the-player); Predatory Strike / Hunter's Discipline / Pack Share / The Pack ride the applyDamage pre/post-pass (armed-strike + hand-written ally-rider shapes, deliberately NOT the generic multi-owner `edha-apply-status` dispatch, since Studied Mark + Pack Share would otherwise collide on `edhaActorRuleOf`'s first-match lookup); Hunter's Discipline / Death Mark's on-kill transfers ride the SHARED live→0 HP stamp (Death's preUpdateActor hook); Accumulate's damage→Investiture clause reuses the EXISTING generic `edha-marked-damage-trigger` dispatch verbatim (Prognosis is the literal worked example) — the one data-side addition, hand-computed with the SAME `fid()` hash the generator would produce. ENGINE + a data change (capstone rename across domain.json/talent-rolls.json/deity-knowledge.json; Accumulate's new marked-watch event) → pack rebuild deferred to the Foundry machine + ⟳ Sync).

## 2026-07-02c

**2026-07-02c** (POWER (Tyrith) deity tree wired — **dominate (Black control) → kill → escalate (Red kinetic)**: both pre-standard wirings AUDITED against the cards and REDONE (Warlord's Advance's heuristic on-kill event + Investiture of Command's first-ally-only THP event removed — Ben R5/R6), Black-vs-Cognitive takeovers gated on `edhaReadDefense` (Kneel with the new `compelled` status + a wired advantage passive; Absolute Authority with an ENFORCED target gate), Crown of Thorns pinging every engine-resolved Black/Red vs-Cognitive test, armed-strike kinetic riders on the applyDamage pre/post-pass, Warlord's Fury's kill tally, Unstoppable Advance's NEW move-through watcher, and the Mantle capstone (defense AE + melee spirit + ally +1-test injector ⚑ + redirect prompt); ENGINE + a data change (two authored events removed; Warlord's/Unstoppable dice black→red) → pack rebuild deferred to the Foundry machine + ⟳ Sync).

## 2026-07-02b

**2026-07-02b** (CIVILIZATION (Kethane) deity tree wired — **Foundations + the Combat Construct**: the pre-standard 06-12 Lay Foundation takeover and the authored Forge Construct summon spec AUDITED against the cards and KEPT (one stale dead event removed — Ben R2), plus the seven unwired cards: Tempered Edge / Arsenal / Magnum Opus dealer-riders on the applyDamage pre/post-pass, Bastion fortified Regions (a new reusable `edha-content.fortified` disposition-gated enter check), Trade Routes link + Teleport button, Bonds of Community off the shared live→0 stamp, and the generalized `edhaFoeSkillVsColor` foe-test helper; ENGINE + a small data change (the stale Lay Foundation event removed, Forge Construct notes updated) → pack rebuild deferred to the Foundry machine + ⟳ Sync).

## 2026-07-02

**2026-07-02** (DEATH (Morrath) deity tree wired — the **Harvested Remains** economy (harvest on defeat / spend on Bone Garden / Risen Servant / Speak with the Fallen), a GM-side live→0 defeat watcher feeding Reaper's Harvest + Necrotic Cascade, a real drop-to-1 Death Ward in the applyDamage post-pass, per-turn Consuming Decay drain, enforced Bone Garden terrain + end-of-turn keen, and the widened fraction-0 heal-cut for Withering Touch; ENGINE + a data change (Death Ward / Necrotic Cascade authored events removed, Cascade's formula moved onto the item) → pack rebuild deferred to the Foundry machine + ⟳ Sync).

## 2026-07-01

**2026-07-01** (SOVEREIGNTY (Verdannis) deity tree wired — the **damage-die step** lifecycle (Exalted/Diminished), all on the existing rollDamage wrapper + status/flag/relay machinery; ENGINE + a prose-only data change (7 cards re-worded "die size for all tests" → "damage die size", Ben's ruling) → pack rebuild deferred to the Foundry machine + ⟳ Sync. NOTE: Life (Anaveth) / Chaos (Maelith) / Fate (Olvarra) were wired 06-17/06-18 but never got deltas or checklist sections — their record is their `register-skills.js` section headers).

## 2026-06-17

**2026-06-17** (DESTRUCTION (Razkael) deity tree wired — first deity tree; the **Charge** lifecycle (set / pinpoint / detonate / detonate-all) + dangerous-terrain reuse, all on the Red/hazard machinery; ENGINE-mostly + a small data change (Set Charge / Fault Line events removed) → ⟳ Sync).

## 2026-06-16c

**2026-06-16c** (GREEN TREE COMPLETE — Territory + Restoration + Instinct; see the 06-16 / 16b / 16c deltas).

## 2026-06-14f

**2026-06-14f** (BLUE / Foresight wired → **BLUE TREE COMPLETE** = Calculation + Foresight + Illusion; mostly manual prediction/initiative, the rest reuses the Calculation `nextTestMod` flag + a new `edha.calculatedPatience()` toggle; ENGINE-ONLY, no rebuild).

## 2026-06-14e

**2026-06-14e** (BLUE / Illusion wired — the three summon talents spawn REAL friendly tokens via the shared `edhaSummon` engine (Phantom Barricade / Phantom Double / Holographic Illusion), plus Ghostly Walls immobilize + Absolute Stillness Weakened rider; ENGINE-ONLY/name-based off `useItem`, no pack rebuild; specs/rulings signed off by Ben first).

## 2026-06-14d

**2026-06-14d** (BLUE / Calculation wired — cognitive control: a counted `nextTestMod` (dis)advantage-on-next-test flag + Disorient, all driven off `cosmere-rpg.useItem` on the owner's own client; ENGINE-ONLY/name-based, no pack rebuild).

## 2026-06-14c

**2026-06-14c** (WHITE / Accord wired — Disoriented/Determined conditions, accords, attack-disadvantage cards; Disoriented auto-expires owner-relative; engine-only EXCEPT Unyielding Accord's drag-AE = pack rebuild). **WHITE TREE COMPLETE (Coordination + Bulwark + Accord).**

## 2026-06-14b

**2026-06-14b** (WHITE / Bulwark — applyDamage-wrapper mitigation + Hardy max-HP AE).

## 2026-06-14

**2026-06-14** (WHITE / Coordination wired — Plot Die ("raise the stakes") primitive + ally-support, ENGINE-ONLY/name-based, no pack rebuild).

## 2026-06-13c

**2026-06-13c** (BLACK tree-by-tree: Isolation + Ritual + Subjugation specialties wired. 06-13c = Subjugation focus-economy engine, ENGINE-ONLY/name-based, no pack rebuild. 06-13b = the reusable tools: `edha-on-hit`, `edha-test-rider`, `edha-ritual-hp-cost`, `edha-heal-cut`, affliction-damage engine, Reserve. See top deltas).

## 2026-06-13

2026-06-13 (Weakened rework → ends at the creature's next turn + generic timed-status expiry), 2026-06-12 (pack-path schism fixed + workflow hardening), 2026-06-11b (V3 ENGINE PASS), 2026-06-11 (playtest-PC triage), 2026-06-10b (playtest-1 prep — §8b), 2026-06-09 (RE-REFACTOR: behavior on talents). [Superseded deltas collapsed to one-liners below.]
