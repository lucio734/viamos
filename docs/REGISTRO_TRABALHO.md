# Registro de trabalho — estado real do projeto (AGENTS.md §6)

Documento de continuidade: o que foi **concluído e verificado**, o que está **pendente ou não testado**, quem fez
(papel/agente), arquivos relevantes, decisões, riscos e próximos passos. Atualizar ao fim de cada bloco.

## 1. Linha do tempo

| Data | Bloco | Executor | Resultado |
|---|---|---|---|
| 02/09 | Requisitos | grupo | 45 RF, 45 RNF, matriz, Projeto Linear, histórias (`Entregas/Engenharia de Requisitos/`) |
| 07/10 | UML | grupo | Casos de uso (10 vistas) e classes (11 vistas) (`Entregas/30_09/`) |
| 11/11 | Modelagem | grupo | Contexto (2), BPMN (6), DFD (6), estados (1) (`Entregas/Viamos_Modelagem_Sistemas*.pdf`) |
| 11–12/11 | **Bloco 0** | Gustavo + Claude (agente único) | Backend completo e testado; base do frontend; documentação de trabalho (esta branch) |
| 12/11 | — | Lúcio | `CLAUDE/CLAUDE.md` e `CLAUDE/AGENTS.md` com regras obrigatórias; `PROMPT AGENTES.docx`; material extraído em `Contexto/` e `Entregas/` |

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

## 3. Contribuições por papel/agente (AGENTS.md §3 — declaração honesta)

O Bloco 0 foi executado por **um único agente (Claude)**, sob direção do Gustavo, acumulando os papéis de Back-end,
Dados, Front-end, QA e Security de forma sequencial. **Não houve revisão independente por múltiplos agentes.**
A verificação se apoiou em testes automatizados e na checagem contra os documentos obrigatórios. As revisões por
papel (QA, Security, UX/UI, PO), com subagentes (Claude) ou prompts sequenciais (ChatGPT), ficam para os próximos
blocos conforme `docs/EQUIPE_AGENTES.md`.

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
| Impedimento | Push via Claude recusado: instalar o app do GitHub "Claude" no repositório (`https://github.com/apps/claude/installations/select_target`) ou o Gustavo faz push pelo GitHub Desktop | Lúcio / Gustavo | agora |
| Pendência | Validar D-01 (preços de referência) e D-05 (janela de 30 min) | grupo | F2 |
| Pendência | Link do Figma (#5) | grupo | P2 |
| Pendência | Contas Render/Vercel/Neon | Lúcio | D |
| Risco | Render free "dorme" (cold start ~50 s) — abrir `/api/health` antes da demonstração | QA/DevOps | Z |
| Risco | Geolocalização em demonstração indoor: usar DevTools → Sensors para simular coordenadas | QA | Z |
| Risco | Google Fonts/Material Symbols dependem de internet na apresentação; alternativa: empacotar a fonte localmente (F4) | Front-end | F4 |
| Débito | Documentação OpenAPI, plano de testes escrito, log de bugs, revisão OWASP, manuais, SLA (exigidos pelo Checklist 2026) | QA/Security/DevOps | F4, D, Z |
| Próximo passo | Bloco F1 (Lúcio) e Bloco F2 (Gustavo) conforme `docs/PLANO_BLOCOS.md` | ambos | 12–13/11 |

## 6. Instruções reproduzíveis

Ver `README.md` (seções 2–6). Resumo: `docker compose up -d` → `cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm test && npm run dev` → `cd frontend && npm install && cp .env.example .env && npm run dev`.
