/**
 * Item #48 — fluxo principal ponta a ponta:
 * cadastro → login → solicitação com estimativa → distribuição → aceite exclusivo → sala → QR/check-in
 * → encerramento → pagamento → comprovante → avaliação → ganhos/repasse → histórico.
 */
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app, auth, criarSolicitacao, login } from './helpers.js';

let joao = '';
let maria = '';
let carlos = '';
let operador = '';

beforeAll(async () => {
  [joao, maria, carlos, operador] = await Promise.all([login('joao@viamos.app'), login('maria@viamos.app'), login('carlos@viamos.app'), login('operador@viamos.app')]);
});

describe('Cadastro e acesso (RF01–RF03, RF08, RF09)', () => {
  it('cadastra um cliente surdo e já devolve a sessão direcionada ao hub do cliente', async () => {
    const res = await request(app).post('/api/cadastro/cliente').send({
      nome: 'Bruna Teste',
      cpf: '529.982.247-25',
      dataNascimento: '1995-02-10',
      email: 'bruna@teste.app',
      telefone: '(11) 98888-7777',
      senha: 'SenhaForte123',
      aceiteTermos: true,
      aceitePrivacidade: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.destino).toBe('/cliente');
    expect(res.body.usuario.papel).toBe('CLIENTE');
    expect(res.body.usuario.cliente.cpf).toMatch(/\*\*\*/); // CPF mascarado na resposta
  });

  it('cadastra um intérprete com certificado e o deixa EM_ANALISE (RF04–RF06, RNF36)', async () => {
    const res = await request(app).post('/api/cadastro/interprete').send({
      nome: 'Rafael Intérprete',
      documento: '390.533.447-05',
      email: 'rafael@teste.app',
      telefone: '11977776666',
      senha: 'SenhaForte123',
      enderecoBase: 'Av. Paulista, 1000',
      latitudeBase: -23.5614,
      longitudeBase: -46.6559,
      especialidades: ['SAUDE'],
      precoHora: 90,
      certificacao: { tipo: 'PROLIBRAS', numero: 'PRO-TESTE-1', arquivo: { nome: 'cert.pdf', mime: 'application/pdf', conteudoBase64: Buffer.from('%PDF-1.4 teste').toString('base64') } },
      aceiteTermos: true,
      aceitePrivacidade: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.destino).toBe('/interprete');
    expect(res.body.usuario.interprete.statusHabilitacao).toBe('EM_ANALISE');
  });

  it('o splash verifica a sessão em /auth/me e o logout a revoga', async () => {
    const token = await login('ana@viamos.app');
    const me = await request(app).get('/api/auth/me').set(auth(token));
    expect(me.status).toBe(200);
    expect(me.body.usuario.email).toBe('ana@viamos.app');
    const out = await request(app).post('/api/auth/logout').set(auth(token));
    expect(out.status).toBe(204);
    const depois = await request(app).get('/api/auth/me').set(auth(token));
    expect(depois.status).toBe(401);
  });
});

describe('Jornada completa de um atendimento presencial', () => {
  let solicitacaoId = '';
  let atendimentoId = '';
  let pagamentoId = '';
  let codigoComprovante = '';

  it('RF15 — calcula a estimativa antes da confirmação', async () => {
    const res = await request(app).post('/api/solicitacoes/estimativa').set(auth(joao)).send({ tipoServico: 'SAUDE', duracaoPrevistaMin: 90 });
    expect(res.status).toBe(200);
    expect(res.body.valorServico).toBe(142.5);
    expect(res.body.valorTotal).toBe(171.75);
  });

  it('RF10–RF17 — confirma a solicitação, registra a cotação e distribui para intérpretes em até 15 km', async () => {
    const res = await criarSolicitacao(joao, { duracaoPrevistaMin: 90, observacoes: 'Consulta' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('BUSCANDO');
    expect(res.body.cotacao.valorTotal).toBe(171.75);
    expect(res.body.interpretesNotificados).toBeGreaterThanOrEqual(2); // Maria (1,6 km) e Carlos (2,7 km)
    solicitacaoId = res.body.id;
  });

  it('RF20 — o intérprete aprovado vê a demanda ordenada por distância, dentro do raio', async () => {
    const res = await request(app).get('/api/demandas').set(auth(maria));
    expect(res.status).toBe(200);
    expect(res.body.habilitado).toBe(true);
    const minha = res.body.demandas.find((d: { id: string }) => d.id === solicitacaoId);
    expect(minha).toBeDefined();
    expect(minha.distanciaKm).toBeLessThanOrEqual(15);
  });

  it('RF22 — aceite exclusivo: o segundo intérprete recebe 409 e o cliente é notificado', async () => {
    const [a, b] = await Promise.all([
      request(app).post(`/api/demandas/${solicitacaoId}/aceitar`).set(auth(maria)).send({}),
      request(app).post(`/api/demandas/${solicitacaoId}/aceitar`).set(auth(carlos)).send({}),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);
    const vencedor = a.status === 201 ? a : b;
    atendimentoId = vencedor.body.atendimentoId;

    const sol = await request(app).get(`/api/solicitacoes/${solicitacaoId}`).set(auth(joao));
    expect(sol.body.status).toBe('ACEITA');
    expect(sol.body.interprete.habilitado).toBe(true);
    const notif = await request(app).get('/api/notificacoes?naoLidas=true').set(auth(joao));
    expect(notif.body.some((n: { tipo: string }) => n.tipo === 'ACEITE')).toBe(true);
  });

  it('RF28/RF30 — participantes trocam mensagens e foto; terceiro não acessa a sala', async () => {
    const tokenInterprete = (await request(app).get(`/api/atendimentos/${atendimentoId}`).set(auth(maria))).status === 200 ? maria : carlos;
    const m1 = await request(app).post(`/api/atendimentos/${atendimentoId}/mensagens`).set(auth(tokenInterprete)).send({ tipo: 'TEXTO', texto: 'Estou chegando.' });
    expect(m1.status).toBe(201);
    const foto = await request(app)
      .post(`/api/atendimentos/${atendimentoId}/mensagens`)
      .set(auth(joao))
      .send({ tipo: 'IMAGEM', imagemDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' });
    expect(foto.status).toBe(201);
    const lista = await request(app).get(`/api/atendimentos/${atendimentoId}/mensagens`).set(auth(joao));
    expect(lista.body.length).toBeGreaterThanOrEqual(2);
    const terceiro = tokenInterprete === maria ? carlos : maria;
    const neg = await request(app).get(`/api/atendimentos/${atendimentoId}/mensagens`).set(auth(terceiro));
    expect(neg.status).toBe(403);
  });

  it('RF31/RF32 — cliente exibe o QR; intérprete faz check-in a menos de 200 m', async () => {
    const qr = await request(app).get(`/api/atendimentos/${atendimentoId}/qrcode`).set(auth(joao));
    expect(qr.status).toBe(200);
    expect(qr.body.conteudo).toMatch(/^VIAMOS:/);
    const det = await request(app).get(`/api/atendimentos/${atendimentoId}`).set(auth(maria));
    const tokenInterprete = det.status === 200 && det.body.papelNoAtendimento === 'INTERPRETE' ? maria : carlos;
    const ok = await request(app)
      .post(`/api/atendimentos/${atendimentoId}/checkin`)
      .set(auth(tokenInterprete))
      .send({ codigo: qr.body.conteudo, latitude: -23.557, longitude: -46.6697, precisaoM: 10 });
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('EM_ANDAMENTO');
    expect(ok.body.distanciaM).toBeLessThanOrEqual(200);
  });

  it('RF33 — encerramento registra duração real, gera pagamento pendente e libera avaliação', async () => {
    const res = await request(app).post(`/api/atendimentos/${atendimentoId}/encerrar`).set(auth(joao)).send({});
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CONCLUIDO');
    expect(res.body.duracaoRealMin).toBeGreaterThanOrEqual(1);
    expect(res.body.valorFinal.valorTotal).toBe(171.75); // duração real menor que a contratada → cobra o mínimo contratado
    pagamentoId = res.body.pagamentoId;
  });

  it('RF36/RF37 — pagamento aprovado emite o comprovante; repetição é idempotente (não cobra duas vezes)', async () => {
    const formas = await request(app).get('/api/formas-pagamento').set(auth(joao));
    const pix = formas.body.find((f: { tipo: string }) => f.tipo === 'PIX');
    const pago = await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(joao)).send({ formaPagamentoId: pix.id });
    expect(pago.status).toBe(200);
    expect(pago.body.status).toBe('PAGO');
    expect(pago.body.comprovanteCodigo).toBeTypeOf('string');
    codigoComprovante = pago.body.comprovanteCodigo;

    const repetido = await request(app).post(`/api/pagamentos/${pagamentoId}/processar`).set(auth(joao)).send({ formaPagamentoId: pix.id });
    expect(repetido.status).toBe(200);
    expect(repetido.body.repetido).toBe(true);
  });

  it('RF38/RNF41 — PDF do comprovante para participantes e verificação pública por código', async () => {
    const pdf = await request(app).get(`/api/atendimentos/${atendimentoId}/comprovante.pdf`).set(auth(joao)).buffer(true).parse((res, cb) => {
      const partes: Buffer[] = [];
      res.on('data', (c: Buffer) => partes.push(c));
      res.on('end', () => cb(null, Buffer.concat(partes)));
    });
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
    expect((pdf.body as Buffer).subarray(0, 4).toString()).toBe('%PDF');

    const ver = await request(app).get(`/api/comprovantes/${codigoComprovante}/verificar`);
    expect(ver.status).toBe(200);
    expect(ver.body.valido).toBe(true);
    const inexistente = await request(app).get('/api/comprovantes/00000000-0000-0000-0000-000000000000/verificar');
    expect(inexistente.status).toBe(404);
  });

  it('RF40/RF41 — avaliação bilateral única por autor e atualização da reputação', async () => {
    const det = await request(app).get(`/api/atendimentos/${atendimentoId}`).set(auth(joao));
    const interpreteId = det.body.interprete.id;
    const tokenInterprete = (await request(app).get('/api/auth/me').set(auth(maria))).body.usuario.id === interpreteId ? maria : carlos;

    const a1 = await request(app).post(`/api/atendimentos/${atendimentoId}/avaliacoes`).set(auth(joao)).send({ nota: 4, comentario: 'Muito bom.' });
    const a2 = await request(app).post(`/api/atendimentos/${atendimentoId}/avaliacoes`).set(auth(tokenInterprete)).send({ nota: 5 });
    expect(a1.status).toBe(201);
    expect(a2.status).toBe(201);
    const dup = await request(app).post(`/api/atendimentos/${atendimentoId}/avaliacoes`).set(auth(joao)).send({ nota: 1 });
    expect(dup.status).toBe(409);

    const perfil = await request(app).get('/api/perfil').set(auth(tokenInterprete));
    expect(perfil.body.interprete.totalAvaliacoes).toBeGreaterThanOrEqual(1);
    expect(perfil.body.interprete.reputacao).toBeGreaterThan(0);
  });

  it('RF26/RF27 — ganhos refletem o crédito e o repasse zera o saldo', async () => {
    const det = await request(app).get(`/api/atendimentos/${atendimentoId}`).set(auth(joao));
    const tokenInterprete = (await request(app).get('/api/auth/me').set(auth(maria))).body.usuario.id === det.body.interprete.id ? maria : carlos;
    const ganhos = await request(app).get('/api/interprete/ganhos').set(auth(tokenInterprete));
    expect(ganhos.status).toBe(200);
    expect(ganhos.body.saldoDisponivel).toBeGreaterThan(0);
    if (tokenInterprete === carlos) {
      await request(app).post('/api/interprete/contas-bancarias').set(auth(carlos)).send({ banco: 'Nubank', agencia: '0001', conta: '123-4', titular: 'Carlos Lima' });
    }
    const repasse = await request(app).post('/api/interprete/repasses').set(auth(tokenInterprete)).send({});
    expect(repasse.status).toBe(201);
    expect(repasse.body.status).toBe('PAGO');
    const depois = await request(app).get('/api/interprete/ganhos').set(auth(tokenInterprete));
    expect(depois.body.saldoDisponivel).toBe(0);
  });

  it('RF39 — histórico com filtros mostra o atendimento concluído e pago', async () => {
    const res = await request(app).get('/api/atendimentos?tipoServico=SAUDE&status=CONCLUIDO').set(auth(joao));
    expect(res.status).toBe(200);
    const item = res.body.find((h: { id: string }) => h.id === atendimentoId);
    expect(item).toBeDefined();
    expect(item.pago).toBe(true);
    expect(item.comprovanteDisponivel).toBe(true);
  });

  it('RF44 — a trilha de auditoria registrou aceite, check-in, encerramento e pagamento', async () => {
    const res = await request(app).get('/api/backoffice/auditoria?limite=200').set(auth(operador));
    expect(res.status).toBe(200);
    const tipos = new Set(res.body.map((e: { tipo: string }) => e.tipo));
    for (const t of ['SOLICITACAO_CRIADA', 'ACEITE', 'CHECKIN', 'ENCERRAMENTO', 'PAGAMENTO', 'AVALIACAO']) expect(tipos.has(t)).toBe(true);
  });
});

describe('Backoffice (RF06) e cancelamento (RF19)', () => {
  it('aprova a documentação pendente e o intérprete passa a poder aceitar demandas', async () => {
    const fila = await request(app).get('/api/backoffice/certificacoes?status=EM_ANALISE').set(auth(operador));
    expect(fila.status).toBe(200);
    const pedro = fila.body.find((c: { interprete: { email: string } }) => c.interprete.email === 'pedro@viamos.app');
    expect(pedro).toBeDefined();
    const parecer = await request(app).post(`/api/backoffice/certificacoes/${pedro.id}/parecer`).set(auth(operador)).send({ resultado: 'APROVADO' });
    expect(parecer.status).toBe(200);
    expect(parecer.body.statusHabilitacao).toBe('APROVADO');
    const tokenPedro = await login('pedro@viamos.app');
    const demandas = await request(app).get('/api/demandas').set(auth(tokenPedro));
    expect(demandas.body.habilitado).toBe(true);
  });

  it('cliente cancela solicitação em busca sem taxa; as ofertas expiram', async () => {
    const criada = await criarSolicitacao(joao, { inicioPrevisto: new Date(Date.now() + 3 * 86_400_000).toISOString() });
    const cancel = await request(app).post(`/api/solicitacoes/${criada.body.id}/cancelar`).set(auth(joao)).send({ motivo: 'Remarcado' });
    expect(cancel.status).toBe(200);
    expect(cancel.body.status).toBe('CANCELADA');
    expect(cancel.body.cancelamento.taxa).toBe(0);
    const demandas = await request(app).get('/api/demandas').set(auth(maria));
    expect(demandas.body.demandas.some((d: { id: string }) => d.id === criada.body.id)).toBe(false);
  });
});
