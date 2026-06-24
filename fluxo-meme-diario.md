# Fluxo Diário de Memes — Gamer Hut Creative Studio

## Visão geral

Este documento descreve o fluxo integrado para criar um criativo por dia usando o Portal Gamer Hut. Cada etapa é concreta e sequencial — do insight à exportação.

---

## Calendário semanal

| Dia       | Tema                        | Template         | Tag        | Padrão    |
|-----------|----------------------------|------------------|------------|-----------|
| Domingo   | Trailer / Hype da semana   | Capa de Reels    | trailer    | crt       |
| Segunda   | Novidades da semana        | Novidades        | notícias   | hud       |
| Terça     | Quiz de engajamento        | Quiz             | quiz       | 8bits     |
| Quarta    | Destaque de pré-venda      | Post Blocado     | pré-venda  | hazard    |
| Quinta    | Top da semana              | Top / Ranking    | notícias   | retro     |
| Sexta     | Review / Lançamento        | Post c/ Imagem   | review     | circuito  |
| Sábado    | Carrossel de coleção       | Carrossel        | lançamento | chevron   |

---

## Fluxo diário (≈ 20 min)

### 1. Abre o estúdio (2 min)
```bash
cd Portal-Gamer-Hut
python3 -m http.server 8080
# ou: iniciar-servidor.bat
```
Acesse: http://localhost:8080

> O `meme-do-dia.js` vai exibir um banner no canto direito com o template, tag e padrão sugeridos para hoje.

---

### 2. Define o conteúdo do dia (5 min)

Antes de abrir o estúdio, responda três perguntas:

- **O jogo/produto**: Qual é o foco do post de hoje?
- **O diferencial**: O que o torna especial? (mídia física, edição especial, pré-venda, etc.)
- **O CTA**: O que você quer que o público faça? (comentar, pré-vender, salvar, compartilhar)

Use a fórmula do brand voice:
> gancho forte → apresentação do jogo → diferenciais em 1–2 frases → info comercial se houver → CTA final perguntando algo

---

### 3. Gera a copy (5 min)

Use o **Gerador de Cópias** (copies.html) ou o Claude diretamente.

Prompt base por dia:

**Segunda (Novidades):**
> "Crie uma copy estilo Gamer Hut para um post de segunda-feira anunciando chegadas da semana: [JOGO 1], [JOGO 2], [JOGO 3]. Tom informativo e empolgante."

**Terça (Quiz):**
> "Crie uma copy curta para Quiz 'Esse ou Aquele' entre [OPÇÃO A] e [OPÇÃO B]. Máximo 2 linhas + CTA."

**Quarta (Pré-venda):**
> "Crie uma copy urgente para pré-venda de [JOGO]. Data de lançamento: [DATA]. Destaque mídia física como diferencial."

**Quinta (Top 5):**
> "Crie copy para um post Top 5 jogos da semana. Liste: [JOGO 1] a [JOGO 5]. Tom de autoridade e entusiasmo gamer."

**Sexta (Review):**
> "Crie uma mini-review para [JOGO]. Nota [X/10]. Destaque 2 pontos positivos e 1 ponto de atenção. Feche com pergunta para a comunidade."

**Sábado (Carrossel):**
> "Crie copy para carrossel de 4 slides sobre [JOGO/EDIÇÃO ESPECIAL]. Slide 1: gancho. Slide 2: contexto. Slide 3: diferenciais. Slide 4: CTA."

**Domingo (Trailer/Reels):**
> "Crie copy para Capa de Reels divulgando o trailer de [JOGO]. Tom empolgante, máximo 3 linhas."

---

### 4. Monta o criativo no estúdio (8 min)

1. Selecione o **template do dia** no seletor de modelos
2. Escolha a **tag** correspondente (define a cor de destaque)
3. Aplique o **padrão de fundo** sugerido (ou experimente outros)
4. Cole a copy gerada nos campos de texto
5. Ajuste fontes, cores e imagens conforme necessário
6. Revise: o texto cabe bem? A hierarquia está clara? O CTA está visível?

---

### 5. Exporta e salva (2 min)

- Clique em **Exportar PNG** para a arte final em resolução nativa (1080px)
- Para Reels com vídeo: use **Exportar Vídeo** (MP4/WebM)
- Salve na pasta: `exports/YYYY-MM-DD-[tema].png`

```bash
# Exemplo de organização de pasta
exports/
  2025-06-23-trailer-zelda.png
  2025-06-24-novidades-semana.png
  2025-06-25-quiz-ps5-xbox.png
```

---

### 6. Commita no repositório (1 min)

```bash
git add exports/
git commit -m "meme: [TEMA] — [JOGO/TEMA] ($(date +%Y-%m-%d))"
git push
```

---

## Integração com `meme-do-dia.js`

Adicione ao `index.html`, antes do fechamento do `</body>`:

```html
<script src="meme-do-dia.js"></script>
```

Isso ativa o banner automático que mostra template, tag e gancho sugeridos com base no dia da semana toda vez que o estúdio é aberto.

---

## Checklist rápido

- [ ] Abri o estúdio com `http.server`
- [ ] Identifiquei o jogo/produto do dia
- [ ] Gerei a copy com a fórmula do brand voice
- [ ] Apliquei template + tag + padrão corretos
- [ ] Exportei PNG em resolução nativa
- [ ] Salvei na pasta `exports/` com o nome correto
- [ ] Commitei no repositório

---

## Referência rápida de templates

| Template         | Uso ideal                                 | Formato     |
|------------------|--------------------------------------------|-------------|
| Carrossel        | Histórias longas, edições especiais        | 4:5 Feed    |
| Post Blocado     | Urgência, pré-vendas, anúncios diretos     | 4:5 ou 9:16 |
| Post c/ Imagem   | Reviews, destaques com capa de jogo        | 4:5 Feed    |
| Quiz             | Engajamento, esse ou aquele, enquetes      | 4:5 ou 9:16 |
| Top / Ranking    | Mais vendidos, top da semana               | 4:5 ou 9:16 |
| Novidades        | Chegadas de produtos novos                 | 4:5 Feed    |
| Thumbnail YT     | Capa de vídeo para YouTube                 | 16:9        |
| Capa de Reels    | Trailer, vídeo curto, stories              | 9:16        |
