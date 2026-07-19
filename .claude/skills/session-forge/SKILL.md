---
name: session-forge
description: Build a runnable Edha campaign session in the Skilltrees repo. Use whenever Ben asks to plan, build, prep, flesh out, or revise a session ("let's work on session 2", "prep the next session", "design the Black Altar finale", "stat this encounter", "write the run-sheet") — or any campaign content that feeds one (a scene, an NPC roster, an encounter, a travel leg, battle-map briefs). Drives the full loop: sync + state → frame the session → geography FIRST (query the gazetteer, never eyeball) → stress-test the premise → batch rulings → cast/scenes/stats → clue ledger → close-out docs. Read CASE_STUDY.md (this folder) before drafting anything; write the deliverable on RUN_SHEET_TEMPLATE.md.
---

# Session-forge — from "let's build session N" to a run-sheet Ben can read at the table

This skill encodes the workflow that produced `EDHA_SESSION_1_SCRIPT.md` (PR #75) — the
reference for what a good session build looks like. The failure modes it guards against, each of
which actually happened during that build: **fiction written before geography** (a cart convoy
"fording" a river it never needed to cross; a barge port 290 km inland; "it's a day" for what
measured 1,339 km), **canon holes discovered at the table instead of in prep** (what happens if a
player cuts off the dying elder's head?), **judgment calls decided silently or dribbled one at a
time**, and **parallel-session drift** (two sessions ruling the same question under the same
rulings numbers).

**Read `CASE_STUDY.md` in this folder first** — the session-1 build walked through as worked
examples. The deliverable is a new `EDHA_SESSION_<N>_SCRIPT.md` following
`RUN_SHEET_TEMPLATE.md`; `MAP_CHEATSHEET.md` (this folder) is the geometry toolchain quick
reference.

Phases run in order. Phases 0–3 are read-only — **no scene prose gets written until the
geography is measured and the rulings batch is answered.**

---

## Phase 0 — Sync + state (what is true, what has happened, what changed under you)

1. **Check for parallel-session drift first**: `git log --oneline -15 origin/main` (fetch first) —
   any campaign-doc commits you haven't read? Canon §9's rulings numbering and the handoff delta
   ids are shared surfaces; two 07-13 sessions collided on both. Read anything new before writing.
2. Read, in order:
   - **`EDHA_CAMPAIGN_STATE.md`** — play truth: what the players know, thread status, NPC
     dispositions, clocks, where the party is. *The session you build must start from here, not
     from the opening doc's original plan.*
   - **`EDHA_CAMPAIGN_CANON.md`** — world truth. §1a (broken-cycle mechanics), §2 (the Fetch),
     §3 (per-god agendas), §5/§5a (nations + geography), §8 (open threads), §9 (rulings log —
     note the highest number), §10 (⚑ pending).
   - **`EDHA_CAMPAIGN_OPENING.md`** — the act ladder and assembly rule the session must serve.
   - The **previous run-sheet(s)** — promised beats, planted clues, ⚑ items still open.
   - **`TODO_WORLDBUILDING.md`** — W-items this session might touch (Phase 6).
3. Note the constraint that shaped session 1 and still applies until the party exists: **player
   builds and origins may be unknown** — everything stays build-agnostic, with per-color leyline
   tugs improvised from whatever the players bring.

## Phase 1 — Frame the session (the point, not the plot)

Write the run-sheet's §0 before anything else:

- **The job** (one sentence — what the PCs are hired/pushed to do) and **the point** (one
  sentence — what the players should *feel* by the last scene). Session 1: escort grain twelve
  days downriver / feel that *nothing here can properly die*. If you can't separate the two, the
  session is a errand, not a story.
- **The pay.** Every job names what it pays and who hands it over — coin, kind, papers, or favor
  — at frame time, not improvised at the table. Payment is worldbuilding in miniature (session
  1's "payment is food, worth more than coin here" carries the famine better than any read-aloud
  box). Worth denominates in copper/silver/gold (canon §5d — the W25 pass, rulings 54–59; price
  anchors live there), except where ruling 56 keeps food-payment descriptive (the calorie-deficit
  nations); the run-sheet's loot & payment ledger (template, under the clue ledger) is where it
  all gets tabulated.
- **The do-NOT-reveal list.** Pull from canon what this session must keep buried (the gods, the
  Fetch, Morrath — whatever the act ladder hasn't earned yet). Naming it prevents accidental
  spoilage in scene prose, and gives the GM a wall to check improvisation against.
- **Which threads this advances** — against the state doc's thread table and the opening doc's
  act structure. A session that advances nothing gets reframed now, not after it's written.

## Phase 2 — Geography before fiction (mandatory, no exceptions)

Every place the session touches gets measured before a single scene references it. The toolchain
is `scripts/map/` + `source-materials/maps/thyrcross.map.json` — commands in `MAP_CHEATSHEET.md`.

1. **Existing sites**: `measure.py dist/route/locate` for every leg the session travels. Travel
   times come from the gazetteer's `travel_modes_km_per_day` — never from vibes. Remember the
   Palewater lesson: the drawn channel meanders ~2.1× straight-line and the measurement honours
   it; "about a day" guesses were off by 10×.
2. **New places**: add them to the gazetteer FIRST (id, px, note, `painted: false` — Ben's
   Procreate map doesn't have them yet; lint errors without the flag), docs reference them
   after — `lint_map.py` enforces the direction. Coordinates come from Ben clicking
   `source-materials/maps/viewer.html`, or from snapping to traced features (a river port sits
   ON the channel polyline; a border fort sits ON the polygon edge). Never invent a coordinate
   from looking at the PNG.
3. **Sanity-check the logistics as story**: who carries what, by which route, and *why does the
   antagonist meet them there*? Session 1's ambush works because the shallows are BOTH the slow
   single-file channel AND the only wadeable border crossing for fifty miles. If the geography
   doesn't force the scene, find the spot where it does — `measure.py locate` and the traced
   features usually hand you one.
4. If the `.procreate` changed since `meta.source`'s stamp (new terrain, new map), re-extract
   layers before trusting anything (`extract_procreate.py`; staleness check in the cheatsheet).

## Phase 3 — Stress-test the premise, then batch the rulings

Attack the session's central conceit before writing it. Two probes, minimum:

- **The player probe** (the Joskin-decapitation test): what is the sharpest, dumbest, or most
  merciful thing a player can do to the premise? If canon can't answer it, that's a design
  question. Session 1 found four this way: does violence still kill, are there heaps of the
  undying, what does the raid context become on a river, how long is the journey *really*.
- **The mechanics probe**: which world mechanics does the session lean on that canon defines
  only vaguely? (Perception of stuck souls, plague transmission, what a nexus feels like...)

Then **collect every judgment call into ONE `AskUserQuestion` menu** — design intent, tone,
placement, names — each with a recommended default listed first. The session-1 cadence to copy:
one batch at frame time, one at review time. **Never dribble questions; never silently decide
design; never stall mechanical work waiting on flavor rulings.**

> **Delivery rule (Ben, 2026-07-14 — "skill isn't doing what Ben wants").** Menus are for
> short picks whose options fit in a label. **Any full-text proposal (a creature, a custom, a
> scene concept) goes in PLAIN CHAT, and Ben approves by replying in chat.** Do not put long
> text inside an `AskUserQuestion` (it gets cut off on his surface) and do not write "see the
> text above" next to a menu (the chat prose may not display beside the dialog — it reads as
> nothing). The skeindeer proposal failed both ways, three rounds, before plain chat landed
> it. If a menu is denied, switch to plain chat — never re-send the dialog. Answers that change world truth
get logged to canon §9 (numbered *after* checking merged main's highest number) — answers that
only shape this session stay in the run-sheet.

> **The batch is a GATE, not a courtesy (added 2026-07-13 after a real violation).** Send the
> menu and **WAIT for Ben's answers before writing any canon or scene prose the answers touch.**
> Recommended defaults exist to make answering *fast* — they are NOT a license to write first
> and ask after, and writing a "⚑ provisional" version of a flagged design question is the same
> violation wearing a flag. This holds even when the session is running autonomously and Ben is
> away: **park the gated work at the menu and do the ungated work** (audits, geography,
> template alignment, anything already ruled). A pass that ships unapproved lore costs a full
> review cycle and Ben's trust; a pass that stops at a clean question menu costs nothing.
> The 2026-07-13 violation: worldbuilding W1–W10 written and PR'd wholesale — including W7
> doctrine the backlog explicitly said needed a ruling *first* — with the menu delivered
> *after* the PR. Do not repeat it.

## Phase 4 — Cast

Every named NPC gets a row: **one-line role | face/voice (two features and a speech habit) |
wants** (the want is what makes them playable). Canon NPCs (§6) keep their names and threads —
check the state doc for dispositions the table already set. New NPCs are ⚑ placeholder names,
listed in the run-sheet's open-items batch. Adversary NPCs get the extra column: what makes them
*stop fighting* (session 1's Roek: "Not a Bandit" — he accepts a fair split and leaves).

## Phase 5 — Scenes, encounters, and stats

Write scenes on the template's shape. The standards, each earned in session 1:

- **Read-aloud boxes** for arrivals and reveals — short, sensory, end on the wrong detail.
- **Skill checks** in canon terms (`test Skill (DC N)` / vs. defenses — see the
  `cosmere-canon-reference` skill for vocabulary). Give the freebie path: a Green-attuned PC
  *feels* what others must roll for.
- **Build-agnostic**: any origin has a reason to be here; any build has a job in every scene;
  every leyline color gets a tug you can improvise.
- **Critical clues are un-missable.** If a clue gates the campaign (the Malcurr maker's-marks),
  a failed roll delays it, never deletes it — loot, dialogue, or a second location delivers it.
- **Combat**: statblocks on the `data/adversaries.json` schema (role/tier/defenses/deflect/HP +
  items with attack/damage/riders) so they can become droppable Foundry actors later. **Stats
  ship WIRED, not as prose (Ben 2026-07-16):** every ability whose text names a trigger carries
  an `events` rule — full automation where the effect is decision-free, `edha-gm-cue` at minimum
  where the call stays with the GM — or an explicit `NO NAMEABLE HOOK: <reason>` line;
  `lint-refs.js` pass 5 fails the commit otherwise. The standard, the vocabulary, and the traps
  live in `leyline-tree-authoring` SKILL.md §"Adversary abilities" + ENGINE_INDEX §"Talents on
  adversaries" / §"GM cue cards" — read those BEFORE statting, so the session-1 pattern (talents
  as written for humans, adaptations for beasts, morale cues on thresholds) carries forward
  first time. **The statblock gate (Ben 2026-07-19):** when building adversaries from an
  approved bestiary (a lore-forge creature pass or any canon creature), the next turn after
  Ben approves the bestiary is the SAME bestiary as adversary blocks for Foundry. Ben reviews
  the bespoke actions for attuned animals, double-checks defenses and stats, etc. — **the
  approval of the stat blocks is the gate, not the approval of the animal ideas.** Never
  treat a yes on the creature concept as a yes on its numbers. And before inventing an
  encounter creature, **check the nation's §5c bestiary cluster first** — per-nation rosters
  now exist (Thalendor/Corvaine from the ecology pass; the Lunavar fens with six statted
  blocks, ruling 69–70) and canon creatures come pre-approved with famine arcs, outs, and
  counterplay built in (e.g. Lunavar day-travel = the noonwing choice between rhythm and
  broken-slow; a drownlight colony pairs with a stillback as lure and anvil). Gear worth
  looting is part of the statblock — main weapons as `kind:"weapon"` items (real, strippable,
  render in the sheet's weapon section), and anything story-bearing rows in the loot & payment
  ledger. Tactics
  paragraph; **outs** (talk, mercy, surrender — reward them with contacts and information);
  scaling notes for ±1 PC and for unknown party shapes; early-tier default is
  *bruise-not-wipe*, and downed PCs get a reason not to die (canon: injuries, not executions).
- **Tone check against canon**: if the setting says the enemy is desperate, the fight is *sad,
  not evil* — give the GM the line that shows it.
- **End the session on the point** (Phase 1), not on an unresolved fight — quiet endings are
  allowed and were the right call for session 1.

## Phase 6 — Worldbuilding pull

Check `TODO_WORLDBUILDING.md`: any W-item the session touches anyway (a nation's culture block
because the session enters it; a god's rites because a shrine appears) gets **done as part of
prep** — written into canon at the item's proposed home, marked done in the backlog, and used in
the scene. Don't do unrelated items; don't leave a session's setting half-built when the backlog
already scoped the work.

## Phase 7 — Clue ledger + thread reconciliation

The run-sheet ends with the table that makes the session auditable:

| Clue | Where it lands | Points toward |

plus the explicit **stays-buried list**, plus the **loot & payment ledger** (template — the
job's pay, strippable gear, found objects; clue-bearing loot cross-referenced both ways, since a
skipped fight must re-deliver its loot-borne clue elsewhere). Reconcile against: the state doc's
threads (every live thread this session touches should appear or be deliberately rested), the
party inventory (state doc §1a — don't sell them a rope they already own; don't ignore the
stamped blade they're carrying), the act ladder, and the previous session's planted clues
(nothing promised gets orphaned). These tables are what `session-debrief` will reconcile
against after play — write them knowing they will be graded.

## Phase 8 — Player-facing text

A clearly-marked **player-safe section**: the "previously on" recap (from the state doc's last
session log, spoiler-checked against the do-NOT-reveal list) and any handouts (letters, rumor
tables, notices) written verbatim so Ben can read or print them straight. GM truth never leaks
into this section — it's the one part of the sheet Ben can show the table.

## Phase 9 — Battle-map briefs + Foundry hand-off

- Every combat scene ends with a **drawable brief** for Ben's Procreate pass: grid size, the
  3–5 terrain features that matter (chokepoint, cover, difficult terrain, the thing being fought
  over), and a one-line design goal ("defend three slow barges in a kill-box"). When Ben
  delivers art, it lands at `source-materials/maps/battle/<site-slug>.png` + a `battle_maps`
  entry in the gazetteer (grid w×h, ft/square).
- **Foundry hand-off list**, ⚑-flagged for the bench like engine work: adversary entries to add
  to `data/adversaries.json` (pack rebuild + ⟳ Sync — only Ben can run it), scenes to build,
  journal entries. Say explicitly what needs a rebuild vs. what doesn't.

## Phase 10 — Close-out (docs are part of the session)

1. World-truth rulings → canon §9 (correctly numbered against merged main); geography → the
   gazetteer; if sites changed regenerate `thyrcross-labeled.png` (`render.py`) AND the paint
   guide (`paint_overlay.py`). If canon or gazetteer changed, regenerate the codex
   (`node scripts/build-canon-codex.js`) — CI fails on a stale one.
2. `EDHA_CAMPAIGN_STATE.md`: session marked *planned*, with its ⚑ list.
3. Dated delta at the top of `EDHA_FOUNDRY_HANDOFF.md` (check the id — 07-13 minted three).
4. Gates (CLAUDE.md rule 4) **including `python scripts/map/lint_map.py`** — it exists to catch
   exactly the doc-vs-gazetteer drift this workflow produces.
5. The ⚑ batch to Ben: names, tone calls, anything you couldn't verify — one menu, recommended
   defaults, same as Phase 3.
