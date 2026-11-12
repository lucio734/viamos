/**
 * RF42 — notificações internas (in-app). O envio push externo (RNF25) é integração futura:
 * aqui o registro fica persistido e o frontend consulta/pinta o sino de notificações.
 */
import { and, desc, eq } from 'drizzle-orm';
import { db, type Tx } from '../models/db.js';
import { notificacoes, tipoNotificacaoEnum } from '../models/schema.js';
import { Erros } from '../utils/erros.js';

type TipoNotificacao = (typeof tipoNotificacaoEnum.enumValues)[number];

export async function notificar(
  destino: { usuarioId: string; tipo: TipoNotificacao; titulo: string; conteudo: string; referencia?: string },
  tx?: Tx,
): Promise<void> {
  const executor = tx ?? db;
  await executor.insert(notificacoes).values({
    usuarioId: destino.usuarioId,
    tipo: destino.tipo,
    titulo: destino.titulo,
    conteudo: destino.conteudo,
    referenciaRecurso: destino.referencia,
  });
}

export async function listarNotificacoes(usuarioId: string, apenasNaoLidas = false) {
  return db
    .select()
    .from(notificacoes)
    .where(apenasNaoLidas ? and(eq(notificacoes.usuarioId, usuarioId), eq(notificacoes.lida, false)) : eq(notificacoes.usuarioId, usuarioId))
    .orderBy(desc(notificacoes.criadaEm))
    .limit(50);
}

export async function marcarComoLida(usuarioId: string, notificacaoId: string) {
  const [n] = await db
    .update(notificacoes)
    .set({ lida: true })
    .where(and(eq(notificacoes.id, notificacaoId), eq(notificacoes.usuarioId, usuarioId)))
    .returning();
  if (!n) throw Erros.naoEncontrado('Notificação');
  return n;
}

export async function marcarTodasComoLidas(usuarioId: string): Promise<number> {
  const linhas = await db
    .update(notificacoes)
    .set({ lida: true })
    .where(and(eq(notificacoes.usuarioId, usuarioId), eq(notificacoes.lida, false)))
    .returning({ id: notificacoes.id });
  return linhas.length;
}
