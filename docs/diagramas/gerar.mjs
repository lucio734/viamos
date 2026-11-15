#!/usr/bin/env node
/**
 * GERADOR dos diagramas da Produção Técnica do Víamos (Bloco P1).
 *
 * Lê o código-fonte, extrai os fatos (rotas, navegação, API, camadas, versões e o modelo do banco exportado
 * pelo backend) e gera:
 *   docs/diagramas/fontes/*.mmd                      fontes Mermaid de cada diagrama
 *   docs/diagramas/dados/extracao.json               tudo o que foi extraído (rastreabilidade)
 *   docs/diagramas/dados/layout.json                 direção (LR/TB) escolhida para cada figura
 *   docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md     índice com figuras, legendas e fontes
 *   docs/producao-tecnica/tabelas/*.md               tabelas de apoio (dicionário de dados, rotas, API…)
 *   docs/producao-tecnica/figuras/*.png              figuras (somente com --figuras)
 *
 * Uso (dentro de docs/diagramas):
 *   npm run gerar       gera fontes, dados e tabelas
 *   npm run figuras     idem + renderiza os PNGs (e reavalia a direção de cada figura)
 *   npm run verificar   não grava nada; falha se algo versionado estiver diferente do que o código gera
 */
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagramaArquiteturaFuncional, diagramaArquiteturaTecnica, diagramaCase, diagramaContexto, diagramaMvc, diagramasDer, diagramasSitemap, diagramasTelas } from './lib/diagramas-estrutura.mjs';
import { diagramaMacroprocesso, diagramasEstados, diagramasFluxograma, diagramasOperacao } from './lib/diagramas-processo.mjs';
import { indiceDosDiagramas, tabelaApi, tabelaDicionarioDeDados, tabelaRotas, tabelaTecnologias, tabelaTransicoes } from './lib/documento.mjs';
import { extrairApi, extrairBackend, extrairFrontend, extrairHospedagem, extrairMenu, extrairNavegacao, extrairRotas, extrairVersoes } from './lib/extrair.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..').replace(/\\/g, '/');
const opcoes = new Set(process.argv.slice(2));
const lerTexto = (rel) => readFileSync(join(RAIZ, rel), 'utf8').replace(/\r\n/g, '\n');

// 1. Entradas ------------------------------------------------------------------------------------------
const ARQUIVO_MODELO = 'docs/diagramas/dados/modelo.json';
const ARQUIVO_LAYOUT = 'docs/diagramas/dados/layout.json';
if (!existsSync(join(RAIZ, ARQUIVO_MODELO))) {
  console.error(`Falta ${ARQUIVO_MODELO}. Gere com: cd backend && npm install && npm run docs:modelo`);
  process.exit(1);
}
const modelo = JSON.parse(lerTexto(ARQUIVO_MODELO));
const rotas = extrairRotas(RAIZ);
const navegacao = extrairNavegacao(RAIZ, rotas);
const menu = extrairMenu(RAIZ);
const api = extrairApi(RAIZ);
const backend = extrairBackend(RAIZ);
const frontend = extrairFrontend(RAIZ);
const versoes = extrairVersoes(RAIZ);
const hospedagem = extrairHospedagem(RAIZ);

// 2. Diagramas ------------------------------------------------------------------------------------------
const R = modelo.regras;
const semCase = [
  ...diagramasSitemap(rotas),
  ...diagramaArquiteturaFuncional(backend, api, frontend, rotas),
  ...diagramaArquiteturaTecnica(versoes, hospedagem, modelo),
  ...diagramaMvc(backend, frontend, api, modelo, hospedagem),
  ...diagramaMacroprocesso(R),
  ...diagramasFluxograma(R),
  ...diagramasDer(modelo),
  ...diagramasEstados(modelo),
  ...diagramasOperacao(R),
  ...diagramasTelas(rotas, navegacao, menu),
  ...diagramaContexto(api, hospedagem),
];
const totais = {
  tabelas: modelo.totais.tabelas,
  rotas: rotas.length,
  telas: new Set(rotas.map((r) => r.componente)).size,
  endpoints: api.length,
  transicoes: navegacao.transicoes.length,
  diagramas: semCase.length + 1,
};
const diagramas = [...semCase, ...diagramaCase(totais)].sort((a, b) => Number(a.item) - Number(b.item) || a.id.localeCompare(b.id));
const ids = diagramas.map((d) => d.id);

