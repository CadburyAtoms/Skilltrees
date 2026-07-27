---
name: talent-migration
description: Run one pass of the EDHA iron-rule-2b migration in the Skilltrees repo — moving talents off name-keyed engine dispatch (`item.name === "X"` / `edhaOwnsTalent(actor, "X")`) and onto their own `system.events` / `effects` so they are editable on the Events and Effects tabs in Foundry. Use whenever the task is to convert talents, shrink the name-keyed ratchet in `scripts/name-keyed-allowlist.json`, build a handler, migrate a marker LEDGER, or continue "the migration" / "the next rule-2b pass". Convert a whole PATH (tree) per session and build whatever handler that needs inline — read SESSION_PLAN.md for which path is next. Do NOT run a measuring or scouting pass; the deliverable is converted talents.
---

# Talent migration — convert a PATH per session

**The deliverable is talents Ben can open in Foundry and edit on the Events tab.** Nothing else
counts. Not a measurement, not a re-classification, not a better plan. **Conversions.**

**Rewritten 2026-07-25 after Ben's correction**, which is the most important line in this file:

> *"I need you to be making more progress per session… Each session needs to be making more than one
> or two clicks on the ratchet — we should be wiping out a lot at a time. I don't know why this has
> turned into 21 sessions of slop. We had a plan."*

He is right, and the cause was in this skill. The old version opened with two phases of *choosing*
and *scouting* before any code, and told you the columns lie (true) and that estimates have always
been wrong (true) — and the effect was sessions that spent their whole context proving the plan
wrong and converted **one talent**. The analysis was never the bottleneck. **Handlers are.**

---

## The rule that replaces all the old planning advice

**Pick ONE path (tree). Convert every talent in it. Build whatever handler that needs, inline.**

Not "pick the cheapest atom". Not "scout first, convert what is real". A path. Start to finish.

**TWO paths in one session is allowed — and expected — when both paths' blocking builds are
already RULED and the pairing adds at most one ledger** (Ben, 07-25, after passes R and S each
cleared ~15 talents with room to spare). STRICT ORDER: finish path 1 completely — converted,
ratchet shrunk, gates green — before opening path 2, so a surprise multi-mechanic talent degrades
the session to one clean full clear, never two half-converted trees. A path capped by the
one-ledger rule (Fate) pairs badly; two ledger-free paths pair best.

- **A session that converts fewer than ~5 talents has gone wrong** — stop and ask what you are doing
  that is not converting. The only acceptable low-count session is one that built a large handler
  which lands the path's talents in that same session.
- **A missing handler is the work, not a blocker.** If a talent's behaviour has nowhere to live,
  *write the handler*. Do not file it, rank it, or add it to a demand column. Ben's framing:
  *"at this point there should be no gaps in the proposal, it just might not have been built yet."*

- ### 🔴 BUILD IT, DON'T BLOCK IT.
  **If you can state a recommended default, you have your answer — implement it.** Do not end a
  session with a question you already answered. Ben, 07-25, on being asked whether Reckless
  Momentum's card or its engine was canonical after the session had itself recommended an answer:
  > *"Stupid question that you answered yourself above. Build it, don't block it."*

  **The card is the SPEC.** §9m q11 settled this and it does not need re-asking per talent: *the
  tree as documented is the spec, and a handler's limitation is never a reason to narrow a talent.*
  So when a conversion turns up a card-vs-engine drift, the default is **build what the card says**
  and widen the primitive to allow it. Reckless Momentum's card demanded a success gate, a Physical
  gate and an Opportunity cost that the engine had never enforced; the fix was to move it onto the
  Opportunity menu and add one `whenAttribute` field, which took minutes.

  **A ⚑ for Ben is for something you genuinely cannot decide or cannot verify** — a live-Foundry
  behaviour, a balance judgement with no precedent, an invented-content question. It is **not** for
  a call the docs already make, and it is never a way to end a session tidily. Asking costs a whole
  round trip of his time; building costs you ten minutes.
- **Never spend a session measuring.** If a survey is genuinely needed it is ten minutes inside a
  conversion session, and it ends the moment it names the handler to build.
