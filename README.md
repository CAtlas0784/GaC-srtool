# GaC-Srtool 🌌

**GaC-Srtool** คือเว็บแอปพลิเคชันแดชบอร์ด (Web Dashboard & Management Tool) สำหรับจัดการข้อมูลตัวละคร, สถานะผู้เล่น, จุดวาร์ป, และไฟล์เซฟ (`freesr-data.json`, `persistent`) ของเซิร์ฟเวอร์ **GaC-hkrpg-go** (และ FreeSR Private Server)

ถูกออกแบบให้ทำงานแบบ **Client-side 100%** ไม่มีเซิร์ฟเวอร์หลังบ้าน จึงสามารถโฮสต์ผ่าน **GitHub Pages** ได้ฟรีตลอดชีพ ไม่ต้องเสียค่าบริการใดๆ!

---

## ✨ ความสามารถหลัก (Features)

1. **📊 หน้าแดชบอร์ด (Overview Dashboard):**
   - แสดงสถานะเซิร์ฟเวอร์สด (Live Health Status)
   - นับจำนวนตัวละคร, กรวยแสง (Lightcones), และรีลิกส์ (Relics) ทั้งหมด
   - แสดงพิกัดตัวละครปัจจุบัน (Plane, Floor, X, Y, Z) และการจัดทีม (Current Lineup)
2. **👥 จัดการตัวละคร (Avatars & Eidolons):**
   - ดูรายชื่อตัวละครทั้งหมดพร้อมสาย Path, ธาตุ และระดับดาว
   - ปรับเลเวลและการปลดดาว Eidolon (E0 - E6) รายตัวแบบเรียลไทม์
   - ปุ่ม **Max All** ตัวละครทุกตัวเป็น Lv. 80 และ E6 ในคลิกเดียว
3. **⚡ ระบบ Ex-Rank Skills:**
   - สลับเปิด/ปิด Ex-Rank ของตัวละครพิเศษ (Jing Yuan CC immunity, Dan Heng • IL, Acheron)
   - สั่งเปิดหรือปิด Ex-Rank ทุกตัวละครพร้อมกันได้ทันที
4. **🚀 วาร์ปฉากและตำแหน่ง (Teleportation):**
   - รวมจุดวาร์ปปลอดภัยยอดนิยม (Astral Express Parlor Car, Herta Station, Belobog, Xianzhou Luofu, Penacony)
   - กล่องใส่วาร์ปแบบกำหนดเอง (Plane ID, Floor ID, Entry ID, พิกัด X, Y, Z)
5. **📝 จัดการไฟล์ JSON (FreeSR Data & Persistent Editor):**
   - โหลดและแก้ไขไฟล์ `freesr-data.json` และ `persistent` บนเซิร์ฟเวอร์ได้โดยตรง
   - มีระบบตรวจเช็ค Syntax JSON และจัดรูปแบบโค้ด (Beautify)
   - ดาวน์โหลด Backup หรืออัปโหลดไฟล์ JSON จากเครื่องขึ้นเซิร์ฟเวอร์
6. **⚙️ เชื่อมต่อแบบ Dynamic (No Hardcode):**
   - สามารถระบุ REST API Gateway URL (เช่น `http://localhost:21000` หรือ IP เครื่องในวง LAN) ผ่านหน้าต่างตั้งค่า โดยค่าจะถูกบันทึกไว้ในเบราว์เซอร์ (`localStorage`)

---

## 🌐 วิธีนำขึ้นโฮสต์ GitHub Pages (ฟรี 100%)

คุณสามารถโฮสต์เว็บนี้ผ่าน GitHub ได้ง่ายๆ เพียง 4 ขั้นตอน:

### ขั้นตอนที่ 1: สร้าง Repository บน GitHub
1. เข้าไปที่ [GitHub.com](https://github.com) แล้วกด **New repository**
2. ตั้งชื่อ เช่น `GaC-srtool` (จะเลือก Public หรือ Private ก็ได้)
3. **ไม่ต้อง** ติ๊กถูกที่ช่อง "Add a README file" จากนั้นกด **Create repository**

### ขั้นตอนที่ 2: Push โปรเจกต์ขึ้น GitHub
เปิด Terminal / PowerShell ในโฟลเดอร์นี้ แล้วรันคำสั่ง:

```bash
git remote add origin https://github.com/<ชื่อผู้ใช้ของคุณ>/GaC-srtool.git
git add .
git commit -m "feat: initial commit for GaC-srtool dashboard"
git push -u origin main
```

### ขั้นตอนที่ 3: เปิดใช้งาน GitHub Pages
1. ในหน้า Repo ของคุณบน GitHub ไปที่แท็บ **Settings**
2. ที่เมนูด้านซ้าย เลือกหัวข้อ **Pages**
3. ใต้หัวข้อ **Build and deployment**:
   - **Source:** เลือก `Deploy from a branch`
   - **Branch:** เลือก `main` และโฟลเดอร์ `/ (root)`
   - กดปุ่ม **Save**
   *(หรือจะเลือก Source เป็น `GitHub Actions` ก็ได้ ตัวโปรเจกต์มี `.github/workflows/deploy.yml` เตรียมไว้ให้อัตโนมัติแล้ว)*

### ขั้นตอนที่ 4: ใช้งานได้ทันที
รอระบบ GitHub Deploy ประมาณ 1 นาที คุณจะได้รับ URL เว็บไซต์ เช่น:
```
https://<ชื่อผู้ใช้ของคุณ>.github.io/GaC-srtool/
```
สามารถเปิดจากเบราว์เซอร์เครื่องใดก็ได้ หรือเปิดจากมือถือ/แท็บเล็ตในวงแลนเดียวกันได้เลย!

---

## 💡 หมายเหตุเรื่องการเชื่อมต่อ Browser (Mixed Content)

- เมื่อเปิดหน้าเว็บผ่าน `https://...github.io` และทำการเชื่อมต่อกับเซิร์ฟเวอร์ที่เครื่องของเรา (`http://localhost:21000`):
  - เบราว์เซอร์สมัยใหม่ (Google Chrome, Microsoft Edge, Brave) อนุญาตให้หน้าเว็บ HTTPS ยิง request ไปยัง `http://localhost:*` หรือ `http://127.0.0.1:*` ได้ทันที (ตามมาตรฐาน W3C Localhost Exception)
  - หากใช้เบราว์เซอร์บางตัวที่แจ้งเตือนความปลอดภัย (Insecure Content / Mixed Content): สามารถกดไอคอนรูปกุญแจ/การตั้งค่าที่หน้า URL Bar แล้วเลือก **Site settings** -> **Insecure content: Allow** ได้ครับ

---

## 💻 การทดสอบและรันในเครื่อง (Local Development)

หากต้องการเปิดใช้งานหรือพัฒนาในเครื่องโดยไม่ต้องต่อเน็ต:
1. **เปิดตรง:** ดับเบิ้ลคลิกไฟล์ `index.html` เพื่อเปิดใช้งานบนเบราว์เซอร์ได้ทันที
2. **รัน Local Server:**
   ```bash
   npm run dev
   # หรือ
   npx serve . -l 5173
   ```
   เปิดเว็บที่ `http://localhost:5173`
