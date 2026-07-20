window.initCriar = function() {
  'use strict';
  if (typeof DADOS === 'undefined' || !DADOS.pronto) { console.warn('initCriar: DADOS não disponível'); return; }

  var TAGS = (window.TAGS || [
    { id:'noticias',   label:'NOTÍCIAS',   color:'#E3B53E', ink:'#0B0B0A' },
    { id:'pre-venda',  label:'PRÉ-VENDA',  color:'#E23B2E', ink:'#F4F1EC' },
    { id:'restoque',   label:'RESTOQUE',   color:'#2E9D5B', ink:'#0B0B0A' },
    { id:'lancamento', label:'LANÇAMENTO', color:'#3E78CC', ink:'#F4F1EC' },
    { id:'preview',    label:'PREVIEW',    color:'#D6286E', ink:'#F4F1EC' },
    { id:'trailer',    label:'TRAILER',    color:'#7B3FE4', ink:'#F4F1EC' },
    { id:'review',     label:'REVIEW',     color:'#2BB1C4', ink:'#0B0B0A' },
    { id:'quiz',       label:'QUIZ',       color:'#E8643C', ink:'#0B0B0A' },
  ]).map(function(t){ return { id:t.id, label:t.label, color:t.color, ink:t.ink }; });

  // ---- mapping format → studio template ----

  var FORMAT_TO_TEMPLATE = {
    'carrossel':      'carousel',
    'post':           'image',
    'quiz':           'quiz',
    'ranking':        'ranking',
    'youtube-repost': 'thumb',
    'review':         'thumb',
    'gameplay':       'thumb',
    'unboxing':       'thumb',
    'video-curto':    'reels',
    'meme':           'block'
  };

  // STUDIO_FIELDS vive só em lib/utils.js — não duplicar aqui pra não divergir

  function getStudioTemplate() {
    var fmt = DADOS.formatos[fmtSelect.value];
    if (!fmt) return null;
    return FORMAT_TO_TEMPLATE[fmt.id] || null;
  }

  function getSchemaForTemplate(template, pageCount) {
    var schemas = {
      carousel: function() {
        var inner = pageCount || 4;
        var pages = [];
        for (var i = 2; i <= inner; i++) {
          pages.push('      {"title":"TÍTULO PÁG ' + i + ' (CAIXA ALTA)","body":"texto da página ' + i + '"}');
        }
        return 'Escreva 2 variações de carrossel do Instagram (capa + ' + (inner - 1) + ' páginas internas).\n' +
          'PENSE NO DESIGN — escolha pattern, titleSize, fill, cores com intenção visual.\n' +
          'Responda SOMENTE com JSON válido, neste formato exato:\n' +
          '{"variacoes":[{\n' +
          '  "studio":{\n' +
          '    "title":"TÍTULO DA CAPA (CAIXA ALTA, curto e forte)",\n' +
          '    "eyebrow":"EYEBROW LABEL (CAIXA ALTA)",\n' +
          '    "subtitle":"legenda do feed 2-4 frases",\n' +
          '    "cta":"CHAMADA PARA AÇÃO (CAIXA ALTA)",\n' +
          '    "badge":"BADGE OPCIONAL (CAIXA ALTA, máx 3 palavras)",\n' +
          '    "footer":"RODAPÉ OPCIONAL (CAIXA ALTA)",\n' +
          '    "fill":true,\n' +
          '    "pattern":"8bit",\n' +
          '    "titleSize":104,\n' +
          '    "pages":[\n' +
          pages.join(',\n') + '\n' +
          '    ]\n' +
          '  },\n' +
          '  "descricao":{\n' +
          '    "titulo":"título da capa (normal, sem caixa alta)",\n' +
          '    "legenda":"legenda do feed — 2 a 4 frases, calorosa e específica",\n' +
          '    "cta":"chamada final pro engajamento",\n' +
          '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
          '  }\n' +
          '}]}\n' +
          'IMPORTANTE: studio.pages deve ter EXATAMENTE ' + (inner - 1) + ' itens.';
      },
      image: 'Escreva 3 variações de post com imagem do Instagram.\n' +
        'PENSE NO DESIGN — escolha pattern (solid/8bit/grid), titleSize, fill, ink com intenção visual.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO PRINCIPAL (CAIXA ALTA)",\n' +
        '    "eyebrow":"EYEBROW LABEL (CAIXA ALTA)",\n' +
        '    "subtitle":"texto de apoio 2-4 frases",\n' +
        '    "priceLabel":"ETIQUETA DE PREÇO OPCIONAL",\n' +
        '    "cta":"CALLL TO ACTION (CAIXA ALTA)",\n' +
        '    "fill":false,\n' +
        '    "pattern":"solid",\n' +
        '    "titleSize":80,\n' +
        '    "ink":"auto"\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título principal (normal, sem caixa alta)",\n' +
        '    "legenda":"texto de apoio 2-4 frases",\n' +
        '    "cta":"chamada final",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}',
      block: 'Escreva 3 variações de MEME para Instagram.\n' +
        'FORMATO: post tipográfico sem imagem — o TEXTO é o protagonista.\n' +
        'Escolha pattern vibrante (8bit, caution, stars, chevron, grid, retro), fill=true.\n' +
        'PENSE NO DESIGN — titleSize grande (110-150), frase curta de impacto.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"FRASE DO MEME (CAIXA ALTA, máx 6 palavras)",\n' +
        '    "eyebrow":"EYEBROW OPCIONAL (CAIXA ALTA): SITUAÇÃO / FATO / ATENÇÃO",\n' +
        '    "subtitle":"COMPLEMENTO OPCIONAL (CAIXA ALTA, máx 3 palavras)",\n' +
        '    "fill":true,\n' +
        '    "ink":"auto",\n' +
        '    "pattern":"8bit",\n' +
        '    "titleSize":130\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"frase do meme (normal, sem caixa alta)",\n' +
        '    "legenda":"legenda do meme — irônica, divertida ou reflexiva, 2-3 frases",\n' +
        '    "cta":"chamada pra engajamento: marca alguém, comenta, salva",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}',
      quiz: 'Escreva 3 variações de quiz do Instagram.\n' +
        'PENSE NO DESIGN — escolha pattern, titleSize, fill com intenção visual.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "question":"PERGUNTA DO QUIZ (CAIXA ALTA)",\n' +
        '    "eyebrow":"EYEBROW LABEL (CAIXA ALTA)",\n' +
        '    "quizOptions":["OPÇÃO A","OPÇÃO B","OPÇÃO C","OPÇÃO D"],\n' +
        '    "answer":0,\n' +
        '    "fill":false,\n' +
        '    "pattern":"8bit",\n' +
        '    "titleSize":80,\n' +
        '    "ink":"auto",\n' +
        '    "quizMode":"pergunta",\n' +
        '    "hideOptions":false\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"pergunta do quiz (normal)",\n' +
        '    "legenda":"contexto da pergunta",\n' +
        '    "cta":"PARTICIPE!",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}\n' +
        'IMPORTANTE: quizOptions deve ter 4 itens. answer é o índice (0-3) da opção correta.',
      thumb: 'Escreva 3 variações de REPOST para YouTube Shorts / Comunidade.\n' +
        'O conteúdo é um repost de um vídeo já existente, NÃO conteúdo original.\n' +
        'PENSE NO DESIGN — thumb 16:9, titleSize grande (140), pattern 8bit, destaque visual forte.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO DA THUMB (CAIXA ALTA, máx 6 palavras)",\n' +
        '    "eyebrow":"EYEBROW — REVIEW / GAMEPLAY (CAIXA ALTA)",\n' +
        '    "subtitle":"texto secundário de apoio",\n' +
        '    "accentWord":"PALAVRA DESTAQUE OPCIONAL (CAIXA ALTA)",\n' +
        '    "badge":"BADGE OPCIONAL (CAIXA ALTA)",\n' +
        '    "priceLabel":"PLATAFORMA / CONSOLE OPCIONAL",\n' +
        '    "fill":false,\n' +
        '    "pattern":"8bit",\n' +
        '    "titleSize":140,\n' +
        '    "ink":"auto"\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título para descrição do post (normal)",\n' +
        '    "legenda":"descrição do vídeo — 1 a 3 frases",\n' +
        '    "cta":"ASSISTA AO VÍDEO COMPLETO",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}',
      ranking: 'Escreva 3 variações de ranking do Instagram.\n' +
        'PENSE NO DESIGN — pattern grid, titleSize 96, fill com intenção.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO DO RANKING (CAIXA ALTA)",\n' +
        '    "eyebrow":"EYEBROW LABEL (CAIXA ALTA)",\n' +
        '    "rankItems":[\n' +
        '      {"name":"NOME DO JOGO","note":"TAG CURTA"},\n' +
        '      {"name":"NOME DO JOGO","note":"TAG CURTA"}\n' +
        '    ],\n' +
        '    "rankCount":5,\n' +
        '    "fill":false,\n' +
        '    "pattern":"grid",\n' +
        '    "titleSize":96,\n' +
        '    "ink":"auto"\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título do ranking (normal)",\n' +
        '    "legenda":"descrição do ranking",\n' +
        '    "cta":"chamada para ação",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}\n' +
        'IMPORTANTE: rankItems deve ter no mínimo 5 itens.',
      reels: 'Escreva 3 variações de capa de Reels / TikTok.\n' +
        'PENSE NO DESIGN — formato 9:16, pattern 8bit, fill=true, destaque visual.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO DA CAPA (CAIXA ALTA)",\n' +
        '    "eyebrow":"EYEBROW LABEL (CAIXA ALTA)",\n' +
        '    "subtitle":"CTA / texto secundário",\n' +
        '    "fill":true,\n' +
        '    "pattern":"8bit",\n' +
        '    "format":"stories",\n' +
        '    "titleSize":110\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título para descrição (normal)",\n' +
        '    "legenda":"descrição do vídeo curto",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}',
      meme: 'Escreva 3 variações de MEME autoral da Gamer Hut.\n' +
        'A imagem é escolhida pelo usuário depois — aqui você só escreve o TEXTO do meme.\n' +
        'Gere OS DOIS formatos (legenda de barra E texto de topo/base) pra pessoa poder alternar no editor.\n' +
        'Responda SOMENTE com JSON válido, neste formato exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "memeLayout":"caption",\n' +
        '    "memeCaption":"setup/punchline do meme — frase relacionável (minúsculas ok)",\n' +
        '    "memeTop":"TEXTO DE CIMA (CAIXA ALTA, curto)",\n' +
        '    "memeBottom":"TEXTO DE BAIXO (CAIXA ALTA, curto)",\n' +
        '    "titleSize":64\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título curto pro post (normal)",\n' +
        '    "legenda":"legenda do feed — 1 a 3 frases no clima do meme",\n' +
        '    "cta":"CTA de engajamento (ex.: marca aquele amigo que é assim)",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  }\n' +
        '}]}\n' +
        'IMPORTANTE: memeLayout deve ser "caption" ou "impact". Humor no clima gamer, relacionável, sem ofender ninguém.'
    };
    var s = schemas[template];
    return typeof s === 'function' ? s() : (s || '');
  }

  // ---- send to Creative Studio ----

  function sendToStudio(v) {
    var template = getStudioTemplate();
    if (!template) return;
    var patch = buildStudioPatch(v, template, {
      tagId: activeCat.id,
      price: preco.value.trim(),
      plat: platConsole.value.trim()
    });
    mergeStudioState(patch, template);
  }

  var brief       = document.getElementById('brief');
  var platSelect  = document.getElementById('platSelect');
  var fmtSelect   = document.getElementById('fmtSelect');
  var gerSelect   = document.getElementById('gerSelect');
  var preco       = document.getElementById('preco');
  var platConsole = document.getElementById('platConsole');
  var tonesEl     = document.getElementById('tones');
  var catsEl      = document.getElementById('cats');
  var promptPrev  = document.getElementById('promptPreview');
  var genBtn      = document.getElementById('gen');
  var out         = document.getElementById('out');

  var activeTone = tonesEl.children[0];
  var activeCat  = TAGS[1] || TAGS[0];
  var genAtualId = '';

  // ---- populate selects ----

  function populatePlats() {
    var ids = Object.keys(DADOS.plataformas);
    platSelect.innerHTML = '<option value="">Selecione...</option>';
    ids.forEach(function(id) {
      var p = DADOS.plataformas[id];
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = p.nome;
      platSelect.appendChild(opt);
    });
    if (ids.length) platSelect.value = ids[0];
  }

  function populateGers() {
    var ids = Object.keys(DADOS.geracoes);
    gerSelect.innerHTML = '';
    ids.forEach(function(id) {
      var g = DADOS.geracoes[id];
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = g.nome;
      gerSelect.appendChild(opt);
    });
    if (ids.length) gerSelect.value = ids[0];
  }

  function populateFormats(platId) {
    fmtSelect.innerHTML = '';
    var list = DADOS.formatosDaPlataforma(platId);
    if (!list.length) {
      fmtSelect.disabled = true;
      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Nenhum formato para esta plataforma';
      fmtSelect.appendChild(opt);
      return;
    }
    fmtSelect.disabled = false;
    list.forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.nome + (f.tipoSaida ? ' · ' + f.tipoSaida.toUpperCase() : '');
      fmtSelect.appendChild(opt);
    });
    fmtSelect.value = list[0].id;
  }

  // ---- chips ----

  function initTones() {
    var children = tonesEl.children;
    for (var i = 0; i < children.length; i++) {
      (function(el) {
        el.onclick = function() {
          activeTone = el;
          for (var j = 0; j < children.length; j++) children[j].classList.remove('on');
          el.classList.add('on');
          updatePreview();
        };
      })(children[i]);
    }
  }

  function initCats() {
    TAGS.forEach(function(t, i) {
      var el = document.createElement('span');
      el.className = 'chip cat' + (i === 1 ? ' on' : '');
      el.textContent = t.label;
      el.style.setProperty('--ac', t.color);
      el.style.setProperty('--acInk', t.ink);
      el.onclick = function() {
        activeCat = t;
        var all = catsEl.children;
        for (var j = 0; j < all.length; j++) all[j].classList.remove('on');
        el.classList.add('on');
        updatePreview();
      };
      catsEl.appendChild(el);
    });
  }

  // ---- get current wizard opts ----

  function getOpts() {
    return {
      plataformaId: platSelect.value,
      formatoId: fmtSelect.value,
      geracaoId: gerSelect.value,
      tom: activeTone ? activeTone.dataset.v : '',
      categoriaId: activeCat ? activeCat.id : '',
      brief: brief.value.trim(),
      preco: preco.value.trim(),
      plataformaConsole: platConsole.value.trim(),
      pages: parseInt(document.getElementById('pagesDisplay').textContent, 10) || 4
    };
  }

  // ---- prompt preview ----

  function updatePreview() {
    var base = DADOS.montarPrompt(getOpts());
    promptPrev.value = base;
  }

  // ---- build full prompt with quality rules ----

  function getRoteiroStudioSchema(tpl) {
    var schemas = {
      thumb: 'Cada variação deve incluir UM OBJETO "studio" com os campos visuais para thumb, UM OBJETO "descricao" com o texto do post e UM OBJETO "roteiro" com as cenas.\n' +
        'PENSE NO DESIGN — thumb 16:9, titleSize grande (140), pattern 8bit, destaque visual forte.\n' +
        'Formato JSON exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO DA THUMB (CAIXA ALTA, máx 6 palavras)",\n' +
        '    "eyebrow":"EYEBROW — REVIEW / GAMEPLAY (CAIXA ALTA)",\n' +
        '    "subtitle":"texto secundário de apoio",\n' +
        '    "accentWord":"PALAVRA DESTAQUE OPCIONAL (CAIXA ALTA)",\n' +
        '    "badge":"BADGE OPCIONAL (CAIXA ALTA)",\n' +
        '    "priceLabel":"PLATAFORMA / CONSOLE OPCIONAL",\n' +
        '    "fill":false,\n' +
        '    "pattern":"8bit",\n' +
        '    "titleSize":140,\n' +
        '    "ink":"auto"\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título do post (normal)",\n' +
        '    "legenda":"descrição do vídeo — 1 a 3 frases",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  },\n' +
        '  "roteiro":{\n' +
        '    "cenas":[\n' +
        '      {"duracao":"0:00-0:05","visual":"descrição visual","narracao":"texto falado"}\n' +
        '    ]\n' +
        '  }\n' +
        '}]}\n' +
        'IMPORTANTE: o array cenas dentro de roteiro deve conter todas as cenas do roteiro (mínimo 3, máximo 8).',
      reels: 'Cada variação deve incluir UM OBJETO "studio" com os campos visuais para capa de Reels, UM OBJETO "descricao" com o texto do post e UM OBJETO "roteiro" com as cenas.\n' +
        'PENSE NO DESIGN — formato 9:16, pattern 8bit, fill=true, destaque visual.\n' +
        'Formato JSON exato:\n' +
        '{"variacoes":[{\n' +
        '  "studio":{\n' +
        '    "title":"TÍTULO DA CAPA (CAIXA ALTA)",\n' +
        '    "eyebrow":"EYEBROW (CAIXA ALTA)",\n' +
        '    "subtitle":"CTA / texto secundário",\n' +
        '    "fill":true,\n' +
        '    "pattern":"8bit",\n' +
        '    "format":"stories",\n' +
        '    "titleSize":110\n' +
        '  },\n' +
        '  "descricao":{\n' +
        '    "titulo":"título do post (normal)",\n' +
        '    "legenda":"descrição do vídeo curto — 1 a 2 frases",\n' +
        '    "hashtags":["5 a 7 hashtags sem #, sem espaços"]\n' +
        '  },\n' +
        '  "roteiro":{\n' +
        '    "cenas":[\n' +
        '      {"duracao":"0:00-0:05","visual":"descrição visual","narracao":"texto falado"}\n' +
        '    ]\n' +
        '  }\n' +
        '}]}\n' +
        'IMPORTANTE: o array cenas deve ter mínimo 2, máximo 5 cenas (vídeo curto).'
    };
    return schemas[tpl] || '';
  }

  function buildFullPrompt() {
    var opts = getOpts();
    var base = DADOS.montarPrompt(opts);
    var fmt = DADOS.formatos[fmtSelect.value];
    var tipoSaida = (fmt && fmt.tipoSaida) || 'copy';
    var template = getStudioTemplate();

    if (tipoSaida === 'roteiro') {
      if (template) {
        var idx2 = base.indexOf('Responda SOMENTE com JSON válido');
        if (idx2 > -1) base = base.substring(0, idx2);
        base += getRoteiroStudioSchema(template);
      }
      return base + '\n\n---\nREGRAS:\n- Título curto e forte (máx ~8 palavras).\n- Cada cena com visual descritivo e narração direta.\n- Vídeo entre 30 e 90 segundos.\n- Descrição com 2-3 frases + hashtags.\n- Variações com ângulos diferentes.\n- Português do Brasil.';
    }

    if (template) {
      var schema = getSchemaForTemplate(template, opts.pages);
      if (schema) {
        var idx = base.indexOf('Responda SOMENTE com JSON válido');
        if (idx > -1) base = base.substring(0, idx);
        base += schema;
      }
      if (fmtSelect.value === 'youtube-repost') {
        base += '\n\n---\nREGRAS DE REPOST:\n- Trate como REPOST de conteúdo já publicado, NÃO conteúdo original.\n- Legenda deve resumir/contextualizar o vídeo, não apresentar o produto.\n- CTA direciona para o vídeo original ("Assista ao vídeo completo", "Confira o review").\n- Tom de compartilhamento ("Nesse vídeo a gente mostra", "A gente foi conferir").\n- Título curto e forte (máx ~6 palavras).\n- Emojis com moderação (0 a 3).\n- Variações com ângulos diferentes.\n- Português do Brasil.';
      } else {
        base += '\n\n---\nREGRAS:\n- Título curto e forte (máx ~6 palavras).\n- Legenda de 2 a 4 frases, calorosa e específica ao briefing.\n- CTA final simples, de preferência perguntando algo ("Já garantiu?", "Vai jogar?").\n- Emojis com moderação (0 a 3).\n- Variações com ângulos diferentes (ex.: nostálgica, comercial, hype).\n- Português do Brasil.';
      }
      return base;
    }

    return base + '\n\n---\nREGRAS:\n- Título curto e forte (máx ~6 palavras).\n- Legenda de 2 a 4 frases, calorosa e específica ao briefing.\n- CTA final simples, de preferência perguntando algo ("Já garantiu?", "Vai jogar?").\n- Emojis com moderação (0 a 3).\n- Variações com ângulos diferentes (ex.: nostálgica, comercial, hype).\n- Português do Brasil.';
  }

  // ---- approve / reject / feedback (shared by renderCopy and renderRoteiro) ----

  function setupFeedbackHandlers(card, v, i, localId, localOpts) {
    var pVer = (DADOS.plataformas[localOpts.plataformaId] || {}).version || 1;
    var fVer = (DADOS.formatos[localOpts.formatoId] || {}).version || 1;
    var aprBtn = card.querySelector('.btn-aprovar');
    var rejBtn = card.querySelector('.btn-reprovar');
    var fbBox = card.querySelector('.feedback-box');
    var fbText = fbBox.querySelector('textarea');
    var fbBtn = fbBox.querySelector('.fb-btn');
    var fbMsg = card.querySelector('.feedback-msg');

    aprBtn.onclick = function() {
      if (!localId) return;
      var licao = prompt('Registrar lição com esta aprovação? (opcional)\n\nDeixe em branco para aprovar sem lição.');
      var ok;
      if (licao && licao.trim()) {
        ok = DADOS.adicionarLicao(licao.trim(), localOpts.plataformaId, localOpts.formatoId, localOpts.geracaoId, localId, pVer, fVer);
        if (ok) ok = DADOS.atualizarGeracao(localId, { status: 'aprovado-com-licao', variacaoEscolhida: i });
      } else {
        ok = DADOS.atualizarGeracao(localId, { status: 'aprovado', variacaoEscolhida: i });
      }
      if (!ok) { fbMsg.textContent = 'Erro ao salvar. Verifique o armazenamento.'; fbMsg.className = 'feedback-msg err'; return; }
      aprBtn.textContent = '✅ APROVADO';
      aprBtn.disabled = true;
      rejBtn.style.display = 'none';
    };

    rejBtn.onclick = function() {
      if (!localId) return;
      aprBtn.style.display = 'none';
      rejBtn.style.display = 'none';
      fbBox.classList.add('open');
    };

    fbText.oninput = function() {
      fbBtn.disabled = !fbText.value.trim();
    };

    fbBtn.onclick = function() {
      var txt = fbText.value.trim();
      if (!txt) return;
      fbBtn.disabled = true;
      fbBtn.textContent = 'Enviando…';
      var ok = DADOS.adicionarLicao(txt, localOpts.plataformaId, localOpts.formatoId, localOpts.geracaoId, localId, pVer, fVer);
      if (ok) ok = DADOS.atualizarGeracao(localId, { status: 'feedback', feedback: txt });
      if (!ok) { fbMsg.textContent = 'Erro ao salvar feedback. Tente novamente.'; fbMsg.className = 'feedback-msg err'; fbBtn.disabled = false; fbBtn.textContent = 'Enviar Feedback'; return; }
      fbBox.classList.remove('open');
      fbMsg.textContent = '❌ Feedback enviado';
      fbMsg.className = 'feedback-msg err';
    };
  }

  // ---- render output ----

  function render(variacoes) {
    out.innerHTML = '';

    var fmt = DADOS.formatos[fmtSelect.value];
    var tipoSaida = (fmt && fmt.tipoSaida) || 'copy';

    variacoes.forEach(function(v, i) {
      if (tipoSaida === 'roteiro' && Array.isArray(v.cenas)) {
        renderRoteiro(v, i);
      } else {
        renderCopy(v, i);
      }
    });

    // regenerate bar
    var bar = document.createElement('div');
    bar.className = 'regens';
    bar.innerHTML = '<button class="btn btn-ghost" id="regenBtn">↻ REGENERAR</button>' +
      '<button class="btn btn-ghost" id="newBtn">✚ NOVA GERAÇÃO</button>';
    out.appendChild(bar);

    document.getElementById('regenBtn').onclick = function() {
      doGenerate();
    };
    document.getElementById('newBtn').onclick = function() {
      genAtualId = '';
      out.innerHTML = '';
      genBtn.disabled = false;
      genBtn.textContent = '⚡ GERAR CONTEÚDO';
    };
  }

  function renderCopy(v, i) {
    var d = v.descricao || v;
    var tags = (d.hashtags || []).map(function(h) {
      return '#' + String(h).replace(/^#/, '').replace(/\s+/g, '');
    });
    var titulo = d.titulo || v.titulo || '';
    var legenda = d.legenda || v.legenda || '';
    var cta = d.cta || v.cta || '';
    var paginas = d.paginas || (v.studio && v.studio.pages) || v.paginas || null;
    var descFull = [titulo, legenda, cta, tags.join(' ')].filter(function(x) { return x; }).join('\n\n').trim();

    var hasStudio = !!getStudioTemplate();
    var hasPages = Array.isArray(paginas) && paginas.length;
    var pagesHTML = '';
    if (hasPages) {
      pagesHTML = '<div class="pagesblock"><span class="pblabel">ESTRUTURA · ' + (paginas.length + 1) + ' PÁGINAS</span>' +
        '<div class="pgrow"><span class="pgn">CAPA</span><span class="pgt">' + esc(titulo) + '</span></div>' +
        paginas.map(function(p, pi) {
          return '<div class="pgrow"><span class="pgn">P' + (pi + 2) + '</span><span class="pgt">' +
            '<b>' + esc(p.titulo || '') + '</b>' + (p.texto ? ' — ' + esc(p.texto) : '') + '</span></div>';
        }).join('') +
        '</div>';
    }

    var c = document.createElement('div');
    c.className = 'card';
    c.style.setProperty('--ac', activeCat.color);
    c.style.setProperty('--acInk', activeCat.ink);
    c.innerHTML =
      '<div class="ch"><span class="vlabel">VARIAÇÃO 0' + (i + 1) + '</span></div>' +
      '<span class="rlabel">── DESCRIÇÃO ──</span>' +
      (!hasPages && titulo ? '<h3 class="ttl">' + esc(titulo) + '</h3>' : '') +
      pagesHTML +
      (legenda ? '<p class="body">' + esc(legenda) + '</p>' : '') +
      (cta ? '<p class="cta">' + esc(cta) + '</p>' : '') +
      (tags.length ? '<div class="tags">' + tags.map(function(t) { return '<span class="tag2">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '<button class="cbtn" style="margin-top:10px">📋 COPIAR DESCRIÇÃO</button>' +
      (hasStudio ? '<span class="rlabel">── ARTE ──</span><button class="artbtn">MONTAR ARTE →</button>' : '') +
      '<div class="card-actions">' +
      '<button class="btn-aprovar">✅ APROVAR</button>' +
      '<button class="btn-reprovar">❌ REPROVAR</button>' +
      '</div>' +
      '<div class="feedback-box">' +
      '<textarea placeholder="O que errou? Descreva o problema..." rows="2"></textarea>' +
      '<button class="fb-btn" disabled>Enviar Feedback</button>' +
      '</div>' +
      '<div class="feedback-msg"></div>';

    var cb = c.querySelector('.cbtn');
    cb.onclick = function() {
      copyText(descFull).then(function() {
        cb.textContent = '📋 COPIADO ✓';
        cb.classList.add('done');
        setTimeout(function() { cb.textContent = '📋 COPIAR DESCRIÇÃO'; cb.classList.remove('done'); }, 1600);
      })['catch'](function() {
        cb.textContent = '📋 SELECIONE E COPIE';
        setTimeout(function() { cb.textContent = '📋 COPIAR DESCRIÇÃO'; }, 1800);
      });
    };

    if (hasStudio) {
      c.querySelector('.artbtn').onclick = function() {
        var btn = this;
        btn.textContent = '→ REDIRECIONANDO…';
        btn.disabled = true;
        sendToStudio(v);
      };
    }

    // approve / reject
    var localId = genAtualId;
    var localOpts = getOpts();
    var pVer = (DADOS.plataformas[localOpts.plataformaId] || {}).version || 1;
    var fVer = (DADOS.formatos[localOpts.formatoId] || {}).version || 1;
    var aprBtn = c.querySelector('.btn-aprovar');
    var rejBtn = c.querySelector('.btn-reprovar');
    var fbBox = c.querySelector('.feedback-box');
    var fbText = fbBox.querySelector('textarea');
    var fbBtn = fbBox.querySelector('.fb-btn');
    var fbMsg = c.querySelector('.feedback-msg');

    aprBtn.onclick = function() {
      if (!localId) return;
      var licao = prompt('Registrar lição com esta aprovação? (opcional)\n\nDeixe em branco para aprovar sem lição.');
      var ok;
      if (licao && licao.trim()) {
        ok = DADOS.adicionarLicao(licao.trim(), localOpts.plataformaId, localOpts.formatoId, localOpts.geracaoId, localId, pVer, fVer);
        if (ok) ok = DADOS.atualizarGeracao(localId, { status: 'aprovado-com-licao', variacaoEscolhida: i });
      } else {
        ok = DADOS.atualizarGeracao(localId, { status: 'aprovado', variacaoEscolhida: i });
      }
      if (!ok) { fbMsg.textContent = 'Erro ao salvar. Verifique o armazenamento.'; fbMsg.className = 'feedback-msg err'; return; }
      aprBtn.textContent = '✅ APROVADO';
      aprBtn.disabled = true;
      rejBtn.style.display = 'none';
    };

    rejBtn.onclick = function() {
      if (!localId) return;
      aprBtn.style.display = 'none';
      rejBtn.style.display = 'none';
      fbBox.classList.add('open');
    };

    fbText.oninput = function() {
      fbBtn.disabled = !fbText.value.trim();
    };

    fbBtn.onclick = function() {
      var txt = fbText.value.trim();
      if (!txt) return;
      fbBtn.disabled = true;
      fbBtn.textContent = 'Enviando…';
      var ok = DADOS.adicionarLicao(txt, localOpts.plataformaId, localOpts.formatoId, localOpts.geracaoId, localId, pVer, fVer);
      if (ok) ok = DADOS.atualizarGeracao(localId, { status: 'feedback', feedback: txt });
      if (!ok) { fbMsg.textContent = 'Erro ao salvar feedback. Tente novamente.'; fbMsg.className = 'feedback-msg err'; fbBtn.disabled = false; fbBtn.textContent = 'Enviar Feedback'; return; }
      fbBox.classList.remove('open');
      fbMsg.textContent = '❌ Feedback enviado';
      fbMsg.className = 'feedback-msg err';
    };

    out.appendChild(c);
  }

  function renderRoteiro(v, i) {
    var d = v.descricao || v;
    var r = v.roteiro || v;
    var tags = (d.hashtags || []).map(function(h) {
      return '#' + String(h).replace(/^#/, '').replace(/\s+/g, '');
    });
    var titulo = d.titulo || v.titulo || '';
    var legenda = d.legenda || v.descricao || '';
    var cenas = (r.cenas || v.cenas || []);
    var descText = [titulo, legenda, tags.join(' ')].filter(function(x) { return x; }).join('\n\n').trim();
    var cenasText = cenas.map(function(cena, ci) {
      return 'Cena ' + (ci + 1) + ' (' + cena.duracao + '):\nVisual: ' + cena.visual + '\nNarração: ' + cena.narracao;
    }).join('\n\n');

    var hasStudio = !!getStudioTemplate();

    var c = document.createElement('div');
    c.className = 'card';
    c.style.setProperty('--ac', activeCat.color);
    c.style.setProperty('--acInk', activeCat.ink);
    var html =
      '<div class="ch"><span class="vlabel">ROTEIRO 0' + (i + 1) + '</span></div>' +
      '<span class="rlabel">── DESCRIÇÃO ──</span>' +
      (titulo ? '<h3 class="ttl">' + esc(titulo) + '</h3>' : '') +
      (legenda ? '<p class="body">' + esc(legenda) + '</p>' : '') +
      (tags.length ? '<div class="tags">' + tags.map(function(t) { return '<span class="tag2">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '<button class="cbtn desc-btn" style="margin-top:10px">📋 COPIAR DESCRIÇÃO</button>' +
      (hasStudio ? '<span class="rlabel">── ARTE ──</span><button class="artbtn">MONTAR CAPA →</button>' : '');

    if (cenas.length) {
      html += '<span class="rlabel">── ROTEIRO ──</span>';
      cenas.forEach(function(cena) {
        html += '<div class="cena">' +
          '<div class="dur">' + esc(cena.duracao) + '</div>' +
          '<div class="vis">' + esc(cena.visual) + '</div>' +
          (cena.narracao ? '<div>' + esc(cena.narracao) + '</div>' : '') +
          '</div>';
      });
      html += '<button class="cbtn roteiro-btn" style="margin-top:10px">📋 COPIAR ROTEIRO</button>';
    }

    html +=
      '<div class="card-actions">' +
      '<button class="btn-aprovar">✅ APROVAR</button>' +
      '<button class="btn-reprovar">❌ REPROVAR</button>' +
      '</div>' +
      '<div class="feedback-box">' +
      '<textarea placeholder="O que errou? Descreva o problema..." rows="2"></textarea>' +
      '<button class="fb-btn" disabled>Enviar Feedback</button>' +
      '</div>' +
      '<div class="feedback-msg"></div>';

    c.innerHTML = html;

    var descBtn = c.querySelector('.desc-btn');
    descBtn.onclick = function() {
      copyText(descText).then(function() {
        descBtn.textContent = '📋 COPIADO ✓';
        descBtn.classList.add('done');
        setTimeout(function() { descBtn.textContent = '📋 COPIAR DESCRIÇÃO'; descBtn.classList.remove('done'); }, 1600);
      })['catch'](function() {
        descBtn.textContent = '📋 SELECIONE E COPIE';
        setTimeout(function() { descBtn.textContent = '📋 COPIAR DESCRIÇÃO'; }, 1800);
      });
    };

    var roteiroBtn = c.querySelector('.roteiro-btn');
    if (roteiroBtn) {
      roteiroBtn.onclick = function() {
        copyText(cenasText).then(function() {
          roteiroBtn.textContent = '📋 COPIADO ✓';
          roteiroBtn.classList.add('done');
          setTimeout(function() { roteiroBtn.textContent = '📋 COPIAR ROTEIRO'; roteiroBtn.classList.remove('done'); }, 1600);
        })['catch'](function() {
          roteiroBtn.textContent = '📋 SELECIONE E COPIE';
          setTimeout(function() { roteiroBtn.textContent = '📋 COPIAR ROTEIRO'; }, 1800);
        });
      };
    }

    if (hasStudio) {
      c.querySelector('.artbtn').onclick = function() {
        var btn = this;
        btn.textContent = '→ REDIRECIONANDO…';
        btn.disabled = true;
        sendToStudio(v);
      };
    }

    var localId = genAtualId;
    var localOpts = getOpts();
    setupFeedbackHandlers(c, v, i, localId, localOpts);

    out.appendChild(c);
  }

  function showErr(msg) {
    out.innerHTML = '<div class="err"><b>Não consegui gerar agora.</b><br>' + esc(msg) + '</div>';
  }

  // ---- generate ----

  async function doGenerate() {
    var opts = getOpts();
    if (!opts.brief) { brief.focus(); return; }
    if (!opts.formatoId) { fmtSelect.focus(); return; }

    var prompt = buildFullPrompt();

    genBtn.disabled = true;
    genBtn.textContent = '⏳ GERANDO…';
    var fmt2 = DADOS.formatos[fmtSelect.value];
    var tipoSaida = (fmt2 && fmt2.tipoSaida) || 'copy';
    skeleton(tipoSaida === 'roteiro' ? 2 : 3, activeCat.color);

    try {
      var text = await aiComplete(prompt);
      var data = extractJSON(text);
      if (!data || !Array.isArray(data.variacoes) || !data.variacoes.length) {
        showErr('A resposta veio em um formato inesperado. Tente de novo.');
      } else {
        var genRecord = DADOS.registrarGeracao({
          plataformaId: opts.plataformaId,
          formatoId: opts.formatoId,
          geracaoId: opts.geracaoId,
          categoriaId: opts.categoriaId,
          tom: opts.tom,
          brief: opts.brief,
          preco: opts.preco,
          plataformaConsole: opts.plataformaConsole,
          promptLength: prompt.length,
          variacoes: data.variacoes.length,
          resultado: data.variacoes
        });
        genAtualId = genRecord && genRecord.id ? genRecord.id : '';
        if (!genAtualId) {
          var warn = document.createElement('div');
          warn.className = 'err';
          warn.innerHTML = '<b>⚠ Geração não registrada.</b> O armazenamento local pode estar cheio. Copie o conteúdo antes de sair.';
          out.appendChild(warn);
        }
        render(data.variacoes);
      }
    } catch(e) {
      showErr((e && e.message) || 'Erro de conexão com a IA.');
    } finally {
      genBtn.disabled = false;
      genBtn.textContent = '⚡ GERAR CONTEÚDO';
    }
  }

  genBtn.onclick = function() { doGenerate(); };

  // ---- auto-update preview on field change ----

  brief.oninput = updatePreview;
  platSelect.onchange = function() {
    if (platSelect.value) populateFormats(platSelect.value);
    updatePreview();
  };
  fmtSelect.onchange = function() {
    var fmt = DADOS.formatos[fmtSelect.value];
    var isCarousel = fmt && fmt.id === 'carrossel';
    document.getElementById('pagesField').style.display = isCarousel ? '' : 'none';
    updatePreview();
  };
  gerSelect.onchange = updatePreview;
  preco.oninput = updatePreview;
  platConsole.oninput = updatePreview;

  brief.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') doGenerate();
  });

  // ---- init ----

  initTones();
  initCats();
  populatePlats();
  populateGers();
  if (platSelect.value) populateFormats(platSelect.value);
  updatePreview();
};
