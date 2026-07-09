# EDHA Playtest — Remote/Multi-Machine Watch Sheet

Glance-sheet for the **2nd** session with players on other machines (remote clients accessing
actors, moving tokens, using talents). This is the layer that never runs when you test solo as GM,
so it's where tonight will actually break. Ordered by likelihood × blast radius. For each: **what
you'll see → why → what to do in the moment.** Capture anything weird for the fix session (see
bottom).

**The one architectural fact behind all of this:** the engine does cross-actor writes (damage,
statuses, resources, summons, terrain, token moves, roll rewrites) on **exactly one GM client**.
A player's talent that touches anything it doesn't own **emits a socket op** to that GM. So the
whole system leans on: (1) a GM being online, (2) only ONE GM applying, (3) the socket packet
arriving, and (4) every PC having ⟳ Synced. Break any one and talents "do nothing" on players'
screens while working fine on yours.

---

## 0. Before players connect (30-second preflight)

- [ ] **DEPLOY FIRST is actually done.** The checklist's one-time deploy block is still unchecked in
      the repo. If tonight's build is post-06-16 and you haven't run the sync+rebuild+relaunch, the
      packs carry stale double-firing rules. Confirm the console shows
      `Edha Content | native event system registered (…)` on launch.
- [ ] **⟳ Sync Talents on EVERY player PC, not just yours.** Owned-talent behavior is a per-PC
      snapshot. A player who skipped Sync will silently run *old* talent logic — the #1 "works for
      me, not for them" trap. Have each remote player confirm they synced after connecting.
- [ ] **You are the ONLY GM connection.** Not logged in twice (second tab/window), no assistant-GM.
      Two GM clients means ops either double-apply or the wrong one applies. (Guard is
      `activeGM.isSelf` — a second GM makes it ambiguous.)

---

## 1. "A GM must be online" — the single biggest failure mode

Nearly every player-initiated cross-actor effect checks `game.users.activeGM` and, if none, throws a
`ui.notifications.warn("Edha: a GM must be online to …")` and **drops the op — there is no queue or
retry.** Covers: apply/timed statuses, resource writes (Shatter Focus), set-flag grants (Raise the
Stakes / plot die), roll rewrites (Voice of Authority), summons, hazard/terrain, item add/delete,
burst & detonation damage, forced token moves.

- **Watch for:** any player seeing a yellow toast starting `Edha: a GM must be online…`. That talent
  did nothing.
- **Trigger tonight:** you (GM) reload the world, briefly disconnect, or hit F5 mid-combat. During
  that window every player talent that relays is a silent no-op.
- **In the moment:** if a talent "didn't fire" for a player, first ask *was the GM screen mid-reload?*
  Re-use the talent once you're back. Avoid reloading your client during others' turns.

## 2. Socket packet just doesn't arrive

Player emits `game.socket.emit("module.edha-content", …)`; there's **no ack**. If the packet is
dropped or the relay throws GM-side, the effect silently doesn't happen — the player sees their card
resolve but the target is unaffected.

- **Watch for:** a talent that works when *you* use it (GM applies directly) but "does nothing" when
  a **remote player** uses it on a foe/ally. That asymmetry = the relay leg.
- **In the moment:** re-trigger once. If it reliably fails only from a specific player's machine,
  note the talent + that it's player→GM relay (not GM-direct) for the fix pass.

## 3. Silent permission failures on player-owned writes

Some writes a player *can* do locally are wrapped in `try/catch { /* perms */ }` and swallow the
error (e.g. marked-damage resource recovery). If the player lacks OWNER on the actor being written,
it just… doesn't, with no toast at all.

- **Watch for:** resource gains / status marks that quietly don't land, with **no** warning toast
  (distinguishes this from #1). Common on effects that write to a foe or another PC.
- **In the moment:** check the player's ownership on that token. Note token + talent.

## 4. Cross-client target & adjacency reads (GM-side)

Several detections (Pack Sense / Pack Hunter focus-fire, flanking/adjacency, Apex Predator advantage,
Spreading Roots turn resolution, LOS `edhaCanSee`) read `user.targets` / token positions **as the GM
client sees them**. Remote target-syncing and token-position lag can make the GM read a stale target.

- **Watch for:** ally/flank/target-conditional bonuses applying to the wrong creature or not at all,
  specifically when a **remote** player set the target a moment earlier.
- **In the moment:** have the player re-confirm their target before rolling. Note if it's reproducible.

## 5. Owner-judged click-cards from a player (non-GM) seat

Lots of White/Blue/etc. cards are "OWNER-JUDGED — player clicks the button on a success." Those
buttons must render **and be clickable from a player client**, and the click travels with the chat
HTML to the owner's client. You've mostly tested these as GM.

- **Watch for:** a player says the resolve button is greyed out, missing, or does nothing when *they*
  click it (vs. you clicking it for them working). Also roll-rewrite cards (Voice of Authority) that
  only rewrite when the owner is a **remote** player.
- **In the moment:** as a fallback you (GM) can click it for them; note the card so we can verify the
  player-seat path.

## 6. Token movement, forced-move, and move-prohibition

Moving tokens is new-ish for remote seats. Forced movement (Red push) is GM-relayed; the Edict
"move" prohibition is a `preUpdateToken` veto; the forced-move stamp distinguishes a shove from a
walk. These fire on specific clients.

- **Watch for:** a remote player being unable to drag their own token (ownership), a forced push not
  landing or landing on your screen only, or the move-violation prompt firing on a *shoved* move
  (should be suppressed) or NOT firing on a walked move.
- **In the moment:** confirm the player owns the token; note direction of the discrepancy (engine
  over- vs under-firing) — that detail is what makes it fixable.

## 7. Turn-relative expiry across remote combat

Many statuses expire "end of the OWNER's next turn," computed on a GM-side pass keyed to combat turn
changes. Remote turn-advance propagation can make something linger a turn or drop a turn early.

- **Watch for:** a status (Weakened, Disoriented, noreactions, Necrotic-halved-healing, etc.) that
  outlasts or under-lasts its window when the owner is a remote player.
- **In the moment:** note the status + whose turn it was owned/expired relative to.

---

## What to capture for the fix session (so it's root-causeable, not guesswork)

For anything that misbehaves, jot the **five things** that separate a symptom report from a fix:

1. **Who** triggered it — GM seat or which remote player (and did they ⟳ Sync?).
2. **Talent name** + the target (self / ally / foe, owned or not).
3. **GM-direct vs player-relay** — did it also fail when *you* used it? (Isolates the socket/relay leg.)
4. **Any toast?** — `"GM must be online"` (#1) vs silent (#3) vs a JS error in the GM console (F12).
5. **Reproducible or one-off** — and whether a re-trigger fixed it (points at packet loss/timing vs a
   real logic bug).

Freeform chat notes are fine — drop them and a session will run `test-pass-fixes`. A screenshot of
the GM console (F12) at the moment of a failure is worth more than any description.
