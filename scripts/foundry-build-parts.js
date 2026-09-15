/* scripts/foundry-build-parts.js — pure, dependency-free pieces of the generator.
 *
 * `foundry-build.js` cannot be require()d from a test: it resolves `classic-level` at load and
 * then runs its whole build in a top-level async IIFE. Anything in it that is worth pinning with
 * a unit test therefore has to live here instead, and be required BY the generator — never
 * copy-pasted, or the copy drifts from the shipped behaviour and the test starts lying.
 *
 * Required by: scripts/foundry-build.js, tests/pipeline.test.js.
 *
 * `loadJson` (from ./lib/data.js, required below) pulls in ./edha-pack-io.js for `slugify` —
 * that module resolves classic-level LAZILY inside readPack() only, so requiring it here does
 * NOT require classic-level to be installed (verified: this file loads fine with no
 * node_modules/classic-level present, which is the state a bare test run is in).
 */
"use strict";
const fs = require("fs");
const { loadJson } = require("./lib/data.js");

// Split a prerequisite string into AND-groups of OR-alternatives.
//   "Bone Garden or Speak with the Fallen; Green 2+"  ->  [[Bone Garden, Speak with the Fallen], [Green 2+]]
//
// `isName` (optional) resolves a string to a real talent name. It exists because the separators
// are ENGLISH WORDS that also occur inside talent names: splitting unconditionally on /\s+and\s+/
// tore Scholar's "Mind and Body" into "Mind" + "Body", neither of which resolves, so Know Your
// Moment's talent prerequisite was silently DROPPED and the card demanded only Deduction 2+
// (found 2026-07-24). Any talent whose name contains " and " / " or " was unreferenceable.
// So: try the whole fragment as a name BEFORE splitting it further, at each level. Without an
// `isName` the behaviour is exactly as before, which keeps any pure-string caller working.
function prereqGroups(s, isName) {
  if (!s || /^\s*[—-]\s*$/.test(String(s))) return [];
  const known = (x) => typeof isName === "function" && !!isName(x);
  const out = [];
  for (const chunk of String(s).split(/\s*[;,]\s*/).map(p => p.trim()).filter(Boolean)) {
    // A whole ;-delimited chunk that IS a talent name is one group, never split on and/or.
    if (known(chunk)) { out.push([chunk]); continue; }
    for (const part of chunk.split(/\s+and\s+/i).map(p => p.trim()).filter(Boolean)) {
      if (known(part)) { out.push([part]); continue; }
      out.push(part.split(/\s+or\s+/i).map(x => x.trim()).filter(Boolean));
    }
  }
  return out;
}

// The scope an authored overlay belongs to: ONE tree, keyed "<atlas>/<group>", lowercased so a
// case drift between `_meta.group` and `tree.group` can never silently miss. This is the unit the
// name fallback is allowed to search — see loadAuthoredIndex.
function authoredScopeKey(atlas, group) {
  return `${String(atlas || "").trim()}/${String(group || "").trim()}`.toLowerCase();
}

