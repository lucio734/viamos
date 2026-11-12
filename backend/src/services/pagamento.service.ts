/**
 * RF26, RF27, RF35, RF36 — formas de pagamento, cobrança (idempotente), ganhos da semana e repasse.
 * RF37 — o comprovante é emitido assim que o pagamento é confirmado.
 */
import { and, desc, eq, gte, inArray, isNull, lt, sql } from 'drizzle-orm';
import { env } from '../config/env.js';
import { REGRAS } from '../config/regras.js';
import { db } from '../models/db.js';
import { atendimentos, comprovantes, contasBancarias, cotacoes, formasPagamento, lancamentosFinanceiros, pagamentos, repasses, solicitacoes } from '../models/schema.js';
import { arredondar2, semanaCorrente } from '../utils/datas.js';
import { Erros } from '../utils/erros.js';
import { registrarEvento } from './auditoria.service.js';
import * as gateway from './gateway.service.js';
import { notificar } from './notificacao.service.js';

// ---------------------------------------------------------------------------
// Formas de pagamento do cliente (RF35, RNF37)
// ---------------------------------------------------------------------------
export async function listarFormasPagamento(clienteId: string) {
  const linhas = await db.select().from(formasPagamento).where(and(eq(formasPagamento.clienteId, clienteId), eq(formasPagamento.ativa, true))).orderBy(desc(formasPagamento.principal), desc(formasPagamento.criadaEm));
  return linhas.map((f) => ({ id: f.id, tipo: f.tipo, chavePix: f.chavePix, bandeira: f.bandeira, finalCartao: f.finalCartao, principal: f.principal, criadaEm: f.criadaEm }));
}

export async function adicionarFormaPagamento(
  clienteId: string,
  entrada: { tipo: 'PIX' | 'CARTAO'; chavePix?: string; cartao?: { numero: string; validade: string; nomeTitular: string }; principal?: boolean },
) {
  let valores: typeof formasPagamento.$inferInsert;
  if (entrada.tipo === 'PIX') {
    if (!entrada.chavePix?.trim()) throw Erros.validacao([{ campo: 'chavePix', mensagem: 'Informe a chave Pix.' }]);
    valores = { clienteId, tipo: 'PIX', chavePix: entrada.chavePix.trim(), principal: entrada.principal ?? false };
  } else {
    if (!entrada.cartao) throw Erros.validacao([{ campo: 'cartao', mensagem: 'Informe os dados do cartão.' }]);
    const tok = await gateway.tokenizarCartao(entrada.cartao);
    valores = { clienteId, tipo: 'CARTAO', tokenGateway: tok.token, bandeira: tok.bandeira, finalCartao: tok.final, principal: entrada.principal ?? false };
  }
  return db.transaction(async (tx) => {
    if (valores.principal) await tx.update(formasPagamento).set({ principal: false }).where(eq(formasPagamento.clienteId, clienteId));
    const [f] = await tx.insert(formasPagamento).values(valores).returning();
    return { id: f.id, tipo: f.tipo, chavePix: f.chavePix, bandeira: f.bandeira, finalCartao: f.finalCartao, principal: f.principal };
  });
}

export async function removerFormaPagamento(clienteId: string, id: string) {
  const [f] = await db.update(formasPagamento).set({ ativa: false, principal: false }).where(and(eq(formasPagamento.id, id), eq(formasPagamento.clienteId, clienteId))).returning({ id: formasPagamento.id });
  if (!f) throw Erros.naoEncontrado('Forma de pagamento');
}

/**
 * Parcela do valor pago que vai para o intérprete: tudo menos a taxa da plataforma.
 * valorTotal = S + D + 10%·S  ⇒  S = (valorTotal − D) / 1,1  ⇒  crédito = S + D.
 */
export function creditoInterprete(valorTotal: number, valorDeslocamento: number): number {
  const servico = (valorTotal - valorDeslocamento) / (1 + REGRAS.PRECO.TAXA_PLATAFORMA_PERCENTUAL);
  return arredondar2(servico + valorDeslocamento);
}

