// AI-assisted: see docs/AI_LOG.md #1
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useRegistration } from '../../context/RegistrationContext';

// Ícono de la pestaña: muestra ✅ cuando la sección está completa y válida
const tabIcon = (emoji, done) =>
  function TabIcon({ focused }) {
    return <Text style={{ fontSize: 20, opacity: focused || done ? 1 : 0.5 }}>{done ? '✅' : emoji}</Text>;
  };

export default function RegisterLayout() {
  const { isPersonalValid, isVehicleValid, isDocumentsValid } = useRegistration();

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#000', tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="personal" options={{ title: 'Datos personales', tabBarIcon: tabIcon('👤', isPersonalValid) }} />
      <Tabs.Screen name="vehicle" options={{ title: 'Vehículo', tabBarIcon: tabIcon('🚗', isVehicleValid) }} />
      <Tabs.Screen name="documents" options={{ title: 'Documentos', tabBarIcon: tabIcon('📄', isDocumentsValid) }} />
    </Tabs>
  );
}
