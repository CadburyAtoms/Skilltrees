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

> **Deploy-script rule (2026-09-05, learned twice):** `scripts/deploy-to-foundry.bat` pulls `main`
> *during* its run, so a fix to the script itself only protects the run AFTER the one that pulls it —
> and `cmd` resumes a rewritten batch file by byte offset. When the script has changed on `main`,
> `git pull` FIRST, then run it; if a run hangs on a prompt, close the window rather than answering.
> Verify any deploy by hash from both sides (CRLF-normalised) before driving a row.

1. **Join:** browser pane → `http://localhost:30000/join` → select **Bench** → Join (no
   password). If Bench shows as already active, STOP and ask Ben to free the session.
2. **Health check** (console via javascript_tool), screenshot as the run header:
   `game.world.id === "edha"`, `game.modules.get("edha-content")?.active`, `!!globalThis.edha`,
   `game.system.version`. Mismatch → stop, report.
3. **Setup:** run `scripts/bench-setup-console.js` in the console. Verify the summary log
   (⚠ lines = talents/paths not found — fix the script, don't improvise). Since 2026-09-05 (item
   37) the setup script also detects and repairs ORPHAN tokens on the Playtest Map — a token whose
   `actorId` resolves to no actor — printing a ⚠ per orphan and a final `orphans: N repaired, M
   replaced` count; treat a nonzero count on a first run as expected repair work, not a failure,
   but a nonzero count on the SECOND run below is a regression. Run it a SECOND time
   and confirm idempotency (no new creations, `orphans: 0 repaired, 0 replaced`). Then **view**
   "Playtest Map", find a clear area, set `ORIGIN` + `PLACE_TOKENS = true`, and run once more to
   place the bench tokens. Never *activate/deactivate* a scene (it yanks every connected client,
   including Ben's).
4. **Run order:** `BENCH — Engine-wide` first — if **2bA-7** (the edit-round-trip) fails, stop
   the whole run and report; everything rides on it. Then White → Blue → Black → Red → Green,
   the ten deities, Heroic, then whatever non-tree sections are console-runnable.
5. **Per row:** select the section's bench PC token → target via
   `game.user.targets` API (`token.setTarget(true, {releaseOthers: true})`) → trigger by the
   row's own verb (sheet click for UI rows; `actor.items.getName("X").use()` for mechanics) →
   read the outcome off `#chat-log` (read_page) + assert actor/status state in the console →
   screenshot the card for evidence. Combat-timing rows: create a Combat on the bench scene,
   run it, and **delete that combat afterward**.
6. **Multi-client rows — use `PlayerBench`.** Ben created a dedicated passwordless **player**
   (non-GM) user named **`PlayerBench`** (id `yF9LHvfhB7otsHYY`) on 2026-07-27 for exactly this.
   Never join as `Gamemaster`, `Amertron`, `Laustarr` or `Spidercam` — those are Ben's and his
   players'. The procedure, as actually executed in run 13:

   a. Join `Bench` in the **`seed`** pane tab first; health-check, hash-verify, snapshot.
   b. `tabs_create` → new tab (e.g. `tab-1`) → `navigate` to `http://localhost:30000/join` →
      select `PlayerBench` → Join, **blank password**. Drive each tab **by its own `tabId`**.
   c. ⚠️ The new tab opens at **0×0**, so its canvas never initialises (`canvas.ready` false).
      `resize_window` **and then reload** — run 10's lesson applies to the second tab too, and
      it costs you a whole row if you miss it.
   d. **Verify `Bench` survived**, from Bench's own socket: `game.users.filter(u => u.active)`.
      **Run 13 measured NO displacement** — `Bench`, `Gamemaster` and `PlayerBench` were all
      active simultaneously in separate pane tabs. The old warning that a second session *may*
      displace the Bench cookie is retained as a caution, not an expectation; if it ever does
      bite, that row stays ⚑ rather than being fought.
   e. **Grant `PlayerBench` OWNER on the bench PCs it needs** — bench-folder actors ONLY.
      Snapshot each actor's `ownership` block first and restore it at the end (run 13 did, and
      the end-state diff came back empty).
   f. **Log out BOTH clients** at the end and confirm BOTH are selectable on `/join`. A held
      player slot blocks the next run exactly like a held Bench slot.

   **One-PC-per-computer is a real staging step.** Ben's veil design assumes one PC per player
   machine. If `PlayerBench` owns *many* PCs, a belief ledger holding both a fooled and a seer
   observer resolves to "sees through" and you are testing the wrong thing. Narrow ownership to
   a **single** PC per direction and re-read — that is how run 13 proved both directions.
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

## Operating lessons from run 8 (2026-07-27g — these OVERRIDE older advice where they conflict)

- ❌ **Do NOT verify the deploy by counting markers — HASH the served engine.** Fetch it cache-busted,
  `replace(/\r\n/g, "\n")`, SHA-256, and compare against the repo file normalised the same way
  (`python -c "...open(p,'rb').read().replace(b'\r\n', b'\n')..."`). Two run prompts in a row have
  carried WRONG expected counts (07-27f: "expect 3" was 4, "expect ~8" was 5), which would make a live
  engine read as not-deployed. A hash cannot be misremembered. Note the raw byte lengths will differ
  (CRLF on disk, and JS `.length` counts UTF-16 units while Python counts bytes) — normalise, then hash.
- ❌ **Never sweep statuses by status id across `canvas.tokens.placeables` at cleanup.** Run 8 did, and
  deleted four pre-existing effects off Ben's campaign adversaries (`Weakened` ×3, `Prone` ×1). Only two
  were identifiable well enough to restore. **Snapshot per-actor ACTIVE EFFECTS at run start**, not just
  document ids and `flags["edha-content"]`, and delete only the diff — the same discipline the id-diff
  already gets.
- **Turn-start watches do NOT all fire on the same hook.** Accumulate (Knowledge) fires on
  `combat.update({turn})` and NOT on the `flags.cosmere-rpg.activated` flip; Foundation/Civ (run 7) is
  the exact opposite. Try one, then the other, and record which worked for that talent.
- **`RollConfigurationDialog` / `AttackConfigurationDialog` submit is `data-action="submit"`** (label
  "Roll") and the window has no `footer` or `.form-footer`. A dialog-walker keyed on
  `continue|confirm|ok` leaves attack rolls hanging invisibly. Match `submit` and `roll` too.
- **`edhaDealerOf`'s 15 s window is measured from the damage ROLL.** If a `javascript_exec` times out
  at 30 s between the roll and your `applyDamage`, you are outside it and every on-hit rider reads as
  dead. Roll and apply inside the SAME exec.
- **A negative needs a positive control in the same round.** "The forced slide didn't prompt" and "the
  second walk didn't prompt" are the same observation once a once-per-round gate is live — run 8 ran the
  control, could not separate the causes, and recorded 2bV-2's forced-slide half as UNPROVEN instead of
  claiming it. Accumulate's out-of-range negative got a back-in-range control and is a real result.
- **A card that prints a count may be printing INTENT, not state.** Studied Mark says "bears 2 Insight"
  while the stored counter is 0, because the poster returns the clamped value it asked for without
  reading it back. When a number matters, assert the document field, never the card.
- **Ally-attacker rows: the `Bench Ally — *` fixtures carry NO weapons** (the setup script only arms
  PCs). Use another bench PC as the ally attacker — but expect its own on-hit riders in the log
  (Bench — Heroic fires five cards per hit). Read every stray card's owner before attributing it.
- **Scene-wide AoE catches Ben's placed campaign tokens.** Final Decree's "every enemy in Attunement
  Range" bound five of Ben's playtest adversaries. That is the talent behaving as written, but it is a
  write to documents you did not choose — clean it, and report it.

## Operating lessons from run 10 (2026-07-27k — these OVERRIDE older advice where they conflict)

- ❌ **A browser pane that opens at 0×0 means Foundry NEVER INITIALISES THE CANVAS**, and it fails
  quietly: `game.ready` goes true, `scene.view()` resolves, but `canvas.ready` stays false,
  `canvas.scene` is null and there are no placeables — so no targeting, no token work, no screenshot.
  Re-initialising is worse: `canvas.initialize()` throws `Impossible to create a PIXI plugin for
  OccludableSamplerShader … [pluginName=batchOcclusion]`. The fix is `resize_window` to desktop
  **and then reload the page**. Do this BEFORE the start snapshot — the reload wipes every in-page
  global, including your snapshot and your `ui.notifications` hook.
- ❌ **Under v13 with Advanced Encounters live, `tokDoc.update({x,y})` and `tokDoc.move()` BOTH
  silently no-op** for a combatant that has no movement left — they resolve without throwing and the
  token simply does not move, which reads as "the row's range gate is wrong". Run 4's "move() is the
  way" and run 7's "a throw is not a failure" are both superseded for this case:
  `scene.updateEmbeddedDocuments("Token", [{_id, x, y}], {teleport: true, animate: false})` lands, and
  it returns the new coordinates so you can assert them.
- ❌ **`system.deflect.derived` is NOT the deflect. Read `system.deflect.value`.** `derived` is the
  armour-only sub-field and never folds in `bonus`, so a stance or aura writing `system.deflect.bonus`
  leaves `derived` at 0 and looks like a silent no-op. Run 10 nearly shipped a false FAIL on
  Stonestance from exactly this; the truth is `value` 0 → 1, and 10 impact damage cost 9 HP instead
  of 10. The engine agrees — `edhaDeflectOf` reads `.value`. **Any "the buff didn't apply" reading
  deserves a damage-delta control before it becomes a FAIL.**
- **Feed the setup script in by `<script src>` from a scratch `python -m http.server`, not by pasting
  it.** Script tags are not CORS-restricted, the file stays the repo's copy (so you are testing what
  is committed), and it costs no context. Hook `console.warn` first — that is where its log goes —
  and give it **~35 s**: it fetches three packs and syncs sixteen actors before printing anything.
  An empty log is not a failure.
- **Talent `use()` opens a "Consume Resource" DialogV2 even with `{configurable: false}`.** Its button
  is `Continue`. A dialog walker matching only `continue|confirm|ok|submit|roll` on `data-action` will
  miss it — match the button TEXT too. And when a talent does nothing, check resources before blaming
  it: "Cannot consume, not enough of resource" is a legitimate pre-cost veto that lives only in
  notifications.
- **Bench PCs are placed several squares apart, so most range gates refuse by default.** Measure
  Chebyshev distance × `scene.grid.distance` before driving any ranged row, and move your own token
  rather than concluding the gate is broken — Decisive Command's 40 ft refused at 85 ft and worked at
  35 ft, which is the row passing, not failing.
- **A skill-key audit of a whole path costs one exec and is worth it.** Walk every talent's
  `system.events` + `activation`, pull `@skills.xxx.` and every `skill`/`whenSkill` field, and diff
  against `Object.keys(CONFIG.COSMERE.skills)`. Run 10 did this for all 62 Heroic talents and proved
  the pending rebuild closes the entire dead-key family with none hiding — which is what turned "8
  rows blocked" into a defensible claim.
- **Restoring flags at cleanup can race in-flight engine writes.** A single `update({"flags.edha-content": null})` followed immediately by a re-set left six actors dirty because watchers
  re-wrote between the two. Unset the specific stray KEYS with `unsetFlag`, one at a time with a short
  wait, then re-diff — two passes, then a third confirming pass that must come back empty.

## Operating lessons from run 12 (2026-07-27o — these OVERRIDE older advice where they conflict)

