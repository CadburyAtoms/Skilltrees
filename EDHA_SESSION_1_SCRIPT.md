# Edha — Session 1 Run-Sheet: "The Harvest That Won't Die"

**Runnable GM script for session 1.** Companion to `EDHA_CAMPAIGN_OPENING.md` (the plan/act
ladder), `EDHA_CAMPAIGN_CANON.md` (what's true), and `EDHA_CAMPAIGN_STATE.md` (what's
happened). This is the *read-at-the-table* version: read-aloud boxes, NPCs with faces, the
ford combat statted, and a clue ledger. GM truth throughout **except §8 (player-safe)** —
⚑ marks a provisional default (name, coordinate) you can swap freely.

Map: `source-materials/maps/thyrcross-labeled.png` (scale: **1 px ≈ 1.5 km**; all geometry lives
in `source-materials/maps/thyrcross.map.json`, measured with `scripts/map/measure.py` — canon
§5a). Sites run **south down the Palewater**, the Thalendor/Corvaine border river: **Elmsworth**
(1290,1470 — the head-of-navigation port) → **Palewater Ford** (1422,1794 — 935 km along channel)
→ **Withervale** (1480,1925 — 1,339 km) — **~twelve days downriver** for a laden flotilla
(barge_down 110 km/day; the drawn channel meanders at ~2.1× straight-line and the measurement
honours it). The convoy is a **barge flotilla**: the river IS the delivery system. The **Black
Altar Crossing** (1449,2337) lies 1,355 km further down the same channel — ~twelve more days by
water, or ~620 km overland — the *act-1 finale*, not tonight.

---

## 0. What this session is for

**The job:** escort three barges of the Mage's alchemical relief concentrate twelve days
downriver, from a granary river-port to a starving border village. Simple on paper. **The point:** by the last scene the players should have *felt* —
not been told — that **nothing in this land can properly die.** That image is the whole campaign's
seed. Everything else tonight (the raid, the politics, the famine) is scaffolding around that one
horror.

**Three promises the session keeps:**
1. **Any build works.** Guards guard, healers tend, talkers negotiate, scouts scout. The hook is a
   *mystery*, not a stat check — every table finds it.
2. **The famine is a symptom, shown early.** The Mage's alchemy visibly *fakes* a working harvest.
   That wrongness is the first crack.
3. **End on the hook, not a cliffhanger fight.** Session 1 closes quiet and wrong, in Withervale.

**Do NOT reveal tonight** (these are later payoffs — let players *feel* them, never name them):
Morrath / Death being sealed; the gods at all; the Fetch; why Goldenport prospers. Tonight's
vocabulary is *mortal*: hunger, plague, raiders, a village where the dying won't die.

**Session goal for the table:** get the convoy to Withervale and let the village land. If the fight
runs long, cut Scene 1 short — Withervale is the one scene that must breathe.

---

## 1. Cast (session-1 NPCs)

| NPC | One-line | Face / voice | Wants |
|---|---|---|---|
| **Marshal Vareth Khor** | Thalendor's border marshal; devoted Kethane (Civilization) follower — believes *order fed people once and will again* (canon §6). | Grey-templed, immaculate even now; speaks in logistics. Never raises his voice. | The convoy delivered and the border held with a garrison he doesn't have. |
| **Alchemist Doran Fenn** | Runs the Mage's relief vats at Elmsworth. | Young, exhausted, ink-and-reagent-stained; proud of work he half-suspects is a lie. | To be *believed* that the alchemy is enough. It isn't and he knows it. |
| **Wick** | Lead bargemaster; has run this river thirty years. | Weathered, fatalistic, dry jokes. Knows every bar and channel of the Palewater. | To not get killed for someone else's grain. |
| **Sergeant Halden Roek** ⚑ | Corvaine regular leading the raid — a *soldier*, not a bandit. | Hollow-cheeked under too-good armor; ashamed and doing it anyway. | Food for his own starving unit. Would rather not kill. |
| **Keeper Harrow** | Priest of the Last Harvest (Morrath) at Withervale's shrine. | Old, faithful, and breaking — kept the merciful rite until it stopped answering; his faith in the Shepherd will not let him take by knife what the god should take by grace. | An answer to *why the deaths won't take* — and the strength to keep faith while he waits for one. |
| **Gramma Mella Ashmark** ⚑ | Withervale elder; keeper of the border folklore. | Sharp-eyed, unbothered by much; tells the old stories straight. | Someone young enough to *listen* before it matters. |
| **Elder Joskin** ⚑ | The man who has been dying for four months and cannot finish. | Grey, sunken, breathing like a bellows with a hole in it. Lucid in flashes. | To be allowed to die. Nobody can give it to him. |

