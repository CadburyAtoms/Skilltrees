# The deity atlas on the Channel — the ten two-colour trees, worked

**Design document for TODO item 212** (R-159 (a), `EDHA_RULINGS.md` §K.24). The Channel rule
(`docs/design/channel-actions.md` §1.1 and its four definitions), the five frames as amended under
F-K, F-R and F-G, and the four worked colours (`channel-blue.md`, `channel-red.md`, `channel-black.md`,
`channel-green.md`) are **decided and fixed**; this document decides how the ten deity trees relate to
that model, and then works every deity card. **DOCS-ONLY: nothing here edits data, the engine or the
packs.** The build is item 198's deity leg, after the White pilot.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each section
before the next was written and before any commit. Every judgment call is a menu entry with a
recommended default, answered at its gate; nothing below assumes an answer that was not given. The gate
log is the record.

| Gate | Section | Status |
|---|---|---|
| 1 | §1 The deity path, re-evaluated under the Channel | **✅ approved 2026-09-17** (third draft; D-1 … D-9 and E-1 … E-8 withdrawn on Ben's notes, §1.1) — F-1 … F-10 all (a): Shape S, the supply with a face per colour |
| 2 | §2 The marks — Chaos, Knowledge, Life | **proposed 2026-09-17, second draft** — first draft's rules 1, 2 and 6 struck on Ben's notes (§2.1); G-1 … G-8 tabled |
| 3 | §3 The ground — Fate, Destruction, Civilization, Death | not started |
| 4 | §4 The word — Order, Power, Sovereignty | not started |
| 5 | §5 The mix, against the bands | not started |
| 6 | §6 The build notes | not started |
| 7 | §7 Close-out | not started |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/design/channel-actions.md` §1.1 (frame, channelled Investiture, rider, release), §1.4 (M6 one
colour at a time, M7 (a) what a Channel can be answered with, R-137 adversaries at role rank), §1.6
(the first sketch of a deity rider and the braid — M6 (c)), §2 as amended (the five frames: the line,
the deep reading, the forsaking, the heat, the home ground), §3.2 (the seven conversion rules), §4.3
(the `requireSelfStatus` gate); the four colour passes' §1.2 – §1.4 (the **domain** rule — *a card
whose Investiture buys an effect outside the frame's domain is a release* — as Blue stated it and
Red, Black and Green confirmed it, with the three corollaries each pass added: an attack built of
Investiture is a release, a card that targets *any character* with no condition is outside, a card
that buys into the prey's situation is outside) and their §1.3 (the five things a card's class
decides); `EDHA_RULINGS.md` R-159 (this pass's charter), R-151 (a) (the re-pricing held for this
design), R-108 (a) (the Special target restated and nothing converted), R-155 (a) (the per-die
counter), R-137 (adversaries follow the PC rules); `docs/analysis/talent-comparison-mistborn-radiant.md`
§C.1, §C.2, §D-1 and its Appendix (deity: 0 % Special, 80 % Investiture-priced, tree-sums 10 – 15);
`.claude/skills/deity-revision-guide/SKILL.md` Part 4 (the ten identities as built) and Part 3 §4 (the
colour-thematic test rule) — **its Parts 1 – 2 and cost scale are residual, not rules (Ben,
2026-09-17; §1.1)**; `EDHA_CAMPAIGN_CANON.md` §1 rulings 12 and 38 (a deity is the convergence of
two leylines); `docs/analysis/talent-ecosystem/TREE-INTENT.md` (the ten trees as they play); and
`data/domain.json` + the ten `data/authored/deity-*.json` files — **every card in this document was
read from both on 2026-09-17 at `main` `919bdf9`, card text, activation, consume rows and every
`events` rule. Nothing is written from memory.**

**Today's deity atlas** (ninety cards, nine per tree): 13 Passives, 0 Specials, 34 single Actions,
21 two-Action cards, 10 three-Action capstones, 7 Free Actions, 5 Reactions; **72 of 90 cost
Investiture** (1: 34, 2: 28, 3: 9, 4: 1), none of them variable, one also an Opportunity; the
Investiture tree-sums are Power 15, Chaos 14, Death 14, Life 13, Sovereignty 13, Civilization 11,
Fate 11, Destruction 10, Knowledge 10, Order 10 — **125 across the atlas**, against 70 across the five
leyline colours before their passes and **about 25** after them.

---

## 1. The deity path, re-evaluated under the Channel

### 1.1 Why this section was rewritten, twice

The first draft (commit `38bf0f4`) took the deity *tree* as given and asked how its nine cards ride the
colours' Channels. The second (`8f50a79`) gave the deity path a Channel of its own that opened both
colours' frames at once. Ben corrected both drafts, and the corrections are the ground this one stands
on. His words, in order:

> *"Characters only get one leyline Key, at character creation. That is what differentiates a Chaos
> disciple who started as a Blue mage from a Chaos disciple who started as a Black mage. Both
> disciples can Channel either colour, but what happens when they Draw Mana is different."*
>
> *"The deity guide must be out of date. That entry / synthesis / once-per-scene, catastrophe shape
> is not a rule anymore. Some deity paths hold that shape still, but that's residual, not a rule."*
>
> *"The power to channel should be granted by a rank in the colour. Draw Mana's attunement rider
> needs to be based on something else. Maybe in the character creation wizard we have a step called
> 'Attunement' that sets the draw mana rider, or we adapt the ancestry field for that purpose.
> 'Attuned to Blue' gives you the blue attunement draw mana rider."*
>
> *"'A mage is one leyline at a time' is a weird sentence. I don't want it in canon."*
>
> *"Shape A is closest, but still not quite right. I like your table you made. What if the Deity
> Action isn't 'Channel Maelith' but 'Place Omen'? Then for each deity, we make their action supply
> their specific charge (Omen, Snare, Charge, etc)? Or something other than that. We're closer, not
> there yet."*

So the facts, as this draft holds them:

- **A colour's Channel comes with a rank in the colour.** Any character with Blue 1+ owns the Blue
  `power` and can Channel Blue; with Black 2+, Black too. The power is granted by the rank, not by a
  path (F-5 says how). A disciple of Maelith channels Blue or Black because they hold both ranks, and
  so does anyone else who does.
- **Attunement is one choice, made at creation, and it sets what Draw Mana does.** "Attuned to Blue"
  gives the Blue Draw Mana rider (advantage on the next Cognitive test); "Attuned to Black" the
  Weakened pulse. That is the whole difference between the two disciples of Maelith, and it never
  changes. The Key talent's rider becomes the attunement's; the Key as a *tree node* had no work left
  (every leyline talent gates on rank, `data/leyline.json`). Whether the attunement is a wizard step or
  the sheet's ancestry slot is F-5.
- **The deity guide's shape is residual.** Two entries, two lanes, synthesis, a three-Action capstone,
  the 1 / 2 / 3 / 4 cost scale: several trees still wear it, none is bound by it. Nothing below treats
  a tree's size, its capstone or its price as a rule.
- **Canon is left alone.** Ruling 12 (a deity is the convergence of two leylines given personhood by
  worship) is why a god's path spans two colours; nothing here adds a sentence to canon about mages,
  and the second draft's line is struck.

### 1.2 What a deity path is — and the question

**In the data today** a deity path is nine cards gated on two colours at 2+ / 2+, each priced on its
own because there was nothing else to price on, built on a **charge** — the tree's own resource,
generated by an entry and spent by the rest: Omens, Remains, Edicts and Covenants, Diagnosis, the
die-step, Insight, Ordained Ground and Snares, the Construct and Foundations, Compelled, Charges. The
guide's principle 5 is the one line of it that is not residual: *the resource is the spine.* It is the
strongest content in the game and it has no base action, which is why it is 80 % costed and its loops
are sealed (`talent-comparison` §D-1, D-3).

**The published model** is *the power is the action; the talents change what the action does.* For a
colour that is the Channel and its frame. For a god, the second draft tried to make it a second
Channel, and that was wrong in the way Ben named: a god's act is not a colour's act with two frames.
**A god's act is its charge.** Maelith's disciple *places Omens*; Olvarra's *ordains* the ground and
lays Snares; Razkael's *sets Charges*; Verdannis's *judges*. That is what each path does that no
other does, it is what the guide's principle 5 already says, and it is the verb the deity path has been
missing.

### 1.3 Shape S — the supply

**The deity path grants one base action: the supply.** It supplies the god's charge, it is a rider on
either of the god's colours' Channels, and it costs no Investiture — the Channel paid. It keeps the
test the entry has today where the entry tests, it keeps the charge's cap, and it is an Action (or the
type the entry has). Everything else in the tree rides the supply: spends the charge, reads it, widens
it, detonates it.

**The supply has a face per colour.** Every deity tree has *two* entries today, one per lane, and in
nine of ten trees they are the two lanes' generators — Edict and Covenant, Ordained Ground and Snare,
Forge Construct and Lay Foundation, Censure and Exalt, Set Charge and Pyre, Kneel and Warlord's
Advance, Studied Mark and Predatory Strike, Vital Diagnosis and Life Surge, Entropy Strike and
Isolating Pressure. Under the supply they are **one action with two faces, and the colour you channel
chooses the face**: a disciple of Tessavain channelling Blue *declares* an Edict on an enemy;
channelling White, a Covenant with an ally. The second colour buys something on the first turn the
disciple takes the path, the four pure-gate colours dissolve, and the round-by-round choice of Channel
is a choice of *what the god does through you this round*. Death is the one tree whose Green entry is
not an action (Reaper's Harvest is the economy, always on); its gate decides whether the Green face is
the Bone Garden or the Harvest stays passive beside a one-faced Wither (F-1 (b) is the other reading).

**The ten supplies, first sketch — read from today's two entries, nothing added.** Names are the tree
gates'; the verbs here are placeholders.

| God (A / B) | The supply | Face while channelling A | Face while channelling B |
|---|---|---|---|
| Maelith — Chaos (Blue / Black) | **Place Omen** | test Blue vs. Cognitive: an Omen and [Tier][Die] spirit (Entropy Strike) | test Black vs. Physical: Isolated; an Omen shattered for vital, or placed if none (Isolating Pressure) |
| Tessavain — Order (Blue / White) | **Declare** | an Edict on an enemy: one prohibited act | a Covenant with a willing ally |
| Olvarra — Fate (Green / White) | **Ordain** | a Snare on a square | Ordained Ground under an ally |
| Kethane — Civilization (Red / White) | **Build** | the Combat Construct (one; reforged when it falls) | a Foundation |
| Verdannis — Sovereignty (Black / White) | **Judge** | test Black vs. Cognitive: Censure, the die stepped down | Exalt, the die stepped up |
| Razkael — Destruction (Blue / Red) | **Set** | a Charge with a declared trigger | Pyre: a ranged hit that leaves burning ground |
| Tyrith — Power (Black / Red) | **Command** | test Black vs. Cognitive: Kneel, Compelled | Warlord's Advance: the melee hit with the extra die |
| Gnothis — Knowledge (Green / Red) | **Study** | Studied Mark: 2 Insight and the read | Predatory Strike: the hit per Insight, and 1 more |
| Anaveth — Life (Blue / Green) | **Tend** | Vital Diagnosis: the mark the party cuts deeper for | Life Surge: the flood heal, overflow to temporary HP |
| Morrath — Death (Black / Green) | **Wither** | the withering touch: vital, and no healing | *(gate 3: the Bone Garden as the Green face, or Harvest stays the passive economy)* |

**Where the supply meets the frame** is the table Ben kept from the second draft, now read the right
way round: not two frames converged, but *what the god's act does under each colour's frame*. It is
the tree gates' first question per god, and where a meeting is worth a card sentence it is a **frame
amendment** — a talent that says what the supply does to the frame's own creature or ground:

| God | Under A's frame | Under B's frame |
|---|---|---|
| Chaos | the Omen lands on the enemy you read: its d20 and plot die compromised *before* Shatter Focus takes the lower | the forsaken bears the Omen: Isolated for Isolating Ruin's second die and Unravel Everything's vital branch |
| Order | the Edict binds the read enemy; Verdict's Blue test, Lawkeeper's advantage and the frame's disadvantage stack on one creature | the Covenant is the line sworn: +1 to all defenses and the frame's deflect on the same shoulder |
| Fate | the Snare sits in your home ground: the enemy that springs it is on the ground that heals your side | Ordained Ground in the line: the frame's deflect on the square that already refuses advantage |
| Civilization | the smith's own hammer carries the heat; the Construct's hits are noise that builds it | the Construct at an ally's shoulder is in the line; the Foundation covers the formation |
| Sovereignty | Censure the forsaken: vital on your attacks and the Draw's Weakened on the creature whose dice you shrank | Exalt an ally in the line: the frame's deflect beside Sovereign's Favor's temporary HP |
| Destruction | the read enemy is the one walking into the Charge | Pyre's hit carries the heat; every detonation is noise |
| Power | Kneel names the forsaken: Isolated for the Draw, vital on every warlord's hit | the warlord in the noise builds heat fastest and spends it on Warlord's Advance |
| Knowledge | Studied Mark on a creature standing in your home ground: the pack hunts from the ground | Predatory Strike carries the heat; the same-creature-every-turn plan keeps it at cap |
| Life | the Diagnosed enemy is the read enemy: the party cuts deeper *and* its roll is compromised | Life Surge on an ally standing on the home ground: the flood and the trickle |
| Death | the forsaken is the one you wither; the Draw Weakens it, which is Consuming Decay's gate | the Bone Garden bites whoever ends a turn in it while the home ground heals whoever starts one |

**The rest of the tree.** With the supply in place the seven remaining cards (or however many the
gate keeps — F-8) sort by one test, and it is the test the first draft wrote with the spine clause,
now with the supply as its subject: **a card whose Investiture buys into the charge — spending,
reading, widening or arming it — or into either colour's domain, is a rider and loses its cost; a
card that stands outside the fight or the round is a rite and keeps it.** The rites at first pass are
the same three the first draft found — Raise Dead, Speak with the Fallen, Death Ward — plus whatever a
gate decides about the capstones (F-8 (b) offers the flood gate). Arms the disciple wears (Crown of
Thorns, Warlord's Fury, Concord, Necrotic Cascade, Pack Share, The Pack) hold while the disciple
channels either colour, the Channel as their upkeep (the first draft's D-4 (a), restated as F-4).

### 1.4 The other shapes, argued

**The convergence** (the second draft's Shape A): the deity path's own Channel opens both colours'
frames at once, with the spend divided. Ben: *closest, but not quite right.* What it got right is kept
— the second colour matters, the table — and what it got wrong is the verb: a god's act is not two
frames, it is a charge. It is F-1 (d) for the record.

**The supply on the payment**: the charge comes with every Channel or Maintain, no Action and no test
(Guiding Signal's shape, rule 7). An Omen a round for free is a stronger Chaos than a tested one, and it
loses the thing the guide names as Chaos's identity — *an Omen is placed by landing a Blue test.* Where
a god's charge has no test today (Ordained Ground, a Foundation, a Charge), the payment shape is
tempting and F-1 (c) offers it; the recommendation keeps the supply an Action so that the deity's
turn is still a turn.

**The amendment atlas** (the second draft's Shape C): no deity action; the deity's talents only change
what the disciple's single Channels do. It is the frame-amendment table above with no supply beneath
it — the god as an adjective on a colour.

**The rider atlas** (the first draft): the nine cards ride either Channel; the god is a spine with no
verb.

### 1.5 What Shape S changes, and what it leaves alone

- **The deity path grants the supply** — one `power`-shaped item per god with the supply as its
  embedded action, two faces gated on `channel<a>` / `channel<b>` (the `requireSelfStatus` gate,
  §4.3 of the parent design). The colour powers are not the deity path's to grant (F-5): they come
  with rank.
- **The entries at 2+ / 2+ stay as the gate to the path.** What they *are* changes: the two entry
  cards become the supply's two faces, and the tree's first talents are the ones that ride it.
- **Draw Mana is the attunement's** (F-5). One rider, chosen at creation, for life. The supply does
  not change what a Draw does; the Draw refuels the Channel the supply rides.
- **M6 stands** — one Channel per creature — and the deity adds no Channel. **M7 (a) stands**: a
  rite that spends Investiture is counterable; the supply and the riders are not (F-10 drops the word
  *leyline* from Countercurrent's card so a deity rite is in scope).
- **M14 stands.** Two disciples of one god: two supplies, two ledgers, as today.
- **Adversaries (R-137)** with a deity tree channel at role rank and supply at role rank's cap.
- **Tree size and shape are open** (F-8). A god whose supply carries most of its identity may want
  fewer cards; a god with a large charge may keep nine.
- **The leyline trees open by rank** (F-6): with the power granted by rank and the Key's rider on the
  attunement, a colour's tree is reachable by rank as a deity's is — which is what `data/leyline.json`
  already says, since no leyline talent requires the Key.

### 1.6 What the disciple's turn looks like, under S

A disciple of Tessavain at level 4, attuned to Blue, pool 4. **Round 1:** Channel Blue at 1 (an
Action; the reading on the enemy who matters), Declare (an Action, free: an Edict on that enemy, one
prohibited act — its roll compromised *and* its choices bound), one Action left. **Round 2:** maintain
1 (Free), Draw Mana as a Blue mage (advantage on the next Cognitive test), Verdict (free, a Blue test
with that advantage) on the bound enemy — the Edict resolves and the court turns on its neighbours.
**Round 3:** the enemy line closes on the party; switch — Channel White at 2 (an Action; the line),
Declare a Covenant with the ally taking the hits (free), Bear Witness and the frame's deflect on the
same ally, one Action left. Investiture spent by round three: 4, refunded 2. Today the same three
rounds cost 1 + 2 + 1 = 4 for the Edict, the Verdict and the Covenant with no frame under any of it,
on a pool that cannot Draw fast enough to do it twice.

### 1.7 Gate 1 — the menu, third draft

Every judgment call in §1, recommended default first. "Defaults on all except …" is enough. E-1 … E-8
are withdrawn; the survivors are restated here.

**F-1. The shape.** (a) **Shape S, the supply with a face per colour — the deity path's one base
action supplies the god's charge, riding either colour's Channel, and the colour channelled chooses
which of today's two entries it is — recommended** (§1.3: a god's act is its charge; the second colour
buys something on turn one). (b) The supply with one face — one charge per god (Ben's list: Omen,
Snare, Charge …); the other lane's entry becomes an ordinary talent. (c) The supply on the payment —
the charge arrives with every Channel or Maintain, no Action, no test. (d) The convergence (the
second draft's Shape A). (e) The amendment atlas (no deity action).

**F-2. The supply's cost.** (a) **No Investiture: a rider, free while channelling either colour,
limited by the charge's cap and its test — recommended** (the Channel is the one thing that costs; a
supply plus a Channel per round is today's sealed loop again). (b) Variable: "spend 1 or more, up to
your rank in [colour]", scaling the charge (that many Omens, a wider Foundation) — R-153's convention,
and the one place a priced deity identity would survive. (c) The entry's flat 1 Investiture kept.

**F-3. Does the supply need a Channel?** (a) **Yes — it is a rider, dead without a Channel of either
colour — recommended** (the published shape: nothing works without the metal; and it is what makes
the frame-meeting table real). (b) No — the supply stands alone at its face's flat cost; the Channel
only adds the frame meeting.

**F-4. Arms.** (a) **An arm the disciple wears holds while the disciple channels either colour;
zones, marks and pacts keep their printed duration — recommended** (the first draft's D-4 (a); the
Channel as upkeep, Grasping Vines' precedent). (b) Every rider keeps its printed duration.

**F-5. Attunement and the colour powers (Ben's rule, built).** (a) **The wizard's existing "Your
leyline attunement" step becomes the Attunement step: it grants one attunement item carrying the Key's
Draw Mana rider and Draw Mana itself; each colour's `power` (the Channel, the tree link, the skill) is
granted by the first rank in that colour — recommended** (the step already exists; the item is the
Key's document re-homed; rank-granted powers are one rule in the skill-rank handler). (b) The
attunement lives in the sheet's ancestry slot ("Attuned to Blue") — visible in the header; the
ancestry field is then Edha's, not the system's. (c) Both: the wizard step writes the ancestry slot.

**F-6. The leyline trees open by rank.** (a) **Yes — the leyline path as a *pick* retires; a colour's
tree is reachable by rank, as it already is in the data — recommended.** (b) Keep the path pick as the
tree's unlock; only the power comes with rank.

**F-7. The deity guide.** (a) **Parts 1 – 2 and the cost scale marked superseded by this document once
F-1 is answered; the PM files the rewrite — recommended.** (b) Leave it.

**F-8. Tree size, capstones, the entries.** (a) **No rule on size; the two entries become the supply's
faces; each god's gate decides its card count and whether it keeps a capstone and at what price —
recommended.** (b) Keep nine and a once-per-scene capstone gated on the flood ("while channelling 3 or
more"). (c) Keep nine and a 3-Investiture capstone.

**F-9. The word for the category.** (a) **"Supply" — *the god's supply*, the action that supplies the
charge; on the card it is the god's own verb (Place Omen, Declare, Ordain …) — recommended.**
(b) "Rite" — but §1.3 uses *rite* for the costed cards, and the two should not share a word.
(c) "Act" — *the god's act*.

**F-10. Countercurrent and deity rites** (BL-7's hand-off). (a) **A rite that spends Investiture is
counterable: the card reads "spends Investiture on a talent or a Channel", the word *leyline* dropped —
recommended.** (b) Narrow deliberately.

> **Answered at gate 1 (Ben, chat, 2026-09-17):** *"That's much better. approved."* — **F-1 … F-10 (a).**
> Shape S, the supply with a face per colour; free while channelling; a rider; arms hold while
> channelling; the wizard's attunement step grants the Draw rider and rank grants the colour power; the
> leyline path pick retires; the guide's Parts 1 – 2 superseded; no rule on size; *supply*; Countercurrent
> covers deity rites. §1 committed on that answer. **The grouping for gates 2 – 4** follows the charge:
> the marks (Chaos, Knowledge, Life — a charge on one creature), the ground (Fate, Destruction,
> Civilization, Death — a charge on the field), the word (Order, Power, Sovereignty — a charge declared
> on a creature).

---

## 2. The marks — Chaos, Knowledge, Life

Three gods whose charge sits on one creature: an Omen, Insight, a Diagnosis. Under Shape S each has a
supply with two faces (§1.3), and in all three the frame meeting is **positional** — the disciple
places the charge on the creature the frame already names (the read enemy, the forsaken, the creature
on the ground) by choosing the same target — so no frame-amendment card is needed at this gate. Every
card below was read from `data/domain.json` and its `data/authored/deity-*.json` record (text,
activation, consume rows, `events`) at `main` `919bdf9`.

> **Second draft (Ben, chat, 2026-09-17, on the first draft's §2.1):** *"we don't need to keep both
> nodes — unless it makes sense! The deity trees don't have to all have the same shape"*; *"I don't
> think that's inherently true [that every costed card loses its Investiture]. It depends on the deity's
> supply. Death raising a Remain as a minion or Civilization creating the Construct should probably stay
> costed for balance reasons at a minimum"*; *"[capstones all gated on the flood] is another hard rule
> you're creating for no reason. Let's let the trees decide what is best on a case-by-case basis."* And on
> iron rule 7: it requires the graph to stay acyclic and reachable, not to stay as it is — reshaping a
> tree is open. §2.1 is rewritten as the questions each tree answers, with presumptions rather than
> rules, and §2.2 – §2.4 decide each tree on its own.

### 2.1 The questions each tree answers

Four questions, asked per tree and per card. Where a presumption is stated it is the starting point
the leyline passes and §1 give, and a tree's gate may overturn it with a reason.

1. **Shape.** What are the supply's two faces, and do the entry *nodes* survive? An entry whose card is
   nothing but its face has no work left as a node once the supply carries it — the path's 2+ / 2+ gate
   already guards it, and the lane can root at its first rider instead. An entry that is *more* than a
   face (Death's Reaper's Harvest is an always-on economy, not an action) keeps its node. Iron rule 7
   only asks that the result stay acyclic and reachable; `validate.js` checks it. The tree's size
   follows from the answer — a mark tree that drops both entry nodes is seven cards, and this pass
   does not invent cards to refill it (F-8 (a)).
2. **Cost, card by card.** The presumption from §1.3: a card that buys into the charge or either
   colour's domain is a rider and loses its Investiture; a rite keeps it. The override is **balance**:
   a card that creates a body (a summon, a Construct, a raised servant) or that hands out a scene-long
   effect for free is looked at on its own, and may keep a cost, take an amount gate, or both. Two
   facts inform every such call. *An amount gate on a scene-long card is a one-time price:* the flood
   has to be paid on the round it is cast and the effect then lasts, so "while channelling 2 or more"
   costs the same 2 as today's card did, buys the frame with it, and — for "3 or more" — adds a rank-3
   requirement. *An amount gate on a repeatable card is a per-round tax:* Cascade Collapse at "2 or
   more" costs 2 on every round it is used, which is today's price only if the disciple uses it every
   round. The marks hold no bodies; §2.2 – §2.4 say what that leaves.
3. **Type honesty.** A Reaction that is a modifier and rolls no test reads as a Special with "Once per
   round." (the leyline rule 3); a card that only widens the supply — a second placement, the pack's
   share — reads as a Passive on the supply. Per card, where it is true.
4. **The capstone.** Per tree: a rider gated on the flood (free at rank 3, once per scene — Unbreakable
   Line's shape), a rite at its printed cost, or something else the tree wants. The two are close in
   Investiture on a once-per-scene card (question 2); the differences are the rank-3 requirement and
   whether the cost is paid *as* the Channel or beside it.

Phrasing rides the pass: "Vital damage" → "vital damage" (damage types are lowercase; Knowledge and
Life capitalise it on seven cards), "creature" → "character" only on sentences that change anyway.

### 2.2 Chaos — Place Omen (Blue / Black)

**Today:** 9 cards; 1 Passive, 1 Reaction, 4 single Actions, 3 two-Action; 8 of 9 cost Investiture,
tree-sum 14. The known structural fault (deity guide Part 4): the Black lane spends Omens it cannot
make.

**Shape.** Both entries are exactly their faces — Entropy Strike is the Blue placement, Isolating
Pressure the Black one — so **the entry nodes go** (G-1): Maelith's power carries Place Omen with both
faces from the moment the path is taken, and the fault closes completely, because every disciple can
place Omens under either Channel. The Blue lane roots at Shatter Focus and Spreading Omen, the Black
lane at Void Sense and Unweaving (each now prereq-free within the tree, behind the path's Blue 2+ /
Black 2+). Seven cards.

**The supply**, on Maelith's power:

> **Place Omen** — Action; — · *the god's supply*
> *While channelling Blue* — test Blue vs. Cognitive. On a success, place an Omen on the target and
> deal [Tier][Die] spirit damage.
> *While channelling Black* — test Black vs. Physical. On a success, the target is Isolated until the
> start of your next turn; if it bears an Omen, remove it and deal [Tier][Die] + Awareness vital
> damage; if not, place one.
> You may have up to tier + 1 Omens active; placements beyond the cap are lost.

Events: Entropy Strike's three rules (`edha-def-test` blue vs cog → `edha-owner-list` place →
`edha-triggered-effect` spirit) become the Blue face's, gated `channelblue`; Isolating Pressure's five
(the snapshot-gated shatter / place branches from item 142) the Black face's, gated `channelblack`.
Under Black's own frame the forsaken is already Isolated, so the Black face against the forsaken is the
shatter-or-place alone — which is the play.

**Cost.** Chaos creates no body and its charge is capped at tier + 1. Nothing here is a balance case
for a kept cost: the damage cards are one shot per Omen, and the Omens are the limit. The synthesis
tier's 2 Investiture becomes an amount gate on the three two-Action cards — a per-round tax where they
are used every round, and nothing where the disciple coasts between them (question 2). *(G-3.)*

**Shatter Focus** — Reaction; 1 Investiture → **Special; —** (question 3: a forced reroll, no test).
*"While channelling Blue or Black, when an enemy bearing one of your Omens within Attunement Range
makes a test, remove the Omen; it rerolls and takes the lower result. Once per round."* Under Blue's
frame the read enemy already carries disadvantage per die; the reroll sits on top of it, and R-155 (a)
makes the two additive. Events: `edha-reroll-react` unchanged; the Reaction slot is no longer spent.

**Spreading Omen** — 1 Action; 1 Investiture → **Passive; — , on the supply** (question 3: it is Place
Omen twice). *"While channelling Blue or Black, when Place Omen succeeds, also place an Omen on one
other enemy within 10 feet of the target, subject to your Omen cap."* Events: the second
`edha-owner-list` place (`target: near-victim, nearFt: 10`) moves off its own `use` onto a watch of the
supply's success — the build names the hook (§6).

**Void Sense** — Passive; — → **unchanged.** *"You sense the location of every enemy bearing your Omen
through any obstruction. Once per round, when an enemy bearing one of your Omens within Attunement
Range takes damage from any source, you recover 1 Investiture."* The refund keeps a one-point maintain
running without a Draw.

**Unweaving** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While channelling
2 or more Blue or Black, test Black vs. Spiritual. On a success, end one magical buff, stance or
sustained effect on the target. If the target bears an Omen, also remove it and Disorient the target
until the start of your next turn."*

**Cascade Collapse** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Blue or Black, test Blue vs. Cognitive against every enemy bearing your Omen
within Attunement Range. Each bearer you succeed against loses its Omen, takes [Tier][Die] spirit
damage and is Disoriented until the start of your next turn."* (One roll, gated per bearer — the
owner-sweep as built, Ben 06-18.)

**Isolating Ruin** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Blue or Black, test Black vs. Physical. On a success, the target is Isolated
until the start of its next turn and takes [Tier][Die] + Awareness vital damage; if it bears an Omen,
remove it and deal an additional [Tier][Die] + Awareness vital damage."* The Black face made heavy —
two dice against a marked target; it stays a card because the second die is what the flood buys
(G-6 offers folding it into the face).

**Unravel Everything** — the capstone (question 4). It *detonates the charge*: every Omen placed and
shattered at once. That is the shape the flood gate fits — the disciple who has flooded Black or Blue
at rank 3 is the disciple whose Omens are everywhere — so the recommendation is **a rider gated on
"channelling 3 or more", once per scene, no Investiture** (G-4 offers the 3-Investiture rite; on a
once-per-scene card the two cost the same, and the flood adds the rank-3 requirement). *"While
channelling 3 or more Blue or Black, place an Omen on every enemy within Attunement Range up to your
cap, then remove all your Omens at once: each removed Omen deals [Tier][Die] + Awareness spirit damage
and Disorients its bearer until the start of your next turn; a bearer that is Isolated when its Omen is
removed instead takes 2[Tier][Die] vital damage. Once per scene."* Under Black's frame the forsaken is
Isolated by definition, so the disciple chooses which bearer takes the vital.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Entropy Strike | 1 Action; 1 Inv · entry | **the Blue face of Place Omen; node dropped** | while channelling Blue |
| — | Isolating Pressure | 1 Action; 2 Inv · entry | **the Black face of Place Omen; node dropped** | while channelling Black |
| 1 | Shatter Focus | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 2 | Spreading Omen | 1 Action; 1 Inv | **Passive; —** | while channelling; on the supply's success |
| 3 | Void Sense | Passive; — | Passive; — | — |
| 4 | Unweaving | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 5 | Cascade Collapse | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 6 | Isolating Ruin | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Unravel Everything | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Seven cards plus the supply; tree-sum 14 → **0**; Passives 1 → 2, Specials 0 → 1. **The frame
meeting:** under Blue the disciple reads the enemy and Places the Omen on it — its d20 and plot die
compromised before Shatter Focus takes the lower; under Black the disciple forsakes the Omen-bearer,
and Isolating Ruin's second die and Unravel's vital branch light up on the creature chosen. Positional;
no card.

### 2.3 Knowledge — Study (Red / Green)

**Today:** 9 cards; 3 Passives, 4 single Actions, 1 two-Action, 1 three-Action; 6 of 9 cost
Investiture, tree-sum 10. Green is a gate — no test, no die (guide Part 4).

**Shape.** Both entries are their faces — Studied Mark the placement, Predatory Strike the payoff — so
**the entry nodes go** (G-1): Gnothis's power carries Study with both faces from the path. The Green
lane roots at Accumulate and Pack Share, the Red lane at Hunter's Discipline and Killing Blow. Seven
cards. Green stops being a gate the moment the path is taken: it is the face that marks.

**The supply**, on Gnothis's power:

> **Study** — Action; — · *the god's supply*
> *While channelling Green* — choose a character within Attunement Range. Place 2 Insight on it and
> learn its current health, conditions, and Physical and Spiritual defenses.
> *While channelling Red* — make a melee or ranged weapon attack. On a hit, deal additional vital
> damage equal to [Tier][Die] plus your tier per Insight on the target (minimum 1), then place 1
> Insight on it.
> You may have Insight on only one character at a time; placing Insight on a new character removes
> all existing Insight. Insight may not exceed 5 and fades at the end of the scene.

Events: Studied Mark's (`edha-owner-list` counter place 2, `edha-reveal`) become the Green face's;
Predatory Strike's arm-and-consume pair (`predprimed`) the Red face's. Under Red's frame the Red face's
hit carries the heat as any attack-test hit does (RD-6 (a)), and the same-creature-every-turn plan
keeps it at cap.

**Cost.** No body; one bearer; Insight capped at 5 and reset by the cash-outs. The one balance case is
the pack's share: Pack Share (+tier) and The Pack (+Insight count) stack (Ben R10), so at a flood every
ally's hit on the quarry carries +tier + Insight vital. That is the tree's whole identity spent on the
one creature it is about, and it is why The Pack takes the amount gate and Pack Share does not.

**Accumulate** — Passive; — → **unchanged.** *"At the start of each of your turns, if the character
bearing your Insight is within Attunement Range, place 1 Insight on it (up to the cap). When that
character takes damage from any source, you recover 1 Investiture once per round."* The refund funds
the maintain.

**Pack Share** — 1 Action; 1 Investiture · Green 3+ → **Passive; — , on the supply** (question 3).
*"While channelling Red or Green, allies within Attunement Range know the current health, conditions
and defenses of the character bearing your Insight and deal additional vital damage equal to your tier
on attacks against it. Once per round, the first ally to hit that character places 1 Insight on it."*
The `packsight` arm and its `use` card retire; the `edha-damage-bonus` (ally-hits-counter-bearer) and
the public `edha-reveal` gate on the Channel instead.

**Hunter's Discipline** — Passive; — → **unchanged** (+tier vital on your own hits on the bearer; half
the Insight carried to a new character on the kill).

**Killing Blow** — 1 Action; 2 Investiture · Red 3+ → **1 Action; —.** *"While channelling Red or
Green, test Red vs. Physical against the character bearing your Insight. On a success, deal
[Tier][Die] vital damage per Insight and remove all Insight. On a failure, deal [Tier][Die] vital
damage and remove 1 Insight."* No amount gate: Red 3+ is the tree's steepest gate already, and the
cash-out resets the stack, which is its price.

**The Pack** — 1 Action; 2 Investiture → **Passive; — , on the supply, gated on 2 or more.** *"While
channelling 2 or more Red or Green, allies within Attunement Range deal additional vital damage equal
to your Insight count on attacks against the character bearing your Insight. The first ally to hit
that character each round places 1 Insight on it."* A per-round tax on the tree's strongest sharing.

**Death Mark** — Passive; — → **unchanged** (the full stack carried on the kill; the allies' free
vital hit).

**The Final Study** — the capstone. It is Killing Blow with the pack's free Strikes, once a scene — the
charge cashed at its largest. The flood fits it for the same reason as Unravel: the disciple flooding
Red at rank 3 is the one whose heat and Insight are both at cap. **A rider gated on "channelling 3 or
more", once per scene, no Investiture** (G-4). *"While channelling 3 or more Red or Green, test Red vs.
Physical against the character bearing your Insight. On a success, deal [Tier][Die] vital damage per
Insight and remove all Insight; each ally within Attunement Range may immediately make a free Strike
against any enemy within their reach. On a failure, deal [Tier][Die] vital damage and remove 1
Insight. Once per scene."*

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Studied Mark | 1 Action; 1 Inv · entry | **the Green face of Study; node dropped** | while channelling Green |
| — | Predatory Strike | 1 Action; 1 Inv · entry | **the Red face of Study; node dropped** | while channelling Red |
| 1 | Accumulate | Passive; — | Passive; — | — |
| 2 | Pack Share | 1 Action; 1 Inv | **Passive; —** | while channelling |
| 3 | Hunter's Discipline | Passive; — | Passive; — | — |
| 4 | Killing Blow | 1 Action; 2 Inv | **1 Action; —** | while channelling |
| 5 | The Pack | 1 Action; 2 Inv | **Passive; —** | channelling 2 or more |
| 6 | Death Mark | Passive; — | Passive; — | — |
| 7 | The Final Study | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Seven cards plus the supply; tree-sum 10 → **0**; Passives 3 → 5. **The frame meeting:** the Red face
carries the heat; under Green the Studied Mark on a character standing in the disciple's home ground is
the pack hunting from the ground. Positional; no card.

### 2.4 Life — Tend (Blue / Green)

**Today:** 9 cards; 1 Passive, 6 single Actions, 1 two-Action, 1 three-Action; 8 of 9 cost
Investiture, tree-sum 13. One Blue test (Surgical Precision, Blue 3+). **A drift for the record:** the
guide and TREE-INTENT put Adaptive Mutation at Green 3+, level 6; `data/domain.json` and the authored
card read *Green 2+; Life Surge*. The data is the authority; the PM reconciles the prose (§7).

**Shape.** Both entries are their faces — Vital Diagnosis the mark, Life Surge the heal — so **the entry
nodes go** (G-1): Anaveth's power carries Tend with both faces. The Blue lane roots at Surgical
Precision and Prognosis, the Green lane at Overgrowth and Adaptive Mutation. Seven cards.

**The supply**, on Anaveth's power:

> **Tend** — Action; — · *the god's supply*
> *While channelling Blue* — choose a character within Attunement Range. For the scene you know its
> exact health, maximum health, conditions, and Physical and Spiritual defenses, and you and allies
> dealing damage to it deal additional vital damage equal to your Blue rank.
> *While channelling Green* — choose a character within Attunement Range. It regains [Tier][Die] +
> Awareness health; healing beyond its maximum becomes temporary health. May self-target.

Events: Vital Diagnosis's (`edha-apply-status` diagnosed with the Blue-rank vital rider; `edha-reveal`)
become the Blue face's; Life Surge's `edha-overflow-thp` the Green face's. The frame's own regen is not
"a Life talent" for Prognosis (FG2-3's shape: the power's heal is not a talent's).

**Cost — the marks' one real balance case.** Life's Green face is a free [Tier][Die] + Awareness heal
on every Action while channelling Green at 1, where today each cast costs 1. The precedent is Green's
own pass (Verdant Mend, a free rider, approved), and the frame beneath it is already a heal; but Life
is the tree that stacks heals — Overgrowth's armor, Prognosis's extra die against a conditioned ally,
Primal Regeneration's tick — and a healer with no per-cast cost is the case Ben named in kind if not in
body. Two answers are tabled (G-3): the recommendation keeps the Green face free and puts the amount
gate on the three scene-long grants (a one-time 2, as today), with item 210's yardstick pricing the
free heal against the party's damage intake; the alternative keeps 1 Investiture on the Green face
alone — the only face in the marks that would cost — so that healing, uniquely, still draws on the
pool per cast.

**Surgical Precision** — 1 Action; 1 Investiture · Blue 3+ → **1 Action; —.** *"While channelling Blue
or Green, touch a willing character and test Blue vs. Physical. On a success, it regains [Tier][Die]
× 2 health and loses one condition (Weakened, Disoriented or Slowed). On a failure, it regains
[Tier][Die] health. May self-target."*

**Prognosis** — Passive; — → **unchanged.** *"When a Diagnosed character takes damage from any source,
you recover 1 Investiture once per round. When you use a Life talent to heal a character that has a
condition, that talent heals an additional [Tier][Die]."* The Diagnosed enemy funds the maintain.

**Overgrowth** — 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Blue or Green, choose
a character within Attunement Range. It regains [Tier][Die] health and grows natural armor: +1 deflect
until the end of the scene, stacking to 3. Healing beyond its maximum becomes temporary health."*

**Adaptive Mutation** — 1 Action; 2 Investiture · Green 2+ → **1 Action; — , gated on 2 or more** (a
scene-long graft: the gate is a one-time 2). *"While channelling 2 or more Blue or Green, touch a
willing character and choose one adaptation for the scene: Bone Spurs (its melee attacks deal
additional keen damage equal to your tier), Venom Glands (its melee hits inflict Afflicted [half
[Tier][Die] vital]), or Dense Tissue (+2 deflect and immune to forced movement). One adaptation per
character."*

**Lifeline** — 1 Action; 2 Investiture → **1 Action; — , gated on 2 or more** (a scene-long link).
*"While channelling 2 or more Blue or Green, choose a character within Attunement Range. For the
scene, when it takes damage you may take up to half of it instead as spirit damage; when you do, it
immediately regains [Tier][Die] health. Once per round."* The link keeps its printed duration (F-4: a
mark on another, not an arm the disciple wears).

**Primal Regeneration** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Blue or Green, touch a willing character. For the scene, it regains tier + 1
health at the start of each of its turns — [Tier][Die] + 1 if it has an adaptation from Adaptive
Mutation. The regeneration ends if it takes vital or spirit damage."*

**Apex Form** — the capstone. Not a detonation: a scene-long transformation whose price is already
written on the card (an Injury when it ends). The flood and the rite cost the same 3 here (question
2), so the choice is only whether Apex Form needs rank 3 — and the tree says it does: mutation is
Life's deep end, and Apex doubles it. **A rider gated on "channelling 3 or more", once per scene, no
Investiture** (G-4; the rite is the alternative). *"While channelling 3 or more Blue or Green, touch
a willing character (may be you). For the scene it regains [Tier][Die] health at the start of each of
its turns, gains +2 deflect, and deals additional vital damage equal to your tier on all attacks; its
adaptations are doubled. When the effect ends, it takes an Injury. Once per scene."*

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Vital Diagnosis | 1 Action; 1 Inv · entry | **the Blue face of Tend; node dropped** | while channelling Blue |
| — | Life Surge | 1 Action; 1 Inv · entry | **the Green face of Tend; node dropped** | while channelling Green (G-3 (b): 1 Inv kept) |
| 1 | Surgical Precision | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 2 | Prognosis | Passive; — | Passive; — | — |
| 3 | Overgrowth | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 4 | Adaptive Mutation | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 5 | Lifeline | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 6 | Primal Regeneration | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Apex Form | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Seven cards plus the supply; tree-sum 13 → **0** (or 1, under G-3 (b)). Life's types do not move — it
is a tree of Actions by design, the healer's turn is spent healing. **The frame meeting:** the Blue
face on the read enemy, the Green face on an ally on the home ground. Positional; no card.

### 2.5 The three trees, together

| | Cards | Costed today → proposed | Tree-sum today → proposed | Passive | Special | 2-or-more | Flood |
|---|---|---|---|---|---|---|---|
| Chaos | 9 → 7 + supply | 8 → 0 | 14 → 0 | 1 → 2 | 0 → 1 | 3 | 1 |
| Knowledge | 9 → 7 + supply | 6 → 0 | 10 → 0 | 3 → 5 | 0 | 1 | 1 |
| Life | 9 → 7 + supply | 8 → 0 (1) | 13 → 0 (1) | 1 → 1 | 0 | 3 | 1 |

The marks keep **no Investiture cost** (Life's Green face the one open question): their charge is capped
(tier + 1 Omens, 5 Insight, one Diagnosis), they raise no bodies, and every card buys into the charge.
What they pay instead is the Channel — 1 a round for the faces and the one-Action riders, a flood for
the synthesis tier and the capstone — funded in all three trees by a refund passive (Void Sense,
Accumulate, Prognosis) that pays the maintain back whenever the marked creature is hurt. The three
trees are the same shape because their charges are; gates 3 and 4 will not be.

### 2.6 Gate 2 — the menu, second draft

**G-1. The entry nodes, per tree.** (a) **Dropped in all three: each entry is exactly its face, the
path's 2+ / 2+ gate guards the supply, and the lanes root at their first riders — seven cards each —
recommended** (§2.1 question 1; the shape follows from the cards, and gate 3's trees will differ).
(b) Kept as nodes whose cards carry the face text (the first draft). (c) Dropped, and two new riders per
tree designed in a later pass to refill nine.

**G-2. Widening cards become Passives on the supply.** (a) **Spreading Omen, Pack Share, The Pack —
recommended** (question 3). (b) They stay Actions, free.

**G-3. Which cards keep an Investiture cost, for balance.** (a) **None in the marks; the synthesis
tier and the scene-long grants take the amount gate instead (a one-time 2 on a scene-long card, a
per-round tax on a repeatable one) — recommended** (no bodies, capped charges, Green's Verdant Mend
precedent; item 210 prices the free heal). (b) Life's Green face (Life Surge) keeps 1 Investiture —
the one face in the marks that costs. (c) The three capstones keep 3 Investiture as rites and the rest
as (a).

**G-4. The capstones, per tree.** (a) **All three riders gated on "channelling 3 or more", once per
scene — recommended, each for its own reason** (§2.2 – §2.4: Unravel and The Final Study detonate the
charge; Apex Form's price is the Injury and the flood only adds rank 3). (b) All three rites at 3
Investiture. (c) Unravel and The Final Study (a); Apex Form (b).

**G-5. Shatter Focus.** (a) **A Special with "Once per round." — recommended** (it does not test).
(b) Stays a Reaction, free.

**G-6. Isolating Ruin against the Black face.** (a) **Stays a card, gated on 2 or more — the second
die is what the flood buys — recommended.** (b) Folds into the Black face as its flood clause and
Chaos drops to six.

**G-7. Killing Blow and The Pack.** (a) **Killing Blow gates on 1 (Red 3+ and the reset are its price);
The Pack gates on 2 or more (the strongest sharing) — recommended.** (b) Both on 2 or more. (c) Neither.

**G-8. The three supplies' names.** (a) **Place Omen, Study, Tend — recommended** (*Tend* because
*Diagnose* names one face only). (b) Ben's own.
