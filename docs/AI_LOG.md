# Bitácora de uso de IA

Proyecto: UberClone — Versión Conductor · Integrante: Jose Alejandro Colorado Ruiz (trabajo individual)

Herramienta usada en todas las entradas: **Claude (Anthropic)**, en una sola conversación del 2026-11-05. Claude me ayudó a corregir directamente varios archivos del código. Se realizó la configuración de Firebase y GitHub, la instalación de dependencias, las pruebas en Expo Go y todos los commits.


---

### Entrada #1
- Fecha: 2026-11-05
- Integrante: Jose Alejandro Colorado Ruiz
- Herramienta: Claude
- Objetivo: Configurar el proyecto desde cero y construir el inicio de sesión y las pestañas 1 (Datos personales) y 2 (Vehículo) del registro.
- Prompt 1 (se adjuntó el PDF del taller): "Claude, necesito que me ayudes a realizar este taller, se trata de hacer una aplicación móvil similar a Uber, debo realizar por ahora las pestañas 1 y 2 del conductor con el inicio de sesión y el registro, más adelante podemos continuar con el resto... Algo que hay que tener en cuenta es que soy solamente yo con este taller. Guíame paso a paso las configuraciones que debo hacer y como hago los commits para dejar la parte lista que necesito para hoy"
- Prompt 2: "Por favor revisa y continua con lo demás"
- Resumen de la respuesta: Entregó una guía paso a paso (Expo, Firebase Auth, GitHub, plan de commits) y, con el segundo prompt, explicó el código en el proyecto, verificando primero las APIs en la documentación de Expo SDK 58.
- Archivos y commit: `src/config/firebase.js`, `src/context/AuthContext.js`, `src/context/RegistrationContext.js`, `src/utils/validators.js`, `src/hooks/useTouched.js`, `src/components/*`, `src/constants/*`, `src/app/_layout.js`, `src/app/index.js`, `src/app/login.js`, `src/app/home.js`, `src/app/register/*` — commits 43f47d8, d6d9a79, 4c4eaa6, dcf18a3, 5d59a04
- Verificación: Claude comprobó que todos los archivos compilan y probó las validaciones con casos del enunciado (placa `abc123`, XL con 4 pasajeros, año futuro, conductor de 17 años, correo sin dominio, contraseñas distintas). Yo probé en Expo Go el inicio de sesión con un usuario de prueba de Firebase y el diligenciamiento de las pestañas 1 y 2.
- Aprendizaje: [Escribir con mis palabras. Ideas: por qué el `useEffect` de `AuthContext` retorna `unsubscribe` (limpieza), por qué los errores se calculan con `useMemo`, y por qué el formulario vive en un Context compartido por las pestañas.]

---

### Entrada #2
- Fecha: 2026-11-05
- Integrante: Jose Alejandro Colorado Ruiz
- Herramienta: Claude
- Objetivo: Terminar el flujo completo de registro (pestaña 3 y envío) para demostrar que un conductor se puede registrar.
- Prompt: "Ayudame para que un conductor se pueda registrar, también dame instrucciones acerca de las validaciones de las fechas de vigencia de la licencia, SOAT, matricula, etc"
- Resumen de la respuesta: Claude explicó la pestaña 3 (licencia, SOAT, revisión técnico-mecánica según el año del vehículo, correo de Mercado Pago y términos con la comisión del 20 %), el servicio que crea la cuenta en Firebase Auth y guarda el perfil en Firestore con estado `pending`, y una pantalla de inicio que escucha el estado en tiempo real. También dio las reglas de seguridad de Firestore.
- Qué se usó / modificó / descartó:
  - Usado tal cual: `documents.js`, `driverService.js`, `CheckboxField.js`, `pricing.js`, cambios en `RegistrationContext.js` y `home.js`.
  - Decisiones: la contraseña no se guarda en Firestore; no se piden números de cuenta ni de tarjeta; las fotos se guardan por ahora como URI local (se subirán a Cloudinary en la siguiente entrega).
  - Descartado: crear Firestore en modo de prueba (deja la base abierta y vence a los 30 días); se usaron reglas que solo permiten a cada conductor leer y escribir su propio documento.
- Archivos y commit: `src/app/register/documents.js`, `src/services/driverService.js`, `src/components/CheckboxField.js`, `src/config/pricing.js`, `src/context/RegistrationContext.js`, `src/app/home.js`, `src/app/register/_layout.js` — commit fb01fce
- Verificación: Registro de un conductor nuevo probado en Expo Go; la cuenta se creó y la app mostró "Pendiente de aprobación". [CONFIRMAR si se probó cambiar `status` a `approved` en la consola de Firestore y ver el cambio en tiempo real.]
- Aprendizaje: [Escribir con mis palabras. Ideas: diferencia entre Firebase Auth (credenciales) y Firestore (perfil), uso de `onSnapshot` con limpieza en `useEffect`, y por qué las reglas de Firestore protegen los datos aunque la apiKey sea pública.]

---

### Entrada #3
- Fecha: 2026-11-05
- Integrante: Jose Alejandro Colorado Ruiz
- Herramienta: Claude
- Objetivo: Limitar las fechas de vencimiento de los documentos y la fecha de nacimiento.
- Prompt: "Vale, ya hice la prueba y permitió el registro, sin embargo, en los campos de las fechas como el soat, tecno mecánica, permite poner cualquier fecha, necesito establecer los limites, por favor apoyame con ello"
- Resumen de la respuesta: Claude indicó como poner límites en el selector y en la validación: SOAT y revisión técnico-mecánica entre mañana y un año; licencia entre mañana y 10, 5 o 1 años según la edad del conductor; fecha de nacimiento entre 18 y 100 años. Centralizó las reglas en `documentRules.js` y mostró el rango permitido sobre cada campo.
- Qué se usó / modificó / descartó:
  - Usado tal cual: `src/config/documentRules.js`, `src/utils/dates.js` y los cambios en validadores y pantallas.
  - Corregido durante la revisión: el texto "1 años" para conductores mayores de 80 años.
- Archivos y commit: `src/config/documentRules.js`, `src/utils/dates.js`, `src/utils/validators.js`, `src/components/DateField.js`, `src/app/register/personal.js`, `src/app/register/documents.js` — commit fb01fce (mismo commit de la entrada #2, porque los cambios tocaban los mismos archivos)
- Verificación: Claude probó casos límite (SOAT a 2 años, licencia a 11 años para un conductor de 30, licencia a 6 años para uno de 65, revisión vencida, conductor de 17 y de 101 años) y validó imports y sintaxis antes del commit. [CONFIRMAR qué se probó en Expo Go.]
- Aprendizaje: [Escribir con mis palabras. Ideas: validar en dos niveles (selector y validación), y centralizar reglas de negocio en un archivo de configuración.]

---


