/* ============================================================================================
 * BLUE / ILLUSION tree engine (2026-06-14e; iron rule 2b pass 2bAA 2026-07-26) — a mostly
 * NARRATIVE tree (illusions, positioning, cover). Rulings (Ben, 06-14e): Barricade = HP 2[Die],
 * no defenses, no attack, sustain-multiple; Phantom Double = HP 1 copy of the chosen creature,
 * dies on any hit, max 1, belief ENGINE-ROLLED since 07-14 (Perception vs the CASTER's Cognitive
 * defense, direction-aware visibility, no advantage rider — see the belief-loop block below);
 * Holographic Illusion = a no-stats token sized to [Size]; Living Image marks illusions mobile
 * (upkeep PROMPTED at turn start with a one-click pay since 07-16c — was manual); Redirect
 * Momentum = Blue vs the mover's Athletics; Ghostly Walls immobilizes owner-relative (+ Absolute
 * Stillness Weakened rider).
 *
 * ── IRON RULE 2b STATUS (2bAA — TREE CLEAR, and the LAST four on the whole ratchet) ───────────
 * THE `cosmere-rpg.useItem` SWITCH IS DELETED. Do NOT re-add a name-keyed case here; this tree
 * is where the migration finished (221 → 0). 2bAA authored rules onto four talents, so the tree
 * needs a PACK REBUILD + ⟳ Sync. On their own documents:
 *   • Holographic Illusion — one `edha-summon` rule. The 1b that unblocked it: `tokenSizeColor`
 *     ([Size] off your Blue rank, which the engine computed as edhaSizeFt) and `placeAt:
 *     pick-point` + `rangeColor` (no summon could be placed at a CHOSEN square before, which is
 *     why every "at a point within Attunement Range" card spawned beside the caster). The range
 *     gate is new — card-is-spec, §9m q11.
 *   • Living Image — a config-only `edha-illusion-upkeep` rule (the turn-start sweep is its
 *     reader, the pass-Y/Z veto shape) + an `edha-note` for the on-use reminder.
 *   • Phantom Double — `edha-illusion-copy`, see ENGINE_OWNED below.
 *   • Phantom Barricade — H22 `edha-barrier`, see ENGINE_OWNED below.
 * ENGINE_OWNED (declared, rule-keyed — the edha-decree exit shape; each talent's rule is its cue):
 *   • edha-illusion-copy — the per-viewer client veil is a patch of the Token#isVisible getter
 *     driven by a cross-actor belief ledger, and no rule chain expresses a canvas visibility
 *     patch. Re-litigated per iron rule 3 in 2bAA and the exit CONFIRMED. Every dial is a field:
 *     who is copied, the label the copy stamps, HP/speed/defenses, which of YOUR defenses sets
 *     the DC, which skill the onlookers roll, the range gate. The Mistheron's and The Doubled
 *     Elder's "The Seeming" are the other two consumers, each on its OWN adversary document —
 *     both rode this same branch, so deleting the switch would have unwired both.
 *   • edha-barrier (H22) — the picker, the Wall documents and their GM relay + lifecycle are
 *     canvas work no rule chain expresses (§9o). COVER STAYS A TABLE READ (the standing project
 *     ruling), so `blocksSight` ships "none" and the rule's note tells the table.
 *   `edha-def-test`  Counterspell · Read Intent (+ an `edha-note` reveal) ·
 *                    Redirect Momentum (`vs: skill` → Athletics) ·
 *                    Ghostly Walls (+ Immobilize, + the Absolute Stillness Weakened)
 * ⚑ ABSOLUTE STILLNESS is off the ratchet with an EMPTY document, declared not overlooked: it is a
 *   pure UPGRADE talent with no hook of its own, so its Weakened rider is a second success rule on
 *   Ghostly Walls gated `whenOwnsTalent: "Absolute Stillness"` (Ben's 07-24p ruling — see the
 *   heroic section's fuller note on this class). Editing the rider means editing Ghostly Walls.
 * ⚑ Ghostly Walls' manual "Immobilize" fallback button is gone with it. H1 fails OPEN on an
 *   unreadable defense — the very case the button covered now resolves as a success instead.
 * The GM summon relay (was backlog — wired 2026-07-04): a player without ACTOR_CREATE no longer
 * gets a warn — edhaSummon bakes the spec owner-side and relays `summon-actor` to the primary GM
 * (SHARED with Death/Risen Servant + Civ/Forge Construct; canonical entry in EDHA_FOUNDRY_HANDOFF.md §9).
 * ⚠️ CONDITIONALLY DEAD at Ben's table (EDHA_RULINGS.md R-1, ANSWERED 2026-09-05: the PLAYER role
 * keeps ACTOR_CREATE there), so this relay branch never fires locally — `edhaSummon` always takes
 * the direct `edhaSummonCreateGM` path. Kept on purpose for a world that revokes the permission;
 * do not delete it as "dead code" (TODO_REPO_HYGIENE #27).
 * ============================================================================================ */
