/* tests/build-doc.test.js — pins scripts/lib/build-doc.js's read()/emit() contract.
 *
 * WHY THIS EXISTS. All four generated-doc builders (build-dashboard.js, build-canon-codex.js,
 * build-player-primer.js, dump-native-vocabulary.js) share the same --check/write/exit skeleton —
 * see build-doc.js's module header. Two behaviors matter enough to pin:
 *   - the --check comparison is CRLF-tolerant on the ON-DISK side (an autocrlf checkout has CRLF;
 *     CI's checkout has LF; both must compare equal to the freshly-built LF content);
 *   - a real drift under --check must still exit(1) with the builder's own stale message — the
 *     ONE behavior every builder actually depends on emit() to enforce.
 *
 * emit() calls process.exit() on both the stale path and (optionally) the clean-check path
 * (dump-native-vocabulary.js's explicit exit(0)) — exactly like the four builders' original inline
 * code did. Rather than refactor emit() to make exit optional (which would let it silently drift
 * from what the builders actually run), the exit-triggering paths are exercised in a SUBPROCESS
 * here, the same way tests/handler-schemas.test.js spawns lint-refs.js.
 *
 * Temp files live under a real OS temp dir (os.tmpdir()), not a machine-specific path, so this
 * test runs unmodified in CI and on any checkout.
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const REPO = path.resolve(__dirname, "..");
const BUILD_DOC = path.join(REPO, "scripts", "lib", "build-doc.js");
const { read, emit } = require(BUILD_DOC);

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "edha-build-doc-test-"));
const cleanupPaths = [];
function tmpFile(name) {
  const p = path.join(workDir, name);
  cleanupPaths.push(p);
  return p;
}

/* --- read() ----------------------------------------------------------------------------------- */

test("read(): LF-normalizes a CRLF file", () => {
  const p = tmpFile("crlf.txt");
  fs.writeFileSync(p, "line one\r\nline two\r\n");
  assert.strictEqual(read(p, workDir), "line one\nline two\n");
});

test("read(): accepts an absolute path (rootDir ignored) and a repo-relative one", () => {
  const p = tmpFile("abs.txt");
  fs.writeFileSync(p, "abs content\n");
  assert.strictEqual(read(p, "/some/unrelated/root"), "abs content\n");
  assert.strictEqual(read("package.json", REPO), fs.readFileSync(path.join(REPO, "package.json"), "utf8").replace(/\r\n/g, "\n"));
});

/* --- emit(): non-exiting paths, tested in-process --------------------------------------------- */
// A safety net: if emit() ever calls process.exit() on a path this block does not expect, fail the
// test loudly instead of silently killing the whole tests/run.js suite.
function withExitTrap(fn) {
  const real = process.exit;
  process.exit = (code) => { throw new Error(`process.exit(${code}) called unexpectedly`); };
  try { return fn(); } finally { process.exit = real; }
}

test("emit(): non-check mode writes the file and calls afterWrite(content, outPath)", () => {
  const p = tmpFile("write.txt");
  let afterWriteArgs = null;
  withExitTrap(() => {
    emit(p, "hello world\n", { checkMode: false, afterWrite: (content, outPath) => { afterWriteArgs = [content, outPath]; } });
  });
  assert.strictEqual(fs.readFileSync(p, "utf8"), "hello world\n");
  assert.deepStrictEqual(afterWriteArgs, ["hello world\n", p]);
});

test("emit(): --check treats a CRLF on-disk file as equal to its LF twin (no exit, upToDateMessage logged)", () => {
  const p = tmpFile("check-crlf.txt");
  const lfContent = "alpha\nbeta\ngamma\n";
  fs.writeFileSync(p, lfContent.replace(/\n/g, "\r\n")); // on-disk: CRLF
  let logged = null;
  const realLog = console.log;
  console.log = (msg) => { logged = msg; };
  try {
    withExitTrap(() => {
      emit(p, lfContent, { checkMode: true, upToDateMessage: () => "IN SYNC", staleMessage: () => "SHOULD NOT FIRE" });
    });
  } finally {
    console.log = realLog;
  }
  assert.strictEqual(logged, "IN SYNC");
});

test("emit(): --check on a MISSING file is treated as maximally stale, not a crash", () => {
  const p = tmpFile("does-not-exist.txt");
  assert.throws(() => {
    withExitTrap(() => {
      emit(p, "new content\n", { checkMode: true, staleMessage: () => "STALE" });
    });
  }, /process\.exit\(1\) called unexpectedly/);
});

/* --- emit(): exit-triggering paths, exercised in a subprocess --------------------------------- */

function runChild(script) {
  const r = cp.spawnSync(process.execPath, ["-e", script], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

test("emit(): real drift under --check exits 1 with the builder's staleMessage on stderr, and nothing after it runs", () => {
  const p = tmpFile("stale.txt");
  fs.writeFileSync(p, "old content\n");
  const script = `
    const { emit } = require(${JSON.stringify(BUILD_DOC)});
    emit(${JSON.stringify(p)}, "new content\\n", {
      checkMode: true,
      staleMessage: () => "STALE_MARKER_MSG",
    });
    console.log("SHOULD_NOT_PRINT");
  `;
  const { status, stdout, stderr } = runChild(script);
  assert.strictEqual(status, 1);
  assert.ok(stderr.includes("STALE_MARKER_MSG"), `stderr missing staleMessage: ${stderr}`);
  assert.ok(!stdout.includes("SHOULD_NOT_PRINT"), "code after a stale exit(1) ran");
});

test("emit(): checkExitCode forces an explicit exit on a clean --check (dump-native-vocabulary.js's exit(0) shape)", () => {
  const p = tmpFile("clean-exit-code.txt");
  fs.writeFileSync(p, "same content\n");
  const script = `
    const { emit } = require(${JSON.stringify(BUILD_DOC)});
    emit(${JSON.stringify(p)}, "same content\\n", {
      checkMode: true,
      checkExitCode: 0,
      upToDateMessage: () => "UPTODATE_MARKER",
    });
    console.log("SHOULD_NOT_PRINT");
  `;
  const { status, stdout } = runChild(script);
  assert.strictEqual(status, 0);
  assert.ok(stdout.includes("UPTODATE_MARKER"), `stdout missing upToDateMessage: ${stdout}`);
  assert.ok(!stdout.includes("SHOULD_NOT_PRINT"), "code after an explicit checkExitCode exit ran");
});

test("emit(): WITHOUT checkExitCode, a clean --check just returns — code after it keeps running", () => {
  const p = tmpFile("clean-no-exit-code.txt");
  fs.writeFileSync(p, "same content\n");
  const script = `
    const { emit } = require(${JSON.stringify(BUILD_DOC)});
    emit(${JSON.stringify(p)}, "same content\\n", {
      checkMode: true,
      upToDateMessage: () => "UPTODATE_MARKER",
    });
    console.log("DID_CONTINUE");
  `;
  const { status, stdout } = runChild(script);
  assert.strictEqual(status, 0);
  assert.ok(stdout.includes("UPTODATE_MARKER"));
  assert.ok(stdout.includes("DID_CONTINUE"), "emit() without checkExitCode should not exit the process");
});

test("cleanup: remove temp files", () => {
  for (const p of cleanupPaths) { try { fs.unlinkSync(p); } catch (e) {} }
  try { fs.rmdirSync(workDir); } catch (e) {}
});
