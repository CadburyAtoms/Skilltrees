/* ============================================================================================
 * CONTESTED-ROLL RESOLUTION (2026-06-15) — make a talent's own skill_test a REAL pass/fail instead
 * of a "compare it yourself" reminder. A talent's useItem QUEUES a contest (capturing the current
 * target); the talent's skill_test roll is caught by the watcher below; whichever lands second
 * resolves it. Order-independent: for a skill_test activation useItem fires first, then the roll —
 * but a TTL breadcrumb tolerates either order (and a slow roll dialog). Contest kinds:
 *   • defense  — success = (Blue/White total ≥ target.system.defenses.<key>.value)
 *   • opposed  — auto-roll the target's own skill (e.g. Athletics) and compare
 *   • prompt   — ask the GM for a DC (used where a plain test has no static defense)
 * When there is no target or the defense can't be read, it falls back to the talent's manual card.
 * ============================================================================================ */
const EDHA_CONTEST_TTL = 120000;     // a talent's roll may follow its use by this long (slow roll dialog)
const EDHA_CONTEST_BACK = 8000;      // ...or precede it by this long, if the system fires useItem after the roll
const _edhaContestQueue = new Map();   // ownerId -> { color, onResolve, ts }
const _edhaLastRoll     = new Map();   // ownerId -> { skill, total, nat, ts, used }

function edhaReadDefense(actor, key) {
  if (!actor || !key) return null;
  const v = Number(foundry.utils.getProperty(actor, `system.defenses.${key}.value`));
  return Number.isFinite(v) ? v : null;
}
/* H1 `edha-def-test` (07-24m) — the pure success/fail decision, hoisted out of ~20 hand-rolled
 * copies so it is testable without Foundry. `total` is the owner's captured roll.
 *   vs "defense" -> beat `defValue` (edhaReadDefense)
 *   vs "skill"   -> beat `oppRoll`  (edhaRollOpposedSkill — the engine rolls the foe; never trust
 *                   the player to have won, per iron rule 3 / kill-soft-laziness)
 *   vs "dc"      -> beat a flat `dc` (Grand Deception 15, Field Medicine 15)
 * FAIL-OPEN on an unreadable comparison value, which is what every deity call site already does
 * (`def == null ? true : total >= def`) — an adversary with no written defense must not make the
 * talent silently useless. Returns { ok, dc } so the card can print what was beaten. Pinned. */
