const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '../js/firefly.js'));

async function load() {
  return import(moduleUrl.href);
}

function sampleFreesr() {
  return {
    // Unknown top-level keys must not leak into the /sync payload.
    lineups: { 0: 1506 },
    scene: { plane_id: 1 },
    avatars: {
      1506: {
        avatar_id: 1506,
        owner_uid: 800000000,
        level: 80,
        promotion: 6,
        sp_value: 70,
        sp_max: 140,
        techniques: [1, 2],
        enhanced_id: 0,
        data: {
          rank: 2,
          skills: { 1506001: 6, 1506002: 10, 1506201: 1 },
          skills_by_anchor_type: { 1: 6, 2: 10 },
          ex_rank_id_list: [5501, 0]
        }
      }
    },
    lightcones: [
      { item_id: 23001, level: 80, promotion: 6, rank: 1, equip_avatar: 1506, internal_uid: 0 },
      { item_id: 0, equip_avatar: 0 }
    ],
    relics: [
      {
        relic_id: 61011,
        relic_set_id: 101,
        level: 15,
        main_affix_id: 1,
        equip_avatar: 1506,
        internal_uid: 0,
        sub_affixes: [
          { sub_affix_id: 2, count: 3, step: 0 },
          { sub_affix_id: 0, count: 1, step: 0 }
        ]
      }
    ],
    battle_config: {
      battle_type: 'MOC',
      blessings: [1, 2],
      custom_stats: [],
      cycle_count: 3,
      stage_id: 12,
      path_resonance_id: 0,
      monsters: [[1002010, 1]],
      custom_battle_lineup: { 0: 1506 },
      unknown_key: 'drop me'
    },
    loadout: [{ avatar_id: 1506 }]
  };
}

test('fireflySyncUrl always resolves to a /sync endpoint', async () => {
  const { fireflySyncUrl, FIREFLY_DEFAULT_BASE_URL } = await load();
  assert.equal(fireflySyncUrl('http://localhost:21000'), 'http://localhost:21000/sync');
  assert.equal(fireflySyncUrl('http://localhost:21000/'), 'http://localhost:21000/sync');
  assert.equal(fireflySyncUrl('http://localhost:21000/sync'), 'http://localhost:21000/sync');
  assert.equal(fireflySyncUrl('http://localhost:21000/SYNC'), 'http://localhost:21000/SYNC');
  assert.equal(fireflySyncUrl(''), `${FIREFLY_DEFAULT_BASE_URL}/sync`);
  assert.equal(fireflySyncUrl(null), `${FIREFLY_DEFAULT_BASE_URL}/sync`);
  assert.equal(fireflySyncUrl('   '), `${FIREFLY_DEFAULT_BASE_URL}/sync`);
});

test('normalizeExtraData coerces the server payload into the FireflyGo shape', async () => {
  const { normalizeExtraData } = await load();
  const extra = normalizeExtraData({
    multi_path: { main: '3', march_7: 1, multi_path_main: '1, 2 ,3', multi_path_march_7: [4] },
    setting: { censorship: 1, cm: 'true', first_person: 0, hide_ui: false, invasion_percent: '25' },
    challenge: { skip_node: '2', challenge_peak_group_id: 7, challenge_peak_group_id_list: '8,9' },
    theory_craft: { hp: { 1001: [12000] }, cycle_count: '2', mode: 'true', stage_id: '5', custom_lineup: [1001, 1002] },
    lua: 42
  });

  assert.deepEqual(extra.multi_path, {
    main: 3,
    march_7: 1,
    multi_path_main: [1, 2, 3],
    multi_path_march_7: [4]
  });
  assert.deepEqual(extra.setting, {
    censorship: true,
    cm: true,
    first_person: false,
    hide_ui: false,
    invasion_percent: 25
  });
  assert.deepEqual(extra.challenge, {
    skip_node: 2,
    challenge_peak_group_id: 7,
    challenge_peak_group_id_list: [8, 9]
  });
  assert.deepEqual(extra.theory_craft, {
    hp: { 1001: [12000] },
    cycle_count: 2,
    mode: true,
    stage_id: 5,
    custom_lineup: [1001, 1002]
  });
  assert.equal(extra.lua, '42');
});

test('normalizeExtraData fills missing blocks and rejects empty input', async () => {
  const { normalizeExtraData } = await load();
  assert.equal(normalizeExtraData(null), null);
  assert.equal(normalizeExtraData('nope'), null);
  assert.equal(normalizeExtraData([]), null);

  const extra = normalizeExtraData({});
  assert.deepEqual(extra.multi_path, { main: 0, march_7: 0, multi_path_main: [], multi_path_march_7: [] });
  assert.deepEqual(extra.challenge, { skip_node: 0, challenge_peak_group_id: 0, challenge_peak_group_id_list: [] });
  assert.equal(extra.lua, null);
  assert.equal(extra.theory_craft, undefined);
});

