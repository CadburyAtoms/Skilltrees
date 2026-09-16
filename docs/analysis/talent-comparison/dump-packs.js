#!/usr/bin/env node
/* Dump copied LevelDB compendium packs to JSON, one file per pack.
 *
 *   node docs/analysis/talent-comparison/dump-packs.js <packsRoot> <outDir>
 *
 * <packsRoot> holds one LevelDB directory per pack (copy them out of the module first — Foundry
 * holds the LOCK files while it runs, and the copies must not be written back). Each output file is
 * `{ "<kind>": [ { key, value }, ... ] }` keyed by the LevelDB key's document kind (`items`,
 * `items.effects`, `folders`, `journal.pages`, ...). Read-only; `createIfMissing: false`.
 *
 * Needs `classic-level` — the pinned 2.0.0 CI's pack gate installs (`npm install --no-save
 * classic-level@2.0.0`). Written 2026-09-16 for the Mistborn / Radiant talent comparison.
 */
"use strict";
const path = require("path");
const fs = require("fs");

const REPO = path.join(__dirname, "..", "..", "..");
const { ClassicLevel } = require(path.join(REPO, "node_modules", "classic-level"));

async function dump(packDir, outFile) {
  const db = new ClassicLevel(packDir, { keyEncoding: "utf8", valueEncoding: "json", createIfMissing: false });
  await db.open();
  const docs = {};
  for await (const [key, value] of db.iterator()) {
    const bang = key.indexOf("!");
    const kind = key.slice(bang + 1, key.indexOf("!", bang + 1));
    (docs[kind] ||= []).push({ key, value });
  }
  await db.close();
  fs.writeFileSync(outFile, JSON.stringify(docs, null, 1));
  return Object.fromEntries(Object.entries(docs).map(([k, v]) => [k, v.length]));
}

(async () => {
  const [root, out] = process.argv.slice(2);
  if (!root || !out) { console.error("usage: dump-packs.js <packsRoot> <outDir>"); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  for (const name of fs.readdirSync(root)) {
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    try {
      console.log(name, JSON.stringify(await dump(dir, path.join(out, name + ".json"))));
    } catch (e) {
      console.log(name, "FAILED", e.message);
    }
  }
})();
