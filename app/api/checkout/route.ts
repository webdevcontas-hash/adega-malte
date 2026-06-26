import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPaymentClient } from "@/lib/mercadopago";
import { isStoreOpenAsync } from "@/lib/business-hours";
import { getDeliveryFeeAsync } from "@/lib/delivery-db";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[\d\s()+-]+$/, "Telefone inválido"),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  cep: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  address: z.string().trim().min(1).max(300),
  couponCode: z.string().trim().toUpperCase().optional(),
  paymentMethod: z.enum(["pix", "card", "cash"]).default("pix"),
  changeFor: z.number().positive().max(100000).optional(),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(99) }))
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  if (!(await isStoreOpenAsync())) {
    return NextResponse.json({ error: "Fora do horário de funcionamento." }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados do pedido inválidos." }, { status: 400 });
  }

  const { customerName, phone, email, cep, neighborhood, address, couponCode, paymentMethod, changeFor, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, isAvailable: true },
  });

  if (products.length !== new Set(items.map((item) => item.productId)).size) {
    return NextResponse.json({ error: "Um ou mais produtos não estão disponíveis." }, { status: 400 });
  }

  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId)!;
    if (product.stock != null && item.quantity > product.stock) {
      return NextResponse.json({ error: `Estoque insuficiente de "${product.name}".` }, { status: 400 });
    }
  }

  const deliveryFee = await getDeliveryFeeAsync(neighborhood);
  const orderItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)!;
    return { productId: product.id, quantity: item.quantity, price: product.price };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Validar e aplicar cupom no servidor (nunca confiar no valor vindo do client)
  let couponDiscount = 0;
  let validatedCouponCode: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.active && (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) && subtotal + deliveryFee >= coupon.minOrder) {
      couponDiscount =
        coupon.type === "percent"
          ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
          : Math.min(coupon.value, subtotal);
      validatedCouponCode = coupon.code;
    }
  }

  const total = Math.round((subtotal + deliveryFee - couponDiscount) * 100) / 100;

  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      email: email || null,
      address,
      neighborhood,
      cep,
      deliveryFee,
      total,
      couponCode: validatedCouponCode,
      couponDiscount: couponDiscount > 0 ? couponDiscount : null,
      paymentMethod,
      changeFor: paymentMethod === "cash" ? changeFor ?? null : null,
      status: "PENDING",
      items: { create: orderItems },
    },
  });

  // Incrementa contador de uso do cupom após pedido criado com sucesso
  if (validatedCouponCode) {
    await prisma.coupon.update({
      where: { code: validatedCouponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Pagamento na entrega (dinheiro/cartão): pedido confirmado sem Pix/Mercado Pago.
  if (paymentMethod !== "pix") {
    return NextResponse.json({ orderId: order.id, total, paymentMethod, changeFor: order.changeFor ?? undefined });
  }

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: total,
        description: `Pedido Malte & Tabaco #${order.id.slice(-6).toUpperCase()}`,
        payment_method_id: "pix",
        external_reference: order.id,
        notification_url: process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`
          : undefined,
        date_of_expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        payer: {
          email: `pedido-${order.id}@maltetabaco.com.br`,
          first_name: customerName,
        },
      },
    });

    const transactionData = payment.point_of_interaction?.transaction_data;
    if (!transactionData?.qr_code || !transactionData?.qr_code_base64) {
      throw new Error("Mercado Pago não retornou os dados do Pix.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pixId: String(payment.id),
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      total,
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
    });
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    console.error("[checkout] erro ao gerar pagamento Pix:", error);
    return NextResponse.json({ error: "Não foi possível gerar o pagamento Pix." }, { status: 502 });
  }
}
