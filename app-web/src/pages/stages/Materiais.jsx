import { useState } from 'react'
import { gerar, tones } from '../../lib/gh.js'
import { promptCopy, promptDescricao, extractJSON } from '../../lib/prompts.js'

const inputStyle = {
  width: '100%', background: 'var(--bg2)', color: 'var(--white)',
  border: '1px solid var(--lineSoft)', borderRadius: 8, padding: '10px 12px',
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
}
const PLATS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok',    label: 'TikTok' },
  { key: 'youtube',   label: 'YouTube' },
]

export default function Materiais({ camp, produto, onUpdate }) {
  const [aba, setAba] = useState('copy')
  const itens = camp.materiais?.itens || []

  const addItem = (item) =>
    onUpdate({ materiais: { ...(camp.materiais || {}), itens: [{ ...item, criado_em: new Date().toISOString() }, ...itens] } })
  const removeItem = (i) =>
    onUpdate({ materiais: { ...(camp.materiais || {}), itens: itens.filter((_, idx) => idx !== i) } })
  const concluir = () => onUpdate({}, { done: true })

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Materiais — conteúdo por canal</h3>
      <p style={{ margin: '0 0 16px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        Copys e descrições geradas <strong>aqui</strong>, já recebendo produto + geração + pilar + tema
        do Brief como contexto. Cada peça salva vira parte da campanha.
      </p>

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

      <div className="chips" style={{ marginBottom: 18 }}>
        <button className={'tag ' + (aba === 'copy' ? 'tag-orange' : 'tag-gray')}
          style={{ cursor: 'pointer' }} onClick={() => setAba('copy')}>Copy</button>
        <button className={'tag ' + (aba === 'descricao' ? 'tag-orange' : 'tag-gray')}
          style={{ cursor: 'pointer' }} onClick={() => setAba('descricao')}>Descrição</button>
      </div>

      {aba === 'copy'
        ? <CopyGen camp={camp} produto={produto} onSave={addItem} />
        : <DescricaoGen camp={camp} produto={produto} onSave={addItem} />}

      {/* Peças salvas */}
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

/* ---------- Gerador de COPY ---------- */
function CopyGen({ camp, produto, onSave }) {
  const TONS = tones()
  const [tom, setTom] = useState(produto?.tom_sugerido || 'hype')
  const [plataforma, setPlataforma] = useState('instagram')
  const [extra, setExtra] = useState('')
  const [vars, setVars] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const gerarCopy = async () => {
    setLoading(true); setErro(''); setVars([])
    try {
      const txt = await gerar(promptCopy({
        gen: camp.geracao, plataforma, tom, produto,
        tema: camp.tema, angulo: camp.brief?.angulo, extra,
      }))
      const data = extractJSON(txt)
      if (!data || !Array.isArray(data.variacoes) || !data.variacoes.length)
        setErro('A resposta veio em formato inesperado. Tente de novo.')
      else setVars(data.variacoes.slice(0, 3))
    } catch (e) {
      setErro(e.message || 'Erro na geração.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
        <Sel label="Tom" value={tom} onChange={setTom}
          opts={Object.entries(TONS).map(([k, v]) => [k, v.label])} />
        <Sel label="Plataforma" value={plataforma} onChange={setPlataforma}
          opts={PLATS.map(p => [p.key, p.label])} />
      </div>
      <Lbl>Briefing adicional (opcional)</Lbl>
      <textarea value={extra} onChange={e => setExtra(e.target.value)}
        placeholder="Algo específico deste post além do tema da campanha…" style={{ minHeight: 70, marginBottom: 12 }} />
      <button className="btn btn-primary btn-sm" onClick={gerarCopy} disabled={loading}>
        {loading ? '⏳ Gerando…' : '⚡ Gerar 3 copys'}
      </button>

      {erro && <div className="alert" style={{ marginTop: 14, color: '#e06060' }}>{erro}</div>}

      {vars.map((v, i) => (
        <div key={i} className="card" style={{ background: 'var(--bg2)', marginTop: 14 }}>
          <strong style={{ fontSize: 14 }}>{v.titulo}</strong>
          <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.55, color: 'var(--white)', whiteSpace: 'pre-wrap' }}>{v.legenda}</p>
          {v.cta && <div style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 8 }}>{v.cta}</div>}
          {Array.isArray(v.hashtags) && (
            <div className="chips" style={{ marginBottom: 12 }}>
              {v.hashtags.map((h, j) => <span key={j} className="tag tag-gray">#{String(h).replace(/^#/, '')}</span>)}
            </div>
          )}
          <button className="btn btn-ghost btn-sm"
            onClick={() => onSave({ tipo: 'copy', plataforma, tom, titulo: v.titulo, legenda: v.legenda, cta: v.cta, hashtags: v.hashtags })}>
            Salvar na campanha
          </button>
        </div>
      ))}
    </div>
  )
}

/* ---------- Gerador de DESCRIÇÃO ---------- */
function DescricaoGen({ camp, produto, onSave }) {
  const TONS = tones()
  const [plataforma, setPlataforma] = useState('youtube')
  const [tom, setTom] = useState(produto?.tom_sugerido || 'informativo')
  const [titulo, setTitulo] = useState(produto?.nome || camp.tema || '')
  const [extra, setExtra] = useState('')
  const [saida, setSaida] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const gerarDesc = async () => {
    setLoading(true); setErro(''); setSaida(null)
    try {
      const txt = await gerar(promptDescricao({
        gen: camp.geracao, plataforma, tom, titulo, produto,
        tema: camp.tema, angulo: camp.brief?.angulo, extra,
      }))
      const data = extractJSON(txt)
      const texto = data?.texto || txt.replace(/```json|```/g, '').trim()
      if (!texto || texto.length < 20) setErro('A resposta veio em formato inesperado. Tente de novo.')
      else setSaida({ texto, title: data?.title || titulo })
    } catch (e) {
      setErro(e.message || 'Erro na geração.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
        <Sel label="Plataforma" value={plataforma} onChange={setPlataforma}
          opts={PLATS.map(p => [p.key, p.label])} />
        <Sel label="Tom" value={tom} onChange={setTom}
          opts={Object.entries(TONS).map(([k, v]) => [k, v.label])} />
      </div>
      <Lbl>Título</Lbl>
      <input style={{ ...inputStyle, marginBottom: 12 }} value={titulo} onChange={e => setTitulo(e.target.value)} />
      <Lbl>Briefing adicional (opcional)</Lbl>
      <textarea value={extra} onChange={e => setExtra(e.target.value)}
        placeholder="Keywords SEO, links, trend de áudio…" style={{ minHeight: 70, marginBottom: 12 }} />
      <button className="btn btn-primary btn-sm" onClick={gerarDesc} disabled={loading}>
        {loading ? '⏳ Gerando…' : '⚡ Gerar descrição'}
      </button>

      {erro && <div className="alert" style={{ marginTop: 14, color: '#e06060' }}>{erro}</div>}

      {saida && (
        <div className="card" style={{ background: 'var(--bg2)', marginTop: 14 }}>
          <strong style={{ fontSize: 14 }}>{saida.title}</strong>
          <pre style={{ margin: '8px 0 12px', whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 13, lineHeight: 1.6, color: 'var(--white)' }}>{saida.texto}</pre>
          <button className="btn btn-ghost btn-sm"
            onClick={() => onSave({ tipo: 'descricao', plataforma, tom, titulo: saida.title, texto: saida.texto })}>
            Salvar na campanha
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Peça salva (lista) ---------- */
function Peca({ it, onRemove }) {
  const preview = it.legenda || it.texto || ''
  return (
    <div className="card" style={{ background: 'var(--bg2)', padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={'tag ' + (it.tipo === 'copy' ? 'tag-orange' : 'tag-teal')}>{it.tipo}</span>
          <span className="tag tag-gray">{it.plataforma}</span>
          <strong style={{ fontSize: 13 }}>{it.titulo}</strong>
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
