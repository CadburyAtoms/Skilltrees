/* Main App.

   Views:
     hub          — atlas picker (4 atlases)
     atlas        — group grid for that atlas
     tree         — single tree (Key + columns) with character-driven prereq evaluation
     builder      — full character builder
     search       — global talent search
     balance      — designer stats

   Selecting a node now uses the character store. Edge prereqs (in-tree) and string prereqs
   (skills/attrs/talents/narrative) are both evaluated and surfaced in the talent panel.
*/

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR, useCallback: useC } = React;

const VIEW_HUB = 'hub';
const VIEW_ATLAS = 'atlas';
const VIEW_TREE = 'tree';
const VIEW_BUILDER = 'builder';
const VIEW_SEARCH = 'search';
const VIEW_STATS = 'stats';

const EDITOR_MODE = (() => {
  try { return new URLSearchParams(window.location.search).get('edit') === '1'; }
  catch { return false; }
})();

const ATLAS_META = [
{ id: 'leyline', name: 'Leyline', subtitle: 'Mortal arcana · 5 colors', blurb: 'Learned magic drawn from the ley — color-identity resource play.', color: 'white' },
{ id: 'heroic', name: 'Heroic', subtitle: 'Mundane mastery · 6 paths', blurb: 'Skilled practitioners. Agent, Envoy, Hunter, Leader, Scholar, Warrior.', color: 'red' },
{ id: 'deity', name: 'Deity', subtitle: 'Divine dominion · 10 deities', blurb: 'Champions of gods. Domain magic with narrative progression.', color: 'green' }];


function Toast({ t, onClose }) {
  const cls = 'toast toast-' + (t.kind || 'info');
  function clickBody() {
    if (t.copy) {
      try { navigator.clipboard.writeText(t.copy); } catch {}
    }
  }
  return (
    <div className={cls} role="status" onClick={clickBody}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
        maxWidth: 420, padding: '12px 16px',
        background: t.kind === 'err' ? '#3a1a1a' : t.kind === 'ok' ? '#1a2f1f' : '#1f1f1f',
        color: '#f6efdf', border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: '3px solid ' + (t.kind === 'err' ? '#c87070' : t.kind === 'ok' ? '#80b285' : '#b9a473'),
        borderRadius: 4, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        cursor: t.copy ? 'pointer' : 'default',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{t.msg}</div>
          {t.sub && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{t.sub}</div>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, opacity: 0.6, lineHeight: 1 }}
          title="Dismiss">✕</button>
      </div>
    </div>
  );
}

