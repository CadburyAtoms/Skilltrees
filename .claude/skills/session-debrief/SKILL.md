---
name: session-debrief
description: Turn Ben's post-play table notes into updated Edha campaign state. Use whenever Ben reports what happened at the table — freeform chat notes in any order ("we played session 1", "they talked Roek down", "X mercy-killed the cow", "I ruled at the table that..."), partial or complete. Drives the loop: parse notes → reconcile against the run-sheet's clue ledger → interrogate only load-bearing gaps → update EDHA_CAMPAIGN_STATE.md → table rulings into canon §9 → consequences + new canon holes → seed next session. The campaign-play counterpart of test-pass-fixes.
---

# Session-debrief — from "here's what happened" to a true campaign state

After a session is *played*, the world has two new kinds of truth: **what happened** (scenes,
choices, casualties, mercies) and **what Ben ruled live at the table** (improvised canon). If
neither gets captured, the next `session-forge` run builds from the planned session instead of
the played one — and table rulings silently evaporate or, worse, get re-ruled differently later.
This skill is the capture step. Input is **freeform chat notes** in whatever order they come;
the skill's job is structure, reconciliation, and follow-through — not stenography.

---

## Phase 0 — Load the reference frame

Read the played session's run-sheet (`EDHA_SESSION_<N>_SCRIPT.md`) — especially its **clue
ledger** and **⚑ open items** — plus `EDHA_CAMPAIGN_STATE.md` and canon §8/§9. The run-sheet is
the *plan*; the debrief measures the delta between plan and table. Also check merged main for
parallel-session drift (same hazard as session-forge Phase 0).

## Phase 1 — Parse the notes into the extraction grid

Normalize Ben's freeform notes against this checklist — every row either gets an answer from
the notes, a reasonable inference (marked as such), or becomes a Phase-2 question:

1. **Scenes** — run / skipped / transformed. (A skipped scene's clues didn't land — see 3.)
2. **Choices with consequences** — deals struck, mercies shown, kills made, promises given.
   Session-1 examples the sheet pre-wired: did they fight Roek or talk him down (a mercy =
   a Corvaine contact)? Did anyone give Joskin the knife?
3. **Clue ledger reconciliation** — for every planted clue: landed / missed / landed early.
   For every stays-buried item: still buried? An accidental reveal is a load-bearing fact.
4. **NPC outcomes** — met / not met, alive / dead, disposition toward the party now.
5. **Table rulings** — anything Ben decided live ("I said X works like Y"). These are CANON
   the moment they're spoken at the table; they outrank prep.
6. **Player knowledge vs. suspicion** — what do they *know*, what do they *theorize*? (The
   assembly-rule reveal structure depends on tracking this precisely.)
7. **Names that stuck** — ⚑ placeholder names spoken aloud at the table are now real (a name
   the players heard can't be swapped anymore); which ⚑ items did play resolve?
8. **Clocks** — did anything tick? (Soul-pool, Tyrith's coup, the war, the drain.)
9. **Loose ends the table created** — threads the players started that no doc predicted.

**Nothing is too small for a row** — offhand notes ("they liked Wick", "we ended early") shape
the next session's cast time and pacing.

## Phase 2 — Interrogate the gaps (once, batched, load-bearing only)

One `AskUserQuestion` batch for the unknowns that change what gets written — a missed critical
clue, an ambiguous table ruling, whether an NPC survived. Don't quiz Ben about color he didn't
mention; infer small things and mark them inferred. If nothing load-bearing is missing, skip
this phase entirely.

## Phase 3 — Write the state

Update `EDHA_CAMPAIGN_STATE.md` in place, every section it touches: party facts, player
knowledge (know vs. suspect), thread table (advanced / burned / spawned — new threads from
Phase 1.9 get rows), NPC dispositions, clocks, ⚑ resolutions, and a **session-log entry**
(3–6 lines: what happened, in past tense, GM-truth allowed). The state doc is the single
source the next forge run trusts — write it so a cold session could resume the campaign
from it alone.

## Phase 4 — Table rulings into canon (drift has two directions)

Each Phase-1.5 ruling goes to canon §9, numbered against merged main. If a table ruling
**contradicts** written canon: surface it in the Phase-2 batch — Ben decides which side is
canonical (the table usually wins, but he may want a retcon). Never silently patch canon to
match the table, and never let the contradiction sit unrecorded. Geography spoken at the table
("there's a mill two hours upstream") gets a gazetteer entry via the session-forge
`MAP_CHEATSHEET.md` flow.

## Phase 5 — Consequences + new canon holes

Two forward passes:

- **Consequences**: what did the players change that future sessions must honor? (A spared
  raider sergeant remembers; a burned granary changes the famine math; a name spoken is fixed.)
  Each becomes a thread row or an NPC-disposition note — *somewhere a forge run will look*.
- **New canon holes**: did play expose a mechanic canon can't answer (the table's version of
  the Joskin test)? Log to canon §10 ⚑ or ask in the Phase-2 batch if load-bearing.

## Phase 6 — Seed the next session, then close out

- Write 2–3 candidate hooks for session N+1 into the state doc's *Next session* block — each
  one line, tied to a live thread, honoring where the party physically is (check travel times
  via `measure.py` before proposing "they arrive at X").
- Dated delta at the top of `EDHA_FOUNDRY_HANDOFF.md`; gates per CLAUDE.md rule 4 including
  `lint_map.py`; ⚑ anything Foundry-facing for the bench (rare from a debrief, but a dead
  adversary or new recurring NPC may want pack work).