function edhaDefTestOutcome(total, { vs = "defense", dc = null, defValue = null, oppRoll = null } = {}) {
  const t = Number(total) || 0;
  const bar = vs === "skill" ? oppRoll : vs === "dc" ? dc : defValue;
  const n = Number(bar);
  if (bar === null || bar === undefined || !Number.isFinite(n)) return { ok: true, dc: null };   // fail-open
  return { ok: t >= n, dc: n };
}
// Queue a contest the moment a talent is used (captures game.user.targets reliably on the owner's client).
// The talent's own skill_test roll is matched by edhaContestWatch — order-independent (see edhaTryResolveContest).
function edhaQueueContest(owner, color, onResolve) {
  if (!owner) return;
  _edhaContestQueue.set(owner.id, { color, onResolve, ts: Date.now() });
  void edhaTryResolveContest(owner.id);
}
function edhaContestWatch(roll, source, config) {
  try {
    const actor = edhaD20RollActor(config); if (!actor) return;
    _edhaLastRoll.set(actor.id, { skill: roll?.data?.skill?.id ?? null, total: Number(roll.total) || 0, nat: edhaKeptD20Nat(roll) ?? 0, ts: Date.now(), used: false });
    if (_edhaContestQueue.has(actor.id)) void edhaTryResolveContest(actor.id);
  } catch (e) { console.error("Edha Content | contest watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaContestWatch);

async function edhaTryResolveContest(ownerId) {
  const q = _edhaContestQueue.get(ownerId); if (!q) return;
  if (Date.now() - q.ts > EDHA_CONTEST_TTL) { _edhaContestQueue.delete(ownerId); return; }   // gave up waiting for a roll
  const r = _edhaLastRoll.get(ownerId);
  if (!r || r.used) return;                                          // wait for the talent's own roll
  if (q.color && r.skill && r.skill !== q.color) return;            // a different test — keep waiting for the talent's
  const dt = r.ts - q.ts;                                           // ≥0: roll after the use (normal); <0: roll before it
  if (dt >= 0 ? dt > EDHA_CONTEST_TTL : -dt > EDHA_CONTEST_BACK) return;   // must be the roll tied to THIS use
  r.used = true;
  _edhaContestQueue.delete(ownerId);
  try { await q.onResolve({ total: r.total, nat: r.nat }); } catch (e) { console.error("Edha Content | contest resolve failed", e); }
}

// GM-only DC prompt (DialogV2 in v13, Dialog fallback). Returns: a Number (DC entered), null (blank), or
// undefined (the GM chose "judge it" / closed → caller treats as owner-judged).
/* --- edhaDialogPick({ title, content, buttons }) (ENGINE PASS 5.3, Job 8) — ONE DialogV2-with-
 * AppV1-fallback picker. Three near-identical pickers (edhaPromptDC, the Weave link picker
 * edhaZoneLinkMarkers, the Edict prohibition picker edhaPickProhibition) built the same "try
 * DialogV2.wait, fall back to the legacy Dialog on an older Foundry" shape, each button reading its
 * own submitted fields off the dialog's root element (DV2 hands the callback `btn.form`; the legacy
 * path hands it `h[0] ?? h` — both support `.querySelector`, so ONE `parse(root)` per button works
 * for both paths). `buttons` is `[{ action, label, default, parse }]`; a button with no `parse`
 * resolves to `null` (a plain Cancel). Any rejection/close resolves to `undefined` — every caller's
 * own downstream check is a bare `if (!picked)`/`if (!proh)`, so unifying the two prior "cancelled"
 * sentinels (`null` on Weave/Edict's DV2-reject path, `undefined` on edhaPromptDC's) onto `undefined`
 * changes no branch anywhere; `null` stays reserved for "the form was submitted but had nothing in
 * it" (edhaPromptDC's blank-DC case), which only edhaPromptDC's own `parse` can still produce.
 * Fixed riding along: edhaPromptDC's AppV1 fallback rendered its content RAW, with no `<form>` wrap —
 * Weave's and Edict's always wrapped theirs. `edhaDialogPick` always wraps the fallback body now, so
 * every caller behaves the same on Foundry versions old enough to hit that path.
 *
 * ⛑ THE `??` THAT ATE EVERY CANCEL (bench run 24, 2026-09-05 — the contract above was a LIE on the
 * DialogV2 path from the day this function shipped). `DialogV2#_onSubmit` is, verbatim:
 *
 *     const result = (await button?.callback?.(event, target, this)) ?? button?.action;
 *
 * so a callback that resolves `null` or `undefined` is REPLACED by the button's own `action` string,
 * which is always truthy. Every parse-less Cancel therefore returned `"cancel"`, and every caller's
 * `if (!picked)` / `if (!proh)` guard missed it: Final Decree charged 3 Investiture, refunded
 * nothing, and armed itself with `proh === "cancel"` ("…must not **undefined**"); the Weave link
 * picker's Cancel is worse still — `"cancel"[0]`/`[1]` are `"c"`/`"a"`, two DIFFERENT truthy
 * strings, so it sailed past its `!picked[0] || picked[0] === picked[1]` guard, linked nothing, kept
 * the cost and posted a "the chosen squares are linked" card anyway.
 *
 * THE FIX IS A BOX, not a per-caller guard. Every callback result is wrapped in `{ edhaPick: … }` —
 * an object is never nullish, so the `??` can never fire — and unboxed on the far side. This
 * restores the documented contract EXACTLY, including the two values `??` was destroying:
 * `null` (parse-less button) and `undefined` (edhaPromptDC's "No DC — judge it", whose
 * `parse: () => undefined` was arriving as `"judge"`). A dismissal is not boxed at all: with
 * `rejectClose: false`, `DialogV2.wait` resolves `result ?? null` from its close listener, so an
 * unboxed value of ANY shape means "dismissed" → `undefined`, matching the legacy path's `close`.
 * Do NOT "fix" this by giving buttons falsy `action` values — DV2 keys `options.buttons` by action
 * and `_onSubmit` looks the pressed button up by `target.dataset.action`. */
async function edhaDialogPick({ title, content, buttons }) {
  const DV2 = foundry.applications?.api?.DialogV2;
  if (DV2) {
    try {
      const boxed = await DV2.wait({
        window: { title }, content, rejectClose: false,
        buttons: buttons.map((b) => ({ action: b.action, label: b.label, default: !!b.default,
          callback: async (ev, btn) => ({ edhaPick: b.parse ? await b.parse(btn.form) : null }) })),
      });
      return edhaUnboxDialogPick(boxed);
    } catch (e) { return undefined; }
  }
  return await new Promise((resolve) => new Dialog({
    title, content: `<form>${content}</form>`,
    buttons: Object.fromEntries(buttons.map((b) => [b.action, {
      label: b.label, callback: (h) => resolve(b.parse ? b.parse(h[0] ?? h) : null),
    }])),
    default: buttons.find((b) => b.default)?.action || buttons[0]?.action,
    close: () => resolve(undefined),
  }).render(true));
}
/* The far half of the box above — PURE, so the `??`-survival contract is pinned in
 * tests/dialog-pick-box.test.js without a DOM. A box is `{ edhaPick: <the parse result> }` and its
 * payload is returned verbatim (including `null` and `undefined`); anything NOT a box — the `null`
 * DialogV2.wait resolves on a dismissal with `rejectClose:false`, or an action string if a future
 * Foundry ever bypasses the callback — means "no choice was made" → `undefined`. `in` is the test,
 * not truthiness: `{edhaPick: undefined}` is a REAL answer ("No DC — judge it"). */
function edhaUnboxDialogPick(boxed) {
  return (boxed && typeof boxed === "object" && "edhaPick" in boxed) ? boxed.edhaPick : undefined;
}
async function edhaPromptDC(title, hint) {
  const content = `<p>${hint}</p><p><label>Difficulty (DC): <input type="number" name="edhaDC" style="width:6em" autofocus></label></p>`;
  const readDC = (root) => { const el = root.querySelector("[name=edhaDC]"); const v = Number(el?.value); return Number.isFinite(v) && el?.value !== "" ? v : null; };
  return edhaDialogPick({ title, content, buttons: [
    { action: "ok", label: "Resolve", default: true, parse: readDC },
    { action: "judge", label: "No DC — judge it", parse: () => undefined },
  ] });
}

// Roll a target's own skill for an OPPOSED contest (e.g. Redirect Momentum: Blue vs the mover's Athletics).
// The modifier is rank + the linked attribute (cosmere skills don't expose a flat `.mod` in roll data, so
// we mirror edhaWhiteMod's rank+attr approach). attrId defaults to the skill's natural attribute.
const EDHA_SKILL_ATTR = { ath: "str", prc: "awa", sur: "awa", dec: "pre", lea: "pre", dis: "wil" };   // dis (Discipline) → wil per foundry-build.js's SKILL_ATTR (Order's Sealed Edict/Verdict contests)
/* An ATTRIBUTE id is a legitimate contest id, not a typo (2026-07-27j). Several cards call for an
 * ATTRIBUTE test, not a skill test — Concussive Yield's "each character tests Speed vs. your Red"
 * and Inevitable Snare's "the triggering target tests Speed vs. your Green" — and `spd` is also
 * this file's own long-standing DEFAULT in `edhaFoeSkillVsColor` and the `edha-zone`/snare-spring
 * resolvers. But `spd` is an Attribute, never a Skill: cosmere rollData keys `skills` off
 * CONFIG.COSMERE.skills (18 + EDHA's 5 colours) and `attr` off CONFIG.COSMERE.attributes, so
 * `skills.spd.rank` is absent AND `EDHA_SKILL_ATTR` has no `spd` row — BOTH terms were skipped and
 * the foe rolled a bare `1d20` with no Speed in it at all. Silent, like every member of this
 * family: no error, no warning, just a contest the target's attribute never entered.
 * `edhaSkillLabel` was already taught about attributes by the 07-27f label fix (it falls back to
 * CONFIG.COSMERE.attributes) — the card has been PRINTING "Speed" over a roll that ignored it.
 * CONFIG first so a system that adds an attribute needs no edit here; the literal set is the
 * headless fallback (tests, and any load-order gap before CONFIG.COSMERE exists). */
const EDHA_ATTR_IDS = ["str", "spd", "int", "wil", "awa", "pre"];
function edhaIsAttributeId(id) {
  const key = String(id ?? "").trim(); if (!key) return false;
  const cfg = globalThis.CONFIG?.COSMERE?.attributes;
  return cfg ? Object.prototype.hasOwnProperty.call(cfg, key) : EDHA_ATTR_IDS.includes(key);
}
/* The pure id→attribute decision, hoisted so it is pinnable without Foundry. Explicit `attrId`
 * still wins; then "the id IS an attribute"; then the skill→attribute map. */
function edhaContestAttrFor(skillId, attrId = null) {
  return attrId || (edhaIsAttributeId(skillId) ? String(skillId).trim() : null) || EDHA_SKILL_ATTR[skillId] || null;
}
async function edhaRollOpposedSkill(target, skillId, attrId = null) {
  try {
    const data = target.getRollData?.() ?? {};
    const attr = edhaContestAttrFor(skillId, attrId);
    const parts = ["1d20"];                                         // rollData shape mirrors edhaWhiteMod: @skills.<id>.rank + @attr.<id>
    if (foundry.utils.getProperty(data, `skills.${skillId}.rank`) != null) parts.push(`@skills.${skillId}.rank`);
    if (attr && foundry.utils.getProperty(data, `attr.${attr}`) != null) parts.push(`@attr.${attr}`);
    let roll;
    try { roll = await (new Roll(parts.join(" + "), data)).evaluate(); }
    catch (e) { roll = await (new Roll("1d20", data)).evaluate(); }
    return Number(roll.total) || 0;
  } catch (e) { return 0; }
}

// Rewrite an already-rendered roll's displayed total (Voice of Authority / Bound by Word "actually changes
// the result in Foundry"). Editing another actor's message needs the GM, so relay when we aren't one.
function edhaFindRecentRollMessage(actor, total) {
  const want = Math.round(Number(total));
  const msgs = game.messages?.contents ?? [];
  for (let i = msgs.length - 1; i >= 0 && i >= msgs.length - 50; i--) {
    const m = msgs[i]; if (!m?.rolls?.length) continue;
    const spk = ChatMessage.getSpeakerActor(m.speaker);
    if (actor && spk && spk.id !== actor.id) continue;
    if (Math.round(Number(m.rolls[0].total)) === want) return m;
  }
  return null;
}
async function edhaApplyRollRewrite(message, newTotal, noteHtml) {
  try {
    if (!message?.rolls?.length) return false;
    const r = message.rolls[0];
    try { r._total = Number(newTotal); } catch (e) {}
    const json = (typeof r.toJSON === "function") ? r.toJSON() : foundry.utils.deepClone(r);
    json.total = Number(newTotal);
    const amend = noteHtml ? `<div class="edha-roll-amend" style="opacity:.9;font-size:.9em;border-top:1px solid #8884;margin-top:4px;padding-top:3px">${noteHtml}</div>` : "";
    await message.update({ rolls: [JSON.stringify(json)], content: (message.content || "") + amend });
    return true;
  } catch (e) { console.error("Edha Content | roll rewrite failed", e); return false; }
}
// Rewrite by actor+oldTotal; GM does it directly, a player relays to the GM. Returns true if applied locally.
async function edhaRewriteOrRelay(actor, oldTotal, newTotal, noteHtml) {
  const msg = edhaFindRecentRollMessage(actor, oldTotal);
  if (msg && (game.user?.isGM || msg.isOwner)) return await edhaApplyRollRewrite(msg, newTotal, noteHtml);
  if (game.users?.activeGM) {
    try { game.socket.emit("module.edha-content", { action: "rewrite-roll", payload: { actorUuid: actor?.uuid ?? null, oldTotal, newTotal, noteHtml } }); return true; }
    catch (e) {}
  }
  return false;
}

// A whispered "you may react" card for a Coordination owner. Click → deduct the owner's OWN cost(s)
// (owner-owned → no relay) + post the result note. The 1-reaction-per-round economy is approximated by
// a once/round/owner/talent gate (the broader cross-talent reaction limit stays GM-tracked).
function edhaPostCoordReactionCard(owner, name, roller, { costs = [], prompt = "", result = "", contest = null } = {}) {
  const costLabel = edhaChoiceCostLabel(costs);
  const contestAttr = contest ? ` data-edha-contest="${encodeURIComponent(JSON.stringify(contest))}"` : "";
  const row = `<button type="button" class="edha-coordreact-btn" data-edha-owner="${owner.uuid}" data-edha-name="${encodeURIComponent(name)}" data-edha-costs="${encodeURIComponent(JSON.stringify(costs))}" data-edha-result="${encodeURIComponent(result)}"${contestAttr}>Use ${name}${costLabel ? ` — spend ${costLabel}` : ""}</button>`;
  edhaPostChoiceCard(owner, { name, emoji: "⚡", prompt, rows: row, onceGate: true });
}
async function edhaCoordReactClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaOwner); if (!owner) return;
    const name = decodeURIComponent(btn.dataset.edhaName || "");
    let costs = []; try { costs = JSON.parse(decodeURIComponent(btn.dataset.edhaCosts || "[]")) || []; } catch (e) {}
    let contest = null; try { contest = btn.dataset.edhaContest ? JSON.parse(decodeURIComponent(btn.dataset.edhaContest)) : null; } catch (e) {}
    let result = decodeURIComponent(btn.dataset.edhaResult || "");
    if (!edhaCoordOPRAllowed(owner, name, "_react")) { ui.notifications?.info(`${name} was already used this round.`); btn.disabled = true; return; }
    // Shared Conviction (and any boost contest): prompt for the DC and report whether the boost saves the test.
    if (contest) {
      const dc = await edhaPromptDC(`${name} — did the test fail?`, `${contest.allyName || "The ally"} rolled <strong>${contest.rollTotal}</strong>; your modifier raises it to <strong>${contest.boostedTotal}</strong>. Enter the test's DC to resolve.`);
      if (typeof dc === "number") {
        if (contest.rollTotal >= dc) { ui.notifications?.info(`${contest.allyName || "The ally"} already meets DC ${dc} — no boost needed.`); btn.disabled = true; btn.textContent = "not needed"; return; }
        result = contest.boostedTotal >= dc
          ? `✊ <strong>${name}</strong> (${owner.name}): +modifier turns ${contest.rollTotal} into <strong>${contest.boostedTotal}</strong> — now meets DC ${dc} (<strong>success</strong>).`
          : `✊ <strong>${name}</strong> (${owner.name}): +modifier raises ${contest.rollTotal} to <strong>${contest.boostedTotal}</strong>, still short of DC ${dc}.`;
      }
    }
    await edhaCoordOPRMark(owner, name, "_react");
    for (const c of costs) await edhaSpendResource(owner, c.resource, c.value);
    btn.disabled = true; btn.textContent = `${name} used`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>${result}</p>` });
  } catch (e) { edhaClickFailed("coord react click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-coordreact-btn"] (Job 1, pass 5.3, end of file).

/* H26 `edha-test-react` (07-25, iron rule 2b) — the coord/test-triggered twin of H25. One GM client
 * inspects each completed roll and sweeps the rules; the SELECTION and the SPEC ride each talent's
 * document (Shared Conviction / Pillar of Order / Concordant Presence / Voice of Authority here,
 * Pack Sense in Green — the retired name loops of edhaCoordWatch, edhaAccordWatchAttack and
 * edhaPackSenseWatch). The posters (edhaPostCoordReactionCard / edhaPostPlotGrantCard /
 * edhaPostVoiceCard) and their click machinery were already generic and stay ENGINE-OWNED.
 * The 07-12 rulings are now rule fields: requireSeen (Concordant's through-walls nerf), the
 * per-(owner, skill, round) grant gate, and the plausible-fail heuristic (Complication or nat ≤ 10 —
 * the owner still judges ACTUAL failure on the card). */
/* Pure (pinned in tests/): fill an edha-test-react text template. {skill} upper-cases and falls
 * back to "TEST" for skill-less rolls (attack/item rolls with no skill id), matching the retired
 * blocks' `String(skillId).toUpperCase()`. */
function edhaFillReactTemplate(s, { rollerName = "", ownerName = "", total = 0, skillId = null, mod = 0, boosted = 0 } = {}) {
  return String(s || "")
    .replace(/\{roller\}/g, rollerName).replace(/\{owner\}/g, ownerName)
    .replace(/\{total\}/g, String(total)).replace(/\{skill\}/g, String(skillId || "test").toUpperCase())
    .replace(/\{mod\}/g, String(mod)).replace(/\{boosted\}/g, String(boosted));
}
async function edhaTestReactWatch(rollCtx, roll, source, config) {
  try {
    if (!edhaDefBuffGmGate()) return;                              // exactly one GM posts the (whispered) cards
    const roller = edhaD20RollActor(config); if (!roller) return;
    const rtok = edhaCasterToken(roller); if (!rtok) return;
    const skillId = roll?.data?.skill?.id ?? null;
    let comps = 0; try { comps = roll.complicationsCount || 0; } catch (e) {}
    const nat = edhaKeptD20Nat(roll);
    const total = Number(roll.total) || 0;
    for (const { actor: owner, item: tal, handler: h } of edhaWatchersOfRule("edha-test-react")) {
      try {
        if (owner === roller) continue;
        if (!String(h.rolls || "skill,attack,item").split(/[,\s]+/).filter(Boolean).includes(rollCtx)) continue;
        const otok = edhaCasterToken(owner); if (!otok || otok.id === rtok.id) continue;
        // Item 77: each `rollerIs` value names its own predicate — the `enemy` branch used to skip
        // on `sameSide` and so let a roller whose side did not resolve through as an enemy. R-63
        // fail CLOSED: an unresolvable side matches NEITHER value. 🤖 bench row.
        if (String(h.rollerIs || "ally") === "enemy" ? !edhaDisposHostile(owner, roller) : !edhaSameDisposition(owner, rtok)) continue;
        if (h.requireSkillTest && !skillId) continue;
        const when = String(h.when || "any");
        if (when === "complication" && !(comps > 0)) continue;
        if (when === "plausible-fail" && !(comps > 0 || (nat != null && nat <= 10))) continue;
        if (h.rangeColor && !edhaTokensWithin(otok, edhaAttuneFtColor(owner, h.rangeColor)).some(t => t.id === rtok.id)) continue;
        if (h.requireTargetInMyTerrain) {
          const targets = edhaTargetsOfRoller(roller);
          if (!targets.length || !targets.some(t => edhaTokenInOwnedTerrain(t, owner))) continue;
        }
        if (h.requireSeen && !edhaCanSee(otok, rtok)) continue;
        const mod = h.modFormula ? (Math.floor(edhaEvalSync(String(h.modFormula), owner.getRollData())) || 0) : 0;
        const boosted = total + mod;
        const fill = (s) => edhaFillReactTemplate(s, { rollerName: roller.name, ownerName: owner.name, total, skillId, mod, boosted });
        const action = String(h.action || "offer");
        if (action === "grant-plot-die") {
          // Once per (owner, skill, round); recipients must also be seen when requireSeen is on.
          if (!edhaCoordOPRAllowed(owner, tal.name, skillId)) continue;
          const allies = edhaAlliesInAttune(owner, h.rangeColor || "white").filter(t => t.actor !== roller && (!h.requireSeen || edhaCanSee(otok, t)));
          if (!allies.length) continue;
          await edhaCoordOPRMark(owner, tal.name, skillId);
          edhaPostPlotGrantCard(owner, tal.name, { skill: skillId, allies, whisperToOwner: true,
            note: fill(h.note) || `${roller.name} just tested ${String(skillId).toUpperCase()} → ${total}.`,
            gate: { rollerTotal: total, rollerName: roller.name } });
        } else if (action === "disadvantage-reroll") {
          edhaPostVoiceCard(owner, tal.name, roller, nat ?? 0, total, edhaParseCosts(h.costs), fill(h.prompt));
        } else {
          edhaPostCoordReactionCard(owner, tal.name, roller, {
            costs: edhaParseCosts(h.costs),
            prompt: fill(h.prompt), result: fill(h.result),
            contest: h.contest ? { rollTotal: total, boostedTotal: boosted, allyName: roller.name } : null,
          });
        }
      } catch (e) { console.error(`Edha Content | edha-test-react (${tal?.name}) failed`, e); }
    }
  } catch (e) { console.error("Edha Content | test-react watch failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, (roll, source, config) => edhaTestReactWatch(ctx, roll, source, config));

/* --- Cleanse-a-condition offer (Beacon of Stability's shape; generic since 07-25) ------------------
 * Posted by an `edha-cleanse` rule's executor: one button per (ally, condition); the click spends
 * the rule's costs and removes the condition. The card and click are the ENGINE-OWNED machinery. */
/* --- CARD LABELS for system ids — the ONLY way an id reaches card text (2026-07-27f) -------------
 * ⚠️ `CONFIG.COSMERE.skills[id].label` and `.statuses[id].label` hold raw i18n KEYS
 * ("COSMERE.Actor.Skill.Agility", "COSMERE.Status.Disoriented"), NOT display text. EDHA's own
 * statuses (EDHA_STATUSES) carry plain English, which is exactly why this hid for so long: every
 * card that named an Edha status read fine and every card that named a NATIVE skill or status
 * printed the key (bench run 1: `COSMERE.Status.Disoriented`; run 7: the Magnum Opus splash save).
 * Two workarounds had grown around the gap instead of closing it — a hardcoded `label: "Agility"`
 * in Bastion's save call (which is why run 7 saw one card "work") and authored `saveLabel`/
 * `skillLabel` fields carrying English on two Destruction rules.
 * NEVER interpolate a bare id or a `*.label` read into card/AE text. Call one of these. */
function edhaLocalizeLabel(raw, fallback) {
  const s = String(raw ?? "").trim();
  if (!s) return fallback;
  const out = String(game.i18n?.localize(s) ?? s);
  /* An i18n MISS returns the key unchanged, and a dotted CapitalCase token with no spaces IS a key
   * — never let one reach card text. This is the belt that makes the family un-repeatable: even a
   * future site that hands us a raw key gets the readable fallback instead of the run-1 symptom. */
  return (!out || /^[A-Z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/.test(out)) ? fallback : out;
}
function edhaConditionLabel(id) {
  const key = String(id ?? "").trim();
  const raw = EDHA_STATUSES[key]?.label ?? CONFIG.COSMERE?.conditions?.[key]?.label ?? CONFIG.COSMERE?.statuses?.[key]?.label   // label-helper
    ?? (CONFIG.statusEffects ?? []).find(s => s.id === key)?.name ?? null;
  return edhaLocalizeLabel(raw, key);   // no configured label at all → the bare id, as before
}
/* R-37(2) — the ONE-OF counterpart of edhaConditionLabel. A ledger key is plural by convention
 * ("snares", "charges", "edicts"), and edhaConditionLabel falls back to the bare key when nothing
 * configures a label, so card text that names a SINGLE entry read "the snares on Snare #1 **is**
 * inevitable". Any card speaking about one entry asks for this instead. Deliberately a small
 * English-plural rule, not a dictionary: -ies → -y, a sibilant -es → drop "es", a bare -s that is
 * not -ss → drop the "s"; anything else (an already-singular configured label like "Edict") is
 * returned untouched, which is the case that must never be mangled. */
/* R-37(2) — the annotate card's sentence, EXTRACTED so the string can be pinned headlessly: the
 * executor that used to build it inline lives inside a `registerItemEventHandlerType` config
 * object, which no harness can call (spend-tag.test.js documents that limit). Two shapes, because
 * the ledgers are two shapes: an entry bound to a CREATURE reads possessively ("the Edict on
 * Roek…"), and a POINT-bound marker names only itself, because the entry IS the thing being
 * marked — there is no creature for an "on" clause to point at. */
function edhaAnnotateSentence(entryName, label, field, prohText = "", creatureBound = false) {
  return creatureBound
    ? `the ${edhaSingularLabel(label)} on <strong>${entryName}</strong>${prohText ? ` ("<em>${prohText}</em>")` : ""} is now <strong>${field}</strong>.`
    : `<strong>${entryName}</strong> is now <strong>${field}</strong>.`;
}
function edhaSingularLabel(label) {
  const s = String(label ?? "").trim();
  if (s.length < 3 || !/s$/i.test(s) || /ss$/i.test(s)) return s;
  if (/[^aeiou]ies$/i.test(s)) return s.slice(0, -3) + (s[s.length - 3] === "I" ? "Y" : "y");
  if (/(ses|xes|zes|ches|shes)$/i.test(s)) return s.slice(0, -2);
  return s.slice(0, -1);
}
/* Indefinite article for a name we interpolate into prose. The weapon picker read "the arms a
 * Agent actually carries" / "a Envoy" at bench run 38 — every vowel-initial path name (Agent,
 * Envoy) came out ungrammatical because the article was a literal. English spells this by SOUND,
 * not by letter, and the six path names are the whole live vocabulary, so the rule is the plain
 * vowel-letter test plus the two exception classes that actually bite: a written vowel that is
 * SOUNDED as a consonant (a "one-handed" grip, a "unicorn", a "university" — u-/eu- glides and
 * "one"), and a consonant letter with a vowel SOUND (an "hour", an "heir", an "honest" broker).
 * A single capital letter that is NAMED with a leading vowel takes "an" too (an F, an M, an S). */
function edhaArticle(word) {
  const w = String(word ?? "").trim();
  if (!w) return "a";
  const lower = w.toLowerCase();
  if (/^(hour|honest|honou?r|heir|herb)/.test(lower)) return "an";                     // silent h
  if (/^(uni[a-z]|use[a-z]*|usu|utili|euro|eu[a-z]|ubiqu|once|one[a-z]*|onc)/.test(lower)) return "a";   // consonant glide
  if (/^[aeiou]/.test(lower)) return "an";
  if (w.length === 1 && /^[fhlmnrsx]$/i.test(w)) return "an";                          // letter NAMES: ef, aitch, el, em, en, ar, es, ex
  return "a";
}
/* The skill/attribute counterpart. Falls back to the UPPER-CASED id (the old inline default at
 * every site this replaced) so an unknown id reads as a skill code, not as lowercase noise. */
function edhaSkillLabel(id) {
  const key = String(id ?? "").trim(); if (!key) return "";
  /* `raw` must stay NULL when nothing is configured — feeding the bare id through localize returns
   * it unchanged, which shipped a lowercase id where the old inline default said "AGI". */
  const raw = CONFIG.COSMERE?.skills?.[key]?.label ?? CONFIG.COSMERE?.attributes?.[key]?.label ?? null;   // label-helper
  return edhaLocalizeLabel(raw, key.toUpperCase());
}
function edhaPostBeaconCard(owner, name, allyTokens, costs = [], prompt = "") {
  const costLabel = edhaChoiceCostLabel(costs);
  const costsAttr = encodeURIComponent(JSON.stringify(costs));
  const rows = [];
  for (const t of (allyTokens || [])) {
    const a = t.actor; if (!a) continue;
    for (const c of [...(a.statuses ?? [])]) {
      if (!c || c === (CONFIG.specialStatusEffects?.DEFEATED || "dead")) continue;
      rows.push(`<button type="button" class="edha-beacon-btn" data-edha-owner="${owner.uuid}" data-edha-name="${encodeURIComponent(name)}" data-edha-costs="${costsAttr}" data-edha-ally="${a.uuid}" data-edha-status="${c}">${a.name}: ${edhaConditionLabel(c)}</button>`);
    }
  }
  edhaPostChoiceCard(owner, { name, emoji: "🕊️", prompt: prompt || `${costLabel ? `spend ${costLabel} to ` : ""}remove a condition from an ally in range:`, rows });
}
async function edhaBeaconClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaOwner);
    const ally = await edhaResolveActorRef(btn.dataset.edhaAlly);
    const statusId = btn.dataset.edhaStatus;
    const name = decodeURIComponent(btn.dataset.edhaName || "");
    if (!owner || !ally || !statusId) return;
    let costs = []; try { costs = JSON.parse(decodeURIComponent(btn.dataset.edhaCosts || "[]")) || []; } catch (e) {}
    const costLabel = edhaChoiceCostLabel(costs);   // Job 3: unified to the majority "N + N" form — was "−N, −N" (visible change, 🤖 row)
    for (const c of costs) await edhaSpendResource(owner, c.resource, c.value);
    await edhaToggleStatus(ally, statusId, false);
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-beacon-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ cleansed`;
    void edhaMarkCardResolved(edhaMessageIdOf(btn), "✓ cleansed");   // R-66: persists past F5/second client
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🕊️ <strong>${name}</strong>: removed <strong>${edhaConditionLabel(statusId)}</strong> from ${ally.name}${costLabel ? ` (${costLabel})` : ""}.</p>` });
  } catch (e) { edhaClickFailed("cleanse click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-beacon-btn"] (Job 1, pass 5.3, end of file).

/* --- White / Coordination active abilities (07-25, iron rule 2b) ----------------------------------
 * Guiding Signal and Ordered Advance are ON THEIR OWN DOCUMENTS: `edha-designate` (a rule over the
 * Tool A2 designate-mark primitive — card text is canon, Ben 07-14) and `edha-move-window` (arms the
 * round-scoped movement window; the updateToken watcher below reads the FLAG, not a name). The
 * name-keyed useItem hook that drove both is gone — do not re-add a branch here. */

/* Read a cosmere DerivedValueField as a NUMBER (the object-as-scalar family, bench run 16 / 07-27y).
 * cosmere-rpg 2.1.0 exposes a dozen derived stats as OBJECTS, not numbers — `system.movement.<t>.rate`,
 * `system.skills.<id>.mod`, `system.resources.<id>.max`, `system.senses.range`, `system.deflect`,
 * `system.injuries`, `system.defenses.<id>`, `system.encumbrance.{lift,carry}`, `system.recovery.die`,
 * the currency totals. Each is a DerivedValueField: a SchemaField carrying {derived, override,
 * useOverride[, bonus]} plus a getter-only `.value` (value = bonus present ? base + bonus :
 * useOverride ? override : derived). `Number(thatObject)` is **NaN**, so the near-universal
 * `Number(x) || 0` idiom silently yields **0** — no error, no warning, the feature just reads as
 * dead. Three engine sites shipped that way (every belief test rolled 1d20+0; every half-Speed move
 * went 0 ft). Take `.value` first; fall back to override/derived for a RAW `_source` object, which
 * has the fields but not the getter. Pure — pinned in tests/. lint-refs pass 17 gates the shape. */
function edhaDerivedNum(v, fallback = 0) {
  if (v === null || v === undefined) return fallback;   // NOT Number(null) — that is 0, which is a MISSING field reading as a real zero
  const n = (typeof v === "object") ? Number(v.value ?? v.override ?? v.derived) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}
// Half walking Speed in ft, floored to the 2.5-ft half-square (adversary rates live under
// .override, PC rates under .value — take whichever resolves). Pure — pinned in tests/.
function edhaHalfSpeed(actor) {
  const v = edhaDerivedNum(actor?.system?.movement?.walk?.rate, NaN);
  return Math.floor(((Number.isFinite(v) && v > 0 ? v : 25) / 2) / 2.5) * 2.5;
}
// Movement-window watcher (Ordered Advance's shape, flag-driven since 07-25): while an owner's
// round-window is armed (the `moveWindow` flag, set by an edha-move-window rule), every move it
// makes posts the card enumerating the allies within the window's range of where it stopped (with
// each one's half-Speed), or accounts for why nobody qualified. Initiating client only (updateToken
// fires everywhere); engine-driven forced movement is not the drilled advance and is skipped.
Hooks.on("updateToken", (doc, change, options, userId) => {
  try {
    if (userId !== game.user?.id) return;
    if (change?.x === undefined && change?.y === undefined) return;
    if (options?.edhaForcedMove) return;
    const actor = doc.actor; if (!actor) return;
    const m = actor.getFlag?.("edha-content", "moveWindow");
    if (!edhaRoundWindowValid(m, edhaInActiveCombat(actor))) return;   // R-4/#28a: the MOVER's combat
    const src = m.source || "Movement Window", ft = Number(m.rangeFt) || 10;
    const what = m.note || "may move half their Speed without provoking Reactions";
    const scene = doc.parent; const gs = scene?.grid?.size || 100, gd = scene?.grid?.distance || 5;
    const cx = doc.x + (doc.width * gs) / 2, cy = doc.y + (doc.height * gs) / 2;   // destination center (doc already updated)
    // Item 10 batch 2 (R-63): a mover whose side did not resolve lists nobody, and a token whose
    // side did not resolve is left off the list — the card says so rather than guessing FRIENDLY.
    const disp = doc.disposition;
    const allies = (canvas?.tokens?.placeables ?? []).filter(t => {
      if (t.id === doc.id || !t.actor) return false;
      if (!edhaSideSame(t.document?.disposition, disp)) return false;
      return (Math.hypot((t.center?.x ?? 0) - cx, (t.center?.y ?? 0) - cy) / gs * gd) <= ft;
    });
    const content = allies.length
      ? `<div class="edha-trigger-card"><p>🚶 <strong>${src}</strong> — ${actor.name} moved; allies within ${ft} ft ${what}:</p><ul>${allies.map(t => `<li><strong>${t.actor.name}</strong> — up to ${edhaHalfSpeed(t.actor)} ft</li>`).join("")}</ul></div>`
      : `<p>🚶 <strong>${src}</strong> — ${actor.name} moved, but no allies were within ${ft} ft of where it stopped${Number.isFinite(disp) ? "" : " (its token has no disposition set, so allies could not be told apart)"}.</p>`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
  } catch (e) { console.error("Edha Content | movement-window card failed", e); }
});