> ⚑ Every name here is a swap-at-will placeholder except **Marshal Vareth Khor** (canon §6).
> Gramma Ashmark deliberately echoes the oneshot's "Theron Ashmark's grandmother" Black-Altar
> folklore (canon §5) — keep or rename.

---

## 2. Scene 1 — Elmsworth: loading the lie

**Site:** granary river-port at the head of navigation, where Thalendor's lake country spills
into the Palewater (1290,1470). **Goal:** hire/attach the PCs, put the flotilla on the water, and
plant the *alchemy-is-faking-it* crack. Keep it to ~30–40 minutes.

### Cold open (read aloud)

> Elmsworth should smell like a harvest town. It smells like a laboratory. The granary's great
> doors stand open on a hall of copper vats instead of grain — and from their spouts pours
> something the colour of weak honey, ladled into sacks and stamped with the Mage's seal. A line
> of gaunt farmers watches it happen without a word. Their own fields, you passed on the way in,
> are *thin* and *wrong* — half the rows never came up at all, bare earth where the seed should
> have risen, and through the gaps stand patches of black-blighted wheat that nobody is cutting,
> because when they cut it, it doesn't dry. It doesn't rot either. It just… stays.

### Getting the PCs attached (any origin)

Marshal **Khor** needs bodies for the escort and does not have the luxury of asking who they are.
Whatever the party is — mercenaries, refugees working passage, a Thalendor patrol, pilgrims,
opportunists — Khor attaches them in one flat sentence: *"You'll ride the grain down to
Withervale. Twelve days on the water. My garrison can't spare six men for twelve days, let alone
the twenty it would take to do it right — so it's you."*

- **Payment** is food (worth more than coin here) or passage papers — dealer's choice per PC.
- If a player *wants* a reason to care, hand them one: a Withervale relative, a debt to Khor, a
  Green PC who can already feel something wrong down the border road.

### The alchemy tell (the crack)

**Alchemist Doran Fenn** walks them past the vats and oversells it: *"Concentrate. One sack feeds
what a field-acre used to. The Mage solved hunger — you're welcome."* Let the players poke.

- **Insight or Medicine vs. Fenn (DC 12):** he's performing. The stuff is *nutrition without
  life* — it stops starvation and nothing more; livestock fed on it don't recover, they just don't
  die. He knows the real fields failed months ago and won't say why. ("The Root Network's thinner
  every week" is as far as he'll go — he blames "bad leyline weather.")
- **Lore / Crafting (DC 13):** the process is real alchemy, but it's *substituting* for a natural
  cycle that has simply stopped — like a splint on a bone that isn't trying to knit.
- **Green-aligned PC (freebie, no roll):** standing between the vats is uncomfortable. The Root
  Network *should* hum here. It's being pulled thin, southward and down, toward the border.

> **GM note — what this plants:** the world's life-support is a *forgery*, and something upstream
> is draining Green. Do not explain it. The player who says "wait, why doesn't the cut wheat rot?"
> has just found the whole campaign — smile and move on.

### On the river (days 1–7)

Wick's flotilla is three laden grain-barges riding the current, poled and steered, drifting the
long reaches through the night with a steersman on watch; the PCs split across them. Seven travel
days before the shallows — run two or three beats, not a montage of twelve:

- A **garrison river-post**, undermanned, waves them through; its sergeant begs for news from
  *up*river, because none comes up anymore.
- A barge of **border families poling the other way**, upriver, quitting the frontier while they
  still can. Nobody comments on the direction the PCs are headed.
- A **Corvaine scout** on the east bank, mounted, keeping pace for an hour. He doesn't engage.
  Wick, not looking up from the steering oar: *"Counting barges. They'll know our load before we
  do."*
- Evening of day 7, Wick foreshadows: *"Palewater shallows tomorrow. Only stretch a man can wade
  the border for fifty mile — that's why the raids happen there and nowhere else. We pole the
  channel single file and we don't stop. Boots dry, hands free."*

