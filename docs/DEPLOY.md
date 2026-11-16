# Guia de Deploy em Produção — Víamos (Bloco D & Dossiê #45–#47)

## 1. Arquitetura de Hospedagem Gratuita com HTTPS

- **Banco de Dados PostgreSQL:** **Neon** (Serverless Postgres gratuito) ou **Render PostgreSQL** (definido em [`render.yaml`](../render.yaml)).
- **Backend (API REST Express + Drizzle):** **Render Web Service** (configurado via Blueprint em [`render.yaml`](../render.yaml)).
- **Frontend (SPA React 19 + Vite):** **Vercel** (configurado com rewrite SPA em [`frontend/vercel.json`](../frontend/vercel.json)) ou Render Static Site (`frontend/public/_redirects`).

---

## 2. Passo a Passo Reproduzível

### Passo 1 — Publicar o Banco e a API no Render (ou Neon + Render)
1. Importe `lucio734/viamos` na Vercel com diretório raiz `frontend` e confirme o domínio do projeto. Complete a configuração da API no passo 2.
2. No painel do Render, escolha **New + → Blueprint** e conecte o repositório `lucio734/viamos` na `main`. [Painel do Render](https://dashboard.render.com)
3. O arquivo [`render.yaml`](../render.yaml) provisiona os seguintes recursos.
   - Banco PostgreSQL `viamos-db`.
   - O serviço web `viamos-api` (`rootDir: backend`), executando:
     - **Build Command:** `npm ci --include=dev && npm run build`
     - **Start Command:** `npm run deploy` (aplica as migrações antes de subir a API)
   - **Health Check Path:** `/api/health`
4. No formulário do Blueprint, informe a origem HTTPS efetiva da Vercel para `CORS_ORIGINS` e `FRONTEND_URL`, sem caminhos. Em um serviço existente, ajuste as variáveis no painel. O Blueprint gera `JWT_SECRET` e o Render fornece `RENDER_EXTERNAL_URL`. Defina `API_PUBLIC_URL` no painel se usar outro domínio da API. Se a equipe optar pelo Neon, crie o serviço web manualmente com os mesmos comandos e a sonda do passo 3. Configure no painel `DATABASE_URL` do Neon, `NODE_ENV=production`, `NODE_VERSION=22.23.1`, um `JWT_SECRET` forte e as duas variáveis para a origem da Vercel. [Variáveis do Render](https://render.com/docs/environment-variables) · [Configuração do Blueprint](https://render.com/docs/blueprint-spec#prompting-for-secret-values)
5. Para popular a base exclusiva de demonstração no plano gratuito, rode o comando abaixo a partir de `backend`, depois de `npm ci` e `npm run build`. Na sessão local, configure a URL **externa com TLS** do banco de demonstração em `DATABASE_URL`, as origens hospedadas em `API_PUBLIC_URL` e `FRONTEND_URL` e um `JWT_SECRET` local. Confirme o banco antes de executar. O seed trunca as tabelas. O serviço grátis não oferece Shell, e o PostgreSQL grátis do Render expira em 30 dias. [Limites do Render Free](https://render.com/docs/free) · [Conexão externa do PostgreSQL](https://render.com/docs/postgresql-creating-connecting#external-connections)
   ```bash
   npm run db:seed:prod
   ```

### Passo 2 — Publicar o Frontend na Vercel
1. No projeto criado no passo 1, conecte o deploy à `main` e configure o build.
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Environment Variables:**
     - `VITE_API_URL` com a origem HTTPS exibida no painel do Render. O cliente acrescenta `/api`.
2. Dispare o deploy para aplicar a variável no build. O arquivo [`frontend/vercel.json`](../frontend/vercel.json) encaminha as rotas de tela para `/index.html` e exclui `/api/` desse fallback. [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)

---

## 3. Checklist Pós-Deploy (Verificação de Produção)
1. [ ] Na origem do Render, `GET /api/health` responde `200 OK` com `status: "ok"` e `banco: "conectado"`. HTTP `503` indica indisponibilidade do PostgreSQL. [Sonda HTTP do Render](https://render.com/docs/health-checks)
2. [ ] Cadeado HTTPS ativo tanto no domínio da Vercel quanto no domínio do Render (#46).
3. [ ] O login de demonstração carrega o Hub do Cliente. Na aba Rede do navegador, confirme que o preflight da API autoriza a origem HTTPS da Vercel.
4. [ ] Recarregar a página (F5) diretamente em `/cliente/historico` ou `/interprete/demandas` mantém a SPA ativa sem 404 (#47).
5. [ ] Download de comprovante PDF e verificação pública em `/verificar/:codigo` funcionam ponta a ponta.

Abra `/api/health` na origem confirmada do Render três minutos antes da apresentação. No plano gratuito, a instância hiberna após 15 minutos sem tráfego e pode levar cerca de um minuto para voltar. [Limites do Render Free](https://render.com/docs/free#spinning-down-on-idle)
