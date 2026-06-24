# HANDOFF — Notebook Renan → próximo agente

> Atualizado: 23/06/2026 22:30 · Notebook Renan
> **Regra:** quem lê este arquivo apaga o conteúdo anterior e escreve a sua seção ao terminar.

---

## O que é este repositório

`adega-do-japa-v2` é a **versão visual V2** (tema **laranja/slate**, fontes Plus Jakarta Sans + Space Grotesk, ícones lucide-react) do projeto Adega do Japa, criada como **projeto separado** para o cliente comparar com a V1 e decidir qual usar.

- **V1 (tema vermelho/Inter):** repositório irmão `adega-do-japa` (https://github.com/webdevcontas-hash/adega-do-japa.git)
- **V2 (este repo, tema laranja):** https://github.com/webdevcontas-hash/adega-do-japa-v2.git

As duas versões têm o **mesmo backend** (catálogo, carrinho, checkout Pix via Mercado Pago, dashboard). Só muda a camada visual da loja.

## O que foi feito nesta sessão

- Projeto derivado de `adega-do-japa`: a loja principal (`/`) renderiza a `StorefrontV2` (hub de "departamentos" com cards grandes coloridos, header com busca, cards de produto com controle de quantidade inline, rodapé com status da loja, carrinho flutuante mobile).
- Hub adaptado às **4 categorias reais** (Cervejas, Destilados, Tabacaria, Combos/Gelo) — o mockup original tinha comida japonesa/sushi, removida por não existir no catálogo.
- Paleta laranja promovida para `:root` no `app/globals.css`; dashboard e modais (CartDrawer, PaymentScreen, AgeGate) adotam o laranja via tokens semânticos.
- Removidos os componentes/rotas da V1 (`components/v1`, `app/v2`). `components/ProductDetail.tsx` permanece no repo mas não é usado pela V2.
- Build, lint e `tsc --noEmit` validados limpos.

## Pendências (mesmas da V1, pois o backend é igual)

1. Configurar `MERCADOPAGO_ACCESS_TOKEN` real e testar um Pix ponta a ponta.
2. Trocar `DASHBOARD_PASSWORD` do `.env` antes de produção.
3. Integração real de WhatsApp (`lib/whatsapp.ts` hoje só loga).
4. Definir hospedagem/deploy.
5. Ajustar taxas de entrega por bairro reais (`lib/delivery.ts`).
6. Não portados do mockup V2: cupom de desconto e tela de acompanhamento de pedido (o backend usa Pix real). Adicionar se a V2 for a escolhida.

## Como rodar

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev -- --port 3501   # use porta diferente da V1 se rodar as duas juntas
```

Sem `MERCADOPAGO_ACCESS_TOKEN`, o checkout cria o pedido e falha de forma controlada (502) ao gerar o Pix — esperado.
