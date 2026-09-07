/* ============================================================================================
 * SUMMONS (backlog L) — create a real Actor + Token for a summoned creature, keep it identified
 * as THIS owner's summon from THIS talent, and clean it up when it dies or the scene ends.
 * Every summoning talent in the atlas (Civilization's Construct, Life's spirits, Death's risen,
 * the Green companions) ends up here rather than rolling its own.
 *
 * ⚠️ Three things that have each caused a bug:
 *   • Actor creation is GM-ONLY. A player's summon goes over the socket relay to
 *     edhaSummonCreateGM; the player half never touches the Actors collection directly.
 *   • Identity is (talentName, summonName) on a flag — edhaSummonIsFrom / edhaSummonSourceTalent
 *     / edhaOwnedSummons are the census the H15 sustained-summon cap counts with (07-24y). Do not
 *     re-derive "is this mine" from the token name; duplicates are renamed (edhaNextTokenName).
 *   • Deleting the token must delete the ACTOR too, or the world fills with orphans — hence the
 *     deleteToken / deleteActor pair and edhaSweepOrphanedTokens.
 * Owns: edhaSummonFolder · edhaSummonIsFrom · edhaSummonSourceTalent · edhaOwnedSummons ·
 *   edhaSummon · edhaSummonCreateGM · edhaDeleteActorWithTokens · edhaSweepOrphanedTokens,
 *   the deleteToken / deleteActor watchers, and the mode-gated summon-item preUseItem veto
 *   (the REUSABLE "this item only works in mode X" primitive, bench 07-17).
 * ============================================================================================ */

/* --- L: Summon tokens -------------------------------------------------------------------------
 * A talent's own `edha-summon` rule (Events tab) spawns an `adversary` token on the scene, scaled
 * to the caster: HP = a rolled formula, defenses = caster − penalty, a baked melee attack, speed,
 * and condition immunities (only those the system knows). One fresh actor per summon (organized in
 * an "Edha Summons" folder), auto-deleted when its last token is removed. GM-side (actor creation
 * needs create permission); player-triggered summons would need a GM relay (future).
 */
async function edhaSummonFolder() {
  let f = game.folders?.find(x => x.type === "Actor" && x.name === "Edha Summons");
  if (!f) { try { f = await Folder.create({ name: "Edha Summons", type: "Actor" }); } catch (e) { /* perms */ } }
  return f ?? null;
}

// Summon a spec-defined creature. The spec is baked ENTIRELY owner-side (HP rolled, formulas
// resolved vs the caster, ownership stamped incl. the summoning user); document creation runs
// directly when this user can create actors, else via the `summon-actor` GM relay (shared
// primitive, backlog 9a — mirrors burst-apply/place-hazard-region), so a player without
// ACTOR_CREATE gets a real token instead of a warn.
/* --- Sustained-summon identity + census (07-24y, H15) --------------------------------------------
 * Which summons on the board came from THIS talent? The flag is authoritative; the name-prefix
 * fallback is for creatures summoned before 07-24y, which carry no `summonTalent` — and it compares
 * against the RULE's own `summonName` (authored data on the document), never a literal in here.
 *
 * TWO CALLERS ASK TWO DIFFERENT QUESTIONS (2026-07-27f — bench run 7 proved they were conflated):
 *   • the FORGING talent's sustain-cap veto asks "how many summons of MINE am I sustaining?" —
 *     talent identity, so pass the forging talent's name and the stamp decides.
 *   • a CONSUMING talent (Siege Form / Arsenal / Magnum Opus act on a Construct someone else forged)
 *     asks "do I have a live <summonName>?" — the SUMMON's identity, and which talent forged it is
 *     not the question. Pass a blank/null `talentName` for that and the stamp is not consulted.
 * Passing a consumer's own name was the run-7 defect: the stamp branch short-circuited on
 * `summonTalent: "Forge Construct"` vs `"Siege Form"`, so a correctly-stamped Construct matched
 * NOTHING and only legacy un-stamped ones worked — the exact inverse of the intent. */
function edhaSummonIsFrom(a, talentName, summonName) {
  const nameOk = !!summonName && String(a?.name || "").startsWith(summonName);
  if (!talentName) return nameOk;                     // consumer-side: the summon's own identity
  const st = a?.getFlag?.("edha-content", "summonTalent");
  if (st) return st === talentName;                   // stamped: the forging talent is authoritative
  return nameOk;                                      // legacy un-stamped (pre-07-24y)
}
/* Which forging talent a CONSUMING rule pins itself to, or null for "any of my <summonName>s".
 * One helper so the pre-cost veto and the executor can never disagree about the lookup key. */
