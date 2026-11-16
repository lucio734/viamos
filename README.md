# Víamos — plataforma de intermediação de intérpretes de Libras

Projeto da disciplina **Engenharia de Software e Arquitetura de Sistemas** da FECAP, Ciência da Computação (CCOMP4 noturno), com o professor Luis Fernando dos Santos Pires.

**Integrantes do grupo:** Lúcio Vecchio, Gustavo Pires e Felipe Mathey.

O Víamos conecta pessoas surdas a intérpretes de Libras para atendimentos presenciais. O fluxo inclui solicitação com estimativa, distribuição por proximidade, aceite exclusivo, sala de atendimento, check-in por QR Code e geolocalização, pagamento simulado e comprovante verificável.

**Produção Técnica.** A entrega segue as cinco seções do roteiro do professor. O capítulo completo está disponível em DOCX e PDF, com os diagramas, as tabelas e as fontes organizados por seção. A equipe prototipou as telas no Stitch. O link do protótipo navegável no Figma, solicitado no roteiro, segue como pendência acadêmica. [Índice de entregas](Entregas/README.md) · [Produção Técnica](Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/README.md) · [Roteiro do professor](Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/DOC.txt)

**Aplicativo.** O repositório registra o ambiente publicado e as etapas que faltam para a entrega final. A implementação, os testes finais e a publicação da versão concluída seguem no plano de trabalho. [Plano e pendências](docs/PLANO_BLOCOS.md) · [Registro de trabalho](docs/REGISTRO_TRABALHO.md)

| Camada | Tecnologia | Onde consultar |
|---|---|---|
| Interface web | React 19, Vite, TypeScript, Tailwind CSS e Leaflet | [Frontend](frontend/) · [Design system](docs/producao-tecnica/fontes/stitch/DESIGN.md) |
| API REST em MVC | Node.js 22, Express 5, TypeScript, Zod e sessões JWT | [Backend](backend/) · [OpenAPI](docs/api/openapi.yaml) |
| Banco | PostgreSQL e Drizzle ORM | [Esquema](backend/src/models/schema.ts) · [Migrações](backend/drizzle/) |
| Hospedagem | Vercel, Render Web Service e Render PostgreSQL | [Guia de deploy](docs/DEPLOY.md) |

## 1. Pré-requisitos

Use Git, Node.js **22.12+ na série 22**, npm e um PostgreSQL local. O Docker Compose incluído configura o PostgreSQL 16 para desenvolvimento. [Configuração do banco local](docker-compose.yml)

## 2. Clonar e instalar

```bash
git clone https://github.com/lucio734/viamos.git
cd viamos
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d
```

As configurações de exemplo apontam para o PostgreSQL criado pelo Docker na porta 5432. Para usar outra instância local, ajuste `DATABASE_URL` em `backend/.env`. [Exemplo da API](backend/.env.example) · [Exemplo do frontend](frontend/.env.example)

## 3. Preparar o banco de demonstração

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
```

O seed limpa e recria os dados do banco configurado. Execute-o em uma base dedicada à demonstração. A senha das contas fictícias é `Viamos@2026`. [Roteiro da demonstração](docs/ROTEIRO_DEMONSTRACAO.md)

| Perfil | E-mail |
|---|---|
| Cliente | `joao@viamos.app`, `ana@viamos.app` |
| Intérprete aprovado | `maria@viamos.app`, `carlos@viamos.app` |
| Intérprete em análise | `pedro@viamos.app` |
| Backoffice | `operador@viamos.app` |

## 4. Executar em desenvolvimento

Abra dois terminais na raiz do projeto. O Vite encaminha `/api` para a API local.

```bash
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix frontend run dev
```

[Aplicação local](http://localhost:5173) · [Sonda da API local](http://localhost:3333/api/health)

## 5. Testes automatizados

Crie um banco de teste separado e configure `DATABASE_URL_TEST` em `backend/.env`. O preparo da suíte limpa a base indicada.

```bash
docker compose exec postgres createdb -U viamos viamos_test
npm --prefix backend test
npm --prefix frontend test
npm --prefix backend run typecheck
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix docs/diagramas run verificar
```

O último comando compara o material de documentação com os dados extraídos do código. [Relatório de testes](docs/TESTES.md) · [Workflow de CI](.github/workflows/ci.yml)

## 6. Build e deploy

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

O Render usa o Blueprint do repositório e aplica as migrações com `npm run deploy`. O projeto Vercel usa o diretório `frontend` e a variável `VITE_API_URL` com a origem da API. O guia registra a configuração, os domínios, as checagens de prontidão e o ensaio pendente. [Render Blueprint](render.yaml) · [Configuração da Vercel](frontend/vercel.json) · [Guia de deploy](docs/DEPLOY.md)

## 7. Estrutura do repositório

| Pasta | Conteúdo |
|---|---|
| [`frontend/`](frontend/) | Interface, rotas, autenticação, componentes e cliente da API |
| [`backend/`](backend/) | Serviços, controladores, banco, migrações e testes da API |
| [`Entregas/`](Entregas/README.md) | Produção Técnica nas cinco seções do roteiro, documentos anteriores e modelo da disciplina |
| [Fontes da Produção Técnica](docs/producao-tecnica/fontes) | Roteiro, requisitos de referência, protótipos Stitch e fontes usadas na produção da documentação |
| [`docs/`](docs/README.md) | Como regerar a Produção Técnica, diagramas, documentação da API, manual e evidências de validação |

## 8. Fluxo de trabalho com Git

O projeto usa a branch `main`. Atualize seu clone com `git pull --ff-only origin main`, confira o diff e faça commits por assunto. Mantenha as instruções e as evidências de desenvolvimento no registro permanente. [Instruções do repositório](AGENTS.md) · [Registro de trabalho](docs/REGISTRO_TRABALHO.md)

## 9. Contexto acadêmico

O MVP simula pagamento e e-mail. Os requisitos, a matriz de verificação e as decisões registram o escopo e as pendências para a avaliação. [Decisões](docs/DECISOES.md) · [Matriz de verificações](docs/VERIFICACOES.md)
