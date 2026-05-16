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
  try {return new URLSearchParams(window.location.search).get('edit') === '1';}
  catch {return false;}
})();

// ---- Hash routing ----
// URL shapes:
//   #/                       hub
//   #/atlas/leyline          atlas page
//   #/tree/leyline/Black     tree page (treeId = "leyline/Black")
//   #/builder | #/search | #/balance
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'atlas' && parts[1]) return { view: VIEW_ATLAS, atlasId: parts[1], treeId: null };
  if (parts[0] === 'tree'  && parts[1] && parts[2])
    return { view: VIEW_TREE, atlasId: parts[1], treeId: `${parts[1]}/${parts.slice(2).join('/')}` };
  if (parts[0] === 'builder') return { view: VIEW_BUILDER, atlasId: null, treeId: null };
  if (parts[0] === 'search')  return { view: VIEW_SEARCH,  atlasId: null, treeId: null };
  if (parts[0] === 'balance') return { view: VIEW_STATS,   atlasId: null, treeId: null };
  if (parts[0] === 'hub')     return { view: VIEW_HUB, atlasId: null, treeId: null };
  return { view: VIEW_BUILDER, atlasId: null, treeId: null };
}
function buildHash({ view, atlasId, treeId }) {
  if (view === VIEW_ATLAS && atlasId) return `#/atlas/${atlasId}`;
  if (view === VIEW_TREE  && treeId)  return `#/tree/${treeId}`;
  if (view === VIEW_BUILDER) return '#/builder';
  if (view === VIEW_SEARCH)  return '#/search';
  if (view === VIEW_STATS)   return '#/balance';
  if (view === VIEW_HUB)     return '#/hub';
  return '#/builder';
}

const ATLAS_META = [
{ id: 'leyline', name: 'Leyline', subtitle: 'Mortal arcana · 5 colors', blurb: 'Learned magic drawn from the ley — color-identity resource play.', color: 'white' },
{ id: 'heroic', name: 'Heroic', subtitle: 'Mundane mastery · 6 paths', blurb: 'Skilled practitioners. Agent, Envoy, Hunter, Leader, Scholar, Warrior.', color: 'red' },
{ id: 'deity', name: 'Deity', subtitle: 'Divine dominion · 10 deities', blurb: 'Champions of gods. Domain magic with narrative progression.', color: 'green' }];


