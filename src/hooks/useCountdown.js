// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useRef, useState } from 'react';

/** Temporizador regresivo. Llama onExpire una sola vez al llegar a cero. */
export function useCountdown(seconds, onExpire, running = true) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return undefined;
    const startedAt = Date.now();
    let expired = false;
    const interval = setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(left);
      if (left === 0 && !expired) {
        expired = true;
        clearInterval(interval);
        onExpireRef.current?.();
      }
    }, 250);
    return () => clearInterval(interval); // limpieza del temporizador
  }, [seconds, running]);

  return remaining;
}
