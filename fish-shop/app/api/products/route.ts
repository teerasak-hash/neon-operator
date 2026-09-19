import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const price = Number(b.price);
    const stock = Number(b.stock);
    if (!b.name || !b.slug || !b.description || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "ข้อมูลสินค้าไม่ถูกต้อง" }, { status: 400 });
    }
    const p = await prisma.product.create({
      data: { name: b.name, slug: b.slug, description: b.description, price, stock, imageUrl: b.imageUrl || null, active: b.active ?? true }
    });
    return NextResponse.json(p, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "สร้างสินค้าไม่สำเร็จ" }, { status: 400 });
  }
}