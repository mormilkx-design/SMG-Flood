# SMG Manufacturing Club — Next.js + Supabase + Vercel

โครงการแยกสำหรับย้ายระบบเดิม (19 บริษัท) ไม่เปลี่ยนเว็บไซต์เดิม
โค้ดเว็บรันที่ Vercel ส่วน Supabase เก็บรายงานและรูป โหมด Google Login เป็นตัวเลือกเมื่อพร้อมกำหนดสิทธิ์
GitHub เก็บเฉพาะโค้ด ไม่เก็บข้อมูลรายงานหรือรูปของผู้ใช้

## เริ่มใช้งานทันทีโดยยังไม่ต้องล็อกอิน

หากรัน SQL แล้ว ให้อ่าน `QUICK-START-NO-LOGIN.md` ก่อน รุ่นนี้เปิด `NEXT_PUBLIC_REPORT_AUTH_MODE=public` โดยค่าเริ่มต้นใน `.env.example` ผู้ชมสามารถดูและส่งรายงานโดยไม่ใช้ Google Login ได้
ขั้นตอน Google Login และ reporter_access ด้านล่างใช้เมื่อคุณพร้อมเปลี่ยนโหมดเป็น `gmail` เท่านั้น

## สิ่งที่อยู่ในชุดนี้
- หน้าภาพรวม สถานะรายงาน ประวัติ CCTV และรายงานประจำวันจากเว็บเดิม
- PDF หน้าละ 9 บริษัท จัด 3 คอลัมน์ หัวข้อกลางหน้า สีตามสถานะและเรียงวิกฤต/เฝ้าระวังก่อน
- Google Login แบบ PKCE ใช้ Gmail เท่านั้น; สิทธิ์ผู้ส่งแยกตามบริษัท
- รูป 2 จุด จุดละ 1–3 ภาพ JPEG/PNG/WebP ไม่เกินภาพละ 5 MB
- อัปโหลดตรงไป Supabase ผ่าน signed upload URL; API รับเฉพาะข้อมูลข้อความและรหัสรูป
- คำนวณความเสี่ยงบนเซิร์ฟเวอร์ตาม `lib/risk.ts` กฎเดียวกับระบบเดิม
- อ่านรายงานเป็นชุดละ 500 แถวจนหมด ไม่มีเพดาน 2,000 รายการแบบเดิม
- SQL schema, ตัวอย่างสิทธิ์ผู้รายงาน, importer ข้อมูลเดิม และ cleanup รูปที่ยังไม่ส่งรายงาน

ชุดนี้ไม่มีรายงานจริง รูปที่ผู้ใช้เคยส่ง รหัสผ่าน หรือกุญแจ API

## 1. สร้าง Supabase
1. สมัคร https://supabase.com และสร้าง New project ในบัญชีองค์กร
2. เลือกภูมิภาคใกล้ผู้ใช้งาน เช่น Singapore หากมีให้เลือก
3. เปิด SQL Editor รัน `supabase/01-schema.sql` บน project ใหม่
4. จะได้ companies 19 รายการ, reports, photo_objects, reporter_access และ private bucket `flood-photos`
5. ตารางเปิด RLS และไม่ให้ anon/authenticated อ่านหรือเขียนตรง การเข้าถึงผ่าน API เซิร์ฟเวอร์ซึ่งใช้ service role
6. API รายงานและรูปที่ผูกกับรายงานเปิดให้สาธารณะอ่าน ผู้ส่งต้องผ่าน Gmail และได้รับสิทธิ์บริษัท

ห้ามตั้ง bucket เป็น Public เอง รูปที่ยังไม่ได้ส่งรายงานจะไม่ถูกเผยแพร่โดย API

## 2. ตั้ง Google Login (ข้ามได้เมื่อใช้โหมด public)
1. ใน Google Cloud Console สร้าง project และตั้ง OAuth consent screen / Google Auth Platform (Audience, Branding, Data Access)
2. สร้าง OAuth Client ID แบบ Web application
3. ตั้ง Authorized redirect URI เป็น `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. นำ Google Client ID และ Client Secret ไปใส่ Supabase → Authentication → Sign In / Providers → Google และเปิดใช้งาน
5. Supabase → Authentication → URL Configuration:
   - ตอนทดสอบ Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - หลัง deploy เพิ่ม `https://YOUR_SITE.vercel.app/auth/callback` และเปลี่ยน Site URL เป็นโดเมนจริง