- **Do not re-derive the architecture.** It is in ENGINE_INDEX and the docs. Read, don't rediscover.

### Why converting a whole path is CHEAPER, not more expensive

This is the part the old skill had backwards. Surveying 130 talents means reading 130 unrelated
engine sites. **One tree is one contiguous engine section with one vocabulary**, and its talents
share helpers, so the second talent costs a fraction of the first. Path-at-a-time is both more output
*and* less context. The 07-25 pass proved it twice: the four White Bulwark reactions were one handler
and one hour, after a whole session of surveying had produced one talent.

---

## The loop

### 1. Open the path
Read the tree's engine section (its `switch (item.name)`, its helpers, its watchers) and its authored
overlay. **One read, then start converting.** ENGINE_INDEX is the primitives map — grep it instead of
the engine.

### 2. Check the takeover set FIRST
**Nine of the fifteen trees cancel their own talents' `use()`.** All 19 `preUseItem` hooks end in a
bare `return false`. If your path has one — `EDHA_CHAOS_TALENTS` L9961, `EDHA_FATE_TALENTS` L10395,
`EDHA_SOV_TALENTS` L10842, `EDHA_DEATH_TAKEOVER` L11314, `EDHA_CIV_TAKEOVER` L11903,
`EDHA_POWER_TAKEOVER` L12522, `EDHA_GNOSIS_TAKEOVER` L13026, `EDHA_ORDER_TAKEOVER` L13865,
`EDHA_DESTRUCTION_TALENTS` L8995 — **removing the name is step one of converting the talent**, and
the Set going empty is how you know the path is done. Skip this and you will author perfect rules
that never fire, on a tab that looks perfectly correct.

Also check `activation.type`: `none` means no `use` event exists, so the rule needs an
engine-detected event instead (`edha-pre-test`, `edha-pre-deal-damage`, `edha-watch-rule`,
`edha-combat-timing`, `edha-draw-mana`).

### 3. Group the path's talents by SHAPE, then write one handler per shape
This is where the bulk comes from. Talents that look unrelated on a list are usually three or four
shapes. Read the engine blocks side by side and the shape is obvious — the four Bulwark reactions
were each *watch → gate → amount → action → cost → prompt*, already posting through a generic card
poster, with only the selection and the spec hard-coded.

**The tell that a shape is ready to become a handler:** the blocks differ only in *values*. Then the
values are schema fields and the handler is mostly deletion.

**When you build one:**
- One generic handler in `register-skills.js`; never a second script (iron rule 2a).
- **Make the dispatcher ANNOUNCE, not hand-list.** Sweep rules (`edhaWatchersOfRule(type)`), never
  names. A dispatcher that hand-lists reproduces the bug one level up.
- **A field that can REFUSE a use cannot live in the executor** — executors run after the cost is
  charged. Use a `preUseItem` veto (the H1/H3/H12 shape).
- **In a multi-step write, the step that can REFUSE runs before the step that COMMITS.**
- **Widen, never narrow.** If the card says something the rule cannot, that is a build item. A
  conversion that quietly narrows a talent is a balance change dressed as a refactor (§9m q11).
- **Config-only is fine when something else reads the rule** (a watcher, a wrapper, a pre-roll
  injector). It is *not* fine as a payload — an empty executor cannot be the thing that happens.
- Ship a **pinned test** for any new pure helper, **mutation-checked both ways**: break it, watch the
  test fail, restore.

### 4. Author the rules
```bash
node scripts/author-rules.js <payload.json> --dry-run   # ALWAYS dry-run first
node scripts/author-rules.js <payload.json>
```
Ids written as `"seed:SomeName"` expand to 16 chars and are collision-checked. CRLF and
trailing-newline state are preserved. `"_append": true` for a talent that already carries rules.
Verify the write afterwards — talents nest under `.talents`.

**Reproduce behaviour exactly.** If the retired code did not check something, the rule does not check
it either; flag the drift for a ruling rather than fixing it silently inside a refactor.

