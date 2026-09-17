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
| 4 | §4 The build notes for Red | **✅ approved 2026-09-17** — RB-1 … RB-5 all (a); *"looks good"* |
| 5 | §5 Close-out | **✅ done 2026-09-17** — delta at the top of `docs/handoff-changelog/2026-09.md`; no new ruling filed; DOCS-ONLY PR from `claude/red-channel-work-go0bce` |

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

---

## 4. The build notes for Red

What item 198's Red leg builds, named from what exists — every handler read from
`data/authored/leyline-red.json` and every line number re-derived against `main` `ba796d4`. **No code
and no data change in this pass.** Deploy class: **ENGINE (F5) + DATA — REBUILD leyline + ⟳ Sync
Talents, at 3.x only**, after item 187's flip (R-144). Red is the first colour whose frame is not a
number on a sheet or an entry on the next-test list but a **stack that builds and spends**, so §4.2
is longer than White's or Blue's; everything in it is a widening of the rally stack Red already has.

### 4.1 Red's riders and where §4.3's gate lands

Ten cards change; seven become riders (RD-2's two trigger narrowings and the three releases are
data edits, not riders). Their handlers, and the dispatch site each one is read from:

| Rider(s) | Handler | On event | Read by | In the twelve? | Gate lands in |
|---|---|---|---|---|---|
| Reckless Advance | `edha-move` | `use` | the event executor | **no — new** | the pre-cost veto, Widening F (ii) |
| Incite | `edha-def-test` | `use` | the event executor | yes | the pre-cost veto |
| Shatter Focus | `edha-focus` | `use` | the event executor | **no — new** | the pre-cost veto |
| Breaking Point | `edha-watch {watch: damaged}` | `edha-watch-rule` | `edhaWatchersOfRule` (`05-edha-watch.js:323`) | carries the field today | the shared sweep, F (i) |
| Volatile Strike | `edha-triggered-effect` | `edha-on-hit` | **`edhaRulesForEvent`** (`04-black-ritual.js:211`, the on-hit sweep at `:102`) | **no — new** | **a new site (below)** |
| Kindle | `edha-damage-rider` | `edha-pre-deal-damage` | **`edhaActorRulesOf`** (`03-where-an-effect-lives.js:168` the rider parts, `:325` the light spec) | **no — new** | **a new site** |
| Battle Fever, Feeding Frenzy | `edha-rally-stack` | `edha-deal-damage` / manual | the executor (`53-…js:1563`) → `edhaRallyOnDeal` → **`edhaActorRulesOf`** (`19-…js:333`); `edhaRuleOf` for the manual bump (`:345`) | **no — new** | **a new site** |

**Four findings item 198 should have before it sizes the Red leg:**

1. **Red adds five schema declarations.** White's ten and Blue's two are twelve; Red's set is seven
   types, of which `edha-def-test` is already declared and `edha-watch` carries the field natively.
   New: **`edha-move`, `edha-focus`, `edha-triggered-effect`, `edha-damage-rider`, `edha-rally-stack`**.
   **Seventeen declarations across three colours.** (`edha-triggered-effect` is the engine's most-used
   payload type; declaring the field on it gates every future on-hit rider in one place.)
2. **Red answers Blue's open question: yes, a later colour forces more dispatch sites — two.**
   Blue's riders all fired from `use` (one site). Red's Kindle, Battle Fever and Feeding Frenzy are
   config-only rules read by **`edhaActorRulesOf`** (`03-…js:539`), and Volatile Strike is an
   `edha-on-hit` rule read by **`edhaRulesForEvent`**. Neither goes through the executor or the
   `edhaWatchersOfRule` cache, so Widening F's three sites do not cover them. The cheapest correct
   shape is the same filter F (i) applies to `edhaWatchersOfRule`'s return, applied to both helpers'
   returns: drop entries whose `handler.requireSelfStatus` the actor does not carry. Both are single
   functions with one return each; `edhaActorRulesOf` has 27 retired sweeps behind it (its own
   comment, `:531`) and gating it gates every config-only handler the engine has. **Widening F
   becomes five sites, still one field.** (RB-1.)
3. **The chained rules need no gate.** Breaking Point's `edha-apply-status` payload fires on
   `edha-test-success` downstream of its gated watch, exactly as Blue's seven chained rules did.
   Incite's def-test has no payload rule; the forced action stays volition-manual as today.
