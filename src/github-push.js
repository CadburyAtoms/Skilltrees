/* github-push.js — direct push to GitHub via the Git Database API.

   When configured, eliminates the manual `git add data && git commit && git push`
   step entirely. After Persist.saveAtlasJSON writes data/*.json to disk,
   App.jsx calls window.GithubPush.commitDataFiles(merged) to do an atomic
   3-file commit on origin/main.

   Setup (one-time):
     1. User clicks ⌘ GitHub in the masthead → modal asks for a Personal Access Token.
     2. PAT is stored in localStorage (key: skilltrees:github:pat).
        Scope needed: `repo` (or `public_repo` for public repos).
     3. Owner/repo/branch default to cadburyatoms/skilltrees/main but are configurable
        and stored in localStorage too.

   Public API:
     window.GithubPush = {
       isConfigured(),        // -> bool
       getConfig(),           // -> { owner, repo, branch, hasPat: bool }
       setConfig({ owner, repo, branch, pat }),
       clearConfig(),
       commitDataFiles(merged, message)
                              // -> Promise<{ sha, htmlUrl, branch }>
     };

   Security note: a `repo`-scoped PAT in localStorage is sensitive. Only set
   this on a machine you trust. The token is sent as a Bearer auth header
   directly to api.github.com — never to GitHub Pages or any third-party origin.
*/

(function () {
  const PAT_KEY    = 'skilltrees:github:pat';
  const CONFIG_KEY = 'skilltrees:github:config';
  const DEFAULT_CONFIG = { owner: 'cadburyatoms', repo: 'Skilltrees', branch: 'main' };

  function getConfig() {
    let c = DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) c = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...c, hasPat: !!localStorage.getItem(PAT_KEY) };
  }

  function setConfig({ owner, repo, branch, pat }) {
    const cur = getConfig();
    const next = {
      owner: owner != null ? owner : cur.owner,
      repo: repo != null ? repo : cur.repo,
      branch: branch != null ? branch : cur.branch,
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    if (pat != null) {
      if (pat) localStorage.setItem(PAT_KEY, pat);
      else localStorage.removeItem(PAT_KEY);
    }
  }

  function clearConfig() {
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(PAT_KEY);
  }

  function isConfigured() {
    return !!localStorage.getItem(PAT_KEY);
  }

  async function gh(path, init) {
    const cfg = getConfig();
    const pat = localStorage.getItem(PAT_KEY);
    if (!pat) throw new Error('GitHub PAT not configured. Click ⌘ GitHub to set one.');
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init && init.headers),
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      let body;
      try { body = await res.json(); } catch { body = await res.text(); }
      const msg = body && body.message ? body.message : `HTTP ${res.status}`;
      const err = new Error(`GitHub API ${path}: ${msg}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return res.json();
  }

  // Verify token + repo access. Useful from the config modal.
  async function verifyAccess() {
    const cfg = getConfig();
    const repo = await gh('', { method: 'GET' });
    return { login: repo.owner && repo.owner.login, repo: repo.full_name, defaultBranch: repo.default_branch, configBranch: cfg.branch };
  }

  // Commit data/{leyline,cosmere,domain}.json atomically using the Git Database API.
  async function commitDataFiles(merged, message) {
    const cfg = getConfig();
    if (!isConfigured()) throw new Error('GitHub PAT not configured.');
    const branch = cfg.branch || 'main';
    const commitMsg = message || 'atlas edits';

    // 1. Get the current ref → commit SHA
    const ref = await gh(`/git/ref/heads/${encodeURIComponent(branch)}`);
    const parentSha = ref.object.sha;

    // 2. Get the commit → tree SHA
    const parentCommit = await gh(`/git/commits/${parentSha}`);
    const baseTreeSha = parentCommit.tree.sha;

    // 3. Create blobs for each file (UTF-8 text). Use base64 for safety.
    const files = [
      { path: 'data/leyline.json', content: JSON.stringify(merged.leyline, null, 2) },
      { path: 'data/cosmere.json', content: JSON.stringify(merged.cosmere, null, 2) },
      { path: 'data/domain.json',  content: JSON.stringify(merged.domain,  null, 2) },
    ];
    const blobs = await Promise.all(files.map(async f => {
      const blob = await gh('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: btoa(unescape(encodeURIComponent(f.content))), encoding: 'base64' }),
      });
      return { path: f.path, sha: blob.sha };
    }));

    // 4. Create a new tree with the new blobs, based on the parent tree.
    const tree = await gh('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobs.map(b => ({ path: b.path, mode: '100644', type: 'blob', sha: b.sha })),
      }),
    });

    // 5. Create the commit.
    const commit = await gh('/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: commitMsg,
        tree: tree.sha,
        parents: [parentSha],
      }),
    });

    // 6. Update the ref.
    await gh(`/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    return {
      sha: commit.sha,
      htmlUrl: `https://github.com/${cfg.owner}/${cfg.repo}/commit/${commit.sha}`,
      branch,
    };
  }

  if (typeof window !== 'undefined') {
    window.GithubPush = {
      isConfigured,
      getConfig,
      setConfig,
      clearConfig,
      verifyAccess,
      commitDataFiles,
    };
  }
})();
