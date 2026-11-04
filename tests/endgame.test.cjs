const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '../js/endgame.js'));

async function load() {
  return import(moduleUrl.href);
}

function sampleCatalog() {
  return {
    modes: {
      moc: {
        groups: [
          {
            id: 1000,
            name: { en: 'Old season' },
            levels: [
              {
                id: 5001,
                floor: 10,
                turnLimit: 24,
                buffs: [{ id: 900 }],
                sides: [{ side: 'firstNode', stageId: 9001, level: 80, waves: [[11]] }]
              }
            ]
          },
          {
            id: 1037,
            name: { en: 'Echo of Darkness' },
            levels: [
              {
                id: 5612,
                floor: 12,
                turnLimit: 30,
                buffs: [{ id: 1001 }],
                sides: [
                  {
                    side: 'firstNode',
                    stageId: 30127111,
                    level: 92,
                    waves: [[4033010, 4033020], [4044010]],
                    invasionBuffId: 3034002
                  },
                  { side: 'secondNode', stageId: 30127112, level: 95, waves: [[1003010]] }
                ]
              }
            ]
          }
        ]
      },
      pf: { groups: [] },
      as: { groups: [] },
      peak: {
        groups: [
          {
            id: 9,
            name: { en: 'Return of the Legion' },
            stages: [
              { kind: 'pre', stageId: 4001, level: 80, waves: [[11]], buffs: [] },
              { kind: 'boss', stageId: 4002, level: 90, waves: [[22]], buffs: [{ id: 2001 }] },
              { kind: 'hard', stageId: 4003, level: 95, waves: [[33]], buffs: [{ id: 2002 }] }
            ]
          }
        ]
      }
    },
    monsters: {
      11: { name: { en: 'Monster 11' }, icon: 'https://cdn.test/11.webp' },
      4033010: { name: { en: 'Monster 4033010' }, icon: 'https://cdn.test/4033010.webp' }
    }
  };
}

test('defaultEndgameSelection picks the newest season, highest floor and first side', async () => {
  const { defaultEndgameSelection } = await load();
  const selection = defaultEndgameSelection(sampleCatalog(), 'moc');
  assert.equal(selection.mode, 'moc');
  assert.equal(selection.groupId, 1037);
  assert.equal(selection.levelId, 5612);
  assert.equal(selection.side, 'firstNode');
  assert.equal(selection.useCycle, true);
  assert.equal(selection.useBuff, true);
});

test('defaultEndgameSelection defaults peak to the boss stage', async () => {
  const { defaultEndgameSelection } = await load();
  const selection = defaultEndgameSelection(sampleCatalog(), 'peak');
  assert.equal(selection.mode, 'peak');
  assert.equal(selection.groupId, 9);
  assert.equal(selection.stageIndex, 1);
});

test('buildFireflyBattleConfig builds the FireflyGo battle_config shape', async () => {
  const { buildFireflyBattleConfig, defaultEndgameSelection } = await load();
  const catalog = sampleCatalog();
  const config = buildFireflyBattleConfig(catalog, defaultEndgameSelection(catalog, 'moc'));

  assert.equal(config.battle_type, 'MOC');
  assert.equal(config.stage_id, 30127111);
  assert.equal(config.cycle_count, 30);
  assert.equal(config.path_resonance_id, 0);
  assert.deepEqual(config.custom_stats, []);
  assert.deepEqual(config.blessings, [
    { id: 1001, level: 1 },
    { id: 3034002, level: 1 }
  ]);
  assert.deepEqual(config.monsters, [
    [
      { monster_id: 4033010, level: 92, amount: 1 },
      { monster_id: 4033020, level: 92, amount: 1 }
    ],
    [{ monster_id: 4044010, level: 92, amount: 1 }]
  ]);
});

test('cycle and buff toggles remove the corresponding values', async () => {
  const { buildFireflyBattleConfig } = await load();
  const config = buildFireflyBattleConfig(sampleCatalog(), {
    mode: 'moc',
    groupId: 1037,
    levelId: 5612,
    side: 'secondNode',
    useCycle: false,
    useBuff: false
  });
  assert.equal(config.battle_type, 'MOC');
  assert.equal(config.stage_id, 30127112);
  assert.equal(config.cycle_count, 0);
  assert.deepEqual(config.blessings, []);
  assert.deepEqual(config.monsters, [[{ monster_id: 1003010, level: 95, amount: 1 }]]);
});

