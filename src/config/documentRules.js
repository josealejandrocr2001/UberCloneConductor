// AI-assisted: see docs/AI_LOG.md #3
// Reglas de vigencia de documentos en Colombia (Código Nacional de Tránsito, Ley 769 de 2002 y sus reformas)
import { addYears, getAge } from '../utils/dates';

export const DOCUMENT_RULES = {
  minDriverAge: 18,
  maxDriverAge: 100, // límite razonable para la fecha de nacimiento
  soatValidityYears: 1, // el SOAT se expide por 1 año
  techReviewValidityYears: 1, // la revisión técnico-mecánica se renueva cada año
  techReviewExemptYears: 5, // vehículo particular nuevo: primera revisión a los 5 años
};

// Licencia de servicio particular: 10 años (< 60 años de edad), 5 años (60 a 80) y 1 año (> 80)
export function getLicenseValidityYears(birthDate) {
  if (!birthDate) return 10;
  const age = getAge(birthDate);
  if (age < 60) return 10;
  if (age <= 80) return 5;
  return 1;
}

// Fecha máxima de vencimiento permitida para cada documento (contada desde hoy)
export const getMaxExpiryDates = (birthDate, today = new Date()) => ({
  license: addYears(today, getLicenseValidityYears(birthDate)),
  soat: addYears(today, DOCUMENT_RULES.soatValidityYears),
  techReview: addYears(today, DOCUMENT_RULES.techReviewValidityYears),
});
