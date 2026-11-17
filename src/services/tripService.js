// AI-assisted: see docs/AI_LOG.md #7
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COMMISSION_RATE } from '../config/pricing';
import { PAYMENT_METHODS, TRIP_STATUS } from '../constants/trip';
import { calculateFare } from '../utils/calculateFare';
import { DEFAULT_LOCATION, randomPointNear } from '../utils/geo';
import { getRoute, reverseGeocode } from './routeService';

const tripsRef = collection(db, 'trips');
const driverRef = (driverId) => doc(db, 'drivers', driverId);

const SIMULATED_PASSENGERS = ['Laura Gómez', 'Andrés Restrepo', 'Valentina Ríos', 'Camilo Zapata', 'Sara Muñoz', 'Mateo Arango'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const PASSENGER_CANCEL_PROBABILITY = 0.25;

/**
 * SIMULACIÓN de la app del pasajero (la profesora indicó simular los datos):
 * crea una solicitud cerca del conductor y la guarda en Firestore con status "requested".
 * La app del conductor la recibe en tiempo real con onSnapshot, igual que si viniera de un pasajero real.
 * La distancia y duración se calculan UNA sola vez, al crear la solicitud.
 */
export async function createSimulatedRequest({ driverId, category, driverLocation }) {
  const center = driverLocation ?? DEFAULT_LOCATION;
  const origin = randomPointNear(center, 0.3, 1.5);
  const destination = randomPointNear(origin, 2, 8);

  const route = await getRoute(origin, destination);
  const originAddress = await reverseGeocode(origin);
  const destinationAddress = await reverseGeocode(destination);

  const estimate = calculateFare({ distanceKm: route.distanceKm, durationMin: route.durationMin, category });

  return addDoc(tripsRef, {
    driverId,
    passengerId: `sim-${Date.now()}`,
    passengerName: pick(SIMULATED_PASSENGERS),
    origin: { ...origin, address: originAddress },
    destination: { ...destination, address: destinationAddress },
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    route: route.points,
    routeSource: route.source,
    category,
    paymentMethod: Math.random() < 0.6 ? PAYMENT_METHODS.MERCADOPAGO : PAYMENT_METHODS.CASH,
    estimatedFare: estimate.fare,
    estimatedDriverEarnings: estimate.driverEarnings,
    commissionRate: COMMISSION_RATE,
    fare: null,
    commission: null,
    tip: 0,
    driverEarnings: null,
    paymentStatus: null,
    paymentId: null,
    rating: null,
    status: TRIP_STATUS.REQUESTED,
    simulated: true,
    // AI-assisted: see docs/AI_LOG.md #9 — 1 de cada 4 pasajeros simulados cancela mientras el conductor va a recogerlo
    simulatedPassengerCancelSec: Math.random() < PASSENGER_CANCEL_PROBABILITY ? 15 + Math.round(Math.random() * 15) : null,
    createdAt: serverTimestamp(),
    completedAt: null,
  });
}

// Solicitudes pendientes asignadas a este conductor (tiempo real)
export function subscribeToRequests(driverId, onChange, onError) {
  const q = query(tripsRef, where('driverId', '==', driverId), where('status', '==', TRIP_STATUS.REQUESTED));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}

export function subscribeToTrip(tripId, onChange, onError) {
  return onSnapshot(
    doc(db, 'trips', tripId),
    (snapshot) => onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  );
}

/** Acepta la solicitud y calcula UNA vez la ruta del conductor al punto de recogida. */
export async function acceptTrip(trip, driverId, driverLocation) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'trips', trip.id), { status: TRIP_STATUS.ACCEPTED, acceptedAt: serverTimestamp() });
  batch.update(driverRef(driverId), { activeTripId: trip.id });
  await batch.commit();

  const pickup = await getRoute(driverLocation ?? DEFAULT_LOCATION, trip.origin);
  await updateDoc(doc(db, 'trips', trip.id), {
    status: TRIP_STATUS.DRIVER_ARRIVING,
    pickupRoute: pickup.points,
    pickupDistanceKm: pickup.distanceKm,
    pickupDurationMin: pickup.durationMin,
  });
}

/** Rechazo manual o automático (cuando el temporizador llega a cero). */
export function rejectTrip(tripId, reason = 'driver') {
  return updateDoc(doc(db, 'trips', tripId), {
    status: TRIP_STATUS.REJECTED,
    rejectedReason: reason, // 'driver' | 'timeout'
    rejectedAt: serverTimestamp(),
  });
}

export function markPassengerOnBoard(tripId) {
  return updateDoc(doc(db, 'trips', tripId), { status: TRIP_STATUS.IN_PROGRESS, startedAt: serverTimestamp() });
}

/** Cancelación por cualquiera de las partes ('driver' | 'passenger'): solo antes de in_progress. */
export async function cancelTrip(tripId, driverId, cancelledBy = 'driver') {
  const batch = writeBatch(db);
  batch.update(doc(db, 'trips', tripId), {
    status: TRIP_STATUS.CANCELLED,
    cancelledBy,
    cancelledAt: serverTimestamp(),
  });
  batch.update(driverRef(driverId), { activeTripId: null });
  await batch.commit();
}

/** Finaliza el viaje con la MISMA función usada en la estimación y guarda la comisión aplicada. */
export function finishTrip(trip) {
  const commissionRate = trip.commissionRate ?? COMMISSION_RATE;
  const { fare, commission, driverEarnings } = calculateFare(
    { distanceKm: trip.distanceKm, durationMin: trip.durationMin, category: trip.category, tip: 0 },
    undefined,
    commissionRate,
  );
  return updateDoc(doc(db, 'trips', trip.id), {
    status: TRIP_STATUS.COMPLETED,
    fare,
    commission,
    driverEarnings,
    commissionRate,
    completedAt: serverTimestamp(),
  });
}

/** Libera al conductor para recibir nuevas solicitudes (después del cobro). */
export function closeActiveTrip(driverId) {
  return updateDoc(driverRef(driverId), { activeTripId: null });
}

// Estados que se muestran en el historial (las solicitudes rechazadas no son carreras)
export const HISTORY_STATUSES = [TRIP_STATUS.PAID, TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED];

/**
 * Historial paginado (20 por carga), del más reciente al más antiguo.
 * Requiere UN índice compuesto en Firestore (colección trips):
 *   driverId Ascendente · status Ascendente · createdAt Descendente
 */
export async function fetchTripsPage({ driverId, from, to, cursor, pageSize = 20 }) {
  const constraints = [where('driverId', '==', driverId), where('status', 'in', HISTORY_STATUSES)];
  if (from) constraints.push(where('createdAt', '>=', from));
  if (to) constraints.push(where('createdAt', '<=', to));
  constraints.push(orderBy('createdAt', 'desc'), limit(pageSize));
  if (cursor) constraints.push(startAfter(cursor));

  const snapshot = await getDocs(query(tripsRef, ...constraints));
  return {
    trips: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

/** Viajes PAGADOS desde una fecha, en tiempo real (pantalla de Ganancias). Usa el mismo índice compuesto. */
export function subscribeToTripsSince(driverId, since, onChange, onError) {
  const q = query(
    tripsRef,
    where('driverId', '==', driverId),
    where('status', '==', TRIP_STATUS.PAID),
    where('createdAt', '>=', since),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}
