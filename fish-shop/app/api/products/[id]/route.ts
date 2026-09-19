import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function numberField(value: unknown, integer = false) {
  const n = Number(value);
  return Number.isFinite(n) && (!integer || Number.isInteger(n)) ? n : null;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 150) return NextResponse.json({ error: "ชื่อสินค้าไม่ถูกต้อง" }, { status: 400 });
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.length > 2000) return NextResponse.json({ error: "รายละเอียดสินค้าไม่ถูกต้อง" }, { status: 400 });
      data.description = body.description.trim();
    }
    if (body.price !== undefined) {
      const price = numberField(body.price);
      if (price === null || price < 0 || price > 99999999) return NextResponse.json({ error: "ราคาสินค้าไม่ถูกต้อง" }, { status: 400 });
      data.price = price;
    }
    if (body.stock !== undefined) {
      const stock = numberField(body.stock, true);
      if (stock === null || stock < 0 || stock > 2147483647) return NextResponse.json({ error: "สต็อกไม่ถูกต้อง" }, { status: 400 });
      data.stock = stock;
    }
    if (body.imageUrl !== undefined) {
      if (body.imageUrl !== null && (typeof body.imageUrl !== "string" || body.imageUrl.length > 2000)) return NextResponse.json({ error: "URL รูปภาพไม่ถูกต้อง" }, { status: 400 });
      data.imageUrl = body.imageUrl;
    }
    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") return NextResponse.json({ error: "สถานะสินค้าไม่ถูกต้อง" }, { status: 400 });
      data.active = body.active;
    }

    if (!Object.keys(data).length) return NextResponse.json({ error: "ไม่มีข้อมูลสำหรับแก้ไข" }, { status: 400 });

    const product = await prisma.product.update({ where: { id }, data: data as any });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "แก้ไขสินค้าไม่สำเร็จ" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
  }
}
