import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripById } from '../services/tripService';
import type { ApiTrip } from '../types';

interface UseTripByIdResult {
  trip: ApiTrip | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useTripById(id: string | undefined): UseTripByIdResult {
  const { getToken } = useAuth();
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');
        const data = await fetchTripById(token, id);
        if (!cancelled) setTrip(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error al cargar el viaje';
        if (message.startsWith('404')) setNotFound(true);
        else setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, id]);

  return { trip, loading, error, notFound };
}
