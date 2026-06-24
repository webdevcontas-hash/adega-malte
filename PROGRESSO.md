# Malte & Tabaco — Progresso do Desenvolvimento

> Última atualização: 24/06/2026 15:23 · Renan Notebook Gordon (DELL)

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

### Melhorias de produto (próxima sessão — análise 24/06 tarde)

**Alto impacto — operação e conversão:**
| # | Item | Notas de implementação |
|---|------|------------------------|
| M1 | **Notificação WhatsApp real** | `lib/whatsapp.ts` hoje só loga no console. Avisar o dono na hora do pedido pago. Opções: link `wa.me` automático, Evolution API ou whatsapp-web.js. É a pendência mais crítica pra operação real. |
| M2 | **Relatório de vendas no admin** | Nova aba no `/admin`: total vendido dia/semana, produtos mais vendidos, ticket médio, pedidos por horário. Dados já existem em `Order` + `OrderItem` — só agregar e exibir. NÃO depende de credencial externa → bom ponto de partida. |
| M3 | **Controle de estoque** | Hoje produto é só ativo/inativo. Adicionar campo de quantidade no `Product` que decrementa no pedido pago. Evita vender o que acabou (ex.: última garrafa de um whisky). |

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

> **Recomendação para retomar:** começar por **M2 (relatório de vendas)** — não depende de credencial externa, dá pra ver funcionando na hora. Depois **M1 (WhatsApp)**. Esses dois transformam o app de demo em ferramenta de uso diário do dono.

---

## Histórico de Sessões

| Sessão | Data | Máquina | Resumo |
|--------|------|---------|--------|
| 1 | 23/06/2026 | Notebook Renan | Criação do projeto V2 |
| 2 | 24/06/2026 manhã | Renan Notebook Gordon | Mobile-first, modal produto, conta cliente |
| 3 | 24/06/2026 tarde | Renan Notebook Gordon | Rebranding Malte & Tabaco, ícones FA6, toast, admin completo, 51 produtos reais |
