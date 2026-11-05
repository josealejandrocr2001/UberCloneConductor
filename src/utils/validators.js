// AI-assisted: see docs/AI_LOG.md #1
// Funciones puras: cada una devuelve el mensaje de error o null si el valor es válido
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === '';

export const required = (value, message = 'Este campo es obligatorio') => (isEmpty(value) ? message : null);

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export function validateFullName(value) {
  if (isEmpty(value)) return 'El nombre es obligatorio';
  if (value.trim().length > 50) return 'Máximo 50 caracteres';
  if (!NAME_REGEX.test(value.trim())) return 'Solo se permiten letras y espacios';
  return null;
}

export function validateDocument(value) {
  if (isEmpty(value)) return 'El documento es obligatorio';
  if (!/^\d{6,10}$/.test(value)) return 'Debe tener entre 6 y 10 dígitos';
  return null;
}

export function validatePhone(value) {
  if (isEmpty(value)) return 'El celular es obligatorio';
  if (!/^\d{10}$/.test(value)) return 'Debe tener exactamente 10 dígitos';
  return null;
}

export function validateEmail(value) {
  if (isEmpty(value)) return 'El correo es obligatorio';
  if (!EMAIL_REGEX.test(value.trim())) return 'Correo inválido (ej: nombre@dominio.com)';
  return null;
}

export function validatePassword(value) {
  if (isEmpty(value)) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'Mínimo 6 caracteres';
  return null;
}

export function validateBirthDate(date) {
  if (!date) return 'La fecha de nacimiento es obligatoria';
  const adultDate = new Date(date.getFullYear() + 18, date.getMonth(), date.getDate());
  if (adultDate > new Date()) return 'Debes ser mayor de 18 años';
  return null;
}

export function validatePlate(value) {
  if (isEmpty(value)) return 'La placa es obligatoria';
  if (!PLATE_REGEX.test(value.trim().toUpperCase())) return 'Formato inválido (ej: ABC123)';
  return null;
}

export function validateShortText(value, label, max = 30) {
  if (isEmpty(value)) return `${label} es obligatorio`;
  if (value.trim().length > max) return `Máximo ${max} caracteres`;
  return null;
}

export function validateYear(value) {
  if (isEmpty(value)) return 'El año es obligatorio';
  if (!/^\d{4}$/.test(value)) return 'Debe tener 4 dígitos';
  if (Number(value) > new Date().getFullYear()) return 'No puede ser mayor al año actual';
  return null;
}

export function validateCapacity(value, category) {
  if (isEmpty(value)) return 'La capacidad es obligatoria';
  if (!/^\d+$/.test(value) || Number(value) < 1) return 'Debe ser un número mayor a 0';
  if (category === 'xl' && Number(value) < 6) return 'La categoría XL exige mínimo 6 pasajeros';
  return null;
}

export const validatePersonal = (data) => ({
  photo: required(data.photo, 'La foto de perfil es obligatoria'),
  fullName: validateFullName(data.fullName),
  document: validateDocument(data.document),
  phone: validatePhone(data.phone),
  birthDate: validateBirthDate(data.birthDate),
  gender: required(data.gender, 'Selecciona un género'),
  email: validateEmail(data.email),
  password: validatePassword(data.password),
  confirmPassword:
    required(data.confirmPassword, 'Confirma tu contraseña') ??
    (data.confirmPassword !== data.password ? 'Las contraseñas no coinciden' : null),
  language: required(data.language, 'Selecciona un idioma'),
});

export const validateVehicle = (data) => ({
  category: required(data.category, 'Selecciona una categoría'),
  plate: validatePlate(data.plate),
  brand: validateShortText(data.brand, 'La marca'),
  model: validateShortText(data.model, 'El modelo'),
  year: validateYear(data.year),
  color: required(data.color, 'Selecciona un color'),
  capacity: validateCapacity(data.capacity, data.category),
  photo: required(data.photo, 'La foto del vehículo es obligatoria'),
});
