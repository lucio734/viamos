/** Máscaras de entrada (item #33) e formatadores de exibição em pt-BR. */

export const mascaras = {
  cpf: (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  cnpj: (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2'),
  /** CPF ou CNPJ conforme a quantidade de dígitos. */
  documento: (v: string) => (v.replace(/\D/g, '').length <= 11 ? mascaras.cpf(v) : mascaras.cnpj(v)),
  telefone: (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  },
  cep: (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  cartao: (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  validade: (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'),
};

export const formato = {
  moeda: (valor: number | null | undefined) => (valor == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)),
  dataHora: (iso: string | Date | null | undefined) => (iso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) : '—'),
  data: (iso: string | Date | null | undefined) => (iso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(iso)) : '—'),
  hora: (iso: string | Date | null | undefined) => (iso ? new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(iso)) : '—'),
  duracao: (min: number | null | undefined) => {
    if (min == null) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? (m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`) : `${m} min`;
  },
  distancia: (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`),
  /** "Hoje, 14:00" / "Amanhã, 09:30" / "12/11, 10:00" */
  quando: (iso: string | Date) => {
    const d = new Date(iso);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const hora = formato.hora(d);
    if (mesmoDia(d, hoje)) return `Hoje, ${hora}`;
    if (mesmoDia(d, amanha)) return `Amanhã, ${hora}`;
    return `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)}, ${hora}`;
  },
};

/** Converte os campos <input type="date"> e <input type="time"> (horário local) em ISO UTC para a API. */
export function paraIso(data: string, hora: string): string {
  return new Date(`${data}T${hora}:00`).toISOString();
}
