# HANDOFF — Plataforma de Gestão Gamer Hut (OpenCode)

> Spec de execução para os agentes do OpenCode. Plano estratégico completo em
> `~/.claude/plans/precisamos-mudar-de-rota-zesty-hearth.md`. Este arquivo é o
> **como fazer**, cirúrgico: arquivo → comando → código.

> ⚠️ **1.0 vs v2 — LEIA PRIMEIRO.** O **1.0** (agora) é SEM backend novo — catálogo por
> snapshot (`catalog.json` + `catalog.js`, já prontos) e geradores catálogo-aware. O sprint
> ativo é **`sprints/sprint-fase-0-1-opencode.md`** — comece por ele. As seções 2–6 abaixo
> (Cloudflare D1, wrangler, `/catalog` sync, `/brand`, Supabase) são **v2**, quando houver um
> backend gerenciado. Os arquivos `server/schema.sql`, `server/wrangler.toml` e as rotas D1 do
> `server/worker.js` são groundwork de v2 — NÃO usados no 1.0.

## 0. Contexto em 30 segundos

O "Portal Gamer Hut" (gerador de conteúdo React via CDN) vira uma **plataforma de gestão**:
lê o board Monday de pré-vendas/lançamentos como catálogo, cruza com o cérebro de marca,
gera conteúdo contextualizado e devolve tarefas pro time no Monday.

**Stack alvo:** Front React + Vite (rotas) em Cloudflare Pages · Backend Cloudflare Worker + D1.
**Não publica** em redes; **orquestra** (gera + manda pro Monday).

## 1. O que JÁ está pronto (não refazer)

| Arquivo | Estado |
|---|---|
| `server/schema.sql` | ✅ Schema D1 completo: `products` (cache do board), `brand_versions`, `launches`, `plan_items`, `generations`. |
| `server/worker.js` | ✅ Rotas `/ai` (proxy Anthropic, contrato preservado), `GET /catalog` (cache + status derivado), `POST /catalog/sync` (Monday→D1). Mapeamento de colunas auditado no objeto `COL`. |
| `server/wrangler.toml` | ✅ Config com binding D1 `DB`. Falta colar `database_id`. |

**Cérebro de marca a preservar (é ouro, migrar íntegro):** `brand-voice.js` (`GH_BRAND`,
`GH_TONES`, `GH_PLATFORMS`, `getBrandVoice`) e `generation-context.js` (`GH_GENERATIONS`).
Geradores atuais a portar: `copys.html`, `descricoes.html`, `studio.html`+`app/*.jsx`, `review.html`.
Contrato IA preservado: `POST {prompt,model?,max_tokens?} → {text}` (ver `copys.html:497-518`).

## 2. FASE 0 — Setup de infra (fazer 1x, manual + comandos)

```bash
cd server

# 1) Criar o banco D1 e colar o database_id em wrangler.toml
npx wrangler d1 create gamerhut
#   → copiar database_id para [[d1_databases]].database_id

# 2) Aplicar o schema (local e remoto)
npx wrangler d1 execute gamerhut --file=schema.sql --remote

# 3) Secrets
npx wrangler secret put ANTHROPIC_API_KEY   # chave Anthropic (já usada hoje)
npx wrangler secret put MONDAY_TOKEN         # API token Monday c/ acesso ao board 18417580003

# 4) Deploy do worker
npx wrangler deploy
```

**Validação Fase 0:**
```bash
curl -X POST https://<worker>/catalog/sync   # → {"ok":true,"upserts":N}
curl https://<worker>/catalog                # → {"products":[...],"count":N} com status derivado
```
Se `/catalog/sync` retornar itens (ex: "Hollow Knight", geracao_alvo "Gen Z / Millennial",
pilar "Drop & Lançamento"), a fonte está ligada.

**Board fonte (auditado):** `18417580003` — colunas mapeadas em `worker.js > COL`.
Grupos = ciclo de vida (Próximos Lançamento / Em Pré Venda / Lançamentos / Relembrados / Concluídos).

## 3. FASE 1 — Fundação (front + catálogo + cérebro)

### 3.1 Scaffold do front
```bash
# na raiz do repo
npm create vite@latest app-web -- --template react
cd app-web && npm i react-router-dom
```
- Criar rotas: `/catalogo` `/marca` `/radar` `/plano` `/gerar` (placeholder por enquanto).
- Portar identidade visual de `portal.css` para o tema do app.
- Config da URL do worker via `.env` (`VITE_API_URL`), substituindo `config.js`/`GH_CONFIG.proxyUrl`.

