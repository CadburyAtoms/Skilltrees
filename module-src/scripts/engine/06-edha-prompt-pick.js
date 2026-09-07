/* ================================================================================================
 * H6 `edha-prompt-pick` (07-24s) — THE OFFER: hand the player a choice, then run the payload.
 *
 * ⚠ WHAT §9o SAID, AND WHAT THE CALL SITES SAY. §9o costed this three times as "largely exposing a
 * schema over functions that are already generic — edhaPostCalcTestCard & co. take the talent name
 * as a mere LABEL". That is HALF true, and the half that is false is the design:
 *   · TRUE for the OFFER shape. `edhaPostCoordReactionCard(owner, name, {costs, prompt, result})`
 *     branches on no name at all: its click gates once-per-round, spends the listed resources and
 *     posts `result`. Ten talents share it already.
 *   · FALSE for the PICK shape. `edhaPostCalcTestCard`, `edhaPostBeaconCard`, `edhaPostReknitCard`,
 *     `edhaPostLifeCleanseCard`, `edhaPostMutationCard` and Unnerving Approach's hand-rolled card
 *     each HARD-CODE a different payload in their click handler — set a next-test flag, spend 1 Inv
 *     and clear a status, delete an injury Item, write a mutation flag, push a token. They are
 *     generic only WITHIN their own payload, so there is no one function to put a schema over.
 * So the build is not a schema over an existing card function: it is ONE card+click pair whose
 * click DISPATCHES BACK INTO THE RULE SYSTEM. That is pass H's move —
 * `edhaDispatchTestResult(owner, item, picked, true, …)` fires the item's own
 * `edha-test-success` rules with the PICKED creature as the subject, so H6 needs no payload
 * vocabulary of its own and every existing payload handler works unchanged, present or future.
 * (Recorded because the estimate was wrong in the same direction for the SEVENTH pass running: the
 * `needs` column records the GATE. Here it also mis-recorded the SHAPE of the thing being reused.)
 *
 * WHY IT HAD TO BE A HANDLER AT ALL. A rule can resolve a test and it can apply an effect, but it
 * cannot ASK. Every talent that says "choose one" therefore had to be engine code, and 31 of them
 * are — the largest single demand column in the classification.
 *
 * THE SOURCES, and why only two shipped. `confirm` (one accept button — the offer shape) and
 * `creatures` (pick one of N actors, filtered) cover every consumer whose payload is an actor.
 * Three more sources are real and are NOT built, because their payload would have to receive the
 * picked THING rather than an actor, and no payload handler takes one:
 *   status  — Beacon of Stability, Surgical Precision, Devoted Presence (pick a condition to clear)
 *   item    — Reknit Form (pick an injury to delete)
 *   effect  — Unweaving (pick an active effect to dispel)
 * Shipping them schema-only would repeat exactly what §9o forbids for the watch kinds: a source
 * with no reachable consumer. They land with a payload that can act on the pick, not before.
 * ============================================================================================= */

/* PURE (pinned in tests/): does ONE candidate pass this pick rule's filters?
 * c = { disposition, anchorDisposition, ownerDisposition, hp, statuses }. Split out from the sweep
 * so the filter logic is testable with no canvas and no actors, exactly like edhaWatchMatches.
 *
 * `aliveOnly` fails OPEN on an unreadable HP — the OPPOSITE of edhaWatchMatches' whenTotal, and
 * deliberately so. The failure modes are not symmetric: an unreadable passive gate firing scene-wide
 * is silent and wrong, whereas an extra name in a whispered pick list is visible and declinable.
 * The hand-rolled Unnerving Approach read `(hea?.value ?? 1) > 0` and made the same choice. */
