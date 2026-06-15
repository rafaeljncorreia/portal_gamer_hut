# Servidor de IA — Portal Gamer Hut

O GitHub Pages só serve arquivos estáticos, então a **chave da API da Anthropic não pode ficar no site** (qualquer visitante conseguiria roubá-la). A solução é um pequeno servidor intermediário ("proxy") que guarda a chave em segredo e fala com a Anthropic por você.

Abaixo, o caminho recomendado com **Cloudflare Workers** — é grátis, rápido e dá pra fazer **colando um arquivo só**, sem instalar nada.

---

## Passo a passo (Cloudflare Workers)

### 1. Crie uma conta
Acesse https://dash.cloudflare.com/sign-up e crie uma conta grátis.

### 2. Crie o Worker
1. No painel, vá em **Workers & Pages → Create → Create Worker**.
2. Dê um nome, ex: `gamerhut-ia`. Clique em **Deploy** (ele cria um worker de exemplo).
3. Clique em **Edit code**.
4. Apague todo o código de exemplo e **cole o conteúdo de `worker.js`** (este arquivo, na mesma pasta).
5. Clique em **Deploy**.

### 3. Adicione a chave da API (secret)
1. Ainda no Worker, vá em **Settings → Variables and Secrets**.
2. Em **Secrets**, clique **Add** e crie:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave nova da Anthropic (gere em https://console.anthropic.com/ → API Keys)
3. Salve. Faça **Deploy** de novo se ele pedir.

> ⚠️ Use uma chave NOVA. Se você já colou alguma chave em chat/código, revogue-a no console da Anthropic.

### 4. Pegue a URL do Worker
Ela aparece no topo do Worker, algo como:
```
https://gamerhut-ia.SEU-USUARIO.workers.dev
```

### 5. Conecte o site ao servidor
1. Abra **`config.js`** (na raiz do projeto).
2. Cole a URL no campo `proxyUrl`:
   ```js
   window.GH_CONFIG = {
     proxyUrl: 'https://gamerhut-ia.SEU-USUARIO.workers.dev'
   };
   ```
3. Salve, faça commit e suba pro GitHub. Pronto — a página **Criação de Copys** passa a gerar no site publicado.

### 6. (Recomendado) Trave o acesso
Depois que o site estiver no ar, edite `worker.js` e troque:
```js
const ALLOWED_ORIGINS = ['*'];
```
pela URL do seu site, ex:
```js
const ALLOWED_ORIGINS = ['https://zerotrinta.github.io'];
```
Faça **Deploy** de novo. Assim só o seu site pode usar o servidor.

---

## Como testar
- Abra `copys.html` pelo site publicado, preencha um briefing e clique em **GERAR COPYS**.
- Se aparecer erro de "Servidor não configurado", revise o passo 5.
- Se aparecer erro de chave, revise o passo 3.

## Trocar de modelo
No `worker.js`, a constante `MODEL` controla o modelo:
- `claude-sonnet-4-6` → ótimo equilíbrio (padrão).
- `claude-haiku-4-5` → mais barato e rápido.

## Custo
A Anthropic cobra por uso (tokens). Uma copy curta custa frações de centavo. Defina um limite de gastos no console da Anthropic (**Billing → Usage limits**) para evitar surpresas.

---

## Alternativa: Vercel
Se preferir Vercel, crie um arquivo `api/generate.js` num projeto Vercel com a mesma lógica do `worker.js` (adaptada para `export default function handler(req, res)`), defina `ANTHROPIC_API_KEY` em **Settings → Environment Variables**, e use a URL `https://SEU-PROJETO.vercel.app/api/generate` no `proxyUrl`. O Cloudflare Worker acima é mais simples para começar.
