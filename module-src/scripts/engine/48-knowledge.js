/* ============================================================================================
 * KNOWLEDGE (Gnothis, deity) tree engine (2026-07-03; iron rule 2b pass 2bT 2026-07-25) — study
 * (Green) → the Insight economy → strike (Red kinetic, scaled per Insight).
 * Colors Red/Green; tag prefix "Knowledge (Gnothis)."; build `foundry-build deity` → pack `edha-deity`.
 * Die/range colors (Ben R0, 07-03): GREEN backs every Attunement Range check tree-wide; RED backs
 * every [Tier][Die] damage payload.
 * NAME COLLISION resolved (Ben R2, 07-03): the capstone "Apex Predator" collided with Green/Instinct's
 * talent of that name — RENAMED to "The Final Study" in the data rather than gating on color.
 *
 * ALL NINE TALENTS ARE ON THEIR DOCUMENTS since pass 2bT (07-25). The takeover set, the useItem arm
 * dispatch, the Accumulate tick hook and the name-keyed dealer pre/post passes are DELETED; every
 * talent's behaviour is authored rules in data/authored/deity-knowledge.json:
 *   • Studied Mark        — H3b `edha-owner-list` {mode: counter, op: place, count: 2} + `edha-reveal`
 *     (hp/conditions/defenses, cog withheld — its literal card text).
 *   • Killing Blow        — H1 `edha-def-test` {red vs phy, targetCounter: insight}; success = damage
 *     ×count (`perCounterStatus`) then counter release; fail = damage ×1 then counter add −1.
 *   • The Final Study     — same + `oncePerScene` on the gate; success also posts the ally free-Strike
 *     roster via `edha-note` {rosterColor: green} (player-executed, the standing convention).
 *   • Predatory Strike    — `edha-self-status` (predprimed) arm; `edha-damage-bonus`
 *     {require: armed-self-status, consumeSelfStatus, weaponOnly, ×max(@counter,1), placeCounter: 1}.
 *   • Hunter's Discipline — `edha-damage-bonus` {require: self-hits-counter-bearer, +@tier vital} +
 *     `edha-counter-transfer` {fraction: 0.5} for the on-kill half.
 *   • Death Mark          — `edha-counter-transfer` {fraction: 1, allyBurst + burstFormula}.
 *   • Accumulate          — `edha-watch` {turn-start, self} → counter add +1 {requireBearerRange:
 *     green}; the damage→Inv clause was already data-side (`edha-marked-damage-trigger`).
 *   • Pack Share          — `edha-self-status` (packsight) arm + `edha-reveal` {counter-bearer, public}
 *     + `edha-damage-bonus` {require: ally-hits-counter-bearer, +@tier, placeCounter 1 once/round}.
 *   • The Pack            — `edha-self-status` (packmind) arm + the same ally rider with +@counter.
 *
 * WHAT STAYS HERE (the engine half the rules consume — none of it keys on a talent name):
 *   • The COUNTER primitives (H3b's engine half, §9m q6: a counted SINGLE BEARER — 0..cap on one
 *     creature, transferring clears the old bearer — as a `mode` on H3, not a second handler). The
 *     ALREADY-REGISTERED stackable `insight` status is the visible marker AND (Ben R1, 07-03) drives
 *     the count via **`effect.system.stacks`** — RESOLVED 2026-07-27h by bench run 8's mutation
 *     probe, and the old ⚑ guess (`system.count`) was WRONG for the entire life of the mechanic:
 *     ActiveEffectDataModel's schema is exactly {isStackable, stacks}, so every `count` write
 *     resolved without error and was dropped, and every read was `Number(undefined) || 0` = 0.
 *     A pointer-only owner flag `flags.edha-content.counters.<key>` names "my current bearer";
 *     `markedBy.<status>` set on the bearer (the Diagnosed/Omen family) so the generic marked-damage
 *     dispatch picks it up for free. Cleared at scene end (deleteCombat).
 *   • The on-kill transfer sweep — rides the SHARED live→0 HP stamp; SELECTION is now the
 *     `edha-counter-transfer` rules it sweeps (no disposition/type gate — Ben R6: a TRANSFER, not a
 *     farming tally). ENGINE-OWNED support: the transfer/burst prompt cards and their click handlers
 *     (the H6 trade — posters and click machinery are generic and carry no talent knowledge).
 *   • The `counter-set` socket relay (renamed from gnosis-set-insight; mirrors apply-status-mark).
 * Rulings kept (Ben, 07-03): R9 Hunter's Discipline + Death Mark both fire on the same kill (last
 * click wins under the single-bearer rule); R10 Pack Share + The Pack stack additively; R11 each
 * armed rider's first-ally-to-hit trigger is tracked independently (per-talent oncePerRound).
 * Truly manual (declared, not dropped): The Final Study's free Strike / Death Mark's "any enemy of
 * their choice" — the choice is player-made (prompted, never auto-targeted). CONTEST-EXEMPT: none —
 * both tests are vs a DEFENSE through H1, never an opposed SKILL.
 * ============================================================================================ */

