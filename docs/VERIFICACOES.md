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
| Regra de ouro: "um júnior executaria sem perguntar?" | `PLANO_BLOCOS.md` descreve cada tela com rota, endpoints, protótipo e estados esperados | ✅ | `docs/PLANO_BLOCOS.md` |

## 2. Software Development Checklist 2026 (SKM) — fases e entregáveis

| Fase | Entregável exigido | Situação no Víamos | Evidência / onde ficará |
|---|---|---|---|
| 1 Discovery & Planning | SRS (requisitos funcionais e não funcionais) | ✅ entregue em 02/09 (45 RF, 45 RNF, matriz RF×RNF, histórias) | `Entregas/Engenharia de Requisitos/ENTREGA VIAMOS COMPLETA.xlsx`, `Contexto/ARQUIVOS .MD/Briefing_Projeto_Viamos.md` |
| 1 | Roadmap e cronograma | ✅ plano em blocos até 21/11 | `docs/PLANO_BLOCOS.md` |
| 1 | Wireframes de baixa fidelidade | 🟡 existem protótipos de alta fidelidade (Stitch); wireframes descritos tela a tela ficam para o documento (#4) | `Contexto/Arquivos Stitch/`, Bloco P2 |
| 1 | Estimativa de orçamento | ➖ projeto acadêmico sem custo (hospedagem gratuita) — registrar no documento como "custo zero de infraestrutura" | Bloco P2 |
| 2 Design & Prototyping | Mockups de alta fidelidade | ✅ 12 telas Stitch (HTML + PNG) | `Contexto/Arquivos Stitch/` |
| 2 | Protótipo interativo (clicável) | ⬜ link do Figma pendente (importar do Stitch) | Pendência P-01 em `docs/DECISOES.md` |
| 2 | Design system / style guide | ✅ `DESIGN.md` aplicado como tokens do Tailwind | `frontend/src/index.css` |
| 3 Core Development | Acesso ao repositório de código | ✅ repositório público no GitHub com commits publicados na `main` | `README.md` §8 |
| 3 | MVP funcional / builds incrementais | ✅ backend completo + 100% das 23 rotas do frontend (`SITEMAP`) implementadas e compiladas nos Blocos F1–F4 | commits na `main` |
| 3 | Documentação da API (Swagger/OpenAPI) | ⬜ adicionar especificação OpenAPI gerada a partir das rotas | `backend/src/routes/index.ts` (mapa comentado) → `docs/api/openapi.yaml` |
| 4 QA & Testing | Plano e casos de teste | 🟡 50 casos automatizados passando no backend (incluindo validações OWASP de magic bytes e suporte); plano escrito fica para `docs/TESTES.md` | `backend/tests/`, `docs/TESTES.md` |
| 4 | Relatório de bugs e resoluções | ✅ ativo e atualizado nos Blocos F1–F4 (B-001 a B-009 registrados e corrigidos) | `docs/BUGS.md` |
| 4 | Auditoria de performance e segurança | ✅ hardening OWASP aplicado (magic bytes, revogação de sessões em `alterarSenha`, validação de `fotoUrl`, download via Blob, limpeza LGPD) + `npm audit` | `backend/src/`, `docs/BUGS.md` |
| 5 Deployment & SLA | Ambiente de produção ativo | ⬜ Bloco D | `docs/DEPLOY.md` |
| 5 | Manuais de usuário e administrador | ⬜ Bloco Z (roteiro de demonstração + manual curto por perfil) | `docs/MANUAL.md` |
| 5 | SLA | ⬜ documento curto com disponibilidade esperada da hospedagem gratuita e janela de suporte (Bloco D) | `docs/SLA.md` |
| 5 | Entrega do código-fonte | ✅ o repositório é a entrega | GitHub |
| Red flags | "Sem SRS", "sem protótipo", "sem acesso ao repo", "sem plano de testes", "sem SLA" | 2 de 5 ainda em aberto (plano de testes escrito, SLA) | Blocos F4 e D |

## 3. Dossiê — checklist de 50 critérios (auditoria da reta final)

Estado por item, com a evidência atual. Itens 1–28 são o documento "Produção Técnica"; 29–50 a aplicação.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 1–2 | Texto introdutório e modelagem do produto | ⬜ | Bloco P2 |
| 3 | Sitemap | 🟡 rotas definidas em código; figura pendente | `frontend/src/rotas.tsx` → Bloco P1 |
| 4 | Wireframes tela a tela com tabela | ⬜ | Bloco P2 (base: Stitch) |
| 5 | Prototipação (link Figma) | ⬜ | Pendência P-01 |
| 6–9 | Arquitetura (texto, funcional, técnica, MVC) | 🟡 MVC implementado; figuras pendentes | `backend/src/` → Bloco P1 |
| 10–14 | Requisitos (texto, RF, RNF, associação, projeto linear) | 🟡 conteúdo existe no xlsx; consolidar no documento | `Entregas/Engenharia de Requisitos/` → Bloco P2 |
| 15–18 | Processos (texto, macroprocesso, fluxograma, BPMN) | 🟡 BPMN entregue em 11/11; macroprocesso e fluxograma pendentes | `Entregas/Viamos_Modelagem_Sistemas.pdf` → Bloco P1 |
| 19–21 | Diagramas: texto, casos de uso, classes | 🟡 entregues em 07/10; tabela por caso de uso pendente | `Entregas/30_09/` → Bloco P2 |
| 22 | DER | 🟡 fonte pronta (schema); figura pendente | `backend/src/models/schema.ts` → Bloco P1 |
| 23, 25, 28 | Estados, DFD, contexto | ✅ entregues em 11/11 | `Entregas/Viamos_Modelagem_Sistemas.pdf` |
| 24, 26, 27 | Operação, processos de telas, ferramenta CASE | ⬜ | Bloco P1 |
| 29 | Rotas = sitemap | ✅ 23/23 rotas ativas com componentes reais (0 placeholders) | `frontend/src/rotas.tsx` |
| 30 | Componentes fiéis aos wireframes | ✅ Todas as 23 rotas implementadas (Splash, Login, F1 Autenticação/Cadastro/Notificações/Suporte, F2 Jornada do Cliente, F3 Jornada do Intérprete, F4 Backoffice e Verificação Pública) | `frontend/src/pages/`, `frontend/src/components/` |
| 31 | Responsividade | ✅ shell mobile + sidebar desktop + grids responsivos em todas as 23 telas | `frontend/src/components/AppShell.tsx`, `TelaPublica.tsx`, `pages/*` |
| 32 | Estados visuais (carregando/sucesso/erro/vazio) | ✅ componentes prontos e aplicados em todas as 23 rotas da aplicação | `frontend/src/components/ui.tsx`, `pages/*` |
| 33 | Validação e máscaras | ✅ máscaras (`formato.ts`) + validação no cliente (`validacao.ts`) + validação Zod no servidor | `frontend/src/utils/{formato,validacao}.ts`, `backend/src/controllers/*` |
| 34 | Separação MVC no back-end | ✅ | `backend/src/{models,controllers,views,routes,services}` |
| 35 | Status HTTP semânticos | ✅ 200/201/202/204/400/401/402/403/404/409/422/423/429 | `backend/src/routes/index.ts`, testes |
| 36 | Erros sem stack trace | ✅ testado | `backend/src/middlewares/erros.ts`, `tests/excecoes.test.ts` |
| 37 | `.env` para segredos | ✅ | `backend/.env.example`, `src/config/env.ts` |
| 38 | Schema alinhado ao DER | ✅ (o DER será gerado do schema) | `backend/src/models/schema.ts` |
| 39 | PK/FK/integridade | ✅ FKs, CHECKs, índices únicos (inclusive parcial) | `backend/drizzle/0000_esquema_inicial.sql` |
| 40 | ORM / consultas parametrizadas | ✅ Drizzle | `backend/src/models/db.ts` |
| 41 | Migrações e seed | ✅ | `backend/drizzle/`, `backend/src/db/seed.ts` |
| 42 | `.gitignore` | ✅ testado (sem `.env`/`node_modules` nos commits) | `.gitignore` |
| 43 | Branches e commits organizados | ✅ commits organizados por escopo na `main` | histórico git |
| 44 | README com clonagem/instalação/execução | ✅ | `README.md` |
| 45–47 | Deploy, HTTPS, rotas SPA | 🟡 configs prontas (`render.yaml`, `vercel.json`); publicação no Bloco D | — |
| 48 | Testes de fluxo principal e exceções | ✅ 50 casos passando (backend, reproduzidos com PostgreSQL 18.6 embutido); frontend no F4 | `backend/tests/` |
| 49 | Auditoria de código (domínio da equipe) | ⬜ cada integrante revisa e explica sua parte (Bloco Z) | — |
| 50 | Ensaio de demonstração | ⬜ Bloco Z | `docs/ROTEIRO_DEMONSTRACAO.md` |

## 4. Divergências encontradas entre materiais (AGENTS.md §4)

| Divergência | Materiais | Tratamento |
|---|---|---|
| Janela de check-in: mockup cita 15 min; briefing diz "a definir" | `Contexto/Arquivos Stitch/code (1).html` × briefing | Adotado 30 min como parâmetro (D-05); **grupo decide** |
| Diagrama de classes tem `Local` como classe separada; o banco absorveu os campos em `solicitacoes` | `Entregas/30_09` × `schema.ts` | Documentado em `docs/REGISTRO_TRABALHO.md` §4; DER será gerado do schema e a diferença explicada no documento |
| Checklist SKM pede Swagger/OpenAPI; o checklist do professor não cita | SKM × Dossiê | Será feito (Bloco F4) por ser barato e útil ao avaliador |
| "PROMPT AGENTES" pede 11 papéis + decisor; a ferramenta de um dos integrantes (ChatGPT) não executa agentes paralelos | PROMPT AGENTES × ferramentas | Protocolo sequencial para ChatGPT e subagentes para Claude, registrado em `docs/EQUIPE_AGENTES.md` §2 |
