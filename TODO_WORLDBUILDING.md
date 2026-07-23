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

## ⚠ HOT — W26: Lunavar re-pass (gazetteer political boundaries WRONG)

- [x] **W26 — Redo the Lunavar lore pass on corrected borders — DONE 2026-07-19.** Ben's fix
      landed BIGGER than a map-file edit: he **repainted `Thycross.procreate` itself** (new
      2236×2976 canvas, one layer per nation). Closed across three passes, all same-day:
      the **re-registration pass** (gazetteer rebuilt from his layers, renders/picker/codex/
      dashboard regenerated, lint 0 errors), the **redraw rulings menu → rulings 81–85**
      (Goldenport coast intended, Fenholt swap, ghosts removed, river re-timed ~13 days on
      the corrected trace, ALL four land budgets re-derived), and the **lore-forge sweep →
      rulings 86–87** (Fenholt criterion-travel to (686,1311) unpainted; re-measures — marsh
      depth ~1,060 km, Westward line survives at 307 vs ruled ~300; the carrier coast:
      Goldenport §5b + Lunavar sea-gate + primer + both culture items). Still riding deploys,
      not this item: the pack rebuild for culture flavor (checklist rows) and Ben's paint
      pass for Fenholt (paint-overlay guide). Follow-ups queued as **W27 (Goldenport dive) +
      W28 (Canticle dive)** below.

- [x] **W27 — Goldenport full-depth pass (the carrier of the west, post-redraw) — DONE
      2026-07-20 across four gates (rulings 88–98); riding Ben's deploys, see below.**
      **Section 1 DONE 2026-07-19 (rulings 88–91):** the Luck fork resolved BIG — Verdannis's
      search radiates outward from the Black Altar (= Morrath's own nexus, 88); the Life
      nexus carries a natural Root-Network-class bonus, not yet reached by the front (89);
      the sea splits by blight exposure and only the Port's blue-water fleet can reach the
      clean half (90 — sea_diet_frac 0.25, the second ruling-27 exception); Anaveth is NOT
      yet shunting — the shunt's onset is the mid-act-1 event and the god-contact road (91,
      supersedes the §3 present-tense valve). Land budget landed in the gazetteer:
      **pop ~13.2M**, cleared 20%, ×1.075 nexus, deepest famine margin on the continent.
      **Section 2 DONE 2026-07-19 (rulings 92–96):** capital = city-24 Goldenport city
      (geometry-picked on the Westward line's coast run — pins the nexus and the front's
      destination); the Peace of the Ledger (93 — why Vorsk raids hungry Lunavar, not the
      rich coast: a raiding clan's ore is struck from the books; derives the rulings-67/68
      raid-front geography); the fish-for-rice double bind (94 — the hostage towns buy the
      Port's clean fish back at toll prices); the unwritten + the First Page (95 — refugee
      flow institutionalized); the Quiet Ledger (96 — the Luck's in-world forensic record,
      the act-1 countdown made traceable). Culture blocks + primer mirrored (Goldenport,
      Vorsk, Lunavar). **Section 3 prose DONE 2026-07-20 (ruling 97):** §5c gains the
      Goldenport coast bestiary — Garden Sow (Blue/Green apex on the nexus), keelshadow
      (Blue rival, the clean grounds), cinderbrock (Red standard, the northern beaches —
      Ben picked it over the flintram; the Red spur off Vorsk's ranges is now explicit
      geography), plus silverwakes / gannet-roads / dooryard harts / thin catch as named
      scenery+hazard. **Statblock gate CLOSED 2026-07-20 (ruling 98):** four blocks landed
      in data/adversaries.json (Garden Sow boss / Keelshadow rival / Cinderbrock rival /
      Cold-Fire variant) — Fire the Wrack on Pyre's hazard path + spread alias, Nexus-Fed
      on the new edha-regen handler; bench rows + art-wishlist batch 3 added. **W27 is
      DONE pending Ben's deploys:** bat + pack rebuild + ⟳ Sync Adversaries (checklist
      §Goldenport Coast Bestiary), the city-24 "Goldenport" lettering + Fenholt on the
      paint guide. Harbor-town chain NAMES (incl. offshore city-14) stay with the §10
      city-naming backlog.

