// Enka.network (Honkai: Star Rail) -> FreeSR JSON conversion.
//
// The field mapping mirrors Firefly_Srtools' converter so the resulting file is
// accepted verbatim by FireflyGo (POST /sync) as well as by GaCy's /api/freesr.

export const ENKA_UID_PATTERN = /^\d{8,10}$/;

export const FREE_SR_DEFAULT_BATTLE_CONFIG = {
  battle_type: 'DEFAULT',
  blessings: [],
  custom_stats: [],
  cycle_count: 0,
  stage_id: 0,
  path_resonance_id: 0,
  monsters: []
};

// Meta-game defaults used when Enka does not expose the value.
const DEFAULT_SP_MAX = 140;
const DEFAULT_SP_VALUE = 70;

const ANCHOR_BY_SUFFIX = {
  '001': '1', // basic attack
  '002': '2', // skill
  '003': '3', // ultimate
  '004': '4', // talent
  '007': '5', // technique
  '101': '6', // bonus ability A2
  '102': '7', // bonus ability A4
  '103': '8' // bonus ability A6
};

export function normalizeEnkaUid(value) {
  const uid = String(value ?? '').trim();
  return ENKA_UID_PATTERN.test(uid) ? uid : '';
}

// Enka trace ids look like <avatarId><anchor>, e.g. 1506001 / 1506101 / 1506203.
export function anchorTypeForPointId(pointId) {
  const suffix = String(pointId).slice(-3);
  if (ANCHOR_BY_SUFFIX[suffix]) return ANCHOR_BY_SUFFIX[suffix];
  // Stat traces (2xx) all collapse into the single "stats" anchor.
  if (/^2\d{2}$/.test(suffix)) return '9';
  return '';
}

export function skillMapsFromEnka(skillTreeList) {
  const skills = {};
  const anchor = {};
  (Array.isArray(skillTreeList) ? skillTreeList : []).forEach((entry) => {
    const pointId = Number(entry?.pointId);
    if (!pointId) return;
    const level = Number(entry?.level) || 0;
    skills[String(pointId)] = level;
    const anchorType = anchorTypeForPointId(pointId);
    if (!anchorType) return;
    // Keep the highest level seen for an anchor slot (stat traces repeat).
    if (anchor[anchorType] === undefined || level > anchor[anchorType]) {
      anchor[anchorType] = level;
    }
  });
  return { skills, skillsByAnchorType: anchor };
}

// FreeSR relic set ids are the relic id without its leading rarity digit and
// trailing slot digit (61011 -> 6101 style, same as Firefly_Srtools).
export function relicSetIdFromTid(tid) {
  const digits = String(Math.trunc(Number(tid) || 0));
  if (digits.length < 3) return 0;
  return Number(digits.slice(1, -1)) || 0;
}

