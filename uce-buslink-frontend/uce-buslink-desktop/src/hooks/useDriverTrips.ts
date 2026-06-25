import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTrips } from '../services/driverService';
import type { ApiDriverTrip } from '../types';

export function useDriverTrips() {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<ApiDriverTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) return;
        const data = await fetchDriverTrips(token);
        if (!cancelled) setTrips(data);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los viajes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken]);

  return { trips, loading, error };
}
