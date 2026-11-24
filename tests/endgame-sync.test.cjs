const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const load = () => import(pathToFileURL(path.join(root, 'js/endgame-sync.js')).href);
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/firefly-endgame.json'), 'utf8'));
const placementsDocument = JSON.parse(fs.readFileSync(path.join(root, 'assets/endgame-placements.json'), 'utf8'));
const nodeSha = (text) => crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');

test('canonical JSON sorts keys at every depth and has no whitespace', async () => {
  const { canonicalJson } = await load();
  assert.equal(canonicalJson({ b: 1, a: [{ z: 'ไทย', y: null }], c: { e: true, d: 'x' } }),
    '{"a":[{"y":null,"z":"ไทย"}],"b":1,"c":{"d":"x","e":true}}');
});

test('sha256 matches node:crypto, with and without crypto.subtle', async () => {
  const { sha256Hex, sha256HexFallback } = await load();
  for (const text of ['', 'abc', 'ไทย endgame', 'x'.repeat(1000)]) {
    assert.equal(await sha256Hex(text), nodeSha(text));
    assert.equal(sha256HexFallback(new TextEncoder().encode(text)), nodeSha(text));
  }
});

test('the payload follows the server contract and hashes the canonical modes', async () => {
  const { buildEndgameCatalogPayload, canonicalJson } = await load();
  const built = await buildEndgameCatalogPayload(catalog, placementsDocument);
  const { payload } = built;
  assert.deepEqual(Object.keys(payload).sort(), ['format_version', 'modes', 'placements', 'source']);
  assert.equal(payload.format_version, 1);
  assert.deepEqual(payload.source, {
    name: 'GaCy-Srtool',
    url: catalog.source,
    version: catalog.version,
    sha256: nodeSha(canonicalJson(payload.modes))
  });
  assert.deepEqual(Object.keys(payload.modes), ['moc', 'pf', 'as', 'peak']);
  for (const mode of ['moc', 'pf', 'as', 'peak']) assert.deepEqual(payload.modes[mode], catalog.modes[mode]);
  // The fallback hash covers the 470 KB catalog too.
  const { sha256HexFallback } = await load();
  assert.equal(sha256HexFallback(new TextEncoder().encode(canonicalJson(payload.modes))), built.sha256);
});

test('the bundled catalog carries the newest seasons', () => {
  const newest = (mode) => Math.max(...catalog.modes[mode].groups.map((group) => group.id));
  assert.ok(newest('moc') >= 1038);
  assert.ok(newest('pf') >= 2029);
  assert.ok(newest('as') >= 3024);
  assert.ok(newest('peak') >= 12);
});

test('the catalog has no characters a Go encoder would escape differently', async () => {
  const { buildEndgameCatalogPayload } = await load();
  const built = await buildEndgameCatalogPayload(catalog, placementsDocument);
  assert.deepEqual(built.goEscaped, [], 'a Go server would hash these characters differently; agree on escaping first');
});

test('placements without three ids, a source, or a known stage are not sent', async () => {
  const { verifiedPlacements, endgameModesForSync } = await load();
  const modes = endgameModesForSync(catalog);
  const peakStage = String(catalog.modes.peak.groups.at(-1).stages[0].id);
  const { placements, dropped } = verifiedPlacements({
    placements: {
      peak: {
        [peakStage]: { map_entrance_id: 1, maze_group_id: 2, npc_monster_id: 3, source: ' capture 2026-11-20 ' },
        999999999: { map_entrance_id: 1, maze_group_id: 2, npc_monster_id: 3, source: 'capture' }
      },
      moc: {
        5701: { map_entrance_id: 1, maze_group_id: 2, npc_monster_id: 3 },
        5702: { map_entrance_id: 1, maze_group_id: 0, npc_monster_id: 3, source: 'capture' }
      }
    }
  }, modes);
  assert.deepEqual(placements, { peak: { [peakStage]: { map_entrance_id: 1, maze_group_id: 2, npc_monster_id: 3, source: 'capture 2026-11-20' } } });
  assert.deepEqual(dropped.map((entry) => entry.reason).sort(), ['missing-id', 'missing-source', 'unknown-stage']);
});

test('the bundled placements file sends nothing unverified', async () => {
  const { verifiedPlacements, endgameModesForSync } = await load();
  const { dropped } = verifiedPlacements(placementsDocument, endgameModesForSync(catalog));
  assert.deepEqual(dropped, []);
});

test('push only when the server has nothing or a different sha256', async () => {
  const { endgamePushReason, parseEndgameStatus } = await load();
  assert.equal(endgamePushReason(parseEndgameStatus({ stored: false, source: null, modes: {} }), 'abc'), 'missing');
  assert.equal(endgamePushReason(parseEndgameStatus({ stored: true, source: { sha256: 'ABC' }, modes: {} }), 'abc'), '');
  assert.equal(endgamePushReason(parseEndgameStatus({ stored: true, source: { sha256: 'old' }, modes: {} }), 'abc'), 'changed');
  assert.equal(endgamePushReason(null, 'abc'), 'missing');
});

test('an older server reply is not mistaken for a status document', async () => {
  const { parseEndgameStatus } = await load();
  assert.equal(parseEndgameStatus({ message: 'OK', retcode: 0 }), null);
  assert.equal(parseEndgameStatus(null), null);
  const status = parseEndgameStatus({
    stored: true,
    source: { sha256: 'a' },
    received_at: '2026-11-24T10:00:00Z',
    modes: { peak: { groups: [{ id: 12, status: 'rejected', stages: [{ id: 1204, status: 'rejected', reason: 'no placement' }, { id: 1204, status: 'playable' }] }] } }
  });
  assert.equal(status.modes.peak.groups[0].stages.length, 2, 'boss and hard stages share an id and both stay');
  assert.equal(status.modes.peak.groups[0].stages[0].reason, 'no placement');
});

test('400 errors become display strings', async () => {
  const { endgameCatalogErrors } = await load();
  assert.deepEqual(endgameCatalogErrors({ errors: ['bad sha256', { path: 'modes.pf', message: 'empty' }, { code: 1 }] }),
    ['bad sha256', 'modes.pf: empty', '{"code":1}']);
  assert.deepEqual(endgameCatalogErrors({}), []);
});

test('status summary counts playable groups and stages', async () => {
  const { summarizeEndgameStatus, parseEndgameStatus } = await load();
  const summary = summarizeEndgameStatus(parseEndgameStatus({
    stored: true,
    source: {},
    modes: { pf: { groups: [
      { id: 2029, status: 'rejected', stages: [{ id: 1, status: 'rejected' }, { id: 2, status: 'playable' }] },
      { id: 2028, status: 'playable', stages: [{ id: 3, status: 'playable' }] }
    ] } }
  }));
  assert.deepEqual(summary.pf, { groups: 2, playableGroups: 1, stages: 3, playableStages: 2 });
});