- ❌ **Read `_source` before you call ANY engine move dead.** A Shockwave Slam push that worked perfectly
  read as `x` unchanged and `delta 0` on the prepared document, because the pane's PIXI ticker is parked
  and the animation never completes. `_source.x` was already at the destination. Run 1 documented this
  for moves *you* make; run 12 nearly recorded a false FAIL on a move the ENGINE made, on the exact row
  that was about a dead push. `tokDoc.reset()` afterwards re-syncs the prepared value.
- ❌ **`doc.move({action: "displace"})` is NOT a forced move, and run 8's 2bV-2 attempt turned on this.**
  The Order watcher (and every other voluntary-movement consumer) discriminates on `options.edhaForced`,
  which only `edhaMoveTokenTo` stamps. A raw `displace` is *unstamped*, which the engine deliberately
  treats as ambiguous → it SHOULD prompt. To drive a genuine forced move, trigger a real engine push
  (a weapon hit that carries an `edha-push` rider works and needs no internals).
- **A token that refuses to move, returns no error and logs nothing may be VETOED.** Three `teleport`
  updates and a `move()` all resolved and did nothing; the only evidence in the world was a
  notification — "Dread Presence: … is Weakened and cannot willingly move closer to Wrenchmaster." A
  status YOU applied earlier plus one of Ben's placed adversaries is enough to trigger it. This is why
  the `ui.notifications` capture is hooked at run start, not per row.
- **A dialog walker MUST click each button at most once.** A walker that re-scans every 300 ms will
  re-click the same live button until the DOM node goes away — run 12's first Censure drive logged
  4× Continue and 4× Roll for ONE use. The world deduped, but the log is unreadable and would falsely
  suggest a double-application on any row that is about double-application. Keep a `WeakSet` of clicked
  elements.
- **`ui.combat.initialize({combat})` does not always take on the first call.** After it, `game.combat`
  was still Ben's campaign combat — so `game.combat.round`, which the Order once-per-round gate reads,
  was HIS round, not yours. Call it, assert `game.combat.id === yours`, and call it again if it didn't
  take. (Create the bench combat with `active: false`; never activate.)
- **`setFlag` MERGES, so restoring a snapshot value does not delete sub-keys you added.** Cleanup left
  `bpHits` with extra round-keys and `markedBy.edict` behind even after a "restore". The fix is
  `unsetFlag(key)` → wait → `setFlag(key, snapshotValue)`. Also: the JSON-string comparison used to
  find residue is **key-order sensitive** — compare key-by-key or you will chase a phantom diff.
- **Combat-scoped flags legitimately disappear when you delete your bench combat** (`combatExpire`,
  `aggro`, `trigRound`). Do NOT restore them — that recreates state the engine considers ended. Report
  them as engine-swept instead.
- **The first token move right after joining can throw from Region geometry**
  (`#testSamples … reading 'testPoint'`). It is transient — the scene's regions are not built yet.
  Retry once before concluding anything.
- **Before calling a row a "roster gap", check whether the thing is a TALENT at all.** 2bC-8 sat blocked
  on a prescribed `bench-setup-console.js` change that could never have worked: Probability Net is an
  **adversary** ability in `data/adversaries.json`, so no talent-pack name list can reach it. Importing
  the adversary fresh from the pack — the standing procedure — ran the row in two execs.

## Operating lessons from run 13 (2026-07-27p — the first two-client run; these OVERRIDE older advice)

- ❌ **`isVisible` on a player client is worthless until you prove base vision works.** The very
  first veil read came back `false` for the original AND the copy — which looks like a defect and is
  not. `isVisible` was `false` for **all 54** non-owned tokens, because **bench PCs carry a 10 ft
  `sense` vision range** (`sight.range: 10, visionMode: "sense", brightness: 0`). A GM never notices;
  a player client renders almost nothing. **Sample every placeable and count how many are visible
  before attributing a single `false` to the mechanic under test.** Fix by widening the observer
  token's `sight.range` (snapshot and restore it) — do NOT conclude the veil is broken.
- **The veil resolves per USER, not per token, so many-PCs-one-player tests the wrong thing.**
  `edhaPhantomVeilHides` reads *every* observer the user owns: hold both a fooled and a seer and the
  `mineFooled && !mineSaw` branch can never fire, so the original is never hidden. Narrow ownership
  to **one** PC per direction. Two ownership flips proved both directions off a single cast.
- **A GM-only card still reaches the player's `createChatMessage` hook.** Foundry broadcasts the
  document and filters *rendering*. A hook-level capture will show you the GM sweep card on the
  player client and it means nothing. **For any "does the player see X" row, read the rendered DOM —
  `ol.chat-log li.chat-message` — not the hook.** Both the Black Draw Mana row and the illusion GM
  card turn on exactly this distinction.
- ❌ **Do not read `combatant.initiative` with Advanced Encounters installed.** It is a *derived
  getter* in the module, not the stored field, and it **throws** (`Cannot read properties of null
  (reading 'system')`) when any combatant's actor is missing. Read `combatant._source.initiative` —
  which in this world is `undefined` for every combatant, so `actsAfterCaster` cannot be verified by
  reading initiative at all. Run 13 nearly recorded a false FAIL off the derived `0` vs `502`.
- **One orphaned combatant wedges the whole tracker.** A summon whose actor was deleted left a
  combatant behind, and after that *every* `createEmbeddedDocuments("Combatant", …)` threw from AE's
  `setupTurns`. If combat setup starts failing for no reason, sweep `combat.combatants.filter(c => !c.actor)` first.
- **Two GM clients are a TEST CONDITION, not noise.** Ben's `Gamemaster` being connected is what
  exposed the doubled dissipates card. When a card may double-post, check `message.author.name` on
  each copy — that names the offending client directly and takes one exec.
- **A "refunded" notification is not a refund.** Assert the resource. Run 13's refund bug prints a
  perfectly correct refusal message while the resource is wrong — and wrong in *different directions*
  from different starting values, which is the signature of a **race between two absolute writes**
  rather than an off-by-one. Vary the starting value: if the sign of the error flips, stop looking
  for arithmetic and start looking for ordering.

## Operating lessons from run 14 (2026-07-27r — these OVERRIDE older advice where they conflict)

- ❌ **A duplicate card with two GMs is NOT automatically a fix failure — find out which build the
  OTHER client is running, and you can do it from your own socket.** Run 14 saw every newly-gated
  site double and could still clear the fix, because a guard that predates the fix acts as a
  **build fingerprint**: the recast break card is gated on the older `game.user !== game.users?.activeGM`
  and posted exactly ONCE, which proves the other client computes the same `activeGM` and honours
  that designation — so if it were running the new engine, `edhaDefBuffGmGate()` (which reads the
  same designation) would have suppressed its copy too. **Before reporting any one-applier row,
  find a site gated by the OLD mechanism and one gated by the NEW one, and fire both in the same
  session.** Ben's client is often several deploys behind; an engine-only fix needs his F5.
- ❌ **`edhaDropRuleIndex()` is never called — the rule index NEVER invalidates.** Anything you add
  to the world mid-session (an imported adversary, a granted talent, a summon) is invisible to any
  handler type whose index was already built. **Import your adversaries FIRST, then reload the page,
  then test** — or you will record a false FAIL. Persist your snapshot through the reload with
  `sessionStorage` (`__benchSnap`, `__imported`) and re-install the notification hook after; a
  reload wipes every in-page global.
- ❌ **Weapon `use()` is hard-vetoed by the action economy out of combat; talent `use()` is not.**
  "does not have enough actions to use <weapon>!" produces **no roll, no card, no damage** and looks
  exactly like a dead talent — whereas the identical warning on a *talent* is cosmetic and the talent
  proceeds. Every on-hit / rider row therefore needs the actor in a live combat with actions. This
  is what stopped 2bW-1.
- **Long token moves need `{teleport: true}`, and out-of-bounds parks fail SILENTLY.** A plain
  `{animate: false}` update is *pathed* by v13 movement and lands partway (run 14 got 8860 for a
  requested 19200) while still resolving without error. Read `_source` back and **assert the landed
  coordinates** before trusting any staging. Also check `scene.dimensions` first — `sceneX/sceneY`
  are non-zero (1900/3050 on the Playtest Map), so a "far corner" park at y=3000 is off-scene.
- **The dialog walker is not enough — engine pickers also post as CHAT-CARD buttons.** Reknit Form's
  injury picker renders as a `button.edha-reknit-btn` inside `ol.chat-log li.chat-message`, which a
  dialog-only walker never sees; the row reads as "posted a card and did nothing". Walk BOTH surfaces.
  And an empty prompt field is a false-FAIL generator: Counterpoint printed "DC ?" and still returned
  SUCCESS purely because the walker clicked Resolve with the DC box blank — **fill inputs before
  clicking, then re-drive**.
- **To isolate WHICH of two identical talent copies fired, park the other one out of range and add a
  both-parked control.** The veto toast names the talent and the approached ally but **not the owner**,
  so attribution is impossible without isolation — and the negative (both parked → move succeeds, no
  toast) is what turns two positives into a real result.

## Operating lessons from run 15 (2026-07-27t — these OVERRIDE older advice where they conflict)

- ❌ **Build a bench combat with `scene: null`, NOT bound to the scene.** v13's
  `Combat._onDeleteTokens` compares the Scene **document** to a scene **id string**
  (`(combat.scene !== null) && (combat.scene !== sceneId)` → always true for a scene-bound combat),
  so it `continue`s and **the token→combatant cascade never runs**. Run 15 read `combatantGone: false`
  twice and nearly failed a good fix; `combat.update({scene: null})` made it cascade first try. Ben's
  real campaign combat is `scene: null` — that is what the UI produces, so it is also the honest
  fixture. This supersedes the per-run checklist's "create a Combat on the bench scene".
- ❌ **Prime every Region's polygon tree on join, or the FIRST token move throws.**
  `RegionDocument.#testSamples` reads the **private** `#polygonTree` field while the tree is only ever
  built by the lazy **public** `polygonTree` getter, so until something touches the getter every move
  dies with `Cannot read properties of undefined (reading 'testPoint')`. Run 12 called this
  "transient — retry once"; **it is not** (run 15 retried twice, waited, activated the layer and
  called `object.draw()`, all still failing). The fix is one line, and it must be re-run after any new
  Region is created:
  `for (const r of canvas.scene.regions) void r.polygonTree;`
- ❌ **`edhaWatchersOfRule` is NOT a global** — it is module-scoped. Any checklist row telling you to
  run it in the console throws `ReferenceError`. Re-implement the sweep inline, and **use the engine's
  real predicate**: `i.type === "talent" || i.flags?.["edha-content"]?.adversaryTalent === true`.
  Filtering on `type === "talent"` alone **silently drops every adversary**, whose abilities are
  `trait`/`action` items — run 15's first transcription reported 1 watcher instead of 2 and made a
  freshly imported adversary look absent from the rule index.
- **Attribute Regions by the hook's `userId`, not by counting, and never by `_stats`.** Embedded
  Region documents carry **no `_stats`** in this world (`createdBy` is undefined), so "which client
  made this?" is unanswerable from the document. `Hooks.on("createRegion", (r, opts, userId) => …)`
  gives it directly — that is what turned "2 Regions appeared" into "one from `Bench`, one from
  `Gamemaster`" and let a one-applier row pass against a two-GM world.
- ❌ **Stage the fixture BEFORE applying the status the row is about.** Run 15 staged a token while it
  was already `weakened`, so the *staging* move was itself vetoed; the real move then had zero delta
  and read as "the veto did not fire" — a false negative on a mechanic that works. Assert the staged
  position landed before you apply anything.
