# Guia de Deploy em Produção — Víamos (Bloco D & Dossiê #45–#47)

## 1. Arquitetura de Hospedagem Gratuita com HTTPS

- **Banco de Dados PostgreSQL:** **Neon** (Serverless Postgres gratuito) ou **Render PostgreSQL** (definido em [`render.yaml`](../render.yaml)).
- **Backend (API REST Express + Drizzle):** **Render Web Service** (configurado via Blueprint em [`render.yaml`](../render.yaml)).
- **Frontend (SPA React 19 + Vite):** **Vercel** (configurado com rewrite SPA em [`frontend/vercel.json`](../frontend/vercel.json)) ou Render Static Site (`frontend/public/_redirects`).

---

## 2. Passo a Passo Reproduzível

### Passo 1 — Publicar o Banco e a API no Render (ou Neon + Render)
1. Acesse [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint** e conecte o repositório `lucio734/viamos` (branch `main`).
2. O arquivo [`render.yaml`](../render.yaml) provisionará automaticamente:
   - O banco PostgreSQL `viamos-db` (ou informe a string do Neon em `DATABASE_URL`).
   - O serviço web `viamos-api` (`rootDir: backend`), executando:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run db:migrate:prod && npm start`
   - **Health Check Path:** `/api/health`
3. Nas variáveis de ambiente do serviço `viamos-api` no Render, confira:
   - `NODE_ENV=production`
   - `JWT_SECRET` (gerado automaticamente pelo Render com 32+ caracteres)
   - `CORS_ORIGINS=https://viamos.vercel.app` (substitua pela URL final da Vercel)
   - `FRONTEND_URL=https://viamos.vercel.app`
   - `API_PUBLIC_URL=https://viamos-api.onrender.com`
4. Para popular os dados de demonstração (6 contas de teste e cenários completos) uma única vez no banco de produção, execute no **Shell** do Render (ou localmente com a `DATABASE_URL` de produção):
   ```bash
   cd backend && npm run db:seed:prod
   ```

### Passo 2 — Publicar o Frontend na Vercel
1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório `lucio734/viamos`.
2. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Environment Variables:**
     - `VITE_API_URL=https://viamos-api.onrender.com/api`
3. Clique em **Deploy**. O arquivo [`frontend/vercel.json`](../frontend/vercel.json) já contém a regra `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`, garantindo que o acesso direto ou *refresh* (F5) em qualquer rota interna (ex.: `/cliente/historico`, `/interprete/ganhos`, `/verificar/VM-2026-...`) funcione sem erro 404 (item #47 do Dossiê).

---

## 3. Checklist Pós-Deploy (Verificação de Produção)
1. [ ] `GET https://viamos-api.onrender.com/api/health` responde `200 OK` com `{"status":"ok","banco":"conectado"}`.
2. [ ] Cadeado HTTPS ativo tanto no domínio da Vercel quanto no domínio do Render (#46).
3. [ ] Login com `joao@viamos.app` / `Viamos@2026` autentica e carrega o Hub do Cliente.
4. [ ] Recarregar a página (F5) diretamente em `/cliente/historico` ou `/interprete/demandas` mantém a SPA ativa sem 404 (#47).
5. [ ] Download de comprovante PDF e verificação pública em `/verificar/:codigo` funcionam ponta a ponta.

> **Atenção para o dia da apresentação (Cold Start do plano gratuito do Render):** a instância gratuita do Render hiberna após 15 minutos sem tráfego e leva ~45–50 segundos na primeira requisição para acordar. Abra `https://viamos-api.onrender.com/api/health` **3 minutos antes** de iniciar a demonstração ao professor.
