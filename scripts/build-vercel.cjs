// Only the static web application is published; repository tools and local
// configuration are not copied to the public deployment.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });

// If building on Vercel, update version.json with the deployed branch
const vercelBranch = process.env.VERCEL_GIT_COMMIT_REF;
const versionFile = path.join(root, 'version.json');
if (vercelBranch && fs.existsSync(versionFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    data.branch = vercelBranch;
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(versionFile, JSON.stringify(data, null, 2) + '\n');
    console.log(`[build-vercel] Synced branch to: ${vercelBranch}`);
  } catch (err) {
    console.warn('[build-vercel] Could not update branch:', err.message);
  }
}

// The repository is a one-way mirror, so fresh game data is never committed.
// It is fetched here instead, right before the site is copied. A failed
// refresh restores the committed data so the build still succeeds.
// Runs on Vercel only (or with --refresh) to keep local builds offline.
function refreshGameData() {
  const { spawnSync } = require('node:child_process');
  const os = require('node:os');
  const dataPaths = ['assets/data', 'assets/firefly-endgame.json', 'js/build-guides-data.js'];
  const backup = fs.mkdtempSync(path.join(os.tmpdir(), 'srtool-data-backup-'));
  for (const name of dataPaths) {
    fs.cpSync(path.join(root, name), path.join(backup, name), { recursive: true });
  }
  const run = (...args) => spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' }).status === 0;
  // Each source is refreshed on its own, so one that is down or refuses the
  // request only keeps its own data at the committed version (these two
  // scripts write only on success).
  if (!run('scripts/sync-build-guides.mjs')) console.warn('[build-vercel] Usage statistics not refreshed.');
  // The endgame source refuses Vercel's build machines, so the copy that the
  // GitHub Pages build refreshes daily is the fallback.
  if (!run('scripts/build-firefly-endgame-data.cjs', path.join(backup, 'endgame-cache'))
    && !run('scripts/fetch-published-endgame.mjs')) {
    console.warn('[build-vercel] Endgame rooms not refreshed.');
  }
  if (!run('scripts/sync-data.mjs') || !run('--test', 'tests/sync-data.test.cjs', 'tests/equipment-data.test.cjs')) {
    console.warn('[build-vercel] Data refresh failed; using the committed data.');
    for (const name of dataPaths) {
      fs.rmSync(path.join(root, name), { recursive: true, force: true });
      fs.cpSync(path.join(backup, name), path.join(root, name), { recursive: true });
    }
    return;
  }
  console.log('[build-vercel] Game data refreshed.');
}
if (process.env.VERCEL || process.argv.includes('--refresh')) refreshGameData();

for (const name of ['index.html', 'version.json', 'assets', 'css', 'js']) {
  const source = path.join(root, name);
  if (!fs.existsSync(source)) throw new Error(`Missing static application input: ${name}`);
  fs.cpSync(source, path.join(output, name), { recursive: true, force: true });
}
console.log('Static application prepared for Vercel.');
