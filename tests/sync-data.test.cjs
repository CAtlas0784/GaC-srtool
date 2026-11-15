const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = () => import('../scripts/lib/sync-core.mjs');
const readData = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data', name), 'utf8'));

test('game enums map to app names and unknown values stop the sync', async () => {
  const { mapPath, mapElement, mapRarity } = await core();
  assert.equal(mapPath('Knight'), 'Preservation');
  assert.equal(mapPath('Memory'), 'Remembrance');
  assert.equal(mapElement('Thunder'), 'Lightning');
  assert.equal(mapRarity('CombatPowerAvatarRarityType5'), 5);
  assert.equal(mapRarity('CombatPowerLightconeRarity3'), 3);
  assert.throws(() => mapPath('BrandNewPath'), /Unknown path/);
  assert.throws(() => mapElement('Void'), /Unknown element/);
});

test('text merging never replaces existing text with an empty string', async () => {
  const { mergeTexts, localize, PUNKLORDE_LANGS } = await core();
  const fromSource = localize({ en: 'Astra Yao', th: '', jp: '{RUBY_B#あ}亜{RUBY_E#}空' }, PUNKLORDE_LANGS);
  assert.deepEqual(fromSource, { en: 'Astra Yao', ja: '亜空' });
  const merged = mergeTexts(fromSource, { th: 'ชื่อเดิม', en: 'Old name' });
  assert.equal(merged.en, 'Astra Yao');
  assert.equal(merged.th, 'ชื่อเดิม');
  assert.deepEqual(Object.keys(merged), ['th', 'en', 'ja']);
});

test('descriptions become rank templates with display values', async () => {
  const { buildTemplate, fillTemplate } = await core();
  const desc = 'ATK +<color=#f29e38ff><unbreak>#1[i]%</unbreak></color> for <unbreak>#2[i]</unbreak> turn(s), SPD +#3[f1]%.';
  const { template, values } = buildTemplate(desc, [[0.24, 2, 0.045], [0.3, 2, 0.0525]]);
  assert.equal(template, 'ATK +{0}% for {1} turn(s), SPD +{2}%.');
  assert.deepEqual(values, [[24, 2, 4.5], [30, 2, 5.3]]);
  assert.equal(fillTemplate('SPD +<unbreak>#1[i]%</unbreak> at #2[i] SPD', [0.06, 145]), 'SPD +6% at 145 SPD');
});

test('in-game recommendations convert to affix ids from either source shape', async () => {
  const { normalizeIngameRecommendation, ingameBuild } = await core();
  const nanoka = normalizeIngameRecommendation({
    set4_id_list: [134, 102], set2_id_list: [317, 309],
    property_list3: ['CriticalDamageBase'], property_list4: ['SpeedDelta', 'AttackAddedRatio'],
    property_list5: ['QuantumAddedRatio'], property_list6: ['SPRatioBase'],
    sub_affix_property_list: ['CriticalChanceBase', 'CriticalDamageBase', 'AttackAddedRatio']
  });
  const punklorde = normalizeIngameRecommendation({
    Set4IDList: [134, 102], Set2IDList: [317, 309],
    PropertyList3: ['CriticalDamageBase'], PropertyList4: ['SpeedDelta', 'AttackAddedRatio'],
    PropertyList5: ['QuantumAddedRatio'], PropertyList6: ['SPRatioBase'],
    SubAffixPropertyList: ['CriticalChanceBase', 'CriticalDamageBase', 'AttackAddedRatio']
  });
  assert.deepEqual(nanoka, punklorde);
  assert.deepEqual(nanoka.feet, [4, 2]);
  // Three recommended sub stats are padded to the four the editor needs.
  assert.deepEqual(ingameBuild(nanoka), { cavern: 134, planar: 317, body: 5, feet: 4, sphere: 9, rope: 2, substats: [8, 9, 5, 7] });
  assert.equal(normalizeIngameRecommendation(null), null);
});

test('usage profiles only trust the most used row', async () => {
  const { normalizeUsageProfile } = await core();
  const lookups = {
    setIdsByName: new Map([['eagle of twilight line', 110], ['penacony, land of the dreams', 312]]),
    lightconeIdsByName: new Map([['in the night', 23001]])
  };
  const usage = normalizeUsageProfile({
    count: 40, mode: 'Pure Fiction',
    relicSets: [{ name: 'Eagle of Twilight Line, Flex', usage: 60 }, { name: 'Eagle of Twilight Line', usage: 30 }],
    planarSets: [{ name: 'Penacony, Land of the Dreams', usage: 55 }],
    lightCones: [{ name: 'In the Night', usage: 70 }],
    mainStats: { body: [{ name: 'CRIT Rate', usage: 90 }], feet: [{ name: 'SPD', usage: 80 }], sphere: [{ name: 'Lightning DMG Boost', usage: 75 }], rope: [] }
  }, lookups);
  assert.equal(usage.cavern, null);
  assert.deepEqual(usage.planar, { id: 312, usage: 55 });
  assert.deepEqual(usage.lightcone, { id: 23001, usage: 70 });
  assert.deepEqual([usage.body.id, usage.feet.id, usage.sphere.id, usage.rope], [4, 4, 7, null]);
  assert.equal(usage.sample, 40);
});

