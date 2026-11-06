// AI-assisted: see docs/AI_LOG.md #1
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useRegistration } from '../../context/RegistrationContext';
import { useTouched } from '../../hooks/useTouched';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import ImagePickerField from '../../components/ImagePickerField';
import PrimaryButton from '../../components/PrimaryButton';
import { CATEGORIES, VEHICLE_COLORS } from '../../constants/options';

const onlyDigits = (text) => text.replace(/\D/g, '');

export default function VehicleScreen() {
  const { vehicle, updateVehicle, vehicleErrors, isVehicleValid } = useRegistration();
  const { touch, visibleError, revealAll } = useTouched();

  const change = (field, value) => {
    updateVehicle(field, value);
    touch(field);
  };
  const err = (field) => visibleError(vehicleErrors, field);

  const handleNext = () => {
    revealAll();
    if (isVehicleValid) router.push('/register/documents');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <SelectField
        label="Categoría"
        value={vehicle.category}
        options={CATEGORIES}
        onChange={(value) => change('category', value)}
        error={err('category')}
      />
      <FormField
        label="Placa"
        value={vehicle.plate}
        placeholder="ABC123"
        maxLength={6}
        autoCapitalize="characters"
        // Se convierte a mayúsculas antes de validar
        onChangeText={(text) => change('plate', text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        error={err('plate')}
      />
      <FormField
        label="Marca"
        value={vehicle.brand}
        maxLength={30}
        onChangeText={(text) => change('brand', text)}
        error={err('brand')}
      />
      <FormField
        label="Modelo"
        value={vehicle.model}
        maxLength={30}
        onChangeText={(text) => change('model', text)}
        error={err('model')}
      />
      <FormField
        label="Año"
        value={vehicle.year}
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(text) => change('year', onlyDigits(text))}
        error={err('year')}
      />
      <SelectField
        label="Color"
        value={vehicle.color}
        options={VEHICLE_COLORS}
        onChange={(value) => change('color', value)}
        error={err('color')}
      />
      <FormField
        label="Capacidad de pasajeros"
        value={vehicle.capacity}
        keyboardType="number-pad"
        maxLength={2}
        onChangeText={(text) => change('capacity', onlyDigits(text))}
        error={err('capacity')}
      />
      <ImagePickerField
        label="Foto del vehículo"
        hint="Debe verse claramente la placa"
        value={vehicle.photo}
        onChange={(uri) => change('photo', uri)}
        error={err('photo')}
      />

      <PrimaryButton title="Siguiente: Documentos" onPress={handleNext} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
});
