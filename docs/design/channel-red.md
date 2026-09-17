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
| 2 | §2 The twenty-five cards | **✅ approved 2026-09-17** — RD2-1 … RD2-7 all (a) |
| 3 | §3 The mix, against the bands | **✅ approved 2026-09-17** — RD3-1 (a); *"This is good. Continue."* |
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

---

## 2. The twenty-five cards

### 2.1 The conversion rules, applied to Red

1. **Conflagration's three costed cards are releases** (RD-5 (a)). Searing Bolt, Flame Surge and Arc
   Flash spend Investiture on **an attack that exists only because of the Investiture** — outside the
   domain — so they keep their cost and their action type. Arc Flash and Afterburn also take RD-2's
   phrase: *"when a Red talent you activate deals energy damage"*. *(RD2-A.)*
2. **The four inside-domain costed cards become riders** (§1.4): Reckless Advance and Incite keep
   their 1 Action and lose the Investiture; Volatile Strike and Breaking Point are Specials with no
   cost. Momentum keeps no Investiture cost at all. *(RD2-B.)*
3. **Emotional Overload and Reckless Gambit are releases** (RD2-1). Both buy into another
   character's *test* — confidence and its price, Frenzy's passion half — not the fight's damage.
   Frenzy keeps two costed plays; the rest of the tree is free once the Channel is up.
4. **Red's one Reaction becomes a Special** (rule 3; RD2-2). Shatter Focus drains 1 focus without a
   test — a modifier, not an action — and it becomes a "while channelling" Special with "Once per
   round." Red's Reaction count goes to zero, for the reason §2.3 gives.
5. **Three free passives are the frame's clause in another Realm and become riders** (rule 2's
   W-1 exception; RD2-3, RD2-5): **Kindle** (more damage on your fire — Spiritual), **Battle Fever**
   and **Feeding Frenzy** (damage in range → +1, capped — Cognitive, as a test bonus). The other seven
   free passives stay unconditional: Burning Drive, Momentum's Edge, Unstoppable, Flashpoint, Mighty,
   Chain Detonation, Frenzied Tempo.
6. **Rules 5, 6 and 7 have no Red consumer.** No Red card costs 3 Investiture, so nothing gates on
   the flood (its payoff is intrinsic: +3 on every hit). No rider reads the channelled number — the
   frame *is* the number, as Blue's was (BL2-F). And nothing rides the payment: Incite is the one
   candidate and RD2-4 keeps it an Action, because a forced Strike is an Action's worth of effect
   and its test should cost one.
7. **Fully-free Specials gain "Once per round."** where they did not have a limit (BL2-D): Volatile
   Strike and Shatter Focus. Breaking Point already carries "Once per round per character."

Convention as before: "*While channelling Red,*" at the head of the card; the Key's rider stays a
Draw Mana rider; prerequisites and connections are unchanged throughout — this pass changes action
type, cost and text, not the graph.

### 2.2 The twenty-five cards

Format: **name** — *tree / Realm* · today → proposed · the card sentence as it would ship (word count;
was).

**Red Leyline Attunement** — *Key* · Passive; — → **unchanged** (M10). *"When you Draw Mana, gain an advantage on your next Physical test. Lose your Reaction until the start of your next turn."* (22)

**Burning Drive** — *Momentum / Physical* · Passive; — → **unchanged.** *"On a fast turn, add half [Die] to your first Physical test."* (12)

**Reckless Advance** — *Momentum / Physical* · 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Red, move [Size] feet toward a character or objective without provoking Reactions."* (14; was 15) The charge that delivers the hit; inside the domain (§1.4). Red's first free self-initiated Action beside the Channel.

**Volatile Strike** — *Momentum / Physical* · Special; 1 Investiture → **Special; — (RD2-6).** *"While channelling Red, when you hit with a melee attack, test Red vs. Physical to add half [Tier][Die] impact damage. Once per round."* (23; was 21)

**Momentum's Edge** — *Momentum / Physical* · Passive; — → **unchanged** (R-95 (a) already retuned it to `[Tier][Die]`, item 104). *"When you Strike a creature after moving at least 20 feet toward it this turn, the attack deals bonus impact damage equal to [Tier][Die]."* (24)

**Shockwave Slam** — *Momentum / Physical* · Special; — → **unchanged.** *"When you hit with a melee Physical test, push the target up to [Size] ft. Collision with an obstacle deals half [Tier][Die] Impact."* (23)

