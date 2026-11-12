/**
 * MODEL — Esquema do banco de dados do Víamos (PostgreSQL via Drizzle ORM).
 *
 * Este arquivo é a FONTE ÚNICA do Diagrama de Entidade-Relacionamento (DER):
 * as migrações SQL em `backend/drizzle/` e a figura do DER em `docs/` são geradas a partir dele
 * (itens #22, #38, #39 e #41 do checklist).
 *
 * Nomenclatura: segue as classes do modelo de análise entregue em 07/10 (DC1–DC11):
 * Usuario, Cliente, Interprete, Operador(papel do Usuario), Certificacao, AnaliseDocumental,
 * Disponibilidade, Solicitacao(+Local absorvido), Cotacao, Oferta, Atendimento, CheckIn(QR),
 * Mensagem, LocalizacaoCompartilhada, ChamadoSuporte, FormaPagamento, Pagamento,
 * LancamentoFinanceiro, ContaBancaria, Repasse, Avaliacao, Comprovante, Consentimento,
 * SolicitacaoDados, Notificacao, Sessao, TokenRecuperacao, EventoAuditoria.
 */
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  customType,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Tipo binário (bytea) para armazenar o arquivo digitalizado do certificado (≤ 5 MB).
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

// ---------------------------------------------------------------------------
// ENUMs (domínios fechados do negócio)
// ---------------------------------------------------------------------------
export const papelUsuarioEnum = pgEnum('papel_usuario', ['CLIENTE', 'INTERPRETE', 'BACKOFFICE', 'SUPORTE']);
export const statusHabilitacaoEnum = pgEnum('status_habilitacao', [
  'PENDENTE',
  'EM_ANALISE',
  'APROVADO',
  'REPROVADO',
  'CORRECAO_SOLICITADA',
]);
export const tipoCertificacaoEnum = pgEnum('tipo_certificacao', ['PROLIBRAS', 'EQUIVALENTE']);
export const statusCertificacaoEnum = pgEnum('status_certificacao', [
  'EM_ANALISE',
  'APROVADA',
  'REPROVADA',
  'CORRECAO_SOLICITADA',
]);
export const resultadoAnaliseEnum = pgEnum('resultado_analise', ['APROVADO', 'REPROVADO', 'CORRECAO']);
export const tipoServicoEnum = pgEnum('tipo_servico', ['SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO']);
export const statusSolicitacaoEnum = pgEnum('status_solicitacao', [
  'BUSCANDO',
  'ACEITA',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'CANCELADA',
]);
export const statusOfertaEnum = pgEnum('status_oferta', ['ENVIADA', 'ACEITA', 'RECUSADA', 'EXPIRADA']);
export const statusAtendimentoEnum = pgEnum('status_atendimento', ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']);
export const tipoMensagemEnum = pgEnum('tipo_mensagem', ['TEXTO', 'IMAGEM', 'LOCALIZACAO', 'SISTEMA']);
export const tipoChamadoEnum = pgEnum('tipo_chamado', ['SUPORTE', 'EMERGENCIA']);
export const statusChamadoEnum = pgEnum('status_chamado', ['ABERTO', 'EM_ATENDIMENTO', 'ENCERRADO']);
export const tipoFormaPagamentoEnum = pgEnum('tipo_forma_pagamento', ['PIX', 'CARTAO']);
export const statusPagamentoEnum = pgEnum('status_pagamento', ['PENDENTE', 'PAGO', 'FALHOU', 'ESTORNADO']);
export const tipoLancamentoEnum = pgEnum('tipo_lancamento', ['CREDITO_ATENDIMENTO', 'DEBITO_REPASSE', 'ESTORNO']);
export const statusRepasseEnum = pgEnum('status_repasse', ['SOLICITADO', 'PROCESSANDO', 'PAGO', 'FALHOU']);
export const finalidadeConsentimentoEnum = pgEnum('finalidade_consentimento', [
  'TERMOS_USO',
  'PRIVACIDADE',
  'LOCALIZACAO',
  'NOTIFICACOES',
]);
export const tipoSolicitacaoDadosEnum = pgEnum('tipo_solicitacao_dados', ['EXPORTACAO', 'EXCLUSAO']);
export const statusSolicitacaoDadosEnum = pgEnum('status_solicitacao_dados', ['ABERTA', 'CONCLUIDA', 'NEGADA']);
export const tipoNotificacaoEnum = pgEnum('tipo_notificacao', [
  'ACEITE',
  'LEMBRETE',
  'MENSAGEM',
  'PAGAMENTO',
  'CERTIFICACAO',
  'SOLICITACAO',
  'SISTEMA',
]);

// ---------------------------------------------------------------------------
// Identidade e perfis (DC1, DC11)
// ---------------------------------------------------------------------------
export const usuarios = pgTable(
  'usuarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: varchar('nome', { length: 120 }).notNull(),
    email: varchar('email', { length: 160 }).notNull(),
    senhaHash: varchar('senha_hash', { length: 100 }).notNull(), // bcrypt (RNF07)
    telefone: varchar('telefone', { length: 20 }).notNull(),
    papel: papelUsuarioEnum('papel').notNull(),
    fotoUrl: text('foto_url'),
    ativo: boolean('ativo').notNull().default(true),
    // Credencial (DC11): controle de tentativas e bloqueio temporário (RNF35)
    tentativasFalhas: integer('tentativas_falhas').notNull().default(0),
    bloqueadoAte: timestamp('bloqueado_ate', { withTimezone: true }),
    doisFatoresAtivo: boolean('dois_fatores_ativo').notNull().default(false),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('usuarios_email_unique').on(sql`lower(${t.email})`)],
);