// ---------------------------------------------------------------------------
// Cobrança do atendimento (RF36) — idempotente: um único pagamento PAGO por atendimento
// ---------------------------------------------------------------------------
export async function obterPagamento(pagamentoId: string, usuarioId: string, papel: string) {
  const p = await db.query.pagamentos.findFirst({ where: eq(pagamentos.id, pagamentoId), with: { atendimento: { with: { solicitacao: true } } } });
  if (!p) throw Erros.naoEncontrado('Pagamento');
  const participante = p.atendimento.solicitacao.clienteId === usuarioId || p.atendimento.interpreteId === usuarioId;
  if (!participante && papel !== 'BACKOFFICE') throw Erros.proibido();
  return { id: p.id, atendimentoId: p.atendimentoId, valor: p.valor, status: p.status, meio: p.meio, mensagem: p.mensagemGateway, tentativas: p.tentativas, confirmadoEm: p.confirmadoEm };
}

export async function processarPagamento(
  pagamentoId: string,
  clienteId: string,
  entrada: { formaPagamentoId?: string; meio?: 'PIX' | 'CARTAO' },
  ip?: string,
) {
  const p = await db.query.pagamentos.findFirst({ where: eq(pagamentos.id, pagamentoId), with: { atendimento: { with: { solicitacao: true } } } });
  if (!p) throw Erros.naoEncontrado('Pagamento');
  if (p.atendimento.solicitacao.clienteId !== clienteId) throw Erros.proibido('Apenas o cliente do atendimento pode pagar.');
  if (p.atendimento.status !== 'CONCLUIDO') throw Erros.regraNegocio('O pagamento é liberado após o encerramento do atendimento.', 'ATENDIMENTO_NAO_CONCLUIDO');

  // Idempotência: se já existe pagamento confirmado para o atendimento, devolve-o (mesma resposta, sem cobrar de novo).
  const [jaPago] = await db.select().from(pagamentos).where(and(eq(pagamentos.atendimentoId, p.atendimentoId), eq(pagamentos.status, 'PAGO'))).limit(1);
  if (jaPago) return { id: jaPago.id, status: 'PAGO' as const, valor: jaPago.valor, meio: jaPago.meio, mensagem: 'Pagamento já confirmado anteriormente.', confirmadoEm: jaPago.confirmadoEm, repetido: true };

  let forma: typeof formasPagamento.$inferSelect | undefined;
  if (entrada.formaPagamentoId) {
    [forma] = await db.select().from(formasPagamento).where(and(eq(formasPagamento.id, entrada.formaPagamentoId), eq(formasPagamento.clienteId, clienteId), eq(formasPagamento.ativa, true))).limit(1);
    if (!forma) throw Erros.naoEncontrado('Forma de pagamento');
  }
  const meio = forma?.tipo ?? entrada.meio;
  if (!meio) throw Erros.validacao([{ campo: 'meio', mensagem: 'Escolha Pix ou uma forma de pagamento salva.' }]);

  const resultado = await gateway.cobrar({ valor: p.valor, meio, tokenCartao: forma?.tokenGateway, finalCartao: forma?.finalCartao });
  const agora = new Date();

  return db.transaction(async (tx) => {
    const [atualizado] = await tx
      .update(pagamentos)
      .set({
        status: resultado.aprovado ? 'PAGO' : 'FALHOU',
        meio,
        formaPagamentoId: forma?.id ?? null,
        referenciaGateway: resultado.referencia,
        mensagemGateway: resultado.mensagem,
        tentativas: sql`${pagamentos.tentativas} + 1`,
        confirmadoEm: resultado.aprovado ? agora : null,
      })
      .where(and(eq(pagamentos.id, pagamentoId), inArray(pagamentos.status, ['PENDENTE', 'FALHOU'])))
      .returning();
    if (!atualizado) throw Erros.conflito('Este pagamento já foi processado.', 'PAGAMENTO_PROCESSADO');

    await registrarEvento({ usuarioId: clienteId, tipo: 'PAGAMENTO', entidade: 'pagamento', entidadeId: pagamentoId, detalhes: { aprovado: resultado.aprovado, meio, valor: p.valor, referencia: resultado.referencia }, ip }, tx);

    if (!resultado.aprovado) {
      return { id: atualizado.id, status: 'FALHOU' as const, valor: atualizado.valor, meio, mensagem: resultado.mensagem, confirmadoEm: null, repetido: false };
    }

    // Crédito ao intérprete (valor do serviço + deslocamento; a taxa da plataforma fica com o Víamos)
    const cotacao = await tx.query.cotacoes.findFirst({ where: (c, { eq: e }) => e(c.solicitacaoId, p.atendimento.solicitacaoId) });
    const credito = creditoInterprete(p.valor, cotacao?.valorDeslocamento ?? 0);
    await tx.insert(lancamentosFinanceiros).values({ interpreteId: p.atendimento.interpreteId, pagamentoId, tipo: 'CREDITO_ATENDIMENTO', valor: credito, descricao: `Atendimento ${p.atendimentoId.slice(0, 8)}` });

    // RF37 — comprovante de Acessibilidade Garantida
    const [a] = await tx.select({ inicioReal: atendimentos.inicioReal, solicitacaoId: atendimentos.solicitacaoId }).from(atendimentos).where(eq(atendimentos.id, p.atendimentoId)).limit(1);
    const [s] = await tx.select({ inicioPrevisto: solicitacoes.inicioPrevisto }).from(solicitacoes).where(eq(solicitacoes.id, a.solicitacaoId)).limit(1);
    const [comp] = await tx
      .insert(comprovantes)
      .values({ atendimentoId: p.atendimentoId, dataAtendimento: a.inicioReal ?? s.inicioPrevisto, urlPdf: `${env.API_PUBLIC_URL}/api/atendimentos/${p.atendimentoId}/comprovante.pdf` })
      .onConflictDoNothing()
      .returning();

    await notificar({ usuarioId: clienteId, tipo: 'PAGAMENTO', titulo: 'Pagamento confirmado', conteudo: 'Seu comprovante de Acessibilidade Garantida já está disponível no histórico.', referencia: `/cliente/atendimentos/${p.atendimentoId}` }, tx);
    await notificar({ usuarioId: p.atendimento.interpreteId, tipo: 'PAGAMENTO', titulo: 'Pagamento recebido', conteudo: `R$ ${credito.toFixed(2).replace('.', ',')} creditados no seu saldo.`, referencia: '/interprete/ganhos' }, tx);

    return { id: atualizado.id, status: 'PAGO' as const, valor: atualizado.valor, meio, mensagem: resultado.mensagem, confirmadoEm: agora, repetido: false, comprovanteCodigo: comp?.codigoVerificacao };
  });
}

