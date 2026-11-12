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
| Resolvido | Push na `main` destravado e Bloco F1 publicado diretamente na `main` | Lúcio / Gustavo | F1 (concluído) |
| Pendência | Validar D-01 (preços de referência) e D-05 (janela de 30 min) | grupo | F2 |
| Pendência | Link do Figma (#5) | grupo | P2 |
| Pendência | Contas Render/Vercel/Neon | Lúcio | D |
| Risco | Render free "dorme" (cold start ~50 s) — abrir `/api/health` antes da demonstração | QA/DevOps | Z |
| Risco | Geolocalização em demonstração indoor: usar DevTools → Sensors para simular coordenadas | QA | Z |
| Risco | Google Fonts/Material Symbols dependem de internet na apresentação; alternativa: empacotar a fonte localmente (F4) | Front-end | F4 |
| Débito | Documentação OpenAPI, plano de testes escrito, melhorias OWASP sugeridas pelo `revisor_qa_security` (*magic bytes* no upload, revogação de outras sessões em `alterarSenha`, download de PDF via Blob), manuais, SLA | QA/Security/DevOps | F4, D, Z |
| Próximo passo | **Bloco F2** (Gustavo + Claude: jornada do cliente) e **Bloco F3** (Lúcio: jornada do intérprete) conforme `docs/PLANO_BLOCOS.md` | ambos | 13–15/11 |

## 6. Instruções reproduzíveis

Ver `README.md` (seções 2–6). Resumo: `docker compose up -d` → `cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm test && npm run dev` → `cd frontend && npm install && cp .env.example .env && npm run dev`.
