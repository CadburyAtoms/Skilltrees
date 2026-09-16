---
name: cosmere-canon-reference
description: >
  Canonical reference data for the Cosmere RPG / Stormlight RPG: mechanics glossary,
  conditions, skills, attributes, action types, damage types, defenses, capitalization
  conventions, and standard rule patterns. Drawn directly from the published Stormlight
  Starter Rules and the canon talent set. This is a knowledge skill (a lookup file), not
  a procedure — the phrasing-verifier, rules-text-reviewer, and talent-balance skills
  load it when they need an authoritative answer about canon terminology or wording.
  Trigger directly when the user asks "is X a canon term?", "how should X be capitalized?",
  "what's the canon list of conditions / skills / actions?", "what does graze mean?",
  "is recovery die canon?", or any factual lookup about Cosmere RPG rules text.
---

# Cosmere RPG Canon Reference

This file is a pure reference. It contains no procedures and produces no output on its
own. Other skills (`phrasing-verifier`, `rules-text-reviewer`, `talent-balance`) load
it via `Read` when they need to confirm a canonical fact.

When invoked directly by the user (e.g. "is X canon?"), reply with the relevant section
quoted or paraphrased, and cite which source (rulebook or talent set) the fact comes from.

---

## Source Provenance

Every entry below is grounded in one of three source documents:

- **MH** = the **Mistborn Handbook** — *the source of record for general game rules since
  2026-09-16* (the `cosmere-rpg-mistborn-handbook` module v1.0.0, `handbook` journal pack, 21
  journals / 241 pages, installed on Ben's machine). It is a full core rulebook where SR is a
  60-page excerpt, so **where MH and SR disagree, or where SR is silent, MH wins.** Cite it by
  chapter and section ("MH Ch. 3 → Skills, Opposed Tests"); the text is licensed, so paraphrase
  and quote at most a short phrase. How to read it, and what the sweep found:
  `docs/analysis/rules-audit-2026-09.md` (TODO item 201).
- **SR** = *Stormlight Starter Rules* (SL015, v1.02, 2025), 60-page core rulebook
- **CT** = *CosmereRPG Talents.xlsx*, the canon talent set (374 talents across all 6
  Heroic paths and all 9 Radiant Order paths)

Where the sources use different conventions for the same term (most often
capitalization), both forms are listed with the context that produced them. Heroic and
Radiant talents are the gold standard for in-talent phrasing; **MH is the gold standard for
general game-rules phrasing and for every rule fact**, with SR as its Roshar-flavoured
counterpart. An entry below that still carries only an `[SR p.n]` citation was checked against MH
by the 2026-09-16 audit and agrees with it unless the entry says otherwise.

If a term doesn't appear in any source but is used by the user's homebrew (Leyline
paths, Deity paths, the Weakened condition, etc.), it's flagged as **homebrew** rather
than canon — the reviewer skills should treat homebrew terms permissively but consistently.

---

## Attributes (always capitalized)

The six attributes from SR Part 1:

| Attribute | Realm | Determines |
|-----------|-------|------------|
| **Strength** | Physical | Maximum health, lifting/carrying capacity, unarmed damage |
| **Speed** | Physical | Movement rate |
| **Intellect** | Cognitive | (Cognitive skills) |
| **Willpower** | Cognitive | Maximum focus, recovery die |
| **Awareness** | Spiritual | Senses range |
| **Presence** | Spiritual | (Spiritual skills) |

> Common error: "Intelligence" instead of "Intellect." The canon attribute name is
> **Intellect**. Auto-fix `Intelligence` → `Intellect` only when used as an attribute
> name; leave the common-English word alone in flavor text.

---

## Defenses (always capitalized)

The three defenses from SR Part 1:

- **Physical** — affected by Strength and Speed
- **Cognitive** — affected by Intellect and Willpower
- **Spiritual** — affected by Awareness and Presence

The word "defense" itself is **lowercase** in canon body text: "your Cognitive defense,"
"vs. Physical defense." In test phrasings, "defense" is usually omitted — see the test
structure section below.

The corresponding **realms** (Physical Realm, Cognitive Realm, Spiritual Realm) are
also capitalized when referenced as the cosmere's three facets of reality.

---

## Skills (always capitalized as proper nouns)

The 18 canon skills from SR Part 1, grouped by realm:

**Physical (4):** Agility (Speed), Athletics (Strength), Heavy Weaponry (Strength),
Light Weaponry (Speed), Stealth (Speed), Thievery (Speed)

**Cognitive (6):** Crafting (Intellect), Deduction (Intellect), Discipline (Willpower),
Intimidation (Willpower), Lore (Intellect), Medicine (Intellect)

**Spiritual (6):** Deception (Presence), Insight (Awareness), Leadership (Presence),
Perception (Awareness), Persuasion (Presence), Survival (Awareness)

> Note the count: SR says 18 skills total. Listed above are 18. Skill names are
> always capitalized in canon (and Title Case for the two-word ones: Heavy Weaponry,
> Light Weaponry).

**Surge skills** (used by Radiant adversaries, named after the surge): Adhesion,
Cohesion, Gravitation, Illumination, Progression, Tension, Transformation, Transportation,
Abrasion, Division. These are also always capitalized.

---

## Action Types (the action-economy categories)

From SR Part 3. The action economy uses these categories:

| Category | Symbol | Notes |
|----------|--------|-------|
| **Action** | ▶ | One action. SR uses bare "Action" (not "1 Action") in stat blocks. |
| **2 Actions** | ▶▶ | |
| **3 Actions** | ▶▶▶ | Less common; canon talents use this for heavy effects. |
| **Free Action** | ◇ | Doesn't consume an action. |
| **Reaction** | ⟲ | Triggered response, one per round by default. |
| **Passive** | ∞ | Always active. |
| **Special** | ★ | Conditional trigger — "if X happens, you may pay cost to activate." |

In stat blocks, "Action" by itself means "1 Action."

> **Capitalization note:** SR body text writes "free action" lowercase as common
> English ("Each free action ... can only be used once per turn"). Canon talents
> write "Free Action" Title Case when referencing it as a category designation
> ("Use Field Medicine as a Free Action"). In talent text, **Title Case is correct**;
> in general rules prose, lowercase is acceptable.
>
> Same pattern applies to "reaction" — lowercase as common English, capitalized as
> the resource being spent or the action category.

---

## Standard Actions (always capitalized in talent text)

The 17 standard actions, available to all characters. **Costs are MH's** — Ch. 10 "Actions and
Reactions" and the Actions and Reactions table in Appendix 2, corroborated by the handbook
module's own 21-item `actions` pack, which carries each cost as data.

**Actions (▶):** Aid (reaction, 1 focus), Avoid Danger (reaction), Banter (free),
Brace (1 ▶), Disengage (1 ▶), Dodge (reaction, 1 focus), Drop (free),
Gain Advantage (1 ▶), **Grapple (2 ▶)**, Interact (1 ▶), Move (1 ▶), Reactive Strike
(reaction, 1 focus), Ready (1 ▶ + cost of readied action), Recover (2 ▶),
**Shove (2 ▶)**, Strike (1 ▶), Use a Skill (1 ▶)

> ⚠️ **Corrected 2026-09-16 (TODO item 201).** Grapple and Shove read "1 ▶" here from 2025 until
> this audit; both cost **2 actions**. They are the two costliest things on the list beside
> Recover, so a talent that grants a free Shove or Grapple is worth twice what the old line
> implied — re-read any power judgment that priced one.

Three costs worth remembering because they bite in talent design: **Strike** may be used more than
once a turn but each use must be a different hand (an offhand attack costs 2 focus); **Move** and
**Interact** may also be used more than once a turn; and every *other* named action — including
one granted by a talent — can be used **only once per turn** (MH Ch. 10 → Actions).

When talent text references any of these by name, capitalize. When using "move" or
"strike" as generic English verbs (not the action), leave lowercase.

**Move ambiguity:** "Move 5 feet" is the action (capitalized). "you can move up to
half your movement rate" is the verb (lowercase). "After you Move with a Basic
Lashing" is the action (capitalized). "must move away on their next turn" is the
verb (lowercase). Auto-fixers should NOT blanket-capitalize `move` — context-dependent.

**Strike ambiguity:** Same pattern. "make a melee weapon attack" describes a strike
generically; "use the Strike action" or "your Shardblade Strikes" capitalizes it as
the action.

---

## Conditions (always capitalized)

**The published list is MH Ch. 9 → Conditions: fifteen conditions.** Thirteen of them are also in
SR; the two SR never had — **Depleted** and **Diminished** — were added by the 2026-09-16 audit,
and **Empowered** is SR's alone (it is not in MH, though the cosmere-rpg system still ships it as
a status). A condition's own text says how long it lasts and how it can be removed early; see
MH Ch. 9 → Durations for effects that last "a number of rounds".