// ---------------------------------------------------------------------------
// Ganhos e repasse do intérprete (RF26, RF27)
// ---------------------------------------------------------------------------
export async function resumoGanhos(interpreteId: string) {
  const { inicio, fim } = semanaCorrente();
  const lancamentos = await db.query.lancamentosFinanceiros.findMany({
    where: eq(lancamentosFinanceiros.interpreteId, interpreteId),
    with: { pagamento: { with: { atendimento: { with: { solicitacao: true } } } }, repasse: true },
    orderBy: [desc(lancamentosFinanceiros.data)],
    limit: 100,
  });
  const saldoDisponivel = arredondar2(lancamentos.reduce((acc, l) => acc + l.valor, 0));
  const recebidoSemana = arredondar2(lancamentos.filter((l) => l.tipo === 'CREDITO_ATENDIMENTO' && l.data >= inicio && l.data < fim).reduce((acc, l) => acc + l.valor, 0));

  // A receber: atendimentos concluídos ainda sem pagamento confirmado
  const pendentes = await db
    .select({ valor: atendimentos.valorFinal, deslocamento: cotacoes.valorDeslocamento })
    .from(atendimentos)
    .leftJoin(cotacoes, eq(cotacoes.solicitacaoId, atendimentos.solicitacaoId))
    .where(and(eq(atendimentos.interpreteId, interpreteId), eq(atendimentos.status, 'CONCLUIDO'), sql`not exists (select 1 from ${pagamentos} p where p.atendimento_id = ${atendimentos.id} and p.status = 'PAGO')`));
  const aReceber = arredondar2(pendentes.reduce((acc, p) => acc + creditoInterprete(p.valor ?? 0, p.deslocamento ?? 0), 0));

  const [semana] = await db
    .select({ atendimentos: sql<number>`count(*)::int`, minutos: sql<number>`coalesce(sum(${atendimentos.duracaoRealMin}),0)::int` })
    .from(atendimentos)
    .where(and(eq(atendimentos.interpreteId, interpreteId), eq(atendimentos.status, 'CONCLUIDO'), gte(atendimentos.fimReal, inicio), lt(atendimentos.fimReal, fim)));

  return {
    semana: { inicio, fim, recebido: recebidoSemana, atendimentos: semana?.atendimentos ?? 0, horas: Math.round(((semana?.minutos ?? 0) / 60) * 10) / 10 },
    saldoDisponivel,
    aReceber,
    extrato: lancamentos.map((l) => ({
      id: l.id,
      tipo: l.tipo,
      valor: l.valor,
      data: l.data,
      descricao: l.descricao,
      atendimentoId: l.pagamento?.atendimentoId ?? null,
      tipoServico: l.pagamento?.atendimento.solicitacao.tipoServico ?? null,
      repasseStatus: l.repasse?.status ?? null,
    })),
  };
}

