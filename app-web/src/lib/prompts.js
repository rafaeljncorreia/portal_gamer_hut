/* ============================================================
   GAMER HUT — Construtores de prompt (aprofundamento campaign-centric)
   ------------------------------------------------------------
   Portados de copys.html / descricoes.html, mas alimentados pelo
   CONTEXTO DO BRIEF (produto + geração + pilar + tema + ângulo).
   A voz da GH vem de getBrandVoice(); ver DIRETRIZ-PLATAFORMA.md §3.
   ============================================================ */
import { getBrandVoice, generations } from './gh.js'

/** Extrai o primeiro objeto JSON de uma resposta (tolera ```json, ruído e multiline). */
export function extractJSON(text) {
  if (!text) return null
  let t = String(text).replace(/```json|```/g, '').trim()
  // Tenta dar parse direto
  try { return JSON.parse(t) } catch { /* segue */ }
  // Isola o primeiro { … } completo
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s >= 0 && e > s) t = t.slice(s, e + 1)
  // Sanitiza quebras de linha dentro de strings (AI às vezes gera JSON multi-linha inválido)
  const sanitized = t.replace(/\n\s*/g, '')
  try { return JSON.parse(sanitized) } catch { /* segue */ }
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

/** Normaliza chave de plataforma: instagram_feed/reels → instagram (para getBrandVoice). */
function platNormalize(p) {
  if (p === 'instagram_feed' || p === 'instagram_reels') return 'instagram'
  return p
}

/** Mapa de campos relevantes por template (fonte: Creative Studio app/data.jsx + panel.jsx).
 *  Os IDs (_keys) devem bater exatamente com os usados no Studio (template, memeMode, quizMode). */
const TEMPLATE_CAMPOS = {
  carousel:  'badge, eyebrow, title, subtitle, footer, cta, pages[{title,body}]',
  block:     'eyebrow, title, subtitle, badge, cta, footer, priceLabel',
  image:     'eyebrow, title, subtitle, priceLabel',
  reels:     'eyebrow, title, subtitle, badge, footer',
  thumb:     'badge, eyebrow, title, accentWord, priceLabel',
  meme:      'memeTop / memeBot(memeMode:classic) · memeCaption / memeBot(reaction) · memeTop / aLabel / bLabel / vsWord(dual)',
  quiz:      'eyebrow, question, quizOptions[](memeMode:pergunta) · eyebrow, question, aLabel, bLabel, vsWord(esseou)',
  ranking:   'eyebrow, title, rankItems[{name,note}]',
  arrivals:  'eyebrow, title, arrivals[{name,console}]',
}

/** Formata campos preenchidos do template para contexto do prompt. */
function camposContexto(campos) {
  if (!campos || typeof campos !== 'object') return ''
  const entries = Object.entries(campos)
    .filter(([k, v]) => v && !['hashtags', 'quizOptions', 'rankItems', 'arrivals', 'pages'].includes(k))
  if (!entries.length) return ''
  return 'CONTEÚDO DA ARTE (referência para o roteiro/descrição):\n' +
    entries.map(([k, v]) => '- ' + k + ': ' + (Array.isArray(v) ? v.join(', ') : v)).join('\n')
}

