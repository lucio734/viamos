/**
 * RF07 / RNF06 — Solicitar recuperação de senha por e-mail.
 * Fora de produção, a API devolve `tokenDev` para permitir testar o fluxo completo sem servidor SMTP.
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { TelaPublica } from '../../components/TelaPublica';
import { Alerta, Botao, Campo, Cartao, Icone } from '../../components/ui';
import { emailValido } from '../../utils/validacao';

interface RespostaRecuperar {
  mensagem: string;
  tokenDev?: string;
}

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resposta, setResposta] = useState<RespostaRecuperar | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (!emailValido(email)) novos.email = 'Informe um e-mail válido.';
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      const dados = await api.post<RespostaRecuperar>('/auth/recuperar-senha', { email: email.trim() });
      setResposta(dados);
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else {
        setErroGeral('Não foi possível solicitar a recuperação agora. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaPublica
      titulo="Recuperar senha"
      subtitulo="Informe o e-mail da sua conta. Enviaremos um link temporário (válido por 30 minutos) para criar uma nova senha."
      voltarPara="/login"
      largura="md"
    >
      {resposta ? (
        <div className="flex flex-col gap-4">
          <Alerta tipo="sucesso">{resposta.mensagem}</Alerta>
          {resposta.tokenDev && (
            <Cartao titulo="Ambiente de demonstração">
              <p className="text-sm text-on-surface-variant">
                Como o envio de e-mail é simulado no MVP, use o atalho abaixo para abrir diretamente o link de redefinição gerado:
              </p>
              <Link to={`/redefinir-senha/${resposta.tokenDev}`} className="mt-3 block">
                <Botao type="button" variante="secundario" largo icone="key">
                  Abrir link de redefinição
                </Botao>
              </Link>
            </Cartao>
          )}
          <Link to="/login" className="mt-2 block">
            <Botao type="button" variante="primario" largo icone="arrow_back">
              Voltar ao login
            </Botao>
          </Link>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}
          <Campo
            rotulo="E-mail cadastrado"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="seu@email.com"
            icone="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erros.email}
            required
          />
          <Botao type="submit" largo carregando={carregando} icone="send">
            Enviar link de recuperação
          </Botao>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Lembrou a senha?{' '}
            <Link to="/login" className="inline-flex min-h-touch items-center px-2 font-semibold text-primary-container hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}
      <div className="mt-8 flex items-center gap-2 rounded-lg bg-surface-container p-3 text-xs text-on-surface-variant">
        <Icone nome="lock" className="text-base text-primary-container" />
        <span>Por segurança, não informamos se um e-mail existe ou não na plataforma.</span>
      </div>
    </TelaPublica>
  );
}
