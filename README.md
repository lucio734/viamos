# Víamos — plataforma de intermediação de intérpretes de Libras

> Projeto da disciplina **Engenharia de Software e Arquitetura de Sistemas** — FECAP, Ciência da Computação (CCOMP4 noturno).
> Equipe: Lúcio Vecchio, Gustavo Pires e Felipe Mathey. Professor: Luis Fernando dos Santos Pires.

> **Para qualquer IA ou integrante que for trabalhar aqui:** leia primeiro [`CLAUDE/AGENTS.md`](CLAUDE/AGENTS.md) (regras obrigatórias),
> depois [`docs/PLANO_BLOCOS.md`](docs/PLANO_BLOCOS.md), [`docs/REGISTRO_TRABALHO.md`](docs/REGISTRO_TRABALHO.md) e o `contexto_atual_*.md` mais recente.

O Víamos conecta pessoas surdas a intérpretes de Libras certificados para **atendimentos presenciais** (saúde, jurídico, educação, eventos),
com distribuição por proximidade (até 15 km), aceite exclusivo, sala de atendimento, check-in por QR Code geolocalizado,
pagamento e emissão do **Comprovante de Acessibilidade Garantida**.

| Camada | Tecnologia | Pasta |
|---|---|---|
| Frontend (SPA mobile-first) | React 19 + Vite + TypeScript + Tailwind CSS v4 (tokens do `DESIGN.md`) + React Router + Leaflet/OpenStreetMap | [`frontend/`](frontend) |
| Backend (API REST, **arquitetura MVC**) | Node 22 + Express 5 + TypeScript + Zod + JWT | [`backend/`](backend) |
| Banco de dados | PostgreSQL 16 + **Drizzle ORM** (migrações SQL versionadas + seed) | [`backend/src/models/schema.ts`](backend/src/models/schema.ts), [`backend/drizzle/`](backend/drizzle) |
| Hospedagem prevista | Vercel (frontend) · Render (API) · Neon ou Render Postgres (banco) — todos com HTTPS | [`render.yaml`](render.yaml), [`frontend/vercel.json`](frontend/vercel.json) |
| Documentação | Instruções para IAs, material do projeto, entregas e capítulo "Produção Técnica" | [`CLAUDE/`](CLAUDE), [`Contexto/`](Contexto), [`Entregas/`](Entregas), [`docs/`](docs) |

---

## 1. Pré-requisitos

