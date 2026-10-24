# GaC-Srtool 🌌

## Unstuck / แก้ตัวหมุนค้าง

เมื่อเชื่อมต่อ GaC server ใช้ปุ่ม **Unstuck** ใน GM Command Console หรือพิมพ์ `/unstuck` ได้ เว็บจะรอผลตอบรับจากเกมก่อนแสดงว่าสำเร็จ ต้องเปิดเกมและเชื่อมต่อเซิร์ฟเวอร์อยู่ คำสั่งนี้ปลดการบล็อก UI ระหว่างรอแพ็กเก็ตผ่าน heartbeat โดยไม่ลบเซฟ CW หรือเปลี่ยนแมพ และไม่แทนการแก้ handler ที่ขาด ต้องใช้ SDK server ที่รองรับ `/api/client/unstuck`

เว็บแอปพลิเคชันแดชบอร์ด (Web Dashboard & Management Tool) สำหรับจัดการข้อมูลตัวละคร, จัดทีม, ปรับแต่งรีลิกส์/กรวยแสง, วิเคราะห์ดาเมจจากการต่อสู้จริง และจัดการไฟล์เซฟ (`freesr-data.json`, `persistent`) ของเซิร์ฟเวอร์ **GaC-hkrpg-go** (และเซิร์ฟเวอร์มาตรฐาน FreeSR)

ทำงานแบบ Client-side 100% สามารถเปิดใช้งานผ่านเบราว์เซอร์ได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม

---

## ⚡ ฟังก์ชันหลัก (Features)

### 📊 1. แดชบอร์ด & จัดทีม (Live Dashboard & Lineup)
- **สถานะการเชื่อมต่อสด:** ตรวจจับสถานะการเชื่อมต่อกับเซิร์ฟเวอร์แบบ Real-time พร้อมแถบแสดงค่า Ping
- **จัดการทีม 4 ตำแหน่ง:** แสดงสมาชิกในทีมพร้อมระดับ Eidolon, อาวุธประจำตัว, เลเวล และพิกัดในฉาก
- **แสดงผล Git Branch ปัจจุบัน:** ระบุชื่อ Git Branch ที่รันอยู่ (เช่น `main`, `test-gay`) บน Header และ Browser Tab อย่างแม่นยำ
- **สรุปภาพรวมทรัพยากร:** แสดงจำนวนตัวละคร, กรวยแสง และรีลิกส์ทั้งหมดในคลัง

### ⚔️ 2. ระบบวิเคราะห์ดาเมจแบบเรียลไทม์ (Real-time Damage Analyst)
- **ดึงสถิติต่อสู้จากเซิร์ฟเวอร์สด:** ดึงรายงานการต่อสู้ล่าสุด (`/api/battle_report`) แบบเดียวกับ FireflyGo
- **สรุปสถิติดาเมจภาพรวม:** ดาเมจรวมทั้งหมด (Total DMG), ดาเมจเฉลี่ยต่อวินาที (DPS), จำนวนแอ็กชัน (Action Count)
- **จำแนกประเภทความเสียหาย:**
  - ดาเมจปกติ (Normal DMG)
  - ดาเมจทำลายจุดอ่อน (Break DMG)
  - ซูเปอร์เบรก (Super Break DMG)
  - ดาเมจต่อเนื่อง (Damage over Time / DoT)
- **วิเคราะห์ประสิทธิภาพการคริติคอล:** คำนวณอัตราคริติคอลจริง (CRIT Rate) และดาเมจคริติคอล (CRIT DMG) แยกรายตัวละคร
- **กราฟเปรียบเทียบสัดส่วน:** กราฟแท่งแสดงสัดส่วนการทำดาเมจของสมาชิกแต่ละคนในทีม