**Explosive Leap** — *Momentum / Physical* · Free Action; — → **unchanged.** *"Move up to [Size] ft without provoking Reactions. Creatures within 5 ft of where you land test Physical or fall Prone."* (21)

**Reckless Momentum** — *Momentum / Physical* · Special; Opportunity → **unchanged** — the Opportunity is its identity cost (M13) and there is no Investiture to convert. *"When you succeed on a Physical test, spend Opportunity to roll the Plot Die on your next test this turn."* (20)

**Unstoppable** — *Momentum / Physical* · Passive; — → **unchanged.** *"When you deal damage on a Fast turn, move up to half your Speed without provoking Reactions. Once per turn."* (20)

**Kindle** — *Conflagration / Spiritual* · Passive; — → **Passive; — , now a rider (RD2-3; RD-2).** *"While channelling Red, when a Red talent you activate deals energy damage, add your Red modifier to it. Characters it damages shed light in 5 feet and lose concealment until the end of your next turn."* (36; was 33) Ben's card at gate 0: *"Kindle is a rider that buffs Searing Bolt and Flame Surge."* Unconditional it would be the frame's own clause — more damage on your fire — in another Realm, which is W-1's test.

**Searing Bolt** — *Conflagration / Spiritual* · 1 Action; 1 Investiture → **unchanged — a release (RD-5).** *"Spend 1 Investiture and make a Red ranged attack test against a character you can sense within Attunement Range, rolling [Tier][Die] energy damage on a success."* (26) It is a hit, so it carries the heat (RD-6 (a)): in a loud fight the bolt burns hotter, and it still costs.

**Flame Surge** — *Conflagration / Spiritual* · 2 Actions; 2 Investiture → **unchanged — a release (RD-5).** *"Spend 2 Investiture. Each character within [Size] of a point in Attunement Range tests Athletics vs. Red. On a failure, they take [Tier][Die] energy damage, and half as much on a success."* (32) Not a hit; carries no heat. Each creature it burns is one event (RD-3), so it is how a pyromancer fills the heat for the bolt that follows.

**Arc Flash** — *Conflagration / Spiritual* · Special; 1 Investiture → **Special; 1 Investiture — a release (RD-5), trigger narrowed (RD-2).** *"When a Red talent you activate deals energy damage to a character, you may spend 1 Investiture. If you do, a bolt arcs to one other character within 10 feet, dealing half [Tier][Die] energy damage. Once per round."* (38; was 34)

**Flashpoint** — *Conflagration / Spiritual* · Passive; — → **unchanged.** *"Once per round, when a Red talent you activate hits two or more characters, choose: all affected characters lose a Reaction, OR regain 1 Investiture and gain an advantage on your next Red test this turn."* (36) Its trigger already reads *a Red talent you activate*; its second option regains 1 Investiture, which under the Channel is half a maintain.

**Mighty** — *Conflagration / Spiritual* · Passive; — → **unchanged** (shared generic, six trees; R-102). *"When you hit with a weapon or unarmed attack, for each action spent, deal extra damage equal to 1 + your tier."* (22)

**Afterburn** — *Conflagration / Spiritual* · Special; Opportunity → **Special; Opportunity — trigger narrowed (RD-2).** *"When a Red talent you activate deals energy damage, you may spend an Opportunity to inflict Afflicted [half [Tier][Die] energy] on the target."* (23; was 18) No Investiture to convert, so it stays unconditional like Reckless Momentum; only the phrase moves.

**Chain Detonation** — *Conflagration / Spiritual* · Passive; — → **unchanged** — it already reads *with a Red Conflagration talent*, which is RD-2's phrase. *"When you reduce a creature to 0 HP with a Red Conflagration talent, deal half [Tier][Die] energy damage to each creature within 5 ft."* (24)

**Incite** — *Frenzy / Cognitive* · 1 Action; 1 Investiture → **1 Action; — (RD2-4).** *"While channelling Red, test Intimidation vs. the Spiritual defense of a character within Attunement Range. On a success, it must Strike the nearest character or lose its Reaction."* (28; was 27) The forced Strike is damage dealt in range — Frenzy stoking the frame.

**Emotional Overload** — *Frenzy / Cognitive* · Special; 1 Investiture → **unchanged — a release (RD2-1).** *"When a character within Attunement Range gains an advantage from any source, spend 1 Investiture. It gains a disadvantage on its next non-attack test."* (24)

