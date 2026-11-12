/**
 * RF10–RF19 — ciclo da solicitação do cliente:
 * estimativa (RF15) → confirmação (RF16) → distribuição por proximidade/reputação (RF17)
 * → acompanhamento de status (RF18) → cancelamento com regras de prazo/taxa (RF19).
 */
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { REGRAS } from '../config/regras.js';
import { db, type Tx } from '../models/db.js';
import {
  atendimentos,
  cotacoes,
  interpretes,
  ofertas,
  solicitacoes,
  usuarios,
  type StatusSolicitacao,
  type TipoServico,
} from '../models/schema.js';
import { arredondar2, diferencaHoras } from '../utils/datas.js';
import { Erros } from '../utils/erros.js';
import { distanciaKm } from '../utils/geo.js';
import { apresentarInterpretePublico, ROTULOS } from '../views/presenters.js';
import { registrarEvento } from './auditoria.service.js';
import { notificar } from './notificacao.service.js';

export interface EntradaEstimativa {
  tipoServico: TipoServico;
  duracaoPrevistaMin: number;
}

export interface EntradaSolicitacao extends EntradaEstimativa {
  inicioPrevisto: string; // ISO
  endereco: string;
  complemento?: string;
  pontoReferencia?: string;
  latitude: number;
  longitude: number;
  observacoes?: string;
}

/** RF15 — cálculo da estimativa (regra v1, parametrizada em REGRAS.PRECO). */
export function calcularEstimativa(entrada: EntradaEstimativa) {
  validarDuracao(entrada.duracaoPrevistaMin);
  const precoHora = REGRAS.PRECO.HORA_REFERENCIA[entrada.tipoServico] ?? REGRAS.PRECO.HORA_REFERENCIA.OUTRO;
  const horas = entrada.duracaoPrevistaMin / 60;
  const valorServico = arredondar2(precoHora * horas);
  const valorDeslocamento = REGRAS.PRECO.DESLOCAMENTO_FIXO;
  const taxaPlataforma = arredondar2(valorServico * REGRAS.PRECO.TAXA_PLATAFORMA_PERCENTUAL);
  return {
    tipoServico: entrada.tipoServico,
    duracaoPrevistaMin: entrada.duracaoPrevistaMin,
    precoHoraReferencia: precoHora,
    valorServico,
    valorDeslocamento,
    taxaPlataforma,
    valorTotal: arredondar2(valorServico + valorDeslocamento + taxaPlataforma),
    versaoRegra: REGRAS.PRECO.VERSAO_REGRA,
    observacao: 'Valor estimado. O valor final considera a duração real do atendimento (mínimo contratado garantido).',
  };
}

function validarDuracao(duracaoMin: number) {
  if (duracaoMin < REGRAS.DURACAO_MINIMA_MIN) {
    throw Erros.regraNegocio(`A duração mínima contratada é de ${REGRAS.DURACAO_MINIMA_MIN} minutos (1 hora).`, 'DURACAO_MINIMA');
  }
  if (duracaoMin > REGRAS.DURACAO_MAXIMA_MIN) {
    throw Erros.regraNegocio('A duração máxima por solicitação é de 12 horas.', 'DURACAO_MAXIMA');
  }
  if (duracaoMin % REGRAS.DURACAO_BLOCO_MIN !== 0) {
    throw Erros.regraNegocio('Informe a duração em blocos de 30 minutos (ex.: 60, 90, 120).', 'DURACAO_BLOCO');
  }
}

/** RF12/RF13/RF14/RF16 — valida, registra a solicitação com cotação e dispara a distribuição. */
export async function criarSolicitacao(clienteId: string, entrada: EntradaSolicitacao, ip?: string) {
  const inicio = new Date(entrada.inicioPrevisto);
  if (Number.isNaN(inicio.getTime())) throw Erros.validacao([{ campo: 'inicioPrevisto', mensagem: 'Data/hora inválida.' }]);
  if (inicio.getTime() <= Date.now()) {
    throw Erros.regraNegocio('A data e o horário do atendimento devem ser futuros.', 'DATA_PASSADA');
  }
  const estimativa = calcularEstimativa(entrada);

  const resultado = await db.transaction(async (tx) => {
    const [s] = await tx
      .insert(solicitacoes)
      .values({
        clienteId,
        tipoServico: entrada.tipoServico,
        inicioPrevisto: inicio,
        duracaoPrevistaMin: entrada.duracaoPrevistaMin,
        endereco: entrada.endereco.trim(),
        complemento: entrada.complemento?.trim() || null,
        pontoReferencia: entrada.pontoReferencia?.trim() || null,
        latitude: entrada.latitude,
        longitude: entrada.longitude,
        observacoes: entrada.observacoes?.trim() || null,
        status: 'BUSCANDO',
      })
      .returning();
    await tx.insert(cotacoes).values({
      solicitacaoId: s.id,
      valorServico: estimativa.valorServico,
      valorDeslocamento: estimativa.valorDeslocamento,
      taxaPlataforma: estimativa.taxaPlataforma,
      valorTotal: estimativa.valorTotal,
      versaoRegra: estimativa.versaoRegra,
    });
    const elegiveis = await distribuir(tx, s);
    await registrarEvento(
      { usuarioId: clienteId, tipo: 'SOLICITACAO_CRIADA', entidade: 'solicitacao', entidadeId: s.id, detalhes: { elegiveis: elegiveis.length }, ip },
      tx,
    );
    return { solicitacao: s, elegiveis: elegiveis.length };
  });

  return { ...(await obterSolicitacao(resultado.solicitacao.id, clienteId, 'CLIENTE')), interpretesNotificados: resultado.elegiveis };
}

