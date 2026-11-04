const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function resolve(dict, key) {
  if (typeof dict[key] === 'string') return dict[key];
  if (key.includes('.')) return key.split('.').reduce((value, part) => value?.[part], dict);
  return undefined;
}

test('every data-i18n key in index.html exists in Thai and English', async () => {
  const { TRANSLATIONS } = await import(pathToFileURL(path.join(root, 'js/i18n.js')).href);
  const keys = new Set();
  const attrRe = /data-i18n(?:-placeholder|-title|-alt|-aria-label)?="([^"]+)"/g;
  let match;
  while ((match = attrRe.exec(html))) keys.add(match[1].trim());

  assert.ok(keys.size > 300, 'index.html should expose a large translation surface');

  for (const lang of ['th', 'en']) {
    const missing = [...keys].filter((key) => {
      const value = resolve(TRANSLATIONS[lang], key);
      return typeof value !== 'string' || !value.trim();
    });
    assert.deepEqual(missing, [], `${lang} is missing data-i18n keys: ${missing.join(', ')}`);
  }
});

test('nested element and path dictionaries stay addressable from HTML', async () => {
  const { TRANSLATIONS } = await import(pathToFileURL(path.join(root, 'js/i18n.js')).href);
  for (const lang of ['th', 'en']) {
    for (const key of ['elements.Fire', 'elements.Ice', 'elements.Imaginary', 'paths.Destruction', 'paths.Elation']) {
      const value = resolve(TRANSLATIONS[lang], key);
      assert.equal(typeof value, 'string', `${lang}.${key} must resolve`);
      assert.ok(value.trim().length > 0, `${lang}.${key} must not be empty`);
    }
  }
  assert.equal(html.includes('data-i18n="Fire"'), false);
  assert.equal(html.includes('data-i18n="elements.Fire"'), true);
});

test('the shared theory-craft hint is translated', async () => {
  const { TRANSLATIONS } = await import(pathToFileURL(path.join(root, 'js/i18n.js')).href);
  for (const lang of ['th', 'en']) {
    assert.equal(typeof TRANSLATIONS[lang].fireflyTheoryModeHint, 'string');
    assert.ok(TRANSLATIONS[lang].fireflyTheoryModeHint.trim().length > 0);
  }
});
