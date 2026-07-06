# QA — Sprint 1.0 (Geradores catálogo-aware)

> Para o QA Agent. Base: `AGENT-PLAYBOOK.md` (seções 8 = código, 9 = copy). Este arquivo adiciona
> os itens VERIFICÁVEIS específicos do sprint. Revise o que o OpenCode entregou em
> `copys.html` e `descricoes.html` + os arquivos `catalog.json` / `catalog.js`.

## Ambiente
```
cd C:\Users\Joao\OneDrive\Desktop\Portal-Gamer-Hut
python -m http.server 8080
# Abrir http://localhost:8080/copys.html  (Ctrl+F5 = hard refresh)
```

## A. Código — carregamento e integridade
- [ ] `catalog.js` incluído em `copys.html` E `descricoes.html`, NA ORDEM: `config.js` →
      `generation-context.js` → `brand-voice.js` → `catalog.js` → App.
- [ ] `window.GH_CATALOG` existe no console; `GH_CATALOG.load()` resolve com 22 jogos.
- [ ] Zero dependência npm nova; continua vanilla/CDN. Nada de build.
- [ ] Console (F12) limpo: sem erros/warnings ao abrir e ao escolher jogo.
- [ ] `catalog.json` não foi editado à mão pelo OpenCode (é snapshot gerado pelo Claude).

## B. Seletor de jogo (comportamento)
- [ ] Existe o seletor de jogo no topo do gerador; default lista os `DIVULGAR = CONFIRMADO`
      (`GH_CATALOG.paraDivulgar()`), com opção "ver todos".
- [ ] Cada opção mostra nome + status_label + plataformas.
- [ ] Escolher um jogo seta `activeGen` = `geracao_key` e reflete no switch geracional visual.
- [ ] Escolher um jogo seta `activeTone` = `tom_sugerido` e reflete no seletor de tom.
- [ ] `localStorage 'gh-generation'` persiste a geração após escolher jogo (F5 mantém).
- [ ] Fluxo ANTIGO intacto: dá pra gerar SEM escolher jogo, como antes.

## C. Status derivado — casos de teste exatos (hoje = 2026-07-01)
Verificar o `status_label` que aparece por jogo:
- [ ] **R-Type** → "À venda" (lançou 2026-06-18, vende em marketplaces).
- [ ] **Rayman 30 Anniversary** e **Monopoly Star Wars** → "À venda".
- [ ] **Silent Hill Townfall** / **Control 2 Resonant** → "Pré-venda" (lança em set/2026).
- [ ] **Assassin's Creed Black Flag** → "Pré-venda" (lança 2026-07-09).
- [ ] **Hollow Knight**, **Silksong**, **Godzilla**, **Barbie Rewind** → "Não vende (ainda)"
      (onde_vende = "Indisponível ainda").

## D. Contexto real no prompt (o pulo do gato)
- [ ] Ao gerar com um jogo selecionado, o prompt enviado ao proxy inclui um bloco de
      "CONTEXTO DO PRODUTO" com dados reais do catálogo (status, onde vende, datas, pilar).
- [ ] Gerar para **R-Type**: a copy trata como JÁ DISPONÍVEL (não "pré-venda") e cita plataformas reais (PS5, SW).
- [ ] Gerar para **Silent Hill Townfall**: copy trata como PRÉ-VENDA; tom Hype coerente com o pilar "Drop & Lançamento".
- [ ] Contrato do proxy `/ai` inalterado: `POST {prompt} → {text}`. Proxy Cloudflare NÃO foi tocado.

## E. Marca (rodar seção 9 do playbook na copy gerada)
- [ ] "GAMER HUT" por extenso; "sua/seu"; sem data de entrega; sem "Bora"; storytelling antes do CTA.
- [ ] Sem menção a console/usado/pirata/troca. Escassez só se real.
- [ ] Geração-alvo respeitada: peça de jogo com `geracao_alvo` "Gen X" NÃO usa gíria Gen Z.
- [ ] CTA coerente com o pilar do jogo (ex: "Pré-venda liberada" p/ Drop & Lançamento).

## F. Regressão
- [ ] `descricoes.html` também recebeu o seletor e funciona igual.
- [ ] Alternar Gen Z / Millennial / Gen X manualmente ainda funciona sem quebrar UI.
- [ ] Nenhum arquivo fora do escopo do sprint foi alterado (studio/review/downloader intactos).

## Veredito
- **APROVADO** se A–F passam sem violação de marca.
- **REPROVADO**: listar cada item que falhou com arquivo:linha e o fix proposto (padrão playbook seção 10).
