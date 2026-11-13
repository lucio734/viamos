/**
 * Hub do Intérprete de Libras (RF20, RF24, RF26, RNF36, protótipo Stitch code (1).html).
 * Exibe:
 *   - Chave Online/Offline (PUT /interprete/configuracao)
 *   - Status da habilitação documental (EM_ANALISE, APROVADO, REPROVADO, CORRECAO_SOLICITADA)
 *   - Mapa de solicitações em até 15 km + lista de solicitações pendentes com Aceitar/Recusar
 *   - Cartão "Ganhos da Semana" (RF26) e "Próximo Atendimento" com atalho para Check-in Digital
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type ResumoGanhos, type ResumoHubInterprete } from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { CENTRO_PADRAO, Mapa, type MarcadorExtra } from '../../components/Mapa';
import { Alerta, Botao, Carregando, Cartao, Chip, EstadoErro, EstadoVazio, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

export function HubInterprete() {
  const { usuario, recarregar } = useAuth();
  const navigate = useNavigate();

  const [dados, setDados] = useState<ResumoHubInterprete | null>(null);
  const [ganhos, setGanhos] = useState<ResumoGanhos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [alternandoOnline, setAlternandoOnline] = useState(false);
  const [acaoDemandaId, setAcaoDemandaId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<ResumoHubInterprete>('/interprete/hub'),
      api.get<ResumoGanhos>('/interprete/ganhos').catch(() => null),
    ])
      .then(([h, g]) => {
        setDados(h);
        setGanhos(g);
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar o painel do intérprete.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternarDisponibilidade() {
    if (!dados) return;
    setAlternandoOnline(true);
    setErroAcao('');
    try {
      const novo = !dados.disponivelAgora;
      await api.put('/interprete/configuracao', { disponivelAgora: novo });
      setDados({ ...dados, disponivelAgora: novo });
      await recarregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível alterar seu status online.');
    } finally {
      setAlternandoOnline(false);
    }
  }

  async function aceitarDemanda(solicitacaoId: string) {
    setAcaoDemandaId(solicitacaoId);
    setErroAcao('');
    setMensagem('');
    try {
      const res = await api.post<{ atendimentoId: string; mensagem: string }>(`/demandas/${solicitacaoId}/aceitar`);
      navigate(`/interprete/atendimentos/${res.atendimentoId}`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível aceitar a solicitação.');
      carregar();
    } finally {
      setAcaoDemandaId(null);
    }
  }

  async function recusarDemanda(solicitacaoId: string) {
    setAcaoDemandaId(solicitacaoId);
    setErroAcao('');
    try {
      await api.post(`/demandas/${solicitacaoId}/recusar`, { motivo: 'Indisponível no horário' });
      setMensagem('Solicitação recusada. Ela permanece disponível para outros intérpretes próximos.');
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível recusar a solicitação.');
    } finally {
      setAcaoDemandaId(null);
    }
  }

  if (carregando) return <Carregando texto="Carregando seu painel de intérprete…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Falha ao carregar.'} aoTentarNovamente={carregar} />;

  const basePonto = usuario?.interprete
    ? { lat: usuario.interprete.latitudeBase, lng: usuario.interprete.longitudeBase }
    : CENTRO_PADRAO;

  const marcadoresDemandas: MarcadorExtra[] = dados.demandasPendentes.map((d) => ({
    id: d.id,
    lat: d.latitude,
    lng: d.longitude,
    rotulo: `${d.tipoServicoRotulo} (${formato.distancia(d.distanciaKm)})`,
  }));

  const proximo = dados.proximosAtendimentos[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho e Toggle Online/Offline (fiel ao code (1).html) */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-primary">Olá, {(dados.nome ?? usuario?.nome ?? 'Intérprete').split(' ')[0]}!</h1>
            {dados.statusHabilitacao === 'APROVADO' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-semibold text-on-tertiary-fixed">
                <Icone nome="verified" preenchido className="text-[16px] text-pro-verification" />
                Prolibras Verificado
              </span>
            ) : (
              <Chip status={dados.statusHabilitacao}>{dados.statusHabilitacao.replace('_', ' ')}</Chip>
            )}
          </div>
          <p className="mt-1 text-base text-on-surface-variant">
            Gerencie sua disponibilidade e solicitações presenciais no raio de {dados.raioKm} km.
          </p>
        </div>

        {/* Switch Online / Offline */}
        <div className="flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 shadow-xs">
          <span className={`text-sm font-bold ${dados.disponivelAgora ? 'text-status-online' : 'text-on-surface-variant'}`}>
            {dados.disponivelAgora ? 'Online' : 'Offline'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={dados.disponivelAgora}
            aria-label="Alternar disponibilidade online para novas demandas"
            disabled={alternandoOnline}
            onClick={alternarDisponibilidade}
            className={`relative inline-flex min-h-touch w-14 items-center rounded-full p-1 transition ${
              dados.disponivelAgora ? 'bg-status-online' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`inline-block size-6 transform rounded-full bg-white shadow-xs transition ${
                dados.disponivelAgora ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Aviso de status de habilitação (RF06 / RNF36) */}
      {dados.statusHabilitacao !== 'APROVADO' && (
        <Alerta tipo={dados.statusHabilitacao === 'EM_ANALISE' ? 'aviso' : 'erro'}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {dados.statusHabilitacao === 'EM_ANALISE'
                ? 'Sua certificação Prolibras/equivalente está em análise pelo backoffice (RF06). Assim que aprovada, as demandas próximas aparecerão aqui.'
                : 'Sua documentação requer atenção ou reenvio para liberar o aceite de demandas presenciais.'}
            </span>
            <Link to="/interprete/perfil" className="font-bold underline">
              Ver documentação
            </Link>
          </div>
        </Alerta>
      )}

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Grid principal (2/3 Mapa e Demandas · 1/3 Ganhos e Próximo Atendimento — code (1).html) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Cartão do Mapa de Solicitações */}
          <Cartao
            titulo="Mapa de Solicitações"
            acao={
              <Link
                to="/interprete/agenda"
                className="inline-flex min-h-touch items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary hover:bg-surface-container-high"
              >
                <Icone nome="tune" className="text-[16px]" />
                Raio: {dados.raioKm} km
              </Link>
            }
          >
            <Mapa
              posicao={basePonto}
              raioKm={dados.raioKm}
              marcadores={marcadoresDemandas}
              somenteLeitura
              altura="h-64"
            />
          </Cartao>

          {/* Lista de Solicitações Pendentes */}
          <Cartao
            titulo={`Solicitações Pendentes (${dados.totalDemandas})`}
            acao={
              <Link to="/interprete/demandas" className="text-sm font-semibold text-primary-container hover:underline">
                Ver todas
              </Link>
            }
          >
            {dados.demandasPendentes.length === 0 ? (
              <EstadoVazio
                icone="list_alt"
                titulo="Nenhuma demanda pendente no seu raio"
                descricao={
                  dados.disponivelAgora
                    ? 'Novas solicitações presenciais dentro de ' + dados.raioKm + ' km aparecerão aqui.'
                    : 'Você está Offline. Ative o modo Online no topo para receber alertas.'
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {dados.demandasPendentes.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-outline-variant bg-background-alt p-4 transition hover:border-primary sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Chip status={d.urgente ? 'URGENTE' : 'ACEITA'}>
                          {d.urgente ? 'Urgente · Hoje' : formato.quando(d.inicioPrevisto)}
                        </Chip>
                        <span className="text-xs font-semibold text-primary">
                          {formato.moeda(d.valorEstimado)} · {formato.duracao(d.duracaoPrevistaMin)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-primary">
                        {d.tipoServicoRotulo} — {d.clienteNome}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                        <Icone nome={ICONE_TIPO_SERVICO[d.tipoServico]} className="text-[16px]" />
                        {d.endereco} ({formato.distancia(d.distanciaKm)} de distância)
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link to={`/interprete/demandas/${d.id}`}>
                        <Botao type="button" variante="secundario">
                          Detalhes
                        </Botao>
                      </Link>
                      <Botao
                        type="button"
                        variante="secundario"
                        disabled={acaoDemandaId === d.id}
                        onClick={() => recusarDemanda(d.id)}
                      >
                        Recusar
                      </Botao>
                      <Botao
                        type="button"
                        icone="check"
                        carregando={acaoDemandaId === d.id}
                        onClick={() => aceitarDemanda(d.id)}
                      >
                        Aceitar
                      </Botao>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Cartao>
        </div>

        {/* Coluna direita: Ganhos da Semana + Próximo Atendimento */}
        <div className="flex flex-col gap-6">
          {/* Bento Box Ganhos da Semana (fiel ao code (1).html) */}
          <section className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary shadow-md">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-on-primary-container">
              Ganhos da Semana
            </div>
            <div className="mb-4 text-3xl font-bold">
              {formato.moeda(ganhos?.semana.recebido ?? 0)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-primary-container">Atendimentos</p>
                <p className="text-lg font-semibold">{ganhos?.semana.atendimentos ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-on-primary-container">Horas Totais</p>
                <p className="text-lg font-semibold">{ganhos?.semana.horas ?? 0}h</p>
              </div>
            </div>
            <Link
              to="/interprete/ganhos"
              className="mt-5 flex min-h-touch w-full items-center justify-center rounded-full bg-on-primary px-4 py-2 text-sm font-semibold text-primary-container transition hover:bg-surface"
            >
              Ver Extrato Completo
            </Link>
          </section>

          {/* Próximo Atendimento (fiel ao code (1).html) */}
          <Cartao
            titulo="Próximo Atendimento"
            acao={proximo ? <Chip status={proximo.status}>{proximo.status}</Chip> : undefined}
          >
            {!proximo ? (
              <div className="flex flex-col gap-3">
                <p className="text-base text-on-surface-variant">
                  Nenhum atendimento agendado no momento. Confira as demandas próximas ou ajuste sua agenda.
                </p>
                <Link to="/interprete/agenda">
                  <Botao variante="secundario" largo icone="event_available">
                    Configurar Disponibilidade
                  </Botao>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-outline-variant bg-background-alt p-4">
                  <h3 className="text-lg font-bold text-on-surface">{proximo.tipoServicoRotulo}</h3>
                  <p className="mb-3 text-sm text-on-surface-variant">{proximo.endereco}</p>
                  <div className="mb-2 flex justify-between border-b border-surface-variant pb-2 text-sm">
                    <span className="text-on-surface-variant">Cliente</span>
                    <span className="font-semibold text-on-surface">{proximo.clienteNome}</span>
                  </div>
                  <div className="mb-2 flex justify-between border-b border-surface-variant pb-2 text-sm">
                    <span className="text-on-surface-variant">Início</span>
                    <span className="font-semibold text-on-surface">{formato.quando(proximo.inicioPrevisto)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Duração</span>
                    <span className="font-semibold text-on-surface">{formato.duracao(proximo.duracaoPrevistaMin)}</span>
                  </div>
                </div>

                <Link to={`/interprete/atendimentos/${proximo.id}`}>
                  <Botao largo icone="qr_code_scanner">
                    {proximo.checkinRealizado ? 'Gerenciar Atendimento' : 'Check-in Digital'}
                  </Botao>
                </Link>
                <Link to={`/interprete/atendimentos/${proximo.id}/sala`}>
                  <Botao variante="secundario" largo icone="chat">
                    Abrir Sala de Atendimento
                  </Botao>
                </Link>
              </div>
            )}
          </Cartao>
        </div>
      </div>
    </div>
  );
}
