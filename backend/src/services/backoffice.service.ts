/**
 * RF06 / RNF36 — análise documental pelo backoffice: aprovar, reprovar ou solicitar correção.
 * Também expõe a fila de chamados de suporte e a trilha de auditoria para operadores.
 */
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../models/db.js';
import { analisesDocumentais, certificacoes, chamadosSuporte, interpretes, usuarios } from '../models/schema.js';
import { mascararDocumento } from '../utils/documentos.js';
import { Erros } from '../utils/erros.js';
import { registrarEvento } from './auditoria.service.js';
import { notificar } from './notificacao.service.js';
import { decodificarArquivo, type ArquivoBase64 } from './cadastro.service.js';

export async function listarCertificacoes(status?: string) {
  const linhas = await db.query.certificacoes.findMany({
    where: status ? eq(certificacoes.status, status as never) : undefined,
    columns: { arquivo: false },
    with: { interprete: { with: { usuario: true } }, analises: { with: { operador: { columns: { nome: true } } }, orderBy: [desc(analisesDocumentais.data)] } },
    orderBy: [certificacoes.enviadaEm],
    limit: 200,
  });
  return linhas.map((c) => ({
    id: c.id,
    tipo: c.tipo,
    numero: c.numero,
    nomeArquivo: c.nomeArquivo,
    mimeArquivo: c.mimeArquivo,
    tamanhoBytes: c.tamanhoBytes,
    status: c.status,
    enviadaEm: c.enviadaEm,
    interprete: {
      id: c.interprete.usuarioId,
      nome: c.interprete.usuario.nome,
      email: c.interprete.usuario.email,
      documento: mascararDocumento(c.interprete.documento),
      especialidades: c.interprete.especialidades,
      statusHabilitacao: c.interprete.statusHabilitacao,
    },
    analises: c.analises.map((a) => ({ resultado: a.resultado, justificativa: a.justificativa, data: a.data, operador: a.operador.nome })),
  }));
}

export async function obterArquivoCertificacao(id: string, usuarioId: string, papel: string) {
  const [c] = await db.select().from(certificacoes).where(eq(certificacoes.id, id)).limit(1);
  if (!c) throw Erros.naoEncontrado('Certificação');
  if (papel !== 'BACKOFFICE' && papel !== 'SUPORTE' && c.interpreteId !== usuarioId) throw Erros.proibido();
  return { buffer: c.arquivo, mime: c.mimeArquivo, nome: c.nomeArquivo };
}

/** Parecer: aprovar / reprovar / correção. Atualiza certificação e habilitação do intérprete. */
export async function registrarParecer(certificacaoId: string, operadorId: string, entrada: { resultado: 'APROVADO' | 'REPROVADO' | 'CORRECAO'; justificativa?: string }, ip?: string) {
  const c = await db.query.certificacoes.findFirst({ where: eq(certificacoes.id, certificacaoId), columns: { arquivo: false }, with: { interprete: true } });
  if (!c) throw Erros.naoEncontrado('Certificação');
  if (c.status !== 'EM_ANALISE') throw Erros.conflito('Esta certificação já recebeu parecer.', 'PARECER_DUPLICADO');
  if (entrada.resultado !== 'APROVADO' && !entrada.justificativa?.trim()) {
    throw Erros.validacao([{ campo: 'justificativa', mensagem: 'Informe a justificativa para reprovação ou pedido de correção.' }]);
  }

  const statusCert = entrada.resultado === 'APROVADO' ? 'APROVADA' : entrada.resultado === 'REPROVADO' ? 'REPROVADA' : 'CORRECAO_SOLICITADA';
  const statusHab = entrada.resultado === 'APROVADO' ? 'APROVADO' : entrada.resultado === 'REPROVADO' ? 'REPROVADO' : 'CORRECAO_SOLICITADA';
  const mensagens = {
    APROVADO: 'Sua documentação foi aprovada. Fique online para começar a receber demandas!',
    REPROVADO: `Sua documentação foi reprovada. Motivo: ${entrada.justificativa}`,
    CORRECAO: `Precisamos de uma correção na sua documentação: ${entrada.justificativa}. Reenvie pelo seu perfil.`,
  };

  await db.transaction(async (tx) => {
    await tx.insert(analisesDocumentais).values({ certificacaoId, operadorId, resultado: entrada.resultado, justificativa: entrada.justificativa?.trim() || null });
    await tx.update(certificacoes).set({ status: statusCert }).where(eq(certificacoes.id, certificacaoId));
    await tx.update(interpretes).set({ statusHabilitacao: statusHab, ...(statusHab !== 'APROVADO' ? { disponivelAgora: false } : {}) }).where(eq(interpretes.usuarioId, c.interpreteId));
    await notificar({ usuarioId: c.interpreteId, tipo: 'CERTIFICACAO', titulo: 'Resultado da análise documental', conteudo: mensagens[entrada.resultado], referencia: '/interprete/perfil' }, tx);
    await registrarEvento({ usuarioId: operadorId, tipo: 'ANALISE_DOCUMENTAL', entidade: 'certificacao', entidadeId: certificacaoId, detalhes: { resultado: entrada.resultado, interpreteId: c.interpreteId }, ip }, tx);
  });
  return { certificacaoId, status: statusCert, statusHabilitacao: statusHab };
}

