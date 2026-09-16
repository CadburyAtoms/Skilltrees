# Brief — the Blue pass on the Channel model (item 209)

Filed 2026-09-16 by the PM session of record after the Channel design pass (item 200, PR #419,
`docs/design/channel-actions.md`) landed with all five gates approved. Blue is the second colour
worked, for two reasons the design gives: its frame — *the deep reading*, a per-die disadvantage on
one enemy — is the second consumer of the per-die placement item 202 builds, and its `Counterspell`
was renamed **Countercurrent** at gate 1 (M17 (a)), a data change that rides item 198. Ben runs
this in a session of his own. The prompt below is what he pastes. **Nothing in this pass edits
data, the engine or the packs**; the build is item 198's Blue leg.

---

## The prompt

> You are a design session for the Edha talent system in `C:\dev\Skilltrees`, not the PM. The PM
> session of record holds the main checkout, so work in a git worktree at `%TEMP%\edha-channel-blue`
> on a branch `design/channel-blue`, created from `main` (`git worktree add -b design/channel-blue
> "$TEMP/edha-channel-blue" main` from the main checkout, then work only inside that folder). Do
> not use `.claude/worktrees/`. When your PR is up, stop running git: the PM sweeps the worktree
> after the merge, and a git command from a swept folder falls through to the PM's checkout.
>
> **Your job:** item 209 in `TODO_REPO_HYGIENE.md` — work Blue's twenty-five cards on the Channel
> model exactly as `docs/design/channel-actions.md` §3 worked White's, section by section, with
> Ben's approval gating every section before you move on. The rule (§1), the frames (§2) and the
> build shape (§4) are **decided and fixed**; you apply them to Blue, you do not re-open them. The
> deliverable is `docs/design/channel-blue.md`; the brief with the reasons is
> `docs/briefs/channel-blue-pass.md` — read it first, then the sources it names.
>
> **Read, in this order:** `CLAUDE.md` (the iron rules; you are DOCS-ONLY); this brief;
> `docs/design/channel-actions.md` in full — §1.1 the rule and its four definitions (frame,
> channelled Investiture, rider, release), §1.4 the interactions, §2.3 Blue's frame as approved
> (F-B (a): one enemy, disadvantage equal to the spend, one instance per die), §3.2 the seven
> conversion rules, §3.3 – §3.5 the shape of a worked colour, §4.3 the `requireSelfStatus` gate and
> the handler table, M17 (Countercurrent); `EDHA_RULINGS.md` §K.22 (R-155 (a) — the per-die
> counter the frame rides on) and §K.21 (R-146 … R-154); `docs/analysis/talent-ecosystem/README.md`
> findings 2 and 3 (Blue's identity and the two disadvantage talents that collide) and the
> resource-economy section; `.claude/skills/leyline-revision-guide/SKILL.md` (Blue's identity
> block and the design standard); `data/leyline.json` and `data/authored/leyline-blue.json` for
> the cards — read every card's authored text and its `events`, never write a mechanic from memory.
> Invoke `leyline-revision-guide`, `talent-balance` and `cosmere-canon-reference` as you go;
> `phrasing-verifier` on the final card sentences.
>
> **Fixed inputs you build on, not decide:**
> - **Channel Blue** — *When you channel or maintain Blue, choose an enemy you can see within
>   Attunement Range; it has disadvantage on its next test equal to the Investiture you spent* —
>   one instance per die, assigned by the mage (§2.3, F-B (a)); a reading lapses if unused by the
>   next payment; two Blue mages reading one enemy: the larger stands (M14 (a)).
> - **Riders** carry no Investiture cost and read "*While channelling Blue,*"; **releases** keep
>   their cost and stand alone; scene-long effects are releases; a Reaction that is an *action*
>   stays a Reaction, a Reaction that is a *modifier* becomes a Special with "Once per round";
>   the capstone gates on the flood ("*while channelling 3 or more Blue*") (§3.2 rules 1 – 7).
> - **Countercurrent** replaces `Counterspell`: its trigger becomes "*spends Investiture on a
>   leyline talent or a Channel*" and its result "*the effect fails*"; it can answer an opening or
>   a maintain, never a rider (M7 (a), M17 (a)).
> - The per-die disadvantage mechanism is **item 202's build** (R-155 (a)); the Blue frame is its
>   second consumer. You design against it; you do not design it.
>
> **Sections, each a gate:**
> 1. **Blue's three trees by Realm and the reading applied** — Calculation (Cognitive), Illusion
>    (Physical), Foresight (Spiritual) against §1.5's Realm map; what the frame does to each tree's
>    identity; the Countercurrent card in full. A short rulings-style menu for every judgment
>    call (each with a recommended default); no re-litigation of §1 or §2.
> 2. **The twenty-five cards** — for each: today's action type and cost, the proposed type and
>    cost, the "while channelling" condition if any, rider or release, and the changed card
>    sentence in full. The two colliding disadvantage talents (README finding 3, R-98) resolved
>    under the per-die rule and said so. A before / after table.
> 3. **The mix against the bands** — Passive + Special, costed share, Investiture-priced cards and
>    the tree's Investiture sum, today and proposed, against the published Invested band
>    (Passive + Special 71 – 87 %, costed 8 – 46 %) and the leyline guide's targets; what a Blue
>    player's turn is now, in one paragraph, the way §3.5 did for White.
> 4. **The build notes for Blue** — which handler types Blue's riders use and where §4.3's gate
>    lands for each (name them from `ENGINE_INDEX.md` and the authored `events`; do not invent),
>    what the frame needs from item 202's placement step, what moves in `data/authored/leyline-blue.json`
>    and `data/leyline.json`, every checklist row and document that names `Counterspell`, and the
>    🤖 bench rows for the Route A copy. No code, no data edits.
> 5. **Close-out** — the gate log, what waits on Ben (should be nothing), what the PM should file,
>    a dated delta at the top of `docs/handoff-changelog/2026-09.md` (+1 to its header count and
>    its `README.md` row; run `node scripts/build-dashboard.js` and commit `EDHA_DASHBOARD.html`),
>    a DOCS-ONLY PR opened with `gh pr create`, and a fixed-shape report. Do not edit
>    `docs/PM_BOARD.md`; the PM records the pass from your report.
>
> **Discipline:** propose full text one section at a time and wait for Ben's yes before the next
> section and before any commit. No "⚑ provisional" text; a flagged question is a menu entry, not
> a paragraph that assumes an answer. Gates (`node scripts/gates.js`, never piped, `python` not
> `python3`) must be green before the PR; run them after committing (the dry-run test goes red on
> an uncommitted change — item 196). Nothing deploys; Ben's table stays on `cosmere-rpg` 2.1.0.

---

## Why Blue second

The design worked one colour in full and left four. Blue's frame is the one that depends on a
mechanism not yet built — the per-die disadvantage placement of R-155 (a) / item 202 — so working
its cards now tells item 202's builder what the frame needs before the code is written, rather
than after. Blue also carries the one rename the design made (Countercurrent), which touches
checklist rows and documents beyond the card, and the ecosystem review's finding that two of its
disadvantage talents collide (R-98) — a collision the per-die rule dissolves, which this pass
should say in so many words.

## What the pass must not do

- Edit `data/`, `module-src/`, or the packs. The build is item 198's Blue leg.
- Re-open §1, §2 or §4 of the design. A genuine new question goes in the section's menu with a
  recommended default; a question about the rule itself goes to the PM as a ruling to file.
- Decide design questions silently, or write for a second colour.
- Touch the PM board or answered rulings.

## What the PM does with the result

Records the pass in the run log, adds the Blue leg to item 198's brief with the section's table as
its data pass, schedules the Countercurrent rename's data change with 198, and gives item 202's
builder the frame's requirements from section 4.
