# Edha — Foundry Test Checklist (Black tree)

Pending in-Foundry verification for the Black tree-by-tree pass (Isolation + Ritual + Subjugation).
Built + deployed + pack-verified; **not yet live-tested.** Engine detail lives in `EDHA_FOUNDRY_HANDOFF.md` deltas 2026-06-13b / 06-13c.

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
