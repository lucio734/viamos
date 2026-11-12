/**
 * Ponto de entrada: sobe o servidor HTTP e encerra as conexões com o banco ao receber SIGTERM/SIGINT.
 */
import { criarApp } from './app.js';
import { env } from './config/env.js';
import { fecharConexao, pool } from './models/db.js';

async function iniciar() {
  // Verifica a conexão com o banco antes de aceitar requisições
  await pool.query('select 1');
  const app = criarApp();
  const servidor = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`Víamos API ouvindo em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const encerrar = async (sinal: string) => {
    // eslint-disable-next-line no-console
    console.info(`Recebido ${sinal}; encerrando...`);
    servidor.close(async () => {
      await fecharConexao();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => void encerrar('SIGTERM'));
  process.on('SIGINT', () => void encerrar('SIGINT'));
}

iniciar().catch((erro) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar a API:', erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
