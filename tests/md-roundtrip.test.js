/* tests/md-roundtrip.test.js — pins scripts/lib/md.js's browser-embedding contract.
 *
 * WHY THIS EXISTS. build-canon-codex.js stringifies six of md.js's exports (esc, slugifyAnchor,
 * parseMd, makeLinkifier, inline, renderBlocks) via Function.prototype.toString() and drops them
 * verbatim into EDHA_CANON_CODEX.html's <script> tag (ENGINE_SRC) so the browser's post-edit
 * re-render matches the build-time render exactly (see md.js's EMBEDDING CONSTRAINT header). That
 * only works if every one of the six is a plain NAMED `function` declaration that never closes
 * over `require`, module-scope constants, or Node globals — three of them (makeLinkifier, inline,
 * renderBlocks) DO call a sibling from the group by its bare name (e.g. makeLinkifier's returned
 * closure calls esc()), which is fine in the real page (ENGINE_SRC concatenates all six into the
 * same top-level <script> scope, exactly like sibling `function` statements in any plain script)
 * but would ReferenceError if tested one at a time in true isolation.
 *
 * So this file tests two things:
 *   1. STRUCTURAL — per function: it stringifies as `function <name>...` and fn.name === name.
 *   2. BEHAVIORAL — recreate the WHOLE bundle the way ENGINE_SRC actually ships it (all six
 *      `function` sources concatenated, evaluated together via `new Function`), then diff its
 *      output against calling the real md.js exports directly, on a shared fixture. This is the
 *      faithful reproduction of what actually runs in the browser; testing e.g. makeLinkifier with
 *      NO siblings in scope would fail for a reason that has nothing to do with md.js being wrong.
 */
"use strict";
const assert = require("assert");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const md = require(path.join(REPO, "scripts", "lib", "md.js"));

// The exact list + order build-canon-codex.js's ENGINE_SRC uses.
const EMBEDDED = ["esc", "slugifyAnchor", "parseMd", "makeLinkifier", "inline", "renderBlocks"];

/* --- 1. structural: named function declarations, self-consistent --------------------------- */

for (const name of EMBEDDED) {
  test(`md.js exports "${name}" as a plain named function declaration`, () => {
    const fn = md[name];
    assert.strictEqual(typeof fn, "function", `${name} is not a function`);
    assert.strictEqual(fn.name, name, `${name}.name is "${fn.name}"`);
    const src = fn.toString().trim();
    assert.ok(src.startsWith(`function ${name}`), `${name}.toString() does not start with "function ${name}": ${src.slice(0, 60)}...`);
  });
}

/* --- 2. behavioral: recreate the ENGINE_SRC bundle, diff against the direct calls ----------- */

// Mirrors build-canon-codex.js's `ENGINE_SRC = [...].map(f => f.toString()).join('\n\n')`, then
// evaluates it via `new Function` the same way a <script> tag would (top-level `function`
// statements become bindings visible to each other and to the trailing `return`).
const ENGINE_SRC = EMBEDDED.map((n) => md[n].toString()).join("\n\n");
const recreated = new Function(`${ENGINE_SRC}\nreturn { ${EMBEDDED.join(", ")} };`)();

test("the recreated ENGINE_SRC bundle exposes all six functions under the same names", () => {
  for (const name of EMBEDDED) {
    assert.strictEqual(typeof recreated[name], "function", `recreated bundle missing ${name}`);
  }
});

const FIXTURE_MD = [
  "# Title One",
  "",
  "## Section Two",
  "",
  "Some **bold** and *italic* text with special chars: & < > \" here.",
  "",
  "### Sub Three",
  "",
  "#### Sub Sub Four",
  "",
  "- item one",
  "  continued with 2-space indent",
  "- item two",
  "",
  "1. first",
  "2. second",
  "   continued",
  "",
  "| A | B |",
  "|---|---|",
  "| 1 | 2 |",
  "",
].join("\n");

const RENDER_OPTS = { slugify: md.slugifyAnchor, dataL: true, hlink: true, tableWrap: true };