export function relicSlotFromTid(tid) {
  const digits = String(Math.trunc(Number(tid) || 0));
  return digits ? Number(digits.slice(-1)) || 0 : 0;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function enkaAvatarToFreeSR(avatar, ownerUid = 0) {
  const avatarId = toNumber(avatar?.avatarId);
  if (!avatarId) return null;

  const { skills, skillsByAnchorType } = skillMapsFromEnka(avatar.skillTreeList);
  return {
    avatar: {
      owner_uid: toNumber(ownerUid),
      avatar_id: avatarId,
      data: {
        rank: toNumber(avatar.rank),
        skills,
        skills_by_anchor_type: skillsByAnchorType
      },
      level: toNumber(avatar.level, 1),
      promotion: toNumber(avatar.promotion),
      techniques: [],
      sp_value: DEFAULT_SP_VALUE,
      sp_max: DEFAULT_SP_MAX
    }
  };
}

export function enkaLightconeToFreeSR(avatar, internalUid = 0) {
  const equipment = avatar?.equipment;
  const itemId = toNumber(equipment?.tid);
  if (!itemId) return null;
  return {
    level: toNumber(equipment.level),
    item_id: itemId,
    equip_avatar: toNumber(avatar.avatarId),
    rank: toNumber(equipment.rank, 1),
    promotion: toNumber(equipment.promotion),
    internal_uid: internalUid
  };
}

export function enkaRelicToFreeSR(avatar, relic, internalUid = 0) {
  const relicId = toNumber(relic?.tid);
  if (!relicId) return null;
  const subAffixes = (Array.isArray(relic.subAffixList) ? relic.subAffixList : [])
    .map((sub) => ({
      sub_affix_id: toNumber(sub?.affixId),
      count: toNumber(sub?.cnt),
      step: toNumber(sub?.step)
    }))
    .filter((sub) => sub.sub_affix_id > 0);
  return {
    level: toNumber(relic.level),
    relic_id: relicId,
    relic_set_id: relicSetIdFromTid(relicId),
    main_affix_id: toNumber(relic.mainAffixId),
    sub_affixes: subAffixes,
    internal_uid: internalUid,
    equip_avatar: toNumber(avatar.avatarId)
  };
}

/**
 * Accepts either the raw enka.network payload, a Firefly `/api/enka` envelope
 * (`{ok:true, data}`), or an already-exported FreeSR file.
 */
export function unwrapEnkaPayload(body) {
  if (!body || typeof body !== 'object') return null;
  if (body.ok === true && body.data && typeof body.data === 'object') return body.data;
  if (body.detailInfo && typeof body.detailInfo === 'object') return body;
  if (body.data && typeof body.data === 'object' && body.data.detailInfo) return body.data;
  return null;
}

export function enkaToFreeSR(body, { ownerUid = 0 } = {}) {
  const payload = unwrapEnkaPayload(body);
  const detail = payload?.detailInfo;
  if (!detail || !Array.isArray(detail.avatarDetailList)) {
    throw new Error('ENKA_NO_AVATARS');
  }

  const avatars = {};
  const lightcones = [];
  const relics = [];
  let lightconeUid = 0;
  let relicUid = 0;

  detail.avatarDetailList.forEach((entry) => {
    const converted = enkaAvatarToFreeSR(entry, ownerUid);
    if (!converted) return;
    const { avatar } = converted;
    avatars[String(avatar.avatar_id)] = avatar;

    const lightcone = enkaLightconeToFreeSR(entry, lightconeUid);
    if (lightcone) {
      lightcones.push(lightcone);
      lightconeUid += 1;
    }

    (Array.isArray(entry.relicList) ? entry.relicList : []).forEach((relic) => {
      const parsed = enkaRelicToFreeSR(entry, relic, relicUid);
      if (!parsed) return;
      relics.push(parsed);
      relicUid += 1;
    });
  });

  if (Object.keys(avatars).length === 0) {
    throw new Error('ENKA_NO_AVATARS');
  }

  return {
    avatars,
    lightcones,
    relics,
    battle_config: { ...FREE_SR_DEFAULT_BATTLE_CONFIG, blessings: [], custom_stats: [], monsters: [] }
  };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Merge freshly imported characters into an existing FreeSR document.
 * `replace` throws the previous character/gear list away but keeps the battle
 * configuration so a sync never silently resets the active challenge.
 */
export function mergeFreeSR(base, incoming, mode = 'merge') {
  const next = mode === 'replace'
    ? { avatars: {}, lightcones: [], relics: [] }
    : {
      ...(base && typeof base === 'object' ? cloneJson(base) : {}),
      avatars: { ...(base?.avatars || {}) },
      lightcones: [...(base?.lightcones || [])],
      relics: [...(base?.relics || [])]
    };

  const incomingAvatars = incoming?.avatars || {};
  const incomingIds = new Set(Object.keys(incomingAvatars).map(Number));

  // Drop gear equipped by characters we are about to overwrite.
  next.lightcones = next.lightcones.filter((lc) => !incomingIds.has(Number(lc?.equip_avatar)));
  next.relics = next.relics.filter((relic) => !incomingIds.has(Number(relic?.equip_avatar)));

  Object.assign(next.avatars, incomingAvatars);
  next.lightcones = next.lightcones.concat(incoming?.lightcones || []);
  next.relics = next.relics.concat(incoming?.relics || []);

  if (!next.battle_config) {
    next.battle_config = base?.battle_config
      ? cloneJson(base.battle_config)
      : { ...FREE_SR_DEFAULT_BATTLE_CONFIG };
  }
  if (!Array.isArray(next.lightcones)) next.lightcones = [];
  if (!Array.isArray(next.relics)) next.relics = [];

  return next;
}

export function countFreeSRContent(freesr) {
  return {
    avatars: Object.keys(freesr?.avatars || {}).length,
    lightcones: (freesr?.lightcones || []).length,
    relics: (freesr?.relics || []).length
  };
}
