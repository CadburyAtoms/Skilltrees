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

- [ ] ⚑ **Melee discriminator (`edhaAttackKind`)** — hit with a MELEE weapon: Bone Spurs/Venom
      Glands/Fury/Mantle riders fire "(auto-checked)". Hit with a RANGED weapon: Spurs/Venom post a
      stands-down card; **Withering Touch and Warlord's Advance stay armed**. If riders misread,
      the cosmere weapon `system.range` shape differs — report it (null already falls back to
      owner-judged).
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

- [ ] **2bR-18 — The point of the migration** — open any converted talent → Events → The rule(s) are visible and editable — change a prompt text, confirm the card shows the edit.
- [ ] **2bR-7 — Counterpoint** — target the influencing enemy, use it, roll your White test → GM is prompted for the influence result (DC). Success: −1 Inv, enemy **Disoriented** until end of your next turn. ⚠️ **Two sanctioned drifts:** no target now VETOES the use (was: a manual card), and a DECLINED DC prompt resolves as a success (fail-open, §9m q9) instead of the manual card.
- [ ] **2bR-11 — Beacon of Stability** — Draw Mana with a conditioned ally in range → The cleanse card posts (one button per ally-condition); click removes it, −1 Inv. ⚠️ Cosmetic drift: its own card now — no longer a line on the Draw Mana summary card.
- [ ] **2bR-12 — White Leyline Attunement** — Draw Mana → Visible allies in range + you heal Tier HP; hidden / behind-wall skips accounted. ⚠️ Cosmetic drift: posts its own card; the Draw Mana summary card no longer prints a White line.
- [ ] **2bR-15 — Terms of Accord** — use it → A pick card of same-side characters in range (⚠️ minor drift: creatures at 0 HP are now skipped); click forges the accord and posts the note — including the modifier share if you own Bound by Word.
- [ ] **2bR-16 — ⚑ Bound by Word** — forge an accord (owning it), then the partner rolls a skill test → The partner's offer card appears, unchanged. **Bound by Word's own Events tab is EMPTY by design** — it is the *shareModIfOwns* gate on Terms of Accord's forge rule (upgrade-talent pattern, declared in the Accord header).
- [ ] **2bQ-10 — ⚠️ all four — the Events tab** — open Interposing Shield, Shared Burden, Retributive Guard, Unbreakable Line → **Events** → Each shows one *Edha: Offer a Reaction When Someone Takes Damage* rule with its own range/cost/amount/prompt. **Change Shared Burden's cost to 1 Inv and confirm the card says 1** — that is the migration's whole point, and these four had empty tabs before. Put it back to 2.
- [ ] **2bR-2 — Shared Conviction** — an ally's test rolls a Complication or a kept d20 ≤ 10 → Card offers +your White modifier; click asks for the DC and reports whether the boost saves it; spends 2 Focus + 1 Inv.
- [ ] **2bR-13 — Ordered Advance** — use it, then move → The armed-window note, then an allies-within-10-ft half-Speed card on each move this round. (A window armed before this deploy dies with the old flag — re-use once, harmless.)
- [ ] **2bR-14 — Guiding Signal** — use it → The designate card (opposing tokens in White Attunement Range); the next ally testing against the designated token this round gets the Plot Die.
- [ ] **2bJ-2 — Overwhelming Authority (White)** — same as 2bJ-1 → Identical behaviour. The two shared one card function and now carry the same pair of rules; if 2bJ-1 works and this does not, the problem is the talent, not the handler.
- [ ] **2bJ-13 — Callthief — Overwhelming Authority (adversary)** — run the Callthief's ability → Same offer-then-Disorient as 2bJ-2. It used to work only by borrowing the PC talent's engine branch, which is gone; it is wired on its own document now.
- [ ] **2bR-8 — Guardian Stance** — move an ally adjacent, then apart → Both gain the +1 Deflect effect while adjacent; it auto-removes on separation. Any lingering pre-deploy "Guardian Stance (+1 Deflect)" effect is swept off automatically once.
- [ ] **2bR-9 — Shield Wall** — an enemy damages an ally adjacent to the owner (owner has ≥2 adjacent living allies) → Damage reduced by half [Tier][White Die], same chat note naming the talent. ⚑ Also worth one adversary-owner check (role rank feeds the die — ruling 122).
- [ ] **2bQ-7 — Interposing Shield** — have an ally within 10 ft take damage → The whispered card appears offering 1 Inv to reduce it by half a White [Die]. Click it — the reduction lands. The number must never exceed the damage actually dealt. Unchanged from before this pass.
- [ ] **2bQ-8 — Shared Burden / Retributive Guard** — be **adjacent** to an ally who takes damage, once from a hostile attacker → Shared Burden offers 2 Inv to take half in their place. Retributive Guard offers 1 Inv to strike back — but **only** when there is a hostile attacker inside your White Attunement Range. Damage from a fall or a hazard should offer Shared Burden and **not** Retributive Guard.
- [ ] **2bQ-9 — Unbreakable Line — the trigger is narrow** — be adjacent to an ally who **drops to 0** → The card appears only on the drop, not on ordinary damage, shows a DC of half the killing blow, and is **once per round** (a second drop the same round offers nothing).
- [ ] **White spot-checks (like-for-like)** — run once each: Pillar of Order (2bR-1) · Concordant Presence (2bR-3) · Voice of Authority (2bR-5) · Collective Resolve (2bR-6) · Devoted Conduit (2bR-10) → identical to pre-migration behaviour (cards, costs, ranges); any drift is a bug. Collapsed from 2bR-1/3/5/6/10.
- [ ] **2bR-17 — Adversaries** — Callthief's Counterpoint · Bellwether's / The Reckoning's Ordered Advance → Each now carries its OWN rules (they used to ride the talents' retired name hooks) — behaviour per their stat-block text. Adversary pack + ⟳ Sync required.

---

# BENCH — Blue (leyline)