- [x] **W28 — Canticle full-depth pass — DONE 2026-07-20 end to end (rulings 99–107,
      six gates in one day; the seventh nation of ten). Riding Ben's deploys: pack
      rebuild + ⟳ Sync Adversaries (bench section "Canticle Plains Bestiary"), paint
      pass (the Hush pan shape, Arcanta, Portavere lettering; optional: erase the stray
      waterhole), art batch (callthief / false-spring / dirgehound).**
      Original scope note: 1,483,502 km² (ruling 85 flipped the superlative from Malcurr) and no
      land budget: southeast plains/desert, the law-performed-aloud culture (§5b), water
      1.8% measured. Expect the margin-invariant fork (dry-plains staple + herd dial);
      size-vs-population is the design question — the biggest land should probably NOT be
      the biggest people, so the dials must say why (aridity, the singing plains, law-bound
      land tenure?). Ecology slice included; capital unpicked (**1 marker** — city-27, an
      east-coast sea port; the "2 markers" note was wrong, layers say one).
      **Section 1 DONE 2026-07-20 (rulings 99–101):** the land analysis measured Canticle
      as a **rim nation around a dead heart** (61% of land >100 km from any water; rim
      ~246k km²); the water fork went **Option B — the Salt Heart**, an endorheic seasonal
      salt pan at the dead heart (site `salt-heart-pan`, painted:false → paint guide), NO
      new perennial river; west border lake = **Ashkar's as drawn**, Canticle holds the
      east shore; the Palewater's **mouth reach traced** — full channel 3,322 km, mouth
      (1623, 1983) is **Corvaine-side** (city-22), Withervale→Black Altar re-anchored
      1,082 km ≈ 10 days. Aridity IS the size-vs-population answer, structurally.
      **Section 2 DONE 2026-07-20 (ruling 102):** dials approved as proposed — cleared
      6.5% national (= 40% of the rim), kcal 2.5M (the rim IS the watered land), crop-fed
      LU 0.26 + **`range_diet_frac` 0.20** (third set-aside exception: range herds feed a
      fifth of calories, ~1.28M-LU floor in the pan country) → **~8.0M** — the biggest
      land, the fifth people; famine cliff ~19.8%, §1a's "Canticle absorbs layer 1" now
      derived. `land_budget` block in the gazetteer.
      **Section 3 DONE 2026-07-20 (rulings 103–104), both forks as recommended:** the
      capital sits in the dry — Congress + Deep Stacks together on the inner rim at
      (1884, 2319), "the law lives where nothing rots," city-27 stays the sea-trade
      port (new unpainted site `canticle-capital` → paint guide); and the **Treaty of
      the Mouth** — the sung compact with Corvaine (they keep city-22 + tolls, Canticle
      holds free passage + the river arbitration seat, renewed as a joint seasonal
      duet; the desperate-crown GM seam is deliberate).
      **Section 4 DONE 2026-07-20 (ruling 105), approved with one amendment (capital =
      Arcanta, not Cantoria):** names — **Arcanta** (capital), **Portavere** (city-27,
      named → painted:false, on the paint guide), **the Hush** (the pan — the lawless
      unwitnessed ground), **Lake Vespera**, the **rainroads**; culture — the
      **way-witness**, the **call-lines**, the **First Pinch** + salt season. §5b block
      assembled at depth standard; primer mirrored (way-witness "you might be" slot);
      Malcurr primer superlative fixed (second-biggest, per ruling 85).
      **Section 5 concepts DONE 2026-07-20 (ruling 106), approved after Ben's ratio
      correction** (the attunement ledger ran Blue-heavy 2:1 / White one statted block —
      TWO STANDING RULES minted: count the ledger before proposing rosters; build bespoke
      actions as talent-tree KITS — both now in the lore-forge skill): §5c gains **the
      Hush basin bestiary** — ground read Red/Blue basin (ruling 35 bleeding east) +
      White rim plains + Black Altar corner; roster = callthieves (WHITE influence-duel
      kit), the False Spring (RED/BLUE held-oasis apex), dirgehounds (BLACK pack, attend
      the given herds), the given herds (famine arc, derived), saltstriders (mundane),
      salt-larks/skeindeer/tollbirds/flash-floods as scenery/reuse/terrain. **Remaining:
      the Phase-4c statblock gate** (blocks presented, Ben reviews numbers) — then W28
      closes. The western border tributary (joins at the confluence fork) stays
      untraced — queued for Thalendor/Ashkar passes.

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
      > **Gnothis's slot is now substantially covered by the Malcurr pass (2026-07-19,
      > ruling 79):** the Proving as the faith's central rite, the lesson-offering
      > ("witness this"), journeyman pilgrimage, the W13 palette entry (**the click** —
      > gone since the vanishing, which the faith itself cannot date), and the broken-case
      > texture (the Warlock's answered prayers preached as favor; what answers stays
      > §8.1-open). His W11 turn is a light consolidation like Olvarra's.
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
      > **Tessavain slice ruled 2026-07-20 (ruling 111, via the W29 balance pass): the Order
      > nexus (Blue/White) sits in Corvaine** — exact site still ⚑ open (Aldercourt region a
      > candidate only); the surecats (§5c) are the in-world survey that finds it. Pin the
      > site here when W12 resumes.
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
      > **Second data point (2026-07-22, ruling 141, the Kettavar dive):** Kettavar's
      > famous stability is now mechanically ruled — and it is NOT the fed-god-shield
      > model either: the Fetch steers the herds off murrain-ground through the omen
      > channel because Kettavar is its granary. A predator managing livestock, not a
      > god spending on its flock. Both live cases (Lunavar, Kettavar) now cut AGAINST
      > naive "fed god ⇒ shielded nation" causation — the W15 ruling, when it lands,
      > should account for both.
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
      > **Malcurr slice added 2026-07-19 (ruling 80):** wrongwake (Blue rival + wasting-eater
      > variant) · wake-eel shoal (Black colony hazard) · fellstag (Green rival — the Kit-2
      > terrain adaptations + Drive the Prey) · Sevenbrand construct-smith (Red/White rival,
      > Civilization-tree talents as written); hushwings + ferry-foxes scenery by design.
      > **Statblocks APPROVED at the gate and committed 2026-07-19** (Worry the Failing's
      > drag-under reworded concrete at Ben's flag; pack rebuild + ⟳ Sync pending — bench
      > section "Malcurr Lakes Bestiary + the Sevenbrand", art briefs added). The smith is
      > the first adversary embedding deity-tree talents.
      >
      > **✔ MALCURR COMPLETE 2026-07-19 (rulings 71–80).** Section 4 assembled prose
      > approved and committed: §5b Malcurr at reference depth (the fourth
      > reference-shape block), primer rewrite, cultures.json flavor sync (**data change —
      > same pending pack rebuild covers the culture item AND the five adversaries**),
      > naming-table + one-scene rows. Full-depth pass done end to end: land budget
      > (~6.4M, the cold-upland model), Kenmere + Brandmere, ten culture items, the
      > cultural-attunement framework minted en route (ruling 76 — continent-wide), the
      > Gnothis lived-faith slice, six-entry bestiary, five statted adversaries. Five
      > nations remain (Goldenport, Kettavar, Canticle, Sylvaneth/W20, Ashkar).
      > **BANKED adversary concepts (reuse before
      > reinventing):** tussock-sow (the Mirewright — mire-churning moor-boar), heathspinner
      > (the Patient Snare — moor-spider, root-fiber web), and Green talent kits "the Snare"
      > (Grasping Vines + Territorial Instinct) and "the Closing Arena" (Spreading Roots +
      > Apex Predator + Drive the Prey).

