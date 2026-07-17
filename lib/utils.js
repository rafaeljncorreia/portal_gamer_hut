/* Shared utilities for Portal Gamer Hut — load BEFORE page-specific scripts */

/* ---- HTML escaping ---- */
function esc(s) {
  return String(s || '').replace(/[&<>]/g, function(m) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m];
  });
}

/* ---- skeleton loading cards ---- */
function skeleton(count, color) {
  var el = document.getElementById('out');
  el.innerHTML = '';
  for (var i = 0; i < count; i++) {
    var c = document.createElement('div');
    c.className = 'card';
    c.style.setProperty('--ac', color);
    c.innerHTML = '<div class="skl" style="width:55%;height:18px;margin-bottom:12px"></div>' +
      '<div class="skl" style="width:96%;margin-bottom:9px"></div>' +
      '<div class="skl" style="width:88%;margin-bottom:9px"></div>' +
      '<div class="skl" style="width:70%;margin-bottom:14px"></div>' +
      '<div class="skl" style="width:40%"></div>';
    el.appendChild(c);
  }
}

/* ---- clipboard ---- */
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

/* ---- JSON extraction from AI responses ---- */
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

/* ---- AI completion ---- */
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

/* ---- Studio field map (all templates) ---- */
var STUDIO_FIELDS = {
  carousel: ['template','tagId','title','eyebrow','subtitle','cta','badge','footer','fill','pattern','titleSize','image','pages','pageCount','current'],
  image:    ['template','tagId','title','eyebrow','subtitle','priceLabel','fill','ink','pattern','titleSize','image'],
  quiz:     ['template','tagId','question','eyebrow','quizOptions','answer','fill','ink','pattern','titleSize','quizMode','hideOptions'],
  ranking:  ['template','tagId','title','eyebrow','rankItems','rankCount','fill','ink','pattern','titleSize'],
  block:    ['template','tagId','title','eyebrow','subtitle','fill','pattern','titleSize','image'],
  reels:    ['template','tagId','title','eyebrow','subtitle','fill','pattern','format','titleSize','image'],
  arrivals: ['template','tagId','title','eyebrow','fill','ink','pattern','titleSize','image'],
  thumb:    ['template','tagId','title','eyebrow','subtitle','accentWord','badge','priceLabel','fill','ink','pattern','titleSize','image'],
  meme:     ['template','tagId','memeLayout','memeBarPos','memeCaption','memeBarColor','memeTop','memeBottom','memeCredit','titleSize','image']
};

