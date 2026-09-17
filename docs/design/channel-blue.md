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
| 2 | §2 The twenty-five cards | **✅ approved 2026-09-16** — BL2-1 … BL2-6 all (a) |
| 3 | §3 The mix, against the bands | **✅ approved 2026-09-16** — the two flagged numbers accepted in the same line |
| 4 | §4 The build notes for Blue | **not gated** — facts stand; BB-1 … BB-4 filed unanswered (§4.6) |
| 5 | §5 Close-out | **✅ done 2026-09-16** — Ben closed the pass: *"Blue is done"* |

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

---

## 2. The twenty-five cards

Every card below was read from `data/leyline.json` (structure and source prose) and
`data/authored/leyline-blue.json` (the authored card and its `events`) on 2026-09-16 at `main`
`7d27e6a`. Nothing is written from memory.

### 2.1 The conversion rules, applied to Blue

1. **Illusion's six costed cards are releases** (BL-3 (a)). The barricade, the double, the static
   image, the living one, the walls and the shove all spend Investiture on **making or moving a
   thing** — outside the frame's domain — so they keep their cost *and* their action type. Six of
   Blue's seven surviving Investiture costs sit in one tree. *(BL2-A.)*
2. **Two of five Reactions become Specials; three stay** (rule 3). Modifiers — Intercept (a
   disadvantage) and Anticipate (an advantage) — become Specials with "Once per round."; the three
   that *test* — False Premise, Countercurrent and Redirect Momentum — stay Reactions. 20 % → 12 %,
   which answers the ecosystem review's "five Reactions for one slot". *(BL2-B.)*
3. **Read Intent rides the payment** — rule 7's Blue consumer, the Guiding Signal shape. The reading
   names an enemy at every payment; Read Intent is what tells you what that enemy will do with the
   roll you just compromised. *(BL2-C.)*
