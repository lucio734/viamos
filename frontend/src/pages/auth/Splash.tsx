/**
 * RF09 — Splash: identidade visual + verificação de sessão. Redireciona para o hub do papel ou para o login.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinoPorPapel, useAuth } from '../../auth/AuthContext';
import { Icone, Spinner } from '../../components/ui';

export function Splash() {
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;
    const t = setTimeout(() => navigate(usuario ? destinoPorPapel(usuario.papel) : '/login', { replace: true }), 600);
    return () => clearTimeout(t);
  }, [carregando, usuario, navigate]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-primary-container px-6 text-center text-on-primary">
      <Icone nome="sign_language" className="text-7xl" />
      <div>
        <h1 className="text-5xl font-bold tracking-tight">Víamos</h1>
        <p className="mt-2 text-lg text-on-primary-container">Acessibilidade que começa com você</p>
      </div>
      <Spinner rotulo="Verificando sessão" />
    </main>
  );
}
