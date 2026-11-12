/**
 * RF01 — Login (fiel ao protótipo: logo, e-mail, senha, "esqueci a senha", botão primário, link de cadastro).
 * Estados: validação por campo, carregando, erro da API (401/423/429) exibido em alerta.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ErroApi } from '../../api/cliente';
import { useAuth } from '../../auth/AuthContext';
import { Alerta, Botao, Campo, Icone } from '../../components/ui';

export function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novos.email = 'Informe um e-mail válido.';
    if (!senha) novos.senha = 'Informe a senha.';
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      const sessao = await entrar(email, senha);
      navigate(sessao.destino, { replace: true });
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else setErroGeral('Não foi possível entrar agora. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <Icone nome="sign_language" className="text-5xl text-primary-container" />
        <h1 className="mt-2 text-4xl font-bold text-primary-container">Víamos</h1>
        <p className="mt-1 text-on-surface-variant">Acessibilidade que começa com você</p>
      </div>

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}
        <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" inputMode="email" placeholder="seu@email.com" icone="mail" value={email} onChange={(e) => setEmail(e.target.value)} erro={erros.email} required />
        <div>
          <Campo rotulo="Senha" name="senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" icone="lock" value={senha} onChange={(e) => setSenha(e.target.value)} erro={erros.senha} required />
          <div className="mt-2 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-on-surface-variant">
              <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} className="size-4" /> Mostrar senha
            </label>
            <Link to="/recuperar-senha" className="font-semibold text-primary-container hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </div>
        <Botao type="submit" largo carregando={carregando}>
          Entrar
        </Botao>
      </form>

      <p className="mt-8 text-center text-on-surface-variant">
        Não tem uma conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary-container hover:underline">
          Cadastre-se
        </Link>
      </p>
      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Ambiente de demonstração — contas de teste em <code>backend/src/db/seed.ts</code>
      </p>
    </main>
  );
}
