/**
 * Item #48 — caminhos de exceção e regras de negócio críticas (lista do briefing):
 * data passada, duração inválida, certificado pendente, demanda fora do raio, agenda conflitante,
 * dois aceites simultâneos, QR de outro atendimento, localização imprecisa/distante, mensagem de não
 * participante, encerramento repetido, confirmação de pagamento repetida, comprovante alheio, bloqueio de login.
 */
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { aceitarEFazerCheckin, app, auth, criarSolicitacao, daquiAMinutos, login, LOCAL_HC } from './helpers.js';

let joao = '';
let ana = '';
let maria = '';
let carlos = '';
let pedro = '';

beforeAll(async () => {
  [joao, ana, maria, carlos, pedro] = await Promise.all([
    login('joao@viamos.app'),
    login('ana@viamos.app'),
    login('maria@viamos.app'),
    login('carlos@viamos.app'),
    login('pedro@viamos.app'),
  ]);
});

describe('Validações de entrada (item #33 no servidor) e HTTP semântico (item #35)', () => {
  it('400 para JSON inválido e para campos fora do contrato', async () => {
    const json = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(json.status).toBe(400);
    const campos = await request(app).post('/api/cadastro/cliente').send({ nome: 'A', cpf: '123', email: 'x', telefone: '1', senha: '1', dataNascimento: '2020-01-01', aceiteTermos: true, aceitePrivacidade: true });
    expect(campos.status).toBe(400);
    const nomes = campos.body.erro.detalhes.map((d: { campo: string }) => d.campo);
    expect(nomes).toEqual(expect.arrayContaining(['nome', 'cpf', 'email', 'telefone', 'senha', 'dataNascimento']));
  });

  it('404 para rota inexistente, sem stack trace (item #36)', async () => {
    const res = await request(app).get('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.(ts|js):\d+/);
  });

  it('401 sem token e 403 para papel errado', async () => {
    expect((await request(app).get('/api/cliente/hub')).status).toBe(401);
    expect((await request(app).get('/api/cliente/hub').set(auth(maria))).status).toBe(403);
    expect((await request(app).get('/api/demandas').set(auth(joao))).status).toBe(403);
    expect((await request(app).get('/api/backoffice/certificacoes').set(auth(joao))).status).toBe(403);
  });

  it('409 para e-mail duplicado no cadastro', async () => {
    const res = await request(app).post('/api/cadastro/cliente').send({ nome: 'Outro João', cpf: '111.444.777-35', dataNascimento: '1990-01-01', email: 'JOAO@viamos.app', telefone: '11999998888', senha: 'SenhaForte123', aceiteTermos: true, aceitePrivacidade: true });
    expect(res.status).toBe(409);
  });
});

describe('Regras da solicitação (RF12, RF13, RF15)', () => {
  it('rejeita data/hora passada (422 DATA_PASSADA)', async () => {
    const res = await criarSolicitacao(joao, { inicioPrevisto: new Date(Date.now() - 60_000).toISOString() });
    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('DATA_PASSADA');
  });

  it('rejeita duração inferior a 60 min e fora dos blocos de 30 min', async () => {
    expect((await criarSolicitacao(joao, { duracaoPrevistaMin: 30 })).status).toBe(400); // barrado já na validação
    const bloco = await criarSolicitacao(joao, { duracaoPrevistaMin: 75 });
    expect(bloco.status).toBe(422);
    expect(bloco.body.erro.codigo).toBe('DURACAO_BLOCO');
  });

  it('a estimativa precede a confirmação e usa a mesma regra (versão v1)', async () => {
    const est = await request(app).post('/api/solicitacoes/estimativa').set(auth(joao)).send({ tipoServico: 'EVENTO', duracaoPrevistaMin: 120 });
    const sol = await criarSolicitacao(joao, { tipoServico: 'EVENTO', duracaoPrevistaMin: 120, inicioPrevisto: daquiAMinutos(60 * 24 * 2) });
    expect(sol.body.cotacao.valorTotal).toBe(est.body.valorTotal);
    expect(sol.body.cotacao.versaoRegra).toBe('v1');
  });
});

describe('Distribuição e aceite (RF17, RF22, RF23, RNF27, RNF36)', () => {
  it('intérprete com documentação pendente não vê nem aceita demandas', async () => {
    const lista = await request(app).get('/api/demandas').set(auth(pedro));
    expect(lista.body.habilitado).toBe(false);
    expect(lista.body.demandas).toEqual([]);
    const sol = await criarSolicitacao(joao, { inicioPrevisto: daquiAMinutos(90) });
    const aceite = await request(app).post(`/api/demandas/${sol.body.id}/aceitar`).set(auth(pedro)).send({});
    expect(aceite.status).toBe(403);
  });

  it('demanda fora do raio não é distribuída nem pode ser aceita (Guarulhos, ~25 km)', async () => {
    const sol = await criarSolicitacao(ana, { endereco: 'Aeroporto de Guarulhos', latitude: -23.4356, longitude: -46.4731, inicioPrevisto: daquiAMinutos(180) });
    expect(sol.status).toBe(201);
    expect(sol.body.interpretesNotificados).toBe(0);
    const aceite = await request(app).post(`/api/demandas/${sol.body.id}/aceitar`).set(auth(maria)).send({});
    expect(aceite.status).toBe(422);
    expect(aceite.body.erro.codigo).toBe('FORA_DO_RAIO');
  });

  it('o raio configurado nunca ultrapassa 15 km (RF24)', async () => {
    const res = await request(app).put('/api/interprete/configuracao').set(auth(maria)).send({ raioKm: 20 });
    expect(res.status).toBe(400);
  });

  it('recusa não cancela a solicitação para os demais (RF23) e some da lista de quem recusou', async () => {
    const sol = await criarSolicitacao(ana, { inicioPrevisto: daquiAMinutos(240) });
    const recusa = await request(app).post(`/api/demandas/${sol.body.id}/recusar`).set(auth(carlos)).send({ motivo: 'Compromisso' });
    expect(recusa.status).toBe(200);
    const deCarlos = await request(app).get('/api/demandas').set(auth(carlos));
    expect(deCarlos.body.demandas.some((d: { id: string }) => d.id === sol.body.id)).toBe(false);
    const deMaria = await request(app).get('/api/demandas').set(auth(maria));
    expect(deMaria.body.demandas.some((d: { id: string }) => d.id === sol.body.id)).toBe(true);
    const status = await request(app).get(`/api/solicitacoes/${sol.body.id}`).set(auth(ana));
    expect(status.body.status).toBe('BUSCANDO');
  });

  it('aceites concorrentes: exatamente um 201 e os demais 409', async () => {
    const sol = await criarSolicitacao(ana, { inicioPrevisto: daquiAMinutos(300) });
    const respostas = await Promise.all([maria, carlos].map((t) => request(app).post(`/api/demandas/${sol.body.id}/aceitar`).set(auth(t)).send({})));
    expect(respostas.filter((r) => r.status === 201)).toHaveLength(1);
    expect(respostas.filter((r) => r.status === 409)).toHaveLength(1);
  });

  it('agenda conflitante: o mesmo intérprete não aceita duas demandas sobrepostas', async () => {
    const inicio = daquiAMinutos(60 * 24 * 5); // daqui a 5 dias
    const s1 = await criarSolicitacao(joao, { inicioPrevisto: inicio, duracaoPrevistaMin: 120 });
    const s2 = await criarSolicitacao(ana, { inicioPrevisto: new Date(new Date(inicio).getTime() + 30 * 60_000).toISOString(), duracaoPrevistaMin: 60 });
    expect((await request(app).post(`/api/demandas/${s1.body.id}/aceitar`).set(auth(maria)).send({})).status).toBe(201);
    const conflito = await request(app).post(`/api/demandas/${s2.body.id}/aceitar`).set(auth(maria)).send({});
    expect(conflito.status).toBe(409);
    expect(conflito.body.erro.codigo).toBe('AGENDA_CONFLITANTE');
  });
});

describe('Check-in geolocalizado (RF31, RF32, RNF26) e encerramento (RF33)', () => {
  let atendimentoId = '';
  let codigo = '';

  beforeAll(async () => {
    const sol = await criarSolicitacao(joao, { inicioPrevisto: daquiAMinutos(15) });
    const aceite = await request(app).post(`/api/demandas/${sol.body.id}/aceitar`).set(auth(carlos)).send({});
    atendimentoId = aceite.body.atendimentoId;
    codigo = (await request(app).get(`/api/atendimentos/${atendimentoId}/qrcode`).set(auth(joao))).body.codigo;
  });

  it('somente o cliente obtém o QR; somente o intérprete alocado faz check-in', async () => {
    expect((await request(app).get(`/api/atendimentos/${atendimentoId}/qrcode`).set(auth(carlos))).status).toBe(403);
    const outro = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(maria)).send({ codigo, latitude: LOCAL_HC.latitude, longitude: LOCAL_HC.longitude, precisaoM: 5 });
    expect(outro.status).toBe(403);
  });

  it('rejeita QR de outro atendimento, precisão > 50 m e distância > 200 m', async () => {
    const qrErrado = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(carlos)).send({ codigo: 'codigo-de-outro-atendimento', latitude: LOCAL_HC.latitude, longitude: LOCAL_HC.longitude, precisaoM: 5 });
    expect(qrErrado.body.erro.codigo).toBe('QR_INVALIDO');
    const impreciso = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(carlos)).send({ codigo, latitude: LOCAL_HC.latitude, longitude: LOCAL_HC.longitude, precisaoM: 51 });
    expect(impreciso.body.erro.codigo).toBe('PRECISAO_INSUFICIENTE');
    const longe = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(carlos)).send({ codigo, latitude: LOCAL_HC.latitude + 0.003, longitude: LOCAL_HC.longitude, precisaoM: 5 }); // ~330 m
    expect(longe.status).toBe(422);
    expect(longe.body.erro.codigo).toBe('FORA_DO_LOCAL');
  });

  it('não permite encerrar antes do check-in; depois do check-in, encerramento é único', async () => {
    const antes = await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(carlos)).send({});
    expect(antes.status).toBe(422);
    const ok = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(carlos)).send({ codigo, latitude: LOCAL_HC.latitude + 0.001, longitude: LOCAL_HC.longitude, precisaoM: 20 }); // ~110 m
    expect(ok.status).toBe(200);
    const dup = await request(app).post(`/api/atendimentos/${atendimentoId}/checkin`).set(auth(carlos)).send({ codigo, latitude: LOCAL_HC.latitude, longitude: LOCAL_HC.longitude, precisaoM: 5 });
    expect(dup.status).toBe(409);
    expect((await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(carlos)).send({})).status).toBe(200);
    const repetido = await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(carlos)).send({});
    expect(repetido.status).toBe(409);
    expect(repetido.body.erro.codigo).toBe('ENCERRAMENTO_DUPLICADO');
  });

  it('cancelamento não é permitido após o check-in (atendimento concluído/em andamento)', async () => {
    const det = await request(app).get(`/api/atendimentos/${atendimentoId}`).set(auth(joao));
    const cancel = await request(app).post(`/api/solicitacoes/${det.body.solicitacaoId}/cancelar`).set(auth(joao)).send({});
    expect(cancel.status).toBe(422);
  });
});

