/* ============================================================================================
 * INJURIES (shared primitive, backlog 9a) — mint an injury Item on a target, either rolled off
 * the world's injury RollTable or typed in directly. One implementation for every talent that
 * inflicts a lasting wound, and for the GM applying one by hand.
 * The cross-actor path matters: a player cannot create an item on someone else's actor, so
 * edhaCreateItemCross relays to the GM while edhaCreateItemDocs is the direct write. The
 * EDHA_INJURY_FALLBACK list keeps the tool working in a world that has no table yet.
 * Owns: EDHA_INJURY_FALLBACK · edhaFindInjuryTable · edhaCreateItemDocs · edhaCreateItemCross ·
 *   edhaAddInjury.
 * ============================================================================================ */

/* --- Loot: cache tokens + defeated-adversary search (item 34b, 2026-09-06; design from PR #103,
 * Ben-approved 2026-07-18 / 2026-09-05) --------------------------------------------------------
 * Ben: "I can paint a chest on the battlemap — how do we make it accessible by the players?"
 * A loot CACHE is a world adversary-type actor flagged `edha-content.lootCache` — the GM mints one
 * with `edha.createLootCache("name")`, stocks it by dragging items onto its sheet (fully
 * Foundry-editable), and places its LINKED chest token over the painted chest. A player
 * DOUBLE-CLICKS the cache token — or a DEFEATED adversary's token (HP ≤ 0 or the Dead status =
 * searching the body) — with one of their own tokens within EDHA_LOOT_REACH_FT and gets a whispered
 * contents card. Each Take button relays through the `loot-take` socket action (EDHA_SOCKET_ACTIONS):
 * the primary GM client is the SINGLE WRITER, and `edhaLootClaim` (a synchronous test-and-set,
 * taken BEFORE the first await) is the double-loot guard — two players clicking the same blade
 * yield exactly one winner even when the two relays interleave on the GM's event loop. The winner's
 * take deletes the item from the source and creates it on the taker, then posts a public card.
 * Adversary ownership NEVER opens up (the cache is `ownership.default: 0`, bodies keep theirs; the
 * intercept returns before Foundry's sheet render). Natural weapons (`alwaysEquipped`, item 34a)
 * are not lootable from a body; traits/actions/talents are never loot. Generic: no talent or
 * adversary name anywhere in this block (iron rule 2b). */
const EDHA_LOOT_REACH_FT = 5;                        // max edge-to-edge gap looter-token → source-token
const EDHA_LOOT_CACHE_IMG = "icons/svg/chest.svg";   // verified present on Foundry v13.351 (resources/app/public/icons/svg/chest.svg)
const EDHA_LOOT_GEAR_TYPES = ["weapon", "equipment", "loot"];