/**
 * RF17 / RNF27 / RNF43 — distribuição: intérpretes APROVADOS, online, cujo raio configurado (≤ 15 km)
 * alcança o local; ordenados por proximidade e depois por reputação. Cria uma Oferta por intérprete.
 */
async function distribuir(tx: Tx, s: typeof solicitacoes.$inferSelect) {
  const candidatos = await tx
    .select({
      usuarioId: interpretes.usuarioId,
      latitudeBase: interpretes.latitudeBase,
      longitudeBase: interpretes.longitudeBase,
      raioKm: interpretes.raioKm,
      reputacao: interpretes.reputacao,
    })
    .from(interpretes)
    .innerJoin(usuarios, eq(usuarios.id, interpretes.usuarioId))
    .where(and(eq(interpretes.statusHabilitacao, 'APROVADO'), eq(interpretes.disponivelAgora, true), eq(usuarios.ativo, true)));

  const local = { latitude: s.latitude, longitude: s.longitude };
  const elegiveis = candidatos
    .map((c) => ({ ...c, distanciaKm: distanciaKm(local, { latitude: c.latitudeBase, longitude: c.longitudeBase }) }))
    .filter((c) => c.distanciaKm <= Math.min(c.raioKm, REGRAS.RAIO_MAXIMO_KM))
    .sort((a, b) => a.distanciaKm - b.distanciaKm || (b.reputacao ?? 0) - (a.reputacao ?? 0));

  if (elegiveis.length) {
    await tx.insert(ofertas).values(elegiveis.map((e) => ({ solicitacaoId: s.id, interpreteId: e.usuarioId, distanciaKm: e.distanciaKm })));
    for (const e of elegiveis) {
      await notificar(
        {
          usuarioId: e.usuarioId,
          tipo: 'SOLICITACAO',
          titulo: 'Nova demanda próxima de você',
          conteudo: `${ROTULOS.tipoServico[s.tipoServico]} a ${e.distanciaKm} km • ${s.duracaoPrevistaMin} min.`,
          referencia: `/interprete/demandas/${s.id}`,
        },
        tx,
      );
    }
  }
  return elegiveis;
}

/** Lista as solicitações do cliente (ativas primeiro). */
export async function listarSolicitacoesDoCliente(clienteId: string, status?: StatusSolicitacao[]) {
  const linhas = await db.query.solicitacoes.findMany({
    where: status?.length
      ? and(eq(solicitacoes.clienteId, clienteId), inArray(solicitacoes.status, status))
      : eq(solicitacoes.clienteId, clienteId),
    with: { cotacao: true, atendimento: { with: { interprete: { with: { usuario: true } } } } },
    orderBy: [desc(solicitacoes.criadaEm)],
  });
  return linhas.map((s) => resumoSolicitacao(s));
}

type SolicitacaoComRelacoes = NonNullable<Awaited<ReturnType<typeof carregarSolicitacaoCompleta>>>;

async function carregarSolicitacaoCompleta(id: string) {
  return db.query.solicitacoes.findFirst({
    where: eq(solicitacoes.id, id),
    with: {
      cotacao: true,
      cliente: { with: { usuario: true } },
      atendimento: { with: { interprete: { with: { usuario: true, certificacoes: true } }, checkin: true, pagamentos: true, avaliacoes: true, comprovante: true } },
      ofertas: true,
    },
  });
}