test('buildSyncPayload emits the FreeSR shape FireflyGo expects', async () => {
  const { buildSyncPayload } = await load();
  const payload = buildSyncPayload(sampleFreesr());

  assert.deepEqual(Object.keys(payload).sort(), ['avatars', 'battle_config', 'lightcones', 'loadout', 'relics']);
  assert.equal(payload.extra_data, undefined);

  const avatar = payload.avatars['1506'];
  assert.equal(avatar.avatar_id, 1506);
  assert.equal(avatar.level, 80);
  assert.equal(avatar.sp_max, 140);
  assert.deepEqual(avatar.techniques, [1, 2]);
  // enhanced_id 0 must not be sent.
  assert.equal('enhanced_id' in avatar, false);
  // Zero ex-ranks are filtered out.
  assert.deepEqual(avatar.data.ex_rank_id_list, [5501]);
  assert.deepEqual(avatar.data.skills_by_anchor_type, { 1: 6, 2: 10 });

  // Gear without an item id is dropped.
  assert.equal(payload.lightcones.length, 1);
  assert.equal(payload.lightcones[0].item_id, 23001);

  assert.equal(payload.relics.length, 1);
  assert.deepEqual(payload.relics[0].sub_affixes, [{ sub_affix_id: 2, count: 3, step: 0 }]);

  // Unknown battle_config keys such as custom_battle_lineup are stripped and
  // the blessing/monster arrays are coerced into FireflyGo's zod shape.
  assert.deepEqual(payload.battle_config, {
    battle_type: 'MOC',
    blessings: [{ id: 1, level: 1 }, { id: 2, level: 1 }],
    custom_stats: [],
    cycle_count: 3,
    stage_id: 12,
    path_resonance_id: 0,
    monsters: [[{ monster_id: 1002010, level: 1, amount: 1 }, { monster_id: 1, level: 1, amount: 1 }]]
  });
});

test('buildSyncPayload normalises detailed blessings and monster waves', async () => {
  const { buildSyncPayload } = await load();
  const payload = buildSyncPayload({
    battle_config: {
      battle_type: 'PEAK',
      blessings: [
        { id: 3034002, level: '2', dynamic_key: { key: 'abc', value: '4' } },
        { id: 0, level: 1 },
        { id: '3001' }
      ],
      cycle_count: '6',
      stage_id: '30127123',
      monsters: [
        [
          { monster_id: 4033010, level: 92, amount: 2 },
          { monster_id: 0, level: 1 },
          { monster_id: '4033020', level: '95' }
        ],
        [],
        [4044010]
      ]
    }
  });

  assert.deepEqual(payload.battle_config.blessings, [
    { id: 3034002, level: 2, dynamic_key: { key: 'abc', value: 4 } },
    { id: 3001, level: 1 }
  ]);
  assert.deepEqual(payload.battle_config.monsters, [
    [
      { monster_id: 4033010, level: 92, amount: 2 },
      { monster_id: 4033020, level: 95, amount: 1 }
    ],
    [{ monster_id: 4044010, level: 1, amount: 1 }]
  ]);
  assert.equal(payload.battle_config.cycle_count, 6);
  assert.equal(payload.battle_config.stage_id, 30127123);
});

test('buildSyncPayload derives the anchor map when the save has none', async () => {
  const { buildSyncPayload } = await load();
  const payload = buildSyncPayload({
    avatars: {
      1001: {
        avatar_id: 1001,
        data: { rank: 6, skills: { 1001001: 6, 1001002: 10, 1001103: 1, 1001201: 1, 1001202: 1 } }
      }
    },
    lightcones: [],
    relics: []
  });
  assert.deepEqual(payload.avatars['1001'].data.skills_by_anchor_type, {
    1: 6, 2: 10, 9: 1, 8: 1
  });
});

test('buildSyncPayload survives empty or malformed documents', async () => {
  const { buildSyncPayload } = await load();
  const empty = buildSyncPayload(null);
  assert.deepEqual(empty.avatars, {});
  assert.deepEqual(empty.lightcones, []);
  assert.deepEqual(empty.relics, []);
  assert.equal(empty.battle_config.battle_type, 'DEFAULT');

  const malformed = buildSyncPayload({ avatars: { 1: null, 2: { avatar_id: 0 } } });
  assert.deepEqual(malformed.avatars, {});
});
