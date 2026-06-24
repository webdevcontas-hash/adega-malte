import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

const zoneSchema = z.object({
  neighborhood: z.string().trim().min(1).max(100),
  fee: z.number().min(0),
});

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const zones = await prisma.deliveryZone.findMany({ orderBy: { neighborhood: "asc" } });
  return NextResponse.json(zones);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = zoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  try {
    const zone = await prisma.deliveryZone.create({ data: parsed.data });
    return NextResponse.json(zone, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bairro já cadastrado." }, { status: 409 });
  }
}
