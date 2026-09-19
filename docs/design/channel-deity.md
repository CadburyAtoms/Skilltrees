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
| 4 | §4 The word — Order, Power, Sovereignty | **✅ approved 2026-09-17** — I-1 … I-9 all (a): four arms hold while channelling, the Mantle included; no kept cost; item 106 back to the PM |
| 5 | §5 The mix, against the bands | **✅ approved 2026-09-17** — J-1 … J-5 all (a): the guide's table restated to the measured mix; the Special target ~5 – 10 %; the 7 % costed floor accepted |
| 6 | §6 The build notes | **✅ approved 2026-09-17** — K-1 … K-6 all (a): two face actions per power, the item-level gate for all fifteen trees, rank-granted powers, `endWithChannel`, the Route A bench |
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
Fate 11, Destruction 10, Knowledge 10, Order 10 — **121 across the atlas** (the pass printed 125; the
data says 121, §5.2), against 70 across the five
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
either of the god's colours' Channels, and it costs no Investiture — the Channel paid — except on the
four faces balance prices at 1 (§2.2, §2.4, §3.2, §3.3; R-160 (a), 2026-09-19). It keeps the
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

> ~~**Place Omen** — Action; — · *the god's supply*~~
> ~~*While channelling Blue* — test Blue vs. Cognitive. On a success, place an Omen on the target and~~
> ~~deal [Tier][Die] spirit damage.~~
> ~~*While channelling Black* — test Black vs. Physical. On a success, the target is Isolated until the~~
> ~~start of your next turn; if it bears an Omen, remove it and deal [Tier][Die] + Awareness vital~~
> ~~damage; if not, place one.~~
> ~~You may have up to tier + 1 Omens active; placements beyond the cap are lost.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families,
> `docs/analysis/talent-comparison-mistborn-radiant.md`; R-160 (a) — Ben refused a blanket 2-Action
> supply in chat and the narrow fix was taken as its recommended default).** The Black face and the
> cap stand; the Blue face takes a cost:
>
> **Place Omen** — Action; — · *the god's supply*
> *While channelling Blue* — **spend 1 Investiture.** Test Blue vs. Cognitive. On a success, place an
> Omen on the target and deal [Tier][Die] spirit damage.
> *While channelling Black* — test Black vs. Physical. On a success, the target is Isolated until the
> start of your next turn; if it bears an Omen, remove it and deal [Tier][Die] + Awareness vital
> damage; if not, place one.
> You may have up to tier + 1 Omens active; placements beyond the cap are lost.
>
> Why the Blue face alone: the Omen cap bounds the **charge**, not the payload. "Placements beyond the
> cap are lost" leaves the face still dealing [Tier][Die] spirit on every Action once the cap is full,
> so a disciple at the cap has a free repeatable damage Action three times a round. §5.2 has the line
> that sorts every face — *a face costs 1 Investiture when its payload is repeatable and bounded
> neither by a charge cap nor by replacing a weapon Strike* — and it catches five faces, not two: this
> one, **both** of Tend's faces (§2.4 — the Green one under R-160 (a), the Blue one under R-160 (d),
> which Ben took the same day), and Pyre and Forge Construct, which the pass already costed one at a
> time. The Black face is bounded by the Omen it shatters and stays free. **The §2.2 Cost paragraph's
> "Nothing here is a balance case for a kept cost" and §7.1's gate-2 row "no kept cost" are superseded
> for this face** and left unedited, as the gate log is the record of the day. Item 198's Chaos leg
> builds this text, not the struck one.

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

~~**Void Sense** — Passive; — → **unchanged.** *"You sense the location of every enemy bearing your Omen~~
~~through any obstruction. Once per round, when an enemy bearing one of your Omens within Attunement~~
~~Range takes damage from any source, you recover 1 Investiture."* The refund keeps a one-point maintain~~
~~running without a Draw.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families, R-161
> (a) — answered by Ben in chat the same day: the refunds become upkeep).** The refund is upkeep,
> not income:
>
> **Void Sense** — Passive; —. *"You sense the location of every enemy bearing your Omen through any
> obstruction. Once per round, while you are channelling, when an enemy bearing one of your Omens
> within Attunement Range takes damage from any source, you recover 1 Investiture. You cannot recover
> more than the Investiture you are channelling this way in a round."*
>
> It still keeps a one-point maintain running without a Draw — that was always the stated job — but it
> pays only while a Channel is up and never more than the Channel cost, so it can no longer bank pool
> between Channels. **Where the cap actually binds, recorded so nobody reads more into it than it
> does:** Void Sense, Accumulate and Prognosis already say "once per round", so their refund is 1 and
> the spend is at least 1 whenever a Channel is up — on those three the cap is inert today and only
> the "while you are channelling" clause changes anything. Reaper's Harvest (§3.4) and Expose (§4.3)
> carry no per-round limit, and they are where the leak lives. The uniform sentence is carried on all
> five anyway, as one principle and one engine field, so a later card cannot reopen it.
> §5.2's "Where the refund passives sit" carries the full rule. Item 198's Chaos leg builds this text,
> not the struck one.

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
| — | Entropy Strike | 1 Action; 1 Inv · entry | **the Blue face of Place Omen; 1 Inv kept; node dropped** | while channelling Blue |
| — | Isolating Pressure | 1 Action; 2 Inv · entry | **the Black face of Place Omen; node dropped** | while channelling Black |
| 1 | Shatter Focus | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 2 | Spreading Omen | 1 Action; 1 Inv | **Passive; —** | while channelling; on the supply's success |
| 3 | Void Sense | Passive; — | Passive; — | — |
| 4 | Unweaving | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 5 | Cascade Collapse | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 6 | Isolating Ruin | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Unravel Everything | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Seven cards plus the supply; tree-sum 14 → **1** (the costed face); Passives 1 → 2, Specials 0 → 1. **The frame
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

~~**Accumulate** — Passive; — → **unchanged.** *"At the start of each of your turns, if the character~~
~~bearing your Insight is within Attunement Range, place 1 Insight on it (up to the cap). When that~~
~~character takes damage from any source, you recover 1 Investiture once per round."* The refund funds~~
~~the maintain.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families, R-161
> (a) — answered by Ben in chat the same day: the refunds become upkeep).** The Insight half stands;
> the refund becomes upkeep:
>
> **Accumulate** — Passive; —. *"At the start of each of your turns, if the character bearing your
> Insight is within Attunement Range, place 1 Insight on it (up to the cap). Once per round, while you
> are channelling, when that character takes damage from any source, you recover 1 Investiture. You
> cannot recover more than the Investiture you are channelling this way in a round."*
>
> §5.2's "Where the refund passives sit" carries the full rule and the one card tail all five now share. Item 198's Knowledge leg builds this text, not the struck one.

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

> ~~**Tend** — Action; — · *the god's supply*~~
> ~~*While channelling Blue* — choose a character within Attunement Range. For the scene you know its~~
> ~~exact health, maximum health, conditions, and Physical and Spiritual defenses, and you and allies~~
> ~~dealing damage to it deal additional vital damage equal to your Blue rank.~~
> ~~*While channelling Green* — choose a character within Attunement Range. It regains [Tier][Die] +~~
> ~~Awareness health; healing beyond its maximum becomes temporary health. May self-target.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families,
> `docs/analysis/talent-comparison-mistborn-radiant.md`; R-160 (a) — Ben refused a blanket 2-Action
> supply in chat and the narrow fix was taken as its recommended default).** **G-3 is re-answered
> (b)** — the alternative this section itself tabled, and the one the Cost paragraph below still
> describes as the road not taken:
>
> **Tend** — Action; — · *the god's supply*
> *While channelling Blue* — **spend 1 Investiture.** Choose a character within Attunement Range. For
> the scene you know its exact health, maximum health, conditions, and Physical and Spiritual
> defenses, and you and allies dealing damage to it deal additional vital damage equal to your Blue
> rank.
> *While channelling Green* — **spend 1 Investiture.** Choose a character within Attunement Range. It
> regains [Tier][Die] + Awareness health; healing beyond its maximum becomes temporary health. May
> self-target.
>
> The Green face was the pass's own named balance case and item 210's yardstick row 1, and the review
> priced it rather than waiting: the heal is bounded by nothing — no charge cap, no attack roll — and
> 1 Investiture is the cost today's Life Surge already carries, so this restores a price rather than
> inventing one. At level 4 with a pool of 4 and a Draw of 2 the healer still runs one heal a round
> indefinitely (maintain 1 + heal 1 = 2 out, Draw 2 in) and pays only for burst. **The Cost paragraph
> below and §7.1's gate-2 row "no kept cost" are superseded for this face** and left unedited; the
> table row at the end of this section already carried "(G-3 (b): 1 Inv kept)" against this face.
> **The Blue face is costed too, under R-160 (d)** — answered by Ben in chat on 2026-09-19, after the
> widening was put to him rather than taken. It is scene-long, party-wide, repeatable and carries no
> stated cap on how many characters may bear it, so it meets the same line as the Green face, and
> 1 Investiture is the cost today's Vital Diagnosis already carries. **Tend is the only supply in the
> atlas with both faces costed**, which is what it means for a tree to have two unbounded payloads:
> Life buys a scene-long party-wide vital rider on one face and uncapped healing on the other, and
> neither was bounded by a charge cap or an attack roll. Five faces are costed atlas-wide. Item 198's
> Life leg builds this text, not the struck one.

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

~~**Prognosis** — Passive; — → **unchanged.** *"When a Diagnosed character takes damage from any source,~~
~~you recover 1 Investiture once per round. When you use a Life talent to heal a character that has a~~
~~condition, that talent heals an additional [Tier][Die]."* The Diagnosed enemy funds the maintain.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families, R-161
> (a) — answered by Ben in chat the same day: the refunds become upkeep).** The heal rider stands;
> the refund becomes upkeep:
>
> **Prognosis** — Passive; —. *"Once per round, while you are channelling, when a Diagnosed character
> takes damage from any source, you recover 1 Investiture. You cannot recover more than the Investiture
> you are channelling this way in a round. When you use a Life talent to heal a character that has a
> condition, that talent heals an additional [Tier][Die]."*
>
> §5.2's "Where the refund passives sit" carries the full rule and the one card tail all five now share. Item 198's Life leg builds this text, not the struck one.

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
| — | Vital Diagnosis | 1 Action; 1 Inv · entry | **the Blue face of Tend; 1 Inv kept; node dropped** | while channelling Blue (R-160 (d)) |
| — | Life Surge | 1 Action; 1 Inv · entry | **the Green face of Tend; node dropped** | while channelling Green; 1 Inv kept (G-3 re-answered (b), 2026-09-19) |
| 1 | Surgical Precision | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 2 | Prognosis | Passive; — | Passive; — | — |
| 3 | Overgrowth | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 4 | Adaptive Mutation | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 5 | Lifeline | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 6 | Primal Regeneration | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Apex Form | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Seven cards plus the supply; tree-sum 13 → **2** (both costed faces; G-3 re-answered (b) and R-160 (d) taken, 2026-09-19). Life's types do not move — it
is a tree of Actions by design, the healer's turn is spent healing. **The frame meeting:** the Blue
face on the read enemy, the Green face on an ally on the home ground. Positional; no card.

