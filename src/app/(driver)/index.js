// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useIsFocused } from 'expo-router';
import MapView from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripRequests } from '../../hooks/useTripRequests';
import { setDriverAvailability } from '../../services/driverService';
import { CATEGORY_LABELS, TRIP_STATUS } from '../../constants/trip';
import { COLORS } from '../../constants/theme';
import { DEFAULT_LOCATION, toLatLng } from '../../utils/geo';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';

const AVAILABILITY_KEY = '@lastAvailability';

export default function HomeScreen() {
  const { driver } = useAuth();
  const { activeTrip, activeTripId, notice, setNotice } = useTrip();
  const isFocused = useIsFocused();
  const mapRef = useRef(null);

  const approved = driver?.status === 'approved';
  const [available, setAvailable] = useState(false); // useState para la disponibilidad
  const [message, setMessage] = useState(null);

  // Restaura el último estado de disponibilidad (AsyncStorage solo guarda preferencias)
  useEffect(() => {
    AsyncStorage.getItem(AVAILABILITY_KEY)
      .then((value) => {
        if (value === 'true' && approved && driver?.id) {
          setAvailable(true);
          // AI-assisted: see docs/AI_LOG.md #8 — sincroniza también el estado en Firestore
          setDriverAvailability(driver.id, true).catch(() => {});
        }
      })
      .catch(() => {});
  }, [approved, driver?.id]);

  // Si la cuenta deja de estar aprobada, no puede seguir disponible
  useEffect(() => {
    if (!approved) setAvailable(false);
  }, [approved]);

  // Seguimiento solo mientras está Disponible Y en esta pantalla (la limpieza lo detiene al salir)
  const tracking = available && isFocused;
  const { location, permissionDenied } = useDriverLocation(driver?.id, tracking);

  const { pendingRequest, error } = useTripRequests({
    driverId: driver?.id,
    enabled: tracking && approved && !activeTripId,
    category: driver?.vehicle?.category,
    driverLocation: location ?? driver?.location ?? null,
  });

  // Centra el mapa en el conductor
  useEffect(() => {
    if (!location) return;
    mapRef.current?.animateToRegion({ ...toLatLng(location), latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
  }, [location]);

  // Nueva solicitud → pantalla de solicitud entrante
  useEffect(() => {
    if (pendingRequest && isFocused) {
      router.push({ pathname: '/trip/request', params: { id: pendingRequest.id } });
    }
  }, [pendingRequest?.id, isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAvailability = async (value) => {
    setMessage(null);
    if (value && !approved) {
      setMessage('Tu cuenta debe estar aprobada para ponerte Disponible.');
      return;
    }
    setAvailable(value);
    AsyncStorage.setItem(AVAILABILITY_KEY, String(value)).catch(() => {});
    try {
      await setDriverAvailability(driver.id, value);
    } catch {
      setMessage('No se pudo actualizar tu estado en el servidor.');
    }
  };

  const start = location ?? driver?.location ?? DEFAULT_LOCATION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{ ...toLatLng(start), latitudeDelta: 0.03, longitudeDelta: 0.03 }}
      />

      <Card style={styles.panel}>
        {!approved ? (
          <StatusBadge text="⏳ Pendiente de aprobación" color="#E65100" />
        ) : (
          <StatusBadge text={`✅ Aprobado · ${CATEGORY_LABELS[driver?.vehicle?.category] ?? ''}`} color={COLORS.success} />
        )}

        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.title}>{available ? 'Disponible' : 'No disponible'}</Text>
            <Text style={styles.subtitle}>
              {available ? 'Compartiendo tu ubicación cada 5 segundos' : 'No recibirás solicitudes'}
            </Text>
          </View>
          <Switch value={available} onValueChange={toggleAvailability} disabled={!approved} />
        </View>

        {notice ? (
          <Pressable style={styles.notice} onPress={() => setNotice(null)}>
            <Text style={styles.noticeText}>{notice}</Text>
            <Text style={styles.noticeHint}>Toca para cerrar</Text>
          </Pressable>
        ) : null}

        {/* AI-assisted: see docs/AI_LOG.md #8 — si el conductor salió del viaje (botón Atrás), puede volver a él */}
        {activeTripId ? (
          <PrimaryButton
            title="🚗 Tienes un viaje en curso · Ver viaje"
            onPress={() =>
              router.replace(
                activeTrip?.status === TRIP_STATUS.COMPLETED || activeTrip?.status === TRIP_STATUS.PAID
                  ? '/trip/summary'
                  : '/trip/active',
              )
            }
          />
        ) : null}

        {available && approved && !activeTripId ? (
          <View style={styles.searching}>
            <ActivityIndicator size="small" />
            <Text style={styles.subtitle}>Buscando pasajeros cerca… (solicitudes simuladas)</Text>
          </View>
        ) : null}

        {!approved ? (
          <Text style={styles.note}>No puedes ponerte Disponible hasta que tu cuenta sea aprobada.</Text>
        ) : null}
        {permissionDenied ? (
          <Text style={styles.error}>Activa el permiso de ubicación para recibir solicitudes.</Text>
        ) : null}
        {message ? <Text style={styles.error}>{message}</Text> : null}
        {error ? <Text style={styles.error}>Error al recibir solicitudes: {error}</Text> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: { position: 'absolute', left: 16, right: 16, bottom: 24, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13 },
  searching: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { color: COLORS.muted, fontSize: 13 },
  error: { color: COLORS.error, fontSize: 13 },
  notice: { backgroundColor: '#FDECEA', borderRadius: 8, padding: 10 },
  noticeText: { color: COLORS.error, fontWeight: '700' },
  noticeHint: { color: COLORS.muted, fontSize: 12 },
});
