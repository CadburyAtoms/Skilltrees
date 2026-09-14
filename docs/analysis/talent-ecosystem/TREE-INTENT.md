# What each tree actually is — a readable intent for all 21 paths (2026-09-13)

**Why this exists.** The talent ecosystem review (`README.md` beside this file) found that twenty of
the twenty-one path descriptions in `data/path-descriptions.json` say something different from what
the talents do. Ben ruled R-104 (a): fix the prose, not the talents (TODO_REPO_HYGIENE item 111).
The review's own output is a ledger — exact counts, verdict tables, "0 of 25" claims — which is the
right shape for a diagnosis and the wrong shape for writing prose from. **This file is the first step
of the prose pass: every tree read from its cards, in plain language, answering one question — what
does this tree feel like to play, and what is it for?**

**How it was made.** Every one of the 365 talents was read from the dossiers `derive-dossiers.js`
produces (`node docs/analysis/talent-ecosystem/derive-dossiers.js <outdir>`, run fresh on 2026-09-13,
so it reflects the Leybreaker / Ley-surveyor swap of PR #329 and the `Momentum's Edge` retune of
PR #337). The review's per-tree profiles (`profiles/`) and drift ledger (`crosscut/intent-drift.md`)
were then read as a cross-check, not as a source — where they disagree with the cards as they are
today, the cards win, and two of the profiles' headline claims are stale (see the Warrior, Scholar
and Red sections).

**How to use it.** Each tree gets the same five parts: *in one line*, *what the talents do*, *how it
plays*, *the specialties as built*, *where the current prose is wrong*, and a **draft opening** — a
first paragraph in the voice of the existing path descriptions, written to be pasted into
`data/path-descriptions.json` once Ben says yes. The draft openings are proposals for the item-111
batches (one atlas per batch, lore-approval gate), not decisions. Nothing here changes a talent.

**Readable version.** The same content, published for reading on a phone: https://claude.ai/code/artifact/129432ed-fbf1-4ce5-a795-54ea1badc8b6
(one section per tree, a rail to jump between them; republished from this file when it changes).

**What this is not.** Not a balance review, not a ranking, not a count. The one number kept
throughout is the level a thing arrives at when it matters to the feel (a "rank 3" gate is a level-6
gate for every skill, so a specialty whose payoff is rank-3 gated is a late specialty).

---

## The three atlases, in shape

Before the trees: the three atlases play differently, and the prose should say so once, up front,
so the per-tree text does not have to.

**Leyline (five colours, 25 talents each).** A Key talent that rides on Draw Mana, then three
specialties of eight. Everything is fuelled by Investiture, every talent tests or scales with the
colour's rank, and the trees are mostly *one-target* control and support — the damage lives in Red
and Black, the healing in Green (and a trickle in White), and Blue deals none at all. Every colour is
a **cast of thought**: White answers, Blue anticipates, Black isolates, Red escalates, Green holds
ground. The deep end of each tree (rank 3, level 6) is where its identity completes: Blue's
counterspell and freeze, Black's puppeteer, Green's injury cure, Red's chain detonation, White's line
that does not break.

**Heroic (six paths, 25 talents each).** No Investiture anywhere; the currency is **focus**, and a
Strike with the right passives is the damage plan. A third of the content is stock shared between
paths (`Hardy`, `Mighty`, `Collected`, `Surefooted`, the focus-cap talent), so each path's identity
lives in roughly twenty original talents. A quarter of the heroic atlas sits behind a skill at rank
3, i.e. level 6, and a fifth of it behind a reward only the GM can grant (a patron, a title, an
animal companion). The heroic path descriptions are still the verbatim Roshar text — item 111 owes
them Edha-generic prose with the Roshar nouns removed.

**Deity (ten trees, 9 talents each).** Two entry talents (one per gate colour), each delivering the
deity's fantasy on the first turn, two short lanes that converge, one capstone. Every tree is built
on a **signature resource** — a marker or a zone — that its entry creates and the rest of the tree
spends: Remains, Omens, Edicts and Covenants, Diagnosis, Insight, Ordained Ground and Snares,
Constructs and Foundations, Charges. Deity power is front-loaded (the two entries plus one free
passive are usually the whole engine by level 3) and Radiant-tier: this is where the resurrection,
the colossus, the dispel and the mass detonation live. Almost every deity talent costs Actions; the
atlas has no Specials at all.

**Families that recur across atlases** — worth knowing so the prose pass does not sell the same
identity to two trees:

| Family | Who does it | The distinction the prose should draw |
|---|---|---|
| Mark one target, then everything is better against it | Hunter (quarry), Knowledge (Insight), Life (Diagnosis), Chaos (Omen), Order (Edict), Fate (Hexmark) | Hunter's is free and personal; Knowledge's *multiplies* damage and is shared with the pack; Life's reveals the statblock and funds heals; Chaos's is cashed in for damage; Order's is a prohibition; Fate's is a curse on whoever sprang the trap |
| Own the ground | Green (difficult terrain), Destruction (dangerous terrain), Fate (Ordained Ground / Snare), Civilization (Foundation), Death (Bone Garden) | Green's grows free and holds; Destruction's burns and spreads; Fate's is a kill box of allied squares and traps; Civilization's is a fortified quarter; Death's is one garden |
| Something fights beside you | Civilization (Construct), Death (Risen Servant), Hunter (animal companion) | The Construct has a six-talent upgrade ladder; the servant is bought with a corpse; the companion is a reward the GM grants |
| Hand an ally something for their roll | Leader (command die), White (plot die and your modifier), Envoy (Determined), Scholar (advantage), Blue (extra movement and telepathy) | Leader's is a die that grows; White's makes an ally's *failure* into a success; Envoy's is a whole scene of resolve; Scholar's is timing |
| Take an enemy's choices away | Black (deny a turn, puppet the depleted), Power (Compelled, dictate the action), Red (Incite: swing at the nearest) | Black denies; Power commands; Red provokes |
| Hunt the mages | Warrior (Leybreaker), Scholar (Ley-surveyor), Blue (Counterspell) | The Leybreaker hits Investiture and taxes the draw; the Ley-surveyor reads the draw and taxes the working; Blue unmakes the working outright |
| Strip an enemy's focus | Warrior (and only Warrior) | Black *taxes* focus and reads its loss; it does not strip it — the prose has promised otherwise for two versions |

---

# LEYLINE

## White — the shield-bearer

**In one line.** Stand beside your allies and they are harder to hurt, harder to sway, and luckier
on the dice; you rarely act first, you answer.

**What the talents do.** Nearly every White card needs a second body next to it, and almost always a
friendly one. Adjacent allies get Deflect for free, take less damage from every attack, and can be
shielded by you stepping in, taking half their wound, or punishing the attacker with spirit damage.
When an ally would drop, once a round you can hold them at one health. When an enemy tries to sway
an ally, you cut the argument off and leave the speaker Disoriented; while you are near, resisting
influence is cheaper for everyone. And the tree has the best plot-die coordination in the game: you
point at a target and the next ally who tests against it raises the stakes; one ally's success
hands the next one a raised stake; two allies aiding the same test raise it again; a Complication
an ally rolls becomes a blank face. The healing is real but thin — every Draw Mana tops up the
formation by your tier, and one Opportunity spend heals a little in an area.

**How it plays.** Slow turns, spent getting between the two most exposed allies and the enemy.
Draw Mana to heal the line and strip a condition. Use an Action to point (Guiding Signal) or to move
the whole line without provoking. Then hold the Reaction, because the tree's best moments are
answers: Retributive Guard when an adjacent friend is hit, Shared Burden when a hit is too big,
Voice of Authority when an enemy targets someone you are guarding, Shared Conviction when an ally
is about to fail the roll that matters. Accord is the scene-long layer: a shared objective agreed
aloud gives you both a bonus, and allies acting on it can borrow your White modifier.

