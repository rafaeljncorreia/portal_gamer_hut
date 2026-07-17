# Integração CRIAR → Creative Studio

> Mapeamento entre o wizard de conteúdo (criar.html) e o editor de arte (studio.html)
> Versão: 1.1 — 2026-07-17 (adicionado template/formato MEME)

---

## Sumário

1. [Arquitetura](#1-arquitetura)
2. [Mapping Formato → Template](#2-mapping-formato--template)
3. [Campos do Studio por Template](#3-campos-do-studio-por-template)
4. [Mapeamento CRIAR → STUDIO](#4-mapeamento-criar--studio)
5. [Prompt Template-Aware](#5-prompt-template-aware)
6. [Fluxo de Dados](#6-fluxo-de-dados)
7. [Implementação em Fases](#7-implementação-em-fases)

---

## 1. Arquitetura

```
┌──────────────────────────────────────────────────┐
│                  CRIAR (criar.html)               │
│  ┌────────────────────────────────────────────┐  │
│  │  Wizard → Seleção (plataforma/formato/ger) │  │
│  └────────────────┬───────────────────────────┘  │
│                   │                              │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐  │
│  │  buildFullPrompt() → prompt template-aware  │  │
│  │  + FORMAT_TO_TEMPLATE                      │  │
│  └────────────────┬───────────────────────────┘  │
│                   │                              │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐  │
│  │  aiComplete() → IA gera JSON com campos    │  │
│  │  específicos do template Studio            │  │
│  └────────────────┬───────────────────────────┘  │
│                   │                              │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐  │
│  │  renderCopy() → card com CRIAR ARTE btn    │  │
│  └────────────────┬───────────────────────────┘  │
│                   │ clique                       │
│                   ▼                              │
│  ┌────────────────────────────────────────────┐  │
│  │  sendToStudio(v) → mapeia campos           │  │
│  │  → localStorage('gh-studio')               │  │
│  │  → redirect para studio.html               │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
└──────────────────────┬────────────────────────────┘
                       │ localStorage
                       ▼
┌──────────────────────────────────────────────────┐
│              STUDIO (studio.html)                 │
│  ┌────────────────────────────────────────────┐  │
│  │  loadState() ← localStorage('gh-studio')   │  │
│  │  template, tag, title, pages, etc.         │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Painel → usuário ajusta arte, imagem      │  │
│  │  Preview → PostStage renderiza             │  │
│  │  Export → PNG / Vídeo                      │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Canais de comunicação

| Canal | Origem | Destino | Formato |
|---|---|---|---|
| `localStorage('gh-studio')` | `criar.js` | `app/app.jsx` | JSON serializado do estado do Studio |
| `window.location.href` | `criar.js` | `studio.html` | Redirect puro |

### Pontos de acoplamento

O estado salvo em `gh-studio` DEVE seguir o formato que o `DEFAULT_STATE` em `app/app.jsx` espera, pois `loadState()` faz merge com `{ ...DEFAULT_STATE, ...JSON.parse(saved) }`. Campos ausentes são preenchidos com defaults do Studio.

---

## 2. Mapping Formato → Template

### Dicionário base

```js
// Formato (dados/formatos/*.json) → Studio template (app/data.jsx)
var FORMAT_TO_TEMPLATE = {
  'carrossel': 'carousel',
  'post':      'image',
  'quiz':      'quiz',
  'ranking':   'ranking',
  'meme':      'meme'
};
```

> **STUDIO_FIELDS (fonte única):** o mapa de campos por template vive **só** em `lib/utils.js`
> (`window.STUDIO_FIELDS`), usado por `buildStudioPatch()`/`mergeStudioState()`. A cópia que existia
> em `criar.js` era código morto e foi removida — não reintroduzir para evitar divergência.

### Formatos que NÃO têm template no Studio

| Formato | tipoSaida | Motivo |
|---|---|---|
| review | roteiro | Vídeo, sem template visual |
| gameplay | roteiro | Vídeo, sem template visual |
| unboxing | roteiro | Vídeo, sem template visual |
| youtube-repost | copy | YouTube Shorts, sem template no Studio |
| video-curto | roteiro | TikTok, sem template visual |

### Templates do Studio SEM formato correspondente ainda

Quando novos `formato.json` forem criados, Basta adicionar ao `FORMAT_TO_TEMPLATE`:

| Template | Sugestão de formato | tipoSaida |
|---|---|---|
| block | post-blocado | copy |
| reels | capa-reels | copy |
| arrivals | novidades | copy |
| thumb | thumbnail | copy |

### Função de resolução

```js
function getStudioTemplate() {
  var fmt = DADOS.formatos[fmtSelect.value];
  if (!fmt) return null;
  return FORMAT_TO_TEMPLATE[fmt.id] || null;
}
```

Retorna `null` quando o formato NÃO deve exibir o botão "CRIAR ARTE →".

---

## 3. Campos do Studio por Template

Cada template no Studio tem um conjunto específico de campos. Abaixo a referência completa extraída de `app/app.jsx` (DEFAULT_STATE) e `app/panel.jsx` (painel de controle).

### 3.1 CAROUSEL (carrossel)

| Campo Studio | Tipo | Painel | Obrigatório |
|---|---|---|---|
| `tagId` | string | TAG DE CATEGORIA | Sim |
| `eyebrow` | string | CONTEÚDO · CAPA → Sobre-título | Não |
| `title` | string | CONTEÚDO · CAPA → Título principal | Sim |
| `subtitle` | string | CONTEÚDO · CAPA → Destaque (chip) | Não |
| `badge` | string | Badge (canto superior) | Não |
| `cta` | string | Botão (CTA) | Sim |
| `footer` | string | Rodapé (canto inferior) | Não |
| `image` | string (data-uri) | Imagem de fundo da capa | — |
| `titleSize` | number | TIPOGRAFIA (slider) | Default 104 |
| `fill` | boolean | Preencher com cor da tag | Default true |
| `pattern` | string | ESTILO DE FUNDO | Default '8bit' |
| `pageCount` | number | PÁGINAS → stepper | Default 4 |
| `current` | number | Página atual | Default 0 |
| `pages[]` | array | — | — |
| `pages[].title` | string | CONTEÚDO · PÁGINA N → Título | Não |
| `pages[].body` | string | CONTEÚDO · PÁGINA N → Texto | Não |
| `pages[].image` | string | Imagem do jogo (fundo) | — |

Pages também pode ter type:'video' com `eyebrow`, `accent`, `footer`, `video`.

### 3.2 IMAGE (post c/ imagem)

| Campo Studio | Tipo | Painel | Obrigatório |
|---|---|---|---|
| `tagId` | string | TAG DE CATEGORIA | Sim |
| `eyebrow` | string | Sobre-título (eyebrow) | Não |
| `title` | string | Título principal | Sim |
| `subtitle` | string | Texto de apoio | Não |
| `priceLabel` | string | Etiqueta de preço / status | Não |
| `image` | string (data-uri) | Imagem do jogo | — |
| `ink` | string | COR DO TEXTO/LOGO | Default 'auto' |

### 3.3 QUIZ (quiz)

| Campo Studio | Tipo | Painel | Obrigatório |
|---|---|---|---|
| `tagId` | string | TAG DE CATEGORIA | Sim |
| `eyebrow` | string | Sobre-título | Não |
| `question` | string | Pergunta | Sim |
| `quizOptions[]` | string[] | Opções (A-D, até 4) | Não |
| `answer` | number | Resposta certa (índice 0-3) | Não |
| `quizMode` | string | 'pergunta' ou 'esseou' | Default 'pergunta' |
| `hideOptions` | boolean | Esconder opções | Default false |

### 3.4 RANKING (ranking)

| Campo Studio | Tipo | Painel | Obrigatório |
|---|---|---|---|
| `tagId` | string | TAG DE CATEGORIA | Sim |
| `eyebrow` | string | Sobre-título | Não |
| `title` | string | Título | Sim |
| `rankCount` | number | Quantidade de itens | Default 5 |
| `rankItems[].name` | string | Nome do jogo | Sim |
| `rankItems[].note` | string | Tag curta | Não |

### 3.6 MEME (meme)

| Campo Studio | Tipo | Painel | Obrigatório |
|---|---|---|---|
| `memeLayout` | string | Seletor `caption` / `impact` | Default `'caption'` |
| `memeCaption` | string | Legenda do meme (modo caption) | Sim (modo caption) |
| `memeBarPos` | string | Posição da barra `top`/`bottom` | Default `'top'` |
| `memeBarColor` | string\|null | Cor da barra | Default `'#F4F1EC'` |
| `memeTop` | string | Texto de cima (modo impact) | — |
| `memeBottom` | string | Texto de baixo (modo impact) | — |
| `memeCredit` | string | Assinatura no canto | Default `'@gamerhut'` |
| `image` | string (data-uri) | Imagem do meme | — |
| `titleSize` | number | TIPOGRAFIA (slider) | Default 64 |

> Sem selo de categoria e sem logo central (branding leve, meme-native). Reutiliza os controles de
> imagem (zoom/blur/posição) e o drag-to-pan padrão via `s.image`.

### 3.5 BLOCK, REELS, ARRIVALS, THUMB

> Sem formato JSON no wizard ainda. Mapeamento documentado para referência futura.

| Template | Campos principais |
|---|---|
| block | `eyebrow`, `title`, `subtitle`, `badge`, `blockBg`, `blockInk` |
| reels | `eyebrow`, `title`, `subtitle`, `badge`, `footer`, `image` |
| arrivals | `eyebrow`, `title`, `arrivals[].name`, `arrivals[].console` |
| thumb | `eyebrow`, `title`, `accentWord`, `badge`, `priceLabel`, `image` |

---

## 4. Mapeamento CRIAR → STUDIO

### 4.1 Carrossel

```
JSON da IA (variacao)              Studio State (patch)
─────────────────────────────      ─────────────────────
v.titulo       → uppercase   →    patch.title
v.sobre_titulo → uppercase   →    patch.eyebrow
v.legenda                    →    patch.subtitle
v.cta                        →    patch.cta
v.badge        → uppercase   →    patch.badge
v.rodape       → uppercase   →    patch.footer
v.paginas[].titulo → uppercase →  pages[].title
v.paginas[].texto              →   pages[].body
activeCat.id                  →    patch.tagId
─                             →    patch.template = 'carousel'
─                             →    patch.fill = true
─                             →    patch.pattern = '8bit'
─                             →    patch.titleSize = 104
─                             →    patch.pageCount = pages.length + 1
─                             →    patch.current = 0
─                             →    patch.image = null
```

**Fallback de páginas:** se `v.paginas` não existir ou for vazio, criar 3 páginas internas a partir dos campos disponíveis:

```js
[
  { title: v.titulo,  body: v.legenda, image: null },
  { title: '',        body: v.cta,     image: null },
  { title: '',        body: '',        image: null }
]
```

### 4.2 Post c/ imagem

```
v.titulo        → uppercase   →   patch.title
v.sobre_titulo  → uppercase   →   patch.eyebrow
v.legenda                     →   patch.subtitle
v.preco                       →   patch.priceLabel (fallback: campo Preço do wizard)
activeCat.id                  →   patch.tagId
─                             →   patch.template = 'image'
─                             →   patch.fill = false
─                             →   patch.pattern = 'solid'
─                             →   patch.titleSize = 80
─                             →   patch.image = null
```

### 4.3 Quiz

```
v.titulo        →   patch.question
v.sobre_titulo  → uppercase   →   patch.eyebrow
v.opcoes[]      →   patch.quizOptions[] (máx 4)
v.resposta      → number      →   patch.answer
activeCat.id                  →   patch.tagId
─                             →   patch.template = 'quiz'
─                             →   patch.fill = false
─                             →   patch.ink = 'auto'
─                             →   patch.pattern = '8bit'
─                             →   patch.titleSize = 80
─                             →   patch.quizMode = 'pergunta'
─                             →   patch.hideOptions = false
```

### 4.4 Ranking

```
v.titulo        → uppercase   →   patch.title
v.sobre_titulo  → uppercase   →   patch.eyebrow
v.itens[].nome  → uppercase   →   rankItems[].name
v.itens[].tag   → uppercase   →   rankItems[].note
activeCat.id                  →   patch.tagId
─                             →   patch.template = 'ranking'
─                             →   patch.fill = false
─                             →   patch.ink = 'auto'
─                             →   patch.pattern = 'grid'
─                             →   patch.titleSize = 96
─                             →   patch.rankCount = itens.length
```

### 4.5 Meme

A IA gera um objeto `studio` completo (caminho preferido de `buildStudioPatch`, que usa `v.studio`
diretamente). Fallback quando vier em campos soltos (ex.: vindo do `copys.html`):

```
v.memeCaption | v.legenda | v.titulo  →   patch.memeCaption
v.memeTop     | v.topo     → uppercase →   patch.memeTop
v.memeBottom  | v.base     → uppercase →   patch.memeBottom
v.memeLayout                          →   patch.memeLayout (default 'caption')
─                                     →   patch.template = 'meme'
─                                     →   patch.memeBarPos = 'top'
─                                     →   patch.memeBarColor = '#F4F1EC'
─                                     →   patch.memeCredit = '@gamerhut'
─                                     →   patch.titleSize = 64
─                                     →   patch.image = null
```

`memeBarPos` / `memeBarColor` / `memeCredit` ausentes no patch são preenchidos pelo `DEFAULT_STATE` do Studio.

---

## 5. Prompt Template-Aware

### 5.1 Schema por template

A função `buildFullPrompt()` em `criar.js` modifica o JSON schema no prompt
conforme o formato selecionado:

#### carrossel (2 variações, 3 páginas internas)

```
Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{
  "titulo":"título da CAPA, curto e forte",
  "sobre_titulo":"eyebrow label",
  "legenda":"legenda do feed 2-4 frases",
  "cta":"chamada para ação curta",
  "badge":"texto do badge (opcional)",
  "rodape":"rodapé (opcional)",
  "hashtags":["5 a 7 hashtags sem #, sem espaços"],
  "paginas":[
    {"titulo":"título da página 2","texto":"texto da página 2"},
    {"titulo":"título da página 3","texto":"texto da página 3"},
    {"titulo":"título da página 4","texto":"texto da página 4"}
  ]
}]}
IMPORTANTE: o array "paginas" deve ter EXATAMENTE 3 itens (as páginas internas).
```

#### imagem (3 variações)

```
Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{
  "titulo":"título principal",
  "sobre_titulo":"eyebrow label",
  "legenda":"texto de apoio 2-4 frases",
  "preco":"etiqueta de preço (opcional)",
  "cta":"chamada para ação curta",
  "hashtags":["5 a 7 hashtags sem #, sem espaços"]
}]}
```

#### quiz (3 variações)

```
Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{
  "titulo":"pergunta do quiz",
  "sobre_titulo":"eyebrow label",
  "opcoes":["Opção A","Opção B","Opção C","Opção D"],
  "resposta":0,
  "cta":"chamada para ação",
  "hashtags":["5 a 7 hashtags sem #, sem espaços"]
}]}
IMPORTANTE: "opcoes" deve ter 4 itens. "resposta" é o índice (0-3) da opção correta.
```

#### ranking (3 variações, mínimo 5 itens)

```
Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{
  "titulo":"título do ranking",
  "sobre_titulo":"eyebrow label",
  "itens":[
    {"nome":"Nome do jogo","tag":"tag curta"},
    {"nome":"Nome do jogo","tag":"tag curta"}
  ],
  "cta":"chamada para ação",
  "hashtags":["5 a 7 hashtags sem #, sem espaços"]
}]}
IMPORTANTE: "itens" deve ter no mínimo 5 itens.
```

#### meme (3 variações, objeto studio + descrição)

```
Responda SOMENTE com JSON válido, neste formato exato:
{"variacoes":[{
  "studio":{
    "memeLayout":"caption",
    "memeCaption":"setup/punchline do meme (minúsculas ok)",
    "memeTop":"TEXTO DE CIMA (CAIXA ALTA, curto)",
    "memeBottom":"TEXTO DE BAIXO (CAIXA ALTA, curto)",
    "titleSize":64
  },
  "descricao":{
    "titulo":"título curto pro post",
    "legenda":"legenda do feed no clima do meme",
    "cta":"CTA de engajamento (marca o amigo)",
    "hashtags":["5 a 7 hashtags sem #, sem espaços"]
  }
}]}
IMPORTANTE: a imagem é do usuário — a IA só escreve o texto (os dois modos, pra alternar no editor).
```

### 5.2 Implementação

Em `criar.js`, função `buildFullPrompt()`:

1. Chama `DADOS.montarPrompt(getOpts())` para obter o prompt base
2. Verifica se `getStudioTemplate()` retorna algo
3. Se sim, localiza a string `"Responda SOMENTE com JSON válido"` no prompt base
4. Remove tudo a partir dali (substitui pelo schema específico)
5. Concatena as REGRAS no final

```js
function buildFullPrompt() {
  var base = DADOS.montarPrompt(getOpts());
  var fmt = DADOS.formatos[fmtSelect.value];
  var tipoSaida = (fmt && fmt.tipoSaida) || 'copy';
  var template = getStudioTemplate();

  if (tipoSaida === 'roteiro') {
    // Comportamento original para roteiros
    return base + '\n\n---\nREGRAS:\n- ...';
  }

  if (template) {
    // Remove schema genérico, substitui pelo template-aware
    var idx = base.indexOf('Responda SOMENTE com JSON válido');
    if (idx > -1) base = base.substring(0, idx);
    base += getSchemaForTemplate(template);
    base += '\n\n---\nREGRAS:\n- Título curto e forte (máx ~6 palavras).\n- ...';
    return base;
  }

  // Comportamento original para copy sem template
  return base + '\n\n---\nREGRAS:\n- ...';
}
```

---

## 6. Fluxo de Dados

### Sequência completa

```
Usuário:
  1. Seleciona Instagram → Carrossel → Millennial
  2. Preenche briefing: "Pré-venda do MGS Delta..."
  3. Clica GERAR CONTEÚDO

