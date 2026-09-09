// Producer/consumer census for every named currency in the system. The README asserted these
// counts before any script derived them; this is that script, so the numbers can be re-checked.
//
// The distinction that matters: a currency PRODUCED by many trees and CONSUMED by few is not a
// synergy, it is waste — and for `advantage` it is worse than waste, because the cosmere-rpg
// implementation is binary (d20.number = 2, 'kh'), so a second advantage on the same roll is
// worth exactly zero. See SYSTEM-PRIMER.md.
const fs = require('fs');
const OUT = process.argv[2];
const rows = JSON.parse(fs.readFileSync(OUT + '/all-talents.json', 'utf8'));
const txt = r => String(r.authoredDescription || r.description || '').replace(/\s+/g, ' ');
const costOf = r => String(r.cost || '');

// A currency is defined by how it is GAINED and how it is SPENT. Both regexes must be narrow:
// "Investiture" appears in half the game's text, but only a few talents GIVE you any.
const CURRENCIES = {
  // (?<!dis) on every `advantage` — see functional-overlap.js for the bug this prevents.
  advantage: {
    produce: /(gain|gains|grant|grants|granting|have|has|with)[^.;]{0,40}(?<!dis)advantage/i,
    // A consumer keys off advantage EXISTING: it redirects one, triggers on the Gain Advantage
    // action, reacts to someone else gaining one, or denies one. Granting is not consuming, so
    // the Attunement Keys ("When you Draw Mana, gain an advantage") must NOT match here.
    consume: /(after|when) you Gain Advantage|grant that advantage|(gains?|gaining) an advantage from any source|cannot benefit from (advantage|illusions[^.;]{0,60}advantage)|(spend|expend|forgo|forfeit|convert)[^.;]{0,25}(?<!dis)advantage\b/i,
  },
  disadvantage: {
    produce: /(impose|imposes|imposing|inflict|gains?|has|have|with|suffers?)[^.;]{0,40}disadvantage|disadvantage on/i,
    consume: /(remove|removes|negate|negates|cancel|cancels|ignore|ignores)[^.;]{0,30}disadvantage/i,
  },
  investiture: {
    // produced = you END UP WITH MORE than you spent. Excludes "Spend 1 Investiture" (a cost).
    produce: /\b(regain|recover|restore|gain|gains|grant|grants)\b[^.;]{0,40}\bInvestiture\b|\bInvestiture\b[^.;]{0,25}\b(refills?|replenish\w*)\b/i,
    consume: /\bInvestiture\b/i,           // narrowed below by the cost field
  },
  focus: {
    produce: /\b(regain|recover|restore|gain|gains|grant|grants)\b[^.;]{0,40}\bfocus\b/i,
    consume: /\bfocus\b/i,
  },
  opportunity: {
    produce: /\b(gain|gains|grant|grants|add|adds)\b[^.;]{0,40}\bOpportunity\b|\bOpportunity range\b/i,
    consume: /\bspend\w*\b[^.;]{0,30}\bOpportunity\b|\bor Opportunity\b/i,
  },
  // "Raise the stakes" is the GM action that makes a test roll the plot die, so a talent that
  // raises the stakes IS plot-die integration even though it never says "plot die". Searching the
  // literal words undercounts badly: it finds 3 talents in 2 trees, where the real figure is 19
  // across 7. Opportunity range and Complication manipulation belong here for the same reason.
  plot_die: {
    produce: /\braise(s|d)? the stakes\b|\b(roll|rolls|add|adds)\b[^.;]{0,30}\bplot die\b/i,
    consume: /\b(re-?roll|choose|change|set|replace|treat|remove)\b[^.;]{0,40}\b(plot die|Complication)\b|\bplot die\b[^.;]{0,30}\b(face|result)\b|\bOpportunity range\b[^.;]{0,20}\bexpand/i,
  },
  temp_hp: { produce: /\btemporary (hp|health)\b/i, consume: /\bspend\w*[^.;]{0,20}\btemporary (hp|health)\b/i },
  omen: { produce: /\bplace\w*[^.;]{0,25}\bOmen\b|\bOmen\b[^.;]{0,20}\bon the target\b/i, consume: /\b(spend|consume|remove|detonat\w+|trigger)\w*[^.;]{0,25}\bOmen\b/i },
  quarry: { produce: /\bmark\w*[^.;]{0,30}\bQuarry\b|\bas your Quarry\b/i, consume: /\byour Quarry\b/i },
  fabrial: { produce: /\b(craft|create|forge|build)\w*[^.;]{0,30}\bfabrial\b/i, consume: /\b(that|your|the) fabrial\b/i },
  harvested_remain: { produce: /\bHarvested Remain/i, consume: /\b(spend|consume|expend)\w*[^.;]{0,30}\bHarvested Remain/i },
  charge: { produce: /\bplace\w*[^.;]{0,25}\bCharge\b|\bSet Charge\b/i, consume: /\b(detonat\w+|trigger\w*|spend\w*|consume\w*)[^.;]{0,30}\bCharge\b/i },
  ordained_ground: { produce: /\bOrdained Ground\b/i, consume: /\b(on|from|within)[^.;]{0,20}\bOrdained Ground\b/i },
  snare: { produce: /\bSnare\b/i, consume: /\bSnare\b[^.;]{0,30}\b(trigger|spring|consumed)/i },
  edict: { produce: /\bplace\w*[^.;]{0,25}\bEdict\b|\bEdict\b[^.;]{0,20}\bon a\b/i, consume: /\b(violat\w+|consume\w*|spend\w*)[^.;]{0,30}\bEdict\b/i },
  decree: { produce: /\bDecree\b/i, consume: /\b(within|inside)[^.;]{0,25}\bDecree\b/i },
  mark: { produce: /\bmark\w*\b[^.;]{0,25}\b(the |a |an )?(target|enemy|creature)\b/i, consume: /\b(a |the |your )marked (target|enemy|creature)\b|\bagainst a marked\b/i },
  damage_die_size: { produce: /\bdamage die size\b[^.;]{0,30}\b(increase|larger|up|step up)/i, consume: /\bdamage die size\b/i },
};

