# Edha Lore — Baseline Canon vs. Current Project (diff)

**Written 2026-07-12** on branch `claude/edha-countries-plot-mmzg2m`. Compares the recovered
**Campaign Baseline Canon v1.0** PDF (Ben's original brainstorming doc — full text preserved at
`source-materials/legacy-uploads/Campaign_Baseline_Canon.txt`; the PDF itself stays out of git per
the no-committed-binaries policy in `.gitignore`) against **where the project stands
now**. Docs-only; no engine, data, or pack changes.

## The three canon layers (and their dates)

| Layer | Where | Date | State |
|---|---|---|---|
| **Baseline PDF** | `source-materials/legacy-uploads/Campaign_Baseline_Canon.txt` (extracted text) | pre-repo brainstorm ("Not Final, v1.0") | Two-Shard cosmology, countries lettered A–I, gods named by domain only |
| **WorldAnvil article exports** | `source-materials/legacy-uploads/{Anaveth…Verdannis}.txt` (10 files) | in repo by 2026-05-15, untouched since | PDF-faithful: same colors, same statuses, Valor/U3125 framing intact; adds proper names, epithets, named countries + NPCs |
| **Current project** | `data/domain.json`, `data/path-descriptions.json`, `data/deity-resources.json`, live Foundry trees | actively maintained through 2026-07 | **No Shard cosmology anywhere**; three deities materially changed; new epithets throughout |

The WorldAnvil articles are a **snapshot of the PDF era**, not of current canon — every place they
disagree with the current trees, the trees are newer. (Verified: zero hits for
Valor / Shard / Adonalsium / Ambition / U3125 / Splinter anywhere outside `legacy-uploads/`; all
"cosmere" references in live files are the `cosmere-rpg` Foundry *system*, not Shard lore.)

## 1. Cosmology — the biggest diff

**Baseline PDF:** the world sits under two Shards of Adonalsium. **Valor** (active, Invested)
generated the pantheon — the ten gods are facets of Valor's Investiture crystallized through mortal
belief; the five leylines are Valor's Investiture flowing through the world. **Ambition**
(Splintered, dead) supplies the antagonist: Splinter-mass **U3125** arrived during the Fate Coup's
turbulence, consumed the genuine Chaos deity, and now wears its shape — "mindless hunger expressed
as strategy."

**Current project (per Ben, confirmed by repo evidence): there is no Valor shard.** Nothing in the
live data ties the pantheon or the leylines to a Shard, to Adonalsium, or to the wider Cosmere. The
leylines simply exist; the gods are simply the pantheon.

**What this orphans from the PDF** (each needs a keep/kill/reframe ruling — see §6):

- The **U3125 designation** and the whole Ambition-Splinter mechanism for the Chaos infiltration.
- The "pantheon = facets of Valor" origin story, and with it the PDF's structural logic that Chaos
  (as "the most Black-aligned facet") was the framework's *inherently* weakest point.
- The Gnothis open thread's "a Splinter, or something worse" phrasing (in the WorldAnvil article).
- PDF §VII open threads **The Perpendicularity** and **Valor's Vessel** — both are Shard-dependent
  and die with the framework, along with any Hoid/worldhopper hooks.
- The WorldAnvil category name **"The Pantheon of Valor"** (all ten articles are parented to it).

**What survives without the Shard framework:** the *story* of the infiltration itself — something
consumed the real Chaos during the Fate Coup's aftermath and now wears its shape, better at being
Chaos's brand than Chaos was. Nothing about that beat actually requires the Ambition/U3125
cosmology; it just needs *an* origin (or deliberate mystery).

## 2. The pantheon — deity-by-deity

Colors/domains: **PDF and the WorldAnvil articles always agree** (the articles were written from
the PDF). The "Current" column is `data/domain.json` + `data/path-descriptions.json` — the text
players actually see in Foundry.

