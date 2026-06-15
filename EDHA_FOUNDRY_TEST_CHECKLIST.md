# Edha — Foundry Test Checklist (Black + White + Blue trees)

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
- [ ] **Concordant Presence** — passive: an in-range ally makes a skill test → the White PC's player (whispered) gets a **grant card** for that **same skill** → click the recipient ally **only if the first ally succeeded** → recipient's next test of that skill raises the stakes. (One prompt per skill per round.)
- [ ] **Beacon of Stability** — apply a condition to an ally, then **Draw Mana** on the White PC → a **cleanse card** posts → click `Ally: Condition` → spends **1 Inv**, removes that condition. (One condition per Draw Mana.)
- [ ] **Shared Conviction** — an in-range ally rolls a **low** test (Complication or d20 ≤ 10) → the White PC gets a whispered **reaction card** showing `+White mod (rank + WIL) → new total` → click → spends **2 Focus + 1 Inv**, posts the boosted result. (Owner judges "would fail".)
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
- [ ] "Success" (Concordant) and "would fail" (Shared Conviction) are **owner-judged** — Foundry tests carry no DC (ruling 1c). Shared Conviction only auto-prompts on plausible failures (Complication / low d20); for a borderline test use `edha.raiseStakes` or spend manually.
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
- [ ] **Overwhelming Authority** — target an enemy, use it → card → click → enemy gains **Disoriented**; it **auto-clears at the end of YOUR next turn** (chat note). (Counterpoint works the same — it also rolls White on use.)
- [ ] **Counterpoint** — target an enemy, use it (rolls White) → card → on a success, Disorient the target (owner-relative expiry).
- [ ] **Voice of Authority** — have an **enemy in range** make an attack → a whispered card posts → spend 1 Inv → it reports the attack re-rolled as **disadvantage** (d20 vs d20, keep lower; GM applies the lower). Once/round.

## 2. Accord (Terms of Accord + Bound by Word)
- [ ] **Terms of Accord** — use it → card lists in-range characters → click one → both share an accord (chat note; if you also own **Bound by Word**, the note says the partner can use your White modifier).
- [ ] **Bound by Word** — after the accord, have the **partner** make a skill test → they get a whispered card offering your White modifier (`d20 + your mod`) in place of their own → click on an objective test → posts the swapped result (GM applies the higher). Once/round/skill.

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
- [ ] **False Premise** — target an enemy, use it (rolls **Blue**, pays 1 Inv) → card shows the target's **Cognitive defense** → if your Blue total beat it, click → their next test rolls disadvantage.

## 2. Advantage + Disorient
- [ ] **Anticipate** — use it (pays 1 Inv) → card lists **you + in-range (Blue) allies** → click one → that character's **next test rolls advantage** (their "resistance test"; GM-judged which roll).
- [ ] **Subtle Suggestion** — target the influenced character, use it (pays 1 Inv) → disorient card → click → target gains **Disoriented** (auto-clears at the end of your next turn via the timed-status pass — see watch-item re: "start" vs "end").

## 3. Counterspell + passives
- [ ] **Counterspell** — target the activating creature, use it (rolls **Blue**, pays 2 Foc + 1 Inv) → a whispered reminder card shows the target's Cognitive defense; on a success the activated talent fails (GM adjudicates).
- [ ] **Composed** — max focus shows **+tier** (data-side AE, already built; ⟳ Sync if the owned copy is stale).
- [ ] **Baleful** — manual: GM adds +tier focus to the cost of resisting your influence (no Foundry hook).

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] `useItem` fires for the **skill_test** talents (Counterspell, False Premise) so their cards post (per the 06-14c finding).
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
- [ ] **Ghostly Walls** — target an enemy, use it (rolls **Blue**, pays 2 Inv) → card shows the target's Cognitive defense → click → target gains **Immobilized** (move 0), auto-clearing at the **end of YOUR next turn** (not the enemy's).
- [ ] **Absolute Stillness** (own it too) — on the Ghostly Walls click the target ALSO gains **Weakened** (disadvantage on Physical str/spd tests). "Cannot take Reactions" is GM-tracked.
- [ ] **Redirect Momentum** — use it (rolls **Blue**, pays 1 Inv) → reminder card: Blue vs the mover's Athletics; on a success reduce remaining move by **[Size]** or push **[Size] ft** (2.5/5/10/15/20 by Blue rank; GM applies).

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
- [ ] **Read Intent** — target a creature, use it (rolls **Blue**, pays 1 Inv) → reminder card shows the target's **Cognitive defense**; on a success the GM reveals its intended action.
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