### 2.5 The three trees, together

| | Cards | Costed today → proposed | Tree-sum today → proposed | Passive | Special | 2-or-more | Flood |
|---|---|---|---|---|---|---|---|
| Chaos | 9 → 7 + supply | 8 → 1 | 14 → 1 | 1 → 2 | 0 → 1 | 3 | 1 |
| Knowledge | 9 → 7 + supply | 6 → 0 | 10 → 0 | 3 → 5 | 0 | 1 | 1 |
| Life | 9 → 7 + supply | 8 → 2 | 13 → 2 | 1 → 1 | 0 | 3 | 1 |

The marks keep **no Investiture cost on a talent**: their charge is capped (tier + 1 Omens, 5 Insight,
one Diagnosis), they raise no bodies, and every card buys into the charge. **Three of their faces are
costed** — Place Omen's Blue, Tend's Green and Tend's Blue, at 1 each (R-160 (a) and (d), 2026-09-19),
every payload in the marks bounded by neither a charge cap nor a weapon Strike. Tend carries a cost on
both faces, the only supply in the atlas that does. What they pay otherwise is the Channel
— 1 a round for the free faces and the one-Action riders, a flood for the synthesis tier and the
capstone — funded in all three trees by a refund passive (Void Sense, Accumulate, Prognosis) that,
under R-161 (a), pays back **once per round while you are channelling and never more than the
Investiture you are channelling** rather than whenever the marked creature is hurt. The three
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
  Two faces in this gate are costed: Pyre and Forge Construct. Everywhere else **in this gate** the
  supply is free; §2's Place Omen (Blue) and Tend (Green) were costed on 2026-09-19 under the same
  line (R-160 (a)).

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

~~**Reaper's Harvest** — Passive; — · *node kept* → **unchanged.** *"When a character drops to 0 health~~
~~within your Attunement Range, you recover 1 Investiture and mark the corpse as a Harvested Remain. You~~
~~begin each scene with 1 Harvested Remain. You may sustain a number of Remains equal to your tier;~~
~~unused Remains fade at the end of the scene. You sense each of your active Remains through any~~
~~obstruction."* The refund funds the maintain, as the marks' refunds do.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families, R-161
> (a) — answered by Ben in chat the same day: the refunds become upkeep).** One of the two cards
> where the cap actually binds — a bloody round pays several times today:
>
> **Reaper's Harvest** — Passive; — · *node kept*. *"When a character drops to 0 health within your
> Attunement Range, you mark the corpse as a Harvested Remain, and, while you are channelling, you
> recover 1 Investiture. You cannot recover more than the Investiture you are channelling this way in
> a round. You begin each scene with 1 Harvested Remain. You may sustain a number of Remains equal to
> your tier; unused Remains fade at the end of the scene. You sense each of your active Remains through
> any obstruction."*
>
> **The Remain is not gated on channelling — only the Investiture is.** The corpse economy that is
> Death's identity (the Remain itself, the Bone Garden, Risen Servant, the séance) is untouched, so
> what the cap takes is the pool income and what it leaves is the body. §5.2's "Where the refund
> passives sit" carries the full rule. Item 198's Death leg builds this text, not the struck one.

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

---

## 4. The word — Order, Power, Sovereignty

Three gods whose charge is a declaration on a creature: an Edict or a Covenant, a command (Compelled),
a judgment (the die-step). None raises a body or throws a bolt, so the cost question here is about
**arms** — scene-long installs the disciple wears — and this is the gate where F-4 (a) has its
consumers: Crown of Thorns, Warlord's Fury, Concord, and the Mantle of the Aspirant. Every card was
read from `data/domain.json` and its `data/authored/deity-*.json` record at `main` `919bdf9`; §2.1's
four questions apply.

### 4.1 Order — Declare (Blue / White)

**Today:** 9 cards; 2 Passives, 1 Free Action, 1 Reaction, 2 single Actions, 2 two-Action, 1
three-Action; 6 of 9 cost Investiture, tree-sum 10. The tightest spine in the atlas (guide Part 4):
every card reads an Edict or a Covenant. Every test rolls Blue; White carries magnitude.

**Shape.** Both entries are their faces — Edict the law, Covenant the oath — so **the entry nodes go**:
the Blue lane roots at Lawkeeper's Eye and Sealed Edict, the White lane at Bear Witness and Shoulder
the Oath. Seven cards.

**The supply**, on Tessavain's power:

> **Declare** — Action · *the god's supply*
> *While channelling Blue* — place an Edict on a character within Attunement Range, declaring one
> prohibited action (move from its space, attack a chosen ally, activate Investiture, and so on). The
> first time the bound character takes the prohibited action, it takes [Tier][Die] + Intellect spirit
> damage and is Disoriented until the start of your next turn; the Edict is then consumed. You may
> sustain up to your tier Edicts; unviolated Edicts fade at the end of the scene.
> *While channelling White* — touch a willing ally; you and that ally enter a Covenant for the scene.
> While it holds, you each gain +1 to all defenses when within Attunement Range of each other, and may
> use the Aid action targeting each other at any range within Attunement Range. A Covenant ends if
> either party deliberately attacks the other. You may sustain up to your tier Covenants.

Events: Edict's `edha-owner-list {list: edicts, prohibition: true}` and Covenant's `edha-owner-list
{list: covenants, requireAdjacent: true}` with its +1 AE become the faces', gated `channelblue` /
`channelwhite`; the violation watchers, the resolver and the shared `edict` / `covenant` icons are
untouched.

**Cost.** No body, no bolt; both charges cap at tier. Nothing keeps a cost. Sealed Edict, a Free-Action
upgrade rider on the placement, becomes a Passive on the supply behind the amount gate (Inevitable
Snare's shape, H-9); Verdict takes the gate as a repeatable two-Action play; Concord is an arm and
holds while the disciple channels.

**Lawkeeper's Eye** — Passive; — → **unchanged** (the bound character's intended action revealed on
placement — MANUAL as declared; advantage for you and your allies on attack tests against a bound
character you can see).

**Sealed Edict** — Free Action; 1 Investiture · Blue 3+ → **Passive; — , on the supply, gated on 2 or
more; Blue 3+ kept.** *"While channelling 2 or more Blue or White, when you place an Edict you may
declare it Sealed. When a Sealed Edict is violated, the violator tests Discipline vs. your Blue; on a
failure it takes an additional [Tier][Die] spirit damage and is Weakened until the end of its next
turn."*

**Bear Witness** — Passive; — → **unchanged** (temporary health equal to your White rank each round to
every Covenant ally in range).

**Shoulder the Oath** — Reaction; — → **Special; — , unconditional** (a redirect, no test). *"When an
ally in a Covenant with you would take damage and you are within Attunement Range, you may take half
of it instead and reduce the remaining damage to that ally by your ranks in White. You and that ally
each gain temporary health equal to your ranks in White. Once per round."*

**Verdict** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While channelling 2
or more Blue or White, choose a character bound by one of your Edicts within Attunement Range and test
Blue vs. Cognitive. On a success the Edict is immediately considered violated, and each other enemy
within 10 feet of the target tests Discipline vs. your Blue; each failing enemy takes [Tier][Die]
spirit damage and is Disoriented until the start of your next turn."*

**Concord** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more; an arm the disciple wears
(F-4).** *"While channelling 2 or more Blue or White, your active Covenants form a Concord. While you
channel Blue or White, an ally in a Covenant with you may, as a Free Action on its turn, grant any
other Covenant ally the benefit of the Aid action, and each Covenant ally's first attack each round
deals additional damage equal to your Presence."* Cast at the flood; holds at any maintain; the
`concord` status ends with the Channel.

**Final Decree** — the capstone: one law spoken over every enemy in range, the sworn named Witnesses,
every Edict triggered on the first violation. The charge detonated; **a rider gated on "channelling 3
or more", once per scene, no Investiture.** *"While channelling 3 or more Blue or White, name one
prohibited action that applies to every enemy within Attunement Range as if bound by your Edict; each
ally in a Covenant with you is named a Witness. The first time any bound enemy takes the prohibited
action, every active Edict you have immediately triggers, every Witness gains [Tier][Die] temporary
health and an advantage on its next attack test, and each enemy within 10 feet of the violator takes
[Tier][Die] + Intellect spirit damage. Once per scene."*

**The frame meeting.** Under Blue the Edict binds the read enemy — Verdict's Blue test, Lawkeeper's
advantage and the frame's disadvantage on one creature; under White the Covenant is the line sworn —
+1 to all defenses and the frame's deflect on the same shoulder. Positional; no card.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Edict | 1 Action; 1 Inv · entry | **the Blue face of Declare; node dropped** | while channelling Blue |
| — | Covenant | 1 Action; 1 Inv · entry | **the White face of Declare; node dropped** | while channelling White |
| 1 | Lawkeeper's Eye | Passive; — | Passive; — | — |
| 2 | Sealed Edict | Free; 1 Inv | **Passive; —** | channelling 2 or more; on the supply |
| 3 | Bear Witness | Passive; — | Passive; — | — |
| 4 | Shoulder the Oath | Reaction; — | **Special; —** | once per round |
| 5 | Verdict | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 6 | Concord | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more; holds while channelling |
| 7 | Final Decree | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Tree-sum 10 → **0**; Passives 2 → 3, Specials 0 → 1.

### 4.2 Power — Command (Black / Red)

**Today:** 9 cards; 0 Passives, 1 Free Action, 3 single Actions, 4 two-Action, 1 three-Action; 9 of 9
cost Investiture — the only fully priced tree — tree-sum 15, the atlas's highest. No Reaction, no
resource generation: Tyrith spends and does not get it back (TREE-INTENT).

