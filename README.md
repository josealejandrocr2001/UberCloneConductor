# UberClone — Versión Conductor

Aplicación móvil (React Native + Expo) inspirada en Uber, versión conductor.

## Funcionalidades
- **Inicio de sesión** con Firebase Authentication.
- **Registro del conductor** en tres pestañas (Tab) con validaciones; queda **Pendiente de aprobación**.
- **Inicio:** mapa con la ubicación actual e interruptor **Disponible / No disponible**. Mientras está disponible, la ubicación se envía a Firestore cada 5 s; al pasar a No disponible o salir de la pantalla se detiene (limpieza de `useEffect`).
- **Solicitud entrante** con origen, destino, distancia, duración, categoría, método de pago, tarifa y ganancia neta estimadas, y **temporizador de 15 s** (rechazo automático).
- **Viaje en curso:** ruta al punto de recogida → *Pasajero a bordo* → ruta al destino → *Finalizar viaje*.
- **Cobro y resumen:** tarifa final, comisión del 20 %, propina, ganancia neta y estado del pago (Aprobado, Pendiente, Rechazado o Efectivo).
- **Ganancias** de hoy, la semana y el mes (`useMemo`) y **saldo** del conductor.
- **Historial** con `FlatList`, filtros (Hoy, Semana, Mes, Rango y método de pago), paginación de 20 viajes y detalle con la ruta dibujada con `Polyline`.
- **Perfil y configuración:** datos editables, vehículo, documentos, idioma y cierre de sesión.
- Navegación combinada: **Stack** (flujo del viaje), **Tabs** (registro) y **Drawer** (perfil, historial, ganancias).

## Datos simulados
Por indicación de la docente no se usa backend con Docker, así que algunas partes se **simulan**, manteniendo Firebase real:

| Parte | Cómo se simula |
|---|---|
| App del pasajero | Mientras el conductor está disponible, `useTripRequests` crea cada 8–15 s una solicitud cerca de él y la guarda en Firestore con `status: requested`. El conductor la recibe en tiempo real con `onSnapshot`. |
| Pasarela de pago | `paymentService` imita Mercado Pago Checkout Pro con los titulares de prueba **APRO** (aprobado), **CONT** (pendiente) y **OTHE** (rechazado). Tras 2 s escribe `paymentStatus`, `paymentId` y `status: paid`, como lo haría el webhook. No hay llaves en la app. |
| Cancelación del pasajero | 1 de cada 4 pasajeros simulados cancela entre 15 y 30 s después de aceptado el viaje, mientras el conductor va a recogerlo (`cancelledBy: passenger`). |
| Notificaciones | Expo Go no permite push remotas (FCM), así que una solicitud nueva o una cancelación genera una **notificación local**. |
| Rutas | **OSRM** (gratis, sin API key) y direcciones con **Nominatim**. Se consultan solo al crear y al aceptar la solicitud. |

Las **fotos** del registro sí son reales: se suben a **Cloudinary** (plan gratuito) y en Firestore solo se guarda su URL.

La tarifa se calcula con una única función pura, `src/utils/calculateFare.js`, con los parámetros de `src/config/pricing.js`.

## Configuración de Firebase
1. Crear un proyecto y una app Web; copiar la configuración al `.env`.
2. Authentication → habilitar **Correo/contraseña**.
3. Firestore Database → crear la base `(default)` y publicar estas reglas:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drivers/{driverId} {
      allow read, create: if request.auth != null && request.auth.uid == driverId;
      // El conductor puede editar su perfil, pero no aprobarse a sí mismo
      allow update: if request.auth != null && request.auth.uid == driverId
                    && request.resource.data.status == resource.data.status;
    }
    match /trips/{tripId} {
      allow read, update: if request.auth != null && resource.data.driverId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.driverId == request.auth.uid;
    }
  }
}
```
4. Firestore → **Índices → Compuesto → Crear índice**: colección `trips`, campos `driverId` (Ascendente), `status` (Ascendente) y `createdAt` (Descendente). Lo usan el historial y las ganancias.
5. Para aprobar un conductor, cambiar el campo `status` de `pending` a `approved` en su documento de `drivers`.

## Configuración de Cloudinary (fotos)
1. Crear una cuenta gratuita en cloudinary.com y copiar el **Cloud name** del panel principal.
2. Settings → **Upload** → **Upload presets** → **Add upload preset**.
3. **Signing mode: Unsigned**. En *Asset folder* escribir `uberclone-conductor`. Opcional: limitar formatos a `jpg, png` y el tamaño máximo.
4. Guardar y copiar el **nombre del preset**.
5. Poner ambos valores en el `.env` (ver la tabla de variables). El *API secret* de Cloudinary **nunca** va en la app.

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
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Nombre del upload preset sin firma |

## Estructura
```
src/
  app/          rutas (Expo Router): login, register/ (Tabs) y (driver)/ (Drawer + Stack del viaje)
  components/   componentes de formulario reutilizables
  config/       Firebase, tarifas (pricing.js) y reglas de documentos
  constants/    tema y listas de opciones
  context/      sesión (AuthContext) y registro (RegistrationContext)
  hooks/        useDriverLocation, useTripRequests, useEarnings, useCountdown…
  services/     conductor, viajes, pagos simulados, rutas (OSRM) y notificaciones
  utils/        calculateFare, validaciones, fechas, geografía y formato
```

## Decisiones y limitaciones
- **Idioma:** el selector Español/Inglés guarda la preferencia (Firestore y AsyncStorage), pero la interfaz está solo en español.
- **FCM:** reemplazado por notificaciones locales porque Expo Go no admite push remotas; con un *development build* se podría integrar `@react-native-firebase/messaging`.
- **Saldo:** lo actualiza la app con `increment()`. En producción lo haría el backend tras el webhook de la pasarela.

## Uso de IA
El uso de herramientas de IA está documentado en la [Bitácora de IA](docs/AI_LOG.md).
