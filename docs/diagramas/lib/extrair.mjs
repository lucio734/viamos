/**
 * EXTRAÇÃO — lê o código-fonte do Víamos e devolve os fatos usados nos diagramas.
 * Nada aqui é digitado à mão: rotas, telas, navegação, endpoints, camadas e versões vêm dos arquivos reais.
 *
 *   extrairRotas       → frontend/src/rotas.tsx (SITEMAP + proteção por papel)
 *   extrairNavegacao   → <Link>, <NavLink>, <Navigate> e navigate() de cada tela (transições entre telas)
 *   extrairMenu        → frontend/src/components/AppShell.tsx (menu principal por papel)
 *   extrairApi         → backend/src/routes/index.ts (método, caminho, papel exigido, RF)
 *   extrairBackend     → camadas MVC, dependências entre serviços e funções exportadas
 *   extrairVersoes     → versões instaladas (package-lock.json)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const ler = (raiz, rel) => readFileSync(join(raiz, rel), 'utf8').replace(/\r\n/g, '\n');

function analisar(raiz, rel) {
  return ts.createSourceFile(rel, ler(raiz, rel), ts.ScriptTarget.Latest, true, rel.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}

function percorrer(no, visitar) {
  visitar(no);
  no.forEachChild((filho) => percorrer(filho, visitar));
}

const textoDe = (no) => (ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no) ? no.text : null);

// ---------------------------------------------------------------------------------------------------------
// Rotas (sitemap)
// ---------------------------------------------------------------------------------------------------------
export function extrairRotas(raiz) {
  const rel = 'frontend/src/rotas.tsx';
  const fonte = analisar(raiz, rel);
  const importacoes = new Map();
  let sitemap = null;
  const papeisPorArea = new Map();

  percorrer(fonte, (no) => {
    if (ts.isImportDeclaration(no) && no.importClause?.namedBindings && ts.isNamedImports(no.importClause.namedBindings)) {
      for (const el of no.importClause.namedBindings.elements) importacoes.set(el.name.text, no.moduleSpecifier.text);
    }
    if (ts.isVariableDeclaration(no) && no.name.getText() === 'SITEMAP' && no.initializer && ts.isObjectLiteralExpression(no.initializer)) sitemap = no.initializer;
    // { element: <Protegida papeis={[...]} />, children: [... SITEMAP.<area>.map ...] }
    if (ts.isObjectLiteralExpression(no)) {
      const texto = no.getText();
      const protegida = /<Protegida papeis=\{\[([^\]]*)\]\}/.exec(texto);
      const area = /SITEMAP\.(\w+)\.map/.exec(texto);
      if (protegida && area && !papeisPorArea.has(area[1])) papeisPorArea.set(area[1], protegida[1].split(',').map((p) => p.trim().replace(/'/g, '')).filter(Boolean));
    }
  });
  if (!sitemap) throw new Error(`SITEMAP não encontrado em ${rel}`);

  const rotas = [];
  for (const prop of sitemap.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isArrayLiteralExpression(prop.initializer)) continue;
    const area = prop.name.getText();
    for (const item of prop.initializer.elements) {
      if (!ts.isObjectLiteralExpression(item)) continue;
      const campos = Object.fromEntries(item.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(), p.initializer]));
      const componente = campos.element.getText().replace(/[<>/\s]/g, '');
      const modulo = importacoes.get(componente);
      rotas.push({
        area,
        path: textoDe(campos.path),
        nome: textoDe(campos.nome),
        componente,
        arquivo: modulo ? `frontend/src/${modulo.replace(/^\.\//, '')}.tsx` : null,
        papeis: papeisPorArea.get(area) ?? [],
      });
    }
  }
  for (const r of rotas) if (!r.arquivo || !existsSync(join(raiz, r.arquivo))) throw new Error(`Componente da rota ${r.path} não encontrado: ${r.arquivo}`);
  return rotas;
}

// ---------------------------------------------------------------------------------------------------------
// Navegação entre telas
// ---------------------------------------------------------------------------------------------------------
/** Resolve a expressão de destino em uma lista de alvos: rota (com :p nos trechos dinâmicos), papel, voltar ou dinâmico. */
function alvosDe(expr, fonte, nivel = 0) {
  if (!expr || nivel > 4) return [{ tipo: 'dinamico', texto: expr?.getText() ?? '?' }];
  if (ts.isJsxExpression(expr)) return alvosDe(expr.expression, fonte, nivel);
  if (ts.isParenthesizedExpression(expr)) return alvosDe(expr.expression, fonte, nivel);
  const literal = textoDe(expr);
  if (literal !== null) return [{ tipo: 'rota', valor: literal }];
  if (ts.isTemplateExpression(expr)) {
    return [{ tipo: 'rota', valor: expr.head.text + expr.templateSpans.map((s) => `:p${s.literal.text}`).join('') }];
  }
  if (ts.isConditionalExpression(expr)) return [...alvosDe(expr.whenTrue, fonte, nivel + 1), ...alvosDe(expr.whenFalse, fonte, nivel + 1)];
  if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const esq = alvosDe(expr.left, fonte, nivel + 1);
    const dir = alvosDe(expr.right, fonte, nivel + 1);
    const parte = (lista) => (lista.length === 1 && lista[0].tipo === 'rota' ? lista[0].valor : ':p');
    return [{ tipo: 'rota', valor: parte(esq) + parte(dir) }];
  }
  if (ts.isBinaryExpression(expr) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(expr.operatorToken.kind)) {
    return [...alvosDe(expr.left, fonte, nivel + 1), ...alvosDe(expr.right, fonte, nivel + 1)];
  }
  if (ts.isPrefixUnaryExpression(expr) || ts.isNumericLiteral(expr)) return [{ tipo: 'voltar' }];
  if (ts.isCallExpression(expr) && expr.expression.getText() === 'destinoPorPapel') return [{ tipo: 'papel' }];
  if (ts.isIdentifier(expr)) {
    // constante local: const destino = cond ? '/a' : '/b'
    let inicializador = null;
    percorrer(fonte, (no) => {
      if (ts.isVariableDeclaration(no) && no.name.getText() === expr.text && no.initializer) inicializador = no.initializer;
    });
    if (inicializador) {
      const resolvidos = alvosDe(inicializador, fonte, nivel + 1);
      if (resolvidos.every((a) => a.tipo !== 'dinamico')) return resolvidos;
    }
  }
  return [{ tipo: 'dinamico', texto: expr.getText() }];
}

