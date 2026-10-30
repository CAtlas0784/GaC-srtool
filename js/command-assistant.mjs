// Command syntax mirrors the SDK dispatcher. Runtime IDs come from its read-only
// completion catalog; sample quantities are examples, not game resource IDs.
const arg = (name, help, source, optional = false) => ({ name, help, source, optional });
const quantity = (name = 'count') => arg(name, 'จำนวนเต็มบวก เช่น 1, 10 หรือ 100', ['1', '10', '100'], true);
const spec = (path, description, args = []) => ({ path: path.split(' '), description, args });
export const COMMANDS = [
  spec('/help', 'แสดงรายการคำสั่งและวิธีใช้'),
  spec('/heal', 'ส่งคำสั่งฟื้นฟู HP, พลังงาน และแต้มสกิล'),
  spec('/max', 'ปรับตัวละครทั้งหมดเป็นเลเวล 80 และ E6'),
  spec('/unstuck', 'กู้หน้าจอที่หมุนค้าง โดยเก็บความคืบหน้า CW'),
  spec('/clear lineup', 'ล้างสมาชิกทีมปัจจุบัน'),
  spec('/avatar', 'ปรับเลเวลและ Eidolon ของตัวละคร', [arg('id', 'เลือก ID ตัวละครจากรายชื่อ', 'avatars'), arg('level', 'เลเวล 1–80 (ไม่ใส่เพื่อคงค่าเดิม)', ['1','20','40','60','70','80'], true), arg('rank', 'Eidolon 0–6', ['0','1','2','3','4','5','6'], true)]),
  ...['/give','/item'].map(p => spec(p, 'ส่งคำสั่งเพิ่มไอเท็ม', [arg('item_id', 'ID ไอเท็มจาก catalog เซิร์ฟเวอร์', 'items'), quantity()])),
  ...['/teleport','/scene'].map(p => spec(p, 'เปลี่ยนฉากปลายทาง', [arg('plane_id', 'เลือก Plane ID', 'planes'), arg('floor_id', 'เลือกชั้นที่อยู่ใน Plane นี้', 'floors', true)])),
  spec('/faketime', 'ดู/ตั้งเวลาเกม โดยไม่เปลี่ยนเวลา Windows', [arg('time', 'status = ดูเวลา · off = เวลาจริง · หรือ Unix seconds / RFC3339 พร้อม timezone', 'time', true)]),
  spec('/cw help', 'แสดงวิธีใช้คำสั่ง CW'), spec('/cw status', 'ดูเงิน HP เลเวล และสถานะรอบ CW'),
  spec('/cw list', 'แสดงรายการ ID ของ CW', [arg('category', 'เลือกชนิดข้อมูล', ['role','equip','orb','consumable','forge'])]),
  ...['gold','hp','exp'].map(p => spec('/cw '+p, p === 'exp' ? 'เพิ่ม EXP ในรอบ CW' : 'ตั้งค่า '+p+' ในรอบ CW', [arg(p === 'exp' ? 'gain' : 'total', p === 'hp' ? 'HP 1 ถึงเพดานของรอบปัจจุบัน' : 'จำนวนเต็มไม่ติดลบ (เป็นยอดรวม ยกเว้น exp ที่เป็นจำนวนเพิ่ม)', ['1','10','100','1000'])])),
  spec('/cw role', 'เพิ่มตัวละคร CW (ใช้ได้ใน Preparation)', [arg('roleID', 'เลือก Role ID ของ CW', 'cw_roles'), arg('star', 'ดาวที่มีข้อมูลรองรับสำหรับ Role นี้', 'cw_stars'), quantity()]),
  ...['equip','orb','consumable','forge'].map(p => spec('/cw '+p, 'เพิ่ม '+p+' ในรอบ CW (Preparation)', [arg('itemID', 'เลือก ID จากข้อมูล CW ของ Client', 'cw_'+p), quantity()])),
];

