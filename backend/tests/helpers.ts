import request from 'supertest';
import { criarApp } from '../src/app.js';

export const app = criarApp();
export const SENHA = 'Viamos@2026';

export async function login(email: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, senha: SENHA });
  if (res.status !== 200) throw new Error(`Login falhou para ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.token as string;
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export function daquiAMinutos(min: number): string {
  return new Date(Date.now() + min * 60_000).toISOString();
}

// Hospital das Clínicas (mesmo ponto usado no seed) — a 1,6 km da base da Maria (Av. Paulista)
export const LOCAL_HC = { endereco: 'Hospital das Clínicas - Av. Dr. Enéas Carvalho de Aguiar, 255', latitude: -23.5569, longitude: -46.6697 };

/** Cria uma solicitação válida como cliente e devolve o corpo da resposta. */
export async function criarSolicitacao(tokenCliente: string, extra: Record<string, unknown> = {}) {
  const res = await request(app)
    .post('/api/solicitacoes')
    .set(auth(tokenCliente))
    .send({ tipoServico: 'SAUDE', duracaoPrevistaMin: 60, inicioPrevisto: daquiAMinutos(20), ...LOCAL_HC, ...extra });
  return res;
}

/** Leva uma solicitação até o estado EM_ANDAMENTO (aceite + check-in) e devolve ids. */
export async function aceitarEFazerCheckin(tokenCliente: string, tokenInterprete: string, solicitacaoId: string) {
  const aceite = await request(app).post(`/api/demandas/${solicitacaoId}/aceitar`).set(auth(tokenInterprete)).send({});
  if (aceite.status !== 201) throw new Error(`Aceite falhou: ${JSON.stringify(aceite.body)}`);
  const atendimentoId = aceite.body.atendimentoId as string;
  const qr = await request(app).get(`/api/atendimentos/${atendimentoId}/qrcode`).set(auth(tokenCliente));
  const checkin = await request(app)
    .post(`/api/atendimentos/${atendimentoId}/checkin`)
    .set(auth(tokenInterprete))
    .send({ codigo: qr.body.conteudo, latitude: LOCAL_HC.latitude + 0.0002, longitude: LOCAL_HC.longitude, precisaoM: 10 });
  if (checkin.status !== 200) throw new Error(`Check-in falhou: ${JSON.stringify(checkin.body)}`);
  return { atendimentoId, codigoQr: qr.body.codigo as string };
}
