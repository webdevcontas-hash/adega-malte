# Malte & Tabaco — Progresso do Desenvolvimento

> Última atualização: 26/06/2026 · sessão IA

---

## Sessão — 26/06/2026 · sessão IA

### O que foi feito

- **Docs corrigidos**: HANDOFF/PROGRESSO estavam um passo atrás do `git log` — M2 (relatório de vendas) e pagamento na entrega (dinheiro/cartão) já tinham sido implementados em 25/06 de manhã e não estavam documentados.
- **M3 — Controle de estoque**: `Product.stock` (nullable = ilimitado), validação no checkout, decremento único por pedido (Pix pago ou entrega concluída), badge no admin, produto esgotado some da vitrine. Testado ponta a ponta localmente.
- **WhatsApp real (M1)**: avaliado, decisão de provedor adiada para próxima sessão.

### Pendências

- Mesmas da sessão anterior (ver Roadmap) — Mercado Pago real, deploy, WhatsApp real, etc.

---

## Sessão — 24/06/2026 15:23 · Renan Notebook Gordon

### O que foi feito

Sessão longa, diversas frentes — todas commitadas e no GitHub (`main`):

**Rebranding → Malte & Tabaco**
- Nome trocado em todos os pontos: header, metadata, API do checkout, textos do app
- Paleta nova: terracota `#b8541d` + carvão `#1c1208` + cinza claro `#f0eeec`
- Logo `M&T`: caixinha escura com "M" e "T" em branco e "&" em terracota
- Cards de categoria: âmbar escuro, pedra, terracota, vermelho escuro

**Ícones profissionais**
- Cards de categoria: Font Awesome 6 solid (`FaBeerMugEmpty`, `FaWineBottle`, `FaSmoking`, `FaGift`)
- Cards de produto: ícone FA6 específico por keyword no nome + gradiente colorido por categoria
- Modal de detalhe: ícone branco grande no hero com gradiente
- Kits: ícones FA6 mapeados por nome do kit (`FaFire`, `FaDiceD6`, `FaSun`, `FaMartiniGlass`, `FaGift`)

**Toast de notificação**
- `components/Toast.tsx`: pop-up slide-in no canto superior direito ao adicionar ao carrinho
- Funciona para produto avulso, kit completo e itens do narguilé builder

**Painel Admin completo (`/admin`)**
- 4 abas: 📦 Produtos, 🎁 Kits, 🚚 Taxas de Entrega, ⚙️ Configurações
- Produtos: CRUD completo (criar, editar, ativar/desativar, deletar), agrupado por categoria
- Kits: CRUD com picker de produtos por categoria + quantidade, toggle ativo/inativo
- Taxas: add/edit/remove zonas por bairro, edição inline
- Configurações: horário abertura/fechamento, tempo estimado, taxa padrão, WhatsApp

**Backend atualizado**
- `DeliveryZone` model no Prisma (neighborhood unique + fee)
- `lib/delivery-db.ts` (server-only) com `getDeliveryFeeAsync()` lendo do banco
- `lib/delivery.ts` mantido client-safe (sem Prisma) — fix do erro "Module not found: 'fs'"
- `lib/business-hours.ts` com versões `*Async()` que leem Settings do banco
- `app/api/store-status` e `app/api/checkout` atualizados para usar versões async
- APIs admin: `/api/admin/products`, `/api/admin/kits`, `/api/admin/delivery-zones`
- `revalidatePath("/")` chamado após CRUD de produtos

**Catálogo real com 51 produtos**
- Cervejas: Brahma, Skol, Heineken, Império, Original, Budweiser, Corona, Stella Artois + IPA + Six Packs
- Destilados: JW Red/Black Label, Jack Daniel's, Absolut, Smirnoff, Tanqueray, Hendrick's, Ballantine's, Saquê Ozeki/Hakutsuru, Cachaça 51/Ypióca, Tequila Jose Cuervo
- Tabacaria essências: Zomo (Exotic Flowers, Double Apple, Black Ice, Monster Energy, Mint Ice, Blueberry Ice), Adalya (Love 66, Cherry Mints, Watermelon Ice, Ice Peach), Sense (Two Apples, Summer Mix) + carvão cocoboco, piteira Lavoo, isqueiro Clipper, charuto Dannemann, cigarro Caburé
- Combos: Churrasco, Heineken+Gelo, Narguilé Completo, Drinks de Verão, Whisky Night, Gin Tônica

### Pendências

- Mercado Pago real + teste de Pix ponta a ponta
- Deploy (VPS ou Vercel)
- Google OAuth (`GOOGLE_CLIENT_ID/SECRET`)
- WhatsApp real (`lib/whatsapp.ts`)
- Trocar `DASHBOARD_PASSWORD` antes de produção
- Ajustar bairros/taxas reais no Admin → Taxas
- Float→Int (centavos) para valores monetários

