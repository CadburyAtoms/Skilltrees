/* Glossary hover-tooltip engine.
   Loads data/glossary.json, builds a regex, exposes GlossaryText React component.
   Terms are matched longest-first to avoid partial overlaps (e.g. "recovery die" before "recovery").
*/

const Glossary = (() => {
  let _terms = [];
  let _regex = null;
  let _ready = false;

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function build(termsArray) {
    // Deduplicate by term text (keep first occurrence)
    const seen = new Set();
    _terms = [];
    for (const entry of termsArray) {
      const key = entry.term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      _terms.push(entry);
    }

    // Sort longest-first so "recovery die" matches before "recovery"
    _terms.sort((a, b) => b.term.length - a.term.length);

    // Build one combined regex with word boundaries
    // Case-sensitive terms use exact case; case-insensitive terms use (?i) inline flag alternative
    // Since JS doesn't support inline flags, we split into two groups and combine
    const csParts = [];
    const ciParts = [];
    for (const t of _terms) {
      const escaped = escapeRegex(t.term);
      if (t.cs === false) {
        ciParts.push(escaped);
      } else {
        csParts.push(escaped);
      }
    }

    // We'll match using a single pass with a function that checks both patterns
    // Build separate regexes and merge matches by position
    _regex = {
      cs: csParts.length ? new RegExp('\\b(' + csParts.join('|') + ')\\b', 'g') : null,
      ci: ciParts.length ? new RegExp('\\b(' + ciParts.join('|') + ')\\b', 'gi') : null,
    };
    _ready = true;
  }

  function lookup(matchedText) {
    const lower = matchedText.toLowerCase();
    return _terms.find(t => {
      if (t.cs === false) return t.term.toLowerCase() === lower;
      return t.term === matchedText;
    });
  }

  // Parse text into segments: [{text, def?}, ...]
  function parse(text) {
    if (!_ready || !text) return [{ text: text || '' }];

    // Collect all matches with positions
    const matches = [];

    if (_regex.cs) {
      _regex.cs.lastIndex = 0;
      let m;
      while ((m = _regex.cs.exec(text)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, matched: m[0] });
      }
    }
    if (_regex.ci) {
      _regex.ci.lastIndex = 0;
      let m;
      while ((m = _regex.ci.exec(text)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, matched: m[0] });
      }
    }

    if (matches.length === 0) return [{ text }];

    // Sort by start position, then longest match first (to handle overlaps)
    matches.sort((a, b) => a.start - b.start || b.end - a.end);

    // Remove overlapping matches (keep first/longest at each position)
    const filtered = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }

    // Build segments
    const segments = [];
    let cursor = 0;
    for (const m of filtered) {
      if (m.start > cursor) {
        segments.push({ text: text.slice(cursor, m.start) });
      }
      const entry = lookup(m.matched);
      if (entry) {
        segments.push({ text: m.matched, def: entry.def, term: entry.term });
      } else {
        segments.push({ text: m.matched });
      }
      cursor = m.end;
    }
    if (cursor < text.length) {
      segments.push({ text: text.slice(cursor) });
    }

    return segments;
  }

  async function load() {
    try {
      const res = await fetch('data/glossary.json');
      const data = await res.json();
      build(data.terms || []);
    } catch (e) {
      console.warn('[Glossary] Failed to load glossary.json:', e);
      _ready = false;
    }
  }

  return { load, parse, isReady: () => _ready };
})();
