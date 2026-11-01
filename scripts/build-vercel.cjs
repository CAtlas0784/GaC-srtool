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

for (const name of ['index.html', 'version.json', 'assets', 'css', 'js']) {
  const source = path.join(root, name);
  if (!fs.existsSync(source)) throw new Error(`Missing static application input: ${name}`);
  fs.cpSync(source, path.join(output, name), { recursive: true, force: true });
}
console.log('Static application prepared for Vercel.');