---

## 3. Scene 2 — Palewater Ford: the raiders' ford

**Site:** the braided shallows of the Palewater, day 8 or 9 (1422,1794). The river spreads over
gravel bars here and the barge channel threads them **single file, dead slow** — and those same
shallows are the **only wadeable border crossing for fifty miles**. The convoy never fords
anything; *the raiders do*. That's why the ambush happens here and nowhere else. **Goal:**
tutorial combat that is *sad, not evil*, and drops the **Malcurr-funding** seed. ~30–45 minutes.

### The ambush (read aloud)

> The Palewater spreads to half a mile of braided gravel and brown water, and the barges slow to
> a crawl — poling single file up the one channel deep enough to float them. The lead barge is
> midway through the bars when the willow scrub on the Corvaine bank comes apart into people — a
> dozen thin figures in *good* armour wading the shallows in a broad, practiced line, crossbows
> up, water at their knees. The man at their head wades with one arm raised high — not a
> weapon: a folded paper, sealed and beribboned. A voice, hoarse and almost apologetic:
> **"Writ of requisition, under the regents' seal. Hold your poles. Ground your grain on the
> bar and walk on south, and nobody drowns today."**

They mean it. Roek's people want the food, not a fight. **If the PCs stand down, the raiders
offload two barges onto the bar and vanish back across the shallows** — a legitimate (if
unsatisfying) resolution that still delivers every clue. Most tables will fight. Some will talk
(see *Outs*).