### 🎛️ 3. ปรับแต่งออฟรองรีลิกส์ขั้นสูง (Interactive Relic Substats Customizer)
- **ปรับแต่งออฟรอง 4 แถวอิสระ:** รองรับทั้งชิ้นส่วนหัว, มือ, ลำตัว, รองเท้า, ลูกแก้ว และสายเชื่อมโยง
- **ปุ่มปรับจำนวน Roll สเต็ปเปอร์ `[-] [+]`:** ควบคุมการลงออฟรองได้อย่างแม่นยำ พร้อมนับจำนวนครั้งที่ Roll (จำกัดรวมสูงสุด 5 ครั้งต่อชิ้นตามกลไกเกม HSR)
- **คำนวณค่าสเต็ตจริงอัตโนมัติ:** แสดงค่าสเต็ตที่คำนวณตามสูตรฐานของเกม Honkai: Star Rail
- **ระบบป้องกันออฟซ้ำ:** ล็อคไม่ให้เลือกออฟรองซ้ำกับออฟหลัก (Main Affix) หรือออฟรองแถวอื่น
- **พรีเซ็ตออฟรองสำเร็จรูป 5 สาย:**
  - 🎯 **Crit Focus (สายดาเมจคริ):** CRIT Rate, CRIT DMG, ATK%, SPD
  - 💥 **Break Focus (สายทำลายจุดอ่อน):** Break Effect, SPD, ATK%, HP%
  - ⚡ **SPD Tuner (สายจัดลำดับเทิร์น):** SPD สูงสุด, CRIT Rate, ATK%, Effect RES
  - ☠️ **DoT Specialist (สายดาเมจต่อเนื่อง):** ATK%, SPD, Effect Hit Rate, Break Effect
  - 🛡️ **Tank / Sustain (สายป้องกันและฟื้นฟู):** DEF%, HP%, Effect RES, SPD
- **จัดการได้ทันที:** แก้ไขรีลิกส์ที่ตัวละครกำลังสวมใส่อยู่ หรือแก้ไขรีลิกส์ในคลังเพื่อนำไปใช้งาน

### 👥 4. ระบบจัดการตัวละคร (Avatars & Character Builder)
- **ข้อมูลครบถ้วน:** ครอบคลุมตัวละครทั้งหมดในเกมตาม Resource มาตรฐานและเนื้อหาล่าสุด
- **คู่มือ Build รายตัว:** เปิดดูกรวยแสง, เซ็ตรีลิกส์/มิติ และออฟหลักที่พบบ่อยจากข้อมูลตัวอย่าง Endgame พร้อมโหมด/จำนวนตัวอย่าง วันที่เก็บข้อมูล และลิงก์คู่มือเต็มของ Prydwen
- **ปรับแต่งสถานะ:** เลเวล (1-80), เลื่อนขั้น (Ascension 0-6), ระดับ Eidolon (E0-E6), และร่องรอยสกิล (Traces 10/10)
- **ปุ่มลัดจัดการด่วน:**
  - ⚡ *ปรับ E0S1 ทุกตัว:* ตั้งค่าตัวละครทุกตัวเป็น E0 พร้อมกรวยแสงประจำตัว S1 เลเวล 80
  - ⭐ *ปรับ Max E6 ทุกตัว:* ปลดล็อค E6 และร่องรอยสกิลเต็ม 10/10 ให้ตัวละครทุกตัว
- **รูปภาพสแปลชอาร์ตความละเอียดสูง:** ดึงภาพ Splash Art เต็มตัวขนาด 2048x2048 ผ่าน StarRailRes jsDelivr CDN
- **ระบบ Fallback รูปภาพอัจฉริยะ:** แก้ปัญหาภาพไม่แสดงผลหรือหน้าต่างตัวละครจอดำ ด้วยกลไกสำรองภาพหลายระดับ

### 🗡️ 5. กรวยแสง & อุปกรณ์ (Lightcones & Equipment)
- **ปรับแต่งกรวยแสง:** สวมใส่, ปรับเลเวล 1-80, เลื่อนขั้น 0-6 และระดับการขัดเกลา Superimposition (S1-S5)
- **สลับกรวยแสงประจำตัวอัตโนมัติ:** ตรวจจับและสลับใส่ Signature Lightcone ของแต่ละตัวละครได้ในคลิกเดียว

