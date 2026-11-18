// AI-assisted: see docs/AI_LOG.md #7
// Rutas con OSRM (gratis, sin API key) y direcciones con Nominatim (OpenStreetMap).
// Ambos aparecen como alternativas válidas en la sección 7 del taller.
import { haversineKm, simplifyRoute } from '../utils/geo';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_MIN_INTERVAL_MS = 1100; // Nominatim permite máximo 1 petición por segundo

async function fetchJson(url, { timeoutMs = 8000, headers } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Si OSRM falla, se estima con línea recta: distancia × 1,3 y velocidad urbana de 25 km/h
function estimateRoute(from, to) {
  const distanceKm = haversineKm(from, to) * 1.3;
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMin: Math.max(1, Math.round((distanceKm / 25) * 60)),
    points: [from, to],
    source: 'estimate',
  };
}

/** Devuelve { distanceKm, durationMin, points: [{lat,lng}], source } */
export async function getRoute(from, to) {
  try {
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const data = await fetchJson(url);
    const route = data.routes?.[0];
    if (data.code !== 'Ok' || !route) throw new Error('Sin ruta');
    // GeoJSON entrega las coordenadas como [longitud, latitud]
    const points = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    return {
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
      points: simplifyRoute(points),
      source: 'osrm',
    };
  } catch {
    return estimateRoute(from, to);
  }
}

let lastNominatimCall = 0;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Convierte coordenadas en una dirección corta. Si falla, devuelve las coordenadas. */
export async function reverseGeocode(point) {
  const fallback = `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
  try {
    const elapsed = Date.now() - lastNominatimCall;
    if (elapsed < NOMINATIM_MIN_INTERVAL_MS) await wait(NOMINATIM_MIN_INTERVAL_MS - elapsed);
    lastNominatimCall = Date.now();

    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${point.lat}&lon=${point.lng}&zoom=17&addressdetails=1`;
    const data = await fetchJson(url, {
      headers: { 'User-Agent': 'UberCloneConductor/1.0 (proyecto academico TDEA)', 'Accept-Language': 'es' },
    });
    const a = data.address ?? {};
    const street = [a.road, a.house_number].filter(Boolean).join(' # ');
    const area = a.neighbourhood ?? a.suburb ?? a.city_district ?? a.city ?? a.town;
    return [street, area].filter(Boolean).join(', ') || fallback;
  } catch {
    return fallback;
  }
}
