import { prisma } from "@/lib/prisma";

export async function decrementStock(items: { productId: string; quantity: number }[]) {
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
    if (product?.stock == null) continue;
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: Math.max(0, product.stock - item.quantity) },
    });
  }
}
