# EDHA — Behaviour-Location Audit (input doc for the iron-rule-2b migration)

**Written 2026-07-24.** Scoped, temporary: this exists so the migration session starts with
measured numbers instead of re-deriving them from a 437 KB handoff. **Retire it into handoff §9
when the migration closes.**

Everything below was measured against a real all-scope build of the current tree
(`foundry-build.js all` into a scratch `EDHA_MODROOT`), not read off the source files.

---

## 1. Why this exists

Ben's requirement from the start: **everything should be editable by him inside Foundry.** At
session 0 he hit three symptoms that are all the same root problem —

- a player could not pick a Green talent (prerequisites — *fixed*, see §5);
- editing the compendium talent tree gave "cannot edit system generated content";
- **the talents are empty of effects and statuses when viewed inside Foundry.**

The third is not a display bug. Those talents really are empty. Their behaviour lives in
JavaScript keyed on the talent's *name*, so the Events and Effects tabs have nothing to show,
editing them changes nothing, and renaming the talent silently unwires it.

## 2. The terminology that hid this

The repo says "engine" for two different things, and the confusion is load-bearing:

| Term | What it actually is |
|---|---|
| **A hook** | Foundry's announcement system — "an item was used", "damage was rolled". Neutral. Any code can listen. **Hooks are not the problem.** |
| **The engine** | `register-skills.js`, the one JS file the module loads. The code that listens. |
| **Name-keyed dispatch** | Inside a hook: `if (item.name === "Grasping Vines") { …40 hardcoded lines… }`. Behaviour bound to a *string*. Empty tabs, rename breaks it, edits do nothing. |
| **Document-driven** | The talent carries `system.events` / `effects`; the engine runs them generically. **Same hooks, same engine file.** The difference is only what the hook consults once it fires. |
| **"Side-engine"** (old iron rule 2) | A *second script* or a bespoke per-tree subsystem. It never meant "code instead of data" — which is exactly why 210 talents drifted without violating any rule. |

## 3. The measurement

| Tree | on document | name-keyed | neither | total |
|---|---:|---:|---:|---:|
| White | 4 | **19** | 2 | 25 |
| Blue | 2 | **18** | 5 | 25 |
| Green | 8 | **16** | 1 | 25 |
| Leader | 4 | **16** | 5 | 25 |
| Black | 13 | **12** | 0 | 25 |
| Envoy | 4 | **11** | 10 | 25 |
| Chaos | 0 | **9** | 0 | 9 |
| Fate | 0 | **9** | 0 | 9 |
| Sovereignty | 0 | **9** | 0 | 9 |
| Warrior | 7 | **9** | 9 | 25 |
| Red | 16 | **8** | 1 | 25 |
| Order | 1 | **8** | 0 | 9 |
| Knowledge | 1 | **8** | 0 | 9 |
| Civilization | 2 | **7** | 0 | 9 |
| Power | 2 | **7** | 0 | 9 |
| Agent | 6 | **7** | 12 | 25 |
| Hunter | 4 | **7** | 14 | 25 |
| Death | 3 | **6** | 0 | 9 |
| Destruction | 4 | **5** | 0 | 9 |
| Life | 4 | **5** | 0 | 9 |
| Scholar | 5 | **4** | 16 | 25 |
| **TOTAL** | **90** | **200** | **75** | **365** |

Supporting numbers:

- **222 of 338** distinct talent names appear as hardcoded string literals in
  `register-skills.js` — **549 occurrences**.
