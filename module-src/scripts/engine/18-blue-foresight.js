/* ============================================================================================
 * BLUE / FORESIGHT tree engine (2026-06-14f) — prediction + initiative. Mostly MANUAL (hidden
 * declarations, fast/slow-turn choices, telepathy have no Foundry hooks); the automatable half REUSES
 * the Calculation `nextTestMod` flag + the reminder-card pattern. Engine-only off `useItem`; NO rebuild.
 *   - Intercept → on use, disadvantage on the designated creature's next test (nextTestMod, owner-judged).
 *   - Reactive Analysis → ON ITS DOCUMENT since 07-24r (iron rule 2b): one `edha-next-test-mod`
 *     {target: self, mode: advantage} on `use` plus the reminder as an `edha-note`. It reads in the
 *     audit as an H8 watcher ("a character in range fails a test → advantage on my next vs them"),
 *     and it is not: it is a REACTION the player takes when that happens, so the trigger is volition
 *     and the mechanic is the on-use grant the engine already had. Needed no handler at all.
 *   - Read Intent (skill_test) → ON ITS DOCUMENT since 07-24p (iron rule 2b): `edha-def-test` blue vs
 *     cog + an `edha-note` reveal on edha-test-success, whispered to the owner + GM as before.
 *   - Collected = +2 Cog/Spi defenses AE (data-side, already authored). Forewarned / Telepathic Network /
 *     Probable Outcome = manual. Calculated Patience → ON ITS DOCUMENT since 07-24y (iron rule 2b):
 *     an `edha-test-rider` with `whenSlowTurn` + `firstTestThisTurn` + `mode: advantage`. The
 *     `edha.calculatedPatience()` console toggle is retired — it was a MANUAL exit justified by
 *     "there's no fast/slow-turn hook", and the pre-roll rider had been reading turnSpeed all along.
 * ============================================================================================ */
// Read Intent moved onto its document 07-24p (iron rule 2b) — `edha-def-test` blue vs cog, with the
// GM's reveal as an `edha-note` on edha-test-success, whispered to the owner + GM as before.
// Calculated Patience moved onto its document 07-24y (iron rule 2b) — an `edha-test-rider` with
// `whenSlowTurn` + `firstTestThisTurn` + `mode: advantage`. The old `edha.calculatedPatience()`
// console toggle is GONE: it was a MANUAL exit taken because "there's no fast/slow-turn hook", which
// was never true — the pre-roll rider pipeline reads turnSpeed already for whenFastTurn. Iron rule 3
// says to re-litigate manual every pass, and this is what that found.

// Intercept moved onto its document 07-24s (iron rule 2b) — H6 `edha-prompt-pick` {source: confirm}
// plus `edha-next-test-mod` on edha-test-success. "Is this the creature you designated with
// Forewarned?" stays owner-judged, because Forewarned's designation is table-run and writes no flag
// for a rule to read. Read Intent moved 07-24p, Reactive Analysis 07-24r. The Foresight use-hook is
// gone with them — do NOT re-add a switch here.