// The golden pin — build-canon-codex.js's actual call shape (dataL/hlink/tableWrap all on, no
// idPrefix, no places/linkify). A change here means renderBlocks' codex-facing output changed.
const GOLDEN_ARTICLE = [
  '<h1 id="title-one" data-l="0:1">Title One<a class="hlink" href="#title-one">#</a></h1>',
  '<h2 id="section-two" data-l="2:3">Section Two<a class="hlink" href="#section-two">#</a></h2>',
  '<p data-l="4:5">Some <strong>bold</strong> and <em>italic</em> text with special chars: &amp; &lt; &gt; &quot; here.</p>',
  '<h3 id="sub-three" data-l="6:7">Sub Three<a class="hlink" href="#sub-three">#</a></h3>',
  '<h4 id="sub-sub-four" data-l="8:9">Sub Sub Four<a class="hlink" href="#sub-sub-four">#</a></h4>',
  '<ul data-l="10:13"><li>item one continued with 2-space indent</li><li>item two</li></ul>',
  '<ol data-l="14:17"><li value="1">first</li><li value="2">second continued</li></ol>',
  '<div class="tblwrap" data-l="18:21"><table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>',
].join("\n");

test("golden fixture: parseMd + renderBlocks (codex call shape) pins the exact HTML", () => {
  const blocks = md.parseMd(FIXTURE_MD);
  const { article, toc } = md.renderBlocks(blocks, RENDER_OPTS);
  assert.strictEqual(article, GOLDEN_ARTICLE);
  assert.deepStrictEqual(toc, [
    { level: 2, text: "Section Two", slug: "section-two" },
    { level: 3, text: "Sub Three", slug: "sub-three" },
    { level: 4, text: "Sub Sub Four", slug: "sub-sub-four" },
  ]);
});

test("recreated bundle: parseMd + renderBlocks matches the direct call byte-for-byte", () => {
  const blocksDirect = md.parseMd(FIXTURE_MD);
  const blocksRecreated = recreated.parseMd(FIXTURE_MD);
  assert.deepStrictEqual(blocksRecreated, blocksDirect);

  const direct = md.renderBlocks(blocksDirect, RENDER_OPTS);
  const viaRecreated = recreated.renderBlocks(blocksRecreated, { ...RENDER_OPTS, slugify: recreated.slugifyAnchor });
  assert.strictEqual(viaRecreated.article, direct.article);
  assert.strictEqual(viaRecreated.article, GOLDEN_ARTICLE);
  assert.deepStrictEqual(viaRecreated.toc, direct.toc);
});

test("recreated bundle: esc matches directly, including the & < > \" it must all four escape", () => {
  const s = `Tom & Jerry <say> "hi" & <bye>`;
  assert.strictEqual(recreated.esc(s), md.esc(s));
  assert.strictEqual(recreated.esc(s), "Tom &amp; Jerry &lt;say&gt; &quot;hi&quot; &amp; &lt;bye&gt;");
});

test("recreated bundle: slugifyAnchor matches directly", () => {
  const s = "Money in Thyrcross (added with canon §5d — rulings 54–59)";
  assert.strictEqual(recreated.slugifyAnchor(s), md.slugifyAnchor(s));
});

test("recreated bundle: inline matches directly across every opt flag", () => {
  const s = "**bold** *italic* ~~strike~~ `code` and a ⚑ flag with \"quotes\"";
  for (const opts of [{}, { italic: true }, { strike: true, flag: true }, { italic: true, strike: true, flag: true }]) {
    assert.strictEqual(recreated.inline(s, opts), md.inline(s, opts));
  }
});

test("recreated bundle: makeLinkifier's returned closure resolves its esc() sibling", () => {
  const places = [{ name: "Goldenport", px: [1, 2] }, { name: "Thalendor", px: [3, 4] }];
  const html = '<p>Traders from Goldenport & Thalendor met.</p>';
  const direct = md.makeLinkifier(places)(html);
  const viaRecreated = recreated.makeLinkifier(places)(html);
  assert.strictEqual(viaRecreated, direct);
  assert.ok(direct.includes('data-place="Goldenport"'), "linkify did not tag Goldenport");
});
