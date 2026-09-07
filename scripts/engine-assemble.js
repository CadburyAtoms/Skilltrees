#!/usr/bin/env node
/* scripts/engine-assemble.js — join the per-section sources back into the ONE deployed engine
 * (item 4, 2026-09-06).
 *
 *   node scripts/engine-assemble.js          concatenate module-src/scripts/engine/*.js (lexical
 *                                            order = assembly order) into
 *                                            module-src/scripts/register-skills.js
 *   node scripts/engine-assemble.js --check  exit 1 if the tracked engine is NOT that concatenation,
 *                                            naming the first differing line (gate `engine-assembly`)
 *
 * Plain concatenation, nothing else: no headers, no separators, no added newlines. The sources are
 * exact byte ranges of the engine (engine-split.js), so the join is byte-identical. The only
 * normalisation is CRLF → LF on each source, because the engine is tracked and deployed LF
 * (`git ls-files --eol module-src/scripts/register-skills.js` → i/lf w/lf) and an editor that
 * saves a source CRLF must not be able to change the deployed file's line endings.
 *
 * THE EDIT RULE (PM-R15): edit the sources under module-src/scripts/engine/, run this script,
 * commit BOTH the source and the regenerated register-skills.js. The assembled file stays the
 * tracked and deployed artifact — Ben's F5 workflow, module-src-sync.js, tests/harness.js
 * ENGINE_PATH, lint-refs.js and every "grep the engine" instruction read it unchanged.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "module-src", "scripts", "register-skills.js");
const SRC_DIR = path.join(ROOT, "module-src", "scripts", "engine");
const REL_ENGINE = "module-src/scripts/register-skills.js";

const check = process.argv.includes("--check");

function sourceFiles() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`[engine-assemble] no ${path.relative(ROOT, SRC_DIR)}/ directory — run node scripts/engine-split.js first.`);
    process.exit(1);
  }
  const names = fs.readdirSync(SRC_DIR).filter(n => n.endsWith(".js")).sort();
  if (!names.length) {
    console.error(`[engine-assemble] ${path.relative(ROOT, SRC_DIR)}/ holds no *.js sources.`);
    process.exit(1);
  }
  return names;
}

function assemble(names) {
  return names
    .map(n => fs.readFileSync(path.join(SRC_DIR, n), "utf8").replace(/\r\n/g, "\n"))
    .join("");
}

// Which source file owns engine line `lineNo` (1-based) — for naming a diff by its source, too.
function ownerOf(names, lineNo) {
  let first = 1;
  for (const n of names) {
    const text = fs.readFileSync(path.join(SRC_DIR, n), "utf8").replace(/\r\n/g, "\n");
    const count = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
    if (lineNo < first + count) return { name: n, line: lineNo - first + 1 };
    first += count;
  }
  return null;
}

function main() {
  const names = sourceFiles();
  const assembled = assemble(names);

  if (!check) {
    fs.writeFileSync(ENGINE, assembled, "utf8");
    console.log(`[engine-assemble] wrote ${REL_ENGINE} from ${names.length} sources (${assembled.split("\n").length - 1} lines).`);
    return;
  }

  const tracked = fs.existsSync(ENGINE) ? fs.readFileSync(ENGINE, "utf8") : "";
  if (tracked === assembled) {
    console.log(`[engine-assemble] OK — ${REL_ENGINE} is the concatenation of ${names.length} sources.`);
    return;
  }

  const a = tracked.split("\n");
  const b = assembled.split("\n");
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const owner = ownerOf(names, i + 1);
  const where = owner ? ` (source ${owner.name}:${owner.line})` : "";
  console.error(`[engine-assemble] FAIL — ${REL_ENGINE} is not the assembly of module-src/scripts/engine/.`);
  console.error(`  first difference at line ${i + 1}${where}:`);
  console.error(`    tracked:   ${i < a.length ? JSON.stringify(a[i].slice(0, 120)) : "<end of file>"}`);
  console.error(`    assembled: ${i < b.length ? JSON.stringify(b[i].slice(0, 120)) : "<end of file>"}`);
  console.error(`  tracked ${a.length - 1} lines, assembled ${b.length - 1} lines.`);
  console.error(`  Fix: edit the source under module-src/scripts/engine/, run node scripts/engine-assemble.js, commit both.`);
  process.exit(1);
}

main();
