# Edha — Foundry Test Checklist (Black + White + Blue + Green + Destruction)

Pending in-Foundry verification for the Black tree-by-tree pass (Isolation + Ritual + Subjugation),
the **complete White tree** — Coordination + Bulwark + Accord — and **Blue / Calculation** (see the
bottom sections). Built + deployed; **not yet live-tested.** Engine detail lives in
`EDHA_FOUNDRY_HANDOFF.md` deltas 2026-06-13b / 06-13c / **06-14 (Coordination) / 06-14b (Bulwark) /
06-14c (Accord) / 06-14d (Calculation) / 06-14e (Illusion) / 06-14f (Foresight)**.

Mark `[x]` as you confirm each. Note anything that misbehaves inline.

---

## 0. Setup (do once)
- [ ] Launch Foundry **fresh** (full relaunch — the engine `register-skills.js` changed across all three sessions).
- [ ] On the test character, click **⟳ Sync Talents** (needed for Isolation + Ritual, which changed talent rules; harmless for Subjugation).
- [ ] Console shows `Edha Content | native event system registered (...)` with the new handler list.
- [ ] Have in a combat: a Black PC (Black ranks, Investiture, focus) + at least one enemy/dummy token. Confirm enemies actually use **focus** (Subjugation needs it).

---

## 1. Isolation (retrofit to the real-hit path + new tools)
- [ ] **Predatory Patience** — attack a **Weakened** creature: the d20 test gains **+1d[your Black die]** (d8 at Black 3); on the damage roll you regain **1 Investiture**.
- [ ] **Predatory Patience** — attack a **non-Weakened** creature: neither the die nor the Investiture triggers.
- [ ] **Predatory Patience** — confirm the +die shows through the **roll dialog** (not just fast-forward).
- [ ] **Sapping Hex** — **hit** an Isolated target → it becomes Weakened; Weakened **auto-expires at the end of its next turn** (watch for the chat line).
- [ ] **Sapping Hex** — **miss** an Isolated target → it does **NOT** become Weakened (the retrofit point).
- [ ] **Sovereign of Solitude** — target a Weakened mover, use as a Reaction → spends 2 Inv, prompts Black-vs-Spiritual, rolls [Tier][Die] vital on a hit, and the target gains **Immobilized** (auto-expires end of its next turn).
- [ ] **Spoils of Isolation / Severance** — regression: still work as before.

