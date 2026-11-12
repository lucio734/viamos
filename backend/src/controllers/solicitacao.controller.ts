/**
 * CONTROLLER — solicitações do cliente (RF10–RF19) e hub do cliente.
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as solicitacaoService from '../services/solicitacao.service.js';
import { dados } from '../middlewares/validar.js';

export const esquemaEstimativa = z.object({
  tipoServico: z.enum(['SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO'], { message: 'Selecione o tipo de atendimento.' }),
  duracaoPrevistaMin: z.number().int('Duração inválida.').min(60, 'A duração mínima é de 60 minutos.').max(720),
});

export const esquemaSolicitacao = esquemaEstimativa.extend({
  inicioPrevisto: z.string().min(10, 'Informe data e horário.'),
  endereco: z.string().trim().min(5, 'Informe o endereço do atendimento.').max(300),
  complemento: z.string().trim().max(120).optional(),
  pontoReferencia: z.string().trim().max(200).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  observacoes: z.string().trim().max(300, 'Observações: máximo de 300 caracteres.').optional(),
});

export const esquemaCancelar = z.object({ motivo: z.string().trim().max(300).optional() });

export const esquemaListar = z.object({
  status: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').filter(Boolean) : undefined))
    .pipe(z.array(z.enum(['BUSCANDO', 'ACEITA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'])).optional()),
});

export function estimar(req: Request, res: Response) {
  res.json(solicitacaoService.calcularEstimativa(req.body));
}

export async function criar(req: Request, res: Response) {
  const resultado = await solicitacaoService.criarSolicitacao(req.usuario!.id, req.body, req.ip);
  res.status(201).json(resultado);
}

export async function listar(req: Request, res: Response) {
  const { status } = dados<{ status?: ('BUSCANDO' | 'ACEITA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA')[] }>(req, 'query');
  res.json(await solicitacaoService.listarSolicitacoesDoCliente(req.usuario!.id, status));
}

export async function obter(req: Request, res: Response) {
  res.json(await solicitacaoService.obterSolicitacao(req.params.id as string, req.usuario!.id, req.usuario!.papel));
}

export async function cancelar(req: Request, res: Response) {
  res.json(await solicitacaoService.cancelarSolicitacao(req.params.id as string, req.usuario!.id, req.body.motivo, req.ip));
}

export async function hub(req: Request, res: Response) {
  res.json({ nome: req.usuario!.nome, ...(await solicitacaoService.resumoHubCliente(req.usuario!.id)) });
}
