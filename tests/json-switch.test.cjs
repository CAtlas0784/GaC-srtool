const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createEditor(apiCall, connected = true) {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  const start = source.indexOf('let jsonLoadGeneration =');
  const end = source.indexOf('// Save JSON Tab Data', start);
  assert.ok(start >= 0 && end > start);
  const el = {
    btnSelectFreesr: {}, btnSelectPersistent: {}, btnSelectDatagame: {},
    jsonEditor: { value: '' }, jsonStatusInfo: {}, btnJsonSave: {}
  };
  const state = { isConnected: connected, fullFreesrData: null, persistentData: null, dataGameData: null };
  const context = vm.createContext({
    el, state, apiCall, t: (key, vars = {}) => `${key}:${vars.file || ''}`,
    savePersistentCache() {}, saveFreesrCache() {}, saveDataGameCache() {},
    localStorage: { getItem() { return null; } }, DEFAULT_DATA_GAME: {}, DEFAULT_LINEUP: {}
  });
  vm.runInContext(source.slice(start, end) + '\nthis.loadJsonData = loadJsonData;', context);
  return { el, state, load: context.loadJsonData };
}

test('switching JSON files reads the persistent response and the correct endpoint', async () => {
  const paths = [];
  const editor = createEditor(async url => {
    paths.push(url);
    return url === '/api/freesr' ? { data: { avatars: { 1: {} } } } : { persistent: { scene: 42, ex_ranks_unlocked: { 1: false } } };
  });
  await editor.load('freesr');
  assert.ok(JSON.parse(editor.el.jsonEditor.value).avatars);
  await editor.load('persistent');
  assert.deepEqual(JSON.parse(editor.el.jsonEditor.value), { scene: 42, ex_ranks_unlocked: { 1: false } });
  assert.deepEqual(paths, ['/api/freesr', '/api/persistent']);
  assert.equal(editor.el.btnJsonSave.disabled, false);
});

test('unavailable persistent data clears previous file and prevents saving it', async () => {
  const editor = createEditor(async url => url === '/api/freesr' ? { data: { avatars: {} } } : { status: 500, error: 'unavailable' });
  await editor.load('freesr');
  await editor.load('persistent');
  assert.equal(editor.el.jsonEditor.value, '');
  assert.equal(editor.el.btnJsonSave.disabled, true);
  assert.match(editor.el.jsonStatusInfo.textContent, /jsonDataUnavailable:persistent/);
});

test('late response cannot replace the newly selected file', async () => {
  let resolvePersistent;
  const editor = createEditor(url => url === '/api/persistent'
    ? new Promise(resolve => { resolvePersistent = resolve; })
    : Promise.resolve({ data: { avatars: { current: {} } } }));
  const first = editor.load('persistent');
  await editor.load('freesr');
  resolvePersistent({ persistent: { scene: 42 } });
  await first;
  assert.ok(JSON.parse(editor.el.jsonEditor.value).avatars.current);
  assert.equal(editor.state.currentJsonMode, 'freesr');
  assert.equal(editor.el.btnJsonSave.disabled, false);
});