function downloadJSONFile(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

function useCharacterApp() {
  const [c, setC] = useS(window.Character.get());
  useE(() => window.Character.subscribe(setC), []);
  return c;
}

function Masthead({ view, setView, character, onPromote, onExport, editorMode, folderName, onConnectFolder }) {
  const charLabel = character.name ? `${character.name} · L${character.level}` : `Untitled · L${character.level}`;
  return (
    <div className="masthead parchment">
      <div className="title-block">
        <h1>S<span className="rubric">·</span>killtrees <span className="masthead-sub">·· THE ATLAS</span></h1>
        <div className="subtitle">Three atlases — Leyline · Heroic · Deity. One book, one character.</div>
      </div>
      <div className="masthead-actions">
        <div className="char-chip">
          <span className="small-caps">Active</span>
          <span className="rubric">{charLabel}</span>
        </div>
        <button className={'btn' + (view === VIEW_HUB ? ' active' : '')} onClick={() => setView(VIEW_HUB)}>Atlases</button>
        <button className={'btn' + (view === VIEW_BUILDER ? ' active' : '')} onClick={() => setView(VIEW_BUILDER)}>Builder</button>
        <button className={'btn' + (view === VIEW_SEARCH ? ' active' : '')} onClick={() => setView(VIEW_SEARCH)}>Search</button>
        <button className={'btn' + (view === VIEW_STATS ? ' active' : '')} onClick={() => setView(VIEW_STATS)}>Balance</button>
        <button className="btn btn-ghost" onClick={onExport} title="Export this character as a printable sheet or JSON snapshot">⇩ Export</button>
        {editorMode && (
          <button className={'btn btn-ghost' + (folderName ? ' active' : '')}
            onClick={onConnectFolder}
            title={folderName ? `Connected: ${folderName} — click to reconnect` : 'Connect your project folder so Done Editing writes to disk'}>
            {folderName ? `◉ ${folderName}` : '⊞ Connect Folder'}
          </button>
        )}
        {editorMode && (
          <button className="btn btn-ghost" onClick={onPromote} title="Promote pending edits in this browser into the source data files">⇧ Promote</button>
        )}
      </div>
    </div>);

}

function AtlasHub({ atlases, onPickAtlas, onPickTree, character }) {
  return (
    <div className="atlas-hub fade-in">
      {ATLAS_META.map((m) => {
        const atlas = atlases[m.id];
        const treeCount = atlas.trees.length;
        const talentCount = atlas.trees.reduce((s, t) => s + t.talents.length, 0);
        const learned = atlas.trees.reduce((s, t) => s + t.talents.filter((x) => character.learnedTids.has(x.tid)).length, 0);
        return (
          <div key={m.id} className="parchment atlas-card" data-color={m.color} onClick={() => onPickAtlas(m.id)}>
            <div className="atlas-card-head">
              <h2 className="rubric">{m.name}</h2>
              <div className="small-caps atlas-sub">{m.subtitle}</div>
            </div>
            <div className="atlas-blurb">{m.blurb}</div>
            <div className="count">
              · {treeCount} trees · {talentCount} talents
              {learned > 0 && <span className="learned-tag"> · {learned} learned</span>} ·
            </div>
          </div>);

      })}
    </div>);

}

function ColorPips({ colors }) {
  return (
    <div className="color-pips" aria-hidden="true">
      {colors.map((c, i) => <span key={i} className={'color-pip pip-' + c} />)}
    </div>);

}

function parseColorList(str, fallback) {
  if (!str) return fallback ? [fallback] : [];
  const out = str.split(/[\/,]/).map((c) => c.trim().toLowerCase()).
  filter((c) => ['white', 'blue', 'black', 'red', 'green'].includes(c));
  return out.length ? out : fallback ? [fallback] : [];
}

function GroupGrid({ atlas, onPickTree, character }) {
  return (
    <div className={'group-grid ' + (atlas.id === 'leyline' ? 'leyline-grid' : '')}>
      {atlas.trees.map((tr) => {
        const learned = tr.talents.filter((t) => character.learnedTids.has(t.tid)).length;
        const pipColors = parseColorList(tr.colorsStr, tr.color);
        return (
          <button key={tr.id}
          type="button"
          className={'parchment group-card group-card-big color-card-themed pips-' + pipColors.length}
          data-color={tr.color}
          data-color-2={pipColors[1] || ''}
          onClick={() => onPickTree(tr.id)}>
            <div className="group-card-banner" aria-hidden="true" />
            <div className="group-card-head">
              <ColorPips colors={pipColors} />
              <div style={{ minWidth: 0 }}>
                <h3 className="rubric">{tr.fullName || tr.name}</h3>
                {tr.colorsStr && <div className="small-caps group-colors-label">{tr.colorsStr}</div>}
                {tr.domain && !tr.colorsStr && <div className="small-caps group-colors-label">{tr.domain}</div>}
              </div>
            </div>
            <div className="group-card-foot">
              <span className="tree-names">
                {tr.columns.map((c) => c.label).join(' · ')}
              </span>
              <span className="mono group-count">
                {tr.talents.length} talents
                {learned > 0 && <span className="learned-tag"> · {learned} learned</span>}
              </span>
            </div>
          </button>);

      })}
    </div>);

}

function loadTalentEdits(treeId) {
  try {return JSON.parse(localStorage.getItem(`skilltrees:talents:${treeId}`) || '{}');}
  catch {return {};}
}
function saveTalentEdits(treeId, obj) {
  if (!obj || Object.keys(obj).length === 0) localStorage.removeItem(`skilltrees:talents:${treeId}`);else
  localStorage.setItem(`skilltrees:talents:${treeId}`, JSON.stringify(obj));
}

function TreePage({ tree: rawTree, atlasTrees, onPickTree, onBack, character, talentIndex, atlases, editorMode, onAutoSave }) {
  const [selected, setSelected] = useS(null);
  const [editMode, setEditMode] = useS(false);
  const [buildMode, setBuildMode] = useS(true); // visualize learned/canLearn by default
  const [talentEdits, setTalentEdits] = useS(() => loadTalentEdits(rawTree.id));
  const resetRef = useR(null);
  const resetConnRef = useR(null);
  const exportRef = useR(null);

  useE(() => {setTalentEdits(loadTalentEdits(rawTree.id));setSelected(null);}, [rawTree.id]);

  const tree = useM(() => {
    const merged = rawTree.talents.map((t) => {
      const e = talentEdits[t.name];
      return e ? { ...t, ...e } : t;
    });
    return { ...rawTree, talents: merged };
  }, [rawTree, talentEdits]);

  function editTalent(origName, patch) {
    setTalentEdits((prev) => {
      const next = { ...prev, [origName]: { ...(prev[origName] || {}), ...patch } };
      saveTalentEdits(rawTree.id, next);
      return next;
    });
  }
  function resetTalentEdits() {
    setTalentEdits({});
    saveTalentEdits(rawTree.id, {});
  }

  // Pre-evaluate prereqs for every talent in this tree
  const ctx = useM(() => ({
    talentByName: talentIndex.byName,
    deitySkills: [character.paths.deitySkill].filter(Boolean)
  }), [talentIndex, character.paths.deitySkill]);

  const prereqResults = useM(() => {
    const out = {};
    for (const t of tree.talents) {
      out[t.tid] = window.Prereq.evalPrereqs(t.prereqs || '', character, ctx);
    }
    return out;
  }, [tree, character, ctx]);

  // Build edge prereq lookup so the panel can show in-tree edge prereqs
  const layoutData = useM(() => window.Layout.layoutTree(tree.talents, tree), [tree]);
  const edgePrereqsByTid = useM(() => {
    const m = {};
    tree.talents.forEach((t, i) => {
      m[t.tid] = layoutData.prereqs[i].map((p) => tree.talents[p]);
    });
    return m;
  }, [tree, layoutData]);

  const sel = selected != null ? tree.talents[selected] : null;
  const origName = selected != null ? rawTree.talents[selected].name : null;

  function toggleLearn(tid) {
    window.Character.toggleTalent(tid);
  }
  function addNarrativeFlag(text) {
    window.Character.addNarrativeFlag(text);
  }

  // Atlas-level siblings (other trees in the same atlas)
  const siblings = atlasTrees;

  return (
    <div data-color={tree.color} className="fade-in tree-page">
      <div className="parchment tree-toolbar">
        <div className="tree-toolbar-left">
          <button className="btn btn-ghost" onClick={onBack}>← Atlases</button>
          <div className="tree-title-block">
            <div className="small-caps tree-title-meta">{tree.atlas} · {tree.groupLabel}</div>
            <h2 className="rubric tree-title-name">{tree.fullName || tree.name}</h2>
          </div>
        </div>
        {siblings && siblings.length > 1 &&
        <div className="sibling-tabs" role="tablist">
            {siblings.map((s) =>
          <button key={s.id}
          role="tab"
          aria-selected={s.id === tree.id}
          className={'sibling-tab' + (s.id === tree.id ? ' active' : '')}
          onClick={() => s.id !== tree.id && onPickTree(s.id)}>
                {s.name}
              </button>
          )}
          </div>
        }
        <div className="tree-toolbar-right">
          <button className={'btn' + (buildMode ? ' active' : '')} onClick={() => setBuildMode((v) => !v)}
          title="Highlight learned / can-learn states">
            {buildMode ? '✓ Build View' : 'Build View'}
          </button>
          {editorMode && (
          <button className={'btn' + (editMode ? ' active' : '')} onClick={() => {
            if (editMode) {
              // Leaving edit mode — trigger auto-save.
              setEditMode(false);
              if (onAutoSave) onAutoSave();
            } else {
              setEditMode(true);
            }
          }}>
            {editMode ? '✓ Done Editing' : '✎ Edit Layout'}
          </button>
          )}
          {editMode &&
          <>
              <button className="btn btn-ghost" onClick={() => resetRef.current && resetRef.current()}>Reset Layout</button>
              <button className="btn btn-ghost" onClick={() => resetConnRef.current && resetConnRef.current()}>Reset Connections</button>
              <button className="btn btn-ghost" onClick={resetTalentEdits}>Reset Talents</button>
              <button className="btn" onClick={() => {
              const data = exportRef.current && exportRef.current();
              if (!data) return;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;a.download = `${tree.id.replace(/\//g, '_')}.json`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 500);
            }}>⇩ Export JSON</button>
            </>
          }
        </div>
      </div>

      <div className="body-layout">
        <div className="tree-panel parchment" style={{ height: "824px" }}>
          <div className="tree-header">
            <div className="small-caps tree-stat-meta">
              {tree.talents.length} nodes · {tree.columns.length} columns
            </div>
          </div>
          <window.TreeView
            tree={tree}
            selected={selected}
            onSelect={setSelected}
            character={character}
            prereqResults={prereqResults}
            editMode={editMode}
            buildMode={buildMode}
            onResetLayout={resetRef}
            onResetConnections={resetConnRef}
            onExport={exportRef} />
          
        </div>
        <aside className="detail-panel parchment">
          <window.TalentDetail
            talent={sel}
            origName={origName}
            character={character}
            edgePrereqs={sel ? edgePrereqsByTid[sel.tid] : null}
            prereqResult={sel ? prereqResults[sel.tid] : null}
            onToggleLearn={toggleLearn}
            onAddNarrativeFlag={addNarrativeFlag}
            onClose={() => setSelected(null)}
            editMode={editMode && editorMode}
            onEdit={(patch) => editTalent(origName, patch)}
            hasEdits={origName != null && !!talentEdits[origName]}
            onResetTalent={() => {
              setTalentEdits((prev) => {
                const next = { ...prev };
                delete next[origName];
                saveTalentEdits(rawTree.id, next);
                return next;
              });
            }} />
          
        </aside>
      </div>
    </div>);

}