// Build the authored-overlay index: <dataDir>/authored/*.json ->
//   { byId, byTree, collisions, ambiguous, count }.
//
// TODO_REPO_HYGIENE #16: foundry-build.js used to read this directory inline with
// `try { j = JSON.parse(...) } catch { continue; }` per file — a malformed authored file was
// dropped with NO message, and the build shipped that whole tree from the generator + side
// tables (bootstrap text, no automation) instead of failing. Each file is now read through
// `loadJson` (scripts/lib/data.js), which THROWS, naming the file, on a read or parse failure —
// the caller (foundry-build.js) is expected to let that propagate and fail the build loudly.
//
// TODO_REPO_HYGIENE #18: the index used to carry a GLOBAL `byName` map, built last-file-wins
// across all 21 overlays, and foundry-build.js consulted it whenever the docId lookup missed.
// Twelve talent names live in 2–7 different overlay files (Hardy ×7, Mighty ×6, Collected ×5,
// Composed, Baleful, Surefooted, Shatter Focus, …), so that fallback could hand a talent ANOTHER
// TREE'S overlay — and the fallback is not dormant: a docId is `fid("talent:<tree>:<name>")`, so
// it changes on every rename, and deity/Knowledge's "The Final Study" already resolves by name
// today because its stored docId no longer matches its current name. It landed on the right
// overlay only by luck of file order. The global map is therefore GONE, replaced by `byTree` —
// one name map per tree scope — so the fallback cannot leave the talent's own atlas+group.
// Do not re-add a flat byName; `authoredOverlayFor` below is the only intended lookup.
//
// `collisions` = names present in ≥2 DIFFERENT scopes (harmless now that the fallback is scoped,
// but listed in the build log so the hazard stays visible); `ambiguous` = the same name defined
// twice WITHIN one scope, which is a genuine last-one-wins coin flip and is warned about loudly.
//
// A MISSING `authored/` directory itself is not an error (matches the pre-existing behaviour:
// some data dirs used in tests/scratch builds omit it entirely) — only a per-file read/parse
// failure throws.
function loadAuthoredIndex(dataDir, { warn = console.warn } = {}) {
  const byId = {}, byTree = {};
  let files = [];
  try { files = fs.readdirSync(`${dataDir}/authored`).filter((f) => f.endsWith(".json")).sort(); }
  catch { return { byId, byTree, collisions: [], ambiguous: [], count: 0 }; }
  let count = 0;
  const seen = new Map();   // talent name -> Map(scope -> [file, ...])
  for (const f of files) {
    const j = loadJson(`${dataDir}/authored/${f}`);   // throws, naming the file, on a broken read/parse
    // Convention (scripts/lib/data.js): data/authored/<atlas>-<group>.json, with the same pair
    // repeated in `_meta`. `_meta` wins; the filename is the fallback so an overlay written
    // without `_meta` still lands in a real scope instead of a catch-all bucket.
    const stem = f.replace(/\.json$/i, "");
    const dash = stem.indexOf("-");
    const meta = j._meta || {};
    const scope = authoredScopeKey(
      meta.atlas || (dash > 0 ? stem.slice(0, dash) : stem),
      meta.group || (dash > 0 ? stem.slice(dash + 1) : "")
    );
    const bucket = (byTree[scope] ||= {});
    for (const [name, entry] of Object.entries(j.talents || {})) {
      if (entry && entry.docId) byId[entry.docId] = entry;
      bucket[name] = entry; count++;
      const scopes = seen.get(name) || new Map();
      scopes.set(scope, [...(scopes.get(scope) || []), f]);
      seen.set(name, scopes);
    }
  }
  const collisions = [], ambiguous = [];
  for (const [name, scopes] of [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const [scope, inScope] of scopes) {
      if (inScope.length > 1) ambiguous.push({ name, scope, files: inScope });
    }
    if (scopes.size > 1) collisions.push({ name, scopes: [...scopes.keys()].sort() });
  }
  for (const a of ambiguous) {
    warn(`  [authored] AMBIGUOUS: "${a.name}" is defined twice in scope ${a.scope} (${a.files.join(", ")}) — last file wins`);
  }
  const line = formatAuthoredCollisions(collisions);
  if (line) warn(line);
  return { byId, byTree, collisions, ambiguous, count };
}

// The ONE build-log line that makes cross-tree name collisions visible; null when there are none.
// Kept separate from loadAuthoredIndex so a test can pin the exact text the build prints.
function formatAuthoredCollisions(collisions) {
  if (!collisions || !collisions.length) return null;
  return `  [authored] ${collisions.length} talent name(s) appear in more than one overlay — the name ` +
         `fallback is scoped to each talent's own atlas+group, so these cannot cross trees: ` +
         collisions.map((c) => `${c.name} ×${c.scopes.length}`).join(", ");
}

