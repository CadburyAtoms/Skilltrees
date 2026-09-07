/* ============================================================================================
 * OPPORTUNITY-SPEND MENU (2026-07-05) — SHARED PRIMITIVE (Ben-approved design; first consumer:
 * Predatory Insight; later trees just author a rule). When any of the roller's tests resolves with an
 * Opportunity (plot die success OR d20 in the Opportunity range — the system's roll.opportunitiesCount),
 * a menu card posts on the ROLLING client listing that actor's `edha-opportunity-option` rules (one
 * button each; the listed resource cost is deducted on click — the Opportunity itself is trusted, per
 * the cost convention) plus the CANON spends as a text reminder (SR p.9). One spend per card: clicking
 * a button disables the whole menu. The card only posts when the actor owns at least one talent option
 * (canon-only Opportunities would be noise on every natural 20).
 * ============================================================================================ */
const EDHA_OPP_PENDING = {};   // pid -> [{ itemUuid, itemName, label, costResource, costValue, kind, skill, note }]
/* `attr` is the triggering test's attribute, so an option can be gated to the KIND of test that
 * produced the Opportunity — Reckless Momentum is "when you succeed on a PHYSICAL test" (07-25).
 * Passing it in (rather than re-reading anything at click time) keeps the gate on the roll that
 * actually happened. `itemUuid` is carried so the click can run the talent's OWN rules. */
function edhaOpportunityOptions(actor, attr = null) {
  const out = [];
  for (const { item: tal, handler: h } of edhaActorRulesOf(actor, "edha-opportunity-option")) {
    if (!h.label) continue;
    if (h.whenAttribute && attr && !String(h.whenAttribute).split(/[,\s]+/).filter(Boolean).includes(attr)) continue;
    out.push({ itemUuid: tal.uuid, itemName: tal.name, label: h.label, costResource: h.costResource || "", costValue: Number(h.costValue) || 0, kind: h.kind || "note", skill: h.skill || "", note: h.note || "" });
  }
  return out;
}
function edhaOpportunityMenuWatch(roll, source, config) {
  try {
    let opp = 0; try { opp = roll?.opportunitiesCount || 0; } catch (e) {}
    const actor = edhaD20RollActor(config); if (!actor) return;
    // 07-18h: Opportunity ADDERS (High Society/Underworld Contacts, Rumormonger, Well Supplied —
    // "spend 2 focus to add Opportunity to <a matching> test"). Using the talent (focus paid
    // natively) banks a credit; the NEXT test cashes it as +1 Opportunity. Whether the test
    // matches the talent's domain (high society / criminals / rumors / requisition) is the
    // table's read — the credit card names its source so the GM can waive a mismatch.
    let credit = null;
    try { credit = actor.getFlag?.("edha-content", "oppCredit") ?? null; } catch (e) {}
    if (credit) { opp += 1; void actor.unsetFlag("edha-content", "oppCredit"); }
    if (opp <= 0) return;
    const attr = roll?.data?.skill?.attribute ?? config?.defaultAttribute ?? null;
    const options = edhaOpportunityOptions(actor, attr);
    if (!options.length && !credit) return;
    const pid = foundry.utils.randomID();
    EDHA_OPP_PENDING[pid] = options;
    const btns = options.map((o, i) => {
      const cost = o.costValue > 0 ? ` — spend ${o.costValue} ${EDHA_RES_LABEL[o.costResource] || o.costResource}` : "";
      return `<button type="button" class="edha-opp-btn" data-edha-actor="${actor.uuid}" data-edha-pid="${pid}" data-edha-idx="${i}" title="${o.note || ""}">${o.itemName}: ${o.label}${cost}</button>`;
    }).join("");
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="edha-trigger-card edha-opp-card">`
        + `<p>🎲 <strong>Opportunity!</strong> ${actor.name} rolled ${opp > 1 ? `${opp} Opportunities` : "an Opportunity"}${credit ? ` <em>(+1 granted by ${credit.source} — GM waives if this test doesn't match its domain)</em>` : ""} — spend it on:</p>`
        + btns
        + `<p style="opacity:.75;font-size:.85em;margin-top:4px">Canon spends (table-run): Aid an Ally · Collect Yourself · Critically Hit · Influence the Narrative.</p>`
        + `</div>`,
    });
  } catch (e) { console.error("Edha Content | Opportunity menu failed", e); }
}
for (const ctx of ["skill", "attack", "item"]) Hooks.on(`cosmere-rpg.${ctx}Roll`, edhaOpportunityMenuWatch);
async function edhaOpportunityClick(ev) {
  try {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const owner = await edhaResolveActorRef(btn.dataset.edhaActor); if (!owner) return;
    const o = EDHA_OPP_PENDING[btn.dataset.edhaPid]?.[Number(btn.dataset.edhaIdx)];
    if (!o) { ui.notifications?.info("Edha: this Opportunity menu has expired (posted before the last reload)."); btn.disabled = true; return; }
    if (o.costValue > 0 && (o.costResource === "inv" || o.costResource === "foc")) {
      const res = owner.system?.resources?.[o.costResource], cur = res?.value ?? 0;
      if (cur < o.costValue) { ui.notifications?.warn(`Edha: ${owner.name} lacks ${o.costValue} ${EDHA_RES_LABEL[o.costResource]}.`); return; }
      await edhaSpendResource(owner, o.costResource, o.costValue);
    }
    /* PAYLOAD (07-25): run the talent's OWN rules on the `edha-opportunity` event. That event type
     * has been registered since 07-24 with nothing dispatching it — the pass-I "registered type
     * with zero dispatch sites" shape. This is what lets an Opportunity spend DO something without
     * the menu growing a new `kind` per talent: any handler works, exactly as on a gated test.
     * Reckless Momentum is the first consumer (edha-next-test-mod, plotDie). */
    const tal = (await fromUuid(o.itemUuid).catch(() => null)) ?? null;
    let ran = 0;
    if (tal) {
      for (const rule of edhaEventRules(tal)) {
        if (rule?.event !== "edha-opportunity") continue;
        try { await rule.handler?.execute?.({ item: tal, rule, options: {} }); ran++; }
        catch (e) { console.error(`Edha Content | ${tal.name} opportunity rule failed`, e); }
      }
    }
    if (ran) {
      // the payload posts its own card; nothing to add
    } else if (o.kind === "adv-next-test" && o.skill) {
      await owner.setFlag("edha-content", "advTest", { skill: o.skill, round: edhaCombatRoundOf(owner), source: o.itemName });   // R-4/#28a: the OWNER's combat (edhaAdvTestRead reads the same)
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>👁️ <strong>${o.itemName}</strong>: Opportunity spent — advantage on ${owner.name}'s next ${o.skill.toUpperCase()} test this round.</p>` });
    } else {
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: owner }), content: `<p>🎲 <strong>${o.itemName}</strong>: Opportunity spent — ${o.note || o.label}</p>` });
    }
    // one spend per Opportunity card — disable the whole menu
    const card = btn.closest(".edha-opp-card");
    card?.querySelectorAll("button").forEach(b => { b.disabled = true; });
    btn.textContent = `${o.itemName} — spent`;
  } catch (e) { edhaClickFailed("Opportunity click", e); }
}
// Button binding: EDHA_CARD_BUTTONS["edha-opp-btn"] (Job 1, pass 5.3, end of file).

