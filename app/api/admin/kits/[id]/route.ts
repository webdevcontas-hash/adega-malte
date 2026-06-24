import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

const kitItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().positive() });
const patchSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(300).nullable().optional(),
  items: z.array(kitItemSchema).min(1).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const { items, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (items) data.items = JSON.stringify(items);

  const kit = await prisma.kit.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ ...kit, items: JSON.parse(kit.items) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.kit.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
