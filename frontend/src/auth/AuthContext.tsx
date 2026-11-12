/**
 * Estado de autenticação da SPA (RF01, RF08, RF09).
 * Na splash, `carregarSessao()` consulta /auth/me; o logout chama a API (revoga a sessão) e limpa o token local.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api/cliente';
import type { Sessao, Usuario } from '../api/tipos';

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<Sessao>;
  registrarSessao: (sessao: Sessao) => void;
  sair: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const AuthContext = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!tokenStore.obter()) {
      setUsuario(null);
      return;
    }
    try {
      const { usuario: u } = await api.get<{ usuario: Usuario }>('/auth/me');
      setUsuario(u);
    } catch {
      tokenStore.limpar();
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    recarregar().finally(() => setCarregando(false));
  }, [recarregar]);

  const registrarSessao = useCallback((sessao: Sessao) => {
    tokenStore.salvar(sessao.token);
    setUsuario(sessao.usuario);
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const sessao = await api.post<Sessao>('/auth/login', { email, senha });
      registrarSessao(sessao);
      return sessao;
    },
    [registrarSessao],
  );

  const sair = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* mesmo se a API falhar, limpamos o dispositivo */
    }
    tokenStore.limpar();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, carregando, entrar, registrarSessao, sair, recarregar }), [usuario, carregando, entrar, registrarSessao, sair, recarregar]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ContextoAuth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

/** Rota inicial de cada papel (espelha `destinoPorPapel` do backend). */
export function destinoPorPapel(papel: Usuario['papel']): string {
  if (papel === 'CLIENTE') return '/cliente';
  if (papel === 'INTERPRETE') return '/interprete';
  return '/backoffice';
}
