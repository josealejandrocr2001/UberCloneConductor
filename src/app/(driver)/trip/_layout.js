// AI-assisted: see docs/AI_LOG.md #7
import { Stack } from 'expo-router';

// Stack para el flujo del viaje: solicitud → viaje en curso → cobro (sin volver atrás a mitad del servicio)
export default function TripLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center', headerBackVisible: false, gestureEnabled: false }}>
      <Stack.Screen name="request" options={{ title: 'Solicitud entrante' }} />
      <Stack.Screen name="active" options={{ title: 'Viaje en curso' }} />
      <Stack.Screen name="summary" options={{ title: 'Cobro y resumen' }} />
    </Stack>
  );
}
