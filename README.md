# Portal Gamer Hut — Plataforma de Gestão de Conteúdo

Portal interno de gestão e geração de conteúdo da Gamer Hut
([`gamerhut.com.br`](https://gamerhut.com.br) · `@gamerhut.store`).
Aplica automaticamente o tom de voz e identidade visual da marca, segmentando
por geração (Gen Z, Millennial, Gen X).

Arquitetura **campaign-centric**: a campanha orquestra as ferramentas via pipeline
Brief → Estratégia → Materiais → Visual.

## Stack

- **Portal estático** (HTML + vanilla JS + CDN, React 18 via Babel standalone) — GitHub Pages
- **app-web** (Vite + React Router v7) — plataforma campaign-centric (em desenvolvimento)
- **Cloudflare Worker** — proxy da Anthropic API
- Persistência: `localStorage`

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Copys | Geração de copy com switch geracional (Gen Z / Millennial / Gen X) |
| Creative Studio | Design de peças visuais (carrossel, post blocado, quiz, ranking, reels) |
| IA Proxy | Geração de texto via Cloudflare Worker + Anthropic API |

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| [`AGENT-PLAYBOOK.md`](AGENT-PLAYBOOK.md) | Brandbook completo: 10 regras, 5 sentimentos, playbook geracional |
| [`sprints/SPRINT-INDEX.md`](sprints/SPRINT-INDEX.md) | Sprint ativo, histórico e pendentes |
| [`docs/INDEX.md`](docs/INDEX.md) | Mapa completo da documentação |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Diagrama da pipeline e ordem de carregamento |
| [`DIRETRIZ-PLATAFORMA.md`](DIRETRIZ-PLATAFORMA.md) | Visão campaign-centric detalhada |

## Brandbook

A identidade visual e tom de voz são definidos no brandbook oficial:
[`gamer-hut.vercel.app`](https://gamer-hut.vercel.app) (26 stages).
O arquivo [`AGENT-PLAYBOOK.md`](AGENT-PLAYBOOK.md) é um resumo curado para consulta rápida.

## Como rodar localmente

```bash
python -m http.server 8080
# Abrir http://localhost:8080
```

## Repositório

- **GitHub:** `github.com/rafaeljncorreia/portal_gamer_hut`
- **Pages:** `rafaeljncorreia.github.io/portal_gamer_hut`