export const clientes = pgTable('clientes', {
  usuarioId: uuid('usuario_id')
    .primaryKey()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  cpf: varchar('cpf', { length: 11 }).notNull().unique(),
  dataNascimento: date('data_nascimento').notNull(),
  cep: varchar('cep', { length: 8 }),
  endereco: text('endereco'),
  preferenciasAcessibilidade: text('preferencias_acessibilidade'),
});

export const interpretes = pgTable(
  'interpretes',
  {
    usuarioId: uuid('usuario_id')
      .primaryKey()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    documento: varchar('documento', { length: 14 }).notNull().unique(), // CPF ou CNPJ
    enderecoBase: text('endereco_base').notNull(),
    latitudeBase: doublePrecision('latitude_base').notNull(),
    longitudeBase: doublePrecision('longitude_base').notNull(),
    especialidades: text('especialidades').array().notNull().default(sql`'{}'::text[]`),
    precoHora: numeric('preco_hora', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    raioKm: integer('raio_km').notNull().default(15), // RF24 / RNF27: máximo 15 km
    disponivelAgora: boolean('disponivel_agora').notNull().default(false), // toggle "Ficar Online"
    statusHabilitacao: statusHabilitacaoEnum('status_habilitacao').notNull().default('PENDENTE'), // RF06 / RNF36
    reputacao: numeric('reputacao', { precision: 3, scale: 2, mode: 'number' }), // RF41 (média das avaliações)
    totalAvaliacoes: integer('total_avaliacoes').notNull().default(0),
  },
  (t) => [check('interpretes_raio_km_check', sql`${t.raioKm} BETWEEN 1 AND 15`)],
);

export const certificacoes = pgTable('certificacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  interpreteId: uuid('interprete_id')
    .notNull()
    .references(() => interpretes.usuarioId, { onDelete: 'cascade' }),
  tipo: tipoCertificacaoEnum('tipo').notNull(),
  numero: varchar('numero', { length: 60 }).notNull(),
  nomeArquivo: varchar('nome_arquivo', { length: 200 }).notNull(),
  mimeArquivo: varchar('mime_arquivo', { length: 80 }).notNull(),
  arquivo: bytea('arquivo').notNull(),
  tamanhoBytes: integer('tamanho_bytes').notNull(),
  status: statusCertificacaoEnum('status').notNull().default('EM_ANALISE'),
  enviadaEm: timestamp('enviada_em', { withTimezone: true }).notNull().defaultNow(),
});

