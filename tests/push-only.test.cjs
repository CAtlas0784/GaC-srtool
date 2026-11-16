const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const url = (file) => pathToFileURL(path.join(__dirname, '..', file)).href;

test('FireflyGo and RobinSR are push-only, GaCy GO is not', async () => {
  const { modeSupports } = await import(url('js/modes.js'));
  assert.equal(modeSupports('pushOnly', 'firefly'), true);
  assert.equal(modeSupports('pushOnly', 'robin'), true);
  assert.equal(modeSupports('pushOnly', 'gac'), false);
});

test('relic set ids are derived from the relic id when the save has none', async () => {
  const { relicSetIdFromRelicId, buildSyncPayload } = await import(url('js/firefly.js'));
  assert.equal(relicSetIdFromRelicId(61031), 103);
  assert.equal(relicSetIdFromRelicId(63281), 328);
  assert.equal(relicSetIdFromRelicId(61341), 134);
  assert.equal(relicSetIdFromRelicId(0), 0);
  assert.equal(relicSetIdFromRelicId('12'), 0);

  const relics = buildSyncPayload({
    relics: [
      { relic_id: 61031, level: 15, main_affix_id: 1, equip_avatar: 1001, sub_affixes: [] },
      { relic_id: 63281, relic_set_id: 0, level: 15, main_affix_id: 1, equip_avatar: 0, sub_affixes: [] },
      { relic_id: 61341, relic_set_id: 134, level: 15, main_affix_id: 1, equip_avatar: 0, sub_affixes: [] }
    ]
  }).relics;
  assert.deepEqual(relics.map((r) => r.relic_set_id), [103, 328, 134]);
});

test('the recommended-relic builder writes the set id', () => {
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.match(app, /relic_id: relicId,\s*relic_set_id: setId,/);
});

test('no edit is gated on the connection indicator alone before pushing', () => {
  // Push-only servers can show "offline" until a probe runs; an edit gated on
  // state.isConnected was then saved locally and never sent.
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const gated = app.match(/if \(state\.isConnected\)\s*(\{\s*)?(try\s*\{\s*)?await saveFreesrChangesToServer/g) || [];
  assert.deepEqual(gated, []);
  assert.match(app, /function canPushFreesr\(\) \{\s*return state\.isConnected \|\| modeSupports\('pushOnly', state\.serverMode\);/);
});

test('push-only servers are probed automatically while not connected', () => {
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.match(app, /function autoProbePushServer\(\)/);
  assert.match(app, /state\.serverMode === 'firefly' && !state\.fireflyConnected/);
  assert.match(app, /state\.serverMode === 'robin' && !state\.robinConnected/);
  // refreshStatus starts the probe without waiting for it.
  assert.match(app, /\n\s*autoProbePushServer\(\);\n/);
  assert.equal(app.includes('robinProbed'), false);
});

test('the FireflyGo sync message tells the user to log in again for the bag', async () => {
  // FireflyGo sends the bag (light cones, relics) to the game at login only, so
  // equipment changed after login shows up after the next login.
  const { TRANSLATIONS } = await import(url('js/i18n.js'));
  assert.match(TRANSLATIONS.th.fireflySyncSuccess, /ล็อกอินใหม่/);
  assert.match(TRANSLATIONS.en.fireflySyncSuccess, /log in again/);
});

test('the extra_data card sends changes by itself when Auto-Sync is on', () => {
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const card = app.slice(app.indexOf('function setupFireflyExtrasEvents'), app.indexOf('function setEnkaStatus'));
  assert.match(card, /if \(!state\.autoSync \|\| state\.serverMode !== 'firefly'\) return;/);
  assert.match(card, /saveFireflyExtrasFromForm\(\);[\s\S]*await pushFireflySync\(\{ silent: true \}\);[\s\S]*'fireflyAutoSynced'/);
  // An automatic connect loads the server's settings unless the form has unsent edits.
  assert.match(app, /if \(extra && !\(auto && fireflyExtrasDirty\)\)/);
});
