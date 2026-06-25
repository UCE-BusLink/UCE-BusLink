import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripPassengers } from '../services/driverService';
import type { DriverPassenger } from '../types';

export function useDriverTripPassengers(tripId: string) {
  const { getToken } = useAuth();
  const [passengers, setPassengers] = useState<DriverPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const data = await fetchTripPassengers(token, tripId);
        if (!cancelled) setPassengers(data);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los pasajeros.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, tripId, tick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { passengers, loading, error, refetch };
}
