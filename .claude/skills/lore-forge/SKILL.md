---
name: lore-forge
description: Author and audit Edha world/lore canon in the Skilltrees repo — nations, cultures, gods' rites, cosmology mechanics, ecology, the fae, history, and the land-budget/population math. Use whenever Ben asks to write, flesh out, deepen, review, or fix worldbuilding ("do the culture pass", "write nation X", "how much farmland / what population does X have", "what does layer 1 actually mean", "hammer out the fae", "the logic of Y doesn't make sense", a TODO_WORLDBUILDING W-item). Drives the loop: load load-bearing canon → derive every claim from a named ruling (never invent free-floating) → logic-audit against the death model → derive land budget + population from the map (resources set population, never the reverse) → walk the design questions with Ben IN ORDER, BY SECTION — full-text proposals, he approves a batch, then we move on; approval precedes every commit → write at the §5b depth standard → sweep dependents → close-out docs. One nation's full-depth pass is one session. Read CASE_STUDY.md (this folder) first — the famine layer-1 correction is the worked example of the method.
---

# Lore-forge — from "write the world" to canon whose logic actually holds

This is the worldbuilding counterpart of `session-forge` (which builds *sessions*) and
`session-debrief` (which captures *play*). Lore-forge builds and audits the **world**: the
`EDHA_CAMPAIGN_CANON.md` sections (§1 cosmology, §1a the broken cycle, §3 the pantheon, §5
nations, §5b culture, §8 threads), the `TODO_WORLDBUILDING.md` W-backlog, and the player-safe
`EDHA_PLAYER_PRIMER.md`.

The standard it enforces is the one Ben set on 2026-07-13: *"This is the level of detail needed
for each country, and the level that the logic of the world needs to work at."* Two demands, and
the skill exists because both were violated in the same week:

1. **Depth** — every nation reads like the §5b blocks: a sensory "you know you're here when…"
   opener, three-to-five *named* rituals/quirks, a one-line differentiator, a GM layer, naming
   conventions, and the single detail that plays it at the table. Not a paragraph of adjectives.
2. **Logic that holds at the mechanism level** — every custom and every cosmological claim must
   be *derivable from a named, load-bearing ruling*, and must not contradict another one. The
   famine-layer-1 bug (a cosmology claim — "crops can't ripen" — that silently contradicted the
   mechanical-death model, ruling 9) is why this is a hard gate, not a style note. **Read
   `CASE_STUDY.md` before writing or auditing anything.**
