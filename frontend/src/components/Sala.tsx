/**
 * Sala de Atendimento Presencial (RF28–RF30, RF34, protótipo Stitch code (21).html).
 * Componente compartilhado entre:
 *   - /cliente/atendimentos/:id/sala
 *   - /interprete/atendimentos/:id/sala
 * Recursos:
 *   - Mensagens de texto em tempo real (polling incremental com ?apos=)
 *   - Envio de foto do ponto de encontro (Data URL ≤ 1 MB — RF30)
 *   - Compartilhamento explícito de localização temporária no dia do atendimento (RF29, RNF44)
 *   - Atalho direto para Suporte / Emergência (RF34)
 */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ErroApi } from '../api/cliente';
import type { DetalheAtendimento, LocalizacaoCompartilhada, MensagemSala } from '../api/tipos';
import { Mapa, type MarcadorExtra } from './Mapa';
import { Alerta, Botao, Carregando, Chip, EstadoErro, EstadoVazio, Icone } from './ui';
import { formato } from '../utils/formato';

const TAMANHO_MAX_FOTO_BYTES = 1_048_576; // 1 MB (RF30)

export function Sala() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <EstadoErro mensagem="Sala não encontrada." />;
  return <SalaAtendimento key={id} id={id} />;
}

function SalaAtendimento({ id }: { id: string }) {
  const [atendimento, setAtendimento] = useState<DetalheAtendimento | null>(null);
  const [mensagens, setMensagens] = useState<MensagemSala[]>([]);
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoCompartilhada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [compartilhandoGeo, setCompartilhandoGeo] = useState(false);
  const [exibirMapa, setExibirMapa] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [sucessoAcao, setSucessoAcao] = useState('');

  const inputFotoRef = useRef<HTMLInputElement | null>(null);
  const fimListaRef = useRef<HTMLDivElement | null>(null);
  const ultimaDataRef = useRef<string | undefined>(undefined);

  const carregarInicial = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<DetalheAtendimento>(`/atendimentos/${id}`),
      api.get<MensagemSala[]>(`/atendimentos/${id}/mensagens`),
      api.get<LocalizacaoCompartilhada[]>(`/atendimentos/${id}/localizacoes`).catch(() => []),
    ])
      .then(([at, msgs, locs]) => {
        setAtendimento(at);
        setMensagens(msgs);
        setLocalizacoes(locs);
        if (msgs.length > 0) {
          ultimaDataRef.current = msgs[msgs.length - 1].enviadaEm;
        }
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Não foi possível carregar a sala de atendimento.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregarInicial();
  }, [carregarInicial]);

  // Polling incremental de novas mensagens e localizações a cada 4 segundos
  useEffect(() => {
    if (!atendimento) return;
    let ativo = true;
    const timer = setInterval(() => {
      const query = ultimaDataRef.current ? `?apos=${encodeURIComponent(ultimaDataRef.current)}` : '';
      api
        .get<MensagemSala[]>(`/atendimentos/${id}/mensagens${query}`)
        .then((novas) => {
          if (!ativo || novas.length === 0) return;
          setMensagens((ant) => {
            const ids = new Set(ant.map((m) => m.id));
            const filtradas = novas.filter((m) => !ids.has(m.id));
            if (filtradas.length === 0) return ant;
            ultimaDataRef.current = filtradas[filtradas.length - 1].enviadaEm;
            return [...ant, ...filtradas];
          });
        })
        .catch(() => undefined);

      if (atendimento.status === 'AGENDADO' || atendimento.status === 'EM_ANDAMENTO') {
        api
          .get<LocalizacaoCompartilhada[]>(`/atendimentos/${id}/localizacoes`)
          .then((locs) => ativo && setLocalizacoes(locs))
          .catch(() => { if (ativo) setLocalizacoes([]); });
      }
    }, 4000);

    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, [id, atendimento]);

  useEffect(() => {
    fimListaRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  async function recarregarMensagens() {
    const msgs = await api.get<MensagemSala[]>(`/atendimentos/${id}/mensagens`);
    setMensagens(msgs);
    if (msgs.length > 0) {
      ultimaDataRef.current = msgs[msgs.length - 1].enviadaEm;
    }
  }

  async function enviarTexto(ev: FormEvent) {
    ev.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setErroAcao('');
    try {
      await api.post(`/atendimentos/${id}/mensagens`, {
        tipo: 'TEXTO',
        texto: texto.trim(),
      });
      setTexto('');
      await recarregarMensagens();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao enviar mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  async function aoEscolherFoto(ev: ChangeEvent<HTMLInputElement>) {
    const arq = ev.target.files?.[0];
    ev.target.value = '';
    if (!arq) return;
    setErroAcao('');
    setSucessoAcao('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arq.type)) {
      setErroAcao('Envie uma foto nos formatos JPG, PNG ou WebP.');
      return;
    }
    if (arq.size > TAMANHO_MAX_FOTO_BYTES) {
      setErroAcao('A foto do ponto de encontro deve ter no máximo 1 MB (RF30).');
      return;
    }

    setEnviando(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(String(leitor.result ?? ''));
        leitor.onerror = () => reject(new Error('Falha ao ler imagem.'));
        leitor.readAsDataURL(arq);
      });
      await api.post(`/atendimentos/${id}/mensagens`, {
        tipo: 'IMAGEM',
        imagemDataUrl: dataUrl,
        texto: `Foto do ponto de encontro (${arq.name})`,
      });
      await recarregarMensagens();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível enviar a foto.');
    } finally {
      setEnviando(false);
    }
  }

  function compartilharMinhaLocalizacao() {
    if (compartilhandoGeo) return;
    setErroAcao('');
    setSucessoAcao('');
    if (!navigator.geolocation) {
      setErroAcao('Seu navegador não oferece acesso à localização.');
      return;
    }
    setCompartilhandoGeo(true);

    const enviarPosicao = async ({ coords }: GeolocationPosition) => {
      try {
        const posicao = await api.post<LocalizacaoCompartilhada>(`/atendimentos/${id}/localizacoes`, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          precisaoM: coords.accuracy,
        });
        setLocalizacoes((anteriores) => [posicao, ...anteriores.filter((localizacao) => localizacao.usuarioId !== posicao.usuarioId)]);
        setExibirMapa(true);
        setSucessoAcao('Sua localização foi compartilhada temporariamente no mapa da sala.');
      } catch (e) {
        setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível compartilhar a localização.');
      } finally {
        setCompartilhandoGeo(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (posicao) => { void enviarPosicao(posicao); },
      (falha) => {
        setCompartilhandoGeo(false);
        setErroAcao(falha.code === falha.PERMISSION_DENIED
          ? 'Permita o acesso à localização para compartilhar sua posição.'
          : 'Não foi possível obter sua localização. Verifique se o GPS está ativo e tente novamente.');
      },
      { timeout: 7000 },
    );
  }

  if (carregando) return <Carregando texto="Abrindo sala de atendimento…" />;
  if (erro || !atendimento) return <EstadoErro mensagem={erro || 'Sala não encontrada.'} aoTentarNovamente={carregarInicial} />;

  const souCliente = atendimento.papelNoAtendimento === 'CLIENTE';
  const contraparteNome = souCliente ? atendimento.interprete.nome : atendimento.cliente.nome;
  const contraparteId = souCliente ? atendimento.interprete.id : atendimento.cliente.id;
  const contrapartePapel = souCliente ? 'Intérprete de Libras' : 'Cliente Surdo(a)';
  const rotaVoltar = souCliente ? `/cliente/atendimentos/${atendimento.id}` : `/interprete/atendimentos/${atendimento.id}`;
  const salaEncerrada = atendimento.status === 'CANCELADO';
  const contraparteCompartilhou = localizacoes.some((localizacao) => localizacao.usuarioId === contraparteId);

  const marcadoresMapa: MarcadorExtra[] = localizacoes.map((l) => ({
    id: l.usuarioId,
    lat: l.latitude,
    lng: l.longitude,
    rotulo: `${l.usuarioId === atendimento.cliente.id ? atendimento.cliente.nome : atendimento.interprete.nome} (${formato.hora(l.registradaEm)})`,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Barra superior contextual da Sala (fiel ao code (21).html) */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={rotaVoltar}
            aria-label="Voltar aos detalhes do atendimento"
            className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low"
          >
            <Icone nome="arrow_back" />
          </Link>
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-lg font-bold text-on-primary">
            {contraparteNome.charAt(0).toUpperCase()}
            <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface bg-status-online" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-on-surface">{contraparteNome}</h1>
              <Chip status={atendimento.status}>{atendimento.status.replace('_', ' ')}</Chip>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {contrapartePapel} · {atendimento.tipoServicoRotulo}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Botao
            type="button"
            variante="secundario"
            icone="map"
            aria-expanded={exibirMapa}
            onClick={() => setExibirMapa((v) => !v)}
          >
            {exibirMapa ? 'Ocultar mapa' : 'Ver mapa'}
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            icone="my_location"
            carregando={compartilhandoGeo}
            disabled={salaEncerrada || atendimento.status === 'CONCLUIDO'}
            onClick={compartilharMinhaLocalizacao}
          >
            Enviar GPS
          </Botao>
          <Link to={`/suporte?atendimentoId=${atendimento.id}`}>
            <Botao type="button" variante="perigo" icone="sos">
              SOS
            </Botao>
          </Link>
        </div>
      </header>

      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}
      {sucessoAcao && <Alerta tipo="sucesso">{sucessoAcao}</Alerta>}
      <div role="status" className={contraparteCompartilhou && !exibirMapa ? 'text-base text-on-surface-variant' : 'sr-only'}>
        {contraparteCompartilhou && `${contraparteNome} compartilhou a localização temporária no mapa da sala.`}
      </div>

      {/* Mapa expansível com o ponto de encontro e as localizações temporárias dos participantes (RF29) */}
      {exibirMapa && (
        <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">
              Ponto de Encontro e Localizações Compartilhadas (últimos 15 min)
            </h2>
            <span className="text-sm text-on-surface-variant">{atendimento.local.endereco}</span>
          </div>
          <Mapa
            posicao={{ lat: atendimento.local.latitude, lng: atendimento.local.longitude }}
            marcadores={marcadoresMapa}
            somenteLeitura
            altura="h-60"
          />
        </div>
      )}

      {/* Área de mensagens (fiel ao code (21).html) */}
      <section
        aria-label="Mensagens da sala de atendimento"
        className="flex min-h-[380px] max-h-[520px] flex-col gap-3 overflow-y-auto rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs"
      >
        <div className="my-1 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Encontro presencial: {atendimento.local.endereco} · {formato.quando(atendimento.inicioPrevisto)}
        </div>

        {mensagens.length === 0 ? (
          <EstadoVazio
            icone="forum"
            titulo="Nenhuma mensagem ainda"
            descricao="Use este canal para combinar detalhes do ponto de encontro, enviar uma foto da fachada/recepção ou compartilhar sua chegada."
          />
        ) : (
          mensagens.map((m) => {
            if (m.tipo === 'SISTEMA') {
              return (
                <div
                  key={m.id}
                  className="mx-auto my-1 max-w-md rounded-full bg-surface-container-high px-4 py-1.5 text-center text-xs font-semibold text-on-surface-variant"
                >
                  {m.texto} · {formato.hora(m.enviadaEm)}
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex max-w-[85%] flex-col ${m.minha ? ' items-end self-end' : 'items-start self-start'}`}
              >
                <div
                  className={`px-4 py-3 text-base ${
                    m.minha
                      ? 'rounded-2xl rounded-br-sm bg-primary text-on-primary shadow-xs'
                      : 'rounded-2xl rounded-bl-sm bg-surface-container text-on-surface'
                  }`}
                >
                  {!m.minha && (
                    <p className="mb-1 text-xs font-bold text-primary-container">{m.autor.nome}</p>
                  )}

                  {m.tipo === 'IMAGEM' && m.arquivoUri && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-outline-variant/40 bg-black/5">
                      <img
                        src={m.arquivoUri}
                        alt={m.texto ?? 'Foto do ponto de encontro'}
                        className="max-h-64 w-auto object-contain"
                      />
                    </div>
                  )}

                  {m.texto && <p className="whitespace-pre-wrap break-words">{m.texto}</p>}
                </div>

                <div className="mt-1 flex items-center gap-1 px-1 text-xs text-on-surface-variant">
                  <span>{formato.hora(m.enviadaEm)}</span>
                  {m.minha && <Icone nome="done_all" className="text-[14px] text-primary" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={fimListaRef} />
      </section>

      {/* Barra de envio de mensagem e foto (fiel ao code (21).html) */}
      <form
        onSubmit={enviarTexto}
        className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-2 focus-within:border-primary focus-within:bg-surface-container-lowest"
      >
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={aoEscolherFoto}
        />
        <button
          type="button"
          aria-label="Enviar foto do ponto de encontro (até 1 MB)"
          title="Enviar foto do ponto de encontro (até 1 MB)"
          disabled={salaEncerrada || enviando}
          onClick={() => inputFotoRef.current?.click()}
          className="flex min-h-touch min-w-[44px] shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-primary disabled:opacity-50"
        >
          <Icone nome="add_a_photo" />
        </button>

        <input
          type="text"
          aria-label="Mensagem para a sala de atendimento"
          placeholder={salaEncerrada ? 'Sala encerrada' : 'Digite uma mensagem sobre o ponto de encontro…'}
          disabled={salaEncerrada || enviando}
          maxLength={1000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="min-h-touch flex-1 border-none bg-transparent px-2 text-base text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
        />

        <button
          type="submit"
          aria-label="Enviar mensagem"
          disabled={salaEncerrada || enviando || !texto.trim()}
          className="flex min-h-touch min-w-[44px] shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-xs transition hover:bg-primary-container disabled:opacity-50"
        >
          <Icone nome="send" className="text-[20px]" />
        </button>
      </form>
    </div>
  );
}
