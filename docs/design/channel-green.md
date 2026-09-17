# Green, worked — the Channel model applied

**Design document for TODO item 211's Green leg** (the Black / Red / Green passes on the Channel model).
Green is the fifth and last colour worked, in the same session and on the same PR as Red and Black
(#433). The rule (`docs/design/channel-actions.md` §1) and the build shape (§4) are **decided and
fixed**; the frame (§2.6, F-G (a) *the ground*) was **re-opened by Ben at the start of this pass and
replaced** — §1.2 records the three alternatives and why the second was chosen. **DOCS-ONLY: nothing
here edits data, the engine or the packs.** The build is item 198's Green leg.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each
section before the next was written and before any commit. Every judgment call is a menu entry with a
recommended default, answered at its gate; nothing below assumes an answer that was not given. The
gate log is the record.

| Gate | Section | Status |
|---|---|---|
| 0 | The frame re-opened (FG-1) | **✅ answered 2026-09-17** — FG-1 (b) *the home ground*, replacing the ground; Ben's own pick, confirmed against the pack |
| 1 | §1 Green's three trees, and the home ground applied | **✅ approved 2026-09-17** — FG1-1 … FG1-6 (a) except **FG1-4 (b)**: the regen ticks once a minute outside combat |
| 2 | §2 The twenty-five cards | **✅ approved 2026-09-17** — FG2-1 … FG2-5 all (a); *"looks good"* |
| 3 | §3 The mix, against the bands | — |
| 4 | §4 The build notes for Green | — |
| 5 | §5 Close-out | — |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/design/channel-actions.md` §1.1 (the four definitions), §1.4 (the interactions; M11, M14),
§1.5 and §2.1 (the Realm map: Restoration Physical, Instinct Cognitive, Territory Spiritual), **§2.6
(F-G, the frame as approved at gate 2 and amended here; F-G (b), the regrowth line, refused there for
strength)**, §3.2 (the seven conversion rules), §4.3; `channel-blue.md` §1.2 – §1.3 (the domain rule);
`channel-red.md` §1.2 (the three tests a frame must pass) and §1.5 (a frame may be a stack);
`channel-black.md` §1.2 (a frame may be a mark); `EDHA_RULINGS.md` R-83 (the heal-cut gate every
`hea` writer must pass), R-126 (Draw Mana yields your rank); `.claude/skills/leyline-revision-guide/SKILL.md`
Part 4 (Green's identity block as corrected 2026-09-13: *Territory — terrain that spreads, bites and
holds; deep single-target restoration — Green CAN remove Injuries and nothing else can; the pack — the
PARTY clusters, onto one target*); the engine's terrain (`50-green-territory.js:35-50`: one enforced
map Region per placement, `modifyMovementCost walk × 2`, owner-tagged) and its sizes
(`35-…js:24-25`: `[Size]` by rank 2.5 / 5 / 10 ft, Attunement Range 15 / 30 / 60 ft); and
`data/leyline.json` + `data/authored/leyline-green.json` for every card quoted — **every card below
was read from both on 2026-09-17 at `main` `ba796d4`, card text and `events`. Nothing is written from
memory.**

**Today's Green:** 9 Passives, 7 Specials, 3 single Actions, 3 two-Action cards, 0 Free Actions,
3 Reactions; 14 of 25 cost something — 13 Investiture (one also an Opportunity; Reknit Form variable
2 / 3) and 1 Opportunity only (Natural Recovery) — for an Investiture tree-sum of **14** with Reknit
Form's variable cost counted as 0, as `talent-comparison-mistborn-radiant.md` §C.2 counts it (16 at
its minimum of 2).

---

## 1. Green's three trees, by Realm — and the home ground applied

### 1.1 The frame, as amended

The frame approved at gate 2 of the parent design (§2.6, F-G (a)) was *the ground*: enemies that
enter or start their turn in your difficult terrain take keen damage equal to the channelled
Investiture. Ben re-opened it at the start of this pass; §1.2 records why and the three alternatives.
The replacement is the ground turned toward the party:

> **Channel Green.** Your difficult terrain within Attunement Range does not slow you or your allies,
> and you and allies that start your turn in it regain health equal to the Investiture you are
> channelling.

This document calls the frame **the home ground**. The Draw Mana rider is unchanged — every Draw lays
difficult terrain within [Size] of a point in Attunement Range — so **Draw → Channel** is the opening:
the Key lays the ground, the Channel makes it home.

| Tree | Realm | What its riders do to the frame |
|---|---|---|
| **Territory** | Spiritual | grow and hold the ground — spread it, seed it under a foe, root the one who stands in it, keep the one who tries to leave |
| **Restoration** | Physical | deepen what the ground gives the body — the burst heal at half, the touch, the condition lifted, the injury closed, the vitality that stays |
| **Instinct** | Cognitive | hunt from it — the pack's advantage, the weakest known, the prey driven, the illusion refused |

The assignment is §2.1's, unchanged; Green's Physical cell is the legacy guide's own words (*"deep
single-target healing"*).

### 1.2 Why the ground was replaced

Recorded so that §2.6 of the parent design can carry the amendment (FG1-6). The ground failed the
three tests `channel-red.md` §1.2 set, and worse than the hunt did:

1. **It was one card promoted.** Thorn Field, a free rank-2 passive, reads *"your difficult terrain
   deals half [Tier][Die] keen damage to characters that enter or start their turn in it"*; the frame
   was that sentence with the die swapped for the spend, and the parent design said so (*"the Channel
   is what makes laying it matter before rank 2, where Thorn Field arrives"*).
2. **Its domain left two trees outside.** "Your terrain and what stands in it" converted Territory's
   five costed cards and nothing else — Restoration heals and Instinct hunts, neither in the terrain —
   leaving 8 of 13 costed cards costed, the weakest conversion of the five colours.
3. **Two trees rode it by gate only.** No Restoration or Instinct card names the terrain.

**Three alternatives, one per Realm, and the choice.** *The pack* (Instinct: allies gain a bonus to
attack tests equal to the spend against a character adjacent to another ally — White's line mirrored
to offence) rode nine of thirteen costed cards and completed a pattern the other four colours make;
it was tabled first, and set aside because it is generic tactics that Hunter already sells (Pack
Hunting, Hunter's Edge, Animal Bond) and because it made the ground a side effect of the Key. *The
hold* (Territory: enemies starting their turn in your terrain lose 10 feet of movement rate per
Investiture) kept the ground and converted five cards. **The home ground** — the refused regrowth
line gated to the mage's own terrain — is uniquely Green where the pack is not: deep restoration is
the one thing no other tree can do and the living ground is the Key's product, and the frame is made
of both. Ben named it his own pick; asked whether it would be the recommendation absent the gate-2
refusal, the answer was yes, and the reason the refusal no longer binds is the gate itself:

| Rank | `[Size]` | squares per Draw | who can stand in it | regen per round at a flood |
|---|---|---|---|---|
| 1 | 2.5 ft | 1 | one ally | 1 – 2 to one ally |
| 2 | 5 ft | 9 | the party | up to 8 across four allies |
| 3 | 10 ft | 25 | the party with room | up to 12 across four |

The line refused at gate 2 healed every ally in Attunement Range for a Draw a round. This one heals
whoever stands on a patch the mage laid, which at level 1 is one square and one ally, and at rank 2
is a 15-foot patch that is also where every burst wants to land. Standing together on marked ground
is a real price; item 210's yardstick prices the rest.

> **Gate 0 (Ben, chat, 2026-09-17):** *"If I hadn't refused the original proposal, would B be your
> pick? I think it's mine, but I want your take."* → yes, for the reasons above; *"do it"* →
> **FG-1 (b).**

### 1.3 What the frame does to each tree's identity

**Green's case is White's, turned to the ground.** White's frame was an effect no White card had
(deflect to the line), and every White card was free to stay what it was and stop costing. Green's
frame is an effect one card *almost* has — Resurgent Growth's regen — but its subject is new: not "an
ally you healed" but "an ally on your ground". The frame gives the party a reason to stand where the
Key puts them, which is the sentence the guide was corrected to on 2026-09-13 (*the PARTY clusters*)
with the ground as the reason to cluster.

**Territory (Spiritual) grows and holds the ground.** Every Territory card is about the terrain or
the creature that will not leave it: Spreading Roots and Sudden Growth lay more of it, Grasping Vines
and Territorial Instinct are the roots that hold, Pack Sense and Apex Predator pay the party for
fighting on it, Thorn Field makes it bite, Primal Awareness is the land's own senses. Under the frame
the ground is worth laying at level 1 for the party's sake, and every Territory rider makes more of
the place the party heals on. Thorn Field stays exactly what it is: the same patch that heals allies
bites enemies, and the two clauses never meet on one creature.

**Restoration (Physical) deepens what the ground gives the body.** The frame is a trickle; Restoration
is the surge — Mender's Instinct at half health, Verdant Mend's touch, Vital Surge's temporary HP,
Natural Recovery's condition lifted, Reknit Form's injury closed. Every one of them buys into an
ally's body, which is the frame's own subject, so by the domain rule they convert. **One card is the
frame's clause in this Realm** and takes W-1's treatment (FG1-3): Resurgent Growth — *"when you
restore health to an ally with a Green talent, that ally regains health at the start of your next
turn while they remain within Attunement Range"* — is regen on an ally, unconditional, and left free
it doubles the frame on every healed ally whether or not they stand on the ground. As a rider it is
the frame's reach *off* the ground: heal an ally once, and they carry the regrowth wherever they go
that round.

**Instinct (Cognitive) is Green's release tree.** Pack Hunter, Pack Pressure, Drive the Prey and
Natural Order buy into the *prey's* situation — the surrounded target, the Strike window, the driven
creature, the scene without illusions — and none of them names the ground or an ally's body. By the
domain rule they are outside and keep their cost, as Illusion's did for Blue, Conflagration's for Red
and Subjugation's for Black. That makes **five colours, five release trees, in four different
Realms** (Physical, Spiritual, Cognitive, Cognitive, Cognitive): Blue's §1.2 prediction — a release
tree is not a Realm law — measured across the whole atlas. Instinct's free cards (Predator's
Instinct, Scent the Weak, Coordinated Hunt, Packmate's Warning) run as today. FG1-1 (b) offers the
other reading — *the ground and the pack that holds it* — under which Instinct converts too and
Green has no release tree at all.

### 1.4 The domain, and Green's release principle

`channel-blue.md` §1.2 fixed the release test: a card whose Investiture buys an effect **outside the
frame's domain** is a release. Green's domain is

> **the ground, and the bodies that stand on it** — the terrain you have laid, and your allies'
> health.

Run over the thirteen Investiture-costed cards:

| Card | Its Investiture buys | Domain | Class |
|---|---|---|---|
| Grasping Vines | a character Restrained by your roots, and its upkeep | inside (the ground reaching out) | rider |
| Territorial Instinct | an enemy's Disengage stopped on your land | inside | rider |
| Spreading Roots | more ground | inside | rider |
| Sudden Growth | ground under a foe | inside | rider (keeps its Opportunity, M13) |
| Pack Sense | an ally's attack against a character in your ground | inside | rider |
| Mender's Instinct | an ally's health at half | inside | rider |
| Verdant Mend | a character's health, by touch | inside | rider |
| Reknit Form | an injury removed | inside — gated on the spend (rule 5; gate 2) | rider |
| Vital Surge | temporary HP on a healed character | inside | rider |
| Pack Hunter | advantage for you and an ally against a surrounded enemy | outside | release |
| Pack Pressure | the pack's free move and Strike window | outside | release |
| Drive the Prey | a character driven and Slowed | outside | release |
| Natural Order | a scene without illusions (rule 4 too) | outside | release |

**Nine riders, four releases.** The Investiture tree-sum falls from 14 to **6** (Pack Hunter 1, Pack
Pressure 1, Drive the Prey 2, Natural Order 2) — the same landing as Red and Black, from the same
rule. §3 measures it.

**Green's release principle (FG1-1):** a card whose Investiture buys into an *enemy's* situation —
the prey — is outside the domain. Territory's two cards that act on an enemy (Grasping Vines,
Territorial Instinct) are inside because the actor is the ground: roots hold, the land refuses to be
left. Instinct acts on the prey with the pack, not the land.

**Grasping Vines' upkeep.** The card says *"spend 1 Investiture at the start of your turn to
maintain the vines"*. As a rider the vines are free to cast; the upkeep is the one Investiture line
the frame has to decide — gate 2 carries it (the Channel is the upkeep, or the upkeep stays).

### 1.5 The home ground, in full

Stated once, so §2's riders and §4's build have one text to point at.

- **Your difficult terrain** is terrain your Green talents laid — the Key's Draw, Sudden Growth,
  Spreading Roots' expansion — which the engine already tags with its creator (FG1-5 (a)). Natural
  difficult terrain and another mage's ground are not yours.
- **It does not slow you or your allies.** Enemies still pay double; Thorn Field still bites them at
  rank 2; Territorial Instinct still stops their Disengage. Your side walks through it.
- **It heals whoever starts their turn on it.** You and each ally that begins their turn in your
  terrain within Attunement Range regain health equal to the Investiture you are channelling — once
  per turn per creature, at the start of that creature's turn. Every `hea` write passes the heal-cut
  gate (R-83): a withered ally on the ground regains nothing, and the card says so.
- **What the spend buys.** 1 per ally per turn for a trickle, 2 at a flood at levels 1 – 5, 3 from
  level 6 — multiplied by how many allies stand on ground you have laid, which at rank 1 is one
  square per Draw (§1.2's table). The spend is the depth; the Draws and Spreading Roots are the
  breadth.
- **You are an ally to yourself** for the frame (FG1-2 (a)): a Green mage standing on their own
  ground heals with the party, as White's mage gains deflect beside the line.
- **Two Green mages.** An ally standing on ground both have laid takes the larger regen once (M14 (a));
  ground laid by either does not slow the other's allies, since neither slows their own.
- **Outside combat.** M11: the Channel lasts until the scene ends or you end it; the terrain does not
  slow allies for as long as it stands, and **the regen ticks once a minute** for each ally on the
  ground (FG1-4 (b), Ben's pick over the recommended default): the grove is a place the party rests in,
  at a maintain per minute, which is the Channel's out-of-combat rate under M11.
- **Adversaries.** R-137: at role rank. A Green minion lays one square and heals one packmate on it;
  a boss floods at 3 and lays a 25-square grove.
- **Draw Mana is unchanged.** The Key lays ground on every Draw; the Channel does not lay ground, it
  makes the ground home. A Green mage who never channels has today's tree exactly.

### 1.6 Gate 1 — the menu

Every judgment call in §1, recommended default first.

**FG1-1. The domain and the release principle.** (a) **The ground and the bodies that stand on it;
a card that buys into the prey's situation is outside — Instinct's four costed cards are releases,
Territory's five and Restoration's four convert — recommended** (the rule as the other three colours
applied it; Green keeps a release tree like every other colour). (b) *The ground and the pack that
holds it* — Instinct's four convert too; Green is the one colour with no release tree, thirteen
riders, and a tree-sum of 0 beside the Channel. (c) Card by card at gate 2.

**FG1-2. "You" in the frame.** (a) **"You and your allies" — recommended** (White's precedent; the
mage stands on their own ground). (b) Allies only — the mage heals through Restoration's own cards.

**FG1-3. Resurgent Growth.** (a) **Becomes a "while channelling" rider (W-1's test: regen on an ally
is the frame's clause in the Physical Realm; unconditional it doubles the frame off the ground) —
recommended.** (b) Stays a free, unconditional passive — two regens on every healed ally standing on
the ground.

**FG1-4. Outside combat.** (a) The regen ticks only on turns; the unslow stands while the terrain
does — recommended (M11's shape; Ordered Advance's "this round" has the same answer). (b) **A tick
per minute outside combat — Ben's pick**: the grove is somewhere the party rests, at a maintain a
minute.

**FG1-5. Whose ground.** (a) **Terrain laid by your own Green talents, read from the Region's owner
tag the engine already writes — recommended** (`50-green-territory.js:35`; Apex Predator's
`whenEnemiesInMyZone` reads the same tag). (b) Any difficult terrain within Attunement Range — a
Green mage on a hillside heals the party for nothing laid.

**FG1-6. Where the amendment lives.** (a) **This PR also edits `docs/design/channel-actions.md`
§2.6: a dated amendment block under F-G recording FG-1 (b), the replaced card sentence and a pointer
here, with the original struck through — recommended** (RD-7 / BK-6's shape). (b) Record here only.
(c) Rewrite §2.6 in place.

> **Answered at gate 1 (Ben, chat, 2026-09-17):** *"default all but 1-4, which should be (b)."* —
> **FG1-1, 2, 3, 5, 6 (a); FG1-4 (b).** §1.5's outside-combat line rewritten to (b) before the commit;
> FG1-6 (a) applied in the same commit (the amendment block under F-G in `channel-actions.md` §2.6).

---

## 2. The twenty-five cards

### 2.1 The conversion rules, applied to Green

1. **Territory's five costed cards become riders** (FG1-1 (a)): Grasping Vines keeps its Action and
   loses its Investiture — *and its upkeep line*, because the Channel is the upkeep (FG2-1);
   Territorial Instinct keeps its Reaction (it tests, rule 3); Spreading Roots and Pack Sense are
   Specials with no cost and gain "Once per round." (FG2-5); Sudden Growth keeps its Opportunity
   (M13). *(FG2-A.)*
2. **Restoration's three combat heals become riders; the injury card is a release** (FG2-2). Verdant
   Mend keeps its Action; Vital Surge is a free Special; **Mender's Instinct becomes a Special** — a
   Reaction that is a modifier (rule 3), already once per round in its rule (FG2-4). Reknit Form keeps
   its variable cost: an injury removed outlasts the scene (rule 4), and under FG1-4 (b) a free Reknit
   would close every injury in the party for one out-of-combat maintain. *(FG2-B.)*
3. **Instinct's four costed cards are releases** (FG1-1 (a)): Pack Hunter, Pack Pressure, Drive the
   Prey, Natural Order (rule 4 as well). Every card that buys into the prey's situation.
4. **One free passive is the frame's clause in another Realm and becomes a rider** (rule 2's W-1
   exception; FG1-3 (a)): Resurgent Growth. The other eight free cards stay unconditional — Thorn
   Field included: the ground biting enemies is not the ground healing allies.
5. **The frame's tick is not a Green talent's heal** (FG2-3). Vital Surge, Natural Recovery and
   Resurgent Growth all read *"when you restore health with a Green talent"*; the frame is the
   power's, not a talent's, so the regen does not fire them — RD-2's shape for Red (the heat is not
   energy for Kindle). Without this, every ally on the ground below half health would draw temporary
   HP, a cleanse offer and a regrowth queue every turn.
6. **Rules 5, 6 and 7 have no Green consumer** once Reknit Form is a release: nothing gates on the
   flood, the frame is the number (as for Blue, Red and Black), and nothing rides the payment — the
   Key's Draw already lays the ground, and the Channel's own arm is what makes it home.
7. **Two newly-free Specials gain "Once per round."** (BL2-D's precedent): Spreading Roots (free, it
   would expand on every turn-end in the patch) and Pack Sense (free, it would add the modifier to
   every ally attack into the ground). Mender's Instinct already carries it.

Convention as before: "*While channelling Green,*" at the head of the card; prerequisites and
connections unchanged — this pass changes action type, cost and text, not the graph.

### 2.2 The twenty-five cards

Format: **name** — *tree / Realm* · today → proposed · the card sentence as it would ship (word count;
was).

**Green Leyline Attunement** — *Key* · Passive; — → **unchanged** (M10). *"When you Draw Mana, create difficult terrain within [Size] of a point in Attunement Range."* (15) Every Draw lays the ground the Channel makes home.

**Primal Awareness** — *Territory / Spiritual* · Passive; — → **unchanged.** *"You can't be Surprised while outdoors. Gain Advantage on Perception tests to detect or track creatures."* (16)

**Grasping Vines** — *Territory / Spiritual* · 1 Action; 1 Investiture → **1 Action; — (FG2-1).** *"While channelling Green, test Green vs. the Physical defense of a character within Attunement Range. On a success, the target is Restrained for as long as you channel."* (28; was 35) The Channel is the upkeep: the roots hold while the ground is alive.

**Territorial Instinct** — *Territory / Spiritual* · Reaction; 1 Investiture → **Reaction; —.** *"While channelling Green, when an enemy in your Attunement Range tries to Disengage, test Green vs. Survival to reduce its movement to 0 this turn."* (25; was 26) A Reaction that tests stays a Reaction (rule 3).

**Thorn Field** — *Territory / Spiritual* · Passive; — → **unchanged.** *"Your difficult terrain deals half [Tier][Die] keen damage to characters that enter or start their turn in it."* (18) The same patch heals allies and bites enemies; the two clauses never meet on one creature.

**Spreading Roots** — *Territory / Spiritual* · Special; 1 Investiture → **Special; — (FG2-5).** *"While channelling Green, when a character ends their turn in your difficult terrain, the terrain expands [Size]. Once per round."* (20; was 21)

**Sudden Growth** — *Territory / Spiritual* · Special; Opportunity, 1 Investiture → **Special; Opportunity.** *"While channelling Green, spend an Opportunity to create difficult terrain within [Size] of a character you can sense."* (18; was 18) The Opportunity is its identity cost (M13).

**Pack Sense** — *Territory / Spiritual* · Special; 1 Investiture → **Special; — (FG2-5).** *"While channelling Green, when an ally makes an attack test against a character in your difficult terrain, they add your Green modifier to the result. Once per round."* (28; was 28)

**Apex Predator** — *Territory / Spiritual* · Passive; — → **unchanged.** *"While three or more enemies are within your difficult terrain, gain an advantage on all Physical tests."* (17)

**Mender's Instinct** — *Restoration / Physical* · Reaction; 1 Investiture → **Special; — (FG2-4).** *"While channelling Green, when an ally in Attunement Range drops to half health or below, restore [Tier][Die] health to them. Once per round."* (23; was 21) A Reaction that is a modifier becomes a Special (rule 3); its rule is already once per round.

**Verdant Mend** — *Restoration / Physical* · 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Green, touch a character to restore health equal to [Tier][Die] + your Green modifier."* (16; was 17)

**Resurgent Growth** — *Restoration / Physical* · Passive; — → **Passive; — , now a rider (FG1-3).** *"While channelling Green, when you restore health to an ally with a Green talent, that ally regains health equal to your tier + your Green modifier at the start of your next turn while they remain within Attunement Range."* (39; was 36) The frame's clause in the Physical Realm — the regrowth that follows a healed ally off the ground.

**Natural Recovery** — *Restoration / Physical* · Special; Opportunity → **unchanged** (FG2-3). *"When you restore health with a Green talent, you may spend an Opportunity to also remove one condition from the target: Afflicted, Disoriented, Stunned, or Weakened."* (26) No Investiture to convert; it reads a Green talent's heal, not the frame's tick.

**Hardy** — *Restoration / Physical* · Passive; — → **unchanged** (shared generic; R-102). *"Gain +1 maximum health per level, including previous levels."* (9)

**Collected** — *Restoration / Physical* · Passive; — → **unchanged** (shared generic; R-102). *"Increase your Cognitive and Spiritual defenses by 2."* (8)

**Reknit Form** — *Restoration / Physical* · 2 Actions; Variable Investiture → **unchanged — a release (FG2-2; rule 4).** *"Spend 2 Investiture and touch a creature to remove one temporary injury, or spend 3 Investiture to remove a permanent injury."* (21) An injury removed outlasts the scene; and with FG1-4 (b) a maintained Channel outside combat would otherwise close every injury in the party for one payment.

**Vital Surge** — *Restoration / Physical* · Special; 1 Investiture → **Special; —.** *"While channelling Green, when you restore health with a Green talent to a character below half health, they also gain Temporary HP equal to half [Tier][Die]."* (26; was 23) Reads a Green talent's heal (FG2-3), so the frame's own tick does not fire it.

**Predator's Instinct** — *Instinct / Cognitive* · Passive; — → **unchanged.** *"Gain an advantage on tests to track or locate characters suffering an injury or below half health. You can sense fear in characters within 30 feet without testing."* (28)

**Pack Hunter** — *Instinct / Cognitive* · Special; 1 Investiture → **unchanged — a release (FG1-1).** *"When you move adjacent to an enemy character another ally is adjacent to, spend 1 Investiture. You both gain an advantage on your next attack test against it."* (28)

**Scent the Weak** — *Instinct / Cognitive* · Special; — → **unchanged.** *"You know which creature within Attunement Range has the lowest HP. Your first test against it each round gains advantage."* (20)

**Pack Pressure** — *Instinct / Cognitive* · 1 Action; 1 Investiture → **unchanged — a release (FG1-1).** *"You and each ally within 15 feet may Move up to half their movement rate without provoking Reactive Strikes. Until the start of your next turn, when you or an ally adjacent to the same character Strikes it, that Strike deals an extra [Tier][Die] damage."* (45)

**Coordinated Hunt** — *Instinct / Cognitive* · Passive; — → **unchanged.** *"When you and at least one ally both make attack tests against the same character in the same round, each attack deals bonus damage equal to the number of different attackers who targeted it this round (maximum = Rank)."* (39)

**Drive the Prey** — *Instinct / Cognitive* · 2 Actions; 2 Investiture → **unchanged — a release (FG1-1).** *"Choose a character within 30 feet. Test Green vs. Survival. On a success, that character is Slowed and must move away from you on their next turn. Allies may make Reactive Strikes against it if it moves within their reach."* (40)

**Packmate's Warning** — *Instinct / Cognitive* · Reaction; — → **unchanged.** *"When an ally within 10 ft is targeted by an attack they can't see, grant them +2 to their defense against it."* (22) Free and unconditional; rule 3 converts costed Reactions, and this one never cost.

**Natural Order** — *Instinct / Cognitive* · 2 Actions; 2 Investiture → **unchanged — a release (FG1-1; rule 4).** *"Spend 2 Investiture. For the scene, enemies within your Attunement Range cannot benefit from illusions, magical concealment, or advantage gained from deception."* (22)

### 2.3 Draw → Channel: the grove, and Green's three economies

The Key lays the ground on the Draw; the Channel makes it home. Round 1 in that order — Draw (a patch
where the party will stand), Channel at 1 or 2, one Action left — puts a healing floor under whoever
stands on the patch by the end of the round, with no card spent. Today the Key's terrain is a thing
the party avoids and the enemy is slowed by; under the frame it is the place the party fights from.

Three economies fall out, one per tree, and all three work at level 1 with the starting pool of about 4:

- **The Territory mage** channels and lays. Draw, Channel, and every Territory rider is free: Sudden
  Growth on an Opportunity seeds ground under a foe, Spreading Roots grows the patch once a round for
  nothing, Grasping Vines holds the one who reached the party for as long as the Channel is up, and
  Pack Sense adds the modifier to one ally's swing into the ground each round. At rank 2 a single Draw
  is a 15-foot patch; with Spreading Roots it is the field by round 3.
- **The healer** channels and surges. The frame is the trickle (1 – 3 per ally on the ground per turn);
  Verdant Mend and Mender's Instinct are the surges, both free, and Resurgent Growth follows every
  surge off the ground. The Draw is for the pool and the patch. Reknit Form still costs — and, with
  the Channel running out of combat at a maintain a minute (FG1-4 (b)), the grove is where the party
  rests: a minute of channelling at 1 is 1 Investiture for 1 health to everyone on the ground, a
  slow, cheap recovery the heal-cut gate still governs.
- **The pack** channels for the ground and pays for the hunt. Pack Hunter, Pack Pressure, Drive the
  Prey and Natural Order keep their costs; the free Instinct cards run as today. This is the
  Blue-Illusion position again: the ground heals the pack for the Channel's price, and the real
  decision each round is **ground or prey** — a round spent on Drive the Prey's 2 is a round the
  Channel was maintained at 1, and the trickle is 1 instead of 2 for everyone on the patch.

### 2.4 Before and after

| # | Talent | Tree / Realm | Today | Proposed | Condition |
|---|---|---|---|---|---|
| 1 | Green Leyline Attunement | Key | Passive; — | Passive; — | — (Draw Mana rider) |
| 2 | Primal Awareness | Territory / Spi | Passive; — | Passive; — | — |
| 3 | Grasping Vines | Territory / Spi | 1 Action; 1 Inv (+1/turn) | **1 Action; —** | while channelling; held while channelling |
| 4 | Territorial Instinct | Territory / Spi | Reaction; 1 Inv | **Reaction; —** | while channelling |
| 5 | Thorn Field | Territory / Spi | Passive; — | Passive; — | — |
| 6 | Spreading Roots | Territory / Spi | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 7 | Sudden Growth | Territory / Spi | Special; Opp, 1 Inv | **Special; Opp** | while channelling |
| 8 | Pack Sense | Territory / Spi | Special; 1 Inv | **Special; —** | while channelling; once per round |
| 9 | Apex Predator | Territory / Spi | Passive; — | Passive; — | — |
| 10 | Mender's Instinct | Restoration / Phy | Reaction; 1 Inv | **Special; —** | while channelling; once per round |
| 11 | Verdant Mend | Restoration / Phy | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 12 | Resurgent Growth | Restoration / Phy | Passive; — | Passive; — | **while channelling** |
| 13 | Natural Recovery | Restoration / Phy | Special; Opp | Special; Opp | — |
| 14 | Hardy | Restoration / Phy | Passive; — | Passive; — | — |
| 15 | Collected | Restoration / Phy | Passive; — | Passive; — | — |
| 16 | Reknit Form | Restoration / Phy | 2 Actions; Var Inv | 2 Actions; Var Inv | — (release) |
| 17 | Vital Surge | Restoration / Phy | Special; 1 Inv | **Special; —** | while channelling |
| 18 | Predator's Instinct | Instinct / Cog | Passive; — | Passive; — | — |
| 19 | Pack Hunter | Instinct / Cog | Special; 1 Inv | Special; 1 Inv | — (release) |
| 20 | Scent the Weak | Instinct / Cog | Special; — | Special; — | — |
| 21 | Pack Pressure | Instinct / Cog | 1 Action; 1 Inv | 1 Action; 1 Inv | — (release) |
| 22 | Coordinated Hunt | Instinct / Cog | Passive; — | Passive; — | — |
| 23 | Drive the Prey | Instinct / Cog | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |
| 24 | Packmate's Warning | Instinct / Cog | Reaction; — | Reaction; — | — |
| 25 | Natural Order | Instinct / Cog | 2 Actions; 2 Inv | 2 Actions; 2 Inv | — (release) |

**Nine cards change** (3, 4, 6, 7, 8, 10, 11, 12, 17); **sixteen are untouched** — the Key, ten free
cards, and **five releases**. Between Red's ten and Black's four.

### 2.5 The phrasing fixes that ride the data pass

No "creature" is swept on a card whose sentence does not change; none of the nine changed sentences
carries one (Reknit Form's stays, unchanged).

- **Spreading Roots** — trailing whitespace on the source prose (`data/leyline.json`).
- **Grasping Vines** — its `edha-def-test` rule's `note` (*"On a success, spend 1 Investiture at the
  start of each of your turns to maintain the vines."*) and its `edha-triggered-effect`'s
  `statusExpire: ""` (until removed by hand) both change under FG2-1 (a) — §4 carries the rule; the
  note is player-facing text asking for a cost that no longer exists.
- **Mender's Instinct**, **Pack Sense**, **Vital Surge**, **Spreading Roots** — their rules' `cost`
  fields and prompt strings (*"Spend 1 Investiture …"*) go with the cost; §4 lists them.
- **Natural Recovery** — `prerequisites` reads *"Green 2+; Medicine 3+"*, a two-gate prerequisite
  `validate-build.py` already parses; unchanged card, noted only.

### 2.6 Gate 2 — the menu

Every judgment call in §2, recommended default first.

**FG2-1. Grasping Vines' upkeep.** (a) **The Channel is the upkeep: Restrained for as long as you
channel; the upkeep line goes — recommended** (the roots are the ground's, and the ground is alive
while the Channel is; a maintain a round is the same price as today's upkeep with every other rider
thrown in). (b) Keep the *"spend 1 Investiture at the start of your turn to maintain"* line — a rider
with an Investiture cost on its second sentence, against rule 1. (c) Restrained until the end of your
next turn, no upkeep — shorter, and the card stops being a hold.

**FG2-2. Reknit Form.** (a) **A release, unchanged — recommended** (rule 4: an injury removed
outlasts the scene; under FG1-4 (b) a free Reknit in a maintained grove would close every injury in
the party for one payment a minute). (b) A rider gated on the spend — *"while channelling 2 or more,
a temporary injury; 3 or more, a permanent one"* — rule 5 scaled to its two costs, and the
out-of-combat problem above. (c) A plain rider.

**FG2-3. The frame's tick and the heal riders.** (a) **The regen is the power's, not a Green
talent's heal: Vital Surge, Natural Recovery and Resurgent Growth do not fire on it — recommended**
(RD-2's shape; otherwise every ally on the ground below half draws temporary HP, a cleanse offer and
a regrowth queue each turn). (b) It counts as a Green heal — the full fusion, and the Restoration
tree fires off the frame every turn.

**FG2-4. Mender's Instinct.** (a) **A "while channelling" Special, once per round — recommended**
(rule 3: it does not test; its rule already carries `oncePerRound: true`). (b) Stays a Reaction —
the one Green Reaction that would then spend the slot on a heal the Special could give for free.

**FG2-5. "Once per round." on Spreading Roots and Pack Sense.** (a) **Yes, both — recommended**
(free, Spreading Roots would expand on every turn-end in the patch and Pack Sense would ride every
ally attack into it; BL2-D's precedent). (b) Pack Sense only — the roots may grow as often as the
patch is stood in. (c) Neither.

> **Answered at gate 2 (Ben, chat, 2026-09-17):** *"looks good"* — **FG2-1 … FG2-5 (a).** §2 committed
> on that answer.