> **GM note — the writ is real (canon §5b; rulings 28–30).** Corvaine raid culture is duty,
> not banditry: taking *with* a writ of requisition is lawful; taking without one hangs. Roek
> will present the paper with genuine solemnity to anyone who parleys — wax over the regents'
> signatures, and a sharp-eyed PC notices the seal pressed into the wax is a **child's
> handprint** (Corvaine's king is a boy; public knowledge, and a free hook). The desperation
> behind the writ is *institutional, not caloric* (ruling 28): Corvaine still has food — it's
> the treasury that failed, and Roek's unit raids because it is **unpaid** in a kingdom
> performing solvency. The paper is the only thing standing between what he does and what
> he'd hang for, which is why he holds it up before he holds up a blade. If the raiders leave
> with grain, the last thing the PCs see is each of them pausing mid-river to duck fully
> under, armour and all, before climbing the far bank — Corvaine raiders wash before they
> walk home ("leave the far bank in the water").

### Battle map (shallows boarding)

~30×20 squares. The deep channel snakes corner-to-corner; the three barges are strung along it
single file, decks ~3 squares wide.
- **The lead barge, grounded** — Roek's opening move drops the lead poleman and the barge noses
  onto a gravel bar. It's the chokepoint, the best cover, and the thing being fought over.
- **Gravel bars** = firm ground; their sunken edges give half-cover to anyone hugging them.
- **The shallows** = knee-deep braided water everywhere off the bars — difficult terrain (Slowed)
  for *everyone*, raiders included.
- **The channel** = too deep to wade (swimming) — a moat the raiders must skirt; the barge decks
  fight over it.
- **Willow scrub** on the Corvaine bank = the crossbow line's cover.

Design goal: the PCs defend three slow-moving objects strung through a kill-box while skirmish
lines wade in from the flank. Positioning on decks and bars *is* the fight.

### Adversaries (tier 1; schema matches `data/adversaries.json`)

**Corvaine Raider** — minion, ×3 (see scaling). *humanoid, tier 1.*
- **Defenses** phy 12 / cog 11 / spi 11. **deflect 2** *(the tell — see below)*. **HP** 12.
  **foc** 1. **Move** 25 ft.
- ▶ **Soldier's Crossbow** — attack +4, Range 60 ft., 1d6+2 **keen**.
- ▶ **Shortsword** — attack +4, Reach 5 ft., 1d6+2 **keen**.
- ⟲ **Break** (Reaction, free): when a Raider is first reduced below half HP *or* an ally drops,
  it may immediately Disengage and flee. These are not fanatics.

**Sergeant Halden Roek** ⚑ — rival, tier 1. *humanoid.*
- **Defenses** phy 13 / cog 12 / spi 12. **deflect 2**. **HP** 28. **foc** 3. **Move** 25 ft.
- ▶ **Issued Blade** — attack +5, Reach 5 ft., 1d8+2 **keen**.
- ▶▶ **Press the Line** — attack +5, Reach 5 ft., 1d8+2 keen; on a hit, one ally Raider may make a
  crossbow shot as a Reaction. *(Costs 1 focus.)*
- ⟲ **Cover Their Retreat** (Reaction, 1 focus): when an ally within 20 ft would drop, Roek grants
  it disadvantage-to-be-hit until his next turn instead (shoves them behind cover).
- **∞ Not a Bandit** (trait, GM-run): Roek will accept a surrender or a fair split and *stop*. If
  reduced below 1/3 HP, he calls the break himself: *"Enough. We're done. Take your grain."*

### The tell — "gear too good"

Starving irregulars do not carry **matched deflect-2 armour and fresh-forged keen blades.** Any PC
who looks:
- **Perception (DC 12)** or **Crafting/Lore (DC 13):** the armour and blades are *new*, uniform,
  and stamped with a **Malcurr** maker's mark — mountain-forge work, not Corvaine issue. Someone is
  *equipping* Corvaine's desperation.
- If nobody rolls it, **loot makes it free:** searching a downed raider puts the Malcurr-stamped
  blade in a PC's hand. This clue must not be missable.

### Tactics

Round 1: the crossbow line shoots from the willow scrub while two waders per barge close through
the shallows to board (everyone off the bars is Slowed — the kill-box working as designed). Roek
holds the center bar, using **Press the Line** to keep pressure and **Cover Their Retreat** to
preserve his people. He is *managing losses*, not seeking a win — play him like a man who has made
this crossing a dozen times and hates it more each time.

### Outs (reward talk and mercy)

- **Persuasion / Leadership vs. Roek's Spiritual (DC 13):** offer a split of the grain, or point out
  Withervale is starving *too*, and he'll take one barge's load and go. (He can't wade home empty —
  his unit starves either way.)
- **Intimidation (DC 14):** harder — he's already past fear — but a decisive show of force early
  makes him call the break a round sooner.
- **Feeding them / healing a downed raider:** Roek remembers it. Flag it — a merciful party has a
  *contact inside Corvaine's border troops* for later acts.

### Scaling (3 PCs baseline, builds unknown)

- **Default:** Roek + 3 Raiders.
- **±1 PC:** ±1 Raider. **Squishy/support-heavy party:** drop Raider deflect to 1 and HP to 10.
- **Melee-heavy party:** keep the crossbow line in the scrub an extra round and add a fourth
  Raider to punish the wade — the party has to cross the same Slowed water the raiders do.
- **Ranged/caster-heavy party:** collapse the crossbow line early and send everyone to board —
  bring the fight onto the decks.
- The encounter should *bruise*, not threaten a wipe — a first fight that teaches the map and the
  tone. If a PC drops, they get dragged onto a bar — by either side; nobody here wants a drowning.
  Roek's people don't finish the downed (they want grain, not murder) — a clean place to teach the
  injury rules without a death.

---

## 4. Scene 3 — Withervale: the harvest that won't die

**Site:** famine village, Thalendor side of the border (1480,1925) — the flotilla ties up at its
river-stage on day 12. **Goal:** land the hook. This is the scene the whole session exists
for. Slow down. Let silence sit. ~45–60 minutes, no combat.

### Arrival (read aloud)

> Withervale should be a corpse of a village. It isn't — and that's worse. Its fields are *thin* —
> half the seed never rose, bare ground between the rows — and what did come up stands
> black-blighted, shoulder-high and uncut, because it will not fall and it will not rot; it just
> leans, and rustles, and waits. In a pen by the road a cow lies on its side,
> ribs like a ship's hull, eyes open. It has been unable to stand for a week. It has not died. Its
> flank rises. And falls. And rises. Nobody in Withervale is weeping. They stopped, some time ago,
> because weeping is for things that *end*.

### The four wrong things (set-dressing — let players find them)

Scatter these; don't announce them as a list. Each is the same impossibility from a different angle.

1. **The standing blight.** Cut a stalk and it neither dries nor rots (a Green PC feels it *refuse*).
2. **The cow that won't fall.** Up close the smell is wrong two ways at once: the pen reeks —
   bedsores gone bad on a living animal, decay *on* a body that will not die — and yet nowhere in
   Withervale is there the honest smell of carrion, because nothing here finishes. **Survival /
   Perception (DC 12):** the profile is unnatural — festering that never ripens, decay without
   death; nothing in this village has *completed* dying for months (canon §1a, ruling 34).
3. **Elder Joskin.** In the third house, a man four months "dying" of the plague and unable to
   finish. **Medicine (DC 13):** by every sign he should have passed weeks ago — instead the
   wasting has carried him to the threshold and now *crawls* along it; at this pace the end is
   seasons away, maybe years (canon §1a: the wasting still kills, agonizingly slowly). He
   whispers the same thing to anyone who leans close: *"Won't you ask them to let me go?"*
   (He means the shrine. He means the god.)
4. **The silent shrine of the Last Harvest.** See below.

> **Scale check (ruling):** Joskin and the cow are Withervale's *only* lingering cases — the
> wrongness is months old, not years, and it still counts in ones and twos. Resist the urge to
> fill barns with the breathing dead; that horror is banked for the deep-famine nations in later
> acts. Two is enough. Two is *worse*.

### Keeper Harrow and the silent shrine

The Last Harvest shrine — a low stone house with a black-and-green threshold — is where Withervale
brought its dying for the merciful rite. **Keeper Harrow** hasn't performed it in months, because it
*stopped working*.

> Harrow, not looking up: *"You want to know why they don't die? So do I. I've given the rite two
> hundred times. It always took. Now I say the words over Joskin and the words just… fall on the
> floor. Whatever used to be on the other end to catch them — it isn't picking up."* He laughs, ugly.
> *"Pray for a good death here and see what answers. Nothing. That's what answers. Nothing at all."*

- **Insight (DC 12):** Harrow isn't faithless — he's *abandoned*, and it's breaking him. His anger
  is grief.
- Harrow is your **mouthpiece for the hook without naming it.** He can say *the deaths won't take*
  and *heaven stopped answering* — he cannot say *Death is sealed* or *a god is gone*, because he
  doesn't know that. Keep him at the symptom.

If a player pushes on *"so nothing can die?"*, Harrow is precise — and the precision is itself a
clue (canon §1a, the consent model: steel works; the wasting crawls):

> *"Oh, steel still works. Ask the border — the raids bury plenty. It's the* dying *that's broke,
> not the killing. Sorrel the tanner went in the spring — quick — rather than linger like Joskin
> does. That took."*

He doesn't say how Sorrel went, and he won't be drawn on it. Nobody in Withervale says.

**GM truth (ruling 2026-07-13):** Harrow is **not** the mercy-killer — that plot is cut. What
holds his hand is his faith: he keeps the Shepherd's rite (his and Withervale's name for the
Last Harvest — Morrath, the god who is *meant* to carry the dying home), and taking a life
outside it — doing by knife what the god should do by grace — is the one thing his faith forbids.
So he prays the rite that no longer lands, and he watches Joskin suffer, and it is *killing* him
that he may not act. Sorrel's quick end in the spring was not Harrow's doing — a neighbour's
mercy, or Sorrel's own; Harrow buried him and said the words and they fell on the floor like all
the rest. **Insight (DC 14)**, or pressing him in private, gets not a confession but the raw
thing underneath: he is terrified that if the Shepherd does not answer soon, he will stop being
able to tell his faith from his cowardice.