export const analisesDocumentais = pgTable('analises_documentais', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificacaoId: uuid('certificacao_id')
    .notNull()
    .references(() => certificacoes.id, { onDelete: 'cascade' }),
  operadorId: uuid('operador_id')
    .notNull()
    .references(() => usuarios.id),
  resultado: resultadoAnaliseEnum('resultado').notNull(),
  justificativa: text('justificativa'),
  data: timestamp('data', { withTimezone: true }).notNull().defaultNow(),
});

export const disponibilidades = pgTable(
  'disponibilidades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    interpreteId: uuid('interprete_id')
      .notNull()
      .references(() => interpretes.usuarioId, { onDelete: 'cascade' }),
    diaSemana: smallint('dia_semana').notNull(), // 0 = domingo ... 6 = sábado
    inicio: time('inicio').notNull(),
    fim: time('fim').notNull(),
  },
  (t) => [check('disponibilidades_dia_semana_check', sql`${t.diaSemana} BETWEEN 0 AND 6`)],
);

// ---------------------------------------------------------------------------
// Solicitação, cotação, distribuição e aceite (DC3, DC4)
// ---------------------------------------------------------------------------
export const solicitacoes = pgTable(
  'solicitacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clienteId: uuid('cliente_id')
      .notNull()
      .references(() => clientes.usuarioId),
    tipoServico: tipoServicoEnum('tipo_servico').notNull(),
    inicioPrevisto: timestamp('inicio_previsto', { withTimezone: true }).notNull(),
    duracaoPrevistaMin: integer('duracao_prevista_min').notNull(), // RF13: mínimo 60
    // Local (classe Local absorvida como atributos da solicitação)
    endereco: text('endereco').notNull(),
    complemento: varchar('complemento', { length: 120 }),
    pontoReferencia: varchar('ponto_referencia', { length: 200 }),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    observacoes: varchar('observacoes', { length: 300 }),
    status: statusSolicitacaoEnum('status').notNull().default('BUSCANDO'),
    canceladaEm: timestamp('cancelada_em', { withTimezone: true }),
    motivoCancelamento: varchar('motivo_cancelamento', { length: 300 }),
    taxaCancelamento: numeric('taxa_cancelamento', { precision: 10, scale: 2, mode: 'number' }),
    criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadaEm: timestamp('atualizada_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('solicitacoes_duracao_min_check', sql`${t.duracaoPrevistaMin} >= 60`),
    index('solicitacoes_status_idx').on(t.status),
    index('solicitacoes_cliente_idx').on(t.clienteId),
  ],
);

