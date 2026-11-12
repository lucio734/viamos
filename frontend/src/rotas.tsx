/**
 * SITEMAP DA APLICAÇÃO (item #3 do documento e #29 do checklist).
 * Cada rota abaixo corresponde a uma tela do protótipo. As ainda não implementadas renderizam <EmConstrucao>
 * com a lista de endpoints já disponíveis — substitua pelo componente real quando a tela ficar pronta.
 * A figura do sitemap em docs/producao-tecnica é gerada a partir deste arquivo (scripts/gerar-sitemap).
 */
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import type { Papel } from './api/tipos';
import { destinoPorPapel, useAuth } from './auth/AuthContext';
import { AppShell } from './components/AppShell';
import { Carregando } from './components/ui';
import { EmConstrucao, type InfoTela } from './pages/EmConstrucao';
import { Login } from './pages/auth/Login';
import { Splash } from './pages/auth/Splash';
import { HubCliente } from './pages/cliente/Hub';

/** Protege um grupo de rotas por papel; sem sessão → /login; papel errado → hub do próprio papel. */
function Protegida({ papeis }: { papeis: Papel[] }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Carregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!papeis.includes(usuario.papel)) return <Navigate to={destinoPorPapel(usuario.papel)} replace />;
  return <Outlet />;
}

const tela = (info: InfoTela) => <EmConstrucao info={info} />;

