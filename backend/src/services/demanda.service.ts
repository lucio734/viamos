/**
 * RF20–RF25 — lado do intérprete: demandas próximas (lista e mapa), aceite exclusivo, recusa,
 * raio de atuação e disponibilidade. RNF36: só intérprete APROVADO recebe/aceita demandas.
 */
import { randomBytes } from 'node:crypto';
import { and, desc, eq, gt, inArray, lt, ne, notExists, sql } from 'drizzle-orm';
import { REGRAS } from '../config/regras.js';
import { db } from '../models/db.js';
import { atendimentos, checkins, disponibilidades, interpretes, ofertas, solicitacoes, usuarios } from '../models/schema.js';
import { adicionarMinutos } from '../utils/datas.js';
import { Erros } from '../utils/erros.js';
import { distanciaKm } from '../utils/geo.js';
import { ROTULOS } from '../views/presenters.js';
import { registrarEvento } from './auditoria.service.js';
import { notificar } from './notificacao.service.js';

async function carregarInterprete(usuarioId: string) {
  const [i] = await db.select().from(interpretes).where(eq(interpretes.usuarioId, usuarioId)).limit(1);
  if (!i) throw Erros.naoEncontrado('Perfil de intérprete');
  return i;
}

function exigirHabilitado(i: { statusHabilitacao: string }) {
  if (i.statusHabilitacao !== 'APROVADO') {
    throw Erros.proibido('Sua documentação ainda não foi aprovada. Você poderá aceitar demandas após a análise do backoffice.');
  }
}

/** RF20/RF21 — demandas abertas dentro do raio configurado, não recusadas pelo intérprete. */
export async function listarDemandas(usuarioId: string) {
  const i = await carregarInterprete(usuarioId);
  if (i.statusHabilitacao !== 'APROVADO') return { habilitado: false, statusHabilitacao: i.statusHabilitacao, demandas: [] };

  const abertas = await db.query.solicitacoes.findMany({
    where: and(
      eq(solicitacoes.status, 'BUSCANDO'),
      gt(solicitacoes.inicioPrevisto, new Date()),
      notExists(
        db
          .select({ id: ofertas.id })
          .from(ofertas)
          .where(and(eq(ofertas.solicitacaoId, solicitacoes.id), eq(ofertas.interpreteId, usuarioId), ne(ofertas.status, 'ENVIADA'))),
      ),
    ),
    with: { cotacao: true, cliente: { with: { usuario: true } } },
    orderBy: [solicitacoes.inicioPrevisto],
  });

  const base = { latitude: i.latitudeBase, longitude: i.longitudeBase };
  const raio = Math.min(i.raioKm, REGRAS.RAIO_MAXIMO_KM);
  const demandas = abertas
    .map((s) => ({ s, distancia: distanciaKm(base, { latitude: s.latitude, longitude: s.longitude }) }))
    .filter(({ distancia }) => distancia <= raio)
    .sort((a, b) => a.distancia - b.distancia)
    .map(({ s, distancia }) => ({
      id: s.id,
      tipoServico: s.tipoServico,
      tipoServicoRotulo: ROTULOS.tipoServico[s.tipoServico],
      inicioPrevisto: s.inicioPrevisto,
      duracaoPrevistaMin: s.duracaoPrevistaMin,
      endereco: s.endereco,
      latitude: s.latitude,
      longitude: s.longitude,
      distanciaKm: distancia,
      valorEstimado: s.cotacao?.valorTotal ?? null,
      clienteNome: s.cliente.usuario.nome,
      criadaEm: s.criadaEm,
      urgente: s.inicioPrevisto.getTime() - Date.now() < 3 * 3_600_000,
    }));

  return { habilitado: true, statusHabilitacao: i.statusHabilitacao, raioKm: raio, base, demandas };
}

/**
 * RF22 — aceite EXCLUSIVO e atômico:
 * UPDATE ... WHERE status = 'BUSCANDO' garante que apenas um intérprete muda o estado;
 * o segundo concorrente recebe 409. A unicidade de `atendimentos.solicitacao_id` é a segunda trava.
 */
