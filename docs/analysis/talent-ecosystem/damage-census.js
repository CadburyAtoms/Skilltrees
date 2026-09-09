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
