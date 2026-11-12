/**
 * RF03 / RF45 / RNF09 — Cadastro do usuário surdo (cliente).
 * Protótipo de referência: Contexto/Arquivos Stitch/code (7).html ("Crie sua conta"),
 * acrescido de telefone e consentimentos LGPD exigidos pelo RF03/RNF09 (ver Briefing §Inconsistências).
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { Sessao } from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { SecaoFormulario, TelaPublica } from '../../components/TelaPublica';
import { Alerta, AreaTexto, Botao, Campo } from '../../components/ui';
import { mascaras } from '../../utils/formato';
import { cepValido, cpfValido, emailValido, erroSenha, idadeValida, telefoneValido } from '../../utils/validacao';

export function CadastroCliente() {
  const { registrarSessao } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [preferenciasAcessibilidade, setPreferenciasAcessibilidade] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceitePrivacidade, setAceitePrivacidade] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function validarFormulario(): Record<string, string> {
    const novos: Record<string, string> = {};
    if (nome.trim().length < 3) novos.nome = 'Informe seu nome completo (mínimo 3 caracteres).';
    if (!cpfValido(cpf)) novos.cpf = 'Informe um CPF válido.';
    if (!idadeValida(dataNascimento)) novos.dataNascimento = 'Informe uma data válida (é necessário ter pelo menos 16 anos).';
    if (!telefoneValido(telefone)) novos.telefone = 'Informe um telefone com DDD (10 ou 11 dígitos).';
    if (cep.trim() && !cepValido(cep)) novos.cep = 'Informe um CEP válido (8 dígitos) ou deixe em branco.';
    if (!emailValido(email)) novos.email = 'Informe um e-mail válido.';
    const probSenha = erroSenha(senha);
    if (probSenha) novos.senha = probSenha;
    if (!aceiteTermos || !aceitePrivacidade) {
      novos.aceiteTermos = 'É necessário aceitar os termos de uso e a política de privacidade (LGPD).';
    }
    return novos;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos = validarFormulario();
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      const sessao = await api.post<Sessao>('/cadastro/cliente', {
        nome: nome.trim(),
        cpf,
        dataNascimento,
        email: email.trim(),
        telefone,
        senha,
        cep: cep.trim() || undefined,
        endereco: endereco.trim() || undefined,
        preferenciasAcessibilidade: preferenciasAcessibilidade.trim() || undefined,
        aceiteTermos,
        aceitePrivacidade,
      });
      registrarSessao(sessao);
      setSucesso(true);
      setTimeout(() => navigate('/cliente', { replace: true }), 600);
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else {
        setErroGeral('Não foi possível concluir o cadastro agora. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaPublica
      titulo="Crie sua conta"
      subtitulo="Preencha seus dados pessoais para ter acesso a intérpretes de Libras presenciais de forma rápida e segura."
      voltarPara="/cadastro"
    >
      {sucesso ? (
        <div className="flex flex-col gap-4">
          <Alerta tipo="sucesso">Conta criada com sucesso! Entrando no seu painel…</Alerta>
          <Botao type="button" largo icone="arrow_forward" onClick={() => navigate('/cliente', { replace: true })}>
            Ir para o início
          </Botao>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
          {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}

          <SecaoFormulario titulo="Dados Pessoais" icone="person">
            <Campo
              rotulo="Nome Completo"
              name="nome"
              autoComplete="name"
              maxLength={120}
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              erro={erros.nome}
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo
                rotulo="CPF"
                name="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(mascaras.cpf(e.target.value))}
                erro={erros.cpf}
                required
              />
              <Campo
                rotulo="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                erro={erros.dataNascimento}
                required
              />
            </div>
            <Campo
              rotulo="Telefone (com DDD)"
              name="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 98888-7777"
              icone="call"
              value={telefone}
              onChange={(e) => setTelefone(mascaras.telefone(e.target.value))}
              erro={erros.telefone}
              required
            />
          </SecaoFormulario>

          <SecaoFormulario titulo="Endereço e Acessibilidade (Opcional)" icone="home_pin">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Campo
                rotulo="CEP"
                name="cep"
                inputMode="numeric"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(mascaras.cep(e.target.value))}
                erro={erros.cep}
              />
              <Campo
                rotulo="Endereço / Complemento"
                name="endereco"
                className="sm:col-span-2"
                maxLength={200}
                placeholder="Rua, número, apto, bloco…"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                erro={erros.endereco}
              />
            </div>
            <AreaTexto
              rotulo="Preferências de comunicação e acessibilidade"
              name="preferenciasAcessibilidade"
              placeholder="Ex.: preferência por sinalização clara, ponto de encontro bem iluminado, apoio em triagem médica…"
              maxLength={300}
              value={preferenciasAcessibilidade}
              onChange={(e) => setPreferenciasAcessibilidade(e.target.value)}
              erro={erros.preferenciasAcessibilidade}
            />
          </SecaoFormulario>

          <SecaoFormulario titulo="Dados de Acesso" icone="lock">
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              icone="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erro={erros.email}
              required
            />
            <div>
              <Campo
                rotulo="Senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                icone="key"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                erro={erros.senha}
                required
              />
              <label className="mt-2 flex min-h-touch items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} className="size-4" />
                Mostrar senha
              </label>
            </div>
          </SecaoFormulario>

          <SecaoFormulario titulo="Termos e Privacidade (LGPD)" icone="verified_user">
            <label className="flex min-h-touch items-start gap-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={aceiteTermos}
                onChange={(e) => setAceiteTermos(e.target.checked)}
                className="mt-1 size-5 shrink-0"
              />
              <span>Li e aceito os Termos de Uso da plataforma Víamos para intermediação de atendimento presencial em Libras.</span>
            </label>
            <label className="flex min-h-touch items-start gap-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={aceitePrivacidade}
                onChange={(e) => setAceitePrivacidade(e.target.checked)}
                className="mt-1 size-5 shrink-0"
              />
              <span>
                Concordo com a Política de Privacidade e o tratamento dos meus dados pessoais conforme a LGPD (Lei 13.709/2018), podendo exportar ou solicitar exclusão no meu perfil.
              </span>
            </label>
            {erros.aceiteTermos && (
              <p role="alert" className="text-sm text-error">
                {erros.aceiteTermos}
              </p>
            )}
          </SecaoFormulario>

          <Botao type="submit" largo carregando={carregando} icone="person_add">
            Cadastrar
          </Botao>

          <Link to="/login" className="btn-secundario w-full">
            Já tem uma conta? Voltar ao login
          </Link>
        </form>
      )}
    </TelaPublica>
  );
}
