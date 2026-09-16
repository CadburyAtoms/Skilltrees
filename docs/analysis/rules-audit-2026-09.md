# The rules audit against the Mistborn Handbook — 2026-09-16

**Why this exists.** Ben, 2026-09-16 in chat: *"We are creating a module that fills the same role
as Stormlight and Mistborn — a skin on an existing rules system. If we published a handbook, our
Chapter 3 would be exactly the same. Thus, anywhere our engine, .md files, skills, memory, etc
contradict Chapter 3 of the handbook, we need to correct ourselves."* Until 2026-09-16 only the
Stormlight **Starter Rules** were on the machine, so a rule fact in this repo was cited to a
60-page excerpt, to the cosmere-rpg system's own code, or — repeatedly — to another repo doc that
cited one of those. TODO_REPO_HYGIENE item 201 is the pass that checks every such claim against
the published rule.

**Source.** The `handbook` JournalEntry pack of the installed module
`cosmere-rpg-mistborn-handbook` **v1.0.0** (Brotherwise Games / The Metalworks), 21 journals,
**241 pages**, plus that module's 21-item `actions` pack.

**How it was read** (three steps, reproducible):

1. `cp -r "<FoundryData>/modules/cosmere-rpg-mistborn-handbook/packs/{handbook,actions}" "$TEMP/edha-201-packs/"`
   — Foundry is running and holds each pack's `LOCK`; that one file refuses to copy and nothing
   needs it.
2. `node docs/analysis/talent-comparison/dump-packs.js "$TEMP/edha-201-packs" "$TEMP/edha-201-json"`
   (needs `classic-level@2.0.0`; `npm install --no-save` it if the worktree lacks one).
3. A scratch reader over the dump — journals and pages by `sort`, `value.text.content` stripped of
   HTML with `@UUID[…]{label}` collapsed to its label — used to print one chapter or one page at a
   time. **Nothing from the dump is committed**: the text is Brotherwise's, so this document cites
   chapter and section, paraphrases the rule, and quotes at most a short phrase.

**Pages read in full: 38 of 241**, plus all 21 action items. Chapter 3 complete (9 pages); the
Introduction's three rules pages (Using Cosmere RPG Dice, Game Conventions, Actions and
Reactions); Chapter 4's "Using Paths and Talents" for the activation types; Chapter 9's Time,
Downtime, Resting, Conditions, Durations, Damage/Injury/Death; Chapter 10's Order of Combat,
Actions and Reactions, Attacking, Targeting and Range, Movement and Positioning; Chapter 11's
Focus in Conversations; Chapter 12's Order of Endeavors; Chapter 13's Narrative Advantages and
Disadvantages, Using Adversaries, Building Combat Scenes; eleven Appendix 2 tables (Movement Rate,
Senses Range, Recovery Die, Lifting and Carrying, Injury Duration, Injury Effects, Character
Sizes, Dangerous Terrain, Character Advancement, Actions and Reactions, Scaling Adversary
Threats); and the Glossary. Chapters 5 – 8 are Scadrial content and were searched, not read.

**What "we" means, and in what order each rule was checked against it:** the engine
(`module-src/scripts/engine/*.js`), the docs (`docs/analysis/talent-ecosystem/SYSTEM-PRIMER.md`
and its README, `docs/ACTOR_STAT_DERIVATION.md`, `EDHA_TALENT_HANDBOOK.md`,
`EDHA_FOUNDRY_HANDOFF.md` §10 — read-only for this pass), the skills
(`cosmere-canon-reference`, `leyline-revision-guide`, `deity-revision-guide`, `talent-balance`,
`phrasing-verifier`, `build-forge`, `bestiary-forge`, `session-forge`), the answered rulings whose
premise is a rule fact, and `~/.claude/projects/C--dev-Skilltrees/memory/`.

