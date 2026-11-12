# Plano de trabalho em blocos — entrega final em 21/11/2026

Regra de ouro: **uma conversa com a IA = um bloco**. Cada bloco termina com código rodando, commit na branch
e o arquivo de passagem de bastão atualizado (`contexto_atual_chatgpt.md` quando o próximo é o Lúcio;
`contexto_atual_claude.md` quando o próximo é o Gustavo). Se um bloco for grande, ele tem *checkpoints*
(commits intermediários) — assim nada se perde se os créditos acabarem no meio.

Regras obrigatórias de `CLAUDE/AGENTS.md` que valem para todos os blocos:
- **Preservar** `Contexto/` e `Entregas/`: não mover, renomear, excluir nem reorganizar; material novo vai em `docs/`.
- Ler as fontes obrigatórias (`PROMPT AGENTES`, `labProt`, `Software Development Checklist 2026`, `Dossie_Checklist_Vibe_Coding`) e **registrar** as verificações em `docs/VERIFICACOES.md`.
- Trabalhar com a **equipe de agentes** de `docs/EQUIPE_AGENTES.md` (subagentes no Claude; papéis em sequência no ChatGPT) e declarar honestamente quando um bloco foi feito por um agente só.
- Ao fechar o bloco, atualizar `docs/REGISTRO_TRABALHO.md` (feito/verificado × pendente, contribuições por papel, divergências) e nunca commitar `.env`, segredos ou arquivos fora da tarefa.

Entregáveis do *Software Development Checklist 2026* incorporados ao plano: documentação OpenAPI (F4), plano de testes
e log de bugs (`docs/TESTES.md`, `docs/BUGS.md` — F4, alimentado desde F1), auditoria de segurança (`docs/SEGURANCA.md` — F4),
`docs/DEPLOY.md` + `docs/SLA.md` (D), manuais de usuário/administrador (`docs/MANUAL.md` — Z).

Legenda de responsáveis: **G** = Gustavo + Claude · **L** = Lúcio + ChatGPT. Os blocos de G e L do mesmo
período mexem em pastas diferentes, para evitar conflito de merge.

## Situação em 12/11 (manhã)

| Área | Estado |
|---|---|
| Backend (API MVC, banco, migrações, seed, 49 testes) | ✅ concluído — `backend/` |
| Frontend — base (tokens do design system, cliente HTTP, sessão, sitemap/rotas, AppShell, Splash, Login, Hub do cliente) | ✅ concluído — `frontend/` |
| Frontend — demais telas (≈ 30) | ⬜ Blocos F1–F4 |
| Deploy com HTTPS (Vercel + Render + banco) | ⬜ Bloco D |
| Documento "Produção Técnica" (28 itens) e diagramas novos | ⬜ Blocos P1–P3 |
| Registros exigidos pelo `AGENTS.md` (verificações, equipe de agentes, registro de trabalho) | ✅ criados em 12/11 — manter a cada bloco |
| Ensaio de demonstração e auditoria dos 50 itens | ⬜ Bloco Z |

## Cronograma sugerido

| Período | G (Gustavo + Claude) | L (Lúcio + ChatGPT) |
|---|---|---|
| 12–13/11 | **F2** Jornada do cliente | **F1** Autenticação, cadastros, notificações, suporte |
| 14–15/11 | **P1** Diagramas gerados do código | **F3** Jornada do intérprete |
| 16–17/11 | **F4** Backoffice, verificação pública e polimento | **D** Deploy em produção |
| 18–19/11 | **P2** Consolidação do documento (.docx) | **P2** Textos introdutórios e tabelas de requisitos/casos de uso |
| 20/11 | **P3** Revisão final do documento + **Z** ensaio | **Z** ensaio da demonstração + auditoria do checklist |
| 21/11 | Entrega | Entrega |

Se alguém terminar antes, pega o próximo bloco livre da própria coluna; blocos da outra coluna só com combinação prévia (para não editar os mesmos arquivos).

---

## Blocos de frontend

Convenções para todos os blocos F:
- Cada tela substitui o `tela({...})` correspondente em `frontend/src/rotas.tsx` pelo componente real; **não** reorganizar o arquivo.
- Componentes novos compartilhados vão em **arquivos novos** em `frontend/src/components/` (ex.: `Mapa.tsx`, `LeitorQr.tsx`, `Passos.tsx`); `ui.tsx` só recebe acréscimos pequenos.
- Toda tela tem os 4 estados: carregando (`<Carregando/>`), erro (`<EstadoErro/>` com tentar novamente), vazio (`<EstadoVazio/>`) e sucesso (`<Alerta tipo="sucesso">`).
- Máscaras e formatadores já existem em `frontend/src/utils/formato.ts`; os erros por campo vêm em `ErroApi.porCampo`.
- Fidelidade ao protótipo: abrir o HTML/PNG indicado em `Contexto/Arquivos Stitch/` (o `EmConstrucao` de cada rota já diz qual) e ao `DESIGN.md`.

