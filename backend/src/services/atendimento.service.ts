/**
 * RF28–RF34, RF39 — execução presencial: sala de atendimento (mensagens, fotos, localização temporária),
 * QR Code + check-in geolocalizado (≤ 200 m, precisão ≤ 50 m), encerramento com duração real,
 * suporte/emergência e histórico com filtros.
 */
import { and, asc, desc, eq, gt, gte, inArray, lte, or, sql, type SQL } from 'drizzle-orm';
import { REGRAS } from '../config/regras.js';
import { db } from '../models/db.js';
import {
  atendimentos,
  chamadosSuporte,
  checkins,
  localizacoesCompartilhadas,
  mensagens,
  pagamentos,
  solicitacoes,
  usuarios,
} from '../models/schema.js';
import { adicionarMinutos, arredondar2, diferencaMinutos } from '../utils/datas.js';
import { Erros } from '../utils/erros.js';
import { distanciaMetros } from '../utils/geo.js';
import { apresentarClientePublico, apresentarInterpretePublico, ROTULOS } from '../views/presenters.js';
import { registrarEvento } from './auditoria.service.js';
import { notificar } from './notificacao.service.js';

export type AtendimentoCompleto = NonNullable<Awaited<ReturnType<typeof carregarAtendimento>>>;

export async function carregarAtendimento(id: string) {
  return db.query.atendimentos.findFirst({
    where: eq(atendimentos.id, id),
    with: {
      solicitacao: { with: { cliente: { with: { usuario: true } }, cotacao: true } },
      interprete: { with: { usuario: true, certificacoes: true } },
      checkin: true,
      pagamentos: true,
      avaliacoes: true,
      comprovante: true,
    },
  });
}

/** Garante que o usuário é participante (cliente dono ou intérprete alocado) ou operador. */
export async function exigirParticipante(atendimentoId: string, usuarioId: string, papel: string): Promise<AtendimentoCompleto> {
  const a = await carregarAtendimento(atendimentoId);
  if (!a) throw Erros.naoEncontrado('Atendimento');
  const participante = a.solicitacao.clienteId === usuarioId || a.interpreteId === usuarioId;
  const operador = papel === 'BACKOFFICE' || papel === 'SUPORTE';
  if (!participante && !operador) throw Erros.proibido('Você não participa deste atendimento.');
  return a;
}

