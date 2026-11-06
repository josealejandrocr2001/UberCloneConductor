// AI-assisted: see docs/AI_LOG.md #1
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FieldContainer from './FieldContainer';
import { COLORS } from '../constants/theme';

export default function ImagePickerField({ label, hint, value, onChange, error, round = false }) {
  const [permissionError, setPermissionError] = useState(null);

  const pickImage = async (source) => {
    setPermissionError(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPermissionError('Debes conceder el permiso para continuar');
      return;
    }

    const options = { mediaTypes: ['images'], allowsEditing: true, aspect: round ? [1, 1] : [4, 3], quality: 0.6 };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    // Si el usuario cancela, assets es null
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  return (
    <FieldContainer label={label} error={error || permissionError}>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {value ? (
        <Image source={{ uri: value }} style={[styles.preview, round && styles.round]} />
      ) : (
        <View style={[styles.preview, styles.empty, round && styles.round]}>
          <Text style={styles.hint}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.row}>
        <Pressable style={styles.option} onPress={() => pickImage('camera')}>
          <Text>📷 Cámara</Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => pickImage('gallery')}>
          <Text>🖼️ Galería</Text>
        </Pressable>
      </View>
    </FieldContainer>
  );
}

const styles = StyleSheet.create({
  hint: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  preview: { width: '100%', height: 180, borderRadius: 8, alignSelf: 'center' },
  round: { width: 120, height: 120, borderRadius: 60 },
  empty: { backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});
