# -*- coding: utf-8 -*-
"""Generate EDHA_LEVELUP_GUIDES.html — 9 pages, three builds per PC, all within the
character's own declared path (Ben, 2026-09-09).

Layout is the v2 design: the card grid is gone (it repeated the ladder), its space pays for
THE PLAN, and cost moves into the ladder as a column. Talent action/cost/tree still come
verbatim from data/*.json; only the framing prose is authored, in prose.json.
Ladders come from docs/levelup-builds.json — scripts/validate-build.py must report PASS.
"""
import json, io, re, html, os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))   # the prose file sits beside this script

def load(p): return json.load(io.open(p, encoding='utf-8'))
LEY = load(rf'{REPO}\data\leyline.json'); HER = load(rf'{REPO}\data\cosmere.json'); DOM = load(rf'{REPO}\data\domain.json')
TAL = []
for t in LEY: TAL.append({**t, 'atlas': 'leyline', 'tree': t.get('path')})
for t in HER: TAL.append({**t, 'atlas': 'heroic',  'tree': t.get('path')})
for t in DOM: TAL.append({**t, 'atlas': 'deity',   'tree': t.get('domain')})

def find(name, tree=None):
    hits = [t for t in TAL if t['name'].strip().lower() == name.strip().lower()]
    if tree and len(hits) > 1:
        n = [t for t in hits if (t.get('tree') or '').lower() == tree.lower()
             or (t.get('specialty') or '').lower() == tree.lower()]
        if len(n) == 1: return n[0]
    if len(hits) != 1: raise SystemExit(f'!! ambiguous/missing: {name} (tree={tree})')
    return hits[0]

SPEC = {}
for b in load(rf'{REPO}\docs\levelup-builds.json'):
    key = ' '.join(b['name'].split(' ')[:2])            # "TEM 1"
    SPEC[key.title()] = b
P = load(os.path.join(HERE, 'levelup-guides-prose.json'))

COLOR = {'White': '#AEB4A6', 'Blue': '#4A6E8F', 'Black': '#3B3542', 'Red': '#9C4432', 'Green': '#4A7042'}
DEITY_COLORS = {'Knowledge': ('Red', 'Green'), 'Chaos': ('Black', 'Blue'), 'Fate': ('Green', 'White')}
SK = {'agi':'Agility','ath':'Athletics','hwp':'Heavy Wpn','lwp':'Light Wpn','stl':'Stealth','thv':'Thievery',
      'cra':'Crafting','ded':'Deduction','dis':'Discipline','inm':'Intimidation','lor':'Lore','med':'Medicine',
      'dec':'Deception','ins':'Insight','lea':'Leadership','prc':'Perception','prs':'Persuasion','sur':'Survival',
      'white':'White','blue':'Blue','black':'Black','red':'Red','green':'Green'}
FREE_ACT = {'Passive', 'Always on', 'Special'}
ACTION = {'∞': 'Always on', '★': 'Special', '⟲': 'Reaction', 'Special': 'Special', 'Passive': 'Passive',
          'Free Action': 'Free action', 'Action': '1 Action', 'Reaction': 'Reaction',
          '1 Action': '1 Action', '2 Actions': '2 Actions', '3 Actions': '3 Actions'}

def esc(s): return html.escape(s or '', quote=False)

def glue(cell):
    """Bind each middot-separated stat into one unbreakable token, so the strip wraps
    BETWEEN stats and never orphans a lone number ('... inv' / '4')."""
    toks = [t.strip().replace(' ', '&nbsp;') for t in cell.split('&middot;')]
    return ' &middot; '.join(t for t in toks if t)

def cost_chip(t):
    a = ACTION.get((t.get('action') or '').strip(), (t.get('action') or '—').strip())
    c = (t.get('cost') or '').strip()
    if c in ('', '—', '-', 'None'): c = ''
    c = re.sub(r'\bInvestiture\b', 'Inv', c)
    c = re.sub(r'\bFocus\b', 'foc', c).replace('Variable foc', 'foc')
    c = c.replace('Lose HP = half [Die]', 'half [Die] HP').replace('Lose HP = Tier', 'Tier HP')
    c = c.replace('Opportunity; 1 Inv', 'Opp; 1 Inv').replace('1 Inv + ', '1 Inv + ')
    s = f'{a} &middot; {c}' if c else a
    return f'<i class="free">{s}</i>' if (a in FREE_ACT and not c) else s