4. **Three of §4.3's nine widenings have no Red consumer.** **G** (the channel-rider ActiveEffect):
   every Red card ships `effects: []`, so nothing numeric rides the status. **H** (`requireChannelled`,
   the flood gate): no Red card gates on the flood (RD2-B). **I** (per-die disadvantage): Red's one
   disadvantage card, Emotional Overload, is a release and stays a plain `edha-next-test-mod`.
   And **E** (`edha-channel`) has no Red consumer either: RD2-4 (a) kept Incite an Action.

### 4.2 The frame's build — the heat on the power document

Three rules on the Red power's Events tab, every one a field or two on a handler that exists.
The precedent is the rally stack (`19-red-momentum-frenzy.js:318-364`): a capped counter on an actor
flag, bumped by an event, spent whole on the next X, cleared by a reset. The heat is that machine
with **four things changed**: what bumps it, what caps it, what spends it, and what clears it.

1. **The arm** — identical to White's §4.2 rule 1: `edha-self-status {statusId: "channelred", timed:
   true}` with Widenings A (`recordSpend`), B (`spendMax: "@colorRank"`) and C (`exclusiveWith`,
   `endOnStatus: unconscious`). One Red-specific line: **on a maintain, the heat is clamped to the new
   `channelled`** (RD-4 (a)) — the re-arm already rewrites the flag; it also writes
   `min(heat, channelled)`.
2. **The build trigger** — an **`edha-watch`** on the power, `{watch: "damaged", scope: "scene",
   disposition: "any", includeSelf: true, rangeColor: "red", payloadTarget: "actor",
   requireSelfStatus: "channelred", once: "no"}`. Every field exists (`53-…js:590-620`); Breaking
   Point's watch is the same rule with `disposition: enemy` and a count gate. The `damaged` kind
   announces **every real damage application** with its victim (`edhaDamagedWatchAnnounce`,
   `19-…js:386`), which is exactly "damage is dealt within Attunement Range, by anyone, to anyone"
   — RD-3 (a)'s one-event-per-creature falls out of it for free, because the announce is per victim.
   - **The payload is a bump.** Today a watch's payload is its sibling `edha-test-success` rule. The
     sibling here is **`edha-rally-stack`**, which needs **Widening J — four fields**: `stack:
     "rally" | "heat"` (the flag key; today's rules default to `rally` and change nothing),
     `cap: "@colorRank" | "@channelled"` (today's `edhaRallyBonus` hard-codes the Red rank; the heat
     reads Widening A's flag through the same `@channelled` token White's aura reads), `spendOn:
     "test" | "hit"`, and `resetOn` gaining `"channel"` (cleared when the arming status ends; never by
     the turn — RD-4 (a)). `trigger` gains `"watch"` so the rule can be a payload as well as a
     `deal-damage` listener. Battle Fever's and Feeding Frenzy's rules keep every default and are
     untouched by the widening except for their new `requireSelfStatus`.
   - **A finding the builder must know: damage applied inside a trigger is invisible to the announce.**
     `edhaDamagedWatchAnnounce` returns early on `_edhaInTrigger` (`19-…js:389`), so Arc Flash's
     arc, Afterburn's affliction ticks, Chain Detonation's burst and Volatile Strike's extra impact
     are **not** events today. §1.5 says every damage instance counts. Either the announce learns to
     count trigger-applied damage (with `chain` semantics so a payload's own damage does not
     re-trigger the payload), or the frame counts what the announce sees and the card is read as
     "damage from attacks and talents you use directly". **RB-2** carries it; the recommended
     default keeps the engine honest to the card.
3. **The spend** — the heat leaves on the next hit. Two existing mechanisms meet here:
   - **"Hit" is what the on-hit sweep already means**: `edha-on-hit` fires for the dealer of an attack
     that dealt a non-heal type (`04-…js:96-102`, `dealtTypes`), and not for a burst or a triggered
     instance. That is RD-6 (a)'s definition — Strikes, Searing Bolt, Volatile Strike's hit — with no
     new vocabulary.
   - **Where the number lands.** The `edha-damage-rider` sweep (`edhaRiderParts`, `03-…js:168`)
     joins every matching rider into the damage roll as a labelled term, resolved against the roller's
     data (`edhaFoldRiderFormula`, `:196`), which is where Kindle's `@skills.red.mod` and Mighty's
     `(1 + @tier)` already land. A rider on the power, `{appliesTo: "any", bonusFormula: "@heat"}`,
     puts the heat on the bar as `(2)[Channel Red]` — visible, which Ben asked for on 07-12 ("how can
     I tell if the Kindle bonus is applied?"). **But a rider term takes the roll's own type**, and
     the heat is energy on an impact Strike. Two shapes, **RB-3**: (a) a second typed term on the
     roll, if the 3.1.0 damage roll carries per-term types (it carries `damageType` per roll today,
     `dice/damage-roll.ts:44`; per-term is the thing to read at the source before building); (b) a
     separate energy instance applied after the hit lands, through `edhaCrossDamage` with the power
     as `edhaSource`, the way Shockwave Slam's collision damage is applied (`19-…js:306`). (b) is
     the recommended default: it needs no roll-shape change, the type is right by construction, and
     it makes RD-2 (a) true mechanically — the instance's source is the power, not a Red talent, so
     Kindle's new gate (below) never sees it. Its one cost: the instance must be tagged so the
     `damaged` announce counts the hit and the heat as **one** event, or the fire feeds itself twice.
   - **The consume.** `edhaRallyConsume` clears the stack on the d20 roll hooks (`:356-364`) — the
     wrong moment for a hit, since a miss must not spend the heat. The right moment is the post-damage
     pass that already runs after a hit lands, `edhaDamageBonusPost` (`03-…js:557`, the placeCounter
     drain): a `spendOn: "hit"` stack clears there, once per hit, after the heat instance is applied.
4. **`@heat`** — a second new formula token beside `@channelled`, resolved from the actor's heat flag
   in `edhaSubstRankTier` (`37-…js:92`); `edhaFoldRiderFormula` hands any unresolved `@` reference on
   raw (`:196`), so the substitution must happen before the fold, exactly as `@channelled` must.
5. **Kindle, Arc Flash, Afterburn and Chain Detonation read "a Red talent you activate"** (RD-2 (a),
   RD2-7 (a)) — **Widening K — `whenDealerColor`** (a colour id; blank = any source) on
   `edha-damage-rider` and `edha-triggered-effect`, read from the dealing item where the engine
   already knows it: `dealer.item` in the on-hit sweep (`04-…js:103`), `options.originatingItem` in
   applyDamage (`03-…js:330`, the light source's own authoritative case), the burst's `edhaSource`.
   A dealing item whose `system.path` (or the tree it came from) is the colour passes; a weapon, the
   power's heat instance and another colour's talent do not. The same field on the `edha-on-defeat`
   consumer carries Chain Detonation — and **fixes a drift this pass found**: its rule is
   `whenDamageType: "any"` on `edha-on-defeat` with no source gate at all, so today it fires on a kill
   by a sword, while its card has always said *"with a Red Conflagration talent"*. (RB-4.)

**What the frame does not need.** No `edha-channel` consumer (RD2-4 (a)); no per-die work (Widening
I); no ActiveEffect (Widening G); no new event type, no new handler type, no new status kind. The
heat is one flag, four fields on a handler Red already owns, one formula token, one gate field, and
one post-damage clear.

### 4.3 What moves in the data

**`data/authored/leyline-red.json`** — the seven authored keys, unchanged as a set:

- **`activation`** — five cards. The `{type: "resource", resource: "inv"}` consume row is removed from
  Reckless Advance, Volatile Strike, Incite and Breaking Point; Shatter Focus's `cost.type` `rea` →
  `spe`. Volatile Strike's handler also drops its own cost fields (`costResource: "inv"`, `costValue:
  1`, `costOptional: true` → blank / 0 / false) and gains `oncePerRound: true` — the field exists on
  `edha-triggered-effect` (`53-…js:1391`). Shatter Focus's `edha-focus` has **no once-per-round field**
  (`:720-760`); it needs one, the `edha-damage-react` shape at `:813` ("the budget is spent on the
  CLICK"). (RB-5.)
- **`description`** — the ten sentences of §2.2.
- **`events`** — `requireSelfStatus: "channelred"` on Reckless Advance's `edha-move`, Volatile Strike's
  `edha-triggered-effect`, Incite's `edha-def-test`, Shatter Focus's `edha-focus`, Breaking Point's
  `edha-watch`, Kindle's `edha-damage-rider`, Battle Fever's and Feeding Frenzy's `edha-rally-stack`;
  `whenDealerColor: "red"` on Kindle, Arc Flash, Afterburn and Chain Detonation; Breaking Point's
  payload `note` *"(You may spend 1 Investiture.)"* removed; every rule `description` that says
  "spend 1 Investiture" (Volatile Strike, Arc Flash keeps its, Breaking Point, Reckless Advance's
  "paid by activation", Incite's) rewritten, because a rule description is player-facing on the
  Events tab.
- **`effects`** — **nothing changes.** No Red card carries an ActiveEffect.
- **`docId`** — **nothing changes.** Red has no rename.

**`data/leyline.json`** — the ten records' `action`, `cost` and `description`; §2.5's hygiene
(Feeding Frenzy's stray bracket, Incite's full stop, three trailing-whitespace fields, Momentum's Edge's
`"Red 2+; "` prerequisite). **Graph untouched**: no `connections` or `prerequisites` change, so
`validate.js`'s DAG and reachability checks and `tests/pipeline.test.js` are unaffected.

**`data/channels.json`** (B-1 (a)) — Red's record: the amended frame sentence of §1.1, §1.5 as the
frame paragraph, the two actions' text, and the three rules of §4.2 as the power's `events`.

### 4.4 What names the changed cards

No rename, so no sweep. Three places carry a fact this pass changes and want the edit in the same PR:

| File | What |
|---|---|
| `module-src/scripts/engine/19-red-momentum-frenzy.js:1-22` | the Red tree-section header (rule 3's ledger): the rider list, and the rally-stack comment at `:313` gaining the heat's four fields |
| `EDHA_FOUNDRY_TEST_CHECKLIST.md:1663` | the `# BENCH — Red` preamble's R-27 paragraph stays (dated evidence); the new `## Channel — item 198` block goes under it |
| `.claude/skills/leyline-revision-guide/SKILL.md` Part 4, Red | *"Costs favor: Investiture for big hits, Opportunity for momentum spikes"* becomes the Channel, the three releases and the Opportunity spikes; the key-mechanic line gains the heat |

