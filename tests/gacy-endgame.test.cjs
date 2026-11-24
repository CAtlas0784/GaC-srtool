const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const url = (file) => pathToFileURL(path.join(root, file)).href;

test('GaCy GO keeps fireflyEndgame capability false', async () => {
  const { modeCapabilities, modeSupports } = await import(url('js/modes.js'));
  const caps = modeCapabilities('gac');
  assert.equal(caps.fireflyEndgame, false);
  assert.equal(modeSupports('fireflyEndgame', 'gac'), false);
  assert.equal(modeCapabilities('firefly').fireflyEndgame, true);
  assert.equal(modeCapabilities('robin').fireflyEndgame, true);
  assert.equal(modeCapabilities('march7th').fireflyEndgame, true);
});

test('endgameTextKey maps gac to gacEndgame prefix', () => {
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  assert.match(app, /gac:\s*['"]gacEndgame['"]/);
});

test('GaCy endgame translation keys are present in Thai and English without FireflyGO mentions', async () => {
  const { TRANSLATIONS } = await import(url('js/i18n.js'));
  const keys = [
    'gacEndgameTitle',
    'gacEndgameDescription',
    'gacEndgameRule',
    'gacEndgameSynced',
    'gacEndgameCustomDescription',
    'gacEndgameAaRoundError',
    'gacEndgameSyncOfflineHint'
  ];

  for (const lang of ['th', 'en']) {
    for (const key of keys) {
      const text = TRANSLATIONS[lang]?.[key];
      assert.equal(typeof text, 'string', `${lang}.${key} must exist`);
      assert.ok(text.trim().length > 0, `${lang}.${key} must not be empty`);
      assert.equal(text.includes('FireflyGO'), false, `${lang}.${key} must not mention FireflyGO`);
    }
  }
});

test('GaCy GO mock server contracts (freesr and aa-round)', async () => {
  const calls = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let json = null;
      try { json = JSON.parse(body); } catch (_) {}
      calls.push({ method: req.method, url: req.url, body: json });

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-GaC-Srtool'
      });

      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      if (req.url === '/api/status') {
        res.end(JSON.stringify({ status: 'ok', server_version: '1.0.0', lineups: [] }));
      } else if (req.url === '/api/tool-session') {
        res.end(JSON.stringify({ ok: true }));
      } else if (req.url === '/api/monster-settings/aa-round') {
        res.end(JSON.stringify({ selection: json }));
      } else if (req.url === '/api/freesr') {
        res.end(JSON.stringify({ data: json?.data || json || {} }));
      } else {
        res.end(JSON.stringify({ ok: true }));
      }
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. Check freesr POST contract
    const freesrRes = await fetch(`http://127.0.0.1:${port}/api/freesr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        battle_config: { battle_type: 'PEAK', stage_id: 30501021, monsters: [] }
      })
    });
    assert.equal(freesrRes.status, 200);

    // 2. Check aa-round POST contract
    const aaRes = await fetch(`http://127.0.0.1:${port}/api/monster-settings/aa-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peak_group_id: 12 })
    });
    assert.equal(aaRes.status, 200);
    const aaBody = await aaRes.json();
    assert.deepEqual(aaBody, { selection: { peak_group_id: 12 } });

    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, '/api/freesr');
    assert.equal(calls[1].url, '/api/monster-settings/aa-round');
    assert.equal(calls[1].body.peak_group_id, 12);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('js/app.js parses with no syntax errors', () => {
  const { execFileSync } = require('node:child_process');
  execFileSync(process.execPath, ['--check', path.join(root, 'js/app.js')]);
});