| Condition | Source | Effect (canon) |
|-----------|--------|----------------|
| **Afflicted** [type/amount] | MH, SR | Take ongoing damage at the end of each of your turns (out of combat, every 10 seconds and after each attempt to remove it); bracket lists damage type and amount. **Multiple instances resolve separately.** |
| **Depleted** [power] | MH | No access to the Investiture for that power: you can't spend Investiture on it, don't count as Invested for it, and lose its nascent effects. Multiple powers can be Depleted at once. (Scadrian-flavoured, but the shape — "this power is switched off" — is the general one.) |
| **Determined** | MH, SR | When you fail a test, may add an Opportunity to the result; condition then ends |
| **Diminished** [attribute −X] | MH | The named attribute drops by X: its skill tests and any talent that uses it take the penalty, and ladders off it (movement, senses, recovery die) move down — but defenses and the health/focus/Investiture maxima do **not** change. **Cumulative**, and more than one attribute can be Diminished at once. The mirror of Enhanced. ⚠️ Edha registers an unrelated status also labelled "Diminished" (Sovereignty's damage-die step-down) — see TODO item 205. |
| **Disoriented** | MH, SR | No reactions; senses count as obscured; Perception tests have disadvantage |
| **Empowered** | SR only | Gain advantage on all tests; Investiture refills to max at start of each turn. Granted by swearing an Ideal. Lasts until end of scene. **Not an MH condition** — Roshar-specific; the system carries the status. |
| **Enhanced** [+X attribute] | MH, SR | Specified attribute gains a bonus; doesn't change defenses/maxes. **Cumulative** across attributes. |
| **Exhausted** [−X] | MH, SR | Apply −X penalty **after calculating a test result, before resolving it**. **Cumulative**. Reduce penalty by 1 after each long rest; removed at 0. |
| **Focused** | MH, SR | Abilities that cost focus cost 1 less |
| **Immobilized** | MH, SR | Movement rate becomes 0; can't move or be moved |
| **Prone** | MH, SR | Lying flat; you are Slowed; melee attacks against you gain an advantage; can use Brace without cover; stand up as a free action (movement reduced by 5 until start of next turn). Becoming Prone while climbing or flying means falling. |
| **Restrained** | MH, SR | Movement rate becomes 0; disadvantage on all tests other than escape attempts |
| **Slowed** | MH, SR | Movement rate halved (round **up** if mid-move — one of the few published exceptions to Round Down) |
| **Stunned** | MH, SR | Lose reactions; gain two fewer actions; don't gain a reaction |
| **Surprised** | MH, SR | Lose reactions; don't gain reaction at start of combat; can't take fast turn; gain one fewer action. Removed after your next turn. |
| **Unconscious** | MH, SR | Movement 0; can't move, communicate, or use any action or reaction; unaware of your surroundings; fall Prone and drop what you're holding; always take a slow turn but can do nothing on it. **A PC may choose to regain consciousness at the end of any of their turns** (no action) or when healed to 1 health — and at 0 health recovers 1 health on doing so. **An NPC cannot choose**: they wake only when something heals them 1 health. (SR's Roshar version listed "only Breathe Stormlight and Regenerate available"; MH's is the general rule.) |

**Bracketed parameters:** When a condition takes a parameter (Afflicted, Depleted, Diminished,
Enhanced, Exhausted), the bracket appears immediately after the condition name with no space:
`Exhausted [−1]`, `Enhanced [+2 Speed]`, `Diminished [Speed −2]`, `Afflicted [1d4 vital]`.

**Conditions NOT in canon source material** (homebrew or potentially from later books) —
re-confirmed against MH's full list on 2026-09-16, so these are homebrew against *both* published
handbooks, not merely absent from the Starter Rules:
Weakened, Frightened, Compelled, Marked, Hexmarked, Injured, Hidden, Bleeding,
Poisoned. The reviewer skills should treat these as homebrew conditions when they
appear — capitalize them consistently but flag if a custom talent invents a new
condition without defining it. The deity-path reviews promote Frightened, Compelled,
Marked, and Hexmarked to first-class homebrew conditions used by multiple deity trees.

> "Injury" is a separate game state, not a condition — see the Injuries entry in the
> mechanics glossary below.

---

## Damage Types (always lowercase)

From SR Part 2:

| Type | Source examples | Reduced by deflect? |
|------|-----------------|---------------------|
| **energy** | fire, lightning, heat | Yes |
| **impact** | hammer, falling, crushing | Yes |
| **keen** | blades, arrows, piercing | Yes |
| **vital** | poison, suffocation, extreme cold | **No** |
| **spirit** | Shardblades, soul-wounding | **No** |

Always lowercase: `1d6 keen damage`, `2d8 vital`, `take 4 energy damage`.

Note: SR specifically says **vital and spirit damage are NOT reduced by deflect**,
which is the same as the **Pierce** weapon trait. Some weapons and abilities also
explicitly "ignore deflect."

---

## Mechanics Glossary

Canon mechanics with their correct capitalization and standard usage. This is the
master glossary — when in doubt, look here.

### graze (lowercase)

When an attack misses, the attacker may spend 1 focus per target to **graze** them
instead, dealing the damage rolled on the damage dice (no skill modifier added). [SR p.35]

Standard phrasings from canon talents:
- "On a hit or graze, the target becomes your quarry." (Tagging Shot)
- "Once per round, graze without spending focus." (Combat Training)
- "On a hit or graze, the target is Surprised." (Startling Blow)
- "this attack ignores deflect, deals an extra 4d6 damage, and can't graze" (Wit's End)
- "attacks can't graze you" (Slippery Target)
- "your Shardblade Strikes graze additional targets up to your ranks in [skill]"
  (Shard Training)

Always lowercase as both verb and noun.

### deflect (lowercase)

Armor (and some abilities) grant a **deflect value** that reduces incoming energy,
impact, and keen damage by that amount. Vital and spirit damage are NOT reduced by
deflect. [SR p.14]

Standard phrasings:
- "your deflect value reduces the amount of damage you suffer"
- "this attack ignores deflect"
- "your deflect increases by 1"
- "armor with deflect of 2 or higher"

Always lowercase in body text. Section headers may capitalize ("Deflect").

### plot die (lowercase)

A six-sided die rolled alongside the d20 when the GM **raises the stakes** on a test.
Faces show Opportunity, Complication (with +2 or +4 bonus), or blank. [SR p.8]

Standard phrasings from canon talents:
- "you can reroll your plot die"
- "Use Opportunist on the plot die of a willing ally within 20 ft"

Always lowercase. Section header may capitalize ("Plot Die").

### Opportunity (capitalized)

A beneficial side effect on a test. Gained from rolling Opportunity on the plot die,
from rolling within your Opportunity range on the d20 (default: natural 20), or from
abilities that grant it. **Spend an Opportunity** for one of these standard effects:
Aid an Ally, Collect Yourself, Critically Hit, or Influence the Narrative. Some
abilities provide additional spend options. [SR p.9]

**Standard talent phrasings for Opportunity spends:**
- `spend Opportunity to [effect]` — e.g. "spend Opportunity to Strike with that
  fabrial as a Free Action," "spend Opportunity to cause one target of that attack
  to suffer an injury"
- `spend [X focus] or Opportunity to [effect]` — e.g. "spend 1 focus or Opportunity
  to make the target Exhausted [−half your ranks in Medicine]"
- `Spend X focus to add Opportunity to a test to [effect]` — e.g. "Spend 2 focus to
  add Opportunity to a social test against criminals"

These are the three canon patterns. Custom talents that invent other Opportunity-spend
formats should be flagged.

Always capitalized.

### Complication (capitalized)

A negative side effect on a test, also granting a bonus to the d20 result (+2 or +4 from
the plot die face). The GM spends Complications for: Hinder an Ally, Become Distracted,
Influence the Narrative. Some rules add other spend options. [SR p.9]

Always capitalized. Talents may reference "Complication 4" — the number is the bonus
side it lands on.

### focus (lowercase)

A cognitive resource for fueling abilities and resisting influence. Maximum focus =
2 + Willpower. Recovered through resting. [SR p.16]

Always lowercase in description text. **Cost field convention** uses Title Case
("1 Focus," "2 Focus," "Variable Focus").

### Investiture (capitalized)

A spiritual resource representing the cosmere's energy — on Roshar, the ability to
hold and channel Stormlight. Radiants gain an Investiture pool when they bond a spren.
[SR p.16]

Always capitalized. **Cost field convention** uses the same form ("1 Investiture,"
"2 or 3 Investiture," "Variable Investiture").

### Stormlight (capitalized)

The form of Investiture used on Roshar. Stored in infused gemstones (spheres) and
breathed in by Radiants.

Always capitalized.

### health (lowercase)

A physical resource representing stamina and resistance to wounds. Maximum health =
10 + Strength. Recovered through resting. [SR p.16]

Always lowercase in body text. **Abbreviation:** "HP" (capitalized) is the preferred
shorthand in talent descriptions. Section headers may use "Health."

### recovery die (lowercase)

A die determined by Willpower, rolled when you take a short rest or use the Recover
action. The roll result can be split between health and focus recovery. [SR p.13, p.24]

Standard phrasings from canon talents:
- "An ally rolls their recovery die and recovers that much focus."
- "recover health equal to their recovery die + your ranks in Leadership"
- "add your ranks in Medicine to their recovery die"

Always lowercase.

### expertise / expertises (lowercase)

Specialized knowledge that grants tests no one else can make and free recall of basic
facts in the topic area. Each character has multiple expertises. [SR p.15]

Standard phrasings from canon talents:
- "Gain expertise in a weapon, an armor, and Military Life"
- "expertise in Animal Care"
- "Gain Mental Health Care expertise"
- "Choose one of your weapon expertises"

Always lowercase. The **specific expertise name** is capitalized (Title Case): "Animal
Care," "Military Logistics," "High Society," "Sleight of Hand," "Fabrial Crafting,"
"Mental Health Care," "Weapon Crafting," "Armor Crafting," "Equipment Crafting,"
"Underworld," "Criminal Groups," "Botany," "Scandal," "Fashion."

### rest / short rest / long rest (lowercase)

Two rest types from SR Part 2:
- **short rest** — 1+ uninterrupted hour. Roll recovery die to recover health and/or focus.
- **long rest** — 8+ uninterrupted hours. Recover all lost health and focus; reduce
  Exhausted penalty by 1.

Standard phrasings from canon talents:
- "During a long rest, you can reconfigure your Prized Acquisition fabrial"
- "Reassign these after a long rest with library access"
- "During a rest, test Medicine (DC 10) to treat an ally"
- "reduce one injury's recovery time by 5 days"

Always lowercase.

### Ideal (capitalized)

A Knight Radiant progression mechanic. Each Order has Ideals (First, Second, Third,
etc.) that the Radiant must speak to advance. Swearing an Ideal grants the Empowered
condition. [SR p.16, p.25]

Standard phrasings from canon talents:
- "Choose allies up to your current Ideal to become Determined"
- "swear the Third Ideal of their order"
- Tags: `first_ideal`, `second_ideal`, `third_ideal`, `fourth_ideal`

Always capitalized. Ordinals (First, Second, etc.) when referring to a specific Ideal
are also capitalized.

### Lashing / Lash (capitalized)

The Surgebinding power of Gravitation. Used by Windrunners and Skybreakers. [CT —
Windrunner/Skybreaker talents]

Standard phrasings from canon talents:
- "After you Move with a Basic Lashing"
- "Lashing objects toward your opponent with Stormlight"

Always capitalized when referring to the surge action.

### Skate (capitalized)

The Surgebinding action used by Edgedancers (Abrasion). [CT — Edgedancer talents]

Standard phrasings:
- "When you Skate and use its Move free action, you aren't restricted to moving in a
  straight line"

Always capitalized.

### Lightweave (capitalized)

The Surgebinding action used by Lightweavers (Illumination). [CT — Lightweaver talents]

Standard phrasings:
- "Lightweave an illusion of yourself or an ally"

Always capitalized.

### Soulcast (capitalized)

The Surgebinding action used by Elsecallers and others (Transformation). [CT]

Standard phrasings:
- "Soulcast Defense on melee attacks"

Always capitalized.

### Surge / surges (mixed)

The ten Surgebinding powers (Gravitation, Adhesion, Division, Abrasion, Progression,
Illumination, Transformation, Transportation, Cohesion, Tension). Each surge is
**capitalized** as a proper noun ("the Gravitation surge," "Division attacks").
The general word "surges" or "surge" is **lowercase** when used as common English
("the powers of the surges," "use a surge to attack"). [SR p.27, CT]

### spren (lowercase)

The sentient nature spirits of Roshar. Each Radiant Order is paired with a specific
spren type (Honorspren for Windrunners, Cryptics for Lightweavers, etc.).

Always lowercase as a common noun. Specific named spren are capitalized (Sylphrena,
Pattern). Spren-type names are capitalized when used as a proper title (Honorspren
Bond, Cryptic Bond) and lowercase when used as common nouns ("a windspren").

### Knight Radiant / Radiant / Radiants (capitalized)

Always capitalized. Order names (Windrunner, Skybreaker, Edgedancer, Truthwatcher,
Lightweaver, Elsecaller, Willshaper, Stoneward, Dustbringer) are always capitalized.

### Shardblade / Shardplate / Shardbow / Grandbow (capitalized)

Shards. Always capitalized. Half-shards are also capitalized.

### Reactive Strike (capitalized)

A reaction attacking an enemy who voluntarily leaves your reach. Costs 1 focus.
[SR p.34] Always capitalized as the action name.

### Brace (capitalized)

An action: hide behind cover within 5 ft to grant attacks against you disadvantage
while you stay there. Some effects (Defensive trait, Prone condition, certain talents)
allow Brace without cover. [SR p.32]

### Disengage (capitalized)

An action: move 5 ft without triggering Reactive Strikes. [SR p.32]

### Dodge (capitalized)

A reaction: spend 1 focus to add a disadvantage to an enemy's attack against you.
Doesn't work on area attacks or multi-target attacks. [SR p.34]

### Aid (capitalized)

A reaction: spend 1 focus to grant an ally an advantage on an upcoming skill test.
[SR p.34]

### Gain Advantage (capitalized as the action name)

An action: test a skill against an enemy's defense to gain an advantage on your next
test against that enemy using a different skill. [SR p.32]

When **Gain Advantage** is used as the named action, capitalize. Plain "gain an
advantage" (granted by other effects) is lowercase. Always include the article
"an" — `gain an advantage`, never `gain advantage`.

### advantage / disadvantage (lowercase)

A test modifier, and **countable — each one is placed on its own die.** [MH Ch. 3 → Skills,
"Advantages and Disadvantages"; SR p.18 carries the same text]

* For **each advantage**, the roller chooses one die they are about to roll — the d20, the plot
  die, or any other die such as a damage die — rolls two of it and keeps one. **Each die may be
  chosen only once**, so two advantages double two *different* dice; you never roll three of the
  same die.
* For **each disadvantage**, the *opponent* chooses the die and which of the two results is kept:
  the GM on a player's test, and on an **enemy NPC's** test the roles reverse — the GM picks for
  its advantages, a player (the one most affected) for its disadvantages.
* Advantages and disadvantages **cancel one for one** before anything is placed; two advantages
  and one disadvantage leave one advantage.
* On a test against several targets, roll the extra dice separately and apply them only to the
  targets they concern.
* Only the d20 you keep can contribute an Opportunity or a Complication.

> ⚠️ **The engine is not there yet** (2026-09-16). Edha writes the d20 channel only and folds
> every live source into the one tri-state the system holds, so a second advantage is discarded —
> a deviation, not the rule. R-155 (answered (a)) and TODO item 202 carry the fix; the sweep that
> found every doc repeating the fold as if it were the rule is
> `docs/analysis/rules-audit-2026-09.md`. **Judge a card against the rule above, not against the
> fold.**

Always lowercase. Use the article: `gain an advantage`, `have a disadvantage`,
`with a disadvantage`. The **published verb is "gains"** — MH writes "your attack gains a
disadvantage", "the test gains an advantage", and Dodge "adds a disadvantage" — so never rewrite
`gains a disadvantage` into something else.

### Attunement Range (capitalized)

A homebrew range used in user's Leyline talents. Not in canon. Treat as homebrew
mechanic; capitalize consistently as a named range.

### Charge (capitalized — homebrew, Destruction deity)

A marker placed by Destruction-path talents. A Charge sits on a target (object,
character, or 5 ft square) with a declared trigger; on trigger, it detonates for
energy damage and leaves dangerous terrain. Always capitalized.

### Harvested Remain (capitalized — homebrew, Death deity)

A marker on a corpse, generated by Reaper's Harvest. Spent by downstream Death
talents to interact with the dead (raise servants, plant bone-fields, speak to the
fallen, revive). Always capitalized.

### Ordained Ground / Snare (capitalized — homebrew, Fate deity)

Designated 5 ft squares: Ordained Ground anchors allies (defensive bonus + Aid range
extension); Snare is a single-use trap (keen damage + Restrained on trigger). Both
terms capitalized as named tokenized effects.

### Dangerous terrain — Destruction-flavored (lowercase as common noun)

When Destruction-deity talent text says "becomes dangerous terrain," characters that
enter or start their turn in those squares take energy damage equal to the placer's
tier. Multiple Destruction dangerous-terrain effects don't stack but merge
geographically. Lowercase in body text; capitalized only as a section header.

### Reach / reach (mostly lowercase)

The distance within which you can make melee attacks. Default 5 ft for Medium
characters. [SR p.37] Lowercase as common noun ("within your reach," "a Melee [+5]
weapon extends your reach").

### Cover / cover (lowercase)

Obstacles that block line of effect. [SR p.39] Lowercase.

### Difficult terrain / dangerous terrain (lowercase)

Terrain types from SR p.39–40. Slowed in difficult terrain; takes damage in dangerous
terrain. Lowercase.

### Injury / Injuries (capitalized as the game state)

When reduced to 0 health or struck while at 0 health, you suffer an **injury** and
make an injury roll (d20 + modifiers, compared to the Injury Duration table). [SR p.28]

Lowercase as common noun ("suffer an injury"); capitalized as the section header or
when referring specifically to the rules system ("Injury Duration table"). Talents
mostly use lowercase: "suffer an injury," "reduce one injury's recovery time."

### raise the stakes / raising the stakes (lowercase)

A GM action that triggers rolling the plot die alongside the d20 on a test. [SR p.8]
Always lowercase.

### Surge / oath / Word (mixed)

- "oath" / "oaths" — lowercase as common nouns; capitalized only when part of a
  formal title.
- "Words" (as in "find the Words to swear the Third Ideal") — capitalized when
  referring to the canon Words of an Ideal.

---

## Capitalization Quick Table

A consolidated lookup. **Cap = always capitalized; low = always lowercase; both = context-dependent.**

| Term | Convention | Notes |
|------|-----------|-------|
| Strength, Speed, Intellect, Willpower, Awareness, Presence | Cap | Attributes |
| Physical, Cognitive, Spiritual | Cap | Defenses and Realms |
| defense, defenses (generic) | low | "Cognitive defense" — "defense" lowercase |
| Conditions (full list above) | Cap | Always |
| Skills (all 18 + surge skills) | Cap | Always |
| Strike, Brace, Disengage, Dodge, Aid, Move, Interact, Use a Skill, Gain Advantage, Reactive Strike, etc. | Cap | When referencing the named action |
| strike, move, interact, dodge (verbs) | low | When used as common English verbs |
| Free Action | Cap | In talent text (canon talent convention) |
| free action | low | In rulebook body prose |
| Reaction | Cap | The resource / action category |
| reaction | low | Common English usage in body prose |
| Action / Actions | Cap | Action-economy units ("gain an Action," "2 Actions") |
| Opportunity, Complication | Cap | Always |
| Investiture, Stormlight | Cap | Always |
| focus, health | low | Resources, lowercase in description |
| Focus, Health, Investiture | Cap | In Cost field (Title Case convention) |
| advantage, disadvantage | low | Always (use article: "an advantage") |
| graze, deflect, plot die, recovery die | low | All lowercase in body text |
| expertise, expertises | low | The mechanic; specific expertise names are Title Case |
| tier | low | Outside bracket notation |
| `[Tier]`, `[Die]`, `[Size]` | Cap inside brackets | Notation; no space between tokens |
| energy, impact, keen, vital, spirit | low | Damage types, always |
| Lashing, Skate, Lightweave, Soulcast, Regenerate | Cap | Surgebinding actions |
| Surgebinding | Cap | The discipline |
| surge / surges | low | Common noun; specific surge names capitalized |
| Adhesion, Cohesion, Gravitation, etc. | Cap | Specific surge names |
| Knight Radiant, Radiant, Radiants | Cap | Always |
| Order names (Windrunner, etc.) | Cap | Always |
| Shardblade, Shardplate, Shardbow | Cap | Always |
| spren | low | Common noun; named spren capitalized |
| Ideal, First Ideal, Third Ideal | Cap | Always |
| oath / oaths | low | Common noun |
| short rest, long rest, rest | low | Always |
| HP | Cap | Preferred shorthand for health |
| Plot Die, Recovery Die | Cap | Section headers only — lowercase in body |
| Deflect | Cap | Section header only — lowercase in body |
| Weakened, Frightened, Compelled | Cap (homebrew) | Treat as homebrew conditions |

---

## Test Resolution Structure

From SR Part 1.

A test is `d20 + skill modifier + bonuses/penalties` compared to a DC. The DC is
either set by the GM, set by an opposed test, or set by the target's relevant
**defense**.

### Standard test phrasing in canon talents

The canon convention is `test [Skill] vs. [Defense]` — and **the word "defense" is
usually omitted** in the talent text. From the canon talent set:

- "test Deduction vs. Spiritual to learn the target's motivation"
- "test Athletics vs. Spiritual"
- "test Cohesion vs. Cognitive of chosen targets"
- "test Discipline vs. an enemy's Spiritual"
- "test Illumination vs. Spiritual of a target"
- "test Perception vs. Cognitive to learn their lowest attribute"

The fully written form ("test Athletics vs. Cognitive defense") is rarer. Both forms
are valid; the abbreviated form is more common.

**Specifying the target:**
- "vs. Spiritual" — implicit target (the attacked enemy)
- "vs. Cognitive of chosen targets" — multi-target
- "vs. Cognitive of the enemy leader" — specific target
- "vs. an enemy's Spiritual" — possessive form
- "vs. each enemy's Cognitive" — distributive

### Opposed tests (a published general rule)

**[MH Ch. 3 → Skills, "Opposed Tests"]** When two characters actively test against each other, or
when one character's result sets the DC for a later attempt to subvert it, both roll and **the
opponent's result is the DC**. The book's worked example is a Lurcher Pulling a gun out of your
hand: you test Athletics against their Allomancy.

* **You must EXCEED your opponent's result**, not match it.
* **On a tie, nobody meets their DC** — both fail their objective, and "in the case of an
  aggressive contest, the result favors the defender who's trying to keep things the same" (the
  gun stays in the hand it was already in).
* Opposed tests are also the book's catch-all for conflicts with no specific rule.

So a `test [Skill] vs. [Skill]` talent is a **canonical structure**, not a homebrew one — this
entry said the opposite until 2026-09-16 (TODO item 201), on SR's silence. What *is* thin in the
canon talent set is the phrasing; the closest canon example opposes a test to an incoming attack's
result rather than to a named skill:

- "test Athletics vs. triggering attack, gaining a disadvantage unless attacked by a
  Shardblade" (Precise Parry)

> ⚠️ Edha's contest core resolves a tie **for the initiator** (`edhaDefTestOutcome`'s `>=` on the
> `vs: "skill"` path) — TODO item 204. `>=` is correct against a defense or a flat DC, where you
> meet the number; it is wrong against an opponent's roll.

### Default DC mapping

When no defense is specified, the default mapping by skill realm is:
- Physical skills → vs. Physical
- Cognitive skills → vs. Cognitive
- Spiritual skills → vs. Spiritual

But specific talents often override this (e.g. Feinting Strike: melee weapon attack
vs. Cognitive). Always honor the talent's specified defense.

---

## Cost Field Convention

Costs appear in two places: the **Cost column** of the talent (drives the UI node
display) and the **Description text** (for self-containedness).

**Cost field uses Title Case** for resource names:
- `1 Focus`, `2 Focus`, `3 Focus`, `Variable Focus`
- `1 Investiture`, `2 Investiture`, `2 or 3 Investiture`, `Variable Investiture`,
  `1 or 2 Investiture`
- `Opportunity`, `Opportunity or 2 Focus`, `1 Focus or Opportunity`
- `1 Investiture, 2 Focus or Opportunity` (multi-resource)
- `Passive` (no cost)

**Description text uses lowercase** for the same resources:
- "spend 1 focus," "spend 2 Investiture," "spend Opportunity"

Reviewers should NOT flag "1 Focus" in the Cost field as a capitalization error.
Reviewers SHOULD flag "spend 1 Focus" in the Description text — that should be lowercase.

---

## Duration Conventions

From canon talent and rulebook usage:

| Phrasing | Meaning |
|----------|---------|
| `for the scene` | Until the scene ends |
| `for the scene or until destroyed` | Persistent effect; ends on scene end OR destruction |
| `until the end of your next turn` | Round-limited, ends on your next turn end |
| `until the start of your next turn` | Round-limited, ends just before your next turn |
| `Once per round.` | Limiter; placed at end of description |
| `Once per turn` | Per-turn limiter |
| `Once per scene` | Per-scene limiter |
| `during a long rest` | During the rest itself |
| `after a long rest` | Triggered when rest completes |
| `permanently` | No expiration |

**Avoid** in custom talent text: `during this scene`, `for the duration of the
scene`, `until the end of the scene`. All should be normalized to `for the scene`
unless specifically meant otherwise.

---

## Bracket Notation

Homebrew/talent notation tokens:

- `[Tier]` — character's tier (1–5)
- `[Die]` — a die size scaling with tier (typically d4, d6, d8, d10, d12)
- `[Size]` — character's size category in feet
- `[Tier][Die]` — common scaling expression (e.g. tier 2 = 2d6, tier 3 = 3d8)

**No space between tokens.** `[Tier][Die]` not `[Tier] [Die]`. Bracket contents
preserve internal capitalization regardless of surrounding text.

---

## Range and Distance Vocabulary

From SR Part 3:

- `within X feet` / `within X ft` — area or proximity check
- `within your reach` — melee range (default 5 ft for Medium)
- `within Attunement Range` — homebrew range
- `Melee [+X]` — extends reach by X feet (weapon trait)
- `Ranged [short/long]` — short range / long range in feet (weapon trait)
- `line of effect` — required for many abilities; obstructed by solid objects
- `line of sight` — visibility
- `senses range` — Awareness-based perception range when primary sense is obscured
- `cover` — within 5 ft of an obstacle that blocks line of effect

Distance units: `ft` and `feet` both appear in canon. `5 ft`, `10 ft`, `20 feet`,
`30 feet` all valid.

---

## Tag Vocabulary (canon talent file)

Canon talent tags are semicolon-separated, lowercase, with underscores for multi-word
tags. The canonical vocabulary clusters into these categories — not the generic
`damage / healing / control / aoe` categories often used in custom talents:

**Specialty/identity tags** (most common; one per talent's specialty):
`abrasion, adhesion, cohesion, division, gravitation, illumination, progression,
tension, transformation, transportation`

**Mechanic-by-name tags:**
`gain_expertise, gain_advantage, enhance, regenerate, graze, quarry, increase_range,
increase_defense, increase_investiture, extra_damage, move, opportunity, injury,
illusion`

**Condition tags:**
`empowered` (most common single tag in canon — 34 uses), and condition names as
they appear

**Progression markers:**
`first_ideal, second_ideal, third_ideal, fourth_ideal, squire, radiant_shardblade,
radiant_shardplate, spren_bond`

**Resource tags:**
`investiture, focus, opportunity, hp_cost`

Canon talents commonly carry 4–8 tags each. The "3–5 tags per talent" guideline some
review skills suggest is tighter than canon.

---

## Phrasing Patterns to Auto-Fix

These are deterministic find-and-replace patterns that match canon convention. Used by
`phrasing-verifier`:

| Wrong | Right | Notes |
|-------|-------|-------|
| `during this scene` | `for the scene` | |
| `for the duration of the scene` | `for the scene` | |
| `until the end of the scene` | `for the scene` | |
| `suffer X damage` | `take X damage` | |
| `take disadvantage` | `have disadvantage` | |
| `gain Advantage` (not the action) | `gain an advantage` | Add article |
| `gain advantage` (not the action) | `gain an advantage` | Add article |
| `costs X focus` | `spend X focus` | |
| `Plot Die` (in body text) | `plot die` | Not in section headers |
| `Deflect` (in body text) | `deflect` | Not in section headers |
| `Intelligence` (as attribute) | `Intellect` | Only when used as attribute name |
| `creature` / `creatures` | `character` / `characters` | User homebrew rule |
| `Focus` (mid-sentence in body) | `focus` | Resource, lowercase |
| `Health` (mid-sentence in body) | `health` | Resource, lowercase |
| `Tier` (outside brackets, mid-sentence) | `tier` | |
| `Advantage` (not "Gain Advantage") | `advantage` | |
| `Disadvantage` | `disadvantage` | |

**Do NOT auto-fix:**
- `Move` / `move` — context-dependent (action vs. verb)
- `Strike` / `strike` — context-dependent
- `reaction` / `Reaction` — both used in canon depending on context
- `Free Action` / `free action` — both used; capitalized in talent text per canon
  talent convention

---

## Things NOT in canon (reviewer should flag as homebrew)

These appear in user material but not in SR or CT — treat as user-defined:

**Mechanics:** Attunement Range, Draw Mana, Leyline (as a path category), Deity
(as a path category), Harvested Remain, Charge, dangerous terrain (when used as a
Destruction-deity tokenized effect), Ordained Ground, Snare, Hexmark, Marked.

**Path categories:** White Leyline, Black Leyline, Red Leyline, Blue Leyline, Green
Leyline, and all Deity paths (Anaveth, Gnothis, Kethane, Maelith, Morrath, Olvarra,
Razkael, Tessavain, Tyrith, Verdannis)

**Deity test convention (homebrew):** Deity talents test using the path's two
leyline-color skills (Black, Red, White, Blue, Green) rather than a deity-specific
skill. The test phrasing is `test [Color] vs. [Defense]`, e.g. `test Black vs.
Cognitive`. Use whichever color matches the talent's thematic direction
(diminishment / curse → the darker color; restoration / buff → the lighter color).

**Deity tree structure (homebrew):** Deity paths have **no Key talent** and **two
entry nodes**, both requiring `[Color1] 2+; [Color2] 2+`. The `Specialty` field
equals the path name for every deity talent.

These are valid for the user's campaign but should not be conflated with canon when
reviewing canonical material.

---

## How Other Skills Use This File

- **`phrasing-verifier`** loads the Capitalization Quick Table, the Conditions list,
  the Skills list, and the Phrasing Patterns to Auto-Fix table to drive its
  deterministic regex passes.

- **`rules-text-reviewer`** loads the Mechanics Glossary, Test Resolution Structure,
  Cost Field Convention, Opportunity/Complication formats, and Duration Conventions
  to judge whether a talent's structure matches canon patterns.

- **`talent-balance`** loads the Action Types, Conditions list, Damage Types, and
  Things NOT in Canon section to check that mechanical claims in the talent
  reference real game-system terms.

When a review skill is about to run, it should `Read` this file once at the start
to load the relevant tables into context, then proceed with its review work.
