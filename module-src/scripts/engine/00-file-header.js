/* Edha Content — register custom Leyline skills into the Cosmere RPG system.
 * (rev 2026-06-13: Weakened reworked — falls off at the END of the creature's next turn (no longer
 *  consumed by the first physical test); generic combat-turn status-expiry pass via flags.edha-content.expireAfter.
 *  rev 2026-06-12: playtest-1 fixes — Weakened relay, summon ownership, Targeted Only,
 *  Lay Foundation takeover + mechanics, hazard visuals, Construct Slam skill test)
 *
 * The five leyline colors (White/Blue/Black/Red/Green) become rankable skills on the
 * character sheet, so talent prerequisites like "White 2+" resolve natively.
 *
 * IMPORTANT system behaviour (cosmere-rpg v2.0.4):
 *  - The actor skills schema is built from `CONFIG.COSMERE.skills` (getSkillsSchema).
 *  - Skills with `core: false` are treated as CUSTOM and stay LOCKED/hidden unless the
 *    actor has a Power that unlocks them. So leyline skills must be registered with
 *    `core: true` to behave like the 18 standard skills (always available, rankable).
 *  - We register as early as possible (module load + init + setup) so the registration
 *    lands before the Actor data model schema is first built.
 *
 * THE ONE SANCTIONED SYSTEM-DIALOG WRAPPER (2026-09-06, item 50 — Ben's ruling R-70 (b)):
 *  - `CosmereItem#showConsumeDialog` is wrapped ONCE (`edhaInstallConsumeDialogWrapper`, in the
 *    RESOURCE-CONSUME DIALOG section) so every cost row of a multi-cost activation opens TICKED —
 *    the system's own default (`options.shouldConsume ?? i === 0`) ticks only the first, so a
 *    "Cost: 1 Investiture, 1 Focus" card was under-charged by a default click. This is an explicit
 *    iron-rule-2a EXCEPTION granted by Ben's ruling, not a precedent: no other system dialog gets a
 *    wrapper, and `tests/consume-dialog-wrapper.test.js` pins that exactly one exists.
 */