Run on **Bench — Blue** (enemy dummies in Blue Attunement Range; one with a written Cognitive
defense, one without). No pack rebuild pending. Priority: 2bJ-1 (first prompt-pick ever
— if it fails, every prompt row dies with it), 2bF-3 (first `vs: skill`),
2bAA-10 (the walls), and 2bP-2 (the silent-free-buff trap).

- [ ] **2bJ-1 — Subtle Suggestion (Blue) ⚠️⚠️** — target a character, use it, then click the button on the whispered card → A card asks whether you influenced them; clicking leaves the target **Disoriented until the end of your next turn**. This is the first prompt-pick click in the project — if the button does nothing, stop here and tell me.
- [ ] **2bF-3 — Redirect Momentum (Blue) ⚠️⚠️** — target a mover + use + roll → **The first authored use of H1's `vs: skill` ever.** The engine must roll the TARGET's Athletics and print `Blue N vs ATH M`. If it silently compares against a defense instead, this is where it shows.
- [ ] **2bF-17 — Surecat → Redirect Momentum** — run the adversary's copy → It carries its OWN rule now (it used to ride the PC talent's engine branch). Must behave the same.
- [ ] **2bAA-10 — Phantom Barricade — H22, the session's build risk** — use it: click a square in range; walk a token into the barrier; attack it to 0; try placing one on top of a creature; end the encounter → ⚑ ALL NEW. Click-placed in Blue range (cancel/out-of-range refunds). **Nothing should be able to move through it** — that is real walls, and it is the first time this engine has ever done it. At 0 HP it is destroyed and the walls come down; an occupied square is refused and refunded; the encounter ending clears it. **Cover is still yours to adjudicate** — deliberately not automated. Report anything the walls do to vision or lighting.
- [ ] **2bAA-6 — Living Image** — open it → **Events tab**; then start your turn with an illusion up → ⚑ TWO rules where the tab was empty: `edha-illusion-upkeep` (config) + `edha-note` (use). The turn-start prompt still whispers with a one-click pay. **Edit `costPer` to 2 and the button must then charge 2** — that is the whole point of the conversion.
- [ ] **2bAA-7 — Holographic Illusion** — Events tab; then use it and click a square in range, and again out of range, and again cancelling → ⚑ ONE `edha-summon` rule. **NEW: it now asks you to click a square** and enforces Blue Attunement Range — the old version spawned it beside you with no range check at all. Out-of-range and cancel must REFUND the Investiture. The token is sized to [Size] off your Blue rank and does NOT join initiative.
- [ ] **2bAA-8 — Phantom Double** — Events tab; use with no target, then on an ally in range, then on an ally out of range → ⚑ ONE `edha-illusion-copy` rule. Belief loop unchanged (each enemy that can see it rolls Perception vs your Cognitive defense; fooled clients stop rendering the original). **NEW: an out-of-range ally refunds the 2 Investiture.**
- [ ] **2bJ-3 — Pattern Recognition (Blue) ⚠️** — use it on a target, accept, then have them roll a test **this round**; separately, accept and let the **round change** before they roll → Disadvantage on the test this round. After the round changes it **no longer applies**. ⚑ **BEHAVIOUR CHANGE:** the card always said "their next test **this round**" and the old flag waited for ever. Tell me if you'd rather it kept waiting.
- [ ] **2bJ-5 — False Premise (Blue) ⚠️** — target a character in your Blue Attunement Range, use it, roll Blue → The engine resolves **Blue vs their Cognitive defense** and, on a success, imposes disadvantage on their next test. ⚑ **NO MORE MANUAL CARD:** it used to fall back to a click-card when the defense was unreadable; that path is gone under your fail-open ruling (2bI-8 / 2bH-11), so it now just succeeds. Also check it refuses **out of range, nothing spent**.
- [ ] **2bF-2 — Read Intent (Blue)** — target + use + roll → Public SUCCESS/FAIL card, plus a **whispered** "GM — reveal the action…" note on a success only. ⚠️ The test RESULT is public now; only the reveal is whispered. Say if you want the whole thing back to whisper.
- [ ] **2bF-4 — Ghostly Walls (Blue)** — target + use + roll a success → Target Immobilized until the end of YOUR next turn.
- [ ] **2bF-5 — ⚑ Absolute Stillness (Blue)** — own it, then use Ghostly Walls → The target ALSO gains Weakened. Without the talent, it must NOT. **Absolute Stillness's own Events tab is EMPTY and that is intended** — its rider is a `whenOwnsTalent` rule on Ghostly Walls. Tell me if you'd rather edit it on its own card.
- [ ] **2bF-6 — Ghostly Walls vs an adversary with no written Cognitive defense** — use it → It now **auto-succeeds** (H1 fails open) where the old code offered a manual "Immobilize" button. The button is gone.
- [ ] **2bI-12 — Reactive Analysis (Blue)** — **target** the creature that just failed, then use it; roll a test against **that** creature, then against a **different** one → Advantage on the test against the targeted creature and **not** on the other. ⚑ **NEW ENFORCEMENT** — the card always said "against them" and the old code granted advantage on any next test. With nothing targeted it falls back to the old, unbound behaviour.
- [ ] **2bP-1 — Calculated Patience — the normal case** — in combat, declare a **Slow** turn, roll your first test → Advantage, as always. Your **second** test that turn: no advantage.
- [ ] **2bP-2 — ⚠️⚠️ Calculated Patience — OUT of combat** — with **no combat running**, roll any test → **No advantage.** This is the row that matters most: the obvious way to write this gate would have granted advantage on the first test of every out-of-combat scene, silently. If you see advantage here, stop and report it.
- [ ] **2bP-3 — Calculated Patience — the macro is gone** — console: `edha.calculatedPatience()` → **TypeError / not a function.** That is correct — the talent does it by itself now. Also confirm a **Fast** turn gives no advantage.
- [ ] **2bP-4 — Blue Leyline Attunement** — Draw Mana, then roll an **Intellect or Willpower** test → Advantage, as before. A **Strength/Speed** test gets nothing.
- [ ] **Blue spot-checks (like-for-like)** — run once each: Counterspell (2bF-1) · Probability Cascade (2bJ-4) · Anticipate (2bJ-6) · Intercept (2bJ-11) → identical to pre-migration behaviour; any drift is a bug. Collapsed from 2bF-1 + 2bJ-4/6/11.
- [ ] **2bAA-9 — The Seeming — Mistheron AND The Doubled Elder** — use it on each; break the copy → ⚑ Each adversary ability now carries its OWN `use` rule (⟳ Sync Adversaries / re-drag first). Both must still raise the copy and run the belief sweep, and **the cards must name "The Seeming", not "Phantom Double"**. Spearing Beak's / the Grasp's fooled-target rider must still find the belief ledger.

