# Sprint 1 — Doc Sprint: Doc Versionável

> **Contexto:** A Doc-Sprint-0 organizou a documentação em 3 camadas de leitura, resolvendo o problema de descoberta. Mas criou mais arquivos para manter manualmente (STATUS.md, AGENT-PLAYBOOK.md inchado) sem mecanismos de validação. Esta sprint resolve a dívida de manutenção: reduz o que é redundante, automatiza o que é verificável, e elimina ambiguidades de marca.

## Diagnóstico

3 dívidas identificadas pós Doc-Sprint-0:

1. **Fontes divergentes:** `portal.css` usava Archivo/Space Grotesk/Space Mono enquanto o brandbook (fonte oficial) determina Russo One/Red Hat Display/JetBrains Mono
2. **Cérebro de marca duplicado** (raiz + app-web/public) sem mecanismo de sync
3. **STATUS.md sem dono** — arquivo que ninguém atualiza, informação já coberta por SPRINT-INDEX.md

## O que foi feito

| Item | Ação | Arquivos tocados |
|------|------|------------------|
| STATUS.md removido | Última decisão migrada para AGENTS.md como nota permanente | `STATUS.md` (removido), `AGENTS.md` (editado) |
| Fontes alinhadas ao brandbook | Archivo → Russo One, Space Grotesk → Red Hat Display, Space Mono → JetBrains Mono em CSS + HTML + Google Fonts link | `portal.css`, `app-web/src/index.css`, `AGENT-PLAYBOOK.md`, `DIRETRIZ-PLATAFORMA.md`, `index.html`, `studio.html`, `criar.html`, `aprendizado.html`, `review.html`, `downloader.html`, `app-web/index.html` |
| Script de sync criado | `sync-brand-brain.ps1` copia raiz → app-web/public | `scripts/sync-brand-brain.ps1` (criado) |
| Script de consistência criado | `check-doc-consistency.ps1` valida duplicação + sanidade dos docs | `scripts/check-doc-consistency.ps1` (criado) |
| AGENT-PLAYBOOK.md adelgaçado | Seção de fontes oficiais removida (duplica docs/INDEX.md), backlog removido (nunca preenchido) | `AGENT-PLAYBOOK.md` (editado) |
| opencode.json configurado | customInstructions com reminder de rodar scripts | `opencode.json` (editado) |
| docs/INDEX.md atualizado | STATUS.md removido da camada "Sempre Ler" | `docs/INDEX.md` (editado) |

## O que NÃO foi feito

- CI/GitHub Actions — escopo diferente, setup de infra fica pra sprint futura
- Dedupe real dos brand brain files via Vite — documentado como v2

## Como Validar

1. Rodar `scripts/check-doc-consistency.ps1` — deve retornar exit 0
2. Verificar que `portal.css` e `app-web/src/index.css` usam Russo One, Red Hat Display, JetBrains Mono
3. Verificar que `AGENT-PLAYBOOK.md` não tem mais seções 12 e 13
4. Verificar que `STATUS.md` não existe mais na raiz
5. Verificar que nenhum HTML contém Archivo, Space Grotesk ou Space Mono (grep nos 6 HTMLs deve zerar)
6. Verificar que os 7 `<link>` do Google Fonts carregam Russo One + Red Hat Display + JetBrains Mono + Press Start 2P