### If a player gives Joskin the knife (canon §1a: steel works — the wasting crawls)

Morrath's loss jams the *proper end*, not the killing: destruction still ends a body. So yes —
a blade finishes in a heartbeat what the plague would take seasons more to do. If a PC offers
and Joskin, in a lucid moment, says *yes* — let it happen. Three beats:

1. **It takes.** The bellows-breathing stops. The room's held breath lets go with it — and then
   catches again, because something *doesn't leave*. A Green or Black PC feels the passing start
   and then lodge, like a swallow with no throat beneath it. (GM truth, canon §1a: the soul
   *sticks* — drawn down the Black/Green pull toward the Altar downriver. Never explain it
   tonight.)
2. **Harrow comes.** He could not have done this himself — his faith will not let him raise the
   hand the Shepherd is meant to stay — but he does not stop a PC who can. When it's done he says
   the rite over the first death in months that took, voice ruined, and it half-lands: *"That's
   the first prayer that's touched anything since spring. Wherever it landed."* He doesn't thank
   them and he doesn't damn them — he envies them, and hates that he does.
3. **No punishment.** The table just made the campaign's question flesh — *what is death for?* —
   and answered it with mercy. Let it be heavy. Don't let it be wrong.

(The same ruling covers the cow — a quieter rehearsal of the same beat if the players test it
there first. They often will.)

