import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = `e2e-test-${Date.now()}`;
  const product = await prisma.product.create({
    data: {
      name: "E2E ปลา",
      slug,
      description: "temporary e2e product",
      price: 100,
      stock: 3,
    },
  });

  try {
    const requestedQuantity = 2;

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: { id: product.id, active: true, stock: { gte: requestedQuantity } },
        data: { stock: { decrement: requestedQuantity } },
      });
      if (updated.count !== 1) throw new Error("stock update failed");

      return tx.order.create({
        data: {
          customerName: "E2E Test",
          phone: "0000000000",
          address: "E2E",
          total: 200,
          items: { create: [{ productId: product.id, quantity: 2, unitPrice: 100 }] },
        },
        include: { items: true },
      });
    }, { isolationLevel: "Serializable" });

    const after = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });

    if (order.items.length !== 1) throw new Error("order item was not created");
    if (after.stock !== 1) throw new Error(`expected stock=1, got ${after.stock}`);
    if (Number(order.total) !== 200) throw new Error("order total mismatch");

    console.log("E2E PASS: checkout -> order -> stock");
    console.log(`order=${order.id} stock=${after.stock}`);
  } finally {
    await prisma.product.delete({ where: { id: product.id } }).catch(() => undefined);
  }
}

main()
  .catch((error) => {
    console.error("E2E FAIL:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
