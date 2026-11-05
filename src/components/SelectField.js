// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FieldContainer from './FieldContainer';
import { COLORS, fieldBox } from '../constants/theme';

export default function SelectField({ label, error, value, onChange, options, placeholder = 'Selecciona...' }) {
  return (
    <FieldContainer label={label} error={error}>
      <View style={[styles.box, error && styles.boxError]}>
        <Picker selectedValue={value} onValueChange={onChange}>
          <Picker.Item label={placeholder} value="" color={COLORS.muted} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    </FieldContainer>
  );
}

const styles = StyleSheet.create({
  box: { ...fieldBox, paddingHorizontal: 0 },
  boxError: { borderColor: COLORS.error },
});
