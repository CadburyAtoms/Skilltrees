# The Channel — a base action per leyline colour

**Design document for R-152 (b)** (`EDHA_RULINGS.md` §K.21; TODO item 200). Written 2026-09-16 in
Ben's own design session from the brief at `docs/briefs/channel-design-pass.md`. **DOCS-ONLY: nothing
here edits data, the engine or the packs.** The build is item 198 (colours as `power` items at 3.x,
R-150 (b)), which this document specifies; the deity re-pricing (R-151 (a)) re-opens against it.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each
section before the next was written and before any commit. Every judgment call is a menu entry with
a recommended default, answered at its gate; nothing below assumes an answer that was not given.
The gate log is the record.

| Gate | Section | Status |
|---|---|---|
| 1 | §1 The Channel rule, generic | **✅ approved 2026-09-16** — M1 – M5 (a), M6 (c), M7 (a), M8 – M13 (a), M14 (a), M15 (a) White, M16 (a) *release*, M17 (a) *Countercurrent* |
| 2 | §2 The five frames | **✅ approved 2026-09-16** — F-0 (b) Red's Realms swapped; F-W (a) the line, F-B (a) the deep reading, F-K (a) the hunt, F-R (a) the mage's own edge, F-G (a) the ground |
| 3 | §3 White, worked | **✅ approved 2026-09-16** — W-1 … W-6 all (a): two formation passives become riders, three Reactions, Terms of Accord a release, Unbreakable Line gated on the flood, Voice of Authority reads the spend, Guiding Signal on the payment |
| 4 | §4 The build | **✅ approved 2026-09-16** — B-1 … B-6 all (a): `data/channels.json` build-only, one gate field in three dispatch sites, the `edha-channel` event, per-die disadvantage built with the Channel, the colour skill non-core, the bench on the Route A copy |
| 5 | §5 Close-out | not yet written |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/analysis/talent-comparison-mistborn-radiant.md` §B, §C.2, §D-1, §D-3, §E (the published
families put the cost on a base power action — Burn, Store / Tap, the surge — and are 71 – 87 %
Passive + Special and 8 – 46 % costed; Edha's colours have no base action, so leyline is 48 % costed
and deity 80 %); `docs/analysis/metalworks-comparison.md` §c B10 and `EDHA_RULINGS.md` §K.21
(R-150 (b): the colours become `power` items at 3.x and the Channel is the power's embedded action;
R-151 (a): deity re-pricing holds for this design; R-153 (a): "spend 1 or more, up to your rank" is
the cost convention); `docs/analysis/talent-ecosystem/README.md` findings 4 and 4b and §"Resource
economy" (White has two standalone Actions in twenty-five, seven Reactions for one slot, and fifteen
Investiture-costing talents against zero regeneration); the leyline guide
(`.claude/skills/leyline-revision-guide/SKILL.md`); the 3.1.0 source
(`system/data/item/action/fields/activation/consumption/schema.ts`, `documents/actor.ts:1370-1400`,
`config.ts:1196-1215`) for what the data model can and cannot say; and `data/leyline.json` +
`data/authored/leyline-white.json` for every White card quoted in §3.

---

## 1. The Channel rule, generic

### 1.1 The rule, as it would read in the handbook

> **Channel [Colour]** — Action; 1 or more Investiture
>
> Spend 1 or more Investiture, up to your rank in [Colour], to channel it. While you channel
> [Colour], [the colour's frame — one sentence, §2]. The Channel lasts until the end of your next
> turn.
>
> Before it ends, on your turn, you may **maintain** the Channel as a Free Action by spending
> Investiture again, 1 or more up to your rank; it then lasts until the end of your following turn.
> The Channel ends when you choose, when you become Unconscious, or when it is not maintained.
>
> You can channel one colour at a time. Channelling a second colour ends the first.

Four definitions the rule and its riders use:

- **Frame.** The frame is what channelling a colour *is*: the one ongoing effect, stated in a single
  sentence per colour (§2), that holds while your Channel of that colour is up. It is the same
  sentence for every mage of that colour; what differs between two White mages is which riders they
  own. A frame may be about you alone (*your* tests, *your* terrain) or may land on other creatures
  (allies beside you, enemies in your range) — §2 says which, colour by colour, and §1.4's "two
  mages, one colour" rule only matters for the second kind.
- **Channelled Investiture.** The Investiture you spent to open or maintain a Channel this round is
  the Investiture you are channelling. A frame or a talent may read that number ("*reduce that damage
  by the Investiture you are channelling*") or require it ("*while channelling 2 or more White*").
  Spending your full rank is the leyline "flare": there is no separate name for it — the number on
  the card is the requirement. Your riders read **your** spend and nobody else's.
- **Rider.** A talent that reads "*while channelling [Colour]*" works only while your Channel of that
  colour is up, and **has no Investiture cost of its own** — the Channel paid. A rider may still cost
  an Opportunity or focus where that is its identity (Opportunity for White and Red, focus for Black
  and Blue — leyline guide Part 3 §6).
- **Release.** A talent that keeps an Investiture cost is a release: you release Investiture into one
  effect and it is done. It stands on its own, needs no Channel, and is the shape reserved for the
  colour's few self-contained Actions (the bolt, the barricade, the vines). Section 3 decides which of
  White's cards are riders and which are releases. *(The name is M16; "spell" and "working" are both
  out.)*

### 1.2 The economy it creates

The numbers this rule is priced against (`SYSTEM-PRIMER.md`; R-126 (a)):

| | Levels 1 – 5 | Levels 6 – 10 |
|---|---|---|
| Rank cap in a colour (`validate-build.py` `rank_cap`) | 2 | 3 |
| Investiture pool at creation | ≈ 4 (`2 + max(AWA, PRE)`) | — |
| Draw Mana yields (1 Action) | 2 | 3 |
| A full Channel (rank) costs per round | 2 | 3 |
| Rounds one Draw sustains a 1-point Channel | 2 | 3 |
| Rounds one Draw sustains a full Channel | 1 | 1 |

**The invariant:** because Draw Mana yields your highest rank and the Channel's limit is your rank,
**one Draw Mana pays for one round of a full Channel at every level** (the repo models the cap only
through level 10, but the identity holds wherever the two numbers stay equal), and a one-point Channel
costs a Draw every *rank* rounds. A mage who opens at 1 and maintains at 1 draws every other turn at levels
1 – 5 and has every rider of that colour for free in between; a mage who floods the Channel every
round draws every turn and keeps two Actions. The starting pool covers two rounds of a full Channel
before the first Draw.

What this does to a turn. **Opening turn:** Channel (1 Action) + two Actions. **Every turn after:**
maintain (Free Action) + three Actions, with every "while channelling" rider live. That is the
published shape — *the power is the action; the talents change what the action does* — and it is the
direct answer to finding 4: the colour's plays stop competing for the one Reaction slot and stop each
costing the Investiture the tree cannot regenerate, because the Channel is the one thing that costs.

Against today: White's twenty-five cards sum to 17 Investiture of minimum costs (`talent-comparison`
§C.2), with zero bonus regeneration; under the Channel a White mage pays 1 – 2 a round for the frame
and the riders, and Draw Mana's heal fires on the same turns it always did.

### 1.3 How it reads on the Actions tab at 3.x

Under R-150 (b) each colour is a `power` item the character owns ("White Leyline", id `white`,
skill `white`, unlocked by owning the power — 3.1.0 `data/actor/common.ts:633-641`). The Channel is
that power's **embedded action**, so it appears on the Actions tab beside Draw Mana, with the power's
name as its section:

| Row on the Actions tab | Activation | Consumption row | What the player sees |
|---|---|---|---|
| **Channel White** | `utility`, cost `{value: 1, type: "act"}` | `{type: "resource", resource: "inv", value: {min: 1, max: -1}}` | the system's consume dialog with a free-entry amount ("1 or more"); on confirm, a card *"Channels White (2 Investiture) — [frame] until the end of your next turn"*, and a **Channelling White** status on the token |
| **Maintain White** | `utility`, cost `{value: null, type: "fre"}` | the same row | the same dialog; the card reads *"Maintains White (1 Investiture)"*; the status's expiry moves to the end of the following turn |
| Draw Mana | unchanged (`act`, no consumption) | — | unchanged |

Two facts about the data model that bound this, both read at the source:

- **The limit cannot be data.** A 3.1.0 consumption row's `max` is a fixed integer, or `-1` for
  "uncapped" (`consumption/schema.ts:40-46`; the dialog clamps to `max` only when it is not `-1`,
  `item-consume.ts:141-146`). There is no formula `max`, so "up to your rank" is written as `max: -1`
  and enforced by the engine — one generic pre-use clamp that reads the action's parent power's skill
  rank, exactly as `edhaColorRank` already does for every range check (§4).
- **The frame is a status, not a formula.** "While channelling White" is a token status
  (`Channelling White`, registered in `EDHA_STATUSES` like the scene arms `crowned` and `clearsight`
  already are), stamped with an owner-relative expiry the way every timed status is
  (`edhaApplyTimedStatus`, `14-white-accord.js:27`). Riders gate on it through the `requireSelfStatus`
  field the engine already reads. Nothing here is invented; §4 names each primitive.

### 1.4 Interactions

- **Attunement Range.** Frames and riders measure from you and reach Attunement Range where they
  reach at all (15 / 30 / 60 / 90 / 120 ft by rank, `EDHA_ATTUNE_FT`). Channelling does not change
  the range; rank does. *(M8.)*
- **`[Tier][Die]`.** Unchanged for riders: `(@tier)d(2 × rank + 2)`. At 3.x, with the colour a
  `power`, `[Die]` becomes the system's own `@scalar.power.white.die` (d4 → d12 by rank,
  `config.ts:1196-1204`, the identical table) and `[Tier][Die]` its tier copies. **A frame never
  rolls**: where a frame names a number it is the channelled Investiture, so the spend is the dial and
  the die stays the riders' scaling. *(M9.)*
- **Draw Mana and the Keys.** Unchanged: 1 Action, recover your highest colour rank, fire the Key's
  rider. Draw and Channel are separate Actions; drawing while channelling is the normal refuel, and
  the Key's Draw Mana rider is not a "while channelling" rider — it fires on every draw as today.
  *(M10.)*
- **Other trees' answers.** Opening or maintaining a Channel is *spending Investiture on a leyline
  talent* for anything that reads that phrase — Blue's rank-3 Reaction that unmakes a talent as it
  is paid for can shut a Channel as it opens or refuse a maintain. A rider, which spends nothing,
  cannot be answered that way; a release can. That Blue card is named `Counterspell` today, and the
  word is wrong for this system — nothing here is a spell — so it is renamed with this design
  (M17); its text becomes "*when a character within Attunement Range spends Investiture on a
  leyline talent or a Channel … on a success, the effect fails*". The rename is a Blue data change
  (REBUILD) that lands with item 198, not in this pass. *(M7.)*
- **Adversaries.** R-137: adversaries follow the same rules. An adversary's limit is its role rank
  (minion 1 / rival 2 / boss 3), so a minion channels at 1 and a boss can flood at 3.
- **Conditions.** Stunned and Surprised take Actions and Reactions, not Free Actions, so a stunned
  mage can still maintain. Only Unconscious (and dropping to 0 health, which brings it) ends a Channel
  by itself. *(M5.)*
- **Outside combat.** "Until the end of your next turn" has no meaning without turns. A Channel opened
  outside combat lasts until the scene ends or you end it; when combat starts it ends at the end of
  your first turn unless maintained. *(M11.)*
- **Two mages, one colour.** Two Green mages channelling at once — A spending 2 this round, B
  spending 1 — do not touch each other: A's riders read A's Channel and A's spend, B's read B's, and
  a frame that is about the mage (her terrain, his tests) has nothing to stack. The only case that
  needs a rule is a frame whose effect **lands on the same creature from both** — an ally standing
  beside two channelling White mages. Then that creature takes the effect of **one** frame of that
  colour, the larger; the second mage's frame is not added on top. Frames of *different* colours are
  different effects and simply both apply. *(M14.)*

### 1.5 The specialties are the three Realms

The original leyline guide gave each colour three themes — Attunement, Physical, Cognitive — and
the note that replaced them with named specialties ("Coordination, Bulwark, Accord") kept the names
and lost the axis (`Leyline_Talent_Revision_Guide.md` Part 4, `source-materials/legacy-uploads/`).
This design restores it as a principle rather than a rename:

> **The frame is the colour; the specialty is the Realm.** Each colour's three specialty trees are its
> Physical, Cognitive and Spiritual expressions. A rider modifies the frame in its own Realm: a
> Physical rider changes what the frame does to bodies and damage; a Cognitive rider what it does to
> minds, tests and influence; a Spiritual rider what it does to connection, fortune and the plot die.

Nothing in the data changes — the specialty names stay — but §3 labels each of White's three trees
with its Realm and writes every rider to it, and the leyline guide gains the sentence. *(M12.)*

### 1.6 How a two-colour deity tree rides a Channel

Deity trees gate on two colours at 2+ / 2+ (or 3+ / 3+) and test with the thematically apt one of the
two (the colour-thematic test rule, deity guide Part 3 §4). Under this design a deity rider reads
"*while channelling [Colour A] or [Colour B]*", and a deity talent that tests with one colour rides
that colour's Channel by name where the design wants the split to matter. The deity re-pricing
R-151 (a) held for then follows the same rule as leyline: releases keep their cost, riders lose it.

The Channel rule itself stays one colour at a time (M6). What a deity tree may add is a **braid**:
one named entry passive that reads "*while channelling [Colour A], you count as channelling
[Colour B] for [Deity] talents*" (and the reverse), so that a two-colour capstone can ask for both
without a second Channel, a second frame or a second drain. The braid is a talent in the deity tree,
priced there and gated there; it never widens the base rule. Whether any tree wants one is the deity
re-pricing's question. Deity trees are otherwise out of this pass's scope. *(M6 (c).)*

### 1.7 Gate 1 — the menu

Every judgment call in §1, each with its recommended default first. Answer as before — "defaults on
all except …" is enough.

**M1. Cost shape.** (a) **Spend 1 or more Investiture, up to your rank — recommended** (the Metallic
Art shape; R-153 (a)'s convention applied to the one action that matters). (b) A fixed 1 Investiture
to open and maintain; nothing scales with the spend. (c) Free to open; the riders keep their costs
(the Store shape — rejects the premise that the riders ride free).

**M2. The limit.** (a) **Your rank in the colour — recommended** (2 at levels 1 – 5, 3 from level 6;
the same step the trees already gate on, and the invariant in §1.2 depends on it). (b) Your tier.
(c) No limit — spend the pool if you like.

**M3. Duration.** (a) **Until the end of your next turn — recommended** (the canon round-limited
duration; the brief's shape; one payment per round). (b) A number of rounds equal to your rank, no
maintain (the Tap shape — cheaper at rank 3, and the Channel becomes a scene-long stance from level 6).
(c) Until you end it, no maintain, no upkeep (a stance; the Investiture becomes an entry fee).

**M4. Maintain amount.** (a) **Any amount, 1 to rank, chosen each turn; the frame follows this turn's
spend — recommended** (open at 2 for a hard round, drop to 1 to coast). (b) The same amount as the
opening spend, every turn.

**M5. What ends it.** (a) **Your choice, Unconscious, or not maintained — recommended.** (b) Also
Stunned. (c) Also any turn you Draw Mana (you cannot pull and push at once — thematic, and it makes
the refuel a dead round).

**M6. One colour at a time.** (a) **One Channel per creature; opening a second colour ends the
first — recommended** (one frame to show, one status to read; deity riders say "A or B", §1.6).
(b) Two Channels at once, each paid separately (a two-colour mage floods both — double drain, and
two frames on one token). (c) One Channel, but a deity tree's entry passive may braid the second
colour in (only if a deity design ever asks for it; nothing in this pass does).

**M7. Counterspell and "spends Investiture to activate a talent".** (a) **Opening and maintaining
count; riders do not — recommended** (Blue keeps a real answer to a channelling mage, which is Blue's
identity, and pays 2 focus + 1 Investiture + its Reaction for it). (b) Only the opening counts.
(c) The Channel is not a talent; nothing about it can be countered.

**M8. Attunement Range.** (a) **Unchanged by channelling — recommended.** (b) While channelling,
Attunement Range steps up one rank. (c) A frame's reach is [Size] × channelled Investiture.

**M9. What the spend scales.** (a) **Where a frame names a number it is the channelled Investiture;
riders may gate on the amount ("while channelling 2 or more") — recommended** (the spend is a
dial and a key; nothing rolls). (b) Frames use `[Die]`; the spend only gates. (c) Frames are flat;
the spend only gates.

**M10. Draw Mana.** (a) **Unchanged — separate Action, separate turn budget, Key riders as today —
recommended.** (b) Drawing Mana while channelling also counts as the turn's maintain (the maintain
is already free, so this makes it cost nothing — listed to be refused). (c) Drawing Mana ends the
Channel.

**M11. Outside combat.** (a) **Lasts for the scene at the opening cost; ends at the end of your first
combat turn unless maintained — recommended.** (b) A Channel exists only in combat.

**M12. The specialties as Realms.** (a) **A design principle in the guide and each tree's header;
riders are written to it; no rename — recommended.** (b) Rename the specialties to the Realms
("White Physical"). (c) Three frames per colour, one per Realm, chosen when you open the Channel.

**M13. Rider costs.** (a) **A rider has no Investiture cost; Opportunity and focus may stay where
they are the colour's identity; a talent that keeps an Investiture cost is a release, not a rider —
recommended.** (b) Riders may keep a reduced Investiture cost for the biggest effects. (c) Riders
spend *channelled* Investiture (a second pool to track — listed to be refused).

**M14. Two mages, one colour.** Only for a frame that lands on other creatures (§1.4): (a) **a
creature takes one frame of a given colour, the larger — recommended** (riders and the mage's own
frame are never in question; each mage reads their own spend). (b) Same-colour frames add on the
same creature.

**M15. The worked colour for §3.** (a) **White — recommended** (the brief's default: two standalone
Actions in twenty-five, seven Reactions, 60 % costed). (b) Blue. (c) Another colour.

**M16. The name for a talent that keeps its own Investiture cost** ("working" and "spell" are both
out — Ben, gate 1). (a) **Release — recommended**: *you release Investiture into one effect and it is
done*; it pairs with Channel (a flow you hold) against release (a flow you let go), reads on a card
("*Searing Bolt is a release*"), and is no other game's word. (b) Discharge — the same idea, more
clinical. (c) Expression — softer; "an expression of Red".

**M17. The rename of Blue's `Counterspell`** (M7 (a) keeps its rule; the word is wrong — nothing in
Edha is a spell). (a) **Countercurrent — recommended**: a current set against the flow of a
leyline, keeps the "counter" that tells a player what it does, and is Blue's water-and-foresight
register. (b) Interference. (c) Stem the Flow. The card's trigger becomes "*spends Investiture on a
leyline talent or a Channel*" and its result "*the effect fails*"; the change is Blue data (REBUILD)
carried by item 198, and it touches the checklist rows and docs that name the talent.

> **Answered at gate 1 (Ben, chat, 2026-09-16):** *"I like it all except …"* — M1 – M5 (a), **M6 (c)**,
> **M7 (a) with the rename (M17)**, M8 – M13 (a), M14 (a) as rewritten above, M15 (a) White; M16 and
> M17 were filed from his three notes and answered in the next line — *"release, countercurrent, and
> yes to commit"*: **M16 (a) release, M17 (a) Countercurrent.** §1 committed on that yes.

---

## 2. The five frames

A frame is the one ongoing effect that channelling a colour *is* (§1.1): a single sentence, the same
for every mage of the colour, worth paying 1 Investiture a round for on its own, and — where it names
a number — that number is the channelled Investiture (M9 (a)). Each frame below is stated once as a
paragraph (what it is, why it is the colour, what 1 / 2 / 3 buys, which riders hang on it, how it
meets the Key's Draw Mana rider, and what two mages of the colour do to each other under M14) and once
as the card sentence that would sit on the Channel action. Three frames land on other creatures —
allies for White, enemies for Blue and Green — so M14 applies to them: a creature takes one frame of
a colour, the larger. Black's and Red's frames are the mage's own (their attacks, their edge); M14
reaches Red only through a Frenzy rider that shares the edge, and Black not at all.

### 2.1 The specialties as Realms — the map

§1.5 restored the axis; this is the assignment, and it is derived, not invented. The legacy guide
(`source-materials/legacy-uploads/Leyline_Talent_Revision_Guide.md` Part 4) gave each colour an
**Attunement** theme, a **Physical** theme and a **Cognitive** theme, and the named specialties were
built one per theme. The Attunement theme — the leyline layer itself: coordination, prediction,
isolation, momentum, territory — is the **Spiritual** Realm (Investiture, Connection, fortune). The
other two keep their names.

| Colour | Physical (body, damage, the ground) | Cognitive (mind, tests, influence, focus) | Spiritual (the leyline layer: connection, fortune, solitude, momentum, land) |
|---|---|---|---|
| White | **Bulwark** — formation defence, damage sharing | **Accord** — cooperative tests, anti-influence, condition removal | **Coordination** — plot-die sharing, group stability |
| Blue | **Illusion** — barriers, doubles, images | **Calculation** — disadvantage, the counter, influence riders | **Foresight** — prediction, telepathy, the initiative take-back |
| Black | **Ritual** — blood for vital damage | **Subjugation** — focus pressure, domination | **Isolation** — solitude and what it pays |
| Red | **Momentum** — the charge, the leap, the body in motion | **Frenzy** — incitement, tempo, forced aggression | **Conflagration** — Investiture made visible: fire, the arc, the detonation |
| Green | **Restoration** — deep healing, Injuries | **Instinct** — senses, the pack's coordination | **Territory** — difficult terrain that grows and holds |

Four colours' cells match the legacy guide's Physical or Cognitive theme for that colour word for
word (Blue Physical = "illusions — barriers, false images"; Black Physical = "HP sacrifice … vital
damage"; Green Physical = "deep single-target healing"). **Red is the one deliberate departure**: the
legacy guide put pyromancy under Physical and momentum in the Attunement layer, and Ben swapped them
at gate 2 — fire is the leyline's Investiture made visible (Spiritual), the charge is the body
(Physical). *(F-0 (b).)*

### 2.2 White — the line

**What it is.** Standing together makes the line harder to hurt: every ally in your Attunement Range
who has another ally at their shoulder gains deflect equal to the Investiture you are channelling,
and so do you. It is TREE-INTENT's first clause ("*harder to hurt*") made continuous, and it is the
thing every White card already assumes — nearly all of them need a friendly body beside another.
Today the wall is Guardian Stance (+1 deflect while an ally is adjacent to *you*, free) and Shield
Wall (half `[Tier][Die]` — 1.75 at tier 1, 4.5 at tier 2 — off every attack on allies adjacent to you
when two are); the frame reaches the whole formation instead of your own square. **What the spend
buys:** 1 deflect for a trickle; 2 at a flood at levels 1 – 5 (a Draw every round); 3 from level 6.
Deflect only stops impact, keen and energy, so a spirit or vital attack goes through the wall —
Black's identity against White's, unchanged. **The riders.** Bulwark (Physical) sharpens the wall:
step in, take the hit, hold the ally at 1. Accord (Cognitive) adds "harder to sway" to whoever the
frame already covers. Coordination (Spiritual) adds "luckier on the dice". **Draw Mana** still heals
every visible ally for your tier on each draw — the draw is the line breathing, the Channel is the line
holding. **Two White mages:** an ally beside both takes the larger deflect, not the sum (M14).

> **Channel White.** You and allies you can see within Attunement Range gain deflect equal to the
> Investiture you are channelling while adjacent to another ally.

**F-W.** (a) **The deflect line above — recommended.** (b) The formation line: allies adjacent to
another ally gain +1 to all three defenses, fixed — every Realm at once, but nothing scales and a
flood buys nothing the riders do not gate. (c) The plot-die line: allies in range may raise the stakes
up to the channelled number of times each round — Coordination as the base; the least legible as
"the wall", and the plot die is the GM's lever in canon.

### 2.3 Blue — the reading

> **A rules fact recorded at gate 2 (Ben, chat, 2026-09-16, from the Mistborn Handbook chapter 3,
> confirmed in a parallel session):** advantage and disadvantage cancel one for one, **and each die
> in a roll can carry its own** — the d20, the plot die, the damage die — so a second instance of
> disadvantage is not wasted: whoever inflicts it assigns it to another die of that roll. The system
> already models this (`d20-roll.ts` carries `advantageMode` for the d20 and `advantageModePlot` for
> the plot die, `damage-roll.ts` its own `advantageMode`, at both 2.1.0 and 3.1.0); what folds every
> source into the single d20 scalar is the **Edha engine** (`edhaNextModFoldMode`,
> `15-blue-calculation.js:239`). So `SYSTEM-PRIMER.md` fact 1, the leyline guide's advantage
> paragraph and the reasoning under R-100 / R-110 describe the engine's fold, not the game's rule.
> This design is written to the game's rule; §4 names the widening the engine needs, and §5 carries
> the docs that must be corrected.

**What it is.** Blue makes the roll that matters go wrong. Each time you pay for the Channel you
*read* one enemy, and its next test suffers disadvantage equal to the Investiture you spent — one
instance per die, assigned as you choose: at 1 its d20; at 2 its d20 and its plot die, or its damage;
at 3, from level 6, the whole roll. It is the disadvantage engine (Intercept, Probability Cascade,
False Premise, Pattern Recognition, Redirect Momentum's contest: five costed ways today) made into
the base, with the spend as the depth of the reading. **What the spend buys:** depth on the one
enemy that matters — the archer's d20 alone, or its d20 and its damage both. A reading not used by
your next payment lapses; the reading is fresh each round. **The riders.** Calculation (Cognitive)
deepens what a read enemy suffers (its Reactions, its next two tests, its influence) and widens the
reading to a second enemy. Illusion (Physical) puts a wall, a double or an image where the reading
says the enemy will go. Foresight (Spiritual) predicts — the declared action that earns a Reaction,
the intent the GM reveals, the slow-turn advantage. **Draw Mana** still grants advantage on your next
Cognitive test. **Two Blue mages** reading the same enemy: one frame of a colour, the larger (M14) —
the deeper reading stands, the two do not add.

> **Channel Blue.** When you channel or maintain Blue, choose an enemy you can see within Attunement
> Range; it has disadvantage on its next test equal to the Investiture you spent.

**F-B.** (a) **The deep reading above, one enemy, one instance per die — recommended** (Ben's
suggestion at gate 2; it is what "the roll that matters" means once dice carry disadvantage
separately). (b) The distributed reading: disadvantage equal to the spend, distributed among enemies
you can see as you choose — wide or deep each round; the most Blue and the most to adjudicate (a
count per creature every payment). (c) The wide reading (gate 2's first draft): as many enemies as
the spend, one instance each — breadth only, and it leaves the per-die rule unused.

### 2.4 Black — the hunt

**Why the first draft is gone.** Gate 2's first Black frame widened the isolation radius by the spend
and kept the alone Weakened. Ben's objection stands: at 1 Investiture "no ally within 5 feet" *is* the
definition of Isolated (`edhaIsIsolated`, the 07-05 ruling — a positional fact nobody applies; the
adversary alone in a room is Isolated the moment anyone checks), and the Weakened half is what the
Key's Draw Mana pulse already does. A frame that restates a definition and repeats the Key is not a
frame. Isolated and Weakened stay exactly as they are; the Channel is something else.

**What it is.** The hunt. Your attacks against Isolated creatures deal extra vital damage equal to
the Investiture you are channelling. It is the colour's sentence — "*from there the tree does
everything better against them*" — made into the base, on the damage type that is Black's identity
(vital ignores deflect: the wall White is raising across the field does nothing against it). It
reads the positional fact directly, applies nothing, and pays the mage for doing the one thing the
tree is about: hunting whoever stands alone. "Attacks" is the system's word — a weapon Strike, and a
Black attack test such as Withering Ray's — so a melee Black mage and a ray-caster both carry it.
**What the spend buys:** +1 vital on every hit against the alone for a trickle; +2 at a flood at
levels 1 – 5; +3 from level 6. Against Withering Ray's 2d6 at tier 1 that is +14 % to +28 %; against a
d8 Strike, +25 % at a flood — the same band as Kindle (+Red modifier on energy) and Mighty, and it
stacks with Severance (vital *instead of* the weapon's type) without doubling it. **The riders.**
Isolation (Spiritual) makes the solitude the frame pays for — the push that strands one, the step
that closes, the presence that keeps them from walking back. Ritual (Physical) spends blood for
more of the same damage, and is where a rider may let you **pay the Channel in health** instead of
Investiture ("*while channelling Black, you may maintain it by losing health equal to the
Investiture you would spend*" — Sanguine Reservoir's economy, as a rider, not a change to the base
rule). Subjugation (Cognitive) taxes the focus of the hunted. **Draw Mana** still Weakens every
visible enemy with no ally within 5 feet, once — the pulse that opens the hunt; Predatory Patience
and the other Weakened payoffs read it as today. **Two Black mages:** each adds their own extra
damage to their own attacks; nothing to stack (M14 does not arise).

> **Channel Black.** Your attacks against Isolated creatures deal extra vital damage equal to the
> Investiture you are channelling.

**F-K.** (a) **The hunt above — recommended.** (b) The tide: Isolated enemies you can see within
Attunement Range are Weakened for as long as they stay so, *and* your attacks against Weakened
creatures deal extra vital damage equal to the spend — the state and the payoff in one line; longer,
and its first half is the Key's pulse made continuous, which is the redundancy Ben named. (c) The
drain: Isolated enemies you can see within Attunement Range take vital damage equal to the spend at
the start of their turn — automatic, and it *punishes* solitude, which drives enemies together into
the party's areas instead of rewarding the mage for hunting them apart.

### 2.5 Red — the rising edge

**What it is.** Red gets stronger as the fight gets louder. Each time damage is dealt within your
Attunement Range — by anyone, to anyone — **you** gain +1 to your next test, and the edge builds up
to the Investiture you are channelling; your next test spends it. Gate 2's first draft gave the edge
to every ally too, which is Battle Fever (a Frenzy passive today, capped at rank, reset at the start
of your turn) promoted whole to the base — and Ben read it as too strong, which it is: three allies
each carrying a +2 that refills on every hit in the fight, for 2 Investiture a round. The frame is the
mage's own edge; **sharing it is what the Frenzy tree is for** — Battle Fever becomes the Cognitive
rider that extends the frame to allies within range, and the Frenzy tree's other cards decide how
far and how fast. **What the spend buys:** your ceiling — +1 for a trickle, +2 at a flood, +3 from
level 6 — on the test you choose to spend it on. The bonus rides the engine's summing next-test
channel (`edha-next-test-mod`, a list since item 49); the ecosystem review's warning about that
channel was about *uncapped* totals, and this one is capped by the spend and lands on one creature.
**The riders.** Momentum (Physical) rides the edge into the charge, the leap and the Fast turn.
Frenzy (Cognitive) shares it, incites, and punishes the failing. Conflagration (Spiritual) turns it
into fire. **Draw Mana** still grants advantage on your next Physical test and costs your Reaction —
the identity tax stays. **Two Red mages:** each carries their own edge; nothing to stack (M14 does
not arise unless a Frenzy rider shares it, and then the larger applies).

> **Channel Red.** Each time damage is dealt within Attunement Range, you gain +1 to your next test,
> up to the Investiture you are channelling.

**F-R.** (a) **The mage's own rising edge above, shared only by Frenzy riders — recommended.**
(b) The shared edge (gate 2's first draft): you and every ally in range each build the bonus — Battle
Fever as the base; Ben's "quite strong" reading is right, and it would make Frenzy's identity the
colour's default. (c) The fire line: damage you deal increases by the channelled Investiture — the
simplest and the pyromancer's, but it is Conflagration alone and not the colour's stated mechanic.

### 2.6 Green — the ground

**What it is.** The ground is the colour, and channelling makes it bite: enemies that enter or start
their turn in your difficult terrain within Attunement Range take keen damage equal to the
Investiture you are channelling. Every Draw Mana lays terrain (the Key); the Channel is what makes
laying it matter before rank 2, where Thorn Field (half `[Tier][Die]` on the same trigger) arrives
today. **What the spend buys:** 1 / 2 / 3 keen per enemy per turn — small on one creature, real
across a field with three enemies standing in it for three rounds, and it is the only frame whose
number multiplies by the ground you have already laid. **The riders.** Territory (Spiritual) grows
and holds the ground — spreading roots, grasping vines, the Disengage that fails. Restoration
(Physical) heals the pack that stands on it. Instinct (Cognitive) hunts what stands in it — the
pack's advantage, the weakest creature known. **Draw Mana** still creates difficult terrain within
[Size] of a point in range; the Channel does not lay ground, it arms it. **Two Green mages:** an enemy
standing in both fields takes the larger once (M14).

> **Channel Green.** Enemies that enter or start their turn in your difficult terrain within
> Attunement Range take keen damage equal to the Investiture you are channelling.

**F-G.** (a) **The ground above — recommended.** (b) The regrowth line: allies within Attunement Range
regain health equal to the channelled Investiture at the start of their turns — Restoration as the
base; party-wide regeneration of 2 a turn at level 1 for a Draw a round is the strongest sustain in
the game and would need the Draw Mana heal rebalanced against it. (c) The pack line: when you and an
ally both attack the same enemy in a round, each attack deals extra damage equal to the channelled
Investiture — Coordinated Hunt as the base; nothing for the ground.

### 2.7 Gate 2 — the menu

**F-0. The Realm map (§2.1).** (a) As first tabled, the legacy guide's themes verbatim. (b) **With
Red's Conflagration and Momentum swapped (fire as Spiritual, the charge as Physical) — Ben's pick at
gate 2, tabled above.** (c) Ben's own assignment for any cell.

**F-W, F-B, F-K, F-R, F-G** — the frame per colour, (a) recommended in each. "Defaults on all
except …" is enough; a frame Ben wants reworded rather than replaced is a note, not a menu pick.

> **Gate 2, first exchange (Ben, chat, 2026-09-16):** F-0 → (b); Blue re-drafted to the per-die rule
> he recorded (F-B (a) is now the deep reading he suggested); Black's card reworded so Isolated stays
> positional; Red's edge narrowed to the mage (F-R (a)) after his "quite strong" on the shared
> version.
> **Second exchange:** *"If they have no ally within 5 feet aren't they isolated without the frame? I
> don't think this does anything. Let's try another frame for black. default elsewhere."* → **F-W (a),
> F-B (a), F-R (a), F-G (a) answered**; the Black frame was replaced by the hunt (§2.4).
> **Third exchange:** *"a"* → **F-K (a) the hunt.** §2 committed on that answer.

---

## 3. White, worked

Every card below was read from `data/leyline.json` (structure and source prose) and
`data/authored/leyline-white.json` (the authored card and its rules) on 2026-09-16, at `main`
`fc1fc04` — after item 105's minimal-change set (Interposing Shield a Special, Shared Burden 1
Investiture, Ordered Advance 1 Action), which is why the counts here differ from the ecosystem
review's. Nothing is written from memory. **Today's White:** 10 Passives, 7 Specials, 2 Actions,
6 Reactions; 15 of 25 cost something, every one of them Investiture (two also focus or an Opportunity), for a tree-sum of 17 (§C.2).

### 3.1 The three trees, by Realm

| Tree | Realm | What its riders do to the frame |
|---|---|---|
| **Bulwark** | Physical | deepen the wall: step in, take the hit, hold the ally at 1, and the second layer of reduction |
| **Accord** | Cognitive | make the line harder to sway: cheaper resistance, the counter-argument, the Disorient riders, +1 Cognitive / Spiritual |
| **Coordination** | Spiritual | make the line luckier: the pointed target, the raised stakes, the blanked Complication, the condition lifted, the small heal |

The frame (§2.2) is *"You and allies you can see within Attunement Range gain deflect equal to the
Investiture you are channelling while adjacent to another ally."* Note that **you** are an ally to
whoever stands beside you, so an ally adjacent only to the mage is covered.

### 3.2 The conversion rules applied

1. **A costed talent becomes a rider** — it gains "*While channelling White,*", loses its Investiture
   cost, and keeps an Opportunity or focus cost only where that is the card's identity (M13).
2. **A free passive stays free and unconditional** — the Channel costs; it does not take. Two
   exceptions, both cards that *are* the frame's clause ("adjacent to another ally") in another
   Realm: **Shield Wall** and **Unyielding Accord** become "while channelling" riders, because
   unconditional they would double the wall the Channel is paid for. *(W-1.)*
3. **A Reaction that is an *action* stays a Reaction** (a test, a redirect, a contest); **a Reaction
   that is a *modifier* becomes a Special with "Once per round."** Six Reactions become three. *(W-2.)*
4. **A scene-long effect is a release**, not a rider — a round-scoped frame should not carry a
   pact that lasts the scene. One card: Terms of Accord keeps its 1 Investiture. *(W-3.)*
5. **The capstone gates on the flood** — Unbreakable Line's 3 Investiture becomes "*while
   channelling 3 or more White*" (M9 (a)), which at White 3+ means the full Channel. *(W-4.)*
6. **One rider reads the channelled number** — Voice of Authority's disadvantage is "equal to the
   Investiture you are channelling", one instance per die under the rule recorded in §2.3. *(W-5.)*
7. **Guiding Signal rides the payment** — a Special that fires "when you channel or maintain
   White", so the point happens every round without an Action. *(W-6.)*

Convention: the condition is written "*While channelling White,*" at the head of the card, and the
Key's rider ("when you Draw Mana") stays a Draw Mana rider.

### 3.3 The twenty-five cards

Format: **name** — *tree / Realm* · today → proposed · the full card sentence as it would ship
(words in parentheses; the guide's target is 20 – 25, and today's card count is given where it was
over). Prerequisites and connections are unchanged throughout — this pass changes action type,
cost and text, not the graph.

**White Leyline Attunement** — *Key* · Passive; — → **unchanged.** *"When you Draw Mana, allies you
can see within Attunement Range regain health equal to your tier."* (18)

**Concordant Presence** — *Coordination / Spiritual* · Passive; — → **unchanged.** *"When an ally
you can see within Attunement Range succeeds on a test, the next ally testing that same skill this
round raises the stakes."* (25)

**Guiding Signal** — *Coordination / Spiritual* · 1 Action; 1 Investiture → **Special; —.**
*"When you channel or maintain White, designate a character within Attunement Range. The next ally
to test against it this round raises the stakes."* (24; was 24)

**Unity of Purpose** — *Coordination / Spiritual* · Passive; — → **unchanged.** *"When two or more
allies aid the same test, raise the stakes."* (11)

**Beacon of Stability** — *Coordination / Spiritual* · Special; 1 Investiture → **Special; —.**
*"While channelling White, when you Draw Mana, remove one condition from an ally within Attunement
Range."* (17; was 18)

**Shared Conviction** — *Coordination / Spiritual* · Reaction; 2 Focus, 1 Investiture → **Special;
2 Focus.** *"While channelling White, when an ally within Attunement Range would fail a test, spend
2 focus to add your White modifier to their result. Once per round."* (27; was 32)

**Ordered Advance** — *Coordination / Spiritual* · 1 Action; 1 Investiture → **1 Action; —.**
*"While channelling White: this round, when you move, allies within 10 feet may move half their
Speed without provoking Reactions."* (20; was 20)

**Mending Aura** — *Coordination / Spiritual* · Special; Opportunity, 1 Investiture → **Special;
Opportunity.** *"While channelling White, spend an Opportunity to restore half [Tier][Die] health
to each ally within [Size]."* (18; was 18)

**Pillar of Order** — *Coordination / Spiritual* · Reaction; 1 Investiture → **Special; —.**
*"While channelling White, when an ally within Attunement Range rolls a Complication, change it to
a blank face. Once per round."* (22; was 20)

**Guardian Stance** — *Bulwark / Physical* · Passive; — → **unchanged.** *"While an ally is
adjacent to you, you both gain +1 deflect."* (12) The entry talent works before the Channel is
open and adds +1 on top of the frame; it stays free.

**Interposing Shield** — *Bulwark / Physical* · Special; 1 Investiture → **Special; —.** *"While
channelling White, when an ally within 10 feet takes damage, move up to 10 feet toward them and
reduce it by half [Die]. Once per round."* (28; was 24)

**Retributive Guard** — *Bulwark / Physical* · Reaction; 1 Investiture → **Reaction; —.** *"While
channelling White, when an enemy within Attunement Range damages an ally adjacent to you, test
White vs. Spiritual; on a success, deal [Tier][Die] spirit damage to it."* (28; was 32)

**Shared Burden** — *Bulwark / Physical* · Reaction; 1 Investiture → **Reaction; —.** *"While
channelling White, when an ally adjacent to you takes damage, take half of it in their place."*
(18; was 22)

**Devoted Conduit** — *Bulwark / Physical* · Passive; — → **unchanged.** *"When an ally within
Attunement Range takes damage intended for another creature, reduce that damage by half
[Tier][Die]."* (20)

**Shield Wall** — *Bulwark / Physical* · Passive; — → **Passive; — , now a rider (W-1).** *"While
channelling White, when two or more allies are adjacent to you, attacks against them deal half
[Tier][Die] less damage."* (21; was 18)

**Unbreakable Line** — *Bulwark / Physical* · Special; 3 Investiture → **Special; — , gated on the
flood (W-4).** *"While channelling 3 or more White, when an adjacent ally would drop to 0 health,
test White, DC half the damage; on a success they drop to 1 instead. Once per round."* (31; was 40)

**Hardy** — *Bulwark / Physical* · Passive; — → **unchanged.** *"Gain +1 maximum health per level,
including previous levels."* (9)

**Terms of Accord** — *Accord / Cognitive* · Special; 1 Investiture → **unchanged — a release
(W-3).** *"When you and a character within Attunement Range verbally agree on a shared objective,
spend 1 Investiture. You both gain +1 to tests pursuing the objective for the scene. One active
accord per creature."* (36)

**Counterpoint** — *Accord / Cognitive* · Reaction; 1 Investiture → **Reaction; —.** *"While
channelling White, when an enemy within Attunement Range successfully influences an ally, test
White. On a success, negate the effect and Disorient the enemy until the end of your next turn."*
(32; was 35)

**Disciplined Mind** — *Accord / Cognitive* · Passive; — → **unchanged.** *"You and allies within
Attunement Range reduce the focus cost to resist influence by 1 (minimum 1)."* (17)

**Overwhelming Authority** — *Accord / Cognitive* · Special; 1 Investiture → **Special; —.** *"While
channelling White, when you successfully influence a character, it also becomes Disoriented until
the end of your next turn."* (20; was 20)

**Bound by Word** — *Accord / Cognitive* · Passive; — → **unchanged.** *"When an ally within
Attunement Range acts in pursuit of an active accord's objective, they may use your White modifier
in place of their own."* (26)

**Collective Resolve** — *Accord / Cognitive* · Special; Opportunity, 1 Investiture → **Special;
Opportunity.** *"While channelling White, spend an Opportunity to grant allies within Attunement
Range Determined."* (14; was 15, and the source prose's "gran" is fixed with it)

**Unyielding Accord** — *Accord / Cognitive* · Passive; — → **Passive; — , now a rider (W-1).**
*"While channelling White, allies within Attunement Range gain +1 to Cognitive and Spiritual
defenses while adjacent to another ally."* (20; was 17)

**Voice of Authority** — *Accord / Cognitive* · Reaction; 1 Investiture → **Special; — (W-2, W-5).**
*"While channelling White, when an enemy within Attunement Range targets an ally with a hostile
action, impose disadvantage on it equal to the Investiture you are channelling. Once per round."*
(30; was 20)

### 3.4 Before and after

| # | Talent | Tree / Realm | Today | Proposed | Condition |
|---|---|---|---|---|---|
| 1 | White Leyline Attunement | Key | Passive; — | Passive; — | — (Draw Mana rider) |
| 2 | Concordant Presence | Coordination / Spi | Passive; — | Passive; — | — |
| 3 | Guiding Signal | Coordination / Spi | 1 Action; 1 Inv | **Special; —** | on the payment |
| 4 | Unity of Purpose | Coordination / Spi | Passive; — | Passive; — | — |
| 5 | Beacon of Stability | Coordination / Spi | Special; 1 Inv | **Special; —** | while channelling + Draw Mana |
| 6 | Shared Conviction | Coordination / Spi | Reaction; 2 Foc, 1 Inv | **Special; 2 Foc** | while channelling; once per round |
| 7 | Ordered Advance | Coordination / Spi | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 8 | Mending Aura | Coordination / Spi | Special; Opp, 1 Inv | **Special; Opp** | while channelling |
| 9 | Pillar of Order | Coordination / Spi | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 10 | Guardian Stance | Bulwark / Phy | Passive; — | Passive; — | — |
| 11 | Interposing Shield | Bulwark / Phy | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 12 | Retributive Guard | Bulwark / Phy | Reaction; 1 Inv | **Reaction; —** | while channelling |
| 13 | Shared Burden | Bulwark / Phy | Reaction; 1 Inv | **Reaction; —** | while channelling |
| 14 | Devoted Conduit | Bulwark / Phy | Passive; — | Passive; — | — |
| 15 | Shield Wall | Bulwark / Phy | Passive; — | Passive; — | **while channelling** |
| 16 | Unbreakable Line | Bulwark / Phy | Special; 3 Inv | **Special; —** | while channelling 3 or more; once per round |
| 17 | Hardy | Bulwark / Phy | Passive; — | Passive; — | — |
| 18 | Terms of Accord | Accord / Cog | Special; 1 Inv | Special; 1 Inv | — (release) |
| 19 | Counterpoint | Accord / Cog | Reaction; 1 Inv | **Reaction; —** | while channelling |
| 20 | Disciplined Mind | Accord / Cog | Passive; — | Passive; — | — |
| 21 | Overwhelming Authority | Accord / Cog | Special; 1 Inv | **Special; —** | while channelling |
| 22 | Bound by Word | Accord / Cog | Passive; — | Passive; — | — |
| 23 | Collective Resolve | Accord / Cog | Special; Opp, 1 Inv | **Special; Opp** | while channelling |
| 24 | Unyielding Accord | Accord / Cog | Passive; — | Passive; — | **while channelling** |
| 25 | Voice of Authority | Accord / Cog | Reaction; 1 Inv | **Special; —** | while channelling; once per round; reads the spend |

Sixteen cards change; nine are untouched (the Key, six free passives, Terms of Accord, Guardian
Stance).

### 3.5 The mix, against the bands

| | Passive | Special | 1 Action | 2 Actions | Free | Reaction | Passive + Special | costed (any) | costed (Investiture) | Investiture tree-sum |
|---|---|---|---|---|---|---|---|---|---|---|
| **White today** | 10 (40 %) | 7 (28 %) | 2 (8 %) | 0 | 0 | 6 (24 %) | 68 % | 15 (60 %) | 15 (60 %) | 17 |
| **White proposed** | 10 (40 %) | 11 (44 %) | 1 (4 %) | 0 | 0 | 3 (12 %) | **84 %** | **4 (16 %)** | **1 (4 %)** | **1** (+ the Channel, 1 – rank a round) |
| published Invested band (§C.1 / §C.2) | | | | | | 2 – 7 % | 71 – 87 % | 8 – 46 % | | |
| leyline guide target | ~35 % | 25 – 30 % | ~15 % | ~8 % | 5 – 8 % | 5 – 8 % | | | | |

Read against the bands: **Passive + Special lands inside the published band** (84 %, from 68 %) and
**costed drops from 60 % to 16 %**, inside 8 – 46 %, with a single Investiture-priced card left where
there were fifteen. Reactions halve (24 % → 12 %) — still above the 5 – 8 % target, and above every
published family, on purpose: White's identity is *"you rarely act first, you answer"*
(TREE-INTENT), and the three that stay are the three that *do* something on the enemy's turn (a
test and damage, a redirect, a contest). W-2 offers two. Specials overshoot the guide's 25 – 30 %
because four Reactions became Specials; the guide's targets were written for trees with no base
action, and the published Invested families run 37 – 41 % Special for exactly this reason. Single
Actions fall to one card plus the Channel itself, which is now White's self-initiated play every
round — the ecosystem review's "two in twenty-five" becomes one card, one base action, and five
Specials that fire on the mage's own payment, draw, influence or Opportunity.

**What the White player's turn is now.** Round 1: Channel White at 2 (the pool is 4), Draw Mana
(heal the line, and Beacon lifts a condition), one Action left. Every round after: maintain (Free
Action) for 1 or 2, Draw when the pool needs it, and three Actions — one of which may be Ordered
Advance, free — while the line carries +1 or +2 deflect, the point lands on the payment, the
Complication is blanked, the failed test is caught, the interposition and the redirect and the
retaliation all cost nothing. The Reaction is spent on the answer that matters; the Specials answer
the rest, once each.

**What it costs, in numbers.** Today a full White round — Draw, Guiding Signal, one Reaction — spent
2 Investiture and earned 2 (R-126), for two plays. Under the Channel the same Investiture buys the
frame and every rider. The tree's total Investiture pricing falls from 17 to 1, which is the change
R-152 was filed to make; the balance review's yardsticks (`docs/analysis/talent-ecosystem/`) should
be re-run against §2.2's deflect numbers before the build, and that is a §5 item.

### 3.6 Gate 3 — the menu

**W-1. The two formation passives.** (a) **Shield Wall and Unyielding Accord become "while
channelling" riders; the other seven free passives stay unconditional — recommended** (they are
the frame's own clause in another Realm; unconditional they double the wall the Channel pays for).
(b) All free passives stay unconditional (the Channel only ever adds). (c) Every formation passive
becomes a rider, Guardian Stance included (the published shape — nothing works without the metal —
but the entry talent should work at level 1 before a Channel is opened).

**W-2. The Reactions.** (a) **Three — Retributive Guard, Shared Burden, Counterpoint; the three
modifiers become Specials with "Once per round" — recommended** (12 %: above the band, for the
colour that answers). (b) Two — Counterpoint also a Special (8 %, inside the band; its test then
fires without spending the Reaction, which is a small power gain). (c) Six, as today (24 %; the
one-slot problem the ecosystem review measured stays).

**W-3. Terms of Accord.** (a) **A release: Special, 1 Investiture, unchanged — recommended** (a
scene-long pact should not hang on a round-scoped frame). (b) A rider: "*While channelling White,
when you and a character … agree*", no cost, the accord ending when the Channel ends.

**W-4. Unbreakable Line.** (a) **A rider gated on channelling 3 or more — recommended** (the flood
is the cost; at White 3+ that is the full Channel, and one Draw Mana funds it every round).
(b) A release: Special, 3 Investiture, unchanged.

**W-5. Voice of Authority reads the spend.** (a) **Disadvantage equal to the channelled Investiture,
one instance per die — recommended** (the one White card that shows what a flood buys the Accord
tree, under the per-die rule from §2.3). (b) Flat disadvantage, as today.

**W-6. Guiding Signal.** (a) **A Special on the payment — recommended** (the point every round for
free; converts one of White's two Actions into a Special per guide principle 1). (b) A 1 Action
rider with no cost (keeps a second standalone Action). (c) A release: 1 Action, 1 Investiture, as
today.

> **Answered at gate 3 (Ben, chat, 2026-09-16):** *"all recommended"* — **W-1 … W-6 (a).** §3 committed
> on that answer.

---

## 4. The build

What item 198 builds, named from what exists. Every primitive below is in `ENGINE_INDEX.md` or the
3.1.0 source at the line quoted; the *widenings* are new fields or one new event type on existing
primitives, listed as such so the PM can size them, and nothing here is a bespoke subsystem
(iron rule 2a). **No code and no data change in this pass.** Deploy class of the whole build:
ENGINE (F5) + DATA — REBUILD leyline (and the adversaries pack where a block embeds a power) +
⟳ Sync Talents, **at 3.x only** — after item 187's flip, which waits on session one (R-144).

### 4.1 The data shape at 3.x

**Five `power` items in the leyline pack**, one per colour, built by `foundry-build.js` beside Draw
Mana (`drawManaItemDoc`, `foundry-build.js:697`), each carrying:

| Field | Value | Where it comes from |
|---|---|---|
| `type` | `power` | 3.1.0 `data/item/power.ts` |
| `system.id` / `system.skill` / `customSkill` | `white` / `white` / `true` | the Mistborn shape (`packs/metalborn-paths/allomantic-powers/steel/steel-allomancy.json`: `skill: "all"`, `customSkill: true`) |
| `system.type` | `leyline` | a power type Edha registers with `api.registerPowerType` (the Mistborn module registers `metallic-art`; Edha registers none today — `metalworks-comparison.md` Appendix A) |
| `system.talentTree` | the White `talent_tree` UUID | the build already mints `tree.treeDocId` (`foundry-build.js:670`); the `TalentsProviderMixin` (`mixins/talents-provider.ts:10`) lists the tree's talents on the power's Talents tab |
| `system.description` | §2.2's frame paragraph and card sentence | `data/channels.json` (B-1) |
| `system.events` | the Channel's own rules, §4.2 | authored in `data/channels.json`, emitted by the build |
| embedded actions | **Channel White** (`act` 1) and **Maintain White** (`fre`), each with one consumption row `{type: "resource", resource: "inv", value: {min: 1, max: -1, actual: 1}, matchDocument: ancestor Actor}` | the Appendix B.3 action shape (`cosmere-rpg-3.1.0-compatibility.md`); `ActionCostType` `act` / `fre` (`types/cosmere.ts:254-259`) |

**The colour skill becomes non-core.** Today the five colours are written into `COSMERE.skills` as
core skills (N4); R-150 (b) makes them power skills (`core: false`, registered through
`registerSkill` per borrow B4), so `skills.white.unlocked` derives from owning the power
(`data/actor/common.ts:633-641`) and the sheet's White row appears with it. **The leyline path's
`grant-items` rule** (`foundry-build.js:415-420`, which grants the Key and Draw Mana) gains the
power's UUID, so the creation wizard's "path grants Draw Mana" step (`24-…js:298`) grants the Channel
the same way and never touches it itself. `edhaColorRank` (`35-…js`) reads `system.skills[colour].rank`
and is unchanged by core-ness; the adversary fallback to role rank stands, so an adversary block
with an attuned colour embeds the power beside its Key twin and channels at its role rank.

**`[Die]` at 3.x.** Once the skill is unlocked, `@scalar.power.white.die` exists on the actor's roll
data (`documents/actor.ts:1370-1400`, the d4 → d12 table at `config.ts:1196-1204`). Edha's
`(2 * @colorRank + 2)` keeps working; moving formulas onto the scalar is optional and is not part
of this build.

### 4.2 The Channel's own rules — on the power's Events tab

Three rules, all on the power document, readable and editable in Foundry:

1. **The arm.** `use-action` (the 3.x native event; today's `use`) → **`edha-self-status`**
   `{statusId: "channelwhite", timed: true}` — the existing timed self-arm
   (`53-native-event-system.js:2241`; `edhaApplyTimedStatus`, `14-white-accord.js:27`, stamps
   `expireAfter` = `edhaNextTurnCoord`, the end of your next turn; the turn-change pass clears it).
   The **Maintain** action carries the same rule: a re-arm refreshes the expiry
   (`refuseWhileActive: false`). Five statuses join `EDHA_STATUSES` (`01-shared-core.js:184`) —
   `channelwhite` … `channelgreen`, `condition: false`, tinted by `EDHA_COLOR_HEX`, labelled
   *Channelling White* (a label that names no talent — `tests/status-labels.test.js`).
   - **Widening A — `recordSpend`.** The rule stores the consumption's `actual` on the status
     effect's flag (`edha-content.channelled`). The amount is already handed to hooks by the system
     (`options.consumeResponse`, 3.1.0 `documents/item.ts:1312`); the precedent for a rule-written
     flag on a marker is the stance marker (`edha-content.stanceOf`).
   - **Widening B — `spendMax`.** `"@colorRank"`: the rank limit, since a 3.1.0 consumption row's
     `max` cannot be a formula (§1.3). Vetoed BEFORE cost, in the existing pre-cost veto family
     (the already-armed veto on untimed self-status rules; `requireTargetStatus`), announcing the
     shortfall by name in a toast the way item 119 taught the engine to.
   - **Widening C — `exclusiveWith`.** A comma-list of statuses cleared on arm
     (`channelblue, channelblack, channelred, channelgreen`) — M6, one colour at a time. And
     **`endOnStatus: "unconscious"`** — M5; the createActiveEffect watcher `immuneStatuses` already
     installs is the mirror.
2. **The frame.** `edha-watch-rule` → **`edha-aura`** (H7, `13-white-bulwark.js:55` `edhaAuraSweep`,
   the adjacency sweep that manages an AE on you and adjacent allies) with
   `key: "system.deflect.bonus"`.
   - **Widening D — three fields on `edha-aura`:** `requireSelfStatus: "channelwhite"` (the field
     five handlers already carry — §4.3), `scope: "formation"` (you and every ally within
     `rangeColor` Attunement Range who is adjacent to *any* ally, instead of adjacent to the owner —
     `edhaAdjacentAllies`, `13-…js:33`, is the adjacency test it reuses), and
     `amountFormula: "@channelled"`.
   - **`@channelled`** is the one new formula token: `edhaSubstRankTier`
     (`37-…js:92`, pure, pinned) resolves `@colorRank` and `@tier` today and gains a third
     replacement read from the arming status's flag. Every handler that already routes formulas
     through it (terrain damage, `50-green-territory.js:54`; damage-reduce; damage-bonus) inherits
     the token — which is what Green's frame (F-G) and Black's (F-K) will read.
3. **The payment event.** **Widening E — one new event type, `edha-channel`**, fired on every
   Channel / Maintain use with `options.channelled`, exactly as `edha-draw-mana` is fired from the
   Draw Mana hook ("~5 lines of `registerItemEventType` + a sweep inside the existing hook",
   `ENGINE_INDEX.md` §"An ALWAYS-ACTIVE talent can hold no `use` rule"). Guiding Signal's
   `edha-designate` rule moves from `use` to `edha-channel` (W-6) and stays on Guiding Signal's own
   document (iron rule 2b); Blue's Countercurrent watch ("spends Investiture on a leyline talent")
   fires from the same hook at the Blue pass.

### 4.3 The "while channelling" gate on the riders

The field is **`requireSelfStatus`**, which exists today on `edha-watch` (H8), `edha-redirect`,
`edha-test-aura`, `edha-damage-bonus` and `edha-suppress-veil` (`53-…js:602, 2126, 2236, 2590,
2753`). White's sixteen riders use ten other handler types:

| Rider(s) | Handler | Read by | Gate lands in |
|---|---|---|---|
| Shared Conviction, Pillar of Order, Voice of Authority | `edha-test-react` | `12-contested-roll-resolution.js:288` via `edhaWatchersOfRule` | the shared sweep |
| Interposing Shield, Retributive Guard, Shared Burden, Unbreakable Line | `edha-damage-react` | `edhaBulwarkReactions` (`13-…js:156`) via `edhaWatchersOfRule` | the shared sweep |
| Shield Wall | `edha-damage-reduce` | the applyDamage pre-pass (`03-…js`) via `edhaWatchersOfRule` | the shared sweep |
| Beacon of Stability | `edha-cleanse` on `edha-draw-mana` | `edhaDispatchDrawMana` | the Draw dispatcher, one check |
| Ordered Advance, Counterpoint, Overwhelming Authority, Collective Resolve, Mending Aura, Guiding Signal | `edha-move-window`, `edha-def-test`, `edha-prompt-pick`, `edha-pulse`, `edha-burst`, `edha-designate` on `use` / `edha-pre-use` / `edha-channel` | the event system's executor | the pre-cost veto on `preUseItem`, one check |
| Unyielding Accord | an ActiveEffect | — | **Widening G** below |

**Widening F — the gate in three places, one field.** (i) `edhaWatchersOfRule(type)`
(`05-edha-watch.js:323`) returns a cached index of every owner's config-only rules of a type; **22
call sites** read it. A filter applied to the returned list on every call — drop entries whose
`handler.requireSelfStatus` the owner does not carry — gates every config-only handler at once
(the H8 dispatcher's own check at `:412` becomes redundant and can stay). (ii) The pre-cost veto on
`preUseItem` refuses a `use` / `edha-pre-use` rule whose `requireSelfStatus` is unmet, with the
toast, before anything is spent. (iii) `edhaDispatchDrawMana` skips a Draw Mana rule the same way.
The **schema** side is ten declarations — the same `StringField` the five handlers carry, added to
the ten types above so the Events tab shows the field (`tests/handler-schemas.test.js` pins the
schemas; lint-refs pass 11 would otherwise flag an undeclared field).

**Widening G — the channel-rider ActiveEffect.** Unyielding Accord's +1 Cognitive / Spiritual is an
AE on the talent today (`flags.edha-content.passive`). The stance machine already has the pattern
for "numbers that hold only while a state is up": one AE on the talent flagged
`edha-content.stanceRider` with `transfer: false`, copied onto the stance marker at enter and
gone at leave (`edhaStanceRiderChanges`, pure, pinned in `tests/engine-helpers.test.js`). The same
helper, keyed on a `channelRider: "white"` flag and copied onto the `channelwhite` status effect
when it is armed, carries Unyielding Accord — and any future numeric rider — with no engine
branch on a name.

**Two rider-specific fields.**
- **Widening H — `requireChannelled`** (a number) beside `requireSelfStatus`: Unbreakable Line's
  "*while channelling 3 or more*" (W-4) reads the `channelled` flag on the status.
- **Widening I — per-die disadvantage.** Voice of Authority (W-5) and Blue's frame (F-B) both
  need "*disadvantage equal to N, one instance per die*". `edha-next-test-mod` (`53-…js:2798`)
  already has `appliesTo: test | damage | either` and the list-shaped flag (item 49); it gains
  `dice: "d20, plot, damage"` and a `count` that may be `@channelled`, and the injector writes the
  system's own per-die fields — `advantageMode` (d20), **`advantageModePlot`** (`dice/d20-roll.ts:79`)
  and the damage roll's `advantageMode` (`dice/damage-roll.ts:44`) — in that order. Today's fold
  (`edhaNextModFoldMode`, `15-…js:239`) keeps handling the d20; the plot and damage writes are
  new, and `tests/advantage-channel.test.js`'s two-line invariant (the string enum and the
  `configureDialog` seed) applies to each new site. This is also the engine half of the docs
  correction §2.3 recorded.

### 4.4 What moves in the overlay and the pipeline

- **The talent overlay's seven keys are unchanged** (`lint-refs.js:50` `TALENT_KEYS`). Per rider the
  edits are ordinary: `activation` (the type — `spe` / `rea` / `act` — and the Investiture consume
  row removed; at 3.x, on the embedded action per item 185), `description` (§3.3's sentence),
  `events` (the `requireSelfStatus` field on each rider's handler; Guiding Signal's event `use` →
  `edha-channel`; Unbreakable Line's `requireChannelled: 3`; Voice of Authority's action → the
  per-die mod), `effects` (Unyielding Accord's AE gains `channelRider` and `transfer: false`).
- **`data/leyline.json`** — the sixteen White records' `action`, `cost` and `description` updated
  with the same sentences (the source prose and the authored card move together, `CLAUDE.md`
  §"Where behavior lives"), and the source's "gran" typo with them. Graph untouched: no
  `connections` or `prerequisites` change, so `validate.js`'s DAG and reachability checks and
  `tests/pipeline.test.js` are unaffected.
- **The power's source** — `data/channels.json` (B-1): five records (colour, power name, frame
  sentence, frame paragraph, the two actions' text) read by a `channelPowerDoc` in
  `foundry-build.js`, the way `drawManaItemDoc` builds Draw Mana; build-only, edited in the JSON,
  not extracted. It is not a talent, so it stays outside the seven-key overlay and lint-refs pass 1.
- **Validators and tests.** `validate-packs.js:42` enumerates the item types it checks and learns
  `power`; `tests/handler-schemas.test.js` (ten schema declarations, the new fields);
  `tests/handler-registry.test.js` (the `edha-channel` event); `tests/status-labels.test.js` (five
  statuses); `tests/engine-helpers.test.js` (`@channelled` in `edhaSubstRankTier`); a new
  `tests/channel.test.js` pinning the clamp, the maintain refresh, the exclusive end, the
  `channelled` flag write and the formation scope — mutation-verified, per iron rule 4.
- **Docs the build carries** (iron rule 5): `ENGINE_INDEX.md` (the event type and eight widenings);
  the leyline guide (the Channel under "Key Mechanic", §1.5's Realm principle, and the advantage
  paragraph rewritten to the per-die rule — §2.3); `SYSTEM-PRIMER.md` fact 1; a note under R-100
  / R-110 in `EDHA_RULINGS.md`; `EDHA_TALENT_HANDBOOK.md`; the player primer and one-pager (the
  Channel is player-facing); the White section header in `13-white-bulwark.js` (rule 3's ledger).

### 4.5 The bench rows

Sixteen rows, all **🤖** (an agent drives every one on the Route A 3.1.0 copy; nothing here is
Ben's judgment — the gates were), to be added under `# BENCH — White (leyline)` as a
`## Channel — item 198` block when the build lands. Written here so the PM can size the run.

