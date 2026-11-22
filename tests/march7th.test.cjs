const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const load = () => import(pathToFileURL(path.join(__dirname, '..', 'js', 'march7th.js')).href);

test('march7thUrl follows the URL normalisation rules', async () => {
  const { march7thUrl } = await load();
  assert.equal(march7thUrl('localhost:21000'), 'http://localhost:21000/sr-tools');
  assert.equal(march7thUrl('http://127.0.0.1:21000/'), 'http://127.0.0.1:21000/sr-tools');
  assert.equal(march7thUrl('https://ps.example.com'), 'https://ps.example.com/sr-tools');
  assert.equal(march7thUrl('http://192.168.1.50:21000/sr-tools'), 'http://192.168.1.50:21000/sr-tools');
  assert.equal(march7thUrl('http://host:1/SR-Tools'), 'http://host:1/SR-Tools');
  assert.equal(march7thUrl(''), 'http://localhost:21000/sr-tools');
});

test('the probe sends only the login, a sync adds data and never extra_data', async () => {
  const { buildMarch7thBody } = await load();
  const probe = buildMarch7thBody({ username: '10001', password: 'pw' });
  assert.deepEqual(probe, { username: '10001', password: 'pw' });
  assert.equal('data' in probe, false);

  const sync = buildMarch7thBody({ username: '10001', password: 'pw' }, { avatars: {}, lightcones: [], relics: [] });
  assert.deepEqual(Object.keys(sync).sort(), ['data', 'password', 'username']);
  assert.ok(Array.isArray(sync.data.lightcones));
  assert.ok(Array.isArray(sync.data.relics));
});

test('replies are judged by status, error field and HTML', async () => {
  const { inspectMarch7thReply } = await load();
  assert.equal(inspectMarch7thReply({ status: 200, message: 'OK' }).kind, 'ok');
  assert.equal(inspectMarch7thReply(null, 'plain text').kind, 'ok');
  assert.deepEqual(inspectMarch7thReply({ status: 200, error: 'Invalid password' }), { kind: 'error', message: 'Invalid password' });
  assert.equal(inspectMarch7thReply({ status: 401, message: 'no' }).kind, 'error');
  assert.equal(inspectMarch7thReply({ error: '' , status: 200 }).kind, 'ok');
  assert.equal(inspectMarch7thReply(null, '<html>502</html>').kind, 'html');
  assert.equal(inspectMarch7thReply([1]).kind, 'unknown');
});
