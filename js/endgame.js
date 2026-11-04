// FireflyGo endgame (Monster Setting) helpers.
//
// The catalog is a compact extract of the Firefly SrTools client tables:
//   modes.<moc|pf|as>.groups[]  -> levels[] (floors) -> sides[]
//   modes.peak.groups[]         -> stages[]
//   monsters[id]                -> { name, rank, stance, weak, icon }
//
// Every helper here is pure so it can be unit tested with node:test.

export const FIREFLY_ENDGAME_CATALOG_URL = './assets/firefly-endgame.json';

export const ENDGAME_MODES = ['moc', 'pf', 'as', 'peak', 'custom'];

export const ENDGAME_BATTLE_TYPES = {
  moc: 'MOC',
  pf: 'PF',
  as: 'AS',
  peak: 'PEAK',
  custom: 'CE'
};

export function battleTypeForMode(mode) {
  return ENDGAME_BATTLE_TYPES[mode] || 'DEFAULT';
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function groupList(catalog, mode) {
  return Array.isArray(catalog?.modes?.[mode]?.groups) ? catalog.modes[mode].groups : [];
}

export function findGroup(catalog, mode, groupId) {
  const groups = groupList(catalog, mode);
  return groups.find((group) => Number(group.id) === Number(groupId)) || null;
}

export function findLevel(group, levelId) {
  const levels = Array.isArray(group?.levels) ? group.levels : [];
  return levels.find((level) => Number(level.id) === Number(levelId)) || null;
}

function newestGroup(catalog, mode) {
  const groups = groupList(catalog, mode);
  return groups.slice().sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
}

function highestLevel(group) {
  const levels = Array.isArray(group?.levels) ? group.levels : [];
  return levels.slice().sort((a, b) => Number(b.floor) - Number(a.floor))[0] || null;
}

/**
 * Picks the sensible default for a mode: newest season, highest floor and the
 * first side. Peak defaults to the boss stage because that is the room players
 * usually want to test.
 */
export function defaultEndgameSelection(catalog, mode) {
  if (mode === 'custom') {
    return {
      mode,
      customWaves: [[{ monster_id: 0, level: 80 }]],
      customCycle: 0
    };
  }

  const group = newestGroup(catalog, mode);
  if (!group) {
    return { mode, groupId: null, levelId: null, stageIndex: 0, side: 'firstNode', useCycle: true, useBuff: true };
  }

  if (mode === 'peak') {
    const stages = Array.isArray(group.stages) ? group.stages : [];
    const bossIndex = stages.findIndex((stage) => stage.kind === 'boss');
    return {
      mode,
      groupId: Number(group.id),
      stageIndex: bossIndex >= 0 ? bossIndex : Math.max(0, stages.length - 1),
      useCycle: true,
      useBuff: true
    };
  }

  const level = highestLevel(group);
  const sides = Array.isArray(level?.sides) ? level.sides : [];
  const side = sides.some((entry) => entry.side === 'firstNode') ? 'firstNode' : (sides[0]?.side || 'firstNode');
  return {
    mode,
    groupId: Number(group.id),
    levelId: level ? Number(level.id) : null,
    side,
    useCycle: true,
    useBuff: true
  };
}

/**
 * Resolves a selection against the catalog. Returns null when the catalog has
 * no group/stage for the requested mode.
 */
export function resolveEndgameSelection(catalog, selection) {
  const mode = selection?.mode;
  if (!ENDGAME_MODES.includes(mode)) return null;
  if (mode === 'custom') return { mode: 'custom', custom: true };

  const groups = groupList(catalog, mode);
  if (!groups.length) return null;
  const group = findGroup(catalog, mode, selection.groupId) || newestGroup(catalog, mode);
  if (!group) return null;

  if (mode === 'peak') {
    const stages = Array.isArray(group.stages) ? group.stages : [];
    if (!stages.length) return null;
    const rawIndex = num(selection.stageIndex, 0);
    const index = Math.min(Math.max(rawIndex, 0), stages.length - 1);
    return { mode, group, stage: stages[index], stageIndex: index };
  }

  const level = findLevel(group, selection.levelId) || highestLevel(group);
  if (!level) return null;
  const sides = Array.isArray(level.sides) ? level.sides : [];
  if (!sides.length) return null;
  const stage = sides.find((entry) => entry.side === selection.side) || sides[0];
  return { mode, group, level, sides, stage };
}

export function monsterInfo(catalog, monsterId) {
  return catalog?.monsters?.[String(monsterId)] || null;
}

/**
 * Rebuilds a selection from an existing battle_config.stage_id so the picker
 * opens on the room the save file is already using. Peak seasons are looked up
 * first in the group referenced by extra_data.challenge when given.
 */
export function findSelectionByStageId(catalog, mode, stageId, groupId = 0) {
  if (!ENDGAME_MODES.includes(mode) || mode === 'custom') return null;
  const groups = groupList(catalog, mode);
  if (!groups.length) return null;

  const preferred = Number(groupId) > 0 ? findGroup(catalog, mode, groupId) : null;
  const ordered = preferred ? [preferred, ...groups.filter((group) => group !== preferred)] : groups;
  const target = num(stageId);

  for (const group of ordered) {
    if (mode === 'peak') {
      const stages = Array.isArray(group.stages) ? group.stages : [];
      const index = stages.findIndex((stage) => Number(stage.stageId) === target);
      if (index >= 0) {
        return { mode, groupId: Number(group.id), stageIndex: index, useCycle: true, useBuff: true };
      }
      continue;
    }
    const levels = Array.isArray(group.levels) ? group.levels : [];
    for (const level of levels) {
      const sides = Array.isArray(level.sides) ? level.sides : [];
      const side = sides.find((entry) => Number(entry.stageId) === target);
      if (side) {
        return {
          mode,
          groupId: Number(group.id),
          levelId: Number(level.id),
          side: side.side,
          useCycle: true,
          useBuff: true
        };
      }
    }
  }
  return null;
}

function normalizeCustomWaves(waves) {
  if (!Array.isArray(waves)) return [];
  return waves
    .map((wave) => (Array.isArray(wave) ? wave : [])
      .map((entry) => {
        const id = num(entry?.monster_id ?? entry?.id ?? entry);
        if (!id) return null;
        return {
          monster_id: id,
          level: num(entry?.level, 80) || 80,
          amount: num(entry?.amount, 1) || 1
        };
      })
      .filter(Boolean))
    .filter((wave) => wave.length > 0);
}

/**
 * Builds the exact battle_config FireflyGo validates:
 *   blessings: [{ id, level }]
 *   monsters:  [[{ monster_id, level, amount }]]
 */
export function buildFireflyBattleConfig(catalog, selection) {
  const resolved = resolveEndgameSelection(catalog, selection);
  if (!resolved) return null;
  const type = battleTypeForMode(selection.mode);

  if (resolved.custom) {
    const waves = normalizeCustomWaves(selection.customWaves);
    if (!waves.length) return null;
    return {
      battle_type: type,
      blessings: [],
      custom_stats: [],
      cycle_count: num(selection.customCycle),
      stage_id: 0,
      path_resonance_id: 0,
      monsters: waves
    };
  }

  const { stage } = resolved;
  const waves = (Array.isArray(stage.waves) ? stage.waves : [])
    .map((wave) => wave
      .map((id) => Number(id))
      .filter((id) => id > 0)
      .map((id) => ({ monster_id: id, level: Number(stage.level) || 1, amount: 1 })))
    .filter((wave) => wave.length > 0);

  const blessings = [];
  if (selection.useBuff !== false) {
    const buffs = selection.mode === 'peak' ? stage.buffs : resolved.level?.buffs;
    for (const buff of Array.isArray(buffs) ? buffs : []) {
      const id = num(buff?.id);
      if (id > 0) blessings.push({ id, level: 1 });
    }
  }
  if (stage.invasionBuffId) {
    blessings.push({ id: Number(stage.invasionBuffId), level: 1 });
  }

  return {
    battle_type: type,
    blessings,
    custom_stats: [],
    cycle_count: selection.useCycle ? (num(stage.turnLimit) || num(resolved.level?.turnLimit)) : 0,
    stage_id: num(stage.stageId),
    path_resonance_id: 0,
    monsters: waves
  };
}

/**
 * Anomaly Arbitration is selected through extra_data.challenge, so the chosen
 * Peak season has to travel next to battle_config.
 */
export function buildFireflyChallenge(selection, current) {
  const challenge = current && typeof current === 'object' ? cloneJson(current) : {};
  challenge.skip_node = num(challenge.skip_node);
  challenge.challenge_peak_group_id = num(challenge.challenge_peak_group_id);
  challenge.challenge_peak_group_id_list = Array.isArray(challenge.challenge_peak_group_id_list)
    ? challenge.challenge_peak_group_id_list.map((id) => num(id)).filter((id) => id > 0)
    : [];

  if (selection?.mode === 'peak') {
    const groupId = num(selection.groupId);
    if (groupId > 0) {
      challenge.challenge_peak_group_id = groupId;
      challenge.challenge_peak_group_id_list = [groupId];
    }
  }
  return challenge;
}

export function summarizeEndgameSelection(catalog, selection) {
  const resolved = resolveEndgameSelection(catalog, selection);
  if (!resolved) return null;
  if (resolved.custom) {
    const waves = normalizeCustomWaves(selection.customWaves);
    return {
      mode: 'custom',
      battleType: battleTypeForMode('custom'),
      stageId: 0,
      waveCount: waves.length,
      monsterCount: waves.reduce((sum, wave) => sum + wave.length, 0),
      blessings: 0,
      cycleCount: num(selection.customCycle)
    };
  }
  const { stage } = resolved;
  const waves = Array.isArray(stage.waves) ? stage.waves : [];
  const buffs = (selection.useBuff !== false ? (selection.mode === 'peak' ? stage.buffs : resolved.level?.buffs) : []) || [];
  return {
    mode: selection.mode,
    battleType: battleTypeForMode(selection.mode),
    stageId: num(stage.stageId),
    stageLevel: num(stage.level),
    waveCount: waves.length,
    monsterCount: waves.reduce((sum, wave) => sum + (wave?.length || 0), 0),
    blessings: (Array.isArray(buffs) ? buffs.length : 0) + (stage.invasionBuffId ? 1 : 0),
    cycleCount: selection.useCycle ? (num(stage.turnLimit) || num(resolved.level?.turnLimit)) : 0,
    groupId: num(resolved.group?.id),
    groupName: resolved.group?.name || null,
    floor: resolved.level ? num(resolved.level.floor) : 0,
    side: stage.side || ''
  };
}
