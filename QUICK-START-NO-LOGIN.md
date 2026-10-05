# เริ่มใช้งานโดยยังไม่ต้องเข้าสู่ระบบ

คุณรัน SQL ใน Supabase แล้ว ให้ทำขั้นตอนต่อไปนี้ได้เลย **ยังไม่ต้องตั้ง Google Login และยังไม่ต้องเพิ่ม Gmail ใน reporter_access** ชุดนี้ตั้ง `NEXT_PUBLIC_REPORT_AUTH_MODE=public` ให้เปิดอ่านและส่งรายงานโดยไม่เข้าสู่ระบบ

## 1. หา URL และ Keys จาก Supabase

ไปที่ Supabase → Project Settings → API Keys (หรือปุ่ม Connect ของ Project)

- Project URL → ใช้กับ `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key (บาง Project แสดงชื่อ `anon` key) → ใช้กับ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `service_role` key หรือ Secret API key ที่ใช้ service role → ใช้กับ `SUPABASE_SERVICE_ROLE_KEY` **ห้ามเผยแพร่หรือส่งมาในแชต**

ตรวจ Project URL ว่าเป็นโปรเจกต์เดียวกับที่รัน SQL แล้ว

## 2. รันเว็บบน Windows

1. แตกไฟล์ ZIP และเปิดโฟลเดอร์ **smg-flood-nextjs** ใน VS Code (ต้องเห็น `package.json`)
2. ติดตั้ง Node.js LTS เวอร์ชันอย่างน้อย 22.13 ถ้ายังไม่มี
3. เปิด Terminal ใน VS Code แล้วรัน:

```powershell
Copy-Item .env.example .env.local
```

4. เปิด `.env.local` แล้วเปลี่ยนค่า `YOUR_PROJECT` และ `YOUR_*_KEY` ให้เป็นของจริง โดยให้บรรทัดแรกเป็น:

```env
NEXT_PUBLIC_REPORT_AUTH_MODE=public
```

5. บันทึกไฟล์ แล้วรัน:

```powershell
npm ci
npm run dev
```

6. เมื่อ Terminal แสดง `Ready` และ `Local: http://localhost:3000` ให้เปิด http://localhost:3000 ใน browser
7. หน้าแรกควรแสดง 19 บริษัทเป็น **ยังไม่รายงาน** ถ้ายังไม่มีข้อมูลเดิม
8. ทดลองกด **ส่งรายงานประจำวัน** เลือกบริษัท กรอกข้อมูล และแนบภาพสองจุด จุดละอย่างน้อยหนึ่งภาพ จากนั้นเปิด PDF ทดสอบ
9. ปิดเว็บบนเครื่องด้วย `Ctrl+C` ใน Terminal

ถ้าหน้าขึ้นข้อความ `Storage unavailable` หรือ `ยังโหลดรายงานไม่ได้` ตรวจค่า 3 ตัวใน `.env.local` และตรวจว่า SQL สร้างตาราง/bucket สำเร็จ จากนั้นหยุดและรัน `npm run dev` ใหม่

**การรันบน localhost เปิดได้เฉพาะเครื่องของคุณ** หากต้องการให้บริษัทอื่นเข้าได้ ต้อง Deploy ไป Vercel

## 3. เปิดให้คนอื่นใช้ผ่าน Vercel

1. สร้าง GitHub Repository แบบ Private แล้ว Push โฟลเดอร์โครงการขึ้น GitHub ตาม README-TH.md
2. Vercel → Add New → Project → Import GitHub Repository
3. Framework = Next.js, Root Directory = โฟลเดอร์ที่มี `package.json`, Build Command = `npm run build`
4. ตั้ง Environment Variables **4 ตัว** ใน Vercel: `NEXT_PUBLIC_REPORT_AUTH_MODE=public` และ Supabase อีก 3 ตัวจากข้อ 1
5. Deploy และเปิด URL ที่ Vercel ให้มา
6. ทดลองเปิดเว็บใน browser ที่ไม่ได้เข้าสู่ระบบ แล้วส่งรายงานตัวอย่างหนึ่งรายการ

โหมดนี้ **ใครก็ตามที่มีลิงก์ส่งรายงานในชื่อ “ผู้ส่งรายงานทั่วไป” ได้** ไม่มีการระบุผู้ส่งตัวจริง จึงควรใช้เฉพาะช่วงทดสอบหรือเมื่อยอมรับให้ทุกคนส่งรายงานได้ หากเปิดสาธารณะระยะยาว ให้เปลี่ยนเป็น `NEXT_PUBLIC_REPORT_AUTH_MODE=gmail` แล้วตั้ง Google Login และสิทธิ์ผู้รายงานตาม `README-TH.md` จากนั้น Redeploy

ระบบยังจำกัดการเตรียมอัปโหลดเป็น 60 ภาพต่อบริษัทต่อชั่วโมง แต่ผู้ใช้ทั่วไปยังสามารถส่งรายงานผิดพลาดหรือส่งซ้ำได้ จึงควรตรวจข้อมูลก่อนใช้ตัดสินใจ

**ข้อมูลเก่าไม่อยู่ใน ZIP** การย้ายข้อมูลเก่าพร้อมรูปให้ทำตามหัวข้อ 8 ใน README-TH.md ภายหลัง
