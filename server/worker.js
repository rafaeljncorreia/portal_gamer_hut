/* ============================================================
   PORTAL GAMER HUT — Plataforma de Gestão · Backend (Cloudflare Worker)
   ------------------------------------------------------------
   Rotas:
     POST /ai            → proxy Anthropic (PRESERVADO do worker antigo)
     GET  /catalog       → lista o catálogo do cache D1 (status derivado)
     POST /catalog/sync  → lê o board Monday de pré-vendas → upsert no D1

   Secrets (wrangler secret put ...):
     ANTHROPIC_API_KEY  — chave da Anthropic (proxy /ai)
     MONDAY_TOKEN       — token de API do Monday c/ acesso ao board fonte
   Binding D1 (wrangler.toml): env.DB
   ============================================================ */

// Origens permitidas. '*' enquanto testa; travar na URL do Pages depois.
const ALLOWED_ORIGINS = ['*'];

// Modelo Anthropic. Sonnet 4.6 = ótimo p/ copy. Haiku 4.5 = mais barato.
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;

// Board fonte (Alinhamento Pré-Vendas e Lançamentos) e mapeamento
// coluna→campo (auditado 01/07/2026). O `text` de cada column_value
// já vem no formato usável (ex: "PS5, SW2", "2026-10-16", "CONFIRMADO").
const CATALOG_BOARD_ID = '18417580003';
const COL = {
  divulgacao:        'timerange_mm4853da',  // "2026-06-12 - 2026-11-15"
  exclusividade_gh:  'color_mm483qza',
  onde_vende:        'dropdown_mm4819jt',
  plataformas:       'dropdown_mm48vfmk',
  pv_liberada:       'color_mm48essg',       // SIM / NÃO
  data_pre_venda:    'date_mm48196n',
  data_lancamento:   'date_mm485gd5',
  status_lancamento: 'color_mm48nng3',
  pilar_sugerido:    'dropdown_mm48p6e0',
  geracao_alvo:      'dropdown_mm488aqw',
  grau_importancia:  'color_mm481qgt',
  divulgar:          'color_mm487xd9',        // AGUARDANDO / CONFIRMADO / PARADO
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED_ORIGINS.includes('*')
      ? '*'
      : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '');
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      // --- Catálogo -------------------------------------------------
      if (path === '/catalog' && request.method === 'GET')
        return await listCatalog(env, cors);
      if (path === '/catalog/sync' && request.method === 'POST')
        return await syncCatalog(env, cors);

      // --- Marca (CRUD versionado do cérebro de marca) -------------
      if (path === '/brand' && request.method === 'GET')
        return await listBrand(env, cors);
      if (path === '/brand' && request.method === 'POST')
        return await saveBrand(request, env, cors);

      // --- IA (proxy Anthropic) — contrato preservado ---------------
      if (path === '/ai' || path === '/') {
        if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, cors);
        return await proxyAI(request, env, cors);
      }

      return json({ error: 'Rota não encontrada.' }, 404, cors);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500, cors);
    }
  },
};

/* ---------- /ai : proxy Anthropic (idêntico ao contrato antigo) ---------- */
async function proxyAI(request, env, cors) {
  if (!env.ANTHROPIC_API_KEY)
    return json({ error: 'Servidor sem ANTHROPIC_API_KEY configurada.' }, 500, cors);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido.' }, 400, cors); }

  const prompt = (body && body.prompt || '').toString();
  if (!prompt.trim()) return json({ error: 'Faltou o campo "prompt".' }, 400, cors);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model || MODEL,
      max_tokens: body.max_tokens || MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await r.json();
  if (!r.ok)
    return json({ error: (data.error && data.error.message) || ('Erro ' + r.status) }, r.status, cors);
  const text = (data.content || []).map(b => b.text || '').join('');
  return json({ text }, 200, cors);
}

/* ---------- /catalog : lê o cache D1 e devolve com status derivado ---------- */
async function listCatalog(env, cors) {
  if (!env.DB) return json({ error: 'Binding D1 (DB) não configurado.' }, 500, cors);
  const { results } = await env.DB.prepare(
    'SELECT * FROM products ORDER BY data_lancamento IS NULL, data_lancamento ASC'
  ).all();
  const hoje = new Date().toISOString().slice(0, 10);
  const products = (results || []).map(p => ({ ...p, status: derivarStatus(p, hoje) }));
  return json({ products, count: products.length }, 200, cors);
}

// Status "à venda / pré-venda / não vende / aguardando" é DERIVADO,
// nunca digitado. Regras auditadas contra o board.
function derivarStatus(p, hoje) {
  if ((p.onde_vende || '').toLowerCase().includes('indispon')) return 'nao_vende';
  if (p.grupo === 'Em Pré Venda' || (p.pv_liberada || '').toUpperCase() === 'SIM') return 'pre_venda';
  if (p.data_lancamento && p.data_lancamento <= hoje) return 'a_venda';
  return 'aguardando';
}

