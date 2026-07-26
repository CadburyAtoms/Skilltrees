# Edha — Foundry Test Checklist (Leylines: Black · White · Blue · Red · Green — Deity: Destruction · Life · Chaos · Fate · Sovereignty · Death · Civilization · Power · Knowledge · Order — ALL 15 TREES)

In-Foundry verification for every wiring pass to date. Engine detail lives in
`EDHA_FOUNDRY_HANDOFF.md` and the per-tree PR bodies. For any tree you can also generate a fresh
per-talent worklist with
`python .claude/skills/leyline-tree-authoring/audit.py <color|deity-name> --checklist`.

**Consolidated 2026-07-18 (Ben's ask):** every row Ben passed at the 07-17 bench is retired, every
fail/partial row is replaced by its 07-17c re-test row, per-section deploy/setup boilerplate is
gone (DEPLOY STATE below is the single source of deploy truth), and cross-section duplicates are
merged. Retired rows and the evidence for each retirement live in the 2026-07-18b handoff delta +
git history — nothing was dropped without a paper trail.

**Ben: don't read this file at the bench — open `EDHA_DASHBOARD.html` in a browser instead
(Bench tab).** It's the same content as a clickable sheet: Pass/Fail/Partial/Skip per row, a note
box, filters, progress counts, and a **Copy for Claude** button that produces the paste-back
report (plus Copy TSV for Excel). Marks save locally in the browser and survive pulls. The
dashboard's other tabs (Art / Worldbuilding / Engine / Repo / ⚑ For Ben) aggregate the sibling
backlog docs.

This MD stays the agents' source of truth: agents edit here, then regenerate the dashboard with
`node scripts/build-dashboard.js` (CI fails if the two drift). Mark `[x]` here only for rows
retired for good; live testing happens on the dashboard.

---

## ⚑ RULE-2b PASS A — Red, the first three talents off the engine (2026-07-24) — NEEDS A PACK REBUILD

> **This is the migration's pipe-cleaner.** Behaviour for three Red talents moved from engine
> name-dispatch onto the talent documents. It changes the PACK, so **nothing below takes effect
> until `deploy-to-foundry.bat` + ⟳ Sync**. The point of the pass is as much the *round trip* —
> do the tabs actually populate, can Ben edit them — as the three mechanics.

- [ ] **2bA-1 — Emotional Overload** — Open the talent in Foundry → **Events tab** → ⚑ A rule is THERE (was empty): `edha-next-test-mod`, mode disadvantage, count 1. This is the whole point — confirm it renders and is editable.
- [ ] **2bA-2 — Emotional Overload** — Target a creature, use it → Target's next test at disadvantage; card names the talent. Behaviour should be IDENTICAL to before — it rides the same nextTestMod pipeline.
- [ ] **2bA-3 — Reckless Gambit** — Events tab → ⚑ **TWO** rules: `edha-next-test-mod` (advantage) + `edha-apply-status` (exhausted). Both must be listed.
- [ ] **2bA-4 — Reckless Gambit** — Target, use → Target gains advantage on its next test AND gains **Exhausted**. Both halves, one use.
- [ ] **2bA-5 — Shockwave Slam** — Melee impact hit → Push card still reads **"Shockwave Slam"** (not "Push"). Its note now comes from the document; a regression here means the note field didn't survive the build.
- [ ] **2bA-6 — edha-push default** — Author a NEW push rule on any talent, leave Note blank → Card reads **"Push"**, not "Shockwave Slam". (Fixes a talent-specific default baked into a generic handler.)
- [ ] **2bA-7 — the round trip** — Edit one of the new rules in Foundry (e.g. change count 1 → 2), use the talent → The edit actually takes effect. If it doesn't, the whole migration premise is wrong and everything else stops.
- [ ] **2bA-8 — Shattering Blow (Warrior)** — on-hit push → Unchanged — it always carried its own note. Regression check on the default change.
- [ ] **2bA-9 — native handler vocabulary ⚠️** — While in any talent's Events tab, open the handler **type dropdown** and read the whole list → ⚑ Do the SYSTEM's native handlers appear alongside the Edha ones — **Update Actor**, Execute Macro, Grant Items, Modify Attribute, Use Item? And in the EVENT dropdown: **Actor Damaged**, **Actor Updated**, **Activated Modality**, **Actor Long Rested**? No authored talent has ever used one, so this is unproven. Zero risk — just read the dropdowns and report what's listed. **Scope narrowed 07-24i:** this no longer decides "how much of the 8-handler plan is needed" (§9k settled that from the code). It now gates exactly **three** talents whose cheap classification leans on a native type — **Reckless Momentum**, **Risky Behavior**, and **Resilient Hero**'s long-rest flag clear. If natives are absent from the dropdowns, those three drop from bucket 1b to bucket 2; nothing else in the 9/56/136/17 split moves.

> ⚑ **None of the above was verified in Foundry** — no session can launch it. 2bA-7 is the
> one that matters most; if it fails, say so before any further conversion work is planned.
>
> **The 07-24i classification pass added NO new rows here, deliberately** — it changed no behaviour
> (docs + one checker script; nothing to deploy, no pack rebuild). The rows above are still the
> whole outstanding 2b bench surface.

## ⚑ RULE-2b PASS E — H5 action economy + the combat-timing dispatcher (2026-07-24n) — NEEDS A PACK REBUILD

> **Eleven talents, and the first proof that H1 can drive real mechanical payloads.** `edha-cae-grant`
> replaces `EDHA_CAE_USE_GRANTS` + three bespoke hooks; the `edha-combat-timing` event finally has a
> dispatcher (it had none since 07-18). Ratchet **202 → 191**.

- [ ] **2bE-1 — Fast Talker (Agent)** — Events tab, then use it → ⚑ A rule is THERE: `edha-cae-grant`, action ×2. The CAE tracker gains **"Edha: Fast Talker (Spiritual tests)"** with 2 remaining.
- [ ] **2bE-2 — Quick Analysis / Trickster's Hand / Cautious Advance / Backstep** — use each → Same, with their own counts and labels (Backstep is ×1).
- [ ] **2bE-3 — Through the Fray (Leader) ⚠️** — target an ALLY, use it → The **ally's** tracker gains the Reaction, not yours. `target: target` is the field being proved.
- [ ] **2bE-4 — Foresight (Envoy) ⚠️** — start a combat with Foresight owned → +1 Reaction group appears at combat start. **This is the first thing the new `edha-combat-timing` dispatcher has ever run.**
- [ ] **2bE-5 — Sidestep (Hunter)** — start combat in light armour, then again in deflect-2+ armour → Grants the Dodge reaction only in the light case — `whenDeflectBelow: 2`, a silent no-op otherwise.
- [ ] **2bE-6 — Practiced Kata (Warrior)** — start a combat → Still enters **Vigilant Stance**; still skipped while **Surprised**. Now runs on the GM applier rather than owner-side.
- [ ] **2bE-7 — Tactical Ploy (Leader) ⚠️⚠️** — target a creature, use it, roll → On a **success**: target takes **−1d4** on their next test AND **loses a Reaction** on the tracker. On a **failure**: neither. **This is the first talent whose H1 payload is real mechanics rather than card text — if the payload dispatch is broken, this is where it shows.**
- [ ] **2bE-8 — no tracker fallback** — use Fast Talker out of combat (or with CAE disabled) → A plain chat note, no error. The graceful fallback must survive the handler move.
- [ ] **2bE-9 — ⚑ adversary widening** — put an adversary carrying a combat-timing talent into a fight → It now gets its combat-start grant. **Deliberate change** — the retired hooks were gated `type === "character"`; rule-driven dispatch doesn't need that gate. Tell me if you'd rather it stayed PC-only.
- [ ] **2bE-10 — regression: stances** — enter/leave each stance → Unchanged from pass B — Practiced Kata's rewrite touches the same machine.

> ⚑ **Not verified in Foundry.** **2bE-7 is the row that matters most in the whole migration so far**
> — it is the first evidence that H1's success/fail dispatch drives real effects, and 45 talents are
> queued behind that answer. 2bE-4 is second: the combat-timing dispatcher is brand new code.

---

## ⚑ RULE-2b PASS F — eleven gated tests, and three upgrade talents (2026-07-24p) — NEEDS A PACK REBUILD

> **The no-new-handler batch.** Eleven talents move onto `edha-def-test`; three UPGRADE talents
> (Absolute Stillness, Calm Appeal, Resolute Stand) leave the ratchet with no rule of their own,
> carried as `whenOwnsTalent` data on their parent's rule. Ratchet **191 → 177**.
> Two H1 modes get their first authored consumers ever — see 2bF-3 and 2bF-12.

- [ ] **2bF-1 — Counterspell (Blue)** — Events tab, then target + use + roll → ⚑ A rule is THERE: `edha-def-test` blue vs COG. Card prints `Blue N vs <target>'s COG D — SUCCESS/FAIL` and the note gives both outcomes.
- [ ] **2bF-2 — Read Intent (Blue)** — target + use + roll → Public SUCCESS/FAIL card, plus a **whispered** "GM — reveal the action…" note on a success only. ⚠️ The test RESULT is public now; only the reveal is whispered. Say if you want the whole thing back to whisper.
- [ ] **2bF-3 — Redirect Momentum (Blue) ⚠️⚠️** — target a mover + use + roll → **The first authored use of H1's `vs: skill` ever.** The engine must roll the TARGET's Athletics and print `Blue N vs ATH M`. If it silently compares against a defense instead, this is where it shows.
- [ ] **2bF-4 — Ghostly Walls (Blue)** — target + use + roll a success → Target Immobilized until the end of YOUR next turn.
- [ ] **2bF-5 — ⚑ Absolute Stillness (Blue)** — own it, then use Ghostly Walls → The target ALSO gains Weakened. Without the talent, it must NOT. **Absolute Stillness's own Events tab is EMPTY and that is intended** — its rider is a `whenOwnsTalent` rule on Ghostly Walls. Tell me if you'd rather edit it on its own card.
- [ ] **2bF-6 — Ghostly Walls vs an adversary with no written Cognitive defense** — use it → It now **auto-succeeds** (H1 fails open) where the old code offered a manual "Immobilize" button. The button is gone.
- [ ] **2bF-7 — Grasping Vines (Green)** — target + use + roll a success → Target **Restrained**, no timed expiry — the upkeep stays on the card.
- [ ] **2bF-8 — Territorial Instinct (Green) ⚠️** — target + use + roll → `vs: skill` again — engine rolls the foe's **Survival**. Success → Immobilized until the end of ITS next turn.
- [ ] **2bF-9 — Drive the Prey (Green) ⚠️** — target + use + roll → Engine rolls the foe's **Survival**; success → **Slowed**. Move-away + ally Reactive Strikes stay GM-narrated on the note.
- [ ] **2bF-10 — Herding Antlers (the Fellstag)** — run it → Unchanged — adversary abilities are out of 2b's scope and it kept the engine path. A regression here means the split broke.
- [ ] **2bF-11 — Incite (Red) ⚠️** — target + use + roll → **Behaviour change, deliberate.** It used to just POST "on a success…" and resolve nothing. It now runs Intimidation vs Spiritual and prints SUCCESS/FAIL. Only the forced action stays yours to adjudicate.
- [ ] **2bF-12 — Double Dip (Black)** — target + use + roll a success, then use a Ritual talent on that creature → Target gains the **Double-Dipped** marker; the Ritual talent still offers "pay from Reserve". ⚠️ The mark moved to the engine-wide shape — **two Black casters can no longer both mark the same creature**; the second overwrites. Say if that matters at your table.
- [ ] **2bF-13 — Steadfast Challenge (Envoy)** — target + use + roll a success → Target **Disoriented** AND its next test at disadvantage — **with no click**. The old one-button pick card is gone (it only ever had one candidate).
- [ ] **2bF-14 — ⚑ Calm Appeal (Envoy)** — own it, use Steadfast Challenge → The Calm Appeal line appears on a success, with your Discipline rank filled in. Without the talent it must NOT. **Empty Events tab is intended** — same upgrade-talent pattern as 2bF-5.
- [ ] **2bF-15 — Valiant Intervention (Leader)** — target + use + roll a success → Disadvantage on the target's next test, no click.
- [ ] **2bF-16 — ⚑ Resolute Stand (Leader)** — own it, use Valiant Intervention → Its line appears on a success only. Empty Events tab intended.
- [ ] **2bF-17 — Surecat → Redirect Momentum** — run the adversary's copy → It carries its OWN rule now (it used to ride the PC talent's engine branch). Must behave the same.

> ⚑ **Not verified in Foundry.** **2bF-3 is the row that matters most** — `vs: skill` has never
> run from an authored rule, and 3 talents in this batch plus a large share of the deity trees
> depend on it. 2bF-5 / 2bF-14 / 2bF-16 are the second thing to look at: they are the first test of
> whether an upgrade talent with an empty tab is acceptable to you, or annoying.

---

## ⚑ RULE-2b PASS R — the WHOLE White path, and Pack Sense (2026-07-25) — NEEDS A PACK REBUILD (talents + adversaries)

> Sixteen talents off the ratchet (**124 → 108**): all 15 remaining White names plus Green's Pack
> Sense. **White is the first leyline colour fully clear of rule-2b talents.** Every behaviour
> should be identical to before the pass unless a row says otherwise. New handlers: H26
> `edha-test-react`, H27 `edha-damage-reduce`, H7 `edha-aura`, `edha-pulse`, `edha-cleanse`,
> `edha-move-window`, `edha-designate`, `edha-accord-forge`, and H1's new `vs: prompt-dc` mode.

- [ ] **2bR-1 — Pillar of Order** — an ally in White Attunement Range rolls a Complication → Whispered card as before; click spends 1 Inv and posts the blank-face note. Events tab shows one *Offer a Reaction When Someone Rolls* rule.
- [ ] **2bR-2 — Shared Conviction** — an ally's test rolls a Complication or a kept d20 ≤ 10 → Card offers +your White modifier; click asks for the DC and reports whether the boost saves it; spends 2 Focus + 1 Inv.
- [ ] **2bR-3 — Concordant Presence** — an ally you can SEE tests in range → Grant card once per (skill, round). An ally behind a wall must NOT trigger it (07-12 ruling now lives on the rule as *requireSeen*).
- [ ] **2bR-4 — Pack Sense (Green)** — an ally attacks a creature standing in your difficult terrain → Same card as before (+Green modifier, 1 Inv). A plain skill test (not attack/item) must NOT trigger it.
- [ ] **2bR-5 — Voice of Authority** — an enemy in range makes an attack → Whispered card; click spends 1 Inv, re-rolls the kept d20, keeps the lower, and updates the attacker's roll card. Once per round.
- [ ] **2bR-6 — Collective Resolve** — use it → Every ally in White Attunement Range gains **Determined**, one public note — as before.
- [ ] **2bR-7 — Counterpoint** — target the influencing enemy, use it, roll your White test → GM is prompted for the influence result (DC). Success: −1 Inv, enemy **Disoriented** until end of your next turn. ⚠️ **Two sanctioned drifts:** no target now VETOES the use (was: a manual card), and a DECLINED DC prompt resolves as a success (fail-open, §9m q9) instead of the manual card.
- [ ] **2bR-8 — Guardian Stance** — move an ally adjacent, then apart → Both gain the +1 Deflect effect while adjacent; it auto-removes on separation. Any lingering pre-deploy "Guardian Stance (+1 Deflect)" effect is swept off automatically once.
- [ ] **2bR-9 — Shield Wall** — an enemy damages an ally adjacent to the owner (owner has ≥2 adjacent living allies) → Damage reduced by half [Tier][White Die], same chat note naming the talent. ⚑ Also worth one adversary-owner check (role rank feeds the die — ruling 122).
- [ ] **2bR-10 — Devoted Conduit** — Shared Burden redirects a hit to its owner → Only the REDIRECTED hit is reduced (half [Tier][White Die]); ordinary damage to an in-range ally must NOT be.
- [ ] **2bR-11 — Beacon of Stability** — Draw Mana with a conditioned ally in range → The cleanse card posts (one button per ally-condition); click removes it, −1 Inv. ⚠️ Cosmetic drift: its own card now — no longer a line on the Draw Mana summary card.
- [ ] **2bR-12 — White Leyline Attunement** — Draw Mana → Visible allies in range + you heal Tier HP; hidden / behind-wall skips accounted. ⚠️ Cosmetic drift: posts its own card; the Draw Mana summary card no longer prints a White line.
- [ ] **2bR-13 — Ordered Advance** — use it, then move → The armed-window note, then an allies-within-10-ft half-Speed card on each move this round. (A window armed before this deploy dies with the old flag — re-use once, harmless.)
- [ ] **2bR-14 — Guiding Signal** — use it → The designate card (opposing tokens in White Attunement Range); the next ally testing against the designated token this round gets the Plot Die.
- [ ] **2bR-15 — Terms of Accord** — use it → A pick card of same-side characters in range (⚠️ minor drift: creatures at 0 HP are now skipped); click forges the accord and posts the note — including the modifier share if you own Bound by Word.
- [ ] **2bR-16 — ⚑ Bound by Word** — forge an accord (owning it), then the partner rolls a skill test → The partner's offer card appears, unchanged. **Bound by Word's own Events tab is EMPTY by design** — it is the *shareModIfOwns* gate on Terms of Accord's forge rule (upgrade-talent pattern, declared in the Accord header).
- [ ] **2bR-17 — Adversaries** — Callthief's Counterpoint · Bellwether's / The Reckoning's Ordered Advance → Each now carries its OWN rules (they used to ride the talents' retired name hooks) — behaviour per their stat-block text. Adversary pack + ⟳ Sync required.
- [ ] **2bR-18 — The point of the migration** — open any converted talent → Events → The rule(s) are visible and editable — change a prompt text, confirm the card shows the edit.

> ⚑ **Not verified in Foundry.** **2bR-18 is the premise row.** 2bR-7's two drifts are the only
> deliberate behaviour changes in the pass; everything else must be indistinguishable from before.

---

## ⚑ RULE-2b PASS S — the WHOLE Green path + Overgrowth's Deflect field (2026-07-25) — NEEDS A PACK REBUILD (talents + adversaries)

> Fifteen talents off the ratchet (**108 → 93**): all 14 remaining Green names plus deity/Life's
> Overgrowth. **Green is the second leyline colour fully clear — nothing Green is name-keyed any
> more.** Every behaviour should be identical to before the pass unless a row says otherwise. New
> handlers: H2 `edha-zone` + `edha-zone-hazard` + `edha-zone-react` (the terrain family),
> `edha-adv-attack`, `edha-strike-window`, `edha-damage-bonus`, `edha-unseen-ward`,
> `edha-heal-react`, `edha-remove-injury`, `edha-suppress-veil` (+ the `clearsight` status), and
> two `edha-test-rider` gates (`whenEnemiesInMyZone`, `unlessDisadvantage`).

- [ ] **2bS-1 — Green Leyline Attunement** — Draw Mana → Same click-to-place square (range ring, snap, out-of-range refusal). ⚠️ Cosmetic drift: posts its own card; the Draw Mana summary card no longer prints a Green line.
- [ ] **2bS-2 — Thorn Field** — own it, place terrain (Draw Mana or Sudden Growth) → The square deals ½[Tier][Die] keen on enter / turn-start exactly as before; the visual is labeled "🌿 Thorn Field". Events tab shows the *Zone Hazard Rider* rule — edit the formula, place again, confirm the new dice.
- [ ] **2bS-3 — Fellstag / Briar-Gone Grove (adversaries)** — their Draw Mana / Sudden Wall placements → Thorn Hedge (rival → d6) and the Grove's Thorn Field (boss → d8) keen riders still bake into engine-placed patches — each carries its OWN zone-hazard rule now. Adversary pack + ⟳ Sync required.
- [ ] **2bS-4 — Spreading Roots** — a creature ends its turn in your terrain → Whispered expand offer, once per round; click spends 1 Inv and grows the square [Size].
- [ ] **2bS-5 — Apex Predator** — roll a Physical (str/spd) test with 3+ living enemies in your terrain → Advantage, as before. With 2 enemies: none. A Weakened (disadvantage) roll must NOT be stomped to advantage.
- [ ] **2bS-6 — Pack Hunter** — target an enemy with an adjacent ally, use it → You + each ally adjacent to that enemy gain advantage on their next attack; count card as before.
- [ ] **2bS-7 — Scent the Weak** — use it → Card names the lowest-HP living enemy in Green Attunement Range; your advantage arms once per round. With nobody in range: the "no creatures" card, no grant.
- [ ] **2bS-8 — Pack Pressure** — use it, then Strike → The window card (its text is now the rule's editable note), and +[Tier][Die] on your Strikes until the start of your next turn. (A window armed before this deploy dies with the old flag — re-use once, harmless.)
- [ ] **2bS-9 — Coordinated Hunt** — you AND an ally both hit the same victim in one round → Your hit adds +min(#attackers, Green rank) of its own damage type, with the hunters count on the card. Solo attacks must NOT trigger it.
- [ ] **2bS-10 — Packmate's Warning** — a hidden (or wall-obscured) attacker rolls an attack at an ally within 10 ft of you → The attack roll takes −2 (flavor names the talent). You yourself being targeted must NOT trigger it. The on-use restatement card is now an editable note rule.
- [ ] **2bS-11 — Natural Order** — use it (2 Inv), with a veiled enemy in Green Attunement Range standing in darkness → ⚠️ **NEW ENFORCEMENT (re-litigated off the manual list):** you gain the `clearsight` marker for the scene, and the enemy's auto dark-veil marker stays DOWN while in range (a GM's manual toggle is never fought). Illusions / deception-advantage stay GM-narrated per the card. Clears at combat end.
- [ ] **2bS-12 — Resurgent Growth** — heal an ally with a Green talent → At the start of YOUR next turn they regain tier + Green mod — skipped if they left Green Attunement Range.
- [ ] **2bS-13 — Vital Surge** — heal a below-half creature with a Green talent → Whispered card; click spends 1 Inv, rolls ½[Tier][Die] Temp HP (keeps the higher, never stacks).
- [ ] **2bS-14 — Natural Recovery** — heal a creature carrying Afflicted/Disoriented/Stunned/Weakened with a Green talent → Whispered cleanse card, one button per condition present; the Opportunity cost stays honour-system.
- [ ] **2bS-15 — Reknit Form** — target an injured creature, use it → The injury menu (2 Inv temporary · 3 Inv permanent, death injuries never listed); click spends and deletes the injury.
- [ ] **2bS-16 — Overgrowth vs Life Surge (deity/Life)** — heal with each → Overgrowth still steps +1/+2/+3 Deflect on the healed creature; **Life Surge must NOT** — the rule FIELD is the discriminator now, and this row is the regression that mattered (pass-M trap).
- [ ] **2bS-17 — The point of the migration** — open any converted Green talent → Events → The rule(s) are visible and editable — change a formula or a note, confirm the behaviour/card shows the edit.

> ⚑ **Not verified in Foundry.** **2bS-17 is the premise row; 2bS-16 is the regression row.**
> 2bS-11 is the pass's only deliberate behaviour ADDITION (the veil-suppression half of Natural
> Order was pure narration before); 2bS-1's summary-card line is the only cosmetic drift.

