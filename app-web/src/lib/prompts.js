/* ============================================================
   GAMER HUT — Construtores de prompt (aprofundamento campaign-centric)
   ------------------------------------------------------------
   Portados de copys.html / descricoes.html, mas alimentados pelo
   CONTEXTO DO BRIEF (produto + geração + pilar + tema + ângulo).
   A voz da GH vem de getBrandVoice(); ver DIRETRIZ-PLATAFORMA.md §3.
   ============================================================ */
import { getBrandVoice, generations } from './gh.js'

/** Extrai o primeiro objeto JSON de uma resposta (tolera ```json e ruído). */
export function extractJSON(text) {
  if (!text) return null
  const t = String(text).replace(/```json|```/g, '').trim()
  try { return JSON.parse(t) } catch { /* segue */ }
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s >= 0 && e > s) { try { return JSON.parse(t.slice(s, e + 1)) } catch { /* segue */ } }
  return null
}

/** Bloco de contexto do produto vindo do catálogo. Igual ao dos geradores legados. */
export function produtoContexto(p) {
  if (!p) return ''
  return 'CONTEXTO DO PRODUTO (fonte: catálogo GH):\n' +
    '- Nome: ' + p.nome + '\n' +
    '- Status: ' + (p.status_label || '—') + '\n' +
    '- Plataformas: ' + (p.plataformas || '—') + '\n' +
    '- Onde vende: ' + (p.onde_vende || '—') + '\n' +
    '- Data de lançamento: ' + (p.data_lancamento || '—') + '\n' +
    (p.data_pre_venda ? '- Pré-venda desde: ' + p.data_pre_venda + '\n' : '') +
    '- Pilar sugerido: ' + (p.pilar_sugerido || '—') + '\n' +
    '- Geração alvo: ' + (p.geracao_alvo || '—') + '\n' +
    '- Exclusividade GH: ' + (p.exclusividade_gh || '—') + '\n' +
    (p.divulgacao_inicio ? '- Janela de divulgação: ' + p.divulgacao_inicio + ' a ' + (p.divulgacao_fim || '?') + '\n' : '')
}

function genLabelDe(gen) {
  const g = generations()[gen]
  return g ? g.full : 'Gamer geral'
}

function briefingDe({ tema, angulo, extra }) {
  return [tema && ('Tema da campanha: ' + tema), angulo && ('Ângulo: ' + angulo), extra && extra]
    .filter(Boolean).join('\n') || '—'
}

/** Prompt de COPY (3 variações JSON). Portado do modelo simples de copys.html. */
export function promptCopy({ gen, plataforma, tom, produto, tema, angulo, extra }) {
  const genVoice = getBrandVoice(gen, plataforma, tom)
  const genLabel = genLabelDe(gen)
  return `${genVoice}

---
TAREFA: Use o branding book acima como base obrigatória de tom de voz e estrutura. Escreva como a Gamer Hut escreveria.

PÚBLICO-ALVO DESTE POST: ${genLabel}

Crie 3 variações de copy para um post, seguindo a Fórmula de copy (gancho → jogo → diferencial → info comercial → CTA que pergunta algo).
Tom de voz pedido: ${tom}
${plataforma ? ('Plataforma: ' + plataforma + '\n') : ''}Briefing do post: ${briefingDe({ tema, angulo, extra })}
${produtoContexto(produto)}
Regras:
- PÚBLICO-ALVO (${genLabel}): respeite o contexto geracional acima — vocabulário, tom, comprimento, hooks e CTAs.
- Comece pelo nome do jogo quando ele for o foco.
- Título curto e forte (máx ~6 palavras), nunca longo demais para arte.
- Legenda de 2 a 4 frases, calorosa e específica ao briefing.
- CTA final simples, de preferência perguntando algo ("Já garantiu o seu?", "Vai jogar?").
- Emojis com moderação (0 a 3 por legenda).
- Não repita o mesmo ângulo nas 3 variações (uma mais nostálgica, uma mais direta/comercial, uma mais hype).
- Português do Brasil.

Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{"titulo":"chamada curta","legenda":"legenda de 2-4 frases","cta":"chamada para ação curta","hashtags":["5 a 7 hashtags sem #, sem espaços"]}]}`
}