function edhaPickAccepts(h, c) {
  if (!h || !c) return false;
  if (h.aliveOnly !== false) {
    const raw = c.hp;
    const hp = (raw === null || raw === undefined || raw === "") ? NaN : Number(raw);
    if (Number.isFinite(hp) && hp <= 0) return false;
  }
  const disp = String(h.disposition || "any");
  if (disp === "enemy" && c.disposition === c.ownerDisposition) return false;
  if (disp === "ally" && c.disposition !== c.ownerDisposition) return false;
  // Measured against the ANCHOR instead of you: Unnerving Approach pushes an ally OF YOUR TARGET,
  // which "ally" (relative to you) gets exactly backwards.
  if (disp === "anchor-ally" && c.disposition !== c.anchorDisposition) return false;
  if (disp === "anchor-enemy" && c.disposition === c.anchorDisposition) return false;
  const want = String(h.requireStatus || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (want.length && !want.some((s) => (c.statuses || []).includes(s))) return false;
  return true;
}

/* PURE (pinned in tests/): "foc:2, inv:1" → [{resource:"foc", value:2}, {resource:"inv", value:1}].
 * A bare name means 1 ("foc" === "foc:1") because this is a text field a human types. Anything that
 * does not parse to a positive whole number is DROPPED rather than defaulted — a cost that silently
 * became 0 would hand out a free reaction, which is the failure nobody would notice at the table. */
function edhaParseCosts(s) {
  const out = [];
  for (const part of String(s ?? "").split(",")) {
    const p = part.trim(); if (!p) continue;
    const bits = p.split(":");
    const res = String(bits[0] ?? "").trim().toLowerCase(); if (!res) continue;
    const n = bits.length > 1 ? Math.floor(Number(String(bits[1]).trim())) : 1;
    if (!Number.isFinite(n) || n <= 0) continue;
    out.push({ resource: res, value: n });
  }
  return out;
}

/* --- THE SPEND STAMP (ruling R-4 half b, TODO_REPO_HYGIENE #28b, 2026-09-06) --------------------
 * A resource DECREASE is not the same thing as a SPEND. Until today the engine treated them as
 * identical: `updateActor` saw focus go down and dispatched `focus-change`, so Ben correcting an
 * adversary's focus on the sheet taxed it through Whispered Doubt and handed out Coercive
 * Pressure's disadvantage. Same shape one hook further down for Investiture and the Order edicts.
 *
 * THE DIRECTION WAS A REAL CHOICE, and it is the positive one: **the SPEND is stamped, and an
 * unstamped decrease is not a spend.** The alternative — tag the engine's bookkeeping writes and
 * count everything else — cannot work, because the writes R-4 complains about are the ones the
 * engine does NOT make: a GM typing in the sheet, dragging a token bar, or running a third-party
 * macro. There is no bookkeeping tag to put on a write we never issue, so the absence of one can
 * never be evidence. Asking "did something say a spend happened?" is answerable; asking "did
 * nothing say this was bookkeeping?" is not.
 *
 * The cost of the positive direction is that EVERY real spend has to carry a signal, and this
 * half's named risk is exactly the miss: **wrongly classifying a real spend as bookkeeping.** Two
 * signals cover the whole surface, and the whole surface was enumerated (every write in the file
 * that can lower `foc`/`inv`; the table is in the 2026-09-06 handoff delta):
 *
 *   1. `options.edha.spend` — stamped by the engine's own spend writers via `edhaSpendTag()`:
 *      `edhaSpendResource` (the canonical clamped spend, and therefore every `costs:` deduction
 *      including an adversary ability's) and `edhaConsumeCost` (the takeover/burst activation
 *      cost). ⚠ Two more sites carried the stamp until **R-72 answered (b) on 2026-09-06** — the
 *      `set-resource` socket relay and H10's Investiture drain — and both are now BOOKKEEPING,
 *      because each of them is an INVOLUNTARY drain: the creature losing the resource did not
 *      activate anything, so the Order Edict must not read it as a violation. What is left on this
 *      list is exactly "a cost its owner paid". `options` and not a document property ON PURPOSE:
 *      options are broadcast to every client with the update, so the watcher
 *      sees the tag no matter which client it runs on, and nothing is left behind on the actor.
 *   2. A live **pre-use expectation** — the cosmere-rpg system deducts a talent's activation cost
 *      itself, from a `postRoll` action inside `item.use()`, with a plain `actor.update()` and NO
 *      options at all (verified against systems/cosmere-rpg/index.js at 2.1.0), so the engine
 *      cannot stamp it. Instead `cosmere-rpg.preUseItem` registers what that use is about to cost
 *      (`edhaConsumeList`, the same reader `edhaConsumeCost` uses) and `edhaIsSpend` accepts any
 *      decrease of that resource on that actor inside the window.
 *
 * Three deliberate looseness choices in the expectation, all leaning the SAME way — toward "yes,
 * a spend", because a wrong YES is today's behaviour while a wrong NO silences a live talent:
 *   · amount-agnostic (a scaling cost can exceed the declared `value.min`, and requiring a match
 *     would drop exactly those);
 *   · not consumed on read (two watchers may consult the same write, and a partial payment lands
 *     as two updates);
 *   · a use vetoed AFTER this hook leaves a harmless stale expectation for the window.
 * `edhaIsSpend` also throws toward YES, the same fail-safe direction `edhaInActiveCombat` uses.
 *
 * NOT spend-stamped, deliberately — this is the list that makes the gate mean something: scene
 * resets, restores, the temp-HP unwind, the creation wizard, adversary sync, and every GM sheet
 * edit or token-bar drag. (TODO #13, the day after: the engine-issued half of that list now carries
 * the POSITIVE `edhaBookkeepingTag` through `edhaResourceWrite` — a declared non-spend, which the
 * predicate reads the same way it reads no tag at all. A GM sheet edit still carries nothing, and
 * that is still what makes it a GM sheet edit.) `edhaGainFocus`/`edhaDrainFocus` never reach the
 * predicate either way: their writes already carry `edhaFocusWatch` and the focus watcher has
 * skipped them since 07-05 (the drain announces its own zero crossing by hand). Since **R-72
 * answered (b) on 2026-09-06** `edhaDrainFocus` ALSO carries `edhaBookkeepingTag` — an involuntary
 * drain is not a spend, and the tag says so positively rather than relying on the focus-watch skip
 * to hide it (the skip is a different statement, and the Investiture watch does not read it).
 * `edhaGainFocus` is an increase, so its tag decides nothing. */
const EDHA_SPEND_WINDOW_MS = 30000;   // the file's existing wall-clock prompt-debounce bound
let _edhaSpendExpect = [];            // [{ actorId, resource, amount, source, at }]
/* The tag itself. Merge it into an update's `options`: `actor.update(u, edhaSpendTag("…"))`, or
 * `{ ...other, ...edhaSpendTag("…") }` when the call already passes options. `bookkeeping: true`
 * is the declared opposite: an engine write that changes a resource WITHOUT being a spend says so
 * here rather than by staying silent. (It set nothing on the day #28b landed; TODO #13 adopted it
 * the next day at the ten non-spend sites `edhaResourceWrite` now owns.) */
function edhaSpendTag(source) { return { edha: { spend: true, source: String(source || "engine") } }; }
function edhaBookkeepingTag(source) { return { edha: { bookkeeping: true, source: String(source || "engine") } }; }
/* Register what a use is about to cost, so the system's own postRoll deduction has a signal. */
function edhaExpectSpend(actor, resource, amount, source) {
  try {
    if (!actor?.id || !resource) return;
    const now = Date.now();
    _edhaSpendExpect = _edhaSpendExpect.filter((e) => now - e.at < EDHA_SPEND_WINDOW_MS);
    _edhaSpendExpect.push({ actorId: actor.id, resource: String(resource), amount: Number(amount) || 0, source: String(source || "use"), at: now });
  } catch (e) { /* never block a use on the bookkeeping stamp */ }
}
function edhaSpendExpected(actor, resource) {
  try {
    if (!actor?.id || !resource) return false;
    const now = Date.now();
    _edhaSpendExpect = _edhaSpendExpect.filter((e) => now - e.at < EDHA_SPEND_WINDOW_MS);
    return _edhaSpendExpect.some((e) => e.actorId === actor.id && e.resource === String(resource));
  } catch (e) { return true; }
}
/* THE PREDICATE. Every site that infers a spend from a resource decrease consults this one
 * function — `oldVal`/`newVal` are the stashed before/after the preUpdateActor hook already
 * captures. Returns false for a decrease with no positive signal: a GM sheet edit. */
function edhaIsSpend(actor, resource, options, oldVal, newVal) {
  try {
    if (!(Number(newVal) < Number(oldVal))) return false;      // not a decrease at all
    const tag = options?.edha;
    if (tag?.bookkeeping === true) return false;               // an engine write that declares itself
    if (tag?.spend === true) return true;                      // an engine spend writer
    return edhaSpendExpected(actor, resource);                 // the system's own activation cost
  } catch (e) { return true; }                                 // uncertain lands on today's behaviour
}
/* Registered after the fourteen pre-cost vetoes above it (the H1 `edha-def-test` veto and the
 * deity target/range/ledger gates), so Foundry's stop-at-first-`false` means a use THEY refuse
 * never reaches here. The eight vetoes registered further down the file can still refuse a use
 * this hook has already recorded — that leaves an expectation for nothing, which is harmless: a
 * refused use writes no resource, so the only effect is that an unrelated hand edit of the same
 * resource on the same actor inside the window reads as a spend, i.e. today's behaviour. */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor; if (!actor) return;
    for (const c of edhaConsumeList(item)) edhaExpectSpend(actor, c.resource, c.amount, item.name);
  } catch (e) { /* never block a use */ }
});