### Bloco F1 — Autenticação, cadastros, notificações e suporte (L)
Pasta: `frontend/src/pages/auth/`, `pages/comum/`.
1. `/recuperar-senha` e `/redefinir-senha/:token` (RF07) — formulário + alerta de sucesso.
2. `/cadastro` seleção de perfil (RF02) — dois cartões grandes (usuário surdo / intérprete).
3. `/cadastro/cliente` (RF03) — nome, CPF (máscara + validação), nascimento, e-mail, telefone, senha, CEP/endereço opcionais, aceite dos termos; erros por campo; sucesso → `/cliente`.
4. `/cadastro/interprete` (RF04/RF05) — + documento (CPF/CNPJ), endereço-base com **mapa** para marcar lat/lng (componente `Mapa.tsx` com react-leaflet; geocodificação por Nominatim é opcional), especialidades (chips), valor/hora, raio (slider ≤ 15), upload do certificado (PDF/JPG/PNG ≤ 5 MB → base64); sucesso → `/interprete` com aviso "documentação em análise".
5. `/notificacoes` (RF42) — lista, marcar como lida, clicar navega para `referenciaRecurso`.
6. `/suporte` (RF34) — botões Suporte / Emergência com geolocalização.
Checkpoint sugerido: commit após o item 3 e após o item 4.

### Bloco F2 — Jornada do cliente (G)
Pasta: `frontend/src/pages/cliente/`.
1. `/cliente/solicitacoes/nova` (RF10–RF16) — 3 passos: (a) tipo, data/hora, duração (blocos de 30 min, mín. 60), observações ≤ 300; (b) endereço + mapa para confirmar o ponto (lat/lng) + complemento/ponto de referência; (c) resumo com **estimativa** (`POST /solicitacoes/estimativa`) → confirmar (`POST /solicitacoes`) → tela "Buscando intérprete".
2. `/cliente/solicitacoes/:id` (RF18/RF19) — linha do tempo de status, dados do intérprete quando aceita, botões: sala, cancelar (mostra a política/taxa devolvida pela API), **QR Code** (qrcode.react com `conteudo` de `/atendimentos/:id/qrcode`), pagar, avaliar, comprovante.
3. `/cliente/atendimentos/:id/sala` (RF28–RF30) — chat com polling (`?apos=`), envio de texto, foto (data URL ≤ 1 MB), localização (botão), mensagens do sistema; botão de suporte/emergência.
4. `/cliente/atendimentos/:id/pagamento` (RF35/RF36) — formas salvas, adicionar Pix/cartão (máscaras), processar; tratar 402 (recusado) e 200 repetido.
5. `/cliente/atendimentos/:id/avaliar` (RF40) — estrelas 1–5 + comentário.
6. `/cliente/historico` (RF39/RF37) — filtros (período, tipo, situação), baixar comprovante (`api.urlArquivo('/atendimentos/:id/comprovante.pdf')`).
7. `/cliente/perfil` (RF43/RF45) — abas Dados, Pagamento, Segurança (alterar senha), Privacidade (consentimentos, exportar, excluir).
Checkpoint sugerido: commit após 1–2, após 3–4, após 5–7.

### Bloco F3 — Jornada do intérprete (L)
Pasta: `frontend/src/pages/interprete/`.
1. `/interprete` hub (RF20/RF24/RF26) — toggle "Ficar online", status da habilitação, mapa com demandas próximas, próximos atendimentos, resumo de ganhos.
2. `/interprete/demandas` + `/interprete/demandas/:id` (RF20–RF23) — lista/mapa com distância, urgência; detalhe com aceitar (tratar 409/422) e recusar com motivo.
3. `/interprete/agenda` (RF24/RF25) — raio (≤ 15 km) e grade semanal de disponibilidade.
4. `/interprete/atendimentos/:id` (RF31–RF33) — **leitor de QR** (`LeitorQr.tsx` com html5-qrcode; fallback: digitar o código), captura de geolocalização (precisão exibida), check-in com mensagens de erro específicas (fora do local, precisão, janela), encerrar atendimento com resumo (duração real, valor).
5. `/interprete/atendimentos/:id/sala` — reaproveitar o componente da sala do Bloco F2 (`components/Sala.tsx`, se G já o extraiu; senão criar e avisar).
6. `/interprete/ganhos` (RF26/RF27) — semana atual, saldo, extrato, conta bancária, solicitar repasse.
7. `/interprete/historico` e `/interprete/perfil` (RF39/RF43/RF05) — + status da documentação e reenvio do certificado.
Checkpoint sugerido: commit após 1–2, após 3–4, após 5–7.

