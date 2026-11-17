// AI-assisted: see docs/AI_LOG.md #7
import { Stack } from 'expo-router';
import { DrawerToggleButton } from 'expo-router/drawer';

export default function HistoryLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Historial de carreras', headerLeft: () => <DrawerToggleButton /> }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle del viaje' }} />
    </Stack>
  );
}