/** Texto visível de um elemento JSX (ignora ícones); usado como rótulo do evento de clique. */
function textoVisivel(no) {
  const partes = [];
  const visitar = (n) => {
    if (ts.isJsxText(n)) partes.push(n.text);
    else if (ts.isJsxExpression(n) && n.expression) {
      const t = textoDe(n.expression);
      if (t !== null) partes.push(t);
      else if (ts.isTemplateExpression(n.expression)) partes.push(n.expression.head.text + n.expression.templateSpans.map((s) => `…${s.literal.text}`).join(''));
      else if (ts.isConditionalExpression(n.expression) && textoDe(n.expression.whenTrue) !== null) partes.push(textoDe(n.expression.whenTrue));
      else if (!ts.isJsxElement(n.expression) && !ts.isParenthesizedExpression(n.expression) && !ts.isBinaryExpression(n.expression)) partes.push('…'); // valor dinâmico
    } else if (ts.isJsxElement(n)) {
      // ícones (componente <Icone> ou <span class="material-symbols-…">) não são texto visível
      const abertura = n.openingElement;
      if (abertura.tagName.getText() !== 'Icone' && !abertura.getText().includes('material-symbols')) n.children.forEach(visitar);
    } else if (ts.isJsxFragment(n)) n.children.forEach(visitar);
  };
  if (ts.isJsxElement(no)) no.children.forEach(visitar);
  return limparRotulo(partes.join(' '));
}