## 2. Ritual (HP-cost economy + affliction + heal-cut)
- [ ] **Hardy** — max HP increases by your level (bump current HP up to the new max manually).
- [ ] **Withering Ray** — on use, HP auto-deducts (= half [Die]); chat shows the payment.
- [ ] **Dark Investiture** — on use, HP auto-deducts (= Tier) + 1 Inv; on a **hit** the target gains **Afflicted** and takes **[Tier][Die] vital at the start of each of its turns**.
- [ ] **Dark Investiture** — remove the Afflicted icon → the per-turn damage stops.
- [ ] **Dark Investiture** — confirm the **Model A** feel is wanted (immediate [Tier][Die] on the hit **plus** the ongoing tick). Flag if you want ongoing-only.
- [ ] **Necrotic Grasp** — hit a creature with a Black attack, then heal it → the heal is **halved**, until the end of **your** next turn.
- [ ] **Blood Price** — after paying ritual HP, your **next Black test** rolls with **advantage** (chat confirms it's spent).
- [ ] **Sanguine Reservoir** — the budget bar shows **Reserve X / (Black ranks)**, growing as you pay ritual HP. (Spending Reserve is manual — Scope A.)
- [ ] **Predator's Due** — regression: heal [Tier][Die] + 1 Inv on reducing a creature to 0.

## 3. Subjugation (focus economy + control flags; engine-only, name-based)
- [ ] **Whispered Doubt** — GM spends an **enemy's** focus while it's in your Attunement Range → it loses **1 extra** focus (once/round/enemy).
- [ ] **Coercive Pressure** — a creature in range loses focus → its **next Cognitive (int/wil) test** rolls disadvantage (once/round/creature).
- [ ] **Predatory Insight (passive)** — drop any creature to **0 focus** → you regain **1 focus**.
- [ ] **Predatory Insight (active)** — use it (Special; Opportunity trusted + 1 Inv) → your **next Deception test** rolls advantage.
- [ ] **Siphoned Will** — use **Hollow Command** while owning Siphoned Will → a **focus-confirm chat-card** posts; click it (if the command landed) to regain **[tier] focus**.
- [ ] **Composed** — regression: +tier max focus.
- [ ] **Manual (just confirm the roll/cost fires; control is GM-narrated):** Hollow Command (Deception vs Spiritual + 1 Inv), Puppeteer (Reaction, 2 Focus + 1 Inv), Extract Thought.

---

## Watch-items (couldn't be self-verified; check first if something's off)
- [ ] Test-rider `1d(2 * @skills.black.rank + 2)` resolves to a real die in the test (not an error).
- [ ] Affliction auto-tick actually fires at the **start of the target's turn**.
- [ ] Heal-cut interception actually halves the applied heal.
- [ ] Blood Price / Predatory-Insight advantage detection keys off `roll.data.skill.id` correctly (Black / Deception).
- [ ] Withering Ray's `floor((1d…)/2)` HP cost resolves.
- [ ] **Focus watcher**: `options.edhaFoc` reaches the GM's `updateActor` (it only fires on **GM-initiated** focus changes — enemies spending/hitting 0). Player-initiated PC focus changes won't react (expected).

## Follow-ups (not bugs — pending decisions/work)
- [ ] **Hardy** max-HP effect is only on the **Black** copy; the White/Green copies of Hardy still lack it — sync when those trees come up.
- [ ] Carry-over from earlier deltas (if never formally run): the 2026-06-13 Weakened rework and the 2026-06-11b v3 pass checklist (see the handoff).

---

# White / Coordination (2026-06-14 — engine-only, name-based; **NO pack rebuild**)

The Coordination tree is a Plot Die ("raise the stakes") + ally-support tree. All automation is in
`register-skills.js` keyed by talent NAME (like the Subjugation block) — the talents stay `events:{}`,
so just **F5/relaunch** to load (no ⟳ Sync, no `foundry-build`). Mending Aura is the only data-side
piece (its own `edha-burst` rule, authored earlier).

## 0. Setup
- [ ] **Relaunch Foundry** (engine changed). Console shows `Edha Content | sync API ready …`.
- [ ] In a combat: a **White PC** (White ranks, Investiture, focus) **as a GM-run actor OR with a player online** — the cross-actor watcher posts cards **GM-side**, whispered to the owner. Plus **≥2 ally tokens** (same disposition) in Attunement Range and an enemy token.
- [ ] `applyButtonsTo` = Prioritise Targeted (already forced on load).

## 1. The Plot-Die primitive (`edha.raiseStakes`)
- [ ] Console: `edha.raiseStakes(<select an ally token first>)` → that ally's **next test** rolls a **Plot Die** (raise-the-stakes box pre-checked in the dialog; the die appears on fast-forward too). A chat line confirms it was spent.
- [ ] `edha.raiseStakes(token, "ath")` → the Plot Die only attaches to the next **Athletics** test, persisting across other tests until then (skill-gated).

## 2. Coordination talents
- [ ] **Mending Aura** — Special (Opportunity + 1 Inv): cast → place the [Size] burst → Detonate heals **floor([Tier][Die]/2)** to each ally inside. (Regression — authored earlier.)
- [ ] **Guiding Signal** — 1 Action, 1 Inv: use it → a **grant card** posts listing in-range allies → click one → that ally's **next test** raises the stakes.
- [ ] **Concordant Presence** — passive: an in-range ally makes a skill test → the White PC's player (whispered) gets a **grant card** for that **same skill** → click a recipient ally → a **DC prompt** opens (enter the first ally's test DC) → the Plot Die is granted **only if the first ally met the DC** (a failure posts "no success — no grant"). (One prompt per skill per round.)
- [ ] **Beacon of Stability** — apply a condition to an ally, then **Draw Mana** on the White PC → a **cleanse card** posts → click `Ally: Condition` → spends **1 Inv**, removes that condition. (One condition per Draw Mana.)
- [ ] **Shared Conviction** — an in-range ally rolls a **low** test (Complication or d20 ≤ 10) → the White PC gets a whispered **reaction card** showing `+White mod (rank + WIL) → new total` → click → a **DC prompt** opens → spends **2 Focus + 1 Inv** and reports whether the boost **turns the failure into a success** (or "already meets DC — no boost needed" / "still short of DC X"). Choosing **No DC — judge it** falls back to posting the boosted total.
- [ ] **Pillar of Order** — an in-range ally rolls a **Complication** → the White PC gets a whispered **reaction card** → click → spends **1 Inv**, posts "Complication negated (blank face)".
- [ ] **Unity of Purpose** — MANUAL (aid is untracked): when 2+ allies aid a test, use `edha.raiseStakes(<the testing ally>)` to raise the stakes.
- [ ] **Ordered Advance** — 2 Actions, 1 Inv: use it → a **round note** posts; the no-provoke half-Speed movement is GM-narrated.

## 3. Watch-items (couldn't be self-verified — check first if something's off)
- [ ] Plot Die actually injects via `roll.options.plotDie` on **both** fast-forward and dialog rolls (the dialog "Raise the Stakes" box should arrive pre-checked).
- [ ] `roll.complicationsCount` reads correctly post-roll (fires Pillar of Order / Shared Conviction). A natural-1 d20 (no plot die) should also count as a Complication.
- [ ] Cross-actor grant: clicking a grant button as the **player** sets the flag on **another PC** via the `set-flag` GM relay (needs a GM online).
- [ ] Shared Conviction's `@skills.white.rank + @attr.wil` resolves to the right number on the owner.
- [ ] The whispered cards reach the **owner's player** (not just the GM), and the once/round reaction gate holds.
- [ ] **No GM online** → the GM-side watcher cards (Concordant/Shared/Pillar) won't post (expected); Guiding Signal/Beacon/`edha.raiseStakes` still work from the owner's client.

## 4. Follow-ups / known limits
- [x] "Success" (Concordant) and "would fail" (Shared Conviction) now resolve via a **DC prompt** at the card click (2026-06-15) — the engine compares the ally's total to the entered DC instead of eyeballing it. Foundry tests still carry no built-in DC, so the GM supplies it on the spot (or picks "No DC — judge it"). Shared Conviction still only surfaces on plausible failures (Complication / low d20).
- [ ] Pillar of Order negation is a **tracked chat note** (Complications are a GM narrative resource), not a die re-render (ruling 4).
- [x] **Hardy** (White copy) now has the +level max-HP AE (06-14b). The **Green** copy still lacks it.
- [ ] Reaction economy (1 reaction/round across ALL talents) is only approximated per-talent — GM still tracks the global limit.

