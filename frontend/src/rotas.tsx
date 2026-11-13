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
import { Sala } from './components/Sala';
import { Carregando } from './components/ui';
import { CadastroCliente } from './pages/auth/CadastroCliente';
import { CadastroInterprete } from './pages/auth/CadastroInterprete';
import { Login } from './pages/auth/Login';
import { RecuperarSenha } from './pages/auth/RecuperarSenha';
import { RedefinirSenha } from './pages/auth/RedefinirSenha';
import { SelecaoPerfil } from './pages/auth/SelecaoPerfil';
import { Splash } from './pages/auth/Splash';
import { ChamadosSuporte } from './pages/backoffice/ChamadosSuporte';
import { FilaCertificacoes } from './pages/backoffice/FilaCertificacoes';
import { ParecerCertificacao } from './pages/backoffice/ParecerCertificacao';
import { TrilhaAuditoria } from './pages/backoffice/TrilhaAuditoria';
import { DetalheAtendimentoCliente } from './pages/cliente/DetalheAtendimentoCliente';
import { DetalheSolicitacao } from './pages/cliente/DetalheSolicitacao';
import { HubCliente } from './pages/cliente/Hub';
import { NovaSolicitacao } from './pages/cliente/NovaSolicitacao';
import { PagamentoAtendimento } from './pages/cliente/PagamentoAtendimento';
import { PerfilCliente } from './pages/cliente/PerfilCliente';
import { AvaliarAtendimento } from './pages/comum/AvaliarAtendimento';
import { HistoricoAtendimentos } from './pages/comum/HistoricoAtendimentos';
import { Notificacoes } from './pages/comum/Notificacoes';
import { Suporte } from './pages/comum/Suporte';
import { VerificarComprovante } from './pages/comum/VerificarComprovante';
import { AgendaInterprete } from './pages/interprete/AgendaInterprete';
import { DemandasInterprete } from './pages/interprete/DemandasInterprete';
import { DetalheAtendimentoInterprete } from './pages/interprete/DetalheAtendimentoInterprete';
import { DetalheDemanda } from './pages/interprete/DetalheDemanda';
import { GanhosInterprete } from './pages/interprete/GanhosInterprete';
import { HubInterprete } from './pages/interprete/HubInterprete';
import { PerfilInterprete } from './pages/interprete/PerfilInterprete';

/** Protege um grupo de rotas por papel; sem sessão → /login; papel errado → hub do próprio papel. */
function Protegida({ papeis }: { papeis: Papel[] }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <Carregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!papeis.includes(usuario.papel)) return <Navigate to={destinoPorPapel(usuario.papel)} replace />;
  return <Outlet />;
}

export const SITEMAP = {
  publico: [
    { path: '/', nome: 'Splash', element: <Splash /> },
    { path: '/login', nome: 'Login', element: <Login /> },
    { path: '/recuperar-senha', nome: 'Recuperar senha', element: <RecuperarSenha /> },
    { path: '/redefinir-senha/:token', nome: 'Redefinir senha', element: <RedefinirSenha /> },
    { path: '/cadastro', nome: 'Seleção de perfil', element: <SelecaoPerfil /> },
    { path: '/cadastro/cliente', nome: 'Cadastro do cliente', element: <CadastroCliente /> },
    { path: '/cadastro/interprete', nome: 'Cadastro do intérprete', element: <CadastroInterprete /> },
    { path: '/verificar/:codigo', nome: 'Verificar comprovante', element: <VerificarComprovante /> },
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
    { path: '/interprete', nome: 'Hub do intérprete', element: <HubInterprete /> },
    { path: '/interprete/demandas', nome: 'Demandas próximas', element: <DemandasInterprete /> },
    { path: '/interprete/demandas/:id', nome: 'Detalhe da demanda', element: <DetalheDemanda /> },
    { path: '/interprete/agenda', nome: 'Raio e disponibilidade', element: <AgendaInterprete /> },
    { path: '/interprete/atendimentos/:id', nome: 'Detalhe do atendimento (intérprete)', element: <DetalheAtendimentoInterprete /> },
    { path: '/interprete/atendimentos/:id/sala', nome: 'Sala de atendimento (intérprete)', element: <Sala /> },
    { path: '/interprete/atendimentos/:id/avaliar', nome: 'Avaliar cliente', element: <AvaliarAtendimento /> },
    { path: '/interprete/ganhos', nome: 'Ganhos e repasse', element: <GanhosInterprete /> },
    { path: '/interprete/historico', nome: 'Histórico (intérprete)', element: <HistoricoAtendimentos /> },
    { path: '/interprete/perfil', nome: 'Perfil e habilitação', element: <PerfilInterprete /> },
  ],
  backoffice: [
    { path: '/backoffice', nome: 'Fila de certificações', element: <FilaCertificacoes /> },
    { path: '/backoffice/certificacoes/:id', nome: 'Parecer da certificação', element: <ParecerCertificacao /> },
    { path: '/backoffice/chamados', nome: 'Chamados de suporte', element: <ChamadosSuporte /> },
    { path: '/backoffice/auditoria', nome: 'Trilha de auditoria', element: <TrilhaAuditoria /> },
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