| Row | Drive | Evidence |
|---|---|---|
| CH-1 open | Bench — White: Channel White, enter 1 | *Channelling White* on the token with `expireAfter` = end of its next turn; the card names the frame; Investiture −1 |
| CH-2 clamp | at rank 2 enter 3, then 2 | 3 refused before cost with a toast naming the limit, nothing spent; 2 spent |
| CH-3 formation | Ally A adjacent to Ally B in range; Ally C alone; Ally D adjacent only to the mage; channelled 2 | A, B, D and the mage +2 deflect on the sheet; C unchanged |
| CH-4 maintain | next turn Maintain White at 1; a later turn skip it | expiry advances one turn and deflect reads +1; after the skipped turn the status and the deflect are gone at the end of the mage's next turn |
| CH-5 exclusive | Channel Blue while channelling White | White's status ends, Blue's arms |
| CH-6 Unconscious | toggle Unconscious on the mage | the Channel ends |
| CH-7 riders off / on | with no Channel: an adjacent ally is hit; Ordered Advance used | no Interposing Shield offer; Ordered Advance refused before cost with the toast. With the Channel: the offer posts and the move window arms, both spending nothing |
| CH-8 the payment | Channel, then Maintain | Guiding Signal's designate card on both |
| CH-9 Draw rider | Draw Mana with and without the Channel | Beacon's cleanse card only with it |
| CH-10 the flood | a rank-3 bench PC channelling 2, then 3; an adjacent ally drops to 0 | Unbreakable Line offers only at 3 |
| CH-11 per die | Voice of Authority while channelling 2 as an enemy attacks an ally | the enemy's d20 and plot die (or damage) both at disadvantage in the roll config |
| CH-12 two mages | Bench — White II channelling 1 beside a White channelling 2, same ally | +2, not +3 |
| CH-13 Countercurrent | Bench — Blue reacts to a Channel opening | the Channel fails on a success (needs the Blue pass landed) |
| CH-14 adversary | a rival with White attuned channels; a minion | rival clamps at 2, minion at 1, role rank |
| CH-15 outside combat | open with no combat, then start one | the status persists, then ends at the end of the mage's first turn unless maintained |
| CH-16 the tabs | the Actions tab and the Talents tab of a synced PC | two rows under the power; the riders on the Talents tab; ⟳ Sync refreshes the power |

