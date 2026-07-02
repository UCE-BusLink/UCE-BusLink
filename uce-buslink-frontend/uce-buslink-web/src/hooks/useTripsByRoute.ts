import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripsByRoute } from '../services/tripService';
import type { ApiTrip } from '../types';

interface UseTripsByRouteResult {
  trips: ApiTrip[];
  loading: boolean;
  error: string | null;
}

export function useTripsByRoute(routeId: string | undefined): UseTripsByRouteResult {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!routeId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');
        const data = await fetchTripsByRoute(token, routeId);
        if (!cancelled) setTrips(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar viajes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, routeId]);

  return { trips, loading, error };
}
