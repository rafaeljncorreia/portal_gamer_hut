import { useState } from 'react'
import { brandBase, generations, tones, platforms } from '../lib/gh.js'

const ROTULO = {
  brand:      { label: 'Branding Book', cor: 'var(--orange)' },
  generation: { label: 'Geração',       cor: 'var(--violet)' },
  tone:       { label: 'Tom de Voz',    cor: 'var(--teal)' },
  platform:   { label: 'Plataforma',    cor: 'var(--blue)' },
}

export default function Marca() {
  // Monta os blocos vigentes a partir dos globais window.GH_* (somente leitura no 1.0).
  const blocks = [
    { tipo: 'brand', key: 'base', label: 'Branding Book — base obrigatória', conteudo: brandBase() },
    ...Object.values(generations()).map(g => ({
      tipo: 'generation', key: g.id, label: `${g.emoji || ''} ${g.full}`,
      conteudo: `${g.desc}\n${(g.context || '').trim()}`,
    })),
    ...Object.values(tones()).map(t => ({
      tipo: 'tone', key: t.label, label: t.label, conteudo: `${t.desc}\n\n${t.context || ''}`,
    })),
    ...Object.values(platforms()).map(p => ({
      tipo: 'platform', key: p.label, label: p.label, conteudo: p.context || '',
    })),
  ]

  return (
    <>
      <div className="page-header">
        <h1 className="display">Cérebro de Marca</h1>
        <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>
          leitura · edição versionada = v2 (D1)
        </span>
      </div>

      {blocks.map((b, i) => <BrandBlock key={i} b={b} />)}
    </>
  )
}

function BrandBlock({ b }) {
  const [open, setOpen] = useState(false)
  const rot = ROTULO[b.tipo] || { label: b.tipo, cor: 'var(--mut)' }
  const texto = (b.conteudo || '').trim()
  const longo = texto.length > 320
  const mostrado = open || !longo ? texto : texto.slice(0, 320) + '…'

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="tag" style={{ background: rot.cor + '22', color: rot.cor, border: '1px solid ' + rot.cor + '44' }}>
          {rot.label}
        </span>
        <strong style={{ fontSize: 14 }}>{b.label}</strong>
      </div>
      <pre style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, lineHeight: 1.65,
        whiteSpace: 'pre-wrap', color: 'var(--mut)' }}>{mostrado}</pre>
      {longo && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setOpen(o => !o)}>
          {open ? 'Recolher' : 'Ver tudo'}
        </button>
      )}
    </div>
  )
}
