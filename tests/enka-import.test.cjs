const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '../js/enka-import.js'));

async function load() {
  return import(moduleUrl.href);
}

function enkaPayload(overrides = {}) {
  return {
    detailInfo: {
      avatarDetailList: [
        {
          avatarId: 1506,
          level: 80,
          promotion: 6,
          rank: 2,
          equipment: { tid: 23001, level: 80, promotion: 6, rank: 1 },
          relicList: [
            {
              tid: 61011,
              level: 15,
              mainAffixId: 1,
              subAffixList: [
                { affixId: 2, cnt: 3, step: 0 },
                { affixId: 0, cnt: 0, step: 0 }
              ]
            }
          ],
          skillTreeList: [
            { pointId: 1506001, level: 6 },
            { pointId: 1506002, level: 10 },
            { pointId: 1506201, level: 1 },
            { pointId: 1506202, level: 1 }
          ],
          ...overrides
        }
      ]
    }
  };
}

test('normalizeEnkaUid only accepts 8-10 digit UIDs', async () => {
  const { normalizeEnkaUid } = await load();
  assert.equal(normalizeEnkaUid('800000000'), '800000000');
  assert.equal(normalizeEnkaUid('  12345678 '), '12345678');
  assert.equal(normalizeEnkaUid('1234567'), '');
  assert.equal(normalizeEnkaUid('12345678901'), '');
  assert.equal(normalizeEnkaUid('80000abc'), '');
  assert.equal(normalizeEnkaUid(null), '');
});

test('trace anchors and relic ids follow the Firefly/SR formulas', async () => {
  const { anchorTypeForPointId, relicSetIdFromTid, relicSlotFromTid } = await load();
  assert.equal(anchorTypeForPointId(1506001), '1');
  assert.equal(anchorTypeForPointId(1506004), '4');
  assert.equal(anchorTypeForPointId(1506007), '5');
  assert.equal(anchorTypeForPointId(1506101), '6');
  assert.equal(anchorTypeForPointId(1506103), '8');
  assert.equal(anchorTypeForPointId(1506201), '9');
  assert.equal(anchorTypeForPointId(1506999), '');

  assert.equal(relicSetIdFromTid(61011), 101);
  assert.equal(relicSlotFromTid(61011), 1);
  assert.equal(relicSetIdFromTid('31143'), 114);
  assert.equal(relicSlotFromTid('31143'), 3);
});

test('enkaToFreeSR converts avatars, light cones and relics', async () => {
  const { enkaToFreeSR, countFreeSRContent } = await load();
  const freesr = enkaToFreeSR(enkaPayload(), { ownerUid: 800000000 });

  const avatar = freesr.avatars['1506'];
  assert.equal(avatar.avatar_id, 1506);
  assert.equal(avatar.owner_uid, 800000000);
  assert.equal(avatar.level, 80);
  assert.equal(avatar.promotion, 6);
  assert.equal(avatar.data.rank, 2);
  assert.equal(avatar.data.skills['1506002'], 10);
  // 201/202 are stat traces, so they collapse into anchor 9.
  assert.deepEqual(avatar.data.skills_by_anchor_type, { 1: 6, 2: 10, 9: 1 });

  assert.equal(freesr.lightcones.length, 1);
  assert.deepEqual(freesr.lightcones[0], {
    level: 80,
    item_id: 23001,
    equip_avatar: 1506,
    rank: 1,
    promotion: 6,
    internal_uid: 0
  });

  assert.equal(freesr.relics.length, 1);
  assert.equal(freesr.relics[0].relic_set_id, 101);
  assert.equal(freesr.relics[0].main_affix_id, 1);
  assert.equal(freesr.relics[0].equip_avatar, 1506);
  assert.deepEqual(freesr.relics[0].sub_affixes, [{ sub_affix_id: 2, count: 3, step: 0 }]);

  assert.deepEqual(countFreeSRContent(freesr), { avatars: 1, lightcones: 1, relics: 1 });
  assert.equal(freesr.battle_config.battle_type, 'DEFAULT');
  assert.deepEqual(freesr.battle_config.monsters, []);
});

