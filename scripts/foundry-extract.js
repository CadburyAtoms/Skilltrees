#!/usr/bin/env node
/* Edha Foundry → source EXTRACTOR.
 *
 * Snapshots talents you edited directly in Foundry back into git-tracked override
 * files (data/authored/<atlas>-<group>.json), so those edits SURVIVE the next
 * `foundry-build.js` run (which overlays them) and are version-controlled. This is
 * the "save" step of the in-Foundry editing workflow — run it after editing a tree.
 *
 * It also refreshes the build guard's baseline so the builder knows the current
 * on-disk pack is fully captured and is safe to rebuild.
 *
 * Usage:
 *   node foundry-extract.js <scope>
 *     all                  every leyline/deity/heroic pack
 *     leyline|deity|heroic a whole atlas
 *     <Group>              one tree by group name, e.g. "Fate", "White", "Warrior"
 *     baseline             only (re)establish the guard baseline from the current
 *                          packs — writes NO authored files, freezes nothing.
 *                          Run this once to arm the guard without authoring anything.
 *
 * Reads via a temp copy of the pack, so it is safe to run with Foundry open. (You
 * only need Foundry CLOSED when you later run foundry-build.js to WRITE the packs.)
 */
const fs = require("fs");
const path = require("path");
const { authorable, fingerprint, readPack, slugify } = require("./edha-pack-io.js");
// DATA/MODROOT/ATLAS_PACK moved to scripts/lib/paths.js (2026-08-10 hygiene campaign). This
// file's own copies were hardcoded with NO env override — unlike foundry-build.js's EDHA_DATA/
// EDHA_MODROOT — so a session extracting into a scratch modroot would silently read/write Ben's
// LIVE modroot instead (the exact hole the BASELINE_DIR comment below, from 2026-07-26c, already
// half-fixed for the baseline specifically). paths.js closes it for DATA/MODROOT/ATLAS_PACK too.
const { DATA, MODROOT, ATLAS_PACK } = require("./lib/paths.js");

const AUTHORED_DIR = `${DATA}/authored`;
// Beside the packs it describes — matches foundry-build.js (moved 2026-07-26c; the shared
// data-keyed location let scratch-modroot builds clobber the LIVE packs' baselines).
const BASELINE_DIR = `${MODROOT}/.baselines`;

const arg = (process.argv[2] || "all").trim();
const scope = arg.toLowerCase();
const baselineOnly = scope === "baseline";

function writeBaseline(pack, talents) {
  // Merge: keep prior entries, update the ones we just read from disk.
  const file = `${BASELINE_DIR}/${pack}.json`;
  let base = {};
  try { base = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
  for (const t of talents) base[t._id] = fingerprint(t);
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(base, null, 0));
}

(async () => {
  fs.mkdirSync(AUTHORED_DIR, { recursive: true });

  // Decide which packs to read.
  let packsToRead;
  if (baselineOnly || scope === "all") packsToRead = Object.values(ATLAS_PACK);
  else if (ATLAS_PACK[scope]) packsToRead = [ATLAS_PACK[scope]];
  else packsToRead = Object.values(ATLAS_PACK); // group-name scope → scan all, filter below

  const groupFilter = (!baselineOnly && scope !== "all" && !ATLAS_PACK[scope]) ? scope : null;

  let wroteFiles = 0, wroteTalents = 0, matchedAnyGroup = false;
  const baselinePacks = [];

  for (const pack of packsToRead) {
    const packDir = `${MODROOT}/packs/${pack}`;
    const live = await readPack(packDir);
    if (!live) { console.warn(`  (pack ${pack} not found — skipped)`); continue; }
    const talents = live.items.filter(d => d.type === "talent");
    if (!talents.length) continue;

    if (baselineOnly) {
      writeBaseline(pack, talents);
      baselinePacks.push(`${pack} (${talents.length})`);
      continue;
    }

    // Bucket by (atlas, group) from the talent's edha-content flags.
    const buckets = {}; // key -> { atlas, group, talents:[] }
    for (const t of talents) {
      const f = t.flags?.["edha-content"] || {};
      const atlas = f.atlas || "unknown";
      const group = f.group || "unknown";
      if (groupFilter && group.toLowerCase() !== groupFilter && atlas.toLowerCase() !== groupFilter) continue;
      const key = `${atlas}::${group}`;
      (buckets[key] = buckets[key] || { atlas, group, talents: [] }).talents.push(t);
    }

    // Refresh baseline only for packs actually in scope — a group-scoped extract must NOT mark
    // another pack's un-extracted edits as captured. (Whole pack refreshed: an extracted tree's
    // siblings are unchanged on disk, so recording their current fingerprint is correct.)
    const inScope = scope === "all" || ATLAS_PACK[scope] === pack || Object.keys(buckets).length > 0;
    if (inScope) { writeBaseline(pack, talents); baselinePacks.push(`${pack} (${talents.length})`); }

    for (const { atlas, group, talents: gts } of Object.values(buckets)) {
      matchedAnyGroup = true;
      const file = `${AUTHORED_DIR}/${atlas}-${slugify(group)}.json`;
      const out = {
        _meta: {
          atlas, group, pack,
          note: "Foundry-authored overrides. foundry-build.js overlays these onto the generated talents, so they win. Edit in Foundry then re-run foundry-extract.js, or hand-edit the fields below.",
          extractedAt: new Date().toISOString(),
        },
        talents: {},
      };
      for (const t of gts.sort((a, b) => a.name.localeCompare(b.name))) {
        out.talents[t.name] = { docId: t._id, ...authorable(t) };
      }
      fs.writeFileSync(file, JSON.stringify(out, null, 2));
      wroteFiles++;
      wroteTalents += gts.length;
      console.log(`  wrote ${path.relative(DATA, file)}  (${gts.length} talents)`);
    }
  }

  if (baselineOnly) {
    console.log(`Baseline armed for: ${baselinePacks.join(", ") || "(none)"}.`);
    console.log(`The builder will now refuse to overwrite un-extracted Foundry edits. No talents frozen.`);
    return;
  }
  if (groupFilter && !matchedAnyGroup) {
    console.error(`✗ No tree matched "${arg}". Known groups: leyline White/Blue/Black/Red/Green; deity domains (Death/Life/Fate/...); heroic Agent/Envoy/Hunter/Leader/Scholar/Warrior.`);
    process.exit(1);
  }
  console.log(`\nExtracted ${wroteTalents} talents into ${wroteFiles} authored file(s). Baseline refreshed: ${baselinePacks.join(", ")}.`);
  console.log(`These talents are now Foundry-authored — the builder overlays them. Commit data/authored/ in the skilltrees repo to make it permanent.`);
})().catch(e => { console.error(e); process.exit(1); });
