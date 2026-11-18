// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useRef, useState } from 'react';
import { createSimulatedRequest, rejectTrip, subscribeToRequests } from '../services/tripService';
import { notifyNewRequest } from '../services/notificationService';
import { toDate } from '../utils/dates';

const MIN_DELAY_MS = 8000;
const MAX_DELAY_MS = 15000;
const STALE_REQUEST_MS = 60000;

/**
 * Solicitudes entrantes en tiempo real (onSnapshot sobre la colección trips).
 * Mientras el conductor está Disponible y libre, simula a un pasajero que pide un viaje cada 8–15 s.
 */
export function useTripRequests({ driverId, enabled, category, driverLocation }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const notifiedIds = useRef(new Set());
  const locationRef = useRef(driverLocation);
  locationRef.current = driverLocation;

  // 1) Suscripción en tiempo real
  useEffect(() => {
    if (!driverId || !enabled) {
      setRequests([]);
      return undefined;
    }
    const unsubscribe = subscribeToRequests(
      driverId,
      (list) => {
        const now = Date.now();
        const fresh = [];
        list.forEach((trip) => {
          const created = toDate(trip.createdAt);
          // Solicitudes viejas (p. ej. si la app se cerró): se rechazan por tiempo
          if (created && now - created.getTime() > STALE_REQUEST_MS) {
            rejectTrip(trip.id, 'timeout').catch(() => {});
            return;
          }
          fresh.push(trip);
          if (!notifiedIds.current.has(trip.id) && created) {
            notifiedIds.current.add(trip.id);
            notifyNewRequest(trip);
          }
        });
        setRequests(fresh);
        setError(null);
      },
      (err) => setError(err.message),
    );
    return unsubscribe;
  }, [driverId, enabled]);

  // 2) Simulador del pasajero: solo si está disponible y no hay otra solicitud pendiente
  const hasPending = requests.length > 0;
  useEffect(() => {
    if (!driverId || !enabled || !category || hasPending) return undefined;
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = setTimeout(() => {
      createSimulatedRequest({ driverId, category, driverLocation: locationRef.current }).catch((err) =>
        setError(err.message),
      );
    }, delay);
    return () => clearTimeout(timer); // limpieza: si deja de estar disponible, no se crea la solicitud
  }, [driverId, enabled, category, hasPending]);

  return { pendingRequest: requests[0] ?? null, error };
}
