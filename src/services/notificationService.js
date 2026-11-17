// AI-assisted: see docs/AI_LOG.md #7
// Expo Go no permite notificaciones push remotas (FCM) desde el SDK 53; requieren un development build.
// Como las solicitudes son simuladas, se usan notificaciones LOCALES para avisar de una nueva solicitud.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatCOP } from '../utils/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let ready = false;

export async function setupNotifications() {
  try {
    if (Platform.OS === 'android') {
      // En Android 13+ el permiso no se pide hasta que exista al menos un canal
      await Notifications.setNotificationChannelAsync('trip-requests', {
        name: 'Solicitudes de viaje',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    ready = status === 'granted';
  } catch {
    ready = false;
  }
  return ready;
}

export async function notifyNewRequest(trip) {
  if (!ready) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Nueva solicitud de viaje',
        body: `${trip.origin.address} → ${trip.destination.address} · ${formatCOP(trip.estimatedFare)}`,
      },
      trigger: null,
    });
  } catch {
    // La notificación es un apoyo: si falla, la solicitud igual aparece en pantalla
  }
}

// AI-assisted: see docs/AI_LOG.md #9
export async function notifyPassengerCancelled(trip) {
  if (!ready) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: '❌ Viaje cancelado', body: `${trip.passengerName} canceló el viaje.` },
      trigger: null,
    });
  } catch {
    // apoyo visual opcional
  }
}
