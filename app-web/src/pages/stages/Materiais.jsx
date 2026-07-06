import { useState } from 'react'
import { gerar, tones } from '../../lib/gh.js'
import { promptArte, promptDescricao, promptRoteiro, extractJSON } from '../../lib/prompts.js'

const PLATS = [
  { key: 'instagram_feed',  label: 'Instagram Feed',  video: false },
  { key: 'instagram_reels', label: 'Instagram Reels', video: true  },
  { key: 'tiktok',          label: 'TikTok',          video: true  },
  { key: 'youtube',         label: 'YouTube',         video: true  },
]

const TEMPLATES = [
  { id:'carousel', label:'CARROSSEL',      note:'3–5 páginas' },
  { id:'block',    label:'POST BLOCADO',   note:'Tipografia forte' },
  { id:'image',    label:'C/ IMAGEM',      note:'Texto + imagem' },
  { id:'quiz',     label:'QUIZ',           note:'Pergunta ou esse/ou' },
  { id:'ranking',  label:'RANKING',        note:'Lista numerada' },
  { id:'arrivals', label:'NOVIDADES',      note:'Grade de novidades' },
  { id:'thumb',    label:'THUMB YT',       note:'Capa de vídeo' },
  { id:'reels',    label:'CAPA REELS',     note:'Safe zone 4:5' },
  { id:'meme',     label:'MEME',           note:'Clássico/Reaction/Dual' },
]

const TAGS = [
  { id:'noticias',   label:'Notícias' },
  { id:'pre-venda',  label:'Pré-venda' },
  { id:'restoque',   label:'Restoque' },
  { id:'lancamento', label:'Lançamento' },
  { id:'preview',    label:'Preview' },
  { id:'trailer',    label:'Trailer' },
  { id:'review',     label:'Review' },
  { id:'quiz',       label:'Quiz' },
]

const MEME_MODES = [
  { id:'classic',  label:'Clássico' },
  { id:'reaction', label:'Reaction' },
  { id:'dual',     label:'Dual' },
]

const QUIZ_MODES = [
  { id:'pergunta', label:'Pergunta' },
  { id:'esseou',   label:'Esse ou Aquele' },
]

function camposDoTemplate(tpl, memeMode, quizMode) {
  const MAP = {
    block: [
      { key:'badge', label:'Badge', type:'text' },
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'subtitle', label:'Subtítulo', type:'text' },
      { key:'cta', label:'CTA', type:'text' },
      { key:'footer', label:'Footer', type:'text' },
      { key:'priceLabel', label:'Preço', type:'text' },
    ],
    image: [
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'subtitle', label:'Subtítulo', type:'text' },
      { key:'priceLabel', label:'Preço', type:'text' },
    ],
    reels: [
      { key:'badge', label:'Badge', type:'text' },
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'subtitle', label:'Subtítulo', type:'text' },
      { key:'footer', label:'Footer', type:'text' },
    ],
    thumb: [
      { key:'badge', label:'Badge', type:'text' },
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'accentWord', label:'Palavra destaque', type:'text' },
      { key:'priceLabel', label:'Preço', type:'text' },
    ],
    meme: (memeMode === 'classic' ? [
      { key:'memeTop', label:'Texto topo', type:'text' },
      { key:'memeBot', label:'Texto base', type:'text' },
    ] : memeMode === 'reaction' ? [
      { key:'memeCaption', label:'Legenda', type:'text' },
      { key:'memeBot', label:'Texto base', type:'text' },
    ] : [
      { key:'memeTop', label:'Texto topo', type:'text' },
      { key:'aLabel', label:'Opção A', type:'text' },
      { key:'bLabel', label:'Opção B', type:'text' },
      { key:'vsWord', label:'Palavra VS', type:'text' },
    ]),
    quiz: (quizMode === 'pergunta' ? [
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'question', label:'Pergunta', type:'text' },
      { key:'quizOptions', label:'Opções (1 por linha)', type:'array' },
    ] : [
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'question', label:'Pergunta', type:'text' },
      { key:'aLabel', label:'Opção A', type:'text' },
      { key:'bLabel', label:'Opção B', type:'text' },
      { key:'vsWord', label:'Palavra VS', type:'text' },
    ]),
    ranking: [
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'rankItems', label:'Itens (nome | nota)', type:'array' },
    ],
    arrivals: [
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'arrivals', label:'Novidades (nome | console)', type:'array' },
    ],
    carousel: [
      { key:'badge', label:'Badge', type:'text' },
      { key:'eyebrow', label:'Eyebrow', type:'text' },
      { key:'title', label:'Título', type:'text' },
      { key:'subtitle', label:'Subtítulo', type:'text' },
      { key:'footer', label:'Footer', type:'text' },
      { key:'cta', label:'CTA', type:'text' },
    ],
  }
  const f = MAP[tpl]
  return typeof f === 'function' ? f() : (f || MAP.block)
}

