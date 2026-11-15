# Gerador dos diagramas da Produção Técnica (Bloco P1)

Os diagramas dos itens #3, #7–#9, #16, #17, #22–#24, #26–#28 do checklist **não são desenhados à mão**: este
gerador lê o código-fonte e produz as fontes Mermaid, as figuras PNG e as tabelas de apoio. Assim o documento
acompanha o sistema (item #38: esquema alinhado ao DER documentado).

O índice com todas as figuras, legendas e fontes está em [`DIAGRAMAS_PRODUCAO_TECNICA.md`](DIAGRAMAS_PRODUCAO_TECNICA.md).

## Como regenerar

Pré-requisitos: Node.js 20+ e Google Chrome ou Microsoft Edge instalado (usado só para desenhar os PNGs).

```bash
cd backend
npm install
npm run docs:modelo                 # schema.ts + regras.ts → docs/diagramas/dados/modelo.json
cd ../docs/diagramas
npm install                         # Mermaid CLI + TypeScript (defina PUPPETEER_SKIP_DOWNLOAD=true para não baixar navegador)
npm run figuras                     # fontes .mmd, dados, índice, tabelas e PNGs
npm run verificar                   # falha se algo versionado estiver diferente do que o código gera
```

`npm run gerar` faz tudo menos os PNGs. Para usar outro navegador, defina `PUPPETEER_EXECUTABLE_PATH`.

## O que é gerado

| Saída | Conteúdo |
|---|---|
| `dados/modelo.json` | Tabelas, colunas, PK/FK, índices, CHECKs e enums do banco, mais os parâmetros de `regras.ts` (exportado pelo backend: `backend/src/db/exportar-modelo.ts`) |
| `dados/extracao.json` | Rotas, navegação entre telas, menu, endpoints, camadas MVC, versões e hospedagem extraídos do código |
| `dados/layout.json` | Direção escolhida (LR/TB) para cada figura flexível — a que deixa o texto mais legível na página A4 |
| `fontes/*.mmd` | Fonte Mermaid de cada diagrama |
| `../producao-tecnica/figuras/*.png` | Figuras para o documento (escala 2×, tons de cinza, legíveis impressas) |
| `../producao-tecnica/tabelas/*.md` | Dicionário de dados, rotas e telas, endpoints, tecnologias e transições de telas |
| `DIAGRAMAS_PRODUCAO_TECNICA.md` | Índice com figura, fonte, legenda e código Mermaid de cada diagrama |

## Como funciona

1. **Extração** (`lib/extrair.mjs`) — usa a árvore sintática do compilador TypeScript para ler `frontend/src/rotas.tsx`
   (sitemap e proteção por papel), os `<Link>`, `<Navigate>` e `navigate()` de cada tela (transições), o menu do
   `AppShell`, `backend/src/routes/index.ts` (endpoints, papel exigido, validação Zod, RF) e as importações entre
   serviços. O modelo do banco vem da introspecção do Drizzle ORM sobre o `schema.ts`.
2. **Construção** (`lib/diagramas-estrutura.mjs`, `lib/diagramas-processo.mjs`) — transforma os fatos em Mermaid.
   Sitemap, DER, arquiteturas, telas, contexto e CASE saem direto dos dados. Macroprocesso, fluxogramas, estados e
   operação têm o encadeamento escrito à mão, com três amarras conferidas a cada geração: os números vêm de
   `regras.ts`; toda função, código de erro e RF citado precisa existir no código; todo estado citado precisa
   existir no enum do banco.
3. **Validação** (`gerar.mjs`) — a geração é interrompida se uma navegação apontar para rota inexistente ou se um
   diagrama citar algo que não existe.
4. **Renderização** (`lib/renderizar.mjs`) — Mermaid CLI com o navegador instalado; para as figuras flexíveis, as
   duas direções são desenhadas e fica a de texto mais legível em A4.

## Quando o código muda

| Mudança no código | O que fazer |
|---|---|
| Tabela, coluna, enum ou parâmetro de regra | `npm run docs:modelo` no backend e `npm run figuras` aqui |
| Rota, tela, link ou endpoint | `npm run figuras` |
| Novo arquivo em `backend/src/services` | Acrescentar o módulo em `MODULOS` (`lib/diagramas-estrutura.mjs`) — a geração avisa |
| Novo destino de navegação calculado em tempo de execução | Acrescentar em `DESTINOS_DINAMICOS` — a geração avisa |
| Regra de check-in, aceite, pagamento ou novo estado | Revisar o texto em `lib/diagramas-processo.mjs`; a validação acusa função, código, RF ou estado inexistente |

O CI (`.github/workflows/ci.yml`) roda `npm run docs:modelo -- --verificar` e `npm run verificar`: se alguém mudar o
banco ou as rotas sem regenerar, o pipeline falha.

## Solução de problemas

- **"Chrome/Edge não encontrado"** — instale um dos dois ou aponte `PUPPETEER_EXECUTABLE_PATH` para o executável.
- **"Falta docs/diagramas/dados/modelo.json"** — rode `npm run docs:modelo` em `backend/`.
- **"Geração interrompida — inconsistência"** — a mensagem diz o diagrama e o que não foi encontrado; ajuste o texto do
  diagrama ou o código.
- **Figura com texto pequeno** — o resumo de `npm run figuras` mostra o tamanho estimado do texto em A4 e marca
  "(pede zoom)" abaixo de 4 pt; as visões gerais (sitemap completo, DER geral, arquitetura funcional) têm versões por
  parte no próprio índice.