/* --- The COUNTER economy (H3b's engine half, generic): pointer-only owner flag + the registered
 * stackable status's own count. `opts` = { key, status, cap, talent } — key names the owner flag
 * (`counters.<key>`), status the marker; both default to each other; cap clamps; talent labels the
 * markedBy stamp. Every value comes from the consuming RULE, never from a talent name. ------------- */
function edhaCounterBearerUuid(owner, key) { return owner?.getFlag?.("edha-content", `counters.${key}`) ?? null; }
async function edhaCounterBearerOf(owner, key) {
  const uuid = edhaCounterBearerUuid(owner, key); if (!uuid) return null;
  return edhaResolveActorRef(uuid);
}
function edhaCounterIsBearer(owner, key, target) { return !!(owner && target && edhaCounterBearerUuid(owner, key) === target.uuid); }
// Read the count only if `target` IS this owner's current bearer (a rival owner's mark on the same
// creature never leaks into this owner's math — the shared status is per-creature).
function edhaCounterOn(owner, key, target, status = null) {
  if (!edhaCounterIsBearer(owner, key, target)) return 0;
  const st = status || key;
  const eff = target.effects?.find(e => e.statuses?.has?.(st));
  return eff ? edhaEffectStacks(eff) : 0;
}
/* THE stack read (shared primitive — every stackable-status count goes through it).
 * `system.stacks` is the ONLY count field ActiveEffectDataModel defines, and the system's own
 * accessor is `get stacks() { return this.system.stacks ?? 1 }` — so a stackable status whose
 * stacks were never written counts as ONE, not zero. We mirror that exactly: a legacy `insight`
 * effect written by the pre-07-27h engine (which stored a dropped `count`) therefore reads 1
 * rather than 0, which is both the system's own reading of the same document and the safe
 * direction (the marker is visibly ON the token). */
