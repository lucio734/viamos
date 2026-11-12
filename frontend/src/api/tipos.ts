/** Tipos compartilhados das respostas da API (espelham os presenters do backend). */
export type Papel = 'CLIENTE' | 'INTERPRETE' | 'BACKOFFICE' | 'SUPORTE';
export type TipoServico = 'SAUDE' | 'JURIDICO' | 'EDUCACAO' | 'EVENTO' | 'OUTRO';
export type StatusSolicitacao = 'BUSCANDO' | 'ACEITA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
export type StatusAtendimento = 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  papel: Papel;
  fotoUrl: string | null;
  cliente?: { cpf: string; dataNascimento: string; cep: string | null; endereco: string | null; preferenciasAcessibilidade: string | null };
  interprete?: {
    documento: string;
    enderecoBase: string;
    latitudeBase: number;
    longitudeBase: number;
    especialidades: TipoServico[];
    precoHora: number;
    raioKm: number;
    disponivelAgora: boolean;
    statusHabilitacao: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' | 'CORRECAO_SOLICITADA';
    reputacao: number | null;
    totalAvaliacoes: number;
  };
}

export interface Sessao {
  token: string;
  usuario: Usuario;
  destino: string;
}

export interface ResumoSolicitacao {
  id: string;
  tipoServico: TipoServico;
  tipoServicoRotulo: string;
  inicioPrevisto: string;
  duracaoPrevistaMin: number;
  endereco: string;
  status: StatusSolicitacao;
  statusRotulo: string;
  valorEstimado: number | null;
  criadaEm: string;
  atendimentoId: string | null;
  interpreteNome: string | null;
}

export interface HubCliente {
  nome: string;
  concluidos: number;
  ativos: number;
  ativas: ResumoSolicitacao[];
  recentes: ResumoSolicitacao[];
}

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  conteudo: string;
  referenciaRecurso: string | null;
  lida: boolean;
  criadaEm: string;
}

export const ROTULO_TIPO_SERVICO: Record<TipoServico, string> = {
  SAUDE: 'Saúde',
  JURIDICO: 'Jurídico',
  EDUCACAO: 'Educação',
  EVENTO: 'Evento',
  OUTRO: 'Outro',
};

export const ICONE_TIPO_SERVICO: Record<TipoServico, string> = {
  SAUDE: 'medical_services',
  JURIDICO: 'gavel',
  EDUCACAO: 'school',
  EVENTO: 'groups',
  OUTRO: 'interpreter_mode',
};