---

# White / Bulwark (2026-06-14b — applyDamage wrapper + Hardy AE; **pack rebuilt → ⟳ Sync needed**)

A damage-mitigation tree on the `applyDamage` wrapper. Passives pre-reduce; optional reactions post a
whispered post-damage card (heal-back / redirect / retaliate / revive). Hardy is a data-side AE.

## 0. Setup
- [ ] **Relaunch Foundry**, then **⟳ Sync Talents** on the White PC (Hardy changed the pack — Sync IS needed this pass).
- [ ] In a combat: a **White PC** (White ranks, Investiture) **GM-run or with a player online** (reaction cards post GM-side, whispered to the owner). Allies adjacent / within 10 ft, plus an enemy attacker.

## 1. Hardy (data-side AE)
- [ ] On the White PC's sheet, **Hardy - Max HP** appears on the Effects tab; **max HP = base + level** (nudge current HP up to the new max manually). Inspect-verified at the pack level already.

## 2. Passives (auto pre-reduction)
- [ ] **Shield Wall** — stand the White PC with **≥2 allies adjacent**; attack one of those adjacent allies → its damage is reduced by **floor([Tier][Die]/2)** (chat note). With <2 adjacent allies → no reduction.
- [ ] **Devoted Conduit** — fires **only on Shared Burden's redirected hit** (see below): when the burden-bearer is an in-range ally of a Devoted Conduit owner, the redirected damage is further reduced by floor([Tier][Die]/2).
- [ ] **Guardian Stance** — MANUAL: toggle its +1 Deflect AE on the owner (and the adjacent ally's copy) while an ally is adjacent.

## 3. Reactions (whispered post-damage cards)
- [ ] **Interposing Shield** — an ally **within 10 ft** takes damage → card → spend 1 Inv → ally is healed back **floor([Die]/2)** + "move 10 ft" note.
- [ ] **Shared Burden** — an **adjacent** ally takes D → card → spend 2 Inv → ally healed **floor(D/2)**, owner takes that much (as vital, tagged redirected so Devoted Conduit can cut it).
- [ ] **Retributive Guard** — an **adjacent** ally is hit by an **enemy in your Attunement Range** → card → spend 1 Inv → deal **[Tier][Die] spirit** to the attacker (roll White vs Spiritual first; click on success).
- [ ] **Unbreakable Line** — an **adjacent** ally **drops to 0** → card (1/round) → spend 3 Inv → ally set to **1 HP** (roll White DC = ceil(½ damage); click on success).

## 4. Watch-items (couldn't self-verify)
- [ ] Adjacency (Chebyshev ≤ 1 square incl. diagonals) matches table expectations for the token sizes used.
- [ ] `evaluateSync` rolls the [Tier][Die] reductions in the pre-pass without error.
- [ ] Shared Burden's redirect re-enters the wrapper, Devoted Conduit reduces it, and it does **not** cascade into more reaction cards.
- [ ] Cross-actor card actions (heal an ally, damage the enemy attacker, revive an ally) work when the **owner's player** clicks (relays to the GM via burst-apply when the player lacks perms).
- [ ] Cards post only with a **GM online** (GM-gated watcher).

---

# White / Accord (2026-06-14c — conditions + accords + disadvantage cards; **pack rebuilt → ⟳ Sync**)

The most narrative White tree. Native conditions (Disoriented/Determined) + owner-judged cards.
Unyielding Accord ships a draggable +1 Cog/Spi AE (data-side).

## 0. Setup
- [ ] **Relaunch + ⟳ Sync** the White PC (leyline pack rebuilt for the Unyielding Accord AE).
- [ ] In a combat: a White PC (GM-run or player online — cards are GM-posted, whispered), allies in range, an enemy.

## 1. Conditions & cards
- [ ] **Collective Resolve** — use it → each in-range ally gains the **Determined** icon.
- [ ] **Overwhelming Authority** — target an enemy, use it → card → click → enemy gains **Disoriented**; it **auto-clears at the end of YOUR next turn** (chat note). (No test — a flat apply.)
- [ ] **Counterpoint** — target an enemy, use it (**rolls White**) → a **DC prompt** opens (enter the enemy's influence result) → on **White ≥ DC** it auto-spends **1 Inv**, negates the influence, and Disorients the target (owner-relative expiry); on a miss it posts "the influence stands." **No target / No DC** → falls back to the manual Disorient card.
- [ ] **Voice of Authority** — have an **enemy in range** make an attack → a whispered card posts → spend 1 Inv → the engine keeps the lower of d20-vs-d20 and **rewrites the attack's roll card** to the disadvantaged total ("updated on its roll card"). As a player with no GM-editable message it relays to the GM; if neither works it falls back to reporting the number. Once/round.

## 2. Accord (Terms of Accord + Bound by Word)
- [ ] **Terms of Accord** — use it → card lists in-range characters → click one → both share an accord (chat note; if you also own **Bound by Word**, the note says the partner can use your White modifier).
- [ ] **Bound by Word** — after the accord, have the **partner** make a skill test → they get a whispered card offering your White modifier (`d20 + your mod`) in place of their own → click on an objective test → the engine **rewrites the partner's roll card** to the swapped total ("updated on the roll card"; relays to the GM, or falls back to a reported number). Once/round/skill.

## 3. Manual (no Foundry hook)
- [ ] **Disciplined Mind** — GM-tracked: you + in-range allies reduce the focus cost to resist influence by 1 (min 1).
- [ ] **Unyielding Accord** — drag the **"Unyielding Accord - +1 Cog/Spi"** effect from the talent onto each in-range ally adjacent to another ally; remove it when they no longer qualify.

## 4. Watch-items (couldn't self-verify)
- [ ] Disoriented's owner-relative expiry fires at the end of the OWNER's next turn (not the enemy's), via the `apply-timed-status` relay stamping `expireAfter`.
- [ ] The Voice of Authority re-roll math is right and the GM can act on the reported lower total.
- [ ] The accord flag persists on the partner (set via the `set-flag` relay) and Bound by Word reads it.
- [ ] Determined/Disoriented relays work when a player clicks (target is GM-owned).

---

# Blue / Calculation (2026-06-14d — cognitive control: test (dis)advantage + Disorient; **engine-only, name-based, NO pack rebuild**)

The signature is imposing/granting a (dis)advantage on a creature's **next test**, plus Disorient. Every
talent fires off its own `cosmere-rpg.useItem` on the **owner's own client** (where they hold their target),
so there is **no GM-gating** and the cost is consumed by Foundry's activation — the cards only APPLY the
effect, and "success" is owner-judged (Foundry tests have no DC). New reusable flag:
`flags.edha-content.nextTestMod = { mode, count, skill, source }` (a counted, optional-skill mirror of the
Black `advTest` / `cogDisadv` flags).

## 0. Setup
- [ ] **Relaunch (F5 is enough — no ⟳ Sync; nothing on the talents changed).** Console shows the module loaded.
- [ ] A Blue PC owning the Calculation talents, an enemy token, and (for Anticipate) an ally in range.

## 1. Disadvantage-on-next-test (the core primitive)
- [ ] **Pattern Recognition** — target an enemy, use it (pays 1 Inv) → a whispered card posts → click → the enemy's **next test rolls disadvantage** (a chat note fires when that test happens, then the flag clears). If you had no target, the card says "target the creature, then click".
- [ ] **Probability Cascade** — target an enemy, use it (pays Opportunity + 1 Inv; Opportunity is GM-trusted) → card → click → the enemy's **next TWO tests** roll disadvantage (the consume note counts down "(1 more)" then clears).
- [ ] **False Premise** — target an enemy, use it (rolls **Blue**, pays 1 Inv) → the engine **auto-compares your Blue total to the target's Cognitive defense**: on **≥** it imposes disadvantage on their next test and posts "Blue X ≥ Cog (Y)"; on a miss it posts "no effect". No target / unreadable defense → manual card.

## 2. Advantage + Disorient
- [ ] **Anticipate** — use it (pays 1 Inv) → card lists **you + in-range (Blue) allies** → click one → that character's **next test rolls advantage** (their "resistance test"; GM-judged which roll).
- [ ] **Subtle Suggestion** — target the influenced character, use it (pays 1 Inv) → disorient card → click → target gains **Disoriented** (auto-clears at the end of your next turn via the timed-status pass — see watch-item re: "start" vs "end").

## 3. Counterspell + passives
- [ ] **Counterspell** — target the activating creature, use it (rolls **Blue**, pays 2 Foc + 1 Inv) → the engine **auto-compares Blue vs the target's Cognitive defense** and posts the verdict: on **≥**, "the activated talent fails"; on a miss, "the talent resolves as normal". No target / unreadable defense → reminder note.
- [ ] **Composed** — max focus shows **+tier** (data-side AE, already built; ⟳ Sync if the owned copy is stale).
- [ ] **Baleful** — manual: GM adds +tier focus to the cost of resisting your influence (no Foundry hook).

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] **Contest auto-resolution** (2026-06-15): the skill_test talents (False Premise, Counterspell, Read Intent, Ghostly Walls, Redirect Momentum, Counterpoint) capture their **own Blue/White roll** via the contest-watcher and resolve against the target's defense. Confirm `useItem` fires for these and that the talent's d20 test is the one matched (the resolver matches the roll tied to that use, in either fire order, even through a slow roll dialog). If a talent's roll dialog is **cancelled**, nothing applies (expected — no roll, no contest).
- [ ] `nextTestMod` injects (dis)advantage exactly like the `advTest`/`cogDisadv` flags (pre-roll set + post-roll consume), decrements per test, and clears at 0 — across skill / attack / item rolls.
- [ ] The `set-flag` relay applies `nextTestMod` onto a **GM-owned enemy** when a player clicks.
- [ ] Subtle Suggestion's Disorient lasts the right window (text says "until the **start** of your next turn"; the engine uses the established Disoriented expiry = **end** of your next turn — a one-turn over-extension; see the handoff note for Ben).
- [ ] The "next test" with `skill:null` doesn't accidentally swallow an unrelated roll the target makes before the intended one (it consumes the literal next d20 test of any kind).

---

# Blue / Illusion (2026-06-14e — real `edhaSummon` tokens + Ghostly Walls immobilize; **engine-only, NO pack rebuild**)

A narrative tree; the automatable half spawns **real friendly tokens** via `edhaSummon` (specs built in the
engine; per-talent design signed off before coding). Driven off `useItem` on the owner's client.

## 0. Setup
- [ ] **F5/relaunch** (engine only — no ⟳ Sync, no rebuild). The summoning user needs **ACTOR_CREATE** perm (GM, or a player the GM granted it).
- [ ] A Blue PC owning the Illusion talents, an ally token + an enemy token, in a combat.

## 1. Summons (the real builds)
- [ ] **Phantom Barricade** — use it (1 Inv) → a friendly **"Phantom Barricade"** token spawns next to you with **HP = 2[Die]** (`2d(2·blue rank+2)`), **defenses 0/0/0**, **no attack**, speed 0. Reposition it to block the lane; it survives until HP 0 / scene end. Use again → a second barricade (sustain-multiple).
- [ ] **Phantom Double** — target an ally (or no target = yourself), use it (2 Inv) → a token copying **that creature's art + name** ("… (Illusion)") spawns with **HP 1**; a prior Phantom Double of yours is removed first (max 1). **Deal any damage to it → it auto-deletes** ("the illusion … dissipates" chat line). Perception-vs-Blue-defense + the "advantage vs those who failed" are GM-run (the use-note reminds you).
- [ ] **Holographic Illusion** — use it (1 Inv) → a no-stats **"Holographic Illusion"** token spawns **sized to [Size]** (1 sq at rank 1–2, larger at higher rank). Static; move/edit by hand.
- [ ] **Living Image** — use it → a note: illusions may move/interact; **1 Inv/round upkeep is manual**.

## 2. Ghostly Walls + Redirect
- [ ] **Ghostly Walls** — target an enemy, use it (rolls **Blue**, pays 2 Inv) → the engine **auto-compares Blue vs the target's Cognitive defense**: on **≥** it auto-applies **Immobilized** (move 0), auto-clearing at the **end of YOUR next turn** (not the enemy's), and posts the verdict; on a miss, "no effect". No target / unreadable defense → manual immobilize card.
- [ ] **Absolute Stillness** (own it too) — on a successful Ghostly Walls the target ALSO auto-gains **Weakened** (disadvantage on Physical str/spd tests). "Cannot take Reactions" is GM-tracked.
- [ ] **Redirect Momentum** — target the mover, use it (rolls **Blue**, pays 1 Inv) → the engine **auto-rolls the mover's Athletics** (rank + Strength) and compares: on **Blue ≥ Athletics** it posts "reduce remaining move by [Size] / push [Size] ft" (2.5/5/10/15/20 by Blue rank; GM positions the token); on a miss, "it keeps its momentum". No target → reminder card.

## 3. Manual (no Foundry hook)
- [ ] **Phantom Step** — passive: an ally in range may move +[Size] ft without provoking Reactions (GM-narrated; nothing fires).

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] `edhaSummon` rolls the barricade HP with the right die faces, spawns defenses 0 (defensePenalty 99), and the token sizing (`tokenSizeFt`) lands for Holographic Illusion.
- [ ] Phantom Double copies the chosen creature's token texture (`edhaTokenArt`) and the **delete-on-hit** fires via the updateActor HP-watch (and `edhaClearPhantomDoubles` enforces max 1).
- [ ] Ghostly Walls' `immobilized` expires at the end of the OWNER's next turn (owner-relative stamp overwrites the target-relative auto-stamp), and the Absolute Stillness Weakened rider lands.

