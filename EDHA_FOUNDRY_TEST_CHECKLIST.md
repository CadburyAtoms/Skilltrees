# Edha — Foundry Test Checklist (Black + White + Blue + Green + Destruction + Sovereignty + Death + Civilization)

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

---

# Sovereignty (Verdannis, deity) (2026-07-01 — the damage-die-step lifecycle; **prose-only data change → ⟳ Sync**)

## 0. Setup
- [ ] Full **relaunch** (engine changed); console shows `exalted` + `diminished` in the custom-status registration line.
- [ ] **⟳ Sync Talents** on the Sovereignty PC (the 7 die-step cards were re-worded "die size for all tests" → "damage die size"; pack rebuilt with `foundry-build deity` on the Foundry machine).
- [ ] In combat: a Sovereignty PC (Black + White ranks, Investiture) + one allied PC + several enemies, at least one whose weapon damage uses a ladder die (d4–d12) and one with an off-ladder die (e.g. flat or d20) to confirm it's left alone.

## 1. The die-step primitive (the spine) ⚑
- [ ] **Censure** (1 Inv) on a targeted enemy → rolls Black vs its **Cognitive** defense; on a **success only**, the enemy gains the **Diminished** icon and its next damage roll's dice are stepped DOWN one (e.g. 2d8 → 2d6, visible in the roll breakdown). On a fail: verdict card, **no icon, no step**.
- [ ] A **d4** weapon stays d4 (floor); dice off the d4–d12 ladder are untouched.
- [ ] **Exalt** (1 Inv) on a targeted ally → **Exalted** icon; their damage dice step UP one (d8 → d10, max d12).
- [ ] Both timed effects **expire after the caster's next turn** (the sweep clears the entry + icon; convention: "start of your next turn" lands end-of-owner-next-turn — one turn generous).
- [ ] Buff + debuff entries **stack** (Exalt + Sovereign's Balance on the same ally = net +2 steps; the d4/d12 clamp is the only rail).

## 2. Scene-length + once-per gates ⚑
- [ ] **Decree of Ruin** (2 Inv) → success = Diminished **for the scene** (survives your turns; clears at combat end); **failure still applies the timed −1**. A second use on the SAME creature this scene is refused **before any cost is paid**.
- [ ] **Investiture of Authority** (2 Inv) → scene-long +1 that **replaces your Exalt entry** on that ally (net stays +1, not +2); once per ally per scene (repeat refused, no cost).
- [ ] **Edict of the Fallen** (2 Inv, 2 Actions) → success = **−2 steps on ATTACK damage only** for the scene (a non-attack talent damage roll is NOT stepped by it); failure = timed −1 on all damage.
- [ ] **Sovereignty** (3 Inv, capstone) → ally +2 / enemy −2 for the scene; a second cast this scene is refused. All scene entries, icons, and once-per stamps **clear at combat end** (deleteCombat).

## 3. The GM-side watchers (Expose / Edict THP / Balance / Sovereignty) ⚑
- [ ] **Expose** — a Censure/Decree-Diminished enemy makes an **attack** (target synced) that **fails** (total < the target's Physical defense) → the owner auto-recovers **1 Investiture** (no cap); if the attack's target is the owner's ally in White range, a **Reactive Strike prompt card** names them (the strike itself is by hand). Confirm NO recovery on a hit.
- [ ] **Expose fallback** — the same enemy makes a **skill test** (no DC readable) → the owner gets a whispered card with an "It failed — recover 1 Investiture" button (owner-judged).
- [ ] **Edict THP rider** — the Edict-marked enemy fails an attack test → each ally in the owner's White range gains **THP = the owner's Tier** (keeps-the-higher, never stacks).
- [ ] **Sovereign's Balance** (2 Inv) — target ONE ally + ONE enemy, then use → both stepped, timed. If the ally **hits** that enemy **in the cast round** (attack total ≥ its Physical defense), both effects **auto-extend one round, once** (card announces it). No extension on a later-round hit.
- [ ] **Sovereignty hit card** — each detected ally→enemy hit posts the "no reactions until the start of its next turn" card (denial itself is GM-enforced).

## 4. Sovereign's Favor + costs
- [ ] **Sovereign's Favor** owned → each **Exalt** also grants the ally **THP = [Tier][Die on White]** (rolled; re-Exalting keeps the HIGHER THP — never stacks). Investiture of Authority does NOT trigger it (literal "when you use Exalt").
- [ ] Every active pays its Investiture through its own use; bad targeting (no enemy / no ally+enemy pair / once-per repeat) warns **without charging**.

## 5. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The damage-die rewrite bakes the formula then steps ladder dice via regex — check a graze roll, a damage roll with riders (Kindle-style bonuses step too: they're the roller's own damage), and that the chat breakdown shows the stepped die.
- [ ] `edhaSovIsAttackItem` (weapon type / `system.attack` / activation "attack") is the Edict scope gate — confirm a real adversary attack matches and a utility talent doesn't.
- [ ] Hit/fail detection reads the synced target's **Physical** defense only (attacks vs Cog/Spi defenses won't auto-resolve — they fall back to the Expose click card / no Balance extension).
- [ ] Player (non-GM) casts write die-steps to GM-owned enemies via the `set-flag`/`toggle-status` relays (a GM must be online); the watchers + sweep run on the GM client.
- [ ] Out-of-combat casts stamp their expiry lazily on the first combat turn change ("owner-next").

---

# Death (Morrath, deity) (2026-07-02 — the Harvested Remains economy; **data changed → ⟳ Sync**)

## 0. Setup
- [ ] Full **relaunch** (engine changed); console shows `harvested` + `decaying` in the custom-status registration line — and both icons render with their **green tint** on a token (if the tint doesn't render, fall back to a distinct icon file — one-row change in `EDHA_STATUSES`).
- [ ] **⟳ Sync Talents** on the Death PC (Death Ward + Necrotic Cascade had their authored events removed and Necrotic Cascade gained an on-item formula → pack rebuilt with `foundry-build deity` on the Foundry machine).
- [ ] In combat: a Death PC (Black + Green ranks, Investiture) + one allied PC + several enemies — at least one **Weakened**, one below half HP, and one healthy full-HP enemy (for the Consuming Decay gate).

## 1. Reaper's Harvest + the Remains pool (the spine) ⚑
- [ ] Drop an enemy to 0 HP **within the owner's Green Attunement Range** → the owner auto-recovers **1 Investiture**, the corpse gains the green **Harvested** skull (beside the black defeated overlay), and a whispered card shows the running Remains count.
- [ ] A **PC** dropping to 0 does NOT harvest (Ben R2); a **Risen Servant** dropping does NOT harvest (summons dissolve); a drop **outside** Green range does NOT harvest.
- [ ] Healing the same enemy above 0 and re-dropping it harvests **again** (each is a real live→0 crossing) — flag if that plays wrong at the table.
- [ ] With Remains at **cap = tier**, another harvest makes the **oldest fizzle** (its icon clears), count stays at tier.
- [ ] Fresh scene, nothing harvested yet → the pool reads **1** (the scene-start freebie: spend a Remain without ever harvesting). All Remains, icons, and armed flags **clear at combat end** (deleteCombat).

## 2. Withering Touch + Consuming Decay ⚑
- [ ] **Withering Touch** (1 Inv) → arm card posts; your next **weapon** hit auto-deals the talent's [Tier][Die]+Willpower vital on top AND the target gains "**No Healing**" — a heal instance on them lands as **0** ("cannot regain HP" chat line) until the start of your next turn. A **Temp HP grant still lands** (Ben R3). Confirm the rider does NOT fire on a talent (non-weapon) hit, and doesn't fire twice.
- [ ] **Consuming Decay** (2 Inv) → refused **without cost** on: a full-HP un-Weakened target, a target outside Black range, or a target already decaying (one instance per character — even by another Death PC). On a legal target: the green **Decaying** icon appears; at the **start of each of its turns** it takes a fresh [Tier][Die] vital roll and the owner heals **half** (floor). Removing the icon by hand **ends the decay** (no tick next turn).
- [ ] A decay tick that drops the victim to 0 still triggers **Reaper's Harvest / Necrotic Cascade** (the tick suppresses only the native on-hit dispatch).

## 3. Bone Garden + Death Ward ⚑
- [ ] **Bone Garden** (1 Inv + 1 Remain) → refused pre-cost with no Remain; click-to-place; a click **outside Green range warns and spends nothing**; cancel spends nothing. Placed: a green 10 ft **square** Region + 🦴 drawing; movement through it costs **×2 (engine-enforced)**; ANY creature — enemy, ally, or the owner (Ben R5) — that **ends its turn inside** takes the baked [Tier][Die] keen (auto-applied). Terrain persists until the GM clears the map (terrain convention).
- [ ] **Death Ward** (2 Inv) on a targeted **ally** → applies freely (card, no roll). On an **enemy** → rolls Black vs its **Spiritual** defense; fail = card, no ward, **cost stays spent**; a repeat on an already-warded target is refused pre-cost.
- [ ] Warded creature takes lethal damage → it lands on **1 HP** (not 0), gains [Tier][Die]+Presence **Temp HP** (rolled fresh), the ward **ends**, and — critically — **no harvest / no cascade** fires on the saved drop. A second lethal hit (ward gone) kills normally.

## 4. Necrotic Cascade + Risen Servant ⚑
- [ ] **Necrotic Cascade** (1 Inv) → arm card ("for the scene"); re-arming the same scene is refused **pre-cost**. While armed, ANY qualifying drop (any killer — an ally's kill, a decay tick, a hazard) within **Black** range → one [Tier][Die] spirit roll applied to **each enemy within 10 ft of the body**. A cascade kill does NOT chain another cascade (but DOES harvest).
- [ ] **Risen Servant** (1 Inv + 1 Remain) → refused pre-cost with no Remain or at **tier** active Servants. Summons a friendly token beside you: HP = [Tier][Die on Green] (rolled), defenses = yours −3, Speed 25, **Bone Strike** rolls Athletics vs Physical then [Tier][Die on Green] keen, Disoriented-immune (Frightened/Compelled are sheet-noted manual), combatant slots onto **your initiative**. Its actor auto-deletes when the token is removed.

## 5. Raise Dead + Speak with the Fallen
- [ ] **Raise Dead** (4 Inv, once/scene) → refused pre-cost on a second use or a target above 0 HP. On use: optional "does a Remain represent them?" confirm (consumes one on Yes); target returns at **1 HP** (defeated overlay self-clears), **Disoriented until the end of ITS next turn**, its combatant moves onto the caster's initiative (GM-side; players get a card note), and the card tells the **GM to add ONE injury** (manual — backlog: an injury-table roller).
- [ ] **Speak with the Fallen** (2 Inv via activation) → prompt: spend a Remain, or "touching ≤24 h remains" (owner-judged); the 3-questions card posts. The Q&A + the +2 Inv repeat cost are table-run (trusted).

## 6. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The **status tint** (`tint` on the CONFIG.statusEffects entry) rendering on token icons — the one genuinely untested Foundry surface in this pass.
- [ ] The defeat watcher keys off a `preUpdateActor` HP stamp (live→0 crossing) — confirm repeat hits on a corpse don't re-harvest, and that a heal-then-drop does.
- [ ] Death Ward's restore runs in the applyDamage **post-pass** on the applying client — confirm the 0→1 flicker doesn't strand the defeated overlay, and that a player applying damage to their own PC can trigger the ward.
- [ ] Bone Garden's square is an axis-aligned rectangle Region — `edhaPointInRegion` uses `region.object.testPoint` for rectangles; confirm end-of-turn detection at the square's edge.
- [ ] Withering Touch fires on any **weapon** hit (melee-ness is owner-judged — the damage path doesn't expose reach); ranged-weapon misuse is a table call.
- [ ] Player (non-GM) flows: Bone Garden relays via the new `bone-garden` socket action; Decay/Ward flags via `set-flag`; Risen Servant still needs actor-create permission (GM casts it otherwise — carried backlog). A GM must be online for all of these.

# Civilization (Kethane, deity) (2026-07-02 — Foundations + the Combat Construct; **data changed → ⟳ Sync**)

## 0. Setup
- [ ] Full **relaunch** (engine changed); console shows the `edha-content.fortified` Region behavior registered ("Edha: Fortified Foundation" appears in the Region behavior type list).
- [ ] **⟳ Sync Talents** on the Civilization PC (Lay Foundation's stale `edha-aoe-template` event was removed; Forge Construct's event note was updated → pack rebuilt with `foundry-build deity` on the Foundry machine).
- [ ] In combat: a Civilization PC (Red + White ranks, Investiture) + one allied PC + several enemies, on a gridded scene with room for 10 ft squares.

## 1. Lay Foundation + Forge Construct (the pre-standard wiring, re-audited) 
- [ ] **Lay Foundation** (Free, 1 Inv) → exactly ONE range-ringed click-to-place per use (the 06-12 takeover); right-click cancels + refunds; beyond White Attunement Range warns + refunds. An ally **beginning its turn** inside gains the +1 all-defenses AE, gone at its next turn start outside. The **tier sustain cap** crumbles the oldest. After Sync, using it does NOT also fire a stray 5 ft template (the stale event is gone).
- [ ] **Forge Construct** (1 Action, 1 Inv) → summons beside you: HP = [Tier][Die white] + tier×2, deflect 1, Speed 25, defenses = yours −2, **Construct Slam** (Athletics vs Physical, [Tier][Die white] impact), slots onto your initiative, carries the baked toggled-off **Siege Form** effect + **Siege Cannon** item. Using it again with a live Construct **dismantles the old one and reforges** (sustain ONE, Ben R1) — non-GM casts need a GM online (dismantle relay). Actor-create permission still required (GM casts for players — carried backlog).

## 2. Tempered Edge + Siege Form ⚑
- [ ] **Tempered Edge** (passive) — a **Construct Slam** hit auto-adds **+[Tier][Die red] energy** (rolled vs the summoner) and bumps the hit by the target's **deflect** value (net: the Slam ignores deflect — chat line names both). Confirm the rider does NOT fire on the Siege Cannon (ranged), and not at all if the summoner doesn't own the talent.
- [ ] **Siege Form** (2 Actions, 1 Inv) → refused **without cost** with no live Construct or when already sieged; on use the baked effect toggles ON (Speed 0, deflect 3) and the card's **"End Siege Form (Free Action)"** button toggles it OFF (owner/GM only). The spec numbers are unchanged (Ben R8).

## 3. Arsenal + Magnum Opus ⚑
- [ ] **Arsenal** (2 Actions, 2 Inv) → refused pre-cost with no live Construct or when already active. On use: the Construct wears the "Arsenal (2 attacks/turn)" indicator AE (cadence trusted). The Construct dropping a character **live→0** whispers the summoner the **chase prompt** (move 15 ft + free Strike — player-executed).
- [ ] **Magnum Opus** (3 Actions, 3 Inv, once/scene) → refused pre-cost on a second use or with no Construct. On use: Construct gains **2×[Tier][Die white]** HP (value AND max), the +2 all-defenses **Colossus** AE (reach 10 ft is a manual note), and every subsequent Construct hit **splashes [Tier][Die red] energy** to each enemy within 10 ft of the target (target INCLUDED, Ben R7a), each rolling **Agility vs your Red** → **Prone** on a fail (engine-rolled, one DC roll). Allies in Foundations now get **+2** (not +1) at turn start (Ben R7b) — confirm an ally camping in a Foundation upgrades on its next turn.

## 4. Bastion + Trade Routes ⚑
- [ ] **Bastion** (2 Actions, 2 Inv) → refused **without cost** with zero Foundations. On use: each Foundation turns red-rimmed "⛨ fortified" with a matching Region; an **enemy entering** (or passing through — tokenMoveIn) takes the baked [Tier][Die red] impact + rolls **Agility vs your Red** → **Slowed** on a fail, clearing at the next turn advance ("until the start of its next turn" — a forced-move entry off-turn clears early, known trade-off). **Allies enter free** (the enter check is disposition-gated). One entry = one hit (the 1 s tokenEnter/tokenMoveIn debounce). A Foundation laid AFTER Bastion comes up fortified (Ben R4). The **Construct standing inside** a fortified Foundation wears +2 all defenses, dropping when it steps out (move-watcher).
- [ ] **Difficult terrain is the native ×2 for EVERYONE** (disposition-blind — Ben R3): the ruler shows ×2 for allies too; GM compensates allied movement by hand. A disposition-filtered cost function is named backlog.
- [ ] **Trade Routes** (1 Action, 1 Inv) → refused without cost with <2 Foundations; two validated clicks (wrong square / same square twice / cancel → refunded); both drawings gain "⇄". The card's **Teleport** button: an ally standing in either linked square jumps to the other (owner moves directly; GM relay otherwise); refused when outside, dead, wrong disposition, or the link crumbled. Once per turn is trusted.

## 5. Bonds of Community (Reaction) ⚑
- [ ] ANY non-summon creature — **enemy, ally, or PC (Ben R5)** — dropping **live→0 inside one of your Foundations** whispers the owner the Reaction prompt. Clicking **"Use Reaction"**: every standing ally inside ANY of your Foundations gains **Temp HP = your White mod** (keeps-higher, no stacking) + **advantage on its next attack test** (the Green `advAttackNext` flag — confirm it fires and consumes on their next attack roll). The dropped creature itself (at 0 HP) is excluded. A drop OUTSIDE every Foundation prompts nothing; a **summon** dropping prompts nothing. One Reaction per round is trusted.

## 6. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The `edha-content.fortified` Region behavior's tokenEnter/tokenMoveIn firing (mirrors the LIVE-verified Fate Snare shape, but new schema) — and whether the 1 s debounce is enough on slow token animations.
- [ ] The Bastion **Slowed expiry** stamps the CURRENT turn coord — confirm it clears exactly at the next turn advance and reads right at the table.
- [ ] `agi` as the Agility skill id in `edhaRollOpposedSkill` (Bastion/Magnum saves) — if the roll comes back flat 1d20, the id is wrong (one-line fix).
- [ ] Magnum's HP write targets `hea.max.override` on the summon (created with an override max) — confirm value AND max both climb by the same amount.
- [ ] The Colossus splash + Tempered Edge rider both key off `edhaDealerOf` — confirm they attribute correctly when the GM clicks Apply on the Construct's damage card (15 s dealer memory).
- [ ] Trade Routes' Teleport for a non-owner-moved token relies on the `move-token` relay (GM online).
- [ ] Player (non-GM) flows: Bastion via `civ-fortify`, links via `civ-link`, reforge via `civ-dismantle` — a GM must be online for all of these; Forge Construct itself still needs actor-create permission.
