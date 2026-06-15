# Forced-Movement Pilot — Red / Momentum (notes for future sessions)

**Status:** authored + engine code committed on `claude/red-talent-tree-status-ma7ngx`.
**NOT yet built or playtested** — this container has no Foundry install (`EDHA_MODROOT` unset),
so `foundry-build.js` / `validate-packs.js` and an in-game pass still have to be run locally.

## Why this is a pilot

Before now, **every tree GM-narrated forced/granted movement** — it posted a card and let the GM
move the token by hand:

- Ordered Advance (White) — `register-skills.js` "movement is GM-narrated"
- Redirect Momentum (Blue) — "push it … (GM applies)"
- Ghostly Walls (Blue) — "set its movement to 0" card
- Living Image (Blue) — "may now move up to your movement rate"

That was a deliberate house convention, **not** an engine limitation. Verification (2026-06-15)
confirmed the pieces are all writable:

| Capability | How | Verdict |
|---|---|---|
| Read fast/slow turn | `combatant.getFlag("cosmere-rpg","turnSpeed")` (no event, but readable at pre-roll / on-damage) | ✅ |
| Move a token | `TokenDocument#update({x,y})`, or GM socket relay for an enemy | ✅ |
| Wall-aware stop | `CONFIG.Canvas.polygonBackends.move.testCollision(origin, dest, {type:"move", mode:"closest"})` | ✅ (degrades to full move if absent) |
| `prone` on a failed save | native cosmere condition id (`adversaries.json`) | ✅ |

So **Red/Momentum is the first tree to ENFORCE movement.** If it plays well, port the same
handlers to the four narrated talents above.

## New engine primitives (all in `module-src/scripts/register-skills.js`, Red section dated 2026-06-15)

- **`edha-move` handler** — relocates the *caster* toward their current target, capped by
  `[Size]` / half-Speed / fixed ft, ignoring Reactions, halting at walls.
  Used by Reckless Advance & Explosive Leap (`use` event) and Unstoppable (`edha-deal-damage`,
  `whenFastTurn`, `oncePerTurn`).
- **`edha-push` handler** — shoves the creature you *hit* directly away from you (wall-aware); a
  wall collision rolls `collisionFormula` damage. Dispatched from `edhaDispatchOnHit` (pair with
  event `edha-on-hit`). Used by Shockwave Slam.
- Shared helpers: `edhaComputeMove` (collision math, never throws), `edhaMoveTokenTo`
  (own-token update **or** GM `move-token` socket relay), `edhaApplyMove` (slide + optional
  adjacency gap), `edhaMoveAllowanceFt`, `edhaSpeedFt`.
- **`move-token` socket action** added to the GM relay (for pushing enemy tokens a player can't move).

### Design choices worth keeping (or revisiting) when porting

1. **Degrade, never break.** If the collision backend is missing/changed, `edhaComputeMove`
   travels the full distance instead of throwing; if there's no token/target, `edha-move` posts a
   "move it manually" card — i.e. it falls back to the *old* narration convention. Untested canvas
   code should always fail soft.
2. **No grid snapping.** Movement is free-form (center-to-center). If trees that care about exact
   squares get ported, add snapping in `edhaMoveTokenTo`.
3. **"Toward the target" is the steering model.** `edha-move` aims at the current target token and
   stops a half-token short. There is no click-to-place destination picker yet — add one if a talent
   needs "move anywhere up to N ft".
4. **Permissions:** caster moves itself directly; pushing an enemy relays to the one active GM. No
   GM online ⇒ the push is skipped (warned), same gating as the def-buff/timed-status writers.

## Other Momentum/Frenzy mechanics added alongside (not movement, but new)

- **Fast-turn gate** (`edhaIsFastTurn`) + test-rider fields `whenFastTurn`, `firstTestThisTurn`,
  `whenAttribute` — Burning Drive (first Physical test on a Fast turn), Frenzied Tempo
  (advantage on Presence/Influence tests on a Fast turn).
- **Charge gate** `whenMovedTowardFt` on the damage-rider + `edhaMovedTowardFt` (net displacement
  toward the target since turn start) — Momentum's Edge (`bonus = @movement.walk.rate`).
- **Rally stack** (`edha-rally-stack`) — a +1-to-your-tests counter capped at Red rank, reset per
  turn (Battle Fever) or round (Feeding Frenzy). Owner's stack is enforced; allies-in-range sharing
  is narrated, and Feeding Frenzy's "enemy attacks enemy" trigger (no system hook) is bumped via
  `edha.rally(token)`.
- **Breaking Point** — GM-side `cosmere-rpg.applyDamage` watcher: a creature struck a 2nd time in a
  round inside a Breaking Point owner's Attunement Range becomes Disoriented (once/round/creature).
- Name-driven cards reusing existing primitives: Shatter Focus (focus drain), Emotional Overload &
  Reckless Gambit (`nextTestMod` dis/advantage; Gambit also toggles `exhausted`), Reckless Momentum
  (`plotDieNext`), Incite (forced-action card — the **one genuine engine gap**: a creature's
  *volition* can't be automated, only the "lose its Reaction" consequence).

## Open items to verify in a real Foundry session

1. `@movement.walk.rate` actually resolves in `getRollData()` (Momentum's Edge bonus). If not, swap
   the bonus formula to the correct roll-data alias.
2. `CONFIG.Canvas.polygonBackends.move` is the right collision backend on the live Foundry/cosmere
   version (else `edha-push`/`edha-move` travel full distance — still functional, just not wall-aware).
3. `turnSpeed` flag value is the string `"fast"` (the code matches case-insensitively on "fast").
4. `exhausted` toggles via `toggleStatusEffect` on NPCs through the GM relay.
5. The `use` event fires `edha-move` for Reckless Advance / Explosive Leap activations.