---

# Blue / Foresight (2026-06-14f — reuses `nextTestMod` + reminder cards; **engine-only, NO rebuild**) → BLUE TREE COMPLETE

A prediction/initiative tree — mostly manual; the automatable half reuses the Calculation flag. Driven off
`useItem` on the owner's client. **F5/relaunch only.**

## 0. Setup
- [ ] **F5/relaunch** (engine only — no ⟳ Sync, no rebuild). A Blue PC owning the Foresight talents, an enemy in range, in a combat.

## 1. The automated talents
- [ ] **Intercept** — target the designated creature, use it (pays 1 Inv) → card → click → that creature's **next test rolls disadvantage** (`nextTestMod`).
- [ ] **Reactive Analysis** — use it (pays 1 Inv) after an in-range creature fails a test → **your next test rolls advantage** (chat note; consumed on your next test).
- [ ] **Read Intent** — target a creature, use it (rolls **Blue**, pays 1 Inv) → the engine **auto-compares Blue vs the target's Cognitive defense** and posts the verdict; on a **success** it prompts the GM to reveal the creature's intended action (the reveal stays narrative). No target / unreadable defense → reminder note.
- [ ] **Collected** — Cognitive & Spiritual defenses show **+2** (data-side AE, already built; ⟳ Sync a stale owned copy).

