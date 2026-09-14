#!/usr/bin/env node
/* scripts/bestiary-census.js — the bestiary's measured ground truth (TODO_REPO_HYGIENE item 153,
 * the bestiary redo's step 2, 2026-09-14).
 *
 * WHY THIS EXISTS. The talent ecosystem review (docs/analysis/talent-ecosystem/) could say what a
 * defensive talent prevents but not whether that was a lot, because adversary numbers were fenced
 * out (R-101). Ben answered R-101 (a): adversary damage and HP MAY be read as a yardstick — no
 * findings about adversary design, no adversary changes. Separately, the bestiary redo (item 121)
 * has to measure the 52 blocks before redesigning any of them, and until this script nothing
 * printed the bestiary as a whole: HP/defense/attack/damage bands by role, the colour ledger the
 * lore-forge roster rule counts by hand, how much of the "automation" is a whispered cue versus an
 * effect, which blocks state their senses and movement and which inherit the derivation default,
 * and which engine primitives an adversary ability is the ONLY consumer of.
 *
 * WHAT IT MEASURES (all read straight from data/adversaries.json — nothing is played):
 *   - the roster: blocks, roles, tiers, folders, the legacy dungeon blocks with no folder;
 *   - role bands: HP, Physical/Cognitive/Spiritual defense, Deflect, attack modifier, expected
 *     damage per hit (dice average + flat), min / avg / max per role — the R-101 yardstick;
 *   - the colour ledger: attuned colours per block, a pair counting ½ to each colour (canon
 *     ruling 106 (a) / lore-forge Phase 4b: "count the ledger BEFORE proposing a roster");
 *   - wiring shapes: every `events` rule as `event → handler(trigger)`, cue vs effect vs native
 *     roll vs `noHook`, and the handler types no PC talent uses (sole consumers — drift risk);
 *   - senses and movement: stated on the block, or inherited (AWA 0 → the cosmere ladder's 5 ft,
 *     `sensesRangeFtFromAwa(0)`; walk 25 ft, the system default the schema note documents);
 *   - status ids the rules name, classified canon / Edha-custom / unknown, and immunities;
 *   - damage types across every damaging item.
 *
 * WHAT IT DOES NOT MEASURE — read this before quoting a number. It counts per HIT, not per turn:
 * how many Actions a block spends, how often it hits a real defense, and what a graze floors are
 * table facts. The bestiary yardstick bench fights (checklist section "Bestiary yardstick fights")
 * supply those, on copies of the actual PCs, the way bench run 44 did for the ford.
 *
 * DETERMINISTIC ON PURPOSE. No dates. The report carries the sha1 of the data file and of the
 * authored overlays it read, so `--check` (and tests/bestiary-census.test.js) can fail when the
 * committed report is stale — the same sync discipline the dashboard and the canon codex use.
 *
 *   node scripts/bestiary-census.js                 # markdown to stdout
 *   node scripts/bestiary-census.js --write         # regenerate docs/analysis/bestiary/CENSUS.md
 *   node scripts/bestiary-census.js --check         # exit 1 if the committed report is stale
 *   node scripts/bestiary-census.js --json <path>   # the structured result
 *
 * Honors EDHA_DATA (scripts/lib/paths.js) like the build and validators do.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { REPO_ROOT, DATA } = require("./lib/paths.js");
const { sensesRangeFtFromAwa } = require("./foundry-build-parts.js");

const REPORT_PATH = path.join(REPO_ROOT, "docs", "analysis", "bestiary", "CENSUS.md");
const ENGINE_CORE = path.join(REPO_ROOT, "module-src", "scripts", "engine", "01-shared-core.js");
const AUTHORED_DIR = path.join(DATA, "authored");
const ROLES = ["minion", "rival", "boss"];
// The schema note in data/adversaries.json (`movement`): "Omit/null = system default (25 ft)".
const DEFAULT_WALK_FT = 25;
// The 14 canon conditions (cosmere-canon-reference SKILL.md §Conditions).
const CANON_CONDITIONS = new Set(["afflicted", "determined", "disoriented", "empowered", "enhanced",
  "exhausted", "focused", "immobilized", "prone", "restrained", "slowed", "stunned", "surprised", "unconscious"]);

// ---------------------------------------------------------------- pure helpers
/** "1d6+2" → {count:1, die:6, flat:2, ev:5.5}; "2d8" → ev 9; "3" → ev 3; prose → null. */
function parseDamage(str) {
  if (str == null) return null;
  const s = String(str).trim();
  let m = /^(\d+)\s*d\s*(\d+)\s*(?:([+-])\s*(\d+))?$/i.exec(s);
  if (m) {
    const count = +m[1], die = +m[2];
    const flat = m[3] ? (m[3] === "-" ? -1 : 1) * +m[4] : 0;
    return { count, die, flat, ev: count * (die + 1) / 2 + flat, text: s };
  }
  m = /^(\d+)$/.exec(s);
  if (m) return { count: 0, die: 0, flat: +m[1], ev: +m[1], text: s };
  return null;
}

