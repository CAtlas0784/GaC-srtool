// Only the static web application is published; repository tools and local
// configuration are not copied to the public deployment.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'version.json', 'assets', 'css', 'js']) {
  const source = path.join(root, name);
  if (!fs.existsSync(source)) throw new Error(`Missing static application input: ${name}`);
  fs.cpSync(source, path.join(output, name), { recursive: true, force: true });
}
console.log('Static application prepared for Vercel.');
