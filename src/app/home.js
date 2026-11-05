// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

// Pantalla temporal: en la próxima entrega será el mapa con el interruptor Disponible
export default function HomeScreen() {
  const { user, initializing, logout } = useAuth();

  if (!initializing && !user) return <Redirect href="/login" />;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <PrimaryButton title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  email: { textAlign: 'center', marginVertical: 16 },
});
