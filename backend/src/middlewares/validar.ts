/**
 * Validação de entrada com Zod. Em caso de erro responde 400 com a lista de campos inválidos,
 * em linguagem amigável (o frontend exibe junto ao campo).
 */
import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { Erros } from '../utils/erros.js';

type Origem = 'body' | 'query' | 'params';

export function validar<T>(esquema: ZodType<T>, origem: Origem = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = esquema.safeParse(req[origem]);
    if (!resultado.success) {
      const campos = resultado.error.issues.map((i) => ({
        campo: i.path.join('.') || origem,
        mensagem: i.message,
      }));
      return next(Erros.validacao(campos));
    }
    // Express 5 expõe `req.query` como getter somente leitura; guardamos o resultado validado em `req.validado`.
    (req as Request & { validado?: Record<Origem, unknown> }).validado = {
      ...((req as Request & { validado?: Record<Origem, unknown> }).validado ?? ({} as Record<Origem, unknown>)),
      [origem]: resultado.data,
    };
    if (origem === 'body') req.body = resultado.data;
    next();
  };
}

/** Recupera os dados já validados (body/query/params) dentro do controller. */
export function dados<T>(req: Request, origem: Origem = 'body'): T {
  const v = (req as Request & { validado?: Record<Origem, unknown> }).validado;
  return (v?.[origem] ?? req[origem]) as T;
}
