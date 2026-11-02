const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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
    assert.ok(fs.existsSync(path.resolve(__dirname, '..', relic.setIcon)));
    for (const slot of [5, 6]) assert.ok(fs.existsSync(path.resolve(__dirname, '..', relic.images[slot])));
  }
});

test('Aha recommends Dreamlit Actor and the captured God\'s Moment of Joy set', () => {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const start = source.indexOf('const CHARACTER_OPTIMAL_BUILDS =');
  const end = source.indexOf('// Recommended Relic Builds by Path', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({});
  vm.runInContext(source.slice(start, end) + '\nthis.build = getOptimalBuildForAvatar(1511);', context);
  assert.equal(context.build.cavern, 133);
  assert.equal(context.build.planar, 329);
  const capture = require('../assets/relic-client-capture.json');
  for (const [slot, id] of [[5, context.build.sphere], [6, context.build.rope]]) {
    const piece = capture.relics.find(row => row.SetID === context.build.planar && row.Type === slot);
    assert.ok(piece && capture.main_affixes.some(row => row.GroupID === piece.MainAffixGroup && row.AffixID === id));
  }
});

test('all six relic slots use bundled game artwork and localized badge labels', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const start = source.indexOf('const SLOT_NAMES_FULL =');
  const end = source.indexOf('function getRelicMainAffixName', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({ t: key => key });
  vm.runInContext(source.slice(start, end) + '\nthis.slots = SLOT_NAMES_FULL;', context);
  const icons = new Set();
  for (let slot = 1; slot <= 6; slot++) {
    const icon = context.slots[slot].icon;
    assert.ok(fs.existsSync(path.resolve(__dirname, '..', icon)));
    icons.add(icon);
  }
  assert.equal(icons.size, 6);
  assert.match(source, /relic-slot-type-icon/);
  assert.match(source, /relic-slot-empty-icon/);
  const { TRANSLATIONS } = await import('../js/i18n.js');
  for (const language of ['th', 'en']) assert.match(TRANSLATIONS[language].relicSlotBadgeLabel, /\{slot\}/);
});

test('equipment and trace labels do not embed emoji in any supported translation', async () => {
  const { TRANSLATIONS } = await import('../js/i18n.js');
  const keys = ['tabEquipment', 'modalAddLcTitle', 'modalAddRelicTitle', 'eqLcTitle', 'eqRelicTitle', 'overviewEquippedLc', 'overviewEquippedRelics', 'activeSetEffects', 'traceA2', 'traceA4', 'traceA6'];
  for (const [language, translations] of Object.entries(TRANSLATIONS)) {
    for (const key of keys) {
      if (translations[key]) assert.doesNotMatch(translations[key], /^[🌟✨🗡🛡]/u, `${language}: ${key}`);
    }
  }
  for (const language of ['th', 'en']) assert.match(TRANSLATIONS[language].relicSetPieces, /\{count\}/);
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
