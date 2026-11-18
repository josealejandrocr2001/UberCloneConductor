Bitácora de uso de IA
Proyecto: UberClone — Versión Conductor · Integrante: Jose Alejandro Colorado Ruiz (trabajo individual)

Herramienta usada en todas las entradas: Claude (Anthropic), a lo largo del desarrollo entre el 2026-11-05 y el 2026-11-16. Claude me brindó recomendaciones de arquitectura, orientación paso a paso y revisión de código para implementar y depurar cada módulo. Por mi parte realicé la configuración de Firebase, Cloudinary y GitHub, la instalación de dependencias, la integración en el proyecto, las pruebas en Expo Go y todos los commits.

Entrada #1
Fecha: 2026-11-05

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Configurar el proyecto desde cero y construir el inicio de sesión y las pestañas 1 (Datos personales) y 2 (Vehículo) del registro.

Prompt 1 (se adjuntó el PDF del taller): "Claude, necesito orientación para desarrollar este taller sobre una aplicación móvil similar a Uber (versión conductor), trabajando de forma individual. Para esta primera etapa quiero construir el inicio de sesión y las pestañas 1 (Datos personales) y 2 (Vehículo) del registro. ¿Qué arquitectura de carpetas, librerías compatibles con Expo y flujo de configuración con Firebase Auth y GitHub me recomiendas? Guíame paso a paso en cómo estructurar las validaciones y organizar los commits para avanzar de forma ordenada."

Prompt 2: "Ya configuré el entorno base con Expo y Firebase siguiendo tus recomendaciones. ¿Me puedes guiar en cómo conectar el contexto de autenticación y el estado compartido del formulario entre las pestañas de registro, verificando qué APIs de Expo SDK 58 conviene usar para mantener el código limpio?"

Resumen de la respuesta: Entregó una guía paso a paso (Expo, Firebase Auth, GitHub, plan de commits) y, con el segundo prompt, explicó cómo estructurar el código en el proyecto, verificando primero las APIs en la documentación de Expo SDK 58.