// Direção do layout: alguns diagramas servem tanto da esquerda para a direita (LR) quanto de cima para baixo (TB).
// O construtor deixa a marca __DIR__ e a lista `direcoes`; a escolhida fica registrada em dados/layout.json
// (reavaliada por `--figuras`, que renderiza as opções e fica com a de texto mais legível na página A4).
const layout = existsSync(join(RAIZ, ARQUIVO_LAYOUT)) ? JSON.parse(lerTexto(ARQUIVO_LAYOUT)) : {};
const comDirecao = (d, direcao) => d.modelo.replaceAll('__DIR__', direcao);
for (const d of diagramas) {
  if (!d.direcoes) continue;
  d.modelo = d.mermaid;
  d.direcao = d.direcoes.includes(layout[d.id]) ? layout[d.id] : d.direcoes[0];
  d.mermaid = comDirecao(d, d.direcao);
}

// 3. Validações: o que os diagramas citam precisa existir no código ----------------------------------------
const problemas = [];
for (const t of navegacao.naoResolvidos) problemas.push(`Navegação para rota inexistente: ${t.de} → ${t.destino} (${t.arquivo}:${t.linha})`);

const fontesBackend = Object.keys(backend.simbolos).map(lerTexto).join('\n');
const requisitosNoCodigo = new Set();
for (const m of fontesBackend.matchAll(/RF(\d+)(?:[–-]RF(\d+))?/g)) {
  for (let n = Number(m[1]); n <= Number(m[2] ?? m[1]); n += 1) requisitosNoCodigo.add(`RF${String(n).padStart(2, '0')}`);
}
for (const d of diagramas) {
  for (const [arquivo, nome] of d.simbolos ?? []) {
    if (!backend.simbolos[arquivo]) problemas.push(`${d.id}: arquivo citado não existe — ${arquivo}`);
    else if (!backend.simbolos[arquivo].includes(nome)) problemas.push(`${d.id}: função citada não existe — ${nome} em ${arquivo}`);
  }
  for (const codigo of d.codigos ?? []) if (!fontesBackend.includes(`'${codigo}'`)) problemas.push(`${d.id}: código de erro citado não existe no backend — ${codigo}`);
  for (const rf of d.requisitos ?? []) if (!requisitosNoCodigo.has(rf)) problemas.push(`${d.id}: requisito citado não aparece no código — ${rf}`);
  for (const [nomeEnum, valores] of Object.entries(d.enums ?? {})) {
    const doBanco = modelo.enums.find((e) => e.nome === nomeEnum);
    if (!doBanco) problemas.push(`${d.id}: enum citado não existe no banco — ${nomeEnum}`);
    else for (const v of valores) if (!doBanco.valores.includes(v)) problemas.push(`${d.id}: estado ${v} não existe no enum ${nomeEnum}`);
  }
}
for (const id of ids) if (ids.indexOf(id) !== ids.lastIndexOf(id)) problemas.push(`Identificador de diagrama repetido: ${id}`);
if (problemas.length) {
  console.error(`Geração interrompida — ${problemas.length} inconsistência(s) entre os diagramas e o código:\n  - ${problemas.join('\n  - ')}`);
  process.exit(1);
}