function arrayFieldToText(key, val) {
  if (!val) return ''
  if (!Array.isArray(val)) return String(val)
  if (key === 'rankItems') return val.map(r => `${r.name || ''} | ${r.note || ''}`).join('\n')
  if (key === 'arrivals') return val.map(a => `${a.name || ''} | ${a.console || ''}`).join('\n')
  return val.join('\n')
}

function textToArrayField(key, text) {
  const lines = (text || '').split('\n').map(s => s.trim()).filter(Boolean)
  if (key === 'rankItems') return lines.map(line => {
    const [name = '', note = ''] = line.split('|').map(s => s.trim())
    return { name, note }
  })
  if (key === 'arrivals') return lines.map(line => {
    const [name = '', console = ''] = line.split('|').map(s => s.trim())
    return { name, console }
  })
  return lines
}

function extraComCampos(campos, extra) {
  const relevant = ['title','subtitle','eyebrow','badge','cta','footer','priceLabel','accentWord',
    'memeTop','memeBot','memeCaption','question']
  const lines = []
  for (const k of relevant) {
    if (campos[k]) {
      const v = Array.isArray(campos[k]) ? campos[k].join(', ') : campos[k]
      lines.push(`${k}: ${v}`)
    }
  }
  if (!lines.length) return extra || ''
  const ctx = 'Contexto da arte:\n' + lines.join('\n')
  return extra ? ctx + '\n\n' + extra : ctx
}

const inputStyle = {
  width: '100%', background: 'var(--bg2)', color: 'var(--white)',
  border: '1px solid var(--lineSoft)', borderRadius: 8, padding: '10px 12px',
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
}

