/* tests/build-single-scope.test.js — pins that a SINGLE-scope pack build reaches its writer alive.
 *
 * WHY THIS EXISTS (TODO_REPO_HYGIENE #74). `scripts/foundry-build.js` runs its whole build in a
 * top-level async IIFE, which executes synchronously until its first `await`. The item-64 handler
 * type guard used a module-level `let REGISTERED_HANDLER_TYPES` that sat BELOW that IIFE, so any
 * scope whose writer runs before the first `await` — `items` (no baseline guard) and `adversaries`
 * — read the binding inside its temporal dead zone:
 *
 *   ReferenceError: Cannot access 'REGISTERED_HANDLER_TYPES' before initialization
 *
 * `all` and the three talent scopes `await guardUnextracted()` first, which let the rest of the
 * module finish loading, so the deploy `.bat` and the `--ci` pack gate never saw it. The fix
 * hoisted the guard above main; this case runs the two once-broken scopes as real subprocesses
 * (the build cannot be `require()`d — it resolves classic-level at load and runs on import) and
 * fails under a reversion of the hoist.
 *
 * HEADLESS: the build hard-requires classic-level. `requireClassicLevel()` falls back to a plain
 * `require("classic-level")`, so a stub package on NODE_PATH satisfies it wherever the real native
 * module is not installed (CI's tests gate runs before the --ci pack gate installs it). The stub
 * accepts writes and discards them; nothing here reads a pack back. Where the real classic-level
 * IS resolvable (Ben's machine, a worker that ran `npm install --no-save classic-level`), Node
 * resolves node_modules before NODE_PATH and the packs are really written — into the scratch
 * EDHA_MODROOT below, never a live module root.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const BUILD = path.join(REPO, "scripts", "foundry-build.js");

const STUB_SRC = `"use strict";
class ClassicLevel {
  constructor(dir, opts) { this.dir = dir; this.opts = opts; }
  async open() {}
  async close() {}
  batch() { return { put() {}, async write() {} }; }
}
module.exports = { ClassicLevel };
`;

function runScope(scope) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "edha-build-scope-"));
  try {
    const stubDir = path.join(work, "node_path", "classic-level");
    fs.mkdirSync(stubDir, { recursive: true });
    fs.writeFileSync(path.join(stubDir, "package.json"), JSON.stringify({ name: "classic-level", version: "0.0.0-stub", main: "index.js" }));
    fs.writeFileSync(path.join(stubDir, "index.js"), STUB_SRC);
    const env = {
      ...process.env,
      EDHA_DATA: path.join(REPO, "data"),
      EDHA_MODROOT: path.join(work, "modroot"),
      NODE_PATH: [path.join(work, "node_path"), process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
    };
    return cp.spawnSync(process.execPath, [BUILD, scope], { cwd: REPO, env, encoding: "utf8", timeout: 120000 });
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

for (const [scope, reportLine] of [["items", /^\s+edha-items: \d+ items, \d+ folders$/m], ["adversaries", /^\s+edha-adversaries: \d+ adversaries, \d+ embedded items/m]]) {
  test(`foundry-build.js ${scope} (single scope) reaches its writer — no temporal-dead-zone ReferenceError (item 74)`, () => {
    const r = runScope(scope);
    // Report the error line itself (the stack's tail is all loader frames).
    const errLines = (r.stderr || "").split(/\r?\n/).filter(Boolean);
    const firstErr = errLines.findIndex(l => /Error/.test(l));
    const tail = (firstErr >= 0 ? errLines.slice(firstErr, firstErr + 4) : errLines.slice(-6)).join("\n");
    assert.ok(!/ReferenceError: Cannot access 'REGISTERED_HANDLER_TYPES'/.test(r.stderr || ""), `TDZ crash is back:\n${tail}`);
    assert.strictEqual(r.status, 0, `scope=${scope} exited ${r.status}:\n${tail}`);
    assert.ok(reportLine.test(r.stdout || ""), `scope=${scope} did not print its pack report line; stdout tail:\n${(r.stdout || "").split(/\r?\n/).slice(-8).join("\n")}`);
  });
}
