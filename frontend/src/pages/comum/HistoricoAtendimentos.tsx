/**
 * Histórico de Atendimentos com Filtros e Comprovante PDF (RF39, RF37, protótipo Stitch code (13).html).
 * Compartilhada entre:
 *   - /cliente/historico
 *   - /interprete/historico
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import {
  ICONE_TIPO_SERVICO,
  type ItemHistoricoAtendimento,
  type StatusAtendimento,
  type TipoServico,
} from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { Alerta, Botao, Campo, Carregando, Cartao, Chip, EstadoErro, EstadoVazio, Icone, Selecao } from '../../components/ui';
import { formato } from '../../utils/formato';

export function HistoricoAtendimentos() {
  const { usuario } = useAuth();
  const souCliente = usuario?.papel === 'CLIENTE';

  const [itens, setItens] = useState<ItemHistoricoAtendimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroPdf, setErroPdf] = useState('');

  const [exibirFiltros, setExibirFiltros] = useState(false);
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [tipoServico, setTipoServico] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const carregar = useCallback(
    (filtros?: { de?: string; ate?: string; tipoServico?: string; status?: string }) => {
      setCarregando(true);
      setErro('');
      const f = filtros ?? { de, ate, tipoServico, status };
      const params = new URLSearchParams();
      if (f.de) params.set('de', f.de);
      if (f.ate) params.set('ate', f.ate);
      if (f.tipoServico) params.set('tipoServico', f.tipoServico);
      if (f.status) params.set('status', f.status);
      const qs = params.toString();

      api
        .get<ItemHistoricoAtendimento[]>(`/atendimentos${qs ? `?${qs}` : ''}`)
        .then(setItens)
        .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar histórico de atendimentos.'))
        .finally(() => setCarregando(false));
    },
    [de, ate, tipoServico, status],
  );

  useEffect(() => {
    carregar({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarFiltros(ev: FormEvent) {
    ev.preventDefault();
    carregar({ de, ate, tipoServico, status });
  }

  function filtrarMesAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const inicioMes = `${ano}-${mes}-01`;
    const ultimoDia = new Date(ano, agora.getMonth() + 1, 0).getDate();
    const fimMes = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
    setDe(inicioMes);
    setAte(fimMes);
    carregar({ de: inicioMes, ate: fimMes, tipoServico, status });
  }

  function limparFiltros() {
    setDe('');
    setAte('');
    setTipoServico('');
    setStatus('');
    carregar({ de: '', ate: '', tipoServico: '', status: '' });
  }

  async function abrirComprovante(atendimentoId: string) {
    setErroPdf('');
    try {
      await api.abrirArquivo(`/atendimentos/${atendimentoId}/comprovante.pdf`);
    } catch (e) {
      setErroPdf(e instanceof ErroApi ? e.mensagem : 'Não foi possível abrir o comprovante PDF.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho fiel ao code (13).html */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary">Histórico de Atendimentos</h1>
          <p className="text-base text-on-surface-variant">
            Acompanhe seus registros de serviços presenciais e acesse comprovantes de Acessibilidade Garantida.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Botao
            type="button"
            variante="secundario"
            icone="filter_list"
            onClick={() => setExibirFiltros((v) => !v)}
          >
            {exibirFiltros ? 'Ocultar filtros' : 'Filtrar'}
          </Botao>
          <Botao type="button" variante="secundario" icone="calendar_month" onClick={filtrarMesAtual}>
            Mês Atual
          </Botao>
        </div>
      </header>

      {erroPdf && <Alerta tipo="erro">{erroPdf}</Alerta>}

      {/* Painel de Filtros (RF39) */}
      {exibirFiltros && (
        <Cartao titulo="Filtrar Atendimentos (RF39)">
          <form onSubmit={aplicarFiltros} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Campo rotulo="De (data inicial)" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
            <Campo rotulo="Até (data final)" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
            <Selecao
              rotulo="Tipo de serviço"
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value as TipoServico | '')}
              opcoes={[
                { valor: '', rotulo: 'Todos os tipos' },
                { valor: 'SAUDE', rotulo: 'Saúde' },
                { valor: 'EDUCACAO', rotulo: 'Educação' },
                { valor: 'JURIDICO', rotulo: 'Jurídico' },
                { valor: 'EVENTO', rotulo: 'Evento / Palestra' },
                { valor: 'OUTRO', rotulo: 'Outro' },
              ]}
            />
            <Selecao
              rotulo="Situação"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusAtendimento | '')}
              opcoes={[
                { valor: '', rotulo: 'Todas as situações' },
                { valor: 'AGENDADO', rotulo: 'Agendado' },
                { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
                { valor: 'CONCLUIDO', rotulo: 'Concluído' },
                { valor: 'CANCELADO', rotulo: 'Cancelado' },
              ]}
            />
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2 md:col-span-4">
              <Botao type="button" variante="secundario" onClick={limparFiltros}>
                Limpar filtros
              </Botao>
              <Botao type="submit" icone="search">
                Aplicar filtros
              </Botao>
            </div>
          </form>
        </Cartao>
      )}

      {carregando ? (
        <Carregando texto="Carregando histórico de atendimentos…" />
      ) : erro ? (
        <EstadoErro mensagem={erro} aoTentarNovamente={() => carregar()} />
      ) : itens.length === 0 ? (
        <EstadoVazio
          icone="history"
          titulo="Nenhum atendimento encontrado"
          descricao="Não há atendimentos registrados para os filtros selecionados."
          acao={
            souCliente ? (
              <Link to="/cliente/solicitacoes/nova">
                <Botao icone="add">Solicitar Intérprete</Botao>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {itens.map((item) => {
            const rotaDetalhe = souCliente ? `/cliente/atendimentos/${item.id}` : `/interprete/atendimentos/${item.id}`;
            return (
              <article
                key={item.id}
                className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary">
                      <Icone nome={ICONE_TIPO_SERVICO[item.tipoServico]} />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-primary">{item.tipoServicoRotulo}</h2>
                      <p className="text-sm text-on-surface-variant">
                        {formato.dataHora(item.inicioPrevisto)} · {formato.duracao(item.duracaoRealMin ?? item.duracaoPrevistaMin)}
                      </p>
                    </div>
                  </div>
                  <Chip status={item.status}>{item.status}</Chip>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary-fixed text-sm font-bold text-on-primary-fixed">
                      {item.contraparte.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        {souCliente ? 'Intérprete' : 'Cliente'}
                      </p>
                      <p className="text-base font-semibold text-on-surface">{item.contraparte}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Valor</p>
                    <p className="text-base font-bold text-primary-container">{formato.moeda(item.valorFinal)}</p>
                  </div>
                </div>

                <p className="truncate text-sm text-on-surface-variant">
                  <Icone nome="location_on" className="mr-1 align-middle text-[16px]" />
                  {item.endereco}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Link to={rotaDetalhe} className="flex-1">
                    <Botao variante="secundario" largo icone="visibility">
                      Ver Detalhes
                    </Botao>
                  </Link>
                  {item.comprovanteDisponivel && (
                    <Botao
                      type="button"
                      className="flex-1"
                      icone="receipt_long"
                      onClick={() => abrirComprovante(item.id)}
                    >
                      Comprovante
                    </Botao>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