export const cotacoes = pgTable('cotacoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  solicitacaoId: uuid('solicitacao_id')
    .notNull()
    .unique()
    .references(() => solicitacoes.id, { onDelete: 'cascade' }),
  valorServico: numeric('valor_servico', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  valorDeslocamento: numeric('valor_deslocamento', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  taxaPlataforma: numeric('taxa_plataforma', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  versaoRegra: varchar('versao_regra', { length: 20 }).notNull(),
  calculadaEm: timestamp('calculada_em', { withTimezone: true }).notNull().defaultNow(),
});

export const ofertas = pgTable(
  'ofertas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    solicitacaoId: uuid('solicitacao_id')
      .notNull()
      .references(() => solicitacoes.id, { onDelete: 'cascade' }),
    interpreteId: uuid('interprete_id')
      .notNull()
      .references(() => interpretes.usuarioId, { onDelete: 'cascade' }),
    distanciaKm: numeric('distancia_km', { precision: 6, scale: 2, mode: 'number' }).notNull(),
    status: statusOfertaEnum('status').notNull().default('ENVIADA'),
    enviadaEm: timestamp('enviada_em', { withTimezone: true }).notNull().defaultNow(),
    respondidaEm: timestamp('respondida_em', { withTimezone: true }),
    motivoRecusa: varchar('motivo_recusa', { length: 300 }),
  },
  (t) => [uniqueIndex('ofertas_solicitacao_interprete_unique').on(t.solicitacaoId, t.interpreteId)],
);

// ---------------------------------------------------------------------------
// Atendimento presencial (DC4, DC5, DC6)
// ---------------------------------------------------------------------------
export const atendimentos = pgTable(
  'atendimentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    solicitacaoId: uuid('solicitacao_id')
      .notNull()
      .unique() // uma solicitação gera no máximo UM atendimento (aceite exclusivo)
      .references(() => solicitacoes.id),
    interpreteId: uuid('interprete_id')
      .notNull()
      .references(() => interpretes.usuarioId),
    aceitoEm: timestamp('aceito_em', { withTimezone: true }).notNull().defaultNow(),
    inicioReal: timestamp('inicio_real', { withTimezone: true }),
    fimReal: timestamp('fim_real', { withTimezone: true }),
    duracaoRealMin: integer('duracao_real_min'),
    valorFinal: numeric('valor_final', { precision: 10, scale: 2, mode: 'number' }),
    status: statusAtendimentoEnum('status').notNull().default('AGENDADO'),
  },
  (t) => [index('atendimentos_interprete_idx').on(t.interpreteId)],
);

export const checkins = pgTable('checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  atendimentoId: uuid('atendimento_id')
    .notNull()
    .unique()
    .references(() => atendimentos.id, { onDelete: 'cascade' }),
  qrHash: varchar('qr_hash', { length: 64 }).notNull().unique(), // conteúdo do QR exibido pelo cliente
  emitidoEm: timestamp('emitido_em', { withTimezone: true }).notNull().defaultNow(),
  lidoEm: timestamp('lido_em', { withTimezone: true }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  precisaoM: doublePrecision('precisao_m'),
  distanciaM: doublePrecision('distancia_m'),
});

export const mensagens = pgTable(
  'mensagens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    atendimentoId: uuid('atendimento_id')
      .notNull()
      .references(() => atendimentos.id, { onDelete: 'cascade' }),
    autorId: uuid('autor_id').references(() => usuarios.id), // null = mensagem do sistema
    tipo: tipoMensagemEnum('tipo').notNull().default('TEXTO'),
    texto: varchar('texto', { length: 1000 }),
    arquivoUri: text('arquivo_uri'), // foto do ponto de referência (data URL pequena) — RF30
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    enviadaEm: timestamp('enviada_em', { withTimezone: true }).notNull().defaultNow(),
    lidaEm: timestamp('lida_em', { withTimezone: true }),
  },
  (t) => [index('mensagens_atendimento_idx').on(t.atendimentoId, t.enviadaEm)],
);

export const localizacoesCompartilhadas = pgTable('localizacoes_compartilhadas', {
  id: uuid('id').primaryKey().defaultRandom(),
  atendimentoId: uuid('atendimento_id')
    .notNull()
    .references(() => atendimentos.id, { onDelete: 'cascade' }),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  precisaoM: doublePrecision('precisao_m'),
  registradaEm: timestamp('registrada_em', { withTimezone: true }).notNull().defaultNow(),
  encerradaEm: timestamp('encerrada_em', { withTimezone: true }),
});

