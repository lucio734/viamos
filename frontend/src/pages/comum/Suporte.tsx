/**
 * RF34 — Acionar suporte ou emergência (dentro ou fora de um atendimento presencial).
 * RNF44 — Solicita localização de forma explícita e apenas mediante autorização do usuário.
 */
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { Alerta, AreaTexto, Botao, Cartao, Icone } from '../../components/ui';
import { formato } from '../../utils/formato';

interface RespostaChamado {
  id: string;
  status: string;
  abertoEm: string;
  mensagem: string;
}

export function Suporte() {
  const [searchParams] = useSearchParams();
  const atendimentoId = searchParams.get('atendimentoId');

  const [tipo, setTipo] = useState<'SUPORTE' | 'EMERGENCIA'>('SUPORTE');
  const [descricao, setDescricao] = useState('');
  const [coordenadas, setCoordenadas] = useState<{ latitude: number; longitude: number } | null>(null);
  const [obtendoGps, setObtendoGps] = useState(false);
  const [avisoGps, setAvisoGps] = useState('');

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [chamadoCriado, setChamadoCriado] = useState<RespostaChamado | null>(null);

  function anexarLocalizacao() {
    if (!navigator.geolocation) {
      setAvisoGps('Seu navegador não disponibiliza geolocalização.');
      return;
    }
    setObtendoGps(true);
    setAvisoGps('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setObtendoGps(false);
        setCoordenadas({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setAvisoGps('Localização atual anexada ao chamado.');
      },
      () => {
        setObtendoGps(false);
        setAvisoGps('Não foi possível obter a localização. Você ainda pode enviar o chamado sem ela.');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (tipo === 'SUPORTE' && descricao.trim().length < 5) {
      novos.descricao = 'Descreva brevemente como podemos ajudar (mínimo 5 caracteres).';
    }
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      const rota = atendimentoId ? `/atendimentos/${atendimentoId}/suporte` : '/suporte';
      const resp = await api.post<RespostaChamado>(rota, {
        tipo,
        descricao: descricao.trim() || undefined,
        latitude: coordenadas?.latitude,
        longitude: coordenadas?.longitude,
      });
      setChamadoCriado(resp);
      setDescricao('');
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else {
        setErroGeral('Não foi possível registrar o chamado agora. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-bold">Suporte e Emergência</h1>
        <p className="text-on-surface-variant">
          Acione nossa equipe de operação caso tenha dificuldade no encontro presencial ou precise registrar uma ocorrência (RF34).
        </p>
        {atendimentoId && (
          <p className="mt-1 text-xs font-semibold text-primary-container">
            Vinculado ao atendimento #{atendimentoId.slice(0, 8)}
          </p>
        )}
      </header>

      {chamadoCriado && (
        <Cartao titulo="Chamado registrado">
          <div className="flex flex-col gap-3">
            <Alerta tipo="sucesso">{chamadoCriado.mensagem}</Alerta>
            <p className="text-sm text-on-surface-variant">
              Protocolo: <code>{chamadoCriado.id.slice(0, 8)}</code> · Aberto em {formato.dataHora(chamadoCriado.abertoEm)} · Status:{' '}
              <strong>{chamadoCriado.status}</strong>
            </p>
            <Botao type="button" variante="secundario" icone="add" onClick={() => setChamadoCriado(null)}>
              Abrir outro chamado
            </Botao>
          </div>
        </Cartao>
      )}

      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}

        <div role="radiogroup" aria-label="Tipo de acionamento" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            role="radio"
            aria-checked={tipo === 'SUPORTE'}
            onClick={() => setTipo('SUPORTE')}
            className={`cartao flex items-start gap-3 border-2 text-left transition ${
              tipo === 'SUPORTE' ? 'border-primary-container bg-primary-fixed/25' : 'border-transparent hover:bg-surface-container-low'
            }`}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
              <Icone nome="support_agent" />
            </span>
            <div>
              <p className="text-lg font-bold">Suporte operacional</p>
              <p className="text-base text-on-surface-variant">Dúvidas sobre o encontro, atraso do participante, check-in ou pagamento.</p>
            </div>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={tipo === 'EMERGENCIA'}
            onClick={() => setTipo('EMERGENCIA')}
            className={`cartao flex items-start gap-3 border-2 text-left transition ${
              tipo === 'EMERGENCIA' ? 'border-error bg-error-container/35' : 'border-transparent hover:bg-surface-container-low'
            }`}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
              <Icone nome="emergency" />
            </span>
            <div>
              <p className="text-lg font-bold text-on-error-container">Emergência no local</p>
              <p className="text-base text-on-surface-variant">Situação de risco ou incidente grave durante o atendimento presencial.</p>
            </div>
          </button>
        </div>

        {tipo === 'EMERGENCIA' && (
          <Alerta tipo="aviso">
            Em caso de risco imediato à integridade física, acione também os serviços públicos de emergência (Polícia 190 / SAMU 192).
          </Alerta>
        )}

        <Cartao titulo="Detalhes do chamado">
          <div className="flex flex-col gap-4">
            <AreaTexto
              rotulo={tipo === 'EMERGENCIA' ? 'Descrição da ocorrência (opcional em emergência)' : 'Como podemos ajudar?'}
              name="descricao"
              placeholder="Descreva o que aconteceu, o ponto de referência ou a ajuda necessária…"
              maxLength={500}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              erro={erros.descricao}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-container p-3">
              <div className="text-sm">
                <p className="font-semibold text-on-surface">Localização do chamado (opcional — RNF44)</p>
                <p className="text-xs text-on-surface-variant">
                  {coordenadas
                    ? `Coordenadas anexadas: ${coordenadas.latitude.toFixed(5)}, ${coordenadas.longitude.toFixed(5)}`
                    : 'Compartilhe sua posição atual somente se desejar auxiliar a equipe de suporte.'}
                </p>
                {avisoGps && <p className="mt-1 text-xs font-medium text-primary-container">{avisoGps}</p>}
              </div>
              <Botao
                type="button"
                variante="secundario"
                icone={coordenadas ? 'check_circle' : 'my_location'}
                carregando={obtendoGps}
                onClick={anexarLocalizacao}
              >
                {coordenadas ? 'Atualizar localização' : 'Anexar localização'}
              </Botao>
            </div>

            <Botao
              type="submit"
              variante={tipo === 'EMERGENCIA' ? 'perigo' : 'primario'}
              largo
              carregando={carregando}
              icone={tipo === 'EMERGENCIA' ? 'emergency_share' : 'send'}
            >
              {tipo === 'EMERGENCIA' ? 'Registrar alerta de emergência' : 'Enviar chamado de suporte'}
            </Botao>
          </div>
        </Cartao>
      </form>
    </div>
  );
}
