/**
 * CONSTRUTORES (estrutura) — transformam os fatos extraídos do código em diagramas Mermaid:
 * sitemap (#3), arquitetura funcional/técnica/MVC (#7–#9), DER (#22), processos de telas (#26) e ferramenta CASE (#27).
 *
 * Cada construtor devolve uma lista de { id, item, titulo, legenda, mermaid }.
 * `id` vira o nome do arquivo (fontes/<id>.mmd e figuras/<id>.png); `item` é o número no checklist do professor.
 */

/** Rótulo entre aspas para o Mermaid (aspas internas viram entidade). */
export const q = (s) => `"${String(s).replace(/"/g, '#quot;')}"`;

/** Quebra o texto em linhas de até `n` caracteres (nos espaços) para as caixas não ficarem largas demais. */
export function quebrar(texto, n = 30) {
  const linhas = [];
  let atual = '';
  for (const palavra of String(texto).split(' ')) {
    if (atual && `${atual} ${palavra}`.length > n) {
      linhas.push(atual);
      atual = palavra;
    } else atual = atual ? `${atual} ${palavra}` : palavra;
  }
  if (atual) linhas.push(atual);
  return linhas.join('<br/>');
}

/** Junta requisitos em faixas: [RF10–RF19, RF15, RF16] → "RF10–RF19"; [RF26, RF27, RF35] → "RF26, RF27, RF35". */
export function compactarRequisitos(lista) {
  const grupos = { RF: new Set(), RNF: new Set() };
  for (const item of lista) {
    const m = /^(RN?F)(\d+)(?:[–-]RN?F(\d+))?$/.exec(item);
    if (!m) continue;
    for (let n = Number(m[2]); n <= Number(m[3] ?? m[2]); n += 1) grupos[m[1]].add(n);
  }
  const faixas = (prefixo, numeros) => {
    const ordenados = [...numeros].sort((a, b) => a - b);
    const nome = (n) => `${prefixo}${String(n).padStart(2, '0')}`;
    const saida = [];
    for (let i = 0; i < ordenados.length; i += 1) {
      let j = i;
      while (ordenados[j + 1] === ordenados[j] + 1) j += 1;
      if (j - i >= 2) saida.push(`${nome(ordenados[i])}–${nome(ordenados[j])}`);
      else for (let k = i; k <= j; k += 1) saida.push(nome(ordenados[k]));
      i = j;
    }
    return saida;
  };
  return [...faixas('RF', grupos.RF), ...faixas('RNF', grupos.RNF)].join(', ');
}
const idRota = (p) => `r_${p === '/' ? 'raiz' : p.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;
const segmentos = (p) => p.split('/').filter(Boolean);
const agrupar = (lista, chave) => lista.reduce((m, x) => m.set(chave(x), [...(m.get(chave(x)) ?? []), x]), new Map());
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export const AREAS = {
  publico: { titulo: 'Área pública (sem login)', acesso: 'qualquer visitante' },
  cliente: { titulo: 'Área do cliente', acesso: 'papel CLIENTE' },
  interprete: { titulo: 'Área do intérprete', acesso: 'papel INTERPRETE' },
  backoffice: { titulo: 'Backoffice', acesso: 'papéis BACKOFFICE e SUPORTE' },
  comum: { titulo: 'Telas comuns', acesso: 'qualquer papel autenticado' },
};

const ESTILO_FLUXO = [
  '  classDef hub fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;',
  '  classDef externo fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;',
  '  classDef destaque fill:#f2f2f2,stroke:#111,stroke-width:1.5px,color:#111;',
];

// ---------------------------------------------------------------------------------------------------------
// #3 — Sitemap
// ---------------------------------------------------------------------------------------------------------
/** Pai de uma rota = rota da mesma área cujo caminho é o maior prefixo (por segmentos) do caminho dela. */
function paiDaRota(rota, rotas) {
  const meus = segmentos(rota.path);
  let melhor = null;
  for (const c of rotas) {
    if (c === rota || c.area !== rota.area) continue;
    const s = segmentos(c.path);
    if (s.length < meus.length && s.every((x, i) => x === meus[i]) && (!melhor || s.length > segmentos(melhor.path).length)) melhor = c;
  }
  return melhor;
}

const noRota = (r) => `${idRota(r.path)}[${q(`<b>${r.nome}</b><br/>${r.path}`)}]`;

export function diagramasSitemap(rotas) {
  const porArea = agrupar(rotas, (r) => r.area);
  const raizDaArea = (area) => porArea.get(area).find((r) => !paiDaRota(r, rotas));
  const login = rotas.find((r) => r.path === '/login');
  const areasDePapel = [...porArea.keys()].filter((a) => a !== 'publico' && a !== 'comum');

  // Mapa completo -----------------------------------------------------------------------------------
  // Para caber na página, as rotas filhas mostram só o trecho que acrescentam ao caminho da rota-mãe (…/sala).
  const noCompacto = (r) => {
    const pai = paiDaRota(r, rotas);
    const caminho = pai && pai.path !== '/' ? `…${r.path.slice(pai.path.length)}` : r.path;
    return `${idRota(r.path)}[${q(`<b>${r.nome}</b><br/>${caminho}`)}]`;
  };
  const linhas = ['flowchart LR', ...ESTILO_FLUXO];
  for (const [area, lista] of porArea) {
    linhas.push(`  subgraph sg_${area}[${q(`${AREAS[area].titulo} · ${plural(lista.length, 'rota', 'rotas')}`)}]`);
    for (const r of lista) linhas.push(`    ${noCompacto(r)}`);
    linhas.push('  end');
  }
  for (const r of rotas) {
    const pai = paiDaRota(r, rotas);
    if (pai) linhas.push(`  ${idRota(pai.path)} --> ${idRota(r.path)}`);
  }
  for (const area of areasDePapel) {
    const raiz = raizDaArea(area);
    linhas.push(`  ${idRota(login.path)} ==>|${q(`login · ${raiz.papeis.join(' / ')}`)}| ${idRota(raiz.path)}`);
    linhas.push(`  class ${idRota(raiz.path)} hub;`);
  }
  for (const r of porArea.get('comum') ?? []) linhas.push(`  ${idRota(login.path)} -.->|"sessão ativa"| ${idRota(r.path)}`);
  linhas.push(`  class ${idRota('/')} hub;`);

  const telas = new Set(rotas.map((r) => r.componente)).size;
  const diagramas = [
    {
      id: '03-sitemap-completo',
      item: '3',
      titulo: 'Sitemap completo da aplicação',
      legenda:
        `Gerado de \`frontend/src/rotas.tsx\`: ${rotas.length} rotas (${telas} telas distintas) em ${porArea.size} áreas. ` +
        'Setas finas: hierarquia de URL (a rota de destino é filha da de origem; as filhas mostram só o trecho que acrescentam ao caminho, como `…/sala`). ' +
        'Setas grossas: entrada na área após o login, com o papel exigido pela guarda `Protegida`. Setas tracejadas: telas comuns, acessíveis a qualquer papel com sessão ativa. ' +
        'Os caminhos completos estão nas figuras de cada área e em `docs/producao-tecnica/tabelas/rotas-e-telas.md`.',
      mermaid: linhas.join('\n'),
    },
  ];

  // Uma parte por área (os "prints de cada parte" pedidos no item #3) -------------------------------
  for (const area of ['publico', ...areasDePapel]) {
    const lista = porArea.get(area);
    const papeis = lista[0].papeis;
    const comuns = area === 'publico' ? [] : (porArea.get('comum') ?? []).filter((r) => r.papeis.some((p) => papeis.includes(p)));
    const l = ['flowchart TD', ...ESTILO_FLUXO];
    if (area !== 'publico') l.push(`  entrada([${q(`${login.path} — autenticação`)}]):::externo`);
    l.push(`  subgraph sg_${area}[${q(`${AREAS[area].titulo} — ${AREAS[area].acesso}`)}]`);
    for (const r of lista) l.push(`    ${noRota(r)}`);
    l.push('  end');
    for (const r of lista) {
      const pai = paiDaRota(r, rotas);
      if (pai) l.push(`  ${idRota(pai.path)} --> ${idRota(r.path)}`);
    }
    const raiz = raizDaArea(area);
    l.push(`  class ${idRota(raiz.path)} hub;`);
    if (area !== 'publico') l.push(`  entrada ==>|${q(papeis.join(' / '))}| ${idRota(raiz.path)}`);
    if (comuns.length) {
      l.push(`  subgraph sg_comum[${q('Telas comuns (qualquer papel autenticado)')}]`);
      for (const r of comuns) l.push(`    ${noRota(r)}`);
      l.push('  end');
      for (const r of comuns) l.push(`  ${idRota(raiz.path)} -.-> ${idRota(r.path)}`);
    }
    diagramas.push({
      id: `03-sitemap-${area}`,
      item: '3',
      titulo: `Sitemap — ${AREAS[area].titulo.toLowerCase()}`,
      legenda: `Parte do sitemap: ${plural(lista.length, 'rota', 'rotas')} de acesso por ${AREAS[area].acesso}${comuns.length ? `, mais ${plural(comuns.length, 'tela comum', 'telas comuns')}` : ''}.`,
      mermaid: l.join('\n'),
    });
  }
  return diagramas;
}