// Resolve the authored overlay for one generated talent. The docId is authoritative; the name is
// only a fallback, and only WITHIN the talent's own tree (TODO_REPO_HYGIENE #18 — see above).
function authoredOverlayFor(index, { docId, name, atlas, group }) {
  if (docId && index.byId[docId]) return index.byId[docId];
  const bucket = index.byTree[authoredScopeKey(atlas, group)];
  return bucket ? bucket[name] : undefined;
}

// Senses Range in ft from Awareness — the COSMERE SYSTEM'S OWN ladder, `[5,10,20,50,100,∞]` indexed
// by ceil(AWA/2) (cosmere-rpg 2.1.0 `SENSES_RANGES` / `awarenessToSensesRange`, index.js:8534-8538).
// ONE rule for PCs and adversaries alike (EDHA_RULINGS.md R-56, ANSWERED-final 2026-09-07: "Cosmere
// ladder for everyone" → item 83, reversing R-56 (a)'s Edha table of 2026-09-06). The system itself
// derives the SHEET for every actor type; this is the build-time copy that stamps the pack's
// prototype-token sight so the token matches the sheet, and the engine's `edhaSensesRangeFtFromAwa`
// is the runtime copy for the same reason. tests/adversary-senses.test.js pins the two term-for-term
// so they cannot drift apart.
const SENSES_RANGES_FT = [5, 10, 20, 50, 100, Number.MAX_SAFE_INTEGER];
function sensesRangeFtFromAwa(awa) {
  const a = Number(awa) || 0;
  return SENSES_RANGES_FT[Math.min(Math.max(0, Math.ceil(a / 2)), SENSES_RANGES_FT.length - 1)];
}

// R-128 (a), 2026-09-14: a block may state `attributes` — the six cosmere attribute ids, integers,
// omitted keys 0. `advAttributeValues` is the total read (always six numbers); `advAttributes` is
// what the build WRITES (only the stated keys, `{value}` each — the system's DataModel shape, bonus
// left to its default) or null when the block states none, so a block without the key builds
// byte-identically to before R-128.
const ATTRIBUTE_IDS = ["str", "spd", "int", "wil", "awa", "pre"];
function advAttributeValues(adv) {
  const out = {};
  for (const id of ATTRIBUTE_IDS) out[id] = Number(adv?.attributes?.[id]) || 0;
  return out;
}
function advAttributes(adv) {
  if (!adv || adv.attributes == null || typeof adv.attributes !== "object") return null;
  const vals = advAttributeValues(adv);
  const sys = {};
  for (const id of ATTRIBUTE_IDS) if (adv.attributes[id] != null) sys[id] = { value: vals[id] };
  return Object.keys(sys).length ? sys : null;
}
// The attuned block's default Investiture pool: the PC derivation 2 + max(AWA, PRE) (ruling 49) —
// 2 at attributes 0, which every block was before R-128. An unattuned block has no pool.
function advInvDefault(adv) {
  if (!(adv?.leylines || []).length) return 0;
  const v = advAttributeValues(adv);
  return 2 + Math.max(v.awa, v.pre);
}

// An adversary block's Senses Range: its explicit `senses` (ft) is the bespoke override and wins;
// otherwise the ladder at the block's AWA — 0 for every block that states no attributes, so the
// default is ladder(0) = **5 ft** since item 83, the same number the SYSTEM derives on the sheet;
// ladder(AWA) once a block states attributes (R-128 (a), 2026-09-14), which is again what the
// system derives. The build reads this for the prototype token so pack sheet and token agree (they
// shipped a FLAT 10 against a derived 5 until item 55 — bench run 22, 52/52 mismatched — then 10/10
// under R-56 (a); item 83 takes both to 5). Senses Range is the radius a token perceives with its
// primary sense OBSCURED (darkness, dim light); in lit areas it sees as far as the light goes, on
// PCs and adversaries alike (Ben, R-128's answer).
function advSensesRangeFt(adv) {
  const explicit = Number(adv?.senses);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  return sensesRangeFtFromAwa(advAttributeValues(adv).awa);
}

