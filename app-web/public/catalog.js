/* ============================================================
   GAMER HUT — Catálogo (1.0, snapshot estático)
   ------------------------------------------------------------
   Lê catalog.json (snapshot do board Monday de pré-vendas) e
   expõe helpers para os geradores ficarem "catálogo-aware".
   Sem backend: v2 troca o snapshot por sync ao vivo.
   Ordem de carregamento: config.js → generation-context.js →
   brand-voice.js → catalog.js → App
   ============================================================ */
(function () {
  var CACHE = null;

  // Mapeia o rótulo "Geração Alvo" do board → chave de GH_GENERATIONS.
  // Combos ("Gen Z / Millennial") usam o PRIMEIRO como principal.
  function mapGeracao(label) {
    if (!label) return null;
    var first = String(label).split('/')[0].trim().toLowerCase();
    if (first.indexOf('gen z') === 0 || first === 'genz') return 'gen-z';
    if (first.indexOf('gen x') === 0 || first === 'genx') return 'gen-x';
    if (first.indexOf('millennial') === 0) return 'millennial';
    return null;
  }

  // Sugestão de tom (GH_TONES) a partir do Pilar Sugerido do board.
  function sugereTom(pilar) {
    if (!pilar) return null;
    var p = String(pilar).toLowerCase();
    if (p.indexOf('lore') >= 0 || p.indexOf('curiosidade') >= 0) return 'nostalgico';
    if (p.indexOf('review') >= 0 || p.indexOf('dica') >= 0) return 'informativo';
    if (p.indexOf('drop') >= 0 || p.indexOf('lançamento') >= 0 || p.indexOf('lancamento') >= 0) return 'hype';
    return null;
  }

  // Status DERIVADO (nunca digitado). hoje = 'YYYY-MM-DD'.
  function deriveStatus(j, hoje) {
    hoje = hoje || new Date().toISOString().slice(0, 10);
    var vende = j.onde_vende && j.onde_vende.toLowerCase().indexOf('indispon') < 0;
    if (!vende && (j.onde_vende || '').toLowerCase().indexOf('indispon') >= 0) return 'nao_vende';
    if (vende && j.data_lancamento && j.data_lancamento <= hoje) return 'a_venda';
    if ((j.pv_liberada || '').toUpperCase() === 'SIM' ||
        (j.data_lancamento && j.data_lancamento > hoje)) return 'pre_venda';
    return 'aguardando';
  }

  var STATUS_LABEL = {
    a_venda: 'À venda', pre_venda: 'Pré-venda',
    nao_vende: 'Não vende (ainda)', aguardando: 'Aguardando'
  };

  function enrich(j) {
    return Object.assign({}, j, {
      status: deriveStatus(j),
      status_label: STATUS_LABEL[deriveStatus(j)] || deriveStatus(j),
      geracao_key: mapGeracao(j.geracao_alvo),
      tom_sugerido: sugereTom(j.pilar_sugerido)
    });
  }

  window.GH_CATALOG = {
    // Carrega e cacheia o snapshot. Retorna Promise<array de jogos enriquecidos>.
    load: function () {
      if (CACHE) return Promise.resolve(CACHE);
      // DIVERGE da cópia raiz de propósito: no app-web (Vite, servido na raiz) o
      // caminho precisa ser absoluto, senão rotas aninhadas (/campanha/:id)
      // resolvem 'catalog.json' contra a rota e caem no fallback SPA. Ver DIRETRIZ §6.
      return fetch('/catalog.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          CACHE = (data.jogos || []).map(enrich);
          return CACHE;
        });
    },
    byId: function (id) { return (CACHE || []).filter(function (j) { return j.id === id; })[0] || null; },
    // Só os que estão marcados pra divulgar (fila real de trabalho).
    paraDivulgar: function () {
      return (CACHE || []).filter(function (j) { return (j.divulgar || '').toUpperCase() === 'CONFIRMADO'; });
    },
    deriveStatus: deriveStatus,
    mapGeracao: mapGeracao,
    sugereTom: sugereTom
  };
})();