export async function listarContasBancarias(interpreteId: string) {
  return db.select().from(contasBancarias).where(eq(contasBancarias.interpreteId, interpreteId));
}

export async function salvarContaBancaria(interpreteId: string, dados: { banco: string; agencia: string; conta: string; titular: string; chavePix?: string }) {
  return db.transaction(async (tx) => {
    await tx.update(contasBancarias).set({ principal: false }).where(eq(contasBancarias.interpreteId, interpreteId));
    const [c] = await tx.insert(contasBancarias).values({ interpreteId, ...dados, principal: true }).returning();
    return c;
  });
}

export async function solicitarRepasse(interpreteId: string, ip?: string) {
  const ganhos = await resumoGanhos(interpreteId);
  if (ganhos.saldoDisponivel <= 0) throw Erros.regraNegocio('Não há saldo disponível para repasse.', 'SALDO_INSUFICIENTE');
  const [conta] = await db.select().from(contasBancarias).where(and(eq(contasBancarias.interpreteId, interpreteId), eq(contasBancarias.principal, true))).limit(1);
  if (!conta) throw Erros.regraNegocio('Cadastre uma conta bancária antes de solicitar o repasse.', 'SEM_CONTA_BANCARIA');
  const [aberto] = await db.select({ id: repasses.id }).from(repasses).where(and(eq(repasses.interpreteId, interpreteId), inArray(repasses.status, ['SOLICITADO', 'PROCESSANDO']))).limit(1);
  if (aberto) throw Erros.conflito('Já existe um repasse em processamento.', 'REPASSE_EM_ANDAMENTO');

  const valor = ganhos.saldoDisponivel;
  const resultado = await gateway.transferir({ valor, contaDescricao: `${conta.banco} ag ${conta.agencia} cc ${conta.conta}` });
  return db.transaction(async (tx) => {
    const [r] = await tx
      .insert(repasses)
      .values({ interpreteId, contaBancariaId: conta.id, valor, status: resultado.aprovado ? 'PAGO' : 'FALHOU', referenciaGateway: resultado.referencia, concluidoEm: resultado.aprovado ? new Date() : null })
      .returning();
    if (resultado.aprovado) {
      await tx.insert(lancamentosFinanceiros).values({ interpreteId, repasseId: r.id, tipo: 'DEBITO_REPASSE', valor: -valor, descricao: `Repasse para ${conta.banco}` });
    }
    await registrarEvento({ usuarioId: interpreteId, tipo: 'REPASSE', entidade: 'repasse', entidadeId: r.id, detalhes: { valor, aprovado: resultado.aprovado }, ip }, tx);
    return { id: r.id, valor, status: r.status, mensagem: resultado.mensagem, solicitadoEm: r.solicitadoEm };
  });
}

export async function listarRepasses(interpreteId: string) {
  return db.select().from(repasses).where(eq(repasses.interpreteId, interpreteId)).orderBy(desc(repasses.solicitadoEm)).limit(50);
}

/** Pagamentos pendentes do cliente (atendimentos concluídos ainda não pagos). */
export async function listarPagamentosPendentes(clienteId: string) {
  const linhas = await db
    .select({ id: pagamentos.id, valor: pagamentos.valor, status: pagamentos.status, atendimentoId: pagamentos.atendimentoId, tipoServico: solicitacoes.tipoServico, inicioPrevisto: solicitacoes.inicioPrevisto })
    .from(pagamentos)
    .innerJoin(atendimentos, eq(atendimentos.id, pagamentos.atendimentoId))
    .innerJoin(solicitacoes, eq(solicitacoes.id, atendimentos.solicitacaoId))
    .where(and(eq(solicitacoes.clienteId, clienteId), inArray(pagamentos.status, ['PENDENTE', 'FALHOU']), isNull(pagamentos.confirmadoEm)))
    .orderBy(desc(solicitacoes.inicioPrevisto));
  return linhas;
}
