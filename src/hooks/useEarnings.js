// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useMemo, useState } from 'react';
import { TRIP_STATUS } from '../constants/trip';
import { subscribeToTripsSince } from '../services/tripService';
import { startOfDay, startOfMonth, startOfWeek, toDate } from '../utils/dates';

const emptyTotals = () => ({ trips: 0, billed: 0, commissions: 0, tips: 0, net: 0, average: 0 });

function summarize(trips) {
  const totals = trips.reduce((acc, trip) => {
    acc.trips += 1;
    acc.billed += trip.fare ?? 0;
    acc.commissions += trip.commission ?? 0;
    acc.tips += trip.tip ?? 0;
    acc.net += trip.driverEarnings ?? 0;
    return acc;
  }, emptyTotals());
  totals.average = totals.trips ? Math.round(totals.net / totals.trips) : 0;
  return totals;
}

/** Totales de hoy, semana y mes calculados con useMemo sobre el historial (sección 5). */
export function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Se consulta desde el inicio de la semana o del mes, lo que sea más antiguo
  const since = useMemo(() => {
    const week = startOfWeek();
    const month = startOfMonth();
    return week < month ? week : month;
  }, []);

  useEffect(() => {
    if (!driverId) return undefined;
    setLoading(true);
    return subscribeToTripsSince(
      driverId,
      since,
      (list) => {
        setTrips(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, [driverId, since]);

  const periods = useMemo(() => {
    const paid = trips.filter((trip) => trip.status === TRIP_STATUS.PAID);
    const dateOf = (trip) => toDate(trip.completedAt) ?? toDate(trip.createdAt) ?? new Date(0);
    const from = (start) => paid.filter((trip) => dateOf(trip) >= start);
    return {
      today: summarize(from(startOfDay(new Date()))),
      week: summarize(from(startOfWeek())),
      month: summarize(from(startOfMonth())),
    };
  }, [trips]);

  return { periods, loading, error };
}
