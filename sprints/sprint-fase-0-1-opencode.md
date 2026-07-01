# SPRINT — Fase 0 + Fase 1 (brief para o OpenCode)

Referências obrigatórias no repo: `HANDOFF-OPENCODE.md` (seções 2 e 3), `server/schema.sql`,
`server/worker.js`, `brand-voice.js`, `generation-context.js`.

## Objetivo do sprint
Deixar a fundação de pé: banco D1 no ar, catálogo lendo o board Monday de verdade, e o cérebro
de marca versionado editável. Ao fim, `/catalogo` e `/marca` funcionam no front novo.

---

## PARTE A — Passos do HUMANO (não automatizar; exigem credenciais)
1. `cd server && npx wrangler d1 create gamerhut` → colar o `database_id` em `server/wrangler.toml`.
2. `npx wrangler secret put ANTHROPIC_API_KEY` (chave já usada hoje).
3. `npx wrangler secret put MONDAY_TOKEN` (API token Monday com acesso ao board `18417580003`).
> Avisar o dev quando A1–A3 estiverem feitos; o OpenCode segue a partir daí.

## PARTE B — OpenCode automatiza

### B1. Aplicar schema + deploy do worker (já escrito, só rodar)
```bash
cd server
npx wrangler d1 execute gamerhut --file=schema.sql --remote
npx wrangler deploy
```
Validar: `POST /catalog/sync` → `{"ok":true,"upserts":N}`; `GET /catalog` → produtos com `status`
derivado. NÃO reescrever `worker.js`/`schema.sql` já existentes — apenas estender (B3).

### B2. Seed do cérebro de marca → `server/seed-brand.sql` (NOVO)
Gerar INSERTs em `brand_versions` a partir de `brand-voice.js` e `generation-context.js`,
1 linha por bloco (todos `is_current=1`):
- `brand:base` ← `GH_BRAND`
- `tone:hype|informativo|nostalgico|zueiro` ← `GH_TONES[*].context` (label/desc em `meta` JSON)
- `platform:instagram|tiktok|youtube|feed` ← `GH_PLATFORMS[*].context`
- `generation:gen-z|millennial|gen-x` ← `GH_GENERATIONS[*].context` (emoji/pctFeed/desc em `meta`)
Aplicar: `npx wrangler d1 execute gamerhut --file=seed-brand.sql --remote`.

### B3. Estender `server/worker.js` — rotas de marca (preservar o resto)
- `GET /brand` → todos os blocos `is_current=1`.
- `POST /brand` `{bloco_tipo,bloco_key,label,conteudo,meta}` → transação: `UPDATE brand_versions
  SET is_current=0 WHERE bloco_tipo=? AND bloco_key=? AND is_current=1;` depois INSERT novo `is_current=1`.
- Reusar helpers `json()` e CORS já existentes; adicionar as rotas no router do `fetch`.

### B4. Front novo (Vite + React Router)
```bash
npm create vite@latest app-web -- --template react
cd app-web && npm i react-router-dom
```
- `.env`: `VITE_API_URL=<url do worker>`. Aposentar `config.js`/`GH_CONFIG`.
- Tema a partir de `portal.css` (mesma identidade visual).
- Rotas placeholder: `/radar` `/plano` `/gerar`. Rotas reais neste sprint: `/catalogo` e `/marca`.

**`/catalogo`:** `GET /catalog` → tabela read-only. Botão "Sincronizar" → `POST /catalog/sync` → refetch.
Filtros por `status` (a_venda/pre_venda/nao_vende/aguardando) e `grupo`. Exibir `geracao_alvo`,
`pilar_sugerido`, janela de divulgação e `divulgar`.

**`/marca`:** lista blocos de `GET /brand`; editar um bloco → `POST /brand` (nova versão). Mostrar que
a edição cria versão nova sem apagar a anterior.

---

## Critérios de aceite (Definition of Done)
- [ ] `GET /catalog` devolve os jogos do board com `status` derivado correto.
- [ ] Editar item no board Monday → "Sincronizar" no `/catalogo` → mudança refletida.
- [ ] `brand_versions` populado pelo seed; `GET /brand` devolve blocos vigentes.
- [ ] Editar um tom em `/marca` cria linha nova com `is_current=1` e a anterior vira `is_current=0`.
- [ ] `/ai` continua funcionando igual (regressão): `POST {prompt}→{text}` intacto.

## Não fazer neste sprint
- Portar geradores (Fase 2), radar (Fase 3), criar tarefas no Monday (Fase 4).
- Não alterar o contrato `/ai`. Não tocar nas regras de marca (HANDOFF seção 7).