const trees = [...new Set(rows.map(r => r.atlas + '/' + r.tree))];
const report = {};
for (const [cur, re] of Object.entries(CURRENCIES)) {
  const prod = {}, cons = {};
  for (const r of rows) {
    const T = txt(r), k = r.atlas + '/' + r.tree;
    const isProd = re.produce.test(T);
    // Investiture/focus "consumption" is the COST FIELD, not a text mention — otherwise every
    // talent that names the resource in its rider counts as a consumer.
    let isCons;
    if (cur === 'investiture') isCons = /Investiture/i.test(costOf(r));
    else if (cur === 'focus') isCons = /focus/i.test(costOf(r));
    else isCons = re.consume.test(T);
    if (isProd) (prod[k] ||= []).push(r.name);
    if (isCons) (cons[k] ||= []).push(r.name);
  }
  report[cur] = { prod, cons };
}

const pad = (s, n) => String(s).padEnd(n);
console.log('CURRENCY              PRODUCED BY          CONSUMED BY          RATIO   VERDICT');
const rowsOut = [];
for (const [cur, { prod, cons }] of Object.entries(report)) {
  const np = Object.values(prod).reduce((a, b) => a + b.length, 0), tp = Object.keys(prod).length;
  const nc = Object.values(cons).reduce((a, b) => a + b.length, 0), tc = Object.keys(cons).length;
  let verdict;
  if (!np && !nc) verdict = 'absent';
  else if (!nc) verdict = 'PRODUCED, NEVER CONSUMED';
  else if (tp === 1 && tc === 1 && Object.keys(prod)[0] === Object.keys(cons)[0]) verdict = 'SEALED LOOP (' + Object.keys(prod)[0] + ')';
  else if (np / Math.max(1, nc) >= 4) verdict = 'OVER-PRODUCED';
  else verdict = 'balanced-ish';
  console.log(pad(cur, 21), pad(`${np} talents / ${tp} trees`, 20), pad(`${nc} talents / ${tc} trees`, 20),
    pad((np / Math.max(1, nc)).toFixed(1), 7), verdict);
  rowsOut.push({ currency: cur, producers: np, producerTrees: tp, consumers: nc, consumerTrees: tc, verdict, prod, cons });
}

