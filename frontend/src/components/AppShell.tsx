/**
 * Shell da aplicação: barra superior + navegação inferior persistente (RNF45) no mobile e
 * barra lateral no desktop (como no hub do intérprete do protótipo). Alvos de toque ≥ 44 px (RNF13).
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api/cliente';
import type { Notificacao } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Icone } from './ui';

interface ItemNav {
  para: string;
  rotulo: string;
  icone: string;
  fim?: boolean;
}

const NAV: Record<string, ItemNav[]> = {
  CLIENTE: [
    { para: '/cliente', rotulo: 'Início', icone: 'home', fim: true },
    { para: '/cliente/historico', rotulo: 'Atendimentos', icone: 'assignment' },
    { para: '/cliente/perfil', rotulo: 'Perfil', icone: 'person' },
  ],
  INTERPRETE: [
    { para: '/interprete', rotulo: 'Início', icone: 'home', fim: true },
    { para: '/interprete/demandas', rotulo: 'Demandas', icone: 'list_alt' },
    { para: '/interprete/ganhos', rotulo: 'Ganhos', icone: 'payments' },
    { para: '/interprete/perfil', rotulo: 'Perfil', icone: 'person' },
  ],
  BACKOFFICE: [
    { para: '/backoffice', rotulo: 'Certificações', icone: 'verified', fim: true },
    { para: '/backoffice/chamados', rotulo: 'Chamados', icone: 'support_agent' },
    { para: '/backoffice/auditoria', rotulo: 'Auditoria', icone: 'history' },
  ],
};
NAV.SUPORTE = NAV.BACKOFFICE;

export function AppShell() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [naoLidas, setNaoLidas] = useState(0);
  const itens = usuario ? NAV[usuario.papel] : [];

  useEffect(() => {
    let ativo = true;
    const atualizar = () =>
      api
        .get<Notificacao[]>('/notificacoes?naoLidas=true')
        .then((n) => ativo && setNaoLidas(n.length))
        .catch(() => undefined);
    atualizar();
    const timer = setInterval(atualizar, 30_000);
    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, []);

  const papelRotulo = usuario?.papel === 'CLIENTE' ? 'Usuário surdo' : usuario?.papel === 'INTERPRETE' ? 'Intérprete de Libras' : 'Operação Víamos';

  return (
    <div className="min-h-dvh bg-background md:flex">
      {/* Barra lateral (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant/60 bg-surface-container-lowest p-5 md:flex">
        <div className="mb-8 flex items-center gap-2 text-primary-container">
          <Icone nome="sign_language" className="text-3xl" />
          <span className="text-2xl font-bold tracking-tight">Víamos</span>
        </div>
        <div className="mb-6">
          <p className="font-semibold">{usuario?.nome}</p>
          <p className="text-sm text-on-surface-variant">{papelRotulo}</p>
        </div>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {itens.map((i) => (
            <NavLink key={i.para} to={i.para} end={i.fim} className={({ isActive }) => `flex min-h-touch items-center gap-3 rounded-lg px-3 font-medium ${isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}>
              <Icone nome={i.icone} /> {i.rotulo}
            </NavLink>
          ))}
          <NavLink to="/notificacoes" className={({ isActive }) => `flex min-h-touch items-center gap-3 rounded-lg px-3 font-medium ${isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}>
            <Icone nome="notifications" /> Notificações {naoLidas > 0 && <span className="ml-auto rounded-full bg-status-alert px-2 text-xs font-bold text-white">{naoLidas}</span>}
          </NavLink>
        </nav>
        <button onClick={() => sair().then(() => navigate('/login'))} className="mt-auto flex min-h-touch items-center gap-3 rounded-lg px-3 font-medium text-on-surface-variant hover:bg-surface-container">
          <Icone nome="logout" /> Sair
        </button>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        {/* Barra superior (mobile) */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-outline-variant/60 bg-surface-container-lowest px-4 md:hidden">
          <span className="text-xl font-bold text-primary-container">Víamos</span>
          <NavLink to="/notificacoes" aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ''}`} className="relative flex size-11 items-center justify-center rounded-full hover:bg-surface-container">
            <Icone nome="notifications" />
            {naoLidas > 0 && <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-status-alert" />}
          </NavLink>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-5 pb-28 md:px-12 md:pb-12">
          <Outlet />
        </main>

        {/* Navegação inferior persistente (mobile) */}
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-outline-variant/60 bg-surface-container-lowest pb-[env(safe-area-inset-bottom)] md:hidden">
          {itens.map((i) => (
            <NavLink key={i.para} to={i.para} end={i.fim} className={({ isActive }) => `flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}>
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-14 items-center justify-center rounded-full ${isActive ? 'bg-primary-container text-on-primary' : ''}`}>
                    <Icone nome={i.icone} preenchido={isActive} />
                  </span>
                  {i.rotulo}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
