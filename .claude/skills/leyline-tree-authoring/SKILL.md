---
name: leyline-tree-authoring
description: Authoring, wiring, and auditing EDHA leyline talent trees in the Skilltrees repo (data/authored/leyline-<color>.json + module-src/scripts/register-skills.js). Use when adding, wiring, reviewing, or checking a leyline tree for cross-tree consistency — flavor/cost/icon/tag conventions, events-vs-effects choices, engine reuse, and "no silent manual card" documentation. Apply this before committing any leyline tree so the 15 trees stay cohesive.
---

# Leyline tree authoring & consistency

The 15 leyline trees (one per "color"/group) must read and behave **as one product**. Four are
done (Black, White, Red, Blue); the rest must match their structure and intent. This skill is the
standard distilled from auditing those four. Apply it when authoring a new tree or reviewing one.

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
yourself / GM adjudicates" reminder card. The only acceptable manual contests are ones with no
hook (forced action, willing-movement, narrative); those go in the "Manual by nature" list, not a
lazy reminder card.

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
5. **Prose QA** — no typos, matched parens, subject/verb agreement, complete sentences.
6. **Parallel/twin talents** across trees (same effect, different color) must match on wording and
   durations. Disorient/timed statuses expire at the **end of the owner's next turn** (engine
   convention) unless intentionally otherwise.

## Pre-commit audit

Run this lightweight audit on the tree(s) you touched. JSON files are under `data/`, so
`scripts/validate.js` runs in CI on push.

```bash
# JSON valid + flavor coverage (value only, no chat/short leak)
python3 - <<'PY'
import json
for c in ['<color>']:
    t=json.load(open(f'data/authored/leyline-{c}.json'))['talents']
    fl=sum('<em>' in d['description']['value'] for d in t.values())
    leak=sum(('<em>' in d['description']['chat']) or ('<em>' in d['description']['short']) for d in t.values())
    print(c, 'talents',len(t),'flavor',f'{fl}/{len(t)}','leak',leak)
PY

# Silent-card audit: every talent referenced in authored events OR engine OR docs
python3 - <<'PY'
import json
eng=open('module-src/scripts/register-skills.js',encoding='utf-8').read()
docs=open('EDHA_FOUNDRY_HANDOFF.md',encoding='utf-8').read()+open('EDHA_FOUNDRY_TEST_CHECKLIST.md',encoding='utf-8').read()
for c in ['<color>']:
    t=json.load(open(f'data/authored/leyline-{c}.json'))['talents']
    silent=[n for n,d in t.items() if not (bool(d.get('events')) or n in eng or n in docs)]
    print(c,'silent:',silent or 'none')
PY

# Opportunity listed in Cost header but (correctly) absent from consume — spot-check it's intentional.
# Specialty tags use <Color>/<Specialty>. form:
grep -onE '"(description|note)": "[A-Za-z]+/[A-Za-z]+\.' data/authored/leyline-<color>.json | head

node scripts/validate.js                              # data validator (CI parity)
node --check module-src/scripts/register-skills.js    # engine parses
```

`validate-packs.js` needs the Foundry machine's compiled LevelDB — skip it locally; note the deferred
pack rebuild in the commit instead.

## Commit hygiene

Small, themed commits (icons+prose, flavor parity, manual-doc, tag normalization) rather than one
mega-commit. State whether the change is engine-only or needs a pack rebuild. Keep the model
identifier out of commit text.
