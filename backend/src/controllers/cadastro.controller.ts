/**
 * CONTROLLER — cadastro (RF02–RF05).
 */
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as cadastroService from '../services/cadastro.service.js';
import { cepValido, cpfValido, documentoValido, telefoneValido } from '../utils/documentos.js';

const senha = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(72, 'Senha muito longa.');
const telefone = z.string().refine(telefoneValido, 'Informe um telefone com DDD (10 ou 11 dígitos).');

export const esquemaCadastroCliente = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo.').max(120),
  cpf: z.string().refine(cpfValido, 'CPF inválido.'),
  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida (use AAAA-MM-DD).')
    .refine((d) => {
      const data = new Date(`${d}T00:00:00Z`);
      const idade = (Date.now() - data.getTime()) / (365.25 * 86_400_000);
      return !Number.isNaN(data.getTime()) && idade >= 16 && idade <= 120;
    }, 'É necessário ter pelo menos 16 anos.'),
  email: z.email('Informe um e-mail válido.'),
  telefone,
  senha,
  cep: z.string().optional().refine((c) => !c || cepValido(c), 'CEP inválido.'),
  endereco: z.string().trim().max(200).optional(),
  preferenciasAcessibilidade: z.string().trim().max(300).optional(),
  aceiteTermos: z.boolean(),
  aceitePrivacidade: z.boolean(),
});

export const esquemaArquivoBase64 = z.object({
  nome: z.string().min(1).max(200),
  mime: z.string().min(3).max(80),
  conteudoBase64: z.string().min(10, 'Arquivo vazio.'),
});

export const esquemaCadastroInterprete = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo.').max(120),
  documento: z.string().refine(documentoValido, 'CPF ou CNPJ inválido.'),
  email: z.email('Informe um e-mail válido.'),
  telefone,
  senha,
  enderecoBase: z.string().trim().min(5, 'Informe o endereço-base de atuação.').max(200),
  latitudeBase: z.number().min(-90).max(90),
  longitudeBase: z.number().min(-180).max(180),
  especialidades: z.array(z.enum(['SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO'])).min(1, 'Selecione ao menos uma especialidade.'),
  precoHora: z.number().positive('Informe o valor/hora.').max(2000),
  raioKm: z.number().int().min(1).max(15).optional(),
  certificacao: z.object({
    tipo: z.enum(['PROLIBRAS', 'EQUIVALENTE']),
    numero: z.string().trim().min(3, 'Informe o número do certificado.').max(60),
    arquivo: esquemaArquivoBase64,
  }),
  aceiteTermos: z.boolean(),
  aceitePrivacidade: z.boolean(),
});

export async function cadastrarCliente(req: Request, res: Response) {
  const resultado = await cadastroService.cadastrarCliente(req.body, req.ip);
  res.status(201).json(resultado);
}

export async function cadastrarInterprete(req: Request, res: Response) {
  const resultado = await cadastroService.cadastrarInterprete(req.body, req.ip);
  res.status(201).json(resultado);
}
