/* ================================================================================================
 * H3 `edha-owner-list` (07-24p) — the SUSTAINED CAPPED LEDGER, hoisted.
 *
 * §9o called this "a consolidation, not a design: six trees already hand-roll byte-identical code".
 * Reading the six side by side (edhaOrderEdict · edhaFatePlaceMarker · edhaPlaceOmen · the Remains
 * list · edhaGetCharges · edhaGnosisSetInsight) says that is TOO KIND, and the differences are the
 * design constraints, so they are written down here rather than averaged away:
 *
 *   · CAP BEHAVIOUR SPLITS. Order/Fate push past the cap and fizzle the OLDEST (Ben R1). Chaos
 *     REFUSES at the cap and says so. Both are deliberate, so `evict` is a field, not a convention.
 *   · MEMBERSHIP IS STORED IN TWO DIFFERENT PLACES. Order/Fate/Death/Destruction keep an owner-flag
 *     array; Chaos keeps NOTHING and re-derives its list by scanning the canvas for its own marks —
 *     which is exactly why Chaos cannot fizzle an oldest entry: it has no order to fizzle by. This
 *     handler stores the array AND writes the same `markedBy.<status>` mark the scan reads, so the
 *     un-migrated half of a tree keeps working mid-migration.
 *   · TWO OF THE SIX ARE NOT THIS SHAPE AT ALL. Fate's Snares and Destruction's Charges own canvas
 *     objects (a MeasuredTemplate, a Region) that must be deleted when the entry dies; Knowledge's
 *     Insight is a COUNTED SINGLE BEARER (0–5 on one creature), not N members. The ledger is still
 *     theirs; the canvas work is not, and stays with the placement handlers.
 *
 * The idiom for a CONDITIONAL payload — Isolating Pressure's "if it bears my Omen, shatter it for
 * extra damage" — is rule ORDER plus the dispatcher's existing short-circuit: `release` returns
 * false when there was nothing to release, and edhaDispatchTestResult stops the remaining rules on
 * a false. So [apply status] → [release] → [damage] does the conditional with no new gate field.
 * ============================================================================================= */

// PURE (pinned in tests/): push `entry` onto `list` under `cap`, honouring the eviction policy.
// Returns the new list plus what happened, so the caller can card it. Never mutates its input.
function edhaListPush(list, entry, { cap = 1, evict = "oldest" } = {}) {
  const cur = Array.isArray(list) ? list.slice() : [];
  const lim = Math.max(0, Math.floor(Number(cap)) || 0);
  if (lim <= 0) return { list: cur, evicted: [], refused: true };
  if (evict === "refuse" && cur.length >= lim) return { list: cur, evicted: [], refused: true };
  cur.push(entry);
  const evicted = [];
  while (cur.length > lim) evicted.push(cur.shift());   // oldest first (Ben R1, the Order/Fate convention)
  return { list: cur, evicted, refused: false };
}

/* MEMBERSHIP lives on the mark, ORDER lives in this list — and the mark wins.
 *
 * Reconciling on read is what makes a HALF-migrated tree correct. Chaos's un-migrated talents
 * (Spreading Omen, Cascade Collapse, Unravel Everything) still call edhaRemoveMark, which clears
 * the status + markedBy and knows nothing about this ledger; without the filter below the ledger
 * would keep a phantom entry and the owner would be stuck under their cap. It also means a GM who
 * strips the status by hand does the right thing, which the old owner-flag lists never handled. */
function edhaOwnerList(owner, key, status = null) {
  const l = owner?.flags?.["edha-content"]?.lists?.[key];
  if (!Array.isArray(l)) return [];
  const sid = canvas?.scene?.id;
  const st = status || key;
  return l.filter((e) => {
    if (!e || (e.sceneId && sid && e.sceneId !== sid)) return false;      // scene-scoped, like Charges/Snares
    const a = (e.uuid && typeof fromUuidSync === "function") ? fromUuidSync(e.uuid) : null;   // no uuid (point-bound / freebie) = keep — fail OPEN, the covenants convention
    const act = a?.actor ?? a;
    if (!act) return true;                                               // off-scene / unresolvable: keep the entry
    return !!act.statuses?.has?.(st);
  });
}
async function edhaSetOwnerList(owner, key, list) {
  try { await owner.setFlag("edha-content", `lists.${key}`, list); }
  catch (e) { console.error(`Edha Content | owner-list ${key} write failed`, e); }
}
/* SERIALISED read-modify-write for the H3 ledgers (2026-07-26n — bench run 4 defect 2).
 * Every ledger mutation is a read-modify-write on flags.edha-content.lists.<key>, and Foundry
 * gives that no isolation: one Necrotic Cascade dropping three adversaries in the same tick ran
 * three concurrent harvest placements that all read the SAME stored list — last write wins, and
 * the ledger ended holding one entry where two should have survived (cap 2, eviction oldest;
 * sequential drops accumulated correctly — concurrency, not cap). The fix is a per-owner-per-key
 * promise queue AT THE SHARED LEVEL: a mutation enters the queue, re-reads the list INSIDE it,
 * and commits before the next mutation reads. Rules of use:
 *   • the READ must happen inside the queued task — queueing only the write fixes nothing;
 *   • user interaction (dialogs, pick-points) stays OUTSIDE the queue, or one player's open
 *     dialog stalls every other mutation of that ledger;
 *   • never queue a task that awaits ANOTHER queued task on the same owner+key — that is a
 *     deadlock (the reason the executor's `spend` op does not wrap edhaLedgerSpend, which
 *     carries the queue itself).
 * A failed task never wedges the chain (each link swallows its predecessor's rejection), and the
 * chaining discipline is pinned in tests/ (owner-list-race). */
const EDHA_LIST_QUEUE = new Map();   // `${owner uuid}::${key}` → tail promise of the pending chain
function edhaOwnerListQueue(owner, key, task) {
  const qk = `${owner?.uuid ?? owner?.id ?? "?"}::${String(key ?? "").trim()}`;
  const tail = (EDHA_LIST_QUEUE.get(qk) ?? Promise.resolve()).catch(() => {}).then(() => task());
  EDHA_LIST_QUEUE.set(qk, tail);
  void tail.catch(() => {}).finally(() => { if (EDHA_LIST_QUEUE.get(qk) === tail) EDHA_LIST_QUEUE.delete(qk); });
  return tail;
}
function edhaListCap(owner, formula) {
  const n = Math.floor(edhaEvalSync(formula || "@tier", owner?.getRollData?.() ?? {}));
  return Math.max(1, Number.isFinite(n) ? n : 1);
}
// Every character's ledger under `key`, as [{ownerId, list}]. This is also what replaced the
// name-keyed `edhaCharacterOwnersOf("Covenant")` sweeps (07-24u): a ledger sweep keys on DATA, so it
// survives a rename and — unlike the talent scan — still finds an owner who kept the pact but
// respecced the talent away.
// ⚠ `status` (2bV): edhaOwnerList reconciles each entry against the MARKER status, which defaults to
// the ledger KEY — and Order's keys are plural ("covenants"/"edicts") while the marker ids are
// singular ("covenant"/"edict"). Without the explicit status every resolvable entry failed the
// mark-wins filter and the sweep read EMPTY, silently killing the Covenant proximity AE and the
// break watch (pinned in tests/ — the 2bV regression).
function edhaOwnerLedgers(key, status = null) {
  const k = String(key || "").trim(); if (!k) return [];
  return (game.actors?.filter(a => a.type === "character") ?? [])
    .map(a => ({ ownerId: a.id, owner: a, list: edhaOwnerList(a, k, status) }))
    .filter(l => l.list.length);
}
/* PURE (pinned in tests/): does some OTHER owner's ledger still hold this creature? (07-24u, trap 3)
 *
 * A marker status is a property of the CREATURE, not of one pact, and two of Order's are deliberately
 * shared between owners — `edhaOrderStillBound` and `edhaOrderDropCovenantIcon` existed for exactly
 * that. edhaListUnmark clears a status unconditionally, so without this one owner's eviction strips
 * another owner's icon, silently and at the table. `multiOwner` on the rule turns the check on. */
