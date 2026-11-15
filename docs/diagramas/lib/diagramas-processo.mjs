/**
 * CONSTRUTORES (processos) — macroprocesso (#16), fluxograma (#17), máquinas de estado (#23) e operação (#24).
 *
 * Diferente do sitemap e do DER, o encadeamento destes diagramas é descrito aqui, à mão. Para que não se
 * afastem do código, três amarras são verificadas a cada geração (ver a etapa de validações em gerar.mjs):
 *   1. todo parâmetro numérico (raio, distância, janela, taxa…) vem de `backend/src/config/regras.ts`;
 *   2. toda função, código de erro e requisito citado precisa existir no código-fonte — cada diagrama declara
 *      em `simbolos`, `codigos` e `requisitos` o que cita;
 *   3. todo estado citado precisa existir no enum correspondente do banco — cada diagrama declara em `enums`.
 */
import { q } from './diagramas-estrutura.mjs';

const reais = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
const pct = (v) => `${Math.round(Number(v) * 100)}%`;
const horas = (min) => `${min / 60} h`;

const ESTILO = [
  '  classDef inicio fill:#111,stroke:#111,color:#fff;',
  '  classDef erro fill:#fff,stroke:#666,stroke-dasharray:4 3,color:#333;',
  '  classDef destaque fill:#e6e6e6,stroke:#111,stroke-width:2px,color:#111;',
];

const S = 'backend/src/services';
const C = 'backend/src/controllers';
const ELEG = 'backend/src/utils/elegibilidade.ts';