**Shape.** Warlord's Advance is exactly its face. Kneel is its face *plus* a standing clause — *"you
have an advantage on attack tests against any Compelled, Disoriented or Weakened character in
Attunement Range"* — which is a passive rider that comes with the entry today and comes with the
path under the supply: it moves onto the Black face's text on the power, unconditional, as it is now.
So **both entry nodes go**: the Black lane roots at Crown of Thorns and Absolute Authority, the Red lane
at Momentum of Victory and Unstoppable Advance. Seven cards. (I-1 (b) keeps Kneel as a node for the
clause's sake.)

**The supply**, on Tyrith's power:

> **Command** — Action · *the god's supply*
> *While channelling Black* — choose a character within Attunement Range and test Black vs. Cognitive.
> On a success the target is Compelled until the start of your next turn; while Compelled it must
> spend its next action moving toward you or doing nothing.
> *While channelling Red* — make a melee weapon attack. On a hit, deal an additional [Tier][Die]
> impact damage. If the attack reduces the target to 0 health, you gain temporary health equal to
> your tier and may move up to 10 feet as a Free Action; if the target survives, you have an advantage
> on Presence tests to intimidate, command or lead against it until the start of your next turn.
> You have an advantage on attack tests against any Compelled, Disoriented or Weakened character
> within Attunement Range.

Events: Kneel's `edha-def-test` → `edha-apply-status {compelled, mark: true}` and its `edha-test-rider`
(the standing advantage, `edha-pre-test`) become the Black face's and the power's; Warlord's Advance's
arm-and-consume pair (`warlord`, with the on-kill and on-survive riders) the Red face's.

**Cost — the arms.** Power is the tree F-4 was written for: three of its nine cards install something
on the disciple for the scene, and the capstone is a fourth. Under the Channel they cost nothing to
cast and *hold while the disciple channels*: the crown stands while the current runs. Nothing keeps an
Investiture cost — no body, no bolt — but the tree's self-tithe stays where it is written (Investiture
of Command's spirit damage), Momentum of Victory keeps its Opportunity (M13), and the four scene
installs take the amount gate at cast.

**Crown of Thorns** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more; an arm.** *"While
channelling 2 or more Black or Red, wear the crown. While you channel Black or Red, when one of your
Black or Red talents tests against a character's Cognitive defense, that character takes spirit
damage equal to your Presence. This damage cannot be reduced."* The `crowned` status ends with the
Channel; the watch rule and the manual ping button are unchanged.

**Absolute Authority** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Black or Red, choose a Compelled, Disoriented or Weakened character within
Attunement Range and test Black vs. Cognitive. On a success you choose the target's action on its next
turn (it cannot be forced to directly harm itself). On a failure the target is Weakened until the end
of its next turn."* Forced volition stays table-run, as declared.

**Momentum of Victory** — Free Action; 1 Investiture and an Opportunity → **Free Action; an
Opportunity.** *"While channelling Black or Red, spend an Opportunity to immediately move up to 15 feet
and make a free melee Strike against a character within reach. The Strike deals additional damage
equal to your tier."*

**Unstoppable Advance** — 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Black or Red:
until the end of your next turn you cannot be Slowed, Immobilized or knocked Prone, and you may move
through enemy spaces. Each enemy whose space you move through takes [Tier][Die] impact damage."*

**Investiture of Command** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more; the
spirit tithe kept (I-3).** *"While channelling 2 or more Black or Red, choose up to three allies within
Attunement Range. Each gains [Tier][Die] temporary health and an advantage on its next attack test. You
take spirit damage equal to your tier, which cannot be reduced."* The first draft made this a release
(it buys into no charge); under the supply it is the crown shared, the flood is its price per use, and
the tithe is the card's own.

**Warlord's Fury** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more; an arm.** *"While
channelling 2 or more Black or Red, arm the fury. While you channel Black or Red, your melee attacks
deal additional damage equal to the number of characters you have reduced below half their maximum
health this scene, to a maximum equal to twice your tier; when you reduce a character to 0 health the
bonus immediately increases by 1, still capped."* The tally persists across a dropped Channel? No —
the `fury` status ends with the Channel and its tally with it (the arm is re-armed at cost of two
Actions, as today it is at 2 Investiture); I-2 (c) offers keeping the tally.

**Mantle of the Aspirant** — the capstone, and the fourth arm. *"He wears the crown not yet given"*:
under F-4 the Mantle holds **while the disciple channels**, not for the scene — the one capstone in
the atlas whose duration is the Channel, and the reason Countercurrent matters to a warlord. **A rider
gated on "channelling 3 or more", once per scene, no Investiture.** *"While channelling 3 or more
Black or Red, take up the Mantle. While you channel Black or Red: you gain +2 to all defenses; your
melee attacks deal additional spirit damage equal to your tier; allies within Attunement Range gain +1
to all tests; and when you take damage you may redirect up to your tier of it to one or more willing
allies within Attunement Range. Once per scene."* (I-2 (b) keeps "for the scene".)

**The frame meeting.** Under Black, Kneel names the forsaken — Isolated for the Draw's Weakened,
which is Absolute Authority's gate, and vital on every warlord's hit; under Red the warlord in the noise
builds heat fastest and spends it on the Red face. Positional; no card.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Kneel | 1 Action; 1 Inv · entry | **the Black face of Command (with the standing advantage); node dropped** | while channelling Black |
| — | Warlord's Advance | 1 Action; 1 Inv · entry | **the Red face of Command; node dropped** | while channelling Red |
| 1 | Crown of Thorns | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more; holds while channelling |
| 2 | Absolute Authority | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 3 | Momentum of Victory | Free; 1 Inv + Opp | **Free; Opportunity** | while channelling |
| 4 | Unstoppable Advance | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 5 | Investiture of Command | 2 Actions; 2 Inv | **2 Actions; —** (tithe kept) | channelling 2 or more |
| 6 | Warlord's Fury | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more; holds while channelling |
| 7 | Mantle of the Aspirant | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene; holds while channelling |

Tree-sum 15 → **0**. The most expensive tree in the atlas becomes a tree that pays only the Channel —
and Tyrith still gets nothing back: no refund passive, so a warlord Draws as the Key demands, which
is the identity TREE-INTENT names.

### 4.3 Sovereignty — Judge (Black / White)

**Today:** 9 cards; 2 Passives, 5 single Actions, 1 two-Action, 1 three-Action; 7 of 9 cost
Investiture, tree-sum 13. White is a pure gate (guide Part 4; items 106 and 108). **Item 106 — the
Decree zone, R-97 (a), a radius that moves with the arbiter — is still open**, and this design changes
what it would be for: under the Channel, Black's forsaken and White's line already give the arbiter a
radius on each side. I-8 hands the item back to the PM to re-scope after this design rather than
building the zone this pass designed around.

**Shape.** Both entries are their faces — Exalt the raising, Censure the lowering — so **the entry nodes
go**: the White lane roots at Sovereign's Favor and Investiture of Authority, the Black lane at Expose
and Decree of Ruin. Seven cards. White stops being a pure gate: it is the face that exalts.

**The supply**, on Verdannis's power:

> **Judge** — Action · *the god's supply*
> *While channelling White* — choose a willing ally within Attunement Range. Until the start of your
> next turn its damage die size increases by one step (maximum d12).
> *While channelling Black* — test Black vs. Cognitive against a character within Attunement Range. On
> a success, until the start of your next turn its damage die size decreases by one step (minimum d4).

Events: Exalt's `edha-die-step {key: exalt}` and Censure's `edha-def-test` → `edha-die-step {key:
censure}` become the faces'; Sovereign's Favor's watch on the `exalt` key and Expose's on `censure,
decree` are unchanged.

**Cost.** No body, no bolt; one creature at a time per judgment. Nothing keeps a cost. The two scene
versions and the two pairs take the amount gate; Sovereign's Balance is repeatable at 2 or more (a
per-round tax, as its 2 was per use).

**Sovereign's Favor** — Passive; — → **unchanged** (an Exalted ally also gains [Tier][Die] temporary
health; does not stack).

**Investiture of Authority** — 1 Action; 2 Investiture · White 3+ → **1 Action; — , gated on 2 or
more; White 3+ kept.** *"While channelling 2 or more Black or White, choose a willing ally within
Attunement Range. For the scene its damage die size increases by one step (maximum d12), replacing any
Exalt of yours on it. Once per ally per scene."*

~~**Expose** — Passive; — → **unchanged** (a Censured character that fails a test refunds 1 Investiture;~~
~~one that fails an attack test gives its target a Reactive Strike). Sovereignty's refund passive, the~~
~~maintain's funding.~~

> **AMENDED 2026-09-19 (the review of the deity atlas against the published Invested families, R-161
> (a) — answered by Ben in chat the same day: the refunds become upkeep).** The second card where
> the cap binds, and the only one of the five whose text this document had paraphrased rather than
> quoted — the amendment states it in full:
>
> **Expose** — Passive; —. *"While you are channelling, when a Censured character fails a test, you
> recover 1 Investiture. You cannot recover more than the Investiture you are channelling this way in
> a round. When a Censured character fails an attack test, its target may make a Reactive Strike
> against it."*
>
> The Reactive Strike half is not gated on channelling. §5.2's "Where the refund passives sit" carries
> the full rule. Item 198's Sovereignty leg builds this text, not the struck one.

**Decree of Ruin** — 1 Action; 2 Investiture · Black 3+ → **1 Action; — , gated on 2 or more; Black 3+
kept.** *"While channelling 2 or more Black or White, test Black vs. Cognitive against a character
within Attunement Range. On a success, for the scene its damage die size decreases by one step
(minimum d4); on a failure the decrease lasts until the start of your next turn. Once per character per
scene."*

**Sovereign's Balance** — 1 Action; 2 Investiture → **1 Action; — , gated on 2 or more.** *"While
channelling 2 or more Black or White, choose one willing ally and one enemy within Attunement Range.
Until the start of your next turn the ally's damage die size increases by one step (maximum d12) and
the enemy's decreases by one step (minimum d4). If the ally hits the enemy this round, both effects
extend by one additional round."*

**Edict of the Fallen** — 2 Actions; 2 Investiture → **2 Actions; — , gated on 2 or more.** *"While
channelling 2 or more Black or White, test Black vs. Spiritual against a character within Attunement
Range. On a success, for the scene its damage die size for attacks decreases by two steps (minimum
d4), and each time it fails an attack test each ally within Attunement Range gains temporary health
equal to your tier. On a failure, decrease its damage die size by one step until the start of your
next turn."*

**Sovereignty** — the capstone: the pair judged for the scene, two steps each way, the enemy's
Reactions denied on every hit. The judgment at its largest; **a rider gated on "channelling 3 or
more", once per scene, no Investiture.** *"While channelling 3 or more Black or White, choose one
willing ally and one enemy within Attunement Range. For the scene the ally's damage die size increases
by two steps (maximum d12) and the enemy's decreases by two steps (minimum d4). Whenever the ally hits
the enemy, the enemy cannot take Reactions until the start of its next turn. Once per scene."*

