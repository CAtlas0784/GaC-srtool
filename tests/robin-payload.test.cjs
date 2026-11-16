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
  assert.equal('relic_set_id' in payload.relics[0], false);
  assert.equal('owner_uid' in payload.avatars['1506'], false);
  assert.equal('ex_rank_id_list' in payload.avatars['1506'].data, false);
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
      cycle_count: 0, stage_id: 0, path_resonance_id: 0, monsters: []
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
