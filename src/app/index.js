// AI-assisted: see docs/AI_LOG.md #1
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Decide a dónde enviar al usuario según si hay sesión activa
export default function Index() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/home' : '/login'} />;
}
