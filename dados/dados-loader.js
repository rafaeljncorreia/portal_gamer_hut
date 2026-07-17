(function() {
  'use strict';

  var BASE = 'dados';

  var PATHS = {
    plataformas: [
      BASE + '/plataformas/instagram.json',
      BASE + '/plataformas/youtube.json',
      BASE + '/plataformas/tiktok.json'
    ],
    formatos: [
      BASE + '/formatos/review.json',
      BASE + '/formatos/gameplay.json',
      BASE + '/formatos/unboxing.json',
      BASE + '/formatos/youtube-repost.json',
      BASE + '/formatos/video-curto.json',
      BASE + '/formatos/carrossel.json',
      BASE + '/formatos/post.json',
      BASE + '/formatos/quiz.json',
      BASE + '/formatos/ranking.json',
      BASE + '/formatos/meme.json'
    ],
    geracoes: [
      BASE + '/geracoes/gen-z.json',
      BASE + '/geracoes/millennial.json',
      BASE + '/geracoes/gen-x.json'
    ]
  };

  function carregar(urls) {
    return Promise.all(urls.map(function(url) {
      return fetch(url)
        .then(function(r) { return r.ok ? r.json() : null; })
        .catch(function() { return null; });
    }));
  }

  function indexar(arr) {
    var obj = {};
    (arr || []).forEach(function(item) {
      if (item && item.id) { obj[item.id] = item; }
      else { console.warn('dados-loader: item ignorado — sem id', item); }
    });
    return obj;
  }

  function limparExpiradas() {
    try {
      var licoes = JSON.parse(localStorage.getItem('gh-licoes') || '[]');
      var mudou = false;
      licoes.forEach(function(l) {
        if (l.ativa && l.expiraEm && new Date(l.expiraEm) < new Date()) {
          l.ativa = false;
          mudou = true;
        }
      });
      if (mudou) localStorage.setItem('gh-licoes', JSON.stringify(licoes));
    } catch(e) { console.warn('dados-loader: erro ao limpar lições expiradas', e); }
  }

  function carregarLicoes() {
    try {
      var raw = localStorage.getItem('gh-licoes');
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('dados-loader: gh-licoes corrompido, resetando para []');
        localStorage.setItem('gh-licoes', '[]');
        return [];
      }
      return parsed;
    } catch(e) {
      console.warn('dados-loader: erro ao ler gh-licoes, resetando', e);
      localStorage.setItem('gh-licoes', '[]');
      return [];
    }
  }

  function salvarLicoes(arr) {
    try { localStorage.setItem('gh-licoes', JSON.stringify(arr)); }
    catch(e) { console.warn('dados-loader: erro ao salvar lições', e); }
  }

  function licoesAtivas(plataformaId, formatoId, geracaoId) {
    limparExpiradas();
    var licoes = carregarLicoes();
    return licoes
      .filter(function(l) {
        return l.ativa
          && (!plataformaId || l.plataforma === plataformaId)
          && (!formatoId   || l.formato === formatoId)
          && (!geracaoId   || l.geracao === geracaoId);
      })
      .sort(function(a, b) { return b.forca - a.forca; })
      .slice(0, 5);
  }

  function adicionarLicao(texto, plataformaId, formatoId, geracaoId, geracaoOrigem, versaoPlataforma, versaoFormato) {
    if (!texto || !texto.trim()) return null;
    try {
      var licoes = carregarLicoes();
      var similar = licoes.find(function(l) {
        return l.ativa
          && l.plataforma === plataformaId
          && l.formato === formatoId
          && l.geracao === geracaoId
          && l.texto.toLowerCase() === texto.toLowerCase();
      });
      if (similar) {
        similar.forca = Math.min(1, (similar.forca || 1) + 0.1);
        similar.ultimoReforco = new Date().toISOString();
        similar.expiraEm = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
        salvarLicoes(licoes);
        return similar;
      }
      var licao = {
        id: 'l-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        texto: texto.trim(),
        plataforma: plataformaId || '',
        formato: formatoId || '',
        geracao: geracaoId || '',
        geracaoOrigem: geracaoOrigem || null,
        criadoEm: new Date().toISOString(),
        ultimoUso: new Date().toISOString(),
        ultimoReforco: new Date().toISOString(),
        forca: 1.0,
        ativa: true,
        expiraEm: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        versaoPlataforma: versaoPlataforma || 1,
        versaoFormato: versaoFormato || 1
      };
      licoes.push(licao);
      salvarLicoes(licoes);
      return licao;
    } catch(e) { console.warn('dados-loader: erro ao adicionar lição', e); return null; }
  }

  function reforcarLicao(id) {
    var licoes = carregarLicoes();
    var l = licoes.find(function(x) { return x.id === id; });
    if (!l) return false;
    l.forca = Math.min(1, (l.forca || 1) + 0.1);
    l.ultimoReforco = new Date().toISOString();
    l.expiraEm = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    l.ultimoUso = new Date().toISOString();
    salvarLicoes(licoes);
    return true;
  }

  function arquivarLicao(id) {
    var licoes = carregarLicoes();
    var l = licoes.find(function(x) { return x.id === id; });
    if (!l) return false;
    l.ativa = false;
    salvarLicoes(licoes);
    return true;
  }

  function reativarLicao(id) {
    var licoes = carregarLicoes();
    var l = licoes.find(function(x) { return x.id === id; });
    if (!l) return false;
    l.ativa = true;
    l.expiraEm = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    l.forca = Math.max(l.forca || 0, 0.5);
    salvarLicoes(licoes);
    return true;
  }

  function excluirLicao(id) {
    var licoes = carregarLicoes();
    var idx = licoes.findIndex(function(x) { return x.id === id; });
    if (idx === -1) return false;
    licoes.splice(idx, 1);
    salvarLicoes(licoes);
    return true;
  }

  function registrarGeracao(dados) {
    try {
      var geracoes = JSON.parse(localStorage.getItem('gh-geracoes') || '[]');
      var record = {
        id: 'g-' + Date.now(),
        criadoEm: new Date().toISOString(),
        status: 'pendente',
        feedback: '',
        licaoId: null,
        ...dados
      };
      geracoes.unshift(record);
      localStorage.setItem('gh-geracoes', JSON.stringify(geracoes));
      return record;
    } catch(e) { console.warn('dados-loader: erro ao registrar geração', e); return null; }
  }

  function atualizarGeracao(id, patch) {
    try {
      var geracoes = JSON.parse(localStorage.getItem('gh-geracoes') || '[]');
      var g = geracoes.find(function(x) { return x.id === id; });
      if (!g) return false;
      Object.assign(g, patch);
      localStorage.setItem('gh-geracoes', JSON.stringify(geracoes));
      return true;
    } catch(e) { console.warn('dados-loader: erro ao atualizar geração', e); return false; }
  }

  function montarPrompt(opts) {
    var p = opts || {};
    var plat = window.DADOS.plataformas[p.plataformaId];
    var fmt  = window.DADOS.formatos[p.formatoId];
    var ger  = window.DADOS.geracoes[p.geracaoId];

    var partes = [];

    if (window.GH_BRAND) partes.push(window.GH_BRAND);

    if (plat && (plat.instrucoes || plat.exemplos)) {
      partes.push(`---\n\nINSTRUÇÕES DE PLATAFORMA — ${plat.nome}\n${plat.instrucoes}`);
      if (plat.exemplos) partes.push(plat.exemplos);
    }

    if (fmt && (fmt.instrucoes || fmt.exemplos)) {
      partes.push(`---\n\nINSTRUÇÕES DE FORMATO — ${fmt.nome}\n${fmt.instrucoes}`);
      if (fmt.exemplos) partes.push(fmt.exemplos);
    }

    if (ger && (ger.instrucoes || ger.exemplos)) {
      partes.push(`---\n\nINSTRUÇÕES DE GERAÇÃO — ${ger.nome}\n${ger.instrucoes}`);
      if (ger.exemplos) partes.push(ger.exemplos);
    }

    var licoes = licoesAtivas(p.plataformaId, p.formatoId, p.geracaoId);
    if (licoes.length) {
      partes.push(`---\n\nLIÇÕES APRENDIDAS (aplicáveis)\n- ${licoes.map(function(l) { return l.texto; }).join('\n- ')}`);
    }

    var tarefa = 'TAREFA:\n';
    if (p.categoriaId) tarefa += `Categoria: ${p.categoriaId}\n`;
    if (p.tom) tarefa += `Tom: ${p.tom}\n`;
    if (p.preco) tarefa += `Preço: ${p.preco}\n`;
    if (p.plataformaConsole) tarefa += `Plataforma: ${p.plataformaConsole}\n`;
    tarefa += `Briefing: ${p.brief || ''}`;

    partes.push('---\n\n' + tarefa);

    var tipo = (fmt && fmt.tipoSaida) || 'copy';
    if (tipo === 'roteiro') {
      partes.push(
        '\nEscreva 2 variações de roteiro de vídeo. Cada cena tem duração aproximada, descrição visual e narração. ' +
        'O vídeo completo deve ter entre 30 e 90 segundos. Inclua título do vídeo, descrição e hashtags.\n' +
        'Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:\n' +
        '{"variacoes":[{' +
        '"titulo":"título do vídeo",' +
        '"descricao":"descrição do vídeo",' +
        '"hashtags":["tag1","tag2"],' +
        '"cenas":[' +
        '{"duracao":"0:00-0:05","visual":"descrição visual","narracao":"texto falado"},' +
        '{"duracao":"0:05-0:15","visual":"...","narracao":"..."}' +
        ']}]}'
      );
    } else {
      partes.push(
        '\nEscreva 3 variações de copy seguindo a Fórmula de copy (gancho → apresentação → diferenciais → CTA). ' +
        'Responda SOMENTE com JSON válido, sem texto fora dele, neste formato exato:\n' +
        '{"variacoes":[{' +
        '"titulo":"chamada curta",' +
        '"legenda":"legenda de 2-4 frases",' +
        '"cta":"chamada para ação curta",' +
        '"hashtags":["5 a 7 hashtags sem #, sem espaços"]' +
        '}]}'
      );
    }

    return partes.join('\n\n').trim();
  }

  window.DADOS = {
    plataformas: {},
    formatos: {},
    geracoes: {},
    pronto: false,

    formatosDaPlataforma: function(platId) {
      var self = this;
      return Object.keys(self.formatos)
        .map(function(k) { return self.formatos[k]; })
        .filter(function(f) { return f.plataforma === platId; });
    },

    montarPrompt: montarPrompt,

    licoesAtivas: licoesAtivas,
    adicionarLicao: adicionarLicao,
    reforcarLicao: reforcarLicao,
    arquivarLicao: arquivarLicao,
    reativarLicao: reativarLicao,
    excluirLicao: excluirLicao,
    limparExpiradas: limparExpiradas,

    registrarGeracao: registrarGeracao,
    atualizarGeracao: atualizarGeracao,

    iniciar: function() {
      var self = this;
      return Promise.all([
        carregar(PATHS.plataformas).then(function(items) { self.plataformas = indexar(items); }),
        carregar(PATHS.formatos).then(function(items) { self.formatos = indexar(items); }),
        carregar(PATHS.geracoes).then(function(items) { self.geracoes = indexar(items); })
      ]).then(function() {
        self.pronto = true;
        limparExpiradas();
        return self;
      });
    }
  };
})();
