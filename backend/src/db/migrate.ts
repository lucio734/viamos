/**
 * Aplica as migrações SQL versionadas em `backend/drizzle/` (item #41).
 * Uso: `npm run db:migrate` (também executado automaticamente no deploy e antes dos testes).
 */
import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, fecharConexao } from '../models/db.js';

export async function aplicarMigracoes(): Promise<void> {
  // A pasta `drizzle/` fica na raiz do backend (funciona tanto via tsx quanto a partir de dist/)
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
}

const executadoDiretamente = process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js');
if (executadoDiretamente) {
  aplicarMigracoes()
    .then(async () => {
      // eslint-disable-next-line no-console
      console.info('Migrações aplicadas com sucesso.');
      await fecharConexao();
    })
    .catch(async (erro) => {
      // eslint-disable-next-line no-console
      console.error('Falha ao aplicar migrações:', erro);
      await fecharConexao();
      process.exit(1);
    });
}