export function usage(command) {
  return [...command.path, ...command.args.map(a => a.optional ? '['+a.name+']' : '<'+a.name+'>')].join(' ');
}

export function inspectCommand(value = '', caret = value.length, catalogs = {}) {
  caret = Math.max(0, Math.min(caret, value.length));
  const tokens = Array.from(value.matchAll(/\S+/g), m => ({ value:m[0], start:m.index, end:m.index+m[0].length }));
  let index = tokens.findIndex(t => caret >= t.start && caret <= t.end);
  if (index < 0) index = tokens.filter(t => t.end < caret).length;
  const token = tokens[index];
  const start = token?.start ?? caret, end = token?.end ?? caret;
  const query = value.slice(start, caret).toLowerCase();
  const words = tokens.map(t => t.value);
  const matching = COMMANDS.filter(c => c.path.slice(0, Math.min(index, c.path.length)).every((p,i) => p.toLowerCase() === words[i]?.toLowerCase()));
  const exact = COMMANDS.find(c => c.path.every((p,i) => p.toLowerCase() === words[i]?.toLowerCase()));
  const command = value.trim() ? exact || matching.find(c => (c.path[index] || '').toLowerCase().startsWith(query)) || null : null;
  const suggestions = [];
  for (const c of matching) if (index < c.path.length && c.path[index].toLowerCase().startsWith(query)) {
    suggestions.push({ value:c.path[index], label:c.path[index], description:c.description });
  }
  const argIndex = exact ? index-exact.path.length : -1;
  const active = exact?.args[argIndex];
  if (active) {
    let choices = Array.isArray(active.source) ? active.source : catalogs[active.source] || [];
    if (active.source === 'time') choices = ['status','off','reset','real',new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')];
    if (active.source === 'floors') choices = (catalogs.floors || []).filter(c => String(c.plane) === words[exact.path.length]);
    if (active.source === 'cw_stars') choices = (catalogs.cw_roles || []).filter(c => String(c.value) === words[exact.path.length]).map(c => String(c.star));
    for (const entry of choices) {
      const choice = typeof entry === 'object' ? entry : {value:String(entry),label:String(entry)};
      if ((choice.value+' '+(choice.label || '')).toLowerCase().includes(query)) suggestions.push({...choice, description:active.help});
    }
  }
  const seen = new Set();
  const unique = suggestions.filter(s => { if(seen.has(s.value))return false;seen.add(s.value);return true; });
  const missing = exact ? exact.args.filter((a,i) => !a.optional && !words[exact.path.length+i]).map(a => a.name) : [];
  return { command, active, argIndex, index, start, end, suggestions:unique, missing,
    preview:command ? [...command.path, ...command.args.map((a,i) => words[command.path.length+i] || (a.optional ? '['+a.name+']' : '<'+a.name+'>'))].join(' ') : value.trim() ? 'ไม่พบคำสั่งนี้ในรายการ — ตรวจชื่อคำสั่งก่อนส่ง' : 'พิมพ์ / เพื่อเลือกคำสั่ง',
    hint:active ? `${active.optional ? 'ช่องเสริม' : 'ช่องที่ต้องใส่'}: ${active.name} — ${active.help}` : exact ? (missing.length ? 'ยังขาด: '+missing.join(', ') : 'ใส่ครบแล้ว · Enter หรือ Run เพื่อส่งคำสั่ง') : command && index > 0 ? 'ช่องถัดไป: เลือกคำสั่งย่อยจากรายการด้านล่าง' : '↑ ↓ เลื่อน · Tab เติมค่าที่เลือก · Esc ปิดรายการ',
  };
}

export function completeCommand(value, model, choice) {
  const suffix = value.slice(model.end);
  const separator = /^\s/.test(suffix) ? '' : ' ';
  return { value:value.slice(0,model.start)+choice.value+separator+suffix, caret:model.start+choice.value.length+1 };
}
