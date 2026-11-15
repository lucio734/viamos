/**
 * DOCUMENTOS — índice dos diagramas e tabelas de apoio (Markdown) geradas dos mesmos dados dos diagramas.
 * As tabelas alimentam o documento "Produção Técnica" (Bloco P2): dicionário de dados, rotas e telas,
 * endpoints da API, tecnologias e transições de telas.
 */
import { AREAS, MODULOS } from './diagramas-estrutura.mjs';

const AVISO = '<!-- ARQUIVO GERADO por docs/diagramas/gerar.mjs — não edite à mão; altere o código-fonte e rode `npm run gerar`. -->';
const FONTE = 'Fonte: Autoria própria apoiado por IA generativa (gerado a partir do código-fonte).';
const cel = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tabela = (cabecalho, linhas) => [`| ${cabecalho.join(' | ')} |`, `|${cabecalho.map(() => '---').join('|')}|`, ...linhas.map((l) => `| ${l.map(cel).join(' | ')} |`)].join('\n');
const simNao = (b) => (b ? 'sim' : 'não');

const ITENS = {
  3: 'Sitemap',
  7: 'Arquitetura funcional',
  8: 'Arquitetura técnica',
  9: 'Arquitetura MVC',
  16: 'Macroprocesso',
  17: 'Fluxograma',
  22: 'Diagrama entidade-relacionamento',
  23: 'Diagrama de estado de máquina',
  24: 'Diagrama de operação',
  26: 'Diagrama de processos (telas)',
  27: 'Ferramenta CASE',
  28: 'Diagrama de contexto',
};

export function indiceDosDiagramas(diagramas, totais) {
  const porItem = new Map();
  for (const d of diagramas) porItem.set(d.item, [...(porItem.get(d.item) ?? []), d]);
  const partes = [
    AVISO,
    '',
    '# Diagramas da Produção Técnica gerados do código (Bloco P1)',
    '',
    `Este índice reúne ${diagramas.length} diagramas dos itens ${[...porItem.keys()].map((i) => `#${i}`).join(', ')} do checklist. ` +
      'Todos são gerados por `docs/diagramas/gerar.mjs` a partir do código-fonte; as figuras em PNG ficam em `docs/producao-tecnica/figuras/` e as fontes Mermaid em `docs/diagramas/fontes/`.',
    '',
    `Base da geração: ${totais.tabelas} tabelas, ${totais.rotas} rotas (${totais.telas} telas distintas), ${totais.endpoints} endpoints e ${totais.transicoes} transições entre telas lidas do código.`,
    '',
    '## Como regenerar',
    '',
    '```bash',
    'cd backend && npm install && npm run docs:modelo      # exporta o modelo do banco (schema.ts → dados/modelo.json)',
    'cd ../docs/diagramas && npm install                   # Mermaid CLI + TypeScript',
    'npm run gerar                                         # fontes .mmd, dados e tabelas',
    'npm run figuras                                       # idem + PNGs (usa o Chrome ou o Edge instalado)',
    'npm run verificar                                     # falha se algo versionado estiver desatualizado',
    '```',
    '',
    'Detalhes e solução de problemas: [`README.md`](README.md).',
    '',
    '## Sumário',
    '',
    tabela(
      ['Item', 'Assunto', 'Figuras'],
      [...porItem].map(([item, lista]) => [`#${item}`, ITENS[item] ?? '', lista.map((d) => `[${d.id}](#${d.id})`).join('<br/>')]),
    ),
    '',
    'Tabelas de apoio (geradas dos mesmos dados): [`dicionario-de-dados.md`](../producao-tecnica/tabelas/dicionario-de-dados.md) · [`rotas-e-telas.md`](../producao-tecnica/tabelas/rotas-e-telas.md) · ' +
      '[`api.md`](../producao-tecnica/tabelas/api.md) · [`tecnologias.md`](../producao-tecnica/tabelas/tecnologias.md) · [`transicoes-de-telas.md`](../producao-tecnica/tabelas/transicoes-de-telas.md).',
    '',
  ];
  for (const [item, lista] of porItem) {
    partes.push(`## Item #${item} — ${ITENS[item] ?? ''}`, '');
    for (const d of lista) {
      partes.push(
        `<a id="${d.id}"></a>`,
        '',
        `### ${d.titulo}`,
        '',
        `![${d.titulo}](../producao-tecnica/figuras/${d.id}.png)`,
        '',
        FONTE,
        '',
        d.legenda,
        '',
        '<details>',
        `<summary>Fonte Mermaid (<code>docs/diagramas/fontes/${d.id}.mmd</code>)</summary>`,
        '',
        '```mermaid',
        d.mermaid,
        '```',
        '',
        '</details>',
        '',
      );
    }
  }
  return `${partes.join('\n').trimEnd()}\n`;
}

