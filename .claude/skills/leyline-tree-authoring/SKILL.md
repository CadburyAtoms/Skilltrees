---
name: leyline-tree-authoring
description: Authoring, wiring, and auditing EDHA leyline AND deity talent trees in the Skilltrees repo (data/authored/leyline-<color>.json or deity-<name>.json + module-src/scripts/register-skills.js). Use when adding, wiring, reviewing, or checking a tree for cross-tree consistency — flavor/cost/icon/tag conventions, events-vs-effects choices, engine reuse, and "no silent manual card" documentation. Apply this before committing any tree so the 15 trees stay cohesive.
---

# Leyline tree authoring & consistency

The 15 trees must read and behave **as one product**: **5 leyline colors** (Black, White, Red, Blue,
Green — all done, the standard) **+ 10 deity trees** (Destruction wired first; the rest follow). This
skill is the standard distilled from auditing those trees. Apply it when authoring a new tree or
reviewing one — and run `audit.py` (below) before committing; it mechanically enforces the rules
that prose alone failed to (Green shipped opposed-test cards applied on use because nothing *checked*).

> **Sessions that start from Ben's in-Foundry test results** (bug reports, playtest notes, "X
> didn't work") should be driven by the **`test-pass-fixes`** skill — it owns the triage →
> root-cause → fix → docs loop and draws on this skill as the consistency standard.

A **leyline** tree has exactly **25 talents** (24 + 1 Leyline Attunement keystone) in **3
specialties**. A **deity** tree is shaped differently and its authored file is an *extract* — see
"Deity trees" below before wiring one.

## Where things live (the build/overlay model)

- **`data/authored/leyline-<color>.json`** — the per-talent *overlay*. `foundry-build.js`
  (`applyAuthorable`) overlays these onto generated talents, so authored fields win. Only these
  fields are authorable: **`description`, `activation`, `damage`, `events`, `effects`, `img`**.
  Structural fields (name, ids, prerequisites, folder, node graph) are generator-owned — never set
  them here.
- **`module-src/scripts/register-skills.js`** — the entire runtime engine (single tracked copy;
  the live module dir is mirrored on the Foundry machine via `scripts/module-src-sync.js`). All
  *name-based* automation and every generic handler lives here.
- **`data/talent-*.json`** sidecar tables — generator INPUTS for the broader EDHA catalog. Do **not**
  invent a new sidecar table for a leyline tree; the four reference trees wire through `events`/
  `effects` + the engine, not new tables.
- **Docs:** `EDHA_FOUNDRY_HANDOFF.md`, `EDHA_FOUNDRY_TEST_CHECKLIST.md` — the human-facing record of
  what is wired vs manual.

**Pack-rebuild rule:** changes to authored `events`/`effects`/`img`/text require a Foundry **pack
rebuild** (defer to the Foundry machine; say so in the commit). Changes that are *engine-only*
(register-skills.js, name-based wiring) need **no rebuild**. Prefer engine-only when you can.

## Deity trees (the remaining 10) — what differs from leyline

The 10 deity trees follow this skill's intent, but the mechanics differ from the leyline assumptions
above. **Destruction (Razkael) is the reference** — read its section in `register-skills.js` and
`data/authored/deity-destruction.json` before wiring the next one.

| Leyline | Deity |
|---|---|
| `data/authored/leyline-<color>.json`, all 25 talents authored | `data/authored/deity-<name>.json`, `_meta.atlas:"deity"` — an **extract** (`foundry-extract.js`) that carries **only talents with overrides** (Destruction = 9, not 25); name-based-only talents aren't in the file |
| Damage formulas authored per card | Same — formulas are already on the items; **read `item.system.damage.formula`**, don't reinvent |
| Tag `<Color>/<Specialty>.` from `data/leyline.json` | Tag **`<Tree> (<Deity>).`** e.g. `Destruction (Razkael).`; deity has **no `data/leyline.json`** entry, so specialty-drift can't be machine-checked |
| Build/pack: leyline pack | Build target **`foundry-build deity`**, pack **`edha-deity`** |

