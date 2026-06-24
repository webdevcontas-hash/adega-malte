# HANDOFF — Renan Notebook Gordon → próximo agente

> Atualizado: 24/06/2026 15:23 · Renan Notebook Gordon (DELL)
> **Regra:** quem lê este arquivo apaga o conteúdo anterior e escreve a sua seção ao terminar.

---

## O que é este repositório

`adega-do-japa-v2` — MVP de delivery mobile-first para a tabacaria/adega **Malte & Tabaco**.
Stack: Next.js 16 + TypeScript + Tailwind v4 + Prisma 7 + SQLite + Mercado Pago (Pix).

## O que foi feito nesta sessão (24/06/2026 — tarde)

Sessão muito grande, tudo commitado e no GitHub (`main`). Commits do dia:

1. **Rebranding completo** para "Malte & Tabaco": nome, paleta (terracota `#b8541d` + cinza claro `#f0eeec`), logo `M&T`, identidade visual da loja.
2. **Ícones profissionais**: SVGs customizados nos cards de categoria, Font Awesome 6 solid (`react-icons/fa6`) nos cards de produto com gradiente colorido por categoria. Ícones dos kits também atualizados.
3. **Toast de notificação**: pop-up canto superior direito ao adicionar produto/kit/narguilé ao carrinho.
4. **Painel Admin completo** (`/admin`): 4 abas — Produtos (CRUD), Kits (CRUD com picker de produto), Taxas de Entrega (CRUD por bairro), Configurações (horário, WhatsApp, taxa padrão, tempo estimado).
5. **Backend atualizado**: `DeliveryZone` model no banco, taxas de entrega e horário de funcionamento lidos do banco (não mais hardcoded/env), `lib/delivery-db.ts` separado (server-only) para evitar erro `fs` no browser.
6. **Catálogo real com 51 produtos**: marcas famosas — Brahma, Skol, Heineken, Império, Original, Budweiser, Corona, Stella; JW Red/Black, Jack Daniel's, Absolut, Smirnoff, Gin Tanqueray, Hendrick's, Ballantine's, Saquê Ozeki/Hakutsuru, Cachaça 51/Ypióca, Tequila Jose Cuervo; Zomo (6 sabores), Adalya (4 sabores), Sense (2 sabores), carvão cocoboco, piteira Lavoo, isqueiro Clipper, charuto Dannemann, cigarro Caburé.
7. **5 kits** atualizados com os novos produtos.

## Acessos

| Painel | URL local | Senha |
|--------|-----------|-------|
| Loja | http://localhost:3501 | — |
| Atendente | http://localhost:3501/dashboard | `adega123` |
| Admin | http://localhost:3501/admin | `adega123` |

⚠️ Trocar `DASHBOARD_PASSWORD` no `.env` antes de produção.

## Pendências críticas

1. **Mercado Pago**: preencher `MERCADOPAGO_ACCESS_TOKEN` real e testar Pix ponta a ponta.
2. **Deploy**: definir hospedagem (VPS ou Vercel) e fazer o primeiro deploy.
3. **Google OAuth**: preencher `GOOGLE_CLIENT_ID/SECRET` no `.env` para ativar login Google.
4. **WhatsApp real**: integrar `lib/whatsapp.ts` com whatsapp-web.js ou provedor externo.
5. **Trocar senha** do dashboard antes de produção.
6. **Taxas de entrega reais**: ajustar bairros e valores no painel Admin → Taxas.
7. **Horário real**: ajustar abertura/fechamento no painel Admin → Configurações.
8. **Float → centavos** (migração de preços para Int): tarefa dedicada com teste de Pix real.

## 🎯 Próxima sessão — melhorias planejadas (ver ROADMAP no PROGRESSO.md)

Análise de produto feita em 24/06 tarde. **Começar por M2 → M1** (maior retorno):

1. **M2 — Relatório de vendas no admin** ⭐ ponto de partida (não precisa de credencial externa).
   Nova aba `/admin`: total vendido, mais vendidos, ticket médio, pedidos por horário. Dados já estão em `Order`+`OrderItem`.
2. **M1 — WhatsApp real** — `lib/whatsapp.ts` só loga; avisar o dono do pedido pago.
3. M3 — Controle de estoque (qtd no `Product`, decrementa no pago).
4. M4 — Fotos reais (campo `image` já existe, falta upload no admin).
5. M5 — Fidelidade/cashback · M6 — Avaliação pós-entrega · M7 — Float→Int · M8 — Rate limiting.

## Como rodar na nova máquina

```bash
git clone https://github.com/webdevcontas-hash/adega-do-japa-v2.git
cd adega-do-japa-v2
npm install
# Copiar o .env da máquina anterior ou criar novo com as variáveis
npx prisma migrate deploy
npm run db:seed
npm run dev -- --port 3501
```

O `.env` contém: `DATABASE_URL`, `SESSION_SECRET`, `DASHBOARD_PASSWORD` e demais vars.
O banco SQLite (`dev.db`) **não é versionado** — rodar o seed sempre que clonar.