test('unwrapEnkaPayload accepts raw, enveloped and Firefly responses', async () => {
  const { unwrapEnkaPayload } = await load();
  const raw = enkaPayload();
  assert.equal(unwrapEnkaPayload(raw), raw);
  assert.deepEqual(unwrapEnkaPayload({ ok: true, data: raw }), raw);
  assert.deepEqual(unwrapEnkaPayload({ data: raw }), raw);
  assert.equal(unwrapEnkaPayload({ detailInfo: null }), null);
  assert.equal(unwrapEnkaPayload(null), null);
  assert.equal(unwrapEnkaPayload({ message: 'nope' }), null);
});

test('enkaToFreeSR rejects payloads without visible characters', async () => {
  const { enkaToFreeSR } = await load();
  assert.throws(() => enkaToFreeSR({ detailInfo: { avatarDetailList: [] } }), /ENKA_NO_AVATARS/);
  assert.throws(() => enkaToFreeSR({ detailInfo: {} }), /ENKA_NO_AVATARS/);
});

test('mergeFreeSR replaces gear of re-imported characters only', async () => {
  const { mergeFreeSR } = await load();
  const base = {
    avatars: {
      1506: { avatar_id: 1506, level: 1, data: { rank: 0 } },
      1001: { avatar_id: 1001, level: 80, data: { rank: 6 } }
    },
    lightcones: [
      { item_id: 23001, equip_avatar: 1506, internal_uid: 0 },
      { item_id: 23002, equip_avatar: 1001, internal_uid: 1 }
    ],
    relics: [{ relic_id: 61011, equip_avatar: 1506, internal_uid: 0 }],
    battle_config: { battle_type: 'MOC', stage_id: 12, monsters: [[1, 2]] }
  };
  const incoming = {
    avatars: { 1506: { avatar_id: 1506, level: 80, data: { rank: 2 } } },
    lightcones: [{ item_id: 23009, equip_avatar: 1506, internal_uid: 0 }],
    relics: []
  };

  const merged = mergeFreeSR(base, incoming, 'merge');
  assert.equal(merged.avatars[1506].level, 80);
  assert.equal(merged.avatars[1001].level, 80);
  assert.deepEqual(merged.lightcones.map(lc => lc.item_id), [23002, 23009]);
  assert.equal(merged.relics.length, 0);
  // The active challenge must survive an import.
  assert.equal(merged.battle_config.stage_id, 12);
  // The source document is not mutated.
  assert.equal(base.avatars[1506].level, 1);
});

test('mergeFreeSR replace mode clears the roster but keeps battle config', async () => {
  const { mergeFreeSR } = await load();
  const base = {
    avatars: { 1001: { avatar_id: 1001 } },
    lightcones: [{ item_id: 23002, equip_avatar: 1001 }],
    relics: [{ relic_id: 61011, equip_avatar: 1001 }],
    battle_config: { battle_type: 'MOC', stage_id: 12 }
  };
  const incoming = { avatars: { 1506: { avatar_id: 1506 } }, lightcones: [], relics: [] };
  const replaced = mergeFreeSR(base, incoming, 'replace');

  assert.deepEqual(Object.keys(replaced.avatars), ['1506']);
  assert.deepEqual(replaced.lightcones, []);
  assert.deepEqual(replaced.relics, []);
  assert.equal(replaced.battle_config.stage_id, 12);
});

test('mergeFreeSR works without an existing document', async () => {
  const { mergeFreeSR, FREE_SR_DEFAULT_BATTLE_CONFIG } = await load();
  const merged = mergeFreeSR(null, { avatars: { 1506: { avatar_id: 1506 } }, lightcones: [], relics: [] });
  assert.deepEqual(Object.keys(merged.avatars), ['1506']);
  assert.deepEqual(merged.battle_config, {
    ...FREE_SR_DEFAULT_BATTLE_CONFIG,
    blessings: [],
    custom_stats: [],
    monsters: []
  });
});
