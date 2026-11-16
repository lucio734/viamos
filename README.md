<p align="center">
  <img src="docs/producao-tecnica/figuras/viamos-marca.png" alt="Símbolo do Víamos" width="88" />
</p>

<h1 align="center">Víamos</h1>

<p align="center">Plataforma de intermediação de intérpretes de Libras</p>

O Víamos conecta pessoas surdas a intérpretes de Libras para atendimentos presenciais. Permite solicitar e acompanhar um atendimento, combinar o encontro pela sala de mensagens e fazer check-in por QR Code. O pagamento é simulado e gera um comprovante verificável.

**Integrantes:** Lúcio Vecchio, Gustavo Pires e Felipe Mathey.

<p align="center">
  <img src="docs/producao-tecnica/telas/09-hub-cliente.png" alt="Painel do cliente com o botão Solicitar intérprete agora" width="210" />
  <img src="docs/producao-tecnica/telas/18-hub-interprete.png" alt="Painel do intérprete com disponibilidade e mapa de solicitações" width="210" />
</p>

## Aplicativo hospedado

| Camada | Hospedagem | Acesso |
|---|---|---|
| Frontend | Vercel · React, TypeScript e Vite | [Abrir o Víamos](https://viamos-eight.vercel.app/) |
| API | Render Web Service · Node.js e Express | [Verificar status da API](https://viamos-api.onrender.com/api/health) |
| Banco | Render PostgreSQL · Drizzle ORM | [Esquema](backend/src/models/schema.ts) e [migrações](backend/drizzle/) |

O frontend usa `VITE_API_URL=https://viamos-api.onrender.com` em produção. A API lê a conexão PostgreSQL de `DATABASE_URL` no Render. [Configuração de hospedagem](docs/DEPLOY.md)

## Executar localmente

Instale Git, Node.js 22.12 ou superior na série 22 e Docker com Compose.

```bash
git clone https://github.com/lucio734/viamos.git
cd viamos
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d --wait
npm --prefix backend run db:migrate
```

Para carregar contas e atendimentos fictícios, rode `npm --prefix backend run db:seed` em uma base de demonstração. O comando limpa os dados da base configurada. [Contas e roteiro](docs/ROTEIRO_DEMONSTRACAO.md)

Abra dois terminais na raiz do projeto.

```bash
# Terminal 1 — API
npm --prefix backend run dev

# Terminal 2 — frontend
npm --prefix frontend run dev
```

[Aplicativo local](http://localhost:5173) · [Sonda da API local](http://localhost:3333/api/health)