criar.js:
  4. getOpts() → coleta wizard
  5. buildFullPrompt() → monta prompt com schema carrossel
  6. aiComplete(prompt) → chama proxy Cloudflare
  7. extractJSON(text) → parseia { variacoes: [...] }
  8. render(data.variacoes) → renderiza cards

Na tela:
  9. Card mostra:
     - título, bloco de páginas, legenda, CTA, hashtags
     - botões: COPIAR | CRIAR ARTE → | APROVAR | REPROVAR

Usuário:
  10. Clica CRIAR ARTE →

criar.js:
  11. sendToStudio(variacao) → mapeia campos:
      v.titulo → patch.title, v.paginas → patch.pages, etc.
  12. localStorage.setItem('gh-studio', JSON.stringify(patch))
  13. window.location.href = 'studio.html'

Studio (studio.html):
  14. React inicializa
  15. loadState() → localStorage.getItem('gh-studio')
  16. useState = { ...DEFAULT_STATE, ...patch }
  17. Controles e preview renderizam com dados preenchidos

Usuário:
  18. Ajusta arte (imagem, padrão, cor)
  19. Clica EXPORTAR PNG ou EXPORTAR VÍDEO
```

### Estado no localStorage

```js
// Chave: 'gh-studio'
// Lido por: app/app.jsx → loadState()
// Escrito por: criar.js → sendToStudio()

