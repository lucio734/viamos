/**
 * Raio de Atuação (≤ 15 km) e Grade Semanal de Disponibilidade do Intérprete (RF24, RF25, RNF27).
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { useAuth } from '../../auth/AuthContext';
import { CENTRO_PADRAO, Mapa } from '../../components/Mapa';
import { Alerta, Botao, Campo, Carregando, Cartao, EstadoErro, Icone, Selecao } from '../../components/ui';

interface FaixaDisponibilidade {
  id?: string;
  diaSemana: number;
  inicio: string;
  fim: string;
}

const DIAS_SEMANA = [
  { valor: 0, rotulo: 'Domingo' },
  { valor: 1, rotulo: 'Segunda-feira' },
  { valor: 2, rotulo: 'Terça-feira' },
  { valor: 3, rotulo: 'Quarta-feira' },
  { valor: 4, rotulo: 'Quinta-feira' },
  { valor: 5, rotulo: 'Sexta-feira' },
  { valor: 6, rotulo: 'Sábado' },
];

export function AgendaInterprete() {
  const { usuario, recarregar } = useAuth();

  const [raioKm, setRaioKm] = useState(usuario?.interprete?.raioKm ?? 10);
  const [disponivelAgora, setDisponivelAgora] = useState(usuario?.interprete?.disponivelAgora ?? true);
  const [faixas, setFaixas] = useState<FaixaDisponibilidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [novoDia, setNovoDia] = useState(1);
  const [novoInicio, setNovoInicio] = useState('08:00');
  const [novoFim, setNovoFim] = useState('18:00');

  const [salvandoRaio, setSalvandoRaio] = useState(false);
  const [salvandoGrade, setSalvandoGrade] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    api
      .get<FaixaDisponibilidade[]>('/interprete/disponibilidades')
      .then((lista) => {
        setFaixas(lista.map((f) => ({ diaSemana: f.diaSemana, inicio: f.inicio, fim: f.fim })));
        if (usuario?.interprete) {
          setRaioKm(usuario.interprete.raioKm);
          setDisponivelAgora(usuario.interprete.disponivelAgora);
        }
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar agenda.'))
      .finally(() => setCarregando(false));
  }, [usuario?.interprete]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarConfiguracaoRaio(ev: FormEvent) {
    ev.preventDefault();
    setSalvandoRaio(true);
    setErroAcao('');
    setMensagem('');
    try {
      await api.put('/interprete/configuracao', { raioKm, disponivelAgora });
      await recarregar();
      setMensagem(`Raio de atuação atualizado para ${raioKm} km e status ${disponivelAgora ? 'Online' : 'Offline'}.`);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar a configuração.');
    } finally {
      setSalvandoRaio(false);
    }
  }

  function adicionarFaixa() {
    setErroAcao('');
    if (novoInicio >= novoFim) {
      setErroAcao('O horário de início deve ser anterior ao horário de término.');
      return;
    }
    if (faixas.length >= 21) {
      setErroAcao('Limite máximo de 21 faixas semanais atingido.');
      return;
    }
    setFaixas((ant) =>
      [...ant, { diaSemana: novoDia, inicio: novoInicio, fim: novoFim }].sort(
        (a, b) => a.diaSemana - b.diaSemana || a.inicio.localeCompare(b.inicio),
      ),
    );
  }

  function removerFaixa(indice: number) {
    setFaixas((ant) => ant.filter((_, i) => i !== indice));
  }

  function preencherHorarioComercial() {
    const comercial: FaixaDisponibilidade[] = [1, 2, 3, 4, 5].map((dia) => ({
      diaSemana: dia,
      inicio: '08:00',
      fim: '18:00',
    }));
    setFaixas(comercial);
  }

  async function salvarGradeSemanal() {
    setSalvandoGrade(true);
    setErroAcao('');
    setMensagem('');
    try {
      const salvas = await api.put<FaixaDisponibilidade[]>('/interprete/disponibilidades', { faixas });
      setFaixas(salvas.map((f) => ({ diaSemana: f.diaSemana, inicio: f.inicio, fim: f.fim })));
      setMensagem('Grade semanal de disponibilidade salva com sucesso (RF25).');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar as disponibilidades.');
    } finally {
      setSalvandoGrade(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando configurações de agenda e raio…" />;
  if (erro) return <EstadoErro mensagem={erro} aoTentarNovamente={carregar} />;

  const pontoBase = usuario?.interprete
    ? { lat: usuario.interprete.latitudeBase, lng: usuario.interprete.longitudeBase }
    : CENTRO_PADRAO;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2">
        <Link
          to="/interprete"
          aria-label="Voltar ao painel"
          className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-primary hover:bg-surface-container"
        >
          <Icone nome="arrow_back" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Raio de Atuação e Disponibilidade</h1>
          <p className="text-base text-on-surface-variant">
            Configure até onde você atende presencialmente (máx. 15 km) e seus horários semanais (RF24, RF25).
          </p>
        </div>
      </header>

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Raio de Atuação Presencial (RF24, RNF27) */}
      <Cartao titulo="Raio de Deslocamento Presencial (RF24)">
        <form onSubmit={salvarConfiguracaoRaio} className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="slider-raio" className="rotulo mb-0">
                Raio máximo a partir do seu endereço-base
              </label>
              <span className="rounded-full bg-primary-container px-3 py-1 text-sm font-bold text-on-primary">
                {raioKm} km
              </span>
            </div>
            <input
              id="slider-raio"
              type="range"
              min={1}
              max={15}
              step={1}
              value={raioKm}
              onChange={(e) => setRaioKm(Number(e.target.value))}
              className="min-h-touch w-full accent-primary-container"
            />
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>1 km (bairro)</span>
              <span>8 km (região)</span>
              <span>15 km (máximo permitido — RNF27)</span>
            </div>
          </div>

          <label className="flex min-h-touch items-center gap-3 rounded-lg bg-surface-container-low p-3 text-base font-medium">
            <input
              type="checkbox"
              checked={disponivelAgora}
              onChange={(e) => setDisponivelAgora(e.target.checked)}
              className="size-5 rounded border-outline text-primary-container"
            />
            Disponível agora (Online) para receber novas solicitações dentro de {raioKm} km
          </label>

          <Mapa
            posicao={pontoBase}
            raioKm={raioKm}
            somenteLeitura
            altura="h-56"
            rotulo={`Área de cobertura presencial (${raioKm} km ao redor de ${usuario?.interprete?.enderecoBase ?? 'sua base'}):`}
          />

          <div className="flex justify-end">
            <Botao type="submit" icone="save" carregando={salvandoRaio}>
              Salvar Raio e Disponibilidade
            </Botao>
          </div>
        </form>
      </Cartao>

      {/* Grade Semanal de Disponibilidade (RF25) */}
      <Cartao
        titulo="Grade Semanal de Horários (RF25)"
        acao={
          <Botao type="button" variante="secundario" icone="auto_fix_high" onClick={preencherHorarioComercial}>
            Preencher Seg–Sex (08h às 18h)
          </Botao>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:grid-cols-4 sm:items-end">
            <Selecao
              rotulo="Dia da semana"
              value={String(novoDia)}
              onChange={(e) => setNovoDia(Number(e.target.value))}
              opcoes={DIAS_SEMANA.map((d) => ({ valor: String(d.valor), rotulo: d.rotulo }))}
            />
            <Campo
              rotulo="Início"
              type="time"
              value={novoInicio}
              onChange={(e) => setNovoInicio(e.target.value)}
            />
            <Campo
              rotulo="Término"
              type="time"
              value={novoFim}
              onChange={(e) => setNovoFim(e.target.value)}
            />
            <Botao type="button" variante="secundario" icone="add" onClick={adicionarFaixa}>
              Adicionar faixa
            </Botao>
          </div>

          {faixas.length === 0 ? (
            <p className="py-4 text-center text-base text-on-surface-variant">
              Nenhuma faixa de horário cadastrada. Adicione acima ou use o botão de preenchimento rápido.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/50 rounded-xl border border-outline-variant">
              {faixas.map((f, idx) => {
                const nomeDia = DIAS_SEMANA.find((d) => d.valor === f.diaSemana)?.rotulo ?? `Dia ${f.diaSemana}`;
                return (
                  <li key={`${f.diaSemana}-${f.inicio}-${idx}`} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="font-semibold text-on-surface">{nomeDia}</span>
                      <span className="ml-3 rounded-full bg-primary-fixed px-3 py-0.5 text-sm font-semibold text-on-primary-fixed">
                        {f.inicio} às {f.fim}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remover faixa de ${nomeDia}`}
                      onClick={() => removerFaixa(idx)}
                      className="flex min-h-touch min-w-[44px] items-center justify-center rounded-full text-error hover:bg-error-container/40"
                    >
                      <Icone nome="delete" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end">
            <Botao type="button" icone="save" carregando={salvandoGrade} onClick={salvarGradeSemanal}>
              Salvar Grade Semanal
            </Botao>
          </div>
        </div>
      </Cartao>
    </div>
  );
}
