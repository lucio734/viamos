/**
 * Autenticação (JWT + sessão revogável) e autorização por papel.
 * RF01/RF08: o token só é válido enquanto a sessão correspondente não for revogada nem expirar.
 */
import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { and, eq, gt } from 'drizzle-orm';
import { env } from '../config/env.js';
import { db } from '../models/db.js';
import { sessoes, usuarios, type PapelUsuario } from '../models/schema.js';
import { Erros } from '../utils/erros.js';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  sessaoId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export interface PayloadToken {
  sub: string;
  papel: PapelUsuario;
  sid: string; // id da sessão
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function assinarToken(payload: PayloadToken): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

function extrairToken(req: Request): string | null {
  const cabecalho = req.headers.authorization;
  if (cabecalho?.startsWith('Bearer ')) return cabecalho.slice(7).trim();
  // Permite baixar o PDF do comprovante por link direto (?token=...)
  if (typeof req.query.token === 'string') return req.query.token;
  return null;
}

/** Exige usuário autenticado; popula `req.usuario`. */
export async function autenticar(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extrairToken(req);
  if (!token) return next(Erros.naoAutenticado());

  let payload: PayloadToken;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as PayloadToken;
  } catch {
    return next(Erros.naoAutenticado());
  }

  const agora = new Date();
  const [sessao] = await db
    .select({ id: sessoes.id, usuarioId: sessoes.usuarioId })
    .from(sessoes)
    .where(and(eq(sessoes.tokenHash, hashToken(token)), eq(sessoes.revogada, false), gt(sessoes.expiraEm, agora)))
    .limit(1);
  if (!sessao || sessao.usuarioId !== payload.sub) return next(Erros.naoAutenticado());

  const [usuario] = await db
    .select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email, papel: usuarios.papel, ativo: usuarios.ativo })
    .from(usuarios)
    .where(eq(usuarios.id, payload.sub))
    .limit(1);
  if (!usuario || !usuario.ativo) return next(Erros.naoAutenticado('Conta inativa ou inexistente.'));

  req.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel, sessaoId: sessao.id };
  next();
}

/** Restringe a rota a determinados papéis (CLIENTE, INTERPRETE, BACKOFFICE, SUPORTE). */
export function exigirPapel(...papeis: PapelUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) return next(Erros.naoAutenticado());
    if (!papeis.includes(req.usuario.papel)) return next(Erros.proibido());
    next();
  };
}