function GithubConfigModal({ open, onClose, onSaved }) {
  const cfg = window.GithubPush ? window.GithubPush.getConfig() : { owner: '', repo: '', branch: 'main', hasPat: false };
  const [owner, setOwner] = useS(cfg.owner);
  const [repo, setRepo] = useS(cfg.repo);
  const [branch, setBranch] = useS(cfg.branch);
  const [pat, setPat] = useS('');
  const [busy, setBusy] = useS(false);
  const [status, setStatus] = useS(null);

  if (!open) return null;

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      window.GithubPush.setConfig({ owner: owner.trim(), repo: repo.trim(), branch: branch.trim(), pat: pat.trim() || undefined });
      if (pat.trim() || window.GithubPush.isConfigured()) {
        const v = await window.GithubPush.verifyAccess();
        setStatus({ kind: 'ok', msg: `Verified: ${v.repo} (default: ${v.defaultBranch}, pushing to: ${v.configBranch}).` });
      } else {
        setStatus({ kind: 'ok', msg: 'Saved.' });
      }
      if (onSaved) onSaved();
    } catch (e) {
      setStatus({ kind: 'err', msg: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }
  function disconnect() {
    window.GithubPush.clearConfig();
    setPat('');
    setStatus({ kind: 'ok', msg: 'Disconnected. Saves will fall back to the manual git command.' });
    if (onSaved) onSaved();
  }

  return (
    <div className="promote-overlay" onClick={onClose}>
      <div className="parchment promote-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="promote-head">
          <div>
            <div className="small-caps muted">Editor</div>
            <h2 className="rubric">Connect GitHub</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} title="Close">✕</button>
        </div>
        <p className="promote-blurb muted">
          Once a Personal Access Token is set, ✓ Done Editing will commit
          and push <code>data/*.json</code> to <code>{owner}/{repo}@{branch}</code> automatically.
          The PAT is stored in this browser's localStorage; only set it on a machine you trust.
        </p>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
          <label className="small-caps muted" style={{ gridColumn: '1 / span 1' }}>Owner
            <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="cadburyatoms"
              style={{ width: '100%', marginTop: 4, padding: 6 }} />
          </label>
          <label className="small-caps muted" style={{ gridColumn: '2 / span 1' }}>Repo
            <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="Skilltrees"
              style={{ width: '100%', marginTop: 4, padding: 6 }} />
          </label>
          <label className="small-caps muted" style={{ gridColumn: '1 / span 1' }}>Branch
            <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="main"
              style={{ width: '100%', marginTop: 4, padding: 6 }} />
          </label>
          <label className="small-caps muted" style={{ gridColumn: '1 / span 2' }}>Personal Access Token
            <input type="password" value={pat} onChange={e => setPat(e.target.value)}
              placeholder={cfg.hasPat ? '(token already saved — leave blank to keep)' : 'ghp_…'}
              style={{ width: '100%', marginTop: 4, padding: 6, fontFamily: 'JetBrains Mono, monospace' }} />
          </label>
        </div>
        <p className="muted small-caps" style={{ fontSize: 11, marginTop: 8 }}>
          Create a fine-grained PAT at github.com/settings/personal-access-tokens with Contents: Read and write on this repo.
        </p>
        {status && (
          <div className={'promote-status ' + (status.kind === 'err' ? 'err' : 'ok')} style={{ marginTop: 10 }}>{status.msg}</div>
        )}
        <section className="promote-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 12 }}>
          <button className="btn btn-ghost" disabled={busy || !cfg.hasPat} onClick={disconnect}>Disconnect</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="btn" onClick={save} disabled={busy}>{busy ? 'Verifying…' : 'Save & verify'}</button>
          </div>
        </section>
      </div>
    </div>);

}


function Toast({ t, onClose }) {
  const cls = 'toast toast-' + (t.kind || 'info');
  function clickBody() {
    if (t.copy) {
      try {navigator.clipboard.writeText(t.copy);} catch {}
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
      cursor: t.copy ? 'pointer' : 'default'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{t.msg}</div>
          {t.sub && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{t.sub}</div>}
        </div>
        <button onClick={(e) => {e.stopPropagation();onClose();}}
        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, opacity: 0.6, lineHeight: 1 }}
        title="Dismiss">✕</button>
      </div>
    </div>);

}

function downloadJSONFile(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;a.download = name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

function useCharacterApp() {
  const [c, setC] = useS(window.Character.get());
  useE(() => window.Character.subscribe(setC), []);
  return c;
}

function AtlasesNav({ view, atlases, onPickAtlas, onPickTree, onGoHub }) {
  return (
    <div className="nav-menu">
      <button
        className={'btn nav-trigger' + (view === VIEW_HUB ? ' active' : '')}
        onClick={onGoHub}
      >
        Atlases <span className="nav-trigger-caret">▾</span>
      </button>
      <div className="nav-dropdown">
        {ATLAS_META.map((m) => {
          const atlas = atlases && atlases[m.id];
          const trees = atlas ? atlas.trees : [];
          return (
            <div key={m.id} className="nav-item">
              <button className="nav-item-btn" onClick={() => onPickAtlas(m.id)}>
                <span>{m.name}</span>
                <span className="nav-caret">▸</span>
              </button>
              <div className="nav-submenu">
                {trees.map((t) => (
                  <button key={t.id} className="nav-submenu-btn" onClick={() => onPickTree(t.id)}>
                    {m.id === 'deity' ? (t.domain || t.name) : t.name}
                  </button>
                ))}
              </div>
            </div>);
        })}
      </div>
    </div>);
}

function Masthead({ view, setView, character, atlases, onPickAtlas, onPickTree, onExport, editorMode, folderName, onConnectFolder, ghReady, onConfigureGithub }) {
  const charLabel = character.name ? `${character.name} · L${character.level}` : `Untitled · L${character.level}`;
  return (
    <div className="masthead parchment">
      <div className="title-block">
        <h1>S<span className="rubric"></span>killtrees <span className="masthead-sub">· THE ATLAS</span></h1>
        <div className="subtitle">Three atlases — Leyline · Heroic · Deity. One book, one character.</div>
      </div>
      <div className="masthead-actions">
        <div className="char-chip">
          <span className="small-caps">Active</span>
          <span className="rubric">{charLabel}</span>
        </div>
        <AtlasesNav
          view={view}
          atlases={atlases}
          onPickAtlas={onPickAtlas}
          onPickTree={onPickTree}
          onGoHub={() => setView(VIEW_HUB)} />
        <button className={'btn' + (view === VIEW_BUILDER ? ' active' : '')} onClick={() => setView(VIEW_BUILDER)}>Builder</button>
        <button className={'btn' + (view === VIEW_SEARCH ? ' active' : '')} onClick={() => setView(VIEW_SEARCH)}>Search</button>
        <button className="btn btn-ghost" onClick={onExport} title="Export this character as a printable sheet or JSON snapshot">⇩ Export</button>
        {editorMode &&
        <button className={'btn btn-ghost' + (folderName ? ' active' : '')}
        onClick={onConnectFolder}
        title={folderName ? `Connected: ${folderName} — click to reconnect` : 'Connect your project folder so Done Editing writes to disk'}>
            {folderName ? `◉ ${folderName}` : '⊞ Connect Folder'}
          </button>
        }
        {editorMode &&
        <button className={'btn btn-ghost' + (ghReady ? ' active' : '')}
        onClick={onConfigureGithub}
        title={ghReady ? 'GitHub push configured — click to update' : 'Connect GitHub to push commits automatically on save'}>
            {ghReady ? '⌘ GitHub ✓' : '⌘ GitHub'}
          </button>
        }
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
  if (Array.isArray(str)) {
    const out = str.map((c) => String(c).trim().toLowerCase()).
    filter((c) => ['white', 'blue', 'black', 'red', 'green'].includes(c));
    return out.length ? out : fallback ? [fallback] : [];
  }
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
        const pipColors = parseColorList(tr.colors || tr.colorsStr, tr.color);
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
function loadTreeConnections(treeId) {
  try {
    const raw = localStorage.getItem(`skilltrees:conns:${treeId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {return null;}
}
function saveTreeConnections(treeId, arr) {
  if (arr == null) localStorage.removeItem(`skilltrees:conns:${treeId}`);else
  localStorage.setItem(`skilltrees:conns:${treeId}`, JSON.stringify(arr));
}
function pruneConnectionsForDeletedTalent(treeId, deletedIdx, talentCount, fallbackConns) {
  const conns = loadTreeConnections(treeId) || fallbackConns;
  if (!Array.isArray(conns) || deletedIdx < 0) return;
  const remapped = [];
  for (const edge of conns) {
    if (!Array.isArray(edge) || edge.length < 2) continue;
    const [s, t] = edge;
    if (s === deletedIdx || t === deletedIdx) continue;
    if (s < 0 || t < 0 || s >= talentCount || t >= talentCount) continue;
    remapped.push([
      s > deletedIdx ? s - 1 : s,
      t > deletedIdx ? t - 1 : t
    ]);
  }
  saveTreeConnections(treeId, remapped);
}

function TreePage({ tree: rawTree, atlasTrees, onPickTree, onBack, character, talentIndex, atlases, editorMode, onAutoSave, savedAt }) {
  const [selected, setSelected] = useS(null);
  const [editMode, setEditMode] = useS(false);
  const [buildMode, setBuildMode] = useS(true); // visualize learned/canLearn by default
  const [talentEdits, setTalentEdits] = useS(() => loadTalentEdits(rawTree.id));
  const resetRef = useR(null);
  const resetConnRef = useR(null);
  const exportRef = useR(null);

  // Re-read localStorage when the tree changes OR after a successful auto-save
  // (autoSave clears the localStorage patches via clearAllPatchesAndMigrate;
  // without this useE the React state retains the cleared edits and the next
  // save re-applies — or re-appends — them on top of the now-baked source).
  useE(() => {
    setTalentEdits(loadTalentEdits(rawTree.id));
    const savedTid = sessionStorage.getItem('skilltrees:lastNode:' + rawTree.id);
    if (savedTid) {
      const idx = rawTree.talents.findIndex(t => t.tid === savedTid);
      setSelected(idx >= 0 ? idx : null);
    } else {
      setSelected(null);
    }
  }, [rawTree.id, savedAt]);

  const treeRef = useR(rawTree);
  const handleSelect = useC((idx) => {
    setSelected(idx);
    if (idx == null) {
      sessionStorage.removeItem('skilltrees:lastNode:' + rawTree.id);
    } else {
      const t = (treeRef.current && treeRef.current.talents) ? treeRef.current.talents[idx] : null;
      if (t && t.tid) sessionStorage.setItem('skilltrees:lastNode:' + rawTree.id, t.tid);
    }
  }, [rawTree.id]);

  const tree = useM(() => {
    const merged = rawTree.talents
      .map((t) => {
        const e = talentEdits[t.name];
        return e ? { ...t, __origName: t.name, ...e } : { ...t, __origName: t.name };
      })
      .filter(t => !t.__deleted);
    // Append any brand-new talents added via the Add Talent button.
    // They live in talentEdits under keys starting with "__new__".
    for (const [key, val] of Object.entries(talentEdits)) {
      if (!key.startsWith('__new__')) continue;
      if (val.__deleted) continue;
      const firstCol = (rawTree.columns || []).find(c => c.id !== 'key');
      const colId = val.columnId || val.specialty || (firstCol ? firstCol.id : 'New');
      const name = val.name || 'New Talent';
      merged.push({
        tid: `${rawTree.atlas}/${rawTree.group}/${key}`.toLowerCase().replace(/\s+/g, '_'),
        name,
        action: val.action || 'Passive',
        cost: val.cost || '—',
        prereqs: val.prereqs || '',
        description: val.description || '',
        flavor: val.flavor || '',
        tags: val.tags || '',
        atlas: rawTree.atlas,
        color: rawTree.color,
        group: rawTree.group,
        tree: colId,
        specialty: colId,
        columnId: colId,
        isKey: false,
        __newKey: key,
        ...val,
      });
    }
    // Rebuild columns to include any new specialties introduced via edits
    // (and drop columns whose talents have all moved away). Preserve original
    // column order; append new columns at the end in the order they first appear.
    const origCols = (rawTree.columns || []).map(c => ({ ...c, talentIdxs: [] }));
    const colsById = Object.fromEntries(origCols.map(c => [c.id, c]));
    const orderedCols = [...origCols];
    merged.forEach((t, idx) => {
      if (t.isKey) return;
      const colId = t.columnId || t.specialty;
      if (!colId || colId === 'key') return;
      if (!colsById[colId]) {
        const newCol = { id: colId, label: colId, talentIdxs: [] };
        colsById[colId] = newCol;
        orderedCols.push(newCol);
      }
      colsById[colId].talentIdxs.push(idx);
    });
    // Drop empty columns that exist only because the original data had them
    // but every talent has been moved away.
    const finalCols = orderedCols.filter(c => c.talentIdxs.length > 0);
    return { ...rawTree, talents: merged, columns: finalCols };
  }, [rawTree, talentEdits]);

  treeRef.current = tree;

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
  function deleteTalent(origName) {
    if (!origName) return;
    const deletedIdx = tree.talents.findIndex(t => t.__newKey === origName || t.__origName === origName || t.name === origName);
    const fallbackConns = window.Layout.layoutTree(tree.talents, tree).edges;
    pruneConnectionsForDeletedTalent(rawTree.id, deletedIdx, tree.talents.length, fallbackConns);
    setTalentEdits((prev) => {
      let next;
      if (origName.startsWith('__new__')) {
        next = { ...prev };
        delete next[origName];
      } else {
        next = { ...prev, [origName]: { ...(prev[origName] || {}), __deleted: true } };
      }
      saveTalentEdits(rawTree.id, next);
      return next;
    });
    setSelected(null);
  }
  function addNewTalent() {
    const key = '__new__' + Date.now();
    const firstCol = (rawTree.columns || []).find(c => c.id !== 'key');
    const colId = firstCol ? firstCol.id : 'New';
    setTalentEdits((prev) => {
      const next = {
        ...prev,
        [key]: {
          name: 'New Talent',
          action: 'Passive',
          cost: '—',
          prereqs: '',
          description: '',
          flavor: '',
          tags: '',
          specialty: colId,
          columnId: colId,
        },
      };
      saveTalentEdits(rawTree.id, next);
      return next;
    });
  }

  // Pre-evaluate prereqs for every talent in this tree
  const ctx = useM(() => ({
    talentByName: talentIndex.byName,
    deitySkills: [character.paths.deitySkill].filter(Boolean),
    grants: window.Character.autoGrantedSkills(character, atlases)
  }), [talentIndex, character.paths.deitySkill, character.paths.leylineKeyTid, character.paths.heroicKeyTid]);

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
  // For brand-new talents, the edit key is __newKey (not the original source name).
  const origName =
    selected != null
      ? (tree.talents[selected] && tree.talents[selected].__newKey)
        || (tree.talents[selected] && tree.talents[selected].__origName)
        || (tree.talents[selected] && tree.talents[selected].name)
        || null
      : null;

  function toggleLearn(tid) {
    window.Character.toggleTalent(tid);
  }
  function addNarrativeFlag(text) {
    window.Character.addNarrativeFlag(text);
  }

  // Atlas-level siblings (other trees in the same atlas)
  const siblings = atlasTrees;

  // Cross-atlas links: deity → its leyline colors, leyline → deities sharing this color
  const crossLinks = useM(() => {
    if (tree.atlas === 'deity' && tree.colorsStr) {
      const colors = tree.colorsStr.split(/[\/,]/).map(s => s.trim()).filter(Boolean);
      return {
        label: 'Colors',
        items: colors.map(c => ({ tid: `leyline/${c}`, label: c, color: c.toLowerCase() })),
      };
    }
    if (tree.atlas === 'leyline') {
      const currentColor = tree.group;
      const deities = (atlases.deity?.trees || []).filter(dt => {
        if (!dt.colorsStr) return false;
        return dt.colorsStr.split(/[\/,]/).map(s => s.trim()).includes(currentColor);
      });
      return {
        label: 'Deities',
        items: deities.map(dt => ({
          tid: dt.id,
          label: dt.domain || dt.group,
          color: dt.color,
          colorsStr: dt.colorsStr || dt.colors,
          atlas: 'deity',
        })),
      };
    }
    return null;
  }, [tree, atlases]);

  const atlasName = atlases[tree.atlas]?.name || tree.atlas;

  return (
    <div data-color={tree.color} className="fade-in tree-page">
      <div className="parchment tree-toolbar">
        <div className="tree-toolbar-row tree-toolbar-row-top">
          <button className="btn btn-ghost" onClick={onBack}>← Atlases</button>
          <div className="tree-breadcrumb small-caps">
            <span className="crumb-parent muted">{atlasName}</span>
            <span className="crumb-sep muted">›</span>
            <span className="crumb-current">{tree.group}</span>
          </div>
          <div className="tree-toolbar-buttons">
            <button className={'btn' + (buildMode ? ' active' : '')} onClick={() => setBuildMode((v) => !v)}
              title="Highlight learned / can-learn states">
              {buildMode ? '✓ Build View' : 'Build View'}
            </button>
            {editorMode &&
              <button className={'btn' + (editMode ? ' active' : '')} onClick={() => {
                if (editMode) {
                  setEditMode(false);
                  if (onAutoSave) onAutoSave();
                } else {
                  setEditMode(true);
                }
              }}>
                {editMode ? '✓ Done Editing' : '✎ Edit Layout'}
              </button>
            }
            {editMode &&
              <>
                <button className="btn btn-ghost" onClick={() => resetRef.current && resetRef.current()}>Reset Layout</button>
                <button className="btn btn-ghost" onClick={() => resetConnRef.current && resetConnRef.current()}>Reset Connections</button>
                <button className="btn btn-ghost" onClick={resetTalentEdits}>Reset Talents</button>
                <button className="btn" onClick={addNewTalent}
                  title="Add a blank talent to this tree"
                  style={{ fontSize: '0.85rem' }}>＋ Add Talent</button>
                <button className="btn" onClick={() => {
                  const data = exportRef.current && exportRef.current();
                  if (!data) return;
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `${tree.id.replace(/\//g, '_')}.json`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 500);
                }}>⇩ Export JSON</button>
              </>
            }
          </div>
        </div>
        {(siblings && siblings.length > 1 || (crossLinks && crossLinks.items.length > 0)) &&
          <div className="tree-toolbar-row tree-toolbar-row-bottom">
            {siblings && siblings.length > 1 ?
              <div className="sibling-tabs" role="tablist">
                {siblings.map((s) => {
                  const extraProps = {};
                  if (s.atlas === 'deity' && (s.colors || s.colorsStr)) {
                    const colors = parseColorList(s.colors || s.colorsStr, s.color);
                    if (colors.length >= 2) {
                      const [c1, c2] = colors;
                      extraProps.style = {
                        background: `linear-gradient(135deg, var(--c-${c1}-1) 0%, var(--c-${c1}-2) 45%, var(--c-${c2}-2) 55%, var(--c-${c2}-1) 100%)`,
                      };
                    } else if (colors.length === 1) {
                      extraProps['data-color'] = colors[0];
                    }
                  } else if (s.color) {
                    extraProps['data-color'] = s.color;
                  }
                  return (
                    <button key={s.id}
                      role="tab"
                      aria-selected={s.id === tree.id}
                      className={'sibling-tab' + (s.id === tree.id ? ' active' : '')}
                      onClick={() => s.id !== tree.id && onPickTree(s.id)}
                      {...extraProps}>
                      {s.domain || s.name}
                    </button>
                  );
                })}
              </div>
              : <div />
            }
            {crossLinks && crossLinks.items.length > 0 &&
              <div className="tree-crosslinks">
                <span className="crosslink-label small-caps muted">{crossLinks.label}:</span>
                {crossLinks.items.map(item => {
                  const extraProps = {};
                  if (item.atlas === 'deity' && item.colorsStr) {
                    const colors = parseColorList(item.colorsStr, item.color);
                    if (colors.length >= 2) {
                      const [c1, c2] = colors;
                      extraProps.style = {
                        background: `linear-gradient(135deg, var(--c-${c1}-1) 0%, var(--c-${c1}-2) 45%, var(--c-${c2}-2) 55%, var(--c-${c2}-1) 100%)`,
                      };
                    } else if (colors.length === 1) {
                      extraProps['data-color'] = colors[0];
                    }
                  } else if (item.color) {
                    extraProps['data-color'] = item.color;
                  }
                  return (
                    <button key={item.tid} className="crosslink-chip"
                      onClick={() => onPickTree(item.tid)}
                      title={`Jump to ${item.label}`}
                      {...extraProps}>
                      <span className="crosslink-name">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            }
          </div>
        }
      </div>

      <div className="body-layout">
        <div className="tree-panel parchment" style={{ height: "824px" }}>
          <window.TreeView
            tree={tree}
            selected={selected}
            onSelect={handleSelect}
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
            onClose={() => handleSelect(null)}
            editMode={editMode && editorMode}
            onEdit={(patch) => editTalent(origName, patch)}
            hasEdits={origName != null && !!talentEdits[origName]}
            treeColumns={tree.columns}
            onResetTalent={() => {
              setTalentEdits((prev) => {
                const next = { ...prev };
                delete next[origName];
                saveTalentEdits(rawTree.id, next);
                return next;
              });
            }}
            onDeleteTalent={() => deleteTalent(origName)} />
          {buildMode &&
            <window.BuildSidebar
              character={character}
              atlases={atlases}
              talentIndex={talentIndex}
              onPickTree={onPickTree}
              currentTreeId={tree.id} />
          }
        </aside>
      </div>
    </div>);

}

function SearchView({ atlases, onJumpTree, character, talentIndex }) {
  const [q, setQ] = useS('');
  const ctx = useM(() => ({
    talentByName: talentIndex.byName,
    deitySkills: [character.paths.deitySkill].filter(Boolean),
    grants: window.Character.autoGrantedSkills(character, atlases)
  }), [talentIndex, character.paths.deitySkill, character.paths.leylineKeyTid, character.paths.heroicKeyTid]);

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
  const initialRoute = parseHash();
  const [view, setView] = useS(initialRoute.view);
  const [atlasId, setAtlasId] = useS(initialRoute.atlasId);
  const [treeId, setTreeId] = useS(initialRoute.treeId);
  const [exportOpen, setExportOpen] = useS(false);
  const [folderName, setFolderName] = useS(null);
  const [toast, setToast] = useS(null); // { kind: 'ok'|'err'|'info', msg, sub? }
  const [ghReady, setGhReady] = useS(false);
  const [ghOpen, setGhOpen] = useS(false);
  const [savedAt, setSavedAt] = useS(0); // bumped after each successful autoSave so TreePage re-reads localStorage
  const [lastTreeId, setLastTreeId] = useS(() => sessionStorage.getItem('skilltrees:lastTree') || null);
  const character = useCharacterApp();

  const prevViewRef = useR(view);
  const prevTreeIdRef = useR(treeId);
  useE(() => {
    if (prevViewRef.current === VIEW_TREE && view !== VIEW_TREE && prevTreeIdRef.current) {
      sessionStorage.setItem('skilltrees:lastTree', prevTreeIdRef.current);
      setLastTreeId(prevTreeIdRef.current);
    }
    prevViewRef.current = view;
    prevTreeIdRef.current = treeId;
  }, [view, treeId]);

  // Hash routing: keep URL and {view, atlasId, treeId} in sync both ways.
  // Compare via parseHash so empty hash and '#/' are treated as equivalent
  // (avoids pushing a redundant history entry on initial load).
  useE(() => {
    const cur = parseHash();
    if (cur.view === view && cur.atlasId === atlasId && cur.treeId === treeId) return;
    window.location.hash = buildHash({ view, atlasId, treeId });
  }, [view, atlasId, treeId]);
  useE(() => {
    function onHashChange() {
      const p = parseHash();
      setView(p.view);
      setAtlasId(p.atlasId);
      setTreeId(p.treeId);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Detect connected folder on mount (editor mode only).
  useE(() => {
    if (!EDITOR_MODE || !window.Persist) return;
    window.Persist.getFolderName().then((n) => n && setFolderName(n));
  }, []);

  // Detect GitHub configuration on mount (editor mode only).
  useE(() => {
    if (!EDITOR_MODE) return;
    if (window.GithubPush) setGhReady(window.GithubPush.isConfigured());
  }, []);

  function showToast(t, ms = 5000) {
    setToast(t);
    if (ms) setTimeout(() => setToast((c) => c === t ? null : c), ms);
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
    if (window.Promote.hasPendingEdits()) {
      console.log('[autoSave] pending edits found in localStorage');
    } else {
      console.log('[autoSave] NO pending edits in localStorage');
    }
    showToast({ kind: 'info', msg: 'Saving…' }, 0);
    try {
      const { merged, report } = await window.Promote.mergeFromLocalStorage(atlases);
      console.log('[autoSave] merge report:', report);
      console.log('[autoSave] trees with edits:', report.trees.length);
      // Try disk first.
      let result = await window.Persist.saveAtlasJSON(merged);
      if (result.ok) {
        const migrated = window.Promote.clearAllPatchesAndMigrate(report);
        // Rebuild atlases from the just-merged data in memory.
        // Don't re-fetch from the network: when this page is served from the same
        // origin as the deployed site (e.g. cadburyatoms.github.io/?edit=1), Pages
        // hasn't rebuilt yet and a fetch would return the pre-edit file, clobbering
        // the UI back to the old state until the next manual refresh.
        const nextAtlases = window.Atlases.buildAtlases(merged);
        const nextIndex   = window.Prereq.buildTalentIndex(nextAtlases);
        setData({ atlases: nextAtlases, talentIndex: nextIndex });
        // Signal TreePage to re-read localStorage now that patches are cleared.
        setSavedAt(n => n + 1);
        const canPush = window.GithubPush && window.GithubPush.isConfigured && window.GithubPush.isConfigured();
        if (canPush) {
          showToast({ kind: 'info', msg: 'Saved to disk. Pushing to GitHub…' }, 0);
          try {
            const push = await window.GithubPush.commitDataFiles(merged, 'atlas edits');
            showToast({
              kind: 'ok',
              msg: `Saved & pushed (commit ${push.sha.slice(0, 7)}).`,
              sub: 'Live site for other viewers rebuilds in ~30s.'
            }, 9000);
          } catch (e) {
            showToast({
              kind: 'err',
              msg: 'Saved to disk, but push failed.',
              sub: (e.message || String(e)) + '  ·  Click to copy fallback git command.',
              copy: 'git add data && git commit -m "atlas edits" && git push'
            }, 14000);
          }
        } else {
          showToast({
            kind: 'ok',
            msg: `Saved ${result.files.length} file${result.files.length === 1 ? '' : 's'} to disk.`,
            sub: 'Click ⌘ GitHub to enable auto-push, or run: git add data && git commit -m "atlas edits" && git push  — (click to copy)',
            copy: 'git add data && git commit -m "atlas edits" && git push'
          }, 12000);
        }
        if (migrated) console.log(`Migrated ${migrated} character allocation(s).`);
        return;
      }
      // Fallbacks based on reason.
      if (result.reason === 'no-handle' || result.reason === 'unsupported') {
        // Auto-download all three so you don't lose work.
        downloadJSONFile('leyline.json', merged.leyline);
        downloadJSONFile('cosmere.json', merged.cosmere);
        downloadJSONFile('domain.json', merged.domain);
        showToast({
          kind: 'info',
          msg: 'Downloaded 3 files (no folder connected).',
          sub: result.reason === 'unsupported' ?
          'Browser can\'t write directly. Drop the files into data/ and commit.' :
          'Click ⊞ Connect Folder once, then Done Editing will save in place.'
        }, 9000);
        return;
      }
      showToast({ kind: 'err', msg: 'Save failed', sub: result.error }, 8000);
    } catch (e) {
      showToast({ kind: 'err', msg: 'Save failed', sub: e.message || String(e) }, 8000);
    }
  }

  useE(() => {
    Promise.all([
    fetch('data/leyline.json?ts=' + Date.now()).then((r) => r.json()),
    fetch('data/cosmere.json?ts=' + Date.now()).then((r) => r.json()),
    fetch('data/domain.json?ts=' + Date.now()).then((r) => r.json())]
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
      onAutoSave={autoSave}
      savedAt={savedAt} />;
  } else if (view === VIEW_BUILDER) {
    const lastTree = lastTreeId
      ? Object.values(atlases).flatMap(a => a.trees).find(t => t.id === lastTreeId)
      : null;
    content = <window.BuilderPage
      atlases={atlases}
      talentIndex={talentIndex}
      onOpenTree={pickTree}
      lastTree={lastTree || null}
      onReturnToTree={pickTree} />;
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
      atlases={atlases}
      onPickAtlas={pickAtlas}
      onPickTree={pickTree}
      onExport={() => setExportOpen(true)}
      editorMode={EDITOR_MODE}
      folderName={folderName}
      onConnectFolder={connectFolder}
      ghReady={ghReady}
      onConfigureGithub={() => setGhOpen(true)} />
      <div className="content">
        {content}
      </div>
      <footer className="footer">
        Skilltrees · The Atlas — Cosmere RPG · Leyline · Heroic · Deity. Layout, edits, and character data persist in this browser.
      </footer>
      {exportOpen && <window.ExportPanel atlases={atlases} onClose={() => setExportOpen(false)} />}
      {ghOpen && EDITOR_MODE && (
        <GithubConfigModal
          open={ghOpen}
          onClose={() => setGhOpen(false)}
          onSaved={() => setGhReady(window.GithubPush && window.GithubPush.isConfigured())} />
      )}
      {toast && <Toast t={toast} onClose={() => setToast(null)} />}
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