function edhaListSharedHold(ledgers, uuid, excludeOwnerId) {
  if (!uuid) return false;
  for (const l of (Array.isArray(ledgers) ? ledgers : [])) {
    if (!l || (excludeOwnerId != null && l.ownerId === excludeOwnerId)) continue;
    if ((Array.isArray(l.list) ? l.list : []).some(e => e?.uuid === uuid)) return true;
  }
  return false;
}
/* THE SCENE-START FREEBIE (2bW — the Remains repoint's one genuinely new semantic). The flat
 * Remains flag distinguished UNSET ("You begin each scene with 1" — a talent's grant) from EMPTY
 * ("the freebie is spent"), and edhaOwnerList cannot: it returns [] for both. So the distinction
 * stays where it always lived — the RAW flag — and the freebie is DECLARED BY A RULE FIELD
 * (`sceneFreebie` on an edha-owner-list rule naming the ledger), never by a talent name: the old
 * accessor hard-coded edhaOwnsTalent(owner, "Reaper's Harvest"), which is rule 2b's exact smell.
 * A freebie entry carries no uuid, so the mark-wins reconcile keeps it (fail-open on a missing
 * ref). Writing ANY list — even [] — consumes the unset state, exactly as the flat flag did: the
 * freebie materializes into the stored list on the first write and never comes back until the
 * scene cleanup unsets the key ("[] ≠ unset"). */
function edhaLedgerFreebie(owner, key) {
  try {
    for (const { handler: h } of edhaActorRulesOf(owner, "edha-owner-list")) {
      if (h.sceneFreebie === true && String(h.list || "").trim() === key)
        return { label: String(h.freebieLabel || "").trim() || "Scene-start" };
    }
  } catch (e) {}
  return null;
}
// Freebie-aware read: what the owner can actually SPEND right now. Reach for this in any gate or
// spend path; plain edhaOwnerList stays the reconciled STORED list (and reads [] for unset).
function edhaOwnerListAvail(owner, key, status = null) {
  const raw = owner?.flags?.["edha-content"]?.lists?.[key];
  if (!Array.isArray(raw)) {
    const fb = edhaLedgerFreebie(owner, key);
    return fb ? [{ id: "freebie", uuid: null, name: fb.label, freebie: true }] : [];
  }
  return edhaOwnerList(owner, key, status);
}
/* Spend the OLDEST entry (the Remains/Charge convention): pop, commit, unmark, card. Returns true
 * when something was spent. Spending the synthetic freebie writes [] — the flat accessor's
 * "[] ≠ unset" semantic, preserved through the repoint. */
async function edhaLedgerSpend(owner, key, status = null, source = "") {
  // Queued (07-26n): the availability read happens INSIDE the queue, so two spends landing in the
  // same tick consume two DIFFERENT entries instead of both popping the same head.
  return edhaOwnerListQueue(owner, key, async () => {
    const st = status || key;
    const list = foundry.utils.deepClone(edhaOwnerListAvail(owner, key, st));
    if (!list.length) { ui.notifications?.warn(`Edha: ${owner.name} has no ${edhaConditionLabel(st) || st} for ${source || key}.`); return false; }
    const spent = list.shift();   // oldest first
    await edhaSetOwnerList(owner, key, list);
    await edhaListUnmark(spent, st, { key, ownerId: owner.id });
    ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>💀 <strong>${source || key}</strong>: a ${edhaConditionLabel(st) || st} is consumed — <strong>${list.length}</strong> left.</p>` });
    return true;
  });
}

/* R-12 (ANSWERED 2026-09-06, Ben (a)) — A CREATURE THAT COMES BACK TO LIFE CANNOT ALSO BE A REMAIN.
 * Bench found an adversary that had itself been harvested, raised by spending a DIFFERENT Remain,
 * standing at 1 HP still wearing the `harvested` marker with its own ledger entry live — a living
 * creature that was also somebody's corpse-resource. The card says nothing either way; Ben ruled
 * the raise clears it.
 *
 * Deliberately swept across EVERY owner's ledger, not just the raiser's: a marker is a property of
 * the CREATURE (the `edhaListSharedHold` precedent), and the whole point of the reported case is
 * that the Remain being spent belonged to one entry while the raised body was another — possibly on
 * a different Reaper's list. Generic in `key`/`status`, so any ledger whose subject can be restored
 * rides it; nothing here names a talent.
 *
 * ORDER IS LOAD-BEARING: drop the entries FIRST, unmark SECOND. `edhaOwnerList` reconciles on read
 * against the creature's status ("the mark wins"), so unmarking first would make the entry
 * invisible to this sweep and leave a phantom in stored data holding its owner under their cap.
 * Each owner's read-modify-write goes through the shared queue (07-26n), and this is never called
 * from inside a queued task, so it cannot deadlock. Returns how many entries were dropped. */
async function edhaLedgerDropCreature(uuid, key, status = null) {
  const k = String(key || "").trim();
  if (!uuid || !k) return 0;
  const st = String(status || k).trim();
  let dropped = 0;
  try {
    for (const l of edhaOwnerLedgers(k, st)) {
      dropped += await edhaOwnerListQueue(l.owner, k, async () => {
        const list = edhaOwnerList(l.owner, k, st);          // re-read INSIDE the queue
        const kept = list.filter((e) => e?.uuid !== uuid);
        if (kept.length === list.length) return 0;
        await edhaSetOwnerList(l.owner, k, kept);
        return list.length - kept.length;
      });
    }
    if (dropped) await edhaListUnmark({ uuid }, st, { key: k });   // the status + markedBy, once
  } catch (e) { console.error("Edha Content | ledger drop-creature failed", e); }
  return dropped;
}

/* The near-victim auto-pick (07-25, 2bU — Spreading Omen's second placement): the NEAREST living
 * enemy within `ft` of the victim, skipping the victim itself and anyone already on the ledger.
 * Null when nobody qualifies — the caller says so on the card rather than erroring. */
function edhaNearestListCandidate(owner, victim, ft, list) {
  try {
    if (!victim) return null;
    const vtok = edhaCasterToken(victim); if (!vtok) return null;
    const odisp = edhaActorSide(owner);
    const cands = edhaTokensWithin(vtok, Number(ft) || 10).filter(t => t.actor && t.actor !== victim && t.actor !== owner
      && edhaSideHostile(t.document?.disposition, odisp)
      && (t.actor.system?.resources?.hea?.value ?? 1) > 0
      && !(list ?? []).some(e => e.uuid === t.actor.uuid));
    cands.sort((a, b) => Math.hypot(a.center.x - vtok.center.x, a.center.y - vtok.center.y) - Math.hypot(b.center.x - vtok.center.x, b.center.y - vtok.center.y));
    return cands[0]?.actor ?? null;
  } catch (e) { return null; }
}
/* Sibling talents may advertise on a ledger's PLACE card (2bV): any rule on the owner's talents
 * whose `list` matches and whose `placeNote` is set contributes a line — Sealed Edict's "you may
 * notarize it" hint and Lawkeeper's GM-reveal line ride Edict's card this way. Document-driven;
 * the old code hard-coded two edhaOwnsTalent(name) checks here. */
function edhaListPlaceNotes(owner, key) {
  const out = [];
  try {
    for (const item of (owner?.items ?? [])) {
      if (!edhaRuleBearer(item)) continue;   // talents + weapons — item 86, matching item 84/34a's loops
      for (const r of edhaEventRules(item)) {
        const h = r?.handler;
        if (!h?.placeNote || String(h.list || "").trim() !== key) continue;
        out.push(`<p style="opacity:.85">${h.placeNote}</p>`);
      }
    }
    /* NOTE: intentionally NOT migrated to edhaActorRulesOf — this reads `h.placeNote` across EVERY
     * handler type (no single type filters it), so the plural-by-type primitive does not fit. */
  } catch (e) {}
  return out.join("");
}
// Clear an evicted/spent entry's marker from its creature. `multiOwner` leaves the marker alone when
// another owner's ledger still holds the creature (shared icons — see edhaListSharedHold).
async function edhaListUnmark(entry, status, { key = null, ownerId = null, multiOwner = false } = {}) {
  try {
    if (!entry?.uuid || !status) return;
    if (multiOwner && key && edhaListSharedHold(edhaOwnerLedgers(key, status), entry.uuid, ownerId)) return;
    const a = await edhaResolveActorRef(entry.uuid); if (!a) return;
    await edhaToggleStatus(a, status, false);
    // Job 6a: routed through edhaSetEdhaFlag — behavior flip, was a SILENT drop with no GM online
    // (no warning), now warns + returns false like the majority convention. 🤖 bench row.
    await edhaSetEdhaFlag(a, `markedBy.${status}`, null);
  } catch (e) {}
}

/* --- GM cue cards (07-16): adversary ability text → a whispered reminder at its named hook -------
 * Generic handler `edha-gm-cue` (event edha-apply-watch; on-hit cues ride event edha-on-hit inside
 * edhaDispatchOnHit). Triggers: "damaged" (the owner took damage) · "hp-below" {atFraction} (the
 * owner crossed maxHp × fraction on this write — atFraction 0 = dropped to 0) · "ally-drops"
 * {rangeFt} (a same-side creature within range hit 0; 0/absent = whole scene) · "seeming-break"
 * (the owner's phantom copy broke — dispatched from the restore path) · "on-hit" (the owner's own
 * damaging item landed). The card carries the rule's `note` verbatim — author the cost into the
 * note ("Reaction, 1 Focus — ..."). oncePerRound defaults ON (reaction economy). Iron rule 3:
 * when the text names the hook, it gets a cue — a bare 'GM-run' label is no longer enough.
 * Consumers: Fade, Break ×2, Cover Their Retreat, Press the Line, the session-1 morale traits. */
function edhaCueRules(actor, trigger) {
  const out = [];
  for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-gm-cue")) {
    if ((h.trigger || "damaged") === trigger) out.push({ item: tal, h });
  }
  return out;
}
/* The once-per-round slot for a GM cue (07-27y, bench run 16). The key used to be
 * `cue:<item>:<trigger>` — item + trigger and NOTHING else — so two `hp-below` cues on ONE item
 * shared a single slot and the lower threshold could never fire: the Gone-to-Weir Fen-Heart's
 * near-zero "it goes still" cue (atFraction 0.05) was permanently eaten by its own bloodied cue
 * (0.5). Measured live: one 60 -> 0 write crossed both lines, posted one card, and left the flag
 * reading exactly {"cue:The Madness Slackens:hp-below": 1}. Blast radius 2 (Gone-to-Weir Fen-Heart,
 * Briar-Gone Grove) — the only two items in data/ carrying two cues of the same trigger.
 * The key now carries every dial that can distinguish two rules of this handler type. Residual
 * limit, stated: two cues identical in trigger AND all three dials, differing only in `note`, would
 * still share a slot — no such pair exists in the data today. Pure — pinned in tests/.
 * NOTE the decimal: this key reaches the `trigRound` flag VALUE as an object key, so it MUST go
 * through edhaFlagKey — which edhaTriggerAllowed / edhaMarkTriggerUsed do at the ledger boundary. */
function edhaCueKey(itemName, h) {   // pure — pinned in tests/
  const dial = (v) => (v === undefined || v === null || v === "") ? "" : String(v);
  return `cue:${itemName}:${h?.trigger || ""}:${dial(h?.atFraction)}:${dial(h?.rangeFt)}:${dial(h?.everyNRounds)}`;
}
async function edhaPostCueCard(owner, item, h, extra = "") {
  const key = edhaCueKey(item.name, h);
  if (h.oncePerRound !== false) {
    if (!edhaTriggerAllowed(owner, key, { oncePerRound: true })) return;
    await edhaMarkTriggerUsed(owner, key, { oncePerRound: true });
  }
  const gmIds = edhaGmIds();   // R-62: record card (no button) → all GMs, was active-only (🤖 bench row: audience flip)
  ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>⏰ <strong>${item.name}</strong> (${owner.name}): ${h.note || "trigger met."}${extra}</p></div>` });
}
// Pure crossing decision (pinned in tests/): did this write take HP from above maxHp×fraction to at/below it?
function edhaCueCrossed(prevHp, newHp, maxHp, atFraction) {
  const frac = Number(atFraction);
  const line = (Number(maxHp) || 0) * (Number.isFinite(frac) ? frac : 0.5);
  return prevHp > line && newHp <= line;
}
// Pure regen clamp (pinned in tests/): the heal actually applied by an `edha-regen` rule at the
// owner's turn end. Never while down (hp ≤ 0 — regen must not yo-yo a dropped creature back up),
// never past max, 0 for a nonsense amount. First consumer: the Garden Sow's Nexus-Fed (ruling 98).
function edhaRegenClamp(amount, hp, max) {
  const amt = Number(amount) || 0, cur = Number(hp) || 0, mx = Number(max) || 0;
  if (amt <= 0 || cur <= 0 || cur >= mx) return 0;
  return Math.min(amt, mx - cur);
}
/* An actor's SIDE, for when the canvas cannot answer (07-28d, bench run 18).
 * `getActiveTokens()` is a CANVAS lookup and it returns nothing in three ordinary situations: an
 * actor parked in the sidebar and never placed, one whose only token is on another scene, and —
 * the case run 18 measured — one whose token was deleted milliseconds earlier by a racing
 * `updateActor` hook (the phantom-double "the illusion dissipates" branch deletes token-first
 * while the applyDamage wrapper is still running its cue sweep). **None of those mean "this
 * creature has no side."** They all mean the lookup failed, which is why this must never be read
 * as "therefore no filter applies".
 * `prototypeToken.disposition` is `required: true` with a numeric initial on EVERY Actor
 * (foundry common/documents/token.mjs), so it is a real answer, not a guess: built adversaries
 * carry -1 from `advPrototypeToken`, and `edhaSummon` stamps a phantom copy's prototype from the
 * DUPLICATED token's disposition — so a copy resolves to the side of the thing it is a copy of,
 * which is the side it was created wearing. `null` only when there is no actor at all. */