describe('Pagamento (RF36) e comprovante (RF37/RF38)', () => {
  it('gateway recusa o cartão de teste 0000 (402), Pix aprova e a repetição não duplica a cobrança', async () => {
    const sol = await criarSolicitacao(joao, { inicioPrevisto: daquiAMinutos(10) });
    const { atendimentoId } = await aceitarEFazerCheckin(joao, maria, sol.body.id);
    const enc = await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(maria)).send({});
    const pagamentoId = enc.body.pagamentoId;

    const formas = (await request(app).get('/api/formas-pagamento').set(auth(joao))).body;
    const recusado = await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(joao)).send({ formaPagamentoId: formas.find((f: { finalCartao?: string }) => f.finalCartao === '0000').id });
    expect(recusado.status).toBe(402);
    expect(recusado.body.status).toBe('FALHOU');

    const pix = await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(joao)).send({ meio: 'PIX' });
    expect(pix.status).toBe(200);
    expect(pix.body.status).toBe('PAGO');

    const repetido = await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(joao)).send({ meio: 'PIX' });
    expect(repetido.status).toBe(200);
    expect(repetido.body.repetido).toBe(true);

    // comprovante: participante ok; terceiro proibido; intérprete não paga no lugar do cliente
    expect((await request(app).get(`/api/atendimentos/${atendimentoId}/comprovante.pdf`).set(auth(maria))).status).toBe(200);
    expect((await request(app).get(`/api/atendimentos/${atendimentoId}/comprovante.pdf`).set(auth(carlos))).status).toBe(403);
    expect((await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(maria)).send({ meio: 'PIX' })).status).toBe(403);
  });

  it('o comprovante só existe após o pagamento confirmado', async () => {
    const sol = await criarSolicitacao(ana, { inicioPrevisto: daquiAMinutos(10) });
    const { atendimentoId } = await aceitarEFazerCheckin(ana, carlos, sol.body.id);
    await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(carlos)).send({});
    const pdf = await request(app).get(`/api/atendimentos/${atendimentoId}/comprovante.pdf`).set(auth(ana));
    expect(pdf.status).toBe(422);
    expect(pdf.body.erro.codigo).toBe('COMPROVANTE_INDISPONIVEL');
  });
});

