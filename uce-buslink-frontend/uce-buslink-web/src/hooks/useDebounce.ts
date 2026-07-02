import { useEffect, useState } from 'react';

/**
 * Devuelve el valor recibido después de `delay` ms sin cambios.
 * HU-243 — buscador de rutas con debounce de 300ms.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
