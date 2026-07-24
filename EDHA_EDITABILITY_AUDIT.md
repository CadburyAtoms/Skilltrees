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

## 9. THE CLASSIFICATION — all 221 names, done 2026-07-24 (§6's first job)

Every name on `scripts/name-keyed-allowlist.json` was classified against the engine's **31
registered handler types** (`registerItemEventHandlerType`) and **10 event types**, reading the
per-tree section-header ledgers (the iron-rule-3 records) plus the code at each name's call sites.
All 221 have a live code site; none is already dead.

### 9a. The split

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

### 9h. Reproducing this

The classification is derived, not hand-listed: `scripts/name-keyed-allowlist.json` ∩ the built
talent names, with each name's code sites extracted using the **same comment-stripping** lint pass 7
uses (so the section-header ledgers don't read as call sites). Handler vocabulary comes from
grepping `source: "edha-content", type: "..."` in the registration block (~L14597–15040).

⚑ **Not verified in Foundry** — nothing here changes behaviour, but the handler *designs* in 9c are
paper designs. H1's interaction with the existing contest queue (`edhaQueueContest`, which already
owns the "capture the owner's next roll" half) is the one to scrutinise before building: H1 should
almost certainly *wrap* that queue rather than duplicate it.
