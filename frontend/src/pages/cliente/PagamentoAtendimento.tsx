/**
 * Pagamento do Atendimento — Visão do Cliente (RF35, RF36, RF37).
 * Permite usar forma salva (Pix ou Cartão), adicionar nova forma com máscaras,
 * processar pagamento de maneira idempotente, tratar recusa (HTTP 402) e emitir o comprovante PDF.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { DetalheAtendimento, FormaPagamento } from '../../api/tipos';
import { Alerta, Botao, Campo, Carregando, Cartao, Chip, EstadoErro, Icone } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';

interface RespostaPagamento {
  id: string;
  status: 'PAGO' | 'FALHOU';
  valor: number;
  meio: string;
  mensagem: string;
  confirmadoEm: string | null;
  repetido?: boolean;
  comprovanteCodigo?: string;
}

export function PagamentoAtendimento() {
  const { id } = useParams<{ id: string }>();

  const [atendimento, setAtendimento] = useState<DetalheAtendimento | null>(null);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [selecao, setSelecao] = useState<string>('PIX_AVULSO');
  const [exibirNovaForma, setExibirNovaForma] = useState(false);
  const [novoTipo, setNovoTipo] = useState<'PIX' | 'CARTAO'>('CARTAO');
  const [chavePix, setChavePix] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [salvarComoPrincipal, setSalvarComoPrincipal] = useState(true);

  const [salvandoForma, setSalvandoForma] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erroPagamento, setErroPagamento] = useState('');

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<DetalheAtendimento>(`/atendimentos/${id}`),
      api.get<FormaPagamento[]>('/formas-pagamento'),
    ])
      .then(([at, listaFormas]) => {
        setAtendimento(at);
        setFormas(listaFormas);
        const principal = listaFormas.find((f) => f.principal) ?? listaFormas[0];
        if (principal) setSelecao(principal.id);
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar dados de pagamento.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionarForma(ev: FormEvent) {
    ev.preventDefault();
    setSalvandoForma(true);
    setErroPagamento('');
    try {
      const criada = await api.post<FormaPagamento>('/formas-pagamento', {
        tipo: novoTipo,
        chavePix: novoTipo === 'PIX' ? chavePix.trim() : undefined,
        cartao:
          novoTipo === 'CARTAO'
            ? {
                numero: numeroCartao,
                validade: validadeCartao,
                nomeTitular: nomeTitular.trim(),
              }
            : undefined,
        principal: salvarComoPrincipal,
      });
      const atualizadas = await api.get<FormaPagamento[]>('/formas-pagamento');
      setFormas(atualizadas);
      setSelecao(criada.id);
      setExibirNovaForma(false);
      setChavePix('');
      setNumeroCartao('');
      setValidadeCartao('');
      setNomeTitular('');
      setMensagemSucesso('Forma de pagamento cadastrada com sucesso.');
    } catch (e) {
      setErroPagamento(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar a forma de pagamento.');
    } finally {
      setSalvandoForma(false);
    }
  }

  async function confirmarPagamento() {
    if (!atendimento?.pagamento) return;
    setProcessando(true);
    setErroPagamento('');
    setMensagemSucesso('');
    try {
      const corpo = selecao === 'PIX_AVULSO' ? { meio: 'PIX' } : { formaPagamentoId: selecao };
      const res = await api.post<RespostaPagamento>(`/pagamentos/${atendimento.pagamento.id}/processar`, corpo);
      setMensagemSucesso(
        res.repetido
          ? 'Este pagamento já havia sido confirmado anteriormente (idempotência garantida — sem cobrança duplicada).'
          : `${res.mensagem} Comprovante de Acessibilidade Garantida emitido!`,
      );
      carregar();
    } catch (e) {
      if (e instanceof ErroApi) {
        setErroPagamento(
          e.status === 402
            ? `Pagamento recusado pelo gateway: ${e.mensagem} Escolha outra forma de pagamento ou tente via Pix.`
            : e.mensagem,
        );
      } else {
        setErroPagamento('Falha ao processar o pagamento.');
      }
      carregar();
    } finally {
      setProcessando(false);
    }
  }

  async function abrirComprovante() {
    if (!id) return;
    try {
      await api.abrirArquivo(`/atendimentos/${id}/comprovante.pdf`);
    } catch (e) {
      setErroPagamento(e instanceof ErroApi ? e.mensagem : 'Não foi possível abrir o comprovante PDF.');
    }
  }

  if (carregando) return <Carregando texto="Carregando informações de pagamento…" />;
  if (erro || !atendimento) return <EstadoErro mensagem={erro || 'Atendimento não encontrado.'} aoTentarNovamente={carregar} />;

  const jaPago = atendimento.pagamento?.status === 'PAGO';
  const valorCobrado = atendimento.pagamento?.valor ?? atendimento.valorFinal ?? atendimento.valorEstimado ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2">
        <Link
          to={`/cliente/atendimentos/${atendimento.id}`}
          aria-label="Voltar ao atendimento"
          className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
        >
          <Icone nome="arrow_back" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Pagamento do Atendimento</h1>
          <p className="text-base text-on-surface-variant">
            {atendimento.tipoServicoRotulo} · Intérprete {atendimento.interprete.nome}
          </p>
        </div>
      </header>

      {mensagemSucesso && <Alerta tipo="sucesso">{mensagemSucesso}</Alerta>}
      {erroPagamento && <Alerta tipo="erro">{erroPagamento}</Alerta>}

      {/* Resumo Financeiro */}
      <Cartao titulo="Resumo da Cobrança (RF36)">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-base">
            <span className="text-on-surface-variant">Situação do atendimento</span>
            <Chip status={atendimento.status}>{atendimento.status}</Chip>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="text-on-surface-variant">Duração contratada / real</span>
            <span className="font-semibold">
              {formato.duracao(atendimento.duracaoPrevistaMin)} / {formato.duracao(atendimento.duracaoRealMin)}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="text-on-surface-variant">Status do pagamento</span>
            <Chip status={atendimento.pagamento?.status ?? 'PENDENTE'}>
              {atendimento.pagamento?.status ?? 'AGUARDANDO ENCERRAMENTO'}
            </Chip>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-outline-variant/60 pt-3">
            <span className="text-lg font-bold text-primary">Valor total a pagar</span>
            <span className="text-2xl font-bold text-primary-container">{formato.moeda(valorCobrado)}</span>
          </div>
        </div>
      </Cartao>

      {!atendimento.pagamento ? (
        <Cartao>
          <Alerta tipo="aviso">
            O pagamento é liberado automaticamente assim que o atendimento presencial for encerrado.
          </Alerta>
          <div className="mt-4">
            <Link to={`/cliente/atendimentos/${atendimento.id}`}>
              <Botao variante="secundario" icone="arrow_back">
                Voltar ao Atendimento
              </Botao>
            </Link>
          </div>
        </Cartao>
      ) : jaPago ? (
        <Cartao titulo="Pagamento Confirmado e Comprovante Emitido (RF37)">
          <p className="text-base text-on-surface-variant">
            Pagamento confirmado em <strong>{formato.dataHora(atendimento.pagamento.confirmadoEm)}</strong> via{' '}
            <strong>{atendimento.pagamento.meio ?? 'PIX'}</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Botao icone="receipt_long" onClick={abrirComprovante}>
              Baixar Comprovante PDF
            </Botao>
            {!atendimento.avaliacoes.minhaAvaliacaoFeita && (
              <Link to={`/cliente/atendimentos/${atendimento.id}/avaliar`}>
                <Botao variante="secundario" icone="star">
                  Avaliar Intérprete
                </Botao>
              </Link>
            )}
            <Link to="/cliente/historico">
              <Botao variante="secundario" icone="history">
                Ir para o Histórico
              </Botao>
            </Link>
          </div>
        </Cartao>
      ) : (
        <>
          <Cartao
            titulo="Escolha a Forma de Pagamento (RF35)"
            acao={
              <Botao
                type="button"
                variante="secundario"
                icone={exibirNovaForma ? 'close' : 'add'}
                onClick={() => setExibirNovaForma((v) => !v)}
              >
                {exibirNovaForma ? 'Fechar' : 'Nova forma'}
              </Botao>
            }
          >
            <div role="radiogroup" aria-label="Formas de pagamento" className="flex flex-col gap-2.5">
              {/* Opção Pix imediato */}
              <button
                type="button"
                role="radio"
                aria-checked={selecao === 'PIX_AVULSO'}
                onClick={() => setSelecao('PIX_AVULSO')}
                className={`flex min-h-touch items-center justify-between rounded-xl border p-3.5 text-left transition ${
                  selecao === 'PIX_AVULSO'
                    ? 'border-primary-container bg-primary-fixed/40 text-on-primary-fixed'
                    : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icone nome="qr_code_2" className="text-2xl text-status-online" />
                  <div>
                    <p className="text-base font-semibold">Pix Imediato (aprovação instantânea)</p>
                    <p className="text-sm text-on-surface-variant">Gera e confirma o pagamento via Pix na hora</p>
                  </div>
                </div>
                <Icone nome={selecao === 'PIX_AVULSO' ? 'radio_button_checked' : 'radio_button_unchecked'} />
              </button>

              {/* Formas salvas do cliente */}
              {formas.map((f) => {
                const ativo = selecao === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => setSelecao(f.id)}
                    className={`flex min-h-touch items-center justify-between rounded-xl border p-3.5 text-left transition ${
                      ativo
                        ? 'border-primary-container bg-primary-fixed/40 text-on-primary-fixed'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icone
                        nome={f.tipo === 'PIX' ? 'account_balance' : 'credit_card'}
                        className="text-2xl text-primary-container"
                      />
                      <div>
                        <p className="text-base font-semibold">
                          {f.tipo === 'PIX' ? `Pix salvo (${f.chavePix})` : `${f.bandeira ?? 'Cartão'} •••• ${f.finalCartao}`}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {f.principal ? 'Forma principal cadastrada' : 'Forma salva no perfil'}
                        </p>
                      </div>
                    </div>
                    <Icone nome={ativo ? 'radio_button_checked' : 'radio_button_unchecked'} />
                  </button>
                );
              })}
            </div>

            {exibirNovaForma && (
              <form
                onSubmit={adicionarForma}
                className="mt-4 flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4"
              >
                <h3 className="text-base font-semibold text-primary">Cadastrar nova forma de pagamento</h3>
                <div className="flex gap-2">
                  {(['CARTAO', 'PIX'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={novoTipo === t}
                      onClick={() => setNovoTipo(t)}
                      className={`min-h-touch flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                        novoTipo === t
                          ? 'border-primary-container bg-primary-container text-on-primary'
                          : 'border-outline-variant bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      {t === 'CARTAO' ? 'Cartão de Crédito' : 'Chave Pix'}
                    </button>
                  ))}
                </div>

                {novoTipo === 'PIX' ? (
                  <Campo
                    rotulo="Chave Pix (CPF, e-mail, telefone ou aleatória)"
                    icone="key"
                    placeholder="Ex.: marina.surda@viamos.local"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    required
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Campo
                      className="sm:col-span-2"
                      rotulo="Número do cartão"
                      icone="credit_card"
                      placeholder="4532 1111 2222 4242"
                      value={numeroCartao}
                      onChange={(e) => setNumeroCartao(mascaras.cartao(e.target.value))}
                      ajuda="Dica de demonstração: final 0000 simula recusa do gateway (HTTP 402)."
                      required
                    />
                    <Campo
                      rotulo="Validade (MM/AA)"
                      placeholder="12/28"
                      value={validadeCartao}
                      onChange={(e) => setValidadeCartao(mascaras.validade(e.target.value))}
                      required
                    />
                    <Campo
                      rotulo="Nome no cartão"
                      placeholder="MARINA S OLIVEIRA"
                      value={nomeTitular}
                      onChange={(e) => setNomeTitular(e.target.value)}
                      required
                    />
                  </div>
                )}

                <label className="flex min-h-touch items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={salvarComoPrincipal}
                    onChange={(e) => setSalvarComoPrincipal(e.target.checked)}
                    className="size-5 rounded border-outline text-primary-container"
                  />
                  Definir como forma de pagamento principal
                </label>

                <div className="flex justify-end gap-2">
                  <Botao type="submit" icone="save" carregando={salvandoForma}>
                    Salvar forma de pagamento
                  </Botao>
                </div>
              </form>
            )}
          </Cartao>

          <Botao
            type="button"
            icone="lock"
            largo
            carregando={processando}
            onClick={confirmarPagamento}
          >
            Confirmar Pagamento de {formato.moeda(valorCobrado)}
          </Botao>
        </>
      )}
    </div>
  );
}
