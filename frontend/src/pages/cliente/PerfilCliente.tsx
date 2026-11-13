/**
 * Perfil do Cliente Surdo (RF43, RF45, RF35, protótipo Stitch code (11).html).
 * Organizado em Bento Grid com:
 *   1. Cartão de visão geral (foto/iniciais, nome, e-mail, CPF mascarado)
 *   2. Dados Cadastrais e Preferências de Acessibilidade (PUT /perfil)
 *   3. Formas de Pagamento salvas (GET/POST/DELETE /formas-pagamento)
 *   4. Segurança — Alterar Senha com revogação de sessões antigas (POST /auth/alterar-senha)
 *   5. Privacidade e Direitos LGPD — Consentimentos, Exportar JSON e Excluir Conta
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { ConsentimentoItem, FormaPagamento, Usuario } from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { Alerta, AreaTexto, Botao, Campo, Carregando, Cartao, EstadoErro, Icone } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';
import { cepValido, erroSenha, telefoneValido } from '../../utils/validacao';

const ROTULOS_CONSENTIMENTO: Record<ConsentimentoItem['finalidade'], { titulo: string; descricao: string; obrigatorio: boolean }> = {
  TERMOS_USO: {
    titulo: 'Termos de Uso da Plataforma',
    descricao: 'Regras de agendamento, política de cancelamento e uso presencial.',
    obrigatorio: true,
  },
  PRIVACIDADE: {
    titulo: 'Política de Privacidade (LGPD)',
    descricao: 'Tratamento de dados cadastrais e retenção fiscal de comprovantes.',
    obrigatorio: true,
  },
  LOCALIZACAO: {
    titulo: 'Compartilhamento Temporário de Geolocalização',
    descricao: 'Permite usar o botão de GPS na sala de atendimento e no suporte.',
    obrigatorio: false,
  },
  NOTIFICACOES: {
    titulo: 'Notificações Operacionais',
    descricao: 'Avisos sobre aceite de intérprete, check-in e comprovantes.',
    obrigatorio: false,
  },
};

export function PerfilCliente() {
  const { recarregar, sair } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [consentimentos, setConsentimentos] = useState<ConsentimentoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Campos de edição de perfil
  const [editandoDados, setEditandoDados] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [preferenciasAcessibilidade, setPreferenciasAcessibilidade] = useState('');
  const [salvandoDados, setSalvandoDados] = useState(false);

  // Nova forma de pagamento
  const [exibirNovaForma, setExibirNovaForma] = useState(false);
  const [tipoForma, setTipoForma] = useState<'CARTAO' | 'PIX'>('CARTAO');
  const [chavePix, setChavePix] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [salvandoForma, setSalvandoForma] = useState(false);

  // Alterar senha
  const [exibirSenha, setExibirSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // LGPD exclusão
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<Usuario>('/perfil'),
      api.get<FormaPagamento[]>('/formas-pagamento'),
      api.get<ConsentimentoItem[]>('/perfil/consentimentos'),
    ])
      .then(([u, f, c]) => {
        setPerfil(u);
        setFormas(f);
        setConsentimentos(c);
        setNome(u.nome);
        setTelefone(mascaras.telefone(u.telefone));
        setCep(u.cliente?.cep ? mascaras.cep(u.cliente.cep) : '');
        setEndereco(u.cliente?.endereco ?? '');
        setPreferenciasAcessibilidade(u.cliente?.preferenciasAcessibilidade ?? '');
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar seu perfil.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarDadosPessoais(ev: FormEvent) {
    ev.preventDefault();
    setErroAcao('');
    setMensagem('');
    if (nome.trim().length < 3) {
      setErroAcao('Informe seu nome completo.');
      return;
    }
    if (!telefoneValido(telefone)) {
      setErroAcao('Informe um telefone válido com DDD.');
      return;
    }
    if (cep && !cepValido(cep)) {
      setErroAcao('CEP inválido (use 8 dígitos).');
      return;
    }

    setSalvandoDados(true);
    try {
      const atualizado = await api.put<Usuario>('/perfil', {
        nome: nome.trim(),
        telefone,
        cliente: {
          cep,
          endereco,
          preferenciasAcessibilidade,
        },
      });
      setPerfil(atualizado);
      setEditandoDados(false);
      setMensagem('Dados pessoais atualizados com sucesso.');
      await recarregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvandoDados(false);
    }
  }

  async function adicionarForma(ev: FormEvent) {
    ev.preventDefault();
    setSalvandoForma(true);
    setErroAcao('');
    setMensagem('');
    try {
      await api.post('/formas-pagamento', {
        tipo: tipoForma,
        chavePix: tipoForma === 'PIX' ? chavePix.trim() : undefined,
        cartao:
          tipoForma === 'CARTAO'
            ? {
                numero: numeroCartao,
                validade: validadeCartao,
                nomeTitular: nomeTitular.trim(),
              }
            : undefined,
        principal: true,
      });
      setFormas(await api.get<FormaPagamento[]>('/formas-pagamento'));
      setExibirNovaForma(false);
      setChavePix('');
      setNumeroCartao('');
      setValidadeCartao('');
      setNomeTitular('');
      setMensagem('Forma de pagamento adicionada.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao adicionar forma de pagamento.');
    } finally {
      setSalvandoForma(false);
    }
  }

  async function removerForma(id: string) {
    setErroAcao('');
    try {
      await api.delete(`/formas-pagamento/${id}`);
      setFormas((ant) => ant.filter((f) => f.id !== id));
      setMensagem('Forma de pagamento removida.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível remover a forma de pagamento.');
    }
  }

  async function salvarNovaSenha(ev: FormEvent) {
    ev.preventDefault();
    setErroAcao('');
    setMensagem('');
    const msgSenha = erroSenha(novaSenha);
    if (msgSenha) {
      setErroAcao(msgSenha);
      return;
    }
    setSalvandoSenha(true);
    try {
      const res = await api.post<{ mensagem: string }>('/auth/alterar-senha', {
        senhaAtual,
        novaSenha,
      });
      setMensagem(res.mensagem);
      setSenhaAtual('');
      setNovaSenha('');
      setExibirSenha(false);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao alterar senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function alternarConsentimento(finalidade: ConsentimentoItem['finalidade'], concedido: boolean) {
    setErroAcao('');
    try {
      const lista = await api.put<ConsentimentoItem[]>('/perfil/consentimentos', { finalidade, concedido });
      setConsentimentos(lista);
      setMensagem('Preferência de consentimento atualizada.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível alterar o consentimento.');
    }
  }

  async function exportarMeusDados() {
    setErroAcao('');
    try {
      const dados = await api.get<unknown>('/perfil/dados/exportar');
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-dados-viamos.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMensagem('Exportação LGPD concluída (arquivo meus-dados-viamos.json baixado).');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível exportar seus dados.');
    }
  }

  async function confirmarExclusaoConta() {
    setExcluindo(true);
    setErroAcao('');
    try {
      await api.post('/perfil/dados/excluir');
      await sair();
      navigate('/login', { replace: true });
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível excluir a conta.');
      setExcluindo(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando seu perfil…" />;
  if (erro || !perfil) return <EstadoErro mensagem={erro || 'Perfil indisponível.'} aoTentarNovamente={carregar} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Cartão superior de visão geral (fiel ao code (11).html) */}
      <section className="relative flex flex-col items-start gap-5 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-primary-fixed bg-primary-container text-3xl font-bold text-on-primary">
          {perfil.nome.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface">{perfil.nome}</h2>
          <p className="text-base text-on-surface-variant">{perfil.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {perfil.cliente?.cpf && (
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                CPF: {perfil.cliente.cpf}
              </span>
            )}
            <button
              type="button"
              onClick={() => setEditandoDados((v) => !v)}
              className="min-h-touch px-2 text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary-container"
            >
              {editandoDados ? 'Cancelar edição' : 'Editar Dados'}
            </button>
          </div>
        </div>
      </section>

      {/* Formulário de edição de Dados Pessoais */}
      {editandoDados && (
        <Cartao titulo="Editar Dados Cadastrais e Acessibilidade (RF43)">
          <form onSubmit={salvarDadosPessoais} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Campo
                rotulo="Telefone (com DDD)"
                value={telefone}
                onChange={(e) => setTelefone(mascaras.telefone(e.target.value))}
                required
              />
              <Campo rotulo="CEP (opcional)" value={cep} onChange={(e) => setCep(mascaras.cep(e.target.value))} />
              <Campo
                rotulo="Endereço de referência (opcional)"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
            <AreaTexto
              rotulo="Preferências de acessibilidade e comunicação (opcional)"
              placeholder="Ex.: Sinalização pausada, apoio de leitura labial para termos técnicos..."
              maxLength={300}
              value={preferenciasAcessibilidade}
              onChange={(e) => setPreferenciasAcessibilidade(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Botao type="button" variante="secundario" onClick={() => setEditandoDados(false)}>
                Cancelar
              </Botao>
              <Botao type="submit" icone="save" carregando={salvandoDados}>
                Salvar Alterações
              </Botao>
            </div>
          </form>
        </Cartao>
      )}

      {/* Bento Grid: Formas de Pagamento + Segurança (fiel ao code (11).html) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Formas de Pagamento */}
        <Cartao
          titulo="Formas de Pagamento"
          acao={<Icone nome="credit_card" className="text-outline" />}
          className="flex flex-col justify-between"
        >
          <div className="flex flex-col gap-3">
            {formas.length === 0 ? (
              <p className="text-base text-on-surface-variant">Nenhuma forma de pagamento cadastrada.</p>
            ) : (
              formas.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-bright p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icone
                      nome={f.tipo === 'PIX' ? 'account_balance' : 'credit_card'}
                      className="text-primary-container"
                    />
                    <div>
                      <p className="text-base font-semibold text-on-surface">
                        {f.tipo === 'PIX' ? 'Pix Cadastrado' : `${f.bandeira ?? 'Cartão'} •••• ${f.finalCartao}`}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {f.tipo === 'PIX' ? f.chavePix : 'Cartão tokenizado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.principal && (
                      <span className="rounded bg-surface-container px-2 py-0.5 text-xs font-semibold text-secondary">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Remover forma de pagamento"
                      onClick={() => removerForma(f.id)}
                      className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-error hover:bg-error-container/40"
                    >
                      <Icone nome="delete" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {exibirNovaForma && (
              <form onSubmit={adicionarForma} className="mt-2 flex flex-col gap-3 rounded-lg bg-surface-container-low p-3">
                <div className="flex gap-2">
                  {(['CARTAO', 'PIX'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tipoForma === t}
                      onClick={() => setTipoForma(t)}
                      className={`min-h-touch flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                        tipoForma === t
                          ? 'border-primary-container bg-primary-container text-on-primary'
                          : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      {t === 'CARTAO' ? 'Cartão' : 'Pix'}
                    </button>
                  ))}
                </div>
                {tipoForma === 'PIX' ? (
                  <Campo
                    rotulo="Chave Pix"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    required
                  />
                ) : (
                  <>
                    <Campo
                      rotulo="Número do cartão"
                      placeholder="4532 1111 2222 4242"
                      value={numeroCartao}
                      onChange={(e) => setNumeroCartao(mascaras.cartao(e.target.value))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Campo
                        rotulo="Validade (MM/AA)"
                        placeholder="12/28"
                        value={validadeCartao}
                        onChange={(e) => setValidadeCartao(mascaras.validade(e.target.value))}
                        required
                      />
                      <Campo
                        rotulo="Titular"
                        value={nomeTitular}
                        onChange={(e) => setNomeTitular(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <Botao type="submit" icone="save" carregando={salvandoForma}>
                  Salvar
                </Botao>
              </form>
            )}
          </div>

          <div className="mt-4">
            <Botao
              type="button"
              variante="secundario"
              largo
              icone={exibirNovaForma ? 'close' : 'add'}
              onClick={() => setExibirNovaForma((v) => !v)}
            >
              {exibirNovaForma ? 'Fechar formulário' : 'Adicionar Pagamento'}
            </Botao>
          </div>
        </Cartao>

        {/* Segurança */}
        <Cartao
          titulo="Segurança"
          acao={<Icone nome="security" className="text-outline" />}
          className="flex flex-col justify-between"
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setExibirSenha((v) => !v)}
              className="flex min-h-touch w-full items-center justify-between rounded-lg p-3 text-left transition hover:bg-surface-container-low"
            >
              <span className="flex items-center gap-3 font-medium text-on-surface">
                <Icone nome="lock" className="text-on-surface-variant" />
                Alterar Senha
              </span>
              <Icone nome={exibirSenha ? 'expand_less' : 'chevron_right'} className="text-outline" />
            </button>

            {exibirSenha && (
              <form onSubmit={salvarNovaSenha} className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-3">
                <Campo
                  rotulo="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
                <Campo
                  rotulo="Nova senha (8 a 72 caracteres)"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <Botao type="submit" icone="key" carregando={salvandoSenha}>
                  Confirmar Nova Senha
                </Botao>
              </form>
            )}

            <div className="flex min-h-touch items-center justify-between rounded-lg p-3 text-on-surface-variant">
              <span className="flex items-center gap-3">
                <Icone nome="verified_user" />
                Sessão protegida com JWT revogável
              </span>
              <Icone nome="check_circle" className="text-status-online" />
            </div>
          </div>

          <div className="mt-4 border-t border-outline-variant/60 pt-4">
            {!confirmarExclusao ? (
              <button
                type="button"
                onClick={() => setConfirmarExclusao(true)}
                className="flex min-h-touch w-full items-center gap-3 rounded-lg p-3 text-left font-medium text-error transition hover:bg-error-container/40"
              >
                <Icone nome="delete_forever" />
                Excluir Conta (LGPD)
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-error/40 bg-error-container/25 p-3">
                <p className="text-sm text-on-error-container">
                  Seus dados pessoais serão anonimizados imediatamente e suas sessões encerradas. Deseja prosseguir?
                </p>
                <div className="flex gap-2">
                  <Botao type="button" variante="perigo" carregando={excluindo} onClick={confirmarExclusaoConta}>
                    Confirmar Exclusão
                  </Botao>
                  <Botao type="button" variante="secundario" onClick={() => setConfirmarExclusao(false)}>
                    Cancelar
                  </Botao>
                </div>
              </div>
            )}
          </div>
        </Cartao>
      </div>

      {/* Privacidade e Direitos LGPD (RF45 / RNF09) */}
      <Cartao
        titulo="Privacidade e Direitos do Titular (LGPD — RF45)"
        acao={
          <Botao type="button" variante="secundario" icone="download" onClick={exportarMeusDados}>
            Exportar Meus Dados (JSON)
          </Botao>
        }
      >
        <div className="flex flex-col gap-3">
          {consentimentos.map((c) => {
            const info = ROTULOS_CONSENTIMENTO[c.finalidade];
            return (
              <div
                key={c.finalidade}
                className="flex flex-col justify-between gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low p-3.5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-base font-semibold text-on-surface">{info.titulo}</p>
                  <p className="text-sm text-on-surface-variant">{info.descricao}</p>
                  {c.concedidoEm && (
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      Vigente desde {formato.dataHora(c.concedidoEm)} (versão {c.versaoTermo ?? '1.0'})
                    </p>
                  )}
                </div>
                {info.obrigatorio ? (
                  <span className="self-start rounded-full bg-status-online/15 px-3 py-1 text-xs font-semibold text-status-online sm:self-center">
                    Obrigatório ativo
                  </span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={c.concedido}
                    onClick={() => alternarConsentimento(c.finalidade, !c.concedido)}
                    className={`min-h-touch rounded-full px-4 py-2 text-sm font-semibold transition ${
                      c.concedido
                        ? 'bg-status-online text-white'
                        : 'border border-outline bg-surface-container-lowest text-on-surface'
                    }`}
                  >
                    {c.concedido ? 'Concedido' : 'Revogado'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Cartao>
    </div>
  );
}