function edhaSummonSourceTalent(h) {
  return String(h?.summonTalent || "").trim() || null;
}
/* Live summons of one talent, OLDEST FIRST. Un-stamped legacy summons sort as oldest (0), which is
 * the behaviour you want: they are the ones that have been standing around longest. */
function edhaOwnedSummons(owner, talentName, summonName) {
  try {
    return (game.actors ?? [])
      .filter(a => a?.getFlag?.("edha-content", "summon")
        && a.getFlag?.("edha-content", "summoner") === owner?.id
        && (Number(a.system?.resources?.hea?.value) || 0) > 0
        && edhaSummonIsFrom(a, talentName, summonName))
      .sort((x, y) => (Number(x.getFlag?.("edha-content", "summonedAt")) || 0) - (Number(y.getFlag?.("edha-content", "summonedAt")) || 0));
  } catch (e) { return []; }
}
async function edhaSummon(caster, spec) {
  try {
    if (!caster || !spec) return null;
    const scene = canvas?.scene;
    if (!scene) { ui.notifications?.warn("Edha: no active scene to summon onto."); return null; }
    const rollData = caster.getRollData();
    const hpRoll = await (new Roll(spec.hpFormula || "(@tier)d6", rollData)).evaluate();
    const hp = Math.max(1, hpRoll.total);
    const atk = spec.attack || {};
    const atkFormula = atk.damageFormula ? edhaFoldDieMath(Roll.replaceFormulaData(atk.damageFormula, rollData, { missing: "0" })) : null;
    const pen = Number(spec.defensePenalty) || 0;
    const dval = (k) => Math.max(0, (caster.system?.defenses?.[k]?.value ?? 0) - pen);
    const cond = {}; const skipped = [];
    for (const c of (spec.conditionImmunities || [])) {
      if (CONFIG.COSMERE?.statuses?.[c]) cond[c] = true; else skipped.push(c);
    }
    const ov = (n) => ({ override: n, useOverride: true });
    // (The "Edha Summons" folder is resolved in edhaSummonCreateGM — players can't create folders.)
    // Explicit ownership: copy the caster's player-owner entries (plus the summoning user) so the
    // player can move the token, see the combat-tracker Activate button (requires combatant.isOwner),
    // and roll the summon's items immediately — no relog needed (2026-06-11 playtest: Forgemaster).
    const ownership = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
    for (const [uid, lvl] of Object.entries(caster.ownership ?? {})) {
      if (uid !== "default" && lvl >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ownership[uid] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    }
    if (game.user?.id) ownership[game.user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    const tokSq = spec.tokenSizeFt ? Math.max(1, Math.round(Number(spec.tokenSizeFt) / (scene.grid?.distance || 5))) : null;
    const actorData = {
      name: `${spec.name} (${caster.name})`,
      type: "adversary",
      ownership,
      img: spec.img,
      folder: null,
      // displayName: summons hover-show their name like every built token (bench 07-17: the Seeming
      // copy showed NO name on hover — the unset field defaults to NONE). Adversary-standard
      // OWNER_HOVER (20) unless the spec overrides (phantom copies inherit the duplicated token's
      // mode so the copy reads exactly like the real one).
      prototypeToken: { name: spec.tokenName ?? spec.name, actorLink: true, displayName: Number.isFinite(Number(spec.displayName)) ? Number(spec.displayName) : (CONST.TOKEN_DISPLAY_MODES?.OWNER_HOVER ?? 20), disposition: spec.disposition ?? CONST.TOKEN_DISPOSITIONS.FRIENDLY, texture: { src: spec.img }, ...(tokSq ? { width: tokSq, height: tokSq } : {}) },
      system: {
        tier: caster.system?.tier ?? 1,
        // Creature type (2026-07-26n — bench run 4 defect 1): blank = the schema default
        // (humanoid). "Construct" mints {id: "custom", custom: "Construct"}, which is what
        // edhaIsConstruct (Fault Line's ×3) and any future type gate reads. Any other label
        // works the same way; the cosmere ids themselves ("animal") pass through as ids.
        ...(spec.creatureType ? {
          type: ["humanoid", "animal"].includes(String(spec.creatureType).toLowerCase())
            ? { id: String(spec.creatureType).toLowerCase(), custom: "" }
            : { id: "custom", custom: String(spec.creatureType) },
        } : {}),
        resources: { hea: { value: hp, max: ov(hp) } },
        defenses: { phy: ov(dval("phy")), cog: ov(dval("cog")), spi: ov(dval("spi")) },
        // `speed: 0` = IMMOBILE, and four shipped rules mean it: Holographic Illusion, Phantom
        // Double, and The Seeming's two copies ("its image STANDS a pace from its body"). `|| 25`
        // gave every static illusion a 25 ft walk. Same falsy-zero family as the Reknit cost.
        movement: { walk: { rate: ov(edhaNumOr(spec.speed, 25)) } },
        // Attack competence: the summon rolls its OWN tests (Construct Slam was damage-only at the
        // 2026-06-11 playtest). Rank scales with the caster's tier; str attribute backs the test.
        skills: { ath: { rank: Math.min(5, Math.max(1, Number(caster.system?.tier) || 1)) } },
        ...(Number(spec.deflect) > 0 ? { deflect: { override: Number(spec.deflect), useOverride: true, source: "armor",
          types: { energy: true, impact: true, keen: true, spirit: false, vital: false, heal: false } } } : {}),
        immunities: { condition: cond },
        description: { value: `<p>Summoned by ${caster.name}.</p>` + (skipped.length ? `<p>Also immune to: ${skipped.join(", ")} (tracked manually — not native conditions).</p>` : "") },
      },
      items: [
        // Summon attacks are WEAPON-type (item 34a, 2026-09-06 — the fleet weapon migration; Ben's
        // 07-17 ruling "defer to the weapon migration" for Construct Slam / Siege Cannon): weapon
        // items get the system's native target + test-defense flow that action-typed skill_tests
        // never had. The same skill_test activation (Athletics + tier rank) is kept so the roll
        // numbers are unchanged; alwaysEquipped = a summon's attack is built in, not disarm-able gear.
        // Field set = the adversary weapon shape advItemDoc emits (system.type is the weapon CATEGORY,
        // attack.type the melee/ranged discriminator edhaAttackKind reads after the flag stamp).
        ...(atkFormula ? [{
          name: atk.name || "Attack",
          type: "weapon",
          img: spec.img,
          flags: { "edha-content": { attackKind: atk.range === "ranged" ? "ranged" : "melee" } },   // read by edhaAttackKind (stamp wins; attack.type below agrees)
          system: {
            id: "summon-attack", type: atk.range === "ranged" ? "light_wpn" : "heavy_wpn",
            description: { value: `<p>${atk.range === "ranged" ? "Ranged" : "Melee"} attack — ${atk.damageType || "keen"} damage. Rolls Athletics vs the target's Physical defense.</p>` },
            // skill_test → use() rolls a d20 Athletics test (+ rank from tier) alongside the damage,
            // instead of bare damage with no to-hit (Construct Slam fix, 2026-06-11 playtest).
            activation: { type: "skill_test", cost: { value: 1, type: "act" }, skill: atk.skill || "ath", attribute: "str" },
            damage: { formula: atkFormula, type: atk.damageType || "keen", skill: atk.skill || "ath" },
            equipped: true, alwaysEquipped: true,
            attack: { type: atk.range === "ranged" ? "ranged" : "melee", range: { value: null, long: null, unit: "ft" } },
            traits: {}, expertise: false,
          },
        }] : []),
        // Extra baked items (e.g. Siege Form's ranged attack) — damage formulas resolved vs the caster.
        // A damage-bearing extra item is an ATTACK and builds as a WEAPON like the primary (item 34a —
        // closes the 07-17 interim: Siege Cannon now targets a token and tests defense natively
        // instead of rolling a bare skill_test to parity). Non-attack extras keep their authored
        // type (action/trait utilities). The Siege Form gate (requiresSummonEffect) is item-type-agnostic.
        ...((spec.extraItems || []).map(x => {
          const isAtk = !!x.damageFormula;
          const ranged = x.range === "ranged" || /\branged\b/i.test(x.description || "");
          // attackKind → read by edhaAttackKind; requiresSummonEffect → the mode gate below
          // (bench 07-17: Siege Cannon fired with Siege Form toggled OFF).
          const xFlags = {
            ...(isAtk ? { attackKind: ranged ? "ranged" : "melee" } : {}),
            ...(x.requiresEffect ? { requiresSummonEffect: x.requiresEffect } : {}),
          };
          return {
            name: x.name || "Ability", type: isAtk ? "weapon" : (x.type || "action"), img: x.img || spec.img,
            ...(Object.keys(xFlags).length ? { flags: { "edha-content": xFlags } } : {}),
            system: {
              description: { value: x.description || "" },
              activation: isAtk
                ? { type: "skill_test", cost: { value: Number(x.actions) || 1, type: "act" }, skill: x.skill || "ath", attribute: x.attribute || "str" }
                : { type: "utility", cost: { value: Number(x.actions) || 1, type: "act" } },
              damage: x.damageFormula ? { formula: edhaFoldDieMath(Roll.replaceFormulaData(x.damageFormula, rollData, { missing: "0" })), type: x.damageType || "keen", skill: x.skill || "ath" } : { formula: null, type: null },
              ...(isAtk ? {
                id: "summon-extra-attack", type: ranged ? "light_wpn" : "heavy_wpn",
                equipped: true, alwaysEquipped: true,
                attack: { type: ranged ? "ranged" : "melee", range: { value: null, long: null, unit: "ft" } },
                traits: {}, expertise: false,
              } : {}),
            },
          };
        })),
      ],
      // Baked toggled-off ActiveEffects (e.g. "Siege Form": Speed 0 + extra deflect) — the player
      // toggles them on the summon's sheet when the mode is active.
      effects: (spec.bakedEffects || []).map(e => ({
        name: e.label || e.name || "Effect", img: e.icon || e.img || "icons/svg/upgrade.svg",
        type: "base", disabled: e.disabled !== false, transfer: true,
        changes: (e.changes || []).map(c => ({ key: c.key, mode: c.mode ?? 2, value: String(c.value ?? "") })),
        description: e.description || "", statuses: [],
        flags: { "edha-content": { summonEffect: true } },
      })),
      /* `summonTalent` + `summonedAt` (07-24y, H15). Summon IDENTITY was a name prefix
       * (`name.startsWith("Combat Construct")`), so renaming a summon silently broke its cap and its
       * riders. `summonTalent` is the summoning TALENT's name, written from the document at summon
       * time — not a literal branched on in engine code. `summonedAt` exists because "replace the
       * oldest" had no ordering data at all: nothing stamped a creation time, and `.find()` was only
       * ever correct while the cap happened to be 1. */
      flags: { "edha-content": { summon: true, summoner: caster.id, summonTalent: spec.talentName || null, summonedAt: Date.now(), ...(spec.extraFlags || {}) } },
    };
    const ct = spec.anchorTok ?? edhaCasterToken(caster);   // anchorTok: place beside a token other than the caster's (Phantom Double of an ally)
    const gs = scene.grid?.size ?? 100;
    // `at` (2bAA): an explicit CENTRE point from the placement picker — no summon could be placed
    // at a chosen square before, which is why every "at a point within Attunement Range" card was
    // spawning beside the caster instead. Token x/y are TOP-LEFT, so re-centre by its own size.
    const half = ((tokSq || 1) * gs) / 2;
    const payload = {
      actorData, sceneId: scene.id,
      x: spec.at ? Math.round(spec.at.x - half) : (ct ? ct.document.x + gs : Math.round((canvas?.dimensions?.sceneWidth ?? 1000) / 2)),
      y: spec.at ? Math.round(spec.at.y - half) : (ct ? ct.document.y : Math.round((canvas?.dimensions?.sceneHeight ?? 1000) / 2)),
      casterId: caster.id, actsAfterCaster: !!spec.actsAfterCaster,
      cardHtml: `<p><strong>${caster.name}</strong> summons <strong>${spec.name}</strong> — HP ${hp}, defenses ${dval("phy")}/${dval("cog")}/${dval("spi")}` +
                (atkFormula ? `, ${atk.name || "attack"} ${atkFormula} ${atk.damageType || "keen"}` : "") + `.</p>`,
    };
    if (game.user?.can("ACTOR_CREATE")) return await edhaSummonCreateGM(payload);
    if (game.users?.activeGM) {
      // Unreachable at Ben's table (EDHA_RULINGS.md R-1, ANSWERED 2026-09-05): the PLAYER role
      // keeps ACTOR_CREATE there, so the branch above always returns first. Kept on purpose for a
      // world that revokes the permission — not dead code to clean up (TODO_REPO_HYGIENE #27).
      game.socket.emit("module.edha-content", { action: "summon-actor", payload });
      ui.notifications?.info(`Edha: ${spec.name} — summon relayed to the GM.`);
      return null;   // the documents materialize on the GM client; callers don't use the return
    }
    ui.notifications?.warn(`Edha: summoning ${spec.name} needs a GM online (you lack actor-create permission).`);
    return null;
  } catch (e) {
    console.error("Edha Content | summon failed", e);
    ui.notifications?.error(`Edha: summon failed — ${e.message}`);
    return null;
  }
}
// The create half of edhaSummon — runs wherever document creation is possible: directly on an
// owner with ACTOR_CREATE, or on the primary GM via the `summon-actor` relay. The payload arrives
// fully baked; nothing here re-rolls or re-resolves against the caster.
async function edhaSummonCreateGM(p) {
  try {
    const scene = game.scenes?.get(p.sceneId) ?? canvas?.scene;
    if (!scene || !p?.actorData) return null;
    p.actorData.folder = (await edhaSummonFolder())?.id ?? null;
    const summon = await Actor.create(p.actorData);
    if (!summon) return null;
    const tdoc = await summon.getTokenDocument({ x: p.x, y: p.y });
    const [newToken] = await scene.createEmbeddedDocuments("Token", [tdoc.toObject()]);
    // R-4/#28a: enrol the summon in the CASTER's combat. `game.combat` is this GM client's viewed
    // encounter — with two combats live it could enrol the summon in the wrong one, and with none
    // viewed it skipped enrolment while the caster was mid-fight.
    const casterCombat = edhaInActiveCombat(game.actors?.get?.(p.casterId) ?? null);
    if (p.actsAfterCaster && casterCombat && newToken) {
      const cc = casterCombat.combatants.find(c => c.actorId === p.casterId);
      try {
        await casterCombat.createEmbeddedDocuments("Combatant", [{ tokenId: newToken.id, sceneId: scene.id, actorId: summon.id, initiative: cc?.initiative ?? null }]);
      } catch (e) { /* no combat or perms */ }
    }
    ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: game.actors?.get(p.casterId) ?? null }), content: p.cardHtml });
    return summon;
  } catch (e) {
    console.error("Edha Content | summon create failed", e);
    ui.notifications?.error(`Edha: summon failed — ${e.message}`);
    return null;
  }
}

