import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Configuração do drizzle-kit (ferramenta de migrações).
 * - `schema`: o modelo de dados (camada Model da arquitetura MVC) — fonte única do DER.
 * - `out`: pasta onde ficam as migrações SQL versionadas (item #41 do checklist).
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/models/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://viamos:viamos@localhost:5432/viamos',
  },
  verbose: true,
  strict: true,
});
