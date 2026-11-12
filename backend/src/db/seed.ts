/**
 * Carga inicial de dados de demonstração (item #41 / #50 — ensaio com dados consistentes).
 * Uso: `npm run db:seed`  → limpa as tabelas e recria o cenário abaixo (NUNCA roda em produção sem --force).
 *
 * Contas (senha de todas: Viamos@2026):
 *   Cliente surdo .......... joao@viamos.app  | ana@viamos.app
 *   Intérprete aprovada .... maria@viamos.app (online, base Av. Paulista)
 *   Intérprete aprovado .... carlos@viamos.app (online, base Pinheiros)
 *   Intérprete em análise .. pedro@viamos.app (aguardando parecer do backoffice)
 *   Backoffice ............. operador@viamos.app
 *
 * Cenário: 1 solicitação BUSCANDO (ofertas para Maria e Carlos), 1 ACEITA (Maria, com QR de check-in),
 * 1 CONCLUÍDA e PAGA (com comprovante e avaliação), 1 CONCLUÍDA com pagamento PENDENTE e 1 CANCELADA.
 */
import { randomBytes } from 'node:crypto';
import { sql } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';
import { db, fecharConexao } from '../models/db.js';
import * as t from '../models/schema.js';
import { gerarHashSenha } from '../services/auth.service.js';
import { adicionarMinutos } from '../utils/datas.js';

const SENHA_PADRAO = 'Viamos@2026';

// Coordenadas de São Paulo usadas no cenário
const LOCAIS = {
  avPaulista: { lat: -23.5614, lng: -46.6559, endereco: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP' },
  pinheiros: { lat: -23.5672, lng: -46.6936, endereco: 'R. dos Pinheiros, 500 - Pinheiros, São Paulo - SP' },
  hospitalClinicas: { lat: -23.5569, lng: -46.6697, endereco: 'Hospital das Clínicas - Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César, São Paulo - SP' },
  forum: { lat: -23.5503, lng: -46.6339, endereco: 'Fórum João Mendes Júnior - Praça João Mendes, s/n - Centro, São Paulo - SP' },
  usp: { lat: -23.5595, lng: -46.7313, endereco: 'Faculdade de Educação da USP - Av. da Universidade, 308 - Butantã, São Paulo - SP' },
  ibirapuera: { lat: -23.5874, lng: -46.6576, endereco: 'Auditório Ibirapuera - Av. Pedro Álvares Cabral, s/n - Parque Ibirapuera, São Paulo - SP' },
  guarulhos: { lat: -23.4356, lng: -46.4731, endereco: 'Aeroporto de Guarulhos - Rod. Hélio Smidt, s/n - Guarulhos - SP' },
};

function pdfSimples(texto: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4' });
    const partes: Buffer[] = [];
    doc.on('data', (c: Buffer) => partes.push(c));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.fontSize(20).text('CERTIFICADO (documento de demonstração)', { align: 'center' }).moveDown().fontSize(12).text(texto);
    doc.end();
  });
}

export async function limparBanco(): Promise<void> {
  const tabelas = [
    'eventos_auditoria', 'notificacoes', 'solicitacoes_dados', 'consentimentos', 'tokens_recuperacao', 'sessoes',
    'comprovantes', 'avaliacoes', 'lancamentos_financeiros', 'repasses', 'contas_bancarias', 'pagamentos', 'formas_pagamento',
    'chamados_suporte', 'localizacoes_compartilhadas', 'mensagens', 'checkins', 'atendimentos', 'ofertas', 'cotacoes', 'solicitacoes',
    'disponibilidades', 'analises_documentais', 'certificacoes', 'interpretes', 'clientes', 'usuarios',
  ];
  await db.execute(sql.raw(`TRUNCATE TABLE ${tabelas.join(', ')} RESTART IDENTITY CASCADE`));
}

