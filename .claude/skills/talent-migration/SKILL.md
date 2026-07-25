---
name: talent-migration
description: Run one pass of the EDHA iron-rule-2b migration in the Skilltrees repo — moving talents off name-keyed engine dispatch (`item.name === "X"` / `edhaOwnsTalent(actor, "X")`) and onto their own `system.events` / `effects` so they are editable on the Events and Effects tabs in Foundry. Use whenever the task is to convert talents, shrink the name-keyed ratchet in `scripts/name-keyed-allowlist.json`, build one of the numbered handlers (H1…H23), migrate a marker LEDGER, or continue "the migration" / "the next rule-2b pass". Read SESSION_PLAN.md for what to do next and LESSONS.md before estimating anything — sixteen passes have measured what goes wrong, and the classification's `needs` column has been optimistic in nearly every one.
---

# Talent migration — one rule-2b pass, end to end

**The goal, in one sentence:** every talent's automation lives in its own `system.events` /
`effects`, so Ben can see and edit it on the Events and Effects tabs in Foundry. The engine provides
*generic* handler types that read those rules; it must never branch on a talent's **name**.

`item.name === "X"` and `edhaOwnsTalent(actor, "X")` are the smell. They bind behaviour to a string,
so **a rename silently unwires the talent and an edit in Foundry does nothing** — the tab is empty
because there is nothing on the document to show. Hooks are not the problem: a document-driven talent
uses the same hooks and the same engine file. The difference is only what the hook consults once it
fires.

**The ratchet.** `scripts/lint-refs.js` **pass 7** freezes the talent names the engine mentions in
code into `scripts/name-keyed-allowlist.json`. It may **shrink, never grow**, and a listed name that
is no longer in the engine is also an error. 221 names on 2026-07-24; see SESSION_PLAN.md for the
current count. Comments are stripped before scanning — the engine's tree-section headers list talents
by name on purpose, and that IS the iron-rule-3 ledger.

> **Read `LESSONS.md` in this folder before you estimate or schedule anything.** It is short and every
> entry cost a pass to learn. **Read `SESSION_PLAN.md`** for the remaining scope and what is next.

---

## Phase 0 — orient without re-deriving

Read these, in this order. Do **not** re-scan the 16k-line engine to answer a question one of them
answers.

| source | what it is |
|---|---|
| `SESSION_PLAN.md` (this folder) | the remaining scope, partitioned into session-sized atoms, and what is next |
| `LESSONS.md` (this folder) | the corrections sixteen passes paid for. Read before estimating. |
| `EDHA_RULE_2B_CLASSIFICATION.json` | the per-talent record: bucket, `needs`, `why`. **A plan, not a forecast.** |
| `.claude/skills/leyline-tree-authoring/ENGINE_INDEX.md` | the primitives map. Grep this INSTEAD of the engine. |
| `EDHA_EDITABILITY_AUDIT.md` §9n / §9o | the conversion log and the build-priority table with its seven "what actually happened" corrections. §9a–§9g are SUPERSEDED — never quote their numbers. |
| `EDHA_EDITABILITY_AUDIT.md` §9m | the ruling log. **q1–q15 are all SETTLED AND BUILT — do not re-ask them.** Add new questions fresh. |
| `CLAUDE.md` iron rules | 2a (one engine), 2b (behaviour on the talent), 3 (no silent manual), 4 (gates), 5–6 (docs, commits), 7 (walkable trees) |

**Check deploy state before believing any bug report.** Ben's machine is usually behind `main`;
`EDHA_FOUNDRY_TEST_CHECKLIST.md`'s DEPLOY STATE section is the truth, and only Ben can advance it. A
"wrong text / old behaviour" report on a converted talent is a deployment gap until proven otherwise.
If Ben reports bench results, invoke `test-pass-fixes` **before touching anything**.

---

## Phase 1 — pick the ATOM, not the handler

