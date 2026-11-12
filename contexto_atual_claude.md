# Víamos — Relatório de passagem de bastão para o Gustavo e o Claude (pós-Bloco F1)

> Gerado em 12/11/2026 (noite) após a conclusão e verificação do **Bloco F1** na branch `main`.

---

## 1. Estado do repositório e da branch `main`

- Os commits do Bloco 0 (`c429bb5`, `b69566b`, `48dc820`, `cfccb92`) já estavam publicados na `main` remota (`origin/main`).
- Seguindo a orientação do Lúcio, todo o trabalho do **Bloco F1** foi integrado, testado e publicado diretamente na `main`.
- Antes de iniciar o **Bloco F2**, basta atualizar o clone local:
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

### 3.4. Verificações executadas
- `backend`: `npm test` → **50/50 testes passando** (PostgreSQL 18.6); `npm run typecheck` → OK (0 erros).
- `frontend`: `npm run typecheck` → OK (0 erros); `npm run build` → OK (bundle gerado em `dist/`); `npm run lint` → 0 erros.

---

## 4. Próximo passo — Bloco F2 (Gustavo + Claude): Jornada do Cliente

Pasta alvo: `frontend/src/pages/cliente/` (substituindo os *placeholders* de `SITEMAP.cliente` em `frontend/src/rotas.tsx`):
1. `/cliente/solicitacoes/nova` (RF10–RF16, protótipo `code (15).html`) — 3 passos: (a) tipo, data/hora, duração (blocos de 30 min, mín. 60), observações ≤ 300; (b) endereço + `<Mapa />` (`src/components/Mapa.tsx`) para confirmar `latitude`/`longitude` + complemento/ponto de referência; (c) resumo com estimativa (`POST /solicitacoes/estimativa`) → confirmar (`POST /solicitacoes`).
2. `/cliente/solicitacoes/:id` e `/cliente/atendimentos/:id` (RF18, RF19, RF31, RF33, RF37) — linha do tempo de status, dados do intérprete, botões para sala, cancelar (exibindo política/taxa), QR Code (`qrcode.react` com `GET /atendimentos/:id/qrcode`), pagar, avaliar e comprovante PDF.
3. `/cliente/atendimentos/:id/sala` (RF28–RF30, RF34, protótipo `code (21).html`) — se possível, extrair a sala em `frontend/src/components/Sala.tsx` para reutilização direta na rota `/interprete/atendimentos/:id/sala` no Bloco F3.
4. `/cliente/atendimentos/:id/pagamento` (RF35, RF36) — formas salvas, adicionar Pix/cartão, processar pagamento (tratar 402 e idempotência).
5. `/cliente/atendimentos/:id/avaliar` (RF40, protótipo `code (3).html`) — estrelas 1–5 + comentário.
6. `/cliente/historico` (RF39, RF37, protótipo `code (13).html`) — filtros por período/tipo/status e download do PDF.
7. `/cliente/perfil` (RF43, RF45, RF35, protótipo `code (11).html`) — abas Dados, Pagamento, Segurança (`POST /auth/alterar-senha`) e Privacidade LGPD (consentimentos, exportar, excluir).