export function tabelaDicionarioDeDados(modelo) {
  const partes = [
    AVISO,
    '',
    '# Dicionário de dados',
    '',
    `Gerado de \`backend/src/models/schema.ts\`: ${modelo.totais.tabelas} tabelas, ${modelo.totais.colunas} colunas, ${modelo.totais.chavesEstrangeiras} chaves estrangeiras e ${modelo.totais.enums} tipos enumerados. ` +
      'Chaves: PK = primária, FK = estrangeira, UK = única.',
    '',
  ];
  let secao = null;
  for (const t of modelo.tabelas) {
    if (t.secao !== secao) {
      secao = t.secao;
      partes.push(`## ${secao}`, '');
    }
    partes.push(`### \`${t.nome}\``, '');
    partes.push(
      tabela(
        ['Coluna', 'Tipo', 'Chave', 'Obrigatória', 'Padrão', 'Observação'],
        t.colunas.map((c) => [
          `\`${c.nome}\``,
          c.enum ? `enum \`${c.tipo}\`` : c.tipo,
          [c.chavePrimaria && 'PK', c.chaveEstrangeira && 'FK', !c.chavePrimaria && c.unica && 'UK'].filter(Boolean).join(', '),
          simNao(c.obrigatoria),
          c.padrao ?? '',
          c.comentario ?? '',
        ]),
      ),
      '',
    );
    if (t.chavesEstrangeiras.length) {
      partes.push('Chaves estrangeiras:', '');
      for (const fk of t.chavesEstrangeiras) partes.push(`- \`${fk.colunas.join(', ')}\` → \`${fk.tabelaReferenciada}(${fk.colunasReferenciadas.join(', ')})\` — ao excluir: ${fk.aoExcluir}`);
      partes.push('');
    }
    const extras = [
      ...t.indices.map((i) => `${i.unico ? 'índice único' : 'índice'} \`${i.nome}\` em (${i.colunas.join(', ')})${i.condicao ? ` onde ${i.condicao}` : ''}`),
      ...t.restricoesUnicas.map((u) => `restrição única em (${u.colunas.join(', ')})`),
      ...t.checks.map((c) => `CHECK \`${c.nome}\`: ${c.expressao}`),
    ];
    if (extras.length) {
      partes.push('Índices e regras de integridade:', '');
      for (const e of extras) partes.push(`- ${e}`);
      partes.push('');
    }
  }
  partes.push('## Tipos enumerados', '', tabela(['Enum', 'Valores'], modelo.enums.map((e) => [`\`${e.nome}\``, e.valores.join(', ')])), '');
  return `${partes.join('\n').trimEnd()}\n`;
}

export function tabelaRotas(rotas) {
  const telas = new Set(rotas.map((r) => r.componente)).size;
  return `${[
    AVISO,
    '',
    '# Rotas e telas (sitemap em tabela)',
    '',
    `Gerado de \`frontend/src/rotas.tsx\`: ${rotas.length} rotas e ${telas} telas distintas (componentes compartilhados entre papéis contam uma vez).`,
    '',
    tabela(
      ['Área', 'Rota', 'Tela', 'Componente', 'Arquivo', 'Acesso'],
      rotas.map((r) => [AREAS[r.area].titulo, `\`${r.path}\``, r.nome, `\`${r.componente}\``, `\`${r.arquivo}\``, r.papeis.length ? r.papeis.join(', ') : 'público']),
    ),
  ].join('\n')}\n`;
}

export function tabelaApi(api) {
  const porSecao = new Map();
  for (const e of api) porSecao.set(e.secao, [...(porSecao.get(e.secao) ?? []), e]);
  const partes = [AVISO, '', '# Endpoints da API', '', `Gerado de \`backend/src/routes/index.ts\`: ${api.length} endpoints. A especificação completa está em \`docs/api/openapi.yaml\`.`, ''];
  for (const [secao, lista] of porSecao) {
    partes.push(`## ${secao}`, '');
    partes.push(
      tabela(
        ['Método', 'Caminho', 'Acesso', 'Controller', 'Validação (Zod)', 'Requisitos'],
        lista.map((e) => [e.metodo, `\`${e.caminho}\``, e.acesso, e.controller ? `\`${e.controller}.${e.funcao}\`` : e.funcao, e.validacao ? `\`${e.validacao}\`` : '', e.requisitos.join(', ')]),
      ),
      '',
    );
  }
  return `${partes.join('\n').trimEnd()}\n`;
}