---

## Sessão — 24/06/2026 08:20 · Renan Notebook Gordon

### O que foi feito

3 frentes (commitadas):
1. **Revisão mobile-first**: segurança HMAC, inputs 16px, safe-area, ISR catálogo, error boundaries
2. **Modal de detalhe do produto** (`ProductDetailV2`)
3. **Conta do cliente**: conta leve (localStorage) + login Google (OAuth manual, inativo sem credenciais)

---

## Sessão — 23/06/2026 22:30 · Notebook Renan

### O que foi feito

- Criação do repositório como projeto separado (V2 — tema laranja) a partir da V1
- Storefront com hub de departamentos, cards de produto com +/-, carrinho flutuante

---

## ROADMAP

### Infra / pré-produção
| # | Item | Prioridade | Estado |
|---|------|------------|--------|
| 1 | Mercado Pago real + teste de Pix | 🔴 Alta | Pendente |
| 2 | Deploy (VPS/Vercel) | 🔴 Alta | Pendente |
| 3 | Trocar senha do dashboard | 🔴 Alta | Pendente |
| 4 | Google OAuth (ativa login) | 🟡 Média | Pendente |
| 5 | Ajustar bairros/taxas reais no admin | 🟡 Média | Pendente |
| 6 | Pagamento na entrega (dinheiro/cartão) | — | ✅ Concluído (25/06) |

### Melhorias de produto (próxima sessão — análise 24/06 tarde)

**Alto impacto — operação e conversão:**
| # | Item | Estado | Notas de implementação |
|---|------|--------|------------------------|
| M1 | **Notificação WhatsApp real** | 🟡 Pendente (decisão de provedor adiada 26/06) | `lib/whatsapp.ts` hoje só loga no console. Avisar o dono na hora do pedido pago. Opções avaliadas: link `wa.me` automático, Evolution API, whatsapp-web.js ou API oficial Meta. É a pendência mais crítica pra operação real. |
| M2 | **Relatório de vendas no admin** | ✅ Concluído (25/06) | Aba `/admin` → Relatórios: total vendido, ticket médio, mais vendidos, pedidos por horário, receita por dia. Filtro por período (hoje/7d/30d/tudo). |
| M3 | **Controle de estoque** | ✅ Concluído (26/06) | `Product.stock` (null = ilimitado), decremento automático ao confirmar a venda (Pix pago ou entrega concluída), validação no checkout, badge no admin, produto esgotado some da vitrine. |

**Médio impacto — confiança e recompra:**
| # | Item | Notas de implementação |
|---|------|------------------------|
| M4 | **Fotos reais dos produtos** | Schema já tem campo `image`. Adicionar upload no admin. Foto converte mais que ícone, sobretudo em destilados premium. |
| M5 | **Fidelidade / cashback** | Ex.: "a cada 10 pedidos, 1 frete grátis" ou cashback. A conta do cliente (`CustomerProvider` + Order por phone/email) já é o gancho. Sustenta recompra. |
| M6 | **Avaliação pós-entrega** | Após `deliveryStatus = DELIVERED`, pedir nota. Gera prova social e feedback pro dono. |

**Técnico — antes de produção:**
| # | Item | Notas de implementação |
|---|------|------------------------|
| M7 | **Float → centavos (Int)** | Evita bug de arredondamento em dinheiro. Migração com cuidado + reteste de Pix. |
| M8 | **Rate limiting no checkout** | Evitar spam de pedidos e abuso de cupom. |

> **Recomendação para retomar:** M2 e M3 concluídos. Próximo: **M1 (WhatsApp real)** — decidir provedor (whatsapp-web.js é o mais simples pra MVP, mas exige processo sempre rodando; Evolution API é mais robusto; API oficial Meta é a única sem risco de banimento, porém com mais burocracia). Depois **M4 (fotos reais)**.

---

## Histórico de Sessões

| Sessão | Data | Máquina | Resumo |
|--------|------|---------|--------|
| 1 | 23/06/2026 | Notebook Renan | Criação do projeto V2 |
| 2 | 24/06/2026 manhã | Renan Notebook Gordon | Mobile-first, modal produto, conta cliente |
| 3 | 24/06/2026 tarde | Renan Notebook Gordon | Rebranding Malte & Tabaco, ícones FA6, toast, admin completo, 51 produtos reais |
| 4 | 25/06/2026 manhã | Renan Notebook Gordon | M2 (relatório de vendas), pagamento na entrega (dinheiro/cartão), rename para adega-malte |
| 5 | 26/06/2026 | sessão IA | Docs atualizados, M3 (controle de estoque) implementado e testado |
