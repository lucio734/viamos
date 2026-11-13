/**
 * Ganhos da Semana, Extrato Financeiro, Conta Bancária e Repasse — Intérprete (RF26, RF27).
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { ContaBancaria, RepasseItem, ResumoGanhos } from '../../api/tipos';
import { Alerta, Botao, Campo, Carregando, Cartao, Chip, EstadoErro, EstadoVazio, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

export function GanhosInterprete() {
  const [ganhos, setGanhos] = useState<ResumoGanhos | null>(null);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [repasses, setRepasses] = useState<RepasseItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [exibirFormConta, setExibirFormConta] = useState(false);
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [titular, setTitular] = useState('');
  const [chavePix, setChavePix] = useState('');

  const [salvandoConta, setSalvandoConta] = useState(false);
  const [solicitandoRepasse, setSolicitandoRepasse] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<ResumoGanhos>('/interprete/ganhos'),
      api.get<ContaBancaria[]>('/interprete/contas-bancarias'),
      api.get<RepasseItem[]>('/interprete/repasses'),
    ])
      .then(([g, c, r]) => {
        setGanhos(g);
        setContas(c);
        setRepasses(r);
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar extrato financeiro.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarContaBancaria(ev: FormEvent) {
    ev.preventDefault();
    setSalvandoConta(true);
    setErroAcao('');
    setMensagem('');
    try {
      await api.post('/interprete/contas-bancarias', {
        banco: banco.trim(),
        agencia: agencia.trim(),
        conta: conta.trim(),
        titular: titular.trim(),
        chavePix: chavePix.trim() || undefined,
      });
      setMensagem('Conta bancária principal cadastrada com sucesso.');
      setExibirFormConta(false);
      setBanco('');
      setAgencia('');
      setConta('');
      setTitular('');
      setChavePix('');
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar a conta bancária.');
    } finally {
      setSalvandoConta(false);
    }
  }

  async function solicitarRepasse() {
    setSolicitandoRepasse(true);
    setErroAcao('');
    setMensagem('');
    try {
      const res = await api.post<{ valor: number; mensagem: string }>('/interprete/repasses');
      setMensagem(`Repasse de ${formato.moeda(res.valor)} processado! ${res.mensagem}`);
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível solicitar o repasse.');
    } finally {
      setSolicitandoRepasse(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando seus ganhos e repasses…" />;
  if (erro || !ganhos) return <EstadoErro mensagem={erro || 'Falha ao carregar ganhos.'} aoTentarNovamente={carregar} />;

  const contaPrincipal = contas.find((c) => c.principal) ?? contas[0] ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">Ganhos e Repasses</h1>
          <p className="text-base text-on-surface-variant">
            Acompanhe seus ganhos da semana (RF26), cadastre sua conta bancária e solicite repasses (RF27).
          </p>
        </div>
        <Link to="/interprete/historico">
          <Botao variante="secundario" icone="history">
            Histórico de Atendimentos
          </Botao>
        </Link>
      </header>

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Indicadores Financeiros (RF26) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-xl bg-primary-container p-5 text-on-primary shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-container">Ganhos na Semana</p>
          <p className="mt-1 text-3xl font-bold">{formato.moeda(ganhos.semana.recebido)}</p>
          <p className="mt-2 text-sm text-on-primary-container">
            {ganhos.semana.atendimentos} atendimento(s) · {ganhos.semana.horas}h realizadas
          </p>
        </section>

        <Cartao className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Saldo Disponível para Repasse
            </p>
            <p className="mt-1 text-3xl font-bold text-status-online">{formato.moeda(ganhos.saldoDisponivel)}</p>
          </div>
          <div className="mt-3">
            <Botao
              type="button"
              icone="payments"
              largo
              carregando={solicitandoRepasse}
              disabled={ganhos.saldoDisponivel <= 0}
              onClick={solicitarRepasse}
            >
              Solicitar Repasse
            </Botao>
          </div>
        </Cartao>

        <Cartao>
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            A Receber (Aguardando Pagamento)
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{formato.moeda(ganhos.aReceber)}</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Atendimentos concluídos cujo pagamento pelo cliente está pendente.
          </p>
        </Cartao>
      </div>

      {/* Conta Bancária / Pix para Repasse (RF27) */}
      <Cartao
        titulo="Conta Bancária para Recebimento (RF27)"
        acao={
          <Botao
            type="button"
            variante="secundario"
            icone={exibirFormConta ? 'close' : 'account_balance'}
            onClick={() => setExibirFormConta((v) => !v)}
          >
            {exibirFormConta ? 'Fechar' : contaPrincipal ? 'Alterar conta' : 'Cadastrar conta'}
          </Botao>
        }
      >
        {contaPrincipal ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center gap-3">
              <Icone nome="account_balance" className="text-2xl text-primary-container" />
              <div>
                <p className="text-base font-bold text-on-surface">
                  {contaPrincipal.banco} · Ag. {contaPrincipal.agencia} · Conta {contaPrincipal.conta}
                </p>
                <p className="text-sm text-on-surface-variant">
                  Titular: {contaPrincipal.titular}
                  {contaPrincipal.chavePix ? ` · Chave Pix: ${contaPrincipal.chavePix}` : ''}
                </p>
              </div>
            </div>
            <Chip status="APROVADO">Conta Principal</Chip>
          </div>
        ) : (
          <p className="text-base text-on-surface-variant">
            Cadastre uma conta bancária para poder transferir seu saldo disponível.
          </p>
        )}

        {exibirFormConta && (
          <form onSubmit={salvarContaBancaria} className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2">
            <Campo
              rotulo="Banco (nome ou código)"
              placeholder="Ex.: 001 - Banco do Brasil / Nubank"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              required
            />
            <Campo
              rotulo="Titular da conta"
              placeholder="Nome completo ou razão social"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              required
            />
            <Campo
              rotulo="Agência"
              placeholder="0001"
              value={agencia}
              onChange={(e) => setAgencia(e.target.value)}
              required
            />
            <Campo
              rotulo="Conta com dígito"
              placeholder="12345-6"
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              required
            />
            <Campo
              className="sm:col-span-2"
              rotulo="Chave Pix vinculada (opcional)"
              placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
            />
            <div className="flex justify-end sm:col-span-2">
              <Botao type="submit" icone="save" carregando={salvandoConta}>
                Salvar Conta Principal
              </Botao>
            </div>
          </form>
        )}
      </Cartao>

      {/* Histórico de Repasses Solicitados */}
      {repasses.length > 0 && (
        <Cartao titulo="Repasses Solicitados">
          <ul className="divide-y divide-outline-variant/50">
            {repasses.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-base font-semibold text-on-surface">
                    Transferência de {formato.moeda(r.valor)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Solicitado em {formato.dataHora(r.solicitadoEm)}
                    {r.referenciaGateway ? ` · Ref.: ${r.referenciaGateway}` : ''}
                  </p>
                </div>
                <Chip status={r.status}>{r.status}</Chip>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      {/* Extrato de Lançamentos Financeiros */}
      <Cartao titulo="Extrato Completo de Lançamentos">
        {ganhos.extrato.length === 0 ? (
          <EstadoVazio
            icone="receipt_long"
            titulo="Nenhum lançamento financeiro registrado"
            descricao="Seus créditos por atendimentos concluídos e pagos aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-outline-variant/50">
            {ganhos.extrato.map((item) => {
              const positivo = item.valor >= 0;
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        positivo ? 'bg-status-online/15 text-status-online' : 'bg-primary-fixed text-on-primary-fixed'
                      }`}
                    >
                      <Icone nome={positivo ? 'arrow_downward' : 'arrow_upward'} />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-on-surface">
                        {item.descricao ?? (item.tipo === 'CREDITO_ATENDIMENTO' ? 'Crédito de atendimento' : 'Repasse bancário')}
                      </p>
                      <p className="text-xs text-on-surface-variant">{formato.dataHora(item.data)}</p>
                    </div>
                  </div>
                  <span className={`text-base font-bold ${positivo ? 'text-status-online' : 'text-on-surface'}`}>
                    {positivo ? '+' : ''}
                    {formato.moeda(item.valor)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