/* --- edhaSpendResource / edhaGainResource (ENGINE PASS 5.3, Job 6) — the canonical clamped resource
 * write. ~13 spend sites and ~5 gain sites hand-rolled the same two shapes:
 *   spend: `const cur = res?.value ?? 0; update({...: Math.max(0, cur - n)})`
 *   gain:  `const rmax = edhaResVal(res) ?? cur + n; update({...: Math.min(rmax, cur + n)})`
 * Both read CURRENT value falsy-zero-safely (`res?.value ?? 0`, never `|| 0` — an actor sitting at
 * exactly 0 must still read as 0, not "unset"). `n <= 0` is a no-op (every site this replaces either
 * only reached its update() already knowing n > 0, or a 0 write is a harmless identity update —
 * verified per site during migration, not assumed). Gain's max: `edhaResVal(res)` when the resource
 * schema carries a readable derived max, else uncapped at `cur + n` (matches the sites that had no
 * max to clamp against). Both swallow a write failure the same way every site already did (missing
 * permission on someone else's actor) — callers that need a GM-relay fallback on failure (the Temp-HP
 * cross-writer, edhaCrossHeal's socket relay) are NOT migrated onto this: that is a different shape
 * (relay-on-failure), not a plain spend/gain, and stays hand-rolled on purpose. */
async function edhaSpendResource(actor, resource, n) {
  try {
    if (!actor || !resource || !(Number(n) > 0)) return;
    const res = actor.system?.resources?.[resource];
    const cur = res?.value ?? 0;
    // #28b: THE spend stamp. Every `costs:` deduction in the engine lands here, so one tag on this
    // one write is what tells the focus/Investiture watches a real spend happened.
    await actor.update({ [`system.resources.${resource}.value`]: Math.max(0, cur - Number(n)) }, edhaSpendTag("edhaSpendResource"));
  } catch (e) { /* perms */ }
}
async function edhaGainResource(actor, resource, n) {
  try {
    if (!actor || !resource || !(Number(n) > 0)) return;
    const res = actor.system?.resources?.[resource];
    const cur = res?.value ?? 0;
    const max = edhaResVal(res) ?? (cur + Number(n));
    await actor.update({ [`system.resources.${resource}.value`]: Math.min(max, cur + Number(n)) });
  } catch (e) { /* perms */ }
}

