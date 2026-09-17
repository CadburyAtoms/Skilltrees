# Black, worked — the Channel model applied

**Design document for TODO item 211's Black leg** (the Black / Red / Green passes on the Channel model).
Black is the fourth colour worked, in the same session as Red and on the same PR (Ben: *"433 getting
multiple colors is fine"*). The rule (`docs/design/channel-actions.md` §1) and the build shape (§4) are
**decided and fixed**; the frame (§2.4, F-K (a) *the hunt*) was **re-opened by Ben at the start of this
pass, three alternatives were tabled, and the fourth was chosen** — §1.2 records why and §1.1 carries
the amended text. **DOCS-ONLY: nothing here edits data, the engine or the packs.** The build is item
198's Black leg.

**How this document was made.** One section at a time, in full text, with Ben's yes gating each
section before the next was written and before any commit. Every judgment call is a menu entry with a
recommended default, answered at its gate; nothing below assumes an answer that was not given. The
gate log is the record.

| Gate | Section | Status |
|---|---|---|
| 0 | The frame re-opened (FK-1) | **✅ answered 2026-09-17** — FK-1 (d) *the forsaking*, replacing the hunt, conditional on the Hunter overlap being modest (§1.2 measures it) and the word "quarry" staying Hunter's |
| 1 | §1 Black's three trees, and the forsaking applied | **✅ approved 2026-09-17** — BK-1 … BK-6 all (a); *"defaults. looks good."* |
| 2 | §2 The twenty-five cards | **✅ approved 2026-09-17** — BK2-1 … BK2-5 all (a) |
| 3 | §3 The mix, against the bands | **✅ approved 2026-09-17** — BK3-1 (a); *"Looks good."* |
| 4 | §4 The build notes for Black | **✅ approved 2026-09-17** — BB-1 … BB-4 all (a); *"defaults."* |
| 5 | §5 Close-out | — |

**What this rests on** (read in this order; nothing below re-derives them):
`docs/design/channel-actions.md` §1.1 (the four definitions), §1.4 (the interactions), §1.5 and §2.1
(the Realm map: Ritual Physical, Subjugation Cognitive, Isolation Spiritual), **§2.4 (F-K, the frame
as approved at gate 2 and amended here)**, §3.2 (the seven conversion rules), §4.3; `channel-blue.md`
§1.2 – §1.3 (the domain rule and the five things the class decides); `channel-red.md` §1.4 (the
domain rule's third application; an attack built of Investiture is a release) and §1.5 (a frame may
be a stack); `EDHA_RULINGS.md` R-111 (Withering Ray, the leyline damage ceiling), R-63 (isolation is
not judgeable when a side will not resolve), the 07-05 ruling (Isolated is positional: no ally within
5 feet); `.claude/skills/leyline-revision-guide/SKILL.md` Part 4 (Black's identity block as corrected
2026-09-13: *Weakened is the working condition*; Black *taxes* focus and reads its loss; `Puppeteer`
needs a 0-focus target the colour cannot produce); the engine's `edhaIsIsolated`
(`03-where-an-effect-lives.js:390`: an INFLICTED `isolated` status counts the same as positional —
Chaos's precedent, `42-chaos.js:24`); and `data/leyline.json` + `data/authored/leyline-black.json`
for every card quoted — **every card below was read from both on 2026-09-17 at `main` `ba796d4`,
card text and `events`. Nothing is written from memory.**

**Today's Black:** 15 Passives, 1 Special, 3 single Actions, 3 two-Action cards, 1 Free Action,
2 Reactions; 10 of 25 cost something — 9 Investiture (one also 2 focus, one also health) and 1 health
only (Withering Ray) — for an Investiture tree-sum of **11** (`talent-comparison-mistborn-radiant.md`
§C.2).

---

## 1. Black's three trees, by Realm — and the forsaking applied

### 1.1 The frame, as amended

The frame approved at gate 2 of the parent design (§2.4, F-K (a)) was *the hunt*: your attacks against
Isolated creatures deal extra vital damage equal to the channelled Investiture. Ben re-opened it at the
start of this pass and asked for three alternatives; §1.2 records the three and why the fourth was
chosen. The replacement keeps the hunt's payoff and moves its condition from *found* to *chosen*:

> **Channel Black.** When you channel or maintain Black, choose an enemy you can see within Attunement
> Range. It is forsaken: it counts as Isolated, and your attacks against it deal extra vital damage
> equal to the Investiture you spent.

This document calls the chosen creature **the forsaken** (BK-1) and the frame **the forsaking**. The
word *quarry* is Hunter's and does not appear on any Black card. The Draw Mana rider is unchanged:
enemies within Attunement Range with no ally within 5 feet become Weakened — and the forsaken, being
Isolated, is one of them, so **Channel → Draw** is the opening the whole tree pays off.

| Tree | Realm | What its riders do to the frame |
|---|---|---|
| **Isolation** | Spiritual | press the solitude the frame declared — close on it, strand its allies, Weaken it, hold it where it stands, punish its every step |
| **Ritual** | Physical | pay blood for more of the same vital, and bank the blood as the Investiture that keeps the Channel up |
| **Subjugation** | Cognitive | break the will of whoever the hunt has cornered — the focus tax, the denied turn, the puppet at zero |

The assignment is §2.1's, unchanged; Black's Physical cell is the legacy guide's own words (*"HP
sacrifice … vital damage"*).

### 1.2 Why the hunt was replaced

Recorded so that §2.4 of the parent design can carry the amendment (BK-6). The hunt passed all three
of the tests that failed Red's rising edge — it is not one card promoted, its domain is wide enough,
and two of three trees ride it mechanically — so this is not a repair. It is a choice Ben made with
four frames in view:

1. **Shape.** After the Red pass, Red's frame is *the mage's own extra damage per hit, conditioned on
   the field*. The hunt is the same sentence with a different condition, and the two damage colours'
   base actions would have been one shape. Black's distinct identity is control — solitude, denial,
   the will taxed — and the frame should say so.
2. **The formation switches the hunt off.** Isolated is positional: the bonus ends the moment an enemy
   ally steps within 5 feet of the target, and the tree has exactly one push (Unnerving Approach, once
   per turn) to reopen it. A disciplined enemy line denies the frame entirely.
3. **The three alternatives, and why not them.** *The leech* (Ritual: regain health equal to the spend
   on every vital hit) is the vampire rather than the hunter, shares its shape with Green's refused
   regrowth line, and makes R-111's damage ceiling net positive on health. *The hollowing*
   (Subjugation: Weakened enemies in range lose focus equal to the spend at the start of their turn) is
   the only frame that is nothing else's shape and the only one that bridges Isolation and Subjugation
   — and against the bestiary's pools (minions average about 1 focus, rivals under 3, bosses under 5,
   `CENSUS.md` §2) it is the strongest control frame of the five colours, empty before the first Draw,
   and Ritual rides it only by gate. *The forsaking* keeps the hunt's number and its vital type, lets
   the mage choose the prey, and lights every Isolation card against it whatever the enemy line does.

**The Hunter overlap, measured** (Ben's condition). Hunter's `Seek Quarry` is a Key: choose a character,
gain an advantage on tests to find, attack and study it; scene-long, re-chosen after a kill (`Cold
Eyes`); eight more Hunter cards designate it or pay it off; in the engine it is the `lists.quarry`
ledger with the registered `quarry` status. Black's forsaken is chosen each payment, lasts until the
next, counts as Isolated and adds vital; it reads its own ledger and its own status, and no Hunter card
reads it. The shape is shared (one chosen enemy the kit lights up against); the effects do not touch
(advantage against vital and Isolated); the one meeting is the Hunter/Black character, who puts both
marks on one creature — the assassin build the two paths already imply, a synergy rather than a
collision. The overlap is modest.

> **Gate 0 (Ben, chat, 2026-09-17):** *"Propose three other possible frames for black"* → the leech,
> the hollowing, the quarry tabled with the hunt; *"how does the quarry line up against Heroic
> Hunter's quarry? If the overlap isn't too bad, and the 'quarry' title stays with Hunter, I'm fine
> with it."* → **FK-1 (d)**, renamed off "quarry" (BK-1).

### 1.3 What the frame does to each tree's identity

**Black's case is its own: the frame is a declaration.** White's frame was an effect no card had, Blue's
its cards promoted, Red's a stack fed by the field. Black's frame *declares a fact* — this one is alone
— that the whole tree was built to read. The design doc's first Black draft was refused at gate 2
because *"no ally within 5 feet" is the definition of Isolated* and a frame that restates a definition
is not a frame. The forsaking does not restate the definition; it **overrides** it for one creature,
which is exactly what Chaos already does with its inflicted `isolated` status (`42-chaos.js:24`,
OR'd into `edhaIsIsolated`). Nothing here asks the table to accept a fiction the engine does not
already hold.

**Isolation (Spiritual) presses the solitude the frame declared.** Every Isolation card reads Isolated
or Weakened, and the forsaken is the first and, after the Draw, the second. Sapping Hex Weakens it on
the first hit if the Draw has not; Severance makes the sword vital against it; Cruel Step closes on it
without provoking; Dread Presence holds it away from its allies once Weakened; Sovereign of Solitude
punishes the step it takes anyway; Predatory Patience adds the die and refunds the Investiture on every
hit; Spoils of Isolation pays the whole Weakened set off at once. Unnerving Approach is the one card the
frame partly supersedes — it *makes* Isolated by pushing an ally away — and it keeps a job: a **second**
Isolated creature for Sapping Hex and Severance, beside the forsaken. All four of Isolation's costed
cards sit inside the domain (§1.4) and become riders.

**Ritual (Physical) pays blood for more of the same, and the Channel already runs on blood.** Withering
Ray and Dark Investiture are Black attacks; against the forsaken they carry the frame's vital on top of
their own. And the Ritual economy meets the Channel without a new card: **Sanguine Reservoir banks
health lost to a Ritual as Reserve, and Reserve spends as Investiture** — so a bleeding Ritualist
maintains the Channel from the Reserve. The parent design's "*you may maintain it by losing health*"
rider (§2.4) is already true through Reserve, and BK-5 recommends saying so rather than adding a clause.
Ritual's two Investiture costs — Dark Investiture (1 Investiture and blood, any character) and Double
Dip (2 Investiture, a scene-long mark) — buy into any character's situation rather than the forsaken's,
and Double Dip is scene-long (rule 4): both are releases.

**Subjugation (Cognitive) is Black's release tree.** Its five free passives stay free — Coercive
Pressure, Whispered Doubt, Extract Thought, Siphoned Will, Composed — and its three costed cards (Hollow
Command, Predatory Insight, Puppeteer) buy into *any* character's will, focus or actions, with no
condition on solitude. By the domain rule they are outside and keep their cost, as Illusion's did for
Blue and Conflagration's for Red. This is the third colour in a row whose release tree sits in a
*different* Realm (Physical, Spiritual, now Cognitive), which is Blue's §1.2 prediction — a release tree
is not a Realm law — confirmed three times. BK-3 (b) offers the other reading: Subjugation's three as
riders **gated to the forsaken or the Weakened**, which would converge all three trees on one prey at
the cost of narrowing three cards that work on anyone today.

### 1.4 The domain, and Black's release principle

`channel-blue.md` §1.2 fixed the release test: a card whose Investiture buys an effect **outside the
frame's domain** is a release. Black's domain is

> **the forsaken and the Weakened** — the creature you have severed, the creatures the Draw has
> marked, and what your attacks and your solitude-makers do to them.

Run over the nine Investiture-costed cards:

| Card | Its Investiture buys | Domain | Class |
|---|---|---|---|
| Spoils of Isolation | vital to every Weakened creature in range, and their damage as temporary health | inside | rider |
| Cruel Step | 10 feet toward an Isolated character without provoking | inside | rider |
| Unnerving Approach | an enemy's ally pushed away, leaving it Isolated | inside | rider |
| Sovereign of Solitude | a Weakened creature's movement stopped, and vital | inside | rider |
| Dark Investiture | vital and an affliction on any character, paid in blood too | outside | release |
| Double Dip | a scene-long mark on any character | outside (rule 4) | release |
| Hollow Command | any character's next turn denied | outside | release |
| Predatory Insight | your own advantage on Deception | outside | release |
| Puppeteer | one action of any 0-focus character | outside | release |

**Four riders, five releases** — Red's count exactly, from the same rule. The Investiture tree-sum
falls from 11 to 6 (Dark Investiture 1, Double Dip 2, Hollow Command 1, Predatory Insight 1,
Puppeteer 1); Withering Ray keeps its health cost and never had an Investiture one. §3 measures it.

**Black's release principle (BK-3):** a card that names *any character* as its target buys into a
situation the frame does not own. The Isolation tree never says "any character" — every one of its
cards says Isolated or Weakened — and that is why it converts whole. Red's corollary (an attack built
of Investiture is a release) does not arise: Black's one Investiture-built attack, Dark Investiture,
is already outside by target.

**The five things the class decides** (`channel-blue.md` §1.3) read the same for Black, with the fifth
weighted the way Red's was: an adversary minion carrying Hollow Command still fires it; one carrying
Cruel Step must open a Channel first, and its forsaken is chosen at role rank.

### 1.5 The forsaking, in full

Stated once, so §2's riders and §4's build have one text to point at.

- **It is chosen.** On every payment — the opening Channel and every maintain — you choose one enemy
  you can see within Attunement Range. You may choose the same creature again. There is one forsaken
  at a time; choosing another releases the first.
- **It lasts until your next payment.** A forsaken not re-chosen at the next payment is released; the
  mark ends with the Channel (BK-4). It does not end when the creature moves, when its allies close, or
  when it is hit.
- **It counts as Isolated — for everyone, not only for you** (BK-2 (a)). The engine's registered
  `isolated` status is inflictable and `edhaIsIsolated` reads it before it reads positions
  (`03-…js:398`), so the forsaken satisfies every Isolated check in the game: the Key's Draw Mana pulse
  (it becomes Weakened on your next Draw), Sapping Hex, Severance, Cruel Step's gate, Green's pack
  filter, Chaos's own readers. Two Black mages who forsake different creatures make two Isolated
  creatures; one creature forsaken by both is Isolated once and takes the larger vital (M14 (a)).
- **What the spend buys.** Your attacks against the forsaken deal extra vital damage equal to the
  Investiture you spent at the last payment: +1 for a trickle, +2 at a flood at levels 1 – 5, +3 from
  level 6. "Attacks" is the system's word — a weapon Strike, Withering Ray's and Dark Investiture's
  Black attack tests — so a melee Black mage and a Ritualist both carry it. It stacks with Severance
  (vital *instead of* the weapon's type) without doubling it, and with Predatory Patience's die.
  Against a d8 Strike with the Strength modifier in, +2 is about a quarter more; against Withering
  Ray's 2d6, about +30 % — the band of Red's heat, which carries the same numbers on the other
  condition.
- **It is the mage's own damage.** Nothing lands on other creatures from the frame except the Isolated
  fact; the vital is on your attacks alone.
- **Adversaries.** R-137: at role rank. A minion forsakes one PC at 1; a boss floods at 3.
- **Outside combat.** M11: a Channel opened outside combat lasts until the scene ends or you end it; a
  forsaken chosen outside combat stays forsaken until the first maintain in combat re-chooses.
- **Weakened is still the working condition.** The frame does not apply Weakened; the Draw does, and
  Sapping Hex does on the first hit. The tree's Weakened payoffs (Predatory Patience, Spoils, Dread
  Presence, Sovereign of Solitude) read the Draw's mark as today. What the frame changes is that the
  Draw is now guaranteed at least one creature to mark.

### 1.6 Gate 1 — the menu

Every judgment call in §1, recommended default first.

**BK-1. The name for the chosen creature.** (a) **"Forsaken", on the card as *"It is forsaken"* and in
prose as the forsaken / the forsaking — recommended** (the allies' failure, not the mage's chase;
*quarry* stays Hunter's; unused anywhere in the four data files). (b) "Sundered". (c) "Marked" —
Double Dip's flavour already uses *mark* for its own scene-long effect. (d) No noun on the card;
prose only.

**BK-2. Isolated for whom.** (a) **For everyone: the frame applies the engine's existing inflictable
`isolated` status (Chaos's precedent, `42-chaos.js:24`), so the Key's Draw Weakens the forsaken and every
Isolated reader in the game sees it — recommended** (no new engine branch; the fact is the fact).
(b) For your Black talents only — a per-owner ledger and a second predicate in `edhaIsIsolated`; a
Green ally's pack filter and a second Black mage's Sapping Hex would not see it.

**BK-3. The domain and the release principle.** (a) **A card whose target is *any character* is
outside the domain and keeps its cost; Subjugation's three costed cards and Ritual's two are releases,
Isolation's four convert — recommended** (the rule as Blue and Red applied it; no card's condition is
rewritten). (b) Subjugation's three become riders gated *"against the forsaken or a Weakened
character"* — free, and all three trees converge on one prey; three cards that work on anyone today
are narrowed. (c) Card by card at gate 2 with no principle.

**BK-4. How long the forsaken lasts.** (a) **Until your next payment, re-choosable, gone with the
Channel — recommended** (Blue's reading has the same lapse; a maintain is a decision). (b) Until it
drops, then re-choose — Hunter's `Cold Eyes` shape, and the word Ben kept for Hunter. (c) The scene.

**BK-5. Ritual and the Channel's cost.** (a) **No new clause: Sanguine Reservoir's Reserve already
spends as Investiture, so a Ritualist maintains the Channel from banked blood; §2 says so on
Sanguine Reservoir's line and the parent design's "maintain it by losing health" rider is noted as
already true — recommended.** (b) Add an explicit *"while channelling Black, you may maintain it by
losing health equal to the Investiture you would spend"* clause to Sanguine Reservoir — a second
route to the same economy, and a card that now says two things.

**BK-6. Where the amendment lives.** (a) **This PR also edits `docs/design/channel-actions.md`
§2.4: a dated amendment block under F-K recording FK-1 (d), the replaced card sentence and a pointer
here, with the original struck through — recommended** (RD-7 (a)'s shape; the parent design is what
item 198 builds from). (b) Record here only. (c) Rewrite §2.4 in place.

> **Answered at gate 1 (Ben, chat, 2026-09-17):** *"defaults. looks good."* — **BK-1 … BK-6 (a).** §1
> committed on that answer; BK-6 (a) applied in the same commit (the amendment block under F-K in
> `docs/design/channel-actions.md` §2.4).

---

## 2. The twenty-five cards

### 2.1 The conversion rules, applied to Black

1. **Isolation's four costed cards become riders** (BK-3 (a)): Spoils of Isolation and Cruel Step keep
   their Actions and lose the Investiture; Unnerving Approach keeps its Free Action and its once per
   turn; Sovereign of Solitude keeps its Reaction (it tests — rule 3) and **gates on channelling 2 or
   more** (BK2-1). *(BK2-A.)*
2. **Five releases, unchanged** (BK-3 (a)): Dark Investiture, Double Dip (also rule 4, scene-long),
   Hollow Command, Predatory Insight, Puppeteer. Every card whose target is *any character*. *(BK2-B.)*
3. **Withering Ray is neither.** It costs blood and no Investiture, so rule 1 has nothing to remove and
   rule 2's spirit applies — the Channel costs, it does not take. Unchanged (BK2-3).
4. **Every free passive stays free and unconditional** (rule 2). None is the frame's clause in another
   Realm: Severance *converts* the type where the frame *adds* vital, so the two compose (BK2-2);
   Sapping Hex applies a condition the frame does not; Dread Presence reads the Draw's mark. Black is
   the first colour with **no** W-1 exception.
5. **Rules 6 and 7 have no Black consumer.** The frame is the number (as Blue's and Red's were), and
   the frame itself is what rides the payment — the forsaken is chosen there — so no card needs
   `edha-channel`.
6. **Rule 5 has one, scaled.** White's capstone gated on 3 because it cost 3; Sovereign of Solitude
   costs 2 and gates on 2 — at Black 3+ (level 6) that is two-thirds of a flood, and one Draw funds it
   every round with one to spare.
7. **No "Once per round." is added.** Spoils and Cruel Step cost Actions, Unnerving Approach already
   says once per turn, and Sovereign is a Reaction.

Convention as before: "*While channelling Black,*" at the head of the card; prerequisites and
connections unchanged — this pass changes action type, cost and text, not the graph.

### 2.2 The twenty-five cards

Format: **name** — *tree / Realm* · today → proposed · the card sentence as it would ship (word count;
was).

**Black Leyline Attunement** — *Key* · Passive; — → **unchanged** (M10). *"When you Draw Mana, enemies you can see within Attunement Range with no ally within 5 feet become Weakened."* (19) Under the frame the pulse always has at least one creature to mark: the forsaken is Isolated, so the Draw Weakens it (BK-2 (a)).

**Predatory Patience** — *Isolation / Spiritual* · Passive; — → **unchanged.** *"When you attack a Weakened creature, add [Die] to the test. On a successful attack against a Weakened creature, regain 1 Investiture."* (22)

**Sapping Hex** — *Isolation / Spiritual* · Passive; — → **unchanged.** *"When you hit an Isolated character (one with no ally within 5 feet), it becomes Weakened."* (16) Reads the forsaken as Isolated; the first hit Weakens it if the Draw has not.

**Spoils of Isolation** — *Isolation / Spiritual* · 2 Actions; 1 Investiture → **2 Actions; —.** *"While channelling Black, each Weakened character within Attunement Range takes vital damage equal to your tier. You gain Temporary HP equal to the total vital damage dealt."* (27; was 27)

**Severance** — *Isolation / Spiritual* · Passive; — → **unchanged** (BK2-2). *"Your attacks against Isolated characters deal vital damage instead of their normal damage type."* (14) Composes with the frame rather than doubling it: the type converts, the frame adds.

**Cruel Step** — *Isolation / Spiritual* · 1 Action; 1 Investiture → **1 Action; —.** *"While channelling Black, move 10 feet towards an Isolated character within Attunement Range without provoking Reactive Strikes."* (17; was 18)

**Unnerving Approach** — *Isolation / Spiritual* · Free Action; 1 Investiture → **Free Action; — (BK2-4).** *"While channelling Black, once per turn, when you move adjacent to an enemy, choose one character allied to it within 10 feet and push it [Size] feet directly away, potentially leaving the enemy Isolated."* (34; was 35) Its job under the frame is a second Isolated creature beside the forsaken.

**Dread Presence** — *Isolation / Spiritual* · Passive; — → **unchanged.** *"Weakened characters within Attunement Range cannot willingly move closer to any allies."* (12)

**Sovereign of Solitude** — *Isolation / Spiritual* · Reaction; 2 Investiture → **Reaction; — , gated on the spend (BK2-1).** *"While channelling 2 or more Black, when a Weakened character within Attunement Range moves, reduce its movement rate to 0 and test Black vs. Spiritual, rolling [Tier][Die] vital damage on a success."* (32; was 29) A Reaction that tests stays a Reaction (rule 3); a 2-Investiture card gates on channelling 2, rule 5 scaled to the card.

**Blood Price** — *Ritual / Physical* · Passive; — → **unchanged.** *"When you lose health to activate a Ritual talent, gain an advantage on your next Black test."* (17)

**Hardy** — *Ritual / Physical* · Passive; — → **unchanged** (shared generic; R-102). *"Gain +1 maximum HP per level, including previous levels."* (9)

**Withering Ray** — *Ritual / Physical* · 1 Action; Lose HP = half [Die] → **unchanged** (BK2-3). *"Lose half [Die] health, then make a ranged Black attack vs. Spiritual against a character within Attunement Range. On a hit, deal 2[Tier][Die] vital damage."* (25) No Investiture to convert; blood is Ritual's identity cost (M13). Against the forsaken it carries the frame's vital on top of its own.

**Necrotic Grasp** — *Ritual / Physical* · Passive; — → **unchanged.** *"When you hit a character with a Black attack, the healing it receives is halved until the end of your next turn."* (22)

**Dark Investiture** — *Ritual / Physical* · 2 Actions; 1 Investiture + Lose HP = Tier → **unchanged — a release (BK-3).** *"Spend 1 Investiture and lose health equal to your tier, then test Black vs. Spiritual of a character within Attunement Range. On a success, the target takes [Tier][Die] vital damage and becomes Afflicted [[Tier][Die] vital]."* (35) Any character; outside the domain.

**Sanguine Reservoir** — *Ritual / Physical* · Passive; — → **unchanged** (BK-5 (a)). *"When you lose health from a Ritual talent, store the lost amount as Reserve, up to a maximum equal to your ranks in Black. You may spend Reserve as Investiture."* (30) Reserve spends as Investiture, so it pays a Channel or a maintain; the parent design's "maintain it by losing health" rider is already true through this card.

**Double Dip** — *Ritual / Physical* · 1 Action; 2 Investiture → **unchanged — a release (BK-3; rule 4).** *"Spend 2 Investiture and test Black vs. Cognitive of a character within Attunement Range. On a success, for the scene, you may spend Reserve in place of health for Ritual talents that target that character."* (35)

**Predator's Due** — *Ritual / Physical* · Passive; — → **unchanged.** *"When you reduce a character to 0 health, regain [Tier][Die] health and 1 Investiture."* (14) Its `prerequisites` field and flavour line are §2.5 hygiene.

**Siphoned Will** — *Subjugation / Cognitive* · Passive; — → **unchanged.** *"When you successfully apply Hollow Command to a creature, regain focus equal to your tier."* (15)

**Coercive Pressure** — *Subjugation / Cognitive* · Passive; — → **unchanged.** *"When an enemy within Attunement Range loses focus, it has a disadvantage on its next Cognitive test. Once per round per enemy."* (22)

**Predatory Insight** — *Subjugation / Cognitive* · Special; Opportunity, 1 Investiture → **unchanged — a release (BK-3).** *"When you roll an Opportunity, you may spend it and 1 Investiture to gain an advantage on your next Deception test this round. Regain 1 focus when any character reaches 0 focus."* (32)

**Extract Thought** — *Subjugation / Cognitive* · Passive; — → **unchanged.** *"When you succeed on a Deception test against a character, it cannot take Reactions until the end of your next turn."* (21)

**Whispered Doubt** — *Subjugation / Cognitive* · Passive; — → **unchanged.** *"When an enemy within Attunement Range spends focus, it spends 1 additional focus. Once per round per enemy."* (18)

**Composed** — *Subjugation / Cognitive* · Passive; — → **unchanged** (shared generic; R-102). *"Increase your maximum focus by your tier."* (7)

**Hollow Command** — *Subjugation / Cognitive* · 2 Actions; 1 Investiture → **unchanged — a release (BK-3).** *"Spend 1 Investiture and test Deception vs. Spiritual of a character within Attunement Range. On a success, the target cannot take actions on its next turn."* (26)

**Puppeteer** — *Subjugation / Cognitive* · Reaction; 2 Focus, 1 Investiture → **unchanged — a release (BK-3).** *"When a character within Attunement Range with 0 focus takes its turn, spend 2 focus and 1 Investiture to choose one of its actions on that turn."* (27)

### 2.3 Channel → Draw: the opening, and Black's three economies

The forsaking is chosen on the payment, and the Key's pulse Weakens whoever stands Isolated on the
Draw. Under the frame those two Actions in either order guarantee the opening the tree was written
for: **one creature that is Isolated *and* Weakened by the end of round 1**, before any hit lands. Today
that opening depends on the enemy's spacing; a formation denied it, and the tree's answer was one push.
Every Weakened payoff — Predatory Patience's die and refund, Dread Presence's lock, Spoils, Sovereign —
now fires against a creature the mage picked.

Three economies fall out, one per tree, and all three work at level 1 with the starting pool of about 4:

- **The Isolation mage** channels and pays nothing else. Round 1: Channel at 1 or 2 (name the prey),
  Draw (it is Weakened), Cruel Step free into reach or a Strike with Severance's vital and the frame's
  on it. Every round after: maintain as a Free Action, three Actions, Predatory Patience handing back
  1 Investiture on every hit against the Weakened — at a trickle the tree is **Investiture-positive**
  while the hunt lasts, and the Draw is for the pulse, not the pool.
- **The Ritualist** channels from blood. Withering Ray costs about 2 health at rank 1 and Sanguine
  Reservoir banks it as Reserve up to the Black rank; Reserve pays the maintain. A Ritualist who casts
  every round keeps the Channel up without a Draw, and Blood Price's advantage rides every cast. Dark
  Investiture and Double Dip still cost Investiture on top — the two Ritual plays that are not about
  the prey.
- **The Subjugator** channels for the frame and pays for the tree. Hollow Command, Predatory Insight
  and Puppeteer keep their costs; the free passives (Whispered Doubt, Coercive Pressure, Extract
  Thought) run as today. This is the Blue-Illusion position: the Channel's vital is a bonus on the way
  to the will-breaking the player actually came for, and the real decision is **prey or puppet** — a
  round spent on Hollow Command is a round the Channel was maintained at 1.

### 2.4 Before and after

| # | Talent | Tree / Realm | Today | Proposed | Condition |
|---|---|---|---|---|---|
| 1 | Black Leyline Attunement | Key | Passive; — | Passive; — | — (Draw Mana rider) |
| 2 | Predatory Patience | Isolation / Spi | Passive; — | Passive; — | — |
| 3 | Sapping Hex | Isolation / Spi | Passive; — | Passive; — | — |
| 4 | Spoils of Isolation | Isolation / Spi | 2 Actions; 1 Inv | **2 Actions; —** | while channelling |
| 5 | Severance | Isolation / Spi | Passive; — | Passive; — | — |
| 6 | Cruel Step | Isolation / Spi | 1 Action; 1 Inv | **1 Action; —** | while channelling |
| 7 | Unnerving Approach | Isolation / Spi | Free Action; 1 Inv | **Free Action; —** | while channelling; once per turn |
| 8 | Dread Presence | Isolation / Spi | Passive; — | Passive; — | — |
| 9 | Sovereign of Solitude | Isolation / Spi | Reaction; 2 Inv | **Reaction; —** | while channelling 2 or more |
| 10 | Blood Price | Ritual / Phy | Passive; — | Passive; — | — |
| 11 | Hardy | Ritual / Phy | Passive; — | Passive; — | — |
| 12 | Withering Ray | Ritual / Phy | 1 Action; HP | 1 Action; HP | — (blood, no Investiture) |
| 13 | Necrotic Grasp | Ritual / Phy | Passive; — | Passive; — | — |
| 14 | Dark Investiture | Ritual / Phy | 2 Actions; 1 Inv + HP | 2 Actions; 1 Inv + HP | — (release) |
| 15 | Sanguine Reservoir | Ritual / Phy | Passive; — | Passive; — | — (Reserve pays the Channel) |
| 16 | Double Dip | Ritual / Phy | 1 Action; 2 Inv | 1 Action; 2 Inv | — (release) |
| 17 | Predator's Due | Ritual / Phy | Passive; — | Passive; — | — |
| 18 | Siphoned Will | Subjugation / Cog | Passive; — | Passive; — | — |
| 19 | Coercive Pressure | Subjugation / Cog | Passive; — | Passive; — | — |
| 20 | Predatory Insight | Subjugation / Cog | Special; Opp, 1 Inv | Special; Opp, 1 Inv | — (release) |
| 21 | Extract Thought | Subjugation / Cog | Passive; — | Passive; — | — |
| 22 | Whispered Doubt | Subjugation / Cog | Passive; — | Passive; — | — |
| 23 | Composed | Subjugation / Cog | Passive; — | Passive; — | — |
| 24 | Hollow Command | Subjugation / Cog | 2 Actions; 1 Inv | 2 Actions; 1 Inv | — (release) |
| 25 | Puppeteer | Subjugation / Cog | Reaction; 2 Foc, 1 Inv | Reaction; 2 Foc, 1 Inv | — (release) |

**Four cards change** (4, 6, 7, 9); **twenty-one are untouched** — the Key, fourteen free passives,
Withering Ray, and five releases. The smallest data pass of the four colours, for the reason §1.3 gave:
the frame declares the fact the tree already reads, so the tree needs almost no rewriting to ride it.

### 2.5 The phrasing fixes that ride the data pass

No "creature" is swept on a card whose sentence does not change; Sovereign of Solitude's changes and
takes "character".

- **Sovereign of Solitude** — trailing whitespace on the source prose (`data/leyline.json`); the
  authored card's `damageType: "energy"` on a rule whose kind is `status` is inert but misleading —
  §4 notes it.
- **Predator's Due** — `prerequisites` reads *"Black 3+; "* with a trailing semicolon; its flavour
  line has no full stop and a hyphen for a dash. Unchanged card, so the prerequisite (data hygiene,
  `validate.js` reads it) is fixed and the flavour is noted, not swept.
- **Cruel Step** — *"towards"* stays; the standard's *"toward"* is a sweep for another item.

### 2.6 Gate 2 — the menu

Every judgment call in §2, recommended default first.

**BK2-1. Sovereign of Solitude.** (a) **A rider gated on "while channelling 2 or more Black" —
recommended** (rule 5 scaled to the card's own cost; a free Reaction that immobilises and rolls
[Tier][Die] vital on every Weakened step should cost the mage something each round, and at Black 3+
the flood is 3). (b) A plain rider, "while channelling Black", no spend gate. (c) A release, unchanged
at 2 Investiture.

**BK2-2. Severance.** (a) **Stays a free, unconditional passive — recommended** (it converts, the frame
adds; they compose, and a level-1 Black mage with a sword against a positionally Isolated creature
should not need a Channel to make it vital). (b) A "while channelling" rider under W-1's test, as
Kindle became for Red.

**BK2-3. Withering Ray.** (a) **Unchanged — recommended** (no Investiture; blood is the identity cost).
(b) Gains "while channelling Black" for uniformity with the riders — the Channel would then *take*,
against rule 2's spirit.

**BK2-4. Unnerving Approach under a frame that declares Isolation.** (a) **A free rider, kept as the
second-Isolated tool — recommended** (Sapping Hex and Severance read any Isolated creature; a pushed
ally is a second prey). (b) A release, unchanged at 1 Investiture — a second declaration of solitude
should cost what the first did.

**BK2-5. "creature" → "character".** (a) **Only on the changed card (Sovereign) — recommended**
(BL-6's precedent). (b) Sweep Black's other two ("Weakened creature" on Predatory Patience, "Weakened
creature" on Sovereign's source) now.

> **Answered at gate 2 (Ben, chat, 2026-09-17):** *"defaults."* — **BK2-1 … BK2-5 (a).** §2 committed
> on that answer.

---

## 3. The mix, against the bands

| | Passive | Special | 1 Action | 2 Actions | Free | Reaction | Passive + Special | costed (any) | costed (Investiture) | Investiture tree-sum |
|---|---|---|---|---|---|---|---|---|---|---|
| **Black today** | 15 (60 %) | 1 (4 %) | 3 (12 %) | 3 (12 %) | 1 (4 %) | 2 (8 %) | 64 % | 10 (40 %) | 9 (36 %) | 11 |
| **Black proposed** | 15 (60 %) | 1 (4 %) | 3 (12 %) | 3 (12 %) | 1 (4 %) | 2 (8 %) | 64 % | **6 (24 %)** | **5 (20 %)** | **6** (+ the Channel, 1 – rank a round) |
| *Red proposed, for scale* | 11 (44 %) | 9 (36 %) | 3 (12 %) | 1 (4 %) | 1 (4 %) | 0 | 80 % | 7 (28 %) | 5 (20 %) | 6 |
| *Blue proposed, for scale* | 9 (36 %) | 8 (32 %) | 2 (8 %) | 2 (8 %) | 1 (4 %) | 3 (12 %) | 68 % | 9 (36 %) | 7 (28 %) | 9 |
| *White proposed, for scale* | 10 (40 %) | 11 (44 %) | 1 (4 %) | 0 | 0 | 3 (12 %) | 84 % | 4 (16 %) | 1 (4 %) | 1 |
| published Invested band | | | | | | 2 – 7 % | 71 – 87 % | 8 – 46 % | | |
| leyline guide target | ~35 % | 25 – 30 % | ~15 % | ~8 % | 5 – 8 % | 5 – 8 % | | | | |

*(Counts read from `data/leyline.json` at `ba796d4`: "costed (any)" is the nine Investiture cards plus
Withering Ray's health cost; the proposed row counts Withering Ray and the five releases. Not one
action type changes under this pass, so the six type columns are identical today and proposed.)*

**Read against the bands.** Black was, like Red, **already inside the costed band** — 40 % against
8 – 46 % — and the Channel takes it to 24 %, the Investiture-priced cards from nine to five and the
tree-sum from 11 to 6: the same landing as Red, from the same domain rule, with one fewer card
changing. Every surviving Investiture point is on a card that names *any character* as its target
(Dark Investiture, Double Dip, Hollow Command, Predatory Insight, Puppeteer). **Reactions at 8 %** sit
just over the published 2 – 7 % and inside the guide's 5 – 8 %: both survive on their merits, one
because it tests (Sovereign), one because it is a release (Puppeteer).

**Passive + Special stays at 64 %, seven points under the published band, and this pass does not
move it — on purpose.** Blue missed the same band by three points because six of its cards make
things and a card that builds a thing is an Action. Black misses it for the opposite reason, and the
number to look at is not Passive + Special but its two halves: **Passives at 60 % against the guide's
~35 %, Specials at 4 % against 25 – 30 %.** Black is the most passive-heavy tree in the atlas and the
most Special-poor, and it was both before the Channel. The published Invested families reach 71 – 87 %
by running 37 – 41 % *Special* — riders that fire on a trigger — where Black's fourteen free passives
fire on triggers too but are typed Passive. The Channel converts costs and Reactions; it does not
re-type a Passive into a Special, and manufacturing that conversion here would be a type change with
no design behind it (BK3-1). What the pass hands on instead is the observation: **a future Black
revision that wants the band should look at its Passive column, not its costs** — several of the
fourteen already read like Specials (Sapping Hex, Necrotic Grasp, Coercive Pressure, Extract Thought
all fire *once, on a hit or a test*), and the leyline guide's own targets would call them so.

**Where the remaining cost sits.** Subjugation carries three of the six surviving Investiture points
(Hollow Command 1, Predatory Insight 1, Puppeteer 1, plus Puppeteer's 2 focus), Ritual the other three
(Dark Investiture 1, Double Dip 2, plus both Ritual attacks' blood). **Isolation carries no Investiture
at all** — the hunt is free once the prey is named, and Predatory Patience pays the mage back on every
hit against it.

**What a Black player's turn is now.** Round 1: Channel Black at 2 out of a pool of 4 — name the
creature that matters, and it is alone whatever stands beside it — then Draw Mana: it is Weakened,
and so is anything else standing alone in range. One Action left: Cruel Step free into reach, or
Withering Ray at it with the frame's +2 vital on top of 2d6. Every round after: maintain as a Free
Action for 1 or 2 (keep the prey or move the mark), three Actions of Strikes that Severance makes
vital and the frame makes heavier, Predatory Patience's die on each and its Investiture back on each
hit, Sapping Hex and Dread Presence and Sovereign of Solitude running for nothing. A trickle pays for
itself; a flood costs a Draw, and the Draw is another pulse. The Ritualist's version pays the maintain
from Reserve and never draws. The real decision each round is **prey or puppet** for the Subjugator —
Hollow Command's 2 Actions and 1 Investiture against a maintained flood — and, for everyone, **keep
or move**: the mark is re-chosen at every payment, and the one creature you have Weakened, locked and
softened is usually the one to keep.

**What it costs, in numbers.** Today a Black round — Cruel Step and Spoils, or Withering Ray and a
Sovereign Reaction — spends 2 Investiture for two plays and earns 2 from a Draw (R-126). Under the
Channel the same 2 buys the frame and every Isolation rider, and at a flood at levels 1 – 5 adds
**+2 vital to every hit on the forsaken** — about +6 a round on three Strikes, or +6 on three
Withering Rays, before Predatory Patience's refunds; from level 6, +3 a hit. Red's heat carries the
same numbers on the other condition: Red's needs the fight to be loud and lands on any hit, Black's
needs nothing but the payment and lands on one creature. R-111's ceiling (three Withering Rays ≈ 33
vital for ~4.5 health) becomes ≈ 39 at a flood against the forsaken — the same +6 the ceiling gains for
Red — so the two damage colours move together and the ceiling holds relative to both. Item 210's
yardstick re-run should carry Black's row beside Red's: the two frames are the pair to price together.

**BK3-1. Passive + Special at 64 %.** (a) **Accept it as the tree's shape and hand the Passive-column
observation to the PM for a future Black revision — recommended** (no type changes with design
behind them exist in this pass). (b) Re-type four trigger-shaped free passives as Specials now
(Sapping Hex, Necrotic Grasp, Coercive Pressure, Extract Thought — 64 % → 64 %, since Passive + Special
is the sum; only the guide's two columns move). (c) Convert Spoils of Isolation to a Special on the
payment ("when you channel or maintain Black, each Weakened character in range takes vital equal to
your tier") — 68 %, the Guiding Signal shape; a 2-Action sweep for free every round is a large power
gain.

> **Answered at gate 3 (Ben, chat, 2026-09-17):** *"Looks good."* — **BK3-1 (a).** §3 committed on
> that answer.

---

## 4. The build notes for Black

What item 198's Black leg builds, named from what exists — every handler read from
`data/authored/leyline-black.json` and every line number re-derived against `main` `ba796d4`. **No code
and no data change in this pass.** Deploy class: **ENGINE (F5) + DATA — REBUILD leyline + ⟳ Sync
Talents, at 3.x only**, after item 187's flip (R-144). Black's frame is a **mark on one creature** —
the third frame shape after White's number-on-a-sheet, Blue's entry-on-the-next-test-list and Red's
stack — and it is built entirely from the marker-ledger family Black itself helped build (H3).

### 4.1 Black's riders and where §4.3's gate lands

Four cards become riders. Every one fires from `use`:

| Rider | Handler on `use` | Chained rules (no gate needed) | In the seventeen? | Gate lands in |
|---|---|---|---|---|
| Spoils of Isolation | `edha-status-sweep` (`53-…js:2002`) | — | **no — new** | the pre-cost veto, Widening F (ii) |
| Cruel Step | `edha-move` | — | yes (Red) | the pre-cost veto |
| Unnerving Approach | `edha-prompt-pick` | `edha-push` + `edha-note` on `edha-test-success` | yes (White) | the pre-cost veto |
| Sovereign of Solitude | `edha-triggered-effect` (kind `status`, `immobilized`) | — | yes (Red) | the pre-cost veto, **plus Widening H** (`requireChannelled: 2`) |

**Three findings for item 198's sizing:**

1. **Black adds one schema declaration** (`edha-status-sweep`) — eighteen across four colours — and
   **one dispatch site: the pre-cost veto alone**, Blue's position. Nothing in Black's rider set is read
   by `edhaWatchersOfRule`, `edhaActorRulesOf` or `edhaRulesForEvent`; the two Black rules that *are*
   (Dread Presence's `edha-move-veto`, read at `08-…js:230`; Severance's `edha-damage-convert`, read at
   `03-…js:692`) stay free passives and take no gate.
2. **Widening H gets its second consumer and its second declaration.** White declared
   `requireChannelled` on `edha-damage-react` (Unbreakable Line); Sovereign of Solitude wants it on
   `edha-triggered-effect`. Same field, same read of Widening A's `channelled` flag, checked in the same
   pre-cost veto (BK2-1 (a)).
3. **Widenings G and I have no Black consumer** (no ActiveEffect rider — Hardy's and Composed's AEs are
   free passives; no per-die work — Coercive Pressure's disadvantage is a free passive on
   `edha-next-test-mod` and stays so). **Widening E (`edha-channel`) has one consumer, and it is the
   frame itself** (§4.2), not a card.

### 4.2 The frame's build — the forsaken on the power document

Four rules on the Black power's Events tab. The precedent is the **H3 sustained ledger**
(`edha-owner-list`, `53-…js:1104`; `ENGINE_INDEX.md` §"Sustained capped ledgers"): a capped list of
creatures under `flags.edha-content.lists.<key>`, each bearing a registered marker status, oldest
fizzling at the cap — the shape Chaos's `omens`, Order's `covenants`, Fate's `ordained` and **Hunter's
`quarry`** (cap 1) already use. The forsaken is that ledger at cap 1 with two things added: the marker
counts as Isolated, and the ledger is bound to the arming status.

1. **The arm** — identical to White's §4.2 rule 1 (`edha-self-status {statusId: "channelblack",
   timed: true}` with Widenings A, B, C).
2. **The choosing** — on **`edha-channel`** (Widening E, fired on every Channel / Maintain use):
   **`edha-owner-list {list: "forsaken", mode: "list", op: "place", cap: 1}`** against the mage's
   current target, with the marker status **`forsaken`** registered in `EDHA_STATUSES`
   (`01-shared-core.js:184`, beside `quarry` / `tagged`; `condition: false`, tinted black, labelled
   *Forsaken* — a label that names no talent). H3's cap-1 placement is *mark-first, oldest fizzles*
   (`ENGINE_INDEX.md:1936`), which is exactly BK-4 (a): choosing another releases the first, choosing
   the same re-places it. H3's pre-cost refusals (`requireDisposition: enemy`, range via the power's
   colour) refuse a bad pick before the Investiture is spent. **An adversary channelling picks through
   the same target prompt** Unnerving Approach's `edha-prompt-pick` uses (BB-4).
   - **Widening L — `boundToStatus`** on `edha-owner-list`: a ledger that names an arming status is
     cleared when that status ends. Widening C's end-of-status hook (`exclusiveWith` / `endOnStatus`
     already clear things on arm and on Unconscious) gains the ledger clear; `42-chaos.js:301`'s
     `deleteCombat` scene clear gains `lists.forsaken`, `markedBy.forsaken` and the `forsaken` status
     — the rule `ENGINE_INDEX.md:1158` states (*a tree's ledger key MUST be in its deleteCombat scene
     clear*).
3. **Isolated — `forsaken` joins the isolating statuses** (BK-2 (a); BB-1). `edhaIsIsolated`
   (`03-…js:398`) reads one inflicted status, `isolated`; it becomes a two-entry set
   (`EDHA_ISOLATING_STATUSES = ["isolated", "forsaken"]`) read in the same line, and
   `edhaSyncIsolatedMarkers`'s `inflicted` test (`:429`, *"must agree with edhaIsIsolated's scan"*)
   reads the same set, so the positional marker sync never fights the mark. Every reader inherits it
   with no further change: the Key's pulse (`edha-pulse`, `33-…js:275`'s Isolated filter), Sapping Hex
   and Severance (`whenTargetIsolated`), Cruel Step's `requireTargetIsolated` (`19-…js:246`), Green's
   pack filter (`52-…js:243`), the `edha-test-rider` gate (`01-…js:759`).
4. **The vital** — **`edha-damage-bonus {require: "list-member-hits", listName: "forsaken",
   listStatus: "forsaken", amountFormula: "@channelled", damageType: "vital", color: "black",
   requireSelfStatus: "channelblack"}`** on the power. Every field exists (`53-…js` schema of
   `edha-damage-bonus`: `require` has `list-member-hits`, the Concord shape that rides `covenants`;
   `damageType` typed; `requireSelfStatus` carried natively). It reads the **mage's own** ledger for
   the **mage's own** hits, which is the frame's sentence — and why `edha-apply-status`'s
   `bonusDamageFormula` (Vital Diagnosis) is the wrong primitive: that one adds to *anyone's* damage on
   the marked creature. `@channelled` resolves through Widening D's third replacement. Two Black mages
   forsaking the same creature each carry their own bonus on their own attacks; the creature is
   Isolated once (M14 (a)).

**What the frame does not need.** No new handler type, no new event type, no new expiry mode, no
per-die work, no ActiveEffect. One status, one set of two strings, one field on the ledger handler
(L), and one clear-list line.

### 4.3 What moves in the data

**`data/authored/leyline-black.json`** — the seven authored keys, unchanged as a set:

- **`activation`** — four cards. The `{type: "resource", resource: "inv"}` consume row is removed from
  Spoils of Isolation, Cruel Step, Unnerving Approach and Sovereign of Solitude. No type changes.
- **`description`** — the four sentences of §2.2.
- **`events`** — `requireSelfStatus: "channelblack"` on Spoils' `edha-status-sweep`, Cruel Step's
  `edha-move`, Unnerving Approach's `edha-prompt-pick` and Sovereign's `edha-triggered-effect`;
  **`requireChannelled: 2`** on Sovereign's; Sovereign's inert `damageType: "energy"` on a `status`-kind
  rule cleared while the file is open (§2.5); Unnerving Approach's prompt string *"spend 1 Investiture
  and choose one character …"* rewritten, because a prompt is player-facing text asking for a cost that
  no longer exists.
- **`effects`** — **nothing changes.** No Black rider is an ActiveEffect.
- **`docId`** — **nothing changes.** Black has no rename.

**`data/leyline.json`** — the four records' `cost` and `description` (no `action` changes); §2.5's
hygiene (Sovereign's trailing whitespace, Predator's Due's `"Black 3+;"` prerequisite). **Graph
untouched**: no `connections` or `prerequisites` change in substance (the semicolon is a string fix
`validate.js` already tolerates), so the DAG and reachability checks and `tests/pipeline.test.js` are
unaffected.

**`data/channels.json`** (B-1 (a)) — Black's record: the amended frame sentence of §1.1, §1.5 as the
frame paragraph, the two actions' text, and the four rules of §4.2 as the power's `events`.

### 4.4 What names the changed cards

No rename, so no sweep. Four places carry a fact this pass changes and want the edit in the same PR:

| File | What |
|---|---|
| `module-src/scripts/engine/04-black-ritual.js:1-30` | the Black / Ritual tree-section header (rule 3's ledger): the four riders; the "Isolation movement talents" paragraph gains the forsaken |
| `module-src/scripts/engine/08-black-subjugation.js:1-14` | the Subjugation header: the tree is Black's release tree; nothing converts |
| `module-src/scripts/engine/42-chaos.js:301` | the `deleteCombat` clear list gains `lists.forsaken`, `markedBy.forsaken`, status `forsaken`; the header line at `:24` gains *forsaken* beside *isolated* |
| `.claude/skills/leyline-revision-guide/SKILL.md` Part 4, Black | *"Costs favor: … Investiture for the rest"* becomes the Channel, five releases and blood; the key-mechanic line gains the forsaking; the `Puppeteer` sentence stands (the colour still does not produce 0 focus) |

`EDHA_FOUNDRY_TEST_CHECKLIST.md:1514`'s `# BENCH — Black` preamble stays (dated evidence); the new
`## Channel — item 198` block goes under it. Regenerated, never hand-edited: `EDHA_PLAYER_PRIMER.html`,
`EDHA_LEVELUP_GUIDES.html`, `EDHA_DASHBOARD.html`. **Leave alone**: `EDHA_RULINGS.md`, the changelog
months, the checklist's retired evidence, and `docs/design/channel-actions.md`'s struck text.

### 4.5 The bench rows

Sixteen **🤖** rows, to be added under `# BENCH — Black (leyline)` (checklist line 1514) as a
`## Channel — item 198` block when the build lands, on the Route A 3.1.0 copy (B-6 (a)).

| Row | Drive | Evidence |
|---|---|---|
| CK-1 open | target an enemy standing beside two allies; Channel Black at 1 | *Channelling Black* on the mage; *Forsaken* on the target; `lists.forsaken` holds it; Investiture −1 |
| CK-2 Isolated by fiat | the same target, allies adjacent | `edhaIsIsolated` true; the positional marker sync leaves the *Forsaken* icon alone |
| CK-3 the pulse | Draw Mana | the forsaken is Weakened though its allies stand beside it; a second, positionally alone enemy is Weakened too |
| CK-4 the vital | Strike the forsaken | the hit's damage plus **1 vital** labelled Channel Black; a Strike on another enemy carries nothing |
| CK-5 flood | at rank 2 channel 2; Withering Ray the forsaken | 2d6 vital + 2 vital |
| CK-6 re-choose | maintain at 1 targeting a different enemy | the first loses *Forsaken* and its bonus; the second gains both; ledger holds one |
| CK-7 keep | maintain at 2 targeting the same enemy | still one entry; the bonus reads 2 |
| CK-8 lapse | let the Channel expire unmaintained | *Forsaken* gone, ledger empty, `markedBy.forsaken` gone |
| CK-9 Severance composes | a channelling Severance owner Strikes the forsaken with a keen sword | the whole hit is vital (converted) and +1 vital (the frame), not doubled |
| CK-10 riders off / on | no Channel: Spoils, Cruel Step, Unnerving Approach | refused before cost with the toast. With the Channel: all fire spending nothing |
| CK-11 Sovereign's gate | channelling 1, a Weakened enemy moves; then channelling 2 | no offer at 1; at 2 the immobilise-and-test offer posts, spending nothing |
| CK-12 releases | Dark Investiture, Double Dip, Hollow Command, Puppeteer with **no** Channel | all work and spend |
| CK-13 Reserve pays | a Ritualist with 2 Reserve maintains Black | Reserve −1, Investiture unchanged |
| CK-14 Predatory Patience refund | three hits on the Weakened forsaken while channelling 1 | +3 Investiture back; the Channel ran positive |
| CK-15 two mages | Bench — Black II forsakes the same creature at 2 beside Bench — Black at 1 | one *Forsaken* icon (two ledger entries, one per mage); Black II's hit +2, Black's +1 |
| CK-16 combat end + tabs | end the combat; a synced Black PC's Actions and Talents tabs | ledger, mark and status cleared; Channel Black and Maintain Black under the power; riders on the Talents tab |

### 4.6 Gate 4 — the menu

**BB-1. How the mark counts as Isolated.** (a) **`forsaken` is registered as an isolating status:
`edhaIsIsolated` and the marker sync read a two-entry set — recommended** (one status on the token,
one line in each of two readers that already agree by contract). (b) The choosing applies the existing
`isolated` status *and* a `forsaken` marker — no predicate change, two icons per creature, and the
marker sync's `inflicted` exclusion must then be trusted to leave the second alone.

**BB-2. Where the ledger lives.** (a) **H3 `edha-owner-list` on the power, `lists.forsaken`, cap 1,
bound to the arming status (Widening L) — recommended** (Hunter's `quarry` is the same ledger at the
same cap; nothing new but the binding). (b) A bare `forsakenUuid` flag on the mage — the pre-H3 shape
every marker tree was migrated off (`ENGINE_INDEX.md:1937`).

**BB-3. The clear on Channel end.** (a) **Widening L, `boundToStatus: "channelblack"` — recommended**
(one field, generic: any future ledger a Channel owns clears the same way). (b) Leave the mark until
combat end and let the vital rider's `requireSelfStatus` go dark — the *Forsaken* icon then lies on
the token after the Channel drops.

**BB-4. An adversary's choice.** (a) **The target prompt the engine already shows for a targeted
`use` (Unnerving Approach's `edha-prompt-pick` shape), so the GM picks — recommended.** (b) Auto-pick
the nearest PC — a heuristic the bench would have to defend.

> **Answered at gate 4 (Ben, chat, 2026-09-17):** *"defaults."* — **BB-1 … BB-4 (a).** §4 committed
> on that answer.