export function apresentarAtendimento(a: AtendimentoCompleto, usuarioId: string) {
  const cert = a.interprete.certificacoes.find((c) => c.status === 'APROVADA') ?? a.interprete.certificacoes[0];
  const pago = a.pagamentos.find((p) => p.status === 'PAGO');
  const pendente = a.pagamentos.find((p) => p.status === 'PENDENTE' || p.status === 'FALHOU');
  const ehCliente = a.solicitacao.clienteId === usuarioId;
  const janelaCheckin = adicionarMinutos(a.solicitacao.inicioPrevisto, -REGRAS.CHECKIN_ANTECEDENCIA_MIN);
  return {
    id: a.id,
    status: a.status,
    papelNoAtendimento: ehCliente ? 'CLIENTE' : a.interpreteId === usuarioId ? 'INTERPRETE' : 'OPERADOR',
    solicitacaoId: a.solicitacaoId,
    tipoServico: a.solicitacao.tipoServico,
    tipoServicoRotulo: ROTULOS.tipoServico[a.solicitacao.tipoServico],
    inicioPrevisto: a.solicitacao.inicioPrevisto,
    duracaoPrevistaMin: a.solicitacao.duracaoPrevistaMin,
    local: {
      endereco: a.solicitacao.endereco,
      complemento: a.solicitacao.complemento,
      pontoReferencia: a.solicitacao.pontoReferencia,
      latitude: a.solicitacao.latitude,
      longitude: a.solicitacao.longitude,
    },
    observacoes: a.solicitacao.observacoes,
    valorEstimado: a.solicitacao.cotacao?.valorTotal ?? null,
    valorFinal: a.valorFinal,
    aceitoEm: a.aceitoEm,
    inicioReal: a.inicioReal,
    fimReal: a.fimReal,
    duracaoRealMin: a.duracaoRealMin,
    cliente: apresentarClientePublico(a.solicitacao.cliente.usuario),
    interprete: apresentarInterpretePublico(a.interprete.usuario, a.interprete, cert),
    checkin: {
      realizado: Boolean(a.checkin?.lidoEm),
      lidoEm: a.checkin?.lidoEm ?? null,
      distanciaM: a.checkin?.distanciaM ?? null,
      disponivelApartirDe: janelaCheckin,
      // o código do QR só é entregue ao cliente (quem exibe); o intérprete lê pela câmera
      codigo: ehCliente && a.status === 'AGENDADO' ? a.checkin?.qrHash : undefined,
    },
    pagamento: pago
      ? { id: pago.id, status: 'PAGO', valor: pago.valor, meio: pago.meio, confirmadoEm: pago.confirmadoEm }
      : pendente
        ? { id: pendente.id, status: pendente.status, valor: pendente.valor, mensagem: pendente.mensagemGateway }
        : null,
    comprovante: a.comprovante ? { codigoVerificacao: a.comprovante.codigoVerificacao, emitidoEm: a.comprovante.emitidoEm } : null,
    avaliacoes: {
      minhaAvaliacaoFeita: a.avaliacoes.some((av) => av.autorId === usuarioId),
      recebidas: a.avaliacoes.filter((av) => av.avaliadoId === usuarioId).map((av) => ({ nota: av.nota, comentario: av.comentario, data: av.data })),
    },
  };
}

export async function obterAtendimento(id: string, usuarioId: string, papel: string) {
  const a = await exigirParticipante(id, usuarioId, papel);
  return apresentarAtendimento(a, usuarioId);
}

/** RF39 — histórico do usuário (cliente ou intérprete) com filtros por período, tipo e situação. */
export async function listarHistorico(
  usuarioId: string,
  papel: string,
  filtro: { de?: string; ate?: string; tipoServico?: string; status?: string; apenasAtivos?: boolean },
) {
  const condicoes: SQL[] = [];
  if (papel === 'CLIENTE') condicoes.push(eq(solicitacoes.clienteId, usuarioId));
  else if (papel === 'INTERPRETE') condicoes.push(eq(atendimentos.interpreteId, usuarioId));
  if (filtro.de) condicoes.push(gte(solicitacoes.inicioPrevisto, new Date(filtro.de)));
  if (filtro.ate) condicoes.push(lte(solicitacoes.inicioPrevisto, new Date(`${filtro.ate}T23:59:59`)));
  if (filtro.tipoServico) condicoes.push(eq(solicitacoes.tipoServico, filtro.tipoServico as never));
  if (filtro.status) condicoes.push(eq(atendimentos.status, filtro.status as never));
  if (filtro.apenasAtivos) condicoes.push(inArray(atendimentos.status, ['AGENDADO', 'EM_ANDAMENTO']));

  const linhas = await db
    .select({
      id: atendimentos.id,
      status: atendimentos.status,
      inicioReal: atendimentos.inicioReal,
      fimReal: atendimentos.fimReal,
      duracaoRealMin: atendimentos.duracaoRealMin,
      valorFinal: atendimentos.valorFinal,
      solicitacaoId: solicitacoes.id,
      tipoServico: solicitacoes.tipoServico,
      inicioPrevisto: solicitacoes.inicioPrevisto,
      duracaoPrevistaMin: solicitacoes.duracaoPrevistaMin,
      endereco: solicitacoes.endereco,
      clienteId: solicitacoes.clienteId,
      interpreteId: atendimentos.interpreteId,
      pago: sql<boolean>`exists (select 1 from ${pagamentos} p where p.atendimento_id = ${atendimentos.id} and p.status = 'PAGO')`,
      comprovante: sql<boolean>`exists (select 1 from comprovantes c where c.atendimento_id = ${atendimentos.id})`,
    })
    .from(atendimentos)
    .innerJoin(solicitacoes, eq(solicitacoes.id, atendimentos.solicitacaoId))
    .where(condicoes.length ? and(...condicoes) : undefined)
    .orderBy(desc(solicitacoes.inicioPrevisto))
    .limit(200);

  // nomes da contraparte
  const ids = Array.from(new Set(linhas.flatMap((l) => [l.clienteId, l.interpreteId])));
  const pessoas = ids.length ? await db.select({ id: usuarios.id, nome: usuarios.nome }).from(usuarios).where(inArray(usuarios.id, ids)) : [];
  const nome = (id: string) => pessoas.find((p) => p.id === id)?.nome ?? '—';

  return linhas.map((l) => ({
    id: l.id,
    solicitacaoId: l.solicitacaoId,
    status: l.status,
    tipoServico: l.tipoServico,
    tipoServicoRotulo: ROTULOS.tipoServico[l.tipoServico],
    inicioPrevisto: l.inicioPrevisto,
    duracaoPrevistaMin: l.duracaoPrevistaMin,
    duracaoRealMin: l.duracaoRealMin,
    endereco: l.endereco,
    valorFinal: l.valorFinal,
    pago: l.pago,
    comprovanteDisponivel: l.comprovante,
    contraparte: papel === 'CLIENTE' ? nome(l.interpreteId) : nome(l.clienteId),
  }));
}

