# Edha — Foundry Test Checklist (Leylines: Black · White · Blue · Red · Green — Deity: Destruction · Life · Chaos · Fate · Sovereignty · Death · Civilization · Power · Knowledge · Order — ALL 15 TREES)

In-Foundry verification for every wiring pass to date. Engine detail lives in
`EDHA_FOUNDRY_HANDOFF.md` and the per-tree PR bodies. For any tree you can also generate a fresh
per-talent worklist with
`python .claude/skills/leyline-tree-authoring/audit.py <color|deity-name> --checklist`.

**Restructured 2026-07-26 (Ben's ask, after the migration deploy):** the 22 pre-migration
per-tree sections (343 rows written against the deleted name-keyed engine) and 38 superseded
rows are retired (paper trail: the 2026-07-26f handoff delta + git history), and the 29 rule-2b
pass sections are reorganized into per-TREE `# BENCH —` sections, each mapped to a pre-built
bench actor (`scripts/bench-setup-console.js`). Rows keep their historical 2b ids in the bold
label; each section's preamble names its priority rows; spot-check rows carry the collapsed
like-for-like coverage and name their source ids.

**Ben: don't read this file at the bench — open `EDHA_DASHBOARD.html` in a browser instead
(Bench tab).** Same content as a clickable sheet: Pass/Fail/Partial/Skip per row, a note box,
filters, progress counts, and a **Copy for Claude** button that produces the paste-back report.
Marks save locally in the browser and survive pulls — but the 07-26 restructure re-keyed most
rows, so pre-restructure marks are orphaned (see DEPLOY STATE).

This MD stays the agents' source of truth: agents edit here, then regenerate the dashboard with
`node scripts/build-dashboard.js` (CI fails if the two drift). Mark `[x]` here only for rows
retired for good; live testing happens on the dashboard.

---

# ⚑ DEPLOY STATE (confirmed by Ben 2026-07-26 — the migration deploy is LIVE)

**What is live on Ben's machine (2026-07-26):** the full rule-2b migration (passes A→AB — all
221 talents on their own documents, ratchet 0), the pre-deploy audit fixes, and the 2bAC
Edit-Event-Rule dialog CSS fix. Evidence: Ben ran the deploy, benched day 1, and confirmed —
"I can confirm it appears the migration worked" (2026-07-26). The checklist was restructured
the same day (991 → 568 open rows; delta 2026-07-26f): the 22 legacy per-tree sections
tested the DELETED name-keyed engine and are retired; the 29 rule-2b pass sections are
reorganized into the per-tree `# BENCH —` sections below, each mapped to a bench actor from
`scripts/bench-setup-console.js`.

⚑ **Three switches Ben has not explicitly confirmed:** (1) PC "⟳ Sync Talents" after the
deploy, (2) the "⟳ Sync Adversaries from Pack" click, (3) re-dragging the 2bAB adversaries
(placed copies are frozen snapshots). Rows touching adversary rewires (2bR-17, 2bS-3, 2bZ-10,
2bAA-9, 2bJ-13/14, and the whole 2bAB block) are not trustworthy until (2)/(3) — if one fails,
confirm the sync state before reporting a bug.

⚠️ **Standing warnings:** the console macro `edha.calculatedPatience()` was retired by pass P —
a hotbar macro calling it will throw (2bP-3 tests the replacement). PC tokens are linked and
never need replacing; PCs need no ⟳ Sync unless a section says a specific pack-baked talent
changed.

**Marks caveat (07-26 restructure):** dashboard marks are keyed by section title + row text, so
the restructure orphaned pre-restructure marks. If day-1 marks were never pasted back, recover
them from the pre-restructure dashboard in git history before trusting the new sheet.

**✅ The 07-26l ENGINE half is LIVE (bench run 4, 2026-07-26m).** All six engine fixes were
re-tested at the table and PASSED — Whispered Doubt's drain card (canary), Puppeteer's `{name}`,
Cruel Step's straddle (plus the ⚑ near-parallel residual), Mender's ally + on-scene gates, the
heal-cut family gate, `edhaAttackKind`'s ranged stand-downs, and Tempered Edge read by NET.
Evidence per row in the 07-26m delta.

**✅ The 07-26n ENGINE half is LIVE (bench run 5, 2026-07-27a).** The fresh Bench join's served
`register-skills.js` carries `edhaOwnerListQueue`, the new `edhaIsConstruct` (`system.type` read)
and the `spec.creatureType` summon mint — and the Remains-race re-test confirmed the queue works
at the table (counts serialize, entries survive; the residual dispatch loss is a NEW defect, see
the Death section).

**Still BLOCKED-ON-DEPLOY — THREE data/pack halves (all re-confirmed by fresh compendium reads,
bench run 5).** Ben runs these with Foundry closed:
- `foundry-build leyline` + **⟳ Sync Talents** (Mender's Instinct's one-liner note + green range
  gate — run 5 re-confirmed the live pack still carries the 228-char note and an empty `rangeColor`).
- `foundry-build deity` + **⟳ Sync Talents** + **RE-FORGE the Construct** (07-26n: Forge
  Construct's rule mints its summon `creatureType: "Construct"` — run 5 read `creatureType: ""`
  in the live pack; an already-summoned Construct also keeps its old humanoid type until re-forged).
- `foundry-build adversaries` + **⟳ Sync Adversaries** + **re-drag the Fellstag** (Herding
  Antlers — run 5 re-confirmed a FRESH pack read still shows 0 events) + **re-import BOTH bosses**
  (Flame Surge — run 5 re-confirmed both bosses' live `damage.formula` is still `null`; placed
  copies stay frozen at 0 until re-imported).

Only Ben advances this section.

---

# BENCH — Engine-wide & cross-tree (run these FIRST — the migration premise)

Any bench actor works here; **Bench — Red** is the reference. No pack rebuild pending — every
row below is live on the current deploy. **If 2bA-7 fails, stop the whole bench and
report it** — every converted talent rides the same premise. The dialog rows (2bAC) were the
day-1 bench report, already fixed.

## The premise (stop if these fail)

**Bench run 1 (2026-07-26g): the five premise rows PASSED on the live table and are retired** —
2bA-7 (count 1→2 → two disadvantaged tests), 2bB-3 (deflect 1→2 → marker +2), 2bC-6 (opportunity
tick → Plot Die + menu), 2bP-12 (three tabs populated; sustain 2 → two Constructs), 2bA-9 (natives
ARE in both dropdowns — Reckless Momentum / Risky Behavior / Resilient Hero stay bucket 1b).
Evidence per row in the delta. The two 2bAC rows below are visual-legibility judgments — still ⚑ Ben.

- [ ] **2bAC-1 — Edit Event Rule legibility** — open any converted talent → Events → edit its Triggered Effect rule → ⚑ ~660px window; every label reads as a phrase (2 lines max), its control sits beside it, the hint sits UNDER the pair in smaller type, the form scrolls inside the window, and Update is reachable at the bottom.
- [ ] **2bAC-2 — short dialogs unharmed** — edit a rule with a small handler (e.g. an *Edha: Apply Status* or a native *Update Actor* rule) → ⚑ Same two-column layout, nothing misaligned — the grid must not have wrecked the simple case.

## Migration machinery (cross-tree behaviour)

- [ ] **2bA-6 — edha-push default** — Author a NEW push rule on any talent, leave Note blank → Card reads **"Push"**, not "Shockwave Slam". (Fixes a talent-specific default baked into a generic handler.)
- [ ] **2bB-8 — no stray indicators** — Flamestance + Vigilant Stance sheets → The old greyed *"(Active) — INDICATOR ONLY / Mechanics manual"* effect is **GONE** from both. The stance marker is the indicator now. (Vigilant Stance is otherwise unchanged this pass.)
- [ ] **2bM-1 — ⚠️⚠️ H3 ordering (any ledger)** — as a PLAYER, with **no GM connected**, use **Covenant** on an ally you don't own → It refuses with "a GM must be online… nothing placed" and **no half-formed pact is left behind**. Before the fix the entry was written anyway and then hidden for ever. If a GM is always online at your table, skip — this cannot bite you.
- [ ] **2bL-13 — ⚠️⚠️ The combat-timing talents must not fire TWICE** — start a combat while owning **Foresight**, **Sidestep** or **Practiced Kata** → Each grants/enters **once**, exactly as before. Round 1 begins at combat start and this pass added a round-start moment to the same trigger, so a double grant here is the regression to catch.
- [ ] **2bL-14 — ⚑ Bear Witness — mid-combat reload** — in round 3+, refresh Foundry (F5) → Nobody gains a fresh round of Temp HP just for reloading.
- [ ] **2bT-19 — regression: the five test talents' cards** — use Censure / Killing Blow etc. → The SYSTEM's use flow runs now (no takeover): cost charged exactly once, the player's test roll is captured by H1, and the card's own damage button is to be IGNORED (engine applies). Watch for double-application.
- [ ] **2bQ-6 — ⚠️ Studied Mark / The Final Study — must be UNCHANGED** — use **Studied Mark** on a creature → Its snapshot card must read **exactly** as it always has, and must still **withhold Cognitive defense**. These talents were not converted this pass, but their card text now runs through the new shared helper — if Cognitive has appeared, or the wording has shifted at all, that is a regression and worth stopping for.
- [ ] **2bE-8 — no tracker fallback** — use Fast Talker out of combat (or with CAE disabled) → A plain chat note, no error. The graceful fallback must survive the handler move.
- [ ] **2bE-9 — ⚑ adversary widening** — put an adversary carrying a combat-timing talent into a fight → It now gets its combat-start grant. **Deliberate change** — the retired hooks were gated `type === "character"`; rule-driven dispatch doesn't need that gate. Tell me if you'd rather it stayed PC-only.
- [ ] **2bP-6 — ⚠️ Draw Mana — the card changed** — Draw Mana on a Blue or Red character → You now get the **Draw Mana summary card plus a second card** from the Key, where it used to be one clause inside the summary line. Cosmetic, but it is a visible difference — say if the extra card is noise.
- [ ] **2bP-7 — ⚠️ Draw Mana — the other three Keys are untouched** — Draw Mana on **White** (with Beacon of Stability), **Black**, and **Green** → Unchanged in every respect: White heals + the Beacon cleanse card appears, Black Weakens, Green prompts for terrain (and Thorn Field still bakes its keen hazard). These three did **not** move — if any of them changed, that is a bug in this pass.

## Engine-wide fixes still unbenched (pre-migration survivors)

**Bench run 4 (2026-07-26m): the melee-discriminator row is RETIRED** — `edhaAttackKind` now reads
`system.attack.type`: a weapon set to `"ranged"` skipped Warlord's Advance's rider AND left the arm
armed; blanking the field (schema re-initialises to `"melee"`) fired "+4 impact strike" and consumed
it; Withering Touch's ranged half behaved identically. Evidence in the 07-26m delta.

- [ ] **GM summon relay** — as a PLAYER without actor-create: Phantom Barricade / Risen Servant /
      Forge Construct produce a real token via the GM client; you can move it and use its attack;
      `actsAfterCaster` puts it on the caster's initiative. No GM online → the old warn.
- [ ] ⚑ **Injury tool** — Raise Dead: the card names the auto-added injury and it appears on the
      target's sheet (schema drift falls back to a bare-named Item — report if fields are missing).
      Apex Form: ending the scene (delete combat) adds the injury + card. Create a world RollTable
      named "Injuries" and confirm it takes precedence over the placeholder list.
- [ ] ⚑ **Formula bar** — any advantage roll reads "2d20kh + 6" (spaced, no stray ")"). If garbling
      recurs, note whether the roll dialog's Temporary Bonus field had anything typed in it.
- [ ] **Withering Ray skill test** — if the garbled `2d20kh+6)` bar reappears, SCREENSHOT it (still
      the one un-reproduced report).
- [ ] ⚑ **Engine-move collision** — Unnerving Approach push (and Cruel Step slide) toward an occupied
      square: the moved token stops in the last free square, never stacking. Manual drags still stack
      (intended — R2 engine-only).
- [ ] ⚑ **Flame Surge / burst cards** — Detonate: button reads "Detonated ✓" and stays disabled after
      F5 / re-login; re-clicking is impossible. Cancel reads "Cancelled — refunded ✓". Old cards from
      before this fix still reset on refresh (only messages stamped from now on persist).

## Structural (tree graphs + prereqs, from the 07-24 fixes)

- [ ] **The 10 recovered talents show behaviour again** — after rebuild + ⟳ Sync, each of these
      has a NON-EMPTY Events or Effects tab: **Guardian Stance** (White, +1 Deflect AE),
      **Thorn Field** (Green), **Shoulder the Oath** (Order), **Lay Foundation** (Civilization),
      **Death Ward** + **Necrotic Cascade** (Death), **Set Charge** (Destruction, 2 rules) +
      **Fault Line** (Destruction), **Warlord's Advance** + **Investiture of Command** (Power).
      Their behaviour was being erased at build time by an empty authored overlay.