function SearchView({ atlases, onJumpTree, character, talentIndex }) {
  const [q, setQ] = useS('');
  const ctx = useM(() => ({
    talentByName: talentIndex.byName,
    deitySkills: [character.paths.deitySkill].filter(Boolean)
  }), [talentIndex, character.paths.deitySkill]);

  const results = useM(() => {
    const all = [];
    for (const aid of Object.keys(atlases)) {
      for (const tree of atlases[aid].trees) {
        for (const t of tree.talents) all.push({ ...t, _treeId: tree.id });
      }
    }
    if (!q.trim()) return all.slice(0, 80);
    const needle = q.toLowerCase();
    return all.filter((t) =>
    t.name.toLowerCase().includes(needle) ||
    (t.description || '').toLowerCase().includes(needle) ||
    (t.tags || '').toLowerCase().includes(needle) ||
    (t.group || '').toLowerCase().includes(needle)
    ).slice(0, 200);
  }, [atlases, q]);

  return (
    <div className="search-view fade-in">
      <window.FilterBar search={q} setSearch={setQ} />
      <div className="search-list">
        {results.map((t) => {
          const learned = character.learnedTids.has(t.tid);
          const pres = window.Prereq.evalPrereqs(t.prereqs || '', character, ctx);
          return (
            <div key={t.tid} className={'parchment search-row' + (learned ? ' learned' : '')} data-color={t.color}>
              <div className="search-row-head">
                <h4 className="rubric">{t.name}</h4>
                <span className="small-caps muted">{t.atlas} · {t.group} · {t.specialty || ''}</span>
              </div>
              <div className="search-row-body">
                <span className="pill">{t.action}</span>
                {t.cost && t.cost !== '—' && <span className="pill cost">{t.cost}</span>}
                {t.isKey && <span className="pill key-pill">Key</span>}
                {!pres.ok && <span className="pill warn-pill">prereqs unmet</span>}
                {learned && <span className="pill learn-pill">✓ learned</span>}
                <button className="btn btn-ghost btn-tiny" onClick={() => onJumpTree(t._treeId)}>open tree →</button>
              </div>
              {t.description && <p className="search-desc">{t.description}</p>}
            </div>);

        })}
        {results.length === 0 && <div className="muted" style={{ padding: 24 }}>No talents match.</div>}
      </div>
    </div>);

}

