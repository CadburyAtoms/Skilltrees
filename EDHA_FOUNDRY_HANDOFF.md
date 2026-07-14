# Edha → Foundry VTT Port — Agent / Operator Handoff

Self-contained cold-start doc. Read top to bottom. **§1–§6 = how it works + how YOU operate it solo. §7 = the native Event/Effect system (DONE — 2026-06-09: ALL behavior lives ON the talents; runtime is a thin generic engine; both historic blockers solved + live-verified). §8 = current content state. §9 = open to-dos. §10 = gotchas.**

Backing detail (every session's notes) lives in agent memory `edha-foundry-module-build.md` + `edha-aoe-bursts.md`; this doc is the curated summary. Last update: **2026-07-14e** (ECOLOGY SECTION 2 — THE MOVING PLANTS — docs-only, same branch: Ben approved the Thalendor W19 block with all defaults → **canon §5c Green block + ruling 32**. Names: **rootlings** (animal-smart runner-tangles) / **grove-hearts** (mature stands grown into one organism, one slow mind) / maddened state = **"gone to briar"**; Canticle kind-name **the Errant Green** (the W19 "grove-warden" tier name was DROPPED — collides with §5b's human root-warden station). **Sapience ruled village-minded** — remembers, learns by root-contact, keeps bargains of habit, never speaks; wardens negotiate in craft; many shrine-groves ARE grove-hearts (the barefoot custom encodes the ecology — §5b cross-ref added). Famine arc fully derived (rulings 2/24/31): starving hearts go silent, displaced rootlings mine farmland **and raid granaries/seed corn** (ruled yes — a famine actor villagers can watch), blight-caught hearts madden. GM: groves are living dowsing rods — sickening order maps the drain's geography; the wardens' failing craft feeds the Lowered Crown heresy from below. Primer Thalendor blurb gained the player-safe sentence (rootlings + barefoot shrine-groves common knowledge; "the groves have gone strange" — no causes). TODO W19 checked off. **Next: section 3 Corvaine (W21 Black carrion-fauna + Blue river-creature), then W22 encounter column, then the W23 roster.** NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-14d** (ECOLOGY PASS OPENED — W17 ATTUNEMENT FRAMEWORK LANDED — docs-only, branch `claude/thalendor-corvaine-ecology-3q35te`: Ben asked for a **Thalendor + Corvaine ecology pass** (backlog section C). Section-walk mode (lore-forge Phase 3): **section 1 = the W17 attunement framework, approved by Ben with all three recommended dials** and committed as **canon §5c + ruling 31** — attunement = a lineage concentrating one frequency (derived from the field model, ruling 11; adaptation, not magic); three tells (build/coloration → behavior → at the strongest concentrations ONE minor Investiture effect, never spellcasting); clusters on ridges/nexuses; **dials as ruled:** uncommon-but-known (every district has a named example), hereditary lineage (not contagious), faintly Investiture-detectable (clue-bearing wildlife — Ferrik Cade's wolf is the type specimen); **the shift clause** — shifted concentration makes attuned life starve/move/madden, and the two live shifts (Green drain falling in Thalendor, Black/Green rising at the soul-pools) are the act-1 encounter engine. Player-safe paragraph added to `EDHA_PLAYER_PRIMER.md` (timeless common knowledge only — no shift causes); TODO W17 checked off. **Queue for the rest of the pass, one section at a time:** §2 Thalendor moving plants (W19 — ⚑ sapience + names) → §3 Corvaine (W21 Black carrion-fauna + Blue re-sited to **riverlands** — W21's "Corvaine's lake country" text predates the §5a geography fix; the lakes are Malcurr's) → §4 the W22 broken-cycle encounter column → §5 assembled prose + the W23 Thalendor/Corvaine adversary roster (statblocks = downstream PACK work, rebuild + ⟳ Sync when they land — nothing yet). NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-14c** (THE TOLLING + SESSION CLOSE — docs-only, same branch, **PR opened**: Ben approved section-3 item 1 verbatim — **the Tolling** written into §5b Corvaine (the dead-in-law rite behind ruling 29: the empty-bier state funeral, the Quiet Wing, nurses sworn to silence, the past-tense etiquette, the mourning-ribboned portraits; GM layer: the regency stands entirely on the fiction — an act-2 politics hook; player-safe truth is simply "the old king died," so the primer needs nothing). "Visited by no one but *his queen*" deliberately avoids naming the Queen Dowager until item 5 lands. **Session closed by Ben after item 1 — Corvaine resumes FRESH next session from item 2**; the remaining queue (plague-wells → hospice math → capital "Aldercourt" → court names → section-4 assembled prose + sweep, plus the open dead-in-law-spread and Warlock-knowledge ⚑s) is checklisted in TODO_WORLDBUILDING W24. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-14b** (LORE-FORGE PHASE 3 REWORKED + CORVAINE BATCH 1 — docs-only, same branch `claude/thalendor-eastern-neighbor-dive-9oyeuz`: **process change (Ben):** the monolithic everything-menu is retired — design questions now go to Ben **in order, by section**; invented content is proposed in **full text, one item at a time** (never a compressed picker label); Ben approves a batch and we move on; **approval precedes every commit**, bookkeeping included (SKILL.md Phase 3, CLAUDE.md batching bullet, and the TODO how-to header all updated; both incidents — the 07-14 everything-menu + unapproved scaffolding commits, and the 07-13 write-before-gate — recorded as case notes). **Corvaine batch 1 approved and committed** (canon §9 rulings 28–30 + the full gazetteer `land_budget`): **cleared 25% → ~14.1M people** (176,431 km² farmland, no leyline yield bonus, ~3.70M livestock units; layer-1 famine leaves Corvaine calorically whole — herds cull ~20% — so the writ-raids are institutional desperation: hospice care-burden + a collapsed treasury, not the harvest); **the Child King** — the old king took the wasting post-seal and was **tolled dead-in-law**, breathing in a sealed wing; the regency stands on the fiction and the Morning Presentation's true meaning is proving the realm has a *living* king; **Malcurr's coin** — surface procurement + leverage, deep truth **the beginning of the mortal side of Tyrith's power-grab from Verdannis** (thread-1 vagueness deliberately softened per Ben; default taken ⚑ flip freely: the Warlock doesn't knowingly serve Tyrith). **Still pending, one item at a time (section 3):** the Tolling as lived culture → plague-wells → hospice math → capital (Aldercourt proposed) → court names → then the assembled §5b/§1a/primer prose shown whole before commit. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-14a** (CORVAINE DIVE — MEASURED + AUDITED, **GATE PARKED** — docs + map tooling only, branch `claude/thalendor-eastern-neighbor-dive-9oyeuz`: started the eastern-neighbor full-depth pass (lore-forge; W24's next nation — **Corvaine**, session 1's writ-raiders). **Free work shipped:** Corvaine measured off the gazetteer — **776,376 km², 9.1% water** — via the new committed tool **`scripts/map/water_frac.py`** (polygon-masks Rivers-and-Lakes blue on thyrcross.png; self-calibrates against Thalendor's recorded 11.7%, reproduced at 11.5%, and refuses to report if the classifier drifts; prints the whole continent in one pass for the remaining W24 nations). Partial `land_budget` block written to the gazetteer (measured facts only; `_status` marks the dials GATED). **Derived audit finding (rulings 25–27, no new dial):** with the standard dials the human share of production is ~23.4% *regardless of nation size*, so a **layer-1-only nation at 85% yield is calorically WHOLE** (livestock dips ~20%) — Corvaine's desperation raids therefore CANNOT be national starvation; the driver is §1a's hospice care-burden + collapsed state finance, which the parked menu's hospice-math item would make concrete. **GATED AND UNWRITTEN (the interactive menu could not be delivered this session — no provisional prose was written, per the lore-forge Phase-3 gate):** the cleared-fraction dial (25% → ~14.1M recommended), why a child king (recommended: the old king tolled dead-in-law but still breathing — ruling 9's darkest monarchy consequence), why Malcurr funds the raids (recommended: grain procurement + a regency in debt; thread 1 untouched), and the plan-of-content (hospice math, plague-wells custom, capital "Aldercourt" at (1778,1601), court names). **The full menu with recommended defaults is parked in `TODO_WORLDBUILDING.md` W24** — answer it and the next session writes the whole dive in one pass. Canon untouched. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-13j** (RATIONS MATH CLOSED — docs-only, same branch `claude/famine-layering-review-igi97r`: closes the famine-severity thread. Ben's ruling: **livestock is a fully-convertible buffer** — as human grain runs short the herds are culled and people eat the freed calories, so the human-available fraction is effectively **100%** (killed the spurious "human-edible-grain fraction" dial I'd flagged — that was over-modelling). The math closes: humans stay fed until *total* production drops below the 9.56T human need = below **23.4% of a normal yield**. At the current **42.5%**, humans are calorically whole and the livestock budget craters ~75% (3.43M → ~0.85M units). So year-two Thalendor isn't a mass grave — it has eaten its herds and started on its seed corn, **~19 yield-points above the human-starvation cliff** and sliding toward it as the drain deepens (the campaign clock) — which *explains ruling 19* (Withervale = one dying elder, not full barns; the horror is the unrotting wasting, not famine corpses). Updated ruling 27, the gazetteer note, §5b, and lore-forge Phase 4b (added a "don't add a dial that doesn't change the answer / this is where a pass spins" caution). §10's rations items are now all resolved. NO engine/data/pack changes, nothing for the bench. Prior: **2026-07-13i** (THALENDOR CALORIE BALANCE + FISH RULING — docs-only, same branch `claude/famine-layering-review-igi97r`: **ruling 27.** (1) **Fish:** everything is hit by Layer 1 including fish (aquatic wasting — dying shoals that won't rot; environmental horror is canon, §1a + the lake nations), but **fish calories are ignored** for simplicity, so the ⚑ fisheries flag resolves *down* — the ~13.1M farmland population stands, not a floor. (2) **Pre-famine calorie balance** (Ben: humans + livestock = total production): adult 2,000 kcal/day = 730k/yr → 13.1M people = **9.56T kcal/yr**; effective farmland 16.34M ha × **~2.5M kcal/ha/yr** (net-of-seed, blended, Root-Network bonus already in "effective"; the one sourced-adjustable dial) = **~40.85T kcal/yr produced**; humans take ~23%, the remaining **~31.3T feeds ~3.43M cattle-equivalent livestock units** (~0.26/person; species mix downstream). **IMPORTANT — this cross-check corrected an earlier error:** the naive "famine 42.5% yield → ~5.5M fed / ~7.5M gap" (ruling 26) was WRONG — at 42.5% production (~17.4T) still exceeds the 9.56T human need, because the livestock/fodder buffer was ~77% of output. So the famine kills the **herds + human-edible grain first** (Thalendor eats its seed corn and slaughters its herds to stay fed while the drain deepens); nationwide mass human death is the **cliff ahead**, matching the campaign clock. That "5.5M/7.5M" line is retracted in rulings 26/27 + §5b. **New deferred dial:** the human-edible-grain fraction (turns the famine into a real hunger headcount). Calorie fields added to the gazetteer `land_budget`; `lore-forge` Phase 4b gained the calorie cross-check (with the caught-bug note). NO engine/data/pack changes, nothing for the bench. Prior: **2026-07-13h** (FAMINE SEVERITY REFRAME + THALENDOR LAND BUDGET — docs-only, same branch `claude/famine-layering-review-igi97r`: two follow-ups to ruling 25. (1) **Severity reframed as deficit:** Thalendor's 42.5% yield = a **57.5% shortfall** vs the ~15% a layer-1-only nation runs = **nearly four times (≈3.8×) as deep a food deficit** — the "twice as deep / half the yield" line was true but understated the number that actually starves people. Updated ruling 25, §1a layer-2, §5b Thalendor. (2) **The land-budget method (ruling 26)** — *populations are derived from resources, never picked.* Measured off the gazetteer: Thalendor is **1,076,400 km²** inside its border (~14.8% of the continent's 7.27M km²), **~12% water** (measured — Rivers-and-Lakes blue inside the polygon; the base map is stylized parchment so forest coverage is NOT measurable and is set as a dial instead). Ben's dials: **15% cleared** (revered forest caps clearing), **Root Network 60% in-AoE ×1.25** (below a heartland 70% so border farmland feels distinct). Chain → **~142,085 km² raw farmland / ~163,400 km² effective**; both famine layers cut that to 42.5% ≈ 69,400 km²-equiv. Stored as a per-nation **`land_budget`** block in `thyrcross.map.json` (Thalendor only so far; schema extends to the other nine as each is derived). **Carrying-capacity density = 80/km²** (Ben) → **~13.1M normal-times Thalendor**; famine feeds ~5.5M (~7.5M gap = the crisis). ⚑ **Fisheries uncounted** (lake country, ~12% water) so 13.1M is a FARMLAND FLOOR — the aquatic-food ruling (does the famine touch fish? lakes a lifeline the dryland nations lack?) is now the top open Thalendor item (canon §10). The **farmland pass is folded into the `lore-forge` skill** as Phase 4b, with the scope rule that each nation's full-depth pass (culture + land budget + population) is **its own session**, not a batch. NO engine/data/pack changes, nothing for the bench. Prior: **2026-07-13g** (THALENDOR RULINGS + FAMINE NUMBERS — docs-only, same branch `claude/famine-layering-review-igi97r`: Ben ruled the open Thalendor items and the hard famine figures (canon **ruling 25**). **Numbers:** layer-1 blight = **~15%** of arable lost at two years (rising); Thalendor's layer-2 Green drain = **50%** of the sown crop fails to sprout on the non-blighted land → Thalendor nets **~42.5% of a normal yield, half its neighbours', a food crisis twice as deep**; the vats were sized for the 15% blight deficit and are now **overwhelmed** by the halved crop base (Fenn's despair, the boiling heresy). Livestock feeding + per-capita rationing **deferred** to the next pass (population + food-need numbers, still being pinned). §1a layer-1/layer-2 + §5b Thalendor updated with the figures. **Thalendor edits:** §5b culture block **ratified**; the session-1/opening **names confirmed** (Heartholt, Elmsworth, Withervale, Palewater, Palewater Ford + Fenn/Wick/Harrow — ⚑/`name_provisional` flags cleared in the gazetteer, opening §4, session §10, canon ruling 23, cast table); the **Harrow mercy-killing plot CUT** — Harrow now keeps *the Shepherd's* rite (a folk-epithet for Morrath, registered in the §3 pantheon table) and his faith will not let him raise the hand the god is meant to, which reframes the Joskin-knife beat; the **"giving back" scene beat CUT** (the continental custom survives in §5b); the **field imagery** fixed everywhere to *thin* (half the seed never rose — the drain) *plus ~15% blighted* rather than the old "full and golden that won't dry." NO engine/data/pack changes, nothing for the bench — **NOTE the map PNG was NOT regenerated** (only `name_provisional` booleans changed, which render.py applies to nations, not sites). Prior: **2026-07-13f** (FAMINE LAYER-1 MECHANISM FIX + LORE-FORGE SKILL — docs-only, branch `claude/famine-layering-review-igi97r`: Ben flagged that the §5b culture pass's famine references "make no sense," which traced up to a bug in **§1a layer 1 itself**. The old framing — "ripening is a small death / the harvest never finishes / crops grow but stall / livestock waste without dying on time" — **contradicted the consent model (ruling 9)**: ripening/harvest/eating are all mechanical, so a healthy crop feeds people with no god in the loop and the seal has no lever on it. The famine can only enter through the **wasting**, the one channel the seal broke. Recast layer 1 as **the blight that never clears (new ruling 24)**: crop blight and livestock murrain are slow deaths that no longer finish, so a blighted field or sick herd can never resolve/clear/restart — the arable base **ratchets down** as un-ending disease locks up more ground each season. It's the *agricultural face of the same persistence that makes the plague nations hospice nations* (needs NO new cosmological rule — just Anaveth's already-canon persistence applied to crops), bites by **margin** (surplus nations absorb it, thin-margin ones starve), and keeps "the Last Harvest" as the reaping-of-souls metaphor (never literal ripening). A soil/return-leg mechanism was considered and **declined** as the cause (banked as an optional act-3 flourish). Session-1 blight imagery ("black-blighted wheat that won't fall," "cut a stalk and it neither dries nor rots") was ALREADY disease-based and needed no change — the abstract rule was the thing that had drifted. Swept the dependents: §5b Lunavar (night-calendar regrounded in *doctrine* not famine-rationalization, control-case reworded, margin/Vorsk severity clause), `EDHA_PLAYER_PRIMER.md`, `EDHA_SESSION_1_SCRIPT.md` opening, TODO W19/W22. New skill **`.claude/skills/lore-forge/`** — the worldbuilding counterpart of session-forge (load load-bearing canon → **derive every claim from a named ruling, never invent free-floating** → logic-audit against the death model → batch design questions as a **GATE and wait** → write at the §5b depth standard → sweep dependents → close-out), with `CASE_STUDY.md` walking this famine correction through as the method's exemplar; CLAUDE.md trigger paragraph + map table updated. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-13e** (CULTURE PASS + CHARACTER-CREATION PRIMER — docs-only, branch `claude/worldbuilding-character-creation-d01f35`: the worldbuilding backlog's whole **section A (W1–W10)** written for the imminent character-creation session. Canon doc gained **§5b "Culture by nation"** — a GM culture block per nation (rituals, quirks, one-line differentiator, GM layer), each derived from §5a geography + government + religion + crisis status and kept downstream of the load-bearing canon (field model / worship-feeds-gods / broken cycle): Kettavar's omen-casting + Unmaking Days (the Fetch's granary read warm-from-inside), Malcurr's Proof/scars-as-credentials + Lamp-tender vigils (still-house scale held back per ruling 19), Corvaine's Morning Presentation + writ-raids + the written-down Black-Altar burial folklore, Thalendor's Oaths of Station + vat-meal ritual + the **Lowered Crown heresy** (the pews are onto ruling 2), Goldenport's charter-sacrament + "the Port's luck", Vorsk's Taking-law + warband unit + dead-Razkael shrine customs, Lunavar's night calendar + moon-pools (⚑ provisional "Lantern" doctrine — moon's true nature stays thread §8.4), Canticle's Sounding/citation-duels + preservation-without-interpretation (why the archives thread works), Sylvaneth **surface-only** (Strand trade, exact reciprocity, name-withdrawal exile; deep fae = W20 untouched), Ashkar deliberately a stub. Plus **W10 connective tissue**: per-nation naming conventions codified from existing NPC exemplars, the shared continental custom **"giving back"** (the death libation = folk memory of ruling 10's return leg — and for two years the ground "doesn't take it"), border blending (Palewater fratricide; Vorsk/Lunavar equilibrium + the borderers as last old-ways Gnothis practitioners), and a GM one-scene checklist. **Terrain follows §5a ground truth** — the TODO's W2/W3/W6 descriptors predated the map (Malcurr = NE upland lakes ⚑ synthesis reconciling the script's "mountain-forge" stamps; Corvaine = mid-east riverlands; the mesa badlands are Ashkar's, so ⚠ W18's "Red ridge through Vorsk's badlands" needs re-siting when ecology is worked). New **`EDHA_PLAYER_PRIMER.md`** — the player-safe character-creation handout (world-in-ten-breaths, public gods table, leyline palette, per-nation blurbs + naming + 3 hooks each, faith-coherence guide), spoiler-checked against the session-1 do-NOT-reveal wall (crisis statuses public, causes absent, the Withervale reveal preserved; plague-nation origins flagged for private GM briefing). And the second job of the session: **`EDHA_SESSION_1_SCRIPT.md` audited against the new session-forge skill + `RUN_SHEET_TEMPLATE.md`** — the script predated the template's final shape, so it gained the missing **§8 player-facing text** (character-creation pointer, campaign-opening read-aloud, Khor's recruitment-notice handout verbatim), **§9 battle-map briefs + Foundry hand-off** (pulled out of the old ⚑ list; states plainly: run-by-hand needs NO rebuild, optional adversaries.json tokens = DATA → pack rebuild + ⟳ Sync), the ⚑ batch renumbered **§7→§10** (state-doc cross-ref updated), and one ⚑ optional Withervale beat (the "giving back" libation quietly failing — cut freely); skill-check vocabulary verified clean against cosmere-canon-reference (all names canon). State doc gained the character-creation step; TODO_WORLDBUILDING section A checked off. New ⚑ for Ben (canon §10): Lunavar Lantern doctrine, Malcurr terrain synthesis, Lunavar naming style, the giving-back script beat. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-13d** (SESSION-BUILDING SKILLS — docs-only, same branch: two new repo skills distilled from the session-1 build (PR #75, its six catches written up as the case study): **`.claude/skills/session-forge/`** (plan/prep a session: sync+state → frame job-vs-point + do-NOT-reveal wall → **geography FIRST** via the gazetteer, never eyeball → premise stress-test (the Joskin-decapitation test) → ONE batched rulings menu → cast/scenes/statblocks on the `adversaries.json` schema with outs+scaling → worldbuilding-backlog pull → clue ledger + stays-buried list → player-safe recap/handouts → battle-map briefs + Foundry hand-off → close-out; ships `RUN_SHEET_TEMPLATE.md` frozen from session 1, `CASE_STUDY.md`, `MAP_CHEATSHEET.md`) and **`.claude/skills/session-debrief/`** (Ben's freeform post-play notes → extraction grid → clue-ledger reconciliation → `EDHA_CAMPAIGN_STATE.md` updates → table rulings into canon §9 with contradiction-surfacing → consequences + next-session seeds — the campaign-play counterpart of test-pass-fixes). New **`EDHA_CAMPAIGN_STATE.md`** play ledger (party, know-vs-suspect, thread table, clocks incl. the soul-pool, NPC dispositions, session log) initialized to pre-session-1 state; CLAUDE.md gained the trigger lines + three map-table rows. NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-13c** (MAP DATA PIPELINE — repo tooling + docs, same branch: `scripts/map/` toolchain built (extract_procreate.py — the proven bv41-LZ4 decoder, committed so it's never re-derived; trace_regions.py — competitive flood-fill nation polygons off the political layer; trace_rivers.py — Zhang-Suen skeleton channel tracing; measure.py — distances/travel-days/locate; render.py — deterministic labeled-map generator, replaces hand-labeling; make_viewer.py → `source-materials/maps/viewer.html`, Ben's click-to-coordinate pan/zoom tool; lint_map.py — docs-vs-gazetteer drift gate, wired into CI validate.yml) around the new **`source-materials/maps/thyrcross.map.json`** gazetteer (THE machine-readable map truth: scale, 10 traced nation polygons, 29 cities with polygon-assigned nations, session sites, the Palewater channel polyline at 60 pts / 2,694 km). First measurement immediately paid off: the drawn river meanders ~2.1× straight-line → Ben ruled the fallout (canon §9 rulings 21–23 after the merge renumbering below): **"two weeks on the water"** — session-1 sites snapped ONTO the channel (Elmsworth (1290,1470) head-of-navigation, Ford (1422,1794) @935 km ≈ day 8–9, Withervale (1480,1925) @1,339 km ≈ day 12, Black Altar (1449,2337) at the confluence), **barge_down 110 km/day** (supersedes 80), the border river named **the Palewater** ⚑. Script/canon/opening retimed; labeled map regenerated FROM the gazetteer. MERGE NOTE: this branch landed alongside the 07-13 BROKEN CYCLE batch below — the PC-session rulings were renumbered to §9 18–23, and the two independently-ruled death mechanics converged (consent model, ruling 9 ≡ 18). NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-13b** (WORLDBUILDING BACKLOG — docs-only, branch `claude/worldbuilding-todos-7cuc09`: Ben opened three worldbuilding fronts, now itemized as **`TODO_WORLDBUILDING.md`** (sibling of `TODO_REPO_HYGIENE.md`; 23 session-sized items W1–W23): **A. culture by country** (W1–W10 — a rituals/quirks/differentiator block per nation, proposed canon §5b, each derived from the nation's geography/government/crisis status), **B. religion as lived faith** (W11–W16 — worship-feeds-gods per ruling 12 makes rites infrastructure; per-god practices incl. the four broken cases, sacred geography on nexuses, table-facing "what answered prayer feels like", ⚑ does faith do anything mechanically, ⚑ is godlessness causal), **C. leyline ecology** (W17–W23 — attunement framework, Ben's seeds: Red-attuned lizard "dragons" + Green semi-sapient moving plants, ⚑ the Fae hammered out properly, Blue/White/Black fauna, broken-cycle ecology; gameplay driver: **act-1 bestiary variety** — something to fight besides magic people/constructs/animals until the undead land — culminating in W23 adversary-pack assembly, the only future non-docs item). Canon doc §8 gained a pointer distinguishing deliberately-undefined threads from this to-be-written backlog. The ⚑ design questions (moon cult, faith mechanics, godless causality, creature names/sapience, fae nature) are pre-batched as ONE proposals menu — see the TODO file's batching note. NO engine/data/pack changes, nothing for the bench). Prior: **2026-07-13** (BROKEN CYCLE + FETCH TIMELINE CANON — docs-only, branch `claude/deity-drama-mechanics-mayhz1`: Ben ruled the full broken-cycle mechanics batch via discussion (canon doc §9, rulings 9–17): the **consent model** of death (mechanics failing kill normally — steel/bleeding/beheading; the wasting still kills but agonizingly slowly; game damage/death rules unchanged, ZERO engine implications), **souls return-not-travel** (no afterlife — energy back to the leylines) and stuck-soul **pooling at Black/Green nexuses** (the Black Altar's destabilization = a 2-year pool nearing first overflow = the oneshot's "disturbances"), **god origin = two-leyline convergence + worship** (ten pairs, ten gods, pantheon complete — consuming a sitting god was the only way in; supersedes "origin undefined"), the Fetch's **~150-year timeline** (Fate Coup exploited NOT engineered; Razkael banished ~120y — folklore now; a century of faith-farming; Morrath sealed ~2y — every map crisis status is post-seal) and **monopolization endgame** (farm → pool → war → players remove Power → total Black control → reap → full Investiture monopoly), **undead mix** (revenants/zombies/skeletons/horrors) as act-2 clock + act-3 pull with first breach at the Black Altar as act-1 finale, generational drain, and **Ashara unwoven** (immortal by curse; Razkael decade = suicide pilgrimage; Sylvaneth exiled her for what she IS). Canon doc §1/§1a(new)/§2/§3/§4/§6/§7/§8/§9/§10 + opening doc hook/act-structure updated; remaining ⚑: soul-perception defaults, Withervale priest beat, Ashara's cure, dates are order-of-magnitude. NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-12i** (SESSION-1 RUN-SHEET + WORLD RULINGS — docs-only, same branch: **`EDHA_SESSION_1_SCRIPT.md`** created — the read-at-the-table session 1 ("The Harvest That Won't Die": read-aloud boxes, 7-NPC cast, the Palewater fight statted on the `adversaries.json` schema, clue ledger, per-color leyline tugs) — and Ben's four design rulings from the script review applied (canon §9 rulings 18–20 after the 07-13 merge renumbering): death mechanics **"gate shut, knife works"** (Morrath's sealing jams only the *natural* transition — steel still kills, but nothing collects what leaves → canon §2 block + open thread 9 + the script's Joskin-mercy contingency), the lingering dying kept **rare for now** (ones-and-twos per village), **map scale 4,000 km N–S → 1 px ≈ 1.5 km** with ~80 km/day downriver (canon §5a — the convoy became a **barge flotilla on a 5–6-day run**; the old cart-ford made no sense, the river is the delivery system), and the raid re-contexted as the **Palewater shallows boarding** (the *raiders'* ford — the only wadeable border crossing for fifty miles). NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-12h** (MAP EXTRACTION + PLACEMENT GROUND-TRUTH — docs-only, branch `claude/edha-map-extraction`: extracted the political layer from Ben's `Thycross.procreate` (Apple-chunked LZ4 `bv41` tiles → full-canvas PNGs; decoded vertically flipped by Procreate row order, corrected against `thyrcross.png` at 0.72 IoU), committed `thyrcross-political/-borders/-cities.png` + `thyrcross-labeled.png`. Ben keyed the map's hand-drawn A–J labels to nations, which **overturned most of §5a's adjacency guesses** and added a **tenth nation** (map region G, SW mesa → ⚑ Ashkar, a collapsed state). §5a rewritten as ground truth, Black Altar moved to the Thalendor/Corvaine/Canticle river-nexus, opening-doc sites re-anchored; NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-12g** (CAMPAIGN OPENING + WORLD MAP — docs-only, branch `claude/campaign-opening-hook-178b2m`: session-1 hook + act structure in **`EDHA_CAMPAIGN_OPENING.md`**, Ben's Thyrcross world map committed to `source-materials/maps/` (gitignore `!`-exception added — first-party asset) with ⚑ provisional nation placements in canon doc §5a; NO engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-12f** (CAMPAIGN CANON — Ben ruled on all seven lore questions; **`EDHA_CAMPAIGN_CANON.md`** is now the single source of truth for campaign lore, WorldAnvil retired — see the index line below). Prior: **2026-07-12e** (LORE CANON DIFF — docs-only lore work on branch `claude/edha-countries-plot-mmzg2m`: the recovered Campaign Baseline Canon PDF preserved + diffed against current canon in `EDHA_LORE_CANON_DIFF.md`; no engine/data/pack changes, nothing for the bench — see the index line below). Prior: **2026-07-12d** (PASS-3 FIX BATCH — the whole queued pass-3 worklist: single-target picker + engine-move collision (rulings R1/R2), chat-card state persistence (Flame Surge family), Lay Foundation turn-one sweep, Trade Routes displace-teleport with clicked arrival, Flashpoint advantage enforced, Kindle light 120s attribution, labeled damage riders + burst breakdowns, Coercive Pressure adversaries-only, White/Concordant visible gates + prose, Overgrowth Deflect stacks, Guardian Stance adjacency auto-toggle; deferred with reasons: the 2d20kh garble (needs a screenshot) + the square-Region rework (proposal awaiting Ben's sign-off in the delta); ENGINE + data → BOTH pack rebuilds + relaunch + ⟳ Sync — see the top delta). Prior: **2026-07-12c** (READABLE DARK — Ben's actor-sheet readability design handoff implemented: full dark-palette lift via `--cosmere-color-*` variable overrides in `styles/edha.css` scoped to `.sheet.actor`, texture off, skill-list + budget-bar type bumps, Reserve pill recolor, CharacterSheet MAX_HEIGHT clamp lifted to 4000 + client-scoped sheetScale setting (90–130%); spec bundle committed under `Actor pages design review/`; ENGINE + css → sync + F5, NO pack rebuild; all-visual ⚑ rows for the bench). Prior: **2026-07-12b** (PASS-3 TRIAGE — the two loudest pass-3 Fails root-caused at Ben's live bench: Black Attunement's "Weakened nobody" was GM-HIDDEN tokens (the sweep now accounts for every skip on the card), Cruel Step was the pass-2 pack rebuild never landing (STILL OWED: `deploy-to-foundry.bat` with Foundry closed, watch step 3); `edhaCanSee` hardened to walls-only (v13 darkness/scene-border edges excluded) + `edha.debugSave()` full-session log capture; rest of pass 3 triaged + queued with Ben's rulings — see the top delta; ENGINE-only → sync + F5). Prior: **2026-07-12** (BLACK PASS-2 FIXES — Ben's second in-Foundry Black run: 4 batched rulings, both Isolation movement talents wired, the multi-select-drag false alarm root-caused, the card-legibility family closed — see its delta; ENGINE + data → `foundry-build leyline` + relaunch + ⟳ Sync). Prior: **2026-07-06d** (ATLAS RETIRED, repo-side only — Ben ruled the original browser-side "Leyline Atlas" web app deprecated (everything lives in the Foundry module now); the whole app removed from the tree after a dependency sweep proved the Foundry pipeline touches NONE of it: `index.html`, `src/` (21 files), `.nojekyll`, the two remaining root `Leyline Atlas *.html` snapshots (incl. the 2 MB standalone), `docs/BUILD_FLOW.md`, the `publish.sh`/`publish.bat` Pages publish flow, and the atlas-only data files `edha-inline.txt`/`edha-talents.json`/`glossary.json`. `README.md`/`scripts/README.md`/`validate.js` comments/`package.json` description realigned; TODO item 6 (Vite migration) closed as OBSOLETE. ⚑ `data/deity-resources.json` found orphaned (no consumer anywhere) but KEPT — content-bearing, Ben's call. Everything removed is recoverable from git history. ENGINE UNTOUCHED, no rebuild, nothing for the bench). Recent: **2026-07-06c** (REPO REVIEW + hygiene pass — see the top delta; this header was collapsed per its own superseded-delta policy, older entries → the index below + `HANDOFF_ARCHIVE.md`). Prior: **2026-07-06b** (TEST INFRASTRUCTURE, repo-side only — a zero-dependency unit-test suite (`tests/`: vm-loaded engine helpers + audit.py's own parsers), the `scripts/lint-refs.js` data↔engine cross-reference linter (dangling `edha-*` handler types / kinds / statusIds in authored events, and engine talent-name literals that resolve to nothing), and CI (`validate.yml`) now running ALL the gates — engine `node --check`, validate.js, lint-refs, both test suites, and audit.py — on every PR touching `data/`, `module-src/`, `scripts/`, or `tests/`; ENGINE UNTOUCHED, no rebuild, nothing for the bench).

**Older-delta index (newest first — one line each; the full header-era text is preserved verbatim in `HANDOFF_ARCHIVE.md`, and most dates also have full delta sections later in this doc):**

- **2026-07-14c** — THE TOLLING + SESSION CLOSE (docs-only, same branch; PR opened): item 1 approved verbatim → the dead-in-law rite written into §5b Corvaine (Quiet Wing, past-tense etiquette; regency-stands-on-the-fiction GM hook; primer unchanged — public truth is "the king died"). Corvaine resumes fresh from item 2; remaining queue + open ⚑s checklisted in TODO_WORLDBUILDING W24. NO engine/data/pack changes, nothing for the bench.
- **2026-07-14b** — LORE-FORGE PHASE 3 REWORKED + CORVAINE BATCH 1 (docs-only, same branch): design questions now walked with Ben **in order, by section**, full-text proposals one item at a time, approval precedes every commit (SKILL.md / CLAUDE.md / TODO aligned). Corvaine batch 1 committed: rulings 28–30 — **25% cleared → ~14.1M** (calorically whole under layer 1 → the raids are hospice-burden + treasury desperation), **the old king tolled dead-in-law** (the regency stands on the fiction), **Malcurr's coin = the mortal side of Tyrith's power-grab beginning** (thread-1 vagueness softened; Warlock-unknowing default ⚑). Gazetteer `land_budget` filled. Section-3 culture items pending one by one. NO engine/data/pack changes, nothing for the bench.
- **2026-07-14a** — CORVAINE DIVE: MEASURED + AUDITED, GATE PARKED (docs + map tooling, branch `claude/thalendor-eastern-neighbor-dive-9oyeuz`): 776,376 km² / **9.1% water** measured via new `scripts/map/water_frac.py` (Thalendor-calibrated); partial gazetteer `land_budget` (dials gated). Derived: a layer-1-only nation at 85% yield is **calorically whole** → the raids are care-burden + state finance, not starvation. All prose UNWRITTEN pending Ben's answers — **the menu (cleared fraction → population, why a child king, why Malcurr pays, plan-of-content) is parked in TODO_WORLDBUILDING W24.** NO engine/data/pack changes, nothing for the bench.
- **2026-07-13j** — RATIONS MATH CLOSED (docs-only, same branch): Ben — livestock is a fully-convertible buffer, so the human-available fraction is ~100% (killed the spurious "human-edible-grain fraction" dial). Humans stay fed until total production < 9.56T need = below **23.4% of normal yield**; at 42.5% now humans are whole, livestock craters ~75% (3.43M → ~0.85M units), mass death is the cliff ~19 yield-points below (matches ruling 19). Updated ruling 27 + gazetteer + §5b + lore-forge Phase 4b (anti-spin caution). §10 rations items resolved. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13i** — THALENDOR CALORIE BALANCE + FISH RULING (docs-only, same branch): ruling 27. Fish hit by Layer 1 (environmental canon) but calories ignored → fisheries flag resolves down, 13.1M stands. Calorie balance: 16.34M ha × 2.5M kcal/ha = 40.85T kcal/yr; humans 9.56T (23%); remainder → **~3.43M cattle-equiv livestock units**. Cross-check **corrected an error**: famine at 42.5% production (17.4T) still exceeds human need (9.56T) — the ~77% livestock/fodder buffer collapses first, so the "~5.5M fed / 7.5M gap" line is retracted; mass death is the cliff ahead. New dial: human-edible-grain fraction. Gazetteer calorie fields + lore-forge Phase 4b cross-check added. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13h** — FAMINE SEVERITY REFRAME + THALENDOR LAND BUDGET (docs-only, same branch): (1) severity reframed as a **deficit** — 57.5% shortfall vs ~15% = **≈3.8× deeper** (ruling 25, §1a, §5b updated; "half the yield" kept as the equivalent). (2) **Land-budget method, ruling 26** (populations derived from resources): Thalendor = 1,076,400 km² inside the border, ~12% water (measured), dials 15% cleared + Root Network 60%×1.25 → **~142,085 km² raw / ~163,400 effective** farmland; density **80/km² → ~13.1M** (famine feeds ~5.5M). ⚑ fisheries uncounted (farmland floor). Farmland pass folded into `lore-forge` (Phase 4b); one nation's full-depth pass = one session. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13g** — THALENDOR RULINGS + FAMINE NUMBERS (docs-only, same branch): ruling 25 sets the hard figures — 15% blight loss / 50% Thalendor drain sprout-fail / ~42.5% Thalendor yield (twice as deep as elsewhere) / vats overwhelmed; livestock + rationing deferred to a population-numbers pass. §5b Thalendor ratified; session/opening names confirmed (⚑ + name_provisional cleared); Harrow mercy-killing plot CUT (he keeps the Shepherd's rite — new Morrath folk-epithet registered) and "giving back" scene beat CUT; field imagery fixed to thin-drain + 15%-blight. Map PNG NOT regenerated (only nation-scoped provisional flags matter to render). NO engine/data/pack changes, nothing for the bench.
- **2026-07-13f** — FAMINE LAYER-1 MECHANISM FIX + LORE-FORGE SKILL (docs-only, branch `claude/famine-layering-review-igi97r`): §1a layer 1 recast from the model-contradicting "harvest never finishes / ripening is a small death" to **the blight that never clears** (ruling 24) — crop blight + livestock murrain are slow deaths that no longer finish, the arable base ratchets down, the agricultural face of the hospice-nation persistence (no new rule; bites by margin). Soil/return-leg cause considered and declined. Swept §5b Lunavar (calendar regrounded in doctrine + severity clause), primer, session-1 opening, TODO W19/W22; session-1 blight imagery was already correct. New **`lore-forge`** skill (the worldbuilding counterpart of session-forge: derive-from-a-ruling, logic-audit vs the death model, batch-as-a-GATE, §5b depth standard, dependent sweep) + `CASE_STUDY.md` (this famine fix worked through). NO engine/data/pack changes, nothing for the bench.
- **2026-07-13e** — CULTURE PASS + CHARACTER-CREATION PRIMER (docs-only, branch `claude/worldbuilding-character-creation-d01f35`): worldbuilding backlog **section A done** — canon **§5b** culture blocks for all ten nations + W10 connective tissue (naming conventions from NPC exemplars, the "giving back" death-libation as the shared continental custom, border blending, GM one-scene checklist), terrain per §5a ground truth (three TODO descriptors corrected; ⚠ W18 re-siting note). New player-safe **`EDHA_PLAYER_PRIMER.md`** for character creation, spoiler-checked vs the session-1 wall. Session-1 script aligned to the session-forge `RUN_SHEET_TEMPLATE.md` (new §8 player-facing text incl. Khor's notice handout, §9 briefs + Foundry hand-off, ⚑ batch → §10). New ⚑: Lunavar "Lantern" doctrine (provisional; thread §8.4 untouched), Malcurr upland-lakes synthesis, Lunavar naming, the optional Withervale libation beat. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13d** — SESSION-BUILDING SKILLS (docs-only, same branch): the session-1 build distilled into repeatable workflow. **`session-forge`** (11 phases; the hard rules each earned by a real failure: geography measured before fiction — the cart-ford/"it's a day" catches; premise stress-tested before writing — the Joskin test; every judgment call batched into ONE menu with recommended defaults; critical clues un-missable; merged-main sync check against parallel-session drift — the §9-numbering/Harrow collision) + **`session-debrief`** (freeform table notes → state; table rulings are canon the moment spoken and get §9 rows; contradictions between table and written canon are SURFACED, never silently patched; ⚑ names spoken aloud at the table become fixed). New **`EDHA_CAMPAIGN_STATE.md`**: the play ledger both skills pivot on (canon = what's TRUE, state = what's HAPPENED — know-vs-suspect tracking feeds the assembly-rule reveal; clocks table tracks the soul-pool/coup/drain/war). Support files: `RUN_SHEET_TEMPLATE.md` (the frozen session-1 shape incl. player-safe §8), `CASE_STUDY.md` (the six catches), `MAP_CHEATSHEET.md` (measure/locate/add-a-place/re-extract flows). CLAUDE.md trigger paragraph + map table updated. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13c** — MAP DATA PIPELINE (repo tooling + docs, same branch): built the between-maps infrastructure Ben asked for ("I hand-draw in Procreate; sessions need something easier to see and keep straight"). Principle: **PNGs for humans, JSON for sessions** — geometry questions get *queried, never eyeballed* (the 07-12h session's failures — the flip, the guessed placements, the letter-key collision, "it's a day" for a 430 km run — were all eyeballing). New **`source-materials/maps/thyrcross.map.json`** gazetteer (canvas+scale+.procreate staleness stamp, 10 nations with competitive-flood-fill-traced polygons + both letter keys, 29 cities polygon-assigned to nations, session sites, the Palewater channel as a 2,694 km skeleton-traced polyline, routes) + **`scripts/map/`**: `extract_procreate.py` (committed decoder — zero workflow change for Ben, saves to OneDrive as always), `trace_regions.py`, `trace_rivers.py`, `measure.py` (dist/route/locate + travel modes), `render.py` (labeled maps regenerate deterministically from data), `make_viewer.py` → **`viewer.html`** (Ben double-clicks, pans/zooms, clicks a spot, copies the exact "(x, y)" — ends descriptive coordinates), `lint_map.py` (in-canvas checks, anchor-in-own-polygon, doc-coordinate drift vs gazetteer — **added to CI** validate.yml, which also gained source-materials/maps + EDHA_*.md trigger paths; CLAUDE.md map table gained the row). **First measurement paid off immediately**: the drawn Palewater meanders ~2.1× straight-line — the committed session-1 sites weren't even ON the river (Elmsworth 290 km inland) and "5–6 days" was fiction. Ben ruled (canon §9 rulings 21–23 after the merge renumbering): **two weeks on the water** (sites snapped onto the channel: Elmsworth (1290,1470) head-of-navigation port beside drawn city-15, Ford (1422,1794) @935 channel-km ≈ day 8–9, Withervale (1480,1925) @1,339 km ≈ day 12, Black Altar snapped to (1449,2337) on the confluence), **barge_down 110 km/day** (current + night drift; supersedes 80), river named **the Palewater** ⚑, other speeds confirmed (30/40/30). Canon §5a (tooling pointer + scale block + Altar coords), opening doc §2, and the session script all retimed; `thyrcross-labeled.png` now regenerated FROM the gazetteer. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13b** — WORLDBUILDING BACKLOG (docs-only, branch `claude/worldbuilding-todos-7cuc09`): **`TODO_WORLDBUILDING.md`** created — 23 session-sized items across Ben's three fronts: per-nation culture blocks W1–W10 (rituals/quirks/differentiators, proposed canon §5b), lived faith W11–W16 (per-god rites as feeding mechanisms, sacred geography on nexuses, sensory prayer canon, ⚑ faith mechanics, ⚑ godless causality), leyline ecology W17–W23 (attunement framework; Ben's seeds: Red lizard "dragons", Green moving plants; ⚑ the Fae; Blue/White/Black fauna; broken-cycle ecology; W23 = downstream act-1 adversary-pack assembly). ⚑ rulings pre-batched as one menu. Canon §8 pointer added. NO engine/data/pack changes, nothing for the bench.
- **2026-07-13** — BROKEN CYCLE + FETCH TIMELINE CANON (docs-only, branch `claude/deity-drama-mechanics-mayhz1`): canon doc **§1a** (new) + rulings 9–17 nail what the deity drama does on the ground. Death is mechanical (the **consent model**): steel/bleeding/beheading kill normally — game rules unchanged, zero engine implications — while the wasting (disease/starvation/age) kills agonizingly slowly now that Morrath's mercy no longer finishes it; plague nations reframed as **hospice nations** (the dying accumulate; epidemics can't burn out). Souls **return, not travel** — energy back to the leylines — so every post-seal death **sticks**, pooling at Black/Green nexuses: the Black Altar's destabilization IS a two-year soul-pool nearing first overflow (= the oneshot's "disturbances"; first breach = act-1 finale; undead mix revenants/zombies/skeletons/horrors as the act-2 clock and act-3 pull). God origin now canon: **a deity = two-leyline convergence + sustained worship** — ten pairs, ten gods, the pantheon is complete, so the Fetch's consumption of Maelith was the only way in. Its full engine: entered ~150y ago when Fate was blind (coup EXPLOITED not engineered — Olvarra's guilt intact), banished Razkael ~120y (grandma's-grandma folklore), farmed faith for a century, sealed Morrath ~2y ago, and is now winding Tyrith up so the war produces souls, topples Verdannis, and gets Power removed *by the heroes* → total Black control → reap the pools → **full Investiture monopolization**. Famine keeps two-layer causality (harvest-never-finishes everywhere + Green drain in Thalendor only; Lunavar = layer 1 alone). **Ashara is immortal by curse — unwoven** at the coup (no thread, no path back; Razkael decade = suicide pilgrimage; Sylvaneth exiled her for what she is). Remaining ⚑ (canon §10 + opening §4): perception defaults, Withervale priest mercy-harvest beat, Ashara's cure via restored Morrath, order-of-magnitude dates. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12i** — SESSION-1 RUN-SHEET + WORLD RULINGS (docs-only, same branch): **`EDHA_SESSION_1_SCRIPT.md`** — the runnable session 1 ("The Harvest That Won't Die"): read-aloud boxes, 7-NPC cast (Marshal Vareth Khor canon, the rest ⚑ placeholders), the Palewater fight statted on the `adversaries.json` schema (Sgt. Halden Roek rival + Corvaine Raider minions with break/mercy behavior, talk outs, the un-missable Malcurr-gear clue), Withervale's four wrong things, the clue ledger, per-color leyline tugs. Ben's script review surfaced four world holes, ruled via prompts (canon §9 rulings 18–20 after the 07-13 merge renumbering): (1) **"gate shut, knife works"** — Morrath's sealing jams only the *natural* transition (age/sickness/starvation/the rite); outright destruction still kills, but **nothing collects what leaves** → new canon §2 mechanics block, open thread 9 (the unharvested dead), and the script's if-a-player-mercy-kills-Joskin contingency (it *takes*, Harrow's rite half-lands, no punishment); (2) **the lingering dying stay rare for now** — ones-and-twos per village, mass-scale horror banked for the deep-famine/plague nations; (3) **map scale** — Thyrcross ≈ 4,000 km N–S → **1 px ≈ 1.5 km**, downriver ≈ 80 km/day (canon §5a): the session-1 convoy became a **barge flotilla on a ~430 km / 5–6-day run** (Ben's catch: the old cart-ford logistics made no sense — an intra-Thalendor delivery never crosses the border river; the river IS the delivery system); (4) the raid re-contexted as the **Palewater shallows boarding** — the *raiders'* ford, the only wadeable border crossing for fifty miles, barges poling single file through the kill-box. Opening doc §2 (site table, brief 1) updated to match. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12h** — MAP EXTRACTION + PLACEMENT GROUND-TRUTH (docs-only, branch `claude/edha-map-extraction`): extracted the political layer from Ben's `Thycross.procreate` on his PC (the earlier cloud sessions couldn't see his filesystem — this is the task `EDHA_MAP_EXTRACTION_TASK.md` set up, now deleted). Procreate `.lz4` tiles are Apple-chunked LZ4 (`bv41`/`bv4-`/`bv4$` magic, 64 KB blocks with a carried dictionary — plain `lz4.block` chokes, a tiny pure-Python decoder handles it); reassembled the **Country Borders / Cities / Political Map** layers to full-canvas 2865×3399 PNGs. They decoded **vertically flipped** (Procreate tile-row order); confirmed against `thyrcross.png` by landmass IoU (flipV 0.72 vs 0.55 orig) and un-flipped. Committed: `thyrcross-political.png` (fills), `thyrcross-borders.png` (dashed borders), `thyrcross-cities.png` (29 markers), `thyrcross-labeled.png` (composite w/ nation names + 4 session sites); `*.procreate`/`*.psd` gitignored (230 MB, stays in OneDrive). **Ben keyed the map's hand-drawn red A–J labels to nations**, which overturned most of the 07-12g §5a *guesses*: Malcurr NE (was NW), Vorsk NW (was SW), Lunavar mid-west (was SE), Goldenport west coast (was NE), Canticle SE (was east-central); Thalendor/Kettavar/Sylvaneth unchanged. Bonus: "Vorsk raids Lunavar **to the south**" is now literally correct (retired a ⚑). **A tenth nation** appeared — map region G (SW mesa) with no counterpart in canon or the legacy PDF (both had exactly nine); added as **⚑ Ashkar**, a *collapsed/anarchic state* (Ben's climate pick; name + collapse-cause still ⚑). Black Altar Crossing moved to the **Thalendor/Corvaine/Canticle** river-nexus (1400, 2280) — the old Goldenport tripoint broke once Goldenport landed on the far west coast. Canon §5 gained the 10th nation + a "map label ≠ old-PDF letter" warning; **§5a rewritten as ground truth** (was ⚑ guesses); §10 open-items refreshed; `EDHA_CAMPAIGN_OPENING.md` §2 sites re-anchored down the real border + §4 batch updated; 29 city markers grouped ⚑ per nation (unblocks city-scale maps once capitals are picked). NO engine/data/pack changes, nothing for the bench.
- **2026-07-12g** — CAMPAIGN OPENING + WORLD MAP (docs-only, branch `claude/campaign-opening-hook-178b2m`): the campaign's session-1 plan lives in **`EDHA_CAMPAIGN_OPENING.md`** — hook "The Harvest That Won't Die" (relief-convoy escort in Thalendor; the first clue is the broken death-cycle, not the hunger — origin/build-agnostic since players haven't picked), three road-level battle-map briefs Ben can draw now (⚑ Palewater Ford ambush, ⚑ Withervale famine village + silent Last Harvest shrine, Black Altar Crossing act-1 finale), and the famine → Anaveth → false-villain-Tyrith → three-witness-assembly → Fetch-reveal act ladder built on canon §2's assembly rule. Ben's **Thyrcross world map** committed to `source-materials/maps/thyrcross.png` (+ `thyrcross-labeled-proposal.png`; gitignore gained the invited `!`-exception — first-party asset, not the third-party material the 07-06 policy targets). Canon doc gained **§5a**: all nine nations mapped to the map's dashed-border regions from canon adjacency constraints — ALL placements ⚑ until Ben confirms (open: west-moor → Thalendor?, SW peninsula → Vorsk?, Vorsk→Lunavar raid axis reads east not south, Goldenport capital at the deep inlet, the three placeholder names, city placements for city-scale maps). NO engine/data/pack changes, nothing for the bench.
- **2026-07-12f** — CAMPAIGN CANON ESTABLISHED (docs-only, same branch): Ben answered all seven §6 rulings from the diff doc via question prompts (keep the infiltration antagonist but drop all Shard cosmology; Verdannis's search taps Green because he's searching FOR the broken cycle; Order-vs-Power = law vs. throne; the true Maelith was ALWAYS Black/Blue calculated madness — the Impostor's tell is direction, not order; Sylvaneth = the PDF's Fae utopia, Verdannis-devotion moves to Thalendor; gods gendered per the live tree text, ⚑ Maelith provisionally "it"). Biggest ruling: **WorldAnvil is retired** — **`EDHA_CAMPAIGN_CANON.md`** is now the single source of truth for all campaign lore (pantheon agendas, the 9 nations, NPCs, oneshot frame, open threads, rulings log); it supersedes the baseline PDF text AND the ten article exports (kept as historical artifacts). CLAUDE.md's map table gained the canon row. Follow-up rulings same day: Maelith is "it" (confirmed), and the antagonist's GM name is **"the Fetch"** (folklore: an exact supernatural double whose appearance is an omen of death — doubly apt given the Chaos tree's Omen resource); both applied throughout the canon doc, no ⚑ left on either. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12e** — LORE CANON DIFF (docs-only, branch `claude/edha-countries-plot-mmzg2m`): Ben's recovered **Campaign Baseline Canon v1.0** PDF (the original two-Shard brainstorm: Valor pantheon, Ambition-Splinter U3125 antagonist, countries lettered A–I) preserved (extracted text; PDF itself gitignored per the no-binaries policy) to `source-materials/legacy-uploads/Campaign_Baseline_Canon.txt` and diffed against current canon in **`EDHA_LORE_CANON_DIFF.md`**. Headlines: current project has NO Shard cosmology (Ben-confirmed; zero Valor/U3125/Splinter refs outside legacy-uploads); Verdannis is Sovereignty/"Crowned Arbiter" (was Nature/"Rootfather"), Tyrith Black/Red (was Blue/White), Maelith Black/Blue (was mono-Black); all ten WorldAnvil article exports are stale PDF-era snapshots; PDF countries A–I mapped one-to-one to Kettavar/Malcurr/Corvaine/Thalendor/Goldenport/Vorsk/Lunavar/Canticle/Sylvaneth. Seven batched lore rulings await Ben in the doc's §6. NO engine/data/pack changes, nothing for the bench.
- **2026-07-12d** — PASS-3 fix batch (R1–R4 wired; 14 fixes; card persistence, collision, teleport, visibility gates)
- **2026-07-12c** — READABLE DARK actor-sheet pass (palette variable overrides; resize + sheetScale)
- **2026-07-12b** — PASS-3 triage + vision-test root causes (hidden tokens; pack-rebuild gap; debugSave)
- **2026-07-12** — BLACK pass-2 fixes (second in-Foundry Black run; movement talents wired)
- **2026-07-06** — KNOWLEDGE TRANSFER (root CLAUDE.md + the test-pass-fixes skill)
- **2026-07-05** — BLACK test-pass fixes (Ben's first full in-Foundry Black run)
- **2026-07-04** — ENGINE BACKLOG BUILT
- **2026-07-03c** — ENGINE BACKLOG CONSOLIDATED
- **2026-07-03b** — ORDER (Tessavain) deity tree wired
- **2026-07-03** — KNOWLEDGE (Gnothis) deity tree wired
- **2026-07-02c** — POWER (Tyrith) deity tree wired
- **2026-07-02b** — CIVILIZATION (Kethane) deity tree wired
- **2026-07-02** — DEATH (Morrath) deity tree wired
- **2026-07-01** — SOVEREIGNTY (Verdannis) deity tree wired
- **2026-06-17** — DESTRUCTION (Razkael) deity tree wired
- **2026-06-16c** — GREEN TREE COMPLETE
- **2026-06-14f** — BLUE / Foresight wired → BLUE TREE COMPLETE
- **2026-06-14e** — BLUE / Illusion wired
- **2026-06-14d** — BLUE / Calculation wired
- **2026-06-14c** — WHITE / Accord wired
- **2026-06-14b** — WHITE / Bulwark
- **2026-06-14** — WHITE / Coordination wired
- **2026-06-13c** — BLACK tree wired (Isolation + Ritual + Subjugation; 06-13b = the reusable tools)
- Earlier (already one-liners): 2026-06-13 (Weakened rework → ends at the creature's next turn + generic timed-status expiry), 2026-06-12 (pack-path schism fixed + workflow hardening), 2026-06-11b (V3 ENGINE PASS), 2026-06-11 (playtest-PC triage), 2026-06-10b (playtest-1 prep — §8b), 2026-06-09 (RE-REFACTOR: behavior on talents). [Superseded deltas collapsed to one-liners below.]


**NEXT SESSION (updated 2026-07-04): ALL 15 TREES ARE COMPLETE and the BUILDABLE ENGINE BACKLOG IS BUILT — 5 leyline colors + all 10 deity trees, plus the full §9a/§9b pass (07-04: 5 shared primitives + 6 tree-local hooks, all engine-only). The ONLY remaining work is manual, on the Foundry machine: (1) the ONE-TIME DEPLOY at the top of `EDHA_FOUNDRY_TEST_CHECKLIST.md` — nothing merged after the 06-16 Green build is live yet; the deploy block covers module-src-sync push (now includes the 07-04 module.json change — full relaunch already required) + `foundry-build leyline` + `foundry-build deity` + validate-packs + relaunch + ⟳ Sync in one pass; (2) the BENCH pass — work the checklist tree by tree, ⚑ rows first, INCLUDING the new "Engine backlog pass" section (its ⚑ rows carry the 07-04 unverifiables: the cosmere weapon `system.range` shape, the injury Item schema, Shatter prompt spam, and the Civ enemy-cost GO/NO-GO). What's left in §9 after 07-04 is exclusively: §9c blocked-on-system, §9d bench-gated fallbacks (fire only if the bench pass fails), §9e manual-by-design, §9f post-playtest balance — nothing buildable remains.**

> **Branch note (2026-06-14d):** Calculation + Illusion were built ON TOP of the open White PR #36 (`feat/white-leyline-foundry`), because they reuse White's `edhaApplyTimedStatus` / disorient card / `set-flag` relay and the Blue Composed AE that the White Bulwark rebuild baked into the leyline pack. When shipping Blue, branch off whatever `main` contains White (merge #36 first, or stack the PR on it).
> **PROCESS note (06-14e):** the first Illusion attempt was reverted because it shipped without sign-off and shortcut the summon talents (Barricade → a text note, Phantom Double → skipped). REWIRED after an explicit per-talent proposal Ben approved. Lesson reinforced: propose the full per-talent data model BEFORE coding, especially anything summon/placeable.

---

## 2026-07-12f DELTA — PASS-3 UNIQUE FIXES (reconciled ONTO the parallel 07-12d/#68 batch; the 6 root causes #68 missed; ENGINE + data → `foundry-build leyline` + relaunch + ⟳ Sync)

**Reconciliation note (read first).** Two sessions worked pass-3 in parallel. The **07-12d/#68**
batch (already in `main`) closed ~13 of the queued items (single-target prompt, Flashpoint,
Coercive, White visible gates, Overgrowth, Guardian Stance `edhaGuardianStanceSweep`, Kindle,
engine-move collision `edhaTokenAtDest`, teleport, Trade Routes, card persistence
`edhaMarkCardResolved`, Lay Foundation combat-start, rider legibility). This delta adds ONLY the
six root causes #68 did **not** catch — verified absent from `main` before landing, and the
duplicated work was dropped (my earlier stacked branches #69/#71 are superseded and closed). Where
we both implemented the same thing, `main`'s (#68's) version was kept; my duplicate combat-start
sweep was removed during the graft.

### The 6 unique fixes (each confirmed still-broken in `main`)
- **Rule-id validation (Cruel Step + Sudden Growth) + lint guard.** `main` still had the 15-char
  `CruelStepMove01` / `SuddnGrwthBrst1` — invalid Foundry `DocumentIdField`s the system SILENTLY
  drops at load (console DataModelValidationError only), so both talents were inert. Renamed to
  16-char ids; `lint-refs.js` now rejects any authored rule id that isn't exactly 16 alnum (+ key↔id
  mismatch). **This is why Cruel Step "did nothing" across passes** — #68 never found it. DATA.
- **Predatory Patience context-case gate (`edhaTestCtxMatch`).** `main` still compares lowercase
  `appliesTo` against the system's CAPITALIZED roll context (`'Attack'`) raw, so the +[Die] rider
  matched NOTHING on every roll. Case-normalized helper + pinned tests. ENGINE.
- **Formula-bar normalizer (`edhaTidyFormula`).** The `2d20kh+6)` garble — display pass on every
  `.dice-formula` (spaces operators, drops unmatched closers). Root-caused to `Roll.getFormula`
  (no separators) + the roll dialog's unvalidated Temporary-Bonus splice. ENGINE + tests.
- **Region rework** (Pyre + Green terrain are Foundation-shaped SQUARES; GM square-by-square spread;
  player Extinguish; Green Draw Mana click-to-place within Attunement Range). `edhaSnapCellRect` /
  `edhaSquareVisual` / `edhaGrowTerrainSquareGM` / `edhaRemoveTerrain` + rect support in
  `edhaPointInRegion` / `edhaGrowTerrain`. #68's Lay Foundation combat-start sweep is kept (mine
  dropped). ENGINE.
- **Draw Mana Black player-safe card.** `main` still printed "Weakened N of M within 30ft" — leaks
  hidden-enemy counts (Ben ruling). Public card now counts only visible enemies; hidden/wall skips
  whisper to the GM. Plus `edha.debugsave` lowercase alias. ENGINE.
- **Readable Dark follow-up**: sheetScale 130% frame-scaling (content spilled the fixed frame),
  hover fill-lift, palette expanded to the whole dark theme. CSS + one render hook. Not in #68.

### Known limits / couldn't self-verify (no Foundry session) — ⚑
All rows in the checklist's "Pass-3 unique fixes" section. Highest risk: the region rework's
square-spread adjacency on Ben's grid, and that the graft didn't leave a latent double with #68's
overlapping handlers (swept for duplicate function defs + the one combat-start double, both clean).

---

## 2026-07-12d DELTA — PASS-3 FIX BATCH (rulings R1–R4 wired, 14 items closed, 3 deferred with reasons; ENGINE + data → `foundry-build leyline` + `foundry-build deity` + relaunch + ⟳ Sync)

The queued pass-3 worklist (07-12b delta), fixed. Authored data changed in `leyline-red.json`
(Flashpoint note), `leyline-white.json` (Guardian Stance manual AE removed; White Attunement +
Concordant Presence "you can see"), `deity-life.json` (Overgrowth note) and `data/leyline.json`
prose — so this batch NEEDS both pack rebuilds + ⟳ Sync.

### Fixes (one bullet per root cause; ⚑ = bench-verify, all of them — no Foundry here)
- **Single-target gate (R1, REUSABLE):** `EDHA_SINGLE_TARGET` (Withering Ray, Verdant Mend) — with
  >1 token targeted the use cancels BEFORE cost and a whispered picker card lists the targets; click
  one → retargets and re-uses. Explains Verdant Mend's mystery Trooper heal (stale target lock). ⚑
- **Engine-move collision (R2, REUSABLE):** `edhaTokenAtDest` + occupied-destination backstep inside
  `edhaComputeMove` — every engine slide/push (Cruel Step, Unnerving, Shockwave) now stops short of
  an occupied square; manual drags untouched per R2. (The stacked pass-2 Troopers were also Flame
  Surge's "3 targets, 2 visible".) ⚑
- **Card-state persistence (REUSABLE):** `edhaMarkCardResolved(messageId, label)` stamps resolution
  ON the message (GM relay for non-authors) and a render hook re-disables its buttons everywhere,
  forever. Wired: burst Detonate/Cancel (Flame Surge's "Detonating…" → "Detonated ✓", survives F5),
  Unnerving push, generic trigger cards, the new picker. Deliberately NOT wired: Trade Routes'
  Teleport (once-per-turn by design), Puppeteer cues. ⚑
- **Lay Foundation turn-one:** the buff watcher rides cosmere's activation FLAG CHANGES, and nobody's
  flag has changed yet at combat start → a `combatStart` sweep now runs `edhaFoundationTurnStart`
  for every combatant. ⚑
- **Trade Routes teleports for real:** v13 animates plain updates along a wall-constrained walk (the
  "stuck on a wall" report). Now `doc.move({action:"displace"})` — core's own unconstrained teleport
  action — with the arrival point CLICKED inside the destination Foundation (Ben's spec), occupancy-
  checked; the GM move-token relay honors teleport too. ⚑ (also: Dread-veto interplay on displace)
- **Flashpoint advantage ENFORCED:** generic `effect.nextTestMod` on trigger cards → the confirm
  click arms `edhaSetNextTestMod` (skill=red). The primitive existed since the Red Key; "manual
  reminder" no longer defensible. Authored note updated. ⚑
- **Kindle light at table pace:** the dealer-attribution breadcrumb window was 15s — the GM reads the
  card before clicking Apply, so the light never fired. Now 120s. ⚑
- **Rider legibility (REUSABLE, the 07-05 label family continued):** `edhaRiderParts` — every
  `edha-damage-rider` term is flavor-labeled `(formula)[Talent]` in rollDamage, and burst cards print
  the full breakdown ("= 9 (2d6) + 3 (red) + 2 (Kindle) → 14 energy") — Set Charge's opacity row. ⚑
  (flavor annotations inside the system's overrideFormula pipeline are bench-unverified)
- **Coercive Pressure:** adversaries-only (disposition gate vs the owner) — allies spending focus no
  longer hand out the debuff.
- **White Attunement:** visible-allies gate + per-reason skip accounting (exact mirror of Black);
  card text + `leyline.json` prose now say "allies you can see". ⚑
- **Concordant Presence:** `edhaCanSee` on BOTH the triggering ally and the grant recipients ("too
  strong otherwise" — it triggered through walls); card + prose updated. ⚑
- **Overgrowth +1 Deflect (stacks to 3) ENFORCED:** each Overgrowth heal steps one AE 1→2→3 on the
  healed creature (`system.deflect.bonus` — the same DerivedValueField `.bonus` the defense buffs
  use); clears at combat end (Kindle convention). Authored note updated. ⚑
- **Guardian Stance auto-toggle (ruling E re-litigated):** GM-side debounced adjacency sweep manages
  a +1 Deflect AE on the owner and every adjacent living ally as tokens move; the authored manual
  toggled-OFF AE is REMOVED (no double-stack). Ben's "Deflect shows Armor" was the deflect SOURCE
  config label — the AE key was always right. ⚑
- **Trigger cards tightened (Mender's Instinct row):** one-line header, and the "target the creature"
  instruction only renders when the effect actually reads user targets (Mender's heals its victim —
  the instruction was wrong there, not just wordy).

### Deferred, with reasons
- **`2d20kh+6)` fold garble** — not reproducible from the code (no engine path builds that string);
  the checklist row asks for a screenshot on recurrence.
- **Pyre / Green terrain / Foundations → square-Region rework** (expansion square-by-square, player
  extinguish, Foundations-as-Regions): placeable-design work — per the 06-14e PROCESS note it ships
  only after Ben approves a per-talent model. **Proposal for sign-off:** (1) Pyre + Green Attunement
  terrain + Foundations all become click-placed SQUARE Regions (Foundation-sized); (2) Pyre gains an
  owner's-turn "expand" card — GM clicks an adjacent square, the Region grows by exactly that square;
  (3) the Pyre card carries an owner-clickable "Extinguish" button; (4) Foundations migrate
  Drawing→Region with behaviors (tokenEnter/turnStart replace the point-in-drawing math; Trade
  Routes/Bastion/Bonds re-read from Regions). One dedicated session, bench-gated.
- **Red Attunement card format** — verified: the Red line uses the same Draw-Mana card format as
  every other color; re-flag with specifics if it still reads wrong at the bench.

### New REUSABLE primitives (indexed)
Single-target gate (`EDHA_SINGLE_TARGET` + picker card) · `edhaMarkCardResolved`/`edhaMessageIdOf`
(card persistence) · `edhaTokenAtDest` + occupied-backstep in `edhaComputeMove` · trigger-card
`effect.nextTestMod` · `edhaRiderParts` labeled riders · the Guardian adjacency-AE sweep pattern ·
`edhaMoveTokenTo(..., {teleport:true})` displace mode.

---

## 2026-07-12c DELTA — READABLE DARK actor-sheet pass (design handoff option 1b; ENGINE + css → sync + F5, NO pack rebuild)

Implemented Ben's actor-sheet readability handoff (`Actor pages design review/design_handoff_actor_sheet_readability/README.md` — committed with this delta; values there are FINAL, don't re-derive).
The cosmere dark sheet's palette comes from `--cosmere-color-*` variables on
`.cosmere-theme-default.theme-dark` (system `output.css` ~L5620) — the whole palette change is a
variable-override block in `styles/edha.css`, scoped to `.sheet.actor` (character + adversary),
covering both theme-class placements (body or sheet element). Mapping is 1:1: sheet `#1a2338`
(texture image off), accent `#cbb995`, base-1..5 lifted one step, text-main `#e8ebf3`, text-sub
`#dcdac8`, faded `#a89d82` (now AA). Type bumps: `app-actor-skill` 10→11.5px; edha budget bar +
⟳ Sync button 11→13.5px (+ spec colors); Reserve pill lifted (engine inline style). Engine side:
the system's CharacterSheet clamps resize at MAX_HEIGHT 900 — lifted to 4000 at first render
(width stays pinned at 800 by design; the layout is built for it), `.sheet-content{flex:1}` fills
the extra height, and a new client-scoped **sheetScale** setting (90–130%, default 100) zooms the
window content per user.

### Known limits / couldn't self-verify (no Foundry session) — ⚑ (all visual)
- ⚑ Full-sheet palette sweep vs the spec PNG (`option-1b-readable-dark.png`) — esp. hover states
  that lighten panel fills: if any hover was hardcoded vs the old `#0d172f`-era fills, it may now
  read flat (spec §Interactions names this risk; report, don't guess values).
- ⚑ Drag the sheet taller than 900px: content column fills (no letterboxing); tab bodies stretch.
- ⚑ sheetScale 110/130%: content zooms, no clipped chrome; module settings show the slider.
- ⚑ Adversary sheet inherits the palette (shares `.sheet.actor`) — confirm it looks right too.

---

## 2026-07-12b DELTA — PASS-3 TRIAGE + vision-test root causes (hidden tokens gated the Weaken; the pass-2 pack rebuild never landed; ENGINE-only → sync + F5 — but the pass-2 `foundry-build leyline` + ⟳ Sync is STILL OWED, see below)

Ben ran **pass 3** (Black re-test + White/Red/Green/Kethane/Anaveth/Razkael, results in the xlsx pass-3
columns) same-day after the pass-2 fixes, then a follow-up **vision-test bench** with a full boot-to-end
console log (`tests/test-evidence/7-12-2026/`). This delta closes the two loudest pass-3 Fails and ships
the diagnostics that found them; the REST of the pass-3 worklist is triaged and queued (next section).

### Rulings (Ben, 07-12, interactive)
- **R1 — single-target talents:** when >1 token is targeted, a CHAT-CARD PROMPT picks one of the
  selected targets (NOT a hard block — a stray selection can be off-screen/overlapped and invisible
  to a human). Reusable primitive, queued; Withering Ray + Verdant Mend are consumers #1/#2.
- **R2 — token stacking:** collision prevention applies to ENGINE moves only (no `preUpdateToken`
  veto on manual drags). Queued.
- **R3 — THP display:** the separate teal "4/4" THP pool next to HP is fine as-is.
- **R4 — senses range vs sight (rules alignment):** per Ben's rules text, normal conditions = assumed
  seen; senses RANGE only matters when vision is obscured (GM-judged). `edhaCanSee` already matches
  (walls + hidden only, never vision range/lighting) — now documented on the helper and in the index.

### Bug root causes (pass-3 Fail rows closed this session)
- **Black Attunement "no enemies Weakened at all" = GM-HIDDEN tokens, not code.** Bench probe
  (`console log for vision test`): both "valid" Troopers reported `hidden=true` — walls-only and
  current-config collision both false. `edhaCanSee` correctly treats hidden as unseen; the sweep
  silently skipped them and the card just said "Weakened 0". THE REAL DEFECT WAS SILENCE → the Draw
  Mana Black line now accounts for every enemy in range by skip reason ("Weakened 1 of 6 … — skipped
  3 with an ally adjacent, 2 hidden"). `edhaCanSee` also logs its reason under `edha.debug`.
- **Predatory Patience "broke entirely" = downstream of the above.** The rider requires the target to
  HAVE Weakened (`whenTargetStatus`); Draw Mana weakened nobody, so longsword AND Withering Ray lost
  the die. No rider bug found; ⚑ re-test after the pack rebuild (the attack-only rule is authored
  data and is NOT on Ben's owned snapshot yet). The garbled `2d20kh+6)` formula bar is a separate
  legibility-family bug, queued.
- **Cruel Step "doesn't do anything still" = the pass-2 pack rebuild never landed.** Bench-confirmed:
  the owned item has NO `CruelStepMove01` rule. `deploy-to-foundry.bat` step 2 installed the engine,
  but step 3 (`foundry-build`) evidently never completed — it aborts on purpose on un-extracted
  Foundry edits, and ⟳ Sync then re-copies the OLD pack snapshot. Ben re-runs the bat (Foundry
  CLOSED) and watches step 3; `foundry-extract` first if it aborts. Zero repo changes needed.
- **`edhaCanSee` hardened while under the microscope (engine):** Foundry v13's "sight" collision test
  also collides with darkness-source edges and the scene-border rectangle by default (verified in
  13.351 source). Neither is a wall — both now explicitly excluded (`edgeOptions: {darkness:false,
  innerBounds:false}`), protecting Lawkeeper's Eye + Packmate's Warning on darkness-heavy maps. ⚑
- **Both pass-3 console logs were 1000-line TAILS** — the browser retains only ~1000 console lines
  logged while DevTools is closed. Fixed at the engine: the tracer keeps a full-session buffer and
  **`edha.debugSave()`** downloads the whole log as a file (no DevTools needed).

### New REUSABLE primitives / conventions
- **`edha.debugSave()`** — full-session tracer log download (50k-line buffer, timestamped lines).
- **Sweep-transparency convention:** any sweep that filters candidates must say who it skipped and
  why, on the card. Draw Mana Black is the model; audit other sweeps when touched.

### Queued pass-3 worklist (triaged, rulings in hand — next fix session)
Single-target prompt primitive (R1) · engine-move collision (R2) · `2d20kh+6)` fold garble (+pinned
test) · Flame Surge card-state persistence (sweep ALL clickable cards) · Lay Foundation combat-START
def-buff pass · Trade Routes = real teleport (not a walk) · Flashpoint → `edhaSetNextTestMod` ·
Kindle token-light via the Pyre path · Coercive Pressure adversaries-only · Overgrowth +1 Deflect →
`edhaLifeDeflectReduce` stacks (manual declaration no longer holds) · White Attunement + Concordant
Presence visible-allies gate (same `edhaCanSee`) · Pyre/Green/Foundation region rework (square,
GM square-by-square expansion, player extinguish; Ben asks why Foundations aren't Regions — they
predate the Region primitives, migrating them IS the fix and also solves combat-start detection) ·
legibility sweep (Set Charge dice labels, Mender's Instinct card, Red Attunement format) · Guardian
Stance adjacency auto-toggle (investigate cosmere Deflect-vs-Armor AE key first).

### Known limits / couldn't self-verify (no Foundry session) — ⚑
- ⚑ Draw Mana skip-accounting card line (unhide the Troopers first; expect "Weakened 2 of N").
- ⚑ Predatory Patience weapon-attack + Withering Ray rider revival AFTER rebuild+Sync+re-Weaken.
- ⚑ `edhaCanSee` walls-only config on a map WITH darkness sources (none available at this bench).
- ⚑ `edha.debugSave()` download in Ben's Electron/browser client.

---

## 2026-07-12 DELTA — BLACK test-pass-2 fixes (movement talents wired, LoS ruling, legibility family; ENGINE + data → `foundry-build leyline` + relaunch + ⟳ Sync)

Ben's second full in-Foundry Black run (14 talents re-tested; results in `EDHA_FOUNDRY_TEST_RESULTS.xlsx`
"Talents" sheet, Pass-2 columns; evidence in `tests/test-evidence/7-12-2026/`). Six commits on
`claude/black-pass2-fixes`, one per root cause.

### Rulings (Ben, 2026-07-12 — batched, decided interactively)
- **R1 — Attunement LoS:** Black Attunement's Draw-Mana Weaken requires **line of sight** (edhaCanSee
  sight-wall ray; darkness GM-judged), and the card text says so ("enemies you can see"). Both text
  layers updated.
- **R2 — Predatory Patience scope:** the +[Die] rider is **attack-only** — opposed skill tests
  (Extract Thought's Deception) never qualify. Card was already canon; the rule was over-broad.
- **R3 — Isolation movement:** wire **both** Cruel Step and Unnerving Approach (existing primitives,
  no new machinery).
- **R4 — Double Dip visibility:** **new** `doubledipped` marker on the marked target; the positional
  Isolated icon **stays** (Sapping Hex / Cruel Step targeting still reads it).

### Bug root causes (one per family — the Fail/Partial/note rows they explain)
- **The "all enemies moved, stacked on the wall" Fail (Unnerving Approach) was NOT the engine.**
  The mid-move evidence screenshot shows every Trooper with its own 15-ft ruler moving in parallel —
  a **Foundry v13 multi-token drag** (every enemy token selected). The engine had NO Unnerving wiring
  at all (nothing to misfire), and its only mass-mover candidates (trample, push, teleport) provably
  don't move groups. Real finding: a **design gap** — both movement talents were still 06-13 "manual
  by nature" while their primitives (edhaRunMove/edhaApplyMove, built for Red) sat unused. Both are
  wired now; the Ritual-block header comment is rewritten (the case-studies §4 lesson, again).
- **Cruel Step's "Investiture spends, no movement"** — same root: the Inv spend was the native
  activation cost; no movement code existed. Now an authored `use` rule on `edha-move` (10 ft toward
  target) with the new **`requireTargetIsolated`** config gate (warn + no move when an ally is
  adjacent to the target).
- **Predatory Patience rode Deception** — the authored rider said `appliesTo:"any"`. Now `"attack"`;
  the matcher additionally treats "attack" as attack-context OR an item-context roll whose source
  item carries a damage formula (attack talents on the item path) — never a skill test.
- **Extract Thought's "mystery Opportunity"** — the first test's d20 was a **natural 20**, which
  generates an Opportunity by itself (no plot die involved; symmetric with nat-1 Complications).
  Works-as-designed (⚑ verify the nat-20 rule against the system source at the bench).
- **The legibility family (Predator's Due / Withering Ray / Predatory Insight / Sanguine Reservoir)**
  — one theme, four surfaces: the trigger path folded the roll BREAKDOWN but not the Roll's own
  formula bar (now folds at construction → "3d8" not "(3)d(2 * 3 + 2)"); the sheet cost cell painted
  the template "½[Die] HP" instead of resolving per-actor (now "½d8 HP"); no CSS existed for engine
  prompt cards (Foundry's nowrap buttons overflowed — shared `.edha-trigger-card button` rules now);
  the Reserve checkbox's flex label shattered its bare inline text nodes into separate flex items
  (now one `<span>`). Trigger cards also print **why** they fired (the rule's `note`, now
  table-facing on Predator's Due).

### New REUSABLE pieces
- **`requireTargetIsolated`** config gate on `edha-move` (any slide can now demand an Isolated target).
- **`.edha-trigger-card button` shared CSS** — every prompt card (Opportunity/Beacon/Unnerve/civ)
  wraps long labels instead of overflowing. New cards get it for free.
- **Trigger cards print the rule `note` as the "why"** — authors: write notes table-facing.
- **`doubledipped` registered status** (blood icon) — toggled with the Double Dip scene mark, cleared
  with it at scene end.
- **Tracer handler labels** — `edha.debug(true)` lines now read `name@L<line>` (registration call
  site), so a saved console log maps straight back to source.

### Known limits / couldn't self-verify (no Foundry session) ⚑
- ⚑ Cruel Step + Unnerving Approach wired blind: targeting flow, once-per-turn gate, push direction
  (directly away from YOUR TARGET, not from you), wall stop, and the GM relay for unowned tokens.
- ⚑ `appliesTo:"attack"`: confirm a weapon attack vs a Weakened target still gains the die (the
  attack-context name is unverified; the item-path fallback keys on `system.damage.formula`).
- ⚑ nat-20 ⇒ Opportunity claim (system source unchecked).
- ⚑ edhaCanSee fails OPEN — a missing sight backend never disables the Weaken; darkness GM-judged.
- Process (next pass): save the console log **once per tree** — DevTools kept only the last 1000
  lines, losing the 10:42–11:00 Isolation tests.
- Parked for Ben: the **Puppeteer combat-tracking** question (how edha should run combats — bigger
  than one tree) and the **Black naming review** (three "Predator*" talents confuse even the author)
  — both queued as next-session decision menus, not code.

## 2026-07-06d DELTA — ATLAS RETIRED: the browser-side Leyline Atlas removed from the tree (REPO-SIDE ONLY → engine untouched, no rebuild, nothing for the bench)

Ben ruled the original browser-side "Leyline Atlas" web app — the thing this repo was created
for — **deprecated**: everything lives in the Foundry module now. This pass swept the repo for
everything that existed only to serve it, proved the Foundry pipeline depends on none of it, and
removed it. All of it is recoverable from git history.

**The dependency sweep (why this is safe):**

- No file under `scripts/`, `module-src/`, `tests/`, or `.github/` reads `src/`, `index.html`, or
  any root `Leyline Atlas *.html` file. `scripts/validate.js` mentioned `src/validate.js` /
  `src/atlases.js` in COMMENTS only (comments reworded; the filter logic itself stays — it still
  correctly skips non-tree rows like the Radiant orders in `cosmere.json`).
- Per-file consumer map of `data/`: everything the build/engine reads
  (`leyline/domain/cosmere/adversaries/authored/talent-*/path-descriptions/adversary-effects`)
  is untouched. Three files had NO consumer outside the atlas: `glossary.json` (fetched by
  `src/glossary.js` for the hover-glossary), `edha-inline.txt` (a `window.__DATA__` browser
  bootstrap), and `edha-talents.json` (the same flat table as edha-inline, referenced nowhere).
  All three removed.
- ⚑ **`data/deity-resources.json` is also a zero-consumer orphan** (deity resource summaries —
  Harvested Remains etc.) but it is content-bearing and NOT atlas-specific, so it was KEPT.
  Ben: keep as reference, or fold into the handbook and delete.

**Removed:** `index.html`, `src/` (all 21 files), `.nojekyll` (Pages artifact), `Leyline Atlas -
standalone.html` (2 MB) + `Leyline Atlas - standalone-src.html` (the two `v-pre-*` snapshots were
already deleted by the same-day package.json pass), `docs/BUILD_FLOW.md` (the Vite migration plan
for the atlas — moot), `scripts/publish.sh` + `publish.bat` (the "live site rebuilds in ~30s"
Pages publish flow; ⚑ Ben — if you used `publish.bat` by habit, plain `git add data && git commit
&& git push` does the same thing and the pre-commit hook still validates), and the three
atlas-only data files above.

**Kept (unchanged):** `scripts/validate.js` (still the data gate), `pre-commit` / `install-hooks.sh`,
the whole build/extract toolchain, all engine-consumed `data/` files, and
`source-materials/` (owned by TODO item 2, Ben-coordinated).

**Doc/manifest realignment:** `README.md` (three moving parts → two, atlas history note, no
BUILD_FLOW link), `scripts/README.md` (rewritten around the Foundry pipeline; publish flow noted
as removed), `package.json` description ("web atlas" dropped), `TODO_REPO_HYGIENE.md` items 3
(snapshot half now fully done) + 6 (Vite — obsolete, checked off).

No engine, data-consumed, or pack changes → nothing to deploy, no checklist rows.

## 2026-07-06c DELTA — REPO REVIEW: hygiene backlog captured in `TODO_REPO_HYGIENE.md` (DOCS-ONLY → nothing to deploy)

A structure/tests/hygiene review of the whole repo. Verdict: gates, CI, commit discipline, and the
docs culture are strong; the gaps are onboarding + repo hygiene, not architecture. The seven
actionable items live in **`TODO_REPO_HYGIENE.md`** (repo root), each written as a self-contained
one-session task: (1) root README for humans — **DONE same session** (`README.md`: what the project
is, the three moving parts, the gate commands, doc index); (2) remove committed binaries — **tree
half DONE same session** (all PDFs incl. the copyrighted Stormlight ones + all screenshots deleted,
`.gitignore` guards added; the history purge stays ⚑ Ben-run via the new guarded
`scripts/purge-binaries-from-history.sh` — rewrites history + force-pushes main, fresh clone, no
open PRs); (3) package.json + LICENSE + snapshots — **mostly DONE same session** (`package.json`
with `npm run gates` + per-check aliases, Node ≥ 20, zero deps; both root `v-pre-*` HTML snapshots
deleted; LICENSE deferred — ⚑ Ben chose "decide later"); (4) split
the engine into concatenated per-section sources (ONE deployed file preserved); (5) extend `tests/`
into the hook layer (fireHook + stub docs, write-asserting cases); (6) the Vite migration
`docs/BUILD_FLOW.md` already specifies; (7) collapse this doc's own header "Prior:" wall — **DONE
same session**: the header keeps the 3 newest entries + a one-line older-delta index; the 18
older entries moved VERBATIM to `HANDOFF_ARCHIVE.md` (nothing summarized away; the full `## DELTA`
sections in this doc remain canonical). Still open: §9-style full-section collapsing below (the
sections are the canonical record, so that's optional polish, not debt). No engine, data, or pack
changes anywhere in this pass.

## 2026-07-06b DELTA — TEST INFRASTRUCTURE: unit tests + cross-reference lint + full-gate CI (REPO-SIDE ONLY → engine untouched, no rebuild, nothing for the bench)

Coverage analysis found the repo's correctness rested on four layers (engine `node --check`,
validate.js, audit.py, and Ben's in-Foundry passes) with two holes: **engine changes triggered no CI
at all** (the workflow only watched `data/**`), and the string joints between authored data and the
engine — handler types, kinds, statusIds, and the ~117 talent-name literals the engine compares
against — were checked in neither direction. This pass closes both, repo-side only.

- **`tests/` (NEW, zero dependencies)** — `node tests/run.js`. `harness.js` loads the ENTIRE
  11k-line engine headlessly in a Node `vm` context (Foundry globals stubbed for load time: Hooks
  recorder, `foundry.utils`, a Roll stub with `safeEval`/`replaceFormulaData`); helpers are
  top-level `function` declarations, so they land on the context and are callable directly — the
  one-engine file needed NO restructuring. `engine-helpers.test.js` (18 cases) pins the pure
  helpers behind past table bugs: `edhaFoldDieMath` + the [Tier][Die] substitute-then-fold pipeline
  (the 07-05 roll-label family regression), `edhaEvalSync`, `edhaEventRules`/`edhaRuleOf`,
  `edhaRiderMatches`, `edhaColorRank`, `edhaFtToPx`, `edhaBurstSpecFromCfg`, plus a load smoke test
  (engine registers its ~240 hooks without throwing). `audit_parser_test.py` (10 cases) pins the
  gate's own parsers — `opposed_skill` (incl. the Order "tests X vs. your Blue" shipped-risk shape
  and the defense/color exclusions) and `mentioned`'s longer-name masking (the "Edict" collision).
- **`scripts/lint-refs.js` (NEW)** — the data↔engine contract, machine-checked both ways: authored
  overlay key whitelist (description/activation/damage/events/effects/img + docId ONLY); every
  `edha-*` event name + handler `type`, every handler `kind`, every non-empty `statusId` in
  `data/authored/*.json` must appear in the engine (a typo'd type silently does nothing — the
  silent-manual-card failure mode); every engine talent-name literal (`.name ===`,
  `edhaOwnsTalent`, `edhaCharacterOwnersOf`) must resolve to a talent in data or the in-file
  allowlist (`Draw Mana` = system action, `Edha Summons` = the summon folder) — a rename in an
  extract can no longer silently orphan its automation. All four failure classes verified caught.
- **CI (`validate.yml`)** — now triggers on `module-src/**`, `scripts/**`, `tests/**`, and audit.py
  too, and runs the full gate stack: `node --check` (engine + every script), validate.js,
  lint-refs.js, both test suites, `audit.py` (all trees; deity WARNs are non-fatal). validate-packs
  / validate-adversaries stay bench-only (they need Ben's compiled packs). The pre-commit hook
  gained the same lint-refs + tests step when engine/authored files are staged (re-run
  `bash scripts/install-hooks.sh` to pick it up).
- **Process:** test-pass fixes whose root cause lives in a pure helper should ship WITH a pinned
  regression case in `tests/` — the roll-label family would have been one test away from never
  recurring.

## 2026-07-06 DELTA — KNOWLEDGE TRANSFER: session-context docs + the test-pass-fixes skill (DOCS-ONLY → nothing to deploy)

Future sessions run on a different model; this pass encodes the working method so it survives the
handover. No engine, data, or pack changes.

- **`CLAUDE.md` (repo root, NEW)** — auto-loaded session context: project map, current phase
  (test-pass → fix cycle), the iron rules, and the "how to think here" habits (root-cause before
  fixing, one-bug-or-a-family, deploy-state first, drift-has-two-directions, primitives over point
  fixes, audit wider than the report, batch rulings, re-litigate "manual"). It routes test-result
  sessions to the new skill.
- **`.claude/skills/test-pass-fixes/` (NEW)** — the results → fix workflow as an invocable skill:
  Phase 0 parse (freeform notes → numbered worklist; 28 cross-tree name collisions) → 1 deploy
  state → 2 whole-tree audit → 3 root-cause every row (with a cause taxonomy) → 4 batched rulings
  → 5 fixes via shared primitives → 6 gates → 7 delta/checklist/ENGINE_INDEX trail. Plus
  `CASE_STUDIES.md`: seven worked diagnoses from real passes (Predatory Insight's false
  correlation, the roll-label family, the Unnerving Approach stale pack, Dread Presence's manual
  overturn, the Opportunity-menu generalization, the on-hit retrofit, Withering Ray's lying Cost
  line), each as report → tempting-narrow-fix → actual cause → lesson.
- **`leyline-tree-authoring` skill** — cross-references the new skill; stale "5,400-line engine"
  counts refreshed to 11,000+ (here and in `ENGINE_INDEX.md`).

## 2026-07-05 DELTA — BLACK test-pass fixes (Isolation = 5 ft, Reserve spend, Opportunity menu, card labels; ENGINE + data change → pack rebuild deferred (`foundry-build leyline`) + ⟳ Sync)

Response to Ben's first full in-Foundry Black pass (EDHA_FOUNDRY_TEST_RESULTS.xlsx, 07-05). A full
description-vs-implementation audit ran first; the only text/engine drifts were the six cards fixed
below — the "Unnerving Approach shows the wrong text" Big Issue is a **stale pack**, not repo data (the
push text has been in every live source since the first capture; the movement-denial text belongs to
Dread Presence — rebuild + Sync and re-check).

### Rulings (Ben, 07-05 — all four batched decisions)
- **Isolated = no ally within 5 ft (adjacency incl. diagonals)** — text, engine (`edhaIsIsolated`, now
  Chebyshev via `edhaAdjacent` + an optional token param), and a NEW auto-synced `isolated` icon all
  agree. Positional markers carry `flags.edha-content.isoMarker` and never feed back into the check
  (Maelith's inflicted Isolated, no flag, still does).
- **Reserve spend** = a "Pay from Reserve" checkbox INJECTED into the system's Spend-Investiture dialog
  (`renderDialogV2`, id `*.consume`): checking it unchecks the system's Investiture row(s) — no refund
  race — and deducts Reserve. **Double Dip** = its own Black test auto-resolved vs the target's Cognitive
  (contest core); success sets scene-scoped `flags.edha-content.doubleDipBy.<ownerId>` on the target;
  `edhaRitualHpCost` then offers "pay from Reserve instead of HP" (NOT a health loss: no Blood Price, no
  re-banking; cleared on deleteCombat). Reserve readout moved from the budget bar to under the
  Investiture bar.
- **Extract Thought** = PASSIVE (activation → Always Active): a `cosmere-rpg.skillRoll` watcher
  auto-resolves the owner's Deception tests vs the synced target's Spiritual defense; success applies the
  new registered `noreactions` marker (owner-relative expiry). Unreadable defense → owner-judged card.
- **Opportunity-spend menu (SHARED PRIMITIVE, incl. canon footer)** — post-roll watcher on
  `roll.opportunitiesCount > 0` posts a menu card of the roller's `edha-opportunity-option` rules (a NEW
  native event `edha-opportunity` + handler type — fully editable on the talent), costs deducted on
  click, one spend per card, canon spends (Aid an Ally / Collect Yourself / Critically Hit / Influence
  the Narrative, SR p.9) as a text footer. First consumer: Predatory Insight (authored rule; its direct
  use stays as a fallback). The `advTest` flag is now round-stamped (`{skill, round, source}`) so "this
  round" really expires; legacy string flags still read.

### Bug root causes (the Fail/Partial rows)
- **Draw Mana weakened everyone (27.1)**: the Black rider had NO isolation gate — only a chat note
  telling the GM to skip. Now filters `edhaIsIsolated(actor, token)` per enemy token.
- **Predatory Insight passive needed the active first (23)**: false correlation. Real cause: Whispered
  Doubt's extra-loss write is tagged `edhaFocusWatch:true`, so the focus watcher ignored it — an enemy
  taken to 0 BY Whispered Doubt never fired the regain. The zero-check (`edhaPredInsightZeroGain`) now
  also runs after our own secondary write.
- **"1d(2x3+2)" in the test breakdown + no Inv card (5/7) + the Severance blank card (4.2)**: one family.
  `Roll.replaceFormulaData` substitutes @refs but computes nothing → new `edhaFoldDieMath` folds die
  math numerically AND every rider term now carries a flavor label (`1d8[Predatory Patience]`) — composite
  d20 parts are named for free, everywhere. The cosmere chat template ignores roll `flavor`, which is
  both why Predator's Due's card was an anonymous die and where the "blank card" came from (the 0-heal
  Investiture-regain roll): new `edhaRollCard` posts every trigger roll with a content label
  ("⚡ <talent> (owner) — what it did"), and 0-amount resource gains post a text card, no naked roll.
- **Hollow Command / Puppeteer / Extract Thought (27)**: Hollow Command now contest-resolves (Deception
  vs Spiritual) → the new registered `noactions` marker (target-relative expiry) + Siphoned Will pays
  automatically on success (the beloved confirm card remains only as the no-target fallback). Puppeteer:
  GM-side `combatTurnChange` cue — a 0-focus combatant in range starts its turn → whispered
  `edhaPostCoordReactionCard` (2 Focus + 1 Inv on click; action itself GM-run). Both markers are in
  `EDHA_TIMED_STATUSES`.
- **Dread Presence (4.1, was "manual by nature")**: now ENFORCED — a `preUpdateToken` veto blocks a
  Weakened creature in an owner's Attunement Range from moving measurably closer to any living ally;
  engine forced-movement paths set `options.edhaForcedMove` and bypass it.
- **Withering Ray cost column (13)**: consume entries can't carry dice, so the sheet render hook paints
  the HP price ("½[Die] HP" / "[Tier] HP") into the Actions-tab consume cell for any talent with an
  `edha-ritual-hp-cost` rule (display-only; the event still does the deducting).
- **Text drift fixed (audit)**: Dark Investiture (Model A immediate damage now stated), Withering Ray's
  Cost line (half [Tier][Die] → half [Die] — the engine was right), Whispered Doubt ("once per round per
  enemy"), Black Leyline Attunement + Sapping Hex (5 ft), Extract Thought + Predatory Insight (new
  mechanics). Both `data/authored/leyline-black.json` and `data/leyline.json`.

### New REUSABLE primitives
- The **Opportunity menu** (`edha-opportunity` event + `edha-opportunity-option` handler +
  `edhaOpportunityMenuWatch`) — later trees author one rule to join the menu.
- `edhaRollCard(owner, name, roll, text)` — labeled engine roll cards (use for ALL future trigger rolls).
- `edhaFoldDieMath(formula)` + flavor-labeled rider terms — clean, named d20 breakdown parts.
- The **Isolated marker sync** (`edhaSyncIsolatedMarkers`, debounced, GM-side, combat-scoped).
- `noactions` / `noreactions` registered marker statuses; `advTest` round-stamping.

### Known limits / couldn't self-verify (no Foundry session)
- `roll.opportunitiesCount` (system getter) as the menu trigger; the consume-dialog DOM injection; the
  Dread Presence veto's feel at the table (strict "closer to ANY ally" reading — ask if you want a
  bypass key); marker-sync flicker on long drags. All flagged ⚑ in the checklist section.

## 2026-07-04 DELTA — ENGINE BACKLOG BUILT (all 11 §9a/§9b items; ENGINE + module.json → NO pack rebuild; full relaunch at deploy)

Ben's directive: everything code-able gets built now, so the only remaining item is the manual
Foundry test. Per-item proposal signed off first (the 06-14e process rule), then **one commit per
item**, each gated on `node --check` + `validate.js` + full-tree `audit.py` exit 0. §9a and §9b are
now EMPTY (moved to §9g history); §9c/9d/9e/9f are untouched — blocked, bench-gated, manual, and
balance respectively. New checklist section: **"Engine backlog pass"** (top of the file, after the
deploy block) carries the bench rows including four ⚑ unverifiables.

### The 5 shared primitives (§9a)
- **GM summon relay** — `edhaSummon` split bake-from-create: the spec resolves ENTIRELY owner-side
  (HP rolled, formulas baked, ownership stamped), then `edhaSummonCreateGM` runs directly with
  ACTOR_CREATE or via the new `summon-actor` socket action (the burst-apply mirror). The GM half
  resolves the "Edha Summons" folder (players can't create folders). Consumers unchanged — all
  summons funnel through `edhaSummon`.
- **Melee discriminator `edhaAttackKind(item)`** — "melee" | "ranged" | null: an explicit
  `flags.edha-content.attackKind` stamp wins (edhaSummon bakes one on its attack action), else the
  weapon's `system.range` (⚑ shape unverified until bench), else null = today's owner-judged
  behavior. Gated: Life Bone Spurs/Venom Glands (stands-down card), Death Withering Touch (skips +
  STAYS ARMED), Power Warlord's Advance (stays armed) / Fury / Mantle spirit. Thrown/reach stays
  owner-judged BY DESIGN.
- **Injury tool `edhaAddInjury(target, {source, damageType})`** — a world/compendium RollTable named
  like "Injuries" wins (table content stays a GM design call); else the six-entry placeholder list
  keyed by damage type (Ben-approved default). Create = the new `create-item` relay (inverse of
  Reknit's delete-item); schema drift retries a bare create (⚑). Wired: Raise Dead "+1 injury"
  (card names it), Apex Form's end (the `apexForm` scene-clear in edhaClearLifeState).
- **LOS helper `edhaCanSee(viewer, target)`** — hidden target = unseen; else a sight-blocking-wall
  ray between centers. Deliberately NOT native `testVisibility` (user-relative — Lawkeeper's check
  runs on the ATTACKER's client about the OWNER's view; the wall ray is deterministic everywhere).
  Fails open; darkness stays GM-judged. Wired: Order Lawkeeper's Eye "while you can see it"
  (enforced), Green Packmate's Warning UPGRADED from truly-manual (a defender-keyed −2 NumericTerm
  on unseen attacks = the card's +2 defense; the Mantle-aura dialog caveat ⚑ applies).
- **Forced-move stamp** — `edhaMoveTokenTo` + the `move-token` relay stamp `options.edhaForced` on
  every engine-driven relocation; Order's move violation watcher SKIPS stamped moves (a push is not
  "taking the action") and still prompts on unstamped walks / GM hand-drags.

### The 6 tree-local hooks (§9b)
- **Destruction Pinpoint** — the detonation terrain centers on the primary target, tags
  `followTokenUuid` (a new `extraFlags` passthrough on edhaDropHazard), and an updateToken watcher
  recenters Region + paired visual while the target lives. ⚑ Region-onto-token may not fire
  tokenEnter; turn-start still hits.
- **Destruction Pyre** — end-of-owner-turn (the Bone-Garden `combat.previous` shape) whispers a FREE
  confirm card per Pyre zone; the button reuses the Spreading-Roots +5 ft grow (a `data-edha-free`/
  `data-edha-label` extension — Roots' −1 Inv path unchanged). "Flammable" stays GM-judged: the
  confirm IS the judgment. Pyre zones became findable via new `sourceItem`/`sourceOwnerUuid` stamps
  in edhaPlaceHazard. (NOTE: §9b listed this under "Red" by die color; Pyre is Destruction/Razkael.)
- **Chaos Shatter Focus auto-prompt** — the contest-watch Roll hooks whisper the owner the Reaction
  when a foe BEARING THEIR OMEN rolls a test (never auto-fires; native use pays the cost). Spam
  gates (the Ben-approved shape): Omen-bearers only + once per foe per turn + a Mute button
  (`shatterPromptOff`; a real use re-arms). ⚑ reassess spam live.
- **Power target-bound `nextTestMod`** — the flag gains `targetUuid`; injector + consumer fire only
  with that creature as the synced target. Warlord's Advance's survivor Presence advantage binds it
  ("vs that target" was trusted). Target-agnostic writers unchanged.
- **Life Vital Diagnosis** — Knowledge's whispered HP/conditions/defense snapshot
  (edhaGnosisRevealLines, built AFTER Life declared this manual) now posts on use for the synced
  target. UPGRADED from manual in the Life header.
- **Civ enemy-cost EXPERIMENT** (the one item 07-03c parked "after bench"; Ben approved the override
  on no-ship-on-failure terms) — subclasses the native ModifyMovementCostRegionBehaviorType; the
  owner's side gets no terrain effect, enemies fall through to the native ×2. Every failure mode
  degrades to Ben R3's shipped-blind cost: registration is try/caught + edhaCivFortifyGM only emits
  the type when registered, and the resolver name is double-covered (⚑ the bench GO/NO-GO: ruler ×2
  enemy / ×1 ally; on NO-GO delete the block and R3 stands).

### Found & fixed in the same pass
- **`fortified` was never declared in module.json documentTypes** (registered in code only; nothing
  after 06-16 has run live, so it was never caught) — Bastion's Region create would likely have
  failed validation at the bench. Declared now alongside the new `enemy-cost`; module.json changed →
  the full relaunch the deploy already requires.

---

## 2026-07-03c DELTA — ENGINE BACKLOG CONSOLIDATED (review/consolidation pass, NOT a wiring pass; docs + one engine one-liner → NO pack rebuild)

With all 15 trees complete, the backlog was scattered across three sources (handoff §9, the 15
`register-skills.js` section headers, the checklist Watch-items). This pass makes **§9 the single
canonical backlog**, verified item-by-item against the engine (not trusting the headers). Counts:
**11 REAL unbuilt items** (5 shared primitives + 6 tree-local hooks) after merging **5 duplicate
cross-tree families** into one entry each (GM summon relay, melee discriminator, injury tool, LOS
helper, forced-move stamp); **10 stale/superseded bullets KILLED** (listed in the PR body so nothing
disappears silently); **1 item reclassified** backlog→manual (no-AI-intent — no hook can ever exist);
plus 4 blocked-on-system and 3 bench-gated items tracked separately. §9 is now grouped **shared →
tree-local → blocked → bench-gated → manual-by-design → post-playtest balance**, with the resolved
bullets moved to §9g history.

**The one engine change** (a sweep-fix caught during verification, Ben-approved): the **Blue Key Draw
Mana rider** was still a manual "advantage on your next Cognitive test" note while the identical Red Key
clause was ENFORCED — now wired via `nextTestMod` (attr-gated int/wil, mirroring Red). ENGINE-ONLY
(name-based, F5/relaunch — NO pack rebuild). Each affected engine section header gained a one-line
pointer to §9 as canonical for shared items; the per-tree lists were NOT deleted (audit.py's silent-card
check + the "named, not dropped" convention are load-bearing). Full-tree `audit.py` stays exit 0 (no
tree regressed), `node --check`, `validate.js` all clean. The one-time DEPLOY + the bench pass remain
separate outstanding work (top of `EDHA_FOUNDRY_TEST_CHECKLIST.md`) — deliberately NOT folded into the
backlog.

---

## 2026-07-03b DELTA — ORDER (Tessavain, deity) tree wired (Edicts + Covenants; ENGINE + data change → pack rebuild deferred + ⟳ Sync) — **ALL 15 TREES COMPLETE**

Tenth deity tree with a delta (fifteenth and FINAL tree wired overall). Blue declares law (**Edicts**:
prohibition → consequence), White keeps faith (**Covenants**: pacts → protection). The signature
subsystem is the Edict/Covenant lifecycle — owner-flag lists on the Charge/Remains/Foundation worked
pattern (cap = tier, oldest fizzles) + two new registered marker statuses (`edict` blue padlock,
`covenant` white aura), everything cleared on deleteCombat. Composes existing machinery throughout:
`edhaConsumeCost`/refund takeovers, `edhaRollColorTest` + `edhaReadDefense(cog)` (Verdict — the
Kneel/Killing-Blow dispatch), `edhaFoeSkillVsColor` (both "tests Discipline vs. your Blue" courts;
`EDHA_SKILL_ATTR` gained `dis:"wil"`, verified against foundry-build.js's own SKILL_ATTR),
`edhaApplyBurstResults`/relays, `edhaApplyTimedStatus` (Disoriented owner-relative / Weakened
target-relative), `edhaGrantTempHpCross` + `edhaGrantAdvAttack`, the applyDamage pre/post-pass
(Concord's rider + Shoulder the Oath's Reaction card), the shared `edhaPrevPos` token stamp and a new
inv-value stamp (the `edhaHea` shape), the def-buff AE shape + a debounced proximity refresher (the
Civ construct-in-Foundation move-watcher shape), and `edhaTriggerAllowed`/`edhaCoordOPRAllowed`
once-per-round gates. **One new primitive**: the engine's FIRST start-of-ROUND consumer (a
round-boundary check on the existing combatStart/combatTurnChange hooks — everything prior was
start-of-YOUR-turn) for Bear Witness; extract-ready for future start-of-round cards. **No side-engine,
no new sidecar table.**

### The name collisions + the auditor fix (R10 — found exactly as predicted, then root-caused)
"Edict" ⊂ Sovereignty's "Edict of the Fallen" and "Concord" ⊂ White's "Concordant Presence" made
`audit.py`'s substring-based silent-card check FALSE-PASS both (100% unwired, absent from the FAIL
list). Verified AUDITOR-side only — every engine name match is exact (`EDHA_SOV_TALENTS`, the
Coordination watcher), nothing misfired at runtime — so the fix went into audit.py, NOT a rename
(unlike Knowledge's Apex Predator, "Edict"/"Concord" are load-bearing words in this tree's own card
text): longer-name masking + word-boundary matching. The same pass fixed a SECOND blind spot: the
soft-laziness regex couldn't see "tests Discipline **vs. your** Blue" (lowercase "your"), so Order's
Discipline courts were invisible to the gate; the pattern is now caught, contest sites additionally
include `edhaFoeSkillVsColor`/`edhaSpeedVsRedProne`/`edhaRollOpposedSkill` (so the already-wired
Bastion/Magnum/Concussive Yield/Inevitable Snare resolvers count), and the handful of doc/comment
shorthands that said bare "Edict" for Edict of the Fallen were expanded so the check can't false-pass
through them. Full-tree audit stays green (no new FAILs; order went FAIL/8-silent → WARN-only).

### Rulings (Ben, 07-03b — all proposals accepted: R0–R10)
- **R0 — die/range split:** BLUE = every Edict-side range + every [T][D] payload ("+ @attr.int" on
  Edict + Final Decree only); WHITE = every Covenant-side range + the flat "your White" (= rank)
  values; Final Decree's Witness THP die = [T][D on WHITE] (Covenant-side buff, the Sovereign's-Favor
  precedent). Concord's "your Presence" bakes off the OWNER.
- **R1 — the violation model:** declaring the violation is VOLITION (owner/GM "⚖ Violated" button);
  the engine WATCHES all three canonical prohibitions and PROMPTS — move (`edhaPrevPos`), Investiture
  spend (inv-value stamp — it IS detectable, checked before calling it manual), attack-the-chosen-ally
  (the Sovereignty roll-watch shape). Consequence fully engine once fired. Caps: oldest fizzles.
- **R2 — Covenant:** touch ENFORCED (≤5 ft at cast, refused pre-cost); the mutual +1 all defenses is
  a GM-side proximity-watched AE pair; the owner wears ONE +1 (pacts don't compound on one head), an
  ally of two Order PCs wears one per owner; "deliberately attacks" = detect + prompt + Break button.
- **R4 — Shoulder the Oath REDONE** (the Death R6/R7 / Civ R2 / Power R5/R6 process): the authored
  edha-temp-hp event was the documented partial ("apply your own + the damage redirect manually") —
  removed (deity-order.json events:{}, talent-thp.json SUPERSEDED); now the post-damage whispered
  Reaction card: owner takes floor(D/2) same-type (edhaRedirected:true), ally heals back
  min(D, half + White), BOTH gain White-rank THP; once/round (the Lifeline gate).
- **R5 — Lawkeeper's Eye:** the advantage clause is WIRED (defender-keyed pre-roll injector — the
  Bulwark-Ground shape inverted to grant; covers Decree-bound too); the intent-reveal clause reuses
  Fate's Read-the-Threads no-AI-intent-hook backlog declaration (GM-reveal line on the Edict card);
  "while you can see" owner-judged (no LOS primitive).
- **R6 — Sealed Edict** seals the most recent unsealed Edict (the Inevitable-Snare flag-the-last
  shape); its court is engine-rolled Discipline vs Blue, Weakened expire:"target".
- **R7 — Verdict** excludes the bound target from its 10 ft court ("each OTHER enemy"); the AoE
  damage is ONE shared roll (the Necrotic-Cascade convention).
- **R8 — Concord's rider** = first DAMAGING hit per round per ally (a clean miss leaves it armed),
  same type as the hit, enemies only, the owner excluded ("each Covenant ALLY").
- **R9 — Final Decree:** decree-bound enemies do NOT count against the Edict cap ("as if bound");
  Witnesses snapshot at cast; **R9.1** — "every active Edict immediately triggers" is read literally:
  each resolves individually (own roll, own target, own Sealed rider), all consumed; the 10 ft blast
  is ONE shared roll with the violator INCLUDED (the Magnum-Opus R7a precedent).
- Second-pass check (the Knowledge R9–R11 lesson) held: no dropped talents; the stacking matrix
  (shared icon vs per-owner lists, advantage non-compounding, resolver-consumes-first racing, THP
  keeps-higher, dead-target batch entries) is declared in the section header.

### Per-talent wiring (full detail = the Order section header in `register-skills.js`)
- **Edict** (1 Action, 1 Inv) — TAKEOVER: Blue-range target + prohibition picker → list + padlock +
  the Violated button; violation = ONE [T][D blue]+Int spirit + Disoriented (owner-relative), consumed.
- **Covenant** (1 Action, 1 Inv) — TAKEOVER: adjacent willing ally → list + aura + the proximity AE
  + the Break button; Aid-at-range carded manual.
- **Lawkeeper's Eye** (passive) — wired advantage injector vs your bound targets (allies included);
  intent-reveal = GM line (backlog: no AI-intent hook).
- **Sealed Edict** (Free, 1 Inv) — TAKEOVER: seal-the-last; violation adds the engine-rolled
  Discipline court (+[T][D blue] spirit + Weakened on a fail).
- **Bear Witness** (passive) — start-of-ROUND: covenanted allies in White range get THP = White rank.
- **Shoulder the Oath** (Reaction) — REDONE: the post-damage Reaction card (see R4).
- **Verdict** (2 Actions, 2 Inv) — TAKEOVER: Blue vs Cognitive; success = the shared violation
  resolver + the 10 ft Discipline court (one shared damage roll, Disoriented on fails).
- **Concord** (2 Actions, 2 Inv) — TAKEOVER: scene arm; ally first-hit-per-round +Presence dealer
  rider; Aid grants carded manual.
- **Final Decree** (3 Actions, 3 Inv, once/scene) — TAKEOVER: scene-wide decree snapshot; the button
  fires the three-step batch (Edicts → Witnesses → the 10 ft blast).

### New REUSABLE primitives
- **The start-of-ROUND consumer** (`edhaOrderRoundTick`'s round-boundary check) — any future "at the
  start of each round" card reuses this shape (nothing start-of-round existed before this pass).
- `dis` in `EDHA_SKILL_ATTR` — Discipline is now a first-class opposed-skill id for any tree.
- The hardened auditor (name masking + word boundaries + the "vs. your Color" pattern) protects every
  FUTURE tree from the two collision classes this pass hit.

### Known limits / couldn't self-verify (no Foundry session)
The `edict`/`covenant` status tints (the standing Death-tint caveat); the Covenant proximity sweep's
AE churn on long drags (250 ms debounce); `dis` resolving to a real rank+wil roll (flat-1d20 = wrong
id); the start-of-round boundary firing exactly once (combat start + round advance, never mid-round);
the Investiture watch prompting on GM hand-edits (by design — the owner judges). **See the Order
section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py` ALL trees exit 0 (order
WARN-only, was FAIL with 6 listed + 2 collision-hidden silents), `validate.js`, `node --check`.

---

## 2026-07-03 DELTA — KNOWLEDGE (Gnothis, deity) tree wired (the Insight economy; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Ninth deity tree with a delta (thirteenth wired overall). No signature subsystem beyond the tree's own
**Insight economy** — a resource (max 5, one bearer at a time) that most damage cards scale against
(roll ONE `[Tier][Die red]` unit × the Insight count). Composes existing machinery throughout:
`edhaReadDefense`/`edhaRollColorTest` (the Kneel/Sovereignty test-takeover dispatch), the applyDamage
pre/post-pass with `edhaDealerOf` (the Withering-Touch armed-strike shape), the SHARED live→0 HP stamp
(Death's preUpdateActor hook), the EXISTING generic `edha-marked-damage-trigger` dispatch (Prognosis is
the literal worked example — reused verbatim, not reinvented), `edhaTriggerAllowed`/`edhaMarkTriggerUsed`
(the generic once-per-round gate), `edhaAlliesInAttune`/`edhaAllyInAttune`/`edhaDeathInRange` (Attunement
Range checks), `edhaApplyBurstResults`/relays. **One new primitive**: the Insight economy itself (a
pointer-only owner flag naming the current bearer + the already-registered stackable `insight` status's
own count) — the tree's equivalent of Death's Remains list / Power's Fury tally. **No side-engine, no new
sidecar table** beyond one small addition to the existing `talent-state.json` generic-rule table.

### Rulings (Ben, 07-03 — all proposals accepted; three follow-ups after a second pass caught a dropped
### talent and three unaddressed stacking interactions)
- **R0 — die/range split** (the Sovereignty R2/Death R0/Civ R0/Power R0 precedent): GREEN backs EVERY
  "Attunement Range" check tree-wide; RED backs every `[Tier][Die]` damage payload.
- **R1 — Insight's source of truth:** the registered stackable `insight` status's `effect.system.count`
  is authoritative (set directly via `effect.update`, not incremental toggling) — ⚑ **the tree's top
  bench-verify item**: the field name is a best guess, could be `stacks`/`value`/`amount` instead; named
  fallback = swap the field once confirmed in Foundry's console. A pointer-only owner flag
  `flags.edha-content.gnothisBearer = targetUuid` names "my current bearer" (unavoidable bookkeeping —
  the single-bearer invariant is inherently owner-scoped). Placing Insight on a DIFFERENT creature clears
  the old bearer to 0 first (Studied Mark's literal text, applied tree-wide).
- **R2 — name collision:** the capstone "Apex Predator" collided with Green/Instinct's already-wired
  "Apex Predator" (`edhaOwnsTalent` bare-name match at the Green pre-roll injector). RENAMED to **"The
  Final Study"** (domain.json / talent-rolls.json / deity-knowledge.json) rather than gating on color —
  Green's card is untouched, no data churn on a live-shipped talent.
- **R4 — Death Mark's ally-burst die** bakes off the Gnothis OWNER's own Tier + Red rank (the Pack-Share
  "your Tier" precedent), not the acting ally's.
- **R6 — PC drops count** for the on-kill triggers: unlike Death/Civ/Power's kill-tally precedent (which
  exclude PC drops or gate on hostile disposition), Knowledge's on-kill clause is a resource TRANSFER, not
  a farming tally — any bearer (PC or NPC) dropping to 0 triggers it, no gate.
- **R9 — Hunter's Discipline + Death Mark** (both ownable — Death Mark's prereq is "Hunter's Discipline OR
  Killing Blow") both fire independently on the same on-kill event; the single-bearer rule means whichever
  transfer prompt is clicked LAST just wins — no compounding-prevention needed.
- **R10 — Pack Share + The Pack** stack additively when both armed (neither card says "instead of"; both
  cost their own action + Investiture to arm).
- **R11 — each talent's "first ally to hit places Insight"** is tracked as an independent once-per-round
  flag (matches how oncePerRound gates work elsewhere — per-ability, not shared).
- Caught in a second pass after an explicit "tread carefully, don't skip work" check: **The Pack** was
  initially dropped from the first proposal draft entirely — re-added before any code was written.

### Per-talent wiring (full detail = the Knowledge section header in `register-skills.js`)
- **Studied Mark** (1 Action, 1 Inv) — TAKEOVER: 2 Insight on a Green-range target (clears any prior
  bearer) + a whispered HP/conditions/Phys+Spirit-defense reveal card.
- **Predatory Strike** (1 Action, 1 Inv) — armed rider (Warlord's-Advance shape); PRE-pass adds
  `[T][D red] × max(Insight, 1)`; POST-pass places 1 Insight on the actual hit target.
- **Killing Blow** (1 Action, 2 Inv) — TAKEOVER: target = your own bearer (no re-targeting); Red vs
  Physical; success = `[T][D] × Insight` + clear all; failure = `[T][D] × 1` + remove 1.
- **The Final Study** (capstone, 3 Actions, 3 Inv, once/scene) — same test shape as Killing Blow; success
  also prompts allies in Green range for a free Strike (player-executed).
- **Accumulate** (passive) — start-of-turn tick (+1 Insight in range, capped 5, hand-written
  `combatTurnChange`) + a DATA-SIDE `edha-marked-damage-trigger` event (+1 Inv when the bearer takes
  damage from any source, once/round — reuses Prognosis's exact generic dispatch).
- **Pack Share** (1 Action, 1 Inv) — TAKEOVER arming a scene flag + a PUBLIC reveal card (allies'
  controllers need to see it too); hand-written ally dealer-rider (+Tier vital) + first-hit-per-round
  Insight placement.
- **Hunter's Discipline** (passive) — hand-written OWNER-only dealer-rider (+Tier vital on your own hit);
  on-kill: a whispered candidate prompt transfers `floor(slain Insight / 2)`.
- **The Pack** (1 Action, 2 Inv) — same shape as Pack Share, but the rider is dynamic (+ your live
  Insight count, not a flat Tier); its own independent once-per-round Insight trigger.
- **Death Mark** (passive) — on-kill: a whispered candidate prompt transfers the FULL slain Insight count,
  PLUS a PUBLIC per-ally burst prompt (each ally's own controller picks the enemy and clicks).

### New REUSABLE primitives
- **The Insight economy** (`edhaGnosisSetInsight`/`edhaGnosisAddInsight`/`edhaGnosisInsightOn`) — any
  future "stack a resource on one bearer at a time" mechanic reuses this shape.
- Confirmed (not new, but newly proven in practice): the generic `edha-marked-damage-trigger` dispatch
  correctly serves a SECOND deity tree's talent (Accumulate) with zero engine changes — the sidecar-table
  reuse story works as designed.

### Known limits / couldn't self-verify (no Foundry session)
The `effect.system.count` field name (top bench-verify item — see R1); the Predatory-Strike pre→post
handoff (`_edhaGnosisPredatoryHit`, 15 s) on a late GM Apply click (the standing Warlord's-Advance-shaped
limitation); whether the public (not whispered) Pack Share reveal / Death Mark burst cards read cleanly
at the table. **See the Knowledge section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean:
`audit.py knowledge` (WARN-only, was FAIL/8 silent + 1 false-pass on the Apex Predator collision),
`validate.js`, `node --check`.

---

## 2026-07-02c DELTA — POWER (Tyrith, deity) tree wired (dominate → kill → escalate; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Eighth deity tree with a delta (twelfth wired overall). No signature subsystem — the spine is (a) **Black control tests** as preUseItem takeovers rolling Black and gating on `edhaReadDefense(cog)` (the Sovereignty/Chaos dispatch, never trust-the-player) and (b) **Red kinetic riders** on the applyDamage wrapper pre/post-pass with `edhaDealerOf` (the Withering-Touch armed-strike + Tempered-Edge injection shapes). Both pre-standard wirings were audited against the card text and **REDONE** (the Death R6/R7 process): Warlord's Advance's authored `edha-on-defeat` rider was the documented kill-attribution HEURISTIC ("GM adjudicates… decline if the kill came from another talent") and Investiture of Command's authored `edha-temp-hp` event granted only the FIRST targeted ally — both removed from `deity-power.json` (authored `events:{}` overrides the sidecar rows; notes refreshed) and rebuilt to the card text. Composes existing machinery throughout: `edhaConsumeCost`/refund takeovers, `edhaApplyTimedStatus`, `edhaGrantTempHpCross`, `edhaGrantAdvAttack`, `edhaSetNextTestMod` (the Red-Key `attr` gate), `edhaApplyBurstResults`/relays, the timed-coordinate sweep, and the status-registration row (`compelled`/`frightened`). **No side-engine, no new sidecar table.** New section in `register-skills.js` right after Civilization.

### Rulings (Ben, 07-02c — all proposals accepted as defaults)
- **R0 — die/range colors:** BLACK = the control tests + ranges (Kneel, Absolute Authority), Crown of Thorns, Investiture of Command's [Die] + ally range, Mantle's aura/redirect range; RED = Warlord's Advance + Unstoppable Advance dice — **both authored formulas FIXED black→red** (the roll-data note already said "Red [Die]") → data change.
- **R1 —** Kneel's Compelled is **NOT core prone**: new registered `compelled` status (own id, the harvested/decaying precedent), timed until the start of your next turn; `frightened` registered as a GM-applied marker. The move-toward-or-nothing clause is forced volition (manual, carded).
- **R2 —** Kneel's advantage clause is a wired PASSIVE: pre-roll injector — synced target bears compelled/frightened/weakened + stands in Black range → advantage.
- **R3 —** Absolute Authority: target gate ENFORCED; success = the "you choose its action" card (forced volition, manual); failure → Weakened until the end of ITS next turn (auto).
- **R4 —** Crown of Thorns auto-pings every ENGINE-resolved Black/Red vs-Cognitive test — in-tree + the Sovereignty **Censure/Decree** sites (same PC can own both trees; Edict of the Fallen is vs Spiritual, excluded) — plus an owner-click ping button for unresolved tests (the Expose shape). Ping = Presence spirit via burst-apply (spirit bypasses deflect = "cannot be reduced").
- **R5 —** Investiture of Command REDONE as a takeover: up to 3 targeted allies in Black range, **ONE shared [T][D black] roll** (the Necrotic-Cascade convention) → THP + `advAttackNext` each; caster's tier spirit self-damage auto-applies.
- **R6 —** Warlord's Advance REDONE as the armed-strike rider: the [T][D red] joins the SAME damage application in the PRE-pass so the kill check includes it; kill → THP = tier + the 10 ft move prompt; survivor → Presence-test advantage (`nextTestMod` attr:pre; target binding card-noted).
- **R7 —** Warlord's Fury counts **hostile-disposition non-summon NPCs only** (no PC/ally farming — the Death-R2 spirit); below-half once per victim, +1 per kill, one blow can score both; cap tier×2 applied live.
- **R8 —** Unstoppable Advance gets the tree's ONE new handler: the GM-side **move-through watcher** (`preUpdateToken` position stamp → segment sampling vs enemy squares, once per enemy per activation, per-enemy rolls); the can't-be-Slowed/Immobilized/Prone clause is ENFORCED (a `createActiveEffect` deleter while armed).
- **R9a —** Mantle's ally "+1 to all tests" = the NEW **flat-bonus pre-roll injector** (+1 NumericTerm appended to the d20 roll, live ally-in-Black-range check) — ⚑ bench-verify vs dialog-roll rebuilds; AE fallback named backlog. **R9b —** the redirect = **watcher-plus-prompt** (the Expose/Bonds shape): damage on the mantled owner → whispered card, budget = min(tier, HP lost), per-click ally target + amount, applied with `edhaRedirected:true` (Devoted-Conduit honest) + the wearer heals back the same.

### Per-talent wiring (full detail = the Power section header in `register-skills.js`)
- **Kneel** (1 Action, 1 Inv) — takeover: Black vs Cognitive → `compelled` (timed, owner-relative); forced action carded manual; the advantage passive rides `pre{Attack|Item}Roll`.
- **Warlord's Advance** (1 Action, 1 Inv) — use arms `warlordNext`; next WEAPON hit: +[T][D red] in the pre-pass, kill/survivor outcomes in the post-pass (real attribution — heuristic gone).
- **Crown of Thorns** (2 Actions, 2 Inv) — scene arm + `edhaCrownPing` (auto at engine sites, click-button otherwise).
- **Absolute Authority** (2 Actions, 2 Inv) — takeover: enforced gate, Black vs Cognitive; success carded, failure auto-Weakens.
- **Momentum of Victory** (Free, 1 Inv + Opportunity TRUSTED) — card + `momentumNext` (+tier on the next weapon hit).
- **Unstoppable Advance** (1 Action, 1 Inv) — armed flag + move-through watcher + status shrug-off + end-of-next-turn sweep; trample kills feed Fury (burst-apply attribution).
- **Investiture of Command** (2 Actions, 2 Inv) — takeover: ≤3 allies, one shared roll, THP + attack advantage, tier spirit self-cost.
- **Warlord's Fury** (2 Actions, 2 Inv) — scene tally on the dealer post-pass; +min(tally, 2×tier) on melee weapon hits in the pre-pass.
- **Mantle of the Aspirant** (3 Actions, 3 Inv, once/scene) — takeover: +2-defense AE, +tier spirit melee rider, the ally +1 injector ⚑, the redirect prompt card.

### New REUSABLE primitives
- **The flat-bonus pre-roll injector** (Mantle) — the first "+N to tests" aura; any future flat-test-bonus talent reuses the term-append (or its AE fallback once benched).
- **The move-through watcher** (`preUpdateToken` position stamp + `edhaSegPointDist` segment sampling) — any future "damage enemies you move through/past" talent.
- **`compelled`/`frightened` status rows** — the control-mark vocabulary Knowledge/Order social cards can reuse.

### Known limits / couldn't self-verify (no Foundry session)
The Mantle +1 NumericTerm append vs `configureModifiers`/dialog rebuilds (THE watch-item — fallback named); one straight segment per `updateToken` for waypointed drags; the `_edhaWarlordHit` pre→post handoff on late GM Apply clicks (15 s); Compelled's owner-relative expiry via `edhaApplyTimedStatus` (not the auto-stamp set); Crown pings need a GM online for player wearers; melee-ness of weapon hits stays owner-judged (the standing applyDamage limitation). **See the Power section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py power` (WARN-only, was FAIL/5 silent), `validate.js`, `node --check`.

---

## 2026-07-02b DELTA — CIVILIZATION (Kethane, deity) tree wired (Foundations + the Combat Construct; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Seventh deity tree with a delta (eleventh wired overall) — and the first whose spine was **pre-standard wiring**: the 2026-06-12 Lay Foundation preUseItem takeover (gold 10 ft Drawings, tier sustain cap, begin-turn defense buff) and the authored Forge Construct `edha-summon` spec (incl. the baked Siege Form effect + Siege Cannon). Both were **audited against the actual card text and KEPT** (the Death R6/R7 process): the only redo was removing Lay Foundation's stale `edha-aoe-template` authored event, dead since the takeover (Ben R2). Everything else composes existing machinery: the applyDamage wrapper pre/post-pass with `edhaDealerOf` (Tempered Edge / Arsenal / Magnum Opus riders — the Green-Instinct injection shape), the SHARED live→0 HP stamp behind Death's defeat watcher (Bonds of Community, its own consumer), the Fate-Snare Region-event shape (Bastion's enter check), `edhaGrantTempHpCross` + the Green `advAttackNext` primitive (Bonds), `edhaMoveTokenTo` (Trade Routes' Teleport), `edhaConsumeCost`/refund + the Chaos/Death takeover dispatch, and the `civ-fortify`/`civ-link`/`civ-dismantle` relays. **No side-engine, no new sidecar table.** New section in `register-skills.js` right after Death.

### Rulings (Ben, 07-02)
- **R0 — die colors:** the color split across the two branches is MIXED (the Construct branch is all White, Bastion sits Red on the Foundation branch) → the ambiguous rider goes **Red**. Net: WHITE = Construct HP/Slam/Siege Cannon (as authored), Magnum's bonus HP, Lay Foundation range, Bonds THP (= `edhaWhiteMod`); RED = Bastion + Magnum splash dice and both save DCs, **Tempered Edge's rider**.
- **R1 — sustain ONE = replace:** using Forge Construct with a live Construct **dismantles it and reforges** (never refused).
- **R2 —** Lay Foundation's stale authored event **removed** (the only pack-data change).
- **R3 — Bastion difficult terrain:** native `modifyMovementCost` is disposition-blind → ship it blind; the GM compensates allied movement by hand; a disposition-filtered cost function is **named backlog**. (The enter-DAMAGE check IS disposition-gated — allies pass free.)
- **R4 —** Foundations laid while Bastion holds come up **fortified**.
- **R5 — Bonds of Community:** ally/PC drops **count** (any non-summon creature); THP = **White mod**.
- **R6 —** Trade Routes gets the engine **Teleport button** (once/turn trusted), not manual drag.
- **R7 —** Magnum's splash **includes the primary target**; the ally clause = the Foundation begin-turn buff **upgrades +1→+2 for the scene** (`civFoundationBonus`).
- **R8 —** the Siege Form baked spec stays **byte-identical**; the talent now gates/pays/toggles it.

### Per-talent wiring (full detail = the Civilization section header in `register-skills.js`)
- **Lay Foundation** (Free, 1 Inv) — the 06-12 takeover KEPT; stale event removed; buff value now reads the caster's `civFoundationBonus` (Magnum upgrade).
- **Forge Construct** (1 Action, 1 Inv) — authored summon KEPT; preUseItem adds the R1 replace gate (`civ-dismantle` relay).
- **Tempered Edge** (passive) — applyDamage PRE-pass on Construct Slam: +[T][D red] energy (synced vs the summoner) + the hit bumped by the target's deflect (the Pinpoint ignore-deflect fact); Siege Cannon excluded.
- **Siege Form** (2 Actions, 1 Inv) — takeover: gates (live Construct, not sieged), pays, toggles the baked effect ON; card button ends it (Free, toggle OFF).
- **Arsenal** (2 Actions, 2 Inv) — preUseItem gate (live Construct, once/scene), native cost; use arms `arsenalActive` + the indicator AE (cadence trusted); Construct kills whisper the 15 ft move + free-Strike chase prompt (POST-pass).
- **Bastion** (2 Actions, 2 Inv) — takeover: gates (≥1 Foundation), pays; each Foundation gains a fortified Region: native walk×2 (blind, R3) + the NEW `edha-content.fortified` enter check (tokenEnter/tokenMoveIn, 1 s debounce, enemy-only): baked [T][D red] impact + Agility vs your Red → Slowed, expiry stamped at the CURRENT turn coord ("until the start of its next turn"). The Construct inside wears +2 all defenses (updateToken sweep).
- **Trade Routes** (1 Action, 1 Inv) — takeover: gates (≥2 Foundations), two validated clicks, `civ-link` stamps the pair "⇄"; the card's Teleport button moves the clicking ally between linked squares (owner-direct or `move-token` relay); once/turn trusted.
- **Bonds of Community** (Reaction) — the shared live→0 stamp + a Civilization consumer: a non-summon drop inside your Foundation → whispered Reaction prompt; Apply grants every standing ally in your Foundations THP = White mod + `advAttackNext`. One/round trusted.
- **Magnum Opus** (3 Actions, 3 Inv, once/scene) — takeover: gates, pays; Colossus = +2×[T][D white] HP (value + max override), +2 all-defenses AE, reach 10 card-noted; hits splash the talent's [T][D red] energy to each enemy within 10 ft of the target (target included) + Agility vs Red → Prone (`edhaFoeSkillVsColor`); Foundation buff upgrades +1→+2.

### New REUSABLE primitives
- **`edhaFoeSkillVsColor`** — the generalized Destruction Speed-vs-Red-Prone helper (owner rolls the color DC once, the ENGINE rolls each foe's skill, onFail per failure). `edhaSpeedVsRedProne` is now a thin wrapper. **Reach for this on any "each foe tests X vs your color" talent.**
- **`edha-content.fortified` Region behavior** — disposition-gated enter-damage + save (the enter-side sibling of Death's `turnEndDamage`). Any future "wall/trap zone" talent reuses it.

### Known limits / couldn't self-verify (no Foundry session)
The new Region behavior's event firing + the 1 s enter debounce; the `agi` skill id in the opposed roll; Magnum's `hea.max.override` write on the summon; dealer attribution (15 s memory) for the riders; the Bastion Slowed current-coord expiry feel; difficult terrain stays disposition-BLIND (R3 — GM compensates allies). **See the Civilization section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py civilization` (WARN-only, was FAIL/4 silent), `validate.js`, `node --check`.

---

## 2026-07-02 DELTA — DEATH (Morrath, deity) tree wired (the Harvested Remains economy; ENGINE + data change → pack rebuild deferred + ⟳ Sync)

Sixth deity tree with a delta (tenth wired overall). The spine is the **Harvested Remains** economy — `flags.edha-content.remains`, an ORDERED corpse-ref list on the owner (the Destruction Charge-list pattern: cap = tier, oldest fizzles past cap, spend pops the oldest, unset reads as the scene-start freebie) — fed by ONE GM-side **live→0 defeat watcher** (a `preUpdateActor` HP stamp → `updateActor`, the focus-watcher shape) that Reaper's Harvest and Necrotic Cascade both ride. Everything else composes existing machinery: the applyDamage wrapper pre/post-pass (Death Ward, Withering Touch), the affliction-tick shape (Consuming Decay), the enforced Green-Territory `modifyMovementCost` Region + the Spreading-Roots end-of-turn check (Bone Garden), the shared `edhaSummon` engine (Risen Servant — spec as Ben authored it), the burst-apply/set-flag/toggle-status relays, and the Chaos/Sovereignty preUseItem-takeover dispatch. **No side-engine, no new data handler or sidecar table.** New section in `register-skills.js` right after Sovereignty.

### Rulings (Ben, 07-02)
- **R0 — Attunement colors:** each talent ranges off its own die color — Black for Withering Touch / Consuming Decay / Death Ward / Necrotic Cascade, Green for Bone Garden / Risen Servant and Reaper's Harvest's corpse radius.
- **R1 — corpse marker:** wanted an icon → new `harvested` status (skull, **green `tint` on the CONFIG.statusEffects entry** — the literal dead-overlay SVG can't be recolored in place). Remains upgraded from a bare counter to a corpse-ref list so spending clears the right icon.
- **R2 — PC drops to 0 do NOT count** (applied tree-wide: no harvest, no cascade).
- **R3 — Withering Touch's "cannot regain HP" blocks HEALS only; Temp HP still lands** (a buffer, not "regaining HP").
- **R4 — Decay marker:** own `decaying` status id (green-tinted poison icon) rather than recoloring `afflicted` — one shared id would collide with real Black afflictions on the same target.
- **R5 — Bone Garden damages EVERYONE** ending a turn inside (allies + owner included).
- **R6/R7 — "seems like old wiring — redo as intended":** Death Ward's on-use-THP event and Necrotic Cascade's killer-only always-on `edha-on-defeat` event were **removed from `deity-death.json`** and rebuilt to the card text (ward = drop-to-1 + THP at the near-death moment, unwilling gated on Black vs Spiritual; cascade = 1-Inv armed-for-the-scene, ANY drop in range, not just your kills).
- **R8 — Risen Servant spec confirmed as authored** (Athletics-vs-Physical to-hit scaled by tier; Frightened/Compelled aren't native → sheet-noted manual; one-attack-per-turn cadence trusted).

### Per-talent wiring (full detail = the Death section header in `register-skills.js`)
- **Withering Touch** (1 Inv) — use arms `witherNext`; the next WEAPON hit (applyDamage post-pass = a real hit) auto-deals the talent's [T][D black]+Wil vital + a **fraction-0 heal-cut** (the widened Necrotic Grasp primitive) until the start of your next turn.
- **Reaper's Harvest** (passive) — qualifying drop in Green range → +1 Inv + the corpse joins the Remains list (harvested icon). Sense-through-obstruction is narrative.
- **Consuming Decay** (2 Inv) — takeover ENFORCES the gate (Weakened or <half HP, Black range, one instance per character); a GM-side `combatTurnChange` tick re-rolls [T][D black] vital at the target's turn starts and heals the owner half; the `decaying` icon is the handle (remove it = decay ends).
- **Bone Garden** (1 Inv + 1 Remain) — takeover, click-to-place range-checked; a 10 ft square Region with NATIVE walk×2 + a `turnEndDamage` flag; end-of-turn [T][D green] keen to anyone inside.
- **Death Ward** (2 Inv) — takeover: willing ally free / unwilling rolls Black and gates on `edhaReadDefense(spi)`; `flags.deathWard` + an applyDamage POST-pass restore: first lethal drop lands on 1 HP + [T][D black]+Pre THP, ward ends; the defeat watcher skips warded creatures.
- **Necrotic Cascade** (1 Inv) — use arms `cascadeArmed` for the scene; ANY qualifying drop in Black range → one [T][D black] spirit roll to each enemy within 10 ft of the body; `_edhaCascadeBusy` keeps nested kills from chaining (nested drops still harvest).
- **Risen Servant** (1 Inv + 1 Remain) — the authored `edha-summon` event STAYS; engine adds pre-cost gates (no Remain / sustain cap = tier) + spends the Remain on use.
- **Raise Dead** (4 Inv, once/scene) — takeover: target at 0 HP (died-within-the-hour owner-judged), optional Remain confirm, 1 HP via the burst-apply heal relay, Disoriented (expire target), initiative moved onto the caster's; the +1 injury is a GM card.
- **Speak with the Fallen** (2 Inv via activation) — Remain-or-touching prompt + the 3-questions card; the Q&A + repeat cost are table-run.

### New REUSABLE primitives
- **`tint` passthrough in `edhaRegisterStatuses`** — any future colored status is one `EDHA_STATUSES` row.
- **Fraction-0 heal-cut** — `edhaHealCutFactor`/`edhaApplyHealCut` now accept 0 = "cannot regain HP" (Necrotic Grasp's 0.5 unchanged). **Reach for this on any future full heal-block.**
- **The live→0 defeat watcher** (`preUpdateActor` HP stamp + crossing guard) — cleaner than the overlay hook for "when a creature drops" talents; Power/Knowledge death-triggers should ride it.
- **`turnEndDamage` Region flag + the `bone-garden` socket action** — any future "damage at end of turn in a zone" talent.

### Known limits / couldn't self-verify (no Foundry session)
The status **tint** rendering on token icons is the one untested Foundry surface (fallback = distinct icon files, one-row change); Death Ward's 0→1 restore runs post-pass (brief overlay flicker possible); Withering Touch fires on any WEAPON hit (melee owner-judged); Risen Servant still needs actor-create permission (GM casts for players — carried backlog). **See the Death section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py death` (WARN-only, was FAIL/6 silent), `validate.js`, `node --check`.

---

## 2026-07-01 DELTA — SOVEREIGNTY (Verdannis, deity) tree wired (damage-die-step lifecycle; ENGINE + prose-only data change → pack rebuild deferred + ⟳ Sync)

Fifth deity tree (ninth overall counting Life/Chaos/Fate, which shipped 06-17/06-18 without deltas — their record is their `register-skills.js` section headers). The spine is a **damage-die step** system — Exalted (+steps) / Diminished (−steps) creatures have their damage dice moved along the **d4→d6→d8→d10→d12 ladder** — built entirely on existing machinery: the `CosmereItem#rollDamage` wrapper (a second `overrideFormula` rewrite next to the damage-rider one), the Omen/Isolated status+flag marked pattern, the timed-status expiry convention, `set-flag`/`toggle-status` relays, `edhaGrantTempHpCross`, and the Chaos preUseItem-takeover dispatch. **No side-engine, no new data handler.** New section in `register-skills.js` right after Fate.

### Rulings (Ben, 07-01)
- **R1 — "die size" = the DAMAGE die.** Tests are always d20 in this system; the cards' "die size for all tests" meant damage dice (min d4 / max d12 = the [Tier][Die] ladder). **The 7 die-step cards were re-worded** ("damage die size") in `deity-sovereignty.json` + `domain.json` + the `talent-rolls.json` notes → **data change → `foundry-build deity` on the Foundry machine + ⟳ Sync** (cloud session can't rebuild packs).
- **R2 — colors:** Black rank ranges the debuff side; White rank ranges the buff side, ally-facing checks, and Sovereign's Favor's [Tier][Die].
- **R3 — Expose** rides Censure + Decree of Ruin (not Edict of the Fallen — it has its own THP rider). **R4 —** Inv recovery is **uncapped**. **R5 —** ally-hits-enemy is **auto-detected** (GM-side watcher, attack total ≥ Physical defense). **R6 —** step entries **stack**; the d4/d12 face clamp is the only rail.

### Per-talent wiring (all actives = preUseItem takeovers; tests ROLL Black and gate on `edhaReadDefense` — never trust-the-player)
- **Censure** (1 Inv) — Black vs Cognitive → −1 step (all damage) until the start of your next turn (= end-of-owner-next-turn, the engine convention).
- **Decree of Ruin** (2 Inv) — Black vs Cognitive → scene-long −1 on success, timed −1 on failure; once/creature/scene (`sovDecreeBy` stamp, refused pre-cost).
- **Edict of the Fallen** (2 Inv) — Black vs Spiritual → scene-long **−2 on ATTACK damage** + failed-attack THP rider (allies in White range gain THP = Tier); failure → timed −1 all.
- **Exalt** (1 Inv) — willing targeted ally → +1 step, timed. **Sovereign's Favor** rides it: THP = [Tier][Die on White] via `edhaGrantTempHpCross` (keeps-higher = "does not stack" for free; literal Exalt only, not Investiture).
- **Investiture of Authority** (2 Inv) — scene-long +1 **replacing your Exalt entry**; once/ally/scene (`sovInvestBy`).
- **Sovereign's Balance** (2 Inv) — target one ally + one enemy → ±1 timed; the hit watcher extends both **one round, once, cast round only**.
- **Sovereignty** (3 Inv, capstone) — ally +2 / enemy −2 for the scene, once/scene (`sovereigntyUsed`); each detected hit posts the no-reactions card (denial GM-enforced — reactions aren't tracked, the Voice-of-Authority precedent).
- **Expose** (passive) — failed attack tests by a Censure/Decree-Diminished foe auto-recover 1 Inv + post the Reactive Strike prompt when the attack's target is your in-range ally; non-attack/unreadable tests → an owner-click "it failed" card (Foundry tests carry no DC).

### New REUSABLE primitive
- **`flags.edha-content.dieStep`** entry list + `exalted`/`diminished` statuses + `edhaSovStepFormula` (bake → step ladder dice → `overrideFormula`). **Reach for this on any future "damage die up/down" talent** (other deity trees have die-ish effects). Sweep on `combatTurnChange`; scene state cleared on `deleteCombat`.

### Known limits / couldn't self-verify (no Foundry session)
Engine-side damage that bypasses `rollDamage` (burst/hazard/triggered bakes) doesn't step; hit/fail detection reads the synced target's **Physical** defense only; off-ladder dice (d3/d20/d100) are deliberately untouched; the regex rewrite vs graze/rider formulas needs a bench pass. **See the Sovereignty section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.** Gates run clean: `audit.py sovereignty` (WARN-only, was FAIL/8 silent), `validate.js`, `node --check`.

---

## 2026-06-17 DELTA — DESTRUCTION (Razkael, deity) tree wired — first DEITY tree (Charge lifecycle + dangerous terrain; ENGINE-mostly + small data change → ⟳ Sync)

First deity tree. The spine is a bespoke **Charge** system, built entirely on the existing **Red / hazard** machinery — **no side-engine** (reuses `edhaApplyBurstResults`/socket for damage, the `edha-content.hazard` Region + `edhaHazardVisual` for terrain, `edhaRollOpposedSkill` for the opposed Speed test, the Reserve-style owner flag for state). New section in `register-skills.js` right after the burst intercept.

### Rulings (Ben, 06-16)
- **Charge model:** Set Charge drops a click-to-placed marker template, tracked in `flags.edha-content.charges` (cap = tier; oldest fizzles past cap). Detonation resolves burst damage + drops terrain at each marker's REAL position via the card's **Detonate / Detonate-All** buttons (Free) or via **Cascading Failure / The Unmooring** (their Inv cost + bonuses).
- **Triggers** ("when target moves / takes damage / enters square") are **declared text fired by the Detonate action** — no auto-hook (CONTEST-EXEMPT: Set Charge).
- **Concussive Yield** is engine-rolled per foe (not a reminder card): Speed vs the owner's Red DC → core **Prone** on a fail. Same helper backs **Fault Line**'s inline knockdown.
- **Zone "merge"** (Cascading / Unmooring) = damage-bump + GM-merge note (no polygon union).

### Per-talent wiring
- **Set Charge** — preUseItem takeover (cancel default, pay 1 Inv, refund on cancel): click-to-place a marker, store the Charge, post the Detonate card.
- **Pinpoint Charge** (Free, 1 Inv) — flags the latest Charge ⊕; on detonation adds its [Tier][Die]+Int **keen** to the primary and **ignores that target's deflect** (hit bumped by `system.deflect.value`).
- **Cascading Failure** (2 Inv) — detonate all Charges; a foe caught in 2+ blasts takes an extra [Tier][Die]; merge bump when ≥2.
- **The Unmooring** (3 Inv, once/scene) — detonate all at 15 ft, +Int, **ignores deflect**, merge-bump all zones.
- **Concussive Yield** (passive) — rides every Charge detonation (Speed-vs-Red → Prone).
- **Fault Line** (2 Inv) — preUseItem takeover: a 60×5 ft **line** (rotated-rectangle hazard, replaces the pilot's radius approximation), [Tier][Die]+Str energy, Speed-vs-Red → Prone, **×3 vs Constructs** (`customType === "Construct"`).
- **Combustion Chain** (Reaction) — **auto-fires** off the defeat HP-sync (`updateActor`, hp ≤ 0): a foe that drops in your terrain ignites a fresh 10 ft zone on the body + offers the 5 ft spread.
- **Walking Ruin** — +10 ft Speed stays a transfer AE; "every space you move through becomes dangerous terrain" now drops a patch off `updateToken` while the talent is toggled on (scene-scoped).
- **Pyre** — unchanged (keeps its `edha-place-hazard` event); the turn-end "flammable spread" is backlog.

### Hooks/tools still to build (NOT silently dropped — see the section header in register-skills.js)
- Pinpoint "terrain moves with the target" — per-Region follow on `updateToken` (template: the Walking-Ruin move hook).
- Pyre "spreads to one flammable square each turn" — a `combatTurnChange` Region-grow (mirror Spreading Roots).
- Fault Line "triple damage to structures" — needs object/structure damage targets (Constructs already wired).

### Deploy
Set Charge + Fault Line lost their authored `events` (now name-based) → **data change → `foundry-build deity` + ⟳ Sync.** The rest is engine-only. `node --check` clean; `node scripts/validate.js` passes (`validate-packs.js` needs the Foundry LevelDB — deferred to the machine).

### LIVE-VERIFY (no Foundry session this pass): see the **Destruction** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify: the rectangle-Region rotation/anchor for Fault Line, the marker/Detonate round-trip + cap=tier fizzle, Concussive/Fault-Line prone math, the deflect-bump, Construct ×3 detection, the Combustion auto-fire condition, Walking Ruin per-move terrain volume.

## 2026-06-16c DELTA — GREEN / INSTINCT specialty wired → GREEN TREE COMPLETE (mostly name-based engine + a small pack rebuild → ⟳ Sync)

Green tree-by-tree finishes: **Instinct (8)** — the pack-tactics tree (advantage-granting, focus-fire, forced movement, a strike window). The COMPUTED talents (Pack Hunter, Scent the Weak, Coordinated Hunt, Pack Pressure) are **name-based** engine (live adjacency / lowest-HP / focus-fire / windowed bonuses have no data-rule representation — precedent: White Coordination + Black Subjugation). But **behavior that CAN live on the talent now does**: **Drive the Prey → Slowed** is a data-side `edha-triggered-effect` (event `use`, kind `status`, target `prompt` — a direct mirror of Sovereign of Solitude, editable in Foundry), and the three genuinely-manual talents (Predator's Instinct / Packmate's Warning / Natural Order) carry **toggled indicator AEs** (Flamestance convention) so they show + are editable on the sheet. So this pass DID touch data → `foundry-build leyline` + ⟳ Sync. **The whole Green tree (Territory + Restoration + Instinct) is now wired.**

### System facts (verified)
- **`slowed` is a native cosmere condition** (Drive the Prey applies it via the Territory `edhaApplyConditionToTarget` helper).
- The **applyDamage PRE-pass** already injects bonus instances (Vital Diagnosis pattern) — so Coordinated Hunt / Pack Pressure push their bonus into the SAME apply call (no second applyDamage → no recursion).

### New REUSABLE primitive
- **`advAttackNext`** flag + `edhaGrantAdvAttack(actor, source)` / pre-`{attack,item}`-roll inject + consume — "advantage on your next attack," the attack-roll mirror of `advTest`. Cross-actor grants relay via `set-flag`. **Reach for this on any "gain advantage on your next attack" talent.**
- **Focus-fire tracker** (`_edhaFocusFire`, GM-side `attack/itemRoll` watcher via the Territory `edhaTargetsOfRoller`) — records who attacked whom this round; reset on round change.

### Per-talent wiring
- **Pack Hunter** (active) — on use → you + each ally **adjacent to the targeted enemy** gain advantage on their next attack.
- **Scent the Weak** (active) — on use → names the **lowest-HP creature in Attunement Range** + grants you advantage on your next attack (once/round).
- **Drive the Prey** (active) — **data-side** `edha-triggered-effect` (event `use`, kind `status`, `slowed`, target `prompt`): on use the target is Slowed (owner-judged Green vs Survival; forced move + ally Reactive Strikes GM-narrated). Editable in Foundry.
- **Coordinated Hunt** (passive) — your hit on a victim that you + ≥1 ally attacked this round → **+min(#attackers, Green rank)** bonus damage (pre-pass).
- **Pack Pressure** (active) — on use → opens a **strike window** until the start of your next turn; your strikes deal **+[Tier][Die]** (pre-pass); the no-provoke move is GM-narrated.
- **Predator's Instinct / Packmate's Warning / Natural Order** — **manual** (no track/fear, unseen-attack, or scene-debuff hooks) → each carries a **toggled indicator AE** (sheet presence) + posts a reminder on use.

### Known limits
Coordinated Hunt + Pack Pressure auto-apply to the **owner's** strikes only (ally strikes GM-narrated); Pack Pressure's "+vs an adjacent-flanked target" is applied to all owner strikes in the window (slight over-application). Focus-fire + Pack Hunter ally-detection rely on synced `user.targets` / token adjacency on the GM client (same caveat as Pack Sense).

### LIVE-VERIFY (relaunch + **⟳ Sync** — the pack was rebuilt for Drive the Prey's status rule + the indicator AEs): see the Green / Instinct section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session): the advAttack dialog seeding, the focus-fire count at the table, the Pack Pressure window expiry, Drive the Prey's data-side Slowed firing on use.

---

## 2026-06-16b DELTA — GREEN / RESTORATION specialty wired (engine + a Hardy pack rebuild → ⟳ Sync)

Green tree-by-tree continues: **Restoration (8).** The tree's signature is **healing**, and its spine is a **"green-heal" trigger family** — three talents that fire "when you restore health with a Green talent."

### System facts (verified)
- The **`applyDamage` wrapper is the heal chokepoint** (heal instances pass through it; it already tracks `prevHp`/`healAmt`/dealing item for overflow-THP & heal-cut). Verdant Mend's clickable heal + any heal instance land here. **Mender's Instinct** heals via the trigger path (direct `hea.value` update), so it gets a second integration point.
- **`stunned` is a native condition** (joins afflicted/disoriented/weakened) → Natural Recovery's cleanse set is all real.
- **Injuries are first-class `injury` Items** with `system.type` ∈ {flesh_wound, shallow_injury, vicious_injury, permanent_injury, death} → Reknit Form can ENFORCE removal (delete the item), 2 Inv temporary / 3 Inv permanent.

### Rulings (Ben, 06-16b — carried from the Territory pass)
Auto where possible; resource-spend talents stay opt-in cards; enforce the rules text. Reknit Form → enforce (delete the injury Item) rather than leave manual.

### New REUSABLE engine
- **`edhaGreenHealRiders(healer, target, amount, prevHp)`** — the on-green-heal dispatcher, called from BOTH heal chokepoints (applyDamage post-pass when `edhaTalentColor(dealer.item)==="green"`, and the `edha-triggered-effect` heal branch when the firing talent is green). **Reach for this for any "when you heal" rider.**
- **`edhaGrantTempHpCross` / `edhaDeleteItemCross`** — cross-actor THP grant (reuses the `set-flag` relay; keeps the higher THP, no stacking) + injury-item delete (new `delete-item` socket action). Both do-if-owner-else-relay.

### Per-talent wiring
- **Verdant Mend** — already a clickable [Tier][Die]+Green-mod heal; now the primary green-heal **trigger source**.
- **Mender's Instinct** — already `edha-hp-threshold`; now also fires the green-heal riders.
- **Collected** — already a +2 Cog/Spi AE (passive). Unchanged.
- **Hardy** — **data-side AE** `system.resources.hea.max.bonus += @level` (clone of Black/White; `_id` HardyMaxHPGreen1 — closes the 06-13b carry-over). Pack-rebuilt + inspect-verified.
- **Resurgent Growth** — heal an **ally** → queue regrowth; at the **start of your next turn** (`combatTurnChange` + `combat.combatant`), heal them **tier + Green mod** if still in Attunement Range (then clear).
- **Vital Surge** — green-heal to a target that **was below half HP** → whispered card → spend 1 Inv → THP = **½[Tier][Die]**.
- **Natural Recovery** — green-heal → whispered card listing the target's removable conditions (Afflicted/Disoriented/Stunned/Weakened) → click → cleanse one (Opportunity trusted).
- **Reknit Form** — on use → whispered card listing the target's **injury Items** → click → delete it + spend **2 Inv** (temporary) / **3 Inv** (permanent).

### Deploy
- **Engine:** `module-src-sync.js push`. **Pack rebuild:** `foundry-build.js leyline` (Hardy AE) — Foundry CLOSED; `validate-packs.js` **PASSED ✓** (leyline effects 8→9). **To load:** relaunch + **⟳ Sync Talents** (Hardy changed the pack).

### Known limits / couldn't self-verify (no Foundry session)
Heals that bypass `applyDamage` AND the trigger path won't fire riders (the Restoration heals don't); Verdant Mend's heal carrying `dealer.item` (overflow-THP relies on the same, so it should — `_edhaLastDealer` is the fallback); the `set-flag` THP relay + `delete-item` injury relay for cross-actor targets; Resurgent Growth resolving on the owner's turn start + the range re-check; Hardy current-HP top-up is manual. **See the Green / Restoration section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-16 DELTA — GREEN / TERRITORY specialty wired (engine-mostly + small pack rebuild for Apex Predator / Thorn Field / Sudden Growth)

Green tree-by-tree begins with **Territory (8)**. The tree's spine is **"your difficult terrain,"** which until now had **no mechanical effect** (Green Draw Mana only drew a cosmetic circle; the only "terrain" Region type was the damage-only `edha-content.hazard`). This pass makes difficult terrain a **real, enforced, owner-tagged Region** and builds the membership engine the rest of the tree reads.

### System facts (verified)
- **Foundry v13 ships a native `modifyMovementCost` RegionBehavior** (`client/data/region-behaviors/increase-movement-cost.mjs`): `system.difficulties.{walk,…}` = per-action cost multiplier (1 normal … 5; **2 = difficult terrain**, engine-enforced on the token movement pathing). This is THE difficult-terrain primitive.
- **`restrained` and `immobilized` are native cosmere conditions** (system `index.js`) → toggle the icon; immobilized already rides the `EDHA_TIMED_STATUSES` auto-expiry.
- Region docs are **GM-write-only** → player paths (Green Draw Mana, Spreading Roots click) relay to the GM via new socket actions.

### Rulings (Ben, 06-16)
A = difficult terrain must have a **real Region effect on the map** AND a **player-visible indicator** (model it like the other enforced-movement mechanics, not GM narration). B = **Thorn Field rides on terrain created by players that have Thorn Field** (true passive, not a self-cast). C = **auto whenever possible.** D = conditions apply **automatically on success.** E = enforce the descriptive rules text, rewrite data as needed.

### New REUSABLE engine
- **`edhaCreateGreenTerrain(owner, scene, x, y, sizeFt)`** (GM-side) — the single green-terrain factory: one Region with native `modifyMovementCost` (walk ×2) + `flags.edha-content.terrain = {ownerUuid, color:"green"}` + a paired player-visible **Drawing** (green 🌿, via the existing `edhaHazardVisual`). If the owner has **Thorn Field**, it ALSO bakes an `edha-content.hazard` behavior (`floor([Tier][Die]/2)` keen on enter / turn-start). `edhaDropGreenTerrain` is the player→GM relay (`green-terrain` socket action). The burst-terrain path (`edhaApplyBurstResults`) now routes `color:"green"` here; red/other dangerous terrain stays the damage Region but is now **owner-tagged** too.
- **Membership helpers** — `edhaOwnedTerrainRegions(owner)` / `edhaPointInRegion` / `edhaTokenInOwnedTerrain(tok, owner)` / `edhaEnemiesInOwnedTerrain(owner)` (circle-distance tests). **`edhaGreenMod(actor)`** = native `@skills.green.mod`. **Reach for these on any "in your terrain" effect.**
- **`grow-terrain`** socket action + `edhaGrowTerrain` — expand a Region's circle radius (and its paired drawing) GM-side.

### Per-talent wiring
- **Green Leyline Attunement (Key)** — Draw Mana now drops a **real** enforced difficult-terrain Region (was a cosmetic circle).
- **Grasping Vines** — on use (name-based) → auto-apply native **Restrained** to your target (maintain = chat reminder; Foundry has no upkeep hook).
- **Territorial Instinct** — on use (Reaction) → auto-apply native **Immobilized** (timed, auto-expires) to your target. No Disengage hook → the opposed Green-vs-Survival test is owner-rolled; using the talent = applying on success.
- **Thorn Field** — **reworked to a true passive** (talent now `events:{}`/no damage): the keen hazard is baked onto terrain by `edhaCreateGreenTerrain` whenever a Thorn-Field owner creates it.
- **Spreading Roots** — `combatTurnChange`: the creature whose turn just ended, if standing in your terrain → whispered card → spend 1 Inv → **expand the Region** [Size] (once/owner/round).
- **Pack Sense** — `attackRoll`/`itemRoll` watcher (GM-gated): an **ally** attacks a target standing in your terrain → whispered card → spend 1 Inv → **+Green mod** to their result (target read from synced user targets).
- **Sudden Growth** — data-side `edha-burst {terrain, color:green, affects:none}` event → click-to-place a [Size] difficult-terrain Region (routes through the green factory).
- **Apex Predator** — **data-fix** (authored block was a stray Red attack — `skill:red` + red vital damage; cleared to a passive) + engine pre-roll: while **≥3 enemies stand in your terrain**, advantage on your **Physical (str/spd)** tests (won't stomp an active disadvantage).
- **Primal Awareness** — left manual (no Surprise/outdoors/track hooks to enforce).

### Deploy
- **Engine:** `module-src-sync.js push` → live module. **Pack rebuild:** `foundry-build.js leyline` (Apex Predator data-fix + Sudden Growth event + Thorn Field event-removal) — Foundry was CLOSED; `validate-packs.js` **PASSED ✓** (leyline events 21/19, effects 8/8, 0 bad). Baseline re-armed by the build.
- **To load:** full **relaunch** (engine changed) + **⟳ Sync Talents** (leyline pack rebuilt).

### Known limits / couldn't self-verify (no Foundry session)
Native `modifyMovementCost` actually doubling movement at the table; Drawing visibility to players; `region.shapes` circle membership math; Pack Sense target-detection via `user.targets` cross-client; Spreading Roots `combat.previous.turn` token resolution; Apex Predator advantage seeding through the dialog; immobilized "this turn" lands one turn long under the next-turn expiry convention. **See the Green / Territory section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`.**

---

## 2026-06-15 DELTA — CONTESTED-ROLL RESOLUTION: kill the "soft laziness" (ENGINE-ONLY; F5/relaunch — NO rebuild)

Ben's directive: wherever a contest CAN be computed, the engine must resolve it — no more "compare your Blue test yourself / GM adjudicates" reminder cards. New reusable contest core + per-talent rewires, all engine-only via `module-src-sync.js push`.

### New REUSABLE tool — contest core (`register-skills.js`, right after `edhaKeptD20Nat`)
- **`edhaQueueContest(owner, color, onResolve)`** — a talent's `useItem` queues a contest (capturing `game.user.targets` at use time); a roll-watcher (`edhaContestWatch` on skill/attack/itemRoll) captures the talent's **own d20 test**; `edhaTryResolveContest` ties them and runs `onResolve({ total, nat })`. **Order-independent**: matches whether `useItem` fires before or after the roll, and tolerates a slow roll **dialog** (roll-after window = `EDHA_CONTEST_TTL` 120 s; roll-before window = `EDHA_CONTEST_BACK` 8 s). Cancelling the roll dialog = no roll = no apply.
- **`edhaReadDefense(actor, key)`** — `system.defenses.<cog|spi|phy>.value`. **`edhaRollOpposedSkill(target, skillId, attrId?)`** — auto-rolls a target's own skill (rank + linked attr; `ath`→`str`) for opposed contests. **`edhaPromptDC(title, hint)`** — DialogV2 (Dialog fallback) number prompt for tests with no static DC; returns a number, or `undefined` = "judge it". **`edhaRewriteOrRelay(actor, oldTotal, newTotal, note)`** — rewrites an already-rendered roll card's total (GM-direct, or a new **`rewrite-roll`** socket relay to the GM), falling back to a reported number.

### Per-talent (was → now)
- **False Premise / Counterspell / Read Intent / Ghostly Walls** (Blue, `skill_test`) — auto-compare **Blue vs the target's Cognitive defense**; on ≥ they auto-apply (disadvantage / "talent fails" / GM-reveal prompt / Immobilize + Absolute-Stillness Weakened) and post the verdict; on a miss, "no effect". No target/defense → the old manual card as a fallback.
- **Redirect Momentum** (Blue, opposed) — auto-rolls the **mover's Athletics** (rank + Str) vs your Blue total; posts the decided outcome (reduce/push [Size]; GM positions the token).
- **Counterpoint** (White, `skill_test`) — queues the White test, **prompts for the DC** (the enemy's influence result); on ≥ auto-spends 1 Inv + negates + Disorients. Split off Overwhelming Authority (a flat no-test apply).
- **Shared Conviction / Concordant Presence** (no static DC) — the reaction/grant card click now **prompts for the DC** and resolves: Shared Conviction reports whether the +White-mod boost turns the failure into a success; Concordant grants the Plot Die only if the first ally met the DC. "No DC — judge it" falls back to the old behavior.
- **Voice of Authority / Bound by Word** — now **rewrite the original roll card** to the disadvantaged / swapped total (GM-direct or relayed), instead of "GM applies the lower/higher".

### Notes for Ben
- **DC prompts** appear on the GM's client when resolving Counterpoint / Shared Conviction / Concordant — enter the difficulty (or "No DC — judge it"). This is the agreed cost of Foundry tests carrying no built-in DC.
- **Roll-card rewrite** is best-effort: it works directly when you're the GM (the single-test-actor pass), relays to the GM otherwise, and degrades to a posted number if the original message can't be found.
- Untouched (genuinely no roll to capture): Pattern Recognition / Probability Cascade / Anticipate / Intercept / Subtle Suggestion stay flag-appliers (they cost Inv, they don't roll a contest).

### LIVE-VERIFY: the updated contest items across the White (Coordination/Accord) + Blue (Calculation/Illusion/Foresight) sections of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — engine-only, NO ⟳ Sync / rebuild.** `node --check` clean + validators pass; in-Foundry verification is Ben's single-pass test-actor run this evening.

---

## 2026-06-14f DELTA — BLUE / FORESIGHT specialty wired → BLUE TREE COMPLETE (ENGINE-ONLY off `useItem`; NO rebuild)

Blue tree-by-tree finishes: **Foresight (8) done → the BLUE tree is fully wired (Calculation + Foresight + Illusion).** A prediction/initiative tree, so most of it is genuinely MANUAL (hidden declarations, fast/slow-turn choices, telepathy — no Foundry hooks). The automatable half **REUSES** the Calculation `nextTestMod` flag + the reminder-card pattern — **no new primitives, no data change, no pack rebuild.** Per-talent specs were proposed to Ben and signed off first.

### Per-talent
- **Intercept** (Reaction, 1 Inv) → on use → card → **disadvantage on the designated creature's next test** (`nextTestMod` disadvantage, count 1; "designated via Forewarned" owner-judged). Cost paid by the activation.
- **Reactive Analysis** (Special, 1 Inv) → on use → **advantage on YOUR next test** (`nextTestMod` advantage on self; "against them" owner-judged).
- **Read Intent** (1 Action, 1 Inv, `skill_test`) → rolls Blue + pays cost natively → reminder card (Blue vs the target's **Cognitive defense**; on a success the **GM reveals the creature's intended action**).
- **Collected** (passive) → **already done** (data-side `+2 Cog / +2 Spi` defenses AE; ⟳ Sync a stale owned copy).
- **Forewarned / Telepathic Network / Probable Outcome** → **MANUAL** (hidden "declare a character + action" + untracked "gain 1 Reaction"; scene-long telepathy + "share expertise"; changing your fast/slow choice — none have hooks).
- **Calculated Patience** (passive) → **MANUAL + a toggle**: new console/macro API **`edha.calculatedPatience(tokenOrActorOrName?)`** grants advantage on your next test (call it when you take a slow turn; reuses `nextTestMod`). Added to the `edha.*` API.

### Notes for Ben
- **Telepathic Network** is left as a narrative use-note (per your "default"); **Anticipate** (Calculation) still approximates "your Telepathic Network" as in-range Blue allies rather than a tracked membership — flag me if you want a literal network roster later.
- No GM-online dependency here (everything fires off the owner's own `useItem` / the API).

### LIVE-VERIFY: the **Blue / Foresight** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (Collected's AE is already in the pack from the White rebuild; nothing else is data-side). Couldn't self-verify (no Foundry session): the `nextTestMod` advantage/disadvantage application, the `edha.calculatedPatience` toggle, the Read Intent Cog-defense readout.

---

## 2026-06-14d DELTA — BLUE / CALCULATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Blue tree-by-tree begins: **Calculation (8) done.** The tree's signature is **cognitive control** — imposing or granting (dis)advantage on a creature's **next test**, plus Disorient. Every talent's cost is consumed by its own activation, and each one fires off `cosmere-rpg.useItem` **on the owner's own client** (where they hold their target) → so there's **NO GM-gating** (no "GM must be online" limit like the watcher-based trees) and **NO pack rebuild** (talents stay `events:{}`; deployed via `module-src-sync.js push`, F5/relaunch only). One new reusable primitive; the rest is reuse.

### New REUSABLE tool
- **Counted next-test (dis)advantage flag** — `flags.edha-content.nextTestMod = { mode:"advantage"|"disadvantage", count, skill:<id>|null, source }`. `edhaNextTest{PreRoll,Consume}` mirror the Black `advTest` / `cogDisadv` flags: pre-roll sets `roll.options.advantageMode` + `configureModifiers()` (and wraps `configureDialog`), the post-roll hook **decrements `count`** and clears at 0. `skill:null` = ANY test (skill/attack/item); a non-null skill gates to that skill id. `edhaSetNextTestMod(target, mod)` writes locally or relays via the existing **`set-flag`** action (so a player can debuff a GM-owned enemy). **Reach for this for any "give X (dis)advantage on its next N tests" talent.**
- **`edhaPostCalcTestCard` / `edhaCalcTestClick`** — a whispered card that applies the flag to a chosen creature (button-per-candidate, or a "target then click" fallback). `edhaPostCounterspellCard` — a reminder card showing the target's Cognitive defense (`system.defenses.cog.value`).

### Per-talent wiring (all on `useItem`)
- **Subtle Suggestion** — REUSES the Accord **disorient card** (`edhaPostDisorientCard`): on use, target → Disoriented with owner-relative expiry.
- **Pattern Recognition** — on use (pays 1 Inv), card → disadvantage on the target's **next test** (`nextTestMod` count 1).
- **Probability Cascade** — on use (Opportunity + 1 Inv; Opportunity is GM-trusted), card → disadvantage on the target's **next two tests** (count 2).
- **False Premise** (`skill_test`) — on use it **rolls Blue** + pays 1 Inv; the card shows the target's Cog defense and, on a judged success, applies disadvantage to their next test.
- **Anticipate** — on use (1 Inv), card lists **you + in-range (Blue) allies** → **advantage** on the chosen character's next test ("resistance test").
- **Counterspell** (`skill_test`) — on use it **rolls Blue** + pays 2 Foc + 1 Inv; a reminder card shows the activating creature's Cog defense (on a success the activated talent fails — GM-narrated).
- **Composed** — already done (data-side `+@tier` max-focus AE; the Blue copy already carries it, baked into the leyline pack by the White Bulwark rebuild).
- **Baleful** — **manual** (passive: "resist your influence costs +tier focus" — no Foundry hook for resisting influence).

### System facts used
- `cosmere-rpg.useItem` fires for **`skill_test`** activations too (confirmed in the 06-14c Accord pass), so Counterspell / False Premise post their cards on use AND roll Blue + pay cost natively — the engine only adds the apply/reminder step.
- The standing rulings cover the rest: "influence / success / objective" are owner-judged via a card button (Foundry tests have no DC); Disoriented auto-expires via the timed-status pass.

### Known limits / notes for Ben
- **`nextTestMod` with `skill:null` consumes the literal NEXT test** of any kind the target rolls (it can't tell which test was "meant"); like the Black `advTest`, it has **no round-expiry** (Pattern Recognition's "this round" qualifier isn't enforced — the flag persists until a test consumes it).
- **Subtle Suggestion text says "until the START of your next turn"** but the engine reuses the established Disoriented expiry = **END of your next turn** (the timed-status pass is turn-granular and can't express "start"); a one-turn over-extension. NOT changed — flagged per the no-balance-pass rule.
- A creature could in principle hold both a legacy `advTest`/`cogDisadv` flag and `nextTestMod`; whichever hook runs last wins the `advantageMode` write (negligible overlap — different trees/dispositions).

### LIVE-VERIFY (F5/relaunch — no Sync; nothing on the talents changed): see the **Blue / Calculation** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): `useItem` firing for the skill_test talents, the `nextTestMod` pre/consume + countdown across roll types, the `set-flag` relay onto a GM-owned enemy, the Disorient expiry window.

---

## 2026-06-14e DELTA — BLUE / ILLUSION specialty wired (ENGINE-ONLY off `useItem`; real summoned tokens via `edhaSummon`; NO pack rebuild)

Blue tree-by-tree continues: **Illusion (8) done.** A mostly **narrative** tree; the automatable half spawns **REAL friendly tokens** through the shared `edhaSummon` engine. **Per-talent specs + rulings were proposed to Ben and signed off BEFORE coding** (the first attempt was reverted for shipping without sign-off — see the PROCESS note up top). Engine-only/name-based off `cosmere-rpg.useItem`; **no data/authored change, no pack rebuild.**

### `edhaSummon` extended (reusable)
- **`spec.tokenSizeFt`** → sets the summon's prototype-token width/height (grid squares = `round(sizeFt / scene grid distance)`). Used by Holographic Illusion ([Size]-footprint token).
- **`spec.extraFlags`** → merged into the summon's `flags.edha-content` (Phantom Double sets `phantomDouble:true`).
- `defensePenalty: 99` is the idiom for **"no defenses"** (`max(0, casterDef − 99) = 0`).

### Per-talent (all on `useItem`)
- **Phantom Barricade** (1 Action, 1 Inv) → `edhaSummon` a friendly object: **HP `2d(2·@skills.blue.rank+2)`** (= 2[Die]), **speed 0, no attack, no defenses**, sustain-multiple. Cover + movement-block = the token's physical presence (GM positions); lasts until HP 0 / scene end.
- **Phantom Double** (2 Actions, 2 Inv) → drops the caster's existing illusion (**max 1**, `edhaClearPhantomDoubles`) then `edhaSummon` a copy of **you or the targeted ally** — token art via `edhaTokenArt(dup)`, **HP 1**, speed 0, no defenses, flagged `phantomDouble`. **Any hit drops it to 0 → the updateActor HP-watch deletes the illusion** ("attacks pass through harmlessly, ending it"). The Perception-vs-Blue-defense test + the "advantage vs those who failed" are **MANUAL/GM** (per a use-note), per Ben.
- **Holographic Illusion** (Free, 1 Inv) → `edhaSummon` a no-stats token (HP 1, speed 0, no attack) **sized to [Size]** via `tokenSizeFt`. Static; GM moves/edits it.
- **Living Image** (Special) → a use-note marking illusions mobile/interactive; the **1 Inv/round upkeep is GM-tracked** (narrative).
- **Ghostly Walls** (1 Action, 2 Inv, `skill_test`) → rolls Blue + pays cost natively; card → on a judged success, **Immobilize** the target (movement 0) until the **end of YOUR next turn** (owner-relative via `edhaApplyTimedStatus(expire:"owner")` — unlike Sovereign of Solitude's target-relative immobilize).
- **Absolute Stillness** (passive) → rider on Ghostly Walls: if owned, the target ALSO becomes **Weakened** (= "disadvantage on Physical tests"). "Cannot take Reactions" stays GM-tracked.
- **Redirect Momentum** (Reaction, 1 Inv, `skill_test`) → rolls Blue + pays cost natively; **reminder card** (Blue vs the mover's Athletics; reduce remaining move by **[Size]** or push **[Size] ft** — GM applies; Foundry has no "remaining movement").
- **Phantom Step** (passive, type `none`) → no `useItem` fires → **manual** (an ally may move +[Size] ft without provoking Reactions).

### Known limits / notes for Ben
- Summons need **ACTOR_CREATE** perm (GM, or a player the GM has granted it) — same as every other summon.
- `edhaSummon` drops the token **next to the caster** (no click-to-place), so the GM repositions the barricade/double/illusion. Movement reduction / push / cover / illusion fiction are GM-narrated.
- Phantom Double copies the chosen creature's **token art + name**, not its stats — it's a 1-HP prop; the "treat as real" + conditional advantage are GM-run.

### LIVE-VERIFY: the **Blue / Illusion** section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **F5/relaunch — no ⟳ Sync, no rebuild** (nothing on the talents changed). Couldn't self-verify (no Foundry session): the summon HP/size/art, the Phantom-Double delete-on-hit, the Ghostly Walls owner-relative immobilize + Absolute Stillness Weakened rider.

---

## 2026-06-14c DELTA — WHITE / ACCORD specialty wired (engine-only EXCEPT Unyielding Accord drag-AE = pack rebuild) → WHITE TREE COMPLETE

White tree-by-tree finishes: **Accord (8) done → the WHITE tree is fully wired (Coordination + Bulwark + Accord).** Accord is the most narrative tree — "influence", verbal accords, and "objective tests" have no Foundry events — so it leans on owner-judged cards + native conditions.

### System facts (verified)
- **`determined` and `disoriented` are native cosmere conditions** (`condition:true`, real icons — index.js ~L348/356) → toggle the icon with `toggleStatusEffect`; the mechanical rules are GM-applied (same as the §8b adversary Slowed/Afflicted templates).
- **`cosmere-rpg.useItem` fires for EVERY activation type** incl. `skill_test` (the hook is pushed to `postRoll` unconditionally — index.js ~L7206), so Counterpoint (skill_test) is caught by the use-hook.

### Rulings (Ben, 06-14c)
A = **build owner-relative auto-expiry** for Disoriented (ends at the end of the OWNER's next turn); B = Bound-by-Word **card**; C = Unyielding Accord **manual** (ships a drag-AE); D = Counterpoint/Overwhelming **cards** apply Disoriented; E = Voice of Authority is a **card** (reactions aren't tracked in combat) that re-rolls the enemy attack as disadvantage.

### Per-talent
- **Collective Resolve** — on use → toggle **Determined** on in-range allies.
- **Counterpoint / Overwhelming Authority** — on use → whispered card → apply **Disoriented** to the target (owner-judged success), with **owner-relative expiry**.
- **Voice of Authority** — `attackRoll`/`itemRoll` watcher: an enemy in range makes a hostile action → whispered card → spend 1 Inv → **re-roll the attack as disadvantage** (roll a 2nd d20, keep the lower, report `origTotal − origNat + keptNat`; GM applies the lower). Once/round/owner.
- **Terms of Accord** — on use → card to forge an accord with an in-range character; stores the owner's **White modifier** (rank + WIL) + whether the owner has Bound by Word, in `flags.edha-content.accord` on the partner (cross-actor via `set-flag` relay). The +1 to objective tests is GM-narrated.
- **Bound by Word** — `skillRoll` watcher on an accord partner with `accord.boundByWord` → whispered card → adopt the accord-maker's White modifier (`d20Nat + ownerWhiteMod`) in place of their own (owner-judged "objective test"; once/round/skill).
- **Disciplined Mind** — manual (no "resist influence" event).
- **Unyielding Accord** — data-side **transfer:false drag-template AE** `+1 Cog/Spi` (drag onto in-range allies adjacent to another ally; remove when they don't qualify). Pack-rebuilt + inspect-verified.

### New engine bits (reusable)
- **`edhaApplyTimedStatus(target, statusId, {owner, expire})`** + relay action **`apply-timed-status`** — toggle a status AND stamp an **owner-relative** `expireAfter` on its effect (the timed-status expiry pass already deletes any effect with `expireAfter`, so no need to add it to `EDHA_TIMED_STATUSES`). Reuse for any "status until the end of YOUR next turn."
- **`edhaWhiteMod(actor)`** = `@skills.white.rank + @attr.wil`.
- Accord cards (disorient / forge / voice-reroll / bound) — all `data-*` payloads, whispered, GM-gated watchers.

### LIVE-VERIFY: the Accord section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (the leyline pack was rebuilt for the Unyielding Accord AE). Couldn't self-verify: Disoriented owner-relative expiry timing, the Voice re-roll math at the table, the `apply-timed-status` relay, accord-flag persistence + the Bound-by-Word swap.

---

## 2026-06-14b DELTA — WHITE / BULWARK specialty wired (engine-only EXCEPT Hardy = pack rebuild + ⟳ Sync)

White tree-by-tree continues: **Bulwark (8) done.** A damage-mitigation / redirection / retaliation tree built almost entirely on the **`applyDamage` wrapper** (`edhaWrapApplyDamage`) — the same pre-pass/post-pass engine as Severance, heal-cut, and Mender's Instinct. NAME-BASED (talents stay `events:{}`) EXCEPT **Hardy**, which is a data-side ActiveEffect (so this pass DID rebuild the leyline pack — relaunch + **⟳ Sync**).

### Model (Ben's rulings, all defaults)
- **A — optional reactions use the Mender's-Instinct model:** the system applies damage synchronously, so an optional (player-choice + cost) reaction can't pre-empt it. Interposing Shield / Shared Burden / Unbreakable Line therefore post a **whispered post-damage card** that heals-back / redirects / revives. Net HP is identical; the hit briefly lands then is restored. **Passives** (Shield Wall, Devoted Conduit) have no choice → they truly **pre-reduce** in the wrapper pre-pass.
- **C1 — Devoted Conduit** ("damage intended for another creature") fires **only on REDIRECTED damage** (Shared Burden's "in their place" hit, tagged `options.edhaRedirected`) — the auto-detectable case.
- **D — tests are owner-judged:** Retributive Guard ("White vs Spiritual") and Unbreakable Line ("White DC = ½ damage") cards ACT on click; the player rolls the test and clicks only on success (mirrors Coordination 1c).
- **E — Guardian Stance stays a manual toggled-OFF +1 Deflect AE** (already baked; the adjacent ally's copy is tracked by hand). No engine.

### Per-talent
- **Hardy** — data-side AE `system.resources.hea.max.bonus += @level` (clone of Black; `_id` WhiteHardyMaxHP1). **Pack-rebuilt + inspect-verified.** (Green Hardy still lacks it — next carry-over.)
- **Shield Wall** (passive) — pre-pass: victim **adjacent** to a Shield Wall owner who has **≥2 adjacent allies** → −floor([Tier][Die]/2). (Chebyshev ≤1 square = adjacency.)
- **Devoted Conduit** (passive) — pre-pass: on REDIRECTED damage to an in-Attunement-Range ally → −floor([Tier][Die]/2).
- **Interposing Shield** (reaction, 1 Inv) — ally within 10 ft takes damage → card heals back **floor([Die]/2)** + "move 10 ft".
- **Shared Burden** (reaction, 2 Inv) — adjacent ally takes D → card heals them **floor(D/2)** and deals that to the owner as `vital` (tagged `edhaRedirected` → Devoted Conduit can reduce it; guarded against cascade).
- **Retributive Guard** (reaction, 1 Inv) — adjacent ally hit by an enemy in your Range → card deals **[Tier][Die] spirit** to the attacker.
- **Unbreakable Line** (special, 3 Inv, 1/round) — adjacent ally drops to 0 → card sets them to **1 HP** (DC = ceil(½ damage) shown).
- **Guardian Stance** — manual (baked toggled-OFF +1 Deflect AE).

### New engine bits (reusable)
- **applyDamage pre-reduce** (`edhaReduceInstances`) + **adjacency helpers** (`edhaAdjacent` Chebyshev, `edhaAdjacentAllies`).
- **Bulwark reaction cards** (`edhaBulwarkReactions` post-pass, GM-gated/whispered; `edhaPostBulwarkCard` + `edhaBulwarkClick`) with actions heal-ally / redirect / retaliate / revive — payload in `data-*` attributes (cross-client safe, per the 06-14 §10 gotcha).
- **`edhaCrossHeal` / `edhaCrossDamage`** — do-if-owner-else-relay (burst-apply) helpers; reuse for any cross-actor heal/damage from a card.
- `options.edhaRedirected` damage tag — "damage taken in another's place" (drives Devoted Conduit + cascade guard).

### LIVE-VERIFY: see the Bulwark section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. **Relaunch + ⟳ Sync** (Hardy changed the pack). Couldn't self-verify (no Foundry session): adjacency math at the table, the redirect re-entry + Devoted Conduit reduction, evaluateSync dice in the pre-pass, the GM-posted/owner-clicked card relay for cross-actor heals.

---

## 2026-06-14 DELTA — WHITE / COORDINATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

White tree-by-tree begins: **Coordination (8) done.** The tree's signature is the **Plot Die** ("raise the stakes") + ally-support — a mechanic family the Black tree never touched. Like Subjugation, it's a **NAME-BASED** engine block (`register-skills.js`, deployed via `module-src-sync.js push`; talents stay `events:{}`; NO `foundry-build`, NO ⟳ Sync — F5/relaunch only). The one data-side piece (Mending Aura's `edha-burst`) was authored earlier.

**Key system finding (verified in `cosmere-rpg` index.js):** the Plot Die injects EXACTLY like advantage — `D20Roll.hasPlotDie` reads `options.plotDie` (~L3780); `configureModifiers()` pushes the `PlotDie` term when set, idempotently (~L4017); the dialog seeds its checkbox from `data.raiseStakes` (~L3691); and the `skillRoll`/`attackRoll`/`itemRoll` hooks fire with an **already-evaluated** roll (~L5317→5321), so `roll.complicationsCount` / `opportunitiesCount` / `total` are readable post-roll.

### New REUSABLE tools
- **Plot-die grant primitive** — `flags.edha-content.plotDieNext = { skill:<id>|null, source }`. `edhaPlotDie{PreRoll,Consume}` mirror the `advTest` flag: set `roll.options.plotDie=true` + `configureModifiers()` (fast-forward) and wrap `configureDialog` to set `data.raiseStakes=true` (dialog). Skill-gated grants wait for the matching test. **Reach for this on any "raise the stakes / grant a Plot Die" talent.**
- **`edha.raiseStakes(tokenOrActorOrName, skillId?, source?)`** — console/macro API to grant the Plot Die manually (Unity of Purpose, or any GM call). Cross-actor writes relay via a new socket action **`set-flag`** (set any `edha-content` flag on a remote actor; a player rarely owns another PC).
- **Plot-grant card** (`edhaPostPlotGrantCard`) — lists in-range allies as buttons; click → `edhaGrantPlotDie` onto the chosen ally. Drives Guiding Signal + Concordant Presence (ruling 3 = chat-card recipient pick).
- **Coordination watcher** (`edhaCoordWatch`, post-roll `*Roll` hooks, **GM-gated**, cards **whispered to the owner**) — inspects each completed **ally-in-range** test (same-disposition token within the owner's White Attunement Range) and surfaces the matching card. Reuses a `coordRound` once/round store + `edhaWhisperIds`.
- **Coordination reaction card** (`edhaPostCoordReactionCard`) — whispered "you may react" card; click deducts the owner's OWN cost(s) (array of `{resource,value}`) + posts the result. Once/round/owner/talent gate (approximates the 1-reaction economy).
- **In-range ally helpers** — `edhaAttuneFtColor` / `edhaAlliesInAttune` / `edhaAllyInAttune` (color-parametric; the Black `edhaWithinAttune` was black-hardcoded).

### Per-talent wiring
- **Mending Aura** — already done (`edha-burst` heal, `floor([Tier][Die]/2)`).
- **Guiding Signal** (active) — `useItem` → grant card (cost paid by the activation; card is free).
- **Concordant Presence** (passive) — watcher posts a same-skill grant card (once/skill/round), owner clicks the recipient only if the triggering ally **succeeded** (ruling 1c — Foundry has no DC).
- **Beacon of Stability** — extends the White Draw Mana rider (`edhaDrawMana`): a cleanse card removes one condition from an in-range ally for 1 Inv.
- **Shared Conviction** (reaction) — watcher posts on a **plausible failure** (Complication or kept d20 ≤ 10); click spends 2 Foc + 1 Inv, adds the owner's White modifier (**rank + WIL**, ruling 2) to the ally's total.
- **Pillar of Order** (reaction) — watcher posts on an ally **Complication**; click spends 1 Inv → "Complication negated (blank face)" note (ruling 4 = tracked note, not a die re-render).
- **Unity of Purpose** — MANUAL (aid is untracked) → `edha.raiseStakes`.
- **Ordered Advance** — cost wired by activation; `useItem` posts a round note (no-provoke movement is GM-narrated; no opportunity-attack hook exists).

### Rulings applied (Ben, 2026-06-14)
1c = owner-judged "success"; 2 = White mod is rank + attribute (WIL); 3 = chat-card recipient pick; 4 = Pillar negation is a chat note; 5 = a granted Plot Die can roll its own Complication (intended — and Pillar can then negate it).

### Known limits
GM-gated watcher → the Concordant/Shared/Pillar cards only post when a **GM is online** (Guiding Signal / Beacon / `edha.raiseStakes` work from the owner's client regardless). "Would fail" / "succeeded" are owner-judged. Reaction economy is per-talent (global 1/round stays GM-tracked). **Hardy (White copy) still lacks the +level max-HP effect** — carry-over from Black; do in the White/Bulwark pass.

### LIVE-VERIFY (F5/relaunch — no Sync, nothing on the talents changed): see the White section of `EDHA_FOUNDRY_TEST_CHECKLIST.md`. Couldn't self-verify (no Foundry session this pass): Plot-Die dialog pre-check, `complicationsCount` read, the `set-flag` relay, the whisper routing.

---

## 2026-06-13c DELTA — BLACK / SUBJUGATION specialty wired (ENGINE-ONLY, name-based; F5/relaunch — NO pack rebuild)

Black tree-by-tree continues: **Subjugation (8) done.** Mostly focus-economy + control; the automatable half is a **NAME-BASED** engine block (like Blood Price / Sanguine Reservoir — fixed-canon passives, so the engine keys off the talent NAME, no per-talent rule; the talents stay `events:{}`). **Engine-only — pushed via `module-src-sync.js`; NO `foundry-build` (packs untouched).** Name-based engine passives now: Blood Price, Sanguine Reservoir, Whispered Doubt, Coercive Pressure, Predatory Insight, Siphoned Will.

- **Focus watcher** (`preUpdateActor`→`updateActor`, GM-side): a creature whose `foc` DROPS drives **Whispered Doubt** (enemy in your Attunement Range loses 1 more focus, once/round/enemy), **Coercive Pressure** (creature in range → disadvantage on its next Cognitive test, once/round/creature), **Predatory Insight** (you regain 1 focus when any creature hits 0). preUpdate stashes old→new in `options.edhaFoc`; `_edhaInFocusWatch` + `options.edhaFocusWatch` guard the follow-up writes.
- **Cog-disadvantage flag** (`flags.edha-content.cogDisadv`) — mirror of Weakened for int/wil tests; set by Coercive Pressure, consumed on the next cog test (pre/consume on `pre*Roll`/`*Roll`).
- **Next-test advantage flag** (`flags.edha-content.advTest = "<skillId>"`) — Predatory Insight active half (on use → `advTest:"dec"` → advantage on next Deception); consumed on the matching test. Generic (reusable for any "advantage on next <skill>").
- **Siphoned Will** — Hollow Command has NO success hook, so its `cosmere-rpg.useItem` posts a one-click **focus-confirm chat-card** (regain focus = tier) when the owner also has Siphoned Will (reuses `edhaPostTriggerCard`).
- **Composed** already done (ActiveEffect `+@tier` max focus).
- **Manual by nature (no Foundry enforcement):** Hollow Command/Puppeteer action-denial + forced actions, Extract Thought reaction-denial — rolls/costs are wired; the control is GM-narrated.
- **Isolation positioning — stays manual (no "moved adjacent" / willing-movement hook):** Cruel Step (10 ft toward an Isolated target, no Reactive Strike), Unnerving Approach (push an enemy's ally [Size] ft to strand it), Dread Presence (Weakened creatures can't close on allies) — Investiture costs are wired by activation; the displacement + Isolated check are table rulings (same GM-narrated convention as Ordered Advance / Redirect Momentum, pre-Momentum pilot).

**Known limits:** the focus watcher is GM-gated → it fires off GM-initiated focus changes (enemies spending / hitting 0 — the intended case); PLAYER-initiated PC focus changes don't trigger reactions (fine — Whispered Doubt is enemy-only, and it avoids self-debuffing allies via Coercive Pressure). Only bites creatures that actually spend `foc`. "Advantage this round" (Predatory Insight) has no round-expiry — the flag persists until the next Deception test consumes it. Relies on `options.edhaFoc` surviving to the GM's `updateActor` on the same client (true for GM-initiated changes).

**LIVE-VERIFY (F5/relaunch — no Sync needed, nothing changed on the talents):** GM spends an enemy's focus near a Whispered-Doubt PC → enemy loses 1 extra; near a Coercive-Pressure PC → its next int/wil test rolls disadvantage; drop any creature to 0 focus → Predatory-Insight owners gain 1; use Predatory Insight → next Deception rolls advantage; use Hollow Command while owning Siphoned Will → focus-confirm card.

---

## 2026-06-13b DELTA — BLACK TREE: ISOLATION + RITUAL SPECIALTIES COMPLETE + NEW ENGINE TOOLS (built + pack-verified via inspect-pack; relaunch + ⟳ Sync to load)

Tree-by-tree review reached the **Black** tree. **Isolation (8) and Ritual (8) specialties fully wired** in `data/authored/leyline-black.json` + `module-src/scripts/register-skills.js`; deployed via `node scripts/module-src-sync.js push`, rebuilt with `node scripts/foundry-build.js leyline`, spot-checked with `inspect-pack.js`. **The new tools below are reusable — reach for them on later trees.**

### New EVENTS
- **`edha-on-hit`** — fires when YOUR attack actually **APPLIES** damage (a real hit), dispatched by the `applyDamage` wrapper (`edhaDispatchOnHit`, `_edhaInTrigger`-guarded). Pair it with an `edha-triggered-effect`. **Owner-wide** for passive talents; **item-specific** for attack talents that carry `system.damage.formula` (only fires on THAT talent's own hit). **Use this — NOT `edha-deal-damage` — for any "on hit" effect** (deal-damage fires on every attack ROLL incl. misses; see the new §10 gotcha).
- **`edha-pre-test`** — sentinel for `edha-test-rider`, read by the pre-roll injector.

### New HANDLERS
- **`edha-test-rider`** — passively adds a bonus to a skill/attack **TEST**. The system can't buff a test from a passive, so we inject via its native "Temporary Bonus" field: resolve the formula and append the term to the d20 roll in `pre{Skill|Attack|Item}Roll` (works fast-forward AND dialog; no double-count). Fields: `appliesTo` (any/attack/skill/item), `bonusFormula`, `whenTargetStatus`, `whenTargetIsolated`. (Predatory Patience: +[Die] vs Weakened.)
- **`edha-ritual-hp-cost`** (event `use`) — the HP-cost **keystone**: caster loses HP = `formula` (rolled, so dice like half-[Die] work), flags Blood Price advantage, and banks Reserve if they own Sanguine Reservoir. (Withering Ray, Dark Investiture.)
- **`edha-heal-cut`** (sentinel `edha-apply-watch`) — on a matching-`color` attack hit, halve the target's healing until the **end of YOUR (owner's) next turn**. Fields: `color`, `fraction`. (Necrotic Grasp.)
- **`edha-triggered-effect` gained `whenTargetStatus`** — gate a trigger on the victim's status (checked in the executor and in the on-hit dispatch), mirroring the damage-rider's field. (Predatory Patience Inv-regain only vs Weakened.)

### New ENGINES / mechanics
- **Affliction damage engine** — the system has the `afflicted` icon but ZERO per-turn damage. Now `kind:affliction` triggered-effects STORE the rolled amount on the victim (`flags.edha-content.afflictions`) and **auto-deal it at the start of the carrier's turn** (`combatStart`/`combatTurnChange`, GM-gated, re-entrancy-guarded); cleared when the Afflicted condition is removed (`deleteActiveEffect`). (Dark Investiture — **Model A**: the hit deals an immediate [Tier][Die] tick AND sets up the ongoing affliction; one tick more than the strict text, the only way to auto-gate on success.)
- **Timed-status expiry generalized** — `EDHA_TIMED_STATUSES = {weakened, immobilized}` (was weakened-only). Immobilized (Sovereign of Solitude) now auto-expires end of its next turn. The same expiry pass also honors **owner-relative** coordinates (heal-cut stamps the OWNER's next-turn coord) — one engine, no duplicate.
- **Reserve** — flag-based pseudo-resource (`flags.edha-content.reserve`, cap = ranks in Black), mirrors the Temp HP infra; budget-bar readout `Reserve X / cap`. Banking is automatic (keystone). **Spending** Reserve (as Investiture / Double Dip's HP-substitution) is a tracked-manual ruling (Scope A).
- **Blood Price advantage** — ritual-HP-cost sets `flags.edha-content.bloodPriceAdv`; the next **Black** test rolls with advantage then clears it (`pre*Roll` sets, `*Roll` consumes; Black test = `roll.data.skill.id === "black"`). Mirror of the Weakened disadvantage pattern.

### Content deltas
- **Isolation:** Sapping Hex + Predatory Patience (Inv-regain) **retrofitted `edha-deal-damage` → `edha-on-hit`** (they were firing on missed rolls). Predatory Patience also got the test-rider; Sovereign of Solitude got immobilize-on-success. Spoils/Severance unchanged. Sapping Hex text/notes now say "becomes Weakened" (unified duration; stale "REMOVE MANUALLY" note gone — closes the 06-13 PENDING).
- **Ritual:** Hardy (ActiveEffect `+@level` max HP), Dark Investiture (HP cost + auto-affliction), Necrotic Grasp (heal-cut), Withering Ray (HP cost; attack+damage already correct), Blood Price + Sanguine Reservoir (keystone-driven, no per-talent rule), Double Dip (skill-test only; Reserve-spend manual), Predator's Due (already done).
- **NOTE — Hardy appears in White & Green trees too** (same talent/text); only the BLACK copy got the max-HP effect. Sync the others when those trees come up (or ask Ben).

### LIVE-VERIFY (relaunch + ⟳ Sync first)
Predatory Patience +[Die] only vs Weakened + Inv on a real hit; Sapping Hex/Predatory Patience DON'T fire on a miss; Dark Investiture afflicts + auto-ticks at the target's turn start (remove the icon to stop); Necrotic Grasp halves a hit creature's healing; Blood Price → advantage on the next Black test; Reserve readout grows as you pay ritual HP; Sovereign immobilizes on a hit. Couldn't self-verify: the half-[Die] cost formula resolving, affliction tick timing, heal-cut halving, Blood-Price advantage detection.

---

## 2026-06-13 DELTA — WEAKENED REWORKED TO A FIXED DURATION + GENERIC TIMED-STATUS EXPIRY (engine-only; F5 to load)

**Ruling (Ben): Weakened no longer self-consumes on the first physical test — it gives DISADVANTAGE on EVERY physical (str/spd) test while it lasts and ALWAYS falls off at the END of the affected creature's next turn.** The 06-11c consume-on-first-test model was too weak: it could vanish before the Black tree's Weakened payoffs (Spoils of Isolation / Sovereign of Solitude / Predatory Patience) got their turn.

- **Engine (`register-skills.js`, runtime-JS only — F5, packs untouched):** removed `edhaWeakenedPostRoll` + its `cosmere-rpg.{skill|attack|item}Roll` hook (the consume). Kept the pre-roll disadvantage hook — it now fires on every str/spd test, since the status persists.
- **New generic timed-status expiry pass:** an effect carrying `flags.edha-content.expireAfter = {round, turn}` is removed once the combat pointer advances PAST that coordinate (i.e. at the END of that turn), with a chat note. Runs on `combatStart` / `combatTurnChange` + a `ready` restore, GM-gated to one GM (same pattern as the def-buff refresh). **This is the turn-based expiry engine §9 said didn't exist — now it does, scoped to Weakened.** Reusable: any future timed effect (e.g. Pyre/hazard durations) can set the same `expireAfter` flag.
- **Stamping (`createActiveEffect`, GM-side):** Weakened stamps its NEXT-turn coordinate on apply — applied *before* the creature acts this round (turn index > current turn) → end of its turn THIS round; applied on/after its turn (incl. its own turn) → end of its turn NEXT round. Any apply path is covered (Sapping Hex, Black Draw Mana, manual toggle, `edha.toggleStatus`). Out of combat it isn't stamped on apply; the pass lazily stamps it once combat is running, then it expires normally.
- **LIVE-VERIFY (F5, no rebuild):** in combat, apply Weakened → confirm disadvantage on multiple str/spd tests (not just the first) and NO disadvantage on a Lore test → confirm it auto-clears at the END of the creature's next turn (chat note) → confirm Spoils of Isolation / Sovereign of Solitude / Predatory Patience still see it Weakened on the Outlaw's turn.
- ~~PENDING: Sapping Hex's "(REMOVE MANUALLY)" note~~ **DONE 2026-06-13b** (fixed + rebuilt in the Black pass).

---

## 2026-06-12 DELTA — PACK-PATH SCHISM FIXED + WORKFLOW HARDENING (disk-verified; in-Foundry verify = the standing 06-11b checklist)

**The 06-11b `packs/v3/` split had silently broken the whole round-trip** and poisoned a commit; all repaired this session:

- **What was broken:** module.json pointed Foundry at `packs/v3/` but extract/build/guard/validators all still targeted `packs/` → the guard protected nothing, builds wrote where Foundry never looked, "validation passed" validated dead packs, and the 06-12 full extract (commit 8456a97) captured **stale pre-v3 content** into `data/authored/` (zero v3 rules — the "25 un-extracted edits" it reported were the v3 diffs seen backwards). Because the authored overlay wins over generator + side-files, the next rebuild would have stripped the v3 automation from ~25 talents.
- **Fix:** consolidated to **`packs/` as the one true path** (copied v3 content over the stale dirs, reverted module.json; `packs/v3/` is dead — delete on sight). Re-extracted all 365 talents from the real packs (v3 rules confirmed present in `data/authored/`), rebuilt all 4 packs (counts match v3: events:36, effects:14, rollable:89, overlays:365), validators passed, and v3 rules spot-checked in the WRITTEN packs (Life Surge overflow-thp, Vital Diagnosis apply-status, Severance convert, Spoils sweep).
- **Effect projection extended (`edha-pack-io.js`):** ActiveEffect **`duration` / `statuses` / `type` now round-trip** (normalized so Foundry-stamped defaults fingerprint identically to absent fields). Timed/ongoing effects and condition icons survive extract — required for the tree-by-tree effects work.
- **Tools moved into the repo** (`scripts/`): `validate-packs.js` (replaces `C:\tmp\validate2.js`; now also counts events/effects and reads via temp-copy = safe with Foundry open), `validate-adversaries.js` (also checks baked effect keys), `inspect-pack.js` (CLI: `node inspect-pack.js edha-deity "Life Surge"` or `--group Red` — prints a talent's rules/effects as Foundry loads them). `run-playtest-build.bat` updated. The `C:\tmp` copies are obsolete.
- **Module runtime is now in git:** `module-src/` mirrors `register-skills.js` + `module.json` + `styles/edha.css` + `lang/en.json` via **`node scripts/module-src-sync.js [pull|push]`**. AppData has no other backup — **run a pull + commit after every engine edit.**
- **AUTHORING RULE (supersedes §9's "author side-file entries"):** all 21 trees are authored overlays now, and overlays MASK side-file entries for existing talents. Author per-talent behavior **in Foundry → extract**, or **hand-edit `data/authored/<atlas>-<tree>.json` → build**. Side-files = bootstrap history; new mechanic PATTERNS = new handler types in register-skills.js.

**NOTE: the installed system is cosmere-rpg v2.1.0** (older text below may say 2.0.4 — the system updated; v2.1.0's native event dispatch is verified working).

---

## 2026-06-11c DELTA — WEAKENED MECHANIC ⚠ SUPERSEDED by 06-13

Original model: disadvantage on the next str/spd test, then consumed. Replaced by a fixed end-of-next-turn duration (06-13). Still current: the pre-roll disadvantage on str/spd tests (`cosmere-rpg.pre{Skill|Attack|Item}Roll` → seed `advantageMode`, wrap `configureDialog`; actor via `edhaD20RollActor`). The post-roll consume was removed. Full history in agent memory.

---

## 2026-06-11b DELTA — V3 ENGINE PASS (built + pack-validated; ⚠ NOT LIVE-VERIFIED — run the checklist below before playtest)

Goal: clear the deferred backlog — the §9 engine to-dos and the triage doc's B-bucket ("trigger-v2 / engine-needed"). Everything below is authored, built into the packs, and verified at the LevelDB level (rules present, effects keyed correctly, `node --check` clean on both scripts); **nothing has run inside Foundry yet**.

### Engine (register-skills.js, now ~2384 lines, v0.2.0)
- **Custom statuses registered:** `weakened` (condition:true), `diagnosed` (mark), `insight` (STACKABLE, Gnothis counter). Added to BOTH `CONFIG.COSMERE.statuses` and `CONFIG.statusEffects` at module init (the system maps statuses→statusEffects in its OWN init, which runs first). Bonus: **Black Draw Mana now auto-applies Weakened** (its `CONFIG.COSMERE.statuses.weakened` check finally finds one). Icons: downgrade/eye/book.svg (core `icons/svg/` set — verify they render; a 404 = blank status icon).
- **New event types:** `edha-take-damage` (real: hook `cosmere-rpg.applyDamage`, document = VICTIM; `TRIG_EVENT` maps `take-damage` now — Prognosis-style watchers no longer emit nothing), `edha-apply-watch` (sentinel for rules read by the applyDamage engine).
- **New handler types:** `edha-apply-status` (mark a target + record owner in `flags.edha-content.markedBy.<status>`; optional party bonus damage), `edha-status-sweep` (damage all [status] creatures in range, THP = total), `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit` (all sentinels read by engine glue).
- **applyDamage wrapper overhauled** (pre-pass mutates instances BEFORE apply, post-pass reacts after): Severance vital conversion vs Isolated victims; Vital-Diagnosis +Tier vital bonus instance on ANY damage vs the marked creature; heal-overflow→Temp HP; Prognosis 1-Inv-per-round when the Diagnosed creature takes damage; Mender's Instinct chat-card prompt when an ally character crosses to ≤ half HP. **Isolated is computed live** (no ally token within 10 ft) — `edha.isIsolated(actor)` to test.
- **Riders** gained `whenTargetCondition` / `whenTargetStatus` filters (checks YOUR CURRENT TARGET — target before rolling). **Triggered effects** gained `whenTargetIsolated` + kind `status` (apply a status; GM-relayed via new socket actions `toggle-status` / `apply-status-mark`). Trigger heals can now target the VICTIM (`target:"victim"`), with a burst-relay fallback when the healer lacks perms.
- **Summons** can carry baked toggled-off ActiveEffects + extra baked abilities (`bakedEffectsJson`/`extraItemsJson` on the rule): Forge Construct now bakes **Siege Form** (Speed 0 via override, deflect 3) + a **Siege Cannon** ranged attack resolved vs the caster at summon time.
- **Edha derivations** (characters only): HP = system + 1 (skipped while the actor's SOURCE still carries a manual `hea.max.bonus` — the pregens), Speed = 20 + 5×SPD + effect bonuses (skipped while the source carries its own movement override). **Run `edha.migrateDerivations()` once as GM** to strip the pregens' per-actor hacks so the derivations take over. Investiture source-override clamp gotcha now self-heals: the derivation PERSISTS `inv.max.{override,useOverride}` to the actor source once per session.
- **⟳ Sync flake hardened:** retries `pack.getDocuments()` vs `pack.index` up to 5× with backoff, warns if still short.
- **API additions:** `edha.migrateDerivations()`, `edha.isIsolated(actor)`, `edha.toggleStatus(actor, statusId, active)`.

### Generator + tables
- `foundry-build.js`: emits the above from **`data/talent-state.json` (NEW)** — kinds: mark / sweep / convert / marked-watch / hp-threshold / multi-hit / overflow-thp; riders + triggers gained the new filter passthroughs; `talent-effects.json` entries may now set `transfer:false` (apply-to-target template) + `statuses:[...]` (token icon).
- **`data/adversary-effects.json` (NEW):** the 17 §8b hand-built world-actor effects, extracted VERBATIM from the live world (Stitchmother Phase 2 / Vital Diagram, Frost Lance Slowed, Brace ×2, trackers, etc.) and baked into the edha-adversaries pack as `!actors.items.effects!<actor>.<item>.<effect>` sub-keys (same split as talent packs; key shape verified against the system's companions pack). **Pack re-imports now keep the adversary automation.**
- Entries authored (B-bucket cleared): Vital Diagnosis (mark, +Tier vital), Prognosis (marked-watch + conditional heal rider), Severance (convert), **Sapping Hex** (deal-damage trigger, Isolated filter → Weakened), **Spoils of Isolation** (sweep; its old flat-roll entry REMOVED to prevent double-apply — rollable count 90→89), Mender's Instinct (hp-threshold), Flashpoint (multi-hit, red), Life Surge + Overgrowth (overflow-thp; the heroic plant 'Overgrowth' twins get the inert rule too — harmless). Forge Construct summon spec gained Siege Form/Cannon.

### Build & packs — ⚠ the `packs/v3/` split here is SUPERSEDED by 06-12 (consolidated back to `packs/`; v3 dirs are dead). Build counts at the time: talents:365 events:36 effects:14 rollable:89; adversaries 9/30 + 17 baked effects; all pack-level spot-checks OK.

### LIVE-VERIFY CHECKLIST (next session / before playtest)
1. **Full relaunch** (module.json changed — F5 is not enough). Confirm the module loads (console: "native event system registered" with the v3 handler list) and all 4 compendia populate from `packs/v3/`.
2. **⟳ Sync** all characters (rerun if short). 3. **`edha.migrateDerivations()`** once as GM → check HP max and Speed on all 4 PCs match the sheets (HP system+1, Speed 20+5×SPD; Walking Ruin still +10 on the Demolisher).
4. Token HUD shows Weakened/Diagnosed/Insight icons (404 icon = swap `EDHA_STATUSES` icon paths). Black Draw Mana auto-applies Weakened in range.
5. **Outlaw:** hit an Isolated dummy → Weakened auto-applies (Sapping Hex) + damage applies as VITAL (Severance chat note); Spoils of Isolation vs ≥1 Weakened enemy → per-target vital + THP = total.
6. **Vivisectionist:** Vital Diagnosis (target first!) → Diagnosed icon + chat; any damage vs the marked creature gains +2 vital; Prognosis recovers 1 Inv (once/round); Verdant Mend vs a conditioned target heals +[Tier][Die] (rider — target BEFORE rolling); Life Surge past max → overflow Temp HP; ally to half HP → Mender's prompt heals the ALLY.
7. **Demolisher:** Flame Surge capturing 2+ → Flashpoint prompt (regain 1 Inv button). Arc Flash regression.
8. **Forgemaster:** Forge Construct summon carries the toggled-off Siege Form effect + Siege Cannon item.
9. **Adversaries:** import a fresh Stitchmother from the pack → Phase 2 / Vital Diagram effects present (re-import no longer loses them).
- Known manual bits: most status DURATIONS still have no expiry engine — remove by hand (EXCEPTION: Weakened now auto-expires at the end of the creature's next turn via the generic timed-status pass — see the 06-13 delta); Sapping Hex fires on the damage ROLL (not a confirmed hit) vs your current target; Lay Foundation persistent friendly zone still missing (region-buff engine); Crown of Thorns still manual (no "which defense was tested" hook).

### New gotchas (operator)
- **Cowork-sandbox mounts serve STALE copies of host-edited files** (new content truncated to the old byte length!) and **cannot delete** module files (EPERM on unlink). Hence: build to NEW dirs (`packs/v3/`), syntax-check by reconstructing head+tail, never trust `wc`/`node --check` through the mount on a file edited host-side this session.
- Item updates that worked: creating files + overwriting bash-written files through the mount is fine; LevelDB pack WRITES to fresh dirs are fine.

---

## 2026-06-11 DELTA — playtest-PC manual-talent triage pass-1 (built, synced, live-verified; world is playtest-ready)

Full triage + per-talent design notes: `TRIAGE_PLAYTEST_PC_MANUALS.md` (next to this doc). Summary:

- **5 new table entries authored + built (deity, heroic; leyline untouched) + ⟳ Synced + live-verified:**
  - **Warlord's Advance** (talent-triggers, `on:kill` → THP `@tier` self) — the `{resource:"inv", value:0, optional:true}` trick WORKS: a 0-cost confirm chat-card button posts on any presumed kill; click only if the kill came from this attack. Verified end-to-end (Trooper kill → button → THP {value:2, source:"Warlord's Advance"}).
  - **Swift Healer** (talent-riders, `appliesTo:"heal"`, `@skills.med.rank`) — verified: Verdant Mend rolled `(2)d(2*3+2) + 6 + 2`.
  - **Vigilant Stance / Flamestance** (talent-effects) — toggled-off indicator AEs (changes:[]; sheet toggle only, no token icon — `statuses` is hardcoded `[]` in the build). Mechanics manual.
  - **Lay Foundation** (talent-targeting, plain aoe-template, sizeFt:5) — works but the template is TRANSIENT (the aoe handler deletes it after capture/targeting). Net value = cost consumption + use card; the persistent Foundation zone still needs a manual drawing. Pull the entry if it annoys.
- **Triage verdicts:** most §8a "Manual" talents are blocked on Phase-3/engine work, not table entries — Severance + Spoils-THP (conditional-vs-state / damage-fed THP), Sapping Hex (custom Weakened status), Prognosis (`edha-take-damage` event — CONFIRMED a take-damage table entry emits NOTHING today, triggerRule returns null), Life Surge/Overgrowth overflow-THP, Vital Diagnosis marker (needs `transfer:false` passthrough in talentEffects — bundle with the §8b adversary-effects bake). Forgemaster's kit is mostly narrative → stays manual.
- **NEW GOTCHA — Investiture source-override clamp:** the system's own prepare clamps `inv.value` against `max.value` BEFORE the module's Investiture derivation applies its runtime override — an actor whose SOURCE lacks `inv.max.{override, useOverride:true}` gets its current Inv clamped to 0 every prepare (src value survives untouched; the sheet just shows 0). The Demolisher had the source override (why it never showed the bug); Outlaw/Vivisectionist/Forgemaster didn't. FIXED by persisting source overrides (5/5/6 = canon 2+max(AWA,PRE)). If a future PC shows inv 0 after a reload, this is why. Consider doing the same persistence inside `edhaDeriveInvestiture` (actor.update once, instead of per-prepare in-memory override).
- **World prep done (2026-06-11):** player ownership + character assignment set — **Amertron→Outlaw, Laustarr→Demolisher, Spidercam→Forgemaster; Vivisectionist = GM-run spare** (NOT Forgemaster as §8b guessed). Outlaw token placed by the party (was missing — only 3 PCs had tokens). All 4 PCs at full Investiture. combats=0, templates=0, Playtest Map active, game paused. Test artifacts cleaned (Trooper HP restored, test THP cleared, temp tokens deleted); a few test chat cards from this session remain in the log (harmless — delete by hand if wanted).
- Build counts now: deity events 11 / effects 1; heroic events 7 / effects 8. `VALIDATION PASSED ✓`, 0 issues. `scripts/run-playtest-build.bat` exists for one-click deity+heroic+validate (writes `scripts/build-log.txt`).

---

## 1. What this is

Port the **Edha** homebrew talent/skilltree system (Cosmere RPG homebrew) into **Foundry VTT** as a content module **`edha-content`**, built on the community **cosmere-rpg** system. Three talent atlases (leyline / deity / heroic) + a playtest-adversary pack, plus runtime automation (rolls, triggers, Temp HP, summons, targeting, Draw Mana, Investiture derivation).

As of 2026-06-09 talent behaviors are hosted **natively and exclusively** on each talent — `system.events` rules + `effects` ActiveEffects — visible and editable on the talent's Events/Effects tabs (see §7). There is NO parallel runtime behavior store; `register-skills.js` is a thin generic engine that reads the on-talent rules.

## 2. Environment & paths (Windows)

- **Foundry VTT v13.351** (Electron) at `C:\Program Files\Foundry Virtual Tabletop`. User data at `C:\Users\benhe\AppData\Local\FoundryVTT\`.
- **System:** `cosmere-rpg` v2.0.4 at `…\FoundryVTT\Data\systems\cosmere-rpg\index.js` (minified ~28.7k lines; grep it for facts — hooks/handlers use templated strings, so grep the SUFFIX e.g. `damageRoll`, `registerItemEventHandlerType`). Unminified core Foundry API lives in `C:\Program Files\Foundry Virtual Tabletop\resources\app\{client,common}\**\*.mjs` (grep here for Region/ActiveEffect/document APIs).
- **Public icons:** `C:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons` — **verify icon existence with a WINDOWS path** (`C:/Program Files/...`); an MSYS `/c/...` path makes node `fs.existsSync` return false for everything. A 404 icon = invisible/unselectable tree node.
- **Our module:** `…\FoundryVTT\Data\modules\edha-content\` — `module.json` (now declares the `RegionBehavior.hazard` documentType), `scripts/register-skills.js` (the runtime; hand-edited here), `styles/edha.css`, `lang/en.json`, `data/*.json` (runtime tables, copied at build), `packs/{edha-leyline,edha-deity,edha-heroic,edha-adversaries}` (LevelDB).
- **Source (canonical):** `C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\` — `data/leyline.json` (125), `data/domain.json` (90 deity), `data/cosmere.json` (375; only 6 heroic paths ×25 = 150 in scope), `data/adversaries.json` (9), + the behaviour tables (see §5). `scripts/foundry-build.js` (generator) + `scripts/talent-icons.js`.
- **Validators/inspectors (in `Skilltrees/scripts/` since 2026-06-12; the old `C:\tmp` copies are obsolete):** `validate-packs.js` (talent packs), `validate-adversaries.js` (adversary pack incl. baked effect keys), `inspect-pack.js <pack> "<Name>"` / `--group <Tree>` (print a talent's emitted events/effects). All read via temp-copy → **safe with Foundry open**.

## 3. Build / validate / when to rebuild vs F5

- **Build:** `cd "…/Skilltrees/scripts" && node foundry-build.js [leyline|deity|heroic|adversaries|all]` (default all). **NOTE: single scope arg only** (`leyline deity` runs leyline ONLY; run twice or use `all`). Deterministic 16-char ids (`fid`). Rewrites the LevelDB packs (effects as `!items.effects!` sub-keys), writes tree-background SVGs, bakes per-talent `system.events` + `effects`, and **deletes any stale runtime-table copies from `modules/edha-content/data/`** (tables are generator inputs only). Portable: `EDHA_DATA`/`EDHA_MODROOT` env overrides + classic-level fallback (`npm i classic-level` + NODE_PATH off-machine).
- **Validate:** `node validate-packs.js` (expect `VALIDATION PASSED ✓`, 0 issues); `node validate-adversaries.js` after adversary builds.
- **FOUNDRY MUST BE CLOSED to rebuild** (LevelDB lock). Check: PowerShell `Get-Process | ? {$_.ProcessName -match 'foundry|electron'}`. From inside a running world, `game.shutDown()` returns to Setup and **releases the pack locks** (no full quit needed) — but re-launching the world hits the GM join-password gate.
- **Rebuild needed** for anything baked into the packs: talent text/roll-data (DETAILS), **native `system.events` rules + `effects` ActiveEffects**, tree layout, icons, path events/grants, adversary stat blocks, the Draw Mana item.
- **F5 (reload) re-runs init/setup/ready** → reloads `register-skills.js` (the registered event/handler types, the `edha-content.hazard` Region behavior, all runtime helpers + JSON-table fallback). `module.json` changes (e.g. documentTypes) need a full world relaunch, not just F5.
- **Embedded-talent SNAPSHOT gotcha:** talents already on an actor are frozen copies. After a pack rebuild, re-sync owned talents: budget-bar **⟳ Sync Talents** button or `edha.syncNow()`. Sync now also carries `system.events` + `effects`.

## 4. The `edha.*` console/macro API (operate it solo)

Exposed at `game.modules.get("edha-content").api` and global `edha`:
- `edha.syncNow(actor?)` / `syncAllCharacters()` — re-pull roll data + native events/effects onto owned talents after a rebuild.
- `edha.grantDrawMana(actor?)` — add Draw Mana to a character who added their leyline path before Draw Mana existed (or just re-add the leyline path).
- `edha.resetTriggers(actor?)` — clear once-per-round trigger locks (testing).
- `edha.fixSettings()` — force `applyButtonsTo` → Prioritise Targeted.
- `edha.showRange(item|name)` — draw the Attunement-Range ring.
- `edha.aoe(item)` / `edha.summon(actor,name)` / `edha.setTempHp(actor,n,src)` / `edha.getTempHp(actor)`.
- `edha.clearKindleLights()` — restore tokens' pre-Kindle lighting (also auto on `deleteCombat`). `edha.refreshDefBuffs()` — re-sync Know-Your-Moment-style defense buffs to the current combat turn (e.g. after a mid-combat reload).
- `edha.raiseStakes(tokenOrActorOrName, skillId?, source?)` — grant a Plot Die (White / Coordination). `edha.calculatedPatience(tokenOrActorOrName?)` — grant advantage on the actor's next test (Blue / Foresight's Calculated Patience; call it when you take a slow turn).

## 5. Behaviour tables (generator INPUTS ONLY; in `Skilltrees/data/`; NEVER read at runtime)

These tables are **generator INPUTS only** (2026-06-09): `foundry-build.js` emits each entry as a native `system.events` rule (or an `effects` ActiveEffect) on its talent. They are **NOT copied to the module and NOT fetched at runtime** — the build deletes any stale `modules/edha-content/data/talent-*.json` copies. The runtime reads behaviour exclusively from each talent's own rules/effects.

**⚠ MASKED SINCE 2026-06-12:** all 21 trees now have authored overlays (`data/authored/`), which **win over these tables** — a new table entry for an existing talent does nothing. Author per-talent behavior in Foundry (→ extract) or by hand-editing `data/authored/<atlas>-<tree>.json` (→ build). The tables below are kept as bootstrap history + schema reference for the rule shapes the engine understands.

- `talent-rolls.json` — per-talent Skill Test + Damage (→ baked into `system.activation`/`system.damage`, the DETAILS tab; native + editable). 90 rollable.
- `talent-riders.json` — passive damage riders (Kindle, Mighty) → `edha-damage-rider` rule (incl. **`lightRadiusFt`** for Kindle's "damaged creatures shed light"); applied by the `rollDamage` wrapper / `applyDamage` wrapper, which READ the native rule.
- `talent-thp.json` — Temp HP grants → `edha-temp-hp` rule on `use`.
- `talent-summons.json` — summon stat blocks → `edha-summon` rule on `use`.
- `talent-triggers.json` — triggered effects → `edha-triggered-effect` rule on `edha-deal-damage` / `edha-on-defeat`, incl. the **`whenDamageType`** filter (e.g. Arc Flash = energy-only). Dispatched NATIVELY by the system's event engine (no take-damage entries currently exist; add an `edha-take-damage` event type when one does).
- `talent-targeting.json` — **point-burst config**: a `burst:{}` block is emitted as an `edha-burst` rule (event `edha-pre-use`) carrying size/range/save/heal/terrain — the preUseItem engine READS that rule (supersedes the `edha-aoe-template` rule for those talents). Range preview (⊙ button) needs NO data (color derived at runtime).
- `talent-hazards.json` **(new)** — dangerous terrain (Set Charge, Pyre, Fault Line) → `edha-place-hazard` rule on `use` → drops a scene-scoped Region with the `edha-content.hazard` behaviour.
- `talent-effects.json` — passive numeric buffs (Walking Ruin +Speed) → native ActiveEffects baked into the pack (key e.g. `system.movement.walk.rate.bonus`, mode ADD). **The old strip-on-load issue is FIXED** (effects are written as separate `!items.effects!` LevelDB keys — see §7).
- `talent-defense-buffs.json` — defense bonus for a combat-timing window (Know Your Moment) → an **`edha-defense-buff` rule ON the talent** (event `edha-combat-timing`; amount/defenses/window/label editable on the Events tab). The engine's core combat hooks read that rule and toggle the matching actor ActiveEffect. Pattern for any "+N defense/stat for a window" talent.
- `talent-state.json` **(v3)** — state mechanics, one entry or ARRAY per talent. Kinds: `mark` (apply status + record owner + party bonus dmg — Vital Diagnosis), `sweep` (damage all [status] in range, THP=total — Spoils of Isolation), `convert` (damage type vs Isolated — Severance), `marked-watch` (resource regen when your marked creature takes damage — Prognosis), `hp-threshold` (ally-at-half prompt — Mender's Instinct), `multi-hit` (2+-capture prompt — Flashpoint), `overflow-thp` (heal overflow → THP — Life Surge/Overgrowth).
- `adversary-effects.json` **(v3)** — adversary item ActiveEffects (advName → itemName → [effects]), baked into the edha-adversaries pack so re-imports keep the §8b automation.
- Draw Mana riders + Investiture formula + HP/Speed sheet derivations are **hardcoded** in register-skills.js (small, fixed canon).

## 6. Settings the user must have

- **`applyButtonsTo` = 4 (Prioritise Targeted).** REQUIRED for the auto-target AoE model — at the default 0 (SelectedOnly) the chat Apply buttons ignore targets and only hit the selected token. The module force-sets it on load (GM); also Configure Settings → cosmere-rpg → "Apply damage/healing to" → Prioritise Targeted, or `edha.fixSettings()`. When clicking Apply, don't re-target between casting and applying.

---

## 7. THE NATIVE EVENT/EFFECT SYSTEM — ✅ 2026-06-09: BEHAVIOR LIVES ON THE TALENTS (re-refactor complete)

### §7.0 — 2026-06-09 RE-REFACTOR (READ FIRST; supersedes the 2026-06-08b corrections below)

**Every automated talent now carries its behavior ON the item**: `system.events` rules (Events tab, fully editable via the auto-rendered rule dialog) + `effects` ActiveEffects (Effects tab) + the roll on DETAILS. `register-skills.js` is a thin generic engine: it registers event/handler types, generic executors, and engine glue (burst targeting UI, GM socket relay, combat-turn timing, rollDamage/applyDamage wrappers) that READ the on-talent rules. **The legacy runtime behavior store is DELETED** — no table loaders, no side-file fetches, no name-keyed dispatch; `modules/edha-content/data/` ships no talent tables.

**Definition-of-done loop VERIFIED LIVE**: unlocked the heroic pack, opened Know Your Moment's Events tab in the UI, edited Bonus amount 2→3 in the rule dialog, ⟳ Sync, started combat → actor showed +3 (phy 14→17); reverted to 2 the same way. No code/side-file edits.

**Blocker 1 RESOLVED — native damage-trigger dispatch WORKS (cosmere-rpg v2.1.0).** The 2026-06-08b "edha-deal-damage / edha-on-defeat never fire" finding was caused by **stale owned snapshots**: the talents on the test actor carried ZERO native rules (never re-synced after the events migration), so there was nothing for the engine to fire. After `⟳ Sync`, Arc Flash's own on-talent rule fires natively off `cosmere-rpg.damageRoll` — watched live. Two engine details discovered:
- the system fires the `damageRoll` hook **TWICE per rollDamage (main roll + graze roll)** → the `edha-deal-damage` event type has a 400 ms per-item **debounce in its `condition`** so one logical hit dispatches once;
- the energy-only filter (formerly `when.damageType` in the side-file) is now a **`whenDamageType` field on the rule** (editable; the executor checks it against the triggering roll's damage type).
The old runtime workaround (legacy dispatcher reading talent-triggers.json, no-op native executor) is **REMOVED**; the native `edha-triggered-effect` executor is the real implementation (optional-cost rules post the chat-card button; unconditional rules fire immediately; `edha-on-defeat` passes the victim via `event.options.victim`).

**Blocker 2 RESOLVED — on-talent ActiveEffects survive the compendium.** Root cause (the `_stats` theory was wrong): **Foundry LevelDB packs store embedded ActiveEffects as SEPARATE `!items.effects!<itemId>.<effectId>` keys, with the parent item's `effects` field holding only ID strings** (verified against the system's own heroic-paths pack). The old build baked full effect objects inline in the item doc, which Foundry silently ignores on load. `writePack()` now does the split (and `edha-pack-io.js#readPack` reassembles them for fingerprints/extract). Verified live: Walking Ruin loads from the pack with `effects.size=1`, shows "Walking Ruin — Speed" on its Effects tab, and applies on a character (Speed 30→40; `CONFIG.ActiveEffect.legacyTransferral=false` means transfer:true item effects apply to the actor directly).

**Point-targeted bursts — now rule-driven.** The burst CONFIG lives in an **`edha-burst` rule on the talent** (event `edha-pre-use`, a sentinel type: never dispatched; the engine reads it). Fields (all editable on the Events tab): sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain. Engine glue unchanged: `cosmere-rpg.preUseItem` takeover (returning `false` cancels the default `use()`) → consume cost → range ring + **click-to-place** template (`edhaPickPoint` reads `canvas.mousePosition`, grid-snapped) → chat **Detonate** button captures everyone inside, auto-rolls saves for half, applies (GM-direct or socket relay), drops terrain. Damage formula+type still read from the talent's own `system.damage`; owned riders (Kindle) still added. Verified live on Flame Surge (cast → ring 60 ft → place 10 ft burst → Detonate resolves). **`preUseItem` takeover remains THE pattern for any talent that doesn't fit the single-target attack card.**

**Player-accessible writes via a GM SOCKET RELAY (unchanged).** applyDamage on GM-owned enemies + Region terrain + token light + actor effects all need GM perms. The burst Detonate resolves rolls on the clicking client then relays the privileged writes to the **primary active GM** (`game.socket.on("module.edha-content")`, gated `game.users.activeGM.isSelf`, applier `edhaApplyBurstResults`). Required **`"socket": true` in module.json → a world RELAUNCH**, not just F5. **LESSON: any mechanic that writes to GM-owned docs must run GM-side; for player actions, relay through this socket.**

**Kindle light & defense buffs — now rule-driven:**
- **Kindle light** — config is the **`lightRadiusFt` field on Kindle's own `edha-damage-rider` rule** (0 = none). The `applyDamage` wrapper reads owned rider rules to decide light; source attribution unchanged (explicit `options.edhaSource` from bursts → `originatingItem` → recent damage-roll breadcrumb → killer-candidate heuristic); clears on `deleteCombat` / `edha.clearKindleLights()`. Verified live (token light dim=5/bright=2.5).
- **Defense buffs / Know Your Moment** — the **`edha-defense-buff` rule on the talent** (event `edha-combat-timing`, a sentinel) holds amount/defenses/window/label/img. Engine: defenses are `DerivedValueField` (`value = base + bonus`) → toggled ActiveEffect on `system.defenses.*.bonus`; the cosmere system has NO turn hooks → Foundry **core** combat hooks (`combatStart`/`combatTurnChange`/`deleteCombat`) call `edhaRefreshDefBuffs`, which recomputes every combatant from initiative order and reads the rule from owned talents. Verified live (14→16 before turn, removed on turn; +3 after the UI edit).

**⟳ Sync rewritten (2026-06-09) — replace-not-merge + identity matching:**
- Item updates MERGE `system.events`, so stale rules lingered forever; sync now emits a **`-=<ruleId>: null` deletion** for every existing rule the pack source no longer carries, and **prunes stale embedded effects** (delete-by-id after update). Owned talents end up EXACTLY mirroring their pack source (rules + effects).
- **28 talent names collide across trees** (365 talents → 337 unique names), so name-only matching is ambiguous; sync matches by **`atlas|group|name`** (from `flags.edha-content`) with plain-name fallback.
- **Caveat:** calling sync within ~seconds of a pack write (editing a pack item, lock/unlock) can update fewer talents than expected (`pack.getDocuments()` returns a partial set mid-reindex; a retry guard exists but isn't bulletproof). Sync is idempotent — **run it again**; verify with the rule-id checker if paranoid.

**Robustness checklist (every one of these bit us — apply everywhere):** gate GM-side writes to ONE GM (`activeGM.isSelf`); make handlers **idempotent** (claim/delete state at the top before any `await`); **existence-check before `.delete()` and `.catch()` the async** (a caught promise does NOT suppress Foundry's red "X does not exist!" toast); bind chat buttons on **`renderChatMessageHTML` ONLY** (the deprecated `renderChatMessage` ALSO fires in v13 → double-bind → double-fire/double-damage); **never assign a `DerivedValueField.value`** (getter-only → TypeError; use `.bonus`/`.override`).

**LESSON — read the schema before building.** Confirming `value=base+bonus` (defenses), `DamageType.Healing="heal"`, `canvas.mousePosition` (a live world-coord PIXI.Point), and that the combat hooks exist — all up front — avoided guesswork each time. Grep the system/core source first.

**Verified live 2026-06-09 (all from on-talent rules/effects, legacy store deleted):** Arc Flash (native dispatch off Searing Bolt, energy filter, one card, graze-debounced), Kindle (+Red-mod rider in the damage formula AND 5 ft token light), Walking Ruin (+10 ft Speed AE survives pack load, visible on Effects tab, applies on add), Know Your Moment (+2 → UI-edited +3 → reverted; round-until-turn toggling), Flame Surge (rule-driven burst: cost, 60 ft ring, click-place, Detonate), Death Ward (use→edha-temp-hp rule present), ⟳ Sync exact-mirror verification across all 4 characters (37/37 talents, 0 mismatches).

**Prior 2026-06-08b playtest (engine glue still identical):** Pyre (attack + terrain), Set Charge, Mending Aura, Thorn Field, socket relay, Temp HP absorption, summons.

---

### Architecture reference (registrations & key findings — current as of 2026-06-09)

Talent behaviors run through the cosmere-rpg event engine, hosted on the talent (`system.events`, Events tab); passive buffs are native ActiveEffects (Effects tab); rolls stay on DETAILS. The generator emits these from the §5 tables; ⟳ Sync mirrors them onto owned talents. 24 talents currently carry rules (coverage grows by adding table entries + rebuild — §9).

### Registered in `register-skills.js` at `setup` (`edhaRegisterNativeEventSystem()`)
- **Custom EVENT types** (`cosmereRPG.api.registerItemEventType`):
  - `edha-deal-damage` — hook `cosmere-rpg.damageRoll`; `condition` = 400 ms per-item debounce (the hook fires twice per roll: main + graze) + src.actor check; `transform:(roll,src)=>({document: src?.actor ?? src, options:{roll, sourceItem:src}})`. Returning the **actor** fans the rule out across ALL the owner's items, so e.g. Arc Flash's rule fires when Searing Bolt rolls. **VERIFIED FIRING on v2.1.0** (the 06-08b "doesn't fire" was unsynced snapshot talents).
  - `edha-on-defeat` — hook `cosmere-rpg.applyDamage`; `condition`: dealt > 0, victim HP ≤ 0, not re-entrant from a trigger; `transform` resolves the presumed **killer** (controlled token / current combatant / `user.character`) → `{document: killer, options:{victim}}`. (Chain Detonation, Necrotic Cascade, Predator's Due.)
  - `edha-pre-deal-damage` — sentinel (never fired); marker for damage riders, applied by the `rollDamage` wrapper reading the `edha-damage-rider` rule.
  - `edha-pre-use` — sentinel; marker for `edha-burst` rules, read by the `preUseItem` takeover.
  - `edha-combat-timing` — sentinel; marker for `edha-defense-buff` rules, read by the core combat hooks.
- **Custom HANDLER types** (`registerItemEventHandlerType`): `edha-triggered-effect` (**whenDamageType**, kind=damage|damage-aoe|heal|thp|affliction, formula, damageType, target, radius, resourceGain, cost+optional, oncePerRound, note — REAL executor: optional-cost → chat-card button, else immediate fire), `edha-damage-rider` (appliesTo, bonusFormula, **lightRadiusFt**), `edha-burst` (sizeByRank/sizeFt, affects, color, rangeByRank/rangeFt, saveSkill/saveVs, addSkillMod, heal, terrain — config-only), `edha-defense-buff` (amount, defenses, window, label, img — config-only), `edha-aoe-template` (sizeByRank/sizeFt, affects, color), `edha-place-hazard` (sizeByRank/sizeFt, damageFormula, damageType, color), `edha-temp-hp` (formula, target), `edha-summon` (statblock fields). Executors REUSE the shared helpers (edhaFireTrigger/edhaRunTriggerEffect/edhaPlaceAoe/edhaWriteTempHp/edhaSummon/edhaPlaceHazard). `edha.summon(actor, talentName)` now reads the talent's own edha-summon rule.
- **Region behaviour** `edha-content.hazard` (`foundry.data.regionBehaviors.RegionBehaviorType`), declared in `module.json` `documentTypes.RegionBehavior.hazard` and registered into `CONFIG.RegionBehavior.dataModels`/`typeLabels`. Subscribes to `tokenEnter` + `tokenTurnStart` and auto-applies its baked damage to the entering token's actor (GM-side). This is the "dangerous terrain" ongoing effect.
- **Added since 2026-06-09 (this list is not exhaustive — the live registry is the `console.log` at the end of `edhaRegisterNativeEventSystem()`):** v3 (06-11b) — events `edha-take-damage`, `edha-apply-watch`; handlers `edha-apply-status`, `edha-status-sweep`, `edha-overflow-thp`, `edha-damage-convert`, `edha-marked-damage-trigger`, `edha-hp-threshold`, `edha-multi-hit`. 06-13b — event `edha-on-hit` (true hit; dispatched by the applyDamage wrapper) + `edha-pre-test`; handlers `edha-test-rider`, `edha-ritual-hp-cost`, `edha-heal-cut`; `whenTargetStatus` on `edha-triggered-effect`; plus the affliction-damage, Reserve, Blood-Price-advantage, and `{weakened,immobilized}` timed-expiry engines. **Full per-tool detail = the 06-13b delta at the top.**

### Key findings (verified in the core/system source — don't re-derive)
- **Handler config UI auto-renders — NO `.hbs` needed.** `configRenderer` is null when no `render`/`template` is given (index.js ~L12507); the rule editor then runs `{{#if shouldAutoPopulateConfigFields}}{{formGroup}}` per schema field (`templates/item/dialog/edit-event-rule.hbs`). So a handler just needs `config.schema` (labelled DataFields) + `executor`.
- **Registration MUST be at `setup`.** The system wires `Hooks.on(hook,…)` for each event type once, at its own `ready` (index.js ~L11975), reading `CONFIG.COSMERE.items.events.types`. Register custom types BEFORE that or their hooks never subscribe.
- **Dispatch fan-out** (index.js ~L11987): the fired hook's `transform` returns a `document`; if it's an **Actor**, the engine evaluates event rules on EVERY item the actor owns; if an Item, just that item. `host` defaults to `"source"` (runs on the triggering client); `"gm"`/`"owner"` also exist.
- **Roll source:** `damageRoll()`/`preDamageRoll` fire `(roll, config.data.source, config)` and `config.data.source` is the rolling **Item** (index.js ~L7484).
- **Talents support events:** `TalentItemDataModel` mixes in `EventsItemMixin()` (index.js ~L26970); `action`/`trait` items too. Rule shape mirrors the proven `pathEvents()` in foundry-build.js: `{ id, description, event, handler:{ type, …flatConfigFields } }`.

### Coexistence — OVER (2026-06-09)
All legacy dispatchers, table loaders, and `edhaIsMigrated` guards are **deleted** from register-skills.js. The shared helpers remain only as implementations the native executors call. All four world characters were re-synced and verified to exactly mirror their pack sources.

### Build (now portable)
`foundry-build.js` + `edha-pack-io.js` resolve classic-level from Foundry's bundle OR plain `require("classic-level")` (NODE_PATH supported), and honor `EDHA_DATA` / `EDHA_MODROOT` env overrides — so the build can run off-machine against mounted folders. `_stats.systemVersion` stamps 2.1.0. The unextracted-edits guard tolerates an unreadable pack (warns + skips instead of crashing). Latest full build: talents:365, events:24, effects:1.

### RESOLVED (2026-06-09) — ActiveEffects formerly stripped on compendium load
Root cause: Foundry LevelDB packs store embedded effects as separate `!items.effects!<itemId>.<effectId>` keys with ID-string references on the parent item; inline effect objects are silently ignored on load. `writePack()` now performs that split and `readPack()` reassembles. Walking Ruin's +Speed is live from the pack (Effects tab + applies on actors).

---

## 8. Current content state

- **4 packs built & validated (0 issues):** edha-leyline (125t/5tree/5path + Draw Mana action), edha-deity (90/10/10), edha-heroic (150/6/6), edha-adversaries (9 actors/30 items). 325 edges.
- **Native Event/Effect system COMPLETE (2026-06-09):** behavior is read exclusively from each talent's `system.events` + `effects`; register-skills.js is engine-only. **Per-talent COVERAGE grows tree-by-tree** (the §9 main task) — counts climb each pass (v3/06-11b: events 36 / effects 14; +Black Isolation & Ritual at 06-13b). Run `node scripts/inspect-pack.js <pack> --group <Tree>` for the current state of any tree.
- **Roll data: 90 rollable.** Deity convention: color-keyed `[Tier][Die] = (@tier)d(2*@skills.<color>.rank+2)`, Option-B `+ @attr.<id>` preserved; heals = `heal` type. Skill ids: …/`lea` (Leadership)/`prc` (Perception)/… (NOT lead/per).
- **Triggers** (talent-triggers.json → native edha-triggered-effect): Arc Flash, Afterburn, Chain Detonation, Necrotic Cascade, Predator's Due. Optional-cost prompts use a **chat-card button** (not a dialog). Once-per-round (combat) via `flags.edha-content.trigRound`.
- **Temp HP, Summons, Targeting (range ring + AoE), Dangerous Terrain (Region), Draw Mana** (one universal `action`, granted via every leyline path), **Investiture derivation = `2 + max(AWA, PRE)`** (canon; character actors), **defeated-skull overlay tied to HP**, **always-on adversary health bars**.
- **Chaos resource renamed Fracture → Omen** (domain.json; flavor line kept; "Spreading Fracture"→"Spreading Omen").

### 8a. Playtest PCs (built 2026-06-10 from the May-17 reference sheets; `scripts/playtest-setup-console.js` is the idempotent rebuilder)

All four are L7/T2, 12/12 talents, stats sheet-matched (HP/inv/movement; focus = sheet + Tier where Composed applies — the sheets don't compute talent effects):
- **The Demolisher** (Scholar/Red/Razkael) — THE MODEL. Roster corrected: −Know Your Moment (not on sheet), +Composed (a CROSS-TREE pick — Composed only exists in heroic/Envoy), +Set Charge. Verified: native Arc Flash trigger, Kindle rider+light, rule-driven bursts, Pyre hazard.
- **The Forgemaster** (Leader/White/Kethane) — Composed (+2 foc) + Customary Garb (+2 PHY/SPI → 16/19) live; Guardian Stance +1 Deflect baked toggled-OFF (conditional); Draw Mana granted (was missing); **Forge Construct** verified: HP [Tier][d8-white]+4, deflect 1 (new summon-rule field), defenses = caster−2 incl. Garb. Manual: Lay Foundation/Siege Form/Trade Routes/Through the Fray/Guiding Signal/Concordant Presence.
- **The Outlaw** (Warrior/Black/Tyrith) — created. Tyrith rolls fixed red→**black** d8 (sheet's die). Black Draw Mana fires (Weakened = manual note). Manual: stances, Isolated-state mechanics (Sapping Hex/Severance), Spoils THP, Warlord's on-kill THP.
- **The Vivisectionist** (Scholar/Green/Anaveth) — created. Collected (+2 COG/SPI → 18/17) live; heal rolls verified (Verdant Mend [Tier][d8-green]+mod); Green Draw Mana terrain. Manual: Diagnosed-state mechanics (Prognosis/Vital Diagnosis), Life Surge overflow-THP, Field Medicine resolution.

### 8b. Playtest-1 prep (2026-06-10b) — adversary automation, balance pass, world setup

**Adversary action automation — lives on the WORLD actors, NOT the pack.** All 18 placed adversaries (Edha Adversaries folder; duplicates are separate actor docs — every copy was updated) got hand-created ActiveEffects on their items via console, following the PC-talent conventions (`Item — Thing` naming, transfer:true, conditional = baked toggled-off):

- **Mechanical:** Stitchmother **Phase 2 — Transformed** (toggled-off; `hea.max.bonus +20`, `attributes.str/spd.bonus +1`; heal-to-90 / +2 Vital / 2d6 regen stay manual per the description, verified 140→160 max while at 140). **Vital Diagram — Marked** apply-template implements the Deflect bypass on the victim (`deflect.useOverride=true` + `deflect.override=0`, OVERRIDE mode; +4 Vital stays manual; verified apply/restore on a PC).
- **Apply-to-target templates** (transfer:false, drag from the item onto the target's sheet): Frost Lance→**Slowed** (`statuses:["slowed"]`, 1 round), Venom Slam→**Afflicted** (`statuses:["afflicted"]`), Suture Cradle→Cradled, Bite→sheds-light, Probability Net (−1d6 next test), Calc Strike (+3 one test).
- **Trackers** (no engine key exists for advantage/disadvantage — token-icon reminders only): Brace (Captain 2-dis / Troopers 1-dis, 1-round duration), Glimpse the Path, Fade/Veil concealment (Stalkers), Bone Spurs / Venom Glands (Thralls, toggled-off), always-on icons for Predictive Ward + Cinder Coat.
- **NOT in source/pack:** `adversaries.json` and the edha-adversaries pack were untouched — re-importing actors from the pack loses all of the above. To make permanent, port these into generator inputs (adversary analogue of talent-effects.json) + rebuild.

**Balance pass (PC damage die = 2d8 — T2, leyline rank 3 across all four PCs):**
- Flame Surge does **NOT** one-shot Troopers (avg 9 − Deflect 1 into 14 HP; ~5% outright kill per failed save; saves are Athletics +0 vs Red +5, so most fail). No minion HP changes made.
- **FIXED: The Outlaw had NO weapon items at all** (Vivisectionist none either) — Warlord's Advance / Momentum of Victory were dead. Added **Longsword** (1d8 keen, equipped, + `weapon:longsword` expertise entry) and **Staff** (1d6 impact, equipped) from `cosmere-rpg.items`.
- Adversary defensive skills were all +0 → set ranks: **Stitchmother dis 5** (Suture Cradle concentration DC 10+dmg now holds ~55% vs a typical hit), **Troopers dis 2** (rout DC 13), **Captain ath 2**.
- **Stitchmother HP 140→120** (`hea.max.override`; Phase-2 below-70 trigger and heal-to-90 unchanged) — keeps the boss in the 4–6-round band vs party net DPS.
- **Playtest-1 watchpoints:** Captain Deflect 4 vs the party's small dice (deliberate — Ben wants him to be "a real test"; if it slogs, drop to 3). Boss net-DPS margin with the Discipline buff.

**World/session setup:** Playtest Map **activated** (was the default splash scene — players would have landed there). PC Investiture topped up. Stale test combat + 2 stray Demolisher tokens removed. **JournalEntry "Playtest Dungeon — Room Guide"** created (6 pages: read-aloud blockquote + adversary visual descriptors + terrain + run notes per room), built from the May Dungeon Reference PDF with deltas: **Living Lock CUT** (Room 1 vault door opens via Crafting/Lore DC 16 or Athletics DC 18 only), **Room 4 rewritten to match the map** (poison lake centerpiece + BOTH Frostbinders sniping from the balcony, Stalkers on the shore; suggested lake ruling: 2d6 Vital/round immersed, Athletics DC 14 out), **Room 6 = 3 Thralls** (map count, not the sheet's 2). Player users **Amertron / Laustarr / Spidercam** created with passwords; internet invite verified working (AT&T BGW NAT/Gaming forward TCP 30000 → gotcha: the gateway bound the rule to a STALE duplicate device entry for the same hostname; re-pointing at the live 192.168.1.247 entry fixed it). Remaining manual step if not yet done: per-PC **Ownership → Owner** + User Configuration character assignment (3 users / 4 PCs — Forgemaster is the natural GM-run spare).

**Console-operator notes (this session):**
- Creating an item-embedded ActiveEffect **with `statuses` in the create call throws** `Cannot read properties of null (reading 'startsWith')` (cosmere-rpg v2.1.0 / Foundry v13.351). Workaround: create without `statuses`, then `effect.update({statuses:[...]})`.
- DevTools `copy()` is **undefined inside async/promise contexts** — stash results on `window._r`, then `copy(window._r)` as a second synchronous command.
- Beware shell→clipboard quoting: escaped `\'` inside single-quoted JS arrived as `\\'` and produced a silent SyntaxError (script no-ops, stale `window._r` masks it). Prefer double-quoted JS strings with plain apostrophes.

## 9. Engine backlog — CANONICAL (consolidated 2026-07-03c; §9a/§9b BUILT 2026-07-04)

**This section is the single source of truth for the engine backlog.** The tree-by-tree wiring loop is
DONE (all 15 trees) AND the buildable backlog is BUILT (07-04: all 5 shared primitives + all 6
tree-local hooks — see the 07-04 delta and §9g). The per-tree "Hooks/tools still to build" / "since
built" / "Truly manual" lists in each `register-skills.js` section header stay — they are load-bearing
(audit.py's silent-card check reads ENGINE + DOCS mentions, and the "named, not dropped" convention
documents each tree in place) — but for anything SHARED across trees, THIS is the canonical entry.
What remains below is exclusively non-buildable-from-here: **blocked-on-system → bench-gated →
manual-by-design → post-playtest balance**. (Deploy + the bench pass are separate outstanding work —
see the top of `EDHA_FOUNDRY_TEST_CHECKLIST.md`, incl. the new "Engine backlog pass" bench section.)

### 9a. Shared primitives — **EMPTY (all 5 built 2026-07-04 → §9g)**

### 9b. Tree-local hooks — **EMPTY (all 6 built 2026-07-04 → §9g)**
(The one standing note kept from the old 9b: Green Territory / Bone Garden difficult terrain is
all-comers BY DESIGN, verified against the card text — do NOT "fix" it with the Civ enemy-cost type.)

### 9c. Blocked on the cosmere system / Foundry (tracked, not buildable now)
- **Test DCs aren't exposed** — Foundry skill tests carry no DC, so a failed NON-attack test can't be
  auto-detected. Forces the owner-click card on: **Sovereignty** Expose (non-attack tests), **Power**
  Crown of Thorns (tests the engine didn't itself resolve), **White/Coordination** Concordant/Shared
  "success" judgments. One shared blocker.
- **Items don't expose their target defense** — hit-detection can only read Physical (**Sovereignty**
  Expose / Balance / Edict-of-the-Fallen THP watchers); attacks vs Cog/Spi defenses don't auto-resolve.
- **No reach field** — **Civ** Colossus "reach 10 ft" is card-noted (no cosmere system support).
- **Structures/objects have no actor** — **Destruction** Fault Line "×3 vs structures" (Constructs ARE
  wired); any "damage a wall/object" clause. Needs object damage targets.

### 9d. Bench-gated (a fallback is already named; fires only if the bench pass fails)
- **Power — Mantle +1 injector** vs `configureModifiers`/dialog rebuilds → AE fallback if the appended
  NumericTerm is wiped.
- **Power — move-through watcher** waypointed-drag sampling (one straight segment per `updateToken`).
- **Knowledge — the `insight` `effect.system.count` field name** (best-guess; one-line swap if the real
  schema field is `stacks`/`value`/`amount`).

### 9e. Manual-by-design (NOT backlog — declared in the tree headers, listed here for the record)
Forced volition (Kneel / Absolute Authority / Hollow Command / Puppeteer / Incite / Edict declarations
beyond the three canonical prohibitions); action grants (Fate/Order Aid + free/Reactive Strikes — no
hook forces another creature's action); trusted costs (Opportunity; once-per-turn/round cadences; the
global Reaction economy); "willing" consent (owner-judged); the one-turn-generous timed-status
convention; narrative reveals/dispels (Unweaving's arbitrary-effect dispel, Void Sense see-through-walls,
Speak with the Fallen Q&A); **Reserve SPENDING + Double Dip's HP-substitution** (Scope-A, 06-13b —
readout helps, no auto cost-substitution). **No-AI-intent** (Fate Read the Threads / Order Lawkeeper's
Eye intent-reveal) was RECLASSIFIED backlog→manual here (2026-07-03c): an NPC's intended action is not
data anywhere in Foundry, so no hook can ever exist — it fails the "name the specific hook" test.

### 9f. Post-playtest-1 balance review
Capture session findings against the §8b watchpoints (Captain Deflect 4; Stitchmother net-DPS margin at
120 HP / dis 5; Flame Surge vs clustered minions).

### 9g. Resolved (history — detail in deltas/§7)
**The 07-04 engine-backlog pass (all of old §9a + §9b, one commit each — detail in the 07-04 delta):**
GM summon relay (`summon-actor`; spec baked owner-side); melee discriminator (`edhaAttackKind` — stamp
→ weapon `system.range` → null=owner-judged; gates Bone Spurs/Venom Glands/Withering Touch/Warlord's
Advance/Fury/Mantle); injury tool (`edhaAddInjury` + `create-item` relay; world "Injuries" RollTable >
placeholder list; Raise Dead + Apex Form wired); LOS helper (`edhaCanSee` — hidden + sight-wall ray;
Lawkeeper enforced, Packmate's Warning upgraded from manual); forced-move stamp (`options.edhaForced`;
Order move watcher skips engine pushes); Pinpoint terrain-follow (`followTokenUuid` recenter watcher);
Pyre turn-end spread (free grow-confirm card; Destruction, not Red — die-color mislabel in old 9b);
Shatter Focus auto-prompt (Omen-bearers only + per-foe-per-turn gate + Mute/re-arm); target-bound
`nextTestMod` (`targetUuid`; Warlord's survivor advantage bound); Vital Diagnosis reveal (Studied-Mark
snapshot on use); Civ enemy-cost EXPERIMENT (native-subclass, no-ship-on-failure — bench GO/NO-GO) +
the latent `fortified` module.json declaration fix.
Prior: tree-by-tree wiring loop (all 15 trees, Black 06-13 → Order 07-03b); **Blue Key Draw Mana rider** (was a
manual note → ENFORCED via `nextTestMod`, attr-gated int/wil, 07-03c); AoE/burst coverage
(`edha-burst`); Set Charge place→detonate split (06-17); the `expireAfter` timed-status convention
(disoriented/restrained/compelled/weakened/slowed, tree-wide); **Hardy** +@level max-HP AE on all three
copies (Black/White/Green); Crown of Thorns "which defense was tested" (superseded 07-02c by
`edhaCrownPing` at every engine-resolved site + the click button); Gnothis/Insight economy (07-03);
**Lay Foundation persistent friendly zone** (superseded — the 06-12 takeover + the begin-turn defense-buff
AE IS the card; the transient template entry was removed 07-02b); Momentum's Edge / Coordinated Hunt /
Fault Line ray template (all wired, not manual); compendium-effect strip; char re-sync + legacy-hook
deletion; sync-flake hardening; `edha-take-damage`; adversary-effects→generator; PC pregens ×4 (§8a);
Weakened/Diagnosed/Insight statuses; sheet derivations (HP+1 / Speed 20+5×SPD via
`edha.migrateDerivations()`); talent-budget formula ruling (`L+3+floor((L-1)/5)`=11 at L7; pregens via
`edha.skipBudget`).

## 10. Gotchas

- Custom skills must be `core:true` or they hide behind Powers.
- **Custom event types must register at `setup`** (before the system wires per-type hooks at its `ready`), or their hooks never subscribe.
- **Handler config forms AUTO-RENDER from the schema** — no `.hbs` template needed (only for fancy widgets).
- **Embedded ActiveEffects in LevelDB packs live as separate `!items.effects!<itemId>.<effectId>` keys** with ID-string refs on the parent — inline effect objects are silently dropped on load. `writePack` handles the split (FIXED 2026-06-09).
- **Dangerous-terrain Region creation is GM-side** — a player using a hazard talent gets a "GM-side" warning (same as summons). For player-initiated bursts, the Detonate relays the writes to the GM via socket (§7.0).
- **Native damage-triggered events DO fire on v2.1.0** — but ONLY on talents whose owned copies carry the rules (⟳ Sync after every rebuild!). The `damageRoll` hook fires TWICE per roll (main + graze) → the `edha-deal-damage` condition debounces 400 ms per item.
- **`edha-deal-damage` fires on the attack ROLL, not a hit** (06-13b) — cosmere rolls damage on EVERY attack, hit or miss (the GM applies on a hit). For "on hit" effects use **`edha-on-hit`**, which the `applyDamage` wrapper dispatches only when `damage.dealt > 0`. Sapping Hex + Predatory Patience were retrofitted off deal-damage for exactly this (they were weakening / refunding Investiture on whiffs).
- **Item updates MERGE `system.events`** — to remove a rule you must send `-=<ruleId>: null`; sync does this automatically. Plain re-pushing the new events object leaves stale rules in place.
- **Foundry still holds pack LevelDB handles at the SETUP screen** (post-shutdown compaction) — `game.shutDown()` is NOT always enough to rebuild; fully quit Foundry if `writePack` hits EPERM/EACCES on a pack file.
- **Bind chat-card buttons on `renderChatMessageHTML` ONLY** — the deprecated `renderChatMessage` also fires in v13, so binding both double-fires the handler (caused double-damage + double-delete). Make button handlers idempotent too.
- **Cross-client chat-card buttons must carry their payload in `data-*` attributes — NOT a client-local map** (06-14). The existing trigger/burst cards stash the spec in a JS object (`EDHA_TRIG_PENDING` etc.) keyed by a per-button id; that only works because they're posted AND clicked on the SAME client. The Coordination watcher posts cards **GM-side** but the **owner's player** clicks them → a client-local map is empty there → the click silently no-ops. Fix: embed everything the click needs in `data-edha-*` attributes (`encodeURIComponent` for names/HTML/JSON), which travel with the chat HTML to every client. Applies to ANY card posted on one client and acted on by another.
- **Existence-check a template/doc before `.delete()`** (`scene.templates.get(id)` / `doc.parent?.templates?.get(doc.id)`) — a caught promise rejection does NOT suppress Foundry's red "X does not exist!" toast.
- **Never assign a `DerivedValueField.value`** (HP/defenses/deflect/movement/inv max) — it's a getter (`value = base + bonus`); a direct set throws "only a getter". Use `.bonus` (ADD, AE-friendly) or `.override`+`.useOverride`.
- Verify every icon path exists (Windows path) — 404 = invisible node.
- Rebuild only with Foundry closed (or `game.shutDown()` to Setup); relaunch to load packs + `module.json` changes; F5 for runtime JS/JSON.
- The `connections` array (not prose prereqs) drives drawn tree edges — and is SEPARATE from a talent's Name/prereqs, so renaming a talent requires rewriting every other talent's `connections` entry that points to it.
- Embedded talents are snapshots → ⟳ Sync after a rebuild (Sync now carries events/effects).
- `applyButtonsTo` must be a targeting mode (4) for AoE Apply to hit all targets.
- For any player-decision prompt that needs canvas targeting, use a CHAT-CARD BUTTON, not a dialog (modal blocks the canvas; non-modal can hide behind sheets).
- Hand-authored `[[damage N Type]]` enrichers need a capitalized DamageType key (Energy/Impact/Keen/Spirit/Vital/Healing).
- `@attr.<id>` (wil/pre/int/str/awa/spd) is the attribute shorthand in roll formulas (value only), NOT `@attributes.x.value`.
- **Item-embedded ActiveEffects cannot be created WITH `statuses`** (`Cannot read properties of null (reading 'startsWith')`, cosmere v2.1.0/Foundry v13.351) — create the effect first, then `update({statuses:[...]})`.