### Gramma Ashmark and the Black Altar seed

If the players pull the *"has it always been like this?"* thread, **Gramma Mella Ashmark** gives
them the folklore — and points downriver at the finale.

> *"My gran told it and hers told her: there's a black stone in the river, south, where three lands
> meet. The Crossing. In bad years the water there runs the wrong way and the old folk wouldn't
> bury near it — said the ground down there don't *keep* the dead the way ground should."* She looks
> at the standing blight. *"Reckon the whole border's the Crossing now, don't you?"*

- This is a **seed, not a quest** — it plants the Black Altar (act-1 finale, 1449,2337) as the place
  where the wrongness is *worst* and oldest. Don't push them toward it tonight.

### Per-color leyline tug (build-agnostic — use only what the party brought)

- **Green:** the Root Network runs *under* Withervale and it's being bled — a physical wrongness,
  like a vein drawn thin. Strongest signal yet, and it points south/down the border.
- **Black:** entropy is *present but stuck* — decay that starts and cannot resolve. A Black PC feels
  the ambient "off switch" jammed.
- **Blue / White:** the pattern doesn't close. Cause without effect. A tidy mind finds it maddening.
- **Red:** everything here is *waiting* for a signal that never comes — the village holds its breath.
- Improvise the flavour ("your power flickers oddly near the shrine"); never explain the cause.

### Ending the session (read aloud)

End quiet. No fight, no reveal — just the wrongness, sat with.

> That night the convoy's grain goes to the granary and Withervale eats, for a while. The cow in
> the pen is still breathing when you bed down. It's still breathing at dawn. Somewhere in the
> third house, Joskin asks the dark again to let him go, and the dark, as ever, says nothing.
> Whatever is wrong with this land, it is not that people are dying. **It's that they can't.**

Cut to black. **Session 1 ends.**

---

## 5. Clue ledger — what tonight plants

| Clue | Where | Points toward |
|---|---|---|
| Alchemy *fakes* a working cycle; real fields failed | Elmsworth vats (Fenn) | The famine is a symptom, not a cause |
| The Root Network is being drained, southward | Green tug (Elmsworth + Withervale) | Verdannis's Green-drain (act-1 investigation; unnamed) |
| Raiders carry **Malcurr**-forged gear | Palewater Ford (tell / loot) | Malcurr funds Corvaine's raids → the Warlock (act-1 political thread) |
| Corvaine raids from *desperation*, not malice | Roek | The crisis is top-down; nobody here is the villain |
| **Nothing can properly die** | Withervale (all four wrong things) | THE HOOK — Morrath sealed (revealed only via Anaveth, later) |
| Heaven "stopped answering" the death-rite | Keeper Harrow | Same hook, theological angle — a god has gone silent |
| "Steel still kills — it's the *dying* that's broke" | Harrow (pressed); the raid's own dead | Precision for the mystery: this is not immortality — the thing that *catches* a natural ending has stopped |
| The **Black Altar Crossing**, where it's worst | Gramma Ashmark | Act-1 finale site (1449,2337) |

**Stays buried tonight:** the gods exist; Death/Morrath specifically; the Fetch; the whole
cosmology. Players should leave the table *unsettled and curious*, holding a mystery, not an
answer.

---

## 6. Where act 1 goes from here (GM sightlines — not tonight)

Per `EDHA_CAMPAIGN_OPENING.md` §3: following the **raiders' gear** pulls toward Malcurr and the
Warlock; following the **blight/drain** pulls toward the drained Root Network; both teach *the
crisis is top-down*. The act-1 finale is the **Black Altar Crossing**, where the divine layer
becomes undeniable — and the first god the party can actually reach is **Anaveth** (via Goldenport's
inexplicable prosperity → the healer **Serene**), who finally gives the hook its name: *Death is
sealed; Life is drowning without it.* Tonight just has to make them *want* to ask why.