export async function popularBanco() {
  const senhaHash = await gerarHashSenha(SENHA_PADRAO);
  const agora = new Date();
  const emHoras = (h: number) => new Date(agora.getTime() + h * 3_600_000);
  const amanha14h = (() => { const d = new Date(agora); d.setDate(d.getDate() + 1); d.setHours(14, 0, 0, 0); return d; })();

  // --- Usuários ---------------------------------------------------------------
  const [operador, joao, ana, maria, carlos, pedro] = await db
    .insert(t.usuarios)
    .values([
      { nome: 'Operadora Víamos', email: 'operador@viamos.app', senhaHash, telefone: '11999990000', papel: 'BACKOFFICE' },
      { nome: 'João Silva', email: 'joao@viamos.app', senhaHash, telefone: '11988881111', papel: 'CLIENTE' },
      { nome: 'Ana Souza', email: 'ana@viamos.app', senhaHash, telefone: '11988882222', papel: 'CLIENTE' },
      { nome: 'Maria Santos', email: 'maria@viamos.app', senhaHash, telefone: '11977771111', papel: 'INTERPRETE' },
      { nome: 'Carlos Lima', email: 'carlos@viamos.app', senhaHash, telefone: '11977772222', papel: 'INTERPRETE' },
      { nome: 'Pedro Alves', email: 'pedro@viamos.app', senhaHash, telefone: '11977773333', papel: 'INTERPRETE' },
    ])
    .returning();

  await db.insert(t.clientes).values([
    { usuarioId: joao.id, cpf: '39053344705', dataNascimento: '1990-05-12', cep: '01310200', endereco: LOCAIS.avPaulista.endereco, preferenciasAcessibilidade: 'Prefere comunicação por texto; Libras como primeira língua.' },
    { usuarioId: ana.id, cpf: '11144477735', dataNascimento: '1985-11-03', cep: '05422000', endereco: LOCAIS.pinheiros.endereco },
  ]);

  await db.insert(t.interpretes).values([
    { usuarioId: maria.id, documento: '52998224725', enderecoBase: LOCAIS.avPaulista.endereco, latitudeBase: LOCAIS.avPaulista.lat, longitudeBase: LOCAIS.avPaulista.lng, especialidades: ['SAUDE', 'JURIDICO', 'EDUCACAO'], precoHora: 95, raioKm: 15, disponivelAgora: true, statusHabilitacao: 'APROVADO', reputacao: 4.9, totalAvaliacoes: 1 },
    { usuarioId: carlos.id, documento: '15350946056', enderecoBase: LOCAIS.pinheiros.endereco, latitudeBase: LOCAIS.pinheiros.lat, longitudeBase: LOCAIS.pinheiros.lng, especialidades: ['EVENTO', 'EDUCACAO'], precoHora: 100, raioKm: 10, disponivelAgora: true, statusHabilitacao: 'APROVADO' },
    { usuarioId: pedro.id, documento: '71428793860', enderecoBase: LOCAIS.ibirapuera.endereco, latitudeBase: LOCAIS.ibirapuera.lat, longitudeBase: LOCAIS.ibirapuera.lng, especialidades: ['SAUDE'], precoHora: 85, raioKm: 15, disponivelAgora: false, statusHabilitacao: 'EM_ANALISE' },
  ]);

  // --- Certificações e análises ----------------------------------------------
  const pdf = await pdfSimples('Certificado de proficiência em tradução e interpretação de Libras/Língua Portuguesa (Prolibras). Documento fictício para demonstração.');
  const [certMaria, certCarlos] = await db
    .insert(t.certificacoes)
    .values([
      { interpreteId: maria.id, tipo: 'PROLIBRAS', numero: 'PRO-2019-048213', nomeArquivo: 'prolibras-maria.pdf', mimeArquivo: 'application/pdf', arquivo: pdf, tamanhoBytes: pdf.length, status: 'APROVADA', enviadaEm: new Date(agora.getTime() - 40 * 86_400_000) },
      { interpreteId: carlos.id, tipo: 'EQUIVALENTE', numero: 'FENEIS-SP-7781', nomeArquivo: 'certificado-carlos.pdf', mimeArquivo: 'application/pdf', arquivo: pdf, tamanhoBytes: pdf.length, status: 'APROVADA', enviadaEm: new Date(agora.getTime() - 30 * 86_400_000) },
      { interpreteId: pedro.id, tipo: 'PROLIBRAS', numero: 'PRO-2021-115900', nomeArquivo: 'prolibras-pedro.pdf', mimeArquivo: 'application/pdf', arquivo: pdf, tamanhoBytes: pdf.length, status: 'EM_ANALISE', enviadaEm: new Date(agora.getTime() - 2 * 86_400_000) },
    ])
    .returning({ id: t.certificacoes.id });
  await db.insert(t.analisesDocumentais).values([
    { certificacaoId: certMaria.id, operadorId: operador.id, resultado: 'APROVADO', justificativa: 'Certificado Prolibras válido.', data: new Date(agora.getTime() - 39 * 86_400_000) },
    { certificacaoId: certCarlos.id, operadorId: operador.id, resultado: 'APROVADO', justificativa: 'Certificação equivalente reconhecida.', data: new Date(agora.getTime() - 29 * 86_400_000) },
  ]);

  // --- Disponibilidade, consentimentos, formas de pagamento, conta bancária ---
  await db.insert(t.disponibilidades).values([1, 2, 3, 4, 5].map((dia) => ({ interpreteId: maria.id, diaSemana: dia, inicio: '08:00', fim: '18:00' })));
  await db.insert(t.consentimentos).values(
    [operador, joao, ana, maria, carlos, pedro].flatMap((u) => [
      { usuarioId: u.id, finalidade: 'TERMOS_USO' as const, versaoTermo: '2026-11' },
      { usuarioId: u.id, finalidade: 'PRIVACIDADE' as const, versaoTermo: '2026-11' },
    ]),
  );
  const [pixJoao] = await db
    .insert(t.formasPagamento)
    .values([
      { clienteId: joao.id, tipo: 'PIX', chavePix: 'joao@viamos.app', principal: true },
      { clienteId: joao.id, tipo: 'CARTAO', tokenGateway: 'tok_sim_demo_4242', bandeira: 'Visa', finalCartao: '4242' },
      { clienteId: joao.id, tipo: 'CARTAO', tokenGateway: 'tok_sim_demo_0000', bandeira: 'Mastercard', finalCartao: '0000' }, // simula recusa
      { clienteId: ana.id, tipo: 'PIX', chavePix: '11988882222', principal: true },
    ])
    .returning({ id: t.formasPagamento.id });
  await db.insert(t.contasBancarias).values({ interpreteId: maria.id, banco: 'Banco do Brasil', agencia: '1234-5', conta: '98765-0', titular: 'Maria Santos', chavePix: '11977771111', principal: true });

  // --- Solicitação 1: BUSCANDO (João, saúde, amanhã 14h, Hospital das Clínicas) ---
  const [s1] = await db
    .insert(t.solicitacoes)
    .values({ clienteId: joao.id, tipoServico: 'SAUDE', inicioPrevisto: amanha14h, duracaoPrevistaMin: 120, endereco: LOCAIS.hospitalClinicas.endereco, complemento: 'Prédio dos Ambulatórios, 3º andar', pontoReferencia: 'Recepção central', latitude: LOCAIS.hospitalClinicas.lat, longitude: LOCAIS.hospitalClinicas.lng, observacoes: 'Consulta de retorno com cardiologista.', status: 'BUSCANDO' })
    .returning();
  await db.insert(t.cotacoes).values({ solicitacaoId: s1.id, valorServico: 190, valorDeslocamento: 15, taxaPlataforma: 19, valorTotal: 224, versaoRegra: 'v1' });
  await db.insert(t.ofertas).values([
    { solicitacaoId: s1.id, interpreteId: maria.id, distanciaKm: 1.6 },
    { solicitacaoId: s1.id, interpreteId: carlos.id, distanciaKm: 2.7 },
  ]);

  // --- Solicitação 2: ACEITA por Maria (Ana, educação, daqui a 2 h, USP) → atendimento AGENDADO com QR ---
  const [s2] = await db
    .insert(t.solicitacoes)
    .values({ clienteId: ana.id, tipoServico: 'EDUCACAO', inicioPrevisto: emHoras(2), duracaoPrevistaMin: 90, endereco: LOCAIS.usp.endereco, complemento: 'Sala 112', latitude: LOCAIS.usp.lat, longitude: LOCAIS.usp.lng, observacoes: 'Reunião de orientação de TCC.', status: 'ACEITA' })
    .returning();
  await db.insert(t.cotacoes).values({ solicitacaoId: s2.id, valorServico: 120, valorDeslocamento: 15, taxaPlataforma: 12, valorTotal: 147, versaoRegra: 'v1' });
  await db.insert(t.ofertas).values([
    { solicitacaoId: s2.id, interpreteId: maria.id, distanciaKm: 7.7, status: 'ACEITA', respondidaEm: emHoras(-1) },
    { solicitacaoId: s2.id, interpreteId: carlos.id, distanciaKm: 3.9, status: 'EXPIRADA', respondidaEm: emHoras(-1) },
  ]);
  const [a2] = await db.insert(t.atendimentos).values({ solicitacaoId: s2.id, interpreteId: maria.id, aceitoEm: emHoras(-1), status: 'AGENDADO' }).returning();
  await db.insert(t.checkins).values({ atendimentoId: a2.id, qrHash: 'demo' + randomBytes(12).toString('hex') });
  await db.insert(t.mensagens).values([
    { atendimentoId: a2.id, autorId: maria.id, tipo: 'TEXTO', texto: 'Olá, Ana! Confirmo presença na reunião. Chego 15 minutos antes.', enviadaEm: adicionarMinutos(agora, -50) },
    { atendimentoId: a2.id, autorId: ana.id, tipo: 'TEXTO', texto: 'Perfeito, Maria! A sala 112 fica no corredor à direita da entrada.', enviadaEm: adicionarMinutos(agora, -45) },
  ]);

  // --- Solicitação 3: CONCLUÍDA e PAGA (João, jurídico, semana passada, Fórum) ---
  const inicio3 = new Date(agora.getTime() - 7 * 86_400_000);
  const [s3] = await db
    .insert(t.solicitacoes)
    .values({ clienteId: joao.id, tipoServico: 'JURIDICO', inicioPrevisto: inicio3, duracaoPrevistaMin: 60, endereco: LOCAIS.forum.endereco, latitude: LOCAIS.forum.lat, longitude: LOCAIS.forum.lng, status: 'CONCLUIDA', criadaEm: new Date(inicio3.getTime() - 86_400_000) })
    .returning();
  await db.insert(t.cotacoes).values({ solicitacaoId: s3.id, valorServico: 110, valorDeslocamento: 15, taxaPlataforma: 11, valorTotal: 136, versaoRegra: 'v1' });
  await db.insert(t.ofertas).values({ solicitacaoId: s3.id, interpreteId: maria.id, distanciaKm: 2.6, status: 'ACEITA', respondidaEm: new Date(inicio3.getTime() - 80_000_000) });
  const [a3] = await db
    .insert(t.atendimentos)
    .values({ solicitacaoId: s3.id, interpreteId: maria.id, aceitoEm: new Date(inicio3.getTime() - 80_000_000), inicioReal: adicionarMinutos(inicio3, 2), fimReal: adicionarMinutos(inicio3, 75), duracaoRealMin: 73, valorFinal: 170.5, status: 'CONCLUIDO' })
    .returning();
  await db.insert(t.checkins).values({ atendimentoId: a3.id, qrHash: 'demo' + randomBytes(12).toString('hex'), lidoEm: adicionarMinutos(inicio3, 2), latitude: LOCAIS.forum.lat + 0.0005, longitude: LOCAIS.forum.lng, precisaoM: 12, distanciaM: 55 });
  const [p3] = await db
    .insert(t.pagamentos)
    .values({ atendimentoId: a3.id, formaPagamentoId: pixJoao.id, valor: 170.5, meio: 'PIX', status: 'PAGO', referenciaGateway: 'sim_pix_demo0001', mensagemGateway: 'Pix confirmado.', tentativas: 1, criadoEm: adicionarMinutos(inicio3, 75), confirmadoEm: adicionarMinutos(inicio3, 80) })
    .returning();
  await db.insert(t.lancamentosFinanceiros).values({ interpreteId: maria.id, pagamentoId: p3.id, tipo: 'CREDITO_ATENDIMENTO', valor: 156.36, descricao: `Atendimento ${a3.id.slice(0, 8)}`, data: adicionarMinutos(inicio3, 80) });
  await db.insert(t.comprovantes).values({ atendimentoId: a3.id, dataAtendimento: adicionarMinutos(inicio3, 2), urlPdf: `${env.API_PUBLIC_URL}/api/atendimentos/${a3.id}/comprovante.pdf`, emitidoEm: adicionarMinutos(inicio3, 80) });
  await db.insert(t.avaliacoes).values({ atendimentoId: a3.id, autorId: joao.id, avaliadoId: maria.id, nota: 5, comentario: 'Excelente profissional, muito atenciosa na audiência.', data: adicionarMinutos(inicio3, 120) });
  await db.insert(t.mensagens).values({ atendimentoId: a3.id, autorId: null, tipo: 'SISTEMA', texto: 'Atendimento encerrado. Duração real: 73 min.', enviadaEm: adicionarMinutos(inicio3, 75) });

  // --- Solicitação 4: CONCLUÍDA com pagamento PENDENTE (João, evento, 3 dias atrás, Carlos) ---
  const inicio4 = new Date(agora.getTime() - 3 * 86_400_000);
  const [s4] = await db
    .insert(t.solicitacoes)
    .values({ clienteId: joao.id, tipoServico: 'EVENTO', inicioPrevisto: inicio4, duracaoPrevistaMin: 120, endereco: LOCAIS.ibirapuera.endereco, latitude: LOCAIS.ibirapuera.lat, longitude: LOCAIS.ibirapuera.lng, observacoes: 'Palestra de inovação — auditório principal.', status: 'CONCLUIDA', criadaEm: new Date(inicio4.getTime() - 2 * 86_400_000) })
    .returning();
  await db.insert(t.cotacoes).values({ solicitacaoId: s4.id, valorServico: 200, valorDeslocamento: 15, taxaPlataforma: 20, valorTotal: 235, versaoRegra: 'v1' });
  await db.insert(t.ofertas).values({ solicitacaoId: s4.id, interpreteId: carlos.id, distanciaKm: 4.2, status: 'ACEITA', respondidaEm: new Date(inicio4.getTime() - 86_400_000) });
  const [a4] = await db
    .insert(t.atendimentos)
    .values({ solicitacaoId: s4.id, interpreteId: carlos.id, aceitoEm: new Date(inicio4.getTime() - 86_400_000), inicioReal: inicio4, fimReal: adicionarMinutos(inicio4, 118), duracaoRealMin: 118, valorFinal: 235, status: 'CONCLUIDO' })
    .returning();
  await db.insert(t.checkins).values({ atendimentoId: a4.id, qrHash: 'demo' + randomBytes(12).toString('hex'), lidoEm: inicio4, latitude: LOCAIS.ibirapuera.lat, longitude: LOCAIS.ibirapuera.lng, precisaoM: 9, distanciaM: 20 });
  await db.insert(t.pagamentos).values({ atendimentoId: a4.id, valor: 235, status: 'PENDENTE', criadoEm: adicionarMinutos(inicio4, 118) });

  // --- Solicitação 5: CANCELADA (Ana) ---
  const [s5] = await db
    .insert(t.solicitacoes)
    .values({ clienteId: ana.id, tipoServico: 'OUTRO', inicioPrevisto: new Date(agora.getTime() + 5 * 86_400_000), duracaoPrevistaMin: 60, endereco: LOCAIS.guarulhos.endereco, latitude: LOCAIS.guarulhos.lat, longitude: LOCAIS.guarulhos.lng, status: 'CANCELADA', canceladaEm: emHoras(-20), motivoCancelamento: 'Viagem remarcada.', taxaCancelamento: 0 })
    .returning();
  await db.insert(t.cotacoes).values({ solicitacaoId: s5.id, valorServico: 85, valorDeslocamento: 15, taxaPlataforma: 8.5, valorTotal: 108.5, versaoRegra: 'v1' });

  // --- Notificações ----------------------------------------------------------
  await db.insert(t.notificacoes).values([
    { usuarioId: maria.id, tipo: 'SOLICITACAO', titulo: 'Nova demanda próxima de você', conteudo: 'Saúde a 1.6 km • 120 min.', referenciaRecurso: `/interprete/demandas/${s1.id}` },
    { usuarioId: carlos.id, tipo: 'SOLICITACAO', titulo: 'Nova demanda próxima de você', conteudo: 'Saúde a 2.7 km • 120 min.', referenciaRecurso: `/interprete/demandas/${s1.id}` },
    { usuarioId: ana.id, tipo: 'ACEITE', titulo: 'Intérprete confirmado!', conteudo: 'Sua solicitação de Educação foi aceita por Maria Santos.', referenciaRecurso: `/cliente/solicitacoes/${s2.id}` },
    { usuarioId: joao.id, tipo: 'PAGAMENTO', titulo: 'Pagamento pendente', conteudo: 'O atendimento de Evento foi concluído. Realize o pagamento para emitir o comprovante.', referenciaRecurso: `/cliente/atendimentos/${a4.id}/pagamento` },
    { usuarioId: pedro.id, tipo: 'CERTIFICACAO', titulo: 'Documentação em análise', conteudo: 'Recebemos seu certificado. Aguarde a análise do backoffice.', referenciaRecurso: '/interprete/perfil' },
    { usuarioId: operador.id, tipo: 'CERTIFICACAO', titulo: 'Nova certificação para análise', conteudo: 'Pedro Alves enviou um certificado Prolibras.', referenciaRecurso: '/backoffice' },
  ]);

  await db.insert(t.eventosAuditoria).values([
    { usuarioId: maria.id, tipo: 'ACEITE', entidade: 'atendimento', entidadeId: a2.id, detalhes: { solicitacaoId: s2.id, seed: true } },
    { usuarioId: joao.id, tipo: 'PAGAMENTO', entidade: 'pagamento', entidadeId: p3.id, detalhes: { aprovado: true, seed: true } },
  ]);

  return {
    usuarios: { operador: operador.email, joao: joao.email, ana: ana.email, maria: maria.email, carlos: carlos.email, pedro: pedro.email, senha: SENHA_PADRAO },
    solicitacoes: { buscando: s1.id, aceita: s2.id, concluidaPaga: s3.id, concluidaPendente: s4.id, cancelada: s5.id },
    atendimentos: { agendado: a2.id, concluidoPago: a3.id, concluidoPendente: a4.id },
  };
}

const executadoDiretamente = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (executadoDiretamente) {
  (async () => {
    if (env.emProducao && !process.argv.includes('--force')) {
      // eslint-disable-next-line no-console
      console.error('Recusando rodar o seed em produção. Use --force se tiver certeza (apaga todos os dados).');
      process.exit(1);
    }
    await limparBanco();
    const resumo = await popularBanco();
    // eslint-disable-next-line no-console
    console.info('Seed concluído.\n', JSON.stringify(resumo, null, 2));
    await fecharConexao();
  })().catch(async (erro) => {
    // eslint-disable-next-line no-console
    console.error('Falha no seed:', erro);
    await fecharConexao();
    process.exit(1);
  });
}
