// AI-assisted: see docs/AI_LOG.md #1, #7
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import { TripProvider } from '../context/TripContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripProvider>
        <RegistrationProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </RegistrationProvider>
      </TripProvider>
    </AuthProvider>
  );
}