Archivos y commit: src/config/firebase.js, src/context/AuthContext.js, src/context/RegistrationContext.js, src/utils/validators.js, src/hooks/useTouched.js, src/components/*, src/constants/*, src/app/_layout.js, src/app/index.js, src/app/login.js, src/app/home.js, src/app/register/* — commits 43f47d8, d6d9a79, 4c4eaa6, dcf18a3, 5d59a04

Verificación: Se comprobó que todos los archivos compilaran correctamente y se validaron los casos del enunciado (placa abc123, XL con 4 pasajeros, año futuro, conductor de 17 años, correo sin dominio, contraseñas distintas). En Expo Go probé el inicio de sesión con un usuario de prueba de Firebase y el diligenciamiento de las pestañas 1 y 2.

Aprendizaje:

La importancia de retornar la función unsubscribe dentro del useEffect de AuthContext para limpiar la suscripción al estado de autenticación de Firebase y evitar fugas de memoria o actualizaciones sobre componentes desmontados.

Comprendí cómo centralizar los datos de un formulario multipaso en un RegistrationContext compartido y calcular los errores con useMemo, evitando perder información al cambiar entre pestañas y optimizando los re-renderizados.

Entrada #2
Fecha: 2026-11-05

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Terminar el flujo completo de registro (pestaña 3 y envío) para demostrar que un conductor se puede registrar.

Prompt: "Ya tengo funcionando el login y las dos primeras pestañas. Ahora necesito orientación para implementar la pestaña 3 del registro (documentos y condiciones) y el guardado en Firebase. ¿Cómo me recomiendas estructurar la validación de vigencias de licencia, SOAT y técnico-mecánica, el almacenamiento del perfil del conductor con estado pendiente en Firestore y unas reglas de seguridad adecuadas para no dejar la base abierta?"

Resumen de la respuesta: Claude explicó cómo estructurar la pestaña 3 (licencia, SOAT, revisión técnico-mecánica según el año del vehículo, correo de Mercado Pago y términos con la comisión del 20 %), el servicio que crea la cuenta en Firebase Auth y guarda el perfil en Firestore con estado pending, y una pantalla de inicio que escucha el estado en tiempo real. También recomendó las reglas de seguridad de Firestore.

Qué se usó / modificó / descartó:

Usado tal cual: documents.js, driverService.js, CheckboxField.js, pricing.js, cambios en RegistrationContext.js y home.js.

Decisiones: la contraseña no se guarda en Firestore; no se piden números de cuenta ni de tarjeta; las fotos se guardan por ahora como URI local (se subirán a Cloudinary en la siguiente entrega).

Descartado: crear Firestore en modo de prueba (deja la base abierta y vence a los 30 días); se usaron reglas que solo permiten a cada conductor leer y escribir su propio documento.

Archivos y commit: src/app/register/documents.js, src/services/driverService.js, src/components/CheckboxField.js, src/config/pricing.js, src/context/RegistrationContext.js, src/app/home.js, src/app/register/_layout.js — commit fb01fce

Verificación: Registro de un conductor nuevo probado en Expo Go; la cuenta se creó en Firebase Auth, el documento quedó guardado en Firestore y la app mostró "Pendiente de aprobación". Además, probé cambiar manualmente el campo status de pending a approved en la consola de Firestore y verifiqué en Expo Go que la pantalla de inicio actualizara el estado en tiempo real sin reiniciar la aplicación.

Aprendizaje:

Entendí la separación de responsabilidades entre Firebase Auth (gestión segura de credenciales de acceso) y Cloud Firestore (almacenamiento del perfil y estado del conductor con status: "pending"), evitando almacenar contraseñas en la base de datos.

Aprendí a escuchar cambios en tiempo real con onSnapshot (con su respectiva limpieza en useEffect) para reflejar la aprobación del conductor al instante, y a proteger los documentos mediante reglas de seguridad de Firestore en lugar de depender de ocultar la apiKey.

Entrada #3
Fecha: 2026-11-05

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Limitar las fechas de vencimiento de los documentos y la fecha de nacimiento.

Prompt: "Hice las pruebas del flujo de registro y funciona, pero noté que los selectores de fecha del SOAT, la técnico-mecánica y la licencia permiten elegir cualquier fecha sin restricción. ¿Cuál es la mejor práctica para limitar esos rangos tanto en la interfaz del selector como en la lógica de validación según la edad del conductor y el año del vehículo?"

Resumen de la respuesta: Claude indicó cómo poner límites en el selector y en la validación: SOAT y revisión técnico-mecánica entre mañana y un año; licencia entre mañana y 10, 5 o 1 años según la edad del conductor; fecha de nacimiento entre 18 y 100 años. Recomendó centralizar las reglas en documentRules.js y mostrar el rango permitido sobre cada campo.

Qué se usó / modificó / descartó:

Usado tal cual: src/config/documentRules.js, src/utils/dates.js y los cambios en validadores y pantallas.

Corregido durante la revisión: el texto "1 años" para conductores mayores de 80 años.

Archivos y commit: src/config/documentRules.js, src/utils/dates.js, src/utils/validators.js, src/components/DateField.js, src/app/register/personal.js, src/app/register/documents.js — commit fb01fce (mismo commit de la entrada #2, porque los cambios tocaban los mismos archivos)

Verificación: Se probaron casos límite (SOAT a 2 años, licencia a 11 años para un conductor de 30, licencia a 6 años para uno de 65, revisión vencida, conductor de 17 y de 101 años) y se validaron imports y sintaxis antes del commit. En Expo Go probé los selectores de fecha en las pestañas de datos personales y documentos, confirmando que el calendario restringiera fechas fuera de rango y mostrara el intervalo permitido sobre cada campo.

Aprendizaje:

Aprendí que las reglas de negocio críticas deben aplicarse en dos niveles: restringiendo directamente las fechas seleccionables en la interfaz (DateField) y reforzando esos mismos límites en las funciones validadoras antes del envío.

Comprendí la ventaja de centralizar las reglas de vigencia (según la edad del conductor y la antigüedad del vehículo) en un único archivo de configuración (documentRules.js), facilitando su mantenimiento y evitando duplicar lógica en varias pantallas.

Entrada #6
Fecha: 2026-11-10

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Corregir que el formulario de registro no permitía hacer scroll con el teclado abierto.

Prompt: "Claude, estuve probando el formulario en Expo Go y detecté un problema de usabilidad: cuando se abre el teclado en pantalla para escribir, el ScrollView queda bloqueado y no permite desplazarse hacia los campos inferiores. ¿Por qué ocurre esto en Expo SDK 58 y qué enfoque o componente me recomiendas implementar para solucionarlo sin salir de Expo Go?"

Resumen de la respuesta: Claude explicó que en Expo SDK 58 las apps de Android son edge-to-edge, así que la ventana ya no se encoge al abrir el teclado y el ScrollView quedaba tapado. Recomendó crear el componente FormScreen, envolviendo el ScrollView en un KeyboardAvoidingView con behavior="padding" en ambas plataformas y descontando el alto del encabezado con useHeaderHeight, para aplicarlo a las tres pestañas y al login.

Qué se usó / modificó / descartó:

Usado tal cual: src/components/FormScreen.js y el cambio en las pantallas.

Descartado: react-native-keyboard-controller (la opción que recomienda Expo), porque no está incluida en Expo Go y exigiría un development build.

Archivos y commit: src/components/FormScreen.js, src/app/register/personal.js, src/app/register/vehicle.js, src/app/register/documents.js, src/app/login.js — commit da624b8

Verificación: Se validaron sintaxis e imports de los 27 archivos. Probado en Expo Go en Android: al abrir el teclado virtual en las tres pestañas del registro y en la pantalla de login, el formulario ajusta su espacio y permite hacer scroll sin bloqueos hasta el último campo y los botones inferiores.

Aprendizaje:

Aprendí cómo el modo edge-to-edge de Android en Expo SDK 58 impide que la ventana se redimensione automáticamente al desplegarse el teclado virtual, lo que bloquea el desplazamiento de un ScrollView convencional.

Comprendí cómo encapsular KeyboardAvoidingView junto con useHeaderHeight() en un componente reutilizable (FormScreen) para resolver el solapamiento del teclado en todas las pantallas manteniendo total compatibilidad con Expo Go.

Entrada #7
Fecha: 2026-11-12

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Construir lo que faltaba del taller (Inicio con mapa, solicitud, viaje, cobro, ganancias, historial, perfil y Drawer) con datos simulados, ya que la docente confirmó que no se usará Docker.

Prompt: "Claude, la docente me confirmó que finalmente no usaremos Docker en el taller y que debemos simular los datos del lado del pasajero y los pagos. Con este panorama, ¿cómo me recomiendas diseñar y estructurar los módulos restantes (mapa en inicio, recepción y gestión de viajes, cálculo de tarifas, cobro simulado, ganancias, historial y perfil) usando herramientas compatibles con Expo Go y servicios gratuitos para rutas?" (con captura del chat con la docente)

Respuestas a las preguntas de Claude: Alcance = "Todo lo que falta"; Datos = "Firebase real, resto simulado"; Rutas = "OSRM, gratis sin llave".

Resumen de la respuesta: Claude verificó en la documentación de Expo SDK 58 que react-native-maps, expo-location, el Drawer de expo-router y las notificaciones locales funcionan en Expo Go, y que las push remotas (FCM) no. Guió la implementación de calculateFare, los servicios de viajes, pagos simulados (titulares de prueba APRO/CONT/OTHE de Mercado Pago), rutas con OSRM y direcciones con Nominatim, los hooks useDriverLocation, useTripRequests, useEarnings y useCountdown, el TripContext y todas las pantallas restantes.

Qué se usó / modificó / descartó:

Usado tal cual: todo el código nuevo (ver archivos).

Simulado por decisión de la docente: la app del pasajero (solicitudes automáticas cada 8–15 s) y la pasarela de pago (sin backend).

Sustituido: FCM por notificaciones locales (Expo Go no admite push remotas); Google Directions/Distance Matrix por OSRM; @react-native-community/geolocation por expo-location (equivalente en Expo).

Pendiente de decidir: traducción completa de la interfaz al inglés (hoy el idioma se guarda como preferencia).

Archivos y commit: src/utils/calculateFare.js, src/services/{tripService,paymentService,routeService,notificationService}.js, src/hooks/{useDriverLocation,useTripRequests,useEarnings,useCountdown}.js, src/context/{AuthContext,TripContext}.js, src/components/{Card,Chip,InfoRow,RouteMap,StatusBadge}.js, src/app/(driver)/** — commits b547148, 5346ca6, 1417bfe y ec204cd

Verificación: Se validaron sintaxis, imports y exportaciones de los 54 archivos, y se probó calculateFare con el ejemplo de la sección 5 (Económico 19.200 / 3.840 / 15.360; XL 26.900 / 5.380 / 21.520) y la tarifa mínima. Flujo completo probado en Expo Go: cambio a estado disponible, recepción de solicitud simulada, aceptación del viaje, trazado de ruta en mapa con OSRM, cambio a estado a bordo, finalización del viaje, pantalla de cobro simulado y verificación del registro en ganancias e historial.

Aprendizaje:

Aprendí a diseñar servicios desacoplados (tripService, paymentService, routeService) que permiten simular de forma realista el ciclo de vida de un viaje y los estados de pago de Mercado Pago sin backend, dejando la arquitectura lista para conectar APIs reales en el futuro.

Comprendí cómo elegir alternativas técnicas adaptadas a las restricciones de Expo Go, integrando expo-location para geolocalización, OSRM y Nominatim para rutas y direcciones sin costo, y notificaciones locales en reemplazo de FCM.

Entrada #8
Fecha: 2026-11-16

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Revisar el taller completo contra el enunciado antes del último commit.

Prompt: "Antes de hacer el último commit, quiero asegurarme de que el proyecto cumpla con todos los requisitos del enunciado. ¿Podrías ayudarme a revisar la estructura del código y los flujos principales para identificar posibles fallos de lógica, casos borde no contemplados o mejoras recomendables antes de la entrega?"

Resumen de la respuesta: Claude comparó cada requisito del enunciado con el código y el repositorio. Ayudó a identificar y corregir tres fallos de lógica, y señaló los entregables y decisiones pendientes (bitácora en PDF, video, fotos en Cloudinary, traducción de la interfaz).

Qué se usó / modificó / descartó:

Corregido: (1) si el conductor salía del viaje con el botón Atrás de Android, no tenía cómo volver a él; ahora el Inicio muestra "Ver viaje". (2) Al restaurar "Disponible" desde AsyncStorage no se actualizaba Firestore. (3) Una cuenta de Authentication sin documento en drivers dejaba pantallas en blanco; ahora muestra un mensaje y permite cerrar sesión.

Decisiones sobre los pendientes: Se decidió priorizar e implementar la subida de fotos a Cloudinary (sin backend) y la cancelación simulada por parte del pasajero en la siguiente iteración; la traducción completa de la interfaz al inglés y las notificaciones push remotas con FCM quedaron documentadas como limitaciones en el README.

Archivos y commit: src/app/(driver)/index.js, src/app/(driver)/_layout.js — commit 3a318db

Verificación: Se validaron sintaxis e imports de los 54 archivos. Probado en Expo Go: salida de un viaje activo con el botón Atrás de Android y retorno mediante el botón "Ver viaje" en el inicio, sincronización del estado "Disponible" entre AsyncStorage y Firestore al reabrir la app, y visualización del mensaje controlado con opción de cierre de sesión cuando falta el documento en drivers.

Aprendizaje:

Aprendí el valor de realizar una auditoría sistemática del código frente a los requisitos funcionales antes de cerrar el proyecto, lo que permitió detectar casos borde como quedar atrapado fuera de un viaje activo al usar el botón Atrás de Android o desincronizar el estado "Disponible" entre AsyncStorage y Firestore.

Comprendí la necesidad de programar de forma defensiva ante inconsistencias de datos, manejando explícitamente el escenario en que un usuario autenticado no tenga documento en la colección drivers para evitar pantallas en blanco.

Entrada #9
Fecha: 2026-11-16

Integrante: Jose Alejandro Colorado Ruiz

Herramienta: Claude

Objetivo: Aplicar las mejoras recomendadas de la revisión: fotos en Cloudinary y cancelación por parte del pasajero.

Prompt: "Revisando las observaciones que surgieron de la inspección, veo que guardar las fotos como rutas locales limita su visualización en otros dispositivos y que el estado de cancelación podría contemplar también al pasajero. ¿Qué estrategia me recomiendas para subir las imágenes a Cloudinary sin necesidad de montar un backend propio y cómo debería integrar la cancelación simulada del pasajero sin afectar el flujo actual? También dime qué opinas de dejar la traducción al inglés y FCM documentados como limitaciones."

Resumen de la respuesta: Claude explicó cómo implementar la subida de las fotos del registro a Cloudinary con un upload preset sin firma (sin backend y sin exponer el API secret) y cómo integrar la cancelación simulada del pasajero (25 % de los viajes, entre 15 y 30 s después de aceptar), con aviso en el Inicio, notificación local y "Cancelado por" en el historial. Recomendó no traducir toda la interfaz y mantener las notificaciones locales en lugar de FCM, documentándolo en el README.

Qué se usó / modificó / descartó:

Usado tal cual: src/services/cloudinaryService.js y los cambios en el registro, el viaje en curso, el Inicio y el historial.

Decisión: si las fotos no suben, se elimina la cuenta recién creada para que el conductor pueda reintentar sin quedar con una cuenta sin perfil.

Descartado: traducción completa al inglés (alcance grande y no exigida explícitamente; el idioma queda como preferencia guardada) y FCM (requiere development build).

Archivos y commit: src/services/cloudinaryService.js, src/services/driverService.js, src/app/register/documents.js, src/services/tripService.js, src/services/notificationService.js, src/context/TripContext.js, src/app/(driver)/trip/active.js, src/app/(driver)/index.js, src/app/(driver)/history/[id].js, .env.example — commits e8928e2 y 3a318db

Verificación: Se validaron sintaxis e imports de los 55 archivos. Probado en Expo Go: registro completo subiendo las fotos de los documentos, confirmando que las imágenes aparecieran en la Media Library de Cloudinary, sus URLs quedaran almacenadas en Firestore y se visualizaran en el perfil; además, se verificó en Expo Go la cancelación automática por parte del pasajero tras aceptar un viaje, junto con la notificación local y el detalle en el historial.

Aprendizaje:

Aprendí a integrar la carga de imágenes hacia Cloudinary directamente desde el cliente móvil mediante un upload preset sin firma (sin exponer el API secret ni requerir backend), implementando además la eliminación de la cuenta recién creada en Auth si la subida falla para no dejar usuarios huérfanos.

Comprendí cómo modelar eventos asíncronos bidireccionales en el flujo de viaje —permitiendo simular la cancelación tanto por el conductor como por el pasajero— y a documentar de manera justificada las decisiones de alcance y limitaciones técnicas (idioma y FCM) en el README.
