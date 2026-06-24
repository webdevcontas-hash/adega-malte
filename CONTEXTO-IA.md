# Adega do Japa V2 — Contexto para IA

> Atualizado em: 23/06/2026 22:30 · Notebook Renan | Leia este arquivo antes de qualquer alteração no projeto.

---

## O que é este projeto

**Versão visual V2 (tema laranja/slate)** do MVP de delivery mobile-first da adega/tabacaria fictícia "Adega do Japa". É um **projeto separado** da V1 (repo `adega-do-japa`, tema vermelho), criado para o cliente comparar e escolher. Mesmo backend nas duas: catálogo, carrinho, checkout com Pix (Mercado Pago), dashboard. Só muda a camada visual da loja.

A loja principal (`/`) é a `StorefrontV2`: hub de "departamentos" (cards grandes coloridos por categoria), header com busca, cards de produto com controle de quantidade inline (lucide-react), rodapé com status da loja, carrinho flutuante mobile.

**Pasta local:** `C:\Github\publicados\adega-do-japa-v2\`
**Repositório:** `https://github.com/webdevcontas-hash/adega-do-japa-v2.git`
**Repo irmão (V1, vermelho):** `https://github.com/webdevcontas-hash/adega-do-japa.git`

---

## Stack e tecnologias

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 (`@import "tailwindcss"` em `app/globals.css`, sem `tailwind.config.js`)
- **Backend:** Route Handlers do Next.js (`app/api/**/route.ts`)
- **Banco de dados:** SQLite via Prisma ORM 7 com o novo generator `prisma-client` (cliente TS gerado em `app/generated/prisma`, **gitignored**, regenerado pelo script `postinstall`)
- **Pagamentos:** SDK oficial `mercadopago` v3 (Pix), com validação de assinatura de webhook (`WebhookSignatureValidator`)
- **WhatsApp:** `lib/whatsapp.ts` — hoje só loga a mensagem formatada; pronto para plugar `whatsapp-web.js` ou outro provedor
- **Infra/Deploy:** ainda não definido (ver PROGRESSO.md)

### Identidade visual (V2 — laranja/slate)

Referência: export "delivery-japa" (React/Vite do AI Studio). Tokens de cor em `app/globals.css` (`:root` + `@theme inline`):

| Token Tailwind | Valor / Uso |
|---|---|
| `bg-background` | `#fff7ed` (orange-50) — fundo da página |
| `text-foreground` | `#1e293b` (slate-800) — texto principal |
| `bg-card` | branco — cards, drawers, modais |
| `border-border` | `#ffedd5` (orange-100) |
| `text-muted` | `#94a3b8` (slate-400) |
| `bg-accent` / `text-accent-dark` | laranja `#f97316` / `#ea580c` — botões, destaques |
| `bg-accent-light` | `#ffedd5` |
| `font-sans` (corpo) | Plus Jakarta Sans (`--font-jakarta`) |
| `font-display` | Space Grotesk (`--font-grotesk`) — títulos e marca |

Os componentes da loja (`components/v2/*`) usam também cores Tailwind explícitas por categoria (amber/purple/slate/red) — ver `components/v2/theme.ts`. Ícones via `lucide-react`. Não há `tailwind.config.js` (Tailwind v4): tokens novos entram em `app/globals.css`.

---

## Dados do cliente / negócio

| Campo | Valor |
|-------|-------|
| Cliente | Fictício — "Adega do Japa" (projeto-modelo para venda a donos de adega reais) |
| Segmento | Adega / tabacaria com delivery |
| WhatsApp | Definido via `WHATSAPP_STORE_NUMBER` no `.env` |
| Instagram | — |
| Cidade/UF | — (taxas de entrega em `lib/delivery.ts` usam bairros de exemplo) |

---

## Estrutura de arquivos relevante

```
adega-do-japa/
├── PROGRESSO.md
├── CONTEXTO-IA.md
├── HANDOFF.md
├── prisma/
│   ├── schema.prisma        # Product, Order, OrderItem (status como String, não enum — SQLite)
│   ├── seed.ts               # 28 produtos fictícios; idempotente (deleteMany antes de criar)
│   └── migrations/
├── app/
│   ├── page.tsx               # Server Component: busca produtos, renderiza <Storefront>
│   ├── dashboard/page.tsx    # Painel do atendente (protegido por senha)
│   ├── generated/prisma/    # Cliente Prisma gerado — NÃO versionado, NÃO editar
│   └── api/
│       ├── checkout/route.ts            # cria Order + gera Pix no Mercado Pago
│       ├── payment/webhook/route.ts     # recebe notificação MP, marca PAID, notifica WhatsApp
│       ├── orders/route.ts              # lista pedidos (dashboard, protegido)
│       ├── orders/[id]/route.ts         # status do pedido (polling da tela de pagamento)
│       ├── orders/[id]/accept/route.ts  # atendente aceita o pedido (protegido)
│       ├── dashboard/login/route.ts     # login simples do painel
│       └── store-status/route.ts        # horário de funcionamento (consumido no client)
├── components/                # Storefront, ProductCard, ProductDetail, CartDrawer, PaymentScreen, AgeGate, DashboardPanel, etc.
└── lib/                       # prisma.ts, mercadopago.ts, whatsapp.ts, business-hours.ts, delivery.ts, dashboard-auth.ts
```

---

## Módulos / Funcionalidades

