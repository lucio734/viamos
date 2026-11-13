/**
 * CONTROLLER — perfil, consentimentos e direitos LGPD (RF43, RF45) + notificações (RF42).
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as notificacaoService from '../services/notificacao.service.js';
import * as perfilService from '../services/perfil.service.js';
import { telefoneValido } from '../utils/documentos.js';

export const esquemaAtualizarPerfil = z.object({
  nome: z.string().trim().min(3).max(120).optional(),
  telefone: z.string().refine(telefoneValido, 'Telefone inválido.').optional(),
  fotoUrl: z
    .string()
    .max(500_000, 'A foto deve ter no máximo 350 KB.')
    .refine((v) => !v || /^data:image\/(jpeg|png|webp);base64,|^https?:\/\//i.test(v), 'Envie uma foto em JPG, PNG ou WebP.')
    .nullable()
    .optional(),
  cliente: z
    .object({ cep: z.string().max(9).optional(), endereco: z.string().max(200).optional(), preferenciasAcessibilidade: z.string().max(300).optional() })
    .optional(),
  interprete: z
    .object({
      enderecoBase: z.string().min(5).max(200).optional(),
      latitudeBase: z.number().min(-90).max(90).optional(),
      longitudeBase: z.number().min(-180).max(180).optional(),
      especialidades: z.array(z.enum(['SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO'])).min(1).optional(),
      precoHora: z.number().positive().max(2000).optional(),
    })
    .optional(),
});

export const esquemaConsentimento = z.object({
  finalidade: z.enum(['TERMOS_USO', 'PRIVACIDADE', 'LOCALIZACAO', 'NOTIFICACOES']),
  concedido: z.boolean(),
});

export async function obter(req: Request, res: Response) {
  res.json(await perfilService.obterPerfil(req.usuario!.id, req.usuario!.papel));
}

export async function atualizar(req: Request, res: Response) {
  res.json(await perfilService.atualizarPerfil(req.usuario!.id, req.usuario!.papel, req.body, req.ip));
}

export async function listarConsentimentos(req: Request, res: Response) {
  res.json(await perfilService.listarConsentimentos(req.usuario!.id));
}

export async function alterarConsentimento(req: Request, res: Response) {
  res.json(await perfilService.alterarConsentimento(req.usuario!.id, req.body.finalidade, req.body.concedido, req.ip));
}

export async function exportarDados(req: Request, res: Response) {
  const dados = await perfilService.exportarDados(req.usuario!.id, req.usuario!.papel, req.ip);
  res.setHeader('Content-Disposition', 'attachment; filename="meus-dados-viamos.json"');
  res.json(dados);
}

export async function solicitarExclusao(req: Request, res: Response) {
  res.json(await perfilService.solicitarExclusao(req.usuario!.id, req.usuario!.papel, req.ip));
}

export async function listarNotificacoes(req: Request, res: Response) {
  const apenasNaoLidas = req.query.naoLidas === 'true';
  res.json(await notificacaoService.listarNotificacoes(req.usuario!.id, apenasNaoLidas));
}

export async function marcarLida(req: Request, res: Response) {
  res.json(await notificacaoService.marcarComoLida(req.usuario!.id, req.params.id as string));
}

export async function marcarTodasLidas(req: Request, res: Response) {
  res.json({ atualizadas: await notificacaoService.marcarTodasComoLidas(req.usuario!.id) });
}
