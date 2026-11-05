// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, TextInput } from 'react-native';
import FieldContainer from './FieldContainer';
import { COLORS, fieldBox } from '../constants/theme';

export default function FormField({ label, error, ...inputProps }) {
  return (
    <FieldContainer label={label} error={error}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.muted}
        {...inputProps}
      />
    </FieldContainer>
  );
}

const styles = StyleSheet.create({
  input: { ...fieldBox, fontSize: 16, color: COLORS.text },
  inputError: { borderColor: COLORS.error },
});