function edhaActorSide(actor) {
  const live = edhaCasterToken(actor)?.document?.disposition;
  if (Number.isFinite(live)) return live;
  const proto = actor?.prototypeToken?.disposition;
  return Number.isFinite(proto) ? proto : null;
}
/* PURE, and the VALUE-level counterpart of edhaDisposHostile / edhaSameDisposition (which take
 * actors/tokens and re-resolve them). Most side comparisons in this file already hold both raw
 * dispositions, so routing them through the actor-level pair would re-derive a token the caller
 * has in hand — these two are the "equivalent inline Number.isFinite guard" R-63 sanctions,
 * named once instead of hand-rolled per site (item 10, batch 1, 2026-09-06).
 * The convention, identical to edhaAllyDropEligible / edhaDisposHostile / edhaSameDisposition:
 * an unresolvable side on EITHER end matches NEITHER predicate — it is not an ally and it is not
 * an enemy, so no side-filtered payload (buff OR damage) lands on it. `!edhaSideSame(a,b)` is
 * therefore NOT `edhaSideHostile(a,b)`; pick the one the filter actually means.
 * Pinned in tests/disposition-failclosed.test.js. */
function edhaSideSame(a, b)    { return Number.isFinite(a) && Number.isFinite(b) && a === b; }
function edhaSideHostile(a, b) { return Number.isFinite(a) && Number.isFinite(b) && a !== b; }
/* PURE (pinned in tests/ally-drop-side.test.js): may this `ally-drops` cue owner fire for this drop?
 * BOTH filters fail CLOSED on a value we could not determine — the same precedent the
 * `edha-hp-threshold` gate states in words ("unknown positions fail CLOSED, the watch-dispatch
 * precedent"). Until 07-28d both failed OPEN, and the two halves shared one cause — a victim with
 * no token on canvas:
 *   · the side test read `disp !== undefined && …`, so an unresolvable victim skipped the
 *     SAME-SIDE filter ENTIRELY and every ally-drops owner on the scene fired ACROSS the
 *     disposition line (measured at run 18 with a matched control: breaking a disposition-0
 *     phantom fired three disposition-−1 cues; the same drop with the token still present fired 0);
 *   · the range test read `ft > 0 && vTok && …`, so the same victim also skipped the RANGE filter
 *     and a 5-ft cue fired from anywhere on the map. 3 of the 5 shipped ally-drops rules carry a
 *     rangeFt (Roek 20, Crownox Ring 5, The Reckoning 5), so that half was live in real data too.
 * `rangeFt` 0/absent still means "whole scene" — that is an authored dial, not a failed lookup.
 *
 * R-52 (c)(i), 2026-09-06 — THE HALF-SQUARE SLACK. `edhaTokenGapFt` measures CENTRE-TO-CENTRE, and
 * this predicate applied no slack, so bench run 19 measured a 5-ft cue that could not reach the
 * ally standing beside its owner: The Reckoning (Medium) missed every DIAGONAL neighbour (7.07 ft)
 * and the Crownox Ring (Large 2×2) missed even an ORTHOGONAL one (7.5 ft), while an ally standing
 * INSIDE the ring's own footprint (0 ft) passed. Both cards promise the opposite ("an ADJACENT ox",
 * "a pack-mate dropped WITHIN 5 ft"). The engine already answered this question 60 lines below —
 * the `enemy-turn-start` sweep adds `+ 2.5` "half-square slack for adjacency reads" — and simply
 * disagreed with itself. It no longer does: EDHA_ADJACENCY_SLACK_FT is the one number, and both
 * reads apply it. Item 62 is the separate, larger question of measuring EDGE-TO-EDGE for sized
 * tokens, which is what a Huge owner's "adjacent" would still need; slack is not a substitute for
 * it, and this is deliberately not a general widening of every rangeFt gate in the engine. */