- The "neither" column is mostly *legitimately* manual. Of those 75, **71 are named in an engine
  tree-section header or the docs** (iron rule 3's ledger is being kept by hand, and kept well).
  Only **4** are unaccounted for anywhere: **Fatal Thrust, Mind and Body, Emotional Intelligence,
  Signature Weapon** — all Warrior/Scholar. Those four are the only true "silent manual cards".
- **90, not 80** — the empty-overlay fix (§5) recovered 10 talents on 2026-07-24.

### How it happened

The 2026-06-09 refactor (handoff §7.0) genuinely moved behaviour onto the documents and was
live-verified. It held for the trees that existed then. Then **every tree wired after it** went
name-keyed — all ten deity trees (06-17 → 07-03) and the heroic pass (07-18h) — and
`leyline-tree-authoring/SKILL.md` codified that as the standard ("All *name-based* automation …
lives here"). Two documents contradicted each other for six weeks, both stated as settled, and no
gate tested the axis in either direction. Nobody was careless; the rule that would have caught it
did not exist. It does now — **iron rule 2b**, added 2026-07-24.

## 4. The rule this work serves

See CLAUDE.md iron rule **2b** for the normative text. The parts that shape the migration:

- Behaviour goes on the talent as `events` / `effects`; the engine supplies only **generic**
  handler types that execute them.
- Two declared exits: **ENGINE-OWNED** (genuinely not expressible — multi-step dialogs,
  cross-actor state machines, targeting overlays, the contest queue, the wizard) and **MANUAL**
  (no nameable hook, rule 3's existing bar). An undeclared empty document is a bug.
- **Ratchet — BUILT 2026-07-24e, this is enforced, not aspirational.** `scripts/lint-refs.js`
  **pass 7** freezes the **221 talent names the engine mentioned in code** into
  `scripts/name-keyed-allowlist.json` and fails on either direction:
  - a talent name in engine code that is **not** listed → the list may not grow;
  - a listed name **no longer** in the engine → delete the line, so the list can't become fiction.

  That second one matters for you: **every migration commit must also shrink the allowlist**, and
  the gate tells you exactly which lines to delete. Comments are stripped before scanning (the
  tree-section header ledgers list talents by name on purpose — that IS the rule-3 record).
  Adversary bespoke abilities are out of scope: different surface, own standard (pass 5).

  221 names vs 200 talents because a few talents carry document behaviour *and* a name-keyed
  branch; the list counts names in code, which is what 2b actually forbids.

## 5. Already fixed — do not redo these

| Fix | Where |
|---|---|
| **Three prerequisite cycles** — Green `Predator's Instinct` ↔ `Pack Hunter` (8 talents dead, hit at session 0), Red `Burning Drive` ↔ `Reckless Advance` (8 dead), Death `Risen Servant` ↔ `Speak with the Fallen` (found by the new gate). All 21 trees now verify walkable against the built node graphs. | `data/leyline.json`, `data/domain.json` |
| **The cycle/reachability gate** — iron rule 7, mirrors how `foundry-build.js` derives prereqs (connections = one OR-group; each prose group = another; AND across groups). Fails on a cycle or an unreachable node; warns when prose and `connections` name different parents and neither implies the other. | `scripts/validate.js` |
| **The empty-overlay wipe** — `applyAuthorable` wrote any non-null authored key, and `"events": {}` passes that test, so stale empty snapshots overwrote generator rules. Recovered 10 talents, lost 0 (A/B verified). | `scripts/edha-pack-io.js` |
| `edha-pack-io.js` now resolves `classic-level` **lazily** — the pure helpers were previously unimportable without the native dep, which is why they had no tests. | `scripts/edha-pack-io.js` |
| Regression cases pinned for all of the above, mutation-checked to confirm they fail when the bug returns. | `tests/pipeline.test.js` |
| **The rule-2b ratchet gate (lint pass 7)** — mutation-checked both ways: a new name-keyed dispatch on an unlisted talent fails; a listed talent removed from the engine fails until its line goes. | `scripts/lint-refs.js`, `scripts/name-keyed-allowlist.json` |
| **The five game-design skills copied into the repo** — `leyline-revision-guide`, `deity-revision-guide`, `talent-balance`, `phrasing-verifier`, `cosmere-canon-reference`. They lived only in Ben's user-level `~/.claude/skills/`, so a fresh clone and CI could not see them. The two superseded copies in `source-materials/legacy-uploads/` now carry a SUPERSEDED banner (their content had diverged). | `.claude/skills/` |

## 6. THE FIRST JOB — classify before migrating anything

**Do not start converting talents.** Classify all 200 into three buckets and report the split.
That number decides whether this is one session or five, and it is the number Ben wants before
committing to the whole thing.

1. **Expressible now** — an existing generic handler type already covers it. Straight conversion:
   author the rule into `data/authored/<atlas>-<tree>.json`, delete the name-keyed branch.
   *Expected to be the large majority.*
2. **Needs a new generic handler** — the shape recurs across ≥2 trees but no handler covers it.
   Add ONE generic handler type (iron rule 2a), then convert every consumer. Name the handler and
   list its consumers.
3. **Genuinely ENGINE-OWNED** — cannot be a rule. Declare it: cue rule on the talent +
   `ENGINE_OWNED: <reason>` in the tree-section header. Be strict; an undeclared exit becomes the
   default, which is precisely what happened to "manual" before rule 3 forced justification.

Suggested order once classified: **Chaos / Fate / Sovereignty first** — 9 talents each, 0 on the
document, no partial state to reconcile. They are the cleanest possible proof of the method before
touching the 25-talent leyline trees.

The per-tree name lists are reproducible in seconds — extract quoted literals from
`register-skills.js` and intersect with the built talent names; the built packs are ground truth,
the source files are not.

## 7. Open questions for Ben — do not decide these unilaterally

1. ~~**Does the ENGINE-OWNED exit need a cue rule in every case?**~~ **RESOLVED 2026-07-24 — YES**
   (Ben). Every ENGINE-OWNED talent carries a cue rule that at minimum posts a card, plus the
   `ENGINE_OWNED: <reason>` line in its tree-section header. Cost: ~26 authored rules, folded into
   whichever pack rebuild is nearest. Rationale: an empty Events tab is indistinguishable from a
   broken talent when you are looking at it in Foundry, which is the exact symptom that started
   this whole audit — so the exit must never *look* like the bug.

### A structural constraint the migration must plan around

**No session can verify a converted talent.** Moving behaviour onto a document changes the PACK,
and only Ben can rebuild and deploy. So a migration session's output is unverifiable until his
next bench pass — which means **batch by whole small tree, not by talent**: convert all 9 of a
deity tree, and one deploy verifies all 9. Converting scattered talents across five trees costs
five bench passes for the same work. This is the real reason to start with Chaos / Fate /
Sovereignty beyond their clean state.

## 8. Resolved since this doc was written

- **Razkael prose vs connections — FIXED 2026-07-24b** (Ben: "fix it"). `Cascading Failure`
  "Pinpoint Charge or Walking Ruin" -> "**Pinpoint Charge or Concussive Yield**"; `Fault Line`
  "Concussive Yield or Combustion Chain" -> "**Walking Ruin or Combustion Chain**". Both cards had
  named a talent on the opposite side of the tree from their drawn edges. `validate.js` is now at
  0 warnings.
- **Three more silently-dead prerequisites — FIXED 2026-07-24b.** Found by auditing every prereq
  token that resolves to nothing (the same class as `Gentle Passage`). A token that matches no
  talent, skill or attribute is classified "narrative" and quietly dropped, so the card reads
  correctly and enforces nothing:
  - `Scholar/Know Your Moment` — `"Mind and Body; Deduction 2+"`. `prereqGroups` split on the
    English word "and", tearing the talent name into "Mind" + "Body"; **the talent prerequisite
    was dropped entirely.** Any talent whose name contains " and " / " or " was unreferenceable.
    Fixed in the parser, not the data: `prereqGroups` now tries a whole fragment as a name before
    splitting it further. Extracted to `scripts/foundry-build-parts.js` so it is testable
    (`foundry-build.js` can't be required — classic-level at load + a top-level async IIFE).
  - `Leader/Resolute Stand` — `"Athletics +1"`, rank written backwards; the skill requirement was
    dropped. -> `"Athletics 1+"`.
  - `Warrior/Shattering Blow` — `"Windstance: Perception 2+"`, a colon where a semicolon belongs;
    **both** halves were dropped. -> `"Windstance; Perception 2+"`.
  - `Hunter/Animal Bond` — `"Animal compainion"` typo (narrative either way, but it printed on
    the card). -> `"Animal companion"`.

  Gated: `tests/pipeline.test.js` fails on any prereq using `+N` rank order or a colon separator,
  and pins the parser. A/B build confirms exactly 6 prerequisite changes and nothing else moved.
  Radiant orders in `cosmere.json` carry many unresolved tokens too, but `isLoadedByApp` excludes
  them from the build — they ship nothing, so they are out of scope.
- **`Gentle Passage` — RESOLVED 2026-07-24c** (Ben: do the one-word swap). It was a ghost from the
  **pre-rewrite Death tree**, alive only in `source-materials/legacy-uploads/domain.json`, where
  Morrath had ten talents and *Death's Threshold → Gentle Passage → Compost / Natural Conclusion*
  formed the Green-side **merciful-death** branch (Gentle Passage: remove an Injury, restful sleep,
  wake with [Die] + Awareness HP — *"Rest now. The cycle will carry you."*). All four were cut when
  the tree was rewritten around Harvested Remains; only the name survived, in Risen Servant's
  prereq string. Now `"Bone Garden or Speak with the Fallen"`, matching the drawn edges. **Design
  note for whoever revisits Morrath: the rewrite dropped Death's gentle half entirely.** Ten
  talents became nine, and every survivor is harvest/undeath. If that thematic half is ever wanted
  back, this is where it was.

Every remaining unresolved prereq token in the 21 shipped trees is *deliberate* narrative prose
("Patron in high society", "Access to a Shardblade", "Title granting you command of 5+ people") —
the build renders those as `connection`-type prereqs with their text, which is correct. The
Radiant orders in `cosmere.json` carry many more, but `isLoadedByApp` excludes them from the build.

---

## 9. THE CLASSIFICATION

> ## ⛔ READ §9k FIRST — §9a–§9g ARE SUPERSEDED
>
> **The authoritative classification is §9k (2026-07-24i), backed by the per-talent record in
> `EDHA_RULE_2B_CLASSIFICATION.json`.** The split is **9 / 56 / 136 / 17**.
>
> §9a–§9g below are the **07-24f** pass. They are kept because §9i and §9j record *how* they went
> wrong, and that post-mortem is the most useful thing in this document — but **do not quote their
> numbers**. The 61/16/118/26 split is void: it was derived against 31 of the 43 handler types, and
> from the engine's tree-section header ledgers rather than from call sites.

### 9a–9g (07-24f) — SUPERSEDED, kept for the post-mortem in §9i/§9j

Every name on `scripts/name-keyed-allowlist.json` was classified against the engine's **31
registered handler types** (`registerItemEventHandlerType`) and **10 event types**, reading the
per-tree section-header ledgers (the iron-rule-3 records) plus the code at each name's call sites.
All 221 have a live code site; none is already dead.
*(Both halves of that sentence are the bug: 31 of 43 handler types, and headers over call sites.)*

### 9a. The split — ⛔ VOID, see §9k

| bucket | count | what it means |
|---|--:|---|
| **1 — expressible now** | **61** | an existing handler type expresses it as-registered. Pure data move. |
| **1b — one schema field** | **16** | an existing handler + ONE new field. No new handler type. |
| **2 — needs a new handler** | **118** | the shape recurs across ≥2 trees and no handler covers it. **Waits on 8 handlers, not 118 designs.** |
| **3 — genuinely ENGINE-OWNED** | **26** | cannot be data (see 9d). |

**The headline is not 118.** Bucket 2 is large because the same eight shapes repeat across fifteen
trees — 46 of the 118 are one shape (a test gated on a defense). Build the eight handlers and
bucket 2 collapses into ordinary conversion work.

### 9b. Bucket 3 is NOT an exit from the ratchet — read this before estimating

Lint pass 7 scans for **any tree-talent name as a quoted literal in comment-stripped engine code**.
An ENGINE-OWNED talent whose behaviour stays in the engine *still fails the gate* while its name is
in a `switch`, a `Set`, or a lookup table. CLAUDE.md 2b already says this — "an exit still keeps the
name out of engine code" — so bucket 3 means **the engine must dispatch from a marker RULE on the
document instead of the name**, not "skip these 26". Cheaper than bucket 2, not free.

### 9c. The eight handlers (bucket-2 proposals)

Consumer counts are talents / distinct trees.

| # | handler | what it does | consumers |
|---|---|---|--:|
| **H1** | `edha-def-test` | Roll the talent's own test; gate on the target's **defense** (`edhaReadDefense`) or an **engine-rolled opposed skill** (`edhaRollOpposedSkill`); fire sibling rules tagged `whenTest: success\|fail`. Payloads stay existing handlers — this only *gates* them. | **46 / 15** |
| **H3** | `edha-owner-list` | A named, capped, ordered owner-scoped resource list + marker status: oldest fizzles past cap, spend-oldest, cleared at scene end. This is Omens, Remains, Charges, Insight, Edicts, Covenants, Snares, the quarry pointer — eight hand-rolled copies of one idea. | **24 / 11** |
| **H8** | `edha-watch` | Fire a payload when an engine-detected event crosses for a creature matching a filter (applyDamage pre/post, focus-drop, defeat, turn-start, token-move, test-completed). | **18 / 8** |
| **H7** | `edha-aura` | Maintain effect E on creatures matching filter F within range R while owned — the `edhaGuardianStanceSweep` shape `ENGINE_INDEX.md` already flags as "reuse for any while-adjacent/within-X passive". | **17 / 7** |
| **H2** | `edha-zone` | Generalises `edha-place-hazard`: click-placed persistent zone (circle **or** grid-snapped square), owner-tagged, capped, optional native difficult terrain, triggers on enter / turn-start-inside / turn-end-inside, disposition-filtered. | **15 / 6** |
| **H6** | `edha-prompt-pick` | The whispered pick-one card as data: a candidate source (allies in range / target's effects / your zones / lowest-HP enemy) + the payload fired on click. Six trees hand-roll this card today. | **15 / 9** |
| **H5** | `edha-cae-grant` | Grant or burn CAE action-economy resources (self or targeted ally). Replaces `EDHA_CAE_USE_GRANTS`. Single atlas, but six heroic paths. | **10 / 1** |
| **H4** | `edha-use-gate` | preUseItem refusal, pre-cost: owner flag, list count ≥ N, once-per-scene/turn/round, a live summon exists, target state. Never charges on refusal. | **8 / 5** |

**The owner-scan inversion is NOT a separate refactor** (corrected 2026-07-24, Ben's question — the
first write-up of this section called it the plan's highest risk; it isn't). 51 call sites over 38
distinct names find owners with `edhaOwnersOf("<talent name>")` / `edhaCharacterOwnersOf(...)`, and
those must become a rule-indexed lookup. But the engine **already does exactly that**:
`edhaDarkVeilSweep` (~L6885) walks every token → every talent → `edhaEventRules` → matches
`handler.type`, with no name literal anywhere. `edhaOwnersOfRule(type)` is that existing idiom
hoisted to a helper, and writing H7/H8 correctly *is* the inversion — there is no separate phase.

Two real residuals, both small:

- **One memoized index.** Shield Wall / Devoted Conduit run inside the applyDamage wrapper (~L902,
  L911) — per damage application, today short-circuiting on a name miss. A rule-walk at that
  cadence wants a cache invalidated on item create/update/delete. One cache.
- **Keep the adversary-scope asymmetry.** `edhaOwnersOf` (characters + adversaries, rulings
  113/107) vs `edhaCharacterOwnersOf` (characters only) was widened *per consumer* on purpose
  ("widen per-consumer, never wholesale"). A rule index flattens that unless `scope` is a field on
  the rule. One schema field on H7/H8.

**A cost this removes:** of the engine's talent-name literals, 51 are owner-scans but **113 are
`edhaOwnsTalent(actor, "X")`** — per-actor "do I own this" gates. Those evaporate for free: once
the behaviour is on the document, the rule being present IS the ownership test.

### 9d. Bucket 3 — the 26, by why

- **Client veil / per-viewer rendering (4)** — Phantom Double, Living Image, Void Sense, Lawkeeper's Eye.
- **Cross-actor paired ledgers (5)** — Sovereign's Balance, Sovereignty, Expose, Terms of Accord, Bound by Word.
- **Defeat-chain machinery (4)** — Reaper's Harvest, Necrotic Cascade, Combustion Chain, Cascading Failure.
- **Foundry vetoes (2)** — Wary (`preCreateActiveEffect`), Resilient Hero (`preUpdateActor` HP floor).
- **Roll rewriting (1)** — Voice of Authority.
- **Action-grant / volition (3)** — Weave the Thread, Thread of Inevitability, Absolute Authority.
- **Actor rewriting / state machines (3)** — Magnum Opus, Mantle of the Aspirant, Lifeline.
- **Document surgery + out-of-band (4)** — Reknit Form (deletes an Injury item), Calculated Patience (console toggle), Natural Order (narrative), Final Decree (three violation watchers resolving together).

### 9e. Per-tree readiness — and why this contradicts §6's suggested order

| tree | n | B1 | B1b | B2 | B3 | data-ready | handlers it needs |
|---|--:|--:|--:|--:|--:|--:|---|
| Red | 9 | 7 | 1 | 1 | 0 | **89%** | H1 H3 |
| Blue | 18 | 6 | 5 | 4 | 3 | 61% | H1 H6 |
| Life | 7 | 4 | 0 | 2 | 1 | 57% | H6 H7 |
| heroic | 54 | 17 | 10 | 25 | 2 | 50% | H1 H3 H4 H5 H7 H8 |
| Black | 14 | 6 | 0 | 8 | 0 | 43% | H1 H3 H6 H8 |
| Death | 9 | 3 | 0 | 4 | 2 | 33% | H1 H2 H3 H4 H6 |
| Civilization | 9 | 3 | 0 | 5 | 1 | 33% | H1 H2 H3 H4 H6 H8 |
| Destruction | 9 | 2 | 0 | 5 | 2 | 22% | H1 H2 H3 H8 |
| Knowledge | 9 | 2 | 0 | 7 | 0 | 22% | H1 H3 H7 H8 |
| Power | 9 | 2 | 0 | 5 | 2 | 22% | H1 H2 H3 H7 |
| Green | 19 | 4 | 0 | 13 | 2 | 21% | H1 H2 H6 H7 H8 |
| White | 20 | 3 | 0 | 14 | 3 | 15% | H1 H6 H7 H8 |
| Fate | 9 | 1 | 0 | 6 | 2 | 11% | H1 H2 H3 H6 |
| Sovereignty | 9 | 1 | 0 | 5 | 3 | 11% | H1 H4 H8 |
| Chaos | 8 | 0 | 0 | 7 | 1 | **0%** | H1 H3 H6 |
| Order | 9 | 0 | 0 | 7 | 2 | **0%** | H1 H3 H4 H7 |

**§6 recommends Chaos / Fate / Sovereignty first. The measurement says they are the three *least*
ready trees (0%, 11%, 11%).** §6's reasoning is still correct as far as it goes — those trees carry
zero document behaviour, so there is no partial state to reconcile, and one deploy verifies all
nine. But every one of their talents needs a handler that does not exist yet, so starting there
means the very first migration session is a handler-design session with nothing shippable behind
it. That was not knowable before this classification; it is now.

**Red is the tree §6 was looking for**: 9 name-keyed talents, 8 of them convertible with no new
handler, 0 bucket 3, one deploy. See 9f.

### 9f. Recommended order (Ben's call — this is a proposal, not a decision)

1. **Red (9)** — the pipeline pipe-cleaner. 8 of 9 need no new engine work. Proves the whole loop
   (author → build → deploy → tabs actually populate → Ben can edit them) with almost no risk. If
   something about the round-trip is broken, this is the cheapest possible place to find out.
2. **Build H1** — then **Chaos (8)** as its showcase: 7 of the 8 are literally the same def-test
   shape, so Chaos validates H1's design better than any other tree. This is §6's instinct, moved
   one step later so it lands on a handler that exists.
3. **H3 + H6** → Black, Knowledge, Fate, Order.
4. **H2 + H4** → Death, Civilization, Destruction, Power.
5. **The owner-scan inversion + H7 + H8** → White, Green, Life, Sovereignty. Highest risk, most
   dependents; do it once the pattern is proven and the gates are trusted.
6. **H5 + the heroic 54** — six paths, six deploys, but 27 of the 54 are B1/B1b.
7. **Bucket 3 (26)** — the marker-rule + dispatch inversion pass, tree by tree, closing the ratchet.

### 9g. Session estimate

**19–24 sessions**, split roughly:

| phase | sessions |
|---|--:|
| 8 handler builds (schema + executor + dispatch + pinned tests + `ENGINE_INDEX.md`) | 5–6 |
| the owner-scan inversion (bundled into H7/H8, called out because it is the risk) | 1–2 |
| conversions — 10 deity trees | 5 |
| conversions — 5 leyline trees | 4 |
| conversions — 6 heroic paths | 3 |
| bucket 3 — marker rules + dispatch inversion + `ENGINE_OWNED:` declarations | 2–3 |
| slack for bench-pass fallout (⚑ every batch is unverifiable until Ben deploys) | 2–3 |

Two things move that number more than anything else:

- **Whether every ENGINE-OWNED talent needs a cue rule** — §7 question 1, still unanswered. "Yes"
  costs ~26 authored rules and one more pack rebuild; "no" costs nothing but leaves those Events
  tabs empty (which is the symptom that started this).
- **Bench-pass latency.** No session can verify a converted talent (§7). 16 batches means up to 16
  bench passes; the estimate above assumes most batches pass first time, which past passes suggest
  is optimistic for the big trees.

### 9i. PASS A RESULT — Red, and a correction to 9a's bucket-1 count

**Ben chose Red first (2026-07-24). Converting it read every call site properly for the first time,
and 9e's "Red: 89% data-ready, 8 of 9 with no new engine work" did not survive contact.** The
classification in 9a was built from the tree section-header ledgers plus spot code reads; the
headers describe a talent's *mechanic* accurately but not which *handler* can express it. Actual:

| Red talent | 9a said | actually | state |
|---|---|---|---|
| Emotional Overload | B1 | B1 `edha-next-test-mod` | **converted** |
| Reckless Gambit | B1 `edha-test-rider` | B1, but TWO rules — `edha-next-test-mod` + `edha-apply-status` | **converted** |
| Shockwave Slam | B1 | already document-driven; name survived only in a schema hint + a default | **converted** |
| Frenzied Tempo | B1 `edha-test-rider` | **1b** — `whenAttribute`/`whenFastTurn` exist but there is no `mode` field, so advantage is inexpressible | deferred |
| Red Leyline Attunement | 1b | 1b — attr-gated rider on the Key | deferred |
| Reckless Momentum | B1 `edha-move` | **wrong handler entirely** — it grants a Plot Die (`edhaGrantPlotDie`); no handler does that | deferred |
| Shatter Focus | B2 | B2 + a cross-actor focus DRAIN no handler expresses | deferred |
| Incite | B1 | card-only (volition) — now takes the §7 q1 cue rule | deferred |
| Breaking Point | B1 `edha-triggered-effect` | **B2 (H8)** — a cross-actor applyDamage watcher with a per-round hit counter, range + hostility gates | deferred |

**So: 3 converted, not 8.** Of the 7 Red talents 9a called bucket 1, 3 held.

**What this means for 9a's numbers.** Treat **61 as an upper bound**, not a count. If Red's hit rate
generalises, true bucket 1 is more like 30–40, with the remainder sliding into 1b and 2. The
bucket 2 / bucket 3 boundary is far more reliable — those came from headers describing genuinely
complex machinery, which headers do describe well. **The eight handlers in 9c are unchanged**, and
that is the load-bearing part of the plan: this shifts *which* talents wait on a handler, not how
many handlers there are. Net effect on 9g: back toward the **top** of the 19–24 range.

**Do not re-derive the whole classification from this.** The cheap fix is to read call sites at
conversion time, per tree, which is when it matters — the number that decides the plan (8 handlers)
is not the number that moved.

**A latent bug the migration surfaced.** `edha-push`'s `note` field shipped with
`initial: "Shockwave Slam"` — a talent-specific default on a *generic* handler, so any new push rule
authored in Foundry came out labelled as a different talent. Every shipped consumer had silently
overridden it. Now blank, with `edhaRunPush` falling back to "Push". This is the class of thing the
2b migration is expected to keep turning up.

### 9j. ⚠️ THE CLASSIFICATION MISSED THE SYSTEM'S OWN VOCABULARY (Ben, 2026-07-24)

**Ben: "I swear you're missing key things that currently function within Foundry — like plot die."
He was right.** 9a/9c enumerated the handler vocabulary by grepping
`source: "edha-content", type: "..."` in `register-skills.js` — i.e. **only the module's own 31
handlers and 10 events**. The cosmere-rpg system (v2.1.0, read from the live install at
`FoundryVTT/Data/systems/cosmere-rpg`) registers its **own** event system on top of which the
edha-* types are merely additions.

**True vocabulary: 43 handler types (31 edha + 12 native) and 27 event types (10 edha + 17 native).**

Native handler types (from `lang/en.json` → `COSMERE.Item.EventSystem.Event.Handler.Types`):
`grant-items` · `remove-items` · `modify-attribute` · `set-attribute` · `modify-skill-rank` ·
`set-skill-rank` · `grant-expertises` · `remove-expertises` · `use-item` · `update-item` ·
**`update-actor`** · **`execute-macro`**

Native event types (→ `…Event.Types`): `create` · `update` · `delete` · `add-to-actor` ·
`remove-from-actor` · `equip` · `unequip` · `use` · **`mode-activate`** · **`mode-deactivate`** ·
`goal-complete` · `goal-progress` · **`update-actor`** · **`apply-damage-actor`** ·
**`apply-injury-actor`** · `short-rest-actor` · **`long-rest-actor`**

#### What this changes

- **`update-actor` (handler)** — `Target: parent | global`, plus a free-form **`Changes`** set. It
  can write ANY field or flag on the owning actor from a rule. Ben's example lands exactly here:
  **Reckless Momentum** grants a Plot Die, which 9i called "no handler does that". Wrong — a native
  `update-actor` (target `parent`) writing `flags.edha-content.plotDieNext` is consumed by the
  engine's EXISTING `edhaPlotDiePreRoll` injector. **Expressible now, no new handler.**
- **The native events replace hand-rolled watcher machinery.** `apply-damage-actor` is Breaking
  Point's class; `update-actor` (event) is the focus-watcher class (Whispered Doubt / Coercive
  Pressure / Predatory Insight); `long-rest-actor` is Resilient Hero's spent-flag clear;
  `apply-injury-actor` is Reknit Form; `mode-activate` / `mode-deactivate` are the STANCE machine
  (ENGINE_INDEX's "the system ships NO stance machinery" is true of stance *AEs*, but the system
  does fire stance events).
- **`execute-macro` supports `Inline`** — a rule can carry macro code on the document. That is a
  document-resident escape hatch for bucket 3. Whether to use it is a real design question (it
  satisfies "editable in Foundry" but puts untested, unlinted code in a text field) — **Ben's call,
  not assumed here.**
- **H8 (`edha-watch`, 18 talents) is the proposal most at risk of being unnecessary**, since its
  whole justification was "no handler fires on engine-detected events." What those talents actually
  need is the *filter* (range, disposition, per-round counters), not the event plumbing.

#### The limit that keeps the rest of the analysis standing

`update-actor`'s Target is **`parent` or `global` (a fixed UUID)** — there is **no "current user
target"**. So target-dependent effects genuinely still need edha-* handlers reading
`game.user.targets`, which is why `edha-next-test-mod` and friends exist. Native handlers cover
**self/owner state writes**; Edha handlers cover **targeting**. That split is the real dividing line
and 9a did not draw it at all.

#### Status of the numbers

**9a's split is now known-incomplete and should not be quoted.** Bucket 2 (118) is overstated —
some unknown fraction is natively expressible. Re-deriving it means re-checking all 221 against 43
handlers instead of 31, which is a session's work and should happen **before** any handler is
built, since it may delete whole proposals. Not done here; flagged loudly instead.

⚑ **Unverified:** no authored talent currently uses a native handler type (all 100+ authored rules
are `edha-*`). The pipeline *should* pass them through — `foundry-build.js` copies the events map
verbatim and `lint-refs` pass 2 only validates `edha-`-prefixed types — but this has never been
exercised. Checklist row **2bA-9** is a zero-risk probe: confirm the native types appear in the
rule editor's handler dropdown.

#### Two side answers from the same read

- **CAE's api is not "uncaptured" — there isn't one.** `cosmere-advanced-encounters` v1.3.1 exposes
  no api object; its interface is the combatant flags `actionsAvailable` (47 refs) and
  `reactionsAvailable` (18), which the Edha engine already writes via `edhaCaeGrant`. The §9j #1b
  "GATED on the CAE api capture" blocker can be closed — the flags ARE the contract.
- **No live-module drift.** `FoundryVTT/Data/modules/edha-content/scripts/register-skills.js` is
  byte-identical to repo `3438c0b` apart from CRLF/LF. Ben's machine is current as of the commit
  before pass A, so the pass A deploy is a clean fast-forward.

### 9h. Reproducing this

The classification is derived, not hand-listed: `scripts/name-keyed-allowlist.json` ∩ the built
talent names, with each name's code sites extracted using the **same comment-stripping** lint pass 7
uses (so the section-header ledgers don't read as call sites). Handler vocabulary comes from
grepping `source: "edha-content", type: "..."` in the registration block (~L14597–15040).

⚑ **Not verified in Foundry** — nothing here changes behaviour, but the handler *designs* in 9c are
paper designs. H1's interaction with the existing contest queue (`edhaQueueContest`, which already
owns the "capture the owner's next roll" half) is the one to scrutinise before building: H1 should
almost certainly *wrap* that queue rather than duplicate it.

---

## 9k. ✅ THE CLASSIFICATION — 218 names against the FULL vocabulary (2026-07-24i)

**This section is authoritative.** Per-talent record: **`EDHA_RULE_2B_CLASSIFICATION.json`**
(every name, its bucket, the handlers it needs, and a one-line reason from its call site).
Reproduce/verify with `node scripts/check-2b-classification.js` — the summary numbers below are
*computed from* that map, not asserted alongside it. That is deliberate: the 07-24f split was
published in prose that nothing could reproduce, and it was wrong for six days.

### The method, and why it differs

Two things were fixed relative to 07-24f, and each one moved the answer:

1. **The full vocabulary.** 43 handler types (31 edha + 12 native) and 27 events (10 edha + 17
   native) — re-derived from the engine's registration block and `data/native-vocabulary.json`,
   both re-counted this pass rather than trusted.
2. **Call sites, never headers.** Every one of the **527 call sites** across the 218 names was
   read, plus the **full body of all 132 engine functions** reached from a name-bearing line.
   Extraction reused lint-refs pass 7's own comment stripper, so the tree-section header ledgers
   (which list talents by name on purpose) could not be mistaken for dispatch. This is the
   correction §9i demanded after Red's "8 of 9 convertible" became 3.

### The split

| bucket | count | share | what it means |
|---|--:|--:|---|
| **1 — expressible now** | **9** | 4% | an existing handler (edha **or** native) expresses it as-registered. Pure data move. |
| **1b — one schema field** | **56** | 26% | an existing handler + ONE new field (or one small engine tolerance change). |
| **2 — needs a new handler** | **136** | 62% | **waits on 9 handlers, not 136 designs.** |
| **3 — genuinely ENGINE-OWNED** | **17** | 8% | cannot be a rule. Still leaves the allowlist (§9b). |

**Bucket 1 collapsed from 61 to 9, and that is the honest number, not a pessimistic one.** Bucket 1
means *zero engine change*. Almost nothing clears that bar, because the engine's name-keyed code
nearly always bundles the payload with something the handler doesn't yet carry — a range gate, a
cap, a target filter. §9i predicted 30–40 if Red's hit rate generalised; reading all 218 says it is
lower still. **The number that actually decides the plan is B1+B1b = 65 (30%) cheap, against a
bucket 2 that funnels into a handful of handlers.**

### The eight proposals, re-tested — 7 survive, 1 dies, 2 are new

| # | handler | consumers (B2) | verdict |
|---|---|--:|---|
| **H8** | `edha-watch` | **47 / 12 trees** | **SURVIVES — and is now the largest demand, not the most at-risk proposal.** See "the dividing line" below; its stated justification was wrong but its necessity is stronger than claimed. |
| **H1** | `edha-def-test` | **45 / 17** | **SURVIVES.** The cleanest win. It is also literally `EDHA_HEROIC_DEFTESTS` made authorable — that table is H1's config schema, already written down. |
| **H3** | `edha-owner-list` | **34 / 6** | **SURVIVES, bigger than the 24 estimated** (37 counting 1b readers). Six trees hand-roll byte-identical capped-list-with-oldest-fizzles code: Omens, Remains, Charges, Snares/Ordained, Edicts/Covenants, Insight. |
| **H6** | `edha-prompt-pick` | **31 / 12** | **SURVIVES — bigger AND far cheaper than estimated.** See "the cheap majority" below. |
| **H5** | `edha-cae-grant` | **14 / 7** | **SURVIVES**, but 9c's "single atlas, six heroic paths" is wrong — leyline Black needs it too. |
| **H2** | `edha-zone` | **11 / 5** | **SURVIVES**, slightly smaller than the 15 estimated. |
| **H7** | `edha-aura` | **8 / 4** | **SURVIVES**, much smaller than the 17 estimated — several presumed auras are really H8 watchers. |
| **H4** | `edha-use-gate` | **0** | **DOES NOT SURVIVE.** Every "nothing spent" precondition at the call sites is talent-specific (*has a Construct / has a Covenant / target is Weakened / once per scene*). The genuinely reusable parts are already covered: once-per-scene/turn/round by the existing trigger gates, list-count by H3, target state by H1. **Don't build it.** |

**Two new proposals the 07-24f pass missed entirely:**

| # | handler | consumers | what it is |
|---|---|--:|---|
| **H10** | `edha-focus` | **8 / 5 trees** | Involuntary focus gain/loss as a rule. `edhaGainFocus` / `edhaDrainFocus` are engine-only with **no handler at all**, so every focus talent across Envoy, Black, Red, Hunter and Warrior is name-keyed by necessity. |
| **H9** | `edha-die-step` | **5 / 1 tree** | The damage-die-step ledger (`edhaSovAddStep`). All of Sovereignty and nothing else. **See the question in §9m.** |

### The dividing line — verified in the system source, not inferred

§9j drew it for handlers and flagged H8 as probably unnecessary. Reading
`systems/cosmere-rpg/index.js` shows the line is **wider** than §9j drew it, and that it saves H8
rather than killing it:

> When a native event's hook fires, the system resolves it to **one document** and, if that document
> is an Actor, iterates **`actor.items`** — the items of the actor the event happened **to**.
> (`index.js`, the `Hooks.once('ready')` dispatcher.)

So `apply-damage-actor` on a talent means "**I** was damaged", never "an ally was damaged". Native
events are as owner-scoped as native handlers are. The same is true of the edha events: they run
through the *same* dispatcher, and pick their one document via `transform` (which is how
`edha-on-defeat` redirects from the victim to the killer — a deliberate cross-actor *redirection*,
but still to exactly one actor).

**Neither event system can fan out to N observers.** That — not "no handler fires on engine-detected
events" — is why 47 talents hand-roll `edhaCharacterOwnersOf("X")` sweeps, and it is H8's real
justification. The engine already has the right idiom (`edhaDarkVeilSweep` walks tokens → talents →
`edhaEventRules` matching `handler.type`, with no name literal anywhere); H8 is that hoisted to
`edhaOwnersOfRule(type)` plus the filter (range, disposition, per-round-per-target counters).

**What the native vocabulary genuinely does buy**, now that it's scoped correctly:

- `long-rest-actor` / `short-rest-actor` + `update-actor` — self-state clears. Resilient Hero's
  `resilientSpent` flag is the clean example (the talent stays bucket 3 for its HP-floor veto, but
  its rest-clear half stops needing engine code).
- `mode-activate` / `mode-deactivate` — real, but the stance machine **already** keys on
  `system.modality`, not names. The names that remain are in `EDHA_STANCE_CHANGES`, which is
  an ActiveEffect `changes` array sitting in a lookup table. It belongs in the talent's `effects`
  with **no handler at all** — which is why Bloodstance and Stonestance are two of the nine
  bucket-1s.
- `update-actor` writing owner flags — real, and it is why Reckless Momentum is now 1b not 2.

⚠ **But the plot-die claim in §9j needs one correction.** §9j says Reckless Momentum is
"expressible now, no new handler". Not quite: `getChangeValue` returns `change.value` **as a
string** in OVERRIDE mode (objects only merge in ADD mode, and only when the flag already exists).
`edhaGrantPlotDie` writes an object `{skill, source}`. A native write therefore lands a *string* —
`edhaPlotDiePreRoll` still injects the die (the flag is truthy and `g.skill` is undefined, so it is
not skill-gated), but `edhaPlotDieConsume`'s card loses `g.source` and reads "Raise the Stakes".
**One engine tolerance line** (`typeof g === "string" ? { source: g } : g`) makes it clean. That is
bucket **1b**, and the strictness is the point — this is exactly the class of "works by accident"
that a paper classification misses.

### The cheap majority nobody costed: names that are PARAMETERS, not dispatch

The single most useful discovery for the estimate. A large share of the 218 sit in code where the
talent name is **passed as an argument to an already-generic function** — a label and a
once-per-round key — not branched on:

- **Lookup tables of flat config.** `EDHA_HEROIC_DEFTESTS`, `EDHA_CAE_USE_GRANTS`,
  `EDHA_STANCE_CHANGES`, `EDHA_STANCE_SKILL_ADV`, `EDHA_OPP_ADDERS`, `EDHA_SINGLE_TARGET`, the Draw
  Mana kind table. Each row is *already* a handler config object. Conversion = move the row onto the
  document and delete it. The universal shape is `const g = TABLE[item.name]; if (!g ||
  !edhaOwnsTalent(actor, item.name)) return;` — and that ownership re-check evaporates for free,
  because once the rule is on the document, **the rule being present IS the ownership test**.
- **The prompt-card family.** `edhaPostCalcTestCard`, `edhaPostCoordReactionCard`,
  `edhaPostBulwarkCard`, `edhaPostDisorientCard`, `edhaPostTriggerCard`, `edhaPostBeaconCard`,
  `edhaPostPlotGrantCard`, `edhaPostDesignateCard`, `edhaGnosisPostTransferCard` and friends are
  **already generic** — they take `(owner, name, config)`. H6 is mostly *exposing a schema over
  functions that already exist*, which is why it is far cheaper per consumer than H1 or H3.

This is why the readiness table below inverts §9f's recommended order.

### Per-tree readiness — this INVERTS §9e and §9f

"Ready" = B1 + B1b, i.e. convertible with no new handler.

| tree | n | B1 | B1b | B2 | B3 | ready | handlers it needs |
|---|--:|--:|--:|--:|--:|--:|---|
| **Warrior** | 11 | 2 | 6 | 2 | 1 | **73%** | H5, H10 |
| **Leader** | 16 | 0 | 9 | 6 | 1 | **56%** | H1, H5, H6 |
| **Agent** | 6 | 0 | 3 | 3 | 0 | **50%** | H5 |
| **Envoy** | 10 | 1 | 4 | 5 | 0 | **50%** | H1, H5, H6, H10 |
| **Scholar** | 4 | 0 | 2 | 2 | 0 | **50%** | H1, H5 |
| **Red** | 6 | 0 | 3 | 3 | 0 | **50%** | H1, H8, H10 |
| **Hunter** | 7 | 0 | 3 | 4 | 0 | 43% | H1, H5, H8, H10 |
| Civilization | 9 | 1 | 2 | 5 | 1 | 33% | H1, H2, H8 |
| Death | 9 | 1 | 2 | 5 | 1 | 33% | H1, H2, H3, H8 |
| Power | 9 | 0 | 3 | 5 | 1 | 33% | H1, H8 |
| Blue | 18 | 2 | 4 | 10 | 2 | 33% | H1, H6, H8 |
| Green | 19 | 0 | 6 | 12 | 1 | 32% | H1, H2, H6, H7, H8 |
| Black | 14 | 1 | 3 | 9 | 1 | 29% | H1, H5, H6, H8, H10 |
| Destruction | 9 | 0 | 2 | 6 | 1 | 22% | H1, H2, H3 |
| White | 20 | 0 | 3 | 14 | 3 | 15% | H1, H6, H7, H8 |
| Life | 7 | 1 | 0 | 6 | 0 | 14% | H1, H6, H8 |
| Sovereignty | 9 | 0 | 1 | 6 | 2 | 11% | H1, H8, **H9** |
| Chaos | 8 | 0 | 0 | 7 | 1 | **0%** | H1, H3, H6 |
| Fate | 9 | 0 | 0 | 9 | 0 | **0%** | H2, H3, H6, H7, H8 |
| Knowledge | 9 | 0 | 0 | 9 | 0 | **0%** | H1, H3, H6, H8 |
| Order | 9 | 0 | 0 | 8 | 1 | **0%** | H1, H3, H6, H7, H8 |

**The six heroic paths are the readiest trees in the project (43–73%), and §9f put them SIXTH.**
They are ready for exactly the reason above: heroic behaviour is overwhelmingly lookup-table rows,
which are the cheapest conversion that exists. §9f's ordering was built on 9a's inflated bucket 1,
which was spread evenly across trees because headers describe every tree equally well.

The four 0% trees (Chaos, Fate, Knowledge, Order) are the **resource-ledger** trees — Omens, Snares,
Insight, Edicts. They are 0% for one shared reason: all four are gated on **H3**.

### Revised recommended order — ⚠️ SUPERSEDED for everything after the heroic atlas, see §9o

> Steps 1–2 (heroic first) were correct and are **done** — passes B–E. Steps 3–7 below were reasoned
> from raw consumer counts; **§9o recomputes the order from what actually becomes fully convertible**
> and reaches a different answer (H3 before H8, and ~13 talents convertible with no build at all).
> Use §9o.

1. **Warrior + Agent + Scholar (21 talents, 3 deploys, ZERO new handlers).** 13 of the 21 are
   B1/B1b. Proves the loop on the cheapest possible content and retires three whole trees. Warrior
   alone kills `EDHA_STANCE_CHANGES` and `EDHA_STANCE_SKILL_ADV`.
2. **Build H1 + H5** — the two the heroic atlas is waiting on — then **Leader, Envoy, Hunter (33)**.
   That closes the entire heroic atlas, which is 54 of 218 (25%), on two handlers.
3. **Build H3** → **Chaos, Fate, Knowledge, Order (35)**. The four 0% trees unblock together, and
   H1 is already built by then, which is most of what Chaos and Order also need.
4. **Build H6 + H8** — the two biggest remaining — then **Black, Blue, Red, Green (57)**.
5. **Build H2 + H7** → **Death, Civilization, Destruction, Power, Life, White (63)**.
6. **Sovereignty (9)** last among conversions, pending the §9m H9 decision.
7. **Bucket 3 (17)** — marker-rule dispatch + cue rules + `ENGINE_OWNED:` lines, closing the ratchet.

### Revised session estimate: **17–22**

| phase | sessions |
|---|--:|
| Warrior / Agent / Scholar — no new handlers | 1–2 |
| 9 handler builds (schema + executor + dispatch + pinned tests + `ENGINE_INDEX.md`) | 6–7 |
| conversions — 6 heroic paths (54, but 27 are B1/B1b) | 2 |
| conversions — 10 deity trees (87) | 4 |
| conversions — 5 leyline trees (77) | 3 |
| bucket 3 — 17 marker rules + cue rules + declarations | 1–2 |
| slack for bench-pass fallout (⚑ every batch is unverifiable until Ben deploys) | 2–3 |

**Slightly *down* from 19–24 despite one more handler**, because three things got cheaper:
bucket 3 shrank 26 → 17 (fewer marker-rule conversions, and §7 q1's ~26 cue rules become ~17);
H4 is not built at all; and the table-row conversions are far quicker per talent than a generic
"conversion session" assumes. The estimate is still dominated by **bench-pass latency**, not by
the work — every batch is unverifiable until Ben deploys, and there are ~16 batches.

### 9l. ⚑ What is NOT verified

- **Native handler/event types have never been exercised by any authored talent.** All 100+ authored
  rules are `edha-*`. Checklist row **2bA-9** (read the rule editor's dropdowns) is the zero-risk
  probe and **it has not been run** — the 2bA rows are all still open. **Every bucket-1/1b call in
  this section that leans on a native type is provisional on 2bA-9**, specifically: Reckless
  Momentum, Risky Behavior, and Resilient Hero's rest-clear half. Nothing else in the split depends
  on it — the other 63 cheap talents ride edha handlers that are proven in production.
- **The handler designs remain paper designs.** This pass validated *demand* (who needs what, from
  the call sites); it did not design a schema. §9h's warning still stands: H1 should almost
  certainly wrap `edhaQueueContest` rather than duplicate it.
- Nothing in this pass changed behaviour. **Docs + one new checker script only; nothing to deploy.**

### 9n. CONVERSION LOG — what has actually come off the engine

| pass | date | talents | ratchet | notes |
|---|---|---|--:|---|
| **A** | 07-24g | Red ×3 — Emotional Overload, Reckless Gambit, Shockwave Slam | 221 → 218 | checklist 2bA-1…9, unverified |
| **B** | 07-24j | **Warrior stances ×6** — Bloodstance, Stonestance, Vinestance, Flamestance, Ironstance, Windstance | **218 → 212** | checklist 2bB-1…10, unverified. Both name-keyed stance tables deleted. |
| **C** | 07-24k | **the self-next-test family ×6** — High Society Contacts, Underworld Contacts, Risky Behavior (Agent), Rumormonger, Well Supplied (Leader), Overwhelm with Details (Scholar) | **212 → 206** | checklist 2bC-1…8, unverified. `EDHA_OPP_ADDERS` + 2 bespoke hooks deleted. |
| **D** | 07-24m | **H1 built** + **heroic def-tests ×4** — Synchronized Assault, Set at Odds, Grand Deception (Leader), Turning Point (Scholar) | **206 → 202** | checklist 2bD-1…7, unverified. First handler build of the migration. |
| **E** | 07-24n | **H5 + H11 built**, the `edha-combat-timing` dispatcher wired, **×11** — Fast Talker, Quick Analysis, Trickster's Hand (Agent), Cautious Advance, Practiced Kata, Vigilant Stance (Warrior), Backstep, Sidestep (Hunter), Through the Fray, Tactical Ploy (Leader), Foresight (Envoy) | **202 → 191** | checklist 2bE-1…10, unverified. `EDHA_CAE_USE_GRANTS` + 3 bespoke hooks deleted. |

**Pass E — the event that had no dispatcher.** `edha-combat-timing` was registered on 07-18 and
**nothing ever dispatched it**; every combat-timed passive was a bespoke name-keyed `combatStart`
hook instead. Wiring it once unlocked three things at once: H5's passive grants (Foresight,
Sidestep), H11 `edha-enter-stance` (Practiced Kata → Vigilant Stance, closing the gap found in
pass B), and any combat-timed passive later. Worth remembering as a search heuristic: **a
registered type with zero dispatch sites is a migration unlock hiding in plain sight.**

**Tactical Ploy is the load-bearing conversion.** It is the first talent whose H1 payload is real
mechanics rather than card text — an `edha-def-test` gate plus *two* sibling rules on
`edha-test-success` (`edha-next-test-mod` −1d4 and `edha-cae-grant` burn-reaction). Batch 1 proved
the gate; this proves the dispatch. 45 talents are queued behind that answer, so checklist **2bE-7**
matters more than anything else outstanding.

**A deliberate widening, flagged.** The retired `combatStart` hooks were gated
`a.type === "character"`. Rule-driven dispatch does not need that gate — only an actor actually
carrying the rule fires — so an adversary with an embedded twin now gets its combat-start grant.
That is the correct scope for a rule and consistent with the adversary-twin design, but it *is* a
behaviour change (checklist 2bE-9, reversible if Ben wants PC-only).

**Vigilant Stance leaves the ratchet with an EMPTY document, and that is declared, not an
oversight.** Its Dodge/Reactive-Strike discount is the CAE-NEXT *cost-discount* class, which no
handler can express yet; its text still reaches the table because `edhaToggleStance` copies the
talent's description onto the stance marker. Recorded in the heroic section header with the
condition for fixing it (the moment a CAE cost hook exists). **This is the first talent to take a
declared exit purely because its mechanic is unbuildable rather than engine-owned** — expect more
of them in the CAE-NEXT cluster, and do not let the empty tab pass without the header line.

**Pass D — H1 `edha-def-test` exists.** One handler (gates only), two events
(`edha-test-success` / `edha-test-fail`), one pure helper (`edhaDefTestOutcome`), one dispatcher
(`edhaDispatchTestResult`). Three design points worth keeping:

- **It wraps the contest core**, per §9h. `edhaQueueContest` already owns roll-capture, the TTL and
  skill-matching; H1 only does the comparison in the callback. No new capture code.
- **The dispatcher knows no payload handler type.** Every rule carries its own executor
  (`rule.handler.execute` — the same call the system's `fireEvent` makes), so a payload may be any
  handler, edha or native, present or future. Hand-listing payload types would have reproduced the
  name-keyed mistake one level up.
- **Two events, not one event + a `whenTest` field.** A field would have to be added to *every*
  payload handler's schema; two events cost nothing and the rule editor's event picker documents
  the branch by itself.

Per Ben's ruling the deity conversions will be **player-rolled** like the heroic ones, so there is
a single roll path and no `roll: owner|engine` field. Their hand-rolled "nothing spent" guarantee
survives as a **`preUseItem` veto** (`requireTarget` / `rangeColor`): returning false cancels
before cost *without* swallowing the card or the roll.

**Batch 1 was deliberately the four talents whose payload is table-run**, so the gate gets benched
before anything mechanical rides on it. Two H1 modes therefore remain unproven: `vs: skill` (no
consumer in this batch) and the `edha-test-fail` event (fires no payload yet).

**Three more conversion-time corrections, all payload-side** — H1 gates these fine, but they have
no *payload* handler, which the classification did not distinguish:

- **Sharp Eye** — its payload reads arbitrary target state (lowest attribute/defense, which
  resources are below half) into a whispered card. Needs a small reveal handler.
- **Field Medicine** — heals the **target's** recovery die + your Medicine ranks;
  `edha-triggered-effect`'s formula resolves against the OWNER, so it cannot express it. Needs a
  target-die formula source. **Resuscitation** stays coupled to it.
- **Tactical Ploy** — now `needs: [H1, H5]`; its burn-reaction half waits for H5.

**The lesson for the remaining 135 bucket-2 talents: "needs H1" is necessary, not sufficient.**
A talent needs a gate *and* a payload, and §9k's `needs` column only ever recorded the gate. Expect
the same split on the deity trees — the test is H1, but the Omen/Remain/Insight payloads are H3.

**Pass B — step 1 of §9k's revised order (the readiest tree, zero new handlers).** The numeric
while-active riders (`EDHA_STANCE_CHANGES`) moved to ONE ActiveEffect per talent flagged
`edha-content.stanceRider` with `transfer: false` — it sits on the talent's Effects tab where Ben
edits the numbers, never applies by itself, and `edhaStanceRiderChanges` copies it onto the marker
at enter. The skill advantage (`EDHA_STANCE_SKILL_ADV`) moved to an `edha-test-rider` rule using
three new fields — `mode`, `whenSkill`, `whileStanceActive` — which also retires the bespoke
`edhaStanceAdvPreRoll` hook in favour of the ONE existing pre-roll rider pipeline. **The `mode`
field is what §9i said Frenzied Tempo was blocked on, so Red's deferred 1b is now unblocked too.**

**A latent bug the conversion surfaced** (the class §9i predicted). `edhaStanceAdvPreRoll` set
`roll.options.advantageMode = 1`; the system's enum is the **string** `"advantage"`, and a dialog
roll overwrites `roll.options` from `data.skillTest` unless `configureDialog` is also wrapped — it
wasn't. **Stance skill advantage almost certainly never worked at the table.** Checklist 2bB-4.
Two further stale artefacts went with it: the *"INDICATOR ONLY … Mechanics manual"* effects on
Flamestance and Vigilant Stance, obsolete since the 07-18g stance machine made the marker the
indicator, and false for the half now wired. Removed from `data/talent-effects.json` (their real
source) as well as the authored overlay.

**Two corrections to §9k, found by converting rather than reading.** Exactly the §9i discipline —
the classification is a plan, not a guarantee, and call sites get re-read at conversion time:

- **Practiced Kata was 1b, is bucket 2.** §9k assumed `edha-combat-timing` was a handler. It is an
  **event**, and it has **zero consumers** — nothing dispatches it. "Enter a stance at combat start"
  needs a small new handler (**H11 `edha-enter-stance`**; fold it into the H5 build).
- **Vigilant Stance was 1b, is bucket 2.** Its name appears in engine code *only* inside Practiced
  Kata's lookup, so it cannot leave the ratchet until Practiced Kata does. Coupled, not independent.

Net: the 212 remaining split **7 / 50 / 138 / 17**. The two corrections moved 2 talents from 1b to
2 and added an eleventh handler; they did not move the plan, which is the point §9i was making.

**Pass C — one shape, three paths, no new handler.** Every one of the six was *on use, write a
next-test flag on myself*: the four Opportunity adders wrote `oppCredit`, Risky Behavior wrote
`plotDieNext`, Overwhelm with Details wrote `nextTestMod`. All three flags already had engine
consumers, so the whole family collapses into **`edha-next-test-mod`** with three added fields —
`target` (self | target), `plotDie`, `opportunity` — and the formula now resolves against the
*owner's* roll data at use, so a self-mod banks a number instead of an unresolved `@`-ref.

This is the §9k "names that are PARAMETERS, not dispatch" prediction paying out: `EDHA_OPP_ADDERS`
was a four-name `Set` gating one flag write, and it died as data. **Bucket 1b is where the cheap
wins actually live** — 13 of the 18 talents converted so far were 1b, none needed a new handler,
and three name-keyed tables plus four bespoke `useItem` hooks are gone.

**A third correction, same class as pass B's.** **Resuscitation** was 1b, is **bucket 2**: its name
appears in engine code only inside *Field Medicine*'s success-card string, so it is coupled and
cannot leave until Field Medicine converts on H1. Three coupling corrections in two passes is a
pattern worth stating: **a talent whose only call site is inside ANOTHER talent's code cannot be
converted alone**, and the classification counts it as independently ready when it isn't. Grep a
candidate's call sites for a *different* talent's name before batching it.

### 9o. BUILD PRIORITY — what shrinks the remaining 124 fastest (measured 07-24n)

**This supersedes §9k's "revised recommended order" for everything after the heroic atlas.** That
order was reasoned from raw consumer counts; this is computed from the per-talent `needs` sets in
`EDHA_RULE_2B_CLASSIFICATION.json`, which is a different and better question — *how many talents
become **fully** satisfied*, not how many mention a handler.

Reproduce it — do not trust this table once talents have converted:

```bash
node scripts/check-2b-classification.js --priority
node scripts/check-2b-classification.js --priority --built=H1,H5,H11,H3   # after the next handler
```

| build | newly convertible | cumulative |
|---|--:|--:|
| *(nothing — already satisfiable today)* | **20** | 20 |
| **+H8** `edha-watch` | +19 | 39 |
| **+H6** `edha-prompt-pick` | +24 | 63 |
| **+H3** `edha-owner-list` | +29 | **92 of 124 (74%)** |
| +H2, +H7, +H10, +H9 | +32 | 124 |

**The increments GROW (19 → 24 → 29), and that is the finding.** Most bucket-2 talents need a
**pair** of handlers, so each new one completes combinations the earlier ones left dangling. H8's
raw demand is 47 but only **19** of those need nothing further — 13 also want H6, 8 also want H3.
Judging these by raw consumer count (as §9c and §9k both did) systematically undersells the trio
and oversells whichever one is measured first.

**Trees that go to zero bucket-2 on H1+H5+H11+H8+H6+H3:** Chaos, Knowledge, Life, Power, Blue,
Leader, Scholar. Near-misses worth knowing: White 12/14, Order 7/8, Death 4/5. That matters because
deploys are per-batch — a cleared tree is one bench pass that retires a whole tree.

#### The fastest shrink needs no build at all — but it is ~13, not 20

20 talents have `needs ⊆ {H1, H5, H11}`. Applying the pass-D lesson (**`needs` records the GATE,
not the PAYLOAD**), expect ~13 to survive contact:

- **Clean:** Kneel, Absolute Authority, Double Dip, Hollow Command, Extract Thought, Counterspell,
  Ghostly Walls, Read Intent, Redirect Momentum, Grasping Vines, Territorial Instinct,
  Drive the Prey, Incite.
- **Will fall out — wrong SHAPE, not a missing payload:** **Concussive Yield** (a rider on someone
  else's detonation) and **Crown of Thorns** (a scene-armed rider on every other vs-Cognitive test
  you resolve). Neither is an on-use test, so H1 does not fit them at all — they are H8-class.
- **Known payload gaps:** Sharp Eye, Field Medicine (+ Resuscitation, coupled).
- **Blocked on a ruling, not a build:** Steadfast Challenge (→ Calm Appeal) and Valiant
  Intervention (→ Resolute Stand) need a MANUAL declaration for the rider talent first (§9m).

#### Recommended order from here

1. **Convert the ~13 ready ones.** Zero engine risk, and it is the first exercise of the two H1
   modes still unproven — **`vs: skill`** (Drive the Prey, Territorial Instinct) and the
   **`edha-test-fail`** event (Absolute Authority's consolation Weakened). Front-loads Blue and Green.
2. **Build H3**, not H8, despite H8's bigger headline. Near-identical solo marginal (+17 vs +19)
   but far lower risk: six trees already hand-roll byte-identical capped-list-with-fizzle code, so
   it is a consolidation rather than a design. Clears **Chaos** and **Knowledge** outright.
3. **Build H6** — largely *exposing a schema over functions that are already generic*
   (`edhaPostCalcTestCard` & co. take the talent name as a mere label), so it is cheap per consumer.
4. **Build H8 last of the three.** The riskiest: cross-actor owner sweeps, range/disposition
   filters, per-round-per-target counters, and the memoized index for the applyDamage-cadence
   consumers (§9c). It benefits most from landing after two handlers have been benched.
5. Then H2 / H7 / H10 / H9 for the tail.

⚠ **Treat 92 as a ceiling, not a forecast.** These counts come from a `needs` column that has been
optimistic every time it met real code — three corrections in pass D alone.

### 9m. Questions for Ben — batched, none decided unilaterally

1. **H9 (`edha-die-step`) — build it, or leave Sovereignty ENGINE-OWNED?** It is the only proposal
   serving exactly one tree (5 bucket-2 consumers + 2 bucket-3 + 1 bucket-1b, all Sovereignty). A
   handler for one tree is against the spirit of iron rule 2a; but the alternative is declaring 8 of
   9 Sovereignty talents ENGINE-OWNED, which is a lot of exit for a tree whose mechanic (±1 damage
   die step) is not actually complex. **Recommended default: build H9.** The ledger is simple, and
   "one tree" today is a design accident — die-step manipulation is an obvious future shape.
2. **`execute-macro` Inline as a bucket-3 escape hatch — use it or forbid it?** A rule can carry
   macro code on the document, which satisfies "editable in Foundry" for all 17 bucket-3 talents.
   But it puts untested, unlinted JS in a text field that no gate can see. **Recommended default:
   forbid it for shipped talents**, and keep the marker-rule + cue-rule exit (§9b). Worth naming
   explicitly so it doesn't get quietly adopted later.
3. **Order confirmation.** The revised order above starts with the heroic atlas, reversing §9f. It
   is the cheaper path and closes 25% of the ratchet on two handlers — but it means the deity trees
   Ben is likelier to be playing wait longer. **Recommended default: take the revised order**;
   say so if table priorities should override it.
