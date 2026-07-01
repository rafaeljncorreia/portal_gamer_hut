-- ============================================================
-- GAMER HUT — Seed do Cérebro de Marca (brand_versions)
-- Fonte: brand-voice.js + generation-context.js
-- Aplicar após schema.sql:
--   npx wrangler d1 execute gamerhut --file=server/seed-brand.sql --remote
-- ============================================================

-- 1) Brand base
INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('brand', 'base', 'Branding Book Gamer Hut',
'# BRANDING BOOK GAMER HUT — base obrigatória para toda copy

## Propósito
A Gamer Hut conecta jogadores aos jogos que procuram, com foco em MÍDIA FÍSICA, lançamentos, pré-vendas, colecionáveis e novidades do mercado gamer. A marca não comunica apenas produtos: comunica valor, desejo, nostalgia e pertencimento à cultura gamer.

## Posicionamento
Loja especializada em games que fala com colecionadores, fãs de mídia física e jogadores que valorizam lançamentos e edições especiais. Reforce sempre credibilidade, proximidade com a comunidade e entusiasmo genuíno por games.

## Tom de voz
Soe como um gamer apaixonado, informado e próximo da comunidade.
- Entusiasmado, mas sem exagero artificial.
- Informativo, mas sem soar jornalístico ou frio.
- Próximo, como um amigo que recomenda jogos.
- Claro e objetivo, principalmente em pré-vendas e anúncios.
- Criativo, com espaço para humor leve quando apropriado.

## Direção de linguagem
- Chamadas curtas e fortes para captar atenção.
- Comece com o NOME DO JOGO quando ele for o foco principal.
- Destaque o diferencial antes dos detalhes.
- Feche sempre com CTA simples, direto e natural.
- Adapte a linguagem ao formato (post, carrossel, reels, etc.).

## Fórmula de copy
1) gancho forte → 2) apresentação do jogo/novidade → 3) diferenciais em 1-2 frases → 4) informação comercial quando houver → 5) CTA final, de preferência perguntando algo ao público.

## Frases e estruturas recorrentes (use com naturalidade, sem repetir todas)
"Se liga…" · "Você conhece…?" · "O retorno de uma lenda…" · "Já está em pré-venda…" · "Garanta o seu antes que acabe." · "E aí, o que achou?" · "Fica de olho aqui no perfil…"

## Priorizar
Mídia física como valor central · lançamentos e pré-vendas como momentos de atenção · colecionismo e nostalgia como gatilhos emocionais · exclusivos e edições especiais como diferenciação.

## Evitar
Textos frios ou burocráticos · jargão corporativo · promessas sem clareza comercial · títulos longos demais para artes e reels · humor fora de contexto.

## Essência
Comunicar games como eventos, lançamentos como momentos especiais e mídia física como algo digno de coleção. Misture entusiasmo, clareza, nostalgia e autoridade gamer, sempre gerando desejo e conexão com a comunidade.

## Exemplos de referência (imite o ESTILO, não copie o conteúdo)
- "O universo de Control está de volta, mas desta vez mais brutal do que nunca. Em Control Resonant… 🎮 A pré-venda já está disponível! 🛒 Garanta o seu com a gente."
- "UMA LENDA ESTÁ PRESTES A RENASCER! The Legend of Zelda: Ocarina of Time… está oficialmente de volta em um remake completo para o Nintendo Switch 2."
- "PRÉ-VENDAS A TODO VAPOR! Tem RPG, terror, estratégia… 👀 Se liga que ainda tem mais por vir!"

O que os bons exemplos têm em comum: emoção primeiro; o jogo é o protagonista; conversa com a comunidade; hype controlado; transformam um anúncio em uma conversa sobre games.

## SINAIS REAIS DE PERFORMANCE (dados próprios — atualizado 30/06/2026)
Canais: Instagram é a base própria e maior audiência (~106K); TikTok é o
motor de alcance e descoberta (vídeos passam de 700K views com ~22K
seguidores). Formatos que JÁ performaram — repita o PADRÃO, não o conteúdo:
- Hero/capa de AAA nostálgico + "já disponível na loja oficial" — maior
  hit do TikTok (Metal Gear Solid Δ, ~725K views).
