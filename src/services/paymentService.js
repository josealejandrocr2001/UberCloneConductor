// AI-assisted: see docs/AI_LOG.md #7
/**
 * PASARELA SIMULADA (la profesora indicó simular los datos y no habrá backend con Docker).
 *
 * Flujo real del taller (sección 4):           Cómo se simula aquí:
 * 1. App calcula la tarifa final             → finishTrip() con calculateFare()
 * 2. App envía tripId y monto al backend      → simulateGatewayPayment()
 * 3. Backend crea la preferencia (access_token) → no aplica: no hay llaves en la app
 * 4. Pasajero paga con tarjeta de prueba      → se elige el titular de prueba de Mercado Pago (APRO/CONT/OTHE)
 * 5. Webhook actualiza el viaje                → tras un retraso se escribe paymentStatus, paymentId y status
 * 6. App del conductor escucha en tiempo real  → onSnapshot del viaje en la pantalla de cobro
 */
import { doc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PAYMENT_METHODS, PAYMENT_STATUS, TRIP_STATUS } from '../constants/trip';
import { calculateFare } from '../utils/calculateFare';

// Titulares de tarjeta de prueba de Mercado Pago y el resultado que producen
export const TEST_CARDS = [
  { holder: 'APRO', label: 'Pago aprobado', status: PAYMENT_STATUS.APPROVED },
  { holder: 'CONT', label: 'Pago pendiente', status: PAYMENT_STATUS.PENDING },
  { holder: 'OTHE', label: 'Pago rechazado', status: PAYMENT_STATUS.REJECTED },
];

export const TIP_OPTIONS = [0, 1000, 2000, 5000];

const GATEWAY_DELAY_MS = 2000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const simulatedRating = () => (Math.random() < 0.8 ? 5 : 4);

const finalAmounts = (trip, tip) =>
  calculateFare(
    { distanceKm: trip.distanceKm, durationMin: trip.durationMin, category: trip.category, tip },
    undefined,
    trip.commissionRate,
  );

/** Simula el cobro por la pasarela y la notificación (webhook) que actualiza el viaje. */
export async function simulateGatewayPayment(trip, driverId, { outcome, tip = 0 }) {
  await wait(GATEWAY_DELAY_MS);
  const { driverEarnings } = finalAmounts(trip, tip);

  const batch = writeBatch(db);
  const update = {
    paymentMethod: PAYMENT_METHODS.MERCADOPAGO,
    paymentStatus: outcome,
    paymentId: `SIM-MP-${Date.now()}`,
    tip,
    driverEarnings,
  };
  if (outcome === PAYMENT_STATUS.APPROVED) {
    Object.assign(update, { status: TRIP_STATUS.PAID, paidAt: serverTimestamp(), rating: simulatedRating() });
    // Saldo: la pasarela recibió el dinero, así que se le debe al conductor su ganancia neta
    batch.update(doc(db, 'drivers', driverId), { balance: increment(driverEarnings) });
  }
  batch.update(doc(db, 'trips', trip.id), update);
  await batch.commit();
}

/** Pago en efectivo: el conductor recibe el dinero, así que la comisión se descuenta de su saldo. */
export async function registerCashPayment(trip, driverId, tip = 0) {
  const { commission, driverEarnings } = finalAmounts(trip, tip);
  const batch = writeBatch(db);
  batch.update(doc(db, 'trips', trip.id), {
    paymentMethod: PAYMENT_METHODS.CASH,
    paymentStatus: PAYMENT_STATUS.CASH,
    paymentId: `CASH-${Date.now()}`,
    tip,
    driverEarnings,
    status: TRIP_STATUS.PAID,
    paidAt: serverTimestamp(),
    rating: simulatedRating(),
  });
  // El saldo puede quedar en negativo (sección 4 del taller)
  batch.update(doc(db, 'drivers', driverId), { balance: increment(-commission) });
  await batch.commit();
}
