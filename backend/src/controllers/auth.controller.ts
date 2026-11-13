/**
 * CONTROLLER — autenticação (RF01, RF07, RF08). Controllers só traduzem HTTP ⇄ services.
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

export const esquemaLogin = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.').max(128, 'Senha inválida.'),
});

export const esquemaRecuperar = z.object({ email: z.email('Informe um e-mail válido.') });

export const esquemaRedefinir = z.object({
  token: z.string().min(10, 'Token inválido.'),
  novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.').max(72, 'Senha muito longa.'),
});

export const esquemaAlterarSenha = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual.').max(128, 'Senha inválida.'),
  novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.').max(72, 'Senha muito longa.'),
});

export async function login(req: Request, res: Response) {
  const resultado = await authService.login({ ...req.body, dispositivo: req.headers['user-agent'], ip: req.ip });
  res.status(200).json(resultado);
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.usuario!.sessaoId, req.usuario!.id);
  res.status(204).send();
}

export async function sessaoAtual(req: Request, res: Response) {
  res.json(await authService.obterSessaoAtual(req.usuario!.id));
}

export async function recuperarSenha(req: Request, res: Response) {
  const resultado = await authService.solicitarRecuperacaoSenha(req.body.email, req.ip);
  res.status(202).json({ mensagem: 'Se o e-mail estiver cadastrado, enviaremos um link de redefinição válido por 30 minutos.', ...resultado });
}

export async function redefinirSenha(req: Request, res: Response) {
  await authService.redefinirSenha(req.body.token, req.body.novaSenha);
  res.json({ mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
}

export async function alterarSenha(req: Request, res: Response) {
  await authService.alterarSenha(req.usuario!.id, req.body.senhaAtual, req.body.novaSenha, req.usuario!.sessaoId);
  res.json({ mensagem: 'Senha alterada com sucesso.' });
}