/** Normaliza o rótulo: tira parênteses vazios, reticências repetidas e devolve '' quando não sobra palavra. */
function limparRotulo(texto) {
  const limpo = texto
    .replace(/\s+/g, ' ')
    .replace(/\(\s*…?\s*\)/g, '')
    .replace(/(…\s*)+/g, '… ')
    .replace(/\s+([:,.)])/g, '$1')
    .replace(/→/g, '')
    .trim();
  return /\p{L}{3,}/u.test(limpo) ? limpo.replace(/^[…·\s]+|[…·\s]+$/g, '').trim() : '';
}

function atributo(elementoAbertura, nome) {
  const attr = elementoAbertura.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === nome);
  return attr?.initializer ?? null;
}

function rotuloDoElemento(no) {
  const abertura = ts.isJsxElement(no) ? no.openingElement : no;
  const aria = atributo(abertura, 'aria-label');
  if (aria) {
    const expr = ts.isJsxExpression(aria) ? aria.expression : aria;
    const t = textoDe(expr) ?? (ts.isTemplateExpression(expr) ? expr.head.text : null);
    if (t) return limparRotulo(t);
  }
  return textoVisivel(no);
}

const encurtar = (s, n = 46) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function extrairNavegacaoDoArquivo(raiz, rel) {
  const fonte = analisar(raiz, rel);
  const linha = (no) => fonte.getLineAndCharacterOfPosition(no.getStart()).line + 1;
  const navegadores = new Set();
  percorrer(fonte, (no) => {
    if (ts.isVariableDeclaration(no) && no.initializer && ts.isCallExpression(no.initializer) && no.initializer.expression.getText() === 'useNavigate') navegadores.add(no.name.getText());
  });

  const achados = [];
  percorrer(fonte, (no) => {
    // <Link to=...>, <NavLink to=...>, <Navigate to=... />
    const abertura = ts.isJsxElement(no) ? no.openingElement : ts.isJsxSelfClosingElement(no) ? no : null;
    if (abertura) {
      const tag = abertura.tagName.getText();
      if (['Link', 'NavLink', 'Navigate'].includes(tag)) {
        const para = atributo(abertura, 'to');
        if (para) {
          const rotulo = tag === 'Navigate' ? '' : rotuloDoElemento(no);
          achados.push({ arquivo: rel, linha: linha(no), gatilho: tag === 'Navigate' ? 'redirecionamento' : 'clique', rotulo: encurtar(rotulo), alvos: alvosDe(para, fonte) });
        }
      }
      return;
    }
    // navigate('/x') — variável criada por useNavigate()
    if (ts.isCallExpression(no) && ts.isIdentifier(no.expression) && navegadores.has(no.expression.text) && no.arguments.length) {
      // contexto: dentro de um onClick={...} (clique) ou de uma função (após a ação concluir)
      let gatilho = 'acao';
      let rotulo = '';
      for (let pai = no.parent; pai; pai = pai.parent) {
        if (ts.isJsxAttribute(pai) && /^on[A-Z]/.test(pai.name.getText())) {
          gatilho = 'clique';
          const elemento = pai.parent.parent; // JsxAttributes → abertura
          rotulo = rotuloDoElemento(ts.isJsxOpeningElement(elemento) ? elemento.parent : elemento);
          break;
        }
        if (ts.isFunctionDeclaration(pai) && pai.name) {
          rotulo = `${pai.name.text}()`;
          break;
        }
        if (ts.isVariableDeclaration(pai) && pai.initializer && (ts.isArrowFunction(pai.initializer) || ts.isFunctionExpression(pai.initializer))) {
          rotulo = `${pai.name.getText()}()`;
          break;
        }
        if (ts.isCallExpression(pai) && pai.expression.getText() === 'useEffect') {
          gatilho = 'redirecionamento';
          break;
        }
      }
      achados.push({ arquivo: rel, linha: linha(no), gatilho, rotulo: encurtar(rotulo), alvos: alvosDe(no.arguments[0], fonte) });
    }
  });
  return achados;
}

