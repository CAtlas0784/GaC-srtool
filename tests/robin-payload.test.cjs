const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '../js/robin.js'));

async function load() {
  return import(moduleUrl.href);
}

function sampleFreesr() {
  return {
    // Top-level keys RobinSR skips on deserialize must not be sent.
    lineups: { 0: 1506 },
    scene: { plane_id: 1 },
    loadout: [{ name: 'x' }],
    avatars: {
      1506: {
        avatar_id: 1506,
        owner_uid: 800000000,
        level: 80.7,
        promotion: 6,
        sp_value: 70,
        sp_max: 140,
        techniques: [1, '2', null],
        enhanced_id: 0,
        data: {
          rank: -1,
          skills: { 1506001: 6, 1506002: '10' },
          ex_rank_id_list: [5501]
        }
      },
      1502: {
        avatar_id: 1502,
        level: 80,
        promotion: 6,
        techniques: [],
        data: { rank: 0, skills: {} }
      }
    },
    lightcones: [
      { item_id: 23001, level: 80, promotion: 6, rank: 1, equip_avatar: 1506, internal_uid: 0 }
    ],
    relics: [
      {
        relic_id: 61011, relic_set_id: 101, level: 15, main_affix_id: 1, equip_avatar: 1506, internal_uid: 3,
        sub_affixes: [{ sub_affix_id: 5, count: 2, step: 1 }, { sub_affix_id: 0, count: 1, step: 0 }]
      }
    ],
    battle_config: {
      battle_type: 'moc',
      blessings: [{ id: 100, level: 1, dynamic_key: { key: 7, value: 3 } }],
      custom_stats: [{ sub_affix_id: 4, count: 1, step: 2 }, 'junk'],
      cycle_count: 5,
      stage_id: 30101,
      path_resonance_id: 0,
      monsters: [[{ monster_id: 8001, level: 90, amount: 3, max_hp: 1000 }, { monster_id: 8002, level: 80 }]],
      custom_battle_lineup: [1506, 0, 1502]
    }
  };
}

test('robinSrtoolsUrl appends /srtools once', async () => {
  const { robinSrtoolsUrl } = await load();
  assert.equal(robinSrtoolsUrl('http://localhost:21000'), 'http://localhost:21000/srtools');
  assert.equal(robinSrtoolsUrl('http://localhost:21000/'), 'http://localhost:21000/srtools');
  assert.equal(robinSrtoolsUrl('http://localhost:21000/srtools'), 'http://localhost:21000/srtools');
  assert.equal(robinSrtoolsUrl(''), 'http://localhost:21000/srtools');
});

test('payload only carries the keys RobinSR deserializes', async () => {
  const { buildRobinPayload } = await load();
  const payload = buildRobinPayload(sampleFreesr());
  assert.deepEqual(Object.keys(payload).sort(), ['avatars', 'battle_config', 'lightcones', 'relics']);
  // ppSR stores relic_set_id and treats 0 as "no set", so it must be sent.
  assert.equal(payload.relics[0].relic_set_id, 101);
  assert.equal('owner_uid' in payload.avatars['1506'], false);
  assert.equal('ex_rank_id_list' in payload.avatars['1506'].data, false);
});

test('relic set id is derived from the relic id when the save has none', async () => {
  const { buildRobinPayload } = await load();
  const payload = buildRobinPayload({
    relics: [
      { relic_id: 61031, level: 15, main_affix_id: 1, equip_avatar: 1001, internal_uid: 7, sub_affixes: [] },
      { relic_id: 63281, relic_set_id: 0, level: 15, main_affix_id: 1, equip_avatar: 0, internal_uid: 7, sub_affixes: [] }
    ],
    lightcones: [
      { item_id: 21001, level: 80, promotion: 6, rank: 1, equip_avatar: 1001, internal_uid: 5 },
      { item_id: 21002, level: 80, promotion: 6, rank: 1, equip_avatar: 1002, internal_uid: 5 }
    ]
  });
  assert.deepEqual(payload.relics.map((r) => r.relic_set_id), [103, 328]);
  // Duplicate internal_uids would make one item replace another on the server.
  assert.deepEqual(payload.relics.map((r) => r.internal_uid), [0, 1]);
  assert.deepEqual(payload.lightcones.map((l) => l.internal_uid), [0, 1]);
});

test('endgame picker battle types map to names RobinSR accepts', async () => {
  const { buildRobinPayload } = await load();
  const type = (battle_type) => buildRobinPayload({ battle_config: { battle_type } }).battle_config.battle_type;
  assert.equal(type('PEAK'), 'AA');
  assert.equal(type('CE'), 'DEFAULT');
  assert.equal(type('PF'), 'PF');
  assert.equal(type('AS'), 'AS');
});

test('custom waves get a real stage id so the client can load the battle', async () => {
  const { buildRobinPayload, ROBIN_DEFAULT_STAGE_ID } = await load();
  const config = buildRobinPayload({
    battle_config: {
      battle_type: 'CE', stage_id: 0, cycle_count: 10,
      monsters: [[{ monster_id: 1002030, level: 80, amount: 1 }, { monster_id: 4044010, level: 80, amount: 1 }]]
    }
  }).battle_config;
  assert.equal(config.stage_id, ROBIN_DEFAULT_STAGE_ID);
  assert.equal(config.battle_type, 'DEFAULT');
  assert.deepEqual(config.monsters, [[{ level: 80, monster_id: 1002030 }, { level: 80, monster_id: 4044010 }]]);
  // A stage picked from the endgame catalog is kept as is.
  assert.equal(buildRobinPayload({ battle_config: { stage_id: 30101 } }).battle_config.stage_id, 30101);
});