export function tabelaTecnologias(versoes, hospedagem, backend) {
  const b = versoes.backend;
  const f = versoes.frontend;
  const partes = [
    AVISO,
    '',
    '# Tecnologias e infraestrutura',
    '',
    'Versões instaladas lidas de `backend/package-lock.json` e `frontend/package-lock.json`; hospedagem lida de `render.yaml`, `frontend/vercel.json`, `docker-compose.yml` e `.github/workflows/ci.yml`.',
    '',
    '## Tecnologias por camada',
    '',
    tabela(
      ['Camada', 'Tecnologia', 'Versão', 'Função no Víamos'],
      [
        ['Apresentação', 'React', f.react, 'Interface web em página única (SPA)'],
        ['Apresentação', 'React Router', f['react-router-dom'], 'Rotas do sitemap e proteção por papel'],
        ['Apresentação', 'Vite', f.vite, 'Servidor de desenvolvimento e build de produção'],
        ['Apresentação', 'Tailwind CSS', f.tailwindcss, 'Estilos com os tokens do design system'],
        ['Apresentação', 'Leaflet + React Leaflet', `${f.leaflet} / ${f['react-leaflet']}`, 'Mapa (OpenStreetMap) para marcar e exibir locais'],
        ['Apresentação', 'qrcode.react / html5-qrcode', `${f['qrcode.react']} / ${f['html5-qrcode']}`, 'Exibição e leitura do QR Code do check-in'],
        ['Aplicação', 'Node.js', versoes.node, 'Ambiente de execução da API'],
        ['Aplicação', 'Express', b.express, 'Servidor HTTP e roteamento da API REST'],
        ['Aplicação', 'Zod', b.zod, 'Validação das entradas em todos os endpoints'],
        ['Aplicação', 'jsonwebtoken + bcryptjs', `${b.jsonwebtoken} / ${b.bcryptjs}`, 'Token de sessão (JWT) e hash de senha'],
        ['Aplicação', 'Helmet, CORS e express-rate-limit', `${b.helmet} / ${b.cors} / ${b['express-rate-limit']}`, 'Cabeçalhos de segurança, origens permitidas e limite de tentativas'],
        ['Aplicação', 'PDFKit', b.pdfkit, 'Geração do comprovante em PDF'],
        ['Persistência', 'Drizzle ORM', b['drizzle-orm'], 'Mapeamento objeto-relacional e consultas parametrizadas'],
        ['Persistência', 'node-postgres (pg)', b.pg, 'Driver e pool de conexões com o PostgreSQL'],
        ['Persistência', 'Drizzle Kit', b['drizzle-kit'], `Geração das migrações SQL (${backend.migracoes.length} em backend/drizzle)`],
        ['Qualidade', 'TypeScript', `${b.typescript} (API) / ${f.typescript} (SPA)`, 'Tipagem estática nas duas aplicações'],
        ['Qualidade', 'Vitest + Supertest', `${b.vitest} / ${b.supertest}`, 'Testes automatizados da API contra um PostgreSQL real'],
        ['Qualidade', 'Oxlint', f.oxlint, 'Análise estática do frontend'],
      ],
    ),
    '',
    '## Servidores, protocolos e portas',
    '',
    tabela(
      ['Componente', 'Onde roda', 'Protocolo e porta', 'Configuração'],
      [
        ['SPA (arquivos estáticos)', 'Vercel (CDN)', 'HTTPS 443', `frontend/vercel.json — rewrite \`${hospedagem.vercel.rewrite.source}\` → \`${hospedagem.vercel.rewrite.destination}\`; cabeçalhos ${hospedagem.vercel.cabecalhos.join(', ')}`],
        ['API REST', `Render — web service ${hospedagem.render.runtime}, plano ${hospedagem.render.plano}, região ${hospedagem.render.regiao}`, 'HTTPS 443 (porta interna definida por PORT)', `render.yaml — build \`${hospedagem.render.build}\`, start \`${hospedagem.render.start}\`, health check \`${hospedagem.render.health}\``],
        ['Banco de dados', `PostgreSQL gerenciado (${hospedagem.render.banco} no Render, ou Neon)`, 'TCP 5432 com TLS', 'variável DATABASE_URL'],
        ['Mapa e busca de endereço', 'OpenStreetMap e Nominatim', 'HTTPS 443 (a partir do navegador)', 'frontend/src/components/Mapa.tsx'],
        ['Integração contínua', 'GitHub Actions', '—', `.github/workflows/ci.yml — Node ${hospedagem.ci.node}, ${hospedagem.ci.imagemPostgres}`],
        ['Desenvolvimento local — SPA', 'Vite', `HTTP ${hospedagem.local.portaVite}`, `frontend/vite.config.ts — proxy de /api para ${hospedagem.local.proxy}`],
        ['Desenvolvimento local — API', 'Node.js', `HTTP ${hospedagem.local.portaApi}`, 'backend/.env (PORT)'],
        ['Desenvolvimento local — banco', `Docker (${hospedagem.local.imagemPostgres})`, `TCP ${hospedagem.local.portaBanco}`, 'docker-compose.yml'],
      ],
    ),
    '',
    '## Módulos de negócio do backend',
    '',
    tabela(
      ['Serviço', 'Módulo de negócio', 'Requisitos declarados', 'Depende de'],
      backend.servicos.map((s) => [`\`${s.nome}.service.ts\``, MODULOS[s.nome]?.rotulo ?? '', s.requisitos.join(', '), s.dependeDe.join(', ')]),
    ),
  ];
  return `${partes.join('\n').trimEnd()}\n`;
}