**The frame meeting.** Under Black, Censure the forsaken — vital on your attacks and the Draw's
Weakened on the creature whose dice you shrank; under White, Exalt an ally in the line — the frame's
deflect beside Sovereign's Favor's temporary health. Positional; no card.

| # | Talent | Today | Proposed | Condition |
|---|---|---|---|---|
| — | Exalt | 1 Action; 1 Inv · entry | **the White face of Judge; node dropped** | while channelling White |
| — | Censure | 1 Action; 1 Inv · entry | **the Black face of Judge; node dropped** | while channelling Black |
| 1 | Sovereign's Favor | Passive; — | Passive; — | — |
| 2 | Investiture of Authority | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 3 | Expose | Passive; — | Passive; — | — |
| 4 | Decree of Ruin | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 5 | Sovereign's Balance | 1 Action; 2 Inv | **1 Action; —** | channelling 2 or more |
| 6 | Edict of the Fallen | 2 Actions; 2 Inv | **2 Actions; —** | channelling 2 or more |
| 7 | Sovereignty | 3 Actions; 3 Inv | **3 Actions; —** | channelling 3 or more; once per scene |

Tree-sum 13 → **0**.

### 4.4 The three trees, together

| | Cards | Costed today → proposed | Tree-sum today → proposed | Arms (hold while channelling) | Faces | Flood |
|---|---|---|---|---|---|---|
| Order | 9 → 7 + supply | 6 → 0 | 10 → 0 | Concord | 2 | 1 |
| Power | 9 → 7 + supply | 9 → 0 | 15 → 0 | Crown of Thorns, Warlord's Fury, the Mantle | 2 | 1 |
| Sovereignty | 9 → 7 + supply | 7 → 0 | 13 → 0 | — | 2 | 1 |

The word keeps no Investiture cost; what it keeps is **duration tied to the Channel** — four arms that
fall when the current does. Power, the fully priced tree, is the one that changes most: from 15
Investiture of pricing and no way to earn it back, to a warlord whose whole kit is the Channel and
whose crown stands exactly as long as he holds it.

### 4.5 Gate 4 — the menu

**I-1. The entry nodes, per tree.** (a) **All three drop both; Kneel's standing advantage moves onto
the Black face's text on Tyrith's power, unconditional as today — recommended.** (b) Power keeps Kneel
as a node for the standing clause; Order and Sovereignty drop both. (c) All keep both.

**I-2. The arms (F-4 (a) applied).** (a) **Crown of Thorns, Warlord's Fury, Concord and the Mantle
hold while the disciple channels either colour; cast at their amount gate, held at any maintain;
their statuses end with the Channel — recommended.** (b) The Mantle keeps "for the scene" (a capstone
that outlasts the Channel); the other three as (a). (c) As (a), but Warlord's Fury's tally survives a
dropped Channel and resumes on the next arm.

