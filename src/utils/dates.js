// AI-assisted: see docs/AI_LOG.md #3
// Utilidades de fechas (sin librerías externas)

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const addYears = (date, years) => new Date(date.getFullYear() + years, date.getMonth(), date.getDate());

export const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const tomorrow = () => addDays(new Date(), 1);

export function getAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export const formatDate = (date) => date.toLocaleDateString('es-CO');

// AI-assisted: see docs/AI_LOG.md #7
// Semana de lunes a domingo
export function startOfWeek(date = new Date()) {
  const day = (date.getDay() + 6) % 7; // lunes = 0
  return addDays(startOfDay(date), -day);
}

export const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const formatDateTime = (date) =>
  `${date.toLocaleDateString('es-CO')} ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

// Convierte un Timestamp de Firestore (o Date) a Date
export const toDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : null);
