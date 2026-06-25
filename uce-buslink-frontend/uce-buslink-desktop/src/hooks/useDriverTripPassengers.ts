import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripPassengers } from '../services/driverService';
import type { DriverPassenger } from '../types';

export function useDriverTripPassengers(tripId: string) {
  const { getToken } = useAuth();
  const [passengers, setPassengers] = useState<DriverPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      const data = await fetchTripPassengers(token, tripId);
      setPassengers(data);
    } catch {
      setError('No se pudieron cargar los pasajeros.');
    } finally {
      setLoading(false);
    }
  }, [getToken, tripId]);

  useEffect(() => {
    load();
  }, [load]);

  return { passengers, loading, error, refetch: load };
}