/** Casa um destino (com :p nos trechos dinâmicos) com as rotas declaradas; devolve as rotas compatíveis. */
export function casarRota(valor, rotas) {
  const limpo = valor.split('?')[0].split('#')[0];
  const segmentos = (s) => s.split('/').filter(Boolean);
  const alvo = segmentos(limpo);
  if (limpo === '/' || limpo === '') return rotas.filter((r) => r.path === '/');
  // Compatível: mesmo número de segmentos e cada segmento igual, ou parâmetro de um dos lados.
  const compativeis = rotas
    .map((r) => {
      const rota = segmentos(r.path);
      if (rota.length !== alvo.length) return null;
      let pontos = 0;
      for (let i = 0; i < rota.length; i += 1) {
        const alvoDinamico = alvo[i].startsWith(':p');
        const rotaParametro = rota[i].startsWith(':');
        if (rota[i] === alvo[i]) pontos += 1;
        else if (alvoDinamico && rotaParametro) pontos += 0.5; // trecho dinâmico casa melhor com parâmetro (:id) do que com literal
        else if (!alvoDinamico && !rotaParametro) return null;
      }
      return { r, pontos };
    })
    .filter(Boolean);
  // Entre as compatíveis, vence a mais específica (mais segmentos literais iguais): /x/nova antes de /x/:id.
  const melhor = Math.max(0, ...compativeis.map((c) => c.pontos));
  return compativeis.filter((c) => c.pontos === melhor).map((c) => c.r);
}

/**
 * Monta as transições entre telas: para cada rota, os destinos alcançados a partir do seu componente.
 * Destinos ambíguos (componentes compartilhados que montam o caminho com o prefixo do papel) são resolvidos
 * para a rota da mesma área da tela de origem.
 */
export function extrairNavegacao(raiz, rotas) {
  const porArquivo = new Map();
  for (const r of rotas) if (!porArquivo.has(r.arquivo)) porArquivo.set(r.arquivo, extrairNavegacaoDoArquivo(raiz, r.arquivo));

  // Áreas restritas a um papel: a guarda <Protegida> impede que uma tela de um papel abra a área de outro.
  const AREAS_DE_PAPEL = ['cliente', 'interprete', 'backoffice'];
  const transicoes = [];
  const naoResolvidos = [];
  const descartadas = [];
  for (const origem of rotas) {
    for (const achado of porArquivo.get(origem.arquivo)) {
      for (const alvo of achado.alvos) {
        const base = { de: origem.path, gatilho: achado.gatilho, rotulo: achado.rotulo, arquivo: achado.arquivo, linha: achado.linha };
        if (alvo.tipo === 'voltar') transicoes.push({ ...base, para: '(voltar)' });
        else if (alvo.tipo === 'papel') transicoes.push({ ...base, para: '(hub do papel)' });
        else if (alvo.tipo === 'dinamico') transicoes.push({ ...base, para: '(dinâmico)', expressao: alvo.texto });
        else {
          let candidatas = casarRota(alvo.valor, rotas);
          if (candidatas.length > 1) {
            const mesmaArea = candidatas.filter((c) => c.area === origem.area);
            if (mesmaArea.length) candidatas = mesmaArea;
          }
          if (!candidatas.length) naoResolvidos.push({ ...base, destino: alvo.valor });
          for (const c of candidatas) {
            // Componentes compartilhados (Sala, Avaliar, Histórico) montam o caminho do outro papel em um ramo
            // condicional; esse ramo nunca é alcançado a partir desta tela.
            const outroPapel = AREAS_DE_PAPEL.includes(origem.area) && AREAS_DE_PAPEL.includes(c.area) && c.area !== origem.area;
            if (outroPapel) descartadas.push({ ...base, para: c.path, motivo: 'destino de outro papel (ramo condicional do componente compartilhado)' });
            else transicoes.push({ ...base, para: c.path });
          }
        }
      }
    }
  }
  return { transicoes, naoResolvidos, descartadas };
}

