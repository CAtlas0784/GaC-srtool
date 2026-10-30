import test from 'node:test';
import assert from 'node:assert/strict';
import { COMMANDS, inspectCommand, completeCommand } from '../js/command-assistant.mjs';
const catalogs={avatars:[{value:'1001',label:'March 7th'},{value:'1308',label:'Acheron'}],items:[{value:'101',label:'Item 101'}],planes:[{value:'20',label:'Plane 20'}],floors:[{value:'201',plane:20},{value:'301',plane:30}],cw_roles:[{value:'500',star:1},{value:'500',star:2},{value:'600',star:3}]};
test('every supported command has preview and help',()=>{
 for(const cmd of COMMANDS){const value=cmd.path.join(' ')+' ';const m=inspectCommand(value,value.length,catalogs);assert.ok(m.command);assert.equal(m.command,cmd);assert.ok(m.preview.includes(cmd.path[0]));assert.ok(m.hint);}
});
test('all roots are browsable, no six-row truncation',()=>{const m=inspectCommand('/',1);assert.ok(m.suggestions.length>6);assert.ok(m.suggestions.some(s=>s.value==='/faketime'));assert.ok(m.suggestions.some(s=>s.value==='/cw'));});
test('Tab completion advances through command, avatar, level, rank without running',()=>{
 let text='/ava';let m=inspectCommand(text,text.length,catalogs);let r=completeCommand(text,m,m.suggestions[0]);assert.equal(r.value,'/avatar ');
 m=inspectCommand(r.value,r.caret,catalogs);assert.equal(m.active.name,'id');r=completeCommand(r.value,m,m.suggestions[0]);assert.equal(r.value,'/avatar 1001 ');
 m=inspectCommand(r.value,r.caret,catalogs);assert.equal(m.active.name,'level');r=completeCommand(r.value,m,m.suggestions.find(x=>x.value==='80'));
 m=inspectCommand(r.value,r.caret,catalogs);assert.equal(m.active.name,'rank');assert.equal(m.suggestions.length,7);
});
test('find by entity name, replace only token at caret, preserve suffix',()=>{const text='/avatar ach 80 6';const m=inspectCommand(text,11,catalogs);assert.equal(m.suggestions[0].value,'1308');const r=completeCommand(text,m,m.suggestions[0]);assert.equal(r.value,'/avatar 1308 80 6');});
test('CW nested options and resource-backed stars',()=>{let m=inspectCommand('/cw ',4,catalogs);assert.ok(m.suggestions.some(s=>s.value==='gold'));m=inspectCommand('/cw role 500 ',13,catalogs);assert.deepEqual(m.suggestions.map(s=>s.value),['1','2']);});
test('floors belong to selected plane and required arguments remain visible',()=>{let m=inspectCommand('/teleport 20 ',13,catalogs);assert.deepEqual(m.suggestions.map(s=>s.value),['201']);m=inspectCommand('/give ',6,catalogs);assert.deepEqual(m.missing,['item_id']);assert.equal(m.active.name,'item_id');});
test('faketime optional modes and unknown commands do not fabricate matches',()=>{let m=inspectCommand('/faketime ',10,catalogs);assert.ok(m.suggestions.some(s=>s.value==='off'));m=inspectCommand('/nope',5,catalogs);assert.equal(m.command,null);assert.equal(m.suggestions.length,0);});
