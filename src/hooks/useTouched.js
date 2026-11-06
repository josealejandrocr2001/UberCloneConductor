// AI-assisted: see docs/AI_LOG.md #1
import { useCallback, useState } from 'react';

// Muestra el error de un campo solo si ya fue tocado o si el usuario intentó avanzar
export function useTouched() {
  const [touched, setTouched] = useState({});
  const [showAll, setShowAll] = useState(false);

  const touch = useCallback((field) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const visibleError = (errors, field) => (showAll || touched[field] ? errors[field] : null);
  const revealAll = () => setShowAll(true);

  return { touch, visibleError, revealAll };
}
