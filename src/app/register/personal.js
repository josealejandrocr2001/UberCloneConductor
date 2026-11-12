// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegistration } from '../../context/RegistrationContext';
import { useTouched } from '../../hooks/useTouched';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import ImagePickerField from '../../components/ImagePickerField';
import PrimaryButton from '../../components/PrimaryButton';
import FormScreen from '../../components/FormScreen';
import { GENDERS, LANGUAGES } from '../../constants/options';
import { DOCUMENT_RULES } from '../../config/documentRules';
import { addYears } from '../../utils/dates';

const onlyDigits = (text) => text.replace(/\D/g, '');

export default function PersonalScreen() {
  const { personal, updatePersonal, personalErrors, isPersonalValid } = useRegistration();
  const { touch, visibleError, revealAll } = useTouched();

  const change = (field, value) => {
    updatePersonal(field, value);
    touch(field);
  };
  const err = (field) => visibleError(personalErrors, field);

  const changeLanguage = (language) => {
    change('language', language);
    // Preferencia (no es dato sensible), permitido en AsyncStorage
    AsyncStorage.setItem('@language', language).catch(() => {});
  };

  const handleNext = () => {
    revealAll();
    if (isPersonalValid) router.push('/register/vehicle');
  };

  return (
    <FormScreen contentContainerStyle={styles.container}>
      <ImagePickerField
        label="Foto de perfil"
        round
        value={personal.photo}
        onChange={(uri) => change('photo', uri)}
        error={err('photo')}
      />
      <FormField
        label="Nombre completo"
        value={personal.fullName}
        maxLength={50}
        onChangeText={(text) => change('fullName', text)}
        error={err('fullName')}
      />
      <FormField
        label="Documento de identidad"
        value={personal.document}
        keyboardType="number-pad"
        maxLength={10}
        onChangeText={(text) => change('document', onlyDigits(text))}
        error={err('document')}
      />
      <FormField
        label="Número de celular"
        value={personal.phone}
        keyboardType="phone-pad"
        maxLength={10}
        onChangeText={(text) => change('phone', onlyDigits(text))}
        error={err('phone')}
      />
      <DateField
        label="Fecha de nacimiento"
        value={personal.birthDate}
        // AI-assisted: see docs/AI_LOG.md #3 — el selector solo permite fechas de personas entre 18 y 100 años
        maximumDate={addYears(new Date(), -DOCUMENT_RULES.minDriverAge)}
        minimumDate={addYears(new Date(), -DOCUMENT_RULES.maxDriverAge)}
        defaultDate={addYears(new Date(), -25)}
        onChange={(date) => change('birthDate', date)}
        error={err('birthDate')}
      />
      <SelectField
        label="Género"
        value={personal.gender}
        options={GENDERS}
        onChange={(value) => change('gender', value)}
        error={err('gender')}
      />
      <FormField
        label="Correo electrónico"
        value={personal.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => change('email', text)}
        error={err('email')}
      />
      <FormField
        label="Contraseña"
        value={personal.password}
        secureTextEntry
        onChangeText={(text) => change('password', text)}
        error={err('password')}
      />
      <FormField
        label="Confirmar contraseña"
        value={personal.confirmPassword}
        secureTextEntry
        onChangeText={(text) => change('confirmPassword', text)}
        error={err('confirmPassword')}
      />
      <SelectField
        label="Idioma"
        value={personal.language}
        options={LANGUAGES}
        onChange={changeLanguage}
        error={err('language')}
      />

      <PrimaryButton title="Siguiente: Vehículo" onPress={handleNext} />
      <Link href="/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  link: { marginTop: 16, textAlign: 'center', fontWeight: '600' },
});
