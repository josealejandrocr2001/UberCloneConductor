// AI-assisted: see docs/AI_LOG.md #7
const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

// Centro de Medellín: se usa si todavía no hay ubicación del conductor
export const DEFAULT_LOCATION = { lat: 6.2442, lng: -75.5812 };

export function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Punto aleatorio entre minKm y maxKm de distancia de "center"
export function randomPointNear(center, minKm, maxKm) {
  const distanceKm = minKm + Math.random() * (maxKm - minKm);
  const angle = Math.random() * 2 * Math.PI;
  const dLat = (distanceKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const dLng = dLat / Math.cos(toRad(center.lat));
  return { lat: center.lat + dLat * Math.sin(angle), lng: center.lng + dLng * Math.cos(angle) };
}

// react-native-maps usa { latitude, longitude }
export const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng });

// Reduce una ruta larga para no guardar miles de puntos en Firestore
export function simplifyRoute(points, maxPoints = 120) {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)]);
}
