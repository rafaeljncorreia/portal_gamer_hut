/* ============================================================
   PORTAL GAMER HUT — Servidor de IA (Cloudflare Worker)
   Proxy seguro entre o site publicado e a API da Anthropic.
   A CHAVE DA API fica AQUI no servidor (secret), nunca no site.
   Veja DEPLOY.md para o passo a passo.
   ============================================================ */

// Quais sites podem usar este servidor. Deixe '*' enquanto testa.
// Depois de publicar, troque pela sua URL do GitHub Pages para travar o acesso, ex:
//   const ALLOWED_ORIGINS = ['https://zerotrinta.github.io'];
const ALLOWED_ORIGINS = ['*'];

// Modelo da Anthropic. Sonnet 4.6 = ótimo p/ copy. Haiku 4.5 = mais barato/rápido.
const MODEL = 'claude-sonnet-4-6';        // ou 'claude-haiku-4-5'
const MAX_TOKENS = 2048;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowOrigin =
      ALLOWED_ORIGINS.includes('*') ? '*'
      : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '');

    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    // Pre-flight do navegador
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST')
      return json({ error: 'Use POST.' }, 405, cors);

    // Bloqueia origens não autorizadas (quando não está em '*')
    if (!ALLOWED_ORIGINS.includes('*') && origin && !ALLOWED_ORIGINS.includes(origin))
      return json({ error: 'Origem não autorizada.' }, 403, cors);

    if (!env.ANTHROPIC_API_KEY)
      return json({ error: 'Servidor sem ANTHROPIC_API_KEY configurada.' }, 500, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'JSON inválido.' }, 400, cors); }

    const prompt = (body && body.prompt || '').toString();
    if (!prompt.trim()) return json({ error: 'Faltou o campo "prompt".' }, 400, cors);

    try {
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
    } catch (e) {
      return json({ error: 'Falha ao falar com a IA: ' + String(e) }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });
}