const EDHA_ADJACENCY_SLACK_FT = 2.5;
function edhaAllyDropEligible(victimSide, ownerSide, rangeFt, gapFt) {
  if (!Number.isFinite(victimSide) || !Number.isFinite(ownerSide)) return false;   // unknown side → no eligible ally
  if (ownerSide !== victimSide) return false;                                      // same side only
  const ft = Number(rangeFt) || 0;
  if (ft <= 0) return true;                                                        // 0 / absent = whole scene
  return Number.isFinite(gapFt) && gapFt <= ft + EDHA_ADJACENCY_SLACK_FT;          // unknown position → cannot be "within N ft"
}
async function edhaGmCueDamageSweep(victim, prevHp, newHp, maxHp) {
  try {
    for (const { item, h } of edhaCueRules(victim, "damaged")) await edhaPostCueCard(victim, item, h);
    for (const { item, h } of edhaCueRules(victim, "hp-below")) {
      if (edhaCueCrossed(prevHp, newHp, maxHp, h.atFraction)) await edhaPostCueCard(victim, item, h);
    }
    /* R-51 (2026-09-06, Ben (a)): an ILLUSORY COPY breaking is not "an ally dropped". A phantom
     * never had a life to lose, and its own side are precisely the people who know it was never
     * real — the fooled ENEMIES are the ones who would react, and they are on the other side of the
     * same-side filter, so there is nobody left for this cue to be true of. The phantom's break has
     * its own signal: the `seeming-break` cue kind, dispatched from the restore path.
     * (The `damaged` / `hp-below` cues above still fire — those are the phantom's OWN rules, and a
     * copy that carries one is a copy of a creature that carries one.) */
    if (prevHp > 0 && newHp <= 0 && !victim?.getFlag?.("edha-content", "phantomDouble")) {
      const vTok = edhaCasterToken(victim);
      const vSide = edhaActorSide(victim);
      for (const t of (canvas?.tokens?.placeables ?? [])) {
        if (!t.actor || t.actor === victim) continue;
        const oSide = t.document?.disposition;
        if (!edhaAllyDropEligible(vSide, oSide, 0, null)) continue;   // cheap side-only gate; unknown side fires nobody
        for (const { item, h } of edhaCueRules(t.actor, "ally-drops")) {
          const ft = Number(h.rangeFt) || 0;
          if (!edhaAllyDropEligible(vSide, oSide, ft, vTok ? edhaTokenGapFt(t, vTok) : null)) continue;
          await edhaPostCueCard(t.actor, item, h, ` <em>(${victim.name} dropped${ft ? `, within ${ft} ft` : ""}.)</em>`);
        }
      }
    }
  } catch (e) { console.error("Edha Content | GM cue sweep failed", e); }
}
// Center-to-center distance in scene feet between two placeables.
function edhaTokenGapFt(a, b) {
  const gs = canvas?.scene?.grid?.size || 100, gd = canvas?.scene?.grid?.distance || 5;
  return Math.hypot((a.center?.x ?? 0) - (b.center?.x ?? 0), (a.center?.y ?? 0) - (b.center?.y ?? 0)) / gs * gd;
}
// Turn-based GM cues (07-16b playtest pass): "enemy-turn-start {rangeFt}" cues a reaction holder
// once when a hostile starts its turn in range (Reactive Strike — a per-ACTION cue would spam);
// "turn-end {everyNRounds}" cues at the END of the owner's own turn on matching rounds (Glyph
// Pulse's every-2-rounds aura). One GM client runs the sweep.
Hooks.on("combatTurnChange", (combat, prior, current) => {
  try { if (edhaDefBuffGmGate()) void edhaTurnCueSweep(combat, prior, current); } catch (e) { /* non-fatal */ }
});
async function edhaTurnCueSweep(combat, prior, current) {
  try {
    const tokOf = ref => combat?.combatants?.get?.(ref?.combatantId)?.token?.object ?? null;
    const curTok = tokOf(current) ?? combat?.combatant?.token?.object ?? null;
    // ⛑ Same cross-combat family as the deleteCombat sweeps: this cue scans EVERY token on the
    // scene, so a second combat's turn ticking posted reaction cues to — and stamped `trigRound`
    // onto — actors fighting in a DIFFERENT combat (bench runs 19/20 landed keys on Ben's Corvaine
    // and Stonebound). A creature busy in its own encounter does not react to this one's turns.
    const guard = edhaCombatEndGuard(combat);
    if (curTok?.actor) {
      const disp = curTok.document?.disposition;
      for (const t of (canvas?.tokens?.placeables ?? [])) {
        if (!t.actor || t === curTok || !edhaSideHostile(t.document?.disposition, disp)) continue;   // hostiles to the mover only — unknown side fails CLOSED (R-63); this cue STAMPS trigRound, so a spurious match writes to a campaign actor
        if (edhaStillFightingElsewhere(t.actor, guard)) continue;                            // fighting in another combat
        for (const { item, h } of edhaCueRules(t.actor, "enemy-turn-start")) {
          const ft = Number(h.rangeFt) || 0;
          if (ft > 0 && edhaTokenGapFt(t, curTok) > ft + EDHA_ADJACENCY_SLACK_FT) continue;   // half-square slack for adjacency reads (R-52: the SAME number edhaAllyDropEligible uses — they disagreed until 2026-09-06)
          await edhaPostCueCard(t.actor, item, h, ` <em>(${curTok.name}'s turn starts in range.)</em>`);
        }
      }
    }
    const prevTok = tokOf(prior);
    if (prevTok?.actor) {
      for (const { item, h } of edhaCueRules(prevTok.actor, "turn-end")) {
        const n = Math.max(1, Number(h.everyNRounds) || 1);
        const round = Number(combat?.round) || 0;
        if (round % n !== 0) continue;
        await edhaPostCueCard(prevTok.actor, item, h, ` <em>(end of ${prevTok.name}'s turn, round ${round}.)</em>`);
      }
      // `edha-regen` rules: engine-applied turn-end regen (clamped by edhaRegenClamp; a whispered
      // card keeps the heal visible at the table). Config-only handler; this sweep is its engine.
      for (const { item: tal, handler: h } of edhaActorRulesOf(prevTok.actor, "edha-regen")) {
          const res = prevTok.actor.system?.resources?.hea;
          const heal = edhaRegenClamp(h.amount, res?.value, edhaResVal(res));
          if (!heal) continue;
          await edhaResourceWrite(prevTok.actor, "hea", { value: (Number(res?.value) || 0) + heal }, edhaBookkeepingTag(`${tal.name} (edha-regen)`));
          await edhaPostCueCard(prevTok.actor, tal, { note: h.note || `regains ${heal} HP.`, trigger: "turn-end" }, ` <em>(+${heal} HP applied, end of turn.)</em>`);
      }
    }
  } catch (e) { console.error("Edha Content | turn cue sweep failed", e); }
}
/* --- Ambush belief (07-19 adversary-wiring pass): the lightweight seeming ledger ---------------
 * Generic handler `edha-ambush-belief` (event edha-apply-watch, carried on the seeming TRAIT of an
 * ambush predator — Wrongwake's Thrown Voice, Stillback's Causeway/Frayed Seeming). The full
 * Phantom Double belief loop is wrong for these: there is no copy token and the client veil is
 * visual, while a sound/camouflage seeming only needs a per-target belief ledger. On the owner's
 * FIRST attack against each target per scene, the target tests Perception vs the owner's chosen
 * defense (engine-rolled — iron rule 3); the result is written to the owner's `ambushBelief` flag
 * (token-actor safe: unlinked tokens each keep their own ledger) and `whenTargetFooled` damage
 * riders read it exactly like the phantom ledger. Scene change resets the ledger. */
