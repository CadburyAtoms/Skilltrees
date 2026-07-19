# Worldbuilding TODOs — culture, faith, ecology (from Ben, 2026-07-13)

Ben's three expansion fronts for the campaign world, broken into session-sized items.
This is the **worldbuilding backlog**, sibling to `TODO_REPO_HYGIENE.md` — check items off
here with a date + PR when they land.

**How to work this file:**

- **Docs-first.** The deliverable for almost every item is new canon prose — new sections in
  `EDHA_CAMPAIGN_CANON.md` (the single source of truth), not engine or data work. Anything
  that later becomes *fightable* flows into the playtest-adversary pack as a separate,
  downstream task (pack rebuild + ⟳ Sync at that point, per iron rule 1).
- **Stay inside established canon.** The leyline field model (canon §1, ruling 11), the
  worship-feeds-gods rule (ruling 12), and the broken-cycle ground truth (§1a) are load-bearing
  constraints — every culture, rite, and creature should be *downstream* of them, so the world
  keeps feeling like one system.
- **⚑ = needs a Ben ruling BEFORE writing — full stop.** Walk the ⚑ questions with Ben **in
  order, by section** (lore-forge Phase 3, 2026-07-14): one section's ideas at a time, invented
  content shown in **full text** one item at a time (never a compressed picker label), Ben
  approves the batch, then move on — and **approval precedes every commit**, bookkeeping
  included. Do NOT write "provisional" versions of ⚑ items — a provisional flag is not
  approval (2026-07-13: a session wrote W7's cult doctrine and shipped all of section A to a
  PR with the menu delivered *after*; it cost a review cycle. 2026-07-14: a monolithic
  everything-menu was "too detailed for a picker" and scaffolding was committed unapproved).

---

## A. Culture by country — rituals, quirks, differentiators

**Goal:** each of the nine nations gets a short culture block (proposed home: canon doc
**§5b**, one subsection per nation) — a couple of unique rituals, everyday quirks, and the
one-sentence "how you know you're in X" differentiator. Culture should be *explainable* by the
nation's geography (§5a), government, religion status, and crisis status — not decoration.

> **✔ Section A landed 2026-07-13 (PR #78): canon §5b (all ten blocks + W10 connective
> tissue) + the player-safe `EDHA_PLAYER_PRIMER.md` for character creation.** Terrain follows
> **§5a ground truth**, which corrected three descriptors below that predated the map: Malcurr
> is NE (upland) lake country not mountains (⚑ synthesis in §5b/§10 reconciles the script's
> "mountain-forge" stamps), Corvaine is mid-east riverlands not lake-country, and the mesa
> badlands are **Ashkar's**, not Vorsk's (Vorsk = NW mountains — affects W18's siting, noted
> there). New ⚑ for Ben from this pass: the Lunavar "Lantern" doctrine (W7), the Malcurr
> terrain synthesis, Lunavar naming style — all in canon §10.

