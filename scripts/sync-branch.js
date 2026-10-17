const fs = require('fs');
const { execSync } = require('child_process');

let branch = 'test-gay';
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch (_) {
  try {
    const head = fs.readFileSync('.git/HEAD', 'utf8');
    const m = head.match(/ref:\s*refs\/heads\/([^\r\n]+)/);
    if (m && m[1]) branch = m[1].trim();
  } catch (__) {}
}

const versionData = {
  branch,
  version: '1.0.0',
  updatedAt: new Date().toISOString()
};

fs.writeFileSync('version.json', JSON.stringify(versionData, null, 2) + '\n');
console.log(`[sync-branch] Updated version.json with branch: ${branch}`);