function resumoSolicitacao(s: {
  id: string;
  tipoServico: string;
  inicioPrevisto: Date;
  duracaoPrevistaMin: number;
  endereco: string;
  status: string;
  criadaEm: Date;
  cotacao?: { valorTotal: number } | null;
  atendimento?: { id: string; status: string; interprete: { usuario: { nome: string } } } | null;
}) {
  return {
    id: s.id,
    tipoServico: s.tipoServico,
    tipoServicoRotulo: ROTULOS.tipoServico[s.tipoServico],
    inicioPrevisto: s.inicioPrevisto,
    duracaoPrevistaMin: s.duracaoPrevistaMin,
    endereco: s.endereco,
    status: s.status,
    statusRotulo: ROTULOS.statusSolicitacao[s.status],
    valorEstimado: s.cotacao?.valorTotal ?? null,
    criadaEm: s.criadaEm,
    atendimentoId: s.atendimento?.id ?? null,
    interpreteNome: s.atendimento?.interprete.usuario.nome ?? null,
  };
}

/** RF18 — detalhe/acompanhamento. Cliente dono, intérprete com oferta/atendimento ou backoffice. */
export async function obterSolicitacao(id: string, usuarioId: string, papel: string) {
  const s = await carregarSolicitacaoCompleta(id);
  if (!s) throw Erros.naoEncontrado('Solicitação');
  const ehDono = s.clienteId === usuarioId;
  const ehInterpreteVinculado = s.atendimento?.interpreteId === usuarioId || s.ofertas.some((o) => o.interpreteId === usuarioId);
  const ehOperador = papel === 'BACKOFFICE' || papel === 'SUPORTE';
  if (!ehDono && !ehInterpreteVinculado && !ehOperador) throw Erros.proibido();
  return apresentarSolicitacao(s, usuarioId);
}

function apresentarSolicitacao(s: SolicitacaoComRelacoes, usuarioId: string) {
  const a = s.atendimento;
  const cert = a?.interprete.certificacoes.find((c) => c.status === 'APROVADA') ?? a?.interprete.certificacoes[0];
  const pagamentoPago = a?.pagamentos.find((p) => p.status === 'PAGO');
  const pagamentoPendente = a?.pagamentos.find((p) => p.status === 'PENDENTE' || p.status === 'FALHOU');
  return {
    id: s.id,
    status: s.status,
    statusRotulo: ROTULOS.statusSolicitacao[s.status],
    tipoServico: s.tipoServico,
    tipoServicoRotulo: ROTULOS.tipoServico[s.tipoServico],
    inicioPrevisto: s.inicioPrevisto,
    duracaoPrevistaMin: s.duracaoPrevistaMin,
    local: {
      endereco: s.endereco,
      complemento: s.complemento,
      pontoReferencia: s.pontoReferencia,
      latitude: s.latitude,
      longitude: s.longitude,
    },
    observacoes: s.observacoes,
    cotacao: s.cotacao
      ? {
          valorServico: s.cotacao.valorServico,
          valorDeslocamento: s.cotacao.valorDeslocamento,
          taxaPlataforma: s.cotacao.taxaPlataforma,
          valorTotal: s.cotacao.valorTotal,
          versaoRegra: s.cotacao.versaoRegra,
        }
      : null,
    cliente: { id: s.cliente.usuarioId, nome: s.cliente.usuario.nome, telefone: s.cliente.usuario.telefone, fotoUrl: s.cliente.usuario.fotoUrl },
    interprete: a ? apresentarInterpretePublico(a.interprete.usuario, a.interprete, cert) : null,
    ofertasEnviadas: s.ofertas.length,
    atendimento: a
      ? {
          id: a.id,
          status: a.status,
          aceitoEm: a.aceitoEm,
          inicioReal: a.inicioReal,
          fimReal: a.fimReal,
          duracaoRealMin: a.duracaoRealMin,
          valorFinal: a.valorFinal,
          checkinRealizado: Boolean(a.checkin?.lidoEm),
          pagamento: pagamentoPago
            ? { id: pagamentoPago.id, status: 'PAGO', valor: pagamentoPago.valor, confirmadoEm: pagamentoPago.confirmadoEm }
            : pagamentoPendente
              ? { id: pagamentoPendente.id, status: pagamentoPendente.status, valor: pagamentoPendente.valor }
              : null,
          comprovante: a.comprovante ? { codigoVerificacao: a.comprovante.codigoVerificacao, emitidoEm: a.comprovante.emitidoEm } : null,
          avaliacaoFeita: a.avaliacoes.some((av) => av.autorId === usuarioId),
        }
      : null,
    cancelamento: s.status === 'CANCELADA' ? { em: s.canceladaEm, motivo: s.motivoCancelamento, taxa: s.taxaCancelamento } : null,
    politicaCancelamento: calcularTaxaCancelamento(s),
    criadaEm: s.criadaEm,
  };
}