**I-3. Investiture of Command.** (a) **A rider gated on 2 or more, the spirit tithe kept —
recommended** (the crown shared; the flood is its price per use). (b) A rite at 2 Investiture, tithe
kept (the first draft's reading: it buys into no charge).

**I-4. Momentum of Victory.** (a) **Opportunity only, the Investiture dropped — recommended** (M13:
the Opportunity is the card's identity). (b) Opportunity and 1 Investiture kept.

**I-5. Sealed Edict.** (a) **A Passive on the supply, gated on 2 or more, Blue 3+ kept —
recommended** (H-9's shape). (b) Free Action and 1 Investiture kept.

**I-6. The capstones, per tree.** (a) **Final Decree, the Mantle and Sovereignty on the flood, once
per scene — recommended** (a law spoken, a crown taken up, a judgment made; each is the charge at
its largest). (b) All three rites at 3. (c) The Mantle a rite; the other two on the flood.

**I-7. Sovereign's Balance.** (a) **Gated on 2 or more — recommended** (a per-round tax on the pair,
as its 2 was per use). (b) Gated on 1.

**I-8. Item 106, the Decree zone.** (a) **Handed back to the PM to re-scope after this design — the
Channel's two frames already give the arbiter a radius on each side, and a third square would be the
duplication R-97's critique warned of — recommended.** (b) Build it as designed, unchanged by this
pass. (c) Drop it: the frames are the Decree.

**I-9. The three supplies' names.** (a) **Declare, Command, Judge — recommended.** (b) Ben's own.

> **Answered at gate 4 (Ben, chat, 2026-09-17):** *"looks good"* — **I-1 … I-9 (a).** §4 committed on
> that answer.

---

## 5. The mix, against the bands

Everything below is counted from the approved tables in §2 – §4 (72 talents across ten trees, plus
ten supplies with twenty faces) against the atlas as read from the ten authored files at `main`
`919bdf9` (90 talents). The supplies are **reported beside the talents, not inside them** (J-5): a
supply is the god's `power` action, as the Channel is the colour's, and the published measurement
(`talent-comparison` §C) counts talents and leaves Burn and the surge out of the mix.

### 5.1 Action type

| | n | Passive | Special | 1 Action | 2 Actions | 3 Actions | Free | Reaction | Passive + Special |
|---|---|---|---|---|---|---|---|---|---|
| **Deity today** | 90 | 13 (14 %) | 0 | 34 (38 %) | 21 (23 %) | 10 (11 %) | 7 (8 %) | 5 (6 %) | **14 %** |
| **Deity proposed** | 72 | 21 (29 %) | 5 (7 %) | 14 (19 %) | 21 (29 %) | 10 (14 %) | 1 (1 %) | 0 | **36 %** |
| + the supplies' faces | 20 | — | — | 18 | — | — | 2 | — | — |
| published Invested band (§C.1) | | 29 – 50 | 37 – 41 | 5 – 13 | 0 – 10 | 0 – 1 | 3 – 8 | 0 – 7 | 71 – 87 |
| deity guide target (superseded, F-7) | | 25 – 30 | 15 – 20 | 25 – 35 | 15 – 25 | capstones | 10 – 15 | ~10 | |

*(The comparison's Appendix counted today's Passives at 16 % from `all-talents.json`; the authored
files read 13 of 90. The difference is Walking Ruin, a Free-Action toggle the source lists as a
Passive, and two rounding rows; nothing turns on it.)*

Read against the bands:

- **Passive + Special rises from 14 % to 36 %** and stays far outside the published 71 – 87 %. That is
  by design and this pass does not chase it: the deity atlas is built of two-Action installs on a
  charge — 29 % two-Action cards, against Radiant's 10 % as the published high mark — and the supply
  now carries the atlas's eighteen most-used Actions off the talent list entirely. What the published
  families do with passives, a deity tree does with the faces of its supply.
- **Reactions fall from five to none.** Every deity Reaction was a modifier that rolled no test
  (Shatter Focus, Hexmark, Combustion Chain, Bonds of Community, Shoulder the Oath), and all five are
  Specials with "Once per round." — the leyline rule 3, and the reason the deity's one-slot Reaction
  economy stops competing with the leyline colours' answers.
- **Specials go from 0 to 5 (7 %).** F-7 (a) restated R-108's target to ~10 – 15 %, expecting the
  armed-strike shape (Withering Touch, Predatory Strike, Warlord's Advance) to add three; under Shape S
  those three became *faces* of their supplies instead — Actions on the power, not Specials on the
  list. The measured result is 7 %, all from rule 3. J-2 restates the target to what the rules
  produced rather than retyping an Action to reach a number.
- **Free Actions fall from seven to one.** Four were upgrade riders on a placement (Sealed Edict,
  Inevitable Snare, Pinpoint Charge — now Passives on the supply — and Walking Ruin, already a
  passive toggle); two were the White faces of Ordain and Build and moved onto the supplies as Free
  faces; one, Momentum of Victory, stays a Free Action on its Opportunity.
- **Three-Action cards are exactly the ten capstones** (14 % of a smaller list), as today.

### 5.2 Cost

| | Costed talents | Of which | Investiture sum | Amount-gated ("2 or more") | Flood-gated ("3 or more") |
|---|---|---|---|---|---|
| **Deity today** | 72 of 90 (80 %) | 1: 34 · 2: 28 · 3: 9 · 4: 1 | **121** | — | — |
| **Deity proposed** | 5 of 72 (7 %) + 5 costed faces | Fault Line 2 · Risen Servant 1 (+ a Remain) · Death Ward 2 · Speak with the Fallen 2 · Raise Dead 4 · the five costed faces — Place Omen (Blue), Tend (Blue), Tend (Green), Pyre, Forge Construct — 1 each | **16** | 26 | 9 |
| published Invested band (§C.2) | 8 – 46 % | | | | |
| leyline after its passes (White / Blue / Red / Black / Green) | 16 / 28 / 20 / 20 / 16 % | | 1 / 7 / 6 / 6 / 6 | | |

Per tree, today → proposed: Chaos 14 → 1 · Knowledge 10 → 0 · Life 13 → 2 · Fate 11 → 0 ·
Destruction 10 → 3 · Civilization 11 → 1 · Death 14 → 9 · Order 10 → 0 · Power 15 → 0 ·
Sovereignty 13 → 0. *(The tree-sums fold in each tree's costed faces, as §2.5, §3.5 and each tree's
close already do — which is why Civilization prints 1 with no costed talent at all; the costed-**card**
count beside them is talents only, per J-5. The two amendments of 2026-09-19 move Chaos 0 → 1 and
Life 0 → 2 (both Tend faces, R-160 (a) and (d)), and the sum 13 → 16.)*

Read against the bands:

- **Costed falls from 80 % to 7 %, below the published floor** (Metalborn paths, 8 %). The floor is
  not a target: what the published families price is a *base action* (Burn, Store, the surge) and
  the talents ride it, and the deity atlas now has exactly that shape — the Channel is the cost, at 1
  to 3 a round, and the **ten** priced cards are the two bolts, the two bodies, the three rites and
  the three unbounded repeatables that balance keeps — five of the ten are faces, five are talents
  (J-3 asks whether to accept the floor crossing; the recommendation does). **The 7 % is talents
  only**, which is the denominator J-3's floor argument uses; counted with the faces it is 10 of 91,
  or 11.0 %, which is *above* the published 8 % floor — worth saying, because R-160 states the
  faces-included figure and the two are easy to read as contradicting each other. **§7.1's gate-3 row
  ("Costed faces: Pyre and Forge Construct at 1") and gate-5 row ("+ two costed faces … 125 → 13") are
  superseded** by R-160 (a) and left unedited, as the gate log is the record of the day.
- **The Investiture sum falls from 121 to 16**, against 26 across the five leyline colours after their
  passes. What replaces it is not free: **26 cards gate on "channelling 2 or more"** — a Draw a round
  at levels 1 – 5 — and **nine capstones on "3 or more"**, reachable at rank 3. §2.1's two facts hold
  across the atlas: on the fourteen scene-long cards the gate is a one-time price equal to today's
  cost; on the twelve repeatable ones it is a per-round tax.
- **Where the refund passives sit — and what they now are.** Five trees carry a passive that pays
  Investiture back on a trigger: Void Sense (Chaos), Accumulate (Knowledge), Prognosis (Life),
  Reaper's Harvest (Death), Expose (Sovereignty). **Under R-161 (a) (2026-09-19) all five are upkeep,
  not income.** This is the rule the five amendment blocks in §2 – §4 point at, and the one card tail
  they share:

  > *"While you are channelling, [trigger], you recover 1 Investiture. You cannot recover more than
  > the Investiture you are channelling this way in a round."*

  It uses the term `channel-actions.md` §1.1 already defines — *the Investiture you are channelling*
  is what you spent to open or maintain this round — so it needs no new vocabulary, and one engine
  field reads a number the Channel status already stores. A refund can fund the maintain it is named
  for and nothing past it, and no disciple banks pool between Channels. **Why the pass's reading had
  to change:** every published Invested pool refills once — the Allomantic and Radiant pools at scene
  start, a metalmind from downtime storing (`talent-comparison-mistborn-radiant.md` §C.2) — while an
  Edha disciple has in-combat Draw Mana *and* a trigger refund *and*, under the Channel, riders that
  cost nothing.
  **Where the cap actually binds.** Void Sense, Accumulate and Prognosis already read "once per
  round", so their refund is 1 and the round's channel spend is at least 1 whenever a Channel is up:
  on those three the cap is inert and only the channelling clause changes anything. **Reaper's Harvest
  and Expose carry no per-round limit**, and they are where the leak lived — a bloody round, or a
  Censured creature failing three tests, paid three times before and pays once now. The uniform
  sentence is carried on all five anyway, as one principle and one field, so a later card cannot
  reopen it. Both keep their non-Investiture halves ungated: the Remain is marked whether or not
  Morrath channels, and Expose's Reactive Strike stands.
  **One edge for item 198 to state rather than discover.** The gate and the cap can disagree. A
  Channel opened at 2 on round 1 is still up on round 2 even if that round's maintain is skipped, so
  "while you are channelling" is satisfied while the round's channelled Investiture is 0 and the cap
  pays nothing. That is defensible — no upkeep paid, no upkeep refunded — but it is bench-visible, and
  the engine's stored `channelled` number holds the last payment rather than this round's, so the
  build must decide which the card means. None of §5.3's three walks hits it; all three maintain
  every round.
  **The scope of this rule, stated rather than inferred.** It binds the five deity passives above.
  The live data carries three more Investiture-granting cards, all leyline: `Predatory Patience` and
  `Predator's Due` (Black) have neither a gate nor a cap and are a **larger** hole than the one
  closed here — **R-163 (a)**, answered by Ben in chat the same day: both take this rule, and
  `channel-black.md` §1.5 and its bench row CK-14 are amended to match (CK-14's expected result becomes
  +1, the Channel ran level). Predatory Patience was the largest free-pool source in the game, because
  the Black Key's Draw rider Weakens the field ungated (M10), so a mage with no Channel open could
  bank +4 in a round. `Flashpoint` (Red) is **exempt**: capped once
  a round, one of two options, and reachable only through costed releases, so it is a discount rather
  than income. The heroic atlas grants no Investiture at all.
  Five trees have no refund at all: Fate, Destruction, Civilization, Order and Power Draw as their
  attunement demands. That asymmetry is old (it is the same five today), and the cap narrows it rather
  than closing it: item 210's yardstick should still price the two groups separately, and its question
  is now whether a capped refund still funds the maintain it is named for.
- **A measurement the pass printed wrong, corrected here.** The headline "Investiture sum 125" was
  **121** in the data all along: `data/domain.json` at 90 records gives 72 costed and a sum of 121,
  and all three of the pass's own component lists agree with it — the cost-tier breakdown in the table
  above (34 + 56 + 27 + 4), the per-tree list, and §1's tree-sum list. Only the headline disagreed.
  The reference sections now read 121; §7.1's gate-5 row keeps 125 as the record of the day.

### 5.3 What a deity player's turn is now

Three turns, one per gate group, each at level 4 (pool 4, both colours at 2, a Draw of 2).

**A disciple of Maelith, attuned to Blue.** Round 1: Channel Blue at 1 (the reading on the enemy who
matters), Place Omen on it (a Blue test, an Omen, [Tier][Die] spirit; Spreading Omen puts a second on
its neighbour), one Action spare. Round 2: maintain at 1, Draw Mana as a Blue mage (advantage on the
next Cognitive test), Place Omen again with it, and Shatter Focus as a Special when the read creature
rolls. Round 3: the line closes — maintain at 2 (the flood), switch is not needed: Cascade Collapse
on every bearer. Spent by round three: **6** — 1 + 1 to open and place, 1 + 1 to maintain and place
again, 2 to flood — of which 2 are the two Place Omens under R-160 (a); refunded 2 by the Draw and up
to 2 by Void Sense, **for a net 2**. Today the same plays cost 1 + 1 + 1 + 1 + 2 = 6 against a pool of
4 with no refund but Void Sense, which is why the ecosystem review found the Chaos loop sealed.
**Pricing the Blue face takes the gross saving away** — six against six — so the comparison is no
longer "fewer points" but what the six buys: a frame under every play, a Draw that covers the
maintain, and a refund that now pays only while the Channel is up. Chaos is the one walk where
amendment A bites this hard, because its supply is the play it makes every round.

**A disciple of Morrath, attuned to Green.** Round 1: Channel Black at 1 (the forsaken: the enemy she
means to wither), Wither it (a melee hit, +[Tier][Die] + Willpower vital, no healing), one Action
spare. Round 2: maintain, Draw Mana as a Green mage (terrain laid; the forsaken is Isolated and takes
the frame's vital on every hit), Consuming Decay on the forsaken at the flood (maintain at 2 instead:
2 for the round). Round 3: an ally's kill in range pays Reaper's Harvest 1 Investiture and a Remain;
Risen Servant for 1 Investiture and the Remain. Spent by round three: 1 + 2 + 1 + 1 = 5, refunded 2 by
the Draw and 1 by the Harvest — **and under R-161 (a) that Harvest point lands only because she is
still channelling when the ally's kill happens**, capped at the 1 she is channelling; the Remain is
marked either way. Wither's face is free, so amendment A does not touch this walk. Today: 1 + 2 + 1 = 4 for fewer effects, with no frame and a pool that
cannot Draw fast enough to Decay *and* raise.

**A disciple of Tyrith, attuned to Black.** Round 1: Channel Red at 1 (the heat), Command under
Red — Warlord's Advance, +[Tier][Die] impact and +1 energy from the heat — one Action spare.
Round 2: maintain at 2, Crown of Thorns (the crown stands while the current runs), Draw Mana as a
Black mage. Round 3: maintain at 1 — the crown holds at any maintain — switch to Black? No: stay in
the noise; Unstoppable Advance through the line, every trampled enemy paying the crown nothing (it
tests nothing) and the sword carrying heat. Spent by round three: 1 + 2 + 1 = 4, refunded 2. Today the
same plays cost 1 + 2 + 1 = 4 with no Channel beneath them and, for Power, no refund anywhere — the
warlord still gets nothing back, and now that is a choice the tree makes rather than a hole. Neither
amendment of 2026-09-19 touches this walk: Command's two faces are free (one is a weapon Strike, the
other places a condition on one creature), and Power has no refund passive to cap.

### 5.4 What item 210's yardstick should price first

Four rows, the deity atlas's own, before the leyline rows it already carries — **five since
2026-09-19**; row 1 is rewritten and row 5 is new, both from R-160 (a) and R-161 (a). J-4 (a)'s "the
four rows of §5.4, in that order" is the record of the day and is left unedited; the order below is
unchanged and the new row is appended.

1. **Life's priced Green face** — a [Tier][Die] + Awareness heal at 1 Investiture a cast while
   channelling Green, stacked with the home ground's tick, Prognosis's extra die and Overgrowth's
   armor, against the party's damage intake. G-3 (b) was taken on 2026-09-19 (R-160 (a)), so the
   question is no longer whether to price it but whether **1 is enough of a brake**: at level 4 the
   healer runs one heal a round at net zero (maintain 1 + heal 1 out, Draw 2 in) and pays only for
   burst, and the binding constraint moves from Investiture to Actions. **R-160 (d) was taken the same
   day**, so Tend's Blue face costs 1 as well and Life is the only tree paying on both faces of its
   supply — which makes this row a two-sided measurement: whether 1 is brake enough on the heal, and
   whether a healer paying on the diagnosis *and* the heal can still open a fight on a pool of 4.
2. **The flood detonations** — Cascade Collapse and Cascading Failure at "2 or more", repeatable, and
   the nine flood-gated capstones at rank 3 — priced as a per-round tax against today's per-use 2.
3. **Knowledge's stacked pack** — Pack Share (+tier) and The Pack (+Insight) on every ally's hit against
   the quarry at a flood, with the Red face's heat on the disciple's own; the one place the atlas
   multiplies.
4. **The arms held for a point a round** — Crown of Thorns, Warlord's Fury and the Mantle on a Power
   disciple maintaining at 1, against the leyline mage's one frame for the same point; and the
   counter-case, a refused maintain dropping all three.
5. **The refund passives as upkeep** (R-161 (a), added 2026-09-19) — Void Sense, Accumulate and
   Prognosis at 1 a round against a one-point maintain, and Reaper's Harvest and Expose in a bloody
   round or against a Censured creature failing repeatedly, both now capped to the round's channel
   spend. The measurement nobody has made is whether a capped refund still funds the maintain it is
   named for, and how the five refund trees then sit against the five that Draw instead. It now also
   covers the two leyline Black cards (**R-163 (a)**), whose refunds were the larger hole. **R-162**
   was answered **(b), unchanged** — arms end with the Channel, buildings persist — so this row should
   still price a flooded scene-long install against a maintained one, since that measurement is what
   would re-open it.

### 5.5 Gate 5 — the menu

**J-1. The deity guide's action-type table.** (a) **Restated to the measured proposed mix — Passive
~30 %, Special ~5 – 10 %, single Action ~20 %, two Actions ~30 %, three Actions one per tree, Free ≤
5 %, Reaction 0 % (modifiers are Specials) — with the supply reported beside it and the sentence "a
deity tree's most-used Actions are the faces of its supply, not talents" — recommended** (F-7 (a)
already supersedes the old table; this is what replaces it). (b) Keep the old targets as an
aspiration beside the measured row. (c) No table; the guide points here.

**J-2. R-108's Special target, corrected.** (a) **Restated to ~5 – 10 %, reached by rule 3 alone; the
three armed strikes became faces, not Specials — recommended** (F-7 (a) said 10 – 15 % expecting them;
the measured 7 % is the honest number). (b) Keep 10 – 15 % and retype one standalone Action per tree at
the build. (c) Leave the target unstated.

**J-3. The costed floor.** (a) **Accept 7 %, below the published 8 – 46 %: the Channel is the cost, and
the seven priced cards are the ones balance keeps — recommended.** (b) Restore 1 Investiture on one
face per tree so every tree prices something. (c) Restore the capstones' 3.

**J-4. Item 210's deity rows.** (a) **The four rows of §5.4, in that order, before the leyline rows —
recommended.** (b) The PM's own order.

**J-5. The supplies in the mix.** (a) **Reported beside the talents, not inside them (a supply is a
`power` action, as the Channel is) — recommended.** (b) Counted as twenty Actions on the talent list.

> **Answered at gate 5 (Ben, chat, 2026-09-17):** *"defaults"* — **J-1 … J-5 (a).** §5 committed on that
> answer.

---

## 6. The build notes

What item 198's deity leg builds, named from what exists — `ENGINE_INDEX.md`, the authored `events`
read at `919bdf9`, and the parent design's §4 (the five powers, the `channel<colour>` statuses, the
`edha-channel` event, Widenings A – I) plus the four colour legs' J – O. Every widening below is a
field or a watcher on an existing primitive, lettered on from **P** so the PM can size the leg beside
the others; nothing is a bespoke subsystem (iron rule 2a) and **no code or data changes in this pass**.
Deploy class of the whole leg: **ENGINE + DATA — REBUILD deity (and one word in the leyline pack, the
Countercurrent card) + ⟳ Sync Talents, at 3.x only**, after item 187's flip; at 2.1.0 nothing here
exists and nothing here breaks.

