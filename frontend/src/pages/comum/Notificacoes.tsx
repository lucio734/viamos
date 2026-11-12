/**
 * RF42 — Central de notificações internas (aceite, lembrete, mensagens, pagamento, certificação, sistema).
 * Inclui os 4 estados visuais (item #32): carregando, erro com tentar novamente, vazio e alerta de sucesso.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { Notificacao } from '../../api/tipos';
import { Alerta, Botao, Carregando, Chip, EstadoErro, EstadoVazio, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

const ICONE_NOTIFICACAO: Record<string, string> = {
  SOLICITACAO: 'assignment',
  NOVA_DEMANDA: 'campaign',
  ACEITE: 'handshake',
  LEMBRETE: 'schedule',
  MENSAGEM: 'chat',
  CHECKIN: 'qr_code_scanner',
  ENCERRAMENTO: 'task_alt',
  PAGAMENTO: 'payments',
  CERTIFICACAO: 'verified',
  SISTEMA: 'notifications',
};

export function Notificacoes() {
  const navigate = useNavigate();
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    const sufixo = apenasNaoLidas ? '?naoLidas=true' : '';
    api
      .get<Notificacao[]>(`/notificacoes${sufixo}`)
      .then(setItens)
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Não foi possível carregar as notificações.'))
      .finally(() => setCarregando(false));
  }, [apenasNaoLidas]);

  useEffect(carregar, [carregar]);

  async function marcarUmaComoLida(n: Notificacao, abrirDestino: boolean) {
    setSucesso('');
    if (!n.lida) {
      try {
        await api.post(`/notificacoes/${n.id}/lida`);
        setItens((atual) => (apenasNaoLidas ? atual.filter((i) => i.id !== n.id) : atual.map((i) => (i.id === n.id ? { ...i, lida: true } : i))));
      } catch (e) {
        setErro(e instanceof ErroApi ? e.mensagem : 'Não foi possível atualizar a notificação.');
        return;
      }
    }
    if (abrirDestino && n.referenciaRecurso) {
      navigate(n.referenciaRecurso);
    }
  }

  async function marcarTodasComoLidas() {
    setMarcandoTodas(true);
    setErro('');
    setSucesso('');
    try {
      const { atualizadas } = await api.post<{ atualizadas: number }>('/notificacoes/ler-todas');
      setItens((atual) => (apenasNaoLidas ? [] : atual.map((i) => ({ ...i, lida: true }))));
      setSucesso(atualizadas > 0 ? `${atualizadas} notificação(ões) marcada(s) como lida(s).` : 'Todas as notificações já estavam lidas.');
    } catch (e) {
      setErro(e instanceof ErroApi ? e.mensagem : 'Não foi possível marcar as notificações como lidas.');
    } finally {
      setMarcandoTodas(false);
    }
  }

  const totalNaoLidas = itens.filter((n) => !n.lida).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-on-surface-variant">Avisos sobre suas solicitações, atendimentos, pagamentos e documentação.</p>
        </div>
        {totalNaoLidas > 0 && (
          <Botao type="button" variante="secundario" icone="done_all" carregando={marcandoTodas} onClick={marcarTodasComoLidas}>
            Marcar todas como lidas ({totalNaoLidas})
          </Botao>
        )}
      </header>

      <div role="group" aria-label="Filtrar notificações" className="flex gap-2">
        <button
          type="button"
          aria-pressed={!apenasNaoLidas}
          onClick={() => setApenasNaoLidas(false)}
          className={`min-h-touch rounded-lg px-4 py-2 text-sm font-semibold transition ${
            !apenasNaoLidas ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          aria-pressed={apenasNaoLidas}
          onClick={() => setApenasNaoLidas(true)}
          className={`min-h-touch rounded-lg px-4 py-2 text-sm font-semibold transition ${
            apenasNaoLidas ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Não lidas
        </button>
      </div>

      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {carregando ? (
        <Carregando texto="Carregando notificações…" />
      ) : erro ? (
        <EstadoErro mensagem={erro} aoTentarNovamente={carregar} />
      ) : itens.length === 0 ? (
        <EstadoVazio
          icone="notifications_none"
          titulo={apenasNaoLidas ? 'Nenhuma notificação não lida' : 'Você ainda não tem notificações'}
          descricao="Quando houver atualizações em solicitações, mensagens ou pagamentos, elas aparecerão aqui."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {itens.map((n) => (
            <li key={n.id}>
              <article
                className={`cartao flex flex-col gap-3 transition ${
                  n.lida ? 'opacity-80' : 'border-primary-container/50 bg-primary-fixed/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                      n.lida ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    <Icone nome={ICONE_NOTIFICACAO[n.tipo] ?? 'notifications'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-semibold text-on-surface">{n.titulo}</h2>
                      <div className="flex items-center gap-2">
                        {!n.lida && <Chip status="ACEITA">Nova</Chip>}
                        <span className="text-xs text-on-surface-variant">{formato.dataHora(n.criadaEm)}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-base text-on-surface-variant">{n.conteudo}</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {!n.lida && (
                    <Botao type="button" variante="secundario" icone="check" onClick={() => marcarUmaComoLida(n, false)}>
                      Marcar como lida
                    </Botao>
                  )}
                  {n.referenciaRecurso && (
                    <Botao type="button" variante="primario" icone="open_in_new" onClick={() => marcarUmaComoLida(n, true)}>
                      Abrir detalhe
                    </Botao>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
