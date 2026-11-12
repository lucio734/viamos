/**
 * RF07 — Redefinir senha a partir do token temporário enviado por e-mail.
 * Ao concluir, o backend revoga todas as sessões anteriores da conta (D-13).
 */
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { TelaPublica } from '../../components/TelaPublica';
import { Alerta, Botao, Campo } from '../../components/ui';
import { erroSenha } from '../../utils/validacao';

export function RedefinirSenha() {
  const { token = '' } = useParams<{ token: string }>();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (token.trim().length < 10) novos.token = 'Link de redefinição inválido.';
    const probSenha = erroSenha(novaSenha);
    if (probSenha) novos.novaSenha = probSenha;
    if (confirmarSenha !== novaSenha) novos.confirmarSenha = 'As senhas informadas não coincidem.';
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      const resp = await api.post<{ mensagem: string }>('/auth/redefinir-senha', { token, novaSenha });
      setSucesso(resp.mensagem);
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else {
        setErroGeral('Não foi possível redefinir a senha agora. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaPublica
      titulo="Criar nova senha"
      subtitulo="Escolha uma senha com pelo menos 8 caracteres. Suas sessões anteriores serão encerradas por segurança."
      voltarPara="/login"
      largura="md"
    >
      {sucesso ? (
        <div className="flex flex-col gap-4">
          <Alerta tipo="sucesso">{sucesso}</Alerta>
          <Link to="/login" className="block">
            <Botao type="button" variante="primario" largo icone="login">
              Ir para o login
            </Botao>
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {erroGeral && (
            <div className="flex flex-col gap-2">
              <Alerta tipo="erro">{erroGeral}</Alerta>
              <Link to="/recuperar-senha" className="inline-flex min-h-touch items-center px-2 text-sm font-semibold text-primary-container hover:underline">
                Solicitar um novo link de recuperação
              </Link>
            </div>
          )}
          {erros.token && <Alerta tipo="erro">{erros.token}</Alerta>}
          <Campo
            rotulo="Nova senha"
            name="novaSenha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            icone="lock"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            erro={erros.novaSenha}
            ajuda="Use pelo menos 8 caracteres."
            required
          />
          <Campo
            rotulo="Confirmar nova senha"
            name="confirmarSenha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            icone="lock_reset"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            erro={erros.confirmarSenha}
            required
          />
          <label className="flex min-h-touch items-center gap-2 text-sm text-on-surface-variant">
            <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} className="size-4" />
            Mostrar senhas
          </label>
          <Botao type="submit" largo carregando={carregando} icone="check_circle">
            Salvar nova senha
          </Botao>
        </form>
      )}
    </TelaPublica>
  );
}