- [x] **W29 — The bestiary color-balance pass — DONE 2026-07-20 end to end (rulings
      108–113; sections 1–5 + the Phase-4c gate all approved).** Blocks statted and
      approved (+2d4 Momentum's Edge menu ruling); the ruling-113 **engine owner-scan
      widening** shipped with it (fixes the W28 Dirgehound Dread Presence, dead on
      adversary owners; 3 regression tests pinned). Deploy pending on Ben's machine:
      engine F5 + pack rebuild + ⟳ Sync Adversaries; bench section "W29 Balance-Pass
      Bestiary". **The second balance pass is queued after the Red countries** (Vorsk /
      Ashkar / W18 dragons; re-count the ledger there — Blue 8.5 / Green 6.5 / Black 4.5
      / White 3 / Red 3.5 statted after this pass). Still banked: heathspinner.
      Ben: balance the ecosystem's colors across the completed nations minus Canticle and
      Goldenport (mechanical balance also arrives later via invested-human adversaries —
      the ecosystem balances first). **Section 1 (the frame) APPROVED and committed:** the
      **three-layer derivation** (geography picks the animal → ground picks the default
      colors → **deity attunement balances the roster**, ruling 108), the moratorium
      clarified **Blue-only (Green fully allowed)**, continental Red waits for the
      Red-country passes (**a second balance pass runs after those**), Malcurr exception:
      the **Red/Green Gnothis spike at Kenmere** (ruling 109). Ledger at count
      (2026-07-20 — canon entries / statted animal blocks, pairs ½ each): Blue 7.5 / 7.5 ·
      Black 4.5 / 2.5 · White 4 / 2 · Green 3.5 / 3.5 · Red 1.5 / 2.5. Per-nation plan:
      **Thalendor** = stat the Green trio at last (rootling swarm, briar-gone grove;
      grove-heart stays ruling-40 terrain-scale) + NEW Black + White Verdannis creatures
      (section 2, gated); **Corvaine** = callthief range-extension north + tollbird flock
      block + any new concept White/Black (section 3); **Malcurr** = Red + Green
      Gnothis-spike creatures (section 4); **Lunavar** = no roster change (section 5
      confirm). All statblocks through the Phase-4c gate; ONE pack rebuild at the end of
      the pass.
      > **Section 2 (Thalendor) APPROVED whole and committed 2026-07-20 (ruling 110 + the
      > §5c "Thalendor heartwood" block):** the **reeve-owls** (Black — the Arbiter's
      > bailiff; judgment kit: Sapping Hex / Predatory Patience / Sovereign of Solitude /
      > Cruel Step) and the **crownoxen** (White — the ring; formation kit: Shield Wall /
      > Guardian Stance / Retributive Guard / Unbreakable Line), both worship-fed deity
      > attunement with the faith-lever (heresy shows in the wildlife); Green statting
      > scoped (rootling swarm = "the Snare"; briar-gone grove = "the Closing Arena" at
      > boss scale; grove-heart stays terrain-scale). Statblocks queued for the pass-end
      > Phase-4c gate.
      > **Section 3 (Corvaine) APPROVED whole and committed 2026-07-20 (ruling 111 + the
      > §5c "Corvaine river-plains" block):** the **Tessavain/Order nexus ruled into
      > Corvaine** (site ⚑ → W12), the **surecats** (Blue foresight rival — Forewarned +
      > Intercept / Probable Outcome / Redirect Momentum; **Ben's own spent moratorium
      > exception, not precedent**), the callthief range-extension north (horn-calls
      > sentence, existing block serves), and the tollbird flock kit scoped (Whispered
      > Doubt + Sapping Hex). Statblocks queued for the pass-end Phase-4c gate.
      > **Section 4 (Malcurr) APPROVED whole and committed 2026-07-20 (ruling 112, §5c
      > Malcurr-lakes block extended):** the Kenmere spike populated — **brandrams** (Red
      > charge rival: Reckless Advance / Momentum's Edge / Shockwave Slam / Unstoppable)
      > and the **tussock-sow** (Green — ruling 80's banked Mirewright unbanked, with the
      > banked "Closing Arena" kit: Sudden Growth / Spreading Roots / Apex Predator /
      > Drive the Prey). Spike-age default ruled: old spike, new surge — the thriving
      > anomaly + the "brandrams gutter first" banked lever. Heathspinner + "the Snare"
      > shape remain the only banked leftovers (the Snare's talents went to the rootling
      > swarm). Statblocks queued for the pass-end Phase-4c gate.

### D. Demographics — land budget → population (one nation per session)

- [x] **W24 — Per-nation land budget + population — COMPLETE 2026-07-22 (all ten nations,
      the Kettavar dive closing it: rulings 139–149).** (Method: canon ruling 26;
      `lore-forge` Phase 4b.) Thalendor is **done** (~142k km² raw / ~163k effective
      farmland, 80/km² → ~13.1M, ⚑ fisheries uncounted). **Corvaine is done** (2026-07-14,
      rulings 28–30 + 41–43: ~176k km² farmland → ~14.1M, calorically whole,
      institutionally drowning; full culture block, Aldercourt, the court, the Lesser
      Tolling — see the dive log below). **Lunavar is done** (2026-07-19, rulings 62–70 —
      see the dive log below; the rice-and-marsh model is the worked example of the margin
      invariant + composition dials). Malcurr, Goldenport, Canticle, Vorsk, and **Ashkar**
      (2026-07-22, rulings 125–138 — the pocket-and-coast model, ~3.35M pre-collapse /
      ~1.3M current) are also done, and **Kettavar closes the set** (2026-07-22, rulings
      139–149 — the herd-and-coast model, ~780k, the smallest nation; see the dive log
      below). The one remaining nation-scale item is **Sylvaneth's fae pass (W9 deep /
      W20)**, tracked separately — it was never in W24's scope (no land budget for the fae
      island until W20's rulings land). Per-nation inheritances now on record: **Malcurr** walks
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
      > free the workforce, which is where the war-funding coin comes from). **Section 2
      > (GM-truth forks) APPROVED and committed 2026-07-19 (rulings 73–77):** Brandmere
      > (city-09) + the Sevenbrand war-coin forge (closes ruling 57's names); still-house
      > souls = transit density, "the islands that have gone cold" (no second collector);
      > the Lesser Tolling import as an early guild-pressure clock; **the
      > cultural-attunement framework** (ruling 76 — nations carry ground AND cultural
      > palettes, invested split by walk of life, second color by proximity/affinity;
      > retro: Thalendor culturally Black/White on Green ground, Corvaine White twice
      > over, Vorsk/Kettavar already aligned, ⚑ Lunavar's retro pick pending);
      > **Malcurr = culture Red, ground Blue, Black by event** (ruling 77 — Red/Green
      > religious default, Red/White southern forge-towns with the quiet Kethane minority
      > forging Siege Constructs, Red/Blue lakeside; bestiary Blue/Black from migrations
      > and stagnations; Lamp-tenders a Warlock-chartered guild). **Section 3 (culture
      > batch) APPROVED whole and committed 2026-07-19 (rulings 78–79):** Lunavar's retro
      > cultural attunement = **Green/White** (the domain's pair; the Fate-tree breadcrumb
      > a deliberate feature — closes ruling 76's ⚑); the Proving ("the proof holds"),
      > **Kenmere** = city-07 the capital (the Proofhall), Lamp-tenders deepened ("no one
      > goes out in the dark"), the still-house registers (the page the keepers couldn't
      > write — the Lesser Tolling's substrate), the beached fishers, naming deepened
      > (given names + surname-sequences + milk-name insult), the **Gnothis lived-faith
      > slice** (lesson-offering, "witness this," the click, the undatable absence — W11's
      > Gnothis slot now substantially covered, §8.1 untouched), quirks + one-scene
      > alternate. **Section 3b (the lake bestiary) APPROVED and committed 2026-07-19
      > (ruling 80 + the §5c "Malcurr lakes" block):** wrongwakes, wake-eels, hushwings,
      > ferry-foxes, and the **fellstag** (Ben's pick from a 3×3 Green-terrain menu —
      > Kit 2 + Drive the Prey; tussock-sow, heathspinner, Kits 1/3 banked in W23); the
      > lamp layering ("the wrongwakes and hushwings made the lakes trust light over
      > sound; the vigil made the lamp holy"); Sevenbrand construct-smith as the human
      > statblock entry. **Remaining, gated:** the Phase-4c statblock gate (five blocks),
      > then section 4 (assembled §5b prose + primer + cultures.json + naming table +
      > sweep).
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
      >
      > **Vorsk dive IN PROGRESS (2026-07-20) — section 1 (land-budget dials) APPROVED
      > and committed (ruling 114 + the gazetteer `land_budget`).** This is also the first
      > **Red-country pass** (ruling 109 — the W18 dragons' R/B variant and the second
      > color-balance count are queued behind it). Measured on the post-gap-fill watertight
      > partition: 689,068 km² (7th-largest), 5.1% water, landlocked; true painted borders
      > with Kettavar/Malcurr/Lunavar/**Thalendor/Corvaine** (the last two newly literal);
      > Goldenport's north-coast ports ~125–175 km from the western border. Ben's rulings:
      > the **valley-and-ledger model** (cleared 5%; hardy grains 2.0M kcal/ha; herd 0.30
      > LU/person sheep-heavy with HALF its feed off the high pastures — the transhumance
      > term, feed-not-food; Ledger grain at 8% of human calories ≈ 53,000 tons/yr, sizing
      > ruling 93) → **~3.2M normal-times, the SMALLEST measured population**, herd ~960k
      > LU. The margin invariant resolves structurally: **the buffer is one-shot** (hay
      > and alp grass aren't human-edible — no convertible cushion), which derives the
      > permanent ritualized raiding; famine = murrain on the buffer + premium on the
      > Ledger grain → rationing-tier, ruling 67's escalation with economics underneath.
      > **Hospice dial deferred to section 2's blade-mercy fork.** Phase-2 audit of the
      > existing 5b block: clean; two sweep catches queued (§5 table "expand north" →
      > south; stale ore-road distance in no committed doc — measured figure now on
      > record). **Section 2 (GM-truth forks) APPROVED and committed 2026-07-20 (rulings
      > 115–118):** the **going-up** (A3 — the quiet shelves; no kin raises the hand, the
      > cold is mechanical; net hospice accrual ~1%/yr → ~64k stuck-dying, one household
      > in ten; the Congregation's second wedge = preaching the blade as courage, the
      > ruling-67 pattern named); **Kragmoot** = city-08 the capital (the high hall);
      > city-12 = the gate-town, name redirected (not Emberholt) to the new **god-fossil
      > toponym rule** (ruling 118, Ben's Athens pattern — region-level small towns pad
      > with deity-derived names; fossils = sacred-geography data; dead gods leave
      > fossils like curses; lore-forge + session-forge updated); the **succession
      > structure** (ruling 117 — Warlord Berrek Karn old-law; the church grows his
      > replacement and the groomed challenger IS Isra Vael, C1 held loosely — Tyrith
      > building his Vorsk face on Razkael's unwitting resonant; §8.2 armed not
      > foreclosed). **Section 2 follow-up APPROVED and committed 2026-07-20 (ruling
      > 119):** the fossil follows the nation's god-coding — Vorsk runs **Tir-/Tyr-**
      > names (ancient high-hall Tyrith faith faded into the challenge-succession custom
      > itself; the Congregation is REKINDLING, not planting — chaplains cite the old
      > names as propaganda; growth-rate tell intact), **city-12 = Tirgard** (chaplains
      > restore the "Tyrgard" spelling on church documents — the rekindling visible in
      > orthography), the **stem table** landed in §5b connective tissue, and the
      > **Rask-/Kael- stems are RESERVED for Ashkar's pass** (noted in canon §10's Ashkar
      > inheritance). **Section 3 (five culture items, walked one at a time) APPROVED
      > and committed 2026-07-20 (ruling 120):** the going-up; the warband/share/moot
      > (takes-the-hall-never-the-shares); the fort-steadings (~320 souls, one gate) +
      > Kragmoot/Tirgard; the rekindling (second take — high halls down, rank with no
      > ceiling); seed-chest/gate-bench + folds-and-hundreds warband names (the
      > Stonefold, Vael's Hundred). Oath pair dropped by Ben. **Section 3b (the ranges
      > roster) APPROVED and committed 2026-07-20 (ruling 121):** the cragdrakes (W18's
      > ranges half — adults rival/wolf-sized with Searing Bolt, alpha boss with Flame
      > Surge AoE; shelf fork YES — the mountain has teeth), the bellwether (first
      > domesticated attuned lineage), cinderbrock ore-road extension, the silence over
      > the shelves as scenery. **Phase-4c gate CLOSED 2026-07-20 (rulings 122–123):**
      > Ben's dice correction — **adversary leyline rank = role rank (minion 1 / rival
      > 2 / boss 3), superseding 107/113 tier-dice** — engine fallback + Shield Wall +
      > Pack Pressure fixed (Sonnet-audited), four Vorsk blocks landed, the retro sweep
      > re-diced six older blocks + four card texts, bench rows updated. Deploy: engine
      > F5 + pack rebuild + ⟳ Sync Adversaries. **✔ VORSK COMPLETE 2026-07-20 (rulings
      > 114–124; section 4 approved):** primer mirrored, sweep run (§5/§5a/§5b/§6/§3/
      > §8.2, cultures.json synced, labeled map re-rendered). The eighth nation of ten;
      > Kettavar and Ashkar (and Sylvaneth's W9/W20 pass) remain. Banked: where Vorsk's
      > dead pool (ruling 115); ⚑ W18's Ashkar R/U half; Rask-/Kael- stems reserved.
      >
      > **Ashkar dive IN PROGRESS (2026-07-21) — section 1 (land analysis + land-budget
      > dials) APPROVED and committed (rulings 125–126 + the gazetteer `land_budget` +
      > the `western-tributary` trace).** Measured: 893,896 km² (5th-largest), 2.8%
      > water, **coastal** (south + west-below-Goldenport's-ribbon — the map forces it;
      > SW bay + peninsula, city-29 the natural harbor), the hardest aridity structure
      > measured (74% >100 km from fresh; 67% dead mesa interior ~595k km²); water in
      > three pockets (west lake chain ~12k km² draining to the sea at city-28, NE
      > tributary basin at city-26, Vespera's western 95%); the western border tributary
      > traced 1,060 km from Ashkar's NE mountains to the Palewater confluence fork
      > (closes ruling 101's queue). Ben's rulings: the **pocket-and-coast model**
      > (cleared 4.5% — pocket agriculture; 2.5M kcal blend; 0.26 LU goat-heavy;
      > `range_diet_frac` 0.15; **`coast_diet_frac` 0.10 — the fourth ruling-27
      > exception**, "like Goldenport — they can fish") → **~3.35M normal-times, WHICH
      > MEANS PRE-COLLAPSE** — second-smallest measured; the catastrophe was never
      > caloric (margin invariant satisfied; what broke was the people holding the
      > land, ruling 52). **Section 2 (GM-truth forks) APPROVED and committed
      > 2026-07-21 (rulings 127–133):** Ashkar **was Razkael's own Destruction country**
      > (127 — resolves the fossil-vs-"none" collision the Vorsk way; his church died at
      > his banishment); the collapse mechanism is **the Wear** (128 — a resident god's
      > passive few-percent tax on the survival of made things, the material inverse of
      > Goldenport's Luck, fatal only to a pocket-desert margin; the wear-gradient is an
      > act-3 compass); the fall was **gradual rot + a terminal waterwork cascade ~30–40
      > y.a.** (129); **~1.3M remain** (130 — ~40% of pre-collapse, deliberately
      > under-peopled); the hospice answer is **the Clearing** (131 — the dead faith's
      > one surviving kindness, one household in ten, opposite Morrath's keepers); city
      > roles set (132 — city-28 dead royal seat, city-29 living port-center, city-26
      > gate-to-the-green); and **one faction matters** — the warlord hold that keeps the
      > pass into the deep mesas (133, name deferred to section 3). **Section 3 (culture
      > batch) APPROVED and committed 2026-07-21 (rulings 134–135, one change — palace
      > dropped from the sensory opener, "it's a big country"):** the §5b block **"the
      > nation where nothing is built to last"** — the Provisional (build-to-mend, "stone
      > is for the dead"), the Water-Peace (share-a-drink road-law + peace-stone), the
      > Taking-in (holds court people, the inversion of Vorsk's Taking-law), the Flame
      > kept as ash (Clearing + clearing-burn + the honest word); town names spend the
      > Rask-/Kael- fossils (**Kaelmouth** de-facto capital / **Raskeld** dead royal seat
      > / **Kaelgate** gate-town), no-surname personal naming, the **Ashhold / Vekh /
      > Sunderway** faction NPC (§6 + unpainted site). ⚑ residual: Lake Vespera's Ashkari
      > name still unminted (**RESOLVED — ruling 136, Kaelmere**). **Section 3b (the
      > ecology roster) APPROVED and committed 2026-07-22 (ruling 137):** ledger counted
      > first (post-Vorsk Blue 8.5 / Green 6.5 / Black 6.0 / Red 5.5 / White 4.0 → serve
      > Red + White, Blue only via the pair); the deity spike is the god in person so the
      > roster densens toward the dead interior (ecology = the wear-compass; dragons track
      > the god). Roster: **the hazewyrms** (Red/Blue apex, W18's mesa dragon-half — the
      > Veiled Red, heat-shimmer ambusher, whelp/adult/elder), **the reckoning** (White
      > caravan-pack, culture-implied), **the slagbulls** (Red bruiser), **the driven
      > herds** (mundane famine arc), falsewater + washes/salt scenery. Ledger effect ≈
      > +1.5 Red, +1 White, +0.5 Blue. **Phase-4c statblock gate CLOSED 2026-07-22
      > (ruling 138, "This is good"):** five blocks in `data/adversaries.json` (folder
      > *Ashkar Mesas Bestiary*) — Hazewyrm Whelp Pack / Adult / Elder (boss tier-2 in a
      > tier-1 hp band), The Reckoning (White pack), The Slagbull; all ruling-122 dice,
      > wiring reuses False Spring's ambush-belief + the Afterburn/Kindle/Flame-Surge/
      > edha-push/edha-move shapes. Adversarial audit ran clean; two fixes applied
      > (Kindle's light clause made live via `lightRadiusFt: 5` — the shipped **False
      > Spring** carried the same latent bug, parity-fixed; the Elder gained Searing Bolt
      > so Kindle rides a real energy attack). Slagbull kit finalized (Momentum's Edge /
      > Breaking Point dropped — see ruling 138). **Deploy: pack rebuild + relaunch + ⟳
      > Sync Adversaries** (bench section "Ashkar Mesas Bestiary"; art wishlist +5).
      > **✔ ASHKAR COMPLETE 2026-07-22 (section 4 close-out, rulings 125–138 — the ninth
      > nation of ten).** Primer mirror written (player-safe homeland culture — the
      > Provisional, Water-Peace, Taking-in, the old mercy; GM Wear/Razkael-still-here
      > stripped); cultures.json Ashkar flavor synced (rides the pending pack rebuild with
      > the five adversaries); dependent sweep run (§5 row, §5a picks + ground truth, §5b
      > block, §5c roster, §3 Razkael, §8.2, §10, §5d dead-coin still accurate, the
      > OPENING doc's stale "why it fell" open-item closed); labeled map re-rendered
      > (Kaelmouth/Raskeld/Kaelgate/the Ashhold as painted:false site-mirrors) + paint
      > guide regenerated. **Only Kettavar remains** (plus the Sylvaneth W9/W20 fae pass).
      > Deploy still pending on Ben's machine: pack rebuild + ⟳ Sync Adversaries (the five
      > blocks + the False Spring parity fix + the Lunavar/Vorsk/Ashkar culture items).
      >
      > **Kettavar dive IN PROGRESS (2026-07-22) — section 1 (land analysis + the
      > herd-and-coast dials) APPROVED and committed (rulings 139–140 + the gazetteer
      > `land_budget`).** Measured: 479,615 km² (9th of 10), **0.0% drawn fresh water**
      > (the only nation with none — meltwater is terrain, not paint), and **the
      > continent's most maritime structure**: an E–W peninsula ~1,780 km long, ~68% of
      > its boundary open sea, 80% of land within 100 km of salt water (Ashkar's
      > structural inverse); Vorsk's wall directly south, Malcurr at the east root,
      > Goldenport's ribbon ports ~330 km by sea from city-02; both markers on the
      > seaward shore, the inland spine empty. Ben's rulings: the **herd-and-coast
      > model** — the chain runs RANGE-first (usable range 65%, stocking 1.0 LU/km² →
      > ~312k LU of migratory herds at the 10%-conversion floor; diet range 0.50 /
      > coast 0.35 / crops 0.15; **coast = the FIFTH ruling-27 fish exception**; cleared
      > 0.15% of omen-timed lee plots) → **~780k normal-times, the smallest nation by
      > far**. Margin-invariant finding, load-bearing: **the herd IS the granary** (no
      > convertible buffer — a continental ~15% murrain-lock would mean rationing-tier,
      > not "Stable"), so §5's "insulated by design" rests on the ⚑ section-2 first
      > fork: the Fetch's omens steering the herds off sick ground. **Section 2
      > (GM-truth forks) APPROVED and committed 2026-07-22 (rulings 141–143):** the
      > insulation is **the tended granary** (141 — layer 1 lands on the tundra like
      > everywhere, but the herds are never standing on it: the omen channel IS the API
      > the Fetch manages the nation through; doctrine looks confirmed, faith deepens,
      > the insulation and the harvest are the same act; Miravel's actuarial tell — no
      > herd lost in living memory; legible-from-outside murrain-rate clue; **W15 data
      > point recorded**: a predator managing livestock, not a fed god shielding);
      > the hospice answer is **the last casting / ice-giving** (142 — the omens choose
      > the day, the cold finishes; net ~0.5%/yr → ~8k on 780k, one household in
      > twenty, lightest anywhere; dead-drift banked, ruling-115 pattern); marker roles
      > (143 — city-02 the seat + casting-ground + worship-spike peak, city-01 the
      > sealing/whaling sea-town). **Section 3 (culture batch) APPROVED whole and
      > committed 2026-07-22 (rulings 144–145):** the §5b block deepened — the last
      > casting (scheduled grief), the open hand + the remembering (obligation-wealth
      > the murrain can't catch; midwinter recitation the Unmaking Days read
      > backwards), the sea/tideline/sowing (shunned-for-the-catch; driftwood-and-
      > whalebone roofs; omen-called sowing out-yielding the calendar = ruling 141's
      > tell in plain sight), the quiet Vorsk border (trade not raids), new quirks
      > ("about enough"; casting-sticks) — and the names: **Maelstrand** = city-02 the
      > capital, **Maelvik** = city-01 the sea-town, the continent's only LIVING-god
      > fossils said knowingly ("you cannot keep what was never still"); naming row +
      > demonym **Kettavari** + exemplars; labeled map re-rendered, gazetteer named
      > (painted: false). **Section 3b (the tundra roster) APPROVED and committed
      > 2026-07-22 (rulings 146–147):** ledger counted first (post-Ashkar Blue 9.0 /
      > Red 7.0 / Green 6.5 / Black 6.0 / White 5.0 → serve Black; White debt NAMED to
      > future passes, ruling 36 bars White herds here); **ruling 146 is a standing
      > clarification from Ben — the Blue moratorium bars NEW lineages, not
      > biome-adaptations of existing ones** ("the tundra not having any Blue is
      > noticeable"). Roster: **the fetches** (Black/Blue pair apex — whiteout ambusher
      > wearing the shape of the familiar; Phantom Double + Absolute Stillness +
      > Predatory Patience, elder Dread Presence; **Ben took the fetch name** — the GM
      > docs' "Fetch" label now has an in-world etymology, the entity stays nameless
      > in-world and players will coin their own), **the cullwolves** (the Tithe;
      > Severance kit; famine arc = the cull that cannot close — the insulation's edge
      > drawn in wolf behavior), **the tarvar** (mundane herds; the wrongness is their
      > health — a statless clue), **keelshadow range-extension** (Blue reuse, ruling
      > 97's block serves), swards + greatfish scenery. Ledger ≈ +1.5 Black +0.5 Blue.
      > Deity inversion recorded: the only nation whose attuned wildlife is getting
      > STRONGER (fed faith). **Phase-4c gate CLOSED 2026-07-22 (ruling 148, "looks
      > good"):** four blocks in `data/adversaries.json` (folder *Kettavar Tundra
      > Bestiary*) — The Doubled (rival; Doubling ambush-belief + fooled-rider Grasp),
      > The Doubled Elder (boss tier-2-in-tier-1-band; The Seeming full loop name
      > verbatim + Dread Presence at its TRUE 60-ft boss range), Cullwolf Pack (minion
      > ×4; **Severance's first bestiary carriage** — vital-convert vs Isolated), The
      > Cull-Alpha (rival; Predator's Due). Adversarial audit pre-gate: 3 findings
      > fixed (Elder 30→60 card text; false "(engine name-keyed)" PP claims; rival
      > re-fool over-promise). **Kit finalized: Absolute Stillness dropped** (0-Speed
      > punisher, nothing in kit reduces Speed; the Doubling carries the seeming).
      > **Parity sweeps blessed**: Cragdrake Alpha Dread Presence 30→60 ft card text
      > (engine always enforced 60; bench row updated) + the PP wording sweep on
      > Dirgehound/Cragdrake/Reeve-Owl (no behavior change). Deploy: pack rebuild +
      > relaunch + ⟳ Sync Adversaries (same rebuild as Ashkar's five); bench section
      > "Kettavar Tundra Bestiary"; art wishlist +4. **✔ KETTAVAR COMPLETE 2026-07-22
      > (section 4 close-out, ruling 149 — the tenth nation of ten; W24 CLOSES).** Primer
      > mirror approved and landed (fetch folklore player-safe BY DESIGN — the players get
      > the word from the world; the tended granary / steered routes / Miravel's aggregate
      > stripped); cultures.json Kettavar synced (rides the pending pack rebuild);
      > dependent sweep run (§3 Maelith granary-run sentence + Maelstrand seat, §6 Miravel
      > actuarial tell, §5c stale future-tenses closed, §10 collapsed). Deploy still
      > pending on Ben's machine: ONE pack rebuild + relaunch + ⟳ Sync Adversaries covers
      > the Ashkar five + Kettavar four + all culture items + the False Spring and
      > Cragdrake parity fixes.

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

- [ ] **W30 — Palewater region naming pass** (downstream of the 2026-07-22 settlement pass,
      rulings 150–156; the ruling-118 god-fossil walk over the new settlement layer). To
      name, in section order with Ben: the **5 corridor slots** (km 140/300/430 west, km
      250/430 east — the labeled river towns of the session-1 run), the **ferry-pair
      cities** (city-30 Thalendor / city-31 Corvaine), **city-32/33/36** (+ city-21/34/35/37
      as they come into play), the **great lake** and the **SW lake** (both unnamed!), and
      the **tributaries T1–T5 / C1–C3**. Stems: Thalendor = Verdannis fossils (stem
      exemplars unwalked — propose at the pass); **Corvaine has no established deity (§5)**,
      so whose fossils its bank wears is a real design question (dead-god fossils? Tessavain,
      whose Order nexus sits in Corvaine per ruling 111?) — walk it first. Unnamed cities
      join the world-canvas paint-overlay backlog only once named, so the painting pass for
      city-30..37 glyphs rides this item's close-out.

- [ ] **W31 — region_overlay.py adopts the ruling-157 derivation** (at the NEXT region pass,
      whichever map that is — no Palewater re-run, its draft-2 is seed-frozen and approved).
      Two code changes when the next region's CONFIG is written: **(a)** placement order
      water → specialty → fort → shrine → junction (currently water → fort → specialty →
      shrine); **(b)** the flat `min_d=18/14/13` px constants become the per-nation derived
      spacing band from gazetteer `meta.settlement_dials` (⅔ × dominant-mode day-rate;
      junction/top-up relaxations as fractions of the band, not magic numbers). Inputs are
      already canon (ruling 157) — this item is purely the machinery catching up.

- [ ] **W32 — the ruling-161 dependent-prose sweep** (populations re-derived bottom-up:
      continent ~5.68M, was ~83M; Thalendor starving NOW). Old figures are
      superseded-pending-sweep, not wrong-in-place — sweep in lore-forge section order:
      **(a)** §5a/§5b nation-block scale text (farmland km², LU herds, "~14.5M"-class
      figures — the Kettavar dive's 312k LU and Canticle's 1.28M LU shrink with their
      nations); **(b)** the famine fractions (rulings 25/26/27 detail text) onto the
      demand-side ledger + the 161c starving-NOW reading (Withervale scene logic, §3
      alchemy-as-dam framing); **(c)** army/raid scale mentions; **(d)**
      `EDHA_PLAYER_PRIMER.md` population lines + primer rebuild; **(e)** per-city sizes
      for the six non-walked nations (⚑ provisional totals in `settle_gazetteer.py` /
      the ledgers); **(f)** Ashkar + Sylvaneth walks inherit the frontier basis when
      they run.

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