// Cleanup: when a summon's last token is removed, delete its one-off actor. ONE APPLIER (07-27q):
// a raw isGM ran this on every connected GM, and the second delete is exactly the server-side
// "Actor does not exist" race the Illusion section's deleteToken hook already documents.
Hooks.on("deleteToken", async (tokenDoc) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    const actor = game.actors?.get(tokenDoc.actorId);
    if (!actor?.getFlag?.("edha-content", "summon")) return;
    const stillUsed = (game.scenes ?? []).some(sc => sc.tokens.some(t => t.actorId === actor.id && t.id !== tokenDoc.id));
    if (!stillUsed) await actor.delete();
  } catch (e) { console.error("Edha Content | summon cleanup failed", e); }
});

/* Tear a one-off actor down TOKEN-FIRST (REUSABLE primitive, 07-27q). ------------------------------
 * Foundry NEVER cascades actor→token: neither the client `Actor` class nor the server document has
 * any dependent-token delete, so `actor.delete()` alone leaves the token standing as an orphan. The
 * Illusion section learned this at bench 07-17 (a recast stacked its new token on the leftover and
 * read as "no new token created"); bench run 13 measured it AGAIN, three times, from two other
 * sites that had each open-coded the wrong half — and this time with a sharper tail: Foundry DOES
 * cascade token→combatant (`TokenDocument._onDeleteOperation` deletes combatants whose tokenId went
 * away) but nothing cascades actor→combatant, so the orphan's leftover combatant made Advanced
 * Encounters throw from its `initiative` getter on every later combatant add. One dead summon could
 * wedge the tracker mid-combat. Deleting the TOKENS is therefore the load-bearing half — it takes
 * the combatant with it.
 *
 * The actor delete is only ours when nobody else owns it: a `summon`-flagged actor that still had a
 * token is deleted by the last-token cleanup above, and a second delete here races it into a
 * server-side "Actor does not exist" (Ben's 07-17 log, 22:29:04). */
