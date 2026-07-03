import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as store from '../lib/campaigns.js'
import { loadCatalogo, generations, getBrandVoice, gerar } from '../lib/gh.js'
import VisualPanel from './VisualPanel.jsx'
import MateriaisPanel from './MateriaisPanel.jsx'

const STEPS = [
  { key: 'brief',      label: 'Brief',      sub: 'conceito da campanha' },
  { key: 'estrategia', label: 'Estratégia', sub: 'plano de divulgação' },
  { key: 'materiais',  label: 'Materiais',  sub: 'conteúdo por canal' },
  { key: 'visual',     label: 'Visual',     sub: 'peças & KV' },
]

const inputStyle = {
  width: '100%', background: 'var(--bg2)', color: 'var(--white)',
  border: '1px solid var(--lineSoft)', borderRadius: 8, padding: '10px 12px',
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
}

export default function Campanha() {
  const { id } = useParams()
  const [camp, setCamp] = useState(() => store.get(id))
  const [active, setActive] = useState(() => store.progressoDe(store.get(id)).proximo || 'brief')
  const [catalogo, setCatalogo] = useState([])
  const [toast, setToast] = useState('')
  const [iaGerando, setIaGerando] = useState(false)
  const [sugestaoIA, setSugestaoIA] = useState('')

  useEffect(() => { loadCatalogo().then(setCatalogo) }, [])

  if (!camp) {
    return (
      <div className="alert">
        Campanha não encontrada. <Link to="/" style={{ color: 'var(--orange)' }}>Voltar ao workspace</Link>.
      </div>
    )
  }

  const p = store.progressoDe(camp)
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const salvarBrief = (patch) => {
    let c = store.update(id, patch)
    c = store.marcarEstagio(id, 'brief', true)
    setCamp(c)
    flash('Brief salvo — alimenta os próximos estágios')
    setActive('estrategia')
  }

  const salvarEstrategia = (patch) => {
    let c = store.update(id, patch)
    c = store.marcarEstagio(id, 'estrategia', true)
    setCamp(c)
    flash('Estratégia salva — próxima etapa: Materiais')
    setActive('materiais')
  }

  const salvarMateriais = (patch) => {
    let c = store.update(id, patch)
    c = store.marcarEstagio(id, 'materiais', true)
    setCamp(c)
    flash('Materiais salvos — próxima etapa: Visual')
    setActive('visual')
  }

  const salvarVisual = (patch) => {
    let c = store.update(id, patch)
    c = store.marcarEstagio(id, 'visual', true)
    setCamp(c)
    flash('Visual concluído — campanha finalizada!')
  }

  const gerarSugestaoEstrategia = async (dadosAtuais) => {
    setIaGerando(true)
    setSugestaoIA('')
    try {
      const produto = camp.brief?.produto_nome || '—'
      const geracao = camp.geracao || '—'
      const pilar = camp.pilar || '—'
      const tema = camp.tema || '—'
      const angulo = camp.brief?.angulo || '—'
      const janela = `${dadosAtuais.janela_inicio || '?'} → ${dadosAtuais.janela_fim || '?'}`
      const dias = dadosAtuais.dias_semana.length ? dadosAtuais.dias_semana.join(', ') : 'não definido'
      const brandVoice = getBrandVoice(camp.geracao, '', 'neutro')
      const prompt = `Você é o estrategista de conteúdo da Gamer Hut, publisher de games.

Contexto da campanha:
- Produto: ${produto}
- Geração-alvo: ${geracao}
- Pilar: ${pilar}
- Tema: ${tema}
- Brief: ${angulo}
- Janela planejada: ${janela}
- Dias de postagem considerados: ${dias}

Brand voice da Gamer Hut:
${brandVoice.slice(0, 1000)}

Com base nisso, sugira uma estratégia de conteúdo com:
1. Canais recomendados — quais usar (Instagram, TikTok, YouTube, etc.) e por que cada um
2. Formato ideal por canal — Reels vs Feed, Vídeo vs Short, etc.
3. Grade semanal sugerida — sequência de conteúdos ao longo da semana
4. Frequência ideal — quantos posts por dia/semana
5. Tom de comunicação — adaptado por canal

Seja objetivo e prático. Use markdown.`

      const resposta = await gerar(prompt)
      setSugestaoIA(resposta)
    } catch (e) {
      setSugestaoIA('Erro ao gerar sugestão: ' + e.message)
    } finally {
      setIaGerando(false)
    }
  }

  const concluirProvisorio = (etapa) => {
    const c = store.marcarEstagio(id, etapa, !camp.progresso[etapa])
    setCamp(c)
  }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <Link to="/" className="mono" style={{ fontSize: 11, color: 'var(--mut)' }}>← Workspace</Link>
      </div>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Campanha</span>
          <h1 className="display" style={{ fontSize: 32, margin: '12px 0 6px' }}>{camp.nome}</h1>
          <div className="mono" style={{ fontSize: 12, color: 'var(--mut)' }}>
            {camp.tema ? 'Tema: ' + camp.tema : 'sem tema definido'} · {p.feitos}/{p.total} estágios
          </div>
        </div>
        <span className={'tag ' + (store.ESTADOS[camp.estado]?.cls || 'tag-gray')}>
          {store.ESTADOS[camp.estado]?.label || camp.estado}
        </span>
      </div>

      <div className="trilha">
        {STEPS.map((s, i) => {
          const done = camp.progresso[s.key]
          const isActive = active === s.key
          return (
            <div key={s.key} className={'step' + (done ? ' done' : '') + (isActive ? ' active' : '')}
              onClick={() => setActive(s.key)}>
              <span className="badge">{done ? '✓' : String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="lbl" style={{ display: 'block' }}>{s.label}</span>
                <span className="sub">{s.sub}</span>
              </span>
              <span className="arw">›</span>
            </div>
          )
        })}
      </div>

      {active === 'brief'
        ? <BriefPanel camp={camp} catalogo={catalogo} onSalvar={salvarBrief} />
        : active === 'estrategia'
        ? <EstrategiaPanel camp={camp} onSalvar={salvarEstrategia}
            onGerarIA={gerarSugestaoEstrategia}
            iaGerando={iaGerando} sugestaoIA={sugestaoIA} />
        : active === 'materiais'
        ? <MateriaisPanel camp={camp} onSalvar={salvarMateriais} />
        : active === 'visual'
        ? <VisualPanel camp={camp} onSalvar={salvarVisual} />
        : <StubPanel etapa={active} camp={camp} onToggle={() => concluirProvisorio(active)} />}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

function BriefPanel({ camp, catalogo, onSalvar }) {
  const gens = generations()
  const [nome, setNome] = useState(camp.nome)
  const [tema, setTema] = useState(camp.tema || '')
  const [produtoId, setProdutoId] = useState(camp.produto_id || '')
  const [geracao, setGeracao] = useState(camp.geracao || '')
  const [pilar, setPilar] = useState(camp.pilar || '')
  const [angulo, setAngulo] = useState(camp.brief?.angulo || '')

  const produto = useMemo(
    () => catalogo.find(j => j.id === produtoId) || null,
    [catalogo, produtoId]
  )

  const escolherProduto = (pid) => {
    setProdutoId(pid)
    const j = catalogo.find(x => x.id === pid)
    if (!j) return
    if (j.geracao_key) setGeracao(j.geracao_key)
    if (j.pilar_sugerido) setPilar(j.pilar_sugerido)
    if (!tema && j.nome) setTema(j.nome)
  }

  const salvar = () => {
    onSalvar({
      nome: nome.trim() || 'Nova campanha',
      tema: tema.trim(),
      produto_id: produtoId || null,
      geracao: geracao || null,
      pilar: pilar || null,
      brief: {
        angulo: angulo.trim(),
        produto_nome: produto?.nome || null,
        plataformas: produto?.plataformas || null,
        status: produto?.status_label || null,
        janela: produto ? `${produto.divulgacao_inicio || '?'} → ${produto.divulgacao_fim || '?'}` : null,
      },
    })
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Brief — a fonte da campanha</h3>
      <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        O que você define aqui (produto, geração-alvo, pilar, tema) é injetado no contexto de
        <strong> todos os estágios seguintes</strong> — Estratégia, Materiais e Visual.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
        <Field label="Nome da campanha">
          <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} />
        </Field>
        <Field label="Jogo / produto (catálogo)">
          <select style={inputStyle} value={produtoId} onChange={e => escolherProduto(e.target.value)}>
            <option value="">— sem produto —</option>
            {catalogo.map(j => (
              <option key={j.id} value={j.id}>
                {j.nome}{j.status_label ? ` · ${j.status_label}` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Geração-alvo">
          <select style={inputStyle} value={geracao} onChange={e => setGeracao(e.target.value)}>
            <option value="">— definir —</option>
            {Object.values(gens).map(g => (
              <option key={g.id} value={g.id}>{g.emoji} {g.full}</option>
            ))}
          </select>
        </Field>
        <Field label="Pilar de conteúdo">
          <input style={inputStyle} value={pilar} onChange={e => setPilar(e.target.value)}
            placeholder="Ex: Drop & Lançamento" />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Tema / ângulo da campanha">
          <input style={inputStyle} value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Ex: A volta de uma lenda" />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Observações do brief (opcional)">
          <textarea value={angulo} onChange={e => setAngulo(e.target.value)}
            placeholder="Notas, gancho, referências, o que evitar…" />
        </Field>
      </div>

      {produto && (
        <div className="alert" style={{ marginTop: 16, fontSize: 12 }}>
          <strong>{produto.nome}</strong> · {produto.plataformas || 'plataformas —'} · {produto.status_label || '—'}
          {produto.divulgacao_inicio && <> · janela {produto.divulgacao_inicio} → {produto.divulgacao_fim || '?'}</>}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={salvar}>Salvar Brief e seguir →</button>
      </div>
    </div>
  )
}

const CANAIS_CONFIG = [
  { id: 'instagram', label: 'Instagram', formatos: ['Feed', 'Reels', 'Stories', 'Carrossel'] },
  { id: 'tiktok',    label: 'TikTok',    formatos: ['Vídeo', 'Story'] },
  { id: 'youtube',   label: 'YouTube',   formatos: ['Vídeo', 'Shorts'] },
  { id: 'x',         label: 'X (Twitter)', formatos: ['Post', 'Thread'] },
  { id: 'threads',   label: 'Threads',   formatos: ['Post'] },
]
const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
const FREQ_OPTS = [
  { value: '1x', label: '1x ao dia' },
  { value: '2x', label: '2x ao dia' },
  { value: '3+', label: '3+ ao dia' },
  { value: 'semanal', label: 'Semanal' },
]

function EstrategiaPanel({ camp, onSalvar, onGerarIA, iaGerando, sugestaoIA }) {
  const [canais, setCanais] = useState(camp.estrategia?.canais || [])
  const [janelaInicio, setJanelaInicio] = useState(
    camp.estrategia?.janela_inicio || (camp.brief?.janela ? camp.brief.janela.split(' → ')[0] : '') || ''
  )
  const [janelaFim, setJanelaFim] = useState(
    camp.estrategia?.janela_fim || (camp.brief?.janela ? camp.brief.janela.split(' → ')[1] : '') || ''
  )
  const [diasSemana, setDiasSemana] = useState(camp.estrategia?.dias_semana || [])
  const [frequencia, setFrequencia] = useState(camp.estrategia?.frequencia || '1x')
  const [observacoes, setObservacoes] = useState(camp.estrategia?.observacoes || '')

  const toggleCanal = (id) => {
    setCanais(prev => {
      const exists = prev.find(c => c.canal === id)
      if (exists) return prev.filter(c => c.canal !== id)
      const cfg = CANAIS_CONFIG.find(c => c.id === id)
      return [...prev, { canal: id, formatos: cfg ? [...cfg.formatos] : [] }]
    })
  }

  const toggleFormato = (canalId, formato) => {
    setCanais(prev => prev.map(c => {
      if (c.canal !== canalId) return c
      const f = c.formatos.includes(formato)
        ? c.formatos.filter(x => x !== formato)
        : [...c.formatos, formato]
      return { ...c, formatos: f }
    }))
  }

  const toggleDia = (dia) => {
    setDiasSemana(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const salvar = () => {
    onSalvar({
      estrategia: {
        canais, janela_inicio: janelaInicio, janela_fim: janelaFim,
        dias_semana: diasSemana, frequencia,
        observacoes: observacoes.trim(),
      },
    })
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Estratégia — plano de divulgação</h3>
      <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        Defina os canais, a janela de divulgação e o calendário semanal da campanha.
      </p>

      <div className="alert" style={{ fontSize: 12, marginBottom: 20 }}>
        Contexto do Brief:{' '}
        {camp.brief?.produto_nome && <b>{camp.brief.produto_nome}</b>}
        {camp.geracao && <> · geração <b>{generations()[camp.geracao]?.full || camp.geracao}</b></>}
        {camp.pilar && <> · pilar <b>{camp.pilar}</b></>}
        {camp.tema && <> · tema <b>{camp.tema}</b></>}
        {camp.brief?.angulo && <> · {camp.brief.angulo}</>}
      </div>

      <Field label="Canais de divulgação">
        {CANAIS_CONFIG.map(cfg => (
          <div key={cfg.id} style={{ marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
              <input type="checkbox" checked={canais.some(c => c.canal === cfg.id)}
                onChange={() => toggleCanal(cfg.id)} />
              <span style={{ fontSize: 13 }}>{cfg.label}</span>
            </label>
            {canais.some(c => c.canal === cfg.id) && (
              <div className="chips" style={{ marginLeft: 24 }}>
                {cfg.formatos.map(f => {
                  const ativo = canais.find(c => c.canal === cfg.id)?.formatos?.includes(f)
                  return (
                    <span key={f} onClick={() => toggleFormato(cfg.id, f)}
                      className={'tag ' + (ativo ? 'tag-orange' : 'tag-gray')}
                      style={{ cursor: 'pointer', fontSize: 10 }}>
                      {f}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Field label="Início da janela">
          <input type="date" style={inputStyle} value={janelaInicio} onChange={e => setJanelaInicio(e.target.value)} />
        </Field>
        <Field label="Fim da janela">
          <input type="date" style={inputStyle} value={janelaFim} onChange={e => setJanelaFim(e.target.value)} />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Dias de postagem">
          <div className="chips">
            {DIAS.map(d => (
              <span key={d} onClick={() => toggleDia(d)}
                className={'tag ' + (diasSemana.includes(d) ? 'tag-orange' : 'tag-gray')}
                style={{ cursor: 'pointer', textTransform: 'capitalize' }}>
                {d.slice(0, 3)}
              </span>
            ))}
          </div>
        </Field>
      </div>

      <div style={{ marginTop: 12 }}>
        <Field label="Frequência">
          <select style={inputStyle} value={frequencia} onChange={e => setFrequencia(e.target.value)}>
            {FREQ_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Observações da estratégia">
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
            placeholder="Notas sobre a estratégia, público, tom, concorrência…" />
        </Field>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => onGerarIA({
          canais, janela_inicio: janelaInicio, janela_fim: janelaFim,
          dias_semana: diasSemana, frequencia, observacoes,
        })} disabled={iaGerando}>
          {iaGerando ? 'Gerando…' : '✨ Gerar sugestão com IA'}
        </button>
        <button className="btn btn-primary" onClick={salvar}>
          Salvar Estratégia e seguir →
        </button>
      </div>

      {sugestaoIA && (
        <div className="alert" style={{ marginTop: 16, whiteSpace: 'pre-wrap', fontSize: 12 }}>
          <strong>Sugestão da IA:</strong><br />{sugestaoIA}
        </div>
      )}
    </div>
  )
}

function StubPanel({ etapa, camp, onToggle }) {
  const info = {}[etapa]
  if (!info) return null

  const feito = camp.progresso[etapa]

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, margin: 0 }}>{info.titulo}</h3>
        <span className="tag tag-gray">{info.fase}</span>
      </div>
      <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 13, lineHeight: 1.6 }}>{info.desc}</p>

      {(camp.produto_id || camp.geracao || camp.pilar) && (
        <div className="alert" style={{ fontSize: 12, marginBottom: 20 }}>
          Contexto herdado do Brief:{' '}
          {camp.brief?.produto_nome && <b>{camp.brief.produto_nome}</b>}
          {camp.geracao && <> · geração <b>{generations()[camp.geracao]?.full || camp.geracao}</b></>}
          {camp.pilar && <> · pilar <b>{camp.pilar}</b></>}
          {camp.tema && <> · tema <b>{camp.tema}</b></>}
        </div>
      )}

      <button className="btn btn-ghost btn-sm" onClick={onToggle}>
        {feito ? 'Desmarcar etapa' : 'Marcar como concluída (provisório)'}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 10,
        letterSpacing: '.08em', color: 'var(--mut)', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
