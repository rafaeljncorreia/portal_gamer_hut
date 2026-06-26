# Portal Gamer Hut — Contexto do Projeto

## Goal
Construir o **Portal Gamer Hut** como plataforma de criação de conteúdo para a Gamer Hut, implementando features incrementalmente com foco inicial no **switch geracional (Gen Z/Millennial/Gen X)** nos módulos de Copy e Creative Studio.

## Stack
- **React 18** + **Babel standalone** via CDN (sem build step)
- **GitHub Pages** (branch `main`, raiz do repositório)
- **Cloudflare Worker** como proxy da Anthropic API
- Sem npm/Node no frontend — tudo vanilla + CDN

## Equipe
- **PO:** Rafael
- **Dev:** Enzo
- Tempo parcial

## Repositório
- **URL:** `https://github.com/rafaeljncorreia/portal_gamer_hut`
- **Pages:** `https://rafaeljncorreia.github.io/portal_gamer_hut`
- **Local:** `C:\Users\Joao\OneDrive\Desktop\Portal-Gamer-Hut`
- **Remote:** `https://github.com/rafaeljncorreia/portal_gamer_hut.git`

## Regras de Negócio (Imutáveis)

### Switch Geracional
- Deve afetar **ambos os módulos** (Copys + Creative Studio), sincronizados via `localStorage` (chave: `gh-generation`)
- 3 perfis: `gen-z`, `millennial`, `gen-x`
- Perfis geracionais baseados exclusivamente no **brandbook v2026.09** (seção 05-pilares-e-audiencia.md)
- `getBrandVoice(gen)` retorna brand guide base + contexto geracional; fallback para base pura se geração inválida

### Meme Generator
- Deve ser alimentado por campo de **contexto breve**
- Deve ter switch **Feed/Story** igual ao Post Blocado
- Template já existente: 3 modos (classic/reaction/dual), ratio 4:5
- Calendário semanal em `meme-do-dia.js` + `fluxo-meme-diario.md`

### Brandbook (10 Regras de Ouro)
- Brandbook v2026.09 da Gamer Hut é a fonte oficial de tom, cores, fontes e regras
- Todas as implementações devem seguir as 10 regras de ouro

### IA / Proxy
- Config.js tem proxyUrl apontando para Cloudflare Worker
- URL: `https://dawn-moon-c724-gamerhut-ia.contatotgt.workers.dev/`

### Integrações
- Monday.com: **apenas read-only**
- Roteiros de vídeo: formato **texto markdown estruturado**

## Roadmap (Sprints)
1. ✅ **Switch Geracional** — Copys + Studio (concluído)
2. ⬜ **Descrições Padronizadas (YT/TikTok/Insta) + Meme Generator IA**
3. ⬜ **Títulos SEO + Roteiros de Vídeo**
4. ⬜ **Integração Monday.com**
5. ⬜ **Studio Brandbook Compliant + Polimento/Supabase**

## Decisões Tomadas
- Switch geracional primeiro no `copys.html` (maior valor imediato — IA usa contexto)
- Studio recebe mesmo switch no header para consistência
- Persistência via `localStorage` com chave `gh-generation`
- Decisão pendente: aplicar switch no `index.html`?

## Arquivos Relevantes

### Modificados/Criados (último commit cd52c35)
| Arquivo | Descrição |
|---------|-----------|
| `generation-context.js` | Perfis das 3 gerações com contexto detalhado para IA |
| `brand-voice.js` | Guia de marca + função `getBrandVoice(generation)` |
| `copys.html` | Página de criação de copys com switch geracional + prompt adaptativo |
| `studio.html` | Creative Studio carregando generation-context.js e brand-voice.js |
| `app/app.jsx` | App React com estado gen + TopBar com switch geracional |
| `app/data.jsx` | Design tokens, templates, patterns (ajuste meme 4:5) |

### Existentes (referência)
| Arquivo | Descrição |
|---------|-----------|
| `config.js` | URL do Cloudflare Worker proxy |
| `server/worker.js` | Código do Cloudflare Worker |
| `meme-do-dia.js` | Calendário semanal de memes |
| `fluxo-meme-diario.md` | Documentação do fluxo de memes |
| `portal.css` | Estilos globais do portal |
| `index.html` | Página inicial (ainda sem switch geracional) |
| `review.html` | Página de review |
| `GH-Assets-Brandbook-2026/` | Brandbook completo (8 markdowns + HTML + assets) |

## Convenções de Código
- `generation-context.js` deve ser carregado **ANTES** de `brand-voice.js` e de qualquer JSX que referencie `window.GH_GENERATIONS`
- Backticks em template literals devem ser escapados (\`) quando aparecem dentro de strings
- Sempre usar `window.GH_GENERATIONS`, `window.GH_BRAND`, `window.GH_CONFIG` para acessar os módulos globais
- Fallback manual no copys.html se `GH_GENERATIONS` não carregar

## ⚠️ Prioridade #1 — Problema de Testes (Resolver antes de qualquer dev)

O usuário **não consegue testar as alterações** — o servidor Python local não funciona no sandbox OpenCode e o GitHub Pages tem atraso no deploy.

**Ações obrigatórias antes de qualquer desenvolvimento novo:**
1. Verificar se `copys.html`, `studio.html` e `generation-context.js` estão corretos via fetch direto do GitHub Pages
2. Confirmar com usuário se hard refresh (Ctrl+F5) no navegador resolveu
3. Se não resolver, investigar config do GitHub Pages (branch/source)
4. Validar e documentar o fluxo de teste funcional
5. Depois de resolvido, **esquecer este tópico** e seguir o roadmap

> Handoff detalhado para novo agente em `HANDOFF.md`

## Problemas Conhecidos (secundários)
- Porta 8080 em uso por servidor Python local (útil para testes locais)
- Servidor Python local não funciona no sandbox do OpenCode (não insistir)
- GitHub Pages pode levar alguns minutos para refletir novos pushes
- Cache do navegador pode mostrar versão antiga — usar Ctrl+F5
