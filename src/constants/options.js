// AI-assisted: see docs/AI_LOG.md #1
export const GENDERS = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Otro', value: 'other' },
  { label: 'Prefiero no decirlo', value: 'undisclosed' },
];

export const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

// Mismas categorías que elige el pasajero
export const CATEGORIES = [
  { label: 'Económico', value: 'economy' },
  { label: 'XL', value: 'xl' },
  { label: 'Premium', value: 'premium' },
];

export const VEHICLE_COLORS = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Otro'].map(
  (color) => ({ label: color, value: color.toLowerCase() }),
);
