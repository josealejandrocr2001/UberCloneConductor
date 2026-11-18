// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { subscribeToTrip } from '../../../services/tripService';
import {
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  TRIP_STATUS_LABELS,
} from '../../../constants/trip';
import { COLORS } from '../../../constants/theme';
import { formatDateTime, toDate } from '../../../utils/dates';
import { formatCOP, formatKm, formatMin } from '../../../utils/format';
import Card from '../../../components/Card';
import InfoRow from '../../../components/InfoRow';
import RouteMap from '../../../components/RouteMap';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => subscribeToTrip(id, setTrip, (err) => setError(err.message)), [id]);

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const created = toDate(trip.createdAt);
  const payment = PAYMENT_STATUS_LABELS[trip.paymentStatus];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* La ruta guardada se dibuja con Polyline: no se llama a ninguna API de mapas */}
      <RouteMap
        points={trip.route}
        markers={[
          { point: trip.origin, title: 'Recogida', color: 'green' },
          { point: trip.destination, title: 'Destino', color: 'red' },
        ]}
        style={styles.map}
      />

      <Card>
        <InfoRow label="Fecha y hora" value={created ? formatDateTime(created) : '—'} />
        <InfoRow label="Pasajero" value={trip.passengerName} />
        <InfoRow label="Origen" value={trip.origin.address} />
        <InfoRow label="Destino" value={trip.destination.address} />
        <InfoRow label="Distancia" value={formatKm(trip.distanceKm)} />
        <InfoRow label="Duración" value={formatMin(trip.durationMin)} />
        <InfoRow label="Categoría" value={CATEGORY_LABELS[trip.category]} />
        <InfoRow label="Estado del viaje" value={TRIP_STATUS_LABELS[trip.status]} />
        {/* AI-assisted: see docs/AI_LOG.md #9 */}
        {trip.cancelledBy ? (
          <InfoRow label="Cancelado por" value={trip.cancelledBy === 'passenger' ? 'El pasajero' : 'El conductor'} />
        ) : null}
      </Card>

      <Card>
        <InfoRow label="Tarifa" value={formatCOP(trip.fare ?? 0)} />
        <InfoRow
          label={`Comisión (${Math.round((trip.commissionRate ?? 0) * 100)} %)`}
          value={`− ${formatCOP(trip.commission ?? 0)}`}
        />
        <InfoRow label="Propina" value={`+ ${formatCOP(trip.tip ?? 0)}`} />
        <InfoRow label="Ganancia neta" value={formatCOP(trip.driverEarnings ?? 0)} strong valueColor={COLORS.success} />
        <InfoRow label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
        <InfoRow label="Estado del pago" value={payment?.text ?? '—'} valueColor={payment?.color} />
        <InfoRow label="ID del pago" value={trip.paymentId ?? '—'} />
        <InfoRow label="Calificación del pasajero" value={trip.rating ? '⭐'.repeat(trip.rating) : '—'} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center' },
  map: { height: 260 },
  error: { color: COLORS.error, padding: 16 },
});
