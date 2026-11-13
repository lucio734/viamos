import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { LogAuditoriaItem } from '../../api/tipos';
import { Alerta, Botao, Campo, Carregando, Cartao, EstadoVazio } from '../../components/ui';

/**
 * Trilha Imutável de Auditoria (`/backoffice/auditoria`).
 * RF44 / RNF08 — Consulta filtrável de eventos críticos registrados pela plataforma.
 */
export function TrilhaAuditoria() {
  const [logs, setLogs] = useState<LogAuditoriaItem[]>([]);
  const [tipo, setTipo] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (tipo.trim()) params.set('tipo', tipo.trim());
      if (de) params.set('de', de);
      if (ate) params.set('ate', ate);
      params.set('limite', '200');
      const qs = params.toString();
      const lista = await api.get<LogAuditoriaItem[]>(`/backoffice/auditoria?${qs}`);
      setLogs(lista);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Falha ao carregar trilha de auditoria.');
    } finally {
      setCarregando(false);
    }
  }, [tipo, de, ate]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function filtrar(e: FormEvent) {
    e.preventDefault();
    carregar();
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
            Trilha de Auditoria (RF44)
          </h1>
          <p className="text-sm text-on-surface-variant">
            Registro cronológico de eventos de autenticação, análise documental, check-in, pagamentos e LGPD.
          </p>
        </div>
      </header>

      <Cartao>
        <form onSubmit={filtrar} className="grid sm:grid-cols-4 gap-3 items-end">
          <Campo
            rotulo="Tipo de evento"
            icone="filter_alt"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex.: LOGIN_SUCESSO, CHECKIN..."
          />
          <Campo rotulo="Data inicial" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          <Campo rotulo="Data final" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          <div className="flex gap-2">
            <Botao type="submit" icone="search" className="flex-1">
              Filtrar
            </Botao>
            <Botao
              type="button"
              variante="secundario"
              onClick={() => {
                setTipo('');
                setDe('');
                setAte('');
              }}
            >
              Limpar
            </Botao>
          </div>
        </form>
      </Cartao>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {carregando ? (
        <Carregando />
      ) : logs.length === 0 ? (
        <EstadoVazio
          icone="policy"
          titulo="Nenhum evento encontrado"
          descricao="Ajuste os filtros acima para consultar eventos registrados na trilha de auditoria."
        />
      ) : (
        <Cartao className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">Usuário / IP</th>
                <th className="py-3 px-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/60">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-on-surface-variant">
                    {new Date(log.criadoEm).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-bold text-primary whitespace-nowrap">{log.tipo}</td>
                  <td className="py-3 px-4 text-on-surface">
                    {log.entidade ? (
                      <span>
                        {log.entidade}{' '}
                        {log.entidadeId && (
                          <span className="font-mono text-[11px] text-on-surface-variant">
                            ({log.entidadeId.slice(0, 8)}…)
                          </span>
                        )}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                    <div>{log.usuarioId ? `${log.usuarioId.slice(0, 8)}…` : 'Público/Sistema'}</div>
                    {log.ip && <div>IP: {log.ip}</div>}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant max-w-md truncate">
                    {log.detalhes ? JSON.stringify(log.detalhes) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>
      )}
    </div>
  );
}