/* Make a string SAFE to use as an object key INSIDE a flag VALUE (the dotted-key family, bench
 * run 16 / 07-27y). A flag value is persisted through Foundry's document update, and
 * `ObjectField._updateDiff` (foundry v13 common/data/fields.mjs) merges it with
 * `mergeObject(source[key], value, {insertKeys, insertValues, performDeletions})`. mergeObject
 * expands dotted keys at merge depth 0 — and `_mergeInsert` restarts a FRESH `mergeObject({}, v)`
 * (depth 0 again) for every nested object it inserts, so a dotted key at ANY depth inside a
 * newly-inserted value is expanded into nested objects. Verified against the installed v13 source:
 *   tested: {"Scene.<id>.Token.<id>": {...}}  ->  tested: {Scene: {<id>: {Token: {<id>: {...}}}}}
 * and a flat `tested[uuid]` lookup then returns undefined FOREVER. Worse, the behaviour is
 * asymmetric: on a LATER write the parent key already exists, `_mergeUpdate` preserves the depth,
 * and the same dotted key is inserted literally — so the ledger ends up half-expanded, half-flat.
 * This is NOT setFlag expanding the flag KEY (`setFlag(scope, "ambushBelief", v)` has no dots in
 * its key, and a dotted flag key like `markedBy.<status>` is deliberate nesting that works fine) —
 * it is the VALUE's own nested keys. Anything derived from a UUID, a decimal, or a user-supplied
 * name must go through here first.
 * Caveat, stated: two keys differing only by `.` vs `_` would collide. Foundry ids are alphanumeric,
 * so no UUID can; only a hand-authored name could, and the cost would be a shared once-per-round
 * slot, not data loss. */
