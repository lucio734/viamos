/**
 * Montagem da aplicação Express (sem subir o servidor — reutilizada pelos testes com supertest).
 */
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { naoEncontrado, tratarErros } from './middlewares/erros.js';
import { rotas } from './routes/index.js';

export function criarApp() {
  const app = express();

  app.set('trust proxy', 1); // Render/Vercel ficam atrás de proxy: IP real e HTTPS detectados corretamente
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origem, cb) => {
        // sem Origin (curl, apps nativos, mesma origem) ou origem na lista → permitido
        if (!origem || env.corsOrigins.includes(origem) || env.corsOrigins.includes('*')) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  // Limite de 7 MB: certificado (≤ 5 MB) em base64 e fotos do chat (≤ 1 MB)
  app.use(express.json({ limit: '7mb' }));

  // RNF08 — em produção, força HTTPS (o proxy informa o protocolo original)
  if (env.emProducao) {
    app.use((req, res, next) => {
      if (req.secure) return next();
      res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    });
  }

  app.get('/', (_req, res) => res.json({ nome: 'Víamos API', documentacao: '/api/health', versao: '0.1.0' }));
  app.use('/api', rotas);

  app.use(naoEncontrado);
  app.use(tratarErros);
  return app;
}