export const chamadosSuporte = pgTable('chamados_suporte', {
  id: uuid('id').primaryKey().defaultRandom(),
  atendimentoId: uuid('atendimento_id').references(() => atendimentos.id),
  solicitanteId: uuid('solicitante_id')
    .notNull()
    .references(() => usuarios.id),
  operadorId: uuid('operador_id').references(() => usuarios.id),
  tipo: tipoChamadoEnum('tipo').notNull(),
  descricao: varchar('descricao', { length: 500 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  status: statusChamadoEnum('status').notNull().default('ABERTO'),
  abertoEm: timestamp('aberto_em', { withTimezone: true }).notNull().defaultNow(),
  encerradoEm: timestamp('encerrado_em', { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Financeiro (DC7, DC8)
// ---------------------------------------------------------------------------
export const formasPagamento = pgTable('formas_pagamento', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id')
    .notNull()
    .references(() => clientes.usuarioId, { onDelete: 'cascade' }),
  tipo: tipoFormaPagamentoEnum('tipo').notNull(),
  chavePix: varchar('chave_pix', { length: 120 }),
  tokenGateway: varchar('token_gateway', { length: 120 }), // RNF37: nunca o número do cartão
  bandeira: varchar('bandeira', { length: 30 }),
  finalCartao: varchar('final_cartao', { length: 4 }),
  principal: boolean('principal').notNull().default(false),
  ativa: boolean('ativa').notNull().default(true),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
});

export const pagamentos = pgTable(
  'pagamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    atendimentoId: uuid('atendimento_id')
      .notNull()
      .references(() => atendimentos.id),
    formaPagamentoId: uuid('forma_pagamento_id').references(() => formasPagamento.id),
    valor: numeric('valor', { precision: 10, scale: 2, mode: 'number' }).notNull(),
    meio: tipoFormaPagamentoEnum('meio'),
    status: statusPagamentoEnum('status').notNull().default('PENDENTE'),
    referenciaGateway: varchar('referencia_gateway', { length: 80 }).unique(),
    mensagemGateway: varchar('mensagem_gateway', { length: 200 }),
    tentativas: integer('tentativas').notNull().default(0),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    confirmadoEm: timestamp('confirmado_em', { withTimezone: true }),
  },
  (t) => [
    // no máximo UM pagamento confirmado por atendimento (idempotência da cobrança)
    uniqueIndex('pagamentos_um_pago_por_atendimento')
      .on(t.atendimentoId)
      .where(sql`${t.status} = 'PAGO'`),
  ],
);

export const contasBancarias = pgTable('contas_bancarias', {
  id: uuid('id').primaryKey().defaultRandom(),
  interpreteId: uuid('interprete_id')
    .notNull()
    .references(() => interpretes.usuarioId, { onDelete: 'cascade' }),
  banco: varchar('banco', { length: 60 }).notNull(),
  agencia: varchar('agencia', { length: 10 }).notNull(),
  conta: varchar('conta', { length: 20 }).notNull(),
  titular: varchar('titular', { length: 120 }).notNull(),
  chavePix: varchar('chave_pix', { length: 120 }),
  principal: boolean('principal').notNull().default(true),
});

export const repasses = pgTable('repasses', {
  id: uuid('id').primaryKey().defaultRandom(),
  interpreteId: uuid('interprete_id')
    .notNull()
    .references(() => interpretes.usuarioId),
  contaBancariaId: uuid('conta_bancaria_id').references(() => contasBancarias.id),
  valor: numeric('valor', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  status: statusRepasseEnum('status').notNull().default('SOLICITADO'),
  referenciaGateway: varchar('referencia_gateway', { length: 80 }),
  solicitadoEm: timestamp('solicitado_em', { withTimezone: true }).notNull().defaultNow(),
  concluidoEm: timestamp('concluido_em', { withTimezone: true }),
});

export const lancamentosFinanceiros = pgTable(
  'lancamentos_financeiros',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    interpreteId: uuid('interprete_id')
      .notNull()
      .references(() => interpretes.usuarioId),
    pagamentoId: uuid('pagamento_id').references(() => pagamentos.id),
    repasseId: uuid('repasse_id').references(() => repasses.id),
    tipo: tipoLancamentoEnum('tipo').notNull(),
    valor: numeric('valor', { precision: 10, scale: 2, mode: 'number' }).notNull(), // positivo = crédito, negativo = débito
    descricao: varchar('descricao', { length: 200 }),
    data: timestamp('data', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('lancamentos_interprete_idx').on(t.interpreteId, t.data),
    // cada lançamento vem de pagamento OU de repasse (DC8)
    check(
      'lancamentos_origem_check',
      sql`(${t.pagamentoId} IS NOT NULL AND ${t.repasseId} IS NULL) OR (${t.pagamentoId} IS NULL AND ${t.repasseId} IS NOT NULL)`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Pós-atendimento (DC9)
// ---------------------------------------------------------------------------
export const avaliacoes = pgTable(
  'avaliacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    atendimentoId: uuid('atendimento_id')
      .notNull()
      .references(() => atendimentos.id, { onDelete: 'cascade' }),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => usuarios.id),
    avaliadoId: uuid('avaliado_id')
      .notNull()
      .references(() => usuarios.id),
    nota: smallint('nota').notNull(),
    comentario: varchar('comentario', { length: 500 }),
    data: timestamp('data', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('avaliacoes_autor_por_atendimento_unique').on(t.atendimentoId, t.autorId), // uma avaliação por autor
    check('avaliacoes_nota_check', sql`${t.nota} BETWEEN 1 AND 5`),
    check('avaliacoes_autor_diferente_check', sql`${t.autorId} <> ${t.avaliadoId}`),
  ],
);

export const comprovantes = pgTable('comprovantes', {
  id: uuid('id').primaryKey().defaultRandom(),
  atendimentoId: uuid('atendimento_id')
    .notNull()
    .unique()
    .references(() => atendimentos.id),
  codigoVerificacao: uuid('codigo_verificacao').notNull().unique().defaultRandom(), // RNF41
  dataAtendimento: timestamp('data_atendimento', { withTimezone: true }).notNull(),
  urlPdf: text('url_pdf').notNull(),
  emitidoEm: timestamp('emitido_em', { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Privacidade, notificações, sessões e auditoria (DC10, DC11)
// ---------------------------------------------------------------------------
export const consentimentos = pgTable('consentimentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  finalidade: finalidadeConsentimentoEnum('finalidade').notNull(),
  versaoTermo: varchar('versao_termo', { length: 20 }).notNull(),
  concedidoEm: timestamp('concedido_em', { withTimezone: true }).notNull().defaultNow(),
  revogadoEm: timestamp('revogado_em', { withTimezone: true }),
});

export const solicitacoesDados = pgTable('solicitacoes_dados', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  tipo: tipoSolicitacaoDadosEnum('tipo').notNull(),
  status: statusSolicitacaoDadosEnum('status').notNull().default('ABERTA'),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
  concluidaEm: timestamp('concluida_em', { withTimezone: true }),
});

export const notificacoes = pgTable(
  'notificacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    tipo: tipoNotificacaoEnum('tipo').notNull(),
    titulo: varchar('titulo', { length: 120 }).notNull(),
    conteudo: varchar('conteudo', { length: 500 }).notNull(),
    referenciaRecurso: varchar('referencia_recurso', { length: 200 }), // ex.: /cliente/solicitacoes/<id>
    lida: boolean('lida').notNull().default(false),
    criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notificacoes_usuario_idx').on(t.usuarioId, t.lida)],
);

export const sessoes = pgTable('sessoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  dispositivo: varchar('dispositivo', { length: 200 }),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  revogada: boolean('revogada').notNull().default(false),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
});

export const tokensRecuperacao = pgTable('tokens_recuperacao', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id')
    .notNull()
    .references(() => usuarios.id, { onDelete: 'cascade' }),
  hash: varchar('hash', { length: 64 }).notNull().unique(),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  usadoEm: timestamp('usado_em', { withTimezone: true }),
});

export const eventosAuditoria = pgTable(
  'eventos_auditoria',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'set null' }), // null = agente automático
    tipo: varchar('tipo', { length: 60 }).notNull(), // ex.: LOGIN, CADASTRO, ACEITE, CHECKIN, PAGAMENTO, CANCELAMENTO
    entidade: varchar('entidade', { length: 60 }),
    entidadeId: uuid('entidade_id'),
    detalhes: jsonb('detalhes'),
    ip: varchar('ip', { length: 45 }),
    data: timestamp('data', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('eventos_auditoria_data_idx').on(t.data)],
);

// ---------------------------------------------------------------------------
// RELAÇÕES (para a API de consultas relacionais do Drizzle)
// ---------------------------------------------------------------------------
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  cliente: one(clientes, { fields: [usuarios.id], references: [clientes.usuarioId] }),
  interprete: one(interpretes, { fields: [usuarios.id], references: [interpretes.usuarioId] }),
  notificacoes: many(notificacoes),
  consentimentos: many(consentimentos),
  sessoes: many(sessoes),
}));

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [clientes.usuarioId], references: [usuarios.id] }),
  solicitacoes: many(solicitacoes),
  formasPagamento: many(formasPagamento),
}));

