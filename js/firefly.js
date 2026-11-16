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

/**
 * Decides what a POST /sync reply means, the same way the reference client
 * (Firefly_Srtools) does. FireflyGo can answer HTTP 200 while reporting a
 * failure in the body, and servers without /sync answer with an SDK envelope
 * or an HTML page, so the HTTP status alone proves nothing.
 *
 * Returns { kind, message } where kind is:
 *   'ok'           - a /sync reply that accepted the request
 *   'error'        - a /sync reply reporting a failure (message says why)
 *   'sdk-fallback' - { retcode, ... } from a server without /sync
 *   'html'         - an HTML page (wrong server or a proxy error page)
 *   'unknown'      - anything else
 */
export function inspectFireflyReply(parsed, text = '') {
  if (String(text ?? '').trim().startsWith('<')) return { kind: 'html', message: '' };
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { kind: 'unknown', message: '' };

  const message = typeof parsed.message === 'string' ? parsed.message : '';
  if (typeof parsed.error === 'string' && parsed.error) return { kind: 'error', message: parsed.error };
  if (typeof parsed.status === 'number' && (parsed.status < 200 || parsed.status > 299)) {
    return { kind: 'error', message: message || `status ${parsed.status}` };
  }
  if (parsed.ok === false || parsed.success === false) return { kind: 'error', message };

  if ('status' in parsed || 'extra_data' in parsed || 'warnings' in parsed || 'stats' in parsed) {
    return { kind: 'ok', message };
  }
  if ('retcode' in parsed) return { kind: 'sdk-fallback', message };
  return { kind: 'unknown', message };
}

/**
 * The extra_data block as the reference client sends it: `multi_path` is left
 * out unless a path is actually chosen (sending zeros would reset it), and
 * `theory_craft.custom_lineup` is a list of strings.
 */
export function buildSyncExtraData(raw, { creativeMode = false } = {}) {
  const extra = normalizeExtraData(raw) || normalizeExtraData(FIREFLY_EXTRA_FALLBACK);
  const theory = extra.theory_craft || {};
  extra.theory_craft = {
    hp: theory.hp && typeof theory.hp === 'object' && !Array.isArray(theory.hp) ? theory.hp : {},
    cycle_count: num(theory.cycle_count),
    mode: creativeMode === true,
    stage_id: num(theory.stage_id),
    custom_lineup: numberList(theory.custom_lineup).map((id) => String(id))
  };

  const multiPath = extra.multi_path;
  const multiPathUnset = !multiPath || (!multiPath.main && !multiPath.march_7
    && multiPath.multi_path_main.length === 0 && multiPath.multi_path_march_7.length === 0);
  if (multiPathUnset) delete extra.multi_path;

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
 * Relic ids are <rarity><set id><slot> (61031 -> set 103, 63281 -> set 328).
 * The app's own relic builders never wrote a set id, and the servers store 0 as
 * "no set", so every set bonus was lost; derive it whenever it is missing.
 */
export function relicSetIdFromRelicId(relicId) {
  const digits = String(Math.trunc(Number(relicId) || 0));
  return digits.length < 3 ? 0 : Number(digits.slice(1, -1)) || 0;
}

/**
 * Puts items in the order the reference client (Firefly_Srtools) sends them:
 * equipped items first, by avatar id, then by slot (light cone, relic slots
 * 1-6). An avatar can hold one item per slot, so any extra item claiming an
 * occupied slot is sent unequipped. Items nobody wears follow, unchanged.
 */
function orderForSync(items, slotOf) {
  const taken = new Set();
  const equipped = [];
  const spare = [];
  items.forEach((item) => {
    const owner = num(item.equip_avatar);
    const key = `${owner}:${slotOf(item)}`;
    if (owner > 0 && !taken.has(key)) {
      taken.add(key);
      equipped.push(item);
    } else {
      spare.push(owner > 0 ? { ...item, equip_avatar: 0 } : item);
    }
  });
  equipped.sort((a, b) => num(a.equip_avatar) - num(b.equip_avatar) || slotOf(a) - slotOf(b));
  return [...equipped, ...spare];
}

/**
 * Converts the app's FreeSR snapshot into the payload FireflyGo's reference
 * client (Firefly_Srtools converterToFreeSRJson) produces: avatars keyed by id,
 * flat lightcone/relic arrays, and a stripped battle_config.
 *
 * internal_uid is renumbered on every push, one counter per list starting at
 * 0, exactly like the reference client. The app's own uids only ever grow (the
 * relic presets use "highest uid + 1"), and FireflyGo builds the in-game bag
 * from these numbers, so sending the stored ones left equipment out of step
 * with the game. `loadout` is not sent: the reference client never sends it and
 * it would point at the old uids.
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

  const lightcones = orderForSync((Array.isArray(source.lightcones) ? source.lightcones : [])
    .filter((lc) => lc && num(lc.item_id) > 0), () => 0)
    .map((lc, index) => ({
      level: num(lc.level),
      item_id: num(lc.item_id),
      equip_avatar: num(lc.equip_avatar),
      rank: num(lc.rank),
      promotion: num(lc.promotion),
      internal_uid: index
    }));

  const relics = orderForSync((Array.isArray(source.relics) ? source.relics : [])
    .filter((relic) => relic && num(relic.relic_id) > 0), (relic) => num(relic.relic_id) % 10)
    .map((relic, index) => ({
      level: num(relic.level),
      relic_id: num(relic.relic_id),
      relic_set_id: num(relic.relic_set_id) || relicSetIdFromRelicId(relic.relic_id),
      main_affix_id: num(relic.main_affix_id),
      sub_affixes: (Array.isArray(relic.sub_affixes) ? relic.sub_affixes : [])
        .map((sub) => ({
          sub_affix_id: num(sub?.sub_affix_id),
          count: num(sub?.count),
          step: num(sub?.step)
        }))
        .filter((sub) => sub.sub_affix_id > 0),
      internal_uid: index,
      equip_avatar: num(relic.equip_avatar)
    }));

  const payload = {
    lightcones,
    relics,
    avatars,
    battle_config: normalizeBattleConfig(source.battle_config)
  };
  return payload;
}
