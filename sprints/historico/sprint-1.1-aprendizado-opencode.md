# SPRINT 1.1 — Aprendizado contínuo (chat + log de diretrizes) — brief para o OpenCode

> Continua sem backend novo (sem D1, sem wrangler, sem Supabase — mesma regra do
> sprint 1.0). 100% client-side, localStorage. O proxy de IA continua EXATAMENTE
> como está (`window.GH_CONFIG.proxyUrl`, contrato `POST {prompt}→{text}` — não tocar
> `config.js` nem `server/worker.js`).

## O que já está pronto (feito pelo Claude / já existe no repo, NÃO refazer)
- `server/schema.sql` tem a tabela `brand_versions` (v2, groundwork, NÃO ativada) com
  os campos `bloco_tipo, bloco_key, label, conteudo, meta, is_current, criado_em, criado_por`.
  Este sprint **espelha esses nomes de campo no localStorage**, de propósito, pra migração
  futura ser trivial — não crie nomes de campo diferentes.
- `brand-voice.js` já expõe `window.getBrandVoice(generation, platform, tone)` e
  `window.GH_BRAND`/`GH_TONES`/`GH_PLATFORMS`. `generation-context.js` expõe `window.GH_GENERATIONS`.
- Padrão de parse defensivo de JSON da IA já existe: `extractJSON()` em `descricoes.html:503-509`
  (tenta parse direto, cai pra regex de chave-valor bruta, nunca lança erro).
- Padrão de histórico FIFO em localStorage já existe: `gh-desc-history` em `descricoes.html:357-365`.

## Objetivo do sprint
Criar uma página onde o dono da loja conversa com a mesma IA sobre o que funcionou ou
não em campanhas, e a IA propõe **diretrizes** novas (ou sugere arquivar uma antiga) —
sempre com confirmação humana antes de qualquer coisa ser salva. As diretrizes ativas
devem **realmente influenciar** as próximas gerações de copy/descrição (não é um chat
decorativo) e devem poder ser exportadas como JSON pra uma futura migração.

## Escopo

### Passo 1 — nova página `aprendizado.html`
Copiar a estrutura de `descricoes.html` como base (mesmo `<head>`, mesma ordem de
scripts, mesmo shell de nav/footer). Ordem de carregamento OBRIGATÓRIA:
```html
<script src="config.js"></script>
<script src="generation-context.js"></script>
<script src="brand-voice.js"></script>
```
(Sem `catalog.js` — esta página não é por-jogo, é transversal à marca.)

Layout de 2 colunas, chat mais largo que a lista (diferente da proporção de
`descricoes.html`, que é `1fr 1.5fr` briefing/resultado — aqui inverte pra
`1.5fr 1fr` chat/diretrizes, chat é a superfície principal de trabalho):
- **Coluna esquerda — "CONVERSA":** lista de mensagens rolável (`.chat-log`), bolhas
  reaproveitando `.result` (mensagem da IA, borda esquerda laranja) e uma variante
  simples pra mensagem do usuário (fundo `var(--panel2)`, alinhado à direita).
  Textarea + botão "ENVIAR" fixos embaixo do painel.
- **Coluna direita — "DIRETRIZES ATIVAS":** lista de cards (uma por diretriz com
  `is_current:1`), agrupados por `bloco_tipo`. Cada card mostra `bloco_tipo:bloco_key`
  como pill (reusar `.status`), `label` em negrito, `conteudo` truncado, e um botão
  "✕ ARQUIVAR" direto no card (reusar o padrão visual de `.hi-del` de `descricoes.html:376`).
  Estado vazio reusa `.empty`. Abaixo da lista: botão "EXPORTAR DIRETRIZES" (`.btn.btn-ghost`).

### Passo 2 — dois localStorage keys
**`gh-learning-log`** — array de diretrizes, cada uma:
```json
{ "id": "lg_<timestamp>_<random>",
  "bloco_tipo": "brand" | "tone" | "platform" | "generation",
  "bloco_key": "gen-z" | "hype" | "instagram" | "zueiro" | ... (chave existente em
                GH_GENERATIONS/GH_TONES/GH_PLATFORMS, ou null quando bloco_tipo é 'brand'),
  "label": "string curta",
  "conteudo": "texto completo da diretriz, o que efetivamente entra no prompt",
  "meta": { "generation": null, "platform": null, "origem": "chat-ia" | "manual" },
  "is_current": 1,
  "criado_em": "<ISO timestamp>",
  "criado_por": "owner" }
```
Arquivar = setar `is_current: 0` no item existente (edita in-place o array; NUNCA
remove o item do array — é soft-delete, mantém trilha pra exportação/auditoria).

