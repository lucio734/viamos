/**
 * RF37/RF38/RNF41 — comprovante de Acessibilidade Garantida: PDF para os participantes e
 * verificação pública por código (sem expor dados pessoais completos).
 */
import { eq } from 'drizzle-orm';
import { env } from '../config/env.js';
import { db } from '../models/db.js';
import { clientes, comprovantes } from '../models/schema.js';
import { mascararDocumento } from '../utils/documentos.js';
import { Erros } from '../utils/erros.js';
import { gerarPdfComprovante } from '../views/comprovante.pdf.js';
import { ROTULOS } from '../views/presenters.js';
import { exigirParticipante } from './atendimento.service.js';

export async function gerarComprovantePdf(atendimentoId: string, usuarioId: string, papel: string): Promise<{ pdf: Buffer; nomeArquivo: string }> {
  const a = await exigirParticipante(atendimentoId, usuarioId, papel);
  if (!a.comprovante) throw Erros.regraNegocio('O comprovante é emitido após a confirmação do pagamento.', 'COMPROVANTE_INDISPONIVEL');
  const pago = a.pagamentos.find((p) => p.status === 'PAGO');
  const [cli] = await db.select({ cpf: clientes.cpf }).from(clientes).where(eq(clientes.usuarioId, a.solicitacao.clienteId)).limit(1);
  const cert = a.interprete.certificacoes.find((c) => c.status === 'APROVADA') ?? a.interprete.certificacoes[0];

  const pdf = await gerarPdfComprovante({
    codigoVerificacao: a.comprovante.codigoVerificacao,
    emitidoEm: a.comprovante.emitidoEm,
    urlVerificacao: `${env.FRONTEND_URL}/verificar/${a.comprovante.codigoVerificacao}`,
    atendimento: {
      id: a.id,
      tipoServicoRotulo: ROTULOS.tipoServico[a.solicitacao.tipoServico],
      endereco: a.solicitacao.endereco,
      complemento: a.solicitacao.complemento,
      inicioPrevisto: a.solicitacao.inicioPrevisto,
      inicioReal: a.inicioReal,
      fimReal: a.fimReal,
      duracaoPrevistaMin: a.solicitacao.duracaoPrevistaMin,
      duracaoRealMin: a.duracaoRealMin,
      valorFinal: a.valorFinal,
    },
    cliente: { nome: a.solicitacao.cliente.usuario.nome, documentoMascarado: mascararDocumento(cli?.cpf ?? '') },
    interprete: {
      nome: a.interprete.usuario.nome,
      documentoMascarado: mascararDocumento(a.interprete.documento),
      certificacao: cert ? `${cert.tipo === 'PROLIBRAS' ? 'Prolibras' : 'Equivalente'} nº ${cert.numero}` : 'Não informada',
      especialidades: a.interprete.especialidades,
    },
    pagamento: { meio: pago?.meio, confirmadoEm: pago?.confirmadoEm, referencia: pago?.referenciaGateway },
  });
  return { pdf, nomeArquivo: `comprovante-viamos-${a.id.slice(0, 8)}.pdf` };
}

/** Verificação pública: confirma existência e dados essenciais, sem expor documentos/telefones. */
export async function verificarComprovante(codigo: string) {
  const c = await db.query.comprovantes.findFirst({
    where: eq(comprovantes.codigoVerificacao, codigo),
    with: { atendimento: { with: { solicitacao: true, interprete: { with: { usuario: true, certificacoes: true } } } } },
  });
  if (!c) return { valido: false as const };
  const a = c.atendimento;
  const cert = a.interprete.certificacoes.find((x) => x.status === 'APROVADA');
  return {
    valido: true as const,
    codigoVerificacao: c.codigoVerificacao,
    emitidoEm: c.emitidoEm,
    dataAtendimento: c.dataAtendimento,
    tipoServico: ROTULOS.tipoServico[a.solicitacao.tipoServico],
    duracaoRealMin: a.duracaoRealMin,
    cidadeOuEndereco: a.solicitacao.endereco,
    interprete: { nome: a.interprete.usuario.nome, certificacao: cert ? `${cert.tipo} nº ${cert.numero}` : 'Equivalente' },
  };
}
