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

1. **Does the ENGINE-OWNED exit need a cue rule in every case?** Requiring one guarantees a
   non-empty Events tab (so the talent never *looks* broken), but it adds a rule that does nothing
   mechanical. Ben's call on whether that is worth it.

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
