/**
 * Nova Solicitação de Intérprete (RF10–RF16, RNF28, protótipo Stitch code (15).html).
 * Assistente em 3 passos:
 *   1. Contexto, data/hora futura, duração (blocos de 30 min, mín. 60 min) e observações (≤ 300 chars)
 *   2. Endereço presencial + confirmação do ponto no Mapa interativo + complemento e referência
 *   3. Resumo + estimativa de valor (POST /solicitacoes/estimativa) → confirmação (POST /solicitacoes)
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import {
  ICONE_TIPO_SERVICO,
  ROTULO_TIPO_SERVICO,
  type DetalheSolicitacao,
  type EstimativaPreco,
  type TipoServico,
} from '../../api/tipos';
import { CENTRO_PADRAO, geocodificar, Mapa, type Ponto } from '../../components/Mapa';
import { Alerta, AreaTexto, Botao, Campo, Carregando, Cartao, EstadoErro, Icone, Selecao } from '../../components/ui';
import { formato, paraIso } from '../../utils/formato';

const TIPOS: { valor: TipoServico; rotulo: string; descricao: string }[] = [
  { valor: 'SAUDE', rotulo: 'Médico / Saúde', descricao: 'Consultas, exames e acompanhamento hospitalar' },
  { valor: 'EDUCACAO', rotulo: 'Educação', descricao: 'Aulas, matrículas, reuniões e bancas acadêmicas' },
  { valor: 'JURIDICO', rotulo: 'Jurídico', descricao: 'Audiências, cartórios, delegacias e advocacia' },
  { valor: 'EVENTO', rotulo: 'Palestra / Evento', descricao: 'Congressos, seminários, oficinas e eventos corporativos' },
  { valor: 'OUTRO', rotulo: 'Outro', descricao: 'Atendimentos bancários, comerciais ou cotidianos' },
];

const DURACOES_RAPIDAS = [60, 90, 120, 180, 240];
const TODAS_DURACOES = Array.from({ length: 23 }, (_, i) => 60 + i * 30); // 60 a 720 min em blocos de 30 min

function dataHoraPadrao(): { data: string; hora: string } {
  const d = new Date(Date.now() + 2 * 3_600_000);
  d.setMinutes(d.getMinutes() <= 30 ? 30 : 60, 0, 0);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return { data: `${ano}-${mes}-${dia}`, hora: `${hora}:${min}` };
}

export function NovaSolicitacao() {
  const navigate = useNavigate();
  const padrao = dataHoraPadrao();

  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [tipoServico, setTipoServico] = useState<TipoServico>('SAUDE');
  const [data, setData] = useState(padrao.data);
  const [hora, setHora] = useState(padrao.hora);
  const [duracaoPrevistaMin, setDuracaoPrevistaMin] = useState(60);
  const [observacoes, setObservacoes] = useState('');

  const [endereco, setEndereco] = useState('');
  const [complemento, setComplemento] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [ponto, setPonto] = useState<Ponto>(CENTRO_PADRAO);
  const [buscandoGeo, setBuscandoGeo] = useState(false);
  const [avisoGeo, setAvisoGeo] = useState('');

  const [estimativa, setEstimativa] = useState<EstimativaPreco | null>(null);
  const [carregandoEstimativa, setCarregandoEstimativa] = useState(false);
  const [erroEstimativa, setErroEstimativa] = useState('');

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarPasso1 = (): boolean => {
    const novos: Record<string, string> = {};
    if (!data) novos.data = 'Selecione a data do atendimento.';
    if (!hora) novos.hora = 'Informe o horário de início.';
    if (data && hora) {
      const inicio = new Date(`${data}T${hora}:00`);
      if (Number.isNaN(inicio.getTime())) {
        novos.data = 'Data ou horário inválidos.';
      } else if (inicio.getTime() <= Date.now()) {
        novos.hora = 'A data e o horário devem ser futuros (RF11).';
      }
    }
    if (duracaoPrevistaMin < 60 || duracaoPrevistaMin > 720 || duracaoPrevistaMin % 30 !== 0) {
      novos.duracaoPrevistaMin = 'A duração mínima é de 60 minutos, em blocos de 30 minutos (RF12).';
    }
    if (observacoes.trim().length > 300) {
      novos.observacoes = 'Observações devem ter no máximo 300 caracteres.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const validarPasso2 = (): boolean => {
    const novos: Record<string, string> = {};
    if (endereco.trim().length < 5) {
      novos.endereco = 'Informe o endereço presencial completo (mínimo de 5 caracteres).';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const carregarEstimativa = useCallback(() => {
    setCarregandoEstimativa(true);
    setErroEstimativa('');
    api
      .post<EstimativaPreco>('/solicitacoes/estimativa', { tipoServico, duracaoPrevistaMin })
      .then(setEstimativa)
      .catch((e) => setErroEstimativa(e instanceof ErroApi ? e.mensagem : 'Não foi possível calcular a estimativa.'))
      .finally(() => setCarregandoEstimativa(false));
  }, [tipoServico, duracaoPrevistaMin]);

  useEffect(() => {
    if (passo === 3) carregarEstimativa();
  }, [passo, carregarEstimativa]);

  async function localizarEnderecoNoMapa() {
    if (endereco.trim().length < 5) {
      setErros((ant) => ({ ...ant, endereco: 'Digite o endereço antes de localizar no mapa.' }));
      return;
    }
    setBuscandoGeo(true);
    setAvisoGeo('');
    const resultado = await geocodificar(endereco);
    setBuscandoGeo(false);
    if (resultado) {
      setPonto(resultado);
      setAvisoGeo(' Coordenadas atualizadas no mapa a partir do endereço informado.');
    } else {
      setAvisoGeo('Não encontramos o endereço automaticamente. Clique ou arraste o pino no mapa abaixo.');
    }
  }

  function preencherLocalDemonstracao() {
    setEndereco('Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César, São Paulo - SP');
    setComplemento('Prédio dos Ambulatórios, 4º andar');
    setPontoReferencia('Portaria principal do Hospital das Clínicas');
    setPonto({ lat: -23.5577, lng: -46.6698 });
    setErros((ant) => ({ ...ant, endereco: '' }));
    setAvisoGeo('Local de demonstração (Hospital das Clínicas) marcado no mapa.');
  }

  async function confirmarSolicitacao(ev: FormEvent) {
    ev.preventDefault();
    setErroGeral('');
    if (!validarPasso1() || !validarPasso2()) return;

    setEnviando(true);
    try {
      const criada = await api.post<DetalheSolicitacao>('/solicitacoes', {
        tipoServico,
        inicioPrevisto: paraIso(data, hora),
        duracaoPrevistaMin,
        endereco: endereco.trim(),
        complemento: complemento.trim() || undefined,
        pontoReferencia: pontoReferencia.trim() || undefined,
        latitude: ponto.lat,
        longitude: ponto.lng,
        observacoes: observacoes.trim() || undefined,
      });
      navigate(`/cliente/solicitacoes/${criada.id}?recemCriada=1`, { replace: true });
    } catch (e) {
      if (e instanceof ErroApi) {
        setErroGeral(e.mensagem);
        setErros(e.porCampo);
      } else {
        setErroGeral('Não foi possível registrar sua solicitação. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/cliente"
            aria-label="Voltar ao painel"
            className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
          >
            <Icone nome="arrow_back" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Nova Solicitação</h1>
            <p className="text-base text-on-surface-variant">Mediação comunicacional exclusivamente presencial em Libras (RNF28)</p>
          </div>
        </div>
      </header>

      {/* Indicador de passos */}
      <nav aria-label="Etapas da solicitação" className="grid grid-cols-3 gap-2">
        {[
          { n: 1 as const, rotulo: '1. Contexto e Horário', icone: 'event' },
          { n: 2 as const, rotulo: '2. Local Presencial', icone: 'location_on' },
          { n: 3 as const, rotulo: '3. Estimativa e Envio', icone: 'receipt_long' },
        ].map((etapa) => {
          const ativa = passo === etapa.n;
          const concluida = passo > etapa.n;
          return (
            <button
              key={etapa.n}
              type="button"
              onClick={() => {
                if (etapa.n === 1) setPasso(1);
                else if (etapa.n === 2 && validarPasso1()) setPasso(2);
                else if (etapa.n === 3 && validarPasso1() && validarPasso2()) setPasso(3);
              }}
              aria-current={ativa ? 'step' : undefined}
              className={`flex min-h-touch items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                ativa
                  ? 'border-primary-container bg-primary-container text-on-primary shadow-sm'
                  : concluida
                    ? 'border-status-online/40 bg-status-online/10 text-status-online'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
              }`}
            >
              <Icone nome={concluida ? 'check_circle' : etapa.icone} className="text-[18px]" />
              <span className="truncate">{etapa.rotulo}</span>
            </button>
          );
        })}
      </nav>

      {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}

      {passo === 1 && (
        <div className="flex flex-col gap-5">
          {/* Seção 1: Tipo de Atendimento (fiel ao code (15).html) */}
          <Cartao>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-primary">
              <Icone nome="category" className="text-outline" />
              Tipo de Atendimento
            </h2>
            <p className="mb-3 text-base text-on-surface-variant">
              Escolha o contexto para direcionarmos intérpretes habilitados na área.
            </p>
            <div role="radiogroup" aria-label="Tipo de atendimento" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TIPOS.map((t) => {
                const selecionado = tipoServico === t.valor;
                return (
                  <button
                    key={t.valor}
                    type="button"
                    role="radio"
                    aria-checked={selecionado}
                    onClick={() => setTipoServico(t.valor)}
                    className={`flex min-h-touch items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                      selecionado
                        ? 'border-primary-container bg-primary-container text-on-primary shadow-sm'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <Icone nome={ICONE_TIPO_SERVICO[t.valor]} className="mt-0.5 text-2xl" />
                    <div>
                      <p className="text-base font-semibold">{t.rotulo}</p>
                      <p className={`text-sm ${selecionado ? 'text-on-primary/85' : 'text-on-surface-variant'}`}>{t.descricao}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Cartao>

          {/* Seção 2: Data e Horário de Início */}
          <Cartao>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-primary">
              <Icone nome="calendar_month" className="text-outline" />
              Data e Horário de Início
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo
                rotulo="Data do atendimento"
                type="date"
                icone="event"
                value={data}
                onChange={(e) => {
                  setData(e.target.value);
                  setErros((ant) => ({ ...ant, data: '', hora: '' }));
                }}
                erro={erros.data}
                required
              />
              <Campo
                rotulo="Horário de início"
                type="time"
                icone="schedule"
                value={hora}
                onChange={(e) => {
                  setHora(e.target.value);
                  setErros((ant) => ({ ...ant, hora: '', inicioPrevisto: '' }));
                }}
                erro={erros.hora || erros.inicioPrevisto}
                required
              />
            </div>
          </Cartao>

          {/* Seção 3: Duração Estimada */}
          <Cartao>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-primary">
              <Icone nome="timer" className="text-outline" />
              Duração Estimada
            </h2>
            <p className="mb-3 text-base text-on-surface-variant">
              Mínimo contratado de 1 hora (60 min), em blocos de 30 minutos (RF12).
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {DURACOES_RAPIDAS.map((min) => {
                const ativo = duracaoPrevistaMin === min;
                return (
                  <button
                    key={min}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setDuracaoPrevistaMin(min)}
                    className={`min-h-touch min-w-[88px] rounded-full border px-4 py-2 text-base font-semibold transition ${
                      ativo
                        ? 'border-primary-container bg-primary-container text-on-primary'
                        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {formato.duracao(min)}
                  </button>
                );
              })}
            </div>
            <Selecao
              rotulo="Ou escolha outra duração (em blocos de 30 min)"
              value={String(duracaoPrevistaMin)}
              onChange={(e) => setDuracaoPrevistaMin(Number(e.target.value))}
              opcoes={TODAS_DURACOES.map((m) => ({
                valor: String(m),
                rotulo: `${formato.duracao(m)} (${m} minutos)`,
              }))}
              erro={erros.duracaoPrevistaMin}
            />
          </Cartao>

          {/* Seção 4: Observações */}
          <Cartao>
            <AreaTexto
              rotulo="Observações para o intérprete (opcional)"
              placeholder="Ex.: Consulta com cardiologista, levar documento na recepção B..."
              maxLength={300}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              erro={erros.observacoes}
            />
          </Cartao>

          <div className="flex justify-end">
            <Botao
              type="button"
              icone="arrow_forward"
              largo
              onClick={() => {
                if (validarPasso1()) setPasso(2);
              }}
            >
              Continuar para o local do atendimento
            </Botao>
          </div>
        </div>
      )}

      {passo === 2 && (
        <div className="flex flex-col gap-5">
          <Cartao>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Icone nome="location_on" className="text-outline" />
                Local do Atendimento Presencial
              </h2>
              <button
                type="button"
                onClick={preencherLocalDemonstracao}
                className="min-h-touch rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-semibold text-primary hover:bg-surface-container-low"
              >
                Usar endereço de exemplo (HC-FMUSP)
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Campo
                  className="flex-1"
                  rotulo="Endereço completo (rua, número, bairro, cidade)"
                  icone="search"
                  placeholder="Ex.: Av. Paulista, 1578 - Bela Vista, São Paulo"
                  value={endereco}
                  onChange={(e) => {
                    setEndereco(e.target.value);
                    setErros((ant) => ({ ...ant, endereco: '' }));
                  }}
                  erro={erros.endereco}
                  required
                />
                <Botao
                  type="button"
                  variante="secundario"
                  icone="travel_explore"
                  carregando={buscandoGeo}
                  onClick={localizarEnderecoNoMapa}
                >
                  Localizar no mapa
                </Botao>
              </div>

              {avisoGeo && <Alerta tipo="info">{avisoGeo}</Alerta>}

              <Mapa
                posicao={ponto}
                aoSelecionar={(novo) => setPonto(novo)}
                rotulo="Toque ou arraste o marcador para confirmar o ponto exato do encontro presencial (RF13):"
                altura="h-64"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo
                  rotulo="Complemento (opcional)"
                  icone="apartment"
                  placeholder="Bloco, andar, sala ou consultório"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  maxLength={120}
                />
                <Campo
                  rotulo="Ponto de referência (opcional)"
                  icone="flag"
                  placeholder="Ex.: Em frente à recepção central"
                  value={pontoReferencia}
                  onChange={(e) => setPontoReferencia(e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>
          </Cartao>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Botao type="button" variante="secundario" icone="arrow_back" onClick={() => setPasso(1)}>
              Voltar ao passo 1
            </Botao>
            <Botao
              type="button"
              icone="calculate"
              onClick={() => {
                if (validarPasso2()) setPasso(3);
              }}
            >
              Calcular estimativa e revisar
            </Botao>
          </div>
        </div>
      )}

      {passo === 3 && (
        <form onSubmit={confirmarSolicitacao} className="flex flex-col gap-5">
          <Cartao titulo="Resumo da Solicitação">
            <dl className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-sm text-on-surface-variant">Tipo de serviço</dt>
                <dd className="mt-0.5 flex items-center gap-2 font-semibold text-on-surface">
                  <Icone nome={ICONE_TIPO_SERVICO[tipoServico]} className="text-primary-container" />
                  {ROTULO_TIPO_SERVICO[tipoServico]}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <dt className="text-sm text-on-surface-variant">Data, horário e duração</dt>
                <dd className="mt-0.5 font-semibold text-on-surface">
                  {formato.dataHora(paraIso(data, hora))} · {formato.duracao(duracaoPrevistaMin)}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3 sm:col-span-2">
                <dt className="text-sm text-on-surface-variant">Local presencial</dt>
                <dd className="mt-0.5 font-semibold text-on-surface">{endereco}</dd>
                {(complemento || pontoReferencia) && (
                  <dd className="mt-1 text-sm text-on-surface-variant">
                    {[complemento, pontoReferencia].filter(Boolean).join(' · ')}
                  </dd>
                )}
              </div>
              {observacoes.trim() && (
                <div className="rounded-lg bg-surface-container-low p-3 sm:col-span-2">
                  <dt className="text-sm text-on-surface-variant">Observações</dt>
                  <dd className="mt-0.5 text-on-surface">{observacoes}</dd>
                </div>
              )}
            </dl>
          </Cartao>

          <Cartao titulo="Estimativa de Valor (RF15)">
            {carregandoEstimativa ? (
              <Carregando texto="Calculando estimativa da solicitação…" />
            ) : erroEstimativa || !estimativa ? (
              <EstadoErro mensagem={erroEstimativa || 'Falha ao obter estimativa.'} aoTentarNovamente={carregarEstimativa} />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-on-surface-variant">
                    Serviço de interpretação ({formato.duracao(estimativa.duracaoPrevistaMin)} × {formato.moeda(estimativa.precoHoraReferencia)}/h)
                  </span>
                  <span className="font-semibold">{formato.moeda(estimativa.valorServico)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-on-surface-variant">Deslocamento presencial fixo</span>
                  <span className="font-semibold">{formato.moeda(estimativa.valorDeslocamento)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-on-surface-variant">Taxa da plataforma Víamos (10%)</span>
                  <span className="font-semibold">{formato.moeda(estimativa.taxaPlataforma)}</span>
                </div>
                <div className="my-1 border-t border-outline-variant/60 pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">Total estimado</span>
                  <span className="text-2xl font-bold text-primary-container">{formato.moeda(estimativa.valorTotal)}</span>
                </div>
                <p className="rounded-lg bg-primary-fixed/50 p-3 text-sm text-on-primary-fixed">
                  {estimativa.observacao} (Regra {estimativa.versaoRegra} · distribuição para intérpretes verificados em até 15 km).
                </p>
              </div>
            )}
          </Cartao>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Botao type="button" variante="secundario" icone="arrow_back" onClick={() => setPasso(2)}>
              Editar local
            </Botao>
            <Botao type="submit" icone="search" carregando={enviando} disabled={carregandoEstimativa || !estimativa}>
              Buscar Intérprete Agora
            </Botao>
          </div>
        </form>
      )}
    </div>
  );
}
