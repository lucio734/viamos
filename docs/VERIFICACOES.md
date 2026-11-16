# Verificações de entrega

Os itens 1 a 28 correspondem ao capítulo da entrega e os itens 29 a 50 ao aplicativo.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 1–2 | Texto introdutório e modelagem do produto | ✅ introdução do capítulo e seção 1 do documento | [Produção Técnica em Entregas](../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/README.md) |
| 3 | Sitemap | ✅ figura completa e uma por área (pública, cliente, intérprete, backoffice), tabela de rotas e explicação, geradas de `rotas.tsx` | `docs/producao-tecnica/` (1.1), `docs/diagramas/` |
| 4 | Wireframes tela a tela com tabela | ✅ 30 telas capturadas do aplicativo + tabela de componentes por tela | `docs/producao-tecnica/` (1.2), `docs/producao-tecnica/telas/` |
| 5 | Prototipação (link Figma) | ✅ link navegável, quatro capturas da apresentação e explicação da navegação | Produção Técnica, seção 1.3 |
| 6–9 | Arquitetura (texto, funcional, técnica, MVC) | ✅ texto, diagramas e tabelas de tecnologias e camadas no documento | `docs/producao-tecnica/` (2.1–2.3), `backend/src/` |
| 10–14 | Requisitos (texto, RF, RNF, associação, projeto linear) | ✅ 45 RF, 45 RNF, associação RF × RNF e projeto linear lidos da planilha e tabelados no documento | `docs/producao-tecnica/` (3.1–3.4), `Entregas/Engenharia de Requisitos/` |
| 15–18 | Processos (texto, macroprocesso, fluxograma, BPMN) | ✅ macroprocesso e fluxograma (4 partes) gerados do código + os 6 BPMN da entrega de 11/11 | `docs/producao-tecnica/` (4.1–4.3) |
| 19–21 | Diagramas: texto, casos de uso, classes | ✅ 10 vistas de caso de uso e tabela de caso de uso para cada uma das 30 telas; 12 vistas de classes com tabela de divergências em relação ao banco | `docs/producao-tecnica/` (5.1–5.2), `build/telas.py` |
| 22 | DER | ✅ DER geral e 6 partes gerados do schema (27 tabelas) + dicionário de dados | `docs/producao-tecnica/` (5.3), `docs/producao-tecnica/tabelas/dicionario-de-dados.md` |
| 23, 25, 28 | Estados, DFD, contexto | ✅ figuras da entrega de 11/11 + máquinas de estado geradas dos enums (solicitação, atendimento, pagamento, habilitação) e diagrama de contexto gerado; divergência do DFD P5 registrada (P-06) | `docs/producao-tecnica/` (5.4, 5.6, 5.9) |
| 24, 26, 27 | Operação, processos de telas, ferramenta CASE | ✅ 4 diagramas de operação (aceite, check-in, encerramento, pagamento/comprovante), transições de telas e ferramentas CASE com o gerador do próprio repositório | `docs/producao-tecnica/` (5.5, 5.7, 5.8) |
| 29 | Rotas = sitemap | ✅ 33 rotas com componentes reais conferidas no código e no Mermaid. A rota coringa redireciona para o splash | `frontend/src/rotas.tsx`, `docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md` |
| 30 | Componentes fiéis aos wireframes | 🟡 telas implementadas, com os passos principais da jornada presencial conferidos no Figma. Comparação registrada para a jornada principal | Produção Técnica, seções 1.2 e 1.3 |
| 31 | Responsividade | 🟡 pagamento conferido a 320, 768 e 1280 px no Chrome. Cobertura registrada para a tela de pagamento | `docs/TESTES.md` |
| 32 | Estados visuais (carregando/sucesso/erro/vazio) | 🟡 componentes disponíveis e fluxos principais exercitados. Cobertura registrada para os fluxos principais | `frontend/src/components/ui.tsx`, `pages/*` |
| 33 | Validação e máscaras | ✅ máscaras (`formato.ts`) + validação no cliente (`validacao.ts`) + validação Zod no servidor | `frontend/src/utils/{formato,validacao}.ts`, `backend/src/controllers/*` |
| 34 | Separação MVC no back-end | ✅ | `backend/src/{models,controllers,views,routes,services}` |
| 35 | Status HTTP semânticos | ✅ 200/201/202/204/400/401/402/403/404/409/422/423/429 | `backend/src/routes/index.ts`, testes |
| 36 | Erros sem stack trace | ✅ testado | `backend/src/middlewares/erros.ts`, `tests/excecoes.test.ts` |
| 37 | `.env` para segredos | ✅ | `backend/.env.example`, `src/config/env.ts` |
| 38 | Schema alinhado ao DER | ✅ o DER e o dicionário de dados são gerados do `schema.ts` (colunas, tipos, obrigatoriedade, chaves e índices), e o CI falha se o modelo documentado divergir do schema (`npm run docs:modelo -- --verificar`) | `backend/src/db/exportar-modelo.ts`, `docs/diagramas/dados/modelo.json`, `.github/workflows/ci.yml` |
| 39 | PK/FK/integridade | ✅ FKs, CHECKs, índices únicos (inclusive parcial) | `backend/drizzle/0000_esquema_inicial.sql` |
| 40 | ORM / consultas parametrizadas | ✅ Drizzle | `backend/src/models/db.ts` |
| 41 | Migrações e seed | ✅ | `backend/drizzle/`, `backend/src/db/seed.ts` |
| 42 | `.gitignore` | ✅ testado (sem `.env`/`node_modules` nos commits) | `.gitignore` |
| 43 | Branches e commits organizados | ✅ commits organizados por escopo na `main` | histórico git |
| 44 | README com clonagem/instalação/execução | ✅ | `README.md` |
| 45–47 | Deploy, HTTPS, rotas SPA | ✅ `4848335` ativo no Render. Sonda HTTP 200 com PostgreSQL conectado, CORS de login HTTP 204 para a Vercel e acesso direto à rota SPA HTTP 200 | `docs/DEPLOY.md`, `docs/TESTES.md` |
| 48 | Testes de fluxo principal e exceções | ✅ 63 casos de backend e 6 de frontend. A nova regressão verifica a criação simultânea à entrada do intérprete online (B-031) | `docs/TESTES.md` |
| 49 | Auditoria de código (domínio da equipe) | — auditoria por integrante sem evidência registrada | — |
| 50 | Ensaio de demonstração | 🟡 roteiro atualizado e logins em produção verificados. Ensaio físico e fluxo integral hospedado dispensados para esta entrega | `docs/ROTEIRO_DEMONSTRACAO.md`, `docs/DEPLOY.md` |
