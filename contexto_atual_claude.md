# Víamos — Relatório de passagem de bastão para o Gustavo e o Claude (pós-Blocos F1, F2, F3 e F4)

> Gerado em 12/11/2026 (noite) após a conclusão e verificação dos **Blocos F1, F2, F3 e F4 (100% das 23 rotas do SITEMAP + Hardening OWASP)** na branch `main`.

---

## 1. Estado do repositório e da branch `main`

- Os commits do Bloco 0 (`c429bb5`, `b69566b`, `48dc820`, `cfccb92`) já estavam publicados na `main` remota (`origin/main`).
- Seguindo a orientação do Lúcio, todo o trabalho dos **Blocos F1, F2, F3 e F4** foi integrado, testado e publicado diretamente na `main`.
- **100% das 23 rotas definidas em `frontend/src/rotas.tsx` (`SITEMAP`) estão implementadas com componentes reais (0 placeholders `<EmConstrucao />` restantes).**
- Antes de iniciar os próximos blocos (**Bloco P1/P2** de diagramas/Produção Técnica e **Bloco D** de deploy), basta atualizar o clone local:
  ```bash
  git checkout main
  git pull --ff-only origin main
  ```
- **Nota para Windows + Vitest:** ao rodar `npm test` em `backend/` no Windows, certifique-se de que o caminho do diretório atual use letra de unidade maiúscula (`C:\...` e não `c:\...`), pois o carregador ESM do Node/Vite diferencia o *casing* de `file:///C:/` vs `file:///c:/` ao vincular o `setupFiles` do Vitest.

---

## 2. Resposta às decisões D-01…D-18 e ao plano

