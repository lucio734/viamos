/**
 * Detalhe da Demanda — Visão do Intérprete (RF21–RF23).
 * Exibe contexto, local presencial no mapa, observações do cliente, valor estimado
 * e botões para Aceite Exclusivo (RF22) ou Recusa Individual (RF23).
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type DetalheSolicitacao } from '../../api/tipos';
import { Mapa } from '../../components/Mapa';
import { Alerta, AreaTexto, Botao, Carregando, Cartao, Chip, EstadoErro, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

export function DetalheDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dados, setDados] = useState<DetalheSolicitacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [aceitando, setAceitando] = useState(false);
  const [exibirRecusa, setExibirRecusa] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [recusando, setRecusando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    api
      .get<DetalheSolicitacao>(`/solicitacoes/${id}`)
      .then(setDados)
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Demanda não encontrada.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aceitarDemanda() {
    if (!id) return;
    setAceitando(true);
    setErroAcao('');
    try {
      const res = await api.post<{ atendimentoId: string }>(`/demandas/${id}/aceitar`);
      navigate(`/interprete/atendimentos/${res.atendimentoId}`, { replace: true });
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível aceitar a demanda.');
    } finally {
      setAceitando(false);
    }
  }

  async function confirmarRecusa(ev: FormEvent) {
    ev.preventDefault();
    if (!id) return;
    setRecusando(true);
    setErroAcao('');
    try {
      await api.post(`/demandas/${id}/recusar`, { motivo: motivoRecusa.trim() || undefined });
      navigate('/interprete/demandas', { replace: true });
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível recusar a demanda.');
      setRecusando(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando detalhes da demanda…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Demanda indisponível.'} aoTentarNovamente={carregar} />;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2">
        <Link
          to="/interprete/demandas"
          aria-label="Voltar às demandas"
          className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
        >
          <Icone nome="arrow_back" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Demanda · {dados.tipoServicoRotulo}</h1>
            <Chip status={dados.status}>{dados.statusRotulo}</Chip>
          </div>
          <p className="text-base text-on-surface-variant">Solicitante: {dados.cliente.nome}</p>
        </div>
      </header>

      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      <Cartao titulo="Contexto e Local Presencial (RF21)">
        <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Tipo de serviço</p>
            <p className="mt-0.5 flex items-center gap-2 font-semibold">
              <Icone nome={ICONE_TIPO_SERVICO[dados.tipoServico]} className="text-primary-container" />
              {dados.tipoServicoRotulo}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Data, horário e duração</p>
            <p className="mt-0.5 font-semibold">
              {formato.dataHora(dados.inicioPrevisto)} · {formato.duracao(dados.duracaoPrevistaMin)}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3 sm:col-span-2">
            <p className="text-sm text-on-surface-variant">Endereço do atendimento</p>
            <p className="mt-0.5 font-semibold">{dados.local.endereco}</p>
            {(dados.local.complemento || dados.local.pontoReferencia) && (
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {[dados.local.complemento, dados.local.pontoReferencia].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {dados.observacoes && (
            <div className="rounded-lg bg-surface-container-low p-3 sm:col-span-2">
              <p className="text-sm text-on-surface-variant">Observações do cliente</p>
              <p className="mt-0.5">{dados.observacoes}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Mapa
            posicao={{ lat: dados.local.latitude, lng: dados.local.longitude }}
            somenteLeitura
            altura="h-56"
            rotulo="Localização exata do atendimento:"
          />
        </div>
      </Cartao>

      {dados.cotacao && (
        <Cartao titulo="Remuneração Estimada">
          <div className="flex flex-col gap-2 text-base">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Valor do serviço de interpretação</span>
              <span className="font-semibold">{formato.moeda(dados.cotacao.valorServico)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Auxílio deslocamento presencial</span>
              <span className="font-semibold">{formato.moeda(dados.cotacao.valorDeslocamento)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-outline-variant/60 pt-2 text-lg font-bold text-status-online">
              <span>Seu crédito líquido estimado (serviço + deslocamento)</span>
              <span>{formato.moeda(dados.cotacao.valorServico + dados.cotacao.valorDeslocamento)}</span>
            </div>
          </div>
        </Cartao>
      )}

      {dados.status === 'BUSCANDO' ? (
        <Cartao titulo="Decisão sobre a Demanda (RF22 / RF23)">
          {!exibirRecusa ? (
            <div className="flex flex-wrap gap-3">
              <Botao
                type="button"
                icone="check_circle"
                className="flex-1"
                carregando={aceitando}
                onClick={aceitarDemanda}
              >
                Aceitar Solicitação Exclusiva
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                icone="close"
                onClick={() => setExibirRecusa(true)}
              >
                Recusar
              </Botao>
            </div>
          ) : (
            <form onSubmit={confirmarRecusa} className="flex flex-col gap-3">
              <AreaTexto
                rotulo="Motivo da recusa (opcional)"
                placeholder="Informe o motivo caso queira registrar..."
                maxLength={300}
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
              />
              <div className="flex gap-2">
                <Botao type="submit" variante="perigo" carregando={recusando}>
                  Confirmar Recusa
                </Botao>
                <Botao type="button" variante="secundario" onClick={() => setExibirRecusa(false)}>
                  Cancelar
                </Botao>
              </div>
            </form>
          )}
        </Cartao>
      ) : dados.atendimento ? (
        <Link to={`/interprete/atendimentos/${dados.atendimento.id}`}>
          <Botao largo icone="open_in_new">
            Ir para o Atendimento Confirmado
          </Botao>
        </Link>
      ) : null}
    </div>
  );
}