| Módulo | Caminho/Arquivo | Descrição |
|--------|-----------------|-----------|
| Catálogo | `app/page.tsx`, `components/Storefront.tsx` | Lista produtos por categoria, gerencia carrinho em estado React |
| Detalhe do produto | `components/ProductCard.tsx`, `components/ProductDetail.tsx` | Clicar no card (fora do botão "+") abre tela full-screen com imagem, categoria, descrição completa e seletor de quantidade; botão "X" fecha |
| Filtro 18+ | `components/AgeGate.tsx` | Bloqueia tela até confirmar maioridade (localStorage, via `useSyncExternalStore`) |
| Horário de funcionamento | `lib/business-hours.ts`, `app/api/store-status/route.ts` | Server-side lê `BUSINESS_HOURS_OPEN/CLOSE`; client consome via API (env não é `NEXT_PUBLIC_`) |
| Carrinho/Checkout | `components/CartDrawer.tsx`, `app/api/checkout/route.ts` | Form com autofill de CEP (ViaCEP) e taxa de entrega por bairro; servidor recalcula preços/total a partir do banco (nunca confia no valor do client) |
| Pix | `lib/mercadopago.ts`, `app/api/checkout/route.ts` | Cria pagamento Pix; expiração de 10 min |
| Tela de pagamento | `components/PaymentScreen.tsx` | QR code + copia-e-cola + cronômetro; faz polling em `/api/orders/[id]` |
| Webhook | `app/api/payment/webhook/route.ts` | Valida assinatura (se `MERCADOPAGO_WEBHOOK_SECRET` definido), busca pagamento real na API do MP, marca `PAID`, evita notificar duas vezes |
| WhatsApp | `lib/whatsapp.ts` | `notifyOrderPaid()` — troque o corpo de `sendWhatsAppMessage` para integrar de fato |
| Dashboard | `app/dashboard/`, `components/DashboardPanel.tsx`, `lib/dashboard-auth.ts` | Senha única (`DASHBOARD_PASSWORD`) via cookie httpOnly; alerta sonoro (beep via Web Audio API) enquanto houver pedido `PAID` com `accepted: false` |

---

## Regras técnicas importantes

1. **Prisma 7 muda nomes**: os tipos de modelo gerados são `ProductModel`, `OrderModel`, `OrderItemModel` (não `Product`/`Order`/`OrderItem` como em versões antigas). Importar de `@/app/generated/prisma/models`.
2. **Driver adapter obrigatório**: o generator novo (`prisma-client`) não embute mais engine para SQLite — é preciso `@prisma/adapter-better-sqlite3` (ver `lib/prisma.ts` e `prisma/seed.ts`).
3. **`app/generated/prisma` é gerado e gitignored** — nunca editar à mão; é recriado pelo script `postinstall` (`prisma generate`) a cada `npm install`.
4. **Next.js 16**: `params` em Route Handlers é `Promise` (`const { id } = await params`). Confirmar qualquer API nova contra `node_modules/next/dist/docs/` antes de assumir comportamento de versões antigas.
5. **Env vars sem `NEXT_PUBLIC_` não existem no client.** Por isso o horário de funcionamento é lido no servidor e exposto via `/api/store-status` em vez de ser lido direto por componentes client.
6. **Cascade delete**: `OrderItem.order` tem `onDelete: Cascade` — sem isso, excluir um `Order` (ex.: rollback quando o Pix falha no checkout) quebra com `P2003` (violação de FK). Bug real encontrado e corrigido na sessão 1.
7. **Servidor sempre recalcula preços e total** no checkout a partir do banco — nunca confiar em `price`/`total` vindos do client.
8. **Catálogo é `force-dynamic`** (`app/page.tsx`) — sem isso o Next prerenderiza a lista de produtos como estática no build e ela não reflete alterações no banco.
9. **Cuidado com `text-{size}` em containers com emoji grande**: em `ProductDetail.tsx` o placeholder 🍾 usa `text-7xl` no `div` pai; qualquer botão/elemento filho sem `text-{size}` próprio herda esse tamanho gigante (foi o caso do botão "X", corrigido com `text-base` explícito). Sempre dar um `text-*` explícito a elementos interativos dentro desses containers.

---

## Ambientes e variáveis

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão SQLite (`file:./dev.db`) |
| `NEXT_PUBLIC_BASE_URL` | URL pública do site, usada para montar a `notification_url` do webhook |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token da conta Mercado Pago do cliente (Pix) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret de assinatura do webhook (painel MP) — opcional, mas recomendado em produção |
| `WHATSAPP_STORE_NUMBER` | Número que recebe a notificação de pedido pago, formato `55DDDNUMERO` |
| `DASHBOARD_PASSWORD` | Senha de acesso ao painel `/dashboard` |
| `BUSINESS_HOURS_OPEN` / `BUSINESS_HOURS_CLOSE` | Horário de funcionamento (0-23, pode cruzar a meia-noite) |

---

## Máquinas e responsáveis

| Máquina | Responsável | IA | Última sessão |
|---------|-------------|-----|---------------|
| Renan Desktop | Renan | Claude Code | 23/06/2026 |

---

## Como testar localmente

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev -- --port 3500   # porta 3000 pode estar ocupada por outro projeto na mesma máquina
```

Sem `MERCADOPAGO_ACCESS_TOKEN` configurado, o checkout cria o pedido e falha de forma controlada (502) ao tentar gerar o Pix — esperado em ambiente sem credencial real.