// (edhaSizeFt is GONE with Holographic Illusion's conversion — [Size] off a colour is the
//  `tokenSizeColor` field on edha-summon now, resolved in its executor.)
function edhaTokenArt(actor) {
  const tok = edhaCasterToken(actor);
  return tok?.document?.texture?.src || actor?.prototypeToken?.texture?.src || actor?.img || "icons/svg/mystery-man.svg";
}
// Is this target currently taken in by the caster's active seeming? Reads the caster's phantom
// copy's per-observer belief ledger (phantomBelief.fooled — token-doc uuids written by the sweep).
// Powers the `whenTargetFooled` damage-rider condition (Spearing Beak "+1d6 against a character
// who is taken in by the seeming", 07-16). Pure decision separated + pinned in tests/.
function edhaTargetFooledIn(belief, tokenUuids) {
  const fooled = new Set((belief?.fooled || []).map(r => r?.uuid).filter(Boolean));
  return (tokenUuids || []).some(u => fooled.has(u));
}
// Copy ownership is TOKEN-KEYED when both sides know their token (07-16, Ben: "we need a per-bird
// seeming" — unlinked adversary tokens can share one world actor id, so actor-id keying made two
// Mistherons share the max-1 slot). Actor-id fallback covers tokenless casters and pre-16 copies.
// Pure decision — pinned in tests/.
function edhaPhantomOwnedBy(copyFlags, casterTokUuid, casterId) {
  const ct = copyFlags?.phantomCasterTok ?? null;
  if (ct && casterTokUuid) return ct === casterTokUuid;
  return copyFlags?.summoner === casterId;
}
function edhaPhantomCopiesOf(caster) {
  const tokUuid = edhaCasterToken(caster)?.document?.uuid ?? null;
  return game.actors?.filter(a => a.getFlag?.("edha-content", "phantomDouble")
    && edhaPhantomOwnedBy(a.flags?.["edha-content"] ?? {}, tokUuid, caster.id)) ?? [];
}
function edhaTargetFooled(caster, target) {
  try {
    if (!caster || !target) return false;
    const tokUuids = (target.getActiveTokens?.() ?? []).map(t => t?.document?.uuid);
    const copy = edhaPhantomCopiesOf(caster)[0];
    if (copy && edhaTargetFooledIn(copy.getFlag("edha-content", "phantomBelief"), tokUuids)) return true;
    // Ambush-belief ledger (07-19): the lightweight seeming (Thrown Voice / Causeway Seeming) writes
    // per-target belief on the CASTER itself — no phantom copy involved.
    return edhaAmbushFooledIn(caster.getFlag?.("edha-content", "ambushBelief"), canvas?.scene?.id ?? null, tokUuids);
  } catch (e) { return false; }
}

// Max-one sustain for Phantom Double — PER CASTER TOKEN (07-16): drop this token's existing
// illusion before making a new one; a second bird's cast no longer clears the first bird's copy.
// TOKEN-FIRST (bench 07-17): deleting only the ACTOR leaves the copy's token ORPHANED on the
// scene — Foundry never cascades actor→token — so a recast stacked its new token exactly on the
// leftover and read as "no new token created". That lesson is now the shared
// `edhaDeleteActorWithTokens` primitive (07-27q), after bench run 13 found three OTHER sites that
// had each open-coded the wrong half of it; the deleteActor hook restores original visibility.
async function edhaClearPhantomDoubles(caster) {
  for (const a of edhaPhantomCopiesOf(caster)) await edhaDeleteActorWithTokens(a);
}

/* --- The illusion belief loop (Phantom Double / The Seeming rework, Ben 07-14) -------------------
 * Spec: the copy (1 HP, dies on any hit, max 1) appears ADJACENT to the duplicated creature; every
 * enemy that can SEE it tests Perception vs the CASTER's Cognitive defense (engine-rolled — iron
 * rule 3). Failure = only the copy is real to them; success = the copy is empty air. Copy dying or
 * being deleted restores everything. No advantage rider (dropped, Ben 07-14).
 * Visibility is a CLIENT VEIL (Ben 07-14 — one PC per computer, GM on his own machine): each
 * player's client filters its own canvas through the belief flag via a Token#isVisible wrap
 * (see "The client veil" block below) — fooled players don't render the ORIGINAL, seers don't
 * render the COPY, the GM renders everything; no token document is ever hidden. Observers that
 * are GM-run (a PC cast it) need no veil — the GM accounting card carries who's fooled.
 * The sweep runs on the ACTIVE GM's client via createToken (summons can materialize through the GM
 * relay, so the caster's client may never see the token). Late viewers: the GM card's re-test
 * button rolls only the not-yet-tested. */