---

## 8. Player-facing text (safe to read or show — the only non-GM section)

*(Added 2026-07-13 to match `RUN_SHEET_TEMPLATE.md`; spoiler-checked against §0's
do-NOT-reveal list. There is no "previously on" — this is session 1; the campaign-start
version is below.)*

**Before the table — character creation:** hand out **`EDHA_PLAYER_PRIMER.md`** (the
player-safe nations/faiths/names guide). Any origin works with this session as written.

**Campaign opening (read or paraphrase before the cold open):**

> The last two years have been hard everywhere — blights that spread and never clear, sickness
> that lingers, raids across borders that used to be quiet. You've each washed up, by your own road, in
> Elmsworth: a river-port town in Thalendor's lake country where there's still work, because
> the Mage's relief has to move and nobody has hands to spare.

**Handout — the notice that brought you here (verbatim, post it or read it):**

> BY ORDER OF THE BORDER MARSHAL — ESCORTS WANTED. Three barges, Elmsworth to Withervale,
> twelve days on the water. Armed, able, or useful persons apply at the granary hall. Payment
> in provisions or passage papers, at the Marshal's discretion. The grain moves with or
> without you. — V. KHOR, Marshal of the Border

## 9. Battle-map briefs + Foundry hand-off

**Battle-map briefs for Ben's Procreate pass** (art lands at
`source-materials/maps/battle/<site-slug>.png` + a `battle_maps` gazetteer entry):

- **Palewater shallows** (⚑ not drawn): ~30×20 squares. Features: the deep channel snaking
  corner-to-corner; three barges strung single file along it; gravel bars (firm, half-cover at
  the sunken edges); knee-deep braided shallows everywhere else (difficult terrain); willow
  scrub on the Corvaine bank. Design goal: *defend three slow-moving barges strung through a
  kill-box.* (Full terrain semantics: §3.)
- **Withervale** (⚑ not drawn): no combat expected — a village flavor map is enough. Features:
  the river-stage, the standing black-blighted fields, the cow-pen, the third house, the
  shrine with the black-and-green threshold. (Brief also in the opening doc §2.)

**Foundry hand-off (the bench list):**

- ⚑ **Optional — `data/adversaries.json` entries** for Corvaine Raider (minion) + Sgt. Roek
  (rival), statted in §3 on the schema already: add only if Ben wants droppable tokens rather
  than run-by-hand. That is a DATA change → **pack rebuild + ⟳ Sync** (Ben-only). Nothing in
  this session needs an engine change; running the fight by hand needs **no rebuild at all**.
- Scenes/journals: none required — this sheet is the journal.

## 10. ⚑ Open for Ben

1. **NPC names** — Roek, Ashmark, Joskin, and Sorrel the tanner are still placeholders (Fenn,
   Wick, Harrow, and Vareth Khor are now confirmed).
2. **Statblock feel** — Roek + 3 Raiders tuned for a bruising-not-lethal tier-1 first fight; say if
   your table wants it harder. (Foundry entries: §9.)
3. **Map art** — see the briefs in §9; flag if you want those generated next.

*Settled 2026-07-12 (Ben's second review; canon §9 rulings 18–20 after the 07-13 merge
renumbering):* death mechanics (convergent with ruling 9's consent model), on-screen
lingering-dying scale (ones and twos), and the raid context (shallows boarding at the raiders'
ford). *Settled 2026-07-13 (rulings 21–23):* the journey at true scale AND true meander — sites
snapped onto the traced channel, **1,339 km / ~12 days** at barge_down 110 km/day; the border
river is **the Palewater**. *Settled 2026-07-13 (Thalendor pass, ruling 25):* the site names
(Elmsworth / Withervale / Palewater / Palewater Ford / Heartholt) and the Thalendor NPC names
(Fenn / Wick / Harrow) are **confirmed**; the **Harrow mercy-killing plot is CUT** (he keeps the
Shepherd's rite and will not raise the hand it forbids — §4); the **"giving back" scene beat is
CUT** (the continental custom survives in canon §5b, just not as a Withervale set-piece); the
famine **severity numbers are set** (15% blight / 50% drain sprout-fail / ~42.5% Thalendor yield)
and the **field imagery** fixed to thin-plus-blighted.