### 4.6 Gate 4 — the menu

**B-1. Where the power's text lives.** (a) **`data/channels.json` + `channelPowerDoc` in the build,
edited in the JSON, not extracted — recommended** (Draw Mana's shape; a power is not a talent, so
the seven-key overlay and its lint stay as they are). (b) A new overlay group with its own key set
(lint-refs widened; the extract round-trip taught the power). (c) Hand-authored JSON documents in
the pack source.

**B-2. Where the rider gate lives.** (a) **One field, three dispatch sites (the shared sweep's
return filter, the pre-cost veto, the Draw dispatcher) and ten schema declarations —
recommended.** (b) Per-handler checks inside each of the ten executors, as the five carrying the
field do today.

**B-3. Guiding Signal's trigger.** (a) **A new `edha-channel` event type on the Channel / Maintain
use, the `edha-draw-mana` precedent — recommended.** (b) A new `edha-watch` kind (the watch
vocabulary is `test, skill-roll, defeat, focus-change, turn-start, die-step, token-move, damaged` —
`53-…js:590` — and "an action of mine was used" is not in it either way).

**B-4. Per-die disadvantage (Widening I).** (a) **Built with the Channel; Voice of Authority is the
first consumer and Blue's frame the second — recommended.** (b) Deferred; Voice of Authority ships
flat until a Blue pass builds it.

**B-5. The colour skill.** (a) **Non-core, unlocked by the power, per R-150 (b) — recommended**
(the sheet row appears with the power; the wizard grants it through the path). (b) Stays core;
`unlocked` ignored (the power is a container only).

**B-6. Where the bench runs.** (a) **The sixteen rows on the Route A 3.1.0 copy, before the flip —
recommended** (R-144: the live table stays on 2.1.0 and session one). (b) After the flip, on the
live table.

> **Answered at gate 4 (Ben, chat, 2026-09-16):** *"all defaults"* — **B-1 … B-6 (a).** §4 committed on
> that answer.
