#!/usr/bin/env node
// Copies the endgame catalog from the project's own GitHub Pages deployment.
//
// The endgame source refuses requests from Vercel's build machines, but the
// GitHub Pages build refreshes the same catalog every day. A Vercel build
// that could not refresh it directly takes the published copy instead.
//
// Usage: node scripts/fetch-published-endgame.mjs
//   SRTOOL_PUBLISHED_URL overrides the site the catalog is read from.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = (process.env.SRTOOL_PUBLISHED_URL || 'https://catlas0784.github.io/GaC-srtool').replace(/\/+$/, '');
const target = resolve(root, 'assets/firefly-endgame.json');

const response = await fetch(`${site}/assets/firefly-endgame.json`, {
  headers: { 'User-Agent': 'srtool-data-sync/1.0', Accept: 'application/json' },
  cache: 'no-store'
});
if (!response.ok) throw new Error(`Published endgame catalog: HTTP ${response.status}`);
const text = await response.text();
const catalog = JSON.parse(text);

// Never replace a good file with something that is not a full catalog.
const current = JSON.parse(await readFile(target, 'utf8'));
for (const mode of ['moc', 'pf', 'as', 'peak']) {
  const published = catalog.modes?.[mode]?.groups?.length || 0;
  const existing = current.modes?.[mode]?.groups?.length || 0;
  if (published < existing) throw new Error(`Published catalog has fewer ${mode} seasons (${published}) than the committed one (${existing})`);
}
if (!Object.keys(catalog.monsters || {}).length) throw new Error('Published catalog has no monsters');

await writeFile(target, text, 'utf8');
console.log(`Endgame catalog copied from ${site} (version ${catalog.version}).`);
