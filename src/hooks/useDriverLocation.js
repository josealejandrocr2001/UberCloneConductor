// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { updateDriverLocation } from '../services/driverService';

const SEND_INTERVAL_MS = 5000; // "cada pocos segundos" (sección 3)

/**
 * Ubicación del conductor.
 * - tracking = true: watchPositionAsync continuo y envío a Firestore cada 5 s.
 * - tracking = false: solo una lectura para centrar el mapa; nada se envía a la base de datos.
 * La función de limpieza del useEffect detiene el seguimiento al pasar a No disponible o salir de la pantalla.
 */
export function useDriverLocation(driverId, tracking) {
  const [location, setLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let subscription = null;
    let lastSent = 0;

    const toPoint = ({ coords }) => ({ lat: coords.latitude, lng: coords.longitude, heading: coords.heading ?? null });

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);

      if (!tracking) {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) setLocation(toPoint(position));
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: SEND_INTERVAL_MS, distanceInterval: 10 },
        (position) => {
          setLocation(toPoint(position));
          const now = Date.now();
          if (driverId && now - lastSent >= SEND_INTERVAL_MS) {
            lastSent = now;
            updateDriverLocation(driverId, position.coords).catch(() => {});
          }
        },
      );
      if (cancelled) subscription.remove();
    })().catch(() => setPermissionDenied(true));

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [driverId, tracking]);

  return { location, permissionDenied };
}
