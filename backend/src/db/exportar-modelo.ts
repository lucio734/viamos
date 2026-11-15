/**
 * Exporta o MODELO FÍSICO do banco (tabelas, colunas, PK/FK, índices, CHECKs e enums) e os parâmetros das
 * regras de negócio para `docs/diagramas/dados/modelo.json`.
 *
 * O arquivo gerado é a entrada do gerador de diagramas (`docs/diagramas/gerar.mjs`): o DER (#22) e o dicionário
 * de dados saem do `schema.ts` real, sem redigitação — é isso que garante o item #38 do checklist
 * ("esquema rigorosamente alinhado ao DER documentado").
 *
 * Não abre conexão com o banco: lê apenas as definições do Drizzle em memória.
 *
 * Uso (dentro de backend/):
 *   npm run docs:modelo               → grava o JSON
 *   npm run docs:modelo -- --verificar → compara com o JSON versionado e falha se estiver desatualizado
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getTableName, is, SQL } from 'drizzle-orm';
import { getTableConfig, isPgEnum, PgDialect, PgTable, type PgColumn } from 'drizzle-orm/pg-core';
import { REGRAS } from '../config/regras.js';
import * as esquema from '../models/schema.js';

const RAIZ_BACKEND = process.cwd();
const ARQUIVO_SCHEMA = resolve(RAIZ_BACKEND, 'src/models/schema.ts');
const ARQUIVO_SAIDA = resolve(RAIZ_BACKEND, '..', 'docs', 'diagramas', 'dados', 'modelo.json');

const dialeto = new PgDialect();

/** Converte um trecho SQL do Drizzle em texto legível (sem o prefixo "tabela". das colunas). */
function sqlParaTexto(trecho: unknown): string {
  try {
    const { sql: texto, params } = dialeto.sqlToQuery(trecho as SQL);
    let saida = texto;
    params.forEach((p, i) => {
      saida = saida.replace(`$${i + 1}`, typeof p === 'string' ? `'${p}'` : String(p));
    });
    return saida.replace(/"[a-z_]+"\."([a-z_]+)"/g, '$1').replace(/"([a-z_]+)"/g, '$1');
  } catch {
    return '[expressão SQL]';
  }
}

function padraoDaColuna(coluna: PgColumn): string | null {
  if (!coluna.hasDefault) return null;
  const valor = coluna.default as unknown;
  if (valor === undefined) return '[definido pela aplicação]';
  if (is(valor, SQL)) return sqlParaTexto(valor);
  return typeof valor === 'string' ? `'${valor}'` : String(valor);
}

/**
 * Lê o `schema.ts` como texto para recuperar o que não existe em tempo de execução:
 * a seção (comentário de cabeçalho) de cada tabela e o comentário de fim de linha de cada coluna.
 */