6. หาก Google app ยังเป็น Testing เพิ่ม Gmail ของผู้ทดสอบใน Test users ก่อน หลังพร้อมใช้งานให้ตั้ง Audience/สถานะ publication ตามข้อกำหนด Google
7. Login ต้องเริ่มและ callback ใน browser/device เดียวกัน เพราะ PKCE verifier เก็บใน browser

API ตรวจ token ด้วย Supabase Auth `getUser()` จริง ไม่รับอีเมลที่พิมพ์เป็นหลักฐานยืนยันตัวตน

## 3. ใส่ค่า Environment
คัดลอก `.env.example` เป็น `.env.local` แล้วแทนค่า:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

URL และ publishable key ดูใน Supabase Project Settings / API Keys หรือ Connect dialog
service_role key เป็นกุญแจฝั่งเซิร์ฟเวอร์ เก็บใน `.env.local` และ Vercel Environment Variables เท่านั้น
ห้ามใช้ชื่อ NEXT_PUBLIC_ กับ service_role และห้ามส่งกุญแจจริงขึ้น GitHub
Google Client Secret เก็บใน Supabase Provider settings ไม่ต้องใส่ในเว็บ

## 4. อนุญาต Gmail สำหรับแต่ละบริษัท (ข้ามได้เมื่อใช้โหมด public)
เปิด SQL Editor แล้วแก้ `supabase/02-reporter-access.example.sql` เป็นอีเมลจริง เช่น:

```sql
insert into public.reporter_access(email,company,enabled)
values ('reporter@gmail.com','BKC',true)
on conflict(email,company) do update set enabled=true;
```

หนึ่งอีเมลมีหลายบริษัทได้โดยเพิ่มหลายแถว ใช้อีเมลตัวพิมพ์เล็ก
ทุก Gmail เข้าสู่ระบบได้ แต่ส่งรายงานได้เฉพาะบริษัทที่ได้รับสิทธิ์
ยกเลิกสิทธิ์ด้วย enabled=false ไม่ต้องลบประวัติรายงาน
หน้าฟอร์มยังแสดงบริษัททั้งหมด หากเลือกบริษัทที่ไม่มีสิทธิ์ API จะแจ้งข้อผิดพลาด
ชุดนี้บริหารสิทธิ์ผ่าน SQL Editor ยังไม่มีหน้าผู้ดูแลสิทธิ์ในเว็บ

## 5. รันทดสอบบน Windows
ติดตั้ง Node.js เวอร์ชัน LTS ที่รองรับโครงการ (อย่างน้อย 22.13) และ VS Code
แตก ZIP แล้วเปิดโฟลเดอร์ `smg-flood-nextjs` ที่มี package.json ใน VS Code
เปิด Terminal:

```powershell
npm ci
npm run dev
```

เปิด http://localhost:3000 จากนั้นทดลองส่งรายงาน 2 จุดโดยไม่ต้องเข้าสู่ระบบในโหมด public
ตรวจ Supabase ว่ามีรายงานและไฟล์จริง และเปิดรูปได้ทั้งหน้าเว็บและ PDF
ตรวจ build ด้วย `npm run build`

## 6. ขึ้น GitHub
สร้าง Private repository เช่น `smg-flood-dashboard`
ใช้ GitHub Desktop → Add local repository / Create repository ในโฟลเดอร์โครงการ → Commit → Publish repository (Private)
หรือใช้ Git ในโฟลเดอร์ที่แตกไฟล์:

```powershell
git init
git add .
git commit -m "Prepare SMG flood dashboard for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/smg-flood-dashboard.git
git push -u origin main
```

แทน YOUR_ACCOUNT เป็นบัญชีจริง ก่อน commit ตรวจว่าไม่มี .env.local หรือ data-export ติดไปด้วย
.gitignore เตรียมไว้แล้ว แต่หากเคย commit secret ต้องเปลี่ยนกุญแจใหม่ ไม่ใช่แค่ลบไฟล์

## 7. ขึ้น Vercel
1. Add New → Project → เชื่อม GitHub → Import repository
2. Framework: Next.js, Root Directory: โฟลเดอร์ที่มี package.json (ปกติ ./)
3. Build: `npm run build`; Output Directory ใช้ค่าอัตโนมัติของ Next.js ไม่ต้องใส่ dist
4. ใส่ Environment Variables 3 ตัวตาม .env.local ให้ Production และ Preview ที่ต้องใช้
5. Deploy แล้วนำ URL จริงไปตั้งใน Supabase URL Configuration (ขั้น 2)
6. หากแก้ Environment Variables ให้ Redeploy
7. เปิด production URL ใน browser ที่ไม่ได้เข้าสู่ Vercel เพื่อยืนยันว่า Dashboard ดูได้สาธารณะ
8. Push branch main จะอัปเดตเว็บไซต์ผ่าน Git integration

