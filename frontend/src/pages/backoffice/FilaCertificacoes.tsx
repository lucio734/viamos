import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { CertificacaoBackoffice, IndicadoresBackoffice } from '../../api/tipos';
import { Alerta, Botao, Carregando, Cartao, Chip, EstadoVazio } from '../../components/ui';

/**
 * Fila de Certificações e Painel Operacional do Backoffice (`/backoffice`).
 * RF06 — Análise documental de certificações Prolibras ou equivalentes.
 */
export function FilaCertificacoes() {
  const [indicadores, setIndicadores] = useState<IndicadoresBackoffice | null>(null);
  const [certificacoes, setCertificacoes] = useState<CertificacaoBackoffice[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('EM_ANALISE');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const qs = filtroStatus ? `?status=${encodeURIComponent(filtroStatus)}` : '';
      const [ind, lista] = await Promise.all([
        api.get<IndicadoresBackoffice>('/backoffice/indicadores'),
        api.get<CertificacaoBackoffice[]>(`/backoffice/certificacoes${qs}`),
      ]);
      setIndicadores(ind);
      setCertificacoes(lista);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível carregar a fila de certificações.');
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirDocumento(id: string, nomeArquivo: string) {
    try {
      await api.abrirArquivo(`/backoffice/certificacoes/${id}/arquivo`, nomeArquivo);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Erro ao abrir documento de certificação.');
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Backoffice Víamos • RF06</p>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
            Fila de Certificações e Habilitação
          </h1>
          <p className="text-sm text-on-surface-variant">
            Valide certificados Prolibras ou equivalentes para habilitar intérpretes a receber demandas presenciais.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/backoffice/chamados">
            <Botao variante="secundario" icone="support_agent">
              Chamados ({indicadores?.chamadosAbertos ?? 0})
            </Botao>
          </Link>
          <Link to="/backoffice/auditoria">
            <Botao variante="secundario" icone="policy">
              Auditoria
            </Botao>
          </Link>
        </div>
      </header>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {indicadores && (
        <section className="grid grid-cols-2 lg:grid-cols-6 gap-4" aria-label="Indicadores operacionais">
          <Cartao className="space-y-1 bg-amber-50/70 border border-amber-300/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Em Análise</span>
            <p className="font-headline font-extrabold text-2xl text-amber-900">
              {indicadores.certificacoesEmAnalise}
            </p>
          </Cartao>
          <Cartao className="space-y-1 bg-emerald-50/70 border border-emerald-300/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Cert. Aprovadas</span>
            <p className="font-headline font-extrabold text-2xl text-emerald-900">
              {indicadores.certificacoesAprovadas}
            </p>
          </Cartao>
          <Cartao className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Intérpretes Ativos
            </span>
            <p className="font-headline font-extrabold text-2xl text-primary">
              {indicadores.interpretesAprovados} / {indicadores.interpretes}
            </p>
          </Cartao>
          <Cartao className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Clientes Cadastrados
            </span>
            <p className="font-headline font-extrabold text-2xl text-on-surface">{indicadores.clientes}</p>
          </Cartao>
          <Cartao className="space-y-1 lg:col-span-2 bg-error-container/20 border border-error/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-error">
                  Chamados em Aberto (RF34)
                </span>
                <p className="font-headline font-extrabold text-2xl text-on-surface mt-0.5">
                  {indicadores.chamadosAbertos}
                </p>
              </div>
              <Link to="/backoffice/chamados" className="text-xs font-bold text-primary hover:underline">
                Gerenciar →
              </Link>
            </div>
          </Cartao>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status da certificação">
          {[
            { valor: 'EM_ANALISE', rotulo: 'Em Análise' },
            { valor: 'APROVADA', rotulo: 'Aprovadas' },
            { valor: 'CORRECAO_SOLICITADA', rotulo: 'Correção Solicitada' },
            { valor: 'REPROVADA', rotulo: 'Reprovadas' },
            { valor: '', rotulo: 'Todas' },
          ].map((aba) => {
            const ativo = filtroStatus === aba.valor;
            return (
              <button
                key={aba.valor || 'TODAS'}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setFiltroStatus(aba.valor)}
                className={`min-h-touch inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition ${
                  ativo
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {aba.rotulo}
              </button>
            );
          })}
        </div>

        <Botao variante="secundario" icone="refresh" onClick={carregar}>
          Atualizar fila
        </Botao>
      </div>

      {carregando ? (
        <Carregando />
      ) : certificacoes.length === 0 ? (
        <EstadoVazio
          icone="verified"
          titulo="Nenhuma certificação neste filtro"
          descricao="Altere o filtro acima para consultar certificações já analisadas ou aguarde novos envios."
        />
      ) : (
        <div className="grid gap-4">
          {certificacoes.map((c) => (
            <Cartao key={c.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip status={c.status}>{c.status}</Chip>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold">
                    {c.tipo} • Nº {c.numero}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Enviada em {new Date(c.enviadaEm).toLocaleString('pt-BR')}
                  </span>
                </div>

                {c.interprete && (
                  <div>
                    <h2 className="font-headline font-bold text-lg text-on-surface">{c.interprete.nome}</h2>
                    <p className="text-xs text-on-surface-variant">
                      {c.interprete.email} • CPF: {c.interprete.documento} • Habilitação atual:{' '}
                      <strong>{c.interprete.statusHabilitacao}</strong>
                    </p>
                    {c.interprete.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {c.interprete.especialidades.map((esp) => (
                          <span
                            key={esp}
                            className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-semibold"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">attach_file</span>
                  {c.nomeArquivo} ({Math.round(c.tamanhoBytes / 1024)} KB)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Botao
                  variante="secundario"
                  icone="visibility"
                  onClick={() => abrirDocumento(c.id, c.nomeArquivo)}
                >
                  Ver arquivo
                </Botao>
                <Link to={`/backoffice/certificacoes/${c.id}`}>
                  <Botao icone="fact_check">
                    {c.status === 'EM_ANALISE' ? 'Emitir parecer' : 'Detalhes / Novo parecer'}
                  </Botao>
                </Link>
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </div>
  );
}