// ---------------------------------------------------------------------------------------------
// R-137 (Ben, chat 2026-09-14): "adversaries need to follow the same rules as the PCs do … They
// have attributes, they have skill ranks in relevant skills, they have talents right off the talent
// trees." The cosmere system already rolls an adversary's attack the way it rolls a PC's — the item
// roll's `@mod` is skill rank + attribute (index.js `getSkillTestRollData`), the damage roll appends
// the same modifier (`rollDamage` → `${formula} + ${mod}`, the damage skill falling through to the
// attack skill in `rollAttack`), and the graze is the bare dice (`@damage.dice`). The FLAT model this
// build carried from July stored the whole attack as `attack: N` in `modifierFormula` and the whole
// damage as `1d6+N`, which was right only while every block's attributes were 0. Once R-128 let a
// block state attributes, the seven PR-#388 blocks rolled STR/SPD on top of both numbers (bench-
// verified 2026-09-15: a STR 2 Raider's Shortsword rolled `1d20 + 2 + 4` and `1d6 + 1 + 2`).
//
// THE MODEL, for a block that states `attributes` (the migration marker — a block that states none
// keeps the flat model and builds byte-identically until its nation pass migrates it):
//   attack  = d20 + (attribute + skill rank)            [+ `attackBonus`, only when the block states one]
//   damage  = the weapon's dice + (attribute + skill rank)   — `damage` is written as DICE ONLY
//   graze   = the dice (or the block's `graze` override)
// No stored number may double-count the skill modifier: a numeric `attack`, a `skill` override on
// an attack item, or a flat term inside an attack item's `damage` is a validator error on a
// migrated block (scripts/validate-adversary-model.js, gate `adversary-model`). The published
// companions-and-adversaries pack (system 2.1.0, read live 2026-09-15) has exactly this shape on all
// 20 of its blocks: attributes + ranks, `modifierFormula` empty, damage "1d8", defenses derived.
//
// `SKILL_ATTR` is the system's own skill → attribute map (CONFIG.COSMERE.skills[id].attribute at
// 2.1.0) plus the five leyline colours the engine registers as core skills; `ROLE_LEYLINE_RANK` is
// canon ruling 122 (an attuned adversary's colour rank is its ROLE — minion 1 / rival 2 / boss 3).
// Both lived in foundry-build.js until the model needed them here, where tests can reach them.
const SKILL_ATTR = { white:"wil", blue:"int", black:"pre", red:"str", green:"awa", agi:"spd", ath:"str", hwp:"str", lwp:"spd", stl:"spd", thv:"spd", cra:"int", ded:"int", dis:"wil", inm:"wil", lor:"int", med:"int", dec:"pre", ins:"awa", lea:"pre", prc:"awa", prs:"pre", sur:"awa" };
const ROLE_LEYLINE_RANK = { minion: 1, rival: 2, boss: 3 };

// The block's skill ranks as the build writes them: each attuned colour at the role rank (canon
// ruling 122) unless `skills` states it; every explicit `skills` entry as given.
function advSkills(adv) {
  const skills = {};
  for (const c of adv.leylines || []) skills[String(c).toLowerCase()] = { rank: ROLE_LEYLINE_RANK[adv.role || "rival"] || 1 };
  for (const [id, rank] of Object.entries(adv.skills || {})) skills[id] = { rank: Number(rank) || 0 };
  return skills;
}

/** True when the block states `attributes` — i.e. it is on the PC model (R-137). */
function advOnPcModel(adv) { return advAttributes(adv) != null; }

