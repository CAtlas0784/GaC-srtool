// Loader for the generated game data in assets/data (written by
// scripts/sync-data.mjs). The data changes without a code change, so every
// request carries the content hash from manifest.json instead of a
// hand-bumped ?v= number.
//
// Works in the browser (fetch) and in Node (file read), because the tests and
// the sync scripts import the same data modules.

const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';
const DATA_DIR = new URL('../assets/data/', import.meta.url);

async function readJson(url, { fresh = false } = {}) {
  if (IS_BROWSER) {
    const response = await fetch(url, fresh ? { cache: 'no-cache' } : undefined);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  const { readFile } = await import('node:fs/promises');
  return JSON.parse(await readFile(url, 'utf8'));
}

async function readOrEmpty(url, options) {
  try {
    return await readJson(url, options);
  } catch (error) {
    // Missing data degrades to placeholder names instead of a blank page.
    console.error(`Game data unavailable: ${url}`, error);
    return {};
  }
}

// The manifest is always revalidated; everything else is cached by hash.
export const DATA_MANIFEST = await readOrEmpty(new URL('manifest.json', DATA_DIR), { fresh: true });

/** Loads one generated file from assets/data, e.g. loadGameData('avatars.json'). */
export function loadGameData(name) {
  const url = new URL(name, DATA_DIR);
  const hash = DATA_MANIFEST.files?.[name];
  if (hash) url.searchParams.set('v', hash);
  return readOrEmpty(url);
}

/**
 * Cache-busting version for other data files under assets/ that the sync
 * tracks, e.g. assetVersion('firefly-endgame.json').
 */
export function assetVersion(name) {
  return DATA_MANIFEST.assets?.[name] || DATA_MANIFEST.version || '';
}
