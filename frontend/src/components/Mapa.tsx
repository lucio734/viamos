/**
 * Mapa compartilhado (Leaflet + OpenStreetMap) — criado no Bloco F1 para o endereço-base do intérprete (RF04/RF24)
 * e reutilizável no F2 (confirmar o ponto da solicitação, RF12) e no F3 (demandas próximas, RF20).
 *
 * Uso típico (seleção de ponto):
 *   <Mapa posicao={ponto} aoSelecionar={setPonto} raioKm={raio} />
 * Somente leitura com marcadores extras:
 *   <Mapa posicao={base} marcadores={[{ id, lat, lng, rotulo }]} somenteLeitura />
 *
 * O marcador usa L.divIcon (sem imagens), evitando o problema clássico dos ícones padrão do Leaflet com bundlers.
 */
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Botao } from './ui';

export interface Ponto {
  lat: number;
  lng: number;
}

export interface MarcadorExtra extends Ponto {
  id: string;
  rotulo: string;
}

/** Centro padrão: São Paulo (área do seed de demonstração). */
export const CENTRO_PADRAO: Ponto = { lat: -23.5505, lng: -46.6333 };

const icone = (cor: string) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:${cor};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
const ICONE_PRINCIPAL = icone('#1a2e44');
const ICONE_EXTRA = icone('#2d6a4f');

function CliqueNoMapa({ aoSelecionar }: { aoSelecionar: (p: Ponto) => void }) {
  useMapEvents({ click: (e) => aoSelecionar({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Recentraliza o mapa quando a posição muda por fora (busca de endereço, GPS). */
function Recentralizar({ posicao }: { posicao: Ponto | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (posicao) mapa.setView([posicao.lat, posicao.lng], Math.max(mapa.getZoom(), 14));
  }, [mapa, posicao]);
  return null;
}

interface Props {
  posicao: Ponto | null;
  aoSelecionar?: (p: Ponto) => void;
  raioKm?: number;
  marcadores?: MarcadorExtra[];
  somenteLeitura?: boolean;
  altura?: string;
  rotulo?: string;
}

export function Mapa({ posicao, aoSelecionar, raioKm, marcadores = [], somenteLeitura = false, altura = 'h-64', rotulo = 'Mapa' }: Props) {
  const [obtendoGps, setObtendoGps] = useState(false);
  const [erroGps, setErroGps] = useState('');
  const centro = useMemo(() => posicao ?? CENTRO_PADRAO, [posicao]);
  const editavel = !somenteLeitura && Boolean(aoSelecionar);

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErroGps('Seu navegador não permite obter a localização. Marque o ponto no mapa.');
      return;
    }
    setObtendoGps(true);
    setErroGps('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setObtendoGps(false);
        aoSelecionar?.({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        setObtendoGps(false);
        setErroGps('Não foi possível obter sua localização. Autorize o acesso ou marque o ponto no mapa.');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div role="region" aria-label={rotulo} className={`${altura} overflow-hidden rounded-lg border border-outline-variant`}>
        <MapContainer center={[centro.lat, centro.lng]} zoom={posicao ? 15 : 12} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {editavel && <CliqueNoMapa aoSelecionar={aoSelecionar!} />}
          <Recentralizar posicao={posicao} />
          {posicao && (
            <Marker
              position={[posicao.lat, posicao.lng]}
              icon={ICONE_PRINCIPAL}
              draggable={editavel}
              eventHandlers={editavel ? { dragend: (e) => { const ll = (e.target as L.Marker).getLatLng(); aoSelecionar?.({ lat: ll.lat, lng: ll.lng }); } } : undefined}
            />
          )}
          {posicao && raioKm ? <Circle center={[posicao.lat, posicao.lng]} radius={raioKm * 1000} pathOptions={{ color: '#1a2e44', weight: 1, fillOpacity: 0.08 }} /> : null}
          {marcadores.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={ICONE_EXTRA}>
              <Tooltip>{m.rotulo}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {editavel && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-on-surface-variant">
          <span>{posicao ? `Ponto marcado: ${posicao.lat.toFixed(5)}, ${posicao.lng.toFixed(5)}` : 'Toque no mapa para marcar o ponto.'}</span>
          <Botao type="button" variante="secundario" icone="my_location" carregando={obtendoGps} onClick={usarMinhaLocalizacao}>
            Usar minha localização
          </Botao>
        </div>
      )}
      {erroGps && <p role="alert" className="text-sm text-error">{erroGps}</p>}
    </div>
  );
}

/**
 * Geocodificação opcional pelo Nominatim (OpenStreetMap). Uso leve (um clique = uma consulta), conforme a política
 * de uso do serviço. Retorna null se nada for encontrado ou se o serviço estiver indisponível — a tela deve então
 * orientar o usuário a marcar o ponto manualmente no mapa.
 */
export async function geocodificar(endereco: string): Promise<Ponto | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(endereco)}`;
    const resposta = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resposta.ok) return null;
    const lista = (await resposta.json()) as { lat: string; lon: string }[];
    return lista[0] ? { lat: Number(lista[0].lat), lng: Number(lista[0].lon) } : null;
  } catch {
    return null;
  }
}
