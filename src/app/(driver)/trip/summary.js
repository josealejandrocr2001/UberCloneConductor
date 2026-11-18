// AI-assisted: see docs/AI_LOG.md #7
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useTrip } from '../../../context/TripContext';
import { closeActiveTrip } from '../../../services/tripService';
import { registerCashPayment, simulateGatewayPayment, TEST_CARDS, TIP_OPTIONS } from '../../../services/paymentService';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  TRIP_STATUS,
} from '../../../constants/trip';
import { COLORS } from '../../../constants/theme';
import { calculateFare } from '../../../utils/calculateFare';
import { formatCOP } from '../../../utils/format';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import InfoRow from '../../../components/InfoRow';
import PrimaryButton from '../../../components/PrimaryButton';
import StatusBadge from '../../../components/StatusBadge';

export default function SummaryScreen() {
  const { driver } = useAuth();
  const { activeTrip: trip, activeTripId } = useTrip();
  const [tip, setTip] = useState(0);
  const [card, setCard] = useState(TEST_CARDS[0].status);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!activeTripId) return <Redirect href="/" />;
  if (!trip || trip.fare == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const paid = trip.status === TRIP_STATUS.PAID;
  const paymentLabel = PAYMENT_STATUS_LABELS[trip.paymentStatus];
  const percent = Math.round((trip.commissionRate ?? 0) * 100);

  // Vista previa con la propina elegida (misma función de tarifa)
  const preview = paid
    ? { fare: trip.fare, commission: trip.commission, driverEarnings: trip.driverEarnings }
    : calculateFare(
        { distanceKm: trip.distanceKm, durationMin: trip.durationMin, category: trip.category, tip },
        undefined,
        trip.commissionRate,
      );
  const shownTip = paid ? trip.tip ?? 0 : tip;

  const run = async (action) => {
    setProcessing(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const payWithGateway = () => run(() => simulateGatewayPayment(trip, driver.id, { outcome: card, tip }));
  const payCash = () => run(() => registerCashPayment(trip, driver.id, tip));

  const finish = () =>
    run(async () => {
      await closeActiveTrip(driver.id);
      router.replace('/');
    });

  const usesGateway = trip.paymentMethod === PAYMENT_METHODS.MERCADOPAGO;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.heading}>{paid ? '✅ Viaje cobrado' : '🧾 Viaje finalizado'}</Text>
        <InfoRow label="Pasajero" value={trip.passengerName} />
        <InfoRow label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
        <View style={styles.badgeRow}>
          <Text style={styles.muted}>Estado del pago</Text>
          {paymentLabel ? (
            <StatusBadge text={paymentLabel.text} color={paymentLabel.color} />
          ) : (
            <StatusBadge text="Sin cobrar" color={COLORS.muted} />
          )}
        </View>
      </Card>

      <Card>
        <InfoRow label="Tarifa final" value={formatCOP(preview.fare)} />
        <InfoRow label={`Comisión de la plataforma (${percent} %)`} value={`− ${formatCOP(preview.commission)}`} />
        <InfoRow label="Propina (100 % para ti)" value={`+ ${formatCOP(shownTip)}`} />
        <View style={styles.divider} />
        <InfoRow label="Tu ganancia neta" value={formatCOP(preview.driverEarnings)} strong valueColor={COLORS.success} />
        {trip.paymentMethod === PAYMENT_METHODS.CASH || trip.paymentStatus === PAYMENT_STATUS.CASH ? (
          <Text style={styles.muted}>
            En efectivo recibes el dinero directamente; la comisión se descuenta de tu saldo en la app.
          </Text>
        ) : null}
      </Card>

      {!paid ? (
        <Card>
          <Text style={styles.subheading}>Propina del pasajero (simulada)</Text>
          <View style={styles.chips}>
            {TIP_OPTIONS.map((value) => (
              <Chip key={value} label={value ? formatCOP(value) : 'Sin propina'} selected={tip === value} onPress={() => setTip(value)} />
            ))}
          </View>

          {usesGateway && trip.paymentStatus !== PAYMENT_STATUS.APPROVED ? (
            <>
              <Text style={styles.subheading}>Pasarela de prueba — Mercado Pago (simulada)</Text>
              <Text style={styles.muted}>
                Elige el titular de la tarjeta de prueba, como en el sandbox de Mercado Pago:
              </Text>
              {TEST_CARDS.map((option) => (
                <Pressable
                  key={option.holder}
                  style={[styles.option, card === option.status && styles.optionSelected]}
                  onPress={() => setCard(option.status)}
                >
                  <Text style={styles.optionText}>
                    {card === option.status ? '◉' : '○'} {option.holder} — {option.label}
                  </Text>
                </Pressable>
              ))}
              {trip.paymentStatus === PAYMENT_STATUS.PENDING ? (
                <Text style={styles.warning}>El pago quedó pendiente. Puedes consultar de nuevo con otra respuesta.</Text>
              ) : null}
              {trip.paymentStatus === PAYMENT_STATUS.REJECTED ? (
                <Text style={styles.errorText}>El pago fue rechazado. Intenta otra vez o cobra en efectivo.</Text>
              ) : null}
              <PrimaryButton
                title={processing ? 'Esperando confirmación de la pasarela…' : 'Cobrar con Mercado Pago (prueba)'}
                loading={processing}
                onPress={payWithGateway}
              />
            </>
          ) : null}

          {!usesGateway || trip.paymentStatus === PAYMENT_STATUS.REJECTED ? (
            <PrimaryButton title="Marcar cobro en efectivo recibido" disabled={processing} onPress={payCash} />
          ) : null}
        </Card>
      ) : (
        <Card>
          <InfoRow label="ID del pago" value={trip.paymentId} />
          <InfoRow label="Calificación del pasajero" value={'⭐'.repeat(trip.rating ?? 0) || '—'} />
          <PrimaryButton title="Volver al inicio" loading={processing} onPress={finish} />
        </Card>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center' },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subheading: { fontWeight: '700', marginTop: 4 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  muted: { color: COLORS.muted, fontSize: 13 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12 },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: '#F5F5F5' },
  optionText: { fontWeight: '600' },
  warning: { color: '#E65100' },
  errorText: { color: COLORS.error, textAlign: 'center' },
});
