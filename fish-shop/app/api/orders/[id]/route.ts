import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } }
  });
  if (!order) return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });

  const order = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json(order);
}