function edhaFlagKey(s) { return String(s ?? "").replace(/\./g, "_"); }   // pure — pinned in tests/
function edhaAmbushLedgerFor(belief, sceneId) {   // pure — pinned in tests/
  if (!belief || belief.sceneId !== sceneId) return { sceneId, tested: {} };
  return { sceneId, tested: { ...(belief.tested || {}) } };
}
// The ledger owns its key shape: callers pass RAW token uuids at both ends and never see the
// escaping (07-27y — the key was composed at the call site and the reader looked it up flat).
function edhaAmbushMark(belief, tokenUuid, entry) {   // pure — pinned in tests/
  const tested = { ...(belief?.tested || {}) };
  tested[edhaFlagKey(tokenUuid)] = entry;
  return { sceneId: belief?.sceneId ?? null, tested };
}
function edhaAmbushTested(belief, tokenUuid) {   // pure — pinned in tests/
  return !!(belief?.tested || {})[edhaFlagKey(tokenUuid)];
}
function edhaAmbushFooledIn(belief, sceneId, tokenUuids) {   // pure — pinned in tests/
  if (!belief || belief.sceneId !== sceneId) return false;
  const tested = belief.tested || {};
  return (tokenUuids || []).some(u => tested[edhaFlagKey(u)]?.fooled === true);
}
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item)) return;
    if (item.system?.activation?.type !== "skill_test") return;   // attacks only — the seeming tests on the strike
    const amb = edhaActorRuleOf(actor, "edha-ambush-belief"); if (!amb) return;
    const tTok = edhaUserTargetToken();
    if (!tTok?.actor) {
      ChatMessage.create({ whisper: edhaWhisperIds(actor), speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div class="edha-trigger-card"><p>🌫️ <strong>${amb.item.name}</strong>: target the victim before rolling the attack so the belief test auto-rolls (first attack on each target this scene).</p></div>` });
      return;
    }
    edhaAmbushBeliefTest(actor, amb, tTok);   // SYNC decision (R-50); the ledger write + cards are scheduled inside — never awaited here
  } catch (e) { console.error("Edha Content | ambush belief use-hook failed", e); }
});
/* R-50 (item 53, 2026-09-06): the ambushing strike benefits from its OWN belief test.
 *
 * Until now the test was kicked off from the use hook as a fire-and-forget `await Roll.evaluate()`,
 * while the `whenTargetFooled` damage rider is chosen when the damage formula is ASSEMBLED — which
 * the system does before that promise resolves — so the ledger write always landed after the
 * number was fixed and the +1d6 first appeared on the SECOND strike (bench run 18). Ben ruled (b):
 * the ten cards say the FIRST strike comes from the ambush, so the first strike must roll and use
 * its own test. Awaiting inside the use hook is the takeover class of bug, so instead the DECISION
 * is synchronous (the engine's own `edhaRollDiceSync`-family evaluator) and only the persistence +
 * cards stay async:
 *   edhaAmbushBeliefRoll   — the ONE pure place the roll / DC / advantage maths lives (pinned).
 *   edhaAmbushBeliefTest   — SYNC: ledger hit → the stored entry; in-flight → the pending entry;
 *                            else roll now, park the entry as pending, schedule the commit. Returns
 *                            the entry, so a caller can act on it in the same tick.
 *   edhaAmbushBeliefCommit — ASYNC: the ledger write + GM / player cards, exactly as before.
 * The use hook and the rider path (edhaTargetFooledOrTest) both call the SYNC test, and the pending
 * map is what makes them agree: whichever runs first rolls, the other reads the same result. */
// Pure — pinned in tests/. `rollFace` is injected so the node harness can pin it without Foundry.
function edhaAmbushBeliefRoll({ dc, mod, advantage } = {}, rollFace = edhaRandomFace) {
  const d1 = rollFace(20);
  const die = advantage ? Math.max(d1, rollFace(20)) : d1;
  const total = die + (Number(mod) || 0);
  const vs = Number(dc) || 10;
  return { total, dc: vs, fooled: total < vs, formula: `${advantage ? "2d20kh" : "1d20"} + ${Number(mod) || 0}` };
}
// The DC / modifier / advantage READ for one owner + rule + target token — kept beside the roll so
// there is one place to look, but separate so the pure roll stays document-free.
function edhaAmbushBeliefParams(actor, amb, tTok) {
  const dcKey = amb.handler.dcFrom || "cog";
  const dc = Number(actor.system?.defenses?.[dcKey]?.value ?? actor.system?.defenses?.[dcKey]?.override) || 10;
  const sk = tTok.actor?.system?.skills?.prc;
  const mod = edhaDerivedNum(sk?.mod, Number(sk?.rank) || 0);   // `.mod` is a DerivedValueField OBJECT — 07-27y
  return { dc, mod, advantage: !!amb.handler.perceptionAdvantage };
}
function edhaAmbushEntry(belief, tokenUuid) {   // pure — the stored entry, or null
  return (belief?.tested || {})[edhaFlagKey(tokenUuid)] ?? null;
}
const EDHA_AMBUSH_PENDING = new Map();   // `${owner uuid}|${target token uuid}` → entry, while its ledger write is in flight
function edhaAmbushBeliefTest(actor, amb, tTok) {
  try {
    const tokUuid = tTok?.document?.uuid; if (!tokUuid) return null;
    const sceneId = canvas?.scene?.id ?? null;
    const stored = actor.getFlag?.("edha-content", "ambushBelief");
    const belief = edhaAmbushLedgerFor(stored, sceneId);
    const prior = edhaAmbushEntry(belief, tokUuid);
    if (prior) return { ...prior, fresh: false };   // once per scene per target — the ledger decides
    const pKey = `${actor.uuid ?? actor.id}|${tokUuid}`;
    const pending = EDHA_AMBUSH_PENDING.get(pKey);
    if (pending) return { ...pending, fresh: false };   // rolled a tick ago by the other path; write still landing
    const r = edhaAmbushBeliefRoll(edhaAmbushBeliefParams(actor, amb, tTok));
    const entry = { fooled: r.fooled, total: r.total, name: tTok.name };
    EDHA_AMBUSH_PENDING.set(pKey, entry);
    /* edhaAmbushLedgerFor returns `tested: {}` on a scene change, but `setFlag` MERGES, so the
     * stored map was never actually cleared — every scene's entries accumulated forever (bench run
     * 17). Inert (token uuids are scene-scoped, and edhaAmbushFooledIn gates on sceneId anyway) but
     * unbounded, so the commit deletes the whole flag before rewriting it. Only on a real scene change. */
    const staleScene = !!stored && stored.sceneId !== sceneId;
    void edhaAmbushBeliefCommit(actor, amb, tTok, { entry, dc: r.dc, belief, tokUuid, staleScene, pKey });
    return { ...entry, fresh: true };
  } catch (e) { console.error("Edha Content | ambush belief test failed", e); return null; }
}
async function edhaAmbushBeliefCommit(actor, amb, tTok, { entry, dc, belief, tokUuid, staleScene, pKey }) {
  try {
    const { fooled, total } = entry;
    const led = edhaAmbushMark(belief, tokUuid, entry);
    if (staleScene) { try { await actor.unsetFlag("edha-content", "ambushBelief"); } catch (e) {} }
    await actor.setFlag("edha-content", "ambushBelief", led);
    const gmIds = edhaGmIds();   // R-62: record card (roll result, no button) → all GMs, was active-only (🤖 bench row: audience flip)
    ChatMessage.create({ whisper: gmIds, speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card"><p>🌫️ <strong>${amb.item.name}</strong> — ${tTok.name}: Perception <strong>${total}</strong> vs ${dc} → ${fooled ? "<strong>taken in</strong> (whenTargetFooled riders apply)" : "<strong>sees through it</strong>"}.${amb.handler.note ? ` ${amb.handler.note}` : ""}</p></div>` });
    if (tTok.actor.hasPlayerOwner) {   // the player learns only their own character's truth
      const ids = (game.users?.filter(u => u.active && !u.isGM && tTok.actor.testUserPermission?.(u, "OWNER")) ?? []).map(u => u.id);
      if (ids.length) ChatMessage.create({ whisper: ids, content: fooled
        ? `<p>🌫️ <strong>${tTok.name}</strong> (Perception ${total}): the attack comes from somewhere you weren't looking.</p>`
        : `<p>👁️ <strong>${tTok.name}</strong> (Perception ${total}): you read the ambush right — you know exactly where it is.</p>` });
    }
  } catch (e) { console.error("Edha Content | ambush belief commit failed", e); }
  finally { EDHA_AMBUSH_PENDING.delete(pKey); }
}
// The rider-side entry point (R-50): is the target taken in — and if this owner carries an ambush
// seeming and the target is simply UNTESTED this scene, test them NOW, so the strike that fools
// them is the strike that benefits. Phantom-copy seemings (the Mistheron's placed copy) test at
// placement and carry no `edha-ambush-belief` rule, so they fall straight through to the ledgers.
function edhaTargetFooledOrTest(caster, target) {
  try {
    if (edhaTargetFooled(caster, target)) return true;
    const amb = edhaActorRuleOf(caster, "edha-ambush-belief"); if (!amb) return false;
    const tTok = edhaUserTargetToken(); if (!tTok?.actor || tTok.actor !== target) return false;
    return edhaAmbushBeliefTest(caster, amb, tTok)?.fooled === true;
  } catch (e) { return false; }
}
// Thorns (07-16b, Cinder Coat): the victim's edha-thorns rules splash damage straight back at a
// melee/adjacent attacker — auto-applied (no decision to cue), chain-guarded (a thorns hit never
// triggers thorns in return).
async function edhaThornsCheck(victim, dealer, options) {
  try {
    if (options?.edhaThorns) return;
    const attacker = dealer?.actor; if (!attacker || attacker === victim) return;
    for (const { item: tal, handler: h } of edhaActorRulesOf(victim, "edha-thorns")) {
        if (!h.formula) continue;
        if (h.meleeOnly !== false) {
          const vTok = edhaCasterToken(victim), aTok = edhaCasterToken(attacker);
          if (!vTok || !aTok || edhaTokenGapFt(aTok, vTok) > 7.5) continue;   // adjacent-ish (medium diagonals)
        }
        const roll = await (new Roll(String(h.formula), victim.getRollData?.() ?? {})).evaluate();
        try { await attacker.applyDamage([{ amount: roll.total, type: h.damageType || "energy" }], { chatMessage: false, edhaThorns: true }); } catch (e) { continue; }
        ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: victim }), content: `<p>🔥 <strong>${tal.name}</strong>: ${attacker.name} takes <strong>${roll.total}</strong> ${h.damageType || "energy"} splash for striking ${victim.name} in melee.</p>` });
    }
  } catch (e) { console.error("Edha Content | thorns check failed", e); }
}
// Suture Cradle (07-16b, Stitchmother — the one stateful playtest mechanic needing its own watcher):
// use with a target → the cradle marks it (flag on the CRADLER, token-actor safe); while marked,
// each damage the target takes forces the cradler's Discipline vs DC 10 + damage (contest core —
// never "trust the GM rolled"): keep or the cradle ends. Cleared on combat end.
Hooks.on("cosmere-rpg.useItem", (item) => {
  try {
    const actor = item?.actor; if (!actor || !edhaIsTalent(item) || item.name !== "Suture Cradle") return;
    const t = edhaUserTargetToken();
    if (!t?.actor) { ui.notifications?.warn("Edha: target the creature being cradled, then use Suture Cradle again."); return; }
    void edhaSetEdhaFlag(actor, "sutureCradle", { targetUuid: t.actor.uuid, targetName: t.name });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🪡 <strong>Suture Cradle</strong>: ${t.name} is cradled — when it takes damage, ${actor.name} must keep it (Discipline vs DC 10 + damage, auto-rolled). Sustained: 1 Investiture at the start of each of her turns (GM).</p>` });
  } catch (e) { console.error("Edha Content | Suture Cradle use failed", e); }
});
async function edhaSutureCradleCheck(victim, dealtAmount) {
  try {
    if (!victim || !(dealtAmount > 0)) return;
    // Canvas tokens (unlinked adversaries live as token actors, NOT in game.actors) + the directory
    // actors no token here already is. This used `holders.includes(tok.actor)` — OBJECT identity —
    // which cannot dedupe an unlinked token's synthetic actor against its directory twin (different
    // object, same id, inherits the flag), so the cradle rolled Discipline TWICE and either result
    // could end it (bench run 20). `edhaSceneActors` carries the whole rule; see its comment.
    for (const owner of edhaSceneActors()) {
      if (owner.getFlag?.("edha-content", "sutureCradle")?.targetUuid !== victim.uuid) continue;
      const dc = 10 + Math.floor(dealtAmount);
      const total = await edhaRollOpposedSkill(owner, "dis");
      const keep = total >= dc;
      if (!keep) { try { await owner.unsetFlag("edha-content", "sutureCradle"); } catch (e) {} }
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: keep
        ? `<p>🪡 <strong>Suture Cradle</strong>: ${victim.name} was hit — Discipline <strong>${total}</strong> ≥ DC ${dc}: the cradle <strong>holds</strong>.</p>`
        : `<p>🪡 <strong>Suture Cradle</strong>: ${victim.name} was hit — Discipline <strong>${total}</strong> &lt; DC ${dc}: the cradle <strong>ends</strong>.</p>` });
    }
  } catch (e) { console.error("Edha Content | suture cradle check failed", e); }
}
Hooks.on("deleteCombat", (combat) => {
  try {
    // Same union as the check above (this one was never a defect — a repeated unsetFlag is
    // idempotent — but keeping the pair on one primitive is the point of having one).
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const a of edhaSceneActors()) {
      if (edhaStillFightingElsewhere(a, guard)) continue;
      if (a.getFlag?.("edha-content", "sutureCradle")) void a.unsetFlag("edha-content", "sutureCradle");
    }
  } catch (e) { /* non-fatal */ }
});

/* --- Afflictions: ongoing stored damage dealt at the start of the carrier's turn ----------------- */
function edhaGetAfflictions(actor) {
  try { const a = actor?.getFlag?.("edha-content", "afflictions"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
// Store a rolled affliction amount on a creature (so the turn engine can auto-deal it). GM-side write.
async function edhaAddAffliction(actor, amount, type, source) {
  amount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!actor || amount <= 0) return;
  const list = edhaGetAfflictions(actor);
  list.push({ amount, type: type || "vital", source: source || "" });
  try { await actor.setFlag("edha-content", "afflictions", list); }
  catch (e) { console.warn("Edha Content | could not store affliction (perms?) — auto-tick disabled for this one.", e); }
}
// Deal every stored affliction to a creature (its turn start). Caller sets the re-entrancy guard.
async function edhaTickAfflictions(actor) {
  const list = edhaGetAfflictions(actor);
  if (!actor || !list.length) return;
  if (!actor.statuses?.has?.("afflicted")) { try { await actor.unsetFlag("edha-content", "afflictions"); } catch (e) {} return; }
  for (const af of list) {
    const amt = Math.max(0, Math.floor(Number(af.amount) || 0));
    if (amt > 0) { try { await actor.applyDamage([{ amount: amt, type: af.type || "vital" }], { chatMessage: false }); } catch (e) {} }
  }
  const total = list.reduce((s, a) => s + (Math.max(0, Math.floor(Number(a.amount) || 0))), 0);
  if (total > 0) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>☠️ <strong>Afflicted</strong> — ${actor.name} takes <strong>${total}</strong> ongoing vital damage (start of turn).</p>` });
}
async function edhaAfflictionTurnTick(combat) {
  combat = combat || game.combat; if (!combat?.started) return;
  const actor = combat.combatant?.actor; if (!actor) return;
  _edhaInTrigger = true;   // affliction damage must not re-trigger on-hit / on-defeat dispatch
  try { await edhaTickAfflictions(actor); } finally { _edhaInTrigger = false; }
}
Hooks.on("combatStart",      (combat) => { if (edhaDefBuffGmGate()) void edhaAfflictionTurnTick(combat); });
Hooks.on("combatTurnChange", (combat) => { if (edhaDefBuffGmGate()) void edhaAfflictionTurnTick(combat); });
// When the Afflicted condition is removed (icon toggled off), drop its stored damage.
Hooks.on("deleteActiveEffect", (effect) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (!effect?.statuses?.has?.("afflicted")) return;
    const a = effect.parent; if (a?.documentName !== "Actor") return;
    if (!a.statuses?.has?.("afflicted")) void a.unsetFlag("edha-content", "afflictions");
  } catch (e) { console.error("Edha Content | affliction cleanup failed", e); }
});