function stats(nums) {
  const xs = nums.filter((n) => Number.isFinite(n));
  if (!xs.length) return { n: 0, min: null, avg: null, max: null };
  const sum = xs.reduce((a, b) => a + b, 0);
  return { n: xs.length, min: Math.min(...xs), avg: Math.round((sum / xs.length) * 10) / 10, max: Math.max(...xs) };
}

// Keys that carry the word "status" but not a status id: `statusExpire` names WHO the timer follows
// ("owner" / "target") and `consumeSelfStatus` is a boolean dial. Every other `*status*` key in the
// authored data and the adversary file holds a status id or a comma list of them (measured 2026-09-14).
const NOT_A_STATUS_ID = new Set(["statusExpire", "consumeSelfStatus"]);
/** Every string value under a key naming a status, anywhere inside a handler object. */
function statusIdsIn(obj, out = []) {
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (/status/i.test(k) && !NOT_A_STATUS_ID.has(k)) {
      if (typeof v === "string") for (const s of v.split(/[,\s]+/)) if (s) out.push(s.toLowerCase());
      else if (Array.isArray(v)) for (const s of v) if (typeof s === "string") out.push(s.toLowerCase());
    }
    if (v && typeof v === "object") statusIdsIn(v, out);
  }
  return out;
}

function sha1(buf) { return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12); }

// ---------------------------------------------------------------- context (repo reads)
/** The handler types PC talents use (data/authored/*.json), the engine's custom statuses, stamps. */
function loadContext() {
  const pcHandlerTypes = new Set();
  const authoredFiles = fs.existsSync(AUTHORED_DIR)
    ? fs.readdirSync(AUTHORED_DIR).filter((f) => f.endsWith(".json")).sort() : [];
  const authoredHash = crypto.createHash("sha1");
  for (const f of authoredFiles) {
    const buf = fs.readFileSync(path.join(AUTHORED_DIR, f));
    authoredHash.update(f).update(buf);
    let j; try { j = JSON.parse(buf); } catch (e) { continue; }
    for (const t of Object.values(j.talents || {})) {
      const ev = t && t.events;
      const rules = Array.isArray(ev) ? ev : Object.values(ev || {});
      for (const r of rules) { const ty = r && r.handler && r.handler.type; if (ty) pcHandlerTypes.add(ty); }
    }
  }
  const customStatuses = new Set();
  if (fs.existsSync(ENGINE_CORE)) {
    const src = fs.readFileSync(ENGINE_CORE, "utf8");
    const m = /const EDHA_STATUSES\s*=\s*\{([\s\S]*?)\n\};/.exec(src);
    if (m) for (const k of m[1].matchAll(/^\s{2}([a-z]+):/gm)) customStatuses.add(k[1]);
  }
  const dataPath = path.join(DATA, "adversaries.json");
  const dataBuf = fs.readFileSync(dataPath);
  return {
    data: JSON.parse(dataBuf),
    pcHandlerTypes,
    customStatuses,
    stamps: { adversaries: sha1(dataBuf), authored: authoredHash.digest("hex").slice(0, 12), authoredFiles: authoredFiles.length },
  };
}

