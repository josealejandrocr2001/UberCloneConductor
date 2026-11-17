// AI-assisted: see docs/AI_LOG.md #7
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useCountdown } from '../../../hooks/useCountdown';
import { acceptTrip, rejectTrip, subscribeToTrip } from '../../../services/tripService';
import {
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  REQUEST_TIMEOUT_SECONDS,
  TRIP_STATUS,
} from '../../../constants/trip';
import { COLORS } from '../../../constants/theme';
import { formatCOP, formatKm, formatMin } from '../../../utils/format';
import Card from '../../../components/Card';
import InfoRow from '../../../components/InfoRow';
import PrimaryButton from '../../../components/PrimaryButton';
import RouteMap from '../../../components/RouteMap';

export default function RequestScreen() {
  const { id } = useLocalSearchParams();
  const { driver } = useAuth();
  const [trip, setTrip] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const handled = useRef(false); // evita aceptar y rechazar la misma solicitud

  useEffect(() => {
    if (!id) return undefined;
    return subscribeToTrip(id, setTrip, (err) => setError(err.message));
  }, [id]);

  const isOpen = trip?.status === TRIP_STATUS.REQUESTED;

  // useCallback: manejadores de aceptar y rechazar (sección 3)
  const handleReject = useCallback(
    async (reason = 'driver') => {
      if (handled.current) return;
      handled.current = true;
      await rejectTrip(id, reason).catch(() => {});
      router.replace('/');
    },
    [id],
  );

  const handleAccept = useCallback(async () => {
    if (handled.current || !trip) return;
    handled.current = true;
    setAccepting(true);
    try {
      await acceptTrip(trip, driver.id, driver.location);
      router.replace('/trip/active');
    } catch (err) {
      handled.current = false;
      setAccepting(false);
      setError(`No se pudo aceptar: ${err.message}`);
    }
  }, [trip, driver]);

  // Temporizador de 15 s: si llega a cero, la solicitud se rechaza automáticamente
  const remaining = useCountdown(REQUEST_TIMEOUT_SECONDS, () => handleReject('timeout'), isOpen && !accepting);

  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isOpen && !accepting) {
    return (
      <View style={styles.center}>
        <Text style={styles.closed}>Esta solicitud ya no está disponible.</Text>
        <PrimaryButton title="Volver al inicio" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const progress = remaining / REQUEST_TIMEOUT_SECONDS;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.timerRow}>
        <Text style={styles.timerText}>⏱️ {remaining} s para responder</Text>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              { width: `${progress * 100}%`, backgroundColor: remaining <= 5 ? COLORS.error : COLORS.primary },
            ]}
          />
        </View>
      </View>

      <RouteMap
        points={trip.route}
        markers={[
          { point: trip.origin, title: 'Recogida', color: 'green' },
          { point: trip.destination, title: 'Destino', color: 'red' },
        ]}
      />

      <Card>
        <Text style={styles.passenger}>👤 {trip.passengerName}</Text>
        <InfoRow label="Origen" value={trip.origin.address} />
        <InfoRow label="Destino" value={trip.destination.address} />
        <InfoRow label="Distancia" value={formatKm(trip.distanceKm)} />
        <InfoRow label="Duración" value={formatMin(trip.durationMin)} />
        <InfoRow label="Categoría" value={CATEGORY_LABELS[trip.category]} />
        <InfoRow label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
        <InfoRow label="Tarifa estimada" value={formatCOP(trip.estimatedFare)} />
        <InfoRow
          label="Tu ganancia neta estimada"
          value={formatCOP(trip.estimatedDriverEarnings)}
          strong
          valueColor={COLORS.success}
        />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title="Aceptar viaje" onPress={handleAccept} loading={accepting} />
      <PrimaryButton title="Rechazar" onPress={() => handleReject('driver')} disabled={accepting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  closed: { textAlign: 'center', fontSize: 16 },
  timerRow: { gap: 6 },
  timerText: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  timerTrack: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%' },
  passenger: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  error: { color: COLORS.error, textAlign: 'center' },
});