/* --- edhaResourceWrite (TODO #13, 2026-09-06) — THE resource-path writer for every resource write
 * that is NOT a plain clamped spend/gain. The three canonical writers above and `edhaConsumeCost`
 * build their update path from a variable; twelve other sites hand-rolled the literal
 * `"system.resources.<id>.value"` key with their own clamp, their own relay-on-failure, or a
 * `max.override` transform, which is why they could not simply call one of those three. Since #28b
 * the untidiness is also a correctness question: an update's `options` are where a write says what
 * KIND of write it is, and a hand-rolled `actor.update({...})` with no options says nothing.
 *
 * NONE of the twelve turned out to be a spend — every cost deduction in the engine already goes
 * through `edhaSpendResource`/`edhaConsumeCost`. They are gains, heals, restores, a lifesteal, a
 * revive-to-1, a Colossus max-HP override and one open-ruling drain. So this owns the path and
 * takes the classification as an ARGUMENT, one per site:
 *   · `edhaBookkeepingTag(src)` — a declared non-spend (every gain/heal/restore/override here,
 *     and — since R-72 answered (b) on 2026-09-06 — every INVOLUNTARY DRAIN: `edhaDrainFocus`,
 *     its `set-resource` relay half, and H10's Investiture branch. A creature whose resource is
 *     taken by someone else has not activated anything, so the Order Edict must not see it);
 *   · `edhaSpendTag(src)`      — a real spend. The only two writers left are `edhaSpendResource`
 *     and `edhaConsumeCost`, i.e. every cost the OWNER pays. Adding a third needs a ruling.
 * `changes` is keyed RELATIVE to the resource: `{ value: n }`, or
 * `{ "max.override": n, "max.useOverride": true, value: n }` for a transform.
 *
 * It deliberately does NOT catch and does NOT clamp: every migrated site keeps its own try/catch,
 * socket relay, outer handler and max math exactly as it had them, so the migration is a pure
 * refactor plus the tag. Returns the `update()` promise. */
function edhaResourceWrite(actor, resource, changes, options) {
  const u = {};
  for (const [k, v] of Object.entries(changes || {})) u[`system.resources.${resource}.${k}`] = v;
  return actor.update(u, options || {});
}

/* Build the candidate list. Measured from the ANCHOR — you, or the creature this rule's trigger
 * resolved against — because "an ally of your target within 10 ft" is a circle round the TARGET. */
function edhaPickCandidates(owner, h, anchor) {
  const atok = edhaCasterToken(anchor);
  if (!atok) return [];
  const ft = h.rangeColor ? edhaAttuneFtColor(owner, h.rangeColor) : (Number(h.rangeFt) || 0);
  if (!ft) return [];
  const otok = edhaCasterToken(owner);
  const ownerDisp = otok?.document?.disposition ?? 1, anchorDisp = atok.document?.disposition ?? 1;
  const list = edhaTokensWithin(atok, ft).filter((t) => t.actor);   // edhaTokensWithin already drops the anchor
  // The owner is a candidate for its own network (Anticipate grants advantage to "you or an ally"),
  // and edhaTokensWithin cannot supply it when the owner IS the anchor — so add it back explicitly.
  const out = [];
  if (h.includeSelf !== false && anchor === owner && otok) out.push(otok);
  for (const t of list) {
    if (h.includeSelf === false && t.actor === owner) continue;
    if (!edhaPickAccepts(h, {
      disposition: t.document?.disposition ?? 1, anchorDisposition: anchorDisp, ownerDisposition: ownerDisp,
      hp: t.actor.system?.resources?.hea?.value, statuses: [...(t.actor.statuses ?? [])],
    })) continue;
    out.push(t);
  }
  return out;
}

/* The card. Whispered to the owner + GM: a choice is the owner's to make, and the payload announces
 * itself publicly when it runs. Every button carries the ITEM's uuid, so the click re-reads the rule
 * off the document rather than trusting anything baked into the HTML. */