**Severity** is *changes play* (the table rolls or resolves differently) · *changes a card* (a
player reads something the rules do not say) · *wording*. **Fix class** is DOCS-ONLY · ENGINE ·
DATA · RULING. A DOCS row is fixed in this PR; an ENGINE or DATA row is filed as a TODO item with
its ledger row as the "why"; a decision that is not determinable from the text is filed in
`EDHA_RULINGS.md` §L.

---

## Phase 1 — Chapter 3, Character Statistics

Chapter 3's nine pages are About Your Statistics, Attributes, Defenses, Deflect, Expertises,
Health/Focus/Investiture, Senses, and Skills (which carries tests, DCs, opposed tests, advantages
and disadvantages, working together, Opportunity/Complication ranges, and the eighteen skills).
The Introduction's "Using Cosmere RPG Dice" is read with it, because Chapter 3 defers the test
procedure, the plot die and the Opportunity/Complication spends to it.

| Rule (chapter / section) | Where we contradict it | Severity | Fix class | Disposition |
|---|---|---|---|---|
| **Ch. 3 → Attributes → Speed, and the Movement Rate table (App. 2).** Movement rate is a *ladder* off Speed — 20 ft at SPD 0, 25 at 1–2, 30 at 3–4, 40 at 5–6, 60 at 7–8, 80 at 9+ — not a formula. | `module-src/scripts/engine/52-green-instinct.js:591` `edhaWalkRateFtFromSpd(spd) = 20 + 5·spd`, written as a sheet **override** on every character at `:653`; named in `docs/ACTOR_STAT_DERIVATION.md` §3 as "the one stat Edha still derives differently". A SPD-2 PC walks 30 ft where the book says 25; SPD 4 walks 40 where the book says 30. | changes play | RULING → ENGINE | **R-156** filed (the exact parallel of R-56's senses reversal, which Ben settled "Cosmere ladder for everyone"); build filed as **item 203**, blocked on it. |
| **Ch. 3 → Skills → Opposed Tests.** Your result must *exceed* your opponent's. On a tie **nobody** meets their DC, and "in the case of an aggressive contest, the result favors the defender who's trying to keep things the same." | `module-src/scripts/engine/12-contested-roll-resolution.js:36` — `edhaDefTestOutcome` returns `ok: t >= n` for **every** mode, including `vs: "skill"`, so a tied opposed test resolves for the initiator. Three authored rules ride it: `data/authored/leyline-blue.json:1211`, `leyline-green.json:194` and `:1157`. (`>=` is right for `vs: "defense"` and `vs: "dc"` — you meet a DC.) | changes play | ENGINE | **item 204** — one comparison plus a pinned regression case. |
| **Ch. 3 → Skills → Advantages and Disadvantages.** Per advantage the roller picks one die about to be rolled (d20, plot die, or any other die such as a damage die), rolls two and keeps one; each die once, so two advantages double two different dice. Per disadvantage the opponent picks the die and the kept result. They cancel one for one. | The engine writes the d20 channel only and folds every live source into the one scalar the system holds (`edhaNextModFoldMode`, `module-src/scripts/engine/15-blue-calculation.js`), so a second advantage is discarded. | changes play | ENGINE | **Already covered** — R-155 answered (a) 2026-09-16 (§K.22); the build is **item 202**. Recorded here so the ledger is complete. |
| Same rule. | The house convention recorded in `EDHA_FOUNDRY_HANDOFF.md` §10 — *"Quarry advantage STOMPS an active disadvantage"* — is a second deviation from the one-for-one cancellation, and is not visible from item 202's brief. | changes play | ENGINE | **Already covered by item 202** (its harvest-and-net step replaces the fold); flagged to the PM because §10 is read-only for this pass and its line needs the correction when 202 lands. |
| **Ch. 3 → Skills → Opposed Tests** is a published general rule with a worked example (Athletics against a Lurcher's Allomancy). | `.claude/skills/cosmere-canon-reference/SKILL.md:629` "Skill contests (rare in canon)" tells reviewers a `test [Skill] vs. [Skill]` talent "isn't canonical" and has "weak canonical precedent" — which is how a legitimate shape got treated as homebrew. | changes a card | DOCS-ONLY | **Fixed in this PR** — rewritten as the published rule, with the tie clause. |
| **Ch. 3 → Attributes → Willpower, and the Recovery Die table (App. 2).** WIL 0 → d4, 1–2 → d6, 3–4 → d8, 5–6 → d10, 7–8 → d12, 9+ → d20. | `docs/ACTOR_STAT_DERIVATION.md:86` states the Edha-canon ladder as "WIL 0–1 d4, 2–3 d6, 4–5 d8, 6–7 d10" and marks the system wrong at WIL 7+ ("gives d12 where canon says d10"). The published table **is** the system's ladder; the legacy `Character_Building_Rules.md` is what disagrees. Nothing is live on it — the engine writes no recovery die — but the authority doc says "canon says" about the wrong number. | wording | DOCS-ONLY | **Fixed in this PR.** |
| **Ch. 1 → Character Advancement table** (out of the phased scope, surfaced by a named surface): attribute points at level 1 (12) and then at **6, 9, 12, 15, 18** — there is no level-3 increase. | `.claude/skills/build-forge/SKILL.md:49` and `docs/ACTOR_STAT_DERIVATION.md` §3 both say "attribute points at levels 3, 6 and 9", read from the **system's** `advancement.rules` (cosmere-rpg 2.1.0 `index.js:718` grants 1 at level 3). The two published handbooks differ here and the sheet enforces the Stormlight one, at levels this campaign actually plays. | changes play | RULING | **R-157** filed. No doc edited: changing it means fighting the system's own table, which is Ben's call. |
| **Ch. 9 → Conditions → Diminished** *(published in Ch. 9, listed here because it collides with a Chapter 3 statistic)*: `Diminished [attribute −N]` temporarily lowers one attribute. | `module-src/scripts/engine/01-shared-core.js:191` registers an Edha status with id `diminished` and label **"Diminished"** meaning Sovereignty's *damage die stepped down* — a different mechanic under a published condition's name, on the token HUD and on every card that names it. Two hazards: a player reads the published condition, and `edhaRegisterStatuses` only claims an id `if (!COSMERE.statuses[id])`, so a system release that ships the real Diminished silently takes the id and Sovereignty's step-down stops working (item 177's 3.1.0 upgrade is where that would land). | changes a card | ENGINE + DATA | **item 205** — rename the Edha status (and its `Exalted` partner if the pair should stay symmetrical). |
| **Ch. 3 → Health, Focus, and Investiture**, and **Defenses**: health `10 + Strength`, focus `2 + Willpower`, Investiture `2 + max(Awareness, Presence)`, each defense `10 + both attributes in that category`. | No contradiction — see the confirmed list. Recorded because R-54's answer (remove the `+1` health) is the reason there is none. | — | — | Confirmed. |

### Chapter 3 — confirmed, checked and found right

* **Defenses** = 10 + the attribute pair; the DC of a test against you is your defense in the
  skill's own category unless an effect says otherwise (`docs/ACTOR_STAT_DERIVATION.md` §3,
  `edhaReadDefense`, and `bestiary-forge/STANDARD.md`'s R-139 row all match).
* **Health** `10 + STR` at level 1 and the per-level advancement increases; **focus** `2 + WIL`;
  **Investiture** `2 + max(AWA, PRE)`. R-54 (c) removed the inherited `+1` health in September and
  the published table confirms that was the right call — `EDHA_HP_BONUS = 0`.
* **Senses range** ladder `[5, 10, 20, 50, 100, ∞][ceil(AWA/2)]` — term for term the published
  Senses Range table, and R-56 final ("Cosmere ladder for everyone") lands exactly on it. Ben's
  R-128 gloss — senses range is the radius with your primary sense **obscured**, and a lit area is
  seen beyond it — is the book's own sentence.
* **Deflect** reduces impact, keen and energy; vital and spirit ignore it. Matches
  `cosmere-canon-reference` §Damage Types and the engine's damage handling.
* **Skill modifier** = the skill's attribute + ranks, and the same modifier is added to damage on
  a hit. This is the premise of R-137's PC attack model and it holds.
* **Tier and rank cap**: tier 1 = levels 1–5 (max rank 2), tier 2 = levels 6–10 (max rank 3),
  tier 3 = 11–15 (4), tier 4 = 16–20 (5). `docs/ACTOR_STAT_DERIVATION.md` and SYSTEM-PRIMER are
  right; the leyline guide was not (fixed below).
* **Skill-rank budget** 4 at level 1 plus 1 from the starting path, then +2 a level — the repo's
  `5 + (L−1)·2` is the same number.
* **Opportunity / Complication ranges**: default 20 and 1; an expansion lowers the Opportunity
  range's start or raises the Complication range's end; expansions stack only across
  differently-named effects; on multiple d20s only the kept die counts. The system owns all of
  this and the one Edha talent that expands a range (`data/cosmere.json:2078`, +1) rides it.
* **Automatic successes** produce no Opportunities or Complications; **Round Down** and **Minimum
  of Zero** are the published conventions the engine's `Math.floor` / clamps already follow.
* **Working together**: in combat you must use the Aid reaction; outside it the leader tests once
  and gains **an advantage per helper** — which is a *countable* advantage, one more reason item
  202's counter is the right shape.
* **Gain Advantage** is 1 action, tests a skill against the matching defense, and grants an
  advantage on your next test against that target **using a different skill**;
  `cosmere-canon-reference` already states the different-skill clause.
* An **attribute-only test** ("tests Speed", R-43) has no published counterpart for PCs — every PC
  test is a skill test — but nothing in Chapter 3 forbids one, and Ch. 13 uses exactly that
  fallback for adversaries with no listed rank. R-43 stands; it is an Edha shape, not a
  contradiction.

---

## Phase 2 — Chapters 9 – 13 and the Glossary

| Rule (chapter / section) | Where we contradict it | Severity | Fix class | Disposition |
|---|---|---|---|---|
| **Ch. 10 → Actions and Reactions table (App. 2), and the `actions` pack.** **Grapple costs 2 actions and Shove costs 2 actions.** (Recover is 2; everything else on the list is 1, a reaction, or free.) | `.claude/skills/cosmere-canon-reference/SKILL.md:137,139` lists "Grapple (1 ▶)" and "Shove (1 ▶)"; `docs/analysis/talent-ecosystem/SYSTEM-PRIMER.md:19` repeats both. Every power judgment that priced a talent granting a free Shove or Grapple priced it at half. | changes play | DOCS-ONLY | **Fixed in this PR** — canon-reference rewritten (a living reference), SYSTEM-PRIMER given a dated correction block (a point-in-time analysis). |
| **Ch. 9 → Conditions.** The published condition list is fifteen: Afflicted, Depleted, Determined, Diminished, Disoriented, Enhanced, Exhausted, Focused, Immobilized, Prone, Restrained, Slowed, Stunned, Surprised, Unconscious. **Weakened and Empowered are not among them** (Empowered is Stormlight's, and the cosmere-rpg system carries it; Weakened is in neither book nor system). | `cosmere-canon-reference`'s table lists fourteen conditions and is missing **Depleted** and **Diminished**, both published; `SYSTEM-PRIMER.md:144` lists Weakened and Empowered in a line citing that table, without marking Weakened homebrew. | wording | DOCS-ONLY | **Fixed in this PR** — the two published conditions added with their source marked, Empowered marked SR-only, Weakened kept and marked homebrew (it is fully implemented: `edhaWeakenedPreRoll`, disadvantage on physical tests). |
| **Ch. 9 → Conditions → Unconscious.** A PC may choose to regain consciousness at the end of any of their turns or when healed to 1 health, and at 0 health recovers 1 health when they do; NPCs cannot, and regain consciousness only on being healed. | `cosmere-canon-reference`'s Unconscious row is Stormlight-flavoured ("only Breathe Stormlight and Regenerate available") and omits the PC's choice — the clause R-92's 0-HP drop cue is about. | changes a card | DOCS-ONLY | **Fixed in this PR.** |
| **Ch. 13 → Using Adversaries → Role.** The three roles *are* rules, not bands: **Minion** — "attacks can't critically hit, and they're immediately defeated when they suffer an injury"; **Rival** — no extra rules; **Boss** — takes **both a fast and a slow turn each round**, may spend 1 focus after an enemy's turn for an extra 1-action or free action, and 1 focus on its own turn to remove a condition. | Nothing in `data/adversaries.json` or the engine implements any of it: `role` is used for the leyline rank map (minion 1 / rival 2 / boss 3) and for `STANDARD.md` §3's numeric bands only. A published Boss acts roughly twice as often as ours does, which is also the yardstick the R-134 targets were measured against. | changes play | RULING → DATA + ENGINE | **R-158** filed (adopting the Boss turn changes every boss encounter and re-opens R-134's arithmetic, so it is Ben's call); build filed as **item 206**, blocked on it. `STANDARD.md` gains the published text as PENDING rows in this PR, per its own convention. |
| **Ch. 13 → Building Combat Scenes.** Threat values are Minion 0.5, Rival 1, Boss 4 at the party's own tier, doubling per tier above and halving per tier below; an easy scene totals half the party's size, an average scene the party's size, a hard scene 1.5×. | Not contradicted — **absent**. `bestiary-forge/STANDARD.md` and `session-forge` carry R-134's per-hit targets and R-138's ¼-of-the-party's-HP-per-round line, both homebrew, with no encounter budget beside them. | wording | DOCS-ONLY | **Fixed in this PR** — the published budget stated in `STANDARD.md` §3 beside the homebrew rows, so an encounter can be checked against both. |
| **Ch. 3 / Ch. 10 phrasing.** The book's own verb is that a test or an attack **"gains a disadvantage"**, or that a reaction **"adds a disadvantage"** to it. | `.claude/skills/phrasing-verifier/SKILL.md:274` (and `talent-balance`'s mirror) teaches "have a disadvantage" as *the* state form; an auto-fixer taught that way will eventually rewrite the published verb. | wording | DOCS-ONLY | **Fixed in this PR** — "gains a disadvantage" recorded as the published form and explicitly not to be rewritten. |
| **Ch. 1 → Character Advancement, tier bands.** Tier 1 is levels 1–5 and tier 2 is levels 6–10. | `.claude/skills/leyline-revision-guide/SKILL.md:36` — "Tier 1 = levels 1–4, Tier 2 = levels 5–9". SYSTEM-PRIMER already recorded the drift without resolving it; the published table resolves it. | changes a card | DOCS-ONLY | **Fixed in this PR.** |

### Chapters 9 – 13 — confirmed, checked and found right

* **Ch. 10 → Order of Combat**: a fast turn is 2 actions and goes first, a slow turn is 3; the
  phases are fast PCs, fast NPCs, slow PCs, slow NPCs; one reaction at the start of combat and one
  at the start of each of your turns. SYSTEM-PRIMER's action-economy line and the balance review's
  "a slow turn is three Actions" are right.
* **Ch. 10 → Attacking**: a hit deals the damage dice **+ the skill modifier**; a **graze** costs
  1 focus per target and deals the bare dice; a **critical hit** is bought with an Opportunity and
  maximises the dice against every target of the attack. This is the whole premise of R-137,
  R-139, R-140 and R-143, and all four hold — including the bestiary standard's "one skill
  modifier, not two" and its charging of grazes at 1 focus each.
* **Ch. 13 → Using Adversaries**: adversary attacks print pre-computed modifiers ("Attack +11",
  "1d4 + 6"), adversaries may graze, their tests cannot raise the stakes (no plot die), they are
  defeated at 0 health, they do not gain Slowed from their own listed movement types, and an
  unlisted skill uses the bare attribute. Every one of these matches `STANDARD.md` or the engine.
* **Ch. 9 → Damage, Injury, and Death**: an injury roll is a d20 plus deflect plus ability
  modifiers, −5 per existing injury, read off the Injury Duration table. The engine does no injury
  arithmetic — `module-src/scripts/engine/30-injuries.js` mints an injury Item and leaves duration
  and effect to the GM — so there is nothing to contradict, and the card text says as much.
* **Ch. 9 → Resting**: a short rest is an hour and rolls one recovery die split between health and
  focus; a long rest is eight hours, restores both in full and reduces the Exhausted penalty by 1.
  `cosmere-canon-reference`'s rest entry matches word for word.
* **Ch. 10 → the standard reactions**: **Dodge** costs 1 focus and *adds a disadvantage to the
  attacker's test*, and does not work on area or multi-target attacks — which is exactly what item
  181's arm button implements and what R-145 is asking two dials about; **Aid** costs 1 focus and
  grants an advantage; **Reactive Strike** costs 1 focus; **Avoid Danger** costs none. Forced
  movement does not trigger Reactive Strike.
* **Ch. 10 → Targeting and Range**: long range, an enemy in reach of a ranged attack, unstable
  footing and an unsensed target each add **a disadvantage**, and an attack against a target you
  cannot sense cannot graze. Difficult terrain applies Slowed; dangerous terrain damages on entry
  or at the start of a turn; falling is 1d6 impact per 10 ft and leaves you Prone.
* **Ch. 11 → Focus in Conversations**: resisting influence costs **2 focus**, or **4** against an
  extremely strong argument, and an NPC at 0 focus can no longer resist. Nothing in the repo
  states a different number.
* **Ch. 12 → Endeavors** is a published scene structure (flexible rounds, collective thresholds)
  that `session-forge` does not use and does not contradict. A gap, not an error.
* **Glossary**: graze, deflect, plot die, Opportunity, Complication and the complication bonus,
  focus, health, recovery die, expertise, injury, raise the stakes, always active (∞) and special
  activation (\*) all match `cosmere-canon-reference`'s entries.

---

## Memory

`~/.claude/projects/C--dev-Skilltrees/memory/` was read, not edited. **No contradictions found.**
The one rules-bearing note, `handbook-chapter-3-is-canon.md` (2026-09-16), is the correction that
opened this item and is accurate: it states the per-die, countable advantage rule, names the
engine's fold as the deviation, and points at R-155 / items 201 and 202. One suggestion for the
PM, not a contradiction: that note's "how to apply" line could name the three pages this audit
leaned on hardest beside Chapter 3 — Ch. 9 Conditions, Ch. 10 Actions and Reactions, Ch. 13 Using
Adversaries — since those are where the next wrong assertion is most likely to come from.

## What this pass filed

| Filed | What |
|---|---|
| **R-156** | Movement rate — the published ladder or Edha's `20 + 5·SPD`? (default (a): the ladder, as R-56 settled senses) |
| **R-157** | Attribute points at level 3 — the system's table or the Mistborn table? (default (a): keep the system's) |
| **R-158** | The published Minion and Boss role features — adopt as written? (default (a): yes, and re-read R-134 after) |
| **item 203** | Build R-156's answer (ENGINE; blocked on R-156) |
| **item 204** | The opposed-test tie (ENGINE; not blocked) |
| **item 205** | Rename the `diminished` status off the published condition's name (ENGINE + DATA) |
| **item 206** | Build R-158's answer (DATA + ENGINE; blocked on R-158) |

Fixed in the audit's own PR: `cosmere-canon-reference` (provenance, action costs, the condition
table, Unconscious, opposed tests, the advantage entry), `leyline-revision-guide` (tier bands),
`phrasing-verifier` (the published disadvantage verb), `docs/ACTOR_STAT_DERIVATION.md` (the
recovery-die row), `docs/analysis/talent-ecosystem/SYSTEM-PRIMER.md` (a dated correction block),
`bestiary-forge/STANDARD.md` (the role features as PENDING, and the published threat budget).