---

## ⚑ 2bAB — THE PRE-DEPLOY AUDIT of the finished migration (2026-07-26) — NEEDS A PACK REBUILD (adversary)

**Not a conversion pass — the ratchet stays 0.** The audit swept the finished migration before its
first deploy and found one real family: **15 bespoke adversary abilities that SHARE a tree
talent's name** had been riding the deleted engine name-keys and were dead (their texts still said
"engine name-keyed"). Each now carries its tree twin's rule on its own item — nothing below has
ever run in Foundry. Re-drag each adversary from the pack first (placed copies are frozen — the
deploy script says so now). Also in the audit, no bench rows needed: lint pass 9 (handler FIELD
names vs the registered schema), the 91-empty-documents classification (87 declared / 4 newly
declared by name / 0 undeclared), the orphan sweep (7 dead declarations deleted), and the deploy
script's branch-echo + engine safety copies.

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

---

## ⚑ RULE-2b PASS AA — THE FINAL PASS: Fate's `ordained` ledger + the whole Blue Illusion branch (2026-07-26) — NEEDS A PACK REBUILD (leyline + deity + adversary)

**Ratchet 4 → 0 — the migration is finished (221 → 0).** Two clusters: the SIXTH and last marker
ledger (`ordained` → `lists.ordained`, one accessor, all five readers followed for free) and
Blue's four. New: **H22 `edha-barrier`** — the engine's first blocks-movement capability, real
Foundry Walls raised around a placed square — plus `edha-illusion-copy`, `edha-illusion-upkeep`,
and two `edha-summon` widenings (`tokenSizeColor`, `placeAt: pick-point`). Engine work is F5-only;
the authored rules are pack-baked. ⚑ **Nothing in this pass has run in Foundry** — walls, the
relay, and the ledger repoint are all bench-unverified.

- [ ] **2bAA-1 — Ordained Ground (the ledger repoint)** — place two squares, then a third with tier 2 → Unchanged behaviour: click-place in range, cap = tier, the oldest fizzles and its template vanishes. ⚑ the list now lives at `flags.edha-content.lists.ordained` — a mid-scene actor from an OLD build keeps a stale `fateOrdained` flag that reads as zero squares; re-place after the sync rather than reporting it as a loss.
- [ ] **2bAA-2 — Weave the Thread (the `linked` annotation)** — with two active squares, use it and link them; then spring a snare within 30 ft of a linked square → The two-square veto still refuses BEFORE cost with fewer than two. The link dialog lists your squares, and the Reactive-Strike prompt fires on a spring near a LINKED one — the annotation has to have survived the repoint.
- [ ] **2bAA-3 — Bulwark Ground (the readers followed)** — an ally begins its turn standing on one of your squares → +1 all defenses AE, Temp HP if Bulwark Ground is owned, and the Aid-at-30-ft card — all three read through the repointed accessor. Attacks against that ally still can't benefit from advantage.
- [ ] **2bAA-4 — Read the Threads (marker-command)** — use it, click "Move …" on an Ordained marker → The slide still works and the template follows. ⚠ a marker card posted BEFORE this deploy carries the old key and will say "That marker is gone" — post a fresh one.
- [ ] **2bAA-5 — Scene end** — end the combat with squares, snares and buffs live → Everything clears: both ledger keys, the templates, the snare Regions, the defense buffs. A missed key here silently leaves a live list at the table, which is the failure this row exists for.
- [ ] **2bAA-6 — Living Image** — open it → **Events tab**; then start your turn with an illusion up → ⚑ TWO rules where the tab was empty: `edha-illusion-upkeep` (config) + `edha-note` (use). The turn-start prompt still whispers with a one-click pay. **Edit `costPer` to 2 and the button must then charge 2** — that is the whole point of the conversion.
- [ ] **2bAA-7 — Holographic Illusion** — Events tab; then use it and click a square in range, and again out of range, and again cancelling → ⚑ ONE `edha-summon` rule. **NEW: it now asks you to click a square** and enforces Blue Attunement Range — the old version spawned it beside you with no range check at all. Out-of-range and cancel must REFUND the Investiture. The token is sized to [Size] off your Blue rank and does NOT join initiative.
- [ ] **2bAA-8 — Phantom Double** — Events tab; use with no target, then on an ally in range, then on an ally out of range → ⚑ ONE `edha-illusion-copy` rule. Belief loop unchanged (each enemy that can see it rolls Perception vs your Cognitive defense; fooled clients stop rendering the original). **NEW: an out-of-range ally refunds the 2 Investiture.**
- [ ] **2bAA-9 — The Seeming — Mistheron AND The Doubled Elder** — use it on each; break the copy → ⚑ Each adversary ability now carries its OWN `use` rule (⟳ Sync Adversaries / re-drag first). Both must still raise the copy and run the belief sweep, and **the cards must name "The Seeming", not "Phantom Double"**. Spearing Beak's / the Grasp's fooled-target rider must still find the belief ledger.
- [ ] **2bAA-10 — Phantom Barricade — H22, the session's build risk** — use it: click a square in range; walk a token into the barrier; attack it to 0; try placing one on top of a creature; end the encounter → ⚑ ALL NEW. Click-placed in Blue range (cancel/out-of-range refunds). **Nothing should be able to move through it** — that is real walls, and it is the first time this engine has ever done it. At 0 HP it is destroyed and the walls come down; an occupied square is refused and refunded; the encounter ending clears it. **Cover is still yours to adjudicate** — deliberately not automated. Report anything the walls do to vision or lighting.

---

## ⚑ RULE-2b PASS Z — Black + heroic, the mop-up before Blue (2026-07-26) — NEEDS A PACK REBUILD (leyline + heroic + adversary)