## 2. The Calculated Patience toggle
- [ ] Select your token (or pass an actor/name) → console: **`edha.calculatedPatience()`** → your **next test rolls advantage** (a chat note posts). Use it when you take a slow turn.

## 3. Manual (no Foundry hook)
- [ ] **Forewarned** — silently declare a character + action each round; if they take it before your next turn you gain 1 Reaction (GM/player-tracked).
- [ ] **Telepathic Network** — in-range allies join your network for the scene and "share your expertise" (GM-applied).
- [ ] **Probable Outcome** — you may change your fast/slow turn choice after others choose (GM-adjudicated).

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] `nextTestMod` advantage (Reactive Analysis / Calculated Patience) and disadvantage (Intercept) apply and clear correctly on the next test.
- [ ] `edha.calculatedPatience()` resolves the selected token / passed actor and sets the flag.

---

# Red — Momentum + Frenzy (2026-06-15) — NOT yet built/playtested

Engine + authored overlays committed on `claude/red-talent-tree-status-ma7ngx`. This container has no
Foundry install, so `foundry-build.js` + an in-game pass still have to run locally. Movement is
**enforced** here (the forced-movement pilot — see `FORCED_MOVEMENT_PILOT.md`).

## 0. Setup
- [ ] `node scripts/foundry-build.js leyline` (Foundry CLOSED) → `node scripts/validate-packs.js` (expect PASS).
- [ ] Relaunch Foundry; on a **Red** PC click **⟳ Sync Talents**. Console lists handlers incl. `move`, `push`, `rally-stack`.
- [ ] In combat: a Red PC (Red ranks, Investiture, Speed set) + an enemy, with a **wall** nearby for collision tests.

