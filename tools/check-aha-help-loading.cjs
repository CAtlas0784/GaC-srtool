// Regression check for the actual server envelopes and the independent selector.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(join(__dirname, '..', 'js', 'app.js'), 'utf8');
const start = source.indexOf('async function loadAhaHelpSettings()');
const end = source.indexOf('// Render Ex-Rank Cards', start);
assert(start >= 0 && end > start, 'settings function boundaries');
async function run(persistent, helpFails = false) {
  const select = { disabled: true, value: '', options: [], replaceChildren(...options) { this.options = options; }, add(option) { this.options.push(option); } };
  const save = { disabled: true };
  const status = { dataset: {} };
  const statusText = { textContent: '' };
  const el = { toggleSwGlobal: {}, toggleCastoriceGlobal: {}, toggleAhaGlobal: {}, persistentMcSelect: {}, persistentMarchSelect: {} };
  const calls = [];
  const context = vm.createContext({
    state: { serverMode: 'gac', isConnected: true }, el,
    document: { getElementById: id => ({
      'aha-help-level': select,
      'btn-save-aha-help': save,
      'aha-help-status': status,
      'aha-help-status-text': statusText
    })[id] || null },
    Option: function(text, value) { this.text = text; this.value = value; },
    t: (key, vars = {}) => ({
      ahaHelpLoading: 'Loading levels…', ahaHelpLegacyTitle: 'Use FreeSR setting',
      ahaHelpOffTitle: 'Off', ahaHelpNoLevels: 'No levels', ahaHelpConnect: 'Connect to GaC',
      ahaHelpStatusSaved: 'Saved', ahaHelpLoadError: 'Could not load levels: {error}',
      enabled: 'enabled', disabled: 'disabled'
    }[key] || key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`),
    console: { warn() {} }, savePersistentCache() {},
    apiCall: async endpoint => {
      calls.push(endpoint);
      if (endpoint === '/api/aha-help') {
        if (helpFails) throw Error('HTTP 404');
        return { status: 200, level: 0, levels: [{ BuffLevel: 1 }, { BuffLevel: 2 }, { BuffLevel: 3 }] };
      }
      return persistent;
    }
  });
  vm.runInContext(source.slice(start, end), context);
  await vm.runInContext('loadPersistentSettings()', context);
  return { select, save, el, calls };
}
(async () => {
  const result = await run({ status: 200, persistent: { enable_aha_global: false } });
  assert.equal(result.select.disabled, false);
  assert.equal(result.save.disabled, false);
  assert.equal(result.select.value, '0');
  assert.equal(result.select.options.length, 5);
  assert.equal(result.el.toggleAhaGlobal.checked, false);
  const withoutCharacterData = await run({ status: 200 });
  assert.equal(withoutCharacterData.select.disabled, false, 'Aha loader must not depend on character cache');
  const failed = await run({ status: 200, persistent: {} }, true);
  assert.equal(failed.save.disabled, true);
  assert.match(failed.select.options[0].text, /HTTP 404/);
  console.log('Aha Help: server envelope, empty character cache, explicit off and API failure checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
