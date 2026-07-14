window.initCriar = function() {
  'use strict';
  if (typeof DADOS === 'undefined' || !DADOS.pronto) { console.warn('initCriar: DADOS não disponível'); return; }

  var TAGS = [
    { id:'noticias',   label:'NOTÍCIAS',   color:'#E3B53E', ink:'#0B0B0A' },
    { id:'pre-venda',  label:'PRÉ-VENDA',  color:'#E23B2E', ink:'#F4F1EC' },
    { id:'restoque',   label:'RESTOQUE',   color:'#2E9D5B', ink:'#0B0B0A' },
    { id:'lancamento', label:'LANÇAMENTO', color:'#3E78CC', ink:'#F4F1EC' },
    { id:'preview',    label:'PREVIEW',    color:'#D6286E', ink:'#F4F1EC' },
    { id:'trailer',    label:'TRAILER',    color:'#7B3FE4', ink:'#F4F1EC' },
    { id:'review',     label:'REVIEW',     color:'#2BB1C4', ink:'#0B0B0A' },
    { id:'quiz',       label:'QUIZ',       color:'#E8643C', ink:'#0B0B0A' },
  ];

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
      el.style.setProperty('--acink', t.ink);
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
      plataformaConsole: platConsole.value.trim()
    };
  }

  // ---- prompt preview ----

  function updatePreview() {
    var base = DADOS.montarPrompt(getOpts());
    promptPrev.value = base;
  }

  // ---- build full prompt with quality rules ----

  function buildFullPrompt() {
    var base = DADOS.montarPrompt(getOpts());
    var fmt = DADOS.formatos[fmtSelect.value];
    var tipoSaida = (fmt && fmt.tipoSaida) || 'copy';

    if (tipoSaida === 'roteiro') {
      return base + '\n\n---\nREGRAS:\n- Título curto e forte (máx ~8 palavras).\n- Cada cena com visual descritivo e narração direta.\n- Vídeo entre 30 e 90 segundos.\n- Descrição com 2-3 frases + hashtags.\n- Variações com ângulos diferentes.\n- Português do Brasil.';
    }

    return base + '\n\n---\nREGRAS:\n- Título curto e forte (máx ~6 palavras).\n- Legenda de 2 a 4 frases, calorosa e específica ao briefing.\n- CTA final simples, de preferência perguntando algo ("Já garantiu?", "Vai jogar?").\n- Emojis com moderação (0 a 3).\n- Variações com ângulos diferentes (ex.: nostálgica, comercial, hype).\n- Português do Brasil.';
  }

  // ---- utilities (copied from copys.html) ----

  function esc(s) { return String(s || '').replace(/[&<>]/g, function(m) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]; }); }

  function skeleton(count) {
    out.innerHTML = '';
    var fmt = DADOS.formatos[fmtSelect.value];
    var tipoSaida = (fmt && fmt.tipoSaida) || 'copy';
    var n = count || (tipoSaida === 'roteiro' ? 2 : 3);
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'card';
      c.style.setProperty('--ac', activeCat.color);
      c.innerHTML = '<div class="skl" style="width:55%;height:18px;margin-bottom:12px"></div>' +
        '<div class="skl" style="width:96%;margin-bottom:9px"></div>' +
        '<div class="skl" style="width:88%;margin-bottom:9px"></div>' +
        '<div class="skl" style="width:70%;margin-bottom:14px"></div>' +
        '<div class="skl" style="width:40%"></div>';
      out.appendChild(c);
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)['catch'](function() { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function(res, rej) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? res() : rej();
      } catch(e) { rej(e); }
    });
  }

  function extractJSON(text) {
    var src = text.replace(/```json|```/g, '');
    try { return JSON.parse(src); } catch(e) {}
    var m = src.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch(e) {} }
    var ai = src.indexOf('variacoes');
    var arrStart = ai >= 0 ? src.indexOf('[', ai) : src.indexOf('[');
    if (arrStart < 0) return null;
    var objs = [];
    var i = arrStart + 1;
    while (i < src.length) {
      while (i < src.length && src[i] !== '{' && src[i] !== ']') i++;
      if (i >= src.length || src[i] === ']') break;
      var depth = 0, inStr = false, esc2 = false, start = i;
      for (; i < src.length; i++) {
        var ch = src[i];
        if (inStr) { if (esc2) esc2 = false; else if (ch === '\\') esc2 = true; else if (ch === '"') inStr = false; continue; }
        if (ch === '"') { inStr = true; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
      }
      if (depth !== 0) break;
      var frag = src.slice(start, i);
      try { var o = JSON.parse(frag); if (o && (o.titulo || o.legenda || o.cenas)) objs.push(o); } catch(e) {}
    }
    return objs.length ? { variacoes: objs } : null;
  }

  async function aiComplete(prompt) {
    if (typeof window.claude !== 'undefined' && window.claude.complete) {
      return await window.claude.complete(prompt);
    }
    var url = ((window.GH_CONFIG && window.GH_CONFIG.proxyUrl) || '').trim();
    if (!url) {
      throw new Error('Servidor de IA não configurado. Abra config.js e cole a URL do seu servidor em proxyUrl.');
    }
    var r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });
    var data;
    try { data = await r.json(); } catch(e) { throw new Error('Resposta inválida do servidor de IA.'); }
    if (!r.ok || (data && data.error)) throw new Error((data && data.error) || ('Erro ' + r.status + ' do servidor.'));
    return (data && data.text) || '';
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
    var tags = (v.hashtags || []).map(function(h) {
      return '#' + String(h).replace(/^#/, '').replace(/\s+/g, '');
    });
    var fullText = [v.titulo, '', v.legenda, '', v.cta, '', tags.join(' ')].filter(function(x) { return x !== undefined; }).join('\n').trim();

    var c = document.createElement('div');
    c.className = 'card';
    c.style.setProperty('--ac', activeCat.color);
    c.innerHTML =
      '<div class="ch"><span class="vlabel">VARIAÇÃO 0' + (i + 1) + '</span>' +
      '<button class="cbtn">COPIAR</button></div>' +
      (v.titulo ? '<h3 class="ttl">' + esc(v.titulo) + '</h3>' : '') +
      (v.legenda ? '<p class="body">' + esc(v.legenda) + '</p>' : '') +
      (v.cta ? '<p class="cta">' + esc(v.cta) + '</p>' : '') +
      (tags.length ? '<div class="tags">' + tags.map(function(t) { return '<span class="tag2">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
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
      copyText(fullText).then(function() {
        cb.textContent = 'COPIADO ✓';
        cb.classList.add('done');
        setTimeout(function() { cb.textContent = 'COPIAR'; cb.classList.remove('done'); }, 1600);
      })['catch'](function() {
        cb.textContent = 'SELECIONE E COPIE';
        setTimeout(function() { cb.textContent = 'COPIAR'; }, 1800);
      });
    };

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
    var tags = (v.hashtags || []).map(function(h) {
      return '#' + String(h).replace(/^#/, '').replace(/\s+/g, '');
    });
    var cenasText = (v.cenas || []).map(function(cena, ci) {
      return 'Cena ' + (ci + 1) + ' (' + cena.duracao + '):\nVisual: ' + cena.visual + '\nNarração: ' + cena.narracao;
    }).join('\n\n');
    var fullText = [
      'Título: ' + (v.titulo || ''),
      v.descricao ? 'Descrição: ' + v.descricao : '',
      '',
      cenasText,
      '',
      tags.length ? 'Hashtags: ' + tags.join(' ') : ''
    ].filter(function(x) { return x; }).join('\n').trim();

    var c = document.createElement('div');
    c.className = 'card';
    c.style.setProperty('--ac', activeCat.color);
    var html =
      '<div class="ch"><span class="vlabel">ROTEIRO 0' + (i + 1) + '</span>' +
      '<button class="cbtn">COPIAR</button></div>' +
      (v.titulo ? '<h3 class="ttl">' + esc(v.titulo) + '</h3>' : '') +
      (v.descricao ? '<p class="body">' + esc(v.descricao) + '</p>' : '') +
      (tags.length ? '<div class="tags">' + tags.map(function(t) { return '<span class="tag2">' + esc(t) + '</span>'; }).join('') + '</div>' : '');

    if (Array.isArray(v.cenas) && v.cenas.length) {
      html += '<span class="rlabel">CENAS</span>';
      v.cenas.forEach(function(cena) {
        html += '<div class="cena">' +
          '<div class="dur">' + esc(cena.duracao) + '</div>' +
          '<div class="vis">' + esc(cena.visual) + '</div>' +
          (cena.narracao ? '<div>' + esc(cena.narracao) + '</div>' : '') +
          '</div>';
      });
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

    var cb = c.querySelector('.cbtn');
    cb.onclick = function() {
      copyText(fullText).then(function() {
        cb.textContent = 'COPIADO ✓';
        cb.classList.add('done');
        setTimeout(function() { cb.textContent = 'COPIAR'; cb.classList.remove('done'); }, 1600);
      })['catch'](function() {
        cb.textContent = 'SELECIONE E COPIE';
        setTimeout(function() { cb.textContent = 'COPIAR'; }, 1800);
      });
    };

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
    skeleton();

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
  fmtSelect.onchange = updatePreview;
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
