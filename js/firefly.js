// FireflyGo (Firefly_Srtools) transport helpers.
//
// FireflyGo exposes a single push endpoint, POST <base>/sync, that accepts
// { username, password, data?: FreeSRJson, extra_data?: ExtraData }. A request
// without `data` is the "connect" probe and only returns the current extra data.
// Reference: https://git.kain.io.vn/Firefly-Shelter/Firefly_Srtools

export const FIREFLY_SYNC_PATH = '/sync';
export const FIREFLY_DEFAULT_BASE_URL = 'http://localhost:21000';

/**
 * FireflyGo only listens on POST <base>/sync and ignores the GaCy-style port
 * paths, so the UI's base URL is turned into a full sync endpoint here.
 */
export function fireflySyncUrl(apiUrl) {
  const base = String(apiUrl ?? '').trim().replace(/\/+$/, '') || FIREFLY_DEFAULT_BASE_URL;
  if (/\/sync$/i.test(base)) return base;
  return `${base}${FIREFLY_SYNC_PATH}`;
}

export const FIREFLY_EXTRA_FALLBACK = {
  multi_path: {
    main: 0,
    march_7: 0,
    multi_path_main: [],
    multi_path_march_7: []
  },
  setting: {
    censorship: false,
    cm: false,
    first_person: false,
    hide_ui: false,
    invasion_percent: 0
  },
  challenge: {
    skip_node: 0,
    challenge_peak_group_id: 0,
    challenge_peak_group_id_list: []
  },
  theory_craft: {
    hp: {},
    cycle_count: 0,
    mode: false,
    stage_id: 0,
    custom_lineup: []
  },
  lua: null
};

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value) {
  return value === true || value === 1 || value === 'true' || value === '1';
}

function numberList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => num(entry)).filter((entry) => Number.isFinite(entry));
  }
  if (typeof value === 'string') {
    return value
      .split(/[\s,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => num(entry))
      .filter((entry) => Number.isFinite(entry));
  }
  return [];
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Normalises whatever the server returned (or the user typed) into the shape
 * FireflyGo expects. Returns null when there is nothing usable so a sync never
 * sends a bogus `extra_data` block.
 */
export function normalizeExtraData(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const extra = cloneJson(raw);
  const multiPath = extra.multi_path && typeof extra.multi_path === 'object' ? extra.multi_path : {};
  extra.multi_path = {
    main: num(multiPath.main),
    march_7: num(multiPath.march_7),
    multi_path_main: numberList(multiPath.multi_path_main),
    multi_path_march_7: numberList(multiPath.multi_path_march_7)
  };

  const setting = extra.setting && typeof extra.setting === 'object' ? extra.setting : {};
  extra.setting = {
    ...setting,
    censorship: bool(setting.censorship),
    cm: bool(setting.cm),
    first_person: bool(setting.first_person),
    hide_ui: bool(setting.hide_ui),
    invasion_percent: num(setting.invasion_percent)
  };

  const challenge = extra.challenge && typeof extra.challenge === 'object' ? extra.challenge : {};
  extra.challenge = {
    skip_node: num(challenge.skip_node),
    challenge_peak_group_id: num(challenge.challenge_peak_group_id),
    challenge_peak_group_id_list: numberList(challenge.challenge_peak_group_id_list)
  };

  if (extra.theory_craft && typeof extra.theory_craft === 'object') {
    const theory = extra.theory_craft;
    extra.theory_craft = {
      hp: theory.hp && typeof theory.hp === 'object' && !Array.isArray(theory.hp) ? theory.hp : {},
      cycle_count: num(theory.cycle_count),
      mode: bool(theory.mode),
      stage_id: num(theory.stage_id),
      custom_lineup: numberList(theory.custom_lineup)
    };
  }

  if (extra.lua !== null && extra.lua !== undefined && typeof extra.lua !== 'string') {
    extra.lua = String(extra.lua);
  }
  if (extra.lua === undefined) extra.lua = null;

  return extra;
}

function normalizeAnchorMap(skillsByAnchorType, skills) {
  if (skillsByAnchorType && typeof skillsByAnchorType === 'object' && !Array.isArray(skillsByAnchorType)) {
    const entries = Object.entries(skillsByAnchorType)
      .map(([key, value]) => [String(key), num(value)])
      .filter(([key]) => key);
    if (entries.length > 0) return Object.fromEntries(entries);
  }
  // Derive the anchor map from point ids when the save does not carry one.
  const derived = {};
  Object.entries(skills || {}).forEach(([pointId, level]) => {
    const suffix = String(pointId).slice(-3);
    const anchor = /^2\d{2}$/.test(suffix)
      ? '9'
      : ({ '001': '1', '002': '2', '003': '3', '004': '4', '007': '5', '101': '6', '102': '7', '103': '8' }[suffix] || '');
    if (!anchor) return;
    if (derived[anchor] === undefined || num(level) > derived[anchor]) derived[anchor] = num(level);
  });
  return Object.keys(derived).length > 0 ? derived : undefined;
}

// FireflyGo validates `blessings: [{ id, level, dynamic_key? }]` and rejects
// the raw id arrays some FreeSR exports still contain.
function normalizeBlessings(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const raw = entry && typeof entry === 'object' ? entry : { id: entry };
      const id = num(raw.id ?? raw.ID);
      if (id <= 0) return null;
      const blessing = { id, level: Math.max(1, num(raw.level, 1) || 1) };
      const dynamicKey = raw.dynamic_key;
      if (dynamicKey && typeof dynamicKey === 'object' && dynamicKey.key != null && dynamicKey.key !== '') {
        blessing.dynamic_key = {
          key: typeof dynamicKey.key === 'number' ? num(dynamicKey.key) : String(dynamicKey.key),
          value: num(dynamicKey.value)
        };
      }
      return blessing;
    })
    .filter(Boolean);
}

