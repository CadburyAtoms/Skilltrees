#!/usr/bin/env node
/* scripts/gates.js — the ONE gate list (item 20).
 *
 * Before this file, the ordered gate list existed hand-copied in FIVE docs (package.json,
 * README.md, CLAUDE.md iron rule 4, scripts/README.md, .github/workflows/validate.yml) plus the
 * work-item skill — six places to keep in sync, and they had already drifted: `npm run gates`
 * didn't include the full scripts/*.js + tests/*.js syntax sweep CI does, and every one of them
 * invoked `python3`, which is not on Ben's PATH (`python` is), so `npm run gates` always exited
 * non-zero here even when every real check passed.
 *
 * This script IS the list now. Every doc above points at it instead of re-enumerating it.
 *
 *   node scripts/gates.js            run the local gate set (what CI runs on every push/PR, minus
 *                                     the two optional-dependency gates below)
 *   node scripts/gates.js --ci       also run the two gates that need a dependency a fresh clone
 *                                     may not have (Pillow for the map lint, classic-level for the
 *                                     compiled-pack validators) — this is exactly what
 *                                     .github/workflows/validate.yml runs
 *   node scripts/gates.js --list     print the ordered gate list (id + command) and exit 0
 *   node scripts/gates.js --only a,b run just the named gate id(s) — package.json's `test` and
 *                                     `audit` aliases use this so they get the same Python
 *                                     resolution as everything else
 *
 * Runs every gate — it never stops at the first failure — then prints a PASS/FAIL summary table
 * and exits 1 if anything failed, 0 otherwise. Each gate is spawned with stdio "inherit" so its
 * own output streams straight through.
 *
 * Python resolution: tries `python3`, then `python`, then `py -3`, and uses the first one whose
 * `--version` actually runs (CLAUDE.md "Gates: python3 not on PATH" — python3 is an App Execution
 * Alias stub on Ben's machine that exits non-zero instead of running Python).
 */
"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { REPO_ROOT } = require("./lib/paths");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: REPO_ROOT, stdio: "inherit", shell: true, ...opts });
  if (r.error) {
    console.error(`[gates] failed to run "${cmd} ${args.join(" ")}": ${r.error.message}`);
    return false;
  }
  return r.status === 0;
}

function resolvePython() {
  const candidates = [
    { cmd: "python3", baseArgs: [] },
    { cmd: "python", baseArgs: [] },
    { cmd: "py", baseArgs: ["-3"] },
  ];
  for (const c of candidates) {
    const r = spawnSync(c.cmd, [...c.baseArgs, "--version"], {
      cwd: REPO_ROOT,
      stdio: "ignore",
      shell: true,
    });
    if (!r.error && r.status === 0) {
      return { cmd: c.cmd, baseArgs: c.baseArgs, label: [c.cmd, ...c.baseArgs].join(" ") };
    }
  }
  return null;
}

function jsFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .map((f) => path.join(dir, f))
    .sort();
}

function pyRun(py, args) {
  if (!py) {
    console.error("[gates] no working python3 / python / py -3 found on PATH — cannot run this gate");
    return false;
  }
  return run(py.cmd, [...py.baseArgs, ...args]);
}

