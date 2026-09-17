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
| 1 | §1 The deity path, re-evaluated under the Channel | **proposed 2026-09-17, second draft** — the first draft's D-1 … D-9 were withdrawn on Ben's two corrections and his ask (§1.1); E-1 … E-8 tabled |
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

### 1.1 Why this section was rewritten

The first draft of §1 (commit `38bf0f4`, kept in history only) took the deity *tree* as given and
asked how its nine cards ride the colours' Channels. Ben read it and corrected two facts it stood on,
then set the pass a different question:

> *"Characters only get one leyline Key, at character creation. That is what differentiates a Chaos
> disciple who started as a Blue mage from a Chaos disciple who started as a Black mage. Both
> disciples can Channel either colour, but what happens when they Draw Mana is different."*
>
> *"The deity guide must be out of date. That entry / synthesis / once-per-scene, catastrophe shape
> is not a rule anymore. Some deity paths hold that shape still, but that's residual, not a rule."*
>
> *"Honestly I think the whole Deity path idea needs a re-evaluation under the Channel method. Let's
> do that instead of me answering your gates."*

So the facts, restated from the data and the docs rather than from the guide:

- **One Key, chosen at creation.** The leyline path grants its Key and Draw Mana
  (`foundry-build.js:415-420`); nothing grants a second. A disciple of Maelith who began Blue Draws
  Mana as a Blue mage (advantage on the next Cognitive test) for the rest of their life; one who
  began Black Draws as a Black mage (the Weakened pulse). **The second colour is bought as ranks
  alone** — two skill ranks minimum (`build-forge` Phase 2) — and every leyline talent gates on rank,
  not on the Key (`data/leyline.json`: every Black card reads "Black N+" or a talent name; only
  Extract Thought reads a skill), so a disciple *may* own talents of both colours within the budget.
  Under the Channel, both colours' base actions are theirs too, by Ben's word: **both disciples can
  Channel either colour.** What differs is the Draw.
- **At 3.x the second Channel is ungranted.** Under R-150 (b) a colour is a `power` item, its skill
  is unlocked by *owning the power* (`data/actor/common.ts:633-641`, `channel-actions.md` §4.1), and
  the power is granted by the leyline path. A disciple who began Blue owns no Black power, so at 3.x
  they could neither rank Black nor Channel it. Something has to grant the second power, and the
  only thing in the character that knows a second colour is the deity path. This is a design hole,
  not a build detail; E-4 closes it.
- **The deity guide's shape is residual.** Two entries, two lanes, synthesis, one three-Action
  once-per-scene capstone, the 1 / 2 / 3 / 4 cost scale — several trees still wear it, none is bound
  by it. The first draft's D-5 ("capstones keep 3 Investiture because the guide's scale says so") had
  no ground. Nothing below treats a tree's size, its capstone or its price as a rule; §5 of the
  close-out hands the guide's rewrite to the PM.

### 1.2 What a deity path is — in canon, and in the data today

**In canon** (`EDHA_CAMPAIGN_CANON.md` §1, ruling 12): *"A deity is the convergence of two leylines
given personhood by sustained mortal worship. Five frequencies make exactly ten pairs, and the ten
gods claim every one — the pantheon is complete."* And ruling 38: *"the leylines interact with each
other — a deity is the convergence of two frequencies … With people — attunement: a person who
concentrates one frequency works talents … faith is the collective form, a network of worship feeding a
pair-god."* A god **is** two leylines at once. A mage **is** one leyline at a time — which is exactly
what the Channel rule now says mechanically (M6: one colour at a time; opening a second ends the
first).

