import { useState } from 'react'
import { gerar } from '../../lib/gh.js'
import { promptEstrategia } from '../../lib/prompts.js'

// Canais recomendados por geração (fonte: generation-context.js "onde descobre").
const CANAL_POR_GERACAO = {
  'gen-z':      ['tiktok', 'instagram'],
  'millennial': ['youtube', 'instagram'],
  'gen-x':      ['instagram'],
}
const CANAIS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok',    label: 'TikTok' },
  { key: 'youtube',   label: 'YouTube' },
]

export default function Estrategia({ camp, produto, onUpdate }) {
  const salvo = camp.estrategia || {}
  const [canais, setCanais] = useState(
    salvo.canais?.length ? salvo.canais : (CANAL_POR_GERACAO[camp.geracao] || ['instagram', 'tiktok'])
  )
  const [plano, setPlano] = useState(salvo.plano || '')
  const [notas, setNotas] = useState(salvo.notas || '')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const toggleCanal = (k) =>
    setCanais(cs => cs.includes(k) ? cs.filter(x => x !== k) : [...cs, k])

  const gerarPlano = async () => {
    setLoading(true); setErro('')
    try {
      const txt = await gerar(promptEstrategia({
        gen: camp.geracao, produto, tema: camp.tema,
        angulo: camp.brief?.angulo, pilar: camp.pilar, canais,
      }))
      setPlano(txt.trim())
    } catch (e) {
      setErro(e.message || 'Erro ao gerar o plano.')
    } finally {
      setLoading(false)
    }
  }

  const salvar = () =>
    onUpdate({ estrategia: { canais, plano, notas } }, { done: !!(plano || notas) })

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Estratégia — plano de divulgação</h3>
      <p style={{ margin: '0 0 18px', color: 'var(--mut)', fontSize: 12.5, lineHeight: 1.6 }}>
        Canais, formatos e sequência ao longo da janela do produto. A IA parte do Brief
        (produto, geração, pilar, tema) — herança automática.
      </p>

      {(produto || camp.geracao || camp.pilar) && (
        <div className="alert" style={{ fontSize: 12, marginBottom: 18 }}>
          Herdado do Brief:{' '}
          {camp.brief?.produto_nome && <b>{camp.brief.produto_nome}</b>}
          {camp.geracao && <> · geração <b>{camp.geracao}</b></>}
          {camp.pilar && <> · pilar <b>{camp.pilar}</b></>}
          {produto?.divulgacao_inicio && <> · janela <b>{produto.divulgacao_inicio} → {produto.divulgacao_fim || '?'}</b></>}
        </div>
      )}

      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 10,
        letterSpacing: '.08em', color: 'var(--mut)', marginBottom: 8, textTransform: 'uppercase' }}>
        Canais
      </label>
      <div className="chips" style={{ marginBottom: 20 }}>
        {CANAIS.map(c => {
          const on = canais.includes(c.key)
          return (
            <button key={c.key} onClick={() => toggleCanal(c.key)}
              className={'tag ' + (on ? 'tag-blue' : 'tag-gray')}
              style={{ cursor: 'pointer', border: on ? '1px solid var(--blue)' : '1px solid transparent' }}>
              {on ? '✓ ' : ''}{c.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={gerarPlano} disabled={loading || !canais.length}>
          {loading ? '⏳ Gerando plano…' : '⚡ Gerar plano com IA'}
        </button>
        {!camp.geracao && <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>defina a geração no Brief p/ melhor resultado</span>}
      </div>

      {erro && <div className="alert" style={{ marginBottom: 14, color: '#e06060' }}>{erro}</div>}

      {plano && (
        <div className="card" style={{ background: 'var(--bg2)', marginBottom: 16 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 13, lineHeight: 1.6, color: 'var(--white)' }}>{plano}</pre>
        </div>
      )}

      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 10,
        letterSpacing: '.08em', color: 'var(--mut)', marginBottom: 6, textTransform: 'uppercase' }}>
        Notas / ajustes manuais
      </label>
      <textarea value={notas} onChange={e => setNotas(e.target.value)}
        placeholder="Refine o plano, adicione datas, responsáveis…" style={{ marginBottom: 18 }} />

      <div>
        <button className="btn btn-primary" onClick={salvar}>Salvar Estratégia e seguir →</button>
      </div>
    </div>
  )
}
