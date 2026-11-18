// AI-assisted: see docs/AI_LOG.md #7
export const formatCOP = (value) => `$ ${Math.round(value ?? 0).toLocaleString('es-CO')}`;

export const formatKm = (km) => `${(km ?? 0).toFixed(1)} km`;

export const formatMin = (min) => `${Math.round(min ?? 0)} min`;
