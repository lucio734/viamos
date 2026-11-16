# Produção Técnica — documento e como regerar

Esta pasta guarda as fontes e o gerador do capítulo **Produção Técnica** do Víamos (itens #1 a #28 do checklist do Dossiê). As versões editável e em PDF ficam juntas no [índice do capítulo em Entregas](../../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/README.md). O documento segue o formato de `Entregas/modelo_entrega.docx`: Arial, subseções
"N.N Título." em negrito e itálico, figura com legenda "Figura NN: …" e linha "Fonte: …" logo abaixo, tabela com
título "Tabela NN – …" acima e explicações numeradas (i), (ii), (iii).

| Arquivo ou pasta | O que é | Como é produzido |
|---|---|---|
| [DOCX em Entregas](../../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/Viamos_Producao_Tecnica.docx) | Capítulo editável | `build/gerar_docx.py` |
| [PDF em Entregas](../../Entregas/Produ%C3%A7%C3%A3o%20T%C3%A9cnica/Viamos_Producao_Tecnica.pdf) | Capítulo para leitura | Microsoft Word ou LibreOffice Writer |
| `figuras/` | 34 diagramas gerados a partir do código (sitemap, arquiteturas, DER, estados, operação, telas, contexto…) | `docs/diagramas` → `npm run figuras` |
| `tabelas/` | Tabelas em Markdown geradas junto com os diagramas (dicionário de dados, rotas, API…) | `docs/diagramas` → `npm run figuras` |
| `figuras-entregas/` | 37 diagramas das entregas anteriores (casos de uso e classes de 30/09; contexto, BPMN, DFD e estados de 11/11) recortados dos PDFs vetoriais | `build/extrair_figuras_entregas.py` |
| `telas/` | 33 capturas do aplicativo rodando com o seed (celular 390×844; backoffice 1280×800) | `build/capturar_telas.mjs` |
| `build/` | Scripts do documento (`motor.py` aplica o formato do modelo; `telas.py` tem a ficha de cada tela) | — |

Os scripts leem os protótipos, a planilha, os PDFs históricos e o modelo de `docs/producao-tecnica/fontes/` e `Entregas/`. A geração grava as versões do capítulo em `Entregas/Produção Técnica/`.

## Onde cada item do checklist aparece

| Seção do documento | Itens do checklist |
|---|---|
| Introdução do capítulo | #1 |
| 1 Modelagem do Produto — 1.1 Sitemap, 1.2 Wireframe (30 telas + fichas), 1.3 Prototipação (Stitch + link do Figma) | #2 a #5 |
| 2 Arquitetura de Software — 2.1 Funcional, 2.2 Técnica, 2.3 MVC | #6 a #9 |
| 3 Engenharia de Requisitos — 3.1 RF, 3.2 RNF, 3.3 Associação RF × RNF, 3.4 Projeto Linear | #10 a #14 |
| 4 Modelagem de Processos e Fluxos — 4.1 Macroprocesso, 4.2 Fluxograma, 4.3 BPMN | #15 a #18 |
| 5 Diagramas e Modelagem de Software — 5.1 Caso de Uso (com tabela por tela), 5.2 Classe, 5.3 DER, 5.4 Estados, 5.5 Operação, 5.6 DFD, 5.7 Processos (telas), 5.8 Ferramenta CASE, 5.9 Contexto | #19 a #28 |

As divergências entre as entregas anteriores e o aplicativo implementado estão escritas no próprio documento
(tabela de divergências do diagrama de classes e nota do DFD sobre o momento do comprovante, pendência P-06).

## Como regerar (na raiz do repositório)

Pré-requisitos: Node.js 22, Python 3.10+ e Google Chrome ou Microsoft Edge. Para exportar o PDF, use Word (Windows) ou LibreOffice Writer.

1. **Diagramas e tabelas do código** — só quando o código, o schema ou as regras mudarem:

   ```bash
   cd backend && npm run docs:modelo && cd ../docs/diagramas && npm ci && npm run figuras
   ```

2. **Capturas das telas** — com a API e o frontend rodando localmente sobre o seed
   (`backend`: `npm run db:reset` e `npm run dev`; `frontend`: `npm run dev`, em http://localhost:5173):

   ```bash
   node docs/producao-tecnica/build/capturar_telas.mjs
   ```

   O script usa o Puppeteer instalado em `docs/diagramas` (rode `npm ci` lá uma vez) e entra só com as contas
   fictícias do seed. Um terceiro argumento refaz só as telas cujo nome casar com a expressão, por exemplo
   `node docs/producao-tecnica/build/capturar_telas.mjs http://localhost:5173 "^1[0-5]-"`.

3. **Diagramas das entregas anteriores** — só se os PDFs em `Entregas/` mudarem:

   ```bash
   python -m pip install pymupdf pillow
   python docs/producao-tecnica/build/extrair_figuras_entregas.py
   ```

4. **Documento**:

   ```bash
   python -m pip install python-docx openpyxl pillow
   python docs/producao-tecnica/build/gerar_docx.py
   ```

5. **PDF** usando Word no Windows:

   ```bash
   powershell -ExecutionPolicy Bypass -File docs/producao-tecnica/build/exportar_pdf.ps1
   ```

   Se usar LibreOffice Writer, abra o DOCX e exporte o PDF para a mesma pasta em `Entregas/`. Confira as legendas, tabelas e orientação das páginas na edição exportada.

6. **Exportação pelo GitHub Actions.** Na aba **Actions**, abra **Gerar Produção Técnica** e execute o workflow na `main`. O campo `figma_url` recebe a URL pública do protótipo quando estiver disponível. O artefato `viamos-producao-tecnica` contém o DOCX e o PDF, e `viamos-producao-tecnica-revisao` guarda as páginas renderizadas durante sete dias. Depois da conferência, publique a edição em `Entregas/Produção Técnica/`.

As imagens são reduzidas para 250 dpi no tamanho em que aparecem na página (diagramas em tons de cinza, capturas em
256 cores) e ficam em cache em `build/tmp/`, que não é versionado.

## Ajustes no texto

- **Não edite o `.docx` à mão**: a próxima geração sobrescreve. O texto das seções está em `build/gerar_docx.py` e a
  ficha de cada tela (descrição, componentes, requisitos, caso de uso, fluxo e exceções) em `build/telas.py`. Os
  códigos de erro citados nas fichas foram conferidos no código do backend.
- **Link do Figma (P-01)**: preencha `FIGMA_URL` no topo de `build/gerar_docx.py` (ou a variável de ambiente
  `VIAMOS_FIGMA_URL`) e rode os passos 4 e 5. Enquanto estiver vazio, o documento mostra um aviso no lugar do link.
- **Linhas "Fonte:"** seguem o modelo: "Autoria própria apoiado por IA generativa (…)" para o que foi produzido com
  IA e "Autoria própria (…)" para capturas do aplicativo e para a planilha de requisitos.
