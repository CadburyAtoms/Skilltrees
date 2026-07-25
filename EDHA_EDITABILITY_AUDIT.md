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
| **F** | 07-24p | **×11 gated tests, no new handler** — Counterspell, Read Intent, Redirect Momentum, Ghostly Walls (Blue), Grasping Vines, Territorial Instinct, Drive the Prey (Green), Incite (Red), Double Dip (Black), Steadfast Challenge (Envoy), Valiant Intervention (Leader) — **+3 upgrade riders** retired as authored data: Absolute Stillness, Calm Appeal, Resolute Stand | **191 → 177** | checklist 2bF-1…17, unverified. New: `edha-note`, `whenOwnsTalent`. First authored `vs: skill`. |
| **G** | 07-24p | **H3 `edha-owner-list` built** + **×3** — Entropy Strike, Isolating Pressure, Isolating Ruin (Chaos) | **177 → 174** | checklist 2bG-1…8, unverified. First conditional payload via the release short-circuit. |
| **H** | 07-24q | **H8 `edha-watch` built** + **×3** — Crown of Thorns, Absolute Authority (Power), Extract Thought (Black) | **174 → 171** | checklist 2bH-1…11, unverified. First consumer of `edha-test-fail`. Phase 1 (the seven "already satisfiable") converted **zero** — see below. |
| **I** | 07-24r | **H8's `watch` enum widened** (`defeat`, `focus-change`) + **H10 `edha-focus` built** + **×7** — Coercive Pressure, Whispered Doubt, Predatory Insight, Hollow Command, Siphoned Will (Black), Necrotic Cascade (Death), Reactive Analysis (Blue) | **171 → 164** | checklist 2bI-1…12, unverified. First consumers of `scope: scene`. `cogDisadv`, `advTest`'s writer, `focusRound` and `cascadeArmed` all deleted. |
| **K** | 07-24s | **H12 `edha-detonate-list` built** + **×2** — Cascading Failure, The Unmooring (Destruction). Plus **lint-refs pass 8**, the `execute-macro` budget, landed before any consumer. | **154 → 152** | checklist 2bK-1…5, unverified. Scouted the five ledgers, H3ann and H13 first — see the three blocks below; two of the three build premises turned out to be wrong. |
| **P** | 07-24y | **H19 `whenSlowTurn` + H20 `edha-draw-mana` + H15 `sustainCap`/`replaceOldest` built** — **×4** — Calculated Patience (Blue), Blue + Red Leyline Attunement, Forge Construct (Civilization). Retires the `edha.calculatedPatience()` MANUAL macro and Risen Servant's cap-at-tier. | **135 → 131** | checklist 2bP-1…12, unverified. **The unit was a SHAPE, not a tree: three talents whose behaviour had nowhere to live.** New: `edhaIsSlowTurn`, `edhaRulesForEvent`, `edhaSummonIsFrom`/`edhaOwnedSummons`, `summonTalent`/`summonedAt` flags. |
| **O** | 07-24x | **Ben's rulings q13 + q15 BUILT** — `edha-next-test-mod` given `rangeFt` / `maxTargets` / **`doubleIfOwns`** (Authority doubles both halves at once), **`requireQuarry`**, and **`appliesTo`** (test | damage | either) with a real damage-roll consumption path in the rollDamage wrapper + a pre-cost veto — **×1** — Pack Hunting | **136 → 135** | checklist 2bO-1…7, unverified. **The first pass to fix a card-vs-engine drift by BUILDING the card's promise instead of deleting it.** Decisive Command now enforces its printed 20 ft and Authority genuinely doubles range and ally count. |
| **N** | 07-24w | **Ben's rulings q12 + q14 built** — `edha-next-test-mod`'s `skill` widened to a COMMA-LIST (it was a scalar compare, so an authored list matched nothing) + **`ownedFrom`/`@owned`** (a die sized by how many SIBLING talents you own cannot be a literal on one document); `edha-apply-status` given **`expire: "combat"`** + a generic creature-keyed end-of-combat sweep — **×6** — the whole Leader command-die atom: Decisive Command, Confident / Demonstrative / Shrewd Command, Relentless March, **Authority** | **142 → 136** | checklist 2bN-1…6, unverified. Authority converted only because deleting the hook removed its ONLY (cosmetic) presence — an empty document with no engine code is a rule-2b bug, not an exit. q13 + q15 still open, restated precisely. |
| **M** | 07-24v | **A REAL H3 BUG FIXED** (mark before committing the ledger) + **`edha-single-target`** built (config-only, retires `EDHA_SINGLE_TARGET`) + `edha-apply-status` given **`mark`** / `whenOwnsTalent` / a native-status label fallback — **×8** — the whole **Envoy Rousing-Presence cluster** (Rousing Presence, Lessons in Patience, Instill Confidence, Devoted Presence, Stalwart Presence, Rallying Shout) + Withering Ray, Verdant Mend | **150 → 142** | checklist 2bM-1…12, unverified. **Also the pass that made the classification honest: 22 talents reclassified from five scouting reports, and BUCKET 1 IS NOW EMPTY — 0 of its 6 were convertible.** Eight new demand tags. |
| **L** | 07-24u | **THE `covenants` LEDGER MIGRATED** — repointed to `lists.covenants` (one accessor, all 12 readers followed) + H3 given **`allowDuplicates`** (Ben's 07-24t ruling), **`multiOwner`**, **`sceneScoped`**, a **pre-cost veto** and a **generic release button**; `edha-combat-timing` given a **`round-start` moment**; `edha-triggered-effect` given **`target: list-members`** — **×2** — Covenant, Bear Witness (Order) | **152 → 150** | checklist 2bL-1…14, unverified. First ledger of the five. **lint pass 7 had to learn that a status `label:` is not dispatch** — a 4th gate taught, and the first one whose false positive was *reassuring*. Shoulder the Oath + Concord fell out on the `damage-applied` payload gap; Final Decree stays bucket-3. |
| **J** | 07-24s | **H6 `edha-prompt-pick` built** (+ the `turn-start` watch kind, `edha-push` widened and given an executor, `edha-cae-grant` `target: victim`, **`edhaDispatchOnHit` made to announce**) + **×10** — Subtle Suggestion, Pattern Recognition, Probability Cascade, False Premise, Anticipate, Intercept (Blue), Unnerving Approach, Puppeteer (Black), Overwhelming Authority (White), Feinting Strike (Warrior) | **164 → 154** | checklist 2bJ-1…14, unverified. **Blue, Black and Warrior bucket-2 all go to ZERO.** The whole Calculation card family, both Blue useItem switches, `edhaUnnervingApproachUse` and `edhaPuppeteerTurnCue` deleted. Two adversary abilities re-wired (lint pass 5 broke, as predicted); `audit.py` given an explicit UTF-8 codec. |

| **U** | 07-25 | **deity/Chaos ×5 + deity/Power ×7 — both trees CLEAR** (the second two-path session; passes Q–T are logged in the handoff deltas only). Chaos: H1 **`targetList` owner-sweep + `vs: none`**, H3 **`near-victim`/`enemies-range`**, H6 **`source: effects`** (the dispel, payload intrinsic), `unlessTargetStatus`, config-only **`edha-sense-reveal`** (the `EDHA_SENSE_REVEALS` name table retired; Void Sense's card-spec range gate now enforced). Power: **H13 built** (comma-list + range on `edha-test-rider`; the move veto reads `markedBy.compelled`), the armed `edha-damage-bonus` riders (**`meleeOnly`, `tallyKills`/@tally, onKill/onSurvive**), **H8 `token-move`** (built WITH Unstoppable) + **`once: arm-per-target`**, `maxTargets` multi-target + `edha-adv-attack` `to: targets`, `edha-self-status` `refuseWhileActive`/`oncePerScene`/`immuneStatuses`, `edha-defense-buff` `window: scene`, config-only **`edha-redirect`/`edha-test-aura`**. **Mantle of the Aspirant re-litigated bucket-3 → FULL conversion.** `EDHA_CHAOS_TALENTS` down to Shatter Focus (RED's talent); `EDHA_POWER_TAKEOVER`, the useItem arms and both dealer passes deleted. | **75 → 63** | checklist 2bU-1…16, unverified. The "check the shipped handler's fields first" brief held: zero new payload handlers for Chaos, three config-only ones for Power. |
| **W** | 07-25 | **deity/Death ×8 + deity/Life ×5 — both trees CLEAR** (the fourth two-path session) + **the `remains` LEDGER repointed onto H3** — the legacy-FLAT sixth (`flags.edha-content.remains` → `lists.remains`); the two traps the first two ledgers didn't have both closed: the deleteCombat key list hand-edited (§9o trap 3), and **"[] ≠ unset" preserved as a FIELD** — the scene-start freebie is `sceneFreebie` on Reaper's Harvest's own place rule, read by the generic `edhaOwnerListAvail` (raw-flag unset = one spendable freebie; any write consumes it), retiring the accessor's `edhaOwnsTalent("Reaper's Harvest")` hard-code. H3 **`op: spend`** (pop-oldest, freebie-aware, `confirm`, `requireNonEmpty` pre-cost). Death: `EDHA_DEATH_TAKEOVER` + the useItem switch + every flow function DELETED; new **`edha-ward`** (Death Ward — H1 grew `skipIfAlly`, activation → skill_test Black, the Censure convention; edhaDeathWardCheck deliberately survives, flag-driven), **`edha-turn-dot`** (Consuming Decay — tick/cleanup/reset were already flag-driven), **`edha-revive`** (Raise Dead ENGINE-OWNED, rule-keyed — the edha-decree exit; generic sceneOnce replaces raiseDeadUsed); Withering Touch = the **H16 re-litigation as FIELDS** (`edha-damage-bonus` armed-self-status + `healCutFraction` + the `withernext` status; edhaWitherStrike deleted); Reaper's Harvest = the defeat watch (**`chain: true`** keeps nested-cascade harvests) + `edha-focus` **`resource: inv`** + H3 place + the free `edha-sense-reveal` (the pass-U prediction, exact); Bone Garden = `edha-zone` **`costList`** (refund-on-cancel) + `edha-zone-hazard` **`moment: turn-end`** (the sweep generalized; the zone creator prefers the PLACING item's rule). Life: the useItem switch + the Surgical hook + the Lifeline trio + both appliers DELETED; new **`edha-mutation`** (chooser; riders as fields) + **`edha-regen-grant`** (**Apex Form's FIVE mechanics on ONE rule** — the LESSONS §2 count done first; `sourceName` makes every reader card rename-safe; Primal = `endOnVitalSpirit`/`mutationFormula`); `edha-cleanse` **`trigger: success-damage-roll`**; **Lifeline re-litigated onto 2bV's intercept machinery** (`watchFlag`/`linkOnUse`/`chooseAmount`/`takeType`/`healFormula` — four fields, NOT pass S's measured H25 build: the choose-amount click already existed, exactly as the brief suspected). | **48 → 35** | checklist 2bW-1…17, unverified. NO takeover remains in Death or Life. The third ledger of six; `charges` + Fate's two remain. |
| **V** | 07-25 | **deity/Order ×7 + deity/Civilization ×8 — both trees CLEAR** (the third two-path session) + **the `edicts` LEDGER repointed onto H3** (uuid-keyed entries, proh/sealed ride along). Order: H3 **`op: annotate`** (H3ann built with its first consumer) + the **`prohibition` place mode** (picker-cancel REFUNDS — the Trade-Routes convention replaces every takeover), H1 `requireTargetOnList`, `list-member-hits`/`oncePerRoundPerDealer` damage-bonus, **`edha-redirect` `direction: intercept`** (Shoulder the Oath re-litigated OUT of its 07-24u ENGINE_OWNED exit), config `edha-bound-adv`/`edha-prohibition-resolve`/`edha-decree` (Final Decree ENGINE-OWNED, rule-keyed). ⚠️ **Latent 07-24u bug pinned: `edhaOwnerLedgers` reconciled vs the KEY not the MARKER — the covenant AE sweep/break watch read EMPTY for every resolvable entry** (status arg + tests/, mutation-checked). Civ: `edha-zone` **kinds foundation/fortify/link**, **H21 `edha-summon-effect` built** (toggle-baked/grant/transform — Magnum ENGINE-OWNED rule-keyed), Tempered Edge = the **`summon-hits`** damage-bonus mode (H23 landed as two fields, not a handler), H25 **`rally-zone`**/`requireVictimInMyZone` (Bonds). `EDHA_ORDER_TAKEOVER` + `EDHA_CIV_TAKEOVER` + the Lay Foundation takeover + the name-keyed Bonds watcher + the Tempered Edge rider DELETED. | **63 → 48** | checklist 2bV-1…18, unverified (2bV-17 is the first-ever bench of the covenant-sweep fix). NO takeover remains in Order or Civ — system costs + pre-cost vetoes + refund-on-cancel everywhere. |

**Pass P — the ATOM was a SHAPE, and it is the fifth kind this doc has had to name.** §9n already
had the LEDGER (pass H), the MECHANIC (Kneel), the WATCHER (pass I) and the CALL SITE (Crown). This
pass's three builds look unrelated on the greedy list — a turn-speed field, a Draw Mana event, two
summon fields — and they are one thing: **a talent whose behaviour had nowhere to live.** All five
Attunement Keys and Calculated Patience are `activation.type: none`, so they cannot fire `use` and
could not hold a rule *at all*; Forge Construct's spec was already authored and a hidden gate held it
anyway. Grouping them made each build's justification the same sentence, which is worth more than the
count: **schedule by what is BLOCKING a talent, not by which handler its `needs` column names.**

**Pass P — the first forecast in this doc that was right, and the reason is reproducible.** H20's
prediction ("Blue and Red are drop-ins on `edha-next-test-mod`") held field-for-field, including
`attr` — the produced flag object is byte-equivalent to what the table wrote. It was right because it
was made by naming all three legs of the 07-24v test (executor real at a known line, schema fields
enumerated, event absent) rather than by asking whether a handler was registered. **That test is now
2-for-2: it also correctly predicted that Forge Construct's blocker was NOT its summon spec.** Use
it; it costs one grep per leg.

**Pass P — H15 was "two fields" in three separate documents and it was never two fields.** Two
things were invisible in every estimate and both only appear at the call sites:
- **A handler executor runs on `use`, i.e. AFTER the system has charged the cost.** Both gates being
  replaced refuse *pre*-cost ("nothing spent"). So a cap expressed purely as executor logic would
  have silently started charging for refused uses. It needed a generic `preUseItem` veto — the same
  shape H1 / H3 / H12 / `edha-next-test-mod` all already carry. **Generalises: any field that can
  REFUSE a use cannot live in the executor of the handler it belongs to.**
- **`replaceOldest` had no ordering data.** Nothing stamped a creation time on a summon, and the
  existing lookup used `.find()` — correct only because the cap happened to be 1. "Replace the
  oldest" was unimplementable as specified, and nothing in the classification said so. **Before
  costing a superlative (oldest / nearest / weakest), check that the data it sorts by exists.**

**Pass P — the fail-open twin, and why a mirror is not a negation.** `whenSlowTurn` reads like the
inverse of the shipped `whenFastTurn`, and writing it as `!edhaIsFastTurn(actor)` would have shipped
a silent buff: that helper collapses **three** states into one `false` — no combat, no combatant, and
a genuine slow turn — which is safe only because it fails CLOSED. Negated, it fails OPEN, granting
advantage on the first test of every out-of-combat scene, where nobody would connect it to a Blue
talent. The fix is a real predicate requiring a live combatant. **The general shape: a boolean helper
that folds "unknown" into one of its two answers cannot be inverted.** Worth grepping for — any
`!edhaIsX(...)` where `edhaIsX` has an early `return false` for missing state is the same bug.

**Pass P — scouting was decisive for the FOURTH consecutive pass, and it corrected the brief itself.**
Five read-only scouts before a line was written. They confirmed the H19 hazard from the system source
(`turnSpeed`'s getter is `?? TurnSpeed.Slow`, schema initial `"slow"`), proved Tagging Shot's branch
is unreachable dead code, and found two classification errors: **Tempered Edge was never an H16
consumer** — it is a passive with nothing to arm, so H16 is 2 talents not 3, and it is re-filed as
H23 — and **Resuscitation does not need H17 for its own text** (it has no recovery die; its H17
dependency is purely the coupling to Field Medicine). They also caught the one thing that would have
made this pass destructive: **Beacon of Stability is a total orphan of a single line inside the White
Draw Mana branch**, with 45 lines of working code and no other caller. Restructuring `edhaDrawMana`
instead of adding to it would have deleted a talent nobody was touching.

**Pass M — THE `needs` COLUMN'S FAILURE MODE IS NOW NAMED, and it is a one-line test.** Eight passes
have recorded "the estimate was optimistic again" without saying *why*. Five scouts read the call
sites behind 22 talents and the mechanism is singular: **a `why` string checks whether a handler type
is REGISTERED. It never checks (a) whether that handler has a real executor, (b) whether its schema
carries the gate the talent needs, or (c) whether the TRIGGER exists at all.** Three of the five
bucket-1 talents failed on exactly those three, one each:
- **Withering Touch** — `edha-heal-cut` is registered and its executor is `async function () {}`, a
  no-op. A config-only handler **cannot be a payload**, only an owner-wide passive read elsewhere.
- **Calculated Patience** — `edha-combat-timing` is registered and has **no slow-turn moment**; its
  enum is `combat-start` / `round-start`. The right handler (`edha-test-rider`) was never named.
- **Blood Price** — its payload is genuinely ready; **no registered event means "you paid ritual HP"**.

**The test to apply before writing `needs: []` ever again: name the executor, name the schema field,
and name the event. If you cannot name all three, it is not bucket 1.**

**Pass M — bucket 1 was FICTION, and that is the headline.** All five remaining bucket-1 talents
were reclassified; the bucket is now **0**. Two of the five were not even mis-sized — they were
pointed at the wrong line: **Forge Construct**'s summon spec has been authored data for months (the
ratchet hit is a 10-line sustain-ONE replace gate), and **Overgrowth**'s recorded "DELETE-ONLY, the
name check is redundant" was **flatly wrong in a way that ships a bug** — Life Surge carries the
identical `edha-overflow-thp` rule and grants no Deflect, so the talent NAME is the only
discriminator in that branch. Deleting it starts stacking +1/+2/+3 Deflect on every Life Surge heal,
silently, across two trees. *A classification that names a mechanic already on the document has not
looked at the line holding the talent on the ratchet.*

**Pass M — a real BUG in shipped H3 code, found by scouting rather than by testing.** `place`
committed the ledger and only *then* marked the creature, so when no GM was online to mark a target
the player does not own, the ledger kept an entry whose creature had no status — and
`edhaOwnerList`'s reconcile-on-read then hid that entry for ever. Silent in three directions at once:
the placement looked like a no-op, the cap never counted it, and junk accumulated in the flag. It
affected **every** H3 consumer, including the `covenants` ledger migrated one pass earlier, where the
symptom is a Covenant that forms with no icon and no AE — indistinguishable from "the talent is
broken". **Worth generalising: when a handler does a multi-step write, the step that can REFUSE must
run before the step that COMMITS.**

**Pass M — "converting a talent" and "converting a mechanic" are different claims, and four of six
were the former.** The Envoy cluster reads like six mechanics. Reading the code: only **two** ever
executed (Rousing Presence's status, Lessons in Patience's focus). Instill Confidence computed a
variable used for nothing but a string; Devoted Presence, Stalwart Presence and Rallying Shout were
strings too. Converting them is honest and worth doing — the text becomes editable in Foundry instead
of being a template literal — but it moves a **reminder**, not a mechanic, and the ratchet cannot
tell the difference. **State which of the two a conversion is, in the commit and in the header**, or
the ratchet count quietly starts overstating how automated the game is.

**Pass M — `edha-apply-status` was writing an ownership mark onto ALLIES.** It set
`markedBy.<status>` unconditionally, and that flag is read by the damage post-pass to add a marker
owner's bonus damage. On a buff (Determined) it is semantically an enemy-debuff flag, sitting on a
shared hot read path, harmless only while a formula field happens to be blank. Now a `mark` field.
**The general shape: a handler written for debuffs will happily apply to a buff and take its
bookkeeping with it.**

**Pass L — the ledger REPOINT worked exactly as scouted, and that is the first premise in this doc
that survived contact unchanged.** `edhaGetCovenants` → `edhaOwnerList(owner, "covenants", "covenant")`,
two `setFlag` writes → `edhaSetOwnerList`, and all 12 readers followed for free. The 07-24s finding was
right in full: **do not build `listPath`**. One accessor is not merely cheaper than a schema field, it is
*safer*, because with one array the "ledger in two places at once" hazard cannot occur rather than being
managed. Both raw sites were where the scouting said, and `unsetFlag` splits dotted keys itself
(`document.mjs:963-966`), so `"lists.covenants"` deletes the ledger and leaves `lists` behind.

**Pass L — the trap the scouting MISSED, and it is a Foundry detail worth keeping.** The raw
`updateActor` hook is what makes a *player's* covenant write reach the GM's AE sweep, and repointing it
to `getProperty(changes, "flags.edha-content.lists.covenants")` **breaks it silently.** `setFlag` submits
`{flags: {"edha-content": {"lists.covenants": …}}}` — a dotted key **nested one level down** — and
`DataModel#updateSource` only expands dot-notation when it finds a dot among the change object's
**TOP-LEVEL** keys (`common/abstract/data.mjs:447`). The top-level key is `flags`, so the expansion never
runs and the dotted key survives into the hook. The old flat `"covenants"` key had no dot at all, which
is exactly why the pre-repoint single lookup worked and why nothing warned. The hook now accepts BOTH
shapes. **Generalises: any hook that inspects `changes` for a flag written through `setFlag` with a
dotted key must check the dotted form too** — and every H3 ledger is written that way.

**Pass L — a gate can lie in the REASSURING direction, which is worse than breaking.** Three passes have
now recorded "gates break as talents leave the engine". This one did not break; it *passed while being
wrong*. `lint-refs` pass 7 counted the status table's `label: "Covenant"` as name-keyed dispatch, so a
fully converted talent stayed on the ratchet and the count read 152 when the truth was 151. A breakage
gets fixed in ten minutes; a false positive that inflates the backlog is invisible and would have been
inherited by every later pass as "Covenant still needs converting". Rule 2b's actual test is **"would a
rename silently unwire this?"** — and for a display label the answer is no, because the rule references
the status *id*, which is authored data. Fixed narrowly (a `label:` value is excluded), and **measured
before landing: exactly ONE name in the engine occurs solely as a label.** That measurement is the part
worth copying — the temptation was to reason about it instead.

**Pass L — the generic path had THREE silent narrowings in it, and Ben's 07-24t ruling is what caught
them.** Bear Witness's payload looked like a plain `kind: "thp"`. It is not, and shipping it as one
would have been a balance change dressed as a refactor:
- `edhaWriteTempHp` **REPLACES**; `edhaGrantTempHpCross` **KEEPS THE HIGHER**. Temp HP does not stack,
  so the shipped thp path would have *reduced* a partner already holding more from another source.
- only the cross variant **relays through the GM** when the client does not own the creature — and
  every member of a covenants ledger is somebody else's creature.
- a White rank of 0 was **silent**; the generic path would have posted "gains 0 Temp HP" every round.

None of the three is visible in the `needs` column, the classification, or the card text. They are only
visible by reading the retired code line by line and asking what each call was *for*. **The check that
finds them: for every helper the old code called, ask why it called THAT one and not the obvious one.**

**Pass L — a second moment on an existing dispatcher is a DOUBLE-FIRE waiting to happen.** Adding
`round-start` to `edha-combat-timing` is two lines of dispatch, and the dispatcher's own comment had
already said to "discriminate with a field on the CONSUMING handler". Round 1 *begins* at combat start,
so without the filter Foresight, Sidestep and Practiced Kata would each have fired **twice** on the
first round of every combat — a bug no gate could catch and only a bench pass would find. The filter
defaults to `combat-start`, which is what makes the widening provably inert for all three shipped
consumers. **When you add a value to an existing trigger's vocabulary, ask what the EXISTING consumers
match against, not just whether the new one works.**

**Pass L — the honest count is 2, and the atom is still the right unit.** Of the ledger's five talents
only Covenant and Bear Witness moved. Shoulder the Oath (an in-flight damage **redirect** between
actors) and Concord (a **pre**-damage mutation of the live list array) are both the `damage-applied`
payload gap §9o has ruled out of scope three times, and Final Decree is genuine bucket 3. **That is not
a shortfall against the atom — it is the atom being satisfied.** Ben's one-ledger-per-session ruling
exists because a half-converted ledger silently empties a live list; after this pass all five remaining
readers agree on one array, so the tree is coherent whether or not the other three ever convert. **The
deliverable of a ledger pass is the REPOINT, not the talent count** — which is the opposite of how every
`--priority` reading in §9o would score it.

**Pass K — "already generic" was wrong AGAIN, and the pattern is now specific enough to check for.**
§9o costed H12 as "a schema over `edhaResolveCharges`, which is already generic" — the same sentence
shape it used for H6, and wrong the same way. The function's **signature** is generic; its **body**
hard-codes two OTHER talents' payloads by name (`i.name === "Pinpoint Charge"` at `:8511`,
`edhaOwnsTalent(owner, "Concussive Yield")` at `:8557`). So H12 **wraps** those branches rather than
retiring them, and the ratchet moved −2, not −4. **The check that catches this in one grep: a helper
is only "already generic" if its BODY mentions no talent name.** Twice in two passes it was the body,
never the signature.

**Pass K — the first step of a conversion can be deleting a name from a Set.** Both H12 consumers
were members of `EDHA_DESTRUCTION_TALENTS`, whose `preUseItem` takeover ends in a bare
`return false`. Leave the name in and the talent's `use` event **never fires**, so every rule on its
document is silently inert while the Events tab looks perfectly correct — the exact failure mode
rule 2b exists to remove, reintroduced one layer up. **Before converting any talent, grep for its
name in a takeover/cancel Set, not just in dispatch branches.** Burst talents and the whole
Destruction tree use this pattern.

**Pass K — three build premises scouted before building; two were wrong.** H3ann's consumer list was
wrong in three ways (Weave the Thread's annotation has one write and zero readers — dead code),
H12's "already generic" was wrong as above, and the *ledger escape* is the wrong shape entirely: for
Order's two ledgers the answer is to **repoint one accessor to a dotted flag key**, not to teach H3
an arbitrary path. Only H13's scope survived, and it came back **larger** than recorded (a third
widening nobody had listed). Full findings in the three blocks in §9o. **Scouting cost a fraction of
a pass and changed what got built in all three cases** — cheaper than the six consecutive
over-estimates that came from reading the `needs` column.

**Pass J — the reuse claim was HALF right, and the false half was the design.** §9o costed H6 three
separate times as "largely exposing a schema over functions that are already generic —
`edhaPostCalcTestCard` & co. take the talent name as a mere LABEL". Reading the call sites:
- **True for the OFFER shape.** `edhaPostCoordReactionCard(owner, name, {costs, prompt, result})`
  branches on no name at all — its click gates once-per-round, spends the listed resources and posts
  the result string. Ten talents already share it.
- **False for the PICK shape.** `edhaPostCalcTestCard`, `edhaPostBeaconCard`, `edhaPostReknitCard`,
  `edhaPostLifeCleanseCard`, `edhaPostMutationCard` and Unnerving Approach's card each **hard-code a
  different payload in their click handler** — bank a next-test flag, spend 1 Inv and clear a status,
  delete an injury Item, write a mutation flag, push a token. They are generic only WITHIN their own
  payload, so there was no single function to put a schema over.

So H6 was built as pass H's move instead: ONE card+click pair whose click **dispatches back** through
`edhaDispatchTestResult`, making the payload the item's own `edha-test-success` rules. **The estimate
was wrong for the seventh consecutive pass, and this time not about the count — about the SHAPE of the
thing being reused.** `needs` records the gate; §9o's verdict prose records a guess at the reuse. Read
the call sites for both.

**Pass J — the "already satisfiable" column now hides a THIRD failure mode: the dispatcher.**
Feinting Strike's `needs` were `[H5, H10]`, both built two passes earlier, and it still could not
move. Neither half was missing: `edhaDispatchOnHit` **hand-listed the three handler types it knew**
and dropped every other rule on `edha-on-hit`, so an `edha-focus` rule there was silently inert. That
is the pass-D lesson one level down — `edhaDispatchTestResult` deliberately knows no payload type,
and hand-listing them in the on-hit dispatcher reproduced the name-keyed mistake in the *dispatcher*
rather than the talent. Six lines made it announce, and the talent converted for free, clearing
Warrior. **If a talent's `needs` are all BUILT and it still cannot move, suspect the dispatcher
before the primitives.** Also worth stating: the change was provably inert because all 33 shipped
`edha-on-hit` rules use one of the three old cases — check that before touching a hot path, it is
cheaper than a bench pass.

**Pass J — a RULING can retire a talent's blocker, with nothing built.** False Premise sat in H6's
demand column for four passes because its engine branch had two paths: an auto-contest when the
target's Cognitive defense could be read, and a manual pick card when it could not. Ben's 07-24r
fail-open ruling (§9m q9) deleted the second path, so it converted as clean H1 with no H6 anywhere.
**When a ruling lands, re-read the `needs` of everything it touches** — the classification does not
know a decision was made.

**Pass J — the pick's payload must never re-ask, and that is a defect the schema invites.** Puppeteer's
prompt IS a success rule (its watch fires the offer), and the click dispatches the same event again.
Without a guard the prompt re-runs and posts a fresh card for ever. `edhaDispatchTestResult` now
filters `edha-prompt-pick` rules under `ctx.viaPick` — **filtered, not skipped inside the loop**, so
`rules.length` stays honest, which is what tells H6 "no payload ran, post the table-run note", i.e.
exactly Puppeteer's shape. A handler that re-enters the dispatcher needs its own rule type excluded
from what it re-enters.

**Pass J — lint pass 5 broke exactly where the handoff said it would, and the fix was an upgrade.**
Two adversary abilities are name-verbatim copies of converted talents (Callthief / Overwhelming
Authority, Dirgehound Pack / Unnerving Approach) and were satisfying the gate through
`inEngine(name)` — riding the PC talent's engine branch. Both are now wired on their own documents,
which is the adversary standard anyway, and it fixed a latent wrongness nobody had noticed: the
Dirgehound's card prints a **flat 5 ft** push while the branch it borrowed scaled `[Size]` off the
owner's **Black rank**, which no adversary has. That is now **two** gates broken by the migration
(pass F's `audit.py`, this pass's lint 5). Expect more, and treat the breakage as a finding.

**Pass J — a gate that reads data through the machine's locale is a gate that passes CI and fails
Ben.** `audit.py` used bare `json.load(open(path))`. The first authored emoji containing byte `0x8f`
(a variation selector — Anticipate's 🛡️) crashed it on Ben's Windows box, while CI, whose default is
UTF-8, would have stayed green. Five call sites now name `encoding="utf-8"`. **Any gate that reads
repo data must specify its codec**; the repo is UTF-8 and the developer's box is not.

**Pass I — the atom was the WATCHER, and that is a third kind of atom.** §9n already had two: the
LEDGER (pass H) and the MECHANIC (Kneel). Black's three focus passives are a third — Whispered Doubt,
Coercive Pressure and Predatory Insight were three loops **inside one function**, sharing its
preconditions, its `focusRound` once-per-round bookkeeping and its tagged-write discipline. Converting
one would have left the other two reading a function whose checks had moved. They converted together
or not at all, and the same test applies to Sovereignty's `edhaSovRollWatch` (Expose + Edict of the
Fallen + Balance) and to the applyDamage post-pass. **Before scheduling a talent, ask what FUNCTION it
lives in and who else lives there** — the answer is a better unit than the talent.

**Pass I — widening `watch` cost about what §9o predicted, and that is the first time.** Two kinds
landed for one schema value and one `edhaDispatchWatchers` call each, exactly as forecast; the handler,
the filters, the memoized index and the payload dispatch were untouched. What the forecast still got
wrong was the *consumer* count: §9o listed 5 for `damage-applied`, 3 for `defeat`, 4 for `turn-start`.
Reading the call sites, **`defeat` delivered 1 of 3** (Reaper's Harvest is the Remains ledger,
Arsenal's subject is the Construct's victim rather than the dropped creature), and `damage-applied`
and `turn-start` were **not attempted** because every consumer of both needs a payload that does not
exist — a pre-damage veto (Death Ward), a second-hit-this-round counter (Breaking Point), in-flight
damage reduction (Devoted Conduit), a scene tally (Warlord's Fury), a heal-half-of-what-you-dealt
linkage (Consuming Decay). **The `needs` column has now been optimistic in six consecutive passes.
Stop reading it as a forecast at all; use it only to RANK.**

**Pass I — the highest-value conversions came from re-reading, not from the queue.** Three of the
seven were nowhere near the top of `--priority`:
- **Reactive Analysis** is filed as an H8 watcher ("a character in range fails a test → advantage on
  my next vs them"). It is not. The trigger is the REACTION's trigger — volition, which no hook owns —
  and the mechanic is an on-use grant the engine already had. It needed **no handler at all**. Look for
  more of these: *a passive-sounding card on an item whose activation is a Reaction is usually on-use.*
- **Hollow Command + Siphoned Will** were deferred in pass F as an H10 coupling, and the tree header
  said so. Building H10 — five lines of executor over two helpers that were already generic — freed
  both. **A deferral note that names its blocker is a work item; grep the headers for them.**
- **Predatory Insight** is not in any handler's demand column for its *passive* half, because that
  half was a bare helper called from three places.

**Pass I — `chain`, and the one lesson that generalises about deleting a guard.** Pass H's re-entrancy
guard was a boolean: a watcher's payload is never observed. `focus-change` broke it immediately —
Whispered Doubt's extra focus loss taking a creature to 0 is a REAL second event that Predatory Insight
must see, and the hand-rolled code knew that (it re-ran the zero check by hand after its own write, a
07-05 test-pass fix). The guard became a DEPTH counter plus an opt-in `chain` field, default off, so
pass H's behaviour is unchanged and exactly one rule in the project opts in. **A blanket guard is a
policy; the first time it is wrong, make it a field rather than an exception.**

**Pass I — a test caught the bug, which is the point of pinning them.** `whenTotal: "at-most", 0` was
implemented with `Number(ev.total)`, and `Number(null)` is `0` — so any event carrying no value at all
would have satisfied "reached 0 focus", making a scene-wide passive fire on every observation the
engine could not read. The pinned case (`total: null` must not match) failed on first run and the
engine was fixed, not the test. It also forced the deliberate asymmetry into the open: H1's defense
read fails OPEN, this fails CLOSED, because the failure modes are not symmetric.

**Pass F — the UPGRADE TALENT is a second declared exit, and it was hiding in plain sight.**
Absolute Stillness, Calm Appeal and Resolute Stand have no hook of their own: each exists only to
sharpen another talent's result, and every earlier pass expressed that as an `edhaOwnsTalent`
branch **inside the parent's engine code** — so ONE mechanic held TWO talents on the ratchet, and
neither could leave alone. Ben's ruling (07-24p): keep the reminder and gate it on the document.
The parent's success rule carries the rider with `whenOwnsTalent: "<the upgrade>"`, which is
authored data on a tab Ben can edit, not an engine branch — the same reasoning that already lets
`edha-enter-stance` take a stance NAME. The trade is explicit and written into both tree headers:
**the upgrade's own document is empty, so editing its line means editing the parent's rule.**
Expect more of these; grep a talent for "only appears inside another talent's `edhaOwnsTalent`".

**Pass F — `edha-note`, the primitive bucket 3 has been missing all along.** Every declared exit,
ENGINE-OWNED and MANUAL alike, owes its talent a rule that "at minimum posts a card" (§9b), and
until this pass **nothing could do that**: `edha-gm-cue` has a config-only executor (its watchers
read it), whispers GMs, and only fires on its own fixed trigger list. `edha-note` has a body, so it
works as a payload on any event. The 17 bucket-3 talents were waiting on a handler nobody had
noticed was absent — which is the §9n lesson in miniature: **check that the exit you plan to take
actually exists before costing the work behind it.**

**Pass F — Incite was the migration's first genuine BEHAVIOUR UPGRADE, not a like-for-like move.**
Its engine case posted "on a success vs the target's Spiritual, it must Strike…" and resolved
nothing at all — it trusted the player to have won an opposed test, which is exactly the soft
laziness iron rule 3 forbids. It had passed every gate for months because `audit.py`'s
soft-laziness check only looks for opposed *skill* tests, and Incite is vs a defense. Converting
it to H1 made the engine resolve it. **Worth looking for: a name-keyed talent whose whole body is
one ChatMessage.create beginning "on a success" is not wired, it is a note pretending to be wiring.**

**Pass F — the gate had to learn the new form, and that is a migration cost worth naming.**
`audit.py`'s soft-laziness check asks whether the talent's NAME appears beside an
`edhaQueueContest` call in the engine — which is the very name-keyed wiring rule 2b removes. The
first `vs: skill` conversion (Territorial Instinct) therefore FAILED a gate it satisfies better
than before. Fixed by teaching the gate the document-driven form (`doc_contest`). **Every gate that
detects wiring by looking at the ENGINE will hit this; check them as each handler lands.**

**Pass F — four talents that read as ready are not, and all four are coupling, not payload.**
Kneel and Absolute Authority both call `edhaCrownPing`; converting either alone drops Crown of
Thorns from auto-firing to the manual button on its own card. Hollow Command's success pays
Siphoned Will, whose only call site is inside it. Extract Thought is the wrong SHAPE — a passive
watcher on every Deception roll, not an on-use test. That is now **six** coupling corrections in
four passes (Practiced Kata, Vigilant Stance, Resuscitation, and these), and the rule is stable
enough to state plainly: **before batching a talent, grep its call sites for any OTHER talent's
name, and check the shape of the hook it actually rides — not just the gate it needs.**

**Pass H — the H3 atom is a LEDGER, not a talent, and that is why Phase 1 converted zero.** §9o
listed seven H3-shaped talents as "already satisfiable, build nothing". All seven fell out, none of
them for the payload-gap reason pass D taught. **H3 stores at `flags.edha-content.lists.<key>`; the
trees that want it keep their ledger at a LEGACY flag path that un-migrated siblings read directly** —
Order's `covenants` (13 read sites), `edicts` (11), Fate's `fateSnares` (9) / `fateOrdained` (8),
Destruction's `charges` (15). Convert one WRITER and the ledger exists in two places at once: the
rule writes one array and every sibling reads the other and sees an empty list.

Pass G's "**the mark wins**" is why Chaos survived a half-migration, and re-reading it shows it was
never a general result: Chaos keeps **no array at all** and re-derives membership from the mark, which
H3 also writes. A tree whose un-migrated readers consult an **array** has no such bridge. So the unit
of conversion for the whole marker family is the **ledger and all its readers together**, and H3's 17
remaining consumers are really ~5 tree-sized atoms. That is a planning correction, not a talent one:
a greedy per-talent order cannot schedule work whose atom is bigger than a talent.

**Pass H — two more shape corrections, and one of them is a THIRD instance of a shape the engine
already names.** Beyond the ledger problem:
- **H3 has no `annotate` op.** Sealed Edict ("seal the most recent unsealed Edict"), Inevitable Snare
  ("flag the last-placed Snare") and Weave the Thread ("link the two most recent") are all *annotate
  the most recent un-flagged entry*, which `place | release | count` cannot express. A fourth
  instance — **Pinpoint Charge** — is already in the engine, and the engine's own comments name the
  shape **twice**: Inevitable Snare's says "mirroring Pinpoint Charge", Sealed Edict's says "the
  Inevitable-Snare shape". Tracked as **H3ann**. *Reading the code for a repeated phrase is cheaper
  than reading it for a repeated mechanic — the comments had already done the classification.*
- **Cascading Failure and The Unmooring are not ledger ops at all** — bulk detonations that iterate a
  ledger's canvas positions, AoE each, count multi-catches, merge hazard terrain and delete the
  templates. §9n had *already* ruled canvas objects out of H3's scope in pass G; the `needs` column
  simply never got the memo. Cheap when built: `edhaResolveCharges` is already a generic
  config-taking function, so **H12** is a schema over an existing generic, the H6 shape.

**Pass H — H8's justification was right and its NAME was wrong, which hid half its consumers.**
"No event system fans out to N observer ACTORS" is true, and it is the smaller half. The system's
dispatcher resolves one document and iterates that actor's items; `edhaDispatchTestResult` mirrors it
and iterates **that ITEM's rules**. So a talent cannot see a **sibling talent's** event either — and
that is the *whole* of this pass's three conversions. Crown of Thorns watching Kneel's test and
Extract Thought watching a Deception roll are **same-actor** fan-outs that were filed under
"cross-actor sweep" for four passes. `scope: self` and `scope: scene` are one handler because it is
one sweep; only the actor list differs.

**Pass H — the coupling dissolved from the far end, and that is the reusable move.** Pass F deferred
Crown + Kneel + Absolute Authority as a unit because two converters called `edhaCrownPing`. The
instinct is to convert all three together. What actually worked was changing what the CALL SITES say:
a resolved test is now **announced** (`edhaDispatchWatchers`) rather than routed to a named talent, so
all four firing sites — including the two in Sovereignty and the one in still-engine-owned Kneel —
name nothing, and Crown picks the announcement up from its own document. **A coupling through a named
call can be cut at the caller, and then the callee converts alone.** Kneel stayed behind for its own
unrelated reasons and cost Crown nothing. Worth trying before batching N talents together.

**Pass H — Kneel is the "one talent, three mechanics" case, and only one was expressible.** With the
Crown coupling gone Kneel reads ready. It is not: (1) the Black-vs-Cognitive test is clean H1; (2) the
move-toward-or-nothing `preUpdateToken` veto reads a bespoke `kneelBy` stamp that **no rule can
write** (the house primitive writes `markedBy`, so the veto must be rewired first); (3) the standing
advantage rider needs `edha-test-rider`'s `whenTargetStatus` widened to a comma-list plus a range
gate. Converting (1) alone ships a talent whose other two thirds silently stopped working. **The
coupling check §9n keeps repeating has a sibling: count the talent's MECHANICS, not just its call
sites.**

**Pass H — an enforcement surface is not clutter; deleting one is a regression wearing a tidy-up.**
Crown's hand-rolled card carried a manual "ping" button for a qualifying test the engine did not
resolve. The easy conversion drops it. Instead the button became a **generic** watch trigger carrying
the observation as data attributes, so it names no talent and any future watch talent can post one.
Same for the "already armed this scene, nothing spent" guard: it is now keyed on *a talent whose own
`edha-self-status` rule is untimed*, not on a name. **When a name-keyed branch is deleted, ask what it
was ENFORCING and re-provide that generically — iron rule 3 does not pause during a migration.**

**Pass H — a status beat a flag for scene-arming, for a reason that generalises.** Crown armed itself
with a bespoke `crownActive` flag. Rules can read flags but nothing lets one WRITE an arbitrary flag,
so the arming would have stayed engine-owned. A **status** is writable by `edha-self-status` and
readable by `edha-watch`'s `requireSelfStatus`, so both halves become authored data — and it shows on
the token, so "am I armed?" stops being a memory test. **Prefer a status to a flag for any
scene-scoped arm you want a rule to own.**

**Pass G — H3 was called a consolidation of six byte-identical hand-rolls. Three of the six are
not that shape at all, and the differences are the schema.** Reading `edhaOrderEdict` and
`edhaFatePlaceMarker` side by side (as §9o instructed) shows they agree; reading all six shows:
- **The cap behaviour splits.** Order/Fate push past the cap and fizzle the OLDEST (Ben R1); Chaos
  REFUSES at the cap and says so. Averaging them would have silently changed two trees, so `evict`
  is a field.
- **Membership is stored in two different places.** Order/Fate/Death/Destruction keep an owner-flag
  array; Chaos keeps nothing and re-derives its list by scanning the canvas for its own marks —
  which is *why* Chaos cannot fizzle an oldest entry: it has no order to fizzle by.
- **Fate's Snares and Destruction's Charges own canvas objects** (a MeasuredTemplate, a Region)
  that must die with the entry. The ledger is H3's; the canvas work is not.
- **Knowledge's Insight is not a list.** It is a COUNTED SINGLE BEARER (0–5 on one creature;
  transferring clears the old one). H3 places and releases marks and cannot express a count. All 9
  Knowledge bucket-2 talents want **H3b `edha-owner-counter`** instead, and nothing else does —
  the same one-tree question §9m asks about H9.

**Pass G — the conditional payload needed no new field, and that is the reusable trick.** Isolating
Pressure is "Isolated; *if* it bears my Omen, shatter it for extra damage". H3's `op: release`
returns **false** when there was nothing to release, and `edhaDispatchTestResult` already stops
the remaining rules on a false (it mirrors the system's `fireEvent`). So rule ORDER expresses the
condition: `[status] → [release] → [damage]`. Reach for ordering before adding a gate field.

**Pass G — a half-migrated tree needs the mark to outrank the ledger.** Chaos's three unconverted
talents still call `edhaRemoveOmen`, which clears the status and knows nothing about H3's list.
`edhaOwnerList` therefore reconciles on READ, dropping any entry whose creature no longer bears
the status. Membership lives on the mark, order lives in the list, **and the mark wins.** Without
that the owner would silently sit at their cap with phantom entries — and it also fixes the case
no hand-rolled list ever handled: a GM clearing the status by hand. Checklist 2bG-6 is the probe.

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

#### ⛔ WHAT ACTUALLY HAPPENED WHEN THIS TABLE WAS EXECUTED (07-24p) — read before trusting it again

The table above was followed exactly. Both of its headline numbers were wrong in the same
direction, and the reason is the same one §9k already identified and then failed to apply to
itself: **a per-step "+N newly convertible" is an upper bound built from a `needs` column, and
`needs` is a plan.**

| step | predicted | delivered | why the gap |
|---|--:|--:|---|
| convert the ready ones, build nothing | ~13 (of 20) | **11 + 3 riders = 14 names** | 4 deferred for COUPLING (Kneel/Absolute Authority → Crown of Thorns, Hollow Command → Siphoned Will) or wrong SHAPE (Extract Thought); the 3 upgrade riders were not counted at all because they are not bucket-2 talents. |
| build H3 | +29, "clears Chaos and Knowledge outright" | **+3** | Knowledge is not H3 at all (Insight is a counter, not a list — see §9n); Chaos's other three are H8 range sweeps and a proximity pick. The +29 was real only in the CUMULATIVE column, i.e. after H8 and H6 as well. |

Two corrections to how the table should be read, both now applied to
`scripts/check-2b-classification.js`'s output rather than left in prose:

1. **The per-step column answers "how many talents have no UNBUILT handler left", not "how many can
   be converted next".** Those differ whenever a talent's remaining blocker is a payload, a
   coupling, or a shape mismatch — which is most of them.
2. **"Clears tree X" in the `--priority` per-tree block is stated at FULL build**, not at the step
   it appears under. The 07-24n reading of it as a per-step claim is what produced "Chaos and
   Knowledge go to zero on H3".

#### ⛔ AND WHAT HAPPENED WHEN THE *NEXT* STEP WAS EXECUTED (07-24q) — the third correction in a row

The pattern is now stable enough to state as a rule rather than an anecdote. **Every headline number
this table has produced has been an over-estimate, and every time the cause has been the same: the
per-step column counts talents whose `needs` set is satisfied, and `needs` records the GATE — never
the payload, the coupling, the SHAPE, or (new this pass) whether the talent's data even lives
somewhere a rule can reach.**

| step | predicted | delivered | why the gap |
|---|--:|--:|---|
| the 11 "already satisfiable", build nothing | 7 new candidates | **0** | 4 were known-bad going in. Of the 7: 2 are shared-ledger atomicity, 3 need an H3 op that does not exist, 2 are not ledger ops at all. See §9n pass H. |
| build H8 | +29, cumulative 40 | **+3** | H8's demand is real, but its 51 consumers are mostly *scene*-scope sweeps (Dread Presence, the AE families) that each need their own tree's other blockers cleared too. The three converted are the whole *self*-scope set that was otherwise ready. |

**The change this should drive is to the QUESTION, not the estimate.** "How many talents does this
handler unblock" has been wrong three times because it is the wrong unit. For the marker trees the
unit is a **ledger**; for Kneel it is a **mechanic**; for Crown it was a **call site**. Use
`--priority` to rank BUILDS, never to forecast a pass's output.

**Revised order from here, recomputed after passes F and G** (`--priority --built=H1,H5,H11,H3`):
H8 (+29 cumulative 40) → H6 (+28, 68) → H2 (+11) → H10 (+9) → H7 (+8) → H9 (+5) → **H3b (9,
Knowledge only)**. ✅ **H8 IS BUILT (07-24q)** and `edha-test-fail` now has its first consumer
(Absolute Authority). Demand recomputed after pass H: **H8 51 · H6 30 · H1 22 · H3 17 · H2 11 ·
H3b 9 · H10 9 · H7 8 · H9 5 · H3ann 3 · H12 2 · H13 1.**

#### ⚠ SELF-CORRECTION, same session (07-24q): H8's `watch` VOCABULARY is the next build, not H6

The recommendation immediately below was written before `check-2b-classification.js` knew H8 was
built. Re-running `--priority` with `--built=H1,H5,H11,H3,H8` moves "already satisfiable, build
nothing" from 11 to **31**, and reading all 31 changes the answer:

**H8 as shipped watches exactly two event kinds — `test` and `skill-roll`.** Of the 31, only about
**three** (Expose, Reactive Analysis, possibly Counterpoint) are test-shaped. The rest want a kind
that does not exist yet:

| wanted `watch` kind | talents | the hook already exists as |
|---|---|---|
| `damage-applied` | Death Ward, Breaking Point, Devoted Conduit, Warlord's Fury, Resurgent Growth | the applyDamage wrapper |
| `defeat` | Necrotic Cascade, Reaper's Harvest, Arsenal | `edha-on-defeat` |
| `turn-start` | Apex Form, Primal Regeneration, Consuming Decay, Bear Witness | the combat hooks + `edha-combat-timing` |
| `token-move` | Unstoppable Advance, Ordered Advance | `preUpdateToken` / `updateToken` |
| `focus-change` | Coercive Pressure | the Black focus watcher |
| `attack-declared` | Packmate's Warning, Concord | the pre-roll hooks |

**So the highest-leverage next build is widening H8's `watch` enum, not building H6 or H3ann.**
Every kind above is a hook the engine already owns and already hand-rolls a name-keyed sweep on;
the handler, the filters (`scope` / `disposition` / range / `once`), the memoized index and the
payload dispatch are all built and unchanged. This is schema plus a dispatch call per hook — the
same "expose a schema over functions that are already generic" shape §9o predicted for H6, except
the consumers are ~20 rather than H6's 30 and the risk is lower because the handler is already
benched (2bH-5).

Revised order: **H8 watch-kinds** → H6 → H3ann (+ the legacy-flag-path escape) → H12 → H13 → the tail.

#### ✅ AND WHAT HAPPENED WHEN *THAT* WAS EXECUTED (07-24r) — the first step that did not over-shoot

| step | predicted | delivered | why |
|---|--:|--:|---|
| the 31 "already satisfiable", build nothing | ~3 test-shaped (Expose, Reactive Analysis, Counterpoint) | **1** (Reactive Analysis, and it needed no watch at all) | **Expose** rides the Sovereignty **die-step ledger** — it gates on "diminished BY YOU with Censure/Decree", which is a `dieStep` flag entry, not a status, and it fires on ordinary attack rolls the engine only judges via `edhaSovAttackRead`. Not H8-as-shipped at all: it needs H9 first, and an actor-status filter H8 does not have. **Counterpoint** needs an H1 `vs: prompt-dc` mode (the DC is the enemy's influence result, asked for at resolve time) plus a ruling on what a DECLINED prompt means — see the questions below. |
| widen the `watch` enum | ~20 consumers across 6 kinds | **4 across 2 kinds** | The two kinds built (`defeat`, `focus-change`) cost what was forecast. The other four were not attempted: every consumer of `damage-applied` and `turn-start` needs a PAYLOAD that does not exist (pre-damage veto, second-hit counter, in-flight reduction, scene tally, heal-half-of-dealt), and `token-move` / `attack-declared` want in-flight roll and movement-path mutation, which is not an observation at all. |

**But the pass still delivered 7, because three came from re-reading rather than from the queue** —
Reactive Analysis (wrong shape *in our favour*), and Hollow Command + Siphoned Will (a pass-F deferral
whose named blocker, H10, turned out to be five lines). Net: the per-step column was wrong AGAIN and in
the same direction, and the pass beat it anyway. **That is the argument for the §9n habit over the §9o
table: `--priority` ranks BUILDS; the work list comes from reading call sites and deferral notes.**

**Recomputed after pass I** (`--priority`, built = H1,H5,H11,H3,H8,H10): 100 bucket-2 talents,
33 "already satisfiable". Demand: **H8 46 · H6 30 · H1 21 · H3 17 · H2 11 · H3b 9 · H7 8 · H9 5 ·
H10 5 · H3ann 3 · H12 2 · H13 1.** Greedy order: **H6 (+28) → H2 (+11) → H3b (+9) → H7 (+8) →
H9 (+5) → H3ann (+3) → H12 (+2) → H13 (+1).**

**Recommended next, in order:**
1. **H6 `edha-prompt-pick`** — it has led the greedy order since 07-24n, nothing has displaced it, and
   §9o's read still stands that the post-card helpers are already generic and take the talent name as a
   mere label. It is also what unblocks Puppeteer, the last Black bucket-2 talent.
2. **H3ann + the legacy-flag-path escape**, then the marker ledgers ONE LEDGER AT A TIME (Ben's call —
   see the questions below).
3. **The remaining `watch` kinds only alongside their missing payloads.** Do not build
   `damage-applied` or `turn-start` as schema-only: they would ship a kind with zero consumers. The
   payload gaps are the work — a pre-damage veto, a counting rider, and a "heal a fraction of what this
   rule just dealt" link would between them unblock 9 talents across 5 trees.

#### ✅ AND WHAT HAPPENED WHEN H6 WAS EXECUTED (07-24s) — the per-step column was right for once, for the wrong reason

| step | predicted | delivered | why |
|---|--:|--:|---|
| build H6 | +28 fully-satisfied | **10 names off the ratchet** | 6 of the 10 were H6 consumers as filed. The other 4 were not: **False Premise** left H6's column entirely (a RULING deleted its second path), **Probability Cascade** was bucket 1, **Overwhelming Authority** came along because it shares a card function with Subtle Suggestion, and **Feinting Strike** had nothing to do with H6 at all — its blocker was a dispatcher. Meanwhile 9 filed H6 consumers did NOT convert: 5 want a source H6 deliberately did not ship (status / item / effect), and 4 more are gated on `damage-applied`. |

**The headline this time is not the number, it is which TREES emptied.** Blue (5 bucket-2),
Black (2) and Warrior (1) all go to **zero**, because H6 happened to be the last blocker for whole
trees rather than for scattered talents. That is worth more than a bigger raw count: a cleared tree
retires a whole bench pass, and three of them cleared at once.

**Recomputed after pass J** (`--priority`, built = H1,H5,H11,H3,H8,H10,H6): **91 bucket-2 talents,
53 "already satisfiable"**. Demand: **H8 45 · H6 22 · H1 20 · H3 17 · H2 11 · H3b 9 · H7 8 · H9 5 ·
H10 5 · H3ann 3 · H12 2 · H13 1.** Greedy order: **H2 (+11) → H3b (+9) → H7 (+8) → H9 (+5) →
H3ann (+3) → H12 (+2) → H13 (+1).**

#### ⛔ THE FIVE LEDGERS, SCOUTED (07-24s) — and the escape is the WRONG SHAPE

The whole "legacy-flag-path escape" framing this doc has carried since pass H is **wrong for the two
ledgers that matter first and insufficient for the other three.** Scouted before building anything.

**THE FINDING: for `covenants` and `edicts`, do not build a field — REPOINT THE ACCESSOR.**
`Document#getFlag` resolves dotted keys through `getProperty` (verified in Ben's install,
`common/abstract/document.mjs:917-918`), and `setFlag` expands them through `update()`. So

```js
function edhaGetCovenants(owner) { return owner?.getFlag?.("edha-content", "lists.covenants") ?? []; }
```

moves the ledger to where H3 already reads it, and **all 12 readers follow for free**. There is then
only ever ONE array, so the "two places at once" hazard cannot happen by construction rather than
being managed by a field. Both Order ledgers are reached through exactly one accessor plus two raw
sites each. **And nothing is grandfathered**: `deity-order.json`, `deity-fate.json` and
`deity-destruction.json` are 100% engine-owned today (every talent `events: {}` except Pyre and
Walking Ruin), so there is no live half-migration to preserve — which is exactly why the cheap
option is available now and will not be later.

**Convert `covenants` FIRST.** It is the only one of the five whose entry is a *pure field rename*
into H3's schema (`allyUuid`→`uuid`, `allyName`→`name`), whose cap (`@tier`) and evict (`oldest`)
already match H3's defaults, and which owns **zero canvas objects**. 12 readers surviving unchanged
is stronger evidence than 10, so its read count is a feature for a proof. Ranked:

| ledger | real read sites | canvas | shape vs H3 | also needs | rank |
|---|--:|---|---|---|--:|
| **covenants** | 12 (+2 raw) | none (1 AE + 1 raw-path hook) | **exact rename** | — | **1** |
| edicts | 10 (+1 raw) | none | 2 orphan fields (`proh`, `sealed`) | H3ann + a ruling | 2 |
| fateOrdained | 9 (+1) | 1 template/entry | **no uuid at all** | H2 + H3ann | 3 |
| fateSnares | 10 (+1) | template + Region + socket relay | no uuid | H2 + H3ann | 4 |
| charges | 12 (+1) | template + orphan Regions + 2 watchers + `trig` | no uuid, richest | H2 + H3ann | 5 |

⛔ **CORRECTION 07-24y — there are SIX ledgers, not five.** Death's **`remains`** is a sixth of exactly
this shape: legacy-FLAT at `flags.edha-content.remains` with `{tokenUuid}` entries, needing the same
accessor repoint plus a key rename, and it is what still holds **Risen Servant** on the ratchet after
H15 retired its sustain cap. It was never in this table because the table was built from the talents
that named H3, and Risen Servant is bucket-1b. Rank it after `edicts`: no canvas objects, but
`edhaOwnerList`'s reconcile-on-read would EVICT every entry unless the `harvested` status is passed
explicitly, and H3 has no pop-oldest `spend` op. `edhaRemainsList` also hard-codes Reaper's Harvest
for the scene-start freebie.

⚠ The counts previously in this doc were `grep -c` totals including each accessor's own definition
line; `charges` was inflated by two comments, and BOTH Fate ledgers were *under*-counted because two
readers call `edhaGetFateList(owner, key)` with a computed key, invisible to a name grep.

**FIVE TRAPS, each of which would have shipped silently:**
1. **H3's `place` refuses a duplicate uuid — Order deliberately allows repeat Edicts on one target**
   (the engine header says so). Converting Edict as-shipped **deletes a documented rule of the tree**.
   Needs an `allowDuplicates` field or a ruling *before* `edicts` can move.
2. **"The mark wins" is INERT for the three point-bound ledgers.** `edhaOwnerList` reconciles via
   `fromUuidSync(e.uuid)`, and Snares/Ordained/Charges entries have **no uuid** — `fromUuidSync(null)`
   returns null and the entry is kept unconditionally. The safety net that let Chaos survive a
   half-migration does not exist for these three, and it fails silently rather than loudly.
3. **`edhaListUnmark` clears the status unconditionally, but both Order markers are SHARED across
   owners** (`edhaOrderStillBound`, `edhaOrderDropCovenantIcon` exist precisely for that). Ship H3
   as-is and one owner's eviction strips another owner's icon. Needs a `multiOwner` field.
4. **Scene-scoping is inconsistent.** H3's `place` always stamps `sceneId`; Order's readers never
   scene-filter. A converted Edict placed on scene A goes invisible to H3's own read on scene B while
   all 10 legacy readers still see it.
5. **A reader lives 5,000 lines away**: `EdhaFateSnareRegionBehavior` calls `edhaGetSnares` directly.
   Miss it and every Snare goes inert on trigger — the Region fires, finds nothing, returns silently.

Two smaller corrections: the classification's `why` for Covenant names a talent that **does not
exist** ("Bear the Burden"; it is **Bear Witness**) — that column is prose, not measurement, so do
not enumerate an atom from it. And H3 would *fix* a latent bug on arrival: Order's fizzle loops keep
only the LAST evicted entry, so a cap dropping by 2+ clears one icon; `edhaListPush` collects all of
them. Expect that difference and do not file it as a regression.

#### H3ann, measured properly (07-24s) — it is 3 consumers, not 3, and it converts ZERO on its own

Scouted the four candidate call sites before costing the build (the §9n habit). Every headline about
H3ann in this doc and in `EDHA_RULE_2B_CLASSIFICATION.json` was wrong in some way. Verified in the
engine, not taken on report:

- **Weave the Thread is NOT an annotate consumer and should be struck from the list.** Its one
  annotation, `list[len-1].linked = true; list[len-2].linked = true` (`register-skills.js:9879`), has
  **exactly one write and zero reads** — grep `\.linked` and the only other hits in 15k lines are
  *unlinked tokens* and `linkedSkills`. **An annotation nothing reads is not a mechanic**; this is
  dead code, and the classification counted it as one of H3ann's three. Its real mechanics are the
  Aid and Reactive-Strike grants, and the Reactive-Strike half is worse than "manual": it is
  described once at cast time and never mentioned again, because `edhaFateSpringSnare` has no Weave
  branch. The spring path is a **nameable hook**, so by iron rule 3 that is backlog, not manual.
  Re-file as `edha-note` + a watch on the spring with a 30 ft gate.
- **Weave also has a live card-vs-engine drift** independent of the migration: the card says the
  player *chooses* two Ordained squares *within Attunement Range*; the engine silently takes the two
  most recent, with no picker and no range check (`:9874-9880`). H6 exists now.
- **Pinpoint Charge is misfiled as bucket 1b `needs: ["H3"]`, and it is doubly wrong.** The op it
  needs does not exist, and its payload is not reachable from its own document: the extra keen, the
  deflect add-back, the terrain re-centring and the follow flag all live inside `edhaResolveCharges`
  (`:8511-8538`), which belongs to Set Charge. Bucket 2.
- **Inevitable Snare has a silent editability bug worth fixing during conversion.** Its base damage
  respects the entry's own formula (`snare.formula || EDHA_FATE_SNARE_DMG`, `:9789`) but its
  *Inevitable extra* rolls the module constant `EDHA_FATE_GREEN_DIE` (`:9792`) — so editing that
  talent's damage in Foundry today changes nothing. The two values coincide, which is why nobody
  noticed.
- **The op is ~12 lines and three call sites are character-for-character identical**
  (`[...list].reverse().find(e => !e.<flag>)` → set → card, at `:8600`, `:9770`, `:12963`). The
  engine's own comments had already classified them — "mirroring Pinpoint Charge", "the
  Inevitable-Snare shape".

**Two fields matter more than the op**, and one of them is not the one this doc has been tracking:
1. **`listPath`** — the legacy-flag-path escape. H3 reads `flags.edha-content.lists.<key>`; **none**
   of the four ledgers live there (`edicts`, `fateSnares`, `fateOrdained`, `charges` are all flat).
   Without it the op cannot address a single one of its own consumers.
2. **`sourceItemUuid`, stamped on the entry** — and this is the interesting one, because it is
   **independent of the ledger conversion**. Two payload sites find their formula by NAME
   (`i.name === "Pinpoint Charge"` at `:8511`, `edhaOrderTalent(owner, "Sealed Edict")` at `:12944`)
   and a third uses a constant where it should read the talent. Stamping the annotating item's uuid
   onto the ledger entry lets those sites read the formula off a document while the ledger itself
   stays un-migrated at its legacy path. **That removes name-keys without converting a ledger** —
   worth testing as a cheaper first step than a whole ledger atom.

Also required, and easy to miss: all four refuse **before** `edhaConsumeCost`, so the op needs H1's
existing `preUseItem` veto pattern or the "nothing spent" guarantee is lost; and `annotate` should
return **false** when nothing was eligible, mirroring `release`, or the rule-ordering idiom breaks.
Note too that `edhaOwnerList`'s status reconciliation is **meaningless** for three of the four —
Snares, Ordained and Charges are canvas positions with no actor uuid to reconcile against.

#### H13 (Kneel) is scoped too SMALL — there is a third widening nobody listed (07-24s)

The two recorded widenings are right and cheap. The scope is still incomplete, and shipping it as
written would convert mechanics (1) and (3) and **silently lose (2)** — precisely the failure the
existing deferral note was written to prevent.

- **(1) the Black-vs-Cognitive test — READY, zero new work.** A verbatim copy of Absolute Authority's
  shipped rule. One benched behaviour change comes with it: the test becomes **player-rolled** rather
  than engine-rolled, which Ben already ruled for Absolute Authority.
- **(3) the advantage rider — two small widenings, both confirmed.** `edha-test-rider` has **no range
  gate of any kind** (verified in schema and reader), and `whenTargetStatus` is a single id where
  Kneel needs a comma-list. The comma-split is a two-line copy of the one already shipped on H1's
  `requireTargetStatus`, and is worth landing on all three `whenTargetStatus` readers at once.
- **(2) the `preUpdateToken` veto — the blocker is a SHAPE, not a rename.** Rewiring `kneelBy` onto
  the house `markedBy` primitive is safe from cross-talk (nothing else reads or writes
  `markedBy.compelled`, and the only site applying `compelled` in the project is Kneel's own). But
  **`markedBy` stores `{actorId, talent}`** and the veto needs the compeller's **token centre** —
  resolving actor→token is ambiguous for unlinked token-actors sharing one world actor, which is the
  exact case `kneelBy`'s `ownerTokUuid` was chosen to avoid.
- **And the third widening: nothing can WRITE that mark from a rule.** `edha-apply-status` writes
  `markedBy` but has no expiry field and reads `game.user.targets` rather than the victim;
  `edha-triggered-effect` kind `status` has `statusExpire` and `target: victim` but routes to
  `edhaApplyTimedStatus`, which **writes no mark at all**. So H13 = three widenings plus a
  `markedBy` shape decision, not two.

⚑ **A design question rides on this and should go in a bench batch, not be decided here:** after the
rewire, *any* future talent applying `compelled` inherits Kneel's movement veto. That broadens the
semantics from "Kneel compels" to "Compelled means move toward your marker". Probably correct, but it
is a ruling.

Coupling verified clean: `edhaCrownPing` no longer exists (two comment mentions only), Kneel calls no
named-talent function, and Crown of Thorns keeps working automatically because H1's dispatcher
announces `skill`/`def`, which is exactly Crown's filter.

**Recommended next, and the greedy order is NOT the right read.** Every remaining handler is small;
what decides a pass now is which ATOM it unlocks:
1. **H3ann + the legacy-flag-path escape.** Still the true unblock for H3's 17, and pass J added a
   fourth witness to the escape being the real work: **Tagging Shot** (Hunter) stayed engine-owned
   for exactly this reason — `edhaSetQuarry` writes a ledger no rule can address. Then **one marker
   ledger per session** (Ben, §9m q7).
2. **The Envoy Rousing-Presence atom is READY BUT BLOCKED ON A FEEL QUESTION, not a build.** Seven
   talents in one function; five of them ("When you use Rousing Presence…") are pure UPGRADE riders,
   so converting the parent means shipping five more empty documents while §9m q10 — is a bare
   Events tab acceptable or merely tolerable — is unanswered. Deliberately deferred: do not scale an
   unvalidated pattern by five. **It converts the moment Ben answers q10.** Two corrections found
   while measuring it, both worth keeping: **Devoted Presence removes ALL FOUR of
   Prone/Slowed/Stunned/Surprised** and is not a pick at all (the classification says "wants a real
   clear-conditions pick" — it does not; it wants a clear-statuses payload, which nothing has), and
   **Rallying Shout / Galvanize** are the Field Medicine payload gap again (the TARGET's recovery
   die, and `edha-focus`/`edha-triggered-effect` both resolve formulas against the OWNER).
3. **H6's unshipped sources come with their payload or not at all** — a picked status, item or
   effect needs a payload handler that can receive one. That single payload would land Beacon of
   Stability, Surgical Precision, Devoted Presence, Reknit Form and Unweaving, i.e. 5 talents across
   4 trees, which is better than any remaining handler on the greedy list.
4. **The remaining watch kinds still wait on their payloads** — unchanged from 07-24r, minus
   `turn-start`, which pass J built alongside Puppeteer.

⚠ **These 31 are read off the `needs` / `why` columns, NOT off the call sites.** That column has
been optimistic in every single pass (§9n D, F, G, H). Expect a third of them to fall out on
contact, and re-read every call site before batching — six coupling corrections in five passes, plus
this pass's three shape corrections, all came from doing exactly that.

**Recommended next, and it is NOT the biggest number.** H6 still leads the greedy order, but the
cheapest real shrink now is **finishing what pass H exposed**, because each item is a schema over
code that already exists and each one unblocks talents nothing else can reach:
1. **H3ann** — H3's `annotate` op *plus* the legacy-flag-path escape. The op is a dozen lines; the
   escape is what actually matters, because without it H3 cannot address any ledger it does not
   itself own, and that is every marker tree except Chaos. **This is the true unblock for H3's
   remaining 17**, and it should be measured as such rather than as a 3-consumer op.
2. **H12** — bulk detonation. A schema over `edhaResolveCharges`, which is already generic. 2 talents,
   near-zero risk, and it retires Destruction's last non-ledger blocker.
3. **H13** — the two widenings Kneel needs (`edha-test-rider` comma-list + range gate; the `kneelBy`
   veto rewired onto `markedBy`).
4. Then **H6**, which the greedy order has wanted since 07-24n and which nothing here displaces.

⚠️ Do NOT schedule the marker trees per-talent. Order's edicts, Order's covenants, Fate's snares,
Fate's ordained and Destruction's charges are five ATOMIC units — each converts with all its readers
or not at all (§9n pass H).

#### ✅ AND WHAT HAPPENED WHEN THE FIRST LEDGER WAS EXECUTED (07-24u) — the scouting held, the count did not matter

| step | predicted | delivered | why |
|---|--:|--:|---|
| `allowDuplicates` on H3 | 1 field, ruled | **1 field** | Exact. It is also the one field this pass built that has **no consumer yet** — Covenant sets it `false`; `edicts` is what wants it `true`. Shipped anyway because Ben ruled it, and because the alternative was converting Edict later *and* widening H3 in the same pass. ⚠ By the project's own "don't ship schema with no consumer" rule this is a deliberate exception, not a precedent. |
| the `covenants` ledger | 5 talents, "12 readers + 2 raw sites" | **2 talents; 12 readers + 2 raw sites exactly** | The READER count was right to the number, which no estimate in this doc had managed before. The TALENT count was never the deliverable — see below. Shoulder the Oath and Concord are both the `damage-applied` payload gap; Final Decree is bucket 3. |

**Read this row differently from every row above it.** The per-step column has over-estimated in every
pass that read it as a forecast, because it counts TALENTS. For a LEDGER the deliverable is the
**repoint**: after this pass every one of Order's covenant readers, converted or not, resolves the same
array at `flags.edha-content.lists.covenants`, so the tree is coherent and the next talent can move
whenever its payload exists. Scoring that as "2 of 5" is the same mistake as scoring H3 by its raw
consumer count.

**Recomputed after pass L** (`--priority`, built = H1,H5,H11,H3,H8,H10,H6,H12): **88 bucket-2 talents,
51 "already satisfiable"**. Demand: **H8 44 · H6 23 · H1 20 · H3 15 · H2 11 · H3b 9 · H7 8 · H9 5 ·
H10 4 · H3ann 3 · H13 1.** Greedy order: **H2 (+11) → H3b (+9) → H7 (+8) → H9 (+5) → H3ann (+3) →
H13 (+1).**

**Recommended next, in order — and the ledger ranking is UNCHANGED except that #1 is now done:**
1. **The Envoy Rousing-Presence cluster.** Unblocked by Ben's q10 ruling and *not attempted this pass* —
   the covenants ledger filled it. One function, seven talents, five of them pure upgrade riders. Uses
   only built handlers except **Devoted Presence** (wants a clear-statuses payload: it removes all four
   of Prone/Slowed/Stunned/Surprised and is not a pick at all) and **Rallying Shout / Galvanize** (the
   Field Medicine gap — the TARGET's recovery die).
2. **`edicts`, the second ledger** — and it is now materially cheaper than it was, because
   `allowDuplicates` (its blocker) and `multiOwner` (its shared icon) both shipped this pass. What
   remains is H3ann for `proh`/`sealed` and the same accessor repoint, which is now a worked pattern.
3. **A `list-members`-shaped payload is worth more than the greedy order suggests.** Final Decree's
   Witness block and Concord's roster are the same shape this pass built for Bear Witness, and
   `target: list-members` is already generic over any H3 ledger.
4. **The remaining watch kinds still wait on their payloads** — unchanged. Note that Shoulder the Oath
   and Concord are now TWO more measured consumers of the `damage-applied` payload, both in one tree,
   which strengthens the case for building the redirect/pre-mutation payload rather than the kind.

#### ⛔ AND WHAT HAPPENED WHEN "CONVERT BUCKET 1 + THE 1b FIELDS" WAS EXECUTED (07-24v) — the table's UNIT was wrong, not just its size

| step | predicted | delivered | why |
|---|--:|--:|---|
| convert bucket 1 | 6 | **1** (Rousing Presence, and only as part of the Envoy cluster) | **0 of the 6 were bucket 1.** Reclassified: Forge Construct → H15, Withering Touch → H16, Blood Price → H18, Calculated Patience → H19, Overgrowth → 1b. Bucket 1 is now **0**. |
| "build the fields 1b needs, then convert them" | 39 | **7** | 1b's `needs: []` was wrong for most of what was scouted. **Ten** of the 39 are not field-level at all and moved to bucket 2 (the three range-rider Attunements, Phantom Barricade, Siege Form, Tempered Edge, Tagging Shot…). What DID land: the whole Envoy cluster (6) + Withering Ray/Verdant Mend on one new config-only handler. |

**The correction this forces is to the UNIT, and it is the third such correction in this doc.** §9o
already knows a handler's demand count is not a forecast. Pass M shows **`bucket` is not a forecast
either**, because it was assigned by asking "is a handler registered for this" rather than "can this
talent's behaviour be expressed". Those differ whenever the handler is config-only, the schema lacks
the gate, or no event fires — and that is *most* of the remaining 96. Treat `bucket 1`/`1b` as "worth
scouting first", never as "ready".

**Recomputed after pass M** (`--priority`, built = H1,H5,H11,H3,H8,H10,H6,H12): **96 bucket-2, 29
bucket-1b, 17 bucket-3, bucket 1 = 0, total 142.** Demand: **H8 44 · H6 22 · H1 20 · H3 15 · H2 11 ·
H3b 9 · H7 8 · H9 5 · H16 3 · H3ann 3 · H10 3 · H17 3 · H20 3 · H13 1 · H15 1 · H18 1 · H21 1 ·
H22 1.** (The bucket-2 count went UP, from 88 to 96, because ten 1b talents were honestly reclassified
into it — the ratchet still fell 150 → 142.)

**Recommended next, and the eight new tags change the shape of the answer.** The remaining work is no
longer "a few big handlers"; it is a long tail of small, well-understood builds. Ranked by
talents-per-unit-of-risk rather than by raw demand:
1. **H20 — the Draw Mana rider event.** One new event dispatched from a hook that already exists.
   It immediately converts **Blue + Red Leyline Attunement** (both drop-ins on `edha-next-test-mod`)
   and is the precondition for the other three. Nothing else unblocks two talents this cheaply.
2. **H15 — `sustainCap` + `replaceOldest` on `edha-summon`.** Two fields, and they are the *only*
   thing holding Forge Construct on the ratchet; the same fields retire Risen Servant's cap. Stamp a
   `summonTalent` flag while in there — four separate sites currently identify a summon by name prefix.
3. **H19 — `whenSlowTurn`.** One field mirroring the shipped `whenFastTurn`; Calculated Patience is a
   direct mirror of the live Burning Drive rule. ⚠ Carries a fail-open ruling (see §9m).
4. **H17 — a target-scoped formula resolver.** 3 bucket-2 consumers across 2 trees, and it finally
   retires the Field Medicine gap that has been open since pass D. Two builds: the resolver *and* the
   recovery-die path, which the engine itself still marks unverified.
5. **H16 — arm-and-consume.** Withering Touch already hand-rolls it; Tagging Shot and Tempered Edge
   want it. Note Tagging Shot is *currently dead code*, so this is a fix, not just a move.

⚠ **Do NOT schedule the three range-rider Attunements, Phantom Barricade or Siege Form as "1b".** They
are new capability: a visible-range filtered heal, an Isolated-gated status sweep, terrain placement,
Wall/cover creation, and a toggle-a-summon's-effect handler respectively.

#### ✅ AND WHAT HAPPENED WHEN THE TOP THREE OF THAT LIST WERE EXECUTED (07-24y) — the first pass whose per-item forecasts all held

| step | predicted | delivered | why |
|---|--:|--:|---|
| **H20** — the Draw Mana rider event | 2 (Blue + Red) | **2** | Exact, field-for-field, including `attr`. The produced `nextTestMod` object is equivalent to what the table wrote. Costs the forecast did NOT price, all found by scouting: Blue/Red must LEAVE `EDHA_DRAW_MANA` or the mod is written twice (silently, same result — invisible at a bench); Red's `reactionNote` had **no schema field** to land in and had to be re-homed as an `edha-note`; and the one-card summary becomes card + N. |
| **H19** — `whenSlowTurn` | 1 (Calculated Patience) | **1** | Exact, and the ⚠ carried with it was REAL — see §9n. Also retired a MANUAL exit and its console macro, which no estimate counted because the ratchet does not track manual exits. |
| **H15** — `sustainCap` + `replaceOldest` | 1 off the ratchet (Forge Construct), + Risen Servant's cap retired | **1, and exactly that** | The talent count was right; **the BUILD SIZE was not.** "Two fields" was wrong twice over — it also needed a generic pre-cost `preUseItem` veto (an executor runs after the cost is charged) and a `summonedAt` stamp (nothing recorded a creation time, so "oldest" had nothing to sort by). Risen Servant stayed, as forecast, on H3. |

**So the per-step column was right three times running, and that is a first — but read WHY before
generalising it.** These three were not forecast from the `needs` column. They were forecast from the
07-24v three-leg test (name the executor, the schema field, the event), applied per talent, and the
two places the forecast still slipped were both **build size**, never talent count: H20's re-homing
problem and H15's veto + ordering. **The column predicts WHICH talents move; it has still never
predicted how much work moving them is.** Continue to use `--priority` to rank, not to plan.

**Recomputed after pass P** (`--priority`, built = H1,H5,H11,H3,H8,H10,H6,H12): **95 bucket-2, 19
bucket-1b, 17 bucket-3, bucket 1 = 0, total 131**, 46 "already satisfiable". Demand: **H8 44 ·
H6 22 · H1 20 · H3 15 · H2 11 · H3b 9 · H7 8 · H9 5 · H3ann 3 · H10 3 · H17 3 · H20 3 · H16 2 ·
H13 1 · H18 1 · H21 1 · H22 1 · H23 1.** Greedy order: **H2 (+11) → H3b (+9) → H7 (+8) → …**

⚠ **H15 and H19 are BUILT but do not appear as `--built`, and H20 appears with 3 consumers left.**
That is correct, not stale: H15/H19 served bucket-**1b** talents, which the demand column never
counted, so they were 0-consumer entries before and after. H20's *event* is built — that was the
entire blocker for Blue and Red — but its remaining 3 (White / Black / Green) are genuine bucket 2
and need new capability on top of it. **A handler can be finished and still leave its demand column
untouched; do not read a non-zero count as "unbuilt".**

**Recommended next, in order — the greedy list minus what shipped, plus two corrections:**
1. **H17 — the target-scoped formula resolver.** Now the largest remaining *small* build, and it is
   **two-and-a-half builds, not two**: the resolver, the recovery-die path, and **a mixed-scope
   formula problem nobody has costed** — Field Medicine heals `<the TARGET's recovery die> + <YOUR
   Medicine ranks>`, and a single `formulaScope` enum cannot express one formula with two scopes.
   The cheapest answer found while scouting is to merge the target's roll data into the owner's under
   a `target.` namespace before resolving. **Galvanize is the clean single-scope consumer and should
   be the pilot.** Two corrections to the record: the recovery-die path is **verified** now
   (`actor.system.recovery.die.value`, a bare `"d8"`-style string, `RECOVERY_DICE[min(ceil((wil.value
   + wil.bonus)/2), 5)]` — the engine's `|| "1d8"` fallback is dead code and its second `||` branch is
   a latent throw), and **Resuscitation does not need H17 for its own text** — it has no recovery die
   at all; its dependency is purely the coupling to Field Medicine.
2. **H16 — arm-and-consume, and it is 2 talents, not 3.** **Tempered Edge was never an H16 consumer**
   — it is a passive with nothing to arm — and is re-filed as **H23** (a summoner-scoped damage rider:
   `edhaRiderParts` walks the ROLLER's items, and the roller is the summon, plus an ignore-deflect
   second damage instance the rider schema has no vocabulary for). Withering Touch converts on H16
   alone. **Tagging Shot is a FIX, not a move** — its branch is unreachable dead code today (the gate
   reads the item that rolled damage; its `damage.formula` is null), so it has never once marked a
   quarry — and its card promises "on a hit **or a graze**", where ⚑ **it is UNVERIFIED whether a
   graze reaches `applyDamage` at all**. That is a bench question or a ruling, not a build.
   One independent one-line fix to take while in there: the shared heal-cut card picks its source
   name from the FRACTION (`hcf === 0` prints "Withering Touch", anything else "Necrotic Grasp")
   instead of from the `byName` the effect already stores — so any future fraction-0 block from any
   source will claim to be Withering Touch.
3. **The `summonTalent` flag is now available and unused.** `edhaCivIsConstruct` still identifies a
   Construct by `name.startsWith("Combat Construct")` at 6 call sites. That is NOT a rule-2b
   violation (it is a summon name, not a talent name, and lint pass 7 correctly ignores it), and it
   was deliberately left alone this pass because changing it has migration risk for Constructs
   already standing in Ben's world. It is now a cheap cleanup whenever Civilization is next opened.
4. **`edicts`, the second ledger** — unchanged from pass L, still one ledger per session (§9m q7).

### 9m. Questions for Ben — batched, none decided unilaterally

> ⚑ **FOUR QUESTIONS RE-OPENED 2026-07-24v — see the block at the END of this section (q12–q15).**
> They are new, not re-litigated: each is a case where the ENGINE is more permissive than the CARD, so
> agreeing them *restricts* play. The 07-24t ruling covers the opposite direction only.
>
> **✅ ALL OPEN QUESTIONS SETTLED 2026-07-24r.** Ben: *"Go with defaults on your questions."* Every
> recommended default below is therefore a RULING, and the ones that were still open are struck
> through and marked. Nothing here is awaiting an answer any more; the next open question should be
> added fresh rather than inferred from this list. **The one thing this does NOT settle is anything
> that only a bench pass can answer** — the checklist's ⚑ rows are still unrun, and a ruling on
> *intent* is not evidence the code *works*.

1. ~~**H9 (`edha-die-step`) — build it, or leave Sovereignty ENGINE-OWNED?**~~ **✅ SETTLED
   2026-07-24r — BUILD IT.** It is the only proposal serving exactly one tree (5 bucket-2 consumers
   + 2 bucket-3 + 1 bucket-1b, all Sovereignty). A handler for one tree is against the spirit of iron
   rule 2a; but the alternative is declaring 8 of 9 Sovereignty talents ENGINE-OWNED, which is a lot
   of exit for a tree whose mechanic (±1 damage die step) is not actually complex. The ledger is
   simple, and "one tree" today is a design accident — die-step manipulation is an obvious future
   shape. **H9 is also now on the critical path for Expose** (§9o, 07-24r): Expose gates on
   "diminished BY YOU with Censure/Decree", which is a `dieStep` ledger entry, so it cannot convert
   before H9 exists no matter how many watch kinds land.
2. ~~**`execute-macro` Inline as a bucket-3 escape hatch — use it or forbid it?**~~ **✅ SETTLED
   2026-07-24p — ALLOW IT, GATED AND SIZE-LIMITED, but NOT as the bucket-3 exit.** Ben pushed back
   on the flat ban and was right: a macro string IS testable — the gates can syntax-check the
   command and smoke-run it in `tests/harness.js`, which is more than can be said for a manual
   card. So it is permitted on a shipped talent when it passes a syntax check and stays small
   (~15 lines). It is **not** the answer for bucket 3, because a 200-line cross-actor subsystem in
   a text field is a second engine in a string — iron rule 2a in everything but letter. Bucket 3
   still exits via marker rule + cue rule + an `ENGINE_OWNED:` line, and `edha-note` (built in
   pass F) is now the cue primitive that makes that exit actually available.
   ✅ **THE GATE IS BUILT — `lint-refs.js` PASS 8, 2026-07-24s**, before any consumer exists, so
   nothing is grandfathered. Ben delegated the size call ("macro size I'll defer to you"):
   **20 logical lines** (blanks and comments free) **and 1200 characters** — both, because a line
   limit alone is evaded by one long line and a character limit alone by whitespace. 15 was the
   right order of magnitude but too tight for the guard-clause style used everywhere else here.
   Also rejected, and these matter more than size: **UUID-referenced macros** (they live in the
   world, so the gate cannot parse one, a review cannot diff one and a rebuild cannot carry one —
   the behaviour ends up no more visible than the engine branch it replaced), **a body that does
   not parse**, and **`Hooks.on/once` / `setTimeout/setInterval`** (a hook outlives the use that
   created it and re-registers every execution with nothing to remove it — a second engine at any
   length). Pinned in `tests/macro-gate.test.js`, all six rules mutation-checked both ways, and the
   three LEGAL shapes pinned too. **A gate nobody has watched fire is the failure mode this repo
   has already had twice** (audit.py's soft-laziness check, audit.py's locale codec).
3. ~~**Order confirmation.**~~ **✅ SETTLED 2026-07-24r — TAKE THE REVISED ORDER.** It starts with the
   heroic atlas, reversing §9f. It is the cheaper path and closes 25% of the ratchet on two handlers,
   at the cost of the deity trees Ben is likelier to be playing waiting longer. Say so at any point
   if table priorities should override it — this ruling is a default, not a lock.
4. ~~**Checklist 2bE-9 — the adversary widening.**~~ **✅ SETTLED 2026-07-24p — KEEP IT.** Rule-driven
   dispatch fires only for an actor actually carrying the rule, so an adversary with an embedded
   twin getting its combat-start grant is the correct scope for a rule and consistent with the
   adversary-twin design. No code change; the checklist row stands as a behaviour note, not a bug.
5. ~~**Calm Appeal / Resolute Stand — MANUAL declaration?**~~ **✅ SETTLED 2026-07-24p — NO: keep the
   reminder and gate it on the document.** See §9n pass F. This established the UPGRADE-TALENT
   exit, which is now the second declared class alongside ENGINE-OWNED and MANUAL.
6. ~~**H3b `edha-owner-counter` — build it, or leave Knowledge ENGINE-OWNED?**~~ **✅ SETTLED
   2026-07-24r — BUILD IT, AS A `mode` ON H3, NOT A SECOND HANDLER.** Measured while building H3
   (§9n pass G): Insight is a counted single bearer, not a capped list, so H3 does not serve
   Knowledge at all. 9 bucket-2 consumers, all one tree — and folding it in as a mode is what moots
   the "one tree" objection, since `edha-owner-list` then covers both the capped-list and the
   counted-single-bearer shapes under one editable rule type. Same answer, same reason, as q1.
7. ~~**NEW (07-24r) — the five marker ledgers: one per session, or the whole family in one pass?**~~
   **✅ SETTLED 2026-07-24r — ONE LEDGER PER SESSION.** Order's edicts, Order's covenants, Fate's
   snares, Fate's ordained and Destruction's charges each convert as ONE atomic unit of ~5–9 talents,
   which is bigger than any pass so far (§9n pass H). They need H3ann + the legacy-flag-path escape
   first either way. One per session, because a half-converted ledger is the one failure mode that
   silently empties a live list at the table, and a bench pass per ledger is how that gets caught.
   **A session that finishes its ledger early should take the NEXT-cheapest non-ledger work, not
   start a second ledger.**
8. ~~**NEW (07-24r) — Counterpoint needs an H1 `vs: "prompt-dc"` mode, and the third outcome needs a
   ruling.**~~ **✅ SETTLED 2026-07-24r — OPTION (a): A DECLINED PROMPT IS A FAIL, and the card says
   "resolve at the table".** Its DC is the enemy's influence-test result, which only the GM knows at
   resolve time, so `edhaPromptDC` has to run inside the gate. The rejected options, recorded so they
   are not re-litigated: (b) treating decline as SUCCESS would follow H1's fail-open convention, but
   the bar here is *withheld*, not unreadable, and auto-negating an enemy's influence is a real
   effect; (c) an owner-judged card is what the talent does today and what pass H deliberately took
   away from Extract Thought. Consistent with q9.
9. ~~**NEW (07-24r) — the six pass-I behaviour changes (checklist 2bI-3/4/6/7/8/12).**~~
   **✅ SETTLED 2026-07-24r — KEEP ALL SIX.** Specifically:
   - **2bI-3** Coercive Pressure's card now reads "an **enemy**… once per round per **enemy**",
     matching the 07-12 enemies-only ruling the engine has followed all along. The card was the thing
     that was wrong.
   - **2bI-4** its debuff no longer stacks with another next-test rider (nextTestMod is one slot).
     Accepted as a narrowing.
   - **2bI-6** Whispered Doubt's extra focus loss now passes through **Wary**, because it is
     involuntary focus loss and Wary's text says so.
   - **2bI-7** Hollow Command enforces its printed Attunement Range **pre-cost** (nothing spent).
   - **2bI-8 + 2bH-11** an unreadable Spiritual defense now **fails OPEN** for both Hollow Command
     and Extract Thought. **One ruling, both talents** — this is now H1's standing convention and
     future conversions should follow it without re-asking.
   - **2bI-12** Reactive Analysis's advantage binds to the creature you targeted, as its card always
     said; untargeted falls back to the old unbound behaviour.
   ⚑ These settle **intent**. They are not evidence the code works — every row is still unrun.
11. ~~**NEW (07-24s) — does Order keep REPEAT EDICTS on the same target?**~~ **✅ SETTLED 2026-07-24t
    — BUILD `allowDuplicates`.** Ben: *"Stupid question. If the header allows it we need to build the
    tool that makes that true."* H3's `place` refuses a duplicate uuid; the Order tree deliberately
    allows repeat Edicts and its own engine header says so ("Repeat casts on the SAME target are
    legal — different prohibitions, each its own entry"). **The principle is bigger than the case and
    should be applied without re-asking: the tree as documented is the SPEC, and a handler's
    limitation is never a reason to change it.** A conversion that quietly narrows a talent because
    the generic primitive cannot express it is a balance change dressed as a refactor — widen the
    primitive instead. Re-read every conversion against this: if the card or the tree header says a
    thing and the new rule cannot, that is a build item, not a trade-off.
10. ~~**The UPGRADE-TALENT empty document (2bF-5 / 2bF-14 / 2bF-16, 2bI-9).**~~ **✅ SETTLED
    2026-07-24t — ACCEPTABLE; the pattern SCALES.** Ben: *"The entire point of this exercise is to
    ensure that any talent can have its dials tweaked inside of Foundry. If that can be accomplished
    from only the details tab of a given talent, that's fine."*
    **The test is EDITABILITY, not which tab.** An empty Events tab is fine when the talent's dials
    are reachable in Foundry; no cosmetic `edha-note` is needed to pad a bare tab. This **unblocks
    the six-talent Envoy cluster**, held through pass K for exactly this answer.
    ⚑ One nuance to state rather than assume, because it is a step further than the words: for an
    UPGRADE talent the dial lives on the **parent's** rule (Siphoned Will's focus is a field on
    Hollow Command), so it is editable in Foundry but not from the upgrade's own sheet at all. That
    is the trade this ruling accepts. **Keep declaring it in the tree-section header** — the ruling
    makes the pattern acceptable, it does not make it invisible.

---

### ✅ 2026-07-24v–x — ALL FOUR SETTLED AND BUILT. §9m has NO open items again.

> Ben ruled q12 *enforce*, q14 *end of combat*, q13 *build it*, q15 *(a) yes, (b) build it*. Every one is
> shipped, not deferred — there are no reminder-shaped compromises left in this batch. Add new
> questions fresh rather than inferring them from this list.

These are **not** covered by the 07-24t "the tree as documented is the SPEC" ruling. That ruling says
never to *narrow* a talent below its card. Each of these is the opposite case — the **engine is more
permissive than the card**, so making them agree *restricts* play. That is a balance call, not a
refactor, so it is Ben's.

12. ~~**The three Command upgrades' skill lists — enforce them?**~~ **✅ SETTLED 2026-07-24w — ENFORCE.**
    Ben: *"1 enforce"*. Built: `edha-next-test-mod`'s `skill` is now a comma-list, pinned in `tests/`
    in both directions. ⚠ That widening was needed **either way** — as a scalar compare an authored
    "itm, lea, per" matched no skill id at all, so the gate silently passed everything. All four
    Command talents converted with it. ⚑ Bench 2bN-2: Demonstrative's Athletics/Agility are the ids
    players have been self-waiving.
    *Original question, kept for the record:* Confident / Demonstrative / Shrewd
    Command each name three skills (`itm,lea,per` · `ath,agi,lea` · `dec,ins,lea`), and the engine's
    own card text says *"the card's skill list is honor-system — GM waives it on a non-matching
    test"*. Enforcing needs a comma-list `skill` matcher on `edha-next-test-mod` (today it is a scalar
    compare, so an authored list would silently match nothing).
    **Recommended default: ENFORCE.** Leadership appears in all three lists, so the tightening is mild
    in practice; Demonstrative's Athletics/Agility are the ones players currently self-waive.
    ⚠ Whichever way this goes, the comma-list matcher should land anyway — an authored value that
    silently never matches is worse than either behaviour.

13. ~~**Authority — build it or keep it cosmetic?**~~ **✅ SETTLED 2026-07-24x — BUILD IT.** Ben: *"Build the decisive command and authority support."* Shipped: `rangeFt` / `maxTargets` / `doubleIfOwns` on `edha-next-test-mod`, vetoed pre-cost. Decisive Command now enforces its printed 20 ft and Authority genuinely doubles both halves (40 ft, 2 allies). The handler also had to learn to fan out to N targets — it resolved exactly one, which is why the ally-count half had nowhere to land. ⚑ Bench 2bO-1…4.
    *Original restatement, kept for the record:* Ben: *"what talent is this talking about? You
    aren't being precise."* Fair. Concretely:
    **AUTHORITY**, heroic/**LEADER** tree, Always Active, no cost. Card verbatim: *"Double the range of
    Leader talents that affect allies, and double the number of allies affected."*
    The only Leader talent whose card states a range is **DECISIVE COMMAND**: *"Spend 1 focus to give an
    ally **within 20 ft** a d4 command die."* So Authority should mean **40 ft instead of 20**, and
    **2 allies instead of 1**.
    **The engine enforces NEITHER, and never has.** There is no distance check in Decisive Command at
    all — you can command an ally across the map — and it only ever affects one. The single observable
    effect of owning Authority was that a warning string said "within 40 ft" instead of "within 20 ft".
    **THE QUESTION: build it for real, or leave it a reminder?** Building it makes Decisive Command
    start **refusing** allies beyond 20 ft (40 with Authority) — a restriction your table does not have
    today — and needs multi-target support for the 2-ally half.
    **Recommended default: leave it a reminder.** Shipped 07-24w as a rider note on Decisive Command
    stating both halves, so the information reaches the table even though nothing is enforced. Say the
    word and it becomes a real build.
    *Original wording, kept for the record:* Its card reads *"Double the range
    of Leader talents that affect allies, and double the number of allies affected."* The engine
    enforces **neither**: the computed range lands in a warning string and the variable is then dead,
    and no Leader talent has a distance check at all. Converting it faithfully ships the same
    cosmetic string.
    **Recommended default: KEEP IT COSMETIC for now and declare it**, because the alternative means
    inventing a base range for every ally-affecting Leader talent and building multi-target caps —
    new design, not a migration. Say the word and it becomes a real build instead.

14. ~~**Rousing Presence's Determined — build a scene expiry?**~~ **✅ SETTLED 2026-07-24w — END OF
    COMBAT**, not scene. Ben: *"3. Make it end of combat"*. Built: `edha-apply-status` gained
    `expire: "combat"` plus a generic end-of-combat sweep keyed on the **creature's** own flag map, so
    it names no talent and any future rule can opt in. It sweeps `game.actors` rather than canvas
    tokens on purpose — an ally who left the scene mid-fight still carries the status. ⚑ Bench 2bN-3.
    *Original question, kept for the record:* Nothing
    clears Determined today, before or after this pass; the duration has always been fiction. There is
    no scene-scoped status expiry anywhere in the project (`statusExpire` offers end-of-owner's-turn
    and end-of-target's-turn only).
    **Recommended default: ACCEPT the current behaviour** (permanent until removed by hand) and log
    it, since it is what the table has always played. A generic `statusExpire: "scene"` would serve
    several talents, so it is worth building — just not as a silent side-effect of this conversion.

15. ~~**Pack Hunting — which half of the card is canonical?**~~ **✅ SETTLED 2026-07-24x — (a) YES, and (b) BUILD IT.** Ben: *"Yes to a. Build it for B."* So neither side of the card was surrendered: the quarry gate now exists (`requireQuarry`, vetoed pre-cost when you have no quarry) AND damage rolls are genuinely supported (`appliesTo: either` plus a consumption path in the rollDamage wrapper). ⚑ Bench 2bO-5…7.
    *Original restatement, kept for the record:* Ben: *"again I don't know what you're saying."*
    Concretely:
    **PACK HUNTING**, heroic/**HUNTER** tree, Reaction, 1 focus. Card verbatim: *"Spend 1 focus to add
    your ranks in Survival to your ally's attack or damage roll **against your quarry**."* ("Your
    quarry" is the creature marked by **Seek Quarry**, same tree.)
    The engine writes a +Survival bonus onto the ally with **no gate whatsoever**, which breaks the card
    in **two opposite directions** — that is why one answer isn't enough:
    - **(a) There is no quarry gate at all.** The bonus lands on the ally's next test of ANY kind against
      ANY creature. The card restricts it to your quarry. → **the engine is too generous.**
    - **(b) "or damage roll" is impossible.** The next-test pipeline is hooked on d20 rolls only, so a
      damage roll can never receive it. → **the card is too generous.**
    **THE QUESTION, two parts:** (a) add the quarry gate, taking away something your players can do
    today? (b) delete "or damage roll" from the card, or build damage-roll support?
    **Recommended default: yes to (a), and delete the clause for (b)** — the same call made for
    Withering Ray's Cost line on 07-12, where the card was corrected to match the engine.
    *Original wording, kept for the record:* Two live drifts, both pre-existing: the
    engine applies its bonus to the ally's next test *of any kind against anything* (the card says
    "against your quarry", and no quarry gate exists in the code), and the card offers the bonus on
    the **attack or damage roll** while the next-test pipeline is registered on d20 contexts only, so
    damage can never receive it.
    **Recommended default: the CARD is canonical on the quarry gate** (add it — that is a real
    tightening and clearly intended) **and the ENGINE is canonical on damage rolls** (drop that clause
    from the card, as the Withering Ray Cost line was dropped on 07-12). Two different directions in
    one talent, which is why it is worth asking rather than assuming.
---

## 9p. ⛔ THE 67 THAT "READ READY", MEASURED (2026-07-25, pass 2bQ) — it is 64, and 33 of them cannot hold a rule at all

**This is session 4 of SESSION_PLAN.md, run as the measuring pass it was budgeted as.** The plan's
⛔ banner said *"67 of the 131 have no unbuilt handler left in their `needs` column"* and warned that
the figure had been wrong in eight consecutive passes. It was wrong again, in both directions, and
this pass replaces it with a measurement that has line numbers behind every claim.

### The count first

**64, not 67** — 46 bucket-2 + 18 bucket-1b. (The 17 bucket-3 declared exits also read ready but are
session 3's atom, which is where the 67 probably came from: 64 + 3 is not a partition anyone
intended.) One bucket-1b talent, **Sanguine Reservoir**, names an *unbuilt* handler (H18), so the
plan's "all 15 read `needs: []`" is true of 15 of the 19 bucket-1b entries, not all of them.

### What actually holds them — three structural blockers, none visible in `needs`

| blocker | n | why the column cannot see it |
|---|--:|---|
| **TAKEOVER cancels `use`** | **15** | the name is in a `preUseItem` Set whose hook ends `return false` |
| **ALWAYS-ACTIVE** | **11** | `activation.type: none` — no `use` event exists to hold a rule |
| **DEALER-SIDE rider** | **7** | behaviour rides the `applyDamage` wrapper, not an on-use payload |
| | **33** | **more than half of the "ready" set** |

**The takeover finding is the load-bearing one.** There are **19** `preUseItem` hooks in the engine
and **every one of them ends in a bare `return false`**. Six consult a named Set:
`EDHA_CHAOS_TALENTS` (L9961), `EDHA_FATE_TALENTS` (L10395), `EDHA_DEATH_TAKEOVER` (L11314),
`EDHA_CIV_TAKEOVER` (L11903), `EDHA_POWER_TAKEOVER` (L12522), `EDHA_SOV_TALENTS` (L10842),
`EDHA_GNOSIS_TAKEOVER` (L13026), `EDHA_ORDER_TAKEOVER` (L13865), `EDHA_DESTRUCTION_TALENTS` (L8995).
A talent listed there **can never fire `use`**, so an authored `use` rule on it is inert while the
Events tab looks perfect. Fifteen of the "ready" 64 are in one:

> Chaos: Spreading Omen · Unweaving · Cascade Collapse · Unravel Everything (+ Red's **Shatter
> Focus**, which lives in the *Chaos* set) — Fate: Read the Threads · Foreknown Strike · Weave the
> Thread · Thread of Inevitability — Death: Consuming Decay · Death Ward — Order: Edict · Verdict ·
> Concord — Power: Investiture of Command

The engine already documents the hazard, at L13862–13864 above the Order set — *"a name left here
never fires its `use` event and every authored rule on the talent is silently inert while the Events
tab looks perfectly correct"*. The note was written; the classification never read it. **The atom
here is the takeover, not the talent** — dismantling one Set frees its whole tree at once, and that
is how Chaos / Fate / Order / Death should be scheduled from now on.

### And the 31 with no leg-3 blocker are still not 31 conversions

**48 of the 63 remaining ready talents carry more than one name-keyed site**, so converting the
dispatch case alone would ship a talent whose other mechanics silently stopped (LESSONS.md §2).
**Apex Form is the worst**: five mechanics — the on-use buff (L9566), the +2 Deflect read (L9313–9318),
the +tier vital dealer rider (L9357), the mutation-doubling multiplier (L9318/9351/9372), and the
end-of-scene Injury (L9591–9595). Its row says `needs: [H8]`, and H8 is built.

### Two builds fell out of the sweep that no demand column contains

1. **A generic REVEAL handler.** ✅ **BUILT THIS PASS as H24 `edha-reveal`; both talents converted.** **Sharp Eye**'s payload is a whispered card naming the target's
   lowest attribute, lowest defence, and which resources are below half. No registered handler
   produces dynamic target facts — `edha-note` carries static text only. The engine's own comment at
   **L4662** says of that row: *"what still needs a payload H1 cannot supply"*. **Vital Diagnosis**
   needs the identical thing (`edhaGnosisRevealLines`, L9573) — and its *classified* mechanic, the
   Diagnosed mark, has been on its document as `edha-apply-status` all along, wired generically
   through the mark sweep at L977–988. It was pointed at the wrong line, exactly the Forge Construct
   shape §9n named. **Build once, move both.**
2. **An exclude-skills field on `edha-test-rider`.** That handler's `mode` hint has claimed since
   07-24j that it is *"also what Frenzied Tempo needs"*. It is not. The engine grants advantage on
   Presence tests **excluding the leyline colour skills** (L5464), and `black` **is** a Presence
   skill (L100). The handler offers `whenAttribute` (comma-list) and `whenSkill` (a **single** id,
   positive match) — there is no way to express "Presence except these five". Authoring
   `whenAttribute: "pre"` alone would **widen** the talent onto Black casts: a balance change dressed
   as a refactor (§9m q11).

### The handler inventory, measured while we were in there

**41 registered handler types; 18 have a stub executor.** Every one of the 18 has a real reader — no
dead handlers — but the distinction matters and was not written down anywhere: a config-only handler
**cannot be a payload**, only a passive read from somewhere else. **H8 `edha-watch` is one of them**
(L15451, `executor: async function () {}`, swept by `edhaWatchersOfRule` at L1585). That is correct
by design — H8 is a *gate* — but it means **every one of the 44 talents whose `needs` names H8 still
requires a separate, real payload handler**, and `needs` records H8 as though it were the whole
answer. This is the single largest reason the ready column overstates.

⚠️ One reader is itself name-keyed: **L1045**, `dealer?.item?.name === "Overgrowth"`, inside the
`edha-overflow-thp` branch. Overgrowth reads as ready (bucket 1b, `needs: []`) and already carries
the rule; what holds it is a name test in the *reader*. LESSONS.md §2's "grep the helper's BODY for
talent names" caught it.

### Delivered — H24 built, 3 conversions, ratchet 131 → 128

**The measurement named a build, so the pass built it.** `edha-reveal` (H24) is the payload half of
scouting: given a creature and a comma-list of fact ids (`hp` · `conditions` · `defenses` ·
`lowest-attribute` · `lowest-defense` · `below-half`, with a `hideDefenses` subtraction) it posts the
facts as card text, whispered by default. `edha-note` carries only STATIC text, which is why "tell me
this creature's numbers" had nowhere to live.

Its pure half, `edhaRevealFacts`, returns the **clauses** and lets the caller join them — which is
what lets one implementation serve Vital Diagnosis's report (`"; "`) and Sharp Eye's menu (`" · "`).
`edhaGnosisRevealLines` now delegates to it, so there is one implementation; **`tests/reveal.test.js`
pins that its output is byte-identical**, because Studied Mark and The Final Study still call it and
a drift there would silently change cards on talents this pass never touched. Eight cases,
**mutation-checked both ways** — breaking the `<=` boundary fails 1, disabling the `hideDefenses`
filter fails 2 (including the byte-identity pin, which is the proof it actually guards Studied Mark).

- **Sharp Eye** (Hunter) → `edha-def-test` (per vs cog) on `use` + `edha-reveal` on
  `edha-test-success`, `target: victim`. That split is exactly what the retired `EDHA_HEROIC_DEFTESTS`
  row was — a gate H1 already owned and a payload it never did. **The table is now empty.**
- **Vital Diagnosis** (Life) → `edha-reveal` on `use`, appended to the `edha-apply-status` rule it
  already carried. Confirms the §9n prediction outright: **its classified mechanic was already
  authored**, and the row was pointed at the wrong line.

**And 1 conversion that needed no build — Reckless Momentum (Red).** Engine-only; no rebuild for the
engine half, but the authored rule means **PACK REBUILD + ⟳ Sync**. It is the pass-I shape again: a
registered field with no dispatch site. `edha-next-test-mod`'s `plotDie` hint has named this talent
since **07-24k** and nothing ever wired it. The retired case (L5500–5503) called
`edhaGrantPlotDie(actor, {skill: null, source})`; the handler's field calls the same helper with
`source = item.name`. Verified identical, including that **no `nextTestMod` entry is written** — the
executor gates that on `mode || formula` and this rule sets neither.

⚑ **A pre-existing card-vs-engine drift, NOT introduced here and NOT silently fixed.** The card reads
*"When you succeed on a Physical test, spend Opportunity to roll the Plot Die on your next test this
turn."* The retired engine case checked **neither** the success **nor** the Physical attribute, and
never deducted the Opportunity. The new rule reproduces that exactly rather than re-balancing the
talent behind a refactor. **Ben's ruling wanted:** tighten the rule to match the card (a real
tightening — `edha-next-test-mod` has no success gate, so this needs the H1 test-success event), or
correct the card to match ten months of play? Recommended default: **correct the card**, the
Withering Ray call.

#### ⛔ WHAT ACTUALLY HAPPENED (07-25) — the ninth correction in a row, and the first with a named mechanism

| predicted | delivered | why |
|---|--:|---|
| "67 read ready" | **64** | miscount; bucket 3 double-counted |
| session 4 = "?? of 15 bucket-1b" | **1** | the 1b column was never the constraint — 3 of the 15 are dealer-side, 4 always-active |
| conversions | **3** | 33 of 64 cannot hold a rule at all; 48 of the rest are multi-mechanic. The 3 that moved: one field built-and-never-wired, and two freed by BUILDING the payload the sweep named. |

**The mechanism, finally named.** Every previous over-estimate was explained as *"`needs` records the
gate, not the payload"*. That is true but incomplete — it implies the missing piece is always a
handler. It is not. **Two of this pass's three blockers are not about payloads at all**: a takeover
that cancels the event, and an activation type that has no event. Those are properties of *how the
talent is invoked*, and no handler-demand column can ever see them, no matter how carefully it is
maintained. **The readiness question is four legs, not three: executor / schema field / event / and
is the event reachable at all.**

**What this changes for scheduling.** Stop scheduling by handler demand. Schedule by **takeover set**
— nine Sets hold 15 ready talents plus most of the not-yet-ready ones in the same trees, and each Set
is one coherent dismantle. That is a better-shaped atom than any handler, and it is the first thing
SESSION_PLAN should offer after the two named builds above.