- Meme/zueiro autodepreciativo da marca ("se ser a melhor loja de mídia
  física fosse crime") — altíssimo índice de SAVE (200-580 saves).
- Estante/coleção: prateleiras cheias de mídia física = desejo visual.
- BTS com a dupla de donos na loja — o rosto humano da marca performa.
- "VOCÊ CONHECE [JOGO]?" — formato de descoberta para títulos menos óbvios.
CTA de salvar funciona: meme e estante são salvos para compartilhar.

## OBJEÇÃO DE CONFIANÇA (confirmada pelo destaque fixo "Evite Golpes")
Parte do público teme golpe / loja falsa (realidade do e-commerce BR).
Reforce procedência sem ser solicitado: loja oficial, direto do publisher,
mídia lacrada e original. NUNCA soar como revenda anônima ou preço bom
demais sem lastro.

## NOTA SOBRE GERAÇÕES
A Gamer Hut atende 3 gerações de público (Gen Z, Millennials, Gen X).
Cada post é feito para UMA geração específica. O contexto geracional
detalhado está em generation-context.js e DEVE ser respeitado.',
'{}', 1);

-- 2) Tons de voz
INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('tone', 'hype', 'HYPE',
'TOM DE VOZ: HYPE
- Energia máxima desde a primeira palavra
- Gíria gamer atual (drop, corre, tá on, lacrou)
- Frases curtas e impacto direto
- Emojis como pontuação (não decoração)
- CTA urgente mas real: "Corre", "Garanta o seu"
- EVITE: explicações longas, linguagem corporativa, "prezado"',
'{"label":"HYPE","desc":"Empolgado, gíria gamer, alta energia"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('tone', 'informativo', 'INFORMATIVO',
'TOM DE VOZ: INFORMATIVO
- Clareza acima de tudo — o leitor entende em 1 leitura
- Dados concretos: preço, plataforma, data, edição
- Estrutura: fato → contexto → CTA
- Zero gíria, zero hype vazio
- Emojis apenas para organizar blocos
- CTA preciso: "Disponível agora", "Pré-venda aberta"',
'{"label":"INFORMATIVO","desc":"Claro, direto, educativo"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('tone', 'nostalgico', 'NOSTÁLGICO',
'TOM DE VOZ: NOSTÁLGICO
- Evoca memória afetiva antes de vender
- Referências à época original do jogo/franquia
- Tom de "quem viveu aquilo", não de quem está tentando vender
- Storytelling antes do CTA
- Emojis retrô ou nenhum
- CTA: "A versão definitiva chegou", "Para quem zerou em [ano]"',
'{"label":"NOSTÁLGICO","desc":"Saudosista, retrô, memória afetiva"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('tone', 'zueiro', 'ZUEIRO',
'TOM DE VOZ: ZUEIRO (performer comprovado — alto índice de SAVE)
- Humor autêntico de gamer, não forçado
- Referência a meme ou situação que o público reconhece
- Autodepreciação da marca funciona ("se ser a melhor loja fosse crime")
- Tom de conversa entre amigos, não de marca
- Pode quebrar a 4ª parede
- Emojis com intenção cômica
- CTA leve: "já garantiu o seu né?", "só na Gamer Hut", "salva aí"
- EVITE: humor corporativo, piada explicada, forçar trend',
'{"label":"ZUEIRO","desc":"Engraçado, meme, debochado"}', 1);

-- 3) Plataformas
INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('platform', 'instagram', 'Instagram',
'PLATAFORMA: INSTAGRAM
- Feed: 2200 chars max, mas 125 aparecem sem "ver mais" — gancho obrigatório
- Stories/Reels: texto mínimo, visual fala primeiro
- Hashtags: 5-10 no final, bloco separado
- CTA: "link na bio", "salva esse post", "marca um amigo"
- Engajamento: perguntas nos comentários funcionam',
'{"label":"Instagram"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('platform', 'tiktok', 'TikTok',
'PLATAFORMA: TIKTOK
- Descrição: 150 chars visíveis — gancho FORTE antes do corte
- Tom: casual, conversacional, direto
- Hashtags: 3-5, misturar nicho + trending
- CTA: "segue a @gamerhut", "comenta o que achou"
- Vídeo fala primeiro — texto é complemento',
'{"label":"TikTok"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('platform', 'youtube', 'YouTube',
'PLATAFORMA: YOUTUBE
- Descrição longa: 200-500 palavras, SEO-friendly
- Primeiras 2 linhas aparecem antes do "ver mais" — devem fisgar
- Estrutura: gancho → conteúdo → links → hashtags
- Keywords no primeiro parágrafo e dispersas
- CTA: "Inscreva-se", "ativa o sininho", "link na descrição"',
'{"label":"YouTube"}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('platform', 'feed', 'Feed (genérico)',
'PLATAFORMA: FEED DE REDES SOCIAIS
- Priorizar visual forte + texto de apoio
- CTA claro e direto
- Hashtags relevantes ao nicho gaming/mídia física',
'{"label":"Feed (genérico)"}', 1);