### 6.1 The data shape — ten powers, nineteen faces

> **Count corrected 2026-09-19.** This document prints "twenty faces" here, in §5's preamble and in
> §7.3. The atlas has **nineteen**: nine gods carry two faces and Death carries one, because H-1 (a)
> kept Reaper's Harvest as a node rather than making it the Green face (§3.4). Counting the entry rows
> in §2 – §4 gives 19 — seventeen Actions and two Free (Ordained Ground and Lay Foundation) — against
> the 20 / 18 / 2 printed in §5.1. The numbers in this section are stated on 19; the gate log keeps
> what it recorded on the day. Item 198 should build nineteen.

**Ten `power` items in the deity pack**, one per god, built beside the five colour powers
(`channelPowerDoc`'s shape, B-1): `system.type: "deity"` (a second registered power type beside
`leyline`), `system.talentTree` the god's tree UUID (the Talents tab lists the seven or eight
riders), `system.description` the supply's paragraph from §2 – §4, and **two embedded actions, one
per face** — not one action with a picker (K-1). Two actions is what makes the approved tables
buildable without a widening: a face keeps its own action type (Ordain's White face is `fre`, its
Green face `act`) and its own consumption row (**five** faces carry `{resource: "inv", value: {min: 1,
max: 1}}` — Place Omen's Blue, **both** of Tend's, Pyre and Forge Construct; the last two from the
pass, Place Omen's Blue and Tend's Green from R-160 (a) and Tend's Blue from R-160 (d), both answered
2026-09-19 — **and the other fourteen carry none**), and each is gated on its colour by
the field the leyline riders already use — `requireSelfStatus: "channelblue"` on the face's rules,
refused before cost by the pre-cost veto (Widening F (ii)) with the toast naming the colour. On the
Actions tab the disciple sees *Place Omen (Blue)* and *Place Omen (Black)* under Maelith's name; the
card is one card. Kneel's standing advantage is a third rule on Tyrith's power, ungated
(`edha-test-rider`, as on the talent today). Death's power carries one action.

**The faces are authored where the entries are today (K-3).** The twenty entry records stay in
`data/domain.json` and the ten `deity-*.json` overlays — same seven keys, same `events`, same
Foundry round-trip through extract — with one new record field, `face: "<colour>"`, that
`foundry-build.js` reads to emit the record as an embedded action on the god's power instead of a
talent (the way `drawManaItemDoc` builds an action). Lint pass 1 keeps seeing seven keys; the
Events tab in Foundry shows the face's rules on the power. The deity **`path`** item's `pathEvents`
gains a `grant-items` rule for the god's power (today it grants nothing: `pathEvents` grants a Key
only where `tree.keyUuid` exists, `foundry-build.js:408-423`), so taking the path in play delivers the
supply the way a leyline path delivers Draw Mana.

**The graph.** With the entry nodes gone, every `connections` entry naming an entry is removed and
the card's `prerequisites` string becomes the path's gate (`Blue 2+; Black 2+`), which the build
already renders as a rank requirement; Death's Green-lane cards keep `["Reaper's Harvest"]`.
`validate.js`'s DAG and reachability sweeps pass on prereq-free roots; `tests/pipeline.test.js`'s
regression case for the historic Death cycle is re-read at the build (it names Death cards that
survive). **Hallowed Ground** is one new record in `data/domain.json` and `deity-fate.json`
(`connections: ["Bulwark Ground"]`), with the placeholder name until Ben names it.

**Attunement and the colour powers (F-5, F-6 — K-4).** The five leyline `path` items stay and become
the attunements: they keep their two grants (the Key talent — whose `edha-draw-mana` rule *is* the
rider — and Draw Mana) and drop nothing; the wizard's leyline step is retitled *Attunement* and its
intro says what it grants. The colour **`power`** is granted by rank: one actor-update watcher on
`system.skills.<colour>.rank` crossing 0 → 1 grants the colour's power (`edhaCleanPackCopy`, the
mandatory pack→actor path) and 1 → 0 removes it (**Widening P**); the wizard's skill stepper writes
ranks, so the grant fires at creation without the wizard knowing. The leyline path's tree link moves
to the power (`system.talentTree`), which is where 3.1.0 lists the tree anyway; the Key talent stays a
talent so `edha-draw-mana` keeps its document. The player-facing consequence — a colour's tree opens
at rank 1 without a path pick — is already true of the data and becomes true of the sheet.

### 6.2 The rider gate — one field, or one flag

Every rider in §2 – §4 needs "while channelling A or B", and twenty-six of them "2 or more". The
leyline legs gate **per rule**: `requireSelfStatus` (and `requireChannelled`, Widening H) declared on
each handler type a rider uses — twenty-two declarations across the five colours, read at six
dispatch sites (Widening F). The deity riders use **seventeen handler types outside that set**
(`edha-reroll-react`, `edha-owner-list`, `edha-reveal`, `edha-overflow-thp`, `edha-mutation`,
`edha-regen-grant`, `edha-marker-command`, `edha-zone`, `edha-snare-react`, `edha-detonate-list`,
`edha-summon-effect`, `edha-summon`, `edha-turn-dot`, `edha-self-status`, `edha-decree`,
`edha-adv-attack`, `edha-die-step`), which per-rule would mean seventeen more declarations and a
schema test row each.

**The recommendation (K-2 (a)) is an item-level gate instead:** `flags.edha-content.requireChannel:
"blue,black"` and `requireChannelled: 2` on the *talent* (or the face action), read by the same six
sites through the rule's parent item — one declaration, no per-type schema work, and a card's rules
gate together, which is what every card in this document assumes. It is a **Widening Q** on
Widening F: the six return filters and the pre-cost veto check the item's flag before the rule's
field. Item 198 has not built the leyline legs yet, so the builder can adopt the flag for all fifteen
trees and let the twenty-two per-rule declarations lapse — or keep both, the rule's field winning
where set. That is the builder's call and the PM should carry it into item 198's brief; nothing in
the card text depends on which. The "A or B" reading is the comma-list: any listed status satisfies.

### 6.3 The widenings, lettered on

| # | Widening | On | For | Consumers |
|---|---|---|---|---|
| P | rank-granted powers: an actor-update watcher grants / removes a colour's `power` at rank 1 / 0 | a new watcher beside the talent-budget hooks (`22-talent-budget.js`) | F-5, F-6 | every colour, every character |
| Q | `requireChannel` / `requireChannelled` as item flags, read by the six Widening-F sites through the parent item | `edhaWatchersOfRule`, `edhaRulesForEvent`, `edhaActorRulesOf`, `edhaActorRuleOf`, the pre-cost veto, the Draw dispatcher | every rider in §2 – §4 | 72 riders + 20 faces |
| R | `whenItemFlag: "face"` on H8 `edha-watch {watch: test}` — a test rolled by the owner's supply | `edha-watch` (`53-…js:590`) | Spreading Omen (a second placement on Place Omen's success; the Crown of Thorns shape, narrowed to the supply) | Chaos |
| S | `endWithChannel: true` on `edha-self-status` — the status ends when neither of the owner's named channel statuses remains (checked after Widening C's arm-then-clear order, so a colour switch holds it) | `edha-self-status` (`53-…js:2241`) | F-4 (a): Necrotic Cascade, Crown of Thorns, Warlord's Fury, Concord, the Mantle | Death, Power, Order |
| T | `lists: ["ordained"]` on the home-ground tick (Widening N, `edha-content.home`) — the turn-start regen also reads the owner's Ordained Ground squares while `channelgreen` | Green's Region tick (`50-green-territory.js`) | Hallowed Ground | Fate |
| U | `power` as a source for `edhaColorRank`'s adversary fallback — a block that embeds a god's power supplies at role rank | `35-…js` `edhaColorRank` | R-137: deity-treed adversaries | the bestiary (item 121) |
| **V** | **`capToChannelled: true` on the resource-gain branch of `edha-triggered-effect`** — a refund pays only while the owner carries a channel status, and a **per-round accumulator** keyed to the owner caps the round's total refunds at the channelled number. New because Widening H's `requireChannelled` is a *minimum* on a use, not a running budget on gains; built once as a shared budget with a round reset beside the existing per-round resets, never per handler (iron rule 2a) | `33-triggered-effect-resolution.js` (the resource half, ~line 163–200) | **R-161 (a)**: Void Sense, Accumulate, Prognosis, Reaper's Harvest, Expose | Chaos, Knowledge, Life, Death, Sovereignty |