async function edhaDeleteActorWithTokens(actor) {
  try {
    if (!actor) return;
    let hadToken = false;
    for (const sc of (game.scenes ?? [])) {
      const toks = sc.tokens.filter(t => t.actorId === actor.id);
      if (toks.length) { hadToken = true; await sc.deleteEmbeddedDocuments("Token", toks.map(t => t.id)); }
    }
    if (!hadToken || !actor.getFlag?.("edha-content", "summon")) { try { await actor.delete(); } catch (e) {} }
  } catch (e) { console.error("Edha Content | actor+token teardown failed", e); }
}

/* ...and the HAND-DELETE safety net (07-27s, bench run 14 attempt 2). ------------------------------
 * The helper above is called from five ENGINE sites, so every teardown the engine drives is correct
 * — run 14 verified two of them live. But a GM deleting the actor from the SIDEBAR goes through
 * none of them, and Foundry cascades nothing: the token stands as an orphan, and because Foundry
 * DOES cascade token→combatant but nothing cascades actor→combatant, the orphan keeps a live
 * combatant that makes Advanced Encounters throw from its `initiative` getter on every later
 * combatant add. One hand-deleted summon wedges the tracker mid-combat — reproduced exactly at run
 * 14, and un-wedged instantly by sweeping that one combatant.
 *
 * SCOPE — this is a cascade over a hook that fires for EVERY actor, so it is narrowed to actors the
 * engine minted, and that set is exact rather than heuristic: `Actor.create` appears twice in this
 * file, and only `edhaSummonCreateGM` mints NPCs (the other is the creation wizard's PC). It always
 * stamps `flags.edha-content.summon = true` — constructs, phantom copies and barriers all route
 * through `edhaSummon` and differ only in `extraFlags`. So the predicate below cannot reach a
 * hand-made adversary, a PC, or an imported pack actor.
 *
 * It deliberately does NOT delete the actor (it is already gone) and does not duplicate the
 * last-token cleanup: that hook re-reads `game.actors.get(tokenDoc.actorId)`, which is null by the
 * time our token deletes land, so it returns without a second `actor.delete()` — the "Actor does
 * not exist" race stays closed. One applier, for the same reason every other world write is. */