### 🎒 6. คลังไอเทม (Material Inventory)
- ค้นหารายการจาก Item ID ใน catalog ของ Client ที่เซิร์ฟเวอร์กำลังใช้ พร้อมแก้จำนวนได้หลายรายการก่อนบันทึกครั้งเดียว
- ค่าในช่องที่ว่างใช้ค่าที่เซิร์ฟเวอร์สร้างตามปกติ; ล้างค่าที่เคยกำหนดเองเพื่อกลับไปใช้ค่าเริ่มต้นได้
- การบันทึกแก้เฉพาะจำนวนไอเทมใน `freesr-data.json` ไม่เขียนทับตัวละคร, LC, Relic หรือ Battle Config
- รองรับเฉพาะ GaC-hkrpg-go ผ่าน `/api/inventory/materials`; บันทึกลงไฟล์ทันทีและต้องเข้าเกมใหม่เพื่อโหลด session พร้อมจำนวนที่แก้แล้ว

### 👾 6.1 Monster Setting
- แยก Memory of Chaos, Pure Fiction, Apocalyptic Shadow และ Anomaly Arbitration เพื่อดูชื่อด่าน/มอนสเตอร์ รูป, level และ wave จาก metadata Nanoka ที่ตรงกับ `client_version` ของเซิร์ฟเวอร์และ resource `challenge_data.json` / `resources/StageConfig.json` (อ่านอย่างเดียว); เมื่อ Client เปลี่ยนเวอร์ชัน API จะดึง metadata ของเวอร์ชันนั้นให้อัตโนมัติ โดยไม่ใช้ข้อมูลจากเวอร์ชันอื่น
- เปลี่ยนการเลือกกลุ่ม/ด่านเป็นการ์ด และ Custom Enemy ค้นมอนด้วยชื่อหรือ ID พร้อมรูป/ชื่อจาก Nanoka; พิมพ์ ID เองได้ และแสดงรูปตัวอย่างขนาดใหญ่ขึ้น
- Anomaly Arbitration เป็นโหมด Endgame ที่อ่าน stage จาก resource เช่นเดียวกับโหมดอื่น ไม่ใช่ Custom Enemy; Aha's Help มีแท็บแยกจาก AA
- แก้ Custom Enemy ได้เฉพาะ Golden / Crimson Calyx และต้องเชื่อมต่อ GaC-Srtool; การกดใช้ stage จาก Client จะล้าง custom waves เพื่อให้กลับไปใช้ resource
- Weekly Boss, Stagnant Shadow, Cavern of Corrosion, Endgame และ Simulated Universe ไม่รับ custom waves จากหน้านี้

### 💾 7. จัดการไฟล์เซฟ GaC (Persistent & FreeSR Data)
- **ตั้งค่าตัวเอก (ผู้บุกเบิก):** สลับเพศ (Caelus / Stelle) และเปลี่ยนธาตุ (กายภาพ, ไฟ, จินตภาพ, ความจำ)
- **สลับพาธ March 7th:** เลือกระหว่างพาธการอนุรักษ์ (น้ำแข็ง) และพาธล่าสังหาร (จินตภาพ)
- **สวิตช์ระบบพิเศษ Ex-Rank:** จัดการเปิด/ปิดความสามารถพิเศษ Ex-Rank สำหรับตัวละครเฉพาะ (เช่น Jing Yuan, Dan Heng • IL, Acheron)
- **ตัวแก้ไข JSON ดิบ:** ตรวจสอบ แก้ไข จัดรูปแบบ และดาวน์โหลดสำรองไฟล์ `freesr-data.json` และ `persistent`

