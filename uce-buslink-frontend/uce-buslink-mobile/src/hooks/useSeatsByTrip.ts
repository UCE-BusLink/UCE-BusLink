import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { fetchSeatsByTrip } from '../services/seatService';
import type { ApiSeat } from '../types';

interface UseSeatsByTripResult {
  apiSeats: ApiSeat[];
  loading: boolean;
  error: string | null;
}

export function useSeatsByTrip(tripId: string | undefined): UseSeatsByTripResult {
  const { getToken } = useAuth();
  const [apiSeats, setApiSeats] = useState<ApiSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tripId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');
        const data = await fetchSeatsByTrip(token, tripId);
        if (!cancelled) setApiSeats(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar asientos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, tripId]);

  return { apiSeats, loading, error };
}