**This is the single most repeated planning error in the project.** "How many talents does handler H
unblock" has been the wrong question every time it was asked, because the unit of conversion is
usually bigger or differently-shaped than a talent. Five atom kinds have been identified by being got
wrong first:

| atom | example | why it converts together |
|---|---|---|
| **LEDGER** | Order's `covenants`, Fate's `snares` | convert one writer and the ledger exists in two places; every un-migrated sibling reads the other array and sees an empty list |
| **MECHANIC** | Kneel (a test + a movement veto + a rider) | converting one third ships a talent whose other two thirds silently stopped working |
| **WATCHER** | Black's three focus passives | three loops inside ONE function sharing its preconditions and bookkeeping |
| **CALL SITE** | Crown of Thorns | the coupling was one named call; cutting it at the CALLER let the callee convert alone |
| **SHAPE** | the Always-Active passives | unrelated on the greedy list; one problem — a talent whose behaviour had nowhere to live |

**Before scheduling any talent, ask what FUNCTION it lives in and who else lives there.** A coupling
through a named call can often be cut at the caller — make the call site *announce* rather than route
to a name, and the callee converts alone. Try that before batching N talents together.

⚠️ **One marker LEDGER per session** (Ben's ruling, §9m q7). A half-converted ledger is the one
failure mode that silently empties a live list at the table. A session that finishes its ledger early
takes the next-cheapest **non-ledger** work — it does not start a second ledger.

---

## Phase 2 — SCOUT before you build

Ben has approved subagents and they are the highest-leverage habit in this project. On 07-24v, five
read-only scouts proved **0 of 6 "ready" talents were ready** and found a shipped bug — before a line
was written. They have changed what got built in every pass since.

**The three-leg test — apply it to every talent before trusting its row.** `bucket` and `needs` were
assigned by asking whether a handler is *registered*. That is not the same question as "can this
behaviour be expressed". Name all three or it is not ready:

1. **the EXECUTOR** — does the handler have a real body? `edha-heal-cut` and `edha-overflow-thp` are
   registered with `executor: async function () {}`. A config-only handler **cannot be a payload**,
   only a passive read from elsewhere.
2. **the SCHEMA FIELD** — does the gate the talent needs exist *and* match? A scalar compare where
   an authored comma-list was expected matches nothing, silently.
3. **the EVENT** — does anything fire? Nothing fires "you paid ritual HP", and a talent whose
   `activation.type` is `none` can **never** fire `use`, so it can hold no rule on that event.

> **Corollary: a talent whose classified mechanic is already authored is pointed at the wrong line.**
> Forge Construct's summon spec had been on its document for months; a hidden sustain gate was the
> real blocker. Bucket 1 was measured as 6 and turned out to be 0 for exactly this reason.

**Scout rules.** One scout per atom, read-only, `Explore` or `general-purpose`. Demand **line numbers
and quoted code**, and an explicit "UNVERIFIED" rather than an inference. ⚠️ **Do not edit the engine
while scouts run** — your edits invalidate the line numbers in their reports. **Verify every
load-bearing claim yourself** before building on it.

**Always ask a scout, per candidate:**
- every hit for the talent's name, classified: dispatch / cancel-or-takeover Set / comment / label
- **is the name in a takeover or cancel Set?** Leave it there and `use` never fires, so every authored
  rule is inert while the Events tab looks perfect
- does its call site mention any **other** talent's name?
- **what else lives in the block you would delete?** Removing one hook has nearly deleted a different
  talent's only presence — which would leave it with an empty document AND no engine code, the state
  rule 2b calls a bug
- what is the talent's CURRENT authored `events` / `effects` / `activation`?
- **before reusing a helper, grep its BODY for talent names.** A generic *signature* with a name-keyed
  *body* is not reusable. This has been wrong three times.

---

## Phase 3 — build

- **Iron rule 2a: one engine.** All runtime code in `module-src/scripts/register-skills.js`. Grep
  `ENGINE_INDEX.md` first. A genuinely new mechanic adds ONE small generic handler / flag / event
  type — never a bespoke per-tree subsystem and never a second script.
- **Primitives over point fixes.** Would ≥2 trees want this shape? Build it generic, register it,
  wire the reported talent as the first consumer, and index it.
- **A field that can REFUSE a use cannot live in the handler's executor.** An executor runs on `use`,
  i.e. **after** the system has charged the cost. Every "nothing spent" gate needs a `preUseItem`
  veto — the shape H1 / H3 / H12 / `edha-next-test-mod` / `edha-summon` all carry.
- **In a multi-step write, the step that can REFUSE runs before the step that COMMITS.** H3 committed
  its ledger then marked the creature; a failed mark left a phantom entry that reconcile-on-read hid
  for ever, silent in three directions.
- **Widen, never narrow.** If the card or the tree header says a thing and the new rule cannot, that
  is a **build item**, not a trade-off. A conversion that quietly narrows a talent because the generic
  primitive cannot express it is a balance change dressed as a refactor (§9m q11).
- **When you delete a name-keyed branch, ask what it was ENFORCING** and re-provide that generically.
  Iron rule 3 does not pause during a migration.
- **Re-litigate "manual" every pass.** If you can *name the specific hook*, it is backlog, not manual.
  Calculated Patience was "manual — there's no fast/slow-turn hook" while the pre-roll rider had been
  reading turnSpeed all along.
- **When you add a value to an existing trigger's vocabulary, ask what the EXISTING consumers match
  against** — not just whether the new one works. A second moment on a dispatcher is a double-fire
  waiting to happen.
- **Prefer a STATUS to a flag for a scene-scoped arm.** Nothing lets a rule write an arbitrary flag,
  so a flag keeps the arming engine-owned; a status is writable by `edha-self-status`, readable by
  `edha-watch`'s `requireSelfStatus`, and visible on the token.
- **Engine-only vs pack-rebuild (iron rule 1).** Engine changes need only F5. Authored
  `events` / `effects` / text / `img` changes need a **pack rebuild + ⟳ Sync**, which only Ben can
  run. Say which in the commit message AND the delta header. Prefer engine-only when both would work.

---

## Phase 4 — author the rules

Use the tooling. It removes three gotchas from the loop:

```bash
node scripts/author-rules.js <payload.json> --dry-run   # ALWAYS dry-run first
node scripts/author-rules.js <payload.json>
```

Write ids as `"seed:SomeName"` and it expands to 16 alphanumeric chars, asserts the format, and checks
collisions **after** truncation. It preserves each file's CRLF and trailing-newline state (six of the
21 authored files have **no** trailing newline). Pass `"_append": true` for a talent that already
carries rules.

