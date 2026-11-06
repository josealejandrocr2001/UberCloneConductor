// AI-assisted: see docs/AI_LOG.md #2
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useRegistration } from '../../context/RegistrationContext';
import { useTouched } from '../../hooks/useTouched';
import FormField from '../../components/FormField';
import DateField from '../../components/DateField';
import ImagePickerField from '../../components/ImagePickerField';
import CheckboxField from '../../components/CheckboxField';
import PrimaryButton from '../../components/PrimaryButton';
import { COMMISSION_RATE } from '../../config/pricing';
import { registerDriver } from '../../services/driverService';
import { requiresTechReview } from '../../utils/validators';
import { COLORS } from '../../constants/theme';
import { getLicenseValidityYears, getMaxExpiryDates } from '../../config/documentRules';
import { formatDate, tomorrow } from '../../utils/dates';

const onlyDigits = (text) => text.replace(/\D/g, '');

const REGISTER_ERRORS = {
  'auth/email-already-in-use': 'Ese correo ya está registrado. Inicia sesión o usa otro correo.',
  'auth/network-request-failed': 'Sin conexión a internet',
  'permission-denied': 'No hay permiso para guardar en la base de datos (revisa las reglas de Firestore)',
};


export default function DocumentsScreen() {
  const {
    personal,
    vehicle,
    documents,
    updateDocuments,
    resetRegistration,
    documentsErrors,
    isPersonalValid,
    isVehicleValid,
    isDocumentsValid,
  } = useRegistration();
  const { touch, visibleError, revealAll } = useTouched();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const change = (field, value) => {
    updateDocuments(field, value);
    touch(field);
  };
  const err = (field) => visibleError(documentsErrors, field);

  const needsTechReview = requiresTechReview(vehicle.year);

  // AI-assisted: see docs/AI_LOG.md #3 — límites de vencimiento: desde mañana hasta la vigencia máxima de cada documento
  const minExpiry = tomorrow();
  const maxDates = getMaxExpiryDates(personal.birthDate);
  const licenseYears = getLicenseValidityYears(personal.birthDate);
  const rangeHint = (maxDate, reason) => `Entre ${formatDate(minExpiry)} y ${formatDate(maxDate)} (${reason})`;
  const commissionPercent = Math.round(COMMISSION_RATE * 100);

  // Solo se habilita cuando las tres pestañas están completas y válidas
  const canSubmit = isPersonalValid && isVehicleValid && isDocumentsValid;

  const handleSubmit = async () => {
    revealAll();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await registerDriver({ personal, vehicle, documents });
      resetRegistration();
      router.replace('/home');
    } catch (error) {
      setSubmitError(REGISTER_ERRORS[error.code] ?? 'No fue posible enviar el registro. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.section}>Licencia de conducción</Text>
      <FormField
        label="Número de licencia"
        value={documents.licenseNumber}
        keyboardType="number-pad"
        maxLength={12}
        onChangeText={(text) => change('licenseNumber', onlyDigits(text))}
        error={err('licenseNumber')}
      />
      <ImagePickerField
        label="Foto de la licencia"
        value={documents.licensePhoto}
        onChange={(uri) => change('licensePhoto', uri)}
        error={err('licensePhoto')}
      />
      <DateField
        label="Fecha de vencimiento de la licencia"
        value={documents.licenseExpiry}
        hint={rangeHint(maxDates.license, `vigencia máxima de ${licenseYears} ${licenseYears === 1 ? 'año' : 'años'} según tu edad`)}
        minimumDate={minExpiry}
        maximumDate={maxDates.license}
        defaultDate={minExpiry}
        onChange={(date) => change('licenseExpiry', date)}
        error={err('licenseExpiry')}
      />

      <Text style={styles.section}>SOAT</Text>
      <ImagePickerField
        label="Foto del SOAT"
        value={documents.soatPhoto}
        onChange={(uri) => change('soatPhoto', uri)}
        error={err('soatPhoto')}
      />
      <DateField
        label="Fecha de vencimiento del SOAT"
        value={documents.soatExpiry}
        hint={rangeHint(maxDates.soat, 'el SOAT dura 1 año')}
        minimumDate={minExpiry}
        maximumDate={maxDates.soat}
        defaultDate={minExpiry}
        onChange={(date) => change('soatExpiry', date)}
        error={err('soatExpiry')}
      />

      <Text style={styles.section}>Revisión técnico-mecánica</Text>
      {needsTechReview ? (
        <>
          <ImagePickerField
            label="Foto de la revisión técnico-mecánica"
            value={documents.techReviewPhoto}
            onChange={(uri) => change('techReviewPhoto', uri)}
            error={err('techReviewPhoto')}
          />
          <DateField
            label="Fecha de vencimiento de la revisión"
            value={documents.techReviewExpiry}
            hint={rangeHint(maxDates.techReview, 'la revisión dura 1 año')}
            minimumDate={minExpiry}
            maximumDate={maxDates.techReview}
            defaultDate={minExpiry}
            onChange={(date) => change('techReviewExpiry', date)}
            error={err('techReviewExpiry')}
          />
        </>
      ) : (
        <Text style={styles.info}>
          No aplica: tu vehículo ({vehicle.year}) tiene menos de 5 años, todavía no requiere revisión.
        </Text>
      )}

      <Text style={styles.section}>Pagos</Text>
      <FormField
        label="Correo de la cuenta de Mercado Pago"
        value={documents.mercadoPagoEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => change('mercadoPagoEmail', text)}
        error={err('mercadoPagoEmail')}
      />
      <Text style={styles.info}>
        No pedimos números de cuenta ni de tarjeta: los pagos los gestiona Mercado Pago.
      </Text>

      <CheckboxField
        label={`Acepto los términos y condiciones. La plataforma cobra una comisión del ${commissionPercent} % sobre la tarifa de cada viaje; las propinas son 100 % para el conductor.`}
        checked={documents.acceptedTerms}
        onChange={(value) => change('acceptedTerms', value)}
        error={err('acceptedTerms')}
      />

      <View style={styles.summary}>
        <Text>Datos personales: {isPersonalValid ? '✅ Completos' : '❌ Incompletos'}</Text>
        <Text>Vehículo: {isVehicleValid ? '✅ Completo' : '❌ Incompleto'}</Text>
        <Text>Documentos: {isDocumentsValid ? '✅ Completos' : '❌ Incompletos'}</Text>
      </View>

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <PrimaryButton title="Enviar registro" disabled={!canSubmit} loading={submitting} onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  info: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  summary: { gap: 4, marginBottom: 8 },
  submitError: { color: COLORS.error, textAlign: 'center', marginBottom: 8 },
});
