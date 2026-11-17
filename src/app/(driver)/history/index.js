// AI-assisted: see docs/AI_LOG.md #7
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { fetchTripsPage } from '../../../services/tripService';
import {
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS_LABELS,
  TRIP_STATUS_LABELS,
} from '../../../constants/trip';
import { COLORS } from '../../../constants/theme';
import { endOfDay, formatDateTime, startOfDay, startOfMonth, startOfWeek, toDate } from '../../../utils/dates';
import { formatCOP } from '../../../utils/format';
import Chip from '../../../components/Chip';
import DateField from '../../../components/DateField';
import StatusBadge from '../../../components/StatusBadge';

const DATE_FILTERS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'range', label: 'Rango' },
];
const PAYMENT_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: PAYMENT_METHODS.MERCADOPAGO, label: 'Mercado Pago' },
  { key: PAYMENT_METHODS.CASH, label: 'Efectivo' },
];

function TripItem({ trip }) {
  const created = toDate(trip.createdAt);
  const payment = PAYMENT_STATUS_LABELS[trip.paymentStatus];
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/history/${trip.id}`)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.date}>{created ? formatDateTime(created) : '—'}</Text>
        {payment ? (
          <StatusBadge text={payment.text} color={payment.color} />
        ) : (
          <StatusBadge text={TRIP_STATUS_LABELS[trip.status]} color={COLORS.muted} />
        )}
      </View>
      <Text style={styles.route} numberOfLines={2}>
        {trip.origin.address} → {trip.destination.address}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={styles.muted}>
          {CATEGORY_LABELS[trip.category]} · {PAYMENT_METHOD_LABELS[trip.paymentMethod]}
        </Text>
        <Text style={styles.muted}>Tarifa {formatCOP(trip.fare ?? trip.estimatedFare)}</Text>
      </View>
      <Text style={styles.net}>Ganancia neta {formatCOP(trip.driverEarnings ?? 0)}</Text>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const { driver } = useAuth();
  const [dateFilter, setDateFilter] = useState('week');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [rangeFrom, setRangeFrom] = useState(null);
  const [rangeTo, setRangeTo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const range = useMemo(() => {
    const now = new Date();
    if (dateFilter === 'today') return { from: startOfDay(now), to: endOfDay(now) };
    if (dateFilter === 'week') return { from: startOfWeek(now), to: endOfDay(now) };
    if (dateFilter === 'month') return { from: startOfMonth(now), to: endOfDay(now) };
    if (rangeFrom && rangeTo && rangeFrom <= rangeTo) return { from: startOfDay(rangeFrom), to: endOfDay(rangeTo) };
    return null; // rango incompleto
  }, [dateFilter, rangeFrom, rangeTo]);

  const loadPage = useCallback(
    async (reset) => {
      if (!driver?.id || !range) return;
      setLoading(true);
      setError(null);
      try {
        const page = await fetchTripsPage({ driverId: driver.id, ...range, cursor: reset ? null : cursor });
        setTrips((prev) => (reset ? page.trips : [...prev, ...page.trips]));
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (err) {
        console.log('[Historial]', err.message); // si falta el índice, Firestore incluye aquí el enlace para crearlo
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [driver?.id, range, cursor],
  );

  // Recarga desde cero cuando cambia el filtro de fechas
  useEffect(() => {
    setTrips([]);
    setCursor(null);
    if (range) loadPage(true);
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  // El filtro por método de pago se aplica sobre los viajes cargados
  const visible = useMemo(
    () => (paymentFilter === 'all' ? trips : trips.filter((trip) => trip.paymentMethod === paymentFilter)),
    [trips, paymentFilter],
  );

  const header = (
    <View style={styles.filters}>
      <View style={styles.chips}>
        {DATE_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={dateFilter === f.key} onPress={() => setDateFilter(f.key)} />
        ))}
      </View>
      {dateFilter === 'range' ? (
        <View style={styles.rangeRow}>
          <View style={styles.flex}>
            <DateField label="Desde" value={rangeFrom} maximumDate={new Date()} onChange={setRangeFrom} />
          </View>
          <View style={styles.flex}>
            <DateField
              label="Hasta"
              value={rangeTo}
              maximumDate={new Date()}
              onChange={setRangeTo}
              error={rangeFrom && rangeTo && rangeFrom > rangeTo ? 'Debe ser posterior a "Desde"' : null}
            />
          </View>
        </View>
      ) : null}
      <View style={styles.chips}>
        {PAYMENT_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={paymentFilter === f.key} onPress={() => setPaymentFilter(f.key)} />
        ))}
      </View>
      {error ? (
        <Text style={styles.error}>
          No se pudo cargar el historial. Si el error menciona un índice, créalo en Firestore (ver README).
        </Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={visible}
      keyExtractor={(trip) => trip.id}
      renderItem={({ item }) => <TripItem trip={item} />}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (hasMore && !loading) loadPage(false);
      }}
      ListEmptyComponent={
        loading ? null : (
          <Text style={styles.empty}>
            {range ? 'No tienes viajes en este filtro.' : 'Elige las fechas "Desde" y "Hasta".'}
          </Text>
        )
      }
      ListFooterComponent={loading ? <ActivityIndicator style={styles.footer} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  filters: { gap: 10, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rangeRow: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  item: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, gap: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontWeight: '700' },
  route: { color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 13 },
  net: { color: COLORS.success, fontWeight: '800' },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 24 },
  error: { color: COLORS.error },
  footer: { marginVertical: 16 },
});
