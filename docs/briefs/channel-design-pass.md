# Brief — the Channel design pass (R-152 (b), item 200)

Filed 2026-09-16 by the PM session of record after Ben answered R-152 with **(b)**: *design it now
as a `leyline-revision-guide` pass, one colour worked in full text, Ben's gate per section; build
after 3.1.0.* Ben runs this in a session of his own. The prompt below is what he pastes; everything
under it is the same brief with the reasons. **Nothing in this pass edits data, the engine or the
packs.** The build is items 198 and 187's successors; this pass produces the design they build from.

---

## The prompt

> You are a design session for the Edha talent system in `C:\dev\Skilltrees`, not the PM. The PM
> session of record holds the main checkout, so work in a git worktree under `%TEMP%\edha-channel\`
> on a branch `design/channel-actions`, and remove it when your PR is up.
>
> **Your job:** R-152 (b) in `EDHA_RULINGS.md` §K.21 — design a base **Channel** action per leyline
> colour, the way every published Invested family puts the cost on a base power action (Burn,
> Store / Tap, the surge) and lets its talents ride that action free. Work one colour in full text,
> section by section, with Ben's approval gating every section before you move on. The deliverable
> is `docs/design/channel-actions.md`; the brief with the reasons is
> `docs/briefs/channel-design-pass.md` — read it first, then the sources it names.
>
> **Read, in this order:** `CLAUDE.md` (the iron rules; you are DOCS-ONLY); the brief;
> `docs/analysis/talent-comparison-mistborn-radiant.md` §B, §C.2, §D-1, §D-3 and §E (what the
> published families do and the numbers Edha is measured against); `docs/analysis/metalworks-comparison.md`
> §c B10 (colours as `power` items — R-150 (b) makes the Channel the power item's embedded action at
> 3.x, so design it as an action document); `EDHA_RULINGS.md` §K.21 (R-150 (b), R-151 (a), R-152 (b),
> R-153 (a) — the answers that bound this pass); `docs/analysis/talent-ecosystem/README.md` findings
> 4, 4b and §"Resource economy" (why White is hostage and what "sealed loops" means);
> `.claude/skills/leyline-revision-guide/SKILL.md` (the design standard — you are writing to it);
> `data/leyline.json` and `data/authored/leyline-<colour>.json` for the colour you work.
> Invoke `leyline-revision-guide`, `talent-balance` and `cosmere-canon-reference` as you go;
> `phrasing-verifier` on the final card sentences.
>
> **The Channel, as a starting shape (Ben decides each line at the first gate):** 1 Action; spend
> 1 Investiture or more, **up to your rank in the colour** (the Metallic Art limit); an ongoing
> *frame* until the end of your next turn; before it ends, maintain it as a Free Action for the same
> cost; it ends when you choose, when you are Unconscious, or when you cannot pay. The frame is
> what channelling a colour *is* — five one-line frames, one per colour, each a real ongoing effect
> a player would pay for on its own. Riders are talents that read *"while channelling <colour>"*;
> most of them become Passive or Special and lose their own Investiture cost. Draw Mana stays the
> refill. Deity talents are out of scope for the worked colour but the document must say how a
> two-colour deity tree would ride a Channel.
>
> **Sections, each a gate:**
> 1. The Channel rule itself, generic — cost shape, limit, duration, maintain, end, stacking of two
>    colours, how it reads on the Actions tab at 3.x (an action document with `consumption
>    {min: 1, max: rank}`), and its interaction with Attunement Range, `[Tier][Die]` and Draw Mana.
>    Full text. A rulings-style menu for every judgment call, each with a recommended default.
> 2. The five frames, one paragraph and one card sentence each. Full text.
> 3. **The worked colour — White unless Ben says otherwise at gate 1** (the ecosystem review found
>    two talents in twenty-five it can spend an Action on, seven Reactions, and 60 % of its talents
>    costed). Every one of its 25 talents: the current action type and cost, the proposed action
>    type and cost, the "while channelling" condition if any, and the changed card sentence in
>    full. A before/after table. The resulting action-type mix and costed share against the
>    published bands (Passive + Special 71 – 87 %, costed 8 – 46 %) and the leyline guide's targets.
> 4. What the build would be — the data shape at 3.x (the colour's `power` item with the Channel
>    as its embedded action, per R-150 (b)), which authored-overlay keys move, which engine
>    primitives the "while channelling" condition needs (name them from `ENGINE_INDEX.md`, do not
>    invent), and the bench rows. No code, no data edits.
> 5. Close-out: a dated delta at the top of `docs/handoff-changelog/2026-09.md`, any new
>    rulings in `EDHA_RULINGS.md` §L (only genuine new questions the gates did not settle), a
>    DOCS-ONLY PR, and a fixed-shape report: what was decided at each gate, what waits on Ben,
>    the PR link. Do not edit `docs/PM_BOARD.md`; the PM records the pass from your report.
>
> **Discipline:** propose full text one section at a time and wait for Ben's yes before the next
> section and before any commit. No "⚑ provisional" text; a flagged question is a menu entry, not a
> paragraph that assumes an answer. Never write a mechanic from memory — read the talent's authored
> card and its data. Gates must be green before the PR. Nothing deploys; Ben's table stays on
> `cosmere-rpg` 2.1.0.

---

## Why this pass exists

`docs/analysis/talent-comparison-mistborn-radiant.md` measured every published Invested family —
Allomancy (83 talents), Feruchemy (85), the Metalborn paths (38), the nine Radiant orders (225) —
against Edha's leyline (125) and deity (90) talents. The published families are 71 – 87 % Passive +
Special and 8 – 46 % costed because **the cost sits on a base power action** and the talents modify
it. Edha's colours have no base action, so every talent is priced on its own: leyline 48 % costed,
deity 80 %, with no Specials at all in the deity atlas. R-151 (a) holds the deity re-pricing until
this design answers the structural question; R-153 (a) adopts variable spend up to rank as a
convention; R-150 (b) re-bases the colours on `power` items at 3.x, which is where the Channel
lives as the power's embedded action.

## What the pass must not do

- Edit `data/`, `module-src/`, or the packs. The build is a later item (198), after the 3.1.0 flip.
- Decide design questions silently. Every judgment call is a menu entry with a recommended default,
  approved by Ben at its gate.
- Write for all five colours at once. One colour in full; the other four get their frame sentence
  in section 2 and nothing more.
- Touch the PM board or answered rulings.

## What the PM does with the result

Files the design's gate decisions as answered rulings if any were filed, records the pass in the
run log, and re-scopes item 198 (colours as `power` items, the last PR of the 3.x re-platforming)
to build the Channel the design specifies. The deity re-pricing (R-151) is re-opened against the
design once it exists.