## 1. Momentum — movement enforcement (the pilot)
- [ ] **Reckless Advance** — target a creature, use it → your token **slides toward** it ([Size] ft, stops a half-token short), chat: "moves N ft … ignoring Reactions". With a wall between you → stops at the wall.
- [ ] **Explosive Leap** — use with a target → you leap [Size] ft; chat reminds the 5-ft Prone test (GM-applied).
- [ ] **Unstoppable** — on a **Fast turn**, deal damage → you move **half Speed** toward your target, **once per turn** (second damage same turn does nothing). On a **Slow turn** → no move.
- [ ] **Shockwave Slam** — hit an enemy with a melee **impact** attack → it is **pushed [Size] ft** away; if it hits a wall, chat shows **half [Tier][Die] impact** collision damage and its HP drops.
- [ ] **Volatile Strike** — melee-hit a creature → an optional **"spend 1 Investiture"** card; clicking it adds **half [Tier][Die] impact** to the victim.
- [ ] **Burning Drive** — on a **Fast turn**, your **first** str/spd test gains **+half [Die]**; your 2nd test that turn does not; on a Slow turn, neither.
- [ ] **Momentum's Edge** — move ≥ 20 ft toward a creature this turn, then Strike (impact) → bonus impact **= your Speed**. Moving < 20 ft (or away) → no bonus. *(If the bonus reads 0, `@movement.walk.rate` isn't in roll data — see pilot doc item 1.)*

## 2. Frenzy
- [ ] **Battle Fever** — deal damage → you gain **+1 to your next test** (chat), stacking to **max = Red rank**; the bonus shows in your next d20 breakdown and **clears at the start of your turn**. Allies apply the same +N themselves.
- [ ] **Feeding Frenzy** — `edha.rally(token)` bumps the same stack (cap = rank), **clears at the start of the round**.
- [ ] **Breaking Point** — an enemy in Attunement Range takes damage a **2nd time in a round** → it becomes **Disoriented** (once/round/creature); the first hit does nothing.
- [ ] **Shatter Focus** — target an enemy that failed a test, use it → it **loses 1 focus**.
- [ ] **Emotional Overload** — target a creature, use it → **disadvantage** on its next test (GM: only a non-attack test).
- [ ] **Reckless Gambit** — target a creature, use it → it gains **advantage** on its next test and becomes **Exhausted**.
- [ ] **Reckless Momentum** — use it → **Plot Die** flagged on your next test this turn.
- [ ] **Frenzied Tempo** — on a **Fast turn**, your **Presence** (Influence) tests roll **advantage**; leyline-skill casts are excluded; Slow turn → none.
- [ ] **Incite** — use it → card describing the forced Strike / lose-Reaction (GM resolves the forced action — the one un-automatable bit).

## 3. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] Push/leap respect walls (`CONFIG.Canvas.polygonBackends.move`); if not, they travel full distance (still functional).
- [ ] Pushing a **GM-owned enemy** as a player relays via the `move-token` socket (one GM online).
- [ ] `turnSpeed` flag reads as expected (fast-turn talents fire only on Fast turns).
- [ ] `exhausted` toggles on NPCs (Reckless Gambit) via the relay.

## 4. Conflagration completion + Key (2026-06-15)
- [ ] **Searing Bolt** — already native (skill_test Red attack, auto-consumes 1 Investiture, rolls [Tier][Die] energy). Confirm: using it makes a Red attack, deducts 1 Inv, deals energy, and **triggers Afterburn / Arc Flash / Chain Detonation / Kindle** off that energy damage. (No rider authored — its energy damage is the Conflagration enabler.)
- [ ] **Red Leyline Attunement (Key)** — Draw Mana → recover Tier Investiture **and** your next **Physical (str/spd)** test rolls **advantage** (chat note; consumed on that test). A Cognitive/Influence test in between does **not** consume it. The "lose your Reaction" clause is GM-tracked (no reaction engine).
# Green / Territory (2026-06-16 — enforced difficult terrain + membership; **pack rebuilt → ⟳ Sync**)

## 0. Setup
- [ ] Full **relaunch** (engine changed); console shows the native event system registered.
- [ ] **⟳ Sync Talents** on the Green PC (leyline pack was rebuilt — Apex Predator / Thorn Field / Sudden Growth changed).
- [ ] In combat: a Green PC (Green ranks + Investiture) + ≥3 enemy tokens + an ally token (for Pack Sense).

