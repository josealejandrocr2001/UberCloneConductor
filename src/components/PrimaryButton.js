// AI-assisted: see docs/AI_LOG.md #1
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';

export default function PrimaryButton({ title, onPress, disabled = false, loading = false }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.button, isDisabled && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: { backgroundColor: '#9E9E9E' },
  pressed: { opacity: 0.8 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