// `monsters` is a list of waves; every wave is a list of
// `{ monster_id, level, amount }` objects.
function normalizeMonsterWaves(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((wave) => {
      const entries = Array.isArray(wave)
        ? wave
        : Object.values(wave && typeof wave === 'object' ? wave : {});
      return entries
        .map((entry) => {
          const raw = entry && typeof entry === 'object' ? entry : { monster_id: entry };
          const monsterId = num(raw.monster_id ?? raw.id);
          if (monsterId <= 0) return null;
          return {
            monster_id: monsterId,
            level: Math.max(1, num(raw.level, 1) || 1),
            amount: Math.max(1, num(raw.amount, 1) || 1)
          };
        })
        .filter(Boolean);
    })
    .filter((wave) => wave.length > 0);
}

function normalizeBattleConfig(battleConfig) {
  const source = battleConfig && typeof battleConfig === 'object' ? battleConfig : {};
  return {
    battle_type: typeof source.battle_type === 'string' && source.battle_type ? source.battle_type : 'DEFAULT',
    blessings: normalizeBlessings(source.blessings),
    custom_stats: Array.isArray(source.custom_stats) ? source.custom_stats : [],
    cycle_count: num(source.cycle_count),
    stage_id: num(source.stage_id),
    path_resonance_id: num(source.path_resonance_id),
    monsters: normalizeMonsterWaves(source.monsters)
  };
}

/**
 * Converts the app's FreeSR snapshot into the exact payload FireflyGo's
 * converter produces: avatars keyed by id, flat lightcone/relic arrays with
 * sequential internal uids, and a stripped battle_config.
 */
export function buildSyncPayload(freesr) {
  const source = freesr && typeof freesr === 'object' ? freesr : {};
  const avatars = {};

  Object.entries(source.avatars || {}).forEach(([key, avatar]) => {
    if (!avatar || typeof avatar !== 'object') return;
    const avatarId = num(avatar.avatar_id, num(key));
    if (!avatarId) return;
    const skills = { ...(avatar.data?.skills || {}) };
    const skillsByAnchorType = normalizeAnchorMap(avatar.data?.skills_by_anchor_type, skills);
    const exRanks = Array.isArray(avatar.data?.ex_rank_id_list) ? avatar.data.ex_rank_id_list.filter((id) => num(id) > 0) : [];

    avatars[String(avatarId)] = {
      owner_uid: num(avatar.owner_uid),
      avatar_id: avatarId,
      data: {
        rank: num(avatar.data?.rank),
        skills,
        ...(skillsByAnchorType ? { skills_by_anchor_type: skillsByAnchorType } : {}),
        ...(exRanks.length > 0 ? { ex_rank_id_list: exRanks } : {})
      },
      level: num(avatar.level),
      promotion: num(avatar.promotion),
      techniques: Array.isArray(avatar.techniques) ? avatar.techniques : [],
      sp_value: num(avatar.sp_value),
      sp_max: num(avatar.sp_max),
      ...(num(avatar.enhanced_id) > 0 ? { enhanced_id: num(avatar.enhanced_id) } : {})
    };
  });

  const lightcones = (Array.isArray(source.lightcones) ? source.lightcones : [])
    .filter((lc) => lc && num(lc.item_id) > 0)
    .map((lc, index) => ({
      level: num(lc.level),
      item_id: num(lc.item_id),
      equip_avatar: num(lc.equip_avatar),
      rank: num(lc.rank),
      promotion: num(lc.promotion),
      internal_uid: Number.isFinite(Number(lc.internal_uid)) ? num(lc.internal_uid) : index
    }));

  const relics = (Array.isArray(source.relics) ? source.relics : [])
    .filter((relic) => relic && num(relic.relic_id) > 0)
    .map((relic, index) => ({
      level: num(relic.level),
      relic_id: num(relic.relic_id),
      relic_set_id: num(relic.relic_set_id),
      main_affix_id: num(relic.main_affix_id),
      sub_affixes: (Array.isArray(relic.sub_affixes) ? relic.sub_affixes : [])
        .map((sub) => ({
          sub_affix_id: num(sub?.sub_affix_id),
          count: num(sub?.count),
          step: num(sub?.step)
        }))
        .filter((sub) => sub.sub_affix_id > 0),
      internal_uid: Number.isFinite(Number(relic.internal_uid)) ? num(relic.internal_uid) : index,
      equip_avatar: num(relic.equip_avatar)
    }));

  const payload = {
    lightcones,
    relics,
    avatars,
    battle_config: normalizeBattleConfig(source.battle_config)
  };
  if (Array.isArray(source.loadout) && source.loadout.length > 0) {
    payload.loadout = source.loadout;
  }
  return payload;
}
