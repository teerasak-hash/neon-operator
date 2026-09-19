import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.customerName || !body.phone || !body.address || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "ข้อมูลคำสั่งซื้อไม่ครบ" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const items = [];

      for (const item of body.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const quantity = Number(item.quantity);
        if (!product || !product.active) throw new Error("ไม่พบสินค้า");
        if (!Number.isInteger(quantity) || quantity < 1) throw new Error("จำนวนสินค้าไม่ถูกต้อง");
        if (product.stock < quantity) throw new Error(`สินค้า ${product.name} เหลือไม่พอ`);

        const unitPrice = Number(product.price);
        total += unitPrice * quantity;
        items.push({ productId: product.id, quantity, unitPrice });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } }
        });
      }

      return tx.order.create({
        data: {
          customerName: body.customerName,
          phone: body.phone,
          address: body.address,
          total,
          items: { create: items }
        },
        include: { items: { include: { product: true } } }
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "สร้างคำสั่งซื้อไม่สำเร็จ" }, { status: 400 });
  }
}