**The specialties as built.**
- **Coordination** — the plot-die layer plus group movement, condition removal and the small area
  heal. It is about making the party's rolls better, not about commanding anyone.
- **Bulwark** — adjacency defence: free Deflect, damage reduction for anyone standing with you,
  interposition, retribution, and the line that does not break.
- **Accord** — consensual pacts with allies, cheaper resistance to influence for everyone near you,
  and two riders that Disorient a target *you* have successfully influenced.

**Where the current prose is wrong.**
- "Binding enemies to terms they cannot break" — no White talent binds an enemy. An accord needs
  both parties to *agree*; it is an ally pact. The enemy-facing half of Accord is what happens when
  White wins an influence contest, and White brings no influence talent of its own to that contest.
- "Marshals … bend the chaos of a fight into formation" oversells command. White cannot give anyone
  an action, move an enemy, or hold ground. It holds *people*.
- The guide's "Plot Die integration" claim is *correct* for White (and wrong for Blue) — keep it.

**Draft opening.** *White leyline mages are the shield-bearers of the line — wardens and
oathkeepers whose power is unity rather than self. Stand beside a White mage and you are harder to
hurt, harder to sway, and luckier on the dice; when you falter they answer, taking the blow, turning
the failure, holding you at the edge of death. They rarely strike first. Nothing a White mage does
works alone, and that is the point.*

---

## Blue — the one who saw it coming

**In one line.** Take the slow turn, read what the enemy will do, and make sure it goes badly for
them — with disadvantage, with a wall that was not there, with a double that takes the arrow.

**What the talents do.** Blue deals no damage of any kind and never will. It wins the fight by
denial: five different ways to put disadvantage on the roll that matters, a Reaction earned by
correctly predicting an enemy's action, the GM told to reveal what a creature intends, a talent
unmade as it is cast (Counterspell), an enemy's speed reduced to nothing and then its Reactions and
Physical tests taken with it. Beside that sits the game's only illusion kit: a one-health double
that enemies lose the original behind, a shimmering barricade with hit points that blocks movement
and gives cover, a static image that later learns to walk and talk, and an unseen slick that shoves
or shortens a moving creature. The social half rides on Influence — a successful influence
Disorients, and resisting you costs extra focus. The Focus the design guide promised as Blue's
currency appears once; Blue runs on Investiture like every other colour.

**How it plays.** Choose the slow turn (the first test that turn gets advantage) and change your
mind after everyone else has committed if you need to. Declare a character and an action at the
start of the round; if you are right you gain a Reaction, and Intercept turns it into disadvantage
on that very action. Spend Actions on the board — a barricade between the archer and the wounded, a
double on the ally being hunted, Read Intent on the enemy you cannot afford to misjudge. Then react:
False Premise when an enemy succeeds, Redirect Momentum when one moves, Counterspell when one draws
on the leyline. The tree completes at level 6 — the counterspell, the freeze, the moving image and
the harder influence all arrive together — and before that it is a disadvantage engine with a
barricade.

**The specialties as built.**
- **Foresight** — prediction rewarded with Reactions, the GM-revealed intent, the telepathic
  network that shares your expertise, and the initiative take-back.
- **Calculation** — the disadvantage engine, the counterspell, and the two Influence riders.
- **Illusion** — double, barricade, image, slick, extra movement for allies, and the freeze.

**Where the current prose is wrong.**
- The path description is nearly right; it only needs to say plainly that Blue never rolls damage
  and that its best tools arrive at rank 3.
- The **design guide** is wrong: "Plot Die manipulation is Blue's capstone identity" describes a
  tree that was never built. Blue has no plot-die talent; that identity belongs to Agent (rerolls,
  face changes) and White (coordination). The guide's Blue entry should be rewritten to
  disadvantage, illusion and the interrupt.

**Draft opening.** *Blue leyline mages read the battle a beat before it happens. They never meet
force with force — a Blue mage takes the slow turn, learns what an enemy means to do, and makes sure
it goes badly: disadvantage on the roll that matters, a wall that was not there a moment ago, a
double that takes the arrow meant for a friend. At the height of their art they can unmake a working
as it is cast and hold an enemy where it stands. They deal no wounds. They do not need to.*

---

## Black — the predator who pays in blood

**In one line.** Hunt whoever stands alone: Draw Mana and every enemy without a friend at their
shoulder is Weakened, and from there the tree does everything better against them — paid for in the
mage's own health.

**What the talents do.** Two engines, and they mesh. The first is Weakened: the Key applies it to
every enemy in range with no ally within five feet, a hit on an isolated target applies it, and once
a target is Weakened the tree pays out — a bonus die and Investiture back on every attack, vital
damage to all of them at once with temporary HP for you, a lock that stops them moving back toward
their friends, and at the top a Reaction that pins one in place and wounds it. One free action per
turn shoves an enemy's ally away to *create* the isolation; otherwise the tree reads solitude more
than it manufactures it. The second engine is blood: Withering Ray costs health rather than
Investiture and rolls the largest damage formula in the leyline atlas, vital, ignoring Deflect,
every Action, at level 1 — and paying that cost gives you advantage on the next Black test, banks the
lost health as Reserve you can spend as Investiture, and later lets Reserve pay the blood price
itself. Kills heal you and refund Investiture. Subjugation is the third face: Hollow Command deletes
an enemy's next turn, and a bench of passives make enemy focus expensive (they spend one more,
losing it brings disadvantage, your Deception successes remove Reactions) until the puppeteer, at
rank 3, chooses an action for a creature with no focus left.

**How it plays.** Find the one who is alone — or make one, with a shove. Draw Mana. Fire Withering
Ray until the target or your health bar runs out, gaining advantage on each cast as you bleed. Spend
a turn on Hollow Command when one enemy must not act. Keep the Weakened from regrouping. The blood
cost is a real limit at low level and a resource later, when Reserve makes every drop count twice.

**The specialties as built.**
- **Isolation** — the Weakened payoff chain: create solitude once, punish it every turn.
- **Ritual** — the blood economy: health as a cost, advantage and Reserve as the return, and two
  HP-costed vital attacks that anchor the tree's damage.
- **Subjugation** — turn denial, focus taxes, and the late puppeteer.

**Where the current prose is wrong.**
- "Focus stripped from the enemy mind" / the guide's "strip enemy Focus, dominate the depleted" —
  Black *taxes* focus and reads its loss; nothing removes it. The complete strip-and-execute loop
  belongs to Warrior's Duelist. Say "makes every thought cost more", not "strips".
- "No ally within 10 ft" in both intent sources — the cards say five feet. A player checks this on
  the map.
- "Surrounded, a Black mage falters" — no talent penalises being surrounded. Drop it, or keep it as
  flavour only.
- The prose should own what it undersells: the largest damage formula in the atlas at level 1, and
  the game's only whole-turn denial.

**Draft opening.** *Black leyline mages are predators, and the leyline feeds on them as they feed
on their prey. Draw Mana and every enemy standing alone is Weakened; from there the Black mage bites
harder, heals off the kill, and refuses to let the quarry rejoin its line. The power is paid for in
the mage's own blood — the withering ray costs health, not Investiture — and the leyline pays the
debt back in advantage, in reserve, and in stolen life. When one enemy must not act, it does not.*

---

## Red — louder is better

**In one line.** Red gets stronger as the fight gets louder: every blow struck near a Red mage, by
anyone, feeds a rising edge the whole party shares, and every Fast turn is faster.

