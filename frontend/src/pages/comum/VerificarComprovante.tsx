import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { VerificacaoComprovante } from '../../api/tipos';
import { TelaPublica } from '../../components/TelaPublica';
import { Alerta, Botao, Campo, Carregando, Cartao } from '../../components/ui';

/**
 * Verificação Pública de Comprovante de Atendimento (`/verificar/:codigo`).
 * RF38 — Consulta pública sem necessidade de login para atestar a autenticidade do atendimento.
 */
export function VerificarComprovante() {
  const { codigo } = useParams<{ codigo: string }>();
  const nav = useNavigate();

  const [dados, setDados] = useState<VerificacaoComprovante | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [codigoBusca, setCodigoBusca] = useState(codigo ?? '');

  useEffect(() => {
    let ativo = true;
    setCodigoBusca(codigo ?? '');
    if (!codigo) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    api
      .get<VerificacaoComprovante>(`/comprovantes/${encodeURIComponent(codigo)}/verificar`)
      .then((res) => {
        if (ativo) setDados(res);
      })
      .catch((e) => {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 404) {
          setDados({ valido: false });
        } else {
          setErro(e instanceof ErroApi ? e.message : 'Falha ao consultar comprovante.');
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [codigo]);

  function consultarOutro(e: FormEvent) {
    e.preventDefault();
    const limpo = codigoBusca.trim();
    if (!limpo) return;
    nav(`/verificar/${encodeURIComponent(limpo)}`);
  }

  return (
    <TelaPublica
      titulo="Verificação de Comprovante"
      subtitulo="Validação pública de autenticidade de comprovante emitido pela plataforma Víamos (RF38)."
      largura="xl"
    >
      <div className="space-y-6">
        <Cartao className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </span>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Consultar Código de Autenticidade
              </h2>
              <p className="text-xs text-on-surface-variant">
                Informe o código impresso no rodapé do comprovante PDF ou escaneado via QR Code.
              </p>
            </div>
          </div>

          <form onSubmit={consultarOutro} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Campo
                rotulo="Código de verificação"
                icone="qr_code_2"
                value={codigoBusca}
                onChange={(e) => setCodigoBusca(e.target.value)}
                placeholder="Ex.: VM-2026-ABCD1234"
              />
            </div>
            <Botao type="submit" icone="search">
              Verificar
            </Botao>
          </form>
        </Cartao>

        {erro && <Alerta tipo="erro">{erro}</Alerta>}

        {carregando ? (
          <Carregando />
        ) : dados?.valido ? (
          <Cartao className="border-2 border-emerald-500/40 bg-emerald-50/40 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </span>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    Comprovante Autêntico
                  </span>
                  <h2 className="font-headline font-extrabold text-xl text-on-surface mt-1">
                    {dados.tipoServico}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Código Verificado
                </p>
                <p className="font-mono font-bold text-sm text-primary">{dados.codigoVerificacao}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-white/80">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Data do Atendimento
                </p>
                <p className="font-semibold text-on-surface mt-1">
                  {dados.dataAtendimento
                    ? new Date(dados.dataAtendimento).toLocaleString('pt-BR', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })
                    : '—'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/80">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Duração Real Auditada
                </p>
                <p className="font-semibold text-on-surface mt-1">
                  {dados.duracaoRealMin ? `${dados.duracaoRealMin} minutos` : 'Conforme agendamento'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/80 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Local / Endereço Registrado
                </p>
                <p className="font-semibold text-on-surface mt-1">{dados.cidadeOuEndereco || '—'}</p>
              </div>
              {dados.interprete && (
                <div className="p-3.5 rounded-xl bg-white/80 sm:col-span-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Intérprete Habilitado Responsável
                    </p>
                    <p className="font-semibold text-on-surface mt-1">{dados.interprete.nome}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary text-xs font-bold">
                    {dados.interprete.certificacao}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-on-surface-variant pt-2 border-t border-emerald-500/20">
              Comprovante emitido eletronicamente em{' '}
              {dados.emitidoEm ? new Date(dados.emitidoEm).toLocaleString('pt-BR') : '—'} pela plataforma Víamos.
            </p>
          </Cartao>
        ) : (
          <Cartao className="border-2 border-error/40 bg-error-container/20 space-y-3 text-center py-8">
            <span className="material-symbols-outlined text-4xl text-error">gpp_bad</span>
            <h2 className="font-headline font-bold text-xl text-on-surface">
              Comprovante não encontrado ou inválido
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Não localizamos nenhum comprovante oficial correspondente ao código{' '}
              <strong className="font-mono text-on-surface">{codigo}</strong>. Confira se todos os caracteres foram
              digitados corretamente.
            </p>
          </Cartao>
        )}

        <div className="flex justify-center">
          <Link to="/login" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar ao acesso da plataforma
          </Link>
        </div>
      </div>
    </TelaPublica>
  );
}