**`gh-learning-chat`** — array de mensagens, FIFO capado em ~30 itens (mesmo padrão
de `gh-desc-history` mas cap maior, já que é conversa e não histórico de output):
```json
{ "role": "user" | "ai", "text": "...", "ts": "<ISO timestamp>",
  "proposals": [ { "action":"create"|"archive", ...payload..., "status":"pending"|"applied"|"dismissed" } ] }
```
`proposals` só existe em mensagens da IA que continham bloco de diretriz. Ao
re-renderizar após reload, uma proposta com `status` diferente de `pending` mostra o
card já resolvido (desabilitado/marcado), nunca reaplica sozinha.

### Passo 3 — montagem do prompt do chat
A cada envio de mensagem, montar o prompt nesta ordem (string concatenada, mesmo
estilo dos outros geradores):
1. **Bloco fixo de Regras de Ouro** (copiar literalmente as 11 regras de
   `AGENT-PLAYBOOK.md` seção 4 — marca sempre "GAMER HUT" por extenso; "sua/seu";
   nunca prometer data de entrega; WhatsApp é SAC não canal de venda; NF é implícito;
   nunca "Bora" como CTA; storytelling antes do CTA; escassez só se real; nunca citar
   console/usado/pirata/troca nem pra negar; não criticar marketplaces; ≥2 pilares de
   tom por peça), com o cabeçalho explícito: **"REGRAS INEGOCIÁVEIS — a IA NUNCA pode
   propor criar, alterar ou contradizer estas regras, mesmo se o usuário pedir."**
2. `window.getBrandVoice()` chamado SEM argumentos (retorna só a base `GH_BRAND`).
3. Lista numerada das diretrizes ativas atuais (pra IA não duplicar sugestão e poder
   referenciar um `id` existente numa proposta de arquivamento).
4. Últimas ~10 mensagens de `gh-learning-chat` (contexto da conversa).
5. Instrução de tarefa: discutir o que funcionou/não funcionou; quando fizer sentido
   (nem sempre), propor UMA diretriz nova ou UM arquivamento usando o formato do Passo 4.