// {name} template fill (pure — pinned in tests/). The one substitution idiom the card texts use;
// split/join rather than a RegExp so authored text can never inject a pattern.
function edhaFillName(text, name) { return String(text ?? "").split("{name}").join(String(name ?? "")); }
async function edhaRunPromptPick(item, h, event) {
  const owner = item?.actor; if (!owner) return;
  const source = String(h.source || "confirm");
  const victim = edhaResolveVictim(event);
  const anchor = String(h.relativeTo || "self") === "victim" ? victim : owner;
  /* {name} on the OFFER card (2026-07-26l, bench run 3 defect 2): the accept-note path always
   * substituted, but the offer path posted `prompt` raw — Puppeteer's whisper printed a literal
   * `{name}`. At offer time the name is the TRIGGER's subject (the creature whose turn/test this
   * was — victim), falling back to the anchor, then you; the PICKED creature does not exist yet,
   * which is why the accept note keeps its own substitution below. */
  const subjName = (victim ?? anchor ?? owner)?.name ?? "";
  if (String(h.relativeTo || "self") === "victim" && !anchor) {
    ui.notifications?.warn(`Edha: ${item.name} — target the creature first.`);
    return;
  }
  const icon = h.icon ? `${h.icon} ` : "";
  const attrs = (pickUuid) => `data-edha-item="${item.uuid}" data-edha-pick="${pickUuid}"`
    + (anchor && anchor !== owner ? ` data-edha-anchor="${anchor.uuid}"` : "");
  let body = "";
  if (source === "creatures") {
    const cands = edhaPickCandidates(owner, h, anchor);
    if (!cands.length) {
      if (h.emptyNote) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<p>${icon}<strong>${item.name}</strong>: ${edhaFillName(h.emptyNote, subjName)}</p>` });
      return;
    }
    body = cands.map((t) => `<button type="button" class="edha-pick-btn" ${attrs(t.actor.uuid)}>${h.label || "Choose"} ${t.actor.name}</button>`).join(" ");
  } else if (source === "effects") {
    /* The DISPEL (2bU; widened 2026-09-06, item 54 — R-73 (b) + R-35 (a)). One button per enabled
     * effect the subject actually BEARS, read through edhaAllEffects: a passive authored
     * `transfer: true` on a talent or trait (a PC's Hardy / Collected / Surefooted, a Cinderhound's
     * Cinder Coat, Predictive Ward's braced) lives on the ITEM and never appears in `actor.effects`,
     * so the old read could not offer it. Two kinds of button, decided by edhaDispelOptions:
     *   · an ACTOR-level effect → the click DELETES it (the 2bU shape, unchanged);
     *   · an ITEM-owned effect  → the click DISABLES it (`disabled: true`) and NEVER deletes — deleting
     *     a yielded item effect writes to the item and would strip the passive from that creature's
     *     copy of the talent for good (R-73's whole point). The click re-derives the kind from the
     *     DOCUMENT (edhaEffectOwnerItem); `data-edha-mode` is a label, not a permission.
     * Plus (R-35) one "Dispel <Marker>" button per ledger the rule's `ledgers` field names that holds
     * the subject — the Omen entry — whose click clears the marker AND its ledger row.
     * A different button class on purpose: the generic pick click resolves its uuid to an ACTOR and
     * dispatches success rules, neither of which an effect or a ledger entry can be. */
    const subject = victim;
    if (!subject) { ui.notifications?.warn(`Edha: ${item.name} — no creature to unweave.`); return; }
    const opts = edhaDispelOptions(subject, h);
    const esc = (s) => String(s ?? "").replace(/</g, "&lt;");
    body = opts.length
      ? opts.map((o) => o.kind === "ledger"
        ? `<button type="button" class="edha-dispel-btn" data-edha-item="${item.uuid}" data-edha-ledger="${esc(o.key)}" data-edha-subject="${subject.uuid}">Dispel ${esc(o.label)}</button>`
        : `<button type="button" class="edha-dispel-btn" data-edha-item="${item.uuid}" data-edha-eff="${o.eff.uuid}" data-edha-mode="${o.mode}">${esc(o.eff.name || o.eff.label || "effect")}${o.item ? ` <span style="opacity:.75">(${esc(o.item.name)} — suppress)</span>` : ""}</button>`).join(" ")
      : `<p><em>${h.emptyNote || `No active effects found on ${subject.name} — narrate the unraveling.`}</em></p>`;
  } else {
    // confirm: the subject is the creature the trigger already resolved against (or you).
    const subject = victim ?? owner;
    body = `<button type="button" class="edha-pick-btn" ${attrs(subject.uuid)}>${edhaFillName(h.label, subject.name) || `Use ${item.name}`}</button>`;
  }
  const costs = edhaParseCosts(h.costs);
  const costLabel = costs.length ? ` <span style="opacity:.8">(spends ${costs.map((c) => `${c.value} ${EDHA_RES_LABEL[c.resource] || c.resource}`).join(" + ")})</span>` : "";
  /* R-17 (item 51, 2026-09-06). An offer posted from the talent's OWN `use` event has already been
   * charged its activation cost by the SYSTEM (Unnerving Approach: 1 Investiture, consumed before
   * this rule ever ran), so declining or ignoring the card used to keep the cost while the round's
   * use — spent on the click — stayed available. Ben: keep the click budget AND refund. The card
   * therefore carries a Decline button and a message flag naming what a decline (or the
   * round-change sweep for an IGNORED card) refunds; both go through edhaOfferDecline, the ONE
   * refund path, which is R-69's `edhaRefundCost` idiom (charge on post, refund on back-out).
   * An offer posted from a watch / success rule (Puppeteer) was never system-charged — its `costs`
   * land on the click — so `refund` is false there and a decline credits nothing (no minting). */
  const refund = edhaOfferRefundable(item, event);
  const declineBtn = refund ? ` <button type="button" class="edha-pick-decline-btn" data-edha-item="${item.uuid}">Decline${edhaConsumeList(item).length ? " (refund)" : ""}</button>` : "";
  ChatMessage.create({
    whisper: edhaWhisperIds(owner),
    speaker: ChatMessage.getSpeaker({ actor: owner }),
    content: `<div class="edha-trigger-card"><p>${icon}<strong>${item.name}</strong> — ${edhaFillName(h.prompt, subjName) || "choose one:"}${costLabel}</p>${body}${declineBtn}</div>`,
    flags: { "edha-content": { offer: { itemUuid: item.uuid, round: edhaCombatRoundOf(owner), refund } } },
  });
}
/* Pure: does this offer carry a system-charged activation cost that a decline must give back?
 * True only when the rule fired on the talent's own `use` event (the system's event object carries
 * `type`; the engine's internal dispatch passes `{item, rule, options}` with `rule.event` instead,
 * so a success-rule / watch-posted offer reads as NOT refundable) AND the item actually consumes
 * something. Pinned in tests/offer-decline-refund. */
function edhaOfferRefundable(item, event) {
  const trigger = event?.type ?? event?.rule?.event ?? null;
  return trigger === "use" && edhaConsumeList(item).length > 0;
}
/* THE one decline path (R-17). Resolves the card once — a second decline, a late accept after the
 * sweep, or the sweep after a click all read the `cardResolved` flag and stop — then refunds the
 * system-charged activation cost through edhaRefundCost (the R-69 idiom; nothing else in the offer
 * family may credit a resource). Returns true when it refunded, false when nothing was owed or the
 * card was already resolved. `msg` may be null (a card whose message is gone): then it only refunds
 * when the caller says the offer was refundable. */
async function edhaOfferDecline(msg, item, label, { refund = null } = {}) {
  if (msg?.getFlag?.("edha-content", "cardResolved")) return false;
  const owed = refund ?? !!msg?.getFlag?.("edha-content", "offer")?.refund;
  if (msg?.id) await edhaMarkCardResolved(msg.id, label);
  if (!owed || !item) return false;
  await edhaRefundCost(item);
  return true;
}
async function edhaPromptPickDeclineClick(ev, msg) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    const item = await fromUuid(ds.edhaItem).catch(() => null);
    const owner = item?.actor;
    if (!item || !owner) { ui.notifications?.warn("Edha: that talent is no longer available."); return; }
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) can resolve this."); return; }
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach((b) => (b.disabled = true));
    const refunded = await edhaOfferDecline(msg, item, "Declined — cost refunded");
    ui.notifications?.info(refunded ? `${item.name} declined — cost refunded.` : `${item.name} declined.`);
  } catch (e) { edhaClickFailed("prompt pick decline click", e); }
}
/* IGNORED offers (R-17's "or ignored"): when the combat round advances, every unresolved offer card
 * posted in an EARLIER round of it is declined by the one active GM — same path as the button, so
 * the refund is the same refund. Keyed on the round because that is the budget the click spends
 * (`once: round`); outside combat there is no round to advance and the Decline button is the way
 * out. Reads the last 200 messages — an offer older than that is not one anybody is still deciding. */
async function edhaSweepIgnoredOffers(combat) {
  try {
    if (!edhaDefBuffGmGate()) return;
    const round = Number(combat?.round);
    if (!combat?.started || !Number.isFinite(round)) return;
    const msgs = (game.messages?.contents ?? []).slice(-200);
    for (const msg of msgs) {
      const offer = msg?.getFlag?.("edha-content", "offer");
      if (!offer?.refund || offer.round == null || !(Number(offer.round) < round)) continue;
      if (msg.getFlag("edha-content", "cardResolved")) continue;
      const item = await fromUuid(offer.itemUuid).catch(() => null);
      await edhaOfferDecline(msg, item, "Ignored — cost refunded");
    }
  } catch (e) { console.error("Edha Content | ignored-offer sweep failed", e); }
}
Hooks.on("combatTurnChange", (combat) => void edhaSweepIgnoredOffers(combat));

async function edhaPromptPickClick(ev, msg = null) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget, ds = btn.dataset;
    // R-17: a card the sweep (or a Decline) already resolved has had its cost refunded — accepting
    // it now would be a free use. The flag is the same one the render hook disables buttons on.
    if (msg?.getFlag?.("edha-content", "cardResolved")) { ui.notifications?.info("Edha: that offer was already resolved."); return; }
    const item = await fromUuid(ds.edhaItem).catch(() => null);
    const owner = item?.actor;
    if (!item || !owner) { ui.notifications?.warn("Edha: that talent is no longer available."); return; }
    if (!owner.isOwner) { ui.notifications?.warn("Edha: only the talent's owner (or the GM) can resolve this."); return; }
    /* Re-read the rule off the DOCUMENT: an edit in Foundry between posting and clicking must win,
     * and nothing about the decision should live in the chat HTML.
     * ⚠ ONE prompt rule per talent — this reads the FIRST. Nothing needs two today, and a talent
     * that genuinely chains "pick, then pick again" is a multi-step dialog, i.e. the declared
     * ENGINE-OWNED exit, not a second rule. If that ever changes, key the button on the rule id. */
    const h = edhaRuleOf(item, "edha-prompt-pick");
    if (!h) { ui.notifications?.warn(`Edha: ${item.name} no longer carries a prompt rule.`); return; }
    const picked = await edhaResolveActorRef(ds.edhaPick);
    if (!picked) { ui.notifications?.warn("Edha: that creature is no longer on the canvas."); return; }
    const anchor = await edhaResolveActorRef(ds.edhaAnchor);
    // The budget is spent HERE, not at post time: posting a card the player declines must not burn
    // the round's use. Same reasoning as edhaWatchBudgetGate running last.
    if (String(h.once || "no") !== "no" && !edhaCoordOPRAllowed(owner, item.uuid, "_pick")) {
      ui.notifications?.info(`${item.name} was already used this round.`);
      btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-pick-btn").forEach((b) => (b.disabled = true));
      return;
    }
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-pick-btn").forEach((b) => (b.disabled = true));
    if (String(h.once || "no") !== "no") await edhaCoordOPRMark(owner, item.uuid, "_pick");
    for (const c of edhaParseCosts(h.costs)) await edhaSpendResource(owner, c.resource, c.value);
    btn.textContent = `✓ ${picked.name}`;
    // Resolved BEFORE the payload runs, and awaited: R-17's sweep reads this flag to decide what
    // an "ignored" card is, so an accepted card must be marked before a round change can see it.
    await edhaMarkCardResolved(msg?.id ?? edhaMessageIdOf(btn), `✓ ${picked.name}`);
    // The payload is the talent's OWN success rules, with the PICKED creature as the subject.
    // `announce: false` — a pick is not a test, and letting it fan out as one would let an unfiltered
    // scene watcher fire on every choice anyone makes.
    const fired = await edhaDispatchTestResult(owner, item, picked, true, { anchor, viaPick: true, announce: false });
    // The table-run case: no payload rule ran, so the card IS the mechanic. `{name}` is the creature
    // that was picked — Puppeteer's note has to say whose actions you are borrowing.
    if (!fired && h.note) ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>${h.icon ? `${h.icon} ` : ""}<strong>${item.name}</strong> (${owner.name}): ${edhaFillName(h.note, picked.name)}</p>` });
  } catch (e) { edhaClickFailed("prompt pick click", e); }
}
/* --- The dispel's three PURE-ish pieces (item 54, 2026-09-06 — pinned in tests/dispel-widening) ---
 * Which ITEM owns this effect — null for an actor-level one. Fails CLOSED: only a parent that is
 * provably the actor (documentName "Actor", the subject itself, or a shell carrying `items`) counts
 * as actor-level; everything else is item-owned and may only ever be DISABLED, never deleted. */
