# Víamos — Relatório de contexto atual para o Lúcio e o ChatGPT

> Gerado em 12/11/2026 (18h) por Gustavo + Claude. Este é o documento de passagem de bastão previsto no nosso
> protocolo de revezamento. Ele descreve **o que já existe**, **o que falta**, **o passo a passo até a entrega
> (21/11)** e **o que o Lúcio precisa fazer agora** para o trabalho poder entrar no GitHub.
>
> **ChatGPT: sinta-se livre para debater.** Nada aqui é definitivo. Se você julgar que alguma decisão técnica,
> regra de negócio, divisão de blocos ou prioridade deveria mudar, diga — com o motivo e a alternativa — na
> seção "Resposta" ao final (modelo em §9). O objetivo é entregar o melhor trabalho dentro do escopo do professor,
> não defender escolhas anteriores.

---

## 1. AÇÃO IMEDIATA DO LÚCIO — destravar o commit no GitHub

Hoje existe uma branch pronta, `feat/plataforma-base`, com 3 commits (backend completo, base do frontend e
documentação de trabalho). Ela **ainda não está no GitHub** e sem isso não conseguimos trabalhar em conjunto.

O Gustavo já é colaborador do repositório, mas o push feito pelo ambiente do Claude passa pelo **app "Claude" do
GitHub**, que precisa estar instalado no repositório — e só o dono (você) pode instalar. Tentamos publicar pelo
GitHub Desktop do Gustavo e a pasta do clone acabou mesclada com o OneDrive; voltamos ao estado limpo (clone
original da `main`). O caminho confiável é o app:

1. Acesse **https://github.com/apps/claude/installations/select_target**
2. Escolha a sua conta (`lucio734`).
3. Em *Repository access*, marque **Only select repositories → viamos** e clique em **Install** (ou *Save*).
4. Avise o Gustavo. Em seguida o Claude faz o push da branch `feat/plataforma-base` (os 3 commits chegam intactos).
5. No seu GitHub Desktop: **Fetch origin** → *Current Branch* → `feat/plataforma-base`. Pronto para continuar.