Widenings the deity leg **reuses without change**: A (`recordSpend` — the amount gate reads it), C
(`exclusiveWith` — one Channel), E (`edha-channel` — no deity consumer; the supply is an Action, F-1
(a)), H (`requireChannelled` — a minimum on a *use*, which is why the refund cap needs V rather than
H), L (`boundToStatus` — the forsaken's ledger;
Chaos's Omens are *not* bound to the Channel, they are the charge), M / N (the home ground, which T
extends). **G (the channel-rider ActiveEffect) has one deity consumer:** Covenant's +1 defenses AE
stays on the face's rules as today (it is the charge's, not the Channel's) — no G.

### 6.4 What moves in the data, per file

- **`data/domain.json`** — 20 records gain `face`; 70 records lose the "Spend N Investiture and"
  opening and gain the "While channelling …" head per §2 – §4; `cost` → `—` on 65 of them, `1
  Investiture` stays on Risen Servant (with the Remain), `2` on Fault Line, Death Ward and Speak with
  the Fallen, `4` on Raise Dead; `action` moves on nine cards (five Reactions → Special, Spreading
  Omen / Pack Share / The Pack / Sealed Edict / Inevitable Snare / Pinpoint Charge → Passive);
  `connections` and `prerequisites` per §6.1; one new record (Hallowed Ground). "Vital" → "vital" on
  seven cards.
- **`data/authored/deity-*.json`** — the same sentences in `description`; `activation.cost.type` per
  the type moves; the Investiture `consume` row removed on 65 cards and on 14 faces (five faces keep
  theirs, R-160 (a) and (d)); the
  `requireChannel` flag (Q) on 72 riders, `requireChannelled: 2` on 26, `: 3` on 9; `capToChannelled`
  (V) on the five refund passives' resource-gain rules; `endWithChannel`
  on five arms; Spreading Omen's second placement re-hung on R; Pack Share's and The Pack's
  `packsight` / `packmind` arms and their `use` cards retired (the damage bonus and the public reveal
  gate on the Channel); Necrotic Cascade's arm keeps its status (S ends it).
- **`data/authored/leyline-blue.json`** — Countercurrent's trigger loses the word *leyline* (F-10; one
  sentence, in item 198's Blue leg).
- **`scripts/foundry-build.js`** — `face` → embedded action on the god's power; the deity `path`
  grants the power; the ten powers from a `data/supplies.json`-shaped source or from the records
  themselves (K-3 (a): the records).