function lerAnotacoesDoFonte() {
  const linhas = readFileSync(ARQUIVO_SCHEMA, 'utf8').split(/\r?\n/);
  const secaoPorTabela = new Map<string, string>();
  const comentarioPorColuna = new Map<string, string>();
  let secaoAtual = '';
  let tabelaAtual = '';
  linhas.forEach((linha, i) => {
    // Cabeçalho de seção: linha de comentário logo após uma régua "// -----"
    if (/^\/\/ -{10,}/.test(linhas[i - 1] ?? '') && /^\/\/ \S/.test(linha)) secaoAtual = linha.replace(/^\/\/\s*/, '').trim();
    const tabela = /pgTable\(\s*$/.test(linha) ? /'([a-z_]+)'/.exec(linhas[i + 1] ?? '') : /pgTable\('([a-z_]+)'/.exec(linha);
    if (tabela) {
      tabelaAtual = tabela[1];
      secaoPorTabela.set(tabelaAtual, secaoAtual);
    }
    const coluna = /^\s+\w+: \w+\('([a-z_]+)'.*\/\/\s*(.+)$/.exec(linha);
    if (coluna && tabelaAtual) comentarioPorColuna.set(`${tabelaAtual}.${coluna[1]}`, coluna[2].trim());
  });
  return { secaoPorTabela, comentarioPorColuna };
}

function exportar() {
  const { secaoPorTabela, comentarioPorColuna } = lerAnotacoesDoFonte();
  const ordemNoFonte = [...secaoPorTabela.keys()];
  const objetos = Object.values(esquema) as unknown[];

  const enums = objetos
    .filter((o) => isPgEnum(o))
    .map((e) => ({ nome: e.enumName, valores: [...e.enumValues] }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const nomesDeEnum = new Set(enums.map((e) => e.nome));

  const tabelas = objetos
    .filter((o): o is PgTable => is(o, PgTable))
    .map((tabela) => {
      const cfg = getTableConfig(tabela);
      const chavesEstrangeiras = cfg.foreignKeys.map((fk) => {
        const ref = fk.reference();
        return {
          colunas: ref.columns.map((c) => c.name),
          tabelaReferenciada: getTableName(ref.foreignTable),
          colunasReferenciadas: ref.foreignColumns.map((c) => c.name),
          aoExcluir: fk.onDelete ?? 'no action',
        };
      });
      const colunasFk = new Set(chavesEstrangeiras.flatMap((fk) => fk.colunas));
      return {
        nome: cfg.name,
        secao: secaoPorTabela.get(cfg.name) ?? '',
        colunas: cfg.columns.map((c) => {
          const tipo = c.getSQLType();
          return {
            nome: c.name,
            tipo,
            enum: nomesDeEnum.has(tipo),
            chavePrimaria: c.primary,
            chaveEstrangeira: colunasFk.has(c.name),
            unica: c.isUnique,
            obrigatoria: c.notNull,
            padrao: padraoDaColuna(c),
            comentario: comentarioPorColuna.get(`${cfg.name}.${c.name}`) ?? null,
          };
        }),
        chavesEstrangeiras,
        indices: cfg.indexes.map((ix) => ({
          nome: ix.config.name ?? null,
          unico: ix.config.unique,
          colunas: ix.config.columns.map((c) => (is(c, SQL) ? sqlParaTexto(c) : (c as { name: string }).name)),
          condicao: ix.config.where ? sqlParaTexto(ix.config.where) : null,
        })),
        restricoesUnicas: cfg.uniqueConstraints.map((u) => ({ nome: u.name ?? null, colunas: u.columns.map((c) => c.name) })),
        checks: cfg.checks.map((ch) => ({ nome: ch.name, expressao: sqlParaTexto(ch.value) })),
      };
    })
    // Os exports de um módulo ES vêm em ordem alfabética; o DER segue a ordem de declaração do schema.ts.
    .sort((a, b) => ordemNoFonte.indexOf(a.nome) - ordemNoFonte.indexOf(b.nome));

  return {
    origem: 'backend/src/models/schema.ts + backend/src/config/regras.ts',
    geradoPor: 'backend/src/db/exportar-modelo.ts (npm run docs:modelo)',
    totais: { tabelas: tabelas.length, colunas: tabelas.reduce((n, t) => n + t.colunas.length, 0), chavesEstrangeiras: tabelas.reduce((n, t) => n + t.chavesEstrangeiras.length, 0), enums: enums.length },
    tabelas,
    enums,
    regras: REGRAS,
  };
}

const conteudo = `${JSON.stringify(exportar(), null, 2)}\n`;

if (process.argv.includes('--verificar')) {
  const atual = existsSync(ARQUIVO_SAIDA) ? readFileSync(ARQUIVO_SAIDA, 'utf8').replace(/\r\n/g, '\n') : '';
  if (atual !== conteudo) {
    console.error('docs/diagramas/dados/modelo.json está desatualizado em relação ao schema.ts. Rode: npm run docs:modelo');
    process.exit(1);
  }
  console.info('modelo.json está em dia com o schema.ts.');
} else {
  mkdirSync(dirname(ARQUIVO_SAIDA), { recursive: true });
  writeFileSync(ARQUIVO_SAIDA, conteudo, 'utf8');
  const m = JSON.parse(conteudo) as ReturnType<typeof exportar>;
  console.info(`Modelo exportado: ${m.totais.tabelas} tabelas, ${m.totais.colunas} colunas, ${m.totais.chavesEstrangeiras} FKs, ${m.totais.enums} enums → ${ARQUIVO_SAIDA}`);
}
