// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, Text, View } from 'react-native';
import { useRegistration } from '../../context/RegistrationContext';
import PrimaryButton from '../../components/PrimaryButton';

export default function DocumentsScreen() {
  const { isPersonalValid, isVehicleValid } = useRegistration();
  const isDocumentsValid = false; // TODO: pestaña 3 en la próxima entrega
  const canSubmit = isPersonalValid && isVehicleValid && isDocumentsValid;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentos y pagos</Text>
      <Text style={styles.text}>Esta pestaña se implementa en la siguiente entrega.</Text>
      <Text>Datos personales: {isPersonalValid ? '✅ Completos' : '❌ Incompletos'}</Text>
      <Text>Vehículo: {isVehicleValid ? '✅ Completo' : '❌ Incompleto'}</Text>
      <PrimaryButton title="Enviar registro" disabled={!canSubmit} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  text: { color: '#757575', marginBottom: 12 },
});