- **Node.js 20 ou superior** (recomendado 22) e npm — <https://nodejs.org>
- **PostgreSQL** — uma das opções:
  - Docker Desktop (`docker compose up -d` sobe um Postgres local já configurado), **ou**
  - um banco gratuito no [Neon](https://neon.tech) (copie a *connection string*), **ou**
  - PostgreSQL instalado localmente (crie o banco `viamos` e o usuário `viamos`/`viamos`)
- Git (ou GitHub Desktop)

## 2. Clonar e instalar

```bash
git clone https://github.com/lucio734/viamos.git
cd viamos

# Backend
cd backend
npm install
cp .env.example .env        # Windows (PowerShell): copy .env.example .env
cd ..

# Frontend
cd frontend
npm install
cp .env.example .env
cd ..
```

Abra `backend/.env` e confira a `DATABASE_URL`:

- Docker: já vem pronta (`postgresql://viamos:viamos@localhost:5432/viamos`) — rode `docker compose up -d` na raiz.
- Neon: cole a URL fornecida (termina com `?sslmode=require`).

## 3. Preparar o banco (migrações + dados de demonstração)

```bash
cd backend
npm run db:migrate   # aplica as migrações SQL em backend/drizzle/
npm run db:seed      # limpa e recria o cenário de demonstração (nunca use em produção)
```

Contas criadas pelo seed (senha de todas: **`Viamos@2026`**):

| Perfil | E-mail | Situação |
|---|---|---|
| Cliente surdo | `joao@viamos.app` | tem solicitação em busca, atendimento pago com comprovante e um pagamento pendente |
| Cliente surdo | `ana@viamos.app` | tem atendimento aceito (com QR de check-in) |
| Intérprete **aprovada**, online | `maria@viamos.app` | base na Av. Paulista, raio 15 km |
| Intérprete **aprovado**, online | `carlos@viamos.app` | base em Pinheiros, raio 10 km |
| Intérprete **em análise** | `pedro@viamos.app` | aguardando parecer do backoffice |
| Backoffice | `operador@viamos.app` | aprova/reprova certificações |

## 4. Executar em desenvolvimento

Em dois terminais:

```bash
# Terminal 1 — API em http://localhost:3333
cd backend
npm run dev

# Terminal 2 — aplicação em http://localhost:5173
cd frontend
npm run dev
```

O Vite encaminha as chamadas `/api/*` para a API local, então não é preciso configurar CORS em desenvolvimento.
Teste rápido da API: <http://localhost:3333/api/health>.

## 5. Testes automatizados

```bash
cd backend
npm test            # 49 testes: fluxo principal, exceções e unidades (usa DATABASE_URL_TEST — banco separado)
npm run typecheck   # verificação de tipos
```

Crie o banco de teste uma vez (Docker: `docker compose exec postgres createdb -U viamos viamos_test`; local: `createdb -U viamos viamos_test`).

## 6. Build e deploy

```bash
cd backend && npm run build && npm run deploy     # migra e sobe a API a partir de dist/
cd frontend && npm run build                      # gera frontend/dist (estático)
```

- **Render** (API): *New → Blueprint* apontando para este repositório; o [`render.yaml`](render.yaml) cria o serviço e o banco. Ajuste `CORS_ORIGINS`, `API_PUBLIC_URL` e `FRONTEND_URL`.
- **Vercel** (frontend): importe o repositório com *Root Directory* = `frontend`, defina `VITE_API_URL` com a URL da API. O [`vercel.json`](frontend/vercel.json) já contém o *rewrite* para rotas SPA (`/cliente/...` recarregadas não dão 404).
- O guia detalhado ficará em `docs/DEPLOY.md` (Bloco D do plano).

## 7. Estrutura do repositório

```
viamos/
├── backend/
│   ├── drizzle/              # migrações SQL versionadas (0000_esquema_inicial, 0001_auditoria_imutavel)
│   ├── src/
│   │   ├── models/           # MODEL: schema.ts (DER) + conexão
│   │   ├── controllers/      # CONTROLLER: HTTP ⇄ services, esquemas Zod de validação
│   │   ├── routes/           # mapa da API (middlewares de auth/papel + validação + controller)
│   │   ├── services/         # regras de negócio (RF01–RF45)
│   │   ├── views/            # VIEW: presenters JSON e PDF do comprovante
│   │   ├── middlewares/      # autenticação JWT, validação, tratamento de erros
│   │   ├── config/           # env.ts (variáveis) e regras.ts (parâmetros de negócio)
│   │   ├── utils/            # geolocalização (Haversine), CPF/CNPJ, datas
│   │   └── db/               # migrate.ts e seed.ts
│   └── tests/                # Vitest + Supertest
├── frontend/
│   └── src/
│       ├── rotas.tsx         # SITEMAP: todas as rotas por perfil (fonte da figura do sitemap)
│       ├── api/              # cliente HTTP + tipos
│       ├── auth/             # sessão (login/logout/splash)
│       ├── components/       # design system (ui.tsx) e AppShell (navegação inferior/lateral)
│       ├── pages/            # telas por perfil (auth/, cliente/, interprete/, backoffice/)
│       └── utils/            # máscaras (CPF, CEP, telefone, cartão) e formatadores pt-BR
├── CLAUDE/                   # CLAUDE.md e AGENTS.md — instruções obrigatórias para qualquer IA (leia antes de tudo)
├── Contexto/                 # material original do grupo: briefing, PRD, design system, protótipos Stitch, auxílio ao vibecoding
├── Entregas/                 # entregas anteriores (requisitos 02/09, UML 07/10, modelagem 11/11) e modelo_entrega.docx
├── docs/
│   ├── PLANO_BLOCOS.md       # plano de trabalho até a entrega, dividido em blocos
│   ├── DECISOES.md           # decisões de regra de negócio (D-01…) referenciadas no código
│   ├── REGISTRO_TRABALHO.md  # estado real do trabalho: feito/verificado × pendente, contribuições, divergências
│   ├── VERIFICACOES.md       # verificação dos prompts e processos contra labProt, Checklist 2026 e Dossiê
│   └── producao-tecnica/     # capítulo final do documento (em construção)
├── contexto_atual_chatgpt.md # passagem de bastão entre as duplas (Claude ↔ ChatGPT)
├── docker-compose.yml        # PostgreSQL local
└── render.yaml               # blueprint de deploy da API
```

## 8. Fluxo de trabalho com Git

- `main` recebe apenas código testado; o trabalho acontece em branches `feat/...`, `docs/...`, `fix/...` com *pull request*.
- Mensagens de commit no formato `tipo(escopo): descrição` (ex.: `feat(frontend): tela de nova solicitação`).
- Nunca versionar `.env`, `node_modules` ou builds (`.gitignore`).

## 9. Licença e contexto acadêmico

Uso acadêmico. Integrações de pagamento e e-mail são **simuladas** no MVP (ver `backend/src/services/gateway.service.ts` e `email.service.ts`), conforme documentado no briefing do projeto.
