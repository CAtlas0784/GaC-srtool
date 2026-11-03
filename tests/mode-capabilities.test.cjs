const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const modesUrl = pathToFileURL(path.join(__dirname, '../js/modes.js'));

async function load() {
  return import(modesUrl.href);
}

test('GaCy GO keeps every tool feature', async () => {
  const { modeCapabilities } = await load();
  const caps = modeCapabilities('gac');
  for (const feature of [
    'saveManager', 'exranks', 'inventory', 'monsterSettings', 'damageAnalyst',
    'sceneCard', 'gmConsole', 'battleSummary', 'toolSession'
  ]) {
    assert.equal(caps[feature], true, `${feature} must be available on GaCy GO`);
  }
  assert.equal(caps.extraData, false);
  assert.equal(caps.ownedAvatarsOnly, false);
  assert.deepEqual(caps.jsonModes, ['freesr', 'persistent']);
});

test('FireflyGo hides every GaCy-only feature and exposes extra_data', async () => {
  const { modeCapabilities, modeSupports } = await load();
  const caps = modeCapabilities('firefly');
  for (const feature of [
    'saveManager', 'exranks', 'inventory', 'monsterSettings', 'damageAnalyst',
    'sceneCard', 'gmConsole', 'battleSummary', 'toolSession'
  ]) {
    assert.equal(caps[feature], false, `${feature} must be hidden on FireflyGo`);
  }
  assert.equal(caps.extraData, true);
  assert.equal(caps.ownedAvatarsOnly, true);
  assert.deepEqual(caps.jsonModes, ['freesr']);
  assert.equal(modeSupports('extraData', 'firefly'), true);
  assert.equal(modeSupports('saveManager', 'firefly'), false);
});

test('unknown modes fall back to GaCy GO', async () => {
  const { normalizeMode, modeCapabilities, modeSupports, MODE_LABELS } = await load();
  assert.equal(normalizeMode('nope'), 'gac');
  assert.equal(normalizeMode(undefined), 'gac');
  assert.equal(normalizeMode('firefly'), 'firefly');
  assert.deepEqual(modeCapabilities('legacy'), modeCapabilities('gac'));
  assert.equal(modeSupports('inventory', 'legacy'), true);
  assert.equal(MODE_LABELS.firefly, 'FireflyGo');
});

test('mode UI strings exist in Thai and English', async () => {
  const { TRANSLATIONS } = await import('../js/i18n.js');
  const keys = [
    'serverModeFirefly',
    'apiUrlHintGaC', 'apiUrlHintFirefly', 'apiUrlHintRobin',
    'enkaImportTitle', 'enkaImportSubtitle', 'enkaUidLabel', 'enkaUidPlaceholder',
    'enkaUidInvalid', 'enkaModeMerge', 'enkaModeReplace', 'btnEnkaFetch',
    'enkaPasteLabel', 'enkaPastePlaceholder', 'btnEnkaParsePaste',
    'enkaFetching', 'enkaImportDone', 'enkaUidNotFound', 'enkaRateLimited',
    'enkaFetchFailed', 'enkaFetchFailedDetail', 'enkaNoAvatars', 'enkaPasteEmpty',
    'enkaPasteInvalid', 'enkaProxyUnavailable', 'enkaSyncFailed',
    'fireflyExtrasTitle', 'fireflyExtrasBadge', 'fireflyExtrasSubtitle',
    'fireflyMultiPathTitle', 'fireflyMultiPathMain', 'fireflyMultiPathMarch7',
    'fireflyMultiPathMainList', 'fireflyMultiPathMarch7List',
    'fireflySettingTitle', 'fireflySettingCensorship', 'fireflySettingCm',
    'fireflySettingFirstPerson', 'fireflySettingHideUi', 'fireflySettingInvasion',
    'fireflyChallengeTitle', 'fireflyChallengeSkipNode', 'fireflyChallengeGroupId',
    'fireflyChallengeGroupList', 'fireflyTheoryTitle', 'fireflyTheoryMode',
    'fireflyTheoryCycleCount', 'fireflyTheoryStageId', 'fireflyTheoryLineup',
    'fireflyTheoryHp', 'fireflyLuaLabel', 'fireflyLuaPlaceholder', 'fireflyListPlaceholder',
    'btnFireflyProbe', 'btnFireflySaveExtra', 'btnFireflySync',
    'fireflyProbing', 'fireflySyncing', 'fireflyProbeSuccess', 'fireflySyncSuccess',
    'fireflyRequestFailed', 'fireflyRequestFailedDetail', 'fireflyTimeout',
    'fireflyNoData', 'fireflyExtraSaved', 'fireflyHpInvalid'
  ];
  for (const lang of ['th', 'en']) {
    for (const key of keys) {
      const value = TRANSLATIONS[lang]?.[key];
      assert.equal(typeof value, 'string', `${lang}.${key} must be a string`);
      assert.ok(value.trim().length > 0, `${lang}.${key} must not be empty`);
      assert.notEqual(value, key, `${lang}.${key} must be translated`);
    }
  }
});

test('the removed paused notice is no longer referenced', () => {
  const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.equal(app.includes('serverModesPausedNotice'), false);
});

test('mode-gated DOM hooks exist in index.html', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for (const id of [
    'tab-btn-inventory', 'tab-btn-monster-settings', 'tab-btn-persistent', 'tab-btn-exrank',
    'card-lineup', 'card-server-status', 'card-firefly-extras', 'api-url-mode-hint',
    'enka-uid-input', 'enka-import-mode', 'btn-enka-fetch', 'enka-import-status',
    'enka-paste-input', 'btn-enka-paste',
    'ff-multi-path-main', 'ff-multi-path-march7', 'ff-multi-path-main-list',
    'ff-multi-path-march7-list', 'ff-setting-censorship', 'ff-setting-cm',
    'ff-setting-first-person', 'ff-setting-hide-ui', 'ff-setting-invasion-percent',
    'ff-challenge-skip-node', 'ff-challenge-peak-group', 'ff-challenge-peak-list',
    'ff-theory-mode', 'ff-theory-cycle-count', 'ff-theory-stage-id', 'ff-theory-lineup',
    'ff-theory-hp', 'ff-lua', 'btn-firefly-probe', 'btn-firefly-save-extra',
    'btn-firefly-sync', 'firefly-extra-status'
  ]) {
    assert.ok(html.includes(`id="${id}"`), `index.html must contain #${id}`);
  }
});
