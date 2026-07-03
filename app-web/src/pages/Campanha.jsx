import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as store from '../lib/campaigns.js'
import { loadCatalogo, generations } from '../lib/gh.js'

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
  const nav = useNavigate()
  const [camp, setCamp] = useState(() => store.get(id))
  const [active, setActive] = useState(() => store.progressoDe(store.get(id)).proximo || 'brief')
  const [catalogo, setCatalogo] = useState([])
  const [toast, setToast] = useState('')

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

      {/* Trilha dos 4 estágios */}
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

      {/* Painel do estágio ativo */}
      {active === 'brief'
        ? <BriefPanel camp={camp} catalogo={catalogo} onSalvar={salvarBrief} />
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

  // Ao escolher um jogo, sugere geração + pilar a partir do catálogo (sem sobrescrever escolha manual).
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

function StubPanel({ etapa, camp, onToggle }) {
  const info = {
    estrategia: { titulo: 'Estratégia — plano de divulgação', fase: 'Fase D',
      desc: 'Canais (Instagram / TikTok / YouTube), formatos, cadência e datas cruzando a janela de divulgação do produto com o calendário semanal.' },
    materiais: { titulo: 'Materiais — conteúdo por canal', fase: 'Fase C',
      desc: 'Copys e Descrições geradas AQUI dentro, já recebendo produto + geração + pilar + tema do Brief como contexto. Este é o aprofundamento central que aprendemos do TGT Hub.' },
    visual: { titulo: 'Visual — peças & KV', fase: 'Fase D',
      desc: 'Creative Studio (posts, carrosséis, capas) como o estágio final, herdando o contexto da campanha.' },
  }[etapa]

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
          {camp.geracao && <> · geração <b>{camp.geracao}</b></>}
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
