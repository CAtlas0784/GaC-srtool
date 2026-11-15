#!/usr/bin/env node
// Syncs the game catalog (characters, light cones, relic sets, recommended
// builds) into assets/data/*.json.
//
//   node scripts/sync-data.mjs           # fetch only what is new
//   node scripts/sync-data.mjs --full    # re-fetch every detail record
//   node scripts/sync-data.mjs --dry-run # report, write nothing
//
// Sources
//   static.nanoka.cc       primary: updated from the game data automatically,
//                          includes beta versions, but only en/zh/ja/ko text
//   srtools.punklorde.org  secondary: the other languages (incl. Thai). It is
//                          updated by hand, so it may lag and is optional.
//
// The script writes nothing unless every check passes, so a broken source
// leaves the site untouched.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  NANOKA_LANGS, PUNKLORDE_LANGS, buildTemplate, cleanText, fillTemplate, findShrinkage, localize,
  mapElement, mapPath, mapRarity, mergeTexts, normalizeIngameRecommendation, normalizeUsageProfile,
  pickBuild, sortById
} from './lib/sync-core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'assets/data');
const args = new Set(process.argv.slice(2));
const FULL = args.has('--full');
const DRY_RUN = args.has('--dry-run');

const NANOKA = 'https://static.nanoka.cc';
const NANOKA_ASSETS = `${NANOKA}/assets/hsr`;
const PUNKLORDE = 'https://srtools.punklorde.org/api/data';
const HEADERS = { 'User-Agent': 'srtool-data-sync/1.0', Accept: 'application/json' };

async function request(url, { method = 'GET', attempts = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { method, headers: HEADERS, signal: AbortSignal.timeout(120000) });
      if (response.ok || response.status === 404) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((done) => setTimeout(done, 1500 * attempt));
  }
  throw new Error(`${url}: ${lastError?.message || lastError}`);
}

