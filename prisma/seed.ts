import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const products = [
  // Cervejas
  { name: "Pilsen Estrela Dourada — Lata 350ml", category: "Cervejas", price: 6.9, description: "Leve e refrescante, o clássico do dia a dia." },
  { name: "IPA Lúpulo Selvagem — Garrafa 500ml", category: "Cervejas", price: 14.9, description: "Amargor marcante e aroma cítrico intenso." },
  { name: "Trigo do Japa Weiss — Garrafa 500ml", category: "Cervejas", price: 19.9, description: "Refrescante, aromas de banana e cravo. Receita da casa." },
  { name: "Gorila Imperial Stout — Garrafa 500ml", category: "Cervejas", price: 24.9, description: "Encorpada, com notas de café e chocolate amargo. 8% ABV." },
  { name: "Puro Malte Vintage — Long Neck 355ml", category: "Cervejas", price: 9.9, description: "Maltado e equilibrado, fácil de beber." },
  { name: "Red Ale Outono — Garrafa 500ml", category: "Cervejas", price: 17.9, description: "Notas de caramelo e um final levemente adocicado." },
  { name: "Brisa Sem Álcool — Lata 350ml", category: "Cervejas", price: 7.9, description: "Todo o sabor de cerveja, zero álcool." },
  { name: "Six Pack Pilsen Estrela Dourada — 6 latas 350ml", category: "Cervejas", price: 36.9, description: "Pacote econômico para a rodada." },
  // Destilados
  { name: "Vodka Gelo Polar — 1L", category: "Destilados", price: 49.9, description: "Destilação tripla, ideal para drinks." },
  { name: "Whisky Roble Dourado Blended — 1L", category: "Destilados", price: 99.9, description: "Equilibrado e versátil, ótimo puro ou em coquetéis." },
  { name: "Whisky Old Hokkaido 12 Anos Single Malt — 700ml", category: "Destilados", price: 389.0, description: "Envelhecido em barris de mizunara, notas de mel e incenso." },
  { name: "Gin Botânico Jardim Azul — 750ml", category: "Destilados", price: 89.9, description: "Notas florais e cítricas, perfeito para uma boa tônica." },
  { name: "Saquê Sakura no Yume Junmai Premium — 720ml", category: "Destilados", price: 145.0, description: "Encorpado, levemente adocicado, com notas de pera asiática." },
  { name: "Saquê Kawa Doce Nigori — 500ml", category: "Destilados", price: 79.9, description: "Turvo e cremoso, ideal para quem está começando no mundo do sakê." },
  { name: "Cachaça Ouro do Vale Envelhecida — 700ml", category: "Destilados", price: 54.9, description: "Envelhecida em carvalho, suave e aromática." },
  { name: "Tequila Agave Prateado — 750ml", category: "Destilados", price: 119.9, description: "100% agave, ideal para shots e drinks." },
  // Tabacaria
  { name: "Cigarro de Palha Artesanal — Maço", category: "Tabacaria", price: 12.9, description: "Enrolado artesanalmente, tabaco selecionado." },
  { name: "Charuto Curado Reserva — Unidade", category: "Tabacaria", price: 39.9, description: "Curado lentamente, sabor intenso e equilibrado." },
  { name: "Essência para Narguilé Menta Geleira — 50g", category: "Tabacaria", price: 24.9, description: "Refrescante, com final gelado marcante." },
  { name: "Carvão Autoacendível para Narguilé — Pacote", category: "Tabacaria", price: 14.9, description: "Acende rápido, queima uniforme e duradoura." },
  { name: "Isqueiro à Prova de Vento — Unidade", category: "Tabacaria", price: 9.9, description: "Chama dupla, resistente para uso externo." },
  { name: "Piteira de Vidro Slim — Unidade", category: "Tabacaria", price: 6.9, description: "Filtro reutilizável, fácil de limpar." },
  // Combos/Gelo
  { name: "Saco de Gelo em Cubos — 2kg", category: "Combos/Gelo", price: 8.9, description: "Gelo filtrado, ideal para festas e drinks." },
  { name: "Balde de Gelo com Alça — 5kg", category: "Combos/Gelo", price: 18.9, description: "Para quem não pode deixar a bebida esquentar." },
  { name: "Combo Cerveja + Gelo — 6 latas + 2kg de gelo", category: "Combos/Gelo", price: 42.9, description: "Tudo pronto para a resenha." },
  { name: "Combo Whisky + Energético — Roble Dourado + 2 latas", category: "Combos/Gelo", price: 119.9, description: "Combo clássico para a noite." },
  { name: "Combo Gin Tônica — Gin Jardim Azul + água tônica + limão", category: "Combos/Gelo", price: 99.9, description: "Tudo para montar o drink em casa." },
  { name: "Combo Drinks de Verão — Vodka + suco + gelo", category: "Combos/Gelo", price: 64.9, description: "Praticidade para curtir o calor." },
];

