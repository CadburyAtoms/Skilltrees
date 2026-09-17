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
| 2 | §2 The twenty-five cards | — |
| 3 | §3 The mix, against the bands | — |
| 4 | §4 The build notes for Black | — |
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
