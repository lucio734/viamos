import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { CertificacaoBackoffice } from '../../api/tipos';
import { Alerta, AreaTexto, Botao, Carregando, Cartao, Chip, Selecao } from '../../components/ui';

/**
 * Parecer de Certificação Documental (`/backoffice/certificacoes/:id`).
 * RF06 — Permite inspecionar o documento enviado e aprovar, solicitar correção ou recusar com justificativa.
 */
export function ParecerCertificacao() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [certificacao, setCertificacao] = useState<CertificacaoBackoffice | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [resultado, setResultado] = useState<'APROVADO' | 'CORRECAO' | 'REPROVADO'>('APROVADO');
  const [justificativa, setJustificativa] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    setErro(null);
    try {
      const lista = await api.get<CertificacaoBackoffice[]>('/backoffice/certificacoes');
      const item = lista.find((c) => c.id === id) ?? null;
      if (!item) {
        setErro('Certificação não encontrada.');
      }
      setCertificacao(item);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Falha ao carregar dados da certificação.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function visualizarArquivo() {
    if (!certificacao) return;
    try {
      await api.abrirArquivo(`/backoffice/certificacoes/${certificacao.id}/arquivo`, certificacao.nomeArquivo);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Não foi possível abrir o arquivo da certificação.');
    }
  }

  async function registrarParecer(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setErro(null);
    setSucesso(null);

    if (resultado !== 'APROVADO' && justificativa.trim().length < 5) {
      setErro('Informe uma justificativa clara (mínimo de 5 caracteres) ao recusar ou solicitar correção.');
      return;
    }

    setEnviando(true);
    try {
      await api.post(`/backoffice/certificacoes/${id}/parecer`, {
        resultado,
        justificativa: justificativa.trim() || undefined,
      });
      setSucesso('Parecer registrado com sucesso! O intérprete foi notificado.');
      await carregar();
      setTimeout(() => nav('/backoffice'), 1200);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : 'Erro ao registrar parecer.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <Carregando />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/backoffice" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar para a fila de certificações
          </Link>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
            Análise e Parecer de Certificação
          </h1>
        </div>
        {certificacao && <Chip status={certificacao.status}>{certificacao.status}</Chip>}
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {certificacao && (
        <div className="grid md:grid-cols-2 gap-6">
          <Cartao className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_check</span>
              Dados do Intérprete
            </h2>

            {certificacao.interprete ? (
              <dl className="space-y-2.5 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome Completo</dt>
                  <dd className="font-semibold text-on-surface">{certificacao.interprete.nome}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">E-mail</dt>
                  <dd className="text-on-surface">{certificacao.interprete.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">CPF</dt>
                  <dd className="font-mono text-on-surface">{certificacao.interprete.documento}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Status de Habilitação Atual
                  </dt>
                  <dd className="mt-0.5">
                    <Chip status={certificacao.interprete.statusHabilitacao}>
                      {certificacao.interprete.statusHabilitacao}
                    </Chip>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Especialidades</dt>
                  <dd className="flex flex-wrap gap-1.5 mt-1">
                    {certificacao.interprete.especialidades.map((esp) => (
                      <span
                        key={esp}
                        className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold"
                      >
                        {esp}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-on-surface-variant">Dados do intérprete indisponíveis.</p>
            )}

            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
              <h3 className="font-headline font-bold text-sm text-on-surface">Documento Comprobatório</h3>
              <p className="text-xs text-on-surface-variant">
                Tipo: <strong>{certificacao.tipo}</strong> • Registro Nº <strong>{certificacao.numero}</strong>
              </p>
              <p className="text-xs text-on-surface-variant">
                Arquivo: {certificacao.nomeArquivo} ({Math.round(certificacao.tamanhoBytes / 1024)} KB •{' '}
                {certificacao.mimeArquivo})
              </p>
              <Botao variante="secundario" icone="open_in_new" onClick={visualizarArquivo} largo className="mt-2">
                Inspecionar documento enviado
              </Botao>
            </div>
          </Cartao>

          <Cartao className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">gavel</span>
              Emitir Parecer Técnico (RF06)
            </h2>

            <form onSubmit={registrarParecer} className="space-y-4">
              <Selecao
                rotulo="Decisão da Análise"
                value={resultado}
                onChange={(e) => setResultado(e.target.value as 'APROVADO' | 'CORRECAO' | 'REPROVADO')}
                opcoes={[
                  { valor: 'APROVADO', rotulo: 'Aprovar certificação e habilitar intérprete' },
                  { valor: 'CORRECAO', rotulo: 'Solicitar correção / reenvio de documento' },
                  { valor: 'REPROVADO', rotulo: 'Recusar certificação' },
                ]}
              />

              <AreaTexto
                rotulo={
                  resultado === 'APROVADO'
                    ? 'Observação interna / parecer (opcional)'
                    : 'Justificativa obrigatória para o intérprete'
                }
                rows={4}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder={
                  resultado === 'APROVADO'
                    ? 'Ex.: Certificado Prolibras conferido e válido.'
                    : 'Explique claramente o motivo da recusa ou qual documento precisa ser reenviado...'
                }
              />

              <Botao type="submit" carregando={enviando} icone="check_circle" largo>
                Confirmar e Registrar Parecer
              </Botao>
            </form>

            {certificacao.analises.length > 0 && (
              <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  Histórico de Pareceres Anteriores
                </h3>
                <ul className="space-y-2 text-xs">
                  {certificacao.analises.map((a, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-surface-container-low space-y-1">
                      <div className="flex items-center justify-between font-bold text-on-surface">
                        <span>{a.resultado}</span>
                        <span className="text-on-surface-variant font-normal">
                          {new Date(a.data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {a.justificativa && <p className="text-on-surface-variant">{a.justificativa}</p>}
                      <p className="text-[11px] text-on-surface-variant">Operador: {a.operador}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Cartao>
        </div>
      )}
    </div>
  );
}
