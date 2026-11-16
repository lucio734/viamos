/** Utilitários de data/hora (todas as datas persistidas em UTC; exibição fica a cargo do frontend). */

export function adicionarMinutos(data: Date, minutos: number): Date {
  return new Date(data.getTime() + minutos * 60_000);
}

export function diferencaMinutos(fim: Date, inicio: Date): number {
  return Math.round((fim.getTime() - inicio.getTime()) / 60_000);
}

export function diferencaHoras(fim: Date, inicio: Date): number {
  return (fim.getTime() - inicio.getTime()) / 3_600_000;
}

const FUSO_BRASILIA = 'America/Sao_Paulo';
const relogioBrasilia = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO_BRASILIA, year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
});

/** Representa os componentes do calendário de Brasília em UTC para fazer aritmética civil. */
function calendarioBrasilia(instante: Date): Date {
  const partes = Object.fromEntries(relogioBrasilia.formatToParts(instante).map(({ type, value }) => [type, Number(value)]));
  return new Date(Date.UTC(partes.year, partes.month - 1, partes.day, partes.hour, partes.minute, partes.second));
}

function meiaNoiteDeSegundaEmBrasilia(segundaCivil: Date): Date {
  const deslocamentoDoFuso = calendarioBrasilia(segundaCivil).getTime() - segundaCivil.getTime();
  return new Date(segundaCivil.getTime() - deslocamentoDoFuso);
}

/** Semana financeira de segunda a segunda, à meia-noite de Brasília, com fim exclusivo. */
export function semanaCorrente(referencia = new Date()): { inicio: Date; fim: Date } {
  const segunda = calendarioBrasilia(referencia);
  segunda.setUTCHours(0, 0, 0, 0);
  segunda.setUTCDate(segunda.getUTCDate() - (segunda.getUTCDay() + 6) % 7);
  const proximaSegunda = new Date(segunda);
  proximaSegunda.setUTCDate(proximaSegunda.getUTCDate() + 7);
  return { inicio: meiaNoiteDeSegundaEmBrasilia(segunda), fim: meiaNoiteDeSegundaEmBrasilia(proximaSegunda) };
}

export function formatarDataHoraBR(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: FUSO_BRASILIA,
  }).format(data);
}

export function formatarDataBR(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: FUSO_BRASILIA }).format(data);
}

export function formatarMoedaBR(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function arredondar2(valor: number): number {
  return Math.round(valor * 100) / 100;
}
