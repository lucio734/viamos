# Registro de trabalho — estado real do projeto (AGENTS.md §6)

Documento de continuidade: o que foi **concluído e verificado**, o que está **pendente ou não testado**, quem fez
(papel/agente), arquivos relevantes, decisões, riscos e próximos passos. Atualizar ao fim de cada bloco.

## Preparação final da documentação

O README aponta para as cinco seções da Produção Técnica, a edição em DOCX e PDF e os comandos de instalação, execução e validação. As instruções permanentes estão em `AGENTS.md` e no índice de documentação. Os dois relatórios de passagem de bastão foram reunidos em `CLAUDE/`, que pode ser retirada depois da implementação, dos testes finais e da validação do deploy. O registro de trabalho, as fontes do Stitch e os arquivos usados na geração do capítulo ficam disponíveis para consulta e atualização da entrega.

A equipe confirmou que produziu as telas no Stitch. O protótipo navegável no Figma e as evidências de seu fluxo seguem registrados em P-01. O plano de fechamento apresenta as etapas pendentes do aplicativo e da entrega. [Índice de entregas](../Entregas/README.md) · [Plano de fechamento](PLANO_BLOCOS.md#fechamento-do-projeto)

## Revisão dos arquivos de contexto

Foi removida a cópia duplicada de `DESIGN.md` em `Contexto/ARQUIVOS .MD/`. As duas cópias tinham o mesmo conteúdo no Git. O README aponta para o arquivo junto aos protótipos Stitch.

A Produção Técnica usa as imagens originais do Stitch no gerador e aponta para o roteiro da disciplina em `DOC.txt`. O briefing, o PRD e as fontes de auxílio ao vibecoding continuam disponíveis para conferir requisitos e decisões. A revisão dos arquivos de passagem de bastão fica para o encerramento do aplicativo e a validação das pendências registradas no projeto.

A pasta da Produção Técnica passou a seguir a ordem das cinco seções do `DOC.txt`. Os índices de cada seção ligam os subtópicos aos diagramas, tabelas e fontes, e o capítulo integral fica no DOCX e no PDF. A exportação inicial da auditoria do Dossiê foi removida após conferir que repetia os 50 critérios do checklist original, todos com status pendente. A matriz de verificações reúne os resultados atuais. [Índice da entrega](../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/README.md) · [Matriz de verificações](VERIFICACOES.md)

## Organização das entregas em 16/11/2026

Os índices em `Entregas/` e `docs/` apontam para o capítulo atual, o modelo e as entregas anteriores. O DOCX e o PDF de 15/11 foram movidos para `Entregas/Produção Técnica/`. As fontes e o gerador ficam em `docs/producao-tecnica/`. A organização foi conferida contra as cinco seções do `DOC.txt`, o modelo da disciplina e os itens #1 a #28 do Dossiê. Os links locais, a abertura dos pacotes e a verificação dos 34 diagramas foram conferidos.

O Codex atualizou a ficha e a captura de ganhos, a descrição da hospedagem e as figuras `26-telas-interprete` e `27-ferramenta-case`. A captura foi conferida em viewport móvel com uma conta fictícia do banco local. As figuras foram renderizadas da fonte Mermaid e verificadas visualmente. Em 16/11, o GitHub Actions gerou o DOCX e exportou o PDF com LibreOffice Writer. O Codex conferiu as cinco seções, os links do DOCX, as 113 imagens, as 65 tabelas e as 116 páginas renderizadas. [Execução da exportação](https://github.com/lucio734/viamos/actions/runs/43915643181) O link do protótipo Figma (P-01) e a decisão sobre o momento do comprovante (P-06) continuam pendentes.

## Retomada do desenvolvimento em 15/11/2026

O Codex implementou e testou o detalhamento semanal dos ganhos (RF26, US22, B-029) e a proteção da redistribuição contra o fechamento concorrente da demanda (RF17/RF19/RF22, B-030). A referência foi a planilha `ENTREGA VIAMOS COMPLETA.xlsx`, além do briefing e das decisões D-09 e D-20. O painel usa datas de Brasília, distingue recebido e a receber por atendimento e mantém o saldo de repasse de todo o período. A API lê o painel com um snapshot único. A redistribuição revalida a demanda sob o mesmo bloqueio usado no aceite e cancelamento.

Os subagentes `revisao_dados_financeiros` (Back-end/DBA) e `revisao_redistribuicao` (Back-end/QA) revisaram os cenários e as propostas de regressão de forma independente. Os prompts delimitaram contexto, entrada, regras e formato conforme o **labProt** e os papéis seguiram o **PROMPT AGENTES**. Logs de resolução e resultados foram conferidos contra as fases 3/4 do **Checklist 2026** e os itens #38 e #48 do **Dossiê**. Passaram 62 testes de backend, 6 de frontend, ambos os builds, a verificação do DER e a conferência dos 34 diagramas. [Relatório de teste](TESTES.md#3-matriz-resumida-de-casos-de-teste-automatizados) · [Log de bugs](BUGS.md)

Continuam pendentes a corrida entre criação da solicitação e entrada do intérprete online (B-031), a escolha do momento do comprovante (P-06) e a revisão por dispositivo físico. As fontes Mermaid e a tabela de transições incluem o link de ganhos para o atendimento. Falta regerar os PNGs `26-telas-interprete` e `27-ferramenta-case`, pois a instalação do Mermaid CLI falhou por falta de espaço. O DOCX e o PDF da Produção Técnica entregues pela equipe ainda correspondem à versão anterior.

## Publicação em nuvem em 15/11/2026

O Codex executou a publicação no Render a partir da `main` e configurou a origem da API na Vercel. A API confirmou a conexão ao PostgreSQL (HTTP 200) e autorizou a origem da Vercel no preflight de login (HTTP 204). O frontend inicial serviu a SPA por HTTPS em uma rota interna. A Vercel solicitou verificação de identidade para a republicação que incorpora `VITE_API_URL`.

As evidências dos itens #45–47 do Dossiê e da Fase 5 do Checklist 2026 estão no [guia de deploy](DEPLOY.md#publicação-de-15112026). A fase foi registrada com contexto, evidências, restrições e pendências conforme o labProt. O banco está migrado e segue sem a carga de demonstração. O ensaio autenticado, o PDF e o teste com câmera e GPS físicos permanecem pendentes.

Em 16/11, a Vercel publicou o commit `2710e91` a partir da `main`. O Render publicou o mesmo commit pelo painel. Foram conferidos o CI verde, a origem da API no bundle público, a resposta HTTP da rota de login sem conta cadastrada e a nova sonda de prontidão. O ensaio autenticado permanece pendente.

## Retomada após o push do Gustavo em 15/11/2026

A `main` local foi atualizada por fast-forward até `c2ce8f1`. A etapa priorizou a preparação do Bloco D e a revisão dos fluxos que serão apresentados. A Produção Técnica em DOCX e PDF continua disponível na versão entregue pelo Gustavo.

| Verificação | Resultado e evidência |
|---|---|
| Bloco D, Dossiê #45–47 e RNF04 | A sonda `/api/health` consulta o PostgreSQL com prazo inferior a 5 segundos. Retorna 200 quando o banco responde e 503 em caso de falha. O modo local de produção confirmou sonda interna, redirecionamento HTTPS nas rotas da aplicação, CORS, origem pública do Render e login. O Blueprint solicita o domínio efetivo da Vercel. A validação em hospedagem depende dos projetos da equipe (P-03). |
| RF18, RF20–RF23 e D-20 | Candidatos elegíveis veem a demanda em busca com telefone e foto ocultos. A ficha fica disponível ao cliente, ao intérprete alocado e à operação. Recusa e aceite são coerentes com a lista e a recusa não altera uma oferta após o fim da busca. A regressão está em `backend/tests/excecoes.test.ts`. |
| Qualidade e rastreabilidade | 59 testes de backend em base descartável e 6 de frontend passaram. Ambos os builds e a checagem dos 34 diagramas passaram. `docs/TESTES.md` registra o escopo da verificação em modo produção local. |

O Codex implementou, executou os testes e atualizou a documentação. Os subagentes `validacao_fluxos` (QA/Back-end) e `preparacao_deploy` (DevOps/SRE) revisaram o código anterior e o diff final. O **PROMPT AGENTES** e `docs/EQUIPE_AGENTES.md` orientaram os papéis. Os prompts usaram contexto, entradas, objetivo, restrições e formato de saída do **labProt**. Os resultados foram conferidos contra as fases de testes e deploy do **Checklist 2026** e os itens #38, #45–48 do **Dossiê**.

Para continuar, provisionar os projetos da equipe e executar o checklist em `docs/DEPLOY.md`. O ensaio com câmera e GPS físicos, o link do Figma e as validações do grupo registradas em `docs/DECISOES.md` continuam pendentes. A revisão também identificou a janela semanal de ganhos (RF26) e uma possível corrida de redistribuição como próximos pontos de teste.

## Continuação em 15/11/2026 — Gustavo + Claude (agente único)

Partiu de `19ff39a` (retomada do Lúcio já na `main`) e seguiu a "Próxima etapa proposta" da seção seguinte. `Contexto/` e
`Entregas/` foram só lidos.

| Commit | O que mudou | Como foi verificado |
|---|---|---|
| `d824c3a` | **B-022** A recusa do pagamento (402) passou a usar o envelope padrão `{ erro: { codigo: 'PAGAMENTO_RECUSADO', mensagem } }`, e o cliente HTTP também lê a mensagem na raiz da resposta: o cliente vê o motivo da recusa. | caso em `excecoes.test.ts` |
| `c5090f6` | **RF17, RF20–RF25 (D-20, B-025)** Regra única de elegibilidade (`backend/src/utils/elegibilidade.ts`) usada na distribuição, na lista, no detalhe e no aceite: habilitação aprovada → distância ≤ menor valor entre o raio do intérprete e 15 km → início dentro da disponibilidade semanal (fuso `America/Sao_Paulo`; sem janelas = disponível sempre) → sem sobreposição na agenda. **Nova distribuição:** ao ficar online, mudar o raio ou salvar janelas, o intérprete recebe as demandas abertas que passaram a caber. **RF26, RF27 e RF36 (B-026)** Saldo e "a receber da semana" somados no banco sobre todo o extrato; repasse e cobrança serializados por bloqueio de linha (sem saldo negativo nem crédito em dobro). **B-024** A agenda aceita HH:MM e a tela exibe HH:MM (o banco guarda HH:MM:SS). Seed: agenda da Maria cobre todos os dias, o dia inteiro; Carlos sem janelas. | 4 casos novos (57/57); os casos de cobrança e repasse falham no serviço anterior |
| `7af32e9` | **Bloco P1** Gerador de diagramas a partir do código (`docs/diagramas/`): 34 diagramas (sitemap, DER de 27 tabelas, arquiteturas, MVC, macroprocesso, fluxograma, estados, operação, telas, contexto, CASE), com validação de funções, códigos de erro, RF e estados contra o código. Job `diagramas` no CI e `docs:modelo --verificar` no backend (Dossiê #38). **B-023** O DER manual foi substituído pelo gerado. | `npm run verificar` |
| `f487b63` | **Bloco P2** Documento Produção Técnica (`docs/producao-tecnica/`) no formato de `Entregas/modelo_entrega.docx`: 107 páginas, 113 figuras e 52 tabelas, com as 30 telas capturadas do aplicativo, os 37 diagramas recortados das entregas de 30/09 e 11/11, a tabela de caso de uso de cada tela, os requisitos lidos da planilha e as divergências entre entregas e aplicativo. Pipeline reproduzível em `docs/producao-tecnica/README.md`. | páginas renderizadas e inspecionadas; numeração automática de figuras e tabelas |

**Verificação final (15/11, 20:32, PostgreSQL 18 local):** backend `typecheck` ✅, `npm test` **57/57** ✅ e
`docs:modelo -- --verificar` ✅; frontend `npm test` 6/6 ✅, `typecheck` ✅, `lint` com 0 erros (avisos
`set-state-in-effect` já existentes) e `build` ✅ (aviso de bundle acima de 500 kB já existente); `docs/diagramas`
`npm run verificar` ✅ (34 diagramas, 33 rotas, 65 endpoints, 27 tabelas). A agenda com HH:MM foi conferida no navegador.

**Situação da "Próxima etapa proposta":** (1) ✅ feito, com D-20 aguardando validação do grupo (P-05); (2) ✅ feito;
(3) registrado como P-06 e descrito no documento, decisão do grupo; (4) 🟡 documento consolidado; faltam o link do
Figma (P-01), a publicação nas contas da equipe (P-03) e o ensaio com câmera e GPS em dispositivo físico.

**Declaração honesta (AGENTS.md §3):** esta continuação foi feita por **um único agente (Claude)**, sob direção do
Gustavo, acumulando em sequência os papéis de Back-end, Dados, QA, Documentação e DevOps (CI). **Não houve revisão
independente por subagentes.** Os textos do documento que o plano atribuía ao Lúcio (introduções, tabelas de requisitos
e de caso de uso, descrição das telas) também foram escritos por este agente; a leitura completa e a revisão do
documento pelo grupo (Bloco P3) e a auditoria #49 continuam pendentes.

## Retomada em 15/11/2026

A revisão começou em `089774a`, com `main` e `origin/main` iguais no clone e sem alterações locais. A etapa de estabilização e a passagem de bastão foram integradas à `main`. As pastas `Contexto/` e `Entregas/` foram preservadas.

| Área | Estado conferido |
|---|---|
| Aplicação e arquitetura | React/Vite, API MVC Express/Drizzle, PostgreSQL com 27 tabelas e duas migrações. O sitemap soma 33 telas (8 públicas, 9 de cliente, 10 de intérprete, 4 de backoffice, 2 comuns), além do redirecionamento coringa. Os registros históricos de 23 telas não representam a contagem atual. |
| Requisitos e design | Foram consultados o Briefing, PRD, design e protótipos Stitch, as duas planilhas de requisitos, os PDFs de UML e Modelagem e o modelo DOCX. A planilha consolidada contém 45 RF, 45 RNF, associações, projeto linear e histórias. A presença de uma tela indica implementação da rota. A evidência de cada comportamento depende da revisão e dos testes correspondentes. |
| Produção Técnica | Já existem diagramas Mermaid, PDFs de contexto/BPMN/DFD/estados e arquivos UML/CASE da equipe. `Contexto/DOCUMENTAÇÃO REPOSITÓRIO/DOC.txt` e o Dossiê descrevem os itens 1–28. O `modelo_entrega.docx` mostra a sequência de introdução, figura numerada com fonte, explicação, tabela quando aplicável e conclusão. A consolidação final com figuras, tabelas por caso de uso e link do Figma segue pendente. |
| Operação e qualidade | CI, OpenAPI parcial, guia de deploy, SLA, plano de testes, manual e roteiro já existiam no commit de base. O roteiro não comprova ensaio na hospedagem. Publicação, HTTPS, metas de carga/disponibilidade e cobertura integral de acessibilidade ainda precisam de evidências. |

### Correções desta etapa

- **RF18** O acompanhamento atualiza a cada 5 s durante os estados ativos e preserva o conteúdo quando uma atualização falha. O cliente recebe o QR quando o aceite é confirmado e pode repetir a consulta do código se ela falhar.
- **RF19, RF22 e RF31** O aceite serializa a verificação da agenda por intérprete. Cancelamento e check-in seguem a mesma ordem de bloqueio. A política de cancelamento usa o vínculo e o estado lidos após adquirir o bloqueio.
- **RF29 e RNF44** A sala publica a posição capturada pelo navegador no canal temporário e sinaliza sua disponibilidade à contraparte. O mapa deixa de mostrar posições no encerramento ou cancelamento. Chamadas antigas de mensagem do tipo `LOCALIZACAO` continuam aceitas e usam o canal temporário. O histórico continua retornando os campos de coordenadas com valor nulo. A eliminação de valores históricos já gravados depende da política de retenção do grupo.
- **RF31, RF32 e RNF26** Leitura do QR liberada após a captura explícita de posição. A simulação do aplicativo está disponível apenas no servidor de desenvolvimento para ensaios com dados fictícios.
- **Dossiê #41, #44–48** Os testes exigem uma URL de base descartável. O Render recebe as dependências de build, e a SPA aceita a origem da API com ou sem o sufixo `/api`. Guia de deploy, roteiro e contrato do health foram conferidos contra a implementação.

### Papéis e verificações

- **Codex principal (coordenação, implementação e validação)** cruzou os artefatos com o código, priorizou as correções do fluxo presencial e executou a validação em ambiente local. `docs/TESTES.md` registra comandos, resultados e limites.
- **Revisão independente de Produto/UX** conferiu RF/RNF, contagem do sitemap, fixtures do roteiro e os diffs da sala, acompanhamento e check-in. A revisão levou ao aviso da contraparte, ao estado de erro do QR e ao anúncio de captura do GPS.
- **Revisão independente de Backend/Dados/QA** comparou serviços, schema e suítes, identificou corridas de aceites, cancelamento e localização e revisou os bloqueios e os casos adicionados.
- **Revisão independente de CI/CD e DevOps** conferiu Blueprint, lockfiles, variáveis, OpenAPI e pré-requisitos locais. A revisão levou ao isolamento obrigatório do banco, à correção do build e ao alinhamento do guia com a configuração publicada no repositório.
- **Fontes de processo** `PROMPT AGENTES.docx` e `docs/EQUIPE_AGENTES.md` orientaram os papéis. Os prompts das revisões aplicaram papel, tarefa, contexto, entrada documental, restrições, formato e exemplo, conforme labProt. A sequência requisitos → correção → caso reproduzível → revisão foi cruzada com as fases 3–5 do Checklist 2026 e com os itens #29, #31–32 e #38–50 do Dossiê. Resultados e pendências estão em `docs/VERIFICACOES.md` e `docs/BUGS.md`.

### Próxima etapa proposta

1. **RF17, RF20–RF25** Reconciliar a elegibilidade entre distribuição, lista, detalhe e aceite. A disponibilidade semanal é gravada, mas não participa da seleção. Uma demanda listada sem oferta pode retornar 403 no detalhe. O BPMN prevê nova distribuição quando não há elegíveis, e o código distribui apenas na criação. Definir o comportamento da agenda vazia e a política de nova distribuição com o grupo.
2. **RF26–RF27, RF36** Agregar o saldo sobre todo o extrato e serializar repasses. Revisar cobrança simultânea e separar o a receber da semana do saldo total. Manter pagamentos e e-mail no escopo simulado (D-08 e configuração existente).
3. **RF37–RF38** Conciliar o DFD P5 da entrega de Modelagem, que libera o PDF no encerramento, com D-10 e a aplicação, que o emitem depois da confirmação do pagamento. Encaminhar ao grupo junto com os valores D-01 e a janela D-05.
4. **Dossiê #1–28 e #45–50** Consolidar a Produção Técnica no modelo solicitado, obter o link do Figma, publicar nas contas da equipe e repetir a demonstração com dados fictícios, HTTPS, recarga de rota, QR com câmera e GPS em dispositivo físico.

## 1. Linha do tempo

| Data | Bloco | Executor | Resultado |
|---|---|---|---|
| 02/09 | Requisitos | grupo | 45 RF, 45 RNF, matriz, Projeto Linear, histórias (`Entregas/Engenharia de Requisitos/`) |
| 07/10 | UML | grupo | Casos de uso (10 vistas) e classes (11 vistas) (`Entregas/30_09/`) |
| 11/11 | Modelagem | grupo | Contexto (2), BPMN (6), DFD (6), estados (1) (`Entregas/Viamos_Modelagem_Sistemas*.pdf`) |
| 11–12/11 | **Bloco 0** | Gustavo + Claude (agente único) | Backend completo e testado; base do frontend; documentação de trabalho (publicados na `main`) |
| 12/11 | — | Lúcio | `CLAUDE/CLAUDE.md` e `CLAUDE/AGENTS.md` com regras obrigatórias; `PROMPT AGENTES.docx`; material extraído em `Contexto/` e `Entregas/` |
| 12/11 (noite) | **Bloco F1** | Lúcio + Equipe de Agentes (Scrum Master/Front-end + subagentes `revisor_ux_ui`, `revisor_qa_security`, `revisor_po`) | Conferência do repositório (`main` já continha o Bloco 0), reprodução dos testes de backend em PostgreSQL 18.6 local (50/50), espelhamento de `AGENTS.md`/`CLAUDE.md` na raiz, implementação e revisão das 7 rotas do Bloco F1 + `Mapa.tsx` + `TelaPublica.tsx` + `validacao.ts` |
| 12/11 (noite) | **Blocos F2, F3 e F4 (Telas + Hardening OWASP)** | Lúcio + Equipe de Agentes | Implementação integral da Jornada do Cliente (**Bloco F2**: 7 rotas + `Sala.tsx`, `AvaliarAtendimento.tsx`, `HistoricoAtendimentos.tsx`), Jornada do Intérprete (**Bloco F3**: 7 rotas + `LeitorQr.tsx`), Backoffice e Verificação Pública (**Bloco F4**: 5 rotas finais — **100% das 23 rotas de `rotas.tsx` implementadas, 0 placeholders**) e hardening OWASP no backend (magic bytes no upload, revogação de sessões em `alterarSenha`, validação de `fotoUrl`, limpeza LGPD de endereço/CEP e download seguro via Blob) |
| 15/11 | Retomada e estabilização | Lúcio + Codex, com revisões independentes de Produto/UX, Backend/Dados/QA e CI/CD | Ver "Retomada em 15/11/2026" (`4bf2299`, `19ff39a`) |
| 15/11 (noite) | Correções RF17–RF27/RF36, **P1** e **P2** | Gustavo + Claude (agente único) | Ver "Continuação em 15/11/2026" (`d824c3a`, `c5090f6`, `7af32e9`, `f487b63`) |

## 2. Bloco 0 — o que foi feito (concluído e verificado)

### Backend (`backend/`) — ✅ verificado por 49 testes automatizados
- API REST em arquitetura MVC: `src/models` (schema Drizzle + conexão), `src/controllers` (HTTP ⇄ services, esquemas Zod), `src/views` (presenters JSON e PDF do comprovante), `src/routes/index.ts` (mapa completo com RF por rota), `src/services` (regras de negócio), `src/middlewares` (JWT + sessão revogável, validação, erros).
- Banco: 27 tabelas, enums, FKs, CHECKs, índices únicos (inclusive parcial "um pagamento PAGO por atendimento"), gatilho de auditoria imutável. Migrações `drizzle/0000_esquema_inicial.sql` e `0001_auditoria_imutavel.sql`. Seed com cenário de demonstração.
- Cobertura funcional: RF01–RF45 (ver rotas). Regras parametrizadas em `src/config/regras.ts`; decisões em `docs/DECISOES.md`.
- Verificações executadas: `npm run typecheck` (ok), `npm test` → **49/49** (fluxo principal, 20+ exceções, unidades), `npm run build` + migração a partir de `dist/` (ok), smoke test HTTP ponta a ponta (ok), `npm audit` → 0 vulnerabilidades em dependências de produção; 1 moderada (esbuild) em dependência de desenvolvimento (drizzle-kit).

### Frontend (`frontend/`) — ✅ compila; 🟡 telas em construção
- Base: Vite + React 19 + TypeScript + Tailwind v4 com tokens do `DESIGN.md`; cliente HTTP (`src/api/cliente.ts`); sessão (`src/auth/AuthContext.tsx`); sitemap completo (`src/rotas.tsx`); shell com navegação inferior/lateral; componentes com estados; máscaras pt-BR.
- Telas prontas e verificadas contra a API real: Splash, Login, Hub do cliente. As demais rotas exibem `EmConstrucao` com endpoints e protótipo de referência.
- Verificações: `npm run build` (ok), captura de tela headless do login (layout ok; ícones Material Symbols dependem do Google Fonts, que o ambiente de teste não acessa).
- **Não testado**: telas no navegador real do grupo; comportamento em iOS/Android; testes automatizados de frontend (Bloco F4).

### Repositório e documentação
- `README.md` (clonagem, instalação, execução, testes, deploy), `.gitignore`, `.editorconfig`, `docker-compose.yml` (Postgres local), `render.yaml` (API), `frontend/vercel.json` e `public/_redirects` (rotas SPA).
- `docs/PLANO_BLOCOS.md`, `docs/DECISOES.md`, `docs/EQUIPE_AGENTES.md`, `docs/VERIFICACOES.md`, este registro e `contexto_atual_chatgpt.md`.

## 2.1. Bloco F1 — o que foi feito (concluído e verificado em 12/11)

### Conferência e integração do Bloco 0 na `main`
- Verificado que os commits do Bloco 0 (`c429bb5`, `b69566b`, `48dc820`, `cfccb92`) já estavam publicados diretamente na branch `main` remota (`origin/main`), sem branches paralelos pendentes e com o arquivo `contexto_atual_chatgpt.md` do repositório idêntico ao anexo.
- Espelhados `AGENTS.md` e `CLAUDE.md` na raiz do repositório (preservando `CLAUDE/AGENTS.md` e `CLAUDE/CLAUDE.md` intactos), atendendo à referência da linha 3 de `CLAUDE/CLAUDE.md`.
- Reproduzida neste ambiente a suíte completa de testes automatizados do backend contra uma instância real do **PostgreSQL 18.6** (`embedded-postgres`), ampliando de 49 para **50/50 testes passando** (`tests/unidades.test.ts`, `tests/fluxo-principal.test.ts`, `tests/excecoes.test.ts`).

### Telas e componentes implementados (`frontend/src/`)
1. **`frontend/src/utils/validacao.ts`**: validações instantâneas no cliente espelhando o backend (CPF, CNPJ, documento, telefone com DDD, CEP, e-mail, idade mínima de 16 anos sem rollover de calendário, senha de 8–72 caracteres e certificado PDF/JPG/PNG ≤ 5 MB + leitura Base64).
2. **`frontend/src/components/TelaPublica.tsx`**: moldura responsiva das telas públicas (barra superior com botão Voltar ≥ 44 px + marca Víamos) e componente `SecaoFormulario` (`fieldset`/`legend`), fiel aos protótipos `code (7).html` e `code (17).html`.
3. **`frontend/src/components/Mapa.tsx`**: componente compartilhado com `react-leaflet` + OpenStreetMap (`L.divIcon` sem dependência de imagens externas, clique/arraste do marcador, círculo do raio em km, botão de GPS explícito e função `geocodificar` via Nominatim com fallback manual). Pronto para reutilização nos Blocos F2 e F3.
4. **`/recuperar-senha` (`pages/auth/RecuperarSenha.tsx` — RF07, RNF06)** e **`/redefinir-senha/:token` (`pages/auth/RedefinirSenha.tsx` — RF07)**: fluxo completo de solicitação e redefinição de senha com validação por campo, estados visuais e atalho `tokenDev` em ambiente de demonstração.
5. **`/cadastro` (`pages/auth/SelecaoPerfil.tsx` — RF02)**: dois cartões acessíveis (Pessoa surda / Intérprete de Libras) destacando o escopo exclusivamente presencial (RNF28) e o raio de até 15 km (RNF27).
6. **`/cadastro/cliente` (`pages/auth/CadastroCliente.tsx` — RF03, RF45, RNF09)**: fiel ao protótipo `code (7).html`, corrigindo as lacunas apontadas no Briefing (inclusão de telefone obrigatório com máscara, preferências de acessibilidade e aceite explícito dos Termos de Uso e Política de Privacidade/LGPD).
7. **`/cadastro/interprete` (`pages/auth/CadastroInterprete.tsx` — RF04, RF05, RF45, RNF09, RNF36)**: fiel ao protótipo `code (17).html`, corrigindo as lacunas do Briefing (CPF/CNPJ, telefone, senha, múltiplas especialidades com `aria-pressed`, preço/hora, slider de raio 1–15 km, endereço-base com mapa interativo, tipo `PROLIBRAS`/`EQUIVALENTE`, número do certificado, upload por clique ou *drag-and-drop* até 5 MB em Base64, consentimentos LGPD e aviso pós-cadastro de "Documentação em análise").
8. **`/notificacoes` (`pages/comum/Notificacoes.tsx` — RF42)**: listagem com filtro Todas / Não lidas, marcar individual ou todas como lidas, navegação direta para `referenciaRecurso` e cobertura dos 4 estados visuais (item #32).
9. **`/suporte` (`pages/comum/Suporte.tsx` — RF34, RNF44)**: acionamento de Suporte operacional ou Emergência no local (avulso em `/suporte` ou vinculado via `?atendimentoId=`), aviso 190/192 e anexação opcional/explícita de geolocalização.
10. **`frontend/src/rotas.tsx`**: substituição dos 7 *placeholders* `tela({...})` do Bloco F1 pelos componentes reais.

## 2.2. Blocos F2, F3 e F4 (Telas + Hardening OWASP) — o que foi feito (concluído e verificado em 12/11)

### Hardening OWASP no Backend (`backend/src/`) e Cliente HTTP (`frontend/src/api/`)
- **Revogação de sessões ao alterar senha (`auth.controller.ts`, `auth.service.ts`)**: `POST /api/auth/alterar-senha` agora invalida todas as demais sessões ativas do usuário (`ne(sessoes.id, sessaoAtualId)`), preservando apenas a sessão atual.
- **Validação de *magic bytes* em uploads (`cadastro.service.ts`)**: `decodificarArquivo` inspeciona a assinatura binária real do arquivo (`%PDF` para PDF, `FF D8 FF` para JPEG e `89 50 4E 47` para PNG), rejeitando arquivos forjados com HTTP 400 (`VALIDACAO`), coberto por teste automatizado em `backend/tests/excecoes.test.ts`.
- **Detalhes por campo em conflito de e-mail (`erros.ts`, `cadastro.service.ts`)**: `Erros.conflito` aceita `detalhes` e retorna `[{ campo: 'email', mensagem }]` em `EMAIL_EM_USO` (409), permitindo destaque automático no formulário.
- **Descrição obrigatória em chamados `SUPORTE` (`atendimento.controller.ts`)**: `esquemaSuporte` exige `descricao` (mínimo 5 caracteres) quando `tipo === 'SUPORTE'`, mantendo-a opcional em acionamentos rápidos de `EMERGENCIA` (testado em `excecoes.test.ts`).
- **Validação de `fotoUrl` e anonimização completa LGPD (`perfil.controller.ts`, `perfil.service.ts`)**: `PUT /api/perfil` valida esquema/MIME de `fotoUrl` (`data:image/(jpeg|png|webp);base64,` ou `https://`, máx. 500k caracteres), e `POST /api/perfil/dados/excluir` limpa também `cep`, `endereco` e `preferenciasAcessibilidade` em `clientes`.
- **Download autenticado sem token na URL (`frontend/src/api/cliente.ts`)**: `api.abrirArquivo(caminho, nomeArquivo?)` realiza `fetch` com header `Authorization: Bearer <token>` e abre o PDF/certificado via `Blob` URL (`URL.createObjectURL`), eliminando exposição de JWT em query string.

### Bloco F2 — Jornada do Cliente e Componentes Compartilhados (`frontend/src/`)
1. **`/cliente/solicitacoes/nova` (`pages/cliente/NovaSolicitacao.tsx` — RF10–RF16, `code (15).html`)**: assistente em 3 passos (contexto/data/duração em blocos de 30 min com mínimo de 60 min; endereço + `<Mapa />` interativo + atalho de demonstração HC-FMUSP; estimativa prévia via `POST /solicitacoes/estimativa` antes de confirmar em `POST /solicitacoes`).
2. **`/cliente/solicitacoes/:id` (`pages/cliente/DetalheSolicitacao.tsx` — RF18, RF19, RF31)**: linha do tempo em tempo real, cartão do intérprete alocado, `<QRCodeSVG />` (`GET /atendimentos/:id/qrcode`) + código manual copiável, atalhos para sala/pagamento/PDF/avaliação e cancelamento com cálculo transparente de política/taxa (`POST /solicitacoes/:id/cancelar`).
3. **`/cliente/atendimentos/:id` (`pages/cliente/DetalheAtendimentoCliente.tsx` — RF31, RF33, RF37)**: cartão de check-in com `<QRCodeSVG />`, botão de encerramento (`POST /atendimentos/:id/encerrar`), ações de pagamento/comprovante PDF/verificação pública/avaliação e `<Mapa somenteLeitura />`.
4. **`/cliente/atendimentos/:id/sala` e `/interprete/atendimentos/:id/sala` (`components/Sala.tsx` — RF28–RF30, RF34, `code (21).html`)**: sala compartilhada com polling incremental de 4 s (`?apos=`), mensagens de texto, envio de foto do ponto de encontro (`Data URL ≤ 1 MB`), compartilhamento temporário de GPS (`POST /atendimentos/:id/localizacoes` + `<Mapa />` expansível) e botão SOS.
5. **`/cliente/atendimentos/:id/pagamento` (`pages/cliente/PagamentoAtendimento.tsx` — RF35, RF36, RF37)**: seleção de forma de pagamento salva, Pix imediato ou novo cartão/Pix com máscaras, processamento idempotente (`POST /pagamentos/:id/processar`), tratamento de recusa HTTP 402 e emissão de comprovante PDF.
6. **`/cliente/atendimentos/:id/avaliar` e `/interprete/atendimentos/:id/avaliar` (`pages/comum/AvaliarAtendimento.tsx` — RF40, `code (3).html`)**: avaliação bilateral de 1 a 5 estrelas com comentário opcional (`POST /atendimentos/:id/avaliacoes`).
7. **`/cliente/historico` e `/interprete/historico` (`pages/comum/HistoricoAtendimentos.tsx` — RF39, RF37, `code (13).html`)**: filtros por período (`de`/`ate`), atalho "Mês Atual", tipo de serviço e status, com abertura de comprovante PDF.
8. **`/cliente/perfil` (`pages/cliente/PerfilCliente.tsx` — RF43, RF45, RF35, `code (11).html`)**: Bento grid com edição de dados pessoais e preferências de acessibilidade (`PUT /perfil`), gestão de formas de pagamento (`GET/POST/DELETE /formas-pagamento`), alteração de senha (`POST /auth/alterar-senha`) e portal de direitos LGPD (consentimentos, exportação JSON e exclusão/anonimização).

### Bloco F3 — Jornada do Intérprete e Leitor de QR Code (`frontend/src/`)
1. **`frontend/src/components/LeitorQr.tsx` (RF31)**: leitor de QR Code por câmera (`html5-qrcode`) com parada segura de stream no `unmount` e fallback imediato de digitação manual do código.
2. **`/interprete` (`pages/interprete/HubInterprete.tsx` — RF20, RF24, RF26, RNF36, `code (1).html`)**: chave Online/Offline (`PUT /interprete/configuracao`), banner de status de habilitação, `<Mapa />` com círculo de raio e pinos das demandas próximas, cartões de demandas com Aceitar/Recusar, resumo de ganhos da semana e próximo atendimento.
3. **`/interprete/demandas` (`pages/interprete/DemandasInterprete.tsx` — RF20–RF23, `code (5).html`)**: abas "Novas no Raio" e "Agendadas / Em Aberto", destaque de urgência, distância em km, aceite exclusivo (`POST /demandas/:id/aceitar`), recusa (`POST /demandas/:id/recusar`) e mapa regional.
4. **`/interprete/demandas/:id` (`pages/interprete/DetalheDemanda.tsx` — RF21–RF23)**: contexto completo da solicitação, `<Mapa somenteLeitura />`, discriminação do repasse líquido estimado (90%) e botões de Aceitar ou Recusar.
5. **`/interprete/agenda` (`pages/interprete/AgendaInterprete.tsx` — RF24, RF25, RNF27)**: controle de raio de atuação (1–15 km) no `<Mapa />` (`PUT /interprete/configuracao`) e editor semanal de janelas de disponibilidade (`GET/PUT /interprete/disponibilidades`) com preset de 1 clique (Seg–Sex 08h–18h).
6. **`/interprete/atendimentos/:id` (`pages/interprete/DetalheAtendimentoInterprete.tsx` — RF31–RF33, RNF26)**: captura de GPS + simulador indoor de 1 clique para demonstração + `<LeitorQr />` (`POST /atendimentos/:id/checkin`), encerramento (`POST /atendimentos/:id/encerrar`), acesso à sala, avaliação e comprovante PDF.
7. **`/interprete/ganhos` (`pages/interprete/GanhosInterprete.tsx` — RF26, RF27)**: ganhos da semana, saldo disponível, valores a receber, cadastro de contas bancárias/Pix (`GET/POST /interprete/contas-bancarias`), solicitação de repasse (`GET/POST /interprete/repasses`) e extrato financeiro.
8. **`/interprete/perfil` (`pages/interprete/PerfilInterprete.tsx` — RF43, RF04, RF05, RF45, `code (11).html`)**: upload de foto de perfil (`fotoUrl` Data URL ≤ 350 KB, concluindo o RF04), edição de dados profissionais e localização-base no `<Mapa />`, consulta e reenvio de certificações Prolibras (`GET/POST /interprete/certificacoes`), alteração de senha e direitos LGPD.

### Bloco F4 — Backoffice e Verificação Pública (`frontend/src/`)
1. **`/verificar/:codigo` (`pages/comum/VerificarComprovante.tsx` — RF38)**: consulta pública sem login (`GET /comprovantes/:codigo/verificar`) com selo de autenticidade, dados auditados do atendimento e busca por qualquer código.
2. **`/backoffice` (`pages/backoffice/FilaCertificacoes.tsx` — RF06)**: painel de indicadores operacionais (`GET /backoffice/indicadores`) e fila filtrável de certificações (`GET /backoffice/certificacoes?status=`), abertura de documento via Blob e atalho para parecer.
3. **`/backoffice/certificacoes/:id` (`pages/backoffice/ParecerCertificacao.tsx` — RF06)**: dossiê do intérprete, visualização do certificado (`GET /backoffice/certificacoes/:id/arquivo`), histórico de análises e emissão de parecer (`APROVADO`, `CORRECAO`, `REPROVADO` via `POST /backoffice/certificacoes/:id/parecer`).
4. **`/backoffice/chamados` (`pages/backoffice/ChamadosSuporte.tsx` — RF34)**: gestão de alertas de `EMERGENCIA` (com `<Mapa somenteLeitura />` das coordenadas reportadas) e chamados de `SUPORTE`, com transição para `EM_ATENDIMENTO` e `ENCERRADO` (`POST /backoffice/chamados/:id/status`).
5. **`/backoffice/auditoria` (`pages/backoffice/TrilhaAuditoria.tsx` — RF44)**: consulta filtrável (`tipo`, `de`, `ate`) da trilha imutável de auditoria (`GET /backoffice/auditoria`).
6. **`frontend/src/rotas.tsx`**: **23/23 rotas do `SITEMAP` conectadas a componentes reais (0 rotas com `<EmConstrucao />`)**.
7. **Entregáveis de Qualidade, Arquitetura, CI/CD e Operação (Bloco F4 / P1 / D / Z)**:
   - `frontend/tests/validacao-formato.test.ts` (6 suítes de testes unitários de máscaras e validações passando com `npm test`).
   - `.github/workflows/ci.yml` (pipeline GitHub Actions com PostgreSQL 16 service container para Backend + Frontend).
   - `docs/api/openapi.yaml` (especificação OpenAPI 3.1 cobrindo todas as rotas de `backend/src/routes/index.ts`).
   - `docs/TESTES.md`, `docs/SEGURANCA.md`, `docs/DEPLOY.md`, `docs/SLA.md`, `docs/ROTEIRO_DEMONSTRACAO.md`, `docs/MANUAL.md`.
   - `docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md` (diagramas Mermaid gerados do código real: Sitemap #3, Arquitetura Funcional/Técnica/MVC #7–#9, Macroprocesso #16, Fluxograma #17, DER de 27 tabelas #22 e Sequência/Operação #24).
   - **Revisão multiagente dos Blocos F2, F3 e F4 (`revisor_ux_ui`, `revisor_qa_security`, `revisor_po`)**: 20/20 novas rotas aprovadas e 5 ajustes imediatos aplicados (`B-010` a `B-014` em `docs/BUGS.md`).

## 3. Contribuições por papel/agente (AGENTS.md §3 — declaração honesta)

- **Bloco 0 (11–12/11):** executado por **um único agente (Claude)**, sob direção do Gustavo, acumulando os papéis de Back-end, Dados, Front-end, QA e Security de forma sequencial, sem subagentes independentes.
- **Continuação de 15/11 (correções RF17–RF27/RF36, Blocos P1 e P2):** executada por **um único agente (Claude)**, sob direção do Gustavo, acumulando em sequência Back-end, Dados, QA, Documentação e DevOps, sem subagentes independentes. Detalhes e verificações no início deste documento.
- **Bloco F1 (12/11):** executado sob coordenação do agente principal (atuando como **Scrum Master / Front-end / Back-end**) com **revisão independente por 3 subagentes especializados** instanciados via `define_subagent` / `invoke_subagent` conforme `Contexto/Auxílio Vibecoding/PROMPT AGENTES.docx` e `docs/EQUIPE_AGENTES.md`:
  1. **`revisor_ux_ui` (UX/UI & Accessibility Reviewer):** conferiu todas as telas do Bloco F1 contra `DESIGN.md`, `code (7).html`, `code (17).html` e WCAG 2.2 AA (RNF11–RNF16, RNF19, RNF45). Parecer: **APROVADO** com 5 recomendações de refinamento (`min-h-touch` no slider e links secundários; `text-base` 16 px nos textos descritivos de notificações e suporte), todas aplicadas (`B-006`).
  2. **`revisor_qa_security` (QA & Security Reviewer):** auditou contratos Frontend ⇄ Zod, máscaras, estados de erro e segurança OWASP ASVS. Identificou 4 pontos de atenção imediatos (`B-002`: *rollover* de datas inválidas como `2000-02-31` gerando 500 no banco; `B-003`: ausência de `.max(72)` nas senhas de redefinição/alteração; `B-004`: chaves aninhadas `certificacao.arquivo.*` no erro de upload e `.max(7_000_000)` no Base64; `B-005`: ícone `SOLICITACAO` e `try/catch` em `JSON.parse`), todos corrigidos e cobertos por teste automatizado em `backend/tests/excecoes.test.ts`. Também listou melhorias adicionais de defesa em profundidade para o Bloco F4 (validação de *magic bytes* do certificado, revogação de demais sessões em `alterarSenha` e download de PDF via Blob para evitar token na query string).
  3. **`revisor_po` (Product Owner Reviewer):** auditou as 7 rotas contra `Briefing_Projeto_Viamos.md` (RF02–RF07, RF34, RF42, RF45; US01, US02, US04, US24) e `docs/PLANO_BLOCOS.md`. Parecer: **6 rotas ACEITAS e 1 ACEITA COM RESSALVA** (`/cadastro/interprete`: o campo de foto de perfil do RF04 fica alocado na tela `/interprete/perfil` do Bloco F3, conforme planejado em `PLANO_BLOCOS.md`).

## 4. Divergências entre entregas anteriores e o aplicativo (AGENTS.md §1)

| Entrega anterior | Estado atual do app | Justificativa |
|---|---|---|
| Classe `Local` separada (DC3) | Campos `endereco/complemento/pontoReferencia/latitude/longitude` em `solicitacoes` | 1:1 obrigatório; evita join em toda listagem. Explicar no DER (#22) |
| Classe `Credencial` (DC11) | Campos `tentativasFalhas`, `bloqueadoAte`, `doisFatoresAtivo` em `usuarios` | 1:1 obrigatório; `doisFatoresAtivo` reservado (2FA não implementado) |
| Classe `Operador` (DC1) | Papel `BACKOFFICE`/`SUPORTE` em `usuarios.papel` | Operador não tem atributos próprios no MVP |
| Classe `Carteira` (DC8) | Saldo calculado pela soma de `lancamentos_financeiros` | Evita inconsistência entre saldo armazenado e lançamentos |
| `CheckIn/QRCode` (DC5) com `gerarQR()`/`validar()` | Tabela `checkins` (1:1 com atendimento) + regras em `atendimento.service.ts` | Mesmo conceito; métodos viraram serviços |
| Entidade `Oferta` sem distância | `ofertas.distancia_km` | Necessária para ordenar por proximidade (RF17) |
| Máquina de estados da solicitação (11/11) | Estados `BUSCANDO → ACEITA → EM_ANDAMENTO → CONCLUIDA` e `CANCELADA`; atendimento `AGENDADO → EM_ANDAMENTO → CONCLUIDO/CANCELADO` | O documento (#23, seção 5.4) mostra a figura de 11/11 e as máquinas geradas dos enums do código, com a tabela de transições |
| DFD P5 (11/11) libera o comprovante no encerramento | Comprovante emitido após a confirmação do pagamento (D-10) | Descrito no documento (seção 5.6); pendência P-06 do grupo |
| Hub do intérprete (mockup) cita check-in 15 min antes | Parâmetro `CHECKIN_ANTECEDENCIA_MIN = 30` | Decisão D-05 — pendente de validação do grupo |

## 5. Pendências, riscos e próximos passos

| Tipo | Item | Responsável | Bloco |
|---|---|---|---|
| Resolvido | Push na `main` destravado e Blocos F1, F2, F3 e F4 (todas as 23 rotas do SITEMAP + hardening OWASP) publicados na `main` | Lúcio / Equipe de Agentes | F1–F4 (concluído) |
| Pendência | Validar D-01 (preços de referência), D-05 (janela de 30 min), D-20 (elegibilidade, P-05) e o momento do comprovante (P-06) | grupo | P3 |
| Pendência | Link do Figma (#5): preencher `FIGMA_URL` em `docs/producao-tecnica/build/gerar_docx.py` e regerar o documento | grupo | P3 |
| Pendência | Contas Render/Vercel/Neon | Lúcio | D |
| Risco | Render free "dorme" (cold start ~50 s) — abrir `/api/health` antes da demonstração | QA/DevOps | Z |
| Mitigado | Geolocalização em demonstração indoor: tela `/interprete/atendimentos/:id` inclui botão de 1 clique para preencher as coordenadas exatas do atendimento na demonstração | Front-end / QA | F3 (concluído) |
| Risco | Google Fonts/Material Symbols dependem de internet na apresentação; alternativa: empacotar a fonte localmente | Front-end | D/Z |
| Débito | Documentação OpenAPI (`docs/api/openapi.yaml`), plano de testes escrito (`docs/TESTES.md`), `docs/SEGURANCA.md`, manuais e SLA | QA/Security/DevOps | P1, D, Z |
| Resolvido | **Blocos P1 e P2**: diagramas gerados do código e documento Produção Técnica (`.docx` e `.pdf`) com pipeline reproduzível | Gustavo + Claude | P1/P2 (concluídos em 15/11) |
| Próximo passo | **P3** leitura completa do documento pelo grupo, link do Figma e PDF final; **D** deploy em Render + Vercel + Neon; **Z** ensaio com dispositivo físico e auditoria #49, conforme `docs/PLANO_BLOCOS.md` | ambos | 16–20/11 |

## 6. Instruções reproduzíveis

Ver `README.md` (seções 2–6). Resumo: `docker compose up -d` → `cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm test && npm run dev` → `cd frontend && npm install && cp .env.example .env && npm run dev`.
