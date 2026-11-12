/**
 * RF44 / RNF33 — trilha de auditoria (append-only).
 * A tabela `eventos_auditoria` recebe apenas INSERTs; a migração cria um gatilho que impede UPDATE/DELETE.
 */
import { desc, eq, and, gte, lte, type SQL } from 'drizzle-orm';
import { db, type Tx } from '../models/db.js';
import { eventosAuditoria } from '../models/schema.js';

export type TipoEvento =
  | 'CADASTRO'
  | 'LOGIN'
  | 'LOGIN_FALHA'
  | 'LOGOUT'
  | 'RECUPERACAO_SENHA'
  | 'SENHA_REDEFINIDA'
  | 'CERTIFICACAO_ENVIADA'
  | 'ANALISE_DOCUMENTAL'
  | 'SOLICITACAO_CRIADA'
  | 'SOLICITACAO_CANCELADA'
  | 'OFERTA_RECUSADA'
  | 'ACEITE'
  | 'CHECKIN'
  | 'ENCERRAMENTO'
  | 'PAGAMENTO'
  | 'REPASSE'
  | 'AVALIACAO'
  | 'CHAMADO_SUPORTE'
  | 'CONSENTIMENTO'
  | 'SOLICITACAO_DADOS'
  | 'PERFIL_ATUALIZADO';

export interface Evento {
  usuarioId?: string | null;
  tipo: TipoEvento;
  entidade?: string;
  entidadeId?: string;
  detalhes?: Record<string, unknown>;
  ip?: string;
}

export async function registrarEvento(evento: Evento, tx?: Tx): Promise<void> {
  const executor = tx ?? db;
  await executor.insert(eventosAuditoria).values({
    usuarioId: evento.usuarioId ?? null,
    tipo: evento.tipo,
    entidade: evento.entidade,
    entidadeId: evento.entidadeId,
    detalhes: evento.detalhes ?? null,
    ip: evento.ip,
  });
}

export async function listarEventos(filtro: { usuarioId?: string; tipo?: string; de?: Date; ate?: Date; limite?: number }) {
  const condicoes: SQL[] = [];
  if (filtro.usuarioId) condicoes.push(eq(eventosAuditoria.usuarioId, filtro.usuarioId));
  if (filtro.tipo) condicoes.push(eq(eventosAuditoria.tipo, filtro.tipo));
  if (filtro.de) condicoes.push(gte(eventosAuditoria.data, filtro.de));
  if (filtro.ate) condicoes.push(lte(eventosAuditoria.data, filtro.ate));
  return db
    .select()
    .from(eventosAuditoria)
    .where(condicoes.length ? and(...condicoes) : undefined)
    .orderBy(desc(eventosAuditoria.data))
    .limit(Math.min(filtro.limite ?? 100, 500));
}