/** Menu principal por papel (AppShell): const NAV = { CLIENTE: [{ para, rotulo }], ... } + links fixos. */
export function extrairMenu(raiz) {
  const rel = 'frontend/src/components/AppShell.tsx';
  const fonte = analisar(raiz, rel);
  const menu = {};
  const arrays = new Map();
  const lerItens = (lista) =>
    lista.elements.filter(ts.isObjectLiteralExpression).map((o) => {
      const campos = Object.fromEntries(o.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(), textoDe(p.initializer)]));
      return { para: campos.para, rotulo: campos.rotulo };
    });
  percorrer(fonte, (no) => {
    if (ts.isVariableDeclaration(no) && no.initializer && ts.isArrayLiteralExpression(no.initializer)) arrays.set(no.name.getText(), lerItens(no.initializer));
  });
  percorrer(fonte, (no) => {
    if (ts.isVariableDeclaration(no) && no.name.getText() === 'NAV' && no.initializer && ts.isObjectLiteralExpression(no.initializer)) {
      for (const p of no.initializer.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const papel = p.name.getText();
        if (ts.isArrayLiteralExpression(p.initializer)) menu[papel] = lerItens(p.initializer);
        else if (ts.isIdentifier(p.initializer) && arrays.has(p.initializer.text)) menu[papel] = arrays.get(p.initializer.text);
        else if (ts.isPropertyAccessExpression(p.initializer)) menu[papel] = { igualA: p.initializer.name.text };
      }
    }
  });
  const fixos = extrairNavegacaoDoArquivo(raiz, rel).flatMap((a) => a.alvos.filter((x) => x.tipo === 'rota').map((x) => ({ para: x.valor, rotulo: a.rotulo, gatilho: a.gatilho })));
  return { arquivo: rel, porPapel: menu, fixos };
}

// ---------------------------------------------------------------------------------------------------------
// API (rotas do backend)
// ---------------------------------------------------------------------------------------------------------
export function extrairApi(raiz) {
  const rel = 'backend/src/routes/index.ts';
  const linhas = ler(raiz, rel).split('\n');
  const endpoints = [];
  let secao = '';
  linhas.forEach((linha, i) => {
    if (/^\/\/ -{10,}/.test(linhas[i - 1] ?? '') && /^\/\/ \S/.test(linha)) secao = linha.replace(/^\/\/\s*/, '').trim();
    const m = /^rotas\.(get|post|put|delete|patch)\('([^']+)',\s*(.*)\);\s*(?:\/\/\s*(.*))?$/.exec(linha);
    if (!m) return;
    const [, metodo, caminho, cadeia, comentario = ''] = m;
    const manipulador = /([a-z]+)\.(\w+)\s*$/.exec(cadeia.split(',').pop().trim());
    let acesso = 'público';
    if (cadeia.includes('...soCliente')) acesso = 'CLIENTE';
    else if (cadeia.includes('...soInterprete')) acesso = 'INTERPRETE';
    else if (cadeia.includes('...soOperador')) acesso = 'BACKOFFICE/SUPORTE';
    else if (/\bautenticar\b/.test(cadeia)) acesso = 'autenticado';
    endpoints.push({
      metodo: metodo.toUpperCase(),
      caminho: `/api${caminho}`,
      secao,
      acesso,
      controller: manipulador ? manipulador[1] : null,
      funcao: manipulador ? manipulador[2] : '(inline)',
      validacao: /validar\((\w+\.\w+)/.exec(cadeia)?.[1] ?? null,
      limiteTentativas: cadeia.includes('limiteAuth'),
      requisitos: [...comentario.matchAll(/RF\d+(?:[–-]RF\d+)?/g)].map((x) => x[0]),
      linha: i + 1,
    });
  });
  return endpoints;
}