/* ---- build patch for Creative Studio ---- */
function buildStudioPatch(v, template, ctx) {
  ctx = ctx || {};
  var tagId = ctx.tagId || '';
  var price = ctx.price || '';
  var plat = ctx.plat || '';
  var pageCount = ctx.pageCount || 4;

  function up(s) { return String(s || '').toUpperCase(); }

  /* if the AI generated a studio object, use it directly */
  if (v.studio && typeof v.studio === 'object') {
    var patch = JSON.parse(JSON.stringify(v.studio));
    patch.template  = template;
    patch.tagId     = tagId;
    if (patch.image === undefined) patch.image = null;
    return patch;
  }

  var patch = { tagId: tagId };

  if (template === 'carousel') {
    var pages;
    if (v.paginas && v.paginas.length) {
      pages = v.paginas.map(function(p) {
        return { title: up(p.titulo), body: p.texto || '', image: null };
      });
    } else {
      pages = [
        { title: up(v.titulo), body: v.legenda || '', image: null },
        { title: '',           body: v.cta || '',      image: null }
      ];
    }
    patch.template  = 'carousel';
    patch.title     = up(v.titulo);
    patch.eyebrow   = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.subtitle  = v.legenda || '';
    patch.cta       = v.cta || '';
    patch.badge     = up(v.badge);
    patch.footer    = up(v.rodape);
    patch.fill      = true;
    patch.pattern   = '8bit';
    patch.titleSize = 104;
    patch.image     = null;
    patch.pages     = pages;
    patch.pageCount = pages.length + 1;
    patch.current   = 0;
  }

  else if (template === 'image') {
    patch.template  = 'image';
    patch.title     = up(v.titulo);
    patch.eyebrow   = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.subtitle  = v.legenda || '';
    patch.priceLabel = v.preco || price || '';
    patch.fill      = false;
    patch.ink       = 'auto';
    patch.pattern   = 'solid';
    patch.titleSize = 80;
    patch.image     = null;
  }

  else if (template === 'quiz') {
    patch.template   = 'quiz';
    patch.question   = v.titulo || '';
    patch.eyebrow    = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.quizOptions = (v.opcoes || []).slice(0, 4);
    patch.answer     = (typeof v.resposta === 'number') ? v.resposta : -1;
    patch.fill       = false;
    patch.ink        = 'auto';
    patch.pattern    = '8bit';
    patch.titleSize  = 80;
    patch.quizMode   = 'pergunta';
    patch.hideOptions = false;
  }

  else if (template === 'ranking') {
    patch.template   = 'ranking';
    patch.title      = up(v.titulo);
    patch.eyebrow    = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.rankItems  = (v.itens || []).map(function(item) {
      return { name: up(item.nome), note: up(item.tag) };
    });
    patch.rankCount  = (v.itens || []).length;
    patch.fill       = false;
    patch.ink        = 'auto';
    patch.pattern    = 'grid';
    patch.titleSize  = 96;
  }

  else if (template === 'block') {
    patch.template  = 'block';
    patch.title     = up(v.titulo);
    patch.eyebrow   = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.subtitle  = v.legenda || '';
    patch.fill      = true;
    patch.pattern   = 'solid';
    patch.titleSize = 108;
    patch.image     = null;
  }

  else if (template === 'reels') {
    patch.template  = 'reels';
    patch.title     = up(v.titulo);
    patch.eyebrow   = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.subtitle  = v.cta || '';
    patch.fill      = true;
    patch.pattern   = '8bit';
    patch.format    = 'stories';
    patch.titleSize = 110;
    patch.image     = null;
  }

  else if (template === 'arrivals') {
    patch.template  = 'arrivals';
    patch.title     = up(v.titulo) || 'NOVIDADES DA SEMANA';
    patch.eyebrow   = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.fill      = false;
    patch.ink       = 'auto';
    patch.pattern   = '8bit';
    patch.titleSize = 84;
    patch.image     = null;
  }

  else if (template === 'thumb') {
    patch.template   = 'thumb';
    patch.title      = up(v.titulo);
    patch.eyebrow    = up(v.sobre_titulo || ctx.eyebrow || '');
    patch.subtitle   = '';
    patch.accentWord = '';
    patch.badge      = 'EXCLUSIVO GAMER HUT';
    patch.priceLabel = price || plat || '';
    patch.fill       = false;
    patch.ink        = 'auto';
    patch.pattern    = '8bit';
    patch.titleSize  = 140;
    patch.image      = null;
  }

  else if (template === 'meme') {
    patch.template    = 'meme';
    patch.memeLayout  = v.memeLayout || 'caption';
    patch.memeCaption = v.memeCaption || v.legenda || v.titulo || '';
    patch.memeBarPos  = v.memeBarPos || 'top';
    patch.memeBarColor = v.memeBarColor || '#F4F1EC';
    patch.memeTop     = up(v.memeTop || v.topo || '');
    patch.memeBottom  = up(v.memeBottom || v.base || '');
    patch.memeCredit  = v.memeCredit || '@gamerhut.store';
    patch.titleSize   = v.titleSize || 64;
    patch.image       = null;
  }

  return patch;
}

/* ---- merge patch into Studio state and redirect ---- */
function mergeStudioState(patch, template) {
  var currentFields = STUDIO_FIELDS[template] || [];
  var otherFields = {};
  Object.keys(STUDIO_FIELDS).forEach(function(t) {
    if (t !== template) STUDIO_FIELDS[t].forEach(function(f) { otherFields[f] = true; });
  });
  var existing = {};
  try { existing = JSON.parse(localStorage.getItem('gh-studio')) || {}; } catch(e) {}
  var merged = {};
  Object.keys(existing).forEach(function(k) {
    if (currentFields.indexOf(k) > -1 || !otherFields[k]) merged[k] = existing[k];
  });
  Object.keys(patch).forEach(function(k) { merged[k] = patch[k]; });
  try {
    localStorage.setItem('gh-studio', JSON.stringify(merged));
  } catch(e) {
    alert('Erro ao salvar dados para o Studio. Verifique o espaço disponível.');
    return;
  }
  window.location.href = 'studio.html';
}