export default function Materiais({ camp, produto, onUpdate }) {
  const TONS = tones()
  const itens = camp.materiais?.itens || []

  // Section 1
  const [plataforma, setPlataforma] = useState('instagram_feed')
  const [tom, setTom] = useState(produto?.tom_sugerido || 'hype')
  const [extra, setExtra] = useState('')

  // Section 2
  const [template, setTemplate] = useState('block')
  const [memeMode, setMemeMode] = useState('classic')
  const [quizMode, setQuizMode] = useState('pergunta')
  const [tagId, setTagId] = useState('lancamento')
  const [campos, setCampos] = useState({})
  const [vars, setVars] = useState([])
  const [loadingArte, setLoadingArte] = useState(false)
  const [erroArte, setErroArte] = useState('')

  // Section 3
  const [descricao, setDescricao] = useState(null)
  const [loadingDesc, setLoadingDesc] = useState(false)
  const [erroDesc, setErroDesc] = useState('')

  // Section 4
  const [roteiro, setRoteiro] = useState(null)
  const [loadingRoteiro, setLoadingRoteiro] = useState(false)
  const [erroRoteiro, setErroRoteiro] = useState('')

  const plat = PLATS.find(p => p.key === plataforma)
  const isVideo = plat?.video || false
  const templateFields = camposDoTemplate(template, memeMode, quizMode)

  const addItem = (item) =>
    onUpdate({ materiais: { ...(camp.materiais || {}), itens: [{ ...item, criado_em: new Date().toISOString() }, ...itens] } })

  const removeItem = (i) =>
    onUpdate({ materiais: { ...(camp.materiais || {}), itens: itens.filter((_, idx) => idx !== i) } })

  const concluir = () => onUpdate({}, { done: true })

  const handleTemplateChange = (newTpl) => {
    const newFields = camposDoTemplate(newTpl, memeMode, quizMode)
    const newKeys = new Set(newFields.map(f => f.key))
    const filtered = {}
    for (const [k, v] of Object.entries(campos)) {
      if (newKeys.has(k)) filtered[k] = v
    }
    setTemplate(newTpl)
    setCampos(filtered)
    setVars([])
    setDescricao(null)
    setRoteiro(null)
  }

  const handleMemeModeChange = (newMode) => {
    setMemeMode(newMode)
    const newFields = camposDoTemplate('meme', newMode, quizMode)
    const newKeys = new Set(newFields.map(f => f.key))
    const filtered = {}
    for (const [k, v] of Object.entries(campos)) {
      if (newKeys.has(k)) filtered[k] = v
    }
    setCampos(filtered)
    setVars([])
  }

  const handleQuizModeChange = (newMode) => {
    setQuizMode(newMode)
    const newFields = camposDoTemplate('quiz', memeMode, newMode)
    const newKeys = new Set(newFields.map(f => f.key))
    const filtered = {}
    for (const [k, v] of Object.entries(campos)) {
      if (newKeys.has(k)) filtered[k] = v
    }
    setCampos(filtered)
    setVars([])
  }

  const handleGerarArte = async () => {
    setLoadingArte(true); setErroArte(''); setVars([])
    try {
      const txt = await gerar(promptArte({
        gen: camp.geracao, plataforma, tom, template, produto,
        tema: camp.tema, angulo: camp.brief?.angulo, extra,
      }))
      const data = extractJSON(txt)
      if (!data || !Array.isArray(data.variacoes) || !data.variacoes.length)
        setErroArte('A resposta veio em formato inesperado. Tente de novo.')
      else setVars(data.variacoes.slice(0, 3))
    } catch (e) {
      setErroArte(e.message || 'Erro na geração.')
    } finally {
      setLoadingArte(false)
    }
  }

  const handleSelectVariacao = (v) => {
    const merged = { ...campos }
    for (const f of templateFields) {
      if (v[f.key] !== undefined) merged[f.key] = v[f.key]
    }
    setCampos(merged)
  }

  const handleMontarArte = () => {
    const state = {
      template, tagId,
      pattern: '8bit', fill: true, ink: 'auto', format: 'feed',
      titleSize: 108, image: null, pageCount: 4, current: 0,
      patternOpacity: 100, videoAudio: true, showSafe: true,
      memeMode, quizMode,
      rankCount:5,
      rankItems: Array.from({length:6}, () => ({name:'',note:''})),
      arrivalCount:4,
      arrivals: Array.from({length:6}, () => ({name:'',console:'',image:null})),
      pages: Array.from({length:4}, () => ({title:'',body:'',image:null})),
      answer:-1, hideOptions:false,
      aImg:null, bImg:null,
      eyebrow: campos.eyebrow || '',
      title: campos.title || '',
      subtitle: campos.subtitle || '',
      badge: campos.badge || '',
      cta: campos.cta || '',
      footer: campos.footer || '',
      priceLabel: campos.priceLabel || '',
      accentWord: campos.accentWord || '',
      memeTop: campos.memeTop || '',
      memeBot: campos.memeBot || '',
      memeCaption: campos.memeCaption || '',
      question: campos.question || '',
      quizOptions: Array.isArray(campos.quizOptions) ? campos.quizOptions : [],
      aLabel: campos.aLabel || '',
      bLabel: campos.bLabel || '',
      vsWord: campos.vsWord || 'OU',
    }
    if (localStorage.getItem('gh-studio')) {
      if (!confirm('Já existe um rascunho no Creative Studio. Substituir?')) return
    }
    localStorage.setItem('gh-studio', JSON.stringify(state))
    window.open('/studio.html', '_blank')
  }

  const handleGerarDesc = async () => {
    setLoadingDesc(true); setErroDesc(''); setDescricao(null)
    const titulo = campos.title || produto?.nome || camp.tema || ''
    const extraEnriched = extraComCampos(campos, extra)
    try {
      const txt = await gerar(promptDescricao({
        gen: camp.geracao, plataforma, tom, titulo, produto,
        tema: camp.tema, angulo: camp.brief?.angulo, extra: extraEnriched,
      }))
      const data = extractJSON(txt)
      const texto = data?.texto || txt.replace(/```json|```/g, '').trim()
      if (!texto || texto.length < 20) setErroDesc('A resposta veio em formato inesperado. Tente de novo.')
      else setDescricao({ texto, title: data?.title || titulo })
    } catch (e) {
      setErroDesc(e.message || 'Erro na geração.')
    } finally {
      setLoadingDesc(false)
    }
  }

  const handleSalvarDesc = () => {
    if (!descricao) return
    addItem({
      tipo: 'post', plataforma, template, tom, tagId,
      campos: { ...campos },
      descricao: descricao.texto,
    })
  }

  const handleGerarRoteiro = async () => {
    setLoadingRoteiro(true); setErroRoteiro(''); setRoteiro(null)
    try {
      const txt = await gerar(promptRoteiro({
        gen: camp.geracao, plataforma, tom, produto,
        tema: camp.tema, angulo: camp.brief?.angulo,
        campos, extra,
      }))
      const data = extractJSON(txt)
      if (!data || !Array.isArray(data.cenas) || !data.gancho)
        setErroRoteiro('A resposta veio em formato inesperado. Tente de novo.')
      else setRoteiro(data)
    } catch (e) {
      setErroRoteiro(e.message || 'Erro na geração.')
    } finally {
      setLoadingRoteiro(false)
    }
  }

  const handleSalvarRoteiro = () => {
    if (!roteiro) return
    addItem({
      tipo: 'roteiro', plataforma, template, tom, tagId,
      campos: { ...campos },
      roteiro: {
        gancho: roteiro.gancho,
        cenas: roteiro.cenas,
        cta_final: roteiro.cta_final,
        duracao: roteiro.duracao,
      },
      descricao_video: roteiro.descricao_video || '',
    })
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Materiais — conteúdo por canal</h3>
      <p style={{ margin: '0 0 16px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        Conteúdo para arte + descrições + roteiros gerados <strong>aqui</strong>,
        abastecidos pelo contexto do Brief (produto + geração + pilar + tema).
        Cada peça salva vira parte da campanha.
      </p>

      {/* Contexto do Brief */}
      {(produto || camp.geracao || camp.pilar || camp.tema) && (
        <div className="alert" style={{ fontSize: 12, marginBottom: 18 }}>
          Contexto do Brief:{' '}
          {camp.brief?.produto_nome && <b>{camp.brief.produto_nome}</b>}
          {camp.geracao && <> · geração <b>{camp.geracao}</b></>}
          {camp.pilar && <> · pilar <b>{camp.pilar}</b></>}
          {camp.tema && <> · tema <b>{camp.tema}</b></>}
        </div>
      )}

      {!camp.geracao && (
        <div className="alert" style={{ fontSize: 12, marginBottom: 16, color: '#d8a24a' }}>
          Sem geração definida no Brief — o conteúdo sai genérico. Volte ao Brief para melhor resultado.
        </div>
      )}

      {/* ─── SEÇÃO 1: Formato ─── */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--lineSoft)' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--mut)', display: 'block', marginBottom: 12 }}>
          SEÇÃO 1 · FORMATO
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 12 }}>
          <Sel label="Plataforma" value={plataforma} onChange={setPlataforma}
            opts={PLATS.map(p => [p.key, p.label])} />
          <Sel label="Tom" value={tom} onChange={setTom}
            opts={Object.entries(TONS).map(([k, v]) => [k, v.label])} />
        </div>
        <Lbl>Briefing adicional (opcional)</Lbl>
        <textarea value={extra} onChange={e => setExtra(e.target.value)}
          placeholder="Algo específico deste post além do tema da campanha…" style={{ ...inputStyle, minHeight: 60 }} />
      </div>

      {/* ─── SEÇÃO 2: Conteúdo da Arte ─── */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--lineSoft)' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--mut)', display: 'block', marginBottom: 12 }}>
          SEÇÃO 2 · CONTEÚDO DA ARTE
        </span>

        {/* Template grid */}
        <Lbl>Template</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {TEMPLATES.map(t => (
            <button key={t.id}
              className={'tag ' + (template === t.id ? 'tag-orange' : 'tag-gray')}
              style={{ cursor: 'pointer', fontSize: 11, padding: '4px 10px', borderRadius: 4,
                border: 'none', fontFamily: 'JetBrains Mono, monospace' }}
              onClick={() => handleTemplateChange(t.id)}
              title={t.note}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Sub-mode selectors */}
        {template === 'meme' && (
          <div style={{ marginBottom: 14 }}>
            <div className="chips" style={{ gap: 6 }}>
              {MEME_MODES.map(m => (
                <button key={m.id}
                  className={'tag ' + (memeMode === m.id ? 'tag-orange' : 'tag-gray')}
                  style={{ cursor: 'pointer', fontSize: 10 }}
                  onClick={() => handleMemeModeChange(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {template === 'quiz' && (
          <div style={{ marginBottom: 14 }}>
            <div className="chips" style={{ gap: 6 }}>
              {QUIZ_MODES.map(m => (
                <button key={m.id}
                  className={'tag ' + (quizMode === m.id ? 'tag-orange' : 'tag-gray')}
                  style={{ cursor: 'pointer', fontSize: 10 }}
                  onClick={() => handleQuizModeChange(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag */}
        <div style={{ marginBottom: 14 }}>
          <Sel label="Tag" value={tagId} onChange={setTagId}
            opts={TAGS.map(t => [t.id, t.label])} />
        </div>

        {/* Campos dinâmicos */}
        {templateFields.map(f => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <Lbl>{f.label}</Lbl>
            {f.type === 'array' ? (
              <textarea value={arrayFieldToText(f.key, campos[f.key])}
                onChange={e => setCampos(prev => ({ ...prev, [f.key]: textToArrayField(f.key, e.target.value) }))}
                placeholder={`Digite um item por linha${f.key === 'rankItems' ? ' (nome | nota)' : ''}${f.key === 'arrivals' ? ' (nome | console)' : ''}`}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            ) : (
              <input value={campos[f.key] || ''}
                onChange={e => setCampos(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.label}
                style={inputStyle} />
            )}
          </div>
        ))}

        {/* Gerar variações */}
        <button className="btn btn-primary btn-sm" onClick={handleGerarArte} disabled={loadingArte}
          style={{ marginTop: 4 }}>
          {loadingArte ? '⏳ Gerando…' : '⚡ Gerar 3 variações'}
        </button>

        {erroArte && <div className="alert" style={{ marginTop: 12, color: '#e06060' }}>{erroArte}</div>}

        {/* Variações */}
        {vars.map((v, i) => (
          <div key={i} className="card"
            style={{ background: 'var(--bg2)', marginTop: 12, padding: 14, cursor: 'pointer',
              border: '1px solid transparent' }}
            onClick={() => handleSelectVariacao(v)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--orange)', marginBottom: 8 }}>
              VARIAÇÃO {i + 1}
            </div>
            {templateFields.map(f => {
              const val = v[f.key]
              if (val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length)) return null
              const display = Array.isArray(val) ? val.join(', ') : String(val)
              return (
                <div key={f.key} style={{ fontSize: 12.5, marginBottom: 3, lineHeight: 1.45 }}>
                  <span className="mono" style={{ color: 'var(--mut)', fontSize: 10 }}>{f.label}: </span>
                  <span>{display}</span>
                </div>
              )
            })}
            {v.hashtags && Array.isArray(v.hashtags) && v.hashtags.length > 0 && (
              <div className="chips" style={{ marginTop: 6 }}>
                {v.hashtags.map((h, j) => (
                  <span key={j} className="tag tag-gray" style={{ fontSize: 9 }}>
                    #{String(h).replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Montar arte */}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}
          onClick={handleMontarArte}
          disabled={!campos.title && !campos.eyebrow && !campos.memeTop}>
          🎨 Montar arte no Creative Studio
        </button>
      </div>

      {/* ─── SEÇÃO 3: Descrição do Post ─── */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--lineSoft)' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--mut)', display: 'block', marginBottom: 12 }}>
          SEÇÃO 3 · DESCRIÇÃO DO POST
        </span>
        <button className="btn btn-primary btn-sm" onClick={handleGerarDesc} disabled={loadingDesc}>
          {loadingDesc ? '⏳ Gerando…' : '⚡ Gerar descrição'}
        </button>

        {erroDesc && <div className="alert" style={{ marginTop: 12, color: '#e06060' }}>{erroDesc}</div>}

        {descricao && (
          <div className="card" style={{ background: 'var(--bg2)', marginTop: 12, padding: 14 }}>
            <strong style={{ fontSize: 14 }}>{descricao.title}</strong>
            <pre style={{ margin: '8px 0 12px', whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13, lineHeight: 1.6, color: 'var(--white)' }}>{descricao.texto}</pre>
            <button className="btn btn-ghost btn-sm" onClick={handleSalvarDesc}>
              Salvar na campanha
            </button>
          </div>
        )}
      </div>

      {/* ─── SEÇÃO 4: Roteiro (só vídeo) ─── */}
      {isVideo && (
        <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--lineSoft)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--mut)', display: 'block', marginBottom: 12 }}>
            SEÇÃO 4 · ROTEIRO + DESCRIÇÃO DO VÍDEO
          </span>
          <button className="btn btn-primary btn-sm" onClick={handleGerarRoteiro} disabled={loadingRoteiro}>
            {loadingRoteiro ? '⏳ Gerando…' : '⚡ Gerar roteiro + descrição do vídeo'}
          </button>

          {erroRoteiro && <div className="alert" style={{ marginTop: 12, color: '#e06060' }}>{erroRoteiro}</div>}

          {roteiro && (
            <div className="card" style={{ background: 'var(--bg2)', marginTop: 12, padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--orange)', marginBottom: 8 }}>GANCHO</div>
              <div style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{roteiro.gancho}</div>

              <div className="mono" style={{ fontSize: 10, color: 'var(--orange)', marginBottom: 8 }}>CENAS</div>
              {Array.isArray(roteiro.cenas) && roteiro.cenas.map((cena, i) => (
                <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: '2px solid var(--line)' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>
                    CENA {cena.cena} · {cena.tempo || '—'}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, color: 'var(--mut)' }}>{cena.descricao}</div>
                  <div style={{ fontSize: 12.5, marginTop: 2 }}>{cena.fala}</div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
                <div><span className="mono" style={{ color: 'var(--mut)' }}>CTA final: </span>{roteiro.cta_final}</div>
                <div><span className="mono" style={{ color: 'var(--mut)' }}>Duração: </span>{roteiro.duracao}</div>
              </div>

              {roteiro.descricao_video && (
                <>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--orange)', marginTop: 14, marginBottom: 6 }}>
                    DESCRIÇÃO DO VÍDEO
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 13, lineHeight: 1.5, color: 'var(--white)' }}>{roteiro.descricao_video}</pre>
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={handleSalvarRoteiro}>
                  Salvar roteiro na campanha
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PEÇAS SALVAS ─── */}
      <div style={{ marginTop: 26, borderTop: '1px solid var(--lineSoft)', paddingTop: 18 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--mut)', marginBottom: 12 }}>
          PEÇAS SALVAS ({itens.length})
        </div>
        {itens.length === 0
          ? <div className="alert" style={{ fontSize: 12 }}>Nenhuma peça salva ainda.</div>
          : itens.map((it, i) => <Peca key={i} it={it} onRemove={() => removeItem(i)} />)}

        {itens.length > 0 && (
          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={concluir}>
            Concluir Materiais e seguir →
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- Peça salva ---------- */
function Peca({ it, onRemove }) {
  const title = it.campos?.title || it.titulo || ''
  const preview = it.descricao || it.descricao_video || it.legenda || it.texto || ''
  const platLabel = PLATS.find(p => p.key === it.plataforma)?.label || it.plataforma
  return (
    <div className="card" style={{ background: 'var(--bg2)', padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {it.tipo === 'roteiro'
            ? <span className="tag" style={{ background: '#7B3FE4', color: '#F4F1EC' }}>roteiro</span>
            : <span className="tag tag-orange">{it.tipo}</span>}
          <span className="tag tag-gray">{platLabel}</span>
          <strong style={{ fontSize: 13 }}>{title}</strong>
        </span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#e06060' }} onClick={onRemove}>✕</button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--mut)', lineHeight: 1.5,
        maxHeight: 54, overflow: 'hidden', whiteSpace: 'pre-wrap' }}>{preview}</div>
    </div>
  )
}

/* ---------- helpers de form ---------- */
function Lbl({ children }) {
  return <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 10,
    letterSpacing: '.08em', color: 'var(--mut)', marginBottom: 6, textTransform: 'uppercase' }}>{children}</label>
}
function Sel({ label, value, onChange, opts }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
        {opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </div>
  )
}
