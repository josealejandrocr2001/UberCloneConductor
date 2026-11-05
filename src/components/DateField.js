// AI-assisted: see docs/AI_LOG.md #1
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FieldContainer from './FieldContainer';
import { COLORS, fieldBox } from '../constants/theme';

export default function DateField({ label, error, value, onChange, maximumDate }) {
  const [visible, setVisible] = useState(false);

  const handleChange = (event, selectedDate) => {
    // En Android el selector es un diálogo: se cierra al elegir o cancelar
    if (Platform.OS === 'android') setVisible(false);
    if (event.type === 'set' && selectedDate) onChange(selectedDate);
  };

  return (
    <FieldContainer label={label} error={error}>
      <Pressable style={[styles.box, error && styles.boxError]} onPress={() => setVisible(true)}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? value.toLocaleDateString('es-CO') : 'Selecciona una fecha'}
        </Text>
      </Pressable>
      {visible && (
        <View>
          <DateTimePicker
            value={value ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setVisible(false)}>
              <Text style={styles.done}>Listo</Text>
            </Pressable>
          )}
        </View>
      )}
    </FieldContainer>
  );
}

const styles = StyleSheet.create({
  box: fieldBox,
  boxError: { borderColor: COLORS.error },
  text: { fontSize: 16, color: COLORS.text },
  placeholder: { color: COLORS.muted },
  done: { textAlign: 'right', fontWeight: '700', padding: 8 },
});