- **Validators and tests** — `validate-packs.js` already learns `power` in the White leg;
  `docs/analysis/talent-ecosystem/deity-gate-audit.js` learns that a face pays its colour (a Green
  face is a Green test or die for the audit's three channels); `validate-build.py` reads the path gate
  where an entry prereq stood; `tests/handler-schemas.test.js` gains Q's flag rule or the seventeen
  declarations; `tests/pipeline.test.js`'s Death-cycle case re-read; a `tests/supply.test.js` pinning
  the two-face veto, the rank grant and removal (P), the arm's end with the Channel (S), and the
  item-level gate (Q) — mutation-verified.
- **Docs the build carries** (iron rule 5): the deity guide — Parts 1 – 2 and the cost scale replaced
  by §1's model and §5's measured table (F-7, J-1); `ENGINE_INDEX.md` (P – U, the second power type);
  `TREE-INTENT.md`'s ten deity lanes (the entries are faces); the player primer and one-pager ("2
  ranks in each colour" stays; "devotion unlocks in play" now grants the supply); `EDHA_TALENT_HANDBOOK.md`;
  the ten deity section headers in the engine (rule 3's ledger); `EDHA_RULINGS.md` R-108 and R-151
  post-design lines (item 212's done-when).

### 6.5 The bench rows

All **🤖** — an agent drives every one on the Route A 3.1.0 copy (K-6); nothing here is Ben's
judgment. Written to be added as a `## Supply — item 198` block under each god's existing `# BENCH —
<god> (deity)` section when the leg lands, after the shared rows.

**Shared (under `# BENCH — Engine-wide`):**

| Row | Drive | Evidence |
|---|---|---|
| DS-1 rank grant | a PC at Blue 0 gains Blue 1 in the skill stepper | the Blue power appears with Channel Blue on the Actions tab; at Blue 0 again it is gone |
| DS-2 attunement | the wizard's Attunement step, Blue | the Blue Key and Draw Mana granted; no Blue power until a rank |
| DS-3 the path | drag a deity path onto a PC at 2+ / 2+ | the god's power with both face actions; the tree on its Talents tab |
| DS-4 the face gate | Channel Black; use the Blue face | refused before cost with a toast naming Blue; the Black face fires |
| DS-5 no Channel | no Channel; use either face | both refused before cost |
| DS-6 the item gate | a rider flagged `2` while channelling 1, then 2 | refused, then fires; nothing spent either way |
| DS-7 the arm | Crown of Thorns at 2; maintain at 1; skip a maintain | the crown holds at 1; ends at the end of the mage's next turn when unpaid |
| DS-8 the switch | crowned under Red; Channel Black | the crown holds (Widening S after C's order) |
| DS-9 Countercurrent | a Blue rival refuses a maintain of a crowned warlord | the Channel fails; the crown and the fury fall |
| DS-10 adversary | a rival block embedding a god's power | supplies at role rank 2; a minion must open a Channel first |

**Per god (one block each; the rows name the tree's own checks):**

| Row | Drive | Evidence |
|---|---|---|
| DS-C1 Chaos | Place Omen under Blue on the read enemy; Spreading Omen owned | **1 Investiture spent**; an Omen on it and one within 10 ft (R); Shatter Focus offers as a Special on its next test |
| DS-C2 Chaos | Unravel at 3 with a forsaken bearer | the forsaken takes the vital branch, the rest spirit + Disoriented; once per scene refused after |
| DS-K1 Knowledge | Study under Green then Red on one creature | 2 Insight, then the hit at +[Tier][Die] + tier and 1 more; Pack Share's ally bonus on an ally's hit with no arm card |
| DS-K2 Knowledge | The Pack at 1, then at 2 | refused, then the ally's hit carries +Insight |
| DS-L1 Life | Tend under Green with an empty pool, then with 1 Investiture; then Tend under **Blue** with an empty pool | each refused before cost with the toast naming the cost (the pre-cost veto, §6.1); at 1 the heal lands and the point is spent. Life is the only supply paying on both faces (R-160 (a) + (d)) |
| DS-L3 Life | Prognosis owned, channelling Green at 1, the Diagnosed hit twice in one round; then again with no Channel up | 1 Investiture refunded, not 2; nothing refunded at all with no Channel (V) |
| DS-L2 Life | Apex Form at 2, then 3 | refused, then the scene grant; the Injury at scene end |
| DS-F1 Fate | Ordain under White (Free) and under Green (Action) | an Ordained square, then a Snare; Inevitable Snare only at 2 |
| DS-F2 Fate | Hallowed Ground; an ally starts its turn on an Ordained square while channelling Green 2 | +2 health (T); none while channelling White |
| DS-D1 Destruction | Set under Red | 1 Investiture spent; the Pyre hit carries the heat |
| DS-D2 Destruction | Fault Line with no Channel | fires at 2 Investiture (a release) |
| DS-V1 Civilization | Build under Red twice (forge, reforge after a kill) | 1 Investiture each; one Construct at a time |
| DS-V2 Civilization | Build under White | a Foundation, no cost, cap tier |
| DS-M1 Death | Wither under Black on the forsaken; Draw as a Green attunement | +vital and no healing on the hit; the forsaken Weakened by the Draw? **no** — a Green Draw lays terrain; the Weakened pulse is Black's attunement only |
| DS-M2 Death | Risen Servant with a Remain; Death Ward with no Channel | 1 Investiture + the Remain; the Ward at 2, no Channel needed |
| DS-M3 Death | Necrotic Cascade armed; drop the Channel | the `cascadearmed` status ends (S) |
| DS-O1 Order | Declare under Blue then White | an Edict, then a Covenant with its +1 AE; Sealed Edict only at 2 |
| DS-O2 Order | Concord at 2; maintain at 1; an ally's first hit | +Presence on the hit; the Concord holds at 1 |
| DS-P1 Power | Command under Black (Kneel) and under Red (the melee hit) | Compelled; then +[Tier][Die] impact with the heat; the standing advantage against the Compelled |
| DS-P2 Power | the Mantle at 3; maintain at 1; become Unconscious | the Mantle holds at 1; ends with the Channel |
| DS-S1 Sovereignty | Judge under White then Black | the ally's die up; the enemy's down on a success; Sovereign's Favor's temporary health on the Exalt |
| DS-S2 Sovereignty | Sovereign's Balance at 1, then 2 | refused, then the pair |

Thirty-three rows since 2026-09-19 (DS-L1 split in two by R-160 (a) and R-161 (a), and widened again
by R-160 (d); §7.1's gate-6 row
and K-6 keep "thirty-two" as the record of the day); the two DS-M1 clauses are one row because the
Draw's rider is the attunement's, not
the tree's, and the row exists to prove it.

### 6.6 Gate 6 — the menu

**K-1. The supply's data shape.** (a) **Two embedded actions per power, one per face, each with its
own type and consumption row, gated on its colour by `requireSelfStatus` — recommended** (buildable
from the approved tables with no widening; Ordain's and Build's faces differ in type; Pyre's and
Forge Construct's in cost). (b) One action per power with a face-picker dialog — a new dialog, and a
consumption row that cannot differ by face.

**K-2. The rider gate.** (a) **Item-level `requireChannel` / `requireChannelled` flags read by the
six Widening-F sites through the parent item (Widening Q), adopted for all fifteen trees at item 198
so the twenty-two per-rule declarations lapse — recommended** (one declaration; a card's rules gate
together). (b) Per-rule declarations as the leyline legs specified — seventeen more types for deity.
(c) Item-level for deity only; the leyline legs keep per-rule.

**K-3. Where the faces are authored.** (a) **The entry records stay in `domain.json` and the
overlays with a `face` field; the build emits them onto the power — recommended** (the seven-key
overlay, extract and lint pass 1 all keep working). (b) A `data/supplies.json` beside
`channels.json`, the faces authored there and not extractable.

**K-4. Rank-granted powers and the attunements.** (a) **An actor-update watcher grants a colour's
power at rank 1 and removes it at 0 (Widening P); the leyline path items become the attunements and
keep their Key + Draw Mana grants; the tree link moves to the power — recommended.** (b) The wizard
grants the powers at creation from the skill step, and a GM drags one on later for a rank bought in
play.

**K-5. The arms.** (a) **`endWithChannel` on `edha-self-status` (Widening S) — recommended** (five
consumers, one field). (b) The arms' statuses copied onto the channel status effect and cleared with
it (Widening G's shape, extended from AEs to statuses).

**K-6. Where the bench runs.** (a) **The thirty-two rows on the Route A 3.1.0 copy, before the flip
(R-144), after the White pilot's CH rows — recommended.** (b) After the flip, on the live table.

> **Answered at gate 6 (Ben, chat, 2026-09-17):** *"Defaults."* — **K-1 … K-6 (a).** §6 committed on
> that answer.

---

## 7. Close-out

**All seven gates passed on 2026-09-17, in one session, in order — gate 1 on its third draft and
gate 2 on its second, both rewritten on Ben's notes rather than argued.** Nothing in this document
assumes an answer Ben did not give; the gate log at the top is the record, and each section's menu
carries his answer verbatim under it.

### 7.1 What was decided, gate by gate

| Gate | Decided |
|---|---|
| 1 — the path | **Shape S, the supply**: the deity path grants one base action that supplies the god's charge, free while channelling either colour, with today's two entries as its two faces — the colour channelled chooses the face. Attunement is chosen once at creation and sets the Draw Mana rider (the Key's rule); each colour's Channel comes with a rank; the leyline path pick retires; the deity guide's Parts 1 – 2 and cost scale are superseded; no rule on tree size; the word is *supply*; Countercurrent covers deity rites. Two drafts withdrawn on Ben's corrections (one Key at creation; the guide's shape is residual; "a mage is one leyline at a time" struck; the deity action is *Place Omen*, not *Channel Maelith*). |
| 2 — the marks | Chaos, Knowledge, Life: both entry nodes dropped, seven cards each; no kept cost (the charges are capped, no bodies); widening cards become Passives on the supply; Shatter Focus a Special; the synthesis tier on "2 or more"; the three capstones on the flood. §2.1 rewritten as questions with presumptions after Ben struck three rules. |
| 3 — the ground | Fate, Destruction, Civilization drop both nodes; Death keeps Reaper's Harvest and a one-faced Wither. **Costed faces:** Pyre and Forge Construct at 1. **Releases and rites:** Fault Line 2, Death Ward 2, Speak with the Fallen 2, Raise Dead 4; Risen Servant 1 + a Remain. *Hallowed Ground* added to Fate (name Ben's). The Bone Garden is not home ground. |
| 4 — the word | Order, Power, Sovereignty drop both nodes; no kept cost; Kneel's standing advantage on the face; four arms hold while channelling — Crown of Thorns, Warlord's Fury, Concord and **the Mantle of the Aspirant**, the one capstone whose duration is the Channel; Investiture of Command a rider at 2 with its tithe; item 106 back to the PM. |
| 5 — the mix | Passive + Special 14 % → 36 %; costed 80 % → 7 % (+ two costed faces), below the published floor and accepted (the Channel is the cost); Investiture sum 125 → 13; Reactions 5 → 0; Specials 0 → 5 (~7 %, R-108's target restated to ~5 – 10 %); the guide's table restated to the measured mix; item 210's four deity rows named. |
| 6 — the build | Ten `power` items with two face actions each (the faces authored in place, flagged `face`); the item-level rider gate (Widening Q) for all fifteen trees; rank-granted colour powers (P) with the leyline paths as attunements; `endWithChannel` (S); the supply's own test watch (R); the Ordained-square tick (T); powers on adversary blocks (U); thirty-two 🤖 rows on the Route A copy. |

### 7.2 What waits on Ben

- **One name:** *Hallowed Ground* (§3.1) is a placeholder; the card ships under Ben's name for it.
- ~~**No new ruling was filed.** Every judgment call was a menu entry answered at its gate; R-145~~
  ~~stays the only open ruling in `EDHA_RULINGS.md` §L.~~ R-108 and R-151 carry their dated
  post-design lines in §K as item 212's done-when asks.
- **AMENDED 2026-09-19.** The review of this atlas against the published Invested families
  (`docs/analysis/talent-comparison-mistborn-radiant.md`) filed three rulings, so the struck sentence
  above is no longer true. **R-161 (a)** — the five refund passives become upkeep — was answered by
  Ben in chat the same day and is applied throughout this document (§2.2, §2.3, §2.4, §3.4, §4.3, and
  the rule in §5.2). **R-160** — what a supply face costs when its payload is bounded by neither a
  charge cap nor a weapon Strike — is **open**: Ben refused a blanket 2-Action supply in chat, and
  (a), 1 Investiture on Place Omen's Blue face and Tend's Green face, **was confirmed by Ben in chat
  on 2026-09-19 together with its option (d)** — so Tend's Blue face is costed too and **five** faces
  carry a consume row. **R-162** — whether a scene-long install should outlive the Channel that bought
  it — was answered **(b), unchanged**: the pass's wear/build split stands, arms end with the Channel
  and buildings persist, and item 210's yardstick prices a flooded install against a maintained one
  before anything reopens. **R-163** — the refund surface is eight cards, not five — was answered
  **(a)**: `Predatory Patience` and `Predator's Due` take R-161's rule too, and
  `docs/design/channel-black.md` §1.5 and bench row CK-14 are amended to match. Red's `Flashpoint` is
  exempt. All four are filed in `EDHA_RULINGS.md` §K.25; **R-145 is again the only open ruling.**

### 7.3 What the PM should file from this pass

1. **Item 198's deity leg**, from §6 as written: the ten powers and **nineteen** faces (§6.1's
   corrected count — Death is one-faced), Widenings P – **V**, the item-level gate (K-2 (a)) —
   **which the builder should adopt for the five leyline legs too, letting the twenty-two per-rule
   declarations lapse**; the data moves in §6.4; the **thirty-three** DS rows; the docs in §6.4.
   **Four faces keep a 1-Investiture consume row** (Place Omen's Blue, Tend's Green, Pyre, Forge
   Construct — R-160 (a)), and **Widening V is the refund cap** R-161 (a) needs, which is the one
   genuinely new mechanic in the leg: a per-round budget on resource gains, built once and shared. Size: larger than any single colour leg (ten powers, a new power type,
   the rank watcher, the attunement re-home), smaller than the five leyline legs together.
2. **The deity guide rewrite** (F-7 (a), J-1 (a)): Parts 1 – 2 and the cost scale replaced by §1's
   model and §5.1's measured table; Part 4's ten identities updated for the faces; the "spend X
   Investiture" opening rule retired. DOCS-ONLY; the superseded banners are in the guide now.
3. **The player-facing texts** — the one-pager's deity block ("2 ranks in each colour" stays;
   "devotion unlocks in play" now grants the supply), the primer's deity pane, TREE-INTENT's ten
   lanes. DOCS-ONLY, with the build or before it.
4. **The wizard's Attunement step** (F-5 (a)): the leyline step retitled, its intro rewritten, and
   the rank watcher (P) — an ENGINE item at 3.x, part of item 198 or beside it.
5. **Item 106 re-scoped** (I-8 (a)): the Decree zone against a Sovereignty whose two frames already
   give the arbiter a radius each side.
6. **Item 210's deity rows** (J-4 (a), widened 2026-09-19 — §5.4 is the current list): Life's
   **priced** Green face and whether 1 is brake enough; the flood detonations; Knowledge's stacked
   pack; Power's arms at a point a round; and **the refund passives as upkeep** (R-161 (a)) — whether
   a capped refund still funds the maintain it is named for. Before the leyline rows.
10. **R-163 (a), ANSWERED 2026-09-19 — the two leyline Black refund cards take R-161's rule**, and
   `docs/design/channel-black.md` carries the amendment at both cards, at §1.5's stated economy, at its
   turn walks and at bench row CK-14. The refund surface is eight cards, not five. `Predatory Patience` and `Predator's Due` (both `leyline-black.json`) put
   Investiture back on a trigger with **neither a channelling gate nor a per-round cap**, which is a
   larger hole than the one R-161 just closed — Predatory Patience is fed by the Black Key's Draw
   Mana rider, which M10 keeps ungated, so a Black mage with **no Channel open** can Draw (+2, and
   Weaken every isolated enemy) and then Strike twice into a Weakened target for +2 more: +4 a round
   for no spend. Predator's Due is Reaper's Harvest's twin, and at Black 3+ one character can own
   both and collect 2 a kill with one half now capped and the other not. Extending R-161's rule
   invalidates approved content in `docs/design/channel-black.md` — bench row CK-14 expects "+3
   Investiture back; the Channel ran positive", and §1.5 states the uncapped loop as Isolation's
   intended economy, which is why it was put to Ben rather than swept in; he took it. **Red's `Flashpoint` is exempt
   and needs no change:** it is capped once per round, it is one of two options, and both its
   prerequisite feeders (Flame Surge 2, Arc Flash 1) are costed releases, so earning 1 always costs
   at least 1 first. It is a discount on a release, never net income.
11. **Two rule splits the cap needs before it can be wired** (found 2026-09-19): `Void Sense`
   (`VoidSenseRvl0000`) fuses its refund with the sense-through-walls half, and `Expose`
   (`ExposeReact00000`) fuses its refund with the Reactive Strike. Both non-refund halves must stay
   ungated, so each rule splits in two before Widening V can gate one of them.
7. **Adaptive Mutation's prose drift** (§2.4): the guide and TREE-INTENT say Green 3+ / level 6; the
   data says Green 2+. Reconcile the prose to the data.
8. **`deity-gate-audit.js`** learns that a face pays its colour (§6.4) — with the build.
9. **The bestiary** (item 121): deity-treed blocks embed the god's power and supply at role rank
   (Widening U); the census learns the supply.

### 7.4 The record

- Branch `design/channel-deity`, a fresh remote clone from `main` at `919bdf9`. DOCS-ONLY:
  `docs/design/channel-deity.md` (new) is the design; the close-out adds the changelog delta and its
  two counts, the two post-design lines in `EDHA_RULINGS.md`, the superseded banners in the deity
  guide, the TODO tick, and the regenerated dashboard. One commit per gate — a proposal commit
  first (the session container is ephemeral) and an approval commit on Ben's answer; gates green
  before every push. PR #434, opened as a draft with the first proposal and taken out of draft at
  this close-out.
- **Iron-rule-6 debt, this session's:** the first fifteen commits carry a `Co-Authored-By` model-
  identifier trailer, added from the harness default before the work-item contract's correction
  was read; Blue's pass recorded the same debt. Rewriting pushed history is a worse outcome than
  the trailer (item 182's lesson), so they stand; the close-out commits carry none.
- `docs/PM_BOARD.md` was not touched, per the brief.