**Battle Fever** — *Frenzy / Cognitive* · Passive; — → **Passive; — , now a rider (RD2-5).** *"While channelling Red, each time damage is dealt within Attunement Range, you and allies within range gain +1 to your next test (max = your Red rank). Resets at the start of your turn."* (34; was 26) The frame's clause in the Cognitive Realm, paid out as a test bonus to the line; the cap stays rank (a rider, not a frame — M9) and the reset stays R-27's.

**Shatter Focus** — *Frenzy / Cognitive* · Reaction; — → **Special; — , a rider (RD2-2).** *"While channelling Red, when a character within Attunement Range fails a test, it loses 1 focus. Once per round."* (19; was 17) Rule 3: a Reaction that is a modifier becomes a Special. The Reaction cost goes, the channel gate arrives, and Red's Reaction is free for the tax (§2.3).

**Reckless Gambit** — *Frenzy / Cognitive* · Special; Opportunity, 1 Investiture → **unchanged — a release (RD2-1).** *"You may spend Opportunity and 1 Investiture to grant advantage to a character within Attunement Range on its next test. It then becomes Exhausted[-2]."* (24)

**Feeding Frenzy** — *Frenzy / Cognitive* · Passive; — → **Passive; — , now a rider (RD2-5).** *"While channelling Red, when an enemy within Attunement Range attacks another enemy, you and each ally within range gain +1 to your next test this round. Resets at the start of your turn."* (33; was 29) The source prose's stray "(" goes with it (§2.5).

**Frenzied Tempo** — *Frenzy / Cognitive* · Passive; — → **unchanged.** *"When you take a Fast turn, your Influence tests gain an advantage until end of turn."* (16)

**Breaking Point** — *Frenzy / Cognitive* · Special; 1 Investiture → **Special; —.** *"While channelling Red, when a character within Attunement Range takes damage for the second time in a round, it becomes Disoriented. Once per round per character."* (26; was 26) Reads the fight's damage directly; inside the domain.

### 2.3 The identity tax under the Channel

Red's Key costs the Reaction: *"Lose your Reaction until the start of your next turn"* on every Draw
Mana. Today that bites on the turns a Red mage draws — one in two or three. Under the Channel a mage
draws **every round or every other round by design** (§1.2 of the parent: one Draw funds one round of
a full Channel), so the Reaction is gone most rounds of most fights. That is the tax working as
intended — Red trades defence for offence — and it is why Shatter Focus, Red's only Reaction, cannot
stay one: a card that needs the Reaction the colour's own economy spends would be dead on exactly the
turns the tree is at full heat. As a Special it fires once a round on any failure in range regardless.
Red at 0 % Reactions is not a miss against the band; it is the colour's stated shape (leyline guide
Part 4: *no Red talent reduces damage or heals*, and the Reaction is what the Draw buys).

Two economies fall out, and both work at level 1 with the starting pool of about 4:

- **The charger** channels and pays nothing else. Round 1: Channel at 1 or 2, Reckless Advance (free)
  into reach, Strike with the heat. Every round after: maintain as a Free Action, three Actions of
  Strikes and free Momentum riders, Draw when the pool needs it. A flood costs a Draw a round; a
  trickle a Draw every other round, with +1 on every hit after the first.
- **The pyromancer** channels *and* releases. Channel at 1 (1) + Searing Bolt (1) + Draw Mana (+2) is
  sustainable every round at a trickle, with Kindle live on the bolt; a flood plus a bolt costs 3 a
  round against 2 of income, so the pyromancer trickles, or floods on the round the bolt matters and
  lets Flame Surge's three events fill the heat for it. Flashpoint's "regain 1 Investiture" option is
  worth exactly half a maintain, which is a real choice now.

### 2.4 Before and after

