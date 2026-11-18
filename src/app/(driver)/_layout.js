// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, usePathname } from 'expo-router';
import { Drawer, DrawerContentScrollView, DrawerItemList } from 'expo-router/drawer';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { setupNotifications } from '../../services/notificationService';
import { TRIP_STATUS } from '../../constants/trip';
import { COLORS } from '../../constants/theme';
import { formatCOP } from '../../utils/format';

const TRIP_SCREENS = {
  [TRIP_STATUS.ACCEPTED]: '/trip/active',
  [TRIP_STATUS.DRIVER_ARRIVING]: '/trip/active',
  [TRIP_STATUS.IN_PROGRESS]: '/trip/active',
  [TRIP_STATUS.COMPLETED]: '/trip/summary',
  [TRIP_STATUS.PAID]: '/trip/summary',
};

function DriverDrawerContent(props) {
  const { driver, logout } = useAuth();
  const approved = driver?.status === 'approved';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{driver?.personal?.fullName ?? 'Conductor'}</Text>
        <Text style={styles.vehicle}>
          {driver?.vehicle?.brand} {driver?.vehicle?.model} · {driver?.vehicle?.plate}
        </Text>
        <Text style={[styles.status, { color: approved ? COLORS.success : '#E65100' }]}>
          {approved ? '✅ Aprobado' : '⏳ Pendiente de aprobación'}
        </Text>
        <Text style={styles.balance}>Saldo: {formatCOP(driver?.balance)}</Text>
      </View>
      <DrawerItemList {...props} />
      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

export default function DriverLayout() {
  const { user, initializing, driver, driverLoading, logout } = useAuth();
  const { activeTrip } = useTrip();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    setupNotifications();
  }, []);

  // El campo "status" del viaje controla qué pantalla se muestra (sección 3).
  // También retoma el viaje si la app se cerró en medio de un servicio.
  useEffect(() => {
    const target = TRIP_SCREENS[activeTrip?.status];
    if (target && pathnameRef.current !== target) router.replace(target);
  }, [activeTrip?.id, activeTrip?.status]);

  if (initializing || (user && driverLoading)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  // AI-assisted: see docs/AI_LOG.md #8 — cuenta de Authentication sin documento en "drivers"
  if (!driver) {
    return (
      <View style={styles.loading}>
        <Text style={styles.noProfile}>Esta cuenta no tiene perfil de conductor.</Text>
        <Text style={styles.noProfileHint}>Regístrate desde la pantalla de inicio de sesión para crear uno.</Text>
        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Text style={[styles.logoutText, { textAlign: 'center' }]}>Cerrar sesión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Drawer
      drawerContent={(props) => <DriverDrawerContent {...props} />}
      screenOptions={{ headerTitleAlign: 'center', drawerActiveTintColor: COLORS.primary }}
    >
      <Drawer.Screen name="index" options={{ title: 'Inicio', drawerLabel: '🏠 Inicio' }} />
      <Drawer.Screen name="earnings" options={{ title: 'Ganancias', drawerLabel: '💰 Ganancias' }} />
      <Drawer.Screen name="history" options={{ title: 'Historial', drawerLabel: '🧾 Historial', headerShown: false }} />
      <Drawer.Screen name="profile" options={{ title: 'Perfil y configuración', drawerLabel: '👤 Perfil y configuración' }} />
      {/* El flujo del viaje es un Stack que no aparece en el menú */}
      <Drawer.Screen
        name="trip"
        options={{ headerShown: false, swipeEnabled: false, drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', padding: 24 },
  noProfile: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  noProfileHint: { color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  header: { padding: 16, gap: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 8 },
  name: { fontSize: 18, fontWeight: '800' },
  vehicle: { color: COLORS.muted },
  status: { fontWeight: '700' },
  balance: { fontWeight: '700', marginTop: 4 },
  logout: { padding: 16, marginTop: 8 },
  logoutText: { color: COLORS.error, fontWeight: '700' },
});