**What the talents do.** Three things, and two of them are ways to deal damage. The pyromancer:
a ranged bolt, a bolt that arcs to a second target, an area surge, extra damage on every energy hit
that also lights the target up, Afflicted on an Opportunity, and a chain of half-dice through
anyone adjacent to a kill. The charger: move without provoking, a rider on melee hits, a passive that
makes a Strike after a run-up hit for an extra [Tier][Die], a leap that knocks the landing zone
prone, a shove that slams targets into walls, and free movement after damage on Fast turns. The
third thing is the Frenzy layer, which is party support wearing a berserker's face: every instance
of damage in range gives you and your allies a stacking bonus (the only stacking bonus in the
leyline atlas), enemies attacking each other feed it, Fast turns make your Influence better, and you
punish the enemy who just gained advantage, who just failed, or who just took a second hit. Incite
makes an enemy swing at whoever is nearest. What Red never does is defend: Draw Mana costs your
Reaction, and no talent reduces damage or heals.

**How it plays.** Take the Fast turn. Draw Mana (advantage on the next Physical test, Reaction
gone). Either bolt, arc and surge from range — the multi-hit talents refund Investiture or strip the
targets' Reactions — or Reckless Advance twenty feet and Strike with Momentum's Edge, Volatile Strike
and Mighty stacked on the hit, then keep moving. The party stands near you because everything that
happens near you makes their next roll better.

**The specialties as built.**
- **Momentum** — the melee charge: approach, hit hard at the end of the run, shove, leap, keep
  going.
- **Conflagration** — the energy engine: bolt, arc, surge, kindle, afterburn, chain.
- **Frenzy** — the escalating party bonus, Fast-turn tempo, and punishments for confidence, failure
  and the second hit.

**Where the current prose is wrong.**
- "Every wound taken is fuel for the next blow" / "damage taken feeds future power" / the guide's
  "costs favor HP loss" — no Red talent reads the mage's own wounds and none costs health. The
  escalation comes from damage *dealt* around you. Red's currency is Investiture and Opportunity.
- The prose sells the pyromancer first; the tree is as much a charger, and the charger is where a
  melee character gets the most out of it. Say both.
- Frenzy reads as "rage"; it plays as *everyone near me hits harder as the fight heats up*. That is
  a better hook than the one on the page.
