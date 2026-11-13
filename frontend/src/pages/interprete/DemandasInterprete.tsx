/**
 * Gestão de Solicitações / Demandas Próximas — Intérprete (RF20–RF23, protótipo Stitch code (5).html).
 * Lista demandas presenciais dentro do raio de até 15 km ordenadas por proximidade,
 * com abas "Novas no Raio" e "Agendadas / Em Andamento", mapa interativo e ações de Aceitar e Recusar.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type DemandaInterprete, type ItemHistoricoAtendimento } from '../../api/tipos';
import { CENTRO_PADRAO, Mapa, type MarcadorExtra, type Ponto } from '../../components/Mapa';
import { Alerta, Botao, Campo, Carregando, Cartao, Chip, EstadoErro, EstadoVazio, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

interface RespostaDemandas {
  habilitado: boolean;
  statusHabilitacao: string;
  raioKm?: number;
  base?: { latitude: number; longitude: number };
  demandas: DemandaInterprete[];
}

export function DemandasInterprete() {
  const navigate = useNavigate();

  const [aba, setAba] = useState<'NOVAS' | 'AGENDADAS'>('NOVAS');
  const [dados, setDados] = useState<RespostaDemandas | null>(null);
  const [ativos, setAtivos] = useState<ItemHistoricoAtendimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [recusandoId, setRecusandoId] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<RespostaDemandas>('/demandas'),
      api.get<ItemHistoricoAtendimento[]>('/atendimentos?apenasAtivos=true'),
    ])
      .then(([respDemandas, respAtivos]) => {
        setDados(respDemandas);
        setAtivos(respAtivos);
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar demandas.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aceitar(solicitacaoId: string) {
    setProcessandoId(solicitacaoId);
    setErroAcao('');
    try {
      const res = await api.post<{ atendimentoId: string }>(`/demandas/${solicitacaoId}/aceitar`);
      navigate(`/interprete/atendimentos/${res.atendimentoId}`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível aceitar a demanda.');
      carregar();
    } finally {
      setProcessandoId(null);
    }
  }

  async function confirmarRecusa(solicitacaoId: string) {
    setProcessandoId(solicitacaoId);
    setErroAcao('');
    try {
      await api.post(`/demandas/${solicitacaoId}/recusar`, {
        motivo: motivoRecusa.trim() || undefined,
      });
      setRecusandoId(null);
      setMotivoRecusa('');
      setMensagem('Demanda recusada com sucesso.');
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao recusar demanda.');
    } finally {
      setProcessandoId(null);
    }
  }

  if (carregando) return <Carregando texto="Buscando demandas próximas no seu raio…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Falha ao carregar.'} aoTentarNovamente={carregar} />;

  const pontoBase: Ponto = dados.base
    ? { lat: dados.base.latitude, lng: dados.base.longitude }
    : CENTRO_PADRAO;

  const marcadores: MarcadorExtra[] = dados.demandas.map((d) => ({
    id: d.id,
    lat: d.latitude,
    lng: d.longitude,
    rotulo: `${d.tipoServicoRotulo} • ${formato.distancia(d.distanciaKm)}`,
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho e Abas fiéis ao code (5).html */}
      <header className="border-b border-outline-variant pb-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gestão de Solicitações</h1>
            <p className="text-base text-on-surface-variant">
              Acompanhe e gerencie demandas presenciais em até {dados.raioKm ?? 15} km do seu endereço-base.
            </p>
          </div>
          <Botao type="button" variante="secundario" icone="refresh" onClick={carregar}>
            Atualizar
          </Botao>
        </div>

        <div role="tablist" aria-label="Filtro de solicitações" className="mt-4 flex gap-6">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'NOVAS'}
            onClick={() => setAba('NOVAS')}
            className={`min-h-touch border-b-2 px-2 pb-2 text-base font-semibold transition ${
              aba === 'NOVAS'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Novas no Raio ({dados.demandas.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'AGENDADAS'}
            onClick={() => setAba('AGENDADAS')}
            className={`min-h-touch border-b-2 px-2 pb-2 text-base font-semibold transition ${
              aba === 'AGENDADAS'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Agendadas / Em Aberto ({ativos.length})
          </button>
        </div>
      </header>

      {!dados.habilitado && (
        <Alerta tipo="aviso">
          Sua documentação está com status <strong>{dados.statusHabilitacao}</strong>. O recebimento e aceite de demandas são liberados após aprovação no backoffice (RNF36).
        </Alerta>
      )}

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {aba === 'NOVAS' ? (
        <div className="flex flex-col gap-5">
          {dados.demandas.length === 0 ? (
            <EstadoVazio
              icone="explore"
              titulo="Nenhuma nova solicitação disponível agora"
              descricao="Quando um cliente surdo solicitar atendimento dentro do seu raio de atuação, ela aparecerá aqui ordenada pela menor distância."
              acao={
                <Link to="/interprete/agenda">
                  <Botao variante="secundario" icone="tune">
                    Ajustar Raio ({dados.raioKm ?? 15} km)
                  </Botao>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {dados.demandas.map((d) => (
                <article
                  key={d.id}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs"
                >
                  {d.urgente && <div className="absolute inset-y-0 left-0 w-1.5 bg-status-alert" />}
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div>
                      <Chip status={d.urgente ? 'URGENTE' : 'ACEITA'}>
                        {d.urgente ? 'Urgente · Hoje' : formato.quando(d.inicioPrevisto)}
                      </Chip>
                      <h2 className="mt-2 text-xl font-bold text-on-surface">{d.tipoServicoRotulo}</h2>
                      <p className="text-sm text-on-surface-variant">Cliente: {d.clienteNome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formato.moeda(d.valorEstimado)}</p>
                      <p className="text-xs text-on-surface-variant">{formato.duracao(d.duracaoPrevistaMin)}</p>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-col gap-2.5 text-sm text-on-surface-variant">
                    <div className="flex items-start gap-2.5">
                      <Icone nome="location_on" className="text-primary-container" />
                      <span className="font-medium text-on-surface">{d.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Icone nome="directions_car" className="text-secondary" />
                      <span>Aprox. {formato.distancia(d.distanciaKm)} de você</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Icone nome="schedule" className="text-secondary" />
                      <span>
                        {formato.dataHora(d.inicioPrevisto)} ({formato.duracao(d.duracaoPrevistaMin)})
                      </span>
                    </div>
                  </div>

                  {recusandoId === d.id ? (
                    <div className="mt-auto flex flex-col gap-2 border-t border-surface-variant pt-3">
                      <Campo
                        rotulo="Motivo da recusa (opcional)"
                        placeholder="Ex.: Indisponível neste horário"
                        value={motivoRecusa}
                        onChange={(e) => setMotivoRecusa(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Botao
                          type="button"
                          variante="perigo"
                          className="flex-1"
                          carregando={processandoId === d.id}
                          onClick={() => confirmarRecusa(d.id)}
                        >
                          Confirmar Recusa
                        </Botao>
                        <Botao
                          type="button"
                          variante="secundario"
                          onClick={() => {
                            setRecusandoId(null);
                            setMotivoRecusa('');
                          }}
                        >
                          Voltar
                        </Botao>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-surface-variant pt-4">
                      <Link to={`/interprete/demandas/${d.id}`}>
                        <Botao type="button" variante="secundario" icone="visibility">
                          Detalhes
                        </Botao>
                      </Link>
                      <Botao
                        type="button"
                        variante="secundario"
                        onClick={() => setRecusandoId(d.id)}
                      >
                        Recusar
                      </Botao>
                      <Botao
                        type="button"
                        className="flex-1"
                        icone="check_circle"
                        carregando={processandoId === d.id}
                        onClick={() => aceitar(d.id)}
                      >
                        Aceitar Solicitação
                      </Botao>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Mapa das demandas (fiel ao code (5).html) */}
          <Cartao titulo="Mapa de Demandas na Sua Região">
            <Mapa
              posicao={pontoBase}
              raioKm={dados.raioKm ?? 15}
              marcadores={marcadores}
              somenteLeitura
              altura="h-64"
            />
          </Cartao>
        </div>
      ) : ativos.length === 0 ? (
        <EstadoVazio
          icone="event_available"
          titulo="Nenhum atendimento agendado ou em andamento"
          descricao="Aceite uma nova demanda na aba ao lado para vê-la listada aqui."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ativos.map((at) => (
            <article
              key={at.id}
              className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icone nome={ICONE_TIPO_SERVICO[at.tipoServico]} className="text-primary-container" />
                  <h2 className="text-lg font-bold text-primary">{at.tipoServicoRotulo}</h2>
                </div>
                <Chip status={at.status}>{at.status}</Chip>
              </div>
              <p className="text-base font-semibold text-on-surface">Cliente: {at.contraparte}</p>
              <p className="text-sm text-on-surface-variant">
                {formato.dataHora(at.inicioPrevisto)} · {formato.duracao(at.duracaoPrevistaMin)}
              </p>
              <p className="text-sm text-on-surface-variant">{at.endereco}</p>
              <div className="mt-auto flex gap-2 pt-2">
                <Link to={`/interprete/atendimentos/${at.id}`} className="flex-1">
                  <Botao largo icone="qr_code_scanner">
                    Check-in / Detalhes
                  </Botao>
                </Link>
                <Link to={`/interprete/atendimentos/${at.id}/sala`} className="flex-1">
                  <Botao variante="secundario" largo icone="chat">
                    Sala
                  </Botao>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