### 💻 8. คอนโซลคำสั่ง GM (GM & Server Console)
- ส่งคำสั่ง GM ไปยังเซิร์ฟเวอร์ได้โดยตรงผ่านหน้าเว็บ
- ดูผลตอบกลับและตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์แบบ Real-time

### 🌐 9. รองรับ 13 ภาษาทั่วโลก (Multi-Language Support)
- สลับเปลี่ยนภาษาได้ทันทีโดยไม่ต้องรีเฟรชหน้าเว็บ:
  - 🇹🇭 ไทย (Thai)
  - 🇺🇸 English
  - 🇨🇳 简体中文 (Simplified Chinese)
  - 🇹🇼 繁體中文 (Traditional Chinese)
  - 🇯🇵 日本語 (Japanese)
  - 🇰🇷 한국어 (Korean)
  - 🇻🇳 Tiếng Việt (Vietnamese)
  - 🇮🇩 Bahasa Indonesia
  - 🇪🇸 Español (Spanish)
  - 🇫🇷 Français (French)
  - 🇩🇪 Deutsch (German)
  - 🇷🇺 Русский (Russian)
  - 🇵🇹 Português (Portuguese)

---

# THERES ONLY DARK MODE IF U ASK FOR LIGHT GO AWAY FROM ME

## 💻 การเปิดใช้งานในเครื่อง (Local Usage)

1. **เปิดผ่านเบราว์เซอร์โดยตรง:** ดับเบิลคลิกเปิดไฟล์ `index.html` ได้ทันที
2. **หรือรันผ่าน Local Server:**
   ```bash
   npx serve .
   ```
   หรือใช้ Python:
   ```bash
   python -m http.server 3000
   ```

---

## 🔗 การเชื่อมต่อกับเซิร์ฟเวอร์ GaC-hkrpg-go

GaC-Srtool สื่อสารกับเซิร์ฟเวอร์ GaC-hkrpg-go ผ่าน REST API:

| Endpoint | Method | คำอธิบาย |
| --- | --- | --- |
| `/api/status` | GET | ข้อมูลสถานะเซิร์ฟเวอร์, ทีม, ตัวละคร และพิกัด |
| `/api/freesr` | GET, POST | ดึงหรืออัปเดตข้อมูล `freesr-data.json` |
| `/api/inventory/materials` | GET, POST | อ่าน Client item catalog และบันทึกจำนวนไอเทมแบบเจาะจงโดยไม่เขียนทับข้อมูลอื่น |
| `/api/freesr/avatars` | GET, POST | ดึงหรืออัปเดตข้อมูลตัวละครและสถิติ |
| `/api/persistent` | GET, POST | ดึงหรืออัปเดตข้อมูล `persistent` |
| `/api/battle_report` | GET, POST | ดึงสถิติดาเมจและผลการต่อสู้ล่าสุด |
| `/api/battle_report/reset` | POST | รีเซ็ตประวัติการต่อสู้ |
| `/api/exrank/toggle` | POST | เปิด/ปิดสถานะ EX-Rank |
| `/api/avatar/rank` | POST | เปลี่ยนระดับ Eidolon ของตัวละคร |
| `/api/avatar/max_all` | POST | ปรับตัวละครทุกตัวเป็น Max E6 และสกิลเต็ม |
| `/api/command` | POST | ส่งคำสั่ง GM ไปยังเซิร์ฟเวอร์ |

### บันทึกตัวละครและ Traces

Damage Analyst เรียงการ์ดตาม `report.avatars[].slot` จาก Battle จริง ไม่เปลี่ยนตามทีมหน้าโลก รายงานเก่าที่ไม่มี slot คงลำดับเดิม และแสดงประเภทดาเมจเพิ่มเติมที่ API ส่งมา เช่น Elation Damage / True Damage ทดสอบลำดับด้วย `node --test tests/damage-order.test.cjs` ข้อมูลสดต้องใช้ SDK และ `damage_analyst_live.lua` ฉบับที่อ่าน StatisticsComponent ของ Battle ปัจจุบัน

