/**
 * Avaliação Pós-Atendimento Bilateral (RF40, protótipo Stitch code (3).html).
 * Compartilhada entre:
 *   - /cliente/atendimentos/:id/avaliar (cliente avalia intérprete)
 *   - /interprete/atendimentos/:id/avaliar (intérprete avalia cliente)
 * Regras:
 *   - Nota de 1 a 5 estrelas ("Ruim", "Regular", "Bom", "Muito Bom", "Excelente")
 *   - Comentário opcional (máx. 500 caracteres)
 *   - Impede avaliação duplicada pelo mesmo participante
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import type { DetalheAtendimento } from '../../api/tipos';
import { Alerta, AreaTexto, Botao, Carregando, EstadoErro, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

const ROTULOS_NOTA: Record<number, string> = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito Bom',
  5: 'Excelente',
};

export function AvaliarAtendimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [atendimento, setAtendimento] = useState<DetalheAtendimento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const carregar = useCallback(() => {
    if (!id) return;
    setCarregando(true);
    setErro('');
    api
      .get<DetalheAtendimento>(`/atendimentos/${id}`)
      .then(setAtendimento)
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar atendimento.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function enviarAvaliacao(ev: FormEvent) {
    ev.preventDefault();
    if (!id) return;
    setEnviando(true);
    setErroEnvio('');
    try {
      await api.post(`/atendimentos/${id}/avaliacoes`, {
        nota,
        comentario: comentario.trim() || undefined,
      });
      setSucesso(true);
      carregar();
    } catch (e) {
      setErroEnvio(e instanceof ErroApi ? e.mensagem : 'Não foi possível registrar sua avaliação.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando avaliação…" />;
  if (erro || !atendimento) return <EstadoErro mensagem={erro || 'Atendimento não encontrado.'} aoTentarNovamente={carregar} />;

  const souCliente = atendimento.papelNoAtendimento === 'CLIENTE';
  const contraparteRotulo = souCliente ? 'Intérprete' : 'Cliente';
  const contraparteNome = souCliente ? atendimento.interprete.nome : atendimento.cliente.nome;
  const rotaDestino = souCliente ? `/cliente/atendimentos/${atendimento.id}` : `/interprete/atendimentos/${atendimento.id}`;
  const jaAvaliou = atendimento.avaliacoes.minhaAvaliacaoFeita || sucesso;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      {/* Cartão Principal fiel ao code (3).html */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <header className="bg-primary-container p-6 text-center text-on-primary">
          <h1 className="mb-1 text-2xl font-bold text-white">Avaliação do Atendimento</h1>
          <p className="text-base text-primary-fixed-dim">
            Sua opinião é fundamental para melhorarmos a acessibilidade presencial.
          </p>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Resumo do atendimento (code (3).html) */}
          <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low p-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-on-surface-variant">{contraparteRotulo}:</span>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary">
                  {contraparteNome.charAt(0).toUpperCase()}
                </span>
                <span className="text-lg font-semibold text-on-surface">{contraparteNome}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-on-surface-variant">Duração:</span>
              <span className="text-base font-semibold text-on-surface">
                {formato.duracao(atendimento.duracaoRealMin ?? atendimento.duracaoPrevistaMin)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-on-surface-variant">Serviço:</span>
              <span className="text-base text-on-surface">{atendimento.tipoServicoRotulo}</span>
            </div>
          </div>

          {erroEnvio && <Alerta tipo="erro">{erroEnvio}</Alerta>}

          {jaAvaliou ? (
            <div className="flex flex-col gap-4">
              <Alerta tipo="sucesso">
                Sua avaliação foi registrada com sucesso! Agradecemos por fortalecer a comunidade Víamos.
              </Alerta>
              <Link to={rotaDestino}>
                <Botao largo icone="arrow_back">
                  Voltar ao Atendimento
                </Botao>
              </Link>
            </div>
          ) : atendimento.status !== 'CONCLUIDO' ? (
            <div className="flex flex-col gap-4">
              <Alerta tipo="aviso">
                A avaliação é liberada após a conclusão do atendimento presencial.
              </Alerta>
              <Link to={rotaDestino}>
                <Botao variante="secundario" largo icone="arrow_back">
                  Voltar ao Atendimento
                </Botao>
              </Link>
            </div>
          ) : (
            <form onSubmit={enviarAvaliacao} className="flex flex-col gap-6">
              {/* Seletor de estrelas (1 a 5) */}
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-center text-xl font-semibold text-on-surface">
                  {souCliente ? 'Como você avalia a interpretação?' : 'Como foi o atendimento com o cliente?'}
                </h2>
                <div role="radiogroup" aria-label="Nota de 1 a 5 estrelas" className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((estrela) => {
                    const preenchida = estrela <= nota;
                    return (
                      <button
                        key={estrela}
                        type="button"
                        role="radio"
                        aria-checked={nota === estrela}
                        aria-label={`${estrela} estrela${estrela > 1 ? 's' : ''} — ${ROTULOS_NOTA[estrela]}`}
                        onClick={() => setNota(estrela)}
                        className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full p-1 transition hover:scale-110 focus:outline-2 focus:outline-primary"
                      >
                        <Icone
                          nome="star"
                          preenchido={preenchida}
                          className={`text-[40px] ${preenchida ? 'text-pro-verification' : 'text-outline-variant'}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-base font-semibold text-primary">
                  {nota} de 5 — {ROTULOS_NOTA[nota]}
                </p>
              </div>

              <AreaTexto
                rotulo="Deixe um comentário (opcional)"
                placeholder="O que você mais gostou? Pontualidade, clareza na sinalização, cordialidade..."
                maxLength={500}
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(rotaDestino)}
                  className="btn-secundario flex-1"
                >
                  Pular
                </button>
                <Botao type="submit" className="flex-1" carregando={enviando}>
                  Finalizar
                </Botao>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
