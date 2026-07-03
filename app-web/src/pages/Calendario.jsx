import { useState, useEffect } from 'react'

export default function Calendario() {
  const [calendario, setCalendario] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/calendario-semanal.json')
      .then(r => r.json())
      .then(d => { setCalendario(d.dias || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hoje = new Date().getDay()

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Gamer Hut · Conteúdo</span>
          <h1 className="display" style={{ fontSize: 34, margin: '14px 0 0' }}>Calendário Semanal</h1>
        </div>
      </div>

      {loading ? (
        <div className="alert">Carregando calendário…</div>
      ) : calendario.length === 0 ? (
        <div className="alert">Nenhum dado de calendário encontrado.</div>
      ) : (
        <div className="cardgrid">
          {calendario.map(d => {
            const isHoje = d.dia === hoje
            return (
              <div key={d.slug} className="card" style={{
                borderColor: isHoje ? 'var(--orange)' : undefined,
                position: 'relative',
              }}>
                {isHoje && (
                  <span className="tag tag-orange" style={{ position: 'absolute', top: 12, right: 12 }}>
                    HOJE
                  </span>
                )}
                <div className="mono" style={{ fontSize: 11, color: 'var(--orange)', marginBottom: 8 }}>
                  {d.nome}
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>{d.tema}</h3>

                <div className="chips" style={{ marginBottom: 12 }}>
                  <span className="tag tag-teal">{d.formato}</span>
                  <span className="tag tag-violet">{d.template}</span>
                  <span className="tag tag-gray">{d.tag}</span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.6, marginBottom: 12 }}>
                  <strong style={{ color: 'var(--white)' }}>Gancho:</strong> {d.gancho}
                </div>

                <details style={{ fontSize: 12, color: 'var(--mut2)', cursor: 'pointer' }}>
                  <summary style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '.06em', color: 'var(--mut)' }}>
                    Ver fórmula + CTA
                  </summary>
                  <p style={{ marginTop: 8, lineHeight: 1.6 }}>{d.formula}</p>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--teal)', marginTop: 8 }}>
                    CTA: {d.cta}
                  </div>
                </details>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
