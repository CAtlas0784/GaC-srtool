// Pure helpers for scripts/sync-data.mjs. Nothing here touches the network or
// the file system, so every function can be unit tested with node:test.

export const APP_LANGS = ['th', 'en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ru', 'vi', 'id', 'es', 'fr', 'de', 'pt'];

// Source language keys -> app language keys.
export const NANOKA_LANGS = { en: 'en', zh: 'zh-CN', ja: 'ja', ko: 'ko' };
export const PUNKLORDE_LANGS = {
  th: 'th', en: 'en', cn: 'zh-CN', cht: 'zh-TW', jp: 'ja', kr: 'ko', ru: 'ru',
  vi: 'vi', id: 'id', es: 'es', fr: 'fr', de: 'de', pt: 'pt'
};

const PATHS = {
  Knight: 'Preservation', Rogue: 'Hunt', Mage: 'Erudition', Shaman: 'Harmony', Warlock: 'Nihility',
  Warrior: 'Destruction', Priest: 'Abundance', Memory: 'Remembrance', Elation: 'Elation'
};
const ELEMENTS = {
  Physical: 'Physical', Fire: 'Fire', Ice: 'Ice', Thunder: 'Lightning', Wind: 'Wind',
  Quantum: 'Quantum', Imaginary: 'Imaginary'
};

// A new path or element needs a translation key and an icon, which only a
// person can add. Stopping here keeps half-described entries off the site.
function mapEnum(table, value, kind) {
  const mapped = table[value];
  if (!mapped) throw new Error(`Unknown ${kind} "${value}": add it to scripts/lib/sync-core.mjs, js/i18n.js and assets/ first`);
  return mapped;
}
export const mapPath = (baseType) => mapEnum(PATHS, baseType, 'path');
export const mapElement = (damageType) => mapEnum(ELEMENTS, damageType, 'element');
export function mapRarity(value) {
  const match = /(\d)$/.exec(String(value ?? ''));
  if (!match) throw new Error(`Unknown rarity "${value}"`);
  return Number(match[1]);
}

