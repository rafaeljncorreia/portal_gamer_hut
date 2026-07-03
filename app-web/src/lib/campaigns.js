/* ============================================================
   GAMER HUT — Store de Campanhas (localStorage, sem backend)
   ------------------------------------------------------------
   Coração do modelo campaign-centric (ver DIRETRIZ-PLATAFORMA.md).
   Chave: 'gh-campaigns'. O formato espelha o schema D1
   (server/schema.sql: plan_items/generations) p/ migração v2 trivial.
   ============================================================ */

const KEY = 'gh-campaigns'

export const ESTAGIOS = ['brief', 'estrategia', 'materiais', 'visual']

export const ESTADOS = {
  rascunho:     { label: 'Rascunho',     cls: 'tag-gray' },
  em_andamento: { label: 'Em andamento', cls: 'tag-teal' },
  concluida:    { label: 'Concluída',    cls: 'tag-green' },
  arquivada:    { label: 'Arquivada',    cls: 'tag-gray' },
}

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeAll(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr))
  return arr
}

function novoId() {
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function list(incluirArquivadas = false) {
  const arr = readAll().sort((a, b) => (b.atualizada_em || '').localeCompare(a.atualizada_em || ''))
  return incluirArquivadas ? arr : arr.filter(c => c.estado !== 'arquivada')
}

export function get(id) {
  return readAll().find(c => c.id === id) || null
}

export function create({ nome = '', tema = '', produto_id = null, geracao = null, pilar = null } = {}) {
  const agora = new Date().toISOString()
  const c = {
    id: novoId(),
    nome: nome.trim() || 'Nova campanha',
    tema: tema.trim(),
    estado: 'rascunho',
    criada_em: agora,
    atualizada_em: agora,
    produto_id,
    geracao,
    pilar,
    progresso: { brief: false, estrategia: false, materiais: false, visual: false },
    brief: {},
    estrategia: {
      canais: [],
      janela_inicio: '',
      janela_fim: '',
      dias_semana: [],
      frequencia: '1x',
      observacoes: '',
    },
    materiais: {},
    visual: {},
  }
  writeAll([c, ...readAll()])
  return c
}

export function update(id, patch) {
  const arr = readAll()
  const i = arr.findIndex(c => c.id === id)
  if (i < 0) return null
  const atual = arr[i]
  const merged = {
    ...atual,
    ...patch,
    progresso: { ...atual.progresso, ...(patch.progresso || {}) },
    atualizada_em: new Date().toISOString(),
  }
  if (atual.estado !== 'arquivada' && !patch.estado) {
    const feitos = ESTAGIOS.filter(e => merged.progresso[e]).length
    merged.estado = feitos === 0 ? 'rascunho' : feitos === ESTAGIOS.length ? 'concluida' : 'em_andamento'
  }
  arr[i] = merged
  writeAll(arr)
  return merged
}

export function marcarEstagio(id, estagio, feito = true) {
  return update(id, { progresso: { [estagio]: feito } })
}

export function archive(id) {
  return update(id, { estado: 'arquivada' })
}

export function unarchive(id) {
  const c = get(id)
  if (!c) return null
  const feitos = ESTAGIOS.filter(e => c.progresso[e]).length
  const estado = feitos === 0 ? 'rascunho' : feitos === ESTAGIOS.length ? 'concluida' : 'em_andamento'
  return update(id, { estado })
}

export function remove(id) {
  writeAll(readAll().filter(c => c.id !== id))
}

export function progressoDe(c) {
  if (!c) return { feitos: 0, total: ESTAGIOS.length, pct: 0, proximo: 'brief' }
  const feitos = ESTAGIOS.filter(e => c.progresso && c.progresso[e]).length
  const proximo = ESTAGIOS.find(e => !(c.progresso && c.progresso[e])) || null
  return { feitos, total: ESTAGIOS.length, pct: Math.round((feitos / ESTAGIOS.length) * 100), proximo }
}