Ten talents, grouped by BUILD (ratchet 14 → 4 — only Blue's four remain; pass AA is the FINAL
session). New: the `edha-ritual-paid` EVENT + `edha-reserve-bank`, the H17 target-formula
resolver (`@target.recoveryDie`), `edha-focus` `resource: hea` + posted dice, the `whenOnMyList`
watch gate, the config-only veto trio (`edha-focus-guard`, `edha-hp-floor`, `edha-move-veto` —
iron rule 3: all three stay ENFORCED, rule-keyed), `edha-pulse` `who: enemies`/`requireIsolated`,
and the FIRST authored NATIVE rule (Resilient Hero's long-rest clear — 2bA-9 finally runs).
Engine handlers are F5-only; the authored rules are pack-baked.

- [ ] **2bZ-1 — Blood Price** — pay any ritual HP cost (Dark Investiture); roll a NON-Black test, then a Black test → Payment card is lean ("pays N HP"); a separate advantage card arms via nextTestMod. Non-Black test unaffected; the Black test rolls advantage + consume card. ⚠ single-slot (2bI-4): another next-test rider now OVERWRITES a banked Blood Price.
- [ ] **2bZ-2 — Sanguine Reservoir bank** — pay ritual HP; check the sheet → Separate "banked N Reserve (x/cap)" card; the sheet Reserve bar shows (rule-keyed — a re-synced talent is required, ⟳ Sync first).
- [ ] **2bZ-3 — Reserve as Investiture** — open a Spend-Investiture dialog with Reserve ≥ the static cost → The "Pay from Reserve" checkbox appears (now keyed on the banking RULE, not the name) and pays without touching Investiture.
- [ ] **2bZ-4 — Double Dip + ritual pay-from-Reserve** — mark a target, use a ritual talent on it, accept the Reserve prompt → No health lost, NOTHING else fires — no Blood Price advantage, nothing banked (a Reserve payment is deliberately not a ritual-paid event; unchanged behaviour).
- [ ] **2bZ-5 — Galvanize** — target an ally; use → The ally's recovery die ROLL POSTS (NEW — it used to be rolled invisibly) + the focus-gain card. ⚑ the recovery-die read path (`system.recovery.die`) is bench-unverified — if the die is wrong/1d8-always, report what the sheet says.
- [ ] **2bZ-6 — Field Medicine** — target the patient; use (your Medicine roll) → vs DC 15 card; SUCCESS → "heals N" card (patient's recovery die + your Medicine ranks — the die posts); FAIL → focus still spent (note on the card). ⚑ same recovery-die flag.
- [ ] **2bZ-7 — Resuscitation upsell** — Field Medicine success WITH Resuscitation owned; then without → With: the ⚕️ revive line prints. Without: silent. ⚑ Resuscitation's own Events tab is EMPTY BY DESIGN (whenOwnsTalent upsell on Field Medicine's rule — declared, not a bug).
- [ ] **2bZ-8 — Wary** — involuntarily drain the owner's focus (Shatter Focus / Feinting Strike); try to apply Surprised while they hold focus → Reduction card (− Discipline ranks) names Wary; the Surprised AE is vetoed with a toast. Edit `reduceFormula` on Wary's Events tab — the reduction must follow the edit.
- [ ] **2bZ-9 — Resilient Hero** — drop to 0 (holds); drop again (goes down); LONG REST; drop again → Holds at Athletics mod once per long rest. ⚑ **2bA-9, the FIRST authored NATIVE rule**: the long rest itself must clear the spend — if the third drop does NOT hold, the native `update-actor` rule was dropped by schema validation; report it (GM fallback: `actor.unsetFlag("edha-content","resilientSpent")`).
- [ ] **2bZ-10 — Dread Presence (PC + the three adversary copies)** — a Weakened enemy in range drags its token closer to an ally; repeat near the Dirgehound Pack / Cragdrake Alpha / Doubled Elder → Move vetoed with a toast naming the talent. The adversary copies now ride their OWN rule (re-drag or ⟳ Sync Adversaries first) — ranges 30/60/60 ft via role rank.
- [ ] **2bZ-11 — Cold Eyes** — mark a quarry (Seek Quarry); drop it to 0 with damage → Watch note ("choose a new quarry") + quarry entry AND icon cleared + 1 focus. ⚠ three narrowings vs the old hook (benched): only a live→0 CROSSING fires; a PC-type, summon, or Death-Warded quarry no longer triggers it; the victim needs a token. Flag if any bites at the table.
- [ ] **2bZ-12 — Black Leyline Attunement** — Draw Mana with a mix in range: an Isolated enemy, an ally-adjacent enemy, a hidden one, one behind a wall → Summary card is now just "recover N Investiture"; a separate ☠️ pulse card counts ONLY what you can see ("skipped 1 with an ally adjacent"); the GM gets the 🕵️ whisper with hidden/wall counts. Weakened lands on the Isolated visible enemy only.

---

## ⚑ RULE-2b PASS Y — the WHOLE Destruction path + the WHOLE Red path (2026-07-26) — NEEDS A PACK REBUILD (deity + leyline + adversary)

Two-path session: 7 + 3 talents, both trees to ZERO on the ratchet (24 → 14). The `charges`
ledger is REPOINTED onto H3 (`lists.charges`; point-bound entries, fail-open by design — the
snares shape). The Destruction takeover AND the Chaos takeover are gone — system costs +
pre-cost vetoes + refund-on-cancel everywhere. ⚠ "Shatter Focus" is TWO talents (deity/Chaos's
Omen reroll + leyline/Red's focus drain); the old name-keyed takeover ran the Chaos flow for
BOTH, so Red's card never worked — 2bY-11/12 test them separately. New: `edha-zone` kinds
charge/line, `edha-detonate-react`, `edha-reroll-react`, `edha-zone-react` defeat-in-zone,
`edha-place-hazard` mode trail + `spreads`, the `damaged` watch kind, `edha-test-rider`
`unlessSkills`. Engine handlers are F5-only; the authored rules are pack-baked.

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
- [ ] **2bY-11 — Shatter Focus (RED, leyline)** — a character in range fails a test; target it; use → It loses 1 focus (Wary reduces; works on GM-owned foes via the relay). ⚠ pre-2bY this card was UNREACHABLE (the Chaos takeover answered instead, demanding an Omen) — this is the first time it can work; test from a character WITHOUT the Chaos tree.
- [ ] **2bY-12 — Shatter Focus (CHAOS, deity)** — use with no marked target (veto); then target your Omen-bearer after it rolls; mute the auto-prompt, use again → No/unmarked target: refused PRE-COST (nothing spent — the old flow burned the click). Marked: Omen removed, kept d20 rerolls-take-lower, total rewritten. Auto-prompt whispers on an Omen-bearer's roll; Mute silences; a real use re-arms.
- [ ] **2bY-13 — Breaking Point** — an enemy in your Red Attunement Range takes damage twice in one round; a third hit; an ALLY hit twice → 2nd hit: Disoriented (until your next turn starts) + card noting the manual 1 Investiture. 3rd hit: nothing (once/round/creature). Ally: nothing (the retired watcher was enemy-only; the card says "a character" — flip `disposition` on the Events tab if Ben rules the card).
- [ ] **2bY-14 — Frenzied Tempo + scene reset** — Fast turn: an Influence (Presence) test, then a Red/Black CAST; Slow turn: any Presence test. Then end combat on a scene with Charges/trail → Fast+Influence: advantage. Fast+cast or Slow: none (the casts are excluded via `unlessSkills` — black is Presence). Combat end clears `lists.charges`, the legacy flat `charges`, templates, `hazardTrail`/legacy `walkingRuin`, `detonateUsed`.

---

## ⚑ RULE-2b PASS X — the WHOLE Fate path + the Hunter stretch (2026-07-25) — NEEDS A PACK REBUILD (deity + heroic)

The two-ledger tree, all 9 talents to ZERO on the ratchet, plus the Hunter stretch — Tagging Shot + Seek Quarry (the `quarry` flag → an H3 ledger with a token icon) — 35 → 24 in total. The `snares` ledger is
REPOINTED onto H3 (`lists.snares`; point-bound entries, fail-open by design); `ordained` stays
LEGACY behind its accessor ON PURPOSE — do not report its flat flag as a bug. The takeover is
gone — system costs + pre-cost vetoes + refund-on-cancel everywhere; every active talent
click-places, so cancel/out-of-range ALWAYS refunds. New: `edha-zone` kinds ordained/snare/
link-markers, `edha-zone-guard`, `edha-snare-react`, `edha-marker-command`; H3 annotate stamps
`sourceItemUuid` + rider fields. Engine handlers are F5-only; the authored rules are pack-baked.

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
- [ ] **2bX-15 — Seek Quarry (heroic pack)** — use with no target; then with one; then mark a second creature → No target: refused PRE-COST. Marked: `quarry` token icon + card (1/1). A second mark: the OLD quarry's icon clears (cap 1, oldest fizzles). Attacks vs the quarry still auto-advantage; Cold Eyes still fires on its defeat and clears the icon.
- [ ] **2bX-16 — Tagging Shot (heroic pack)** — use (arm); ranged weapon hit; separately arm then MELEE hit → Use: `tagged` icon on YOU (expires end of your next turn). Ranged weapon hit: arm consumed, victim gains the `quarry` icon + ledger card. Melee hit: rule stands down, arm SURVIVES. ⚑ a 0-damage graze is owner-judged.
- [ ] **2bX-17 — Quarry stale state (heroic pack)** — an actor with a PRE-deploy `quarryUuid` flag → The old flag is IGNORED (re-mark once with Seek Quarry) — advantage/Cold Eyes read only the new ledger. Not a bug.

---

## ⚑ RULE-2b PASS W — the WHOLE Death path + the WHOLE Life path (2026-07-25) — NEEDS A PACK REBUILD (deity)

The fourth two-path session: 8 + 5 talents, both trees to ZERO on the ratchet (48 → 35), and the
`remains` ledger repointed onto H3 (the legacy-FLAT sixth; "unset = scene-start freebie, [] =
spent" preserved — the freebie is now a RULE FIELD on Reaper's Harvest, `sceneFreebie`). NO
takeover remains in either tree — system costs + pre-cost vetoes + refund-on-cancel everywhere.
New handlers `edha-ward` / `edha-turn-dot` / `edha-revive` / `edha-mutation` / `edha-regen-grant`;
widenings on H1/H3/edha-focus/edha-damage-bonus/edha-zone(-hazard)/edha-cleanse/edha-redirect.
Engine handlers are F5-only; all the authored rules are pack-baked. Death Ward's activation is
`skill_test` (Black) now — the player rolls the card.

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
- [ ] **2bW-12 — Adaptive Mutation** — use targeting a willing ally; pick each option across creatures → The whispered chooser (three options); the pick bakes onto the creature (one per creature, scene): Bone Spurs +tier keen on melee hits, Venom Glands Afflicted ½[T][D] ongoing vital on melee hits, Dense Tissue +2 Deflect + forced movement refused.
- [ ] **2bW-13 — Apex Form** — use on a mutated ally; check all FIVE → (1) [T][D green] regen at the start of ITS turns; (2) +2 Deflect; (3) +tier vital on its attacks; (4) its adaptation numbers DOUBLE; (5) at scene end the buff clears and it takes ONE auto-created injury.
- [ ] **2bW-14 — Primal Regeneration** — use on an ally; deal it Vital damage; re-use on a mutated ally → Tier+1 at the start of its turns; Vital/Spirit damage ENDS it (card names the talent); with an adaptation the tick is [T][D green]+1.
- [ ] **2bW-15 — Surgical Precision** — heal-test a conditioned ally — full success, then a graze → Success (non-graze): the cleanse card (Weakened/Disoriented/Slowed present on the target, pick one). A graze posts NO cleanse.
- [ ] **2bW-16 — Lifeline** — use targeting an ally; damage them; absorb 0 / some; again same round → Use posts the bond card. On damage: the whispered card with the amount input (up to half). "0" declines free; a real amount lands on you as SPIRIT, the ally heals the amount + [T][D green]. Once per round.
- [ ] **2bW-17 — The point of the migration** — open any converted Death/Life talent → Events → The rule(s) are visible and editable — change the decay fraction, the ward's THP formula, a mutation number, Lifeline's fraction; confirm the behaviour/card shows the edit.

## ⚑ RULE-2b PASS V — the WHOLE Order path + the WHOLE Civilization path (2026-07-25) — NEEDS A PACK REBUILD (deity)

The third two-path session: 7 + 8 talents, both trees to ZERO on the ratchet (63 → 48), and the
`edicts` ledger repointed onto H3 (uuid-keyed entries; proh/sealed ride along). NO takeover
remains in either tree — system costs + pre-cost vetoes + refund-on-cancel everywhere. H21
`edha-summon-effect` built; H3 gained annotate + the prohibition place mode; `edha-redirect`
gained intercept; `edha-zone` gained the foundation/fortify/link verbs. Engine handlers are
F5-only; all the authored rules are pack-baked.

- [ ] **2bV-1 — Edict** — use with no target / self / out of Blue range; then a valid enemy → Bad cases refused **pre-cost**. Valid: the prohibition picker (cancel REFUNDS the 1 Inv — ⚠ drift: charge-then-refund replaces never-charged, net identical); the place card shows the prohibition, the tier cap, Sealed Edict's notarize hint + Lawkeeper's reveal line (only if owned), and the ⚖ Violated button. A repeat cast on the SAME target is legal (its own entry); past the cap the OLDEST fades and its icon clears unless another law still binds it.
- [ ] **2bV-2 — Edict watchers** — bind "move"; walk the target; push it with an engine slide → The walk PROMPTS (once/round, card names Edict); the forced slide does NOT. Same shape for Investiture-spend (engine spends count too) and attack-the-chosen-ally.
- [ ] **2bV-3 — ⚖ Violated** — click it → [T][D blue]+Int spirit (Edict's own formula) + Disoriented until the start of your next turn; entry consumed; a second click no-ops with "already gone".
- [ ] **2bV-4 — Sealed Edict** — use with no unsealed Edict; then with one; violate it → None → refused **pre-cost**. Seal card names the newest unsealed Edict. On violation the violator ALSO tests Discipline vs your Blue (engine-rolled) — failure = +[T][D blue] spirit + Weakened until the end of ITS next turn.
- [ ] **2bV-5 — Verdict** — use vs a creature NOT on your ledger; then vs your Edict-bound target → Not yours → refused **pre-cost** (the shared icon is not enough). Valid: YOU roll Blue on the card (⚠ drift — the takeover auto-rolled) vs its Cognitive; success = the Edict resolves (2bV-3's payload incl. any Sealed rider) + each OTHER enemy within 10 ft rolls Discipline vs your Blue — failures share ONE [T][D blue] spirit roll + Disoriented. Failure = cost spent, court denied.
- [ ] **2bV-6 — Concord** — use with zero Covenants; then with two → Zero → refused **pre-cost**. Valid: the `concord` status (re-use refused while it holds), the card names the pact allies + the Aid grant (manual). Each covenanted ally's FIRST damaging hit on an enemy each round gains +your Presence, same type (once/round PER ALLY, tracked separately; your own attacks never).
- [ ] **2bV-7 — Shoulder the Oath** — a covenanted ally in White range loses HP; click; try again same round → Whispered Reaction card: take floor(D/2) (same type, redirect-marked), the ally heals back min(D, floor(D/2)+White), BOTH gain White-rank Temp HP (keeps-higher). Once per round. Damage fully eaten by Temp HP prompts nothing.
- [ ] **2bV-8 — Lawkeeper's Eye** — an ally attacks your Edict-bound target you can see; then through a wall → Advantage auto-injected; the wall (or a hostile attacker) blocks it. The Edict place card carries the GM-reveal line.
- [ ] **2bV-9 — Final Decree** — use twice; use with no enemy in Blue range; then valid + violate → Repeat + empty net refused **pre-cost**. Valid: picker (cancel refunds 3 Inv), every enemy in range decree-bound (`edict` icon, not counted vs the cap), covenanted allies stand Witness. Resolve with the violator targeted: every active Edict fires individually, ONE shared [T][D white] Temp-HP roll + advantage to each Witness, ONE shared [T][D blue]+Int spirit roll to each enemy within 10 ft of the violator (violator INCLUDED); decree spent.
- [ ] **2bV-10 — Lay Foundation** — use, right-click cancel; use, click in range → Cancel refunds. Valid: the gold 10 ft square; allies beginning their turn inside gain +1 all defenses; past tier the oldest crumbles.
- [ ] **2bV-11 — Bastion** — use with no Foundation; then with one + lay another → None → refused **pre-cost**. Fortified: enemy ENTERING takes the baked [T][D red] impact + Agility vs your Red or Slowed; the Construct inside wears +2; the Foundation laid while Bastion holds comes up fortified; the save card names Bastion (baked label).
- [ ] **2bV-12 — Trade Routes** — use with one Foundation; then link two + teleport → One → refused **pre-cost**. Linked: the ⇄ marks; an ally standing in either teleports to a clicked arrival point (once/turn trusted); every cancel path refunds.
- [ ] **2bV-13 — Siege Form** — use with no Construct / already sieged; then valid + end it → Bad cases refused **pre-cost**. Valid: the baked Siege Form effect toggles ON (Speed 0, deflect 3, Siege Cannon usable); the card's button ends it. ⚑ a Construct summoned BEFORE 07-17 lost the Siege-Cannon gate shim — reforge it once.
- [ ] **2bV-14 — Arsenal** — use with no Construct; then valid; Construct kills a character → None → refused pre-cost; re-arm refused. Armed: the indicator AE (from Arsenal's own Effects tab) rides the Construct; a live→0 kill whispers the 15 ft move + free Strike chase.
- [ ] **2bV-15 — Tempered Edge / Magnum Opus** — Construct Slam a foe with deflect; Siege Cannon; then Magnum + Slam amid enemies → The Slam adds [T][D red] energy AND the deflect bump (ignore-deflect); the Cannon adds NEITHER. Magnum: once/scene pre-cost, +2×[T][D white] HP, +2 defenses, Foundation buff upgrades +1→+2; each Colossus hit splashes [T][D red] energy to enemies within 10 ft of the target (target included) + Agility vs Red or Prone.
- [ ] **2bV-16 — Bonds of Community (regression-adjacent)** — an enemy drops to 0 inside your Foundation; a summon drops → The whispered Reaction card (⚠ drift: a MANUAL HP edit to 0 no longer prompts); click grants every standing ally in your Foundations Temp HP = your White mod + advantage on next attack. The summon must NOT prompt.
- [ ] **2bV-17 — Covenant AE sweep (regression — the 2bV latent-bug fix)** — two PCs covenant; walk in/out of White range → The +1 all-defenses AE appears/disappears on BOTH; partner-damages-partner still posts the break-watch card. This never worked after 07-24u (the key-vs-marker reconcile bug) — first bench of the fix.
- [ ] **2bV-18 — The point of the migration** — open any converted Order/Civ talent → Events → The rule(s) are visible and editable — change the cap formula, a note, the court radius; confirm the behaviour/card shows the edit.

## ⚑ RULE-2b PASS U — the WHOLE Chaos path + the WHOLE Power path (2026-07-25) — NEEDS A PACK REBUILD (deity)

The second two-path session: 5 + 7 talents, both trees to ZERO on the ratchet (75 → 63). No new
ledger; the builds were widenings (H1 `targetList` owner-sweep, H3 `near-victim`/`enemies-range`,
H6 `source: effects`, H13, the armed damage-bonus riders, the `token-move` watch kind) plus three
config-only handlers (`edha-sense-reveal`, `edha-redirect`, `edha-test-aura`). Engine handlers are
F5-only; all 43 rules are pack-baked.

- [ ] **2bU-1 — Spreading Omen** — target an enemy with another enemy ~8 ft from it, use → YOU roll Blue on the card (⚠ drift — the takeover auto-rolled); success = Omen on the target AND on the nearest other unmarked enemy within 10 ft (auto-picked; a "no additional enemy" card when none; the cap refuses past tier). No target → refused, **nothing spent**.
- [ ] **2bU-2 — Unweaving** — use vs a foe carrying an active effect + your Omen → Success = the GM-clickable dispel card (every enabled effect a button; the click deletes it) + the Omen shatters → Disoriented until the start of your next turn. No Omen → dispel card only, no Disorient.
- [ ] **2bU-3 — Cascade Collapse** — 2 bearers in Blue range, 1 beyond it, use → ONE Blue roll; each IN-range bearer gated vs ITS OWN Cognitive — affected: Omen removed + [T][D] spirit + Disoriented; a resister keeps its Omen. The out-of-range bearer is untouched. Empty ledger: cost still spends, "no creatures on the ledger" (parity with the takeover).
- [ ] **2bU-4 — Unravel Everything** — one pre-placed Omen on an ISOLATED foe, then use amid enemies → Fills Omens nearest-first within Blue range up to the tier cap, then detonates EVERY bearer scene-wide: the Isolated one takes 2[T][D] **vital** (no Disorient), the rest [T][D]+AWA spirit + Disoriented; all Omens clear.
- [ ] **2bU-5 — Void Sense** — an Omen-bearer of yours takes damage in Blue range; again same round → +1 Investiture, once per round (⚠ drift — the Blue-range gate is NEW: the card's clause, never enforced before). Through-walls rendering of Omen-bearers still works (now rule-driven).
- [ ] **2bU-6 — Shatter Focus (regression)** — a marked foe rolls a test; react → The auto-prompt still whispers and the reaction still rerolls-take-lower — its takeover is now the Chaos Set's ONLY name. The removed Omen also leaves the H3 ledger (place another to confirm the count).
- [ ] **2bU-7 — Kneel** — use with no target / out of Black range; then in range → Both bad cases refused **pre-cost**. YOU roll Black (⚠ drift); success = Compelled (expires start of your next turn) and the target can only make distance-CLOSING moves (anything else blocked with a warning); you roll attack tests vs Compelled/Frightened/Weakened targets in Black range with advantage (auto).
- [ ] **2bU-8 — Investiture of Command** — use with nothing valid targeted; then 3 allies targeted in Black range → Nothing valid → refused **pre-cost**. Valid: ONE shared [T][D black] roll — each ally gains that Temp HP (keeps-higher, never stacks down) + advantage on its next attack test; you take tier spirit.
- [ ] **2bU-9 — Warlord's Advance** — arm; make a RANGED weapon hit; then a melee one on a near-dead foe → Re-use while armed refused. The ranged hit adds nothing and the arm SURVIVES; the melee hit adds [T][D red] impact in the SAME application — a kill grants tier Temp HP + the 10 ft free-move whisper; a survivor grants advantage on your next Presence test against it (target-bound).
- [ ] **2bU-10 — Momentum of Victory** — use, move + free Strike by hand → The card (move 15 ft + melee Strike player-executed; Opportunity trusted); the next weapon hit adds +tier impact and consumes the arm. ⚠ drift: a re-use while armed is now REFUSED pre-cost (the old arm silently re-charged 1 Inv for nothing).
- [ ] **2bU-11 — Warlord's Fury** — arm; drop a hostile NPC below half, then kill it → Re-arm refused. Below-half +1 (once per victim) and the kill +1 more — the whispered tally card each time; your melee hits add min(tally, 2×tier) of the dealt type. PC/ally/summon drops must NOT count.
- [ ] **2bU-12 — Unstoppable Advance** — arm; get Slowed; drag through two enemy squares → Re-use while active refused. Slowed is shrugged off with a card. Each enemy whose space the drag crosses takes its own [T][D red] impact, once per enemy per activation. The arm ends after your next turn (timed sweep).
- [ ] **2bU-13 — Mantle of the Aspirant** — use; try again; ally rolls in range; take a hit → Once per scene (a repeat refuses even after the statuses clear). +2 all defenses as an AE (auto-cleared at combat end); your melee hits +tier spirit; an ALLY in Black range rolls any d20 test at +1 (you excluded; ⚑ dialog-roll rebuilds, the standing injector caveat); taking damage posts the redirect card — budget min(tier, HP lost), click flow unchanged.
- [ ] **2bU-14 — Crown of Thorns (regression)** — crowned, then use converted Kneel vs Cognitive → Crown still pings — Kneel's H1 test announces to the watch exactly as the takeover's hand call did.
- [ ] **2bU-15 — Predatory Strike (regression)** — Knowledge: armed weapon hit → Still consumes `predprimed`, still adds ×max(Insight,1) vital, still places 1 Insight — the armed damage-bonus widenings (meleeOnly etc.) must not gate rules that don't carry them.
- [ ] **2bU-16 — Compelled cleanup (regression)** — let Compelled expire; move the ex-target → Movement is free again — the veto's mark dies with the status; a stale mark without the status never blocks.

---

## ⚑ RULE-2b PASS T — the WHOLE Knowledge path + the WHOLE Sovereignty path (2026-07-25) — NEEDS A PACK REBUILD (deity)

The first two-path session: 9 + 9 talents, both trees to ZERO on the ratchet (93 → 75). H3b
(Insight as `mode: counter` on `edha-owner-list`) and H9 (`edha-die-step` + `edha-die-step-react`)
built inline per §9m q6/q1. Engine handlers are F5-only; all 44 rules are pack-baked.

- [ ] **2bT-1 — Studied Mark** — use with a creature targeted in Green range → 2 Insight on it (⚑ the stackable status shows count 2 — `system.count` is STILL the bench-verify field) + the whispered snapshot WITHOUT Cognitive defense. No target / self / out of range → refused, **nothing spent**. ⚠️ Cosmetic drift: place and reveal are two cards now.
- [ ] **2bT-2 — Studied Mark (transfer)** — mark creature A, then use on creature B → A drops to 0 Insight and loses the icon; B bears 2.
- [ ] **2bT-3 — Killing Blow** — use with no bearer; then with a bearer carrying 3 Insight → No bearer → refused pre-cost. With bearer: YOU roll the Red test on the card (⚠️ drift — the takeover used to auto-roll); success = ONE [T][D] roll ×3 vital auto-applied to the bearer + ALL Insight cleared; failure = ×1 + exactly 1 removed. Don't hand-apply the card's own damage.
- [ ] **2bT-4 — The Final Study** — succeed once, then use again same scene → Second use refused pre-cost ("already used this scene"). The success card ends with the free-Strike roster naming allies in Green range (or the no-allies line).
- [ ] **2bT-5 — Predatory Strike** — use, then hit with a WEAPON → Arm = `predprimed` token icon + the arm card; re-use while armed refused pre-cost. The hit adds [T][D red] × max(Insight-on-target, 1) vital, consumes the icon, then places 1 Insight on the actual hit target (a NEW target becomes the bearer). A talent's own damage must NOT trigger it (weaponOnly).
- [ ] **2bT-6 — Hunter's Discipline** — hit your bearer yourself; then kill it → Each own hit +Tier vital. On the kill: whispered transfer card offering floor(count/2) to a creature in Green range (only if ≥1).
- [ ] **2bT-7 — Death Mark** — kill the bearer → Transfer card for the FULL count + the PUBLIC per-ally burst card — each ally's button deals [T][D red] (the OWNER's dice) to that player's targeted enemy. Both 2bT-6 and 2bT-7 fire when both talents are owned (R9 — last click wins).
- [ ] **2bT-8 — Accumulate** — start your turn with the bearer in / out of Green range → In range: +1 Insight (cap 5, then silent). Out of range: nothing. The damage→1 Investiture clause (once/round) is unchanged — it was already data-side.
- [ ] **2bT-9 — Pack Share** — arm, then an ALLY hits the bearer inside YOUR Green range → Arm = `packsight` icon + a PUBLIC bearer snapshot (all three defenses); re-arm refused pre-cost. The ally's hit +Tier vital; the FIRST such hit each round places 1 Insight. Your own hits get nothing from it.
- [ ] **2bT-10 — The Pack** — arm alongside Pack Share, ally hits the bearer → +live-Insight-count vital ON TOP of Pack Share's +Tier (R10 additive); its OWN once-per-round placement (R11). At 0 Insight the Pack line simply doesn't post.
- [ ] **2bT-11 — Censure** — target an enemy in Black range, use, roll the Black test → Success vs Cognitive → Diminished, damage die −1 step until your next turn — check an actual damage roll steps down. No enemy target / out of Black range → refused, nothing spent. ⚠️ Deliberate drift: the range gate is the CARD's text, newly enforced (the takeover never checked it).
- [ ] **2bT-12 — Decree of Ruin** — use on the same creature twice in a scene → Success = −1 for the SCENE; failure = −1 until your next turn; either way the second use on that creature is refused pre-cost.
- [ ] **2bT-13 — Edict of the Fallen** — succeed, then have the target FAIL an attack test → −2 steps on ATTACK damage only (a non-attack damage roll is untouched); each failed attack test → your allies in White range gain Tier Temp HP automatically (the rider lives in the LEDGER ENTRY now). Failure = −1 all damage, timed.
- [ ] **2bT-14 — Exalt + Sovereign's Favor** — Exalt a willing ally while owning Favor → Ally +1 step until your next turn AND [T][D white] Temp HP (keeps the higher — does not stack). Favor rides the new `die-step` watch kind: it must fire on Exalt and NOT on Investiture of Authority.
- [ ] **2bT-15 — Investiture of Authority** — Exalt an ally, then Investiture the same ally; repeat Investiture → The Exalt entry is REPLACED by the scene entry (not stacked); the second Investiture on that ally is refused pre-cost.
- [ ] **2bT-16 — Sovereign's Balance** — use with one ally + one enemy targeted; the ally hits the enemy that round → Pair ±1 until your next turn; the hit extends BOTH one round, once, cast round only (the coupling is entry data now — `onPairHit: extend-once`).
- [ ] **2bT-17 — Sovereignty (capstone)** — use; the ally hits the paired enemy; use again same scene → ±2 for the scene; each detected hit posts the no-reactions card; the second use is refused pre-cost (`sceneOnce`).
- [ ] **2bT-18 — Expose** — a Censured/Decreed creature fails an attack; then any non-attack test → Failed readable attack → +1 Investiture auto, and if the attacked ally is in White range, the Reactive Strike card. Non-attack test → the owner-click "did it fail?" card. Must NOT ride Edict's entries (whenKeys censure,decree). Its rules live on the config events — the talent is Always Active.
- [ ] **2bT-19 — regression: the five test talents' cards** — use Censure / Killing Blow etc. → The SYSTEM's use flow runs now (no takeover): cost charged exactly once, the player's test roll is captured by H1, and the card's own damage button is to be IGNORED (engine applies). Watch for double-application.
- [ ] **2bT-20 — regression: Green's damage-bonus riders** — Pack Pressure window + Coordinated Hunt → Unchanged by the require-mode widening — `window` and `pack-on-target` paths, amounts and cards identical to 2bS.

> ⚑ **Not verified in Foundry** — no session can launch it. **2bT-3, 2bT-5 and 2bT-16 matter
> most**: 2bT-3 proves the counter mode + perCounter payload chain, 2bT-5 proves the armed
> damage-bonus mode + the post-pass placement queue, and 2bT-16 proves a bucket-3 "ENGINE-OWNED"
> pair talent really did convert to entry-data couplings.

## ⚑ RULE-2b PASS Q — Reckless Momentum, and the readiness measurement (2026-07-25) — NEEDS A PACK REBUILD

> One talent off the ratchet (**131 → 130**), so there is very little to test — **the deliverable of
> this pass was the measurement, not the count** (audit §9p: the 64 talents that "read ready" are
> 33 short of being convertible at all, and the reason is structural). Reckless Momentum should
> behave **exactly** as it always has; these rows exist to prove that, and to settle one drift.

- [ ] **2bQ-1 — Reckless Momentum — unchanged behaviour** — use it, then roll any test → The Plot Die is rolled on that test, and a card posts naming the talent. Identical to before this pass — if anything at all is different, that is a bug in this pass.
- [ ] **2bQ-2 — Reckless Momentum — the Events tab** — open the talent → **Events** → ⚠️ **The point of the whole migration.** One rule: *Edha: Modify a Next Test (On Use)* with **Also raise the stakes (Plot Die)** ticked and **Who it affects = self**. It should be editable — try changing the label, confirm it sticks. Previously this tab was **empty** and the behaviour was invisible.
- [ ] **2bQ-3 — Reckless Momentum — now matches its card** — succeed on a **Physical** (Str/Spd) test that rolls an **Opportunity** → The Opportunity menu appears with a **Reckless Momentum** button. Click it → your next test rolls the Plot Die. ⚠️ **The interaction CHANGED**: it used to be a bare use of the talent, which checked neither the success nor the attribute and never spent the Opportunity. The card always said it should. An Opportunity on a **Cognitive/Spiritual** test must NOT offer the button.
- [ ] **2bQ-4 — Sharp Eye — the test, then the reveal** — target a creature and use it → You roll **Perception**; the card says SUCCESS or FAIL against their Cognitive defense. **On a success only**, a second whispered card lists *lowest attribute · lowest defense · below half (health/focus/Investiture)*. On a failure you should get **no** reveal card. Same numbers as before this pass.
- [ ] **2bQ-5 — Vital Diagnosis — the snapshot** — target a creature and use it → Two things, as before: the target becomes **Diagnosed**, and a whispered card reports *HP; conditions; defenses — Physical, Cognitive, Spiritual*. Both should still happen.
- [ ] **2bQ-6 — ⚠️ Studied Mark / The Final Study — must be UNCHANGED** — use **Studied Mark** on a creature → Its snapshot card must read **exactly** as it always has, and must still **withhold Cognitive defense**. These talents were not converted this pass, but their card text now runs through the new shared helper — if Cognitive has appeared, or the wording has shifted at all, that is a regression and worth stopping for.

- [ ] **2bQ-7 — Interposing Shield** — have an ally within 10 ft take damage → The whispered card appears offering 1 Inv to reduce it by half a White [Die]. Click it — the reduction lands. The number must never exceed the damage actually dealt. Unchanged from before this pass.
- [ ] **2bQ-8 — Shared Burden / Retributive Guard** — be **adjacent** to an ally who takes damage, once from a hostile attacker → Shared Burden offers 2 Inv to take half in their place. Retributive Guard offers 1 Inv to strike back — but **only** when there is a hostile attacker inside your White Attunement Range. Damage from a fall or a hazard should offer Shared Burden and **not** Retributive Guard.
- [ ] **2bQ-9 — Unbreakable Line — the trigger is narrow** — be adjacent to an ally who **drops to 0** → The card appears only on the drop, not on ordinary damage, shows a DC of half the killing blow, and is **once per round** (a second drop the same round offers nothing).
- [ ] **2bQ-10 — ⚠️ all four — the Events tab** — open Interposing Shield, Shared Burden, Retributive Guard, Unbreakable Line → **Events** → Each shows one *Edha: Offer a Reaction When Someone Takes Damage* rule with its own range/cost/amount/prompt. **Change Shared Burden's cost to 1 Inv and confirm the card says 1** — that is the migration's whole point, and these four had empty tabs before. Put it back to 2.
## ⚑ RULE-2b PASS P — three passives that could never hold a rule (2026-07-24y) — NEEDS A PACK REBUILD

> Four talents off the ratchet (**135 → 131**). The theme is one problem: a talent whose behaviour
> had nowhere to live. The Attunement Keys and Calculated Patience are all **Always Active**, so they
> can never fire a "use" event and literally could not carry a rule — and Forge Construct's summon
> spec had been on its document for months while a hidden gate held it back. Three small builds fix
> all three cases. Mostly this should look like **nothing changed**; the rows that matter are the
> ones where something might have got *worse*.

- [ ] **2bP-1 — Calculated Patience — the normal case** — in combat, declare a **Slow** turn, roll your first test → Advantage, as always. Your **second** test that turn: no advantage.
- [ ] **2bP-2 — ⚠️⚠️ Calculated Patience — OUT of combat** — with **no combat running**, roll any test → **No advantage.** This is the row that matters most: the obvious way to write this gate would have granted advantage on the first test of every out-of-combat scene, silently. If you see advantage here, stop and report it.
- [ ] **2bP-3 — Calculated Patience — the macro is gone** — console: `edha.calculatedPatience()` → **TypeError / not a function.** That is correct — the talent does it by itself now. Also confirm a **Fast** turn gives no advantage.
- [ ] **2bP-4 — Blue Leyline Attunement** — Draw Mana, then roll an **Intellect or Willpower** test → Advantage, as before. A **Strength/Speed** test gets nothing.
- [ ] **2bP-5 — Red Leyline Attunement** — Draw Mana, then roll a **Strength or Speed** test → Advantage. A second card also posts the **"lose your Reaction"** reminder (still GM-tracked — nothing enforces it, same as before).
- [ ] **2bP-6 — ⚠️ Draw Mana — the card changed** — Draw Mana on a Blue or Red character → You now get the **Draw Mana summary card plus a second card** from the Key, where it used to be one clause inside the summary line. Cosmetic, but it is a visible difference — say if the extra card is noise.
- [ ] **2bP-7 — ⚠️ Draw Mana — the other three Keys are untouched** — Draw Mana on **White** (with Beacon of Stability), **Black**, and **Green** → Unchanged in every respect: White heals + the Beacon cleanse card appears, Black Weakens, Green prompts for terrain (and Thorn Field still bakes its keen hazard). These three did **not** move — if any of them changed, that is a bug in this pass.
- [ ] **2bP-8 — Forge Construct — sustain ONE** — with a live Construct, use Forge Construct again → The old one is dismantled and a new one appears — exactly as before.
- [ ] **2bP-9 — ⚠️ Forge Construct — a Construct summoned BEFORE this deploy** — if one is standing from an earlier session, use Forge Construct again → It should still be found and replaced. Older Constructs carry no identity flag, so the engine falls back to matching the summon's name — this row is that fallback.
- [ ] **2bP-10 — Risen Servant — the cap still refuses** — sustain servants up to your tier, then use it again → Refused, **nothing spent** (no Investiture, no Remain), with a message naming the cap.
- [ ] **2bP-11 — Risen Servant — the Remains gate is unchanged** — use it with **no Harvested Remain** → Refused with nothing spent, as before. (Only the *cap* moved this pass; the Remains ledger is untouched.)
- [ ] **2bP-12 — ⚠️ the migration's whole point** — open **Calculated Patience** → Events tab; open **Blue Leyline Attunement** → Events tab; open **Forge Construct** → Events tab and find "How many you can sustain" → All three now show a rule where the tab used to be empty. Change Forge Construct's sustain number to **2**, use it twice → **two** Constructs stand. Put it back to 1.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.
>
> **2bP-2 is the one to actually try.** Everything else in this pass is a like-for-like move; that
> row is the one place a plausible-looking implementation would have been wrong, and it fails
> silently in the direction of a free buff.

---

## ⚑ RULE-2b PASS O — Authority and Pack Hunting BUILT for real (2026-07-24x) — NEEDS A PACK REBUILD

> One talent off the ratchet (**136 → 135**) but the biggest *behaviour* change of the day: you ruled
> "build it" on both, so **three things that never worked now work**, and two of them will refuse uses
> that used to succeed. That is the point — but it is also the thing to watch for at the table.

- [ ] **2bO-1 — ⚠️⚠️ Decisive Command — range is now ENFORCED** — target an ally **more than 20 ft away** and use it (without Authority) → **Refused, with nothing spent** — no focus, no action. Then target one within 20 ft: works normally. ⚠️ This used to work at any distance, so it is a real restriction.
- [ ] **2bO-2 — ⚠️ Authority — the doubling is real** — own Authority, target an ally **between 20 and 40 ft** away → Now **works** (40 ft). Beyond 40 ft it refuses.
- [ ] **2bO-3 — ⚠️ Authority — two allies** — own Authority, target **two** allies, use Decisive Command → **Both** get a command die, and the card names both. Without Authority only the first is affected.
- [ ] **2bO-4 — Decisive Command — still scales** — check the die size with 0 / 1 / 2 / 3 Command upgrades owned → d4 / d6 / d8 / d10, unchanged from 2bN-1.
- [ ] **2bO-5 — ⚠️⚠️ Pack Hunting — the quarry gate** — with a quarry marked, use it on an ally, then have that ally roll **against something that is NOT your quarry** → The bonus does **not** apply, and stays banked. Then have them roll **against your quarry**: it applies. ⚠️ It used to apply to the ally's next roll against *anything*.
- [ ] **2bO-6 — ⚠️ Pack Hunting — no quarry, no spend** — use it with **no quarry marked** → Refused with nothing spent — no focus, no Reaction.
- [ ] **2bO-7 — ⚠️⚠️ Pack Hunting — the DAMAGE roll** — use it, then have the ally roll **damage** against your quarry → The +Survival is added to the **damage** roll and a card says so. This is the half the card always promised and the engine could never do. Also confirm it works on an **attack** roll (either, whichever comes first — not both).

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.
>
> **If 2bO-1 or 2bO-5 feels too strict**, say so — both are enforcing card text that was never enforced,
> so it is entirely possible the table has been playing the looser version for long enough that it
> feels like the real rule.

---

## ⚑ RULE-2b PASS N — your two rulings, and Leader's command dice (2026-07-24w) — NEEDS A PACK REBUILD

> Six talents, ratchet **142 → 136**. Both rows marked ⚠️ are **deliberate behaviour changes you asked
> for** — I want to know if either feels wrong at the table.

- [ ] **2bN-1 — Decisive Command (Leader) ⚠️** — target an ally, use it. Then acquire one, two, then all three of Confident / Demonstrative / Shrewd Command and repeat → The ally gets a command die on their next test, and the die **grows with how many upgrades you own**: none = **d4**, one = **d6**, two = **d8**, all three = **d10**.
- [ ] **2bN-2 — ⚠️ Confident / Demonstrative / Shrewd Command — the ENFORCED skill lists** — use each, then roll a **listed** skill and a **non-listed** one → The die applies **only** on the listed skills — Confident: Intimidation/Leadership/Persuasion · Demonstrative: Athletics/Agility/Leadership · Shrewd: Deception/Insight/Leadership. On anything else it does **not** fire and stays banked. **This is the tightening you ruled** ("1 enforce"); the card used to say honour-system. Demonstrative's Athletics/Agility are the ones most likely to feel different.
- [ ] **2bN-3 — ⚠️ Rousing Presence — Determined now expires** — make an ally Determined, then **end the encounter** → The Determined icon **clears itself** when combat ends. This is your "make it end of combat" ruling; nothing cleared it before. Check an ally who **left the scene** mid-fight also gets cleared.
- [ ] **2bN-4 — Relentless March** — own it, use Decisive Command → Its +10 ft / ignore-Exhausted-Slowed-Surprised reminder still appears on the card. Still a reminder, not automation — as before.
- [ ] **2bN-5 — ⚑ Authority** — own it, use Decisive Command → A line appears saying the talent reaches **40 ft** and may affect **2 allies**. ⚑ **Neither is enforced** — Decisive Command has never had a range check. That is question q13, still open; tell me if you want it built for real.
- [ ] **2bN-6 — ⚑ Nothing else in Leader changed** — glance at Combat Coordination, Valiant Intervention, Tactical Ploy → No behaviour change.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.

---

## ⚑ RULE-2b PASS M — Envoy's cluster, the single-target gate, and an H3 bug (2026-07-24v) — NEEDS A PACK REBUILD

> Eight talents, ratchet **150 → 142**. **2bM-1 is a BUG FIX to something shipped last pass** and is
> the row I'd most like run: H3 was committing the ledger *before* it marked the creature, so a
> Covenant formed with no icon and no +1 AE whenever a player targeted a creature they don't own and
> no GM was connected. It looked exactly like "the talent is broken".
>
> Four of the six Envoy talents carry a **reminder, not a mechanic** — that was true before this pass
> too. Their text is now editable in Foundry instead of being buried in the engine, which is the whole
> gain; don't expect new automation from them.

- [ ] **2bM-1 — ⚠️⚠️ H3 ordering (any ledger)** — as a PLAYER, with **no GM connected**, use **Covenant** on an ally you don't own → It refuses with "a GM must be online… nothing placed" and **no half-formed pact is left behind**. Before the fix the entry was written anyway and then hidden for ever. If a GM is always online at your table, skip — this cannot bite you.
- [ ] **2bM-2 — Rousing Presence (Envoy) ⚠️** — target an ally, use it → The ally becomes **Determined** and the card names them. If nothing happens the use is being swallowed — tell me.
- [ ] **2bM-3 — ⚑ Rousing Presence — the card label** — look at the card wording → It should read **"Determined"**, capitalised properly — not lowercase `determined`. Determined is a native status, and the old lookup missed it.
- [ ] **2bM-4 — Lessons in Patience** — own it, then use Rousing Presence → The ally also **regains 1 focus**, on the same card. This is the one rider in the cluster that is a real mechanic.
- [ ] **2bM-5 — Instill Confidence / Devoted Presence / Stalwart Presence** — own each, use Rousing Presence → Each adds its own reminder line. Owning none adds none; owning all three adds three. These are **reminders** — nothing is applied automatically, exactly as before.
- [ ] **2bM-6 — ⚑ Rallying Shout — a deliberate change** — own it, use Rousing Presence on an ally **above 0 HP** → The reminder **still prints**. It used to print only at 0 HP, which hid the card's first clause ("revive an Unconscious ally"). Tell me if you preferred the old gate.
- [ ] **2bM-7 — ⚑ Rousing Presence — no stray mark on your ally** — after using it, check the ally's flags (or just confirm nothing odd happens when they later take damage) → The ally should **not** be carrying a "marked by you" ownership flag. That flag feeds bonus-damage lookups and had no business being on a friend.
- [ ] **2bM-8 — Withering Ray (Black) ⚠️** — target **two** creatures, use it → Cancelled with **nothing spent**, and a whispered picker lists both; clicking one retargets and re-uses. Then confirm the **HP cost still works** on a normal single-target use — that talent now carries two rules.
- [ ] **2bM-9 — Verdant Mend (Green)** — target two creatures, use it → Same picker, nothing spent. With one target it heals normally.
- [ ] **2bM-10 — ⚑ Both — the picker note** — read the picker card → It carries a short line naming the talent ("hits ONE creature" / "heals ONE creature").
- [ ] **2bM-11 — Galvanize (Envoy) — unchanged** — use it on an ally → Still restores focus equal to their recovery die. It is **deliberately still engine-owned** — its amount is the *target's* die, which no rule can express yet.
- [ ] **2bM-12 — ⚑ Nothing else in Envoy changed** — glance at Foresight and the other Envoy talents → No behaviour change. Foresight was converted back in pass E.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.
>
> **Not a bug if you see it:** Determined never expires. It never did — the card's "until the end of
> the scene" has always been unenforced, and §9m q14 asks whether to build a real scene expiry.

---

## ⚑ RULE-2b PASS L — Order's Covenant ledger (2026-07-24u) — NEEDS A PACK REBUILD

> Two talents, ratchet **152 → 150** — but the real change is that **the whole `covenants` ledger
> moved house**, from `flags.edha-content.covenants` to `flags.edha-content.lists.covenants`, so that
> a rule can read and write it. Covenant and Bear Witness now live on their documents; Shoulder the
> Oath, Concord and Final Decree are still engine code, **reading the same list**.
>
> **2bL-1 and 2bL-2 are the rows that matter.** 2bL-1 proves the pact still forms at all (Covenant
> was a takeover; if nothing happens, the use is being swallowed). 2bL-2 proves the *unconverted*
> talents still see the list — that is the failure mode this whole one-ledger-at-a-time approach
> exists to catch, and it would look like "Concord says I have no Covenants" rather than an error.

- [ ] **2bL-1 — Covenant (Order) ⚠️⚠️** — stand adjacent to a willing ally, target them, use it → The pact forms: ally gains the **Covenant** icon, a card names them, and a **"Break the Covenant"** button appears. If **nothing at all happens**, the use is still being cancelled — stop and tell me.
- [ ] **2bL-2 — ⚠️⚠️ The unconverted readers still see the ledger** — with 1+ Covenant active, use **Concord**, then check **Final Decree**'s card → Concord lists your covenanted allies **by name** and is not refused; Final Decree names them as Witnesses. If either says you have **no Covenants**, the ledger has split in two — stop immediately, this is the one failure that matters.
- [ ] **2bL-3 — Covenant — the pre-cost refusals** — try it (a) with no target, (b) on an **enemy**, (c) on an ally **2+ squares away**, (d) on someone you **already** have a pact with → All four refused with a warning and **no Investiture spent**. These moved from the old takeover into a pre-use guard, so this row confirms they survived the move.
- [ ] **2bL-4 — Covenant — the +1 defenses AE** — form a pact, then walk the two of you into and out of Attunement Range (White) → Both wear a **Covenant (owner)** effect granting **+1 Physical/Cognitive/Spiritual** while in range; it disappears when out of range and comes back.
- [ ] **2bL-5 — ⚑ Covenant — the AE is now EDITABLE** — open Covenant → **Effects** tab → "Covenant — while in range", change a +1 to **+2**, re-form the pact → The applied effect grants **+2**. This is the migration's whole premise for this pass — the number used to be hard-coded in the engine.
- [ ] **2bL-6 — Covenant — the cap and the fizzle** — with tier N pacts already held, form one more → The **oldest** pact dissolves, its ally **loses the icon**, and the card says so. ⚑ If your cap dropped by 2+ at once, **all** the dropped allies lose their icons — the old code only cleared the last one, so this is a **fix**, not a bug.
- [ ] **2bL-7 — ⚠️ Covenant — the SHARED icon (needs two Order PCs)** — have two Order characters both covenant the **same** ally, then have one of them break/fizzle theirs → The ally **keeps** the Covenant icon, because the other pact is still live. Getting this wrong strips the second player's marker silently — it is why the rule carries `multiOwner`.
- [ ] **2bL-8 — Covenant — the break button** — click **"Break the Covenant"** on the card → The pact ends, the icon clears (unless 2bL-7 applies), and the +1 AE goes. Same for the **"It was deliberate"** button after a partner damages a partner.
- [ ] **2bL-9 — ⚑ Covenant — crossing scenes** — form a pact, then move both tokens to a **different scene** → The pact is **still there** (Concord still lists them). Covenant is deliberately not scene-scoped, unlike Charges and Snares.
- [ ] **2bL-10 — Bear Witness (Order) ⚠️** — with 1+ covenanted ally in White range, run **two or three rounds** of combat → At the **start of every round**, each such ally gains Temp HP = your **White rank**, on one card. Not once per combat — every round.
- [ ] **2bL-11 — ⚑ Bear Witness — Temp HP must KEEP THE HIGHER** — give a covenanted ally more Temp HP from another source, then let a round tick → Their Temp HP does **not go down**. Temp HP never stacks, it keeps the larger — if Bear Witness lowers it, the wrong writer is being used.
- [ ] **2bL-12 — Bear Witness — the quiet cases** — let a round tick with (a) no pacts, (b) an ally **out** of White range, (c) an ally at 0 HP → Nothing happens and **no card posts** in any of the three. A card saying "gains 0 Temp HP" is a bug.
- [ ] **2bL-13 — ⚠️⚠️ The combat-timing talents must not fire TWICE** — start a combat while owning **Foresight**, **Sidestep** or **Practiced Kata** → Each grants/enters **once**, exactly as before. Round 1 begins at combat start and this pass added a round-start moment to the same trigger, so a double grant here is the regression to catch.
- [ ] **2bL-14 — ⚑ Bear Witness — mid-combat reload** — in round 3+, refresh Foundry (F5) → Nobody gains a fresh round of Temp HP just for reloading.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.
>
> Two things that are NOT bugs if you see them: **the fizzle now clears every dropped ally's icon**
> (2bL-6), and **Bear Witness needs the owner to be in the combat tracker** — it used to scan all
> characters, and now rides the combat-timing dispatcher, which iterates combatants.

---

## ⚑ RULE-2b PASS K — Destruction's bulk detonations (2026-07-24s) — NEEDS A PACK REBUILD

> Two talents, one new handler, ratchet **154 → 152**. Small on purpose: most of this pass went into
> *scouting* the next three builds before writing them, and two of the three premises turned out to
> be wrong (see the handoff delta).
>
> **2bK-1 is the row that matters** — it proves the talents fire at all. Both were members of a
> cancel-set that made the engine swallow their use, and removing them from it was step one of the
> conversion; if they do nothing now, that is where to look.

- [ ] **2bK-1 — Cascading Failure (Destruction) ⚠️⚠️** — place 2+ Charges, then use it → All active Charges detonate at once, damage rolls per Charge, and the card names the talent. If **nothing at all happens**, the use is still being cancelled — stop and tell me.
- [ ] **2bK-2 — Cascading Failure — the multi-catch** — arrange it so one creature stands inside **two** blast radii → That creature takes an **extra [Tier][Die] energy**, listed separately on the card as "caught in 2 blasts". This is the talent's whole mechanic.
- [ ] **2bK-3 — The Unmooring (Destruction) ⚠️** — place Charges, use it, then try to use it **again the same scene** → First use: every Charge detonates at **15 ft** radius, ignoring deflect, each +Intellect. Second use: refused, **nothing spent**. End the encounter and it is available again.
- [ ] **2bK-4 — ⚑ Both — the empty-list refusal** — use either with **no Charges placed** → Refused with a warning and **no Investiture spent**. The hand-rolled versions checked this before charging you; the check moved to a pre-use guard, so this row is confirming it survived the move.
- [ ] **2bK-5 — Both — the riders still ride** — detonate with **Pinpoint Charge** declared, and (separately) while owning **Concussive Yield** → Pinpoint's extra keen and the Concussive Yield prone-test both still fire. ⚑ Those two talents are **still engine-owned** — H12 wraps their branches rather than removing them, so this row is checking the wrap, not a conversion.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table.
>
> One thing that is NOT a bug if you see it: the card says the dangerous-terrain zones "merge into one
> contiguous hazard". Nothing in the project actually unions Region geometry and nothing ever did —
> it swaps the terrain damage formula and prints a GM instruction, exactly as the hand-rolled version
> did. The field is named `mergeTerrain` and says so in its own tooltip.

## ⚑ RULE-2b PASS J — H6 `edha-prompt-pick`, and three trees clear (2026-07-24s) — NEEDS A PACK REBUILD

> **The engine learned to ASK.** A rule could resolve a test and apply an effect but never offer you
> a choice, which is why 31 "choose one / you may" talents were engine code. Ratchet **164 → 154**,
> and **Blue, Black and Warrior now have no rule-2b talents left at all** — three whole bench passes
> retired.
>
> **2bJ-1 is the load-bearing row.** It is the first time a prompt card's click has run a talent's
> own rules; if it does nothing, every other row in this section is dead too and you can stop.
> **2bJ-8** is the second one to care about — it is the first `turn-start` watch ever to fire.

- [ ] **2bJ-1 — Subtle Suggestion (Blue) ⚠️⚠️** — target a character, use it, then click the button on the whispered card → A card asks whether you influenced them; clicking leaves the target **Disoriented until the end of your next turn**. This is the first prompt-pick click in the project — if the button does nothing, stop here and tell me.
- [ ] **2bJ-2 — Overwhelming Authority (White)** — same as 2bJ-1 → Identical behaviour. The two shared one card function and now carry the same pair of rules; if 2bJ-1 works and this does not, the problem is the talent, not the handler.
- [ ] **2bJ-3 — Pattern Recognition (Blue) ⚠️** — use it on a target, accept, then have them roll a test **this round**; separately, accept and let the **round change** before they roll → Disadvantage on the test this round. After the round changes it **no longer applies**. ⚑ **BEHAVIOUR CHANGE:** the card always said "their next test **this round**" and the old flag waited for ever. Tell me if you'd rather it kept waiting.
- [ ] **2bJ-4 — Probability Cascade (Blue)** — use it on a target and accept → Disadvantage on the target's **next TWO** tests. (The Opportunity is trusted and never deducted, as everywhere else.)
- [ ] **2bJ-5 — False Premise (Blue) ⚠️** — target a character in your Blue Attunement Range, use it, roll Blue → The engine resolves **Blue vs their Cognitive defense** and, on a success, imposes disadvantage on their next test. ⚑ **NO MORE MANUAL CARD:** it used to fall back to a click-card when the defense was unreadable; that path is gone under your fail-open ruling (2bI-8 / 2bH-11), so it now just succeeds. Also check it refuses **out of range, nothing spent**.
- [ ] **2bJ-6 — Anticipate (Blue) ⚠️** — with allies inside your Blue Attunement Range, use it → The card lists **you AND each ally** as separate buttons. Clicking one grants **that** character advantage on their next test. Then try it with **nobody** in range — you should get a short "nobody is in your Telepathic Network" note and no card.
- [ ] **2bJ-7 — Unnerving Approach (Black) ⚠️⚠️** — target an enemy that has its own allies within 10 ft, use it, click one → The card lists **the target's allies** (not yours), and the one you click is pushed **[Size] ft (Black rank) directly away from your TARGET** — not away from you. Check the direction carefully: getting it wrong is the whole point of this row.
- [ ] **2bJ-8 — Puppeteer (Black) ⚠️⚠️** — in combat, let a character at **0 focus** inside your Black Attunement Range begin its turn → You get a whispered offer naming that creature. Clicking spends **2 focus + 1 Investiture** and posts the public "chooses one of its actions" note. First `turn-start` watch ever to run — if no card appears, the watch kind is dead, and 2bJ-9 will tell us which half.
- [ ] **2bJ-9 — Puppeteer — the negative cases** — let a creature begin its turn **with focus**; one at 0 focus **outside** range; **your own** turn start; and accept twice in one round → Nothing for the first three. The second acceptance in a round is refused.
- [ ] **2bJ-10 — ⚑ Puppeteer / Unnerving Approach — the ignored card** — let one of their cards post and **do not click it**; then trigger the talent again the same round → It works again. ⚑ **BEHAVIOUR CHANGE:** the once-per-round budget is now spent when you **click**, not when the card posts, so declining no longer burns the use.
- [ ] **2bJ-11 — Intercept (Blue)** — use it on the creature you designated with Forewarned, accept → Disadvantage on its next test. Whether it really is the Forewarned creature stays your call — Forewarned writes no flag for a rule to read.
- [ ] **2bJ-12 — Feinting Strike (Warrior) ⚠️⚠️** — make the attack and **hit** → The target loses focus equal to your **Intimidation ranks** and its **Reaction is burned on the CAE tracker** — check the tracker, not just the card. This is the row that proves the on-hit dispatcher now runs any rule, and Warrior has nothing else left on the ratchet. On a **graze**, halve the focus by hand as before.
- [ ] **2bJ-13 — Callthief — Overwhelming Authority (adversary)** — run the Callthief's ability → Same offer-then-Disorient as 2bJ-2. It used to work only by borrowing the PC talent's engine branch, which is gone; it is wired on its own document now.
- [ ] **2bJ-14 — Dirgehound Pack — Unnerving Approach (adversary) ⚠️** — run the Dirgehound's ability against a PC with allies nearby → Pick one of the target's allies; it is pushed a **flat 5 ft**, as the card prints. ⚑ **FIX:** it previously borrowed the PC talent's wiring, which scaled the distance off the owner's **Black rank** — a stat no adversary has.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table. If **2bJ-1** fails, every prompt
> row fails with it — say so and stop. If 2bJ-1 passes but **2bJ-8** does not, the prompt half is
> fine and it is the `turn-start` announcement that is broken.
>
> **One question I owe you, and it is the same one from passes F and I:** four talents now ship an
> **empty Events tab** because their line lives on a parent's rule (2bF-5 / 2bF-14 / 2bF-16 /
> 2bI-9 — Absolute Stillness, Calm Appeal, Resolute Stand, Siphoned Will). When you test those rows,
> say whether a bare tab is *acceptable* or merely *tolerable*. It is not a blocker for anything
> above, but it decides a real thing: the whole **Envoy** cluster (Rousing Presence + five talents
> that all say "When you use Rousing Presence…") is ready to convert and would add **five more**
> empty documents. I deliberately did not do it this pass. Answer this and it lands next session.

## ⚑ RULE-2b PASS I — the `watch` kinds + H10, and Black's focus economy (2026-07-24r) — NEEDS A PACK REBUILD

> **H8 learned two new things to watch** — a creature **dropping to 0 HP** and a creature **losing
> focus** — and that took the whole Black focus watcher off the engine in one go. Ratchet
> **171 → 164**. This is also the **first time `scope: scene` has ever run** (pass H built it and
> nothing consumed it), so every row below is load-bearing for the handler, not just for its talent.
> **2bI-1 and 2bI-5 are the rows that matter.**
>
> The three Black passives had to convert together — they were three loops inside one function — so
> if one of them misbehaves, suspect the shared announcement before the individual rule.

- [ ] **2bI-1 — Whispered Doubt (Black) ⚠️⚠️** — in combat, have an **enemy inside your Black Attunement Range spend focus** → It loses **1 additional focus**, with a card. Then make it spend focus again the **same round** — nothing more (once per round per enemy). Next round it works again. This is the first `scope: scene` watch ever to run; if it does nothing, the whole scene half is dead.
- [ ] **2bI-2 — Whispered Doubt — the negative cases** — repeat 2bI-1 with (a) an **ally** spending focus, (b) an enemy **outside** your range, (c) an enemy already at **0 focus** → Nothing, all three times. (c) is silent by design.
- [ ] **2bI-3 — Coercive Pressure (Black) ⚠️** — same trigger — an enemy in range loses focus — then have it roll a **Cognitive (Intellect/Willpower)** test, then a **Physical** one → Disadvantage on the Cognitive test only, announced when spent. **⚑ CARD TEXT CHANGED:** it now reads "an **enemy** within Attunement Range… once per round per **enemy**" — the engine has been enemies-only since your 07-12 ruling and the card said "a character". Say if you'd rather widen the engine instead.
- [ ] **2bI-4 — ⚑ Coercive Pressure stacking** — give the same creature Coercive Pressure's disadvantage **and** another next-test rider (e.g. Probability Net) → **NARROWING:** they no longer stack — the second write overwrites the first. The bespoke Cognitive-disadvantage flag that allowed both is gone. Tell me if that matters at the table.
- [ ] **2bI-5 — Predatory Insight (Black) ⚠️⚠️** — drive any creature **to 0 focus** — first by ordinary spending, then by letting **Whispered Doubt's** extra loss be what empties it → You regain **1 focus** BOTH times. The second is the one that broke in the 07-05 pass and it is the only rule in the project using the new `chain` setting — if it fires on the first but not the second, the chain flag is not working.
- [ ] **2bI-6 — ⚑ Whispered Doubt vs Wary** — have the enemy own **Wary**, then trigger Whispered Doubt → **BEHAVIOUR CHANGE:** the extra loss is now reduced by their Discipline ranks (usually to zero), because it goes through the shared involuntary-focus path. Wary's text says involuntary focus loss, so this reads correct — but it did NOT happen before. Your ruling, not a bug report.
- [ ] **2bI-7 — Hollow Command (Black) ⚠️** — use it on a creature **outside** your Black Attunement Range, then on one inside → Outside: refused, **nothing spent** (no Investiture, no roll). **⚑ NEW ENFORCEMENT** — the card always said "within Attunement Range" and the old code never checked. Inside: you roll Deception, it resolves against Spiritual, and on a success the target gains **Cannot Act** until the end of ITS next turn.
- [ ] **2bI-8 — ⚑ Hollow Command vs an unreadable defense** — use it on a creature with **no written Spiritual defense** → **BEHAVIOUR CHANGE:** it now succeeds (fail-open) where the old code posted an owner-judged click-card. Identical to 2bH-11 — one ruling covers both.
- [ ] **2bI-9 — Siphoned Will (Black)** — own it, land Hollow Command, and check the Events tab of **Siphoned Will itself** → You regain focus equal to your **tier**, on a card naming *Siphoned Will*. ⚑ Its own tab is **EMPTY** — the rule lives on Hollow Command. Third talent to take this exit (2bF-5/14/16 were the others); the question there is the question here.
- [ ] **2bI-10 — Necrotic Cascade (Death) ⚠️⚠️** — use it, then drop an enemy inside your Black Attunement Range with **other enemies within 10 ft of the body** → Your token gains a **Cascade Armed** marker. On the drop, each of those enemies takes **[Tier][Die] spirit** — and **your allies standing next to the body take nothing**. First consumer of the new `defeat` watch.
- [ ] **2bI-11 — Necrotic Cascade — the negative cases** — re-use it while armed; drop a **PC**; drop a **summon**; end the encounter → Re-use refused ("already active — nothing spent"). No cascade on a PC or a summon drop. On combat delete the **Cascade Armed** marker clears.
- [ ] **2bI-12 — Reactive Analysis (Blue)** — **target** the creature that just failed, then use it; roll a test against **that** creature, then against a **different** one → Advantage on the test against the targeted creature and **not** on the other. ⚑ **NEW ENFORCEMENT** — the card always said "against them" and the old code granted advantage on any next test. With nothing targeted it falls back to the old, unbound behaviour.

> ⚑ **Not verified in Foundry.** Nothing here has run at a table. **2bI-1** proves `scope: scene`
> exists at all and **2bI-5** proves the chain flag; if either fails, stop and tell me before testing
> the rest — the others share that machinery.
>
> ✅ **RULED 2026-07-24r (Ben: "go with defaults"): 2bI-3, 2bI-4, 2bI-6, 2bI-7, 2bI-8 and 2bI-12 all
> STAND as written**, and 2bI-8's fail-open answer covers **2bH-11** too — that is now H1's standing
> convention, not a per-talent question. So these rows are no longer asking you to decide anything;
> test them as **"does it do the ruled thing?"** and report a mismatch as an ordinary bug.
> The one row still genuinely asking you something is **2bI-9**: the pattern is settled, but whether
> an EMPTY Events tab is acceptable or merely tolerable is a bench-feel answer only you can give, and
> it decides whether the upgrade-talent exit keeps scaling.

---

## ⚑ RULE-2b PASS H — H8 `edha-watch` + the Crown unit (2026-07-24q) — NEEDS A PACK REBUILD

> **The observer.** A talent can now react to a test another DOCUMENT resolved — including another
> talent on the same actor, which is what Crown of Thorns and Extract Thought always were.
> Ratchet **174 → 171**. **2bH-2 and 2bH-5 are the rows that matter**: 2bH-2 is the first time
> `edha-test-fail` has ever fired anything, and 2bH-5 is the whole point of the handler.
> Power is now HALF migrated on purpose — Kneel is still engine-owned, so 2bH-6 is the row most
> likely to catch a real bug.

- [ ] **2bH-1 — Absolute Authority (Power)** — Events tab, then target a creature that is **NOT** compelled/frightened/weakened and use it → ⚑ **THREE** rules listed. The use is refused with "must be compelled / frightened / weakened" and **nothing is spent** — no Investiture, no card, no roll. This is H1's new pre-cost gate.
- [ ] **2bH-2 — Absolute Authority ⚠️⚠️** — target a **Weakened** creature, use it, and **FAIL** the Black test → The target becomes **Weakened until the end of ITS next turn**. This is the FIRST time `edha-test-fail` has ever fired a payload in this project — if nothing happens on a failure, the whole fail branch is dead.
- [ ] **2bH-3 — Absolute Authority** — same, but **succeed** → A card saying you choose its action on its next turn (GM-run). No status applied on a success.
- [ ] **2bH-4 — Crown of Thorns (Power)** — use it → Your token gains a **Crowned** marker (dark red). The card explains the scene arm and carries a **"Crown ping"** button.
- [ ] **2bH-5 — Crown of Thorns ⚠️⚠️** — while Crowned, use **Absolute Authority** (or **Kneel**, or Sovereignty's **Censure** / **Decree of Ruin**) against a creature → The target takes **spirit = your Presence** automatically, on a success **or** a failure, from a SECOND card. This is H8 doing the thing no event system could do — one talent reacting to another talent's test. Check all four sources if you can: Kneel and Censure/Decree are still engine-owned and reach Crown by a different route than Absolute Authority does.
- [ ] **2bH-6 — ⚑ half-migrated Power ⚠️⚠️** — with Crown armed run **Kneel** and confirm the ping; then end the encounter and re-check → Kneel did NOT convert (it needs H13) but must still trigger Crown — its engine code now *announces* the test instead of calling Crown by name. If Kneel stopped pinging Crown, the announcement path is broken. On combat delete, **Crowned clears**.
- [ ] **2bH-7 — Crown of Thorns re-use** — use it a second time while already Crowned → Refused with "already active — nothing spent". This is a generic veto now, not a Crown-specific one.
- [ ] **2bH-8 — Crown of Thorns manual ping** — with Crown armed, target a creature and click the card's **"Crown ping"** button → Spirit = Presence applied. This is the surface for a vs-Cognitive test the engine did not resolve; it must still work now that the talent is document-driven.
- [ ] **2bH-9 — Extract Thought (Black) ⚠️** — target a creature and roll **any Deception test** that BEATS its Spiritual defense → The target gains **No Reactions** until the end of YOUR next turn. It fires on a plain Deception roll — there is no "use Extract Thought" step.
- [ ] **2bH-10 — Extract Thought** — roll a Deception test that **misses**, then one with **no target** → Silence both times — no card, no status. Silence is not a setting; the talent simply carries no failure rule.
- [ ] **2bH-11 — ⚑ Extract Thought vs an unreadable defense** — Deception vs a creature with **no written Spiritual defense** → **BEHAVIOUR CHANGE:** the status now applies (fail-open, H1's documented convention) where the old code posted an owner-judged click-card instead. Tell me if you want the card back.

> ⚑ **Not verified in Foundry.** Beyond 2bH-2 and 2bH-5: **2bH-6** is the only row that can catch the
> two-sources-of-truth risk while Power is half converted, and **2bH-11** is a deliberate behaviour
> change I want your ruling on rather than your bug report.

---

## ⚑ RULE-2b PASS G — H3 `edha-owner-list` + Chaos's Omen talents (2026-07-24p) — NEEDS A PACK REBUILD

> **The sustained capped ledger, hoisted out of six hand-rolls.** Three Chaos talents convert.
> Ratchet **177 → 174**. Chaos is now HALF migrated on purpose — see 2bG-6, which is the row most
> likely to catch a real bug.

- [ ] **2bG-1 — Entropy Strike (Chaos)** — Events tab, then target + use + roll → ⚑ **THREE** rules listed. On a success: Omen placed **and** [Tier][Die] spirit. It was a takeover before — **you roll the Blue test yourself now**, on the talent's own card.
- [ ] **2bG-2 — Entropy Strike at your Omen cap (= tier)** — use it on a fresh target while at cap → The card says **"no Omen placed — you are at your cap of N"**, and no Omen lands. Chaos REFUSES at the cap; it must not fizzle an older one.
- [ ] **2bG-3 — Isolating Pressure (Chaos) ⚠️⚠️** — success vs a target **with** your Omen → Isolated, **Omen spent**, and [Tier][Die]+Awareness vital.
- [ ] **2bG-4 — Isolating Pressure ⚠️⚠️** — success vs a target with **no** Omen → Isolated, and **NO damage at all**. This is the whole H3 conditional idiom: the release rule returns false and the damage rule after it is skipped. If damage lands here, the short-circuit is broken.
- [ ] **2bG-5 — Isolating Ruin (Chaos)** — success with, then without, an Omen → With: Isolated + **two** damage instances. Without: Isolated + **one**. The first instance is unconditional; only the second rides the Omen.
- [ ] **2bG-6 — ⚑ half-migrated Omen cap ⚠️⚠️** — place Omens with Entropy Strike (new path), then fire **Cascade Collapse** (old path) to clear them, then place again → The cap must free up correctly. The two paths keep the ledger in different places on purpose — the new one reconciles against the status on read. **If Entropy Strike thinks you are still at cap after Cascade Collapse cleared the Omens, that reconciliation is broken.**
- [ ] **2bG-7 — Spreading Omen / Cascade Collapse / Unravel Everything** — run each → Unchanged — these three did NOT convert (they need H8). A regression here means the shared Omen helpers broke.
- [ ] **2bG-8 — Void Sense** — damage an Omen-bearer marked via the new path → Still refunds 1 Investiture once per round. It reads `markedBy.omen`, which H3 still writes.

> ⚑ **Not verified in Foundry.** **2bG-4 and 2bG-6 are the rows that matter** — 2bG-4 proves the
> conditional-payload idiom that the whole marker-tree migration will lean on, and 2bG-6 is the only
> row that can catch the two-sources-of-truth risk while Chaos is half converted.

## ⚑ RULE-2b PASS D — H1 `edha-def-test`, the first four (2026-07-24m) — NEEDS A PACK REBUILD

> **The handler 45 talents are waiting on.** It gates a payload on your own test: you roll on the
> talent's card as usual, the engine captures that roll and compares it. This batch is deliberately
> four LOW-RISK talents whose payload is table-run, so the *gate* gets benched before anything
> mechanical rides on it. Ratchet **206 → 202**.

- [ ] **2bD-1 — Set at Odds (Leader)** — Events tab → ⚑ A rule is THERE (was empty): `edha-def-test`, your test **ldr**, vs **defense / spi**. Confirm it renders and is editable.
- [ ] **2bD-2 — Set at Odds** — target a creature, use it, roll → The card reads `<total> vs <name>'s SPI <n> — SUCCESS/FAIL`. **You roll it**, not the engine.
- [ ] **2bD-3 — the gate ⚠️** — use it with **nothing targeted** → Warned "target the creature first (nothing spent)" and **no focus/Investiture is deducted**. This is the veto replacing the old takeover's nothing-spent guarantee.
- [ ] **2bD-4 — Grand Deception (Leader)** — use it (no target needed) → Resolves vs **flat DC 15**; no targeting warning, because `requireTarget` is off for this one.
- [ ] **2bD-5 — Synchronized Assault (Leader)** — use on a target, roll high **and** low → Both branches print, and the note gives both outcomes (success = allies up to your Leadership ranks gain an Action; fail = only one).
- [ ] **2bD-6 — Turning Point (Scholar)** — use on a target, roll → `ded` vs Cognitive, same shape.
- [ ] **2bD-7 — regression: the untouched rows** — **Sharp Eye**, **Tactical Ploy**, **Steadfast Challenge**, **Valiant Intervention** → All four still work exactly as before — they stay on the old `EDHA_HEROIC_DEFTESTS` path this pass. If any broke, the table edit went wrong.

> ⚑ **Not verified in Foundry.** **2bD-3 is the row that matters** — the veto is the only thing
> standing between "mis-target and lose nothing" and "mis-target and lose the cost", and it is the
> mechanism every deity conversion will depend on.
>
> ⚑ **Two H1 modes are UNPROVEN by this batch**: `vs: skill` (engine rolls the foe's skill) has no
> consumer here — its first will be Green/Drive the Prey — and the `edha-test-fail` event fires no
> payload yet; its first real consumer is Absolute Authority's consolation Weakened.

## ⚑ RULE-2b PASS C — the "modify my own next test" family (2026-07-24k) — NEEDS A PACK REBUILD

> Six talents across **Agent, Leader and Scholar**, all one shape: *on use, write a next-test flag
> on myself*. `edha-next-test-mod` grew `target: self` plus `plotDie` and `opportunity`, so no new
> handler type. `EDHA_OPP_ADDERS` and two bespoke `useItem` hooks are deleted. Ratchet **212 → 206**.

- [ ] **2bC-1 — High Society Contacts (Agent)** — Events tab, then use it → ⚑ A rule is THERE (was empty): `edha-next-test-mod`, target **self**, Opportunity **true**. Using it banks the credit and the card says so.
- [ ] **2bC-2 — High Society Contacts** — now roll any test → The **Opportunity menu** fires with the roll and names the talent — exactly as before.
- [ ] **2bC-3 — Underworld Contacts / Rumormonger / Well Supplied** — use each, then roll → Same banked Opportunity. Rumormonger and Well Supplied are **Leader**, so this crosses two paths off one table.
- [ ] **2bC-4 — Risky Behavior (Agent)** — use it, then roll → Your next test **raises the stakes** (Plot Die injected), and the consume card names *Risky Behavior* — not the generic "Raise the Stakes".
- [ ] **2bC-5 — Overwhelm with Details (Scholar) ⚠️** — use it, then roll → Your next test gains **+your Lore modifier as a number**. ⚑ The formula now resolves at use against your roll data; if the card shows a raw `@skills.lor.mod` instead of a number, the resolution broke.
- [ ] **2bC-6 — the round trip ⚠️** — On Risky Behavior's Events tab tick **Also bank an Opportunity** as well, use it, roll → You get **both** the Plot Die and the Opportunity menu. Proves the fields are live and composable, not just a re-skin of the old hook.
- [ ] **2bC-7 — regression: targeted mods** — **Emotional Overload** (Red, pass A) on a target → Still applies **disadvantage to the TARGET**. `target` defaults to `target`, so every pre-existing next-test-mod rule must be untouched — this is the one that would break if the default flipped.
- [ ] **2bC-8 — regression: Probability Net** — use it on a target → Still `-1d6` on the target's next test. Same reason as 2bC-7.

> ⚑ **Not verified in Foundry.** **2bC-7** is the one to run even if you skip the rest — six new
> fields landed on a handler that five shipped talents already use, and a wrong default would
> silently redirect all of them onto the caster.

## ⚑ RULE-2b PASS B — the six Warrior stances come off the engine (2026-07-24j) — NEEDS A PACK REBUILD

> **Behaviour should be IDENTICAL to before, with one exception (2bB-4) where it should be BETTER
> than before, because the old code was broken.** Both name-keyed stance tables are gone: the
> numeric riders now live on each talent's **Effects** tab, the skill advantage on its **Events**
> tab. Ratchet **218 → 212**. Nothing below takes effect until `deploy-to-foundry.bat` + ⟳ Sync.

- [ ] **2bB-1 — Stonestance** — Effects tab, then use it → ⚑ ONE effect, *"Stonestance — while active"*, greyed/not-transferring. Using it enters the stance and the **marker** grants **+1 deflect**. Leaving it removes the deflect.
- [ ] **2bB-2 — Vinestance / Bloodstance** — use each → Vine: **+1 Physical, +1 Cognitive**. Blood: **−2 Physical, −2 Cognitive, −2 Spiritual**. Same numbers as before — only their storage moved.
- [ ] **2bB-3 — the round trip ⚠️** — On Stonestance's Effects tab change the deflect value `1` → `2`, then enter the stance → The marker grants **+2**. This is the whole point of the pass — if the edit doesn't take, the stance conversion is wrong.
- [ ] **2bB-4 — Flamestance ⚠️ was broken** — enter Flamestance, roll **Intimidation** → **Advantage (2d20kh).** ⚑ This very likely NEVER worked: the retired code set `advantageMode = 1` (the system's enum is the string `"advantage"`) and didn't wrap `configureDialog`, which a dialog roll overwrites. Check it **both** from the sheet and through the roll dialog.
- [ ] **2bB-5 — Ironstance / Windstance** — enter each, roll **Insight** / **Agility** → Same advantage, same two ways.
- [ ] **2bB-6 — the stance gate** — while in Flamestance, roll **Insight** (not Intimidation); then leave all stances and roll Intimidation → **No advantage** in both cases — `whenSkill` and `whileStanceActive` must both bite.
- [ ] **2bB-7 — Events tab** — open Flamestance → Events → ⚑ A rule is THERE (was empty): `edha-test-rider`, mode **advantage**, whenSkill `itm`, whileStanceActive **true**. Confirm it renders and is editable.
- [ ] **2bB-8 — no stray indicators** — Flamestance + Vigilant Stance sheets → The old greyed *"(Active) — INDICATOR ONLY / Mechanics manual"* effect is **GONE** from both. The stance marker is the indicator now. (Vigilant Stance is otherwise unchanged this pass.)
- [ ] **2bB-9 — regression: riderless stances** — enter **Vigilant Stance** → Still enters/leaves normally with no numeric change — it has no rider effect, and that must read as "no rider", not as an error.
- [ ] **2bB-10 — regression: existing riders** — Predatory Patience (Black) vs a Weakened target → Its `+[Die]` still lands. The test-rider injector was restructured to allow mode-only rules; formula riders must be untouched.

> ⚑ **Not verified in Foundry** — no session can launch it. **2bB-3 and 2bB-4 are the ones that
> matter**: 2bB-3 proves the migration premise for `effects` (as 2bA-7 did for `events`), and
> 2bB-4 is a bug fix that has never once been seen working.

## ⚑ DEPLOY STATE (last confirmed by Ben 2026-07-18 — STALE, see the banner)

> **⚑ THIS SECTION IS OUT OF DATE (flagged 2026-07-24).** It was last advanced on **2026-07-18**;
> the handoff's newest delta is **2026-07-23c**, so roughly a week of merged work — the items
> tranche, the culture items, the character-creation wizard, the wizard review fixes, and the
> whole map/hydrology run — is **not accounted for below**. Only Ben can advance this section
> (it describes his machine, which no session can inspect), so it goes stale silently.
>
> **Agents:** per `test-pass-fixes` Phase 1, a DEPLOY STATE older than the newest handoff delta
> is **not evidence** — it is a question for Ben. Do not use it to rule a "wrong text / old
> behaviour" report in or out until he confirms.
>
> **Ben:** one `deploy-to-foundry.bat` run + relaunch, then tell a session what it printed and
> the section gets rewritten from that. Everything below this banner describes 2026-07-18.

The live module + packs on this machine were, **as of 2026-07-18**, current through the 07-17 playtest-2 engine push
(everything up to and including PR #97; packs current through 2026-07-16c + the 07-16d fixes).

**MERGED BUT NOT YET DEPLOYED — the RULE-2b MIGRATION, PASSES A THROUGH AA (2026-07-24 → 07-26).**
**All 221 talents** have moved off engine name-dispatch onto their own documents — the migration is
COMPLETE — and **every one of them changes the PACK**, so none of it is live until one
`deploy-to-foundry.bat` + ⟳ Sync. Checklist rows
**2bA-1…9 · 2bB-1…10 · 2bC-1…8 · 2bD-1…7 · 2bE-1…10 · 2bF-1…17 · 2bG-1…8 · 2bH-1…11 · 2bI-1…12 ·
2bJ-1…14 · 2bK-1…5 · 2bL-1…14 · 2bM-1…12 · 2bN-1…6 · 2bO-1…7 · 2bP-1…12 · 2bQ-1…10 · 2bR-1…18 ·
2bS-1…17 · 2bT-1…20 · 2bU-1…16 · 2bV-1…18 · 2bW-1…17 · 2bX-1…17 · 2bY-1…14 · 2bZ-1…12 ·
2bAA-1…10 · 2bAB-1…10 (the pre-deploy audit: 15 dead adversary copies of tree talents, wired)**
are ALL unrun — do not treat any of them as verified, and do not read a "wrong text / old behaviour" report on a
converted talent as a bug until this deploy has happened. Nine handlers were built in that window
(H1 `edha-def-test`, H5 `edha-cae-grant`, H11 `edha-enter-stance`, H3 `edha-owner-list`,
H8 `edha-watch`, H10 `edha-focus`, H6 `edha-prompt-pick`, H12 `edha-detonate-list`, `edha-note`)
plus the `edha-combat-timing` dispatcher and, in pass P, the `edha-draw-mana` EVENT with its
dispatcher; passes Q–R added H24 `edha-reveal`, H25 `edha-damage-react`, H26 `edha-test-react`,
H27 `edha-damage-reduce`, H7 `edha-aura`, `edha-pulse`, `edha-cleanse`, `edha-move-window`,
`edha-designate`, `edha-accord-forge` and H1's `vs: prompt-dc`; pass S added the H2 zone family
(`edha-zone`, `edha-zone-hazard`, `edha-zone-react`), `edha-adv-attack`, `edha-strike-window`,
`edha-damage-bonus`, `edha-unseen-ward`, `edha-heal-react`, `edha-remove-injury`,
`edha-suppress-veil` (+ the `clearsight` status) and the `deflectStackMax` field; pass T added
H3b (`mode: counter` on `edha-owner-list` + `edha-counter-transfer` + the `packsight`/
`packmind`/`predprimed` statuses), H9 `edha-die-step` + `edha-die-step-react`, the `die-step`
watch kind, and the `targetCounter`/`oncePerScene`/`perCounterStatus`/`target: victim`
widenings; the handler code
is ENGINE-side and needs only F5, but the rules that USE it are pack-baked; pass U added `edha-sense-reveal`, `edha-redirect`, `edha-test-aura`, the `token-move` watch kind + `once: arm-per-target`, H1’s `targetList` owner-sweep + `vs: none`, H3’s `near-victim`/`enemies-range` placements, H6’s `effects` dispel source, the `unlessTargetStatus`/`maxTargets` trigger widenings, the armed damage-bonus riders (`meleeOnly`, `tallyKills`/@tally, onKill/onSurvive), `edha-self-status` `refuseWhileActive`/`oncePerScene`/`immuneStatuses`, `edha-defense-buff` `window: scene`, timed `edha-apply-status` expiry and the H13 test-rider widenings; pass W added
`edha-ward`, `edha-turn-dot`, `edha-revive`, `edha-mutation`, `edha-regen-grant`, H3 `op: spend` +
`sceneFreebie`, `edha-focus` `resource: inv`, `edha-damage-bonus` `healCutFraction`, H1
`skipIfAlly`, `edha-zone` `costList`, `edha-zone-hazard` `moment: turn-end`, `edha-cleanse`
`trigger: success-damage-roll`, the `edha-redirect` intercept widenings (`watchFlag`/`linkOnUse`/
`chooseAmount`/`takeType`/`healFormula`) and the `withernext` status; pass X added the `edha-zone`
kinds `ordained`/`snare`/`link-markers`, `edha-zone-guard`, `edha-snare-react`,
`edha-marker-command`, H3ann's `sourceItemUuid` stamp + `riderSkill`/`riderColor`/
`riderFailStatus`, and `edha-damage-bonus` `rangedOnly`/`placeList`; pass Y added the `edha-zone`
kinds `charge`/`line`, `edha-detonate-react`, `edha-reroll-react`, `edha-zone-react`
`defeat-in-zone`, `edha-place-hazard` `mode: trail` + `spreads`, the `damaged` watch kind and
`edha-test-rider` `unlessSkills`; pass Z added the `edha-ritual-paid` EVENT + its dispatcher,
`edha-reserve-bank`, the H17 target-formula resolver (`@target.recoveryDie` on any `edha-focus`
formula), `edha-focus` `resource: hea` + posted dice, the `whenOnMyList`/`whenOnMyListStatus`
watch gate, the config-only veto trio (`edha-focus-guard`, `edha-hp-floor`, `edha-move-veto`),
`edha-pulse` `who: enemies`/`requireIsolated` + GM-whispered skip accounting, and the FIRST
authored NATIVE rule (Resilient Hero's `long-rest-actor` + `update-actor` clear — 2bA-9); and
pass AA — the last — added **H22 `edha-barrier`** (the engine's FIRST blocks-movement capability:
real Foundry Walls, GM-created or relayed, raised around a placed square and cleared when the
barrier is destroyed / deleted / at the end of the encounter), `edha-illusion-copy`,
`edha-illusion-upkeep`, and the `edha-summon` widenings `tokenSizeFt`/`tokenSizeColor` and
`placeAt: pick-point` + `rangeColor`/`rangeFt` (no summon could be placed at a chosen square
before). Passes R, S, Y, Z and AA also rewire adversary abilities (2bR-17, 2bS-3, 2bY-10, 2bZ-10,
2bAA-9), so the ADVERSARY pack + ⟳ Sync are needed too.

⚠️ **Pass P retires a console macro.** `edha.calculatedPatience()` no longer exists — if it is in a
hotbar macro, that macro will throw after this deploy. Delete it; the talent is automatic now. Two ADVERSARY abilities changed with pass J and are also pack-baked (Callthief's
Overwhelming Authority, the Dirgehound Pack's Unnerving Approach — 2bJ-13/14). **If exactly one thing
gets tested first, make it 2bA-7** (does editing a rule in Foundry actually change behaviour) — the
whole migration premise rests on it.

**ALSO MERGED BUT NOT YET DEPLOYED:** the **2026-07-17c bench-results fixes** and the **2026-07-18b
adversary sync**. ONE `deploy-to-foundry.bat` run + relaunch covers both. After that deploy,
instead of re-dragging adversaries, click **"⟳ Sync Adversaries from Pack"** (Actors sidebar
footer, GM) once — that click IS the sync feature's first test, and it pushes the 07-17c fixes
onto every world adversary and placed token in place (position/HP kept, renamed copies skipped).

Standing rules: **PC tokens are linked** and never need replacing; **PCs need no ⟳ Sync** unless
a section says a specific pack-baked talent changed. Every deployed section below assumes the
current deploy state — per-section setup boilerplate was removed in the 07-18 consolidation.

---

# Pending the next rebuild + deploy (ONE `deploy-to-foundry.bat` run covers every row here)

> **Section added 2026-07-24 to fix a dashboard bug, not to add content.** Every "ALSO PENDING"
> block below already existed — but they sat *inside* the `## DEPLOY STATE` section, and
> `build-dashboard.js` deliberately filters that section out of the Bench tab to render it as the
> banner. So these rows have **never appeared on the dashboard Ben actually tests from** (CLAUDE.md:
> "Ben tests from the generated `EDHA_DASHBOARD.html`"). Row text is unchanged and unmoved; only
> this heading is new, which promotes all of them into a real, markable bench section. **Keep
> pending rows below a `#` heading — anything above the first one is invisible to Ben.**

**ALSO PENDING (2026-07-24, tree-graph + overlay fixes):** `data/leyline.json`, `data/domain.json`
and `scripts/edha-pack-io.js` changed. **Pack rebuild + deploy + ⟳ Sync needed** — the tree node
graphs and 10 talents' Events/Effects tabs are all pack-baked. See the "2026-07-24 fixes" section
immediately below.

- [ ] **Green / Instinct is takeable at all (THE session-0 blocker)** — open the Green tree on a
      PC with Green 1+. **Pack Hunter** is now pickable with no talent prereq (it is the branch
      root); taking it unlocks **Predator's Instinct** and **Scent the Weak**, and the column
      walks down to **Natural Order**. Before this fix, Pack Hunter and Predator's Instinct each
      required the other and all 8 Instinct talents were permanently unpickable.
- [ ] **Red / Momentum is takeable** — same check on Red: **Reckless Advance** is the branch root
      (its card now reads **"Red 1+"**, not "Burning Drive"), and **Burning Drive**, **Volatile
      Strike**, … **Unstoppable** chain down from it. ⚑ **Ben — eyeball the drawn tree**: the fix
      trusted the layout + connections over the card text. If you intended Burning Drive to come
      first, say so and it flips instead.
- [ ] **Death / Speak with the Fallen** — its card now reads **"Reaper's Harvest"** (was "Risen
      Servant", which is drawn *below* it). Confirm it hangs off Reaper's Harvest beside Bone
      Garden, and that Risen Servant is still reachable via Bone Garden.
- [ ] **The 10 recovered talents show behaviour again** — after rebuild + ⟳ Sync, each of these
      has a NON-EMPTY Events or Effects tab: **Guardian Stance** (White, +1 Deflect AE),
      **Thorn Field** (Green), **Shoulder the Oath** (Order), **Lay Foundation** (Civilization),
      **Death Ward** + **Necrotic Cascade** (Death), **Set Charge** (Destruction, 2 rules) +
      **Fault Line** (Destruction), **Warlord's Advance** + **Investiture of Command** (Power).
      Their behaviour was being erased at build time by an empty authored overlay.
- [ ] **Razkael prereqs match the drawn tree (2026-07-24b)** — **Cascading Failure**'s card now
      reads "Pinpoint Charge or Concussive Yield" and **Fault Line**'s reads "Walking Ruin or
      Combustion Chain"; each is takeable from either drawn parent alone, not both.
- [ ] **Four silently-dead prereqs now bite (2026-07-24b)** — **Know Your Moment** (Scholar) lists
      **Mind and Body** as a talent prereq (it was being dropped entirely); **Resolute Stand**
      (Leader) requires **Athletics 1+**; **Shattering Blow** (Warrior) requires **Windstance**
      AND **Perception 2+** (both were dropped); **Animal Bond** (Hunter) spells "companion".
      ⚑ These now ENFORCE where they previously did nothing — if a PC already owns one of these
      talents without the prereq, the sheet may flag it. Expected, not a bug.
- [ ] **Risen Servant's card no longer names a cut talent (2026-07-24c)** — its Prerequisites read
      **"Bone Garden or Speak with the Fallen"** (was "Bone Garden or Gentle Passage" — a talent
      deleted in the Death-tree rewrite). Confirm it is takeable from EITHER parent alone.
- [ ] ⚑ **Nothing else lost its rules** — spot-check two talents that already worked (e.g. Black's
      Withering Ray, Red's Arc Flash): tabs unchanged. The A/B build says 0 talents lost anything,
      but that is a repo-side check, not a table one.

**ALSO PENDING (2026-07-19c, Lunavar lore pass):** `data/cultures.json` — the Lunavar culture
item's flavor/names text re-synced to the updated player primer (rice country, Moonmere, the
grief-night; ruling 60 keeps item flavor = primer verbatim). **Pack rebuild + deploy + ⟳ Sync
needed** before the item shows the new text. Flavor-only — no mechanical or pick-list change;
existing PCs' owned culture items keep the old flavor (stale snapshot, harmless).

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

**ALSO PENDING (2026-07-19p, wizard v2 pass):** the 07-19 bench's wizard fixes + Ben's three
rulings. Engine + css + the new map-picker assets ride the deploy bat's module push; the
culture **pick-2 rewire** (`edha-pick-expertises` replaces the native Rosharan-list pick)
rides the SAME pack rebuild as the bestiaries. One `deploy-to-foundry.bat` run still covers
everything pending on this page.

**ALSO PENDING (2026-07-19ab, map redraw re-registration):** the wizard's map-picker assets
(`thyrcross-nations.json` + `thyrcross-map.jpg`) were regenerated from the REDRAWN map (new
canvas, Ben's per-nation layer borders). They ride the same deploy-bat module push — no pack
rebuild, no engine change. **Regenerated AGAIN 2026-07-20n** from Ben's gap-fill repaint:
polygons are now a watertight partition (no inter-nation gaps/overlaps/coast fringe in the
data — `scripts/map/trace_nations.py`), so border clicks can no longer land in dead zones.
The two rows below are still the test; the partition just raises the bar (every land click
should now resolve to SOME nation — "no nation" on a mainland click is a bug).

- [ ] **Map picker shows the redrawn map** — after deploy: the Where-are-you-from step shows
      the new map art (Goldenport wash running the whole west coast is the giveaway) and the
      map is not stretched or letterboxed (the asset aspect changed with the new canvas).
- [ ] **Redrawn polygons hit the right nations** — click near the touchy borders: the
      Goldenport coastal strip (formerly Kettavar/Lunavar), the Vorsk/Lunavar mountain line,
      Malcurr's lake country, the Thalendor/Corvaine river line. Hover names must match the
      wash colors; Sylvaneth island still clickable.
- [x] **⚑ Redraw rulings menu ANSWERED (2026-07-19, rulings 81–85)** — Goldenport coast
      intended; Fenholt swap kept; ghosts removed (27 cities now); river timings follow the
      corrected re-measure (~13 days — the interim 9-day figure was a truncated trace, so no
      narrative skip after all); all four land-budget chains re-derived (Thalendor 14.5M,
      Corvaine 18.0M, Lunavar 11.6M, Malcurr 7.8M). W26 step 2 (the Lunavar/Goldenport lore
      sweep) remains the open lore-forge item.

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

---

# Heroic wiring pass (2026-07-18h — engine + data: `deploy-to-foundry.bat` → relaunch → **⟳ Sync**; all 133 heroic talents classified WIRED / CAE-NEXT / MANUAL in the engine's HEROIC header)

The full heroic review Ben asked for: quarry, Rousing Presence, contest gates, command dice,
stance riders, on-hit riders, Opportunity credits, Resilient Hero, Wary. The CAE-NEXT class
(action/reaction economy against Cosmere Advanced Encounters) wires after THE PASTE captures the
module's api — those talents are NOT in these rows yet.

- [ ] **Quarry loop** — Seek Quarry (target first) marks the quarry; your ATTACK rolls against
      it gain advantage; Tagging Shot marks on a hit automatically; when the quarry hits 0 HP,
      **Cold Eyes** pays 1 focus and prompts a re-pick.
- [ ] **Pack Hunting** — target an ALLY, use it: their next roll vs your quarry gains +Survival
      ranks (auto-applied).
- [ ] **Rousing Presence** — target an ally, use it: Determined applies, and the card lists every
      rider you own (Lessons +1 focus fires automatically; Instill/Devoted/Stalwart/Rallying are
      listed with their by-hand halves).
- [ ] ⚑ **Steadfast Challenge gate** — target an enemy, use it, ROLL Discipline: the engine
      compares vs their Spiritual and only a SUCCESS applies Disoriented + posts the
      disadvantage card (a FAIL applies nothing). Roll both outcomes.
- [ ] ⚑ **Valiant Intervention / Tactical Ploy gates** — same pattern (Athletics vs Spi /
      Deception vs Cog); Tactical Ploy's success also stamps −1d4 on the target's next test.
- [ ] ⚑ **Field Medicine** — target a patient, use it, roll Medicine: DC 15 gate, success heals
      recovery die + Medicine ranks. ⚑ the recovery-die path is a guess (`system.recovery.die`)
      — if the heal rolls 1d8 for everyone or errors, report the sheet's real recovery die.
- [ ] ⚑ **Galvanize** — same recovery-die caveat: the targeted ally's focus restore should match
      their sheet's die.
- [ ] **Command dice scale** — Decisive Command's die reads d4 with no upgrades, d6/d8/d10 as
      Confident/Demonstrative/Shrewd Command are added; using an upgrade talent banks the die on
      your own next roll; the DC card lists Relentless March / Authority riders when owned.
- [ ] ⚑ **Resilient Hero** — drop a test PC to 0: health holds at the Athletics modifier
      instead, once (the flag blocks a second save until cleared).
- [ ] **Wary** — with focus > 0, toggling Surprised on the PC is vetoed with a toast; Feinting
      Strike's drain against a Wary target shrinks by Discipline ranks.
- [ ] **Feinting Strike** — on a HIT the target loses focus = your Intimidation ranks (card
      notes the graze-half and reaction-loss are by hand until the CAE tranche).
- [ ] **Stance riders** — Stonestance shows +1 deflect while active; Vinestance +1 phy/cog;
      Bloodstance −2 all three; Intimidation rolls in Flamestance (and Insight in Ironstance,
      Agility in Windstance) open with advantage; with Practiced Kata, combat start auto-enters
      Vigilant Stance unless Surprised.
- [ ] **On-hit riders** — Cheap Shot hit → Stunned; Startling Blow hit → Surprised; Shattering
      Blow hit → 5 ft push card; Subtle Takedown / Anatomical Insight / Meteoric Leap hits →
      their GM cue cards.
- [ ] **Opportunity credit** — use High Society Contacts (or Underworld/Rumormonger/Well
      Supplied): the next test's roll fires the Opportunity menu with "+1 granted by <talent>";
      Anatomical Insight's Exhausted option appears on the menu after an unarmed-hit roll with
      an Opportunity.
- [ ] ⚑ **Sharp Eye** — target + use + roll Perception: on success a WHISPERED card (owner only)
      offers the three reveals; confirm it's not public.
- [ ] **Orphan-token combat guard (07-18i)** — after re-deploying: add a token whose world actor
      you've deleted to a combat → it's SKIPPED with a named toast and combat starts anyway
      (was: Advanced Encounters' initiative getter crashed the whole encounter — the live
      07-18 "combat isn't starting" report).

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

# The manual re-litigation pass (2026-07-16c — the Ben-ruled wirings not yet benched)

07-17 bench already passed the sight model, Pack Tactics, and Kneel enforcement; token senses and
sense-through reveals moved to their 07-17c re-test rows. These are the wirings nobody has
exercised yet.

- [ ] ⚑ **Senses field on the sheet** — an adversary block with an explicit `senses` value shows
      that range on the SHEET (the `system.senses` DataModel shape is unverified from the repo —
      a dropped field silently falls back to the AWA default, which token vision masks).
- [ ] ⚑ **Veil auto-toggle (Stalker)** — Stalker standing in darkness: the Veil marker enables
      itself + a GM whisper; walk it into light: the marker releases. Toggle it ON manually in
      light (cover): the engine leaves it alone.
- [ ] ⚑ **Unweaving pick-card** — success vs a buffed enemy lists its active effects as buttons;
      GM-click removes exactly that effect and resolves the card; a clean target says "narrate
      the unraveling".
- [ ] ⚑ **Dense Tissue immunity** — grant a Thrall Dense Tissue (the picker), then Shockwave/
      Unnerve-push it: "immune to forced movement" card, token unmoved. Cruel Step's SELF-slide
      on a hypothetical bearer must still work (willing move).
- [ ] ⚑ **Living Image upkeep** — with an illusion up, the owner's turn start whispers the
      upkeep card; Pay 1 Investiture deducts and reports; no illusions → no card.
- [ ] ⚑ **Set Charge trigger arms** — place a Charge: the arm card appears. Arm "target moves"
      (with a target): moving that creature whispers the Detonate prompt, once. Arm "takes
      damage": damaging it prompts. Arm "a creature enters": an enemy ENDING a move inside
      10 ft prompts (⚑ known limit: sprinting THROUGH without stopping doesn't). Manual: silent.
- [ ] ⚑ **Apex Form doubling** — a thrall with Bone Spurs + Apex Form: the strike card says
      +keen ×2 "(doubled — Apex Form)"; venom and Dense-Tissue deflect double likewise.

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

---

# Pass-3 UNIQUE fixes (2026-07-12f — the root causes still unbenched)

Deployed since 07-12; 07-17 bench passed the sheetScale/hover/palette row, and the Black Draw
Mana visibility rework moved to the Playtest-2 GM-sweep row above.

- [ ] ⚑ **Cruel Step / Sudden Growth** — after rebuild + Sync: their Events tab shows the 16-char
      ids (`CruelStepMove001` / `SuddnGrwthBrst01`); both actually fire now (the old 15-char ids were
      silently dropped by Foundry). Cruel Step slides 10 ft to an Isolated target; Sudden Growth's
      terrain burst opens.
- [ ] ⚑ **Predatory Patience** — longsword attack AND Withering Ray vs a Weakened creature gain
      +1d[Black die]; Extract Thought's Deception still does NOT. (The 07-12d batch left this broken —
      the die matched no roll due to the roll-context capitalization.)
- [ ] ⚑ **Formula bar** — any advantage roll reads "2d20kh + 6" (spaced, no stray ")"). If garbling
      recurs, note whether the roll dialog's Temporary Bonus field had anything typed in it.
- [ ] ⚑ **Pyre** — SQUARE region (not a circle). End of turn: card to GM + owner; GM **Spread**
      click-places one adjacent square; **Extinguish** (anyone) removes it. **Green Draw Mana** —
      click-to-place the terrain square within Attunement Range. **Spreading Roots** still grows it.
---

# Pass-3 fix batch re-test (2026-07-12d — the fixes still unbenched)

Deployed since 07-12. The single-target picker moved to its 07-17c re-test row (the v13 fix
changed the mechanism).

- [ ] ⚑ **Engine-move collision** — Unnerving Approach push (and Cruel Step slide) toward an occupied
      square: the moved token stops in the last free square, never stacking. Manual drags still stack
      (intended — R2 engine-only).
- [ ] ⚑ **Flame Surge / burst cards** — Detonate: button reads "Detonated ✓" and stays disabled after
      F5 / re-login; re-clicking is impossible. Cancel reads "Cancelled — refunded ✓". Old cards from
      before this fix still reset on refresh (only messages stamped from now on persist).
- [ ] ⚑ **Lay Foundation** — START combat with a combatant standing in a Foundation: the +1 defenses
      buff and chat line appear immediately, not on turn two.
- [ ] ⚑ **Flashpoint** — Red burst hits 2+: click the prompt → +1 Investiture AND your next Red test
      rolls with advantage automatically (pre-selected/fast-forwarded).
- [ ] ⚑ **Kindle** — deal energy damage, wait ~30s reading the card, then Apply: the target token now
      sheds the flame light. In the damage roll breakdown, the Kindle die/mod is labeled "[Kindle]".
- [ ] ⚑ **Set Charge (and any burst)** — the card now shows "= roll (dice) + N (skill) + N (Kindle) →
      total type" so every component is named.
- [ ] ⚑ **Coercive Pressure** — an ALLY losing focus in your range gives no disadvantage card; an
      adversary still does.
- [ ] ⚑ **White Attunement** — Draw Mana with an ally behind a wall / hidden: NOT healed, and the card
      accounts for it ("healed 2 of 3 … — skipped 1 behind a wall"). Card text says "you can see".
- [ ] ⚑ **Concordant Presence** — an ally succeeding behind a wall no longer triggers the grant; a
      visible one does, and only visible allies are offered as recipients.
- [ ] ⚑ **Overgrowth** — heal the same creature twice: effect steps +1 → +2 Deflect (max +3), visible
      on its Effects tab; all stacks clear when combat ends.
- [ ] ⚑ **Guardian Stance** — move an ally adjacent to the owner: BOTH gain a "Guardian Stance
      (+1 Deflect)" effect within a moment; move apart → it vanishes. The old manual toggle effect is
      gone from the talent (after Sync).
- [ ] ⚑ **Mender's Instinct** — the reaction card is one tight line + button, and no longer tells you
      to target the creature (it heals the ally who dropped automatically).
- [ ] **Withering Ray skill test** — if the garbled `2d20kh+6)` bar reappears, SCREENSHOT it (still
      the one un-reproduced report).

---

# Engine backlog pass — the §9a/§9b items still unbenched (2026-07-04)

The cross-tree pass that closed handoff §9a (5 shared primitives) + §9b (6 tree-local hooks).
07-17 bench passed the forced-move stamp. ⚑ rows are where the engine can't self-verify.

## Shared primitives
- [ ] **LOS helper (`edhaCanSee`)** — Lawkeeper's Eye: advantage vs your bound target in the open;
      **no** advantage with a sight-blocking wall between you (darkness stays GM-judged).
- [ ] **Packmate's Warning (upgraded from manual)** — an attack on an ally within 10 ft of the owner
      by a **hidden** (or wall-obscured) attacker rolls at −2, flavored on the roll. ⚑ the −2 is an
      appended NumericTerm — confirm a dialog-configured roll keeps it (the Mantle-aura caveat).
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

## Tree-local hooks
- [ ] **Pinpoint Charge follow** — detonate a Pinpoint on a survivor: the terrain centers on THEM
      (not the marker) and follows their moves, visual included; it stops following at 0 HP.
      ⚑ a Region moved onto a stationary token may not fire tokenEnter — turn-start damage still hits.
- [ ] **Pyre spread** — end the Pyre owner's turn: one whispered confirm card per Pyre zone; the
      free Spread button grows Region + visual +5 ft. Spreading Roots still costs 1 Inv (unchanged).
- [ ] ⚑ **Shatter Focus auto-prompt** — an Omen-bearing foe rolls any test → the owner gets ONE
      whispered Reaction reminder (once per foe per turn). Mute silences; a real Shatter Focus use
      re-arms. **Reassess spam live** — this is the named bench risk.
- [ ] **Target-bound Presence advantage** — after a Warlord's Advance survivor: the advantage fires
      ONLY with that survivor targeted (any other target neither grants nor consumes it).
- [ ] **Vital Diagnosis reveal** — use with a synced target: whispered HP / conditions / all-three-
      defenses snapshot.
- [ ] ⚑ **Civ enemy-cost (GO/NO-GO)** — ruler across a fortified Foundation: **×2 for an enemy, ×1
      for an ally**. Console shows the enemy-cost registration; on failure Bastion silently keeps
      the Ben-R3 blind cost (GM compensates) — report which resolver fired so the experiment can be
      kept or deleted.
- [ ] **Bastion regression (latent-bug fix)** — Bastion now declares its `fortified` behavior type
      in module.json (it never had been; nothing since 06-16 was live to catch it). Confirm Bastion
      creates its Regions at all + the enter-damage/Slowed court fires.

---

# Black — Isolation + Ritual + Subjugation (2026-06-13 — base wiring still unbenched)

Predatory Patience, the Reserve economy, Predator's Due, Predatory Insight, Hollow Command, and
Extract Thought all have NEWER re-test rows in the "Black — 07-05 test-pass fixes" section below —
these are the base behaviors that never got a later rework.

## 1. Isolation
- [ ] **Sapping Hex** — **miss** an Isolated target → it does **NOT** become Weakened (the
      real-hit retrofit point); a hit still Weakens (regression row in the 07-05 section).
- [ ] **Sovereign of Solitude** — target a Weakened mover, use as a Reaction → spends 2 Inv, prompts Black-vs-Spiritual, rolls [Tier][Die] vital on a hit, and the target gains **Immobilized** (auto-expires end of its next turn).
- [ ] **Spoils of Isolation** — regression: still works as before.

## 2. Ritual (HP-cost economy + affliction + heal-cut)
- [ ] **Hardy** — max HP increases by your level (bump current HP up to the new max manually).
- [ ] **Withering Ray** — on use, HP auto-deducts (= half [Die]); chat shows the payment.
- [ ] **Dark Investiture** — on use, HP auto-deducts (= Tier) + 1 Inv; on a **hit** the target gains **Afflicted** and takes **[Tier][Die] vital at the start of each of its turns**.
- [ ] **Dark Investiture** — remove the Afflicted icon → the per-turn damage stops.
- [ ] **Necrotic Grasp** — hit a creature with a Black attack, then heal it → the heal is **halved**, until the end of **your** next turn.
- [ ] **Blood Price** — after paying ritual HP, your **next Black test** rolls with **advantage** (chat confirms it's spent).

## 3. Subjugation
- [ ] **Whispered Doubt** — GM spends an **enemy's** focus while it's in your Attunement Range → it loses **1 extra** focus (once/round/enemy).
- [ ] **Coercive Pressure** — a creature in range loses focus → its **next Cognitive (int/wil) test** rolls disadvantage (once/round/creature).
- [ ] **Composed** — regression: +tier max focus.

## Watch-items (couldn't be self-verified; check first if something's off)
- [ ] Affliction auto-tick actually fires at the **start of the target's turn**.
- [ ] Heal-cut interception actually halves the applied heal.
- [ ] Blood Price / Predatory-Insight advantage detection keys off `roll.data.skill.id` correctly (Black / Deception).

---

# White / Coordination (2026-06-14)

The Coordination tree is a Plot Die ("raise the stakes") + ally-support tree, name-keyed in the
engine. Setup: a White PC **GM-run or with a player online** (the cross-actor watcher posts cards
GM-side, whispered to the owner) + ≥2 ally tokens in Attunement Range + an enemy.

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
- [x] **Hardy** (White copy) now has the +level max-HP AE (06-14b); the **Green** copy followed (06-16b).
- [ ] Reaction economy (1 reaction/round across ALL talents) is only approximated per-talent — GM still tracks the global limit.

---

# White / Bulwark (2026-06-14b)

A damage-mitigation tree on the `applyDamage` wrapper. Passives pre-reduce; optional reactions post
a whispered post-damage card (heal-back / redirect / retaliate / revive). Setup: a White PC GM-run
or with a player online, allies adjacent / within 10 ft, plus an enemy attacker.

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

# White / Accord (2026-06-14c)

The most narrative White tree. Native conditions (Disoriented/Determined) + owner-judged cards.
Unyielding Accord ships a draggable +1 Cog/Spi AE. Setup: a White PC GM-run or with a player
online, allies in range, an enemy.

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

# Blue / Calculation (2026-06-14d)

The signature is imposing/granting a (dis)advantage on a creature's **next test**, plus Disorient.
Every talent fires on the **owner's own client** (no GM-gating; the cost is consumed by Foundry's
activation), riding the `nextTestMod` flag. Setup: a Blue PC, an enemy token, and (for Anticipate)
an ally in range.

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

# Blue / Illusion (2026-06-14e)

A narrative tree; the automatable half spawns **real friendly tokens** via `edhaSummon`. Setup: a
Blue PC, an ally token + an enemy token, in combat; the summoning user needs ACTOR_CREATE perm
(GM, or a player the GM granted it).

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

# Blue / Foresight (2026-06-14f)

A prediction/initiative tree — mostly manual; the automatable half reuses the Calculation flag.
Setup: a Blue PC, an enemy in range, in combat.

## 1. The automated talents
- [ ] **Intercept** — target the designated creature, use it (pays 1 Inv) → card → click → that creature's **next test rolls disadvantage** (`nextTestMod`).
- [ ] **Reactive Analysis** — use it (pays 1 Inv) after an in-range creature fails a test → **your next test rolls advantage** (chat note; consumed on your next test).
- [ ] **Read Intent** — target a creature, use it (rolls **Blue**, pays 1 Inv) → the engine **auto-compares Blue vs the target's Cognitive defense** and posts the verdict; on a **success** it prompts the GM to reveal the creature's intended action (the reveal stays narrative). No target / unreadable defense → reminder note.
- [ ] **Collected** — Cognitive & Spiritual defenses show **+2** (data-side AE, already built; ⟳ Sync a stale owned copy).

## 2. Calculated Patience — RETIRED as a manual toggle (2026-07-24y)
- [x] ~~console `edha.calculatedPatience()`~~ — **the macro is gone.** The talent is automatic now: on a **Slow turn** its rule fires on your first test by itself. Retested as rows **2bP-1…3**.

## 3. Manual (no Foundry hook)
- [ ] **Forewarned** — silently declare a character + action each round; if they take it before your next turn you gain 1 Reaction (GM/player-tracked).
- [ ] **Telepathic Network** — in-range allies join your network for the scene and "share your expertise" (GM-applied).
- [ ] **Probable Outcome** — you may change your fast/slow turn choice after others choose (GM-adjudicated).

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] `nextTestMod` advantage (Reactive Analysis) and disadvantage (Intercept) apply and clear correctly on the next test. *(Calculated Patience left this flag entirely on 07-24y — it is a pre-roll rider now, not a banked mod.)*

---

# Red — Momentum + Frenzy + Conflagration/Key (2026-06-15)

Movement is **enforced** here (the forced-movement pilot — see `FORCED_MOVEMENT_PILOT.md`).
Setup: a Red PC (Speed set) + an enemy, with a **wall** nearby for collision tests.

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
# Green / Territory (2026-06-16)

Setup: a Green PC + ≥3 enemy tokens + an ally token (for Pack Sense).

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

## 4. Conditions (contest-resolved since PR #42 — no longer auto-on-use)
- [ ] **Grasping Vines** — target an enemy in range, use it → your **Green test** is captured and compared vs the target's **Physical defense**: on **≥** it gains **Restrained** (maintain = 1 Inv/turn, chat note); on a miss, no effect. No target → a "target, then use again" reminder card.
- [ ] **Territorial Instinct** — target a fleeing enemy, use as a Reaction → the engine **auto-rolls the target's Survival** vs your Green total: on **≥** it gains **Immobilized** (auto-expires); on a miss it slips free. Confirm nothing applies when the contest fails.

## 5. Watch-items (couldn't self-verify)
- [ ] `modifyMovementCost` actually doubles the planned move cost at the table (and players can see the drawing).
- [ ] Pack Sense reads the attacker's target via synced `user.targets` on the GM client; the card only posts when a GM is online.
- [ ] Spreading Roots resolves the just-ended combatant's token (`combat.previous.turn`) and the grow-terrain relay updates the Region for a player clicker.
- [ ] Immobilized "this turn" lands ~one turn long under the next-turn expiry convention — confirm that's acceptable, else tighten.
- [ ] **Primal Awareness** stays manual (no Surprise/outdoors/track hooks) — confirm that's fine.

---

# Green / Restoration (2026-06-16b)

Setup: a Green PC + an injured/below-half **ally** token + an enemy that can apply a condition.

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

# Green / Instinct (2026-06-16c)

Setup: a Green PC + ≥1 ally token + an enemy.

## 1. Advantage-granting (the `advAttackNext` primitive)
- [ ] **Pack Hunter** — target an enemy, use it → you (and each ally adjacent to that enemy) get **advantage on your next attack** (chat line); the next attack roll shows advantage, then clears.
- [ ] **Scent the Weak** — use it → chat names the **lowest-HP creature in Attunement Range**; your next attack rolls advantage (once/round).

## 2. Forced movement (contest-resolved since PR #42)
- [ ] **Drive the Prey** — target an enemy, use it (2 Inv) → the engine **auto-rolls the target's Survival** vs your Green total: on **≥** it gains **Slowed** (timed) and chat spells out the move-away + ally Reactive Strikes (GM-narrated); on a miss, "it doesn't break". The old on-use Slowed rule was REMOVED from the talent's Events tab — if Slowed applies with no contest in chat, the leyline pack wasn't rebuilt.

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

# Destruction (Razkael, deity) (2026-06-17)

Setup: a Destruction PC + several enemy tokens, including one **Construct**
(`customType: "Construct"`) and one with **deflect > 0**.

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

# Life (Anaveth, deity) (2026-06-18)

A Blue/Green healer-buffer reusing the Green heal machinery. Setup: a Life PC, a **willing ally**
token, an enemy, in combat.

## 1. Adaptive Mutation (the pick-a-mutation card) ⚑
- [ ] **Adaptive Mutation** — use it → a whispered card stamps ONE mutation on a willing target (one per creature, per scene).
- [ ] **Bone Spurs** — the mutated creature's damaging hits gain **+tier keen** (damage pre-pass; chat note).
- [ ] **Venom Glands** — the mutated creature's hit **Afflicts** the foe: ½[Tier][Die] vital at the start of the foe's turns (the affliction engine; remove the icon to stop it).
- [ ] **Dense Tissue** — deflectable damage (energy/impact/keen) INTO the mutated creature is reduced by 2; Spirit/Vital damage is NOT reduced.
- [ ] The "melee-only" clause on Bone Spurs / Venom Glands is a named backlog hook (applyDamage can't see melee vs ranged yet) — for now the bonus applies to all its attacks; confirm that's acceptable.

## 2. Regen (turn-start heals parked on the owner)
- [ ] **Primal Regeneration** — link a creature → at the **start of ITS turn** it heals Tier+1 ([Tier][Die]+1 if it carries a mutation); taking **Vital or Spirit** damage ENDS the regen (chat note).
- [ ] **Apex Form** (capstone) — a willing creature (may be you) gains +2 Deflect + [Tier][Die] turn-start regen + **+tier vital** on its attacks; persists through damage. ("Takes an Injury when it ends" = named backlog hook; apply the injury by hand for now.)

## 3. Surgical Precision + Lifeline ⚑
- [ ] **Surgical Precision** — use it (skill-test heal) → on a real success (NOT a graze) a **cleanse card** posts (Weakened / Disoriented / Slowed); a graze heals the smaller amount and does NOT cleanse.
- [ ] **Lifeline** — use it to link a creature → when the linked creature takes damage, you get a whispered card (once/round): take **up to half of it as Spirit** yourself and the linked creature **heals [Tier][Die]** (owner-judged click; reuses the Shared-Burden redirect).

## 4. Regression (data-authored — already in the pack before this pass)
- [ ] **Vital Diagnosis** — Diagnosed mark; any damage vs the marked creature gains +tier vital.
- [ ] **Life Surge / Overgrowth** — heals; healing past max HP → Temp HP (Overgrowth's +1 Deflect stack stays manual).
- [ ] **Prognosis** — +[Tier][Die] heal vs a conditioned creature; recover 1 Inv when your Diagnosed creature is hit.

## 5. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The `mutation` / `apexForm` / `lifeline` flags land on GM-owned or other-player targets via the `set-flag` relay when a player clicks.
- [ ] Regen resolves at the TARGET's turn start (not the owner's) and Primal actually ends on Vital/Spirit damage only.
- [ ] Dense Tissue / Apex Deflect reduce only DEFLECTABLE damage types.

---

# Chaos (Maelith, deity) (2026-06-18)

Black/Blue. Signature = **Omens**: a registered `omen` status on the Marked pattern
(`flags.edha-content.markedBy.omen`), cap = tier. Every active talent is a `preUseItem` takeover
that ROLLS the color test and gates the effect on `total ≥ defense` — nothing is trust-the-player.
**Isolated is now also an inflictable status** (OR'd into `edhaIsIsolated`), so Maelith's applied
Isolation feeds the Black tree's Isolation engine. Setup: a Chaos PC + several enemies, in combat.

## 1. Placing Omens (test-gated) ⚑
- [ ] **Entropy Strike** — target an enemy, use it → rolls **Blue vs its Cognitive defense**; on **≥** it gains the **Omen** icon; on a fail, no mark. Chat shows the test line ("Blue X vs Y — success/fail").
- [ ] **Spreading Omen** — same gate, multiple targets; total Omens capped at **tier** (the card refuses placements past the cap).
- [ ] **Isolating Pressure** — rolls **Black vs Physical**; on **≥** the target becomes **Isolated** (the inflictable status). Confirm a Black-tree payoff now sees it (e.g. Severance's vital conversion, `whenTargetIsolated` triggers).
- [ ] **Ruin** — **Black vs Physical**; on success, Isolated + the Omen payoff.

## 2. Cashing Omens ⚑
- [ ] **Cascade Collapse** — rolls Blue **per bearer vs each one's own Cognitive**; damage lands via the burst pipeline (players relay to the GM).
- [ ] **Unweaving** — **Black vs Spiritual** → the Omen payoff; the arbitrary-effect dispel posts a GM card (manual by nature).
- [ ] **Shatter Focus** (Reaction) — remove one of your Omens → the bearer **rerolls and takes the lower** (the roll card is rewritten via `edhaRewriteOrRelay`).
- [ ] **Unravel Everything** (capstone) — marks all in range up to the cap, then detonates all Omens.
- [ ] **Void Sense** (passive) — any Omen-bearer of yours takes damage → you recover **1 Investiture** (once/round). (The see-through-walls vision is manual.)

## 3. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The `omen` / `isolated` status icons render (registered custom statuses) and the cap counts only YOUR bearers.
- [ ] Duration fidelity: cards say "until the START of your next turn" but the engine's timed expiry is END-of-next-turn — a documented one-turn over-extension (same convention as Subtle Suggestion). Confirm it's acceptable.
- [ ] Player-initiated Omen placement / detonation relays GM-side (a GM must be online).

---

# Fate (Olvarra, deity) (2026-06-19)

Green/White. Zones ride the Destruction Charge lifecycle: click-placed 5 ft markers in owner flag
state (cap = tier, oldest fizzles, cleared at combat end). Snares spring via a real v13 Region
behavior (`edha-content.fate-snare`) on enter OR pass-through. Every active is a `preUseItem`
takeover (cancel → cost refunded). Setup: a Fate PC + enemies + an ally, in combat.

## 1. Zones ⚑
- [ ] **Ordained Ground** — use → click-place a 5 ft zone (cap = tier; oldest fizzles); Esc/right-click cancels → cost refunded.
- [ ] **Snare** — use → click-place; an enemy that ENTERS **or passes THROUGH** the square springs it: [Tier][Die] + Awareness keen + **Restrained**, and the snare is consumed. Walk a token straight across without stopping — it must still spring.
- [ ] **Inevitable Snare** — flags the last-placed Snare (+1 Inv) → on trigger it deals **+[Tier][Die] keen** AND the engine rolls the foe's **Speed vs your Green DC** → **Disoriented** on a fail (engine-rolled, never trust-the-player).
- [ ] Zone markers + snares clear at combat/scene end.

## 2. Ordained turn-start buffs
- [ ] An **ally starting its turn on an Ordained square** gains **+1 to all defenses** (a self-cleaning AE — confirm it's removed when it starts a later turn OFF the square).
- [ ] **Bulwark Ground** (if owned) — that ally also gains **Temp HP = tier**, and attacks against it **cannot gain advantage** while it stands there (the no-advantage pre-roll injector — an attacker with advantage rolls flat).
- [ ] Action-grants (Aid at range / free Strike / Reactive Strike) post PROMPT cards naming who may act — the action itself is taken by hand.

## 3. Hexmark + thread talents ⚑
- [ ] **Hexmark** — mark a foe; when the marked foe takes damage **near your zones**, that hit gains **+tier keen** (damage pre-pass, no recursion).
- [ ] **Read the Threads / Foreknown Strike / Thread of Inevitability** — card-button reuses of the snare/zone resolvers (reposition / strike prompts); confirm the buttons act and the costs deduct.

## 4. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The fate-snare Region arms for players via the GM relay (`place-fate-snare`) and is dropped when sprung/moved (`delete-fate-snare`).
- [ ] Pass-through triggering (`tokenMoveIn`) vs plain entry — test both.
- [ ] The no-advantage injector suppresses advantage ONLY against the buffed defender and leaves other rolls untouched.

---

# Sovereignty (Verdannis, deity) (2026-07-01)

Setup: a Sovereignty PC + one allied PC + several enemies — at least one whose weapon damage uses
a ladder die (d4–d12) and one with an off-ladder die (flat or d20) to confirm it's left alone.

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

## 3. The GM-side watchers (Expose / Edict of the Fallen THP / Balance / Sovereignty) ⚑
- [ ] **Expose** — a Censure/Decree-Diminished enemy makes an **attack** (target synced) that **fails** (total < the target's Physical defense) → the owner auto-recovers **1 Investiture** (no cap); if the attack's target is the owner's ally in White range, a **Reactive Strike prompt card** names them (the strike itself is by hand). Confirm NO recovery on a hit.
- [ ] **Expose fallback** — the same enemy makes a **skill test** (no DC readable) → the owner gets a whispered card with an "It failed — recover 1 Investiture" button (owner-judged).
- [ ] **Edict of the Fallen THP rider** — the marked enemy fails an attack test → each ally in the owner's White range gains **THP = the owner's Tier** (keeps-the-higher, never stacks).
- [ ] **Sovereign's Balance** (2 Inv) — target ONE ally + ONE enemy, then use → both stepped, timed. If the ally **hits** that enemy **in the cast round** (attack total ≥ its Physical defense), both effects **auto-extend one round, once** (card announces it). No extension on a later-round hit.
- [ ] **Sovereignty hit card** — each detected ally→enemy hit posts the "no reactions until the start of its next turn" card (denial itself is GM-enforced).

## 4. Sovereign's Favor + costs
- [ ] **Sovereign's Favor** owned → each **Exalt** also grants the ally **THP = [Tier][Die on White]** (rolled; re-Exalting keeps the HIGHER THP — never stacks). Investiture of Authority does NOT trigger it (literal "when you use Exalt").
- [ ] Every active pays its Investiture through its own use; bad targeting (no enemy / no ally+enemy pair / once-per repeat) warns **without charging**.

## 5. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The damage-die rewrite bakes the formula then steps ladder dice via regex — check a graze roll, a damage roll with riders (Kindle-style bonuses step too: they're the roller's own damage), and that the chat breakdown shows the stepped die.
- [ ] `edhaSovIsAttackItem` (weapon type / `system.attack` / activation "attack") is the Edict of the Fallen scope gate — confirm a real adversary attack matches and a utility talent doesn't.
- [ ] Hit/fail detection reads the synced target's **Physical** defense only (attacks vs Cog/Spi defenses won't auto-resolve — they fall back to the Expose click card / no Balance extension).
- [ ] Player (non-GM) casts write die-steps to GM-owned enemies via the `set-flag`/`toggle-status` relays (a GM must be online); the watchers + sweep run on the GM client.
- [ ] Out-of-combat casts stamp their expiry lazily on the first combat turn change ("owner-next").

---

# Death (Morrath, deity) (2026-07-02)

Setup: a Death PC + one allied PC + several enemies — at least one **Weakened**, one below half
HP, and one healthy full-HP enemy (for the Consuming Decay gate). The `harvested` + `decaying`
icons should render with their **green tint** on a token (if the tint doesn't render, fall back
to a distinct icon file — one-row change in `EDHA_STATUSES`).

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

# Civilization (Kethane, deity) (2026-07-02)

07-17 bench already passed the setup checks, Lay Foundation, Siege Form, and the fortified-Region
enter-firing. Setup: a Civilization PC + one allied PC + several enemies, on a gridded scene with
room for 10 ft squares.

## 1. Forge Construct (the pre-standard wiring, re-audited)
- [ ] **Forge Construct** (1 Action, 1 Inv) → summons beside you: HP = [Tier][Die white] + tier×2, deflect 1, Speed 25, defenses = yours −2, **Construct Slam** (Athletics vs Physical, [Tier][Die white] impact), slots onto your initiative, carries the baked toggled-off **Siege Form** effect + **Siege Cannon** item. Using it again with a live Construct **dismantles the old one and reforges** (sustain ONE, Ben R1) — non-GM casts need a GM online (dismantle relay). Actor-create permission still required (GM casts for players — carried backlog).

## 2. Tempered Edge ⚑
- [ ] **Tempered Edge** (passive) — a **Construct Slam** hit auto-adds **+[Tier][Die red] energy** (rolled vs the summoner) and bumps the hit by the target's **deflect** value (net: the Slam ignores deflect — chat line names both). Confirm the rider does NOT fire on the Siege Cannon (ranged), and not at all if the summoner doesn't own the talent.

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
- [ ] The Bastion **Slowed expiry** stamps the CURRENT turn coord — confirm it clears exactly at the next turn advance and reads right at the table.
- [ ] `agi` as the Agility skill id in `edhaRollOpposedSkill` (Bastion/Magnum saves) — if the roll comes back flat 1d20, the id is wrong (one-line fix).
- [ ] Magnum's HP write targets `hea.max.override` on the summon (created with an override max) — confirm value AND max both climb by the same amount.
- [ ] The Colossus splash + Tempered Edge rider both key off `edhaDealerOf` — confirm they attribute correctly when the GM clicks Apply on the Construct's damage card (15 s dealer memory).
- [ ] Trade Routes' Teleport for a non-owner-moved token relies on the `move-token` relay (GM online).
- [ ] Player (non-GM) flows: Bastion via `civ-fortify`, links via `civ-link`, reforge via `civ-dismantle` — a GM must be online for all of these; Forge Construct itself still needs actor-create permission.

# Power (Tyrith, deity) (2026-07-02c)

Setup: a Power PC (with a melee weapon) + one allied PC + several enemies on a gridded scene.
The Kneel movement VETO itself passed the 07-17 bench — these rows are the talent takeovers and
escalation economy around it.

## 1. Kneel + Absolute Authority (Black vs Cognitive takeovers) ⚑
- [ ] **Kneel** (1 Action, 1 Inv) → refused **without cost** with no target / target out of Black range. On use: ONE engine Black roll vs the target's Cognitive (no stray system card). Success → the target wears the new **Compelled** icon, expiring at the start of your next turn (owner-relative); the card states the move-toward-or-nothing clause (GM-run). Failure → status-free, cost stays spent.
- [ ] **Kneel's passive advantage** ⚑ — with a target bearing Compelled/Frightened/Weakened **in Black range** synced-targeted, your attack roll opens with **advantage** pre-selected (dialog) or fast-forwards with it; no advantage when out of range or the status is absent. `frightened` is a GM-applied marker (nothing auto-inflicts it).
- [ ] **Absolute Authority** (2 Actions, 2 Inv) → refused **without cost** unless the target bears Compelled/Frightened/Weakened (gate ENFORCED) and stands in Black range. Success → the "you choose its next action (no direct self-harm)" card (forced volition — GM-run). Failure → the target is **Weakened until the end of ITS next turn** (auto-applied, auto-expiring).

## 2. Crown of Thorns ⚑
- [ ] Arm (2 Actions, 2 Inv) → re-arm refused pre-cost. While armed, **every engine-resolved Black/Red vs-Cognitive test pings**: Kneel and Absolute Authority (success AND failure), plus Sovereignty's Censure / Decree of Ruin if the same PC owns them — the tested character takes **spirit = Presence** (spirit bypasses deflect = "cannot be reduced").
- [ ] The arming card's **"Crown ping"** button covers tests the engine did NOT resolve: target the character, click → same spirit damage. Wearer/GM only; refused when the scene ended (flag cleared).

## 3. Warlord's Advance + Momentum of Victory ⚑
- [ ] **Warlord's Advance** (1 Action, 1 Inv) → use arms the strike; your next WEAPON hit auto-adds **[Tier][Die red] impact** into the SAME damage application (chat line; don't also roll the card). **Kill** (that hit drops the target live→0, rider included) → you gain **Temp HP = tier** + the whispered **10 ft free-move** prompt. **Survivor** → advantage armed on your next **Presence-attribute** test (the vs-that-target binding + until-your-next-turn expiry are card-noted/trusted). No more GM kill adjudication.
- [ ] **Momentum of Victory** (Free, 1 Inv + **Opportunity — listed, never auto-deducted**) → posts the move-15-ft + free-Strike card; the next WEAPON hit auto-adds **+tier impact**, consumed on fire.

## 4. Unstoppable Advance (the new move-through watcher) ⚑
- [ ] Use (1 Action, 1 Inv; re-use refused while active) → moving your token **through an enemy's square** deals that enemy **[Tier][Die red] impact** (own roll per enemy, auto-applied GM-side) — **once per enemy per activation**, however many segments you drag. Allies and corpses are skipped.
- [ ] While armed, applying **Slowed / Immobilized / Prone** to you is **shrugged off** (the effect is deleted with a chat note).
- [ ] The flag **expires after your next turn** (sweep); armed out of combat, it stamps at the first turn change. Trample kills feed Warlord's Fury (real attribution via burst-apply).

## 5. Investiture of Command + Warlord's Fury ⚑
- [ ] **Investiture of Command** (2 Actions, 2 Inv) → refused **without cost** with zero valid targets (allies = same disposition, alive, in **Black** range; max 3). ONE shared **[Tier][Die black]** roll → each ally gains that **Temp HP** (keeps-higher, no stacking) + **advantage on its next attack test** (consumed on their next attack). The caster then takes **tier spirit** automatically. No more first-ally-only behavior.
- [ ] **Warlord's Fury** (2 Actions, 2 Inv; re-arm refused pre-cost) → melee WEAPON hits gain **+tally** (dealt type), tally = hostile non-summon NPC victims YOU dropped below half max HP (once each) **+1 per kill** (one blow crossing both counts twice), capped **tier×2** live. PC/ally/summon drops do NOT count (Ben R7). Whispered tally cards on each rise.

## 6. Mantle of the Aspirant (capstone, once/scene) ⚑
- [ ] Use (3 Actions, 3 Inv) → second use refused pre-cost. You wear the **+2 all-defenses** AE for the scene; your melee WEAPON hits auto-add **+tier spirit**.
- [ ] **Ally aura** ⚑ — an ally standing in your **Black** range rolls ANY test at **+1** (a flat `+1 Mantle of the Aspirant` term on the d20 roll); the wearer is excluded; out of range = no bonus. **Watch-item: dialog rolls** — if the configure dialog rebuilds the formula and drops the +1, that's the known risk (fallback = AE, named backlog).
- [ ] **Redirect** — taking damage whispers the redirect card (budget = min(tier, HP lost)): target a willing ally in Black range, click, choose the amount → the ally takes it (with `edhaRedirected` when applied directly — Devoted Conduit stays honest), the wearer heals back the same; the button decrements until the budget is spent. Damage fully eaten by Temp HP prompts nothing.

## 7. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The Mantle **+1 NumericTerm append** vs `configureModifiers`/dialog re-configuration — the one genuinely new roll-pipeline surface this pass.
- [ ] The move-through watcher samples **one straight segment per updateToken** — bench multi-waypoint drags (v13 fires per movement operation, but confirm) and diagonal near-misses (center-distance ≤ half token width).
- [ ] `compelled`/`frightened` status registration + the Compelled owner-relative expiry (applied via `edhaApplyTimedStatus`, not the auto-stamp set).
- [ ] Warlord's Advance's pre→post handoff (`_edhaWarlordHit`, 15 s) when the GM clicks Apply on the damage card late.
- [ ] Crown of Thorns pings ride `burst-apply` — a player wearer needs a GM online.
- [ ] All scene state (crown/fury/unstoppable/mantle flags, the Mantle AE, compelled/frightened icons) clears on **deleteCombat**.

---

# Knowledge (Gnothis, deity) (2026-07-03)

Setup: a Knowledge PC (with a weapon) + at least one allied PC (a **different player**, for the
multi-player visibility items) + a couple of enemies on a gridded scene.

## 1. Studied Mark + the Insight economy ⚑
- [ ] **Studied Mark** (1 Action, 1 Inv) → refused **without cost** with no target / target outside Green Attunement Range. On use: the target gets **2 Insight** and a whispered card (owner + GM only) reads out its current HP, conditions, and Physical/Spiritual defenses.
- [ ] ⚑ **The `insight` status's stack count** — confirm the token HUD (or the effect's data in the console) actually shows **2**, not just the icon present. This is the single biggest bench-verify item in the tree: the count is written via `effect.update({"system.count": n})` — if the real cosmere-rpg field isn't named `count`, the icon will still toggle on/off correctly but the NUMBER shown will be wrong. Named fallback: swap the field in `edhaGnosisInsightOn`/`edhaGnosisApplyInsightGM` once confirmed.
- [ ] Studied Mark a **second, different** creature → the first creature's Insight/icon clears to 0 automatically (one bearer at a time, tree-wide).

## 2. Predatory Strike + Hunter's Discipline (weapon-hit riders)
- [ ] **Predatory Strike** (1 Action, 1 Inv) → arms the rider (no stray card/roll of its own); your next weapon hit auto-adds **[Tier][Die red] × max(Insight on target, 1)** vital, then places **+1 Insight** on the actual target hit. A **miss** does nothing (no bonus, rider stays armed for the next attempt — confirm it does NOT fire on a 0-damage call).
- [ ] **Hunter's Discipline** (passive) — hitting your OWN bearer with anything (not just a weapon) adds **+Tier vital**; hitting a NON-bearer or an ally hitting the bearer does **not** trigger this (owner-only, unlike Pack Share).
- [ ] **On-kill** ⚑ — your bearer drops to 0 → a **whispered** (owner + GM only) prompt lists creatures in Green range; clicking one transfers **floor(slain Insight / 2)** to it. No candidates in range → an informational card, no prompt.

## 3. Killing Blow + The Final Study (Red vs Physical takeovers) ⚑
- [ ] **Killing Blow** (1 Action, 2 Inv) → refused **without cost** if you have no bearer (no target-picking needed — it resolves against your current bearer automatically). Roll 1d20+Red vs the bearer's Physical defense (public card, ONE engine roll, no stray system card). **Success** → `[Tier][Die red] × Insight count` vital, ALL Insight cleared. **Failure** → `[Tier][Die red] × 1` vital, **1** Insight removed (not cleared).
- [ ] **The Final Study** (3 Actions, 3 Inv, capstone) → same test shape; second use in the same scene refused pre-cost. **Success** ALSO lists allies in Green range for a free Strike (player-executed, not auto-rolled).
- [ ] Confirm **no name collision**: your Green PC's actual "Apex Predator" (≥3 enemies in terrain → advantage) is unaffected by anything in this tree — they are now different cards entirely.

## 4. Accumulate (start-of-turn tick + damage→Inv, two different mechanisms)
- [ ] Start of your turn, bearer in Green range, Insight < 5 → **+1 Insight**, auto (public card). Bearer out of range, or Insight already at 5 → nothing.
- [ ] Bearer takes damage from **any** source (not just your own hits) → **+1 Investiture**, capped **once per round** — this rides the SAME generic dispatch as Life's Prognosis (`edha-marked-damage-trigger`), not new engine code; confirm it doesn't also fire a second time in the same round from a different damage source.

## 5. Pack Share + The Pack (ally riders, both stack if both armed) ⚑
- [ ] **Pack Share** (1 Action, 1 Inv) → arms for the scene (re-arm refused pre-cost); the public arming card includes the HP/conditions/defenses reveal — confirm your **ally's own player** (not just the caster) can see this card and the "first hit places Insight" button context.
- [ ] An ally (not you) hits the bearer in your Green range → **+Tier vital**, auto. Once per round, the FIRST such hit ALSO places **+1 Insight** — confirm a second ally hit the same round adds the damage bonus again but does NOT place a second Insight.
- [ ] **The Pack** (1 Action, 2 Inv) → same ally-hit shape, but the bonus is **+ your current Insight count** (live, re-read each hit) instead of a flat Tier; its own independent once-per-round Insight-placement trigger.
- [ ] Arm **both** Pack Share and The Pack in the same scene → an ally's hit stacks BOTH bonuses (additive, by design — R10) and can place up to **+2** Insight from the same first hit of the round (one from each talent's own trigger — R11).

## 6. Death Mark (on-kill full transfer + the ally-choice burst) ⚑
- [ ] Your bearer drops to 0 → a whispered (owner + GM only) prompt transfers the **full** slain Insight count to a chosen creature in Green range (same shape as Hunter's Discipline, just the full count instead of half).
- [ ] The SAME on-kill event ALSO posts a **public** card (not whispered) with one button per ally in Green range — confirm each ally's OWN controlling player can see it and click their own ally's button, target an enemy, and see `[Tier][Die red]` (baked off the KNOWLEDGE OWNER's own Tier/Red rank, not the acting ally's) land on that enemy.
- [ ] If a PC also owns **both** Hunter's Discipline and Death Mark, confirm BOTH transfer prompts post independently (R9) — clicking one, then the other, leaves whichever was clicked LAST as the actual final bearer.

## 7. Watch-items (couldn't self-verify — no Foundry session)
- [ ] **⚑ TOP ITEM**: `effect.system.count` as the stackable `insight` status's real field name (see §1) — everything else in the tree is unaffected if this needs a one-line swap.
- [ ] The Predatory-Strike pre→post handoff (`_edhaGnosisPredatoryHit`, 15 s) on a late GM Apply click (the standing Warlord's-Advance-shaped limitation).
- [ ] Multi-player visibility: Pack Share's reveal card and Death Mark's ally-burst card are deliberately **public** (not whispered) so other players' controlled allies can see/click — confirm this reads cleanly at the table and doesn't feel like a spoiler leak to the GM.
- [ ] All Knowledge scene state (`gnothisBearer`, `predatoryStrikeNext`, `packShareActive`, `thePackActive`, `finalStudyUsed`, the `insight` status/effect, `markedBy.insight`) clears on **deleteCombat**.

---

# Order (Tessavain, deity) (2026-07-03b)

Setup: an Order PC + TWO allied PCs (one controlled by another player's client, for the
multi-client rows) + several enemies on a gridded scene. The `edict` + `covenant` icons are
tinted — if a tint doesn't render, fall back to a distinct icon file (the Death-tint caveat).

## 1. Edict + the violation model (the spine) ⚑
- [ ] **Edict** (1 Action, 1 Inv) → refused **without cost** with no target / target outside Blue Attunement Range; the prohibition dialog's Cancel spends nothing. On use with "move from its space": the target wears the blue **Edict-Bound** padlock and the card posts with the **⚖ Violated** button (+ the Lawkeeper GM-reveal line if owned, + the "you may Seal it" note if Sealed Edict is owned).
- [ ] **Move watch** — move the bound token → the owner gets a whispered "Edict watch" PROMPT (once per round). Confirm nothing auto-fires (forced movement is not "taking the action" — the button is the ruling).
- [ ] **⚖ Violated** click → ONE [Tier][Die blue]+Int spirit roll auto-applies + **Disoriented** (expires after the owner's next turn), the Edict is consumed, the padlock clears (unless another Edict/Decree still binds them). A second click warns "no longer active" and does nothing (no double damage).
- [ ] **Investiture watch** — bind "activate Investiture", the bound enemy spends Inv → prompt. **Attack watch** — bind "attack <chosen ally>", the bound enemy attacks THAT synced ally → prompt; attacking anyone else → NO prompt.
- [ ] **Cap** — with tier Edicts up, placing another makes the **oldest fade** (whispered note; that target's padlock clears if no other law binds it). Repeat Edicts on the SAME target (different prohibitions) are legal — each resolves separately.

## 2. Sealed Edict + Verdict (the Discipline courts) ⚑
- [ ] **Sealed Edict** (Free, 1 Inv) → refused **without cost** with no unsealed Edict. Seals your MOST RECENT unsealed Edict (the card names it). On that Edict's violation the engine ALSO rolls the target's **Discipline vs your Blue** (one card — the engine rolls the foe): a FAIL adds [Tier][Die blue] spirit + **Weakened until the end of ITS next turn**; "holds firm" adds nothing. Confirm it never applies on trust.
- [ ] **Verdict** (2 Actions, 2 Inv) → refused **without cost** when the synced target isn't bound by YOUR Edict or is out of Blue range. ONE engine **Blue vs Cognitive** roll (no stray system card). **Failure** → card, cost stays spent, the Edict survives. **Success** → that Edict resolves in full (damage + Disoriented + Sealed rider if sealed, consumed), THEN each **other** enemy within 10 ft rolls Discipline vs your Blue — failures take ONE shared [Tier][Die blue] spirit roll + Disoriented until the start of your next turn; the bound target itself is NOT in the 10 ft court.

## 3. Covenant + the proximity buff ⚑
- [ ] **Covenant** (1 Action, 1 Inv) → refused **without cost** on: no target, an enemy, a non-adjacent ally (**touch enforced** ≤5 ft), or an ally you already covenant. On use: the ally wears the white **Covenant** aura icon; the card carries the Break button + the Aid-at-range note (by hand).
- [ ] ⚑ **Proximity AE** — with owner and ally within White Attunement Range of EACH OTHER, both wear a "+1 all defenses — Covenant (<owner>)" AE (confirm the displayed defense values actually bump). Move them apart → both AEs drop (≈250 ms debounce or the next turn change). The OWNER wears only ONE +1 even with two partners in range; an ally covenanted by TWO different Order PCs wears one +1 per owner.
- [ ] **Break watch** — either partner damages the other → the owner gets the whispered "Covenant watch" prompt (once per pact per round); the Break button ends the pact (icon + AEs clear).
- [ ] **Cap** — tier Covenants; an over-cap pact dissolves the oldest.

## 4. Bear Witness + Shoulder the Oath (the White riders) ⚑
- [ ] **Bear Witness** — at the START of each ROUND (the round counter advances), every covenanted ally within White range gains **Temp HP = your White rank** (keeps-higher, never stacks; public card). Out-of-range or 0-HP allies get nothing; the OWNER gets nothing. Confirm round 1 (combat start) fires, and a mid-combat reload does NOT double-grant.
- [ ] **Shoulder the Oath** (Reaction, no cost) — a covenanted ally LOSES HP with you in White range → whispered card: take **floor(D/2)** yourself as the SAME damage type, the ally heals back **min(D, half + White)**, BOTH gain White-rank Temp HP. Once per round; damage fully eaten by Temp HP prompts nothing; your own hit on the ally prompts the Covenant watch, not Shoulder.

## 5. Lawkeeper's Eye + Concord ⚑
- [ ] **Lawkeeper's Eye** ⚑ — with an Edict-bound enemy synced-targeted, the OWNER's attack roll opens with **advantage** pre-selected (dialog) or fast-forwards with it; an allied PC (same disposition) attacking it ALSO gets advantage; an enemy attacking it does NOT. "While you can see" is owner-judged (no LOS primitive). The intent-reveal clause is the GM-narrated line on the Edict card (the Read-the-Threads no-AI-intent backlog).
- [ ] **Concord** (2 Actions, 2 Inv) → refused **without cost** with zero Covenants or when already formed this scene. While armed: a covenanted ALLY's first damaging hit on an ENEMY each round gains **+your Presence** (same type as the hit, chat note); a second hit the same round does NOT; the OWNER's own attacks never do; a clean miss leaves the rider for the next hit. The Aid-grant Free Action is a card note (by hand).

## 6. Final Decree (capstone, once/scene) ⚑
- [ ] Use (3 Actions, 3 Inv) → refused **pre-cost** on re-use / with no enemies in Blue range; the dialog's Cancel spends nothing. On use: EVERY enemy in Blue range wears the padlock (decree-bound — does NOT count against the Edict cap), Covenant allies are named Witnesses on the card.
- [ ] Watchers prompt on any bound enemy taking the prohibited action; **⚖ Violated (target the violator first)** fires the batch: (1) every active Edict resolves individually — own roll, own target, Sealed riders included; already-dead targets are skipped but consumed; (2) ONE shared **[Tier][Die WHITE]** roll → Temp HP to every Witness (keeps-higher) + advantage on their next attack test; (3) ONE shared [Tier][Die blue]+Int spirit roll to each enemy within 10 ft of the violator — **violator included**. Padlocks clear except where real Edicts remain; a second click no-ops.

## 7. Watch-items (couldn't self-verify — no Foundry session)
- [ ] The `edict`/`covenant` status **tints** on token icons (the Death-tint caveat — fallback = distinct icon files, one-row change in `EDHA_STATUSES`).
- [ ] The Covenant proximity sweep on `updateToken` — watch AE create/delete churn on long drags (250 ms debounce) and confirm `system.defenses.*.bonus` folds into the displayed values.
- [ ] `dis` as the Discipline skill id in `edhaRollOpposedSkill` (the Sealed Edict/Verdict courts) — a flat-1d20 foe roll means the id/attr is wrong (one-line fix; attr wired `wil` per foundry-build's SKILL_ATTR).
- [ ] The start-of-ROUND primitive fires exactly once per round boundary (combat start + round advances) and never on mid-round turn changes.
- [ ] The Investiture-spend watch fires on ANY inv decrease (a GM hand-edit also prompts — the owner judges; that's the prompt-not-fire design).
- [ ] Player (non-GM) flows: Edict/Decree statuses + damage land via the `toggle-status`/`burst-apply` relays; the proximity AE + every watcher/prompt runs GM-side — a GM must be online.
- [ ] All Order state (`edicts`/`covenants`/`concordActive`/`finalDecreeUsed`/`decree`, both icons, the covBuff AEs) clears on **deleteCombat**.

---

# Black — 07-05 test-pass fixes (the rows still unbenched)

Fixes from Ben's 2026-07-05 in-Foundry Black pass. Rulings baked in: Isolated = **no ally within
5 ft (adjacency incl. diagonals)** everywhere; Reserve spends through the Spend-Investiture
dialog; Extract Thought = auto-resolved passive; Opportunity menu = shared primitive. 07-17 bench
already passed the setup checks, Draw Mana's isolation accounting, the Dread Presence veto, the
Withering Ray cost cell, and both watch-items (the Opportunity menu firing + the dialog injection).

## 1. Isolation (5 ft ruling + visibility) ⚑
- [ ] **Isolated icon (auto-sync)** — in combat, a combatant with no living ally adjacent (5 ft, diagonals count) shows the **Isolated** net icon automatically; move an ally adjacent → the icon clears by itself. Out of combat / combat end → all auto icons strip.
- [ ] **Sapping Hex** — hit a target that has the Isolated icon → Weakened (regression); hit a NON-isolated one → nothing.
- [ ] **Severance** — regression: vital conversion still fires vs an adjacent-ally-free target; and the stray **blank roll card is gone** (it was Predatory Patience's 0-heal Investiture card — now a labeled text card).
- [ ] **Unnerving Approach** — move adjacent to an enemy, target it, use: whispered card lists its allies within 10 ft → click one → it's pushed [Size] ft directly away FROM YOUR TARGET (not from you), stopping at walls; Isolated marker re-syncs. Once per turn enforced. ⚑ (also: player-owned client → the push relays through the GM)
- [ ] **Predatory Patience** — attack a Weakened creature via the roll dialog: the breakdown shows **`1d8[Predatory Patience]`** (real die, labeled), not `1d(2x3+2)`; on the applied hit a **labeled card** "⚡ Predatory Patience — regains 1 Investiture" posts.

## 2. Ritual (Reserve spend + Double Dip + card labels) ⚑
- [ ] **Reserve readout** — sits under the **Investiture bar** (red pill "🩸 Reserve r / cap"), no longer in the talent/attr/skill budget bar.
- [ ] **Spend from Reserve** — with Reserve ≥ cost, use any Investiture talent → the Spend-Investiture dialog shows a **"Pay from Reserve instead"** checkbox; check + Continue → Investiture untouched, Reserve drops, chat card confirms. Unchecked → Investiture spends as before. (Not offered when Reserve < the full cost.)
- [ ] **Double Dip** ⚑ — target an enemy, use it (2 Inv) → its own Black test auto-resolves vs the target's **Cognitive** defense (verdict card). On success, use **Withering Ray / Dark Investiture on that target** → a **"pay from Reserve?"** prompt replaces the HP loss on Yes; card states no Blood Price / no re-banking. Against an UN-marked target → no prompt, HP paid as before. Marks clear at combat end.
- [ ] **Dark Investiture** — card text now names the immediate [Tier][Die] vital + the ongoing Afflicted tick (Model A, as approved).
- [ ] **Predator's Due** — kill a creature → the heal card is **labeled** ("⚡ Predator's Due (name) — regains X health; regains 1 Investiture") with the dice under it.

## 3. Subjugation (control visibility + Opportunity menu) ⚑
- [ ] **Predatory Insight (passive)** — WITHOUT ever using the active: drop an enemy to 0 focus **via Whispered Doubt's extra loss** (spend its focus down so the +1 loss lands the 0) → the owner regains 1 focus. Also via a direct GM spend to 0. (Root cause: our own Whispered-Doubt write bypassed the focus watcher.)
- [ ] **Opportunity menu** ⚑ — roll any test until an **Opportunity** shows (plot die or nat 20) → a menu card posts: "Predatory Insight: Advantage on your next Deception test this round — spend 1 Investiture" + the canon spends as a text footer. Click → 1 Inv deducted, next Deception test this round rolls advantage, menu disables (one spend per card). Let the round pass without testing Deception → the grant silently expires.
- [ ] **Hollow Command (auto-resolved)** ⚑ — target an enemy, use it → its Deception test resolves vs the target's **Spiritual** defense. Success → target wears **"Cannot Act (Hollow Command)"** (auto-expires end of ITS next turn) and **Siphoned Will** auto-pays focus = tier (no confirm card needed). Failure → verdict card only, no focus. No target → fallback click-card.
- [ ] **Extract Thought (now passive)** ⚑ — target an enemy and roll a **Deception** skill test: total ≥ its Spiritual defense → "🧵 Extract Thought" card + the **"No Reactions"** marker on the target (auto-expires end of YOUR next turn); below its defense → silence. No synced target → nothing; unreadable defense → owner-judged click-card.
- [ ] **Puppeteer cue** ⚑ — a combatant at **0 focus** in your Attunement Range starts its turn → you get a whispered **reaction card**; click → spends 2 Focus + 1 Inv and posts the public "chooses one of its actions" note (the action itself stays GM-run). Once per round.

## 4. Watch-items (couldn't self-verify — no Foundry session this pass)
- [ ] The Isolated marker sync doesn't flicker on long drags (it's debounced 250 ms) and never fights Maelith's inflicted Isolated (markers carry `isoMarker`; inflicted effects don't).
- [ ] Dread Presence's veto doesn't block legitimate moves (it blocks only moves that measurably reduce the distance to ANY living same-disposition token while Weakened + in range). GM override: toggle Weakened off, move, re-apply — or ask and we'll add a bypass key.
- [ ] `noactions` / `noreactions` marker expiry: end of the TARGET's next turn (Hollow Command) vs end of the OWNER's next turn (Extract Thought).

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