// ---------------------------------------------------------------------------
// Sala de atendimento (RF28, RF29, RF30)
// ---------------------------------------------------------------------------
export async function listarMensagens(atendimentoId: string, usuarioId: string, papel: string, apos?: string) {
  await exigirParticipante(atendimentoId, usuarioId, papel);
  const condicoes: SQL[] = [eq(mensagens.atendimentoId, atendimentoId)];
  if (apos) {
    const data = new Date(apos);
    if (!Number.isNaN(data.getTime())) condicoes.push(gt(mensagens.enviadaEm, data));
  }
  const linhas = await db.query.mensagens.findMany({
    where: and(...condicoes),
    with: { autor: { columns: { id: true, nome: true, papel: true } } },
    orderBy: [asc(mensagens.enviadaEm)],
    limit: 200,
  });
  return linhas.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    texto: m.texto,
    arquivoUri: m.arquivoUri,
    latitude: m.latitude,
    longitude: m.longitude,
    enviadaEm: m.enviadaEm,
    autor: m.autor ? { id: m.autor.id, nome: m.autor.nome, papel: m.autor.papel } : { id: null, nome: 'Víamos', papel: 'SISTEMA' },
    minha: m.autorId === usuarioId,
  }));
}

export async function enviarMensagem(
  atendimentoId: string,
  usuarioId: string,
  papel: string,
  entrada: { tipo: 'TEXTO' | 'IMAGEM' | 'LOCALIZACAO'; texto?: string; imagemDataUrl?: string; latitude?: number; longitude?: number },
) {
  const a = await exigirParticipante(atendimentoId, usuarioId, papel);
  if (a.status === 'CANCELADO') throw Erros.regraNegocio('Este atendimento foi cancelado; a sala está encerrada.', 'SALA_ENCERRADA');
  if (a.status === 'CONCLUIDO' && a.fimReal && Date.now() - a.fimReal.getTime() > 24 * 3_600_000) {
    throw Erros.regraNegocio('A sala é encerrada 24 h após o fim do atendimento.', 'SALA_ENCERRADA');
  }

  let arquivoUri: string | null = null;
  if (entrada.tipo === 'IMAGEM') {
    if (!/^data:image\/(jpeg|png|webp);base64,/i.test(entrada.imagemDataUrl ?? '')) {
      throw Erros.validacao([{ campo: 'imagemDataUrl', mensagem: 'Envie uma imagem válida (JPEG, PNG ou WebP).' }]);
    }
    if (entrada.imagemDataUrl!.length > REGRAS.FOTO_CHAT_TAMANHO_MAX_BYTES * 1.37) {
      throw Erros.validacao([{ campo: 'imagemDataUrl', mensagem: 'A foto deve ter no máximo 1 MB.' }]);
    }
    arquivoUri = entrada.imagemDataUrl ?? null;
  }
  if (entrada.tipo === 'TEXTO' && !entrada.texto?.trim()) throw Erros.validacao([{ campo: 'texto', mensagem: 'Digite uma mensagem.' }]);
  if (entrada.tipo === 'LOCALIZACAO' && (entrada.latitude === undefined || entrada.longitude === undefined)) {
    throw Erros.validacao([{ campo: 'latitude', mensagem: 'Localização incompleta.' }]);
  }

  const [m] = await db
    .insert(mensagens)
    .values({
      atendimentoId,
      autorId: usuarioId,
      tipo: entrada.tipo,
      texto: entrada.texto?.trim() || null,
      arquivoUri,
      latitude: entrada.latitude ?? null,
      longitude: entrada.longitude ?? null,
    })
    .returning();

  const destinatario = a.solicitacao.clienteId === usuarioId ? a.interpreteId : a.solicitacao.clienteId;
  const rota = destinatario === a.interpreteId ? `/interprete/atendimentos/${atendimentoId}/sala` : `/cliente/atendimentos/${atendimentoId}/sala`;
  await notificar({
    usuarioId: destinatario,
    tipo: 'MENSAGEM',
    titulo: 'Nova mensagem na sala de atendimento',
    conteudo: entrada.tipo === 'TEXTO' ? (entrada.texto ?? '').slice(0, 120) : entrada.tipo === 'IMAGEM' ? 'Foto do ponto de encontro enviada.' : 'Localização compartilhada.',
    referencia: rota,
  });
  return m;
}