3. **Numbers derived from the world, not chosen** — population follows resources, never the
   reverse (Ben's rule). A nation's people fall out of its farmland, water, and yield modifiers
   via the land-budget method (Phase 4b), which is *queried from the gazetteer*, not eyeballed —
   the same "query, never guess" discipline session-forge applies to geography.

**Scope — one nation, one session.** This depth (a full culture block *plus* a measured land
budget *plus* a derived population *plus* the dependent sweep) is too much to batch. Do **one
nation's full-depth pass per session/work-pass**; the other nations wait their turn. The
2026-07-13 W1–W10 culture pass tried to do all ten shallowly *and* before the gate — both
failures. When Ben asks for "the nations," build one properly and queue the rest, don't spread
thin. (The gazetteer's `land_budget` schema is per-nation precisely so they can be filled one at
a time.)

The two failure modes this guards against, both real (see `CASE_STUDY.md`):

- **Free-floating invention** — a custom or mechanic asserted because it *sounds* right, with no
  ruling that produces it. Layer-1's "ripening stalls" and Lunavar's "the sun ripens nothing /
  daytime sleep spares hunger" were both this: evocative, and derivable from nothing.
- **Writing before the gate** — the W1–W10 culture pass (incl. W7 doctrine the backlog said
  needed a ruling *first*) written and PR'd wholesale, with the question menu delivered *after*.
  A "⚑ provisional" label on flagged content is the violation wearing a flag, not a workaround.

Phases run in order. Phases 0–2 are read-only — **no world prose gets written until the claims
are derived, logic-audited, and the rulings batch is answered.**

---

## Phase 0 — Load the load-bearing canon (what the world is *forced* to be)

Read, and hold these as the constraints every new claim must derive from:

- **`EDHA_CAMPAIGN_CANON.md` §1 + §1a** — the load-bearing rulings. Memorize the shortlist the
  §5b preamble already names: the **leyline field model** (ruling 11 — five fields permeate
  everything; "strength" = local concentration), **worship-feeds-gods** (ruling 12 — a god = two
  leylines + sustained worship; the pantheon is complete), and the **broken cycle** (§1a: the
  **consent/mechanical-death model**, ruling 9; **souls return, not travel**, ruling 10; the
  stuck-soul pools, rulings 14–15; the generational drain, ruling 16; **famine = blight that
  never clears**, ruling 24). Every culture and mechanic is *downstream* of these.
- **§3** — per-god agendas (the GM layer of most nations is "what this god is actually doing
  here"). **§5/§5a** — the nations and the **geography ground truth** (terrain constrains
  culture: marsh vs. forge-valley vs. river-plain). **§8** — open threads that new lore must be
  written *around*, never *over* (e.g. §8.4, what the moon is — Lunavar doctrine is written
  around it, not foreclosing it). **§9** — the rulings log (note the highest number).
- **`TODO_WORLDBUILDING.md`** — the W-backlog: what's scoped, what's ⚑-blocked on a ruling, what
  depends on what. Check the item's own notes; some (like W7) explicitly say *ruling first*.
- **`EDHA_CAMPAIGN_STATE.md`** — if any of this lore has already touched play, the state doc is
  truth over the plan.
- Check for **parallel-session drift** first (`git log --oneline -15 origin/main`, fetch first):
  §9 rulings numbers and handoff-delta ids are shared surfaces that have collided before.

## Phase 1 — Derive, don't invent (the load-bearing test)

For **every** claim you intend to write — each ritual, each quirk, each cosmological effect —
answer in one line: **which named ruling forces this, and what would break if it were false?**

- A custom that follows from a ruling + the nation's geography is *derived* — write it. (Malcurr's
  scar-credentials derive from Gnothis's lived-knowledge portfolio; the Taking-law's horror of
  waste derives from Razkael's clearing portfolio. Both are load-bearing, both play.)
- A claim that follows from *nothing* is invention — it does not go in until it's either grounded
  in a ruling or sent to Ben as a design question (Phase 3). **Evocative is not a license.** The
  test that catches the famine class of bug: if you're asserting a *mechanical effect on the
  world* (crops fail, disease behaves oddly, a god's absence changes X), you must name the rule
  that produces it. "It feels famine-y" is how "ripening stalls" got written.

## Phase 2 — Logic-audit against the whole model (does it contradict anything?)

A derived claim can still be *wrong* by contradicting another ruling. Run the new lore against
the load-bearing set and look for collisions:

- **The death-model check (the one that bit us).** Any claim about things dying, failing,
  persisting, or not-finishing must agree with ruling 9: **death is mechanical; only the
  *wasting* (slow deaths) fails to finish.** Fast/mechanical processes are untouched. "Crops
  can't ripen" failed this — ripening is mechanical. "Blight can't clear" passes it — a pathogen
  population dying out is a wasting. When auditing an existing claim, trace it to the mechanism:
  *what actually happens in the body / the field / the herd*, and does the seal touch that step?
- **The which-direction check.** When lore and mechanism disagree, decide which is canonical
  before aligning — sometimes the flavor is right and the stated mechanism is wrong (fix the
  mechanism), sometimes the reverse. Then align the claim, the ruling, AND every dependent doc.
- **The margin/severity check.** A continent-wide cause producing different local severities
  needs its *modifier* stated (why does layer 1 starve Lunavar but not Goldenport? — marsh
  margin + Vorsk). Unexplained asymmetry is usually a smell that the mechanism is wrong.
- **The thread check.** Does the claim foreclose an open §8 thread? Write *around* it (doctrine
  defined, truth left open), never *over* it.

## Phase 3 — Walk the design questions with Ben IN ORDER, BY SECTION (the GATE)

Everything Phase 1 couldn't derive and Phase 2 couldn't resolve is a **design question for Ben**.
Do **NOT** collect them into one monolithic everything-menu (retired 2026-07-14 — Ben: *"too
detailed for a picker… I want to approve these one by one"*). The working mode is a
**conversation in section order**: Ben approves a batch, then we move on.

1. **Sections follow the pass's natural order.** For a nation dive: (1) land-budget dials →
   (2) GM-truth forks (the why-questions under the culture) → (3) culture additions, one item
   at a time → (4) the assembled prose (Phase 4–5 output), shown as the final batch before
   anything is committed.
2. **One section at a time.** List that section's ideas in order, wait for Ben's approval of
   the batch, and only then move to the next section. Never mix sections in one ask.
3. **Show inventions in FULL TEXT, in PLAIN CHAT — and collect approval as a plain chat
   reply.** A new custom, rite, name, or GM-truth layer is proposed at the depth it would be
   written — the actual prose in the message body, one item at a time — never a compressed
   label. **Never deliver a full-text proposal through `AskUserQuestion`**: on Ben's surface
   the chat prose may not display next to the dialog ("full text above" reads as *nothing*),
   and long text inside the dialog gets **cut off** (2026-07-14, session-1 review: the
   skeindeer proposal failed BOTH ways across three rounds before landing as plain chat —
   Ben's flag: *"skill isn't doing what Ben wants"*). Pickers are only for genuinely short
   forks (a dial value, an either/or) whose options fit in a label; if a picker errors or is
   denied, do NOT re-send it — put the question in plain chat and wait (2026-07-14: a lost
   answer stream caused a duplicate prompt; Ben had already answered).
4. **Approval precedes EVERY commit.** Nothing lands in the repo — canon, gazetteer, TODO
   bookkeeping, "free" derived work included — until Ben has approved that batch. "Free"
   (below) means free to *measure, draft, and propose*, never free to commit. (2026-07-14: a
   measurement tool + parked-menu scaffolding were committed unapproved; don't repeat it.)

> **The batch is a GATE, not a courtesy.** For invented world-content, **WAIT for Ben's answers
> before writing the canon or prose the answers govern.** Recommended defaults exist to make
> answering *fast* — they are NOT a license to write first and ask after, and a "⚑ provisional"
> version of a flagged question is the same violation wearing a flag. This holds when the
> session runs autonomously and Ben is away: **park at the current section's proposal and end
> the turn** — do the ungated *reading* work (Phase 0–2, logic-audits of existing canon,
> dependent-sweep planning), commit none of it. A pass that ships unapproved content costs a
> full review cycle and Ben's trust; a pass that stops at a clean proposal costs nothing.
> (2026-07-13: W1–W10 and the W7 moon-doctrine were written and PR'd before the menu.)

What counts as gated vs. free:

- **Gated (wait):** invented cosmology, a god's undefined doctrine, anything an open thread
  touches, tone/feel calls, names, any *new* rule. Nation *doctrine* the backlog flags "ruling
  first" is always gated.
- **Free (proceed to DRAFT, not to commit):** claims fully derived from an existing ruling
  (Phase 1 passed); fixing an existing claim that *contradicts* a ruling (a correctness fix,
  like ruling 24 — the mechanism has a determinable right answer once the model is followed);
  geography lookups and measurements; the dependent-sweep; docs alignment.

Answers that change world truth get logged to **canon §9** (numbered after checking merged
main's highest — §9 collided across two 07-13 sessions). A correction that supersedes an earlier
ruling says so explicitly in the new ruling (see ruling 24's "supersedes…" clause).

## Phase 4 — Write at the depth standard

The §5b nation blocks are the reference shape. A nation block is:

1. **Sensory opener** — *"You know you're in X when…"*: one concrete, playable image (supper of
   proud-named vat-loaf; a claim proved by rolling up a sleeve; markets that open at moonrise).
2. **Three-to-five named customs** — each a *named* institution or rite (Oaths of Station, the
   Taking-law, the Sounding, the Unmaking Days), each carrying its mechanical or theological
   grounding in-line, not just a label. This is where derivation shows: the custom visibly
   follows from the god/portfolio/geography.
3. **The one-line differentiator** — the sub-head's "the nation where ___" that no other nation
   could wear.
4. **The GM layer** — what the god-drama (§2/§3) or the broken cycle (§1a) is *actually* doing
   under the culture, and what the pews don't know. This is the payoff of the block.
5. **Naming convention** — a row in the §5b naming table with exemplars (reuse existing NPC names
   as anchors; never contradict §6).
6. **The one-scene checklist row** — the single detail that plays the nation at the table.

Cosmology/mechanic sections (§1a-class) instead get: the **rule**, the **derivation** (which
ruling it follows from), the **on-the-ground consequence**, the **plot payoff / forensic use**,
and the **scale discipline** note (what stays ones-and-twos on screen vs. banked for later
reveals — ruling 19). Match the register of the section you're extending.

**Player-safe mirror:** anything a PC would grow up knowing gets a spoiler-checked version in
`EDHA_PLAYER_PRIMER.md` (GM layer stripped). Keep the two in sync — a fix to canon that touches
common knowledge sweeps the primer too.

## Phase 4b — The land budget: derive farmland → population from the map

Part of a nation's full-depth pass (Thalendor worked it first, ruling 26). **Population is
derived from resources; you never pick a headcount and fit the lore to it.** The chain, all
queried from `thyrcross.map.json` (`scripts/map/` + a polygon-mask over the base map), never
eyeballed:

`area inside border → − water → × cleared-fraction → × yield modifiers → effective farmland → × carrying-capacity density → population`

1. **Area** — the nation's traced polygon (`area_km2_approx`; ~1.5 km/px). This is measured, not
   a dial.
2. **− Water** — *measured*: mask the polygon over the base map and count the Rivers-and-Lakes
   blue (Thalendor read ~12%). Water is real map data; lock it. (The base map's *forest* green is
   stylized parchment art and is **not** measurable — do not try. Forest coverage lives in the
   next dial instead.)
3. **× Cleared-fraction** *(design dial)* — what share of dry land is farmland. Reason it from
   culture + terrain: a revered-forest nation with limited clearing sits low (Thalendor 15%); an
   open-plains nation sits high. This is the biggest lever — state the reasoning.
4. **× Yield modifiers** *(design dial)* — leyline or terrain bonuses. Thalendor's Root Network
   makes an in-AoE acre worth 1.25 ordinary ones; set the *fraction* of farmland in the AoE
   (60% — deliberately below a heartland-wide number so **border** land feels distinct) → an
   effective-farmland multiplier.
5. **× Carrying-capacity density** *(design dial)* — persons per km² of **effective** farmland
   (the yield bonus is already folded into "effective," so don't double-count abundance).
   Thalendor: 80/km² (a medieval-agrarian midpoint) → ~13.1M.

Store every dial and result in the nation's **`land_budget`** block in the gazetteer (with a
`_basis` string for each judgement call), so it's queryable and re-runnable. **The three dials
(cleared / AoE / density) are GATED design questions (Phase 3)** — propose defaults with
reasoning and wait; only the area and water are free.

**The calorie cross-check (ruling 27 — do it, it catches errors).** Density alone gives a
population; the calorie balance *validates* it and yields the livestock. Chain: adult need
**2,000 kcal/day = 730,000/yr** → human total; effective ha × a sourced **kcal/ha/yr** (Thalendor
2.5M — net-of-seed, blended, Root-Network bonus already in "effective") = **total production**;
**production − human = the livestock calorie budget**; ÷ per-animal need (~25,000 kcal/day per
cattle-equivalent livestock unit) = **the herd**. Ben's rule: *humans + livestock = total
production.* The kcal/ha is the one sourced-but-adjustable dial (find a real agronomic figure;
don't invent). **This cross-check caught a real bug:** the naive "famine = 42.5% yield → 42.5% of
people fed" was *wrong*. Livestock is a **fully-convertible buffer** (cull the herds, humans eat
the freed calories), so humans stay fed until *total* production drops below their need — for
Thalendor, below ~23.4% of a normal yield; at 42.5% the herds crater ~75% but nobody starves
calorically, and mass death is the cliff ahead, not the present. A density number that isn't
calorie-checked smuggles the linear-scaling error in. (Watch your own scope, too: this is where a
pass starts *spinning* — inventing sub-dials like a "human-edible-grain fraction" when the answer
is just "≈100%, livestock converts." If a new dial doesn't change the answer, don't add it.) **Uncounted food sources:** name them explicitly — Thalendor's ~12%
water means fisheries add capacity the farmland math misses (ruled: fish are hit by Layer 1
environmentally but their calories are set aside for simplicity — so the farmland number stands,
it isn't a floor). Any water-rich nation raises the same question, and it feeds back into Phase 2
(does the broken cycle touch that food source, and how).

## Phase 5 — Sweep the dependents

New or corrected lore ripples. Before closing, grep the repo for every reference to what you
changed and align all of it — canon cross-refs, the primer, the opening/session docs, the
TODO's W-item notes, the one-scene checklist and naming tables. The famine fix touched six docs;
the ripple is the norm, not the exception. `grep -rn` the key terms and read each hit.

## Phase 6 — Close-out (docs are part of the change)

1. World-truth → **canon** at the section's home; new/superseding **ruling → §9** (numbered vs.
   merged main; supersession stated explicitly).
2. **Mark the W-item done** in `TODO_WORLDBUILDING.md` (`[x]`), or leave it `[ ]` with a note if
   it's still gated on a ruling.
3. Dated delta at the **top** of `EDHA_FOUNDRY_HANDOFF.md` (check the id — 07-13 minted several);
   say **docs-only, no rebuild** (lore work never touches the engine or packs).
4. If any place/geography was named or moved: gazetteer entry FIRST (with `painted: false` —
   Ben's Procreate map doesn't have it yet), then docs, then `python3 scripts/map/lint_map.py`
   (docs-vs-gazetteer drift gate); re-render + `python scripts/map/paint_overlay.py` if sites
   changed.
4b. Canon changed ⇒ regenerate the human-facing codex: `node scripts/build-canon-codex.js`
   (CI fails on a stale `EDHA_CANON_CODEX.html`, same as the bench sheet).
5. Doc gates still apply — `node scripts/validate.js` at minimum; the full CLAUDE.md rule-4 suite
   if anything but prose changed.
6. The ⚑ list to Ben: everything you couldn't self-verify or that stayed gated — listed in
   section order with recommended defaults, ready to resume the Phase-3 walk next session.

## The one-line test to keep in your head

Before any sentence of world-truth goes in: **"Which ruling forces this, and does it contradict
another?"** If you can't name the ruling, it's a question for Ben, not a sentence for canon.
