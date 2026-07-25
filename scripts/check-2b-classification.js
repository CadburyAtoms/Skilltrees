#!/usr/bin/env node
/* scripts/check-2b-classification.js — keep EDHA_RULE_2B_CLASSIFICATION.json honest.
 *
 * The classification is the input to the whole iron-rule-2b migration plan, so it must not be
 * allowed to drift from the ratchet list it describes, and its summary numbers must not be
 * allowed to disagree with its own per-talent entries. Both failures already happened once:
 * the 07-24f pass published a split (61/16/118/26) that nothing could reproduce.
 *
 * Checks:
 *   1. every allowlist name is classified, and nothing else is;
 *   2. the declared `split` equals the split computed from `talents`;
 *   3. every bucket is one of 1 / 1b / 2 / 3, and every bucket-2 entry names >=1 handler;
 *   4. handlerDemand consumer counts equal the counts computed from `talents`.
 *
 * Usage: node scripts/check-2b-classification.js   (exit 0 = clean)
 * Not wired into `npm run gates` — the classification is a scoped migration artifact, and it is
 * expected to SHRINK as talents convert. Run it whenever you touch either file.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const errors = [];
const err = (m) => errors.push(m);

function readJson(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8")); }
  catch (e) { err(`${rel}: cannot read/parse — ${e.message}`); return null; }
}

const cls = readJson("EDHA_RULE_2B_CLASSIFICATION.json");
const allow = readJson("scripts/name-keyed-allowlist.json");

if (cls && allow) {
  const talents = cls.talents || {};
  const listed = new Set(allow.talents || []);
  const classified = new Set(Object.keys(talents));

  // 1. coverage, both directions
  const missing = [...listed].filter((n) => !classified.has(n)).sort();
  const extra = [...classified].filter((n) => !listed.has(n)).sort();
  if (missing.length) err(`${missing.length} allowlist talent(s) have no classification entry: ${missing.join(", ")}`);
  if (extra.length) err(`${extra.length} classified talent(s) are not on the allowlist (already migrated? delete the entry): ${extra.join(", ")}`);

  // 2 + 3. buckets
  const VALID = new Set(["1", "1b", "2", "3"]);
  const computed = {};
  for (const [name, rec] of Object.entries(talents)) {
    const b = rec?.bucket;
    if (!VALID.has(b)) { err(`${name}: bucket "${b}" is not one of 1 / 1b / 2 / 3`); continue; }
    computed[b] = (computed[b] || 0) + 1;
    if (b === "2" && !(Array.isArray(rec.needs) && rec.needs.length)) {
      err(`${name}: bucket 2 means "needs a NEW generic handler" — name which one in "needs"`);
    }
    if (b === "3" && !String(rec.why || "").includes("ENGINE-OWNED")) {
      err(`${name}: bucket 3 must justify itself — start "why" with ENGINE-OWNED: <reason> (audit §9b: an undeclared exit becomes the default)`);
    }
  }
  computed.total = Object.keys(talents).length;

  const declared = cls.split || {};
  for (const k of ["1", "1b", "2", "3", "total"]) {
    const d = Number(declared[k] ?? NaN), c = Number(computed[k] || 0);
    if (d !== c) err(`split.${k}: declared ${declared[k]}, but the talents map computes ${c} — the map is the record, fix the summary`);
  }

  // 4. handler demand
  const demand = {};
  for (const rec of Object.values(talents)) {
    if (rec?.bucket !== "2") continue;
    for (const h of rec.needs || []) demand[h] = (demand[h] || 0) + 1;
  }
  const hd = cls.handlerDemand || {};
  for (const [key, rec] of Object.entries(hd)) {
    if (key.startsWith("_")) continue;
    const tag = key.split("_")[0];                    // "H8_edha_watch" -> "H8"
    const c = demand[tag] || 0, d = Number(rec?.consumers ?? NaN);
    if (d !== c) err(`handlerDemand.${key}.consumers: declared ${rec?.consumers}, computed ${c} from bucket-2 entries`);
  }
  for (const tag of Object.keys(demand)) {
    if (!Object.keys(hd).some((k) => k.split("_")[0] === tag)) {
      err(`handler "${tag}" is named in talents[].needs but has no handlerDemand entry`);
    }
  }
}

// --- `--priority`: which handler shrinks bucket 2 fastest (audit §9o) ---------
// Asks how many talents become FULLY satisfied, not how many mention a handler. Those are
// different questions and they give different answers, because most bucket-2 talents need a PAIR
// of handlers — which is why raw consumer counts undersell whichever handler you measure second.
if (!errors.length && process.argv.includes("--priority")) {
  const BUILT = new Set((process.argv.find(a => a.startsWith("--built=")) || "--built=H1,H5,H11").split("=")[1].split(",").filter(Boolean));
  const b2 = Object.entries(cls.talents).filter(([, r]) => r.bucket === "2");
  const satisfied = (set) => b2.filter(([, r]) => (r.needs || []).every(h => set.has(h))).length;

  console.log(`\nbucket 2: ${b2.length} talents · built: ${[...BUILT].join(", ") || "(none)"}`);
  const raw = {};
  for (const [, r] of b2) for (const h of r.needs || []) raw[h] = (raw[h] || 0) + 1;
  console.log("\nraw demand (talents naming it) — the MISLEADING number:");
  for (const [h, v] of Object.entries(raw).sort((a, b) => b[1] - a[1])) console.log(`  ${BUILT.has(h) ? "[built] " : "        "}${h.padEnd(5)} ${v}`);

  console.log(`\nalready satisfiable, build nothing: ${satisfied(BUILT)}`);
  console.log("  ⚠ an upper bound — `needs` records the GATE, not the PAYLOAD (audit §9n, pass D)");

  console.log("\ngreedy build order (cumulative fully-satisfied):");
  const cur = new Set(BUILT);
  let done = satisfied(cur);
  for (;;) {
    const rem = [...new Set(b2.flatMap(([, r]) => r.needs || []))].filter(h => !cur.has(h));
    if (!rem.length) break;
    let best = null, bestN = -1;
    for (const h of rem) { const n = satisfied(new Set([...cur, h])); if (n > bestN) { bestN = n; best = h; } }
    cur.add(best);
    console.log(`  +${best.padEnd(5)} ${String(bestN).padStart(3)}  (+${bestN - done})`);
    done = bestN;
  }

  const byTree = {};
  for (const [, r] of b2) { (byTree[r.tree] ||= { tot: 0, ok: 0 }).tot++; if ((r.needs || []).every(h => cur.has(h))) byTree[r.tree].ok++; }
  console.log("\nper-tree coverage at full build:");
  for (const [t, v] of Object.entries(byTree).sort()) console.log(`  ${t.padEnd(22)} ${v.ok}/${v.tot}${v.ok === v.tot ? "  ← cleared" : ""}`);
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error${errors.length === 1 ? "" : "s"}.`);
  process.exit(1);
}
const n = Object.keys(cls.talents).length;
console.log(`✓ 2b classification: ${n} talents, split ${cls.split["1"]}/${cls.split["1b"]}/${cls.split["2"]}/${cls.split["3"]} reproduces from the per-talent map.`);
