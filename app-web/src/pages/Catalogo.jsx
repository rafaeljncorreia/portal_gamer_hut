import { useState, useEffect, useCallback } from 'react'

const STATUS_MAP = {
  a_venda:    { label: 'À venda',   cls: 'tag-green' },
  pre_venda:  { label: 'Pré-venda', cls: 'tag-teal' },
  nao_vende:  { label: 'Não vende', cls: 'tag-gray' },
  aguardando: { label: 'Aguardando',cls: 'tag-blue' },
}

const GRUPOS = [
  'Próximos Lançamento', 'Em Pré Venda', 'Lançamentos', 'Relembrados', 'Concluídos'
]

export default function Catalogo({ api }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')

  const fetchCatalog = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch(api + '/catalog')
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao carregar catálogo')
      setProducts(d.products || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => { fetchCatalog() }, [fetchCatalog])

  const sync = async () => {
    setSyncing(true)
    try {
      const r = await fetch(api + '/catalog/sync', { method: 'POST' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao sincronizar')
      setToast(`Sincronizado: ${d.upserts} produtos`)
      await fetchCatalog()
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncing(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  const filtrados = products.filter(p => {
    if (filtroStatus && p.status !== filtroStatus) return false
    if (filtroGrupo && p.grupo !== filtroGrupo) return false
    return true
  })

  return (
    <>
      <div className="page-header">
        <h1 className="display">Catálogo</h1>
        <button className="btn btn-primary btn-sm" onClick={sync} disabled={syncing}>
          {syncing ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </div>

      {error && <div className="alert" style={{ marginBottom:20 }}>{error}</div>}

      <div className="filtros">
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}>
          <option value="">Todos os grupos</option>
          {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <span className="mono" style={{ fontSize:11, color:'var(--mut)', alignSelf:'center' }}>
          {filtrados.length} de {products.length} itens
        </span>
      </div>

      {loading ? (
        <div className="alert">Carregando catálogo…</div>
      ) : filtrados.length === 0 ? (
        <div className="alert">Nenhum produto encontrado.</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Grupo</th>
                <th>Status</th>
                <th>Plataformas</th>
                <th>Onde vende</th>
                <th>Data lançamento</th>
                <th>Geração alvo</th>
                <th>Pilar sugerido</th>
                <th>Divulgar</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight:600 }}>{p.nome}</td>
                  <td><span className="tag tag-gray">{p.grupo}</span></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize:11 }}>{p.plataformas || '—'}</td>
                  <td style={{ fontSize:11 }}>{p.onde_vende || '—'}</td>
                  <td style={{ fontSize:11, whiteSpace:'nowrap' }}>{p.data_lancamento || '—'}</td>
                  <td><span className="tag tag-violet">{p.geracao_alvo || '—'}</span></td>
                  <td style={{ fontSize:11 }}>{p.pilar_sugerido || '—'}</td>
                  <td><DivulgarBadge val={p.divulgar} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status || '—', cls: 'tag-gray' }
  return <span className={'tag ' + cfg.cls}>{cfg.label}</span>
}

function DivulgarBadge({ val }) {
  if (!val || val === 'AGUARDANDO') return <span className="tag tag-gray">Aguardando</span>
  if (val === 'CONFIRMADO') return <span className="tag tag-green">Confirmado</span>
  if (val === 'PARADO') return <span className="tag" style={{ background:'rgba(200,60,60,.18)', color:'#e06060' }}>Parado</span>
  return <span className="tag tag-gray">{val}</span>
}