export const SITEMAP = {
  publico: [
    { path: '/', nome: 'Splash', element: <Splash /> },
    { path: '/login', nome: 'Login', element: <Login /> },
    { path: '/recuperar-senha', nome: 'Recuperar senha', element: tela({ titulo: 'Recuperar senha', requisitos: 'RF07', endpoints: ['POST /auth/recuperar-senha'], prototipo: 'code_2.html' }) },
    { path: '/redefinir-senha/:token', nome: 'Redefinir senha', element: tela({ titulo: 'Redefinir senha', requisitos: 'RF07', endpoints: ['POST /auth/redefinir-senha'] }) },
    { path: '/cadastro', nome: 'Seleção de perfil', element: tela({ titulo: 'Como você quer usar o Víamos?', requisitos: 'RF02', endpoints: [], prototipo: 'code_3.html' }) },
    { path: '/cadastro/cliente', nome: 'Cadastro do cliente', element: tela({ titulo: 'Cadastro — usuário surdo', requisitos: 'RF03', endpoints: ['POST /cadastro/cliente'], prototipo: 'code_4.html' }) },
    { path: '/cadastro/interprete', nome: 'Cadastro do intérprete', element: tela({ titulo: 'Cadastro — intérprete', requisitos: 'RF04, RF05', endpoints: ['POST /cadastro/interprete'], prototipo: 'code_5.html' }) },
    { path: '/verificar/:codigo', nome: 'Verificar comprovante', element: tela({ titulo: 'Verificação de comprovante', requisitos: 'RF38', endpoints: ['GET /comprovantes/:codigo/verificar'] }) },
  ],
  cliente: [
    { path: '/cliente', nome: 'Hub do cliente', element: <HubCliente /> },
    { path: '/cliente/solicitacoes/nova', nome: 'Nova solicitação', element: tela({ titulo: 'Solicitar intérprete', requisitos: 'RF10–RF16', endpoints: ['POST /solicitacoes/estimativa', 'POST /solicitacoes'], prototipo: 'code_8.html' }) },
    { path: '/cliente/solicitacoes/:id', nome: 'Acompanhamento da solicitação', element: tela({ titulo: 'Acompanhar solicitação', requisitos: 'RF18, RF19, RF31', endpoints: ['GET /solicitacoes/:id', 'POST /solicitacoes/:id/cancelar', 'GET /atendimentos/:id/qrcode'], prototipo: 'code_12.html' }) },
    { path: '/cliente/atendimentos/:id', nome: 'Detalhe do atendimento (cliente)', element: tela({ titulo: 'Atendimento', requisitos: 'RF31, RF33, RF37', endpoints: ['GET /atendimentos/:id', 'GET /atendimentos/:id/qrcode', 'POST /atendimentos/:id/encerrar', 'GET /atendimentos/:id/comprovante.pdf'] }) },
    { path: '/cliente/atendimentos/:id/sala', nome: 'Sala de atendimento (cliente)', element: tela({ titulo: 'Sala de atendimento', requisitos: 'RF28–RF30, RF34', endpoints: ['GET/POST /atendimentos/:id/mensagens', 'GET/POST /atendimentos/:id/localizacoes', 'POST /atendimentos/:id/suporte'], prototipo: 'code_9.html' }) },
    { path: '/cliente/atendimentos/:id/pagamento', nome: 'Pagamento', element: tela({ titulo: 'Pagamento do atendimento', requisitos: 'RF35, RF36', endpoints: ['GET /formas-pagamento', 'POST /formas-pagamento', 'POST /pagamentos/:id/processar'] }) },
    { path: '/cliente/atendimentos/:id/avaliar', nome: 'Avaliar intérprete', element: tela({ titulo: 'Avaliar atendimento', requisitos: 'RF40', endpoints: ['POST /atendimentos/:id/avaliacoes'] }) },
    { path: '/cliente/historico', nome: 'Histórico (cliente)', element: tela({ titulo: 'Meus atendimentos', requisitos: 'RF39, RF37', endpoints: ['GET /atendimentos?de&ate&tipoServico&status'], prototipo: 'code_11.html' }) },
    { path: '/cliente/perfil', nome: 'Perfil (cliente)', element: tela({ titulo: 'Meu perfil', requisitos: 'RF43, RF45, RF35', endpoints: ['GET/PUT /perfil', 'GET/PUT /perfil/consentimentos', 'GET /perfil/dados/exportar', 'POST /perfil/dados/excluir', 'POST /auth/alterar-senha'], prototipo: 'code_15.html' }) },
  ],
  interprete: [
    { path: '/interprete', nome: 'Hub do intérprete', element: tela({ titulo: 'Hub do intérprete', requisitos: 'RF20, RF24, RF26', endpoints: ['GET /interprete/hub', 'PUT /interprete/configuracao'], prototipo: 'code_10.html' }) },
    { path: '/interprete/demandas', nome: 'Demandas próximas', element: tela({ titulo: 'Demandas próximas', requisitos: 'RF20–RF23', endpoints: ['GET /demandas', 'POST /demandas/:id/aceitar', 'POST /demandas/:id/recusar'], prototipo: 'code_6.html' }) },
    { path: '/interprete/demandas/:id', nome: 'Detalhe da demanda', element: tela({ titulo: 'Detalhe da demanda', requisitos: 'RF21–RF23', endpoints: ['GET /solicitacoes/:id', 'POST /demandas/:id/aceitar', 'POST /demandas/:id/recusar'], prototipo: 'code_7.html' }) },
    { path: '/interprete/agenda', nome: 'Raio e disponibilidade', element: tela({ titulo: 'Raio de atuação e disponibilidade', requisitos: 'RF24, RF25', endpoints: ['PUT /interprete/configuracao', 'GET/PUT /interprete/disponibilidades'] }) },
    { path: '/interprete/atendimentos/:id', nome: 'Detalhe do atendimento (intérprete)', element: tela({ titulo: 'Atendimento — check-in e encerramento', requisitos: 'RF31–RF33', endpoints: ['GET /atendimentos/:id', 'POST /atendimentos/:id/checkin', 'POST /atendimentos/:id/encerrar'], prototipo: 'code_13.html' }) },
    { path: '/interprete/atendimentos/:id/sala', nome: 'Sala de atendimento (intérprete)', element: tela({ titulo: 'Sala de atendimento', requisitos: 'RF28–RF30, RF34', endpoints: ['GET/POST /atendimentos/:id/mensagens', 'GET/POST /atendimentos/:id/localizacoes'], prototipo: 'code_9.html' }) },
    { path: '/interprete/atendimentos/:id/avaliar', nome: 'Avaliar cliente', element: tela({ titulo: 'Avaliar atendimento', requisitos: 'RF40', endpoints: ['POST /atendimentos/:id/avaliacoes'] }) },
    { path: '/interprete/ganhos', nome: 'Ganhos e repasse', element: tela({ titulo: 'Ganhos', requisitos: 'RF26, RF27', endpoints: ['GET /interprete/ganhos', 'GET/POST /interprete/contas-bancarias', 'GET/POST /interprete/repasses'], prototipo: 'code_14.html' }) },
    { path: '/interprete/historico', nome: 'Histórico (intérprete)', element: tela({ titulo: 'Meus atendimentos', requisitos: 'RF39', endpoints: ['GET /atendimentos?de&ate&tipoServico&status'], prototipo: 'code_11.html' }) },
    { path: '/interprete/perfil', nome: 'Perfil e habilitação', element: tela({ titulo: 'Meu perfil e documentação', requisitos: 'RF43, RF05, RF45', endpoints: ['GET/PUT /perfil', 'GET/POST /interprete/certificacoes', 'GET/PUT /perfil/consentimentos'], prototipo: 'code_15.html' }) },
  ],
  backoffice: [
    { path: '/backoffice', nome: 'Fila de certificações', element: tela({ titulo: 'Análise documental', requisitos: 'RF06', endpoints: ['GET /backoffice/indicadores', 'GET /backoffice/certificacoes?status=EM_ANALISE'] }) },
    { path: '/backoffice/certificacoes/:id', nome: 'Parecer da certificação', element: tela({ titulo: 'Parecer', requisitos: 'RF06', endpoints: ['GET /backoffice/certificacoes/:id/arquivo', 'POST /backoffice/certificacoes/:id/parecer'] }) },
    { path: '/backoffice/chamados', nome: 'Chamados de suporte', element: tela({ titulo: 'Chamados', requisitos: 'RF34', endpoints: ['GET /backoffice/chamados', 'POST /backoffice/chamados/:id/status'] }) },
    { path: '/backoffice/auditoria', nome: 'Trilha de auditoria', element: tela({ titulo: 'Auditoria', requisitos: 'RF44', endpoints: ['GET /backoffice/auditoria'] }) },
  ],
  comum: [
    { path: '/notificacoes', nome: 'Notificações', element: tela({ titulo: 'Notificações', requisitos: 'RF42', endpoints: ['GET /notificacoes', 'POST /notificacoes/:id/lida', 'POST /notificacoes/ler-todas'] }) },
    { path: '/suporte', nome: 'Suporte', element: tela({ titulo: 'Suporte e emergência', requisitos: 'RF34', endpoints: ['POST /suporte'] }) },
  ],
};

export const roteador = createBrowserRouter([
  ...SITEMAP.publico.map(({ path, element }) => ({ path, element })),
  {
    element: <Protegida papeis={['CLIENTE']} />,
    children: [{ element: <AppShell />, children: SITEMAP.cliente.map(({ path, element }) => ({ path, element })) }],
  },
  {
    element: <Protegida papeis={['INTERPRETE']} />,
    children: [{ element: <AppShell />, children: SITEMAP.interprete.map(({ path, element }) => ({ path, element })) }],
  },
  {
    element: <Protegida papeis={['BACKOFFICE', 'SUPORTE']} />,
    children: [{ element: <AppShell />, children: SITEMAP.backoffice.map(({ path, element }) => ({ path, element })) }],
  },
  {
    element: <Protegida papeis={['CLIENTE', 'INTERPRETE', 'BACKOFFICE', 'SUPORTE']} />,
    children: [{ element: <AppShell />, children: SITEMAP.comum.map(({ path, element }) => ({ path, element })) }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
