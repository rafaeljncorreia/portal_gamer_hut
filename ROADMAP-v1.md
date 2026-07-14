# ROADMAP v1 — Portal Gamer Hut 2.0

> **Filosofia:** Pipeline de criação orientado a dados, onde o comportamento da IA é guiado por arquivos de configuração editáveis (JSON). Os prompts não são mais hardcoded no HTML — o código lê, monta e envia. O usuário (marketeiro) controla o que a IA sabe sobre cada plataforma, formato e geração, e o sistema aprende com reprovações.

---

## Sumário

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Fluxo de Navegação](#3-fluxo-de-navegação)
4. [Fase 1 — Esqueletos de Config](#4-fase-1--esqueletos-de-config)
5. [Fase 2 — Motor de Leitura + Pipeline](#5-fase-2--motor-de-leitura--pipeline)
6. [Fase 3 — Wizard UI + Criação de Roteiros](#6-fase-3--wizard-ui--criação-de-roteiros)
7. [Fase 4 — Reprovação + Aprendizado](#7-fase-4--reprovação--aprendizado)
8. [Fase 5 — Página Revisar + Auditoria](#8-fase-5--página-revisar--auditoria)
9. [Fase 6 — Preenchimento dos JSONs pelo Usuário](#9-fase-6--preenchimento-dos-jsons-pelo-usuário)
10. [Especificação dos JSONs de Config](#10-especificação-dos-jsons-de-config)
11. [Prompt Assembly — Como o Prompt é Montado](#11-prompt-assembly--como-o-prompt-é-montado)
12. [Especificação do Sistema de Lições](#12-especificação-do-sistema-de-lições)
13. [Especificação da Página CRIAR](#13-especificação-da-página-criar)
14. [Especificação da Página REVISAR](#14-especificação-da-página-revisar)
15. [Especificação do Sistema de Roteiros](#15-especificação-do-sistema-de-roteiros)
16. [Notas sobre Downloader](#16-notas-sobre-downloader)
17. [Glossário](#17-glossário)

---

## 1. Arquitetura Geral

- **Buildless:** HTML + CSS + JS/JSX puro (React via UMD, Babel standalone). Sem bundler.
- **Armazenamento local:** Config JSONs são arquivos estáticos na raiz (`dados/`). Lições aprendidas ficam em `localStorage` (sem backend).
- **Proxy de IA:** `GH_CONFIG.proxyUrl` (já existe) para quando publicado no GitHub Pages. `window.claude.complete()` para quando roda dentro do Portal/Claude.
- **Persistência de estado:** Tudo que o usuário gera fica em `localStorage` — gerações anteriores, lições, histórico.

---

## 2. Estrutura de Arquivos

```
/
├── dados/                         ← NOVO — TODO o conteúdo é editável pelo usuário
│   ├── plataformas/
│   │   ├── instagram.json
│   │   ├── youtube.json
│   │   └── tiktok.json
│   ├── formatos/
│   │   ├── review.json
│   │   ├── gameplay.json
│   │   ├── unboxing.json
│   │   ├── youtube-repost.json
│   │   ├── video-curto.json
│   │   ├── carrossel.json
│   │   ├── post.json
│   │   ├── quiz.json
│   │   └── ranking.json
│   └── geracoes/
│       ├── gen-z.json
│       ├── millennial.json
│       └── gen-x.json
│
├── app/                           ← Já existe (componentes React do Studio)
├── assets/                        ← Já existe
├── server/                        ← Já existe
├── index.html                     ← Portal (atualizar nav + cards)
├── criar.html                     ← NOVO — substitui copys.html na nav "CRIAR"
├── studio.html                    ← Existente — atualizar nav apenas
├── revisar.html                   ← NOVO — substitui review.html na nav "REVISAR"
├── copys.html                     ← Existente — MANTER como legado oculto (sem link na nav)
├── downloader.html                ← REMOVER completamente
├── review.html                    ← REMOVER (substituído por revisar.html)
├── brand-voice.js                 ← Existente — inalterado
├── config.js                      ← Existente — inalterado
├── portal.css                     ← Existente — inalterado (pode ganhar novos estilos)
└── dados/dados-loader.js          ← NOVO — módulo JS que carrega todos os JSONs
```

---

## 3. Fluxo de Navegação

### Antes
```
PORTAL | CREATIVE STUDIO | COPYS | REVIEW | DOWNLOADER
```

### Depois
```
PORTAL  |  CRIAR  |  STUDIO  |  REVISAR
```

### Atualizações necessárias por arquivo

| Arquivo | O que mudar |
|---------|------------|
| `index.html` | Nav: remover DOWNLOADER, COPYS → CRIAR, REVIEW → REVISAR. Seção "Ferramentas" com 3 cards. |
| `studio.html` | Nav: mesma estrutura, apenas classe `active` correta. |
| `criar.html` | Nav: idem. |
| `revisar.html` | Nav: idem. |
| `copys.html` | Não alterar nav (não acessível via nav). Pode conter banner "Use a nova página CRIAR". |
| `downloader.html` | Remover completamente. |
| `review.html` | Remover completamente. |

---

## 4. Fase 1 — Esqueletos de Config

**Objetivo:** Criar todos os 15 arquivos JSON com a estrutura correta, mas campos `instrucoes` e `exemplos` vazios. O usuário preenche depois (Fase 6).

### Estrutura comum a todos os JSONs

```json
{
  "id": "",
  "nome": "",
  "version": 1,
  "ultimaRevisao": "",
  "instrucoes": "",
  "exemplos": ""
}
```

### Formatos têm campos extras

```json
{
  "id": "review",
  "nome": "Review",
  "plataforma": "youtube",
  "tipoSaida": "roteiro",
  "version": 1,
  "ultimaRevisao": "",
  "instrucoes": "",
  "exemplos": ""
}
```

### Lista completa de arquivos

**Plataformas:** `instagram.json`, `youtube.json`, `tiktok.json`

**Formatos:** `review.json`, `gameplay.json`, `unboxing.json`, `youtube-repost.json`, `video-curto.json`, `carrossel.json`, `post.json`, `quiz.json`, `ranking.json`

**Gerações:** `gen-z.json`, `millennial.json`, `gen-x.json`

---

## 5. Fase 2 — Motor de Leitura + Pipeline

### `dados/dados-loader.js`

Script que carrega todos os JSONs de config dinamicamente via `fetch()` e expõe como `window.DADOS`:

```js
window.DADOS = {
  plataformas: { /* chaveado por id */ },
  formatos: { /* chaveado por id */ },
  geracoes: { /* chaveado por id */ },

  // Métodos
  formatosDaPlataforma(plataformaId) {
    // Retorna array de formatos onde formato.plataforma === plataformaId
  },

  montarPrompt({ plataformaId, formatoId, geracaoId, brief, tom, categoriaId }) {
    // 1. GH_BRAND (brand-voice.js)
    // 2. plataforma.instrucoes
    // 3. formato.instrucoes
    // 4. geracao.instrucoes
    // 5. Lições ativas (filtradas por plat + fmt + ger, máx 5)
    // 6. Briefing + Tom + Categoria
    // 7. Instrução final conforme tipoSaida (copy vs roteiro)
  },

  licoesAtivas(plataformaId, formatoId, geracaoId) {
    // Recupera de GH_LICOES as lições ativas e aplicáveis
  }
}
```

**Regras:**
- Fallback silencioso para JSONs faltantes ou mal formatados (try/catch + console.warn)
- Nunca travar a página por causa de um JSON faltando
- Se `instrucoes` for vazio, simplesmente não incluir aquela seção no prompt

---

## 6. Fase 3 — Wizard UI + Criação de Roteiros

### `criar.html`

Nova página de criação que substitui `copys.html` na navegação. Mantém o design system (portal.css) e estrutura de header/footer.

### Fluxo em cascata (4 etapas)

Cada etapa só aparece visualmente quando a anterior tem uma seleção válida:

```
ETAPA 1 — ESCOLHA A PLATAFORMA
[Instagram] [YouTube] [TikTok]
(sempre visível)

       ↓ quando seleciona

ETAPA 2 — ESCOLHA O FORMATO
[Lista filtrada: só formatos da plataforma escolhida]

       ↓ quando seleciona

ETAPA 3 — ESCOLHA A GERAÇÃO
[Gen Z] [Millennial] [Gen X]

       ↓ quando seleciona

ETAPA 4 — BRIEFING + TOM + CATEGORIA + ARTE
- Briefing (textarea)
- Tom: [Hype] [Informativo] [Nostálgico] [Zueiro]
- Categoria: [Notícias] [Pré-venda] [Lançamento]...
- Modelo Arte: [Post] [Carrossel] [Thumb]...
- 📄 Prompt Preview (collapsível — mostra quais configs serão lidas)
- [⚡ GERAR]
```

**Comportamento:**
- Etapas ocultas não ocupam espaço (display:none)
- Transição suave ao expandir
- Trocar plataforma → reseta formato + geração + briefing
- Trocar formato → reseta geração + briefing

### Renderização de resultados

**tipoSaida: "copy"** → Cards tradicionais (título, legenda, cta, hashtags, botão copiar, botão "Criar Arte")

**tipoSaida: "roteiro"** → Novo componente visual com cenas:

```
┌─── CENA 1 · 0:00–0:08 ─────────────────┐
│ 🎬 VISUAL: Gameplay do boss final      │
│ 🎤 NARRAÇÃO: "Se liga no que chegou..."│
└────────────────────────────────────────┘
+ Título do vídeo + Descrição + Hashtags
+ Botões: [COPIAR ROTEIRO] [COPIAR TÍTULO] [COPIAR DESCRIÇÃO]
+ [CRIAR THUMB] → redireciona para studio.html com template thumb pré-preenchido
```

### Botões de feedback em toda variação

[✅ APROVAR] [❌ REPROVAR]

---

## 7. Fase 4 — Reprovação + Aprendizado

### LocalStorage

Duas chaves:
- `gh-licoes` → array de lições aprendidas
- `gh-geracoes` → array de gerações com histórico completo

### Fluxo de reprovação

1. Resultado exibido → cada variação tem [✅ APROVAR] e [❌ REPROVAR]
2. **APROVAR:** registra qual variação foi escolhida, salva geração
3. **REPROVAR:** abre campo inline "O que errou?" + botão [Enviar Feedback]
4. Ao enviar:
   a. Adiciona feedback ao array da geração
   b. Cria ou reforça lição em `gh-licoes`

### Estrutura de uma lição

```js
{
  id: "l-1712345678",
  texto: "Títulos de review no YouTube para Gen Z devem ter max 6 palavras",
  plataforma: "youtube",
  formato: "review",
  geracao: "gen-z",
  criadoEm: "2026-07-13T14:30:00.000Z",
  ultimoUso: "...",
  ultimoReforco: "...",
  forca: 1.0,           // 0.0–1.0, aumenta com reforço
  ativa: true,
  expiraEm: "2026-09-11T14:30:00.000Z",  // criadoEm + 60 dias
  versaoPlataforma: 1,
  versaoFormato: 1,
  geracaoOrigem: "g-1712345678"
}
```

### Estratégia de Obsolescência (Opção D — Mista)

| Regra | Comportamento |
|-------|---------------|
| Decaimento temporal | `expiraEm` passado → `ativa = false` automaticamente |
| Versionamento | Se versão do JSON mudar, lições da versão antiga são ignoradas (não deletadas) |
| Reforço | Reprovação similar (mesma plat + fmt + ger) → `forca += 0.1`, expiraEm +60d |
| Limite | Máximo 5 lições por geração, selecionadas por força descendente |
| Limpeza automática | `limparExpiradas()` roda ao carregar |

---

## 8. Fase 5 — Página Revisar + Auditoria

### `revisar.html`

Três seções principais:

### 8.1 Histórico de Gerações

Lista cronológica reversa com:
- Indicadores visuais: ✅ aprovado, ❌ feedback enviado, ⏳ pendente, ✅✅ aprovado + lição
- Filtro por plataforma/formato/geração
- Clique em item → abre painel de auditoria

### 8.2 Auditoria com IA

Ao clicar em "Auditar Agora":
- Re-envia o material gerado para o Claude com o prompt:
  *"Analise se este material está adequado para a geração [X] e o tom [X]"*
- Retorna relatório com itens: `ok`, `alerta`, `erro`
- Botões: [REPROVAR] [APROVAR E ARQUIVAR]
- Exibe feedback original e lição gerada na época

### 8.3 Gerenciamento de Lições

- Lista de lições ativas e expiradas
- Cores: 🟢 >30d, 🟡 <15d, 🔴 expirada
- Ações: [Relevante] [Arquivar] [Excluir] [Reativar]
- Estatísticas: "12 ativas · 4 expiradas · 3 arquivadas"

---

## 9. Fase 6 — Preenchimento dos JSONs pelo Usuário

**Não é implementação de código.** É trabalho do usuário/marketeiro.

Cada campo `instrucoes` e `exemplos` deve ser preenchido com conteúdo estratégico:
- **Plataformas:** o que funciona em cada canal, regras de algoritmo, formato ideal, tom da plataforma
- **Formatos:** estrutura esperada, duração, ganchos, CTAs específicos
- **Gerações:** linguagem, referências culturais, nível de formalidade, gatilhos emocionais

⚠️ **Isto é ouro.** Deve ser revisado, embasado e específico. O código está pronto para consumir — basta preencher.

---

## 10. Especificação dos JSONs de Config

### Estrutura base (todos os arquivos)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string | sim | Identificador único (ex: "youtube") |
| `nome` | string | sim | Nome legível para exibição (ex: "YouTube") |
| `version` | number | sim | Incrementado manualmente quando o conteúdo é revisado |
| `ultimaRevisao` | string | não | Data ISO da última revisão (ex: "2026-07-13") |
| `instrucoes` | string | sim (pode ser vazio) | Texto instrucional que vai no prompt |
| `exemplos` | string | não | Exemplos de referência para a IA |

### Campos extras de Formatos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `plataforma` | string | sim | ID da plataforma à qual o formato pertence |
| `tipoSaida` | "roteiro" \| "copy" | sim | Define como o resultado é exibido e qual template JSON usar |

### Mapeamento Formatos → tipoSaida

| Formato | tipoSaida |
|---------|-----------|
| review | roteiro |
| gameplay | roteiro |
| unboxing | roteiro |
| video-curto | roteiro |
| youtube-repost | copy |
| carrossel | copy |
| post | copy |
| quiz | copy |
| ranking | copy |

---

## 11. Prompt Assembly — Como o Prompt é Montado

### Função `montarPrompt()`

```js
montarPrompt({
  plataformaId: "youtube",
  formatoId: "review",
  geracaoId: "gen-z",
  brief: "Review do MGS Delta PS5...",
  tom: "Hype",
  categoriaId: "lancamento",
  preco: "",
  plataformaConsole: "PS5"
})
```

### Estrutura do prompt final

```
{GH_BRAND (brand-voice.js)}

---

INSTRUÇÕES DE PLATAFORMA — YouTube
{plataforma.instrucoes}
{plataforma.exemplos}

---

INSTRUÇÕES DE FORMATO — Review
{formato.instrucoes}
{formato.exemplos}

---

INSTRUÇÕES DE GERAÇÃO — Gen Z
{geracao.instrucoes}
{geracao.exemplos}

---

LIÇÕES APRENDIDAS (aplicáveis — máx 5)
- Título max 6 palavras no gancho
- Sempre mencionar preço na 1ª frase

---

TAREFA:
Categoria: Lançamento
Tom: Hype
Plataforma: PS5
Briefing: Review do MGS Delta PS5...

{instrução final conforme tipoSaida}
```

### Instrução final para `tipoSaida: "copy"`

```
Escreva 3 variações de copy seguindo a Fórmula de copy (gancho → apresentação → diferenciais → CTA).

Responda SOMENTE com JSON válido no formato:
{"variacoes":[
  {"titulo":"","legenda":"","cta":"","hashtags":[]}
]}
```

### Instrução final para `tipoSaida: "roteiro"`

```
Escreva 2 variações de roteiro de vídeo. Cada cena tem duração aproximada, descrição visual e narração.
O vídeo completo deve ter entre 30 e 90 segundos.
Inclua título do vídeo, descrição e hashtags.

Responda SOMENTE com JSON válido no formato:
{"variacoes":[
  {
    "titulo":"título do vídeo",
    "descricao":"descrição do vídeo",
    "hashtags":["tag1","tag2"],
    "cenas":[
      {"duracao":"0:00-0:05","visual":"descrição visual","narracao":"texto falado"},
      {"duracao":"0:05-0:15","visual":"...","narracao":"..."}
    ]
  }
]}
```

---

## 12. Especificação do Sistema de Lições

### Chave no localStorage

`gh-licoes` — JSON com array de lições

`gh-geracoes` — JSON com array de gerações

### Métodos do sistema de lições

| Método | Descrição |
|--------|-----------|
| `adicionarLicao(texto, plat, fmt, ger)` | Cria lição com força 1.0, expira em 60d |
| `licoesAtivas(plat, fmt, ger)` | Retorna até 5 lições, ordenadas por força |
| `reforcarLicao(id)` | forca += 0.1, expiraEm = agora + 60d |
| `arquivarLicao(id)` | ativa = false |
| `reativarLicao(id)` | ativa = true, expiraEm = agora + 60d |
| `limparExpiradas()` | ativa = false para expiradas |
| `excluirLicao(id)` | Remove permanentemente |

### Quando as lições são usadas

- **Ao montar prompt:** filtradas por plat + fmt + ger, máx 5, ordenadas por força
- **Ao reprovar:** checa similaridade com lições existentes — se parecida, reforça em vez de criar nova
- **Ao carregar página:** `limparExpiradas()` roda automaticamente

---

## 13. Especificação da Página CRIAR

### Estrutura do HTML

```
criar.html
├── Nav (PORTAL | CRIAR | STUDIO | REVISAR)
├── Main
│   ├── .head (título + descrição + eyebrow)
│   ├── .layout
│   │   ├── .panel-briefing (etapas 1–4, lado esquerdo)
│   │   │   ├── Etapa 1: chips de plataforma
│   │   │   ├── Etapa 2: chips de formato (condicional)
│   │   │   ├── Etapa 3: chips de geração (condicional)
│   │   │   ├── Etapa 4: briefing + tom + categoria + arte (condicional)
│   │   │   ├── Prompt Preview collapsível
│   │   │   └── Botão GERAR
│   │   └── .panel-resultado (lado direito)
│   │       └── .out (resultados renderizados)
│   └── Footer
└── Scripts
    ├── brand-voice.js
    ├── config.js
    ├── dados/dados-loader.js
    └── criar.js
```

### Reaproveitar de copys.html

- `sendToStudio()` — adaptar
- `copyText()`
- `extractJSON()` — adaptar para aceitar também formato de roteiro
- `aiComplete()`
- `skeleton()` — skeleton loading
- `showErr()`

---

## 14. Especificação da Página REVISAR

### Três seções no layout

**1. Histórico de Gerações**
- Lista cronológica reversa de `gh-geracoes`
- Indicadores visuais por cor/ícone
- Campo de busca e filtro por plataforma/formato/geração
- Ao clicar em um item → expande painel de auditoria

**2. Auditoria**
- Exibe o material gerado original
- Botão [Auditar Agora] → envia para IA com prompt de auditoria
- Retorna relatório com itens `ok/alerta/erro`
- Botões [REPROVAR] [APROVAR E ARQUIVAR]
- Exibe feedback original e lição gerada

**3. Gerenciamento de Lições**
- Lista de lições ativas e expiradas
- Indicador visual de saúde (🟢 🟡 🔴)
- Ações por lição: [Relevante] [Arquivar] [Excluir] [Reativar]
- Estatísticas no rodapé da seção

---

## 15. Especificação do Sistema de Roteiros

### Quando gerar roteiro

Quando `formato.tipoSaida === "roteiro"`, o output não é copy tradicional, mas um roteiro de vídeo com cenas.

### Formato JSON de saída do roteiro

```json
{
  "variacoes": [
    {
      "titulo": "MGS Delta - Vale a Pena em 2026?",
      "descricao": "Review completo do Metal Gear Solid Delta...",
      "hashtags": ["MetalGear", "Review", "PS5"],
      "cenas": [
        {
          "duracao": "0:00-0:08",
          "visual": "Gameplay do boss The End com texto 'MGS DELTA' sobreposto",
          "narracao": "Se liga no que chegou na Gamer Hut hoje!"
        },
        {
          "duracao": "0:08-0:25",
          "visual": "Capa do jogo + texto 'REVIEW' na tela",
          "narracao": "Esse é o Metal Gear Solid Delta: Snake Eater..."
        }
      ]
    }
  ]
}
```

### Renderização visual

Cada variação de roteiro mostra:
- Título do vídeo (destacado)
- Lista de cenas com duração, ícone 🎬 visual, ícone 🎤 narração
- Descrição do vídeo
- Hashtags
- Botão [COPIAR ROTEIRO] → copia no formato:
  ```
  MGS Delta - Vale a Pena em 2026?
  
  🎬 CENA 1 (0:00-0:08)
  VISUAL: ...
  NARRAÇÃO: "..."
  ```
- Botão [COPIAR TÍTULO]
- Botão [COPIAR DESCRIÇÃO]
- Botão [CRIAR THUMB] → `sendToStudio()` com template `thumb` e título do roteiro
- [✅ APROVAR] [❌ REPROVAR]

---

## 16. Notas sobre Downloader

- `downloader.html` deve ser removido do repositório (`git rm`)
- Links para downloader removidos de todas as páginas
- Verificar assets exclusivos do downloader em `assets/` — remover se não forem usados por outras páginas

---

## 17. Glossário

| Termo | Definição |
|-------|-----------|
| **Config** | Arquivo JSON editável que contém instruções para a IA |
| **Plataforma** | Canal de publicação (YouTube, Instagram, TikTok) |
| **Formato** | Tipo de conteúdo (Review, Gameplay, Post, etc.) |
| **Geração** | Segmento geracional (Gen Z, Millennial, Gen X) |
| **Briefing** | Texto livre do usuário descrevendo o que quer gerar |
| **Prompt Assembly** | Processo de montar o prompt final concatenando todas as fontes |
| **Lições** | Feedback do usuário convertido em instrução reutilizável |
| **Força** | Métrica 0.0–1.0 de confirmação de uma lição |
| **Obsolescência** | Mecanismo para evitar instruções desatualizadas |
| **Roteiro** | Output com cenas sequenciais (visual + narração + duração) |
| **Copy** | Output textual (título + legenda + CTA + hashtags) |
| **tipoSaida** | Campo no JSON do formato que determina "roteiro" ou "copy" |
| **Wizard** | Fluxo de etapas em cascata |

---

## Ordem de Implementação

```
FASE 1: Criar todos os esqueletos JSON em dados/
FASE 2: Criar dados/dados-loader.js com fetch + montarPrompt()
FASE 3: Criar criar.html + criar.js com wizard completo + renderização de roteiro
FASE 4: Sistema de lições (GH_LICOES + GH_GERACOES) + botões reprovar em criar.html
FASE 5: Criar revisar.html + revisar.js com histórico + auditoria + gerenciamento de lições
FASE 6: Atualizar navegação em index.html, studio.html, criar.html, revisar.html
FASE 7: Remover downloader.html e review.html
FASE 8: Usuário preenche os JSONs com conteúdo estratégico
```