// ---------------------------------------------------------------------------------------------------------
// Estrutura do backend (MVC) e do frontend
// ---------------------------------------------------------------------------------------------------------
const listarTs = (raiz, rel) => (existsSync(join(raiz, rel)) ? readdirSync(join(raiz, rel)).filter((f) => /\.tsx?$/.test(f)).sort() : []);

export function extrairBackend(raiz) {
  const base = 'backend/src';
  const camadas = {};
  for (const pasta of ['routes', 'middlewares', 'controllers', 'services', 'models', 'views', 'utils', 'config', 'db']) camadas[pasta] = listarTs(raiz, `${base}/${pasta}`);

  const exportadas = (rel) => [...ler(raiz, rel).matchAll(/^export (?:async )?function (\w+)|^export const (\w+)/gm)].map((m) => m[1] ?? m[2]);
  const internas = (rel) => [...ler(raiz, rel).matchAll(/^(?:async )?function (\w+)/gm)].map((m) => m[1]);

  const servicos = camadas.services.map((arquivo) => {
    const rel = `${base}/services/${arquivo}`;
    const texto = ler(raiz, rel);
    const cabecalho = /^\/\*\*([\s\S]*?)\*\//.exec(texto)?.[1] ?? '';
    // O que este serviço importa de cada outro: import { a, b } from './x.service.js' ou import * as x from './x.service.js'
    const importa = {};
    for (const m of texto.matchAll(/import \{([^}]*)\} from '\.\/(\w+)\.service\.js'/g)) importa[m[2]] = m[1].split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('type '));
    for (const m of texto.matchAll(/import \* as (\w+) from '\.\/(\w+)\.service\.js'/g)) importa[m[2]] = [...new Set([...texto.matchAll(new RegExp(`\\b${m[1]}\\.(\\w+)\\(`, 'g'))].map((x) => x[1]))];
    return {
      nome: arquivo.replace('.service.ts', ''),
      arquivo: rel,
      requisitos: [...new Set([...cabecalho.matchAll(/R(?:N)?F\d+(?:[–-]R(?:N)?F\d+)?/g)].map((m) => m[0]))],
      dependeDe: [...new Set([...texto.matchAll(/from '\.\/(\w+)\.service\.js'/g)].map((m) => m[1]))],
      importa,
      usaTabelas: [...new Set((/import \{([^}]*)\} from '\.\.\/models\/schema\.js'/.exec(texto.replace(/\n/g, ' '))?.[1] ?? '').split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('type ')))],
      funcoes: exportadas(rel),
      funcoesInternas: internas(rel),
    };
  });

  const controllers = camadas.controllers.map((arquivo) => {
    const rel = `${base}/controllers/${arquivo}`;
    const texto = ler(raiz, rel);
    // Para cada função do controller, quais funções de serviço ela chama (xService.funcao(...))
    const chamadas = {};
    for (const parte of texto.split(/^export (?:async )?function /m).slice(1)) {
      const nome = /^(\w+)/.exec(parte)[1];
      chamadas[nome] = [...new Set([...parte.matchAll(/(\w+)Service\.(\w+)\(/g)].map((m) => `${m[1]}.${m[2]}`))];
    }
    return {
      nome: arquivo.replace('.controller.ts', ''),
      arquivo: rel,
      chamadas,
      usaServicos: [...new Set([...texto.matchAll(/from '\.\.\/services\/(\w+)\.service\.js'/g)].map((m) => m[1]))],
      funcoes: exportadas(rel).filter((f) => !f.startsWith('esquema')),
      esquemas: exportadas(rel).filter((f) => f.startsWith('esquema')),
    };
  });

  const simbolos = {};
  for (const [pasta, arquivos] of Object.entries(camadas)) for (const a of arquivos) simbolos[`${base}/${pasta}/${a}`] = [...exportadas(`${base}/${pasta}/${a}`), ...internas(`${base}/${pasta}/${a}`)];
  simbolos['backend/src/app.ts'] = exportadas('backend/src/app.ts');

  return { camadas, servicos, controllers, simbolos, migracoes: readdirSync(join(raiz, 'backend/drizzle')).filter((f) => f.endsWith('.sql')).sort() };
}

