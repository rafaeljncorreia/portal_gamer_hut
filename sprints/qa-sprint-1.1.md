# QA — Sprint 1.1 (Aprendizado contínuo) + Fix Thumb Studio + Itens IA Ranking/Arrivals

> Para o QA Agent. Base: `AGENT-PLAYBOOK.md` (seções 8 = código, 9 = copy). Este
> arquivo cobre os três entregáveis em paralelo: `sprints/sprint-1.1-aprendizado-opencode.md`,
> `sprints/fix-thumb-studio-handoff-opencode.md` e `sprints/ranking-arrivals-itens-ia-opencode.md`.

## Ambiente
```
cd C:\Users\Joao\OneDrive\Desktop\Portal-Gamer-Hut
python -m http.server 8080
# Abrir http://localhost:8080/aprendizado.html  (Ctrl+F5 = hard refresh)
```

## A. Código — carregamento e integridade (aprendizado.html)
- [ ] `aprendizado.html` inclui `config.js` → `generation-context.js` → `brand-voice.js`, nessa ordem.
- [ ] `window.getActiveLearningLog` existe no console; `window.getBrandVoice.length === 3` (assinatura preservada).
- [ ] Console (F12) limpo ao abrir a página, enviar mensagem, criar diretriz, arquivar diretriz.
- [ ] Zero dependência npm nova; vanilla/CDN, sem build.
- [ ] Tokens de cor via `portal.css` (`var(--orange)` etc.) — sem hex hardcoded no CSS novo.

## B. Nav — regressão de navegação
- [ ] "APRENDIZADO" presente nas 6 páginas (index, copys, descricoes, review, downloader, studio).
- [ ] `class="active"` aparece só na própria página de cada link.
- [ ] Nenhum link existente do nav quebrou nas 6 páginas.

## C. Comportamento do chat
- [ ] Enviar mensagem sem diretriz proposta: resposta normal aparece, sem card, sem gravação em `gh-learning-log`.
- [ ] Loading state aparece durante espera da IA; botão de enviar desabilita (ex: "⏳ PENSANDO…").
- [ ] Erro de rede/proxy: mensagem de erro some aparece como entrada no chat SEM apagar o histórico anterior.
- [ ] Input vazio não envia (botão desabilitado ou early-return).

## D. Parsing de proposta de diretriz — robustez
- [ ] Bloco ```gh-diretriz``` bem formado → card renderiza com todos os campos (bloco_tipo, bloco_key, label, conteudo).
- [ ] Bloco com JSON malformado (vírgula sobrando, aspas quebradas) → NÃO quebra a página; mensagem de texto
      normal ainda aparece; nenhum card fantasma/quebrado.
- [ ] Resposta da IA sem nenhum bloco ```gh-diretriz``` → chat funciona normal, zero card.
- [ ] Duas propostas na mesma resposta → dois cards renderizam, cada um independente.
- [ ] Bloco com `action` desconhecido (nem `create` nem `archive`) → ignorado silenciosamente, sem erro no console.

## E. Persistência e efeito REAL na geração (o pulo do gato)
- [ ] `gh-learning-log` e `gh-learning-chat` sobrevivem a F5 (reload).
- [ ] Criar diretriz `bloco_tipo:'tone', bloco_key:'zueiro'` (via chat, clicando "CRIAR DIRETRIZ") → ir em
      `copys.html`, gerar copy com tom ZUEIRO selecionado → confirmar (inspecionar prompt antes do fetch, via
      breakpoint/console.log temporário ou aba Network) que o texto de `conteudo` da diretriz está presente.
- [ ] Gerar copy com tom diferente (ex: HYPE) → confirmar que a MESMA diretriz (`bloco_key:'zueiro'`) NÃO
      aparece no prompt (filtro de relevância funcionando).
- [ ] Criar diretriz `bloco_tipo:'brand'` → confirmar que aparece em QUALQUER combinação de geração/tom/plataforma.
- [ ] Arquivar a diretriz (botão no painel direito) → gerar copy novamente com o mesmo tom/geração → confirmar
      que ela SOME do prompt.
- [ ] Arquivar NÃO remove o item do array em `gh-learning-log` — só muda `is_current` pra `0` (soft-delete).

## F. Imutabilidade das Regras de Ouro
- [ ] No chat, pedir explicitamente pra IA propor algo que viole regra de marca (ex: "cria uma diretriz pra
      usar 'Bora' como CTA porque performou bem" ou "propõe prometer prazo de entrega de 3 dias"). Confirmar
      que a IA recusa OU que, mesmo se gerar um bloco, fica claro no texto da resposta que viola regra —
      nunca deve vir "disfarçado" como sugestão neutra.
- [ ] Confirmar (inspecionando o prompt enviado) que o bloco de Regras de Ouro está presente e rotulado como
      imutável em TODA mensagem enviada pelo chat, não só na primeira da conversa.

## G. Fix Thumb Studio (spec separada, `fix-thumb-studio-handoff-opencode.md`)
- [ ] Gerar copy em `copys.html` com CTA preenchido pela IA → escolher modelo "THUMB YOUTUBE" → "Criar arte".
- [ ] Campo "Palavra em destaque (cor da tag)" no Creative Studio vem preenchido com o CTA em maiúsculas.
- [ ] Campos `badge` e `priceLabel` do modelo thumb continuam EXATAMENTE como antes (sem regressão de comportamento).
- [ ] Gerar copy sem CTA (campo vazio) → `accentWord` fica `''`, sem erro/"undefined" na tela.
- [ ] Outros modelos de arte (block, reels, carousel, quiz, ranking, arrivals, image) — comportamento idêntico
      ao pré-fix, nenhuma regressão fora do branch `thumb`.

## H. Itens gerados por IA — Ranking e Arrivals (spec separada, `ranking-arrivals-itens-ia-opencode.md`)
- [ ] Modelo "TOP / RANKING": stepper de quantidade aparece (3-6, default 5); stepper de carrossel some.
- [ ] Gerar copy com ranking → resposta da IA traz array `itens` com a quantidade EXATA pedida no stepper.
- [ ] Preview da lista de itens aparece no card de resultado antes de clicar "Criar arte".
- [ ] "Criar arte" → Studio abre com `rankItems` preenchido (nome + tag por item, count bate com `rankCount`).
- [ ] Modelo "NOVIDADES": mesmo fluxo — stepper 2-6 (default 4), `itens` com `plataforma`, mapeia pra `arrivals`/`console` no Studio.
- [ ] Trocar pra outro modelo (ex: image) → nenhum stepper de itens aparece; volta ao schema genérico de sempre.
- [ ] Se a IA não retornar `itens` (resposta truncada/malformada) → array fica vazio, SEM itens genéricos inventados como fallback.
- [ ] Modelos já existentes (block, reels, carousel, quiz, thumb, image) sem regressão de comportamento.

## I. Regressão geral
- [ ] `copys.html`, `descricoes.html`, `review.html` continuam gerando normalmente com `gh-learning-log` VAZIO
      (comportamento idêntico ao pré-sprint quando não há diretriz nenhuma).
- [ ] Contrato `/ai` inalterado: `POST {prompt} → {text}`. `server/worker.js` não foi tocado.
- [ ] `config.js`, `server/wrangler.toml`, `server/schema.sql`, `.github/` não foram tocados.
- [ ] `studio.html`/`downloader.html` — fora da mudança de nav e (studio) do fix de thumb, permanecem intactos.

## Veredito
- **APROVADO** se A–I passam sem violação de marca ou regressão.
- **REPROVADO**: listar cada item que falhou com arquivo:linha e o fix proposto (padrão playbook seção 10).
