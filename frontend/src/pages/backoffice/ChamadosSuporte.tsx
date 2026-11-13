import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { ChamadoBackoffice } from '../../api/tipos';
import { Mapa } from '../../components/Mapa';
import { Alerta, Botao, Carregando, Cartao, Chip, EstadoVazio } from '../../components/ui';

/**
 * Gestão de Chamados de Suporte e Emergência (`/backoffice/chamados`).
 * RF34 — Permite tratar alertas de emergência (com geolocalização) e chamados de suporte abertos.
 */
export function ChamadosSuporte() {
  const [chamados, setChamados] = useState<ChamadoBackoffice[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const qs = filtroStatus ? `?status=${encodeURIComponent(filtroStatus)}` : '';
      const lista = await api.get<ChamadoBackoffice[]>(`/backoffice/chamados${qs}`);
      setChamados(lista);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Falha ao carregar chamados de suporte.');
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function atualizarStatus(id: string, status: 'EM_ATENDIMENTO' | 'ENCERRADO') {
    setAtualizandoId(id);
    setErro(null);
    try {
      await api.post(`/backoffice/chamados/${id}/status`, { status });
      await carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível atualizar o status do chamado.');
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/backoffice" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar para Fila de Certificações
          </Link>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
            Chamados de Suporte e Emergência (RF34)
          </h1>
          <p className="text-sm text-on-surface-variant">
            Monitore acionamentos de SOS com coordenadas em tempo real e solicitações de suporte operacional.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { valor: '', rotulo: 'Todos' },
            { valor: 'ABERTO', rotulo: 'Abertos' },
            { valor: 'EM_ATENDIMENTO', rotulo: 'Em Atendimento' },
            { valor: 'ENCERRADO', rotulo: 'Encerrados' },
          ].map((aba) => (
            <button
              key={aba.valor || 'TODOS'}
              type="button"
              onClick={() => setFiltroStatus(aba.valor)}
              className={`min-h-touch inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filtroStatus === aba.valor
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {aba.rotulo}
            </button>
          ))}
        </div>
      </header>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {carregando ? (
        <Carregando />
      ) : chamados.length === 0 ? (
        <EstadoVazio
          icone="support_agent"
          titulo="Nenhum chamado encontrado"
          descricao="Não há chamados de suporte ou emergência com o filtro selecionado."
        />
      ) : (
        <div className="space-y-4">
          {chamados.map((c) => {
            const emergencia = c.tipo === 'EMERGENCIA';
            return (
              <Cartao
                key={c.id}
                className={`space-y-4 ${
                  emergencia && c.status !== 'ENCERRADO' ? 'border-2 border-error bg-error-container/10' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                          emergencia ? 'bg-error text-on-error' : 'bg-primary-fixed text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {emergencia ? 'emergency' : 'support_agent'}
                        </span>
                        {emergencia ? 'SOS Emergência' : 'Suporte'}
                      </span>
                      <Chip status={c.status}>{c.status}</Chip>
                      <span className="text-xs text-on-surface-variant">
                        Aberto em {new Date(c.abertoEm).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {c.solicitante && (
                      <p className="font-headline font-bold text-base text-on-surface">
                        {c.solicitante.nome}{' '}
                        <span className="text-xs font-normal text-on-surface-variant">
                          ({c.solicitante.papel}
                          {c.solicitante.telefone ? ` • Tel: ${c.solicitante.telefone}` : ''})
                        </span>
                      </p>
                    )}

                    {c.descricao && <p className="text-sm text-on-surface">{c.descricao}</p>}

                    {c.atendimento && (
                      <p className="text-xs text-on-surface-variant">
                        Atendimento vinculado: <span className="font-mono">{c.atendimento.id}</span> (Status:{' '}
                        <strong>{c.atendimento.status}</strong>)
                      </p>
                    )}
                  </div>

                  {c.status !== 'ENCERRADO' && (
                    <div className="flex flex-wrap gap-2">
                      {c.status === 'ABERTO' && (
                        <Botao
                          variante="secundario"
                          icone="headset_mic"
                          carregando={atualizandoId === c.id}
                          onClick={() => atualizarStatus(c.id, 'EM_ATENDIMENTO')}
                        >
                          Assumir atendimento
                        </Botao>
                      )}
                      <Botao
                        icone="task_alt"
                        carregando={atualizandoId === c.id}
                        onClick={() => atualizarStatus(c.id, 'ENCERRADO')}
                      >
                        Encerrar chamado
                      </Botao>
                    </div>
                  )}
                </div>

                {c.latitude !== null && c.longitude !== null && (
                  <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                    <p className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-error">my_location</span>
                      Localização reportada no acionamento ({c.latitude.toFixed(5)}, {c.longitude.toFixed(5)})
                    </p>
                    <Mapa
                      posicao={{ lat: c.latitude, lng: c.longitude }}
                      altura="h-48"
                      somenteLeitura
                    />
                  </div>
                )}
              </Cartao>
            );
          })}
        </div>
      )}
    </div>
  );
}