- [ ] ⚑ **Nothing else lost its rules** — spot-check two talents that already worked (e.g. Black's
      Withering Ray, Red's Arc Flash): tabs unchanged. The A/B build says 0 talents lost anything,
      but that is a repo-side check, not a table one.

---

# BENCH — White (leyline)

Run on **Bench — White** (ally dummies in range; a hostile pair adjacent for the Bulwark
reactions). No pack rebuild pending. Priority: 2bR-18 (premise), then 2bR-7
(the pass's only deliberate drifts).

**Bench run 2 (2026-07-26i): 13 White rows PASSED on the live table and are retired** — 2bR-18,
2bR-7, 2bR-11, 2bR-12, 2bR-15, 2bR-16, 2bQ-10, 2bR-2, 2bR-13, 2bR-14, 2bJ-2, 2bJ-13, 2bR-8, 2bQ-9.
Evidence per row in the 07-26i delta. The rows below stayed open — all four survivors share ONE
root cause except 2bR-17.

> **✅ Bench run 3 (2026-07-26k): the 07-26j dice fix is CONFIRMED LIVE on the table.** Shield Wall
> (5 then 3 reduction, fresh dice each trigger, stands down below 2 adjacent allies), Interposing
> Shield (offer with a real number, click spends 1 Inv, retro-reduction lands, "up to 10 ft" move)
> and Retributive Guard (offer on attacked-adjacent-ally, 8 spirit dealt on the White test,
> fall/hazard damage offers NOTHING) all passed and are retired — evidence in the 07-26k delta.
> All 7 restored rules in the other five trees were benched the same run and printed real numbers.

- [ ] **Devoted Conduit (2bR-10)** — have a SECOND White character redirect damage onto an ally in your Attunement Range (Shared Burden's redirect is the trigger) → you reduce that redirected damage by **half [Tier][Die] (1–8)**, on a card naming Devoted Conduit. ⚑ It deliberately never reduces the redirect the owner took **themselves** — the card reads "when an ally… takes damage intended for another creature", so it needs two White characters to observe. The other four White spot-checks (Pillar of Order · Concordant Presence · Voice of Authority · Collective Resolve) passed 07-26i and are retired. *(2026-07-26k: the shared evaluator is proven — its three sibling rules on the same call site all rolled real numbers this run; only the two-White staging remains, and the bench roster has one White PC → ⚑ Ben or a two-client run.)*
- [ ] **⚑ Burst-only: the 13 damage riders that lost their bonus inside an AoE** — `edha-damage-rider` was fine on ordinary hits but went through the broken evaluator on the **`edha-burst` detonate** path, so these lost their rider **only when the damage came from a burst**: Life's **Prognosis**, and the bite/strike riders on Mistheron · Stillback · Wasting-Eater Stillback · Wrongwake · Wasting-Eater Wrongwake · Keelshadow · The False Spring · Brandram · Hazewyrm Adult · Hazewyrm Elder · The Doubled · The Doubled Elder. Needs the owner to deal damage through an AoE specifically — awkward to stage, so it stays ⚑ rather than a promised row.
- [ ] **2bR-17 — Callthief's Counterpoint** — run it against a target → it rolls the Callthief's **Deception**, resolves vs the target's Cognitive defense, and on a success negates the influence and leaves it Disoriented for 1 Focus. Bellwether's / The Reckoning's Ordered Advance half of this row PASSED 07-26i and is retired. *(2026-07-26k: the PACK REBUILD IS CONFIRMED LIVE — a fresh pack read shows Counterpoint at `skill_test/dec`; the run itself is still to do, on a FRESH import.)*
- [ ] **⚑ The other five restored adversary abilities (same 07-26j fix)** — run each once on a FRESH pack import: **Reeve-Owl** Sovereign of Solitude (black) · **Rootling Swarm** Grasping Vines + Territorial Instinct (green) · **Tussock-Sow** Drive the Prey (green). Each must now ROLL its named skill and print a `N vs <DEF> M — SUCCESS/FAIL` card instead of silently charging its cost. (Surecat's Redirect Momentum is 2bF-17 in the Blue section.) *(2026-07-26k: rebuild confirmed live — all five read `skill_test` with their skills on a fresh pack read. ⚠️ The Fellstag's **Herding Antlers** was MISSED by the same fix — see the Green spot-check row.)*

---

# BENCH — Blue (leyline)

Run on **Bench — Blue** (enemy dummies in Blue Attunement Range; one with a written Cognitive
defense, one without). No pack rebuild pending. Priority: 2bJ-1 (first prompt-pick ever
— if it fails, every prompt row dies with it), 2bF-3 (first `vs: skill`),
2bAA-10 (the walls), and 2bP-2 (the silent-free-buff trap).

**Bench run 2 (2026-07-26i): 13 Blue rows PASSED on the live table and are retired** — 2bJ-1
(the first prompt-pick click in the project WORKS), 2bF-3 (the first `vs: skill`), 2bAA-10 (the
walls), 2bP-1, 2bP-2 (the trap row), 2bP-3, 2bP-4, 2bJ-5, 2bF-2, 2bF-4, 2bF-5, 2bF-6, 2bI-12,
2bAA-7, and the Blue spot-check row. Evidence per row in the 07-26i delta.

- [ ] **2bF-17 — Surecat → Redirect Momentum** — run the adversary's copy → it rolls **Blue**, rolls the TARGET's Athletics, and prints `Blue N vs ATH M`, same as the PC talent (2bF-3, which passed). *(2026-07-26k: the 07-26j PACK REBUILD is CONFIRMED LIVE — fresh pack read shows `skill_test/blue`; the run itself is still to do, on a FRESH import.)*
- [ ] **2bAA-6 — Living Image** — open it → **Events tab**; then start your turn with an illusion up → ⚑ TWO rules where the tab was empty: `edha-illusion-upkeep` (config) + `edha-note` (use). The turn-start prompt still whispers with a one-click pay. **Edit `costPer` to 2 and the button must then charge 2** — that is the whole point of the conversion.
      *(2026-07-26i: NOT RUN — the turn-start upkeep needs a live combat turn change, which the
      cosmere activation model does not expose from the console. Ben's row for now.)*
- [ ] **2bJ-3 — Pattern Recognition (Blue) ⚠️** — use it on a target, accept, then have them roll a test **this round**; separately, accept and let the **round change** before they roll → Disadvantage on the test this round. After the round changes it **no longer applies**. ⚑ **BEHAVIOUR CHANGE:** the card always said "their next test **this round**" and the old flag waited for ever. Tell me if you'd rather it kept waiting.
      *(2026-07-26i: NOT RUN — needs a real round change; see 2bAA-6.)*
- [ ] **2bAA-8 — Phantom Double** — Events tab; use with no target, then on an ally in range, then on an ally out of range → ⚑ ONE `edha-illusion-copy` rule. Belief loop unchanged (each enemy that can see it rolls Perception vs your Cognitive defense; fooled clients stop rendering the original). **NEW: an out-of-range ally refunds the 2 Investiture.**
      *(2026-07-26i: NOT RUN — the belief loop wants a second client; ⚑ Ben's.)*
- [ ] **2bAA-9 — The Seeming — Mistheron AND The Doubled Elder** — use it on each; break the copy → ⚑ Each adversary ability now carries its OWN `use` rule (⟳ Sync Adversaries / re-drag first). Both must still raise the copy and run the belief sweep, and **the cards must name "The Seeming", not "Phantom Double"**. Spearing Beak's / the Grasp's fooled-target rider must still find the belief ledger.
      *(2026-07-26i: NOT RUN — same second-client need as 2bAA-8.)*

---

# BENCH — Black (leyline)

Run on **Bench — Black** (enemies in Black Attunement Range, one Isolated, one with allies
within 10 ft, one at 0 focus). No pack rebuild pending.

**Bench run 3 (2026-07-26k): 20 Black rows PASSED on the live table and are retired** — 2bI-2,
2bI-3, 2bI-5 (the chain flag WORKS — the extra loss emptying the target credited Predatory
Insight), 2bI-7, 2bI-8 + 2bH-11 (retired as PROVEN-UNREACHABLE fail-open, runbook Known limits),
2bH-9, 2bH-10, 2bB-10, 2bJ-7 (push direction verified: away from the TARGET), 2bJ-9, 2bJ-14,
2bZ-1, 2bZ-2, 2bZ-3, 2bZ-4, 2bZ-12 (rank-3 Black Attunement Range measured at 60 ft), 2bM-8,
2bM-10, 2bF-12. Evidence per row in the 07-26k delta. The rows below stayed open — two FAILs
(→ test-pass-fixes) and the ⚑ ruling rows, each with a dated note.

**Bench run 4 (2026-07-26m): the three 07-26l re-tests all PASSED and are retired** — 2bI-1
(Whispered Doubt's loss card: "🧠 Whispered Doubt: Bench Target — Adjacent A loses 1 focus"; Red's
Shatter Focus announces off the same helper), 2bJ-8 (Puppeteer's offer names the creature, no
literal braces), and the Cruel Step straddle spot-check (the x=5156 straddle slid the FULL 10 ft,
and the ⚑ near-parallel residual also completed — `testCollision` from the collinear origin reads
false while a genuine crossing ray reads true). Evidence in the 07-26m delta.

- [ ] **2bI-4 — ⚑ Coercive Pressure stacking** — give the same creature Coercive Pressure's disadvantage **and** another next-test rider (e.g. Probability Net) → **NARROWING:** they no longer stack — the second write overwrites the first. The bespoke Cognitive-disadvantage flag that allowed both is gone. Tell me if that matters at the table. *(2026-07-26k: the single-slot shape is confirmed on the live actor — `flags.nextTestMod` is one object `{source: "Coercive Pressure", …}`; a Blood Price arm on the owner and a Coercive arm on the target each occupy their bearer's one slot. Cross-rider overwrite not staged; the ruling stays yours.)*
- [ ] **2bI-6 — ⚑ Whispered Doubt vs Wary** — have the enemy own **Wary**, then trigger Whispered Doubt → **BEHAVIOUR CHANGE:** the extra loss is now reduced by their Discipline ranks (usually to zero), because it goes through the shared involuntary-focus path. Wary's text says involuntary focus loss, so this reads correct — but it did NOT happen before. Your ruling, not a bug report. *(2026-07-26k: OBSERVED live exactly as described — Wary + Discipline 1 → net extra 0, with a card "🛡️ Wary: involuntary focus loss reduced by 1"; Coercive still armed. Note Wary announces while Whispered Doubt itself is card-less — see 2bI-1.)*
- [ ] **2bI-9 — Siphoned Will (Black)** — own it, land Hollow Command, and check the Events tab of **Siphoned Will itself** → You regain focus equal to your **tier**, on a card naming *Siphoned Will*. ⚑ Its own tab is **EMPTY** — the rule lives on Hollow Command. Third talent to take this exit (2bF-5/14/16 were the others); the question there is the question here. *(2026-07-26k: the mechanics half is verified — on Hollow Command's success, "🧠 Siphoned Will: Bench — Black regains 2 focus" (tier 2). Only the empty-tab design question remains — yours.)*
- [ ] **2bJ-10 — ⚑ Puppeteer / Unnerving Approach — the ignored card** — let one of their cards post and **do not click it**; then trigger the talent again the same round → It works again. ⚑ **BEHAVIOUR CHANGE:** the once-per-round budget is now spent when you **click**, not when the card posts, so declining no longer burns the use. *(2026-07-26k: VERIFIED — an ignored Unnerving picker did not block a same-round re-use, and its click pushed; after an accepted Puppeteer, the next 0-focus turn-start posts NO offer (budget suppresses at the offer stage). ⚑ One cost note for your ruling: each ignored USE still charges its Investiture — only the round budget waits for the click.)*
- [ ] **2bZ-10 — Dread Presence (the two unbenched adversary copies)** — a Weakened enemy in range drags its token closer to an ally, near the **Cragdrake Alpha** and the **Doubled Elder** → Move vetoed with a toast naming the talent, off each copy's OWN rule (re-drag or ⟳ Sync Adversaries first) — ranges 60/60 ft via role rank. *(2026-07-26k: the PC half and the Dirgehound Pack copy (30 ft rival) PASSED and are retired — both vetoed a console token move in place with the toast; a Weakened fixture's own staging move even got vetoed mid-run. The toast names the nearest ally scene-wide, campaign tokens included ("Frostbinder", "The Forgemaster") — correct mechanically, worth knowing at the table.)*
---

# BENCH — Red (leyline)

Run on **Bench — Red** (an enemy dummy in Red Attunement Range that can take damage twice in a
round). No pack rebuild pending — this is the PILOT tree: it holds the migration's first three
talents (2bA) and its rows ran end-to-end in **bench run 1 (2026-07-26g)**: 12 rows retired on
evidence (2bQ-1/2/3, 2bA-1/2/3/4, 2bF-11, 2bY-11, 2bY-13, 2bY-14, 2bP-5 — 2bQ-1 retired as
SUPERSEDED: the "(On Use)" spec predates the 07-25 Opportunity redesign that 2bQ-3 verified; a
bare use arms nothing, by design). What remains below is the one FAIL, the ⚑ rows, and the
spot-check row with a drift observation.

- [ ] **2bA-5 — Shockwave Slam** — Melee impact hit → Push card still reads **"Shockwave Slam"** (not "Push"). Its note now comes from the document; a regression here means the note field didn't survive the build. **FAIL 2026-07-26 (bench run 1):** a WEAPON melee impact hit (Bench Maul, 1d8 impact, hit + damage applied) fires NO push — `edhaDispatchOnHit`'s `itemSpecific = !!tal.system.damage.formula` gate reads Shockwave Slam's authored COLLISION formula as "attack talent, only fires on its own hits" and skips it for every other dealer. The push machinery itself works: using the talent directly produced "💥 Shockwave Slam — pushed 10 ft", correct away-from-caster direction, note from the document. Fix direction: the trigger surface, not the push. → test-pass-fixes.
- [ ] ⚑ **Flashpoint** — Red burst hits 2+: click the prompt → +1 Investiture AND your next Red test
      rolls with advantage automatically (pre-selected/fast-forwarded).
- [ ] **Red spot-checks (like-for-like)** — run once: Arc Flash (any energy hit) and one Frenzy talent of your choice → identical to pre-migration behaviour; any drift is a bug. **Bench run 1 (2026-07-26):** Arc Flash ✓ (offer card posted on an energy weapon hit; Afterburn's too). Battle Fever (Frenzy) has a **card-vs-engine drift**: card says "+1 to your next test (max = Rank), resets at start of your turn" but the rally bonus rode EVERY test until turn start (`rally {count, resetOn: turn}` — it never consumed on a test; observed +2[Rally] on 6+ consecutive rolls; the max=Rank cap works). Decide which side is canonical → test-pass-fixes.
- [ ] **Red / Momentum is takeable** — same check on Red: **Reckless Advance** is the branch root
      (its card now reads **"Red 1+"**, not "Burning Drive"), and **Burning Drive**, **Volatile
      Strike**, … **Unstoppable** chain down from it. ⚑ **Ben — eyeball the drawn tree**: the fix
      trusted the layout + connections over the card text. If you intended Burning Drive to come
      first, say so and it flips instead. **Bench run 1 (2026-07-26): the graph half is verified
      live** — the compiled Red Leyline tree's nodes read Reckless Advance {skill red 1, no talent
      prereq}, Burning Drive/Volatile Strike {Reckless Advance}, Unstoppable {Reckless Momentum,
      red 3}. Only the drawn-tree eyeball remains.

---

# BENCH — Green (leyline)

Run on **Bench — Green** (your terrain placed; an enemy pack with adjacent allies; a wounded
ally). No pack rebuild pending.

**Bench run 3 (2026-07-26k): 14 Green rows PASSED on the live table and are retired** — 2bS-17
(THE premise: edited Pack Pressure's `amountFormula` on the document to a flat 5, the very next
strike printed "+5 keen strike", formula restored), 2bS-16 (Overgrowth stepped "+1 Deflect" as a
named AE, Life Surge's heal left it untouched — the `deflectStackMax` field discriminates; both
talents' shared overflow-THP rule also fired), 2bS-2 (hazard tick "3 keen … (Thorn Field —
Bench — Green)" on enter), 2bS-5 (1 enemy → plain, 2 → plain, 3 → `2d20kh`, Weakened → `2d20kl`
not stomped), 2bS-8 (the restored dice: "+10 keen strike" = 2d8, window card = the editable
note), 2bS-9 (in-combat: solo silent, co-attacked round "+2 keen (2 hunters)"), 2bS-10 (hidden
attacker on an ally rolled `1d20 + 2 - 2[Packmate's Warning (+2 defense)]`; Green-as-target
unmodified), 2bF-7/2bF-8/2bF-9 (Restrained-no-expiry / engine-rolled Survival → Immobilized /
Survival → Slowed), 2bR-4 (offer card on the ally's in-terrain attack, silent on a plain test),
2bM-9 (picker + nothing spent; the pick healed 17 = 2d8+5 applied), 2bT-20 (both rider paths
unchanged), and **Green / Instinct is takeable** (compiled tree: Pack Hunter = root with no
talent prereq, Predator's Instinct and Scent the Weak hang off it, column walks to Natural
Order — the session-0 mutual pair is dead). Evidence per row in the 07-26k delta.

- [ ] **2bS-11 — Natural Order — NARROWED 2026-07-26k** — the use half PASSED: 2 Inv spent, the **"Clearsight (veils suppressed nearby)"** marker landed with the explanatory card. Still open: the veil half — a veiled enemy standing in **darkness** in range keeps its auto dark-veil marker DOWN (needs scene darkness + a veil-capable adversary — staging left ⚑ for a run that owns the darkness question, or Ben), and the combat-end clear.
- [ ] **2bS-1 — Green Leyline Attunement — NARROWED 2026-07-26k** — placement PASSED (click-to-place placed the 10 ft difficult-terrain Region, "Thorn Field rides it"), and the ⚠️ cosmetic drift is confirmed (its own card; the Draw Mana summary prints no Green line). Still open/⚑: the range ring + snap feel (canvas rows, Ben's) and the out-of-range refusal (not driven this run).
- [ ] **Green spot-checks (like-for-like) — Mender's ENGINE halves PASSED 2026-07-26m; the DATA halves are BLOCKED-ON-DEPLOY** — bench run 4 retired (1) the ally gate (a HOSTILE fixture taken 32 → 12 HP drew NO offer) and (2) the scene scope (with Green's own copy temporarily removed, The Vivisectionist — owner, no token on the scene — stayed SILENT; its silence was the test). (3) the heal-block passed under 2bW-1. **Still BLOCKED-ON-DEPLOY:** run 4 read the live pack and confirmed the authored green fix has NOT shipped — the rule's `note` is still 228 chars and `rangeColor` is still `""`, so the card prints the long description and an out-of-Attunement ally (~70 ft) still draws an offer. After `foundry-build leyline` + ⟳ Sync Talents, re-check for the engine's tight "<ally> dropped to N/M HP" line and the range refusal. Green's own `oncePerRound` held in run 3 — don't re-prove it. **Herding Antlers on the Fellstag (2bF-10): BLOCKED-ON-DEPLOY, confirmed still dead 2026-07-26m** — a FRESH pack read of the Fellstag shows Herding Antlers with **0 events** and no `activation.skill`; the live pack predates commit `8917cbb`. Re-test only after `foundry-build adversaries` + ⟳ Sync Adversaries + a FRESH re-drag: target a character, use → Green vs Survival through the contest core; success → Slowed + the move-away note. **Still unrun**: Spreading Roots (2bS-4) · Pack Hunter (2bS-6) · Scent the Weak (2bS-7, though its advantage was seen arming incidentally) · Resurgent Growth (2bS-12, seen ticking incidentally in run 4 — "Resurgent Growth: Bench Ally — One regains 7 health" at a round boundary) · Natural Recovery (2bS-14) · Reknit Form (2bS-15).
- [ ] **2bS-3 — Briar-Gone Grove (adversary) — NARROWED 2026-07-26k** — the Grove's Thorn Field (boss → d8) keen rider baking into its engine-placed patches is still to bench. *(The Fellstag half PASSED and is retired: a FRESH pack import's Draw Mana placed its own 5 ft square, "Thorn Hedge rides it", and the hazard tick dealt "2 keen … (Thorn Hedge — Bench Adv — Fellstag)" — rival d6 family, its own zone-hazard rule.)*

---

# BENCH — Destruction (Razkael, deity)

Run on **Bench — Destruction** (open ground; enemy dummies to catch blasts; one Construct-type
if you can). ⚠️ 2bY-7's Constructs ×3 re-test needs the 07-26n deploys: engine sync + F5 AND
`foundry-build deity` + ⟳ Sync Talents + a fresh re-forge (see DEPLOY STATE). The other rows
need no pack rebuild.

**Bench run 4 (2026-07-26m): 14 Destruction rows PASSED on the live table and are retired** —
2bY-1 (in-range place → red 10 ft template + Charges card + arm card; both refusal paths refunded),
2bY-2 (cap = tier, oldest evicted), 2bY-3 (all three arms bound and each fired ONE whispered
Detonate prompt), **2bY-4** (Set Charge's document formula edited to a flat `6` → the detonate
rolled `6`, terrain dropped, charge consumed), 2bY-5 (pre-cost refusal + ⊕ flag + Pinpoint's own
edited formula printing "+9 keen … ignores deflect"), **2bY-6** (`failStatus` edited prone →
**slowed** on the Events tab and the next detonate applied Slowed), 2bY-8 (toggle on/off, trail
patches while on, zero after off, +10 ft Speed AE), 2bY-9 (armed card + the auto ignite/spread
firing unprompted), 2bY-10 (Pyre stamped `spreads: true`, end-of-turn spread card), **2bK-1 +
2bK-2** (2 charges detonated at once, and the multi-catch listed "+5 energy (caught in 2 blasts)"
separately), 2bK-3 (15 ft + Intellect on the first use; the second the same scene refused with
nothing spent), 2bK-4 (both capstones refused pre-cost on an empty ledger), 2bK-5 (both riders rode
one detonate), and **Razkael prereqs** (compiled tree: Cascading Failure = ONE group {Pinpoint
Charge, Concussive Yield}, Fault Line = ONE group {Combustion Chain, Walking Ruin} — the system
evaluates a multi-talent group with `.some()`, so either parent alone suffices; prose in
`data/domain.json` matches). Evidence per row in the 07-26m delta. ⚑ the drawn-tree eyeball for
the prereq row is still Ben's.

- [ ] **2bY-7 — Fault Line `Constructs ×3` — FIXED 07-26n; run 5 (2026-07-27a) confirmed BLOCKED-ON-DEPLOY on the pack half** — the ENGINE half is live (run 5's fresh join: the served `register-skills.js` carries the new `edhaIsConstruct` reading `system.type` and the `spec.creatureType` mint), but a fresh compendium read shows the deity pack's Forge Construct rule still carries `creatureType: ""` vs the repo's `"Construct"` — `foundry-build deity` + ⟳ Sync Talents + a fresh RE-FORGE have not run. **Re-test AFTER the deity rebuild + re-forge** (an old summon keeps its humanoid type): stage the line over a hostile-flipped, freshly-forged Construct in a clean lane → it takes **×3** (e.g. roll 12 → 36 − deflect), the Floater beside it ×1. The line's other dials stay retired-in-place from run 4 (Region, +2 Strength, Speed-vs-Red → Prone, cancel refund). ⚑ **Ruling still wanted:** the line spares ALLIES — the card reads "Each character in the line takes …" with no friend/foe clause, and the engine catches enemies only.
- [ ] ⚑ **Walking Ruin has no token indicator (2026-07-26m — ruling, not a bug)** — the toggle is tracked internally and nothing on the token says the character is leaving ruin behind, unlike every other scene-arm in the project (Cascade Armed, Crowned, `withernext`, `warlord`). Consistency call is Ben's.

---

# BENCH — Life (Anaveth, deity)

Run on **Bench — Life** (a willing ally dummy to mutate; a wounded ally). No pack rebuild
pending. The Life/Death premise row lives in the Death section (2bW-17).

**Bench run 5 (2026-07-27a): 2 Life rows PASSED in full and are retired** — **2bW-14** (tick
"regenerates 3 HP" = tier+1; 2 vital → "🥀 Primal Regeneration on Bench Ally — Two ends — it took
Vital/Spirit damage", `lifeRegen` cleared, no tick on the next boundary; re-granted on the
Dense-Tissue-mutated ally the tick rolled "regenerates 5 HP" = 2d8+1) · **2bW-16** (bond card;
whispered offer "took 6 keen. Take up to 3 of it as spirit" with the number input capped at half
POST-deflect; "0" declined free and a same-round re-offer appeared; a real 3 posted "takes 3 spirit
in Bench Ally — Two's place; Bench Ally — Two heals 8" = 3 + 2d8; third same-round damage → no
offer; next round re-armed). The chooser/riders of 2bW-12 and clauses 1–4 of 2bW-13 are
retired-in-place inside the rows below. Evidence per row in the 07-27a delta.

- [ ] **2bW-12 — Adaptive Mutation — PARTIAL 2026-07-27a: the once-per-creature gate is MISSING** — the chooser (whispered, three options) and all three picks PASSED: Bone Spurs "+2 keen on the strike (melee — auto-checked)" on a clean hit, Venom Glands "Afflicted — 6 ongoing vital", Dense Tissue "natural armor absorbs 2" (6 keen → 4). **FAIL: a second use on the already-mutated ally posted a SECOND chooser, charged 2 Inv again, and the click silently REPLACED Bone Spurs with Venom Glands** — the card's own "(scene; one per creature)" clause is not enforced anywhere. Not driven: Dense Tissue's forced-movement refusal (no push vehicle staged). ⚑ observation: the melee riders also fire on a nat-1 graze application — "melee — auto-checked" checks the weapon kind, not the hit quality.
- [ ] **2bW-13 — Apex Form — PARTIAL 2026-07-27a: TWO injuries at scene end, not one** — clauses 1–4 PASSED ("Apex Form: Bench Ally — One regenerates 9 HP" at its turn start; "natural armor absorbs 2"; "+2 vital on the strike"; venom "Afflicted — 12 ongoing vital (doubled — Apex Form)"). **FAIL on clause 5: deleting the combat posted TWO "Apex Form ends — takes an injury" cards and created TWO injury items** (Slowed + Exausted placeholders) where the card promises ONE. The buff/flag sweep itself was clean (apexForm, mutations, lifeline, lifeRegen all cleared). Suspected family: the scene-end clear running twice (the 2bL-13 double-fire shape) — inference, not traced.
- [ ] **2bW-15 — Surgical Precision — PARTIAL 2026-07-27a: the graze half never engages** — success half PASSED ("🩺 Surgical Precision — success: remove one condition… : Weakened", click removed it, d20 15 ≥ phy 14). **FAIL: the d20 carries NO DC (`dc: null` on the roll) — a 9 vs the target's Physical 14 still posted the cleanse card.** `roll.options.graze` is never set on this flow, so the "graze posts NO cleanse" branch is unreachable. ⚑ caveat: driven via console `use()` + default roll dialog — if Ben's sheet flow binds the defense, re-test there before fixing.

---

# BENCH — Chaos (Maelith, deity)

Run on **Bench — Chaos** (enemy dummies inside and outside Blue Attunement Range; one
Isolated). No pack rebuild pending.

**Bench run 5 (2026-07-27a): the WHOLE section — all 15 rows — PASSED on the live table and is
retired** — **2bG-4** (success 23 vs PHY 14 on a no-Omen target → "is Isolated", HP untouched,
**no damage card at all** — the H3 conditional short-circuit holds) · **2bG-6** (Entropy placed to
cap, Cascade Collapse cleared A, Entropy then placed on B at "(2/2)" — the freed slot reconciled
correctly) · 2bG-1 (THREE rules on the tab; success 23→"bears your Omen (1/2)" + "11 spirit …
2d8"; the player rolls the Blue test) · 2bG-2 (at cap, SUCCESS 17: "no Omen placed on Bench
Target — Adjacent B — you are at your cap of 2", damage still landed, both older Omens kept) ·
2bG-3 ("Omen is spent (1/2 left)" + "7 vital … 2d8 + 2" + Isolated) · 2bG-5 (with: TWO instances
6+12 vital, "a second instance rides this"; without: ONE, 11 vital) · 2bG-7 (covered by
2bU-1/3/4 — all three now carry document rules from pass 2bU and ran clean) · 2bG-8 + 2bU-5
(refund card on bearer damage; same-round re-damage silent; out-of-Blue-range damage silent — the
NEW range gate enforced; back in range next round the card fired again, Inv clamped at max) ·
2bU-1 (no target → "target the creature first (nothing spent)"; spread marked A "(1/2)" AND
nearest-unmarked B "(2/2)" auto-picked past the farther A-candidate; at cap "no Omen placed …
cap of 2"; lone target → "(1/2)" + "no additional enemy within 10 ft to mark") · 2bU-2 (dispel
card with one button per enabled effect, click posted "Bench Test Buff unravels from …" and
deleted the AE; Omen shattered → Disoriented; no-Omen use → dispel card only, no Disorient) ·
2bU-3 (ONE Blue roll sweeping per-bearer vs ITS OWN Cognitive — "affected" branch took omen +
2d8 spirit + Disoriented; the out-of-Blue-range bearer untouched, kept its Omen; empty ledger →
cost spent + "no creatures on the ledger"; a later sweep cleared TWO bearers off one roll with
serialized counts "(1/2)"→"(0/2)" — free corroboration of the 07-26n H3 write queue) · 2bU-4
(cap-full fill posted the honest "no enemy in range to mark (2/2)"; detonation hit the
out-of-range Isolated bearer scene-wide for "16 vital … 2 * (2d8)" with NO Disorient while the
non-Isolated bearer took "11 spirit … 2d8 + 2" + Disoriented; all Omens cleared; a second use on
an empty ledger filled nearest-first — Undefended + B picked over the farther A) · **2bY-12 +
2bU-6** (no-target and unmarked-target both refused PRE-COST with "nothing spent" warns; marked:
"Omen removed … rerolled the d20 18→ 14 — test drops to 18", and the reroll-higher branch
"reroll d20 = 6 ≥ kept 5 — the original test stands"; the stale ledger entry left via the
mark-wins reconcile — the next place read "(1/2)"; auto-prompt whispered with the kept total;
Mute silenced a bearer's roll; a real use re-armed the prompt). Evidence per row in the 07-27a
delta.

- [ ] ⚑ **Chaos residuals (run 5, canvas/dice-luck only)** — (a) 2bU-5's through-walls RENDERING of Omen-bearers: canvas-visual, hidden-pane session cannot see highlights — Ben's eyeball. (b) 2bU-3's "a resister keeps its Omen" branch: every sweep roll beat every bearer's Cognitive this run — not driven, pure dice luck; the per-bearer gate itself is proven (the sweep card lists each bearer's verdict). (c) ⚑ observation for the rulings batch: Unweaving's dispel card lists the OMEN MARKER itself as a dispellable effect button; and deleting the bench combat does NOT sweep the omens ledger (Life sweeps everything at scene end; Chaos has no scene-end sweep — sceneScoped entries + reconcile cover it, but it is an inconsistency).

---

# BENCH — Fate (Olvarra, deity)

Run on **Bench — Fate** (open ground for squares + snares; an enemy walker). No pack rebuild
pending. Priority: 2bX-14 / 2bAA-5 (scene reset — a missed key silently leaves
a live ledger at the table).

- [ ] **2bX-1 — Ordained Ground** — use → click in range; click OUT of Attunement Range; right-click cancel → In range: white 5 ft template + card (n/cap; Bulwark THP line only if Bulwark owned). Out-of-range or cancel: **Investiture refunded**, nothing placed. ⚠ the range gate is NEW (card-is-spec — the old engine never checked it).
- [ ] **2bX-2 — Snare** — use → place; place past cap (tier+1) → Green template + trigger Region; past cap the OLDEST fizzles (template + Region both vanish).
- [ ] **2bX-3 — Snare spring** — walk an enemy INTO and separately THROUGH the square → Springs both ways: rolled [T][D]+Awa keen (the DOCUMENT's damage formula — edit it and re-test) + Restrained; snare consumed (ledger, template, Region all gone); card title = the placing talent's name.
- [ ] **2bX-4 — Inevitable Snare** — use with no unsprung snare; then with one → No snare: refused PRE-COST (nothing spent). With one: last un-flagged snare flagged ⛓️.
- [ ] **2bX-5 — Inevitable spring** — spring the flagged snare → Extra [T][D] rolled off **Inevitable Snare's own damage formula** (edit it in Foundry — the roll must change; pre-2bX it could not) + engine-rolled SPD vs your Green → Disoriented on a fail.
- [ ] **2bX-6 — Hexmark** — own it; spring your snare with an enemy in it; click the offer; damage the marked foe within/beyond 10 ft of a zone → Offer card on the spring; after marking, +tier keen rides any damage while within 10 ft of your squares (one card per apply); beyond 10 ft nothing. Scene end clears the mark.
- [ ] **2bX-7 — Bulwark Ground** — ally starts its turn on your Ordained square; enemy attacks that ally WITH advantage → Turn start: +1 defenses AE + Temp HP = tier (card names Bulwark). The attack's advantage is neutralized to none (card; GM can re-toggle); disadvantage untouched.
- [ ] **2bX-8 — Weave the Thread** — use with <2 Ordained squares; with 2+ (pick two; also cancel once) → <2: refused PRE-COST. Picker dialog offers YOUR squares (out-of-range ones annotated); cancel refunds. ⚠ the picker is NEW — the old engine silently took the two most recent.
- [ ] **2bX-9 — Weave spring watch** — spring any of your snares within 30 ft of a linked square; then one farther away → Within 30 ft: the Reactive-Strike prompt card. Farther: no prompt.
- [ ] **2bX-10 — Read the Threads** — use; slide an Ordained square; slide a SNARE → Whispered card (foresight line + move buttons). Ordained: template moves. Snare: template AND trigger Region move (walk an enemy into the NEW square to confirm).
- [ ] **2bX-11 — Foreknown Strike** — use; click a spring button → Scene card, one button per unsprung snare; clicked snare springs at its own centre for +[T][D] off **Foreknown Strike's own damage formula**.
- [ ] **2bX-12 — Thread of Inevitability** — use; resolve; use again same scene → Declare card; resolve springs EVERY unsprung snare + rally card. Second use the same scene: refused PRE-COST (sceneOnce).
- [ ] **2bX-13 — Costs** — every active Fate talent, watch the Investiture bar → The SYSTEM charges on use (no takeover); every cancel path refunds to the starting value.
- [ ] **2bX-14 — Scene reset / stale state** — end combat (deleteCombat) on a scene with squares, snares, marks, links → Everything clears: templates, Regions, `lists.snares`, the legacy `fateOrdained`/pre-2bX `fateSnares` flags, ordained-buff AEs, every offer-mark markedBy key. ⚠ first deploy only: actors carrying PRE-repoint mid-scene state should simply lose it here.
- [ ] **2bAA-1 — Ordained Ground (the ledger repoint)** — place two squares, then a third with tier 2 → Unchanged behaviour: click-place in range, cap = tier, the oldest fizzles and its template vanishes. ⚑ the list now lives at `flags.edha-content.lists.ordained` — a mid-scene actor from an OLD build keeps a stale `fateOrdained` flag that reads as zero squares; re-place after the sync rather than reporting it as a loss.
- [ ] **2bAA-2 — Weave the Thread (the `linked` annotation)** — with two active squares, use it and link them; then spring a snare within 30 ft of a linked square → The two-square veto still refuses BEFORE cost with fewer than two. The link dialog lists your squares, and the Reactive-Strike prompt fires on a spring near a LINKED one — the annotation has to have survived the repoint.
- [ ] **2bAA-3 — Bulwark Ground (the readers followed)** — an ally begins its turn standing on one of your squares → +1 all defenses AE, Temp HP if Bulwark Ground is owned, and the Aid-at-30-ft card — all three read through the repointed accessor. Attacks against that ally still can't benefit from advantage.
- [ ] **2bAA-4 — Read the Threads (marker-command)** — use it, click "Move …" on an Ordained marker → The slide still works and the template follows. ⚠ a marker card posted BEFORE this deploy carries the old key and will say "That marker is gone" — post a fresh one.
- [ ] **2bAA-5 — Scene end** — end the combat with squares, snares and buffs live → Everything clears: both ledger keys, the templates, the snare Regions, the defense buffs. A missed key here silently leaves a live list at the table, which is the failure this row exists for.

---

# BENCH — Sovereignty (Verdannis, deity)

Run on **Bench — Sovereignty** (an ally + enemy pair targeted together). No pack rebuild
pending. Priority: 2bT-16 — it proves an ENGINE-OWNED pair talent really converted to
entry-data couplings.

- [ ] **2bT-16 — Sovereign's Balance** — use with one ally + one enemy targeted; the ally hits the enemy that round → Pair ±1 until your next turn; the hit extends BOTH one round, once, cast round only (the coupling is entry data now — `onPairHit: extend-once`).
- [ ] **2bT-11 — Censure** — target an enemy in Black range, use, roll the Black test → Success vs Cognitive → Diminished, damage die −1 step until your next turn — check an actual damage roll steps down. No enemy target / out of Black range → refused, nothing spent. ⚠️ Deliberate drift: the range gate is the CARD's text, newly enforced (the takeover never checked it).
- [ ] **2bT-12 — Decree of Ruin** — use on the same creature twice in a scene → Success = −1 for the SCENE; failure = −1 until your next turn; either way the second use on that creature is refused pre-cost.
- [ ] **2bT-13 — Edict of the Fallen** — succeed, then have the target FAIL an attack test → −2 steps on ATTACK damage only (a non-attack damage roll is untouched); each failed attack test → your allies in White range gain Tier Temp HP automatically (the rider lives in the LEDGER ENTRY now). Failure = −1 all damage, timed.
- [ ] **2bT-14 — Exalt + Sovereign's Favor** — Exalt a willing ally while owning Favor → Ally +1 step until your next turn AND [T][D white] Temp HP (keeps the higher — does not stack). Favor rides the new `die-step` watch kind: it must fire on Exalt and NOT on Investiture of Authority.
- [ ] **2bT-15 — Investiture of Authority** — Exalt an ally, then Investiture the same ally; repeat Investiture → The Exalt entry is REPLACED by the scene entry (not stacked); the second Investiture on that ally is refused pre-cost.
- [ ] **2bT-17 — Sovereignty (capstone)** — use; the ally hits the paired enemy; use again same scene → ±2 for the scene; each detected hit posts the no-reactions card; the second use is refused pre-cost (`sceneOnce`).
- [ ] **2bT-18 — Expose** — a Censured/Decreed creature fails an attack; then any non-attack test → Failed readable attack → +1 Investiture auto, and if the attacked ally is in White range, the Reactive Strike card. Non-attack test → the owner-click "did it fail?" card. Must NOT ride Edict's entries (whenKeys censure,decree). Its rules live on the config events — the talent is Always Active.

---

# BENCH — Death (Morrath, deity)

Run on **Bench — Death** (hostile NPC dummies in Green range to harvest; a warded ally). No
pack rebuild pending; ⚠️ the Remains-race re-test needs the 07-26n engine sync + F5 first.

⚠️ **Staging note (bench run 4):** Reaper's Harvest only harvests **adversary**-typed victims. The
standard `Bench Target — *` fixtures are `character`-typed and are silently skipped — that is the
"a PC drop harvests nothing" branch, not a bug. Import or clone an adversary-typed victim for every
harvest row.

**Bench run 4 (2026-07-26m): 17 Death rows PASSED on the live table and are retired** — **2bW-17
(the premise)**: Death Ward's `thpFormula` edited on the Events tab to a flat `3`, and the very next
lethal-drop rescue rolled `3` and printed "gains 3 Temp HP" · 2bW-1's heal-block re-test (a Mender's
hp-threshold click on a blocked target posted "🩸 … cannot regain HP (Withering Touch)" and HP did
not move) · 2bW-2's ranged half (arm survived, no rider) · 2bW-3 (in-range harvest, plus all three
negatives: out of range, a summon, a `character`-typed victim — and the CASCADE nested kill DOES
harvest via `chain`) · 2bW-4 (BOTH halves — an unset flag gave the scene-start freebie, an explicit
`[]` refused) · 2bW-5 (both pre-cost refusals, the `decaying` icon, and the turn-start tick "takes
12 vital … regains 6 HP") · 2bW-6 (all four, including an ALLY ending its turn inside taking
"🦴 … 6 keen", and the cancel refunding while the Remain stayed) · 2bW-7 (willing → no test, ward
lands) · 2bW-8 (unwilling → "24 vs … SPI 14 — SUCCESS", and the 1-HP lethal-drop rescue that did
NOT harvest) · 2bW-9 (not-at-0 refusal, the full valid raise with its auto-created injury item, and
the sceneOnce refusal with nothing spent) · 2bW-10 / 2bP-11 (no-Remain refusals) · **2bP-10** (cap
named at 2 servants, Remain survived) · 2bW-11 (all three branches) · **2bI-10** (13 spirit to both
enemies within 10 ft, the ally beside the body untouched) · 2bI-11 (re-use refused, PC and summon
drops produced nothing, combat delete cleared the marker) · and **both graph rows** (compiled tree:
Speak with the Fallen hangs off Reaper's Harvest beside Bone Garden; Risen Servant = OR{Bone Garden,
Speak with the Fallen}, takeable from either alone). Evidence per row in the 07-26m delta.

- [ ] **Simultaneous cascade-drop harvests: one victim's DISPATCH is swallowed entirely (NEW, narrowed from the run-4 race — 2026-07-27a)** — the 07-26n **write-queue half is VERIFIED FIXED and retired**: re-run of the exact staging (Necrotic Cascade armed, one adversary trigger drop + two 1-HP adversary victims dropped by the cascade's own "12 spirit to V1, V2" in ONE tick) produced harvest cards reading "(1/2)" then "(2/2)" and a ledger holding TWO entries — the run-4 symptom (two "(1/2)" cards, one entry) is gone, and Chaos's Omen ledger corroborated the queue (a one-roll Cascade Collapse released two bearers with counts "(1/2)"→"(0/2)"). **What remains: of the three drops in the tick, victim V2's harvest never ran AT ALL** — no ✨ Investiture card, no 📋 card, no ledger entry, no eviction; round 1 it got only the `markedBy.harvested` flag, and a cap-isolation control (capFormula document-edited to 5, empty ledger, same staging) reproduced the loss with NO cap pressure and left V2 with no trace whatsoever. Run 4 saw the same arithmetic (3 drops → 2 cards). Suspected family (inference): the `_edhaCascadeBusy` / defeat-watch re-entrancy guard admits only the FIRST simultaneous nested kill — the 2nd+ dispatch is swallowed upstream of the (now-serialised) ledger write. Sequential drops stay correct (run-4 control + this run's trigger→nested sequence).
- [ ] ⚑ **Raise Dead — a raised creature keeps its own Harvested Remain (2026-07-26m — defect or ruling, Ben's call)** — an adversary that had itself been harvested was then raised by spending a DIFFERENT Remain: it came back at 1 HP still wearing the `harvested` marker, with its own entry still on the ledger — a living creature that is also a Remain. The card says nothing either way. Should the raise clear the target's own marker and entry?
- [ ] **2bW-1 — Withering Touch — the two unrun halves** — still open from run 3 and not driven in run 4: **Temp HP still lands** on a blocked target, and the **turn-start expiry** of the No-Healing block. Everything else on this row is retired (see the run-4 block above).

---

# BENCH — Civilization (Kethane, deity)

Run on **Bench — Civilization** (room for Foundations; a Construct summoned). No pack rebuild
pending. Priority: 2bV-16 (drift: manual HP edits no longer prompt).

- [ ] **2bV-16 — Bonds of Community (regression-adjacent)** — an enemy drops to 0 inside your Foundation; a summon drops → The whispered Reaction card (⚠ drift: a MANUAL HP edit to 0 no longer prompts); click grants every standing ally in your Foundations Temp HP = your White mod + advantage on next attack. The summon must NOT prompt.
- [ ] **2bV-10 — Lay Foundation** — use, right-click cancel; use, click in range → Cancel refunds. Valid: the gold 10 ft square; allies beginning their turn inside gain +1 all defenses; past tier the oldest crumbles.
- [ ] **2bV-11 — Bastion** — use with no Foundation; then with one + lay another → None → refused **pre-cost**. Fortified: enemy ENTERING takes the baked [T][D red] impact + Agility vs your Red or Slowed; the Construct inside wears +2; the Foundation laid while Bastion holds comes up fortified; the save card names Bastion (baked label).
- [ ] **2bV-12 — Trade Routes** — use with one Foundation; then link two + teleport → One → refused **pre-cost**. Linked: the ⇄ marks; an ally standing in either teleports to a clicked arrival point (once/turn trusted); every cancel path refunds.
- [ ] **2bV-13 — Siege Form** — use with no Construct / already sieged; then valid + end it → Bad cases refused **pre-cost**. Valid: the baked Siege Form effect toggles ON (Speed 0, deflect 3, Siege Cannon usable); the card's button ends it. ⚑ a Construct summoned BEFORE 07-17 lost the Siege-Cannon gate shim — reforge it once.
- [ ] **2bV-14 — Arsenal** — use with no Construct; then valid; Construct kills a character → None → refused pre-cost; re-arm refused. Armed: the indicator AE (from Arsenal's own Effects tab) rides the Construct; a live→0 kill whispers the 15 ft move + free Strike chase.
- [ ] **2bV-15 — Tempered Edge — CONFIRMED WORKS AS DESIGNED 2026-07-26m, retired-in-place** — measured by NET against a deflect-2 target: Construct Slam base roll **12**, rider card "+14 energy and the hit ignores … deflect (+2 added here pre-pays the −2 …)", damage card "takes **27** damage. Damage Calculation: 29 − 2" — net = base + rider with deflect fully compensated, and the new explanatory clause is on the card. The run-3 "19 − 2" reading was indeed a false positive. Still open on this row: Siege Cannon adds NEITHER; all of Magnum Opus (once/scene pre-cost, +2×[T][D white] HP, +2 defenses, Foundation +1→+2, Colossus splash + Agility-vs-Red-or-Prone).
- [ ] **2bP-8 — Forge Construct — sustain ONE** — with a live Construct, use Forge Construct again → The old one is dismantled and a new one appears — exactly as before.
- [ ] **2bP-9 — ⚠️ Forge Construct — a Construct summoned BEFORE this deploy** — if one is standing from an earlier session, use Forge Construct again → It should still be found and replaced. Older Constructs carry no identity flag, so the engine falls back to matching the summon's name — this row is that fallback.
- [ ] ⚑ **Civ enemy-cost (GO/NO-GO)** — ruler across a fortified Foundation: **×2 for an enemy, ×1
      for an ally**. Console shows the enemy-cost registration; on failure Bastion silently keeps
      the Ben-R3 blind cost (GM compensates) — report which resolver fired so the experiment can be
      kept or deleted.

---

# BENCH — Power (Tyrith, deity)

Run on **Bench — Power** (a Weakened enemy in Black range; a melee-hit victim). No pack
rebuild pending. Priority: 2bH-2 (first `edha-test-fail` payload ever) and
2bH-5 (one talent reacting to another's test); 2bH-6 is the row most likely to
catch a real bug while Power runs half engine-owned (Kneel).

- [ ] **2bH-2 — Absolute Authority ⚠️⚠️** — target a **Weakened** creature, use it, and **FAIL** the Black test → The target becomes **Weakened until the end of ITS next turn**. This is the FIRST time `edha-test-fail` has ever fired a payload in this project — if nothing happens on a failure, the whole fail branch is dead.
- [ ] **2bH-5 — Crown of Thorns ⚠️⚠️** — while Crowned, use **Absolute Authority** (or **Kneel**, or Sovereignty's **Censure** / **Decree of Ruin**) against a creature → The target takes **spirit = your Presence** automatically, on a success **or** a failure, from a SECOND card. This is H8 doing the thing no event system could do — one talent reacting to another talent's test. Check all four sources if you can: Kneel and Censure/Decree are still engine-owned and reach Crown by a different route than Absolute Authority does.
- [ ] **2bH-6 — ⚑ half-migrated Power ⚠️⚠️** — with Crown armed run **Kneel** and confirm the ping; then end the encounter and re-check → Kneel did NOT convert (it needs H13) but must still trigger Crown — its engine code now *announces* the test instead of calling Crown by name. If Kneel stopped pinging Crown, the announcement path is broken. On combat delete, **Crowned clears**.
- [ ] **2bH-1 — Absolute Authority (Power)** — Events tab, then target a creature that is **NOT** compelled/frightened/weakened and use it → ⚑ **THREE** rules listed. The use is refused with "must be compelled / frightened / weakened" and **nothing is spent** — no Investiture, no card, no roll. This is H1's new pre-cost gate.
- [ ] **2bH-3 — Absolute Authority** — same, but **succeed** → A card saying you choose its action on its next turn (GM-run). No status applied on a success.
- [ ] **2bH-4 — Crown of Thorns (Power)** — use it → Your token gains a **Crowned** marker (dark red). The card explains the scene arm and carries a **"Crown ping"** button.
- [ ] **2bH-7 — Crown of Thorns re-use** — use it a second time while already Crowned → Refused with "already active — nothing spent". This is a generic veto now, not a Crown-specific one.
- [ ] **2bH-8 — Crown of Thorns manual ping** — with Crown armed, target a creature and click the card's **"Crown ping"** button → Spirit = Presence applied. This is the surface for a vs-Cognitive test the engine did not resolve; it must still work now that the talent is document-driven.
- [ ] **2bU-7 — Kneel** — use with no target / out of Black range; then in range → Both bad cases refused **pre-cost**. YOU roll Black (⚠ drift); success = Compelled (expires start of your next turn) and the target can only make distance-CLOSING moves (anything else blocked with a warning); you roll attack tests vs Compelled/Frightened/Weakened targets in Black range with advantage (auto).
- [ ] **2bU-8 — Investiture of Command** — use with nothing valid targeted; then 3 allies targeted in Black range → Nothing valid → refused **pre-cost**. Valid: ONE shared [T][D black] roll — each ally gains that Temp HP (keeps-higher, never stacks down) + advantage on its next attack test; you take tier spirit.
- [ ] **2bU-9 — Warlord's Advance — the ranged skip PASSED 2026-07-26m and is retired-in-place** — armed, weapon set to `attack.type: "ranged"`, hit landed → **no rider** (7 damage, weapon only) and the `warlord` arm **survived**; blanking the field (schema re-initialises to "melee") then fired "+4 impact strike" and consumed the arm, with the survivor's Presence-advantage card. The dice/kill/survive halves stay retired from 07-26k. Still open here: the re-use-while-armed pre-cost refusal (not driven for this talent; the same veto passed 3× elsewhere).
- [ ] **2bU-10 — Momentum of Victory** — use, move + free Strike by hand → The card (move 15 ft + melee Strike player-executed; Opportunity trusted); the next weapon hit adds +tier impact and consumes the arm. ⚠ drift: a re-use while armed is now REFUSED pre-cost (the old arm silently re-charged 1 Inv for nothing).
- [ ] **2bU-11 — Warlord's Fury** — arm; drop a hostile NPC below half, then kill it → Re-arm refused. Below-half +1 (once per victim) and the kill +1 more — the whispered tally card each time; your melee hits add min(tally, 2×tier) of the dealt type. PC/ally/summon drops must NOT count.
- [ ] **2bU-12 — Unstoppable Advance** — arm; get Slowed; drag through two enemy squares → Re-use while active refused. Slowed is shrugged off with a card. Each enemy whose space the drag crosses takes its own [T][D red] impact, once per enemy per activation. The arm ends after your next turn (timed sweep).
- [ ] **2bU-13 — Mantle of the Aspirant** — use; try again; ally rolls in range; take a hit → Once per scene (a repeat refuses even after the statuses clear). +2 all defenses as an AE (auto-cleared at combat end); your melee hits +tier spirit; an ALLY in Black range rolls any d20 test at +1 (you excluded; ⚑ dialog-roll rebuilds, the standing injector caveat); taking damage posts the redirect card — budget min(tier, HP lost), click flow unchanged.
- [ ] **2bU-14 — Crown of Thorns (regression)** — crowned, then use converted Kneel vs Cognitive → Crown still pings — Kneel's H1 test announces to the watch exactly as the takeover's hand call did.
- [ ] **2bU-16 — Compelled cleanup (regression)** — let Compelled expire; move the ex-target → Movement is free again — the veto's mark dies with the status; a stale mark without the status never blocks.

---

# BENCH — Knowledge (Gnothis, deity)

Run on **Bench — Knowledge** (an enemy bearer in Green range; an ally attacker). No pack
rebuild pending. Priority: 2bT-3 (counter mode + perCounter chain) and 2bT-5
(armed damage-bonus + placement queue).

- [ ] **2bT-3 — Killing Blow** — use with no bearer; then with a bearer carrying 3 Insight → No bearer → refused pre-cost. With bearer: YOU roll the Red test on the card (⚠️ drift — the takeover used to auto-roll); success = ONE [T][D] roll ×3 vital auto-applied to the bearer + ALL Insight cleared; failure = ×1 + exactly 1 removed. Don't hand-apply the card's own damage.
- [ ] **2bT-5 — Predatory Strike — NARROWED 2026-07-26k (bench run 3, dice re-test)** — the restored dice PASSED: arm = "Primed Strike (next weapon hit)" icon + arm card; the weapon hit added **"+11 vital strike"** ([T][D red] × max(0 Insight, 1)) in the same application ("10 - 0 + 11"), consumed the icon, placed "1 Insight on Bench Target — Floater (now 1)" with the `Insight [1]` effect — and Accumulate's damage→1 Investiture clause fired alongside. Still open: re-use-while-armed pre-cost refusal and the weaponOnly negative (a talent's own damage must NOT trigger it).
- [ ] **2bT-1 — Studied Mark** — use with a creature targeted in Green range → 2 Insight on it (⚑ the stackable status shows count 2 — `system.count` is STILL the bench-verify field) + the whispered snapshot WITHOUT Cognitive defense. No target / self / out of range → refused, **nothing spent**. ⚠️ Cosmetic drift: place and reveal are two cards now.
- [ ] **2bT-2 — Studied Mark (transfer)** — mark creature A, then use on creature B → A drops to 0 Insight and loses the icon; B bears 2.
- [ ] **2bT-4 — The Final Study** — succeed once, then use again same scene → Second use refused pre-cost ("already used this scene"). The success card ends with the free-Strike roster naming allies in Green range (or the no-allies line).
- [ ] **2bT-6 — Hunter's Discipline** — hit your bearer yourself; then kill it → Each own hit +Tier vital. On the kill: whispered transfer card offering floor(count/2) to a creature in Green range (only if ≥1).
- [ ] **2bT-7 — Death Mark** — kill the bearer → Transfer card for the FULL count + the PUBLIC per-ally burst card — each ally's button deals [T][D red] (the OWNER's dice) to that player's targeted enemy. Both 2bT-6 and 2bT-7 fire when both talents are owned (R9 — last click wins).
- [ ] **2bT-8 — Accumulate** — start your turn with the bearer in / out of Green range → In range: +1 Insight (cap 5, then silent). Out of range: nothing. The damage→1 Investiture clause (once/round) is unchanged — it was already data-side.
- [ ] **2bT-9 — Pack Share** — arm, then an ALLY hits the bearer inside YOUR Green range → Arm = `packsight` icon + a PUBLIC bearer snapshot (all three defenses); re-arm refused pre-cost. The ally's hit +Tier vital; the FIRST such hit each round places 1 Insight. Your own hits get nothing from it.
- [ ] **2bT-10 — The Pack** — arm alongside Pack Share, ally hits the bearer → +live-Insight-count vital ON TOP of Pack Share's +Tier (R10 additive); its OWN once-per-round placement (R11). At 0 Insight the Pack line simply doesn't post.
- [ ] **2bU-15 — Predatory Strike (regression)** — Knowledge: armed weapon hit → Still consumes `predprimed`, still adds ×max(Insight,1) vital, still places 1 Insight — the armed damage-bonus widenings (meleeOnly etc.) must not gate rules that don't carry them.

---

# BENCH — Order (Tessavain, deity)

Run on **Bench — Order** (a willing adjacent ally; an Edict-able enemy in Blue range; ideally a
second Order PC for the shared-icon row). No pack rebuild pending. Priority: 2bL-1 /
2bL-2 (the pact forms at all; the unconverted readers still see the ledger — the one
failure that matters) and 2bV-17 (the latent-bug fix's first bench).

- [ ] **2bL-1 — Covenant (Order) ⚠️⚠️** — stand adjacent to a willing ally, target them, use it → The pact forms: ally gains the **Covenant** icon, a card names them, and a **"Break the Covenant"** button appears. If **nothing at all happens**, the use is still being cancelled — stop and tell me.
- [ ] **2bL-2 — ⚠️⚠️ The unconverted readers still see the ledger** — with 1+ Covenant active, use **Concord**, then check **Final Decree**'s card → Concord lists your covenanted allies **by name** and is not refused; Final Decree names them as Witnesses. If either says you have **no Covenants**, the ledger has split in two — stop immediately, this is the one failure that matters.
- [ ] **2bV-17 — Covenant AE sweep (regression — the 2bV latent-bug fix)** — two PCs covenant; walk in/out of White range → The +1 all-defenses AE appears/disappears on BOTH; partner-damages-partner still posts the break-watch card. This never worked after 07-24u (the key-vs-marker reconcile bug) — first bench of the fix.
- [ ] **2bV-18 — The point of the migration** — open any converted Order/Civ talent → Events → The rule(s) are visible and editable — change the cap formula, a note, the court radius; confirm the behaviour/card shows the edit.
- [ ] **2bL-3 — Covenant — the pre-cost refusals** — try it (a) with no target, (b) on an **enemy**, (c) on an ally **2+ squares away**, (d) on someone you **already** have a pact with → All four refused with a warning and **no Investiture spent**. These moved from the old takeover into a pre-use guard, so this row confirms they survived the move.
- [ ] **2bL-4 — Covenant — the +1 defenses AE** — form a pact, then walk the two of you into and out of Attunement Range (White) → Both wear a **Covenant (owner)** effect granting **+1 Physical/Cognitive/Spiritual** while in range; it disappears when out of range and comes back.
- [ ] **2bL-5 — ⚑ Covenant — the AE is now EDITABLE** — open Covenant → **Effects** tab → "Covenant — while in range", change a +1 to **+2**, re-form the pact → The applied effect grants **+2**. This is the migration's whole premise for this pass — the number used to be hard-coded in the engine.
- [ ] **2bL-6 — Covenant — the cap and the fizzle** — with tier N pacts already held, form one more → The **oldest** pact dissolves, its ally **loses the icon**, and the card says so. ⚑ If your cap dropped by 2+ at once, **all** the dropped allies lose their icons — the old code only cleared the last one, so this is a **fix**, not a bug.
- [ ] **2bL-7 — ⚠️ Covenant — the SHARED icon (needs two Order PCs)** — have two Order characters both covenant the **same** ally, then have one of them break/fizzle theirs → The ally **keeps** the Covenant icon, because the other pact is still live. Getting this wrong strips the second player's marker silently — it is why the rule carries `multiOwner`.
- [ ] **2bL-8 — Covenant — the break button** — click **"Break the Covenant"** on the card → The pact ends, the icon clears (unless 2bL-7 applies), and the +1 AE goes. Same for the **"It was deliberate"** button after a partner damages a partner.
- [ ] **2bL-10 — Bear Witness (Order) ⚠️** — with 1+ covenanted ally in White range, run **two or three rounds** of combat → At the **start of every round**, each such ally gains Temp HP = your **White rank**, on one card. Not once per combat — every round.
- [ ] **2bL-11 — ⚑ Bear Witness — Temp HP must KEEP THE HIGHER** — give a covenanted ally more Temp HP from another source, then let a round tick → Their Temp HP does **not go down**. Temp HP never stacks, it keeps the larger — if Bear Witness lowers it, the wrong writer is being used.
- [ ] **2bV-1 — Edict** — use with no target / self / out of Blue range; then a valid enemy → Bad cases refused **pre-cost**. Valid: the prohibition picker (cancel REFUNDS the 1 Inv — ⚠ drift: charge-then-refund replaces never-charged, net identical); the place card shows the prohibition, the tier cap, Sealed Edict's notarize hint + Lawkeeper's reveal line (only if owned), and the ⚖ Violated button. A repeat cast on the SAME target is legal (its own entry); past the cap the OLDEST fades and its icon clears unless another law still binds it.
- [ ] **2bV-2 — Edict watchers** — bind "move"; walk the target; push it with an engine slide → The walk PROMPTS (once/round, card names Edict); the forced slide does NOT. Same shape for Investiture-spend (engine spends count too) and attack-the-chosen-ally.
- [ ] **2bV-3 — ⚖ Violated** — click it → [T][D blue]+Int spirit (Edict's own formula) + Disoriented until the start of your next turn; entry consumed; a second click no-ops with "already gone".
- [ ] **2bV-4 — Sealed Edict** — use with no unsealed Edict; then with one; violate it → None → refused **pre-cost**. Seal card names the newest unsealed Edict. On violation the violator ALSO tests Discipline vs your Blue (engine-rolled) — failure = +[T][D blue] spirit + Weakened until the end of ITS next turn.
- [ ] **2bV-5 — Verdict** — use vs a creature NOT on your ledger; then vs your Edict-bound target → Not yours → refused **pre-cost** (the shared icon is not enough). Valid: YOU roll Blue on the card (⚠ drift — the takeover auto-rolled) vs its Cognitive; success = the Edict resolves (2bV-3's payload incl. any Sealed rider) + each OTHER enemy within 10 ft rolls Discipline vs your Blue — failures share ONE [T][D blue] spirit roll + Disoriented. Failure = cost spent, court denied.
- [ ] **2bV-6 — Concord** — use with zero Covenants; then with two → Zero → refused **pre-cost**. Valid: the `concord` status (re-use refused while it holds), the card names the pact allies + the Aid grant (manual). Each covenanted ally's FIRST damaging hit on an enemy each round gains +your Presence, same type (once/round PER ALLY, tracked separately; your own attacks never).
- [ ] **2bV-7 — Shoulder the Oath** — a covenanted ally in White range loses HP; click; try again same round → Whispered Reaction card: take floor(D/2) (same type, redirect-marked), the ally heals back min(D, floor(D/2)+White), BOTH gain White-rank Temp HP (keeps-higher). Once per round. Damage fully eaten by Temp HP prompts nothing.
- [ ] **2bV-8 — Lawkeeper's Eye** — an ally attacks your Edict-bound target you can see; then through a wall → Advantage auto-injected; the wall (or a hostile attacker) blocks it. The Edict place card carries the GM-reveal line.
- [ ] **2bV-9 — Final Decree** — use twice; use with no enemy in Blue range; then valid + violate → Repeat + empty net refused **pre-cost**. Valid: picker (cancel refunds 3 Inv), every enemy in range decree-bound (`edict` icon, not counted vs the cap), covenanted allies stand Witness. Resolve with the violator targeted: every active Edict fires individually, ONE shared [T][D white] Temp-HP roll + advantage to each Witness, ONE shared [T][D blue]+Int spirit roll to each enemy within 10 ft of the violator (violator INCLUDED); decree spent.
- [ ] **Order quiet cases (like-for-like)** — Covenant crossing scenes keeps the pact (2bL-9); Bear Witness posts NOTHING with no pacts / out-of-range ally / ally at 0 HP (2bL-12) → a "gains 0 Temp HP" card is a bug. Collapsed from 2bL-9/12.

---

# BENCH — Heroic paths

Run on **Bench — Heroic** (it carries exactly the talents these rows name, across all six
paths). No pack rebuild pending. Priority: 2bE-7 (first H1 payload with real
mechanics), 2bE-4 (the combat-timing dispatcher), 2bJ-12 (the on-hit
dispatcher), 2bO-7 (the damage-roll half Pack Hunting always promised),
2bD-3 (the nothing-spent veto), 2bZ-9 (the first authored NATIVE rule).

- [ ] **2bC-1 — High Society Contacts (Agent)** — Events tab, then use it → ⚑ A rule is THERE (was empty): `edha-next-test-mod`, target **self**, Opportunity **true**. Using it banks the credit and the card says so.
- [ ] **2bE-7 — Tactical Ploy (Leader) ⚠️⚠️** — target a creature, use it, roll → On a **success**: target takes **−1d4** on their next test AND **loses a Reaction** on the tracker. On a **failure**: neither. **This is the first talent whose H1 payload is real mechanics rather than card text — if the payload dispatch is broken, this is where it shows.**
- [ ] **2bE-4 — Foresight (Envoy) ⚠️** — start a combat with Foresight owned → +1 Reaction group appears at combat start. **This is the first thing the new `edha-combat-timing` dispatcher has ever run.**
- [ ] **2bE-3 — Through the Fray (Leader) ⚠️** — target an ALLY, use it → The **ally's** tracker gains the Reaction, not yours. `target: target` is the field being proved.
- [ ] **2bE-5 — Sidestep (Hunter)** — start combat in light armour, then again in deflect-2+ armour → Grants the Dodge reaction only in the light case — `whenDeflectBelow: 2`, a silent no-op otherwise.
- [ ] **2bD-3 — the gate ⚠️** — use it with **nothing targeted** → Warned "target the creature first (nothing spent)" and **no focus/Investiture is deducted**. This is the veto replacing the old takeover's nothing-spent guarantee.
- [ ] **2bD-7 — regression: the untouched rows** — **Sharp Eye**, **Tactical Ploy**, **Steadfast Challenge**, **Valiant Intervention** → All four still work exactly as before — they stay on the old `EDHA_HEROIC_DEFTESTS` path this pass. If any broke, the table edit went wrong.
- [ ] **2bJ-12 — Feinting Strike (Warrior) ⚠️⚠️** — make the attack and **hit** → The target loses focus equal to your **Intimidation ranks** and its **Reaction is burned on the CAE tracker** — check the tracker, not just the card. This is the row that proves the on-hit dispatcher now runs any rule, and Warrior has nothing else left on the ratchet. On a **graze**, halve the focus by hand as before.
- [ ] **2bO-1 — ⚠️⚠️ Decisive Command — range is now ENFORCED** — target an ally **more than 20 ft away** and use it (without Authority) → **Refused, with nothing spent** — no focus, no action. Then target one within 20 ft: works normally. ⚠️ This used to work at any distance, so it is a real restriction.
- [ ] **2bO-5 — ⚠️⚠️ Pack Hunting — the quarry gate** — with a quarry marked, use it on an ally, then have that ally roll **against something that is NOT your quarry** → The bonus does **not** apply, and stays banked. Then have them roll **against your quarry**: it applies. ⚠️ It used to apply to the ally's next roll against *anything*.
- [ ] **2bO-7 — ⚠️⚠️ Pack Hunting — the DAMAGE roll** — use it, then have the ally roll **damage** against your quarry → The +Survival is added to the **damage** roll and a card says so. This is the half the card always promised and the engine could never do. Also confirm it works on an **attack** roll (either, whichever comes first — not both).
- [ ] **2bN-2 — ⚠️ Confident / Demonstrative / Shrewd Command — the ENFORCED skill lists** — use each, then roll a **listed** skill and a **non-listed** one → The die applies **only** on the listed skills — Confident: Intimidation/Leadership/Persuasion · Demonstrative: Athletics/Agility/Leadership · Shrewd: Deception/Insight/Leadership. On anything else it does **not** fire and stays banked. **This is the tightening you ruled** ("1 enforce"); the card used to say honour-system. Demonstrative's Athletics/Agility are the ones most likely to feel different.
- [ ] **2bN-3 — ⚠️ Rousing Presence — Determined now expires** — make an ally Determined, then **end the encounter** → The Determined icon **clears itself** when combat ends. This is your "make it end of combat" ruling; nothing cleared it before. Check an ally who **left the scene** mid-fight also gets cleared.
- [ ] **2bB-4 — Flamestance ⚠️ was broken** — enter Flamestance, roll **Intimidation** → **Advantage (2d20kh).** ⚑ This very likely NEVER worked: the retired code set `advantageMode = 1` (the system's enum is the string `"advantage"`) and didn't wrap `configureDialog`, which a dialog roll overwrites. Check it **both** from the sheet and through the roll dialog.
- [ ] **2bC-7 — regression: targeted mods** — **Emotional Overload** (Red, pass A) on a target → Still applies **disadvantage to the TARGET**. `target` defaults to `target`, so every pre-existing next-test-mod rule must be untouched — this is the one that would break if the default flipped.
- [ ] **2bQ-4 — Sharp Eye — the test, then the reveal** — target a creature and use it → You roll **Perception**; the card says SUCCESS or FAIL against their Cognitive defense. **On a success only**, a second whispered card lists *lowest attribute · lowest defense · below half (health/focus/Investiture)*. On a failure you should get **no** reveal card. Same numbers as before this pass.
- [ ] **2bQ-5 — Vital Diagnosis — the snapshot** — target a creature and use it → Two things, as before: the target becomes **Diagnosed**, and a whispered card reports *HP; conditions; defenses — Physical, Cognitive, Spiritual*. Both should still happen.
- [ ] **2bF-13 — Steadfast Challenge (Envoy)** — target + use + roll a success → Target **Disoriented** AND its next test at disadvantage — **with no click**. The old one-button pick card is gone (it only ever had one candidate).
- [ ] **2bF-14 — ⚑ Calm Appeal (Envoy)** — own it, use Steadfast Challenge → The Calm Appeal line appears on a success, with your Discipline rank filled in. Without the talent it must NOT. **Empty Events tab is intended** — same upgrade-talent pattern as 2bF-5.
- [ ] **2bF-15 — Valiant Intervention (Leader)** — target + use + roll a success → Disadvantage on the target's next test, no click.
- [ ] **2bF-16 — ⚑ Resolute Stand (Leader)** — own it, use Valiant Intervention → Its line appears on a success only. Empty Events tab intended.
- [ ] **2bM-2 — Rousing Presence (Envoy) ⚠️** — target an ally, use it → The ally becomes **Determined** and the card names them. If nothing happens the use is being swallowed — tell me.
- [ ] **2bM-6 — ⚑ Rallying Shout — a deliberate change** — own it, use Rousing Presence on an ally **above 0 HP** → The reminder **still prints**. It used to print only at 0 HP, which hid the card's first clause ("revive an Unconscious ally"). Tell me if you preferred the old gate.
- [ ] **2bX-15 — Seek Quarry (heroic pack)** — use with no target; then with one; then mark a second creature → No target: refused PRE-COST. Marked: `quarry` token icon + card (1/1). A second mark: the OLD quarry's icon clears (cap 1, oldest fizzles). Attacks vs the quarry still auto-advantage; Cold Eyes still fires on its defeat and clears the icon.
- [ ] **2bX-16 — Tagging Shot (heroic pack)** — use (arm); ranged weapon hit; separately arm then MELEE hit → Use: `tagged` icon on YOU (expires end of your next turn). Ranged weapon hit: arm consumed, victim gains the `quarry` icon + ledger card. Melee hit: rule stands down, arm SURVIVES. ⚑ a 0-damage graze is owner-judged.
- [ ] **2bX-17 — Quarry stale state (heroic pack)** — an actor with a PRE-deploy `quarryUuid` flag → The old flag is IGNORED (re-mark once with Seek Quarry) — advantage/Cold Eyes read only the new ledger. Not a bug.
- [ ] **2bZ-11 — Cold Eyes** — mark a quarry (Seek Quarry); drop it to 0 with damage → Watch note ("choose a new quarry") + quarry entry AND icon cleared + 1 focus. ⚠ three narrowings vs the old hook (benched): only a live→0 CROSSING fires; a PC-type, summon, or Death-Warded quarry no longer triggers it; the victim needs a token. Flag if any bites at the table.
- [ ] **2bZ-5 — Galvanize** — target an ally; use → The ally's recovery die ROLL POSTS (NEW — it used to be rolled invisibly) + the focus-gain card. ⚑ the recovery-die read path (`system.recovery.die`) is bench-unverified — if the die is wrong/1d8-always, report what the sheet says.
- [ ] **2bZ-6 — Field Medicine** — target the patient; use (your Medicine roll) → vs DC 15 card; SUCCESS → "heals N" card (patient's recovery die + your Medicine ranks — the die posts); FAIL → focus still spent (note on the card). ⚑ same recovery-die flag.
- [ ] **2bZ-7 — Resuscitation upsell** — Field Medicine success WITH Resuscitation owned; then without → With: the ⚕️ revive line prints. Without: silent. ⚑ Resuscitation's own Events tab is EMPTY BY DESIGN (whenOwnsTalent upsell on Field Medicine's rule — declared, not a bug).
- [ ] **2bZ-8 — Wary** — involuntarily drain the owner's focus (Shatter Focus / Feinting Strike); try to apply Surprised while they hold focus → Reduction card (− Discipline ranks) names Wary; the Surprised AE is vetoed with a toast. Edit `reduceFormula` on Wary's Events tab — the reduction must follow the edit.
- [ ] **2bZ-9 — Resilient Hero** — drop to 0 (holds); drop again (goes down); LONG REST; drop again → Holds at Athletics mod once per long rest. ⚑ **2bA-9, the FIRST authored NATIVE rule**: the long rest itself must clear the spend — if the third drop does NOT hold, the native `update-actor` rule was dropped by schema validation; report it (GM fallback: `actor.unsetFlag("edha-content","resilientSpent")`).
- [ ] **2bA-8 — Shattering Blow (Warrior)** — on-hit push → Unchanged — it always carried its own note. Regression check on the default change.
- [ ] **Warrior stances spot (like-for-like)** — enter each stance once: Stonestance +1 deflect (2bB-1) · Vine/Bloodstance numbers (2bB-2) · Iron/Windstance advantage (2bB-5) · the whenSkill gate (2bB-6) · Vigilant riderless (2bB-9) · Flamestance's Events rule renders + is editable (2bB-7) → identical to the pass-B spec. Collapsed from 2bB-1/2/5/6/7/9.
- [ ] **CAE cluster spot (like-for-like)** — Fast Talker tracker grant (2bE-1) · Quick Analysis / Trickster's Hand / Cautious Advance / Backstep counts (2bE-2) · Practiced Kata auto-stance (2bE-6) · stance regression (2bE-10) · High Society Contacts Opportunity (2bC-2) · Underworld / Rumormonger / Well Supplied (2bC-3) → identical to before. Collapsed from 2bE-1/2/6/10 + 2bC-2/3.
- [ ] **Contest-gate spot (like-for-like)** — Set at Odds rule + card + your-roll shape (2bD-1/2) · Grand Deception vs DC 15 (2bD-4) · Synchronized Assault both branches (2bD-5) · Turning Point (2bD-6) → identical to before. Collapsed from 2bD-1/2/4/5/6.
- [ ] **Envoy cluster spot (like-for-like)** — Rousing Presence card label "Determined" (2bM-3) · Lessons in Patience +1 focus (2bM-4) · Instill/Devoted/Stalwart reminder lines (2bM-5) · no stray mark on the ally (2bM-7) · Galvanize unchanged (2bM-11) · Foresight unchanged (2bM-12) → identical to before. Collapsed from 2bM-3/4/5/7/11/12.
- [ ] **Leader command spot (like-for-like)** — Decisive Command die scale d4→d10 (2bN-1) · Relentless March reminder (2bN-4) · Authority 40 ft / two allies (2bN-5, now ENFORCED per 2bO-2/3) · nothing else changed (2bN-6) · Authority doubling (2bO-2) · two allies (2bO-3) · die scale regression (2bO-4) · no-quarry no-spend pair (2bO-6) · Risky Behavior Plot Die (2bC-4) · Overwhelm with Details number (2bC-5) · Probability Net regression (2bC-8) → per their pass specs. Collapsed from 2bN-1/4/5/6 + 2bO-2/3/4/6 + 2bC-4/5/8.
- [ ] **On-hit riders** — Cheap Shot hit → Stunned; Startling Blow hit → Surprised; Shattering
      Blow hit → 5 ft push card; Subtle Takedown / Anatomical Insight / Meteoric Leap hits →
      their GM cue cards.
      Also: **Anatomical Insight**'s Exhausted option appears on the Opportunity menu after an
      unarmed-hit roll with an Opportunity (folded from the retired Opportunity-credit row).
- [ ] **Orphan-token combat guard (07-18i)** — after re-deploying: add a token whose world actor
      you've deleted to a combat → it's SKIPPED with a named toast and combat starts anyway
      (was: Advanced Encounters' initiative getter crashed the whole encounter — the live
      07-18 "combat isn't starting" report).
- [ ] **Four silently-dead prereqs now bite (2026-07-24b)** — **Know Your Moment** (Scholar) lists
      **Mind and Body** as a talent prereq (it was being dropped entirely); **Resolute Stand**
      (Leader) requires **Athletics 1+**; **Shattering Blow** (Warrior) requires **Windstance**
      AND **Perception 2+** (both were dropped); **Animal Bond** (Hunter) spells "companion".
      ⚑ These now ENFORCE where they previously did nothing — if a PC already owns one of these
      talents without the prereq, the sheet may flag it. Expected, not a bug.

---


# 🎮 Player-client window (2026-07-19 — a second client is logged in; run these FIRST)

The wired-GM + LAN-player networking is verified (invite links green; the internet port checked
reachable from outside on 07-19). While the second client is up, burn down the rows that CANNOT
be tested solo — they have sat unbenchable at the bottom of every solo pass. **Deploy first** if
you haven't since the 07-19 pull: Foundry closed → `deploy-to-foundry.bat` → relaunch → one
**⟳ Sync Adversaries from Pack** click (covers the 07-17c / 07-18b / 07-19 batches in one go —
see DEPLOY STATE above).

Recommended order. The two sections directly below were moved up WHOLE (titles and row text
unchanged, so existing dashboard marks survive); the other entries are single rows that stay in
their home sections — each pointer names the section to jump to.

1. **The Illusion belief loop** (just below, under *W23 adversary pipeline*) — the ⚑⚑
   client-veil rows: The Seeming vs the party, the break, PC Phantom Double, late viewer.
   The flagship cannot-test-solo family.

2. **Playtest-2 fixes** (just below) — White Draw Mana's ally-heal permission and Black Draw
   Mana's GM-only sweep, both used AS the player.

3. **Sense-through reveals** — the "needs a SECOND client" row in *Bench-results fixes
   (2026-07-17c)*: a player owning a Void Sense PC sees the Omen-marked token behind a wall.

4. **The wizard as a player** — the "⚑ Player client" row in *Character-creation wizard
   (2026-07-18l)*: run the full walkthrough from the player's own sheet; watch for permission
   errors anywhere.

5. **CAE use-grants as a player** — in *Items-dump tranche (2026-07-18j)*: the tracked
   action-group write relays through the GM.

6. **Players never see the sync button** — the player-side half of *Adversary pack sync
   (2026-07-18b)*'s bulk-button row. Ten-second glance at the Actors sidebar.

7. **GM summon relay** — in *Engine backlog pass (2026-07-04)* → Shared primitives: Phantom
   Barricade / Risen Servant / Forge Construct cast by a player WITHOUT actor-create.

8. **Unnerving Approach push relay** — the ⚑ player-client half of its row in *Black — 07-05
   test-pass fixes*.

9. If time allows: the multi-player visibility rows in *Knowledge (Gnothis)* §5–§6 (Pack
   Share's public reveal + Death Mark's ally-burst clicks from the ally's own client) and the
   *Order (Tessavain)* two-client Covenant rows — heavier setup, save for last.

Bonus while you're in a bestiary combat anyway: the Stillback/Wrongwake **ambush-belief** rows
(both bestiary sections below) have a player-side half — the fooled target's own truth card
should land on the player's screen, not just the GM whisper.

Cross-actor relay watch-items scattered through the tree sections (White Coordination §3, Life
§5, Chaos §3…) need no dedicated tests — they self-verify while running the rows above; note
anything that errors in the row's note box.

---

# W23 adversary pipeline (2026-07-14 — the two Line-Caller flows still unbenched)

07-17 bench already passed Draw Mana on adversaries, token numbering, folders, and the
role-default skill ranks; the Mistheron sheet row passed except Spearing Beak (its 07-17c row).
The two ⚑⚑ Line-Caller flows below are the pipeline's remaining unknowns.

- [ ] ⚑⚑ **Guiding Signal designate flow (14n)** — the Line-Caller uses it (inv 2→1): the card
      lists the **PC tokens** within 15 ft (opposing side); clicking one posts the designation
      note; a RAIDER who **targets that PC** and tests gets "Raise the Stakes" auto-injected and
      the mark clears (one grant). An empty card must SAY WHY (no token on scene / nearest
      candidate + distance) — never a bare "no allies in range".
- [ ] ⚑⚑ **Ordered Advance movement card (14n)** — use it (2 Actions, inv −1; the arm note posts),
      then MOVE the Line-Caller: a card lists the allies within 10 ft of where it stopped with
      each one's half-Speed (Raider 12.5 ft); moving with nobody near posts the "no allies within
      10 ft" accounting line instead. Next round (or combat end) the window is dead — moving
      posts nothing.

## Illusion belief loop (2026-07-14o — the multi-client rows; needs a PLAYER logged in)

- [ ] ⚑⚑ **PC Phantom Double** — a Blue test PC uses it (2A, 2 Inv): the 1-HP copy appears
      ADJACENT to the caster (same art, "(Illusion)"); every GM-side enemy that can see it rolls
      Perception vs the caster's **Cognitive** defense automatically; the GM gets the fooled/saw
      accounting card with a **Re-test new viewers** button; the public card shows counts only;
      NO tokens are hidden in this direction.
- [ ] ⚑ **Ally-targeted double** — target an ally first, then use it: the copy duplicates the
      ALLY and appears beside them.
- [ ] ⚑ **Max 1 / recast** — casting again deletes the old copy (break card posts) before the
      new one appears.
- [ ] ⚑⚑ **The Seeming vs the party — THE CLIENT VEIL** — the Mistheron uses The Seeming
      (1 Action): copy spawns beside the bird on the HOSTILE side wearing the bird's PLAIN token
      name (no "(Illusion)" label); each PC rolls Perception vs Cognitive 14 (engine). Then check
      per machine: a FOOLED player's client renders ONLY the copy (the real bird is gone from
      their canvas); a player who SAW THROUGH renders only the real bird; the GM machine renders
      both. Each player also gets their own whisper.
- [ ] ⚑⚑ **The break** — any hit kills the 1-HP copy (or GM-delete it): every player's client
      drops its veil at once (the real bird re-appears for the fooled), "the illusion breaks"
      posts, belief state dies with the copy. Fade's text now says the bird may raise The Seeming
      again once unseen (no auto-restore).
- [ ] ⚑ **Late viewer** — move a new enemy into sight of a standing copy, click **Re-test new
      viewers** on the GM card: only the newcomer rolls; earlier results stand.

---

# Playtest-2 fixes (2026-07-17 — deployed; the two remaining rows need a PLAYER client logged in)

07-17 bench already passed Decisive Command's d4 and Siege Cannon's to-hit (the Siege-Form gate has
its own 07-17c row). What's left is the pair a solo-GM bench can't see — both are about what a
PLAYER's client does.

- [ ] ⚑ **White Draw Mana heals allies without a permission error** — as a PLAYER (not the GM),
      use White Draw Mana with allies in Attunement Range: they gain [Tier] HP and there is NO
      "lack permission to edit actor" error. Works whether the ally is your own or another player's PC.
- [ ] ⚑ **Black Draw Mana keeps the GM sweep off the player's screen** — as a PLAYER, use Black
      Draw Mana with at least one enemy hidden or behind a wall: the "🕵️ full sweep for the GM" card
      appears ONLY on the GM's screen, and the player's public card still names only visible enemies.
      Then use it as the GM directly — the sweep card still appears for the GM.

---

# Lunavar Fens Bestiary (2026-07-19d — data: pack rebuild + ⟳ Sync; five blocks, ruling 69 + the statblock gate)

Five new adversaries in their own **"Lunavar Fens Bestiary"** Actor folder (Drownlight Colony ·
Reedling · Gone-to-Weir Fen-Heart · Stillback · Wasting-Eater Stillback). Wiring reuses the
proven mistheron patterns (engine-rolled seemings, `edha-damage-rider whenTargetFooled`,
`edha-gm-cue` thresholds) — if a cue misfires here it likely misfires on the Mistheron too;
report once.

- [ ] **Folder + drag** — after rebuild+deploy: the pack shows the Lunavar Fens Bestiary
      folder; all five drag out with portraits (core-icon placeholders), stats, and items.
- [ ] ⚑ **Stillback ambush belief + rider (rewired 07-19n)** — target a PC and use Ambush
      Bite: the engine rolls the PC's Perception vs the Stillback's Cognitive defense ONCE
      (first attack on that target this scene; GM whisper + the player's own truth card),
      and a fooled target then takes the +1d6 on Ambush Bite (the new `edha-ambush-belief`
      ledger — the old wiring read the Mistheron's phantom-copy ledger, which an ambush
      predator never writes, so the rider could never fire).
- [ ] ⚑ **Frayed Seeming advantage (rewired 07-19n)** — the Wasting-Eater Stillback's belief
      test rolls the target's Perception with ADVANTAGE (2d20kh — frayed stillness).
- [ ] **Seize and Roll: no cue by design (07-19n)** — the grab is a to-hit-only attack (no
      damage write → no engine hook, NO NAMEABLE HOOK line in the rider); confirm the roll
      posts the rider text and NO stray cue card appears.
- [ ] ⚑ **Cues fire** — damage the Drownlight Colony (gutter-and-relight cue) and drop the
      Fen-Heart below half (madness-slackens cue) and near 0 (goes-still cue, atFraction
      0.05 — first use of a near-zero threshold; verify it fires before death cleanup).
- [ ] **Fen-Heart token scale** — creatureType "custom", size "large" (schema cap): confirm
      the sheet looks right and set the token 3x3–4x4 on placement (noted in its biography).
- [ ] **Leyline pair on a minion** — the Drownlight Colony carries blue+black (ruling 69
      pair-attunement, per-block override): confirm the build embeds both Attunement Keys +
      Draw Mana without complaint (ruling 49 auto-embed on a two-color minion is new).
- [ ] **Noonwing (added 2026-07-19f, same rebuild; Stoop cue rewired 07-19n)** — drags out
      with its five items; the Stoop's cue fires **when the Stoop deals damage** (event
      `edha-on-hit` — the old "attack-hit" trigger was dispatched by nothing; note: a
      snatch that deals no damage posts no cue, the rider text carries it) and the
      bloodied cue fires; fly 80 shows as its movement (walk-10 note lives in the bio).

---

# Malcurr Lakes Bestiary + the Sevenbrand (2026-07-19 — data: pack rebuild + ⟳ Sync; five blocks, ruling 80 + the statblock gate)

Four beasts in a **"Malcurr Lakes Bestiary"** Actor folder (Wrongwake · Wasting-Eater
Wrongwake · Wake-Eel Shoal · Fellstag) plus the **Sevenbrand Construct-Smith** in
**"Malcurr — the Sevenbrand"**. Wiring reuses the proven Lunavar patterns (engine-rolled
seemings, `edha-damage-rider whenTargetFooled`, `edha-gm-cue`); the smith is the first
adversary embedding **deity-tree** talents (Civilization/Forge Construct + Tempered Edge +
Siege Form, as written).

- [ ] **Folders + drag** — after rebuild+deploy: both folders show; all five drag out with
      placeholder portraits, stats, and items.
- [ ] ⚑ **Wrongwake ambush belief + rider (rewired 07-19n)** — target a PC and use Breach
      Strike: the engine rolls the PC's Perception vs the Wrongwake's Cognitive defense once
      per scene (`edha-ambush-belief` on The Thrown Voice; GM whisper + player truth card);
      a fooled target then takes the +1d6 on Breach Strike. Same family as the rewired
      Stillback — report once if the family misfires. The Wasting-Eater Wrongwake shares
      the wiring (flat roll, no advantage).
- [ ] **Drag Under / Slip the Sound: no cue by design (07-19n)** — the grab is to-hit-only
      and the reaction keys on being MISSED; neither has an engine hook (NO NAMEABLE HOOK
      lines carry the reasons). Confirm the rider/text posts and no stray cue appears.
- [ ] ⚑ **Smith deity-tree embeds** — first deity-tree talents on an adversary: Forge
      Construct / Tempered Edge / Siege Form land as working talents (no prereq gates,
      ruling 40), Draw Mana + both Attunement Keys auto-embed (ruling 49), Investiture 4
      shows, and **Forge Construct actually summons the Combat Construct token** scaled to
      the smith (the talent-summons path on an adversary caster is new).
- [ ] ⚑ **Fellstag green engine (rewired 07-19n — the terrain automation IS expected now)** —
      the ruling-40 adaptations run on the real Green engine via aliases: **Draw Mana**
      click-places a thicket Region within Attunement Range and it carries the **Thorn
      Hedge hazard** (auto keen on enter/turn-start — `edhaOwnsThorn` alias); **Sudden
      Wall** click-places the same (Sudden Growth's `edha-burst` rule, 1 Inv consumed,
      Opportunity trusted); **Herding Antlers** runs Drive the Prey's engine-rolled Green
      vs Survival contest (target + use again → auto-resolve, Slowed on success). Both
      actions spend from the inv pool (4).
- [ ] **Fellstag hand-placed maze thicket** — the enemy-turn-start cue still whispers the
      floor(1d6/2) keen reminder for GM-placed (non-engine) thicket; engine-placed patches
      deal it themselves — confirm no double-damage on an engine patch (the cue note says
      hand-placed only).
- [ ] **Wake-eel drag-under cue (rewired 07-19n)** — Worry the Failing's cue fires **when
      it deals damage** (event `edha-on-hit`; the old "attack-hit" trigger never fired)
      with the full bloodied/drag-under note.
- [ ] **Smith bloodied cue (07-19n: explicit atFraction 0.5)** — Behind the Work whispers
      the yield note when the smith crosses half HP.

---

# Character-creation wizard v2 (2026-07-19p — the 07-19 bench fixes + Ben's three rulings: engine + css + module assets + data/build: `deploy-to-foundry.bat` → relaunch; the culture pick-2 change rides the SAME pack rebuild as the bestiaries)

The 07-19 bench's wizard fail/partials, root-caused and rebuilt (delta 2026-07-19p): duplicate
Key grants killed, z-order guard, Edha PCs folder, enriched previews, actor-bound trees, OUR
pick-2 dialog (the native one offered Rosharan lists), the Thyrcross map picker, deity
browse + faith note, and full attribute/skill assignment pages. Rows Ben passed on 07-19
(sheet bar, start-over, kit backfill, two-wizards, budget gate) are retired — paper trail in
the delta + git.

- [ ] **Sidebar button v2** — ＋ Edha Character files the new actor into an **"Edha PCs"**
      folder (auto-created on first use), opens its sheet, and the wizard opens **ON TOP** of
      the sheet (was: behind it).
- [ ] ⚑ **Wizard stays on top** — while any wizard page is open, document sheets rendering
      (actor sheet re-renders, the leyline path sheet — 07-19's mystery box) never bury the
      wizard; pick DIALOGS still land above it; "Open the tree" / "Browse the tree" /
      content-link clicks are exempt and stay in front of the wizard. ⚑ if a path sheet still
      pops up UNASKED mid-flow, note the exact window title — the opener is still unpinned.
- [ ] ⚑ **Map picker (fixed 07-19q — the svg was sanitizer-stripped)** — take-two's "no map at
      all" was DialogV2's cleanHTML eating the `<svg>` overlay (its tag allowlist has img/div
      but not svg); the deploy itself was verified clean (live hashes = repo). The overlay is
      now built AFTER sanitization and the logic is browser-harness-verified. In Foundry:
      hover a nation = name + region tip; click = selects it (the dropdown below follows and
      stays as the fallback); the culture card updates; all ten nations clickable. If the map
      is STILL absent, the console now says exactly why (asset-fetch / img-load warnings) —
      paste that line.
- [ ] **↺ Change a pick in-wizard (07-19q)** — every "Already chosen" page (country / heroic /
      leyline / deity) carries **↺ Change…**: the confirm names exactly what leaves (the path +
      its Key + that tree's talents; heroic also pulls the kit gear + its 5 silver back;
      culture leaves picked origin expertises behind by design), then the page re-opens for a
      fresh pick. Back from any later page → Change → re-pick → continue, NO restart needed.
- [ ] ⚑ **Weapon slot picker (07-19q)** — after the kit lands (fresh heroic pick OR the 🎒
      backfill), a dialog lists every edha-items weapon of 2 gold or less (price · damage ·
      skill, cheapest first): Take it grants the picked weapon; Choose later grants nothing.
      The Agent finally gets her daggers.
- [ ] **Basic actions auto-grant (07-19q; console errors fixed 07-19r)** — a ＋ Edha Character
      actor (and ANY actor the wizard is opened on) gains the system's basic actions
      (cosmere-rpg.actions pack) it was missing — by name, once; re-opening the wizard
      duplicates nothing. The wizard-start red console errors from Ben's 07-19 paste
      (`connectRelationship … null uuid` + the server `undefined id`) were the copies carrying
      their PACK relationship links — every wizard pack-copy path now strips them
      (`edhaCleanPackCopy`). Confirm a fresh ＋ Edha Character produces a CLEAN console.
      ⚑ actors made BEFORE this fix carry poisoned action copies — expect the same errors if
      you delete/edit those items; recycle the test actor instead (the errors never corrupted
      data — the bad writes were server-rejected).
- [ ] **Attribute blurbs (07-19q)** — each attribute row now explains what it feeds (defenses;
      STR: Health-per-level + carry; SPD: movement; WIL: Focus + Recovery die; AWA: Senses
      Range; AWA/PRE: Investiture) plus its LIVE skill list (leyline colors under their
      attribute). Sanity-read at the table — if a claim contradicts the sheet, quote the line.
- [ ] **Skills grouped like the sheet (07-19q)** — Physical / Cognitive / Spiritual headers;
      the intro no longer claims magic skills unlock later (the five colors are always-rankable
      core skills — Edha registers them so; deity paths add NO skill).
- [ ] **Select text un-clipped (07-19q)** — the wizard dropdowns show their full text inside
      the box (was: pinned to Foundry's 26px form-field height).
- [ ] **Map v3: label-free (07-19s)** — the picker map no longer shows city labels or the
      lettered nation ids (the asset is now a downscale of the raw base painting; the render
      toolchain's label overlay is what carried the letters). Hover tooltips still name each
      nation. The bespoke **Character Creator World Map** piece is filed on the Art tab —
      swapping it in later touches nothing but the image.
- [ ] ⚑ **Malcurr-Stamped Blade OUT of the weapon picker (07-19s — needs the next pack
      rebuild)** — the blade is `plotItem`-flagged (data + build) and the picker skips flagged
      gear; until the rebuild it still lists, so just don't take it. After rebuild: absent from
      the picker, still present in the compendium for the table.
- [ ] **Culture in the ancestry slot (07-19s)** — a PC with a culture and no ancestry shows the
      CULTURE's name in the header line that used to read "Ancestry" (tooltip explains the slot
      stays optional). Dragging Human on shows "Human" again, as before.
- [ ] ⚑ **Derived-stat preview on the attributes page (07-19w)** — a live panel above the
      steppers shows Health · Focus · Investiture* · the three defenses · Move · Recovery die ·
      Senses, recomputed on every +/− click ("push STR = more health and phys def", live).
      Every number mirrors the real derivation (health sums the system's advancement rules with
      STR; movement/recovery use the ceil(attr/2) ladders; *Investiture footnoted as
      attunement-gated). VERIFY against the finished sheet: finish the wizard, compare the
      panel's last numbers to the sheet's actual values — any mismatch is a formula-drift
      report (quote both numbers).
- [ ] ⚑ **Weapon slot v2 (07-19v)** — the picker rows now LOOK pickable (bordered rows, hover
      glow, visible radio, blue selected state); the picked weapon is **kitItem-stamped**, so
      Start over / ↺ Change heroic now remove it with the kit (the second Knife on Test
      Agent-Blue was the un-stamped survivor of a restart — prune that one by hand). And per
      the Agent kit's own note ("two knives from the weapon slot"), an **Agent's pick grants
      ×2 quantity** — one row, quantity 2, not two rows. Other paths grant ×1.
- [ ] **Name field looks fillable (07-19v)** — the purse-and-name page's Name box renders as a
      bordered input, same spec as the dropdowns.
- [ ] **Skill budget wording (07-19v)** — the L1 intro now reads "5 total (4 free + 1 your
      heroic path accounts for — a path-granted rank shows as spent)".
- [ ] ⚑ **Coin row v3 (07-19x — v2's numbers were invisible until clicked)** — v2 injected the
      editors INSIDE the system's currency-list, whose CSS collapses inputs until hover (it's a
      compact header widget) — hence letters-only at rest, numbers-only when clicked, and the
      oversized total box. Now: the equipment tab hides the native widget entirely and renders
      OUR row after it — 🪙 total pill (copper-weighted, tooltip) + three tinted g/s/c pills
      with always-visible numbers. The header strip keeps the compact native chip with the
      corrected total. Verdict on the look still wanted.
- [ ] ⚑ **Finish = long rest + top-up (07-19x, belted 07-19y)** — Finishing the wizard runs a
      silent `longRest`, then re-reads the maxes a beat later and tops up anything that lagged
      (bench: 10/11 — a max-health AE bonus can settle after the rest reads max), Investiture
      included (the system's rest doesn't touch it). Confirm the finished PC reads FULL on all
      three bars with no rest dialog.
- [ ] ⚑ **+1 max health SOLVED-pending-confirm (07-19z)** — a BRAND-NEW ＋ actor showed 10/11
      before any picks, and at that moment only the basic-action copies exist: a shipped
      action carries an auto-applying (transfer) Active Effect touching max health. Action
      copies now land with transfer-AEs STRIPPED (kits own Edha onboarding; use-time AEs
      stay), and opening the wizard on an existing PC strips them from its action items
      (console logs what it removed). Confirm: fresh actor = 10/10 at STR 0, and the repair
      log names the culprit action — paste its name for the delta.
- [ ] ⚑ **Path training rank (07-19z)** — after picking a heroic path, a "path training"
      dialog grants +1 rank in one of the PATH'S skills (list read live from the cosmere
      heroic-paths pack's linkedSkills). The skills page then shows 1 of 5 spent — the
      "+1 from your heroic path" is finally automatic, not honor-system. Start over and
      ↺ Change heroic hand the rank back (no stacking on redo). If the dialog says the list
      isn't readable, say so — the fallback is the old by-hand rank.
- [ ] **Wizard fits the screen (07-19z)** — every wizard window opens fully on-screen; tall
      pages scroll inside the dialog instead of clipping past the bottom.
- [ ] **Expertise rows un-overlapped (07-19z)** — the pick-2 dialog's prose sits beside the
      checkbox, never over it.
- [ ] **Weapon slot v3 — path-curated (07-19y, Ben-approved lists)** — ONE weapon, never ×2
      (the take-five ×2 reading is reverted), and the list is the path's own arms: Agent =
      Knife/Sidesword/Staff · Envoy = Sidesword/Knife/Staff · Hunter = Shortspear/Longspear/Axe
      (its kit already carries Shortbow + Knife) · Leader = Longsword/Longspear/Mace (kit has
      Sidesword) · Scholar = Knife/Mace (kit has Staff) · Warrior = the full ≤2g list. Confirm
      each path's picker shows exactly its list.
- [ ] **Preview panel centered (07-19y)** — the derived-stat box on the attributes page is
      centered ("90% of the way to clean design" — say what the last 10% needs).
- [ ] **Sheet budget bar says 5 skill ranks (07-19y)** — the header's "Skill rnks" chip now
      uses the Edha budget (5 at L1, +2/level) instead of the system table's 4 — a
      correctly-built L1 PC reads 5/5, not -1/4.
- [ ] ⚑ **No expertise stacking on redo (07-19u)** — Start over (or ↺ Change on the country
      page) wipes the origin expertises the picker granted (stamped at pick time; hand-added
      ones survive) — re-picking the same nation then asks for a clean 2. AND the picker now
      counts already-known entries toward the pick: re-adding a culture whose origins you
      somehow still know asks only for the difference (0 needed = no dialog, just a toast).
      Was: linger + forced re-pick = four expertises.
- [ ] ⚑ **ONE Unarmed Strike (07-19t — root-caused off Ben's console paste)** — both copies
      were weapon-type with `src: null` = locally CREATED: the shipped basic actions carry
      their own add-to-actor grant-items events that deliver the unarmed WEAPON, and the batch
      create fired them concurrently — the system's name-dedup raced itself (the duplicate-Key
      race, one layer down). Now: actor-lifecycle events are stripped from the action copies,
      and the weapon is granted deliberately once (matched by `system.id === "unarmed"`, so
      real doubles like the Agent's two Knives are never touched). Re-test: a fresh ＋ Edha
      Character has exactly ONE Unarmed Strike; re-opening the wizard on the OLD actor heals
      its double automatically (toast) and grants one if missing.
- [ ] ⚑ **THE PICK-2 v2 — our dialog now** — after Choose on a country: the pick dialog lists
      that nation's OWN origin entries with their prose (NOT the Rosharan registry list),
      enforces exactly 2, already-known entries show checked+disabled, and a chat card records
      the picks. **Ashkar chains two dialogs** (one other nation's cultural expertise, then one
      road-life entry). Cancelling mid-pick leaves the options readable on the culture card
      (add by hand). The wizard waits for the picks before showing the heroic page.
- [ ] **Keys granted ONCE** — heroic and leyline pages grant path + Key (+ kit on heroic) with
      NO duplicates (07-19 fail: Vigilant Stance ×2 / Red Leyline Attunement ×2 ate the
      budget — the wizard no longer grants Keys at all; the path item's own event does). A PC
      carrying the old duplicates: Start over clears them.
- [ ] **@UUID links render** — the heroic page's description shows real clickable content links
      (was raw `@UUID[Compendium…]` text); clicking one opens that sheet in front and the
      wizard doesn't fight it.
- [ ] **Deity page v2** — 🌿 **Browse the tree** opens the deity's tree read-only (talents tab,
      unbound — no picks possible); ☀ **Note as faith** stamps a flavor-only flag that shows on
      the welcome checklist and the finish card ("faith: X (unattuned)"); Choose still grants
      the path for tables that start attuned; Skip stays default.
- [ ] ⚑ **Attributes page** — six steppers, live "Spent X of 12" counter (L1; max 3 per
      attribute at L1), + disabled at cap/budget, Next writes the values onto the sheet.
      **VETO CHECK (Ben):** 12 points / max 3 / +1 at 3,6,9,12,15,18 come from the legacy
      Character_Building_Rules.md — confirm they're still canon or say the real numbers.
- [ ] ⚑ **Skills page** — core skills grouped by attribute + this PC's unlocked magic skills,
      one shared pool: "Spent X of 5" at L1, max rank 2, writes ranks on Next. Same VETO CHECK
      (5+(L−1)×2 total / max rank INT((L−1)/5)+2). A leveled Start-over PC shows the bigger
      budget and its already-granted ranks as spent.
- [ ] **Budget page trees v2** — "Open the X tree" opens the ACTOR'S tree (path sheet, talents
      tab) with nodes actually selectable (was: the compendium tree, nothing clickable), and
      the wizard stays behind it while you pick.
- [ ] ⚑ **Kit idempotency re-test** — now testable without the duplicate-Key noise:
      `edha.grantStartingKit(actor, "Hunter")` twice — second call info-toasts, grants nothing;
      `{force: true}` re-grants.
- [ ] ⚑ **Player client v2** — a player runs the FULL new walkthrough (map pick, pick-2
      dialogs, attribute/skill writes, faith note) from their own sheet: all writes are
      owner-side — confirm no permission errors.

- [ ] **Map picker shows the redrawn map** — after deploy: the Where-are-you-from step shows
      the new map art (Goldenport wash running the whole west coast is the giveaway) and the
      map is not stretched or letterboxed (the asset aspect changed with the new canvas).
- [ ] **Redrawn polygons hit the right nations** — click near the touchy borders: the
      Goldenport coastal strip (formerly Kettavar/Lunavar), the Vorsk/Lunavar mountain line,
      Malcurr's lake country, the Thalendor/Corvaine river line. Hover names must match the
      wash colors; Sylvaneth island still clickable.

---

# Culture items (2026-07-18k — data + build: `deploy-to-foundry.bat` → relaunch; NO engine change, NO ⟳ Sync — no owned culture copies exist yet)

Country-of-origin culture items (§9j #3): ten native culture-type items + the Human ancestry
fallback in edha-items (Cultures / Ancestry folders). Each auto-grants the nation's cultural
expertise and offers a pick-2 origin list; Ashkar picks a second culture + one road-life entry.

- [ ] **Folders + docs appear** — after rebuild, Edha Items shows a **Cultures** folder with all
      10 nations and an **Ancestry** folder with Human (pack total 113). Spot-open Malcurr: primer
      flavor, Names, You might be, the expertise journal block all render.
- [ ] **Cultural expertise grant** — drag a culture (say Corvaine) onto a test PC: the
      **Corvaine** cultural expertise appears in the sheet's expertise list.
- [ ] ⚑ **Pick-2 on a raw drag (07-19p rewire — needs the same rebuild)** — 07-19 bench
      ANSWERED the old row: the native `pick:true` dialog offers the system's ROSHARAN
      registries and ignores our lists entirely, so the pick events now use our
      `edha-pick-expertises` handler. Dragging a culture straight onto a PC (no wizard) fires
      the same per-nation dialog as the wizard's country page — including Ashkar's chained
      double pick. Report here only if the raw-drag path behaves differently from the wizard
      path (Character-creation v2 section).
- [ ] **Remove behavior (revised 07-19u)** — deleting the culture item RAW from the sheet still
      removes only the cultural expertise (Roshar-mirror). But the WIZARD's Start over and
      ↺ Change now also wipe the origin expertises the picker granted (they're stamped on an
      actor flag at pick time; hand-added expertises always stay) — Ben's 07-19 report: the old
      linger + a forced re-pick stacked to FOUR.
- [ ] ⚑ **Does the sheet demand an ancestry?** — on a culture-only PC, check whether the sheet
      shows a gap/warning where ancestry goes. Either way, drag **Human** on: flavor-only, size
      Medium, no events. This row answers §9j's "is the ancestry slot mandatory" question.
- [ ] **Icons render** — all 10 cultures + Human show their placeholder icons in the compendium
      list (a 404 icon renders INVISIBLE — §10 gotcha; frozen/light/castle/oak/coins/mountain/
      circle/sound/angel/ruins/mystery-man are the expected set).

- [ ] **Lunavar culture item flavor** — after the next rebuild+deploy: the Lunavar culture
      item (compendium copy) opens with the rice-country/Moonmere/grief-night text and the
      five name exemplars.
- [ ] **Malcurr culture item flavor (2026-07-19, Malcurr pass — same rebuild)** — the
      Malcurr culture item opens with the Kenmere/Proving/lamp-country text, the six
      given-name exemplars, and the beached-fisher you-might-be. Flavor-only; existing
      owned copies stay stale snapshots, harmless.
- [ ] **Goldenport + Lunavar carrier-coast flavor (2026-07-19, W26 step 2 / ruling 87 —
      same rebuild)** — Goldenport's culture item ends with the carrier-coast paragraph
      ("…a signature can baptize anything"); Lunavar's ends with the sea-gate line
      ("…the Once-Children price that exchange as carefully as any fast-day").
      Flavor-only; same stale-snapshot caveat.

---

# Items-dump tranche (2026-07-18j — engine + data + build: `deploy-to-foundry.bat` → relaunch; ⟳ Sync not needed for these rows)

The paste paid off: currency rows seeded, the CAE bridge live, 89 shipped items mirrored into
edha-items (re-priced c/s/g; Roshar money loot excluded), and the starting-kit grant flow.

- [ ] **Currency rows render and edit** — on relaunch every character gets Gold/Silver/Copper
      rows seeded (console logs the count); enter amounts, reload, they persist. ⚑ confirm the
      row ORDER reads gold → silver → copper (we control the array order now) and note whether
      the unseeded spheres block still shows a dead row (that's the last spheres question).
- [ ] **The mirror** — Edha Items now holds 102 items in 4 folders; spot-check Sidesword
      (price reads in s/g, damage/traits intact) and one equipment piece. `_meta._review` in
      `data/items.json` lists 13 Roshar-flavored entries (crem, sphere lantern, infused gem…) —
      prune or re-flavor at your leisure; deleting the entry re-prices nothing else.
- [ ] ⚑ **CAE use-grants** — in a combat with the tracker up: use Fast Talker (or Quick
      Analysis/Trickster's Hand/Cautious Advance/Backstep): a named "Edha: <talent>" action
      group appears on your combatant; Through the Fray puts a reaction group on the TARGETED
      ally; as a PLAYER client the write relays through the GM.
- [ ] ⚑ **CAE combat-start grants** — a PC with Foresight gets an extra tracked reaction at
      Begin Combat; Sidestep only when their deflect < 2.
- [ ] ⚑ **CAE burns** — Tactical Ploy success / Feinting Strike hit decrements the target's
      tracked reaction (card says "burned on the tracker"); with no combat running, everything
      falls back to the honor-system chat wording.
- [ ] ⚑ **Starting kit grant** — `edha.grantStartingKit(actor, "Hunter")` (GM console): the
      common base + the Hunter pack + 7 rations land on the actor, the purse shows +5 silver,
      and the card lists anything missing. Try one more path. (07-18l: the as-shipped 07-18j
      version never created the items — a docs-array double-wrap, fixed pre-bench; the grant is
      also once-only now. Covered again by the Character-creation section's walkthrough row.)

- [ ] ⚑ **Kindle** — deal energy damage, wait ~30s reading the card, then Apply: the target token now
      sheds the flame light. In the damage roll breakdown, the Kindle die/mod is labeled "[Kindle]".

---

# Bench 07-18 fixes re-test (2026-07-18g — engine + data + build: `deploy-to-foundry.bat` (now builds the items pack too) → relaunch → **⟳ Sync**; re-drag any heroic talent whose PREREQS you're testing — prereq fields are structural and may not Sync)

The 07-18 bench's 7 fails / 1 partial, root-caused and fixed: the deploy script never built the
items pack; prose prereqs resolved to OTHER trees' same-named copies; Clear Mind (+ unreported
sibling Focused Mind) missing their focus AEs; the speed derivation double-counting every speed
AE; stances having no machinery at all (new engine state machine); PC token defaults (Ben's
freeform note). Passed rows from 07-18f (real costs, tier formula, Sync carry, adversary sync,
dashboard) are retired. The currency-sheet fails (denominations/spheres) are GATED on the items
dump — see the paste row below.

- [ ] **The Edha Items pack has its 13 items** — after this deploy (the bat now runs
      `foundry-build.js items`), "Edha Items" shows 13 items in 3 folders and an item sheet
      opens with its price line. An empty items pack now FAILS deploy step [5 of 5], so if you
      got here, it built.
- [ ] ⚑ **Item price display** — open Bedroll (5 c) and the Malcurr-Stamped Blade (2 g): note
      how the sheet renders the Edha price + denomination — ground truth for the mirror pass
      (§9j #2).
- [ ] **Devastating Blow is takeable with one Combat Training** — re-drag Devastating Blow (or
      test on the tree): its prereq now points at the WARRIOR tree's Combat Training. ⚑ the
      same-named prereq may still LIST twice (tree edge + prose) — both should read satisfied
      together; report if one still shows unmet.
- [ ] **Hardy grants max HP** — now testable (was blocked by the prereq bug): +1 max health per
      level on add, exactly like the benched leyline copies.
- [ ] **Clear Mind / Focused Mind raise max focus** — both now carry the Composed-shape AE:
      max focus +tier on add (current focus tops up on rest — nudge manually, as with Composed).
- [ ] **Surefooted grants exactly +10 speed** — was +20: the derivation double-counted every
      speed AE. Verify +10 on add, base on remove. (Walking Ruin had the same latent double —
      if a Green PC has it, spot-check its number too.)
- [ ] ⚑ **Stances toggle and exclude** — NEW engine machinery (the system ships none): using a
      stance talent enters it (marker effect with the talent's icon appears on sheet/token),
      using another stance swaps to it (toast names what ended), using the active one again
      leaves it. Try Vigilant Stance ↔ Flamestance on the Warrior. *(The stances' mechanical
      riders — Vigilant's cost discount, Flamestance's Intimidation advantage — are NOT yet
      wired; the marker is the state they'll key off, §9j.)*
- [ ] **New PC token defaults** — create a fresh test character: its token name shows on hover
      to everyone, and its vision range matches Senses Range (AWA 0 → 10 ft … 5+ → 30 ft) in
      the cosmere "sense" mode. ⚑ Then run `edha.fixPcTokens()` in the console (GM) once — it
      retrofits Test / Test Warrior and their placed tokens the same way.
- [ ] **Raising AWA extends sight** — bump a test PC's AWA: prototype AND placed tokens' vision
      range follows (GM client applies it).
- [ ] ⚑ **THE PASTE (gates the currency-sheet fixes + §9j #2/#3)** — run
      `scripts/items-dump-console.js` in the GM console and commit the download as
      `source-materials/edha-items-dump.json`. It now also captures the character-actor
      currency DataModel — the missing shape behind "one uneditable field / no denominations /
      spheres still shows" (bench 9–11). Those three get wired next session from the dump;
      nothing to re-test on them until then.

---

# Currency wiring (2026-07-18e — benched 07-18; the SHEET half SHIPPED 2026-07-19s: engine-only, F5)

The long-gated half is wired (Ben re-flagged it at the 07-19 bench: "spheres and edha coin but
no g/s/c delineation"). Root: the system's currency-list component renders ONE read-only total
per currency (currency-list.hbs) — per-denomination editing doesn't exist in the system at all.
The engine now hides the Roshar spheres chip on every character currency list and injects a
gold/silver/copper editor on the equipment tab, writing the seeded
`system.currency.edha.denominations` array (shape confirmed by the items dump).

- [ ] **Spheres row hidden** — no spheres chip anywhere on a PC sheet (header strip or
      equipment tab); adversaries untouched.
- [ ] ⚑ **g/s/c editor** — the equipment tab's currency area shows three editable g/s/c
      inputs; typed amounts persist across F5/relaunch; the read-only "edha coin" total keeps
      showing the system's derived roll-up beside them.
- [ ] ⚑ **Purse flows move the silver box** — kit grant (+5 s), Start over (−5 s), and the new
      ↺ Change on heroic (−5 s) all visibly move the SILVER input.

---

# Adversary pack sync (2026-07-18b — engine + CSS only: `deploy-to-foundry.bat` (or module-src sync) + relaunch, NO pack rebuild. From this deploy on, "re-drag every adversary" = one button)

World adversaries now sync from the compendium like PCs do — better, actually: the sync keeps the
world actor's id, so placed tokens stay attached with their position/HP, and it pushes the
prototype's token fields (vision/disposition/bars/art) onto tokens already on scenes, which a
re-drag never fixed. Matching is by drag-stamp (`_stats.compendiumSource`) or exact name — both
stable because the build's pack ids are deterministic. Renamed world copies are treated as
customized variants: the bulk pass skips them; their own sheet button syncs them explicitly.

- [ ] ⚑ **Bulk button renders** — as GM, the Actors sidebar footer shows **"⟳ Sync Adversaries
      from Pack"**; players never see it.
- [ ] ⚑ **Bulk sync replaces the 07-17c re-drag** — after deploying 07-17c + this together, do
      NOT re-drag; click the button once. Then confirm a Mistheron placed BEFORE the deploy rolls
      Spearing Beak's +1d6 only vs fooled targets (the 07-17c `whenTargetFooled` fix) — proof the
      new item rules landed on an existing token.
- [ ] ⚑ **Sheet button** — open a world adversary's sheet: a "⟳ Sync from Pack" bar sits under
      the header; clicking it toasts the item/token counts and the sheet re-renders current.
- [ ] ⚑ **Placed-token push** — a token placed BEFORE the deploy shows the 07-17c vision model
      (visionMode "sense", attenuation 0.1) after sync, without being re-placed.
- [ ] ⚑ **State preserved** — damage a placed adversary token, sync: it keeps its HP and position;
      the WORLD actor (sidebar copy) resets to full like a fresh drag.
- [ ] ⚑ **Renamed copies skipped** — rename a world copy (e.g. "Roek Alpha") → bulk sync skips it
      and the console lists it under `skipped`; its own sheet button still syncs it.
- [ ] ⚑ **Hand-added items survive** — add an item by hand to a world adversary, sync: the item
      is still there (pack-built items were replaced around it).
- [ ] ⚑ **Stale duplicates healed** — the old duplicate Corvaine Raider actors in the sidebar
      (the 07-17c gotcha) ALL show the weapon-type Shortsword after one bulk sync.

---

# The all-in-one dashboard (2026-07-18 — repo-side only: `git pull`, then open `EDHA_DASHBOARD.html` in any browser; nothing to deploy in Foundry)

Replaces `EDHA_FOUNDRY_TEST_SHEET.html`. The Bench tab is the old sheet unchanged; marks carry over.

- [ ] ⚑ **Old bench marks survived** — open the dashboard: previously-marked bench rows still show
      their Pass/Fail/note state (same browser that held the old sheet's marks).
- [ ] ⚑ **Tabs populate** — Art shows the 4 batch-1 briefs + 6 unpainted map sites; Worldbuilding
      shows W-items with update logs collapsed, canon §8/§10, threads/clocks; Engine shows §9 +
      triage + pilot; Repo shows the hygiene items; ⚑ For Ben lists the open flagged items.
- [ ] ⚑ **Session-hide works** — "hide" on a section header hides it for the browser session;
      the header bar lists hidden sections with ✕ show / show all; closing the window resets.
- [ ] ⚑ **For-Ben jump links** — "go →" on a ⚑ For Ben row switches tab, scrolls to, and flashes
      the source row.
- [ ] ⚑ **Copy for Claude** — mark a bench row + a non-bench row, copy, confirm both appear
      grouped by tab/section in the pasted text.

---

# Bench-results fixes (2026-07-17c — all 9 fail/partial rows from the 07-17 results block; **`deploy-to-foundry.bat`** (engine + adversaries + deity rebuild) → relaunch → **"⟳ Sync Adversaries from Pack"**; PC ⟳ Sync optional — only Forge Construct's owned card TEXT lags without it)

All ⚑ (none self-verifiable without a live table). Root causes in the 07-17c handoff delta — the
short version: a removed v13 core API, a system-2.1.0 graze-clone crash that killed every
damage-rider, a schema field the DataModel was stripping, orphaned illusion tokens, a missing
displayName, a missing mode gate, the PC visionMode, and one stale world actor.

- [ ] ⚑ **Single-target picker resolves** — target 2+ tokens, use Withering Ray: the picker card
      appears, nothing is spent; click a name → that token becomes your ONLY target, the card
      marks ✓, and the talent rolls once against it. (Verdant Mend same.)
- [ ] ⚑ **Spearing Beak rolls from the icon** — on a SYNCED (or re-dragged) Mistheron, click the Beak's icon:
      one card with the d20 Heavy Weaponry test (+5) AND the 1d8+2 keen damage + graze line.
      Against a believer in its seeming the damage shows `+1d6[Spearing Beak]`; against anyone
      else (or with no seeming up) there is NO +1d6.
- [ ] ⚑ **Damage-rider family regression** — roll ONE other rider talent (Prognosis heal vs a
      conditioned target, or a Momentum's Edge charge attack): it rolls with its labeled bonus and
      no dead click — the graze-clone guard covers every `edha-damage-rider`, not just the Beak.
- [ ] ⚑ **AoE burst auto-target** — place any burst (e.g. Flame Surge): the caught tokens end up
      actually TARGETED (this retarget had been silently no-opping on v13).
- [ ] ⚑ **Seeming recast replaces the token** — cast The Seeming, then recast while the copy still
      stands: the OLD copy token disappears, exactly ONE new copy token appears (they used to
      stack invisibly on the same square), and the believer sweep re-runs.
- [ ] ⚑ **Seeming copy hover-name** — hover the copy token as GM: the name shows (owner-hover,
      the same behavior as every built adversary token).
- [ ] ⚑ **Siege Cannon gated on Siege Form** — re-summon the Construct; with Siege Form OFF,
      using Siege Cannon warns "needs Siege Form active" and spends NOTHING; toggle Siege Form
      ON → it rolls as before.
- [ ] ⚑ **Adversary tokens see like PCs** — select a synced (or re-dragged) adversary token: its vision uses
      the cosmere "sense" mode (the map reads out to its Senses Range in darkness, lit areas
      beyond — the same feel as a PC token; adversary AWA 0 → 10 ft is intended, a block's
      bespoke `senses` value still wins). If 10 ft still FEELS wrong at the table, that's now a
      design dial, not a bug — say a number.
- [ ] ⚑ **Shortsword on the CURRENT Raider** — your world sidebar holds FIVE "Corvaine Raider"
      actors (every compendium drag makes a new one; the 07-17 report was read off a stale copy).
      After the bulk sync ALL of them are current: any Raider's Shortsword sits in the WEAPONS
      section (heavy weapon, melee) and rolls from its icon. GM-lore visibility is ANSWERED: with ownership "None"
      players can't open the sheet at all — the biography stays GM-only unless you ever grant
      Limited (which shows exactly the biography).
- [ ] ⚑ **Sense-through reveals — needs a SECOND client** — the reveal only acts on PLAYER
      clients (your GM client always renders everything), so it cannot be observed solo: log a
      player owning a Void Sense PC, Omen-mark an enemy behind a wall/in fog → that player's
      canvas renders the marked token. If your 07-17 ✗ came from something else you saw, note
      what it was — that row couldn't fail solo by design.

---

# Map paint workflow + canon codex (2026-07-15d — repo-side only: `git pull`; nothing to deploy in Foundry)

The codex itself is proven in real use (07-17 bench passed "opens & reads"; the edit → ⬆ commit
loop shipped a real canon PR, #92). What's left: the lookup UX, the direct file-save path, and
the Procreate paint loop.

- [ ] ⚑ **The capital lookup works** — type "capital" in the search box: hits cycle with Enter;
      click Heartholt on the map: the info card says Thalendor's capital, "→ canon section" jumps
      to §5a. Same for Aldercourt/Corvaine.
- [ ] ⚑ **Place-links fly the map** — click a dotted place-name (e.g. Withervale) anywhere in
      the canon text: the map pane flies there and shows the info card.
- [ ] ⚑ **Paint overlay imports aligned** — send `source-materials/maps/paint-overlay.png` to
      the iPad, import into `Thycross.procreate` as a top layer (Insert a file — it is exactly
      canvas-sized, 2865×3399): the 6 crosshairs sit where the labeled map says those places
      are (Elmsworth/Heartholt/Ford/Withervale on or by the Palewater, Aldercourt on the drawn
      east-coast city dot). Paint at leisure; report back so the `painted` flags flip. If a
      placement doesn't work on the canvas, paint it where it SHOULD be, click that spot in
      `viewer.html`, and include the "(x, y)" in the report — your brush overrules the
      gazetteer, and the session re-measures whatever routes the move changes.
- [ ] ⚑ **💾 writes the real file** — with an edit pending, 💾 save file → pick
      `EDHA_CAMPAIGN_CANON.md` (repo root; Chrome/Edge only — the button stays dead in
      Firefox): your change is in the MD (`git diff` shows it). Second save shouldn't re-ask
      for the file.
- [ ] ⚑ **Ergonomics verdict** — both tools freeform: pane split, label sizes, search feel,
      editing feel, anything that makes lookup slower than grepping the MD is a bug here.

---

# Adversary ability wiring (2026-07-16 + 16b — session-1 actors and the playtest 9; not yet benched)

07-17 bench already passed The Seeming's core loop, Break cues, and the Fade damage-cue; the
hover-name / recast / Spearing Beak fails have their 07-17c re-test rows. What's left: the
session-1 cues nobody triggered, the per-bird fix, and the whole playtest-9 wiring. Every
hand-run ability carries a written no-hook rationale (Combat Training, Pack Tactics, Veil,
Mutation Upgrade); superseded hand-toggle AEs were removed — the engine does those now.

- [ ] ⚑ **Cover Their Retreat** — drop a Raider within 20 ft of Roek: his card offers the
      shove-behind-cover roll-back. Drop one beyond 20 ft: no card.
- [ ] ⚑ **Press the Line rider** — on a HIT: the allied-Raider-reaction-shot card; on a miss or
      graze-to-zero: nothing.
- [ ] ⚑ **Morale cues** — Roek crossing 1/3 HP (Not a Bandit), the Line-Caller dropping (The
      Line Falls Apart), a Mistheron bloodied (Starving, Not Fanatic): one whispered card each,
      at the crossing only (no re-fire while it stays below).
- [ ] ⚑ **Per-bird seemings (fixed 07-16b)** — TWO Mistherons on scene (copy-paste the token so
      they share a world actor — the worst case): each bird raises its OWN seeming; the second
      cast must NOT clear the first bird's copy; each bird re-casting replaces only its own;
      Spearing Beak's +1d6 keys to the attacking bird's copy, not its partner's.
- [ ] ⚑⚑ **Braced status** — use a Trooper's (or the Captain's) **Brace**: the shield icon lands
      on ITS token and auto-expires after its next turn. The Frostbinder's token wears the icon
      PERMANENTLY (Predictive Ward) and it must NOT expire with combat turns.
- [ ] ⚑ **Probability Net** — target a PC, use it: that PC's next test shows `-1d6[Probability
      Net]` in the roll breakdown and the mod is consumed (their following test is clean).
- [ ] ⚑ **Cinder Coat splash-back** — melee-hit a Cinderhound: the attacker automatically takes
      1d4 Energy (card names the hound). A ranged hit from across the room must NOT splash.
- [ ] ⚑ **Bite sheds light** — a bitten creature's token starts glowing (the Kindle light rider).
- [ ] ⚑ **Frost Lance Slowed** — on a hit the victim gains Slowed automatically, expiring at the
      end of the VICTIM's next turn.
- [ ] ⚑ **Vital Diagram → Scalpel-Strike** — target a PC, use Vital Diagram: the red mark icon
      lands. Scalpel-Strike vs the marked PC shows `+4[Scalpel-Strike]` in the damage; vs an
      unmarked PC it doesn't.
- [ ] ⚑ **Suture Cradle** — TARGET a creature, use the cradle (heal rolls); every time that
      creature is then hit, the Stitchmother's Discipline auto-rolls vs DC 10+damage with a
      keep/ends card. Cradle another creature: the flag moves.
- [ ] ⚑ **Phase 2 cue** — drop the Stitchmother below 70: ONE whispered ⏰ card with the full
      transformation checklist, once.
- [ ] ⚑ **Turn cues** — Glyph Pulse: end of the Living Lock's turn on round 2/4/…: the adjacency
      card; odd rounds quiet. Reactive Strike: an enemy starting its turn within reach of the
      Captain: one whispered card (not one per action).
- [ ] ⚑ **Stalker Fade cue** — damage a Stalker: the graze-or-miss reminder card (once/round).
- [ ] ⚑ **Devastating Blow cue** — on ITS hit: the margin-Prone reminder; on other attacks: none.
- [ ] ⚑ **edha-gm-cue registration held** — console shows no DataModelValidationError for any
      adversary item on world load (the 07-16 morning build shipped cue rules with the handler
      type unregistered — this deploy carries the registration; if cues are silent, THIS is the
      first thing to check).
- [ ] ⚑ **Ruling wanted: Combat Training's garbled source** — the cheatsheet sentence reads
      "turn one of its own grazes into a graze"; rule whether that means miss→graze or
      graze→hit and the text gets fixed to match.

## The 2bAB pre-deploy audit rewires (2026-07-26 — 15 dead adversary copies of tree talents, wired)

The pre-deploy audit found 15 bespoke adversary abilities sharing a tree talent's name that had
been riding the deleted engine name-keys — dead, their texts still claiming engine wiring. Each
now carries its tree twin's rule on its own item; nothing below has ever run in Foundry.
**Re-drag each adversary from the pack first** (placed copies are frozen snapshots).

- [ ] **2bAB-1 — Flame Surge — Cragdrake Alpha AND Hazewyrm Elder — FIXED 07-26n, BLOCKED-ON-DEPLOY (pack rebuild: `foundry-build adversaries` + ⟳ Sync Adversaries + re-import BOTH bosses)** — the run-4 FAIL ("💥 Flame Surge hit: **= 0 (0)** + 3 (red) → 3 energy" on both fresh imports) was DATA: the `edha-burst` resolver reads `item.system.damage.formula` and both abilities had an `events` block but no `damage` block. Both now author **2d8 energy** (the ruling-122 baked dice; scratch pack build verified the compiled items read `dmg=2d8 energy` with the breath text intact). **Re-test AFTER the rebuild + fresh re-imports** (placed copies stay frozen at 0): the burst places, the save rolls, and the card reads a real 2d8 total + 3 (red), halved on a successful save.
*(2bAB-2 and 2bAB-3 — Crownox Ring Shield Wall + Retributive Guard — PASSED in bench run 3
(2026-07-26k) on a FRESH pack import, three unlinked ring tokens: the half-1d6 pre-reduction
applied by itself and was named in chat ("reduced by 1 — Shield Wall", calc "5 - 1"), and the
retaliate PROMPT posted by itself from the damage — one per adjacent ring-mate — with the click
running White vs Spiritual through the contest core and dealing "3 spirit" on the success.
Retired; evidence in the 07-26k delta.)*
- [ ] **2bAB-4 — Guiding Signal — The Reckoning, Bellwether AND Callthief** — use it on each → ⚑ The designate marker lands (White Attunement Range at role rank) and the raise-the-stakes note posts — the use used to resolve nothing.
- [ ] **2bAB-5 — Whispered Doubt — Tollbird Flock** — an enemy of the flock spends focus within its Black range → ⚑ It loses 1 MORE focus, announced, once per round per enemy — the watch is on the item now.
- [ ] **2bAB-6 — Rootling Swarm — Grasping Vines + Territorial Instinct** — use each on a targeted character → ⚑ Vines: Green vs Physical auto-resolves → Restrained on a success. Instinct: Green vs Survival through the contest core → Immobilized; the turn-start cue still posts as the floor.
- [ ] **2bAB-7 — Tussock-Sow — Drive the Prey** — use it on a targeted character → ⚑ Green vs Survival through the contest core; Slowed on a success; the move-away stays GM-narrated per the card note.
- [ ] **2bAB-8 — Stitchmother — Adaptive Mutation + Reknit Form** — target a thrall, use Mutation; then use Reknit Form → ⚑ Mutation posts the two-graft chooser (+2 keen / 2-vital venom, no third option) and the bonuses ride the thrall's Slam. Reknit posts the injury picker; the buttons charge NOTHING extra (her card's flat 1 Inv + 1 Focus already paid).
- [ ] **2bAB-9 — Reeve-Owl — Sovereign of Solitude** — target the moving Weakened creature, use it → ⚑ Immobilized lands, Black vs Spiritual auto-resolves, and a success rolls 1d6 vital — the cue's "use the item to auto-resolve" promise is true for the first time.
- [ ] **2bAB-10 — Surecat — Intercept** — use it with the Forewarned creature targeted → ⚑ The confirm card posts; confirming puts disadvantage on that creature's next test. The turn-end cue still posts.

## Still unbenched from the manual re-litigation (2026-07-16c)

- [ ] ⚑ **Senses field on the sheet** — an adversary block with an explicit `senses` value shows
      that range on the SHEET (the `system.senses` DataModel shape is unverified from the repo —
      a dropped field silently falls back to the AWA default, which token vision masks).
- [ ] ⚑ **Veil auto-toggle (Stalker)** — Stalker standing in darkness: the Veil marker enables
      itself + a GM whisper; walk it into light: the marker releases. Toggle it ON manually in
      light (cover): the engine leaves it alone.

---

# Goldenport Coast Bestiary (W27, rulings 97–98 — statted 2026-07-20)

**Deploy needed first:** ONE `deploy-to-foundry.bat` (engine F5 carries `edha-regen` + the Pyre
spread alias) **+ pack rebuild (`foundry-build adversaries`) + relaunch + "⟳ Sync Adversaries
from Pack"**. Folder: *Goldenport Coast Bestiary* (4 blocks).

## 1. The Garden Sow (boss — Nexus-Fed is the edha-regen handler's FIRST consumer) ⚑
- [ ] **Nexus-Fed (engine-applied regen)** ⚑ — in combat, end the Sow's turn below max HP: she
      regains 5 HP automatically AND the GM gets a whispered card saying so. At full HP: no write,
      no card. At 0 HP: no regen (she stays down — the clamp is pinned in tests, verify at the
      table once).
- [ ] **Rooted Fury cue** ⚑ — first drop below 31 HP (half of 62): whispered GM card "Trampling
      Charge now costs 1 Action". No re-fire on later hits while below.
- [ ] **Trampling Charge on-hit cue** ⚑ — when its damage lands, GM card "target is knocked
      Prone" (edha-on-hit; no card on a miss).
- [ ] **The Old Agreement** — text-only (NO NAMEABLE HOOK): confirm the card reads clean on the
      sheet, nothing tries to automate it.

## 2. Keelshadow (rival — ambush-belief + fooled rider) ⚑
- [ ] **Hull-Shadow belief test** ⚑ — its FIRST attack against each target: engine rolls the
      target's Perception (with advantage) vs its Cognitive defense (12); a failure marks them
      fooled. Second attack vs the same target: no new roll.
- [ ] **Breach and Drag rider** ⚑ — vs a fooled target the keen damage gets +1d6
      (flavor-labeled on the roll); vs an unfooled target it doesn't.
- [ ] **Sounding Dive cue** ⚑ — any damage to it → whispered GM card (dive/untargetable note);
      once per round.
- [ ] **Drag cue** ⚑ — on a Breach and Drag hit, GM card with the DC 13 Athletics catch-hold
      note.

## 3. Cinderbrock (rival — Fire the Wrack IS Pyre by alias) ⚑
- [ ] **Fire the Wrack places the region** ⚑ — using the action click-places a 10-ft RED burning
      Region; entering it / starting a turn in it auto-deals 1d6 energy (system damage card, no
      GM math).
- [ ] **Pyre spread card BY ALIAS** ⚑ — at the end of the CINDERBROCK's turn with a patch on the
      scene: the whispered spread card fires, labeled **Fire the Wrack** (not "Pyre"), with
      working Spread + Extinguish buttons. A PC Destruction player's own Pyre zones must still
      spread separately (alias must not cross owners — sourceOwnerUuid check).
- [ ] **Furnace Heart cue** ⚑ — a hostile starting its turn within 5 ft → whispered 1-energy
      card (rangeFt slack ~half a square).
- [ ] **Den Fury cue** ⚑ — first drop below 10 HP: whispered +1d4 card, no re-fire.

## 4. Cold-Fire Cinderbrock (the wasting variant) ⚑
- [ ] **Loadout sanity** ⚑ — it has ONLY Ember Bite (atk +4, 1d6+1) + Furnace Heart (cue fires
      as above); no Fire the Wrack, no Den Fury; hp 14. Reads sad, not undying (ruling 34).

# Canticle Plains Bestiary (W28, rulings 106–107 — statted 2026-07-20)

**Deploy needed first:** pack rebuild (`foundry-build adversaries`) + relaunch + **"⟳ Sync
Adversaries from Pack"** — NO engine change, no deploy bat. Folder: *Canticle Plains
Bestiary* (3 blocks). These are the first blocks carrying PC talents by VERBATIM NAME on an
adversary at scale (Stitchmother precedent) — the ⚑ rows below double as the proof that the
name-keyed engine paths reach adversary-owned items.

## 1. Callthief (rival ×2 — the influence-duel kit) ⚑
- [ ] **Overwhelming Authority (name-keyed)** ⚑ — after the callthief succeeds on an
      influence test: the target can be marked Disoriented per the engine path (whatever
      the PC talent automates must fire identically here; if nothing fires, the name-keyed
      path does not reach adversaries — report it).
- [ ] **Counterpoint (name-keyed)** ⚑ — a PC sings the true line (influence on a held
      beast): the callthief's Reaction contests it through the engine's White test path.
- [ ] **Guiding Signal (name-keyed)** ⚑ — singer marks a target; partner's next test
      against it raises the stakes.
- [ ] **Take the Answerer on-hit cue** ⚑ — damage lands → whispered GM card with the
      "+1d4 if Disoriented" note (no card on a miss).
- [ ] **Loadout sanity** ⚑ — count 2 on the sheet; atk +6 1d8+2 keen; Deception 4 visible
      for the influence rolls.

## 2. The False Spring (boss — Held Oasis ambush-belief + fooled rider) ⚑
- [ ] **Held Oasis belief test** ⚑ — its FIRST attack against each target: engine rolls
      Perception vs Cognitive 12 (NO advantage — its mirage is good, unlike Hull-Shadow's);
      failure marks them fooled; no re-roll on the second attack.
- [ ] **Glare-Strike fooled rider** ⚑ — vs a fooled target the energy damage gets +1d6
      (flavor-labeled); unfooled, it doesn't.
- [ ] **Kindle (+3 energy rider, ruling 122 re-dice)** ⚑ — every energy hit adds +3 (boss role rank as Red
      modifier) via the damage-rider rule; the shed-light/lose-concealment half is the
      name-keyed engine path — verify both fire on one hit.
- [ ] **Afterburn opportunity prompt** ⚑ — after an energy hit, targeting the creature and
      accepting the prompt applies Afflicted [half 1d8 energy — ruling 122 re-dice]; Opportunity is TRUSTED (no
      auto-deduct anywhere).
- [ ] **Heat of the Flats cue** ⚑ — hostile starts its turn within 10 ft → whispered
      1-focus card (shade negates is a table read).
- [ ] **Gone Into the Shimmer cue** ⚑ — first drop below 24 HP (half of 48): whispered
      withdrawal card, no re-fire.

## 3. Dirgehound Pack (rival ×3 — the Dread Presence veto's first bestiary reuse) ⚑
- [ ] **Dread Presence VETO on an adversary owner** ⚑ — THE headline test: a Weakened
      character within 30 ft of a dirgehound tries to move closer to an ally → the
      preUpdateToken veto blocks the move with the engine's message. First time this runs
      from an adversary-owned item.
- [ ] **Unnerving Approach (name-keyed)** ⚑ — on moving adjacent, the push→Isolated path
      fires as it does for a PC.
- [ ] **Predatory Patience test rider** ⚑ — attack vs a Weakened target (target first):
      +1d6 injected on the d20 test (ruling 122 re-dice); no rider vs un-Weakened.
- [ ] **Predator's Due on-defeat** ⚑ — a dirgehound kill: +1d6 health engine-applied to it (ruling 122 re-dice)
      + whispered card for the 1 Focus (GM adds — adversary focus has no auto-write).
- [ ] **Worry the Straggler on-hit cue** ⚑ — damage lands → whispered "+1d4 if Isolated/
      Weakened" card.
- [ ] **Loadout sanity** ⚑ — count 3, hp 14 each; reads as a pack that cuts one out, not a
      swarm.

---

# W29 Balance-Pass Bestiary (rulings 108–113 — statted 2026-07-20)

**Deploy needed first:** engine F5/relaunch (the ruling-113 owner-scan widening lives in
`register-skills.js`) **AND** pack rebuild (`foundry-build adversaries`) + relaunch + **"⟳ Sync
Adversaries from Pack"**. Folders: *Thalendor Heartwood Bestiary* (4 blocks), *Riverlands
Bestiary* (+1), *Corvaine River-Plains Bestiary* (1), *Malcurr Lakes Bestiary* (+2).

## 0. Engine — the owner-scan widening (ruling 113; fixes a shipped W28 bug) ⚑
- [ ] **Dread Presence veto from the Dirgehound Pack** ⚑ — RE-TEST of the W28 headline row:
      it was DEAD before this fix (the scan skipped adversary owners AND unlinked token
      copies). A Weakened character within 30 ft of a placed dirgehound tries to move
      closer to an ally → the preUpdateToken veto blocks with the engine's message.
- [ ] **Shield Wall engine pre-reduction from a crownox** ⚑ — attack a crownox that stands
      adjacent to a ring-mate with 2+ oxen adjacent: damage drops by half 1d6 and the chat
      line names Shield Wall (adversary dice = ROLE rank per ruling 122 — rival d6).
- [ ] **Whispered Doubt focus-tax from the tollbird flock** ⚑ — a hostile within the
      flock's Attunement Range spends focus → loses 1 more, announced in chat (once per
      round per enemy); first adversary consumer of the focus watcher.

## 1. Reeve-Owl (Black rival — the judgment kit) ⚑
- [ ] **Sapping Hex on-hit** ⚑ — Stoop hits an Isolated character → Weakened applied by
      the engine (timed status; nothing on a non-Isolated hit).
- [ ] **Predatory Patience rider + cue** ⚑ — attack a Weakened target: +1d6 on the test (ruling 122 re-dice);
      on the hit, whispered 1-Focus-regain card.
- [ ] **Sovereign of Solitude use** ⚑ — target a Weakened mover and use: movement 0
      (Immobilized timed status) + Black vs. Spiritual auto-contest for 1d6 vital (ruling 122 re-dice).
- [ ] **Cruel Step executor** ⚑ — use with an Isolated target: 10-ft glide, no Reactions;
      refuses without an Isolated target.
- [ ] **Cues** ⚑ — Bailiff's Eye reminder at hostile turn-start; bloodied break-off card.

## 2. Crownox Ring (White rival ×3 — the wall) ⚑
- [ ] **Unbreakable Line ally-drops cue** ⚑ — a ring-mate would drop → whispered 3-Focus
      card; the White test resolves through the contest core on use.
- [ ] **Retributive Guard** ⚑ — ox takes damage → whispered prompt for its neighbors; use
      resolves White vs. Spiritual → 1d6 spirit to the attacker (ruling 122 re-dice).
- [ ] **Ring behavior rows** ⚑ — Guardian Stance +1 Deflect while adjacent (sheet note);
      bloodied → the ring TIGHTENS (cue); an ox pulled 10+ ft loses the wall kit (GM read).

## 3. Rootling Swarm (Green minion ×3 — "the Snare") ⚑
- [ ] **Grasping Vines use** ⚑ — Green vs. Physical auto-contest → Restrained; 1-Focus
      upkeep at its turn start (GM-paid).
- [ ] **Territorial Instinct** ⚑ — turn-start cue; on a declared Disengage, use resolves
      Green vs. Survival → movement 0.
- [ ] **Bloodied scatter cue** ⚑.

## 4. Briar-Gone Grove (Green boss — "the Closing Arena") ⚑
- [ ] **The Briar Rises** ⚑ — Draw Mana click-places a briar square (embedded Green Key).
- [ ] **Thorn Field** ⚑ — engine-placed patches deal half 1d8 keen via the region hazard (ruling 122 re-dice)
      automatically; hand-placed maze gets the turn-start cue instead.
- [ ] **Sudden Growth burst** ⚑ — use → click-place difficult terrain near a sensed
      character (the real edha-burst rule).
- [ ] **Spreading Roots cue** ⚑ — character starts its turn in briar → whispered 1-Focus
      spread card.
- [ ] **Register cues** ⚑ — bloodied: stops targeting downed; 0 HP: goes still, not dead.

## 5. Tollbird Flock (Black minion swarm) ⚑
- [ ] **Sapping Hex on-hit** ⚑ — mob hits an Isolated character → Weakened (engine).
- [ ] **Swarm bookkeeping** ⚑ — half damage from single-target Strikes, scatters on AoE
      (GM-run; NO NAMEABLE HOOK per the Wake-Eel precedent) — sanity-read at the table.
- [ ] **Bloodied re-settle cue** ⚑.

## 6. Surecat (Blue rival — the foresight duel; Ben's logged Blue exception) ⚑
- [ ] **Forewarned turn-end cue** ⚑ — at its turn end, whispered declare-a-character-and-
      action card; Intercept's standing-order card rides the same moment.
- [ ] **Redirect Momentum use** ⚑ — target the mover and use: Blue vs. Athletics
      auto-contest → reduce move 10 ft or push 10 ft (name-keyed engine path).
- [ ] **Pounce rider cue** ⚑ — on-hit whispered "+1d4 if they did the declared thing".
- [ ] **Bloodied leave cue** ⚑.

## 7. Brandram (Red rival — the charge) ⚑
- [ ] **Momentum's Edge rider** ⚑ — Ram after moving ≥20 ft toward the target this turn:
      +2d4 impact, engine-measured via the turn-start position stamp (first ADVERSARY
      consumer of whenMovedTowardFt). No rider on a standing hit. (Rate is Ben-ruled +2d4,
      ruling 113 — the PC card's +Speed stands for PCs.)
- [ ] **Shockwave Slam push** ⚑ — melee hit pushes up to 10 ft; collision deals half 1d4
      impact (the real edha-push rule).
- [ ] **Reckless Advance / Unstoppable executors** ⚑ — use → 10-ft no-Reaction charge;
      Fast-turn damage → free half-Speed move (once/turn).
- [ ] **Bloodied withdraw cue** ⚑.

## 8. Tussock-Sow (Green rival — "the Closing Arena", mobile) ⚑
- [ ] **The Wrighting** ⚑ — Draw Mana click-places churned mire (embedded Green Key).
- [ ] **Sudden Growth burst / Spreading Roots cue** ⚑ — as the grove's rows, in mire key.
- [ ] **Drive the Prey use** ⚑ — Green vs. Survival auto-contest → Slowed + forced away
      (name-keyed engine path, the Fellstag's alias un-aliased).
- [ ] **Bloodied stand-ground cue** ⚑.


# Vorsk Ranges Bestiary (rulings 121–122 — statted 2026-07-20; the Vorsk dive Phase-4c gate)

**Deploy needed first:** engine F5/relaunch (ruling 122: `edhaColorRank` role-rank fallback +
Shield Wall wallDie + Pack Pressure rank routing) **AND** pack rebuild (`foundry-build
adversaries`) + relaunch + **"⟳ Sync Adversaries from Pack"**. Folder: *Vorsk Ranges Bestiary*
(4 blocks). The ruling-122 re-dice also touched SIX older blocks (False Spring, Dirgehound,
Reeve-Owl, Brandram, Crownox, Briar-Gone Grove) — their W28/W29 rows above are updated in
place and re-test at the new numbers.

## 0. Engine — the role-rank fallback (ruling 122) ⚑
- [ ] **Shield Wall reduction at rival d6** ⚑ — the crownox row above, re-run: the
      reduction is half 1d6 now, never half 1d4 (role rank 2, not tier 1).

## 1. Cragdrake Whelp Pack (minion ×4) ⚑
- [ ] **Reckless Advance use** ⚑ — target a creature and use: the whelp charges toward it
      via the engine move executor, no Reactions provoked.

## 2. Cragdrake Adult (rival ×2, wolf-sized) ⚑
- [ ] **Searing Bolt** ⚑ — native ranged attack: +6 vs 60 ft, 1d6 energy on a hit (rival
      rank-2 die, ruling 122).
- [ ] **Predatory Patience rider + cue** ⚑ — attack a Weakened target: +1d6 injected on
      the test; on the hit, whispered 1-Focus-regain card.
- [ ] **Explosive Leap use** ⚑ — the move rides the executor; landing prone-test is on the
      card (GM-adjudicated, by design).

## 3. Cragdrake Alpha (boss, tier 2) ⚑
- [ ] **Dread Presence veto** ⚑ — a Weakened character within **60 ft** cannot move closer to
      allies (second bestiary consumer of the ruling-113 owner-scan). *(Card text corrected
      30→60 ft at the Kettavar 4c gate — the engine always enforced 60 at boss rank 3; verify
      the card SHOWS 60 after the rebuild.)*
- [ ] **Flame Surge (the breath)** ⚑ — 2 Actions / 2 Focus: 10-ft burst in 60 ft, Athletics
      vs. Red, 2d8 energy on a failure, half on success (GM-rolled on the card, by design).
- [ ] **Predator's Due on-defeat** ⚑ — reducing a character to 0: +2d8 health
      engine-applied + whispered Focus card.
- [ ] **Unstoppable** ⚑ — damage on a Fast turn → half-Speed engine move, once per turn.
- [ ] **Bloodied cue** ⚑ — at half HP: whispered "drakes cull, they don't duel" withdrawal
      card.

## 4. Bellwether (encounter piece) ⚑
- [ ] **Guiding Signal / Ordered Advance** ⚑ — both use-cards present and legible on the
      sheet; no dice automation expected (support piece by design). ⚑ placeholder icon —
      art wishlist.

# Ashkar Mesas Bestiary (rulings 137–138 — statted 2026-07-22; the Ashkar dive Phase-4c gate)

**Deploy needed first:** pack rebuild (`foundry-build adversaries`) + relaunch + **"⟳ Sync
Adversaries from Pack"**. Folder: *Ashkar Mesas Bestiary* (5 blocks). The gate also **parity-fixed
the shipped False Spring** (Kindle `lightRadiusFt: 5` — the light/concealment clause was inert);
its Canticle-plains row above re-tests the light strip on the same rebuild. All dice by ruling 122
(leyline rank = role rank).

## 1. Hazewyrm Whelp Pack (minion ×3, Red/Blue) ⚑
- [ ] **Scalding Bite + Kindle** ⚑ — energy bite (1d4+1); Kindle adds +1 energy AND now sheds
      light 5 ft / strips concealment on the hit (`lightRadiusFt: 5` — the newly-live half).

## 2. Hazewyrm Adult (rival, Red/Blue) ⚑
- [ ] **The Held Haze ambush-belief** ⚑ — first strike per target: it rolls Perception vs the
      wyrm's cog 11 (engine-rolled); on a fail, the target is "fooled".
- [ ] **Bite fooled-rider** ⚑ — vs a fooled target the Bite adds +1d6 (reads the Held-Haze
      ledger; both halves present, not orphaned).
- [ ] **Searing Bolt** ⚑ — native ranged +6 / 60 ft, 1d6 energy (rival rank-2 die).
- [ ] **Afterburn** ⚑ — on energy damage, Opportunity → Afflicted [half 1d6 energy]
      (Opportunity trusted, prompt on target).

## 3. Hazewyrm Elder (boss, tier 2, Red/Blue) ⚑
- [ ] **The Held Haze + Rend fooled-rider** ⚑ — ambush vs cog 13; Rend +1d8 vs a fooled target.
- [ ] **Flame Surge (the breath)** ⚑ — 2 Actions / 2 Focus: 10-ft burst in 60 ft, Athletics vs
      Red, 2d8 energy (half on success; GM-rolled on the card, by design).
- [ ] **Searing Bolt + Kindle** ⚑ — native 2d8 energy; Kindle adds +3 energy AND light/concealment
      strip (the energy attack Kindle rides).
- [ ] **Afterburn** ⚑ — on energy damage, Opportunity → Afflicted [half 2d8 energy].

## 4. The Reckoning (rival White pack ×3) ⚑
- [ ] **Guiding Signal / Ordered Advance** ⚑ — both use-cards present and legible (support kit,
      no dice automation expected).
- [ ] **Unbreakable Line ally-drops cue** ⚑ — when a pack-mate drops within 5 ft, a whispered
      card fires (test White DC ½ damage to hold at 1; the DC test runs at the table).
- [ ] **Pack Doctrine** — no automation by design (`NO NAMEABLE HOOK`: pack targeting is NPC intent).

## 5. The Slagbull (rival Red bruiser) ⚑
- [ ] **Shockwave Slam** ⚑ — on a melee impact hit, target pushed [Size] ft; a wall collision
      deals half 1d6 impact (edha-push).
- [ ] **Reckless Advance use** ⚑ — target + use: charge via the move executor, no Reactions.
- [ ] **Unstoppable** ⚑ — damage on a Fast turn → half-Speed engine move, once per turn.
- [ ] ⚑ placeholder icons on all five — art wishlist.

# Kettavar Tundra Bestiary (rulings 147–148 — statted 2026-07-22; the Kettavar dive Phase-4c gate)

**Deploy needed first:** pack rebuild (`foundry-build adversaries`) + relaunch + **"⟳ Sync
Adversaries from Pack"** — the same rebuild that carries the Ashkar five. Folder: *Kettavar
Tundra Bestiary* (4 blocks). The gate also **parity-fixed shipped card text** (Cragdrake Alpha
Dread Presence 30→60 ft — see its row above; Dirgehound/Reeve-Owl/Cragdrake Predatory Patience
wording sweep, no behavior change, no re-test). All dice by ruling 122 (leyline rank = role rank).

## 1. The Doubled (rival, Black/Blue, solitary) ⚑
- [ ] **The Doubling ambush-belief** ⚑ — first strike per target: engine-rolled Perception vs
      cog 13; on a fail the target is "fooled".
- [ ] **Raking Grasp fooled-rider** ⚑ — vs a fooled target the Grasp adds +1d6 (reads the
      Doubling ledger; both halves present, not orphaned).
- [ ] **Predatory Patience** ⚑ — +1d6 test-rider vs a Weakened target (target first) + on-hit
      whispered Focus card.
- [ ] **Walk Out of the White** ⚑ — damaged → whispered Reaction card (1 Focus, 10 ft unseen).

## 2. The Doubled Elder (boss, tier 2 in the tier-1 hp band, Black/Blue) ⚑
- [ ] **The Seeming (full loop, name verbatim)** ⚑ — 1 Action: copy token beside the elder,
      1 hp, per-enemy engine-rolled belief sweep, client veil; breaking it fires the
      seeming-break cue.
- [ ] **Raking Grasp fooled-rider** ⚑ — +1d8 vs a target fooled by EITHER the Doubling ledger
      or the Seeming (edhaTargetFooled reads both).
- [ ] **Dread Presence veto** ⚑ — a Weakened character within **60 ft** (boss rank 3) cannot
      move closer to allies; card text says 60 (authored right this time).
- [ ] **Predatory Patience** ⚑ — +1d8 vs Weakened + Focus cue.
- [ ] **Walk Out of the White** ⚑ — fires on BOTH damaged and seeming-break triggers.
- [ ] **Never a Corpse bloodied cue** ⚑ — at half HP: whispered withdrawal card.

## 3. Cullwolf Pack (minion ×4, Black) ⚑
- [ ] **Severance vital-convert** ⚑ — THE headline test (first bestiary Severance): a bite
      against an **Isolated** character (no ally within 5 ft) applies **vital** damage
      (bypasses default Deflect); vs a non-Isolated target it stays keen.
- [ ] **Predatory Patience** ⚑ — +1d4 test-rider vs Weakened (minion rank-1 die) + Focus cue.
- [ ] **The Tithe Takes the Failing** — no automation by design (`NO NAMEABLE HOOK`: NPC
      targeting intent, the Pack Tactics class).

## 4. The Cull-Alpha (rival, Black) ⚑
- [ ] **Severance vital-convert** ⚑ — as the pack's, at rival numbers.
- [ ] **Predator's Due on-defeat** ⚑ — reducing a character to 0: +1d6 health engine-applied
      + whispered Focus card.
- [ ] **Waits for the Failing bloodied cue** ⚑ — at half HP: whispered withdraw-and-watch card.
- [ ] ⚑ placeholder icons on all four (silhouette / wolf-shadow reuse) — art wishlist.