-- 4) Gerações
INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('generation', 'gen-z', 'GEN Z',
'CONTEXTO DE PÚBLICO: GERAÇÃO Z (18-29 ANOS)

Quem é: Vê a mídia física como lifestyle e identidade — posse tangível
num mundo digital volátil onde jogo "some" do catálogo. Trata lançamento
como evento cultural. Multiplayer-first, comunidade-first.

Onde descobre: vídeo curto manda — TikTok e Reels são o ponto de entrada.
Descoberta é por scroll, não por busca: o gancho tem que parar o dedo.

Como falar: ALTA ENERGIA, direto, autêntico — player falando com player.
Zero corporativismo. Vibe de "amigo entusiasmado que manja dos games".

Hooks que funcionam:
- "Já garantiu sua pré-venda de [JOGO]? Se não, corre que acaba"
- "Drop da semana chegou — e veio pesado 👀"
- "Você conhece [JOGO]? Vem ver por que todo mundo tá falando"

OBJEÇÕES REAIS (rebata no texto, sem citar a objeção):
- "É mais caro que o digital" → posse de verdade: não some quando sai do
  catálogo, dá pra revender, é objeto e não licença alugada.
- "Espero baixar de preço / pego na promo" → steelbook e edição limitada
  NÃO voltam ao preço de tabela; quem esperou ficou de fora.
- "Cambista infla o preço" → Gamer Hut é fonte oficial, direto do
  publisher, preço justo — não é revenda.
- "Pra que físico se jogo digital?" → estética da estante/setup faz parte
  da identidade; é colecionável, não só um jogo.

O QUE FECHA A VENDA: escassez REAL (não fake) + estética do objeto +
prova social ("a comunidade já garantiu"). Storytelling 1-2 linhas antes
do CTA. Senso de "quando acabar, acabou" — verdadeiro, nunca inventado.

Vocabulário oficial:
- USE: drop, steelbook, comunidade, hype, raro, edição limitada, vibe,
  coleção, pré-venda, press start, corre, já garantiu, exclusivo
- EVITE: linguagem corporativa, "queridos clientes", "prezado",
  urgência fake tipo "IMPERDÍVEL!!!", promessas vazias

Comprimento: curto e direto (legenda 2-3 frases + CTA).
Emojis: 1-3 por post com propósito. Tom: hype controlado, energia de evento.',
'{"id":"gen-z","label":"GEN Z","full":"Geração Z (18-29)","emoji":"🎮","pctFeed":45,"desc":"Drop como evento, estética visual forte, comunidade-first."}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('generation', 'millennial', 'MILLENNIAL',
'CONTEXTO DE PÚBLICO: MILLENNIALS (30-44 ANOS)

Quem é: Cresceu com PS1, cartuchos e a transição pro online. Nostalgia é
a força motriz — paga pela remasterização do jogo que amou na infância.
Valoriza permanência da biblioteca física e completude. Tem poder de
compra, mas é criterioso e pesquisa antes.

Onde descobre: YouTube é o canal dominante — review, retrospectiva e
comparativo "remaster vs original" guiam a decisão. Chega informado.

Como falar: CONFIANÇA E INFORMAÇÃO. Especialista que respeita o legado
dos jogos. Amigo que entende e recomenda com propriedade. Profundo sem
ser chato, nostálgico sem ser piegas.

Hooks que funcionam:
- "Pra quem zerou em [ANO]: [JOGO] volta com [DIFERENCIAL]"
- "A versão definitiva que sua estante merece"
- "Curadoria de quem respeita o legado — e joga até hoje"

OBJEÇÕES REAIS (rebata no texto, sem citar a objeção):
- "Já joguei / já tenho o original" → o remaster entrega [diferencial
  concreto: gráficos refeitos, conteúdo novo]; é completar a estante e
  reviver com qualidade atual.
- "Emulo de graça" → procedência, conforto sem gambiarra e um objeto que
  uma ROM nunca vai ser; vale ter, não só jogar.
- "Não tenho tempo de jogar" → a compra é pela coleção e pela nostalgia
  tanto quanto pelo jogo; tá certo comprar pra TER.
- "Vale o preço do remaster?" → valor de colecionador a longo prazo +
  diferencial técnico claro justificam.

O QUE FECHA A VENDA: diferencial técnico explícito do remaster + gatilho
nostálgico honesto + argumento de permanência da biblioteca. Mostre que
houve curadoria, não só estoque.

Vocabulário oficial:
- USE: nostalgia, clássico, remaster, remasterizado, versão definitiva,
  completude, conquista, curadoria, edição de colecionador, lacrado,
  steelbook, original, biblioteca
- EVITE: gírias forçadas de Gen Z, hype vazio, desrespeito ao legado,
  urgência fake, "imperdível!!!"

Comprimento: médio (legenda 3-4 frases com contexto + CTA).
Emojis: moderados (0-2 por post). Tom: informado, nostálgico, confiável.',
'{"id":"millennial","label":"MILLENNIAL","full":"Millennials (30-44)","emoji":"🕹️","pctFeed":35,"desc":"Nostalgia ativa, curadoria, permanência da biblioteca."}', 1);