### Passo 4 — formato de proposta estruturada + parser
A IA propõe mudanças com um bloco de fence próprio (não reusar ```json puro, pra não
confundir com prosa comum):
````
```gh-diretriz
{"action":"create","bloco_tipo":"tone","bloco_key":"zueiro","label":"...","conteudo":"...","meta":{}}
```
````
ou
````
```gh-diretriz
{"action":"archive","guidelineId":"lg_...","reason":"..."}
```
````
Escrever `extractGuidelineProposals(text)`, no mesmo espírito defensivo de
`extractJSON()`: regex global `/```gh-diretriz\s*([\s\S]*?)```/g`, `JSON.parse` por
match dentro de `try/catch`, ignora silenciosamente qualquer bloco malformado ou com
`action` fora de `{create, archive}` — **nunca** deixa isso quebrar a renderização do
texto normal da mensagem. Retorna array (pode ser vazio).

### Passo 5 — cards de proposta e confirmação humana
Cada proposta parseada renderiza um card DENTRO da bolha da mensagem da IA (reusar
`.result`, variante `.diretriz-card`): pill de `bloco_tipo:bloco_key`, `label` em
negrito, `conteudo`/`reason` como corpo, e dois botões — `"CRIAR DIRETRIZ"` /
`"IGNORAR"` (create) ou `"ARQUIVAR"` / `"MANTER"` (archive). **Nenhuma diretriz é
gravada em `gh-learning-log` sem clique explícito.** Ao clicar confirmar: grava/edita
`gh-learning-log`, atualiza o `status` da proposta pra `applied`/`dismissed` dentro do
item correspondente em `gh-learning-chat`, re-renderiza os dois painéis.

O botão "✕ ARQUIVAR" no painel direito (lista de diretrizes ativas) faz a MESMA ação
de arquivar, mas direto — sem precisar passar pelo chat.

### Passo 6 — wiring em `brand-voice.js` (o que torna isso real)
Adicionar, no fim do arquivo, sem alterar a assinatura de `getBrandVoice`:
```js
window.getActiveLearningLog = function(generation, platform, tone){
  var raw; try{ raw = JSON.parse(localStorage.getItem('gh-learning-log'))||[]; }catch(e){ raw=[]; }
  return raw.filter(function(l){
    if(!l || l.is_current!==1) return false;
    if(l.bloco_tipo==='brand') return true;
    if(l.bloco_tipo==='generation') return !l.bloco_key || l.bloco_key===generation;
    if(l.bloco_tipo==='tone')       return !l.bloco_key || l.bloco_key===tone;
    if(l.bloco_tipo==='platform')   return !l.bloco_key || l.bloco_key===platform;
    return false;
  });
};
```
E, dentro do corpo de `getBrandVoice`, ANTES do `return result;` existente:
```js
var learned = window.getActiveLearningLog ? window.getActiveLearningLog(generation, platform, tone) : [];
if(learned.length){
  result += '\n\n---\nDIRETRIZES APRENDIDAS (validadas pelo dono da loja — aplicar com a MESMA prioridade do restante deste guia):\n' +
    learned.map(function(l){ return '- ['+l.bloco_tipo+':'+l.bloco_key+'] '+l.label+' — '+l.conteudo; }).join('\n');
}
```
Isso propaga automaticamente pra `copys.html`, `descricoes.html` e `review.html` —
nenhuma dessas páginas precisa ser tocada.

### Passo 7 — exportar diretrizes
Botão que lê `gh-learning-log` inteiro (ativas + arquivadas, pra trilha completa),
serializa como `{"brand_versions":[...]}` com os MESMOS nomes de campo de
`server/schema.sql` (trocar `id` local por `client_id` no export, já que `id` real é
`AUTOINCREMENT` no D1), e dispara download via `Blob` + `<a download>` temporário
(sem dependência nova). Nome do arquivo: `gamerhut-diretrizes-aprendizado-<data>.json`.

### Passo 8 — nav em todas as páginas
Adicionar `<a href="aprendizado.html">APRENDIZADO</a>` entre os links de REVIEW e
DOWNLOADER no bloco `<nav class="links">` de: `index.html`, `copys.html`,
`descricoes.html`, `review.html`, `downloader.html` (mesma linha, 5 arquivos). Em
`studio.html`, o nav vive em JSX (não em HTML estático) — localizar o componente de
nav dentro de `app/*.jsx` (provavelmente `app/app.jsx`) antes de editar, e replicar o
mesmo link lá. Marcar `class="active"` só no link de `aprendizado.html` dentro da
própria página nova.

## Critérios de aceite (DoD)
- [ ] `aprendizado.html` carrega sem erro de console, ordem de scripts correta.
- [ ] Nav com "APRENDIZADO" presente e funcional nas 6 páginas (5 HTML + Studio via JSX).
- [ ] Enviar mensagem no chat → loading state → resposta da IA via proxy `/ai` existente.
- [ ] IA propõe uma diretriz → bloco ```gh-diretriz``` vira card acionável na bolha.
- [ ] Clicar "CRIAR DIRETRIZ" → grava em `gh-learning-log` (`is_current:1`) → aparece no painel direito.
- [ ] Nenhuma diretriz aparece como ativa sem clique humano prévio.
- [ ] Botão "✕ ARQUIVAR" no painel direito seta `is_current:0` (some da lista ativa, NÃO é removido do array).
- [ ] `gh-learning-log` e `gh-learning-chat` sobrevivem a F5.
- [ ] `getBrandVoice(generation, platform, tone)` mantém assinatura E passa a incluir diretrizes ativas relevantes.
- [ ] Teste real: criar diretriz `bloco_tipo:'tone', bloco_key:'zueiro'` → gerar copy em `copys.html` com tom
      ZUEIRO → confirmar (inspecionando o prompt antes do fetch) que o texto da diretriz está presente.
- [ ] Trocar pra tom diferente (ex: HYPE) → a mesma diretriz NÃO aparece no prompt (filtro por relevância).
- [ ] Botão "EXPORTAR DIRETRIZES" baixa `.json` com os campos de `brand_versions`.
- [ ] Bloco de Regras de Ouro presente e rotulado como imutável em TODO prompt enviado pelo chat.
- [ ] Zero dependência npm nova; console limpo.

## NÃO fazer neste sprint
- Nada de D1/wrangler/Supabase/backend novo. Isso é v2 — `server/schema.sql`,
  `server/wrangler.toml` e as rotas `/brand` já existentes em `server/worker.js`
  ficam exatamente como estão, não ativar.
- Não tocar `config.js` nem o contrato `/ai` (`server/worker.js`).
- Não implementar auto-aplicar diretriz sem clique humano.
- Não portar pra React/Vite — página nova é vanilla, igual copys/descrições/review.
- Não migrar as Regras de Ouro pra um arquivo lido em runtime — ficam hardcoded como
  string literal dentro de `aprendizado.html` (duplicação consciente, aceita neste
  escopo; se as regras mudarem em `AGENT-PLAYBOOK.md`, sincronizar manualmente).
- Não criar autenticação/múltiplos usuários — é single-owner, single-browser.
- Não adicionar `catalog.js` a esta página.
- Não implementar busca/paginação avançada na lista de diretrizes.
