/**
 * ROTAS — mapa completo da API REST do Víamos.
 * Cada rota: middleware de autenticação/papel → validação Zod → controller.
 * Códigos: 200 OK · 201 criado · 202 aceito · 204 sem conteúdo · 400 validação · 401 não autenticado ·
 * 402 pagamento recusado · 403 proibido · 404 não encontrado · 409 conflito · 422 regra de negócio · 423 bloqueado · 429 limite.
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import * as atendimento from '../controllers/atendimento.controller.js';
import * as auth from '../controllers/auth.controller.js';
import * as backoffice from '../controllers/backoffice.controller.js';
import * as cadastro from '../controllers/cadastro.controller.js';
import * as demanda from '../controllers/demanda.controller.js';
import * as pagamento from '../controllers/pagamento.controller.js';
import * as perfil from '../controllers/perfil.controller.js';
import * as solicitacao from '../controllers/solicitacao.controller.js';
import { autenticar, exigirPapel } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';

export const rotas = Router();

// Limite de tentativas em rotas sensíveis (complementa o bloqueio por conta — RNF35)
const limiteAuth = rateLimit({ windowMs: 15 * 60_000, limit: env.emTeste ? 1000 : 30, standardHeaders: true, legacyHeaders: false, message: { erro: { codigo: 'MUITAS_TENTATIVAS', mensagem: 'Muitas tentativas. Aguarde 15 minutos.' } } });

const soCliente = [autenticar, exigirPapel('CLIENTE')] as const;
const soInterprete = [autenticar, exigirPapel('INTERPRETE')] as const;
const soOperador = [autenticar, exigirPapel('BACKOFFICE', 'SUPORTE')] as const;

// ---------------------------------------------------------------------------
// Público
// ---------------------------------------------------------------------------
rotas.get('/health', (_req, res) => res.json({ status: 'ok', servico: 'viamos-api', versao: '0.1.0', ambiente: env.NODE_ENV, agora: new Date() }));
rotas.get('/comprovantes/:codigo/verificar', atendimento.verificarComprovante); // RF38 — verificação pública

// ---------------------------------------------------------------------------
// Autenticação e cadastro
// ---------------------------------------------------------------------------
rotas.post('/auth/login', limiteAuth, validar(auth.esquemaLogin), auth.login); // RF01
rotas.post('/auth/logout', autenticar, auth.logout); // RF08
rotas.get('/auth/me', autenticar, auth.sessaoAtual); // RF09 (verificação de sessão na splash)
rotas.post('/auth/recuperar-senha', limiteAuth, validar(auth.esquemaRecuperar), auth.recuperarSenha); // RF07
rotas.post('/auth/redefinir-senha', limiteAuth, validar(auth.esquemaRedefinir), auth.redefinirSenha); // RF07
rotas.post('/auth/alterar-senha', autenticar, validar(auth.esquemaAlterarSenha), auth.alterarSenha);

rotas.post('/cadastro/cliente', limiteAuth, validar(cadastro.esquemaCadastroCliente), cadastro.cadastrarCliente); // RF02/RF03
rotas.post('/cadastro/interprete', limiteAuth, validar(cadastro.esquemaCadastroInterprete), cadastro.cadastrarInterprete); // RF02/RF04/RF05

// ---------------------------------------------------------------------------
// Perfil, consentimentos, LGPD e notificações (todos os papéis)
// ---------------------------------------------------------------------------
rotas.get('/perfil', autenticar, perfil.obter); // RF43
rotas.put('/perfil', autenticar, validar(perfil.esquemaAtualizarPerfil), perfil.atualizar); // RF43
rotas.get('/perfil/consentimentos', autenticar, perfil.listarConsentimentos); // RF45
rotas.put('/perfil/consentimentos', autenticar, validar(perfil.esquemaConsentimento), perfil.alterarConsentimento); // RF45
rotas.get('/perfil/dados/exportar', autenticar, perfil.exportarDados); // RF45
rotas.post('/perfil/dados/excluir', autenticar, perfil.solicitarExclusao); // RF45
rotas.get('/notificacoes', autenticar, perfil.listarNotificacoes); // RF42
rotas.post('/notificacoes/ler-todas', autenticar, perfil.marcarTodasLidas);
rotas.post('/notificacoes/:id/lida', autenticar, perfil.marcarLida);

// ---------------------------------------------------------------------------
// Cliente: hub, solicitações, formas de pagamento, pagamentos
// ---------------------------------------------------------------------------
rotas.get('/cliente/hub', ...soCliente, solicitacao.hub);
rotas.post('/solicitacoes/estimativa', ...soCliente, validar(solicitacao.esquemaEstimativa), solicitacao.estimar); // RF15
rotas.post('/solicitacoes', ...soCliente, validar(solicitacao.esquemaSolicitacao), solicitacao.criar); // RF10–RF16
rotas.get('/solicitacoes', ...soCliente, validar(solicitacao.esquemaListar, 'query'), solicitacao.listar); // RF18
rotas.get('/solicitacoes/:id', autenticar, solicitacao.obter); // RF18
rotas.post('/solicitacoes/:id/cancelar', ...soCliente, validar(solicitacao.esquemaCancelar), solicitacao.cancelar); // RF19

rotas.get('/formas-pagamento', ...soCliente, pagamento.listarFormas); // RF35
rotas.post('/formas-pagamento', ...soCliente, validar(pagamento.esquemaFormaPagamento), pagamento.adicionarForma); // RF35
rotas.delete('/formas-pagamento/:id', ...soCliente, pagamento.removerForma); // RF35
rotas.get('/pagamentos/pendentes', ...soCliente, pagamento.pendentes);
rotas.get('/pagamentos/:id', autenticar, pagamento.obter);
rotas.post('/pagamentos/:id/processar', ...soCliente, validar(pagamento.esquemaProcessar), pagamento.processar); // RF36

// ---------------------------------------------------------------------------
// Intérprete: hub, demandas, configuração, disponibilidade, certificações, ganhos, repasses
// ---------------------------------------------------------------------------
rotas.get('/interprete/hub', ...soInterprete, demanda.hub);
rotas.get('/demandas', ...soInterprete, demanda.listar); // RF20/RF21
rotas.post('/demandas/:id/aceitar', ...soInterprete, demanda.aceitar); // RF22
rotas.post('/demandas/:id/recusar', ...soInterprete, validar(demanda.esquemaRecusa), demanda.recusar); // RF23
rotas.put('/interprete/configuracao', ...soInterprete, validar(demanda.esquemaConfiguracao), demanda.configuracao); // RF24
rotas.get('/interprete/disponibilidades', ...soInterprete, demanda.listarDisponibilidades); // RF25
rotas.put('/interprete/disponibilidades', ...soInterprete, validar(demanda.esquemaDisponibilidades), demanda.salvarDisponibilidades); // RF25
rotas.get('/interprete/certificacoes', ...soInterprete, demanda.minhasCertificacoes); // RF05
rotas.post('/interprete/certificacoes', ...soInterprete, validar(demanda.esquemaReenvioCertificacao), demanda.reenviarCertificacao); // RF05
rotas.get('/interprete/ganhos', ...soInterprete, pagamento.ganhos); // RF26
rotas.get('/interprete/contas-bancarias', ...soInterprete, pagamento.listarContas);
rotas.post('/interprete/contas-bancarias', ...soInterprete, validar(pagamento.esquemaContaBancaria), pagamento.salvarConta);
rotas.get('/interprete/repasses', ...soInterprete, pagamento.listarRepasses); // RF27
rotas.post('/interprete/repasses', ...soInterprete, pagamento.solicitarRepasse); // RF27

// ---------------------------------------------------------------------------
// Atendimentos (participantes: cliente e intérprete)
// ---------------------------------------------------------------------------
rotas.get('/atendimentos', autenticar, validar(atendimento.esquemaHistorico, 'query'), atendimento.historico); // RF39
rotas.get('/atendimentos/:id', autenticar, atendimento.obter);
rotas.get('/atendimentos/:id/mensagens', autenticar, validar(atendimento.esquemaMensagensQuery, 'query'), atendimento.listarMensagens); // RF28
rotas.post('/atendimentos/:id/mensagens', autenticar, validar(atendimento.esquemaMensagem), atendimento.enviarMensagem); // RF28/RF30
rotas.get('/atendimentos/:id/localizacoes', autenticar, atendimento.localizacoes); // RF29
rotas.post('/atendimentos/:id/localizacoes', autenticar, validar(atendimento.esquemaLocalizacao), atendimento.compartilharLocalizacao); // RF29
rotas.get('/atendimentos/:id/qrcode', ...soCliente, atendimento.qrcode); // RF31 (cliente exibe)
rotas.post('/atendimentos/:id/checkin', ...soInterprete, validar(atendimento.esquemaCheckin), atendimento.checkin); // RF31/RF32 (intérprete lê)
rotas.post('/atendimentos/:id/encerrar', autenticar, atendimento.encerrar); // RF33
rotas.post('/atendimentos/:id/suporte', autenticar, validar(atendimento.esquemaSuporte), atendimento.suporte); // RF34
rotas.post('/suporte', autenticar, validar(atendimento.esquemaSuporte), atendimento.suporte); // RF34 (fora de atendimento)
rotas.get('/atendimentos/:id/comprovante.pdf', autenticar, atendimento.comprovantePdf); // RF37/RF38
rotas.post('/atendimentos/:id/avaliacoes', autenticar, validar(atendimento.esquemaAvaliacao), atendimento.avaliar); // RF40

// ---------------------------------------------------------------------------
// Backoffice / Suporte
// ---------------------------------------------------------------------------
rotas.get('/backoffice/indicadores', ...soOperador, backoffice.indicadores);
rotas.get('/backoffice/certificacoes', ...soOperador, backoffice.listarCertificacoes); // RF06
rotas.get('/backoffice/certificacoes/:id/arquivo', autenticar, backoffice.arquivoCertificacao); // RF06 (operador ou o próprio intérprete)
rotas.post('/backoffice/certificacoes/:id/parecer', ...soOperador, validar(backoffice.esquemaParecer), backoffice.parecer); // RF06
rotas.get('/backoffice/chamados', ...soOperador, backoffice.listarChamados); // RF34
rotas.post('/backoffice/chamados/:id/status', ...soOperador, validar(backoffice.esquemaChamadoStatus), backoffice.atualizarChamado);
rotas.get('/backoffice/auditoria', ...soOperador, backoffice.auditoria); // RF44
