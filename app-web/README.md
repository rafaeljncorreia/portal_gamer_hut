# app-web — Plataforma Campaign-Centric Gamer Hut

Aplicação Vite + React Router v7 do portal de gestão de conteúdo da
[Gamer Hut](https://gamerhut.com.br). Arquitetura **campaign-centric**:
a campanha orquestra as ferramentas via pipeline Brief → Estratégia → Materiais → Visual.

## Stack

- Vite 6 + React 18 + React Router v7
- Persistência: `localStorage` (chave `gh-campaigns`)
- IA Proxy: Cloudflare Worker (`POST {prompt} → {text}`)
- Cérebro de marca: scripts em `public/` carregados como `<script>` na ordem `config.js` → `generation-context.js` → `brand-voice.js` → `catalog.js`

## Rotas

| Rota | Componente | Função |
|------|-----------|--------|
| `/` | `Campanhas` | Workspace — lista de campanhas |
| `/campanha/:id` | `Campanha` | Pipeline de 4 estágios |
| `/marca` | `Marca` | Cérebro de marca (leitura) |
| `/catalogo` | `Catalogo` | Catálogo de jogos (filtros) |

## Rodar localmente

```bash
npm run dev
```

## Build

```bash
npm run build   # gera dist/
```