/** Prompt de ARTE (conteúdo para template visual). Saída universal de campos. */
export function promptArte({ gen, plataforma, tom, template, produto, tema, angulo, extra }) {
  const genVoice = getBrandVoice(gen, platNormalize(plataforma), tom)
  const genLabel = genLabelDe(gen)
  const tpl = template || 'block'
  const campos = TEMPLATE_CAMPOS[tpl] || TEMPLATE_CAMPOS.block
  return `${genVoice}

---
TAREFA: Use o branding book acima como base obrigatória de tom de voz. Gere conteúdo para arte de template visual da Gamer Hut.

PÚBLICO-ALVO DESTA ARTE: ${genLabel}

Crie 3 variações de conteúdo para um template visual, seguindo a identidade da marca.
Tom de voz pedido: ${tom}
Template: ${tpl}
${plataforma ? 'Plataforma: ' + plataforma + '\n' : ''}Briefing da arte: ${briefingDe({ tema, angulo, extra })}
${produtoContexto(produto)}

Campos relevantes do template (${tpl}): ${campos}

Regras:
- PÚBLICO-ALVO (${genLabel}): respeite o contexto geracional acima — vocabulário, tom, comprimento, hooks e CTAs
- Título (title) curto e forte (máx ~6 palavras)
- Subtítulo (subtitle) de apoio ao título, 1 frase
- Eyebrow/categoria curta, 1-2 palavras
- CTA final simples e natural ("Garanta o seu", "Já garantiu?", etc.)
- Badge/selo de 1-2 palavras se aplicável
- Emojis com moderação (0 a 3 por variação)
- Não repita o mesmo ângulo nas 3 variações (uma mais nostálgica, uma mais direta/comercial, uma mais hype)
- Preencha APENAS os campos relevantes ao template informado — os demais deixe vazio (string vazia)
- Português do Brasil

Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:
{"variacoes":[{"eyebrow":"","title":"","subtitle":"","badge":"","cta":"","footer":"","priceLabel":"","accentWord":"","memeTop":"","memeBot":"","memeCaption":"","question":"","quizOptions":[],"hashtags":[]}]}`
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

/** Prompt de DESCRIÇÃO por canal (JSON {texto,title}). */
export function promptDescricao({ gen, plataforma, tom, titulo, produto, tema, angulo, extra }) {
  const genVoice = getBrandVoice(gen, platNormalize(plataforma), tom)
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
    (extra ? '- Alinhe a descrição com o contexto da arte informado no briefing adicional\n' : '') +
    '\nResponda SOMENTE com JSON válido, sem texto fora dele, neste formato:\n' +
    '{"texto":"descrição completa formatada para a plataforma","title":"título otimizado"}'
}

/** Prompt de ROTEIRO de vídeo curto (gancho + cenas + CTA + descricao_video). */
export function promptRoteiro({ gen, plataforma, tom, produto, tema, angulo, campos, extra }) {
  const genVoice = getBrandVoice(gen, platNormalize(plataforma), tom)
  const genLabel = genLabelDe(gen)
  const ctxCampos = camposContexto(campos)
  return `${genVoice}

---
TAREFA: Use o branding book acima como base obrigatória de tom de voz. Crie um roteiro de vídeo curto para a Gamer Hut.

PÚBLICO-ALVO DESTE VÍDEO: ${genLabel}
Tom de voz pedido: ${tom}
${plataforma ? 'Plataforma: ' + plataforma + '\n' : ''}Briefing do roteiro: ${briefingDe({ tema, angulo, extra })}
${produtoContexto(produto)}
${ctxCampos ? ctxCampos + '\n' : ''}
Regras:
- Gancho forte nos primeiros 3 segundos — pare o scroll
- Ritmo rápido, cenas curtas (3-7s cada)
- Até 60 segundos de duração total
- Fala em português do Brasil, natural e conversacional
- Descreva elementos visuais (sobreposições, cortes, B-roll) no campo "descricao" de cada cena
- A fala (over/narrada) vai no campo "fala" de cada cena
- CTA final claro alinhado ao pilar da marca
${ctxCampos ? '- Referencie os campos de conteúdo da arte no roteiro para manter coerência visual\n' : ''}
- Se houver descricao_video, otimize para descoberta na plataforma (SEO YouTube, trending TikTok)
- IMPORTANTE: JSON deve ser UMA ÚNICA LINHA — use \\n dentro das strings para representar quebras de linha

Responda SOMENTE com JSON válido em UMA ÚNICA LINHA, sem texto fora dele, neste formato exato:
{"gancho":"texto","cenas":[{"cena":1,"descricao":"texto","fala":"texto","tempo":"5s"}],"cta_final":"texto","duracao":"30s","descricao_video":"texto"}`
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
