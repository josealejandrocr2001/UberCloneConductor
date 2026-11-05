// AI-assisted: see docs/AI_LOG.md #1
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { hasErrors, validatePersonal, validateVehicle } from '../utils/validators';

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

export function RegistrationProvider({ children }) {
  const [personal, setPersonal] = useState(INITIAL_PERSONAL);
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE);

  const updatePersonal = useCallback((field, value) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateVehicle = useCallback((field, value) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
  }, []);

  // useMemo: los errores solo se recalculan cuando cambian los datos
  const personalErrors = useMemo(() => validatePersonal(personal), [personal]);
  const vehicleErrors = useMemo(() => validateVehicle(vehicle), [vehicle]);

  const value = useMemo(
    () => ({
      personal,
      vehicle,
      updatePersonal,
      updateVehicle,
      personalErrors,
      vehicleErrors,
      isPersonalValid: !hasErrors(personalErrors),
      isVehicleValid: !hasErrors(vehicleErrors),
    }),
    [personal, vehicle, updatePersonal, updateVehicle, personalErrors, vehicleErrors],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export const useRegistration = () => useContext(RegistrationContext);