/* 2bAA — every dial arrives from the talent's `edha-illusion-copy` rule; `source` is the RULE's
 * label (blank = the item's own name), which is what the copy stamps as phantomSource and what the
 * break cue, the veil card and the fooled-target rider all read back. No talent name in here. */
async function edhaCastPhantomDouble(caster, dup, h = {}) {
  await edhaClearPhantomDoubles(caster);
  const dupTok = edhaCasterToken(dup);
  const def = String(h.beliefDefense || "cog").trim() || "cog";
  const skill = String(h.beliefSkill || "prc").trim() || "prc";
  const source = String(h.source || "").trim() || "Illusion";
  const pen = Number.isFinite(Number(h.defensePenalty)) ? Number(h.defensePenalty) : 99;
  const dc = Number(caster.system?.defenses?.[def]?.value ?? caster.system?.defenses?.[def]?.override) || 10;
  await edhaSummon(caster, {
    name: `${dup.name} (Illusion)`, img: edhaTokenArt(dup),
    /* R-31 (Ben 2026-09-06 (a)): the TOKEN label is veiled ONLY when an ADVERSARY casts it. The
     * Seeming's whole point is that the fooled onlooker cannot tell the copy from the original, so
     * an NPC's copy keeps the plain name they read on the canvas. No veil applies in the PC
     * direction — a player's own Phantom Double has nobody at the table to fool, and an unlabelled
     * second token is just a decoy they lose track of — so a CHARACTER's copy is labelled.
     * The discriminator is the CASTER's document type, never a talent name (iron rule 2b). */
    tokenName: `${dupTok?.name ?? dup.name}${caster?.type === "character" ? " (Illusion)" : ""}`,
    displayName: dupTok?.document?.displayName,   // hover-name behaves exactly like the real token (bench 07-17)
    hpFormula: String(h.hpFormula || "1"), speed: Number(h.speed) || 0, defensePenalty: pen,
    anchorTok: dupTok ?? undefined,
    disposition: dupTok?.document?.disposition,
    extraFlags: { phantomDouble: true, phantomOf: dupTok?.document?.uuid ?? null, phantomDC: dc, phantomSkill: skill, phantomSource: source,
      phantomCasterTok: edhaCasterToken(caster)?.document?.uuid ?? null },   // per-token ownership (07-16)
  });
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: caster }), content: `<p>🌫️ <strong>${source}</strong> (${caster.name}): ${h.note || `an illusory copy of ${dup.name} appears beside them — any hit breaks it. Belief tests roll on the GM's side.`}</p>` });
}
async function edhaPhantomBeliefSweep(copyDoc, { initial = false } = {}) {
  try {
    const copyActor = copyDoc?.actor; if (!copyActor) return;
    const dc = Number(copyActor.getFlag("edha-content", "phantomDC")) || 10;
    const skill = String(copyActor.getFlag("edha-content", "phantomSkill") || "prc").trim() || "prc";
    const sklab = edhaSkillLabel(skill);   // 07-27f: printed the raw i18n key in all three belief cards
    const source = copyActor.getFlag("edha-content", "phantomSource") || "Illusion";
    const belief = foundry.utils.deepClone(copyActor.getFlag("edha-content", "phantomBelief") || { fooled: [], saw: [] });
    const tested = new Set([...belief.fooled, ...belief.saw].map(r => r.uuid));
    const copyTok = copyDoc.object ?? canvas?.tokens?.get?.(copyDoc.id); if (!copyTok) return;
    const disp = copyDoc.disposition;
    const fresh = (canvas?.tokens?.placeables ?? []).filter(t =>
      t.id !== copyDoc.id && t.actor && edhaSideHostile(t.document?.disposition, disp)
      && !tested.has(t.document.uuid) && edhaCanSee(t, copyTok));
    const gmIds = edhaGmIds();   // R-62: belief-sweep record card (results + a not-urgent retest button) → all GMs, was active-only (🤖 bench row: audience flip)
    if (!fresh.length && initial) {
      ChatMessage.create({ whisper: gmIds, content: `<div class="edha-trigger-card"><p>🌫️ <strong>${source}</strong> — no enemy can see the copy yet (DC ${dc}). Re-test when one does:</p><button type="button" class="edha-illusion-retest" data-edha-copy="${copyActor.uuid}">Re-test viewers</button></div>` });
      return;
    }
    for (const t of fresh) {
      const sk = t.actor.system?.skills?.[skill];
      const mod = edhaDerivedNum(sk?.mod, Number(sk?.rank) || 0);   // `.mod` is a DerivedValueField OBJECT — 07-27y
      const roll = await (new Roll(`1d20 + ${mod}`)).evaluate();
      const fooled = roll.total < dc;
      (fooled ? belief.fooled : belief.saw).push({ uuid: t.document.uuid, name: t.name, total: roll.total, player: !!t.actor.hasPlayerOwner });
      if (t.actor.hasPlayerOwner) {   // each player learns only their own character's truth
        const ids = (game.users?.filter(u => u.active && !u.isGM && t.actor.testUserPermission?.(u, "OWNER")) ?? []).map(u => u.id);
        if (ids.length) ChatMessage.create({ whisper: ids, content: fooled
          ? `<p>🌫️ <strong>${t.name}</strong> (${sklab} ${roll.total}) is taken in — <strong>${copyDoc.name}</strong> looks completely real.</p>`
          : `<p>👁️ <strong>${t.name}</strong> (${sklab} ${roll.total}) sees through it — <strong>${copyDoc.name}</strong> is empty air.</p>` });
      }
    }
    // Visibility is CLIENT-VEILED (Ben 07-14: one PC per computer, GM on his own machine): the
    // belief flag written here is read by edhaPhantomClientHidden on every player's client —
    // fooled players' clients don't render the ORIGINAL, seers' clients don't render the COPY,
    // the GM renders everything. No token document is ever actually hidden.
    await copyActor.setFlag("edha-content", "phantomBelief", belief);
    const row = r => `<li>${r.name}: ${sklab} ${r.total} vs ${dc}</li>`;
    ChatMessage.create({ whisper: gmIds, content: `<div class="edha-trigger-card"><p>🌫️ <strong>${source}</strong> — belief vs DC ${dc}:</p>`
      + (belief.fooled.length ? `<p><strong>Fooled</strong> (their client shows only the copy):</p><ul>${belief.fooled.map(row).join("")}</ul>` : "")
      + (belief.saw.length ? `<p><strong>See through it</strong> (their client shows only the original):</p><ul>${belief.saw.map(row).join("")}</ul>` : "")
      + `<button type="button" class="edha-illusion-retest" data-edha-copy="${copyActor.uuid}">Re-test new viewers</button></div>` });
    ChatMessage.create({ content: `<p>🌫️ <strong>${source}</strong>: ${belief.fooled.length + belief.saw.length} onlooker(s) tested — ${belief.fooled.length} taken in, ${belief.saw.length} see through it.</p>` });
  } catch (e) { console.error("Edha Content | phantom belief sweep failed", e); }
}
async function edhaIllusionRetestClick(ev) {
  try {
    ev.preventDefault();
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: the belief re-test is GM-side."); return; }
    const copyActor = await fromUuid(ev.currentTarget.dataset.edhaCopy).catch(() => null);
    const doc = edhaCasterToken(copyActor)?.document; if (!doc) { ui.notifications?.warn("Edha: the illusion's token is gone."); return; }
    await edhaPhantomBeliefSweep(doc);
  } catch (e) { edhaClickFailed("illusion re-test", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-illusion-retest"] (Job 1, pass 5.3, end of file).
// The sweep entry point: illusions can materialize on the GM client via the summon relay, so the
// ACTIVE GM's client owns the belief roll (works for GM-cast adversary seemings too).
Hooks.on("createToken", (doc, options, userId) => {
  try {
    if (game.user !== game.users?.activeGM) return;
    if (!doc.actor?.getFlag?.("edha-content", "phantomDouble")) return;
    setTimeout(() => { void edhaPhantomBeliefSweep(doc, { initial: true }); }, 250);   // let the placeable land for LOS
  } catch (e) { /* non-fatal */ }
});
// Break/restore: the copy dying (HP-sync deletes it) or being deleted by hand un-hides the
// original and announces the break. Guard set: deleteToken may cascade into deleteActor.
const _edhaPhantomRestored = new Set();
async function edhaPhantomRestore(copyActor) {
  if (_edhaPhantomRestored.has(copyActor.id)) return;
  _edhaPhantomRestored.add(copyActor.id);
  try {
    // Nothing to un-hide — the veil is client-side and dies with the copy's flags; announce only.
    ChatMessage.create({ content: `<p>🌫️ <strong>${copyActor.getFlag("edha-content", "phantomSource") || "Illusion"}</strong>: the illusion breaks — the real one stands plainly seen.</p>` });
    // Seeming-break GM cues (07-16): the summoner's own reactions to its copy breaking (Fade).
    // Resolve the CASTER TOKEN first (per-bird — unlinked tokens share a world actor id); the
    // token's synthetic actor carries the right name and per-token cue gates.
    const casterTokUuid = copyActor.getFlag("edha-content", "phantomCasterTok");
    const summoner = (await edhaResolveActorRef(casterTokUuid)) ?? game.actors?.get(copyActor.getFlag("edha-content", "summoner")) ?? null;
    if (summoner) for (const { item, h } of edhaCueRules(summoner, "seeming-break")) await edhaPostCueCard(summoner, item, h);
  } catch (e) { console.error("Edha Content | phantom restore failed", e); }
}
Hooks.on("deleteActor", (actor) => {
  try {
    if (actor.getFlag?.("edha-content", "phantomDouble")) canvas?.perception?.update?.({ refreshVision: true });   // every client drops its veil
    if (game.user !== game.users?.activeGM) return;
    if (actor.getFlag?.("edha-content", "phantomDouble")) void edhaPhantomRestore(actor);
  } catch (e) { /* non-fatal */ }
});
Hooks.on("deleteToken", (doc) => {
  try {
    const a = doc.actor;
    if (a?.getFlag?.("edha-content", "phantomDouble")) canvas?.perception?.update?.({ refreshVision: true });
    if (game.user !== game.users?.activeGM) return;
    // Announce/restore only — the ACTOR deletion belongs to the generic last-token summon cleanup
    // (phantom copies are summons); a second delete here raced it into server-side
    // "Actor does not exist" errors (Ben's 07-17 log, 22:29:04), and `void a.delete()` inside
    // try/catch can't even catch its own async rejection.
    if (a?.getFlag?.("edha-content", "phantomDouble")) void edhaPhantomRestore(a);
  } catch (e) { /* non-fatal */ }
});

/* --- The client veil (Ben 07-14: one PC per computer, GM on his own) -----------------------------
 * True per-viewer visibility: each PLAYER client filters its own canvas through the belief flag —
 * a fooled player's client does not render the ORIGINAL token; a seer's client does not render
 * the COPY; the GM client renders everything. Implemented as a wrap of the Token#isVisible getter
 * (walks the proto chain for the descriptor); no token document is ever hidden, so nothing can
 * desync — the veil lives and dies with the copy's flags. */
// PURE (pinned in tests/): should a client owning `ownedUuids` observer-tokens hide `tokUuid`?
function edhaPhantomVeilHides(belief, ownedUuids, tokUuid, origUuid, copyTokUuid) {
  const owned = new Set(ownedUuids || []);
  const mineFooled = (belief?.fooled || []).some(r => owned.has(r.uuid));
  const mineSaw = (belief?.saw || []).some(r => owned.has(r.uuid));
  if (mineFooled && !mineSaw && !!origUuid && tokUuid === origUuid) return true;   // fooled: the original doesn't exist for you
  if (mineSaw && tokUuid === copyTokUuid) return true;                             // saw through: the copy is empty air
  return false;
}
function edhaPhantomClientHidden(tok) {
  try {
    if (!canvas?.ready || game.user?.isGM) return false;
    const tokUuid = tok?.document?.uuid; if (!tokUuid) return false;
    for (const c of canvas.tokens?.placeables ?? []) {
      const belief = c.actor?.getFlag?.("edha-content", "phantomBelief");
      if (!belief) continue;
      const ownedUuids = [...(belief.fooled || []), ...(belief.saw || [])].map(r => r.uuid).filter(u => {
        try { return !!fromUuidSync(u)?.actor?.testUserPermission?.(game.user, "OWNER"); } catch (e) { return false; }
      });
      if (edhaPhantomVeilHides(belief, ownedUuids, tokUuid, c.actor.getFlag("edha-content", "phantomOf"), c.document.uuid)) return true;
    }
    return false;
  } catch (e) { return false; }
}
Hooks.once("init", function edhaPatchPhantomVeil() {
  try {
    const TokenCls = foundry.canvas?.placeables?.Token ?? globalThis.Token;
    let proto = TokenCls?.prototype, desc = null;
    while (proto && !desc) { desc = Object.getOwnPropertyDescriptor(proto, "isVisible"); if (!desc) proto = Object.getPrototypeOf(proto); }
    if (!desc?.get) { console.warn("Edha Content | Token#isVisible getter not found — phantom client veil disabled (belief cards still work)"); return; }
    const orig = desc.get;
    Object.defineProperty(TokenCls.prototype, "isVisible", {
      configurable: true,
      get: function () { if (edhaPhantomClientHidden(this)) return false; if (edhaSenseRevealShows(this)) return true; return orig.call(this); },
    });
  } catch (e) { console.error("Edha Content | phantom veil patch failed", e); }
});
// Belief changed (sweep/re-test wrote the flag) → every client re-evaluates its veil.
Hooks.on("updateActor", (actor, changes) => {
  try {
    if (!actor.getFlag?.("edha-content", "phantomDouble")) return;
    if (foundry.utils.getProperty(changes, "flags.edha-content.phantomBelief") === undefined) return;
    canvas?.perception?.update?.({ refreshVision: true });
  } catch (e) { /* non-fatal */ }
});

/* --- `edha-illusion-upkeep` (2bAA — was the name-keyed Living Image block) ----------------------
 * At the owner's turn start, while they have living summoned illusions, whisper the upkeep prompt
 * with a one-click payment. CONFIG-ONLY, and legitimately so: this sweep is the reader (the
 * pass-Y/Z veto shape). Living Image's own use is a `spe` activation whose whole payload was a
 * reminder — that is an authored `edha-note` now, so the upkeep was never the use's payload.
 * Every dial is a field: which resource, how much per illusion, and the table-call clause. The
 * sweep consults the RULE (edhaActorRuleOf), so it names no talent and a rename cannot unwire it. */
Hooks.on("combatTurnChange", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one client posts
    const a = combat?.combatant?.actor; if (!a) return;
    const rule = edhaActorRuleOf(a, "edha-illusion-upkeep"); if (!rule) return;
    const h = rule.handler;
    const ills = game.actors?.filter(x => x.getFlag?.("edha-content", "summon") && x.getFlag?.("edha-content", "summoner") === a.id
      && (Number(x.system?.resources?.hea?.value) || 0) > 0) ?? [];
    if (!ills.length) return;
    const cost = Math.max(1, Math.floor(Number(h.costPer)) || 1), res = String(h.resource || "inv").trim() || "inv";
    const rlab = EDHA_RES_LABEL[res] || res;
    const ids = (game.users?.filter(u => u.active && (u.isGM || a.testUserPermission?.(u, "OWNER"))) ?? []).map(u => u.id);
    ChatMessage.create({ whisper: ids, speaker: ChatMessage.getSpeaker({ actor: a }),
      content: `<div class="edha-trigger-card"><p>🎭 <strong>${rule.item.name}</strong> (${a.name}) — turn start with ${ills.length} illusion(s) up (${ills.map(i => i.name).join(", ")}): <strong>${cost} ${rlab} per ${h.qualifier || "COMPLEX"} illusion</strong> to maintain.${h.note ? ` ${h.note}` : ""}</p><button type="button" class="edha-upkeep-inv-btn" data-actor="${a.uuid}" data-item="${rule.item.uuid}">Pay ${cost} ${rlab}</button></div>` });
  } catch (e) { /* non-fatal */ }
});
async function edhaUpkeepInvClick(ev) {
  try {
    ev.preventDefault();
    // ⚠ CAPTURE THE BUTTON BEFORE THE FIRST await. `ev.currentTarget` is only set while the event is
    // being DISPATCHED, and an await ends dispatch — the browser then nulls it, so any later
    // `ev.currentTarget.…` throws TypeError. Bench runs 20–23 read this as "the Pay button charges
    // nothing, for any user, ever": the read below threw every time and the outer catch swallowed it.
    // The ELEMENT reference is fine to hold across an await; only the event's pointer to it is not.
    const btn = ev.currentTarget, ds = btn.dataset;
    const a = await edhaResolveActorRef(ds.actor); if (!a) return;
    // The button carries its DOCUMENT: cost and resource come off the rule that posted it.
    const tal = ds.item ? await fromUuid(ds.item).catch(() => null) : null;
    const h = (tal ? edhaRuleOf(tal, "edha-illusion-upkeep") : null) ?? edhaActorRuleOf(a, "edha-illusion-upkeep")?.handler ?? {};
    const cost = Math.max(1, Math.floor(Number(h.costPer)) || 1), res = String(h.resource || "inv").trim() || "inv";
    const rlab = EDHA_RES_LABEL[res] || res;
    const cur = Number(a.system?.resources?.[res]?.value) || 0;
    if (cur < cost) { ui.notifications?.warn(`Edha: ${a.name} has no ${rlab} left to pay upkeep.`); return; }
    await edhaSpendResource(a, res, cost);
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<p>🎭 <strong>${tal?.name || "Upkeep"}</strong>: ${a.name} pays ${cost} ${rlab} of upkeep (${cur - cost} left).</p>` });
  } catch (e) { edhaClickFailed("illusion upkeep", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-upkeep-inv-btn"] (Job 1, pass 5.3, end of file).

// Ghostly Walls + Redirect Momentum moved onto their documents 07-24p (iron rule 2b) — both are
// `edha-def-test` (blue vs cog / blue vs the mover's Athletics). Ghostly Walls' Immobilize is a
// sibling `edha-triggered-effect` on edha-test-success, and ABSOLUTE STILLNESS's extra Weakened is a
// second one gated `whenOwnsTalent: "Absolute Stillness"` — which is how a pure upgrade talent leaves
// the ratchet without a document of its own (declared in this tree's header below).
// The manual "Immobilize" fallback button went with them: H1 fails OPEN on an unreadable defense, so
// the case the button existed for (no readable Cognitive defense) now auto-succeeds instead.

/* --- H22 `edha-barrier` (2bAA) — the engine's FIRST blocks-movement capability ------------------
 * Phantom Barricade's card promises three things and the engine delivered none of them: a barrier
 * placed AT A POINT in Attunement Range, that BLOCKS MOVEMENT, and that PROVIDES COVER. What
 * shipped was a one-square token, spawned beside the caster, that anyone could walk straight
 * through. The card is the SPEC (§9m q11), so this builds what it says.
 *
 * THE EXPRESSION, declared. The HP-bearing summon token STAYS — "health equal to 2[Die] … until
 * destroyed" needs a thing with health — and a box of four Foundry WALL segments is raised around
 * its square. Walls are the only thing in Foundry that actually stops a token moving, and they are
 * GM-create-only, so a player relays (`barrier-walls`, the foundation-place shape). Walls carry a
 * `barrierId` that the summon carries too, which is what pairs them: the token cannot hold the
 * wall ids, because a relayed summon materializes on the GM's client and the caster never sees it.
 *
 * COVER STAYS A TABLE READ. That is the standing project ruling and it still stands (it is the
 * same one the dark-veil sweep honours), so `blocksSight` ships "none" — a shimmering illusion is
 * seen through — and the rule's note tells the table the barricade grants cover. The field is
 * there if a barrier should block line of sight; nothing else has to change.
 *
 * An OCCUPIED square is refused and REFUNDED. A closed wall box around a creature would trap it,
 * and no reading of the card asks for that.
 *
 * ENGINE_OWNED (declared, rule-keyed — the edha-decree exit shape): the picker, the wall documents
 * and their GM relay + lifecycle are canvas work no rule chain expresses (§9o). Every dial is a
 * field on Phantom Barricade's own rule. */
// PURE (pinned in tests/): the four wall segments of a box of side `sizePx` centred on (x, y),
// as Foundry `c` arrays [x0, y0, x1, y1], walked clockwise from the top-left corner.
function edhaBarrierSegments(x, y, sizePx) {
  const h = Math.max(1, Math.round(Number(sizePx) || 0)) / 2;
  const l = Math.round(x - h), r = Math.round(x + h), t = Math.round(y - h), b = Math.round(y + h);
  return [[l, t, r, t], [r, t, r, b], [r, b, l, b], [l, b, l, t]];
}
async function edhaBarrierWallsGM(p) {
  try {
    const scene = game.scenes?.get(p?.sceneId) ?? canvas?.scene; if (!scene || !p?.barrierId) return;
    const sense = Number(p.sense) || CONST.WALL_SENSE_TYPES.NONE;
    await scene.createEmbeddedDocuments("Wall", edhaBarrierSegments(p.x, p.y, p.sizePx).map(c => ({
      c, move: Number(p.move) || CONST.WALL_MOVEMENT_TYPES.NONE, sight: sense, light: sense,
      sound: CONST.WALL_SENSE_TYPES.NONE,
      flags: { "edha-content": { barrierId: p.barrierId } },
    })));
  } catch (e) { console.error("Edha Content | barrier walls failed", e); }
}
async function edhaBarrierClearGM(barrierId) {
  try {
    if (!barrierId) return;
    for (const scene of (game.scenes ?? [])) {
      const dead = (scene.walls ?? []).filter(w => w.getFlag?.("edha-content", "barrierId") === barrierId);
      if (dead.length) await scene.deleteEmbeddedDocuments("Wall", dead.map(w => w.id));
    }
  } catch (e) { console.error("Edha Content | barrier clear failed", e); }
}
function edhaBarrierRelay(action, payload) {
  if (game.user?.isGM) return action === "barrier-walls" ? edhaBarrierWallsGM(payload) : edhaBarrierClearGM(payload?.barrierId);
  if (!game.users?.activeGM) { ui.notifications?.warn("Edha: a GM must be online to raise or clear a barrier."); return null; }
  try { game.socket.emit("module.edha-content", { action, payload }); } catch (e) {}
  return null;
}
Hooks.once("ready", () => {
  try {
    game.socket.on("module.edha-content", async (data) => {
      if (!edhaDefBuffGmGate()) return;   // exactly one GM applies
      if (data?.action === "barrier-walls") await edhaBarrierWallsGM(data.payload);
      else if (data?.action === "barrier-clear") await edhaBarrierClearGM(data.payload?.barrierId);
    });
  } catch (e) {}
});
async function edhaPlaceBarrier(item, h) {
  try {
    const owner = item?.actor; if (!owner) return;
    const scene = canvas?.scene;
    const pt = await edhaPickPlacement(item, { color: h.rangeColor || "", rangeFt: h.rangeFt });
    if (!pt) return;                                            // cancelled / out of range — refunded
    const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
    if ((canvas?.tokens?.placeables ?? []).some(t => t.actor && Math.hypot((t.center?.x ?? 0) - pt.x, (t.center?.y ?? 0) - pt.y) < gs / 2)) {
      edhaRefundCost(item);
      ui.notifications?.warn(`Edha: something is standing there — ${item.name} would wall it in. Cost refunded.`);
      return;
    }
    const sizeFt = Number(h.sizeFt) > 0 ? Number(h.sizeFt) : gd;
    const barrierId = foundry.utils.randomID();
    await edhaSummon(owner, {
      name: h.barrierName || item.name, img: h.img, talentName: item.name, at: pt,
      hpFormula: h.hpFormula || "(@tier)d6", speed: 0,
      defensePenalty: Number.isFinite(Number(h.defensePenalty)) ? Number(h.defensePenalty) : 99,
      tokenSizeFt: sizeFt, actsAfterCaster: false,
      extraFlags: { barrierId },
    });
    const SENSE = { none: CONST.WALL_SENSE_TYPES.NONE, limited: CONST.WALL_SENSE_TYPES.LIMITED, normal: CONST.WALL_SENSE_TYPES.NORMAL };
    await edhaBarrierRelay("barrier-walls", {
      sceneId: scene?.id, barrierId, x: pt.x, y: pt.y, sizePx: (sizeFt / gd) * gs,
      move: h.blocksMovement === false ? CONST.WALL_MOVEMENT_TYPES.NONE : CONST.WALL_MOVEMENT_TYPES.NORMAL,
      sense: SENSE[String(h.blocksSight || "none")] ?? CONST.WALL_SENSE_TYPES.NONE,
    });
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<p>🛡️ <strong>${item.name}</strong> (${owner.name}): a ${sizeFt} ft barrier goes up${h.blocksMovement === false ? "" : " — nothing moves through it"}${String(h.blocksSight || "none") !== "none" ? " and it blocks line of sight" : ""}. ${h.note || "It stands until the scene ends or it is destroyed."}</p>` });
  } catch (e) { console.error("Edha Content | place barrier failed", e); }
}
// The barrier's walls die with it: destroyed (the HP-zero branch in the defeated sweep), deleted by
// hand, or cleared at the end of the encounter — "for the scene", the deleteCombat convention every
// other placement tree uses.
// One applier (07-27q) — the wall delete is a world write, and the socket relay that reaches the
// same helper is already activeGM-gated; these two were the only doors into it that were not.
Hooks.on("deleteActor", (actor) => {
  try { const id = actor?.getFlag?.("edha-content", "barrierId"); if (id && edhaDefBuffGmGate()) void edhaBarrierClearGM(id); } catch (e) {}
});
Hooks.on("deleteToken", (doc) => {
  try { const id = doc?.actor?.getFlag?.("edha-content", "barrierId"); if (id && edhaDefBuffGmGate()) void edhaBarrierClearGM(id); } catch (e) {}
});
Hooks.on("deleteCombat", (combat) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier (07-27b — the 2bW-13 family)
    const guard = edhaCombatEndGuard(combat);   // ⛑ cross-combat clobber guard
    void (async () => {
      const kept = [];
      for (const a of (game.actors?.filter(x => x.getFlag?.("edha-content", "barrierId")) ?? [])) {
        // The barrier summon is the CASTER's prop: it survives if its caster is still fighting.
        const owner = game.actors?.get?.(a.getFlag?.("edha-content", "summoner")) ?? null;
        if (edhaStillFightingElsewhere(a, guard) || edhaStillFightingElsewhere(owner, guard)) { kept.push(a.getFlag("edha-content", "barrierId")); continue; }
        await edhaBarrierClearGM(a.getFlag("edha-content", "barrierId"));
        await edhaDeleteActorWithTokens(a);        // the scene-end door had the same orphan-token bug
      }
      for (const scene of (game.scenes ?? [])) {   // strays whose actor is already gone
        const dead = (scene.walls ?? []).filter(w => { const id = w.getFlag?.("edha-content", "barrierId"); return id && !kept.includes(id); });
        if (dead.length) await scene.deleteEmbeddedDocuments("Wall", dead.map(w => w.id));
      }
    })();
  } catch (e) { console.error("Edha Content | clear barriers failed", e); }
});