| # | Talent | Tree / Realm | Today | Proposed | Condition |
|---|---|---|---|---|---|
| 1 | Red Leyline Attunement | Key | Passive; — | Passive; — | — (Draw Mana rider) |
| 2 | Burning Drive | Momentum / Phy | Passive; — | Passive; — | — |
| 3 | Reckless Advance | Momentum / Phy | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 4 | Volatile Strike | Momentum / Phy | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 5 | Momentum's Edge | Momentum / Phy | Passive; — | Passive; — | — |
| 6 | Shockwave Slam | Momentum / Phy | Special; — | Special; — | — |
| 7 | Explosive Leap | Momentum / Phy | Free Action; — | Free Action; — | — |
| 8 | Reckless Momentum | Momentum / Phy | Special; Opp | Special; Opp | — |
| 9 | Unstoppable | Momentum / Phy | Passive; — | Passive; — | — |
| 10 | Kindle | Conflagration / Spi | Passive; — | Passive; — | **while channelling**; reads Red-talent energy |
| 11 | Searing Bolt | Conflagration / Spi | 1 Action; 1 Inv | 1 Action; 1 Inv | — (release; carries the heat) |
| 12 | Flame Surge | Conflagration / Spi | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |
| 13 | Arc Flash | Conflagration / Spi | Special; 1 Inv | Special; 1 Inv | — (release; reads Red-talent energy) |
| 14 | Flashpoint | Conflagration / Spi | Passive; — | Passive; — | — |
| 15 | Mighty | Conflagration / Spi | Passive; — | Passive; — | — |
| 16 | Afterburn | Conflagration / Spi | Special; Opp | Special; Opp | — (reads Red-talent energy) |
| 17 | Chain Detonation | Conflagration / Spi | Passive; — | Passive; — | — |
| 18 | Incite | Frenzy / Cog | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 19 | Emotional Overload | Frenzy / Cog | Special; 1 Inv | Special; 1 Inv | — (release) |
| 20 | Battle Fever | Frenzy / Cog | Passive; — | Passive; — | **while channelling** |
| 21 | Shatter Focus | Frenzy / Cog | Reaction; — | **Special; —** | while channelling; once per round |
| 22 | Reckless Gambit | Frenzy / Cog | Special; Opp, 1 Inv | Special; Opp, 1 Inv | — (release) |
| 23 | Feeding Frenzy | Frenzy / Cog | Passive; — | Passive; — | **while channelling** |
| 24 | Frenzied Tempo | Frenzy / Cog | Passive; — | Passive; — | — |
| 25 | Breaking Point | Frenzy / Cog | Special; 1 Inv | **Special; —** | while channelling; once per round per character |

**Ten cards change** (3, 4, 10, 13, 16, 18, 20, 21, 23, 25 — two of them, Arc Flash and Afterburn,
only in their trigger phrase); **fifteen are untouched** — the Key, seven free passives, three
free Specials or Free Actions, and **five releases**. Between White's sixteen and Blue's nine, for
the same reason as Blue: a release tree, and here a cheap tree to begin with.

### 2.5 The phrasing fixes that ride the data pass

Under RD-1 (a) and BL-6's precedent, no "creature" is swept on a card whose sentence does not change.

- **Feeding Frenzy** — `data/leyline.json`'s source prose has a stray *"("* before *"you and each
  ally"*; the authored card does not. Source follows the card, and the sentence changes anyway.
- **Incite** — the sentence ends without a full stop in both files; the new sentence has one.
- **Kindle** — *"Creatures you deal energy damage to"* becomes *"Characters it damages"* on the
  changed sentence. Momentum's Edge, Explosive Leap and Chain Detonation keep "creature" (unchanged).
- **Volatile Strike, Reckless Advance, Momentum's Edge** — trailing whitespace on the source prose;
  Momentum's Edge's `prerequisites` reads *"Red 2+; "* with a trailing semicolon. Data hygiene, `data/leyline.json` only.
- **Emotional Overload** — the source flavour uses a hyphen *" - "* where the standard is an en dash
  or a full stop; unchanged card, so it is noted, not swept.

### 2.6 Gate 2 — the menu

Every judgment call in §2, recommended default first.

**RD2-1. Emotional Overload and Reckless Gambit.** (a) **Both releases, unchanged — recommended** (they
buy into another character's test, not the fight's damage; Frenzy keeps two costed passion plays and
Red keeps five costed cards, 20 %, inside the band). (b) Both riders: Emotional Overload "Special; —",
Reckless Gambit "Special; Opportunity" — a free disadvantage on every advantage gained in range is a
standing counter-buff, and Frenzy would carry no Investiture at all. (c) Emotional Overload a rider,
Reckless Gambit a release.

**RD2-2. Shatter Focus.** (a) **A "while channelling" Special, "Once per round." — recommended** (rule
3, and §2.3: the colour's own economy spends the Reaction it would need; the gate is the price of
losing the Reaction cost). (b) Stays a free, unconditional Reaction, as today. (c) An unconditional
Special, "Once per round." — a pure buff on a free card.

