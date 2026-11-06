# UberClone — Versión Conductor

Aplicación móvil (React Native + Expo) inspirada en Uber, versión conductor.

## Avance actual
- Inicio de sesión con Firebase Authentication (correo y contraseña).
- Registro del conductor en tres pestañas (navegación Tab), con validaciones y errores debajo de cada campo:
  - Pestaña 1 — Datos personales.
  - Pestaña 2 — Vehículo.
  - Pestaña 3 — Documentos y pagos (vigencias de licencia, SOAT y revisión técnico-mecánica).
- El botón **Enviar registro** solo se habilita con las tres pestañas válidas. Crea la cuenta y guarda el perfil en Firestore (`drivers/{uid}`) con estado **Pendiente de aprobación**.
- La pantalla de inicio muestra el estado del conductor en tiempo real (`onSnapshot`).

## Configuración de Firebase
1. Crear un proyecto y una app Web; copiar la configuración al `.env`.
2. Authentication → habilitar **Correo/contraseña**.
3. Firestore Database → crear la base `(default)` y publicar estas reglas:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drivers/{driverId} {
      allow read, write: if request.auth != null && request.auth.uid == driverId;
    }
  }
}
```
4. Para aprobar un conductor, cambiar el campo `status` de `pending` a `approved` en su documento.

## Requisitos
- Node.js 20 o superior
- App Expo Go en el celular

## Instalación
```bash
npm install
cp .env.example .env   # llenar con las credenciales del proyecto de Firebase
npx expo start
```

## Variables de entorno
Ver `.env.example`. El archivo `.env` está excluido de Git.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API key de la app web de Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID de mensajería |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ID de la app |

## Estructura
```
src/
  app/          rutas (Expo Router)
  components/   componentes de formulario reutilizables
  config/       Firebase, tarifas (pricing.js) y reglas de documentos
  constants/    tema y listas de opciones
  context/      sesión (AuthContext) y registro (RegistrationContext)
  hooks/        hooks personalizados
  services/     registro del conductor en Firebase
  utils/        validaciones y fechas
```

## Uso de IA
El uso de herramientas de IA está documentado en la [Bitácora de IA](docs/AI_LOG.md).