export function tabelaTransicoes(rotas, navegacao, menu) {
  const nome = new Map(rotas.map((r) => [r.path, r.nome]));
  const gatilho = { clique: 'clique', acao: 'ação concluída', redirecionamento: 'automático' };
  const partes = [
    AVISO,
    '',
    '# Transições entre telas',
    '',
    `Extraídas de \`<Link>\`, \`<NavLink>\`, \`<Navigate>\` e \`navigate()\` nos componentes de cada rota: ${navegacao.transicoes.length} transições. ` +
      'A coluna "Evento" traz o texto do link ou botão, ou a função que navega depois da ação.',
    '',
    tabela(
      ['Tela de origem', 'Rota de origem', 'Gatilho', 'Evento', 'Destino', 'Onde no código'],
      navegacao.transicoes.map((t) => [nome.get(t.de), `\`${t.de}\``, gatilho[t.gatilho], t.rotulo, t.para === '(dinâmico)' ? `calculado em tempo de execução: \`${t.expressao}\`` : nome.has(t.para) ? `\`${t.para}\`` : t.para, `\`${t.arquivo.replace('frontend/src/', '')}:${t.linha}\``]),
    ),
    '',
    '## Menu principal (em todas as telas autenticadas)',
    '',
    tabela(
      ['Papel', 'Item', 'Destino'],
      [
        ...Object.entries(menu.porPapel).flatMap(([papel, itens]) => (Array.isArray(itens) ? itens.map((i) => [papel, i.rotulo, `\`${i.para}\``]) : [])),
        ...[...new Map(menu.fixos.filter((x) => x.rotulo).map((x) => [x.para, x])).values()].map((x) => ['todos', x.rotulo, `\`${x.para}\``]),
      ],
    ),
  ];
  if (navegacao.descartadas.length) {
    partes.push('', '## Ramos que não se aplicam à tela de origem', '', 'Componentes compartilhados entre papéis montam o caminho do outro papel em um ramo condicional; esses destinos não são alcançados a partir da tela indicada e ficam fora dos diagramas.', '');
    partes.push(tabela(['Rota de origem', 'Destino descartado', 'Onde no código'], navegacao.descartadas.map((t) => [`\`${t.de}\``, `\`${t.para}\``, `\`${t.arquivo.replace('frontend/src/', '')}:${t.linha}\``])));
  }
  return `${partes.join('\n').trimEnd()}\n`;
}