// ---------------------------------------------------------------------------------------------------------
// #22 — Diagrama Entidade-Relacionamento (a partir de dados/modelo.json)
// ---------------------------------------------------------------------------------------------------------
const TIPOS_ER = { 'timestamp with time zone': 'timestamptz', 'double precision': 'float8' };

/** O erDiagram do Mermaid não aceita espaço nem vírgula no tipo: normaliza e devolve o detalhe à parte. */
function tipoEr(tipo) {
  if (TIPOS_ER[tipo]) return { tipo: TIPOS_ER[tipo] };
  if (/^numeric\(/.test(tipo)) return { tipo: 'numeric' };
  return { tipo: tipo.replace(/\s+/g, '_') };
}

/** Linha de atributo: tipo, nome e chaves. Obrigatoriedade, padrão e precisão ficam no dicionário de dados. */
function atributoEr(tabela, coluna) {
  const { tipo } = tipoEr(coluna.tipo);
  const chaves = [coluna.chavePrimaria && 'PK', coluna.chaveEstrangeira && 'FK', !coluna.chavePrimaria && (coluna.unica || tabela.indices.some((i) => i.unico && !i.condicao && i.colunas.length === 1 && i.colunas[0] === coluna.nome)) && 'UK'].filter(Boolean);
  return `    ${tipo} ${coluna.nome}${chaves.length ? ` ${chaves.join(', ')}` : ''}`;
}

/** Relacionamento em notação pé-de-galinha: linha contínua = identificador (a FK faz parte da PK da filha). */
function relacionamentoEr(tabela, fk, comRotulo = true) {
  const coluna = tabela.colunas.find((c) => c.nome === fk.colunas[0]);
  const ladoPai = coluna.obrigatoria ? '||' : '|o';
  const umParaUm = coluna.chavePrimaria || coluna.unica;
  const ladoFilha = umParaUm ? 'o|' : 'o{';
  const linha = coluna.chavePrimaria ? '--' : '..';
  return `  ${fk.tabelaReferenciada} ${ladoPai}${linha}${ladoFilha} ${tabela.nome} : ${q(comRotulo ? fk.colunas.join(', ') : ' ')}`;
}

const slug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function diagramasDer(modelo) {
  const tabelas = modelo.tabelas;
  const porNome = new Map(tabelas.map((t) => [t.nome, t]));
  const diagramas = [];

  // Visão geral: as 27 entidades e todos os relacionamentos, sem atributos -----------------------------
  const geral = ['erDiagram', '  direction __DIR__'];
  for (const t of tabelas) for (const fk of t.chavesEstrangeiras) geral.push(relacionamentoEr(t, fk, false));
  diagramas.push({
    id: '22-der-visao-geral',
    item: '22',
    titulo: `DER — visão geral (${modelo.totais.tabelas} tabelas e seus relacionamentos)`,
    legenda:
      `Gerado de \`backend/src/models/schema.ts\`: ${modelo.totais.tabelas} tabelas, ${modelo.totais.colunas} colunas, ${modelo.totais.chavesEstrangeiras} chaves estrangeiras e ${modelo.totais.enums} tipos enumerados. ` +
      'Esta visão mostra só as entidades e os relacionamentos; os atributos e o nome de cada chave estrangeira estão nas visões por domínio e no dicionário de dados. ' +
      'Notação pé-de-galinha: linha contínua = relacionamento identificador (a FK compõe a PK da filha); linha tracejada = não identificador; "o" = opcional.',
    mermaid: geral.join('\n'),
    direcoes: ['LR', 'TB'],
  });

  // Uma visão por domínio (seções do schema.ts), com todos os atributos ------------------------------
  const secoes = [...agrupar(tabelas, (t) => t.secao)];
  secoes.forEach(([secao, lista], i) => {
    const nomes = new Set(lista.map((t) => t.nome));
    const l = ['erDiagram', '  direction __DIR__'];
    const vizinhas = new Set();
    // Entram os relacionamentos das tabelas do domínio (as FKs que elas declaram). Assim cada FK aparece
    // em uma única visão por domínio — a da tabela filha — e as tabelas referenciadas de fora viram contexto.
    for (const t of lista) {
      for (const fk of t.chavesEstrangeiras) {
        l.push(relacionamentoEr(t, fk));
        if (!nomes.has(fk.tabelaReferenciada)) vizinhas.add(fk.tabelaReferenciada);
      }
    }
    for (const t of lista) {
      l.push(`  ${t.nome} {`);
      for (const c of t.colunas) l.push(atributoEr(t, c));
      l.push('  }');
    }
    // Entidades de outros domínios aparecem só com a chave primária, para dar contexto ao relacionamento
    for (const nome of vizinhas) {
      const t = porNome.get(nome);
      l.push(`  ${nome} {`);
      for (const c of t.colunas.filter((x) => x.chavePrimaria)) l.push(atributoEr(t, c));
      l.push('  }');
    }
    const restricoes = lista.flatMap((t) => [...t.checks.map((c) => `CHECK ${t.nome}: ${c.expressao}`), ...t.indices.filter((x) => x.unico).map((x) => `UNIQUE ${t.nome}(${x.colunas.join(', ')})${x.condicao ? ` WHERE ${x.condicao}` : ''}`)]);
    diagramas.push({
      id: `22-der-${i + 1}-${slug(secao)}`,
      item: '22',
      titulo: `DER — ${secao}`,
      legenda:
        `Tabelas do domínio, com todos os atributos: ${lista.map((t) => `\`${t.nome}\``).join(', ')}. ` +
        (vizinhas.size ? `Tabelas de outros domínios referenciadas por elas (só com a PK, para contexto): ${[...vizinhas].map((n) => `\`${n}\``).join(', ')}. ` : '') +
        (restricoes.length ? `Regras de integridade além de PK/FK: ${restricoes.map((r) => `\`${r}\``).join('; ')}.` : ''),
      mermaid: l.join('\n'),
      direcoes: ['LR', 'TB'],
    });
  });
  return diagramas;
}

// ---------------------------------------------------------------------------------------------------------
// #7 — Arquitetura funcional (módulos = serviços do backend; integrações = importações entre serviços)
// ---------------------------------------------------------------------------------------------------------
/** Nome de negócio e grupo de cada serviço. Um serviço novo sem entrada aqui interrompe a geração (de propósito). */
export const MODULOS = {
  auth: { rotulo: 'Autenticação e sessão', grupo: 'acesso' },
  cadastro: { rotulo: 'Cadastro e envio da certificação', grupo: 'acesso' },
  perfil: { rotulo: 'Perfil, consentimentos e direitos LGPD', grupo: 'acesso' },
  solicitacao: { rotulo: 'Solicitação, estimativa e distribuição', grupo: 'contratacao' },
  demanda: { rotulo: 'Demandas, aceite exclusivo e agenda', grupo: 'contratacao' },
  atendimento: { rotulo: 'Atendimento presencial: sala, check-in, encerramento e suporte', grupo: 'execucao' },
  avaliacao: { rotulo: 'Avaliação bilateral e reputação', grupo: 'execucao' },
  pagamento: { rotulo: 'Pagamento, ganhos e repasse', grupo: 'financeiro' },
  comprovante: { rotulo: 'Comprovante e verificação pública', grupo: 'financeiro' },
  backoffice: { rotulo: 'Habilitação de intérpretes, chamados e indicadores', grupo: 'operacao' },
  auditoria: { rotulo: 'Trilha de auditoria', grupo: 'transversal' },
  notificacao: { rotulo: 'Notificações', grupo: 'transversal' },
  gateway: { rotulo: 'Adaptador do gateway de pagamento', grupo: 'adaptador' },
  email: { rotulo: 'Adaptador de e-mail', grupo: 'adaptador' },
};
const GRUPOS = {
  acesso: 'Acesso e cadastro',
  contratacao: 'Contratação',
  execucao: 'Execução presencial',
  financeiro: 'Financeiro e comprovação',
  operacao: 'Operação (backoffice)',
  transversal: 'Serviços transversais',
  adaptador: 'Adaptadores de serviços externos',
};
/** Como a rota restringe o acesso (lido de routes/index.ts) → nome usado nos rótulos. */
const ACESSO = { CLIENTE: 'cliente', INTERPRETE: 'intérprete', 'BACKOFFICE/SUPORTE': 'operador', autenticado: 'qualquer papel', público: 'público' };

export function diagramaArquiteturaFuncional(backend, api, frontend, rotas) {
  for (const s of backend.servicos) if (!MODULOS[s.nome]) throw new Error(`Serviço sem módulo de negócio definido em MODULOS: ${s.nome}.service.ts`);

  // endpoint → serviço(s) chamados pelo controller; daí sai, por módulo, quantos endpoints o acionam e com que acesso
  const uso = new Map(backend.servicos.map((s) => [s.nome, { endpoints: 0, acessos: {} }]));
  for (const e of api) {
    const ctrl = backend.controllers.find((c) => c.nome === e.controller);
    const servicos = new Set((ctrl?.chamadas[e.funcao] ?? []).map((x) => x.split('.')[0]));
    for (const nome of servicos) {
      const u = uso.get(nome);
      if (!u) continue;
      u.endpoints += 1;
      u.acessos[e.acesso] = (u.acessos[e.acesso] ?? 0) + 1;
    }
  }

  const transversais = backend.servicos.filter((s) => MODULOS[s.nome].grupo === 'transversal').map((s) => s.nome);
  const grupoDe = (nome) => MODULOS[nome].grupo;
  const totalTelas = new Set(rotas.map((r) => r.componente)).size;

  // Diagrama em faixas, de cima para baixo, com dois grupos de módulos por faixa. Para o Mermaid manter as
  // faixas, nenhum módulo se liga a um nó de fora do seu grupo: a integração entre grupos é uma seta de grupo
  // para grupo, rotulada com os módulos e as funções envolvidas. A ordem das faixas faz todas essas setas
  // apontarem para baixo (quem usa fica acima de quem é usado).
  const FAIXAS = [['contratacao', 'financeiro'], ['execucao', 'operacao'], ['acesso', 'transversal'], ['adaptador']];
  const ORDEM = FAIXAS.flat();
  for (const g of Object.keys(GRUPOS)) if (!ORDEM.includes(g)) throw new Error(`Grupo sem posição em FAIXAS: ${g}`);

  const l = ['flowchart TB', ...ESTILO_FLUXO];
  l.push(`  subgraph sg_interface[${q('Interface e recursos do aparelho')}]`);
  l.push(`    spa[${q(`<b>Interface web (SPA)</b><br/>${totalTelas} telas · ${rotas.length} rotas · cliente, intérprete e operador`)}]:::hub`);
  l.push(`    gps[${q('GPS do aparelho<br/>check-in e localização')}]:::externo`);
  l.push(`    camera[${q('Câmera<br/>leitura do QR Code')}]:::externo`);
  l.push(`    osm[${q('OpenStreetMap e Nominatim<br/>mapa e busca de endereço')}]:::externo`);
  l.push('    spa -.-> gps & camera & osm');
  l.push('  end');

  l.push(`  subgraph sg_api[${q(`Backend — API REST · ${plural(api.length, 'endpoint', 'endpoints')} · ${plural(backend.servicos.length, 'módulo', 'módulos')}`)}]`);
  for (const grupo of ORDEM) {
    const membros = backend.servicos.filter((s) => grupoDe(s.nome) === grupo);
    if (!membros.length) continue;
    l.push(`    subgraph sg_${grupo}[${q(GRUPOS[grupo])}]`);
    for (const s of membros) {
      const u = uso.get(s.nome);
      const linhas = [`<b>${quebrar(MODULOS[s.nome].rotulo, 28)}</b>`, compactarRequisitos(s.requisitos)];
      if (u.endpoints) {
        // "5 cliente · 5 intérprete" e, se não couber, o restante na linha de baixo (sem partir uma unidade ao meio)
        const unidades = Object.keys(ACESSO).filter((a) => u.acessos[a]).map((a) => `${u.acessos[a]} ${ACESSO[a]}`);
        const linhasDeAcesso = [];
        for (const unidade of unidades) {
          const ultima = linhasDeAcesso.length - 1;
          if (ultima >= 0 && `${linhasDeAcesso[ultima]} · ${unidade}`.length <= 30) linhasDeAcesso[ultima] += ` · ${unidade}`;
          else linhasDeAcesso.push(unidade);
        }
        linhas.push(`${plural(u.endpoints, 'endpoint', 'endpoints')}: ${linhasDeAcesso[0]}`, ...linhasDeAcesso.slice(1));
      }
      if (grupo === 'transversal') {
        const clientes = backend.servicos.filter((x) => x.dependeDe.includes(s.nome)).length;
        linhas.push(`chamado por ${plural(clientes, 'módulo', 'módulos')}`);
      }
      l.push(`      m_${s.nome}[${q(linhas.filter(Boolean).join('<br/>'))}]`);
    }
    // integrações dentro do grupo: importações entre serviços da mesma faixa
    for (const s of membros) {
      for (const dep of s.dependeDe) {
        if (grupoDe(dep) === grupo) l.push(`      m_${s.nome} -->|${q((s.importa[dep] ?? []).join(', ') || 'usa')}| m_${dep}`);
      }
    }
    l.push('    end');
  }
  // mantém cada faixa abaixo da anterior (ligações invisíveis entre os grupos de faixas vizinhas)
  for (let i = 1; i < FAIXAS.length; i += 1) for (const acima of FAIXAS[i - 1]) for (const abaixo of FAIXAS[i]) l.push(`    sg_${acima} ~~~ sg_${abaixo}`);
  // integrações entre grupos (os transversais ficam fora: quase todos os módulos os chamam)
  for (const s of backend.servicos) {
    for (const dep of s.dependeDe) {
      if (transversais.includes(dep) || grupoDe(dep) === grupoDe(s.nome)) continue;
      l.push(`    sg_${grupoDe(s.nome)} -->|${q(`${s.nome} → ${dep}<br/>${quebrar((s.importa[dep] ?? []).join(', ') || 'usa', 26)}`)}| sg_${grupoDe(dep)}`);
    }
  }
  l.push('  end');

  l.push(`  subgraph sg_ext[${q('Serviços externos')}]`);
  l.push(`    ext_gateway[${q('Gateway de pagamento<br/>simulado no MVP (D-08)')}]:::externo`);
  l.push(`    ext_email[${q('Provedor de e-mail<br/>console no MVP')}]:::externo`);
  l.push('  end');
  l.push('  sg_interface ==>|"HTTPS · REST/JSON"| sg_api');
  l.push('  sg_adaptador -.-> sg_ext');
  return [
    {
      id: '07-arquitetura-funcional',
      item: '7',
      titulo: 'Arquitetura funcional',
      legenda:
        `Cada caixa é um módulo de negócio do backend (um arquivo em \`backend/src/services\`: ${backend.servicos.length} serviços), com os requisitos declarados no cabeçalho do arquivo ` +
        `e o número de endpoints que o acionam (${api.length} no total), separados pelo acesso que a rota exige em \`backend/src/routes/index.ts\` ("qualquer papel" = basta estar autenticado). ` +
        'Os módulos estão agrupados em faixas; as setas são as importações reais entre serviços — dentro da faixa, de módulo para módulo; entre faixas, rotuladas com os módulos e as funções importadas. ' +
        `Os serviços transversais (${transversais.join(' e ')}) são chamados por quase todos os módulos e por isso aparecem sem setas.`,
      mermaid: l.join('\n'),
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #8 — Arquitetura técnica (hospedagem, protocolos, portas e versões instaladas)
// ---------------------------------------------------------------------------------------------------------
const maior = (versao) => (versao ? versao.split('.')[0] : '?');

export function diagramaArquiteturaTecnica(versoes, hospedagem, modelo) {
  const b = versoes.backend;
  const f = versoes.frontend;
  const l = ['flowchart __DIR__', ...ESTILO_FLUXO];
  l.push(`  subgraph sg_usuario[${q('Aparelho do usuário (celular ou computador)')}]`);
  l.push(`    navegador[${q(`<b>Navegador</b><br/>SPA React ${maior(f.react)} + React Router ${maior(f['react-router-dom'])}<br/>Tailwind CSS ${maior(f.tailwindcss)} · Leaflet ${f.leaflet}<br/>token JWT em sessionStorage`)}]:::hub`);
  l.push(`    sensores[${q('APIs do navegador<br/>Geolocation · câmera (getUserMedia)')}]`);
  l.push('  end');
  l.push(`  subgraph sg_vercel[${q('Vercel — hospedagem estática com CDN')}]`);
  l.push(`    estatico[${q(`<b>Arquivos estáticos</b><br/>build do Vite ${maior(f.vite)} (frontend/dist)<br/>rewrite ${hospedagem.vercel.rewrite.source} → ${hospedagem.vercel.rewrite.destination}`)}]`);
  l.push('  end');
  l.push(`  subgraph sg_render[${q(`Render — web service ${hospedagem.render.runtime} (plano ${hospedagem.render.plano})`)}]`);
  l.push(`    api[${q(`<b>API REST ${hospedagem.render.servico}</b><br/>Node.js ${versoes.node} · Express ${b.express}<br/>Helmet · CORS · rate limit · JWT + sessão<br/>Zod ${maior(b.zod)} · Drizzle ORM ${b['drizzle-orm']}<br/>health check ${hospedagem.render.health}`)}]:::hub`);
  l.push('  end');
  l.push(`  subgraph sg_banco[${q('PostgreSQL gerenciado (Render Postgres ou Neon)')}]`);
  l.push(`    banco[(${q(`<b>PostgreSQL</b><br/>${modelo.totais.tabelas} tabelas · ${modelo.totais.enums} enums<br/>migrações SQL versionadas`)})]`);
  l.push('  end');
  l.push(`  subgraph sg_externos[${q('Serviços externos')}]`);
  l.push(`    osm[${q('OpenStreetMap<br/>(blocos de mapa)')}]:::externo`);
  l.push(`    nominatim[${q('Nominatim<br/>(busca de endereço)')}]:::externo`);
  l.push('  end');
  l.push(`  subgraph sg_github[${q('GitHub')}]`);
  l.push(`    repo[${q('Repositório<br/>lucio734/viamos')}]`);
  l.push(`    ci[${q(`GitHub Actions (CI)<br/>Node ${hospedagem.ci.node} + ${hospedagem.ci.imagemPostgres}<br/>typecheck · lint · testes · build`)}]`);
  l.push('  end');
  l.push('  navegador -->|"HTTPS 443<br/>HTML, JS e CSS"| estatico');
  l.push('  navegador -->|"HTTPS 443 · REST/JSON<br/>Authorization: Bearer"| api');
  l.push('  api -->|"TCP 5432 · TLS<br/>SQL parametrizado"| banco');
  l.push('  navegador -->|"HTTPS 443"| osm & nominatim');
  l.push('  navegador --- sensores');
  l.push('  repo -->|"push na main"| ci');
  l.push('  repo -.->|"deploy automático"| estatico');
  l.push('  repo -.->|"deploy automático"| api');
  return [
    {
      id: '08-arquitetura-tecnica',
      item: '8',
      titulo: 'Arquitetura técnica',
      legenda:
        'Servidores, protocolos e portas da publicação em nuvem, com as versões lidas de `package-lock.json` e as configurações lidas de `render.yaml`, `frontend/vercel.json` e `.github/workflows/ci.yml`. ' +
        `Em desenvolvimento local: Vite na porta ${hospedagem.local.portaVite} (com proxy de \`/api\` para ${hospedagem.local.proxy}), API na porta ${hospedagem.local.portaApi} e PostgreSQL na porta ${hospedagem.local.portaBanco} (\`docker-compose.yml\`, imagem ${hospedagem.local.imagemPostgres}). ` +
        'A tabela de tecnologias correspondente está em `docs/producao-tecnica/tabelas/tecnologias.md`.',
      mermaid: l.join('\n'),
      direcoes: ['LR', 'TB'],
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #9 — Arquitetura MVC e ambiente de hospedagem
// ---------------------------------------------------------------------------------------------------------
export function diagramaMvc(backend, frontend, api, modelo, hospedagem) {
  const lista = (arquivos, sufixo = '') => arquivos.map((a) => a.replace(sufixo, '').replace(/\.tsx?$/, '')).join(' · ');
  const totalPaginas = Object.values(frontend.paginas).reduce((n, p) => n + p.length, 0);
  const l = ['flowchart TB', ...ESTILO_FLUXO];
  l.push(`  subgraph sg_vercel[${q('VIEW no cliente — SPA React hospedada na Vercel')}]`);
  l.push(`    paginas[${q(`<b>pages/</b> — ${totalPaginas} telas<br/>${Object.entries(frontend.paginas).map(([k, v]) => `${k} (${v.length})`).join(' · ')}`)}]`);
  l.push(`    componentes[${q(`<b>components/</b><br/>${lista(frontend.componentes)}`)}]`);
  l.push(`    clienteHttp[${q('<b>api/cliente.ts</b><br/>fetch + JWT + erros padronizados')}]`);
  l.push('    paginas --> componentes');
  l.push('    paginas --> clienteHttp');
  l.push('  end');
  l.push(`  subgraph sg_render[${q(`Backend Express hospedado no Render (${hospedagem.render.servico})`)}]`);
  l.push(`    rotas[${q(`<b>routes/index.ts</b><br/>${api.length} endpoints sob /api`)}]`);
  l.push(`    middlewares[${q(`<b>middlewares/</b><br/>${lista(backend.camadas.middlewares)}<br/>JWT + sessão · papel · validação Zod · erros`)}]`);
  l.push(`    subgraph sg_c[${q('CONTROLLER')}]`);
  l.push(`      controllers[${q(`<b>controllers/</b> — ${backend.camadas.controllers.length} arquivos<br/>${lista(backend.camadas.controllers, '.controller.ts')}<br/>HTTP ⇄ serviço · esquemas Zod · status`)}]:::hub`);
  l.push('    end');
  l.push(`    servicos[${q(`<b>services/</b> — ${backend.camadas.services.length} arquivos<br/>regras de negócio e transações`)}]`);
  l.push(`    subgraph sg_v[${q('VIEW no servidor')}]`);
  l.push(`      views[${q(`<b>views/</b><br/>${lista(backend.camadas.views)}<br/>JSON de resposta e PDF do comprovante`)}]:::hub`);
  l.push('    end');
  l.push(`    subgraph sg_m[${q('MODEL')}]`);
  l.push(`      models[${q(`<b>models/</b><br/>${lista(backend.camadas.models)}<br/>${modelo.totais.tabelas} tabelas (Drizzle ORM)`)}]:::hub`);
  l.push('    end');
  l.push('    rotas --> middlewares --> controllers --> servicos --> models');
  l.push('    controllers --> views');
  l.push('    servicos --> views');
  l.push('  end');
  l.push(`  subgraph sg_banco[${q('Banco gerenciado (Render Postgres ou Neon)')}]`);
  l.push(`    banco[(${q(`PostgreSQL<br/>${backend.migracoes.length} migrações em backend/drizzle`)})]`);
  l.push('  end');
  l.push('  clienteHttp -->|"HTTPS · REST/JSON"| rotas');
  l.push('  views -.->|"JSON ou PDF"| clienteHttp');
  l.push('  models -->|"SQL parametrizado"| banco');
  return [
    {
      id: '09-arquitetura-mvc',
      item: '9',
      titulo: 'Arquitetura MVC e ambiente de hospedagem',
      legenda:
        'Distribuição real das pastas de `backend/src` e `frontend/src` entre Model, View e Controller, com o ambiente em que cada camada é publicada. ' +
        `Model: \`models/\` (esquema e conexão). View: \`views/\` no servidor (JSON e PDF) e a SPA React no cliente. Controller: \`controllers/\`, acionados por \`routes/index.ts\` depois dos \`middlewares/\`. ` +
        'As regras de negócio ficam em `services/`, entre o Controller e o Model, para que nenhum controller acesse o banco diretamente.',
      mermaid: l.join('\n'),
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #26 — Diagrama de processos de telas (transições disparadas por cliques e eventos)
// ---------------------------------------------------------------------------------------------------------
/** Destinos que o código calcula em tempo de execução; uma expressão nova sem entrada aqui interrompe a geração. */
export const DESTINOS_DINAMICOS = {
  'sessao.destino': { tipo: 'hubs', rotulo: 'login válido' },
  'n.referenciaRecurso': { tipo: 'nota', rotulo: 'tela indicada pela notificação' },
};
/** Traço da seta conforme o que dispara a transição; quando há mais de um gatilho no mesmo par de telas, vale o mais forte. */
const SETA = { acao: '==>', clique: '-->', redirecionamento: '-.->' };
const FORCA = { acao: 3, clique: 2, redirecionamento: 1 };

/** Rótulo curto da transição: texto do link/botão (primeiras palavras) ou a função que navega após a ação. */
function rotuloCurto(t) {
  if (t.gatilho === 'redirecionamento') return '';
  if (t.gatilho === 'acao') return t.rotulo;
  let curto = '';
  for (const palavra of t.rotulo.split(' ')) {
    if (curto && `${curto} ${palavra}`.length > 24) return `${curto}…`;
    curto = curto ? `${curto} ${palavra}` : palavra;
  }
  return curto;
}

const juntarRotulos = (rotulos) => (rotulos.length > 2 ? `${rotulos.slice(0, 2).join(' / ')} +${rotulos.length - 2}` : rotulos.join(' / '));

export function diagramasTelas(rotas, navegacao, menu) {
  const porPath = new Map(rotas.map((r) => [r.path, r]));
  const ordem = new Map(rotas.map((r, i) => [r.path, i]));
  const porArea = agrupar(rotas, (r) => r.area);
  const hubs = ['cliente', 'interprete', 'backoffice'].map((a) => porArea.get(a).find((r) => !paiDaRota(r, rotas)));
  const papelDaArea = { cliente: 'CLIENTE', interprete: 'INTERPRETE', backoffice: 'BACKOFFICE' };
  const diagramas = [];

  for (const [area, alvoMenu] of [['publico', null], ['cliente', 'CLIENTE'], ['interprete', 'INTERPRETE'], ['backoffice', 'BACKOFFICE']]) {
    // Telas comuns entram no diagrama da área (são alcançadas pelo menu e pelos botões de suporte)
    const telasDaArea = [...porArea.get(area), ...(area === 'publico' ? [] : porArea.get('comum') ?? [])];
    const origens = new Set(telasDaArea.map((r) => r.path));
    const arestas = new Map(); // "de→para" → { de, para, gatilho, rotulos }
    const externos = new Set();
    const notas = [];
    const somar = (de, para, gatilho, rotulo) => {
      const chave = `${de}→${para}`;
      if (!arestas.has(chave)) arestas.set(chave, { de, para, gatilho, rotulos: [] });
      const a = arestas.get(chave);
      if (FORCA[gatilho] > FORCA[a.gatilho]) a.gatilho = gatilho;
      if (rotulo && !a.rotulos.some((r) => r.toLowerCase() === rotulo.toLowerCase())) a.rotulos.push(rotulo);
      if (porPath.has(para) && !origens.has(para)) externos.add(para);
    };

    for (const t of navegacao.transicoes) {
      if (!origens.has(t.de)) continue;
      if (t.para === '(voltar)') continue; // "voltar" do navegador: não é uma transição fixa
      if (t.para === '(hub do papel)') for (const h of hubs) somar(t.de, h.path, t.gatilho, 'sessão ativa');
      else if (t.para === '(dinâmico)') {
        const regra = DESTINOS_DINAMICOS[t.expressao];
        if (!regra) throw new Error(`Destino dinâmico sem regra em DESTINOS_DINAMICOS: ${t.expressao} (${t.arquivo}:${t.linha})`);
        if (regra.tipo === 'hubs') for (const h of hubs) somar(t.de, h.path, t.gatilho, regra.rotulo);
        else {
          if (!notas.includes(regra.rotulo)) notas.push(regra.rotulo);
          somar(t.de, `nota:${regra.rotulo}`, t.gatilho, rotuloCurto(t));
        }
      } else if (area !== 'publico' && porPath.get(t.de).area === 'comum' && papelDaArea[porPath.get(t.para).area] && porPath.get(t.para).area !== area) continue;
      else somar(t.de, t.para, t.gatilho, rotuloCurto(t));
    }

    // Menu principal (AppShell): ligar um nó "menu" a cada destino poluiria a figura; em vez disso, cada tela
    // que o menu abre recebe a marca "☰ item" — e o menu está presente em todas as telas da área.
    const itensDoMenu = new Map();
    if (alvoMenu) {
      for (const item of menu.porPapel[alvoMenu] ?? []) itensDoMenu.set(item.para, item.rotulo);
      for (const x of menu.fixos) if (x.rotulo && !itensDoMenu.has(x.para)) itensDoMenu.set(x.para, x.rotulo);
      for (const para of itensDoMenu.keys()) if (porPath.has(para) && !origens.has(para)) externos.add(para);
    }
    const noTela = (r) => `${idRota(r.path)}[${q(`<b>${r.nome}</b><br/>${r.path}${itensDoMenu.has(r.path) ? `<br/>☰ ${itensDoMenu.get(r.path)}` : ''}`)}]`;

    const l = ['flowchart __DIR__', ...ESTILO_FLUXO];
    for (const r of telasDaArea) l.push(`  ${noTela(r)}`);
    for (const p of externos) l.push(`  ${noTela(porPath.get(p))}:::externo`);
    notas.forEach((nota, i) => l.push(`  nota_${i + 1}{{${q(quebrar(nota, 18))}}}:::externo`));
    const idDe = (alvo) => (alvo.startsWith('nota:') ? `nota_${notas.indexOf(alvo.slice(5)) + 1}` : idRota(alvo));

    // Ida e volta por clique entre as mesmas duas telas viram uma única seta de duas pontas (ida ⇄ volta)
    const feitas = new Set();
    let pares = 0;
    for (const a of arestas.values()) {
      const chave = `${a.de}→${a.para}`;
      if (feitas.has(chave)) continue;
      const volta = arestas.get(`${a.para}→${a.de}`);
      if (volta && a.de !== a.para && a.gatilho === 'clique' && volta.gatilho === 'clique') {
        const [ida, vinda] = (ordem.get(a.de) ?? 0) <= (ordem.get(a.para) ?? 0) ? [a, volta] : [volta, a];
        l.push(`  ${idDe(ida.de)} <-->|${q(quebrar(`${juntarRotulos(ida.rotulos) || '·'} ⇄ ${juntarRotulos(vinda.rotulos) || '·'}`, 26))}| ${idDe(ida.para)}`);
        feitas.add(`${ida.de}→${ida.para}`).add(`${vinda.de}→${vinda.para}`);
        pares += 1;
      } else {
        const texto = juntarRotulos(a.rotulos);
        l.push(`  ${idDe(a.de)} ${SETA[a.gatilho]}${texto ? `|${q(quebrar(texto, 26))}|` : ''} ${idDe(a.para)}`);
        feitas.add(chave);
      }
    }
    for (const h of hubs) if (origens.has(h.path)) l.push(`  class ${idRota(h.path)} hub;`);

    diagramas.push({
      id: `26-telas-${area}`,
      item: '26',
      titulo: `Processos de telas — ${AREAS[area].titulo.toLowerCase()}`,
      legenda:
        `Transições entre telas extraídas do código de cada tela (\`<Link>\`, \`<Navigate>\` e \`navigate()\`): ${arestas.size} transições a partir de ${plural(telasDaArea.length, 'tela', 'telas')}${pares ? `, das quais ${plural(pares, 'par', 'pares')} de ida e volta` : ''}. ` +
        'Seta simples: clique em um link ou botão, rotulada com o texto do elemento. Seta de duas pontas (⇄): ida e volta por cliques entre as mesmas telas. ' +
        'Seta grossa: navegação feita pelo código depois que a ação é concluída, rotulada com a função. Seta tracejada: redirecionamento automático. ' +
        'Caixas tracejadas são telas de outra área.' +
        (alvoMenu ? ' A marca "☰" indica as telas abertas pelo menu principal, a barra de navegação presente em todas as telas da área (lida de `frontend/src/components/AppShell.tsx`).' : '') +
        ' A lista completa, com arquivo e linha de cada transição, está em `docs/producao-tecnica/tabelas/transicoes-de-telas.md`.',
      mermaid: l.join('\n'),
      direcoes: ['TB', 'LR'],
    });
  }
  return diagramas;
}

// ---------------------------------------------------------------------------------------------------------
// #28 — Diagrama de contexto (o sistema como caixa-preta e suas integrações externas)
// ---------------------------------------------------------------------------------------------------------
export function diagramaContexto(api, hospedagem) {
  const porAcesso = api.reduce((m, e) => ({ ...m, [e.acesso]: (m[e.acesso] ?? 0) + 1 }), {});
  const n = (acesso) => porAcesso[acesso] ?? 0;
  const l = ['flowchart LR', ...ESTILO_FLUXO];
  l.push(`  subgraph sg_atores[${q('Pessoas')}]`);
  l.push(`    cliente([${q('<b>Cliente surdo</b>')}])`);
  l.push(`    interprete([${q('<b>Intérprete de Libras</b>')}])`);
  l.push(`    operador([${q('<b>Operador</b><br/>backoffice e suporte')}])`);
  l.push(`    publico([${q('<b>Qualquer pessoa</b><br/>com o código do comprovante')}])`);
  l.push('  end');
  l.push(`  viamos[${q(`<b>Plataforma Víamos</b><br/>SPA + API REST + PostgreSQL<br/>${api.length} endpoints`)}]:::hub`);
  l.push(`  subgraph sg_externos[${q('Serviços e recursos externos')}]`);
  l.push(`    gateway[${q('<b>Gateway de pagamento</b><br/>simulado no MVP (D-08)')}]:::externo`);
  l.push(`    email[${q('<b>Provedor de e-mail</b><br/>console no MVP')}]:::externo`);
  l.push(`    mapa[${q('<b>OpenStreetMap e Nominatim</b><br/>mapa e busca de endereço')}]:::externo`);
  l.push(`    aparelho[${q('<b>Aparelho do usuário</b><br/>GPS e câmera')}]:::externo`);
  l.push('  end');
  l.push(`  cliente -->|${q('cadastro, solicitação, QR do check-in,<br/>sala, pagamento e avaliação')}| viamos`);
  l.push(`  viamos -->|${q('estimativa, andamento, avisos<br/>e comprovante em PDF')}| cliente`);
  l.push(`  interprete -->|${q('cadastro e certificado, aceite ou recusa,<br/>check-in com GPS, encerramento, repasse')}| viamos`);
  l.push(`  viamos -->|${q('demandas no raio e na agenda,<br/>avisos e ganhos')}| interprete`);
  l.push(`  operador -->|${q('parecer da certificação,<br/>atendimento de chamados')}| viamos`);
  l.push(`  viamos -->|${q('fila de certificações, emergências,<br/>indicadores e trilha de auditoria')}| operador`);
  l.push(`  publico -->|${q('código de verificação')}| viamos`);
  l.push(`  viamos -->|${q('dados essenciais do atendimento (RF38)')}| publico`);
  l.push(`  viamos -->|${q('cobrança Pix ou cartão,<br/>transferência do repasse')}| gateway`);
  l.push(`  gateway -->|${q('aprovação ou recusa')}| viamos`);
  l.push(`  viamos -->|${q('link de recuperação de senha')}| email`);
  l.push(`  viamos -->|${q('blocos do mapa e<br/>busca de endereço')}| mapa`);
  l.push(`  aparelho -->|${q('posição (check-in, sala)<br/>e leitura do QR')}| viamos`);
  return [
    {
      id: '28-diagrama-de-contexto',
      item: '28',
      titulo: 'Diagrama de contexto — o Víamos e suas integrações externas',
      legenda:
        'O sistema aparece como caixa-preta: à esquerda, as pessoas que interagem com ele; à direita, os serviços e recursos externos. ' +
        `Dos ${api.length} endpoints da API (\`backend/src/routes/index.ts\`), ${n('CLIENTE')} são exclusivos do cliente, ${n('INTERPRETE')} do intérprete, ${n('BACKOFFICE/SUPORTE')} do operador, ${n('autenticado')} servem a qualquer papel autenticado e ${n('público')} são públicos (login, cadastro, recuperação de senha, verificação do comprovante e health check). ` +
        `A publicação usa o frontend na Vercel e a API ${hospedagem.render.servico} no Render (arquitetura técnica, item #8).`,
      mermaid: l.join('\n'),
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #27 — Ferramenta CASE: a própria cadeia de geração
// ---------------------------------------------------------------------------------------------------------
export function diagramaCase(totais) {
  const l = ['flowchart TB', ...ESTILO_FLUXO];
  l.push(`  subgraph sg_fontes[${q('Código-fonte (fonte única da verdade)')}]`);
  l.push(`    schema[${q('backend/src/models/schema.ts<br/>backend/src/config/regras.ts')}]`);
  l.push(`    rotasFront[${q('frontend/src/rotas.tsx<br/>frontend/src/pages/**')}]`);
  l.push(`    rotasBack[${q('backend/src/routes/index.ts<br/>backend/src/services/**')}]`);
  l.push(`    infra[${q('package-lock.json · render.yaml<br/>vercel.json · ci.yml')}]`);
  l.push('  end');
  l.push(`  subgraph sg_extracao[${q('Extração automática')}]`);
  l.push(`    exportador[${q('backend/src/db/exportar-modelo.ts<br/>(introspecção do Drizzle ORM)')}]:::hub`);
  l.push(`    extrator[${q('docs/diagramas/lib/extrair.mjs<br/>(árvore sintática do TypeScript)')}]:::hub`);
  l.push('  end');
  l.push(`  dados[(${q(`docs/diagramas/dados/*.json<br/>${totais.tabelas} tabelas · ${totais.rotas} rotas<br/>${totais.endpoints} endpoints · ${totais.transicoes} transições`)})]`);
  l.push(`  construtores[${q('docs/diagramas/lib/diagramas-*.mjs<br/>(construtores Mermaid)')}]:::hub`);
  l.push(`  fontesMmd[${q(`docs/diagramas/fontes/*.mmd<br/>${totais.diagramas} diagramas`)}]`);
  l.push(`  mmdc[${q('Mermaid CLI<br/>(renderização em navegador headless)')}]:::hub`);
  l.push(`  figuras[${q('docs/producao-tecnica/figuras/*.png')}]`);
  l.push(`  tabelas[${q('docs/producao-tecnica/tabelas/*.md<br/>dicionário de dados · rotas · API · tecnologias')}]`);
  l.push(`  verificar{${q('npm run verificar<br/>fontes em dia com o código?')}}:::destaque`);
  l.push('  schema --> exportador --> dados');
  l.push('  rotasFront & rotasBack & infra --> extrator --> dados');
  l.push('  dados --> construtores --> fontesMmd --> mmdc --> figuras');
  l.push('  dados --> tabelas');
  l.push('  fontesMmd -.-> verificar');
  l.push('  dados -.-> verificar');
  return [
    {
      id: '27-ferramenta-case',
      item: '27',
      titulo: 'Ferramenta CASE — cadeia de geração dos modelos a partir do código',
      legenda:
        'Os diagramas deste capítulo não são desenhados à mão: uma cadeia de ferramentas lê o código-fonte, extrai o modelo e gera as figuras. ' +
        'O exportador usa a introspecção do Drizzle ORM sobre o `schema.ts`; o extrator usa a árvore sintática do compilador TypeScript; o Mermaid CLI renderiza as fontes `.mmd`. ' +
        '`npm run verificar` falha se alguma fonte versionada estiver diferente do que o código atual gera — é o que mantém o DER alinhado ao banco (item #38). ' +
        'Os diagramas de casos de uso e de classes das entregas anteriores foram modelados no diagrams.net (`Entregas/30_09/Viamos_Diagramas_Editaveis.drawio`).',
      mermaid: l.join('\n'),
    },
  ];
}