export const interpretesRelations = relations(interpretes, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [interpretes.usuarioId], references: [usuarios.id] }),
  certificacoes: many(certificacoes),
  disponibilidades: many(disponibilidades),
  ofertas: many(ofertas),
  atendimentos: many(atendimentos),
  contasBancarias: many(contasBancarias),
  repasses: many(repasses),
  lancamentos: many(lancamentosFinanceiros),
}));

export const certificacoesRelations = relations(certificacoes, ({ one, many }) => ({
  interprete: one(interpretes, { fields: [certificacoes.interpreteId], references: [interpretes.usuarioId] }),
  analises: many(analisesDocumentais),
}));

export const analisesDocumentaisRelations = relations(analisesDocumentais, ({ one }) => ({
  certificacao: one(certificacoes, { fields: [analisesDocumentais.certificacaoId], references: [certificacoes.id] }),
  operador: one(usuarios, { fields: [analisesDocumentais.operadorId], references: [usuarios.id] }),
}));

export const disponibilidadesRelations = relations(disponibilidades, ({ one }) => ({
  interprete: one(interpretes, { fields: [disponibilidades.interpreteId], references: [interpretes.usuarioId] }),
}));

export const solicitacoesRelations = relations(solicitacoes, ({ one, many }) => ({
  cliente: one(clientes, { fields: [solicitacoes.clienteId], references: [clientes.usuarioId] }),
  cotacao: one(cotacoes, { fields: [solicitacoes.id], references: [cotacoes.solicitacaoId] }),
  ofertas: many(ofertas),
  atendimento: one(atendimentos, { fields: [solicitacoes.id], references: [atendimentos.solicitacaoId] }),
}));