// PURE (pinned): which of a source's items can be taken? Gear only; a BODY keeps its alwaysEquipped
// natural weapons (the hound keeps its Bite), a CACHE gives up everything gear-typed on it.
function edhaLootableItems(items, { cache = false } = {}) {
  return (items || []).filter(i => {
    if (!EDHA_LOOT_GEAR_TYPES.includes(i?.type)) return false;
    if (!cache && i.type === "weapon" && i.system?.alwaysEquipped === true) return false;
    return true;
  });
}
// PURE (pinned): is this actor defeated? HP ≤ 0, or the system's DEFEATED status (the Dead marker).
function edhaLootDefeated(actor) {
  if (!actor) return false;
  const hp = Number(actor.system?.resources?.hea?.value);
  if (Number.isFinite(hp) && hp <= 0) return true;
  const dead = CONFIG.specialStatusEffects?.DEFEATED || "dead";
  return !!actor.statuses?.has?.(dead);
}
// PURE (pinned): is this actor a loot source, and which kind? The cache flag wins; a defeated
// adversary is a searchable "body"; a downed PC (or a live adversary) is never lootable.
function edhaLootSourceKind(actor) {
  if (!actor) return null;
  if (actor.getFlag?.("edha-content", "lootCache") || actor.flags?.["edha-content"]?.lootCache) return "cache";
  if (actor.type === "adversary" && edhaLootDefeated(actor)) return "body";
  return null;
}
// PURE (pinned): edge-to-edge gap in ft between two token rects {x, y, w, h} (center px, size in
// grid squares) on a grid of `pxPerFt` px per foot and `gd` ft per square.
function edhaLootGapFt(a, b, { pxPerFt = 20, gd = 5 } = {}) {
  const ft = Math.hypot(a.x - b.x, a.y - b.y) / pxPerFt;
  const half = t => Math.max(t.w || 1, t.h || 1) * gd / 2;
  return Math.max(0, ft - half(a) - half(b));
}
// PURE (pinned): may this looter reach the source? `gapFt` from edhaLootGapFt.
function edhaLootInReach(gapFt, reachFt = EDHA_LOOT_REACH_FT) { return Number.isFinite(gapFt) && gapFt <= reachFt; }
// PURE (pinned): the take-guard's decision. `ledger` is a Set of claimed "<srcUuid>|<itemId>" keys;
// the FIRST claim of a key wins (true), every later claim loses (false). Synchronous on purpose —
// it runs before the GM handler's first await, so two interleaved relays cannot both pass.
function edhaLootClaim(ledger, srcUuid, itemId) {
  const key = `${srcUuid}|${itemId}`;
  if (ledger.has(key)) return false;
  ledger.add(key);
  return true;
}
function edhaLootRelease(ledger, srcUuid, itemId) { ledger.delete(`${srcUuid}|${itemId}`); }
const EDHA_LOOT_CLAIMS = new Set();   // the GM client's claim ledger (per session; a taken item's id never comes back)
// PURE (pinned): the takeable list for the contents card — one row per lootable item, in item order.
function edhaLootRows(items, { cache = false } = {}) {
  return edhaLootableItems(items, { cache }).map(i => {
    const qty = Number(i.system?.quantity) || 1;
    return { id: i.id, name: i.name, qty, label: `${i.name}${qty > 1 ? ` ×${qty}` : ""}` };
  });
}
// Live geometry: the token rect edhaLootGapFt wants.
function edhaLootRect(tok) { return { x: tok.center.x, y: tok.center.y, w: tok.document?.width || 1, h: tok.document?.height || 1 }; }
// The clicking user's nearest owned token within reach of the source, or null.
function edhaLootMyTokenNear(srcTok) {
  let best = null, bestGap = Infinity;
  const opts = { pxPerFt: edhaPxPerFt(), gd: canvas?.scene?.grid?.distance || 5 };
  for (const t of (canvas?.tokens?.placeables ?? [])) {
    if (t === srcTok || !t.actor?.isOwner || t.document?.hidden) continue;
    let g = Infinity;
    try { g = edhaLootGapFt(edhaLootRect(t), edhaLootRect(srcTok), opts); } catch (e) {}
    if (g < bestGap) { best = t; bestGap = g; }
  }
  return best && edhaLootInReach(bestGap) ? best : null;
}
// Player double-clicked a token: if it's a loot source, post the contents card instead of the
// (permission-blocked) sheet. Returns true when handled. A GM double-click keeps the normal sheet —
// that's how a cache gets stocked.
function edhaLootTryOpen(tok) {
  const actor = tok?.actor;
  const kind = edhaLootSourceKind(actor);
  if (!kind || game.user?.isGM) return false;
  const name = tok.document?.name ?? actor.name;
  if (!edhaLootMyTokenNear(tok)) {
    ui.notifications?.warn(`Edha: move within ${EDHA_LOOT_REACH_FT} ft to ${kind === "cache" ? "open" : "search"} ${name}.`);
    return true;
  }
  const rows = edhaLootRows([...(actor.items ?? [])], { cache: kind === "cache" });
  if (!rows.length) { ui.notifications?.info(`Edha: ${name} — nothing worth taking.`); return true; }
  const src = tok.document.uuid;
  const btns = rows.map(r => `<button type="button" class="edha-loot-btn" data-edha-src="${src}" data-edha-item="${r.id}">${r.label}</button>`);
  ChatMessage.create({
    whisper: [...new Set([game.user.id, ...edhaGmIds()])],
    speaker: ChatMessage.getSpeaker({ token: tok.document }),
    content: `<div class="edha-trigger-card"><p>${kind === "cache" ? "🧰" : "🎒"} <strong>${kind === "cache" ? name : `Searching ${name}`}</strong> — take:</p>${btns.join(" ")}</div>`,
  });
  return true;
}
// Who receives the item: the user's selected owned token's actor, else their assigned character.
function edhaLootTakerActor() {
  const ctl = (canvas?.tokens?.controlled ?? []).find(t => t.actor?.isOwner);
  return ctl?.actor ?? game.user?.character ?? null;
}
// Button binding: EDHA_CARD_BUTTONS["edha-loot-btn"] (end of file).
async function edhaLootTakeClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    if (btn.disabled) return;
    const taker = edhaLootTakerActor();
    if (!taker) { ui.notifications?.warn("Edha: select your token (or assign your character) so I know who takes it."); return; }
    const payload = { srcTokenUuid: btn.dataset.edhaSrc, itemId: btn.dataset.edhaItem, takerUuid: taker.uuid };
    btn.disabled = true;   // local courtesy only — the GM-side claim ledger is the real guard
    if (game.user?.isGM) { await edhaLootTakeGM(payload); return; }
    if (!game.users?.activeGM) { btn.disabled = false; ui.notifications?.warn("Edha: a GM must be online to take items."); return; }
    game.socket.emit("module.edha-content", { action: "loot-take", payload });
  } catch (e) { edhaClickFailed("loot take", e); }
}
// GM-side apply — the single writer. Claim first (synchronous), then move the item for real.
async function edhaLootTakeGM(p) {
  const src = p?.srcTokenUuid, id = p?.itemId;
  if (!src || !id) return;
  if (!edhaLootClaim(EDHA_LOOT_CLAIMS, src, id)) {
    ChatMessage.create({ whisper: edhaGmIds(), content: `<p>🎒 Loot: that item was already claimed from its source (two takes raced). Nothing moved.</p>` });
    return;
  }
  try {
    const source = await edhaResolveActorRef(src);            // token uuid → its actor (unlinked bodies resolve to the delta actor)
    const item = source?.items?.get(id) ?? null;
    const taker = await edhaResolveActorRef(p.takerUuid);
    if (!item || !taker) {
      edhaLootRelease(EDHA_LOOT_CLAIMS, src, id);
      ChatMessage.create({ whisper: edhaGmIds(), content: `<p>🎒 Loot: ${item ? "the taker could not be resolved" : `that item is no longer on ${source?.name ?? "the source"} (already taken?)`}. Nothing moved.</p>` });
      return;
    }
    const data = item.toObject();
    delete data._id;
    // The taken copy is the taker's ordinary gear now: shed the adversary-pack provenance (the
    // adversary sync deletes edha-content-flagged items) and land it unequipped/strippable.
    if (data.flags?.["edha-content"]) delete data.flags["edha-content"];
    if (data.system) {
      if ("equipped" in data.system) data.system.equipped = false;
      if ("alwaysEquipped" in data.system) data.system.alwaysEquipped = false;
    }
    const name = item.name, srcName = source?.name ?? "the cache";
    await taker.createEmbeddedDocuments("Item", [data]);
    await item.delete();
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: taker }), content: `<p>🎒 <strong>${taker.name}</strong> takes <strong>${name}</strong> from <strong>${srcName}</strong>.</p>` });
  } catch (e) {
    edhaLootRelease(EDHA_LOOT_CLAIMS, src, id);
    console.error("Edha Content | loot-take GM apply failed", e);
  }
}
// GM console utility (`edha.createLootCache(name)`): mint a stockable cache actor — Loot Caches
// folder, linked chest token, the lootCache flag, players keep NO ownership.
async function edhaCreateLootCache(name = "Loot Cache") {
  try {
    if (!game.user?.isGM) { ui.notifications?.warn("Edha: only the GM creates loot caches."); return null; }
    let folder = game.folders?.find(f => f.type === "Actor" && f.name === "Loot Caches");
    if (!folder) { try { folder = await Folder.create({ name: "Loot Caches", type: "Actor" }); } catch (e) { /* perms */ } }
    const actor = await Actor.create({
      name, type: "adversary", img: EDHA_LOOT_CACHE_IMG, folder: folder?.id ?? null,
      prototypeToken: {
        name, actorLink: true,                                   // linked: the placed chest always mirrors the stocked actor
        displayName: CONST.TOKEN_DISPLAY_MODES?.HOVER ?? 30,     // anyone can hover-read the chest's name
        disposition: CONST.TOKEN_DISPOSITIONS?.NEUTRAL ?? 0,
        texture: { src: EDHA_LOOT_CACHE_IMG },
      },
      ownership: { default: 0 },
      flags: { "edha-content": { lootCache: true } },
    });
    ui.notifications?.info(`Edha: "${name}" created (Loot Caches folder) — drag items onto its sheet, then place its token over the chest.`);
    return actor;
  } catch (e) {
    console.error("Edha Content | createLootCache failed", e);
    ui.notifications?.error(`Edha: cache creation failed — ${e.message}`);
    return null;
  }
}
// Intercept the double-click at the Token class (the same walk-the-proto idiom as the phantom
// veil's isVisible wrap). Foundry v13 binds `clickLeft2: this._onClickLeft2` per token at draw
// time, so an `init`-time prototype patch is what every later-drawn token picks up. Non-loot
// tokens and every GM click fall straight through to the original (Foundry's own sheet gate).
Hooks.once("init", function edhaPatchLootDblClick() {
  try {
    const TokenCls = foundry.canvas?.placeables?.Token ?? globalThis.Token;
    let proto = TokenCls?.prototype, orig = null;
    while (proto && !orig) { orig = Object.getOwnPropertyDescriptor(proto, "_onClickLeft2")?.value ?? null; if (!orig) proto = Object.getPrototypeOf(proto); }
    if (!orig) { console.warn("Edha Content | Token#_onClickLeft2 not found — loot double-click disabled (the GM can still hand items over manually)."); return; }
    TokenCls.prototype._onClickLeft2 = function (event) {
      try { if (edhaLootTryOpen(this)) return; } catch (e) { console.error("Edha Content | loot open failed", e); }
      return orig.call(this, event);
    };
  } catch (e) { console.error("Edha Content | loot double-click patch failed", e); }
});