### 3.2 Módulo Catálogo (rota `/catalogo`)
- Fetch `GET ${VITE_API_URL}/catalog` → tabela read-only de produtos.
- Botão "Sincronizar" → `POST /catalog/sync` → refetch.
- Filtro por `status` derivado (a_venda / pre_venda / nao_vende / aguardando) e por `grupo`.
- Mostrar `geracao_alvo`, `pilar_sugerido`, janela de divulgação (`divulgacao_inicio`→`fim`), `divulgar`.

### 3.3 Módulo Marca (rota `/marca`) + seed
- Criar `server/seed-brand.sql`: transformar `brand-voice.js` + `generation-context.js` em
  INSERTs na tabela `brand_versions` (bloco_tipo/bloco_key/label/conteudo/meta). Um bloco por:
  `brand:base`, `tone:hype|informativo|nostalgico|zueiro`,
  `platform:instagram|tiktok|youtube|feed`, `generation:gen-z|millennial|gen-x`.
- Worker: adicionar `GET /brand` (blocos is_current=1) e `POST /brand` (nova versão:
  insere com is_current=1 e marca a anterior do mesmo bloco_key como is_current=0).
- Front: tela que lista blocos e permite editar → salva nova versão (histórico preservado).

**Validação Fase 1:** editar item no board Monday → Sincronizar → ver refletido com status certo.
Editar um tom em `/marca` → confirmar nova linha em `brand_versions` e a antiga com `is_current=0`.

## 4. FASE 2 — Plugar os geradores

- Portar `copys.html`, `descricoes.html`, `review.html`, `studio.html`(+`app/*.jsx`) como rotas React.
- Reimplementar `getBrandVoice(gen, plat, tone)` **lendo de `/brand`** (não mais do JS estático);
  manter a mesma assinatura e o mesmo formato de prompt concatenado.
- No gerador, selecionar um **produto do catálogo** → auto-preencher `geracao_alvo` e `pilar_sugerido`
  daquele jogo (herdados do board) nos eixos do gerador. Reduz digitação manual.
- Toda geração → `POST /generations` (worker grava em `generations` com snapshot do contexto de marca).
- Manter o contrato `/ai` intacto — só muda de onde vem o contexto.

**Validação:** gerar copy escolhendo um jogo real; conferir que status/pré-venda/pilar corretos
entraram no prompt; ver a saída salva em `generations`.

## 5. FASE 3 — Radar de lançamentos

- Worker `GET/POST /launches`: integrar RAWG (ou IGDB) para puxar lançamentos → gravar em `launches`
  com `status_curadoria='sugerido'`. Chave em secret `RAWG_KEY`.
- Fila de curadoria no front: aprovar/descartar. Cruzar `launches.nome` ↔ `products.nome`
  (preencher `match_produto` quando a GH já vende).
- Curadoria humana é obrigatória (cobertura BR das APIs é parcial).

## 6. FASE 4 — Planejamento + Monday (destino)

- Módulo Plano (rota `/plano`): calendário editorial. Seed de padrão semanal em `calendario-semanal.json`
  (7 dias com tema/template/gancho/CTA). Cruza radar + catálogo + geração + tom + canal → grava `plan_items`.
- Worker `POST /monday`: cria tarefa a partir de um `plan_item`, guarda `monday_item_id`.
  **DECISÃO PENDENTE (definir no início da fase):** destino =
  board operacional **GAMER HUT `5378150325`** (colunas Objetivo/Plataforma/Tipo de Material/Data
  Publicação/Destino) **ou** subitens no próprio board de pré-vendas `18417580003`.
- Mutation Monday: `create_item` (ou `create_subitem`) com `column_values` mapeados.

**Validação:** montar plano semanal → empurrar → conferir item criado no board com os campos certos.

## 7. Convenções e regras de marca (NÃO violar na geração)

Ver memória de marca. Essenciais: sempre "GAMER HUT" (nunca "Hut" só); "sua/seu" (nunca "tua/teu");
nunca prometer data de entrega ("envio a partir do lançamento oficial"); nunca "Bora" como CTA;
mídia física é o valor central; escassez só quando real; storytelling antes do CTA.
3 eixos de geração: Geração (gen-z/millennial/gen-x) × Tom (hype/informativo/nostalgico/zueiro) ×
Plataforma (instagram/tiktok/youtube/feed).

## 8. Regressão

O contrato `/ai` do Worker permanece `POST {prompt}→{text}`. Qualquer gerador portado deve produzir
saída equivalente à atual para o mesmo input. Não quebrar o proxy existente que o site publicado usa.
