# Sprint 0 — Doc Sprint: Estrutura de Documentação

> **Contexto:** O projeto Portal Gamer Hut tem documentação fragmentada entre 14+ arquivos,
> com referências mortas, duplicação de regras e divergências em relação à fonte oficial
> da marca (brandbook live em `gamer-hut.vercel.app`). Agentes OpenCode consomem contexto
> de forma linear e perdem performance quando a documentação é dispersa, desatualizada ou
> contraditória. Esta sprint organiza a documentação em camadas de leitura para maximizar
> a eficácia dos agentes (AI-first) sem sacrificar a auditabilidade humana (docs-rich).

## Diagnóstico (Fase 0 — concluído)

7 falhas de design para IA identificadas:
1. **README.md conta história errada** — ainda se apresenta como "Gerador de criativos"
2. **Múltiplos arquivos fragmentados** — agente precisa ler 5+ arquivos para quadro completo
3. **Nenhum entry point com "quem você é"** — AGENTS.md é lido automaticamente mas não define papel
4. **Seção "Priority #1" com viés de recência** — instrução de teste enterrada no fim de AGENTS.md
5. **Roadmap é lista, não estrutura navegável** — sem indicar sprint ativo
6. **Regras em silos concorrentes** — AGENT-PLAYBOOK.md divergiu do brandbook live
7. **Nenhum entry point autocontido** — cada sessão começa com descoberta

Divergências AGENT-PLAYBOOK.md vs brandbook live (`gamer-hut.vercel.app`):

| Item | AGENT-PLAYBOOK.md (local) | Brandbook live (fonte oficial) |
|------|--------------------------|-------------------------------|
| Fontes display | Archivo | Russo One |
| Fontes corpo | Space Grotesk | Red Hat Display |
| Fontes label/mono | Space Mono | JetBrains Mono |
| Regras de ouro | 11 (seção 4) | 10 (stage 01 do social playbook) |
| Sentimentos | 2 pilares | 5 sentimentos (stage 04) |
| Cores | #000000, #F26641, #E1251B, #FFC27A, #194F90, #B1B1B1 | idem (OK) |

## Estrutura Alvo: 3 Camadas de Leitura

### Camada 1 — Sempre Lida (AI-first, 2 arquivos)
| Arquivo | Tamanho | Quando |
|---------|---------|--------|
| `AGENTS.md` | 80-100 linhas | Toda sessão (automático) |
| `STATUS.md` | 10-15 linhas | Toda sessão (após AGENTS.md) |

### Camada 2 — Lida no Planejamento (sprint docs, ~N arquivos)
| Arquivo | Tamanho | Quando |
|---------|---------|--------|
| `sprints/SPRINT-INDEX.md` | ~40 linhas | Ao definir o que fazer |
| `sprints/TEMPLATE.md` | ~30 linhas | Ao criar nova sprint |
| `sprints/[ATIVO].md` | ~80-120 linhas | Durante a sprint atual |

### Camada 3 — Lida Sob Demanda (referência, ~6 arquivos)
| Arquivo | Tamanho | Quando |
|---------|---------|--------|
| `AGENT-PLAYBOOK.md` | ~200 linhas | Validar output de marca |
| `docs/INDEX.md` | ~50 linhas | Navegar pela doc |
| `docs/ARCHITECTURE.md` | ~80 linhas | Contexto técnico |
| `DIRETRIZ-PLATAFORMA.md` | 117 linhas | Visão campaign-centric |
| `HANDOFF-OPENCODE.md` | 141 linhas | Infra/migração |
| `app-web/README.md` | ~20 linhas | Sobre o app-web |

## Plano de Execução (8 fases)

### Fase 1 — Auditar AGENT-PLAYBOOK.md contra brandbook live

**O quê:** Verificar cada seção do AGENT-PLAYBOOK.md contra `gamer-hut.vercel.app` e corrigir divergências.

**Sub-tarefas:**
- Alinhar seção 5 (Identidade Visual): Archivo → Russo One, Space Grotesk → Red Hat Display, Space Mono → JetBrains Mono
- Alinhar seção 4 (Regras de Ouro): 11 → 10 regras, sincronizar com stage 01 do social playbook
- Corrigir seção 9 (Checklist Copy): adicionar verificação dos 5 sentimentos
- Substituir seção 11 (Docs de Referência): trocar `GH-Assets-Brandbook-2026/` por URLs reais
- Adicionar seção com fontes oficiais (brandbook + social playbook)
- Manter seção 6 (Playbook Geracional) e seção 7 (Pilares) — conferidos e OK vs brandbook stage 24 e 18

**Arquivos:** `AGENT-PLAYBOOK.md` (modificado)

### Fase 2 — Reescrever AGENTS.md como Constituição

**O quê:** Reescrever AGENTS.md em 80-100 linhas como entry point definitivo.

