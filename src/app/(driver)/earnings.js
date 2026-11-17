// AI-assisted: see docs/AI_LOG.md #7
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useEarnings } from '../../hooks/useEarnings';
import { COLORS } from '../../constants/theme';
import { formatCOP } from '../../utils/format';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import InfoRow from '../../components/InfoRow';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

export default function EarningsScreen() {
  const { driver } = useAuth();
  const { periods, loading, error } = useEarnings(driver?.id);
  const [period, setPeriod] = useState('today');
  const totals = periods[period];
  const balance = driver?.balance ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.muted}>Saldo en la app</Text>
        <Text style={[styles.balance, { color: balance < 0 ? COLORS.error : COLORS.success }]}>{formatCOP(balance)}</Text>
        <Text style={styles.muted}>
          Ganancias de viajes pagados por la pasarela menos comisiones de viajes en efectivo. La liquidación es simulada.
        </Text>
      </Card>

      <View style={styles.chips}>
        {PERIODS.map((p) => (
          <Chip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} />
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" /> : null}
      {error ? (
        <Text style={styles.error}>
          No se pudieron cargar las ganancias. Si el error menciona un índice, créalo en Firestore (ver README).
        </Text>
      ) : null}

      {!loading && !error ? (
        <Card>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totals.trips}</Text>
              <Text style={styles.muted}>viajes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{formatCOP(totals.net)}</Text>
              <Text style={styles.muted}>ganancia neta</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <InfoRow label="Total facturado" value={formatCOP(totals.billed)} />
          <InfoRow label="Comisiones de la plataforma" value={`− ${formatCOP(totals.commissions)}`} />
          <InfoRow label="Propinas" value={`+ ${formatCOP(totals.tips)}`} />
          <InfoRow label="Ganancia neta" value={formatCOP(totals.net)} strong />
          <InfoRow label="Promedio por viaje" value={formatCOP(totals.average)} />
          {totals.trips === 0 ? <Text style={styles.empty}>Aún no tienes viajes pagados en este periodo.</Text> : null}
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  muted: { color: COLORS.muted, fontSize: 13 },
  balance: { fontSize: 32, fontWeight: '800' },
  chips: { flexDirection: 'row', gap: 8 },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  error: { color: COLORS.error, textAlign: 'center' },
});
