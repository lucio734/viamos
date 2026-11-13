/**
 * CONTROLLER — atendimento presencial: histórico, detalhe, sala, localização, QR/check-in,
 * encerramento, suporte, comprovante e avaliação (RF28–RF34, RF37–RF40).
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import { dados } from '../middlewares/validar.js';
import * as atendimentoService from '../services/atendimento.service.js';
import * as avaliacaoService from '../services/avaliacao.service.js';
import * as comprovanteService from '../services/comprovante.service.js';

export const esquemaHistorico = z.object({
  de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tipoServico: z.enum(['SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO']).optional(),
  status: z.enum(['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']).optional(),
  apenasAtivos: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const esquemaMensagem = z
  .object({
    tipo: z.enum(['TEXTO', 'IMAGEM', 'LOCALIZACAO']).default('TEXTO'),
    texto: z.string().trim().max(1000).optional(),
    imagemDataUrl: z.string().max(1_500_000).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((m) => m.tipo !== 'TEXTO' || (m.texto && m.texto.length > 0), { message: 'Digite uma mensagem.', path: ['texto'] });

export const esquemaLocalizacao = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precisaoM: z.number().min(0).max(100_000).optional(),
});

export const esquemaCheckin = z.object({
  codigo: z.string().trim().min(6, 'Código do QR inválido.').max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precisaoM: z.number().min(0).max(100_000),
});

export const esquemaSuporte = z
  .object({
    tipo: z.enum(['SUPORTE', 'EMERGENCIA']),
    descricao: z.string().trim().max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((s) => s.tipo !== 'SUPORTE' || (s.descricao && s.descricao.trim().length >= 5), {
    message: 'Descreva brevemente como podemos ajudar (mínimo de 5 caracteres).',
    path: ['descricao'],
  });

export const esquemaAvaliacao = z.object({
  nota: z.number().int().min(1, 'Escolha de 1 a 5 estrelas.').max(5, 'Escolha de 1 a 5 estrelas.'),
  comentario: z.string().trim().max(500).optional(),
});

export const esquemaMensagensQuery = z.object({ apos: z.string().optional() });

type Filtro = z.infer<typeof esquemaHistorico>;

export async function historico(req: Request, res: Response) {
  res.json(await atendimentoService.listarHistorico(req.usuario!.id, req.usuario!.papel, dados<Filtro>(req, 'query')));
}

export async function obter(req: Request, res: Response) {
  res.json(await atendimentoService.obterAtendimento(req.params.id as string, req.usuario!.id, req.usuario!.papel));
}

export async function listarMensagens(req: Request, res: Response) {
  const { apos } = dados<{ apos?: string }>(req, 'query');
  res.json(await atendimentoService.listarMensagens(req.params.id as string, req.usuario!.id, req.usuario!.papel, apos));
}

export async function enviarMensagem(req: Request, res: Response) {
  res.status(201).json(await atendimentoService.enviarMensagem(req.params.id as string, req.usuario!.id, req.usuario!.papel, req.body));
}

export async function compartilharLocalizacao(req: Request, res: Response) {
  res.status(201).json(await atendimentoService.compartilharLocalizacao(req.params.id as string, req.usuario!.id, req.usuario!.papel, req.body));
}

export async function localizacoes(req: Request, res: Response) {
  res.json(await atendimentoService.obterLocalizacoes(req.params.id as string, req.usuario!.id, req.usuario!.papel));
}

export async function qrcode(req: Request, res: Response) {
  res.json(await atendimentoService.obterQrCode(req.params.id as string, req.usuario!.id));
}

export async function checkin(req: Request, res: Response) {
  res.json(await atendimentoService.realizarCheckin(req.params.id as string, req.usuario!.id, req.body, req.ip));
}

export async function encerrar(req: Request, res: Response) {
  res.json(await atendimentoService.encerrarAtendimento(req.params.id as string, req.usuario!.id, req.usuario!.papel, req.ip));
}

export async function suporte(req: Request, res: Response) {
  const atendimentoId = (req.params.id as string | undefined) ?? null;
  res.status(201).json(await atendimentoService.acionarSuporte(atendimentoId, req.usuario!.id, req.usuario!.papel, req.body, req.ip));
}

export async function comprovantePdf(req: Request, res: Response) {
  const { pdf, nomeArquivo } = await comprovanteService.gerarComprovantePdf(req.params.id as string, req.usuario!.id, req.usuario!.papel);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${req.query.download === 'true' ? 'attachment' : 'inline'}; filename="${nomeArquivo}"`);
  res.send(pdf);
}

export async function verificarComprovante(req: Request, res: Response) {
  const resultado = await comprovanteService.verificarComprovante(req.params.codigo as string);
  res.status(resultado.valido ? 200 : 404).json(resultado);
}

export async function avaliar(req: Request, res: Response) {
  res.status(201).json(await avaliacaoService.avaliarAtendimento(req.params.id as string, req.usuario!.id, req.usuario!.papel, req.body, req.ip));
}