// ---------------------------------------------------------------------------------------------------------
// #16 — Macroprocesso (cadeia de valor em três faixas: gestão, primários e apoio)
// ---------------------------------------------------------------------------------------------------------
export function diagramaMacroprocesso(R) {
  const l = ['flowchart TB', ...ESTILO];
  l.push(`  subgraph sg_gestao[${q('Processos de gestão')}]`);
  l.push('    direction LR');
  l.push(`    g1[${q('<b>Habilitação de intérpretes</b><br/>análise documental pelo backoffice<br/>RF05, RF06 · condiciona a etapa 3')}]`);
  l.push(`    g2[${q('<b>Auditoria e privacidade</b><br/>trilha imutável e direitos LGPD<br/>RF44, RF45 · todas as etapas')}]`);
  l.push('  end');
  l.push(`  subgraph sg_primarios[${q('Processos primários — cadeia de valor do atendimento presencial')}]`);
  l.push('    direction LR');
  l.push(`    entrada([${q('Pessoa surda<br/>precisa de mediação<br/>presencial em Libras')}]):::inicio`);
  l.push(`    p1[${q('<b>1. Cadastro<br/>e acesso</b><br/>RF01–RF04<br/>RF07–RF09')}]:::destaque`);
  l.push(`    p2[${q(`<b>2. Solicitação<br/>e estimativa</b><br/>RF10–RF16<br/>mínimo de ${horas(R.DURACAO_MINIMA_MIN)}`)}]:::destaque`);
  l.push(`    p3[${q(`<b>3. Distribuição<br/>e aceite exclusivo</b><br/>RF17, RF20–RF25<br/>raio até ${R.RAIO_MAXIMO_KM} km e agenda`)}]:::destaque`);
  l.push(`    p4[${q(`<b>4. Encontro<br/>e check-in</b><br/>RF28–RF32<br/>QR + GPS até ${R.CHECKIN_DISTANCIA_MAXIMA_M} m`)}]:::destaque`);
  l.push(`    p5[${q('<b>5. Atendimento<br/>e encerramento</b><br/>RF33<br/>duração real')}]:::destaque`);
  l.push(`    p6[${q('<b>6. Pagamento<br/>e comprovante</b><br/>RF35–RF38<br/>PDF verificável')}]:::destaque`);
  l.push(`    p7[${q('<b>7. Avaliação<br/>e repasse</b><br/>RF26, RF27<br/>RF40, RF41')}]:::destaque`);
  l.push(`    saida([${q('Acessibilidade<br/>garantida, comprovada<br/>e auditável')}]):::inicio`);
  l.push('    entrada --> p1 --> p2 --> p3 --> p4 --> p5 --> p6 --> p7 --> saida');
  l.push('  end');
  l.push(`  subgraph sg_apoio[${q('Processos de apoio')}]`);
  l.push('    direction LR');
  l.push(`    a1[${q('<b>Notificações</b><br/>RF42<br/>etapas 3, 4, 5 e 6')}]`);
  l.push(`    a2[${q('<b>Suporte e emergência</b><br/>RF34<br/>etapas 4 e 5')}]`);
  l.push(`    a3[${q(`<b>Gateway de pagamento</b><br/>simulado no MVP<br/>etapas 6 e 7 · taxa de ${pct(R.PRECO.TAXA_PLATAFORMA_PERCENTUAL)}`)}]`);
  l.push(`    a4[${q('<b>Mapa e geolocalização</b><br/>OpenStreetMap + GPS<br/>etapas 2, 3 e 4')}]`);
  l.push(`    a5[${q('<b>Histórico e perfil</b><br/>RF39, RF43<br/>etapas 1 e 7')}]`);
  l.push('  end');
  l.push('  sg_gestao -->|"habilita e audita"| sg_primarios');
  l.push('  sg_primarios -.-|"sustentada por"| sg_apoio');
  return [
    {
      id: '16-macroprocesso',
      item: '16',
      titulo: 'Macroprocesso — cadeia de valor do atendimento presencial',
      legenda:
        'Visão sistêmica em três faixas: os sete processos primários levam da necessidade de mediação até o atendimento comprovado; acima, os processos de gestão que habilitam e auditam a cadeia; abaixo, os processos de apoio, com as etapas que cada um sustenta. ' +
        'Os números (duração mínima, raio, distância do check-in e taxa da plataforma) são lidos de `backend/src/config/regras.ts`.',
      mermaid: l.join('\n'),
      requisitos: ['RF01', 'RF04', 'RF05', 'RF06', 'RF07', 'RF09', 'RF10', 'RF16', 'RF17', 'RF20', 'RF25', 'RF26', 'RF27', 'RF28', 'RF32', 'RF33', 'RF34', 'RF35', 'RF38', 'RF39', 'RF40', 'RF41', 'RF42', 'RF43', 'RF44', 'RF45'],
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #17 — Fluxograma do fluxo principal (quatro partes, uma coluna cada, para caber na página)
// ---------------------------------------------------------------------------------------------------------
export function diagramasFluxograma(R) {
  const novo = () => ['flowchart TB', ...ESTILO];

  // Parte 1 — solicitação, estimativa e distribuição
  const p1 = novo();
  p1.push(`  ini([${q('Início: cliente autenticado<br/>abre "Nova solicitação"')}]):::inicio`);
  p1.push(`  dados[/${q(`Informa tipo de serviço, data e horário,<br/>duração (${horas(R.DURACAO_MINIMA_MIN)} a ${horas(R.DURACAO_MAXIMA_MIN)}, em blocos de ${R.DURACAO_BLOCO_MIN} min)<br/>e o local marcado no mapa`)}/]`);
  p1.push(`  val{${q('Dados válidos<br/>e horário futuro?')}}`);
  p1.push(`  errVal[${q('400 VALIDACAO<br/>422 DURACAO_BLOCO<br/>422 DATA_PASSADA')}]:::erro`);
  p1.push(`  est[${q(`Sistema calcula a estimativa — RF15<br/>preço/hora do tipo × horas<br/>+ deslocamento ${reais(R.PRECO.DESLOCAMENTO_FIXO)}<br/>+ taxa da plataforma ${pct(R.PRECO.TAXA_PLATAFORMA_PERCENTUAL)}`)}]`);
  p1.push(`  conf{${q('Cliente<br/>confirma?')}}`);
  p1.push(`  grava[${q(`Grava a solicitação BUSCANDO<br/>e a cotação (regra ${R.PRECO.VERSAO_REGRA}) — RF16`)}]:::destaque`);
  p1.push(`  dist[${q(`Distribuição — RF17 e D-20<br/>intérpretes APROVADOS e online, com o local<br/>a até min(raio do intérprete, ${R.RAIO_MAXIMO_KM} km),<br/>início dentro da grade semanal e agenda livre;<br/>por proximidade e reputação, uma oferta e um aviso para cada`)}]`);
  p1.push(`  nenhum{${q('Algum intérprete<br/>elegível?')}}`);
  p1.push(`  espera[${q('Continua BUSCANDO: quem ficar elegível<br/>depois (online, novo raio ou nova grade)<br/>recebe a oferta — nova distribuição')}]`);
  p1.push(`  cont([${q('Continua na parte 2:<br/>resposta dos intérpretes')}]):::inicio`);
  p1.push('  ini --> dados --> val');
  p1.push('  val -->|"não"| errVal --> dados');
  p1.push('  val -->|"sim"| est --> conf');
  p1.push('  conf -->|"não, ajusta"| dados');
  p1.push('  conf -->|"sim"| grava --> dist --> nenhum');
  p1.push('  nenhum -->|"sim"| cont');
  p1.push('  nenhum -->|"não"| espera --> cont');

  // Parte 2 — resposta dos intérpretes, cancelamento e aceite
  const p2 = novo();
  p2.push(`  ini([${q('Solicitação BUSCANDO<br/>(vem da parte 1)')}]):::inicio`);
  p2.push(`  resp{${q('O que acontece<br/>com a demanda?')}}`);
  p2.push(`  rec[${q('Oferta RECUSADA só para<br/>esse intérprete — RF23<br/>segue BUSCANDO para os demais')}]`);
  p2.push(`  bloq[${q('Solicitação bloqueada na transação;<br/>vínculo e estado relidos depois do bloqueio')}]`);
  p2.push(`  canc{${q(`Já ACEITA e faltam<br/>menos de ${R.CANCELAMENTO.JANELA_SEM_TAXA_HORAS} h?`)}}`);
  p2.push(`  taxa[${q(`Taxa de ${pct(R.CANCELAMENTO.PERCENTUAL_TAXA)}<br/>do valor estimado`)}]`);
  p2.push(`  semTaxa[${q('Sem custo')}]`);
  p2.push(`  fimCanc([${q('Fim: solicitação CANCELADA<br/>ofertas pendentes EXPIRADAS — RF19')}]):::inicio`);
  p2.push(`  verif[${q('Aceite — RF22: com o intérprete bloqueado,<br/>o serviço confere habilitação, demanda BUSCANDO,<br/>horário futuro, raio, grade semanal e agenda livre')}]`);
  p2.push(`  ace{${q('Tudo<br/>confere?')}}`);
  p2.push(`  errAce[${q('403 · 409 DEMANDA_INDISPONIVEL<br/>422 DEMANDA_EXPIRADA · 422 FORA_DO_RAIO<br/>422 FORA_DA_DISPONIBILIDADE<br/>409 AGENDA_CONFLITANTE')}]:::erro`);
  p2.push(`  trava[${q("Transação atômica:<br/>UPDATE … WHERE status = 'BUSCANDO'<br/>só o primeiro intérprete altera a linha")}]:::destaque`);
  p2.push(`  agendado[${q('Solicitação ACEITA · atendimento AGENDADO<br/>QR Code do check-in gerado<br/>demais ofertas EXPIRADAS · cliente avisado')}]`);
  p2.push(`  cont([${q('Continua na parte 3:<br/>encontro presencial')}]):::inicio`);
  p2.push('  ini --> resp');
  p2.push('  resp -->|"um intérprete recusa"| rec --> resp');
  p2.push('  resp -->|"o cliente cancela"| bloq --> canc');
  p2.push('  canc -->|"sim"| taxa --> fimCanc');
  p2.push('  canc -->|"não"| semTaxa --> fimCanc');
  p2.push('  resp -->|"um intérprete aceita"| verif --> ace');
  p2.push('  ace -->|"não"| errAce --> resp');
  p2.push('  ace -->|"sim"| trava --> agendado --> cont');

  // Parte 3 — encontro presencial e check-in
  const p3 = novo();
  p3.push(`  ini([${q('Atendimento AGENDADO<br/>(vem da parte 2)')}]):::inicio`);
  p3.push(`  sala[${q('Sala de atendimento — RF28 a RF30<br/>mensagens, foto do ponto de encontro<br/>e localização temporária no mapa')}]`);
  p3.push(`  gps[/${q('No local, o intérprete captura a posição do GPS<br/>(obrigatória para liberar a leitura do QR)')}/]`);
  p3.push(`  qr[/${q('O cliente exibe o QR Code — RF31<br/>o intérprete lê o código')}/]`);
  p3.push(`  c1{${q('Código<br/>confere?')}}`);
  p3.push(`  c2{${q(`Faltam ${R.CHECKIN_ANTECEDENCIA_MIN} min<br/>ou menos?`)}}`);
  p3.push(`  c3{${q(`Precisão do GPS<br/>até ${R.CHECKIN_PRECISAO_MAXIMA_M} m?`)}}`);
  p3.push(`  c4{${q(`Distância<br/>até ${R.CHECKIN_DISTANCIA_MAXIMA_M} m?`)}}`);
  p3.push(`  e1[${q('422 QR_INVALIDO')}]:::erro`);
  p3.push(`  e2[${q('422 FORA_DA_JANELA')}]:::erro`);
  p3.push(`  e3[${q('422 PRECISAO_INSUFICIENTE')}]:::erro`);
  p3.push(`  e4[${q('422 FORA_DO_LOCAL — RF32')}]:::erro`);
  p3.push(`  and[${q('Com a solicitação bloqueada: check-in registrado,<br/>atendimento e solicitação EM_ANDAMENTO,<br/>início real gravado · cliente avisado')}]:::destaque`);
  p3.push(`  cont([${q('Continua na parte 4:<br/>encerramento e pagamento')}]):::inicio`);
  p3.push('  ini --> sala --> gps --> qr --> c1');
  p3.push('  c1 -->|"não"| e1 --> gps');
  p3.push('  c1 -->|"sim"| c2');
  p3.push('  c2 -->|"não"| e2 --> gps');
  p3.push('  c2 -->|"sim"| c3');
  p3.push('  c3 -->|"não"| e3 --> gps');
  p3.push('  c3 -->|"sim"| c4');
  p3.push('  c4 -->|"não"| e4 --> gps');
  p3.push('  c4 -->|"sim"| and --> cont');

  // Parte 4 — encerramento, pagamento e avaliação
  const p4 = novo();
  p4.push(`  ini([${q('Atendimento EM_ANDAMENTO<br/>(vem da parte 3)')}]):::inicio`);
  p4.push(`  enc[${q('Cliente ou intérprete encerra — RF33<br/>duração real apurada')}]`);
  p4.push(`  valor[${q(`Valor final (D-03): cobra o maior entre<br/>a duração contratada e a real arredondada<br/>para cima em blocos de ${R.COBRANCA.BLOCO_EXCEDENTE_MIN} min<br/>pagamento PENDENTE criado`)}]`);
  p4.push(`  pagar[/${q('Cliente escolhe Pix ou cartão salvo<br/>e confirma — RF35, RF36')}/]`);
  p4.push(`  q1{${q('Já existe<br/>pagamento PAGO?')}}`);
  p4.push(`  rep[${q('200 — devolve o pagamento anterior<br/>sem cobrar de novo (idempotência;<br/>chamadas simultâneas são serializadas)')}]`);
  p4.push(`  q2{${q('Gateway<br/>aprova?')}}`);
  p4.push(`  e5[${q('402 PAGAMENTO_RECUSADO<br/>pagamento FALHOU<br/>pode tentar outra forma')}]:::erro`);
  p4.push(`  pago[${q(`Pagamento PAGO<br/>crédito ao intérprete = valor pago<br/>− taxa de ${pct(R.PRECO.TAXA_PLATAFORMA_PERCENTUAL)} do serviço<br/>comprovante com código público — RF37, RF38`)}]:::destaque`);
  p4.push(`  aval[${q('Avaliação bilateral de 1 a 5 — RF40<br/>recalcula a reputação do intérprete — RF41')}]`);
  p4.push(`  repasse[${q('Intérprete solicita o repasse<br/>do saldo inteiro — RF27<br/>(um por vez; saldo somado no banco)')}]`);
  p4.push(`  fim([${q('Fim: atendimento comprovado<br/>e registrado na trilha de auditoria — RF44')}]):::inicio`);
  p4.push('  ini --> enc --> valor --> pagar --> q1');
  p4.push('  q1 -->|"sim"| rep --> aval');
  p4.push('  q1 -->|"não"| q2');
  p4.push('  q2 -->|"não"| e5 --> pagar');
  p4.push('  q2 -->|"sim"| pago --> aval --> repasse --> fim');

  const base = 'As caixas tracejadas são as respostas de erro devolvidas pela API em cada desvio; todos os números vêm de `backend/src/config/regras.ts`.';
  return [
    {
      id: '17-fluxograma-1-solicitacao-e-estimativa',
      item: '17',
      titulo: 'Fluxograma do atendimento — parte 1: solicitação, estimativa e distribuição',
      legenda: `Do início até a distribuição da demanda, na ordem em que \`criarSolicitacao\` avalia os dados (\`solicitacao.service.ts\`). A distribuição usa a mesma regra de elegibilidade da lista e do aceite (D-20). ${base}`,
      mermaid: p1.join('\n'),
      simbolos: [
        [`${S}/solicitacao.service.ts`, 'calcularEstimativa'],
        [`${S}/solicitacao.service.ts`, 'criarSolicitacao'],
        [`${S}/solicitacao.service.ts`, 'distribuir'],
        [`${S}/demanda.service.ts`, 'ofertarDemandasAbertas'],
        [ELEG, 'avaliarElegibilidade'],
      ],
      codigos: ['DURACAO_BLOCO', 'DATA_PASSADA'],
      requisitos: ['RF15', 'RF16', 'RF17'],
    },
    {
      id: '17-fluxograma-2-resposta-e-aceite',
      item: '17',
      titulo: 'Fluxograma do atendimento — parte 2: resposta dos intérpretes, cancelamento e aceite',
      legenda: `Os três desfechos de uma demanda aberta: recusa individual, cancelamento pelo cliente (com a regra de taxa, decidida depois de bloquear a solicitação) e aceite exclusivo, com o intérprete bloqueado para que dois aceites dele não ocupem o mesmo horário (\`demanda.service.ts\` e \`cancelarSolicitacao\`). ${base}`,
      mermaid: p2.join('\n'),
      simbolos: [
        [`${S}/solicitacao.service.ts`, 'cancelarSolicitacao'],
        [`${S}/demanda.service.ts`, 'recusarDemanda'],
        [`${S}/demanda.service.ts`, 'aceitarDemanda'],
        [ELEG, 'avaliarElegibilidade'],
      ],
      codigos: ['DEMANDA_INDISPONIVEL', 'DEMANDA_EXPIRADA', 'FORA_DO_RAIO', 'FORA_DA_DISPONIBILIDADE', 'AGENDA_CONFLITANTE'],
      requisitos: ['RF19', 'RF22', 'RF23'],
      enums: { status_solicitacao: ['BUSCANDO', 'ACEITA', 'CANCELADA'], status_oferta: ['RECUSADA', 'EXPIRADA'], status_atendimento: ['AGENDADO'] },
    },
    {
      id: '17-fluxograma-3-encontro-e-checkin',
      item: '17',
      titulo: 'Fluxograma do atendimento — parte 3: encontro presencial e check-in',
      legenda: `A tela do intérprete só libera a leitura do QR depois da captura da posição do aparelho; no servidor, as quatro validações do check-in aparecem na mesma ordem de \`realizarCheckin\` (\`atendimento.service.ts\`): código do QR, janela de horário, precisão do GPS e distância ao local. ${base}`,
      mermaid: p3.join('\n'),
      simbolos: [[`${S}/atendimento.service.ts`, 'realizarCheckin']],
      codigos: ['QR_INVALIDO', 'FORA_DA_JANELA', 'PRECISAO_INSUFICIENTE', 'FORA_DO_LOCAL'],
      requisitos: ['RF28', 'RF30', 'RF31', 'RF32'],
      enums: { status_atendimento: ['AGENDADO', 'EM_ANDAMENTO'], status_solicitacao: ['EM_ANDAMENTO'] },
    },
    {
      id: '17-fluxograma-4-pagamento-e-avaliacao',
      item: '17',
      titulo: 'Fluxograma do atendimento — parte 4: encerramento, pagamento e avaliação',
      legenda: `Fechamento financeiro conforme \`encerrarAtendimento\` e \`processarPagamento\`, inclusive a resposta idempotente e a recusa do gateway, até a avaliação e o repasse. ${base}`,
      mermaid: p4.join('\n'),
      simbolos: [
        [`${S}/atendimento.service.ts`, 'encerrarAtendimento'],
        [`${S}/atendimento.service.ts`, 'calcularValorFinal'],
        [`${S}/pagamento.service.ts`, 'processarPagamento'],
        [`${S}/pagamento.service.ts`, 'creditoInterprete'],
        [`${S}/avaliacao.service.ts`, 'avaliarAtendimento'],
        [`${S}/pagamento.service.ts`, 'solicitarRepasse'],
      ],
      codigos: ['PAGAMENTO_RECUSADO'],
      requisitos: ['RF27', 'RF33', 'RF35', 'RF36', 'RF37', 'RF38', 'RF40', 'RF41', 'RF44'],
      enums: { status_pagamento: ['PENDENTE', 'PAGO', 'FALHOU'], status_atendimento: ['EM_ANDAMENTO'] },
    },
  ];
}

// ---------------------------------------------------------------------------------------------------------
// #23 — Máquinas de estado das entidades principais
// ---------------------------------------------------------------------------------------------------------
/**
 * Cada máquina lista as transições que o código executa: [de, para, evento (função/condição)].
 * '[*]' é o estado inicial/final. Os estados são conferidos contra o enum do banco; valores do enum que
 * nenhuma transição usa aparecem na legenda (ex.: previstos no modelo, sem uso no MVP).
 */
const MAQUINAS = [
  {
    id: '23-estados-1-solicitacao',
    enum: 'status_solicitacao',
    titulo: 'Máquina de estados — solicitação (RF16–RF19, RF22, RF31, RF33)',
    transicoes: [
      ['[*]', 'BUSCANDO', 'criarSolicitacao<br/>cotação + distribuição'],
      ['BUSCANDO', 'ACEITA', 'aceitarDemanda<br/>aceite exclusivo'],
      ['BUSCANDO', 'CANCELADA', 'cancelarSolicitacao<br/>sem custo'],
      ['ACEITA', 'CANCELADA', 'cancelarSolicitacao<br/>taxa se faltar menos de 24 h'],
      ['ACEITA', 'EM_ANDAMENTO', 'realizarCheckin<br/>QR + GPS'],
      ['EM_ANDAMENTO', 'CONCLUIDA', 'encerrarAtendimento'],
      ['CONCLUIDA', '[*]', ''],
      ['CANCELADA', '[*]', ''],
    ],
    simbolos: [
      [`${S}/solicitacao.service.ts`, 'criarSolicitacao'],
      [`${S}/demanda.service.ts`, 'aceitarDemanda'],
      [`${S}/solicitacao.service.ts`, 'cancelarSolicitacao'],
      [`${S}/atendimento.service.ts`, 'realizarCheckin'],
      [`${S}/atendimento.service.ts`, 'encerrarAtendimento'],
    ],
  },
  {
    id: '23-estados-2-atendimento',
    enum: 'status_atendimento',
    titulo: 'Máquina de estados — atendimento (RF22, RF31–RF33)',
    transicoes: [
      ['[*]', 'AGENDADO', 'aceitarDemanda<br/>QR do check-in gerado'],
      ['AGENDADO', 'EM_ANDAMENTO', 'realizarCheckin<br/>início real gravado'],
      ['AGENDADO', 'CANCELADO', 'cancelarSolicitacao<br/>localização encerrada'],
      ['EM_ANDAMENTO', 'CONCLUIDO', 'encerrarAtendimento<br/>duração real e valor final'],
      ['CONCLUIDO', '[*]', ''],
      ['CANCELADO', '[*]', ''],
    ],
    simbolos: [
      [`${S}/demanda.service.ts`, 'aceitarDemanda'],
      [`${S}/atendimento.service.ts`, 'realizarCheckin'],
      [`${S}/solicitacao.service.ts`, 'cancelarSolicitacao'],
      [`${S}/atendimento.service.ts`, 'encerrarAtendimento'],
    ],
  },
  {
    id: '23-estados-3-pagamento',
    enum: 'status_pagamento',
    titulo: 'Máquina de estados — pagamento (RF36, RF37)',
    transicoes: [
      ['[*]', 'PENDENTE', 'encerrarAtendimento'],
      ['PENDENTE', 'PAGO', 'processarPagamento<br/>gateway aprova'],
      ['PENDENTE', 'FALHOU', 'processarPagamento<br/>gateway recusa (402)'],
      ['FALHOU', 'PAGO', 'nova tentativa aprovada'],
      ['FALHOU', 'FALHOU', 'nova tentativa recusada'],
      ['PAGO', '[*]', 'comprovante emitido'],
    ],
    simbolos: [
      [`${S}/atendimento.service.ts`, 'encerrarAtendimento'],
      [`${S}/pagamento.service.ts`, 'processarPagamento'],
    ],
  },
  {
    id: '23-estados-4-habilitacao',
    enum: 'status_habilitacao',
    titulo: 'Máquina de estados — habilitação do intérprete (RF04–RF06, RNF36)',
    transicoes: [
      ['[*]', 'EM_ANALISE', 'cadastrarInterprete<br/>certificado enviado'],
      ['EM_ANALISE', 'APROVADO', 'registrarParecer<br/>APROVADO'],
      ['EM_ANALISE', 'CORRECAO_SOLICITADA', 'registrarParecer<br/>CORRECAO'],
      ['EM_ANALISE', 'REPROVADO', 'registrarParecer<br/>REPROVADO'],
      ['CORRECAO_SOLICITADA', 'EM_ANALISE', 'reenviarCertificacao'],
      ['REPROVADO', 'EM_ANALISE', 'reenviarCertificacao'],
      ['APROVADO', '[*]', 'recebe e aceita demandas'],
    ],
    simbolos: [
      [`${S}/cadastro.service.ts`, 'cadastrarInterprete'],
      [`${S}/backoffice.service.ts`, 'registrarParecer'],
      [`${S}/backoffice.service.ts`, 'reenviarCertificacao'],
    ],
  },
];

export function diagramasEstados(modelo) {
  return MAQUINAS.map((m) => {
    const valoresDoEnum = modelo.enums.find((e) => e.nome === m.enum)?.valores ?? [];
    const usados = [...new Set(m.transicoes.flatMap(([de, para]) => [de, para]).filter((s) => s !== '[*]'))];
    const semUso = valoresDoEnum.filter((v) => !usados.includes(v));
    const l = ['stateDiagram-v2', '  direction LR'];
    for (const [de, para, evento] of m.transicoes) l.push(`  ${de} --> ${para}${evento ? ` : ${evento}` : ''}`);
    return {
      id: m.id,
      item: '23',
      titulo: m.titulo,
      legenda:
        `Estados do enum \`${m.enum}\` do banco (\`backend/src/models/schema.ts\`) e as transições executadas pelos serviços, rotuladas com a função que as realiza. ` +
        (semUso.length ? `Valor${semUso.length > 1 ? 'es' : ''} do enum sem transição no MVP: ${semUso.map((v) => `\`${v}\``).join(', ')}.` : 'Todos os valores do enum aparecem no diagrama.'),
      mermaid: l.join('\n'),
      simbolos: m.simbolos,
      enums: { [m.enum]: usados },
    };
  });
}

// ---------------------------------------------------------------------------------------------------------
// #24 — Diagramas de operação (sequência das chamadas internas nas rotinas críticas)
// ---------------------------------------------------------------------------------------------------------
export function diagramasOperacao(R) {
  // 24a — aceite exclusivo -----------------------------------------------------------------------------
  const aceite = [
    'sequenceDiagram',
    '  autonumber',
    '  actor IA as Intérprete A',
    '  actor IB as Intérprete B',
    '  participant RT as routes/index.ts<br/>autenticar · exigirPapel',
    '  participant CT as demanda.controller<br/>aceitar',
    '  participant SV as demanda.service<br/>aceitarDemanda',
    '  participant DB as PostgreSQL',
    '  participant AP as notificacao.service<br/>auditoria.service',
    '  IA->>RT: POST /api/demandas/:id/aceitar<br/>Authorization: Bearer JWT',
    '  RT->>RT: autenticar() — JWT e sessão válidos<br/>exigirPapel(INTERPRETE)',
    '  RT->>CT: aceitar(req, res)',
    '  CT->>SV: aceitarDemanda(usuarioId,<br/>solicitacaoId, ip)',
    '  rect rgb(235, 235, 235)',
    '  Note over SV,DB: db.transaction — tudo ou nada',
    '  SV->>DB: SELECT interpretes WHERE usuario_id = :eu<br/>FOR NO KEY UPDATE (serializa meus aceites)',
    '  Note over SV: exigirHabilitado()<br/>não APROVADO → 403',
    '  SV->>DB: SELECT solicitacoes WHERE id = :id',
    '  Note over SV: status ≠ BUSCANDO → 409 DEMANDA_INDISPONIVEL<br/>horário já passou → 422 DEMANDA_EXPIRADA',
    '  SV->>DB: carregarContextoElegibilidade()<br/>grade semanal + atendimentos ativos',
    `  SV->>SV: avaliarElegibilidade() — raio ≤ min(raio_km, ${R.RAIO_MAXIMO_KM}),<br/>início na grade semanal, agenda livre`,
    '  Note over SV: 422 FORA_DO_RAIO · 422 FORA_DA_DISPONIBILIDADE<br/>409 AGENDA_CONFLITANTE',
    "  SV->>DB: UPDATE solicitacoes SET status = 'ACEITA'<br/>WHERE id = :id AND status = 'BUSCANDO'",
    '  DB-->>SV: 1 linha — a trava é deste intérprete',
    '  SV->>DB: INSERT atendimentos (solicitacao_id UNIQUE)<br/>INSERT checkins (qr_hash aleatório)',
    '  SV->>DB: UPDATE ofertas — a minha ACEITA,<br/>as demais EXPIRADA',
    '  SV->>AP: notificar(cliente, ACEITE)<br/>registrarEvento(ACEITE)',
    '  end',
    '  SV-->>CT: { atendimentoId, solicitacaoId, mensagem }',
    '  CT-->>IA: 201 Created',
    '  IB->>RT: POST /api/demandas/:id/aceitar<br/>(mesma demanda, logo depois)',
    '  RT->>CT: aceitar(req, res)',
    '  CT->>SV: aceitarDemanda(...)',
    '  SV->>DB: SELECT solicitacoes WHERE id = :id',
    '  DB-->>SV: status = ACEITA',
    '  SV-->>IB: 409 Conflict — DEMANDA_INDISPONIVEL<br/>(resposta montada por tratarErros)',
  ];

  // 24b — check-in geolocalizado -----------------------------------------------------------------------
  const checkin = [
    'sequenceDiagram',
    '  autonumber',
    '  actor CL as Cliente',
    '  actor IN as Intérprete',
    '  participant RT as routes/index.ts<br/>autenticar · exigirPapel · validar',
    '  participant CT as atendimento.controller<br/>qrcode · checkin',
    '  participant SV as atendimento.service<br/>obterQrCode · realizarCheckin',
    '  participant DB as PostgreSQL',
    '  participant AP as notificacao.service<br/>auditoria.service',
    '  CL->>RT: GET /api/atendimentos/:id/qrcode',
    '  RT->>CT: qrcode(req, res) — só CLIENTE',
    '  CT->>SV: obterQrCode(atendimentoId, usuarioId)',
    '  SV->>DB: carregarAtendimento()<br/>SELECT atendimentos + checkin',
    `  SV-->>CL: 200 { codigo, conteudo VIAMOS:id:codigo,<br/>disponivelApartirDe = início − ${R.CHECKIN_ANTECEDENCIA_MIN} min }`,
    '  Note over CL,IN: no local, o intérprete captura a posição do GPS<br/>(a tela só libera a leitura depois disso) e lê o QR do cliente',
    '  IN->>RT: POST /api/atendimentos/:id/checkin<br/>{ codigo, latitude, longitude, precisaoM }',
    '  RT->>RT: validar(esquemaCheckin)<br/>corpo inválido → 400',
    '  RT->>CT: checkin(req, res) — só INTERPRETE',
    '  CT->>SV: realizarCheckin(atendimentoId,<br/>interpreteId, entrada, ip)',
    '  SV->>DB: carregarAtendimento()',
    '  Note over SV: não é o intérprete alocado → 403<br/>já EM_ANDAMENTO → 409 CHECKIN_DUPLICADO<br/>não está AGENDADO → 422 ESTADO_INVALIDO',
    '  Note over SV: código ≠ checkins.qr_hash → 422 QR_INVALIDO',
    `  Note over SV: agora < início − ${R.CHECKIN_ANTECEDENCIA_MIN} min → 422 FORA_DA_JANELA`,
    `  Note over SV: precisaoM > ${R.CHECKIN_PRECISAO_MAXIMA_M} → 422 PRECISAO_INSUFICIENTE`,
    '  SV->>SV: distanciaMetros(posição enviada,<br/>local da solicitação)',
    `  Note over SV: distância > ${R.CHECKIN_DISTANCIA_MAXIMA_M} m → 422 FORA_DO_LOCAL`,
    '  rect rgb(235, 235, 235)',
    '  Note over SV,DB: db.transaction',
    '  SV->>DB: SELECT solicitacoes FOR NO KEY UPDATE<br/>(mesma ordem de bloqueio do cancelamento)',
    '  Note over SV: já EM_ANDAMENTO → 409 · não ACEITA (cancelada) → 422',
    "  SV->>DB: UPDATE atendimentos SET status = 'EM_ANDAMENTO',<br/>inicio_real = agora WHERE status = 'AGENDADO'",
    '  SV->>DB: UPDATE checkins SET lido_em, latitude,<br/>longitude, precisao_m, distancia_m',
    "  SV->>DB: UPDATE solicitacoes<br/>SET status = 'EM_ANDAMENTO'",
    '  SV->>DB: INSERT mensagens (tipo SISTEMA)',
    '  SV->>AP: notificar(cliente, LEMBRETE)<br/>registrarEvento(CHECKIN)',
    '  end',
    '  SV-->>CT: { atendimentoId, status,<br/>inicioReal, distanciaM }',
    '  CT-->>IN: 200 OK',
  ];

  // 24c — encerramento ------------------------------------------------------------------------------------
  const encerramento = [
    'sequenceDiagram',
    '  autonumber',
    '  actor US as Intérprete<br/>ou cliente',
    '  participant CT as atendimento.controller<br/>encerrar',
    '  participant AT as atendimento.service<br/>encerrarAtendimento',
    '  participant DB as PostgreSQL',
    '  participant AP as notificacao.service<br/>auditoria.service',
    '  US->>CT: POST /api/atendimentos/:id/encerrar',
    '  CT->>AT: encerrarAtendimento(atendimentoId,<br/>usuarioId, papel, ip)',
    '  AT->>DB: exigirParticipante()<br/>SELECT atendimento completo',
    '  Note over AT: não participa do atendimento → 403<br/>já CONCLUIDO → 409 ENCERRAMENTO_DUPLICADO<br/>não está EM_ANDAMENTO → 422 ESTADO_INVALIDO',
    `  AT->>AT: calcularValorFinal(cotação, previsto, real)<br/>cobra o maior entre o contratado e o real<br/>arredondado em blocos de ${R.COBRANCA.BLOCO_EXCEDENTE_MIN} min (D-03)`,
    '  rect rgb(235, 235, 235)',
    '  Note over AT,DB: db.transaction',
    "  AT->>DB: UPDATE atendimentos SET status = 'CONCLUIDO',<br/>fim_real, duracao_real_min, valor_final<br/>WHERE status = 'EM_ANDAMENTO'",
    "  AT->>DB: UPDATE solicitacoes<br/>SET status = 'CONCLUIDA'",
    '  AT->>DB: UPDATE localizacoes_compartilhadas<br/>SET encerrada_em = agora',
    '  AT->>DB: INSERT pagamentos<br/>(status PENDENTE, valor final)',
    '  AT->>DB: INSERT mensagens (tipo SISTEMA)',
    '  AT->>AP: notificar() para cliente e intérprete<br/>registrarEvento(ENCERRAMENTO)',
    '  end',
    '  AT-->>CT: { status, duracaoRealMin,<br/>valorFinal, pagamentoId }',
    '  CT-->>US: 200 OK',
  ];

  // 24d — pagamento e comprovante ---------------------------------------------------------------------------
  const pagamento = [
    'sequenceDiagram',
    '  autonumber',
    '  actor CL as Cliente',
    '  participant CT as pagamento.controller<br/>atendimento.controller',
    '  participant PG as pagamento.service<br/>processarPagamento',
    '  participant GW as gateway.service<br/>cobrar',
    '  participant CP as comprovante.service<br/>gerarComprovantePdf',
    '  participant DB as PostgreSQL',
    '  CL->>CT: POST /api/pagamentos/:id/processar<br/>{ formaPagamentoId ou meio }',
    '  CT->>PG: processarPagamento(pagamentoId,<br/>clienteId, entrada, ip)',
    '  PG->>DB: SELECT pagamentos + atendimento + solicitacao',
    '  Note over PG: não é o cliente do atendimento → 403<br/>não CONCLUIDO → 422 ATENDIMENTO_NAO_CONCLUIDO',
    '  rect rgb(235, 235, 235)',
    '  Note over PG,DB: db.transaction',
    '  PG->>DB: SELECT pagamentos WHERE atendimento_id = :id<br/>FOR UPDATE (serializa cobranças simultâneas)',
    "  PG->>DB: SELECT pagamentos WHERE atendimento_id = :id AND status = 'PAGO'",
    '  alt já existe pagamento PAGO',
    '  PG-->>CL: 200 { repetido: true } — nada é cobrado de novo',
    '  else ainda não pago',
    '  PG->>GW: cobrar({ valor, meio,<br/>tokenCartao, finalCartao })',
    '  GW-->>PG: { aprovado, referencia, mensagem }',
    "  PG->>DB: UPDATE pagamentos SET status = PAGO ou FALHOU WHERE status IN ('PENDENTE', 'FALHOU')",
    '  PG->>DB: registrarEvento(PAGAMENTO)',
    '  opt gateway aprovou',
    '  PG->>PG: creditoInterprete(valor pago,<br/>deslocamento)',
    '  PG->>DB: INSERT lancamentos_financeiros (CREDITO_ATENDIMENTO)',
    '  PG->>DB: INSERT comprovantes ON CONFLICT DO NOTHING',
    '  PG->>DB: notificar() para cliente e intérprete',
    '  end',
    '  PG-->>CL: 200 OK (PAGO) ou 402 PAGAMENTO_RECUSADO',
    '  end',
    '  end',
    '  CL->>CT: GET /api/atendimentos/:id/comprovante.pdf',
    '  CT->>CP: gerarComprovantePdf(atendimentoId,<br/>usuarioId, papel)',
    '  CP->>DB: exigirParticipante() · SELECT clientes (CPF a mascarar)',
    '  Note over CP: sem comprovante emitido → 422 COMPROVANTE_INDISPONIVEL',
    '  CP->>CP: gerarPdfComprovante(dados)<br/>views/comprovante.pdf.ts',
    '  CP-->>CL: 200 application/pdf',
  ];

  return [
    {
      id: '24-operacao-a-aceite-exclusivo',
      item: '24',
      titulo: 'Diagrama de operação — aceite exclusivo da demanda (RF22)',
      legenda:
        'Sequência das chamadas internas quando dois intérpretes tentam aceitar a mesma demanda. Toda a verificação acontece numa transação que começa bloqueando o registro do intérprete (dois aceites dele não ocupam o mesmo horário) e aplica a mesma regra de elegibilidade da lista (D-20). ' +
        'A exclusividade entre intérpretes é garantida pelo `UPDATE … WHERE status = \'BUSCANDO\'` e pelo índice único de `atendimentos.solicitacao_id`; quem chega depois recebe 409.',
      mermaid: aceite.join('\n'),
      simbolos: [
        ['backend/src/middlewares/auth.ts', 'autenticar'],
        ['backend/src/middlewares/auth.ts', 'exigirPapel'],
        ['backend/src/middlewares/erros.ts', 'tratarErros'],
        [`${C}/demanda.controller.ts`, 'aceitar'],
        [`${S}/demanda.service.ts`, 'aceitarDemanda'],
        [`${S}/demanda.service.ts`, 'exigirHabilitado'],
        [`${S}/demanda.service.ts`, 'carregarContextoElegibilidade'],
        [ELEG, 'avaliarElegibilidade'],
        [`${S}/notificacao.service.ts`, 'notificar'],
        [`${S}/auditoria.service.ts`, 'registrarEvento'],
      ],
      codigos: ['DEMANDA_INDISPONIVEL', 'DEMANDA_EXPIRADA', 'FORA_DO_RAIO', 'FORA_DA_DISPONIBILIDADE', 'AGENDA_CONFLITANTE'],
      requisitos: ['RF22'],
    },
    {
      id: '24-operacao-b-checkin',
      item: '24',
      titulo: 'Diagrama de operação — check-in por QR Code e geolocalização (RF31, RF32)',
      legenda:
        'O cliente obtém o código do QR; o intérprete o envia com a posição do GPS. O serviço valida, nesta ordem: participante e estado, código, janela de horário, precisão do GPS e distância ao local. ' +
        'Na transação, a solicitação é bloqueada na mesma ordem usada pelo cancelamento (sem disputa invertida de bloqueios) e o estado é conferido de novo antes de iniciar o atendimento.',
      mermaid: checkin.join('\n'),
      simbolos: [
        ['backend/src/middlewares/validar.ts', 'validar'],
        [`${C}/atendimento.controller.ts`, 'qrcode'],
        [`${C}/atendimento.controller.ts`, 'checkin'],
        [`${C}/atendimento.controller.ts`, 'esquemaCheckin'],
        [`${S}/atendimento.service.ts`, 'obterQrCode'],
        [`${S}/atendimento.service.ts`, 'realizarCheckin'],
        [`${S}/atendimento.service.ts`, 'carregarAtendimento'],
        ['backend/src/utils/geo.ts', 'distanciaMetros'],
        [`${S}/notificacao.service.ts`, 'notificar'],
        [`${S}/auditoria.service.ts`, 'registrarEvento'],
      ],
      codigos: ['CHECKIN_DUPLICADO', 'ESTADO_INVALIDO', 'QR_INVALIDO', 'FORA_DA_JANELA', 'PRECISAO_INSUFICIENTE', 'FORA_DO_LOCAL'],
      requisitos: ['RF31', 'RF32'],
    },
    {
      id: '24-operacao-c-encerramento',
      item: '24',
      titulo: 'Diagrama de operação — encerramento do atendimento (RF33)',
      legenda:
        'Cliente ou intérprete encerra o atendimento em andamento. O serviço apura a duração real, calcula o valor final pela regra D-03 e, em uma única transação, conclui o atendimento e a solicitação, ' +
        'encerra o compartilhamento de localização e cria o pagamento pendente. O `WHERE status = \'EM_ANDAMENTO\'` impede o encerramento em duplicidade.',
      mermaid: encerramento.join('\n'),
      simbolos: [
        [`${C}/atendimento.controller.ts`, 'encerrar'],
        [`${S}/atendimento.service.ts`, 'encerrarAtendimento'],
        [`${S}/atendimento.service.ts`, 'exigirParticipante'],
        [`${S}/atendimento.service.ts`, 'calcularValorFinal'],
        [`${S}/notificacao.service.ts`, 'notificar'],
        [`${S}/auditoria.service.ts`, 'registrarEvento'],
      ],
      codigos: ['ENCERRAMENTO_DUPLICADO', 'ESTADO_INVALIDO'],
      requisitos: ['RF33'],
    },
    {
      id: '24-operacao-d-pagamento-comprovante',
      item: '24',
      titulo: 'Diagrama de operação — pagamento idempotente e comprovante (RF36, RF37)',
      legenda:
        'A cobrança começa bloqueando os pagamentos do atendimento: duas chamadas simultâneas são serializadas e a segunda encontra o pagamento já PAGO, devolvendo o mesmo resultado sem chamar o gateway de novo. ' +
        'Aprovado pelo gateway, a mesma transação credita o intérprete e emite o comprovante, que depois é entregue em PDF; recusado, a API responde 402 e o cliente pode tentar outra forma.',
      mermaid: pagamento.join('\n'),
      simbolos: [
        [`${C}/atendimento.controller.ts`, 'comprovantePdf'],
        [`${C}/pagamento.controller.ts`, 'processar'],
        [`${S}/atendimento.service.ts`, 'exigirParticipante'],
        [`${S}/pagamento.service.ts`, 'processarPagamento'],
        [`${S}/pagamento.service.ts`, 'creditoInterprete'],
        [`${S}/gateway.service.ts`, 'cobrar'],
        [`${S}/comprovante.service.ts`, 'gerarComprovantePdf'],
        ['backend/src/views/comprovante.pdf.ts', 'gerarPdfComprovante'],
      ],
      codigos: ['ATENDIMENTO_NAO_CONCLUIDO', 'PAGAMENTO_RECUSADO', 'COMPROVANTE_INDISPONIVEL'],
      requisitos: ['RF36', 'RF37'],
    },
  ];
}