export const cotacoesRelations = relations(cotacoes, ({ one }) => ({
  solicitacao: one(solicitacoes, { fields: [cotacoes.solicitacaoId], references: [solicitacoes.id] }),
}));

export const ofertasRelations = relations(ofertas, ({ one }) => ({
  solicitacao: one(solicitacoes, { fields: [ofertas.solicitacaoId], references: [solicitacoes.id] }),
  interprete: one(interpretes, { fields: [ofertas.interpreteId], references: [interpretes.usuarioId] }),
}));

export const atendimentosRelations = relations(atendimentos, ({ one, many }) => ({
  solicitacao: one(solicitacoes, { fields: [atendimentos.solicitacaoId], references: [solicitacoes.id] }),
  interprete: one(interpretes, { fields: [atendimentos.interpreteId], references: [interpretes.usuarioId] }),
  checkin: one(checkins, { fields: [atendimentos.id], references: [checkins.atendimentoId] }),
  mensagens: many(mensagens),
  pagamentos: many(pagamentos),
  avaliacoes: many(avaliacoes),
  comprovante: one(comprovantes, { fields: [atendimentos.id], references: [comprovantes.atendimentoId] }),
  chamados: many(chamadosSuporte),
  localizacoes: many(localizacoesCompartilhadas),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [checkins.atendimentoId], references: [atendimentos.id] }),
}));