| God | PDF/articles: domain, colors | Current: domain, colors | Epithet: articles → current | Changed? |
|---|---|---|---|---|
| **Verdannis** | **Nature**, Black/White | **Sovereignty**, Black/White | the Rootfather / First Trunk → **the Crowned Arbiter** | ⚠ domain + identity |
| **Maelith** | Chaos, **Black (mono)** | Chaos, **Black/Blue** | the Laughing Dark → **the Unmaker of Certainties** | ⚠ colors |
| **Tyrith** | Power, **Blue/White** | Power, **Black/Red** | the Crowned Aspirant / Usurper → **the Iron Crown** | ⚠ colors + tone |
| **Anaveth** | Life, Blue/Green | Life, Blue/Green | the Overflowing → the Vital Hand | epithet only |
| **Morrath** | Death, Green/Black | Death, Black/Green | the Shepherd Below → the Last Harvest | epithet only |
| **Gnothis** | Knowledge, Green/Red | Knowledge, Red/Green | the Ember Sage / Lost Tongue → the Watching Mind | epithet only |
| **Olvarra** | Fate, Green/White | Fate, Green/White | the Watcher at the Loom → the Thread-Reader | epithet only |
| **Tessavain** | Order, Blue/White | Order, Blue/White | the Covenant Keeper → the Lawgiver | epithet only |
| **Kethane** | Civilization, Red/White | Civilization, Red/White | the Hearthwright → the Great Builder | epithet only |
| **Razkael** | Destruction, Red/Blue | Destruction, Blue/Red | the Unmoored / Walking Ruin → the Sundering Flame | epithet only |

(Color-order swaps like Red/Blue↔Blue/Red are cosmetic. Every epithet changed between the
article layer and the current trees; only three gods changed *substantively*.)

### 2a. Verdannis — Nature → Sovereignty (the change Ben flagged)

Old identity: eldest steward of the natural cycle — growth, decay, renewal; druids and farmers;
"the Rootfather," referred to as *it*. New identity (current `path-descriptions.json`): **deity of
Sovereignty — "the right to raise and to cast down"** — the battlefield as a court, Decrees as
declared laws, elevate one and diminish another; "the Crowned Arbiter," referred to as **His**.

Plot beats this touches from the PDF:

- **"Leader of the gods, credibility failing"** — survives cleanly, arguably *better*: a god of
  rulership whose realm visibly fails is a tighter tragedy than a nature god with an infected
  domain.
- **"Reaching through the leylines, draining Country D's Green lines, causing the famine"** — the
  PDF motivated this via Nature diagnosing its own broken domain. Under Sovereignty the *action*
  can stand (the pantheon's ruler diagnosing the realm's sickness) but the Green-leyline affinity
  is no longer domain-native (Sovereignty is Black/White). Needs a ruling on why his search
  specifically drains **Green**.
- **"Nature is the last god that should identify the real threat — they share Black"** — still
  works verbatim: Sovereignty kept Black.
- **The broken natural cycle itself** (Death sealed, ecosystems seizing) — unaffected; that was
  always Morrath's absence, not Verdannis's domain. If anything, removing Nature-the-domain leaves
  the cycle *wholly* explained by Death+Life, which is cleaner.

### 2b. Tyrith — Blue/White opportunist → Black/Red dominator