{
  "template": "carousel",
  "tagId": "pre-venda",
  "pattern": "8bit",
  "fill": true,
  "ink": "auto",
  "eyebrow": "PRÉ-VENDA",
  "title": "MGS DELTA: SNAKE EATER",
  "subtitle": "Pré-venda liberada com brinde de pôster.",
  "badge": "EXCLUSIVO",
  "cta": "ARRASTA PRO LADO",
  "footer": "MÍDIA FÍSICA NEVER DIES",
  "titleSize": 104,
  "image": null,
  "pageCount": 4,
  "current": 0,
  "pages": [
    { "title": "MGS DELTA: SNAKE EATER", "body": "Descrição...", "image": null },
    { "title": "PRÉ-VENDA", "body": "Garanta...", "image": null },
    { "title": "", "body": "", "image": null }
  ]
  // ... outros campos preservados do DEFAULT_STATE
}
```

---

## 7. Implementação em Fases

### Fase 1 — Base de Dados: Mapping Formato → Template

**Arquivo:** `criar.js`
**O quê:** Adicionar `FORMAT_TO_TEMPLATE`, `STUDIO_FIELDS`, `getStudioTemplate()`
**Teste:** `getStudioTemplate()` retorna template correto para cada formato

### Fase 2 — Prompt Template-Aware

**Arquivo:** `criar.js`
**O quê:** Modificar `buildFullPrompt()` para usar schema específico do template
**Depende:** Fase 1
**Teste:** Prompt gerado contém campos corretos (`paginas`, `sobre_titulo`, etc.)

### Fase 3 — Função sendToStudio()

**Arquivo:** `criar.js`
**O quê:** Implementar `sendToStudio(variacao)` com mapeamento campo-a-campo
**Depende:** Fase 1
**Teste:** localStorage('gh-studio') contém estado no formato do Studio

### Fase 4 — UI: Botão + Bloco de Páginas

**Arquivos:** `criar.js` + `criar.html`
**O quê:** Botão "CRIAR ARTE →" nos cards + bloco de páginas para carrossel
**Depende:** Fase 3
**Teste:** Botão aparece só nos formatos com template; clique redireciona ao Studio

### Fase 5 — Fallbacks e Integração

**Arquivo:** `criar.js`
**O quê:** Fallbacks para campos faltantes, mesclagem com estado existente no Studio
**Depende:** Fases 3 + 4
**Teste:** Campos ausentes não quebram; estado existente é preservado

---

## Apêndice A — Referência dos campos no Studio

Extraído de `app/app.jsx` (DEFAULT_STATE) e `app/panel.jsx` (controles):

```
CAROUSEL:     tagId, pattern, fill, ink, format,
              eyebrow, title, subtitle, badge, cta, footer,
              image, titleSize, pageCount, current,
              pages[{title,body,image,type?,eyebrow?,accent?,footer?,video?}]

IMAGE:        tagId, pattern, fill, ink,
              eyebrow, title, subtitle, priceLabel,
              image, titleSize

BLOCK:        tagId, pattern, fill, ink, format,
              eyebrow, title, subtitle, badge, cta, footer,
              titleSize, blockBg, blockInk

REELS:        tagId, pattern, fill, ink,
              eyebrow, title, subtitle, badge, cta, footer,
              image, titleSize, showSafe

QUIZ:         tagId, pattern, fill, ink, format,
              image, quizMode, eyebrow, question,
              quizOptions[4], answer, hideOptions,
              aLabel, bLabel, aImg, bImg, vsWord

RANKING:      tagId, pattern, fill, ink, format,
              image, eyebrow, title, titleSize,
              rankCount, rankItems[{name,note}]

ARRIVALS:     tagId, pattern, fill, ink, format,
              eyebrow, title, titleSize,
              arrivalCount, arrivals[{name,console,image}]

THUMB:        tagId, pattern, fill, ink,
              eyebrow, title, accentWord, badge, priceLabel,
              image, titleSize

MEME:         template, tagId, memeLayout, memeBarPos, memeCaption,
              memeBarColor, memeTop, memeBottom, memeCredit,
              image, titleSize
```