def ranks_str(ranks, attr):
    """Non-breaking so an arrow can never orphan; the attribute rides as a gold chip."""
    if not ranks:
        body = 'two free ranks'
    else:
        body = ', '.join(f'{SK.get(k,k).replace(" ","&nbsp;")}&nbsp;&rarr;&nbsp;{v}' for k, v in ranks.items())
    if attr:
        body += f' <span class="attr">&middot; {attr}</span>'
    return body

CSS = """
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family:'Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif; color:#232B24; background:#fff;
         -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .sheet { width:210mm; height:296mm; padding:10mm 12mm 9mm; overflow:hidden;
           display:flex; flex-direction:column; gap:4mm; page-break-after:always; }
  .sheet:last-child { page-break-after:auto; }
  .eyebrow { font-size:7.2pt; letter-spacing:.2em; text-transform:uppercase; color:#9A6E2A;
             font-weight:700; margin-bottom:1mm; display:flex; justify-content:space-between; }
  .hd { border-bottom:1.4pt solid #232B24; padding-bottom:1.6mm; }
  .hd h1 { font-size:17pt; margin:0 0 1.4mm; line-height:1.04; display:flex; align-items:baseline;
           gap:3mm; flex-wrap:wrap; }
  .hd h1 .bn { font-size:10.6pt; font-style:italic; font-weight:400; color:#40684E; }
  .paths { display:flex; gap:5mm; align-items:center; flex-wrap:wrap; font-size:8.4pt; }
  .pip { display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-.6mm;
         margin-right:1.1mm; border:.5pt solid rgba(0,0,0,.3); }
  .swatch { display:inline-block; width:6.2mm; height:3.5mm; vertical-align:-.6mm; margin-right:1.1mm;
            border:.5pt solid rgba(0,0,0,.3); }
  .accentband { height:2.4pt; }
  .now { background:#EEF0E7; border-left:2.4pt solid #40684E; padding:2.2mm 3mm 2.4mm; }
  .nowgrid { display:flex; gap:3.4mm; }
  .nowcell { flex:1 1 0; padding-left:3.4mm; border-left:.5pt solid #C7CDBB; }
  .nowcell:first-child { padding-left:0; border-left:none; }
  .nowcell.c1 { flex-grow:1.02; } .nowcell.c2 { flex-grow:.94; } .nowcell.c3 { flex-grow:1.32; }
  .nowlab { font-size:6.2pt; letter-spacing:.16em; text-transform:uppercase; color:#9A6E2A;
            font-weight:700; margin-bottom:.7mm; }
  .nowval { font-size:7.9pt; line-height:1.32; }
  .spine { margin-top:1.8mm; padding-top:1.6mm; border-top:.5pt solid #C7CDBB;
           font-size:8.4pt; line-height:1.32; font-style:italic; color:#3E463D; }
  .zone { display:flex; align-items:baseline; gap:2.4mm; margin-bottom:1.6mm; }
  .zt { font-size:10.2pt; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#40684E; }
  .zs { font-size:8pt; font-style:italic; color:#5A6155; }
  .rule { flex:1; border-bottom:.6pt solid #C7CDBB; transform:translateY(-1mm); }
  table { width:100%; border-collapse:collapse; font-size:8.4pt; }
  thead th { font-size:6.8pt; letter-spacing:.13em; text-transform:uppercase; color:#6A7165; text-align:left;
             padding:0 1.6mm 1.1mm; border-bottom:.9pt solid #232B24; font-weight:700; }
  tbody td { padding:1.75mm 1.6mm; border-bottom:.4pt solid #DDE1D5; vertical-align:top; line-height:1.22; }
  tbody tr:last-child td { border-bottom:none; }
  td.lv { font-weight:700; width:7mm; font-size:9pt; color:#40684E; }
  td.tal { width:42mm; font-weight:700; font-size:8.6pt; }
  td.tal em { display:block; font-weight:400; font-style:normal; font-size:6.8pt; color:#7A8175;
              letter-spacing:.05em; text-transform:uppercase; margin-top:.35mm; }
  td.co { width:24mm; font-size:7.4pt; color:#4E554B; }
  td.co i, td.co { hyphens:none; }
  td.co .free { color:#868D80; font-style:italic; }
  td.sk { width:43mm; font-size:7.9pt; color:#3E463D; }
  td.sk .attr { color:#9A6E2A; font-weight:700; white-space:nowrap; }
  td.wy { font-size:8.1pt; color:#2E352E; }
  tr.spike td { background:#F5F2E7; }
  tr.spike td.lv { color:#9A6E2A; }
  tr.spike td.wy b { color:#9A6E2A; letter-spacing:.05em; }
  .plan { display:flex; gap:6mm; }
  .plancol { flex:1 1 0; }
  .plancol + .plancol { padding-left:6mm; border-left:.5pt solid #C7CDBB; }
  .planlab { font-size:7pt; letter-spacing:.17em; text-transform:uppercase; color:#40684E;
             font-weight:700; margin-bottom:1.5mm; }
  .beat { display:flex; gap:2.2mm; margin-bottom:2.1mm; align-items:flex-start; }
  .beat:last-child { margin-bottom:0; }
  .num { display:inline-flex; align-items:center; justify-content:center; width:4.4mm; height:4.4mm;
         border-radius:50%; background:#40684E; color:#fff; font-size:6.8pt; font-weight:700;
         flex:0 0 auto; margin-top:.2mm; }
  .beat p { margin:0; font-size:8.2pt; line-height:1.28; }
  .callout { background:#F5F2E7; border:.7pt solid #D8CFAE; padding:2.7mm 3mm; font-size:8pt; line-height:1.32; }
  .callout .clab { font-size:6.6pt; letter-spacing:.17em; text-transform:uppercase; color:#9A6E2A;
                   font-weight:700; margin-right:1.6mm; }
  .deliver { margin-top:auto; background:#40684E; color:#F3F1E4; padding:4mm; display:flex; gap:6mm; }
  .deliver .lab { font-size:7.1pt; letter-spacing:.19em; text-transform:uppercase; color:#E2C489;
                  font-weight:700; margin-bottom:1.2mm; }
  .deliver h3 { margin:0 0 1.3mm; font-size:12pt; line-height:1.08; }
  .deliver p { margin:0; font-size:8.4pt; line-height:1.34; }
  .deliver .col { flex:1; }
  .deliver .col + .col { flex:0 0 62mm; }
  .deliver ul { margin:0; padding:0; }
  .deliver li { list-style:none; margin-bottom:1.2mm; font-size:8.6pt; line-height:1.26;
                padding-left:5.2mm; text-indent:-5.2mm; }
  .box { display:inline-block; width:3.4mm; height:3.4mm; border:.8pt solid #E2C489;
         vertical-align:-.4mm; margin-right:1.8mm; }
  .foot { font-size:6.7pt; color:#6A7165; letter-spacing:.04em; display:flex;
          justify-content:space-between; padding-top:.8mm; }
"""

