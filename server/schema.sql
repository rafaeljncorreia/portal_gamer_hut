-- ============================================================
-- GAMER HUT — Plataforma de Gestão · Schema do banco (Cloudflare D1 / SQLite)
-- Fase 1 do rollout. Aplicar com:
--   npx wrangler d1 execute gamerhut --file=server/schema.sql
-- Seeds do cérebro de marca ficam em server/seed-brand.sql.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- CATÁLOGO — o coração. NÃO é fonte da verdade: é um CACHE do
-- board Monday "Alinhamento Pré-Vendas e Lançamentos de Jogos"
-- (18417580003). A rota /catalog lê o board e faz upsert aqui
-- por monday_item_id. A plataforma NÃO edita o board, só lê.
-- Colunas ← board (auditado): ver mapeamento em cada campo.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  monday_item_id    TEXT    UNIQUE NOT NULL,       -- id do item no board
  grupo             TEXT,                          -- ciclo de vida: Próximos Lançamento | Em Pré Venda | Lançamentos | Relembrados | Concluídos
  nome              TEXT    NOT NULL,              -- col name
  data_lancamento   TEXT,                          -- col date_mm485gd5 (ISO YYYY-MM-DD)
  data_pre_venda    TEXT,                          -- col date_mm48196n
  divulgacao_inicio TEXT,                          -- col timerange_mm4853da (início)
  divulgacao_fim    TEXT,                          -- col timerange_mm4853da (fim)
  plataformas       TEXT,                          -- col dropdown_mm48vfmk (CSV: SW,SW2,PS5,PS4,XBOX)
  onde_vende        TEXT,                          -- col dropdown_mm4819jt (ML/Shopee/Loja Integrada/Amazon/Indisponível ainda)
  pv_liberada       TEXT,                          -- col color_mm48essg (SIM/NÃO)
  status_lancamento TEXT,                          -- col color_mm48nng3 (Day One/Confirmação/Pendente)
  exclusividade_gh  TEXT,                          -- col color_mm483qza (Sim/Não/Exclusivo GH/Não exclusivo)
  grau_importancia  TEXT,                          -- col color_mm481qgt (OK/IMPORTANTE/MUITO IMPORTANTE)
  divulgar          TEXT,                          -- col color_mm487xd9 (AGUARDANDO/CONFIRMADO/PARADO)
  geracao_alvo      TEXT,                          -- col dropdown_mm488aqw → mapeia GH_GENERATIONS (gen-x/gen-z/millennial)
  pilar_sugerido    TEXT,                          -- col dropdown_mm48p6e0 (Lore/Curiosidade/Dica/Review/Lançamento/Drop…)
  sincronizado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_grupo    ON products(grupo);
CREATE INDEX IF NOT EXISTS idx_products_divulgar ON products(divulgar);
CREATE INDEX IF NOT EXISTS idx_products_nome     ON products(nome);
-- Status "à venda / pré-venda / não vende / esgotado" é DERIVADO em
-- tempo de leitura a partir de onde_vende + pv_liberada + grupo +
-- data_lancamento (não é coluna). "estoque" não existe no board.

-- ------------------------------------------------------------
-- CÉREBRO DE MARCA — versionado para combater entropia.
-- Cada bloco editável (brand base, um tom, uma plataforma, uma
-- geração) guarda histórico. A versão vigente é is_current=1.
-- Seed inicial vem de brand-voice.js + generation-context.js.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bloco_tipo  TEXT    NOT NULL,            -- brand | tone | platform | generation
  bloco_key   TEXT    NOT NULL,            -- ex: 'base', 'hype', 'instagram', 'gen-z'
  label       TEXT,                        -- rótulo exibível
  conteudo    TEXT    NOT NULL,            -- o texto/contexto do bloco
  meta        TEXT,                        -- JSON extra (emoji, pctFeed, desc...)
  is_current  INTEGER NOT NULL DEFAULT 1,  -- 1 = versão vigente
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
  criado_por  TEXT
);
CREATE INDEX IF NOT EXISTS idx_brand_lookup
  ON brand_versions(bloco_tipo, bloco_key, is_current);

-- ------------------------------------------------------------
-- RADAR DE LANÇAMENTOS — híbrido (API + curadoria humana).
-- fonte: rawg | igdb | manual. match_produto liga ao catálogo
-- quando a GH já vende/pré-vende o título.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS launches (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nome           TEXT    NOT NULL,
  data           TEXT,                     -- data de lançamento ISO
  plataforma     TEXT,
  fonte          TEXT    NOT NULL DEFAULT 'manual',   -- rawg | igdb | manual
  fonte_ref      TEXT,                     -- id externo (RAWG/IGDB) p/ dedupe
  status_curadoria TEXT  NOT NULL DEFAULT 'sugerido', -- sugerido | aprovado | descartado
  match_produto  INTEGER,                  -- FK products (se a GH vende)
  criado_em      TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_produto) REFERENCES products(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_launches_fonte_ref
  ON launches(fonte, fonte_ref) WHERE fonte_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_launches_curadoria ON launches(status_curadoria);

-- ------------------------------------------------------------
-- PLANEJAMENTO — item do calendário editorial. Cruza radar +
-- catálogo + geração + tom + canal. Vira tarefa no Monday
-- (board de destino decidido na Fase 4).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  data          TEXT    NOT NULL,          -- data planejada ISO
  canal         TEXT,                      -- instagram | tiktok | youtube | feed
  geracao       TEXT,                      -- gen-z | millennial | gen-x
  tom           TEXT,                      -- hype | informativo | nostalgico | zueiro
  template      TEXT,                      -- carousel | reels | quiz | ranking...
  pilar         TEXT,                      -- Lore | Curiosidade | Dica | Review | Lançamento (herdado do produto)
  titulo        TEXT,
  produto_id    INTEGER,                   -- FK products
  launch_id     INTEGER,                   -- FK launches
  status        TEXT    NOT NULL DEFAULT 'rascunho', -- rascunho | planejado | enviado_monday | publicado
  monday_item_id TEXT,                     -- id da tarefa criada no Monday (destino)
  criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (launch_id)  REFERENCES launches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_plan_data   ON plan_items(data);
CREATE INDEX IF NOT EXISTS idx_plan_status ON plan_items(status);

-- ------------------------------------------------------------
-- GERAÇÕES — histórico de conteúdo gerado pela IA (substitui
-- o gh-desc-history do localStorage). Guarda o contexto de
-- marca usado p/ auditoria e reuso.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS generations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo           TEXT,                     -- copy | descricao | studio | review
  prompt         TEXT    NOT NULL,
  saida          TEXT,
  contexto_marca TEXT,                     -- snapshot do getBrandVoice usado
  geracao        TEXT,
  canal          TEXT,
  tom            TEXT,
  produto_id     INTEGER,
  plan_item_id   INTEGER,
  criado_em      TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (produto_id)   REFERENCES products(id)   ON DELETE SET NULL,
  FOREIGN KEY (plan_item_id) REFERENCES plan_items(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_generations_tipo ON generations(tipo);