งานองค์กรควรเลือกแพ็กเกจ Vercel ที่อนุญาตการใช้งานองค์กร/เชิงพาณิชย์ (Hobby จำกัด personal non-commercial)
ค่าฐานข้อมูล/Storage ของ Supabase และค่ารันเว็บไซต์ Vercel แยกกัน

## 8. ย้ายข้อมูลเดิม
ต้องส่งออก D1 ทุกแถวและไฟล์ R2 ทุกภาพ ไม่ใช้ API เดิมที่ LIMIT 2000 เป็นแหล่ง export ทั้งหมด
CSV จาก Dashboard ไม่รวมรูป จึงไม่พอสำหรับการย้ายครบถ้วน
เตรียมโฟลเดอร์นอก Git:

- data-export/reports.json: JSON array ของแถว reports ทั้งหมดจาก D1 (รองรับรูปแบบ {reports:[]} จากเว็บด้วย แต่ต้องครบทุกแถว)
- data-export/photos/<UUID>: ไฟล์รูปจริงของแต่ละรหัสภาพ ไม่มีนามสกุลตาม object key เดิม

ตรวจไฟล์และจำนวนให้ครบ แล้วรัน:

```powershell
node --env-file=.env.local scripts/import-legacy.mjs data-export
```

Importer ตรวจว่ามีไฟล์ภาพครบก่อนเริ่ม เขียนข้อมูลพร้อมรหัสเดิม และรันซ้ำต่อได้ด้วย upsert
รายงานเดิมเก็บ author เป็น legacy:<ID เดิม> เพราะ ChatGPT ID ไม่ใช่ Supabase user ID
ไม่ย้ายบัญชี ChatGPT; ผู้รายงาน Google Login ใหม่ และตั้ง reporter_access ใหม่
Importer รักษาคะแนน/สถานะเดิม ไม่คำนวณย้อนหลังใหม่
ตรวจจำนวน reports และ photo_objects เปรียบเทียบต้นทาง และสุ่มเปิดรูปทุกบริษัทก่อนเปลี่ยนลิงก์
หากไม่ผ่านกลางทาง ให้แก้สาเหตุและรันซ้ำ ข้อมูลนำเข้าไม่ได้เป็น transaction ทั้งชุด
อย่าปิดเว็บเดิมก่อนตรวจครบ กำหนดช่วงหยุดรับรายงานเพื่อ export รอบสุดท้ายไม่ให้ข้อมูลตกหล่น

## 9. ดูแลหลังใช้งาน
- API จำกัดการเตรียมอัปโหลด 60 ภาพต่อผู้ใช้ต่อชั่วโมง
- ภาพที่อัปโหลดแล้วแต่ไม่ได้ส่งรายงานยังค้างเป็น pending
- สั่งลบ pending เก่ากว่า 24 ชั่วโมงด้วยคำสั่งด้านล่าง (ยังไม่ได้ตั้ง schedule อัตโนมัติ):

```powershell
node --env-file=.env.local scripts/cleanup-pending.mjs
```

- เมื่อข้อมูลหลายปีเพิ่มขึ้น การโหลดรายงานทั้งหมดทุกครั้งอาจช้า ควรปรับ UI ให้โหลดเฉพาะช่วงวันที่/บริษัทและแคช; ชุดนี้แบ่ง API เป็นหน้าแล้วแต่ frontend ยังรวมทั้งหมดเพื่อรักษากราฟ/ประวัติเดิม
- ตรวจโควตาและการสำรองข้อมูลฐานข้อมูลและ Storage แยกกัน การสำรอง DB อย่างเดียวไม่ใช่การสำรองภาพ
- PDF ยังเป็น browser print คง CSS เดิมไว้ ต้องตรวจ Print Preview ใน Safari/iPhone และ Chrome จริงก่อนเปิดใช้งาน

## ข้อจำกัดการตรวจสอบชุดนี้
ดู `VALIDATION.md` สำหรับผลตรวจ build และการทดสอบที่ทำจริง
ยังไม่มี Supabase project/key ของคุณ จึงยังไม่ได้ทดสอบ Google OAuth และการบันทึกกับฐานข้อมูลจริง

## เอกสารทางการ
- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl
- https://vercel.com/docs/functions/limitations