**RD2-3. Kindle.** (a) **A rider reading energy damage from a Red talent you activate; the light
clause on the same trigger — recommended** (Ben's line; W-1's test). (b) An unconditional passive
reading Red-talent energy — works before the Channel opens, but doubles the fire the Channel pays
for. (c) Unconditional and reading *any* energy damage, as today — RD-2 (a) already refused this.

**RD2-4. Incite.** (a) **A 1 Action rider, no cost — recommended** (a forced Strike is an Action's
worth of effect; the Intimidation test should cost one). (b) A Special on the payment — *"When you
channel or maintain Red, test Intimidation vs. …"* — Guiding Signal's shape: the fight gets louder
every round for free, and Red's self-initiated Actions fall to three. (c) A release, unchanged.

**RD2-5. Battle Fever and Feeding Frenzy.** (a) **Riders per W-1, each keeping its own cap (rank) and
its own reset (start of your turn, R-27) — recommended** (a rider is not a frame; its cap is the
tree's and its reset is a ruling that stands). (b) Unconditional, as today — two free counters on the
frame's own trigger. (c) Riders with the turn-start reset dropped to match the heat — re-opens R-27.

**RD2-6. "Once per round." on Volatile Strike.** (a) **Yes — recommended** (free, it would be a
test for +half [Tier][Die] on every one of three Strikes a turn; BL2-D's precedent). (b) No — three
tests a turn, as Mighty is three adds a turn.

**RD2-7. Arc Flash and Afterburn take RD-2's phrase on the card.** (a) **Yes, both — recommended** (the
card must say what the rule reads, or a heat-carrying Strike looks like it should arc). (b) Leave the
cards reading "energy damage" and let the build's `whenSource` gate carry it silently — the tab would
then disagree with the card.

> **Answered at gate 2 (Ben, chat, 2026-09-17):** *"all default"* — **RD2-1 … RD2-7 (a).** §2
> committed on that answer.

---

## 3. The mix, against the bands

| | Passive | Special | 1 Action | 2 Actions | Free | Reaction | Passive + Special | costed (any) | costed (Investiture) | Investiture tree-sum |
|---|---|---|---|---|---|---|---|---|---|---|
| **Red today** | 11 (44 %) | 8 (32 %) | 3 (12 %) | 1 (4 %) | 1 (4 %) | 1 (4 %) | 76 % | 11 (44 %) | 9 (36 %) | 10 |
| **Red proposed** | 11 (44 %) | 9 (36 %) | 3 (12 %) | 1 (4 %) | 1 (4 %) | **0** | **80 %** | **7 (28 %)** | **5 (20 %)** | **6** (+ the Channel, 1 – rank a round) |
| *Blue proposed, for scale* | 9 (36 %) | 8 (32 %) | 2 (8 %) | 2 (8 %) | 1 (4 %) | 3 (12 %) | 68 % | 9 (36 %) | 7 (28 %) | 9 |
| *White proposed, for scale* | 10 (40 %) | 11 (44 %) | 1 (4 %) | 0 | 0 | 3 (12 %) | 84 % | 4 (16 %) | 1 (4 %) | 1 |
| published Invested band | | | | | | 2 – 7 % | 71 – 87 % | 8 – 46 % | | |
| leyline guide target | ~35 % | 25 – 30 % | ~15 % | ~8 % | 5 – 8 % | 5 – 8 % | | | | |

*(Counts read from `data/leyline.json` at `ba796d4`: "costed (any)" is the nine Investiture cards plus
the two Opportunity-only Specials, Reckless Momentum and Afterburn; the comparison's Appendix gives
44 % / 36 % / 10 for today's row, the same numbers.)*

**Read against the bands.** Red is the one colour that was **already inside the costed band before
the Channel** — 44 % against 8 – 46 %, the cheapest tree in the atlas at a sum of 10 — so the Channel
moves its pricing less than it moved White's or Blue's: costed 44 % → 28 %, Investiture-priced nine
cards → five, the sum 10 → 6. **Passive + Special rises to 80 %, inside the published band** (from
76 %, which was already inside). Red never needed the Channel to fix its pricing; what it needed was
a base action, and that is what the frame is. The Channel's whole effect on Red is the heat: the
tree's cards were mostly free already, and now the free cards ride a damage engine that runs every
round instead of a set of disconnected passives.

**Two numbers sit outside a band, and both are the colour on purpose.**

- **Reactions at 0 %** (band 2 – 7 %, guide 5 – 8 %). §2.3 gave the reason: the Key spends the Reaction
  on every Draw Mana, and under the Channel a Red mage draws most rounds. A Reaction card on this
  tree is a card that is dead on the tree's best turns. Red's answer to the enemy's turn is not a
  Reaction; it is that the enemy's hit fed the heat.
- **Passives at 44 %** (guide ~35 %). Unchanged by this pass — Red had eleven free passives before it
  and has eleven after; three of them are now riders, which the Passive column does not show. The
  published Invested families run 37 – 41 % Special *and* high Passive for the same reason White's
  Specials overshoot: the power is the action, the talents change what it does.

Against the guide's other targets: single Actions 12 % against ~15 %, with the Channel now the
self-initiated play beside three real Actions (Reckless Advance free, Incite free, Searing Bolt
costed) — the review's "Red fields four" holds and two of the four stopped costing; 2 Actions 4 %
against ~8 % (Flame Surge); Free 4 % against 5 – 8 % (Explosive Leap); Special 36 % a little over
25 – 30 % (one Reaction crossed). Nothing here was engineered toward a band.

**Where the remaining cost sits.** Four of the six surviving Investiture points are in
**Conflagration** (Searing Bolt 1, Flame Surge 2, Arc Flash 1); the other two are Frenzy's passion
pair (Emotional Overload 1, Reckless Gambit 1). **Momentum carries no Investiture at all** — its only
cost is Reckless Momentum's Opportunity. The charge, the leap, the slam, the run-up strike and the free
move are all free once the Channel is up, which is the review's "melee charger" made the cheap build
it always was in practice and now is on paper.

**What a Red player's turn is now.** Round 1: Channel Red at 2 out of a pool of 4, Reckless Advance
into reach for nothing, Strike — the enemy's arrow into your ally on their turn and your ally's answer
already put 2 heat on that sword, so the first hit lands at +2 energy, and the hit itself puts 1 back.
Every round after: maintain as a Free Action for 1 or 2, Draw when the pool needs it (advantage on
the next Physical test, the Reaction gone, which you were not going to use), three Actions of Strikes
with Momentum's Edge on the run-up, Volatile Strike's free test once, Shockwave Slam into the wall,
Unstoppable's free half-Speed move on a Fast turn. Battle Fever hands the line +1 or +2 on their next
test from the same noise. The pyromancer's version of the same turn is Channel at 1, Searing Bolt with
Kindle and the heat on it, Draw — and on the round that matters, Flame Surge for 2, whose three
burning targets fill the heat for the bolt that follows and hand Flashpoint its choice. The real
decision each round is Blue's in a Red key: **flood or release** — a round you spend 2 on Flame Surge
is a round you maintained at 1, and the heat's ceiling is 1 until you pay again.

**What it costs, in numbers.** Today a full Red round — Reckless Advance and Volatile Strike, or a
bolt and its arc — spends 2 Investiture for two plays and earns 2 from a Draw (R-126). Under the
Channel the same 2 buys the frame and every Momentum and Frenzy rider, and at a flood at levels 1 – 5
adds **+2 energy to every hit** — about +6 a round on three Strikes, on top of Mighty's +2 each, before
any rider. From level 6 the flood is 3 and the Draw yields 3: +9 a round on three hits. R-111's
leyline damage ceiling (three Withering Rays ≈ 33 vital for ~4.5 HP; three Strikes with Mighty ≈ 31
free) was measured without a frame on either side; Black's hunt adds the same +2 / +3 per hit against
the Isolated, so the two damage colours move together and the ceiling holds relative to both. Item
210's yardstick re-run should add Red's row beside White's and Blue's before item 198 builds — the
turn arithmetic there was priced on 1 Investiture per play, and Red's plays are now mostly free with
a frame that adds per hit.

**RD3-1. The two off-band numbers.** (a) **Accept Reactions at 0 % and Passives at 44 % as the
colour's shape, for the reasons above — recommended.** (b) Keep Shatter Focus a Reaction to hold 4 %
(re-opens RD2-2 (a)). (c) Convert one or two unconditional passives to Specials to move the Passive
column — manufactures a type change with no design behind it.

> **Answered at gate 3 (Ben, chat, 2026-09-17):** *"This is good. Continue."* — **RD3-1 (a).** §3
> committed on that answer.
