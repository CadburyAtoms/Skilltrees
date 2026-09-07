/* scripts/lib/consume-guard.js — the R-22 build guard (item 60): a `consume` entry's `value.min`
 * and `value.max` must always be equal.
 *
 * WHY. `edhaConsumeList` (module-src/scripts/register-skills.js) reads `value.min` as the amount
 * to deduct AND the amount `edhaRefundCost` hands back on cancel/refund — it never looks at
 * `value.max`. Foundry's own consume dialog lets a player pay anywhere in [min, max], so a talent
 * that ever shipped `min !== max` would let a real spend of `max` refund only `min` — a silent
 * under-refund. No talent ships that today; Ben's ruling (R-22, EDHA_RULINGS.md, ANSWERED
 * 2026-09-06) is to close the door with a build guard rather than an engine change: (a) fail the
 * build if it ever happens.
 *
 * Pure and dependency-free so tests/consume-guard.test.js can pin it against fixtures without
 * touching the filesystem — scripts/lint-refs.js (pass 23) is the only caller that feeds it real
 * data, gathered from the two places a `consume` entry can ORIGINATE (see that pass's header for
 * the full trace of why those two places are the whole surface).
 */
"use strict";

// entries: [{ source, name, consume }] — `consume` is a raw `activation.consume`-shaped array (or
// undefined/non-array, which is skipped). `source`/`name` only label findings.
// Returns { scanned, findings } — `scanned` counts every `type:"resource"` entry looked at
// (regardless of pass/fail), so a caller can assert the scan actually saw something.
function checkConsumeEntries(entries) {
  const findings = [];
  let scanned = 0;
  for (const { source, name, consume } of entries || []) {
    if (!Array.isArray(consume)) continue;
    consume.forEach((c, index) => {
      if (c?.type !== "resource" || !c?.resource) return;
      scanned++;
      const min = c?.value?.min;
      const max = c?.value?.max;
      if (typeof min === "number" && typeof max === "number" && min !== max) {
        findings.push({ source, name, index, resource: c.resource, min, max });
      }
    });
  }
  return { scanned, findings };
}

module.exports = { checkConsumeEntries };
