/**
 * Hub do cliente (protótipo "Olá, João!"): CTA "Solicitar intérprete agora", indicadores, atendimentos ativos e recentes.
 * Padrão de tela: carregando → erro (com tentar novamente) → vazio → conteúdo (item #32).
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type HubCliente, type ResumoSolicitacao } from '../../api/tipos';
import { Botao, Carregando, Cartao, Chip, EstadoErro, EstadoVazio, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

export function HubCliente() {
  const [dados, setDados] = useState<HubCliente | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    api
      .get<HubCliente>('/cliente/hub')
      .then(setDados)
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(carregar, [carregar]);

  if (carregando) return <Carregando texto="Carregando seu painel…" />;
  if (erro || !dados) return <EstadoErro mensagem={erro || 'Falha ao carregar.'} aoTentarNovamente={carregar} />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-bold">Olá, {dados.nome.split(' ')[0]}!</h1>
        <p className="text-on-surface-variant">Como podemos ajudar hoje?</p>
      </header>

      <Link to="/cliente/solicitacoes/nova" className="block">
        <div className="flex items-center gap-4 rounded-xl bg-primary-container p-6 text-on-primary shadow-lg transition hover:bg-primary">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/15">
            <Icone nome="sign_language" className="text-3xl" />
          </span>
          <div className="flex-1">
            <p className="text-xl font-bold">Solicitar intérprete agora</p>
            <p className="text-sm text-on-primary-container">Atendimento presencial em Libras</p>
          </div>
          <Icone nome="arrow_forward" />
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Cartao className="text-center">
          <p className="text-3xl font-bold text-primary-container">{dados.concluidos}</p>
          <p className="text-sm text-on-surface-variant">Atendimentos concluídos</p>
        </Cartao>
        <Cartao className="text-center">
          <p className="text-3xl font-bold text-primary-container">{dados.ativos}</p>
          <p className="text-sm text-on-surface-variant">Em aberto</p>
        </Cartao>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Atendimentos ativos</h2>
        {dados.ativas.length === 0 ? (
          <EstadoVazio icone="event_available" titulo="Nenhuma solicitação em aberto" descricao="Quando você solicitar um intérprete, o acompanhamento aparece aqui." />
        ) : (
          <ul className="flex flex-col gap-3">
            {dados.ativas.map((s) => (
              <li key={s.id}>
                <ItemSolicitacao s={s} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {dados.recentes.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recentes</h2>
            <Link to="/cliente/historico" className="text-sm font-semibold text-primary-container hover:underline">
              Ver histórico
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {dados.recentes.map((s) => (
              <li key={s.id}>
                <ItemSolicitacao s={s} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/suporte" className="mt-2 self-center">
        <Botao variante="secundario" icone="support_agent">
          Preciso de ajuda
        </Botao>
      </Link>
    </div>
  );
}

function ItemSolicitacao({ s }: { s: ResumoSolicitacao }) {
  return (
    <Link to={`/cliente/solicitacoes/${s.id}`} className="cartao flex items-center gap-4 transition hover:bg-surface-container-low">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
        <Icone nome={ICONE_TIPO_SERVICO[s.tipoServico]} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">{s.tipoServicoRotulo}</p>
          <Chip status={s.status}>{s.statusRotulo}</Chip>
        </div>
        <p className="truncate text-sm text-on-surface-variant">{s.endereco}</p>
        <p className="text-sm text-on-surface-variant">
          {formato.quando(s.inicioPrevisto)} · {formato.duracao(s.duracaoPrevistaMin)} · {formato.moeda(s.valorEstimado)}
          {s.interpreteNome ? ` · ${s.interpreteNome}` : ''}
        </p>
      </div>
      <Icone nome="chevron_right" className="text-outline" />
    </Link>
  );
}