/* --- Necrotic Grasp: healing halved on a Black-talent hit (expires end of OWNER's next turn) ------
 * Fraction 0 = FULL heal block ("cannot regain HP" — Death/Withering Touch); Temp HP grants bypass
 * this path and still land (Ben R3, 07-02). */
function edhaHealCutInfo(actor) {
  // Strictest (lowest-fraction) mark wins, and its byName travels with it so the announce card
  // can say WHO blocked the heal instead of hard-coding a talent (pure — pinned in tests/).
  let best = null;
  for (const e of (actor?.effects ?? [])) {
    const hc = e.getFlag?.("edha-content", "healCut");
    if (hc && Number(hc.fraction) >= 0 && Number(hc.fraction) < 1 && (best == null || Number(hc.fraction) < best.fraction))
      best = { fraction: Number(hc.fraction), byName: hc.byName || "" };
  }
  return best;
}
function edhaHealCutFactor(actor) { return edhaHealCutInfo(actor)?.fraction ?? null; }
/* THE shared heal gate (2026-07-26l, bench run 3 defect 5). The No-Healing / Healing-Halved mark
 * was enforced ONLY on applyDamage's heal instances — but the rule-driven heal paths (the
 * edha-hp-threshold trigger card, edhaCrossHeal and everything riding it: edha-focus 'hea',
 * regrowth, Shared Burden, the pulse heals) write system.resources.hea directly and never pass
 * through applyDamage, so a Mender click healed a Withering-blocked target 10 HP. Every such path
 * now calls this before writing: it scales the amount by the strictest mark and announces once.
 * ⚠️ DELIBERATELY NOT ROUTED THROUGH IT — THE DROP-TO-1 FAMILY. **R-10 ANSWERED 2026-09-06 (Ben
 * (b)): stabilizing at 1 is a FLOOR AGAINST DEATH, not regaining, so every drop-to-1 / stabilize
 * writer bypasses the no-heal condition.** It is a ruling, not an oversight, and it is the whole
 * family or none — a member that quietly acquired the gate would let "cannot regain HP" become
 * "cannot be saved", which is a different card. Audited 2026-09-06 (item 47); all four bypass, and
 * `tests/drop-to-one-family.test.js` fails if any one of them starts gating:
 *   1. `edhaCrossHeal(victim, 1 - cur, { bypassHealCut: true })` — Unbreakable Line's `revive`
 *      button. `bypassHealCut` exists FOR THIS and for nothing else.
 *   2. `edhaDeathWardCheck` — Death Ward's applyDamage post-pass writes `hea.value = 1` directly
 *      (and relays the same 1 as a `burst-apply` heal hit when the client lacks ownership).
 *   3. `edhaReviveUse` → `edhaApplyBurstResults` — Raise Dead's `{ amount: 1, heal: true }` hit.
 *   4. The `edha-hp-floor` `preUpdateActor` veto — it rewrites the incoming HP change to the
 *      talent's floor before it lands, so it never was a heal at all. It is in the family because
 *      it is the same PROMISE ("instead of dropping, you hold at N"), and a future refactor
 *      routing it through a heal helper would gate it by accident.
 * A PLAIN heal on a withered creature is still blocked — that is the other half of the ruling and
 * the same test file pins it. */
function edhaHealCutGate(target, amount) {
  const info = edhaHealCutInfo(target);
  if (!info || !(Number(amount) > 0)) return Math.max(0, Math.floor(Number(amount) || 0));
  const cutAmt = Math.max(0, Math.floor(Number(amount) * info.fraction));
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>🩸 <strong>${target.name}</strong> ${info.fraction === 0 ? "cannot regain HP" : "has their healing halved"}${info.byName ? ` (${info.byName})` : ""}.</p>` });
  return cutAmt;
}
/* THE HEAL ANNOUNCEMENT (item 68, fix pass 8 — bench run 39). The gate above scales what LANDS,
 * but every rule-driven heal card was written from the number the rule ROLLED, so the two
 * disagreed on exactly the creatures the mark exists for: Field Medicine through a Withering Touch
 * mark left HP at 4 → 4, printed "cannot regain HP", and then printed "⚕️ Field Medicine: B39
 * Victim heals 5". The HP was right and the card lied, which is the §10 drift direction that costs
 * a table the most — the card is the only thing the players read.
 *
 * So the contract is now: **a heal card is built from what edhaCrossHeal RETURNED, never from the
 * roll.** Pass what you asked for and what you got; `phrase(delivered)` writes the normal clause
 * and is only ever called with a number that actually landed, so a HALVED mark simply reaches it
 * with the halved number. When the mark zeroed it the amount is NEVER printed — the clause names
 * the mark instead, in the gate's own words. Returns "" when there is nothing to say (a genuine
 * 0-amount heal with no mark: the 07-05 "blank card" convention).
 *
 * Clauses come back UNPUNCTUATED so a caller can compose them ("…in X's place; Y heals 3.") — add
 * your own terminator. This reads the mark, it does not apply it: no new edhaHealCutGate call site
 * (tests/drop-to-one-family.test.js counts them, and R-10 turns on that count). */
function edhaHealLine(who, requested, delivered, phrase) {
  const got = Math.max(0, Math.floor(Number(delivered) || 0));
  if (got > 0) return phrase(got);
  if (!(Number(requested) > 0)) return "";
  const info = edhaHealCutInfo(who);
  if (!info) return "";
  return `${who?.name ?? "the target"} ${info.fraction === 0 ? "cannot regain HP" : "has their healing halved"}${info.byName ? ` (${info.byName})` : ""} — no healing lands`;
}
async function edhaApplyHealCut(target, owner, fraction, byName) {
  try {
    const ex = target.effects?.filter(e => e.getFlag?.("edha-content", "healCut")) ?? [];   // refresh duration
    if (ex.length) { try { await target.deleteEmbeddedDocuments("ActiveEffect", ex.map(e => e.id)); } catch (e) {} }
    const combat = edhaInActiveCombat(owner);   // R-4/#28a: the OWNER's combat decides "its next turn"
    const ti = (combat?.started && owner) ? edhaCombatantTurnIndex(combat, owner) : -1;
    const coord = ti >= 0 ? edhaNextTurnCoord(combat, ti) : null;   // end of the OWNER's next turn
    const full = Number(fraction) === 0;
    await target.createEmbeddedDocuments("ActiveEffect", [{
      name: `${byName} — ${full ? "No Healing" : "Healing Halved"}`,
      img: "icons/magic/death/hand-withered-gray.webp",
      changes: [],
      description: `<p>${full ? "Cannot regain HP" : "Healing received is halved"} (${byName}) until the end of ${owner?.name ?? "the caster"}'s next turn.</p>`,
      flags: { "edha-content": { healCut: { fraction, byName }, ...(coord ? { expireAfter: coord } : {}) } },
    }]);
  } catch (e) { console.error("Edha Content | heal-cut apply failed", e); }
}

/* --- RESERVE: flag-based pseudo-resource. A Reserve USER is an actor carrying an
 * `edha-reserve-bank` rule (Sanguine Reservoir's document since 2bZ — iron rule 2b); the cap rides
 * that rule's `capFormula` (ranks in Black on the authored rule). The colorRank fallback covers a
 * pre-repoint actor whose talent has not re-synced yet — banked Reserve stays spendable. --------- */
function edhaReserveCap(actor) {
  const h = edhaActorRuleOf(actor, "edha-reserve-bank")?.handler;
  if (h?.capFormula) return Math.max(0, Math.floor(edhaEvalSync(String(h.capFormula), actor?.getRollData?.() ?? {})));
  return edhaColorRank(actor, "black");
}
function edhaGetReserve(actor) { return Math.max(0, Math.floor(Number(actor?.flags?.["edha-content"]?.reserve) || 0)); }
async function edhaSetReserve(actor, v) {
  v = Math.max(0, Math.min(edhaReserveCap(actor), Math.floor(Number(v) || 0)));
  try { if (v <= 0) await actor.unsetFlag("edha-content", "reserve"); else await actor.setFlag("edha-content", "reserve", v); }
  catch (e) { console.error("Edha Content | Reserve write failed", e); }
  return v;
}

