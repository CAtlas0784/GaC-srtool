const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const start = source.indexOf('function orderBattleReportAvatars(');
const end = source.indexOf('\nfunction renderDamageAnalyst(', start);
const context = { state: { statusData: { lineups: { 0: 30, 1: 20, 2: 10 } } } };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

test('battle slots override a different overworld lineup without mutating the report', () => {
  const avatars = [{ avatar_id: 20, slot: 2 }, { avatar_id: 30, slot: 0 }, { avatar_id: 10, slot: 1 }];
  const result = context.orderBattleReportAvatars(avatars);
  assert.deepEqual(Array.from(result, a => a.avatar_id), [30, 10, 20]);
  assert.deepEqual(avatars.map(a => a.avatar_id), [20, 30, 10]);
});

test('historical reports keep recorded order when battle slots are absent', () => {
  const result = context.orderBattleReportAvatars([{ avatar_id: 10 }, { avatar_id: 30 }, { avatar_id: 20 }]);
  assert.deepEqual(Array.from(result, a => a.avatar_id), [10, 30, 20]);
});

test('Other includes unclassified and missing category damage exactly once', () => {
  const result = context.damageBreakdownForAvatar({ total_damage: 1000, total_break_damage: 100,
    attack_type_damage: { Normal: 100, BPSkill: 200, Ultra: 100, Insert: 50, TrueDamage: 150 } });
  assert.equal(result.other, 500);
  assert.equal(result.normal + result.skill + result.ultimate + result.breakDamage + result.other, 1000);
});

test('Other never becomes negative when the native breakdown overlaps', () => {
  assert.equal(context.damageBreakdownForAvatar({total_damage: 10, attack_type_damage: {Normal: 20}}).other, 0);
});
