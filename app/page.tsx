import { prisma } from "@/lib/prisma";
import StorefrontV2 from "@/components/v2/StorefrontV2";

// ISR: a página é cacheada e revalidada a cada 60s (TTFB melhor no 3G/4G e cache de CDN),
// em vez de re-renderizar e bater no banco a cada acesso. Alterações de catálogo
// aparecem em até 60s — use revalidatePath("/") no fluxo de admin para refletir na hora.
export const revalidate = 60;

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, OR: [{ stock: null }, { stock: { gt: 0 } }] },
    orderBy: { name: "asc" },
  });

  return <StorefrontV2 products={products} />;
}
