# Arquitetura — Portal Gamer Hut

> Diagrama textual do fluxo de dados, relação entre as frentes, contrato do Worker
> e modelo de campanha. Fonte da verdade: o código. Este documento descreve o que existe.

---

## 1. Fluxo de Dados

```
config.js  ──────────────────────────────────────────────────────────────┐
(window.GH_CONFIG.proxyUrl)                                              │
                                                                         ▼
generation-context.js  ────►  brand-voice.js  ────►  catalog.js  ────►  gh.js (ponte)  ────►  React (UI)
(window.GH_GENERATIONS)      (window.GH_BRAND,       (window.GH_CATALOG)  (getBrandVoice(),    (Campanhas,
                               GH_TONES,                                    proxyUrl(),          Catálogo,
                               GH_PLATFORMS,                                 loadCatalogo(),      Marca,
                               getBrandVoice())                              gerar())             estágios)
            ▲                            ▲                    ▲
            │                            │                    │
    Scripts carregados           buildBrandVoice()     catalog.js (IIFE)
    via <script> em              concatena base +      fetch catalog.json
    index.html (ordem            tom + plataforma +    → window.GH_CATALOG
    obrigatória, ver §3)         geração ativa
```

**Sentido do fluxo:** configuração → contexto de marca → catálogo → ponte React → UI.
Nenhum módulo depende de quem vem depois. Cada um pendura seu global em `window.GH_*`.

### Fluxo de geração de conteúdo (com IA)

```
UI (React)  ──►  gh.gerar(prompt)  ──►  Cloudflare Worker  ──►  Anthropic API
                                                  │
                                                  ▼
                                           { text: "..." }
                                                  │
                                                  ▼
                                           UI (React) exibe resultado
```

Contrato do proxy: `POST { prompt, model?, max_tokens? } → { text }`.

---

## 2. Portal Estático vs app-web

| Aspecto | Portal Estático (legado) | app-web (em desenvolvimento) |
|---------|--------------------------|------------------------------|
| Stack | HTML + vanilla JS + React 18 via CDN (Babel standalone) | Vite + React Router v7 |
| Deploy | GitHub Pages (branch `main`, raiz) | Cloudflare Pages (futuro) |
| Estado | 🟢 Live, em produção | 🟡 Em desenvolvimento, campaign-centric |
| Persistência | localStorage (chave `gh-generation`) | localStorage (chave `gh-campaigns`) |
| Geração | Ferramentas soltas (copys.html, descricoes.html, studio.html) | Pipeline orquestrada por campanha |
| Cérebro de marca | Scripts na raiz | Cópias em `app-web/public/` (mesmos arquivos) |

### Regra de manutenção

Os 5 arquivos do cérebro de marca existem **duplicados** entre a raiz e `app-web/public/`:
- `config.js`, `generation-context.js`, `brand-voice.js`, `catalog.js`, `catalog.json`

> ⚠️ Ao editar um desses arquivos na raiz, **replicar em `app-web/public/`**. A dedupe
> (fonte única via Vite) fica para a v2.

---

## 3. Contrato do Worker (`server/worker.js`)

| Rota | Método | Função | Contrato |
|------|--------|--------|----------|
| `/ai` | POST | Proxy Anthropic | `{ prompt } → { text }` |
| `/catalog` | GET | Cache D1 do catálogo | `→ { products, count }` com status derivado |
| `/catalog/sync` | POST | Monday → D1 (upsert) | `→ { ok, upserts }` |
| `/brand` | GET | Lista blocos de marca vigentes | `→ { blocks, count }` |
| `/brand` | POST | Nova versão de bloco de marca | `{ bloco_tipo, bloco_key, conteudo } → { ok }` |

### Board Monday (fonte do catálogo)

- **Board ID:** `18417580003` (Alinhamento Pré-Vendas e Lançamentos)
- **Grupos:** Próximos Lançamentos / Em Pré Venda / Lançamentos / Relembrados / Concluídos
- **Colunas mapeadas:** 13 colunas em `worker.js` (objeto `COL`, linhas 26-39)
- **Status derivado** (nunca digitado): `a_venda`, `pre_venda`, `nao_vende`, `aguardando`

### Modelo Anthropic

- Padrão: `claude-sonnet-4-6` (ótimo para copy)
- Alternativa: `claude-haiku-4-5` (mais barato)
- Max tokens: 2048

---

## 4. Modelo de Campanha

### Pipeline

```
Brief  ──►  Estratégia  ──►  Materiais  ──►  Visual
  │              │               │               │
  ▼              ▼               ▼               ▼
Conceito      Plano de       Conteúdo por     Peças / KV
da campa-     divulgação     canal (Conteúdo  (Creative
nha (fonte)   (canais +      para arte +     Studio)
              calendário)    Descrições +
                             Roteiros)
```

### Store (`app-web/src/lib/campaigns.js`)

```javascript
// Estrutura de uma campanha (localStorage, chave 'gh-campaigns')
{
  id:           'c_...',       // único, auto-gerado
  nome:         string,        // nome da campanha
  tema:         string,        // tema/ângulo
  estado:       'rascunho' | 'em_andamento' | 'concluida' | 'arquivada',
  criada_em:    ISO date,
  atualizada_em:ISO date,
  produto_id:   string | null, // ID do produto no catálogo
  geracao:      string | null, // gen-z | millennial | gen-x
  pilar:        string | null, // pilar de conteúdo
  progresso:    { brief: bool, estrategia: bool, materiais: bool, visual: bool },
  brief:        {},            // contexto do Brief
  estrategia:   {},            // plano de divulgação
  materiais:    { itens: [] }, // conteúdo gerado (post/roteiro com campos, descricao, roteiro)
  visual:       {}             // arte/KV gerada
}
```

O modelo de dados **espelha o schema D1** (`server/schema.sql`: `plan_items`, `generations`)
para que a migração v2 (D1 como backend) seja trivial — basta trocar `localStorage` por `fetch`.

### Princípio campaign-centric

Nenhuma ferramenta gera conteúdo "no vácuo". O contexto do Brief (produto, geração, pilar, tema)
é injetado nos prompts de geração dos estágios seguintes via `prompts.js` (`promptArte`, `promptDescricao`, `promptRoteiro`, `promptEstrategia`).

---

## 5. Dívida Técnica (v2)

| Item | v1 (agora) | v2 (futuro) |
|------|------------|-------------|
| Persistência | localStorage | D1 (Cloudflare) + Supabase |
| Catálogo | Snapshot estático (catalog.json + catalog.js) | Live do board Monday via Worker |
| Cérebro de marca | Arquivos JS estáticos | Tabela `brand_versions` com versionamento |
| Duplicação de assets | Raiz + app-web/public/ | Fonte única via Vite |
| Monday | Read-only (via snapshot) | Read + write (criar tarefas) |

### Groundwork v2 já existente (não usado no 1.0)

- `server/schema.sql` — schema D1 completo
- `server/worker.js` — rotas D1 prontas (`/catalog`, `/brand`)
- `server/wrangler.toml` — config com binding D1 (falta `database_id`)
