/**
 * Detalhe do Atendimento — Visão do Intérprete (RF31–RF33, RNF26).
 * Recursos:
 *   - Leitura do QR Code (LeitorQr) + captura de geolocalização com precisão em metros
 *   - Botão de simulação de GPS no local do encontro (para ensaio/demonstração indoor)
 *   - Tratamento de mensagens específicas do check-in (fora do local, precisão, janela, QR inválido)
 *   - Encerramento do atendimento com apuração da duração real e do valor final
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type DetalheAtendimento } from '../../api/tipos';
import { LeitorQr } from '../../components/LeitorQr';
import { Mapa } from '../../components/Mapa';
import { Alerta, Botao, Carregando, Cartao, Chip, EstadoErro, Icone } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';

interface PosicaoCheckin {
  latitude: number;
  longitude: number;
  precisaoM: number;
  origem: 'GPS' | 'LOCAL_ATENDIMENTO';
}

export function DetalheAtendimentoInterprete() {
  const { id } = useParams<{ id: string }>();

  const [dados, setDados] = useState<DetalheAtendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [posicao, setPosicao] = useState<PosicaoCheckin | null>(null);
  const [capturandoGps, setCapturandoGps] = useState(false);
  const [fazendoCheckin, setFazendoCheckin] = useState(false);
  const [encerrando, setEncerrando] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    api
      .get<DetalheAtendimento>(`/atendimentos/${id}`)
      .then((at) => {
        setDados(at);
        // Inicializa com coordenadas do ponto do atendimento caso o usuário esteja em ambiente desktop sem GPS
        setPosicao((ant) =>
          ant ?? {
            latitude: at.local.latitude,
            longitude: at.local.longitude,
            precisaoM: 12,
            origem: 'LOCAL_ATENDIMENTO',
          },
        );
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Atendimento não encontrado.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function capturarGpsDispositivo() {
    if (!('geolocation' in navigator)) {
      setErroAcao('Seu navegador não suporta geolocalização.');
      return;
    }
    setCapturandoGps(true);
    setErroAcao('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicao({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          precisaoM: Math.round(pos.coords.accuracy),
          origem: 'GPS',
        });
        setCapturandoGps(false);
      },
      () => {
        setCapturandoGps(false);
        setErroAcao('Não foi possível obter o GPS real do dispositivo. Você pode usar a posição do local para demonstração.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function usarPosicaoDoLocal() {
    if (!dados) return;
    setPosicao({
      latitude: dados.local.latitude,
      longitude: dados.local.longitude,
      precisaoM: 10,
      origem: 'LOCAL_ATENDIMENTO',
    });
    setErroAcao('');
  }

  async function realizarCheckin(codigoLido: string) {
    if (!id || !dados) return;
    const pos = posicao ?? {
      latitude: dados.local.latitude,
      longitude: dados.local.longitude,
      precisaoM: 12,
      origem: 'LOCAL_ATENDIMENTO' as const,
    };

    setFazendoCheckin(true);
    setErroAcao('');
    setMensagem('');
    try {
      const res = await api.post<{ distanciaM: number }>(`/atendimentos/${id}/checkin`, {
        codigo: codigoLido,
        latitude: pos.latitude,
        longitude: pos.longitude,
        precisaoM: pos.precisaoM,
      });
      setMensagem(`Check-in presencial confirmado a ${res.distanciaM} m do ponto marcado! O atendimento está em andamento.`);
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível validar o check-in.');
    } finally {
      setFazendoCheckin(false);
    }
  }

  async function encerrarAtendimento() {
    if (!id) return;
    setEncerrando(true);
    setErroAcao('');
    setMensagem('');
    try {
      const res = await api.post<{ duracaoRealMin: number; valorFinal: { valorTotal: number } | null }>(
        `/atendimentos/${id}/encerrar`,
      );
      setMensagem(
        `Atendimento encerrado! Duração real: ${formato.duracao(res.duracaoRealMin)} · Valor final: ${formato.moeda(res.valorFinal?.valorTotal)}.`,
      );
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao encerrar atendimento.');
    } finally {
      setEncerrando(false);
    }
  }

  async function abrirComprovante() {
    if (!id) return;
    try {
      await api.abrirArquivo(`/atendimentos/${id}/comprovante.pdf`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Comprovante PDF ainda indisponível.');
    }
  }

  if (carregando) return <Carregando texto="Carregando atendimento…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Atendimento indisponível.'} aoTentarNovamente={carregar} />;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/interprete"
            aria-label="Voltar ao painel do intérprete"
            className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
          >
            <Icone nome="arrow_back" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">Atendimento · {dados.tipoServicoRotulo}</h1>
              <Chip status={dados.status}>{dados.status.replace('_', ' ')}</Chip>
            </div>
            <p className="text-base text-on-surface-variant">
              Cliente: <strong>{dados.cliente.nome}</strong> · {formato.dataHora(dados.inicioPrevisto)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/interprete/atendimentos/${dados.id}/sala`}>
            <Botao icone="chat">Sala de Atendimento</Botao>
          </Link>
          <Link to={`/suporte?atendimentoId=${dados.id}`}>
            <Botao variante="perigo" icone="sos">
              SOS / Suporte
            </Botao>
          </Link>
        </div>
      </header>

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Seção de Check-in Geolocalizado (RF31, RF32, RNF26) */}
      {dados.status === 'AGENDADO' && (
        <Cartao titulo="Check-in Digital Geolocalizado (RF31 / RF32 / RNF26)">
          <div className="flex flex-col gap-4">
            <p className="text-base text-on-surface-variant">
              O check-in exige estar a no máximo <strong>200 m</strong> do local do atendimento, com precisão de GPS ≤{' '}
              <strong>50 m</strong>, a partir de <strong>{formato.dataHora(dados.checkin.disponivelApartirDe)}</strong> (30 min antes do horário).
            </p>

            {/* Status da posição GPS */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3.5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Coordenadas para validação:{' '}
                  {posicao ? `${posicao.latitude.toFixed(5)}, ${posicao.longitude.toFixed(5)}` : 'Não capturadas'}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Precisão estimada: <strong>{posicao?.precisaoM ?? '—'} m</strong> (
                  {posicao?.origem === 'GPS' ? 'GPS do dispositivo' : 'Posição do local de encontro'})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Botao
                  type="button"
                  variante="secundario"
                  icone="my_location"
                  carregando={capturandoGps}
                  onClick={capturarGpsDispositivo}
                >
                  Atualizar meu GPS
                </Botao>
                <Botao type="button" variante="secundario" icone="pin_drop" onClick={usarPosicaoDoLocal}>
                  Simular no local (Demo)
                </Botao>
              </div>
            </div>

            <LeitorQr aoLer={realizarCheckin} carregando={fazendoCheckin} />
          </div>
        </Cartao>
      )}

      {/* Em andamento → Encerramento (RF33) */}
      {dados.status === 'EM_ANDAMENTO' && (
        <Cartao titulo="Atendimento em Andamento — Registrar Encerramento (RF33)">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-status-online">
                Check-in realizado às {formato.hora(dados.checkin.lidoEm)} ({dados.checkin.distanciaM ?? 0} m do ponto).
              </p>
              <p className="text-base text-on-surface-variant">
                Ao finalizar a interpretação presencial, clique em encerrar para registrar o horário de término e gerar a cobrança.
              </p>
            </div>
            <Botao type="button" icone="stop_circle" carregando={encerrando} onClick={encerrarAtendimento}>
              Encerrar Atendimento
            </Botao>
          </div>
        </Cartao>
      )}

      {/* Concluído → Resumo, Avaliação e Ganhos */}
      {dados.status === 'CONCLUIDO' && (
        <Cartao titulo="Resumo do Atendimento Concluído">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-sm text-on-surface-variant">Duração real</p>
              <p className="text-lg font-bold">{formato.duracao(dados.duracaoRealMin)}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-sm text-on-surface-variant">Valor final do atendimento</p>
              <p className="text-lg font-bold text-primary-container">{formato.moeda(dados.valorFinal ?? dados.valorEstimado)}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-sm text-on-surface-variant">Pagamento do cliente</p>
              <div className="mt-1">
                <Chip status={dados.pagamento?.status ?? 'PENDENTE'}>{dados.pagamento?.status ?? 'PENDENTE'}</Chip>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!dados.avaliacoes.minhaAvaliacaoFeita && (
              <Link to={`/interprete/atendimentos/${dados.id}/avaliar`}>
                <Botao icone="star">Avaliar Cliente</Botao>
              </Link>
            )}
            {dados.comprovante && (
              <Botao type="button" variante="secundario" icone="receipt_long" onClick={abrirComprovante}>
                Comprovante PDF
              </Botao>
            )}
            <Link to="/interprete/ganhos">
              <Botao variante="secundario" icone="payments">
                Ver em Ganhos e Repasses
              </Botao>
            </Link>
          </div>
        </Cartao>
      )}

      {/* Dados do Cliente e Local */}
      <Cartao titulo="Cliente e Local do Encontro Presencial">
        <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Cliente Surdo(a)</p>
            <p className="mt-0.5 font-semibold">{dados.cliente.nome}</p>
            <p className="text-sm text-on-surface-variant">Tel.: {mascaras.telefone(dados.cliente.telefone)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Serviço e duração prevista</p>
            <p className="mt-0.5 flex items-center gap-2 font-semibold">
              <Icone nome={ICONE_TIPO_SERVICO[dados.tipoServico]} className="text-primary-container" />
              {dados.tipoServicoRotulo} · {formato.duracao(dados.duracaoPrevistaMin)}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3 sm:col-span-2">
            <p className="text-sm text-on-surface-variant">Endereço presencial</p>
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
            altura="h-52"
            rotulo="Localização exata do encontro presencial:"
          />
        </div>
      </Cartao>
    </div>
  );
}
