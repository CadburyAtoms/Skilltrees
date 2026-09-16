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
| 2 | §2 The five frames | not yet written |
| 3 | §3 White, worked | not yet written |
| 4 | §4 The build | not yet written |
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
