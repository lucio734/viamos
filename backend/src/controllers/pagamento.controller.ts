/**
 * CONTROLLER — formas de pagamento, cobrança, ganhos, contas bancárias e repasses (RF26, RF27, RF35, RF36).
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as pagamentoService from '../services/pagamento.service.js';

export const esquemaFormaPagamento = z
  .object({
    tipo: z.enum(['PIX', 'CARTAO']),
    chavePix: z.string().trim().max(120).optional(),
    cartao: z
      .object({
        numero: z.string().regex(/^[\d\s]{13,23}$/, 'Número do cartão inválido.'),
        validade: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Validade no formato MM/AA.'),
        nomeTitular: z.string().trim().min(3).max(60),
      })
      .optional(),
    principal: z.boolean().optional(),
  })
  .refine((f) => (f.tipo === 'PIX' ? Boolean(f.chavePix) : Boolean(f.cartao)), { message: 'Preencha os dados da forma de pagamento.', path: ['tipo'] });

export const esquemaProcessar = z
  .object({ formaPagamentoId: z.uuid().optional(), meio: z.enum(['PIX', 'CARTAO']).optional() })
  .refine((p) => p.formaPagamentoId || p.meio, { message: 'Escolha uma forma de pagamento.', path: ['meio'] });

export const esquemaContaBancaria = z.object({
  banco: z.string().trim().min(2).max(60),
  agencia: z.string().trim().min(1).max(10),
  conta: z.string().trim().min(1).max(20),
  titular: z.string().trim().min(3).max(120),
  chavePix: z.string().trim().max(120).optional(),
});

export async function listarFormas(req: Request, res: Response) {
  res.json(await pagamentoService.listarFormasPagamento(req.usuario!.id));
}

export async function adicionarForma(req: Request, res: Response) {
  res.status(201).json(await pagamentoService.adicionarFormaPagamento(req.usuario!.id, req.body));
}

export async function removerForma(req: Request, res: Response) {
  await pagamentoService.removerFormaPagamento(req.usuario!.id, req.params.id as string);
  res.status(204).send();
}

export async function pendentes(req: Request, res: Response) {
  res.json(await pagamentoService.listarPagamentosPendentes(req.usuario!.id));
}

export async function obter(req: Request, res: Response) {
  res.json(await pagamentoService.obterPagamento(req.params.id as string, req.usuario!.id, req.usuario!.papel));
}

export async function processar(req: Request, res: Response) {
  const resultado = await pagamentoService.processarPagamento(req.params.id as string, req.usuario!.id, req.body, req.ip);
  // 200 para pago (inclusive repetição idempotente); 402 quando o gateway recusa
  res.status(resultado.status === 'PAGO' ? 200 : 402).json(resultado);
}

export async function ganhos(req: Request, res: Response) {
  res.json(await pagamentoService.resumoGanhos(req.usuario!.id));
}

export async function listarContas(req: Request, res: Response) {
  res.json(await pagamentoService.listarContasBancarias(req.usuario!.id));
}

export async function salvarConta(req: Request, res: Response) {
  res.status(201).json(await pagamentoService.salvarContaBancaria(req.usuario!.id, req.body));
}

export async function solicitarRepasse(req: Request, res: Response) {
  res.status(201).json(await pagamentoService.solicitarRepasse(req.usuario!.id, req.ip));
}

export async function listarRepasses(req: Request, res: Response) {
  res.json(await pagamentoService.listarRepasses(req.usuario!.id));
}