**In the data today** a deity path is nine cards gated on two colours at 2+ / 2+, each priced on its
own because there was nothing else to price on, built on a signature resource (the spine) and
delivering "Radiant-tier" effects — the resurrection, the colossus, the mass detonation. It is the
strongest content in the game and it has no base action, which is why it is 80 % costed and its loops
are sealed (`talent-comparison` §D-1, D-3; the ecosystem review's finding). Under the Channel each of
its two colours has a base action, and the question the first draft answered — *how do the nine cards
ride them?* — was the wrong one, because it leaves the deity as **a spine with no verb**: a god
reduced to a resource, riding a base action that belongs to a colour.

### 1.3 The question, stated

**When each colour already has a base action, what is the deity path *for*?** Four shapes answer it
and they are not variants of one another. They are laid out in §1.4 with the recommendation first;
E-1 is the choice.

### 1.4 The four shapes

**Shape A — the convergence (recommended).** The deity path is the mortal form of what a god is:
**two leylines channelled as one.** A leyline mage channels one colour; a disciple may channel the
god's pair. The deity path gives the disciple one base action of its own, on the Channel's shape —
*Channel [Deity]* (E-8 names it) — that opens **both** colours' frames at once, as one status, one
drain, one maintain:

> **Channel Maelith** — Action; 2 or more Investiture
>
> Spend 2 or more Investiture, up to your higher rank in Blue or Black, dividing it between the two
> colours with at least 1 to each. While you channel Maelith you are channelling Blue and Black
> together: each colour's frame is up, and each reads the Investiture you gave it. The Channel lasts
> until the end of your next turn and is maintained as a Free Action by spending again in the same
> way. Channelling Maelith ends any other Channel; channelling a colour ends it.

Read against the rule (§1.1 of the parent design), nothing is widened: the duration, the maintain,
the ends and the Countercurrent answer are the Channel's own; the one new thing is that the spend is
*divided* and each frame reads its share. At levels 1 – 5, with both colours at 2, the convergence is
**1 and 1** — a trickle of each frame — and it costs 2 a round, a Draw every round at the start, which
is the price of holding two frames. From level 6, with one colour at 3, it is 2 and 1 or 1 and 2: the
disciple floods one side. A disciple who wants a full flood of one colour opens *that colour's*
Channel instead, at 1 – rank as any mage does, and the god's frame is not up. The three actions —
Channel A, Channel B, Channel the god — are the disciple's round-by-round choice, and they are all
Actions the leyline path's shape already builds (§4 of the parent design; E-4 grants the second).

*What the convergence does, tree by tree — first sketch, derived from the two frame sentences and
nothing else; the tree gates write them.* Every frame is one of three things — **on one enemy** (Blue's
reading, Black's forsaken), **on your hits** (Red's heat), or **on your side** (White's line, Green's
home ground) — so every pair is coherent on the field, and each god's identity is *how its tree makes
the two frames meet*:

| God (A + B) | The two frames, up together | Where the tree makes them meet (the spine's job) |
|---|---|---|
| Maelith — Chaos (Blue + Black) | the read enemy and the forsaken | one creature: read it, forsake it, and the Omen is the crack where the two meet |
| Morrath — Death (Black + Green) | the forsaken and the home ground | the forsaken dies on your ground; the Remain is what the ground keeps |
| Tessavain — Order (Blue + White) | the read enemy and the line | the Edict binds the read enemy; the Covenant is the line sworn |
| Tyrith — Power (Black + Red) | the forsaken and the heat | the warlord's chosen enemy takes vital *and* fire; Kneel names the forsaken |
| Verdannis — Sovereignty (Black + White) | the forsaken and the line | the condemned and the crowned: Censure the forsaken, Exalt the line |
| Anaveth — Life (Blue + Green) | the read enemy and the home ground | the Diagnosed enemy and the healed party on the same field; the wound it takes funds the ground |
| Razkael — Destruction (Blue + Red) | the read enemy and the heat | the read enemy is the one walking into the Charge; every detonation is noise for the heat |
| Gnothis — Knowledge (Red + Green) | the heat and the home ground | the pack hunts from the ground; Insight is the heat made cumulative on one quarry |
| Olvarra — Fate (Green + White) | the home ground and the line | the prepared board: allies on your terrain, beside each other, regen and deflect both |
| Kethane — Civilization (Red + White) | the heat and the line | the smith in the line, the Construct at an ally's shoulder, the hammer that burns |

Under Shape A the deity's talents are of three kinds, all riders on the god's Channel, and the tree
gates sort each card into one: **(i) frame amendments** — a passive that changes what the convergence
does for a disciple of this god ("*While channelling Maelith, the enemy you read is the forsaken, and
it bears an Omen*"): this is the Radiant-order shape, the order's talents modifying the surges, and it
is where the god's identity lives; **(ii) the spine** — the placements, spends and reads the tree has
today, free while channelling the god (or either colour, E-3 decides); **(iii) rites** — the few cards
that stand outside the fight or the round and keep a cost: the resurrection, the séance, the ward.
The guide's "spend X Investiture and …" opening retires for (i) and (ii).

Why A: it is what canon says a god is, made mechanical; it is the one thing in the game no leyline
mage can do (two frames at once), which answers *"what does this path do that no other does"* without
a spine having to answer it alone; it makes the two-colour gate buy something the moment the path is
taken instead of being a toll (four trees' pure-gate colour problem dissolves — the second colour is
half of the god's frame); it makes the disciple's Draw matter exactly as Ben described (one Key, one
rider, under a two-frame Channel); and it costs, honestly, 2 a round, which is the deity's price where
the priced atlas used to be. Its risk is the risk item 210 exists to price: two trickle frames for 2
Investiture against one flooded frame for the same 2.

**Shape B — the rider atlas** (the first draft). No deity base action; the nine cards ride either
colour's single Channel ("while channelling A or B"); the god is a spine and nothing more. Honest,
cheap to build, and it leaves the deity as the one path in the game with no verb of its own — a
disciple of Maelith channels *Blue*, and Maelith is the name on the Omen.

**Shape C — the amendment atlas.** No deity base action either, but the deity's talents are frame
amendments to the disciple's *single* Channels ("while channelling Blue, the enemy you read bears an
Omen; while channelling Black, the forsaken bears one"). The Radiant-order shape without the
convergence: the god is *how your two Channels behave*, one at a time. Cheaper than A (no new action,
no split spend) and it keeps M6 whole; what it cannot do is put the god's two colours on the field
together, which is the one thing canon says a god is.

**Shape D — the priced atlas kept** (R-159 (c)'s spirit). The deity path stays what it is: nine
priced cards. Leyline is the thing you channel, faith is the thing you pay for — a coherent identity
in one sentence, and the ecosystem review's sealed loops stay sealed; it also refuses R-152's premise
for the half of the game where it bites hardest.

### 1.5 What Shape A changes, and what it leaves alone

- **The deity path grants two things the leyline path's shape already builds:** the second colour's
  `power` (so the disciple can rank it and Channel it — E-4) and the god's own `power` with *Channel
  [Deity]* and *Maintain [Deity]* as its embedded actions (§4.1 of the parent design, one more record
  in `data/channels.json`'s shape). The path's `grant-items` rule is the mechanism, as it is for the
  Key and Draw Mana.
- **The two entries at 2+ / 2+ stay.** They are the gate; nothing about the convergence lowers it.
  What the entries *are* is the tree gates' question — under A the fantasy on turn one is the god's
  Channel plus one entry, and an entry may well be the frame amendment itself.
- **Draw Mana is unchanged (E-5).** One Key, one rider, on whichever colour the disciple began with.
  A convergence does not change what a Draw does; it changes what the Draw refuels.
- **The rider gate is one status.** "While channelling Maelith" is `channelmaelith`; and because the
  convergence *is* channelling Blue and Black (E-3 (a)), the god's status counts as both colour
  statuses for every `requireSelfStatus` reader in the engine — a disciple who owns Blue leyline
  riders and Black leyline riders has both live under the god, at the trickle their share bought.
- **M6 stands.** One Channel per creature; the god's is one Channel. Two gods at once is refused as
  two colours at once is.
- **M14 stands.** A Chaos disciple's Blue frame and a Blue mage's Blue frame on the same enemy: the
  larger reading, once.
- **Countercurrent (M7 (a)) answers a god's Channel** as it answers a colour's: the opening and every
  maintain spend Investiture. A refused maintain drops both frames.
- **Adversaries (R-137)** with a deity tree converge at role rank: a rival at 2 (1 and 1), a boss at
  3 (2 and 1).
- **The tree's size and shape are open.** The guide's nine-card residue is not a target; a god whose
  frame amendments carry its identity may want fewer cards, and a god whose spine is large (Fate's
  two ledgers, Order's two) may keep nine. Gates 2 – 4 decide per god.

### 1.6 What the disciple's turn looks like, under A

A disciple of Tyrith at level 4, Black Key, pool 4. **Round 1:** Channel Tyrith at 1 and 1 (an Action,
2 Investiture): the enemy she names is forsaken (Isolated; her attacks against it +1 vital) and her
hits carry heat up to 1; Kneel it (free, a Black test); one Action left, a Strike on the forsaken —
vital +1, and the fight's first noise is her own hit, so the next carries +1 energy. **Round 2:**
maintain 1 and 1 (Free), Draw Mana as a Black mage (the forsaken, alone, is Weakened — Absolute
Authority's gate), Absolute Authority (free, a Black test) takes its turn. **Round 3:** maintain, two
Actions of Warlord's Advance and a Strike, every hit carrying vital and fire. Investiture spent by
round three: 6, refunded 2 by the Draw — against today's 1 + 2 + 1 + 1 = 5 for *fewer* effects and no
frame at all, on a pool that cannot Draw fast enough. The convergence is more expensive per round than
a colour's Channel and buys more per round; whether the ratio is right is item 210's yardstick, not
this section's claim.

### 1.7 Gate 1 — the menu, second draft

Every judgment call in §1, recommended default first. "Defaults on all except …" is enough. The first
draft's D-1 … D-9 are withdrawn; where one survives it is restated here.

**E-1. The shape.** (a) **Shape A, the convergence — the deity path's own Channel opens both
colours' frames at once, with the spend divided; its talents are frame amendments, the spine, and a
few rites — recommended** (§1.4: canon's definition of a god, made mechanical; the one thing no
leyline mage can do). (b) Shape C, the amendment atlas — no deity action; the god is how the two
single Channels behave. (c) Shape B, the rider atlas — the first draft. (d) Shape D, the priced atlas
kept.

**E-2. The convergence's cost (if A).** (a) **Divided: 2 or more, at least 1 to each colour, total
up to the higher of the two ranks; each frame reads its share — recommended** (the flood of one side
arrives at level 6; two frames always cost at least 2; one Draw at rank 3 still pays one full round).
(b) One number, 1 or more up to the *lower* rank, and both frames read it (two frames for the price of
one at levels 1 – 5). (c) A fixed 2, no flood, both frames at 1.

**E-3. Does a god's Channel count as channelling both colours?** (a) **Yes: `channelmaelith` satisfies
every "while channelling Blue" and "while channelling Black" reader, leyline riders included —
recommended** (it *is* channelling both; a disciple who owns riders of both colours is who the
convergence is for). (b) No: only deity riders read the god's status; leyline riders need their
colour's own Channel.

**E-4. The second colour's Channel at 3.x.** (a) **The deity path grants the second colour's `power`
alongside the god's — recommended** (the only thing in the character that knows a second colour;
closes the hole §1.1 names; the disciple may then Channel A, B or the god). (b) Rank alone unlocks a
colour's power (a creation-wizard rule: any skill rank in a colour grants its power) — works for
two-colour characters with no deity too, and widens item 198.

**E-5. Draw Mana.** (a) **Unchanged: one Key, one rider, the colour the disciple began with —
recommended** (Ben's stated fact; the Draw is what distinguishes the two disciples). (b) A deity
passive that lets a Draw fire both Keys' riders — a real braid card, one per tree, only where a gate
wants it.

**E-6. The deity guide.** (a) **Parts 1, 2 and the cost scale are marked superseded by this document
once E-1 is answered, and the PM files the rewrite as its own DOCS item — recommended.** (b) Leave the
guide; this document stands beside it.

**E-7. Tree size and shape.** (a) **No rule: the two entries stay as the gate; each god's gate decides
its card count and whether it keeps a capstone — recommended** (Ben: the shape is residual). (b) Keep
nine and the capstone as a target every tree meets.

**E-8. The name of the god's Channel.** (a) **"Channel [Deity]" — the same verb as the colours, with
the god in the colour's place — recommended** (canon: a god is two leylines; the card reads *Channel
Maelith* beside *Channel Blue* and needs no gloss). (b) "Converge" — *Converge on Maelith*; canon's
own word for what a god is. (c) "Commune" — *Commune with Maelith*; the devotional register, and a
different verb from the colours' on purpose.
