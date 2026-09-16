# Blue, worked — the Channel model applied

**Design document for TODO item 209** (`docs/briefs/channel-blue-pass.md`). Blue is the second colour
worked on the Channel model. The rule (`docs/design/channel-actions.md` §1), the five frames (§2) and
the build shape (§4) are **decided and fixed**; this document applies them to Blue's twenty-five cards.
**DOCS-ONLY: nothing here edits data, the engine or the packs.** The build is item 198's Blue leg; the
frame is item 202's second consumer.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each section
before the next was written and before any commit. Every judgment call is a menu entry with a
recommended default, answered at its gate; nothing below assumes an answer that was not given. The
gate log is the record.

| Gate | Section | Status |
|---|---|---|
| 1 | §1 Blue's three trees, and the reading applied | **✅ approved 2026-09-16** — BL-1 … BL-7 all (a) |
| 2 | §2 The twenty-five cards | pending |
| 3 | §3 The mix, against the bands | pending |
| 4 | §4 The build notes for Blue | pending |
| 5 | §5 Close-out | pending |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/design/channel-actions.md` §1.1 (the four definitions — frame, channelled Investiture, rider,
release), §1.4 (the interactions, and M7 (a) on what a Channel can be answered with), §1.5 and §2.1
(the specialties are the three Realms), **§2.3 (F-B (a), Blue's frame as approved)**, §3.2 (the seven
conversion rules), §3.3 – §3.5 (the shape of a worked colour), §4.3 (the `requireSelfStatus` gate and
the handler table), M6 (c), M14 (a), M16 (a) *release*, M17 (a) *Countercurrent*;
`EDHA_RULINGS.md` §K.22 (R-155 (a), the per-die counter the frame rides on) and §K.21 (R-146 … R-154);
`docs/analysis/talent-ecosystem/README.md` findings 2 and 3 and §"Resource economy";
`.claude/skills/leyline-revision-guide/SKILL.md` Part 4 (Blue's identity block); and `data/leyline.json`
+ `data/authored/leyline-blue.json` for every card quoted — **every card below was read from both on
2026-09-16 at `main` `7d27e6a`, card text and `events`. Nothing is written from memory.**

**Today's Blue:** 9 Passives, 5 Specials, 3 single Actions, 2 two-Action cards, 1 Free Action,
5 Reactions; 16 of 25 cost something and every one of them costs Investiture (one also 2 focus, one
also an Opportunity), for a tree-sum of **18** — the most expensive tree in the atlas
(`talent-comparison-mistborn-radiant.md` §C.2 and its Appendix, which counts 15 because it does not
parse Living Image's "Variable Investiture"; §3 reconciles the two).

---

## 1. Blue's three trees, by Realm — and the reading applied

### 1.1 The three trees

The frame, as approved at gate 2 of the parent design (§2.3, F-B (a)):

> **Channel Blue.** When you channel or maintain Blue, choose an enemy you can see within Attunement
> Range; it has disadvantage on its next test equal to the Investiture you spent.

One instance per die, assigned by the mage; a reading not used by your next payment lapses; two Blue
mages reading one enemy, the larger stands (M14 (a)).

| Tree | Realm | What its riders do to the frame |
|---|---|---|
| **Illusion** | Physical | put a body where the reading says they will go — the barricade, the double, the image, the shove, the ally's extra step |
| **Calculation** | Cognitive | deepen what a read character suffers — its Reactions, its focus, its resistance — and answer the flow outright |
| **Foresight** | Spiritual | choose the reading — whom to read and when: the declared action, the revealed intent, the slow turn, the take-back |

The assignment is §2.1's, unchanged. Blue's Physical cell is the legacy guide's own words —
*"illusions — barriers, false images"* — so nothing here is invented.

### 1.2 What the frame does to each tree's identity

**Blue's case is the opposite of White's, and the difference decides this pass.** White's frame —
deflect to the formation — was an effect no White card had; every card was free to stay what it was
and simply stop costing. Blue's frame **is** Blue's existing cards, promoted. Five of twenty-five
impose disadvantage (`README` finding 3), every one of them costs Investiture, and the leyline guide
names the whole colour for them: *"Disadvantage-and-denial. Blue never rolls damage — it makes the
enemy's roll go wrong."* Make that the base action and those five are paying for what the mage now
does by breathing.

So Blue's conversion asks a second question White's never had to: not only **rider or release**, but
**what is this card for, now that the base action does what it did?** There are three answers and
they are the Realm map.

**Foresight (Spiritual) chooses the reading.** The frame asks the mage exactly one question at every
payment — *which enemy, and how deep?* — and Foresight is the tree that answers it. Forewarned names
the character and the action before the round starts; Read Intent buys the answer outright; Calculated
Patience pays the mage for taking the slow turn, which is the turn on which the reading is best
informed; Probable Outcome takes that choice back after everyone else has shown theirs. None of these
imposes disadvantage and none is made redundant. Under the Channel they stop being a loose prediction
kit and become **the targeting layer of the base action** — worth *more* than they are today, because
until now their information had nothing to spend itself on.

**Calculation (Cognitive) deepens what a read character suffers.** The frame takes the die;
Calculation takes everything else the character was going to do with that roll — its Reactions
(False Premise), its focus (Baleful, Composed), its resistance to being influenced (Subtle Suggestion,
Anticipate) — and, at the top of the tree, the flow itself (Countercurrent). Where a Calculation card
*does* impose disadvantage, the per-die rule (R-155 (a)) makes it additive rather than wasted: a mage
channelling 2 who also fires Pattern Recognition holds three instances and places them on three
different dice, capped by the dice actually in the roll (BL-4, BL-5). Calculation stops being five ways
to buy one binary and becomes the tree that spends the reading on something other than the d20. **This
is also what dissolves R-98** — argued in full at gate 2, where the two cards are.

**Illusion (Physical) puts a body where the reading says they will go.** Illusion is the one tree the
frame does not touch: it makes *things* — a barrier with health, a double that fools, a static image,
a living one — and a wall does not care whether the enemy's d20 is compromised. Which is why
**Illusion is Blue's release tree.** The test that puts it there is not whether the effect outlives the
round — Red's Searing Bolt is spent the instant it lands and is still a release — but **whose situation
the Investiture buys into.** A frame has a stated effect and a **domain**: the creatures and situations
that sentence is about. White's effect is deflect; its domain is *the line*, which is why twelve of
White's fifteen costed cards never mention deflect and are riders anyway — ten of them name an ally in
their own text, and the two that do not are Overwhelming Authority and Terms of Accord, the colour's
single release. Blue's domain is **an enemy you have read, and the roll it is about to make.**
Calculation and Foresight live inside it; Illusion reaches outside and builds, so its cards keep their
cost.

The rule predicts the unworked colours, which is the test of a rule: **Red's Conflagration is Red's
Illusion** — Red's frame is the mage's own accumulating edge, a bolt thrown at a chosen target is not,
and all three of Conflagration's costed cards (Searing Bolt, Flame Surge, Arc Flash) stay costed while
its other five carry no Investiture and were never in question. Green's Territory grows the ground its
frame arms and so rides; Green's Restoration reaches outside it. What does **not** generalise is a
Realm law: Illusion is Physical, Accord is Cognitive, Conflagration is Spiritual, and measured across
all five colours the release candidates cross no axis. It is also why **Blue's costed share will not
fall as far as White's did** — proved with the numbers at gate 3, not asserted here.

### 1.3 What rider and release actually decide

The two words are not a description. Classifying a card settles five things at the table, and Blue's
trees land on different sides of every one of them.

1. **Cost.** A rider is free once the Channel is up and may keep an Opportunity or focus where that is
   its identity (M13 (a)); a release spends its Investiture on every use, out of the same pool the
   Channel is drinking from. That difference is the whole of R-152.
2. **Whether it works at all without a Channel.** A rider is **dead** when you are not channelling
   that colour: §4.3 gates it on the `channelblue` status, and the pre-cost veto refuses the use with
   a toast before anything is spent. A release *"stands on its own, needs no Channel"* (§1.1). So the
   release set is precisely **what a colour can still do on a turn it has not paid for** — the first
   turn of a fight before you open, any round you were shut down, and every out-of-combat moment where
   opening a Channel is theatre.
3. **Whether an enemy can take it away.** M7 (a): a release spends Investiture on a leyline talent, so
   **Countercurrent can answer it**. A rider spends nothing and cannot be answered at all. Deciding a
   card's class is deciding whether an opposing Blue mage gets a say in it.
4. **What a two-colour character keeps.** M6 (c) — opening a second colour ends the first. A White/Blue
   mage channelling Blue has **every White rider dark** and every White release still live. For a
   two-colour PC, and for all ten deity trees under R-159 (a), the rider / release split *is* the answer
   to "what do I still have when my Channel is committed to the other half of my build".
5. **What an adversary can do with it.** R-137 puts adversaries on the same rules at role rank
   (minion 1 / rival 2 / boss 3, §1.4). A minion holding a Blue *rider* must spend its single Action
   opening a Channel before the rider does anything — which for a one-action minion is the whole turn.
   The same card as a release simply fires. That is a live constraint on the bestiary (item 121).

**One finding this pass owes White.** Run the domain rule of §1.2 back over White's fifteen costed
cards and it agrees with gate 3 on **fourteen**: ten name an ally and sit inside *the line*, three are
damage mitigation and so are the frame's literal effect, and Terms of Accord is outside the domain and
was already made the release. The fifteenth is **Overwhelming Authority** (*"when you successfully
influence a character, it also becomes Disoriented"*) — the mage's own offensive influence rather than
the line's resistance to being swayed, which gate 3 made a free rider and the domain rule reads as
arguable-to-outside. It is one card in a merged, gated section, so this pass does not re-open it; §5
hands it to the PM against item 198's White data pass, which has not been built yet. The *other*
reading — domain as the frame's literal effect — is the one that fails outright: it turns twelve of
White's fifteen into releases, leaves the tree at 48 % costed instead of 16 %, and R-152's premise does
not happen. Blue's own Calculation carries the same shape in **Subtle Suggestion**, and gate 2 decides
it there rather than inheriting an answer.

### 1.4 Countercurrent, in full

**Today** (`data/leyline.json`; `data/authored/leyline-blue.json`, whose `use` rule is an
`edha-def-test` blue vs. cog with the verdict on the card):

> **Counterspell** — *Calculation* · Reaction; 2 Focus, 1 Investiture · Blue 3+
> *"When a character within Attunement Range spends Investiture to activate a talent, spend 2 focus and
> 1 Investiture to test Blue vs. their Cognitive defense. On a success, the talent fails."* (31)
> *Every talent has a flaw in its logic. Find it fast enough, and it unravels.*

M17 (a) renames it and M7 (a) fixes its rule: the trigger becomes *"spends Investiture on a leyline
talent or a Channel"*, the result *"the effect fails"*. It answers an **opening** or a **maintain** —
both spend Investiture — and never a **rider**, which spends nothing. Being itself a rider under
BL-1 (a), it cannot be answered by another Countercurrent.

It is a Reaction that *is* an action (it tests), so rule 3 keeps it a Reaction. Rule 1 takes its
Investiture and leaves the focus, because focus is Blue's identity cost (leyline guide Part 3 §6) and
because 2 focus is the whole reason this card is answerable at all.

> **Countercurrent** — *Calculation / Cognitive* · Reaction; 2 Focus, 1 Investiture → **Reaction; 2 Focus.**
> *"While channelling Blue, when a character within Attunement Range spends Investiture on a leyline
> talent or a Channel, spend 2 focus to test Blue vs. their Cognitive defense. On a success, the effect
> fails."* (34; was 31)
> *Meet the flow early enough and it turns back on itself.*

**What it can and cannot answer**, stated once so the bench row is unambiguous: a Channel opening ✅,
a maintain ✅, a leyline **release** ✅ (it still spends), a leyline **rider** ❌ (spends nothing),
Draw Mana ❌ (spends nothing), a **deity** talent — see BL-7.

### 1.5 Gate 1 — the menu

Every judgment call in §1, recommended default first.

**BL-1. Countercurrent — rider or release?** (a) **A rider: Reaction; 2 focus, no Investiture, reading
"While channelling Blue," — recommended** (rule 1; focus is Blue's identity cost, and a counter should
need a current of your own to set against theirs — which is also what makes it un-counterable).
(b) A release: Reaction; 2 focus, 1 Investiture, no channelling requirement — it keeps working for a
Blue mage who is not channelling, and stays counterable itself. (c) A rider with the focus dropped to 1.

**BL-2. Countercurrent's flavour line.** (a) **Reworded to the current — recommended**: *"Meet the flow
early enough and it turns back on itself."* The name moved from logic to water, and the trigger now
includes a Channel, which is not a talent and has no logic to unravel. (b) Keep today's line.

**BL-3. Illusion as Blue's release tree — the principle.** (a) **A card whose Investiture buys an
effect outside the frame's domain is a release and keeps its cost; Illusion's cards that stay inside
the domain convert like any other — recommended** (it states the reason once instead of re-deciding it
four times at gate 2). (b) No tree-level principle; Illusion converts card by card. (c) Illusion's
creations become riders that end when the Channel ends — a barricade that vanishes the moment you stop
channelling.

**BL-4. What a surplus instance does.** The reading buys instances equal to the spend, one per die; a
plain skill test with no stakes raised and no damage roll has exactly one die to take. (a) **The
surplus is lost — recommended** (R-155 (a)'s "each die may be chosen once" already is the cap; the mage
chose depth over breadth and the roll was shallow). (b) The surplus carries to that character's
following test. (c) The surplus may be re-assigned to another enemy when the roll happens — the wide
reading through the back door, and F-B (c) was refused at gate 2.

**BL-5. Do Calculation's riders add instances to the frame's reading?** (a) **Yes, they add, capped by
the dice in the roll — recommended** (R-155 (a) makes instances countable; a mage who has paid the
Channel *and* a rider's cost has bought the depth, and the cap is a rule rather than a house limit).
(b) A character already read by your frame cannot also be given disadvantage by your own riders — one
source per mage per round.

**BL-6. "creature" → "character".** Five Blue cards say "creature" against the phrasing standard's
"character". (a) **Normalise only on the cards whose sentence changes anyway — recommended** (White's
precedent: §3.3 left Devoted Conduit's "creature" and Terms of Accord's "per creature" untouched; a
sweep across all five colours is a separate DOCS + DATA item for the PM). (b) Sweep all five of Blue's
now.

**BL-7. Countercurrent and the deity atlas.** Today's card answers *any* talent paid for with
Investiture — which is all 89 deity talents. M17's fixed wording, *"a leyline talent or a Channel"*,
silently drops them. (a) **Accept the narrowing as written and hand the question to the deity pass
(item 212) — recommended** (R-159 (a) will class every deity talent rider or release; whether a deity
release is counterable is best answered with the whole atlas in view, and widening the phrase later is
one word). (b) Widen now to *"an Investiture-costing talent or a Channel"*, restoring today's scope.
(c) Narrow deliberately, and say so on the card.

> **Answered at gate 1 (Ben, chat, 2026-09-16):** *"Defaults for all."* — **BL-1 … BL-7 (a).** Two
> questions he asked at the gate changed the section rather than the decisions: the first replaced the
> release test with the **domain** rule of §1.2 (his correction — *"a release is a card that uses
> Investiture in a way not related to the Channel effect for that colour"*, narrowed from *effect* to
> *domain* after the literal form was measured against White and would have made twelve releases where
> gate 3 made one, and confirmed by his own prediction that Conflagration is almost all releases);
> the second produced **§1.3**, and with it the Overwhelming Authority finding that §5 hands to the PM.
> §1 committed on that answer.
