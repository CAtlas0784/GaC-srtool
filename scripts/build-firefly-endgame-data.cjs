// Builds the compact endgame catalog used by the FireflyGo monster settings.
//
// Firefly SrTools serves the raw client tables from
// https://srtools.punklorde.org/api/data/<name> (moc, pf, as, peak, monster).
// Those files are 2-14 MB each, so this script reduces them to the small subset
// the UI needs (season -> floor -> side -> waves + monster names/icons) and
// writes assets/firefly-endgame.json.
//
// Usage: node scripts/build-firefly-endgame-data.cjs [cacheDir]
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cacheDir = process.argv[2] || path.join(require('node:os').tmpdir(), 'ff-endgame-cache');
const ORIGIN = 'https://srtools.punklorde.org/api/data';
const LOCALES = ['en', 'th'];

function clean(value) {
  return String(value ?? '')
    .replace(/\{RUBY_B#[^}]*\}/g, '')
    .replace(/\{RUBY_E#\}/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickName(name) {
  if (!name || typeof name !== 'object') return {};
  const out = {};
  for (const locale of LOCALES) {
    const text = clean(name[locale]);
    if (text) out[locale] = text;
  }
  if (!out.en) {
    const fallback = clean(name.cn || name.cht || '');
    if (fallback) out.en = fallback;
  }
  return out;
}

function buffList(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((buff) => {
      const id = Number(buff?.ID);
      if (!Number.isFinite(id) || id <= 0) return null;
      return { id, name: pickName(buff?.Name) };
    })
    .filter(Boolean);
}

function wavesOf(stage) {
  if (!Array.isArray(stage?.MonsterList)) return [];
  return stage.MonsterList
    .map((wave) => (Array.isArray(wave) ? wave : Object.values(wave || {}))
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0))
    .filter((wave) => wave.length > 0);
}

function sideOf(side, stage) {
  if (!stage) return null;
  return {
    side,
    stageId: Number(stage.ID) || 0,
    level: Number(stage.Level) || 0,
    name: pickName(stage.Name),
    waves: wavesOf(stage),
    ...(stage.Invasion?.MazeBuff?.ID
      ? { invasionBuffId: Number(stage.Invasion.MazeBuff.ID) }
      : {})
  };
}

// MOC / PF / AS all expose EventList1 (upper) + EventList2 (lower); MOC also has
// a third node on the Tierce (hard) config.
function sidesOf(level, tierce) {
  return [
    sideOf('firstNode', level?.EventList1?.[0]),
    sideOf('secondNode', level?.EventList2?.[0]),
    sideOf('thirdNode', tierce?.EventList?.[0])
  ].filter(Boolean);
}

function levelEntry(level, tierce) {
  const sides = sidesOf(level, tierce);
  if (!sides.length) return null;
  return {
    id: Number(level.ID) || 0,
    floor: Number(level.Floor) || 0,
    name: pickName(level.Name),
    turnLimit: Number(level.TurnLimit) || 0,
    buffs: buffList(level.MazeBuff),
    sides
  };
}

function groupEntry(id, group, mode) {
  const levels = (Array.isArray(group.Level) ? group.Level : [])
    .map((level) => levelEntry(level, group.Tierce))
    .filter(Boolean);
  if (!levels.length) return null;
  return {
    id: Number(id) || 0,
    name: pickName(group.Name),
    begin: group.BeginTime || '',
    end: group.EndTime || '',
    levels
  };
}

function buildMocLike(data, mode) {
  return Object.entries(data)
    .map(([id, group]) => groupEntry(id, group, mode))
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

function peakStage(level, extra = {}) {
  const stage = level?.EventList?.[0];
  if (!stage) return null;
  return {
    id: Number(level.ID) || 0,
    stageId: Number(stage.ID) || 0,
    level: Number(stage.Level) || 0,
    name: pickName(stage.Name),
    turnLimit: Number(level.TurnLimit) || 0,
    buffs: buffList(level.MazeBuff),
    waves: wavesOf(stage),
    ...(stage.Invasion?.MazeBuff?.ID ? { invasionBuffId: Number(stage.Invasion.MazeBuff.ID) } : {}),
    ...extra
  };
}

function buildPeak(data) {
  return Object.entries(data)
    .map(([id, group]) => {
      const stages = [];
      for (const level of group.PreLevel || []) {
        const entry = peakStage(level, { kind: 'pre' });
        if (entry) stages.push(entry);
      }
      const boss = peakStage(group.BossLevel, { kind: 'boss' });
      if (boss) stages.push(boss);
      const hard = peakStage(group.BossConfig, { kind: 'hard' });
      if (hard) stages.push(hard);
      if (!stages.length) return null;
      return {
        id: Number(id) || 0,
        name: pickName(group.Name),
        stages
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

function collectMonsterIds(catalog) {
  const ids = new Set();
  const add = (waves) => waves.forEach((wave) => wave.forEach((id) => ids.add(id)));
  for (const group of catalog) {
    if (group.levels) {
      for (const level of group.levels) {
        for (const side of level.sides) add(side.waves);
      }
    }
    if (group.stages) {
      for (const stage of group.stages) add(stage.waves);
    }
  }
  return ids;
}

async function loadTable(name) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `${name}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const res = await fetch(`${ORIGIN}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return JSON.parse(text);
}

async function main() {
  const [moc, pf, as, peak, monsters] = await Promise.all([
    loadTable('moc'),
    loadTable('pf'),
    loadTable('as'),
    loadTable('peak'),
    loadTable('monster')
  ]);

  const modes = {
    moc: { groups: buildMocLike(moc, 'moc') },
    pf: { groups: buildMocLike(pf, 'pf') },
    as: { groups: buildMocLike(as, 'as') },
    peak: { groups: buildPeak(peak) }
  };

  const monsterIds = new Set();
  for (const mode of Object.values(modes)) {
    for (const id of collectMonsterIds(mode.groups)) monsterIds.add(id);
  }

  const monsterIndex = {};
  const missing = [];
  for (const id of [...monsterIds].sort((a, b) => a - b)) {
    const entry = monsters[String(id)];
    if (!entry) {
      missing.push(id);
      continue;
    }
    monsterIndex[id] = {
      name: pickName(entry.Name),
      rank: Number(entry.Rank) || 0,
      stance: Number(entry.StanceCount) || 0,
      weak: Array.isArray(entry.StanceWeakList) ? entry.StanceWeakList : [],
      icon: entry.Image?.IconPath ? `https://cdn.punklorde.org/asbres/${entry.Image.IconPath}` : ''
    };
  }

  const output = {
    version: new Date().toISOString().slice(0, 10),
    source: 'https://srtools.punklorde.org/api/data',
    modes,
    monsters: monsterIndex
  };

  const target = path.join(root, 'assets', 'firefly-endgame.json');
  fs.writeFileSync(target, JSON.stringify(output));
  const bytes = fs.statSync(target).size;
  console.log(`Wrote ${target} (${(bytes / 1024).toFixed(1)} KB)`);
  console.log(`MOC ${modes.moc.groups.length} groups, PF ${modes.pf.groups.length}, AS ${modes.as.groups.length}, PEAK ${modes.peak.groups.length}`);
  console.log(`Monsters ${Object.keys(monsterIndex).length} (missing ${missing.length}${missing.length ? ': ' + missing.slice(0, 20).join(',') : ''})`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
