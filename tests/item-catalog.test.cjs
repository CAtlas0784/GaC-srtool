const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.join(__dirname, '..', 'assets', 'item-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

test('item book matches its pinned game and image catalog revisions', () => {
  assert.equal(catalog.source.gameRevision, '312b4597691e0a29cf9828a15b592757dba86949');
  assert.equal(catalog.source.assetRevision, 'dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487');
  assert.equal(catalog.items.length, catalog.counts.total);
  assert.equal(new Set(catalog.items.map(item => item.id)).size, catalog.items.length);
  assert.equal(catalog.items.filter(item => item.supported).length, catalog.counts.supported);
  assert.equal(catalog.items.filter(item => item.icon).length, catalog.counts.withImages);
  assert.equal(catalog.items.filter(item => !item.icon).length, catalog.counts.withoutConfiguredImage);
  assert.equal(catalog.counts.total, 5414);
  assert.equal(catalog.counts.definitionRows, 5472);
  assert.equal(catalog.counts.candidateTables, 26);
  assert.equal(catalog.counts.definitionTables, 18);
  assert.equal(catalog.counts.supported, 3550);
  assert.equal(catalog.counts.withImages, 5261);
  assert.equal(catalog.source.gameTables.length, catalog.counts.definitionTables);
  assert.ok(catalog.items.some(item => item.sourceTables.length > 1), 'overlapping IDs retain every source table');
});

test('catalog image paths are safe and all visible catalog strings are translated', async () => {
  for (const item of catalog.items) {
    assert.ok(['item', 'lightcone', 'relic'].includes(item.category), `invalid category for ${item.id}`);
    assert.ok(item.sourceTables.length > 0, `missing source table for ${item.id}`);
    assert.deepEqual(Object.keys(item.names).sort(), [...catalog.source.languages].sort());
    assert.ok(item.gameIconPaths.every(path => typeof path === 'string' && path.length > 0));
    if (item.icon) {
      assert.match(item.icon, /^(icon|image)\/[A-Za-z0-9_./-]+\.png$/);
      assert.ok(!item.icon.includes('..'), `unsafe icon path for ${item.id}`);
    }
    for (const textMapField of ['descriptions', 'backgroundDescriptions']) {
      assert.ok(Object.keys(item[textMapField]).every(language => catalog.source.languages.includes(language)));
      assert.ok(Object.values(item[textMapField]).every(value => typeof value === 'string'));
    }
  }

  const { TRANSLATIONS } = await import('../js/i18n.js');
  const languages = catalog.source.languages;
  assert.deepEqual(Object.keys(TRANSLATIONS).sort(), [...languages].sort());
  const catalogKeys = Object.keys(TRANSLATIONS.en).filter(key => key.startsWith('itemCatalog'));
  assert.ok(catalogKeys.length > 0);
  for (const language of languages) {
    for (const key of catalogKeys) {
      assert.ok(TRANSLATIONS[language][key], `missing ${key} translation for ${language}`);
    }
  }
});

test('item detail dialog supports inspection and local quantity selection without a spawn action', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const dialog = html.match(/<dialog id="item-catalog-detail"[\s\S]*?<\/dialog>/)?.[0];
  assert.ok(dialog, 'item detail dialog exists outside the hidden tab content');
  assert.match(dialog, /<input[^>]*id="item-catalog-detail-amount"[^>]*type="number"|<input[^>]*type="number"[^>]*id="item-catalog-detail-amount"/);
  assert.match(dialog, /id="item-catalog-detail-description"/);
  assert.match(dialog, /id="item-catalog-detail-source"/);
  assert.doesNotMatch(dialog, /spawn|summon|เสก|เพิ่มเข้ากระเป๋า/i);

  const moduleSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'item-catalog.js'), 'utf8');
  assert.match(moduleSource, /showModal\(\)/);
  assert.match(moduleSource, /item\.pileLimit/);
  assert.doesNotMatch(moduleSource, /apiRequest|method\s*:\s*['"]POST/i);
});