def path_bar(pc):
    c1, c2 = DEITY_COLORS[pc['deity']]
    return (f'<span><b>{esc(pc["heroic"])}</b> <span style="color:#6A7165">heroic</span></span>\n      '
            f'<span><span class="pip" style="background:{COLOR[pc["leyline"]]}"></span>'
            f'<b>{pc["leyline"]}</b> <span style="color:#6A7165">leyline</span></span>\n      '
            f'<span><span class="swatch" style="background:linear-gradient(90deg,{COLOR[c1]} 50%,{COLOR[c2]} 50%)"></span>'
            f'<b>{pc["deity"]}</b> <span style="color:#6A7165">deity &middot; {c1}/{c2}</span></span>')

def beats(items):
    return '\n    '.join(f'<div class="beat"><span class="num">{i+1}</span><p>{b}</p></div>'
                         for i, b in enumerate(items))

def page(pc_key, n):
    pc = P['pcs'][pc_key]; b = P['builds'][f'{pc_key} {n}']; spec = SPEC[f'{pc_key} {n}'.title()]
    rows = []
    for step, buys in zip(spec['levels'], b['buys']):
        lv = step['lv']; t = find(step['talent'], step.get('tree'))
        sub = f'{t["tree"]} &middot; {t["specialty"]}' if t['atlas'] != 'deity' else t['tree']
        rows.append(
          f'<tr{" class=\"spike\"" if lv == 6 else ""}><td class="lv">{lv}</td>'
          f'<td class="tal">{esc(t["name"])}<em>{sub}</em></td>'
          f'<td class="co">{cost_chip(t)}</td>'
          f'<td class="sk">{ranks_str(step.get("ranks"), b["attr"].get(str(lv)))}</td>'
          f'<td class="wy">{buys}</td></tr>')
    d = spec['levels'][0]; first = find(d['talent'], d.get('tree'))
    return f"""
<div class="sheet">
  <div class="hd">
    <div class="eyebrow"><span>Edha &middot; level-up guide &middot; levels 2&ndash;10</span><span>Build {n} of 3</span></div>
    <h1>{esc(pc['name'])} <span class="bn">{esc(b['title'])}</span></h1>
    <div class="paths">
      {path_bar(pc)}
      <span style="color:#6A7165">&mdash; this build leans <b style="color:#3E463D">{b['focus']}</b></span>
    </div>
  </div>
  <div class="accentband" style="background:{b['accent']}"></div>

  <div class="now">
    <div class="nowgrid">
      <div class="nowcell c1"><div class="nowlab">Health &amp; defence</div><div class="nowval">{glue(pc['hp'])}</div></div>
      <div class="nowcell c2"><div class="nowlab">Attributes</div><div class="nowval">{glue(pc['attrs'])}</div></div>
      <div class="nowcell c3"><div class="nowlab">Best skills</div><div class="nowval">{glue(pc['best'])}</div></div>
    </div>
    <div class="spine">{b['spine']}</div>
  </div>

  <div>
    <div class="zone"><span class="zt">The ladder</span>
      <span class="zs">one talent and two skill ranks per level</span><span class="rule"></span></div>
    <table>
      <thead><tr><th>Lv</th><th>Talent</th><th>Cost</th><th>Ranks &amp; attribute</th><th>What it buys you</th></tr></thead>
      <tbody>
        {chr(10).join(rows)}
      </tbody>
    </table>
  </div>

  <div>
    <div class="zone"><span class="zt">The plan</span>
      <span class="zs">how you actually play it</span><span class="rule"></span></div>
    <div class="plan">
      <div class="plancol"><div class="planlab">In a fight</div>
    {beats(b['fight'])}
      </div>
      <div class="plancol"><div class="planlab">In a room</div>
    {beats(b['room'])}
      </div>
    </div>
  </div>

  <div class="callout"><span class="clab">The catch</span>{b['catch']}</div>

  <div class="deliver">
    <div class="col">
      <div class="lab">Your next level-up</div>
      <h3>Level 2 &mdash; {esc(first['name'])}</h3>
      <p>{b['next']}</p>
    </div>
    <div class="col">
      <div class="lab">Spend these</div>
      <ul>
        <li><span class="box"></span>Talent: <b>{esc(first['name'])}</b></li>
        {chr(10).join(f'<li><span class="box"></span>Skill rank: <b>{SK.get(k,k)} &rarr; {v}</b></li>' for k, v in (d.get('ranks') or {}).items())}
        <li><span class="box"></span>{b['shop']}</li>
      </ul>
    </div>
  </div>
  <div class="foot"><span>Edha &mdash; {esc(pc['name'])} &middot; Build {n} of 3: {esc(b['title'])}</span><span>{esc(pc['heroic'])} &middot; {pc['leyline']} &middot; {esc(pc['deity'])}</span></div>
</div>"""

pages = ''.join(page(pc, n) for pc in ('Tem', 'Hannah', 'Soggy') for n in (1, 2, 3))
io.open(rf'{REPO}\EDHA_LEVELUP_GUIDES.html', 'w', encoding='utf-8').write(
  f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Edha \u2014 Level-Up Guides (three builds per character, L2\u2013L10)</title>
<style>{CSS}</style></head><body>{pages}
</body></html>""")
print('wrote EDHA_LEVELUP_GUIDES.html — 9 pages')