/** RF29 / RNF44 / RNF21 — localização temporária: só no dia do atendimento e enquanto não concluído. */
export async function compartilharLocalizacao(atendimentoId: string, usuarioId: string, papel: string, pos: { latitude: number; longitude: number; precisaoM?: number }) {
  const a = await exigirParticipante(atendimentoId, usuarioId, papel);
  if (a.status === 'CONCLUIDO' || a.status === 'CANCELADO') throw Erros.regraNegocio('O compartilhamento de localização encerra com o atendimento.', 'LOCALIZACAO_ENCERRADA');
  const janela = adicionarMinutos(a.solicitacao.inicioPrevisto, -120);
  if (Date.now() < janela.getTime()) throw Erros.regraNegocio('A localização só pode ser compartilhada a partir de 2 h antes do atendimento.', 'FORA_DA_JANELA');
  const [l] = await db
    .insert(localizacoesCompartilhadas)
    .values({ atendimentoId, usuarioId, latitude: pos.latitude, longitude: pos.longitude, precisaoM: pos.precisaoM ?? null })
    .returning();
  return l;
}

export async function obterLocalizacoes(atendimentoId: string, usuarioId: string, papel: string) {
  await exigirParticipante(atendimentoId, usuarioId, papel);
  const linhas = await db
    .select()
    .from(localizacoesCompartilhadas)
    .where(and(eq(localizacoesCompartilhadas.atendimentoId, atendimentoId), gt(localizacoesCompartilhadas.registradaEm, new Date(Date.now() - 15 * 60_000))))
    .orderBy(desc(localizacoesCompartilhadas.registradaEm))
    .limit(20);
  // última posição de cada participante
  const porUsuario = new Map<string, (typeof linhas)[number]>();
  for (const l of linhas) if (!porUsuario.has(l.usuarioId)) porUsuario.set(l.usuarioId, l);
  return Array.from(porUsuario.values()).map((l) => ({ usuarioId: l.usuarioId, latitude: l.latitude, longitude: l.longitude, precisaoM: l.precisaoM, registradaEm: l.registradaEm }));
}

