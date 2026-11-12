/**
 * Erros de aplicação com código HTTP semântico (item #35).
 * O middleware de erros converte estas exceções em respostas padronizadas,
 * sem expor stack trace ao usuário final (item #36).
 */
export class AppError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly detalhes?: unknown;

  constructor(status: number, codigo: string, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export const Erros = {
  validacao: (detalhes?: unknown, mensagem = 'Dados inválidos. Revise os campos informados.') =>
    new AppError(400, 'VALIDACAO', mensagem, detalhes),
  naoAutenticado: (mensagem = 'Sessão inválida ou expirada. Faça login novamente.') =>
    new AppError(401, 'NAO_AUTENTICADO', mensagem),
  proibido: (mensagem = 'Você não tem permissão para realizar esta ação.') => new AppError(403, 'PROIBIDO', mensagem),
  naoEncontrado: (recurso = 'Recurso') => new AppError(404, 'NAO_ENCONTRADO', `${recurso} não encontrado(a).`),
  conflito: (mensagem: string, codigo = 'CONFLITO') => new AppError(409, codigo, mensagem),
  regraNegocio: (mensagem: string, codigo = 'REGRA_NEGOCIO') => new AppError(422, codigo, mensagem),
  bloqueado: (mensagem: string) => new AppError(423, 'BLOQUEADO', mensagem),
  muitasTentativas: (mensagem = 'Muitas tentativas. Aguarde alguns minutos.') =>
    new AppError(429, 'MUITAS_TENTATIVAS', mensagem),
  interno: () => new AppError(500, 'ERRO_INTERNO', 'Ocorreu um erro inesperado. Tente novamente em instantes.'),
};