- [x] **W1 — Kettavar** (tundra tribes, Chaos, stable). The core paradox to dramatize: a
      generations-stable society whose god is the Unmaker. Seeds: omen-reading as civic
      practice (the Chaos tree's signature resource IS the Omen); rites of deliberate
      inversion/disruption that *vent* chaos so life stays stable; how Miravel's
      rites-in-form-only look from the pews. GM layer: this stability is the Fetch's granary —
      culture should read warm from inside, sinister from GM view.
- [x] **W2 — Malcurr** (mountain dictatorship, Knowledge, plague). The hospice nation (§1a):
      customs around warehouses of the not-quite-dead — who tends them, what a "death vigil"
      means when death takes years. Experiential-knowledge faith quirks (scars as credentials,
      lessons that must be *lived* to count). The Warlock's cult of personality.
- [x] **W3 — Corvaine** (lake-country monarchy, no god, plague). Child-king pageantry vs.
      regent reality — court ritual as theater over a hollow center. Raid culture framed as
      duty/shame, not banditry (desperation, Malcurr's funding). Black Altar border folklore
      (Theron Ashmark's grandmother's stories — write down what the border villages actually
      say/do about the Crossing).
- [x] **W4 — Thalendor** (forest mage-utopia, Verdannis's most devout, famine). Vat-food
      culture: what alchemical bread does to mealtime ritual, and the status divide between
      vat-fed and field-fed. Sovereignty worship in practice (oaths of station? crowning
      rites for harvests that no longer come?). Root Network reverence — and the heresy
      brewing when the devout nation starves worst.
- [x] **W5 — Goldenport** (guild oligarchy, no god, prosperous). Contract-and-charter ritual
      life; "the Port's luck" — a folk superstition standing in for the Anaveth overflow
      nobody knows about (§3). Prosperity guilt or prosperity smugness? How locals explain
      thriving while neighbors starve.
- [x] **W6 — Vorsk** (badlands warlord state, no god, war). Honor/scarcity culture around
      raiding — what's honorable to take, what isn't. Warband structure as the social unit.
      Optional seed: dead folk-memory of Razkael (his faithful receive nothing, ~120 years) —
      broken shrines nobody prays at, oaths that still invoke "the Flame" as a curse word.
- [x] **W7 — Lunavar** (theocracy of the Child of Prophecy, "moon cult" ⚑, famine). Night
      calendar, moon-phase rites, what prophecy means day-to-day under famine. ⚑ Blocks on the
      open thread (canon §8.4): *what is the moon* — culture can be written around the mystery
      but the cult's actual practices need at least a provisional ruling.
      > **⚑ RESOLVED 2026-07-19 (rulings 64–66, Lunavar dive section 2):** the Lantern
      > doctrine confirmed as written; GM truth ruled — the Moon is a facet of **Olvarra**
      > (the domain's worship feeds her; no Lunavite knows, hard line), the Child's readings
      > receive her weak signal, the Fetch jams the pools with counterfeit omens. The Child
      > of Prophecy is an office (ruling 65 — the Once-Children college).
- [x] **W8 — Canticle** (Bards Congress aristocracy, no god, prosperous). Law-as-performance:
      precedent that must be *sung/recited* to bind; status via citation and repertoire; the
      archive as sacred-secular institution. GM layer: their customs are why the
      pre-infiltration Chaos theology survived — make preservation-without-understanding a
      cultural trait.
- [x] **W9 — Sylvaneth** (Fae utopia, Immortal Triplets, peace). Surface culture only here —
      what visitors/traders actually see; exile customs (they exiled Ashara for *what she is*,
      §6 — pattern-integrity as a cultural value). The deep "what are the Fae" work is **W20**;
      write W9 after or alongside it.
- [x] **W10 — Cross-cutting connective tissue.** One pass after (or while) W1–W9: naming
      conventions per nation, one shared continental custom (so Thyrcross feels like one
      continent), border-culture blending at the flashpoints we'll actually play (Thalendor/
      Corvaine, Vorsk/Lunavar), and how each nation's *quirk* can surface at the table in one
      scene (checklist for the GM, not an essay).

---

## B. Religion — the gods are real; the faithful need something to do

**Goal:** worship is literally power (ruling 12 — a faith network *feeds* its god), so faith
practice is infrastructure, not flavor. Define what the faithful of each god actually DO, and
what they get back. Proposed home: canon doc **§3a** ("Lived faith") or per-god additions
to §3.

- [ ] **W11 — Rites & practice per god (all ten).** For each: core rite, holy days/cadence,
      clergy shape, what an offering is, and what a layperson's daily observance looks like.
      Constraint: rites should make sense as *feeding mechanisms* — sustained attention and
      devotion, not just ceremony. Include the four broken cases explicitly: Morrath's faithful
      (rites into silence — funerary rites that no longer *work*, §1a), Razkael's severed
      remnant, Gnothis's ambiguous line (the Warlock gets answers — from what?), and Chaos
      under the Fetch (rites never worked *better* — that's the trap).
      > **Morrath's block landed 2026-07-14 (rulings 44–48): canon §3a "Lived faith"** — the
      > section frame (rites as attention; one god per pass) + her full block: the Passing,
      > the Giving-Back, the Standing Sheaf, the Keepers (the continent's death-registrars —
      > grounds ruling 42's parish bells as shrine bells), offerings + the name at the lamp,
      > and the broken case (the harvest-by-hand whisper; the rolls as seal forensics).
      > Primer mirror added ("The quiet faith"). **Ruling 45's general principle governs all
      > future blocks: rites petition and attune, never gate.** Nine gods remain, one per
      > pass; Razkael's dead-line texture also landed (ruling 47), so his eventual block
      > starts half-written.
      > **Olvarra's slot is now substantially covered by the Lunavar pass (2026-07-19,
      > rulings 64–66):** her only living worship is Lunavar's Lantern cult — rites, clergy
      > shape (the Child + Once-Children), offerings, daily observance, and the broken/jammed
      > line all live in canon §5b/§5c/§3. Her W11 turn is a light consolidation (a §3a-style
      > block cross-referencing the Lunavar material + her answered-prayer palette per W13),
      > not a fresh build. Constraint that governs it: no Lunavite knows whom they feed
      > (ruling 64's hard line).
- [ ] **W12 — Sacred geography.** A deity = two leylines converged (ruling 12), so where do
      you build a temple? Proposal to develop: shrines sit on matching pair-typed nexuses or
      single-frequency ridges; a god's "high temple" sits on its pair's strongest known
      co-peak. Reconcile with: the silent Last Harvest shrine in Withervale
      (`EDHA_CAMPAIGN_OPENING.md`), the Black Altar (a Black/Green nexus — was it Morrath's
      holy site before it was a soul-pool? feeds open thread §8.8), and Goldenport's Life
      nexus (why no established Anaveth church there — yet?).
      > **General rule ratified 2026-07-14 (ruling 44):** worship reaches from anywhere (field
      > model); nexus-siting buys presence — high temples on pair co-peaks. **Morrath slice
      > done:** the Black Altar was never hers to build on (ruling 46 — "a door, not a house";
      > §8.8 untouched), and the Withervale shrine needs no nexus (ordinary shrines sit where
      > the faithful are; Morrath has NO high temple by doctrine). **Still open:** Goldenport's
      > missing Anaveth church (her pass), and each living god's high-temple site as its block
      > lands.
- [ ] **W13 — What answered prayer feels like (table-facing sensory canon).** A short,
      playable palette per god: what you feel when the god answers, when it ignores you, and
      when the line is *dead* (Morrath, Razkael) vs. *wrong* (Chaos — smooth, purposeful, "a
      river that only flows one direction", §2). This is investigation material: PCs should be
      able to *notice* the difference. Kashen Duskhand's "doesn't feel like Gnothis anymore"
      (§7) is the template beat.
      > **First two entries landed 2026-07-14 (ruling 47):** sealed (Morrath) = a knock on a
      > shut door of a house that isn't empty — weight, no answer; banished (Razkael) = open
      > sky, no door at all. Investigable — old keepers can articulate it, and it proves
      > sealed ≠ gone. Chaos's wrong line was already canon (§2). Remaining: the living gods'
      > answered-prayer palettes, one per W11 block.
- [ ] **W14 ⚑ — Does faith do anything mechanically?** Design question for Ben, options
      sketched not decided: (a) nothing — the deity talent trees ARE the mechanical expression
      of devotion, everything else is fiction (cheapest, arguably already true since talents
      work god-independently, §3 Morrath note); (b) light-touch — rites as downtime/recovery
      activities, omens/blessings as GM-granted advantage, no new engine surface; (c) real
      subsystem — devotion tracks/boons (engine work; per iron rule 2 this would be ONE
      generic handler at most, and only post-playtest-1). Recommended default: (b) as table
      practice, revisit after playtest.
- [ ] **W15 ⚑ — Is godlessness causal?** Canon §5 observes "nations without an established
      religion are suffering most." Ruling needed: does a fed god actually *shield* its
      nation (Kettavar's stability is by design — but that's the Fetch's design), or is it
      correlation (organized faith ≈ organized society)? The answer changes what conversion/
      revival subplots are worth to a nation — and whether the PCs can *fix* a country by
      restarting its church. Recommended default: partially causal — a fed god can spend power
      on its own faithful's lands, but it's triage (Anaveth/Goldenport is the existing model).
      > **New evidence in play (2026-07-19, rulings 64–66):** Lunavar is now a live data
      > point — a nation with a *fed* god (Olvarra, via domain-worship) that is nonetheless
      > famine-status. Consistent with "partially causal" only if a stripped god can't spend
      > what she's fed on her flock (she can barely signal, let alone shield) — which the
      > W15 ruling should say explicitly one way or the other when it lands. Also touches
      > W14: the Child's readings are the one live example of faith doing something
      > table-real (GM-truth information, not mechanics).
- [ ] **W16 — Faith on the ground in the opening arc.** Apply W11/W13 to the places session
      1–5 actually visits (Thalendor relief-convoy route, Withervale, the Black Altar
      Crossing): what the convoy's faithful do at dusk, what the silent shrine ritual *was*,
      what Corvaine's godless soldiers swear by. Small item; do it right after W11 so the
      opening doc gets the payoff.
      > **Withervale piece answered 2026-07-14:** the silent shrine's rite is the Passing
      > (§3a); the session-1 script names it and gains the shrine-roll optional clue (the
      > two-year discontinuity, ruling 48) + a clue-ledger row. Note the name-at-the-lamp is
      > now table-ready dusk texture for ANY scene, convoy included. Remaining: convoy dusk
      > observances (Verdannis/Kethane blocks) and what Corvaine's godless soldiers swear by —
      > wait on those gods' W11 passes.

---

## C. Ecology — leylines permeate the world; the world should show it

**Goal:** the field model (ruling 11 — all five frequencies, everywhere, with local
concentration) applied to nature. Two purposes: (1) worldbuilding — flora/fauna that make
leyline strength *visible* on the landscape; (2) **gameplay — act-1 bestiary variety.** Until
the undead arrive (first breach = act-1 finale; acts 2–3 escalation), the adversary roster is
"magic people, constructs, and animals" — we need creatures to fight that aren't any of those.
Proposed home: canon doc **§5c** ("Ecology of the leylines"); adversary statblocks are
downstream items in the playtest-adversary pack.

- [x] **W17 — The attunement framework (write first).** One page of rules-of-thumb: what
      "leyline-attuned fauna/flora" means (creatures that concentrate/metabolize one
      frequency), why they cluster on ridges and nexuses, how attunement shows (coloration,
      behavior, minor Investiture effects — NOT spellcasting), and what happens to an attuned
      creature when its local concentration shifts (this is the plot hook: Verdannis's Green
      drain and the Black/Green soul-pools are *currently shifting* concentrations — displaced
      and wrong-behaving creatures are the natural act-1 encounter generator).
      > **✔ Landed 2026-07-14 (ecology-pass section 1, Ben-approved with the recommended
      > dials): canon §5c + ruling 31 + a player-safe primer paragraph.** Dials as ruled:
      > uncommon-but-known, hereditary lineage, faintly Investiture-detectable (clue-bearing
      > wildlife). The pass continues Thalendor → Corvaine (W19, W21-Blue/Black re-sited to
      > riverlands, W22) with W23's Thalendor/Corvaine slice as the downstream payoff.
- [ ] **W18 — Red: the "dragons" (Ben's seed).** Red-attuned lizard-kin, dragon-shaped enough
      to earn the folk name, explicitly NOT mythic true dragons. Sketch: size range (dog → 
      horse?), heat/ferocity expression of Red, pack vs. solitary, where (Red ridge through
      Vorsk's badlands/mesa country fits the map and gives Vorsk a cultural relationship with
      them — mounts? hunts? heraldry? ties into W6). ⚑ name them (folk name + naturalist
      name). Downstream: 2–3 adversary statblocks (whelp / adult / alpha) for the pack.
      > **Siting resolved 2026-07-14 (ruling 35):** the seed's "Vorsk's badlands/mesa
      > country" predated the map — the mesas are **Ashkar's**. Ruled: BOTH are Red country
      > with different co-frequencies — **Vorsk's NW ranges = Red/Black (Tyrith's pair)**,
      > **Ashkar's mesas = Red/Blue (Razkael's pair, his banishment-home)** — so the dragons
      > live in both, with different environmental character and likely **regional variants**
      > (R/B vs R/U expressions) to design when this item runs. Names still ⚑.
- [x] **W19 — Green: the moving plants (Ben's seed).** Green-attuned motile, semi-sapient
      flora — Thalendor's Root Network as their heartland. The famine twist writes their story
      arc for free: layer-1 blight (fields locked in disease that never clears, §1a ruling 24)
      plus the Green drain means
      wrong, starving, *stuck* plant-life — normally-peaceful groves turning aggressive is a
      Thalendor encounter that IS the plot. ⚑ sapience level (animal-smart? village-minded?
      negotiable-with?) — affects whether they're combat, diplomacy, or both. Downstream:
      statblocks (creeper / grove-warden / blight-maddened variant).
      > **✔ Landed 2026-07-14 (ecology-pass section 2, Ben-approved with defaults): canon §5c
      > + ruling 32 + primer sentence.** Names: **rootling / grove-heart / "gone to briar"**
      > (kind: the Errant Green; "grove-warden" tier dropped — collides with §5b's human
      > station). Sapience ruled **village-minded**; rootlings DO raid stores/seed corn.
      > Statblock tiers for W23: rootling swarm · grove-heart (diplomacy-scale) · briar-gone
      > grove (the fight).
- [ ] **W20 ⚑ — The Fae (Ben: "fae country implies fae, we need to hammer that out").**
      The big one. Questions to batch for Ben: what IS a fae under this cosmology (proposal to
      react to: creatures native to the *weave* — they perceive threads/pattern directly,
      which is why an unwoven Ashara is a walking hole to them and why they exiled her, §6,
      and why the Triplets already understand the broken cycle, §8.5); are fae born or made;
      mortality — do fae souls return like mortal souls, or are they outside the circuit
      entirely (interacts hard with §1a); the Immortal Triplets' nature; fae outside Sylvaneth
      (solitary fae in deep-leyline places on the mainland?); playable/fightable/neither.
      Output: canon section + resolves how W9 gets written.
- [x] **W21 — Blue / White / Black attuned wildlife (fill the palette).** One signature
      creature concept per remaining frequency so all five read on the landscape. Seeds to
      develop or replace: **Black** — carrion-adjacent fauna that sense stuck souls and are
      *gathering* at Black/Green nexuses in unprecedented numbers (act-1 foreshadowing the
      players can track: the animals knew first); **Blue** — mirror-still lake/mist creatures
      around Corvaine's lake country (illusion/foresight expression — heard wrong, seen
      double); **White** — plains herd or hive fauna with uncanny coordination (**Corvaine's
      river-plains** — re-sited by ruling 36; the old "Kettavar tundra" seed predated the
      god-pair pattern, and Kettavar's ground is Maelith's Black/Blue). Each needs the same
      one-paragraph treatment as W18/W19; pick 1–2 to also get statblocks, the rest stay
      scenery.
      > **✔ Black + Blue landed 2026-07-14 (ecology-pass section 3, Ben-approved with
      > defaults): canon §5c + ruling 33 + primer Corvaine sentence.** **Tollbirds**
      > (vigilcrows) — the gathering at the Crossing is a readable pool clock-face;
      > pool-maddened flocks = the W23 swarm block. **Mistherons** (the Gray Seeming) —
      > fish-wasting starvation makes them barge-stalkers (rarely man-taking, fog only,
      > new); W23 fog-lurker block. Both re-sited to §5a riverlands (the "lake country"
      > wording predated the map — lakes are Malcurr's). **White landed 2026-07-14
      > (session-1 review, rulings 36–37): re-sited to Corvaine's plains** — Kettavar's
      > future pass gets Black/Blue tundra expressions instead (Maelith's pair) — **and the
      > skeindeer** (the Concord) approved: hundred-strong herds that move as one body, the
      > shared startle, and "widow-dancing" near the Crossing as the White gradient clue.
      > W21 closed.
- [x] **W22 — Ecology of the broken cycle.** What two years of sealed Death has done to
      nature (§1a applied to fauna/flora): sick livestock and wild animals lingering without
      recovering or dying, murrains and animal epidemics that never burn out (§1a ruling 24 —
      the same un-clearing disease that drives the crop famine), predator packs starving amid
      uneatable stuck-prey, unrotting deadfall changing the forests. Output: a column of cheap,
      thematic act-1 encounters (starving wrong-behaving beasts) that foreshadow the undead
      without using them, plus sensory detail for travel scenes.
      > **✔ Landed 2026-07-14 (ecology-pass section 4, Ben-approved whole): canon §5c W22
      > block + ruling 34.** Two mechanism corrections en route: the **smell** of the broken
      > cycle is present-and-awful (sickroom, never clears — supersedes "should reek and
      > doesn't" in §1a AND the session-1 Withervale beat, both fixed), and "unrotting
      > deadfall" became **trees that won't finish dying** (what truly dies rots normally).
      > **Murrain transmission by eating ruled YES** → the predator's fork. Column: bold
      > pack · wasting-eater · pain-mad ox · the standing gray · sensory list. Design rule:
      > wasting animals are never tougher — steel works. Malcurr lamp-oil grace note taken.
- [ ] **W23 — Act-1 bestiary assembly (downstream; after W17–W22 have rulings).** Turn the
      ecology canon into the playtest-adversary pack: pick the roster (dragons, moving
      plants, 1–2 of the W21 creatures, W22 variants of standard animals), build statblocks,
      wire any new mechanics through existing engine primitives (grep `ENGINE_INDEX.md`
      first — most of this should be plain adversary abilities, not new engine surface).
      **Pack rebuild + ⟳ Sync** when it lands; flag ⚑ bench rows. This item is the
      gameplay payoff of section C — don't start it before the ⚑ rulings in W18–W21.
      > **Thalendor/Corvaine slice APPROVED 2026-07-14 (ecology-pass section 5) and PARKED
      > for its own dedicated session** (one pack rebuild, not two — W18 dragons still
      > unruled). **NOT OPTIONAL (Ben 2026-07-14): this is a devoted tooling round.** The
      > path *script statblock → `data/adversaries.json` → foundry-build → working Actor
      > with functioning talents* must come out clear and functional — it will be used for
      > every session. Delivery contract: Ben says "get the session-one adversaries set up
      > in Foundry" → the deliverable is "deploy and refresh, the edha adversary actor
      > folder is ready" → Ben tests. The session-1 humans (Corvaine Raider, Line-Caller,
      > Sgt. Roek) and the mistheron are the first batch alongside the creature roster.
      > Approved roster (six blocks, all under ruling 34's never-tougher
      > rule): **rootling** (swarm) · **grove-heart** (terrain-scale, diplomacy-first) ·
      > **briar-gone grove** (boss + standing-gray terrain) · **tollbird flock** (swarm +
      > pool-maddened variant) · **mistheron** (fog-lurker; the seeming as a named
      > misdirection ability) · **W22 variant column** (bold pack / wasting-eater with
      > transmission rider / pain-mad ox — weaker, desperate reskins). **Ben's two build
      > requirements, both verified feasible:** (1) a per-adversary **art-asset wishlist**
      > (portrait + token per creature; core-icon placeholders until Ben drops files into
      > his Foundry data — ⚑ bench step); (2) creatures grouped in their **own Actor folder**
      > in the `edha-adversaries` pack (small per-entry `folder` field addition to
      > `foundry-build.js`, which currently hardcodes the single "Playtest Adversaries"
      > folder at line ~930); (3) **adversaries get functioning actions/talents like PCs**
      > (Ben 2026-07-14, session-1 review): attuned adversaries draw theme-fit talents
      > straight from the trees with **no prereq requirements** (e.g. the mistheron's Seeming
      > IS Blue's Phantom Double, run as a natural always-on self-trick), and bespoke
      > abilities not available to players are fine where the theme needs them — reuse
      > first, don't reinvent the wheel. First worked example: the mistheron block in
      > `EDHA_SESSION_1_SCRIPT.md` §3b. (Roster addition 2026-07-14: **skein herd** —
      > hazard/terrain-scale block, not a fight — ruling 37.) **Investiture tiers (ruling
      > 39, Ben):** minions ~1 invested in 8 (one leyline, 1–2 talents, force-multipliers);
      > **rival tier and above always invested** (one leyline, several talents); **bosses
      > unique, TWO leylines, deep pulls from both color trees** — the pair's deity tree
      > only when the boss is devout to that god. Human worked examples: the session-1
      > Corvaine Line-Caller (minion, White: Guiding Signal + Ordered Advance) and Sgt.
      > Roek (rival, White).
      >
      > **TOOLING ROUND LANDED 2026-07-14 (repo-side; Ben's bench pass pending).** The pipeline
      > *script statblock → `data/adversaries.json` → `foundry-build adversaries` → Actor with
      > working talents* is built and smoke-tested: `folder`/`leylines`/`skills`/`talents`
      > schema fields, verbatim tree-talent embeds (hard error on bad refs), role-default
      > leyline ranks (**ruling 40**: minion 1 / rival 2 / boss 3; humans run talents AS
      > WRITTEN, beasts get niche adaptations), art auto-detect + `EDHA_ADVERSARY_ART_WISHLIST.md`
      > (hand-drawn briefs), CI validation, deploy-bat coverage. **First batch shipped:** Corvaine
      > Raider · Line-Caller (real Guiding Signal + Ordered Advance embeds — the talents cost
      > 1 Investiture each as written, so the script's old foc-based adaptation was synced) ·
      > Sgt. Roek · Mistheron. Bench: the "W23 adversary pipeline" checklist section — the
      > Line-Caller is the talents-on-adversaries pipe-cleaner. **Still open in W23:** the
      > creature roster blocks (rootling swarm · grove-heart · briar-gone grove · tollbird
      > flock · W22 variants · skein herd) — statted one at a time with Ben's approval per
      > block; terrain-scale entries are per-session exceptions (ruling 40), designed with
      > Ben before building, possibly not Actors at all. Dragons still wait on W18.
      > **Lunavar slice added 2026-07-19 (ruling 69):** drownlight colony (lure/hazard
      > swarm) · reedling (minion/swarm) · gone-to-weir fen-heart (the fight) · stillback
      > (rival) + wasting-eater variant; stitchbirds scenery-only by design; healthy
      > fen-heart terrain-scale exception. **Five blocks approved at the statblock gate and
      > committed 2026-07-19 (pack rebuild + ⟳ Sync pending, bench rows added).** Added
      > same day: **the noonwing** (ruling 70 — the diurnal apex that made Lunavar
      > nocturnal; Ben picked concept A of three); its rival-tier block passed the
      > statblock gate and is committed — six Lunavar Fens blocks total, one pending
      > rebuild covers everything.

### D. Demographics — land budget → population (one nation per session)

- [ ] **W24 — Per-nation land budget + population** (method: canon ruling 26; `lore-forge`
      Phase 4b). Thalendor is **done** (~142k km² raw / ~163k effective farmland, 80/km² →
      ~13.1M, ⚑ fisheries uncounted). **Corvaine is done** (2026-07-14, rulings 28–30 +
      41–43: ~176k km² farmland → ~14.1M, calorically whole, institutionally drowning;
      full culture block, Aldercourt, the court, the Lesser Tolling — see the dive log
      below). **Lunavar is done** (2026-07-19, rulings 62–70 — see the dive log below; the
      rice-and-marsh model is the worked example of the margin invariant + composition
      dials). Six nations remain. Per-nation inheritances now on record: **Malcurr** walks
      into the marsh-larder fork (lake nation — does its lake food get an explicit term or
      stay set aside per ruling 27?) plus its standing terrain-synthesis ⚑ and the war-coin
      forge name (ruling 57); **Goldenport** inherits ruling 63's terminus (the Westward
      Green line pins at its capital's Life nexus the moment a capital marker is picked)
      plus W12's missing-Anaveth-church question; **Kettavar** owes its Black/Blue tundra
      ecology expressions (ruling 36) — the ecology slice is now a standard part of every
      nation pass (lore-forge Phase 4b note, Ben 2026-07-19). For each remaining nation:
      measure area + water off the
      gazetteer, set the cleared-fraction / yield-modifier / carrying-capacity dials (GATED
      design questions — propose, wait), write the `land_budget` block, derive the population.
      **One nation per session** — the depth (culture + land + population + sweep) does not
      batch. ~~Open cross-cutting ruling that gates the water-rich nations: **aquatic food**~~
      — resolved by ruling 27 (fish calories set aside; environmental wasting canon).

      > **Corvaine dive, sections 1–2 (2026-07-14) — answered by Ben (screenshot); section 3
      > ran one item at a time per the Phase-3 mode.** Measured: 776,376 km²,
      > 9.1% water (`scripts/map/water_frac.py`, Thalendor-calibrated). Ben's answers:
      > **cleared 25% → ~14.1M** (no leyline yield bonus; 80/km²); **the old king won't finish
      > dying** (tolled dead-in-law, breathing in a sealed wing — the regency rests on the
      > fiction); **Malcurr's coin = procurement + leverage, AND the deep-lore layer: this is
      > the beginning of the MORTAL side of Tyrith's power-grab from Verdannis** (Ben: soften
      > the hard-coded "leave it vague" instinct on thread 1). **Batch 1 APPROVED and committed
      > 2026-07-14: rulings 28–30 (canon §9) + the full gazetteer `land_budget`.** The Warlock
      > sub-fork took the recommended default (doesn't knowingly serve Tyrith — ⚑ flip freely,
      > flagged in ruling 30).
      >
      > **✔ CORVAINE COMPLETE 2026-07-14 (section 3 walked one item at a time, section 4
      > shown whole and approved; rulings 41–43).** The full-depth pass — culture + land
      > budget + population + capital + court + dependent sweep — is done; §5b Corvaine is
      > the second reference-shape block (after Thalendor).
      >
      > - [x] 1. **The Tolling** — approved verbatim and written into §5b (2026-07-14): the
      >   dead-in-law rite, the Quiet Wing, the mourning-ribbon etiquette. ("His queen"
      >   upgraded to "the Queen Dowager" when item 5 landed.)
      > - [x] 2. **Plague-wells** — approved after a logistics correction (the warden is a
      >   one-way valve protecting the CLEAN well; boiling protects only the drinker): §5b
      >   "Plague-wells and the painted line" — yellow gear, the warden's pour, fired water,
      >   firewood scarcity, "no painted line has ever moved back," *past the paint*.
      > - [x] 3. **Hospice math** — ruling 41: net ~3%/yr wasting accrual → ~850k stuck-dying
      >   (one household in four), ~210k FTE of care labor, the compounding hospice bill; the
      >   crown chose the wells over the army. Generalizes; Malcurr sets its number at its
      >   pass.
      > - [x] 4. **Capital pick + name** — ruling 43: **Aldercourt** = city-18 (1778,1601),
      >   the east-coast river-mouth port (gazetteer site + city name, labeled map
      >   re-rendered, lint clean).
      > - [x] 5. **Court names** — ruling 43: Child King **Cassien II**; regency of three
      >   seats (Lord Chancellor / Marshal-Regent / Queen Dowager).
      > - [x] Section 4 — assembled prose approved and committed: §5b intro gains the capital
      >   + population parenthetical, GM layer gains the ruling-30 Tyrith truth; primer
      >   updated (wells, the Lesser Tolling, and the whisper carried AS a whisper —
      >   supersedes the old "primer unchanged" note); naming table + one-scene checklist
      >   rows; §5/§5a/§10 aligned; full dependent sweep run.
      > - [x] The dead-in-law ⚑ — **RULED (Ben 2026-07-14, ruling 42): it spreads.** The true
      >   rumor that the king breathes leaked the instrument; parishes toll commoners
      >   dead-in-law (**the Lesser Tolling**, §5b); the crown can't prosecute without putting
      >   the first Tolling on trial. Still ⚑ open: does the Warlock knowingly serve Tyrith
      >   (ruling 30 — default no).
      >
      > **Lunavar dive IN PROGRESS (2026-07-19) — section 1 (land-budget dials) APPROVED and
      > committed (rulings 62–63 + the gazetteer `land_budget`).** Measured: 590,112 km²,
      > 2.4% drawn water (the marsh is terrain art, unmeasurable — lives in the dials). Ben's
      > rulings: the **rice-and-marsh model** (paddy staple at 4.0M kcal/ha; cleared 6% —
      > paddy is *built* land; 0.08 LU/person; marsh = one-third of diet — the Lunavar-scoped
      > exception to ruling 27's fish set-aside) → **~12.2M normal-times**, third most
      > populous; and the **Westward Green line** (ruling 63 — Ben's derivation from
      > Goldenport's Life nexus; geometry-verified through southern Lunavar; drain
      > continent-wide, Lunavar's mark = the failed ×1.25 bonus; control case survives in
      > kind, precision edits applied to §1a/§3/§5b/§5c). **Section 2 (GM-truth forks)
      > APPROVED and committed 2026-07-19 (rulings 64–67):** the Moon is a facet of Olvarra
      > (W7 resolved — in-world unknowability is a hard line), the Child of Prophecy office +
      > Once-Children college, the jammed channel (Fetch counterfeit omens; the seal-night
      > grief reading; the annals forensic), the Iron Congregation cracking the Taking-law
      > (early, a clock not a state). **Remaining, gated:** section 3
      > (culture items one at a time — cult name + demonym, capital pick from the 4 markers,
      > naming confirm + first NPCs, moon-pool/quarantine convergence, marsh burial, temple
      > granary/rice texture), section 4 (assembled prose + primer + sweep).
      >
      > **Malcurr dive IN PROGRESS (2026-07-19) — section 1 (land-budget dials + terrain +
      > hospice dial) APPROVED and committed (rulings 71–72 + the gazetteer `land_budget`).**
      > Measured: 1,089,432 km² (the largest nation), 8.5% water (the tree-of-lakes is real
      > drawn blue), east coastline, borders Kettavar/Vorsk/Corvaine. Ben's rulings: the
      > **cold-upland model** (cleared 10%; hardy grains at 2.0M kcal/ha; default 0.26
      > LU/person, sheep-heavy in species mix) → **~6.4M normal-times**, fourth most
      > populous; **the lake-larder fork resolved DOWN** (ruling 27's set-aside stands —
      > thin glacial fisheries; the lakes are the nation's ROADS; the fishery closed by
      > distrust as texture, not a model term); terrain-synthesis ⚑ settled; **hospice dial
      > 4%/yr** (ruling 72 — ~510k stuck-dying, one household in three; Corvaine
      > domesticated the burden, Malcurr industrialized it — Lamp-tenders + still-houses
      > free the workforce, which is where the war-funding coin comes from). **Remaining,
      > gated:** section 2 (GM-truth forks — the war-coin forge, the still-house soul
      > question, the Lesser Tolling import clock, ground frequencies), section 3 (culture
      > items one at a time + capital/city names + naming + the Gnothis lived-faith slice),
      > section 3b (the lake-country bestiary), section 4 (assembled prose + primer +
      > cultures.json + sweep), then the Phase-4c statblock gate.
      >
      > **✔ LUNAVAR COMPLETE 2026-07-19 (rulings 62–69).** Section 3 approved whole (ruling
      > 68: Moonmere/city-23 + the Lantern's Glass, Fenholt/city-06, Temple of Still Water,
      > naming + Ysel/Meriv, the untouchable pools as quarantine, the Still Acre, the temple
      > granary). Section 3b — the marsh bestiary (ruling 69, the Kettavar-precedent ecology
      > slice): Black/Blue drownlights (pair-attunement framework extension), White
      > stitchbirds (scenery by design), Green fen-hearts/reedlings ("gone to weir"), the
      > rival-tier stillback; mistheron range extended. Section 4 assembled prose approved:
      > §5b block, primer, cultures.json flavor sync (**data change — pack rebuild + ⟳ Sync
      > needed for the Lunavar culture item**). §5b Lunavar is the third reference-shape
      > block. **Statblock gate OPEN:** per the new process rule (lore-forge Phase 4c) the
      > bestiary's adversary blocks (drownlight colony · reedling swarm · gone-to-weir
      > fen-heart · stillback + wasting-eater variant) are proposed and awaiting Ben's
      > stats review — approval of the STAT BLOCKS is the gate, not the animal ideas.

---

## D. Economy & material culture — money, equipment, the price of things

**Goal:** the campaign can hand players loot, pay, and a shopping scene without improvising the
entire economy at the table. Session 1 already leans on it (payment-in-food, the Malcurr-stamped
gear as THE act-1 clue) and character creation is imminent (starting gear is undefined in
`Character_Building_Rules.md`). Direction picked by Ben 2026-07-15: **full lore-forge pass
before any mechanical denomination** — no placeholder coin names anywhere until this lands.

- [x] **W25 — Currency & exchange — DONE 2026-07-18 (the W25 currency walk: six sections
      approved in order; canon §5d + rulings 54–59).** The Goldenport standard ("port coin"),
      mechanical **copper/silver/gold 1:10:100** with stroke/seal/charter as flavor names only
      (Ben: players shouldn't convert in their heads; sheet reads gold → silver → copper);
      per-nation money customs for all ten nations; famine pricing tracks the calorie deficit,
      not the label (ruling 56 — "payment is food" is Thalendor/Lunavar-local); the traceable
      Malcurr war-coin (ruling 57, incl. the Malcurri-PC-reads-forge-marks backstory hook);
      price anchors + exchange quotes (ruling 58); starting wealth + heroic-path kits keyed to
      key talents with the uniform ≤ 2-gold usable-weapon slot (ruling 59; full kits in the
      player primer). Downstream now unblocked: the **engine currency primitive** (handoff §9h —
      denominations named; registerCurrency wiring + 3 ⚑ bench questions recorded there), the
      run-sheet loot ledger + state doc §1a (re-denominated), and character-creation starting
      gear. Original scope, kept for reference: per-nation coinage
      (or the deliberate absence of it), what crosses borders (Goldenport's guild arteries and
      the Congress's arbitration fees are the natural anchors, §5b), how the famine nations
      actually price things (session 1's "payment is food, worth more than coin here" ruling is
      the seed — is that Verdanne-local or continent-wide?), Malcurr's war-funding coin as a
      *traceable* object (thread 1 runs on it: "ask who *pays* for matched armor on unpaid
      soldiers"), and **starting money/gear for character creation**. Every claim derived from
      named rulings per the lore-forge method; the famine/land-budget math (rulings 24–28) is
      load-bearing — prices must not contradict the calorie model. Downstream consumers waiting
      on this: the engine currency primitive (handoff §9h), the run-sheet loot & payment
      ledger's worth column (descriptive until then), state doc §1a re-denomination, and
      equipment pricing in any future shopping scene.
      **Foundry wiring is PROVEN ready (bench 07-17):** the equipment tab shows the system's
      Roshar "spheres" currency (Ben: "Edha will want to override that with another name"), and
      the 07-15 schema dump confirms a public `registerCurrency` API — once W25 names the
      denominations, the module registers the Edha currency in one call. Whether the spheres
      row can be hidden/replaced (vs. sitting alongside) is a bench question at wiring time.

---

## Suggested batching (not binding)

- **Ruling batch first:** W7 (moon), W14 (faith mechanics), W15 (godless causality), W18
  (dragon names + regional variants), W20 (fae nature) remain the open ruling gates — walked
  in order, by section, per the Phase-3 mode (the old "ONE proposals menu" wording predates
  the 2026-07-14 process change).
- **One nation's full-depth pass = one session** (Ben, 2026-07-13): culture block + land budget
  + population + dependent sweep is too much to batch. The old "~3 nations per session" plan is
  retired — the W1–W10 blocks that shipped that way were both too shallow and pushed before the
  gate. Build one nation properly, queue the rest.
- W17 before any other C item; W23 last.
