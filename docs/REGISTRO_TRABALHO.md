# Registro de trabalho — estado real do projeto (AGENTS.md §6)

Documento de continuidade: o que foi **concluído e verificado**, o que está **pendente ou não testado**, quem fez
(papel/agente), arquivos relevantes, decisões, riscos e próximos passos. Atualizar ao fim de cada bloco.

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

## 3. Contribuições por papel/agente (AGENTS.md §3 — declaração honesta)

- **Bloco 0 (11–12/11):** executado por **um único agente (Claude)**, sob direção do Gustavo, acumulando os papéis de Back-end, Dados, Front-end, QA e Security de forma sequencial, sem subagentes independentes.
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
| Máquina de estados da solicitação (11/11) | Estados `BUSCANDO → ACEITA → EM_ANDAMENTO → CONCLUIDA` e `CANCELADA`; atendimento `AGENDADO → EM_ANDAMENTO → CONCLUIDO/CANCELADO` | Conferir nomes no documento final (#23) e ajustar a figura se necessário |
| Hub do intérprete (mockup) cita check-in 15 min antes | Parâmetro `CHECKIN_ANTECEDENCIA_MIN = 30` | Decisão D-05 — pendente de validação do grupo |

## 5. Pendências, riscos e próximos passos

| Tipo | Item | Responsável | Bloco |
|---|---|---|---|
| Resolvido | Push na `main` destravado e Blocos F1, F2, F3 e F4 (todas as 23 rotas do SITEMAP + hardening OWASP) publicados na `main` | Lúcio / Equipe de Agentes | F1–F4 (concluído) |
| Pendência | Validar D-01 (preços de referência) e D-05 (janela de 30 min) | grupo | P1/P2 |
| Pendência | Link do Figma (#5) | grupo | P2 |
| Pendência | Contas Render/Vercel/Neon | Lúcio | D |
| Risco | Render free "dorme" (cold start ~50 s) — abrir `/api/health` antes da demonstração | QA/DevOps | Z |
| Mitigado | Geolocalização em demonstração indoor: tela `/interprete/atendimentos/:id` inclui botão de 1 clique para preencher as coordenadas exatas do atendimento na demonstração | Front-end / QA | F3 (concluído) |
| Risco | Google Fonts/Material Symbols dependem de internet na apresentação; alternativa: empacotar a fonte localmente | Front-end | D/Z |
| Débito | Documentação OpenAPI (`docs/api/openapi.yaml`), plano de testes escrito (`docs/TESTES.md`), `docs/SEGURANCA.md`, manuais e SLA | QA/Security/DevOps | P1, D, Z |
| Próximo passo | **Bloco P1/P2** (diagramas e documento de Produção Técnica) e **Bloco D** (deploy em Render + Vercel + Neon) conforme `docs/PLANO_BLOCOS.md` | ambos | 14–19/11 |

## 6. Instruções reproduzíveis

Ver `README.md` (seções 2–6). Resumo: `docker compose up -d` → `cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm test && npm run dev` → `cd frontend && npm install && cp .env.example .env && npm run dev`.