- (Stale in the review's profile, not in the prose: `Momentum's Edge` no longer reads a movement
  rate; PR #337 retuned it to [Tier][Die].)

**Draft opening.** *Red leyline mages burn hotter the longer a fight goes on. Every blow struck
near a Red mage — theirs or anyone's — feeds a rising edge the whole party shares, and every Fast
turn is faster than the last. Play it as a pyromancer whose bolts arc and spread and leave the
ground smouldering, or as a charger who hits hardest at the end of a run and never stops moving.
Either way the guard is already down: drawing on the Red leyline costs your Reaction, and nothing in
this tree will give it back.*

---

## Green — the ground and the pack

**In one line.** Green owns the ground and keeps the pack alive: terrain that grows and holds, the
only healing that closes an Injury, and a hunt where every ally landing on the same target makes
the next blow heavier.

**What the talents do.** Territory: every Draw Mana grows difficult terrain; the terrain spreads
when enemies end their turn in it, bites anyone who enters or starts there, gives allies your Green
modifier against targets inside it, and gives you advantage when three enemies are stuck in it.
Roots Restrain a target for as long as you keep paying; nothing Disengages from you without a test.
Restoration: a touch heal, a Reaction heal that fires by itself when an ally drops to half,
regeneration on anyone you healed, condition removal, temporary HP, and — alone in all 365 talents —
the removal of an Injury. Instinct: the pack. You and an ally who close on the same enemy both get
advantage; each attacker on the same target adds damage; you always know the weakest creature in
range and hit it first with advantage; you move the pack together without provoking; you warn the
packmate about the attack they cannot see; you drive a target away from you into your allies'
reach. Outdoors you cannot be Surprised, and you can smell fear.

**How it plays.** Draw Mana where the enemy has to walk. Root the dangerous one. Point the pack at
the weakest and converge — the more of you on it, the more each of you deals. Let the Reaction heal
trigger on its own; spend Investiture on the touch heal when it is not enough. Between fights, fix
the Injury nobody else can.

**The specialties as built.**
- **Territory** — terrain creation, spread, damage, and the roots and holds that keep enemies in it.
- **Restoration** — the deep-mending line, up to the injury cure.
- **Instinct** — pack focus-fire, pack movement, and wilderness senses.

**Where the current prose is wrong.**
- "Where Black isolates, Green clusters" — as the guide meant it (reward *enemies* being bunched)
  this is one talent at level 6. As the tree plays, it is the *party* that clusters, onto one target.
  The prose should say "hunts as a pack", which it half does, and drop the mirror-of-Black framing.
- Everything else in the current description holds. This is one of the two leyline entries that
  need the least work.

**Draft opening.** *Green leyline mages belong to the wild's logic. Wardens, menders and
pack-leaders, they grow the ground against their enemies — roots that hold, thorns that bite, and a
territory that spreads with every draw — and they knit deep wounds that lesser magic cannot touch:
Green is the only leyline that closes an Injury. And they hunt as a pack. The more of you land on one
quarry, the harder each blow falls, and a Green mage always knows which one is weakest.*

---

# HEROIC

*The six heroic descriptions are the Cosmere RPG's own text, verbatim, with Edha's two swapped
specialties (Leybreaker, Ley-surveyor) spliced in. Item 111 says they lose the Roshar. The lines that
carry it: Envoy's "throughout Roshar", Warrior's "Roshar is a world riven by conflict" and "Roshar's
massive armies", Scholar's "Each time a Desolation…" and "build Roshar anew", every "Available in the
Stormlight Handbook", and the Rewards lines naming Shardblades, Shardplate, grandbows and
Soulcasters. The "Building a …" attribute and skill advice is system-generic and can stay.*

## Warrior — the stance fighter

**In one line.** Fight in a stance — a mode chosen each scene and switched freely — and let
everything else ride on the Strike; the Duelist breaks nerve, the Leybreaker hunts mages, the
Soldier holds the line.

**What the talents do.** The Key makes stances cheap to enter and lets you change them as a Free
Action; six stances exist (Vigilant, Flame, Iron, Vine, Still, Salt) and each is a different way to
stand: alone against one enemy you gain an Action; grazed or missed you strike back; hit in melee
you shove and drain the attacker; a mage in reach who draws eats a Reactive Strike; enemies in reach
pay extra to attack your friends or to draw at all. Around the stances: a Strike that takes an enemy's
focus and Reaction, and then the execute — against a target with no focus, a Strike that ignores
Deflect, cannot graze, and carries four extra dice. Free damage riders that never run out (extra
damage per Action spent, extra damage in Saltstance). Two-Action heavy blows and a charge that also
takes the target's Investiture. Brace made twice as good and shared with everyone behind your
shield. And the Leybreaker's senses: you always know when someone draws or casts, your mind and
spirit are harder to reach, and once a scene of practice you can turn a working aimed at you into a
graze.

**How it plays.** Pick the stance for the scene. Strike; spend focus on the rider that fits — drain
their focus, shove them, tax their Investiture. When the target's focus hits zero, end them. The
Soldier spends two Actions to Brace and Gain Advantage after moving through difficult terrain, then
lets the line brace behind him. The Leybreaker stands where the working has to come to him and hits
the ribs when the mage inhales. The big dice — Devastating Blow, Wit's End, Breaker's Charge, Turn
the Working — arrive at level 6; before that the tree's damage is the Strike plus Mighty, which is
plenty.

**The specialties as built.**
- **Duelist** — Flame, Iron and Vine stances, the nerve-breaking Strike, the execute, the signature
  weapon, quick feet.
- **Leybreaker** — the mage-hunter: know the draw, hit the Investiture, tax the draw, shrink their
  range, close the distance, turn the working aside.
- **Soldier** — training, Brace shared with the line, the heavy blow, the second Strike, and never
  being surprised while you have focus.

**Where the current prose is wrong.**
- It never says the word *stance*, and the stance system is the tree's whole mechanical identity.
- "Duelists contend for glory and political sway" — the duelist's talents are combat; social sway
  lives in Leader. Say "break an opponent's nerve, then end them."
- Roshar: "world riven by conflict", "Roshar's massive armies", Shardblade/Shardplate rewards.
- (Stale in the review's profile: it describes a Shardbearer specialty with Stone, Wind and Blood
  stances. That specialty is gone; Leybreaker replaced it in PR #329.)

**Draft opening.** *Warriors fight in stances — a way of standing chosen for the scene and changed
in a heartbeat — and everything else they know rides on the Strike. A Duelist reads an opponent,
breaks their nerve, and ends the broken. A Leybreaker fights the lines themselves: always knows when
someone draws, hits the breath they were holding, makes every working near them cost blood, and
carries no magic and needs none. A Soldier braces, shares the brace with the whole line, and lands
the blow that ends the argument.*

---

## Hunter — one quarry at a time

**In one line.** Choose a quarry and everything sharpens against it — finding, hitting, studying —
and almost nothing here costs Investiture or focus, so the Hunter never runs dry.

**What the talents do.** The Key marks a quarry (advantage to find, attack and study it), and the
tree is ways to mark faster (a tagging shot, the companion's Track, designating whoever you just
outfoxed from cover) and ways to cash the mark: strike it more than once a turn with a bow, stack
Survival onto an ally's roll against it, re-mark on the kill and recover focus. Archer is ranged
craft — longer reach, extra damage, shoot and step out of reach, learn the target's weakest point,
Gain Advantage on the quarry for free. Assassin is knives and surprise — a jab that leaves the target
Surprised, the terrible thrust on an unsuspecting target with two advantages if the blade is
discreet, a second Dodge. Tracker is the wilderness — a concealed trap that either Immobilises and
leaves difficult terrain or impales and keeps bleeding vital damage, foraging and tools, terrain,
and an animal companion who lends you defence, protects an ally, and grows tougher and sharper with
every Tracker pick. Combat Training and the shared damage passives round it out.

**How it plays.** Mark before the fight if you can, or with the first arrow if you cannot. Set the
trap where they will come. Archers shoot, back off, brace in cover; Assassins wait for the target to
look away; Trackers let the companion take one flank. Nothing needs Investiture, focus is spent
rarely, and the tree keeps working at full strength for as long as the fight lasts.

**The specialties as built.**
- **Archer** — range, extra damage, kite, scout the target, and the repeated Strike on the quarry
  at level 6.
- **Assassin** — knives, Surprise, the fatal thrust, re-marking, dodging.
- **Tracker** — the trap, the companion, foraging and terrain.

**Where the current prose is wrong.**
- "A torrent of arrows to scatter and terrorize foes" — no Hunter talent hits more than one target
  or frightens anyone. The Archer is a single-target marksman.
- "Assassins … quickly incapacitate" — they Surprise and they kill; nothing incapacitates.
- "High ground" is not a mechanic anywhere in the system.
- Roshar: "Stormlight Handbook", the grandbow and Shardblade rewards. The companion reward is real
  and should stay — the Tracker needs it.

**Draft opening.** *The thrill of the chase thrums in a Hunter's mind. A Hunter chooses one quarry
at a time, and then everything sharpens against it — finding it, striking it, learning where it is
weak. Archers shoot from range and step back out of reach. Assassins open with surprise and finish
with one terrible stab. Trackers lay concealed traps and fight beside an animal companion that
grows as they do. Almost nothing a Hunter does costs Investiture or focus: they never run dry, and
they never needed the leylines.*

---

## Agent — the plot die is yours

**In one line.** Where others roll the plot die and hope, an Agent rerolls it, flips it, raises the
stakes on purpose, and lends the trick to a friend.

**What the talents do.** The Key rerolls your plot die once a round; the tree stacks on it — reroll
again at a focus risk, turn a Complication into an Opportunity or buy the best Complication face on
purpose, raise the stakes on any test for a focus, do it on an ally's die. Three Free Actions buy two
extra actions for skill work in each of the three arenas. The combat kit is one jab: an unarmed
Thievery attack that Stuns on a hit, plus a silent takedown on the unsuspecting and a hide-after-
Disengage. Investigator learns a target's motivation and then leverages it: advantage against them,
you know when they lie, and once a case is built you can make them back down. Spy is the cover
identity, the disguise that needs no supplies and Surprises whoever sees through it, and the
high-society contacts. Thief is the contacts on the other side of the law, the fast feet, and the
gambles.

**How it plays.** Take the risk on purpose: raise the stakes, and if the die comes up wrong, reroll
it, or spend focus to make the Complication an Opportunity. Buy actions with focus when a scene
needs three skill tests in one turn. In a fight, Stun the one who matters and get out of reach. Out
of one, be whoever the room needs you to be.

**The specialties as built.**
- **Investigator** — motives, deduction, the lie-detector, the close.
- **Spy** — cover, disguise, the silent takedown, contacts up the ladder.
- **Thief** — the gamble, the jab, the vanish, contacts down the ladder.

**Where the current prose is wrong.**
- Least wrong of the heroic six. "Calculated strikes" is one Stun jab; "sabotage" and "unravel the
  carefully laid plans of others" are not mechanics. The plot-die line ("grasp the threads of fate")
  is exactly right and should lead.
- Roshar: "Stormlight Handbook".

**Draft opening.** *Agents grasp the threads of fate. Where others roll the plot die and hope, an
Agent rerolls it, turns a Complication into an Opportunity, raises the stakes on purpose, and lends
the trick to a friend — and when a scene needs three things done at once, focus buys the time.
Investigators read motives and close cases. Spies live under cover and disappear behind it. Thieves
gamble, jab, and vanish. Rules from outside are playthings; Agents answer only to their own code.*

---

## Scholar — knowledge the whole party uses

**In one line.** A rewritable character sheet, and three ways to lend what you know: read and shape
the leylines for your allies, time the fight, and heal without Investiture. It deals no damage.

**What the talents do.** The Key, Erudition, is a pool of skill ranks and expertises you reassign
after a rest with a library, and two passives widen what it can hold. Ley-surveyor is Edha's own
specialty: you know who is Invested and which colours they hold; when anyone draws or casts you learn
their Investiture, focus and rank; a mage who casts near you can be made to pay one Investiture more;
an ally you mark treats their rank as one higher for range and size; an ally you steady gets an
extra Investiture on their next draw; and once you have read an enemy's weave, your allies gain
advantage on their first test against it each round while it draws less. Strategist is timing: hand
the advantage you just gained to an ally (and stop the target reacting to them), defences up until
you have acted, remove an ally's Complication, re-spec mid-adventure, and once a scene give the whole
party an extra Action. Surgeon is the clinic: a heal that costs focus, made a Free Action and grown
by Medicine and Lore ranks, an exhausting jab, treatment of injury conditions during a rest, and
bringing back the unconscious or the recently dead.

**How it plays.** Between rests, set the skill list for what is coming. In a fight, act late in the
round (defences are up until you do), Gain Advantage and hand it to the striker, mark the ground
under the party's mage, and keep Field Medicine ready as a Free Action. Against a leyline mage, read
the draw and tax the working. Nothing here rolls damage; the Scholar's turn is spent on other
people's turns.

**The specialties as built.**
- **Ley-surveyor** — reading and shaping the leylines for the party, and taxing enemy workings.
- **Strategist** — advantage handoff, timing, complication removal, the party Action.
- **Surgeon** — focus-cost healing, condition and injury care, resuscitation.

**Where the current prose is wrong.**
- "Military Scholars often devise new instruments of war and calculate how to best pressure enemy
  forces" — no Scholar talent deals or increases damage. Cut the paragraph.
- The healing claim should be precise: the Scholar is the best healer who needs *no Investiture*,
  which matters to an all-heroic party; Green heals deeper and Life heals more.
- Roshar: "Desolation", "build Roshar anew", "Soulcaster", fabrial rewards (the Artifabrian is
  gone; the rewards line should follow it).
- (Stale in the review's profile: it describes an Artifabrian crafting specialty. Ley-surveyor
  replaced it in PR #329.)

**Draft opening.** *A Scholar's knowledge is a tool the whole party uses. Erudition lets a Scholar
rewrite their own skills between rests to fit what is coming. A Ley-surveyor reads the leylines as a
landscape — who is attuned, when they draw, what a draw will do — and lends that certainty to allies
while making enemy workings cost more. A Strategist hands the right advantage to the right person
at the right moment and, once a scene, gives everyone an extra Action. A Surgeon heals without
Investiture and brings the fallen back. A Scholar deals no wounds; a Scholar decides who does.*

---

## Envoy — one gesture, endlessly refined

**In one line.** Rousing Presence is the engine and the tree is what you bolt onto it: deliver it
free on every hit, and each delivery restores focus, strips conditions, raises a defence, or lifts an
ally off the ground — and the Diplomat can end a fight without a blow.

**What the talents do.** The Key makes one ally Determined for the scene. Mentor makes that free on
every hit or Gain Advantage, or a Reaction when an ally fails, and adds riders: focus back, Focused
instead of Determined, an extra Reaction every turn, and a revival with healing. Faithful is the
party's focus battery — an ally rolls their recovery die and regains that much focus, every focus
recovery you cause is bigger, your own pool is bigger, and delivering the Key can also remove Prone,
Slowed, Stunned and Surprised, raise a defence, or ripple focus across the party when an ally spends
their Determined. Diplomat is combat control by force of personality: a Discipline test that
Disorients an enemy and gives them disadvantage against you, used before their attack to raise your
Deflect, escalated into pacifying them — and if every non-minion enemy is pacified, the fight ends.
Oratory adds targets to both the Key and the challenge.

**How it plays.** Hit something, or Gain Advantage, and Rousing Presence goes out for free. Choose
the rider the moment needs: focus for the caster who is running dry, a defence for the one being
focused, a condition off the one who was knocked down. Keep the Reaction for the ally about to fail.
Against enemies you would rather not kill, challenge, calm, and talk them down.

**The specialties as built.**
- **Diplomat** — the challenge, the calm, the pacify, the peaceful end, and the social contacts.
- **Faithful** — the focus economy and the delivery riders.
- **Mentor** — free delivery, extra Reaction, revival, and the shared advantage.

**Where the current prose is wrong.**
- "Faithful … worship of the divine permeates their entire lives … traditions of their faith" — not
  one Faithful talent references a faith, rite or deity, in a system with ten deity trees. Either
  the prose describes the focus battery in devotional language without promising rites, or the
  specialty is a talent question, not a prose one. Prose first, per R-104.
- The Diplomat's combat control (Disorient, disadvantage, pacify) is not mentioned; the pacifist
  ending — the only one in the game — is the tree's best hook and is absent.
- Roshar: "throughout Roshar", "Stormlight Handbook".

**Draft opening.** *An Envoy's whole art is one gesture, endlessly refined: a word that leaves an
ally Determined, and a lifetime of learning what else that word can carry. A Mentor delivers it on
every strike for free. The Faithful make it restore focus, shake off a fall, steel a defence, and
ripple resolve through the whole company. A Diplomat turns it on the enemy — a challenge that
rattles them, a calm that settles them, and, if every foe is pacified, a fight that ends with no one
dead. Envoys serve something larger than themselves, and shape it in the serving.*

---

## Leader — the command die

**In one line.** Hand out the command die — a bonus die an ally adds to the roll that matters, grown
by every Leader pick and delivered free after a Strike — and win the rest with rank, rumour and
ruse.

**What the talents do.** The Key gives an ally a d4 to add to their next test for a focus. Three
talents grow the die and let you add it to your own social rolls; a Free Action after every Strike
delivers it for no Action (and no focus if you missed); with a title the range and the number of
allies double. Champion is the durable frontliner: move and give a target disadvantage against your
allies, then do it to several without provoking; enemies who resist you in reach are Disoriented;
before you drop you stay up on your Athletics. Officer is logistics and order: an ally Disengages or
Gains Advantage as a Reaction, the command die also grants movement and ignores Exhausted, Slowed
and Surprised, requisition with an Opportunity, and the finale — allies each gain an Action for an
extra Strike on one target. Politico is the dirty half: a Deception test that costs an enemy a
Reaction and gives disadvantage, rumour with an Opportunity, an ally who raises the stakes instead of
rolling your die (and refunds you on a Complication), a grand ruse, and enemies set at odds with one
another.

**How it plays.** Strike, then hand the die to whoever is about to roll the test that decides the
round. Move to draw fire. Give the archer a free Disengage. Out of combat, this is the path with the
most leverage over people: rumour, deception, persuasion, command, all of it with a die on top.
Several of its talents wait on a patron or a title — a third of the tree — so the campaign has to
hand a Leader the things that make a Leader.

**The specialties as built.**
- **Champion** — durability, drawing fire, intervention.
- **Officer** — supply, orders, movement, the synchronized assault.
- **Politico** — rumour, ruse, division, and the die on social rolls.

**Where the current prose is wrong.**
- The command die — the tree's entire mechanical identity — is not mentioned.
- "Champions ferociously charge … their momentum is magnetic, rallying nearby allies" — the
  Champion branch is a self-durability line with a protective rider; the rallying is the Key.
- Nothing warns that a third of the tree needs a GM-granted patron or title. It should.
- Roshar: "Stormlight Handbook", Shardplate reward.

**Draft opening.** *Leaders decide who rolls well. The command die — a bonus die handed to an ally
for the test that matters, grown larger with every Leader pick and delivered free after a Strike —
is the whole of the path, and the rest is what a Leader does with rank. Champions draw fire and stay
standing. Officers keep the line supplied, moving, and striking together. Politicos win with rumour,
ruse, and enemies turned on each other. No path has more leverage over people, in a fight or out of
one; and no path depends more on the title and the patron a campaign is willing to grant.*

---

# DEITY

*Each entry names the two lanes (one per gate colour) and the capstone, because that is the shape a
player actually walks; the "specialty" field is just the path name.*

## Death (Morrath) — the corpse economy

**In one line.** Every fall within reach is an offering: it refunds Investiture and leaves a
Harvested Remain, and Remains buy bone gardens, risen servants, words from the dead, and the dead
made to rise whole.

**What the talents do.** One entry is the economy — Reaper's Harvest pays you and marks a corpse
every time anyone drops within range, including your allies' kills, and you start every scene with a
Remain in hand. The other entry is the curse — a melee strike with vital damage that also forbids the
target to heal. The Green lane spends Remains: a square of grasping bone that hurts anyone who ends
their turn in it, a servant raised for the scene, three true answers from a corpse. The Black lane
installs scene-long effects: a decay that ticks vital damage on a Weakened or bloodied target every
turn and feeds you half of it, a chain that hurts every enemy near each new death, and the ward that
keeps one character from dying today. The capstone brings the dead back, at the cost of an injury.

**How it plays.** Two slow turns of installation — decay on the bloodied one, the cascade, a garden
where they will stand — and then the tree does its damage for free while you do something else.
Corpses, not Investiture, are the real limit: the party's kills are your fuel.

**The lanes as built.** Green: harvest, garden, servant, interrogation. Black: curse, decay, ward,
cascade. Capstone: Raise Dead.

**Where the current prose is wrong.**
- It is the one description in the atlas that delivers. Two refinements: Death Ward is not a way she
  kills (it is the way one of hers does not die), and the prose undersells the engine — the tree is
  an economy of deaths first and a curse second.

**Draft opening.** *Morrath, the Last Harvest, is the deity of Death — not its terror but its
husbandry. Every fall within her disciple's reach is an offering: it pays back Investiture and
leaves a Harvested Remain, and Remains are the coin of her darker work — bone gardens, risen
servants, answers wrung from the dead. Her curses wither and forbid healing; her decay feeds on the
dying; her ward keeps one of hers from dying today. And at the last, the dead are made to rise
whole.*

---

## Chaos (Maelith) — the crack in the mind

**In one line.** Find the fault line in an enemy and mark it with an Omen; every Omen is a crack
waiting to be widened — into damage that armor cannot turn, into solitude, into a good roll taken
away, into a working undone.

**What the talents do.** Omens are placed by landing Blue tests (the entry stamps one and deals
spirit damage; a later talent stamps two at once; the capstone stamps every enemy in range). Omens
are spent: to make the bearer reroll a test and take the worse result, to cut the bearer off from
aid and hurt it for it, to Disorient it while ending a buff, a stance or a sustained effect, to
shatter every Omen at once for area spirit damage and Disorient. A free passive senses every
Omen-bearer through walls and pays you Investiture when one takes damage. Everything Chaos deals is
spirit or vital — nothing is turned aside by Deflect.

**How it plays.** Stamp, then cash. Entropy Strike on turn one; on turn two either spread it or
spend it. Hold the Reaction for Shatter Focus when an Omen-bearer rolls the test that matters. The
Black lane needs Omens to be at full strength and cannot make them, so a Chaos disciple who takes
only the Black entry plays a weaker tree.

**The lanes as built.** Blue: stamp, spread, reroll, collapse. Black: isolate, unweave, sense,
isolate-and-ruin. Capstone: Unravel Everything.

**Where the current prose is wrong.**
- "Forces Complications onto an enemy's actions, then banks that misfortune" — no talent forces or
  reads a Complication. Omens come from *succeeding* on a test.
- "Spends it as focus seized, as advantage stolen" — neither exists. The spends are damage,
  Disoriented, Isolated, the forced reroll, and the dispel.
- Both intent sources agree with each other and disagree with the tree; the guide even hedged
  ("TBD"). This is the cleanest fix-the-prose case in the deity atlas.

**Draft opening.** *Maelith, the Unmaker of Certainties, is the deity of Chaos — patron of the
broken plan and the fatal coincidence. Her disciple finds the fault line in an enemy's mind and marks
it with an Omen, and every Omen is a crack waiting to be widened: into a good roll taken away at the
worst moment, into solitude where no ally can help, into a working undone, into wounds no armor
turns aside. When the pattern breaks, everything breaks with it.*

---

## Order (Tessavain) — the law and the oath

**In one line.** Declare a law on an enemy and it is punished the first time it breaks it; swear an
oath with an ally and both of you are harder to kill for as long as it holds.

**What the talents do.** Edict is a prohibition — name the forbidden act, and the first violation
deals spirit damage and Disorients, the Edict consumed; placing one tells you what the target means
to do next, and everyone gets advantage against a bound target; a sealed Edict punishes twice; Verdict
forces the violation now and cascades to the enemies around it. Covenant is a two-way pact with a
willing ally — defence for both while you are near each other, Aid across the room, temporary HP
every round for the sworn, half their wound taken by you when you choose, and, once Concord is sworn,
Aid handed between all your sworn as a Free Action and their first hits hitting harder. The capstone
binds every enemy in range with one law and names your sworn as Witnesses; the first violation
triggers every Edict you have.

**How it plays.** Turn one: Edict the enemy who is about to do the thing you cannot allow, Covenant
the ally who is about to take the hits. The Edict's ideal outcome is that it never fires — an enemy
who obeys is an enemy controlled. When you want it to fire, Verdict. All of Order's tests roll Blue;
White's rank sets the size of its protection.

**The lanes as built.** Blue: Edict, Lawkeeper's Eye, Sealed Edict, Verdict. White: Covenant, Bear
Witness, Shoulder the Oath, Concord. Capstone: Final Decree.

**Where the current prose is wrong.**
- It is right. The only refinement is to make the two lanes visible — the lawgiver on one side, the
  oath-brother on the other — and to say that a kept law is as much the point as a broken one.

**Draft opening.** *Tessavain, the Lawgiver, is the deity of Order — patron of oath, pact and
prohibition, whose word, once given, binds both ways. His disciple declares Edicts: one forbidden
act, and the first enemy to commit it is struck by the law itself. And swears Covenants: a pact with
an ally that shields them both for as long as neither breaks it. To keep his law is to be sheltered
by it. To break it is to learn that the court does not adjourn for one defendant.*

---

## Life (Anaveth) — diagnose, then heal

**In one line.** Diagnose one enemy and the whole party knows where it is weakest and cuts deeper
for it, while every wound it takes pays back Investiture — spent on the biggest healing in the
game, each heal with a rider.

**What the talents do.** Vital Diagnosis marks one creature: you know its exact health, maximum,
conditions and defences for the scene, everyone deals extra vital damage to it, and (with Prognosis)
every time it is hurt you recover Investiture. Life Surge is the heal — big, plus Awareness, with
overflow becoming temporary HP, castable on yourself. Overgrowth heals and grows armor that stacks.
Surgical Precision, at rank 3, is the largest single heal in the game and strips a condition.
Lifeline lets you take half of an ally's wounds as spirit damage and heal them for it. Primal
Regeneration is a per-turn heal that grows if the target is mutated. Adaptive Mutation, also rank 3,
grafts bone spurs, venom or dense tissue onto an ally for the scene. The capstone makes one creature
a regenerating, armored, vital-dealing engine for the scene, and leaves it with an Injury after.

**How it plays.** Mark the enemy the party is going to fight anyway; from then on the fight funds
itself. Heal the one who needs it and choose the rider. At level 6 the mutations arrive and the
"ally as the battle's engine" fantasy becomes real; before that, Life is the diagnosis-economy
healer.

**The lanes as built.** Blue: Diagnosis, Prognosis, Surgical Precision, Lifeline. Green: Life
Surge, Overgrowth, Adaptive Mutation, Primal Regeneration. Capstone: Apex Form.

**Where the current prose is wrong.**
- "Reading an ally's anatomy to strike an enemy's with precision" — Diagnosis marks any one creature;
  there is no ally-to-enemy reading.
- The signature resource, Mutation, is a level-6 talent; the prose leads with it. Lead with the
  diagnosis and the flood of healing; promise mutation as what the disciple grows into.
- The party-wide vital rider on the mark is the tree's best hook and is not mentioned.

**Draft opening.** *Anaveth, the Vital Hand, is the deity of Life — growth, healing, and the
intimate knowledge of living things. Her disciple diagnoses first: one look at an enemy and the whole
company knows where it is weakest and cuts deeper for it, and every wound it takes pays her power
back. She spends that power on healing no leyline mender can match — floods that leave vigor
behind, hide that hardens, regeneration that does not stop — and, in time, on grafting adaptations
onto an ally that make them the battle's engine.*

---

## Sovereignty (Verdannis) — who may strike hard

**In one line.** Rule on who may strike hard: one word and an enemy's blows shrink, die by die; one
word and an ally's grow; the judgments start as moments and become the law of the scene.

**What the talents do.** Censure steps an enemy's damage die down; Exalt steps an ally's up.
Scene-long versions of each arrive at rank 3. The riders make the court pay: an enemy under Censure
who fails a test refunds your Investiture and, when it misses an attack, gives its target a Reactive
Strike; an ally under Exalt also gains temporary HP. Sovereign's Balance does both at once and extends
if the ally hits the enemy. Edict of the Fallen steps an enemy's attack dice down twice for the
scene and drips temporary HP to the party every time it misses. The capstone does both, twice, for
the scene, and the enemy loses its Reactions whenever the exalted ally hits it. No damage, no
healing, no zone, no Reaction, no information.

**How it plays.** Pick the enemy whose hits you fear and the ally whose hits you want, and rule on
them. Everything else is watching the enemy miss and collecting what its failure pays. The tree's
one enemy-facing verb is diminish; its one ally-facing verb is exalt; the scene versions make the
entries obsolete.

**The lanes as built.** Black: Censure, Expose, Decree of Ruin, Edict of the Fallen. White: Exalt,
Sovereign's Favor, Investiture of Authority, Sovereign's Balance. Capstone: Sovereignty.

**Where the current prose is wrong — and where it is waiting on a build.**
- "Drawing both into Decrees — declared laws that hold sway within his reach" and the guide's
  "Decree zones": no talent has a radius; every one names a single creature. **Ben ruled R-97 (a):
  the Decree zone gets built as a radius that moves with the arbiter (item 106, design gate).**
  So this is the one tree where the prose should *wait for the talent*: write the die-step arbiter
  now, and add the Decree sentence when item 106 lands, not before.
- White is a pure gate here (no test, no die, no number reads it); the guide's "cleanest example of
  the colour-thematic test rule" is not true of the tree as built.

**Draft opening (as the tree stands today; a Decree sentence is owed by item 106).** *Verdannis,
the Crowned Arbiter, is the deity of Sovereignty — the right to raise and to cast down. His disciple
rules on who may strike hard: with one word an enemy's blows shrink, die by die, and with another an
ally's grow. The judgments begin as moments and become the law of the scene, and an enemy found
wanting feeds the court — every failed swing pays the arbiter back, opens a Reactive Strike, or
shields the company. Here, he decides what is possible.*

---

## Knowledge (Gnothis) — the study that kills

**In one line.** Mark one quarry and study it: every Insight on it makes your hits heavier, the
pack shares what you learn and hits heavier too, and the kill carries the study to the next.

**What the talents do.** Studied Mark places two Insight and reveals health, conditions and
defences; Insight accumulates every turn for free and refunds Investiture whenever the quarry is
hurt. Predatory Strike is the whole tree in one talent: a weapon attack with an extra [Tier][Die] of
vital damage *per Insight*, and it adds another. Hunter's Discipline adds flat vital and carries half
the stack to a new quarry on the kill; Death Mark carries the whole stack and gives every ally a free
vital hit. Pack Share and The Pack give the party the statblock and bonus vital damage against the
quarry, and let the first ally to hit each round add Insight. Killing Blow and the capstone cash
the stack for a burst and reset it — the capstone also hands every ally a free Strike.

**How it plays.** Mark on turn one. Then hit the same creature, every turn, and watch the number
grow; the pack piles on because the pack gets paid for it. Never cash the stack unless the fight is
ending — the repeatable strike is worth more than the burst. Re-mark on the kill and carry the
study forward. Green here is a gate only; nothing rolls it.

**The lanes as built.** Red: Predatory Strike, Hunter's Discipline, Killing Blow, Death Mark.
Green: Studied Mark, Accumulate, Pack Share, The Pack. Capstone: The Final Study.

**Where the current prose is wrong.**
- Nothing of substance. "Patience first, then a strike that lands like a verdict" describes the
  cash-out; the tree plays as continuous escalation with the cash-out as a finisher. Say that the
  mark grows every turn and the pack shares it, and the verdict is optional.

**Draft opening.** *Gnothis, the Watching Mind, is the deity of Knowledge — but his is the
knowledge of the hunt. To study a thing is to learn how to kill it. His disciple marks one quarry and
watches it: every turn's study is another Insight upon it, and every Insight makes the next blow
heavier — for the disciple and for the whole pack, who see what he sees and profit from it. The kill
does not end the study. It carries it to the next.*

---

## Fate (Olvarra) — the board, prepared

**In one line.** Build the battle before the enemy understands it is being fought: Ordained Ground
where allies will stand, Snares where enemies will step, and threads between them so that one
triggers the other.

**What the talents do.** Ordained Ground is a free-action square: an ally who starts their turn on
it has better defences and can Aid at thirty feet, gains temporary HP every round, and cannot be
hit with advantage. Snare is a square that the first enemy to enter pays for — keen damage plus
Restrained, no test, no save; an Inevitable Snare hurts twice and Disorients; a Hexmark on whoever
sprang it makes them bleed extra whenever they are hurt near your squares. Read the Threads is the
one foresight — learn a creature's next action and move, then slide a square or a Snare into its
path. Foreknown Strike lets an ally on Ordained Ground spring any Snare within thirty feet as a Free
Action; Weave the Thread links two squares so allies on them Aid freely and Reactive-Strike whoever
springs a Snare nearby. The capstone declares an event, and when it happens every square grants a
free Strike or Aid and every Snare fires.

**How it plays.** Turn one: a square under the ally who will hold, a Snare on the approach. Turn
two: read the enemy who matters and move the trap into its path, or link the squares. The tree's
output is mostly *given away* — the allies standing on your ground do the striking, and the enemy
walks into the damage. Placement costs Actions like anything else; nothing happens before initiative.

**The lanes as built.** White: Ordained Ground, Bulwark Ground, Read the Threads, Weave the Thread.
Green: Snare, Inevitable Snare, Hexmark, Foreknown Strike. Capstone: Thread of Inevitability.

**Where the current prose is wrong.**
- "The oracle who sets the board before initiative is rolled … they have already read it" — one
  talent in nine reads anything, and every placement costs an Action in combat. The tree is
  battlefield engineering with a single foresight play. Sell the engineering; keep the oracle as
  flavour.
- White here is a pure gate (nothing tests or reads it); R-99 (a) → item 108 gives it a job.
  Prose should not promise a White mechanic until then.

**Draft opening.** *Olvarra, the Thread-Reader, is the deity of Fate — the one who has walked the
battlefield before the battle. Her disciple builds the fight before the enemy understands it is being
fought: Ordained Ground where allies will stand and be hard to touch, Snares on the squares an
enemy has not yet chosen to enter, and threads between them so that a friend on one can spring the
trap on another. She can read a foe's next step and move the wire into it. At the last she names an
event, and when it comes, everything she prepared answers at once.*

---

## Civilization (Kethane) — the machine and the wall

**In one line.** Forge a Combat Construct that fights beside the party for the scene and arm it with
every talent after; around it, lay Foundations that steady whoever holds them and, fortified, become
walls with teeth.

**What the talents do.** Forge Construct, one Action at level 1, makes an autonomous attacker on
its own initiative for the scene; if it falls you forge it again. Tempered Edge doubles its melee
damage and ignores deflect. Siege Form roots it and gives it a sixty-foot energy cannon. Arsenal
gives it a second attack and a free follow-up after every kill. Magnum Opus makes it a Colossus with
reach and area knockdown. Lay Foundation is a free-action ten-foot square that steadies allies
starting their turn in it; Trade Routes links two so allies teleport between them; Bonds of
Community gives everyone in a Foundation temporary HP and advantage when something dies in one;
Bastion fortifies every Foundation into difficult terrain that hurts and Slows enemies who enter.

**How it plays.** Turn one, build the machine. Buy its multipliers. Then spend your own turns on
the quarter — Foundations under the party, a road between them, walls when the enemy comes — while
the Construct fights for free. There is no repair; there is only reforging.

**The lanes as built.** Red: Forge Construct, Tempered Edge, Siege Form, Arsenal. White: Lay
Foundation, Trade Routes, Bonds of Community, Bastion. Capstone: Magnum Opus.

**Where the current prose is wrong.**
- "Repairs and commands it" — nothing repairs; the Construct acts on its own initiative and is not
  commanded turn by turn. Say "arms it" and "reforges it".
- The Foundation half is under-sold in the current text and is the second real thing the tree does.

**Draft opening.** *Kethane, the Great Builder, is the deity of Civilization — the forge, the wall,
and the bonds that turn a crowd into a community. Her disciple builds. On the first turn a Combat
Construct stands up and fights beside the company for the scene, and every talent after arms it —
a tempered edge, a siege form, a second strike, at last a Colossus. Around it she lays Foundations:
ground that steadies whoever holds it, roads allies can step between in an instant, and, when the
enemy comes, walls with teeth.*

---

## Power (Tyrith) — the warlord

**In one line.** One word and an enemy kneels, its next choice yours to make; in melee every strike
carries extra weight, a kill sends you forward, nothing slows the advance, and the more enemies you
have broken this scene, the harder the next blow lands.

**What the talents do.** Kneel Compels a target (next action: come to you, or nothing) and gives you
advantage against the Compelled and Weakened. Absolute Authority chooses a Compelled or Weakened
target's next action outright — the only talent that takes an enemy's turn and *spends* it. Crown of
Thorns makes every Black or Red test against a mind hurt. Warlord's Advance is a melee strike with
extra dice, temporary HP and a free step on the kill; Momentum of Victory is a free charge-and-Strike
on an Opportunity; Unstoppable Advance walks through enemy spaces and hurts each one. Warlord's Fury
scales melee damage with how many enemies you have bloodied this scene. Investiture of Command arms
three allies with temporary HP and advantage at a cost in your own spirit. The capstone hardens you,
adds spirit damage to every strike, gives the company a bonus to all tests, and lets you push part of
what hurts you onto willing allies.

**How it plays.** Kneel the one who matters; command him next turn. Advance through the line and
strike. The fury grows as enemies fall below half. No ranged option, no healing, no Reactions, no
resource generation: Tyrith spends Investiture and spirit and does not get them back.

**The lanes as built.** Black: Kneel, Absolute Authority, Crown of Thorns, Investiture of Command.
Red: Warlord's Advance, Momentum of Victory, Unstoppable Advance, Warlord's Fury. Capstone: Mantle
of the Aspirant.

**Where the current prose is wrong.**
- "Signature resource: Bounty — a tally of the fallen; each enemy slain adds one, escalating your
  dominating talents" — no talent is named Bounty; the counter that exists (Warlord's Fury) counts
  enemies *bloodied*, feeds melee damage only, and is a scene-long install, not a passive tally.
  Describe the fury as it is.
- Kneel and Absolute Authority both name Frightened, which nothing in the game applies. Not a prose
  matter — flagged for the talent side.
- "Made to serve" is right; "feeds on the kill" is one clause on one strike.

**Draft opening.** *Tyrith, the Iron Crown, is the deity of Power — domination as an end in itself.
His disciple does not persuade. One word and an enemy kneels, Compelled, its next choice his to
make; defiance itself draws blood. In the press he is a warlord: every strike carries extra weight,
a kill sends him forward, nothing slows the advance, and the more enemies he has broken this scene,
the harder the next blow lands. His banner-bearers share the crown. He pays for it in his own
spirit.*

---

## Destruction (Razkael) — timed, and burning

**In one line.** Set a Charge with the trigger you choose and detonate it when you like — no roll,
no save — and paint the ground with fire that keeps spreading; when the moment is right, everything
goes off at once.

**What the talents do.** Set Charge places a marker with a declared trigger, detonated as a Free
Action on your turn for area energy damage that leaves dangerous terrain. Concussive Yield knocks the
radius Prone; Pinpoint Charge ignores the target's deflect, hurts it more, and makes the fire follow
it. Cascading Failure detonates any number at once and merges the fire. Pyre is the other entry — a
ranged strike whose fire spreads every turn; Combustion Chain makes every zone grow when something
dies in one; Walking Ruin makes every square you cross dangerous and you faster; Fault Line is a
sixty-foot trench of damage and Prone. The capstone detonates everything, wider, through deflect,
and merges every hazard into one burning field.

**How it plays.** Place, wait, detonate. Almost nothing here can miss or be saved against; the
enemy's only defence is not to stand where you decided. The only control is Prone; nothing pulls
enemies into the fire, so the tree wants the party to hold them there. Blue here is a gate; the
tree rolls Red.

**The lanes as built.** Blue-named, Red-rolled: Set Charge, Concussive Yield, Pinpoint Charge,
Cascading Failure. Red: Pyre, Combustion Chain, Walking Ruin, Fault Line. Capstone: The Unmooring.

**Where the current prose is wrong.**
- It is close. "Plants delayed Charges with precision" — precision is one optional rider. The
  reliability is the hook: nothing here misses. Add the fire lane; the current text is all Charges.
- Blue is a gate (R-99 (a) → item 108).

**Draft opening.** *Razkael, the Sundering Flame, is the deity of Destruction — the siege engineer
and pyrotechnician who turns timing into devastation. His disciple sets Charges with a trigger of
his choosing and detonates them when he likes; nothing dodges what was decided before it arrived.
His fires do not go out — they spread, they follow the marked, they grow on every death — and when
the moment is right, every Charge and every flame he has placed goes off at once.*

---

## What this means for the prose pass (item 111)

**The atlases in order of how much rewriting they need.**

1. **Heroic** — all six, because the Roshar text has to go regardless; Warrior (stances) and Leader
   (the command die) need their real mechanic written in; Envoy's Faithful and Hunter's Archer need
   honest specialty lines; Scholar's Ley-surveyor is already Edha text and stays.
2. **Leyline** — five entries, each mostly right in feel and wrong in one or two load-bearing
   clauses: White's "binding enemies", Black's "strips focus" and 10 ft, Red's "wounds are fuel",
   Green's cluster framing, Blue's guide entry. The path descriptions need light surgery; the
   **leyline guide's colour identities** need the heavier rewrite (Blue and Red especially).
3. **Deity** — Death, Order, Knowledge and Destruction are close to right. Chaos (Omen source and
   spends), Life (lead with diagnosis), Fate (engineering, not oracle), Civilization (arms, not
   repairs) and Power (no Bounty) need their second paragraph rewritten. **Sovereignty waits for
   item 106** — write the arbiter now, add the Decree when it exists. The deity guide's identities
   for Chaos ("TBD"), Sovereignty ("Decree zones … cleanest example") and Power ("kill-count")
   need the same corrections.

**Things the prose must not promise until a talent exists** (open items): Sovereignty's Decree
(106), a job for Fate's White, Destruction's Blue and Life's Blue (108), and anything that applies
Frightened.

**Things the prose should start saying** that no description says today: that Blue and Scholar deal
no damage (and Sovereignty deals none); that Black's ray costs health; that a Hunter never runs dry;
that a third of Leader waits on a patron or a title; that Envoy can end a fight without a death;
that Red gives up its Reaction to draw; that Green alone closes an Injury.
