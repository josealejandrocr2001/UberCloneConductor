// AI-assisted: see docs/AI_LOG.md #1
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { validateEmail } from '../utils/validators';
import { COLORS } from '../constants/theme';

const AUTH_ERRORS = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/network-request-failed': 'Sin conexión a internet',
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors = {
      email: validateEmail(email),
      password: password ? null : 'La contraseña es obligatoria',
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (error) {
      setErrors({ general: AUTH_ERRORS[error.code] ?? 'No fue posible iniciar sesión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>UberClone</Text>
      <Text style={styles.subtitle}>Conductor</Text>

      <FormField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <FormField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}

      <PrimaryButton title="Iniciar sesión" onPress={handleLogin} loading={loading} />
      <Link href="/register/personal" style={styles.link}>
        ¿Aún no eres conductor? Regístrate
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.background },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 18, color: COLORS.muted, textAlign: 'center', marginBottom: 32 },
  generalError: { color: COLORS.error, textAlign: 'center', marginBottom: 8 },
  link: { marginTop: 20, textAlign: 'center', color: COLORS.primary, fontWeight: '600' },
});
