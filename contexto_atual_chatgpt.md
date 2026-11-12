# Contexto atual do projeto Víamos — passagem de bastão para o Lúcio (ChatGPT)

> Gerado em 12/11/2026 por Gustavo + Claude, na branch `feat/plataforma-base`.
> Leia este arquivo inteiro antes de começar. Ele diz o que já existe, como rodar, o que **não** mudar
> e qual é o próximo bloco de trabalho. Ao terminar o seu bloco, sobrescreva `contexto_atual_claude.md`
> (mesmo formato) para a próxima rodada do Gustavo.

## 1. O que é o projeto (resumo de 10 linhas)

Víamos: plataforma web (mobile-first) que conecta pessoas surdas a intérpretes de Libras certificados para
**atendimentos presenciais**. Fluxo principal: cliente solicita (tipo, data/hora, duração ≥ 60 min, local) →
estimativa → distribuição para intérpretes aprovados em até 15 km → aceite exclusivo → sala de atendimento
(chat/foto/localização) → check-in por QR Code com GPS (≤ 200 m) → encerramento com duração real → pagamento
→ Comprovante de Acessibilidade Garantida (PDF verificável) → avaliação bilateral. Backoffice aprova certificados.
Fontes de verdade do escopo: `Contexto/ARQUIVOS .MD/Briefing_Projeto_Viamos.md` (45 RF, 45 RNF, histórias),
`Contexto/DOCUMENTAÇÃO REPOSITÓRIO/DOC.txt` (28 itens do documento) e
`Contexto/Auxílio Vibecoding/Dossie_Checklist_Vibe_Coding.html` (50 critérios de avaliação do professor).
**Antes de tudo, leia `CLAUDE/AGENTS.md`** (regras obrigatórias para qualquer IA) e os registros em `docs/EQUIPE_AGENTES.md`, `docs/VERIFICACOES.md` e `docs/REGISTRO_TRABALHO.md`.
**Nunca saia do escopo desses documentos.** Prazo final: **21/11/2026**.

## 2. O que já está pronto (não refazer)

### Backend — `backend/` ✅ completo e testado
- Node 22 + Express 5 + TypeScript, **arquitetura MVC** (`src/models`, `src/controllers`, `src/views`, `src/routes`, `src/services`, `src/middlewares`).
- PostgreSQL com **Drizzle ORM**. O arquivo `backend/src/models/schema.ts` tem 27 tabelas alinhadas aos diagramas de classe que entregamos em 07/10 (DC1–DC11) e é a fonte do DER. Migrações SQL em `backend/drizzle/` (não editar as existentes; para mudar o banco: alterar `schema.ts` → `npm run db:generate` → nova migração).
- Todos os 45 RFs têm endpoint. Mapa completo em `backend/src/routes/index.ts` (cada linha cita o RF).
- Regras de negócio parametrizadas em `backend/src/config/regras.ts`; decisões explicadas em `docs/DECISOES.md` (D-01…D-18).
- Seed com cenário de demonstração (`backend/src/db/seed.ts`): contas `joao@`, `ana@` (clientes), `maria@`, `carlos@` (intérpretes aprovados e online), `pedro@` (em análise), `operador@viamos.app` (backoffice) — senha `Viamos@2026`.
- **49 testes** (`npm test` em `backend/`): fluxo principal, 20+ exceções (aceite concorrente, check-in longe/impreciso, QR errado, encerramento repetido, pagamento duplicado, comprovante alheio, bloqueio de login, auditoria imutável) e unidades.
- Integrações simuladas: gateway de pagamento (`gateway.service.ts` — cartão final `0000` recusa) e e-mail (`console`).

### Frontend — `frontend/` ✅ base pronta, telas em construção
- React 19 + Vite + TypeScript + **Tailwind v4** com os tokens do `DESIGN.md` já em `src/index.css` (classes `bg-primary-container`, `text-on-surface-variant`, `btn-primario`, `campo`, `cartao`, `chip`…).
- `src/rotas.tsx` = **sitemap completo** (todas as rotas por perfil). Rotas sem tela mostram `<EmConstrucao>` com os endpoints prontos e o protótipo Stitch de referência.
- Prontos: `src/api/cliente.ts` (fetch com token + `ErroApi.porCampo`), `src/auth/AuthContext.tsx` (login/logout/splash), `src/components/ui.tsx` (Botao, Campo, AreaTexto, Selecao, Cartao, Chip, Carregando, EstadoVazio, EstadoErro, Alerta), `src/components/AppShell.tsx` (navegação inferior mobile + sidebar desktop + sino de notificações), `src/utils/formato.ts` (máscaras CPF/CNPJ/telefone/CEP/cartão e formatadores pt-BR), telas **Splash, Login e Hub do cliente**.
- `vercel.json` (rewrite SPA) e `public/_redirects` (Netlify) prontos.

