/**
 * SITEMAP DA APLICAÇÃO (item #3 do documento e #29 do checklist).
 * Cada rota abaixo corresponde a uma tela do protótipo. As ainda não implementadas renderizam <EmConstrucao>
 * com a lista de endpoints já disponíveis — substitua pelo componente real quando a tela ficar pronta.
 * A figura do sitemap em docs/producao-tecnica é gerada a partir deste arquivo (scripts/gerar-sitemap).
 * Protótipos Stitch (Contexto/Arquivos Stitch): Login=code.html, Splash=code (19), Cadastro cliente=code (7),
 * Cadastro intérprete=code (17), Hub cliente=code (9), Nova solicitação=code (15), Sala=code (21), Avaliação=code (3),
 * Histórico=code (13), Perfil=code (11), Hub intérprete=code (1), Gestão de solicitações=code (5).
 * Telas sem protótipo dedicado (recuperar senha, seleção de perfil, acompanhamento, pagamento, agenda, ganhos,
 * backoffice, notificações, suporte) seguem o DESIGN.md e os padrões das telas existentes.
 */
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import type { Papel } from './api/tipos';
import { destinoPorPapel, useAuth } from './auth/AuthContext';
import { AppShell } from './components/AppShell';
import { Carregando } from './components/ui';
import { EmConstrucao, type InfoTela } from './pages/EmConstrucao';
import { CadastroCliente } from './pages/auth/CadastroCliente';
import { CadastroInterprete } from './pages/auth/CadastroInterprete';
import { Login } from './pages/auth/Login';
import { RecuperarSenha } from './pages/auth/RecuperarSenha';
import { RedefinirSenha } from './pages/auth/RedefinirSenha';
import { SelecaoPerfil } from './pages/auth/SelecaoPerfil';
import { Splash } from './pages/auth/Splash';
import { HubCliente } from './pages/cliente/Hub';
import { DetalheAtendimentoCliente } from './pages/cliente/DetalheAtendimentoCliente';
import { DetalheSolicitacao } from './pages/cliente/DetalheSolicitacao';
import { NovaSolicitacao } from './pages/cliente/NovaSolicitacao';
import { PagamentoAtendimento } from './pages/cliente/PagamentoAtendimento';
import { PerfilCliente } from './pages/cliente/PerfilCliente';
import { AvaliarAtendimento } from './pages/comum/AvaliarAtendimento';
import { HistoricoAtendimentos } from './pages/comum/HistoricoAtendimentos';
import { Notificacoes } from './pages/comum/Notificacoes';
import { Suporte } from './pages/comum/Suporte';
import { Sala } from './components/Sala';

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
    { path: '/recuperar-senha', nome: 'Recuperar senha', element: <RecuperarSenha /> },
    { path: '/redefinir-senha/:token', nome: 'Redefinir senha', element: <RedefinirSenha /> },
    { path: '/cadastro', nome: 'Seleção de perfil', element: <SelecaoPerfil /> },
    { path: '/cadastro/cliente', nome: 'Cadastro do cliente', element: <CadastroCliente /> },
    { path: '/cadastro/interprete', nome: 'Cadastro do intérprete', element: <CadastroInterprete /> },
    { path: '/verificar/:codigo', nome: 'Verificar comprovante', element: tela({ titulo: 'Verificação de comprovante', requisitos: 'RF38', endpoints: ['GET /comprovantes/:codigo/verificar'] }) },
  ],
  cliente: [
    { path: '/cliente', nome: 'Hub do cliente', element: <HubCliente /> },
    { path: '/cliente/solicitacoes/nova', nome: 'Nova solicitação', element: <NovaSolicitacao /> },
    { path: '/cliente/solicitacoes/:id', nome: 'Acompanhamento da solicitação', element: <DetalheSolicitacao /> },
    { path: '/cliente/atendimentos/:id', nome: 'Detalhe do atendimento (cliente)', element: <DetalheAtendimentoCliente /> },
    { path: '/cliente/atendimentos/:id/sala', nome: 'Sala de atendimento (cliente)', element: <Sala /> },
    { path: '/cliente/atendimentos/:id/pagamento', nome: 'Pagamento', element: <PagamentoAtendimento /> },
    { path: '/cliente/atendimentos/:id/avaliar', nome: 'Avaliar intérprete', element: <AvaliarAtendimento /> },
    { path: '/cliente/historico', nome: 'Histórico (cliente)', element: <HistoricoAtendimentos /> },
    { path: '/cliente/perfil', nome: 'Perfil (cliente)', element: <PerfilCliente /> },
  ],
  interprete: [
    { path: '/interprete', nome: 'Hub do intérprete', element: tela({ titulo: 'Hub do intérprete', requisitos: 'RF20, RF24, RF26', endpoints: ['GET /interprete/hub', 'PUT /interprete/configuracao'], prototipo: 'code (1).html' }) },
    { path: '/interprete/demandas', nome: 'Demandas próximas', element: tela({ titulo: 'Demandas próximas', requisitos: 'RF20–RF23', endpoints: ['GET /demandas', 'POST /demandas/:id/aceitar', 'POST /demandas/:id/recusar'], prototipo: 'code (5).html' }) },
    { path: '/interprete/demandas/:id', nome: 'Detalhe da demanda', element: tela({ titulo: 'Detalhe da demanda', requisitos: 'RF21–RF23', endpoints: ['GET /solicitacoes/:id', 'POST /demandas/:id/aceitar', 'POST /demandas/:id/recusar'] }) },
    { path: '/interprete/agenda', nome: 'Raio e disponibilidade', element: tela({ titulo: 'Raio de atuação e disponibilidade', requisitos: 'RF24, RF25', endpoints: ['PUT /interprete/configuracao', 'GET/PUT /interprete/disponibilidades'] }) },
    { path: '/interprete/atendimentos/:id', nome: 'Detalhe do atendimento (intérprete)', element: tela({ titulo: 'Atendimento — check-in e encerramento', requisitos: 'RF31–RF33', endpoints: ['GET /atendimentos/:id', 'POST /atendimentos/:id/checkin', 'POST /atendimentos/:id/encerrar'] }) },
    { path: '/interprete/atendimentos/:id/sala', nome: 'Sala de atendimento (intérprete)', element: <Sala /> },
    { path: '/interprete/atendimentos/:id/avaliar', nome: 'Avaliar cliente', element: <AvaliarAtendimento /> },
    { path: '/interprete/ganhos', nome: 'Ganhos e repasse', element: tela({ titulo: 'Ganhos', requisitos: 'RF26, RF27', endpoints: ['GET /interprete/ganhos', 'GET/POST /interprete/contas-bancarias', 'GET/POST /interprete/repasses'] }) },
    { path: '/interprete/historico', nome: 'Histórico (intérprete)', element: <HistoricoAtendimentos /> },
    { path: '/interprete/perfil', nome: 'Perfil e habilitação', element: tela({ titulo: 'Meu perfil e documentação', requisitos: 'RF43, RF05, RF45', endpoints: ['GET/PUT /perfil', 'GET/POST /interprete/certificacoes', 'GET/PUT /perfil/consentimentos'], prototipo: 'code (11).html' }) },
  ],
  backoffice: [
    { path: '/backoffice', nome: 'Fila de certificações', element: tela({ titulo: 'Análise documental', requisitos: 'RF06', endpoints: ['GET /backoffice/indicadores', 'GET /backoffice/certificacoes?status=EM_ANALISE'] }) },
    { path: '/backoffice/certificacoes/:id', nome: 'Parecer da certificação', element: tela({ titulo: 'Parecer', requisitos: 'RF06', endpoints: ['GET /backoffice/certificacoes/:id/arquivo', 'POST /backoffice/certificacoes/:id/parecer'] }) },
    { path: '/backoffice/chamados', nome: 'Chamados de suporte', element: tela({ titulo: 'Chamados', requisitos: 'RF34', endpoints: ['GET /backoffice/chamados', 'POST /backoffice/chamados/:id/status'] }) },
    { path: '/backoffice/auditoria', nome: 'Trilha de auditoria', element: tela({ titulo: 'Auditoria', requisitos: 'RF44', endpoints: ['GET /backoffice/auditoria'] }) },
  ],
  comum: [
    { path: '/notificacoes', nome: 'Notificações', element: <Notificacoes /> },
    { path: '/suporte', nome: 'Suporte', element: <Suporte /> },
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
