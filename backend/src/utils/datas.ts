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

/** Início (segunda-feira 00:00 UTC) e fim da semana corrente. */
export function semanaCorrente(referencia = new Date()): { inicio: Date; fim: Date } {
  const d = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), referencia.getUTCDate()));
  const diaSemana = d.getUTCDay(); // 0 = domingo
  const deslocamento = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicio = new Date(d.getTime() - deslocamento * 86_400_000);
  const fim = new Date(inicio.getTime() + 7 * 86_400_000);
  return { inicio, fim };
}

export function formatarDataHoraBR(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(data);
}

export function formatarDataBR(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'America/Sao_Paulo' }).format(data);
}

export function formatarMoedaBR(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function arredondar2(valor: number): number {
  return Math.round(valor * 100) / 100;
}
