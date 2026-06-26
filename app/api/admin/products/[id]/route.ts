import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";
import { revalidatePath } from "next/cache";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  price: z.number().positive().optional(),
  category: z.enum(["Cervejas", "Destilados", "Tabacaria", "Combos/Gelo"]).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isAvailable: z.boolean().optional(),
  stock: z.number().int().min(0).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
