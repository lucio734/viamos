/**
 * Tratamento centralizado de erros (itens #35 e #36).
 * - AppError → status semântico + corpo padronizado { erro: { codigo, mensagem, detalhes? } }
 * - Erros do banco (violação de unicidade / chave estrangeira / check) → 409/422 sem vazar SQL
 * - Qualquer outro erro → 500 genérico; o detalhe vai apenas para o log do servidor
 */
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/erros.js';

interface ErroPg extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

const MENSAGENS_CONSTRAINT: Record<string, string> = {
  usuarios_email_unique: 'Já existe uma conta com este e-mail.',
  clientes_cpf_unique: 'Já existe uma conta com este CPF.',
  interpretes_documento_unique: 'Já existe uma conta com este documento.',
  atendimentos_solicitacao_id_unique: 'Esta solicitação já foi aceita por outro intérprete.',
  avaliacoes_autor_por_atendimento_unique: 'Você já avaliou este atendimento.',
  pagamentos_um_pago_por_atendimento: 'Este atendimento já possui pagamento confirmado.',
  ofertas_solicitacao_interprete_unique: 'Você já respondeu a esta demanda.',
  solicitacoes_duracao_min_check: 'A duração mínima contratada é de 60 minutos.',
  interpretes_raio_km_check: 'O raio de atuação deve estar entre 1 e 15 km.',
  avaliacoes_nota_check: 'A nota deve estar entre 1 e 5.',
};

export function naoEncontrado(req: Request, res: Response): void {
  res.status(404).json({ erro: { codigo: 'ROTA_NAO_ENCONTRADA', mensagem: `Rota ${req.method} ${req.path} não existe.` } });
}

// Express identifica o middleware de erro pela aridade 4 — manter os quatro parâmetros.
export function tratarErros(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ erro: { codigo: err.codigo, mensagem: err.message, detalhes: err.detalhes } });
    return;
  }

  // JSON malformado enviado pelo cliente
  if (err && typeof err === 'object' && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ erro: { codigo: 'JSON_INVALIDO', mensagem: 'Corpo da requisição não é um JSON válido.' } });
    return;
  }
  if (err && typeof err === 'object' && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({ erro: { codigo: 'CORPO_GRANDE', mensagem: 'Arquivo ou conteúdo maior que o limite permitido.' } });
    return;
  }

  const pg = err as ErroPg;
  if (pg?.code === '23505') {
    const mensagem = MENSAGENS_CONSTRAINT[pg.constraint ?? ''] ?? 'Registro duplicado.';
    res.status(409).json({ erro: { codigo: 'DUPLICADO', mensagem } });
    return;
  }
  if (pg?.code === '23503') {
    res.status(422).json({ erro: { codigo: 'REFERENCIA_INVALIDA', mensagem: 'Referência a um registro inexistente.' } });
    return;
  }
  if (pg?.code === '23514') {
    const mensagem = MENSAGENS_CONSTRAINT[pg.constraint ?? ''] ?? 'Valor fora das regras permitidas.';
    res.status(422).json({ erro: { codigo: 'REGRA_BANCO', mensagem } });
    return;
  }

  // Erro inesperado: registra no servidor, responde de forma genérica (sem stack trace)
  // eslint-disable-next-line no-console
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ->`, env.emProducao ? (err as Error)?.message : err);
  res.status(500).json({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado. Tente novamente em instantes.' } });
}
