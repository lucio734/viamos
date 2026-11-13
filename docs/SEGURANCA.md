# Auditoria de Segurança e Conformidade LGPD — Víamos (Checklist 2026 — Fase 4)

## 1. Controles de Segurança Implementados (OWASP ASVS & RNF05–RNF10, RNF35)

| Categoria | Controle Implementado | Evidência no Código |
|---|---|---|
| **Autenticação e Senhas (RNF06, B-003)** | Hash `bcryptjs` (custo 10); limite estrito de 8 a 72 caracteres em cadastro, redefinição e alteração de senha para prevenir truncamento silencioso ou DoS de CPU no bcrypt; tokens de recuperação gerados com `crypto.randomBytes(24)` e armazenados apenas como hash SHA-256 com expiração de 30 min e uso único. | `backend/src/services/auth.service.ts`, `backend/src/controllers/auth.controller.ts` |
| **Proteção contra Força Bruta (RNF35)** | Rate limiting global e estrito em endpoints de autenticação (`express-rate-limit`) + bloqueio automático da conta por **15 minutos** após **5 tentativas inválidas** consecutivas (`HTTP 423 CONTA_BLOQUEADA`). | `backend/src/services/auth.service.ts`, `backend/src/app.ts`, `backend/tests/excecoes.test.ts` |
| **Gestão de Sessões Revogáveis (RF08, RF09, B-008)** | JWT assinado (`HS256`, expiração 8h) combinado com registro persistido na tabela `sessoes` (`revogada_em`). Logout revoga a sessão imediatamente; redefinição de senha revoga todas as sessões; alteração de senha revoga todas as demais sessões ativas do usuário (`ne(sessoes.id, sessaoAtualId)`). | `backend/src/middlewares/autenticar.ts`, `backend/src/services/auth.service.ts` |
| **Controle de Acesso por Papel e Participação (RBAC + Object-Level Authorization)** | Middleware `exigirPapel(...)` segrega rotas de `CLIENTE`, `INTERPRETE` e `BACKOFFICE`/`SUPORTE`. Além disso, serviços de atendimento, sala, QR Code e comprovante PDF verificam se `usuario.id` pertence ao atendimento (`clienteUsuarioId` ou `interpreteUsuarioId`), barrando IDOR com `HTTP 403`. | `backend/src/middlewares/autenticar.ts`, `backend/src/services/atendimento.service.ts`, `backend/src/services/comprovante.service.ts` |
| **Validação de Entrada e Upload Seguro (RF05, B-002, B-004, B-007)** | Esquemas Zod validam todos os payloads (`validarBody`/`validarQuery`), datas sem *rollover* de calendário (`2000-02-31` bloqueado), esquema/MIME de `fotoUrl` e tamanho máximo de certificados (≤ 5 MB). O serviço de cadastro inspeciona os **magic bytes** reais do buffer (`%PDF`, `FF D8 FF` para JPEG e `89 50 4E 47` para PNG), rejeitando executáveis ou scripts renomeados. | `backend/src/services/cadastro.service.ts`, `backend/src/controllers/cadastro.controller.ts` |
| **Download Seguro de Documentos Sensíveis (B-008)** | Comprovantes PDF e certificados Prolibras são abertos via `fetch` autenticado (`Authorization: Bearer <token>`) convertido em `Blob` URL (`api.abrirArquivo`), evitando exposição de JWT em URLs, histórico do navegador ou logs de proxy. | `frontend/src/api/cliente.ts` |
| **Cabeçalhos HTTP, CORS e Ocultação de Stack Trace (#36)** | `helmet` ativo na API; CORS restrito às origens configuradas em `CORS_ORIGINS`; middleware global de erros padroniza respostas `{ erro: { codigo, mensagem, detalhes } }` sem vazar stack trace ou estrutura interna do banco em erros 500. | `backend/src/app.ts`, `backend/src/middlewares/erros.ts` |
| **Trilha de Auditoria Imutável (RF44, RNF08)** | Tabela `eventos_auditoria` protegida por trigger PostgreSQL (`impedir_alteracao_auditoria`) que bloqueia qualquer `UPDATE` ou `DELETE` no nível do SGBD. | `backend/drizzle/0001_auditoria_imutavel.sql`, `backend/tests/excecoes.test.ts` |

---

## 2. Conformidade com a LGPD (RF45, RNF09, RNF10)

1. **Minimização e Consentimento Explícito:** coleta restrita aos dados necessários à mediação presencial; registro auditável de consentimentos (`TERMOS_USO`, `PRIVACIDADE`, `LOCALIZACAO`, `NOTIFICACOES`) com versão do termo, IP e carimbo de tempo.
2. **Compartilhamento Efêmero de Geolocalização (RF30, RNF07):** coordenadas só são aceitas durante a janela operacional do atendimento (de 2h antes do início previsto até o encerramento) e sempre mediante ação explícita do usuário.
3. **Portabilidade e Transparência (`GET /api/perfil/dados/exportar`):** o titular (cliente ou intérprete) baixa instantaneamente em JSON todos os seus dados cadastrais, consentimentos e histórico.
4. **Direito de Exclusão e Anonimização (`POST /api/perfil/dados/excluir`):** anonimiza imediatamente nome, e-mail, telefone, foto, endereço/CEP e preferências de acessibilidade, inativa o cadastro e revoga todas as sessões ativas, preservando apenas registros fiscais/contratuais exigidos por obrigação legal.

---

## 3. Auditoria de Dependências (`npm audit`)
- **Dependências de produção (`npm audit --omit=dev`):** **0 vulnerabilidades** no `backend` e no `frontend`.
- **Dependências de desenvolvimento:** 1 aviso moderado em `esbuild` (dependência transitiva do `drizzle-kit` usado apenas em CLI local de desenvolvimento, não incluído em runtime de produção).