## 1. Difficult terrain is real & enforced
- [ ] **Green Draw Mana** drops a **Region** (not just a circle): players see a green 🌿 drawing; planning a move **through** it costs **double** (native difficult terrain).
- [ ] The Region carries the **ownership tag** (it counts as "your" terrain below) and can be **dragged** to a point in range.
- [ ] **Sudden Growth** — click-to-place + Detonate drops a [Size] difficult-terrain Region (Opportunity trusted + 1 Inv).

## 2. Thorn Field (passive rider)
- [ ] With **Thorn Field** owned, terrain you create (Draw Mana / Sudden Growth) **also** deals **½[Tier][Die] keen** to creatures that enter / start their turn in it (chat line).
- [ ] **Without** Thorn Field, the same terrain is difficult-only (no damage). Thorn Field's own talent is now passive (no clickable attack).

## 3. Membership talents
- [ ] **Apex Predator** — with **≥3 enemies** standing in your terrain, your **Physical (str/spd)** tests roll **advantage**; drop below 3 → no advantage. Confirm it doesn't override an active disadvantage (e.g. Weakened).
- [ ] **Pack Sense** — an **ally** attacks a target **inside your terrain** → you get a whispered card; spend 1 Inv → the note adds your **Green modifier** to their result.
- [ ] **Spreading Roots** — a creature **ends its turn** in your terrain → whispered card; spend 1 Inv → the **Region grows [Size]** (drawing grows too).

## 4. Conditions (auto on success / on use)
- [ ] **Grasping Vines** — target an enemy in range, use it → target gains **Restrained** (chat note re: maintenance).
- [ ] **Territorial Instinct** — target a fleeing enemy, use as a Reaction → target gains **Immobilized** (auto-expires end of its next turn).

## 5. Watch-items (couldn't self-verify)
- [ ] `modifyMovementCost` actually doubles the planned move cost at the table (and players can see the drawing).
- [ ] Pack Sense reads the attacker's target via synced `user.targets` on the GM client; the card only posts when a GM is online.
- [ ] Spreading Roots resolves the just-ended combatant's token (`combat.previous.turn`) and the grow-terrain relay updates the Region for a player clicker.
- [ ] Immobilized "this turn" lands ~one turn long under the next-turn expiry convention — confirm that's acceptable, else tighten.
- [ ] **Primal Awareness** stays manual (no Surprise/outdoors/track hooks) — confirm that's fine.

---

# Green / Restoration (2026-06-16b — the green-heal trigger family + injuries; **pack rebuilt → ⟳ Sync**)

## 0. Setup
- [ ] Relaunch + **⟳ Sync Talents** on the Green PC (Hardy changed the pack).
- [ ] In combat: a Green PC with Investiture + an injured/below-half **ally** token + an enemy that can apply a condition.

## 1. Hardy (data-side AE)
- [ ] **Hardy** — max HP increases by your level (nudge current HP up to the new max by hand).

## 2. The green-heal trigger (use **Verdant Mend** or **Mender's Instinct** to heal an ally)
- [ ] **Resurgent Growth** — heal an ally → at the **start of your next turn** they regain **tier + Green mod** (chat line), only if still in Attunement Range; move them out of range first → no regrowth.
- [ ] **Vital Surge** — heal an ally that **was below half HP** → whispered card; spend 1 Inv → they gain **½[Tier][Die] Temp HP** (THP keeps the higher if they already had some).
- [ ] **Natural Recovery** — heal a conditioned ally → whispered card lists Afflicted/Disoriented/Stunned/Weakened present → click one → it's removed (Opportunity trusted).
- [ ] Riders fire for **both** Verdant Mend (clickable heal) and Mender's Instinct (reaction heal).

## 3. Reknit Form (enforced injury removal)
- [ ] Target a creature with an **injury Item**, use **Reknit Form** → whispered card lists their injuries with the cost (2 Inv temporary / 3 Inv permanent) → click → the injury is deleted + Investiture spent.
- [ ] A creature with **no injuries** → "no removable injuries" notice (no card).