test('peak uses the selected stage index and reports PEAK', async () => {
  const { buildFireflyBattleConfig, buildFireflyChallenge } = await load();
  const catalog = sampleCatalog();
  const config = buildFireflyBattleConfig(catalog, {
    mode: 'peak',
    groupId: 9,
    stageIndex: 2,
    useCycle: true,
    useBuff: true
  });
  assert.equal(config.battle_type, 'PEAK');
  assert.equal(config.stage_id, 4003);
  assert.deepEqual(config.blessings, [{ id: 2002, level: 1 }]);

  assert.deepEqual(buildFireflyChallenge({ mode: 'peak', groupId: 9 }, { skip_node: 3, challenge_peak_group_id: 1 }), {
    skip_node: 3,
    challenge_peak_group_id: 9,
    challenge_peak_group_id_list: [9]
  });
  // Non-peak modes keep the existing challenge untouched.
  assert.deepEqual(buildFireflyChallenge({ mode: 'moc', groupId: 1037 }, { skip_node: 1, challenge_peak_group_id: 4 }), {
    skip_node: 1,
    challenge_peak_group_id: 4,
    challenge_peak_group_id_list: []
  });
});

test('findSelectionByStageId reopens the saved room', async () => {
  const { findSelectionByStageId } = await load();
  const catalog = sampleCatalog();
  assert.deepEqual(findSelectionByStageId(catalog, 'moc', 30127112), {
    mode: 'moc',
    groupId: 1037,
    levelId: 5612,
    side: 'secondNode',
    useCycle: true,
    useBuff: true
  });
  assert.deepEqual(findSelectionByStageId(catalog, 'peak', 4003, 9), {
    mode: 'peak',
    groupId: 9,
    stageIndex: 2,
    useCycle: true,
    useBuff: true
  });
  assert.equal(findSelectionByStageId(catalog, 'peak', 9999), null);
  assert.equal(findSelectionByStageId(catalog, 'custom', 4003), null);
});

test('custom mode keeps arbitrary waves and rejects empty input', async () => {
  const { buildFireflyBattleConfig, summarizeEndgameSelection } = await load();
  const catalog = sampleCatalog();
  const config = buildFireflyBattleConfig(catalog, {
    mode: 'custom',
    customCycle: 4,
    customWaves: [[{ monster_id: '4033010', level: '90', amount: '2' }], [{ monster_id: 22 }]]
  });
  assert.equal(config.battle_type, 'CE');
  assert.equal(config.stage_id, 0);
  assert.equal(config.cycle_count, 4);
  assert.deepEqual(config.monsters, [
    [{ monster_id: 4033010, level: 90, amount: 2 }],
    [{ monster_id: 22, level: 80, amount: 1 }]
  ]);

  assert.equal(buildFireflyBattleConfig(catalog, { mode: 'custom', customWaves: [[{ monster_id: 0 }]] }), null);
  assert.equal(buildFireflyBattleConfig(catalog, { mode: 'custom', customWaves: [] }), null);

  const summary = summarizeEndgameSelection(catalog, {
    mode: 'custom',
    customCycle: 4,
    customWaves: [[{ monster_id: '4033010' }], [{ monster_id: 22 }]]
  });
  assert.equal(summary.waveCount, 2);
  assert.equal(summary.monsterCount, 2);
  assert.equal(summary.cycleCount, 4);
});

test('unknown modes and empty catalogs resolve to null', async () => {
  const { buildFireflyBattleConfig, resolveEndgameSelection } = await load();
  assert.equal(resolveEndgameSelection({ modes: {} }, { mode: 'moc' }), null);
  assert.equal(buildFireflyBattleConfig(sampleCatalog(), { mode: 'su' }), null);
  assert.equal(buildFireflyBattleConfig(sampleCatalog(), { mode: 'pf' }), null);
});