export async function aceitarDemanda(usuarioId: string, solicitacaoId: string, ip?: string) {
  const i = await carregarInterprete(usuarioId);
  exigirHabilitado(i);

  const s = await db.query.solicitacoes.findFirst({ where: eq(solicitacoes.id, solicitacaoId), with: { cliente: { with: { usuario: true } } } });
  if (!s) throw Erros.naoEncontrado('Demanda');
  if (s.status !== 'BUSCANDO') throw Erros.conflito('Esta demanda já foi aceita por outro intérprete ou foi cancelada.', 'DEMANDA_INDISPONIVEL');
  if (s.inicioPrevisto.getTime() <= Date.now()) throw Erros.regraNegocio('O horário desta demanda já passou.', 'DEMANDA_EXPIRADA');

  const distancia = distanciaKm({ latitude: i.latitudeBase, longitude: i.longitudeBase }, { latitude: s.latitude, longitude: s.longitude });
  if (distancia > Math.min(i.raioKm, REGRAS.RAIO_MAXIMO_KM)) {
    throw Erros.regraNegocio(`A demanda está a ${distancia} km, fora do seu raio de atuação (${i.raioKm} km).`, 'FORA_DO_RAIO');
  }

  // Conflito de agenda: outro atendimento do mesmo intérprete sobreposto no horário
  const fimPrevisto = adicionarMinutos(s.inicioPrevisto, s.duracaoPrevistaMin);
  const conflitos = await db
    .select({ id: atendimentos.id })
    .from(atendimentos)
    .innerJoin(solicitacoes, eq(solicitacoes.id, atendimentos.solicitacaoId))
    .where(
      and(
        eq(atendimentos.interpreteId, usuarioId),
        inArray(atendimentos.status, ['AGENDADO', 'EM_ANDAMENTO']),
        lt(solicitacoes.inicioPrevisto, fimPrevisto),
        gt(sql`${solicitacoes.inicioPrevisto} + make_interval(mins => ${solicitacoes.duracaoPrevistaMin})`, s.inicioPrevisto),
      ),
    )
    .limit(1);
  if (conflitos.length) throw Erros.conflito('Você já tem um atendimento agendado neste horário.', 'AGENDA_CONFLITANTE');

  const atendimentoId = await db.transaction(async (tx) => {
    const agora = new Date();
    const [travada] = await tx
      .update(solicitacoes)
      .set({ status: 'ACEITA', atualizadaEm: agora })
      .where(and(eq(solicitacoes.id, solicitacaoId), eq(solicitacoes.status, 'BUSCANDO')))
      .returning({ id: solicitacoes.id });
    if (!travada) throw Erros.conflito('Esta demanda acabou de ser aceita por outro intérprete.', 'DEMANDA_INDISPONIVEL');

    const [a] = await tx.insert(atendimentos).values({ solicitacaoId, interpreteId: usuarioId, aceitoEm: agora }).returning({ id: atendimentos.id });
    // QR de check-in já nasce com o atendimento; o cliente exibe, o intérprete lê (RF31)
    await tx.insert(checkins).values({ atendimentoId: a.id, qrHash: randomBytes(16).toString('hex') });

    // Minha oferta vira ACEITA; as demais expiram
    await tx
      .update(ofertas)
      .set({ status: 'ACEITA', respondidaEm: agora })
      .where(and(eq(ofertas.solicitacaoId, solicitacaoId), eq(ofertas.interpreteId, usuarioId)));
    await tx
      .update(ofertas)
      .set({ status: 'EXPIRADA', respondidaEm: agora })
      .where(and(eq(ofertas.solicitacaoId, solicitacaoId), eq(ofertas.status, 'ENVIADA')));

    await notificar(
      {
        usuarioId: s.clienteId,
        tipo: 'ACEITE',
        titulo: 'Intérprete confirmado!',
        conteudo: `Sua solicitação de ${ROTULOS.tipoServico[s.tipoServico]} foi aceita. Combine os detalhes na sala de atendimento.`,
        referencia: `/cliente/solicitacoes/${solicitacaoId}`,
      },
      tx,
    );
    await registrarEvento(
      { usuarioId, tipo: 'ACEITE', entidade: 'atendimento', entidadeId: a.id, detalhes: { solicitacaoId, distanciaKm: distancia }, ip },
      tx,
    );
    return a.id;
  });

  return { atendimentoId, solicitacaoId, mensagem: 'Demanda aceita. O cliente foi notificado.' };
}

/** RF23 — recusa individual (não cancela a solicitação para os demais). Motivo opcional. */
export async function recusarDemanda(usuarioId: string, solicitacaoId: string, motivo?: string, ip?: string) {
  const i = await carregarInterprete(usuarioId);
  exigirHabilitado(i);
  const [s] = await db.select({ id: solicitacoes.id, status: solicitacoes.status }).from(solicitacoes).where(eq(solicitacoes.id, solicitacaoId)).limit(1);
  if (!s) throw Erros.naoEncontrado('Demanda');

  const agora = new Date();
  await db.transaction(async (tx) => {
    await tx
      .insert(ofertas)
      .values({ solicitacaoId, interpreteId: usuarioId, distanciaKm: 0, status: 'RECUSADA', respondidaEm: agora, motivoRecusa: motivo?.trim() || null })
      .onConflictDoUpdate({
        target: [ofertas.solicitacaoId, ofertas.interpreteId],
        set: { status: 'RECUSADA', respondidaEm: agora, motivoRecusa: motivo?.trim() || null },
      });
    await registrarEvento({ usuarioId, tipo: 'OFERTA_RECUSADA', entidade: 'solicitacao', entidadeId: solicitacaoId, detalhes: { motivo }, ip }, tx);
  });
  return { solicitacaoId, status: 'RECUSADA' };
}

