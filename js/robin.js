// RobinSR transport helpers.
//
// RobinSR's sdkserver exposes a single push endpoint, POST <base>/srtools, that
// accepts { data?: FreesrData } and always answers HTTP 200 with
// { message, status }. A request without `data` is the "connect" probe and
// writes nothing. There is no read endpoint, and its CORS layer only allows the
// Content-Type header, so no custom headers may be sent.
// Reference: https://git.neonteam.dev/amizing/robinsr (sdkserver/src/services/sr_tools.rs)

import { buildSyncPayload, relicSetIdFromRelicId } from './firefly.js?v=4';
import { SKILL_POINT_ANCHORS, skillPointMaxLevel } from './skills.js?v=1';

export const ROBIN_SRTOOLS_PATH = '/srtools';
export const ROBIN_DEFAULT_BASE_URL = 'http://localhost:21000';

// The only battle_type names RobinSR's serde enum accepts.
export const ROBIN_BATTLE_TYPES = ['DEFAULT', 'MOC', 'PF', 'SU', 'AS', 'AA'];

// The endgame picker stores FireflyGo's names in battle_config. RobinSR calls
// Anomaly Arbitration "AA", and a hand-built encounter is a DEFAULT battle.
const ROBIN_BATTLE_TYPE_ALIASES = { PEAK: 'AA', CE: 'DEFAULT' };

// RobinSR copies battle_config.stage_id straight into the battle it sends to
// the game and never checks it, so a 0 (what the custom-wave editor stores)
// leaves the client stuck on the battle transition. These are the values of
// RobinSR's own BattleConfig::default().
export const ROBIN_DEFAULT_STAGE_ID = 201012311;
const ROBIN_DEFAULT_WAVES = [[{ level: 60, monster_id: 3014022 }]];

const U32_MAX = 4294967295;

export function robinSrtoolsUrl(apiUrl) {
  const base = String(apiUrl ?? '').trim().replace(/\/+$/, '') || ROBIN_DEFAULT_BASE_URL;
  if (/\/srtools$/i.test(base)) return base;
  return `${base}${ROBIN_SRTOOLS_PATH}`;
}

// Every number in RobinSR's FreesrData is a Rust u32: a negative, fractional or
// non-numeric value makes serde reject the whole save.
function u32(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(U32_MAX, Math.max(0, Math.trunc(parsed)));
}

function u32Map(value) {
  const out = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  Object.entries(value).forEach(([key, entry]) => {
    if (!/^\d+$/.test(String(key))) return;
    out[String(key)] = u32(entry);
  });
  return out;
}

function robinSkills(value) {
  const out = {};
  Object.entries(u32Map(value)).forEach(([pointId, level]) => {
    out[pointId] = Math.min(Math.max(1, level), skillPointMaxLevel(pointId));
  });
  return out;
}

// Anchors mirror the skill levels; recompute the ones the skills can answer
// for and pass any other through, so a capped level never disagrees with it.
function robinAnchors(rawAnchors, skills) {
  const out = u32Map(rawAnchors);
  Object.entries(skills).forEach(([pointId, level]) => {
    const anchor = SKILL_POINT_ANCHORS[String(pointId).slice(-3)];
    if (anchor) out[String(anchor)] = level;
  });
  return out;
}