Hooks.on("deleteActor", (actor) => {
  try {
    if (!edhaDefBuffGmGate()) return;
    if (actor?.getFlag?.("edha-content", "summon") !== true) return;   // engine-minted only — see above
    void edhaSweepOrphanedTokens(actor.id);
  } catch (e) { /* non-fatal */ }
});
// Delete every token still pointing at a now-deleted actor id (the combatant goes with it).
async function edhaSweepOrphanedTokens(actorId) {
  try {
    if (!actorId) return;
    for (const sc of (game.scenes ?? [])) {
      const toks = sc.tokens.filter(t => t.actorId === actorId);
      if (toks.length) await sc.deleteEmbeddedDocuments("Token", toks.map(t => t.id));
    }
  } catch (e) { console.error("Edha Content | orphaned-token sweep failed", e); }
}

/* --- Mode-gated summon items (REUSABLE primitive, bench 07-17) --------------------------------------
 * An extra baked item whose spec carries `requiresEffect: "<baked effect name>"` can only be used
 * while that summonEffect is toggled ON (first consumer: Siege Cannon requires Siege Form — Ben:
 * "i was able to use siege cannon with the siege form toggled off"). The builder stamps the flag.
 * 2bV: the pre-flag NAME SHIM (a Siege Cannon prefix test) is RETIRED — it bridged constructs
 * summoned before 07-17, and this pass's deity rebuild re-bakes every spec. ⚑ A construct still
 * standing from before the flag existed loses the gate until reforged once (checklist row). */
Hooks.on("cosmere-rpg.preUseItem", (item) => {
  try {
    const actor = item?.actor;
    if (!actor?.getFlag?.("edha-content", "summon")) return;
    const req = item.getFlag?.("edha-content", "requiresSummonEffect");
    if (!req) return;
    const eff = actor.effects?.find(e => e.getFlag?.("edha-content", "summonEffect") && e.name === req);
    if (!eff || eff.disabled) {
      ui.notifications?.warn(`Edha: ${item.name} needs ${req} active — toggle it on first. Nothing spent.`);
      return false;
    }
  } catch (e) { console.error("Edha Content | summon mode gate failed", e); }
});