test('skill levels are capped per point so the battle can start', async () => {
  const { buildRobinPayload } = await load();
  const { skillPointMaxLevel } = await import(pathToFileURL(path.join(__dirname, '../js/skills.js')).href);
  const skills = buildRobinPayload({
    avatars: { 1512: { avatar_id: 1512, level: 80, promotion: 6, techniques: [], data: { rank: 6, skills: {
      1512001: 10, 1512002: 10, 1512003: 10, 1512004: 10, 1512007: 10, 1512101: 10, 1512201: 10, 1512301: 10, 1512302: 10, 1512103: 0
    } } } }
  }).avatars['1512'].data.skills;
  assert.deepEqual(skills, {
    1512001: 6, 1512002: 10, 1512003: 10, 1512004: 10, 1512007: 1, 1512101: 1, 1512103: 1, 1512201: 1, 1512301: 6, 1512302: 6
  });
  // Enhanced characters prefix the point id; the cap still follows the suffix.
  assert.equal(skillPointMaxLevel('11217001'), 6);
  assert.equal(skillPointMaxLevel('11217210'), 1);
});

test('the Elation skill is not capped to a trace level and its anchor follows', async () => {
  const { buildRobinPayload } = await load();
  const data = buildRobinPayload({
    avatars: { 1501: { avatar_id: 1501, level: 80, promotion: 6, techniques: [], data: { rank: 0,
      skills: { 1501002: 10, 1501420: 10, 1501007: 7 }, skills_by_anchor_type: { 5: 7, 22: 3, 99: 4 } } } }
  }).avatars['1501'].data;
  assert.equal(data.skills['1501420'], 10);
  assert.equal(data.skills['1501007'], 1);
  // Anchors are recomputed from the capped skills; unknown ones pass through.
  assert.equal(data.skills_by_anchor_type['22'], 10);
  assert.equal(data.skills_by_anchor_type['5'], 1);
  assert.equal(data.skills_by_anchor_type['99'], 4);
});

test('every number is a non-negative integer', async () => {
  const { buildRobinPayload } = await load();
  const payload = buildRobinPayload(sampleFreesr());
  const avatar = payload.avatars['1506'];
  assert.equal(avatar.level, 80);
  assert.equal(avatar.data.rank, 0);
  assert.deepEqual(avatar.data.skills, { 1506001: 6, 1506002: 10 });
  assert.deepEqual(avatar.techniques, [1, 2]);
  assert.equal(avatar.sp_value, 70);
  assert.equal(avatar.sp_max, 140);
  assert.equal('enhanced_id' in avatar, false);
  // Optional sp fields stay absent when the save never had them.
  assert.equal('sp_value' in payload.avatars['1502'], false);
  assert.deepEqual(payload.relics[0].sub_affixes, [{ sub_affix_id: 5, count: 2, step: 1 }]);
});

test('battle_config matches the strict serde shape', async () => {
  const { buildRobinPayload } = await load();
  const config = buildRobinPayload(sampleFreesr()).battle_config;
  assert.equal(config.battle_type, 'MOC');
  assert.deepEqual(config.blessings, [{ level: 1, id: 100, dynamic_key: { key: '7', value: 3 } }]);
  assert.deepEqual(config.custom_stats, [{ sub_affix_id: 4, count: 1, step: 2 }]);
  // `amount` does not exist on RobinSR's Monster: a stack becomes repeats.
  assert.deepEqual(config.monsters, [[
    { level: 90, monster_id: 8001, max_hp: 1000 },
    { level: 90, monster_id: 8001, max_hp: 1000 },
    { level: 90, monster_id: 8001, max_hp: 1000 },
    { level: 80, monster_id: 8002 }
  ]]);
  // The lineup array becomes a { slot: avatarId } map; empty slots are dropped.
  assert.deepEqual(config.custom_battle_lineup, { 0: 1506, 2: 1502 });
});

test('unknown battle types and empty saves fall back to safe defaults', async () => {
  const { buildRobinPayload } = await load();
  const odd = buildRobinPayload({ battle_config: { battle_type: 'APOC' } });
  assert.equal(odd.battle_config.battle_type, 'DEFAULT');
  const empty = buildRobinPayload(null);
  assert.deepEqual(empty, {
    lightcones: [],
    relics: [],
    avatars: {},
    battle_config: {
      battle_type: 'DEFAULT', blessings: [], custom_stats: [],
      cycle_count: 0, stage_id: 201012311, path_resonance_id: 0,
      monsters: [[{ level: 60, monster_id: 3014022 }]]
    }
  });
});

test('classifyRobinReply tells RobinSR replies from other servers', async () => {
  const { classifyRobinReply } = await load();
  assert.equal(classifyRobinReply({ message: 'OK', status: 200 }), 'ok');
  assert.equal(classifyRobinReply({ message: 'failed to write freesr-data.json', status: 500 }), 'error');
  assert.equal(classifyRobinReply({ retcode: 0, message: 'OK', data: { token: 'x' } }), 'sdk-fallback');
  assert.equal(classifyRobinReply(null), 'unknown');
  assert.equal(classifyRobinReply({}), 'unknown');
  assert.equal(classifyRobinReply('OK'), 'unknown');
});