Regenerated, never hand-edited: `EDHA_PLAYER_PRIMER.html`, `EDHA_LEVELUP_GUIDES.html`,
`EDHA_DASHBOARD.html` — all built from the files above. **Leave alone**: `EDHA_RULINGS.md` (R-23, R-24,
R-27, R-95 quote the cards as they stood), the changelog months, the checklist's retired evidence
(lines 1673 – 1700, bench runs 1, 26, 40, 45), and `docs/design/channel-actions.md`'s struck text,
which is the record of the first frame.

### 4.5 The bench rows

Sixteen **🤖** rows, to be added under `# BENCH — Red (leyline)` (checklist line 1663) as a
`## Channel — item 198` block when the build lands, on the Route A 3.1.0 copy (B-6 (a)).

| Row | Drive | Evidence |
|---|---|---|
| CR-1 open | Channel Red at 1 | *Channelling Red* on the token; heat 0 on the flag; Investiture −1 |
| CR-2 build | an ally Strikes an enemy in range; an enemy Strikes the ally | heat 1, then 1 at cap; the flag never exceeds `channelled` |
| CR-3 spend | the mage Strikes and hits | the hit's damage plus a separate **1 energy** instance labelled Channel Red; heat 0, then **1** again (the hit fed it) |
| CR-4 miss | the mage Strikes and misses | heat unchanged |
| CR-5 flood | at rank 2 channel 2; three damage events; Strike | +2 energy; then heat 1 |
| CR-6 clamp | opened at 2 with 2 heat; maintain at 1 | heat reads 1 |
| CR-7 persist | two events on the enemies' turns; the mage's turn begins | heat still 2 (no turn reset); the rally flag, if any, cleared as today |
| CR-8 lapse | let the Channel expire unmaintained with heat on the flag | heat gone with the status |
| CR-9 not energy for Kindle | a channelling Kindle owner Strikes with a sword | no Kindle term on the bar, no light on the target; then Searing Bolt: the Kindle term and the light |
| CR-10 Chain Detonation's gate | kill with a sword while channelling; kill with Searing Bolt | no burst; burst |
| CR-11 riders off / on | no Channel: Reckless Advance, Incite, Shatter Focus, Volatile Strike's hit | refused before cost with the toast (the first three); no offer (the fourth). With the Channel: all fire spending nothing |
| CR-12 once per round | Volatile Strike on two hits in one round; Shatter Focus on two failures | the second refuses, both |
| CR-13 releases | Searing Bolt, Flame Surge, Arc Flash, Emotional Overload, Reckless Gambit with **no** Channel | all five work and spend |
| CR-14 the bolt carries heat | channel 1, one event, Searing Bolt hits | [Tier][Die] energy + 1 energy from the heat + Kindle's term |
| CR-15 Flame Surge as three events | channel 3 (a rank-3 PC), Flame Surge on three enemies, then Strike | heat 3 after the surge; +3 on the Strike |
| CR-16 adversary + tabs | a rival with Red attuned channels; a minion; a synced Red PC's Actions and Talents tabs | rival clamps at 2, minion at 1 (R-137); Channel Red and Maintain Red under the power; riders on the Talents tab; ⟳ Sync refreshes |

