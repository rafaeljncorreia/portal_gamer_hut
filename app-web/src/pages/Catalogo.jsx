import { useState, useEffect } from 'react'
import { loadCatalogo } from '../lib/gh.js'

// Status DERIVADO em catalog.js (a_venda/pre_venda/nao_vende/aguardando).
const STATUS_MAP = {
  a_venda:    { label: 'À venda',    cls: 'tag-green' },
  pre_venda:  { label: 'Pré-venda',  cls: 'tag-teal' },
  nao_vende:  { label: 'Não vende',  cls: 'tag-gray' },
  aguardando: { label: 'Aguardando', cls: 'tag-blue' },
}

export default function Catalogo() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [soDivulgar, setSoDivulgar] = useState(false)

  useEffect(() => {
    loadCatalogo().then(p => { setProducts(p); setLoading(false) })
  }, [])

  const filtrados = products.filter(p => {
    if (filtroStatus && p.status !== filtroStatus) return false
    if (soDivulgar && (p.divulgar || '').toUpperCase() !== 'CONFIRMADO') return false
    return true
  })

  return (
    <>
      <div className="page-header">
        <h1 className="display">Catálogo</h1>
        <span className="mono" style={{ fontSize: 10, color: 'var(--mut)' }}>
          snapshot do board Monday · atualizado pelo Claude
        </span>
      </div>

      <div className="filtros">
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--mut)' }}>
          <input type="checkbox" checked={soDivulgar} onChange={e => setSoDivulgar(e.target.checked)} />
          só divulgar (CONFIRMADO)
        </label>
        <span className="mono" style={{ fontSize: 11, color: 'var(--mut)', alignSelf: 'center' }}>
          {filtrados.length} de {products.length} itens
        </span>
      </div>

      {loading ? (
        <div className="alert">Carregando catálogo…</div>
      ) : filtrados.length === 0 ? (
        <div className="alert">Nenhum produto encontrado.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th><th>Status</th><th>Plataformas</th><th>Onde vende</th>
                <th>Lançamento</th><th>Geração alvo</th><th>Pilar sugerido</th><th>Divulgar</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nome}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize: 11 }}>{p.plataformas || '—'}</td>
                  <td style={{ fontSize: 11 }}>{p.onde_vende || '—'}</td>
                  <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{p.data_lancamento || '—'}</td>
                  <td><span className="tag tag-violet">{p.geracao_alvo || '—'}</span></td>
                  <td style={{ fontSize: 11 }}>{p.pilar_sugerido || '—'}</td>
                  <td><DivulgarBadge val={p.divulgar} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status || '—', cls: 'tag-gray' }
  return <span className={'tag ' + cfg.cls}>{cfg.label}</span>
}

function DivulgarBadge({ val }) {
  const v = (val || '').toUpperCase()
  if (!v || v === 'AGUARDANDO') return <span className="tag tag-gray">Aguardando</span>
  if (v === 'CONFIRMADO') return <span className="tag tag-green">Confirmado</span>
  if (v === 'PARADO') return <span className="tag" style={{ background: 'rgba(200,60,60,.18)', color: '#e06060' }}>Parado</span>
  return <span className="tag tag-gray">{val}</span>
}
