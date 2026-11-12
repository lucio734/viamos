/**
 * CONTROLLER — backoffice/suporte: fila de certificações, parecer, chamados e auditoria (RF06, RF34, RF44).
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as auditoriaService from '../services/auditoria.service.js';
import * as backofficeService from '../services/backoffice.service.js';

export const esquemaParecer = z.object({
  resultado: z.enum(['APROVADO', 'REPROVADO', 'CORRECAO']),
  justificativa: z.string().trim().max(500).optional(),
});

export const esquemaChamadoStatus = z.object({ status: z.enum(['EM_ATENDIMENTO', 'ENCERRADO']) });

export async function indicadores(_req: Request, res: Response) {
  res.json(await backofficeService.indicadoresBackoffice());
}

export async function listarCertificacoes(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  res.json(await backofficeService.listarCertificacoes(status));
}

export async function arquivoCertificacao(req: Request, res: Response) {
  const { buffer, mime, nome } = await backofficeService.obterArquivoCertificacao(req.params.id as string, req.usuario!.id, req.usuario!.papel);
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `inline; filename="${nome}"`);
  res.send(buffer);
}

export async function parecer(req: Request, res: Response) {
  res.json(await backofficeService.registrarParecer(req.params.id as string, req.usuario!.id, req.body, req.ip));
}

export async function listarChamados(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status.split(',') : undefined;
  res.json(await backofficeService.listarChamados(status));
}

export async function atualizarChamado(req: Request, res: Response) {
  res.json(await backofficeService.atualizarChamado(req.params.id as string, req.usuario!.id, req.body.status));
}

export async function auditoria(req: Request, res: Response) {
  const q = req.query as Record<string, string | undefined>;
  res.json(
    await auditoriaService.listarEventos({
      usuarioId: q.usuarioId,
      tipo: q.tipo,
      de: q.de ? new Date(q.de) : undefined,
      ate: q.ate ? new Date(`${q.ate}T23:59:59`) : undefined,
      limite: q.limite ? Number(q.limite) : undefined,
    }),
  );
}