// ---------------------------------------------------------------------------
// Check-in (RF31, RF32, RNF26) e encerramento (RF33)
// ---------------------------------------------------------------------------
export async function obterQrCode(atendimentoId: string, usuarioId: string) {
  const a = await carregarAtendimento(atendimentoId);
  if (!a) throw Erros.naoEncontrado('Atendimento');
  if (a.solicitacao.clienteId !== usuarioId) throw Erros.proibido('Apenas o cliente exibe o QR Code do atendimento.');
  if (a.status !== 'AGENDADO') throw Erros.regraNegocio('O QR Code só é válido antes do check-in.', 'QR_INDISPONIVEL');
  return {
    codigo: a.checkin?.qrHash,
    conteudo: `VIAMOS:${a.id}:${a.checkin?.qrHash}`,
    disponivelApartirDe: adicionarMinutos(a.solicitacao.inicioPrevisto, -REGRAS.CHECKIN_ANTECEDENCIA_MIN),
  };
}

export async function realizarCheckin(
  atendimentoId: string,
  interpreteId: string,
  entrada: { codigo: string; latitude: number; longitude: number; precisaoM: number },
  ip?: string,
) {
  const a = await carregarAtendimento(atendimentoId);
  if (!a) throw Erros.naoEncontrado('Atendimento');
  if (a.interpreteId !== interpreteId) throw Erros.proibido('Apenas o intérprete alocado realiza o check-in.');
  if (a.status === 'EM_ANDAMENTO') throw Erros.conflito('Check-in já realizado para este atendimento.', 'CHECKIN_DUPLICADO');
  if (a.status !== 'AGENDADO') throw Erros.regraNegocio('Este atendimento não está agendado.', 'ESTADO_INVALIDO');

  // aceita tanto o código puro quanto o conteúdo completo do QR (VIAMOS:<atendimentoId>:<codigo>)
  const codigoInformado = entrada.codigo.trim().split(':').pop() ?? '';
  if (!a.checkin || codigoInformado !== a.checkin.qrHash) {
    throw Erros.regraNegocio('QR Code inválido para este atendimento. Peça ao cliente para exibir o código correto.', 'QR_INVALIDO');
  }

  const janela = adicionarMinutos(a.solicitacao.inicioPrevisto, -REGRAS.CHECKIN_ANTECEDENCIA_MIN);
  if (Date.now() < janela.getTime()) {
    throw Erros.regraNegocio(`O check-in abre ${REGRAS.CHECKIN_ANTECEDENCIA_MIN} minutos antes do horário previsto.`, 'FORA_DA_JANELA');
  }
  if (entrada.precisaoM > REGRAS.CHECKIN_PRECISAO_MAXIMA_M) {
    throw Erros.regraNegocio(
      `A precisão do GPS (${Math.round(entrada.precisaoM)} m) é insuficiente; o máximo aceito é ${REGRAS.CHECKIN_PRECISAO_MAXIMA_M} m. Aguarde o sinal melhorar e tente novamente.`,
      'PRECISAO_INSUFICIENTE',
    );
  }
  const distancia = distanciaMetros({ latitude: entrada.latitude, longitude: entrada.longitude }, { latitude: a.solicitacao.latitude, longitude: a.solicitacao.longitude });
  if (distancia > REGRAS.CHECKIN_DISTANCIA_MAXIMA_M) {
    throw Erros.regraNegocio(
      `Você está a ${Math.round(distancia)} m do local; o check-in exige até ${REGRAS.CHECKIN_DISTANCIA_MAXIMA_M} m.`,
      'FORA_DO_LOCAL',
    );
  }

  const agora = new Date();
  await db.transaction(async (tx) => {
    const [ok] = await tx
      .update(atendimentos)
      .set({ status: 'EM_ANDAMENTO', inicioReal: agora })
      .where(and(eq(atendimentos.id, atendimentoId), eq(atendimentos.status, 'AGENDADO')))
      .returning({ id: atendimentos.id });
    if (!ok) throw Erros.conflito('Check-in já realizado.', 'CHECKIN_DUPLICADO');
    await tx
      .update(checkins)
      .set({ lidoEm: agora, latitude: entrada.latitude, longitude: entrada.longitude, precisaoM: entrada.precisaoM, distanciaM: Math.round(distancia) })
      .where(eq(checkins.atendimentoId, atendimentoId));
    await tx.update(solicitacoes).set({ status: 'EM_ANDAMENTO', atualizadaEm: agora }).where(eq(solicitacoes.id, a.solicitacaoId));
    await tx.insert(mensagens).values({ atendimentoId, autorId: null, tipo: 'SISTEMA', texto: 'Check-in realizado. Atendimento iniciado.' });
    await notificar(
      { usuarioId: a.solicitacao.clienteId, tipo: 'LEMBRETE', titulo: 'Atendimento iniciado', conteudo: 'O intérprete realizou o check-in no local.', referencia: `/cliente/atendimentos/${atendimentoId}` },
      tx,
    );
    await registrarEvento({ usuarioId: interpreteId, tipo: 'CHECKIN', entidade: 'atendimento', entidadeId: atendimentoId, detalhes: { distanciaM: Math.round(distancia), precisaoM: entrada.precisaoM }, ip }, tx);
  });
  return { atendimentoId, status: 'EM_ANDAMENTO', inicioReal: agora, distanciaM: Math.round(distancia) };
}