- **A silent negative is only evidence if something else spoke.** When a drop produced no Combustion
  Chain card, the proof it was the talent's gate (and not a dead hook) was an *unrelated* card firing
  off the same `updateActor`. Always look for a co-firing effect to certify the event chain ran.
- **The action-economy veto is turn-scoped, not combat-scoped.** A weapon `use()` still refuses until
  the combatant is **activated** — set `combatant.setFlag("cosmere-rpg", "activated", true)` (what the
  tracker's activate button does). AE also keeps the budget at
  `flags["cosmere-advanced-encounters"].actionsAvailableGroups[0].remaining`. With AE installed
  `combat.turn` can stay `null` after `startCombat()`/`nextTurn()`; drive turns with
  `combat.update({turn: N})`, which does fire the engine's turn-boundary sweeps.

## Operating lessons from run 16 (2026-07-27x — these OVERRIDE older advice where they conflict)

- ❌ **`edhaResolveKiller` reads `canvas.tokens.controlled`, NOT the damage dealer.** Every
  `edha-on-defeat` row (Predator's Due, Reaper's Harvest, Warlord's Advance) resolves its killer from
  the **selected token**, falling back to `game.user.character` then `game.combat.combatant` — the
  15 s `edhaDealerOf` window does NOT apply here. Run 16 rolled the Alpha's attack, applied the kill
  4 s later and got nothing, because the Alpha's token was targeted but not **controlled**. Always
  `tok.object.control({releaseOthers: true})` the killer before dropping the victim.
- ❌ **A BACKWARD `combat.update({turn})` fires no turn-start events.** Going 1 → 0 within a round
  dispatched only `tokenTurnEnd`; the region's `tokenTurnStart` never came and a working hazard read
  as dead. Step **forward** — `combat.update({round: c.round + 1, turn: 0})` — which fires
  `tokenRoundEnd`, `tokenRoundStart` **and** `tokenTurnStart`. (`nextTurn()` leaves `turn: null`
  under Advanced Encounters, per run 15; `update` is still the tool, just forward.)
- ❌ **`whenFastTurn` cannot be driven from a bench combat at all.** `edhaIsFastTurn` →
  `edhaCombatantOf` reads **`game.combat`** — the ACTIVE combat. While Ben's campaign combat is
  active, a bench combat is invisible to it no matter what `turnSpeed` flag you set, and making yours
  active would deactivate his. Record such rows **BLOCKED, blocker named, still 🤖** — a technical
  blocker never becomes ⚑.
- **A formula that can legitimately roll 0 needs SAMPLES, not one drive.** `floor(1d6/2)` returns 0
  on a d6 of 1, and `edha-content.hazard` returns silently on `amt <= 0` — no damage, no card,
  indistinguishable from a dead hook. Run 16 nearly filed a defect on one zero; six turn-starts
  produced 2, 3, 1, 2, 3 keen and a clean pass.
- **Consume-resource confirms block `item.use()` and are NOT `dialog.roll-configuration`.**
  "Consume 1 Focus?" / "Consume 1 Investiture?" render as plain `dialog.application` with a
  **Continue** button. A walker matching only the roll-config selector hangs the exec for 30 s and
  the row reads "the ability did nothing". Walk **any** `dialog[open]`, matching
  `roll|continue|yes|ok`.
- **Bestiary rows are the cheapest rows in the corpus, but not 4.5-per-drag cheap.** Run 16 imported
  **15** distinct adversaries to cover **23** rows and retire **18** — about **1.2 retired per
  import**. Import once as `Bench Adv — <name>`, drive every row touching that actor, then move on.
- **Fingerprint the world against the pack instead of re-syncing.** Comparing all 46 world
  adversaries to their pack source on item names + `damage.formula`/`type` + `activation.type`/`skill`
  + every rule's `handler.type` is a few seconds of console and answers "is a sync owed?" with
  evidence. Run 16: **0 drift**, so `syncAllAdversaries()` was correctly not run.
- **The cosmere adversary sheet renders ONE move number.** Don't score "fly X shows as its movement"
  against the `movement.fly` field — the header shows a single "N ft MOVE", so a rate parked on
  `walk.override` displays correctly regardless of which slot holds it.

## Operating lessons from run 17 (2026-07-28 — these OVERRIDE older advice where they conflict)

- ❌ **Snapshot UNLINKED TOKEN-ACTOR flags too, not just `game.actors`.** Run 17's snapshot covered
  every world actor's flags and effects and still could not prove-and-revert a write: dropping a bench
  adversary to 0 HP fired `ally-drops` cues on **Ben's unlinked campaign token actors**, writing
  `trigRound` to each. `game.actors` does not contain them. Add
  `canvas.scene.tokens.filter(t => !t.actorLink).map(t => [t.id, t.actor.flags])` to the start snapshot.
  Note the shape of the exposure: an `ally-drops` cue with `rangeFt: 0` has **no range gate at all**, so
  **every same-disposition token on the shared scene** is eligible — parking your fixture far away does
  not help. Expect it, snapshot for it, and report it.
- ❌ **`item.use()`'s damage does NOT apply itself, and `[...].pop()` on the chat log's apply-damage
  buttons grabs a STALE card.** Six Keelshadow drives read "no on-hit cue" purely because the victim's
  HP never moved (30 → 30 across all six). Drive the roll with `use()` (that is where riders show up),
  then apply with `victim.applyDamage([{amount, type}], {edhaSource: dealerActor, originatingItem: item})`
  — the explicit dealer is what `edhaDealerOf` wants and what makes `edha-on-hit` dispatch at all.
- ❌ **`applyDamage` is the ONLY path that runs the GM-cue sweep.** A raw
  `actor.update({"system.resources.hea.value": 0})` fires **nothing** — `edhaGmCueDamageSweep` hangs off
  the applyDamage wrapper (`if (dealt) await edhaGmCueDamageSweep(...)`). A 60 → 0 write that posts no
  cue card is your harness, not the engine.
- ❌ **The belief roll's FORMULA never reaches chat — patch `Roll#evaluate` to see it.** The ambush and
  phantom belief cards print only the total, so "is the modifier real?" is unanswerable from the card
  unless the total exceeds what the buggy formula could produce. One read-only line settles it for the
  whole run: wrap `Object.getPrototypeOf(new Roll("1d20")).evaluate` and push `this._formula` before
  delegating. Restore it before logging out.
- **Attribute belief and cue cards by `speaker`, never by capture window.** The Hazewyrm Adult's and
  Elder's Held Haze both fired inside one drive's window and the cards are otherwise identical in shape;
  reading the tail mis-assigned the Elder's DC 13 card to the Adult. `ChatMessage.getSpeaker({actor})` is
  authoritative — same lesson as run 15's `userId` rule, one field over.
- **The pane is hidden, so `setTimeout` is throttled to ~1 s.** Every `H.sleep(400)` in a dialog walker
  costs a second, so a 12-iteration walker burns 12 s per use and a 10-target loop reads as a hang. Keep
  walkers to ~5 iterations, break after the first empty pass, and put a `Promise.race` timeout around
  `item.use()` — an unresolved `use()` promise otherwise wedges the whole batch.
- **A "large token" is not a stale token.** `tok.object.center` read 300 px off `_source` and looked
  exactly like run 1's ticker-freeze; the token was simply **2×2** (`w = 600`, so centre = x + 300).
  Check `tok.w` before invoking the freeze lesson — and when an engine range/vision gate excludes
  something, confirm with Foundry's own backend (`polygonBackends.sight` / `.move`) before calling it a
  defect. Run 17 did, and the "missing" onlooker turned out to be correctly behind a wall.
- **An adversary that is out of Focus rolls nothing and reads exactly like a dead ability.** The
  Hazewyrm Elder's Searing Bolt costs 1 Focus; at 0 Focus the use produced "Cannot consume, not enough
  of resource", no damage roll, and no card. Top the resource up before recording a FAIL.
- **Cheapest high-yield trick of the run: use MANY fresh targets instead of resetting one ledger.**
  A once-per-scene belief ledger is per-target, so driving the same ability at ten different tokens gives
  ten independent rolls in one pass — far faster than clearing the flag and re-driving, and it produces
  the fooled *and* un-fooled cases the rider rows need as a by-product.
- **Density, measured:** 13 distinct adversary imports covered 22 rows and retired **18** — about
  **1.4 retired per import**, close to run 16's 1.2 and nowhere near the old 4.5 estimate.

## Operating lessons from run 18 (2026-07-28c — these OVERRIDE older advice where they conflict)

- ❌ **A plain `tokenDoc.update({x, y})` makes the token WALK, and v13 constrains that walk by walls.**
  Repositioning a fixture across the map landed it 4,000 px short, wedged on scenery, and looked exactly
  like a stale-ticker read. Use **`tok.move({x, y, action: "displace"}, {animate: false})`** for every
  staging move — it is the same unconstrained teleport `edhaMoveTokenTo` uses. Only *engine* pushes
  should ever travel a constrained path.
- ❌ **Compare flags DEEP-EQUAL, never by `JSON.stringify`.** Reverting a flag rewrites the object and
  changes **key order**, which a string compare reports as drift that is not there. Worse, run 18's
  first revert used `update(…, {recursive: false})` on `flags.edha-content.trigRound` and **silently
  stripped two sibling keys** off Ben's token actor. Restore the **whole** snapshot flag object, then
  re-verify with a recursive key-sorted compare.
- ❌ **One click per DIALOG, not one click per pass.** A walker that re-scans and re-clicks the same
  roll dialog rolled a single attack **five times**. Keep a `Set` of dialog titles already clicked and
  skip them. And widen the matcher beyond `Roll`: run 18 was blocked for two calls by **"Consume 1
  Focus?" → Continue** *and* the Advanced-Encounters **"Which boss turn is this action being taken
  from?" → Off-turn / Slow turn / Fast turn** picker, which appears for a **boss** as soon as any
  encounter exists. Pick **Off-turn** so no real turn is consumed. While those sat unanswered the
  `use()` promise stayed pending and the *next* drive's capture window scooped up the previous
  ability's cards — which reads as the wrong actor firing.
- ❌ **`edhaCastBurst` consumes the cost and then BLOCKS on `edhaPickPoint`**, which waits for a
  `pointerdown` on `#board` and reads `canvas.mousePosition`. With the pane hidden this is the exact
  "silently ate my Investiture and did nothing" shape from the Weave the Thread trap — and there is **no
  dialog to find**, so sampling for dialogs proves nothing. Drive it: `Object.defineProperty(canvas,
  'mousePosition', {get: () => ({x, y}), configurable: true})`, dispatch the `PointerEvent`, then click
  the card's Detonate. **Escape cancels every pending picker and refunds**, which is also how you clean
  up after a drive that hung.
- ❌ **`ally-drops` fails OPEN when the victim has no token at sweep time** — `disp` is `undefined`, so
  the same-side filter is skipped and cue owners on **both** sides fire. Phantom doubles are exactly
  this case. Until it is fixed, expect a Seeming break to reach Ben's Corvaine tokens no matter what
  disposition you set, and **snapshot for it**. Setting a victim to a disposition **no other token
  shares** genuinely does contain the sweep for every *normal* kill — run 18 measured 0 cards that way.
- **Drive the belief roll's FORMULA, then resample by unsetting the ambusher's own flag.** The
  read-only `Roll#evaluate` patch is what proves `1d20` vs `2d20kh` (advantage) — the total cannot.
  And when you need a **fooled** target and the dice will not cooperate, `unsetFlag("edha-content",
  "ambushBelief")` on **your own bench import** and re-drive: it is a fresh sample, it is self-contained,
  and it is far cheaper than hunting for a low-Perception fixture. Prove the once-per-scene gate
  separately first so the resampling cannot be mistaken for it.
- **Check a fixture's Deflect before choosing a victim for a damage-*type* test.** Severance's whole
  claim is "vital bypasses Deflect", which is **unobservable on a Deflect-0 actor**. Pick the Deflect-2
  fixture and apply a **fixed** amount via `applyDamage` rather than the rolled bite — the HP delta then
  discriminates the branches by itself (6 vs 4), with no card-reading required.
- **A cue whose trigger names a side needs a token on the OTHER side.** `enemy-turn-start` compares the
  mover's disposition to the cue owner's, so a bench combat full of hostiles fires nothing. Put a
  **friendly** token in the combat and step **forward** onto its turn. Also: `turn` order is not
  initiative order here — run 18's first forward step landed on the boss, and the cue only came on the
  step after.
- **Density, measured: 7 imports covered 27 rows and retired 27 — about 3.9 retired per import**, well
  above run 16's 1.2 and run 17's 1.4. The difference is not luck: these two sections concentrate
  **many rows on few actors**, and the run drove *every* row touching an actor before moving on. Budget
  by counting rows-per-actor, not imports.

## Operating lessons from run 19 (2026-07-28e — these OVERRIDE older advice where they conflict)

- ❌ **A "no card" negative is WORTHLESS unless you prove the once-per-round gate was OPEN first.**
  `edhaTriggerAllowed` compares the owner's `trigRound[key]` against **`game.combat.round`** — Ben's
  ACTIVE combat, which has sat at round **1** for many runs. Run 19 was handed "check Ben's Corvaine
  owners stay silent" and found all three already gate-closed at round 1: their silence would have
  proven the *gate*, not the side filter. Compute the key yourself
  (`cue:<item>:<trigger>:<atFraction>:<rangeFt>:<everyNRounds>`, dots → `_`), read the stored value,
  and **assert `gateOpen` before AND after every negative drive**. Where the confound is on Ben's
  actors and you may not write to them, **import your own copy of the same block and control its gate**
  — a bench owner with the identical rule at the identical disposition is a strictly better instrument.
- ✅ **Design one drive that tests three filters at once, each the others' control.** One tokenless
  drop with a same-side un-ranged owner, a cross-side un-ranged owner, and a same-side *ranged* owner
  on the map yields the full truth table in a single sweep and is far more convincing than three
  separate drives — a filter that wrongly fires shows up as an extra card in the same log line where
  the correct card appears. And **always pair a negative with a control that makes the same rule
  FIRE** (Roek silent at unknown position, but fired at 5 ft and silent again at 35 ft) — otherwise
  "no card" is indistinguishable from a dead rule.
- ❌ **`edhaIsIsolated` counts same-disposition adjacents, so stage the ATTACKER at a disposition no
  one else uses.** Only dispositions **1** and **−1** are in use on the Playtest Map; **−2 (secret)
  and 0 (neutral) are free**. Placing an attacking adversary at **−2** keeps a −1 victim Isolated *and*
  keeps your bench `ally-drops` traffic off Ben's −1 campaign tokens. Assert `edha.isIsolated(victim)`
  is `true` (and `false` on your control) *before* driving any Isolated-gated row.
- ❌ **Stepping a BENCH combat writes cue ledgers onto BEN'S campaign tokens.** `edhaTurnCueSweep`
  hangs off `combatTurnChange` for **any** combat and then scans **every token on the scene**, so a
  bench turn-step posted a Reactive Strike cue for Ben's `Stonebound Captain` and stamped a new
  `trigRound` key on it. This is the `enemy-turn-start` analogue of the `ally-drops` exposure runs
  17/18 hit. **Snapshot for it, expect it, report it** — and do not "clean" his actor, since that is
  itself another write.
- ❌ **Compute a bloodied crossing AFTER deflect.** A Rootling Swarm read as a dead `hp-below` hook
  because it has **Deflect 1**: 6 impact landed 5, leaving 7/12 against a line of 6. Re-driven at 9
  raw it fired immediately. Check `system.deflect.value` (never `.derived`) and pick a damage type the
  fixture does not deflect, or over-deal.
- ❌ **Two `__use()` calls in one `javascript_tool` call will blow the 30 s tool budget.** Each carries
  its own timeout plus dialog-walker sleeps (throttled to ~1 s with the pane hidden). **One `use()`
  per call.** A timeout is not evidence of a hang — run 19 timed out twice with *no* dialog open and
  the drive having already succeeded; check `_source` position and the chat tail before concluding
  anything.
- **The Advanced-Encounters "does not have enough actions to use X!" toast is a WARN, not a block.**
  It fires for any actor absent from `game.combat` (Ben's), but the item still runs — Focus was spent
  and the engine's own cards posted right through it. Do not record a FAIL on seeing it.
- **A 2×2 owner cannot reach anything outside its own footprint with a 5-ft centre-to-centre gate**
  (its centre is a full square in from its edge → ≥7.5 ft to any neighbour). Before calling a short
  range broken, compute the gap from `tok.center` and `tok.w`; before picking a fixture for a ranged
  row, prefer a **1×1** owner with a generous range (Roek's 20 ft) so the geometry cannot confound you.
- **Density, measured: 10 imports covered 24 rows and retired 21 — about 2.1 per import**, between
  run 17's 1.4 and run 18's 3.9, exactly as the brief predicted for a section that spreads few rows
  over many actors. Budget by rows-per-actor.

## Operating lessons from run 20 (2026-07-28f — these OVERRIDE older advice where they conflict)

- ❌ **THE BENCH PC TOKENS ARE ALREADY ON THE MAP. Never create a second one — MOVE the existing
  one.** Run 20 placed fresh `Bench — Green`/`Bench — Black` tokens in its staging area and then
  spent four calls chasing a "dead" `focus-change` watch. The engine resolves an owner's token with
  **`edhaCasterToken() = actor.getActiveTokens()[0]`**, which returned the *pre-existing* token
  parked 120 ft away at the bottom of the map — so every range-gated check measured from a token the
  run wasn't looking at, and a correct filter read as broken. Enumerate bench PC tokens first, then
  `tok.move({action:"displace"})` the real one into position. (Rows that pass an **explicit target**
  — `edha-def-test` with `requireTarget` — are immune; this only bites `rangeColor`/`rangeFt` gates.)
- ❌ **`item.use()` blocks on a "<Item> — Consume Resource" dialog, and a polling walker will blow the
  30 s budget** because a hidden pane throttles `setTimeout` to ~1 s. Drive mechanics with
  **`use({shouldConsume: false, configurable: false})`** — `shouldConsume:false` skips the resource
  dialog (`options.shouldConsume !== false` gates it in the system's `use`) and `configurable:false`
  fast-forwards the roll dialog. Deterministic, no dialogs, several drives per call. **Only** drop
  `shouldConsume` when the row actually asserts a cost (W23's "inv 2→1"), and then click the dialog
  in a **separate** tool call: fire without awaiting, return, then click.
- ❌ **Queued dialogs replay a STALE roll.** Three timed-out `use()` calls left three dialogs open;
  clicking them all posted "10 vs PHY 14" three times, which looks exactly like a hard-coded roll.
  It is a harness artifact — the same evaluation re-rendered. Clear pending dialogs before sampling,
  and confirm a live roll by seeing the total *vary* under the fast path.
- ✅ **A cue's card may fire at COMBAT CREATION, before your capture window exists.** Run 20 recorded
  Reactive Strike and Territorial Instinct as silent at Green's turn in round 2, then found both
  cards timestamped at `Combat.create` + `update({round:1, turn:0})` — because turn 0 *was* Green.
  By round 2 the once-per-round gate (keyed to **Ben's** `game.combat.round`, parked at 1) had
  closed. **Search the whole chat log by ability name before recording any cue negative**, and read
  the owner's `trigRound`: a stamped key means it already fired, not that it is dead.
- ❌ **`nextTurn()` no-ops on a combat you never started** (`turn` stays `null`). Step with
  **`combat.update({round, turn})`** — which is also what keeps Ben's combat untouched. Note
  `combat.started` still reads `true` afterwards, so `edhaExpireTimedStatuses` does run.
- **`edha-on-hit` and the Life mutation riders land on damage APPLICATION, not on the roll.** Rolling
  an attack proves nothing for them — click the card's `button[data-action="apply-damage"]` (the ×1)
  with the victim controlled. Bone Spurs' +2 keen and Frost Lance's Slowed were both invisible until
  the damage was applied.
- **Read the pack ONCE, up front, and plan the whole run from it.** One `game.packs.get(...)
  .getDocuments()` sweep printing `adv | ability | rules= effects= [handler types]` turned a
  26-row section into a per-actor drive plan, settled two rows on data shape before any driving, and
  told the run which abilities needed a target vs a combat vs a damage application. Cheapest call of
  the run. ⚠️ The on-disk `readPack` is unusable while Foundry holds the LevelDB lock — read the
  **live** compendium from inside the world instead.
- **Density, measured: 21 imports covered 26 rows and retired 13 — about 0.62 per import**, well
  below run 18's 3.9. The cause is diagnosable: **9 of the 21 were imported in one speculative batch
  and 4 were never driven at all.** Import the actors for the rows you will drive *next*, not the
  ones you hope to reach.

## Operating lessons from run 21 (2026-07-28h — these OVERRIDE older advice where they conflict)

- ❌ **A handed-down "the engine must NOT contain <string>" check can fail a CORRECT deploy, because
  the fix quotes the old buggy code in its own comments.** Fix pass D's byte-check said
  `Number(ds.edhaCost) || 2` and `holders.includes(tok.actor)` must be absent; both are present at
  L334/L2017/L3458 — in explanatory docblocks. **Only the SHA-256 against
  `HEAD:module-src/scripts/register-skills.js` decides.** Compute it in-page (cache-bust fetch →
  CRLF→LF → digest) and compare to `git cat-file blob` normalised the same way. If a string check
  disagrees with the hash, believe the hash and grep for the string's line numbers before writing
  anything down.
- ❌ **`game.combat` is BEN'S combat, always, and that BLOCKS any "stamped at application time inside
  a running combat" cell.** A bench combat made `Combat.create({active:false})` never becomes
  `game.combat`, so engine code reading `game.combat?.started` + `edhaCombatantTurnIndex` cannot see
  your combatants. You may not add a token to Ben's combat or activate your own, so such a cell is
  **BLOCKED with the blocker named** — not a fail, and never re-filed as ⚑. Everything keyed on the
  combat passed to the hook (`edhaExpireTimedStatuses(combat)`) IS drivable, which is why 3 of the 4
  Braced cells ran fine.
- ✅ **Design ONE combat that carries every timed-status cell at once, each the others' control.**
  Run 21 put an out-of-combat `braced` (must expire), a transfer-AE `braced` (must never expire), a
  hand-toggled `compelled` (must never expire), a hand-toggled `slowed` (must expire) and a
  rule-applied `tagged` (must expire) into a single 3-combatant bench combat and stepped it 5 rounds.
  Five assertions, one setup, and every "must not expire" sits in the same log as a "must expire" —
  which is the only way "it didn't expire" means anything.
- ❌ **A re-rendering dialog invalidates your element references EVERY failed submit.** The pick-2
  dialog re-renders on each rejected Confirm, so a cached `[...querySelectorAll("input")]` silently
  points at detached nodes — setting `.checked` on them changed nothing and the warn kept saying
  "you picked 0". **Re-query inside a `q()` helper on every step, and drive checkboxes with
  `.click()`, not `.checked = true`.**
- ❌ **Synthetic `MouseEvent("click")` does NOT trigger Foundry v13 content links** — and with the
  pane hidden, `computer{action:"screenshot"}` fails, so coordinate clicks are unavailable too.
  Before recording a click-clause as a defect, **post the same `@UUID[...]` into a chat message and
  click that the same way**: if the control also does nothing, it is the harness. (Also note the
  wizard's map polygons listen on **`pointerenter`**, not `mouseenter` — a `mouseenter` probe reports
  an empty tooltip on a working picker.)
- ❌ **The hidden pane throttles `setTimeout` to ~1 s, so a 10-iteration loop with any sleep in it
  blows the 30 s budget.** Run 21 lost a call to a 10× `await sleep(200)` polygon sweep. Split UI
  sweeps into batches of 3–4 with **no sleeps at all** and read state synchronously right after the
  click — most wizard handlers update the DOM in the same tick.
- ✅ **For a UI section, the DOM IS the evidence and it beats a screenshot.** Computed styles settle
  the cosmetic rows outright and unambiguously: `scrollHeight === clientHeight` retires
  "text un-clipped", `getBoundingClientRect` overlap area 0 retires "rows un-overlapped",
  `rect.bottom > innerHeight` fails "fits the screen" with a number, and comparing an input's
  `border`/`borderRadius`/height to a `select`'s retires "looks fillable". None of these need a
  visible pane.
- ✅ **Compare a bound sheet against an unbound one to prove BOTH.** "Browse the tree (read-only,
  unbound)" and "Open the actor's tree (selectable)" are each other's control: `document.parent`
  reads `null` for the compendium copy and the **Actor** for the owned copy. One check, two rows,
  and neither conclusion rests on how the window looked.
- ⚠️ **Snapshot unlinked tokens' FLAGS, not just their effects and statuses.** Run 21's start
  snapshot captured `unlinkedFx` (effect names) but not `flags`, so when Ben's Stitchmother token
  turned up carrying `bpHits {"1":4}` the run **could not prove whether it predated the run** and had
  to report it as an inference. Capture
  `canvas.scene.tokens.map(t => [t.id, JSON.stringify(t.actor?.flags?.["edha-content"] ?? {})])` at
  join time.
- **Density, measured: 2 actors created covered 34 rows and retired 25 — about 12.5 per creation**,
  an order of magnitude above run 19's 2.1 and run 20's 0.62. The cause is structural, not skill:
  a section that is **one continuous flow over one subject** rewards keeping the subject open and
  asserting as you pass each page. Budget these sections by *pages in the flow*, not by rows.

## Operating lessons from run 22 (2026-07-28j — these OVERRIDE older advice where they conflict)

- ❌ **THE PANE IS `document.hidden`, SO rAF NEVER RUNS — AND NEITHER DOES ANY OBSERVER.** Measured:
  a `requestAnimationFrame` loop delivered **0 frames in 2.7 s**, and a freshly-attached
  `ResizeObserver` **and** `IntersectionObserver` each fired **0** times, including the initial
  observation the spec guarantees. `tabs_select` does **not** un-hide it. **Any fix whose trigger is
  a ResizeObserver / IntersectionObserver / rAF / `visibilitychange` is UNVERIFIABLE on the agent
  bench** — record it **BLOCKED with the blocker named**, never FAIL, because the un-fired-observer
  symptom is byte-identical to a broken fix. ⚠️ Note PIXI's ticker still self-reports
  `started: true, FPS 60`; that is a stale nominal reading, not evidence frames are running.
  What you CAN still do is prove the fix's *mechanism* by invoking its effect by hand (run 22 called
  `app.setPosition({})` and watched 237 → 112, bottom exactly 900) and prove its *contract* by
  reading Foundry's own source — that turns a dead row into a strong partial.
- ❌ **Read a DerivedValueField's `.value`. Never `.override`, never `.derived`.** Run 22 read
  `movement.walk.rate.override` and recorded Surefooted as **+0** — a clean false FAIL. The engine
  writes the Edha walk rate into `override` **and** the getter adds `.bonus` on top, which it says in
  its own comment; on `.value` the same drive read **20 → 30 → 20**, exactly +10. This is the
  `system.deflect.value` rule generalised: **the field you want is always `.value`.**
- ❌ **An item you "hand-added" from a compendium is not hand-added.** A renamed clone of a pack item
  carries `_stats.compendiumSource`, so a pack sync treats it as pack-built and replaces it. Run 22
  recorded "hand-added items survive → FAIL" and only got the right answer after re-driving with
  `createEmbeddedDocuments('Item', [{name, type}])` — no source stamp — which survived. **Build
  negative-control fixtures from scratch, not by cloning the thing under test.**
- ❌ **`Actor.create(packDoc.toObject())` is NOT a drag: it leaves `_stats.compendiumSource` null**,
  and the sheet's ⟳ Sync then refuses outright ("no pack source (name not in edha-adversaries)").
  If a row is about sync/matching, **stamp `_stats.compendiumSource` to the pack UUID** after
  importing, or you are testing your own import shortcut instead of the feature.
- ✅ **One click can settle four rows if you stage all four preconditions first.** Run 22 hand-broke a
  token's vision, damaged it, damaged the world actor, and added an unstamped item — *then* clicked
  ⟳ Sync once, and read out the button row, the placed-token push, the state-preservation row and the
  hand-added row from a single result, each acting as the others' control.
- ✅ **Firing three `change` events in one tick races whole-array writes.** Setting g/s/c currency
  simultaneously left only the last value, because each handler writes the entire `denominations`
  array from its own stale snapshot. That is a harness artifact, not a defect — a user types one field
  at a time. **Drive multi-field widgets sequentially, awaiting between fields, before calling a
  partial write a bug.**
- ✅ **A wizard-shaped section is still one flow even when the rows live in six other sections.** Run
  22's single wizard walkthrough incidentally settled culture grants, the pick-2 dialog, all three
  purse flows, the currency seed order and the fresh-PC token defaults — rows filed under four
  different headings. **Read the other sections' rows BEFORE starting a flow**, so you assert them as
  you pass rather than re-staging later.
- **Snapshot whole effect OBJECTS, not effect names.** Run 22 could say *that* two bench PCs lost
  "Guardian Stance (+1 Deflect)" but not restore it, because the snapshot held names only. Capture
  `a.effects.map(e => e.toObject())` for bench-folder actors at least, so an unexplained loss is
  reversible instead of merely reportable.
- **Density, measured: 2 actors created + 4 tokens covered 36 rows and retired 27 — about 13.5 per
  actor created**, the highest of the marathon, above run 21's 12.5. The cause is the same structural
  one: **one long-lived subject that many rows can be asserted against** beats importing a fixture per
  row. The adversary rows needed exactly one import because four of them shared a single sync click.

## Operating lessons from run 23 (2026-07-28l — these OVERRIDE older advice where they conflict)

- ✅ **A bench combat DOES drive the whole turn-boundary engine — verify the premise first, in one cheap
  call, before staging anything.** `Combat.create({active:false})` then `combat.update({round, turn})` fires
  `combatTurnChange` **with the bench combat passed** (`game.combat` stays Ben's), and the entire engine is
  written as `Hooks.on("combatTurnChange", (combat) => …)` reading the **passed** combat — so illusion upkeep,
  round-start dispatch, rally resets, hazard sweeps and the timing dispatcher are all reachable. Run 23 spent
  one call proving this and then settled four turn-boundary rows on it. ⚠️ **`startCombat()` works too — but
  only in an ISOLATED call**; bundled into a compound call it was refused, and the refusal looks nothing like
  a Foundry error.
- ❌ **`game.combat` is still Ben's, and that is now MEASURED rather than argued.** `expireEndOfRound` stamps
  `mod.round = game.combat?.round` (L19137): the flag came out `round: 1` (Ben's combat) while the bench combat
  sat at **round 2**. So a "does it expire when the round turns?" row cannot be driven by advancing a bench
  round. **The decomposition that works**: drive the positive for real, then set the stamp to a past round by
  hand and drive the same test again — that exercises the *read* branch, which is where the behaviour lives,
  and the write side is settled by reading one line of source. Say which half was stubbed.
- ❌ **`canvas.mousePosition` is FROZEN at (0,0) with the pane hidden, so `edhaPickPoint` cannot be driven by
  synthetic pointer events.** Dispatching `pointermove` + `pointerdown` on `#board` leaves PIXI's federated
  pointer state untouched, and the picker resolves to world (0,0) — which reads as an out-of-range refusal, i.e.
  a **false FAIL**. The fix is to shadow just that getter
  (`Object.defineProperty(canvas, "mousePosition", {get: () => new PIXI.Point(x,y), configurable:true})`), which
  stubs the *mouse read only* and leaves the engine's placement, range and refund logic real. Declare it when you
  use it. (This supersedes "run 16 click-placed for real" — that is not reproducible in a hidden pane.)
- ❌ **Token movement STALLS mid-animation with the ticker parked — `move({action:"displace"})` does not save you.**
  Both `update({x,y})` and `move({action:"displace"})` left `_source` at an interpolated midpoint (3507, 13106
  for a target of 2400, 12000) and it never advanced. Re-read `_source` after every move and **do not build a
  range expectation on a move you did not verify landed**; `update({...}, {animate:false})` is what finally set
  it. This is the sharper form of the old "prepared position reads stale" note: the move may never complete at all.
- ❌ **A silent no-op button is not necessarily an unbound button — CHECK THE CONSOLE BEFORE CALLING IT DEAD.**
  Living Image's Pay button did nothing on click. A probe listener added to the same element fired, proving
  dispatch works; `read_console_messages({onlyErrors:true})` then produced the actual defect in one line
  (`TypeError: Cannot read properties of null (reading 'dataset')` with the file and line number). **The engine
  wraps these handlers in `try/catch` + `console.error`, so every handler bug in this codebase presents as
  silence.** The console is the first stop, not the last.
- ⚠️ **`ev.currentTarget` is null after any `await` — a whole class of engine handler is at risk.** Found in
  `edhaUpkeepInvClick`: the pre-await read works, the post-await read throws. Worth grepping for whenever a
  button "does nothing".
- ❌ **`setFlag` MERGES, so a fixture built on an actor that already carries that flag inherits its siblings.**
  Run 23 wrote a `nextTestMod` probe onto a victim already holding one from Coercive Pressure, silently inherited
  its `attr: "int, wil"` gate, rolled a Presence skill, and got a clean "no disadvantage" that meant nothing.
  **`unsetFlag` first, then `setFlag`**, whenever the flag under test may already exist — and pick the skill that
  matches the gate.
- ❌ **`deleteCombat` sweeps are UNSCOPED: deleting one combat cleared a marker ledger belonging to an actor in a
  different, still-live combat.** Deleting a throwaway bench combat wiped `Bench — Order`'s `lists.covenants`,
  which then made Bear Witness look broken (it read an empty list and posted nothing). **Delete bench combats
  LAST, after every ledger-dependent row is done** — and if a ledger reads empty when it should not, ask what you
  deleted before you ask what the engine did.
- ⚠️ **A row scan must key on the field the DISPATCHER keys on.** Scanning `handler.type === "edha-combat-timing"`
  returned **zero** talents; the dispatcher actually filters `rule.event === "edha-combat-timing"` and the handler
  can be any type (`edha-cae-grant`, `edha-enter-stance`, `edha-triggered-effect`). Same family as the standing
  `rule.type` vs `rule.handler.type` warning: **read the consuming code before writing the scan.**
- ✅ **The best control is a DIFFERENT rule firing on the SAME hook in the same tick.** 2bL-14's reload guard is a
  negative — "Bear Witness must not fire" — and a negative on a hidden bench proves nothing on its own. What made
  it decisive was that Living Image's upkeep fired on that very turn change: the hook chain is demonstrably alive,
  so the silence is the guard, not a dead listener. Look for a sibling rule on the same hook before staging an
  extra control of your own.
- ⚠️ **Persist the start snapshot OUTSIDE the page if any row needs an F5.** 2bL-14 requires a reload, which
  destroyed the in-page snapshot; run 23 therefore could not attribute a `Determined` effect on `Bench — Order`
  and had to report it as an inference rather than clean it. Write the snapshot to the scratchpad, or re-capture
  it immediately after the reload.
- ✅ **Reading the system's own getters can settle a row that "needs a human look".** The four-dead-prereqs ⚑ row
  asked whether the sheet flags an owned talent whose prereqs are unmet. The tree view is a PIXI canvas with no
  DOM node — unreadable here — but `isTalentAvailable`'s source short-circuits on `hasTalent()` **before**
  consulting prerequisites, and `_draw()` has no third branch. **No warning state exists**, so there is nothing to
  look at. When a visual row is blocked by the hidden pane, read the code that would have drawn it.
- **Density, measured: 22 🤖 in, 7 retired + 1 root-caused fail, from 2 actors and 2 combats created — but the
  honest number is ~1 row per 2 tool calls.** These were combat and talent mechanics spread across seven trees
  with almost no shared staging, exactly as the brief predicted; the one place staging compounded was the single
  bench combat, which carried four rows (2bAA-6, 2bJ-3, 2bE-9, 2bL-14). **The lesson is the run-21/22 one
  inverted: when rows do NOT share a subject, budget per row and pick the ones that can actually RETIRE** — run
  23 deliberately dropped the Green spot-check row on discovering it cannot retire until an Opportunity-gated
  talent is driven.

## Operating lessons from run 24 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **FOUNDRY'S OWN SOCKET RATE LIMITER WILL EAT YOUR ROWS, SILENTLY.** After a burst of actor writes
  (six `Actor#update`s in a loop, on top of a scene-reset sweep that itself writes to every actor in the
  world), the server logged *"Exceeded maximum number of update-actor events in a short period of time.
  Aborting event execution."* and then **discarded** writes for a window. The symptom at the row level is
  a talent `use()` that produces no card, no notification and no console error — indistinguishable from a
  dead talent. **Space bulk writes ~400 ms apart, and when something "does nothing", check
  `read_console_messages({onlyErrors:true})` for the limiter before you write FAIL.** Waiting ~30 s clears it.
- ❌ **A BENCH PC'S INVESTITURE MAX IS 2.** `bench-setup-console.js` sets level, attributes, skills and
  talents but no resources, and the system derives `inv.max` = 2. Every talent costing 3+ Investiture —
  Final Decree among them — silently no-ops: the system's consume step just declines, with no card and no
  warning. Raise it first (`system.resources.inv.max.override` + `useOverride`, then `.value`), and note
  the max still **clamps at 4** however high the override goes. Target fixtures likewise start at 0 HP,
  so any "does it take damage / is it a legal target" row needs `hea` set before it means anything.
  (Both are good candidates for the setup script, alongside TODO #26's sight-range change.)
- ❌ **`item.use()` NEVER SETTLES while the system's `ItemConsumeDialog` is open** — the `javascript_tool`
  call just times out at 45 s. Do not await it. Fire it, then poll
  `[...foundry.applications.instances.values()]` for `ItemConsumeDialog` and click
  `button[data-action="continue"]`. Keep that as a reusable `globalThis.__use(actorName, talentName)`
  helper for the whole run; every talent with a resource cost needs it.
- ❌ **Creating an ActiveEffect with EXACTLY ONE status and no `_id` THROWS** in cosmere-rpg 2.1.0:
  `CosmereActiveEffect#_preCreate` → `isCondition` → `isStatusEffect` → `this.statuses.size === 1 &&
  this.id.startsWith(...)`, and `this.id` is `null` before insert. It aborts the whole
  `createEmbeddedDocuments` batch, so one bad fixture kills three good ones. Pass an explicit
  `_id: foundry.utils.randomID()` (with `{keepId: true}`) whenever a probe effect carries one status.
  Zero-status and multi-status effects are unaffected.
- ✅ **ONE off-canvas actor + ONE combat delete settles the whole R-60 family.** The `deleteCombat` sweeps
  are world-wide and unscoped, so staging every family's flags/statuses/effects on a SINGLE directory-only
  actor and then deleting one bench combat exercises all ten families at once, each acting as the others'
  control. Six rows off two tool calls. The staging is honest as long as you say which half was
  hand-written: the sweep's READ/population half is what R-60 changed, and that is the half being driven.
- ✅ **`Combat.create({active:false})` + `delete()` is safe and sufficient**, and `game.combat` stays Ben's
  throughout. Ben's live combat had **zero combatants**, which makes `edhaCombatEndGuard` EMPTY — so
  nothing was protected and the sweep ran world-wide. **Check `combat.combatants.size` on Ben's combat
  before you assume the guard will shield his actors**; an empty leftover combat protects nobody.
- ✅ **The best negative control is one the engine hands you.** Fate's "un-attributable props only clear
  when no OTHER combat is in play" clause was proven by creating a combat *with a combatant*, deleting a
  second combat (marker template survived), then deleting the first (marker template deleted). Positive
  and negative from the same fixture, two calls.
- ⚠️ **Verify the deploy from BOTH sides and prove the RUNNING code, not just the file on disk.**
  `git hash-object` of the installed file matching `HEAD:module-src/...` proves the deploy; it does not
  prove the browser is not serving a cached older script. Compare
  `performance.getEntriesByType("resource")`'s `decodedBodySize` for the ORIGINAL `<script>` load against
  your cache-busted fetch — equal sizes mean the page is running what you just hashed.
- ⚠️ **The bench roster can be entirely GONE.** It was, this run: 0 bench actors, but three orphan
  `Bench — *` tokens still on the Playtest Map whose actors had been deleted (`tok.actor` is null, so the
  engine skips them). Rebuild is ~25 s and produced zero ⚠ lines. **Enumerate `game.actors` by folder
  before planning any row** rather than assuming last marathon's fixtures survived.
- ⚠️ **A row's subject may need to be a NON-character.** Several R-60 rows are specifically about an
  adversary/summon bearer, because the old sweep halves split characters-only vs canvas-only. Driving them
  on a `character` proves the wrong half. `Bench Target — Undefended` is the only adversary-typed bench
  fixture — take its token off the canvas to get an off-scene adversary.

## Operating lessons from run 25 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **`git hash-object` NORMALISES CRLF; the served file does not.** The installed
  `register-skills.js` is CRLF on Ben's machine, so `git hash-object` (which applies the text filter)
  matches `HEAD:module-src/...` while a git-blob SHA-1 of the **raw served bytes** does not
  (`25bd55fa…` vs `9575fba…`, 19 658 CR bytes, 1 525 467 → 1 505 809). **Strip the CR that precedes
  each LF before hashing the fetch**, or a perfectly good deploy reads as NOT-DEPLOYED. Pair it with
  the run-24 `decodedBodySize` check to prove the page is running that script and not a cache.
- ❌ **A refused token move looks like nothing at all — `move()` returns `false`, with no error and no
  console line.** Two different causes bit this run and both are silent:
  1. **The engine's own `edha-move-veto` (Dread Presence).** A **Weakened** creature cannot willingly
     move closer to a veto bearer, and the Playtest Map has several (Frostbinder, Wrenchmaster). The
     only evidence is a `ui.notifications.warn` — so **wrap `ui.notifications.info/warn/error` in a
     recorder at the start of the run** and read it whenever a move does nothing. This run weakened a
     target for an R-64 control and then spent four calls wondering why it could not walk it onto a
     snare. **The engine was right; the harness had armed the veto against itself.**
  2. **Walls.** `update({x,y})` can land the token at an interpolated **midpoint** against a wall
     (2700,5100 → 2905,5304) and stop there. `CONFIG.Canvas.polygonBackends.move.testCollision(from,
     to, {type:"move", mode:"any"})` over the eight neighbours tells you which squares are reachable
     before you plan a row around one. **Re-read the position after every move.**
  **Not the cause, and now measured:** `game.paused` is NOT a movement gate — unpausing changed
  nothing, and the pause was restored. Do not go near it.
- ✅ **Serve `scripts/bench-setup-console.js` over a throwaway HTTP server and inject it as a classic
  `<script>` tag** (`python -m http.server 8099 --bind 127.0.0.1` in `scripts/`, then append a
  `<script src="http://127.0.0.1:8099/bench-setup-console.js?cb=…">`). Classic scripts are not
  CORS-restricted, so this runs the repo's real file without pasting 17 KB through the console — and
  re-running is then cheap enough to actually do. Kill the server at the end.
- ⚠️ **Your dialog probe MUST filter the standing UI apps.** `foundry.applications.instances` holds
  ~20 permanent AppV2s (Sidebar, ChatLog, every Directory, SceneControls…). An unfiltered dump is
  thousands of tokens of chrome and buries the one `DialogV2` you care about. Skip by
  `constructor.name`, and sample **both** shapes (AppV2 instances **and** `div.app.window-app`).
- ⚠️ **"Cannot consume, not enough uses left" is another silent no-op class.** Limited-use heroic
  talents (Galvanize) simply do nothing on a second use, with the reason only in a notification. Same
  family as run 24's consume dialog / Investiture max / rate limiter: **before writing FAIL, read the
  notification log.**
- ⚠️ **Resource CLAMPS make a correct roll look wrong.** Galvanize rolled `1d6` → 6 and the target
  gained 4, because focus max was 4. That reads exactly like a fold bug. **Raise the receiving
  resource's max before any row whose assertion is "the change matches the rolled total"** — or pick a
  target with headroom (Field Medicine into a 41-HP ally settled the same row in one call).
- ✅ **Run 23's `edhaPickPoint` mouse shadow works and is cheap — use it freely.**
  `Object.defineProperty(canvas, "mousePosition", {get: () => new PIXI.Point(x,y), configurable:true})`
  then `document.getElementById("board").dispatchEvent(new PointerEvent("pointerdown",{button:0,
  bubbles:true,cancelable:true}))`. It placed a real Snare and a real Set Charge this run, each with a
  live template + Region, and both self-consumed correctly. Snap to the square's **centre**
  (top-left + half a grid) because the picker snaps with `GRID_SNAPPING_MODES.CENTER`.
- ✅ **One flow can retire three halves of a row.** Order's whole remaining R-65 set (plain-Edict
  violation damage, the Sealed annotate rider, Verdict's court spread) came off **one** Verdict against
  a Sealed Edict, because Verdict's `edha-prohibition-resolve` fires all three. Read the payload chain
  before staging three separate tests.
- ⚠️ **A combat-end sweep will eat PRE-EXISTING state, and that is not a bug you can avoid.** The
  Covenant effects run 24 left on `Bench — Order` / `Bench — White` were legitimately swept by the
  combat ends these rows require. **Snapshot whole effect OBJECTS and recreate them with
  `{keepId: true}` and their original `_id`** — that is the only way the end-of-run diff comes back
  clean. Restore flags by deleting the whole `flags.edha-content` namespace and rewriting the snapshot
  object; never patch a sub-path.
- ⚠️ **Some R-64 rows are simply not drivable from one client, and saying so beats manufacturing a
  pass.** Every `target: victim` rule on `edha-test-success` sits behind an H1 def-test that resolves
  its own target **after** the roll — so the payload's creature and the canvas selection can never be
  made to differ. The drivable shape is an event that carries its own victim: `edha-on-hit` (via
  `actor.applyDamage(list, {edhaSource, originatingItem})`) or an `edha-watch` rule whose
  `payloadTarget` is the watched actor (Coercive Pressure). **Pick the event, not the talent.**
- **Density, measured: 3 re-tests + 19 hygiene 🤖 in; 11 rows retired, 4 partials, 1 new row, 1 new
  ruling — about 1 retirement per 5 tool calls.** The re-tests were far denser than the hygiene rows
  (3 rows off ~8 calls) because they share one subject; the R-65 rows each needed their own tree, its
  own resources and often its own token. **Budget per family, and prefer the family whose failure mode
  is "silently contributes 0" — those are where the information is.**

## Operating lessons from run 26 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **A `javascript_tool` TIMEOUT DOES NOT CANCEL THE SCRIPT — it keeps running in the page and can fire
  a second copy of everything after the hang.** Run 26 lost four calls to a "double-fire" that was its own:
  a call that hung on `canvas.animatePan` timed out at 45 s, then completed later and used Draw Mana a
  SECOND time, arming a second `edhaPickPoint` listener on `#board`. One dispatched pointerdown then
  resolved BOTH listeners and produced two identical refusals and two identical notifications — which reads
  exactly like an engine double-dispatch. **After any timeout, assume the tail of that script still ran**;
  re-establish state and re-drive cleanly before recording anything.
- ❌ **`canvas.animatePan` NEVER SETTLES with the pane hidden** (it is a ticker/rAF animation — run 22's
  family). Use `canvas.pan({x, y, scale})`, which is instant and works. This is what caused the timeout
  above.
- ❌ **SNAPSHOT `_source.system.resources`, NOT the derived `actor.system.resources`.** Run 26 snapshotted
  the derived object, and restoring it wrote AE-derived values into `_source`, where `prepareDerivedData`
  then added the AE contribution a SECOND time (`hea.max.bonus` 15 → 22, `foc.max.bonus` 4 → 6). The
  restore has to be `target_derived − (current_derived − current_source)`. Snapshot `_source` and this
  whole class of drift disappears. **Also snapshot `flags.edha-content.tempHp`** — `edha.setTempHp(a, 0)`
  is the right way to clear Temp HP, but it will silently delete a PRE-EXISTING Temp HP (Bench — White was
  carrying `{source: "Final Decree", value: 7}` from an earlier run).
- ⚠️ **A watcher-managed AE can be deleted again while you are restoring it.** Recreating Bench — Order's
  `Covenant (Bench — Order)` AE *before* rewriting `flags.edha-content` let the ledger go momentarily empty
  and the watcher took the AE straight back out. **Restore the flags FIRST, then the effects** — or check
  and re-create afterwards, which is what run 26 had to do.
- ✅ **Turn boundaries are cheap and completely reliable, and `combat.started` is derived.** `Combat.create(
  {scene, active: false})` + a Combatant + `ui.combat.initialize({combat})` + `combat.update({round, turn})`
  fires `combatTurnChange`; `combat.nextTurn()` sets `combat.previous.turn`, which is what the turn-END
  sweeps read. `started` is `round > 0 && turns.length > 0` — no `startCombat()` call is needed, and
  Ben's own combat stays untouched throughout. Run 26 drove Living Image's upkeep, Spreading Roots'
  turn-end offer and Resurgent Growth's turn-start payout off ONE two-combatant bench combat.
- ✅ **Read the row's rule config out of `data/authored/*.json` BEFORE staging — half the "blockers" in the
  checklist are stale cost notes.** Natural Recovery and Probability Cascade were both parked for years on
  "needs an Opportunity, which cannot be forced"; both carry the Opportunity as **honour-system text**
  (`costNote` / prompt wording), and the only real cost is a resource the activation consumes. Two rows off
  one grep.
- ✅ **One flow can settle several rows when you pick the flow by its EVENT, not by its talent.** One Flame
  Surge detonation retired the burst-card row, Flashpoint, and the formula-bar row (the advantage Flashpoint
  arms is the advantage roll the formula row wants). One Verdant Mend retired both Natural Recovery and
  Resurgent Growth. One `Draw Mana` placement gave 2bS-1 its refusal, its ring screenshot and the terrain
  that Spreading Roots needed.
- ✅ **When a row names an ADVERSARY behaviour, grep `data/adversaries.json` for who can actually stage
  it.** The "13 burst-only riders" row looked unstageable until a data scan showed **Hazewyrm Elder** is the
  only one of the thirteen that owns an `edha-burst` at all — and it carries a Kindle rider, so its own
  Flame Surge is a one-call proof. The same scan is what proved the other eleven *cannot* be driven as
  written, which is a result worth reporting rather than a row worth re-queuing.
- ⚠️ **Compare the COMPENDIUM document, not your imported copy, before blaming a build.** Run 26 read the
  imported Reeve-Owl, saw `system.events === {}` on one item, and could have called it an import artifact;
  reading `pack.getDocument(id)` directly, and then diffing every item's rule COUNT against
  `data/adversaries.json` for six adversaries, is what turned it into a precise finding — 5 actors matching
  item-for-item, one item missing exactly its four rules.
- ⚠️ **`token.update({x, y})` refusals are still silent, and re-creating the token is often cheaper than
  diagnosing.** A staged Order duplicate would not move from (2700,4200) to (3600,4500) — no error, no
  notification. Deleting the bench token and creating a new one at the destination took one call. Do not
  spend a diagnosis budget on a token you own.
- ⚠️ **A scene-lighting row can be structurally impossible on the Playtest Map.** `environment.darknessLevel`
  is 0 and `environment.globalLight.enabled` is true, so **no square is ever unlit** and every
  `edha-dark-veil` row is unreachable there. Do not stage around it — record BLOCKED and name it. A
  bench-created scene is the drivable shape if a future run wants those rows.

## Operating lessons from run 27 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **`createEmbeddedDocuments("Token", [...])` DOES NOT RETURN THE DOCS IN INPUT ORDER.** Run 27 built its
  name→id map as `out.forEach((t,i) => map[spots[i].name] = t.id)` and got a **crossed** map: the token it
  called "Raider NEAR" was the one 35 ft away. The first Cover-Their-Retreat reading was therefore exactly
  inverted, and four calls went into "diagnosing" a defect that did not exist. **Read the map back off the
  created documents' own `name`/`x`/`y`, never off the input index** — and when a range-gated result comes out
  backwards, suspect the map before the engine.
- ❌ **`edha-gm-cue` is ONCE PER ROUND PER OWNER, and a spent budget is indistinguishable from a dead rule.**
  The ledger is `actor.flags["edha-content"].trigRound`, keyed
  `cue:<item>:<trigger>:<atFraction>:<rangeFt>:1` → round number. A second attempt in the same round produces
  **absolutely nothing** — no card, no notification. **Step `combat.update({round: N+1})` between every cell,
  and read `trigRound` as the ground truth** (it is also how you prove which of two staged drops actually
  fired the cue). `edha.resetTriggers()` did NOT clear it in this run; the round bump did.
- ❌ **Cues and damage RIDERS ride different chokepoints — pick the driver to match.** `edha-gm-cue`,
  `edha-thorns`, `edha-on-hit` and the kindle-light rider all run inside the **`applyDamage`** wrapper, so
  `victim.applyDamage(list, {edhaSource: <dealer actor>, originatingItem: <the item>})` drives them exactly.
  But `edha-damage-rider` (Spearing Beak's `whenTargetFooled` +1d6, Kindle, Prognosis) is applied by the
  **`CosmereItem#rollDamage`** wrapper and reads `edhaUserTargetActor()` — so `applyDamage` can never show it,
  and "the bonus did not apply" measured that way is the harness. Control the dealer's token, target the
  victim, and call `item.rollDamage()`; the proof is the formula string
  (`1d8 + 2 + (1d6[Spearing Beak])[Spearing Beak]` vs `1d8 + 2 + 0`).
- ✅ **An `edha-on-hit` rule on a DAMAGING ability is item-specific, and that is `edhaOnHitIsItemSpecific`,
  not a bug.** With no `whenDealer` field, the rule fires only on its OWN item's hit whenever that item has
  both `system.damage.formula` and `activation.type === "skill_test"`. Press the Line and Devastating Blow are
  both in that shape, so a hit with the actor's *other* weapon correctly cues nothing — which is also the
  row's negative control, free.
- ✅ **`game.combat` is the VIEWED combat, so an `active: false` bench combat can satisfy rows that "need the
  active combat".** Run 21 recorded Braced cell (b) BLOCKED on the belief that the Brace user had to be a
  combatant in Ben's combat. `Combat.create({scene, active: false})` + combatants +
  `ui.combat.initialize({combat})` makes `game.combat` **yours**, and `edhaApplyTimedStatus` then stamps
  `expireAfter` immediately. Ben's combat is never touched. **Re-read any row parked on "needs the active
  combat" before believing it.**
- ⚠️ **Bench tokens can be ORPHANS — check `game.actors.get(tok.actorId)` before driving one.** Three tokens
  on the Playtest Map (`Bench — Green`, `Bench — Heroic`, `Bench Target — Floater`) point at actor ids that no
  longer exist, because `bench-setup-console.js` recreated the actors and left the tokens. `edhaCasterToken`
  then finds nothing and the talent refuses with "no token on the scene to place terrain from" — which reads
  exactly like an engine fault. **Create a fresh token from the bench actor instead** (and delete it at the
  end); do not delete the orphan, it is pre-existing.
- ⚠️ **A token `update({x,y})` that lands somewhere else is the wall-interpolation case, and it MOVES the
  token.** Run 27 tried to walk the orphan Green token from (4800,14100) to (2400,4800) and it stopped at
  (4544,13106) with no error. Restoring it worked, but the lesson is: **snapshot the position before the
  move, not after**, and prefer creating a token at the destination.
- ⚠️ **Your own staged hazard will keep damaging the scene between rows.** A Pinpoint Charge Region left on
  the map burned an adversary from 8 HP to 0 across three round bumps, which briefly looked like a cue firing
  for a creature that had not been touched. **Delete a staged Region the moment its row is done**, and treat
  any unexplained HP change as your own terrain until you have checked the region list.
- ✅ **`ChatMessage.getSpeaker({actor})` picks the FIRST token of that actor**, so with two unlinked copies of
  one adversary the card alias can name the wrong token. Do not read identity off the speaker line — read it
  off `trigRound`, the effect flags, or the card's `(<victim> dropped.)` suffix.
- **Density, measured: 3 re-tests + 12 adversary rows in; 14 rows retired, 0 fails, 1 BLOCKED, 1 new row —
  about 1 retirement per 4.5 tool calls.** The adversary cues were the densest family yet because they share
  ONE driver (`applyDamage` with an explicit dealer) and one budget ledger; once the harness was right, six
  rows came off in four calls. **Prefer a family with a shared chokepoint over a family that shares a theme.**

## Operating lessons from run 28 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **READ THE RULE'S `event` FIELD, NOT JUST ITS HANDLER CONFIG.** Beacon of Stability's
  `edha-cleanse` handler carries `trigger: "use"`, so `item.use()` looks like the obvious driver — and
  it posts nothing, spends the activation cost, and reads exactly like a dead talent. The rule's
  **event** is **`edha-draw-mana`** (`data/authored/leyline-white.json`), which the handler's own
  registration description says out loud ("Put it on the Draw Mana event for Beacon of Stability's
  cadence"). Three calls went into diagnosing an engine that was fine. **Before staging any row, dump
  the authored rule as `{event, handler.type, handler}` — the `event` decides the driver, the
  `handler` only decides what happens once it fires.**
- ❌ **A HAND-BUILT STATUS ActiveEffect CANNOT BE REMOVED BY THE ENGINE'S SWEEPS.** `edhaSceneReset`
  clears statuses with `actor.toggleStatusEffect(st, {active: false})`, and Foundry matches the
  **CONFIG status's fixed `_id`** (`condedict0000000`, `condcovenant0000`, …) — not `statuses.has(st)`.
  A probe effect created with `createEmbeddedDocuments("ActiveEffect", [{_id: randomID(), statuses:["edict"]}])`
  therefore sits in `a.statuses` the whole time, passes the sweep's `a.statuses.has(st)` guard, and
  **survives** — which reads precisely like "the combat-end sweep does not clear statuses". It cost run
  28 four calls and nearly a false FAIL on the two-combats row. **Stage a status with
  `actor.toggleStatusEffect(id, {active: true})`, never by hand.** (Run 24's "one-status AE with no
  `_id` THROWS" advice still holds for effects that are *not* statuses; for statuses, don't create them
  at all.)
- ❌ **VALIDATE A MOVEMENT LANE WITH THE TOKEN'S FOOTPRINT, NOT A CENTRE RAY.** Run 28 swept the map
  for a clear 3600 px lane with `polygonBackends.move.testCollision(from, to)` — a **point** ray — and
  got three. The dealers were **2×2 (600 px)** adversaries, and none of them could move a single square
  there: `edhaApplyMove`, `token.update({x,y})`, `update(…, {teleport: true})` and
  `token.move(…, {action: "displace"})` **all returned silently with the token unmoved**, no error and
  no notification, while the centre ray still said "clear". A wide footprint clips walls the ray misses.
  **Test the four corners of the footprint along the path, or stage large-token rows with a 1×1 dealer.**
- ✅ **`edha-deal-damage` needs `item.rollDamage()`; `edha-on-hit` needs `applyDamage`. They are
  different chokepoints and picking the wrong one manufactures a dead-rule reading.** This is run 27's
  `edha-damage-rider` lesson generalising: driving Brandram with
  `victim.applyDamage(list, {edhaSource, originatingItem})` fired Shockwave Slam's `edha-on-hit` push
  perfectly and produced **absolutely nothing** from Unstoppable's `edha-deal-damage` rule. The same
  call, re-issued as `item.rollDamage()` with the dealer controlled and the victim targeted, fired it
  first try. **Grep the rule's `event` (see lesson 1) and pick the driver from that, not from the
  symptom.**
- ✅ **Run 27's `game.combat` correction really does unblock the old "needs the ACTIVE combat" rows —
  go re-read every one of them.** Three bestiary `Unstoppable` rows had been BLOCKED since run 16 on
  "`edhaIsFastTurn` reads the ACTIVE combat and we may not deactivate Ben's". `Combat.create({scene,
  active: false})` + a combatant + `ui.combat.initialize({combat})` + `combatant.setFlag("cosmere-rpg",
  "turnSpeed", "fast")` makes `whenFastTurn` **true**, with Ben's combat untouched — and the rule fired
  for the first time in the project's history. ⚠️ **`edhaCombatantOf` additionally requires
  `combat.started`**, which is derived (`round > 0 && turns.length > 0`), so remember the
  `combat.update({round: 1, turn: 0})`.
- ⚠️ **`createEmbeddedDocuments("Combatant", …)` crosses `tokenId`s the same way run 27's Token create
  did.** Building the combatant list from a `.slice(-6)` of a running id array produced four combatants,
  two of them the same actor, and a `tokenId` pointing at somebody else's token — which made
  `edhaCombatantOf` miss and looked exactly like the old blocker still being in force. **Build
  `{actorId, tokenId}` pairs explicitly and read the result back by name before driving anything.**
- ✅ **ONE heal can retire three rows.** `ally.applyDamage([{type: "heal", amount: 4}], {edhaSource:
  healer, originatingItem: healItem})` fires `edhaDispatchHealReact`, which walks **every**
  `edha-heal-react` rule on the healer at once — run 28 got Natural Recovery's cleanse offer, Vital
  Surge's Temp-HP offer and the system heal card from a single call. Pick the CHOKEPOINT, not the talent
  (runs 25–27's lesson, still the highest-yield habit on the bench).
- ✅ **A forced throw is a legitimate way to prove an outer catch — but force it at a REAL line.**
  Both R-59 and the fix-pass-F "a failed button says so" row need a handler to throw, and **neither
  row's own suggested recipe actually throws** (a deleted talent is swallowed by
  `fromUuid(...).catch(() => null)`; an already-resolved burst and an already-sprung snare both hit
  friendly `ui.notifications.info` guards). The working technique: shadow `globalThis.fromUuid` so it
  throws **synchronously** for `".Item."` uuids only — the actor ref still resolves, the `.catch()` is
  bypassed because the throw happens before it is reached, and the exception lands in the handler's own
  outer catch. Restore `fromUuid` in the same call. **Declare the method when you record the row.**
- ⚠️ **`javascript_tool` timed out three times in this run, and every time the script had already
  finished its useful work** — the results were sitting in world state and the notification recorder.
  Run 26's rule still stands (the tail keeps running), but add this: **after a timeout, READ the state
  before re-driving.** Two of the three timeouts here would have been re-driven pointlessly. Budget
  ~6 s per `item.use()` and cap dialog-polling loops by wall clock, not by iteration count.
- ⚠️ **`sessionStorage` survives the F5 that R-66 requires; your page globals do not.** The world
  snapshot, the created-document lists and the R-66 fixture ids all had to be serialised
  (`sessionStorage.setItem`, ~52 KB) before the reload and re-hydrated after it. **Persist the snapshot
  before any row that reloads the page**, or the run ends with nothing to restore from.
- **Density, measured: 12 rows out of the checklist + 3 rows materially unblocked, 0 engine defects, in
  ~55 tool calls and 36 minutes.** The three long-deployed **re-tests** were again the densest family
  (3 rows in ~10 calls) because they share one subject and one actor; the scattered hygiene rows each
  needed their own tree, resources, token and driver. **Take the re-test block first, every run.**

## Operating lessons from run 29 (2026-09-05 — these OVERRIDE older advice where they conflict)

- ❌ **THE HIDDEN PANE SWALLOWS EVERY ANIMATED TOKEN MOVE, SILENTLY — and this is what run 28
  misdiagnosed as a 2×2 footprint clipping walls.** v13 routes an **animated, non-teleport** token
  update through its movement/animation pipeline. With the Browser pane hidden, `document.hidden`
  is `true` and **`requestAnimationFrame` never fires**, so that pipeline never advances and the
  position write **never commits** — no error, no notification, and `await doc.update(...)` still
  **resolves**. Measured, holding everything else constant:
  `doc.update({x,y}, {animate: true, teleport: false, edhaForced: true})` (the engine's exact option
  set, from `edhaMoveTokenTo`) → **token unmoved**; the identical call with **`animate: false`** →
  **moved, to the exact pixel**. A **1×1** token fails the same way as a 2×2, which is what rules the
  footprint out. **This is not an engine defect** — `edhaComputeMove` picks the right destination and
  `edhaMoveTokenTo`'s `try/catch` has nothing to catch.
  **Two workarounds, both declared when you use them:**
  1. **Pump the ticker** — `canvas.app.ticker.update(performance.now())` in a loop. ⚠️ A
     `setInterval` is **clamped to ~1 Hz in a hidden page**, so the animation crawls and can settle
     mid-path; use a tight `await new Promise(r => setTimeout(r, 0))` yield loop instead. Shimming
     `window.requestAnimationFrame` alone is **not** enough: PIXI's ticker is already parked on a
     real rAF callback that will never fire, so you must kick the ticker as well.
  2. **`animate: false`** for any move that is pure staging (resetting a fixture, parking a token).
     Instant and exact — prefer it over diagnosing a refusal.
  **Corollary: never conclude "the token could not be moved" from an animated update.** Re-issue it
  with `animate: false` before writing anything down. Run 28 lost three rows to this.
- ❌ **A whole-object resource restore does NOT round-trip.**
  `actor.update({"system.resources": snap.res}, {diff: false, recursive: false})` left
  `inv.max.override` at **2** where the snapshot said **4**, on three separate actors — silently, and
  it survived a re-diff as real drift. Re-issuing the same values as **dotted paths**
  (`"system.resources.inv.max.override"`, `".useOverride"`, `".value"`) restored them exactly.
  **Restore `_source` resources field-by-field with dotted keys**, then re-diff; the whole-object
  form looks like it worked and does not.
- ✅ **Confirm the previous run's blocker from the DATA before you re-stage it.** Both open R-64
  halves had been carried as "structurally hard, re-queue next run" since run 25. A single sweep of
  `data/authored/*.json` settled them permanently: `edha-reveal {target: victim}` ships **exactly one**
  rule and `edha-owner-list {target: victim}` **exactly eight**, and **all nine sit on
  `edha-test-success`** — behind an H1 def-test that resolves its own target after the roll, so the
  payload creature and the canvas selection can never differ, and there is no alternative rule to try.
  **That is a finished result, not a queue item.** Write the sweep, the count, and the condition that
  would reopen it. Cost: one Bash call, versus a staging attempt every run forever.
- ⚠️ **A row's stated SUBJECT can be wrong in a way that makes it look unstageable — check the name
  and the handler before believing "the fixture is missing".** Two of this run's rows were mislabelled:
  - *Venom Glands* was recorded as needing a hand-granted `Mutation` item. The talent is called
    **`Adaptive Mutation`** and `Bench — Life` already had it — a **name mismatch, not a roster gap**
    (and the proposed `bench-setup-console.js` fix was therefore unnecessary).
  - *"Set Charge / Detonate's ally-heal half"* is **not reachable through Set Charge at all**:
    `edhaResolveCharges` hard-codes `heal: false`, and the `if (b.heal)` fold branch lives in
    **`edhaBurstDetonate`** (`edha-burst`). Grepping every authored rule found 3 `edha-burst` rules and
    exactly one heal-configured — **Mending Aura** — which drove the row in one call.
  **Grep the handler that actually owns the branch, then find who ships it**, rather than trusting the
  talent name on the row.
- ✅ **Validate a lane against walls AND tokens.** Run 28's footprint advice was aimed at the wrong
  cause, but the token half of it is real: the first lane run 29 picked was wall-clear and had a
  `Trooper` sitting in it, and `edhaComputeMove`'s occupied-destination step-back correctly produced
  *"moves **10 ft** … (stopped by BENCH Brandram R29)"* instead of the full 20. Sweep both, or read the
  card's own stop-reason — it names its blocker.
- ⚠️ **`javascript_tool` still times out on long position polls, and the script still keeps running**
  (runs 26/28). Three timeouts this run, all three with the useful work already done. **Structure the
  call so it cannot hang: fire the driver in one call, read the result in the next.** Do not await an
  animation inside the same call that starts it.
- **Density, measured: 5 rows off the checklist + 2 halves closed on rows that stay open + 1 retracted
  root cause, in ~30 tool calls / ~45 minutes, 0 engine defects.** The single highest-value move was
  **refusing to accept the previous run's stated blocker** and re-deriving it — it converted three
  "canvas half open" rows into passes and stopped a wrong diagnosis propagating into run 30.

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
