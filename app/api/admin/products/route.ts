import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/dashboard-auth";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  price: z.number().positive(),
  category: z.enum(["Cervejas", "Destilados", "Tabacaria", "Combos/Gelo"]),
  description: z.string().trim().max(500).optional(),
  isAvailable: z.boolean().default(true),
});

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.create({ data: parsed.data });
  revalidatePath("/");
  return NextResponse.json(product, { status: 201 });
}