### 4.6 Gate 4 — the menu

**RB-1. The two new dispatch sites.** (a) **Gate `edhaActorRulesOf` and `edhaRulesForEvent` at their
single returns with F (i)'s filter — recommended** (one field, five sites; every config-only and
event-sweep handler is gated at once, and any fourth colour rides for free). (b) Gate inside the four
consumers (`edhaRiderParts`, `edhaLightSpecFor`, `edhaRallyOnDeal`, the on-hit sweep) individually.

**RB-2. Trigger-applied damage and the heat.** (a) **The `damaged` announce learns to count damage
applied inside a trigger, tagged so a payload's own damage does not re-fire its own watch —
recommended** (the card says *each time damage is dealt*; an arc that does not count is a card that
lies, and Breaking Point's second-blow count has the same gap today). (b) The frame counts only what
the announce sees, and §1.5 gains the sentence "damage from a talent's follow-on effect does not
build heat".

**RB-3. Where the heat lands.** (a) **A separate energy instance applied after the hit through
`edhaCrossDamage`, sourced to the power, counted with the hit as one event — recommended** (no
roll-shape change; the type is right by construction; RD-2 (a) is true mechanically). (b) A second
typed term on the damage roll, if 3.1.0's damage roll carries per-term types — one bar, but the
Kindle gate must then exclude the term by label.

**RB-4. Chain Detonation's missing source gate.** (a) **Fixed in the same data pass with Widening K
— recommended** (the card has always said *with a Red Conflagration talent*; today's rule fires on
any kill and is a drift, not a design). (b) Filed as its own item and left out of the Red leg.

**RB-5. Shatter Focus's "Once per round."** (a) **`oncePerRound` added to `edha-focus` on the
`edha-damage-react` pattern, spent on the click — recommended.** (b) Model Shatter Focus as an
`edha-watch {watch: test, whenOutcome: fail, scope: scene, once: round}` with an `edha-focus`
payload — no new field, and the failed-test trigger stops being table-declared; a larger change to
a card whose trigger has been manual since 2bY.

> **Answered at gate 4 (Ben, chat, 2026-09-17):** *"looks good"* — **RB-1 … RB-5 (a).** §4 committed
> on that answer.

---

## 5. Close-out

### 5.1 What was decided, gate by gate

| Gate | Decided |
|---|---|
| 0 — the frame re-opened | **FR-1 (a), the heat**: the rising edge's trigger kept (damage dealt within Attunement Range, by anyone) and its currency changed from a test bonus to energy damage on the mage's next hit, capped by the spend. Three reasons recorded in §1.2; §2.5 of the parent design amended in the same commit (RD-7 (a)), the original struck through. |
| 1 — the trees and the heat | Red's three trees on the F-0 (b) Realm map; Red's case is Black's (a damage frame conditioned on the field), not White's or Blue's; **the domain is the fight's damage** — what is dealt around you and the hits of yours that spend it; **an attack built of Investiture is a release** (Searing Bolt, Flame Surge, Arc Flash); the heat in full (§1.5: per creature damaged, spent on the next attack-test hit, feeds itself, persists while channelling, clamped on a smaller maintain, never "energy damage" for Kindle and its siblings). RD-1 … RD-7 all (a). |
| 2 — the cards | All twenty-five (§2.2): **ten change, fifteen are untouched**, the graph untouched. Four inside-domain costs become riders; Kindle, Battle Fever and Feeding Frenzy become riders under W-1's test; Shatter Focus becomes a Special; Arc Flash and Afterburn take the "Red talent you activate" phrase; Emotional Overload and Reckless Gambit are releases; rules 5, 6 and 7 have no Red consumer. The identity tax under the Channel (§2.3) and Red's two economies. Five phrasing fixes verified against the source. RD2-1 … RD2-7 all (a). |
| 3 — the mix | Red was **already inside the costed band**; costed 44 % → 28 %, Investiture nine cards → five, tree-sum 10 → 6, Passive + Special 76 % → 80 %. Reactions 0 % and Passives 44 % accepted as the colour's shape (RD3-1 (a)). The Channel's whole effect on Red is the heat; the flood-or-release decision. |
| 4 — the build | Seven riders; **five new schema declarations** (seventeen across three colours); **two new dispatch sites**, `edhaActorRulesOf` and `edhaRulesForEvent`, gated at their returns (RB-1 (a)); the heat as the rally stack with four fields widened (J), a `@heat` token, a `whenDealerColor` gate (K), and the on-hit sweep as the definition of a hit; the heat lands as a separate energy instance after the hit (RB-3 (a)); trigger-applied damage learns to count (RB-2 (a)); **Chain Detonation's missing source gate is a drift fixed in the data pass** (RB-4 (a)); `oncePerRound` on `edha-focus` (RB-5 (a)); sixteen 🤖 CR rows. |

### 5.2 What waits on Ben

**Nothing.** Every judgment call in this pass was a menu entry answered at its gate, including the
build's five. No new ruling was filed; `EDHA_RULINGS.md` §L still holds R-145 alone.

### 5.3 What the PM should file

1. **Add the Red leg to item 198's brief**, with §2.2 and §2.4 as its data pass and §4 as its build
   spec. The leg is **larger than Blue's and different in kind from White's**: the frame is a stack,
   not a number, and it is the first colour whose riders sit on the two config-only sweeps — say so in
   the brief so it is sized right (Widening J's four fields, K's gate, `@heat`, the two new sites, RB-2's
   announce change).
2. **Widening F is now five sites, one field** (§4.1 finding 2). Item 198's builder should gate
   `edhaActorRulesOf` and `edhaRulesForEvent` once, at their returns, before any colour's riders are
   authored, so White's and Blue's legs do not have to be revisited when Red's lands.
3. **Chain Detonation's source gate (RB-4)** is a live drift on `main` — its rule fires on any kill.
   It rides the Red data pass under this design; if item 198 is far off, it is a one-field DATA fix
   (REBUILD leyline) worth filing on its own.
4. **RB-2's announce change also fixes Breaking Point's count** (§4.2 finding): damage applied inside a
   trigger is invisible to the `damaged` watch today, so an arc that lands as a creature's second blow
   does not Disorient it. Same fix, two consumers.
5. **Item 210's yardstick re-run should cover Red's proposed row** (§3): +2 / +3 energy per hit on top
   of Mighty, against R-111's ceiling, beside Black's identical frame numbers.
6. **The struck text in `channel-actions.md` §2.5** is the record of the first frame; the amendment
   block is what item 198 builds. `channel-blue.md`'s line predicting Conflagration's three costed
   cards stay costed still holds and needs no edit.
7. **Items 211 (Black, Green) and 212 (deity) inherit two things from this pass**: the domain rule now
   sorted a third colour without a coin-toss, and a frame can be a **stack** (build, cap, spend, clear)
   on the rally-stack pattern — Green's ground is a number and Black's hunt is a number, but a deity
   tree that wants a building resource has a precedent.

### 5.4 The record

- Branch **`claude/red-channel-work-go0bce`**, a fresh remote clone from `main` at `ba796d4` (the same
  isolation from the PM's checkout the Blue pass used). DOCS-ONLY: `docs/design/channel-red.md` (new)
  and the amendment block in `docs/design/channel-actions.md` §2.5 are the only design files touched;
  the close-out adds the changelog delta, its two counts, and the regenerated dashboard. One commit per
  gate, each on Ben's answer; gates green before the PR.
- `docs/PM_BOARD.md` was not touched, per the Blue brief's discipline (there was no Red brief; item
  211's "one colour per session" was the scope, and this session was Ben's own).