console.log('\n=== advantage: producers per tree (the most crowded space in the game) ===');
const ap = report.advantage.prod;
for (const k of trees) if (ap[k]) console.log('  ' + pad(k, 20) + String(ap[k].length).padStart(3) + '  ' + ap[k].join(', '));
console.log('  CONSUMERS:');
for (const [k, v] of Object.entries(report.advantage.cons)) console.log('  ' + pad(k, 20) + String(v.length).padStart(3) + '  ' + v.join(', '));

console.log('\n=== Investiture economy: bonus REGEN vs. talents that COST Investiture ===');
const ip = report.investiture.prod, ic = report.investiture.cons;
console.log('  tree                 regen  costers');
for (const k of trees) console.log('  ' + pad(k, 20) + String((ip[k] || []).length).padStart(5) + String((ic[k] || []).length).padStart(9)
  + ((ip[k] || []).length ? '   [' + ip[k].join(', ') + ']' : ''));

// The plot die deserves its own listing: two design-guide claims rest on it — "Plot Die
// manipulation is Blue's capstone identity. Choosing any Plot Die face is the ultimate Blue
// expression" and White's "Plot Die integration. White rewards coordinated group action."
console.log('\n=== PLOT-DIE INTEGRATION, by tree (raise the stakes counts) ===');
const PLOT = /\braise(s|d)? the stakes\b|\bplot die\b|\bComplication\b|\bOpportunity range\b/i;
const plotBy = {};
for (const r of rows) if (PLOT.test(txt(r))) (plotBy[r.atlas + '/' + r.tree] ||= []).push(r.name);
for (const [k, v] of Object.entries(plotBy).sort((a, b) => b[1].length - a[1].length)) {
  console.log('  ' + pad(k, 20) + String(v.length).padStart(3) + '  ' + v.join(', '));
}
const noPlot = trees.filter(k => !plotBy[k]);
console.log('  NONE: ' + noPlot.join(', '));

console.log('\n=== Focus economy ===');
const fp = report.focus.prod, fc = report.focus.cons;
console.log('  tree                 regen  costers');
for (const k of trees) if ((fp[k] || []).length || (fc[k] || []).length)
  console.log('  ' + pad(k, 20) + String((fp[k] || []).length).padStart(5) + String((fc[k] || []).length).padStart(9));

fs.writeFileSync(OUT + '/resource-economy.json', JSON.stringify(rowsOut, null, 1));

// The regexes above are a ranking heuristic, not a verdict. Every talent that names `advantage`
// is dumped verbatim so the classification can be redone by hand — advantage is the currency the
// whole overlap question turns on, and it is exactly the kind of number a regex gets wrong.
let led = '# Advantage ledger — every talent whose text names `advantage` (not `disadvantage`)\n\n';
led += 'Verbatim. Classify PRODUCER (grants one) / CONSUMER (keys off one existing, redirects it,\n';
led += 'triggers on the Gain Advantage action, or denies one) / NEITHER yourself. The regex counts\n';
led += 'in the table above are a heuristic; this list is the evidence.\n\n';
led += 'Remember from SYSTEM-PRIMER.md: advantage is BINARY in the implementation (`d20.number = 2`,\n';
led += '`kh`). A second advantage on the same roll is worth zero — so N producers is not N units of\n';
led += 'value. Note especially any talent whose text promises more than one advantage at once.\n\n';
const advRe = /(?<!dis)advantage/i;
for (const r of rows) {
  const T = txt(r);
  if (!advRe.test(T)) continue;
  led += `- **${r.atlas}/${r.tree} — ${r.name}** _(${r.action}; cost ${r.cost || '—'}; depth ${r.depth}, earliest L${r.earliestLevel})_\n  > ${T}\n`;
}
fs.writeFileSync(OUT + '/advantage-ledger.md', led);
console.log('\nwrote ' + OUT + '/resource-economy.json and ' + OUT + '/advantage-ledger.md');