### Bloco F4 — Backoffice, verificação pública, qualidade e segurança (G)
1. `/backoffice` indicadores + fila de certificações; `/backoffice/certificacoes/:id` visualizar arquivo e dar parecer; `/backoffice/chamados`; `/backoffice/auditoria`.
2. `/verificar/:codigo` (RF38) — página pública do comprovante.
3. Responsividade desktop (sidebar) e acessibilidade (foco visível, contraste, `aria-*`, alvos ≥ 44 px) em todas as telas; fonte Inter e Material Symbols empacotadas localmente (sem depender do Google Fonts na apresentação).
4. Testes de frontend (Vitest + Testing Library): máscaras, validações do formulário de solicitação, renderização dos estados.
5. **Revisões por papel com subagentes** (equipe de agentes): QA (executa e amplia os testes; escreve `docs/TESTES.md` com plano, casos e resultado), Security (revisão OWASP de autenticação/sessão/validação; `docs/SEGURANCA.md` com `npm audit`), UX/UI (fidelidade aos protótipos Stitch), PO (RF/RNF por tela). Resultados em `docs/REGISTRO_TRABALHO.md`.
6. Documentação da API em OpenAPI (`docs/api/openapi.yaml`, gerada a partir de `backend/src/routes/index.ts` + esquemas Zod) e pipeline de CI (`.github/workflows/ci.yml`: typecheck, testes, build).
7. `docs/BUGS.md` consolidado (bugs encontrados desde F1, status e correção).

## Bloco D — Deploy em produção (L)
1. Criar contas: Neon (banco) **ou** usar o Postgres do Render; Render (API via `render.yaml`); Vercel (frontend, *Root Directory* = `frontend`, `VITE_API_URL`).
2. Definir variáveis: `JWT_SECRET` forte, `CORS_ORIGINS`/`FRONTEND_URL` com o domínio da Vercel, `API_PUBLIC_URL` com o domínio do Render.
3. Rodar `npm run db:seed:prod` uma vez (dados de demonstração) a partir do shell do Render ou localmente apontando para o banco de produção.
4. Validar: HTTPS nos dois domínios, `GET /api/health`, login, recarregar `/cliente/historico` direto na URL (rewrite SPA), PDF do comprovante.
5. Escrever `docs/DEPLOY.md` com URLs, prints e passos; anotar o *cold start* do Render free (~50 s na primeira chamada) no roteiro de demonstração.
6. Escrever `docs/SLA.md` (curto): disponibilidade esperada da hospedagem gratuita, tempo de resposta a incidentes durante a avaliação, responsáveis, plano de contingência.

## Blocos do documento "Produção Técnica"

### Bloco P1 — Diagramas gerados a partir do código (G)
Pasta: `docs/diagramas/` (fontes Mermaid/Graphviz + scripts) → PNGs em `docs/producao-tecnica/figuras/`.
1. **Sitemap** (#3) a partir de `frontend/src/rotas.tsx`.
2. **DER** (#22) a partir de `backend/src/models/schema.ts` (script → Mermaid `erDiagram`) — também serve de evidência de **ferramenta CASE** (#27), junto com o `.drawio` já entregue.
3. **Arquitetura funcional, técnica e MVC** (#7–#9) com o desenho da hospedagem (Vercel/Render/Postgres).
4. **Macroprocesso** (#16) e **Fluxograma** (#17) do fluxo principal.
5. **Diagrama de operação** (#24): sequências de aceite exclusivo, check-in e pagamento.
6. **Diagrama de processos de telas** (#26): transições entre telas por evento (gerado do sitemap + eventos).

### Bloco P2 — Consolidação do capítulo (G monta; L escreve textos)
Pasta: `docs/producao-tecnica/` — um `.md` por item do `Contexto/DOCUMENTAÇÃO REPOSITÓRIO/DOC.txt`, no formato do `Entregas/modelo_entrega.docx`
(texto introdutório → figura → "Fonte: Autoria própria apoiado por IA generativa" → explicação (i), (ii)… → tabela → conclusão).
- L: textos introdutórios (#1, #2, #6, #10, #15, #19), tabela de requisitos (do xlsx), tabela por caso de uso para cada tela (#20), descrição dos wireframes (#4) tela a tela.
- G: montagem das figuras já existentes (extrair dos PDFs de 07/10 e 11/11), DER/sitemap/arquiteturas do P1, script `docs/producao-tecnica/build/gerar_docx.py` que gera o `.docx` final com a formatação do modelo.
- Pendência do grupo: **link do Figma** (#5) — importar as telas do Stitch.

### Bloco P3 — Revisão final (G + L)
Leitura completa do `.docx`, numeração de figuras/tabelas, coerência com o código (nomes de rotas, entidades, regras), exportar PDF.

## Bloco Z — Ensaio de demonstração e auditoria (G + L)
1. Roteiro passo a passo (`docs/ROTEIRO_DEMONSTRACAO.md`) com as contas do seed: cliente solicita → intérprete aceita → sala → QR/check-in (usar coordenadas simuladas do navegador) → encerramento → pagamento → comprovante → avaliação → backoffice aprova Pedro.
2. Plano de contingência: Render dormindo (abrir `/api/health` 2 min antes), GPS impreciso (DevTools → Sensors), banco de produção resetado pelo seed.
3. Auditoria dos 50 itens do `Dossie_Checklist_Vibe_Coding.html` com a evidência de cada um (arquivo/rota/print) — cada integrante explica o código da sua parte (#49). Atualizar `docs/VERIFICACOES.md` §3.
4. `docs/MANUAL.md`: manual curto de usuário (cliente e intérprete) e de administrador (backoffice), com capturas das telas em produção.
