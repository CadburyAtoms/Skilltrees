// Damage classifier v2. The key distinction: does the talent CREATE damage, or AMPLIFY an
// attack the base system already provides? Heroic talents are overwhelmingly amplifiers.
const fs=require('fs');
const rows=JSON.parse(fs.readFileSync(process.argv[2]+'/all-talents.json','utf8'));
const txt=r=>String(r.authoredDescription||r.description||'').replace(/\s+/g,' ');

const MITIGATE=/(reduce|reduces|reducing|prevent|prevents|ignore|ignores|resist|resistance|immune|negate|negates|halve|halves)[^.;]{0,60}damage|damage[^.;]{0,40}(is |are )?(reduced|prevented|negated|halved|by half)|take half that damage|half \[[^\]]*\] less damage/i;
const DIESIZE=/damage die size/i;
// amplify: adds to / multiplies damage of an attack you were already making
const AMPLIFY=/(extra|additional|added|adds?|add)\s+[^.;]{0,30}damage|damage[^.;]{0,20}(increases?|doubl|triple)|doubling damage|rolling an extra|roll(ing)? an? extra|maximi[sz]e[^.;]{0,20}damage|damage roll/i;
// source: the talent itself produces damage
const SOURCE=/(deal|deals|dealing|inflict|inflicts|takes?|suffers?|roll)\s+(?:an?\s+)?(\[[^\]]+\]|\d*d\d+|\d+)[^.;]{0,30}?damage|deals?\s+[^.;]{0,25}damage/i;

const CAT=r=>{
  const T=txt(r);
  if(!/damage/i.test(T)) return 'none';
  if(DIESIZE.test(T)) return 'diesize';
  // "deal ... LESS damage" is mitigation wearing a damage verb. leyline/White `Shield Wall`
  // ("attacks against them deal half [Tier][Die] less damage") classified as a damage SOURCE
  // until this guard existed, which is how White looked like it had 2 damage talents when it has 1.
  const LESS=/(deal|deals|dealing|take|takes)[^.;]{0,40}(less|no|half) damage|damage[^.;]{0,15}(is|are) (halved|negated)/i;
  const mit=MITIGATE.test(T)||LESS.test(T), amp=AMPLIFY.test(T), src=SOURCE.test(T)&&!LESS.test(T);
  if(src&&!amp) return 'source';
  if(src&&amp) return 'source+amp';
  if(amp) return 'amplify';
  if(mit) return 'mitigate';
  return 'mentions';
};
const out={};
for(const r of rows){
  const k=r.atlas+'|'+r.tree;
  out[k]||={n:0,cats:{},items:{}};
  const o=out[k];o.n++;
  const c=CAT(r);
  o.cats[c]=(o.cats[c]||0)+1;
  (o.items[c]||=[]).push({name:r.name,d:r.depth,L:r.earliestLevel,a:r.action,cost:r.cost});
}
const rank={leyline:0,heroic:1,deity:2};
const order=Object.keys(out).sort((a,b)=>{const[aa,at]=a.split('|'),[ba,bt]=b.split('|');return rank[aa]-rank[ba]||at.localeCompare(bt);});
console.log('TREE                  n  SOURCE  SRC+AMP  AMPLIFY  MITIG  DIESIZE  |  offensive(src) earliestL');
for(const k of order){
  const o=out[k],c=o.cats;
  const srcItems=[...(o.items.source||[]),...(o.items['source+amp']||[])];
  const eL=srcItems.length?Math.min(...srcItems.map(x=>x.L)):'-';
  console.log(k.replace('|','/').padEnd(21),String(o.n).padStart(3),
    String(c.source||0).padStart(6),String(c['source+amp']||0).padStart(8),
    String(c.amplify||0).padStart(8),String(c.mitigate||0).padStart(6),
    String(c.diesize||0).padStart(7),'  |',String(srcItems.length).padStart(3),String(eL).padStart(9));
}
fs.writeFileSync(process.argv[2]+'/../census2.json',JSON.stringify(out,null,1));

// ---- CROSS-CHECK against the authored roll formulas -------------------------------------------
// The block above is regex over prose. `damageFormula` is what Foundry actually rolls, taken from
// the authored overlay. Two independent evidence streams; where they disagree, someone is wrong
// and the talent text settles it. Note `type: "heal"` formulas are NOT damage (Scholar's three
// and Green's two are heals) -- counting `damage.formula` without that filter says Scholar deals
// damage when it deals none.
console.log('');
console.log('=== CROSS-CHECK: prose classifier vs. the authored roll formula ===');
console.log('TREE                  regex-src  roll-dmg  roll-heal  DELTA  disagreements');
for(const k of order){
  const [atlas,tree]=k.split('|');
  const sub=rows.filter(r=>r.atlas===atlas&&r.tree===tree);
  const o=out[k];
  const srcNames=new Set([...(o.items.source||[]),...(o.items['source+amp']||[])].map(x=>x.name));
  const formNames=new Set(sub.filter(r=>r.isDamageFormula).map(r=>r.name));
  const onlyRegex=[...srcNames].filter(n=>!formNames.has(n));
  const onlyForm=[...formNames].filter(n=>!srcNames.has(n));
  const heal=sub.filter(r=>r.isHealFormula).length;
  const bits=[];
  if(onlyRegex.length) bits.push('prose-only: '+onlyRegex.join(', '));
  if(onlyForm.length) bits.push('FORMULA-ONLY: '+onlyForm.join(', '));
  console.log(k.replace('|','/').padEnd(21),String(srcNames.size).padStart(9),String(formNames.size).padStart(9),
    String(heal).padStart(10),String(formNames.size-srcNames.size).padStart(7),'  '+(bits.join(' | ')||'agree'));
}
const allForm=rows.filter(r=>r.isDamageFormula);
console.log('');
console.log('Total: '+allForm.length+' talents carry a damage roll formula, '+rows.filter(r=>r.isHealFormula).length+' carry a heal formula.');
console.log('A talent can deal damage with NO formula (fixed amounts, event-driven, summons, hazards),');
console.log('so the formula count is a FLOOR. A prose hit with no formula is either unautomated damage');
console.log('or a false positive -- read the talent.');

// ---- wiring, which is a different question and worth seeing next to it -------------------------
console.log('');
console.log('=== WIRING (authored overlay): how much of each tree is actually automated ===');
console.log('TREE                  n  withEvents  withEffects  neither  %unwired');
for(const k of order){
  const [atlas,tree]=k.split('|');
  const sub=rows.filter(r=>r.atlas===atlas&&r.tree===tree);
  const ev=sub.filter(r=>r.hasEvents).length, ef=sub.filter(r=>r.hasEffects).length;
  const n=sub.filter(r=>!r.hasEvents&&!r.hasEffects).length;
  console.log(k.replace('|','/').padEnd(21),String(sub.length).padStart(3),String(ev).padStart(11),
    String(ef).padStart(12),String(n).padStart(9),(100*n/sub.length).toFixed(0).padStart(8)+'%');
}
