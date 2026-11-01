// Command syntax mirrors the SDK dispatcher. Runtime IDs come from its read-only
// completion catalog; sample quantities are examples, not game resource IDs.

// The canonical command metadata below is authored in Thai. Non-Thai locales get
// English text from this map so the console follows the selected language.
let currentLanguage = 'th';

export function setCommandLanguage(lang) {
  currentLanguage = lang === 'th' ? 'th' : 'en';
}

const EN_TEXT = {
  'แสดงรายการคำสั่งและวิธีใช้': 'Show the command list and usage',
  'ส่งคำสั่งฟื้นฟู HP, พลังงาน และแต้มสกิล': 'Restore HP, energy and skill points',
  'ปรับตัวละครทั้งหมดเป็นเลเวล 80 และ E6': 'Set all characters to level 80 and E6',
  'กู้หน้าจอที่หมุนค้าง โดยเก็บความคืบหน้า CW': 'Recover a spinning screen while keeping CW progress',
  'ล้างสมาชิกทีมปัจจุบัน': 'Clear the current team',
  'ปรับเลเวลและ Eidolon ของตัวละคร': 'Set a character level and Eidolon',
  'ส่งคำสั่งเพิ่มไอเท็ม': 'Add items',
  'เปลี่ยนฉากปลายทาง': 'Change the destination scene',
  'ดู/ตั้งเวลาเกม โดยไม่เปลี่ยนเวลา Windows': 'View or set game time without changing Windows time',
  'แสดงวิธีใช้คำสั่ง CW': 'Show CW command usage',
  'ดูเงิน HP เลเวล และสถานะรอบ CW': 'View money, HP, level and CW round status',
  'แสดงรายการ ID ของ CW': 'List CW IDs',
  'เพิ่ม EXP ในรอบ CW': 'Add EXP in the CW round',
  'ตั้งค่าพลังบุกเบิก (Trailblaze Power / เหรียญร้านรถไฟ) ในรอบ CW': 'Set Trailblaze Power (train shop currency) in the CW round',
  'เพิ่มตัวละคร CW (ใช้ได้ใน Preparation)': 'Add a CW character (Preparation only)',
  'จำนวนเต็มบวก เช่น 1, 10 หรือ 100': 'Positive integer, e.g. 1, 10 or 100',
  'เลือก ID ตัวละครจากรายชื่อ': 'Pick a character ID from the list',
  'เลเวล 1–80 (ไม่ใส่เพื่อคงค่าเดิม)': 'Level 1–80 (omit to keep the current value)',
  'Eidolon 0–6': 'Eidolon 0–6',
  'ID ไอเท็มจาก catalog เซิร์ฟเวอร์': 'Item ID from the server catalog',
  'เลือก Plane ID': 'Pick a Plane ID',
  'เลือกชั้นที่อยู่ใน Plane นี้': 'Pick a floor inside this Plane',
  'status = ดูเวลา · off = เวลาจริง · หรือ Unix seconds / RFC3339 พร้อม timezone': 'status = view time · off = real time · or Unix seconds / RFC3339 with timezone',
  'เลือกชนิดข้อมูล': 'Pick a data type',
  'HP 1 ถึงเพดานของรอบปัจจุบัน': 'HP from 1 up to the current round cap',
  'จำนวนเต็มไม่ติดลบ (เป็นยอดรวม ยกเว้น exp ที่เป็นจำนวนเพิ่ม)': 'Non-negative integer (a total, except exp which is added)',
  'จำนวนพลังบุกเบิก เช่น 10, 50, 100': 'Trailblaze Power amount, e.g. 10, 50, 100',
  'เลือก Role ID ของ CW': 'Pick a CW Role ID',
  'ดาวที่มีข้อมูลรองรับสำหรับ Role นี้': 'Supported stars for this Role',
  'เลือก ID จากข้อมูล CW ของ Client': 'Pick an ID from the Client CW data'
};

function txt(value) {
  if (currentLanguage === 'th' || !value) return value;
  if (EN_TEXT[value]) return EN_TEXT[value];
  let match = value.match(/^ตั้งค่า (.+) ในรอบ CW$/);
  if (match) return `Set ${match[1]} in the CW round`;
  match = value.match(/^เพิ่ม (.+) ในรอบ CW \(Preparation\)$/);
  if (match) return `Add ${match[1]} in the CW round (Preparation)`;
  return value;
}

const LABELS = {
  th: {
    optional: 'ช่องเสริม',
    required: 'ช่องที่ต้องใส่',
    missing: (list) => 'ยังขาด: ' + list,
    allSet: 'ใส่ครบแล้ว · Enter หรือ Run เพื่อส่งคำสั่ง',
    nextArg: 'ช่องถัดไป: เลือกคำสั่งย่อยจากรายการด้านล่าง',
    navHint: '↑ ↓ เลื่อน · Tab เติมค่าที่เลือก · Esc ปิดรายการ',
    notFound: 'ไม่พบคำสั่งนี้ในรายการ — ตรวจชื่อคำสั่งก่อนส่ง',
    typeSlash: 'พิมพ์ / เพื่อเลือกคำสั่ง'
  },
  en: {
    optional: 'Optional argument',
    required: 'Required argument',
    missing: (list) => 'Missing: ' + list,
    allSet: 'All set · press Enter or Run to send',
    nextArg: 'Next argument: pick a subcommand from the list below',
    navHint: '↑ ↓ navigate · Tab fill selected · Esc close',
    notFound: 'Command not found — check the name before sending',
    typeSlash: 'Type / to choose a command'
  }
};

function labels() {
  return LABELS[currentLanguage] || LABELS.en;
}

export function describeCommand(command) {
  return txt(command?.description || '');
}

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
  ...['tbpower','tb','trailblaze'].map(p => spec('/cw '+p, 'ตั้งค่าพลังบุกเบิก (Trailblaze Power / เหรียญร้านรถไฟ) ในรอบ CW', [arg('total', 'จำนวนพลังบุกเบิก เช่น 10, 50, 100', ['10','50','100','500'])])),
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
    suggestions.push({ value:c.path[index], label:c.path[index], description:txt(c.description) });
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
      if ((choice.value+' '+(choice.label || '')).toLowerCase().includes(query)) suggestions.push({...choice, description:txt(active.help)});
    }
  }
  const seen = new Set();
  const unique = suggestions.filter(s => { if(seen.has(s.value))return false;seen.add(s.value);return true; });
  const missing = exact ? exact.args.filter((a,i) => !a.optional && !words[exact.path.length+i]).map(a => a.name) : [];
  const L = labels();
  return { command, active, argIndex, index, start, end, suggestions:unique, missing,
    preview:command ? [...command.path, ...command.args.map((a,i) => words[command.path.length+i] || (a.optional ? '['+a.name+']' : '<'+a.name+'>'))].join(' ') : value.trim() ? L.notFound : L.typeSlash,
    hint:active ? `${active.optional ? L.optional : L.required}: ${active.name} — ${txt(active.help)}` : exact ? (missing.length ? L.missing(missing.join(', ')) : L.allSet) : command && index > 0 ? L.nextArg : L.navHint,
  };
}

export function completeCommand(value, model, choice) {
  const suffix = value.slice(model.end);
  const separator = /^\s/.test(suffix) ? '' : ' ';
  return { value:value.slice(0,model.start)+choice.value+separator+suffix, caret:model.start+choice.value.length+1 };
}
