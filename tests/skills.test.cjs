const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '../js/skills.js'));

async function load() {
  return import(moduleUrl.href);
}

test('point caps follow the game tables', async () => {
  const { skillPointMaxLevel } = await load();
  assert.equal(skillPointMaxLevel('1001001'), 6);
  assert.equal(skillPointMaxLevel('1001002'), 10);
  assert.equal(skillPointMaxLevel('1001004'), 10);
  assert.equal(skillPointMaxLevel('1001007'), 1);
  assert.equal(skillPointMaxLevel('1001201'), 1);
  // Memosprite skill/talent top out at 6; the Elation skill goes to 10.
  assert.equal(skillPointMaxLevel('1512301'), 6);
  assert.equal(skillPointMaxLevel('1512302'), 6);
  assert.equal(skillPointMaxLevel('1501420'), 10);
  assert.equal(skillPointMaxLevel('8007501'), 1);
  assert.equal(skillPointMaxLevel('1511601'), 1);
});

test('every character gets the 18 base and stat points, nothing else', async () => {
  const { maxAvatarSkills } = await load();
  const data = maxAvatarSkills({}, 1001, 'Preservation');
  assert.equal(Object.keys(data.skills).length, 18);
  assert.equal(data.skills['1001001'], 6);
  assert.equal(data.skills['1001002'], 10);
  assert.equal(data.skills['1001210'], 1);
  assert.deepEqual(Object.keys(data.skills_by_anchor_type).map(Number).sort((a, b) => a - b),
    Array.from({ length: 18 }, (_, i) => i + 1));
  assert.equal(data.skills_by_anchor_type['1'], 6);
  assert.equal(data.skills_by_anchor_type['18'], 1);
});

test('Elation characters get the Elation skill at level 10', async () => {
  const { maxAvatarSkills } = await load();
  const data = maxAvatarSkills({}, 1501, 'Elation');
  assert.equal(data.skills['1501420'], 10);
  assert.equal(data.skills_by_anchor_type['22'], 10);
  assert.equal('1501301' in data.skills, false);
});

test('Remembrance characters get the memosprite points, the Trailblazer one more', async () => {
  const { maxAvatarSkills } = await load();
  const robin = maxAvatarSkills({}, 1512, 'Remembrance');
  assert.equal(robin.skills['1512301'], 6);
  assert.equal(robin.skills['1512302'], 6);
  assert.equal(robin.skills_by_anchor_type['19'], 6);
  assert.equal(robin.skills_by_anchor_type['20'], 6);
  assert.equal('1512501' in robin.skills, false);

  const trailblazer = maxAvatarSkills({}, 8007, 'Remembrance');
  assert.equal(trailblazer.skills['8007501'], 1);
  assert.equal(trailblazer.skills_by_anchor_type['21'], 1);
});

test('Aha also gets its unique ability next to the Elation skill', async () => {
  const { maxAvatarSkills } = await load();
  const aha = maxAvatarSkills({}, 1511, 'Elation');
  assert.equal(aha.skills['1511420'], 10);
  assert.equal(aha.skills['1511601'], 1);
  assert.equal(aha.skills_by_anchor_type['23'], 1);
});

test('keepExisting adds missing points but leaves chosen levels alone', async () => {
  const { maxAvatarSkills } = await load();
  const data = {
    skills: { 1501001: 3, 1501002: 10, 1501003: 99, 1501101: 0 },
    skills_by_anchor_type: { 1: 3, 2: 10 }
  };
  maxAvatarSkills(data, 1501, 'Elation', { keepExisting: true });
  assert.equal(data.skills['1501001'], 3);
  assert.equal(data.skills['1501101'], 0);
  // Levels above the cap are brought back to it.
  assert.equal(data.skills['1501003'], 10);
  // Missing points arrive at maximum, including the new Elation skill.
  assert.equal(data.skills['1501004'], 10);
  assert.equal(data.skills['1501420'], 10);
  // The anchor map follows the skills.
  assert.equal(data.skills_by_anchor_type['1'], 3);
  assert.equal(data.skills_by_anchor_type['6'], 0);
  assert.equal(data.skills_by_anchor_type['22'], 10);
});

test('without keepExisting every point is reset to its maximum', async () => {
  const { maxAvatarSkills } = await load();
  const data = { skills: { 1501001: 1, 1501420: 1 }, skills_by_anchor_type: { 22: 1 } };
  maxAvatarSkills(data, 1501, 'Elation');
  assert.equal(data.skills['1501001'], 6);
  assert.equal(data.skills['1501420'], 10);
  assert.equal(data.skills_by_anchor_type['22'], 10);
});

test('an enhanced character keeps the longer point prefix its save already uses', async () => {
  const { maxAvatarSkills } = await load();
  const data = { skills: { 11217001: 2 } };
  maxAvatarSkills(data, 1217, 'Abundance', { keepExisting: true });
  assert.equal(data.skills['11217001'], 2);
  assert.equal(data.skills['11217002'], 10);
  assert.equal('1217002' in data.skills, false);
});

test('bad input does not throw', async () => {
  const { maxAvatarSkills, skillPointSuffixes } = await load();
  assert.doesNotThrow(() => maxAvatarSkills(null, 1001, ''));
  assert.doesNotThrow(() => maxAvatarSkills({ skills: [], skills_by_anchor_type: 'x' }, 1001, undefined));
  assert.equal(skillPointSuffixes(9999, 'Unknown').length, 18);
});