/** "1d6" / "2d8" / "1d10" → {count, die, ev, text}; a flat term, a sum, or prose → null. */
function parseDiceOnly(str) {
  const m = /^\s*(\d+)\s*d\s*(\d+)\s*$/i.exec(String(str ?? ""));
  return m ? { count: +m[1], die: +m[2], ev: +m[1] * (+m[2] + 1) / 2, text: `${+m[1]}d${+m[2]}` } : null;
}

/** The skill an attack item tests on the PC model: `attackSkill` if stated, else a weapon's
 *  default by range (ranged → Light Weaponry, melee → Heavy Weaponry — the flat model's own rule). */
function advAttackSkill(raw) {
  if (raw?.attackSkill) return String(raw.attackSkill).toLowerCase();
  if (raw?.kind === "weapon") return /\brange\b/i.test(raw.range || "") ? "lwp" : "hwp";
  return null;
}

/** Is this item an attack? Flat model: it states a numeric `attack`. PC model: it is a weapon or
 *  it states `attackSkill` (a to-hit-only grab states the skill and no damage). */
function advIsAttackItem(adv, raw) {
  if (!raw || typeof raw !== "object") return false;
  return advOnPcModel(adv) ? (raw.attackSkill != null || raw.kind === "weapon") : raw.attack != null;
}

/** The derived numbers of an attack item on the PC model, or null when the block is on the flat
 *  model or the item is not an attack. `mod` is what the system adds to BOTH the d20 and the damage;
 *  `bonus` (attackBonus) reaches the d20 only, through `modifierFormula`, exactly as a PC talent's
 *  flat bonus would. `dice` is null when `damage` is not dice-only (the validator's job to refuse). */
function advAttackModel(adv, raw) {
  if (!advIsAttackItem(adv, raw) || !advOnPcModel(adv)) return null;
  const skill = advAttackSkill(raw);
  const attribute = SKILL_ATTR[skill] || null;
  const rank = advSkills(adv)[skill]?.rank ?? 0;
  const attrValue = attribute ? advAttributeValues(adv)[attribute] : 0;
  const bonus = Number.isInteger(Number(raw.attackBonus)) ? Number(raw.attackBonus) : 0;
  const dice = raw.damage != null ? parseDiceOnly(raw.damage) : null;
  const mod = attrValue + rank;
  return {
    skill, attribute, rank, attrValue, bonus, mod,
    attackTotal: mod + bonus,
    dice,
    hitFormula: dice ? (mod ? `${dice.text}+${mod}` : dice.text) : null,
    hitEv: dice ? dice.ev + mod : null,
    grazeFormula: raw.graze ? String(raw.graze) : (dice ? dice.text : null),
  };
}

/** "+4", "+0", "−1" — the card's Attack label. */
function signed(n) { return (n < 0 ? "−" : "+") + Math.abs(n); }

/** R-139 (a) (Ben, 2026-09-15): on the PC model the three defenses DERIVE — 10 + the attribute pair,
 *  the system's own rule (index.js prepareSecondaryDerivedData) and the published pack's shape on
 *  all 20 of its blocks. The build writes no override for such a block; a stated `defenses` there
 *  must equal this (the model gate refuses one that does not). HP, Focus and Investiture stay stated. */
function advDefenses(adv) {
  const v = advAttributeValues(adv);
  return { phy: 10 + v.str + v.spd, cog: 10 + v.int + v.wil, spi: 10 + v.awa + v.pre };
}

module.exports = { prereqGroups, loadAuthoredIndex, authoredScopeKey, authoredOverlayFor, formatAuthoredCollisions, sensesRangeFtFromAwa, advSensesRangeFt, ATTRIBUTE_IDS, advAttributeValues, advAttributes, advInvDefault,
  SKILL_ATTR, ROLE_LEYLINE_RANK, advSkills, advOnPcModel, parseDiceOnly, advAttackSkill, advIsAttackItem, advAttackModel, signed, advDefenses };