// 4. Figuras: escolhe a direção de cada diagrama "flexível" renderizando as opções --------------------------
const PASTA_FONTES = join(RAIZ, 'docs/diagramas/fontes');
const PASTA_FIGURAS = join(RAIZ, 'docs/producao-tecnica/figuras');
const figurasProntas = new Map(); // id → { arquivo, largura, altura } das figuras já renderizadas na avaliação
let pastaDeAvaliacao = null;
if (opcoes.has('--figuras')) {
  const { ajusteA4, renderizar } = await import('./lib/renderizar.mjs');
  const flexiveis = diagramas.filter((d) => d.direcoes);
  pastaDeAvaliacao = mkdtempSync(join(tmpdir(), 'viamos-layout-'));
  for (const d of flexiveis) for (const dir of d.direcoes) writeFileSync(join(pastaDeAvaliacao, `${d.id}@${dir}.mmd`), `${comDirecao(d, dir)}\n`);
  const { resultados } = await renderizar({ pastaFontes: pastaDeAvaliacao, pastaFiguras: pastaDeAvaliacao, ids: flexiveis.flatMap((d) => d.direcoes.map((dir) => `${d.id}@${dir}`)) });
  for (const d of flexiveis) {
    const opcoesDaFigura = d.direcoes.map((dir) => ({ dir, r: resultados.find((x) => x.id === `${d.id}@${dir}`) })).filter((o) => o.r?.ok);
    if (!opcoesDaFigura.length) continue; // o erro aparece na renderização final
    const melhor = opcoesDaFigura.reduce((a, b) => (ajusteA4(b.r).pontos > ajusteA4(a.r).pontos ? b : a));
    d.direcao = melhor.dir;
    d.mermaid = comDirecao(d, melhor.dir);
    figurasProntas.set(d.id, { arquivo: join(pastaDeAvaliacao, `${d.id}@${melhor.dir}.png`), largura: melhor.r.largura, altura: melhor.r.altura });
  }
}

// 5. Saídas ---------------------------------------------------------------------------------------------
const extracao = {
  origem: 'gerado por docs/diagramas/gerar.mjs a partir do código-fonte',
  totais,
  rotas,
  menu,
  navegacao,
  api,
  backend: { camadas: backend.camadas, servicos: backend.servicos, controllers: backend.controllers, migracoes: backend.migracoes },
  frontend,
  versoes,
  hospedagem,
};
const layoutAtual = Object.fromEntries(diagramas.filter((d) => d.direcoes).map((d) => [d.id, d.direcao]));
const saidas = new Map([
  ['docs/diagramas/dados/extracao.json', `${JSON.stringify(extracao, null, 2)}\n`],
  [ARQUIVO_LAYOUT, `${JSON.stringify(layoutAtual, null, 2)}\n`],
  ['docs/diagramas/DIAGRAMAS_PRODUCAO_TECNICA.md', indiceDosDiagramas(diagramas, totais)],
  ['docs/producao-tecnica/tabelas/dicionario-de-dados.md', tabelaDicionarioDeDados(modelo)],
  ['docs/producao-tecnica/tabelas/rotas-e-telas.md', tabelaRotas(rotas)],
  ['docs/producao-tecnica/tabelas/api.md', tabelaApi(api)],
  ['docs/producao-tecnica/tabelas/tecnologias.md', tabelaTecnologias(versoes, hospedagem, backend)],
  ['docs/producao-tecnica/tabelas/transicoes-de-telas.md', tabelaTransicoes(rotas, navegacao, menu)],
  ...diagramas.map((d) => [`docs/diagramas/fontes/${d.id}.mmd`, `${d.mermaid}\n`]),
]);
const sobrando = (pasta, extensao) => (existsSync(pasta) ? readdirSync(pasta).filter((f) => f.endsWith(extensao) && /^\d\d-/.test(f) && !ids.includes(f.slice(0, -extensao.length))) : []);

