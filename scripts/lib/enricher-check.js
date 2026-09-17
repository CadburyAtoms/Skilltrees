/* scripts/lib/enricher-check.js — the pure scan/decide half of lint-refs PASS 24 (item 194,
 * R-149 (a), 2026-09-16): every `[[test ...]]` / `[[damage ...]]` / `[[healing ...]]` /
 * `[[/roll ...]]` enricher tag that ships in an authored talent description or an adversary
 * ability's card text has to actually be parseable by the cosmere-rpg system's own enricher
 * (`docs/Enrichers.md`, byte-identical at 2.1.0 and 3.1.0 — see the item's PR for the diff proof).
 * Nothing in Foundry errors on a malformed tag: the editor's prosemirror layer just leaves the
 * literal `[[test skil=ded]]` text sitting in the card, unclicked and unremarked — the exact
 * "silent manual card" failure mode iron rule 3 exists to kill, just on the two-bracket surface
 * instead of the events one. This module is the scan; lint-refs.js wires it to every authored
 * description and every adversary text/biography field it already carries the walk for.
 *
 * WHAT IS CHECKED (deliberately narrow — the item's three tag kinds only):
 *   [[test skill=<trigraph> ...]]      — skill is required and must be a real skill trigraph;
 *                                        optional attribute=/defence= must be a real attribute /
 *                                        attributeGroup trigraph if present. `dc=` is a free-form
 *                                        formula (may reference @tier etc.) and is not evaluated.
 *   [[damage ...]] / [[healing ...]]   — needs a formula (bare token or `formula=`) and, unless
 *                                        it's a healing roll (`healing` tag name, or a `heal`/
 *                                        `healing` key/type), a damage type that resolves to one
 *                                        of the system's real damage types.
 *   [[/roll <formula>]]                — Foundry's OWN core inline-roll syntax (not a cosmere
 *                                        enricher at all); only checked for a non-empty formula.
 * Any OTHER tag name (`lookup`, anything future) is left alone — out of scope for this pass, and
 * the system's own enricher framework reports its own errors for those at render time.
 *
 * Trigraphs are hand-copied from data/native-vocabulary.json's contentVocabulary (skills /
 * attributes / attributeGroups / damageTypes) rather than read live, so this module stays a pure,
 * dependency-free function tests/lint-refs.js can both call directly — regenerate the copy here
 * if scripts/dump-native-vocabulary.js ever changes those lists (pass 12 already guards the same
 * lists elsewhere in lint-refs.js from drifting silently).
 */
"use strict";

const SKILLS = new Set(["agi", "ath", "cra", "dec", "ded", "dis", "hwp", "inm", "ins", "lea", "lor", "lwp", "med", "prc", "prs", "stl", "sur", "thv"]);
const ATTRIBUTES = new Set(["awa", "int", "pre", "spd", "str", "wil"]);
const DEFENCES = new Set(["cog", "phy", "spi"]); // attributeGroups — the target's defence to read
const DAMAGE_TYPES = new Set(["energy", "heal", "impact", "keen", "spirit", "vital"]);

function splitKv(tokens) {
  const kv = {};
  const bare = [];
  for (const t of tokens) {
    const eq = t.indexOf("=");
    if (eq > 0) kv[t.slice(0, eq).toLowerCase()] = t.slice(eq + 1);
    else bare.push(t);
  }
  return { kv, bare };
}

// Only a "[[" immediately followed by one of these four names is treated as one of THIS pass's
// tags. Edha's own `[Tier][Die]` formula shorthand collides with "[[" by coincidence whenever it
// sits right after a single "[" elsewhere in the same sentence (e.g. "Afflicted [[Tier][Die]
// vital]" — a real card in data/authored/leyline-black.json, "Dark Investiture") — that is not a
// malformed enricher, it is TWO unrelated bracket conventions landing next to each other, so this
// pass must not treat every "[[" as one of ours. `lookup` and any future tag name are real system
// enrichers too but are out of this pass's declared scope (see the header) — they simply never
// match here, so they are never flagged either way.
const TAG_START = /\[\[\s*(test|damage|healing|\/roll)\b/gi;

/* Scan one string for [[...]] tags and report every one this pass understands that doesn't
 * parse. Returns [] when the text has no tags, or every tag in it is well-formed. Never throws —
 * a non-string input (undefined description, etc.) is just "nothing to check". */
function checkEnricherTags(text) {
  const findings = [];
  if (typeof text !== "string" || !text) return findings;

  let m;
  TAG_START.lastIndex = 0;
  while ((m = TAG_START.exec(text)) !== null) {
    const open = m.index;
    const close = text.indexOf("]]", open + 2);
    if (close === -1) {
      findings.push({ tag: text.slice(open, Math.min(text.length, open + 40)), error: "unclosed [[ ... ]] tag (no matching ]])" });
      break; // nothing after an unclosed tag can be delimited reliably
    }
    const inner = text.slice(open + 2, close).trim();
    const tag = `[[${inner}]]`;
    const tokens = inner.split(/\s+/).filter(Boolean);
    const name = (tokens[0] || "").toLowerCase();

    if (name === "test") {
      const { kv } = splitKv(tokens.slice(1));
      if (!kv.skill) {
        findings.push({ tag, error: "[[test]] needs skill=<trigraph>" });
      } else if (!SKILLS.has(kv.skill.toLowerCase())) {
        findings.push({ tag, error: `[[test]] skill "${kv.skill}" is not a known skill trigraph` });
      }
      if (kv.attribute && !ATTRIBUTES.has(kv.attribute.toLowerCase())) {
        findings.push({ tag, error: `[[test]] attribute "${kv.attribute}" is not a known attribute trigraph` });
      }
      if (kv.defence && !DEFENCES.has(kv.defence.toLowerCase())) {
        findings.push({ tag, error: `[[test]] defence "${kv.defence}" is not a known defence trigraph (cog/phy/spi)` });
      }
    } else if (name === "damage" || name === "healing") {
      const { kv, bare } = splitKv(tokens.slice(1));
      const formula = kv.formula || bare[0];
      const type = kv.type || bare[1];
      const isHealing = name === "healing" || kv.healing !== undefined || kv.heal !== undefined || (type && /^heal(ing)?$/i.test(type));
      if (!formula) {
        findings.push({ tag, error: `[[${name}]] needs a dice formula` });
      }
      if (!isHealing && !type) {
        findings.push({ tag, error: `[[${name}]] needs a damage type` });
      } else if (type && !DAMAGE_TYPES.has(type.toLowerCase()) && !/^heal(ing)?$/i.test(type)) {
        findings.push({ tag, error: `[[${name}]] type "${type}" is not a known damage type` });
      }
    } else if (name === "/roll") {
      const formula = tokens.slice(1).join(" ").trim();
      if (!formula) findings.push({ tag, error: "[[/roll]] needs a formula" });
    }
    // any other tag name (lookup, etc.) is out of scope for this pass.

    TAG_START.lastIndex = close + 2; // resume the search AFTER this whole tag, not mid-match
  }
  return findings;
}

module.exports = { checkEnricherTags, SKILLS, ATTRIBUTES, DEFENCES, DAMAGE_TYPES };