function edhaEffectOwnerItem(eff, subject = null) {
  const p = eff?.parent;
  if (!p) return null;
  if (p.documentName === "Actor" || (subject && p === subject)) return null;
  if (p.documentName === "Item") return p;
  return Array.isArray(p.items) ? null : p;   // a thin shell: actors carry `items`, items do not
}
/* The ledgers a dispel may clear, from the rule's `ledgers` field: "omens:omen, edicts:edict" →
 * [{key, status, label}]. A missing field (every rule authored before item 54) reads as the Omen
 * ledger — R-35's answer — so no rebuild is needed; blank = none. The status defaults to the key. */
function edhaDispelLedgers(h) {
  const raw = h?.ledgers === undefined || h?.ledgers === null ? "omens:omen" : String(h.ledgers);
  return raw.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
    const [key, status] = s.split(":").map((x) => x.trim());
    const st = status || key;
    return { key, status: st, label: edhaConditionLabel(st) };
  });
}
function edhaLedgerEntryIs(entry, subject) {
  if (!entry?.uuid || !subject) return false;
  if (entry.uuid === subject.uuid) return true;
  try { const r = typeof fromUuidSync === "function" ? fromUuidSync(entry.uuid) : null; return !!r && (r.actor ?? r) === subject; }
  catch (e) { return false; }
}
/* Everything the card may offer on this subject: every enabled effect it bears (actor-level →
 * delete, item-owned → disable), then one entry per named ledger that holds it or whose marker it
 * wears. Ordered actor effects first, then item effects, then ledger marks. */