/** D-03 — valor final: max(previsto, real arredondado em blocos de 30 min) × preço de referência + deslocamento + taxa. */
export function calcularValorFinal(cotacao: { valorServico: number; valorDeslocamento: number; taxaPlataforma: number; valorTotal: number } | null, duracaoPrevistaMin: number, duracaoRealMin: number) {
  if (!cotacao) return null;
  const bloco = REGRAS.COBRANCA.BLOCO_EXCEDENTE_MIN;
  const realArredondada = Math.ceil(duracaoRealMin / bloco) * bloco;
  const cobrada = Math.max(duracaoPrevistaMin, realArredondada);
  const precoPorMinuto = cotacao.valorServico / duracaoPrevistaMin;
  const valorServico = arredondar2(precoPorMinuto * cobrada);
  const taxa = arredondar2(valorServico * REGRAS.PRECO.TAXA_PLATAFORMA_PERCENTUAL);
  return { duracaoCobradaMin: cobrada, valorServico, valorDeslocamento: cotacao.valorDeslocamento, taxaPlataforma: taxa, valorTotal: arredondar2(valorServico + cotacao.valorDeslocamento + taxa) };
}

export async function encerrarAtendimento(atendimentoId: string, usuarioId: string, papel: string, ip?: string) {
  const a = await exigirParticipante(atendimentoId, usuarioId, papel);
  if (a.status === 'CONCLUIDO') throw Erros.conflito('Este atendimento já foi encerrado.', 'ENCERRAMENTO_DUPLICADO');
  if (a.status !== 'EM_ANDAMENTO' || !a.inicioReal) throw Erros.regraNegocio('Só é possível encerrar um atendimento em andamento (após o check-in).', 'ESTADO_INVALIDO');

  const agora = new Date();
  const duracaoReal = Math.max(1, diferencaMinutos(agora, a.inicioReal));
  const valor = calcularValorFinal(a.solicitacao.cotacao, a.solicitacao.duracaoPrevistaMin, duracaoReal);

  const pagamentoId = await db.transaction(async (tx) => {
    const [ok] = await tx
      .update(atendimentos)
      .set({ status: 'CONCLUIDO', fimReal: agora, duracaoRealMin: duracaoReal, valorFinal: valor?.valorTotal ?? null })
      .where(and(eq(atendimentos.id, atendimentoId), eq(atendimentos.status, 'EM_ANDAMENTO')))
      .returning({ id: atendimentos.id });
    if (!ok) throw Erros.conflito('Este atendimento já foi encerrado.', 'ENCERRAMENTO_DUPLICADO');
    await tx.update(solicitacoes).set({ status: 'CONCLUIDA', atualizadaEm: agora }).where(eq(solicitacoes.id, a.solicitacaoId));
    await tx.update(localizacoesCompartilhadas).set({ encerradaEm: agora }).where(and(eq(localizacoesCompartilhadas.atendimentoId, atendimentoId), sql`${localizacoesCompartilhadas.encerradaEm} is null`));
    const [p] = await tx
      .insert(pagamentos)
      .values({ atendimentoId, valor: valor?.valorTotal ?? 0, status: 'PENDENTE' })
      .returning({ id: pagamentos.id });
    await tx.insert(mensagens).values({ atendimentoId, autorId: null, tipo: 'SISTEMA', texto: `Atendimento encerrado. Duração real: ${duracaoReal} min.` });
    await notificar(
      { usuarioId: a.solicitacao.clienteId, tipo: 'PAGAMENTO', titulo: 'Atendimento concluído', conteudo: `Duração: ${duracaoReal} min. Realize o pagamento para emitir o comprovante.`, referencia: `/cliente/atendimentos/${atendimentoId}/pagamento` },
      tx,
    );
    await notificar(
      { usuarioId: a.interpreteId, tipo: 'SISTEMA', titulo: 'Atendimento concluído', conteudo: 'Você poderá avaliar o cliente e acompanhar o recebimento em Ganhos.', referencia: `/interprete/atendimentos/${atendimentoId}` },
      tx,
    );
    await registrarEvento({ usuarioId, tipo: 'ENCERRAMENTO', entidade: 'atendimento', entidadeId: atendimentoId, detalhes: { duracaoRealMin: duracaoReal, valorFinal: valor?.valorTotal }, ip }, tx);
    return p.id;
  });

  return { atendimentoId, status: 'CONCLUIDO', fimReal: agora, duracaoRealMin: duracaoReal, valorFinal: valor, pagamentoId };
}

