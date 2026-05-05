/* Tweaks panel — live editor for group-card lore/gameplay text.
   Reads/writes window.__TweakStore.loreOverrides; renders inside <TweaksPanel />. */

const { useState: useTS, useEffect: useTE, useMemo: useTM } = React;

function useTweakVersion() {
  const [v, setV] = useTS(window.__TweakStore.version);
  useTE(() => window.__TweakStore.subscribe(setV), []);
  return v;
}

function TweaksPanel() {
  const version = useTweakVersion();
  const active = window.__TweaksActive;
  const [atlasId, setAtlasId] = useTS('leyline');
  const [groupKey, setGroupKey] = useTS(null);
  const [loreDraft, setLoreDraft] = useTS('');
  const [playDraft, setPlayDraft] = useTS('');

  const atlases = (window.__ATLASES__ && window.__ATLASES__.atlases) || {};
  const groups = useTM(() => {
    const atl = atlases[atlasId];
    if (!atl) return [];
    const seen = {};
    for (const tr of atl.trees) {
      if (!seen[tr.group]) seen[tr.group] = { key: tr.group, label: tr.groupLabel };
    }
    return Object.values(seen);
  }, [atlasId, atlases]);

  // Load current values for this group into drafts
  useTE(() => {
    if (!groupKey) return;
    const base = (window.GroupLore[atlasId] || {})[groupKey] || {};
    const override = window.__TweakStore.getOverride(atlasId, groupKey) || {};
    setLoreDraft(override.lore != null ? override.lore : (base.lore || ''));
    setPlayDraft(override.gameplay != null ? override.gameplay : (base.gameplay || ''));
  }, [atlasId, groupKey, version]);

  // If atlas changes, pick first group
  useTE(() => {
    if (!groups.length) { setGroupKey(null); return; }
    if (!groups.find(g => g.key === groupKey)) setGroupKey(groups[0].key);
  }, [atlasId, groups]);

  if (!active) return null;

  const current = groupKey ? (window.GroupLore[atlasId] || {})[groupKey] || {} : {};
  const override = groupKey ? window.__TweakStore.getOverride(atlasId, groupKey) : null;
  const isOverridden = override && (override.lore != null || override.gameplay != null);

  function commitLore() {
    if (!groupKey) return;
    const base = (window.GroupLore[atlasId] || {})[groupKey] || {};
    if (loreDraft === (base.lore || '')) {
      // reverted to baseline — clear that field only
      const cur = window.__TweakStore.getOverride(atlasId, groupKey) || {};
      if (cur.lore != null) {
        const next = { ...cur }; delete next.lore;
        if (Object.keys(next).length === 0) window.__TweakStore.clearOverride(atlasId, groupKey);
        else window.__TweakStore.setOverride(atlasId, groupKey, next);
      }
      return;
    }
    window.__TweakStore.setOverride(atlasId, groupKey, { lore: loreDraft });
  }
  function commitPlay() {
    if (!groupKey) return;
    const base = (window.GroupLore[atlasId] || {})[groupKey] || {};
    if (playDraft === (base.gameplay || '')) {
      const cur = window.__TweakStore.getOverride(atlasId, groupKey) || {};
      if (cur.gameplay != null) {
        const next = { ...cur }; delete next.gameplay;
        if (Object.keys(next).length === 0) window.__TweakStore.clearOverride(atlasId, groupKey);
        else window.__TweakStore.setOverride(atlasId, groupKey, next);
      }
      return;
    }
    window.__TweakStore.setOverride(atlasId, groupKey, { gameplay: playDraft });
  }
  function revertThis() {
    if (!groupKey) return;
    window.__TweakStore.clearOverride(atlasId, groupKey);
  }

  const atlasTabs = ['leyline', 'heroic', 'radiant', 'deity'];

  return (
    <div className="parchment tweaks-panel">
      <div className="tweaks-panel-head">
        <h3>Tweaks · Card Text</h3>
        <span className="mono" style={{ color: 'var(--ink-4)', fontSize: '0.7rem' }}>
          {Object.keys(window.__TweakStore.loreOverrides).reduce((s, a) => s + Object.keys(window.__TweakStore.loreOverrides[a]).length, 0)} edits
        </span>
      </div>

      <div className="tweaks-target-picker">
        {atlasTabs.map(a => (
          <button key={a}
            className={'chip-btn' + (a === atlasId ? ' active' : '')}
            onClick={() => setAtlasId(a)}>
            {a[0].toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      <div className="tweaks-row">
        <label>Group</label>
        <select
          className="edit-select"
          value={groupKey || ''}
          onChange={e => setGroupKey(e.target.value)}>
          {groups.map(g => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
      </div>

      {groupKey ? (
        <>
          <div className="tweaks-row">
            <label>Lore {isOverridden && override.lore != null && <span style={{ color: 'var(--rubric)' }}>● edited</span>}</label>
            <textarea
              rows={5}
              value={loreDraft}
              onChange={e => setLoreDraft(e.target.value)}
              onBlur={commitLore} />
          </div>
          <div className="tweaks-row">
            <label>Gameplay {isOverridden && override.gameplay != null && <span style={{ color: 'var(--rubric)' }}>● edited</span>}</label>
            <textarea
              rows={4}
              value={playDraft}
              onChange={e => setPlayDraft(e.target.value)}
              onBlur={commitPlay} />
          </div>
          {isOverridden && (
            <button className="btn btn-ghost" onClick={revertThis} style={{ width: '100%', fontSize: '0.85rem' }}>
              ↶ Revert this card
            </button>
          )}
        </>
      ) : (
        <div className="tweaks-empty">No groups available.</div>
      )}
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
