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