/* --- RESERVE SPEND (2026-07-05, Ben-approved design) ----------------------------------------------
 * Two spend paths for the Reserve banked above:
 *  1. AS INVESTITURE (Sanguine Reservoir's own text): a "Pay from Reserve" checkbox injected into the
 *     system's Spend-Investiture dialog (ItemConsumeDialog). Checking it UNCHECKS the system's
 *     Investiture row(s) — so the system consumes nothing and there is no refund race — and deducts
 *     Reserve instead. Offered only when Reserve covers the full static cost.
 *  2. AS RITUAL HP (Double Dip): Double Dip's own use runs a Black-vs-Cognitive contest; success marks
 *     the target (the house mark shape flags.edha-content.markedBy.doubledipped, scene-scoped, since
 *     07-24p). edhaRitualHpCost then offers "pay from Reserve instead of HP?" when its talent targets
 *     a creature THIS owner marked. Paying from Reserve is NOT losing health: no Blood Price
 *     advantage, nothing re-banked (stated on the card).
 */
Hooks.on("renderDialogV2", (app, element) => {
  try {
    if (!String(app?.id ?? "").endsWith(".consume")) return;
    const item = app.item; const actor = item?.actor;
    const bank = actor ? edhaActorRuleOf(actor, "edha-reserve-bank") : null;   // rule-keyed (2bZ) — was edhaOwnsTalent on the talent name
    if (!bank) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root || root.querySelector(".edha-reserve-spend")) return;
    const invRows = [...root.querySelectorAll("#consumables .form-group")].filter(el => {
      const [type, res, min, max] = String(el.id).split("-");
      return type === "resource" && res === "inv" && min === max;   // static Investiture costs only
    });
    if (!invRows.length) return;
    const need = invRows.reduce((s, el) => s + (parseInt(String(el.id).split("-")[2]) || 0), 0);
    const reserve = edhaGetReserve(actor);
    if (need <= 0 || reserve < need) return;
    const consumables = root.querySelector("#consumables");
    const label = document.createElement("label");
    label.className = "edha-reserve-spend";
    label.style.cssText = "display:flex;align-items:center;gap:6px;margin:4px 0;padding:3px 6px;border:1px solid #7a2f2f88;border-radius:4px;background:#40101055;";
    // One <span> around the text: with display:flex on the label, bare inline nodes each become their
    // own flex item and the sentence shatters (Ben 07-12 screenshot). Flex = [checkbox][span].
    label.innerHTML = `<input type="checkbox" style="flex:0 0 auto"> <span>🩸 Pay from <strong>Reserve</strong> instead (${reserve}/${edhaReserveCap(actor)} banked — Investiture stays untouched)</span>`;
    consumables?.after(label);
    const box = label.querySelector("input");
    // Capture-phase on Continue: runs BEFORE the dialog's own action handler collates the checkboxes.
    const btn = root.querySelector('button[data-action="continue"]');
    btn?.addEventListener("click", () => {
      try {
        if (!box?.checked) return;
        for (const el of invRows) { const c = el.querySelector("input[type=checkbox]"); if (c) c.checked = false; }
        void edhaSetReserve(actor, edhaGetReserve(actor) - need).then(() => {
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>${bank.item.name}</strong>: ${actor.name} pays <strong>${need}</strong> ${item.name} cost from Reserve (${edhaGetReserve(actor)}/${edhaReserveCap(actor)} left) — no Investiture spent.</p>` });
        });
      } catch (e) { console.error("Edha Content | Reserve spend failed", e); }
    }, true);
  } catch (e) { console.error("Edha Content | Reserve consume-dialog injection failed", e); }
});

// Double Dip moved onto its document 07-24p (iron rule 2b) — `edha-def-test` black vs cog plus an
// `edha-apply-status` rule on edha-test-success, which is the tree-wide MARK primitive the Omen /
// Hexmark / Insight families already use. The mark therefore moved from a bespoke per-owner flag
// (`doubleDipBy.<ownerId>`) to the house shape `markedBy.doubledipped = { actorId, talent }`, read
// below through the existing edhaMarkOwner helper.
// ⚠ ONE NARROWING, deliberate: markedBy holds the most recent marker, so two Black casters marking
// the SAME creature no longer both benefit — the second overwrites the first. That is the shape every
// other mark in the engine already has; flagged on the checklist rather than fixed with a fourth
// bespoke flag layout.
// Scene end: clear the Double-Dip marks (GM-side, same lifecycle as Charges/Reserve-style scene state).
Hooks.on("deleteCombat", async (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    for (const a of (game.actors ?? [])) {
      if (edhaStillFightingElsewhere(a, guard)) continue;
      if (!a.flags?.["edha-content"]?.markedBy?.doubledipped) continue;
      try { await a.unsetFlag("edha-content", "markedBy.doubledipped"); await edhaToggleStatus(a, "doubledipped", false); } catch (e) {}
    }
  } catch (e) {}
});

/* --- RITUAL HP COST keystone: pay HP on use, then ANNOUNCE the payment (edha-ritual-paid) --------
 * 2bZ (iron rule 2b): this executor used to name-key Blood Price (advantage flag) and Sanguine
 * Reservoir (Reserve banking) — two riders inside ANOTHER talent's executor. Both are rules on
 * their own documents now, reached by edhaDispatchRitualPaid below. Do not re-add a name here. */
async function edhaRitualHpCost(item, cfg) {
  try {
    const actor = item?.actor; if (!actor) return;
    const roll = await (new Roll(cfg.formula || "@tier", actor.getRollData())).evaluate();
    const amt = Math.max(0, Math.floor(roll.total));
    // Double Dip: the talent's target is marked by THIS owner and Reserve covers the price → offer to
    // pay from Reserve instead of HP. Not a health loss: no Blood Price flag, nothing banked.
    if (amt > 0) {
      const target = edhaUserTargetActor();
      const marked = edhaMarkOwner(target, "doubledipped")?.owner?.id === actor.id;   // Double Dip's scene mark
      const reserve = edhaGetReserve(actor);
      if (marked && reserve >= amt) {
        let useReserve = false;
        try {
          useReserve = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Double Dip — pay from Reserve?" },
            content: `<p><strong>${item.name}</strong> costs <strong>${amt}</strong> HP and targets a Double-Dipped creature.</p><p>Pay it from <strong>Reserve</strong> (${reserve}/${edhaReserveCap(actor)}) instead of health?</p>`,
            rejectClose: false,
          });
        } catch (e) { useReserve = false; }
        if (useReserve) {
          await edhaSetReserve(actor, reserve - amt);
          ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>🩸 <strong>${item.name}</strong>: ${actor.name} pays <strong>${amt}</strong> from Reserve (Double Dip — ${edhaGetReserve(actor)}/${edhaReserveCap(actor)} left). No health lost: no Blood Price, nothing banked.</p>` });
          return;
        }
      }
    }
    if (amt > 0) await edhaSpendResource(actor, "hea", amt);
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p>🩸 <strong>${item.name}</strong>: ${actor.name} pays <strong>${amt}</strong> HP.</p>`,
    });
    // ANNOUNCE the payment (2bZ). The Reserve branch above returns BEFORE this line on purpose:
    // paying from Reserve is not a health loss, so no ritual rider fires (unchanged behaviour).
    // amt can legitimately be 0 (a formula that rolled to nothing) and the announcement still
    // fires — the retired code armed the advantage flag on a 0 payment too; a banking rule
    // simply banks nothing.
    await edhaDispatchRitualPaid(actor, item, amt);
  } catch (e) { console.error("Edha Content | ritual HP cost failed", e); }
}

/* Blood Price's advantage pipeline is GONE (2bZ, iron rule 2b). The bespoke `bloodPriceAdv` flag +
 * its pre-roll/consume hook pair were a private second copy of the nextTestMod pipeline (the same
 * retirement Coercive Pressure's cogDisadv took in 07-24r). The talent's document now carries
 * `edha-next-test-mod` {target: self, advantage, skill: black} on the `edha-ritual-paid` event —
 * same advantage write, same consume-and-announce, skill-gated to Black exactly as before. A
 * bloodPriceAdv flag left on a live actor by a pre-deploy build is inert from now on.
 * ✅ The 2bI-4 narrowing is GONE (item 49, Ben's R-15(b)): nextTestMod is a LIST, so a second
 * next-test rider stacks beside a banked Blood Price advantage instead of overwriting it. */

