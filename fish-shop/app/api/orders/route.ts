import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customerName = cleanText(body.customerName, 120);
    const phone = cleanText(body.phone, 30);
    const address = cleanText(body.address, 500);

    if (!customerName || !phone || !address || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      return NextResponse.json({ error: "ข้อมูลคำสั่งซื้อไม่ครบหรือไม่ถูกต้อง" }, { status: 400 });
    }

    const requested = new Map<string, number>();
    for (const item of body.items) {
      if (!item || typeof item.productId !== "string") {
        return NextResponse.json({ error: "ข้อมูลสินค้าไม่ถูกต้อง" }, { status: 400 });
      }
      const quantity = Number(item.quantity);
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000) {
        return NextResponse.json({ error: "จำนวนสินค้าไม่ถูกต้อง" }, { status: 400 });
      }
      requested.set(item.productId, (requested.get(item.productId) ?? 0) + quantity);
    }

    const order = await prisma.$transaction(async (tx) => {
      const items: Array<{ productId: string; quantity: number; unitPrice: number }> = [];
      let total = 0;

      for (const [productId, quantity] of requested) {
        const product = await tx.product.findFirst({
          where: { id: productId, active: true },
        });

        if (!product) throw new Error("ไม่พบสินค้าที่เลือก");
        
        const updated = await tx.product.updateMany({
          where: { id: product.id, active: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });

        if (updated.count !== 1) {
          throw new Error(`สินค้า ${product.name} เหลือไม่พอ`);
        }

        const unitPrice = Number(product.price);
        total += unitPrice * quantity;
        items.push({ productId: product.id, quantity, unitPrice });
      }

      return tx.order.create({
        data: {
          customerName,
          phone,
          address,
          total,
          items: { create: items },
        },
        include: { items: { include: { product: true } } },
      });
    }, { isolationLevel: "Serializable" });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "สร้างคำสั่งซื้อไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
