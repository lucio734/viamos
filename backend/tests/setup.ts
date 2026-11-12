/**
 * Preparação do banco de TESTE antes de cada arquivo de teste:
 * aplica migrações, limpa e recarrega o cenário do seed. Nunca toca no banco de desenvolvimento
 * (env.ts troca DATABASE_URL por DATABASE_URL_TEST quando roda sob o Vitest).
 */
import { afterAll, beforeAll } from 'vitest';
import { aplicarMigracoes } from '../src/db/migrate.js';
import { limparBanco, popularBanco } from '../src/db/seed.js';
import { fecharConexao } from '../src/models/db.js';

export type ResumoSeed = Awaited<ReturnType<typeof popularBanco>>;
export let seed: ResumoSeed;

beforeAll(async () => {
  await aplicarMigracoes();
  await limparBanco();
  seed = await popularBanco();
});

afterAll(async () => {
  await fecharConexao();
});