### Repositório
- `README.md` com clonagem/instalação/execução/testes/deploy; `.gitignore` testado; `docker-compose.yml` (Postgres local); `render.yaml` (deploy da API).
- Material original do grupo permanece intocado em `Contexto/` e `Entregas/` (regra do `AGENTS.md`); tudo que a IA produz vai em `docs/`, `backend/` e `frontend/`.

## 3. Como rodar em 5 minutos

```bash
git clone https://github.com/lucio734/viamos.git && cd viamos
git checkout feat/plataforma-base
docker compose up -d                      # ou use um banco Neon no backend/.env
cd backend && npm install && cp .env.example .env && npm run db:migrate && npm run db:seed && npm run dev
# outro terminal
cd frontend && npm install && cp .env.example .env && npm run dev     # http://localhost:5173
```
Login com `joao@viamos.app` / `Viamos@2026` mostra o hub do cliente consumindo a API real.

## 4. Seu próximo bloco: **F1 — Autenticação, cadastros, notificações e suporte**

Detalhes e checkpoints em `docs/PLANO_BLOCOS.md` (seção "Bloco F1"). Resumo:
1. `/recuperar-senha` e `/redefinir-senha/:token` → `POST /api/auth/recuperar-senha` (em dev a resposta traz `tokenDev` para testar) e `POST /api/auth/redefinir-senha`.
2. `/cadastro` (seleção de perfil) — não há protótipo dedicado — seguir o `DESIGN.md` e o padrão do Login.
3. `/cadastro/cliente` → `POST /api/cadastro/cliente` — campos e validações em `backend/src/controllers/cadastro.controller.ts` (`esquemaCadastroCliente`). Protótipo `Contexto/Arquivos Stitch/code (7).html`.
4. `/cadastro/interprete` → `POST /api/cadastro/interprete` (`esquemaCadastroInterprete`): precisa de `latitudeBase/longitudeBase` (crie `src/components/Mapa.tsx` com react-leaflet — já instalado — para o usuário marcar o ponto) e do certificado em base64 (`{ nome, mime, conteudoBase64 }`, ≤ 5 MB, PDF/JPG/PNG). Protótipo `Contexto/Arquivos Stitch/code (17).html`.
5. `/notificacoes` → `GET /api/notificacoes`, `POST /api/notificacoes/:id/lida`, `POST /api/notificacoes/ler-todas`.
6. `/suporte` → `POST /api/suporte` com `{ tipo: 'SUPORTE' | 'EMERGENCIA', descricao?, latitude?, longitude? }`.

Para cada tela: substitua o `tela({...})` da rota em `src/rotas.tsx` pelo componente novo em `src/pages/auth/` (ou `src/pages/comum/`), use os componentes de `ui.tsx`, trate os 4 estados (carregando / erro com "tentar novamente" / vazio / sucesso) e mostre os erros por campo vindos de `ErroApi.porCampo`. Faça um commit a cada 2 telas.

Em paralelo, o Gustavo fará o **Bloco F2 (jornada do cliente)** em `src/pages/cliente/`. Não edite essa pasta nem `ui.tsx` além de acréscimos pequenos; componentes novos vão em arquivos novos.

## 5. Regras de convivência no código (além do `CLAUDE/AGENTS.md`)

- Branch: continue em `feat/plataforma-base` (ou crie `feat/f1-auth-cadastros` a partir dela e abra PR). Commits `tipo(escopo): descrição`.
- Não versionar `.env`, `node_modules`, `dist`.
- Antes de commitar: `cd frontend && npm run build` (tem que compilar) e, se tocou no backend, `cd backend && npm test`.
- Português em nomes de arquivos, variáveis e mensagens (padrão do projeto).
- Qualquer decisão de regra de negócio nova → acrescentar linha em `docs/DECISOES.md`.
- Use a equipe de agentes (`docs/EQUIPE_AGENTES.md`): no ChatGPT, acione os papéis em sequência (Front-end implementa → UX/UI confere o protótipo → QA testa → PO confere o RF) e registre os pareceres em `docs/REGISTRO_TRABALHO.md`. Bugs encontrados vão para `docs/BUGS.md`.

## 6. Pendências que dependem de pessoas (não de IA)

- **Acesso ao repositório**: adicionar o Gustavo como colaborador (Settings → Collaborators) para ele conseguir fazer push.
- **Figma**: importar as telas do Stitch e gerar o link (item #5 do documento).
- **Contas de hospedagem** (Render, Vercel, Neon) para o Bloco D — pode ser criado na conta do Lúcio.
- Confirmar os valores de referência da estimativa (D-01) e a janela de check-in de 30 min (D-05).

## 7. Ao terminar o seu bloco

Sobrescreva **`contexto_atual_claude.md`** na raiz com: o que foi feito (telas/rotas/arquivos), o que ficou pendente,
problemas encontrados, decisões novas e qual bloco o Gustavo deve pegar em seguida. Commite tudo junto.
