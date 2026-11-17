// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { updateDriverProfile } from '../../services/driverService';
import { CATEGORY_LABELS } from '../../constants/trip';
import { LANGUAGES, VEHICLE_COLORS } from '../../constants/options';
import { COLORS } from '../../constants/theme';
import { hasErrors, required, validateEmail, validateFullName, validatePhone } from '../../utils/validators';
import { formatDate, toDate } from '../../utils/dates';
import Card from '../../components/Card';
import FormField from '../../components/FormField';
import FormScreen from '../../components/FormScreen';
import InfoRow from '../../components/InfoRow';
import PrimaryButton from '../../components/PrimaryButton';
import SelectField from '../../components/SelectField';
import StatusBadge from '../../components/StatusBadge';

const onlyDigits = (text) => text.replace(/\D/g, '');

// Estado de un documento según su fecha de vencimiento
function documentStatus(value) {
  const date = toDate(value);
  if (!date) return { text: 'No aplica', color: COLORS.muted };
  const days = Math.ceil((date - new Date()) / 86400000);
  if (days < 0) return { text: `Vencido (${formatDate(date)})`, color: COLORS.error };
  if (days <= 30) return { text: `Vence pronto (${formatDate(date)})`, color: '#E65100' };
  return { text: `Vigente hasta ${formatDate(date)}`, color: COLORS.success };
}

export default function ProfileScreen() {
  const { driver, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  // Carga los datos actuales en el formulario
  useEffect(() => {
    if (!driver || form) return;
    setForm({
      fullName: driver.personal.fullName,
      phone: driver.personal.phone,
      language: driver.personal.language,
      mercadoPagoEmail: driver.mercadoPagoEmail,
      vehicleColor: driver.vehicle.color,
    });
  }, [driver, form]);

  const errors = useMemo(
    () =>
      form
        ? {
            fullName: validateFullName(form.fullName),
            phone: validatePhone(form.phone),
            language: required(form.language, 'Selecciona un idioma'),
            mercadoPagoEmail: validateEmail(form.mercadoPagoEmail),
            vehicleColor: required(form.vehicleColor, 'Selecciona un color'),
          }
        : {},
    [form],
  );

  if (!driver || !form) return null;

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };
  const err = (field) => (showErrors ? errors[field] : null);

  const handleSave = async () => {
    setShowErrors(true);
    if (hasErrors(errors)) return;
    setSaving(true);
    try {
      await updateDriverProfile(driver.id, form);
      AsyncStorage.setItem('@language', form.language).catch(() => {}); // preferencia local
      setMessage({ text: 'Cambios guardados', color: COLORS.success });
    } catch (e) {
      setMessage({ text: `No se pudo guardar: ${e.message}`, color: COLORS.error });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const approved = driver.status === 'approved';
  const { vehicle, documents } = driver;

  return (
    <FormScreen contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {driver.personal.photo ? <Image source={{ uri: driver.personal.photo }} style={styles.photo} /> : null}
        <Text style={styles.name}>{driver.personal.fullName}</Text>
        <Text style={styles.muted}>{driver.personal.email}</Text>
        <StatusBadge
          text={approved ? '✅ Aprobado' : '⏳ Pendiente de aprobación'}
          color={approved ? COLORS.success : '#E65100'}
        />
      </View>

      <Card>
        <Text style={styles.section}>Datos editables</Text>
        <FormField label="Nombre completo" value={form.fullName} maxLength={50} onChangeText={(t) => change('fullName', t)} error={err('fullName')} />
        <FormField
          label="Celular"
          value={form.phone}
          keyboardType="phone-pad"
          maxLength={10}
          onChangeText={(t) => change('phone', onlyDigits(t))}
          error={err('phone')}
        />
        <SelectField label="Idioma" value={form.language} options={LANGUAGES} onChange={(v) => change('language', v)} error={err('language')} />
        <FormField
          label="Correo de Mercado Pago"
          value={form.mercadoPagoEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(t) => change('mercadoPagoEmail', t)}
          error={err('mercadoPagoEmail')}
        />
        <SelectField
          label="Color del vehículo"
          value={form.vehicleColor}
          options={VEHICLE_COLORS}
          onChange={(v) => change('vehicleColor', v)}
          error={err('vehicleColor')}
        />
        {message ? <Text style={{ color: message.color, textAlign: 'center' }}>{message.text}</Text> : null}
        <PrimaryButton title="Guardar cambios" loading={saving} onPress={handleSave} />
      </Card>

      <Card>
        <Text style={styles.section}>Vehículo</Text>
        <InfoRow label="Categoría" value={CATEGORY_LABELS[vehicle.category]} />
        <InfoRow label="Placa" value={vehicle.plate} />
        <InfoRow label="Marca y modelo" value={`${vehicle.brand} ${vehicle.model}`} />
        <InfoRow label="Año" value={String(vehicle.year)} />
        <InfoRow label="Capacidad" value={`${vehicle.capacity} pasajeros`} />
      </Card>

      <Card>
        <Text style={styles.section}>Documentos</Text>
        {[
          ['Licencia de conducción', documents.licenseExpiry],
          ['SOAT', documents.soatExpiry],
          ['Revisión técnico-mecánica', documents.techReviewRequired ? documents.techReviewExpiry : null],
        ].map(([label, date]) => {
          const status = documentStatus(date);
          return <InfoRow key={label} label={label} value={status.text} valueColor={status.color} />;
        })}
        <Text style={styles.muted}>Para cambiar documentos o el vehículo se requiere una nueva aprobación.</Text>
      </Card>

      <PrimaryButton title="Cerrar sesión" onPress={handleLogout} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 6 },
  photo: { width: 96, height: 96, borderRadius: 48 },
  name: { fontSize: 20, fontWeight: '800' },
  muted: { color: COLORS.muted, fontSize: 13 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
});
