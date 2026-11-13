/**
 * Acompanhamento da Solicitação do Cliente (RF18, RF19, RF31).
 * Exibe linha do tempo de status, local no mapa, cotação, intérprete alocado,
 * QR Code para check-in presencial e cancelamento com política/taxa transparente.
 */
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, ROTULO_TIPO_SERVICO, type DetalheSolicitacao as DadosSolicitacao } from '../../api/tipos';
import { Mapa } from '../../components/Mapa';
import { Alerta, AreaTexto, Botao, Carregando, Cartao, Chip, EstadoErro, Icone } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';

interface QrCodeResposta {
  codigo: string;
  conteudo: string;
  disponivelApartirDe: string;
}

const ETAPAS_LINHA_TEMPO = [
  { status: 'BUSCANDO', rotulo: 'Buscando intérprete', icone: 'person_search' },
  { status: 'ACEITA', rotulo: 'Intérprete confirmado', icone: 'verified_user' },
  { status: 'EM_ANDAMENTO', rotulo: 'Em atendimento', icone: 'sign_language' },
  { status: 'CONCLUIDA', rotulo: 'Concluída', icone: 'task_alt' },
] as const;

export function DetalheSolicitacao() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const recemCriada = params.get('recemCriada') === '1';

  const [dados, setDados] = useState<DadosSolicitacao | null>(null);
  const [qr, setQr] = useState<QrCodeResposta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [exibirCancelar, setExibirCancelar] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(
    recemCriada ? 'Solicitação confirmada! Distribuímos sua demanda para os intérpretes habilitados em até 15 km.' : '',
  );
  const [erroAcao, setErroAcao] = useState('');
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    api
      .get<DadosSolicitacao>(`/solicitacoes/${id}`)
      .then((s) => {
        setDados(s);
        if (s.atendimento && s.atendimento.status === 'AGENDADO') {
          api
            .get<QrCodeResposta>(`/atendimentos/${s.atendimento.id}/qrcode`)
            .then(setQr)
            .catch(() => setQr(null));
        } else {
          setQr(null);
        }
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar solicitação.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function confirmarCancelamento(ev: FormEvent) {
    ev.preventDefault();
    if (!id) return;
    setCancelando(true);
    setErroAcao('');
    try {
      const atualizada = await api.post<DadosSolicitacao>(`/solicitacoes/${id}/cancelar`, {
        motivo: motivoCancelamento.trim() || undefined,
      });
      setDados(atualizada);
      setExibirCancelar(false);
      setMensagemSucesso('Solicitação cancelada com sucesso.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível cancelar a solicitação.');
    } finally {
      setCancelando(false);
    }
  }

  async function baixarComprovante(atendimentoId: string) {
    setErroAcao('');
    try {
      await api.abrirArquivo(`/atendimentos/${atendimentoId}/comprovante.pdf`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível abrir o comprovante PDF.');
    }
  }

  if (carregando) return <Carregando texto="Carregando detalhes da solicitação…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Solicitação não encontrada.'} aoTentarNovamente={carregar} />;

  const ordemStatus = ['BUSCANDO', 'ACEITA', 'EM_ANDAMENTO', 'CONCLUIDA'];
  const indiceAtual = ordemStatus.indexOf(dados.status);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/cliente"
            aria-label="Voltar ao painel"
            className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
          >
            <Icone nome="arrow_back" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">{dados.tipoServicoRotulo}</h1>
              <Chip status={dados.status}>{dados.statusRotulo}</Chip>
            </div>
            <p className="text-base text-on-surface-variant">
              Solicitação #{dados.id.slice(0, 8)} · criada em {formato.dataHora(dados.criadaEm)}
            </p>
          </div>
        </div>
        <Botao type="button" variante="secundario" icone="refresh" onClick={carregar}>
          Atualizar
        </Botao>
      </header>

      {mensagemSucesso && <Alerta tipo="sucesso">{mensagemSucesso}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Linha do tempo de status (RF18) */}
      <Cartao titulo="Acompanhamento em Tempo Real">
        {dados.status === 'CANCELADA' ? (
          <Alerta tipo="erro">
            Solicitação cancelada em {formato.dataHora(dados.cancelamento?.em)}.
            {dados.cancelamento?.motivo ? ` Motivo: ${dados.cancelamento.motivo}.` : ''}
            {dados.cancelamento?.taxa ? ` Taxa aplicada: ${formato.moeda(dados.cancelamento.taxa)}.` : ' Sem cobrança de taxa.'}
          </Alerta>
        ) : (
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ETAPAS_LINHA_TEMPO.map((etapa, idx) => {
              const concluida = idx <= indiceAtual;
              const atual = idx === indiceAtual;
              return (
                <li
                  key={etapa.status}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${
                    atual
                      ? 'border-primary-container bg-primary-fixed/50 text-on-primary-fixed font-bold'
                      : concluida
                        ? 'border-status-online/40 bg-status-online/10 text-status-online font-medium'
                        : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <Icone nome={concluida && !atual ? 'check_circle' : etapa.icone} className="text-2xl" />
                  <span className="text-sm">{etapa.rotulo}</span>
                </li>
              );
            })}
          </ol>
        )}

        {dados.status === 'BUSCANDO' && (
          <p className="mt-3 text-base text-on-surface-variant">
            {dados.ofertasEnviadas > 0
              ? `${dados.ofertasEnviadas} intérprete(s) habilitado(s) dentro do raio de até 15 km foram notificados e podem aceitar a qualquer momento.`
              : 'Buscando intérpretes habilitados e disponíveis na sua região (até 15 km).'}
          </p>
        )}
      </Cartao>

      {/* Intérprete confirmado + ações do atendimento */}
      {dados.interprete && dados.atendimento && (
        <Cartao
          titulo="Intérprete Alocado"
          acao={
            <Link to={`/cliente/atendimentos/${dados.atendimento.id}`}>
              <Botao variante="secundario" icone="open_in_new">
                Ficha do atendimento
              </Botao>
            </Link>
          }
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-xl font-bold text-on-primary">
                {dados.interprete.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-lg font-bold text-on-surface">{dados.interprete.nome}</p>
                  {dados.interprete.habilitado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-xs font-semibold text-on-tertiary-fixed">
                      <Icone nome="verified" preenchido className="text-[15px] text-pro-verification" />
                      {dados.interprete.certificacao?.tipo ?? 'Verificado'}
                    </span>
                  )}
                </div>
                <p className="text-base text-on-surface-variant">
                  {dados.interprete.reputacao
                    ? `★ ${dados.interprete.reputacao.toFixed(1)} (${dados.interprete.totalAvaliacoes} avaliações)`
                    : 'Novo na plataforma'}{' '}
                  · Tel.: {mascaras.telefone(dados.interprete.telefone)}
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

            <div className="flex flex-wrap gap-2">
              <Link to={`/cliente/atendimentos/${dados.atendimento.id}/sala`}>
                <Botao icone="chat">Sala de Atendimento</Botao>
              </Link>
              {dados.atendimento.status === 'CONCLUIDO' && dados.atendimento.pagamento?.status !== 'PAGO' && (
                <Link to={`/cliente/atendimentos/${dados.atendimento.id}/pagamento`}>
                  <Botao icone="payments">Pagar ({formato.moeda(dados.atendimento.pagamento?.valor ?? dados.atendimento.valorFinal)})</Botao>
                </Link>
              )}
              {dados.atendimento.comprovante && (
                <Botao variante="secundario" icone="receipt_long" onClick={() => baixarComprovante(dados.atendimento!.id)}>
                  Comprovante PDF
                </Botao>
              )}
              {dados.atendimento.status === 'CONCLUIDO' && !dados.atendimento.avaliacaoFeita && (
                <Link to={`/cliente/atendimentos/${dados.atendimento.id}/avaliar`}>
                  <Botao variante="secundario" icone="star">
                    Avaliar Intérprete
                  </Botao>
                </Link>
              )}
            </div>
          </div>
        </Cartao>
      )}

      {/* QR Code de Check-in Presencial (RF31) */}
      {qr && dados.atendimento && dados.atendimento.status === 'AGENDADO' && (
        <Cartao titulo="QR Code para Check-in Presencial (RF31)">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="rounded-xl border border-outline-variant bg-white p-4 shadow-xs">
              <QRCodeSVG value={qr.conteudo} size={168} level="M" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-base text-on-surface">
                Apresente este QR Code ao intérprete no encontro presencial para iniciar oficialmente o atendimento.
              </p>
              <p className="text-sm text-on-surface-variant">
                Disponível a partir de <strong>{formato.dataHora(qr.disponivelApartirDe)}</strong> (30 min antes do início previsto).
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-surface-container-high px-3 py-2 font-mono text-sm font-semibold text-primary">
                  {qr.codigo}
                </code>
                <Botao
                  type="button"
                  variante="secundario"
                  icone={copiado ? 'check' : 'content_copy'}
                  onClick={() => {
                    navigator.clipboard?.writeText(qr.codigo);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2500);
                  }}
                >
                  {copiado ? 'Código copiado' : 'Copiar código manual'}
                </Botao>
              </div>
            </div>
          </div>
        </Cartao>
      )}

      {/* Detalhes do Agendamento e Mapa */}
      <Cartao titulo="Dados do Atendimento Presencial">
        <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Serviço</p>
            <p className="mt-0.5 flex items-center gap-2 font-semibold">
              <Icone nome={ICONE_TIPO_SERVICO[dados.tipoServico]} className="text-primary-container" />
              {dados.tipoServicoRotulo}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <p className="text-sm text-on-surface-variant">Início previsto e duração</p>
            <p className="mt-0.5 font-semibold">
              {formato.dataHora(dados.inicioPrevisto)} · {formato.duracao(dados.duracaoPrevistaMin)}
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
              <p className="text-sm text-on-surface-variant">Observações</p>
              <p className="mt-0.5">{dados.observacoes}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Mapa
            posicao={{ lat: dados.local.latitude, lng: dados.local.longitude }}
            somenteLeitura
            altura="h-52"
            rotulo="Localização registrada do encontro presencial:"
          />
        </div>
      </Cartao>

      {/* Cotação / Resumo Financeiro */}
      {dados.cotacao && (
        <Cartao titulo="Detalhamento do Valor">
          <div className="flex flex-col gap-2 text-base">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Serviço de interpretação</span>
              <span className="font-medium">{formato.moeda(dados.cotacao.valorServico)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Deslocamento fixo</span>
              <span className="font-medium">{formato.moeda(dados.cotacao.valorDeslocamento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Taxa da plataforma (10%)</span>
              <span className="font-medium">{formato.moeda(dados.cotacao.taxaPlataforma)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-outline-variant/60 pt-2 text-lg font-bold text-primary">
              <span>{dados.atendimento?.valorFinal ? 'Valor final apurado' : 'Valor total estimado'}</span>
              <span>{formato.moeda(dados.atendimento?.valorFinal ?? dados.cotacao.valorTotal)}</span>
            </div>
          </div>
        </Cartao>
      )}

      {/* Política e Ação de Cancelamento (RF19) */}
      {dados.politicaCancelamento.permitido && (
        <Cartao titulo="Cancelamento da Solicitação (RF19)">
          <p className="text-base text-on-surface-variant">
            {dados.politicaCancelamento.motivo}{' '}
            {dados.politicaCancelamento.taxa > 0 && (
              <strong className="text-error">Taxa aplicável agora: {formato.moeda(dados.politicaCancelamento.taxa)}.</strong>
            )}
          </p>

          {!exibirCancelar ? (
            <div className="mt-3">
              <Botao type="button" variante="perigo" icone="cancel" onClick={() => setExibirCancelar(true)}>
                Cancelar Solicitação
              </Botao>
            </div>
          ) : (
            <form onSubmit={confirmarCancelamento} className="mt-4 flex flex-col gap-3 rounded-xl border border-error/40 bg-error-container/20 p-4">
              <AreaTexto
                rotulo="Motivo do cancelamento (opcional)"
                placeholder="Informe o motivo caso deseje registrar..."
                maxLength={300}
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Botao type="submit" variante="perigo" icone="delete_forever" carregando={cancelando}>
                  Confirmar Cancelamento
                </Botao>
                <Botao type="button" variante="secundario" onClick={() => setExibirCancelar(false)}>
                  Manter Solicitação
                </Botao>
              </div>
            </form>
          )}
        </Cartao>
      )}
    </div>
  );
}