/** RF34 — suporte/emergência durante o atendimento: registra data, hora e localização. */
export async function acionarSuporte(atendimentoId: string | null, usuarioId: string, papel: string, entrada: { tipo: 'SUPORTE' | 'EMERGENCIA'; descricao?: string; latitude?: number; longitude?: number }, ip?: string) {
  if (atendimentoId) await exigirParticipante(atendimentoId, usuarioId, papel);
  const [c] = await db
    .insert(chamadosSuporte)
    .values({ atendimentoId, solicitanteId: usuarioId, tipo: entrada.tipo, descricao: entrada.descricao?.trim() || null, latitude: entrada.latitude ?? null, longitude: entrada.longitude ?? null })
    .returning();
  await registrarEvento({ usuarioId, tipo: 'CHAMADO_SUPORTE', entidade: 'chamado', entidadeId: c.id, detalhes: { tipo: entrada.tipo, atendimentoId }, ip });
  // Notifica todos os operadores (backoffice/suporte)
  const operadores = await db.select({ id: usuarios.id }).from(usuarios).where(and(or(eq(usuarios.papel, 'SUPORTE'), eq(usuarios.papel, 'BACKOFFICE')), eq(usuarios.ativo, true)));
  for (const o of operadores) {
    await notificar({ usuarioId: o.id, tipo: 'SISTEMA', titulo: entrada.tipo === 'EMERGENCIA' ? 'EMERGÊNCIA acionada' : 'Chamado de suporte', conteudo: entrada.descricao?.slice(0, 200) || 'Sem descrição.', referencia: '/backoffice/chamados' });
  }
  return { id: c.id, status: c.status, abertoEm: c.abertoEm, mensagem: entrada.tipo === 'EMERGENCIA' ? 'Emergência registrada. Em caso de risco imediato ligue 190/192.' : 'Chamado aberto. Nossa equipe responderá em breve.' };
}