function edhaDispelOptions(subject, h) {
  const out = [];
  for (const e of edhaAllEffects(subject)) {
    if (!e || e.disabled) continue;
    const item = edhaEffectOwnerItem(e, subject);
    out.push({ kind: "effect", eff: e, item, mode: item ? "disable" : "delete" });
  }
  for (const led of edhaDispelLedgers(h)) {
    let held = false;
    try { held = edhaOwnerLedgers(led.key, led.status).some((l) => l.list.some((en) => edhaLedgerEntryIs(en, subject))); } catch (e) {}
    if (held || subject?.statuses?.has?.(led.status)) out.push({ kind: "ledger", ...led });
  }
  return out;
}
/* Clear a ledger mark from the subject: every owner's matching row goes through the queued
 * edhaLedgerDropCreature (rows first, so "the mark wins" reconciliation cannot hide them), then the
 * marker + markedBy are cleared once more by the subject's own uuid — a marker left by the legacy
 * edhaRemoveMark path has no row to drop, and must still come off. Returns rows dropped. */
async function edhaDispelLedgerMark(subject, key, status) {
  const uuids = new Set();
  try { for (const l of edhaOwnerLedgers(key, status)) for (const en of l.list) if (edhaLedgerEntryIs(en, subject)) uuids.add(en.uuid); } catch (e) {}
  let dropped = 0;
  for (const u of uuids) dropped += await edhaLedgerDropCreature(u, key, status);
  await edhaListUnmark({ uuid: subject.uuid }, status, { key });
  return dropped;
}
/* The dispel click (2bU — the payload the `effects` source shipped with). GM-side: the pick card
 * lists EVERY enabled effect because nothing in the data says which are "magical" — that
 * adjudication stays at the table, the removal is one click. Names no talent.
 * Item 54: an ITEM-owned effect is DISABLED, never deleted — decided from the document, never from
 * the button's data (a forged `data-edha-mode="delete"` still lands on the disable branch); a
 * ledger button clears the mark + its row through edhaDispelLedgerMark, and only for a ledger the
 * rule's own `ledgers` field names. */