async function main() {
  // Produtos
  await prisma.product.deleteMany();
  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`${products.length} produtos cadastrados.`);

  // Busca IDs dos produtos criados para os kits
  const created = await prisma.product.findMany({ select: { id: true, name: true } });
  const find = (keyword: string) => created.find((p) => p.name.includes(keyword))?.id;

  // Settings padrão
  const defaultSettings = [
    { key: "deliveryTime", value: "30-45 min" },
    { key: "businessHoursOpen", value: "18" },
    { key: "businessHoursClose", value: "3" },
    { key: "whatsappNumber", value: "" },
    { key: "deliveryDefaultFee", value: "12" },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: {} });
  }
  console.log("Settings configurados.");

  // Zonas de entrega padrão
  await prisma.deliveryZone.deleteMany();
  await prisma.deliveryZone.createMany({
    data: [
      { neighborhood: "Centro", fee: 5 },
      { neighborhood: "Jardim Europa", fee: 7 },
      { neighborhood: "Vila Nova", fee: 8 },
      { neighborhood: "Boa Vista", fee: 10 },
    ],
  });
  console.log("Zonas de entrega configuradas.");

  // Cupons de exemplo
  await prisma.coupon.deleteMany();
  await prisma.coupon.createMany({
    data: [
      { code: "PRIMEIROPEDIDO", type: "percent", value: 10, minOrder: 30, maxUses: null },
      { code: "JAPA15", type: "fixed", value: 15, minOrder: 50, maxUses: 100 },
    ],
  });
  console.log("2 cupons de exemplo criados.");

  // Kits para a ocasião
  await prisma.kit.deleteMany();

  const sixPackId = find("Six Pack Pilsen");
  const baldeGeloId = find("Balde de Gelo com Alça");
  const sacoGeloId = find("Saco de Gelo em Cubos");
  const isqueiroId = find("Isqueiro à Prova de Vento");
  const whiskyId = find("Whisky Roble Dourado");
  const vodkaId = find("Vodka Gelo Polar");
  const comboVeraoId = find("Combo Drinks de Verão");
  const ginId = find("Gin Botânico Jardim Azul");

  const kits = [
    {
      name: "Kit Churrasco 🔥",
      description: "Para a galera não passar sede. Cerveja, gelo e isqueiro.",
      emoji: "🔥",
      items: JSON.stringify(
        [
          { productId: sixPackId, quantity: 2 },
          { productId: baldeGeloId, quantity: 1 },
          { productId: isqueiroId, quantity: 1 },
        ].filter((i) => i.productId)
      ),
    },
    {
      name: "Kit Noite de Card Game 🃏",
      description: "Whisky, gelo e saco de cubos para manter a concentração.",
      emoji: "🃏",
      items: JSON.stringify(
        [
          { productId: whiskyId, quantity: 1 },
          { productId: sacoGeloId, quantity: 2 },
        ].filter((i) => i.productId)
      ),
    },
    {
      name: "Kit Verão na Piscina ☀️",
      description: "Vodka, drinks e gelo para o calor.",
      emoji: "☀️",
      items: JSON.stringify(
        [
          { productId: vodkaId, quantity: 1 },
          { productId: comboVeraoId, quantity: 1 },
          { productId: sacoGeloId, quantity: 2 },
        ].filter((i) => i.productId)
      ),
    },
    {
      name: "Kit Happy Hour Gin 🍸",
      description: "Gin tônica para dois, ou um que gosta de beber bem.",
      emoji: "🍸",
      items: JSON.stringify(
        [
          { productId: ginId, quantity: 1 },
          { productId: sacoGeloId, quantity: 1 },
        ].filter((i) => i.productId)
      ),
    },
  ].filter((k) => {
    const items = JSON.parse(k.items) as { productId: string }[];
    return items.length > 0;
  });

  for (const kit of kits) {
    await prisma.kit.create({ data: kit });
  }
  console.log(`${kits.length} kits criados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