function hasNumber(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function robinAvatar(avatar, original) {
  const skills = robinSkills(avatar.data?.skills);
  const out = {
    avatar_id: u32(avatar.avatar_id),
    data: {
      rank: u32(avatar.data?.rank),
      skills,
      skills_by_anchor_type: robinAnchors(avatar.data?.skills_by_anchor_type, skills)
    },
    level: u32(avatar.level),
    promotion: u32(avatar.promotion),
    techniques: (Array.isArray(avatar.techniques) ? avatar.techniques : [])
      .filter(hasNumber)
      .map((id) => u32(id))
  };
  // sp_value / sp_max / enhanced_id are Option<u32>: only send real values.
  if (hasNumber(original?.sp_value)) out.sp_value = u32(original.sp_value);
  if (hasNumber(original?.sp_max)) out.sp_max = u32(original.sp_max);
  if (u32(avatar.enhanced_id) > 0) out.enhanced_id = u32(avatar.enhanced_id);
  return out;
}

function robinSubAffixes(value) {
  return (Array.isArray(value) ? value : [])
    .filter((sub) => sub && typeof sub === 'object' && u32(sub.sub_affix_id) > 0)
    .map((sub) => ({
      sub_affix_id: u32(sub.sub_affix_id),
      count: u32(sub.count),
      step: u32(sub.step)
    }));
}

function robinBlessing(blessing) {
  const out = { level: u32(blessing.level, 1), id: u32(blessing.id) };
  const dynamicKey = blessing.dynamic_key;
  if (dynamicKey && typeof dynamicKey === 'object' && dynamicKey.key != null && dynamicKey.key !== '') {
    out.dynamic_key = { key: String(dynamicKey.key), value: u32(dynamicKey.value) };
  }
  return out;
}

// RobinSR's Monster has no `amount`; a stack of N is sent as N entries.
function robinWaves(waves, originalWaves) {
  return (Array.isArray(waves) ? waves : []).map((wave, waveIndex) => {
    const out = [];
    wave.forEach((monster) => {
      const entry = { level: u32(monster.level, 1), monster_id: u32(monster.monster_id) };
      const original = Array.isArray(originalWaves?.[waveIndex])
        ? originalWaves[waveIndex].find((raw) => raw && u32(raw.monster_id ?? raw.id) === entry.monster_id)
        : null;
      if (original && u32(original.max_hp) > 0) entry.max_hp = u32(original.max_hp);
      const amount = Math.min(Math.max(1, u32(monster.amount, 1)), 20);
      for (let i = 0; i < amount; i += 1) out.push({ ...entry });
    });
    return out;
  });
}

// The app stores the lineup as an array of avatar ids (slot order); RobinSR
// wants a { slot: avatarId } map and skips the top-level `lineups` key.
function robinLineup(value) {
  if (!value || typeof value !== 'object') return null;
  const entries = Array.isArray(value)
    ? value.map((id, slot) => [slot, id])
    : Object.entries(value);
  const out = {};
  entries.forEach(([slot, id]) => {
    if (!/^\d+$/.test(String(slot)) || u32(id) <= 0) return;
    out[String(slot)] = u32(id);
  });
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Converts the app's FreeSR snapshot into a body RobinSR's strict serde
 * structs accept. Starts from the FireflyGo payload (same FreeSR family) and
 * fixes every field whose type or shape differs.
 */
export function buildRobinPayload(freesr) {
  const source = freesr && typeof freesr === 'object' ? freesr : {};
  const base = buildSyncPayload(source);

  const avatars = {};
  Object.entries(base.avatars).forEach(([key, avatar]) => {
    avatars[key] = robinAvatar(avatar, source.avatars?.[key]);
  });

  // internal_uid is renumbered per list on the wire: the server derives item
  // ids from it, so a duplicate would make one item replace another. The
  // server is push-only, so the ids do not need to stay stable between pushes.
  const lightcones = base.lightcones.map((lc, index) => ({
    level: u32(lc.level),
    item_id: u32(lc.item_id),
    equip_avatar: u32(lc.equip_avatar),
    rank: u32(lc.rank),
    promotion: u32(lc.promotion),
    internal_uid: index
  }));

  // relic_set_id is not part of RobinSR's struct (it ignores unknown keys),
  // but servers that speak the same protocol, such as ppSR, store it and treat
  // 0 as "no set". Saves that never carried it get it from the relic id.
  const relics = base.relics.map((relic, index) => ({
    level: u32(relic.level),
    relic_id: u32(relic.relic_id),
    relic_set_id: u32(relic.relic_set_id) || relicSetIdFromRelicId(relic.relic_id),
    main_affix_id: u32(relic.main_affix_id),
    sub_affixes: robinSubAffixes(relic.sub_affixes),
    internal_uid: index,
    equip_avatar: u32(relic.equip_avatar)
  }));

  const sourceConfig = source.battle_config && typeof source.battle_config === 'object' ? source.battle_config : {};
  const config = base.battle_config;
  const rawType = String(config.battle_type || '').toUpperCase();
  const battleType = ROBIN_BATTLE_TYPE_ALIASES[rawType] || rawType;
  const battleConfig = {
    battle_type: ROBIN_BATTLE_TYPES.includes(battleType) ? battleType : 'DEFAULT',
    blessings: config.blessings.map(robinBlessing),
    custom_stats: robinSubAffixes(config.custom_stats),
    cycle_count: u32(config.cycle_count),
    stage_id: u32(config.stage_id) || ROBIN_DEFAULT_STAGE_ID,
    path_resonance_id: u32(config.path_resonance_id),
    monsters: robinWaves(config.monsters, sourceConfig.monsters)
  };
  // A battle with no monsters cannot start either.
  if (battleConfig.monsters.length === 0) battleConfig.monsters = ROBIN_DEFAULT_WAVES.map((wave) => wave.map((m) => ({ ...m })));
  const lineup = robinLineup(sourceConfig.custom_battle_lineup ?? source.custom_battle_lineup);
  if (lineup) battleConfig.custom_battle_lineup = lineup;
  if (Array.isArray(sourceConfig.scepters) && sourceConfig.scepters.length > 0) {
    battleConfig.scepters = sourceConfig.scepters;
  }

  return { lightcones, relics, avatars, battle_config: battleConfig };
}

/**
 * Decides what a parsed JSON reply from POST /srtools means.
 *
 * Returns one of:
 *   'ok'           - a real RobinSR reply that accepted the request
 *   'error'        - a real RobinSR reply that reports a failure
 *   'sdk-fallback' - an SDK-style envelope from a server without /srtools
 *   'unknown'      - anything else (not JSON, wrong shape)
 *
 * Facts about the server: it always answers HTTP 200 with
 * { message: string, status: number }; success is status 200, failure is
 * status 500. Other servers answer unknown paths with
 * { retcode: 0, message: 'OK', ... }.
 */
export function classifyRobinReply(reply) {
  if (!reply || typeof reply !== 'object' || Array.isArray(reply)) return 'unknown';
  // Checked first: an SDK envelope also carries message 'OK'.
  if ('retcode' in reply) return 'sdk-fallback';
  if (typeof reply.status !== 'number' || typeof reply.message !== 'string') return 'unknown';
  return reply.status === 200 ? 'ok' : 'error';
}
