# Verificação de prompts, métodos e processos (AGENTS.md §2 e §4)

Registro das verificações feitas contra os três documentos obrigatórios da pasta `Contexto/Auxílio Vibecoding/`:
**labProt.html** (PE//LAB — Prompt Engineering para Desenvolvedores), **Software Development Checklist 2026: Phases &
Deliverables.html** (SKM Group) e **Dossie_Checklist_Vibe_Coding.html** (50 critérios do professor). Para cada verificação:
o que foi conferido, resultado, evidência e pendência. Atualizar ao fim de cada bloco.

Legenda: ✅ atendido e verificado · 🟡 parcialmente atendido · ⬜ pendente · ➖ não se aplica ainda

## 1. labProt — engenharia de prompts aplicada ao processo

| Orientação do labProt | Como foi aplicada | Resultado | Evidência |
|---|---|---|---|
| Anatomia do prompt (papel, tarefa, contexto, regras, formato, exemplo) | Modelo de prompt por papel da equipe de agentes | ✅ | `docs/EQUIPE_AGENTES.md` §3 |
| Persona calibrada (role prompting) | Um perfil por papel do PROMPT AGENTES (PO, QA, Security, UX/UI…) | ✅ aplicado com subagentes independentes no Bloco F1 (`revisor_ux_ui`, `revisor_qa_security`, `revisor_po`) | `docs/EQUIPE_AGENTES.md` §1, `docs/REGISTRO_TRABALHO.md` §2.2 |
| Delimitadores: separar instrução de dados (defesa contra injeção) | Entrada de código/documentos entre `<<< >>>` nos prompts; na aplicação, toda entrada do usuário é validada com Zod e nunca interpretada como instrução | ✅ | `backend/src/middlewares/validar.ts` |
| Contrato de saída (formato previsível, JSON) | API responde sempre `{ erro: { codigo, mensagem, detalhes } }` nos erros e JSON tipado nos sucessos; prompts de revisão pedem tabela com colunas fixas | ✅ | `backend/src/middlewares/erros.ts`, `frontend/src/api/cliente.ts` |
| Chain-of-Thought dirigido para depuração | Smoke test manual passo a passo antes dos testes automatizados (criar → aceitar → check-in → encerrar → pagar) | ✅ | histórico desta sessão; casos em `backend/tests/` |
| Prompt chaining (extrair requisitos → código → testes → revisão) | Ordem adotada no Bloco 0 e no Bloco F1: leitura do briefing/RF → implementação → build/testes → revisão multiagente (UX/UI, QA/Security, PO) → correções → documentação | ✅ | commits na `main` |
| ReAct (pensar → agir → observar) | Cada regra implementada foi exercitada via HTTP/testes antes de seguir (observação de 200/4xx) | ✅ | `backend/tests/excecoes.test.ts` reproduz as observações |
| Self-consistency / reflexão | Revisão cruzada independente por 3 subagentes especializados no Bloco F1 + autocrítica aplicada antes do commit | ✅ aplicado no Bloco F1; repetir nos blocos F2–F4 | `docs/REGISTRO_TRABALHO.md` §2.2, `docs/BUGS.md` (B-002 a B-006) |
| Self-consistency na continuação de 15/11 (agente único) | Sem subagentes: cada correção foi conferida por teste que falha no código anterior (verificação por mutação), o gerador de diagramas valida símbolos, códigos de erro, RF e estados contra o código, e as páginas do documento foram renderizadas e inspecionadas | 🟡 sem revisão independente nesta etapa; a revisão do documento (Bloco P3) e a auditoria #49 ficam com o grupo | `docs/REGISTRO_TRABALHO.md` (continuação em 15/11), `docs/TESTES.md` §2.1 |
| Regra de ouro: "um júnior executaria sem perguntar?" | `PLANO_BLOCOS.md` descreve cada tela com rota, endpoints, protótipo e estados esperados | ✅ | `docs/PLANO_BLOCOS.md` |

## 2. Software Development Checklist 2026 (SKM) — fases e entregáveis

| Fase | Entregável exigido | Situação no Víamos | Evidência / onde ficará |
|---|---|---|---|
| 1 Discovery & Planning | SRS (requisitos funcionais e não funcionais) | ✅ entregue em 02/09 (45 RF, 45 RNF, matriz RF×RNF, histórias) | `Entregas/Engenharia de Requisitos/ENTREGA VIAMOS COMPLETA.xlsx`, `Contexto/ARQUIVOS .MD/Briefing_Projeto_Viamos.md` |
| 1 | Roadmap e cronograma | ✅ plano em blocos até 21/11 | `docs/PLANO_BLOCOS.md` |
| 1 | Wireframes de baixa fidelidade | ✅ o documento apresenta as 30 telas (capturas do aplicativo com dados fictícios) com ficha por tela: descrição, componentes, requisitos e caso de uso; os protótipos Stitch aparecem na prototipação | `docs/producao-tecnica/` (seções 1.2 e 1.3) |
| 1 | Estimativa de orçamento | ➖ projeto acadêmico sem custo; o documento registra que toda a pilha usa planos gratuitos com HTTPS | `docs/producao-tecnica/` (seção 2.2) |
| 2 Design & Prototyping | Mockups de alta fidelidade | ✅ 12 telas Stitch (HTML + PNG) | `Contexto/Arquivos Stitch/` |
| 2 | Protótipo interativo (clicável) | ⬜ link do Figma pendente (importar do Stitch) | Pendência P-01 em `docs/DECISOES.md` |
| 2 | Design system / style guide | ✅ `DESIGN.md` aplicado como tokens do Tailwind | `frontend/src/index.css` |
| 3 Core Development | Acesso ao repositório de código | ✅ repositório público no GitHub com commits publicados na `main` | `README.md` §8 |
| 3 | MVP funcional / builds incrementais | ✅ 33 rotas de tela implementadas e compiladas. Cobertura de comportamento e lacunas registradas por fluxo | `frontend/src/rotas.tsx`, `docs/REGISTRO_TRABALHO.md` |
| 3 | Documentação da API (Swagger/OpenAPI) | 🟡 65 operações listadas. Faltam parâmetros de caminho e contratos de entrada em diversas operações | `docs/api/openapi.yaml`, `backend/src/routes/index.ts` |
| 4 QA & Testing | Plano e casos de teste | ✅ 62 casos no backend, 6 no frontend e validação local em modo produção | `backend/tests/`, `frontend/tests/`, `docs/TESTES.md` |
| 4 | Relatório de bugs e resoluções | ✅ log atualizado com as correções da retomada e da continuação (B-022 a B-026) | `docs/BUGS.md` |
| 4 | Auditoria de performance e segurança | 🟡 revisão de código e controles registrados. Faltam as medições de carga e as evidências operacionais de segurança e privacidade | `docs/SEGURANCA.md`, `docs/SLA.md` |
| 5 Deployment & SLA | Ambiente de produção ativo | ✅ API e PostgreSQL no Render, frontend integrado ao endereço da API, HTTPS e teste HTTP de login com credenciais fictícias. Login autenticado e ensaio documentados como pendências | `docs/DEPLOY.md`, `.github/workflows/ci.yml` |
| 5 | Manuais de usuário e administrador | ✅ manual completo por perfil (Cliente, Intérprete, Backoffice) e roteiro de demonstração | `docs/MANUAL.md`, `docs/ROTEIRO_DEMONSTRACAO.md` |
| 5 | SLA | ✅ documento com indicadores de disponibilidade, tempos de resposta e plano de contingência | `docs/SLA.md` |
| 5 | Entrega do código-fonte | ✅ o repositório é a entrega | GitHub |
| Red flags | SRS, protótipo interativo, acesso ao repo, plano de testes, SLA | 🟡 SRS, repositório, testes e SLA presentes. O link do protótipo interativo segue pendente | `docs/`, `Entregas/`, `docs/DECISOES.md` P-01 |

## 3. Dossiê — checklist de 50 critérios (auditoria da reta final)

Estado por item, com a evidência atual. Itens 1–28 são o documento "Produção Técnica"; 29–50 a aplicação.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 1–2 | Texto introdutório e modelagem do produto | ✅ introdução do capítulo e seção 1 do documento | [Produção Técnica em Entregas](../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/README.md) |
| 3 | Sitemap | ✅ figura completa e uma por área (pública, cliente, intérprete, backoffice), tabela de rotas e explicação, geradas de `rotas.tsx` | `docs/producao-tecnica/` (1.1), `docs/diagramas/` |
| 4 | Wireframes tela a tela com tabela | ✅ 30 telas capturadas do aplicativo + tabela de componentes por tela | `docs/producao-tecnica/` (1.2), `docs/producao-tecnica/telas/` |
| 5 | Prototipação (link Figma) | 🟡 telas Stitch no capítulo. A equipe ainda não criou um protótipo no Figma. O link navegável e os registros do fluxo exigidos no roteiro seguem pendentes | Pendência P-01, `docs/producao-tecnica/README.md` |
| 6–9 | Arquitetura (texto, funcional, técnica, MVC) | ✅ texto, diagramas e tabelas de tecnologias e camadas no documento | `docs/producao-tecnica/` (2.1–2.3), `backend/src/` |
| 10–14 | Requisitos (texto, RF, RNF, associação, projeto linear) | ✅ 45 RF, 45 RNF, associação RF × RNF e projeto linear lidos da planilha e tabelados no documento | `docs/producao-tecnica/` (3.1–3.4), `Entregas/Engenharia de Requisitos/` |
| 15–18 | Processos (texto, macroprocesso, fluxograma, BPMN) | ✅ macroprocesso e fluxograma (4 partes) gerados do código + os 6 BPMN da entrega de 11/11 | `docs/producao-tecnica/` (4.1–4.3) |
| 19–21 | Diagramas: texto, casos de uso, classes | ✅ 10 vistas de caso de uso e tabela de caso de uso para cada uma das 30 telas; 12 vistas de classes com tabela de divergências em relação ao banco | `docs/producao-tecnica/` (5.1–5.2), `build/telas.py` |
| 22 | DER | ✅ DER geral e 6 partes gerados do schema (27 tabelas) + dicionário de dados | `docs/producao-tecnica/` (5.3), `docs/producao-tecnica/tabelas/dicionario-de-dados.md` |
| 23, 25, 28 | Estados, DFD, contexto | ✅ figuras da entrega de 11/11 + máquinas de estado geradas dos enums (solicitação, atendimento, pagamento, habilitação) e diagrama de contexto gerado; divergência do DFD P5 registrada (P-06) | `docs/producao-tecnica/` (5.4, 5.6, 5.9) |
| 24, 26, 27 | Operação, processos de telas, ferramenta CASE | ✅ 4 diagramas de operação (aceite, check-in, encerramento, pagamento/comprovante), transições de telas e ferramentas CASE com o gerador do próprio repositório | `docs/producao-tecnica/` (5.5, 5.7, 5.8) |
| 29 | Rotas = sitemap | ✅ 33 rotas com componentes reais conferidas no código e no Mermaid. A rota coringa redireciona para o splash | `frontend/src/rotas.tsx`, `docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md` |
| 30 | Componentes fiéis aos wireframes | 🟡 telas implementadas. A evidência de aderência ao protótipo final depende dos wireframes e do link do Figma | `frontend/src/pages/`, `Contexto/Arquivos Stitch/` |
| 31 | Responsividade | 🟡 pagamento conferido a 320, 768 e 1280 px no Chrome. Falta evidência sistemática das demais telas e de dispositivos físicos | `docs/TESTES.md` |
| 32 | Estados visuais (carregando/sucesso/erro/vazio) | 🟡 componentes disponíveis e fluxos principais exercitados. Falta cobertura por tela | `frontend/src/components/ui.tsx`, `pages/*` |
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
| 45–47 | Deploy, HTTPS, rotas SPA | ✅ API pública com banco conectado, origem da API confirmada no bundle da Vercel, CORS da Vercel confirmado, HTTPS nos dois domínios e acesso direto à rota SPA com HTTP 200 | `docs/DEPLOY.md`, `docs/TESTES.md` |
| 48 | Testes de fluxo principal e exceções | ✅ 62 casos de backend e 6 de frontend. A retomada inclui a virada semanal, os totais e detalhes financeiros e o cancelamento simultâneo à redistribuição | `docs/TESTES.md` |
| 49 | Auditoria de código (domínio da equipe) | ⬜ cada integrante revisa e explica sua parte (Bloco Z) | — |
| 50 | Ensaio de demonstração | 🟡 roteiro atualizado. Ensaio integral com o grupo no ambiente de avaliação continua pendente | `docs/ROTEIRO_DEMONSTRACAO.md` |

## 4. Divergências encontradas entre materiais (AGENTS.md §4)

| Divergência | Materiais | Tratamento |
|---|---|---|
| Janela de check-in: mockup cita 15 min; briefing diz "a definir" | `Contexto/Arquivos Stitch/code (1).html` × briefing | Adotado 30 min como parâmetro (D-05); **grupo decide** |
| Diagrama de classes tem `Local` como classe separada; o banco absorveu os campos em `solicitacoes` | `Entregas/30_09` × `schema.ts` | Documentado em `docs/REGISTRO_TRABALHO.md` §4; o DER é gerado do schema e a diferença está na tabela de divergências da seção 5.2 do documento |
| O DFD P5 libera o comprovante no encerramento; D-10 e a aplicação o emitem após a confirmação do pagamento | `Entregas/Viamos_Modelagem_Sistemas.pdf` × `pagamento.service.ts` | Registrado no documento (seção 5.6) e em `docs/DECISOES.md` P-06; **grupo decide** |
| Disponibilidade semanal era gravada, mas não participava da distribuição; agenda vazia sem significado definido | BPMN 3 (11/11) × código anterior | Regra única D-20 (agenda vazia = disponível sempre; vale o horário de início) aplicada; **grupo valida** (P-05) |
| Checklist SKM pede Swagger/OpenAPI; o checklist do professor não cita | SKM × Dossiê | Será feito (Bloco F4) por ser barato e útil ao avaliador |
| "PROMPT AGENTES" pede 11 papéis + decisor; a ferramenta de um dos integrantes (ChatGPT) não executa agentes paralelos | PROMPT AGENTES × ferramentas | Protocolo sequencial para ChatGPT e subagentes para Claude, registrado em `docs/EQUIPE_AGENTES.md` §2 |
