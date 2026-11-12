/**
 * Carrega e valida as variáveis de ambiente (item #37: segredos fora do código).
 * Se algo essencial faltar, a aplicação não sobe e explica o motivo.
 */
import 'dotenv/config';
import { z } from 'zod';

const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  DATABASE_URL_TEST: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  API_PUBLIC_URL: z.string().default('http://localhost:3333'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  GATEWAY_PAGAMENTO: z.enum(['simulado']).default('simulado'),
  EMAIL_PROVIDER: z.enum(['console']).default('console'),
});

const bruto = { ...process.env };
// Nos testes, usa-se obrigatoriamente o banco de teste para nunca tocar em dados reais.
if (bruto.NODE_ENV === 'test' || process.env.VITEST) {
  bruto.NODE_ENV = 'test';
  bruto.DATABASE_URL = bruto.DATABASE_URL_TEST ?? bruto.DATABASE_URL;
  bruto.JWT_SECRET = bruto.JWT_SECRET ?? 'segredo-apenas-para-testes-automatizados';
}

const resultado = esquemaEnv.safeParse(bruto);
if (!resultado.success) {
  const problemas = resultado.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`Configuração de ambiente inválida. Copie backend/.env.example para backend/.env e ajuste:\n${problemas}`);
  process.exit(1);
}

export const env = {
  ...resultado.data,
  corsOrigins: resultado.data.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  emProducao: resultado.data.NODE_ENV === 'production',
  emTeste: resultado.data.NODE_ENV === 'test',
};
