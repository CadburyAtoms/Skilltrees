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
| 2 | §2 The marks — Chaos, Knowledge, Life | **✅ approved 2026-09-17** (second draft) — G-1 … G-8 all (a): entry nodes dropped, seven cards each, no kept cost, capstones on the flood |
| 3 | §3 The ground — Fate, Destruction, Civilization, Death | **✅ approved 2026-09-17** — H-1 … H-10 all (a): two costed faces, Fault Line a release, Death keeps Reaper's Harvest and four priced cards, Hallowed Ground added to Fate |
| 4 | §4 The word — Order, Power, Sovereignty | **proposed 2026-09-17** — I-1 … I-9 tabled |
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

> **Answered at gate 2 (Ben, chat, 2026-09-17):** *"Much better. let's keep going."* — **G-1 … G-8 (a).**
> §2 committed on that answer.

---

## 3. The ground — Fate, Destruction, Civilization, Death

Four gods whose charge sits on the field: Ordained Ground and Snares, Charges and burning ground, the
Construct and Foundations, Remains and the Bone Garden. Two of them raise **bodies** (the Construct,
the Risen Servant) and one of them throws **fire built of Investiture** (Pyre, Fault Line) — the three
collisions §1.4 named and the two balance cases Ben named at gate 2 — so this is the gate where cards
keep costs. Every card was read from `data/domain.json` and its `data/authored/deity-*.json` record at
`main` `919bdf9`. §2.1's four questions apply; two facts specific to this gate:

- **A face keeps its own action type.** Ordained Ground and Lay Foundation are Free Actions today,
  Snare and Forge Construct are Actions; the supply's two faces need not share a type, and none is
  re-typed to match its twin.
- **A costed face.** Where balance keeps a price on a face (Ben, gate 2: *the Construct should stay
  costed at a minimum*), the face still requires the Channel — it is the god's act — and also spends.
  Two faces in this gate are costed: Pyre and Forge Construct. Everywhere else the supply is free.

### 3.1 Fate — Ordain (Green / White)

