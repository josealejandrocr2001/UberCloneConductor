// AI-assisted: see docs/AI_LOG.md #7
import { COMMISSION_RATE, PRICING } from '../config/pricing';

/**
 * Función pura de tarifa (sección 5 del taller). Se usa igual en la estimación y en el cierre del viaje.
 * Tarifa = max(Mínima, (Base + km·Vkm + min·Vmin) · Mcategoría), redondeada al múltiplo de 100 COP más cercano.
 * Comisión = Tarifa · tasa.  Ganancia neta = Tarifa − Comisión + Propina.  Todo en pesos enteros.
 */
export function calculateFare(
  { distanceKm, durationMin, category, tip = 0 },
  pricing = PRICING,
  commissionRate = COMMISSION_RATE,
) {
  const multiplier = pricing.multipliers[category] ?? 1;
  const raw = (pricing.baseFare + distanceKm * pricing.perKm + durationMin * pricing.perMinute) * multiplier;
  const fare = Math.round(Math.max(pricing.minimumFare, raw) / 100) * 100;
  const commission = Math.round(fare * commissionRate);
  const safeTip = Math.max(0, Math.round(tip));
  return { fare, commission, driverEarnings: fare - commission + safeTip };
}
