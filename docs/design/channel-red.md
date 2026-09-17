# Red, worked — the Channel model applied

**Design document for TODO item 211's Red leg** (the Black / Red / Green passes on the Channel model).
Red is the third colour worked. The rule (`docs/design/channel-actions.md` §1) and the build shape
(§4) are **decided and fixed**; the frame (§2.5, F-R (a)) was **re-opened by Ben at the start of this
pass and replaced** — §1.2 records why and §1.1 carries the amended text. **DOCS-ONLY: nothing here
edits data, the engine or the packs.** The build is item 198's Red leg.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each
section before the next was written and before any commit. Every judgment call is a menu entry with a
recommended default, answered at its gate; nothing below assumes an answer that was not given. The
gate log is the record.

| Gate | Section | Status |
|---|---|---|
| 0 | The frame re-opened (FR-1) | **✅ answered 2026-09-17** — FR-1 (a) *the heat*, replacing the rising edge |
| 1 | §1 Red's three trees, and the heat applied | **✅ approved 2026-09-17** — RD-1 … RD-7 all (a) |
| 2 | §2 The twenty-five cards | — |
| 3 | §3 The mix, against the bands | — |
| 4 | §4 The build notes for Red | — |
| 5 | §5 Close-out | — |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/design/channel-actions.md` §1.1 (the four definitions — frame, channelled Investiture, rider,
release), §1.4 (the interactions), §1.5 and §2.1 (the specialties are the three Realms; F-0 (b), Red's
Momentum and Conflagration swapped), **§2.5 (F-R, the frame as approved at gate 2 and amended here)**,
§3.2 (the seven conversion rules), §3.3 – §3.5 (the shape of a worked colour), §4.3 (the
`requireSelfStatus` gate and the handler table), M9 (a), M13 (a), M14 (a), M16 (a) *release*;
`docs/design/channel-blue.md` §1.2 – §1.3 (the **domain** rule for rider vs. release, and the five
things the class decides); `EDHA_RULINGS.md` R-27 (the rally stack is spent on the next test),
R-95 (Momentum's Edge retuned to `[Tier][Die]`), R-104 (Red's prose vs. its talents), R-137
(adversaries on the same rules); `.claude/skills/leyline-revision-guide/SKILL.md` Part 4 (Red's
identity block as corrected 2026-09-13: *escalation fed by damage dealt near the mage, by anyone*;
no HP costs, no wounds read); `docs/analysis/talent-ecosystem/README.md` ("a melee charger disguised
as a ranged pyromancer"; Red the only real leyline damage tree); and `data/leyline.json` +
`data/authored/leyline-red.json` for every card quoted — **every card below was read from both on
2026-09-17 at `main` `ba796d4`, card text and `events`. Nothing is written from memory.**

**Today's Red:** 11 Passives, 8 Specials, 3 single Actions, 1 two-Action card, 1 Free Action,
1 Reaction; 11 of 25 cost something — 9 Investiture (one also an Opportunity) and 2 Opportunity only —
for a tree-sum of **10**, the cheapest tree in the atlas (`talent-comparison-mistborn-radiant.md`
§C.2).

---

## 1. Red's three trees, by Realm — and the heat applied

### 1.1 The frame, as amended

The frame approved at gate 2 of the parent design (§2.5, F-R (a)) was *the rising edge*: each time
damage is dealt within Attunement Range, **+1 to your next test**, up to the channelled Investiture.
Ben re-opened it at the start of this pass; §1.2 records the three reasons it did not fit. The
replacement keeps the trigger and changes the currency:

> **Channel Red.** Each time damage is dealt within Attunement Range, your next hit deals +1 energy
> damage, up to the Investiture you are channelling.

This document calls the accumulated number **the heat** (RD-1). The heat is the mage's own — it lands
on your hits and nobody else's — so M14 does not arise for Red at all (§1.5). The Draw Mana rider is
unchanged: advantage on your next Physical test, and your Reaction is gone until your next turn — the
identity tax stays.

| Tree | Realm | What its riders do to the frame |
|---|---|---|
| **Momentum** | Physical | deliver the heat — the charge that closes, the strike after the run-up, the slam, the leap, the free move after damage on a Fast turn |
| **Frenzy** | Cognitive | make the fight louder and share what it builds — incitement, the twice-struck, the failing, the test bonus the allies carry |
| **Conflagration** | Spiritual | make the fire itself — the bolt, the surge, the arc, and the passives that read energy damage from a Red talent |

The assignment is §2.1's with F-0 (b) applied: fire is the leyline's Investiture made visible
(Spiritual), the charge is the body (Physical). The heat is exactly that principle as a mechanic —
Investiture channelled into the body in motion leaves the sword as fire.

### 1.2 Why the rising edge was replaced

Recorded so that §2.5 of the parent design can carry the amendment (RD-7). Three reasons, in the
order they weighed:

1. **It was one Frenzy card promoted.** Battle Fever — a free rank-1 passive in Red's *Cognitive*
   tree — is "+1 to your next test per damage event in range, max = rank"; the rising edge was that
   card with the cap moved from rank to spend and the allies removed. The base action of the one
   real leyline damage tree contained no damage. A test bonus is generic accuracy; any colour could
   carry it.
2. **Its domain was the narrowest of the five.** Blue's gate 1 fixed the release test as the frame's
   *domain* (`channel-blue.md` §1.2): White's is the line, Blue's a read enemy's roll, Black's attacks
   on the alone, Green's the ground you laid. "Your own next test" is narrower than any of them, so the
   cheapest tree in the atlas would have converted the fewest cards, and the Channel would have bought
   Red less than it buys any other colour.
3. **Two of the three trees could not ride it.** Momentum's Edge, Shockwave Slam, Explosive Leap,
   Unstoppable and the whole Conflagration line contain no test of the mage's. The parent design's
   "Momentum rides the edge into the charge, Conflagration turns it into fire" named a relationship no
   card had.

What the rising edge got right is kept whole: the trigger *is* the colour's corrected key mechanic —
*Red gets stronger as the fight gets louder, fed by damage dealt near the mage, by anyone* — and the
frame stays the mage's own. The engine mechanism is also kept: the heat is the rally stack
(`edha-rally-stack`, `edhaRallyBump`, spent-on-next by R-27) with consume-on-hit instead of
consume-on-test; §4 says so precisely.

> **Gate 0 (Ben, chat, 2026-09-17):** FR-1 → **(a) the heat**, over (b) the rising edge as approved
> and (c) the flat fire line refused at gate 2. In the same line: *"I'm still of the opinion that
> Searing Bolt is a release. Kindle is a rider that buffs Searing Bolt and Flame Surge."* — carried
> into §1.4 and RD-2 / RD-5 as the recommended defaults.

### 1.3 What the frame does to each tree's identity

**Red's case is Black's, not White's or Blue's.** White's frame was an effect no card had; Blue's was
its own cards promoted. Red's frame — extra typed damage on the mage's own hits, conditioned on the
field — is the shape of Black's hunt with the condition turned inside out: Black pays for whoever
stands *alone*, Red pays for how *loud* the fight is. Neither frame is a card in its tree, and both
land where the colour's identity already lives: the damage roll. The ecosystem review scored Red's
whole capability budget on that one axis ("Red buys its 5-on-damage by scoring 0 or 1 on eight of the
other fourteen"); the frame pays into the axis the colour already owns instead of opening a new one.

**Momentum (Physical) delivers the heat.** Every Momentum card is about the body arriving: Reckless
Advance and Explosive Leap close without provoking, Momentum's Edge pays the run-up, Volatile Strike
and Shockwave Slam are what the arrival does, Unstoppable is the next arrival, Burning Drive and
Reckless Momentum are the Fast-turn tempo that gets you there first. None of them changes under the
frame, and every one of them now ends in a hit that carries fire. This is the review's "melee charger
disguised as a pyromancer" resolved rather than corrected: the charger *is* the pyromancer once the
Channel is up, and the disguise was the point. Reckless Advance's 1 Investiture buys the approach
that delivers the hit — inside the domain (§1.4), so it becomes a free rider and Red gains a
self-initiated Action every round beside the Channel.

**Frenzy (Cognitive) makes the fight louder and shares what it builds.** The heat is fed by damage
*anyone* deals in range, so the tree that makes other people deal damage is the tree that stokes the
frame: Incite forces a Strike (an event); Breaking Point reads the second damage on a character in a
round; Shatter Focus reads a failure; Feeding Frenzy reads enemies striking each other. Battle Fever
is the frame's own clause in the Cognitive Realm — damage in range, +1, a cap — paid out as a *test*
bonus to you and the allies instead of fire on your sword. Under the rising edge it had to shrink into
the frame's ally-sharing rider; under the heat it stays a distinct card, and by White's rule 2
precedent (W-1: a free passive that *is* the frame's clause in another Realm becomes a "while
channelling" rider) it and Feeding Frenzy gain the condition rather than doubling the trigger for
free. Gate 2 writes them. Emotional Overload and Reckless Gambit are the tree's other half — passion,
confidence and its price — and buy into another character's *tests*, not the fight's damage; §1.4 and
gate 2 decide them.

**Conflagration (Spiritual) makes the fire itself.** This is the tree the domain rule bites, exactly
as Blue's rule predicted (`channel-blue.md` §1.2: *"Red's Conflagration is Red's Illusion"*). Searing
Bolt, Flame Surge and Arc Flash do not modify a hit the mage was making — each **is** an attack built
out of Investiture, and a bolt that costs nothing is a free ranged Strike usable three times a turn.
They keep their cost (§1.4, RD-5). The tree's five other cards carry no Investiture and were never in
question; what changes is what they *read*. Kindle, Arc Flash, Afterburn and Chain Detonation all
trigger on "energy damage", and the heat is energy damage — so the frame forces one decision the
rising edge never did: **does a Strike carrying heat count as energy damage for those four?** If it
does, Kindle adds the Red modifier to every hit the mage lands and Arc Flash and Afterburn fire on a
sword; stacked with Mighty that is about +7 on a d8 Strike at level 1 and the Conflagration passives
become Momentum's. If it does not, Kindle is what Ben named it: a rider that buffs Searing Bolt and
Flame Surge. **RD-2 recommends the narrow reading**, and the fusion the frame promises is the heat
itself — fire on the charger's sword — not the Conflagration engine multiplying on it.

### 1.4 The domain, and Red's release principle

`channel-blue.md` §1.2 fixed the release test: a card whose Investiture buys an effect **outside the
frame's domain** is a release and keeps its cost; a card inside it converts. Red's domain is

> **the fight's damage** — the damage dealt around you that builds the heat, and the hits of yours
> that spend it.

Run over the nine Investiture-costed cards it sorts them without a coin-toss, and the sort agrees with
Ben's instinct on the one he named:

| Card | Its Investiture buys | Domain | Class |
|---|---|---|---|
| Reckless Advance | the approach that delivers your hit | inside | rider |
| Volatile Strike | more damage on your melee hit | inside | rider |
| Incite | a Strike by someone else — damage dealt in range | inside | rider |
| Breaking Point | a condition read off the second damage in a round | inside | rider |
| Searing Bolt | an attack that exists only because of the Investiture | outside | **release** |
| Flame Surge | an area of damage, not a hit | outside | **release** |
| Arc Flash | a second bolt to a second character | outside | **release** |
| Emotional Overload | a disadvantage on another character's test | outside | release (gate 2) |
| Reckless Gambit | an advantage on another character's test, then Exhausted | outside | release (gate 2) |

**The principle behind the three Conflagration rows (RD-5): an attack built of Investiture is a
release.** The frame's promise is what your hits *carry*, never that you have a hit to make. Searing
Bolt is a hit — it carries the heat like any Strike — but it is a hit the Investiture manufactured,
and free it would replace the weapon. The two Frenzy rows below the line are the same shape at one
remove (they manufacture a test outcome for someone else) and gate 2 confirms or overturns them with
the cards in view; the four above it are not close. This lands Red at **five releases** (or three, if
gate 2 turns the Frenzy pair) against Blue's seven and White's one, and the tree-sum falls from 10 to
6 (or 4) — inside the published 8 – 46 % costed band at either end, which §3 measures.

**The five things the class decides** (`channel-blue.md` §1.3) read the same for Red as for Blue, with
one Red-specific weight on the fifth: an adversary minion carrying Searing Bolt still simply fires it,
because it is a release; a minion carrying Volatile Strike must open a Channel first. The bestiary's
Red blocks (item 121) inherit that split.

### 1.5 The heat, in full

Stated once, so §2's riders and §4's build have one text to point at.

- **It builds.** Each time damage is dealt within your Attunement Range — by anyone, to anyone,
  including damage you deal — the heat rises by 1, to a cap equal to the Investiture you are
  channelling this round. A multi-target effect counts once per creature damaged (RD-3): a Flame Surge
  that burns three enemies is three events, and the fight got loud.
- **It spends.** The next hit you land adds the heat to its damage as energy damage, and the heat
  drops to 0. That hit is itself damage dealt in range, so it feeds the next: **the fire feeds itself**
  — channelling at 1, every hit after your first carries +1; at 2 you need one other event between
  your hits to carry +2 on each; at 3, two. In a loud fight the cap is met on every swing.
- **What is a hit.** Damage you deal from an attack test that succeeds — a weapon or unarmed Strike,
  Searing Bolt, the melee hit Volatile Strike rides. Not Flame Surge (a save), not Arc Flash's arc or
  Chain Detonation's burst (no attack test), not Afterburn's affliction (RD-6).
- **What it is, and is not.** The heat is extra energy damage on the hit's own damage roll — one
  roll, one instance, mixed type; deflect applies to it as to any energy. It does **not** make the
  hit "energy damage" for anything that reads that phrase: Kindle, Arc Flash, Afterburn and Chain
  Detonation read energy damage dealt by a Red talent (RD-2). A creature immune to energy takes the
  hit without the heat.
- **It persists while you channel.** The heat is not reset by the turn (unlike Battle Fever's stack
  today) — the noise of the enemies' turns is what you swing with on yours. It is clamped to the
  current spend when you maintain for less than you opened with (opened at 2 with 2 heat, maintain
  at 1: the heat is 1), and it is gone when the Channel ends (RD-4).
- **What the spend buys.** Your ceiling: +1 energy per hit for a trickle, +2 at a flood at levels
  1 – 5 (a Draw a round), +3 from level 6. Against a d8 Strike with the Strength modifier in, +2 is
  about a quarter more — the band of Black's frame, Kindle (+3 – 5, on Red talents only) and Mighty
  (+2), and it stacks with all of them.
- **Adversaries.** R-137: at role rank. A minion channelling at 1 carries +1 on every consecutive
  hit; a boss can flood at 3.
- **Two Red mages.** Each builds their own heat from the same noise and spends it on their own hits.
  Nothing lands on the same creature from both, so M14 does not arise — and, unlike the rising edge,
  no Frenzy rider shares the heat: what Battle Fever shares is a *test* bonus, a different effect.
- **What does not feed it.** Damage you *take* is damage dealt in range and counts like any other
  event; but nothing in the frame reads your wounds as such — the guide's 2026-09-13 correction
  stands, and Red keeps no HP cost and no "wounds are fuel" clause.
- **Outside combat.** M11: a Channel opened outside combat lasts until the scene ends or you end it;
  heat built outside combat is spent on the first hit like any other.

### 1.6 Gate 1 — the menu

Every judgment call in §1, recommended default first.

**RD-1. Naming the number.** (a) **"The heat" in prose, riders and the status tooltip; the Channel
card itself stays the one sentence of §1.1 with no defined term — recommended** (White's frame names
nothing on the card and Blue's "the reading" is prose only; a rider that needs the number says "the
extra energy damage from your Channel" or, shorter, "your heat"). (b) Put the term on the card:
*"… you gain 1 heat, up to the Investiture you are channelling; your next hit deals extra energy
damage equal to your heat and spends it."* (c) No name anywhere; riders spell it out each time.

**RD-2. Does a hit carrying heat count as "energy damage" for Kindle, Arc Flash, Afterburn and
Chain Detonation?** (a) **No — those four read energy damage from a Red talent; Kindle is a rider
that buffs Searing Bolt and Flame Surge — recommended** (Ben's own line at gate 0; the wide reading
puts about +7 on a level-1 d8 Strike with Mighty and turns Conflagration's passives into Momentum's).
(b) Yes — the full fusion: a channelling charger lights the whole Conflagration engine with a sword.
(c) Yes for Kindle's light-and-concealment clause only, no for its damage and for the other three.

**RD-3. What is one event.** (a) **One per creature damaged — recommended** (it is what "damage is
dealt" means, and the engine's `edha-deal-damage` fires per victim already). (b) One per damage
roll, however many it hits. (c) One per turn of the dealer.

**RD-4. When the heat lapses.** (a) **It persists while you channel, clamped to the current spend on
a smaller maintain, gone when the Channel ends; no reset at the start of your turn — recommended**
(the enemies' turns are where the fight gets loud; a turn-start reset would strand it, which is
R-27's reading of Battle Fever and is the reason that card only pays out on Reactions today).
(b) Reset at the start of your turn, as Battle Fever's stack does. (c) Persist, and not clamped —
a maintain at 1 keeps 2 heat until it is spent.

**RD-5. The release principle.** (a) **An attack built of Investiture is a release — Searing Bolt,
Flame Surge and Arc Flash keep their cost; the four inside-domain cards convert — recommended**
(Ben's "Searing Bolt is a release"; free, the bolt is a ranged Strike three times a turn; it is the
same principle that made Illusion Blue's release tree). (b) Searing Bolt alone a rider, as the tree's
one free repeatable play, with Flame Surge and Arc Flash releases. (c) No tree-level principle;
Conflagration converts card by card at gate 2.

**RD-6. Which hits carry the heat.** (a) **Any hit from an attack test — Strikes, Searing Bolt,
Volatile Strike's hit; not Flame Surge, the arc, the burst or the affliction — recommended** (a
release still carries it, so the pyromancer's bolt burns hotter in a loud fight without being free).
(b) Weapon and unarmed Strikes only — the heat is Momentum's, the bolts are their own fire. (c) Any
damage you deal, once per damage roll — Flame Surge adds the heat to one of its targets.

**RD-7. Where the amendment lives.** (a) **This PR also edits `docs/design/channel-actions.md`
§2.5: a dated amendment block under F-R recording FR-1 (a), the replaced card sentence and a pointer
here, with the original text left in place struck through — recommended** (the parent design is
what item 198 builds from, and a builder reading §2.5 alone must not build the rising edge; the
Blue doc's "all three Conflagration costed cards stay costed" line still holds under RD-5 and needs
no edit). (b) Record the amendment only in this file and let the PM edit the parent design.
(c) Rewrite §2.5 in place with no record of the first text.

> **Answered at gate 1 (Ben, chat, 2026-09-17):** *"defaults on all"* — **RD-1 … RD-7 (a).** §1
> committed on that answer; RD-7 (a) applied in the same commit (the amendment block under F-R in
> `docs/design/channel-actions.md` §2.5).