// ---------------------------------------------------------------- the census
function census(data, ctx = {}) {
  const pcTypes = ctx.pcHandlerTypes || new Set();
  const custom = ctx.customStatuses || new Set();
  const names = Object.keys(data).filter((k) => k !== "_README" && data[k] && typeof data[k] === "object");
  const blocks = [];
  const shapes = {};
  const damageTypes = {};
  const statusUse = {};
  const handlerBlocks = {};
  const unparsedDamage = [];
  const ledger = { white: 0, blue: 0, black: 0, red: 0, green: 0 };
  let unattuned = 0;

  for (const name of names) {
    const a = data[name];
    const items = Array.isArray(a.items) ? a.items : [];
    const leylines = (a.leylines || []).map((c) => String(c).toLowerCase());
    if (!leylines.length) unattuned++;
    for (const c of leylines) if (c in ledger) ledger[c] += 1 / leylines.length;

    const attackMods = [], hitEvs = [], types = new Set(), ruleShapes = [];
    let native = 0, cues = 0, effects = 0, noHook = 0, rules = 0;
    const statuses = [];
    for (const it of items) {
      if (it.attack != null || it.damage != null || it.heal != null) native++;
      if (typeof it.attack === "number") attackMods.push(it.attack);
      if (it.damage != null) {
        const d = parseDamage(it.damage);
        if (d) hitEvs.push(d.ev); else unparsedDamage.push(`${name} / ${it.name}: ${JSON.stringify(it.damage)}`);
        const ty = it.damageType || "(none)";
        types.add(ty); damageTypes[ty] = (damageTypes[ty] || 0) + 1;
      }
      if (it.noHook) noHook++;
      for (const r of (Array.isArray(it.events) ? it.events : [])) {
        rules++;
        const h = r.handler || {};
        const type = h.type || "?";
        const shape = `${r.event || "?"} → ${type}${h.trigger ? `(${h.trigger})` : ""}`;
        shapes[shape] = (shapes[shape] || 0) + 1;
        ruleShapes.push(shape);
        if (type === "edha-gm-cue") cues++; else effects++;
        (handlerBlocks[type] = handlerBlocks[type] || new Set()).add(name);
        for (const s of statusIdsIn(h)) { statuses.push(s); (statusUse[s] = statusUse[s] || new Set()).add(name); }
      }
    }
    const immunities = (a.conditionImmunities || []).map((s) => String(s).toLowerCase());
    for (const s of immunities) (statusUse[s] = statusUse[s] || new Set()).add(name);

    blocks.push({
      name, folder: a.folder || null, legacy: !a.folder || /^Legacy\b/.test(a.folder), role: a.role || "rival", tier: a.tier ?? 1, size: a.size || "medium",
      creatureType: a.creatureType || "humanoid", count: a.count || 1, leylines,
      hp: a.hp, phy: a.defenses && a.defenses.phy, cog: a.defenses && a.defenses.cog, spi: a.defenses && a.defenses.spi,
      deflect: a.deflect || 0, foc: a.foc || 0, inv: a.inv ?? (leylines.length ? 2 : 0),
      skills: a.skills || {}, talents: a.talents || [], immunities,
      sensesFt: a.senses != null ? Number(a.senses) : sensesRangeFtFromAwa(0), sensesStated: a.senses != null,
      walkFt: a.movement != null ? Number(a.movement) : DEFAULT_WALK_FT, walkStated: a.movement != null,
      items: items.length, native, rules, cues, effects, noHook, attackMods, hitEvs,
      bestHitEv: hitEvs.length ? Math.max(...hitEvs) : null, damageTypes: [...types].sort(), ruleShapes,
      placeholderArt: typeof a.img === "string" && a.img.startsWith("icons/"),
    });
  }

  const bands = {};
  for (const role of ROLES) {
    const bs = blocks.filter((b) => b.role === role);
    bands[role] = {
      blocks: bs.length,
      hp: stats(bs.map((b) => b.hp)), phy: stats(bs.map((b) => b.phy)), cog: stats(bs.map((b) => b.cog)), spi: stats(bs.map((b) => b.spi)),
      deflect: stats(bs.map((b) => b.deflect)), foc: stats(bs.map((b) => b.foc)),
      attack: stats(bs.flatMap((b) => b.attackMods)), hitEv: stats(bs.flatMap((b) => b.hitEvs)),
    };
  }
  const soleConsumers = Object.keys(handlerBlocks).filter((t) => !pcTypes.has(t)).sort()
    .map((t) => ({ type: t, blocks: [...handlerBlocks[t]].sort() }));
  const statuses = Object.keys(statusUse).sort().map((id) => ({
    id, blocks: [...statusUse[id]].sort(),
    kind: CANON_CONDITIONS.has(id) ? "canon" : custom.has(id) ? "edha-custom" : "unknown",
  }));
  const folders = {};
  for (const b of blocks) { const f = b.folder || "(no folder — a mistake since R-130: every block states one)"; (folders[f] = folders[f] || []).push(b.name); }

  return {
    stamps: ctx.stamps || null,
    totals: {
      blocks: blocks.length,
      roles: Object.fromEntries(ROLES.map((r) => [r, blocks.filter((b) => b.role === r).length])),
      tiers: blocks.reduce((m, b) => { m[b.tier] = (m[b.tier] || 0) + 1; return m; }, {}),
      folders: Object.keys(folders).length, legacy: blocks.filter((b) => b.legacy).length,
      items: blocks.reduce((n, b) => n + b.items, 0), rules: blocks.reduce((n, b) => n + b.rules, 0),
      cues: blocks.reduce((n, b) => n + b.cues, 0), effects: blocks.reduce((n, b) => n + b.effects, 0),
      native: blocks.reduce((n, b) => n + b.native, 0), noHook: blocks.reduce((n, b) => n + b.noHook, 0),
      talentBlocks: blocks.filter((b) => b.talents.length).length, talents: blocks.reduce((n, b) => n + b.talents.length, 0),
      sensesStated: blocks.filter((b) => b.sensesStated).length, walkStated: blocks.filter((b) => b.walkStated).length,
      placeholderArt: blocks.filter((b) => b.placeholderArt).length, unattuned,
    },
    ledger: Object.fromEntries(Object.entries(ledger).map(([c, v]) => [c, Math.round(v * 10) / 10])),
    bands, folders, blocks, shapes, soleConsumers, statuses, damageTypes, unparsedDamage,
  };
}

