import { useState, useEffect, useCallback } from 'react'

const TIPO_ROTULO = {
  brand:      { label: 'Brand',       cor: 'var(--orange)' },
  tone:       { label: 'Tom de Voz',  cor: 'var(--teal)' },
  platform:   { label: 'Plataforma',  cor: 'var(--blue)' },
  generation: { label: 'Geração',     cor: 'var(--violet)' },
}

export default function Marca({ api }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ conteudo: '', label: '' })

  const fetchBrand = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch(api + '/brand')
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao carregar marca')
      setBlocks(d.blocks || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => { fetchBrand() }, [fetchBrand])

  const startEdit = (b) => {
    setEditing(b.id)
    setEditForm({ conteudo: b.conteudo, label: b.label || '' })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({ conteudo: '', label: '' })
  }

  const saveEdit = async (b) => {
    try {
      const r = await fetch(api + '/brand', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bloco_tipo: b.bloco_tipo,
          bloco_key: b.bloco_key,
          label: editForm.label,
          conteudo: editForm.conteudo,
          meta: b.meta,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao salvar')
      setToast(`"${editForm.label || b.bloco_key}" salvo (nova versão)`)
      setEditing(null)
      await fetchBrand()
      setTimeout(() => setToast(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  const renderConteudo = (text) => {
    if (text.length > 300) return text.slice(0, 300) + '…'
    return text
  }

  return (
    <>
      <div className="page-header">
        <h1 className="display">Cérebro de Marca</h1>
      </div>

      {error && <div className="alert" style={{ marginBottom:20 }}>{error}</div>}

      {loading ? (
        <div className="alert">Carregando marca…</div>
      ) : blocks.length === 0 ? (
        <div className="alert">Nenhum bloco de marca encontrado. Execute o seed.</div>
      ) : (
        blocks.map(b => {
          const tipo = TIPO_ROTULO[b.bloco_tipo] || { label: b.bloco_tipo, cor: 'var(--mut)' }
          const isEditing = editing === b.id

          return (
            <div className="card" key={b.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <span className="tag" style={{ background:tipo.cor + '22', color:tipo.cor, border:'1px solid ' + tipo.cor + '44', marginRight:8 }}>
                    {tipo.label}
                  </span>
                  <span className="tag tag-gray" style={{ marginRight:8 }}>{b.bloco_key}</span>
                  <strong style={{ fontSize:14 }}>{b.label || b.bloco_key}</strong>
                </div>
                {!isEditing && (
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(b)}>Editar</button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div className="form-group">
                    <label>Rótulo</label>
                    <input type="text" value={editForm.label}
                      onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                      style={{ width:'100%', background:'var(--bg2)', color:'var(--white)', border:'1px solid var(--lineSoft)', borderRadius:8, padding:'10px 12px', fontFamily:'Space Grotesk,sans-serif', fontSize:13 }} />
                  </div>
                  <div className="form-group">
                    <label>Conteúdo</label>
                    <textarea value={editForm.conteudo}
                      onChange={e => setEditForm(f => ({ ...f, conteudo: e.target.value }))} />
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(b)}>Salvar</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="meta" style={{ marginBottom:8 }}>
                    Versão #{b.id} · {b.criado_em}
                  </div>
                  <pre style={{ margin:0, fontFamily:'Space Grotesk,sans-serif', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', color:'var(--mut)' }}>
                    {renderConteudo(b.conteudo)}
                  </pre>
                </div>
              )}
            </div>
          )
        })
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