/** Intérprete reenvia documentação após pedido de correção/reprovação (RF05). */
export async function reenviarCertificacao(interpreteId: string, entrada: { tipo: 'PROLIBRAS' | 'EQUIVALENTE'; numero: string; arquivo: ArquivoBase64 }, ip?: string) {
  const [i] = await db.select().from(interpretes).where(eq(interpretes.usuarioId, interpreteId)).limit(1);
  if (!i) throw Erros.naoEncontrado('Intérprete');
  if (i.statusHabilitacao === 'APROVADO') throw Erros.regraNegocio('Sua documentação já está aprovada.', 'JA_APROVADO');
  if (i.statusHabilitacao === 'EM_ANALISE') throw Erros.conflito('Já existe uma certificação em análise.', 'EM_ANALISE');
  const arquivo = decodificarArquivo(entrada.arquivo);
  return db.transaction(async (tx) => {
    const [cert] = await tx
      .insert(certificacoes)
      .values({ interpreteId, tipo: entrada.tipo, numero: entrada.numero.trim(), nomeArquivo: arquivo.nome, mimeArquivo: arquivo.mime, arquivo: arquivo.buffer, tamanhoBytes: arquivo.buffer.length })
      .returning({ id: certificacoes.id, status: certificacoes.status, enviadaEm: certificacoes.enviadaEm });
    await tx.update(interpretes).set({ statusHabilitacao: 'EM_ANALISE' }).where(eq(interpretes.usuarioId, interpreteId));
    await registrarEvento({ usuarioId: interpreteId, tipo: 'CERTIFICACAO_ENVIADA', entidade: 'certificacao', entidadeId: cert.id, detalhes: { reenvio: true }, ip }, tx);
    return cert;
  });
}

export async function minhasCertificacoes(interpreteId: string) {
  const linhas = await db.query.certificacoes.findMany({
    where: eq(certificacoes.interpreteId, interpreteId),
    columns: { arquivo: false },
    with: { analises: { orderBy: [desc(analisesDocumentais.data)] } },
    orderBy: [desc(certificacoes.enviadaEm)],
  });
  return linhas.map((c) => ({
    id: c.id,
    tipo: c.tipo,
    numero: c.numero,
    nomeArquivo: c.nomeArquivo,
    mimeArquivo: c.mimeArquivo,
    tamanhoBytes: c.tamanhoBytes,
    status: c.status,
    motivoParecer: c.analises[0]?.justificativa ?? null,
    enviadaEm: c.enviadaEm,
    analisadaEm: c.analises[0]?.data ?? null,
    analises: c.analises.map((a) => ({ resultado: a.resultado, justificativa: a.justificativa, data: a.data })),
  }));
}

export async function listarChamados(status?: string[]) {
  const linhas = await db.query.chamadosSuporte.findMany({
    where: status?.length ? inArray(chamadosSuporte.status, status as never) : undefined,
    with: { solicitante: { columns: { nome: true, papel: true, telefone: true } }, atendimento: { columns: { id: true, status: true } } },
    orderBy: [desc(chamadosSuporte.abertoEm)],
    limit: 100,
  });
  return linhas;
}

export async function atualizarChamado(id: string, operadorId: string, status: 'EM_ATENDIMENTO' | 'ENCERRADO') {
  const [c] = await db
    .update(chamadosSuporte)
    .set({ status, operadorId, ...(status === 'ENCERRADO' ? { encerradoEm: new Date() } : {}) })
    .where(eq(chamadosSuporte.id, id))
    .returning();
  if (!c) throw Erros.naoEncontrado('Chamado');
  return c;
}

export async function indicadoresBackoffice() {
  const certs = await db.select({ status: certificacoes.status }).from(certificacoes);
  const chamados = await db.select({ status: chamadosSuporte.status }).from(chamadosSuporte);
  const aprovados = await db.select({ id: interpretes.usuarioId }).from(interpretes).where(eq(interpretes.statusHabilitacao, 'APROVADO'));
  const usuariosAtivos = await db.select({ papel: usuarios.papel }).from(usuarios).where(and(eq(usuarios.ativo, true)));
  return {
    certificacoesEmAnalise: certs.filter((c) => c.status === 'EM_ANALISE').length,
    certificacoesAprovadas: certs.filter((c) => c.status === 'APROVADA').length,
    chamadosAbertos: chamados.filter((c) => c.status !== 'ENCERRADO').length,
    interpretesAprovados: aprovados.length,
    interpretes: usuariosAtivos.filter((u) => u.papel === 'INTERPRETE').length,
    clientes: usuariosAtivos.filter((u) => u.papel === 'CLIENTE').length,
  };
}
