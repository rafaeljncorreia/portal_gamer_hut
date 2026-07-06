# Brief OpenCode — Deploy do `app-web` (plataforma campaign-centric)

> **Handoff pro OpenCode.** O Claude construiu as Fases A/B/C do `app-web` (Vite) — a nova
> plataforma campaign-centric (ver `DIRETRIZ-PLATAFORMA.md`). Falta **publicar**. O código está
> todo commitado na `main`. Esta é uma tarefa de **deploy/infra**, isolada da lógica.

## Situação atual
- **Portal estático legado** roda no GitHub Pages a partir da **raiz** do repo (`main`), em
  `https://rafaeljncorreia.github.io/portal_gamer_hut/` (project site → base path `/portal_gamer_hut/`).
- **`app-web/`** é um app **Vite + React Router v7** (`BrowserRouter`), ainda **não publicado**.
  `npm run build` gera `app-web/dist/` (já testado, builda limpo).
- O `app-web` usa `react-router-dom` com rotas `/`, `/campanha/:id`, `/marca`, `/catalogo`.
- Dados de marca/catálogo são servidos como `<script>` de `app-web/public/` (`config.js`,
  `generation-context.js`, `brand-voice.js`, `catalog.js`) + `catalog.json`.

## ⚠️ Dois pontos que QUEBRAM se ignorados no deploy
1. **SPA fallback:** `BrowserRouter` + deep links (`/campanha/:id`) dão **404 no GitHub Pages**
   (não há server rewrite). Soluções: usar **`HashRouter`** (mais simples p/ Pages) OU o truque
   `404.html` → `index.html` com redirect. Recomendo `HashRouter` se for subpath do Pages.
2. **Caminho do `catalog.json`:** `app-web/public/catalog.js` faz `fetch('/catalog.json')`
   (ABSOLUTO na raiz do domínio). Isso só funciona se o app for servido **na raiz** do domínio.
   Em subpath (`/portal_gamer_hut/plataforma/`) vira `/catalog.json` no domínio errado → 404 →
   fallback SPA → "Unexpected token '<'". Se deployar em subpath, **torne o caminho base-aware**
   (ex.: injete um `window.GH_BASE` no `index.html` e use `fetch(GH_BASE + 'catalog.json')`, ou
   volte a relativo `catalog.json` + garanta `<base href>` coerente).

## Opção A (RECOMENDADA — zero mudança de código): Vercel/Netlify na raiz
Como o TGT Hub de referência já roda em Vercel, publicar o `app-web` em **Vercel ou Netlify**
num domínio próprio (raiz `/`) é o de menor atrito:
- Root directory = `app-web`, build = `npm run build`, output = `dist`.
- `base` do Vite continua `/`; `BrowserRouter` funciona (Vercel/Netlify fazem SPA fallback);
  `fetch('/catalog.json')` funciona (raiz). **Nenhuma alteração de código necessária.**
- Entregável: a URL nova (ex.: `gamerhut-plataforma.vercel.app`). Atualizar o link no portal
  estático (`index.html`) apontando pra ela, se o usuário quiser.

## Opção B (mesmo Pages, subpath): `/portal_gamer_hut/plataforma/`
Se preferir manter tudo no GitHub Pages:
1. `app-web/vite.config.js`: `base: '/portal_gamer_hut/plataforma/'`.
2. Trocar `BrowserRouter` por `HashRouter` em `app-web/src/main.jsx` (evita 404 em deep link).
3. Corrigir o `fetch` do `catalog.json` em `app-web/public/catalog.js` p/ ser base-aware
   (ver ponto ⚠️2). Testar `window.GH_CATALOG.load()` no console após deploy.
4. Publicar `app-web/dist/` na pasta `/plataforma/` da `main` — via **GitHub Action** que builda
   e commita/publica (preferível) OU commit manual do `dist`. NÃO servir `node_modules`.
5. Conferir que o portal estático da raiz continua intacto.

## Critérios de aceite
- [ ] A home de campanhas abre na URL pública e cria/persiste campanha (localStorage).
- [ ] Deep link direto pra `/campanha/:id` (ou `#/campanha/:id` no HashRouter) **não dá 404**.
- [ ] Catálogo lista os 22 jogos (o `catalog.json` carrega — sem "Unexpected token '<'").
- [ ] Marca renderiza os 12 blocos; geração de Copy/Descrição chama o proxy de IA e volta texto.
- [ ] Portal estático legado da raiz segue funcionando.

## Cuidados
- **Proxy de IA:** o Worker (`window.GH_CONFIG.proxyUrl`) já tem CORS `*` — funciona de qualquer
  origem. Não precisa mexer.
- **Duplicação root ↔ public:** os 5 arquivos de dados estão duplicados de propósito (DIRETRIZ §6).
  Se atualizar `catalog.json` na raiz, replicar em `app-web/public/`.
- Não introduzir backend; persistência é localStorage (1.0). D1 = v2.