---

# BENCH — Black (leyline)

Run on **Bench — Black** (enemies in Black Attunement Range, one Isolated, one with allies
within 10 ft, one at 0 focus). No pack rebuild pending. Priority: 2bI-1 (first
`scope: scene` watch) and 2bI-5 (the chain flag) — if either fails, stop before the
rest; the others share that machinery. 2bI-9 is the one row still asking a design
question (the empty Events tab).

- [ ] **2bI-1 — Whispered Doubt (Black) ⚠️⚠️** — in combat, have an **enemy inside your Black Attunement Range spend focus** → It loses **1 additional focus**, with a card. Then make it spend focus again the **same round** — nothing more (once per round per enemy). Next round it works again. This is the first `scope: scene` watch ever to run; if it does nothing, the whole scene half is dead. **Observed 2026-07-26 (bench run 1, Red pilot, incidental):** Whispered Doubt AND Coercive Pressure both fired **with no combat running** (a bench drain on a hostile in range triggered the extra loss + the Cognitive-disadvantage arm, which later consumed as `2d20kl`). The watches work — but this row says "in combat"; rule whether out-of-combat firing is intended when you run Black.
- [ ] **2bI-2 — Whispered Doubt — the negative cases** — repeat 2bI-1 with (a) an **ally** spending focus, (b) an enemy **outside** your range, (c) an enemy already at **0 focus** → Nothing, all three times. (c) is silent by design.
- [ ] **2bI-5 — Predatory Insight (Black) ⚠️⚠️** — drive any creature **to 0 focus** — first by ordinary spending, then by letting **Whispered Doubt's** extra loss be what empties it → You regain **1 focus** BOTH times. The second is the one that broke in the 07-05 pass and it is the only rule in the project using the new `chain` setting — if it fires on the first but not the second, the chain flag is not working.
- [ ] **2bI-3 — Coercive Pressure (Black) ⚠️** — same trigger — an enemy in range loses focus — then have it roll a **Cognitive (Intellect/Willpower)** test, then a **Physical** one → Disadvantage on the Cognitive test only, announced when spent. **⚑ CARD TEXT CHANGED:** it now reads "an **enemy** within Attunement Range… once per round per **enemy**" — the engine has been enemies-only since your 07-12 ruling and the card said "a character". Say if you'd rather widen the engine instead.
- [ ] **2bI-4 — ⚑ Coercive Pressure stacking** — give the same creature Coercive Pressure's disadvantage **and** another next-test rider (e.g. Probability Net) → **NARROWING:** they no longer stack — the second write overwrites the first. The bespoke Cognitive-disadvantage flag that allowed both is gone. Tell me if that matters at the table.
- [ ] **2bI-6 — ⚑ Whispered Doubt vs Wary** — have the enemy own **Wary**, then trigger Whispered Doubt → **BEHAVIOUR CHANGE:** the extra loss is now reduced by their Discipline ranks (usually to zero), because it goes through the shared involuntary-focus path. Wary's text says involuntary focus loss, so this reads correct — but it did NOT happen before. Your ruling, not a bug report.
- [ ] **2bI-7 — Hollow Command (Black) ⚠️** — use it on a creature **outside** your Black Attunement Range, then on one inside → Outside: refused, **nothing spent** (no Investiture, no roll). **⚑ NEW ENFORCEMENT** — the card always said "within Attunement Range" and the old code never checked. Inside: you roll Deception, it resolves against Spiritual, and on a success the target gains **Cannot Act** until the end of ITS next turn.
- [ ] **2bI-8 — ⚑ Hollow Command vs an unreadable defense** — use it on a creature with **no written Spiritual defense** → **BEHAVIOUR CHANGE:** it now succeeds (fail-open) where the old code posted an owner-judged click-card. Identical to 2bH-11 — one ruling covers both.
- [ ] **2bI-9 — Siphoned Will (Black)** — own it, land Hollow Command, and check the Events tab of **Siphoned Will itself** → You regain focus equal to your **tier**, on a card naming *Siphoned Will*. ⚑ Its own tab is **EMPTY** — the rule lives on Hollow Command. Third talent to take this exit (2bF-5/14/16 were the others); the question there is the question here.
- [ ] **2bJ-7 — Unnerving Approach (Black) ⚠️⚠️** — target an enemy that has its own allies within 10 ft, use it, click one → The card lists **the target's allies** (not yours), and the one you click is pushed **[Size] ft (Black rank) directly away from your TARGET** — not away from you. Check the direction carefully: getting it wrong is the whole point of this row.
- [ ] **2bJ-8 — Puppeteer (Black) ⚠️⚠️** — in combat, let a character at **0 focus** inside your Black Attunement Range begin its turn → You get a whispered offer naming that creature. Clicking spends **2 focus + 1 Investiture** and posts the public "chooses one of its actions" note. First `turn-start` watch ever to run — if no card appears, the watch kind is dead, and 2bJ-9 will tell us which half.
- [ ] **2bJ-9 — Puppeteer — the negative cases** — let a creature begin its turn **with focus**; one at 0 focus **outside** range; **your own** turn start; and accept twice in one round → Nothing for the first three. The second acceptance in a round is refused.
- [ ] **2bJ-10 — ⚑ Puppeteer / Unnerving Approach — the ignored card** — let one of their cards post and **do not click it**; then trigger the talent again the same round → It works again. ⚑ **BEHAVIOUR CHANGE:** the once-per-round budget is now spent when you **click**, not when the card posts, so declining no longer burns the use.
- [ ] **2bJ-14 — Dirgehound Pack — Unnerving Approach (adversary) ⚠️** — run the Dirgehound's ability against a PC with allies nearby → Pick one of the target's allies; it is pushed a **flat 5 ft**, as the card prints. ⚑ **FIX:** it previously borrowed the PC talent's wiring, which scaled the distance off the owner's **Black rank** — a stat no adversary has.
- [ ] **2bZ-1 — Blood Price** — pay any ritual HP cost (Dark Investiture); roll a NON-Black test, then a Black test → Payment card is lean ("pays N HP"); a separate advantage card arms via nextTestMod. Non-Black test unaffected; the Black test rolls advantage + consume card. ⚠ single-slot (2bI-4): another next-test rider now OVERWRITES a banked Blood Price.
- [ ] **2bZ-2 — Sanguine Reservoir bank** — pay ritual HP; check the sheet → Separate "banked N Reserve (x/cap)" card; the sheet Reserve bar shows (rule-keyed — a re-synced talent is required, ⟳ Sync first).
- [ ] **2bZ-3 — Reserve as Investiture** — open a Spend-Investiture dialog with Reserve ≥ the static cost → The "Pay from Reserve" checkbox appears (now keyed on the banking RULE, not the name) and pays without touching Investiture.
- [ ] **2bZ-4 — Double Dip + ritual pay-from-Reserve** — mark a target, use a ritual talent on it, accept the Reserve prompt → No health lost, NOTHING else fires — no Blood Price advantage, nothing banked (a Reserve payment is deliberately not a ritual-paid event; unchanged behaviour).
- [ ] **2bZ-12 — Black Leyline Attunement** — Draw Mana with a mix in range: an Isolated enemy, an ally-adjacent enemy, a hidden one, one behind a wall → Summary card is now just "recover N Investiture"; a separate ☠️ pulse card counts ONLY what you can see ("skipped 1 with an ally adjacent"); the GM gets the 🕵️ whisper with hidden/wall counts. Weakened lands on the Isolated visible enemy only.
- [ ] **2bZ-10 — Dread Presence (PC + the three adversary copies)** — a Weakened enemy in range drags its token closer to an ally; repeat near the Dirgehound Pack / Cragdrake Alpha / Doubled Elder → Move vetoed with a toast naming the talent. The adversary copies now ride their OWN rule (re-drag or ⟳ Sync Adversaries first) — ranges 30/60/60 ft via role rank.
- [ ] **2bM-8 — Withering Ray (Black) ⚠️** — target **two** creatures, use it → Cancelled with **nothing spent**, and a whispered picker lists both; clicking one retargets and re-uses. Then confirm the **HP cost still works** on a normal single-target use — that talent now carries two rules.
- [ ] **2bM-10 — ⚑ Both — the picker note** — read the picker card → It carries a short line naming the talent ("hits ONE creature" / "heals ONE creature").
- [ ] **2bF-12 — Double Dip (Black)** — target + use + roll a success, then use a Ritual talent on that creature → Target gains the **Double-Dipped** marker; the Ritual talent still offers "pay from Reserve". ⚠️ The mark moved to the engine-wide shape — **two Black casters can no longer both mark the same creature**; the second overwrites. Say if that matters at your table.
- [ ] **2bH-9 — Extract Thought (Black) ⚠️** — target a creature and roll **any Deception test** that BEATS its Spiritual defense → The target gains **No Reactions** until the end of YOUR next turn. It fires on a plain Deception roll — there is no "use Extract Thought" step.
- [ ] **2bH-10 — Extract Thought** — roll a Deception test that **misses**, then one with **no target** → Silence both times — no card, no status. Silence is not a setting; the talent simply carries no failure rule.
- [ ] **2bH-11 — ⚑ Extract Thought vs an unreadable defense** — Deception vs a creature with **no written Spiritual defense** → **BEHAVIOUR CHANGE:** the status now applies (fail-open, H1's documented convention) where the old code posted an owner-judged click-card instead. Tell me if you want the card back.
- [ ] **2bB-10 — regression: existing riders** — Predatory Patience (Black) vs a Weakened target → Its `+[Die]` still lands. The test-rider injector was restructured to allow mode-only rules; formula riders must be untouched.
- [ ] **Black spot-checks (like-for-like)** — Cruel Step: use it near an Isolated target → slides 10 ft toward them, its Events tab shows the two 16-char rule ids (the 07-12 silent-drop fix), and the engine-move stops at an occupied square → identical to pre-migration behaviour.

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
ally). No pack rebuild pending. Priority: 2bS-17 (premise), 2bS-16 (the
field-discriminator regression), 2bS-11 (the pass's one behaviour addition).

- [ ] **2bS-17 — The point of the migration** — open any converted Green talent → Events → The rule(s) are visible and editable — change a formula or a note, confirm the behaviour/card shows the edit.
- [ ] **2bS-16 — Overgrowth vs Life Surge (deity/Life)** — heal with each → Overgrowth still steps +1/+2/+3 Deflect on the healed creature; **Life Surge must NOT** — the rule FIELD is the discriminator now, and this row is the regression that mattered (pass-M trap).
- [ ] **2bS-11 — Natural Order** — use it (2 Inv), with a veiled enemy in Green Attunement Range standing in darkness → ⚠️ **NEW ENFORCEMENT (re-litigated off the manual list):** you gain the `clearsight` marker for the scene, and the enemy's auto dark-veil marker stays DOWN while in range (a GM's manual toggle is never fought). Illusions / deception-advantage stay GM-narrated per the card. Clears at combat end.
- [ ] **2bS-1 — Green Leyline Attunement** — Draw Mana → Same click-to-place square (range ring, snap, out-of-range refusal). ⚠️ Cosmetic drift: posts its own card; the Draw Mana summary card no longer prints a Green line.
- [ ] **2bS-2 — Thorn Field** — own it, place terrain (Draw Mana or Sudden Growth) → The square deals ½[Tier][Die] keen on enter / turn-start exactly as before; the visual is labeled "🌿 Thorn Field". Events tab shows the *Zone Hazard Rider* rule — edit the formula, place again, confirm the new dice.
- [ ] **2bS-5 — Apex Predator** — roll a Physical (str/spd) test with 3+ living enemies in your terrain → Advantage, as before. With 2 enemies: none. A Weakened (disadvantage) roll must NOT be stomped to advantage.
- [ ] **2bS-8 — Pack Pressure** — use it, then Strike → The window card (its text is now the rule's editable note), and +[Tier][Die] on your Strikes until the start of your next turn. (A window armed before this deploy dies with the old flag — re-use once, harmless.)
- [ ] **2bS-9 — Coordinated Hunt** — you AND an ally both hit the same victim in one round → Your hit adds +min(#attackers, Green rank) of its own damage type, with the hunters count on the card. Solo attacks must NOT trigger it.
- [ ] **2bS-10 — Packmate's Warning** — a hidden (or wall-obscured) attacker rolls an attack at an ally within 10 ft of you → The attack roll takes −2 (flavor names the talent). You yourself being targeted must NOT trigger it. The on-use restatement card is now an editable note rule.
- [ ] **2bF-7 — Grasping Vines (Green)** — target + use + roll a success → Target **Restrained**, no timed expiry — the upkeep stays on the card.
- [ ] **2bF-8 — Territorial Instinct (Green) ⚠️** — target + use + roll → `vs: skill` again — engine rolls the foe's **Survival**. Success → Immobilized until the end of ITS next turn.
- [ ] **2bF-9 — Drive the Prey (Green) ⚠️** — target + use + roll → Engine rolls the foe's **Survival**; success → **Slowed**. Move-away + ally Reactive Strikes stay GM-narrated on the note.
- [ ] **2bR-4 — Pack Sense (Green)** — an ally attacks a creature standing in your difficult terrain → Same card as before (+Green modifier, 1 Inv). A plain skill test (not attack/item) must NOT trigger it.
- [ ] **2bM-9 — Verdant Mend (Green)** — target two creatures, use it → Same picker, nothing spent. With one target it heals normally.
- [ ] **2bT-20 — regression: Green's damage-bonus riders** — Pack Pressure window + Coordinated Hunt → Unchanged by the require-mode widening — `window` and `pack-on-target` paths, amounts and cards identical to 2bS.
- [ ] **Green spot-checks (like-for-like)** — run once each: Spreading Roots (2bS-4) · Pack Hunter (2bS-6) · Scent the Weak (2bS-7) · Resurgent Growth (2bS-12) · Vital Surge (2bS-13) · Natural Recovery (2bS-14) · Reknit Form (2bS-15) · Mender's Instinct (tight one-line reaction card) · Herding Antlers on the Fellstag (2bF-10, adversary regression) → identical to pre-migration behaviour; any drift is a bug. Collapsed from 2bS-4/6/7/12/13/14/15 + 2bF-10. **Observed 2026-07-26 (bench run 1, Red pilot, incidental — probable BUG):** Mender's Instinct offered its heal-Reaction when a **HOSTILE** target (enemy of the parked Bench — Green) dropped to half HP, and the card posted **TWICE** per crossing, three separate times. Two defects to chase when Green runs: the ally gate and the double post. Card also prints the full description, not the "tight one-line reaction card". → test-pass-fixes.
- [ ] **2bS-3 — Fellstag / Briar-Gone Grove (adversaries)** — their Draw Mana / Sudden Wall placements → Thorn Hedge (rival → d6) and the Grove's Thorn Field (boss → d8) keen riders still bake into engine-placed patches — each carries its OWN zone-hazard rule now. Adversary pack + ⟳ Sync required.
- [ ] **Green / Instinct is takeable at all (THE session-0 blocker)** — open the Green tree on a
      PC with Green 1+. **Pack Hunter** is now pickable with no talent prereq (it is the branch
      root); taking it unlocks **Predator's Instinct** and **Scent the Weak**, and the column
      walks down to **Natural Order**. Before this fix, Pack Hunter and Predator's Instinct each
      required the other and all 8 Instinct talents were permanently unpickable.

---

# BENCH — Destruction (Razkael, deity)

Run on **Bench — Destruction** (open ground; enemy dummies to catch blasts; one Construct-type
if you can). No pack rebuild pending. Priority: 2bK-1 (proves the talents fire at all)
and 2bY-4 (the document formula finally drives the roll).

- [ ] **2bK-1 — Cascading Failure (Destruction) ⚠️⚠️** — place 2+ Charges, then use it → All active Charges detonate at once, damage rolls per Charge, and the card names the talent. If **nothing at all happens**, the use is still being cancelled — stop and tell me.
- [ ] **2bY-1 — Set Charge** — use → click in range; click OUT of Attunement Range; right-click cancel → In range: red 10 ft template + Charges card + arm card. Out-of-range or cancel: **Investiture refunded**, nothing placed. ⚠ the range gate is NEW (card-is-spec — the old engine let you click anywhere).
- [ ] **2bY-2 — Set Charge cap** — place past cap (tier+1) → The OLDEST fizzles (template vanishes, ledger at `lists.charges` shrinks).
- [ ] **2bY-3 — Charge arms** — arm "target moves" (target first), "target damaged", "enter"; fire each → Same watchers as before: each fires ONE whispered Detonate prompt; detonation stays your click.
- [ ] **2bY-4 — Detonate** — detonate one; Detonate ALL → Burst damage off the DOCUMENT's damage formula (edit it and re-test — pre-2bY this worked only via the placement snapshot), terrain dropped at each marker, charges consumed.
- [ ] **2bY-5 — Pinpoint Charge** — use with no un-declared Charge; then with one; then detonate → No Charge: refused PRE-COST (nothing spent). With one: newest un-declared Charge flagged ⊕ (card + refreshed buttons). Detonate: +[T][D] keen off **Pinpoint's own damage formula** (edit it — the roll must change; pre-2bY it read a constant via the name), deflect ignored, terrain centres on/follows the primary target.
- [ ] **2bY-6 — Concussive Yield** — own it; detonate any Charge → Every caught foe rolls SPD vs your Red (engine-rolled), failures Prone — card names Concussive Yield. Un-own it (or edit the rule's failStatus) and the rider follows the DOCUMENT.
- [ ] **2bY-7 — Fault Line** — use → click a direction; right-click cancel; catch a Construct → 60×5 line: [T][D]+Str energy (Constructs ×3), SPD-vs-Red → Prone (engine-rolled), line hazard drawn. Cancel: **2 Investiture refunded**.
- [ ] **2bY-8 — Walking Ruin** — use (toggle on); move; use again (off); check Speed → Toggle card; while on, vacated squares become terrain patches (formula off ITS rule). +10 ft Speed stays passive. ⚑ the toggle previously rode an Always-Active activation and may NEVER have fired on this machine — it is now a Free Action use; report what the old behaviour actually was if you remember it.
- [ ] **2bY-9 — Combustion Chain** — use (armed card); drop a foe to 0 HP inside your terrain → Use: armed reminder + by-hand button. Auto: 10 ft zone ignites on the body + spread-5-ft card. Dials (radius/spread) are on the Events tab now.
- [ ] **2bY-10 — Pyre / Fire the Wrack** — place a Pyre zone; end your turn; ⚠ also any zone placed BEFORE this deploy → End of your turn: the GM spread card per zone (unchanged). ⚑ a Region placed before the 2bY deploy carries no `spreads` stamp and stops prompting — re-place it once; not a bug. The Cinderbrock's Fire the Wrack spreads identically via its own rule.
- [ ] **2bK-2 — Cascading Failure — the multi-catch** — arrange it so one creature stands inside **two** blast radii → That creature takes an **extra [Tier][Die] energy**, listed separately on the card as "caught in 2 blasts". This is the talent's whole mechanic.
- [ ] **2bK-3 — The Unmooring (Destruction) ⚠️** — place Charges, use it, then try to use it **again the same scene** → First use: every Charge detonates at **15 ft** radius, ignoring deflect, each +Intellect. Second use: refused, **nothing spent**. End the encounter and it is available again.
- [ ] **2bK-4 — ⚑ Both — the empty-list refusal** — use either with **no Charges placed** → Refused with a warning and **no Investiture spent**. The hand-rolled versions checked this before charging you; the check moved to a pre-use guard, so this row is confirming it survived the move.
- [ ] **2bK-5 — Both — the riders still ride** — detonate with **Pinpoint Charge** declared, and (separately) while owning **Concussive Yield** → Pinpoint's extra keen and the Concussive Yield prone-test both still fire. ⚑ Those two talents are **still engine-owned** — H12 wraps their branches rather than removing them, so this row is checking the wrap, not a conversion.
- [ ] **Razkael prereqs match the drawn tree (2026-07-24b)** — **Cascading Failure**'s card now
      reads "Pinpoint Charge or Concussive Yield" and **Fault Line**'s reads "Walking Ruin or
      Combustion Chain"; each is takeable from either drawn parent alone, not both.

---

# BENCH — Life (Anaveth, deity)

Run on **Bench — Life** (a willing ally dummy to mutate; a wounded ally). No pack rebuild
pending. The Life/Death premise row lives in the Death section (2bW-17).

- [ ] **2bW-12 — Adaptive Mutation** — use targeting a willing ally; pick each option across creatures → The whispered chooser (three options); the pick bakes onto the creature (one per creature, scene): Bone Spurs +tier keen on melee hits, Venom Glands Afflicted ½[T][D] ongoing vital on melee hits, Dense Tissue +2 Deflect + forced movement refused.
- [ ] **2bW-13 — Apex Form** — use on a mutated ally; check all FIVE → (1) [T][D green] regen at the start of ITS turns; (2) +2 Deflect; (3) +tier vital on its attacks; (4) its adaptation numbers DOUBLE; (5) at scene end the buff clears and it takes ONE auto-created injury.
- [ ] **2bW-14 — Primal Regeneration** — use on an ally; deal it Vital damage; re-use on a mutated ally → Tier+1 at the start of its turns; Vital/Spirit damage ENDS it (card names the talent); with an adaptation the tick is [T][D green]+1.
- [ ] **2bW-15 — Surgical Precision** — heal-test a conditioned ally — full success, then a graze → Success (non-graze): the cleanse card (Weakened/Disoriented/Slowed present on the target, pick one). A graze posts NO cleanse.
- [ ] **2bW-16 — Lifeline** — use targeting an ally; damage them; absorb 0 / some; again same round → Use posts the bond card. On damage: the whispered card with the amount input (up to half). "0" declines free; a real amount lands on you as SPIRIT, the ally heals the amount + [T][D green]. Once per round.

---

# BENCH — Chaos (Maelith, deity)

Run on **Bench — Chaos** (enemy dummies inside and outside Blue Attunement Range; one
Isolated). No pack rebuild pending. Priority: 2bG-4 (the conditional-payload idiom) and
2bG-6 (the half-migrated cap reconciliation).

- [ ] **2bG-4 — Isolating Pressure ⚠️⚠️** — success vs a target with **no** Omen → Isolated, and **NO damage at all**. This is the whole H3 conditional idiom: the release rule returns false and the damage rule after it is skipped. If damage lands here, the short-circuit is broken.
- [ ] **2bG-6 — ⚑ half-migrated Omen cap ⚠️⚠️** — place Omens with Entropy Strike (new path), then fire **Cascade Collapse** (old path) to clear them, then place again → The cap must free up correctly. The two paths keep the ledger in different places on purpose — the new one reconciles against the status on read. **If Entropy Strike thinks you are still at cap after Cascade Collapse cleared the Omens, that reconciliation is broken.**
- [ ] **2bG-1 — Entropy Strike (Chaos)** — Events tab, then target + use + roll → ⚑ **THREE** rules listed. On a success: Omen placed **and** [Tier][Die] spirit. It was a takeover before — **you roll the Blue test yourself now**, on the talent's own card.
- [ ] **2bG-2 — Entropy Strike at your Omen cap (= tier)** — use it on a fresh target while at cap → The card says **"no Omen placed — you are at your cap of N"**, and no Omen lands. Chaos REFUSES at the cap; it must not fizzle an older one.
- [ ] **2bG-3 — Isolating Pressure (Chaos) ⚠️⚠️** — success vs a target **with** your Omen → Isolated, **Omen spent**, and [Tier][Die]+Awareness vital.
- [ ] **2bG-5 — Isolating Ruin (Chaos)** — success with, then without, an Omen → With: Isolated + **two** damage instances. Without: Isolated + **one**. The first instance is unconditional; only the second rides the Omen.
- [ ] **2bG-7 — Spreading Omen / Cascade Collapse / Unravel Everything** — run each → Unchanged — these three did NOT convert (they need H8). A regression here means the shared Omen helpers broke.
- [ ] **2bG-8 — Void Sense** — damage an Omen-bearer marked via the new path → Still refunds 1 Investiture once per round. It reads `markedBy.omen`, which H3 still writes.
- [ ] **2bU-1 — Spreading Omen** — target an enemy with another enemy ~8 ft from it, use → YOU roll Blue on the card (⚠ drift — the takeover auto-rolled); success = Omen on the target AND on the nearest other unmarked enemy within 10 ft (auto-picked; a "no additional enemy" card when none; the cap refuses past tier). No target → refused, **nothing spent**.
- [ ] **2bU-2 — Unweaving** — use vs a foe carrying an active effect + your Omen → Success = the GM-clickable dispel card (every enabled effect a button; the click deletes it) + the Omen shatters → Disoriented until the start of your next turn. No Omen → dispel card only, no Disorient.
- [ ] **2bU-3 — Cascade Collapse** — 2 bearers in Blue range, 1 beyond it, use → ONE Blue roll; each IN-range bearer gated vs ITS OWN Cognitive — affected: Omen removed + [T][D] spirit + Disoriented; a resister keeps its Omen. The out-of-range bearer is untouched. Empty ledger: cost still spends, "no creatures on the ledger" (parity with the takeover).
- [ ] **2bU-4 — Unravel Everything** — one pre-placed Omen on an ISOLATED foe, then use amid enemies → Fills Omens nearest-first within Blue range up to the tier cap, then detonates EVERY bearer scene-wide: the Isolated one takes 2[T][D] **vital** (no Disorient), the rest [T][D]+AWA spirit + Disoriented; all Omens clear.
- [ ] **2bU-5 — Void Sense** — an Omen-bearer of yours takes damage in Blue range; again same round → +1 Investiture, once per round (⚠ drift — the Blue-range gate is NEW: the card's clause, never enforced before). Through-walls rendering of Omen-bearers still works (now rule-driven).
- [ ] **2bU-6 — Shatter Focus (regression)** — a marked foe rolls a test; react → The auto-prompt still whispers and the reaction still rerolls-take-lower — its takeover is now the Chaos Set's ONLY name. The removed Omen also leaves the H3 ledger (place another to confirm the count).
- [ ] **2bY-12 — Shatter Focus (CHAOS, deity)** — use with no marked target (veto); then target your Omen-bearer after it rolls; mute the auto-prompt, use again → No/unmarked target: refused PRE-COST (nothing spent — the old flow burned the click). Marked: Omen removed, kept d20 rerolls-take-lower, total rewritten. Auto-prompt whispers on an Omen-bearer's roll; Mute silences; a real use re-arms.

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
pack rebuild pending. Priority: 2bW-17 (the Death/Life premise row).

- [ ] **2bW-17 — The point of the migration** — open any converted Death/Life talent → Events → The rule(s) are visible and editable — change the decay fraction, the ward's THP formula, a mutation number, Lifeline's fraction; confirm the behaviour/card shows the edit.
- [ ] **2bW-1 — Withering Touch** — use; melee weapon hit → Use posts the arm card + the `withernext` icon (re-use while armed refused **pre-cost** — ⚠ drift: the old code allowed a wasted re-arm). The next melee WEAPON hit adds [T][D black]+Wil vital to the same application, consumes the icon, and the target cannot regain HP until the start of your next turn (Temp HP still lands).
- [ ] **2bW-2 — Withering Touch (ranged)** — arm, then a ranged weapon hit; then a talent's own damage → Both are skipped and the arm STAYS (icon still on). Unknown-range weapons fire with the owner-judged note.
- [ ] **2bW-3 — Reaper's Harvest** — drop a hostile NPC in Green range; drop one out of range; kill via Necrotic Cascade → In range: +1 Investiture card + the corpse joins the Remains ledger (`harvested` green skull; cap = tier, oldest fizzles). Out of range / a PC / a summon / a Death-Warded drop: nothing. A CASCADE's nested kill still harvests (the `chain` field).
- [ ] **2bW-4 — Remains freebie** — fresh scene, spend the freebie (e.g. Risen Servant), then check the list → A scene with NO harvest still allows ONE spend ("Scene-start Remain"); after it the ledger reads empty and stays empty — the freebie does NOT come back until the next scene reset ([] ≠ unset).
- [ ] **2bW-5 — Consuming Decay** — use vs a healthy full-HP target / out of Black range / an already-decaying target; then a Weakened one → Bad cases refused **pre-cost** (nothing spent). Valid: `decaying` icon + the card; at the start of the target's turns it takes the re-rolled [T][D black] vital and the owner heals half; removing the icon ends it.
- [ ] **2bW-6 — Bone Garden** — use with no Remain; use + right-click cancel; then valid → No Remain → refused **pre-cost**. Cancel → the 1 Inv REFUNDS, the Remain stays. Valid: the green 10 ft square (difficult terrain enforced), the Remain is consumed, and ANY creature — allies and you too — ending its turn inside takes the baked [T][D green] keen.
- [ ] **2bW-7 — Death Ward (willing)** — target a same-side character, use → No test — "willing" card + the ward lands (a roll still posts from the skill_test card; it is ignored — ⚠ drift, was roll-free). Re-warding the same creature refused **pre-cost**.
- [ ] **2bW-8 — Death Ward (unwilling + save)** — target an enemy, use, roll; then drop the warded creature → YOU roll Black on the card vs its Spiritual (⚠ drift — the takeover auto-rolled); failure = cost spent, no ward. On the warded creature's first lethal drop: 1 HP instead + [T][D black]+Pre Temp HP, ward ends, and the drop does NOT harvest/cascade.
- [ ] **2bW-9 — Raise Dead** — use twice in a scene; use vs a standing target; then a 0-HP token with a Remain held → Repeat + not-at-0 refused **pre-cost** (generic sceneOnce). Valid: the Remain confirm (declining spends nothing), 1 HP revive, Disoriented until the end of ITS next turn, initiative moved onto yours (GM-side, else card-noted), ONE auto-created injury.
- [ ] **2bW-10 — Risen Servant** — use with no Remain; then with one → None → refused **pre-cost**. Valid: the summon lands (unchanged spec) and the OLDEST Remain is consumed on use. Cap-at-tier refusal unchanged (sustainCap).
- [ ] **2bW-11 — Speak with the Fallen** — use with a Remain; decline; use with none → The confirm asks; accepting consumes the oldest Remain, declining posts "no Remain spent" — the 3-questions cue card posts in every case.
- [ ] **2bP-10 — Risen Servant — the cap still refuses** — sustain servants up to your tier, then use it again → Refused, **nothing spent** (no Investiture, no Remain), with a message naming the cap.
- [ ] **2bP-11 — Risen Servant — the Remains gate is unchanged** — use it with **no Harvested Remain** → Refused with nothing spent, as before. (Only the *cap* moved this pass; the Remains ledger is untouched.)
- [ ] **2bI-10 — Necrotic Cascade (Death) ⚠️⚠️** — use it, then drop an enemy inside your Black Attunement Range with **other enemies within 10 ft of the body** → Your token gains a **Cascade Armed** marker. On the drop, each of those enemies takes **[Tier][Die] spirit** — and **your allies standing next to the body take nothing**. First consumer of the new `defeat` watch.
- [ ] **2bI-11 — Necrotic Cascade — the negative cases** — re-use it while armed; drop a **PC**; drop a **summon**; end the encounter → Re-use refused ("already active — nothing spent"). No cascade on a PC or a summon drop. On combat delete the **Cascade Armed** marker clears.
- [ ] **Death / Speak with the Fallen** — its card now reads **"Reaper's Harvest"** (was "Risen
      Servant", which is drawn *below* it). Confirm it hangs off Reaper's Harvest beside Bone
      Garden, and that Risen Servant is still reachable via Bone Garden.
- [ ] **Risen Servant's card no longer names a cut talent (2026-07-24c)** — its Prerequisites read
      **"Bone Garden or Speak with the Fallen"** (was "Bone Garden or Gentle Passage" — a talent
      deleted in the Death-tree rewrite). Confirm it is takeable from EITHER parent alone.

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
- [ ] **2bV-15 — Tempered Edge / Magnum Opus** — Construct Slam a foe with deflect; Siege Cannon; then Magnum + Slam amid enemies → The Slam adds [T][D red] energy AND the deflect bump (ignore-deflect); the Cannon adds NEITHER. Magnum: once/scene pre-cost, +2×[T][D white] HP, +2 defenses, Foundation buff upgrades +1→+2; each Colossus hit splashes [T][D red] energy to enemies within 10 ft of the target (target included) + Agility vs Red or Prone.
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
- [ ] **2bU-9 — Warlord's Advance** — arm; make a RANGED weapon hit; then a melee one on a near-dead foe → Re-use while armed refused. The ranged hit adds nothing and the arm SURVIVES; the melee hit adds [T][D red] impact in the SAME application — a kill grants tier Temp HP + the 10 ft free-move whisper; a survivor grants advantage on your next Presence test against it (target-bound).
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
- [ ] **2bT-5 — Predatory Strike** — use, then hit with a WEAPON → Arm = `predprimed` token icon + the arm card; re-use while armed refused pre-cost. The hit adds [T][D red] × max(Insight-on-target, 1) vital, consumes the icon, then places 1 Insight on the actual hit target (a NEW target becomes the bearer). A talent's own damage must NOT trigger it (weaponOnly).
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

- [ ] **2bAB-1 — Flame Surge — Cragdrake Alpha AND Hazewyrm Elder** — use it, click a point → ⚑ The burst now places, saves and rolls ITSELF (10 ft at boss rank, Athletics vs Red, 2d8 energy, half on a success) — before this it was a text card whose use resolved nothing.
- [ ] **2bAB-2 — Crownox Ring — Shield Wall** — hit an ox that stands adjacent to 2+ ring-mates → ⚑ The half-1d6 pre-reduction applies by itself and is named in chat (the card's claim is finally true again).
- [ ] **2bAB-3 — Crownox Ring — Retributive Guard** — damage an ox while a ring-mate stands adjacent → ⚑ NEW SHAPE: the retaliate PROMPT now posts by itself from the damage (1 Focus → White vs Spiritual → 1d6 spirit, contest through the core) — the old gm-cue told you to "use the item", which did nothing.
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
