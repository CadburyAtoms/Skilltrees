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
| 1 | §1 The deity path, re-evaluated under the Channel | **proposed 2026-09-17, third draft** — D-1 … D-9 withdrawn on Ben's corrections; E-1 … E-8 withdrawn on his second note (§1.1); F-1 … F-10 tabled |
| 2 – 4 | The ten trees, in the grouping §1's answer makes natural | not started |
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
