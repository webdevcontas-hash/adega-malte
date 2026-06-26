import { NextRequest, NextResponse } from "next/server";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getPaymentClient } from "@/lib/mercadopago";
import { notifyOrderPaid } from "@/lib/whatsapp";
import { decrementStock } from "@/lib/stock";

export async function POST(request: NextRequest) {
  const dataId = request.nextUrl.searchParams.get("data.id");
  const type = request.nextUrl.searchParams.get("type");
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
        toleranceSeconds: 300,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        console.warn("[webhook] assinatura inválida:", error.reason);
        return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
      }
      throw error;
    }
  }

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await getPaymentClient().get({ id: dataId });

    if (payment.status === "approved" && payment.external_reference) {
      const order = await prisma.order.findUnique({
        where: { id: payment.external_reference },
        include: { items: { include: { product: true } } },
      });

      if (order && order.status !== "PAID") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
        await decrementStock(order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
        await notifyOrderPaid(order);
      }
    }
  } catch (error) {
    // Não propaga 500: responde 200 para o Mercado Pago não reenviar em loop por erro nosso.
    console.error("[webhook] erro ao processar notificação:", error);
  }

  return NextResponse.json({ received: true });
}