Leva cerca de um minuto. Depois disso, cada bloco de trabalho vira commits na branch e, ao final, um pull request
para a `main` (como pede o item #43 do checklist do professor).

Enquanto o push não acontece, o Gustavo pode te mandar o zip `viamos-feat-plataforma-base.zip` (23 MB, repositório
completo com histórico git e sem `node_modules`) para você olhar o código antes.

---

## 2. O que o projeto é (resumo)

Víamos: plataforma web mobile-first que conecta pessoas surdas a intérpretes de Libras certificados para
**atendimentos presenciais**. Fluxo principal: cliente solicita (tipo, data/hora, duração ≥ 60 min, local) →
estimativa → distribuição para intérpretes aprovados em até 15 km → aceite exclusivo → sala de atendimento
(chat, foto, localização temporária) → check-in por QR Code com GPS (≤ 200 m, precisão ≤ 50 m) → encerramento
com duração real → pagamento → Comprovante de Acessibilidade Garantida (PDF verificável por código) → avaliação
bilateral. Backoffice aprova a documentação (Prolibras ou equivalente) dos intérpretes.

Fontes de verdade (todas no repositório, pasta `Contexto/` e `Entregas/`, **que não devem ser alteradas**):
- `Contexto/ARQUIVOS .MD/Briefing_Projeto_Viamos.md` — 45 RF, 45 RNF, 24 histórias de usuário, entidades, estados, regras.
- `Contexto/ARQUIVOS .MD/prd_projeto_v_amos.md` e `context.md_projeto_v_amos.md` — PRD e contexto.
- `Contexto/Arquivos Stitch/` — 12 telas prototipadas (HTML + PNG) e `DESIGN.md` (design system).
- `Contexto/DOCUMENTAÇÃO REPOSITÓRIO/DOC.txt` — os 28 itens do capítulo "Produção Técnica".
- `Contexto/Auxílio Vibecoding/` — `Dossie_Checklist_Vibe_Coding.html` (50 critérios do professor),
  `PROMPT AGENTES.docx`, `labProt.html`, `Software Development Checklist 2026…html`, `auditoria_vibe_coding_2026-11-11.txt`.
- `CLAUDE/AGENTS.md` e `CLAUDE/CLAUDE.md` — **regras obrigatórias para qualquer IA** (leia antes de começar).
- `Entregas/` — entregas de 02/09 (requisitos), 07/10 (casos de uso e classes) e 11/11 (contexto, BPMN, DFD, estados) + `modelo_entrega.docx`.

Prazo final: **21/11/2026**.

---

## 3. O que já foi feito (Bloco 0, 11–12/11) — concluído e verificado

### 3.1 Backend — `backend/` — completo, 49 testes passando
Stack: Node 22 + Express 5 + TypeScript + Zod + JWT; PostgreSQL 16 com **Drizzle ORM** (migrações SQL versionadas + seed).

- **Arquitetura MVC explícita**: `src/models` (schema + conexão), `src/controllers` (HTTP ⇄ services, esquemas Zod),
  `src/views` (presenters JSON e PDF do comprovante), `src/routes/index.ts` (mapa da API com o RF de cada rota),
  `src/services` (regras de negócio), `src/middlewares` (JWT com sessão revogável, validação, erros sem stack trace).
- **Banco**: 27 tabelas alinhadas aos diagramas de classe DC1–DC11 de 07/10 (Usuario, Cliente, Interprete,
  Certificacao, AnaliseDocumental, Disponibilidade, Solicitacao, Cotacao, Oferta, Atendimento, CheckIn, Mensagem,
  LocalizacaoCompartilhada, ChamadoSuporte, FormaPagamento, Pagamento, ContaBancaria, Repasse, LancamentoFinanceiro,
  Avaliacao, Comprovante, Consentimento, SolicitacaoDados, Notificacao, Sessao, TokenRecuperacao, EventoAuditoria).
  FKs, CHECKs (duração ≥ 60, raio 1–15, nota 1–5), índices únicos (um atendimento por solicitação; um pagamento PAGO
  por atendimento; uma avaliação por autor), gatilho que torna a auditoria imutável. O arquivo
  `backend/src/models/schema.ts` é a **fonte do DER** (item #22/#38).
- **Todos os 45 RF têm endpoint.** Destaques: bloqueio após 5 tentativas de login (RNF35); estimativa antes da
  confirmação (RF15); distribuição por Haversine dentro do raio (RF17); aceite exclusivo atômico com
  `UPDATE … WHERE status='BUSCANDO'` + índice único (RF22 — o segundo intérprete recebe 409); conflito de agenda;
  check-in que valida QR, janela de 30 min, precisão ≤ 50 m e distância ≤ 200 m (RF31/RF32); encerramento único
  com duração real e valor final (RF33); pagamento via gateway **simulado** e idempotente (RF36); comprovante PDF
  + verificação pública por código (RF37/RF38); avaliação bilateral com reputação (RF40/RF41); ganhos semanais e
  repasse (RF26/RF27); backoffice com parecer e reenvio de certificação (RF06/RF05); LGPD: consentimentos,
  exportação e exclusão/anonimização (RF45); notificações internas (RF42); trilha de auditoria (RF44).
- **Seed** (`backend/src/db/seed.ts`): 6 contas, senha `Viamos@2026` — `joao@viamos.app` e `ana@viamos.app`
  (clientes), `maria@viamos.app` e `carlos@viamos.app` (intérpretes aprovados, online), `pedro@viamos.app`
  (em análise), `operador@viamos.app` (backoffice) — e um cenário com solicitação em busca, atendimento aceito com
  QR, atendimento concluído e pago (com comprovante e avaliação), pagamento pendente e solicitação cancelada.
- **Testes** (`backend/tests/`, Vitest + Supertest, banco de teste isolado): fluxo principal ponta a ponta,
  20+ exceções (data passada, duração inválida, intérprete não aprovado, fora do raio, agenda conflitante, aceites
  concorrentes, QR de outro atendimento, GPS impreciso/distante, mensagem de não participante, encerramento
  repetido, pagamento repetido e recusado, comprovante alheio, bloqueio de login, auditoria imutável) e unidades
  (Haversine, CPF/CNPJ, estimativa, cobrança). Resultado: **49/49**.
- Integrações simuladas, como permite o briefing: gateway de pagamento (`gateway.service.ts`; cartão final `0000`
  recusa) e e-mail (`console`). Deploy preparado: `render.yaml` (API) e build/migração a partir de `dist/`.

### 3.2 Frontend — `frontend/` — base pronta; telas em construção
Stack: React 19 + Vite + TypeScript + **Tailwind v4** com os tokens do `DESIGN.md` + React Router + Leaflet/OSM + QR.

- `src/rotas.tsx` = **sitemap completo** (todas as rotas por perfil, com guardas de papel). Rotas sem tela mostram
  `EmConstrucao` listando os endpoints prontos e o protótipo Stitch de referência (nome real do arquivo).
- Prontos: cliente HTTP com erros por campo (`src/api/cliente.ts`), sessão (`src/auth/AuthContext.tsx`),
  componentes do design system com os 4 estados — carregando/erro/vazio/sucesso (`src/components/ui.tsx`),
  AppShell com navegação inferior persistente (mobile) e sidebar (desktop) + sino de notificações, máscaras
  CPF/CNPJ/telefone/CEP/cartão e formatadores pt-BR (`src/utils/formato.ts`), telas **Splash, Login e Hub do cliente**
  consumindo a API real. `vercel.json` e `public/_redirects` com o rewrite para rotas SPA.

### 3.3 Documentação de trabalho (pasta `docs/` e raiz)
- `README.md` — clonagem, instalação, execução, testes, build e deploy (item #44).
- `docs/PLANO_BLOCOS.md` — plano até 21/11 em blocos (§5 deste relatório).
- `docs/DECISOES.md` — 18 decisões de regra de negócio (§4).
- `docs/EQUIPE_AGENTES.md` — a equipe do "PROMPT AGENTES" (PO, Scrum Master, Front, UX/UI, Back, Dados, CI/CD,
  DevOps/SRE, QA, Security, Business Analytics + Decisor), prompts por papel e protocolo de uso.
- `docs/VERIFICACOES.md` — verificação contra `labProt`, `Checklist 2026` e `Dossiê` (o que foi conferido,
  resultado, evidência, pendência), incluindo o estado dos 50 itens.
- `docs/REGISTRO_TRABALHO.md` — estado real (feito/verificado × pendente), contribuições por papel, divergências
  entre as entregas anteriores e o app, riscos. `docs/BUGS.md` — log de bugs.
- `.gitignore` (testado), `.editorconfig`, `docker-compose.yml` (Postgres local), `render.yaml`.

### 3.4 Declaração exigida pelo AGENTS.md (§3)
O Bloco 0 foi executado por **um único agente (Claude)**, acumulando os papéis de Back-end, Dados, Front-end, QA e
Security de forma sequencial. **Não houve revisão independente por múltiplos agentes**; a verificação se apoiou nos
49 testes automatizados e na checagem contra os documentos obrigatórios. As revisões por papel estão previstas
para o Bloco F4.

---

## 4. Decisões tomadas (resumo de `docs/DECISOES.md`) — abertas a debate

| ID | Decisão | Debater? |
|---|---|---|
| D-01 | Estimativa v1: preço/hora de referência por tipo (Saúde 95, Jurídico 110, Educação 80, Evento 100, Outro 85) × horas + deslocamento fixo R$ 15 + taxa 10% | **Sim — valores precisam de validação do grupo** |
| D-02 | Cancelamento: sem custo até 24 h antes; 20% se < 24 h e já aceita; proibido após check-in | Sim |
| D-03 | Valor final = maior entre duração contratada e real (arredondada em blocos de 30 min) | Sim |
| D-04 | Duração: 60 min a 12 h, em blocos de 30 min | Sim |
| D-05 | Janela de check-in: **30 min** antes (o mockup citava 15) | **Sim — escolher 15 ou 30** |
| D-06 | Aceite exclusivo por UPDATE condicional + índice único; conflito de agenda verificado | Pouco provável |
| D-07 | Cliente ou intérprete podem encerrar; encerramento único | Sim |
| D-08 | Gateway simulado com interface de gateway real; idempotência; casos de teste (cartão 0000, valor 13,13) | Pouco provável |
| D-09 | Crédito ao intérprete = valor pago − taxa; repasse manual do saldo total; semana começa na segunda | Sim |
| D-10 | Comprovante emitido ao confirmar pagamento; PDF só para participantes; verificação pública minimalista | Pouco provável |
| D-11 | Localização: de 2 h antes até o encerramento; sala fecha 24 h após o fim | Sim |
| D-12 | Certificado em PDF/JPG/PNG ≤ 5 MB, armazenado no banco (bytea) | Sim (alternativa: storage externo) |
| D-13 | JWT 8 h + tabela de sessões (logout revoga); bloqueio 15 min após 5 tentativas | Pouco provável |
| D-14 | Notificações internas com polling de 30 s (push externo é evolução) | Sim |
| D-15 | Chat por polling incremental (WebSocket é evolução) | Sim |
| D-16 | Exclusão de conta = anonimização + inativação; retenção legal de registros | Sim |
| D-17 | **Drizzle ORM** em vez de Prisma (100% JS, migrações SQL legíveis; Prisma precisa baixar binários bloqueados no ambiente do Claude) | Sim — se o grupo preferir Prisma, é possível migrar, mas custa um bloco |
| D-18 | Stack e hospedagem: React+Vite+Tailwind v4 · Express+TS · PostgreSQL · Vercel + Render + Neon/Render Postgres | Sim |

Divergências já identificadas entre as entregas anteriores e o app (documentadas em `docs/REGISTRO_TRABALHO.md` §4):
classe `Local` absorvida em `solicitacoes`; `Credencial` absorvida em `usuarios`; `Operador` virou papel do usuário;
`Carteira` é calculada a partir dos lançamentos; `Oferta` ganhou `distancia_km`. O DER (#22) será gerado do schema
e o documento explicará essas diferenças.

---

## 5. O que falta — plano em blocos até 21/11

Regra: **uma conversa com a IA = um bloco**, com commits de checkpoint; ao fechar, atualizar os registros em `docs/`
e sobrescrever o arquivo de passagem de bastão (`contexto_atual_claude.md` quando o próximo é o Gustavo;
`contexto_atual_chatgpt.md` quando é o Lúcio). Detalhes de cada tela em `docs/PLANO_BLOCOS.md`.

| Período | Lúcio + ChatGPT | Gustavo + Claude |
|---|---|---|
| 12–13/11 | **F1** — Recuperar/redefinir senha, seleção de perfil, cadastro do cliente, cadastro do intérprete (mapa para o endereço-base + upload do certificado), notificações, suporte | **F2** — Jornada do cliente: nova solicitação (3 passos + estimativa), acompanhamento + QR, sala/chat, pagamento, avaliação, histórico, perfil |
| 14–15/11 | **F3** — Jornada do intérprete: hub, demandas (lista/mapa, aceitar/recusar), agenda (raio + disponibilidade), detalhe do atendimento com leitor de QR + check-in + encerramento, ganhos/repasse, histórico, perfil/habilitação | **P1** — Diagramas gerados do código: sitemap, DER, arquitetura funcional/técnica/MVC + hospedagem, macroprocesso, fluxograma, diagrama de operação (sequências), processos de telas |
| 16–17/11 | **D** — Deploy: Render (API) + Vercel (frontend) + Neon/Render Postgres, HTTPS, rotas SPA testadas, seed em produção, `docs/DEPLOY.md`, `docs/SLA.md` | **F4** — Backoffice, verificação pública do comprovante, acessibilidade/responsividade, fontes locais, testes de frontend, revisões por papel (QA/Security/UX/PO), OpenAPI, CI, `docs/TESTES.md`, `docs/SEGURANCA.md` |
| 18–19/11 | **P2** — Textos introdutórios (#1, #2, #6, #10, #15, #19), tabelas de requisitos (do xlsx), tabela por caso de uso (#20), descrição dos wireframes tela a tela (#4) | **P2** — Montagem do capítulo no formato do `modelo_entrega.docx` (gerador de .docx), figuras existentes + novas |
| 20/11 | **Z** — Ensaio da demonstração + auditoria dos 50 itens com evidências; `docs/MANUAL.md` | **P3** — Revisão final do documento + PDF; apoio ao ensaio |
| 21/11 | Entrega | Entrega |

Convenções para os blocos de frontend (F1–F4):
- Cada tela substitui o `tela({...})` da rota em `frontend/src/rotas.tsx` pelo componente real, em `src/pages/<perfil>/`.
- Componentes novos compartilhados vão em arquivos novos em `src/components/` (`Mapa.tsx`, `LeitorQr.tsx`, `Sala.tsx`…); `ui.tsx` só recebe acréscimos pequenos — evita conflito entre F1 (Lúcio) e F2 (Gustavo), que rodam em paralelo.
- Toda tela com os 4 estados (carregando / erro com "tentar novamente" / vazio / sucesso) e erros por campo vindos de `ErroApi.porCampo`.
- Fidelidade ao protótipo Stitch indicado na própria rota e ao `DESIGN.md`.
- Antes de commitar: `cd frontend && npm run build`; se tocou no backend, `cd backend && npm test`.

Pendências que dependem de pessoas: validar D-01 e D-05; link do Figma (#5 — importar as telas do Stitch);
contas Render/Vercel/Neon (podem ser na conta do Lúcio); instalar o app do GitHub (§1).

---

## 6. Bloco F1 — o próximo bloco do Lúcio, passo a passo

Pré-requisito: branch `feat/plataforma-base` no GitHub (§1). Depois:

```bash
git clone https://github.com/lucio734/viamos.git && cd viamos
git checkout feat/plataforma-base
docker compose up -d            # Postgres local (ou cole uma URL do Neon em backend/.env)
cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm run dev
# em outro terminal
cd frontend && npm install && cp .env.example .env && npm run dev   # http://localhost:5173
```
Login de teste: `joao@viamos.app` / `Viamos@2026`.

Telas do F1 (ordem sugerida; commit a cada duas):
1. `/recuperar-senha` → `POST /api/auth/recuperar-senha` (fora de produção a resposta traz `tokenDev` para testar) e
   `/redefinir-senha/:token` → `POST /api/auth/redefinir-senha` (RF07).
2. `/cadastro` — seleção de perfil (dois cartões: usuário surdo / intérprete) (RF02).
3. `/cadastro/cliente` → `POST /api/cadastro/cliente` (campos e validações em
   `backend/src/controllers/cadastro.controller.ts`, `esquemaCadastroCliente`); protótipo `Contexto/Arquivos Stitch/code (7).html` (RF03).
4. `/cadastro/interprete` → `POST /api/cadastro/interprete` (`esquemaCadastroInterprete`): exige `latitudeBase/longitudeBase`
   (criar `src/components/Mapa.tsx` com react-leaflet, já instalado, para o usuário marcar o ponto) e o certificado em
   base64 `{ nome, mime, conteudoBase64 }` (PDF/JPG/PNG ≤ 5 MB); protótipo `code (17).html` (RF04/RF05).
5. `/notificacoes` → `GET /api/notificacoes`, `POST /api/notificacoes/:id/lida`, `POST /api/notificacoes/ler-todas` (RF42).
6. `/suporte` → `POST /api/suporte` `{ tipo: 'SUPORTE'|'EMERGENCIA', descricao?, latitude?, longitude? }` (RF34).

Equipe de agentes no ChatGPT (sem subagentes paralelos): acionar os papéis **em sequência** no mesmo chat —
Front-end implementa → UX/UI confere o protótipo → QA testa (inclusive os erros da API) → PO confere o RF — e
registrar os pareceres em `docs/REGISTRO_TRABALHO.md`; bugs em `docs/BUGS.md`. Modelo de prompt por papel em
`docs/EQUIPE_AGENTES.md` §3.

Ao terminar: sobrescrever `contexto_atual_claude.md` (o que foi feito, pendências, problemas, decisões novas,
próximo bloco do Gustavo) e commitar junto.

---

## 7. Mapa resumido da API (`backend/src/routes/index.ts`)

```
Público     GET /api/health · GET /api/comprovantes/:codigo/verificar
Auth        POST /auth/login · POST /auth/logout · GET /auth/me · POST /auth/recuperar-senha · POST /auth/redefinir-senha · POST /auth/alterar-senha
Cadastro    POST /cadastro/cliente · POST /cadastro/interprete
Perfil      GET/PUT /perfil · GET/PUT /perfil/consentimentos · GET /perfil/dados/exportar · POST /perfil/dados/excluir
Notif.      GET /notificacoes · POST /notificacoes/:id/lida · POST /notificacoes/ler-todas
Cliente     GET /cliente/hub · POST /solicitacoes/estimativa · POST /solicitacoes · GET /solicitacoes · GET /solicitacoes/:id · POST /solicitacoes/:id/cancelar
            GET/POST /formas-pagamento · DELETE /formas-pagamento/:id · GET /pagamentos/pendentes · GET /pagamentos/:id · POST /pagamentos/:id/processar
Intérprete  GET /interprete/hub · GET /demandas · POST /demandas/:id/aceitar · POST /demandas/:id/recusar · PUT /interprete/configuracao
            GET/PUT /interprete/disponibilidades · GET/POST /interprete/certificacoes · GET /interprete/ganhos · GET/POST /interprete/contas-bancarias · GET/POST /interprete/repasses
Atendimento GET /atendimentos (histórico c/ filtros) · GET /atendimentos/:id · GET/POST /atendimentos/:id/mensagens · GET/POST /atendimentos/:id/localizacoes
            GET /atendimentos/:id/qrcode (cliente) · POST /atendimentos/:id/checkin (intérprete) · POST /atendimentos/:id/encerrar · POST /atendimentos/:id/suporte · POST /suporte
            GET /atendimentos/:id/comprovante.pdf · POST /atendimentos/:id/avaliacoes
Backoffice  GET /backoffice/indicadores · GET /backoffice/certificacoes · GET /backoffice/certificacoes/:id/arquivo · POST /backoffice/certificacoes/:id/parecer
            GET /backoffice/chamados · POST /backoffice/chamados/:id/status · GET /backoffice/auditoria
Códigos     200/201/202/204 · 400 validação · 401 · 402 pagamento recusado · 403 · 404 · 409 conflito · 422 regra de negócio · 423 bloqueado · 429
```

---

## 8. Riscos conhecidos

- Render free "dorme" (cold start ~50 s): abrir `/api/health` antes da demonstração.
- Geolocalização indoor na apresentação: usar DevTools → Sensors para simular coordenadas.
- Google Fonts/Material Symbols precisam de internet; o Bloco F4 empacota as fontes localmente.
- Pasta do clone dentro do OneDrive pode conflitar com `.git`; preferir uma pasta fora do OneDrive (ex.: `C:\dev\viamos`).

---

## 9. Resposta (Lúcio + Agente IA — conclusão do Bloco F1 em 12/11/2026)

> Relatório completo de passagem de bastão para o Gustavo + Claude disponível também em [`contexto_atual_claude.md`](contexto_atual_claude.md).

### 9.1. Concordâncias e observações sobre D-01…D-18, divisão de blocos e prioridades
- **D-01 a D-18:** **Concordância integral** com todas as decisões técnicas e de regra de negócio adotadas no Bloco 0. A escolha do **Drizzle ORM** (D-17) com migrações SQL explícitas (`0000_esquema_inicial.sql`, `0001_auditoria_imutavel.sql`), a separação MVC estrita e os parâmetros centralizados em `backend/src/config/regras.ts` mantêm o projeto 100% aderente aos itens #34–#41 do Dossiê de 50 critérios.
- **Divisão de blocos:** Mantida conforme `docs/PLANO_BLOCOS.md`. O componente compartilhado `frontend/src/components/Mapa.tsx` (`react-leaflet` + Nominatim opcional) já foi entregue neste Bloco F1 com interface limpa (`posicao`, `aoSelecionar`, `raioKm`, `marcadores`, `somenteLeitura`) para ser reutilizado diretamente no **Bloco F2** (passo 2 da nova solicitação) e no **Bloco F3** (mapa de demandas).
- **Branch de trabalho:** Os commits do Bloco 0 já estavam integrados na `main` (`cfccb92`), e o trabalho do Bloco F1 foi desenvolvido e publicado diretamente na `main` conforme instrução do Lúcio.

### 9.2. Perguntas que permanecem para validação do grupo
1. **D-01 (Preços de referência por tipo):** confirmar se mantemos Saúde R$ 95/h, Jurídico R$ 110/h, Educação R$ 80/h, Evento R$ 100/h, Outro R$ 85/h + deslocamento R$ 15 + taxa de 10%.
2. **D-05 (Janela de check-in):** confirmar se mantemos **30 min** de antecedência (`REGRAS.CHECKIN_ANTECEDENCIA_MIN = 30`) ou se reduzimos para 15 min como citado no texto ilustrativo do mockup do hub do intérprete.
3. **P-01 (Link do Figma — item #5 do Dossiê):** importar as 12 telas do Stitch no Figma e disponibilizar o link para o Bloco P2.

### 9.3. O que foi feito e verificado no Bloco F1
- **Ambiente e banco de testes:** reproduzidos os testes de backend neste ambiente com **PostgreSQL 18.6** real (`embedded-postgres`), ampliando a suíte de 49 para **50/50 testes passando**.
- **Regras de agentes:** preservados `CLAUDE/AGENTS.md` e `CLAUDE/CLAUDE.md` e espelhados na raiz (`AGENTS.md` e `CLAUDE.md`).
- **Utilitários e componentes novos:** `frontend/src/utils/validacao.ts`, `frontend/src/components/TelaPublica.tsx` e `frontend/src/components/Mapa.tsx`.
- **7 rotas do Bloco F1 implementadas e conectadas em `frontend/src/rotas.tsx`:**
  1. `/recuperar-senha` (`pages/auth/RecuperarSenha.tsx` — RF07, RNF06, com atalho `tokenDev` fora de produção).
  2. `/redefinir-senha/:token` (`pages/auth/RedefinirSenha.tsx` — RF07).
  3. `/cadastro` (`pages/auth/SelecaoPerfil.tsx` — RF02).
  4. `/cadastro/cliente` (`pages/auth/CadastroCliente.tsx` — RF03, RF45, RNF09; protótipo `code (7).html` + telefone e consentimento LGPD).
  5. `/cadastro/interprete` (`pages/auth/CadastroInterprete.tsx` — RF04, RF05, RF45, RNF09, RNF36; protótipo `code (17).html` + mapa Leaflet, raio ≤ 15 km, número e upload *drag-and-drop* do certificado em Base64 ≤ 5 MB e aviso de análise pelo backoffice).
  6. `/notificacoes` (`pages/comum/Notificacoes.tsx` — RF42, com os 4 estados visuais, filtro e navegação para `referenciaRecurso`).
  7. `/suporte` (`pages/comum/Suporte.tsx` — RF34, RNF44, suporte operacional e emergência com geolocalização explícita opcional).
- **Revisão multiagente real (`PROMPT AGENTES`):** executados 3 subagentes independentes (`revisor_ux_ui`, `revisor_qa_security`, `revisor_po`); todos os achados de validação/UX do F1 foram corrigidos e registrados em `docs/BUGS.md` (B-002 a B-006) e `docs/REGISTRO_TRABALHO.md`.

### 9.4. Próximo bloco do Gustavo + Claude — Bloco F2 (Jornada do Cliente)
Ver detalhes completos em [`contexto_atual_claude.md`](contexto_atual_claude.md) e [`docs/PLANO_BLOCOS.md`](docs/PLANO_BLOCOS.md).
