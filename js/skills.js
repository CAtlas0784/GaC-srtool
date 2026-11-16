// Skill-tree points: which points a character has and how high each can go.
//
// Every preset used to write the same eight or nine points, so anything added
// to the game later (the Elation skill, the memosprite skills, ...) stayed at
// level 0. The rules below come from the StarRailRes character_skill_trees
// table (point id = <avatar id><suffix>):
//
//   suffix  anchor  max  what it is
//   001     1       6    basic attack
//   002-004 2-4     10   skill / ultimate / talent
//   007     5       1    technique
//   101-103 6-8     1    major traces
//   201-210 9-18    1    stat traces
//   301-302 19-20   6    memosprite skill / talent        (Remembrance)
//   501     21      1    unique ability                   (Trailblazer, Remembrance)
//   420     22      10   Elation skill                    (Elation)
//   601     23      1    unique ability                   (Aeon * Aha)
//
// A new character type that adds more points needs a row here.

const BASE_SUFFIXES = ['001', '002', '003', '004', '007', '101', '102', '103'];
const STAT_SUFFIXES = ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210'];

export const SKILL_POINT_ANCHORS = {
  '001': 1, '002': 2, '003': 3, '004': 4, '007': 5, '101': 6, '102': 7, '103': 8,
  '201': 9, '202': 10, '203': 11, '204': 12, '205': 13, '206': 14, '207': 15, '208': 16, '209': 17, '210': 18,
  '301': 19, '302': 20, '501': 21, '420': 22, '601': 23
};

// Extra points granted by a path, and by individual characters on top of that.
const PATH_EXTRA_POINTS = {
  Elation: ['420'],
  Remembrance: ['301', '302'],
  Memory: ['301', '302']
};
const AVATAR_EXTRA_POINTS = {
  1511: ['601'],
  8007: ['501'],
  8008: ['501']
};

/** Highest base level a point can hold, from the last three digits of its id. */
export function skillPointMaxLevel(pointId) {
  const suffix = String(pointId).slice(-3);
  if (suffix === '001' || suffix === '301' || suffix === '302') return 6;
  if (suffix === '002' || suffix === '003' || suffix === '004' || suffix === '420') return 10;
  return 1;
}

/** Every point suffix this character has, base points first. */
export function skillPointSuffixes(avatarId, path = '') {
  return [
    ...BASE_SUFFIXES,
    ...STAT_SUFFIXES,
    ...(PATH_EXTRA_POINTS[path] || []),
    ...(AVATAR_EXTRA_POINTS[Number(avatarId)] || [])
  ];
}

// Characters with an enhanced form store their points under a longer prefix
// (1217 -> "11217001"); keep whatever prefix the save already uses.
function pointPrefix(skills, avatarId) {
  const existing = Object.keys(skills).find((key) => key.length > 3 && key.endsWith('001'));
  return existing ? existing.slice(0, -3) : String(avatarId);
}

/**
 * Fills a character's `data` block (`{ skills, skills_by_anchor_type }`) with
 * every skill point it has.
 *
 *   keepExisting false: every point is set to its maximum.
 *   keepExisting true : points already in the save keep their level (capped to
 *                       the maximum); only missing points are added at maximum.
 *
 * The anchor map is rebuilt from the skill levels so both stay in agreement.
 */
export function maxAvatarSkills(data, avatarId, path = '', { keepExisting = false } = {}) {
  const target = data && typeof data === 'object' ? data : {};
  const skills = target.skills && typeof target.skills === 'object' && !Array.isArray(target.skills) ? target.skills : {};
  const anchors = target.skills_by_anchor_type && typeof target.skills_by_anchor_type === 'object'
    && !Array.isArray(target.skills_by_anchor_type) ? target.skills_by_anchor_type : {};
  const prefix = pointPrefix(skills, avatarId);

  for (const suffix of skillPointSuffixes(avatarId, path)) {
    const key = `${prefix}${suffix}`;
    const max = skillPointMaxLevel(key);
    const current = Number(skills[key]);
    skills[key] = keepExisting && Number.isFinite(current) ? Math.min(max, Math.max(0, Math.trunc(current))) : max;
    anchors[String(SKILL_POINT_ANCHORS[suffix])] = skills[key];
  }

  target.skills = skills;
  target.skills_by_anchor_type = anchors;
  return target;
}
