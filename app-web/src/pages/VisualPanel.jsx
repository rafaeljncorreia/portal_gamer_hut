import { useState } from 'react'
import { generations } from '../lib/gh.js'

const PORTAL = 'https://rafaeljncorreia.github.io/portal_gamer_hut'

export default function VisualPanel({ camp, onSalvar }) {
  const [notas, setNotas] = useState(camp.visual?.notas || '')

  const abrirStudio = () => {
    // Seta no localStorage o contexto da campanha p/ o Studio ler
    localStorage.setItem('gh-campaign-context', JSON.stringify({
      campanha_id: camp.id,
      campanha_nome: camp.nome,
      produto_nome: camp.brief?.produto_nome || '',
      geracao: camp.geracao,
      pilar: camp.pilar,
      tema: camp.tema,
    }))
    window.open(PORTAL + '/studio.html', '_blank')
  }

  const salvar = () => {
    onSalvar({
      visual: {
        notas: notas.trim(),
        atualizado_em: new Date().toISOString(),
      },
    })
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Visual — peças & KV</h3>
      <p style={{ margin: '0 0 20px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        O Creative Studio é o estágio final da campanha. Abra o Studio com o contexto
        herdado do Brief e crie as peças visuais (posts, carrosséis, capas).
      </p>

      <ContextoBrief camp={camp} />

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={abrirStudio}>
          Abrir Creative Studio →
        </button>
        <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>
          abre em nova aba com o contexto da campanha
        </span>
      </div>

      <div style={{ marginTop: 20 }}>
        <label className="mono" style={{ fontSize: 10, color: 'var(--mut)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Notas do estágio Visual
        </label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Links das peças criadas, observações de revisão, aprovações..." />
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={salvar}>
          Salvar e concluir etapa →
        </button>
      </div>
    </div>
  )
}

function ContextoBrief({ camp }) {
  if (!camp.produto_id && !camp.geracao && !camp.pilar) return null
  return (
    <div className="alert" style={{ fontSize: 12, marginBottom: 16 }}>
      Contexto herdado do Brief:{' '}
      {camp.brief?.produto_nome && <b>{camp.brief.produto_nome}</b>}
      {camp.geracao && <> · geração <b>{generations()[camp.geracao]?.full || camp.geracao}</b></>}
      {camp.pilar && <> · pilar <b>{camp.pilar}</b></>}
      {camp.tema && <> · tema <b>{camp.tema}</b></>}
    </div>
  )
}
