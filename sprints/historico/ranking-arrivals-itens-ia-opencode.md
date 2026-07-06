# FEATURE — Itens gerados por IA nos modelos TOP/RANKING e NOVIDADES (brief para o OpenCode)

> Achado ao investigar o bug do THUMB YOUTUBE (spec irmã: `fix-thumb-studio-handoff-opencode.md`),
> mas é escopo diferente — não é um mapeamento esquecido, é uma lacuna estrutural. Replica o
> padrão que o modelo `carousel` já usa pra pedir uma lista estruturada da IA. Sem backend,
> sem dependência nova.

## O problema (mais fundo do que parecia)

Diferente do THUMB (que tinha campo pronto sem fonte de dado), os modelos `ranking` e
`arrivals` no Creative Studio (`app/panel.jsx:406` `RankingFields`, `app/panel.jsx:492`
`ArrivalsFields`) não têm campos de texto livre esperando conteúdo — o conteúdo real
deles é uma **lista estruturada**: `rankItems: [{name, note}]` (3 a 6 itens) e
`arrivals: [{name, console, image}]` (2 a 6 itens).

Confirmado em `copys.html:613-650`: o prompt que pede JSON pra IA só pede uma lista
(`paginas`) quando `activeModel==='carousel'` (linha 647-649). Pra `ranking`/`arrivals`,
a IA recebe a MESMA instrução genérica de todos os outros modelos —
`{"titulo","legenda","cta","hashtags"}`, sem nenhum campo de lista. Por isso
`sendToStudio()` (`copys.html:451-456`) só consegue mapear `title` — não existe
`v.rankItems`/`v.arrivals` na resposta da IA porque nunca foi pedido.

**Não é fix de 1 linha.** É replicar, pros dois modelos, o padrão que `carousel` já
usa com sucesso: pedir a lista certa no prompt + mapear no hand-off.

## O que já está pronto (padrão a replicar, NÃO reinventar)
- `copys.html:220-228` — UI de stepper `#pagesField` (mostra/esconde conforme `activeModel`,
  controla variável `pageCount`). Modelo pro novo controle de contagem de itens.
- `copys.html:337` — `pagesField.style.display = (activeModel==='carousel') ? 'block' : 'none';`
  dentro do handler de clique do seletor de modelo. Modelo pra mostrar/esconder o novo campo.
- `copys.html:613-619` — bloco condicional no prompt que muda a instrução quando `carousel`
  ativo. Modelo pro texto condicional de ranking/arrivals.
- `copys.html:647-649` — bloco condicional no schema JSON pedido à IA, com contagem EXATA
  amarrada à variável de stepper. Modelo pro schema de `itens`.
- `copys.html:442-444` — mapeamento de `v.paginas` pro patch do Studio, com fallback quando
  a IA não retorna páginas. Modelo pro mapeamento de `v.itens`.
- `copys.html:513-520` — preview de `pagesHTML` dentro do card de resultado, mostrando a
  estrutura de páginas antes de "Criar arte". Modelo pro preview de itens.

## Escopo

### Passo 1 — stepper de contagem (ranking e arrivals)
Adicionar dois novos `<div class="field" id="rankField" style="display:none;">` e
`id="arrivalsField"`, mesmo padrão visual de `#pagesField` (`copys.html:220-228`):
- Ranking: stepper min 3, max 6, default 5 (mesmos limites de `RankingFields` no Studio, `app/panel.jsx:420`).
- Arrivals: stepper min 2, max 6, default 4 (mesmos limites de `ArrivalsFields`, `app/panel.jsx:506`).

No handler de clique do seletor de modelo (`copys.html:336-337`), estender a lógica de
`display` pra mostrar `#rankField` quando `activeModel==='ranking'` e `#arrivalsField`
quando `activeModel==='arrivals'` (esconder os outros dois nesse momento).

### Passo 2 — prompt condicional (schema pedido à IA)
Estender os dois blocos condicionais de `copys.html:613-619` e `647-649` (hoje só tratam
`carousel`) pra também tratar `ranking` e `arrivals`:

- **Ranking:** instrução — "Este post é um TOP/RANKING com `${rankCount}` itens. Crie um
  título forte pro ranking + a lista ordenada de itens (do menos pro mais importante, o
  item 1 é o destaque)." Schema adicional por variação: `"itens":[{"nome":"nome do jogo",
  "tag":"tag curta, ex: MAIS VENDIDO"}]`, com instrução "IMPORTANTE: o array 'itens' deve
  ter EXATAMENTE ${rankCount} itens."
- **Arrivals:** instrução — "Este post é NOVIDADES DA SEMANA com `${arrivalCount}` jogos
  novos. Crie um título de chamada + a lista dos jogos." Schema adicional:
  `"itens":[{"nome":"nome do jogo","plataforma":"ex: PS5"}]`, com a mesma instrução de
  contagem exata amarrada a `arrivalCount`.

### Passo 3 — mapear no hand-off (`sendToStudio`)
Em `copys.html:451-456`, seguindo o padrão de `442-444`:
```js
} else if(activeModel==='ranking'){
  const rankItems = Array.isArray(v.itens) && v.itens.length
    ? v.itens.map(it=>({ name:(it.nome||'').toUpperCase(), note:(it.tag||'').toUpperCase() }))
    : [];
  patch = { ...patch, template:'ranking', fill:false, ink:'auto', pattern:'grid', image:null,
    eyebrow: activeCat.label, title: titulo, titleSize:96,
    rankCount: rankItems.length || 5, rankItems };
} else if(activeModel==='arrivals'){
  const arrivals = Array.isArray(v.itens) && v.itens.length
    ? v.itens.map(it=>({ name:(it.nome||'').toUpperCase(), console:(it.plataforma||'').toUpperCase(), image:null }))
    : [];
  patch = { ...patch, template:'arrivals', fill:false, ink:'auto', pattern:'8bit', image:null,
    eyebrow: activeCat.label, title: titulo || 'NOVIDADES DA SEMANA', titleSize:84,
    arrivalCount: arrivals.length || 4, arrivals };
}
```
Se a IA não retornar `itens` (ex.: geração antiga em cache, resposta truncada), o array
fica vazio e o usuário preenche manualmente no Studio — **não inventar itens genéricos
como fallback**, isso seria pior que deixar vazio.

### Passo 4 — preview no card de resultado
Seguindo o padrão de `pagesHTML` (`copys.html:513-520`): quando a variação tiver
`v.itens`, mostrar um bloco de preview simples listando os itens (número + nome + tag/plataforma)
dentro do card, antes do botão "Criar arte" — pra o usuário ver o que vai pro Studio
sem precisar clicar antes.

## Critérios de aceite (DoD)
- [ ] Escolher modelo "TOP / RANKING" → aparece stepper de quantidade (3-6, default 5), some o de carrossel.
- [ ] Gerar copy com ranking → resposta da IA inclui `itens` com a quantidade exata pedida.
- [ ] Card de resultado mostra preview da lista de itens antes de "Criar arte".
- [ ] Clicar "Criar arte" → Studio abre com `rankItems` preenchido (nome + tag por item).
- [ ] Mesmo fluxo completo pro modelo "NOVIDADES" (`arrivalCount` 2-6, default 4, campo `plataforma`→`console`).
- [ ] Escolher outro modelo (ex: image) → nenhum stepper de item aparece; geração volta ao formato genérico de sempre.
- [ ] Trocar de modelo DEPOIS de já ter gerado uma copy não quebra nada (schema é montado no momento do clique em GERAR).
- [ ] Nenhuma regressão nos modelos já existentes (block, reels, carousel, quiz, thumb, image).
- [ ] Contrato `/ai` inalterado.

## NÃO fazer neste sprint
- Não inventar itens genéricos como fallback quando a IA não retornar `itens` — deixar vazio pro preenchimento manual.
- Não mexer em `app/panel.jsx`/`app/preview.jsx` — os templates já suportam os campos, só falta alimentá-los.
- Não alterar o modelo `quiz` (fora de escopo, não investigado nesta spec).
- Não tocar `config.js`, `server/*`, `.github/`.