## 4. Watch-items (couldn't self-verify)
- [ ] Verdant Mend's heal application carries the dealer item so it's detected as green (else the `_edhaLastDealer` fallback catches it).
- [ ] Cross-actor relays: THP via `set-flag` (healing another player's PC) and injury delete via `delete-item` (GM online).
- [ ] Resurgent Growth resolves exactly at the owner's turn start and clears its queue.

---

# Green / Instinct (2026-06-16c — pack tactics; mostly name-based engine **+ a pack rebuild → ⟳ Sync** for Drive the Prey + indicator AEs)

## 0. Setup
- [ ] Relaunch + **⟳ Sync Talents** (the pack was rebuilt: Drive the Prey's Slowed rule + indicator AEs on Predator's Instinct / Packmate's Warning / Natural Order).
- [ ] In combat: a Green PC + ≥1 ally token + an enemy. Confirm the PC owns the Instinct talents being tested.

## 1. Advantage-granting (the `advAttackNext` primitive)
- [ ] **Pack Hunter** — target an enemy, use it → you (and each ally adjacent to that enemy) get **advantage on your next attack** (chat line); the next attack roll shows advantage, then clears.
- [ ] **Scent the Weak** — use it → chat names the **lowest-HP creature in Attunement Range**; your next attack rolls advantage (once/round).

## 2. Forced movement
- [ ] **Drive the Prey** — target an enemy, use it (2 Inv) → the enemy gains **Slowed** (data-side rule on the talent's Events tab; you roll the Green vs Survival; forced move + ally Reactive Strikes are GM-narrated).

## 3. Damage bonuses (applyDamage pre-pass)
- [ ] **Coordinated Hunt** — have an ally attack an enemy this round, then you attack & hit it → your damage gains **+min(#attackers, Green rank)** (chat line names the hunter count).
- [ ] **Pack Pressure** — use it, then Strike during the window (before your next turn) → +[Tier][Die] on the hit; after your next turn starts, the bonus stops.

## 4. Manual (indicator AE on the sheet + reminder on use)
- [ ] **Predator's Instinct / Packmate's Warning / Natural Order** — each shows a toggle-able indicator effect on the sheet (Effects tab) and posts its reminder; the mechanical effects are GM-narrated.

## 5. Watch-items (couldn't self-verify)
- [ ] `advAttackNext` seeds advantage through the roll dialog (not just fast-forward) and clears after one attack.
- [ ] Focus-fire counts the right attackers via synced `user.targets` (GM online); resets each round.
- [ ] Pack Pressure window expires exactly at the start of the owner's next turn.
- [ ] Coordinated Hunt / Pack Pressure apply to the owner's strikes only (ally strikes GM-narrated) — confirm that's acceptable.

---

# Destruction (Razkael, deity) (2026-06-17 — Charge lifecycle + dangerous terrain; **data changed → ⟳ Sync**)

## 0. Setup
- [ ] Full **relaunch** (engine changed); console shows the native event system registered.
- [ ] **⟳ Sync Talents** on the Destruction PC (Set Charge + Fault Line had their authored events removed → pack rebuilt with `foundry-build deity`).
- [ ] In combat: a Destruction PC (Red ranks + Investiture) + several enemy tokens, including one **Construct** (`customType: "Construct"`) and one with **deflect > 0**.

## 1. Set Charge + Detonate (the spine) ⚑
- [ ] **Set Charge** (1 Inv) → click-to-place a marker template; a "Charges set" card appears with **Detonate #n** + **Detonate ALL** buttons. Right-click/Esc cancels → **Inv refunded**.
- [ ] Set more than **tier** Charges → the **oldest fizzles** (marker removed), count stays at tier.
- [ ] **Detonate #n** (Free) → enemies within 10 ft take [Tier][Die] energy + the point becomes a **dangerous-terrain Region** (🔥 drawing, damage on enter / turn-start); the marker is removed.
- [ ] Charges + markers **fizzle at scene/combat end** (deleteCombat clears `charges` + stale templates).

## 2. Pinpoint / Cascading / The Unmooring ⚑
- [ ] **Pinpoint Charge** (Free, 1 Inv) → marks the latest Charge **⊕**; on detonation the **primary** target takes extra [Tier][Die]+Int **keen** and its **deflect is ignored** (hit bumped by its deflect value).
- [ ] **Cascading Failure** (2 Inv) → detonates **all** Charges; a foe caught in **2+** blasts takes an extra [Tier][Die]; with ≥2 Charges the chat notes the zones **merge**.
- [ ] **The Unmooring** (3 Inv, **once/scene**) → all Charges detonate at **15 ft**, **+Int**, **ignore deflect**; second use same scene is blocked.

## 3. Concussive Yield + Fault Line ⚑
- [ ] With **Concussive Yield** owned, **every** Charge detonation rolls **each** caught foe's **Speed vs your Red DC** and applies core **Prone** on a fail (one chat card; engine rolls the foes — confirm it never auto-prones on a success).
- [ ] **Fault Line** (2 Inv) → click a direction; a **60×5 ft line** (rotated-rectangle hazard) deals [Tier][Die]+Str energy, runs the Speed-vs-Red→Prone test, and **Constructs take ×3**. **Watch the rectangle's rotation/anchor** (untested geometry).

## 4. Combustion Chain + Walking Ruin
- [ ] **Combustion Chain** — drop an enemy to **0 HP while it stands in your dangerous terrain** → it **auto-fires** (a fresh 10 ft zone ignites on the body + a "spread your zones 5 ft" card). Confirm it does NOT fire for bodies outside your terrain.
- [ ] **Walking Ruin** — use to toggle ON (chat note); +10 ft Speed is passive (AE). While on, **moving** drops a dangerous-terrain patch at the vacated square (one per move step). Toggle OFF / scene end stops it. **Watch terrain volume** over a long move.

## 5. Watch-items (couldn't self-verify — no Foundry session)
- [ ] Fault Line rectangle Region: rotation about center vs corner, and the one-end-at-caster anchor — adjust the math if the line sits wrong.
- [ ] Deflect-ignore bump assumes `system.deflect.value` and that applyDamage subtracts deflect on energy/keen — verify the net equals "ignores deflect".
- [ ] Construct ×3 detection via `system.customType === "Construct"` — confirm against a real adversary; structures (walls) still have no actor (GM-side).
- [ ] Combustion auto-fire uses the GM-side `updateActor` hp≤0 hook + `edhaTokenInOwnedTerrain` — confirm it reads the body's token position correctly.
- [ ] Player (non-GM) detonation/terrain relays through the `place-hazard-region` + `burst-apply` socket (a GM must be online).