function edhaEffectStacks(eff) {
  if (!eff) return 0;
  const raw = eff.system?.stacks ?? eff.stacks ?? 1;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
/* GM-side write: create/update/delete the status effect to exactly `count` + set/clear markedBy.<status>.
 * Writing `system.stacks` is load-bearing THREE ways, all verified against the system source
 * (CosmereActiveEffect, cosmere-rpg 2.1.0) — do not "simplify" any of them away:
 *   1. It is the real schema field; `system.count` resolved silently and stored nothing (07-27h).
 *   2. `_preUpdate` re-derives the effect NAME from it ("Insight [3]"), so we must NOT also write
 *      `name` — the system owns that string, and fighting it would desync the token tooltip.
 *   3. The sheet's own conditions widget cycles the same field and toggles the status OFF at <= 0,
 *      which is exactly the delete-at-zero shape below. So Ben clicking the count on the sheet and
 *      the engine writing it are now the SAME operation. (NumberField min 0 — never write < 0.) */
async function edhaCounterApplyGM(target, status, count, mark) {
  try {
    const eff = target.effects?.find(e => e.statuses?.has?.(status));
    if (count <= 0) {
      if (eff) { try { await eff.delete(); } catch (e) {} }
      try { await target.unsetFlag("edha-content", `markedBy.${status}`); } catch (e) {}
      return;
    }
    if (eff) { try { await eff.update({ "system.stacks": count }); } catch (e) {} }
    else {
      await target.toggleStatusEffect?.(status, { active: true });
      const created = target.effects?.find(e => e.statuses?.has?.(status));
      if (created) { try { await created.update({ "system.stacks": count }); } catch (e) {} }
    }
    if (mark) { try { await target.setFlag("edha-content", `markedBy.${status}`, mark); } catch (e) {} }
  } catch (e) { console.error("Edha Content | counter apply (GM) failed", e); }
}
async function edhaCounterWriteRemote(target, status, count, mark) {
  if (target.isOwner) { await edhaCounterApplyGM(target, status, count, mark); return true; }
  if (!game.users?.activeGM) { ui.notifications?.warn(`Edha: a GM must be online to mark ${target.name}.`); return false; }
  game.socket.emit("module.edha-content", { action: "counter-set", payload: { targetUuid: target.uuid, status, count, mark } });
  /* The same fire-and-forget relay gap edhaWriteStatusMark closes (2026-09-05, fix pass 4): a
   * counter written here and read back in the same activation — Studied Mark places Insight then
   * reveals the target's conditions — otherwise reads the pre-write world. Clearing waits for the
   * status to GO; setting waits for it to arrive with the count actually on it. */
  const n = Math.floor(Number(count) || 0);
  await edhaAwaitLocal(
    () => n <= 0
      ? !target.statuses?.has?.(status)
      : (!!target.statuses?.has?.(status) && edhaEffectStacks(target.effects?.find(e => e.statuses?.has?.(status))) === n),
    { label: `${status} ×${n} on ${target.name}` });
  return true;
}
// The one state-changing primitive: transfers the bearer (clears the OLD bearer to 0 first if `target`
// differs — Studied Mark's literal text, applied counter-wide), clamps 0..cap, writes bearer + pointer.
async function edhaCounterSet(owner, target, count, { key, status = null, cap = 5, talent = "" } = {}) {
  try {
    const st = status || key;
    const n = Math.max(0, Math.min(Math.max(1, Number(cap) || 5), Math.floor(Number(count) || 0)));
    const prevUuid = edhaCounterBearerUuid(owner, key);
    if (prevUuid && prevUuid !== target?.uuid) {
      const prev = await edhaResolveActorRef(prevUuid);
      if (prev) await edhaCounterWriteRemote(prev, st, 0, null);
    }
    if (!target || n <= 0) {
      if (target) await edhaCounterWriteRemote(target, st, 0, null);
      try { await owner.unsetFlag("edha-content", `counters.${key}`); } catch (e) {}
      return 0;
    }
    await edhaCounterWriteRemote(target, st, n, { actorId: owner.id, talent: talent || key });
    try { await owner.setFlag("edha-content", `counters.${key}`, target.uuid); } catch (e) {}
    return n;
  } catch (e) { console.error("Edha Content | counter set failed", e); return 0; }
}
async function edhaCounterAdd(owner, target, delta, opts) {
  return edhaCounterSet(owner, target, edhaCounterOn(owner, opts.key, target, opts.status) + (Number(delta) || 0), opts);
}

// Whispered HP/conditions/defenses snapshot (never trust-the-player to peek). `cog:false` = Studied
// Mark's own text ("Physical and Spiritual defenses" only); Pack Share's is the full three.
/* H24 `edha-reveal` (07-25) — THE REVEAL: state facts about a creature as card text.
 *
 * WHY IT EXISTS. Two talents were stuck on the engine for want of this and nothing else, and
 * neither showed up in any handler-demand column (audit §9p). Sharp Eye's row was `needs: [H1]`,
 * H1 being BUILT — but the engine's own comment above it said "what still needs a payload H1
 * cannot supply", because H1 decides success/failure and owns no payload vocabulary. Vital
 * Diagnosis's classified mechanic (the Diagnosed mark) had been authored for months; what actually
 * held it was the OTHER half of its case, a whispered snapshot. `edha-note` carries STATIC text, so
 * "tell me this creature's numbers" had nowhere to live.
 *
 * This is the pure half: given a creature and a comma-list of fact ids, return the clauses. The
 * CALLER joins them, which is what lets one implementation serve two different card styles —
 * Knowledge joins with "; " and Sharp Eye with " · ". Pure and unit-pinned (tests/reveal.test.js).
 *
 * Fact ids: hp · conditions · defenses · lowest-attribute · lowest-defense · below-half.
 * `hideDefenses` is a comma-list dropped from `defenses` — Studied Mark deliberately withholds
 * Cognitive, which is why this is a subtraction rather than three separate fact ids. */
function edhaRevealFacts(target, { facts = "hp,conditions,defenses", hideDefenses = "" } = {}) {
  const s = target?.system ?? {};
  const want = String(facts).split(",").map(x => x.trim()).filter(Boolean);
  const hidden = new Set(String(hideDefenses).split(",").map(x => x.trim()).filter(Boolean));
  const lowestKey = (o) => Object.entries(o || {})
    .sort((a, b) => (Number(a[1]?.value) || 0) - (Number(b[1]?.value) || 0))[0]?.[0] ?? "?";
  const belowHalf = (r) => (Number(r?.value) || 0) <= ((edhaResVal(r) ?? 0) / 2);
  const out = [];
  for (const f of want) {
    if (f === "hp") {
      const hea = s.resources?.hea;
      out.push(`HP <strong>${Number(hea?.value) || 0}/${Number(hea?.max?.value ?? hea?.max) || 0}</strong>`);
    } else if (f === "conditions") {
      const conds = [...(target?.statuses ?? [])].map(x => edhaConditionLabel(x));
      out.push(`conditions: ${conds.length ? conds.join(", ") : "none"}`);
    } else if (f === "defenses") {
      const parts = [];
      for (const [key, label] of [["phy", "Physical"], ["cog", "Cognitive"], ["spi", "Spiritual"]]) {
        if (hidden.has(key)) continue;
        parts.push(`${label} <strong>${edhaReadDefense(target, key) ?? "?"}</strong>`);
      }
      out.push(`defenses — ${parts.join(", ")}`);
    } else if (f === "lowest-attribute") {
      out.push(`lowest attribute <strong>${lowestKey(s.attributes)}</strong>`);
    } else if (f === "lowest-defense") {
      out.push(`lowest defense <strong>${lowestKey(s.defenses)}</strong>`);
    } else if (f === "below-half") {
      out.push(`below half — health: <strong>${belowHalf(s.resources?.hea) ? "yes" : "no"}</strong>, `
        + `focus: <strong>${belowHalf(s.resources?.foc) ? "yes" : "no"}</strong>, `
        + `Investiture: <strong>${belowHalf(s.resources?.inv) ? "yes" : "no"}</strong>`);
    }
  }
  return out;
}
// Knowledge's snapshot line — a thin caller of edhaRevealFacts so there is ONE implementation.
// Since pass 2bT the tree's reveals are `edha-reveal` rules; this wrapper remains solely as the
// byte-identical-parity surface tests/reveal.test.js pins (drift here = drift in edhaRevealFacts).
function edhaGnosisRevealLines(target, { cog = true } = {}) {
  const clauses = edhaRevealFacts(target, { facts: "hp,conditions,defenses", hideDefenses: cog ? "" : "cog" });
  return `<p>${target.name} — ${clauses.join("; ")}. <span style="opacity:.7">(snapshot at cast — may change.)</span></p>`;
}

/* --- On-kill transfer: the shared live→0 HP stamp, SELECTED by `edha-counter-transfer` rules --------- */
function edhaCounterCandidatesInRange(owner, rangeColor, excludeTok) {
  const otok = edhaCasterToken(owner); if (!otok) return [];
  const ft = edhaAttuneFtColor(owner, rangeColor || "green");
  return edhaTokensWithin(otok, ft).filter(t => t.actor && t.id !== excludeTok?.id && (t.actor.system?.resources?.hea?.value ?? 1) > 0);
}
// ENGINE-OWNED support (the H6 trade): the prompt cards and their click handlers are generic — every
// value they need travels as data attributes written from the RULE, never from a talent name.
function edhaCounterPostTransferCard(owner, sourceName, amount, candidates, { key, status, cap }) {
  try {
    const label = edhaConditionLabel(status) || status;
    if (!candidates.length) {
      ChatMessage.create({ whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
        content: `<div class="edha-burst-card"><p>📖 <strong>${sourceName}</strong>: no creature in Attunement Range to receive the <strong>${amount}</strong> transferred ${label}.</p></div>` });
      return;
    }
    const rows = candidates.map(t => `<button type="button" class="edha-counter-transfer-btn" data-edha-owner="${owner.uuid}" data-edha-target="${t.actor.uuid}" data-edha-amount="${amount}" data-edha-key="${key}" data-edha-status="${status}" data-edha-cap="${cap}" data-edha-name="${encodeURIComponent(sourceName)}">${t.actor.name}</button>`).join(" ");
    ChatMessage.create({
      whisper: edhaWhisperIds(owner), speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>📖 <strong>${sourceName}</strong> — Free Action: place <strong>${amount}</strong> ${label} on a new creature in Attunement Range:</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | counter transfer card failed", e); }
}
async function edhaCounterTransferClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const target = await edhaResolveActorRef(ds.edhaTarget);
    if (!owner || !target) return;
    const amount = Number(ds.edhaAmount) || 0;
    const name = decodeURIComponent(ds.edhaName || "");
    const n = await edhaCounterSet(owner, target, amount, { key: ds.edhaKey, status: ds.edhaStatus, cap: Number(ds.edhaCap) || 5, talent: name });
    btn.closest(".edha-trigger-card")?.querySelectorAll(".edha-counter-transfer-btn").forEach(b => b.disabled = true);
    btn.textContent = `✓ ${target.name}`;
    void edhaMarkCardResolved(edhaMessageIdOf(btn), `✓ ${target.name}`);   // R-66: persists past F5/second client
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>📖 <strong>${name}</strong>: ${target.name} now bears <strong>${n}</strong> ${edhaConditionLabel(ds.edhaStatus) || ds.edhaStatus}.</p>` });
  } catch (e) { edhaClickFailed("counter transfer click", e); }
}
function edhaCounterPostAllyBurstCard(owner, sourceName, allyTokens, formula) {
  try {
    const names = allyTokens.map(t => t.actor.name).join(", ");
    const rows = allyTokens.map(t => `<button type="button" class="edha-counter-burst-btn" data-edha-owner="${owner.uuid}" data-edha-ally="${t.actor.uuid}" data-edha-name="${encodeURIComponent(sourceName)}" data-edha-formula="${encodeURIComponent(formula)}">${t.actor.name} strikes</button>`).join(" ");
    // Public, not whispered — each ally's OWN controller needs to see and click their own button ("any
    // enemy of their choice" is a per-ally decision, possibly a different player than the rule's owner).
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: owner }),
      content: `<div class="edha-trigger-card"><p>📖 <strong>${sourceName}</strong>: each ally in Attunement Range (${names}) deals <strong>[Tier][Die]</strong> Vital (${owner.name}'s dice) to any enemy of their choice. Target the enemy, then click for the ally dealing the blow:</p>${rows}</div>`,
    });
  } catch (e) { console.error("Edha Content | counter burst card failed", e); }
}
async function edhaCounterBurstClick(ev) {
  try {
    ev.preventDefault(); const btn = ev.currentTarget, ds = btn.dataset;
    const owner = await edhaResolveActorRef(ds.edhaOwner);
    const ally = await edhaResolveActorRef(ds.edhaAlly);
    const target = edhaUserTargetActor();
    const name = decodeURIComponent(ds.edhaName || "");
    if (!owner || !ally) return;
    if (!target) { ui.notifications?.warn("Edha: target the enemy, then click."); return; }
    const dr = await edhaRollFormula(owner, decodeURIComponent(ds.edhaFormula || "0"));
    const amt = Math.max(0, Math.floor(dr.total));
    const payload = { casterActorUuid: owner.uuid, hits: [{ actorUuid: target.uuid, amount: amt, type: "vital", heal: false }] };
    if (game.user?.isGM) await edhaApplyBurstResults(payload);
    else if (game.users?.activeGM) game.socket.emit("module.edha-content", { action: "burst-apply", payload });
    else { ui.notifications?.warn(`Edha: a GM must be online to apply ${name}'s burst.`); return; }
    btn.disabled = true; btn.textContent = `✓ ${ally.name} → ${target.name}`;
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ally }), rolls: [dr], content: `<p>📖 <strong>${name}</strong>: ${ally.name} deals <strong>${amt}</strong> vital to ${target.name}.</p>` });
  } catch (e) { edhaClickFailed("counter burst click", e); }
}
Hooks.on("updateActor", async (victim, changes, options) => {
  try {
    if (!edhaDefBuffGmGate()) return;   // one applier
    const h = options?.edhaHea;
    if (!h || h.new > 0 || h.old <= 0) return;   // only a live→0 crossing counts
    const vtok = edhaCasterToken(victim);
    // SELECTION rides the rules (07-25 pass 2bT): any talent carrying an `edha-counter-transfer` rule
    // whose owner's counter bearer just dropped gets its prompt(s). Hunter's Discipline (fraction .5)
    // and Death Mark (fraction 1 + allyBurst) both fire on the same kill — Ben R9: independently,
    // last click wins under the single-bearer rule.
    for (const w of edhaWatchersOfRule("edha-counter-transfer")) {
      const hh = w.handler, owner = w.actor;
      const key = String(hh.counter || "insight").trim(), status = String(hh.status || key).trim();
      if (!edhaCounterIsBearer(owner, key, victim)) continue;
      const slain = edhaCounterOn(owner, key, victim, status);
      const frac = Number.isFinite(Number(hh.fraction)) ? Number(hh.fraction) : 1;
      const amt = Math.floor(slain * frac);
      const rangeColor = hh.rangeColor || "green";
      const cap = edhaListCap(owner, hh.capFormula || "5");
      if (amt > 0) edhaCounterPostTransferCard(owner, w.item.name, amt, edhaCounterCandidatesInRange(owner, rangeColor, vtok), { key, status, cap });
      if (hh.allyBurst) {
        const allies = edhaAlliesInAttune(owner, rangeColor).filter(t => t.actor && t.actor !== owner);
        if (allies.length) edhaCounterPostAllyBurstCard(owner, w.item.name, allies, hh.burstFormula || "(@tier)d(2 * @skills.red.rank + 2)");
      }
    }
  } catch (e) { console.error("Edha Content | counter on-kill watcher failed", e); }
});

/* --- Chat buttons --------------------------------------------------------------------------------------- */
// Button binding: EDHA_CARD_BUTTONS["edha-counter-transfer-btn"], ["edha-counter-burst-btn"] (Job 1, pass 5.3, end of file).

/* --- Scene cleanup (deleteCombat): counters + arming statuses reset ("fades at the end of the scene") - */
// R-60: the "counters" ledger (characters-only) and the insight/markedBy/statuses half
// (tokens-only) both widen to edhaSceneReset's one deduped population. Insight is a STACKABLE
// counter effect (edhaEffectStacks family) deleted outright, not toggled — stays bespoke `extra`.
async function edhaClearCounterState(endedCombat) {
  await edhaSceneReset(endedCombat, {
    key: "counter",
    flags: ["counters", "markedBy.insight"],
    statuses: ["packsight", "packmind", "predprimed"],
    extra: async (a) => {
      const eff = a.effects?.find(e => e.statuses?.has?.("insight"));
      if (eff) { try { await eff.delete(); } catch (e) {} }
    },
  });
}
// (deleteCombat registration centralized — see the scene-reset dispatch table after Order, below.)

