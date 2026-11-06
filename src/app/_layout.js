// AI-assisted: see docs/AI_LOG.md #1
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { RegistrationProvider } from '../context/RegistrationContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RegistrationProvider>
    </AuthProvider>
  );
}
