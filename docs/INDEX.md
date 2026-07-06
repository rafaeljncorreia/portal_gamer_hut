# Índice de Documentação — Portal Gamer Hut

> Mapa navegável de URLs oficiais e arquivos locais. Consulte a coluna **Quando ler**
> para decidir qual arquivo abrir em cada contexto.

---

## 🌐 URLs Oficiais

| Recurso | URL | O que contém |
|---------|-----|-------------|
| Brandbook oficial | https://gamer-hut.vercel.app | 26 stages: manifesto, essência, tom, cores, tipografia, logos, grid, publishers, feed, audiências, arquétipo |
| Social Playbook | https://ghsocial.vercel.app | Plano editorial 9 semanas, KPIs, matriz canal×geração, 10 regras de ouro, cheat sheet de copy |
| GitHub Pages (deploy) | https://rafaeljncorreia.github.io/portal_gamer_hut | Portal estático (legado) |
| IA Proxy Worker | https://dawn-moon-c724-gamerhut-ia.contatotgt.workers.dev | Proxy Anthropic API (contrato: `POST {prompt} → {text}`) |

---

## 🔴 Sempre Ler (toda sessão)

| Arquivo | Quando |
|---------|--------|
| `AGENTS.md` | Lido automaticamente pelo OpenCode — constituição do agente (papéis, prioridade, stack, regras, decisões permanentes) |

## 🟡 Ler no Planejamento

| Arquivo | Quando |
|---------|--------|
| `sprints/SPRINT-INDEX.md` | Ao definir o que fazer — sprint ativo, histórico e pendentes |
| `sprints/TEMPLATE.md` | Ao criar uma nova sprint |
| `sprints/[ATIVO].md` | Durante a sprint atual (ver `sprints/SPRINT-INDEX.md`) |

## 🔵 Ler Sob Demanda

| Arquivo | Quando |
|---------|--------|
| `AGENT-PLAYBOOK.md` | Validar output de marca (10 regras, 5 sentimentos, playbook geracional, QA checklists) |
| `docs/ARCHITECTURE.md` | Entender fluxo de dados, relação portal vs app-web, contrato do Worker |
| `DIRETRIZ-PLATAFORMA.md` | Visão campaign-centric (Brief → Estratégia → Materiais → Visual) |
| `HANDOFF-OPENCODE.md` | Infra/migração (v1 → v2, D1, Monday) |
| `app-web/README.md` | Sobre o app-web (Vite + React Router v7) |

---

## 🧠 Cérebro de Marca (ordem de carregamento)

| Ordem | Arquivo | Global | Conteúdo |
|-------|---------|--------|----------|
| 1 | `config.js` | `window.GH_CONFIG` | URL do proxy de IA |
| 2 | `generation-context.js` | `window.GH_GENERATIONS` | Contexto por geração (Gen Z, Millennial, Gen X) |
| 3 | `brand-voice.js` | `window.GH_BRAND`, `window.getBrandVoice()` | Voz da marca + tons + plataformas |
| 4 | `catalog.js` | `window.GH_CATALOG` | Snapshot do catálogo (jogos do board Monday) |

> 📦 `catalog.json` — dump raw do catálogo (fonte do `catalog.js`)

## ⚡ app-web (Vite + React Router v7)

| Arquivo | Função |
|---------|--------|
| `src/lib/gh.js` | Ponte React-friendly para os globais `window.GH_*` |
| `src/lib/campaigns.js` | Store de campanhas (localStorage, chave `gh-campaigns`) |
| `src/lib/prompts.js` | Construtores de prompt para IA (arte/template, descrição, roteiro, estratégia) |
| `src/pages/Campanhas.jsx` | Home — lista de campanhas |
| `src/pages/Campanha.jsx` | Pipeline de uma campanha (Brief → Estratégia → Materiais → Visual) |
| `src/pages/Catalogo.jsx` | Catálogo de jogos |
| `src/pages/Marca.jsx` | Cérebro de marca (leitura) |
| `src/pages/stages/*.jsx` | Estágios da pipeline |

## 🖥 Server (Cloudflare Worker + D1)

| Arquivo | Função |
|---------|--------|
| `server/worker.js` | Rotas: `/ai` (proxy), `/catalog` (cache), `/catalog/sync` (Monday→D1), `/brand` (CRUD) |
| `server/wrangler.toml` | Config do Worker com binding D1 |
| `server/schema.sql` | Schema D1: `products`, `brand_versions`, `launches`, `plan_items`, `generations` |
| `server/DEPLOY.md` | Instruções de deploy |

## 📦 Portal Estático (legado, GitHub Pages)

| Arquivo | Função |
|---------|--------|
| `index.html` | Home do portal (grade de ferramentas) |
| `copys.html` | Gerador de copys |
| `descricoes.html` | Gerador de descrições |
| `studio.html` + `app/*.jsx` | Creative Studio (artes visuais) |
| `review.html` | Revisor de copys com IA |
| `criar.html` | Criação unificada (4 passos) |
| `aprendizado.html` | Diretrizes de marca |
| `downloader.html` | Media downloader |
| `portal.css` | Design tokens (variáveis CSS) |
| `calendario-semanal.json` | Grade editorial semanal |
| `fluxo-meme-diario.md` | Fluxo diário de criação de memes (legado) |
