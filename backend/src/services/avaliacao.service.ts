/**
 * RF40/RF41/RNF42 — avaliação bilateral (nota 1–5 + comentário) após o encerramento,
 * uma por autor por atendimento; recalcula a reputação do intérprete.
 */
import { and, avg, count, eq } from 'drizzle-orm';
import { db } from '../models/db.js';
import { atendimentos, avaliacoes, interpretes } from '../models/schema.js';
import { Erros } from '../utils/erros.js';
import { registrarEvento } from './auditoria.service.js';
import { exigirParticipante } from './atendimento.service.js';
import { notificar } from './notificacao.service.js';

export async function avaliarAtendimento(atendimentoId: string, autorId: string, papel: string, entrada: { nota: number; comentario?: string }, ip?: string) {
  const a = await exigirParticipante(atendimentoId, autorId, papel);
  if (a.status !== 'CONCLUIDO') throw Erros.regraNegocio('A avaliação é liberada após o encerramento do atendimento.', 'ATENDIMENTO_NAO_CONCLUIDO');
  if (a.avaliacoes.some((av) => av.autorId === autorId)) throw Erros.conflito('Você já avaliou este atendimento.', 'AVALIACAO_DUPLICADA');
  const avaliadoId = a.solicitacao.clienteId === autorId ? a.interpreteId : a.solicitacao.clienteId;

  return db.transaction(async (tx) => {
    const [av] = await tx.insert(avaliacoes).values({ atendimentoId, autorId, avaliadoId, nota: entrada.nota, comentario: entrada.comentario?.trim() || null }).returning();
    if (avaliadoId === a.interpreteId) {
      const [agg] = await tx.select({ media: avg(avaliacoes.nota), total: count(avaliacoes.id) }).from(avaliacoes).where(eq(avaliacoes.avaliadoId, a.interpreteId));
      await tx
        .update(interpretes)
        .set({ reputacao: agg?.media ? Math.round(Number(agg.media) * 100) / 100 : null, totalAvaliacoes: Number(agg?.total ?? 0) })
        .where(eq(interpretes.usuarioId, a.interpreteId));
    }
    await notificar({ usuarioId: avaliadoId, tipo: 'SISTEMA', titulo: 'Você recebeu uma avaliação', conteudo: `Nota ${entrada.nota} de 5.`, referencia: avaliadoId === a.interpreteId ? `/interprete/atendimentos/${atendimentoId}` : `/cliente/atendimentos/${atendimentoId}` }, tx);
    await registrarEvento({ usuarioId: autorId, tipo: 'AVALIACAO', entidade: 'avaliacao', entidadeId: av.id, detalhes: { atendimentoId, nota: entrada.nota }, ip }, tx);
    return { id: av.id, nota: av.nota, comentario: av.comentario, data: av.data };
  });
}

/** RNF42 — avaliações públicas do intérprete sem identificar o autor. */
export async function avaliacoesPublicasDoInterprete(interpreteId: string) {
  const linhas = await db
    .select({ nota: avaliacoes.nota, comentario: avaliacoes.comentario, data: avaliacoes.data })
    .from(avaliacoes)
    .innerJoin(atendimentos, and(eq(atendimentos.id, avaliacoes.atendimentoId), eq(atendimentos.interpreteId, interpreteId)))
    .where(eq(avaliacoes.avaliadoId, interpreteId))
    .limit(20);
  return linhas;
}
