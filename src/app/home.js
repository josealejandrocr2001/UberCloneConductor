// AI-assisted: see docs/AI_LOG.md #2
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { DRIVER_STATUS } from '../services/driverService';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../constants/theme';

const STATUS_LABELS = {
  [DRIVER_STATUS.PENDING]: { text: '⏳ Pendiente de aprobación', color: '#E65100' },
  [DRIVER_STATUS.APPROVED]: { text: '✅ Aprobado', color: COLORS.success },
};

// Pantalla temporal: en la próxima entrega será el mapa con el interruptor Disponible
export default function HomeScreen() {
  const { user, initializing, logout } = useAuth();
  const [driver, setDriver] = useState(null);
  const [loadingDriver, setLoadingDriver] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    // Escucha el perfil en tiempo real: si el estado cambia a "approved" en Firestore, la pantalla se actualiza sola
    const unsubscribe = onSnapshot(
      doc(db, 'drivers', user.uid),
      (snapshot) => {
        setDriver(snapshot.exists() ? snapshot.data() : null);
        setLoadingDriver(false);
      },
      () => setLoadingDriver(false),
    );
    return unsubscribe; // limpieza al salir de la pantalla
  }, [user]);

  if (!initializing && !user) return <Redirect href="/login" />;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const status = STATUS_LABELS[driver?.status];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola{driver ? `, ${driver.personal.fullName.split(' ')[0]}` : ''}!</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {loadingDriver ? (
        <ActivityIndicator />
      ) : driver ? (
        <View style={styles.card}>
          <Text style={[styles.status, { color: status?.color ?? COLORS.text }]}>
            {status?.text ?? driver.status}
          </Text>
          <Text style={styles.detail}>
            {driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.plate}
          </Text>
          {driver.status !== DRIVER_STATUS.APPROVED ? (
            <Text style={styles.note}>No puedes ponerte Disponible hasta que tu cuenta sea aprobada.</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.note}>No se encontró el perfil del conductor.</Text>
      )}

      <PrimaryButton title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  email: { textAlign: 'center', marginVertical: 12, color: COLORS.muted },
  card: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 16, marginBottom: 16, gap: 6 },
  status: { fontSize: 18, fontWeight: '700' },
  detail: { color: COLORS.text },
  note: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