async function getJson(url) {
  const response = await request(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function getOptionalJson(url, label) {
  try {
    return await getJson(url);
  } catch (error) {
    console.warn(`  ! ${label} unavailable (${error.message}); keeping existing text`);
    return null;
  }
}

const urlExists = async (url) => {
  try {
    return (await request(url, { method: 'HEAD', attempts: 2 })).ok;
  } catch {
    return false;
  }
};

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const importModule = (relativePath) => import(pathToFileURL(resolve(root, relativePath)).href);

// The generated JSON is both the output and the starting point: text that a
// source no longer provides is kept from the previous run.
async function loadExisting() {
  return {
    avatars: await readJson(resolve(dataDir, 'avatars.json'), {}),
    lightcones: await readJson(resolve(dataDir, 'lightcones.json'), {}),
    relicSets: await readJson(resolve(dataDir, 'relic-sets.json'), {}),
    builds: await readJson(resolve(dataDir, 'builds.json'), {}),
    manifest: await readJson(resolve(dataDir, 'manifest.json'), {})
  };
}

// Other data files the site loads. Their hash goes into the manifest so the
// browser re-downloads them only when they change.
const TRACKED_ASSETS = ['firefly-endgame.json', 'item-catalog.json'];

// The Trailblazer's source name is only the "{NICKNAME}" placeholder, which
// would wipe out the descriptive names kept for each Trailblazer form.
const withoutPlaceholders = (names) => Object.fromEntries(Object.entries(names).filter(([, text]) => !text.includes('{NICKNAME}')));
const nanokaNames = (entry) => localize(entry, NANOKA_LANGS);
const punklordeNames = (entry) => localize(entry?.Name, PUNKLORDE_LANGS);
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 12);

async function main() {
  const existing = await loadExisting();
  const overrides = await readJson(resolve(root, 'scripts/data/overrides.json'), {});

  console.log('Reading nanoka manifest...');
  const game = (await getJson(`${NANOKA}/manifest.json`)).hsr;
  if (!game?.latest || !game?.live) throw new Error('nanoka manifest has no hsr.latest / hsr.live');
  const base = `${NANOKA}/hsr/${game.latest}`;
  const versionChanged = existing.manifest?.game?.latest !== game.latest;
  console.log(`  live ${game.live}, latest ${game.latest}${versionChanged ? ' (new since last sync)' : ''}`);

  const [characters, lightcones, relicSets] = await Promise.all(
    ['character', 'lightcone', 'relicset'].map((name) => getJson(`${base}/${name}.json`))
  );
  // Anything in the latest data but not in the live data is unreleased.
  const live = game.live === game.latest
    ? { character: characters, lightcone: lightcones, relicset: relicSets }
    : Object.fromEntries(await Promise.all(['character', 'lightcone', 'relicset']
      .map(async (name) => [name, await getJson(`${NANOKA}/hsr/${game.live}/${name}.json`)])));

  console.log('Reading punklorde tables (extra languages)...');
  const [pAvatars, pLightcones, pRelics] = await Promise.all([
    getOptionalJson(`${PUNKLORDE}/avatar`, 'punklorde avatar'),
    getOptionalJson(`${PUNKLORDE}/lightcone`, 'punklorde lightcone'),
    getOptionalJson(`${PUNKLORDE}/relic`, 'punklorde relic')
  ]);

  const report = { added: [], beta: [], images: [], pending: [], details: 0 };
  const needsDetail = (previous, isBeta, hasDetail) => FULL || versionChanged || !previous || isBeta || !hasDetail;

  // ---- Characters -------------------------------------------------------
  const avatarIds = Object.keys(characters);
  const avatarDetails = await mapLimit(avatarIds, 6, async (id) => {
    const isBeta = !live.character[id];
    if (!needsDetail(existing.avatars[id], isBeta, existing.builds[id]?.ingame)) return null;
    report.details += 1;
    return getJson(`${base}/en/character/${id}.json`);
  });

  const avatars = {};
  const ingameById = {};
  const lightconesById = {};
  for (const [index, id] of avatarIds.entries()) {
    const source = characters[id];
    const previous = existing.avatars[id];
    const detail = avatarDetails[index];
    const isBeta = !live.character[id];
    const entry = {
      ...previous,
      names: mergeTexts(
        withoutPlaceholders(nanokaNames(source)), withoutPlaceholders(punklordeNames(pAvatars?.[id])),
        previous?.names, nanokaNames(source)
      ),
      path: mapPath(source.baseType),
      element: mapElement(source.damageType),
      rarity: mapRarity(source.rank),
      hasExRank: detail ? Object.keys(detail.ex_ranks || {}).length > 0 : !!previous?.hasExRank
    };
    if (isBeta) entry.beta = true; else delete entry.beta;
    if (!previous) report.added.push(`character ${id} ${entry.names.en || ''}`);
    if (isBeta) report.beta.push(`character ${id}`);

    // New characters need artwork links; older ones already resolve. A
    // lookup that finds nothing is retried on later runs, because artwork
    // can be published after the data.
    if ((!previous || previous.imagesPending) && !existsSync(resolve(root, `assets/avatars/${id}.png`))) {
      const images = { ...entry.images };
      for (const [key, path] of [['icon', `avatarroundicon/${id}.webp`], ['splash', `avatardrawcard/${id}.webp`]]) {
        if (!images[key] && await urlExists(`${NANOKA_ASSETS}/${path}`)) images[key] = `${NANOKA_ASSETS}/${path}`;
      }
      if (Object.keys(images).length) entry.images = images;
      if (images.icon && images.splash) {
        delete entry.imagesPending;
        report.images.push(`character ${id}`);
      } else {
        entry.imagesPending = true;
        report.pending.push(`character ${id} artwork`);
      }
    }
    avatars[id] = entry;
    ingameById[id] = detail ? normalizeIngameRecommendation(detail.relics) : existing.builds[id]?.ingame || null;
    lightconesById[id] = detail ? (detail.lightcones || []).map(Number) : existing.builds[id]?.lightcones || [];
  }

  // ---- Light cones ------------------------------------------------------
  const lightconeIds = Object.keys(lightcones);
  const lightconeDetails = await mapLimit(lightconeIds, 6, async (id) => {
    const isBeta = !live.lightcone[id];
    if (!needsDetail(existing.lightcones[id], isBeta, existing.lightcones[id]?.passive?.synced)) return null;
    report.details += 1;
    return getJson(`${base}/en/lightcone/${id}.json`);
  });

  const lightconeData = {};
  for (const [index, id] of lightconeIds.entries()) {
    const source = lightcones[id];
    const previous = existing.lightcones[id];
    const detail = lightconeDetails[index];
    const isBeta = !live.lightcone[id];
    const entry = {
      ...previous,
      names: mergeTexts(nanokaNames(source), punklordeNames(pLightcones?.[id]), previous?.names),
      rarity: mapRarity(source.rank),
      path: mapPath(source.baseType)
    };
    if (isBeta) entry.beta = true; else delete entry.beta;

    const refinements = detail?.refinements;
    const rows = Object.keys(refinements?.level || {}).sort((a, b) => a - b).map((rank) => refinements.level[rank].param_list || []);
    const synced = previous?.passive?.synced ? previous.passive : null;
    let passive = synced;
    if (refinements?.desc && rows.length) {
      const { template, values } = buildTemplate(refinements.desc, rows);
      const { values: _values, synced: _synced, en: _en, ...otherTexts } = synced || {};
      passive = { en: template, ...otherTexts, values, synced: true };
    }
    if (passive) {
      // Translations use the same parameter slots as the English text. They
      // are merged on every run, so Thai text that the secondary source adds
      // later appears without waiting for the next game version.
      const translated = {};
      for (const [sourceLang, appLang] of Object.entries(PUNKLORDE_LANGS)) {
        const text = pLightcones?.[id]?.Skills?.Desc?.[sourceLang];
        if (appLang !== 'en' && cleanText(text)) translated[appLang] = buildTemplate(text, []).template;
      }
      const { values, synced: _flag, ...texts } = passive;
      entry.passive = { ...mergeTexts({ en: texts.en }, translated, texts), values, synced: true };
    }
    if (!previous) report.added.push(`light cone ${id} ${entry.names.en || ''}`);
    if (isBeta) report.beta.push(`light cone ${id}`);
    lightconeData[id] = entry;
  }

  // ---- Relic sets -------------------------------------------------------
  const relicData = {};
  for (const [id, source] of Object.entries(relicSets)) {
    const previous = existing.relicSets[id];
    const isBeta = !live.relicset[id];
    const entry = {
      ...previous,
      names: mergeTexts(nanokaNames(source), punklordeNames(pRelics?.[id]), previous?.names)
    };
    if (isBeta) entry.beta = true; else delete entry.beta;

    const descI18n = {};
    for (const pieces of ['2', '4']) {
      const bonus = source.set?.[pieces];
      if (!bonus) continue;
      const params = bonus.ParamList || [];
      const fromNanoka = Object.fromEntries(Object.entries(NANOKA_LANGS)
        .filter(([lang]) => cleanText(bonus[lang])).map(([lang, appLang]) => [appLang, fillTemplate(bonus[lang], params)]));
      const pDesc = pRelics?.[id]?.Skills?.[pieces]?.Desc;
      const fromPunklorde = Object.fromEntries(Object.entries(PUNKLORDE_LANGS)
        .filter(([lang]) => cleanText(pDesc?.[lang])).map(([lang, appLang]) => [appLang, fillTemplate(pDesc[lang], params)]));
      const texts = mergeTexts(fromNanoka, fromPunklorde, previous?.descI18n?.[pieces]);
      if (texts.en) {
        entry[`desc${pieces}`] = texts.en;
        descI18n[pieces] = texts;
      }
    }
    if (Object.keys(descI18n).length) entry.descI18n = descI18n;

    if (!previous) report.added.push(`relic set ${id} ${entry.names.en || ''}`);
    if (!previous || previous.iconPending) {
      const iconId = /(\d+)\.png$/i.exec(source.icon || '')?.[1];
      const iconUrl = iconId && `${NANOKA_ASSETS}/itemfigures/${iconId}.webp`;
      if (iconUrl && await urlExists(iconUrl)) {
        entry.setIcon = iconUrl;
        delete entry.iconPending;
        report.images.push(`relic set ${id}`);
      } else {
        entry.iconPending = true;
        report.pending.push(`relic set ${id} icon`);
      }
    }
    if (isBeta) report.beta.push(`relic set ${id}`);
    relicData[id] = entry;
  }

  // ---- Recommended builds ----------------------------------------------
  const byEnglishName = (data) => new Map(Object.entries(data)
    .filter(([, entry]) => entry.names?.en).map(([id, entry]) => [entry.names.en.trim().toLowerCase(), Number(id)]));
  const lookups = { setIdsByName: byEnglishName(relicData), lightconeIdsByName: byEnglishName(lightconeData) };
  const { PRYDWEN_BUILD_GUIDES } = await importModule('js/build-guides-data.js');

  const builds = {};
  const buildSources = {};
  for (const id of avatarIds) {
    const ingame = ingameById[id];
    const usage = normalizeUsageProfile(PRYDWEN_BUILD_GUIDES.profiles?.[id], lookups);
    const picked = pickBuild({ manual: overrides.builds?.[id], usage, ingame });
    const signature = overrides.signatureLightcones?.[id] ?? lightconesById[id][0] ?? null;
    builds[id] = {
      signature: lightconeData[signature] ? Number(signature) : null,
      lightcones: lightconesById[id].filter((lcId) => lightconeData[lcId]),
      build: picked?.build || null,
      source: picked?.source || 'path',
      ingame,
      usage
    };
    buildSources[builds[id].source] = (buildSources[builds[id].source] || 0) + 1;
  }

  // ---- Checks -----------------------------------------------------------
  const problems = [
    findShrinkage(existing.avatars, avatars, 'characters'),
    findShrinkage(existing.lightcones, lightconeData, 'light cones'),
    findShrinkage(existing.relicSets, relicData, 'relic sets')
  ].filter(Boolean);
  for (const [label, data] of [['character', avatars], ['light cone', lightconeData], ['relic set', relicData]]) {
    const unnamed = Object.entries(data).filter(([, entry]) => !entry.names.en).map(([id]) => id);
    if (unnamed.length) problems.push(`${label}: no English name for ${unnamed.slice(0, 8).join(', ')}`);
  }
  // Generated text is inserted into the page as HTML, so any tag the cleaner
  // does not know must stop the sync instead of reaching the site.
  const texts = [
    ...Object.entries(avatars).flatMap(([id, entry]) => Object.values(entry.names).map((text) => [`character ${id}`, text])),
    ...Object.entries(lightconeData).flatMap(([id, entry]) => [...Object.values(entry.names), ...Object.values(entry.passive || {})]
      .filter((text) => typeof text === 'string').map((text) => [`light cone ${id}`, text])),
    ...Object.entries(relicData).flatMap(([id, entry]) => [...Object.values(entry.names), ...Object.values(entry.descI18n || {}).flatMap(Object.values)]
      .map((text) => [`relic set ${id}`, text]))
  ];
  const markup = texts.filter(([, text]) => /<[a-z/]/i.test(text)).map(([label]) => label);
  if (markup.length) problems.push(`unhandled markup in ${[...new Set(markup)].slice(0, 8).join(', ')}`);
  if (problems.length) throw new Error(`Refusing to write:\n  - ${problems.join('\n  - ')}`);

  // ---- Output -----------------------------------------------------------
  const files = {
    'avatars.json': stableJson(sortById(avatars)),
    'lightcones.json': stableJson(sortById(lightconeData)),
    'relic-sets.json': stableJson(sortById(relicData)),
    'builds.json': stableJson(sortById(builds))
  };
  const hashes = Object.fromEntries(Object.entries(files).map(([name, text]) => [name, sha(text)]));
  const assets = {};
  for (const name of TRACKED_ASSETS) {
    const file = resolve(root, 'assets', name);
    // Hash without carriage returns so Windows and CI checkouts agree.
    if (existsSync(file)) assets[name] = sha((await readFile(file, 'utf8')).replace(/\r\n/g, '\n'));
  }
  const version = sha([...Object.values(hashes), ...Object.values(assets)].join(''));
  // The timestamp only moves when the content does, so an unchanged day
  // produces no diff and therefore no commit.
  const unchanged = existing.manifest?.version === version && existing.manifest?.game?.latest === game.latest
    && existing.manifest?.game?.live === game.live;
  const manifest = {
    version,
    updatedAt: unchanged ? existing.manifest.updatedAt : new Date().toISOString(),
    game: { live: game.live, latest: game.latest },
    counts: { avatars: avatarIds.length, lightcones: lightconeIds.length, relicSets: Object.keys(relicData).length },
    files: hashes,
    assets
  };
  files['manifest.json'] = stableJson(manifest);

  console.log(`\nCharacters ${manifest.counts.avatars}, light cones ${manifest.counts.lightcones}, relic sets ${manifest.counts.relicSets}`);
  console.log(`Detail records fetched: ${report.details}`);
  console.log(`Build sources: ${Object.entries(buildSources).map(([source, count]) => `${source} ${count}`).join(', ')}`);
  if (report.added.length) console.log(`New:\n  ${report.added.join('\n  ')}`);
  if (report.beta.length) console.log(`Beta: ${report.beta.join(', ')}`);
  if (report.images.length) console.log(`Artwork linked for: ${report.images.join(', ')}`);
  if (report.pending.length) console.log(`Still waiting for: ${report.pending.join(', ')}`);

  if (DRY_RUN) {
    console.log('\nDry run: nothing written.');
    return;
  }
  await mkdir(dataDir, { recursive: true });
  let written = 0;
  for (const [name, text] of Object.entries(files)) {
    const target = resolve(dataDir, name);
    if (existsSync(target) && await readFile(target, 'utf8') === text) continue;
    await writeFile(target, text, 'utf8');
    written += 1;
  }
  console.log(written ? `\nWrote ${written} file(s) to assets/data (version ${version}).` : '\nAlready up to date.');
}

main().catch((error) => {
  console.error(`\nSync failed: ${error.message}`);
  process.exit(1);
});
