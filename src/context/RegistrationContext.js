// AI-assisted: see docs/AI_LOG.md #1
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { hasErrors, validateDocuments, validatePersonal, validateVehicle } from '../utils/validators';

// Estado compartido por las 3 pestañas del registro
const RegistrationContext = createContext(null);

const INITIAL_PERSONAL = {
  photo: null,
  fullName: '',
  document: '',
  phone: '',
  birthDate: null,
  gender: '',
  email: '',
  password: '',
  confirmPassword: '',
  language: 'es',
};

const INITIAL_VEHICLE = {
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  photo: null,
};

const INITIAL_DOCUMENTS = {
  licenseNumber: '',
  licensePhoto: null,
  licenseExpiry: null,
  soatPhoto: null,
  soatExpiry: null,
  techReviewPhoto: null,
  techReviewExpiry: null,
  mercadoPagoEmail: '',
  acceptedTerms: false,
};

export function RegistrationProvider({ children }) {
  const [personal, setPersonal] = useState(INITIAL_PERSONAL);
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);

  const updatePersonal = useCallback((field, value) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateVehicle = useCallback((field, value) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDocuments = useCallback((field, value) => {
    setDocuments((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetRegistration = useCallback(() => {
    setPersonal(INITIAL_PERSONAL);
    setVehicle(INITIAL_VEHICLE);
    setDocuments(INITIAL_DOCUMENTS);
  }, []);

  // useMemo: los errores solo se recalculan cuando cambian los datos
  const personalErrors = useMemo(() => validatePersonal(personal), [personal]);
  const vehicleErrors = useMemo(() => validateVehicle(vehicle), [vehicle]);
  // La revisión técnico-mecánica depende del año del vehículo (pestaña 2)
  // La vigencia máxima de la licencia depende de la edad (pestaña 1)
  const documentsErrors = useMemo(
    () => validateDocuments(documents, vehicle.year, personal.birthDate),
    [documents, vehicle.year, personal.birthDate],
  );

  const value = useMemo(
    () => ({
      personal,
      vehicle,
      documents,
      updatePersonal,
      updateVehicle,
      updateDocuments,
      resetRegistration,
      personalErrors,
      vehicleErrors,
      documentsErrors,
      isPersonalValid: !hasErrors(personalErrors),
      isVehicleValid: !hasErrors(vehicleErrors),
      isDocumentsValid: !hasErrors(documentsErrors),
    }),
    [
      personal,
      vehicle,
      documents,
      updatePersonal,
      updateVehicle,
      updateDocuments,
      resetRegistration,
      personalErrors,
      vehicleErrors,
      documentsErrors,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export const useRegistration = () => useContext(RegistrationContext);