export const mensagensRelations = relations(mensagens, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [mensagens.atendimentoId], references: [atendimentos.id] }),
  autor: one(usuarios, { fields: [mensagens.autorId], references: [usuarios.id] }),
}));

export const localizacoesRelations = relations(localizacoesCompartilhadas, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [localizacoesCompartilhadas.atendimentoId], references: [atendimentos.id] }),
  usuario: one(usuarios, { fields: [localizacoesCompartilhadas.usuarioId], references: [usuarios.id] }),
}));

export const chamadosRelations = relations(chamadosSuporte, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [chamadosSuporte.atendimentoId], references: [atendimentos.id] }),
  solicitante: one(usuarios, { fields: [chamadosSuporte.solicitanteId], references: [usuarios.id] }),
}));

export const formasPagamentoRelations = relations(formasPagamento, ({ one }) => ({
  cliente: one(clientes, { fields: [formasPagamento.clienteId], references: [clientes.usuarioId] }),
}));

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [pagamentos.atendimentoId], references: [atendimentos.id] }),
  formaPagamento: one(formasPagamento, { fields: [pagamentos.formaPagamentoId], references: [formasPagamento.id] }),
}));

export const contasBancariasRelations = relations(contasBancarias, ({ one }) => ({
  interprete: one(interpretes, { fields: [contasBancarias.interpreteId], references: [interpretes.usuarioId] }),
}));

export const repassesRelations = relations(repasses, ({ one }) => ({
  interprete: one(interpretes, { fields: [repasses.interpreteId], references: [interpretes.usuarioId] }),
  contaBancaria: one(contasBancarias, { fields: [repasses.contaBancariaId], references: [contasBancarias.id] }),
}));

export const lancamentosRelations = relations(lancamentosFinanceiros, ({ one }) => ({
  interprete: one(interpretes, { fields: [lancamentosFinanceiros.interpreteId], references: [interpretes.usuarioId] }),
  pagamento: one(pagamentos, { fields: [lancamentosFinanceiros.pagamentoId], references: [pagamentos.id] }),
  repasse: one(repasses, { fields: [lancamentosFinanceiros.repasseId], references: [repasses.id] }),
}));

export const avaliacoesRelations = relations(avaliacoes, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [avaliacoes.atendimentoId], references: [atendimentos.id] }),
  autor: one(usuarios, { fields: [avaliacoes.autorId], references: [usuarios.id] }),
  avaliado: one(usuarios, { fields: [avaliacoes.avaliadoId], references: [usuarios.id] }),
}));

export const comprovantesRelations = relations(comprovantes, ({ one }) => ({
  atendimento: one(atendimentos, { fields: [comprovantes.atendimentoId], references: [atendimentos.id] }),
}));

export const consentimentosRelations = relations(consentimentos, ({ one }) => ({
  usuario: one(usuarios, { fields: [consentimentos.usuarioId], references: [usuarios.id] }),
}));

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  usuario: one(usuarios, { fields: [notificacoes.usuarioId], references: [usuarios.id] }),
}));

export const sessoesRelations = relations(sessoes, ({ one }) => ({
  usuario: one(usuarios, { fields: [sessoes.usuarioId], references: [usuarios.id] }),
}));

// Tipos TypeScript derivados do esquema (usados nos services/controllers)
export type Usuario = typeof usuarios.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Interprete = typeof interpretes.$inferSelect;
export type Solicitacao = typeof solicitacoes.$inferSelect;
export type Cotacao = typeof cotacoes.$inferSelect;
export type Atendimento = typeof atendimentos.$inferSelect;
export type Pagamento = typeof pagamentos.$inferSelect;
export type PapelUsuario = (typeof papelUsuarioEnum.enumValues)[number];
export type TipoServico = (typeof tipoServicoEnum.enumValues)[number];
export type StatusSolicitacao = (typeof statusSolicitacaoEnum.enumValues)[number];