/** RF19 / D-02 — taxa aplicável ao cancelamento neste momento. */
function calcularTaxaCancelamento(s: { status: string; inicioPrevisto: Date; cotacao?: { valorTotal: number } | null }) {
  if (s.status === 'CONCLUIDA' || s.status === 'CANCELADA') return { permitido: false, taxa: 0, motivo: 'Solicitação já encerrada.' };
  if (s.status === 'EM_ANDAMENTO') return { permitido: false, taxa: 0, motivo: 'Não é possível cancelar um atendimento em andamento.' };
  const horasAteInicio = diferencaHoras(s.inicioPrevisto, new Date());
  if (s.status === 'ACEITA' && horasAteInicio < REGRAS.CANCELAMENTO.JANELA_SEM_TAXA_HORAS) {
    const taxa = arredondar2((s.cotacao?.valorTotal ?? 0) * REGRAS.CANCELAMENTO.PERCENTUAL_TAXA);
    return { permitido: true, taxa, motivo: `Cancelamento com menos de ${REGRAS.CANCELAMENTO.JANELA_SEM_TAXA_HORAS} h após o aceite: taxa de 20%.` };
  }
  return { permitido: true, taxa: 0, motivo: 'Cancelamento sem custo.' };
}

export async function cancelarSolicitacao(id: string, clienteId: string, motivo?: string, ip?: string) {
  const s = await carregarSolicitacaoCompleta(id);
  if (!s) throw Erros.naoEncontrado('Solicitação');
  if (s.clienteId !== clienteId) throw Erros.proibido();
  const politica = calcularTaxaCancelamento(s);
  if (!politica.permitido) throw Erros.regraNegocio(politica.motivo, 'CANCELAMENTO_NAO_PERMITIDO');

  await db.transaction(async (tx) => {
    const agora = new Date();
    const [atualizada] = await tx
      .update(solicitacoes)
      .set({ status: 'CANCELADA', canceladaEm: agora, motivoCancelamento: motivo?.trim() || null, taxaCancelamento: politica.taxa, atualizadaEm: agora })
      .where(and(eq(solicitacoes.id, id), inArray(solicitacoes.status, ['BUSCANDO', 'ACEITA'])))
      .returning({ id: solicitacoes.id });
    if (!atualizada) throw Erros.conflito('A solicitação mudou de estado; atualize a tela e tente novamente.', 'ESTADO_ALTERADO');

    if (s.atendimento) {
      await tx.update(atendimentos).set({ status: 'CANCELADO' }).where(eq(atendimentos.id, s.atendimento.id));
      await notificar(
        {
          usuarioId: s.atendimento.interpreteId,
          tipo: 'SOLICITACAO',
          titulo: 'Atendimento cancelado pelo cliente',
          conteudo: `O atendimento de ${ROTULOS.tipoServico[s.tipoServico]} previsto para ${s.inicioPrevisto.toLocaleString('pt-BR')} foi cancelado.`,
          referencia: '/interprete',
        },
        tx,
      );
    }
    await tx
      .update(ofertas)
      .set({ status: 'EXPIRADA', respondidaEm: agora })
      .where(and(eq(ofertas.solicitacaoId, id), eq(ofertas.status, 'ENVIADA')));
    await registrarEvento(
      { usuarioId: clienteId, tipo: 'SOLICITACAO_CANCELADA', entidade: 'solicitacao', entidadeId: id, detalhes: { taxa: politica.taxa, motivo }, ip },
      tx,
    );
  });
  return obterSolicitacao(id, clienteId, 'CLIENTE');
}

/** Indicadores do hub do cliente. */
export async function resumoHubCliente(clienteId: string) {
  const [contagem] = await db
    .select({
      concluidos: sql<number>`count(*) filter (where ${solicitacoes.status} = 'CONCLUIDA')::int`,
      ativos: sql<number>`count(*) filter (where ${solicitacoes.status} in ('BUSCANDO','ACEITA','EM_ANDAMENTO'))::int`,
    })
    .from(solicitacoes)
    .where(eq(solicitacoes.clienteId, clienteId));
  const ativas = await listarSolicitacoesDoCliente(clienteId, ['BUSCANDO', 'ACEITA', 'EM_ANDAMENTO']);
  const recentes = (await listarSolicitacoesDoCliente(clienteId, ['CONCLUIDA', 'CANCELADA'])).slice(0, 5);
  return { concluidos: contagem?.concluidos ?? 0, ativos: contagem?.ativos ?? 0, ativas, recentes };
}