4. **Four Specials that go fully free gain "Once per round."** — Intercept, Reactive Analysis,
   Pattern Recognition, Anticipate (White's precedent: Interposing Shield, Pillar of Order). Cards
   keeping a cost (Probability Cascade's Opportunity) or firing on a once-a-turn trigger do not need
   it. *(BL2-D.)*
5. **Rule 5's flood gate has no Blue consumer.** White's capstone gated on the flood because it cost
   3 Investiture; **Blue has no 3-Investiture card at all** — its dearest are two 2s. The flood's
   payoff in Blue is intrinsic: three instances is the whole roll. *(BL2-E.)*
6. **Rule 6 does not apply either — Blue's frame *is* the number.** White needed Voice of Authority
   to show what a flood buys the Cognitive tree, because White's frame was deflect. A Blue rider
   reading the channelled Investiture would double-dip on the reading it already paid for. *(BL2-F.)*
7. **Free passives stay free and unconditional** (rule 2). No Blue passive is the frame's clause in
   another Realm the way Shield Wall was; the one arguable case is Absolute Stillness (BL2-3).

**The domain, as gate 2 restates it** (BL2-2 (a)). §1.2 stated Blue's domain as *"an enemy you have
read, and the roll it is about to make"*. Two cards sit on that boundary — Reactive Analysis grants
*you* an advantage against a character, Anticipate grants an *ally* one when resisting influence —
and the narrow wording puts both outside it. Gate 3 of the parent design read White's domain broadly
(Mending Aura heals, Pillar of Order blanks a Complication, and neither is deflect), so Blue's domain
is read the same way: **the contested roll and the plan behind it — advantage, disadvantage,
prediction, denial.** Advantage and disadvantage are one currency under R-155 (a). Illusion's business
is making and moving things, which is outside it either way.

### 2.2 The twenty-five cards

Format: **name** — *tree / Realm* · today → proposed · the card sentence as it would ship (word count;
was). Prerequisites and connections are unchanged throughout — this pass changes action type, cost and
text, not the graph.

**Blue Leyline Attunement** — *Key* · Passive; — → **unchanged** (M10). *"When you Draw Mana, gain an
advantage on your next Cognitive test."* (12)

**Forewarned** — *Foresight / Spiritual* · Passive; — → **unchanged.** *"At the start of each round,
silently declare one character and one action type. If that character takes the declared action before
your next turn, you gain 1 Reaction."* (29)

**Intercept** — *Foresight / Spiritual* · Reaction; 1 Investiture → **Special; — (BL2-B, BL2-D).**
*"While channelling Blue, when a character you designated with Forewarned takes the declared action,
that action gains a disadvantage. Once per round."* (22; was 20) — not redundant with the frame: the
declared action need not be the enemy's *next* test, and under BL-5 (a) it is a second instance on a
second die.

**Telepathic Network** — *Foresight / Spiritual* · 2 Actions; 2 Investiture → **unchanged — a
release** (rule 4; scene-long). *"You communicate telepathically with characters within Attunement
Range for the scene. Allies in the network share your expertise."* (18) — castable alongside the
Channel on the opening turn (1 Action + 2), and Anticipate now depends on it being up.

**Calculated Patience** — *Foresight / Spiritual* · Passive; — → **unchanged.** *"When you take a slow
turn, your first test that turn gains an advantage."* (14; the missing article is §2.5's fix)

**Reactive Analysis** — *Foresight / Spiritual* · Special; 1 Investiture → **Special; — (BL2-2 (a)).**
*"While channelling Blue, when a character within Attunement Range fails a test, gain an advantage on
your next test against them. Once per round."* (24; was 22)

**Probable Outcome** — *Foresight / Spiritual* · Passive; — → **unchanged.** *"After all creatures
choose fast or slow turn, you may change your choice."* (13)

**Read Intent** — *Foresight / Spiritual* · 1 Action; 1 Investiture → **Special; — , on the payment
(BL2-C).** *"When you channel or maintain Blue, test Blue vs. the read enemy's Cognitive defense. On a
success, the GM reveals the action it intends next round."* (26; was 25)

**Collected** — *Foresight / Spiritual* · Passive; — → **unchanged.** *"Increase your Cognitive and
Spiritual defenses by 2."* (8)

**Redirect Momentum** — *Illusion / Physical* · Reaction; 1 Investiture → **unchanged — a release**
(BL2-A; a contest, so rule 3 keeps it a Reaction). *"When a character within Attunement Range moves,
spend 1 Investiture to test Blue vs. Athletics. On a success, reduce its remaining movement by [Size]
or push it [Size] feet in any direction."* (32)

**Phantom Step** — *Illusion / Physical* · Passive; — → **unchanged.** *"When an ally within Attunement
Range moves, they may move an additional [Size] feet without provoking Reactions."* (17)

**Holographic Illusion** — *Illusion / Physical* · Free Action; 1 Investiture → **unchanged — a
release.** (30)

**Phantom Barricade** — *Illusion / Physical* · 1 Action; 1 Investiture → **unchanged — a release.**
(35) — §1.1's own named example of the shape.

**Ghostly Walls** — *Illusion / Physical* · 1 Action; 2 Investiture → **unchanged — a release.** (32)

**Living Image** — *Illusion / Physical* · Special; Variable Investiture → **unchanged — a release**
(the per-round upkeep is the cost). (39)

**Absolute Stillness** — *Illusion / Physical* · Passive; — → **unchanged (BL2-3 (a)).** *"Creatures
you have reduced to 0 Speed also have disadvantage on Physical tests and cannot take Reactions."* (17)
— gated behind Ghostly Walls (a 2-Investiture release) and Blue 3+, a harder gate than any "while
channelling" condition; a lock should hold whether or not you keep paying.

**Phantom Double** — *Illusion / Physical* · 2 Actions; 2 Investiture → **unchanged — a release.**
(102; R-136's sentence stays exactly as ruled)

**Subtle Suggestion** — *Calculation / Cognitive* · Special; 1 Investiture → **Special; —.** *"While
channelling Blue, when you successfully influence a character, it also becomes Disoriented until the
end of your next turn."* (20; was 23) — now word for word White's Overwhelming Authority, which the two
cards already were before this pass (README §"Eleven percent of the system is copy-paste"); flagged
here, not created here.

**Pattern Recognition** — *Calculation / Cognitive* · Special; 1 Investiture → **Special; — (BL2-D).**
*"While channelling Blue, when you succeed on a Cognitive test against a character, its next test this
round gains a disadvantage. Once per round."* (24; was 26)

**Composed** — *Calculation / Cognitive* · Passive; — → **unchanged.** *"Increase your maximum focus by
your tier."* (7)

**Countercurrent** — *Calculation / Cognitive* · Reaction; 2 Focus, 1 Investiture → **Reaction;
2 Focus** (gate 1, BL-1 (a); the rename is M17 (a)). *"While channelling Blue, when a character within
Attunement Range spends Investiture on a leyline talent or a Channel, spend 2 focus to test Blue vs.
their Cognitive defense. On a success, the effect fails."* (34; was 31)

**Anticipate** — *Calculation / Cognitive* · Reaction; 1 Investiture → **Special; — (BL2-B, BL2-2 (a),
BL2-D).** *"While channelling Blue, when you or an ally in your Telepathic Network would be targeted by
an influence effect, that character gains an advantage on their resistance test. Once per round."*
(31; was 29)

**False Premise** — *Calculation / Cognitive* · Reaction; 1 Investiture → **Reaction; —** (a test, so
rule 3 keeps it). *"While channelling Blue, when a character within Attunement Range succeeds on a
Cognitive test, test Blue vs. its Cognitive defense. On a success, it cannot take Reactions until the
end of its next turn."* (34; was 36)

**Probability Cascade** — *Calculation / Cognitive* · Special; Opportunity, 1 Investiture → **Special;
Opportunity (BL2-4 (a)).** *"While channelling Blue, spend an Opportunity to give a character within
Attunement Range a disadvantage on each of its next two tests."* (22; was 21) — "each of its next two"
states what the authored `count: 2` already means, which matters once instances are countable.

**Baleful** — *Calculation / Cognitive* · Passive; — → **unchanged.** *"To resist your influence, a
character must spend additional focus equal to your tier."* (14)

### 2.3 R-98 — the two colliding disadvantage talents, resolved

**R-98 is closed twice over, and this design closes it a third time.**

1. **The data already moved.** R-98 (a) shipped as item 107 on 2026-09-14 (PR #374): False Premise's
   payload was re-aimed off "their next test" onto the `noreactions` timed status. Today's authored
   rule is `edha-triggered-effect {kind: status, statusId: noreactions, statusExpire: target}` and the
   card reads *"cannot take Reactions until the end of its next turn"* (R-141 settled end-vs-start in
   fix pass 13). **In current data the two cards no longer write the same payload at all.**
2. **The rule dissolves the whole class.** R-98's premise — *"disadvantage is one binary scalar, so a
   second source on the same roll is worth nothing"* — was never the game's rule. It described the
   Edha engine's fold (`edhaNextModFoldMode`, `15-blue-calculation.js:239`). Under R-155 (a) each
   disadvantage is counted, cancelled one for one, then **placed on its own die**, so two sources on
   one roll are two instances on two dice. Item 202 builds it; §4 says what the frame needs from it.
3. **The frame makes the point unavoidable.** Under the Channel a Blue mage is a standing disadvantage
   source every round. A mage channelling 2 who also fires Pattern Recognition holds **three**
   instances and places them, capped only by the dice actually in the roll (BL-4 (a), BL-5 (a)). The
   design does not merely avoid the collision — it assumes stacking and prices the cap into the rule.

So even if both cards still read "its next test", they would no longer collide. The engine artefact is
gone at the rule level; item 107 removed the duplication at the data level.

### 2.4 Before and after

| # | Talent | Tree / Realm | Today | Proposed | Condition |
|---|---|---|---|---|---|
| 1 | Blue Leyline Attunement | Key | Passive; — | Passive; — | — (Draw Mana rider) |
| 2 | Forewarned | Foresight / Spi | Passive; — | Passive; — | — |
| 3 | Intercept | Foresight / Spi | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 4 | Telepathic Network | Foresight / Spi | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |
| 5 | Calculated Patience | Foresight / Spi | Passive; — | Passive; — | — |
| 6 | Reactive Analysis | Foresight / Spi | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 7 | Probable Outcome | Foresight / Spi | Passive; — | Passive; — | — |
| 8 | Read Intent | Foresight / Spi | 1 Action; 1 Inv | **Special; —** | on the payment |
| 9 | Collected | Foresight / Spi | Passive; — | Passive; — | — |
| 10 | Redirect Momentum | Illusion / Phy | Reaction; 1 Inv | Reaction; 1 Inv | — (release) |
| 11 | Phantom Step | Illusion / Phy | Passive; — | Passive; — | — |
| 12 | Holographic Illusion | Illusion / Phy | Free Action; 1 Inv | Free Action; 1 Inv | — (release) |
| 13 | Phantom Barricade | Illusion / Phy | 1 Action; 1 Inv | 1 Action; 1 Inv | — (release) |
| 14 | Ghostly Walls | Illusion / Phy | 1 Action; 2 Inv | 1 Action; 2 Inv | — (release) |
| 15 | Living Image | Illusion / Phy | Special; Var Inv | Special; Var Inv | — (release) |
| 16 | Absolute Stillness | Illusion / Phy | Passive; — | Passive; — | — |
| 17 | Phantom Double | Illusion / Phy | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |
| 18 | Subtle Suggestion | Calculation / Cog | Special; 1 Inv | **Special; —** | while channelling |
| 19 | Pattern Recognition | Calculation / Cog | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 20 | Composed | Calculation / Cog | Passive; — | Passive; — | — |
| 21 | **Countercurrent** *(renamed)* | Calculation / Cog | Reaction; 2 Foc, 1 Inv | **Reaction; 2 Foc** | while channelling |
| 22 | Anticipate | Calculation / Cog | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 23 | False Premise | Calculation / Cog | Reaction; 1 Inv | **Reaction; —** | while channelling |
| 24 | Probability Cascade | Calculation / Cog | Special; Opp, 1 Inv | **Special; Opp** | while channelling |
| 25 | Baleful | Calculation / Cog | Passive; — | Passive; — | — |

**Nine cards change** (3, 6, 8, 18, 19, 21, 22, 23, 24); **sixteen are untouched** — nine free passives
and **seven releases**, six of them Illusion's. White changed sixteen and left nine; Blue is the mirror,
and the release tree is the reason.

### 2.5 The phrasing fixes that ride the data pass

Not card changes — drift the data pass corrects while it is in the file, the way §3.3 fixed White's
"gran". Under BL-6 (a) no "creature" is swept on a card whose sentence does not change.

- **Absolute Stillness** — `data/leyline.json`'s source prose reads *"also **has** disadvantage"*; the
  authored card already reads "have". Source follows the card.
- **Calculated Patience** — *"gains advantage"* is missing its article; the standard is *"gains an
  advantage"*. Both files.
- **Anticipate** — its `tags` read `action; disadvantage; scene; control`. It is a Reaction (a Special
  under this design) that grants an *advantage*, and is neither scene-long nor a disadvantage. Tags sit
  outside the seven authored keys, so this is `data/leyline.json` only.

### 2.6 Gate 2 — the menu

**BL2-1. Read Intent.** (a) **A Special on the payment — recommended** (rule 7's Blue consumer; the
reading names an enemy every round and this is what tells you what it will do — and it takes Blue from
six self-initiated Action cards to five). (b) A 1-Action rider, free. (c) A release: 1 Action,
1 Investiture, unchanged.

**BL2-2. The domain boundary — Reactive Analysis and Anticipate.** Both grant an *advantage* rather
than imposing disadvantage. §1.2's narrow wording puts both outside the domain. (a) **The broad
reading — both are riders, and §2.1 restates the domain as *the contested roll and the plan behind it*
— recommended** (the reading gate 3 actually applied to White; and advantage and disadvantage are one
currency under R-155 (a)). (b) The narrow reading — both are releases keeping 1 Investiture each;
Blue's costed share lands at 44 % rather than 36 %, and Investiture-priced cards at 9 rather than 7.

**BL2-3. Absolute Stillness.** (a) **Stays a free unconditional passive — recommended** (gated behind
a 2-Investiture release plus Blue 3+, a harder gate than "while channelling"; a lock should hold
whether or not you keep paying). (b) Becomes a rider, W-1's exception.

**BL2-4. Probability Cascade's Opportunity.** Rule 1 keeps an Opportunity or focus *only where it is
the card's identity*, and the guide gives **focus** as Blue's identity cost. (a) **Keep the
Opportunity — recommended** (White kept it on Mending Aura and Collective Resolve under the same rule;
an Opportunity is a rare natural gate, and it does not stack on the focus pool Countercurrent already
taxes at 2). (b) Convert it to 1 focus. (c) Drop it — a free rider with "Once per round."

**BL2-5. Rule 5's flood gate.** Blue has no 3-Investiture card for the capstone rule to convert.
(a) **No Blue card gates on the flood — recommended** (the payoff is intrinsic: three instances is the
whole roll). (b) Gate Absolute Stillness on channelling 3 or more. (c) Gate Living Image on channelling
3 or more.

**BL2-6. The four "Once per round" caps** (Intercept, Reactive Analysis, Pattern Recognition,
Anticipate). (a) **All four — recommended** (each goes fully free with a trigger that can repeat
several times a round; White capped Interposing Shield and Pillar of Order for exactly this).
(b) Only the two that were Reactions, leaving the two Specials uncapped as today.

> **Answered at gate 2 (Ben, chat, 2026-09-16):** *"Gate 2 is good."* — **BL2-1 … BL2-6 (a)**, with the
> two numbers flagged for gate 3 (Passive + Special landing below the published band, and Blue's
> releases competing with its own Channel for the pool) accepted in the same line. §2 committed on that
> answer.

---

## 3. The mix, against the bands

| | Passive | Special | 1 Action | 2 Actions | Free | Reaction | Passive + Special | costed (any) | costed (Investiture) | Investiture tree-sum |
|---|---|---|---|---|---|---|---|---|---|---|
| **Blue today** | 9 (36 %) | 5 (20 %) | 3 (12 %) | 2 (8 %) | 1 (4 %) | 5 (20 %) | 56 % | 16 (64 %) | 16 (64 %) | 18 |
| **Blue proposed** | 9 (36 %) | 8 (32 %) | 2 (8 %) | 2 (8 %) | 1 (4 %) | 3 (12 %) | **68 %** | **9 (36 %)** | **7 (28 %)** | **9** (+ the Channel, 1 – rank a round) |
| *White proposed, for scale* | 10 (40 %) | 11 (44 %) | 1 (4 %) | 0 | 0 | 3 (12 %) | 84 % | 4 (16 %) | 1 (4 %) | 1 |
| published Invested band | | | | | | 2 – 7 % | 71 – 87 % | 8 – 46 % | | |
| leyline guide target | ~35 % | 25 – 30 % | ~15 % | ~8 % | 5 – 8 % | 5 – 8 % | | | | |

*(The Appendix of `talent-comparison-mistborn-radiant.md` gives Blue as 60 % costed and 15
Investiture-priced cards because its parser does not read Living Image's "Variable Investiture"; by
card text it is 16 of 25, and the tree-sum of 18 is identical either way. The proposed row counts
Living Image the same way — as a costed card whose numeric contribution is 0.)*

**Read against the bands.** **Costed falls from 64 % to 36 %, inside 8 – 46 % for the first time**, and
the Investiture tree-sum halves, 18 → 9 — Blue stops being the most expensive tree in the atlas.
Reactions halve, 20 % → 12 %, matching White exactly and answering the review's "five Reactions for one
slot". **Passive + Special lands at 68 %, just under the published 71 – 87 %**, and that is the one band
Blue misses. It misses it for a structural reason worth naming rather than engineering around: six of
Blue's cards are **self-initiated creations** — the barricade, the double, the image, the living one,
the walls, the network — and a card that builds a thing is an Action. White had one costed Action left
after conversion; Blue has five plus a Free Action, because Blue is the colour that makes things. Three
points of a band is the price of having a release tree, and manufacturing Specials to close it would
mean converting cards whose action type is the honest description of what they do.

Against the guide's own targets the fit is better than the published band suggests: Passive 36 % against
~35 %, 2 Actions 8 % against ~8 %, Special 32 % a little over 25 – 30 % (four cards changed type), single
Actions 8 % under ~15 % because the Channel is now the self-initiated play, and Reactions 12 % over
5 – 8 % — above the band on purpose, exactly as White's are, because three Blue Reactions genuinely *act*
on someone else's turn (a contest, a denial, a counter).

**Where the remaining cost sits.** Seven of the nine surviving Investiture points are in **Illusion**
(Redirect Momentum 1, Holographic Illusion 1, Phantom Barricade 1, Ghostly Walls 2, Phantom Double 2);
the other two are Telepathic Network. **Calculation carries no Investiture at all** — its only costs are
Countercurrent's 2 focus and Probability Cascade's Opportunity. The colour's whole disadvantage engine
is now free once the Channel is up, and everything that costs is something you build.

**What a Blue player's turn is now.** Round 1: Channel Blue at 2 out of a pool of 4 — name the archer,
and its d20 and its damage die both go wrong — and Read Intent fires free on that payment, so the GM
tells you what the archer means to do. Two Actions left: Draw Mana (refill 2, and the Key hands you an
advantage on your next Cognitive test) and one more. Every round after: maintain as a Free Action for
1 or 2, three Actions, and every rider live for nothing — Pattern Recognition on a Cognitive success,
Intercept on the action Forewarned called, Reactive Analysis on any failure in range, Subtle Suggestion
on your own influence, Probability Cascade for an Opportunity, Anticipate over the network, and the
Reaction held for False Premise or Countercurrent. The real decision each round is not *which talent* —
they are all free — but **read or build**: a round you spend 2 on Ghostly Walls or Phantom Barricade is a
round you did not pay the Channel, and the reading lapses. White never had that choice, because White
had one release. It is the sharpest thing the Channel does to Blue, and it is the colour working as
intended: the mage who sees what is coming decides whether to spoil the roll or to put a wall in front
of it.

**What it costs, in numbers.** Today a Blue round — Pattern Recognition plus a Reaction — spends
2 Investiture for two plays and earns 2 back from a Draw (R-126). Under the Channel the same 2 buys the
frame and every rider in the colour. Sixteen Investiture-priced cards become seven, and the seven are
the things Blue makes. The balance yardsticks (item 210) should be re-run against this row as well as
White's before item 198 builds.

---

## 4. The build notes for Blue

What item 198's Blue leg builds, named from what exists — every handler read from
`data/authored/leyline-blue.json` and every line number re-derived against `main` `477e261` after the
seven-worker batch landed. **No code and no data change in this pass.** Deploy class: **ENGINE (F5) +
DATA — REBUILD leyline + ⟳ Sync Talents, at 3.x only**, after item 187's flip (R-144).

### 4.1 Blue's riders and where §4.3's gate lands

Nine cards become riders. Their `use`-borne handlers:

| Rider(s) | Handler on `use` | In §4.3's ten? | Gate lands in |
|---|---|---|---|
| Intercept, Subtle Suggestion, Pattern Recognition, Anticipate, Probability Cascade | `edha-prompt-pick` | **yes** | the pre-cost veto, Widening F (ii) |
| Countercurrent, False Premise | `edha-def-test` | **yes** | the pre-cost veto |
| Reactive Analysis | `edha-next-test-mod` **and** `edha-note`, both on `use` | **no — new** | the pre-cost veto |
| Read Intent | `edha-def-test` on **`edha-channel`** | — | **no gate needed** (below) |

**Three findings item 198 should have before it sizes the Blue leg:**

1. **Blue adds two schema declarations, not ten.** Widening F's schema side was ten types for White;
   Blue's set is four, and `edha-prompt-pick` and `edha-def-test` are already among that ten. Only
   **`edha-next-test-mod`** and **`edha-note`** are new, because Reactive Analysis is the one Blue rider
   putting both directly on `use`. **Twelve declarations total across both colours.**
2. **Blue gates at one dispatch site, not three.** Every Blue rider fires from `use` through the event
   system's executor, so all of them land on **Widening F (ii)**, the pre-cost veto on `preUseItem`.
   Nothing in Blue's rider set is a config-only rule read by `edhaWatchersOfRule` (F (i)) or a Draw Mana
   rule (F (iii)). The two Blue rules that ride a *different* sweep — Calculated Patience's
   `edha-test-rider` (read by `edhaActorRulesOf`, `01-shared-core.js:732`) and Living Image's
   `edha-illusion-upkeep` (read by `edhaActorRuleOf`, `17-blue-illusion.js:310`) — **neither becomes a
   rider**: the first is a free passive, the second a release. So `edhaActorRulesOf` needs no gate for
   Blue. Whether a later colour forces a fourth dispatch site is item 211's question.
3. **The seven chained rules need no gate at all.** Intercept's, Pattern Recognition's, Anticipate's and
   Probability Cascade's `edha-next-test-mod`, Subtle Suggestion's and False Premise's
   `edha-triggered-effect`, and Read Intent's `edha-note` all fire on `edha-test-success`, downstream of
   their own card's gated `use`. Gate the `use` and the chain is gated.

**Read Intent needs no `requireSelfStatus`.** Its rule moves from `use` to the new `edha-channel` event
(Widening E), which fires *only* on a Channel or Maintain, so the condition is inherent — exactly as for
White's Guiding Signal. §4.3's table lumps `edha-channel` under the pre-cost veto row; on that event the
check is a no-op and the field should be left off rather than set and ignored.

**Two of §4.3's nine widenings have no Blue consumer**, which shrinks the leg further:

- **Widening G** (the channel-rider ActiveEffect, `channelRider` + `edhaStanceRiderChanges`) — Blue's
  only two ActiveEffects are Collected's defenses and Composed's max focus, both free passives that stay
  unconditional. No Blue AE is a rider.
- **Widening H** (`requireChannelled`, the flood gate) — BL2-E: Blue has no 3-Investiture card and no
  card gates on the flood.

### 4.2 What the frame needs from item 202

The frame is the per-die injector's **second consumer** (B-4 (a)). Five requirements:

1. **The placer is the paying mage.** R-155 (a) phase 2 routes an adversary's disadvantages to *"a
   player — the one most affected"*; F-B (a) says **assigned by the mage**. A disadvantage whose source
   is a Blue Channel must route its placement prompt to the mage who paid, not to a most-affected
   heuristic. `edhaSetNextTestMod` already stamps `source` and a `gid` on every entry
   (`15-blue-calculation.js:151-163`), so the hook exists.
2. **The instance count must not be `count`.** §4.3's Widening I says `edha-next-test-mod` gains `dice`
   and "a `count` that may be `@channelled`". **`count` already means "Tests affected"** — Probability
   Cascade's `count: 2` is its next *two tests*, and the engine says so (`15-blue-calculation.js:44`:
   *"the one `count: 2` mod in the data, Probability Cascade, which is `test`-only and must keep applying
   to two separate tests"*). Overloading it breaks the only card that uses it; the per-die instance count
   needs its own field.
3. **`@channelled` must resolve inside that count.** Widening A stores the consumption's `actual` on the
   status effect's flag; Widening D's `edhaSubstRankTier` third replacement reads it.
4. **The lapse needs an expiry the engine does not have.** *"A reading not used by your next payment
   lapses"* is keyed to **the next payment**, not a turn or a round; today's expiries are
   `expireEndOfRound` and the prune in `edhaNextModPrune`. Cheapest correct shape: the re-arm already in
   Widening C, clearing the previous frame entry when the status re-arms, so a maintain *replaces* the
   reading rather than adding one.
5. **M14 (a) is a max across mages, a sum within one.** Two Blue mages reading one enemy give it the
   larger reading; the same mage's riders add (BL-5 (a)). Since `edhaSetNextTestMod` appends to a list
   and the pre-roll pass applies every matching entry, frame entries must be distinguishable by owner.
   **Watch `EDHA_NEXTMOD_CAP = 12`** (`:112`, `evict: "oldest"`): a flooding mage places 3, and riders
   and condition sources stack on top.

### 4.3 What moves in the data

**`data/authored/leyline-blue.json`** — the seven authored keys, unchanged as a set:

- **`activation`** — nine cards. The `{type: "resource", resource: "inv"}` consume row is removed from
  Intercept, Reactive Analysis, Read Intent, Subtle Suggestion, Pattern Recognition, Anticipate, False
  Premise and Probability Cascade; from Countercurrent **only the `inv` row goes — the `foc` row stays at
  min 2, max 2**. Type changes: Intercept `rea` → `spe`, Anticipate `rea` → `spe`, Read Intent `act`
  (cost value 1) → `spe`.
- **`description`** — the nine sentences of §2.2, plus Countercurrent's name and flavour line.
- **`events`** — `requireSelfStatus: "channelblue"` on the `use` handler of eight riders (all but Read
  Intent); Read Intent's rule moves `use` → `edha-channel` and takes no field; the five
  `edha-prompt-pick` prompt strings drop "and 1 Investiture", which is player-facing text asking for a
  cost that no longer exists.
- **`effects`** — **nothing changes.** No Blue rider is an ActiveEffect.
- **`docId`** — **preserved through the rename** (BB-3). The overlay is keyed by talent *name*
  (`talents["Counterspell"]`), so the rename re-keys the entry; keeping the `docId` is what lets an owned
  copy on a PC survive ⟳ Sync instead of orphaning.

**`data/leyline.json`** — the nine records' `action`, `cost` and `description`; the rename's `name` and
`flavor`; **`connections`: Baleful's `["Counterspell"]` → `["Countercurrent"]`** — the one inbound edge,
and `validate.js`'s `validateConnections` fails the build if it is missed. Graph otherwise untouched: no
prerequisite or edge change, so the DAG and reachability checks and `tests/pipeline.test.js` are
unaffected. Plus §2.5's three phrasing fixes and Anticipate's stale `tags`.

### 4.4 Everything that names `Counterspell`

**Rename — live data, build inputs and gates (9 files):**

| File | What |
|---|---|
| `data/leyline.json` | the record's `name`; Baleful's `connections` |
| `data/authored/leyline-blue.json` | the `talents` key; two `events` rule `description` strings |
| `data/talent-rolls.json` | the side-table entry (masked bootstrap history — renaming keeps it from becoming fiction; **do not add a new entry**, per CLAUDE.md) |
| `data/authored/heroic-warrior.json` | Leybreaker's rule `description` cites *"Counterspell's shape"* — a cross-tree reference that stops resolving |
| `docs/levelup-builds.json` | HANNAH's level-10 pick |
| `EDHA_FOUNDRY_TEST_CHECKLIST.md` **line 528 only** | a live `node.prerequisitesMet` row |
| `module-src/scripts/engine/15-blue-calculation.js:23` | the Blue/Calculation tree-section header (rule 3's ledger) |
| `module-src/scripts/engine/17-blue-illusion.js:36` | the `edha-def-test` consumer list in the Blue/Illusion header |
| `module-src/scripts/register-skills.js` | assembled — regenerate with `scripts/engine-assemble.js`, never hand-edit |

**Regenerate, never hand-edit (3):** `EDHA_PLAYER_PRIMER.html` (`scripts/build-player-primer.js`),
`EDHA_LEVELUP_GUIDES.html` (`scripts/build-levelup-guides.py`), `EDHA_DASHBOARD.html`
(`scripts/build-dashboard.js`). All three carry the name because they are built from the files above.
*(The levelup guide also renders "Investiure" for this row — a typo in its own prose source, worth fixing
in the same pass.)*

**Leave alone — historical record:** `EDHA_RULINGS.md` (R-98 and R-110 quote the card as it stood), the
three `docs/handoff-changelog/` months, `docs/archive/EDHA_EDITABILITY_AUDIT.md`, all of
`docs/analysis/talent-ecosystem/` (dated measurements, profiles, crosscut),
`EDHA_FOUNDRY_TEST_CHECKLIST.md` **line 1207** (retired bench-run-49b evidence), the three
`source-materials/legacy-uploads/` files, and `TODO_REPO_HYGIENE.md` / `docs/design/channel-actions.md` /
`docs/briefs/channel-blue-pass.md`, which name the rename itself. **A dated record that says
"Counterspell" is correct; rewriting it would make it a lie.**

### 4.5 The bench rows

Sixteen **🤖** rows, to be added under `# BENCH — Blue (leyline)` (checklist **line 1416**) as a
`## Channel — item 198` block when the build lands, on the Route A 3.1.0 copy (B-6 (a)).

| Row | Drive | Evidence |
|---|---|---|
| CB-1 open | Channel Blue at 1, name an enemy | *Channelling Blue* on the token; the enemy's next d20 carries one disadvantage; Investiture −1 |
| CB-2 depth | at rank 2, channel 2 | two instances placed on two different dice (d20 + plot, or d20 + damage) in the roll config |
| CB-3 shallow | channel 2; the read enemy makes a plain skill test, no stakes, no damage | one placed, the surplus lost (BL-4 (a)) |
| CB-4 lapse | channel, leave the reading unused, maintain next turn | the old reading is gone; exactly one new reading stands |
| CB-5 stacking | channel 2 + Pattern Recognition on the same enemy | three instances on three dice (BL-5 (a)); watch the 12-entry cap |
| CB-6 cancel | the read enemy also holds an advantage | one cancels one before placement (R-155 (a)) |
| CB-7 riders off / on | with no Channel: Pattern Recognition, Subtle Suggestion, False Premise. Then with it | refused before cost with the toast; then all three fire spending nothing |
| CB-8 the payment | Channel, then Maintain | Read Intent's def-test card on both |
| CB-9 Countercurrent vs a Channel | a White mage opens a Channel in range | the offer posts; 2 focus spent; on a success the Channel does not arm and the White mage's Investiture stays spent (BB-1) |
| CB-10 rider vs release | Countercurrent against Pattern Recognition, then against Phantom Barricade | no offer for the rider (spends nothing); the offer posts for the release |
| CB-11 two mages | Bench — Blue channelling 2 beside Bench — Blue II channelling 1, same enemy | 2 instances, not 3 (M14 (a)) |
| CB-12 the releases | Phantom Barricade, Ghostly Walls, Phantom Double with **no** Channel up | all three work and spend their Investiture |
| CB-13 once per round | Pattern Recognition twice in one round | the second offer refuses |
| CB-14 adversary | a rival with Blue attuned channels; a minion | rival clamps at 2, minion at 1, role rank (R-137) |
| CB-15 the rename | a synced PC owning Counterspell | it reads Countercurrent, keeps its node, and Baleful is still reachable from it |
| CB-16 the tabs | Actions tab and Talents tab of a synced Blue PC | Channel Blue and Maintain Blue under the power; riders on the Talents tab; ⟳ Sync refreshes |

### 4.6 Gate 4 — the menu, filed unanswered

**Gate 4 was not run.** The menu below was posted in chat and Ben closed the pass on the next line
(*"Blue is done"*) without answering it, so **nothing in §4 assumes an answer**: §4.1 – §4.5 are facts
read from the data and the engine, and the four entries here are carried to the PM with their
recommended defaults intact. None of them blocks item 198 from starting, and each is a build detail its
builder can put to Ben in one line.

**BB-1. A countered Channel and its Investiture.** M17 (a)'s result is *"the effect fails"*.
*(a) Recommended: the Investiture stays spent* — today's card already reads this way, and it is what
makes 2 focus a fair price for the answer. (b) Refunded — Countercurrent as a pre-cost gate, R-127's
shape.

**BB-2. Widening I's instance count.** *(a) Recommended: a new field, distinct from `count`* — `count`
means "tests affected" and Probability Cascade is its only consumer. (b) Overload `count` and migrate
Probability Cascade.

**BB-3. Countercurrent's `docId`.** *(a) Recommended: preserved; the overlay entry re-keyed and the name
changed in place* — an owned copy survives ⟳ Sync. (b) A fresh `docId` — owned copies orphan.

**BB-4. Where the frame's lapse lives.** *(a) Recommended: cleared at arm time by the re-arm, Widening
C's shape* — a maintain replaces the reading; no new expiry mode. (b) A new "until my next payment"
expiry mode on `edha-next-test-mod`.

---

## 5. Close-out

### 5.1 What was decided, gate by gate

| Gate | Decided |
|---|---|
| 1 — the trees and the reading | Blue's three trees on §2.1's Realm map; what the frame does to each identity, Blue's case being the inverse of White's; **the release test corrected to the frame's DOMAIN** rather than its stated effect or the round boundary; **§1.3, the five things rider-vs-release actually decides**; Countercurrent in full (Reaction; 2 Focus, a rider, M17 (a)'s trigger and result, a reworded flavour line). BL-1 … BL-7 all (a). |
| 2 — the cards | All twenty-five (§2.2): **nine change, sixteen are untouched**, the graph untouched. Illusion's six costed cards are releases; two of five Reactions become Specials; Read Intent rides the payment; four newly-free Specials gain "Once per round"; **rules 5 and 6 both have no Blue consumer**. R-98 closed three ways (§2.3). Three phrasing fixes ride the data pass. BL2-1 … BL2-6 all (a). |
| 3 — the mix | Costed 64 % → 36 %, **inside the published 8 – 46 % band for the first time**; Investiture tree-sum 18 → 9; Reactions 20 % → 12 %. Passive + Special 56 % → 68 %, three points under the published band — named as the structural price of a release tree. The Blue turn, and the **read-or-build** tension the Channel creates. |
| 4 — the build | **Not gated** (§4.6). The facts stand: two new schema declarations against White's ten, **one dispatch site against three**, two of the nine widenings with no Blue consumer, five requirements on item 202 (including that Widening I must not overload `count`), what moves in both data files, the nine-file Counterspell rename list against the three generated files and the historical record, and sixteen 🤖 CB rows. |

### 5.2 What waits on Ben

**Four build details, none blocking:** BB-1 … BB-4 in §4.6, each with its recommended default, carried
to the PM rather than answered. No new ruling was filed — every judgment call in §1 – §3 was a menu entry
answered at its gate. `EDHA_RULINGS.md` §L still holds R-145 alone.

### 5.3 What the PM should file

1. **Add the Blue leg to item 198's brief**, with §2.2 and §2.4 as its data pass and §4 as its build
   spec. The leg is materially smaller than White's — worth saying in the brief so it is sized right.
2. **Give item 202's builder §4.2's five requirements.** The `count` collision (BB-2) is the one that
   would otherwise be found after the code is written.
3. **Schedule the Countercurrent rename with item 198** — §4.4's nine files, three regenerated, and the
   rest left alone as record.
4. **Item 210's yardstick re-run should cover Blue's proposed row as well as White's** (§3).
5. **Overwhelming Authority (White) — one card, for item 198's White data pass.** The domain rule of
   §1.2, run back over White's fifteen costed cards, agrees with gate 3 on fourteen; this is the
   exception. Not re-opened here.
6. **Items 211 and 212 inherit the domain rule.** It predicts Red's Conflagration (all three costed cards
   stay costed) and says a release tree is not a Realm law; the deity pass needs it for the same reason.

### 5.4 The record

- Branch **`claude/channel-blue-design-spoei2`** (not the `%TEMP%` worktree on `design/channel-blue` the
  brief assumed: this session ran in a fresh remote Linux clone, which is the same isolation from the
  PM's checkout under a different name). DOCS-ONLY; `docs/design/channel-blue.md` is the only design file
  touched. Gates green on every commit; `main` merged in mid-pass after the seven-worker batch landed —
  no conflicts, and **Blue's data was untouched by it**, so every card here was read at `7d27e6a` and
  re-verified at `477e261`.
- **Iron-rule-6 debt, this session's:** the first two commits carry a `Co-Authored-By` model-identifier
  trailer, added from the harness default before the board's correction was read. Stripping them needed a
  force-push the sandbox refused, so they stand; the close-out commits carry none.
- `docs/PM_BOARD.md` was not touched, per the brief.
