// AI-assisted: see docs/AI_LOG.md #7
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function InfoRow({ label, value, strong = false, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  label: { color: COLORS.muted, flexShrink: 1 },
  value: { color: COLORS.text, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
  strong: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
});