function BalanceView({ atlases }) {
  const all = useM(() => {
    const out = [];
    for (const aid of Object.keys(atlases)) {
      for (const tree of atlases[aid].trees) {
        for (const t of tree.talents) out.push(t);
      }
    }
    return out;
  }, [atlases]);

  const byAtlas = useM(() => {
    const m = {};
    for (const aid of Object.keys(atlases)) m[aid] = atlases[aid].trees.flatMap((t) => t.talents);
    return m;
  }, [atlases]);

  function summary(arr) {
    const total = arr.length || 1;
    const byAction = {};
    let free = 0,totalWords = 0;
    for (const t of arr) {
      byAction[t.action || 'Unknown'] = (byAction[t.action || 'Unknown'] || 0) + 1;
      const cost = (t.cost || '').toLowerCase();
      if (!cost || cost === '—' || cost === '-' || cost.includes('free')) free++;
      totalWords += (t.description || '').split(/\s+/).length;
    }
    return { total: arr.length, byAction, free: Math.round(100 * free / total), avgWords: Math.round(totalWords / total) };
  }
  const overall = summary(all);

  return (
    <div className="balance-view fade-in">
      <section className="parchment">
        <h3 className="rubric">All atlases ({all.length} talents)</h3>
        <div className="stats-row">
          <div className="stat"><div className="num">{overall.total}</div><div className="lbl">Total nodes</div></div>
          <div className="stat"><div className="num">{overall.free}%</div><div className="lbl">Free</div></div>
          <div className="stat"><div className="num">{overall.avgWords}</div><div className="lbl">Avg words/desc</div></div>
        </div>
      </section>
      {Object.keys(byAtlas).map((aid) => {
        const s = summary(byAtlas[aid]);
        return (
          <section key={aid} className="parchment">
            <h3 className="rubric">{aid}</h3>
            <div className="stats-row">
              <div className="stat"><div className="num">{s.total}</div><div className="lbl">Total</div></div>
              <div className="stat"><div className="num">{s.free}%</div><div className="lbl">Free</div></div>
              <div className="stat"><div className="num">{s.avgWords}</div><div className="lbl">Avg words</div></div>
              {Object.keys(s.byAction).sort().map((a) =>
              <div key={a} className="stat">
                  <div className="num">{Math.round(100 * s.byAction[a] / (s.total || 1))}%</div>
                  <div className="lbl">{a}</div>
                </div>
              )}
            </div>
          </section>);

      })}
    </div>);

}

