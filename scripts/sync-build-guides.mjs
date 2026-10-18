import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const avatarSource = await readFile(resolve(repoRoot, 'js/avatars-data.js'), 'utf8');
const metadataMatch = avatarSource.match(/export const AVATAR_METADATA = (\{[\s\S]*?\n\});/);
if (!metadataMatch) throw new Error('Could not read AVATAR_METADATA from js/avatars-data.js');
const avatarMetadata = JSON.parse(metadataMatch[1]);

const headers = { 'User-Agent': 'GaC-Srtool build guide data sync' };
const treeResponse = await fetch('https://huggingface.co/api/datasets/LvlUrArti/MocDataProcessed/tree/main?recursive=true', { headers });
if (!treeResponse.ok) throw new Error(`Dataset file listing failed: HTTP ${treeResponse.status}`);
const files = await treeResponse.json();
const versions = [...new Set(files
  .filter(file => file.type === 'directory' && /^\d+\.\d+\.\d+$/.test(file.path))
  .map(file => file.path))]
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
const version = versions.at(-1);
if (!version) throw new Error('No versioned build snapshot was found in the dataset');

const [configResponse, buildsResponse] = await Promise.all([
  fetch('https://huggingface.co/datasets/LvlUrArti/MocDataProcessed/resolve/main/config.json', { headers }),
  fetch(`https://huggingface.co/datasets/LvlUrArti/MocDataProcessed/resolve/main/${version}/builds.json`, { headers })
]);
if (!configResponse.ok || !buildsResponse.ok) {
  throw new Error(`Could not download snapshot ${version} (config ${configResponse.status}, builds ${buildsResponse.status})`);
}
const [config, sourceBuilds] = await Promise.all([configResponse.json(), buildsResponse.json()]);
const snapshot = config[version];
if (!snapshot?.collect_date || !Array.isArray(sourceBuilds)) {
  throw new Error(`Snapshot ${version} is missing its date or build rows`);
}

const slugOverrides = {
  '1001': 'march-7th',
  '1112': 'topaz',
  '1213': 'imbibitor-lunae',
  '1225': 'tingyun-fugue',
  '1224': 'march-7th-swordmaster',
  '1413': 'march-7th-evernight',
  '1414': 'dan-heng-permansor-terrae',
  '1506': 'silver-wolf-lv-999',
  '1507': 'blade-mortenax',
  '1510': 'himeko-nova',
  '1511': 'aeon-aha',
  '1512': 'robin-summeretto',
  '1513': 'aventurine-waveflair',
  '8001': 'trailblazer-destruction',
  '8002': 'trailblazer-destruction',
  '8003': 'trailblazer-preservation',
  '8004': 'trailblazer-preservation',
  '8005': 'trailblazer-harmony',
  '8006': 'trailblazer-harmony',
  '8007': 'trailblazer-remembrance',
  '8008': 'trailblazer-remembrance',
  '8009': 'trailblazer-elation',
  '8010': 'trailblazer-elation'
};

function slugify(name = '') {
  return name.toLowerCase()
    .replace(/•/g, ' ')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function rankedValues(row, namePrefix, usagePrefix, count = 4) {
  const values = [];
  for (let index = 1; index <= count; index += 1) {
    const name = String(row[`${namePrefix}${index}`] || '').trim();
    const usage = Number(row[`${usagePrefix}${index}_app`] ?? row[`${namePrefix}${index}_app`] ?? 0);
    if (name && usage > 0) values.push({ name, usage: Math.round(usage * 100) / 100 });
  }
  return values.sort((left, right) => right.usage - left.usage);
}

function rankedStats(row, statPrefix) {
  const stats = [];
  for (let index = 1; index <= 3; index += 1) {
    const name = String(row[`${statPrefix}_stats_${index}`] || '').trim();
    const usage = Number(row[`${statPrefix}_stats_${index}_app`] || 0);
    if (name && usage > 0) stats.push({ name, usage: Math.round(usage * 100) / 100 });
  }
  return stats.sort((left, right) => right.usage - left.usage);
}

const endgameModes = [
  ['moc', 'Memory of Chaos'],
  ['pf', 'Pure Fiction'],
  ['as', 'Apocalyptic Shadow'],
  ['aa', 'Anomaly Arbitration']
];
const getLargestSample = row => endgameModes.reduce((best, [key, label]) => {
  const count = Number(row[`sample_size_players_${key}`] || 0);
  return count > best.count ? { count, mode: label } : best;
}, { count: 0, mode: '' });

// The source file includes current and comparison rows with duplicate slugs; keep
// the row with the largest current endgame sample instead of letting the last
// comparison row silently replace it.
const sourceBySlug = new Map();
for (const row of sourceBuilds) {
  const previous = sourceBySlug.get(row.char);
  if (!previous || getLargestSample(row).count > getLargestSample(previous).count) {
    sourceBySlug.set(row.char, row);
  }
}
const profiles = {};
const missingSlugs = new Set();

for (const [avatarId, metadata] of Object.entries(avatarMetadata)) {
  const slug = slugOverrides[avatarId] || slugify(metadata.names?.en);
  const row = sourceBySlug.get(slug);
  if (!row) {
    missingSlugs.add(slug);
    continue;
  }

  profiles[avatarId] = {
    slug,
    ...getLargestSample(row),
    lightCones: rankedValues(row, 'weapons_', 'weapons_', 5),
    relicSets: rankedValues(row, 'artifacts_', 'artifacts_', 5),
    planarSets: rankedValues(row, 'planars_', 'planars_', 5),
    mainStats: {
      body: rankedStats(row, 'body'),
      feet: rankedStats(row, 'feet'),
      sphere: rankedStats(row, 'sphere'),
      rope: rankedStats(row, 'rope')
    }
  };
}

const output = {
  source: {
    dataset: 'LvlUrArti/MocDataProcessed',
    license: 'MIT',
    credit: 'LvlUrArti',
    version,
    collectedAt: snapshot.collect_date,
    note: 'Prydwen endgame build usage sample; not a curated or official ranking.'
  },
  profiles
};
const outputPath = resolve(repoRoot, 'js/build-guides-data.js');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `// Generated by scripts/sync-build-guides.mjs; see README for source and attribution.\nexport const PRYDWEN_BUILD_GUIDES = ${JSON.stringify(output, null, 2)};\n`, 'utf8');
console.log(`Wrote ${Object.keys(profiles).length} avatar profiles from snapshot ${version} (${snapshot.collect_date}).`);
if (missingSlugs.size) console.log(`No dataset row for: ${[...missingSlugs].sort().join(', ')}`);
