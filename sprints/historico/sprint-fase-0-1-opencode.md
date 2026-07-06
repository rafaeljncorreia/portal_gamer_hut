# SPRINT 1.0 — Geradores catálogo-aware (brief para o OpenCode)

> **Mudança de rota:** o 1.0 é SEM backend novo (sem Cloudflare D1, sem Supabase, sem wrangler).
> Meta: versão mínima funcional o mais rápido possível, no stack atual (React via CDN, sem build).
> O proxy de IA continua EXATAMENTE como está (Cloudflare hardcoded com a API do Claude — não tocar).

## O que já está pronto (feito pelo Claude, NÃO refazer)
- `catalog.json` — snapshot dos 22 jogos do board Monday de pré-vendas/lançamentos.
- `catalog.js` — `window.GH_CATALOG` com `.load()`, `.paraDivulgar()`, `.byId()`, e os mapeamentos
  `geracao_key` (→ GH_GENERATIONS), `tom_sugerido` (→ GH_TONES) e `status` derivado por jogo.

## Objetivo do sprint
Fazer os geradores **entenderem o catálogo**: em vez de digitar `[JOGO]` na mão e escolher tudo,
o usuário escolhe um jogo da lista e o gerador já vem pré-configurado (geração + tom + nome do jogo),
usando os dados reais do Monday. É o pulo do gato do 1.0.

## Escopo — só `copys.html` e `descricoes.html` (studio/review ficam pra depois)

### Passo 1 — carregar o catálogo
Em `copys.html` e `descricoes.html`, adicionar o script na ordem CORRETA (depois do brand-voice):
```html
<script src="config.js"></script>
<script src="generation-context.js"></script>
<script src="brand-voice.js"></script>
<script src="catalog.js"></script>   <!-- NOVO -->
```

### Passo 2 — seletor de jogo (novo controle no topo do gerador)
- Adicionar um `<select id="gamePicker">` (ou lista) preenchido via `GH_CATALOG.load()`.
- Popular preferencialmente com `GH_CATALOG.paraDivulgar()` (jogos com DIVULGAR = CONFIRMADO);
  ter um toggle "ver todos" que usa a lista completa.
- Cada opção mostra: nome + `status_label` + plataformas (ex: "R-Type · À venda · PS5, SW").

### Passo 3 — ao escolher um jogo, pré-configurar o gerador
No `onchange` do seletor, pegar `var j = GH_CATALOG.byId(value)` e:
- Se `j.geracao_key`: setar `activeGen = j.geracao_key`, persistir `localStorage 'gh-generation'`,
  e refletir no switch visual (reusar a lógica de `buildGenSwitch` em `copys.html:259`).
- Se `j.tom_sugerido`: setar `activeTone` para esse tom e refletir no seletor de tom.
- Preencher o campo de briefing/tema com o nome do jogo e um resumo do contexto:
  `nome, plataformas, status_label, janela de divulgação (divulgacao_inicio→fim), pilar_sugerido`.
- NÃO mudar a assinatura de `getBrandVoice(activeGen, activePlatformCopys, activeTone)` — só alimentá-la.

### Passo 4 — injetar contexto do jogo no prompt
Onde o prompt é montado (`copys.html:~517`, antes do `fetch` ao proxy): concatenar um bloco
"CONTEXTO DO PRODUTO (fonte: catálogo GH)" com os campos do jogo escolhido, para a IA usar dados
reais (status de pré-venda, onde vende, datas, pilar). O contrato do proxy segue `POST {prompt}→{text}`.

## Critérios de aceite (DoD)
- [ ] Abrir `copys.html`: o seletor lista jogos do catálogo (default = os CONFIRMADO pra divulgar).
- [ ] Escolher "R-Type" → geração vira "Gen X" (primeiro do combo) e tom sugerido "Nostálgico".
- [ ] Gerar copy → o texto reflete que R-Type está À VENDA (não pré-venda) e cita plataformas reais.
- [ ] Escolher "Silent Hill Townfall" → status Pré-venda, tom Hype; copy sai coerente.
- [ ] `descricoes.html` com o mesmo seletor funcionando.
- [ ] Nada quebrou: geração sem escolher jogo (fluxo antigo) continua igual; proxy `/ai` intacto.

## NÃO fazer neste sprint
- Nada de backend/banco/deploy (Cloudflare, D1, Supabase, wrangler). Isso é v2.
- Não portar para Vite/rotas. Mantém os HTML atuais.
- Não integrar radar (RAWG) nem criar tarefas no Monday. Fases futuras.
- Não alterar regras de marca (ver HANDOFF-OPENCODE.md seção 7).

## Como atualizar o catálogo (enquanto não há sync ao vivo)
Pedir ao Claude: "re-puxe o board 18417580003 e regere catalog.json". (v2 automatiza via backend.)