// ---------------------------------------------------------------- markdown
function fmt(s) { return s.n ? `${s.min} – ${s.max} (avg ${s.avg})` : "—"; }
function renderMarkdown(r) {
  const L = [];
  const t = r.totals;
  L.push(`# Bestiary census — measured ground truth for the ${t.blocks} adversary blocks`, "");
  L.push("Generated by `node scripts/bestiary-census.js --write` — **do not edit by hand.** Read straight from " +
    (r.stamps ? `\`data/adversaries.json\` @ \`${r.stamps.adversaries}\` and the ${r.stamps.authoredFiles} authored overlays @ \`${r.stamps.authored}\`` : "the data") +
    "; regenerate after either changes (`tests/bestiary-census.test.js` fails while this file is stale). " +
    "The standard these numbers are read against is `.claude/skills/bestiary-forge/STANDARD.md`; the scope licence is R-101 (a): a yardstick, not a finding about adversary design.", "");
  L.push("**Per hit, not per turn.** Every damage figure is the expected value of one landed hit (dice average plus flat modifier). Actions per turn, hit rates against real defenses and the graze floor are table facts the bestiary yardstick bench fights measure, on copies of the actual PCs.", "");

  L.push("## 1. The roster", "");
  L.push("| | |", "|---|---|");
  L.push(`| Blocks | ${t.blocks} in ${t.folders} folders (${t.legacy} legacy playtest-dungeon blocks, kept apart in the \`Legacy — Playtest Dungeon\` folder since R-130 (a)) |`);
  L.push(`| Roles | ${ROLES.map((x) => `${t.roles[x]} ${x}`).join(", ")} |`);
  L.push(`| Tiers | ${Object.entries(t.tiers).sort().map(([k, v]) => `${v} at tier ${k}`).join(", ")} |`);
  L.push(`| Bespoke items | ${t.items}: ${t.native} roll natively (attack / damage / heal), ${t.rules} event rules (${t.cues} GM cues, ${t.effects} effects), ${t.noHook} declare \`noHook\` |`);
  L.push(`| Tree talents on blocks | ${t.talents} talents on ${t.talentBlocks} blocks |`);
  L.push(`| Senses stated / movement stated | ${t.sensesStated} / ${t.walkStated} blocks (the rest inherit AWA 0 → ${sensesRangeFtFromAwa(0)} ft and the ${DEFAULT_WALK_FT} ft walk default) |`);
  L.push(`| Placeholder art in data | ${t.placeholderArt} blocks point at a core icon (the build swaps in real art from \`art/adversaries/\` when Ben drops it) |`, "");

  L.push("## 2. Role bands — the R-101 yardstick", "");
  L.push("| Role | Blocks | HP | Phy def | Cog def | Spi def | Deflect | Focus | Attack mod | Damage per hit (EV) |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const role of ROLES) { const b = r.bands[role]; L.push(`| ${role} | ${b.blocks} | ${fmt(b.hp)} | ${fmt(b.phy)} | ${fmt(b.cog)} | ${fmt(b.spi)} | ${fmt(b.deflect)} | ${fmt(b.foc)} | ${fmt(b.attack)} | ${fmt(b.hitEv)} |`); }
  L.push("");

  L.push("## 3. The colour ledger (statted blocks; a pair counts ½ to each colour)", "");
  L.push("| White | Blue | Black | Red | Green | Unattuned |", "|---|---|---|---|---|---|");
  L.push(`| ${r.ledger.white} | ${r.ledger.blue} | ${r.ledger.black} | ${r.ledger.red} | ${r.ledger.green} | ${t.unattuned} |`, "");

  L.push("## 4. Every block", "");
  L.push("Senses and Move read **(d)** when the block inherits the derivation default instead of stating a value. Rules read cues / effects / native rolls / `noHook`.", "");
  L.push("| Block | Folder | Role · tier | Colours | HP | Phy/Cog/Spi | Dfl | Atk | Best hit EV | Types | Senses | Move | Rules | Talents |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const b of [...r.blocks].sort((x, y) => (x.folder || "").localeCompare(y.folder || "") || x.name.localeCompare(y.name))) {
    L.push(`| ${b.name}${b.count > 1 ? ` ×${b.count}` : ""} | ${b.folder || "—"} | ${b.role} · T${b.tier} | ${b.leylines.join("+") || "—"} | ${b.hp} | ${b.phy}/${b.cog}/${b.spi} | ${b.deflect} | ${b.attackMods.length ? [...new Set(b.attackMods)].sort((p, q) => p - q).join("/") : "—"} | ${b.bestHitEv == null ? "—" : b.bestHitEv} | ${b.damageTypes.join(", ") || "—"} | ${b.sensesFt}${b.sensesStated ? "" : " (d)"} | ${b.walkFt}${b.walkStated ? "" : " (d)"} | ${b.cues}/${b.effects}/${b.native}/${b.noHook} | ${b.talents.length ? b.talents.join(", ") : "—"} |`);
  }
  L.push("");

  L.push("## 5. Wiring shapes (`event → handler(trigger)`, most common first)", "");
  L.push("| Count | Shape |", "|---|---|");
  for (const [shape, n] of Object.entries(r.shapes).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) L.push(`| ${n} | \`${shape}\` |`);
  L.push("");

  L.push("## 6. Sole consumers — handler types no PC talent uses", "");
  L.push("An adversary ability that is the only consumer of an engine primitive is the one place a regression in that primitive shows. The ecosystem critique's caution about `Probability Net`'s summing formula channel is the shape of the risk; this table sees handler TYPES only, not modes inside one. Not a defect list: a check-here-first list.", "");
  if (!r.soleConsumers.length) L.push("_None — every handler type an adversary uses is also used by a PC talent._");
  else { L.push("| Handler type | Blocks |", "|---|---|"); for (const s of r.soleConsumers) L.push(`| \`${s.type}\` | ${s.blocks.join(", ")} |`); }
  L.push("");

  L.push("## 7. Status ids named by adversary rules and immunities", "");
  L.push("`canon` = one of the 14 published conditions; `edha-custom` = registered in the engine's `EDHA_STATUSES`; `unknown` = neither, which the build would drop silently.", "");
  L.push("| Status id | Kind | Blocks |", "|---|---|---|");
  for (const s of r.statuses) L.push(`| \`${s.id}\` | ${s.kind} | ${s.blocks.join(", ")} |`);
  L.push("");

  L.push("## 8. Damage types across every damaging item", "");
  L.push("| Type | Items |", "|---|---|");
  for (const [ty, n] of Object.entries(r.damageTypes).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) L.push(`| ${ty} | ${n} |`);
  L.push("");

  if (r.unparsedDamage.length) {
    L.push("## 9. Damage strings the EV parser could not read", "");
    for (const u of r.unparsedDamage) L.push(`- ${u}`);
    L.push("");
  }
  return L.join("\n") + "\n";
}

function freshReport() { const ctx = loadContext(); return renderMarkdown(census(ctx.data, ctx)); }

// ---------------------------------------------------------------- CLI
function main(argv) {
  const ctx = loadContext();
  const result = census(ctx.data, ctx);
  const md = renderMarkdown(result);
  const ji = argv.indexOf("--json");
  if (ji !== -1 && argv[ji + 1]) fs.writeFileSync(argv[ji + 1], JSON.stringify(result, null, 2) + "\n");
  if (argv.includes("--check")) {
    const current = fs.existsSync(REPORT_PATH) ? fs.readFileSync(REPORT_PATH, "utf8") : "";
    if (current !== md) { console.error(`bestiary-census: ${path.relative(REPO_ROOT, REPORT_PATH)} is STALE — run \`node scripts/bestiary-census.js --write\` and commit it.`); return 1; }
    console.log(`bestiary-census: ${path.relative(REPO_ROOT, REPORT_PATH)} is in sync (${result.totals.blocks} blocks).`);
    return 0;
  }
  if (argv.includes("--write")) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, md);
    console.log(`bestiary-census: wrote ${path.relative(REPO_ROOT, REPORT_PATH)} (${result.totals.blocks} blocks, ${result.totals.rules} rules).`);
    return 0;
  }
  process.stdout.write(md);
  return 0;
}

module.exports = { parseDamage, stats, statusIdsIn, census, renderMarkdown, loadContext, freshReport, REPORT_PATH, CANON_CONDITIONS, DEFAULT_WALK_FT };
if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { console.error(`bestiary-census: ${e.stack || e}`); process.exit(2); }
}
