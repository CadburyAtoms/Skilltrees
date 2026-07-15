# Run-sheet template — `EDHA_SESSION_<N>_SCRIPT.md`

The frozen shape of `EDHA_SESSION_1_SCRIPT.md`. Copy the skeleton, keep the section order — Ben
reads this at the table, so the sheet is organized in *play order* with GM-truth marked and
player-safe text quarantined at the end (§8). Guidance is in ⟨angle brackets⟩; delete it.

---

# Edha — Session <N> Run-Sheet: "<Title>"

**Runnable GM script for session <N>.** Companion to `EDHA_CAMPAIGN_OPENING.md` (the act plan),
`EDHA_CAMPAIGN_CANON.md` (what's true), and `EDHA_CAMPAIGN_STATE.md` (what's happened). GM truth
throughout except §8 — ⚑ marks a provisional default Ben can swap freely.

Map: ⟨sites + coordinates + measured distances/days, all from the gazetteer — cite
`thyrcross.map.json` and quote `measure.py` numbers, never estimates⟩.

## 0. What this session is for

**The job:** ⟨one sentence — the errand as the PCs understand it⟩
**The pay:** ⟨what the job actually pays and who hands it over — coin, kind (food, papers,
passage), or favor. Every job names its pay at frame time; "they'd do it for free" is a decision,
not an omission. Worth stays descriptive (⚑ W25 — no currency canon yet).⟩
**The point:** ⟨one sentence — what the players should FEEL by the last scene⟩

⟨2–3 promises the session keeps: build-agnosticism, which act-thread advances, tone.⟩

**Do NOT reveal tonight:** ⟨the buried list, from canon + the act ladder. The GM's wall for
improvisation.⟩

**Session goal for the table:** ⟨the one scene that must land; what to cut if time runs short.⟩

## 1. Cast

| NPC | One-line | Face / voice | Wants |
|---|---|---|---|
⟨Canon NPCs by name (check state doc for dispositions); new NPCs ⚑. Adversary leaders also get:
what makes them stop fighting.⟩

## 2..(N-1). Scenes ⟨one § per scene, in play order⟩

**Site:** ⟨name (x,y) — day/leg from the measured route⟩. **Goal:** ⟨scene job⟩. ⟨Expected
minutes; what to cut.⟩

### ⟨Arrival / trigger⟩ (read aloud)
> ⟨Short, sensory, ends on the wrong detail.⟩

⟨Beats. Skill checks as `**Skill (DC N)**` with what each unlocks + the attuned-PC freebie.
Critical clues get an un-missable fallback. Dialogue lines for the load-bearing NPCs.⟩

### ⟨Combat scenes add:⟩
**Battle map** ⟨~W×H squares; the 3–5 terrain features; design goal one-liner⟩
**Adversaries** ⟨statblocks on the `adversaries.json` schema: role/tier, defenses, deflect, HP,
foc, move; items as ▶/⟲/∞ with attack/damage/riders⟩
**Tactics** ⟨round-1 shape; who holds, who presses; the break condition⟩
**Outs** ⟨talk/mercy/surrender paths with DCs and what each earns⟩
**Scaling** ⟨±1 PC; unknown-build adjustments; bruise-not-wipe note⟩

### Ending the session (read aloud)
> ⟨End on the point. Quiet is allowed.⟩

## (N). Clue ledger — what tonight plants

| Clue | Where | Points toward |
|---|---|---|

**Stays buried tonight:** ⟨the list⟩

### Loot & payment ledger — what tonight can put in their hands

| Item / payment | Where / from whom | Worth / notes | Clue? |
|---|---|---|---|

⟨Everything takeable: the job's pay, gear worth stripping from adversaries, found objects.
Anything that doubles as a clue cross-references the ledger above — loot is a clue *delivery*
channel (the Malcurr maker's-marks precedent), so a fight the players skip must re-deliver its
loot-borne clue elsewhere. Worth stays descriptive ("a week's food", "resellable in Aldercourt")
— ⚑ W25, no currency canon yet; re-denominate when the coinage pass lands. Droppable Foundry
gear (adversary `kind:"weapon"` items, edha-items entries) goes in §9's hand-off list.
`session-debrief` reconciles this table against what the table actually took.⟩

## (N+1). Where the act goes from here ⟨GM sightlines — not tonight⟩

## §8. Player-facing text (safe to read/show)

**Previously on:** ⟨the recap, spoiler-checked against §0's do-NOT-reveal list⟩
⟨Handouts verbatim: letters, notices, rumor tables.⟩

## §9. Battle-map briefs + Foundry hand-off

⟨Drawable briefs per combat (if not inline above). Then the bench list: adversaries.json entries
incl. lootable gear (`kind:"weapon"` items; Edha-specific objects as edha-items entries once that
pack exists — backlog §9h), scenes, journals — engine-only vs rebuild-needed stated (pack rebuild
+ ⟳ Sync ⚑).⟩

## §10. ⚑ Open for Ben

⟨Numbered batch: names, tone calls, unverifiable items — each with a recommended default.
Close with a *Settled* line naming the rulings this session already banked (canon §9 numbers).⟩
