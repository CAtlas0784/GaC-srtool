const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('4.6 equipment metadata and bundled artwork are available', async () => {
  const { LIGHTCONE_METADATA, RELIC_SET_METADATA, getRelicSetInfo } = await import('../js/equipment-data.js');
  const lc = LIGHTCONE_METADATA[22009];
  assert.equal(lc.names.en, "See You at the World's End!");
  assert.equal(lc.path, 'Elation');
  assert.deepEqual(lc.passive.values, [[6,12],[7,14],[8,16],[9,18],[10,20]]);
  for (const file of Object.values(lc.images)) assert.ok(fs.existsSync(path.resolve(__dirname, '..', file)));
  for (const [id, name] of [[329, "God's Moment of Joy"], [330, 'Subspace ASC Center']]) {
    const relic = RELIC_SET_METADATA[id];
    assert.equal(getRelicSetInfo(id, 'en').name, name);
    assert.ok(getRelicSetInfo(id, 'en').desc2);
    assert.notEqual(relic.creationAvailable, false);
    for (const slot of [5, 6]) assert.ok(fs.existsSync(path.resolve(__dirname, '..', relic.images[slot])));
  }
});

test('captured relic templates reference matching client affix properties', () => {
  const capture = require('../assets/relic-client-capture.json');
  assert.deepEqual(capture.relics.map(row => row.ID), [63295, 63296, 63305, 63306]);
  for (const relic of capture.relics) {
    const main = capture.main_affixes.filter(row => row.GroupID === relic.MainAffixGroup);
    const sub = capture.sub_affixes.filter(row => row.GroupID === relic.SubAffixGroup);
    assert.equal(main.length, relic.Type === 5 ? 10 : 5);
    assert.equal(sub.length, 12);
    assert.ok(main.every(row => sub.filter(item => item.Property !== row.Property).length >= 4));
  }
});