describe('Segurança de acesso (RNF35) e LGPD (RF45)', () => {
  it('bloqueia a conta por 15 minutos após 5 tentativas inválidas', async () => {
    const cadastro = await request(app).post('/api/cadastro/cliente').send({ nome: 'Conta Bloqueio', cpf: '714.287.938-60', dataNascimento: '1992-01-01', email: 'bloqueio@teste.app', telefone: '11911112222', senha: 'SenhaForte123', aceiteTermos: true, aceitePrivacidade: true });
    expect(cadastro.status).toBe(201);
    let ultimo = 0;
    for (let i = 0; i < 5; i++) ultimo = (await request(app).post('/api/auth/login').send({ email: 'bloqueio@teste.app', senha: 'errada' })).status;
    expect(ultimo).toBe(423);
    const correto = await request(app).post('/api/auth/login').send({ email: 'bloqueio@teste.app', senha: 'SenhaForte123' });
    expect(correto.status).toBe(423);
  });

  it('exporta os dados do titular e impede revogar termos obrigatórios sem exclusão', async () => {
    const exp = await request(app).get('/api/perfil/dados/exportar').set(auth(ana));
    expect(exp.status).toBe(200);
    expect(exp.body.perfil.email).toBe('ana@viamos.app');
    const rev = await request(app).put('/api/perfil/consentimentos').set(auth(ana)).send({ finalidade: 'TERMOS_USO', concedido: false });
    expect(rev.status).toBe(422);
  });

  it('a trilha de auditoria é imutável (gatilho impede UPDATE/DELETE)', async () => {
    const { pool } = await import('../src/models/db.js');
    await expect(pool.query('delete from eventos_auditoria where true')).rejects.toThrow(/somente-inserção/);
    await expect(pool.query(`update eventos_auditoria set tipo = 'X' where true`)).rejects.toThrow(/somente-inserção/);
  });
});
