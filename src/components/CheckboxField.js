// AI-assisted: see docs/AI_LOG.md #2
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function CheckboxField({ label, checked, onChange, error }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.box, checked && styles.boxChecked, error && styles.boxError]}>
          {checked ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  boxError: { borderColor: COLORS.error },
  check: { color: '#fff', fontWeight: '800' },
  label: { flex: 1, color: COLORS.text, fontSize: 14 },
  error: { color: COLORS.error, fontSize: 12, marginTop: 4 },
});
