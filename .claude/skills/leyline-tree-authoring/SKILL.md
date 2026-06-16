---
name: leyline-tree-authoring
description: Authoring, wiring, and auditing EDHA leyline talent trees in the Skilltrees repo (data/authored/leyline-<color>.json + module-src/scripts/register-skills.js). Use when adding, wiring, reviewing, or checking a leyline tree for cross-tree consistency — flavor/cost/icon/tag conventions, events-vs-effects choices, engine reuse, and "no silent manual card" documentation. Apply this before committing any leyline tree so the 15 trees stay cohesive.
---

# Leyline tree authoring & consistency

The 15 leyline trees (one per "color"/group) must read and behave **as one product**. Five are
done (Black, White, Red, Blue, Green); the remaining 10 must match their structure and intent. This
skill is the standard distilled from auditing those trees. Apply it when authoring a new tree or
reviewing one — and run `audit.py` (below) before committing; it mechanically enforces the rules
that prose alone failed to (Green shipped opposed-test cards applied on use because nothing *checked*).

Each tree has exactly **25 talents** (24 + 1 Leyline Attunement keystone), grouped into **3
specialties**.

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
what's wired, which primitives it reuses, and a **"Manual by nature: …"** list. Add the new tree's
header in that format.

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
python3 .claude/skills/leyline-tree-authoring/audit.py <color>              # gate; FAIL blocks the commit
python3 .claude/skills/leyline-tree-authoring/audit.py <color> --checklist  # the in-Foundry test worklist
node scripts/validate.js                                                    # data validator (CI parity)
node --check module-src/scripts/register-skills.js                          # engine parses
```

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
