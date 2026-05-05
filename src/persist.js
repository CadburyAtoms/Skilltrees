/* persist.js — File System Access API wrapper for editor mode.

   Stores a directory handle in IndexedDB so the editor only has to grant access
   once per browser. On "Done Editing", App.jsx calls saveAtlasJSON() with merged
   data and we write data/{leyline,cosmere,domain}.json straight to disk.

   Public API:
     window.Persist = {
       isSupported(),                // bool — File System Access available?
       hasFolder(),                  // -> Promise<bool> — handle stored?
       connectFolder(),              // prompts directoryPicker, stores handle
       getFolderName(),              // -> Promise<string|null>
       saveAtlasJSON({leyline,cosmere,domain}),
                                     // -> Promise<{ok, files:[...], error?}>
       forgetFolder(),               // wipes stored handle
     };
*/

(function () {
  const DB_NAME = 'skilltrees-persist';
  const STORE   = 'handles';
  const KEY     = 'projectRoot';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const r  = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror   = () => reject(r.error);
    });
  }

  async function idbSet(key, val) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async function idbDel(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  function isSupported() {
    return typeof window !== 'undefined'
      && typeof window.showDirectoryPicker === 'function';
  }

  async function getStoredHandle() {
    if (!isSupported()) return null;
    try { return (await idbGet(KEY)) || null; }
    catch { return null; }
  }

  async function hasFolder() {
    const h = await getStoredHandle();
    return !!h;
  }

  async function getFolderName() {
    const h = await getStoredHandle();
    return h ? h.name : null;
  }

  // Verify (or re-request) write permission on a stored handle.
  async function ensurePermission(handle, mode = 'readwrite') {
    if (!handle) return false;
    const opts = { mode };
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  async function connectFolder() {
    if (!isSupported()) {
      throw new Error('File System Access API not supported in this browser. Use Chrome, Edge, or Brave.');
    }
    const handle = await window.showDirectoryPicker({
      id: 'skilltrees-root',
      mode: 'readwrite',
      startIn: 'documents',
    });
    const ok = await ensurePermission(handle, 'readwrite');
    if (!ok) throw new Error('Write permission was not granted.');
    await idbSet(KEY, handle);
    return handle.name;
  }

  async function forgetFolder() {
    await idbDel(KEY);
  }

  // Resolve `data/<file>` from the stored root, creating subdir/file if missing.
  async function getDataFileHandle(root, filename) {
    const dataDir = await root.getDirectoryHandle('data', { create: false });
    return dataDir.getFileHandle(filename, { create: false });
  }

  async function writeJSON(handle, obj) {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(obj, null, 2));
    await writable.close();
  }

  /**
   * Saves merged atlas JSON to disk. Expects { leyline, cosmere, domain } arrays.
   * Returns { ok, files, error?, reason? }.
   *   reason: 'unsupported' | 'no-handle' | 'permission' | 'data-missing' | 'write'
   */
  async function saveAtlasJSON(merged) {
    if (!isSupported()) {
      return { ok: false, reason: 'unsupported', error: 'Browser does not support File System Access. Use Chrome/Brave/Edge.' };
    }
    const root = await getStoredHandle();
    if (!root) return { ok: false, reason: 'no-handle', error: 'No project folder connected.' };

    const ok = await ensurePermission(root, 'readwrite');
    if (!ok) return { ok: false, reason: 'permission', error: 'Write permission denied.' };

    const targets = [
      { key: 'leyline', file: 'leyline.json' },
      { key: 'cosmere', file: 'cosmere.json' },
      { key: 'domain',  file: 'domain.json'  },
    ];
    const written = [];
    try {
      for (const t of targets) {
        if (!merged[t.key]) continue;
        let fh;
        try {
          fh = await getDataFileHandle(root, t.file);
        } catch (e) {
          return { ok: false, reason: 'data-missing',
            error: `Couldn't find data/${t.file} in connected folder. Make sure you connected the project root (the folder containing 'data/').` };
        }
        await writeJSON(fh, merged[t.key]);
        written.push(`data/${t.file}`);
      }
      return { ok: true, files: written };
    } catch (e) {
      return { ok: false, reason: 'write', error: e.message || String(e), files: written };
    }
  }

  window.Persist = {
    isSupported,
    hasFolder,
    connectFolder,
    getFolderName,
    saveAtlasJSON,
    forgetFolder,
  };
})();
