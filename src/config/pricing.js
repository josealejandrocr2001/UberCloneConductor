// AI-assisted: see docs/AI_LOG.md #2
// Único archivo de configuración de tarifas (valores didácticos, sección 5 del taller)
export const PRICING = {
  baseFare: 3500,
  perKm: 1200,
  perMinute: 250,
  minimumFare: 6000,
  multipliers: { economy: 1.0, xl: 1.4, premium: 1.8 },
};

// Comisión de la plataforma sobre la tarifa (20 %)
export const COMMISSION_RATE = 0.2;
