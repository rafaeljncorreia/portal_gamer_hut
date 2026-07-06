# Fase 0 — Snapshot pré-refatoração: Materiais Unificado

> Documento de referência para agentes executarem as fases seguintes.
> Estado atual do código **antes** das mudanças. Tire dúvidas de contrato aqui.

---

## Sumário do que muda

| Fase | Arquivos | O que fazer |
|------|----------|-------------|
| **1** | `prompts.js` | Renomear `promptCopy` → `promptArte` (saída universal), criar `promptRoteiro()`, `promptDescricao` ganha contexto de campos |
| **2** | `Materiais.jsx` | Template picker + campos dinâmicos + IA gera e preenche |
| **3** | `Materiais.jsx` | Botão "Montar arte" → `localStorage('gh-studio')` → `studio.html` |
| **4** | `Materiais.jsx` | Seções Descrição + Roteiro + Save + Peças |
| **5** | `docs/*`, `DIRETRIZ-PLATAFORMA.md` | Atualizar documentação |
| **6** | — | QA final + playbook + scripts |

---

## A. Contratos de Interface (NÃO MUDAR sem aviso)

### `Materiais.jsx` — Props recebidas de `Campanha.jsx` (linha 111)

```jsx
<Materiais camp={camp} produto={produto} onUpdate={onUpdate} />
```

| Prop | Tipo | Origem |
|------|------|--------|
| `camp` | objeto campanha (store schema) | `store.get(id)` |
| `produto` | objeto catálogo \| null | `catalogo.find(j => j.id === camp.produto_id)` |
| `onUpdate(patch, opts?)` | função | `store.update(id, patch)` + opcional `marcarEstagio` |

`onUpdate` recebe `patch` (merge parcial) e `opts = { done: boolean }`. Se `done: true`, avança para o próximo estágio. **Não mudar assinatura.**

### `prompts.js` — Exports atuais

| Export | Assinatura | Usado por |
|--------|-----------|-----------|
| `extractJSON(text)` | `string → object\|null` | Materiais, Estrategia (genérico) |
| `produtoContexto(p)` | `object → string` | prompts internos |
| `promptCopy({gen,plataforma,tom,produto,tema,angulo,extra})` | `→ string` | Materiais (CopyGen) |
| `promptDescricao({gen,plataforma,tom,titulo,produto,tema,angulo,extra})` | `→ string` | Materiais (DescricaoGen) |
| `promptEstrategia({gen,produto,tema,angulo,pilar,canais})` | `→ string` | Estrategia (NÃO MEXER) |

> ⚠️ `promptEstrategia` **não muda** — não é importada por Materiais.

### Dados de campanha — `camp.materiais`

Atual:
```js
materiais: {
  itens: [
    { tipo: 'copy' | 'descricao', plataforma, tom, titulo, ... }
  ]
}
```

Futuro:
```js
materiais: {
  itens: [
    {
      tipo: 'post' | 'roteiro',
      plataforma, template, tom, tagId,
      campos: { eyebrow, title, subtitle, badge, cta, footer, priceLabel, ... },
      descricao: '...',
      // só se tipo === 'roteiro':
      roteiro: { gancho, cenas[], cta_final, duracao },
      descricao_video: '...',
      criado_em: 'ISO'
    }
  ]
}
```

---

## B. Snapshots dos documentos (antes das mudanças)

### B1. `docs/ARCHITECTURE.md` — seções a mexer

| Linha | Conteúdo atual | O que precisa |
|-------|----------------|---------------|
| 97-103 | Pipeline: "Materiais → Conteúdo por canal (Copys, Descrições)" | Atualizar descrição: adicionar "Roteiros", "Conteúdo para arte de template" |
| 123 | `materiais: {}` no schema | Schema antigo; atualizar para nova estrutura de `itens[]` |
| 134 | Ref a `prompts.js` | Se `promptCopy` for renomeada, ajustar referência |

**Snapshot completo salvo em:** o arquivo foi lido na íntegra na Fase 0 (estado inalterado). Confiar no repositório atual.

### B2. `docs/INDEX.md` — seções a mexer

| Linha | Conteúdo atual | O que precisa |
|-------|----------------|---------------|
| 62 | `prompts.js` — "Construtores de prompt para IA (copy, descrição, estratégia)" | Adicionar `promptArte`, `promptRoteiro` |
| 67 | `stages/*.jsx` — "Estágios da pipeline" | Se Materiais mudar de nome ou escopo, ajustar |

### B3. `DIRETRIZ-PLATAFORMA.md` — seções a mexer

| Linha | Conteúdo atual | O que precisa |
|-------|----------------|---------------|
| 39 | "Materiais: Copys + Descrições" | Adicionar "roteiros de vídeo", "conteúdo para template de arte" |
| 60-64 | Schema `materiais{}` | Atualizar se estrutura de `itens[]` mudar |
| 84 | "copys.html / descricoes.html (lógica de prompt) → portadas para Materiais" | Agora `promptArte` + `promptRoteiro` |
| 106 | Roadmap C: "Copys + Descrições dentro do M3" | Atualizar escopo: "Conteúdo para arte + Descrições + Roteiros" |

### B4. `Campanha.jsx` — sem mudanças previstas

Linha 111: `<Materiais camp={camp} produto={produto} onUpdate={onUpdate} />` — **contrato mantido**.

---

## C. Referência: campos por template (Creative Studio)

Fonte: `app/data.jsx` (9 templates) + `app/panel.jsx` (inputs por template).

