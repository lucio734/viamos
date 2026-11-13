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

export interface EstimativaPreco {
  tipoServico: TipoServico;
  duracaoPrevistaMin: number;
  precoHoraReferencia: number;
  valorServico: number;
  valorDeslocamento: number;
  taxaPlataforma: number;
  valorTotal: number;
  versaoRegra: string;
  observacao: string;
}

export interface InterpretePublico {
  id: string;
  nome: string;
  fotoUrl: string | null;
  telefone: string;
  especialidades: TipoServico[];
  reputacao: number | null;
  totalAvaliacoes: number;
  habilitado: boolean;
  certificacao: { tipo: string; numero: string } | null;
}

export interface ClientePublico {
  id: string;
  nome: string;
  fotoUrl: string | null;
  telefone: string;
}

export interface DetalheSolicitacao {
  id: string;
  status: StatusSolicitacao;
  statusRotulo: string;
  tipoServico: TipoServico;
  tipoServicoRotulo: string;
  inicioPrevisto: string;
  duracaoPrevistaMin: number;
  local: {
    endereco: string;
    complemento: string | null;
    pontoReferencia: string | null;
    latitude: number;
    longitude: number;
  };
  observacoes: string | null;
  cotacao: {
    valorServico: number;
    valorDeslocamento: number;
    taxaPlataforma: number;
    valorTotal: number;
    versaoRegra: string;
  } | null;
  cliente: ClientePublico;
  interprete: InterpretePublico | null;
  ofertasEnviadas: number;
  atendimento: {
    id: string;
    status: StatusAtendimento;
    aceitoEm: string;
    inicioReal: string | null;
    fimReal: string | null;
    duracaoRealMin: number | null;
    valorFinal: number | null;
    checkinRealizado: boolean;
    pagamento: {
      id: string;
      status: 'PAGO' | 'PENDENTE' | 'FALHOU';
      valor: number;
      confirmadoEm?: string | null;
    } | null;
    comprovante: { codigoVerificacao: string; emitidoEm: string } | null;
    avaliacaoFeita: boolean;
  } | null;
  cancelamento: { em: string | null; motivo: string | null; taxa: number | null } | null;
  politicaCancelamento: { permitido: boolean; taxa: number; motivo: string };
  criadaEm: string;
  interpretesNotificados?: number;
}

export interface DetalheAtendimento {
  id: string;
  status: StatusAtendimento;
  papelNoAtendimento: 'CLIENTE' | 'INTERPRETE' | 'OPERADOR';
  solicitacaoId: string;
  tipoServico: TipoServico;
  tipoServicoRotulo: string;
  inicioPrevisto: string;
  duracaoPrevistaMin: number;
  local: {
    endereco: string;
    complemento: string | null;
    pontoReferencia: string | null;
    latitude: number;
    longitude: number;
  };
  observacoes: string | null;
  valorEstimado: number | null;
  valorFinal: number | null;
  aceitoEm: string;
  inicioReal: string | null;
  fimReal: string | null;
  duracaoRealMin: number | null;
  cliente: ClientePublico;
  interprete: InterpretePublico;
  checkin: {
    realizado: boolean;
    lidoEm: string | null;
    distanciaM: number | null;
    disponivelApartirDe: string;
    codigo?: string;
  };
  pagamento: {
    id: string;
    status: 'PAGO' | 'PENDENTE' | 'FALHOU';
    valor: number;
    meio?: string | null;
    confirmadoEm?: string | null;
    mensagem?: string | null;
  } | null;
  comprovante: { codigoVerificacao: string; emitidoEm: string } | null;
  avaliacoes: {
    minhaAvaliacaoFeita: boolean;
    recebidas: { nota: number; comentario: string | null; data: string }[];
  };
}

export interface ItemHistoricoAtendimento {
  id: string;
  solicitacaoId: string;
  status: StatusAtendimento;
  tipoServico: TipoServico;
  tipoServicoRotulo: string;
  inicioPrevisto: string;
  duracaoPrevistaMin: number;
  duracaoRealMin: number | null;
  endereco: string;
  valorFinal: number | null;
  pago: boolean;
  comprovanteDisponivel: boolean;
  contraparte: string;
}

export interface MensagemSala {
  id: string;
  tipo: 'TEXTO' | 'IMAGEM' | 'LOCALIZACAO' | 'SISTEMA';
  texto: string | null;
  arquivoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  enviadaEm: string;
  autor: { id: string | null; nome: string; papel: string };
  minha: boolean;
}

export interface LocalizacaoCompartilhada {
  usuarioId: string;
  latitude: number;
  longitude: number;
  precisaoM: number | null;
  registradaEm: string;
}

export interface FormaPagamento {
  id: string;
  tipo: 'PIX' | 'CARTAO';
  chavePix: string | null;
  bandeira: string | null;
  finalCartao: string | null;
  principal: boolean;
  criadaEm?: string;
}

export interface ConsentimentoItem {
  finalidade: 'TERMOS_USO' | 'PRIVACIDADE' | 'LOCALIZACAO' | 'NOTIFICACOES';
  concedido: boolean;
  versaoTermo: string | null;
  concedidoEm: string | null;
}

export interface DemandaInterprete {
  id: string;
  tipoServico: TipoServico;
  tipoServicoRotulo: string;
  inicioPrevisto: string;
  duracaoPrevistaMin: number;
  endereco: string;
  latitude: number;
  longitude: number;
  distanciaKm: number;
  valorEstimado: number | null;
  clienteNome: string;
  criadaEm: string;
  urgente: boolean;
}

export interface ResumoHubInterprete {
  nome: string;
  statusHabilitacao: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' | 'CORRECAO_SOLICITADA';
  disponivelAgora: boolean;
  raioKm: number;
  reputacao: number | null;
  totalAvaliacoes: number;
  demandasPendentes: DemandaInterprete[];
  totalDemandas: number;
  proximosAtendimentos: {
    id: string;
    status: StatusAtendimento;
    tipoServico: TipoServico;
    tipoServicoRotulo: string;
    inicioPrevisto: string;
    duracaoPrevistaMin: number;
    endereco: string;
    clienteNome: string;
    valorEstimado: number | null;
    checkinRealizado: boolean;
  }[];
}

export interface ResumoGanhos {
  semana: {
    inicio: string;
    fim: string;
    recebido: number;
    atendimentos: number;
    horas: number;
  };
  saldoDisponivel: number;
  aReceber: number;
  extrato: {
    id: string;
    tipo: 'CREDITO_ATENDIMENTO' | 'DEBITO_REPASSE' | 'ESTORNO';
    valor: number;
    data: string;
    descricao: string;
    atendimentoId: string | null;
    tipoServico: TipoServico | null;
    repasseStatus: string | null;
  }[];
}

export interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  titular: string;
  chavePix: string | null;
  principal: boolean;
}

export interface RepasseItem {
  id: string;
  valor: number;
  status: string;
  referenciaGateway: string | null;
  solicitadoEm: string;
  concluidoEm: string | null;
}

export interface CertificacaoInterprete {
  id: string;
  tipo: 'PROLIBRAS' | 'EQUIVALENTE';
  numero: string;
  nomeArquivo: string;
  mimeArquivo: string;
  tamanhoBytes: number;
  status: 'EM_ANALISE' | 'APROVADA' | 'RECUSADA' | 'CORRECAO_SOLICITADA';
  motivoParecer: string | null;
  enviadaEm: string;
  analisadaEm: string | null;
}
