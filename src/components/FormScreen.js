// AI-assisted: see docs/AI_LOG.md #6
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { useHeaderHeight } from 'expo-router/react-navigation';

// Contenedor para pantallas de formulario.
// En Android la app es edge-to-edge: la ventana ya NO se encoge cuando aparece el teclado,
// así que el ScrollView quedaba tapado y no se podía llegar a los últimos campos.
// KeyboardAvoidingView con behavior="padding" (en ambas plataformas) reserva el espacio del teclado,
// y keyboardVerticalOffset descuenta el alto del encabezado de la pestaña.
export default function FormScreen({ children, contentContainerStyle }) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