**Today:** 9 cards; 1 Passive, 2 Free Actions, 1 Reaction, 2 single Actions, 2 two-Action, 1
three-Action; 7 of 9 cost Investiture, tree-sum 11. White is the pure gate item 108 gave one number
(Bulwark Ground's temporary health).

**Shape.** Both entries are their faces — Ordained Ground the square, Snare the trap — so **the entry
nodes go**: the White lane roots at Read the Threads and Bulwark Ground, the Green lane at Inevitable
Snare and Hexmark. Seven cards, or eight with H-2.

**The supply**, on Olvarra's power:

> **Ordain** — · *the god's supply*
> *While channelling White* — **Free Action.** Designate a 5-foot square within Attunement Range as
> Ordained Ground for the scene. An ally that begins its turn on Ordained Ground gains +1 to all
> defenses until the start of its next turn and may use the Aid action at up to 30 feet from that
> square. You may sustain up to your tier Ordained Ground squares.
> *While channelling Green* — **Action.** Place a Snare on a 5-foot square within Attunement Range.
> The first enemy to enter it takes [Tier][Die] + Awareness keen damage and is Restrained until the
> start of your next turn; the Snare is then consumed. You may sustain up to your tier unsprung
> Snares; unsprung Snares fade at the end of the scene.

Events: Ordained Ground's `edha-zone {kind: ordained}` and Snare's `edha-zone {kind: snare}` become the
faces', gated `channelwhite` / `channelgreen`; the ledgers (`ordained`, `snares`), the picker, the
trigger Region and the spring resolver are untouched.

**Cost.** Fate raises no body and throws no bolt; its charges are capped at tier each. Nothing keeps a
cost. The two scene-long links take the amount gate (a one-time 2, as today); the two Free-Action
upgrade riders become Passives on the supply behind the same gate (H-9).

**Read the Threads** — 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Green or White,
choose a character within Attunement Range. You learn the action it intends to take on its next turn
and any movement it plans to make. Then, as a Free Action, you may move one of your Ordained Ground
squares or unsprung Snares up to 10 feet to any space the target will pass through."* The foresight
half stays MANUAL as declared (an NPC's intent is not data).

**Bulwark Ground** — Passive; — → **unchanged** (temporary health equal to your White rank each round
for an ally on your square; no advantage against an ally standing on one). Free cards stay free and
unconditional.

**Inevitable Snare** — Free Action; 1 Investiture → **Passive; — , on the supply, gated on 2 or more.**
*"While channelling 2 or more Green or White, when you place a Snare you may declare it Inevitable.
When an Inevitable Snare triggers it deals an additional [Tier][Die] keen damage, and the triggering
character tests Speed vs. your Green; on a failure it is also Disoriented until the end of its next
turn."* At a flood every Snare is Inevitable — a per-round tax while placing, which is what the +1
per Snare was.

**Hexmark** — Reaction; — → **Special; — , unconditional** (question 3: an offered mark, no test).
*"When an enemy triggers one of your Snares, you may Hexmark it. For the rest of the scene the
Hexmarked character takes an additional [Tier] keen damage whenever it takes damage from any source
while within 10 feet of any of your Ordained Ground squares or unsprung Snares. Once per round."*

**Weave the Thread** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Green or White, choose two of your active Ordained Ground squares within
Attunement Range. For the scene they are linked: an ally standing on either may use the Aid action as
a Free Action once per round, and when an enemy triggers any Snare within 30 feet of either, an ally
standing on either may make a free Reactive Strike against it."*

**Foreknown Strike** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Green or White: for the scene, an ally standing on one of your Ordained Ground
squares may, as a Free Action on its turn, trigger any one of your unsprung Snares within 30 feet,
treating the centre of the Snare's space as the triggering character. A Snare triggered this way deals
an additional [Tier][Die] damage."*

**Thread of Inevitability** — the capstone. A declared event that springs every Snare and rallies
every square: the charge detonated, so the flood fits. **A rider gated on "channelling 3 or more",
once per scene, no Investiture.** *"While channelling 3 or more Green or White, declare a specific
event that will happen during this scene — a character drops to 0 health, a particular enemy crosses a
threshold, an ally reaches a designated location, or the GM raises the stakes. The first time it
occurs, every Ordained Ground square you have active grants its standing ally a free Strike or Aid
against the nearest enemy within 30 feet, and every unsprung Snare you have active triggers in its
space, treating its centre as the triggering character. Once per scene."*

**The frame meeting — and the one card it wants.** Under White the square is in the line: an ally on
Ordained Ground already has +1 to all defenses and refuses advantage, and the frame's deflect stacks
on it — positional, no card. Under Green the home ground *does not reach the squares*: Ordained
Ground is not difficult terrain, so Green's frame heals only allies standing on the disciple's Draw
terrain, and the Green Channel gives the tree nothing but the Snare face. That is the one meeting in
the ten trees worth a card sentence, and the tree has a slot for it (H-2):

> **Hallowed Ground** *(name Ben's)* — Passive; — · Bulwark Ground
> *"While channelling Green, an ally that begins its turn on one of your Ordained Ground squares
> regains health equal to the Investiture you are channelling, as if standing in your difficult
> terrain."*

It reads the frame's own number, lands on the tree's own charge, and gives the Green Channel a reason
the tree can name; the heal-cut gate (R-83) applies as it does to the frame.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Ordained Ground | Free; 1 Inv · entry | **the White face of Ordain; node dropped** | while channelling White |
| — | Snare | 1 Action; 1 Inv · entry | **the Green face of Ordain; node dropped** | while channelling Green |
| 1 | Read the Threads | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 2 | Bulwark Ground | Passive; — | Passive; — | — |
| 3 | Inevitable Snare | Free; 1 Inv | **Passive; —** | channelling 2 or more; on the supply |
| 4 | Hexmark | Reaction; — | **Special; —** | once per round |
| 5 | Weave the Thread | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 6 | Foreknown Strike | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Thread of Inevitability | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |
| 8 | *Hallowed Ground* (H-2) | — | **Passive; —** | while channelling Green |

Tree-sum 11 → **0**; Passives 1 → 2 (3 with H-2), Specials 0 → 1.

### 3.2 Destruction — Set (Blue / Red)

**Today:** 9 cards; 2 Passives, 1 Free Action, 1 Reaction, 2 single Actions, 2 two-Action, 1
three-Action; 6 of 9 cost Investiture, tree-sum 10. Blue is a gate that item 108 gave one number
(Cascading Failure's overlap die).

**Shape.** Both entries are their faces — Set Charge the timed charge, Pyre the fire — so **the entry
nodes go**: the Blue lane roots at Pinpoint Charge and Concussive Yield, the Red lane at Walking Ruin
and Combustion Chain. Seven cards.

**The supply**, on Razkael's power:

> **Set** — Action · *the god's supply*
> *While channelling Blue* — place a Charge on an object, character or 5-foot square within Attunement
> Range and declare its trigger (the start of your next turn by default; or when the target moves,
> when it takes damage, or when a character enters the square). You may detonate any of your Charges
> as a Free Action on your turn. When a Charge detonates, each character within 10 feet takes
> [Tier][Die] energy damage and the detonation point becomes dangerous terrain for the scene. You may
> sustain up to your tier Charges; unused Charges fizzle at the end of the scene.
> *While channelling Red* — **spend 1 Investiture** and make a ranged attack (range 60 feet). On a
> hit, deal [Tier][Die] energy damage; the target's space and each adjacent square become dangerous
> terrain for the scene, spreading to one adjacent flammable square at the end of each of your turns.

**Cost — the collisions.** Pyre is the first: it is the Red face *and* an attack that exists only
because of the Investiture, which is the corollary Ben set for Red (*Searing Bolt is a release*). A
free Pyre is a free ranged Strike that also lays burning ground, three times a turn. **It is a costed
face (H-3):** 1 Investiture per shot, the Channel still required, and under Red's frame the hit
carries the heat as any attack-test hit does (RD-6 (a)). Set Charge is not a bolt — a Charge is placed,
declared and waited on, its cap is tier, and its damage arrives on a trigger — so the Blue face is free.
**Fault Line** is the second: a sixty-foot trench of energy and Prone that also lays terrain, built of
nothing but Investiture. **It keeps its 2 and stands alone — a release (H-4)**; the amount gate would
make it free on any round the disciple floods, and a repeatable free line is the bolt problem at
twelve squares. Cascading Failure detonates *Charges* the disciple already placed; it is the charge
spent, and rides at 2 or more.

**Pinpoint Charge** — Free Action; 1 Investiture → **Passive; — , on the supply, gated on 2 or more.**
*"While channelling 2 or more Blue or Red, when you place a Charge on a character or an object you may
declare it a Pinpoint Charge. When it detonates it ignores the primary target's deflect, deals an
additional [Tier][Die] + Intellect keen damage to it, and the dangerous terrain it leaves is centred on
the primary target and moves with it for the scene."*

**Concussive Yield** — Passive; — → **unchanged** (every detonation: Speed vs. your Red or Prone).

**Cascading Failure** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Blue or Red, detonate any number of your active Charges at once. When two or more
detonate this way their dangerous terrain merges into one zone, and a character caught in two or more
detonations takes an additional [Tier][Die] energy damage."*

**Walking Ruin** — Passive (a Free-Action toggle); — → **unchanged** (the trail and +10 feet of
Speed; free today, free and unconditional under the model).

**Combustion Chain** — Reaction; — → **Special; — , unconditional** (automatic, no test). *"When a
character drops to 0 health in a dangerous terrain square you created, each of your dangerous terrain
zones spreads 5 feet outward and a 10-foot radius around the dropped character becomes dangerous
terrain. Once per round."*

**Fault Line** — 2 Actions; 2 Investiture → **unchanged — a release.** *"Spend 2 Investiture. A
60-foot long, 5-foot wide line extends from you. Each character in the line takes [Tier][Die] +
Strength energy damage and tests Speed vs. your Red; on a failure it is knocked Prone. The line becomes
dangerous terrain for the scene, and structures and Constructs along the line take triple damage."*
Counterable (F-10).

**The Unmooring** — the capstone: every Charge and every flame at once. The charge detonated; **a rider
gated on "channelling 3 or more", once per scene, no Investiture.** *"While channelling 3 or more Blue
or Red, all your active Charges detonate at once. Each detonation's radius increases to 15 feet and
ignores deflect, and each deals [Tier][Die] + Intellect energy damage. All dangerous terrain you have
placed this scene merges into one zone for the rest of the scene, and that zone's damage increases to
[Tier][Die] energy damage. Once per scene."*

**The frame meeting.** Under Blue the read enemy is the one walking into the Charge; under Red every
detonation is noise for the heat and Pyre's hit spends it. Positional; no card.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Set Charge | 1 Action; 1 Inv · entry | **the Blue face of Set; node dropped** | while channelling Blue |
| — | Pyre | 1 Action; 1 Inv · entry | **the Red face of Set; 1 Inv kept; node dropped** | while channelling Red |
| 1 | Pinpoint Charge | Free; 1 Inv | **Passive; —** | channelling 2 or more; on the supply |
| 2 | Concussive Yield | Passive; — | Passive; — | — |
| 3 | Cascading Failure | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 4 | Walking Ruin | Passive; — | Passive; — | — |
| 5 | Combustion Chain | Reaction; — | **Special; —** | once per round |
| 6 | Fault Line | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |
| 7 | The Unmooring | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Tree-sum 10 → **3** (the costed face 1, Fault Line 2); Passives 2 → 3, Specials 0 → 1.

### 3.3 Civilization — Build (Red / White)

**Today:** 9 cards; 1 Passive, 1 Free Action, 1 Reaction, 2 single Actions, 3 two-Action, 1
three-Action; 7 of 9 cost Investiture, tree-sum 11.

**Shape.** Both entries are their faces — Forge Construct the machine, Lay Foundation the square — so
**the entry nodes go**: the Red lane roots at Tempered Edge and Siege Form, the White lane at Trade
Routes and Bonds of Community. Seven cards.

**The supply**, on Kethane's power:

> **Build** — · *the god's supply*
> *While channelling Red* — **Action; spend 1 Investiture.** Forge a Combat Construct in an adjacent
> space for the scene. The Construct has health equal to [Tier][Die] + twice your tier, deflect 1,
> Speed 25 feet, defenses equal to yours minus 2, and one melee attack per turn dealing [Tier][Die]
> impact damage. It acts on your initiative immediately after your turn. If it is destroyed you may
> forge it again with this action. You may sustain one Construct.
> *While channelling White* — **Free Action.** Designate a 10-foot square within Attunement Range as a
> Foundation for the scene. Allies that begin their turn in a Foundation gain +1 to all defenses until
> the start of their next turn. You may sustain up to your tier Foundations.

**Cost — the body.** The Construct is Ben's named case: a creature built of Investiture, reforged
when it falls, with a six-card ladder that makes it the tree. **The Red face is costed (H-3):** 1
Investiture per forge and per reforge, the Channel required. The White face is free: a Foundation is
a square with a cap of tier. The ladder that arms the body: Siege Form (1 today) and Trade Routes (1)
ride at 1; Arsenal and Bastion (2 each, scene-long) take the amount gate — a one-time 2 as today.

**Tempered Edge** — Passive; — → **unchanged** (+[Tier][Die] energy on the Construct's melee hits).

**Siege Form** — 2 Actions; 1 Investiture → **2 Actions; —.** *"While channelling Red or White,
command your Combat Construct to enter Siege Form for the scene: its Speed becomes 0, it gains +2
deflect, and its melee attack is replaced by a ranged attack (60 feet) dealing [Tier][Die] + Strength
energy damage. You may end Siege Form as a Free Action on your turn."*

**Trade Routes** — 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Red or White,
choose two of your active Foundations. For the scene they are linked: an ally standing in either may
teleport to the other as a Free Action once per turn."*

**Bonds of Community** — Reaction; — → **Special; — , unconditional** (a rally on a drop; no test).
*"When a character drops to 0 health within one of your Foundations, each ally in any of your
Foundations gains temporary health equal to your White and an advantage on its next attack test. Once
per round."*

**Arsenal** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While channelling
2 or more Red or White: for the scene your Combat Construct gains an additional attack per turn, and
when it reduces a character to 0 health you may immediately command it to move up to 15 feet and make
a free Strike against a character within reach."* The arm is on the Construct, not the disciple, so it
keeps its printed duration (F-4).

**Bastion** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While channelling
2 or more Red or White: for the scene each of your Foundations is fortified. Enemies treat fortified
Foundations as difficult terrain, and an enemy that enters one takes [Tier][Die] impact damage and
tests Agility vs. your Red; on a failure it is Slowed until the start of its next turn. Your Combat
Construct standing in a fortified Foundation gains +2 to all defenses."*

**Magnum Opus** — the capstone: the body made a Colossus for the scene, once. It is a scene
transformation, not a detonation, so the flood and the rite cost the same 3 (§2.1 question 2); the
flood adds rank 3, which is where a Colossus belongs. **A rider gated on "channelling 3 or more",
once per scene, no Investiture** (H-7 offers the rite: the body's whole line is costed, and the
capstone could follow it). *"While channelling 3 or more Red or White, your Combat Construct
transforms into a Colossus for the scene: it gains [Tier][Die] × 2 additional health, +2 to all
defenses and reach 10 feet, and its attacks deal an additional [Tier][Die] energy damage to each
enemy within 10 feet of the target; each affected enemy tests Agility vs. your Red and is knocked
Prone on a failure. Each ally in one of your Foundations gains +2 to all defenses. Once per scene."*

**The frame meeting.** Under White the Construct is an ally at an ally's shoulder — the line's deflect
covers the machine, the Foundation covers the formation — positional. Under Red the smith's own hits
carry the heat and the Construct's Slams are noise that builds it; the heat is the mage's own by the
Red rule, so the Construct's hits do not spend it. A card that extended the heat to the Construct is
possible and is not recommended (H-3's note): the body is already the tree, and Tempered Edge is its
fire.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Forge Construct | 1 Action; 1 Inv · entry | **the Red face of Build; 1 Inv kept; node dropped** | while channelling Red |
| — | Lay Foundation | Free; 1 Inv · entry | **the White face of Build; node dropped** | while channelling White |
| 1 | Tempered Edge | Passive; — | Passive; — | — |
| 2 | Siege Form | 2 Actions; 1 Inv | **2 Actions; —** | while channelling |
| 3 | Trade Routes | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 4 | Bonds of Community | Reaction; — | **Special; —** | once per round |
| 5 | Arsenal | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 6 | Bastion | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Magnum Opus | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Tree-sum 11 → **1** (the costed face); Specials 0 → 1.

### 3.4 Death — Wither (Black / Green)

**Today:** 9 cards; 1 Passive, 4 single Actions, 3 two-Action, 1 three-Action; 8 of 9 cost
Investiture, tree-sum 14 — the atlas's most expensive tree with Chaos. Its Green entry, Reaper's
Harvest, is not an action: it is the economy, always on.

**Shape — the tree that keeps a node.** Withering Touch is exactly its face and its node goes.
Reaper's Harvest is *more* than a face — a passive that pays Investiture and marks a Remain on every
death in range, seeds a Remain each scene, and senses them — and it keeps its node as the Green lane's
root (§2.1 question 1). So **Death's supply has one face**, and the Green Channel's work in this tree
is spending, not supplying: the Bone Garden, the servant, the séance. Eight cards. H-1 (c) offers the
other reading — the Bone Garden as the Green face — and H-1 (d) the harder one — the Harvest itself
moved onto the power as a Green *passive face* that pays only while channelling Green.

**The supply**, on Morrath's power:

> **Wither** — Action · *the god's supply*
> *While channelling Black* — make a melee weapon attack. On a hit, deal an additional [Tier][Die] +
> Willpower vital damage, and the target cannot regain health until the end of your next turn.

Events: Withering Touch's arm (`withernext`) and armed damage bonus (melee weapon only, `healCutFraction
0`) become the face's, gated `channelblack`. Under Black's frame the forsaken is the one you wither,
and the Draw Weakens it — Consuming Decay's gate.

**Cost — the body and the rites.** Death is where the priced identity survives, on four cards, each
for its own reason. **Risen Servant** raises a body: Ben's case in words. It keeps **1 Investiture and
a Harvested Remain** as a costed rider (H-6). **Death Ward** protects anyone, is cast as often out of
combat as in, and a free "first drop to 0 becomes 1" on the whole party is the kind of scene-long gift
question 2 looks at hard: it keeps its 2 as a rite, no Channel needed (H-5). **Speak with the Fallen**
and **Raise Dead** are rites in the plain sense — a séance and a resurrection, outside the round —
and keep 2 and 4. The Bone Garden costs a Remain, which is the price; Consuming Decay and Necrotic
Cascade ride.

**Reaper's Harvest** — Passive; — · *node kept* → **unchanged.** *"When a character drops to 0 health
within your Attunement Range, you recover 1 Investiture and mark the corpse as a Harvested Remain. You
begin each scene with 1 Harvested Remain. You may sustain a number of Remains equal to your tier;
unused Remains fade at the end of the scene. You sense each of your active Remains through any
obstruction."* The refund funds the maintain, as the marks' refunds do.

**Consuming Decay** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Black or Green, choose a Weakened character or a character below half health
within Attunement Range. For the scene, at the start of each of its turns it takes [Tier][Die] vital
damage and you regain health equal to half the damage dealt. One instance per character."*

**Bone Garden** — 1 Action; 1 Investiture and a Remain → **1 Action; a Harvested Remain.** *"While
channelling Black or Green, spend a Harvested Remain on a 10-foot square within Attunement Range. For
the scene the square is difficult terrain, and a character that ends its turn in it takes [Tier][Die]
keen damage from grasping bone."*

**Death Ward** — 2 Actions; 2 Investiture → **unchanged — a rite.** *"Spend 2 Investiture and choose a
character within Attunement Range. If the target is unwilling, test Black vs. Spiritual; on a success,
or freely on a willing target, the effect applies. For the scene, the first time the target would drop
to 0 health it instead drops to 1 and gains [Tier][Die] + Presence temporary health. The effect then
ends."* Counterable (F-10).

**Necrotic Cascade** — 1 Action; 1 Investiture → **1 Action; — , an arm the disciple wears (F-4).**
*"While channelling Black or Green, arm the cascade. While you channel, when a character drops to 0
health within Attunement Range, each enemy within 10 feet of it takes [Tier][Die] spirit damage."* The
`cascadearmed` status ends with the Channel.

**Risen Servant** — 1 Action; 1 Investiture and a Remain → **1 Action; 1 Investiture and a Harvested
Remain — a costed rider.** *"While channelling Black or Green, spend 1 Investiture and a Harvested
Remain to raise a Risen Servant in an adjacent space for the scene. The servant has health equal to
[Tier][Die], Speed 25 feet, defenses equal to yours minus 3, and one melee attack per turn dealing
[Tier][Die] keen damage. It is immune to Frightened, Compelled and Disoriented, and acts on your
initiative immediately after your turn. You may sustain up to your tier Risen Servants."*

**Speak with the Fallen** — 2 Actions; 2 Investiture → **unchanged — a rite** (2 Investiture and a
Remain, or the touch of remains dead within a day; three questions; +2 per repeat).

**Raise Dead** — 3 Actions; 4 Investiture → **unchanged — a rite.** The resurrection stands outside
the round and the Channel; it keeps its 4 and its once per scene. Not flood-gated: a rite is not a
detonation, and the tree's price belongs here if it belongs anywhere (H-7).

**The frame meeting — and the Bone Garden.** Under Black, positional: the forsaken is withered,
decayed, cascaded. Under Green the question §1.4 named: is the Bone Garden "your difficult terrain"
for the home ground? It is laid by a Death talent as a Green-coloured zone, and it bites *anyone* who
ends a turn in it, allies included (Ben R5); an ally on it would regain the channelled number at the
start of their turn and take [Tier][Die] keen at the end. **The recommendation is that it does not
count (H-8):** the Garden is bone, not home ground, and the Green frame reaches Death's disciple only
through the terrain their own Draw lays. No card.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Withering Touch | 1 Action; 1 Inv · entry | **the Black face of Wither; node dropped** | while channelling Black |
| 1 | Reaper's Harvest | Passive; — · entry | Passive; — · *node kept* | — |
| 2 | Consuming Decay | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 3 | Bone Garden | 1 Action; 1 Inv + Remain | **1 Action; a Remain** | while channelling |
| 4 | Death Ward | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (rite) |
| 5 | Necrotic Cascade | 1 Action; 1 Inv | **1 Action; —** | while channelling; holds while channelling |
| 6 | Risen Servant | 1 Action; 1 Inv + Remain | **1 Action; 1 Inv + a Remain** | while channelling (costed) |
| 7 | Speak with the Fallen | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (rite) |
| 8 | Raise Dead | 3 Actions; 4 Inv | 3 Actions; 4 Inv | — (rite; once per scene) |

Tree-sum 14 → **9**; costed 8 of 9 → 4 of 8. Death keeps the most price in the atlas, on its bodies and
its rites — where the god's identity says it should.

### 3.5 The four trees, together

| | Cards | Costed today → proposed | Tree-sum today → proposed | Kept costs | Faces | Flood |
|---|---|---|---|---|---|---|
| Fate | 9 → 7 (+1) + supply | 7 → 0 | 11 → 0 | — | 2 (Free / Action) | 1 |
| Destruction | 9 → 7 + supply | 6 → 2 | 10 → 3 | Pyre (costed face), Fault Line (release) | 2 (one costed) | 1 |
| Civilization | 9 → 7 + supply | 7 → 1 | 11 → 1 | Forge Construct (costed face) | 2 (one costed, Free / Action) | 1 |
| Death | 9 → 8 + supply | 8 → 4 | 14 → 9 | Risen Servant (costed rider), Death Ward, Speak with the Fallen, Raise Dead (rites) | 1 | 0 |

The ground is where the cost stays: two bolts, two bodies, three rites. Seven cards keep a price
across the four trees, against none in the marks — the shape Ben predicted at gate 2, and the reason
the trees are decided one at a time.

### 3.6 Gate 3 — the menu

**H-1. The entry nodes, per tree.** (a) **Fate, Destruction and Civilization drop both; Death drops
Withering Touch and keeps Reaper's Harvest as the Green lane's root, its supply one-faced —
recommended** (§2.1 question 1: an entry that is more than a face keeps its node). (b) All four keep
both nodes. (c) Death's Green face is the Bone Garden, and both Death nodes drop (seven cards; the
Garden then costs a Remain on the face). (d) Reaper's Harvest moves onto Morrath's power as a Green
passive face that pays only *while channelling Green* — the two-face choice made to bite (wither or
reap, not both in a round); a real nerf to the economy that the scene-start Remain softens.

**H-2. Fate's amendment card.** (a) **Add *Hallowed Ground* (name Ben's) as Fate's eighth card behind
Bulwark Ground — recommended** (the one meeting in the atlas the frames do not reach on their own;
Green's Channel otherwise gives Fate only the Snare face). (b) No new card; the Green Channel reaches
Fate through the disciple's Draw terrain only.

**H-3. The costed faces.** (a) **Pyre and Forge Construct keep 1 Investiture as faces, the Channel
still required — recommended** (the bolt and the body; Ben's Red ruling and his gate-2 note).
(b) Both free, gated on 2 or more. (c) Forge Construct free to forge, 1 Investiture to reforge; Pyre
as (a).

**H-4. Fault Line.** (a) **A release at 2 Investiture, no Channel needed, counterable — recommended**
(an attack built of Investiture alone). (b) A rider gated on 2 or more.

**H-5. Death Ward.** (a) **A rite at 2 Investiture, no Channel needed — recommended** (protection for
anyone, as often out of combat as in). (b) A rider gated on 2 or more.

**H-6. Risen Servant.** (a) **1 Investiture and a Remain, while channelling — recommended** (Ben's
case). (b) A Remain only. (c) 1 Investiture and a Remain, and no Channel needed (a rite).

**H-7. The capstones, per tree.** (a) **Thread of Inevitability, The Unmooring and Magnum Opus on the
flood, once per scene; Raise Dead a rite at 4 — recommended** (three detonations or transformations;
one resurrection). (b) Magnum Opus a rite at 3, following its body's costed line. (c) All four rites.

**H-8. The Bone Garden and the home ground.** (a) **Does not count as the disciple's difficult
terrain — recommended** (bone, not home ground; it bites allies). (b) Counts.

**H-9. Inevitable Snare and Pinpoint Charge.** (a) **Passives on the supply, gated on 2 or more —
recommended** (a per-round tax while placing, which the +1 per placement was). (b) Free Action, 1
Investiture kept (costed riders). (c) Passives at 1.

**H-10. The four supplies' names.** (a) **Ordain, Set, Build, Wither — recommended.** (b) Ben's own
(*Set* is the weakest of the ten; *Demolish* and *Kindle* were considered and set aside — the second
is a Red talent's name).

> **Answered at gate 3 (Ben, chat, 2026-09-17):** *"That all looks good!"* — **H-1 … H-10 (a).** §3
> committed on that answer; *Hallowed Ground* keeps its placeholder name until Ben names it.
