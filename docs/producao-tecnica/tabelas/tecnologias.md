<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->

# Tecnologias e infraestrutura

Versões instaladas lidas de `backend/package-lock.json` e `frontend/package-lock.json`; hospedagem lida de `render.yaml`, `frontend/vercel.json`, `docker-compose.yml` e `.github/workflows/ci.yml`.

## Tecnologias por camada

| Camada | Tecnologia | Versão | Função no Víamos |
|---|---|---|---|
| Apresentação | React | 19.3.1 | Interface web em página única (SPA) |
| Apresentação | React Router | 7.18.5 | Rotas do sitemap e proteção por papel |
| Apresentação | Vite | 8.3.8 | Servidor de desenvolvimento e build de produção |
| Apresentação | Tailwind CSS | 4.3.5 | Estilos com os tokens do design system |
| Apresentação | Leaflet + React Leaflet | 1.9.4 / 5.0.0 | Mapa (OpenStreetMap) para marcar e exibir locais |
| Apresentação | qrcode.react / html5-qrcode | 4.2.0 / 2.3.8 | Exibição e leitura do QR Code do check-in |
| Aplicação | Node.js | >=20 | Ambiente de execução da API |
| Aplicação | Express | 5.3.0 | Servidor HTTP e roteamento da API REST |
| Aplicação | Zod | 4.6.7 | Validação das entradas em todos os endpoints |
| Aplicação | jsonwebtoken + bcryptjs | 9.0.3 / 3.0.3 | Token de sessão (JWT) e hash de senha |
| Aplicação | Helmet, CORS e express-rate-limit | 8.3.0 / 2.8.6 / 8.7.4 | Cabeçalhos de segurança, origens permitidas e limite de tentativas |
| Aplicação | PDFKit | 0.20.2 | Geração do comprovante em PDF |
| Persistência | Drizzle ORM | 0.45.4 | Mapeamento objeto-relacional e consultas parametrizadas |
| Persistência | node-postgres (pg) | 8.23.1 | Driver e pool de conexões com o PostgreSQL |
| Persistência | Drizzle Kit | 0.31.11 | Geração das migrações SQL (2 em backend/drizzle) |
| Qualidade | TypeScript | 5.9.3 (API) / 5.9.3 (SPA) | Tipagem estática nas duas aplicações |
| Qualidade | Vitest + Supertest | 5.1.0 / 7.3.2 | Testes automatizados da API contra um PostgreSQL real |
| Qualidade | Oxlint | 1.93.0 | Análise estática do frontend |

## Servidores, protocolos e portas

| Componente | Onde roda | Protocolo e porta | Configuração |
|---|---|---|---|
| SPA (arquivos estáticos) | Vercel (CDN) | HTTPS 443 | frontend/vercel.json — rewrite `/((?!api/).*)` → `/index.html`; cabeçalhos X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| API REST | Render — web service node, plano free, região oregon | HTTPS 443 (porta interna definida por PORT) | render.yaml — build `npm ci --include=dev && npm run build`, start `npm run deploy`, health check `/api/health` |
| Banco de dados | PostgreSQL gerenciado (viamos-db no Render, ou Neon) | TCP 5432 com TLS | variável DATABASE_URL |
| Mapa e busca de endereço | OpenStreetMap e Nominatim | HTTPS 443 (a partir do navegador) | frontend/src/components/Mapa.tsx |
| Integração contínua | GitHub Actions | — | .github/workflows/ci.yml — Node 22, postgres:16-alpine |
| Desenvolvimento local — SPA | Vite | HTTP 5173 | frontend/vite.config.ts — proxy de /api para http://localhost:3333 |
| Desenvolvimento local — API | Node.js | HTTP 3333 | backend/.env (PORT) |
| Desenvolvimento local — banco | Docker (postgres:16-alpine) | TCP 5432 | docker-compose.yml |

## Módulos de negócio do backend

| Serviço | Módulo de negócio | Requisitos declarados | Depende de |
|---|---|---|---|
| `atendimento.service.ts` | Atendimento presencial: sala, check-in, encerramento e suporte | RF28–RF34, RF39 | auditoria, notificacao |
| `auditoria.service.ts` | Trilha de auditoria | RF44, RNF33 |  |
| `auth.service.ts` | Autenticação e sessão | RF01, RF07, RF08, RNF07, RNF35 | auditoria, email |
| `avaliacao.service.ts` | Avaliação bilateral e reputação | RF40, RF41, RNF42 | auditoria, atendimento, notificacao |
| `backoffice.service.ts` | Habilitação de intérpretes, chamados e indicadores | RF06, RNF36 | auditoria, notificacao, cadastro |
| `cadastro.service.ts` | Cadastro e envio da certificação | RF02–RF05, RNF09 | auditoria, auth, notificacao |
| `comprovante.service.ts` | Comprovante e verificação pública | RF37, RF38, RNF41 | atendimento |
| `demanda.service.ts` | Demandas, aceite exclusivo e agenda | RF20–RF25, RNF36 | auditoria, notificacao |
| `email.service.ts` | Adaptador de e-mail |  |  |
| `gateway.service.ts` | Adaptador do gateway de pagamento | RNF23, RNF37 |  |
| `notificacao.service.ts` | Notificações | RF42, RNF25 |  |
| `pagamento.service.ts` | Pagamento, ganhos e repasse | RF26, RF27, RF35, RF36, RF37 | auditoria, gateway, notificacao |
| `perfil.service.ts` | Perfil, consentimentos e direitos LGPD | RF43, RF45, RNF09 | auditoria, auth |
| `solicitacao.service.ts` | Solicitação, estimativa e distribuição | RF10–RF19, RF15, RF16, RF17, RF18, RF19 | auditoria, demanda, notificacao |