/** RF24 — raio (≤ 15 km) e toggle online. */
export async function atualizarConfiguracao(usuarioId: string, dados: { raioKm?: number; disponivelAgora?: boolean }) {
  await carregarInterprete(usuarioId);
  if (dados.raioKm !== undefined && (dados.raioKm < 1 || dados.raioKm > REGRAS.RAIO_MAXIMO_KM)) {
    throw Erros.regraNegocio(`O raio deve estar entre 1 e ${REGRAS.RAIO_MAXIMO_KM} km.`, 'RAIO_INVALIDO');
  }
  const [i] = await db
    .update(interpretes)
    .set({ ...(dados.raioKm !== undefined ? { raioKm: dados.raioKm } : {}), ...(dados.disponivelAgora !== undefined ? { disponivelAgora: dados.disponivelAgora } : {}) })
    .where(eq(interpretes.usuarioId, usuarioId))
    .returning({ raioKm: interpretes.raioKm, disponivelAgora: interpretes.disponivelAgora, statusHabilitacao: interpretes.statusHabilitacao });
  return i;
}

/** RF25 — disponibilidade semanal (substitui a grade inteira). */
export async function listarDisponibilidades(usuarioId: string) {
  return db.select().from(disponibilidades).where(eq(disponibilidades.interpreteId, usuarioId)).orderBy(disponibilidades.diaSemana, disponibilidades.inicio);
}

export async function salvarDisponibilidades(usuarioId: string, faixas: { diaSemana: number; inicio: string; fim: string }[]) {
  await carregarInterprete(usuarioId);
  for (const f of faixas) {
    if (f.inicio >= f.fim) throw Erros.validacao([{ campo: 'faixas', mensagem: `Faixa inválida no dia ${f.diaSemana}: início deve ser antes do fim.` }]);
  }
  await db.transaction(async (tx) => {
    await tx.delete(disponibilidades).where(eq(disponibilidades.interpreteId, usuarioId));
    if (faixas.length) await tx.insert(disponibilidades).values(faixas.map((f) => ({ ...f, interpreteId: usuarioId })));
  });
  return listarDisponibilidades(usuarioId);
}

/** Painel do hub do intérprete: próximos atendimentos, demandas pendentes, status. */
export async function resumoHubInterprete(usuarioId: string) {
  const i = await carregarInterprete(usuarioId);
  const proximos = await db.query.atendimentos.findMany({
    where: and(eq(atendimentos.interpreteId, usuarioId), inArray(atendimentos.status, ['AGENDADO', 'EM_ANDAMENTO'])),
    with: { solicitacao: { with: { cliente: { with: { usuario: true } }, cotacao: true } }, checkin: true },
    orderBy: [desc(atendimentos.status), atendimentos.aceitoEm],
  });
  const demandas = i.statusHabilitacao === 'APROVADO' ? (await listarDemandas(usuarioId)).demandas : [];
  const [u] = await db.select({ nome: usuarios.nome }).from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
  return {
    nome: u?.nome,
    statusHabilitacao: i.statusHabilitacao,
    disponivelAgora: i.disponivelAgora,
    raioKm: i.raioKm,
    reputacao: i.reputacao,
    totalAvaliacoes: i.totalAvaliacoes,
    demandasPendentes: demandas.slice(0, 5),
    totalDemandas: demandas.length,
    proximosAtendimentos: proximos
      .sort((a, b) => a.solicitacao.inicioPrevisto.getTime() - b.solicitacao.inicioPrevisto.getTime())
      .map((a) => ({
        id: a.id,
        status: a.status,
        tipoServico: a.solicitacao.tipoServico,
        tipoServicoRotulo: ROTULOS.tipoServico[a.solicitacao.tipoServico],
        inicioPrevisto: a.solicitacao.inicioPrevisto,
        duracaoPrevistaMin: a.solicitacao.duracaoPrevistaMin,
        endereco: a.solicitacao.endereco,
        clienteNome: a.solicitacao.cliente.usuario.nome,
        valorEstimado: a.solicitacao.cotacao?.valorTotal ?? null,
        checkinRealizado: Boolean(a.checkin?.lidoEm),
      })),
  };
}
