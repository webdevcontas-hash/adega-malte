import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

const patchSchema = z.object({
  neighborhood: z.string().trim().min(1).max(100).optional(),
  fee: z.number().min(0).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const zone = await prisma.deliveryZone.update({ where: { id: Number(id) }, data: parsed.data });
  return NextResponse.json(zone);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.deliveryZone.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
