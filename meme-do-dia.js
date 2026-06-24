/* ============================================================
  GAMER HUT — Meme do Dia
  Carrega o calendário semanal e injeta um banner no Estúdio
  sugerindo o template, tag e gancho do dia.
  Adicione este script APÓS o carregamento do app principal.
  <script src="meme-do-dia.js"></script>
============================================================ */

(function () {
  const CALENDARIO = [
    {
      dia: "Domingo",
      tema: "Trailer / Hype da semana",
      template: "reels",
      tag: "trailer",
      padrao: "crt",
      gancho: "O que vem por aí essa semana? Dá uma olhada 👀",
      cta: "Ativa o sininho pra não perder nada!"
    },
    {
      dia: "Segunda",
      tema: "Novidades da semana",
      template: "arrivals",
      tag: "noticias",
      padrao: "hud",
      gancho: "Chegou coisa boa essa semana — se liga 🎮",
      cta: "Qual você tá de olho? Comenta aqui 👇"
    },
    {
      dia: "Terça",
      tema: "Quiz de engajamento",
      template: "quiz",
      tag: "quiz",
      padrao: "8bits",
      gancho: "Esse ou Aquele? Você escolhe 👾",
      cta: "Vai de qual? Responde nos comentários!"
    },
    {
      dia: "Quarta",
      tema: "Destaque de pré-venda",
      template: "block",
      tag: "pre-venda",
      padrao: "hazard",
      gancho: "PRÉ-VENDA ABERTA — garanta o seu!",
      cta: "Garanta o seu antes que acabe. Link na bio!"
    },
    {
      dia: "Quinta",
      tema: "Top da semana / Mais vendidos",
      template: "ranking",
      tag: "noticias",
      padrao: "retro",
      gancho: "🏆 Top 5 da semana — quem dominou?",
      cta: "Tem algum favorito aí? Comenta! 👇"
    },
    {
      dia: "Sexta",
      tema: "Review / Lançamento em destaque",
      template: "image",
      tag: "review",
      padrao: "circuito",
      gancho: "Vale a pena? Aqui vai nossa visão 🎯",
      cta: "Você jogou? O que achou? Comenta aqui!"
    },
    {
      dia: "Sábado",
      tema: "Carrossel de coleção / Lançamento especial",
      template: "carousel",
      tag: "lancamento",
      padrao: "chevron",
      gancho: "Uma lenda está de volta 👑",
      cta: "Salva esse post e compartilha com quem precisa saber! 🔖"
    }
  ];

  function getDoDia() {
    const hoje = new Date().getDay(); // 0 = domingo
    return CALENDARIO[hoje];
  }

  function injetarBanner() {
    const dia = getDoDia();
    if (!dia) return;

    // Remove banner anterior se existir
    const anterior = document.getElementById("gh-meme-do-dia");
    if (anterior) anterior.remove();

    const banner = document.createElement("div");
    banner.id = "gh-meme-do-dia";
    banner.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 9999;
      background: #1F1B18;
      border: 1px solid rgba(232,100,60,0.4);
      border-radius: 10px;
      padding: 14px 18px;
      max-width: 280px;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      animation: ghSlideIn 0.3s ease;
    `;

    banner.innerHTML = `
      <style>
        @keyframes ghSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        #gh-meme-do-dia button { cursor: pointer; border: none; background: none; }
      </style>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#E8643C;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          🎮 Meme de ${dia.dia}
        </span>
        <button onclick="document.getElementById('gh-meme-do-dia').remove()"
          style="color:#5C5854;font-size:16px;line-height:1;padding:0 4px;">×</button>
      </div>
      <div style="color:#F4F1EC;font-size:13px;font-weight:600;margin-bottom:4px;">${dia.tema}</div>
      <div style="color:#8A8580;font-size:11px;margin-bottom:10px;">Template: <b style="color:#F4F1EC">${dia.template}</b> · Tag: <b style="color:#F4F1EC">${dia.tag}</b> · Padrão: <b style="color:#F4F1EC">${dia.padrao}</b></div>
      <div style="color:#F4F1EC;font-size:12px;font-style:italic;margin-bottom:6px;">"${dia.gancho}"</div>
      <div style="color:#8A8580;font-size:11px;">${dia.cta}</div>
    `;

    document.body.appendChild(banner);
  }

  // Injeta quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injetarBanner);
  } else {
    injetarBanner();
  }

  // Expõe para debug
  window.GH_MEME_DO_DIA = { getDoDia, CALENDARIO };
})();
