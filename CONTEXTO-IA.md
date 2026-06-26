# Malte & Tabaco — Contexto para IA

> Atualizado em: 26/06/2026 · sessão IA
> Leia este arquivo antes de qualquer alteração no projeto.

---

## O que é este projeto

MVP de delivery mobile-first para a tabacaria/adega **Malte & Tabaco**.
Catálogo: cervejas (marcas famosas), destilados premium, tabacaria (essências Zomo/Adalya/Sense, charutos, narguilé), combos e gelo.
Checkout via Pix (Mercado Pago). Dashboard do atendente + painel admin completo.

**Pasta local:** `C:\Github\publicados\adega-malte\`
**Repositório:** `https://github.com/webdevcontas-hash/adega-malte.git`

---

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Backend:** Route Handlers (`app/api/**/route.ts`)
- **Banco:** SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3`
- **Pagamentos:** SDK `mercadopago` v3 (Pix)
- **Ícones:** `lucide-react` + `react-icons/fa6` (Font Awesome 6 solid)
- **Deploy:** ainda não definido

---

## Identidade visual (Malte & Tabaco)

Tokens em `app/globals.css`:

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#f0eeec` | Cinza quente claro — fundo da página |
| `--foreground` | `#1c1208` | Carvão escuro — texto principal |
| `--card` | `#ffffff` | Branco — cards, modais, drawers |
| `--border` | `#e2d9ce` | Bege — bordas |
| `--muted` | `#8b7355` | Marrom médio — texto secundário |
| `--accent` | `#b8541d` | Terracota — botões, destaques |
| `--accent-dark` | `#8c3a10` | Terracota escura |
| `--accent-light` | `#f5e4d0` | Terracota clarinha — fundo de destaque |

Logo: caixinha `bg-foreground` com "M" e "T" em branco e "&" em terracota.
Gradientes por categoria nos cards de produto: âmbar (Cervejas), pedra (Destilados), terracota (Tabacaria), vermelho (Combos/Gelo).

---

## Estrutura de arquivos relevante

```
adega-malte/
├── app/
│   ├── page.tsx                    # ISR revalidate=60, renderiza StorefrontV2
│   ├── admin/page.tsx              # Painel admin (força-dynamic, auth)
│   ├── dashboard/page.tsx          # Painel atendente (força-dynamic, auth)
│   └── api/
│       ├── admin/products/         # CRUD produtos (GET list, POST, PATCH [id], DELETE [id])
│       ├── admin/kits/             # CRUD kits (GET, POST, PATCH [id], DELETE [id])
│       ├── admin/delivery-zones/   # CRUD zonas de entrega
│       ├── checkout/route.ts       # Cria Order + Pix (usa isStoreOpenAsync + getDeliveryFeeAsync)
│       ├── coupons/route.ts        # Gestão cupons (GET/POST/PATCH — auth)
│       ├── coupons/validate/       # POST valida cupom (público)
│       ├── kits/route.ts           # GET kits públicos expandidos
│       ├── orders/[id]/status/     # POST atualiza deliveryStatus (auth)
│       ├── settings/route.ts       # GET all settings / PATCH upsert (auth)
│       └── store-status/route.ts   # GET { open, hours, deliveryTime }
├── components/
│   ├── AdminPanel.tsx              # Painel admin 4 abas (Produtos/Kits/Taxas/Config)
│   ├── DashboardPanel.tsx          # Painel atendente (pedidos + cupons + config)
│   ├── CartDrawer.tsx              # Checkout com cupom + tempo de entrega
│   ├── PaymentScreen.tsx           # Pix QR + rastreamento de entrega em tempo real
│   ├── KitSection.tsx              # Seção de kits na loja
│   ├── NarguilhBuilder.tsx         # Modal guiado Essência→Carvão→Extras
│   ├── Toast.tsx                   # Pop-up notificação canto superior direito
│   └── v2/
│       ├── StorefrontV2.tsx        # Hub + grid produtos + carrinho flutuante
│       ├── HeaderV2.tsx            # Header com logo M&T + busca + conta + carrinho
│       ├── CategoryHubV2.tsx       # 4 cards de departamento com FA6 icons
│       ├── ProductCardV2.tsx       # Card com gradiente + ícone FA6 branco
│       ├── ProductDetailV2.tsx     # Modal detalhe com hero gradiente
│       ├── theme.ts                # Gradientes e cores por categoria
│       └── icons/
│           ├── CategoryIcons.tsx   # SVG ilustrativos (não usados atualmente)
│           └── ProductIcon.tsx     # Mapeia nome → FA6 icon por keyword
└── lib/
    ├── business-hours.ts           # Funções sync (env fallback) + async (lê Settings DB)
    ├── delivery.ts                 # Client-safe: getDeliveryFee() retorna DEFAULT apenas
    ├── delivery-db.ts              # Server-only: getDeliveryFeeAsync() lê DeliveryZone DB
    ├── dashboard-auth.ts           # HMAC cookie auth (isAuthenticated, createDashboardSession)
    ├── stock.ts                    # decrementStock(items) — chamado ao confirmar venda (Pix pago / entrega concluída)
    ├── useCart.ts                  # Hook: cart state + addToCart + addManyToCart + reorder
    └── types.ts                    # CartItem, Kit, KitItem, DeliveryStatus, OrderStatus
```