function buildGates(py) {
  const gates = [];

  gates.push({
    id: "engine-check",
    desc: "node --check module-src/scripts/register-skills.js",
    run: () => run("node", ["--check", "module-src/scripts/register-skills.js"]),
  });

  gates.push({
    id: "scripts-check",
    desc: "node --check over scripts/*.js, scripts/lib/*.js, tests/*.js",
    run: () => {
      const files = [
        ...jsFilesIn(path.join(REPO_ROOT, "scripts")),
        ...jsFilesIn(path.join(REPO_ROOT, "scripts", "lib")),
        ...jsFilesIn(path.join(REPO_ROOT, "tests")),
      ];
      const failed = [];
      for (const f of files) {
        const rel = path.relative(REPO_ROOT, f);
        if (!run("node", ["--check", rel])) failed.push(rel);
      }
      if (failed.length) console.error(`[scripts-check] failed to parse: ${failed.join(", ")}`);
      return failed.length === 0;
    },
  });

  gates.push({
    id: "validate",
    desc: "node scripts/validate.js",
    run: () => run("node", ["scripts/validate.js"]),
  });

  gates.push({
    id: "lint-refs",
    desc: "node scripts/lint-refs.js",
    run: () => run("node", ["scripts/lint-refs.js"]),
  });

  gates.push({
    id: "unit-tests",
    desc: "node tests/run.js",
    run: () => run("node", ["tests/run.js"]),
  });

  gates.push({
    id: "dashboard",
    desc: "node scripts/build-dashboard.js --check",
    run: () => run("node", ["scripts/build-dashboard.js", "--check"]),
  });

  gates.push({
    id: "canon-codex",
    desc: "node scripts/build-canon-codex.js --check",
    run: () => run("node", ["scripts/build-canon-codex.js", "--check"]),
  });

  gates.push({
    id: "player-primer",
    desc: "node scripts/build-player-primer.js --check",
    run: () => run("node", ["scripts/build-player-primer.js", "--check"]),
  });

  gates.push({
    id: "audit-parser-test",
    desc: `${py ? py.label : "<python>"} tests/audit_parser_test.py`,
    run: () => pyRun(py, ["tests/audit_parser_test.py"]),
  });

  gates.push({
    id: "tree-audit",
    desc: `${py ? py.label : "<python>"} .claude/skills/leyline-tree-authoring/audit.py`,
    run: () => pyRun(py, [".claude/skills/leyline-tree-authoring/audit.py"]),
  });

  // --ci only: both need an optional dependency a fresh clone may not have. Commands copied
  // verbatim from .github/workflows/validate.yml — do not let this drift from that file again.
  gates.push({
    id: "map-lint",
    ci: true,
    desc: `${py ? py.label : "<python>"} -m pip install pillow && ${py ? py.label : "<python>"} scripts/map/lint_map.py`,
    run: () => {
      if (!pyRun(py, ["-m", "pip", "install", "--quiet", "pillow"])) return false;
      return pyRun(py, ["scripts/map/lint_map.py"]);
    },
  });

  gates.push({
    id: "pack-build-validate",
    ci: true,
    desc: "npm install classic-level + node scripts/foundry-build.js all + validate-packs.js + validate-adversaries.js (scratch EDHA_MODROOT)",
    run: () => {
      // Never fall through to lib/paths.js's default EDHA_MODROOT (Ben's LIVE module install) —
      // this gate builds into a scratch dir, always, whether or not the caller set the env var.
      const edhaData = process.env.EDHA_DATA || path.join(REPO_ROOT, "data");
      const edhaModroot = process.env.EDHA_MODROOT || path.join(os.tmpdir(), "edha-packs-gates");
      const env = { ...process.env, EDHA_DATA: edhaData, EDHA_MODROOT: edhaModroot };
      console.log(`[pack-build-validate] EDHA_DATA=${edhaData}`);
      console.log(`[pack-build-validate] EDHA_MODROOT=${edhaModroot}`);
      if (!run("npm", ["install", "--no-save", "classic-level@2.0.0"], { env })) return false;
      if (!run("node", ["scripts/foundry-build.js", "all"], { env })) return false;
      if (!run("node", ["scripts/validate-packs.js"], { env })) return false;
      if (!run("node", ["scripts/validate-adversaries.js"], { env })) return false;
      return true;
    },
  });

  return gates;
}

function parseArgs(argv) {
  const out = { list: false, ci: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--list") out.list = true;
    else if (a === "--ci") out.ci = true;
    else if (a === "--only") {
      out.only = (argv[i + 1] || "").split(",").map((s) => s.trim()).filter(Boolean);
      i++;
    } else if (a.startsWith("--only=")) {
      out.only = a.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return out;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const py = resolvePython();

  if (opts.list) {
    const gates = buildGates(py);
    console.log("Gate list, in order (id — command):");
    for (const g of gates) {
      console.log(`  ${g.id}${g.ci ? " [--ci only]" : ""} — ${g.desc}`);
    }
    process.exit(0);
    return;
  }

  console.log(py ? `[gates] python interpreter: ${py.label}` : "[gates] WARNING: no python3/python/py -3 found — python gates will fail");

  let gates = buildGates(py);
  if (opts.only) {
    const known = new Set(gates.map((g) => g.id));
    const missing = opts.only.filter((id) => !known.has(id));
    if (missing.length) {
      console.error(`[gates] unknown gate id(s): ${missing.join(", ")} — run --list to see valid ids`);
      process.exit(1);
      return;
    }
    gates = gates.filter((g) => opts.only.includes(g.id));
  } else {
    gates = gates.filter((g) => opts.ci || !g.ci);
  }

  const results = [];
  for (const g of gates) {
    console.log(`\n=== ${g.id} — ${g.desc} ===`);
    const ok = g.run();
    console.log(ok ? `[PASS] ${g.id}` : `[FAIL] ${g.id}`);
    results.push({ id: g.id, ok });
  }

  console.log("\nGate summary");
  console.log("------------");
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id}`);

  const anyFail = results.some((r) => !r.ok);
  console.log(anyFail ? "\nRESULT: FAIL" : "\nRESULT: PASS");
  process.exit(anyFail ? 1 : 0);
}

main();