export function extrairFrontend(raiz) {
  const base = 'frontend/src';
  const paginas = {};
  // ordenado para que a saída seja idêntica em qualquer sistema operacional
  const pastas = readdirSync(join(raiz, `${base}/pages`), { withFileTypes: true }).filter((p) => p.isDirectory()).map((p) => p.name).sort();
  for (const pasta of pastas) paginas[pasta] = listarTs(raiz, `${base}/pages/${pasta}`);
  return { paginas, componentes: listarTs(raiz, `${base}/components`), api: listarTs(raiz, `${base}/api`), utils: listarTs(raiz, `${base}/utils`), auth: listarTs(raiz, `${base}/auth`) };
}

// ---------------------------------------------------------------------------------------------------------
// Versões instaladas
// ---------------------------------------------------------------------------------------------------------
export function extrairVersoes(raiz) {
  const de = (projeto, pacotes) => {
    const lock = JSON.parse(ler(raiz, `${projeto}/package-lock.json`));
    return Object.fromEntries(pacotes.map((p) => [p, lock.packages?.[`node_modules/${p}`]?.version ?? null]));
  };
  const manifestoBackend = JSON.parse(ler(raiz, 'backend/package.json'));
  return {
    backend: de('backend', ['express', 'drizzle-orm', 'pg', 'zod', 'jsonwebtoken', 'bcryptjs', 'helmet', 'cors', 'express-rate-limit', 'pdfkit', 'typescript', 'vitest', 'supertest', 'drizzle-kit', 'tsx']),
    frontend: de('frontend', ['react', 'react-dom', 'react-router-dom', 'vite', 'tailwindcss', 'typescript', 'leaflet', 'react-leaflet', 'qrcode.react', 'html5-qrcode', 'oxlint']),
    node: manifestoBackend.engines?.node ?? null,
  };
}

/** Lê os arquivos de hospedagem para a arquitetura técnica (Render, Vercel, CI, docker-compose). */
export function extrairHospedagem(raiz) {
  const render = ler(raiz, 'render.yaml');
  const vercel = JSON.parse(ler(raiz, 'frontend/vercel.json'));
  const ci = existsSync(join(raiz, '.github/workflows/ci.yml')) ? ler(raiz, '.github/workflows/ci.yml') : '';
  const compose = ler(raiz, 'docker-compose.yml');
  const vite = ler(raiz, 'frontend/vite.config.ts');
  const envExemplo = ler(raiz, 'backend/.env.example');
  const pega = (texto, re) => re.exec(texto)?.[1]?.trim() ?? null;
  return {
    render: {
      servico: pega(render, /name:\s*(viamos-api)/),
      runtime: pega(render, /runtime:\s*(\w+)/),
      plano: pega(render, /plan:\s*(\w+)/),
      regiao: pega(render, /region:\s*(\w+)/),
      build: pega(render, /buildCommand:\s*(.+)/),
      start: pega(render, /startCommand:\s*(.+)/),
      health: pega(render, /healthCheckPath:\s*(\S+)/),
      banco: pega(render, /databases:\s*\n\s*- name:\s*(\S+)/),
    },
    vercel: { rewrite: vercel.rewrites?.[0] ?? null, cabecalhos: (vercel.headers?.[0]?.headers ?? []).map((h) => h.key) },
    ci: { imagemPostgres: pega(ci, /image:\s*(postgres:\S+)/), node: pega(ci, /node-version:\s*(\d+)/), passos: [...ci.matchAll(/- run: (.+)/g)].map((m) => m[1].trim()) },
    local: { imagemPostgres: pega(compose, /image:\s*(postgres:\S+)/), portaBanco: pega(compose, /-\s*"(\d+):5432"/), portaVite: pega(vite, /port:\s*(\d+)/), proxy: pega(vite, /target:\s*'([^']+)'/), portaApi: pega(envExemplo, /^PORT=(\d+)/m) },
  };
}
