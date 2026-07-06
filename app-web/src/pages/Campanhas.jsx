import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as store from '../lib/campaigns.js'
import { generations, tones, platforms } from '../lib/gh.js'

// Geradores legados vivem no portal estático (GitHub Pages). Rotas internas do
// app-web usam `to`; ferramentas legadas usam `href`. Ver DIRETRIZ §6.
const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

const FERRAMENTAS = [
  { nome: 'Catálogo',        desc: 'Jogos do board Monday, status derivado.',   to: '/catalogo' },
  { nome: 'Cérebro de Marca',desc: 'Voz, tons, gerações e plataformas.',        to: '/marca' },
  { nome: 'Copys',           desc: 'Legendas e chamadas na voz da GH.',         href: PORTAL + '/copys.html' },
  { nome: 'Descrições',      desc: 'YT / TikTok / Instagram padronizadas.',     href: PORTAL + '/descricoes.html' },
  { nome: 'Creative Studio', desc: 'Posts, carrosséis, quizzes, rankings.',     href: PORTAL + '/studio.html' },
  { nome: 'Downloader',      desc: 'Baixa vídeos p/ usar nas artes.',           href: PORTAL + '/downloader.html' },
  { nome: 'Review',          desc: 'Revisão antes de publicar.',                href: PORTAL + '/review.html' },
  { nome: 'Aprendizado',     desc: 'Log de diretrizes aprendidas.',             href: PORTAL + '/aprendizado.html' },
]

export default function Campanhas() {
  const nav = useNavigate()
  const [tick, setTick] = useState(0)
  const [showArquivadas, setShowArquivadas] = useState(false)
  const refresh = useCallback(() => setTick(t => t + 1), [])

  const camps = store.list(showArquivadas)

  const criar = () => {
    const c = store.create({})
    nav('/campanha/' + c.id)
  }

  const arquivar = (e, id) => {
    e.stopPropagation()
    store.archive(id)
    refresh()
  }
  const desarquivar = (e, id) => {
    e.stopPropagation()
    store.unarchive(id)
    refresh()
  }
  const excluir = (e, id, nome) => {
    e.stopPropagation()
    if (confirm(`Excluir a campanha "${nome}"? Não dá pra desfazer.`)) {
      store.remove(id)
      refresh()
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Gamer Hut · Plataforma de Gestão</span>
          <h1 className="display" style={{ fontSize: 34, margin: '14px 0 0' }}>Workspace</h1>
        </div>
      </div>

      {/* 01 — BIBLIOTECA DE CAMPANHAS */}
      <section className="sec">
        <div className="sec-head">
          <span className="n">01</span>
          <h2>Biblioteca de Campanhas</h2>
          <span className="sub">cada campanha tem seu fluxo Brief → Estratégia → Materiais → Visual</span>
          <span className="spacer" />
          <button className="btn btn-primary btn-sm" onClick={criar}>+ Nova campanha</button>
        </div>

        {camps.length === 0 ? (
          <div className="alert">
            Nenhuma campanha ainda. Clique em <strong>+ Nova campanha</strong> para começar —
            escolha o jogo do catálogo, a geração e o pilar, e o Brief alimenta todo o resto.
          </div>
        ) : (
          <div className="cardgrid" key={tick}>
            {camps.map(c => <CampCard key={c.id} c={c} nav={nav}
              arquivar={arquivar} desarquivar={desarquivar} excluir={excluir} />)}
          </div>
        )}

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--mut)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showArquivadas} onChange={e => setShowArquivadas(e.target.checked)} />
          mostrar arquivadas
        </label>
      </section>

      {/* 02 — BRAND GUIDELINES */}
      <section className="sec">
        <div className="sec-head">
          <span className="n">02</span>
          <h2>Brand guidelines · Gamer Hut</h2>
          <span className="sub">o combustível de toda geração</span>
          <span className="spacer" />
          <Link className="btn btn-ghost btn-sm" to="/marca">Ver marca completa →</Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14 }}>Tom de voz</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 13, lineHeight: 1.6 }}>
            Soe como um gamer apaixonado, informado e próximo da comunidade — entusiasmado sem
            exagero, claro em pré-vendas, com humor leve quando cabe. Mídia física como valor central.
          </p>

          <BrandChips titulo="Gerações" itens={Object.values(generations()).map(g =>
            `${g.emoji || ''} ${g.label} · ${g.pctFeed}%`)} cls="tag-violet" />
          <BrandChips titulo="Tons de voz" itens={Object.values(tones()).map(t => t.label)} cls="tag-teal" />
          <BrandChips titulo="Plataformas" itens={Object.values(platforms()).map(p => p.label)} cls="tag-blue" />
        </div>
      </section>

      {/* 03 — FERRAMENTAS AVULSAS */}
      <section className="sec">
        <div className="sec-head">
          <span className="n">03</span>
          <h2>Ferramentas avulsas</h2>
          <span className="sub">trabalhos pontuais fora do fluxo de campanha</span>
        </div>

        <div className="cardgrid">
          {FERRAMENTAS.map(f => <ToolCard key={f.nome} f={f} nav={nav} />)}
        </div>
      </section>
    </>
  )
}

function CampCard({ c, nav, arquivar, desarquivar, excluir }) {
  const p = store.progressoDe(c)
  const estado = store.ESTADOS[c.estado] || { label: c.estado, cls: 'tag-gray' }
  const arquivada = c.estado === 'arquivada'
  return (
    <div className="card camp" onClick={() => nav('/campanha/' + c.id)}>
      <div className="top">
        <span className={'tag ' + estado.cls}>{estado.label}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>{p.feitos}/{p.total}</span>
      </div>
      <div>
        <h3>{c.nome}</h3>
        <div className="tema">{c.tema || 'sem tema definido'}</div>
      </div>
      <div className="bar"><i style={{ width: p.pct + '%' }} /></div>
      <div className="foot">
        <span className="mono" style={{ fontSize: 11, color: 'var(--orange)' }}>
          {arquivada ? 'Arquivada' : p.proximo ? 'Continuar →' : 'Concluída ✓'}
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          {arquivada
            ? <button className="btn btn-ghost btn-sm" onClick={e => desarquivar(e, c.id)}>Restaurar</button>
            : <button className="btn btn-ghost btn-sm" onClick={e => arquivar(e, c.id)}>Arquivar</button>}
          <button className="btn btn-ghost btn-sm" onClick={e => excluir(e, c.id, c.nome)}
            style={{ color: '#e06060' }}>✕</button>
        </span>
      </div>
    </div>
  )
}

function ToolCard({ f, nav }) {
  const go = () => { if (f.to) nav(f.to); else window.location.href = f.href }
  return (
    <div className="card tool" onClick={go}>
      <div className="th">
        <h3>{f.nome}</h3>
        <span className="arrow">→</span>
      </div>
      <p>{f.desc}</p>
      {f.href && <span className="mono" style={{ fontSize: 9, color: 'var(--mut2)', marginTop: 'auto' }}>PORTAL ESTÁTICO</span>}
    </div>
  )
}

function BrandChips({ titulo, itens, cls }) {
  if (!itens || !itens.length) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--mut)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 8 }}>{titulo}</div>
      <div className="chips">
        {itens.map((x, i) => <span key={i} className={'tag ' + cls}>{x}</span>)}
      </div>
    </div>
  )
}