The PDF's Power ran on a **legitimacy argument**: institutional Blue/White, "someone competent
needs to take charge," coup by alliance-building — and the PDF explicitly derived the
Order-vs-Power bitterness from their **shared Blue/White identity** ("they agree on what the world
should look like but violently disagree on who should run it"). The current Tyrith is
**Black/Red domination** — "his blessed do not persuade; they compel," Bounty tallies of the
fallen.

Broken/bent by the change:

- The **shared-colors rationale** for the Order conflict is gone (Tessavain is still Blue/White).
  The *conflict* can obviously stay — usurper vs. covenant-keeper needs no color symmetry — but
  the WorldAnvil articles state the shared-premises framing outright and would now be wrong.
- The **"frame the power grab as institutional reform"** manipulation of Kethane reads differently
  from a Black/Red dominator; either Tyrith is more two-faced than his current tree text implies
  (viable — trees are combat doctrine, not diplomacy), or the Kethane hook needs rewording.
- **Olvarra's misread** ("suspects Power is behind Chaos's strategic behavior") gets *more*
  plausible, not less — a Black/Red Power is an easier villain to wrongly accuse.

### 2c. Maelith — mono-Black → Black/Blue

The PDF leaned on mono-Black: pure entropy was the "most permeable" point for a pure-entropy
hunger. Current Chaos is **Black/Blue — "calculated madness,"** forcing Complications and *banking*
them (the Omen economy). Two readings, pick one deliberately:

- If the infiltration stays canon, Black/Blue is a quiet **retcon that foreshadows the twist** —
  a Chaos that calculates *is* the wrongness the Old Priestess feels. The infiltration-vector logic
  just needs rewording (weakest point ≠ "most Black-aligned" anymore).
- If it's meant as the god's true pre-infiltration identity, the "genuinely random trickster who
  sabotaged the Fate Coup for laughs" backstory softens, and the articles' before/after contrast
  (old priests remember randomness) loses some bite.

## 3. The political map — PDF letters ↔ current names

The PDF describes countries **A–I**; the WorldAnvil articles + the oneshot prebuilt-PC sheet
(`source-materials/legacy-uploads/Oneshot_Prebuilt_PCs.xlsx`) name them. The mapping is
one-to-one and evidence-forced:

| PDF | Name | Government / religion (PDF) | Status | Matching evidence |
|---|---|---|---|---|
| A | **Kettavar** | Stable tribalism, Chieftain; worships Chaos | Stable (insulated) | Old Priestess of Country A = **Old Priestess Miravel**, Kettavar's Chaos priesthood (Maelith article) |
| B | **Malcurr** | Dictatorship, **the Warlock**; worships missing Knowledge | Plague | Warlock of Country B = Warlock of Malcurr (Gnothis article, Kashen Duskhand PC) |
| C | **Corvaine** | Monarchy, **Child King** (regents rule); funded by B, raiding D's supply lines | Plague | Maren Voss PC: "the child king is useless, the plague is spreading" |
| D | **Thalendor** | Utopian, ruled by a **Mage**; Green leyline (**Root Network**) | Famine | Verdannis draining "the Green leylines in Thalendor's region," famine (article); "central protagonist nation" |
| E | **Goldenport** | Oligarchy, **Guild Council**; Life nexus at capital | Prosperous | Anaveth shunting Investiture into Goldenport as pressure valve (article, Lysa Venn PC) |
| F | **Vorsk** | Dictatorship, **Warlord**; raiding G, watching D | War | "Vorsk's violence" (Ferrik Cade PC); Commander Isra Vael of Vorsk (Razkael article) |
| G | **Lunavar** | Theocracy, **Child of Prophecy**; "moon cult" placeholder | Famine | "Lunavar's moon prophecies" (Ferrik Cade PC, Vorsk/Lunavar border) |
| H | **Canticle** | Aristocracy, **Bards Congress**; deep archives (incl. pre-infiltration Chaos theology) | Prosperous | Arbiter Solenne, "High Arbiter of the Bards' Congress," from Canticle (PC sheet); Old Priestess's texts "likely preserved in Country H's Bards Congress archives" (PDF) |
| I | **Sylvaneth** | Utopian, **Immortal Triplets**; Fae-aligned | Peace | Ashara = "Sylvaneth exile" (articles + PC sheet); only unassigned letter/name pair |

Diffs and tensions on the map:

- **Sylvaneth (I):** the PDF says religion "Unknown (Fae)" and frames it as a silent Fae utopia
  that "may understand what's been lost." The **Verdannis article** instead calls Sylvaneth's
  faithful among "the most devout" Verdannis worshippers. Contradiction — needs a ruling
  (and it compounds with Verdannis no longer being a nature god at all).
- **The Black Altar / Black Altar Crossing** (oneshot: a destabilizing leyline nexus in Corvaine's
  jurisdiction; Theron's grandmother's stories) — **absent from the PDF**. It postdates the
  baseline; treat as additive canon, but it needs a home on the A–I map logic (a leyline nexus in
  plague-monarchy C).
- The PDF's inter-country dynamics (C raids D funded by B; F raids G while eyeing D) exist
  *nowhere else* in the project — the PDF is currently the sole source for the war/economy web.
- "Thyrcross" (the continent, used throughout the articles/PCs) never appears in the PDF, which
  says "this world"/"the region." Presumably additive naming, not a conflict.

## 4. Plot beats — what still holds vs. what moved

**Holds intact** (PDF ↔ articles ↔ nothing newer contradicts):

- Morrath sealed by the infiltrated Chaos = root cause of famine/plague; restoration is the
  central macro campaign goal; seal mechanism unknown in-world.
- Anaveth overflow → Goldenport pressure valve; champion/vessel idea (**Serene**, Green/White
  healer, unaware — articles only, PDF has the mechanic without the name); most PC-accessible god.
- The **Fate Coup** history, its philosophical collapse, real-Chaos's gleeful sabotage, Olvarra
  stripped — and the buried bomb that the coup's turbulence *opened the door*, with the enormous
  guilt/motivation payoff when Olvarra learns it.
- Olvarra sees the strategy, **blames Tyrith** — dangerous misread.
- Tessavain convening a council; most helpful god to informed PCs.
- Kethane as collateral damage; manipulable via "restore functional society."
- Razkael banished *as counterweight removal*; may have directly experienced the enemy's action;
  location undefined; potential unlikely ally.
- Gnothis deliberately vague; the Warlock receives *something*; reserved for PC backstory.
- The **Old Priestess** arc: old texts (→ Canticle archives) + being used "with surgical
  precision" = rituals in form only.
- The two-witness structure: no single being sees the whole picture; the players eventually
  assemble it. (PDF "Critical Design Note" — worth preserving verbatim somewhere current.)

**Superseded / needs rework** (current project wins):

- Everything in §1 (Shard cosmology) and §2a–2c (Verdannis, Tyrith, Maelith).
- All ten **epithets** as written in the WorldAnvil articles.
- The Order-vs-Power **shared-colors** framing (article + PDF text).

**Stale by omission** — the ten WorldAnvil articles as a whole: every one carries PDF-era
colors/domains/epithets and the Valor category. If they're still live on WorldAnvil, they
contradict the current trees players see in Foundry.

## 5. Where current canon lives now (for future lore sessions)

With the Atlas web app retired (2026-07-06d) the **only player-facing lore surfaces are in
Foundry**: `data/path-descriptions.json` (tree intro cards: epithet + domain + doctrine +
signature resource), `data/domain.json` (per-talent flavor text), `data/deity-resources.json`
(resource lore blurbs). There is currently **no in-repo home for narrative canon** (countries,
agendas, plot) — the PDF + article exports in `legacy-uploads/` are it, and both are partially
superseded. That's the gap this branch presumably exists to fill.

## 6. Rulings needed from Ben (batched, with recommended defaults)

> **RESOLVED 2026-07-12** — Ben answered all seven via question prompts. The answers and the
> resulting canon live in **`EDHA_CAMPAIGN_CANON.md`** (§9 = rulings log) — that doc is now the
> single source of truth (WorldAnvil retired, per ruling 6). The list below is preserved as the
> original decision menu.

1. **The antagonist, post-Shard.** Keep the "something consumed the real Chaos during the Fate
   Coup's aftermath" infiltration with the origin left cosmology-free (named or unnamed hunger),
   or drop the infiltration entirely? **Recommended: keep the infiltration, drop U3125/Ambition;**
   the whole plot web (sealed Death, banished Razkael, silenced Olvarra, Tyrith-as-useful-idiot)
   hangs off it and none of it needs Shards.
2. **Verdannis's Green-drain.** Under Sovereignty, why does his leyline search drain *Green*
   specifically (Thalendor famine)? Options: (a) he's searching *for* the broken cycle, so he
   pulls the cycle's color; (b) retcon to Black/White drain with famine recast as
   secondary; (c) Thalendor's Root Network is simply the nexus he's tapping regardless of color.
   **Recommended: (a)** — smallest change, keeps the famine causality.
3. **Order vs. Power bitterness.** New basis now that the colors diverged? **Recommended:**
   keep the institutional rivalry but reframe: Tessavain defends the covenant Tyrith intends to
   *own* — law vs. throne rather than twin premises.
4. **Maelith's pre-infiltration self.** Was the real Chaos genuinely random (articles) with
   Black/Blue as the *infiltrator's* texture showing through, or always Black/Blue calculated
   madness? **Recommended: the former** — it keeps the Old Priestess's evidence sharp and makes
   the tree itself a subtle clue.
5. **Sylvaneth.** Fae utopia of the Immortal Triplets (PDF) vs. most-devout Verdannis worshippers
   (article)? **Recommended: PDF wins** (Fae, separate relationship to the cycle, knowing
   silence — it's the more load-bearing hook), and the devout-worship line moves to Thalendor
   alone.
6. **Article refresh.** Regenerate the ten WorldAnvil articles to current canon (epithets, colors,
   domains, no Valor category, rulings 1–5 applied)? **Recommended: yes**, as this branch's
   follow-up work, one article per commit.
7. **Verdannis's pronouns.** Articles say *it* (all gods), current tree text says *His*.
   Pick one convention pantheon-wide.

---

*Sources: `Campaign_Baseline_Canon.pdf` (10 pp, extracted in full); the ten article exports;
`Oneshot_Prebuilt_PCs.xlsx` (8 sheets); `data/domain.json` / `path-descriptions.json` /
`deity-resources.json` at HEAD; git history for dating (articles static since 2026-05-15/16,
trees maintained through 2026-07-03+).*