/* ---------- /catalog/sync : Monday → D1 (upsert por monday_item_id) ---------- */
async function syncCatalog(env, cors) {
  if (!env.DB) return json({ error: 'Binding D1 (DB) não configurado.' }, 500, cors);
  if (!env.MONDAY_TOKEN) return json({ error: 'Servidor sem MONDAY_TOKEN.' }, 500, cors);

  const colIds = Object.values(COL);
  const query = `query ($board:[ID!], $cols:[String!]) {
    boards(ids:$board) {
      items_page(limit: 200) {
        items {
          id name
          group { title }
          column_values(ids:$cols) { id text }
        }
      }
    }
  }`;
  const r = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Authorization': env.MONDAY_TOKEN },
    body: JSON.stringify({ query, variables: { board: [CATALOG_BOARD_ID], cols: colIds } }),
  });
  const data = await r.json();
  if (data.errors) return json({ error: 'Monday: ' + JSON.stringify(data.errors) }, 502, cors);

  const items = ((data.data.boards[0] || {}).items_page || {}).items || [];
  let upserts = 0;
  for (const it of items) {
    const cv = {};
    for (const c of it.column_values) cv[c.id] = (c.text || '').trim();
    const tr = (cv[COL.divulgacao] || '').split(' - ');
    const row = {
      monday_item_id:    it.id,
      grupo:             (it.group && it.group.title) || null,
      nome:              it.name,
      data_lancamento:   cv[COL.data_lancamento] || null,
      data_pre_venda:    cv[COL.data_pre_venda] || null,
      divulgacao_inicio: tr[0] || null,
      divulgacao_fim:    tr[1] || null,
      plataformas:       cv[COL.plataformas] || null,
      onde_vende:        cv[COL.onde_vende] || null,
      pv_liberada:       cv[COL.pv_liberada] || null,
      status_lancamento: cv[COL.status_lancamento] || null,
      exclusividade_gh:  cv[COL.exclusividade_gh] || null,
      grau_importancia:  cv[COL.grau_importancia] || null,
      divulgar:          cv[COL.divulgar] || null,
      geracao_alvo:      cv[COL.geracao_alvo] || null,
      pilar_sugerido:    cv[COL.pilar_sugerido] || null,
    };
    await env.DB.prepare(`
      INSERT INTO products (monday_item_id, grupo, nome, data_lancamento, data_pre_venda,
        divulgacao_inicio, divulgacao_fim, plataformas, onde_vende, pv_liberada,
        status_lancamento, exclusividade_gh, grau_importancia, divulgar, geracao_alvo,
        pilar_sugerido, sincronizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, datetime('now'))
      ON CONFLICT(monday_item_id) DO UPDATE SET
        grupo=excluded.grupo, nome=excluded.nome, data_lancamento=excluded.data_lancamento,
        data_pre_venda=excluded.data_pre_venda, divulgacao_inicio=excluded.divulgacao_inicio,
        divulgacao_fim=excluded.divulgacao_fim, plataformas=excluded.plataformas,
        onde_vende=excluded.onde_vende, pv_liberada=excluded.pv_liberada,
        status_lancamento=excluded.status_lancamento, exclusividade_gh=excluded.exclusividade_gh,
        grau_importancia=excluded.grau_importancia, divulgar=excluded.divulgar,
        geracao_alvo=excluded.geracao_alvo, pilar_sugerido=excluded.pilar_sugerido,
        sincronizado_em=datetime('now')
    `).bind(
      row.monday_item_id, row.grupo, row.nome, row.data_lancamento, row.data_pre_venda,
      row.divulgacao_inicio, row.divulgacao_fim, row.plataformas, row.onde_vende, row.pv_liberada,
      row.status_lancamento, row.exclusividade_gh, row.grau_importancia, row.divulgar,
      row.geracao_alvo, row.pilar_sugerido
    ).run();
    upserts++;
  }
  return json({ ok: true, upserts }, 200, cors);
}

/* ---------- /brand : listar blocos vigentes do cérebro de marca ---------- */
async function listBrand(env, cors) {
  if (!env.DB) return json({ error: 'Binding D1 (DB) não configurado.' }, 500, cors);
  const { results } = await env.DB.prepare(
    `SELECT id, bloco_tipo, bloco_key, label, conteudo, meta, criado_em
     FROM brand_versions WHERE is_current = 1
     ORDER BY bloco_tipo, bloco_key`
  ).all();
  return json({ blocks: results || [], count: (results || []).length }, 200, cors);
}

/* ---------- /brand : criar nova versão de um bloco (versionamento) ---------- */
async function saveBrand(request, env, cors) {
  if (!env.DB) return json({ error: 'Binding D1 (DB) não configurado.' }, 500, cors);
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'JSON inválido.' }, 400, cors); }

  const { bloco_tipo, bloco_key, label, conteudo, meta } = body || {};
  if (!bloco_tipo || !bloco_key || !conteudo)
    return json({ error: 'Campos obrigatórios: bloco_tipo, bloco_key, conteudo.' }, 400, cors);

  const tiposValidos = ['brand', 'tone', 'platform', 'generation'];
  if (!tiposValidos.includes(bloco_tipo))
    return json({ error: 'bloco_tipo inválido. Use: ' + tiposValidos.join(', ') }, 400, cors);

  // Transação: desativa versão anterior + insere nova
  const desativar = env.DB.prepare(
    `UPDATE brand_versions SET is_current = 0
     WHERE bloco_tipo = ? AND bloco_key = ? AND is_current = 1`
  ).bind(bloco_tipo, bloco_key);

  const inserir = env.DB.prepare(
    `INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).bind(bloco_tipo, bloco_key, label || null, conteudo, meta || null);

  await env.DB.batch([desativar, inserir]);

  return json({ ok: true, message: 'Nova versão salva. Versão anterior desativada.' }, 200, cors);
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });
}