**Conteúdo:**
1. Propósito do projeto (parágrafo único, atualizado)
2. Stack atual (portal estático + app-web Vite + Cloudflare Worker)
3. Sprint ativo (qual sprint, link para o arquivo)
4. Regras imutáveis (5 itens condensados, não 11)
5. Papéis do agente (Brand Guardian + Engenheiro + Estrategista)
6. Ordem de leitura recomendada (AGENTS.md → STATUS.md → AGENT-PLAYBOOK.md → sprint ativo)
7. O que NÃO fazer (anti-targets)
8. Links rápidos para docs/ + brandbook URLs

**O que remover:**
- Seção `⚠️ Prioridade #1 — Problema de Testes`
- Tabela de "Arquivos Relevantes" com refs mortas
- Seção "Problemas Conhecidos" (porta 8080 etc.)

**Arquivos:** `AGENTS.md` (modificado)

### Fase 3 — Criar STATUS.md (raiz)

**O quê:** Arquivo de 10-15 linhas: sprint ativo, última decisão, próximo passo, bloqueios.

**Arquivos:** `STATUS.md` (criado)

### Fase 4 — Criar docs/INDEX.md + docs/ARCHITECTURE.md

**O quê:** 
- `docs/INDEX.md` — mapa de URLs oficiais e arquivos locais com "quando ler"
- `docs/ARCHITECTURE.md` — diagrama textual do fluxo de dados (config.js → generation-context.js → brand-voice.js → catalog.js → gh.js → React), relação portal estático vs app-web, contrato do Worker, modelo de campanha

**Arquivos:** `docs/INDEX.md` (criado), `docs/ARCHITECTURE.md` (criado)

### Fase 5 — Atualizar README.md (raiz)

**O quê:** Substituir o README legado do Creative Studio pelo contexto geral da plataforma campaign-centric.

**Arquivos:** `README.md` (modificado)

### Fase 6 — Configurar opencode.json

**O quê:** Adicionar `customInstructions` injetando papel do agente + prioridade + ordem de leitura. Verificar se o schema do OpenCode suporta este campo; se não, documentar alternativa.

**Arquivos:** `opencode.json` (modificado)

### Fase 7 — Atualizar SPRINT-INDEX.md

**O quê:** Mover sprints anteriores para histórico, confirmar sprint ativo como DOC-SPRINT-0, garantir que o índice reflete o estado real.

**Arquivos:** `sprints/SPRINT-INDEX.md` (modificado)

### Fase 8 — QA da Doc Sprint (validação cruzada)

**Checklist:**
- [ ] AGENT-PLAYBOOK.md 100% alinhado com brandbook live (fontes, regras, sentimentos, pilares)
- [ ] AGENTS.md não tem referências mortas (GH-Assets-Brandbook-2026/, meme-do-dia.js)
- [ ] AGENTS.md não tem "Priority #1" criando viés de recência
- [ ] README.md reflete o projeto atual (plataforma campaign-centric)
- [ ] STATUS.md reflete o Sprint Ativo correto (Doc Sprint 0)
- [ ] opencode.json tem customInstructions injetando papel do agente
- [ ] docs/INDEX.md mapeia todas as URLs e arquivos
- [ ] docs/ARCHITECTURE.md descreve fluxo de dados real
- [ ] sprints/TEMPLATE.md segue o padrão
- [ ] SPRINT-INDEX.md reflete o estado real do projeto
- [ ] Nenhum arquivo novo foi criado sem necessidade

## Não Fazer Nesta Sprint

- Não recuperar/criar `GH-Assets-Brandbook-2026/` — brandbook é `gamer-hut.vercel.app`
- Não recriar `meme-do-dia.js` — fora de escopo
- Não modificar código-fonte (HTML, JS, CSS) — apenas documentação
- Não mexer em `HANDOFF-OPENCODE.md` ou `DIRETRIZ-PLATAFORMA.md` — mantidos como estão
- Não alterar `app-web/` — documentamos o que existe, não mexemos no código

## Como Validar

1. Abrir `gamer-hut.vercel.app` e `ghsocial.vercel.app` — são as fontes oficiais
2. Comparar cada seção do `AGENT-PLAYBOOK.md` com os stages correspondentes do brandbook
3. Verificar que `AGENTS.md` carregado isoladamente dá contexto mínimo para um agente começar
4. Verificar que `STATUS.md` + `AGENTS.md` contêm tudo que um agente precisa saber na primeira sessão
5. Confirmar que nenhum link está quebrado e nenhuma referência aponta para arquivo inexistente

---

> Sprint executada em sessão OpenCode autônoma. Artefatos: AGENT-PLAYBOOK.md (auditado),
> AGENTS.md (reescrito), STATUS.md, docs/INDEX.md, docs/ARCHITECTURE.md, README.md (atualizado),
> opencode.json (configurado), sprints/ (TEMPLATE.md + SPRINT-INDEX.md + DOC-SPRINT-0.md).