- **Signature subsystems:** a deity tree often has a bespoke mechanic (Destruction's *Charges*). The
  cardinal rule still holds — **compose existing primitives** (`edhaApplyBurstResults`, `edhaDropHazard`,
  the contest core, owner `setFlag` state, scene-end cleanup) in a **name-based engine section**;
  never add a new data handler or sidecar table. Destruction's Charge lifecycle is the worked example.
- **`audit.py` supports deity** (`audit.py <name>` resolves `deity-<name>.json`) but **skips the
  25-count and specialty-drift checks** (no generator source); flavor/silent-card/soft-laziness still
  run. Treat the deity gate as partial — hand-check tags/icons/specialty.

> **Engine map:** `ENGINE_INDEX.md` (this folder) lists the reusable helpers + signatures + engine
> facts (status ids, deflect, Construct detection). **Read it instead of re-scanning the 11,000+-line
> engine.**

## The cardinal rule: reuse the engine, do NOT build a side-engine

Automation has ONE home: `register-skills.js` and the generic handlers it already provides. When
wiring a new tree, **reuse, do not reinvent** (the Red header says exactly this). Existing primitives:

- Triggered payloads: `edha-triggered-effect` (damage / affliction / status / heal / resource),
  `edha-burst`, `edha-move`, `edha-push`, `edha-damage-rider`, `edha-test-rider`, rally stack.
- Test (dis)advantage: the `nextTestMod` flag (`edhaSetNextTestMod` + pre-roll injector), the Black
  `advTest`/`cogDisadv` flags, `plotDieNext`.
- Contests: the contest core — `edhaQueueContest` / `edhaContestWatch` / `edhaTryResolveContest`,
  `edhaReadDefense`, `edhaRollOpposedSkill`, `edhaPromptDC`, `edhaRewriteOrRelay`.
- Economies/infra: focus economy (Whispered-Doubt write pattern), Reserve + Temp HP infra,
  timed-status expiry (owner-relative end/start-of-turn), Draw Mana rider (`edhaDrawMana`).

If a behavior needs something genuinely new, add **one** small handler/flag to the engine and reuse
it — never a bespoke per-tree subsystem.

## events vs effects vs name-based vs manual — pick deliberately

| Use… | When | Rebuild? |
|---|---|---|
| **`effects`** (ActiveEffect) | passive, always-on stat change (max HP/focus, defenses, deflect) | yes (data) |
| **authored `events`** | a triggered/active rule the engine has a handler for, with per-instance values (formula, radius, status) | yes (data) |
| **name-based engine** (talent stays `events:{}`) | fixed-canon passive/active with nothing to tweak per-instance | **no** |
| **manual** | no Foundry hook exists (forced action/volition, willing-movement, narrative) | n/a |

- `effects` flags: `transfer:true` for unconditional auto-apply; **conditional** buffs ship
  `transfer:false` (drag onto the qualifying actor) or `disabled:true` (toggle on while it holds) —
  and say which in the effect `description`.
- Every authored `event` carries a `description` **and** a handler `note` that doubles as GM-facing
  documentation (what fires, manual caveats, "trusted (no auto-deduct)", "GM-applied", "resolve by
  hand", "owner-judged").
- Name-based is the default for White/Blue-style support/control trees ("ENGINE-ONLY; NO pack
  rebuild"). Don't add empty/placeholder `events` just to carry a note — document name-based + manual
  cards in the engine section header instead (below).

## No silent manual cards

Every talent must be accounted for in **at least one** of: an authored `event` note, a
`register-skills.js` tree-section header, or the handoff/checklist. A card that is wired nowhere and
documented nowhere is a bug. Each tree's engine section opens with a header comment that enumerates
what's wired and which primitives it reuses.

**Don't lean on "manual" — few cases are truly manual.** Anything not yet wired is split into TWO
lists, never one vague "manual" bucket (Destruction is the reference for this split):

- **Hooks/tools still to build** — a behavior that *could* be engine-wired but needs a hook/tool you
  haven't built yet. **Name the specific hook** ("per-Region follow on `updateToken`", "`combatTurnChange`
  Region-grow"). This is a backlog, not a verdict — default to building it, and reach for an existing
  pattern (e.g. ignore-deflect = bump the hit by `system.deflect.value`; "×3 vs Constructs" =
  `system.customType==="Construct"`; "fires when X drops" = the defeat HP-sync `updateActor` hook).
- **Truly manual** — genuine table narrative with no Foundry hook at all (forced volition,
  willing-movement, "structures/objects" that have no actor). Declare opposed-test ones as
  `CONTEST-EXEMPT: <name> — <reason>`.

Add the new tree's header in that format.

## "Kill soft laziness"

Contested/opposed tests must be **engine-resolved** via the contest core — not left as a "compare it
yourself / GM adjudicates" reminder card.

**The exact anti-pattern that slipped through on Green:** a card reads *"test Green vs. Survival. On a
success, the target is Slowed"*, and the engine **applies the status on use and trusts the player
rolled and won** ("auto on success — the player only uses the talent on a successful test"). That is
soft laziness even though the talent is *named* in the engine — being mentioned is not being wired.
The tell-tale phrasings in an engine comment: *"auto on success"*, *"trust the player"*, *"handled by
the activation"*, *"the player uses it only on a success"*. None of those resolve anything.

**The fix (do this, don't reinvent it):** route it through the contest core, mirroring Blue's
`Redirect Momentum`:

```js
edhaQueueContest(actor, "<color>", async ({ total }) => {          // captures the owner's next roll
  const opp = await edhaRollOpposedSkill(target, "sur");           // opposed SKILL → engine rolls the foe
  const ok = total >= opp;                                         // (or: total >= edhaReadDefense(target, "phy"))
  if (ok) await edhaApplyTimedStatus(target, "slowed", { owner: actor, expire: "target" });
  ChatMessage.create({ /* total vs opp, success/fail */ });
});
```

**A test in the card text is never a valid "Manual by nature" justification** — the contest core
exists. The only acceptable manual contests are ones with genuinely **no Foundry hook** (forced
action, willing-movement, narrative). Those don't get a lazy reminder card; they go in the engine
header's "Manual by nature" list **and** are declared with `CONTEST-EXEMPT: <Talent Name> — <reason>`
so the auditor (below) knows the omission is deliberate.

**What needs the contest core, precisely:** an opposed test against another creature's **skill**
(*"vs. Survival / vs. Athletics"*) — only the engine can roll the opponent. A test/attack against a
static **defense** (*"vs. Physical/Cognitive/Spiritual"*) or a color value is resolved by the base
attack/damage pipeline and is fine. `audit.py` hard-FAILs on the former; the latter still must
*gate its effect on the result* (compare to `edhaReadDefense`) rather than apply on use — the
auditor can't see that for you, so check it by hand.

## Adversary abilities — the same standard, first time (2026-07-16)

Adversaries are authored in `data/adversaries.json` and are subject to the SAME no-silent-manual
and kill-soft-laziness rules as trees. The Seeming shipped with current card text and a dead engine
case because none of this was written down — don't repeat it. **Read ENGINE_INDEX §"Talents on
adversaries" and §"GM cue cards" before wiring anything.**

**The wiring standard (Ben's ruling, 2026-07-16), enforced by `lint-refs.js` pass 5:** every
bespoke ability whose text names a trigger ("when…", "triggered…", "first time…", "on a hit…",
"every N rounds…") must carry ONE of:

1. **Native automation** — `attack`/`damage`/`heal` fields (the system rolls it), or
2. **An `events` rule** — the simplified array (`"events": [{event, handler, description?}]`,
   build mints the ids) using the same edha-* vocabulary as PC talents. Full automation
   (`edha-triggered-effect`, riders, `edha-self-status`, `edha-thorns`, `edha-next-test-mod`)
   when the effect is decision-free; **`edha-gm-cue` at minimum** when the decision stays at the
   table — the GM gets a whispered card at the named hook, which is the floor, or
3. **An explicit `NO NAMEABLE HOOK: <reason>` line in its text** — the reason must survive the
   Dread Presence test (the hook inventory GROWS; re-litigate every pass). The known forever-manual
   classes: NPC intent/targeting isn't data (Pack Tactics), the GM's miss/graze/hit adjudication
   isn't module-visible (Combat Training), cover/meaningful light is a table read (Veil).

A bare "GM-run" label satisfies nothing — lint fails it.

**The dispatch vocabulary is CLOSED — never invent a trigger (2026-07-19).** The Malcurr audit
found six cue rules using triggers that *look* plausible ("attack-hit", "attack-missed", "on-hit"
under `edha-apply-watch`) and are dispatched by NOTHING — schema-valid, gates-green, dead at the
table. Two more had shipped in the fens bestiary the same way: the pattern you're imitating in
`data/adversaries.json` may itself be broken, so author against THIS table, not against neighboring
entries. `lint-refs.js` pass 6 now extracts the engine's real `edhaCueRules(...)` call sites and
fails any cue outside them; the shapes are:

| You want a cue when… | Author exactly |
|---|---|
| the owner takes damage | `edha-apply-watch` + trigger `damaged` |
| the owner crosses an HP line | `edha-apply-watch` + trigger `hp-below` (+ `atFraction`; 0 = the drop to 0) |
| a same-side creature drops | `edha-apply-watch` + trigger `ally-drops` (+ `rangeFt`) |
| a hostile starts its turn (in range) | `edha-apply-watch` + trigger `enemy-turn-start` (+ `rangeFt`) |
| the owner's own turn ends (every N rounds) | `edha-apply-watch` + trigger `turn-end` (+ `everyNRounds`) |
| the owner's phantom copy breaks | `edha-apply-watch` + trigger `seeming-break` |
| the owner's DAMAGING item lands | **event `edha-on-hit`** + trigger `on-hit` — the event carries it, and it only fires when damage is actually dealt |
| a to-hit-only attack (grab) hits | **no hook exists** — no damage write happens; `NO NAMEABLE HOOK` line |
| an attack MISSES the owner | **no hook exists** — a miss writes nothing; `NO NAMEABLE HOOK` line |
| the owner Draws Mana (attuned block) | usually already ENGINE-NATIVE via the auto-embedded Key (green = click-place terrain); mark the trait `ENGINE-NATIVE VIA Draw Mana: <what rides it>` — lint verifies the named carrier exists |

**Seemings and `whenTargetFooled` (2026-07-19).** A `whenTargetFooled` damage rider reads a belief
ledger that only a seeming SOURCE writes — copying the Mistheron's rider without its source ships a
+1d6 that never fires (lint pass 6 now fails it). Two sources exist: the full phantom loop (an
*action* item named exactly `The Seeming` — copy token, client veil), and the lightweight
`edha-ambush-belief` rule carried on the seeming *trait* (no copy, no veil; on the owner's first
attack per target per scene the target rolls Perception vs the owner's `dcFrom` defense,
engine-rolled; `perceptionAdvantage: true` for frayed/imperfect seemings). Ambush predators
(Wrongwake, Stillback) want the lightweight one.

**Renamed adaptations of engine talents get engine ALIASES, never prose copies (2026-07-19).**
Ruling 40 renames a beast's adaptation (Herding Antlers ≠ Drive the Prey, Thorn Hedge ≠ Thorn
Field) — but the engine automation is name-keyed, so the rename silently orphans it. When an
adaptation's mechanics are an existing talent's mechanics, add the new name to the engine case
(`edhaOwnsThorn`, the Drive the Prey `item.name` alias) or reuse the talent's authored rule shape
(Sudden Wall carries Sudden Growth's `edha-burst` rule verbatim). The adaptation's card must say
which engine path runs it.

**Facts that will bite you if you skip the ENGINE_INDEX read:**
- Adversary abilities are **action-typed**; talent-grade automation reaches them only because the
  build flags them `adversaryTalent` and every engine gate goes through `edhaIsTalent` (lint
  pass 4 keeps it that way). If your new hook checks `item.type === "talent"` raw, your case is
  unreachable on adversaries — exactly The Seeming's bug.
- **Handler-type registration is load-bearing**: a rule whose handler type isn't registered via
  `registerItemEventHandlerType` is SILENTLY dropped by the DataModel, same as a bad 16-char rule
  id. New handler = registration + dispatcher + `lint-refs` will only catch the name if the
  literal appears in the engine, so grep after wiring.
- Opposed/DC tests on adversary abilities go through the **contest core** like everything else
  (Suture Cradle's auto-rolled Discipline is the worked example) — never "the GM rolled it".
- Adversary deploys are `foundry-build adversaries` + relaunch + **"⟳ Sync Adversaries from
  Pack"** (Actors-sidebar button, 07-18b — world-placed adversaries are snapshots, but the
  adversary sync now updates them AND their placed tokens in place; the PC ⟳ Sync still does
  not touch them, and re-drag is only the fallback). Say so in the commit message.

## Card-layer conventions (authored JSON)

1. **Flavor line** — every talent gets one italic `<em>…</em>` paragraph in **`description.value`
   only** (never `chat`/`short`). Voice: terse, second-person, aphoristic (e.g. *"The second blow is
   the one that breaks them."*). Insert it after the `Cost:` line (if any), before the body
   paragraph. Target 25/25 coverage, matching Black/White.
2. **Cost integrity** — the body `Cost:` header, the prose sentence, and `activation.consume` must
   agree. **Opportunity is never auto-deducted**: list it in the `Cost:` header but keep it out of
   `consume` (it's "trusted").
3. **Icons** — `img` must match the tree's color/specialty art cluster. No cross-color leftovers
   (e.g. a fire icon on a Blue card, a green healing cross on a Red attack).
4. **Specialty tags** — event `description`/`note` strings start with **`<Color>/<Specialty>.`**
   (e.g. `Red/Conflagration.`, `Red/Momentum.`). Color-prefixed; do not use `Specialty/TalentName`.
   `<Specialty>` must be the talent's **real** specialty — the `specialty` field in `data/leyline.json`
   (the generator source = the actual Foundry folder), **not a synonym or invention**. `audit.py`
   FAILs on any drift. Two such bugs shipped and were caught only in review: Green tagged
   `Green/Mending.` for *Restoration*, and Black tagged `Black/Hexes.` on three *Isolation* cards
   (`Sapping Hex`, `Severance`, `Spoils of Isolation`) — "Hexes" is not a Black specialty at all.
5. **Prose QA** — no typos, matched parens, subject/verb agreement, complete sentences.
6. **Parallel/twin talents** across trees (same effect, different color) must match on wording and
   durations. Disorient/timed statuses expire at the **end of the owner's next turn** (engine
   convention) unless intentionally otherwise.

## Pre-commit audit + the in-Foundry test worklist

**`audit.py` is the required gate.** It bundles the checks that used to be skippable copy-paste
heredocs (flavor + leak, 25-talent count, silent cards) plus two that catch real shipped bugs:
the **soft-laziness** detector and **specialty-tag drift** vs `data/leyline.json`. It exits non-zero
on any FAIL — nothing is grandfathered.

```bash
python3 .claude/skills/leyline-tree-authoring/audit.py <color|deity-name>              # gate; FAIL blocks the commit
python3 .claude/skills/leyline-tree-authoring/audit.py <color|deity-name> --checklist  # the in-Foundry test worklist
node scripts/validate.js                                                                # data validator (CI parity)
node --check module-src/scripts/register-skills.js                                      # engine parses
```

`<color>` resolves `leyline-<color>.json`; `<name>` resolves `deity-<name>.json` (e.g. `audit.py
destruction`). For deity the gate **skips the 25-count + specialty-drift checks** (no generator
source) — hand-check tags/icons.

**Passing the gate ≠ the talent works.** The gate only proves nothing is wrong *on paper*. The real
proof is the in-Foundry test — and that is what `--checklist` is for. It lists all 25 talents grouped
by their real specialty (= the Foundry folder) and, from hard signals (authored `effects`/`events`
and the card's own test phrasing), tells you what to click and watch. It flags (⚑) the rows where
**the engine does not guarantee the outcome** — these are where bugs hide, so spend your bench time
here:

- **opposed-skill test** — use on a foe and ROLL; confirm it fires only on success, never on a miss.
- **test-gated** (vs a defense / DC) — confirm the effect lands on a success and does nothing on a failure.
- **AE conditional** — confirm you must toggle/drag it and it holds only while it qualifies.
- **MANUAL** — no hook; confirm the card text is right and adjudicate by hand.

The non-⚑ rows (AE auto, authored events, name-based passives) still get a quick "does it fire?" pass.

What the auditor still can't see for you: Opportunity in the `Cost:` header but correctly absent from
`activation.consume`; icon art on the right color/specialty cluster. Spot-check those by hand.

`validate-packs.js` needs the Foundry machine's compiled LevelDB — skip it locally; note the deferred
pack rebuild in the commit instead.

## Commit hygiene

Small, themed commits (icons+prose, flavor parity, manual-doc, tag normalization) rather than one
mega-commit. State whether the change is engine-only or needs a pack rebuild. Keep the model
identifier out of commit text.
