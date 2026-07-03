# FIX — Hand-off Copys→Studio no modelo THUMB YOUTUBE (brief para o OpenCode)

> Fix pequeno e isolado, roda em paralelo ao sprint 1.1. Não mexe em nada além do
> descrito abaixo. Sem backend, sem novas dependências.

## O problema (reportado pelo usuário, causa raiz confirmada)

Em `copys.html`, a função `sendToStudio(v)` (por volta da linha 428) manda a copy
gerada pra IA pro Creative Studio, montando um `patch` diferente por modelo de arte.
No branch do modelo `thumb` (linhas 457-460), só o campo `title` recebe conteúdo da
IA — os outros campos que o template `ThumbFields`/`ThumbBody` (`app/panel.jsx:454`,
`app/preview.jsx:375`) já suportam ficam sempre com valor fixo:

```js
} else if(activeModel==='thumb'){
  patch = { ...patch, template:'thumb', fill:false, ink:'auto', pattern:'8bit', image:null,
    eyebrow: activeCat.label, title: titulo, accentWord:'', subtitle:'',
    badge:'EXCLUSIVO GAMER HUT', priceLabel:'', titleSize:140 };
```

Resultado: o usuário gera uma copy com CTA (ex: "Garanta o seu"), escolhe o modelo
THUMB YOUTUBE, clica "Criar arte" — e no Studio só o título grande veio preenchido.

## O que NÃO é bug (não mexer)

Cada campo do template `thumb` tem propósito visual próprio — não é pra preencher
tudo cegamente. Confirmado lendo `ThumbFields`/`ThumbBody`:
- `badge` (chip de canto, ex: "REVIEW") — hoje fixo "EXCLUSIVO GAMER HUT". É selo de
  marca, escolha válida. **Não alterar.**
- `priceLabel` (etiqueta inferior) — pra thumb isso é metadado de vídeo (ex: "12 MIN ·
  4K"), não preço. A IA não gera essa informação. **Deixar vazio é o comportamento
  correto** — não usar `price` nem `cta` aqui.
- `subtitle` — nem é lido por `ThumbBody`/`ThumbFields` no template thumb. Irrelevante,
  pode continuar `''`. **Não alterar.**

## O fix — 1 linha

`accentWord` é a "palavra em destaque" (ex: "EM 2025") — hoje sempre vazio, sem
nenhuma fonte de dado. O `cta` que a IA já gera (ex: "Garanta o seu", "Já disponível")
encaixa exatamente nesse propósito. Trocar:

```js
title: titulo, accentWord:'', subtitle:'',
```
por:
```js
title: titulo, accentWord: cta ? cta.toUpperCase() : '', subtitle:'',
```

`cta` já existe como variável no escopo de `sendToStudio` (linha 431: `const cta = (v.cta||'').trim();`)
— não precisa declarar nada novo.

## Critérios de aceite (DoD)

- [ ] Gerar uma copy em `copys.html` com um CTA preenchido pela IA (campo `cta` não-vazio).
- [ ] Escolher modelo "THUMB YOUTUBE" → clicar "Criar arte".
- [ ] No Creative Studio, o campo "Palavra em destaque (cor da tag)" vem preenchido com o CTA em maiúsculas.
- [ ] `badge`, `priceLabel`, `subtitle` continuam exatamente como estavam (sem mudança de comportamento).
- [ ] Gerar copy SEM CTA (campo vazio) → `accentWord` fica `''` (sem erro, sem "undefined").
- [ ] Todos os outros modelos de arte (block, reels, carousel, quiz, ranking, arrivals, image) continuam
      idênticos ao comportamento atual — regressão zero fora do branch `thumb`.

## NÃO fazer neste fix

- Não tocar `badge` nem `priceLabel` do modelo thumb.
- Não tocar os branches de outros modelos (`block`, `reels`, `carousel`, `quiz`, `ranking`,
  `arrivals`, `image`) — mesmo que pareçam ter o mesmo tipo de lacuna (`ranking`/`arrivals`
  têm, mas é escopo de outro momento, não pedido aqui).
- Não alterar `app/panel.jsx` nem `app/preview.jsx` — o template já suporta os campos,
  o problema é só o que `copys.html` manda pra ele.
