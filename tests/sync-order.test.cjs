const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const url = (file) => pathToFileURL(path.join(__dirname, '..', file)).href;

// Mirrors Firefly_Srtools converterToFreeSRJson: one uid counter per list,
// starting at 0, equipped items first by avatar id, light cone then relic slots.
function sample() {
  const relic = (relicId, owner, uid) => ({ relic_id: relicId, level: 15, main_affix_id: 1, equip_avatar: owner, internal_uid: uid, sub_affixes: [] });
  return {
    avatars: {},
    lightcones: [
      { item_id: 21002, level: 80, promotion: 6, rank: 1, equip_avatar: 0, internal_uid: 900 },
      { item_id: 23054, level: 80, promotion: 6, rank: 1, equip_avatar: 8010, internal_uid: 98 },
      { item_id: 23065, level: 80, promotion: 6, rank: 1, equip_avatar: 1511, internal_uid: 342 },
      // A second light cone on the same character cannot be worn.
      { item_id: 21001, level: 80, promotion: 6, rank: 1, equip_avatar: 1511, internal_uid: 7 }
    ],
    relics: [
      relic(63281, 0, 1207),
      relic(61306, 8010, 3031),
      relic(61301, 8010, 3026),
      relic(61331, 1511, 2942),
      relic(61332, 1511, 2943),
      // Duplicate head piece on 1511.
      relic(61011, 1511, 5)
    ]
  };
}

test('uids are renumbered from 0 in the reference order', async () => {
  const { buildSyncPayload } = await import(url('js/firefly.js'));
  const { lightcones, relics } = buildSyncPayload(sample());

  assert.deepEqual(lightcones.map((l) => [l.item_id, l.equip_avatar, l.internal_uid]), [
    [23065, 1511, 0],
    [23054, 8010, 1],
    [21002, 0, 2],
    [21001, 0, 3]
  ]);
  assert.deepEqual(relics.map((r) => [r.relic_id, r.equip_avatar, r.internal_uid]), [
    [61331, 1511, 0],
    [61332, 1511, 1],
    [61301, 8010, 2],
    [61306, 8010, 3],
    [63281, 0, 4],
    [61011, 0, 5]
  ]);
});

test('every list gets its own counter and no uid repeats', async () => {
  const { buildSyncPayload } = await import(url('js/firefly.js'));
  const { lightcones, relics } = buildSyncPayload(sample());
  assert.deepEqual(lightcones.map((l) => l.internal_uid), [0, 1, 2, 3]);
  assert.deepEqual(relics.map((r) => r.internal_uid), [0, 1, 2, 3, 4, 5]);
});

test('loadout is not sent, like the reference client', async () => {
  const { buildSyncPayload } = await import(url('js/firefly.js'));
  const payload = buildSyncPayload({ ...sample(), loadout: [{ relic_list: ['3026'] }] });
  assert.equal('loadout' in payload, false);
});

test('the stored save is not modified', async () => {
  const { buildSyncPayload } = await import(url('js/firefly.js'));
  const save = sample();
  const before = JSON.stringify(save);
  buildSyncPayload(save);
  assert.equal(JSON.stringify(save), before);
});

test('RobinSR uses the same order and numbering', async () => {
  const { buildRobinPayload } = await import(url('js/robin.js'));
  const { relics, lightcones } = buildRobinPayload(sample());
  assert.deepEqual(relics.map((r) => [r.relic_id, r.internal_uid]).slice(0, 3), [[61331, 0], [61332, 1], [61301, 2]]);
  assert.deepEqual(lightcones.map((l) => [l.item_id, l.internal_uid]).slice(0, 2), [[23065, 0], [23054, 1]]);
});