function App() {
  const [data, setData] = useS(null);
  const [view, setView] = useS(VIEW_HUB);
  const [atlasId, setAtlasId] = useS(null);
  const [treeId, setTreeId] = useS(null);
  const [promoteOpen, setPromoteOpen] = useS(false);
  const [exportOpen, setExportOpen] = useS(false);
  const [folderName, setFolderName] = useS(null);
  const [toast, setToast] = useS(null); // { kind: 'ok'|'err'|'info', msg, sub? }
  const character = useCharacterApp();

  // Detect connected folder on mount (editor mode only).
  useE(() => {
    if (!EDITOR_MODE || !window.Persist) return;
    window.Persist.getFolderName().then(n => n && setFolderName(n));
  }, []);

  function showToast(t, ms = 5000) {
    setToast(t);
    if (ms) setTimeout(() => setToast(c => (c === t ? null : c)), ms);
  }

  async function connectFolder() {
    if (!window.Persist || !window.Persist.isSupported()) {
      showToast({ kind: 'err', msg: 'Folder save unsupported',
        sub: 'Use Chrome, Brave, or Edge. (Done Editing will fall back to download.)' }, 7000);
      return;
    }
    try {
      const name = await window.Persist.connectFolder();
      setFolderName(name);
      showToast({ kind: 'ok', msg: `Connected: ${name}`,
        sub: 'Done Editing will now write data/*.json straight to disk.' }, 5000);
    } catch (e) {
      // User-cancel is fine; only surface real errors.
      if (e && e.name !== 'AbortError') {
        showToast({ kind: 'err', msg: 'Connect failed', sub: e.message || String(e) }, 6000);
      }
    }
  }

  // Auto-save: merge localStorage edits into data/*.json on disk.
  async function autoSave() {
    if (!EDITOR_MODE) return;
    if (!window.Promote || !window.Persist) return;
    if (!window.Promote.hasPendingEdits()) {
      showToast({ kind: 'info', msg: 'No edits to save.' }, 2500);
      return;
    }
    showToast({ kind: 'info', msg: 'Saving…' }, 0);
    try {
      const { merged, report } = await window.Promote.mergeFromLocalStorage(atlases);
      // Try disk first.
      let result = await window.Persist.saveAtlasJSON(merged);
      if (result.ok) {
        const migrated = window.Promote.clearAllPatchesAndMigrate(report);
        // Reload data so the in-memory atlas reflects what's on disk.
        await reloadData();
        showToast({
          kind: 'ok',
          msg: `Saved ${result.files.length} file${result.files.length === 1 ? '' : 's'} to disk.`,
          sub: 'Run: git add data && git commit -m "atlas edits" && git push  — (click to copy)',
          copy: 'git add data && git commit -m "atlas edits" && git push',
        }, 12000);
        if (migrated) console.log(`Migrated ${migrated} character allocation(s).`);
        return;
      }
      // Fallbacks based on reason.
      if (result.reason === 'no-handle' || result.reason === 'unsupported') {
        // Auto-download all three so you don't lose work.
        downloadJSONFile('leyline.json', merged.leyline);
        downloadJSONFile('cosmere.json', merged.cosmere);
        downloadJSONFile('domain.json',  merged.domain);
        showToast({
          kind: 'info',
          msg: 'Downloaded 3 files (no folder connected).',
          sub: result.reason === 'unsupported'
            ? 'Browser can\'t write directly. Drop the files into data/ and commit.'
            : 'Click ⊞ Connect Folder once, then Done Editing will save in place.',
        }, 9000);
        return;
      }
      showToast({ kind: 'err', msg: 'Save failed', sub: result.error }, 8000);
    } catch (e) {
      showToast({ kind: 'err', msg: 'Save failed', sub: e.message || String(e) }, 8000);
    }
  }

  // Re-fetch source JSON after a save so the UI shows the new canonical state.
  async function reloadData() {
    const [leyline, cosmere, domain] = await Promise.all([
      fetch('data/leyline.json?ts=' + Date.now()).then(r => r.json()),
      fetch('data/cosmere.json?ts=' + Date.now()).then(r => r.json()),
      fetch('data/domain.json?ts=' + Date.now()).then(r => r.json()),
    ]);
    const atlases = window.Atlases.buildAtlases({ leyline, cosmere, domain });
    const talentIndex = window.Prereq.buildTalentIndex(atlases);
    setData({ atlases, talentIndex });
  }

  useE(() => {
    Promise.all([
    fetch('data/leyline.json').then((r) => r.json()),
    fetch('data/cosmere.json').then((r) => r.json()),
    fetch('data/domain.json').then((r) => r.json())]
    ).then(([leyline, cosmere, domain]) => {
      const atlases = window.Atlases.buildAtlases({ leyline, cosmere, domain });
      const talentIndex = window.Prereq.buildTalentIndex(atlases);
      setData({ atlases, talentIndex });
    });
  }, []);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'serif', color: 'var(--ink-2)' }}>
        Unfurling the atlases…
      </div>);

  }

  const { atlases, talentIndex } = data;

  const tree = treeId ? Object.values(atlases).flatMap((a) => a.trees).find((t) => t.id === treeId) : null;
  const currentAtlas = atlasId ? atlases[atlasId] : null;

  function pickAtlas(aid) {
    setAtlasId(aid);
    setView(VIEW_ATLAS);
  }
  function pickTree(tid) {
    const found = Object.values(atlases).flatMap((a) => a.trees).find((t) => t.id === tid);
    if (!found) return;
    setAtlasId(found.atlas);
    setTreeId(tid);
    setView(VIEW_TREE);
  }

  let content = null;
  if (view === VIEW_HUB) {
    content = <AtlasHub atlases={atlases} onPickAtlas={pickAtlas} onPickTree={pickTree} character={character} />;
  } else if (view === VIEW_ATLAS && currentAtlas) {
    content =
    <div className="fade-in">
        <div className="parchment atlas-page-head">
          <button className="btn btn-ghost" onClick={() => setView(VIEW_HUB)}>← Atlases</button>
          <div>
            <div className="small-caps muted">{currentAtlas.subtitle}</div>
            <h2 className="rubric">{currentAtlas.name}</h2>
          </div>
        </div>
        <GroupGrid atlas={currentAtlas} onPickTree={pickTree} character={character} />
      </div>;

  } else if (view === VIEW_TREE && tree) {
    content = <TreePage
      tree={tree}
      atlasTrees={atlases[tree.atlas].trees}
      onPickTree={pickTree}
      onBack={() => setView(VIEW_HUB)}
      character={character}
      talentIndex={talentIndex}
      atlases={atlases}
      editorMode={EDITOR_MODE}
      onAutoSave={autoSave} />;
  } else if (view === VIEW_BUILDER) {
    content = <window.BuilderPage atlases={atlases} talentIndex={talentIndex} onOpenTree={pickTree} />;
  } else if (view === VIEW_SEARCH) {
    content = <SearchView atlases={atlases} onJumpTree={pickTree} character={character} talentIndex={talentIndex} />;
  } else if (view === VIEW_STATS) {
    content = <BalanceView atlases={atlases} />;
  } else {
    content = <AtlasHub atlases={atlases} onPickAtlas={pickAtlas} onPickTree={pickTree} character={character} />;
  }

  return (
    <div className="app-shell">
      <Masthead view={view} setView={setView} character={character}
        onPromote={() => setPromoteOpen(true)}
        onExport={() => setExportOpen(true)}
        editorMode={EDITOR_MODE}
        folderName={folderName}
        onConnectFolder={connectFolder} />
      <div className="content">
        {content}
      </div>
      <footer className="footer">
        Skilltrees · The Atlas — Cosmere RPG · Leyline · Heroic · Deity. Layout, edits, and character data persist in this browser.
      </footer>
      {promoteOpen && EDITOR_MODE && <window.PromotePanel atlases={atlases} onClose={() => setPromoteOpen(false)} />}
      {exportOpen && <window.ExportPanel atlases={atlases} onClose={() => setExportOpen(false)} />}
      {toast && <Toast t={toast} onClose={() => setToast(null)} />}
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);