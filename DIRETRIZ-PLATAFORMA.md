# Diretriz — Portal Gamer Hut como Plataforma de Gestão (campaign-centric)

> **Norte permanente do projeto.** Toda evolução do portal segue esta diretriz.
> Derivada do estudo do **TGT Hub** (`kerry-latam-comms.vercel.app`, "Marketing
> Operating System") — projeto de referência **autônomo**, que **não** editamos.
> Aprendemos a **estrutura**, não copiamos conteúdo.

## 1. Princípio: campaign-centric, não tool-centric

O portal **deixa de ser uma grade de geradores soltos** e passa a operar por
**campanha**. A campanha é a unidade central; ela **orquestra** as ferramentas
(copys, descrições, arte), é abastecida pelo cérebro de marca + catálogo, e é
rastreada até a entrega.

**Regra de ouro:** nenhuma ferramenta gera conteúdo "no vácuo". O contexto flui
do Brief para todos os estágios seguintes.

## 2. Arquitetura da informação (home = workspace Gamer Hut)

Três seções numeradas, no espírito do TGT Hub, single-client:

- **01 · Biblioteca de Campanhas** — lista de campanhas com **estado**
  (`rascunho` / `em_andamento` / `concluida` / `arquivada`), **progresso X/4**,
  "Continuar de onde parou", `+ Nova campanha`, arquivar/excluir. É a home.
- **02 · Brand guidelines · Gamer Hut** — resumo do **Cérebro de Marca**
  (propósito, tom, pilares, gerações/audiências, tons, plataformas). Somente
  leitura no 1.0.
- **03 · Ferramentas avulsas** — acesso direto fora do fluxo: Catálogo, Copys,
  Descrições, Creative Studio, Downloader, Review, Aprendizado, Calendário.

## 3. Pipeline da campanha (o coração)

Mapeado dos estágios M1–M4 do TGT Hub, traduzido para a Gamer Hut:

| Estágio          | O que é                              | Alimentado por                                        |
|------------------|--------------------------------------|-------------------------------------------------------|
| **Brief**        | conceito da campanha (a FONTE)       | catálogo (jogo) + geração-alvo + pilar + tema         |
| **Estratégia**   | plano de divulgação                  | canais (IG/TikTok/YT) + `calendario-semanal.json` + janela de divulgação do produto |
| **Materiais**    | conteúdo por canal                   | **Copys + Descrições** rodando com o contexto do Brief |
| **Visual**       | peças / KV                           | **Creative Studio** (`app/*.jsx`)                     |

O **Brief é a fonte**: produto (do catálogo), geração-alvo, pilar e tema. Esse
contexto é injetado no prompt de geração dos estágios seguintes — é o
**aprofundamento** que aprendemos do TGT Hub (conteúdo coeso multi-canal em vez
de peças isoladas). Mesmo proxy de IA de sempre, prompt muito mais rico.

## 4. Escopo: single-client Gamer Hut

O TGT Hub é multi-cliente (workspaces por cliente). **Nós NÃO adotamos isso.**
Escopo travado = **apenas Gamer Hut**. Não há "trocar cliente" nem abstração de
workspace. (Não-objetivo explícito; reabrir só se o negócio pedir.)

## 5. Persistência: localStorage-first (D1 = v2)

Sem backend novo agora. Campanhas vivem em `localStorage` (chave `gh-campaigns`).
O modelo de dados **espelha o schema D1** (`server/schema.sql`: `plan_items`,
`generations`) para a migração v2 ser trivial:

```
campanha { id, nome, tema, estado, criada_em, atualizada_em,
           produto_id, geracao, pilar,
           progresso:{brief,estrategia,materiais,visual},
           brief{}, estrategia{}, materiais{}, visual{} }
```

Proxy de IA **mantido como está**: `window.GH_CONFIG.proxyUrl`
(`server/worker.js`, contrato `POST {prompt} → {text}`). O Worker/D1 já existe
como **groundwork v2** — não é usado no 1.0.

## 6. Reaproveitar, aprofundar — não substituir

Nada do que já funciona é jogado fora. Os módulos de dados são IIFEs globais
(`window.GH_*`), pensados para o portal estático. No `app-web` (Vite) eles são
**servidos por `<script>` em `app-web/public/`** (ordem: `config.js` →
`generation-context.js` → `brand-voice.js` → `catalog.js`) e lidos pela ponte
`app-web/src/lib/gh.js`.

| Peça                        | Papel na plataforma                                   |
|-----------------------------|-------------------------------------------------------|
| `catalog.js` / `catalog.json` | seleção de produto no Brief (status derivado, `geracao_key`, `tom_sugerido`) |
| `generation-context.js` (`GH_GENERATIONS`) | contexto geracional do Brief/Materiais + página Marca |
| `brand-voice.js` (`GH_BRAND`, `GH_TONES`, `GH_PLATFORMS`, `getBrandVoice`) | voz da marca em toda geração + página Marca |
| `calendario-semanal.json`   | cadência/datas na Estratégia                          |
| `copys.html` / `descricoes.html` (lógica de prompt) | portadas para o estágio Materiais |
| `app/*.jsx` (Creative Studio) | estágio Visual                                       |

> **Nota de dívida técnica (v2):** os 5 arquivos ficam duplicados entre a raiz
> (portal estático) e `app-web/public/`. Dedupe (fonte única via Vite) fica para
> a v2. Enquanto isso, **ao editar um desses arquivos na raiz, replicar em
> `app-web/public/`**.

## 7. Design language

Herdada e mantida entre as duas frentes:
- Tema escuro (`--bg #0B0B0A`), **acento laranja `--orange #E8643C`**.
- Tipografia: **Russo One** (display 400), **Red Hat Display** (texto),
  **JetBrains Mono** (rótulos/mono), **Press Start 2P** (pixel/eyebrow).
- Seções numeradas (`01`, `02`, `03`), eyebrow com traço, cards com barra
  de acento no topo, tags monoespaçadas.

## 8. Roadmap faseado (cada fase usável)

- **A — Esqueleto + diretriz:** store `campaigns.js`, ponte `gh.js`, home
  `Campanhas.jsx` (3 seções), nav/rotas, Catálogo/Marca sem Worker. ✅ em curso.
- **B — Pipeline:** `/campanha/:id`, Brief funcional, progresso X/4, "Continuar".
- **C — Materiais:** Copys + Descrições dentro do M3 com o contexto do Brief.
- **D — Estratégia + Visual:** M2 com canais/calendário; M4 com o Studio.
- **E — Polimento:** Marca completa, ferramentas avulsas restantes, refino visual.

## 9. O que NÃO fazer

- Não editar o TGT Hub (referência autônoma) nem copiar o conteúdo dele.
- Não quebrar o portal estático no ar — ele segue como legado durante a migração.
- Não montar backend novo no 1.0 (sem wrangler/D1/Supabase). D1 = v2.
- Não introduzir multi-cliente.
- Não gerar conteúdo sem o contexto do Brief quando a geração ocorre dentro de
  uma campanha.