การบันทึกจากหน้ารายละเอียดส่งข้อมูลตัวละครทั้งชุดผ่าน `/api/freesr` ในคำขอเดียว รวมถึง `data.skills` และ `data.skills_by_anchor_type` สำหรับ Traces เพื่อไม่ให้ server sync ข้อมูลระดับ/Eidolon ระหว่างทางก่อนข้อมูล Trace จะถูกบันทึก `saveAvatarDetails(closeModal = true)` ยังรองรับการเรียกจากปุ่ม build ที่ไม่ต้องปิดหน้าต่าง ถ้า server ตอบผิดพลาดจะแสดงข้อความบันทึกไม่สำเร็จแทนการแจ้งว่าสำเร็จ

### ข้อมูล Build และแหล่งที่มา

หน้า **รายละเอียดตัวละคร → แนวทางบิลด์** แสดงอุปกรณ์และออฟหลักที่พบบ่อยในตัวอย่าง Endgame จากข้อมูลที่แสดงบน Prydwen โดยใส่โหมด/จำนวนผู้เล่นและวันที่เก็บ snapshot ไว้กำกับ ตัวเลขเป็นสัดส่วนการใช้งานในกลุ่มตัวอย่าง ไม่ใช่คะแนนจัดอันดับหรือคำแนะนำทางการ ตัวละครที่ snapshot ไม่มีตัวอย่างจะแสดงลิงก์ไปคู่มือของ Prydwen แทนการแสดงข้อมูลสำรองที่อาจทำให้เข้าใจผิด

ข้อมูลที่สร้างไว้ใน `js/build-guides-data.js` ใช้ชุดข้อมูล MIT จาก [LvlUrArti/MocDataProcessed](https://huggingface.co/datasets/LvlUrArti/MocDataProcessed) ซึ่งระบุว่าเป็นข้อมูลที่ประมวลผลจากเว็บไซต์ Prydwen โปรดให้เครดิต LvlUrArti เมื่อเผยแพร่หรือวิเคราะห์ข้อมูลต่อ สามารถอัปเดต snapshot ด้วย `npm run sync-build-guides` ได้ โดยสคริปต์จะเลือกเวอร์ชันล่าสุดที่มีใน dataset และจับคู่ตัวละครตาม ID จาก `js/avatars-data.js`.

### Item Book

The **Item Book** scans the pinned game-data revision for every `ItemConfig`-named table that contains item-definition rows. In this revision, 26 candidate tables were checked and 18 supplied item rows: 5,472 rows resolve to 5,414 unique item IDs. The **GaC supported** badge is derived from the Go server's `InventoryItemConfig.json`; other entries are browse-only.

Click an item's image to open its details, including its ID, source table, type, game description, and a quantity selector. The selected quantity is local to the dialog and does not call the server or add an item. Where the game table defines `PileLimit`, the selector uses it as the maximum.

Names and descriptions come from the pinned game TextMap and StarRailRes indexes for all 13 Srtool languages. At this revision, 5,150 of 5,414 item names have source-localized text; missing source names fall back to English or the item ID. Icons load from the pinned StarRailRes revision: 5,261 entries have a verified image file, while the remaining 153 retain their original game icon paths and show the missing-image state. The installed client stores these missing images inside encrypted `.block` bundles, so they are not extracted by this catalog builder.

Regenerate `assets/item-catalog.json` from the inventory catalog revision used by the Go server:

```bash
python tools/build-item-catalog.py --inventory-config <path-to-GaC-hkrpg-go>/resources/InventoryItemConfig.json
```

## CW GM commands

In the connected GM Console: `/cw status`, `/cw gold <total>`, `/cw hp <total>`. Values affect only the active CW run. Changes are queued and applied during Preparation; they wait while fighting. Gold sets the total, rather than adding repeatedly. HP must fit the run limit. Check the server's `CW_GM applied` log or query status to confirm application. Commands are also included in console suggestions and `/help`.
