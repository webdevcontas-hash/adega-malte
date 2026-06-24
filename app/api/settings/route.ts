import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json({
    deliveryTime: map.deliveryTime ?? "",
    businessHoursOpen: map.businessHoursOpen ?? "18",
    businessHoursClose: map.businessHoursClose ?? "3",
    whatsappNumber: map.whatsappNumber ?? "",
    deliveryDefaultFee: map.deliveryDefaultFee ?? "12",
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { key, value } = body as { key?: string; value?: string };
  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key e value são obrigatórios." }, { status: 400 });
  }

  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  return NextResponse.json({ ok: true });
}
