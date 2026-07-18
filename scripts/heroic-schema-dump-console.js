/* Edha HEROIC-talent schema dump — PASTE INTO THE FOUNDRY CONSOLE (GM, world open). READ-ONLY.
 *
 * Purpose (2026-07-17 heroic-wiring initiative): the edha module reimplemented the Cosmere RPG
 * Heroic-Path talents (Agent / Envoy / Hunter / Leader / Scholar / Warrior) as SELF-CONTAINED
 * copies, and the copies dropped the base system's automation (activation config, damage, baked
 * ActiveEffects, and whatever native automation the system carries). Repo sessions can't read the
 * cosmere-rpg system / official-content compendia — they live only on this machine. This captures
 * the ground truth so the next session can COPY each talent's real schema into the edha authored
 * heroic files instead of re-authoring 150 talents by hand.
 *
 * What it does: scans EVERY compendium (and world items) for `talent`-type items whose name matches
 * one of the 130 edha heroic talents (below), and dumps each match's FULL object — system.activation,
 * system.damage, effects (changes/statuses/duration/transfer/disabled), description, flags, and the
 * entire system subtree so nothing is missed. Also dumps the talent DataModel field list once, and a
 * FOUND / MISSING / DUPLICATE coverage report so we know exactly which talents can be copied and which
 * are edha-homebrew with no base-system source (those stay a from-scratch authoring job).
 *
 * Creates NOTHING (read-only). Output: downloads `edha-heroic-dump.json` AND copies it to the
 * clipboard. Commit it to `source-materials/system-schemas/cosmere-rpg-heroic-<version>-dump.json`
 * (plain JSON — the no-binaries policy doesn't apply) and tell the session it's there.
 */
(async () => {
  // The 130 unique edha heroic talent names (from data/authored/heroic-*.json).
  const WANT = ["Anatomical Insight","Animal Bond","Applied Medicine","Applied Motivation","Authority","Backstep","Baleful","Bloodstance","Calm Appeal","Cautious Advance","Cheap Shot","Clear Mind","Close the Case","Cold Eyes","Collected","Combat Coordination","Combat Training","Composed","Confident Command","Contingency","Cover Story","Customary Garb","Cutthroat Tactics","Deadly Trap","Decisive Command","Deep Contemplation","Deep Study","Defensive Position","Demonstrative Command","Devastating Blow","Devoted Presence","Double Down","Efficient Engineer","Emotional Intelligence","Erudition","Experienced Trapper","Experimental Tinkering","Exploit Weakness","Fast Talker","Fatal Thrust","Feinting Strike","Feral Connection","Field Medicine","Fine Handiwork","Flamestance","Focused Mind","Foresight","Formation Drills","Galvanize","Gather Evidence","Get 'Em Talking","Grand Deception","Guiding Oration","Hardy","High Society Contacts","Hunter's Edge","Imposing Posture","Inspired Zeal","Instill Confidence","Inventive Design","Ironstance","Keen Insight","Killing Edge","Know Your Moment","Lessons in Patience","Mercurial Façade","Meteoric Leap","Mighty","Mind and Body","Ongoing Care","Opportunist","Overcharge","Overwhelm with Details","Pack Hunting","Peaceful Solution","Plausible Excuse","Practical Demonstration","Practiced Kata","Practiced Oratory","Precise Parry","Prized Acquisition","Protective Bond","Quick Analysis","Rallying Shout","Relentless March","Resilient Hero","Resolute Stand","Resuscitation","Risky Behavior","Rousing Presence","Rumormonger","Sage Counsel","Seek Quarry","Set at Odds","Shadow Step","Shadowing","Shard Training","Sharp Eye","Shattering Blow","Shrewd Command","Sidestep","Signature Weapon","Sleuth's Instincts","Sound Advice","Stalwart Presence","Startling Blow","Steadfast Challenge","Steady Aim","Stonestance","Strategize","Subtle Takedown","Sure Outcome","Surefooted","Swift Healer","Swift Strikes","Synchronized Assault","Tactical Ploy","Tagging Shot","Through the Fray","Trickster's Hand","Turning Point","Underworld Contacts","Unrelenting Salvo","Valiant Intervention","Vigilant Stance","Vinestance","Wary","Watchful Eye","Well Dressed","Well Supplied","Windstance","Wit's End","Withering Retort"];

  // Normalize for matching: lowercase, curly→straight apostrophes, collapse whitespace.
  const norm = s => String(s ?? "").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  const wantSet = new Map(WANT.map(n => [norm(n), n]));

  const out = {
    _meta: { system: game.system.id, systemVersion: game.system.version, foundry: game.version, generated: new Date().toISOString(), wantCount: WANT.length },
    talentDataModel: null,
    found: {},          // canonical edha name -> [ { pack, fullDoc }, ... ] (one entry per matching source)
    coverage: { found: [], missing: [], duplicatesAcrossPacks: [] },
  };

  // Talent DataModel field list (once) — so we can see the shape the system declares.
  try {
    const flatten = (schema, prefix = "", acc = {}) => {
      for (const [k, f] of Object.entries(schema?.fields ?? {})) {
        const p = prefix ? `${prefix}.${k}` : k;
        acc[p] = f.constructor?.name ?? String(f);
        if (f.fields) flatten(f, p, acc);
        if (f.element?.fields) flatten(f.element, `${p}[]`, acc);
      }
      return acc;
    };
    const model = CONFIG.Item.dataModels?.talent;
    out.talentDataModel = model ? flatten(model.schema ?? model.defineSchema()) : "no talent dataModel";
  } catch (e) { out.talentDataModel = { _error: String(e) }; }

  // Consider one talent doc: if its name matches a wanted talent, record its full object + source.
  const consider = (doc, packLabel) => {
    if (doc?.type !== "talent") return;
    const canon = wantSet.get(norm(doc.name));
    if (!canon) return;
    (out.found[canon] = out.found[canon] || []).push({ pack: packLabel, doc: doc.toObject() });
  };

  // 1) Every compendium of Items.
  for (const pack of game.packs) {
    if (pack.documentName !== "Item") continue;
    let docs; try { docs = await pack.getDocuments(); } catch (e) { continue; }
    for (const d of docs) consider(d, pack.collection);
  }
  // 2) World items too (in case the content was imported into the world).
  for (const d of game.items ?? []) consider(d, "world");

  // Coverage report.
  for (const n of WANT) {
    const hits = out.found[n];
    if (!hits || !hits.length) { out.coverage.missing.push(n); continue; }
    out.coverage.found.push(n);
    const packs = [...new Set(hits.map(h => h.pack))];
    if (packs.length > 1) out.coverage.duplicatesAcrossPacks.push({ name: n, packs });
  }
  out.coverage.foundCount = out.coverage.found.length;
  out.coverage.missingCount = out.coverage.missing.length;

  // Deliver.
  const json = JSON.stringify(out, null, 2);
  try { await game.clipboard?.copyPlainText?.(json); } catch (e) { /* clipboard optional */ }
  saveDataToFile(json, "text/json", "edha-heroic-dump.json");
  console.log(`Edha | heroic dump: ${(json.length / 1024).toFixed(0)} KB — found ${out.coverage.foundCount}/${WANT.length}, missing ${out.coverage.missingCount}.`);
  if (out.coverage.missing.length) console.log("Edha | MISSING (no base-system source — edha-homebrew, will need from-scratch wiring):\n  " + out.coverage.missing.join(", "));
  console.log("Edha | commit as source-materials/system-schemas/cosmere-rpg-heroic-" + game.system.version + "-dump.json");
})();
