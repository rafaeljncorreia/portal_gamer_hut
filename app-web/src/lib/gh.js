/* ============================================================
   GAMER HUT — Ponte para os globais window.GH_* (cérebro + catálogo)
   ------------------------------------------------------------
   Os módulos config.js / generation-context.js / brand-voice.js /
   catalog.js são carregados como <script> em index.html (ver
   DIRETRIZ-PLATAFORMA.md §6) e penduram em window.GH_*. Esta ponte
   os expõe de forma React-friendly, sem reescrever nada.
   ============================================================ */

export function generations() { return window.GH_GENERATIONS || {} }
export function tones() { return window.GH_TONES || {} }
export function platforms() { return window.GH_PLATFORMS || {} }
export function brandBase() { return window.GH_BRAND || '' }

/** getBrandVoice(gen, plataforma, tom) — guia completo montado. Fallback: base pura. */
export function getBrandVoice(generation, platform, tone) {
  if (typeof window.getBrandVoice === 'function') return window.getBrandVoice(generation, platform, tone)
  return brandBase()
}

export function proxyUrl() {
  return (window.GH_CONFIG && window.GH_CONFIG.proxyUrl) || ''
}

/** Carrega o snapshot do catálogo (jogos enriquecidos). Retorna []. */
export async function loadCatalogo() {
  if (!window.GH_CATALOG) return []
  try { return await window.GH_CATALOG.load() } catch { return [] }
}

export function produtoPorId(id) {
  return (window.GH_CATALOG && window.GH_CATALOG.byId) ? window.GH_CATALOG.byId(id) : null
}

/** Chama o proxy de IA. Contrato: POST {prompt} → {text}. Lança em erro. */
export async function gerar(prompt, opts = {}) {
  const url = proxyUrl()
  if (!url) throw new Error('Proxy de IA não configurado (window.GH_CONFIG.proxyUrl).')
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, ...opts }),
  })
  let d = {}
  try { d = await r.json() } catch { /* resposta não-JSON */ }
  if (!r.ok) throw new Error(d.error || ('Erro na IA (' + r.status + ')'))
  return d.text || ''
}
