// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

// Etiqueta + campo + error debajo (nunca en un Alert)
export default function FieldContainer({ label, error, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  error: { color: COLORS.error, fontSize: 12, marginTop: 4 },
});
