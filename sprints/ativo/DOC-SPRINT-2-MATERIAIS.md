# Sprint 2 — Unificar Copy+Descrição+Roteiro em Materiais

> **Contexto:** Atualmente o estágio Materiais (`app-web/src/pages/stages/Materiais.jsx`) tem abas independentes (Copy / Descrição) com schema plano. O plano de refatoração (especificado em `sprints/specs/FASE-0-snapshot-materiais.md`) transforma em painel único que entrega conteúdo para template de arte, descrição do post e roteiro de vídeo — com botão "Montar arte" que envia dados ao Creative Studio via `localStorage`.

## Objetivo

Transformar o estágio Materiais de abas independentes em um painel único que entrega: conteúdo para template de arte (antigo "Copy"), descrição do post, roteiro de vídeo + descrição do vídeo, e botão "Montar arte" → Creative Studio.

## Arquivos Afetados

| Arquivo | Tipo | O que muda |
|---------|------|------------|
| `app-web/src/lib/prompts.js` | modificado | Renomear `promptCopy` → `promptArte`, criar `promptRoteiro`, `promptDescricao` ganha contexto de campos (Fase 1) |
| `app-web/src/pages/stages/Materiais.jsx` | modificado | Reescrita completa: template picker, campos dinâmicos, IA gera, Montar arte, Descrição, Roteiro, Save (Fases 2-4) |
| `docs/ARCHITECTURE.md` | modificado | Pipeline diagrama + schema + ref a prompts (Fase 5) |
| `docs/INDEX.md` | modificado | Descrição de prompts.js e stages/*.jsx (Fase 5) |
| `DIRETRIZ-PLATAFORMA.md` | modificado | §3 tabela, §5 schema, §6 linha 84, §8 Roadmap C (Fase 5) |

**Não mexer:** `Campanha.jsx` (props do `<Materiais>` continuam iguais), `Estrategia.jsx`, `campaigns.js`, `gh.js`, `app/*.jsx` (Creative Studio legado).

## Passo a Passo

### Fase 1 — `prompts.js`

**1a. Renomear `promptCopy` → `promptArte`**
- Nova assinatura: `promptArte({ gen, plataforma, tom, template, produto, tema, angulo, extra })`
- Saída universal: `{ variacoes: [{ eyebrow, title, subtitle, badge, cta, footer, priceLabel, accentWord, memeTop, memeBot, memeCaption, question, quizOptions, hashtags }] }`
- 3 variações. Template informado no corpo do prompt.

**1b. Criar `promptRoteiro`**
- Assinatura: `promptRoteiro({ gen, plataforma, tom, produto, tema, angulo, campos, extra })`
- Saída: `{ gancho, cenas: [{ cena, descricao, fala, tempo }], cta_final, duracao, descricao_video }`

**1c. Ajustar `promptDescricao`**
- Assinatura inalterada. `extra` recebe contexto dos campos preenchidos automaticamente.

**1d. Atualizar import em Materiais.jsx**
- `import { promptArte, promptDescricao, promptRoteiro, extractJSON }`

### Fase 2 — Template picker + campos dinâmicos + IA de template

Reescrever `Materiais.jsx` substituindo abas "Copy"/"Descrição" por painel único:

- Seção 1: Formato (Plataforma com granularidade `instagram_feed`, `instagram_reels`, `tiktok`, `youtube` + Tom + Briefing extra)
- Seção 2: Conteúdo da Arte (grid de 9 templates + campos dinâmicos + "Gerar 3 variações" + "Montar arte")
- Seção 3: Descrição do Post (sempre visível)
- Seção 4: Roteiro (só se plataforma for vídeo: `instagram_reels`, `tiktok`, `youtube`)
- Peças salvas com tags `post` (laranja) ou `roteiro` (roxo)

Campos dinâmicos por template (função `camposDoTemplate`): carrossel, block, image, quiz, ranking, arrivals, thumb, reels, meme.

### Fase 3 — Botão "Montar arte" → Creative Studio

- Monta objeto `studioState` no formato do `DEFAULT_STATE` do Creative Studio
- Salva em `localStorage('gh-studio')` com confirmação se já existir rascunho
- Abre `studio.html` em nova aba

### Fase 4 — Descrição + Roteiro + Salvar

- Seção 3: Descrição usa `promptDescricao()` com `extra` enriquecido pelos campos
- Seção 4: Roteiro usa `promptRoteiro()` com `campos` do template
- Estrutura do item salvo: `{ tipo: 'post' | 'roteiro', plataforma, template, tom, tagId, campos, descricao, roteiro?, descricao_video?, criado_em }`

### Fase 5 — Atualizar documentação

- `docs/ARCHITECTURE.md` linhas 97-103, 123, 134
- `docs/INDEX.md` linha 62
- `DIRETRIZ-PLATAFORMA.md` §3 tabela linha 39, §5 schema linhas 60-64, §6 linha 84, §8 Roadmap C linha 106

### Fase 6 — QA final

- Checklist de código (playbook §9)
- Verificação de comportamento: `npm run dev`, criar campanha, testar template picker, IA, Montar arte, salvar/remover
- Rodar `scripts/check-doc-consistency.ps1` (se tocar cérebro de marca)
- Rodar `scripts/sync-brand-brain.ps1` (se tocar arquivos públicos)

## Critérios de Aceite (DoD)

- [ ] `promptArte` exportado e funcional com saída universal de campos de template
- [ ] `promptRoteiro` exportado e funcional com saída de gancho + cenas + CTA final
- [ ] Materiais exibe grid de 9 templates; selecionar adapta campos
- [ ] "Gerar 3 variações" → 3 cards com preview dos campos relevantes
- [ ] Clicar em variação → preenche inputs
- [ ] "Montar arte" → confirm → `localStorage` → abre `studio.html` com dados
- [ ] Instagram Feed → Roteiro não aparece; Reels/TikTok/YT → Roteiro aparece
- [ ] Gerar descrição e roteiro → textos aparecem; salvar → peça salva com tag correta
- [ ] Trocar template mantém campos compatíveis, reseta os que não existem
- [ ] "Concluir Materiais" → avança para Visual
- [ ] Documentação atualizada (Fase 5)
- [ ] Regressão: portal estático legado intacto, `Campanha.jsx` inalterado

## Não Fazer Neste Sprint

- Não mexer em `Campanha.jsx`, `Estrategia.jsx`, `campaigns.js`, `gh.js`
- Não mexer em `app/*.jsx` (Creative Studio legado)
- Não portar o portal estático (copys.html, descricoes.html permanecem como estão)
- Não fazer deploy do app-web
- Não mexer em backend/D1/Supabase/Monday

## Dependências

- `catalog.json` precisa estar atualizado (22 jogos do board Monday)
- `app-web` precisa rodar (`npm run dev`) para testes

## Como Testar

1. `npm run dev` no `app-web/`
2. Criar campanha → Brief → avançar até Materiais
3. Selecionar template → campos adaptarem
4. Clicar "Gerar 3 variações" → 3 cards com campos do template
5. Clicar em variação → campos preencherem
6. Clicar "Montar arte" → confirm → abrir `studio.html` com dados
7. Instagram Feed → Roteiro não aparece
8. Instagram Reels → Roteiro aparece
9. Gerar descrição → texto aparece
10. Gerar roteiro → gancho + cenas + descrição aparecem
11. Salvar → item aparece em "Peças salvas"
12. Remover item → some da lista
13. "Concluir Materiais" → avança para Visual