It **refuses** a talent that already has rules unless you append — by design. To edit an existing
rule in place, write a small script and check the JSON round-trip is byte-identical first
(`JSON.stringify(parsed, null, 2)` + the file's own CRLF/trailing-newline state) so the diff stays
minimal instead of rewriting the whole file.

**Always verify a scripted write afterwards.** Authored files nest talents under `.talents`, not at
top level.

---

## Phase 5 — gates

`npm run gates` **FAILS on Ben's box** (package.json calls `python3`; the interpreter is `python`).
Run them individually. **Never chain with `;` or pipe through `tail`** — both mask the exit code, and
both have already let a failing lint into a commit.

```bash
node --check module-src/scripts/register-skills.js
node scripts/validate.js
node scripts/lint-refs.js
node tests/run.js
node scripts/check-2b-classification.js
node scripts/build-dashboard.js --check
node scripts/build-canon-codex.js --check
node scripts/build-player-primer.js --check
python tests/audit_parser_test.py
python .claude/skills/leyline-tree-authoring/audit.py <tree>
```

- `audit.py` covers leyline + deity only; "envoy: NO FILE" is expected. A deity tree returning
  `[WARN] … extract-only` at exit 0 is a pass, not a failure.
- **`validate-packs.js` cannot run locally** (needs `classic-level`, not installed). **CI runs it**,
  and its "Pack build + validate" step is the only real proof the authored data survives the pipeline
  — the 16-char rule id constraint in particular. After pushing:
  `gh run list --branch <branch>` and read the step. Do not claim it ran locally.
- **Every new pure helper ships with a pinned test in `tests/`, mutation-checked BOTH ways.** Break
  the implementation deliberately, confirm the tests fail, restore. A gate nobody has watched fire is
  a failure mode this repo has already had twice.
- **Expect gates to break as talents leave the engine, and treat the breakage as a finding.** Three
  have needed teaching so far. Worse: one *passed while being wrong* — measure before changing a gate.

---

## Phase 6 — shrink the ratchet

`lint-refs.js` pass 7 tells you the new count and names anything stale. Then remove each converted
talent from **both**, because `check-2b-classification.js` cross-validates them in both directions:

1. `scripts/name-keyed-allowlist.json`
2. `EDHA_RULE_2B_CLASSIFICATION.json`

⚠️ **Recompute `split` and every `handlerDemand.<key>.consumers` from the per-talent map** — the
checker recomputes both and errors on a mismatch. `handlerDemand` is a RICH map of
`{consumers, trees, verdict}`; do **not** flatten it. `consumers` counts **bucket-2 entries only**, so
a handler serving bucket-1b talents legitimately reads 0. Tags come from `key.split("_")[0]`, and every
tag named in any `needs` must have a `handlerDemand` entry.

**Record corrections rather than quietly fixing them.** A mis-filed `needs` that gets silently
repointed loses the finding; update the `why` string to say what was wrong and why.

---

## Phase 7 — close out (iron rules 5 & 6)

- a **§9n conversion-log row** in `EDHA_EDITABILITY_AUDIT.md`, plus the pass's lessons written as
  prose blocks — this is where the next session's estimate comes from
- a **§9o "what actually happened" block** if the pass executed a planned order: predicted vs
  delivered vs why. Seven exist; they are the most valuable thing in the doc.
- a **dated delta at the TOP** of `EDHA_FOUNDRY_HANDOFF.md`, and **update the ratchet count in its
  header paragraph**
- **checklist rows** in `EDHA_FOUNDRY_TEST_CHECKLIST.md` under the next free `2b<LETTER>` prefix, plus
  the DEPLOY STATE talent count and row list. Retire rows the pass invalidated.
- **⚑ on anything you could not self-verify** without Foundry. Sessions here cannot launch it.
- **new primitives into `ENGINE_INDEX.md`**, and fix any entry the pass made stale
- rebuild generated docs: `node scripts/build-dashboard.js` after touching any source doc; the primer
  after any description change
- **small themed commits**, one per fixed item; state engine-only vs rebuild-needed; **no model
  identifiers in commit text**
- update the migration PR's body — it is the integration record

---

## The gotchas that actually bit

- **🔴 BASH EATS BACKTICKS.** Any `node -e "…"` or heredoc containing markdown backticks gets
  command-substituted and writes MANGLED content. Put replacement text in a FILE, or use the Edit
  tool (it preserves CRLF correctly). **Always verify a scripted text write afterwards.**
- **A scripted rename can hit a homonym.** Enumerate every match and rewrite the intended LINES, not
  the pattern.
- **When deleting an engine block, ASSERT the bounds before splicing** — line numbers shift under you.
  Prefer the Edit tool with exact strings, which is inherently bounded.
- **A boolean helper that folds "unknown" into one of its answers cannot be inverted.** `!edhaIsX(...)`
  where `edhaIsX` has an early `return false` for missing state flips fail-closed into fail-open.
- **Grep a candidate's name in cancel/takeover Sets, not just dispatch.**
- **`register-skills.js` is CRLF**; preserve each JSON file's trailing-newline state.
- **Deleting a hook can delete a DIFFERENT talent's only presence.** Check what else lived in the block.