INSERT INTO brand_versions (bloco_tipo, bloco_key, label, conteudo, meta, is_current) VALUES
('generation', 'gen-x', 'GEN X',
'CONTEXTO DE PÚBLICO: GERAÇÃO X (45-60 ANOS)

Quem é: Completistas e colecionadores raiz. Compraram o console no
lançamento, viraram a noite com clássicos. Veem mídia física como ativo
e objeto de legado. Têm poder de compra e decidem por ROI. Repelem hype
vazio, gíria de Gen Z e urgência fabricada.

Onde descobre: comunidades especializadas, grupos de colecionador e
indicação valem mais que anúncio. Desconfia de marketing por padrão —
fato e procedência vencem, hype perde.

Como falar: PROFISSIONAL, SÉRIO, AUTORITATIVO. Especialista com
especialista. Sem rodeio, sem gíria, sem emoção fabricada. Confiança vem
da procedência e da informação precisa. Respeito ao colecionismo.

Hooks que funcionam:
- "[JOGO]: edição [PLATAFORMA] lacrada — a versão definitiva."
- "Para quem viveu o lançamento original: agora em mídia física premium."
- "Completude de coleção com a qualidade que você exige."

OBJEÇÕES REAIS (rebata no texto, sem citar a objeção):
- "É realmente original e lacrado?" → A OBJEÇÃO Nº1. Afirme procedência:
  direto do publisher oficial, lacrado, original.
- "Funciona no meu console / é a região certa?" → especifique
  plataforma, região e compatibilidade sem rodeio.
- "Preço de colecionador é justo?" → transparência e valor como ativo;
  nunca inflar nem pressionar.
- "Marketing vazio, não confio" → deixe produto e ficha técnica falarem;
  zero exagero.

O QUE FECHA A VENDA: procedência inquestionável + ficha técnica precisa
+ autoridade (publisher oficial parceiro) + ausência total de pressão.
O produto fala por si — o texto só comprova.

Vocabulário oficial:
- USE: versão definitiva, lacrado, original, curadoria, legado,
  edição especial, procedência, investimento, coleção, completo,
  edição limitada, original e lacrado, publisher oficial
- EVITE QUALQUER: gíria gamer, slang de internet, "hype", "imperdível",
  "corre", "vem", linguagem descolada, urgência fabricada, pressão
  de compra, emojis excessivos

Comprimento: médio-longo (legenda 3-5 frases informativas + CTA direto).
Emojis: mínimos ou nenhum. Tom: respeitoso, informativo, autoritativo.',
'{"id":"gen-x","label":"GEN X","full":"Geração X (45-60)","emoji":"👑","pctFeed":20,"desc":"Legado, versão definitiva, completude de coleção."}', 1);