test('a hand-written build always wins and the game recommendation is the fallback', async () => {
  const { pickBuild } = await core();
  const manual = { cavern: 1, planar: 2, body: 3, feet: 4, sphere: 5, rope: 1, substats: [8, 9, 7, 5] };
  const ingame = { cavern: [134], planar: [317], body: [5], feet: [4], sphere: [9], rope: [2], substats: [8, 9, 5, 7] };
  assert.deepEqual(pickBuild({ manual, usage: null, ingame }), { build: manual, source: 'manual' });
  assert.equal(pickBuild({ manual: undefined, usage: null, ingame }).source, 'ingame');
  assert.equal(pickBuild({ manual: undefined, usage: null, ingame: null }), null);
});

test('player usage overrides the game recommendation only with a large sample and a clear majority', async () => {
  const { pickBuild } = await core();
  const ingame = { cavern: [134], planar: [317], body: [5], feet: [4], sphere: [9], rope: [2], substats: [8, 9, 5, 7] };
  const usage = (sample) => ({
    sample, cavern: { id: 110, usage: 90 }, planar: { id: 309, usage: 30 }, lightcone: null,
    body: { id: 5, usage: 99 }, feet: null, sphere: null, rope: { id: 4, usage: 50 }
  });
  const trusted = pickBuild({ manual: undefined, usage: usage(100), ingame });
  assert.equal(trusted.source, 'usage');
  // cavern and rope clear the 50% bar; planar (30%) keeps the game's pick.
  assert.deepEqual(trusted.build, { cavern: 110, planar: 317, body: 5, feet: 4, sphere: 9, rope: 4, substats: [8, 9, 5, 7] });
  assert.equal(pickBuild({ manual: undefined, usage: usage(99), ingame }).source, 'ingame');
  // Agreeing with the game is not an override.
  const agreeing = { sample: 500, cavern: { id: 134, usage: 95 }, planar: null, body: null, feet: null, sphere: null, rope: null };
  assert.equal(pickBuild({ manual: undefined, usage: agreeing, ingame }).source, 'ingame');
  assert.equal(pickBuild({ manual: undefined, usage: usage(500), ingame: null }), null);
});

test('removed released entries are reported but removed beta entries are not', async () => {
  const { findShrinkage } = await core();
  const previous = { 1001: {}, 1002: {}, 1600: { beta: true } };
  assert.equal(findShrinkage(previous, { 1001: {}, 1002: {} }, 'characters'), null);
  assert.match(findShrinkage(previous, { 1001: {} }, 'characters'), /1 released entry would disappear \(1002\)/);
});

test('generated data files are complete and consistent', () => {
  const avatars = readData('avatars.json');
  const lightcones = readData('lightcones.json');
  const relicSets = readData('relic-sets.json');
  const builds = readData('builds.json');
  const manifest = readData('manifest.json');
  assert.equal(Object.keys(avatars).length, manifest.counts.avatars);
  assert.equal(Object.keys(lightcones).length, manifest.counts.lightcones);
  assert.equal(Object.keys(relicSets).length, manifest.counts.relicSets);
  for (const [id, avatar] of Object.entries(avatars)) {
    assert.ok(avatar.names.en, `avatar ${id} has an English name`);
    assert.ok(avatar.path && avatar.element && avatar.rarity, `avatar ${id} has path, element and rarity`);
    const build = builds[id];
    assert.ok(build, `avatar ${id} has a build record`);
    if (build.signature) assert.ok(lightcones[build.signature], `avatar ${id} signature exists`);
    if (build.build) {
      assert.ok(relicSets[build.build.cavern] && relicSets[build.build.planar], `avatar ${id} build uses known sets`);
      assert.equal(build.build.substats.length, 4);
    }
  }
  for (const [id, lightcone] of Object.entries(lightcones)) {
    assert.ok(lightcone.names.en && lightcone.path && lightcone.rarity, `light cone ${id} is described`);
    if (lightcone.passive) {
      assert.equal(lightcone.passive.values.length, 5, `light cone ${id} has five ranks`);
      const slots = [...lightcone.passive.en.matchAll(/\{(\d+)\}/g)].map((match) => Number(match[1]));
      assert.ok(slots.every((slot) => lightcone.passive.values[0][slot] !== undefined), `light cone ${id} placeholders have values`);
    }
  }
  for (const [id, set] of Object.entries(relicSets)) {
    assert.ok(set.names.en && set.desc2, `relic set ${id} has a name and a 2-piece bonus`);
    assert.ok(!/#\d+\[/.test(`${set.desc2}${set.desc4 || ''}`), `relic set ${id} bonus text has no raw placeholders`);
  }
});
