import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";

const kitItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().positive() });
const kitSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional(),
  items: z.array(kitItemSchema).min(1),
  active: z.boolean().default(true),
});

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const kits = await prisma.kit.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(kits.map((k) => ({ ...k, items: JSON.parse(k.items) })));
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = kitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });

  const { items, ...rest } = parsed.data;
  const kit = await prisma.kit.create({ data: { ...rest, items: JSON.stringify(items) } });
  return NextResponse.json({ ...kit, items }, { status: 201 });
}
