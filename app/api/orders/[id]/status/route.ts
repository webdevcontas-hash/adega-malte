import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";
import { decrementStock } from "@/lib/stock";

const VALID_STATUSES = ["WAITING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { deliveryStatus } = body as { deliveryStatus?: string };
  if (!deliveryStatus || !VALID_STATUSES.includes(deliveryStatus as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "deliveryStatus inválido." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  // Ao entregar, conclui a venda: garante status DELIVERED (essencial para pedidos
  // "paga na entrega", que entram como PENDING e só viram venda no recebimento).
  // Pedidos Pix já decrementaram o estoque ao serem marcados PAID no webhook.
  const isNewSale = deliveryStatus === "DELIVERED" && order.status !== "PAID" && order.status !== "DELIVERED";

  const updated = await prisma.order.update({
    where: { id },
    data: { deliveryStatus, ...(deliveryStatus === "DELIVERED" ? { status: "DELIVERED" } : {}) },
    select: { id: true, deliveryStatus: true, status: true },
  });

  if (isNewSale) {
    await decrementStock(order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
  }

  return NextResponse.json(updated);
}