const REGRAS_PLATAFORMA = {
  youtube:
    'Regras YouTube:\n' +
    '- Descrição LONGA (200-500 palavras) com parágrafo introdutório, análise do conteúdo, seção de links\n' +
    '- SEO keywords no primeiro parágrafo e dispersas no texto\n' +
    '- Bloco "📦 Compre na Gamer Hut:" com espaço para o link do produto\n' +
    '- Hashtags no final (5-10)\n' +
    '- Fechar com "🔔 Inscreva-se no canal e ative o sininho!"\n',
  tiktok:
    'Regras TikTok (ESTRUTURA OBRIGATÓRIA DE 5 BLOCOS):\n' +
    '- Bloco 1 (1ª linha): uma ideia forte ou emoção que capture a atenção.\n' +
    '- Bloco 2 (Contexto): 1-2 frases curtas posicionando o assunto.\n' +
    '- Bloco 3 (Pergunta): uma pergunta direta para fomentar comentários.\n' +
    '- Bloco 4 (Comercial): info comercial (pré-venda, disponibilidade, mídia física) com CTA ("Garanta o seu", "Pré-venda liberada", "Link na Bio"). NUNCA use "Bora".\n' +
    '- Bloco 5 (Hashtags): 3-5 trending hashtags.\n' +
    '- Tom direto, conversational, sem enrolação.\n',
  instagram:
    'Regras Instagram:\n' +
    '- Descrição MÉDIA (100-250 palavras)\n' +
    '- Storytelling com gancho emocional\n' +
    '- Tom de comunidade e pertencimento\n' +
    '- 5-10 hashtags segmentadas\n' +
    '- CTA nos comentários\n',
}

/** Prompt de DESCRIÇÃO por canal (JSON {texto,title}). Portado de descricoes.html. */
export function promptDescricao({ gen, plataforma, tom, titulo, produto, tema, angulo, extra }) {
  const genVoice = getBrandVoice(gen, plataforma, tom)
  const genLabel = genLabelDe(gen)
  const regras = REGRAS_PLATAFORMA[plataforma] || REGRAS_PLATAFORMA.instagram
  return genVoice +
    '\n\n---\nTAREFA: Gere uma descrição padronizada e otimizada para a plataforma especificada. Use o branding book acima como base de tom.\n' +
    'PÚBLICO-ALVO: ' + genLabel + '\n' +
    'Plataforma: ' + String(plataforma).toUpperCase() + '\n' +
    'Título: ' + (titulo || produto?.nome || tema || '—') + '\n' +
    'Briefing: ' + briefingDe({ tema, angulo, extra }) + '\n' +
    produtoContexto(produto) +
    '\n' + regras +
    '\nRegras gerais:\n' +
    '- Respeite o contexto geracional (' + genLabel + ') — vocabulário, tom, comprimento\n' +
    '- Português do Brasil\n' +
    '- Descreva o conteúdo de forma que engaje o público-alvo da plataforma\n' +
    '\nResponda SOMENTE com JSON válido, sem texto fora dele, neste formato:\n' +
    '{"texto":"descrição completa formatada para a plataforma","title":"título otimizado"}'
}

/** Prompt de ESTRATÉGIA (plano de divulgação em markdown, não JSON). */
export function promptEstrategia({ gen, produto, tema, angulo, pilar, canais }) {
  const genVoice = getBrandVoice(gen)
  const genLabel = genLabelDe(gen)
  const lista = (canais && canais.length ? canais : ['instagram', 'tiktok', 'youtube']).join(', ')
  return genVoice +
    '\n\n---\nTAREFA: Monte um PLANO DE DIVULGAÇÃO enxuto e acionável para esta campanha da Gamer Hut. Use o branding acima como base de tom e prioridades.\n' +
    'PÚBLICO-ALVO: ' + genLabel + '\n' +
    (pilar ? 'Pilar de conteúdo: ' + pilar + '\n' : '') +
    (tema ? 'Tema/ângulo: ' + tema + '\n' : '') +
    (angulo ? 'Observações do brief: ' + angulo + '\n' : '') +
    'Canais a usar: ' + lista + '\n' +
    produtoContexto(produto) +
    '\nEntregue em MARKDOWN, conciso, nesta estrutura:\n' +
    '## Objetivo (1 frase)\n' +
    '## Por canal\n' +
    'Para CADA canal listado: formato(s) recomendado(s), frequência sugerida e 1 ângulo de conteúdo específico do público-alvo.\n' +
    '## Sequência sugerida\n' +
    'Ordene as peças ao longo da janela de divulgação do produto (use as datas do contexto quando houver).\n' +
    'Seja direto e específico do jogo/produto. Português do Brasil. NÃO invente datas fora da janela informada.'
}
