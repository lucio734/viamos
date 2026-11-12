/**
 * CONTROLLER — lado do intérprete: demandas, aceite/recusa, raio, disponibilidade, hub, certificações.
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as backofficeService from '../services/backoffice.service.js';
import * as demandaService from '../services/demanda.service.js';
import { esquemaArquivoBase64 } from './cadastro.controller.js';

export const esquemaRecusa = z.object({ motivo: z.string().trim().max(300).optional() });

export const esquemaConfiguracao = z
  .object({ raioKm: z.number().int().min(1, 'Raio mínimo: 1 km.').max(15, 'Raio máximo: 15 km.').optional(), disponivelAgora: z.boolean().optional() })
  .refine((d) => d.raioKm !== undefined || d.disponivelAgora !== undefined, 'Informe raioKm e/ou disponivelAgora.');

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM.');
export const esquemaDisponibilidades = z.object({
  faixas: z.array(z.object({ diaSemana: z.number().int().min(0).max(6), inicio: hora, fim: hora })).max(21),
});

export const esquemaReenvioCertificacao = z.object({
  tipo: z.enum(['PROLIBRAS', 'EQUIVALENTE']),
  numero: z.string().trim().min(3).max(60),
  arquivo: esquemaArquivoBase64,
});

export async function listar(req: Request, res: Response) {
  res.json(await demandaService.listarDemandas(req.usuario!.id));
}

export async function aceitar(req: Request, res: Response) {
  res.status(201).json(await demandaService.aceitarDemanda(req.usuario!.id, req.params.id as string, req.ip));
}

export async function recusar(req: Request, res: Response) {
  res.json(await demandaService.recusarDemanda(req.usuario!.id, req.params.id as string, req.body.motivo, req.ip));
}

export async function configuracao(req: Request, res: Response) {
  res.json(await demandaService.atualizarConfiguracao(req.usuario!.id, req.body));
}

export async function listarDisponibilidades(req: Request, res: Response) {
  res.json(await demandaService.listarDisponibilidades(req.usuario!.id));
}

export async function salvarDisponibilidades(req: Request, res: Response) {
  res.json(await demandaService.salvarDisponibilidades(req.usuario!.id, req.body.faixas));
}

export async function hub(req: Request, res: Response) {
  res.json(await demandaService.resumoHubInterprete(req.usuario!.id));
}

export async function minhasCertificacoes(req: Request, res: Response) {
  res.json(await backofficeService.minhasCertificacoes(req.usuario!.id));
}

export async function reenviarCertificacao(req: Request, res: Response) {
  res.status(201).json(await backofficeService.reenviarCertificacao(req.usuario!.id, req.body, req.ip));
}
