# Adega do Japa V2 — Progresso do Desenvolvimento

> Última atualização: 23/06/2026 22:30 · Notebook Renan

---

# SESSÃO — 23/06/2026 22:30 · Notebook Renan

## O que foi feito

- Criado este repositório `adega-do-japa-v2` como **projeto separado** (fork local de `adega-do-japa`) contendo a **versão visual V2** (tema laranja/slate), para o cliente comparar com a V1 (repo `adega-do-japa`, tema vermelho) e decidir qual usar.
- Loja principal (`/`) renderiza `StorefrontV2`: hub de "departamentos" (cards grandes coloridos), header com busca, cards de produto com +/- inline, rodapé com status da loja em tempo real, carrinho flutuante mobile.
- Hub adaptado às 4 categorias reais (Cervejas, Destilados, Tabacaria, Combos/Gelo); fontes Plus Jakarta Sans + Space Grotesk; ícones lucide-react.
- Paleta laranja no `:root`; modais e dashboard adotam o tema via tokens semânticos.
- V1 removida deste repo (`components/v1`, `app/v2`). Build/lint/tsc limpos.

## Pendências

- Mesmas da V1 (backend idêntico): Mercado Pago real + teste de Pix, trocar `DASHBOARD_PASSWORD`, WhatsApp real, deploy, taxas de entrega por bairro.
- Avaliar fotos reais dos produtos (hoje emoji por categoria como placeholder).
- Se a V2 for escolhida: portar cupom de desconto e tela de acompanhamento de pedido do mockup original.

---

# ROADMAP

| # | Item | Prioridade | Estado |
|---|------|------------|--------|
| 1 | Decisão do cliente: V1 (vermelho) x V2 (laranja) | 🔴 Alta | Pendente |
| 2 | Conta Mercado Pago real + teste de Pix | 🔴 Alta | Pendente |
| 3 | Deploy (VPS/Vercel) | 🔴 Alta | Pendente |
| 4 | Integração real de WhatsApp | 🟡 Média | Pendente |
| 5 | Trocar senha padrão do dashboard | 🔴 Alta | Pendente |

---

# HISTÓRICO DE SESSÕES

| Sessão | Data | Máquina | Resumo |
|--------|------|---------|--------|
| 1 | 23/06/2026 | Notebook Renan | Criação do projeto V2 separado (tema laranja) a partir da V1 |