if (opcoes.has('--verificar')) {
  const diferentes = [...saidas].filter(([rel, conteudo]) => !existsSync(join(RAIZ, rel)) || lerTexto(rel) !== conteudo).map(([rel]) => rel);
  const orfaos = [...sobrando(PASTA_FONTES, '.mmd').map((f) => `docs/diagramas/fontes/${f}`), ...sobrando(PASTA_FIGURAS, '.png').map((f) => `docs/producao-tecnica/figuras/${f}`)];
  const semFigura = ids.filter((id) => !existsSync(join(PASTA_FIGURAS, `${id}.png`))).map((id) => `docs/producao-tecnica/figuras/${id}.png`);
  if (diferentes.length || orfaos.length || semFigura.length) {
    console.error('Diagramas desatualizados em relação ao código. Rode `npm run figuras` em docs/diagramas e versione o resultado.');
    for (const f of diferentes) console.error(`  diferente: ${f}`);
    for (const f of orfaos) console.error(`  sobrando:  ${f}`);
    for (const f of semFigura) console.error(`  faltando:  ${f}`);
    process.exit(1);
  }
  console.info(`OK — ${diagramas.length} diagramas, dados e tabelas estão em dia com o código (${totais.rotas} rotas, ${totais.endpoints} endpoints, ${totais.tabelas} tabelas).`);
  process.exit(0);
}

for (const [rel, conteudo] of saidas) {
  mkdirSync(dirname(join(RAIZ, rel)), { recursive: true });
  writeFileSync(join(RAIZ, rel), conteudo, 'utf8');
}
for (const f of sobrando(PASTA_FONTES, '.mmd')) rmSync(join(PASTA_FONTES, f));
for (const f of sobrando(PASTA_FIGURAS, '.png')) rmSync(join(PASTA_FIGURAS, f));
console.info(`Gerados ${diagramas.length} diagramas (.mmd), dados/extracao.json, o índice e 5 tabelas.`);
console.info(`Base: ${totais.rotas} rotas / ${totais.telas} telas · ${totais.transicoes} transições · ${totais.endpoints} endpoints · ${totais.tabelas} tabelas.`);
if (navegacao.descartadas.length) console.info(`Navegação: ${navegacao.descartadas.length} ramos de outro papel descartados (componentes compartilhados).`);

if (opcoes.has('--figuras')) {
  const { ajusteA4, renderizar } = await import('./lib/renderizar.mjs');
  const inicio = Date.now();
  mkdirSync(PASTA_FIGURAS, { recursive: true });
  // As figuras "flexíveis" já foram renderizadas na avaliação: basta copiar a opção escolhida.
  for (const [id, f] of figurasProntas) copyFileSync(f.arquivo, join(PASTA_FIGURAS, `${id}.png`));
  const { navegador, resultados: novos } = await renderizar({ pastaFontes: PASTA_FONTES, pastaFiguras: PASTA_FIGURAS, ids: ids.filter((id) => !figurasProntas.has(id)) });
  const resultados = [...novos, ...[...figurasProntas].map(([id, f]) => ({ id, ok: true, largura: f.largura, altura: f.altura }))].sort((a, b) => a.id.localeCompare(b.id));
  if (pastaDeAvaliacao) rmSync(pastaDeAvaliacao, { recursive: true, force: true });
  for (const r of resultados) {
    if (!r.ok) console.info(`  ERRO ${r.id}\n${r.erro}`);
    else {
      const a4 = ajusteA4(r);
      const direcao = layoutAtual[r.id] ? ` ${layoutAtual[r.id]}` : '   ';
      console.info(`  ok  ${`${r.id}.png`.padEnd(58)}${direcao}  ${`${r.largura}×${r.altura}`.padEnd(10)} A4 ${a4.orientacao.padEnd(8)} texto ≈ ${a4.pontos} pt${a4.pontos < 4 ? '  (pede zoom)' : ''}`);
    }
  }
  const falhas = resultados.filter((r) => !r.ok);
  console.info(`Figuras: ${resultados.length - falhas.length}/${resultados.length} em ${Math.round((Date.now() - inicio) / 1000)} s (navegador: ${navegador}).`);
  if (falhas.length) process.exit(1);
}
