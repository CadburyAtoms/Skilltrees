// Controlled overlap: FUNCTION vectors only. Resource nouns (Investiture/Focus), range nouns
// (Attunement Range) and skill names are atlas MARKERS, not functions — they are excluded, because
// including them makes every leyline tree look like every other leyline tree.
const fs=require('fs');
const rows=JSON.parse(fs.readFileSync(process.argv[2]+'/all-talents.json','utf8'));
const txt=r=>String(r.authoredDescription||r.description||'').toLowerCase();
// each function = a regex over talent text; presence-per-talent gives the vector
const FUNCS={
 deal_damage:/deals?\s+(?:an?\s+)?(\[[^\]]+\]|\d*d\d+|\d+)[^.;]{0,30}damage/,
 amplify_damage:/(extra|additional)\s+[^.;]{0,25}damage|damage roll|doubling damage|rolling an extra/,
 reduce_damage:/(reduce|prevent|ignore|halve|negate)[^.;]{0,50}damage|less damage|damage[^.;]{0,25}reduced/,
 heal:/(regain|recover|restore|heal)[^.;]{0,30}(health|hp)/,
 temp_hp:/temporary (hp|health)/,
 // The (?<!dis) matters: the old pattern was /gain(s)? (an )?advantage|advantage on/, and
 // `advantage on` matches INSIDE `disadvantage on`. That counted Blue's four disadvantage-imposing
 // talents (Intercept, Absolute Stillness, False Premise, Probability Cascade) as advantage
 // GRANTERS — the source of the "Blue has 8 advantage-granting talents" line in the first draft
 // of the README. Blue has 4. Fixed 2026-09-09.
 grant_advantage:/(?<!dis)advantage/,
 impose_disadvantage:/disadvantage/,
 reroll:/re-?roll/,
 grant_action:/(gain|grant|take)[^.;]{0,30}(reaction|free action|action)|additional action|extra action/,
 forced_move:/(push|pull|pulled|pushed|knock|slide|move[sd]? (them|it|the target))/,
 self_move:/(move up to|teleport|movement increases|step|reposition)/,
 condition:/(immobiliz|restrain|prone|stunned|slowed|afflicted|surprised|frightened|deafened|blinded|exhausted|unconscious)/,
 buff_ally:/(ally|allies)[^.;]{0,60}(gain|increase|add|bonus|advantage)/,
 debuff_enemy:/(enemy|enemies|target|creature)[^.;]{0,50}(decrease|reduce|penalty|-\d|lower)/,
 defense_mod:/defense(s)? (increase|decrease|reduce|by)|\+\d[^.;]{0,15}defense/,
 zone:/(difficult terrain|dangerous terrain|area|zone|aura|barrier|wall|ground|space)/,
 summon:/(summon|companion|construct|animate|create a[^.;]{0,25}(creature|servant|being))/,
 trap_hazard:/(trap|hazard|snare)/,
 detect_info:/(detect|sense|learn|know|reveal|discern|identify|perceive|read)/,
 stealth_illusion:/(hidden|invisible|illusion|conceal|disguise|phantom|image)/,
 social:/(persuad|deceiv|intimidat|command|convince|negotiat|influence|charm|reputation)/,
 resource_gain:/(recover|regain|gain)[^.;]{0,20}(investiture|focus|opportunity)/,
 opposed_test:/vs\.\s+(physical|cognitive|spiritual)/,
 passive_always:/^when |^whenever |^at the start|^once per/,
 duration_scene:/for the scene/,
 reaction_gated:/^when an? (ally|enemy|creature)|when you are (hit|attacked|targeted)/,
};
const byTree={};
for(const r of rows){const k=r.atlas+'/'+r.tree;(byTree[k]||=[]).push(txt(r));}
const vec={},counts={};
for(const [k,ts] of Object.entries(byTree)){
  const v={},c={};
  for(const [f,re] of Object.entries(FUNCS)){let n=0;for(const s of ts) if(re.test(s)) n++; v[f]=n/ts.length; c[f]=n;}
  vec[k]=v;counts[k]=c;
}
const cos=(a,b)=>{let d=0,na=0,nb=0;for(const k of Object.keys(a)){const x=a[k],y=b[k];d+=x*y;na+=x*x;nb+=y*y;}return na&&nb?d/Math.sqrt(na*nb):0;};
const keys=Object.keys(vec),pairs=[];
for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)pairs.push([keys[i],keys[j],cos(vec[keys[i]],vec[keys[j]])]);
pairs.sort((a,b)=>b[2]-a[2]);
console.log('=== TOP 15 FUNCTIONALLY most similar pairs (atlas vocabulary controlled out) ===');
pairs.slice(0,15).forEach(([a,b,s])=>console.log('  '+s.toFixed(3)+'  '+a.padEnd(20)+' <-> '+b));
const rankOf=(x,y)=>pairs.findIndex(([a,b])=>(a===x&&b===y)||(a===y&&b===x))+1;
console.log('\n  Blue<->Scholar  cos='+cos(vec['leyline/Blue'],vec['heroic/Scholar']).toFixed(3)+'  RANK '+rankOf('leyline/Blue','heroic/Scholar')+' of '+pairs.length);
console.log('  White<->Leader  cos='+cos(vec['leyline/White'],vec['heroic/Leader']).toFixed(3)+'  RANK '+rankOf('leyline/White','heroic/Leader'));
console.log('\n=== Blue vs Scholar function-by-function (count of talents, out of 25 each) ===');
const b=counts['leyline/Blue'],s=counts['heroic/Scholar'];
console.log('  function            Blue  Scholar  delta');
Object.keys(FUNCS).forEach(f=>{if(b[f]||s[f])console.log('  '+f.padEnd(20)+String(b[f]).padStart(4)+String(s[f]).padStart(8)+String(b[f]-s[f]).padStart(7));});
fs.writeFileSync(process.argv[2]+'/../funcvec.json',JSON.stringify({vec,counts,pairs:pairs.slice(0,40)},null,1));