/* --- Injury tool (shared primitive, backlog 9a): create an injury Item, rolled or typed -------------
 * Creation is the inverse of the Reknit delete-item relay: owner-side create when we own the target,
 * else the `create-item` GM relay. Type picking: a RollTable named like "Injuries" wins when one
 * exists (world tables first, then compendia) so the table CONTENT stays a GM design call; else the
 * EDHA_INJURY_FALLBACK list — PLACEHOLDER CONTENT (Ben-approved default, 2026-07-04): six generic
 * entries keyed by damage type. Creating a world RollTable named "Injuries" replaces the list
 * without touching the engine. Consumers: Death/Raise Dead (+1 injury), Life/Apex Form (Injury when
 * it ends — the edhaClearLifeState scene-clear). */
const EDHA_INJURY_FALLBACK = [
  { type: "keen",   name: "Deep Laceration" },
  { type: "impact", name: "Broken Bones" },
  { type: "energy", name: "Severe Burns" },
  { type: "spirit", name: "Spiritual Fracture" },
  { type: "vital",  name: "Necrotic Scarring" },
  { type: null,     name: "Lingering Wound" },   // no/unknown damage type
];
async function edhaFindInjuryTable() {
  try {
    const world = game.tables?.find(t => /injur/i.test(t.name || ""));
    if (world) return world;
    for (const pack of (game.packs ?? [])) {
      if (pack.documentName !== "RollTable") continue;
      const idx = await pack.getIndex();
      const hit = idx.find(e => /injur/i.test(e.name || ""));
      if (hit) return await pack.getDocument(hit._id);
    }
  } catch (e) { /* no tables — fall back */ }
  return null;
}
// The create half — retried bare on schema drift (the injury system schema is unverified until bench).
async function edhaCreateItemDocs(actor, itemData) {
  try { await actor.createEmbeddedDocuments("Item", [itemData]); return true; }
  catch (e) {
    try { await actor.createEmbeddedDocuments("Item", [{ name: itemData.name, type: itemData.type }]); return true; }
    catch (e2) { console.error("Edha Content | item create failed", e2); return false; }
  }
}
async function edhaCreateItemCross(actor, itemData) {
  if (!actor || !itemData) return false;
  if (actor.isOwner) return edhaCreateItemDocs(actor, itemData);
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to add ${itemData.name}.`); return false; }
  try { game.socket.emit("module.edha-content", { action: "create-item", payload: { actorUuid: actor.uuid, itemData } }); return true; } catch (e) { return false; }
}
// Add ONE injury Item to `target`; returns the injury's name (for cards) or null.
async function edhaAddInjury(target, { source = "Injury", damageType = null } = {}) {
  try {
    if (!target) return null;
    let name = null, note = "";
    const table = await edhaFindInjuryTable();
    if (table) {
      const { results } = await table.roll();
      const r = results?.[0];
      const raw = r?.description ?? r?.text ?? r?.name ?? "";
      name = String(raw).replace(/<[^>]*>/g, "").trim() || null;
      if (name) note = ` (rolled on "${table.name}")`;
    }
    if (!name) {
      name = (EDHA_INJURY_FALLBACK.find(e => e.type === damageType) ?? EDHA_INJURY_FALLBACK[EDHA_INJURY_FALLBACK.length - 1]).name;
      note = ` (placeholder — create a world RollTable named "Injuries" to replace the built-in list)`;
    }
    const itemData = {
      name, type: "injury", img: "icons/skills/wounds/injury-triple-slash-bleed.webp",
      system: { description: { value: `<p>Inflicted by <strong>${source}</strong>${note}. Duration/severity per the injuries rules — GM adjudicates.</p>` } },
    };
    return (await edhaCreateItemCross(target, itemData)) ? name : null;
  } catch (e) { console.error("Edha Content | add injury failed", e); return null; }
}