async function edhaDispelPickClick(ev) {
  try {
    ev.preventDefault();
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: the dispel pick is GM-side — what counts as magical is the table's call."); return; }
    const btn = ev.currentTarget, ds = btn.dataset;
    const item = await fromUuid(ds.edhaItem).catch(() => null);
    let line, resolved = "Unwoven ✓";
    if (ds.edhaLedger) {
      const h = item ? edhaRuleOf(item, "edha-prompt-pick") : null;
      const led = edhaDispelLedgers(h).find((l) => l.key === ds.edhaLedger);
      if (!led) { ui.notifications?.warn(`Edha: ${item?.name || "the dispel"} does not reach the ${ds.edhaLedger} ledger.`); return; }
      const subject = await edhaResolveActorRef(ds.edhaSubject);
      if (!subject) { ui.notifications?.warn("Edha: that creature is no longer on the canvas."); return; }
      const rows = await edhaDispelLedgerMark(subject, led.key, led.status);
      resolved = `${led.label} dispelled ✓`;
      line = `<strong>${led.label}</strong> is dispelled from ${subject.name}${rows ? ` — ${rows} ledger ${rows === 1 ? "entry" : "entries"} cleared` : " (the marker alone; no ledger entry held it)"}.`;
    } else {
      const eff = await fromUuid(ds.edhaEff).catch(() => null);
      if (!eff) { ui.notifications?.info("Edha: that effect is already gone."); return; }
      const name = eff.name || eff.label || "the effect";
      const ownerItem = edhaEffectOwnerItem(eff);
      if (ownerItem) {
        const who = ownerItem.actor?.name ?? ownerItem.parent?.name ?? "the target";
        await eff.update({ disabled: true });
        resolved = "Suppressed ✓";
        line = `<strong>${name}</strong> is suppressed on ${who} — ${ownerItem.name}'s copy is intact; re-enable it on that item's Effects tab when the dispel ends.`;
      } else {
        const who = eff.parent?.name || "the target";
        await eff.delete();
        line = `<strong>${name}</strong> unravels from ${who}.`;
      }
    }
    btn.closest(".edha-trigger-card")?.querySelectorAll("button").forEach((b) => (b.disabled = true));
    void edhaMarkCardResolved(edhaMessageIdOf(btn), resolved);
    ChatMessage.create({ content: `<p>🧵 <strong>${item?.name || "Dispel"}</strong>: ${line}</p>` });
  } catch (e) { edhaClickFailed("dispel pick", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-pick-btn"], ["edha-pick-decline-btn"], ["edha-dispel-btn"] (Job 1, pass 5.3, end of file).

/* The TURN-START announcement — built ALONGSIDE its payload, which is the whole rule §9o states for
 * the remaining watch kinds. `turn-start` was queued with four consumers (Apex Form, Primal
 * Regeneration, Consuming Decay, Bear Witness) that all need payloads which do not exist, so it was
 * correctly NOT built in pass I. Puppeteer's payload is H6's own offer card, so the kind and its
 * consumer land together.
 *
 * `total` is the combatant's CURRENT FOCUS, mirroring focus-change's "the new focus": it is the only
 * number anyone gates a turn start on, and it makes Puppeteer's "starts its turn at 0 focus"
 * expressible as {whenTotal: "at-most", whenTotalValue: 0} with no kind-specific field. Unreadable
 * focus stays null, so the gate fails CLOSED (edhaWatchMatches).
 *
 * Announced from ONE client (edhaDefBuffGmGate), exactly as the hand-rolled Puppeteer cue was: the
 * sweep sees every actor from any GM client, and N clients announcing would post N cards. */
async function edhaAnnounceTurnStart(combat) {
  try {
    combat = combat || game.combat; if (!combat?.started) return;
    if (!edhaDefBuffGmGate()) return;
    const actor = combat.combatant?.actor; if (!actor) return;
    const foc = actor.system?.resources?.foc?.value;
    await edhaDispatchWatchers({
      kind: "turn-start", owner: actor, victim: null, skill: null, def: null, ok: null,
      total: (foc === null || foc === undefined) ? null : Number(foc),
    });
  } catch (e) { console.error("Edha Content | turn-start announce failed", e); }
}
Hooks.on("combatTurnChange", (combat) => void edhaAnnounceTurnStart(combat));
Hooks.on("combatStart", (combat) => void edhaAnnounceTurnStart(combat));