/** Strips ruby annotations and rich-text tags from game text. */
export function cleanText(value) {
  return String(value ?? '')
    .replace(/\{RUBY_B#[^}]*\}/g, '')
    .replace(/\{RUBY_E#\}/g, '')
    .replace(/<\/?(?:color|unbreak|i|b|u|size|nobr)[^>]*>/gi, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Converts { sourceLang: text } into { appLang: cleanedText }, dropping empty strings. */
export function localize(texts, langMap) {
  const out = {};
  for (const [sourceLang, appLang] of Object.entries(langMap)) {
    const text = cleanText(texts?.[sourceLang]);
    if (text) out[appLang] = text;
  }
  return out;
}

/**
 * Merges localized text. Earlier sources win, but an empty string never
 * replaces existing text. The result always uses APP_LANGS key order so the
 * generated JSON is stable between runs.
 */
export function mergeTexts(...sources) {
  const out = {};
  for (const lang of APP_LANGS) {
    for (const source of sources) {
      const text = source?.[lang];
      if (typeof text === 'string' && text.trim()) {
        out[lang] = text;
        break;
      }
    }
  }
  return out;
}

function formatParam(value, percent, decimals) {
  const scaled = percent ? Number(value) * 100 : Number(value);
  const factor = 10 ** decimals;
  return Math.round((scaled + Number.EPSILON) * factor) / factor;
}

/**
 * Turns a game description such as "ATK +#1[i]% for #2[i] turns" into the
 * "{0}% ... {1}" template the UI already renders, plus one row of display
 * values per parameter list (one row per superimposition rank).
 */
export function buildTemplate(desc, paramRows) {
  const formats = new Map();
  const template = cleanText(desc).replace(/#(\d+)\[(i|f(\d))\](%?)/g, (_, index, kind, digits, percent) => {
    const slot = Number(index) - 1;
    if (!formats.has(slot)) formats.set(slot, { percent: percent === '%', decimals: kind === 'i' ? 0 : Number(digits) });
    return `{${slot}}${percent}`;
  });
  const values = paramRows.map((row) => row.map((value, slot) => {
    const format = formats.get(slot) || { percent: false, decimals: 2 };
    return formatParam(value, format.percent, format.decimals);
  }));
  return { template, values };
}

/** Fills a template for a description that has a single parameter list (relic set bonuses). */
export function fillTemplate(desc, params) {
  const { template, values } = buildTemplate(desc, [params || []]);
  return template.replace(/\{(\d+)\}/g, (_, slot) => values[0][Number(slot)] ?? '');
}

// Main stat affix ids by relic slot and sub stat affix ids. These come from
// the game's RelicMainAffixConfig / RelicSubAffixConfig and have not changed
// since launch.
export const MAIN_AFFIX_IDS = {
  body: { HPAddedRatio: 1, AttackAddedRatio: 2, DefenceAddedRatio: 3, CriticalChanceBase: 4, CriticalDamageBase: 5, HealRatioBase: 6, StatusProbabilityBase: 7 },
  feet: { HPAddedRatio: 1, AttackAddedRatio: 2, DefenceAddedRatio: 3, SpeedDelta: 4 },
  sphere: {
    HPAddedRatio: 1, AttackAddedRatio: 2, DefenceAddedRatio: 3, PhysicalAddedRatio: 4, FireAddedRatio: 5,
    IceAddedRatio: 6, ThunderAddedRatio: 7, WindAddedRatio: 8, QuantumAddedRatio: 9, ImaginaryAddedRatio: 10
  },
  rope: { BreakDamageAddedRatioBase: 1, SPRatioBase: 2, HPAddedRatio: 3, AttackAddedRatio: 4, DefenceAddedRatio: 5 }
};
export const SUB_AFFIX_IDS = {
  HPDelta: 1, AttackDelta: 2, DefenceDelta: 3, HPAddedRatio: 4, AttackAddedRatio: 5, DefenceAddedRatio: 6,
  SpeedDelta: 7, CriticalChanceBase: 8, CriticalDamageBase: 9, StatusProbabilityBase: 10,
  StatusResistanceBase: 11, BreakDamageAddedRatioBase: 12
};

// Stat names used by the Prydwen usage dataset -> game property names.
const USAGE_STAT_PROPERTIES = {
  HP: 'HPAddedRatio', ATK: 'AttackAddedRatio', DEF: 'DefenceAddedRatio', SPD: 'SpeedDelta',
  'CRIT Rate': 'CriticalChanceBase', 'CRIT DMG': 'CriticalDamageBase',
  'Outgoing Healing Boost': 'HealRatioBase', 'Effect Hit Rate': 'StatusProbabilityBase',
  'Break Effect': 'BreakDamageAddedRatioBase', 'Energy Regeneration Rate': 'SPRatioBase',
  'Physical DMG Boost': 'PhysicalAddedRatio', 'Fire DMG Boost': 'FireAddedRatio', 'Ice DMG Boost': 'IceAddedRatio',
  'Lightning DMG Boost': 'ThunderAddedRatio', 'Wind DMG Boost': 'WindAddedRatio',
  'Quantum DMG Boost': 'QuantumAddedRatio', 'Imaginary DMG Boost': 'ImaginaryAddedRatio'
};

const mainIds = (slot, properties) => [...new Set((properties || []).map((property) => MAIN_AFFIX_IDS[slot][property]).filter(Boolean))];

/**
 * Normalises the game's own "recommended relics" record. Accepts both the
 * nanoka (snake_case) and the punklorde (PascalCase) field names.
 */
export function normalizeIngameRecommendation(relics) {
  if (!relics) return null;
  const pick = (snake, pascal) => relics[snake] ?? relics[pascal] ?? [];
  const out = {
    cavern: pick('set4_id_list', 'Set4IDList').map(Number),
    planar: pick('set2_id_list', 'Set2IDList').map(Number),
    body: mainIds('body', pick('property_list3', 'PropertyList3')),
    feet: mainIds('feet', pick('property_list4', 'PropertyList4')),
    sphere: mainIds('sphere', pick('property_list5', 'PropertyList5')),
    rope: mainIds('rope', pick('property_list6', 'PropertyList6')),
    substats: [...new Set(pick('sub_affix_property_list', 'SubAffixPropertyList').map((property) => SUB_AFFIX_IDS[property]).filter(Boolean))]
  };
  return out.cavern.length || out.planar.length ? out : null;
}

/**
 * Converts one Prydwen usage profile (names + usage %) into ids. `setIdsByName`
 * maps an English set name to its id. A slot is null when its most used row
 * has no single id, e.g. a mixed 2+2 relic row ("A, B").
 */
export function normalizeUsageProfile(profile, { setIdsByName, lightconeIdsByName }) {
  if (!profile) return null;
  // Only the most used row counts. Falling through to a less popular row
  // would present a minority pick as the favourite.
  const topId = (rows, table) => {
    const row = rows?.[0];
    const id = row ? table.get(String(row.name).trim().toLowerCase()) : null;
    return id ? { id, usage: row.usage } : null;
  };
  const stat = (slot) => {
    const row = profile.mainStats?.[slot]?.[0];
    const id = row ? MAIN_AFFIX_IDS[slot][USAGE_STAT_PROPERTIES[row.name]] : null;
    return id ? { id, usage: row.usage } : null;
  };
  return {
    sample: Number(profile.count || 0),
    mode: profile.mode || '',
    cavern: topId(profile.relicSets, setIdsByName),
    planar: topId(profile.planarSets, setIdsByName),
    lightcone: topId(profile.lightCones, lightconeIdsByName),
    body: stat('body'),
    feet: stat('feet'),
    sphere: stat('sphere'),
    rope: stat('rope')
  };
}

const SUBSTAT_FILLER = [8, 9, 7, 5, 4, 6, 12, 10, 11];

/** A build from the game's own recommendation: first choice of every list. */
export function ingameBuild(ingame) {
  if (!ingame) return null;
  const substats = [...ingame.substats];
  for (const id of SUBSTAT_FILLER) {
    if (substats.length >= 4) break;
    if (!substats.includes(id)) substats.push(id);
  }
  const build = {
    cavern: ingame.cavern[0], planar: ingame.planar[0],
    body: ingame.body[0], feet: ingame.feet[0], sphere: ingame.sphere[0], rope: ingame.rope[0],
    substats: substats.slice(0, 4)
  };
  return Object.values(build).every((value) => value !== undefined) ? build : null;
}

// Usage data is trusted from 100 sampled players, for slots where at least
// half of them made the same choice.
export const USAGE_MIN_SAMPLE = 100;
export const USAGE_MIN_SHARE = 50;

/**
 * Decides which recommended build the site shows for one character.
 *
 *   manual - hand-written entry from scripts/data/overrides.json, or undefined
 *   usage  - normalizeUsageProfile() result, or null. Each slot is
 *            { id, usage } (usage = % of sampled players) or null;
 *            usage.sample is the number of sampled players.
 *   ingame - normalizeIngameRecommendation() result, or null
 *
 * Returns { build, source } where build is
 * { cavern, planar, body, feet, sphere, rope, substats: [4 ids] } and source is
 * 'manual' | 'usage' | 'ingame', or null when nothing is known (the UI then
 * falls back to its per-path default).
 */
export function pickBuild({ manual, usage, ingame }) {
  if (manual) return { build: manual, source: 'manual' };
  const fromGame = ingameBuild(ingame);

  if (!fromGame) return null;

  // Player usage replaces the game's pick one slot at a time, and only where
  // the sample is large and a clear majority agrees. Sub stats are not in the
  // usage data, so they always come from the game.
  if (usage && usage.sample >= USAGE_MIN_SAMPLE) {
    const build = { ...fromGame };
    let changed = false;
    for (const slot of ['cavern', 'planar', 'body', 'feet', 'sphere', 'rope']) {
      const pick = usage[slot];
      if (pick && pick.usage >= USAGE_MIN_SHARE && pick.id !== build[slot]) {
        build[slot] = pick.id;
        changed = true;
      }
    }
    if (changed) return { build, source: 'usage' };
  }
  return { build: fromGame, source: 'ingame' };
}

/** Stable ordering: numeric ids ascending. */
export function sortById(object) {
  return Object.fromEntries(Object.entries(object).sort(([left], [right]) => Number(left) - Number(right)));
}

/**
 * Compares entry counts before and after a sync. Beta entries are excluded
 * because unreleased content can legitimately be removed again.
 */
export function findShrinkage(previous, next, label) {
  const released = (data) => Object.entries(data || {}).filter(([, entry]) => !entry.beta).map(([id]) => id);
  const nextIds = new Set(Object.keys(next || {}));
  const missing = released(previous).filter((id) => !nextIds.has(id));
  return missing.length ? `${label}: ${missing.length} released entr${missing.length === 1 ? 'y' : 'ies'} would disappear (${missing.slice(0, 8).join(', ')})` : null;
}
