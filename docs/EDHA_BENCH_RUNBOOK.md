# EDHA Bench Runbook — the agent-driven bench (2026-07-26)

How a Claude session runs the in-Foundry bench itself, through the in-app browser at
`http://localhost:30000`, instead of leaving every row for Ben. Approved by Ben 2026-07-26
("Could you take control of the PC and do the Foundry tests yourself?" — yes, via browser).
Sessions still **cannot launch Foundry** — everything here requires Ben to have it running.

## One-time setup (Ben) — ✅ DONE and join-verified 2026-07-26

- Foundry running on port 30000 with the **edha** world launched.
- A **Gamemaster user named `Bench`** exists with a **BLANK password** (the agent is not
  permitted to type passwords into login fields, ever, even user-supplied ones). Verified: a
  passwordless join as Bench reached the world, GM true, edha-content active, system 2.1.0.
- Ben stays logged in as himself (a user's session is single-login; the dedicated user exists
  so the agent never collides with Ben's). Ben can watch everything live.

## Ben's standing rulings (2026-07-26)

- **Scene:** use the EXISTING **"Playtest Map"** scene (it is the active scene — view it,
  never activate/deactivate). Do NOT create a bench scene. The setup script places tokens
  only when its `PLACE_TOKENS` flag is set, offset from an `ORIGIN` you choose after looking
  at the map for a clear area.
- **Player characters "Tem parinaem" and "Soggy Bottom" are UNTOUCHABLE** — never write to
  them, never target-and-fire effects that write to them, never delete their tokens. The
  setup script hard-throws on their names.

**The next run's paste-ready prompt lives in `docs/BENCH_NEXT_RUN.md`** — each run ends by
rewriting that file for the run after it (run 1 → run 2 = White+Blue, run 3 = Black+Green,
then the deities, Heroic, and the non-tree console-runnable sections).

## Per-run checklist (the agent)

1. **Join:** browser pane → `http://localhost:30000/join` → select **Bench** → Join (no
   password). If Bench shows as already active, STOP and ask Ben to free the session.
2. **Health check** (console via javascript_tool), screenshot as the run header:
   `game.world.id === "edha"`, `game.modules.get("edha-content")?.active`, `!!globalThis.edha`,
   `game.system.version`. Mismatch → stop, report.
3. **Setup:** run `scripts/bench-setup-console.js` in the console. Verify the summary log
   (⚠ lines = talents/paths not found — fix the script, don't improvise). Run it a SECOND time
   and confirm idempotency (no new creations). Then **view** "Playtest Map", find a clear
   area, set `ORIGIN` + `PLACE_TOKENS = true`, and run once more to place the bench tokens.
   Never *activate/deactivate* a scene (it yanks every connected client, including Ben's).
4. **Run order:** `BENCH — Engine-wide` first — if **2bA-7** (the edit-round-trip) fails, stop
   the whole run and report; everything rides on it. Then White → Blue → Black → Red → Green,
   the ten deities, Heroic, then whatever non-tree sections are console-runnable.
5. **Per row:** select the section's bench PC token → target via
   `game.user.targets` API (`token.setTarget(true, {releaseOthers: true})`) → trigger by the
   row's own verb (sheet click for UI rows; `actor.items.getName("X").use()` for mechanics) →
   read the outcome off `#chat-log` (read_page) + assert actor/status state in the console →
   screenshot the card for evidence. Combat-timing rows: create a Combat on the bench scene,
   run it, and **delete that combat afterward**.
6. **Multi-client rows:** a second browser tab as an unused *player* user MAY displace the
   Bench cookie session. If it does: run those rows as a separate player-phase (rejoin as
   Bench after), or leave them ⚑ for Ben's two-client bench. Never join as a user Ben uses.
7. **Recording (per run, one commit):**
   - **PASS (mechanical):** the row is retired — deleted from `EDHA_FOUNDRY_TEST_CHECKLIST.md`
     and named (with its 2b id) in that run's single dated handoff delta, one line of evidence
     each ("card text quoted / status applied and expired / screenshot in session transcript").
   - **FAIL / PARTIAL:** the row stays open with a dated inline observation appended; the
     batch becomes the next `test-pass-fixes` input. Do NOT symptom-patch mid-run.
   - **Feel/design rows, canvas-precision rows** (template placement feel, vision nuance),
     and anything needing Ben's judgment stay ⚑ untouched for Ben.
   - Then: rebuild the dashboard, run the gates, commit (`Bench run N (<tree>): X retired on
     evidence, Y fails -> test-pass-fixes`).
8. **Safety rules (hard):**
   - Only create/modify inside the "Edha Bench" folders. Adversaries needed as targets are
     imported FRESH from the pack into the bench folder — never Ben's placed campaign tokens.
   - No deletion of any pre-existing document; the only combats deleted are bench-created.
   - No world-settings changes, no scene activation, DEPLOY STATE untouched (agent findings
     go in the delta; only Ben advances DEPLOY STATE).
   - Chat spam is accepted (Ben's call, 07-26); end the run noting Ben may flush bench chat.
   - Before/after sweep: snapshot document ids (actors/scenes/combats/macros) at run start and
     end; anything outside the bench folders changed = report it in the delta, prominently.
   - **Log out — always the last in-world act:** `game.logOut()` in the console, then confirm
     the join screen lists Bench as selectable again. A session that ends without this HOLDS
     the Bench slot and the next session cannot join (run 1 did exactly that; Ben had to ask).
9. **Pilot rule:** the first run executes ONE tree (Red — smallest live surface, the
   migration's pipe-cleaner talents) end-to-end through recording, delta, dashboard, commit —
   then scale to multi-tree runs.

## Operating lessons from run 1 (2026-07-26h — read before driving Foundry)

- **Combat rows: `game.combat` is the client's VIEWED combat, not the active one.** After
  `Combat.create({active: true})`, call `ui.combat.initialize({combat, render: true})` and
  verify `game.combat.id` matches — otherwise every fast/slow read and watch round-key silently
  consults whatever combat the tracker was already viewing (Ben usually has a campaign combat
  open; this masqueraded as a Breaking Point "stale tally / never re-arms" bug for half of
  run 1). Never modify Ben's combat; only view yours.
- **Foundry v13 selectors:** there is no `#chat-log` — read `ol.chat-log` (step 5's `#chat-log`
  is v12 phrasing).
- **Hidden-pane animation freeze:** when the browser pane isn't displayed, the PIXI ticker never
  runs, so token moves hang mid-animation on the agent's client (document `_source` is correct;
  prepared x/y is stale). Move with `tokDoc.update({x, y}, {animate: false})` and call
  `tokDoc.reset()` after; verify `tok.object.center` before any range-dependent row. Screenshots
  are also unavailable in that state — record quoted card text + console-asserted state instead,
  and say so in the delta.
- **`item.use()` blocks on the ItemConsumeDialog** (cost confirmation): await ~2s, then click
  the dialog's `[data-action=continue]` button via DOM. Damage cards apply via their
  `[data-action=apply-damage]` buttons — the ×1 button applies to the card's stored targets.
- **Path grants auto-open PathItemSheet windows** (one per bench PC on creation) — close them
  (`foundry.applications.instances`) before DOM work.
- **Resource top-ups:** `system.resources.*.max` is a `{derived, override, useOverride, bonus}`
  object — compute the effective max; never write the object back as a value. Prepared
  Investiture on the synthetic bench PCs clamps below the override (cosmetic; refill by writing
  the source value).
- **On-hit rows need an IMPACT and an ENERGY weapon** and the compendium sweep only found keen
  ones — copy the found weapon, swap `system.damage.type`, and delete the copy at cleanup
  (run 1's "Bench Maul" pattern) until the setup script grows damage-type fixtures.
- **The Playtest Map is walled and busy** — pick ORIGIN analytically (per-cell wall+token scan;
  run 1 used (2100, 9000): PC column parked in the far-left corridor col 7, targets inside the
  lower-left room cols 9–16, Isolated at (31, 31)) and move the ACTIVE tree's PC into the room
  for its rows. The scene also carries a Ben-made teleport Region — keep bench tokens out of it.

## Operating lessons from run 2 (2026-07-26i — read these too)

- **A silent handler is usually a FORMULA, not a gate.** Four White talents looked dead; all four
  were `edhaEvalSync` returning 0 on a dice formula (v13 `evaluateSync()` throws on die terms).
  Before blaming selection or ranges, substitute a **flat** amount into the rule on the bench actor
  and re-trigger: if the card appears, the gates were never the problem. Restore the formula after.
- **Adversary abilities that roll a test need `activation.skill`.** A non-attack adversary item
  carrying `edha-def-test` is built as `utility` with no skill, so no roll ever fires, the contest
  times out, and the only visible symptom is "the cost was charged and nothing happened". Check
  `item.system.activation.skill` before calling it a wiring bug.
- **Import adversaries FRESH from the pack** (`Bench Adv — <name>` in the bench folder). That takes
  the DEPLOY-STATE ⟳ Sync caveat off the table entirely — a failure on a freshly-imported copy is a
  real failure, not a stale snapshot, and you can say so in the delta.
- **A row that "fails" on turn/round state is usually your combat.** `_edhaTestedThisTurn` clears on
  `combatTurnChange`, and the cosmere combat model never fires one from `Combat.create` + console
  driving (`combat.turn` stays null, initiative is locked). `Hooks.callAll("combatTurnChange", combat)`
  is the honest way to simulate the turn boundary; without it, "first test this turn" rows read as
  broken when they are fine.
- **Click-to-place rows are drivable.** `edhaPickPoint` reads `canvas.mousePosition` on a
  `pointerdown` over `#board`. With the pane hidden, temporarily `Object.defineProperty` that getter
  to your chosen world point, dispatch a real `PointerEvent`, then restore the descriptor. Everything
  except the literal mouse plumbing is then exercised for real (walls, refunds, range gates).
- **Verify "nothing moves through it" with Foundry's own collision backend**, not by dragging:
  `CONFIG.Canvas.polygonBackends.move.testCollision(a, b, {type: "move", mode: "any"})`, plus an
  empty-lane control ray so a `true` means something.
- **Scope end-of-run cleanup to an id-diff against THIS run's start snapshot.** Run 2 swept every
  actor carrying the `summon` flag and deleted two that pre-dated it (run-1 leftovers). Compute
  `added = now − start` and delete only that.
- **Log out when you finish** — `game.logOut()` in the console, then confirm `Bench` is selectable
  again on `/join`. A session left joined blocks the next run at its very first step (run 2 opened
  by being locked out by run 1's still-live pane).

## Operating lessons from run 4 (2026-07-26m — these OVERRIDE older advice where they conflict)

- ❌ **`tokDoc.update({x, y})` is DEAD for token movement** under v13 + cosmere 2.1.0 — it throws
  `Cannot read properties of undefined (reading 'testPoint')` from the Region movement segmentiser
  and silently leaves the token where it was. Run 2's `{animate: false}` advice is stale. Use
  **`tokDoc.move({x, y, action: "displace"}, {animate: false})`** + `tokDoc.reset()` for staging,
  and **`action: "walk"`** when the row needs wall collision or Region enter-triggers to fire
  (`move()` returns `false` when a wall refuses the walk — a usable assertion in its own right).
- **Right-click cancel is a `contextmenu` event, not a right-button `pointerdown`.** A
  `pointerdown` with `button: 2` leaves the pick LIVE (the range-ring template stays on the canvas
  and the next left click still places, which reads as "the cancel didn't refund"). Dispatch
  `new MouseEvent("contextmenu", {bubbles: true, cancelable: true, button: 2})` on `#board`.
- **`item.system.events` is a `RecordCollection`, not an array.** Writing an array back with
  `item.update({"system.events": [...]})` is a no-op that reports success — which will make a
  rule-2b document-edit row look like a FAIL when the edit never applied. Edit with the dot path:
  `item.update({"system.events.<ruleId>.handler.<field>": value})`.
- **Marker-ledger entries SNAPSHOT the formula at placement.** To prove "the document drives the
  roll", edit the formula FIRST, then place, then detonate/spring. Editing after placement changes
  nothing and is not evidence of a bug.
- **Re-adding a talent to a bench PC needs `edha.skipBudget(true)`** — the level-7 talent budget
  silently refuses the create while `syncActorTalents` still reports success on the shorter list.
- **Resource writes clamp to the effective max.** Topping a bar up past max reads back as max; do
  not mistake the clamp for a spend when verifying a "nothing spent" refusal.
- **`actor.applyDamage([{amount, type}])` is the only honest console damage.** A raw
  `system.resources.hea` edit does NOT fire the damage watches (Set Charge's `target-damaged` arm,
  Mender's hp-threshold offer) — though it does still fire the defeat watches at 0.
- **Harvest-style rows need an ADVERSARY-typed victim.** The `Bench Target — *` fixtures are
  `character`-typed and Reaper's Harvest skips them by design (that is the "a PC drop harvests
  nothing" branch). Clone the adversary-typed `Bench Target — Undefended` for cheap victims.
- **Deity two-entry trees compile as AND across skill groups, OR within a talent group.** A
  multi-talent prerequisite group is satisfied by `.some()`; separate groups by `.every()`
  (`systems/cosmere-rpg/index.js:7782-7800`). So "Blue 2+; Red 2+" really does demand both, and
  "X or Y" really is either — read the compiled node, don't guess from the drawn tree.

## Operating lessons from run 5 (2026-07-27a)

- **Cloned fixtures keep `prototypeToken.name`.** Staging victims by `toObject()`-cloning a
  fixture gives tokens that still carry the ORIGINAL name — set both `name` and
  `prototypeToken.name` (and rename any already-placed token) or every
  `scene.tokens.find(t => t.name === …)` lookup misses.
- **`combat.update({turn})` DOES fire the system turn-change when moving off an already-set
  turn.** Run 2's "the model never fires one" holds only while `turn` is null. Drive a boundary
  with update() alone, and only fall back to `Hooks.callAll("combatTurnChange", …)` if no watch
  fired — doing both double-posts turn-start ticks.
- **Roster cross-talk is constant, and it can EAT a row's numbers.** The 15 bench PCs' always-on
  watches fire scene-wide out of combat: Breaking Point (Red) statuses targets on anyone's hits,
  and Devoted Conduit (White) silently reduced a Lifeline self-hit to 0 (the row was saved by
  its card text, not the HP delta). Read every stray card's OWNER before attributing it, and
  prefer card-text assertions over bare HP deltas when a reducer might be watching.
- **A refusal can live in `ui.notifications` only** — pre-cost vetoes (Shatter Focus, Spreading
  Omen) post NO chat card; scrape `#notifications .notification` alongside the chat window or a
  clean refusal looks like a silent nothing.
- **H3 raw-flag reads are PRE-reconcile.** After a release, `flags…lists.<key>` may still show
  the entry; the mark-wins reconcile drops it on the next write/read. Assert ledger counts from
  the NEXT place card ("(1/2)"), not the raw flag.

## Operating lessons from run 7 (2026-07-27e — these OVERRIDE older advice where they conflict)

- ❌ **`tokDoc.move()` THROWS a cosmetic `#panCanvas … clientWidth` TypeError when the moved token is
  CONTROLLED and the pane is hidden — and the move ALREADY LANDED.** Release control first, wrap in
  try/catch, then verify `td.x`/`td.y`. Run 4's "move() is the way" stands; what's new is that a throw
  is not a failure.
- ❌ **Never resolve a token by NAME when duplicates can exist.**
  `scene.tokens.find(t => t.name === "Combat Construct")` matched the run-1 **orphan** ahead of the
  live summon and silently redirected three moves onto a token this run was told to leave alone. Use
  `scene.tokens.find(t => t.actorId === id && !!t.actor)` or the token id.
- ❌ **With the pane hidden the ChatLog renders NOTHING** — `ol.chat-log` has 0 children and
  `ui.chat.render({force: true})` throws on a null style, so every `[data-message-id]` selector misses
  and card buttons look absent. Hand-render what you need: `const h = await msg.renderHTML();`
  appended into `ol.chat-log`. After that, button selectors and the app's delegated listeners work.
- ❌ **The cosmere sheet's `use-item` action ignores `MouseEvent("click")`; it needs a real
  `PointerEvent`.** Run 6's "dispatch the full pointer sequence" is right about the sequence and wrong
  about the constructor — build `pointerdown`/`pointerup`/`click` as `PointerEvent`.
- **System attack/action cards have EMPTY `content`** (they render from `flags["cosmere-rpg"].message`),
  so their apply-damage buttons are unreachable while hidden. Drive the same pre-pass honestly:
  `edhaDealerOf` falls back to the last damage roll within **15 s**, so `target.applyDamage([...])`
  inside that window attributes the dealer + item exactly as the button would. This is how Tempered
  Edge, the Siege-Cannon negative, and the Momentum/Fury riders were measured.
- **Foundation / Civ turn-start rows fire on `updateCombatant` with `flags.cosmere-rpg.activated` →
  true** (the cosmere activation model), NOT on `combatTurnChange` and NOT on `combat.update({turn})`.
  Driving the wrong hook reads as a dead buff.
- **A talent whose flow is two sequential `edhaPickPoint` calls** (Trade Routes) looks exactly like a
  silent post-cost no-op to a dialog-walking harness. If the cost was charged and nothing happened,
  scrape `ui.notifications` for a live "Click inside…" prompt BEFORE calling it a bug.
- **A DialogV2 `cancel` BUTTON cannot be driven synthetically** — activating a submit button
  programmatically falls through to the `default` button, so a Cancel click reads as OK. Use the
  header close (X) instead: it takes the same `!picked` branch, so the refund path is still provable.
  Say which one you drove.
- **Don't hand-write an H3 ledger while a queued RMW may be in flight.** Doing so ate a `linked: true`
  write and briefly looked like a Weave defect; a clean run wrote it correctly. Stage via the talent
  where you can.
- **Hook `ui.notifications.warn/info/error` at run start, not per row.** Pre-cost vetoes live only in
  notifications, and the on-screen `#notifications` list rotates entries out within seconds — a batch
  that times out loses its evidence. A persistent capture array survives.
- **Keep each `javascript_exec` under ~25 s.** Anything that arms a talent, walks dialogs and asserts
  will exceed the 30 s tool timeout; the world keeps running, so a timeout leaves a half-driven flow
  (an open dialog or a live pick) that poisons the next row. Split, and re-inspect before continuing.
- **Snapshot per-actor `flags["edha-content"]` at run start**, not just document ids. Run 7's document
  id-diff was clean but it could not attribute the roster's flag litter — including whether `aggro`
  disappearing off Bench Ally — One was its own doing.

## Known limits

- ❌ **RESOLVED AS UNFIXABLE (07-26i): there is no "no written Cognitive/Spiritual defense" creature.**
  The old note here said to swap the `Bench Target — Undefended` fixture for a pack adversary that
  genuinely lacks those defenses. **None exists and none can be made** — the cosmere schema always
  derives a numeric `system.defenses.*.value` (floor 10), and all **52** pack adversaries read a
  Cognitive defense. `edhaReadDefense` therefore never returns null and **H1's fail-open branch is
  unreachable for `vs: defense`**. Test the observable half instead (the talent resolves against the
  derived defense; the old manual click-card is gone) and say so rather than reporting a FAIL.
- Wall/vision rows: the Playtest Map has its own walls — use an existing wall where one is
  handy; if a temporary wall must be drawn, delete THAT wall afterward (bench-created, so
  deletion is allowed) and never touch the map's own walls.
- Rows needing a linked PLAYER client (belief loops, whisper visibility) follow §6; when the
  cookie displacement bites, they are ⚑ Ben rows.
