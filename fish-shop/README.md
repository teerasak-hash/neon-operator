# ขายปลาออนไลน์

ระบบร้านขายปลาที่เริ่มต้นด้วย Next.js + PostgreSQL + Prisma

## ฟีเจอร์ชุดแรก
- หน้าร้านสินค้า
- รายละเอียดปลา
- โครงสร้างคำสั่งซื้อ
- PostgreSQL ผ่าน Prisma
- API สินค้า
- Seed สินค้าตัวอย่าง

## เริ่มใช้งาน
1. คัดลอก `.env.example` เป็น `.env.local`
2. ตั้งค่า `DATABASE_URL`
3. `npm install`
4. `npm run db:push`
5. `npm run db:seed`
6. `npm run dev`

โฟลเดอร์นี้แยกจาก Neon Kubernetes Operator เดิมเพื่อไม่กระทบโค้ด Go
