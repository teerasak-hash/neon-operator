import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = [
    {name:"ปลานิลสด",slug:"tilapia",description:"ปลานิลสดคัดคุณภาพ",price:89,stock:30},
    {name:"ปลาทับทิม",slug:"red-tilapia",description:"ปลาทับทิมสด เนื้อแน่น",price:129,stock:20},
    {name:"ปลาช่อนนา",slug:"snakehead",description:"ปลาช่อนสด เนื้อแน่น",price:159,stock:15},
    {name:"ปลาดุก",slug:"catfish",description:"ปลาดุกสดสำหรับเมนูไทย",price:79,stock:25}
  ];
  for (const product of products) await prisma.product.upsert({where:{slug:product.slug},update:product,create:product});
}
main().finally(()=>prisma.$disconnect());
