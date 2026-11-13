/**
 * Detalhe do Atendimento — Visão do Cliente (RF31, RF33, RF37, RF40).
 * Exibe QR Code para check-in, status em tempo real, encerramento do atendimento,
 * acesso à sala, pagamento, emissão/download do comprovante PDF e avaliação.
 */
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, ROTULO_TIPO_SERVICO, type DetalheAtendimento } from '../../api/tipos';
import { Mapa } from '../../components/Mapa';
import { Alerta, Botao, Carregando, Cartao, Chip, EstadoErro, Icone } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';

export function DetalheAtendimentoCliente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dados, setDados] = useState<DetalheAtendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [encerrando, setEncerrando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    api
      .get<DetalheAtendimento>(`/atendimentos/${id}`)
      .then(setDados)
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar atendimento.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function encerrarAtendimento() {
    if (!id) return;
    setEncerrando(true);
    setErroAcao('');
    try {
      await api.post(`/atendimentos/${id}/encerrar`);
      setMensagem('Atendimento encerrado com sucesso! Prossiga para o pagamento para emitir o comprovante.');
      carregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível encerrar o atendimento.');
    } finally {
      setEncerrando(false);
    }
  }

  async function abrirComprovante() {
    if (!id) return;
    setErroAcao('');
    try {
      await api.abrirArquivo(`/atendimentos/${id}/comprovante.pdf`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível abrir o comprovante PDF.');
    }
  }

  if (carregando) return <Carregando texto="Carregando atendimento…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Atendimento não encontrado.'} aoTentarNovamente={carregar} />;

  const conteudoQr = dados.checkin.codigo ? `VIAMOS:${dados.id}:${dados.checkin.codigo}` : '';

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to={`/cliente/solicitacoes/${dados.solicitacaoId}`}
            aria-label="Voltar para a solicitação"
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
              Código #{dados.id.slice(0, 8)} · previsto para {formato.dataHora(dados.inicioPrevisto)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/cliente/atendimentos/${dados.id}/sala`}>
            <Botao icone="chat">Abrir Sala</Botao>
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

      {/* QR Code para Check-in (quando AGENDADO) */}
      {dados.status === 'AGENDADO' && dados.checkin.codigo && (
        <Cartao titulo="Apresente este QR Code ao Intérprete (RF31)">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="rounded-xl border border-outline-variant bg-white p-4 shadow-xs">
              <QRCodeSVG value={conteudoQr} size={176} level="M" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-base text-on-surface">
                Quando encontrar <strong>{dados.interprete.nome}</strong> no local, mostre este QR Code ou informe o código abaixo para registrar o check-in geolocalizado.
              </p>
              <p className="text-sm text-on-surface-variant">
                Janela liberada a partir de {formato.dataHora(dados.checkin.disponivelApartirDe)}.
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-surface-container-high px-3 py-2 font-mono text-sm font-semibold text-primary">
                  {dados.checkin.codigo}
                </code>
                <Botao
                  type="button"
                  variante="secundario"
                  icone={copiado ? 'check' : 'content_copy'}
                  onClick={() => {
                    navigator.clipboard?.writeText(dados.checkin.codigo ?? '');
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2500);
                  }}
                >
                  {copiado ? 'Copiado!' : 'Copiar código'}
                </Botao>
              </div>
            </div>
          </div>
        </Cartao>
      )}

      {/* Atendimento em andamento → botão de encerrar (RF33) */}
      {dados.status === 'EM_ANDAMENTO' && (
        <Cartao titulo="Atendimento Presencial em Andamento (RF33)">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-medium text-status-online">
                Check-in realizado em {formato.dataHora(dados.checkin.lidoEm)}
                {dados.checkin.distanciaM != null ? ` (a ${dados.checkin.distanciaM} m do ponto marcado)` : ''}.
              </p>
              <p className="text-base text-on-surface-variant">
                Ao término da interpretação presencial, confirme o encerramento para apurar a duração real e liberar o pagamento.
              </p>
            </div>
            <Botao type="button" icone="stop_circle" carregando={encerrando} onClick={encerrarAtendimento}>
              Encerrar Atendimento
            </Botao>
          </div>
        </Cartao>
      )}

      {/* Ações pós-encerramento: Pagamento, Comprovante PDF e Avaliação */}
      {dados.status === 'CONCLUIDO' && (
        <Cartao titulo="Conclusão, Pagamento e Comprovante (RF36–RF40)">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-sm text-on-surface-variant">Duração real</p>
                <p className="text-lg font-bold text-on-surface">{formato.duracao(dados.duracaoRealMin)}</p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-sm text-on-surface-variant">Valor final</p>
                <p className="text-lg font-bold text-primary-container">{formato.moeda(dados.valorFinal ?? dados.valorEstimado)}</p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-sm text-on-surface-variant">Situação do pagamento</p>
                <div className="mt-1">
                  <Chip status={dados.pagamento?.status ?? 'PENDENTE'}>{dados.pagamento?.status ?? 'PENDENTE'}</Chip>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {dados.pagamento?.status !== 'PAGO' ? (
                <Botao icone="payments" onClick={() => navigate(`/cliente/atendimentos/${dados.id}/pagamento`)}>
                  Realizar Pagamento Agora
                </Botao>
              ) : (
                <Botao icone="receipt_long" onClick={abrirComprovante}>
                  Baixar Comprovante PDF
                </Botao>
              )}

              {dados.comprovante && (
                <Link to={`/verificar/${dados.comprovante.codigoVerificacao}`}>
                  <Botao variante="secundario" icone="verified">
                    Verificar Autenticidade ({dados.comprovante.codigoVerificacao})
                  </Botao>
                </Link>
              )}

              {!dados.avaliacoes.minhaAvaliacaoFeita && (
                <Link to={`/cliente/atendimentos/${dados.id}/avaliar`}>
                  <Botao variante="secundario" icone="star">
                    Avaliar Intérprete
                  </Botao>
                </Link>
              )}
            </div>
          </div>
        </Cartao>
      )}

      {/* Intérprete */}
      <Cartao titulo="Intérprete de Libras">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-xl font-bold text-on-primary">
            {dados.interprete.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold">{dados.interprete.nome}</p>
              {dados.interprete.habilitado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-xs font-semibold text-on-tertiary-fixed">
                  <Icone nome="verified" preenchido className="text-[15px] text-pro-verification" />
                  Habilitado ({dados.interprete.certificacao?.tipo ?? 'Prolibras'})
                </span>
              )}
            </div>
            <p className="text-base text-on-surface-variant">
              Telefone: {mascaras.telefone(dados.interprete.telefone)} ·{' '}
              {dados.interprete.reputacao ? `Nota ★ ${dados.interprete.reputacao.toFixed(1)}` : 'Sem avaliações'}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {dados.interprete.especialidades.map((esp) => (
                <span key={esp} className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
                  {ROTULO_TIPO_SERVICO[esp] ?? esp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Cartao>

      {/* Local e horários */}
      <Cartao titulo="Local e Registro de Horários">
        <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Tipo de serviço</p>
            <p className="mt-0.5 flex items-center gap-2 font-semibold">
              <Icone nome={ICONE_TIPO_SERVICO[dados.tipoServico]} className="text-primary-container" />
              {dados.tipoServicoRotulo}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Previsão contratada</p>
            <p className="mt-0.5 font-semibold">
              {formato.dataHora(dados.inicioPrevisto)} ({formato.duracao(dados.duracaoPrevistaMin)})
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Início real (check-in)</p>
            <p className="mt-0.5 font-semibold">{formato.dataHora(dados.inicioReal)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Término real</p>
            <p className="mt-0.5 font-semibold">{formato.dataHora(dados.fimReal)}</p>
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
        </div>
        <div className="mt-4">
          <Mapa
            posicao={{ lat: dados.local.latitude, lng: dados.local.longitude }}
            somenteLeitura
            altura="h-52"
            rotulo="Mapa do local do atendimento:"
          />
        </div>
      </Cartao>
    </div>
  );
}
