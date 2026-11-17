// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useTrip } from '../../../context/TripContext';
import { useDriverLocation } from '../../../hooks/useDriverLocation';
import { notifyPassengerCancelled } from '../../../services/notificationService';
import { cancelTrip, finishTrip, markPassengerOnBoard } from '../../../services/tripService';
import { PAYMENT_METHOD_LABELS, TRIP_STATUS, TRIP_STATUS_LABELS } from '../../../constants/trip';
import { COLORS } from '../../../constants/theme';
import { formatCOP, formatKm, formatMin } from '../../../utils/format';
import Card from '../../../components/Card';
import InfoRow from '../../../components/InfoRow';
import PrimaryButton from '../../../components/PrimaryButton';
import RouteMap from '../../../components/RouteMap';
import StatusBadge from '../../../components/StatusBadge';

export default function ActiveTripScreen() {
  const { driver } = useAuth();
  const { activeTrip: trip, activeTripId, setNotice } = useTrip();
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState(null);

  // Durante el viaje la ubicación se sigue enviando a la base de datos
  const { location } = useDriverLocation(driver?.id, true);

  // AI-assisted: see docs/AI_LOG.md #9 — SIMULACIÓN: el pasajero puede cancelar mientras el conductor va por él.
  // Si el conductor marca "Pasajero a bordo" antes, la limpieza del efecto cancela el temporizador.
  const cancelAfterSec = trip?.status === TRIP_STATUS.DRIVER_ARRIVING ? trip?.simulatedPassengerCancelSec : null;
  useEffect(() => {
    if (!cancelAfterSec || !trip || !driver) return undefined;
    const timer = setTimeout(async () => {
      try {
        await cancelTrip(trip.id, driver.id, 'passenger');
        setNotice(`❌ ${trip.passengerName} canceló el viaje.`);
        notifyPassengerCancelled(trip);
        router.replace('/');
      } catch {
        // si falla, el viaje sigue normalmente
      }
    }, cancelAfterSec * 1000);
    return () => clearTimeout(timer);
  }, [cancelAfterSec, trip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeTripId) return <Redirect href="/" />;
  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const goingToPickup = trip.status === TRIP_STATUS.ACCEPTED || trip.status === TRIP_STATUS.DRIVER_ARRIVING;
  const driverPoint = location ?? driver?.location;

  // Antes de recoger: ruta conductor → recogida. Con el pasajero a bordo: ruta recogida → destino.
  const points = goingToPickup ? (trip.pickupRoute ?? []) : trip.route;
  const markers = goingToPickup
    ? [
        ...(driverPoint ? [{ point: driverPoint, title: 'Tú', color: 'blue' }] : []),
        { point: trip.origin, title: 'Recogida', color: 'green' },
      ]
    : [
        { point: trip.origin, title: 'Recogida', color: 'green' },
        { point: trip.destination, title: 'Destino', color: 'red' },
      ];

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    run(async () => {
      await cancelTrip(trip.id, driver.id);
      router.replace('/');
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBadge text={TRIP_STATUS_LABELS[trip.status]} color={goingToPickup ? '#E65100' : COLORS.success} />

      <RouteMap points={points} markers={markers} style={styles.map} showsUserLocation />

      <Card>
        <Text style={styles.heading}>{goingToPickup ? '🧍 Recoge a tu pasajero' : '🏁 Lleva al pasajero a su destino'}</Text>
        <InfoRow label="Pasajero" value={trip.passengerName} />
        {goingToPickup ? (
          <>
            <InfoRow label="Punto de recogida" value={trip.origin.address} />
            <InfoRow
              label="Hasta la recogida"
              value={
                trip.pickupDistanceKm != null
                  ? `${formatKm(trip.pickupDistanceKm)} · ${formatMin(trip.pickupDurationMin)}`
                  : 'Calculando ruta…'
              }
            />
          </>
        ) : (
          <>
            <InfoRow label="Destino" value={trip.destination.address} />
            <InfoRow label="Recorrido" value={`${formatKm(trip.distanceKm)} · ${formatMin(trip.durationMin)}`} />
          </>
        )}
        <InfoRow label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
        <InfoRow label="Tarifa estimada" value={formatCOP(trip.estimatedFare)} />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {goingToPickup ? (
        <>
          <PrimaryButton
            title="Pasajero a bordo"
            loading={busy}
            disabled={trip.status !== TRIP_STATUS.DRIVER_ARRIVING}
            onPress={() => run(() => markPassengerOnBoard(trip.id))}
          />
          <PrimaryButton
            title={confirmCancel ? 'Toca de nuevo para confirmar la cancelación' : 'Cancelar viaje'}
            disabled={busy}
            onPress={handleCancel}
          />
        </>
      ) : (
        <PrimaryButton title="Finalizar viaje" loading={busy} onPress={() => run(() => finishTrip(trip))} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center' },
  map: { height: 300 },
  heading: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  error: { color: COLORS.error, textAlign: 'center' },
});