### 5. Shrink the ratchet
`lint-refs.js` pass 7 names what to remove. Delete each converted talent from **both**
`scripts/name-keyed-allowlist.json` and `EDHA_RULE_2B_CLASSIFICATION.json`, then recompute `split`
and every `handlerDemand.<key>.consumers` (`consumers` counts **bucket-2 only**; a handler whose
consumers all converted in the same pass legitimately reads 0 — say so in its `verdict`).

### 6. Gates
`npm run gates` **fails on Ben's box** (it calls `python3`; the interpreter is `python`). Run them
individually. **Never chain with `;` or pipe through `tail`** — both mask the exit code.

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
`validate-packs.js` is **CI-only** and is the only real proof the authored data survives the
pipeline. After pushing: `gh run list --branch <branch>` and read the **Pack build + validate** step.

### 7. Close out — SHORT
A dated delta at the top of `EDHA_FOUNDRY_HANDOFF.md` (update the ratchet count), checklist rows under
the next `2b<LETTER>` prefix plus the DEPLOY STATE count, new primitives into `ENGINE_INDEX.md`, ⚑ on
anything you could not self-verify, `node scripts/build-dashboard.js`, small themed commits, and the
PR body.

**PR #128's body is deliberately SHORT (Ben, 07-25): a status table + ONE row per pass.** Refresh
the "Where it stands" numbers, add one row to the passes table, refresh the handlers list and the
deploy/verification lines — and STOP. Do NOT re-add per-pass detail sections: detail belongs in the
handoff delta and audit §9n, and the pre-condensation long form lives in the PR's edit history.
This is an efficiency rule, not a style preference — the body is round-tripped through every
session's context.

**Docs are a paragraph per thing, not an essay.** The audit doc has nine "what actually happened"
post-mortems and they did not make one talent editable. **If the write-up is longer than the diff,
the session was the wrong shape.** Record a correction in one line and move on.

---

## The gotchas that actually bite

- **🔴 BASH EATS BACKTICKS.** Any `node -e "…"` or heredoc containing markdown backticks gets
  command-substituted and writes MANGLED content — this bit again on 07-25. Put text in a FILE, or
  use the Edit tool. **Always verify a scripted text write.**
- **A shell anchor containing a newline is LF while the docs are CRLF** — `indexOf("\n## Heading")`
  matches inside a `\r\n` pair and splits it. Anchor on text with no leading newline.
- **The Write tool emits LF**; the repo's docs are CRLF. Use Edit for existing files.
- **Grep a candidate's name in cancel/takeover Sets, not just dispatch.**
- **Before reusing a helper, grep its BODY for talent names.** A generic signature with a name-keyed
  body is not reusable — `edha-overflow-thp`'s reader still tests `item.name === "Overgrowth"`.
- **Count the talent's MECHANICS, not its call sites.** Apex Form has five; converting the on-use
  case alone would ship a talent whose other four-fifths silently stopped.
- **Deleting a hook can delete a DIFFERENT talent's only presence.** Check what else lived in the block.
- **A boolean helper that folds "unknown" into one answer cannot be inverted** — `!edhaIsFastTurn`
  fails OPEN.
- **When you delete a name-keyed branch, ask what it was ENFORCING** and re-provide it generically.
  Iron rule 3 does not pause during a migration.
- **Check deploy state before believing a bug report.** Ben's machine is behind `main`; a "wrong text
  / old behaviour" report on a converted talent is a deployment gap until proven otherwise. If Ben
  reports bench results, invoke `test-pass-fixes` first.

## Where things are

`SESSION_PLAN.md` — the paths, in order. `LESSONS.md` — what earlier passes paid for; read it for the
**traps**, not for estimates. `ENGINE_INDEX.md` — the primitives map, grep this instead of the engine.
`EDHA_RULE_2B_CLASSIFICATION.json` — the per-talent record; **it records the GATE, not the payload, so
treat it as a hint and read the engine.** `EDHA_EDITABILITY_AUDIT.md` §9m = rulings (q1–q15 settled,
do not re-ask), §9n/§9o/§9p = history.
