# HANDOFF — sessão IA → próximo agente

> Atualizado: 26/06/2026 · sessão IA
> **Regra:** quem lê este arquivo apaga o conteúdo anterior e escreve a sua seção ao terminar.

---

## O que é este repositório

`adega-malte` — MVP de delivery mobile-first para a tabacaria/adega **Malte & Tabaco**.
Stack: Next.js 16 + TypeScript + Tailwind v4 + Prisma 7 + SQLite + Mercado Pago (Pix).

## O que foi feito nesta sessão (26/06/2026)

1. **Corrigido HANDOFF/PROGRESSO desatualizados**: o `git log` já tinha 2 commits (25/06 manhã) não refletidos nos docs — **M2 (relatório de vendas no admin)** e **pagamento na entrega (dinheiro/cartão)** já estavam feitos e funcionando, só não documentados.
2. **M3 — Controle de estoque** implementado:
   - `Product.stock` (Int?, null = ilimitado) — migration `20260626104253_add_product_stock`.
   - Admin → Produtos: campo "Estoque" no formulário + badge (Estoque: N / Esgotado) na listagem.
   - Checkout valida estoque disponível antes de criar o pedido (rejeita com "Estoque insuficiente de ...").
   - `lib/stock.ts` → `decrementStock()`: decrementa só uma vez por pedido — no webhook Pix (PENDING→PAID) ou na rota de status quando vira DELIVERED e ainda não tinha contado como venda (pagamento na entrega).
   - Vitrine (`app/page.tsx`) esconde produtos com `stock === 0`, igual já fazia com `isAvailable: false`.
   - Testado ponta a ponta via curl local: validação de estoque insuficiente, decremento ao entregar, idempotência (marcar entregue 2x não decrementa 2x), produto esgotado some da vitrine. Dados de teste limpos do `dev.db` depois.

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
4. **WhatsApp real**: `lib/whatsapp.ts` ainda só loga no console. Decisão de provedor foi adiada nesta sessão (opções: whatsapp-web.js, Evolution API, API oficial Meta) — retomar quando o dono quiser priorizar.
5. **Trocar senha** do dashboard antes de produção.
6. **Taxas de entrega reais**: ajustar bairros e valores no painel Admin → Taxas.
7. **Horário real**: ajustar abertura/fechamento no painel Admin → Configurações.
8. **Float → centavos** (migração de preços para Int): tarefa dedicada com teste de Pix real.

## 🎯 Próxima sessão — roadmap (ver PROGRESSO.md)

M2 e pagamento na entrega: ✅ feitos. M3 (estoque): ✅ feito nesta sessão.

Itens restantes, por impacto (ver tabela completa em PROGRESSO.md):
1. **M1 — WhatsApp real** (adiado nesta sessão, decisão de provedor pendente).
2. **M4 — Fotos reais dos produtos** (campo `image` já existe, falta upload no admin).
3. M5 — Fidelidade/cashback · M6 — Avaliação pós-entrega · M7 — Float→Int · M8 — Rate limiting.
4. Itens de infra/pré-produção (Mercado Pago real, deploy, senha, OAuth) seguem pendentes — ver lista acima.

## Como rodar na nova máquina

```bash
git clone https://github.com/webdevcontas-hash/adega-malte.git
cd adega-malte
npm install
# Copiar o .env da máquina anterior ou criar novo com as variáveis
npx prisma migrate deploy
npm run db:seed
npm run dev -- --port 3501
```

O `.env` contém: `DATABASE_URL`, `SESSION_SECRET`, `DASHBOARD_PASSWORD` e demais vars.
O banco SQLite (`dev.db`) **não é versionado** — rodar o seed sempre que clonar.
