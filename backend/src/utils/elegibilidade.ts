/**
 * RF17, RF20–RF25, RNF27, RNF36 — regra ÚNICA de elegibilidade do intérprete para uma demanda.
 * Usada na distribuição (solicitacao.service), na lista, no detalhe e no aceite (demanda.service), para que
 * os quatro caminhos nunca discordem (uma demanda listada é sempre visível e aceitável, e vice-versa).
 *
 * Funções puras: quem chama carrega do banco as janelas de disponibilidade e a agenda do intérprete.
 * Datas persistidas em UTC; as janelas de disponibilidade são horários locais de Brasília (D-20).
 */
import { REGRAS } from '../config/regras.js';
import { adicionarMinutos } from './datas.js';
import { distanciaKm } from './geo.js';

const FUSO = 'America/Sao_Paulo';
const DIAS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const formatador = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

/** Dia da semana (0 = domingo) e segundos desde a meia-noite, no horário de Brasília. */
export function horarioLocal(data: Date): { diaSemana: number; segundos: number } {
  const partes = Object.fromEntries(formatador.formatToParts(data).map((p) => [p.type, p.value]));
  return { diaSemana: DIAS[partes.weekday], segundos: Number(partes.hour) * 3600 + Number(partes.minute) * 60 + Number(partes.second) };
}

/** "08:00" ou "08:00:00" → segundos desde a meia-noite. */
function paraSegundos(hora: string): number {
  const [h, m = '0', s = '0'] = hora.split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export interface JanelaDisponibilidade {
  diaSemana: number;
  inicio: string;
  fim: string;
}

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

/**
 * D-20 — disponibilidade semanal (RF25): intérprete sem janelas cadastradas aceita qualquer horário; com janelas,
 * o INÍCIO previsto precisa cair dentro de uma janela daquele dia da semana (início incluso, fim excluso).
 */
export function inicioDentroDaDisponibilidade(inicio: Date, janelas: JanelaDisponibilidade[]): boolean {
  if (!janelas.length) return true;
  const { diaSemana, segundos } = horarioLocal(inicio);
  return janelas.some((j) => j.diaSemana === diaSemana && segundos >= paraSegundos(j.inicio) && segundos < paraSegundos(j.fim));
}

export function intervalosSeSobrepoem(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

export type MotivoInelegivel = 'NAO_HABILITADO' | 'FORA_DO_RAIO' | 'FORA_DA_DISPONIBILIDADE' | 'AGENDA_CONFLITANTE';

export interface ContextoElegibilidade {
  interprete: { statusHabilitacao: string; latitudeBase: number; longitudeBase: number; raioKm: number };
  /** Janelas de disponibilidade semanal do intérprete (RF25). */
  janelas: JanelaDisponibilidade[];
  /** Atendimentos AGENDADO ou EM_ANDAMENTO do intérprete (para o conflito de agenda). */
  agenda: Intervalo[];
}

/**
 * Avalia, nesta ordem, habilitação (RNF36), raio de atuação (RF17/RF24/RNF27), disponibilidade semanal (RF25)
 * e conflito com outro atendimento do mesmo intérprete. O estado da demanda (BUSCANDO, horário futuro) e a
 * recusa individual são conferidos por quem chama.
 */
export function avaliarElegibilidade(
  ctx: ContextoElegibilidade,
  demanda: { latitude: number; longitude: number; inicioPrevisto: Date; duracaoPrevistaMin: number },
): { elegivel: true; distanciaKm: number } | { elegivel: false; motivo: MotivoInelegivel; distanciaKm: number } {
  const i = ctx.interprete;
  const distancia = distanciaKm({ latitude: i.latitudeBase, longitude: i.longitudeBase }, { latitude: demanda.latitude, longitude: demanda.longitude });
  if (i.statusHabilitacao !== 'APROVADO') return { elegivel: false, motivo: 'NAO_HABILITADO', distanciaKm: distancia };
  if (distancia > Math.min(i.raioKm, REGRAS.RAIO_MAXIMO_KM)) return { elegivel: false, motivo: 'FORA_DO_RAIO', distanciaKm: distancia };
  if (!inicioDentroDaDisponibilidade(demanda.inicioPrevisto, ctx.janelas)) return { elegivel: false, motivo: 'FORA_DA_DISPONIBILIDADE', distanciaKm: distancia };
  const intervalo = { inicio: demanda.inicioPrevisto, fim: adicionarMinutos(demanda.inicioPrevisto, demanda.duracaoPrevistaMin) };
  if (ctx.agenda.some((a) => intervalosSeSobrepoem(a, intervalo))) return { elegivel: false, motivo: 'AGENDA_CONFLITANTE', distanciaKm: distancia };
  return { elegivel: true, distanciaKm: distancia };
}
