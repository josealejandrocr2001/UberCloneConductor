// AI-assisted: see docs/AI_LOG.md #7
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToTrip } from '../services/tripService';

// Viaje activo del conductor. El perfil guarda activeTripId y aquí se escucha ese viaje en tiempo real.
const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { driver } = useAuth();
  const activeTripId = driver?.activeTripId ?? null;
  const [activeTrip, setActiveTrip] = useState(null);
  const [notice, setNotice] = useState(null); // p. ej. "El pasajero canceló el viaje"

  useEffect(() => {
    if (!activeTripId) {
      setActiveTrip(null);
      return undefined;
    }
    return subscribeToTrip(activeTripId, setActiveTrip); // limpieza: deja de escuchar el viaje
  }, [activeTripId]);

  const value = useMemo(() => ({ activeTrip, activeTripId, notice, setNotice }), [activeTrip, activeTripId, notice]);
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTrip = () => useContext(TripContext);
