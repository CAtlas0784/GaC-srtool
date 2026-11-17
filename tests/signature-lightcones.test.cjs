const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
const builds = read('assets/data/builds.json');
const avatars = read('assets/data/avatars.json');
const lightcones = read('assets/data/lightcones.json');
const overrides = read('scripts/data/overrides.json').signatureLightcones;

test('every signature light cone matches its character\'s path', () => {
  // A cone of another path never activates its passive in game.
  const wrong = Object.entries(builds)
    .filter(([id, rec]) => rec.signature && lightcones[rec.signature]?.path !== avatars[id]?.path)
    .map(([id, rec]) => `${avatars[id].names.en} (${id}) has ${lightcones[rec.signature]?.names.en} [${lightcones[rec.signature]?.path}]`);
  assert.deepEqual(wrong, []);
});

test('characters keep their own signature, not someone else\'s', () => {
  const expected = {
    1408: 23044, // Phainon: Thus Burns the Dawn (was Hyacine's)
    1321: 23050, // The Dahlia: Never Forget Her Flame (was Black Swan's)
    1406: 23043, // Cipher: Lies Dance on the Breeze (was Black Swan's)
    1014: 23045, // Saber: A Thankless Coronation
    1015: 23046, // Archer: The Hell Where Ideals Burn
    1409: 23042, // Hyacine keeps Long May Rainbows Adorn the Sky
    1307: 23022 // Black Swan keeps Reforged Remembrance
  };
  for (const [id, cone] of Object.entries(expected)) {
    assert.equal(builds[id].signature, cone, `${avatars[id].names.en} signature`);
  }
});

test('overrides.json and builds.json agree on every overridden signature', () => {
  for (const [id, cone] of Object.entries(overrides)) {
    if (!builds[id] || !lightcones[cone]) continue;
    assert.equal(builds[id].signature, cone, `builds.json ${id} must follow its override`);
  }
});