---

## Modelos Prisma

```
Product       — id(cuid), name, price, category, description?, isAvailable, stock?(null=ilimitado), createdAt
Order         — id(cuid), customerName, phone, email?, address, neighborhood?, cep?,
                deliveryFee, total, couponCode?, couponDiscount?, paymentMethod(pix/card/cash), changeFor?,
                status(PENDING/PAID/DELIVERED), deliveryStatus(WAITING/PREPARING/OUT_FOR_DELIVERY/DELIVERED),
                accepted, pixId?, qrCode?, qrCodeBase64?, items(rel), createdAt, updatedAt
OrderItem     — id(cuid), orderId(FK cascade), productId(FK), quantity, price
Setting       — key(PK), value            ← horário, tempo entrega, WhatsApp, taxa padrão
Coupon        — id(int), code(unique), type(percent/fixed), value, minOrder, maxUses?, usedCount, active
Kit           — id(int), name, description?, emoji, items(JSON string), active
DeliveryZone  — id(int), neighborhood(unique), fee
```

---

## Regras técnicas críticas

1. **`lib/delivery.ts` é client-safe** — não importa Prisma. Funções DB ficam em `lib/delivery-db.ts` (server-only). Nunca importar `delivery-db.ts` em Client Components.
2. **`lib/business-hours.ts`**: versões `*Async()` leem do banco (Settings), versões síncronas leem env vars (fallback). Usar async nas rotas de API.
3. **Prisma 7**: tipos gerados são `ProductModel`, `OrderModel`, etc. Importar de `@/app/generated/prisma/models`.
4. **Driver adapter obrigatório**: `@prisma/adapter-better-sqlite3` em `lib/prisma.ts` e `prisma/seed.ts`.
5. **`app/generated/prisma` gitignored** — regenerado por `postinstall`. Nunca editar à mão.
6. **Next.js 16**: `params` em Route Handlers é `Promise<{...}>` → `await params`.
7. **ISR no catálogo**: `app/page.tsx` tem `export const revalidate = 60`. Após salvar produto no admin, `revalidatePath("/")` é chamado automaticamente.
8. **Servidor recalcula tudo no checkout**: preços, total, taxa de entrega e cupom — nunca confiar em valores do client.
9. **Inputs 16px no mobile**: `text-base md:text-sm` em todos os inputs do checkout (evita zoom iOS).
10. **Sessões HMAC**: `dashboard-auth.ts` e `customer-auth.ts` gravam HMAC-SHA256 no cookie, nunca o segredo.
11. **Estoque (`Product.stock`)**: `null` = ilimitado (não controlado), número = quantidade real. `decrementStock()` só roda uma vez por pedido — no webhook do Mercado Pago quando o Pix é aprovado (`status` PENDING→PAID), ou na rota de status quando `deliveryStatus` vira DELIVERED **e o pedido ainda não estava PAID/DELIVERED** (cobre pagamento na entrega, que só conta como venda no recebimento). Checkout valida estoque disponível antes de criar o pedido, mas não reserva — corrida entre dois checkouts simultâneos pode estourar por poucas unidades (aceitável no MVP).

---

## Variáveis de ambiente (.env)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | `file:./dev.db` |
| `SESSION_SECRET` | ✅ | Segredo HMAC para cookies |
| `DASHBOARD_PASSWORD` | ✅ | Senha dos painéis /dashboard e /admin |
| `NEXT_PUBLIC_BASE_URL` | Para produção | URL pública (webhook MP, redirect Google) |
| `MERCADOPAGO_ACCESS_TOKEN` | Para Pix real | Token da conta MP |
| `MERCADOPAGO_WEBHOOK_SECRET` | Recomendado em prod | Valida assinatura webhook |
| `GOOGLE_CLIENT_ID/SECRET` | Opcional | Ativa login com Google |
| `BUSINESS_HOURS_OPEN/CLOSE` | Fallback | Agora configurável via Admin → Configurações |

---

## Como rodar localmente

```bash
npm install
npx prisma migrate deploy
npm run db:seed          # seed com 51 produtos reais, 5 kits, zonas de entrega
npm run dev -- --port 3501
```

Acessos: loja `/` · atendente `/dashboard` · admin `/admin` · senha: `adega123` (trocar em prod)

---

## Máquinas e responsáveis

| Máquina | Responsável | Última sessão |
|---------|-------------|---------------|
| Renan Desktop | Renan | 23/06/2026 |
| Renan Notebook Gordon (DELL) | Renan | 24/06/2026, 25/06/2026 |
| (sessão IA) | Renan | 26/06/2026 |
