/**
 * Cálculos geográficos usados na distribuição (RF17, raio de 15 km) e no check-in (RF32, 200 m).
 * Fórmula de Haversine: distância em linha reta sobre a esfera terrestre.
 */
const RAIO_TERRA_M = 6_371_000;

export interface Coordenada {
  latitude: number;
  longitude: number;
}

function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

/** Distância em metros entre duas coordenadas. */
export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const dLat = paraRadianos(b.latitude - a.latitude);
  const dLng = paraRadianos(b.longitude - a.longitude);
  const lat1 = paraRadianos(a.latitude);
  const lat2 = paraRadianos(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distância em quilômetros, arredondada a 2 casas. */
export function distanciaKm(a: Coordenada, b: Coordenada): number {
  return Math.round((distanciaMetros(a, b) / 1000) * 100) / 100;
}

export function coordenadaValida(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
