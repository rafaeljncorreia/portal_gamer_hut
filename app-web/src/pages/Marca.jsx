import { brandBase, generations, tones, platforms } from '../lib/gh.js'

function parseMarkdown(texto) {
  if (!texto) return []
  const linhas = texto.split('\n')
  const secoes = []
  let atual = { titulo: '', conteudo: [] }
  for (const linha of linhas) {
    if (linha.startsWith('## ')) {
      if (atual.titulo) secoes.push(atual)
      atual = { titulo: linha.slice(3).trim(), conteudo: [] }
    } else {
      atual.conteudo.push(linha)
    }
  }
  if (atual.titulo) secoes.push(atual)
  return secoes
}

export default function Marca() {
  const secoes = parseMarkdown(brandBase())

  const blocks = [
    ...secoes.filter(s => s.titulo !== 'Exemplos de referência' && s.titulo !== 'SINAIS REAIS DE PERFORMANCE' && s.titulo !== 'OBJEÇÃO DE CONFIANÇA' && s.titulo !== 'NOTA SOBRE GERAÇÕES'),
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Gamer Hut · Marca</span>
          <h1 className="display" style={{ fontSize: 34, margin: '14px 0 0' }}>Brand guidelines</h1>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>
          leitura · edição versionada = v2 (D1)
        </span>
      </div>

      <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--orange)' }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: '#d7d1c9' }}>
          {secoes.find(s => s.titulo === 'Propósito')?.conteudo.join(' ').trim() ||
            'A Gamer Hut conecta jogadores aos jogos que procuram.'}
        </p>
      </div>

      <div className="cardgrid">
        {blocks.map((s, i) => (
          <div key={i} className="card" style={{ gridColumn: s.titulo === 'Posicionamento' || s.titulo === 'Essência' ? '1 / -1' : undefined }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--orange)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              {s.titulo}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--mut)' }}>
              {s.conteudo.map((line, j) => {
                const t = line.trim()
                if (!t) return <br key={j} />
                if (t.startsWith('- ')) return <li key={j} style={{ marginLeft: 16, listStyle: 'disc' }}>{t.slice(2)}</li>
                if (t.startsWith('1)') || t.startsWith('2)') || t.startsWith('3)') || t.startsWith('4)') || t.startsWith('5)'))
                  return <li key={j} style={{ marginLeft: 16, listStyle: 'decimal' }}>{t}</li>
                return <span key={j}>{t}<br /></span>
              })}
            </div>
          </div>
        ))}
      </div>

      <section className="sec">
        <div className="sec-head">
          <span className="n">G</span>
          <h2>Gerações</h2>
          <span className="sub">perfis de audiência por geração</span>
        </div>
        <div className="cardgrid">
          {Object.values(generations()).map(g => (
            <div key={g.id} className="card">
              <div className="mono" style={{ fontSize: 10, color: 'var(--violet)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                {g.emoji} {g.label}
              </div>
              <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>{g.full}</h3>
              <span className="tag tag-violet" style={{ marginBottom: 10, display: 'inline-block' }}>{g.pctFeed}% do feed</span>
              <p style={{ fontSize: 12.5, color: 'var(--mut)', lineHeight: 1.6, margin: '0 0 10px' }}>{g.desc}</p>
              <details style={{ fontSize: 12, color: 'var(--mut2)', cursor: 'pointer' }}>
                <summary style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '.06em', color: 'var(--mut)' }}>
                  Ver contexto completo
                </summary>
                <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, lineHeight: 1.6, color: 'var(--mut)' }}>
                  {g.context?.trim() || g.desc}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-head">
          <span className="n">T</span>
          <h2>Tons de voz</h2>
          <span className="sub">4 perfis para guiar a comunicação</span>
        </div>
        <div className="cardgrid">
          {Object.values(tones()).map(t => (
            <div key={t.label} className="card">
              <span className="tag tag-teal" style={{ marginBottom: 8, display: 'inline-block' }}>{t.label}</span>
              <p style={{ fontSize: 12.5, color: 'var(--mut)', lineHeight: 1.6, margin: '0 0 8px' }}>{t.desc}</p>
              <details style={{ fontSize: 12, color: 'var(--mut2)', cursor: 'pointer' }}>
                <summary style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '.06em', color: 'var(--mut)' }}>
                  Ver diretrizes
                </summary>
                <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, lineHeight: 1.6, color: 'var(--mut)' }}>
                  {t.context || ''}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-head">
          <span className="n">P</span>
          <h2>Plataformas</h2>
          <span className="sub">formato e contexto por canal</span>
        </div>
        <div className="cardgrid">
          {Object.values(platforms()).map(p => (
            <div key={p.label} className="card">
              <span className="tag tag-blue" style={{ marginBottom: 8, display: 'inline-block' }}>{p.label}</span>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, lineHeight: 1.6, color: 'var(--mut)' }}>
                {p.context || ''}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