| Template | Campos de texto (relevantes para IA) |
|----------|--------------------------------------|
| **block** | `eyebrow`, `title`, `subtitle`, `badge`, `cta`, `footer`, `priceLabel` |
| **image** | `eyebrow`, `title`, `subtitle`, `priceLabel` |
| **reels** | `eyebrow`, `title`, `subtitle`, `badge`, `footer` |
| **thumb** | `badge`, `eyebrow`, `title`, `accentWord`, `priceLabel` |
| **meme** (clássico) | `memeTop`, `memeBot` |
| **meme** (reaction) | `memeCaption`, `memeBot` |
| **meme** (dual) | `memeTop`, `aLabel`, `bLabel`, `vsWord` |
| **quiz** (pergunta) | `eyebrow`, `question`, `quizOptions[]` |
| **quiz** (esseou) | `eyebrow`, `question`, `aLabel`, `bLabel`, `vsWord` |
| **ranking** | `eyebrow`, `title`, `rankItems[{name,note}]` |
| **arrivals** | `eyebrow`, `title`, `arrivals[{name,console}]` |
| **carrossel** | `badge`, `eyebrow`, `title`, `subtitle`, `footer`, `cta`, `pages[{title,body}]` |

**Tag de categoria** (`tagId`) é comum a todos os templates. Valores: `noticias`, `pre-venda`, `restoque`, `lancamento`, `preview`, `trailer`, `review`, `quiz`.

**Padrão de fundo** (`pattern`) é comum: `solid`, `signature`, `controle`, `crt`, `8bit`, `hud`, `caution`, `retro`, `grid`, `dpad`, `checker`, `chevron`, `circuit`, `stars`, `triangles`, `vbars`.

---

## D. Plataformas com granularidade de formato (alvo da refatoração)

> ⚠️ Atualmente o código usa `{ key: 'instagram', label: 'Instagram' }` sem granularidade. Abaixo o alvo.

```js
const PLATS = [
  { key: 'instagram_feed',  label: 'Instagram Feed',  video: false },
  { key: 'instagram_reels', label: 'Instagram Reels', video: true  },
  { key: 'tiktok',          label: 'TikTok',          video: true  },
  { key: 'youtube',         label: 'YouTube',         video: true  },
]
```

- `promptDescricao` normaliza: se `key` é `instagram_feed` ou `instagram_reels`, passar `plataforma = 'instagram'` para as regras de plataforma existentes.
- Seção de Roteiro só aparece se `video: true`.

---

## E. Prompt `promptArte()` — especificação (Fase 1)

```js
export function promptArte({ gen, plataforma, tom, template, produto, tema, angulo, extra })
```

Saída universal (sempre o mesmo JSON, independente do template — a UI filtra):

```json
{
  "variacoes": [
    {
      "eyebrow": "sobre-título curto",
      "title": "título principal (máx ~6 palavras)",
      "subtitle": "subtítulo ou texto de apoio",
      "badge": "selo (1-2 palavras)",
      "cta": "chamada para ação curta",
      "footer": "rodapé (1-2 linhas)",
      "priceLabel": "etiqueta de preço/status",
      "accentWord": "palavra em destaque (thumb)",
      "memeTop": "texto superior do meme",
      "memeBot": "texto inferior do meme",
      "memeCaption": "legenda do meme (reaction)",
      "question": "pergunta (quiz)",
      "quizOptions": ["Opção A", "Opção B"],
      "hashtags": ["tag1", "tag2"]
    }
  ]
}
```

Mantém 3 variações. Template informado no prompt para contexto (ex: "template: Post Blocado — campos: eyebrow, title, subtitle, badge, cta, footer, priceLabel").

## F. Prompt `promptRoteiro()` — especificação (Fase 1)

```js
export function promptRoteiro({ gen, plataforma, tom, produto, tema, angulo, campos, extra })
```

Saída:

```json
{
  "gancho": "chamada inicial (0-3s)",
  "cenas": [
    { "cena": 1, "descricao": "o que aparece na tela", "fala": "texto narrado ou over", "tempo": "5s" }
  ],
  "cta_final": "última fala/chamada",
  "duracao": "30s",
  "descricao_video": "descrição otimizada para a plataforma"
}
```

`campos` = objeto com os campos preenchidos do template (a âncora de coerência).

## G. Prompt `promptDescricao()` — ajuste (Fase 1)

Assinatura **inalterada**. `extra` recebe string montada automaticamente com os campos:

```
"Contexto da arte:\nTítulo: ...\nSubtítulo: ...\nCTA: ...\n..."
```

---

## H. Dependências entre fases

```
Fase 1 (prompts.js) ──► Fase 2 (template picker + campos)
                              │
                              ▼
                         Fase 3 (Montar arte)
                              │
                              ▼
                         Fase 4 (Descrição + Roteiro + Save)
                              │
                              ▼
                    ┌─────────┴──────────┐
                    ▼                    ▼
              Fase 5 (docs)       Fase 6 (QA)
```

Nada em Fase 2 precisa de Fase 3/4 para funcionar (pode testar template picker isoladamente).
Fase 3 depende de Fase 2 (precisa dos campos preenchidos).
Fase 4 depende de Fase 2 (precisa da plataforma + template escolhidos).

---

## I. Scripts de consistência

| Script | Escopo | Roda na Fase 6 |
|--------|--------|-----------------|
| `scripts/check-doc-consistency.ps1` | Cérebro de marca duplicado + playbook seções | ✅ |
| `scripts/sync-brand-brain.ps1` | Raiz → `app-web/public/` | ✅ (se tocar nos arquivos) |

`prompts.js` e `Materiais.jsx` **não são cobertos** por scripts automáticos. Verificação manual via checklist no playbook §9.

---

_Referência criada na Fase 0. Snapshots confiáveis = estado atual do repositório._