1. **Concordância integral com D-01…D-18:** mantidas todas as decisões de negócio (`backend/src/config/regras.ts`) e escolhas arquiteturais (MVC no Express 5, Drizzle ORM com migrações SQL versionadas, React 19 + Tailwind v4 com tokens do `DESIGN.md`).
2. **Perguntas que seguem abertas apenas para confirmação humana do grupo:**
   - **D-01:** valores de referência por hora (Saúde 95, Jurídico 110, Educação 80, Evento 100, Outro 85) + deslocamento R$ 15 + taxa de 10%.
   - **D-05:** janela de antecedência do check-in (30 min vs 15 min do texto do mockup).
   - **P-01:** link do Figma (item #5 do Dossiê) a partir da importação das telas do Stitch.

---

## 3. O que foi entregue e verificado no Bloco F1

### 3.1. Componentes compartilhados e utilitários (`frontend/src/`)
- **`frontend/src/components/Mapa.tsx`**: componente `react-leaflet` + OpenStreetMap pronto para reutilização no **Bloco F2** (passo 2 da nova solicitação) e no **Bloco F3** (demandas próximas).
  - Props: `posicao: Ponto | null`, `aoSelecionar?: (p: Ponto) => void`, `raioKm?: number`, `marcadores?: MarcadorExtra[]`, `somenteLeitura?: boolean`, `altura?: string`, `rotulo?: string`.
  - Exporta também `CENTRO_PADRAO` (`{ lat: -23.5505, lng: -46.6333 }`) e `geocodificar(endereco: string): Promise<Ponto | null>` (Nominatim com fallback gracioso).
- **`frontend/src/components/TelaPublica.tsx`**: moldura para telas públicas + `SecaoFormulario`.
- **`frontend/src/utils/validacao.ts`**: validações instantâneas no cliente (`cpfValido`, `cnpjValido`, `documentoValido`, `telefoneValido`, `cepValido`, `emailValido`, `idadeValida`, `erroSenha`, `erroArquivoCertificado`, `lerComoBase64`).

### 3.2. Telas do Bloco F1 conectadas em `frontend/src/rotas.tsx`
1. **`/recuperar-senha`** (`frontend/src/pages/auth/RecuperarSenha.tsx` — RF07, RNF06): formulário + alerta de sucesso + atalho `tokenDev` em ambiente de demonstração.
2. **`/redefinir-senha/:token`** (`frontend/src/pages/auth/RedefinirSenha.tsx` — RF07): validação de nova senha (8–72 caracteres) + confirmação + revogação de sessões.
3. **`/cadastro`** (`frontend/src/pages/auth/SelecaoPerfil.tsx` — RF02): seleção acessível entre Pessoa surda (cliente) e Intérprete de Libras.
4. **`/cadastro/cliente`** (`frontend/src/pages/auth/CadastroCliente.tsx` — RF03, RF45, RNF09): fiel a `code (7).html`, incluindo telefone obrigatório e consentimentos LGPD.
5. **`/cadastro/interprete`** (`frontend/src/pages/auth/CadastroInterprete.tsx` — RF04, RF05, RF45, RNF09, RNF36): fiel a `code (17).html`, incluindo CPF/CNPJ, telefone, senha, múltiplas especialidades, preço/hora, slider de raio (1–15 km), endereço-base com `<Mapa />`, número e upload *drag-and-drop* do certificado (PDF/JPG/PNG ≤ 5 MB em Base64), consentimentos LGPD e aviso pós-cadastro de documentação em análise pelo backoffice.
6. **`/notificacoes`** (`frontend/src/pages/comum/Notificacoes.tsx` — RF42): 4 estados visuais, filtro Todas / Não lidas, marcar individual ou todas como lidas e navegação para `referenciaRecurso`.
7. **`/suporte`** (`frontend/src/pages/comum/Suporte.tsx` — RF34, RNF44): acionamento de Suporte ou Emergência (avulso ou com `?atendimentoId=`) e anexação opcional/explícita de coordenadas GPS.

### 3.3. Revisão por múltiplos agentes (`PROMPT AGENTES`) e correções aplicadas
Três subagentes especializados revisaram o Bloco F1 de forma independente (`revisor_ux_ui`, `revisor_qa_security`, `revisor_po`). Os defeitos encontrados foram todos corrigidos antes do push e registrados em `docs/BUGS.md`:
- **B-002 (Alta — QA):** datas inexistentes com *rollover* no V8 (ex.: `2000-02-31`) agora são barradas em `validacao.ts` e `cadastro.controller.ts` com HTTP 400 (`VALIDACAO`), cobertas por novo teste em `backend/tests/excecoes.test.ts`.
- **B-003 (Alta — Security):** adicionado limite `.max(72)` em `novaSenha` (`esquemaRedefinir` e `esquemaAlterarSenha`) e `.max(128)` em `senha`/`senhaAtual` (`auth.controller.ts`), coberto por teste automatizado.
- **B-004 (Alta — QA/Security):** consolidada a exibição de erros de subcampos `certificacao.arquivo.*` em `CadastroInterprete.tsx` e adicionado `.max(7_000_000)` em `esquemaArquivoBase64.conteudoBase64`.
- **B-005 (Média — QA):** adicionado ícone para `SOLICITACAO` em `Notificacoes.tsx` e `try/catch` no `JSON.parse` de `frontend/src/api/cliente.ts`.
- **B-006 (Baixa — UX/UI):** ajustados `min-h-touch` (44 px, RNF13) no slider e links secundários e `text-base` (16 px, RNF14) nos textos descritivos de `Notificacoes.tsx` e `Suporte.tsx`.

### 3.4. Blocos F2, F3, F4 e Hardening OWASP (entregues na sequência na `main`)
- **Hardening OWASP no Backend (`backend/src/`) e Cliente HTTP (`frontend/src/api/`)**:
  - `alterarSenha` revoga todas as demais sessões ativas do usuário (`B-008`).
  - `decodificarArquivo` valida *magic bytes* (`%PDF`, JPEG, PNG) além do MIME e tamanho (`B-007`), testado em `excecoes.test.ts`.
  - `esquemaSuporte` exige `descricao` (mín. 5 caracteres) quando `tipo === 'SUPORTE'` (`B-009`), testado em `excecoes.test.ts`.
  - `PUT /perfil` valida esquema/MIME de `fotoUrl` e `POST /perfil/dados/excluir` limpa `cep`, `endereco` e `preferenciasAcessibilidade` em `clientes` (`B-009`).
  - `api.abrirArquivo` faz download/abertura autenticada via `fetch` + `Blob` URL sem expor JWT na query string (`B-008`).
- **Bloco F2 — Jornada do Cliente (`frontend/src/pages/cliente/` + compartilhados)**:
  - `/cliente/solicitacoes/nova` (`NovaSolicitacao.tsx` — assistente em 3 passos com `<Mapa />` e estimativa prévia).
  - `/cliente/solicitacoes/:id` (`DetalheSolicitacao.tsx` — linha do tempo, QR Code, intérprete e cancelamento com política/taxa).
  - `/cliente/atendimentos/:id` (`DetalheAtendimentoCliente.tsx` — QR Code, encerramento, comprovante PDF, avaliação).
  - `/cliente/atendimentos/:id/sala` e `/interprete/atendimentos/:id/sala` (`components/Sala.tsx` — chat por polling de 4 s, foto do ponto de encontro, GPS temporário no `<Mapa />` e botão SOS).
  - `/cliente/atendimentos/:id/pagamento` (`PagamentoAtendimento.tsx` — Pix/cartão, processamento idempotente, tratamento de 402 e PDF).
  - `/cliente/atendimentos/:id/avaliar` e `/interprete/atendimentos/:id/avaliar` (`pages/comum/AvaliarAtendimento.tsx`).
  - `/cliente/historico` e `/interprete/historico` (`pages/comum/HistoricoAtendimentos.tsx`).
  - `/cliente/perfil` (`PerfilCliente.tsx` — dados pessoais/acessibilidade, formas de pagamento, senha e direitos LGPD).
- **Bloco F3 — Jornada do Intérprete (`frontend/src/pages/interprete/` + `LeitorQr.tsx`)**:
  - `components/LeitorQr.tsx` (`html5-qrcode` por câmera + fallback manual).
  - `/interprete` (`HubInterprete.tsx` — chave Online/Offline, `<Mapa />` com raio e demandas, aceite/recusa rápida, ganhos da semana e próximo atendimento).
  - `/interprete/demandas` (`DemandasInterprete.tsx`) e `/interprete/demandas/:id` (`DetalheDemanda.tsx`).
  - `/interprete/agenda` (`AgendaInterprete.tsx` — slider de raio 1–15 km no `<Mapa />` e grade semanal de disponibilidade).
  - `/interprete/atendimentos/:id` (`DetalheAtendimentoInterprete.tsx` — check-in com GPS + simulador indoor de 1 clique + `<LeitorQr />` e encerramento).
  - `/interprete/ganhos` (`GanhosInterprete.tsx` — resumo semanal, contas bancárias, solicitação de repasse e extrato).
  - `/interprete/perfil` (`PerfilInterprete.tsx` — upload de foto de perfil `fotoUrl` ≤ 350 KB fechando o RF04, dados profissionais, endereço-base no `<Mapa />`, certificações Prolibras + reenvio, senha e LGPD).
- **Bloco F4 — Backoffice e Verificação Pública (`frontend/src/pages/backoffice/` e `VerificarComprovante.tsx`)**:
  - `/verificar/:codigo` (`pages/comum/VerificarComprovante.tsx` — RF38).
  - `/backoffice` (`FilaCertificacoes.tsx` — RF06, indicadores + fila filtrável).
  - `/backoffice/certificacoes/:id` (`ParecerCertificacao.tsx` — RF06, dossiê + visualização via Blob + parecer `APROVADO`/`CORRECAO`/`REPROVADO`).
  - `/backoffice/chamados` (`ChamadosSuporte.tsx` — RF34, destaque para SOS Emergência com `<Mapa />` e atualização de status).
  - `/backoffice/auditoria` (`TrilhaAuditoria.tsx` — RF44, filtros por evento e período).

### 3.5. Verificações executadas
- `backend`: `npm test` → **50/50 testes passando** (PostgreSQL 18.6, incluindo os casos de *magic bytes* e validação de suporte); `npm run typecheck` → OK (0 erros).
- `frontend`: `npm run typecheck` → OK (0 erros); `npm run build` → OK (130 módulos transformados em `dist/`); `npm run lint` → 0 erros.

---

## 4. Próximos passos — Blocos P1/P2 (Produção Técnica), D (Deploy) e Z (Ensaio)

Com **100% das telas da aplicação e endpoints do backend prontos e verificados na `main`**, o foco passa para:
1. **Bloco P1 / P2 (Documentação Acadêmica e Diagramas):** gerar as figuras a partir do código real (Sitemap de `rotas.tsx`, DER de `schema.ts`, arquitetura funcional/técnica/MVC, macroprocesso, fluxograma, sequências) e montar o documento de Produção Técnica no formato de `modelo_entrega.docx`, além de `docs/api/openapi.yaml`, `docs/TESTES.md` e `docs/SEGURANCA.md`.
2. **Bloco D (Deploy em Nuvem):** publicar a API no Render (`render.yaml`), o banco no Neon/Render Postgres (rodando `db:migrate` e `db:seed`) e o frontend na Vercel (`frontend/vercel.json`), registrando as URLs em `docs/DEPLOY.md` e `docs/SLA.md`.
3. **Bloco Z (Ensaio e Auditoria Final):** ensaiar o roteiro de demonstração ponta a ponta e preencher `docs/MANUAL.md`.
